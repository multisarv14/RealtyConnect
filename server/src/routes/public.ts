import { Router } from 'express';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { STORE_KEYS } from '../../../shared/storeKeys';
import { asyncHandler } from '../middleware/auth';
import { ContactRequest, Organization } from '../models';
import { sendEmail } from '../services/mailer';
import { config } from '../config';
import { toCard } from './companies';

/** What a visitor who is not signed in may see: real counts and the newest public listings. */
export const publicRouter = Router();

function publicItems(key: string) {
  const def = STORE_KEYS[key];
  if (def.kind !== 'list') throw new Error('not a list');
  return mongoose.connection.collection(def.collection);
}

const strip = (doc: Record<string, any>) => Object.fromEntries(Object.entries(doc).filter(([k]) => !k.startsWith('_')));

publicRouter.get(
  '/summary',
  asyncHandler(async (_req, res) => {
    const visible = { listed: true, 'profile.profileVisibility': { $ne: 'Private' } };
    const [companies, verified, byCategory, byCity, newest] = await Promise.all([
      Organization.countDocuments(visible),
      Organization.countDocuments({ ...visible, verified: true }),
      Organization.aggregate([{ $match: visible }, { $group: { _id: '$category', n: { $sum: 1 } } }]),
      Organization.aggregate([{ $match: { ...visible, city: { $ne: '' } } }, { $group: { _id: '$city', n: { $sum: 1 } } }, { $sort: { n: -1 } }, { $limit: 6 }]),
      Organization.find(visible).sort({ verified: -1, createdAt: -1 }).limit(4),
    ]);

    const listings = publicItems('realtyconnect_marketplace_listings');
    const rfqs = publicItems('realtyconnect_rfq_list');
    const opps = publicItems('rc_opportunities');
    const openRfq = { status: 'Open', visibility: 'Public' };
    const openOpp = { status: 'Open' };
    const [listingCount, rfqCount, oppCount, listingDocs, rfqDocs, oppDocs] = await Promise.all([
      listings.countDocuments({}),
      rfqs.countDocuments(openRfq),
      opps.countDocuments(openOpp),
      listings.find({}).sort({ _createdAt: -1 }).limit(3).toArray(),
      rfqs.find(openRfq).sort({ _createdAt: -1 }).limit(2).toArray(),
      opps.find(openOpp).sort({ _createdAt: -1 }).limit(2).toArray(),
    ]);

    res.json({
      companies,
      verified,
      listings: listingCount,
      openRfqs: rfqCount,
      opportunities: oppCount,
      byCategory: Object.fromEntries(byCategory.map(c => [c._id, c.n])),
      cities: byCity.map(c => ({ name: c._id, count: c.n })),
      featuredCompanies: newest.map(toCard),
      latestListings: listingDocs.map(strip),
      latestRfqs: rfqDocs.map(strip),
      latestOpportunities: oppDocs.map(strip),
    });
  })
);

const contactLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });

publicRouter.post(
  '/contact',
  contactLimiter,
  asyncHandler(async (req, res) => {
    const input = z
      .object({
        name: z.string().trim().min(2).max(120),
        email: z.string().trim().toLowerCase().email().max(255),
        phone: z.string().trim().max(30).default(''),
        message: z.string().trim().min(10).max(4000),
      })
      .parse(req.body);
    const request = await ContactRequest.create(input);
    if (config.supportEmail) {
      void sendEmail(config.supportEmail, `New enquiry from ${input.name}`, `${input.message}\n\n${input.name}\n${input.email}\n${input.phone}`);
    }
    res.status(201).json({ id: request.id });
  })
);
