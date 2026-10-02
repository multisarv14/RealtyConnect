import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { SELF_SERVICE_ROLES } from '../../../shared/roles';
import { config } from '../config';
import { asyncHandler, hasPermission, HttpError, invalidatePermissionCache, requireAuth, requirePermission } from '../middleware/auth';
import { AuditLog, Master, MasterCategory, Notification, Role, SystemConfig } from '../models';
import { appendAudit, auditRequest, toClientLog, verifyChain } from '../services/audit';
import { DEMO_ACCOUNTS } from '../services/seed';
import { emailConfigured, sendEmail } from '../services/mailer';

export const platformRouter = Router();

// ---------- Meta ----------

platformRouter.get('/meta', (_req, res) => {
  res.json({
    selfServiceRoles: SELF_SERVICE_ROLES,
    demoMode: config.seedDemoUsers,
    // Only exposed while demo personas are seeded (never by default in production).
    demoPassword: config.seedDemoUsers ? config.demoPassword : undefined,
    demoAccounts: config.seedDemoUsers ? DEMO_ACCOUNTS.map(({ title, email, roles, org, plan, rera, view }) => ({ title, email, role: roles[0], org, plan, rera, view })) : [],
  });
});

// ---------- Roles & permissions ----------

platformRouter.get(
  '/roles',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const roles = await Role.find().sort({ code: 1 }).lean();
    res.json(roles.map(r => ({ code: r.code, name: r.name, permissions: r.permissions, isSystem: r.isSystem })));
  })
);

platformRouter.put(
  '/roles/:code/permissions',
  ...requirePermission('MANAGE_ROLES'),
  asyncHandler(async (req, res) => {
    const { permissions } = z.object({ permissions: z.array(z.string().max(100)).max(200) }).parse(req.body);
    const role = await Role.findOne({ code: req.params.code });
    if (!role) throw new HttpError(404, 'Role not found.');
    if (role.code === 'ADMIN' && !permissions.includes('MANAGE_ROLES')) {
      throw new HttpError(409, 'The ADMIN role must keep MANAGE_ROLES, otherwise nobody could manage access again.');
    }
    const before = role.permissions;
    role.permissions = [...new Set(permissions)];
    await role.save();
    invalidatePermissionCache();
    const added = role.permissions.filter(p => !before.includes(p));
    const removed = before.filter(p => !role.permissions.includes(p));
    await auditRequest(req, 'RBAC_PERMISSION_UPDATED', 'role_permissions', role.code, 'WARNING', `Redefined privileges for role "${role.code}". Granted: [${added.join(', ')}]. Revoked: [${removed.join(', ')}].`);
    res.json({ code: role.code, name: role.name, permissions: role.permissions, isSystem: role.isSystem });
  })
);

// ---------- System configuration ----------

const toClientConfig = (c: { key: string; value: string; description: string; type: string; category: string }) => ({
  key: c.key,
  value: c.value,
  description: c.description,
  type: c.type,
  category: c.category,
});

platformRouter.get(
  '/configs',
  asyncHandler(async (_req, res) => {
    res.json((await SystemConfig.find().sort({ _id: 1 }).lean()).map(toClientConfig));
  })
);

platformRouter.put(
  '/configs/:key',
  ...requirePermission('MANAGE_SYSTEM_CONFIGS'),
  asyncHandler(async (req, res) => {
    const { value } = z.object({ value: z.string().max(500) }).parse(req.body);
    const cfg = await SystemConfig.findOne({ key: req.params.key });
    if (!cfg) throw new HttpError(404, 'Configuration key not found.');
    if (cfg.type === 'boolean' && value !== 'true' && value !== 'false') throw new HttpError(400, 'Value must be "true" or "false".');
    if (cfg.type === 'number' && !/^\d+$/.test(value)) throw new HttpError(400, 'Value must be a non-negative integer.');
    const previous = cfg.value;
    cfg.value = value;
    await cfg.save();
    await auditRequest(req, 'GLOBAL_CONFIGURATION_UPDATED', 'system_configs', cfg.key, 'SUCCESS', `Modified global variable "${cfg.key}" value from "${previous}" to "${value}".`);
    res.json(toClientConfig(cfg));
  })
);

// ---------- Common masters ----------

platformRouter.get(
  '/masters',
  asyncHandler(async (_req, res) => {
    const [categories, items] = await Promise.all([MasterCategory.find().sort({ order: 1 }).lean(), Master.find().sort({ _id: 1 }).lean()]);
    res.json(
      categories.map(cat => ({
        key: cat.key,
        name: cat.name,
        description: cat.description,
        items: items.filter(i => i.category === cat.key).map(i => ({ id: String(i._id), code: i.code, name: i.name, isSystem: i.isSystem })),
      }))
    );
  })
);

platformRouter.post(
  '/masters',
  ...requirePermission('MANAGE_COMMON_MASTERS'),
  asyncHandler(async (req, res) => {
    const input = z.object({ category: z.string().max(50), code: z.string().trim().min(1).max(50), name: z.string().trim().min(1).max(255) }).parse(req.body);
    if (!(await MasterCategory.exists({ key: input.category }))) throw new HttpError(404, 'Master category not found.');
    const code = input.code.toUpperCase().replace(/\s+/g, '_');
    if (await Master.exists({ category: input.category, code })) {
      throw new HttpError(409, 'A master entry with this identifier code already exists in this registry.');
    }
    const item = await Master.create({ category: input.category, code, name: input.name, isSystem: false });
    await auditRequest(req, 'MASTER_DATA_ENTRY_CREATED', 'common_masters', item.id, 'SUCCESS', `Created lookup entry "${item.name}" [Code: ${item.code}] in registry category "${input.category}".`);
    res.status(201).json({ id: item.id, code: item.code, name: item.name, isSystem: false });
  })
);

platformRouter.delete(
  '/masters/:id',
  ...requirePermission('MANAGE_COMMON_MASTERS'),
  asyncHandler(async (req, res) => {
    const item = await Master.findById(req.params.id).catch(() => null);
    if (!item) throw new HttpError(404, 'Master entry not found.');
    if (item.isSystem) {
      await auditRequest(req, 'MASTER_DATA_ALTERATION_REJECTED', 'common_masters', item.id, 'WARNING', `Aborted deletion of master entry: "${item.code}" is a locked System Master value.`);
      throw new HttpError(409, 'This master entry is a Core System Master and cannot be deleted.');
    }
    await item.deleteOne();
    await auditRequest(req, 'MASTER_DATA_ENTRY_DELETED', 'common_masters', item.id, 'SUCCESS', `Deleted lookup entry "${item.name}" [Code: ${item.code}] from registry category "${item.category}".`);
    res.json({ success: true });
  })
);

// ---------- Audit trail ----------

const auditWriteLimiter = rateLimit({ windowMs: 60 * 1000, limit: 600, standardHeaders: true, legacyHeaders: false });

platformRouter.get(
  '/audit-logs',
  ...requirePermission('VIEW_AUDIT_LOGS'),
  asyncHandler(async (req, res) => {
    const limit = Math.min(parseInt(String(req.query.limit || '500'), 10) || 500, 2000);
    const logs = await AuditLog.find().sort({ seq: -1 }).limit(limit).lean();
    res.json(logs.map(toClientLog));
  })
);

platformRouter.get(
  '/audit-logs/verify',
  ...requirePermission('VIEW_AUDIT_LOGS'),
  asyncHandler(async (_req, res) => {
    res.json(await verifyChain());
  })
);

// Activity events raised by the UI. The actor, role and IP always come from the session, never the body.
platformRouter.post(
  '/audit-logs',
  auditWriteLimiter,
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = z
      .object({
        action: z.string().min(1).max(100),
        entity: z.string().min(1).max(50),
        entityId: z.string().min(1).max(200),
        status: z.enum(['SUCCESS', 'FAILURE', 'WARNING']),
        details: z.string().max(2000),
      })
      .parse(req.body);
    const log = await appendAudit({
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      status: input.status,
      details: input.details,
      userId: req.auth!.email,
      userRole: req.auth!.role,
      ipAddress: req.ip || 'unknown',
    });
    res.status(201).json(toClientLog(log));
  })
);

// ---------- Notifications ----------

const toClientNotification = (n: { _id: unknown; type: string; recipient: string; content: string; status: string; createdAt?: Date }) => ({
  id: String(n._id),
  type: n.type,
  recipient: n.recipient,
  content: n.content,
  status: n.status,
  timestamp: (n.createdAt ?? new Date()).toISOString().replace('T', ' ').slice(0, 16),
});

platformRouter.get(
  '/notifications',
  requireAuth,
  asyncHandler(async (req, res) => {
    const filter = (await hasPermission(req, 'MANAGE_USERS')) ? {} : { orgId: req.auth!.orgId };
    const items = await Notification.find(filter).sort({ createdAt: -1 }).limit(200).lean();
    res.json(items.map(toClientNotification));
  })
);

platformRouter.post(
  '/notifications',
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = z
      .object({ type: z.enum(['email', 'sms', 'push', 'in_app']), recipient: z.string().trim().min(1).max(255), content: z.string().trim().min(1).max(2000) })
      .parse(req.body);
    // In-app notifications are delivered by being stored. Email is sent when an SMTP server is configured.
    // SMS and push have no provider yet, so they stay "queued"; claiming "sent" would be untrue.
    let status: 'sent' | 'failed' | 'queued' = input.type === 'in_app' ? 'sent' : 'queued';
    if (input.type === 'email' && emailConfigured()) status = (await sendEmail(input.recipient, 'RealtyConnect', input.content)) ? 'sent' : 'failed';
    const item = await Notification.create({ ...input, status, createdBy: req.auth!.email, orgId: req.auth!.orgId });
    res.status(201).json(toClientNotification(item));
  })
);
