import crypto from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { GST_RATE, getPlan, PLANS } from '../../../shared/plans';
import { STORE_KEYS } from '../../../shared/storeKeys';
import mongoose from 'mongoose';
import { config } from '../config';
import { asyncHandler, HttpError, requireAuth, requireOrgRole, requirePermission } from '../middleware/auth';
import { Organization, Payment, UploadedFile, User } from '../models';
import { auditRequest } from '../services/audit';
import { notifyOrg } from '../services/orgStore';
import { planOf } from '../services/plans';

export const billingRouter = Router();

const toPayment = (p: any) => ({
  id: String(p._id),
  invoiceNo: p.invoiceNo,
  planId: p.planId,
  planName: getPlan(p.planId).name,
  cycle: p.cycle,
  amount: p.amount,
  gst: p.gst,
  total: p.total,
  status: p.status,
  method: p.method,
  reference: p.reference,
  createdAt: p.createdAt,
  paidAt: p.paidAt,
});

export async function usageOf(orgId: string) {
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const listingsDef = STORE_KEYS.realtyconnect_marketplace_listings;
  const rfqDef = STORE_KEYS.realtyconnect_rfq_list;
  const [users, files, listings, rfqs] = await Promise.all([
    User.countDocuments({ orgId, status: 'ACTIVE' }),
    UploadedFile.aggregate([{ $match: { orgId: new mongoose.Types.ObjectId(orgId) } }, { $group: { _id: null, bytes: { $sum: '$sizeBytes' } } }]),
    listingsDef.kind === 'list' ? mongoose.connection.collection(listingsDef.collection).countDocuments({ _orgId: orgId }) : 0,
    rfqDef.kind === 'list' ? mongoose.connection.collection(rfqDef.collection).countDocuments({ _orgId: orgId, _createdAt: { $gte: monthStart } }) : 0,
  ]);
  return { users, storageMb: Math.round(((files[0]?.bytes ?? 0) / (1024 * 1024)) * 10) / 10, listings, rfqsThisMonth: rfqs };
}

billingRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const org = await Organization.findById(req.auth!.orgId).lean();
    if (!org) throw new HttpError(404, 'Company not found.');
    const [plan, usage, payments] = await Promise.all([
      planOf(req.auth!.orgId),
      usageOf(req.auth!.orgId),
      Payment.find({ orgId: req.auth!.orgId }).sort({ createdAt: -1 }).limit(50).lean(),
    ]);
    res.json({
      planId: plan.id,
      subscribedPlanId: org.planId,
      cycle: org.billingCycle,
      expiresAt: org.planExpiresAt,
      lapsed: org.planId !== plan.id,
      plan,
      usage,
      plans: PLANS,
      gstRate: GST_RATE,
      payments: payments.map(toPayment),
      gateway: { razorpay: !!config.razorpay.keyId, keyId: config.razorpay.keyId || undefined },
      paymentInstructions: config.paymentInstructions,
    });
  })
);

async function activate(orgId: string, planId: string, cycle: 'monthly' | 'yearly') {
  const org = await Organization.findById(orgId);
  if (!org) return;
  const plan = getPlan(planId);
  const base = org.planId === planId && org.planExpiresAt && org.planExpiresAt.getTime() > Date.now() ? org.planExpiresAt.getTime() : Date.now();
  org.planId = plan.id;
  org.billingCycle = cycle;
  org.subscriptionPlan = plan.name;
  org.planExpiresAt = plan.priceMonthly === 0 ? null : new Date(base + (cycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000);
  await org.save();
  await notifyOrg(orgId, `Your ${plan.name} plan is active${org.planExpiresAt ? ` until ${org.planExpiresAt.toLocaleDateString('en-IN')}` : ''}.`);
}

async function nextInvoiceNo() {
  const year = new Date().getFullYear();
  const count = await Payment.countDocuments({ invoiceNo: new RegExp(`^INV-${year}-`) });
  return `INV-${year}-${String(count + 1).padStart(5, '0')}`;
}

// Choose a plan. Free is immediate; a paid plan creates an invoice that is activated once payment is confirmed.
billingRouter.post(
  '/orders',
  ...requireOrgRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const { planId, cycle } = z.object({ planId: z.string(), cycle: z.enum(['monthly', 'yearly']).default('monthly') }).parse(req.body);
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) throw new HttpError(404, 'Unknown plan.');
    const org = await Organization.findById(req.auth!.orgId);
    if (!org) throw new HttpError(404, 'Company not found.');

    if (plan.priceMonthly === 0) {
      const usage = await usageOf(req.auth!.orgId);
      if (usage.users > plan.limits.users) throw new HttpError(409, `The Free plan allows ${plan.limits.users} users; deactivate ${usage.users - plan.limits.users} before downgrading.`);
      await activate(req.auth!.orgId, plan.id, 'monthly');
      await auditRequest(req, 'SUBSCRIPTION_PLAN_CHANGED', 'organizations', req.auth!.orgId, 'SUCCESS', `Switched to the ${plan.name} plan.`);
      return res.json({ activated: true });
    }

    await Payment.updateMany({ orgId: org._id, status: 'pending' }, { status: 'cancelled' });
    const amount = cycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
    const gst = Math.round(amount * GST_RATE);
    const payment = await Payment.create({
      orgId: org._id,
      invoiceNo: await nextInvoiceNo(),
      planId: plan.id,
      cycle,
      amount,
      gst,
      total: amount + gst,
      requestedBy: req.auth!.email,
    });

    let razorpay: { orderId: string; keyId: string; amountPaise: number } | undefined;
    if (config.razorpay.keyId && config.razorpay.keySecret) {
      const auth = Buffer.from(`${config.razorpay.keyId}:${config.razorpay.keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: payment.total * 100, currency: 'INR', receipt: payment.invoiceNo }),
      }).catch(() => null);
      if (!response || !response.ok) throw new HttpError(502, 'The payment gateway did not accept the order. Try again shortly.');
      const order = (await response.json()) as { id: string };
      payment.razorpayOrderId = order.id;
      await payment.save();
      razorpay = { orderId: order.id, keyId: config.razorpay.keyId, amountPaise: payment.total * 100 };
    }

    await auditRequest(req, 'SUBSCRIPTION_ORDER_CREATED', 'payments', payment.invoiceNo, 'SUCCESS', `Invoice ${payment.invoiceNo} for ${plan.name} (${cycle}), total INR ${payment.total}.`);
    res.status(201).json({ payment: toPayment(payment), razorpay });
  })
);

// Razorpay Checkout calls this with the signature it produced; only a correct signature activates the plan.
billingRouter.post(
  '/razorpay/verify',
  ...requireOrgRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const input = z.object({ razorpay_order_id: z.string(), razorpay_payment_id: z.string(), razorpay_signature: z.string() }).parse(req.body);
    if (!config.razorpay.keySecret) throw new HttpError(400, 'Online payments are not enabled.');
    const payment = await Payment.findOne({ orgId: req.auth!.orgId, razorpayOrderId: input.razorpay_order_id });
    if (!payment) throw new HttpError(404, 'No matching order.');
    const expected = crypto.createHmac('sha256', config.razorpay.keySecret).update(`${input.razorpay_order_id}|${input.razorpay_payment_id}`).digest('hex');
    const ok = expected.length === input.razorpay_signature.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(input.razorpay_signature));
    if (!ok) {
      payment.status = 'failed';
      await payment.save();
      await auditRequest(req, 'PAYMENT_SIGNATURE_REJECTED', 'payments', payment.invoiceNo, 'FAILURE', 'Payment signature did not verify.');
      throw new HttpError(400, 'The payment could not be verified.');
    }
    if (payment.status !== 'paid') {
      payment.status = 'paid';
      payment.method = 'Razorpay';
      payment.reference = input.razorpay_payment_id;
      payment.paidAt = new Date();
      await payment.save();
      await activate(req.auth!.orgId, payment.planId, payment.cycle as 'monthly' | 'yearly');
      await auditRequest(req, 'PAYMENT_CAPTURED', 'payments', payment.invoiceNo, 'SUCCESS', `Razorpay payment ${input.razorpay_payment_id} verified.`);
    }
    res.json(toPayment(payment));
  })
);

billingRouter.delete(
  '/orders/:id',
  ...requireOrgRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const payment = await Payment.findOne({ _id: req.params.id, orgId: req.auth!.orgId, status: 'pending' }).catch(() => null);
    if (!payment) throw new HttpError(404, 'No pending order with that id.');
    payment.status = 'cancelled';
    await payment.save();
    res.json({ success: true });
  })
);

// ---------- Platform staff: confirm offline payments ----------

billingRouter.get(
  '/admin/pending',
  ...requirePermission('MANAGE_USERS'),
  asyncHandler(async (_req, res) => {
    const pending = await Payment.find({ status: 'pending' }).sort({ createdAt: 1 }).lean();
    const orgs = await Organization.find({ _id: { $in: pending.map(p => p.orgId) } }).select('name').lean();
    const names = new Map(orgs.map(o => [String(o._id), o.name]));
    res.json(pending.map(p => ({ ...toPayment(p), company: names.get(String(p.orgId)) ?? '', requestedBy: p.requestedBy })));
  })
);

billingRouter.post(
  '/admin/:id/confirm',
  ...requirePermission('MANAGE_USERS'),
  asyncHandler(async (req, res) => {
    const { method, reference } = z.object({ method: z.string().trim().min(2).max(40), reference: z.string().trim().min(3).max(100) }).parse(req.body);
    const payment = await Payment.findOne({ _id: req.params.id, status: 'pending' }).catch(() => null);
    if (!payment) throw new HttpError(404, 'No pending payment with that id.');
    payment.status = 'paid';
    payment.method = method;
    payment.reference = reference;
    payment.confirmedBy = req.auth!.email;
    payment.paidAt = new Date();
    await payment.save();
    await activate(String(payment.orgId), payment.planId, payment.cycle as 'monthly' | 'yearly');
    await auditRequest(req, 'PAYMENT_CONFIRMED', 'payments', payment.invoiceNo, 'SUCCESS', `Confirmed ${method} payment ${reference} for ${payment.invoiceNo}.`);
    res.json(toPayment(payment));
  })
);

billingRouter.post(
  '/admin/:id/reject',
  ...requirePermission('MANAGE_USERS'),
  asyncHandler(async (req, res) => {
    const payment = await Payment.findOne({ _id: req.params.id, status: 'pending' }).catch(() => null);
    if (!payment) throw new HttpError(404, 'No pending payment with that id.');
    payment.status = 'failed';
    payment.confirmedBy = req.auth!.email;
    await payment.save();
    await auditRequest(req, 'PAYMENT_REJECTED', 'payments', payment.invoiceNo, 'WARNING', `Rejected invoice ${payment.invoiceNo}.`);
    res.json(toPayment(payment));
  })
);
