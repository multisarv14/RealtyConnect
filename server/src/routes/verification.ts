import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, HttpError, requireOrgRole, requirePermission } from '../middleware/auth';
import { Organization, UploadedFile, Verification } from '../models';
import { auditRequest } from '../services/audit';
import { notifyOrg } from '../services/orgStore';
import { validateCin, validateGstin, validatePan } from '../services/idChecks';

/**
 * Company verification. The company submits its tax and registration numbers with supporting
 * documents; platform staff with VERIFY_PROFILES review them. Only an approval sets `verified`.
 * The numbers are checked for correct format and check digits, but they are not looked up in
 * government registries - the reviewer compares them with the uploaded documents.
 */

export const verificationRouter = Router();

const REQUIRED_DOCS = ['GST registration certificate', 'PAN card', 'Certificate of incorporation or business registration'];
const RERA_CATEGORIES = ['Builders', 'Developers', 'Consultants'];

const toClient = (v: any) =>
  v && {
    status: v.status,
    gstin: v.gstin,
    pan: v.pan,
    cin: v.cin,
    reraNumber: v.reraNumber,
    documents: v.documents,
    submittedAt: v.submittedAt,
    reviewedAt: v.reviewedAt,
    note: v.note,
  };

verificationRouter.get(
  '/',
  ...requireOrgRole('MEMBER'),
  asyncHandler(async (req, res) => {
    const [record, org] = await Promise.all([Verification.findOne({ orgId: req.auth!.orgId }).lean(), Organization.findById(req.auth!.orgId).lean()]);
    res.json({
      verified: !!org?.verified,
      record: toClient(record) ?? { status: 'draft', gstin: '', pan: '', cin: '', reraNumber: '', documents: [], note: '' },
      requiredDocuments: REQUIRED_DOCS,
      reraExpected: RERA_CATEGORIES.includes(org?.category ?? ''),
    });
  })
);

const draftSchema = z.object({
  gstin: z.string().trim().toUpperCase().max(15).default(''),
  pan: z.string().trim().toUpperCase().max(10).default(''),
  cin: z.string().trim().toUpperCase().max(21).default(''),
  reraNumber: z.string().trim().max(80).default(''),
  documents: z.array(z.object({ fileId: z.string().max(40), label: z.string().trim().min(1).max(100) })).max(10).default([]),
});

async function checkDraft(orgId: string, input: z.infer<typeof draftSchema>, strict: boolean) {
  const problems: string[] = [];
  if (input.gstin) {
    const e = validateGstin(input.gstin);
    if (e) problems.push(e);
  }
  if (input.pan) {
    const e = validatePan(input.pan);
    if (e) problems.push(e);
  }
  if (input.gstin && input.pan && input.gstin.slice(2, 12) !== input.pan) problems.push('The PAN does not match the PAN inside the GSTIN.');
  if (input.cin) {
    const e = validateCin(input.cin);
    if (e) problems.push(e);
  }
  const files = await UploadedFile.find({ _id: { $in: input.documents.map(d => d.fileId).filter(id => /^[0-9a-f]{24}$/.test(id)) }, orgId }).lean();
  for (const d of input.documents) {
    const f = files.find(x => String(x._id) === d.fileId);
    if (!f) problems.push(`Document "${d.label}" was not found in your uploads.`);
    else if (f.status !== 'success') problems.push(`Document "${d.label}" has not cleared the upload checks yet.`);
  }
  if (strict) {
    if (!input.gstin) problems.push('Enter your GSTIN.');
    if (!input.pan) problems.push('Enter your PAN.');
    if (input.documents.length < 2) problems.push('Attach at least two supporting documents (GST certificate and PAN card at minimum).');
  }
  return problems;
}

verificationRouter.put(
  '/',
  ...requireOrgRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const input = draftSchema.parse(req.body);
    const existing = await Verification.findOne({ orgId: req.auth!.orgId });
    if (existing?.status === 'submitted') throw new HttpError(409, 'Your details are under review and cannot be edited now.');
    const problems = await checkDraft(req.auth!.orgId, input, false);
    if (problems.length) throw new HttpError(400, problems[0], { problems });
    const record = await Verification.findOneAndUpdate({ orgId: req.auth!.orgId }, { $set: { ...input, status: 'draft' } }, { upsert: true, new: true });
    res.json(toClient(record));
  })
);

verificationRouter.post(
  '/submit',
  ...requireOrgRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const record = await Verification.findOne({ orgId: req.auth!.orgId });
    if (!record) throw new HttpError(400, 'Save your details first.');
    if (record.status === 'submitted') throw new HttpError(409, 'Already submitted.');
    const problems = await checkDraft(req.auth!.orgId, { gstin: record.gstin, pan: record.pan, cin: record.cin, reraNumber: record.reraNumber, documents: record.documents.map(d => ({ fileId: d.fileId, label: d.label })) }, true);
    if (problems.length) throw new HttpError(400, problems[0], { problems });
    record.status = 'submitted';
    record.submittedAt = new Date();
    record.note = '';
    await record.save();
    await auditRequest(req, 'VERIFICATION_SUBMITTED', 'organizations', req.auth!.orgId, 'SUCCESS', 'Submitted company details for verification.');
    res.json(toClient(record));
  })
);

// ---------- Reviewers ----------

verificationRouter.get(
  '/admin/queue',
  ...requirePermission('VERIFY_PROFILES'),
  asyncHandler(async (_req, res) => {
    const records = await Verification.find({ status: 'submitted' }).sort({ submittedAt: 1 }).lean();
    const orgs = await Organization.find({ _id: { $in: records.map(r => r.orgId) } }).select('name category city state').lean();
    const byId = new Map(orgs.map(o => [String(o._id), o]));
    res.json(
      records.map(r => ({
        orgId: String(r.orgId),
        company: byId.get(String(r.orgId))?.name ?? '',
        category: byId.get(String(r.orgId))?.category ?? '',
        location: [byId.get(String(r.orgId))?.city, byId.get(String(r.orgId))?.state].filter(Boolean).join(', '),
        ...toClient(r),
      }))
    );
  })
);

async function decide(req: any, approve: boolean) {
  const note = z.object({ note: z.string().trim().max(500).default('') }).parse(req.body).note;
  if (!approve && note.length < 3) throw new HttpError(400, 'Tell the company what to fix.');
  const record = await Verification.findOne({ orgId: req.params.orgId, status: 'submitted' }).catch(() => null);
  const org = record && (await Organization.findById(record.orgId));
  if (!record || !org) throw new HttpError(404, 'No submission waiting for review.');
  record.status = approve ? 'approved' : 'rejected';
  record.reviewedBy = req.auth.email;
  record.reviewedAt = new Date();
  record.note = note;
  await record.save();
  if (approve) {
    org.verified = true;
    const profile = { ...((org.profile as Record<string, any>) || {}), gstin: record.gstin, pan: record.pan, registrationNumber: record.cin, reraNumber: record.reraNumber };
    org.profile = profile;
    org.markModified('profile');
    if (record.reraNumber) org.reraRegistration = record.reraNumber;
    await org.save();
  }
  await notifyOrg(org.id, approve ? 'Your company is now verified. The Verified badge appears on your profile and listings.' : `Verification needs changes: ${note}`, req.auth.email);
  await auditRequest(req, approve ? 'VERIFICATION_APPROVED' : 'VERIFICATION_REJECTED', 'organizations', org.id, approve ? 'SUCCESS' : 'WARNING', `${approve ? 'Approved' : 'Rejected'} verification of ${org.name}.${note ? ` Note: ${note}` : ''}`);
  return toClient(record);
}

verificationRouter.post('/admin/:orgId/approve', ...requirePermission('VERIFY_PROFILES'), asyncHandler(async (req, res) => res.json(await decide(req, true))));
verificationRouter.post('/admin/:orgId/reject', ...requirePermission('VERIFY_PROFILES'), asyncHandler(async (req, res) => res.json(await decide(req, false))));
