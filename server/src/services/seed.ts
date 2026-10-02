import bcrypt from 'bcryptjs';
import { STAKEHOLDER_ROLES, PRIVILEGED_ROLES, ROLE_DIRECTORY_CATEGORY, passwordPolicyError } from '../../../shared/roles';
import { config } from '../config';
import { MasterCategory, Master, Organization, Role, SystemConfig, User } from '../models';

const ROLE_NAMES: Record<string, string> = {
  BUILDER: 'Builder',
  DEVELOPER: 'Real Estate Developer',
  CONSTRUCTION_CO: 'Construction Company',
  CONTRACTOR: 'Contractor',
  MATERIAL_SUPPLIER: 'Material Supplier / Vendor',
  ARCHITECT: 'Architect',
  CONSULTANT: 'Legal & Liaison Consultant',
  BANK: 'Bank / Financer',
  RECRUITER: 'Talent Recruiter',
  FACILITY_MANAGEMENT: 'Assets & Facility Manager',
  COMPLIANCE_AUDITOR: 'Compliance Auditor',
  ADMIN: 'Platform Administrator',
};

const CONFIGS = [
  { key: 'MAINTENANCE_MODE', value: 'false', description: 'Restricts active system logins exclusively to accounts holding admin roles.', type: 'boolean', category: 'System' },
  { key: 'MAX_UPLOAD_SIZE_MB', value: '10', description: 'Maximum permissible individual binary size for the quarantine uploader.', type: 'number', category: 'Storage' },
  { key: 'BRUTE_FORCE_THRESHOLD', value: '5', description: 'Consecutive incorrect authentication attempts before account lock triggers.', type: 'number', category: 'Security' },
  { key: 'AUDIT_LOG_ROTATION_DAYS', value: '90', description: 'Interval threshold for retaining compliance and audit chains before archiving.', type: 'number', category: 'Logging' },
];

const MASTER_CATEGORIES = [
  {
    key: 'GEOGRAPHY_CITY',
    name: 'Geographical Cities',
    description: 'Permitted operational cities for local real estate projects and vendor networks.',
    items: [
      { code: 'MUMBAI', name: 'Mumbai', isSystem: true },
      { code: 'PUNE', name: 'Pune', isSystem: true },
      { code: 'BANGALORE', name: 'Bangalore', isSystem: false },
      { code: 'DELHI_NCR', name: 'Delhi NCR', isSystem: true },
    ],
  },
  {
    key: 'MEASUREMENT_UNIT',
    name: 'Units of Measurement',
    description: 'Standard standardized units utilized for physical works, estimations, and material trading.',
    items: [
      { code: 'SQ_FT', name: 'Square Feet', isSystem: true },
      { code: 'SQ_MT', name: 'Square Meters', isSystem: true },
      { code: 'TON', name: 'Metric Ton', isSystem: false },
      { code: 'BRASS', name: 'Brass (Volume)', isSystem: true },
    ],
  },
  {
    key: 'PROJECT_STAGES',
    name: 'Real Estate Project Stages',
    description: 'System-wide construction process stages for tracking project development.',
    items: [
      { code: 'PLANNING', name: 'Pre-Construction Planning', isSystem: true },
      { code: 'STRUCTURAL', name: 'Structural Civil Work', isSystem: true },
      { code: 'MEP_INSTALL', name: 'MEP & Utility Installations', isSystem: false },
      { code: 'FINISHING', name: 'Interior Finishing Trades', isSystem: false },
    ],
  },
];

export const DEMO_ACCOUNTS = [
  { title: 'Developer', person: 'Vikram Malhotra', email: 'builder@realtyconnect.com', roles: ['BUILDER'], org: 'Apex Developers Ltd', city: 'Mumbai', state: 'Maharashtra', plan: 'Platinum Developer License', rera: 'RERA-MH-90432', view: 'dashboard' },
  { title: 'Contractor', person: 'Sanjay Mudaliar', email: 'contractor@realtyconnect.com', roles: ['CONTRACTOR', 'MATERIAL_SUPPLIER'], org: 'Vanguard Civil Works', city: 'Bangalore', state: 'Karnataka', plan: 'Gold Contractor Tier', rera: 'RERA-KA-11029', view: 'projects' },
  { title: 'Supplier', person: 'Ramesh Raut', email: 'supplier@realtyconnect.com', roles: ['MATERIAL_SUPPLIER'], org: 'Sai Materials & Aggregates', city: 'Pune', state: 'Maharashtra', plan: 'Enterprise Supply Core', rera: 'N/A', view: 'inventory' },
  { title: 'Consultant', person: 'Ananya Sen', email: 'consultant@realtyconnect.com', roles: ['CONSULTANT'], org: 'RERA Compliance Associates', city: 'New Delhi', state: 'Delhi', plan: 'Executive Advisory S4', rera: 'RERA-DL-80431', view: 'dashboard' },
  { title: 'Syndicate Bank', person: 'Rajesh Aggarwal', email: 'bank@realtyconnect.com', roles: ['BANK'], org: 'State Capital Trust Syndicate', city: 'Mumbai', state: 'Maharashtra', plan: 'Funding Consortium L2', rera: 'N/A', view: 'dashboard' },
  { title: 'Recruiting Agency', person: 'Neha Sharma', email: 'recruiter@realtyconnect.com', roles: ['RECRUITER'], org: 'Manpower RealEstate Ltd', city: 'Hyderabad', state: 'Telangana', plan: 'Talent Suite Unlimited', rera: 'N/A', view: 'dashboard' },
  { title: 'Assets & Facilities', person: 'Devendra Singh', email: 'facilities@realtyconnect.com', roles: ['FACILITY_MANAGEMENT'], org: 'Apex Facility Management', city: 'Noida', state: 'Uttar Pradesh', plan: 'Property Optimiser Elite', rera: 'N/A', view: 'dashboard' },
  { title: 'Architect', person: 'Sneha Iyer', email: 'architect@realtyconnect.com', roles: ['ARCHITECT'], org: 'Aura Design Studio', city: 'Pune', state: 'Maharashtra', plan: 'Standard Free', rera: 'N/A', view: 'dashboard' },
  { title: 'Compliance Auditor', person: 'Platform Administrator', email: 'admin@realtyconnect.com', roles: ['ADMIN', 'COMPLIANCE_AUDITOR'], org: 'Regulatory Directorate', city: '', state: '', plan: 'System Audit Root', rera: 'N/A', view: 'directory' },
];

/** Idempotent: only inserts what is missing, so runtime edits by admins survive restarts. */
export async function seedDatabase() {
  await Promise.all(
    Object.entries(STAKEHOLDER_ROLES).map(([code, permissions]) =>
      Role.updateOne(
        { code },
        { $setOnInsert: { code, name: ROLE_NAMES[code] ?? code, permissions, isSystem: PRIVILEGED_ROLES.includes(code) } },
        { upsert: true }
      )
    )
  );

  await Promise.all(CONFIGS.map(cfg => SystemConfig.updateOne({ key: cfg.key }, { $setOnInsert: cfg }, { upsert: true })));

  // Masters are seeded once; afterwards deletions by admins must stick.
  if ((await MasterCategory.countDocuments()) === 0) {
    await MasterCategory.insertMany(MASTER_CATEGORIES.map(({ items, ...cat }, order) => ({ ...cat, order })));
    await Master.insertMany(MASTER_CATEGORIES.flatMap(cat => cat.items.map(item => ({ ...item, category: cat.key }))));
  }

  // Organizations created before the directory existed have no category; derive it from their first user.
  for (const org of await Organization.find({ $or: [{ businessType: '' }, { businessType: { $exists: false } }] })) {
    const user = await User.findOne({ orgId: org._id }).sort({ createdAt: 1 }).lean();
    const directory = user && ROLE_DIRECTORY_CATEGORY[user.roles[0]];
    if (directory) await Organization.updateOne({ _id: org._id }, { $set: directory });
    else await Organization.updateOne({ _id: org._id }, { $set: { businessType: 'Platform', listed: false } });
  }

  // Administrators cannot self-register, so the first one is bootstrapped from the environment.
  if (config.adminEmail && !(await User.exists({ email: config.adminEmail }))) {
    const policyError = passwordPolicyError(config.adminPassword);
    if (policyError) throw new Error(`ADMIN_PASSWORD rejected: ${policyError}`);
    const org = await Organization.create({ name: 'Platform Administration', listed: false });
    await User.create({
      email: config.adminEmail,
      passwordHash: await bcrypt.hash(config.adminPassword, 12),
      name: 'Platform Administrator',
      roles: ['ADMIN', 'COMPLIANCE_AUDITOR'],
      orgId: org._id,
    });
    console.log(`[seed] created administrator account ${config.adminEmail}`);
  }

  if (config.seedDemoUsers) {
    const passwordHash = await bcrypt.hash(config.demoPassword, 10);
    for (const acct of DEMO_ACCOUNTS) {
      if (await User.exists({ email: acct.email })) continue;
      const directory = ROLE_DIRECTORY_CATEGORY[acct.roles[0]];
      const org = await Organization.create({
        name: acct.org,
        reraRegistration: acct.rera,
        subscriptionPlan: acct.plan,
        city: acct.city,
        state: acct.state,
        ...directory,
        // The administrator persona operates the platform; it is not a business to list.
        listed: !!directory,
      });
      await User.create({ email: acct.email, passwordHash, name: acct.person, roles: acct.roles, orgId: org._id });
    }
  }
}
