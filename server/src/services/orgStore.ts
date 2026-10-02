import mongoose from 'mongoose';
import { STORE_KEYS } from '../../../shared/storeKeys';
import { Notification, StoreEntry, UploadedFile, User } from '../models';
import { sendEmail } from './mailer';

/**
 * Server-side access to an organization's workspace lists (leads, conversations, ...),
 * used to deliver records from one company to another. Only org-scoped list keys qualify.
 */

function listDef(key: string) {
  const def = STORE_KEYS[key];
  if (!def || def.kind !== 'list' || def.scope !== 'org') throw new Error(`"${key}" is not an organization list`);
  return def;
}

const coll = (key: string) => mongoose.connection.collection(listDef(key).collection);
const ownerOf = (orgId: string) => `org:${orgId}`;

export async function findItem<T = Record<string, any>>(key: string, orgId: string, id: string): Promise<T | null> {
  const doc = await coll(key).findOne({ _owner: ownerOf(orgId), id });
  return doc ? (stripMeta(doc) as T) : null;
}

/** Inserts or replaces one item in the organization's list, placing new items first. */
export async function putItem(key: string, orgId: string, item: Record<string, any> & { id: string }, actor = 'system') {
  const owner = ownerOf(orgId);
  const c = coll(key);
  const now = new Date();
  const existing = await c.findOne({ _owner: owner, id: item.id });
  if (existing) {
    await c.replaceOne({ _id: existing._id }, { ...item, _id: existing._id, _owner: owner, _pos: existing._pos, _orgId: orgId, _createdBy: existing._createdBy, _createdAt: existing._createdAt, _updatedBy: actor, _updatedAt: now });
  } else {
    // New items go to the top of the list, which is how the modules show newest first.
    const first = await c.find({ _owner: owner }).sort({ _pos: 1 }).limit(1).next();
    const pos = (first?._pos ?? 0) - 1;
    await c.insertOne({ ...item, _owner: owner, _pos: pos, _orgId: orgId, _createdBy: actor, _createdAt: now, _updatedBy: actor, _updatedAt: now });
  }
  await StoreEntry.updateOne({ key, owner }, { $set: { kind: 'list', value: null, updatedBy: actor } }, { upsert: true });
}

export async function removeItem(key: string, orgId: string, id: string) {
  await coll(key).deleteOne({ _owner: ownerOf(orgId), id });
}

/** Shows the notification in the company's bell and emails its owner and administrators (when mail is configured). */
export async function notifyOrg(orgId: string, content: string, createdBy = 'SYSTEM', email = true) {
  await Notification.create({ type: 'in_app', recipient: 'organization', content, status: 'sent', createdBy, orgId });
  if (!email) return;
  const admins = await User.find({ orgId, status: 'ACTIVE', orgRole: { $in: ['OWNER', 'ADMIN'] } }).select('email').lean();
  // Fire and forget: a mail outage must never fail the action that raised the notification.
  for (const a of admins) void sendEmail(a.email, 'RealtyConnect notification', `${content}\n\nOpen RealtyConnect to respond.`);
}

function stripMeta(doc: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(doc)) if (!k.startsWith('_')) out[k] = v;
  return out;
}

/** Lets the recipient company open a file that the sender attached to a message or quotation. */
export async function shareFile(fileId: string | undefined, ownerOrgId: string, withOrgId: string) {
  if (!fileId || !/^[0-9a-f]{24}$/.test(fileId)) return;
  await UploadedFile.updateOne({ _id: fileId, orgId: ownerOrgId }, { $addToSet: { sharedWith: withOrgId } });
}
