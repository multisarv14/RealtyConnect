import fs from 'node:fs';
import path from 'node:path';
import cookieParser from 'cookie-parser';
import express, { type ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { config } from './config';
import { HttpError } from './middleware/auth';
import { authRouter } from './routes/auth';
import { billingRouter } from './routes/billing';
import { companiesRouter } from './routes/companies';
import { filesRouter } from './routes/files';
import { moderationRouter } from './routes/moderation';
import { networkRouter } from './routes/network';
import { platformRouter } from './routes/platform';
import { publicRouter } from './routes/public';
import { storeRouter } from './routes/store';
import { teamRouter } from './routes/team';
import { verificationRouter } from './routes/verification';

export function createApp() {
  const app = express();
  if (config.trustProxy) app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // The SPA shell sets its own inline styles/scripts via Vite; CSP belongs to the static host config.
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(express.json({ limit: '8mb' }));
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
  });

  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/companies', companiesRouter);
  app.use('/api/v1/files', filesRouter);
  app.use('/api/v1/network', networkRouter);
  app.use('/api/v1/team', teamRouter);
  app.use('/api/v1/billing', billingRouter);
  app.use('/api/v1/verification', verificationRouter);
  app.use('/api/v1/moderation', moderationRouter);
  app.use('/api/v1/public', publicRouter);
  app.use('/api/v1/store', storeRouter);
  app.use('/api/v1', platformRouter);

  app.use('/api', (_req, res) => {
    res.status(404).json({ success: false, error: 'Not found.' });
  });

  // In production the same process serves the built React app.
  if (fs.existsSync(path.join(config.clientDist, 'index.html'))) {
    app.use(express.static(config.clientDist));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(config.clientDist, 'index.html'));
    });
  }

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ success: false, error: err.message, ...err.extra });
    }
    if (err instanceof ZodError) {
      const first = err.issues[0];
      return res.status(400).json({ success: false, error: `Invalid request: ${first.path.join('.') || 'body'} - ${first.message}` });
    }
    if (err?.type === 'entity.too.large') {
      return res.status(413).json({ success: false, error: 'Request body too large.' });
    }
    if (err?.type === 'entity.parse.failed') {
      return res.status(400).json({ success: false, error: 'Malformed JSON body.' });
    }
    console.error('[api] unhandled error', err);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  };
  app.use(errorHandler);

  return app;
}
