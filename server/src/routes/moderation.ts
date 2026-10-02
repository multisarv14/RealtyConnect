import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, HttpError, requirePermission } from '../middleware/auth';
import { ContactRequest, Organization, Report } from '../models';
import { auditRequest } from '../services/audit';
import { notifyOrg } from '../services/orgStore';

export const moderationRouter = Router();

moderationRouter.get(
  '/reports',
  ...requirePermission('MANAGE_USERS'),
  asyncHandler(async (req, res) => {
    const status = req.query.status === 'all' ? {} : { status: 'open' };
    const reports = await Report.find(status).sort({ createdAt: -1 }).limit(200).lean();
    const ids = [...new Set(reports.flatMap(r => [String(r.reporterOrgId), String(r.reportedOrgId)]))];
    const orgs = await Organization.find({ _id: { $in: ids } }).select('name suspended').lean();
    const byId = new Map(orgs.map(o => [String(o._id), o]));
    res.json(
      reports.map(r => ({
        id: String(r._id),
        reportedOrgId: String(r.reportedOrgId),
        reported: byId.get(String(r.reportedOrgId))?.name ?? '',
        suspended: !!byId.get(String(r.reportedOrgId))?.suspended,
        reporter: byId.get(String(r.reporterOrgId))?.name ?? '',
        reportedBy: r.reportedBy,
        reason: r.reason,
        details: r.details,
        status: r.status,
        note: r.note,
        createdAt: (r as any).createdAt,
      }))
    );
  })
);

moderationRouter.post(
  '/reports/:id/resolve',
  ...requirePermission('MANAGE_USERS'),
  asyncHandler(async (req, res) => {
    const { action, note } = z.object({ action: z.enum(['dismiss', 'suspend']), note: z.string().trim().max(500).default('') }).parse(req.body);
    const report = await Report.findOne({ _id: req.params.id, status: 'open' }).catch(() => null);
    if (!report) throw new HttpError(404, 'No open report with that id.');
    const org = await Organization.findById(report.reportedOrgId);
    report.status = action === 'dismiss' ? 'dismissed' : 'actioned';
    report.reviewedBy = req.auth!.email;
    report.reviewedAt = new Date();
    report.note = note;
    await report.save();
    if (action === 'suspend' && org) {
      org.suspended = true;
      org.listed = false;
      await org.save();
      await notifyOrg(org.id, `Your company was suspended after a report${note ? `: ${note}` : '.'} Contact support to appeal.`, req.auth!.email);
    }
    await auditRequest(req, action === 'suspend' ? 'COMPANY_SUSPENDED' : 'REPORT_DISMISSED', 'reports', report.id, 'WARNING', `${action === 'suspend' ? 'Suspended' : 'Dismissed a report against'} ${org?.name ?? report.reportedOrgId}.`);
    res.json({ success: true });
  })
);

moderationRouter.get(
  '/contacts',
  ...requirePermission('MANAGE_USERS'),
  asyncHandler(async (_req, res) => {
    const rows = await ContactRequest.find({ handled: false }).sort({ createdAt: 1 }).limit(200).lean();
    res.json(rows.map(r => ({ id: String(r._id), name: r.name, email: r.email, phone: r.phone, message: r.message, createdAt: (r as any).createdAt })));
  })
);

moderationRouter.post(
  '/contacts/:id/handled',
  ...requirePermission('MANAGE_USERS'),
  asyncHandler(async (req, res) => {
    const result = await ContactRequest.updateOne({ _id: req.params.id, handled: false }, { handled: true, handledBy: req.auth!.email }).catch(() => ({ modifiedCount: 0 }));
    if (!result.modifiedCount) throw new HttpError(404, 'No open message with that id.');
    res.json({ success: true });
  })
);

moderationRouter.post(
  '/companies/:id/restore',
  ...requirePermission('MANAGE_USERS'),
  asyncHandler(async (req, res) => {
    const org = await Organization.findById(req.params.id).catch(() => null);
    if (!org) throw new HttpError(404, 'Company not found.');
    org.suspended = false;
    org.listed = true;
    await org.save();
    await notifyOrg(org.id, 'Your company has been restored.', req.auth!.email);
    await auditRequest(req, 'COMPANY_RESTORED', 'organizations', org.id, 'SUCCESS', `Restored ${org.name}.`);
    res.json({ success: true });
  })
);
