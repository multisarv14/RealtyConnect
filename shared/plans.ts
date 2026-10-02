/**
 * Subscription plans: the single source of truth for prices and limits.
 * The server enforces `limits` and `features`; the UI reads the same table to show them.
 * Prices are in INR, excluding GST.
 */

export type PlanFeature =
  | 'directory' | 'messaging' | 'feed' | 'meetings' | 'leads' | 'marketplace' | 'rfq' | 'opportunities'
  | 'crm' | 'projects' | 'procurement' | 'inventory' | 'assets' | 'finance' | 'hr_dms' | 'analytics';

export interface Plan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  supportLevel: string;
  limits: {
    users: number;
    storageMb: number;
    /** Active marketplace listings. -1 = unlimited. */
    listings: number;
    /** New RFQs per calendar month. -1 = unlimited. */
    rfqsPerMonth: number;
  };
  features: PlanFeature[];
}

const NETWORK: PlanFeature[] = ['directory', 'messaging', 'feed', 'meetings', 'leads', 'marketplace', 'rfq', 'opportunities'];

export const PLANS: Plan[] = [
  {
    id: 'plan-free',
    name: 'Free',
    description: 'List your company, get found and respond to enquiries and RFQs.',
    priceMonthly: 0,
    priceYearly: 0,
    supportLevel: 'Community support',
    limits: { users: 2, storageMb: 500, listings: 5, rfqsPerMonth: 3 },
    features: NETWORK,
  },
  {
    id: 'plan-starter',
    name: 'Starter',
    description: 'For small contracting firms and materials traders: adds CRM and project tracking.',
    priceMonthly: 4999,
    priceYearly: 49900,
    supportLevel: 'Email support',
    limits: { users: 5, storageMb: 2048, listings: 50, rfqsPerMonth: 20 },
    features: [...NETWORK, 'crm', 'projects'],
  },
  {
    id: 'plan-professional',
    name: 'Professional',
    description: 'For mid-sized builders: adds procurement, inventory and asset maintenance.',
    priceMonthly: 14999,
    priceYearly: 149900,
    supportLevel: 'Priority email and chat',
    limits: { users: 25, storageMb: 10240, listings: 500, rfqsPerMonth: 200 },
    features: [...NETWORK, 'crm', 'projects', 'procurement', 'inventory', 'assets'],
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise',
    description: 'The full suite: adds finance and billing, HR and documents, and analytics.',
    priceMonthly: 29999,
    priceYearly: 299900,
    supportLevel: 'Dedicated account manager',
    limits: { users: 100, storageMb: 102400, listings: -1, rfqsPerMonth: -1 },
    features: [...NETWORK, 'crm', 'projects', 'procurement', 'inventory', 'assets', 'finance', 'hr_dms', 'analytics'],
  },
  {
    id: 'plan-corporate',
    name: 'Corporate',
    description: 'Large groups: Enterprise features with the highest limits.',
    priceMonthly: 59999,
    priceYearly: 599900,
    supportLevel: 'Custom SLA',
    limits: { users: 999, storageMb: 1048576, listings: -1, rfqsPerMonth: -1 },
    features: [...NETWORK, 'crm', 'projects', 'procurement', 'inventory', 'assets', 'finance', 'hr_dms', 'analytics'],
  },
];

export const GST_RATE = 0.18;

export const getPlan = (id: string | undefined): Plan => PLANS.find(p => p.id === id) ?? PLANS[0];

/** Which plan feature a workspace data key belongs to (keys not listed are not gated). */
export const KEY_FEATURE: Record<string, PlanFeature> = {
  realtyconnect_crm_accounts: 'crm',
  realtyconnect_projects: 'projects',
  realtyconnect_procurement_requests: 'procurement',
  realtyconnect_procurement_suppliers: 'procurement',
  realtyconnect_rfqs: 'procurement',
  realtyconnect_inventory_items: 'inventory',
  realtyconnect_inventory_warehouses: 'inventory',
  realtyconnect_inventory_movements: 'inventory',
  realtyconnect_inventory_notifications: 'inventory',
  realtyconnect_finance_quotations: 'finance',
  realtyconnect_finance_billings: 'finance',
  realtyconnect_finance_expenses: 'finance',
  realtyconnect_finance_payments: 'finance',
  realtyconnect_finance_notifications: 'finance',
  rc_hr_employees: 'hr_dms',
  rc_hr_departments: 'hr_dms',
  rc_hr_openings: 'hr_dms',
  rc_hr_candidates: 'hr_dms',
  rc_hr_interviews: 'hr_dms',
  rc_hr_activities: 'hr_dms',
  rc_dms_folders: 'hr_dms',
  rc_dms_documents: 'hr_dms',
  rc_hrdms_notifications: 'hr_dms',
  rc_assets: 'assets',
  rc_services: 'assets',
  rc_contracts: 'assets',
  rc_custom_categories: 'assets',
};

/** Navigation module id -> plan feature (modules not listed are always available). */
export const MODULE_FEATURE: Record<string, PlanFeature> = {
  directory: 'directory',
  feed: 'feed',
  messaging: 'messaging',
  meetings: 'meetings',
  lead_management: 'leads',
  marketplace: 'marketplace',
  rfq_management: 'rfq',
  opportunities: 'opportunities',
  crm: 'crm',
  projects: 'projects',
  procurement: 'procurement',
  inventory: 'inventory',
  assets_maintenance: 'assets',
  finance: 'finance',
  hr_dms: 'hr_dms',
};
