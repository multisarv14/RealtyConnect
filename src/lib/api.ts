/**
 * HTTP client for the RealtyConnect API.
 *
 * The access token lives only in memory; the refresh token is an httpOnly
 * cookie the browser sends to /api/v1/auth. A 401 triggers one silent
 * refresh-and-retry before the session is declared expired.
 */

const BASE = '/api/v1';

export interface Session {
  id: string;
  email: string;
  name: string;
  role: string;
  roles: string[];
  permissions: string[];
  orgId: string;
  organizationName: string;
  subscriptionPlan: string;
  reraRegistration: string;
  verified: boolean;
  category: string;
  orgRole: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  plan: { id: string; name: string; features: string[]; limits: { users: number; storageMb: number; listings: number; rfqsPerMonth: number } };
}

export interface DemoAccount {
  title: string;
  email: string;
  role: string;
  org: string;
  plan: string;
  rera: string;
  view: string;
}

export interface AuthMeta {
  selfServiceRoles: string[];
  demoMode: boolean;
  demoPassword?: string;
  demoAccounts: DemoAccount[];
}

export interface RegisterInput {
  email: string;
  password: string;
  organizationName?: string;
  role?: string;
  // Joins the inviting company instead of creating a new one.
  inviteCode?: string;
  name?: string;
  city?: string;
  reraRegistration?: string;
}

interface AuthResult {
  accessToken: string;
  expiresIn: number;
  session: Session;
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public data: Record<string, any> = {}) {
    super(message);
  }
}

let accessToken: string | null = null;
let refreshInFlight: Promise<Session | null> | null = null;
const sessionExpiredListeners = new Set<() => void>();

/** Called when the server no longer accepts our session and it could not be renewed. */
export function onSessionExpired(listener: () => void): () => void {
  sessionExpiredListeners.add(listener);
  return () => sessionExpiredListeners.delete(listener);
}

function send(path: string, init: RequestInit): Promise<Response> {
  const headers = new Headers(init.headers);
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  return fetch(BASE + path, { ...init, headers, credentials: 'same-origin' });
}

/** Exchanges the refresh cookie for a new access token. Resolves null when there is no live session. */
export function restoreSession(): Promise<Session | null> {
  if (!refreshInFlight) {
    refreshInFlight = send('/auth/refresh', { method: 'POST' })
      .then(async res => {
        if (!res.ok || res.status === 204) {
          accessToken = null;
          return null;
        }
        const result = (await res.json()) as AuthResult;
        accessToken = result.accessToken;
        return result.session;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

/** fetch() with the bearer token attached and one transparent retry after a token refresh. */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const hadToken = accessToken !== null;
  let res = await send(path, init);
  if (res.status === 401 && hadToken) {
    if (await restoreSession()) {
      res = await send(path, init);
    } else {
      sessionExpiredListeners.forEach(listener => listener());
    }
  }
  return res;
}

export async function api<T = any>(method: string, path: string, body?: unknown, init: RequestInit = {}): Promise<T> {
  const res = await apiFetch(path, {
    ...init,
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data?.error || `Request failed (${res.status}).`, data);
  return data as T;
}

async function authenticate(path: string, body: unknown): Promise<Session> {
  const result = await api<AuthResult>('POST', path, body);
  accessToken = result.accessToken;
  return result.session;
}

export const login = (email: string, password: string, role?: string) => authenticate('/auth/login', { email, password, role });
export const register = (input: RegisterInput) => authenticate('/auth/register', input);
export const switchRole = (role: string) => authenticate('/auth/switch-role', { role });

export async function logout(): Promise<void> {
  try {
    await send('/auth/logout', { method: 'POST' });
  } finally {
    accessToken = null;
  }
}

/** Human-readable text for any thrown value, for toasts. */
export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.data.lockoutUntil) {
      const minutes = Math.max(1, Math.ceil((new Date(err.data.lockoutUntil).getTime() - Date.now()) / 60000));
      return `${err.message} Try again in about ${minutes} minute${minutes === 1 ? '' : 's'}.`;
    }
    if (typeof err.data.attemptsRemaining === 'number') {
      return `${err.message} ${err.data.attemptsRemaining} attempt(s) left before the account locks.`;
    }
    return err.message;
  }
  return 'Could not reach the server. Check your connection and try again.';
}
