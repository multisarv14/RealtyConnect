import crypto from 'node:crypto';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { asyncHandler, HttpError, requireOrgRole } from '../middleware/auth';
import { Block, Organization, Report, User } from '../models';
import { auditRequest } from '../services/audit';
import { findItem, notifyOrg, putItem, removeItem, shareFile } from '../services/orgStore';
import { initials, logoColour } from './companies';

/**
 * Company-to-company delivery. A company can only write into another company's
 * workspace through these endpoints, which build the delivered record from the
 * sender's verified identity - the client never supplies who a message is "from".
 */

const text = (max: number) => z.string().trim().max(max);
const stamp = () => new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
const newId = (prefix: string) => `${prefix}-${crypto.randomBytes(5).toString('hex')}`;

interface Party {
  orgId: string;
  orgName: string;
  category: string;
  location: string;
  logoBg: string;
  personName: string;
  email: string;
}

async function sender(req: Parameters<typeof auditRequest>[0]): Promise<Party> {
  const [org, user] = await Promise.all([Organization.findById(req.auth!.orgId), User.findById(req.auth!.userId).lean()]);
  if (!org || !user) throw new HttpError(401, 'Session expired or invalid.');
  if (org.suspended) throw new HttpError(403, 'Your company is suspended from contacting others. Contact support.');
  return partyOf(org, user.name || user.email, user.email);
}

function partyOf(org: InstanceType<typeof Organization>, personName: string, email: string): Party {
  const profile = (org.profile || {}) as Record<string, any>;
  return {
    orgId: org.id,
    orgName: org.name,
    category: org.category,
    location: [org.city, org.state].filter(Boolean).join(', '),
    logoBg: profile.logoBg || logoColour(org.name),
    personName,
    email,
  };
}

async function recipient(req: Parameters<typeof auditRequest>[0], orgId: string) {
  if (orgId === req.auth!.orgId) throw new HttpError(400, 'You cannot send this to your own company.');
  const org = await Organization.findById(orgId).catch(() => null);
  if (!org || !org.listed) throw new HttpError(404, 'That company is not on RealtyConnect.');
  // Either side blocking the other ends contact in both directions.
  if (await Block.exists({ $or: [{ orgId: req.auth!.orgId, blockedOrgId: orgId }, { orgId, blockedOrgId: req.auth!.orgId }] })) {
    throw new HttpError(403, 'You cannot contact this company.');
  }
  return org;
}

const limiter = rateLimit({ windowMs: 60 * 1000, limit: 120, standardHeaders: true, legacyHeaders: false });

export const networkRouter = Router();
networkRouter.use(...requireOrgRole('MEMBER'), limiter);

// ---------- Reports and blocks ----------

networkRouter.post(
  '/reports',
  asyncHandler(async (req, res) => {
    const input = z.object({ orgId: z.string(), reason: text(100).min(2), details: text(2000).default('') }).parse(req.body);
    if (input.orgId === req.auth!.orgId) throw new HttpError(400, 'You cannot report your own company.');
    const target = await Organization.findById(input.orgId).catch(() => null);
    if (!target) throw new HttpError(404, 'That company was not found.');
    const report = await Report.create({ reporterOrgId: req.auth!.orgId, reportedOrgId: target._id, reportedBy: req.auth!.email, reason: input.reason, details: input.details });
    await auditRequest(req, 'COMPANY_REPORTED', 'reports', report.id, 'WARNING', `Reported ${target.name}: ${input.reason}.`);
    res.status(201).json({ id: report.id });
  })
);

networkRouter.post(
  '/blocks',
  asyncHandler(async (req, res) => {
    const { orgId } = z.object({ orgId: z.string() }).parse(req.body);
    if (orgId === req.auth!.orgId) throw new HttpError(400, 'You cannot block your own company.');
    if (!(await Organization.exists({ _id: orgId }).catch(() => null))) throw new HttpError(404, 'That company was not found.');
    await Block.updateOne({ orgId: req.auth!.orgId, blockedOrgId: orgId }, { $setOnInsert: { orgId: req.auth!.orgId, blockedOrgId: orgId } }, { upsert: true });
    // Any open connection with that company ends.
    const id = connectionId(req.auth!.orgId, orgId);
    await Promise.all([removeItem('rc_net_connections', req.auth!.orgId, id), removeItem('rc_net_connections', orgId, id)]);
    res.status(201).json({ blocked: true });
  })
);

networkRouter.delete(
  '/blocks/:orgId',
  asyncHandler(async (req, res) => {
    await Block.deleteOne({ orgId: req.auth!.orgId, blockedOrgId: req.params.orgId });
    res.json({ blocked: false });
  })
);

networkRouter.get(
  '/blocks',
  asyncHandler(async (req, res) => {
    res.json((await Block.find({ orgId: req.auth!.orgId }).lean()).map(b => String(b.blockedOrgId)));
  })
);

// ---------- Connections ----------

const connectionId = (a: string, b: string) => `conn-${[a, b].sort().join('-')}`;

networkRouter.post(
  '/connections',
  asyncHandler(async (req, res) => {
    const { toOrgId, purpose } = z.object({ toOrgId: z.string(), purpose: text(500).default('') }).parse(req.body);
    const [to, from] = await Promise.all([recipient(req, toOrgId), sender(req)]);
    const id = connectionId(from.orgId, to.id);
    const existing = await findItem('rc_net_connections', from.orgId, id);
    if (existing) throw new HttpError(409, 'A connection is already active or pending with this company.');

    const toParty = partyOf(to, '', '');
    const base = { id, timestamp: stamp(), purpose, mutualCount: 0 };
    const mine = { ...base, businessId: to.id, businessName: to.name, businessCategory: toParty.category, businessLocation: toParty.location, logoBg: toParty.logoBg, status: 'pending_outgoing' };
    const theirs = { ...base, businessId: from.orgId, businessName: from.orgName, businessCategory: from.category, businessLocation: from.location, logoBg: from.logoBg, status: 'pending_incoming' };
    await Promise.all([putItem('rc_net_connections', from.orgId, mine, req.auth!.email), putItem('rc_net_connections', to.id, theirs, req.auth!.email)]);
    await notifyOrg(to.id, `${from.orgName} sent you a connection request.`, req.auth!.email);
    await auditRequest(req, 'B2B_CONNECTION_REQUESTED', 'companies', to.id, 'SUCCESS', `Connection request sent to ${to.name}.`);
    res.status(201).json(mine);
  })
);

networkRouter.post(
  '/connections/:id/respond',
  asyncHandler(async (req, res) => {
    const { accept } = z.object({ accept: z.boolean() }).parse(req.body);
    const mine = await findItem<any>('rc_net_connections', req.auth!.orgId, req.params.id);
    if (!mine || mine.status !== 'pending_incoming') throw new HttpError(404, 'No pending request with that id.');
    const other = mine.businessId as string;
    const [me, theirs] = await Promise.all([Organization.findById(req.auth!.orgId).lean(), findItem<any>('rc_net_connections', other, req.params.id)]);
    if (accept) {
      await putItem('rc_net_connections', req.auth!.orgId, { ...mine, status: 'accepted' }, req.auth!.email);
      if (theirs) await putItem('rc_net_connections', other, { ...theirs, status: 'accepted' }, req.auth!.email);
      await notifyOrg(other, `${me?.name ?? 'A company'} accepted your connection request.`, req.auth!.email);
    } else {
      await removeItem('rc_net_connections', req.auth!.orgId, req.params.id);
      await removeItem('rc_net_connections', other, req.params.id);
    }
    await auditRequest(req, accept ? 'B2B_CONNECTION_ACCEPTED' : 'B2B_CONNECTION_REJECTED', 'companies', other, 'SUCCESS', `${accept ? 'Accepted' : 'Declined'} connection request ${req.params.id}.`);
    res.json({ success: true, status: accept ? 'accepted' : 'removed' });
  })
);

networkRouter.delete(
  '/connections/:id',
  asyncHandler(async (req, res) => {
    const mine = await findItem<any>('rc_net_connections', req.auth!.orgId, req.params.id);
    if (!mine) throw new HttpError(404, 'Connection not found.');
    await removeItem('rc_net_connections', req.auth!.orgId, req.params.id);
    await removeItem('rc_net_connections', mine.businessId, req.params.id);
    res.json({ success: true });
  })
);

// ---------- Enquiries (profile enquiry, product enquiry, opportunity response) ----------

const enquirySchema = z.object({
  toOrgId: z.string(),
  kind: z.enum(['profile', 'product', 'opportunity', 'rfq', 'partnership']).default('profile'),
  subject: text(200).min(1),
  category: text(100).default('General'),
  message: text(4000).min(1),
  phone: text(30).default(''),
  email: text(255).default(''),
  // Reference to what the enquiry is about (listing, opportunity, ...)
  relatedId: text(100).optional(),
  relatedTitle: text(300).optional(),
  // Same id on both sides so the two copies are the same conversation.
  conversationId: text(100).optional(),
});

const LEAD_TYPE: Record<string, { type: string; source: string }> = {
  profile: { type: 'General Business Enquiry', source: 'Business Profile' },
  product: { type: 'Product Enquiry', source: 'Marketplace' },
  opportunity: { type: 'Business Partnership', source: 'Networking' },
  rfq: { type: 'Material Requirement', source: 'RFQ' },
  partnership: { type: 'Business Partnership', source: 'Networking' },
};

networkRouter.post(
  '/enquiries',
  asyncHandler(async (req, res) => {
    const input = enquirySchema.parse(req.body);
    const [to, from] = await Promise.all([recipient(req, input.toOrgId), sender(req)]);
    const leadId = newId('RC-LE');
    const when = stamp();
    const map = LEAD_TYPE[input.kind];

    // The recipient finds it as a new lead, with the sender's company and contact filled in.
    await putItem(
      'realtyconnect_leads',
      to.id,
      {
        id: leadId,
        title: input.subject,
        type: map.type,
        source: map.source,
        company: from.orgName,
        contactPerson: from.personName,
        email: input.email || from.email,
        mobile: input.phone,
        category: from.category,
        productService: input.relatedTitle || input.subject,
        location: from.location,
        priority: 'Medium',
        description: input.message,
        preferredContactMethod: 'Email',
        status: 'New',
        assignedTo: 'Unassigned',
        createdDate: when,
        updatedDate: when,
        notes: '',
        relatedCompanyId: from.orgId,
        timeline: [{ id: 't1', date: when, type: 'Enquiry Received', text: `Received from ${from.orgName} via ${map.source}.` }],
        followUps: [],
      },
      req.auth!.email
    );

    // Product enquiries also appear in the seller's marketplace enquiry list.
    if (input.kind === 'product') {
      await putItem(
        'realtyconnect_product_enquiries',
        to.id,
        {
          id: newId('enq'),
          listingId: input.relatedId || '',
          listingName: input.relatedTitle || input.subject,
          sellerId: to.id,
          sellerName: to.name,
          senderName: from.personName,
          senderEmail: input.email || from.email,
          senderPhone: input.phone,
          buyerCompany: from.orgName,
          message: input.message,
          timestamp: when,
          status: 'Pending',
        },
        req.auth!.email
      );
    }

    // And the first message of a conversation both companies can continue.
    const conversationId = input.conversationId || newId('conv');
    await deliverMessage(to.id, from, {
      conversationId,
      messageId: newId('msg'),
      text: `${input.subject}\n\n${input.message}`,
      conversationType: input.kind === 'product' ? 'Marketplace Enquiry' : input.kind === 'rfq' ? 'RFQ Discussion' : input.kind === 'opportunity' ? 'Opportunity Discussion' : 'Direct Business',
      related: input.relatedId ? { type: input.kind === 'product' ? 'Marketplace' : input.kind === 'rfq' ? 'RFQ' : 'Opportunity', id: input.relatedId, title: input.relatedTitle || input.subject } : undefined,
      actor: req.auth!.email,
    });

    await notifyOrg(to.id, `New enquiry from ${from.orgName}: ${input.subject}`, req.auth!.email);
    await auditRequest(req, 'B2B_ENQUIRY_DISPATCHED', 'enquiries', to.id, 'SUCCESS', `Enquiry "${input.subject}" delivered to ${to.name}.`);
    res.status(201).json({ id: leadId, conversationId, deliveredTo: to.name });
  })
);

// ---------- Messages ----------

interface MessageInput {
  conversationId: string;
  messageId: string;
  text: string;
  conversationType: string;
  related?: { type: string; id: string; title: string };
  attachment?: { name: string; type: string; size: string; fileId?: string };
  actor: string;
}

async function deliverMessage(toOrgId: string, from: Party, m: MessageInput) {
  const when = stamp();
  const existing = await findItem<any>('realtyconnect_conversations', toOrgId, m.conversationId);
  const message = {
    id: m.messageId,
    sender: 'them',
    senderName: from.personName,
    senderCompany: from.orgName,
    text: m.text,
    timestamp: when,
    type: 'text',
    status: 'delivered',
    ...(m.attachment ? { attachment: m.attachment } : {}),
  };
  const conv = existing ?? {
    id: m.conversationId,
    companyName: from.orgName,
    companyId: from.orgId,
    logoBg: from.logoBg,
    conversationType: m.conversationType,
    priority: 'Normal',
    pinned: false,
    archived: false,
    businessCategory: from.category,
    ...(m.related ? { relatedEntity: m.related } : {}),
    unreadCount: 0,
    messages: [],
  };
  if (conv.messages.some((x: any) => x.id === m.messageId)) return;
  conv.messages = [...conv.messages, message];
  conv.lastMessageText = m.text.slice(0, 140);
  conv.lastMessageTime = when;
  conv.unreadCount = (conv.unreadCount || 0) + 1;
  conv.archived = false;
  await putItem('realtyconnect_conversations', toOrgId, conv, m.actor);
}

networkRouter.post(
  '/messages',
  asyncHandler(async (req, res) => {
    const input = z
      .object({
        toOrgId: z.string(),
        conversationId: text(100).min(1),
        messageId: text(100).min(1),
        text: text(5000).min(1),
        conversationType: text(60).default('Direct Business'),
        related: z.object({ type: text(30), id: text(100), title: text(300) }).optional(),
        attachment: z.object({ name: text(200), type: text(30), size: text(20), fileId: text(40).optional() }).optional(),
      })
      .parse(req.body);
    const [to, from] = await Promise.all([recipient(req, input.toOrgId), sender(req)]);
    await shareFile(input.attachment?.fileId, from.orgId, to.id);
    await deliverMessage(to.id, from, { ...(input as Omit<MessageInput, "actor">), actor: req.auth!.email });
    res.status(201).json({ delivered: true });
  })
);

// The recipient opened the conversation: mark what they received as read on the sender's side.
networkRouter.post(
  '/messages/read',
  asyncHandler(async (req, res) => {
    const { toOrgId, conversationId } = z.object({ toOrgId: z.string(), conversationId: text(100) }).parse(req.body);
    const theirs = await findItem<any>('realtyconnect_conversations', toOrgId, conversationId);
    if (!theirs) return res.json({ updated: 0 });
    let updated = 0;
    theirs.messages = theirs.messages.map((m: any) => {
      if (m.sender === 'self' && m.status !== 'read') {
        updated++;
        return { ...m, status: 'read' };
      }
      return m;
    });
    if (updated) await putItem('realtyconnect_conversations', toOrgId, theirs, req.auth!.email);
    res.json({ updated });
  })
);

// ---------- RFQ bids ----------

networkRouter.post(
  '/bids',
  asyncHandler(async (req, res) => {
    const input = z
      .object({
        toOrgId: z.string(),
        bidId: text(100).min(1),
        rfqId: text(100).min(1),
        rfqTitle: text(300).default(''),
        quotationAmount: text(60),
        validity: text(60).default(''),
        deliveryTimeline: text(120).default(''),
        remarks: text(3000).default(''),
        attachmentName: text(200).optional(),
        attachmentFileId: text(40).optional(),
      })
      .parse(req.body);
    const [to, from] = await Promise.all([recipient(req, input.toOrgId), sender(req)]);
    await shareFile(input.attachmentFileId, from.orgId, to.id);
    const bid = {
      id: input.bidId,
      rfqId: input.rfqId,
      companyId: from.orgId,
      companyName: from.orgName,
      companyLogoBg: from.logoBg,
      companyProfile: `${from.category} • ${from.location}`.trim(),
      quotationAmount: input.quotationAmount,
      validity: input.validity,
      deliveryTimeline: input.deliveryTimeline,
      remarks: input.remarks,
      ...(input.attachmentName ? { attachmentName: input.attachmentName } : {}),
      ...(input.attachmentFileId ? { attachmentFileId: input.attachmentFileId } : {}),
      submittedDate: new Date().toISOString().slice(0, 10),
      status: 'Pending',
    };
    // Both sides hold the same record so status changes by the buyer show up for the bidder.
    await Promise.all([putItem('realtyconnect_quotation_list', to.id, bid, req.auth!.email), putItem('realtyconnect_quotation_list', from.orgId, bid, req.auth!.email)]);
    await notifyOrg(to.id, `${from.orgName} submitted a quotation of ${input.quotationAmount} for "${input.rfqTitle || input.rfqId}".`, req.auth!.email);
    await auditRequest(req, 'RFQ_QUOTATION_SUBMITTED', 'rfqs', input.rfqId, 'SUCCESS', `Quotation ${input.bidId} delivered to ${to.name}.`);
    res.status(201).json({ delivered: true });
  })
);

// The RFQ owner accepts, declines or reviews a bid; the bidder's own copy follows.
networkRouter.post(
  '/bids/:id/status',
  asyncHandler(async (req, res) => {
    const { status } = z.object({ status: z.enum(['Pending', 'Accepted', 'Declined', 'Under Review']) }).parse(req.body);
    const mine = await findItem<any>('realtyconnect_quotation_list', req.auth!.orgId, req.params.id);
    if (!mine || !mine.companyId || mine.companyId === req.auth!.orgId) throw new HttpError(404, 'No received quotation with that id.');
    await putItem('realtyconnect_quotation_list', req.auth!.orgId, { ...mine, status }, req.auth!.email);
    const theirs = await findItem<any>('realtyconnect_quotation_list', mine.companyId, req.params.id);
    if (theirs) await putItem('realtyconnect_quotation_list', mine.companyId, { ...theirs, status }, req.auth!.email);
    const me = await Organization.findById(req.auth!.orgId).lean();
    await notifyOrg(mine.companyId, `${me?.name ?? 'The buyer'} marked your quotation as ${status}.`, req.auth!.email);
    await auditRequest(req, 'RFQ_QUOTATION_STATUS', 'rfqs', mine.rfqId, 'SUCCESS', `Quotation ${req.params.id} set to ${status}.`);
    res.json({ success: true, status });
  })
);

// ---------- Meetings ----------

networkRouter.post(
  '/meetings',
  asyncHandler(async (req, res) => {
    const input = z
      .object({
        toOrgId: z.string(),
        meetingId: text(100).min(1),
        title: text(200).min(1),
        meetingType: text(60).default('Business Meeting'),
        meetingDate: text(10),
        startTime: text(5),
        endTime: text(5),
        meetingMode: text(30).default('Video Call'),
        location: text(300).default(''),
        agenda: text(3000).default(''),
      })
      .parse(req.body);
    const [to, from] = await Promise.all([recipient(req, input.toOrgId), sender(req)]);
    await putItem(
      'realtyconnect_meetings',
      to.id,
      {
        id: input.meetingId,
        title: input.title,
        meetingType: input.meetingType,
        relatedCompany: from.orgName,
        companyId: from.orgId,
        contactPerson: from.personName,
        organizer: from.personName,
        participants: [from.personName],
        meetingDate: input.meetingDate,
        startTime: input.startTime,
        endTime: input.endTime,
        location: input.location,
        meetingMode: input.meetingMode,
        priority: 'Normal',
        status: 'Scheduled',
        agenda: input.agenda,
        notes: '',
        discussionPoints: [],
        actionItems: [],
        followUpTasks: [],
        reminderTime: '30 Minutes Before',
        attachments: [],
      },
      req.auth!.email
    );
    await notifyOrg(to.id, `${from.orgName} invited you to "${input.title}" on ${input.meetingDate} at ${input.startTime}.`, req.auth!.email);
    res.status(201).json({ delivered: true });
  })
);
