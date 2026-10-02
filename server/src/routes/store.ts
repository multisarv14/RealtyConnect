import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { STORE_KEYS, type StoreKeyDef } from '../../../shared/storeKeys';
import { asyncHandler, type AuthContext, HttpError, requireAuth } from '../middleware/auth';
import { KEY_FEATURE } from '../../../shared/plans';
import { StoreEntry } from '../models';
import { validateItem } from '../services/rules';
import { planOf } from '../services/plans';

const MAX_ITEMS_PER_PATCH = 5000;

function ownerFor(def: StoreKeyDef, auth: AuthContext): string {
  if (def.scope === 'public') return 'public';
  return def.scope === 'org' ? `org:${auth.orgId}` : `user:${auth.userId}`;
}

const listCollection = (name: string) => mongoose.connection.collection(name);

/** Each list item is found by (_owner, id); call once at startup. */
export async function ensureStoreIndexes() {
  const collections = new Set(Object.values(STORE_KEYS).flatMap(def => (def.kind === 'list' ? [def.collection] : [])));
  await Promise.all([...collections].map(name => listCollection(name).createIndex({ _owner: 1, id: 1 }, { unique: true })));
}

// Bookkeeping fields live beside the item's own fields, prefixed with "_" so they can never collide.
function stripMeta(doc: Record<string, unknown>) {
  const item: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(doc)) {
    if (!k.startsWith('_')) item[k] = v;
  }
  return item;
}

/** Operator-looking keys have no business in workspace data; refuse them rather than store them. */
function assertSafeKeys(value: unknown, depth = 0): void {
  if (depth > 40) throw new HttpError(400, 'Value is nested too deeply.');
  if (Array.isArray(value)) {
    value.forEach(v => assertSafeKeys(v, depth + 1));
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if (k.startsWith('$') || k.includes('\0')) throw new HttpError(400, `Unsupported field name "${k}".`);
      assertSafeKeys(v, depth + 1);
    }
  }
}

const idSchema = z.union([z.string().min(1).max(200), z.number()]);
const patchSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('value'), value: z.unknown() }),
  z.object({
    type: z.literal('list'),
    upsert: z.array(z.object({ id: idSchema }).passthrough()).max(MAX_ITEMS_PER_PATCH),
    remove: z.array(idSchema).max(MAX_ITEMS_PER_PATCH),
    order: z.array(idSchema).max(MAX_ITEMS_PER_PATCH).optional(),
  }),
  z.object({ type: z.literal('clear') }),
]);

export const storeRouter = Router();
storeRouter.use(requireAuth);

/** Everything the signed-in user can see, in one round trip: { key: value }. Unset keys are absent. */
storeRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const auth = req.auth!;
    // ?keys=a,b limits the read to those keys (used for live refresh).
    const wanted = typeof req.query.keys === 'string' && req.query.keys ? req.query.keys.split(',').slice(0, 60) : null;
    const entries = await StoreEntry.find({
      owner: { $in: ['public', `org:${auth.orgId}`, `user:${auth.userId}`] },
      ...(wanted ? { key: { $in: wanted } } : {}),
    }).lean();
    const values: Record<string, unknown> = {};
    await Promise.all(
      entries.map(async entry => {
        const def = STORE_KEYS[entry.key];
        if (!def || ownerFor(def, auth) !== entry.owner) return;
        if (entry.kind === 'value' || def.kind !== 'list') {
          values[entry.key] = entry.value;
        } else {
          const docs = await listCollection(def.collection).find({ _owner: entry.owner }).sort({ _pos: 1, _id: 1 }).toArray();
          values[entry.key] = docs.map(stripMeta);
        }
      })
    );
    res.json({ values });
  })
);

storeRouter.patch(
  '/:key',
  asyncHandler(async (req, res) => {
    const auth = req.auth!;
    const key = req.params.key;
    const def = STORE_KEYS[key];
    if (!def) throw new HttpError(404, 'Unknown workspace key.');
    const patch = patchSchema.parse(req.body);
    const owner = ownerFor(def, auth);
    const isPlatformAdmin = auth.role === 'ADMIN';

    // View-only accounts can read their company's data but not change it (personal preferences are fine).
    if (def.scope !== 'user' && auth.orgRole === 'VIEWER') throw new HttpError(403, 'View-only accounts cannot make changes.');

    // The plan decides which modules are writable and how much can be created.
    if (def.scope !== 'user' && !isPlatformAdmin && patch.type !== 'clear') {
      const plan = await planOf(auth.orgId);
      const feature = KEY_FEATURE[key];
      if (feature && !plan.features.includes(feature)) throw new HttpError(402, `The ${plan.name} plan does not include this module. Upgrade your plan to use it.`);
      if (patch.type === 'list' && patch.upsert.length > 0 && def.kind === 'list') {
        const c = listCollection(def.collection);
        const existingIds = new Set((await c.find({ _owner: owner, id: { $in: patch.upsert.map(i => i.id) } }).project({ id: 1 }).toArray()).map(d => d.id));
        const added = patch.upsert.filter(i => !existingIds.has(i.id)).length;
        if (added > 0 && key === 'realtyconnect_marketplace_listings' && plan.limits.listings >= 0) {
          const have = await c.countDocuments({ _owner: owner, _orgId: auth.orgId });
          if (have + added > plan.limits.listings) throw new HttpError(402, `The ${plan.name} plan allows ${plan.limits.listings} marketplace listings. Upgrade your plan to publish more.`);
        }
        if (added > 0 && key === 'realtyconnect_rfq_list' && plan.limits.rfqsPerMonth >= 0) {
          const monthStart = new Date();
          monthStart.setUTCDate(1);
          monthStart.setUTCHours(0, 0, 0, 0);
          const have = await c.countDocuments({ _owner: owner, _orgId: auth.orgId, _createdAt: { $gte: monthStart } });
          if (have + added > plan.limits.rfqsPerMonth) throw new HttpError(402, `The ${plan.name} plan allows ${plan.limits.rfqsPerMonth} new RFQs a month. Upgrade your plan to publish more.`);
        }
      }
    }

    if (patch.type === 'clear') {
      if (def.scope === 'public' && !isPlatformAdmin) throw new HttpError(403, 'Only administrators can clear a platform-wide dataset.');
      if (def.kind === 'list') await listCollection(def.collection).deleteMany({ _owner: owner });
      await StoreEntry.deleteOne({ key, owner });
      return res.json({ success: true });
    }

    if (patch.type === 'value') {
      assertSafeKeys(patch.value);
      if (def.scope === 'public' && !isPlatformAdmin) throw new HttpError(403, 'Platform-wide datasets can only be changed item by item.');
      // A list key can fall back to a whole value if its items stop having unique ids; the value then wins.
      if (def.kind === 'list') await listCollection(def.collection).deleteMany({ _owner: owner });
      await StoreEntry.updateOne({ key, owner }, { $set: { kind: 'value', value: patch.value ?? null, updatedBy: auth.email } }, { upsert: true });
      return res.json({ success: true });
    }

    if (def.kind !== 'list') throw new HttpError(400, 'This key does not hold a list.');
    assertSafeKeys(patch.upsert);
    for (const item of patch.upsert) {
      const problem = validateItem(key, item);
      if (problem) throw new HttpError(422, problem, { itemId: item.id });
    }
    const coll = listCollection(def.collection);
    const now = new Date();

    // On platform-wide lists an organization may only change items it published itself.
    if (def.scope === 'public' && !isPlatformAdmin && patch.upsert.length > 0) {
      const foreign = await coll.find({ _owner: owner, id: { $in: patch.upsert.map(i => i.id) }, _orgId: { $ne: auth.orgId } }).project({ id: 1 }).toArray();
      if (foreign.length > 0) throw new HttpError(403, `Item "${foreign[0].id}" belongs to another company.`);
    }

    if (patch.upsert.length > 0) {
      const base = await coll.countDocuments({ _owner: owner });
      await coll.bulkWrite(
        patch.upsert.map((raw, i) => ({
          updateOne: {
            filter: { _owner: owner, id: raw.id },
            // Replace the item's own fields wholesale (so removed fields really disappear)
            // while carrying the bookkeeping fields over from the existing document.
            update: [
              {
                $replaceWith: {
                  $mergeObjects: [
                    { $literal: stripMeta(raw) },
                    {
                      _id: '$_id',
                      _owner: owner,
                      _pos: { $ifNull: ['$_pos', base + i] },
                      _orgId: { $ifNull: ['$_orgId', auth.orgId] },
                      _createdBy: { $ifNull: ['$_createdBy', auth.email] },
                      _createdAt: { $ifNull: ['$_createdAt', now] },
                      _updatedBy: auth.email,
                      _updatedAt: now,
                    },
                  ],
                },
              },
            ],
            upsert: true,
          },
        })),
        { ordered: false }
      );
    }

    let skipped = 0;
    if (patch.remove.length > 0) {
      // In platform-wide datasets an organization may only withdraw what it published itself.
      const filter: Record<string, unknown> = { _owner: owner, id: { $in: patch.remove } };
      if (def.scope === 'public' && !isPlatformAdmin) filter._orgId = auth.orgId;
      const result = await coll.deleteMany(filter);
      skipped = patch.remove.length - result.deletedCount;
    }

    if (patch.order && patch.order.length > 0) {
      await coll.bulkWrite(
        patch.order.map((id, i) => ({ updateOne: { filter: { _owner: owner, id }, update: { $set: { _pos: i } } } })),
        { ordered: false }
      );
    }

    await StoreEntry.updateOne({ key, owner }, { $set: { kind: 'list', value: null, updatedBy: auth.email } }, { upsert: true });
    res.json({ success: true, skipped });
  })
);
