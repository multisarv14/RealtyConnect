import crypto from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, HttpError, requireAuth, requireOrgRole } from '../middleware/auth';
import { AuditLog, Invite, Organization, RefreshToken, User } from '../models';
import { auditRequest, toClientLog } from '../services/audit';
import { sendEmail } from '../services/mailer';
import { seatLimitFor } from '../services/plans';

export const teamRouter = Router();
teamRouter.use(requireAuth);

const INVITE_DAYS = 7;
const hash = (value: string) => crypto.createHash('sha256').update(value).digest('hex');

const toMember = (u: any) => ({
  id: String(u._id),
  name: u.name,
  email: u.email,
  orgRole: u.orgRole || 'OWNER',
  stakeholderRoles: u.roles,
  status: u.status,
  lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
});

teamRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const [members, invites, org] = await Promise.all([
      User.find({ orgId: req.auth!.orgId }).sort({ createdAt: 1 }).lean(),
      Invite.find({ orgId: req.auth!.orgId }).sort({ createdAt: -1 }).lean(),
      Organization.findById(req.auth!.orgId).lean(),
    ]);
    const seatLimit = seatLimitFor(org?.subscriptionPlan);
    res.json({
      members: members.map(toMember),
      invites: invites.map(i => ({ id: String(i._id), email: i.email, name: i.name, orgRole: i.orgRole, invitedBy: i.invitedBy, createdAt: (i as any).createdAt, expiresAt: i.expiresAt })),
      seatLimit,
      seatsUsed: members.filter(m => m.status === 'ACTIVE').length + invites.length,
    });
  })
);

teamRouter.post(
  '/invites',
  ...requireOrgRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const input = z
      .object({ email: z.string().trim().toLowerCase().email().max(255), name: z.string().trim().max(120).default(''), orgRole: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).default('MEMBER') })
      .parse(req.body);
    if (input.orgRole === 'ADMIN' && req.auth!.orgRole !== 'OWNER') throw new HttpError(403, 'Only the company owner can invite another administrator.');
    if (await User.exists({ email: input.email })) throw new HttpError(409, 'That email already has an account.');

    const org = await Organization.findById(req.auth!.orgId);
    if (!org) throw new HttpError(404, 'Company not found.');
    const [active, pending] = await Promise.all([User.countDocuments({ orgId: org._id, status: 'ACTIVE' }), Invite.countDocuments({ orgId: org._id })]);
    const limit = seatLimitFor(org.subscriptionPlan);
    if (active + pending >= limit) throw new HttpError(402, `Your plan includes ${limit} user${limit === 1 ? '' : 's'}. Upgrade the plan to invite more people.`);

    await Invite.deleteMany({ orgId: org._id, email: input.email });
    const code = crypto.randomBytes(18).toString('base64url');
    const invite = await Invite.create({
      orgId: org._id,
      email: input.email,
      name: input.name,
      orgRole: input.orgRole,
      stakeholderRole: req.auth!.role,
      codeHash: hash(code),
      invitedBy: req.auth!.email,
      expiresAt: new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000),
    });

    const link = `${req.headers.origin || ''}/?invite=${encodeURIComponent(code)}&email=${encodeURIComponent(input.email)}`;
    const emailed = await sendEmail(
      input.email,
      `${org.name} invited you to RealtyConnect`,
      `${req.auth!.email} invited you to join ${org.name} on RealtyConnect as ${input.orgRole.toLowerCase()}.\n\nOpen this link to create your account (valid ${INVITE_DAYS} days):\n${link}\n`
    );
    await auditRequest(req, 'TEAM_INVITE_CREATED', 'invites', invite.id, 'SUCCESS', `Invited ${input.email} as ${input.orgRole}.`);
    // The code is shown to the inviter once so it can be shared when email delivery is not configured.
    res.status(201).json({ id: invite.id, email: input.email, orgRole: input.orgRole, code, link, emailed });
  })
);

teamRouter.delete(
  '/invites/:id',
  ...requireOrgRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const result = await Invite.deleteOne({ _id: req.params.id, orgId: req.auth!.orgId }).catch(() => ({ deletedCount: 0 }));
    if (!result.deletedCount) throw new HttpError(404, 'Invitation not found.');
    res.json({ success: true });
  })
);

teamRouter.patch(
  '/members/:id',
  ...requireOrgRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const input = z.object({ orgRole: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).optional(), status: z.enum(['ACTIVE', 'INACTIVE']).optional() }).parse(req.body);
    const member = await User.findOne({ _id: req.params.id, orgId: req.auth!.orgId }).catch(() => null);
    if (!member) throw new HttpError(404, 'Team member not found.');
    if (member.id === req.auth!.userId) throw new HttpError(400, 'You cannot change your own access.');
    if ((member.orgRole || 'OWNER') === 'OWNER') throw new HttpError(403, 'The company owner cannot be changed.');
    if ((member.orgRole === 'ADMIN' || input.orgRole === 'ADMIN') && req.auth!.orgRole !== 'OWNER') throw new HttpError(403, 'Only the company owner can manage administrators.');

    const changes: string[] = [];
    if (input.orgRole && input.orgRole !== member.orgRole) {
      changes.push(`role ${member.orgRole} -> ${input.orgRole}`);
      member.orgRole = input.orgRole;
    }
    if (input.status && input.status !== member.status) {
      if (input.status === 'ACTIVE') {
        const org = await Organization.findById(req.auth!.orgId).lean();
        const active = await User.countDocuments({ orgId: req.auth!.orgId, status: 'ACTIVE' });
        if (active >= seatLimitFor(org?.subscriptionPlan)) throw new HttpError(402, 'No free seats on your plan.');
      }
      changes.push(`status ${member.status} -> ${input.status}`);
      member.status = input.status;
      if (input.status === 'INACTIVE') await RefreshToken.deleteMany({ userId: member._id });
    }
    await member.save();
    await auditRequest(req, 'TEAM_MEMBER_UPDATED', 'users', member.email, 'WARNING', `Changed ${member.email}: ${changes.join(', ') || 'no change'}.`);
    res.json(toMember(member));
  })
);

// ---------- Sessions ----------

teamRouter.get(
  '/sessions',
  ...requireOrgRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const users = await User.find({ orgId: req.auth!.orgId }).select('_id email name').lean();
    const byId = new Map(users.map(u => [String(u._id), u]));
    const tokens = await RefreshToken.find({ userId: { $in: users.map(u => u._id) } }).sort({ lastUsedAt: -1 }).lean();
    res.json(
      tokens.map(t => ({
        id: String(t._id),
        email: byId.get(String(t.userId))?.email ?? '',
        name: byId.get(String(t.userId))?.name ?? '',
        role: t.activeRole,
        ip: t.ip,
        device: t.userAgent,
        signedInAt: t.sessionStart,
        lastActiveAt: t.lastUsedAt,
        current: false,
      }))
    );
  })
);

teamRouter.delete(
  '/sessions/:id',
  ...requireOrgRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const token = await RefreshToken.findById(req.params.id).catch(() => null);
    const owner = token && (await User.findOne({ _id: token.userId, orgId: req.auth!.orgId }).lean());
    if (!token || !owner) throw new HttpError(404, 'Session not found.');
    await token.deleteOne();
    await auditRequest(req, 'SESSION_REVOKED', 'sessions', owner.email, 'WARNING', `Ended a session of ${owner.email}.`);
    res.json({ success: true });
  })
);

// ---------- Activity ----------

teamRouter.get(
  '/activity',
  ...requireOrgRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const emails = (await User.find({ orgId: req.auth!.orgId }).select('email').lean()).map(u => u.email);
    const logs = await AuditLog.find({ userId: { $in: emails } }).sort({ seq: -1 }).limit(300).lean();
    res.json(logs.map(toClientLog));
  })
);
