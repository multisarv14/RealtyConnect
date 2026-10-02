import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import { config } from '../config';
import { asyncHandler, hasPermission, HttpError, requireAuth, requireOrgRole } from '../middleware/auth';
import { UploadedFile } from '../models';
import { auditRequest } from '../services/audit';
import { getConfigNumber } from '../services/configs';
import { planOf } from '../services/plans';
import mongoose from 'mongoose';

// Rule FILE-01: whitelist, verified against the file's leading bytes rather than the client's claim.
const ALLOWED_TYPES = [
  { mime: 'application/pdf', extensions: ['pdf'], magic: [0x25, 0x50, 0x44, 0x46] },
  { mime: 'image/png', extensions: ['png'], magic: [0x89, 0x50, 0x4e, 0x47] },
  { mime: 'image/jpeg', extensions: ['jpg', 'jpeg'], magic: [0xff, 0xd8, 0xff] },
];

function detectType(filename: string, buffer: Buffer) {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  return ALLOWED_TYPES.find(t => t.extensions.includes(extension) && t.magic.every((byte, i) => buffer[i] === byte));
}

const toClientFile = (f: { _id: unknown; name: string; sizeBytes: number; mimeType: string; status: string; md5: string; createdAt?: Date }) => ({
  id: String(f._id),
  name: f.name,
  size: f.sizeBytes,
  type: f.mimeType,
  status: f.status,
  url: `/api/v1/files/${f._id}/download`,
  uploadedAt: (f.createdAt ?? new Date()).toISOString().replace('T', ' ').slice(0, 16),
  md5: f.md5,
});

/**
 * Rule FILE-03 placeholder. No antivirus engine is integrated yet: files that passed the
 * type and size gates are released after a short quarantine. Replace this with a real
 * scanner (e.g. ClamAV) before accepting uploads from untrusted users.
 */
export function releaseFromQuarantine(fileId: unknown, delayMs = 2000) {
  setTimeout(() => {
    UploadedFile.updateOne({ _id: fileId, status: 'scanning' }, { status: 'success' }).catch(err =>
      console.error('[files] failed to release file from quarantine', err)
    );
  }, delayMs);
}

/** Files left in quarantine by a restart would otherwise stay there forever. */
export async function resumeQuarantine() {
  const pending = await UploadedFile.find({ status: 'scanning' }).select('_id').lean();
  pending.forEach(f => releaseFromQuarantine(f._id, 0));
}

async function findAccessible(req: Parameters<typeof hasPermission>[0], id: string) {
  const file = await UploadedFile.findById(id).catch(() => null);
  if (!file) throw new HttpError(404, 'File not found.');
  const sameOrg = String(file.orgId) === req.auth!.orgId;
  const shared = file.visibility === 'network' || (file.sharedWith || []).some(id => String(id) === req.auth!.orgId);
  if (!sameOrg && !shared && !((await hasPermission(req, 'VIEW_ALL_FILES')) || (await hasPermission(req, 'VERIFY_PROFILES')))) throw new HttpError(404, 'File not found.');
  return file;
}

export const filesRouter = Router();
filesRouter.use(requireAuth);

filesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const filter = ((await hasPermission(req, 'VIEW_ALL_FILES')) || (await hasPermission(req, 'VERIFY_PROFILES'))) ? {} : { orgId: req.auth!.orgId };
    res.json((await UploadedFile.find(filter).sort({ createdAt: -1 }).limit(200).lean()).map(toClientFile));
  })
);

filesRouter.post(
  '/',
  ...requireOrgRole('MEMBER'),
  asyncHandler(async (req, res) => {
    // Rule FILE-02: the ceiling is a runtime setting, so the parser is built per request.
    const maxMb = await getConfigNumber('MAX_UPLOAD_SIZE_MB', 10);
    const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: maxMb * 1024 * 1024, files: 1 } }).single('file');
    await new Promise<void>((resolve, reject) => {
      upload(req, res, err => {
        if (!err) return resolve();
        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
          return reject(new HttpError(413, `File exceeds the active platform limit of ${maxMb}MB.`));
        }
        reject(new HttpError(400, 'Malformed upload.'));
      });
    });
    if (!req.file) throw new HttpError(400, 'No file provided.');

    // Browsers send the filename as latin1 bytes; recover UTF-8 and drop any path components.
    const name = path.basename(Buffer.from(req.file.originalname, 'latin1').toString('utf8')).slice(0, 255);
    const type = detectType(name, req.file.buffer);
    if (!type) {
      await auditRequest(req, 'SECURITY_FILE_REJECTED_UNSUPPORTED_TYPE', 'uploaded_files', name, 'FAILURE', 'File upload rejected: content is not a valid PDF, PNG or JPEG.');
      throw new HttpError(415, 'Unsupported file type. Only PDF, PNG and JPEG documents are permitted (Rule FILE-01).');
    }

    // The plan's storage allowance covers everything the company has uploaded.
    const plan = await planOf(req.auth!.orgId);
    const used = await UploadedFile.aggregate([{ $match: { orgId: new mongoose.Types.ObjectId(req.auth!.orgId) } }, { $group: { _id: null, bytes: { $sum: '$sizeBytes' } } }]);
    if ((used[0]?.bytes ?? 0) + req.file.size > plan.limits.storageMb * 1024 * 1024) {
      throw new HttpError(402, `The ${plan.name} plan includes ${plan.limits.storageMb >= 1024 ? `${plan.limits.storageMb / 1024} GB` : `${plan.limits.storageMb} MB`} of storage, and it is full. Delete files or upgrade your plan.`);
    }

    await fs.mkdir(config.uploadDir, { recursive: true });
    const storagePath = path.join(config.uploadDir, crypto.randomUUID());
    await fs.writeFile(storagePath, req.file.buffer);

    const file = await UploadedFile.create({
      name,
      sizeBytes: req.file.size,
      mimeType: type.mime,
      status: 'scanning',
      storagePath,
      md5: crypto.createHash('md5').update(req.file.buffer).digest('hex'),
      uploaderId: req.auth!.userId,
      uploaderEmail: req.auth!.email,
      orgId: req.auth!.orgId,
    });
    await auditRequest(req, 'FILE_UPLOAD_INITIATED', 'uploaded_files', file.id, 'WARNING', `Registry entry created in SCANNING quarantine for "${name}".`);
    releaseFromQuarantine(file._id);
    res.status(202).json(toClientFile(file));
  })
);

filesRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json(toClientFile(await findAccessible(req, req.params.id)));
  })
);

filesRouter.get(
  '/:id/download',
  asyncHandler(async (req, res) => {
    const file = await findAccessible(req, req.params.id);
    if (file.status !== 'success') throw new HttpError(409, 'File has not been cleared for download.');
    res.type(file.mimeType);
    res.download(file.storagePath, file.name);
  })
);

// Make a file you own readable by every signed-in company (RFQ and tender attachments).
filesRouter.post(
  '/:id/publish',
  ...requireOrgRole('MEMBER'),
  asyncHandler(async (req, res) => {
    const file = await findAccessible(req, req.params.id);
    if (String(file.orgId) !== req.auth!.orgId) throw new HttpError(403, 'Only the owning organization can publish this file.');
    file.visibility = 'network';
    await file.save();
    res.json(toClientFile(file));
  })
);

filesRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const file = await findAccessible(req, req.params.id);
    if (String(file.orgId) !== req.auth!.orgId) throw new HttpError(403, 'Only the owning organization can delete this file.');
    await file.deleteOne();
    await fs.rm(file.storagePath, { force: true });
    await auditRequest(req, 'FILE_REGISTRY_RECORD_REMOVED', 'uploaded_files', file.id, 'SUCCESS', `Removed file registry pointer and stored bytes for "${file.name}".`);
    res.json({ success: true });
  })
);
