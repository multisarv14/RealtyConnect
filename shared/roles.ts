/**
 * Canonical stakeholder roles and their default permission sets.
 * The server seeds the `roles` collection from this table; after that the
 * database is the source of truth (admins can edit permissions at runtime).
 */

export const STAKEHOLDER_ROLES: { [key: string]: string[] } = {
  BUILDER: [
    'CREATE_PROJECT',
    'VIEW_VENDORS',
    'CREATE_RFQ',
    'VIEW_PROPOSALS',
    'VIEW_CONTRACTS',
    'COMMUNICATE_B2B',
  ],
  DEVELOPER: [
    'CREATE_PROJECT',
    'VIEW_VENDORS',
    'CREATE_RFQ',
    'VIEW_PROPOSALS',
    'MANAGE_BILLING',
    'COMMUNICATE_B2B',
  ],
  CONSTRUCTION_CO: [
    'MANAGE_PROJECT_ERP',
    'VIEW_INVENTORY',
    'CREATE_RFQ',
    'SUBMIT_PROPOSAL',
    'COMMUNICATE_B2B',
  ],
  CONTRACTOR: [
    'MANAGE_LABOUR',
    'SUBMIT_PROPOSAL',
    'CREATE_RFQ',
    'VIEW_PROJECTS',
    'COMMUNICATE_B2B',
  ],
  MATERIAL_SUPPLIER: [
    'MANAGE_PRODUCTS',
    'VIEW_RFQS',
    'SUBMIT_PROPOSAL',
    'MANAGE_INVENTORY',
    'COMMUNICATE_B2B',
  ],
  ARCHITECT: [
    'MANAGE_PORTFOLIO',
    'VIEW_RFQS',
    'SUBMIT_PROPOSAL',
    'UPLOAD_BLUEPRINTS',
    'COMMUNICATE_B2B',
  ],
  CONSULTANT: [
    'VIEW_VENDORS',
    'VIEW_RFQS',
    'VERIFY_PROFILES',
    'COMMUNICATE_B2B',
  ],
  BANK: [
    'VIEW_PROJECTS',
    'VIEW_PROPOSALS',
    'MANAGE_BILLING',
    'COMMUNICATE_B2B',
  ],
  RECRUITER: [
    'MANAGE_LABOUR',
    'VIEW_VENDORS',
    'COMMUNICATE_B2B',
  ],
  FACILITY_MANAGEMENT: [
    'VIEW_PROJECTS',
    'VIEW_INVENTORY',
    'VIEW_VENDORS',
    'COMMUNICATE_B2B',
  ],
  COMPLIANCE_AUDITOR: [
    'VIEW_AUDIT_LOGS',
    'GENERATE_REPORTS',
    'VERIFY_PROFILES',
    'VIEW_ALL_FILES',
  ],
  ADMIN: [
    'MANAGE_USERS',
    'MANAGE_ROLES',
    'MANAGE_SYSTEM_CONFIGS',
    'MANAGE_COMMON_MASTERS',
    'VIEW_AUDIT_LOGS',
    'VERIFY_PROFILES',
  ],
};

/** Roles that only an administrator may grant; never available at self-registration. */
export const PRIVILEGED_ROLES = ['ADMIN', 'COMPLIANCE_AUDITOR'];

export const SELF_SERVICE_ROLES = Object.keys(STAKEHOLDER_ROLES).filter(r => !PRIVILEGED_ROLES.includes(r));

/** Categories a company can be listed under in the B2B directory. */
export const DIRECTORY_CATEGORIES = ['Builders', 'Developers', 'Contractors', 'Material Vendors', 'Banks', 'Consultants', 'DSA', 'Recruitment', 'Equipment', 'Transport'] as const;

/** Directory category a newly registered company starts in; the owner can change it on the profile. */
export const ROLE_DIRECTORY_CATEGORY: Record<string, { category: (typeof DIRECTORY_CATEGORIES)[number]; businessType: string }> = {
  BUILDER: { category: 'Builders', businessType: 'Builder' },
  DEVELOPER: { category: 'Developers', businessType: 'Developer' },
  CONSTRUCTION_CO: { category: 'Contractors', businessType: 'Construction Company' },
  CONTRACTOR: { category: 'Contractors', businessType: 'Contractor' },
  MATERIAL_SUPPLIER: { category: 'Material Vendors', businessType: 'Material Supplier' },
  ARCHITECT: { category: 'Consultants', businessType: 'Architect' },
  CONSULTANT: { category: 'Consultants', businessType: 'Consultant' },
  BANK: { category: 'Banks', businessType: 'Bank / NBFC' },
  RECRUITER: { category: 'Recruitment', businessType: 'Recruitment Agency' },
  FACILITY_MANAGEMENT: { category: 'Consultants', businessType: 'Facility Management' },
};

/** Rule AUTH-01. Returns a human-readable problem, or null when the password is acceptable. */
export function passwordPolicyError(password: string): string | null {
  if (password.length < 12) return 'Password must be at least 12 characters long.';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain a digit.';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain a special character.';
  return null;
}
