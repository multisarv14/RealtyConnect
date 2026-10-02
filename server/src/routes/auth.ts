import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Router, type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { ROLE_DIRECTORY_CATEGORY, SELF_SERVICE_ROLES, passwordPolicyError } from '../../../shared/roles';
import { config } from '../config';
import { asyncHandler, HttpError, permissionsFor, requireAuth, signAccessToken } from '../middleware/auth';
import { Notification, Organization, RefreshToken, User, type UserDoc } from '../models';
import { auditRequest } from '../services/audit';
import { getConfigNumber, isMaintenanceMode } from '../services/configs';

const REFRESH_COOKIE = 'rc_refresh';
const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: config.isProduction,
  path: '/api/v1/auth',
};

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

async function buildSession(user: UserDoc, activeRole: string) {
  const org = await Organization.findById(user.orgId).lean();
  return {
    id: user.id as string,
    email: user.email,
    name: user.name,
    role: activeRole,
    roles: user.roles,
    permissions: await permissionsFor(activeRole),
    orgId: String(user.orgId),
    organizationName: org?.name ?? '',
    subscriptionPlan: org?.subscriptionPlan ?? 'Standard Free',
    reraRegistration: org?.reraRegistration ?? 'N/A',
  };
}

/** Issues an access token plus a rotating refresh cookie for the chosen identity (Rule AUTH-06). */
async function issueSession(res: Response, user: UserDoc, activeRole: string) {
  const refreshToken = crypto.randomBytes(48).toString('hex');
  await RefreshToken.create({
    tokenHash: hashToken(refreshToken),
    userId: user._id,
    activeRole,
    expiresAt: new Date(Date.now() + config.refreshTokenTtlSeconds * 1000),
  });
  res.cookie(REFRESH_COOKIE, refreshToken, { ...cookieOptions, maxAge: config.refreshTokenTtlSeconds * 1000 });
  return {
    accessToken: signAccessToken({ userId: user.id, email: user.email, role: activeRole, orgId: String(user.orgId) }),
    expiresIn: config.accessTokenTtlSeconds,
    session: await buildSession(user, activeRole),
  };
}

async function revokeCurrentRefreshToken(req: Request) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) await RefreshToken.deleteOne({ tokenHash: hashToken(token) });
}

const credentialLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 50, standardHeaders: true, legacyHeaders: false });

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(1).max(200),
  role: z.string().max(50).optional(),
});

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().max(200),
  name: z.string().trim().max(120).optional(),
  organizationName: z.string().trim().min(2).max(160),
  role: z.string().max(50),
  city: z.string().trim().max(80).optional(),
  state: z.string().trim().max(80).optional(),
  reraRegistration: z.string().trim().max(60).optional(),
});

// Compared against when the email is unknown, so response time does not reveal which accounts exist.
const DUMMY_HASH = bcrypt.hashSync('unknown-account-placeholder', 10);

export const authRouter = Router();

authRouter.post(
  '/login',
  credentialLimiter,
  asyncHandler(async (req, res) => {
    const { email, password, role } = loginSchema.parse(req.body);
    const user = await User.findOne({ email });

    if (!user) {
      await bcrypt.compare(password, DUMMY_HASH);
      await auditRequest(req, 'AUTH_LOGIN_FAILED', 'users', email, 'FAILURE', 'Login attempt with non-existent system identity.', { userId: email, userRole: 'ANONYMOUS' });
      throw new HttpError(401, 'Invalid credentials.');
    }
    const actor = { userId: user.email, userRole: user.roles[0] };

    if (user.lockoutUntil && user.lockoutUntil.getTime() > Date.now()) {
      await auditRequest(req, 'AUTH_LOCKED_OUT_ATTEMPT', 'users', email, 'FAILURE', `Blocked login attempt: account locked until ${user.lockoutUntil.toISOString()}.`, actor);
      throw new HttpError(403, 'Account is locked due to consecutive brute-force failures.', { lockoutUntil: user.lockoutUntil.toISOString() });
    }

    if (!(await bcrypt.compare(password, user.passwordHash))) {
      const threshold = await getConfigNumber('BRUTE_FORCE_THRESHOLD', 5);
      const inWindow = user.firstFailedAt && Date.now() - user.firstFailedAt.getTime() < config.failedLoginWindowMs;
      const attempts = (inWindow ? user.failedAttempts : 0) + 1;

      if (attempts >= threshold) {
        user.lockoutUntil = new Date(Date.now() + config.lockoutMs);
        user.failedAttempts = 0;
        user.firstFailedAt = null;
        await user.save();
        await Notification.create({
          type: 'in_app',
          recipient: user.email,
          content: `SECURITY WARNING: ${threshold} failed login attempts detected. Your RealtyConnect profile is locked for 30 minutes.`,
          status: 'sent',
          createdBy: 'SYSTEM',
          orgId: user.orgId,
        });
        await auditRequest(req, 'SECURITY_BRUTE_FORCE_LOCKOUT', 'users', email, 'FAILURE', `Rule AUTH-02 triggered: locked account ${email} for 30 minutes after ${threshold} consecutive failures.`, actor);
        throw new HttpError(403, 'Account is locked due to consecutive brute-force failures.', { lockoutUntil: user.lockoutUntil.toISOString() });
      }

      user.failedAttempts = attempts;
      if (!inWindow) user.firstFailedAt = new Date();
      await user.save();
      await auditRequest(req, 'AUTH_LOGIN_FAILED', 'users', email, 'FAILURE', `Incorrect credentials. Attempt ${attempts}/${threshold} before lockout.`, actor);
      throw new HttpError(401, 'Invalid credentials.', { attemptsRemaining: threshold - attempts });
    }

    if (user.status !== 'ACTIVE') {
      throw new HttpError(403, 'This account is not active.');
    }
    if ((await isMaintenanceMode()) && !user.roles.includes('ADMIN')) {
      await auditRequest(req, 'AUTH_LOGIN_FAILED', 'users', email, 'WARNING', 'User login aborted: system-wide Maintenance Mode active.', actor);
      throw new HttpError(503, 'System Maintenance Mode is enabled. Access is restricted to administrators.');
    }

    const activeRole = role && user.roles.includes(role) ? role : user.roles[0];
    user.failedAttempts = 0;
    user.firstFailedAt = null;
    user.lockoutUntil = null;
    user.lastLoginAt = new Date();
    await user.save();

    // Signing in over an existing session (e.g. switching accounts) retires the old one.
    await revokeCurrentRefreshToken(req);
    await auditRequest(req, 'AUTH_LOGIN_SUCCESS', 'users', email, 'SUCCESS', `Authenticated with roles [${user.roles.join(', ')}]. Active identity: ${activeRole}.`, { userId: user.email, userRole: activeRole });
    res.json(await issueSession(res, user, activeRole));
  })
);

authRouter.post(
  '/register',
  credentialLimiter,
  asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body);
    const policyError = passwordPolicyError(input.password);
    if (policyError) throw new HttpError(400, policyError);
    if (!SELF_SERVICE_ROLES.includes(input.role)) {
      throw new HttpError(400, 'This role cannot be self-registered.');
    }
    if (await User.exists({ email: input.email })) {
      throw new HttpError(409, 'An account with this email already exists.');
    }

    // Every registration creates its own organization. Joining an existing one must go
    // through an invitation, otherwise anyone could claim a company name and read its data.
    const org = await Organization.create({
      name: input.organizationName,
      reraRegistration: input.reraRegistration || 'N/A',
      city: input.city || '',
      state: input.state || '',
      ...ROLE_DIRECTORY_CATEGORY[input.role],
    });
    const user = await User.create({
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, 12),
      name: input.name || input.organizationName,
      roles: [input.role],
      orgId: org._id,
    });

    await revokeCurrentRefreshToken(req);
    await auditRequest(req, 'USER_REGISTERED', 'users', user.email, 'SUCCESS', `Registered ${input.role} account for organization "${org.name}".`, { userId: user.email, userRole: input.role });
    res.status(201).json(await issueSession(res, user, input.role));
  })
);

authRouter.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const token = req.cookies?.[REFRESH_COOKIE];
    // A first-time visitor has nothing to refresh; that is not an error.
    if (!token) return res.status(204).end();
    const stored = await RefreshToken.findOneAndDelete({ tokenHash: hashToken(token) });
    const user = stored && stored.expiresAt.getTime() > Date.now() ? await User.findById(stored.userId) : null;
    if (!stored || !user || user.status !== 'ACTIVE' || !user.roles.includes(stored.activeRole)) {
      res.clearCookie(REFRESH_COOKIE, cookieOptions);
      throw new HttpError(401, 'No active session.');
    }
    res.json(await issueSession(res, user, stored.activeRole));
  })
);

authRouter.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const token = req.cookies?.[REFRESH_COOKIE];
    const stored = token ? await RefreshToken.findOneAndDelete({ tokenHash: hashToken(token) }) : null;
    res.clearCookie(REFRESH_COOKIE, cookieOptions);
    if (stored) {
      const user = await User.findById(stored.userId).lean();
      if (user) {
        await auditRequest(req, 'AUTH_LOGOUT', 'users', user.email, 'SUCCESS', 'User initiated logout procedure.', { userId: user.email, userRole: stored.activeRole });
      }
    }
    res.json({ success: true, message: 'Session destroyed successfully.' });
  })
);

authRouter.post(
  '/switch-role',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { role } = z.object({ role: z.string().max(50) }).parse(req.body);
    const user = await User.findById(req.auth!.userId);
    if (!user || !user.roles.includes(role)) {
      throw new HttpError(403, 'This identity is not assigned to your account.');
    }
    await revokeCurrentRefreshToken(req);
    await auditRequest(req, 'AUTH_ROLE_IDENTITY_SWITCH', 'user_roles', user.email, 'SUCCESS', `Rule AUTH-06: switched active session context to "${role}".`);
    res.json(await issueSession(res, user, role));
  })
);

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.auth!.userId);
    if (!user) throw new HttpError(401, 'Session expired or invalid.');
    res.json({ session: await buildSession(user, req.auth!.role) });
  })
);
