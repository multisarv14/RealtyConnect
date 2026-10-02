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
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || 'RealtyConnect <no-reply@realtyconnect.local>',
  },
  // Where messages from the public contact form are emailed (they are always stored for the review queue).
  supportEmail: process.env.SUPPORT_EMAIL || '',
  paymentInstructions: process.env.PAYMENT_INSTRUCTIONS || 'Pay by bank transfer or UPI to the account our team shares with you, quoting the invoice number. Your plan is activated as soon as the payment is confirmed.',
  razorpay: { keyId: process.env.RAZORPAY_KEY_ID || '', keySecret: process.env.RAZORPAY_KEY_SECRET || '' },
  // ClamAV daemon for upload scanning (host:port). Without it uploads are not virus scanned.
  clamav: { host: process.env.CLAMAV_HOST || '', port: parseInt(process.env.CLAMAV_PORT || '3310', 10) },
  // Sign-in and sign-up attempts allowed per IP per 15 minutes. Development is looser so automated tests can run.
  authRateLimit: parseInt(process.env.AUTH_RATE_LIMIT || (isProduction ? '50' : '1000'), 10),
};
