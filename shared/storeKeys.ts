/**
 * Registry of workspace data keys that are persisted in MongoDB.
 *
 * The React modules were written against a synchronous key/value store
 * (originally window.localStorage). Every key listed here is served by the
 * API instead; any key that is NOT listed stays in the browser (UI
 * preferences, cross-module routing hand-offs).
 *
 * scope:
 *   public - one platform-wide dataset visible to every signed-in user
 *   org    - isolated per organization (tenant)
 *   user   - private to the signed-in user
 *
 * kind:
 *   list   - array of objects with a unique `id`; each item is its own
 *            document in `collection`, synced as per-item diffs
 *   value  - any JSON value, stored whole
 */

export type StoreScope = 'public' | 'org' | 'user';

export type StoreKeyDef =
  | { kind: 'list'; scope: 'public' | 'org'; collection: string }
  | { kind: 'value'; scope: StoreScope; empty?: unknown };

const list = (scope: 'public' | 'org', collection: string): StoreKeyDef => ({ kind: 'list', scope, collection });
const value = (scope: StoreScope, empty?: unknown): StoreKeyDef => ({ kind: 'value', scope, empty });

export const STORE_KEYS: Record<string, StoreKeyDef> = {
  // Platform-wide B2B exchange
  realtyconnect_marketplace_listings: list('public', 'marketplace_listings'),
  realtyconnect_rfq_list: list('public', 'rfqs'),
  rc_opportunities: list('public', 'opportunities'),
  rc_feed_posts: list('public', 'feed_posts'),

  // Sales pipeline
  realtyconnect_leads: list('org', 'leads'),
  realtyconnect_crm_accounts: list('org', 'crm_accounts'),
  realtyconnect_meetings: list('org', 'meetings'),
  realtyconnect_conversations: list('org', 'conversations'),
  realtyconnect_product_enquiries: list('org', 'product_enquiries'),
  realtyconnect_quotation_list: list('org', 'rfq_quotations'),

  // Networking hub
  rc_net_connections: list('org', 'connections'),
  rc_net_enquiries: list('org', 'network_enquiries'),
  rc_net_meetings: list('org', 'network_meetings'),
  rc_net_partnerships: list('org', 'partnerships'),
  rc_net_contact_exchanges: list('org', 'contact_exchanges'),
  rc_net_company_visits: list('org', 'company_visits'),
  rc_net_rfqs: list('org', 'network_rfqs'),
  rc_net_invitations: list('org', 'invitations'),
  rc_net_blocked: list('org', 'blocked_reports'),
  rc_net_timeline: list('org', 'network_timeline'),
  rc_net_connections_sent: value('org', []),
  rc_net_following: value('org', []),
  rc_net_followers: value('org', []),
  rc_net_saved_businesses: value('org', []),
  rc_net_favorite_companies: value('org', []),

  // Projects & procurement
  realtyconnect_projects: list('org', 'projects'),
  realtyconnect_procurement_requests: list('org', 'procurement_requests'),
  realtyconnect_procurement_suppliers: list('org', 'procurement_suppliers'),
  realtyconnect_rfqs: list('org', 'procurement_rfqs'),

  // Inventory
  realtyconnect_inventory_items: list('org', 'inventory_items'),
  realtyconnect_inventory_warehouses: list('org', 'warehouses'),
  realtyconnect_inventory_movements: list('org', 'stock_movements'),
  realtyconnect_inventory_notifications: list('org', 'inventory_notifications'),

  // Finance
  realtyconnect_finance_quotations: list('org', 'finance_quotations'),
  realtyconnect_finance_billings: list('org', 'finance_billings'),
  realtyconnect_finance_expenses: list('org', 'finance_expenses'),
  realtyconnect_finance_payments: list('org', 'finance_payments'),
  realtyconnect_finance_notifications: list('org', 'finance_notifications'),

  // HR & document management
  rc_hr_employees: list('org', 'employees'),
  rc_hr_departments: list('org', 'departments'),
  rc_hr_openings: list('org', 'job_openings'),
  rc_hr_candidates: list('org', 'candidates'),
  rc_hr_interviews: list('org', 'interviews'),
  rc_hr_activities: list('org', 'employee_activities'),
  rc_dms_folders: list('org', 'dms_folders'),
  rc_dms_documents: list('org', 'dms_documents'),
  rc_hrdms_notifications: list('org', 'hrdms_notifications'),

  // Assets & maintenance
  rc_assets: list('org', 'assets'),
  rc_services: list('org', 'service_requests'),
  rc_contracts: list('org', 'amc_contracts'),
  rc_custom_categories: value('org', []),


  // Subscription
  rc_subscription_state: value('org'),
  rc_payment_history: list('org', 'subscription_payments'),

  // In-app notifications raised by modules
  system_notifications: list('org', 'module_notifications'),

  // Personal workspace state
  realtyconnect_saved_listings: value('user', []),
  realtyconnect_fav_listings: value('user', []),
  realtyconnect_saved_rfqs: value('user', []),
  rc_opp_saved_ids: value('user', []),
  rc_opp_responses: value('user', {}),
  realtyconnect_dashboard_priorities: value('user', []),
  realtyconnect_dashboard_checklist: value('user', []),
  realtyconnect_dashboard_widgets: value('user'),
  realtyconnect_grouped_notifications: value('user', []),
  rc_global_notifications: value('user', []),
  rc_saved_dashboards: value('user', []),
  realtyconnect_pinned_modules: value('user', []),
  realtyconnect_favorite_modules: value('user', []),
  realtyconnect_recent_modules: value('user', []),
  realtyconnect_module_clicks: value('user', {}),
};

export function isManagedKey(key: string): boolean {
  return Object.prototype.hasOwnProperty.call(STORE_KEYS, key);
}

/** Body of PATCH /api/v1/store/:key */
export type StorePatch =
  | { type: 'value'; value: unknown }
  | { type: 'list'; upsert: Record<string, unknown>[]; remove: (string | number)[]; order?: (string | number)[] }
  | { type: 'clear' };
