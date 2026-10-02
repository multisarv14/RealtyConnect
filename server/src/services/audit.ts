import crypto from 'node:crypto';
import type { Request } from 'express';
import { AuditLog } from '../models';

export interface AuditInput {
  userId: string;
  userRole: string;
  action: string;
  entity: string;
  entityId: string;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING';
  details: string;
  ipAddress: string;
}

const GENESIS_HASH = '0'.repeat(64);

function blockHash(prevHash: string, seq: number, timestamp: Date, e: AuditInput): string {
  const payload = [prevHash, seq, timestamp.toISOString(), e.userId, e.userRole, e.action, e.entity, e.entityId, e.status, e.details].join(':');
  return crypto.createHash('sha256').update(payload).digest('hex');
}

async function appendOnce(entry: AuditInput) {
  const last = await AuditLog.findOne().sort({ seq: -1 }).lean();
  const seq = (last?.seq ?? 10000) + 1;
  const prevHash = last?.chainHash ?? GENESIS_HASH;
  const timestamp = new Date();
  return AuditLog.create({ ...entry, seq, timestamp, prevHash, chainHash: blockHash(prevHash, seq, timestamp, entry) });
}

// Appends are serialised in-process so each block links to the true predecessor.
// The unique index on `seq` catches a second server instance racing us; we retry on that.
let tail: Promise<unknown> = Promise.resolve();

/** Rule LOG-02: append a record chained to the previous one with SHA-256. */
export function appendAudit(entry: AuditInput) {
  const run = async () => {
    for (let attempt = 0; ; attempt++) {
      try {
        return await appendOnce(entry);
      } catch (err: any) {
        if (err?.code !== 11000 || attempt >= 5) throw err;
      }
    }
  };
  const result = tail.then(run, run);
  tail = result.catch(() => undefined);
  return result;
}

/** Audit helper for request handlers; never lets a logging failure break the request. */
export function auditRequest(
  req: Request,
  action: string,
  entity: string,
  entityId: string,
  status: AuditInput['status'],
  details: string,
  actor?: { userId: string; userRole: string }
) {
  return appendAudit({
    userId: actor?.userId ?? req.auth?.email ?? 'ANONYMOUS',
    userRole: actor?.userRole ?? req.auth?.role ?? 'ANONYMOUS',
    action,
    entity,
    entityId,
    status,
    details,
    ipAddress: req.ip || 'unknown',
  }).catch(err => {
    console.error('[audit] failed to append record', err);
    return null;
  });
}

/** Recomputes the whole chain and reports the first record that does not match. */
export async function verifyChain() {
  let prevHash = GENESIS_HASH;
  let checked = 0;
  for await (const log of AuditLog.find().sort({ seq: 1 }).lean().cursor()) {
    const expected = blockHash(prevHash, log.seq, log.timestamp, log as AuditInput);
    if (log.prevHash !== prevHash || log.chainHash !== expected) {
      return { valid: false, checked, brokenAt: `L-${log.seq}` };
    }
    prevHash = log.chainHash;
    checked++;
  }
  return { valid: true, checked, brokenAt: null };
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

/** Shape expected by the React audit console. */
export function toClientLog(log: { seq: number; timestamp: Date; userId: string; userRole: string; action: string; entity: string; entityId: string; status: string; details: string; ipAddress: string; chainHash: string }) {
  const t = log.timestamp;
  return {
    id: `L-${log.seq}`,
    timestamp: `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())} ${pad(t.getUTCHours())}:${pad(t.getUTCMinutes())}:${pad(t.getUTCSeconds())}`,
    userId: log.userId,
    userRole: log.userRole,
    action: log.action,
    entity: log.entity,
    entityId: log.entityId,
    status: log.status,
    details: log.details,
    ipAddress: log.ipAddress,
    chainHash: log.chainHash,
  };
}
