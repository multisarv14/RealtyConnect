import 'dotenv/config';
import crypto from 'node:crypto';
import path from 'node:path';

const isProduction = process.env.NODE_ENV === 'production';

function secret(name: string): string {
  const value = process.env[name];
  if (value) return value;
  if (isProduction) {
    throw new Error(`${name} must be set when NODE_ENV=production`);
  }
  console.warn(`[config] ${name} is not set; using a random value (sessions reset on every restart).`);
  return crypto.randomBytes(48).toString('hex');
}

function flag(name: string, fallback: boolean): boolean {
  const value = process.env[name];
  if (value === undefined || value === '') return fallback;
  return value === 'true' || value === '1';
}

export const config = {
  isProduction,
  port: parseInt(process.env.PORT || '4000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/realtyconnect',
  jwtAccessSecret: secret('JWT_ACCESS_SECRET'),
  // Rule AUTH-03: 15 minute access tokens, 12 hour refresh tokens.
  accessTokenTtlSeconds: 15 * 60,
  refreshTokenTtlSeconds: 12 * 60 * 60,
  // Rule AUTH-02: failures inside this window count towards a 30 minute lockout.
  failedLoginWindowMs: 10 * 60 * 1000,
  lockoutMs: 30 * 60 * 1000,
  // Demo personas are convenient locally and dangerous in production, so they are opt-in there.
  seedDemoUsers: flag('SEED_DEMO_USERS', !isProduction),
  demoPassword: process.env.DEMO_PASSWORD || 'RealtyConnect@2026',
  // First administrator, created at startup if the account does not exist yet.
  adminEmail: (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD || '',
  uploadDir: path.resolve(process.env.UPLOAD_DIR || 'server/uploads'),
  clientDist: path.resolve(process.env.CLIENT_DIST || 'dist'),
  trustProxy: flag('TRUST_PROXY', isProduction),
};
