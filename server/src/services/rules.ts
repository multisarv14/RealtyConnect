/**
 * Business rules applied by the server to saved records. The screens check the same things,
 * but only checks made here hold when the data is sent by anything other than our own UI.
 * A rule returns a message when the record is not acceptable, or null.
 */

type Item = Record<string, any>;

const num = (v: unknown) => (typeof v === 'number' ? v : Number.NaN);
const isMoney = (v: unknown) => Number.isFinite(num(v)) && num(v) >= 0 && num(v) < 1e13;
const oneOf = (v: unknown, allowed: string[]) => typeof v === 'string' && allowed.includes(v);

const MAX_ITEM_BYTES = 256 * 1024;

type Rule = (item: Item) => string | null;

const RULES: Record<string, Rule> = {
  realtyconnect_inventory_items: i => {
    if (!isMoney(i.currentStock)) return 'Stock on hand must be zero or more.';
    if (!isMoney(i.reservedStock)) return 'Reserved stock must be zero or more.';
    if (num(i.reservedStock) > num(i.currentStock)) return 'Reserved stock cannot be more than the stock on hand.';
    if (i.minStockLevel !== undefined && !isMoney(i.minStockLevel)) return 'Minimum stock must be zero or more.';
    return null;
  },
  realtyconnect_inventory_movements: i => {
    if (!(num(i.quantity) > 0) || !Number.isFinite(num(i.quantity))) return 'A stock movement needs a quantity greater than zero.';
    return null;
  },
  realtyconnect_finance_billings: i => {
    for (const f of ['amount', 'tax', 'discount', 'totalAmount', 'paidAmount']) if (i[f] !== undefined && !isMoney(i[f])) return `Invoice ${f} must be zero or more.`;
    if (num(i.paidAmount) > num(i.totalAmount) + 0.5) return 'The amount paid cannot be more than the invoice total.';
    if (i.paymentStatus === 'Paid' && Math.abs(num(i.paidAmount) - num(i.totalAmount)) > 0.5) return 'An invoice marked Paid must be paid in full.';
    if (i.invoiceDate && i.dueDate && String(i.dueDate) < String(i.invoiceDate)) return 'The due date cannot be before the invoice date.';
    return null;
  },
  realtyconnect_finance_payments: i => (num(i.amount) > 0 && isMoney(i.amount) ? null : 'A payment needs an amount greater than zero.'),
  realtyconnect_finance_expenses: i => (num(i.amount) > 0 && isMoney(i.amount) ? null : 'An expense needs an amount greater than zero.'),
  realtyconnect_procurement_requests: i => (i.estimatedCost !== undefined && !isMoney(i.estimatedCost) ? 'The estimated cost must be zero or more.' : null),
  realtyconnect_projects: i => {
    if (i.progress !== undefined && !(num(i.progress) >= 0 && num(i.progress) <= 100)) return 'Project progress must be between 0 and 100.';
    if (i.budget !== undefined && !isMoney(i.budget)) return 'The project budget must be zero or more.';
    if (i.startDate && i.expectedCompletion && String(i.expectedCompletion) < String(i.startDate)) return 'The expected completion cannot be before the start date.';
    return null;
  },
  realtyconnect_leads: i =>
    i.status === undefined || oneOf(i.status, ['New', 'Assigned', 'Contacted', 'Discussion', 'Quotation Sent', 'Negotiation', 'Converted', 'Closed', 'Lost', 'Cancelled']) ? null : 'Unknown lead status.',
  realtyconnect_marketplace_listings: i => {
    if (!i.priceOnRequest && i.price !== undefined && !/\d/.test(String(i.price))) return 'A listing needs a price, or must be marked price on request.';
    return null;
  },
  rc_hr_employees: i => (i.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(i.email)) ? 'The employee email is not valid.' : null),
  realtyconnect_quotation_list: i => (i.status === undefined || oneOf(i.status, ['Pending', 'Accepted', 'Declined', 'Under Review']) ? null : 'Unknown quotation status.'),
};

export function validateItem(key: string, item: Item): string | null {
  if (Buffer.byteLength(JSON.stringify(item)) > MAX_ITEM_BYTES) return 'This record is too large.';
  return RULES[key]?.(item) ?? null;
}
