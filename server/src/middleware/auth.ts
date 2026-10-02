import type { NextFunction, Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { Role } from '../models';

export interface AuthContext {
  userId: string;
  email: string;
  role: string;
  orgId: string;
  orgRole: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export class HttpError extends Error {
  constructor(public status: number, message: string, public extra: Record<string, unknown> = {}) {
    super(message);
  }
}

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };

export function signAccessToken(ctx: AuthContext): string {
  return jwt.sign({ email: ctx.email, role: ctx.role, org: ctx.orgId, orr: ctx.orgRole }, config.jwtAccessSecret, {
    subject: ctx.userId,
    expiresIn: config.accessTokenTtlSeconds,
  });
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return next(new HttpError(401, 'Authentication required.'));
  try {
    const payload = jwt.verify(token, config.jwtAccessSecret) as jwt.JwtPayload;
    req.auth = { userId: String(payload.sub), email: payload.email, role: payload.role, orgId: payload.org, orgRole: payload.orr || 'OWNER' };
    next();
  } catch {
    next(new HttpError(401, 'Session expired or invalid.'));
  }
};

/** For public endpoints that show more to signed-in users: attaches req.auth when a valid token is sent. */
export const optionalAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return next();
  try {
    const payload = jwt.verify(header.slice(7), config.jwtAccessSecret) as jwt.JwtPayload;
    req.auth = { userId: String(payload.sub), email: payload.email, role: payload.role, orgId: payload.org, orgRole: payload.orr || 'OWNER' };
    next();
  } catch {
    // Answer 401 rather than silently treating the caller as anonymous, so the client renews its token and retries.
    next(new HttpError(401, 'Session expired or invalid.'));
  }
};

// Role permissions are read on every guarded request so that matrix edits apply
// to live sessions (Rule AUTH-07); a short cache keeps that from costing a query each time.
const PERMISSION_CACHE_MS = 30_000;
const permissionCache = new Map<string, { permissions: string[]; expires: number }>();

export async function permissionsFor(role: string): Promise<string[]> {
  const cached = permissionCache.get(role);
  if (cached && cached.expires > Date.now()) return cached.permissions;
  const doc = await Role.findOne({ code: role }).lean();
  const permissions = doc?.permissions ?? [];
  permissionCache.set(role, { permissions, expires: Date.now() + PERMISSION_CACHE_MS });
  return permissions;
}

export function invalidatePermissionCache() {
  permissionCache.clear();
}

export async function hasPermission(req: Request, permission: string): Promise<boolean> {
  if (!req.auth) return false;
  return (await permissionsFor(req.auth.role)).includes(permission);
}

const ORG_ROLE_RANK: Record<string, number> = { VIEWER: 0, MEMBER: 1, ADMIN: 2, OWNER: 3 };

/** The signed-in person must hold at least this role inside their company. */
export function requireOrgRole(minimum: 'MEMBER' | 'ADMIN' | 'OWNER'): RequestHandler[] {
  return [
    requireAuth,
    (req, _res, next) => {
      if ((ORG_ROLE_RANK[req.auth!.orgRole] ?? 0) < ORG_ROLE_RANK[minimum]) {
        return next(new HttpError(403, minimum === 'MEMBER' ? 'View-only accounts cannot make changes.' : `Only a company ${minimum.toLowerCase()} can do this.`));
      }
      next();
    },
  ];
}

/** Rule AUTH-05: nothing is allowed unless the active role grants it. */
export function requirePermission(permission: string): RequestHandler[] {
  return [
    requireAuth,
    asyncHandler(async (req, _res, next) => {
      if (!(await hasPermission(req, permission))) {
        throw new HttpError(403, `Access denied: ${permission} permission required.`);
      }
      next();
    }),
  ];
}
