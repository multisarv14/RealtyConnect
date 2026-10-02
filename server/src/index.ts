import mongoose from 'mongoose';
import { createApp } from './app';
import { config } from './config';
import { resumeQuarantine } from './routes/files';
import { ensureStoreIndexes } from './routes/store';
import { seedDatabase } from './services/seed';

async function main() {
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 8000 });
  console.log(`[db] connected to ${mongoose.connection.host}/${mongoose.connection.name}`);

  await seedDatabase();
  await ensureStoreIndexes();
  await resumeQuarantine();

  const server = createApp().listen(config.port, () => {
    console.log(`[api] RealtyConnect API listening on port ${config.port}`);
  });

  const shutdown = () => {
    server.close(() => {
      mongoose.disconnect().finally(() => process.exit(0));
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch(err => {
  console.error('[api] failed to start', err);
  process.exit(1);
});
