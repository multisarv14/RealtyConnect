import { Router } from 'express';
import { z } from 'zod';
import { DIRECTORY_CATEGORIES } from '../../../shared/roles';
import { asyncHandler, HttpError, optionalAuth, requireAuth } from '../middleware/auth';
import { Organization, User } from '../models';
import { auditRequest } from '../services/audit';

// ---------- Validation ----------

const text = (max: number) => z.string().trim().max(max);
const list = (maxItems = 50, maxLength = 200) => z.array(text(maxLength).min(1)).max(maxItems);
// Rendered into href/src attributes, so only web addresses are accepted.
const httpUrl = text(500).refine(v => v === '' || /^https?:\/\/\S+$/i.test(v), 'must be an http(s) URL');
const website = text(200).refine(v => v === '' || /^(https?:\/\/)?[a-z0-9.-]+\.[a-z]{2,}(\/\S*)?$/i.test(v), 'must be a web address');

const profileSchema = z
  .object({
    name: text(160).min(2),
    category: z.enum(DIRECTORY_CATEGORIES),
    city: text(80),
    state: text(80),

    tagline: text(200),
    description: text(2000),
    yearEstablished: text(4).regex(/^(\d{4})?$/, 'must be a 4-digit year'),
    companyType: text(80),
    registrationNumber: text(40),
    gstin: text(20),
    pan: text(15),
    reraNumber: text(80),
    website,
    email: text(255),
    phone: text(30),
    whatsapp: text(30),
    addressCorporate: text(400),
    businessHours: text(100),
    googleMapQuery: text(200),
    introduction: text(3000),
    vision: text(1000),
    mission: text(1000),
    businessObjectives: text(1000),
    coverBanner: httpUrl,
    logoBg: text(30).regex(/^(bg-[a-z]+-\d{3})?$/, 'must be a colour class'),

    addressBranches: list(30, 400),
    workingStates: list(),
    workingCities: list(),
    languages: list(),
    coreStrengths: list(),
    industriesServed: list(),
    products: list(100),
    services: list(100),
    brands: list(100),
    dealerships: list(),
    specializations: list(),

    socials: z.object({ linkedin: httpUrl, twitter: httpUrl, facebook: httpUrl }).partial(),
    team: z
      .array(z.object({ id: text(60), name: text(120), role: text(120), department: text(120), email: text(255), phone: text(30), photoUrl: httpUrl }))
      .max(100),
    portfolio: z
      .array(
        z.object({
          id: text(60),
          title: text(200),
          type: text(100),
          status: z.enum(['Completed', 'Ongoing', 'Upcoming']),
          value: text(60),
          area: text(60),
          location: text(200),
          description: text(2000),
          completionYear: text(10),
        })
      )
      .max(200),
    gallery: z
      .array(
        z.object({
          id: text(60),
          title: text(200),
          type: z.enum(['image', 'video', 'pdf']),
          url: httpUrl,
          category: z.enum(['Photos', 'Videos', 'Certificates', 'Brochures']),
          size: text(20).optional(),
        })
      )
      .max(100),

    profileVisibility: z.enum(['Public', 'Connections Only', 'Private']),
    contactVisibility: z.enum(['Public', 'Verified Only', 'None']),
    leadPreferences: z.object({ autoReply: z.boolean(), notifyEmail: z.boolean(), notifyWhatsApp: z.boolean(), preferredLeadValue: text(60) }).partial(),
  })
  .partial();

const ORG_LEVEL_FIELDS = ['name', 'category', 'city', 'state'];

// ---------- Shaping ----------

type OrgDoc = InstanceType<typeof Organization>;

const LOGO_COLOURS = ['bg-indigo-600', 'bg-emerald-600', 'bg-amber-600', 'bg-purple-600', 'bg-blue-600', 'bg-rose-600', 'bg-cyan-600', 'bg-teal-600'];

function logoColour(name: string) {
  const hash = [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return LOGO_COLOURS[hash % LOGO_COLOURS.length];
}

function initials(name: string) {
  const words = name.split(/\s+/).filter(Boolean);
  return ((words[0]?.[0] ?? '') + (words[1]?.[0] ?? words[0]?.[1] ?? '')).toUpperCase();
}

function ratingOf(org: OrgDoc) {
  if (org.reviews.length === 0) return 0;
  const avg = org.reviews.reduce((sum, r) => sum + r.rating, 0) / org.reviews.length;
  return Math.round(avg * 10) / 10;
}

/** A company with nothing filled in yet still gets every field, so the UI never has to guess. */
function fullProfile(org: OrgDoc) {
  const stored = (org.profile || {}) as Record<string, any>;
  return {
    tagline: '',
    description: '',
    yearEstablished: '',
    companyType: '',
    registrationNumber: '',
    gstin: '',
    pan: '',
    reraNumber: org.reraRegistration && org.reraRegistration !== 'N/A' ? org.reraRegistration : '',
    website: '',
    email: '',
    phone: '',
    whatsapp: '',
    addressCorporate: '',
    addressBranches: [],
    workingStates: org.state ? [org.state] : [],
    workingCities: org.city ? [org.city] : [],
    businessHours: '',
    languages: [],
    googleMapQuery: [org.city, org.state].filter(Boolean).join(', '),
    socials: {},
    introduction: '',
    vision: '',
    mission: '',
    coreStrengths: [],
    industriesServed: [],
    businessObjectives: '',
    products: [],
    services: [],
    brands: [],
    dealerships: [],
    specializations: [],
    team: [],
    portfolio: [],
    gallery: [],
    coverBanner: '',
    logoBg: logoColour(org.name),
    profileVisibility: 'Public',
    contactVisibility: 'Public',
    ...stored,
    leadPreferences: { autoReply: false, notifyEmail: true, notifyWhatsApp: false, preferredLeadValue: '', ...(stored.leadPreferences || {}) },
  };
}

function reviewsOf(org: OrgDoc, verifiedOrgIds: Set<string>) {
  return [...org.reviews]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map(r => ({
      id: String(r._id),
      authorName: r.authorName,
      authorCompany: r.authorCompany,
      rating: r.rating,
      date: r.createdAt.toISOString().slice(0, 10),
      comment: r.comment,
      verified: verifiedOrgIds.has(String(r.authorOrgId)),
    }));
}

/** Directory card. Matches the `Company` shape of the React directory. */
function toCard(org: OrgDoc) {
  const p = fullProfile(org);
  const established = parseInt(p.yearEstablished, 10);
  const contactPublic = p.contactVisibility === 'Public';
  return {
    id: org.id as string,
    registered: true,
    name: org.name,
    category: org.category,
    businessType: org.businessType || org.category,
    logoBg: p.logoBg,
    logoText: initials(org.name),
    description: p.description || p.introduction,
    shortDescription: p.tagline,
    rating: ratingOf(org),
    reviewCount: org.reviews.length,
    established: p.yearEstablished,
    experienceYears: Number.isFinite(established) ? Math.max(0, new Date().getFullYear() - established) : 0,
    membership: 'Starter',
    country: 'India',
    state: org.state,
    city: org.city,
    area: '',
    pincode: '',
    verified: org.verified,
    gstVerified: false,
    reraVerified: false,
    premiumMember: false,
    featuredMember: false,
    views: 0,
    connectionsCount: 0,
    recentlyJoined: Date.now() - org.createdAt.getTime() < 30 * 24 * 60 * 60 * 1000,
    trending: false,
    distanceKm: null,
    products: p.products,
    services: p.services,
    brands: p.brands,
    keywords: p.specializations,
    projects: p.portfolio.map((item: { title: string }) => item.title),
    feedPosts: [],
    rfqs: [],
    opportunities: [],
    availability: '',
    phone: contactPublic ? p.phone : '',
    email: contactPublic ? p.email : '',
    employeeCount: '',
  };
}

async function toProfile(org: OrgDoc, viewerOrgId: string | undefined) {
  const isOwner = viewerOrgId === org.id;
  const p = fullProfile(org);
  const reviewerIds = org.reviews.map(r => r.authorOrgId);
  const verified = await Organization.find({ _id: { $in: reviewerIds }, verified: true }).select('_id').lean();

  // Contact details follow the owner's choice. "Verified Only" means signed-in members
  // until statutory verification of the viewer exists.
  const showContact = isOwner || p.contactVisibility === 'Public' || (p.contactVisibility === 'Verified Only' && !!viewerOrgId);
  const contact = showContact ? {} : { email: '', phone: '', whatsapp: '' };

  return {
    ...p,
    ...contact,
    id: org.id as string,
    registered: true,
    isOwner,
    name: org.name,
    category: org.category,
    city: org.city,
    state: org.state,
    verified: org.verified,
    membership: 'Basic',
    rating: ratingOf(org),
    reviews: reviewsOf(org, new Set(verified.map(v => String(v._id)))),
    // Only the owner needs (or may see) their lead-handling preferences.
    leadPreferences: isOwner ? p.leadPreferences : { autoReply: false, notifyEmail: false, notifyWhatsApp: false, preferredLeadValue: '' },
  };
}

// ---------- Routes ----------

export const companiesRouter = Router();

/** The B2B directory: every listed company whose profile is not private. */
companiesRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const orgs = await Organization.find({ listed: true, 'profile.profileVisibility': { $ne: 'Private' } }).sort({ createdAt: -1 }).limit(1000);
    res.json(orgs.map(toCard));
  })
);

companiesRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const org = await Organization.findById(req.auth!.orgId);
    if (!org) throw new HttpError(404, 'Company not found.');
    res.json(await toProfile(org, req.auth!.orgId));
  })
);

companiesRouter.put(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = profileSchema.parse(req.body) as Record<string, any>;
    const org = await Organization.findById(req.auth!.orgId);
    if (!org) throw new HttpError(404, 'Company not found.');

    const profile = { ...((org.profile as Record<string, any>) || {}) };
    for (const [key, value] of Object.entries(input)) {
      if (value === undefined) continue;
      if (ORG_LEVEL_FIELDS.includes(key)) org.set(key, value);
      else profile[key] = value;
    }
    org.profile = profile;
    org.markModified('profile');
    await org.save();

    await auditRequest(req, 'BUSINESS_PROFILE_UPDATED', 'organizations', org.id, 'SUCCESS', `Updated company profile fields: ${Object.keys(input).join(', ') || 'none'}.`);
    res.json(await toProfile(org, req.auth!.orgId));
  })
);

companiesRouter.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const org = await Organization.findById(req.params.id).catch(() => null);
    const viewerOrgId = req.auth?.orgId;
    const visibility = (org?.profile as Record<string, any> | undefined)?.profileVisibility ?? 'Public';
    const isOwner = !!org && viewerOrgId === org.id;
    // "Connections Only" is open to any signed-in member until company connections are tracked server-side.
    const hidden = !org || (!isOwner && (!org.listed || visibility === 'Private' || (visibility === 'Connections Only' && !viewerOrgId)));
    if (hidden) throw new HttpError(404, 'Company profile not found.');
    res.json(await toProfile(org, viewerOrgId));
  })
);

companiesRouter.post(
  '/:id/reviews',
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = z.object({ rating: z.number().int().min(1).max(5), comment: text(2000).min(5) }).parse(req.body);
    if (req.params.id === req.auth!.orgId) throw new HttpError(403, 'A company cannot review itself.');
    const [org, author, authorOrg] = await Promise.all([
      Organization.findById(req.params.id).catch(() => null),
      User.findById(req.auth!.userId).lean(),
      Organization.findById(req.auth!.orgId).lean(),
    ]);
    if (!org || !org.listed) throw new HttpError(404, 'Company profile not found.');
    if (!author || !authorOrg) throw new HttpError(401, 'Session expired or invalid.');

    // One review per reviewing company; posting again replaces the earlier one.
    const existing = org.reviews.find(r => String(r.authorOrgId) === req.auth!.orgId);
    if (existing) org.reviews.pull(existing._id);
    org.reviews.push({ authorOrgId: authorOrg._id, authorName: author.name || author.email, authorCompany: authorOrg.name, rating: input.rating, comment: input.comment });
    await org.save();

    await auditRequest(req, 'PROFILE_REVIEW_ADDED', 'organizations', org.id, 'SUCCESS', `Review (${input.rating}/5) posted for "${org.name}" by "${authorOrg.name}".`);
    res.status(201).json(await toProfile(org, req.auth!.orgId));
  })
);
