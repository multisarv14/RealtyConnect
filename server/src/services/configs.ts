import { SystemConfig } from '../models';

export async function getConfigValue(key: string, fallback: string): Promise<string> {
  const doc = await SystemConfig.findOne({ key }).lean();
  return doc?.value ?? fallback;
}

export async function getConfigNumber(key: string, fallback: number): Promise<number> {
  const parsed = parseInt(await getConfigValue(key, String(fallback)), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function isMaintenanceMode(): Promise<boolean> {
  return (await getConfigValue('MAINTENANCE_MODE', 'false')) === 'true';
}
