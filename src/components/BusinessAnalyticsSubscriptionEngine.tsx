/**
 * Analytics, plan & billing, and data exports.
 * Every number on the analytics tab is calculated from the company's own saved records; nothing is sample data.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart2, CreditCard, Download, FileText, Printer, CheckCircle2, Clock, AlertTriangle, Lock } from 'lucide-react';
import { appStore } from '../lib/appStore';
import { api, errorMessage, type Session } from '../lib/api';
import { downloadCsv, printReport, type ExportColumn } from '../lib/exportFile';

interface EngineProps {
  userSession: Session | null;
  onLogTriggered: (action: string, entity: string, entityId: string, status: 'SUCCESS' | 'FAILURE' | 'WARNING', details: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onNotificationTriggered: (type: 'email' | 'sms' | 'push' | 'in_app', recipient: string, content: string) => void;
  setActiveViewMode?: (view: any) => void;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  supportLevel: string;
  limits: { users: number; storageMb: number; listings: number; rfqsPerMonth: number };
  features: string[];
}

interface PaymentRow {
  id: string;
  invoiceNo: string;
  planName: string;
  cycle: string;
  amount: number;
  gst: number;
  total: number;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  method: string;
  reference: string;
  createdAt: string;
  paidAt: string | null;
}

interface BillingInfo {
  planId: string;
  subscribedPlanId: string;
  cycle: 'monthly' | 'yearly';
  expiresAt: string | null;
  lapsed: boolean;
  plan: Plan;
  usage: { users: number; storageMb: number; listings: number; rfqsThisMonth: number };
  plans: Plan[];
  gstRate: number;
  payments: PaymentRow[];
  gateway: { razorpay: boolean; keyId?: string };
  paymentInstructions: string;
}

const FEATURE_LABELS: Record<string, string> = {
  directory: 'Business directory', messaging: 'Messaging', feed: 'Business feed', meetings: 'Meetings', leads: 'Lead management',
  marketplace: 'Marketplace', rfq: 'RFQs and tenders', opportunities: 'Opportunities', crm: 'CRM', projects: 'Projects',
  procurement: 'Procurement', inventory: 'Inventory', assets: 'Assets and maintenance', finance: 'Finance and billing',
  hr_dms: 'HR and documents', analytics: 'Analytics'
};

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const read = <T,>(key: string): T[] => {
  try {
    const parsed = JSON.parse(appStore.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// ---------- Data sets that can be exported ----------

interface Dataset {
  id: string;
  label: string;
  key: string;
  feature?: string;
  columns: ExportColumn[];
}

const DATASETS: Dataset[] = [
  { id: 'leads', label: 'Leads', key: 'realtyconnect_leads', feature: 'leads', columns: [{ key: 'id', label: 'Lead no.' }, { key: 'title', label: 'Title' }, { key: 'company', label: 'Company' }, { key: 'contactPerson', label: 'Contact' }, { key: 'email', label: 'Email' }, { key: 'mobile', label: 'Mobile' }, { key: 'status', label: 'Status' }, { key: 'priority', label: 'Priority' }, { key: 'source', label: 'Source' }, { key: 'assignedTo', label: 'Assigned to' }, { key: 'createdDate', label: 'Created' }] },
  { id: 'crm', label: 'CRM accounts', key: 'realtyconnect_crm_accounts', feature: 'crm', columns: [{ key: 'name', label: 'Account' }, { key: 'businessType', label: 'Type' }, { key: 'industry', label: 'Industry' }, { key: 'currentStage', label: 'Stage' }, { key: 'relationshipStatus', label: 'Relationship' }, { key: 'assignedManager', label: 'Manager' }, { key: 'businessValue', label: 'Business value (₹ lakhs)' }, { key: 'gstNumber', label: 'GSTIN' }] },
  { id: 'rfqs', label: 'RFQs', key: 'realtyconnect_rfq_list', feature: 'rfq', columns: [{ key: 'rfqNumber', label: 'RFQ no.' }, { key: 'title', label: 'Title' }, { key: 'companyName', label: 'Issued by' }, { key: 'status', label: 'Status' }, { key: 'quotationSubmissionDeadline', label: 'Deadline' }, { key: 'estimatedBudget', label: 'Budget' }, { key: 'bidsCount', label: 'Bids' }] },
  { id: 'quotes', label: 'Quotations', key: 'realtyconnect_quotation_list', feature: 'rfq', columns: [{ key: 'id', label: 'Quotation' }, { key: 'rfqId', label: 'RFQ' }, { key: 'companyName', label: 'Bidder' }, { key: 'quotationAmount', label: 'Amount' }, { key: 'validity', label: 'Validity' }, { key: 'deliveryTimeline', label: 'Delivery' }, { key: 'status', label: 'Status' }, { key: 'submittedDate', label: 'Submitted' }] },
  { id: 'projects', label: 'Projects', key: 'realtyconnect_projects', feature: 'projects', columns: [{ key: 'code', label: 'Code' }, { key: 'name', label: 'Project' }, { key: 'client', label: 'Client' }, { key: 'manager', label: 'Manager' }, { key: 'status', label: 'Status' }, { key: 'phase', label: 'Phase' }, { key: 'progress', label: 'Progress %' }, { key: 'budget', label: 'Budget (₹ lakhs)' }, { key: 'expectedCompletion', label: 'Expected completion' }] },
  { id: 'procurement', label: 'Procurement requests', key: 'realtyconnect_procurement_requests', feature: 'procurement', columns: [{ key: 'id', label: 'Request' }, { key: 'title', label: 'Title' }, { key: 'projectName', label: 'Project' }, { key: 'category', label: 'Category' }, { key: 'estimatedCost', label: 'Estimated cost (₹)' }, { key: 'status', label: 'Status' }, { key: 'requiredDate', label: 'Required by' }, { key: 'assignedSupplierName', label: 'Supplier' }] },
  { id: 'inventory', label: 'Inventory', key: 'realtyconnect_inventory_items', feature: 'inventory', columns: [{ key: 'code', label: 'Code' }, { key: 'name', label: 'Item' }, { key: 'category', label: 'Category' }, { key: 'warehouse', label: 'Warehouse' }, { key: 'currentStock', label: 'In stock' }, { key: 'reservedStock', label: 'Reserved' }, { key: 'availableStock', label: 'Available' }, { key: 'minStockLevel', label: 'Minimum' }, { key: 'unitOfMeasure', label: 'Unit' }, { key: 'status', label: 'Status' }] },
  { id: 'invoices', label: 'Invoices', key: 'realtyconnect_finance_billings', feature: 'finance', columns: [{ key: 'invoiceNumber', label: 'Invoice' }, { key: 'customer', label: 'Customer' }, { key: 'project', label: 'Project' }, { key: 'invoiceDate', label: 'Date' }, { key: 'dueDate', label: 'Due' }, { key: 'amount', label: 'Amount' }, { key: 'tax', label: 'Tax' }, { key: 'totalAmount', label: 'Total' }, { key: 'paidAmount', label: 'Paid' }, { key: 'paymentStatus', label: 'Status' }] },
  { id: 'expenses', label: 'Expenses', key: 'realtyconnect_finance_expenses', feature: 'finance', columns: [{ key: 'id', label: 'Expense' }, { key: 'category', label: 'Category' }, { key: 'description', label: 'Description' }, { key: 'amount', label: 'Amount' }, { key: 'date', label: 'Date' }, { key: 'status', label: 'Status' }] },
  { id: 'employees', label: 'Employees', key: 'rc_hr_employees', feature: 'hr_dms', columns: [{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }, { key: 'department', label: 'Department' }, { key: 'designation', label: 'Designation' }, { key: 'email', label: 'Email' }, { key: 'mobile', label: 'Mobile' }, { key: 'joiningDate', label: 'Joined' }, { key: 'status', label: 'Status' }] },
  { id: 'assets', label: 'Assets', key: 'rc_assets', feature: 'assets', columns: [{ key: 'id', label: 'Asset' }, { key: 'name', label: 'Name' }, { key: 'category', label: 'Category' }, { key: 'status', label: 'Status' }, { key: 'assignedProjectName', label: 'Project' }] },
  { id: 'meetings', label: 'Meetings', key: 'realtyconnect_meetings', feature: 'meetings', columns: [{ key: 'title', label: 'Meeting' }, { key: 'relatedCompany', label: 'Company' }, { key: 'meetingDate', label: 'Date' }, { key: 'startTime', label: 'Start' }, { key: 'endTime', label: 'End' }, { key: 'status', label: 'Status' }, { key: 'organizer', label: 'Organizer' }] },
  { id: 'listings', label: 'Marketplace listings', key: 'realtyconnect_marketplace_listings', feature: 'marketplace', columns: [{ key: 'name', label: 'Listing' }, { key: 'category', label: 'Category' }, { key: 'businessName', label: 'Seller' }, { key: 'price', label: 'Price' }, { key: 'moq', label: 'MOQ' }, { key: 'location', label: 'Location' }] },
];

export default function BusinessAnalyticsSubscriptionEngine({ userSession, onLogTriggered, showToast, onNotificationTriggered }: EngineProps) {
  const [tab, setTab] = useState<'analytics' | 'membership' | 'reports'>('analytics');
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [busyPlan, setBusyPlan] = useState<string | null>(null);

  const canManageBilling = userSession?.orgRole === 'OWNER' || userSession?.orgRole === 'ADMIN';
  const features = billing?.plan.features ?? userSession?.plan.features ?? [];

  const loadBilling = useCallback(() => {
    api<BillingInfo>('GET', '/billing')
      .then(setBilling)
      .catch(err => showToast(errorMessage(err), 'error'));
  }, [showToast]);

  useEffect(() => {
    loadBilling();
  }, [loadBilling]);

  // ---------- Analytics (calculated from saved records) ----------

  const stats = useMemo(() => {
    const leads = read<any>('realtyconnect_leads');
    const crm = read<any>('realtyconnect_crm_accounts');
    const projects = read<any>('realtyconnect_projects');
    const invoices = read<any>('realtyconnect_finance_billings');
    const expenses = read<any>('realtyconnect_finance_expenses');
    const items = read<any>('realtyconnect_inventory_items');
    const employees = read<any>('rc_hr_employees');
    const listings = read<any>('realtyconnect_marketplace_listings').filter(l => l.businessId === userSession?.orgId);
    const rfqs = read<any>('realtyconnect_rfq_list').filter(r => r.companyId === userSession?.orgId);
    const quotes = read<any>('realtyconnect_quotation_list');
    const connections = read<any>('rc_net_connections');
    const procurement = read<any>('realtyconnect_procurement_requests');

    const byStatus = (rows: any[], field: string) => rows.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r[field] || 'Unknown']: (acc[r[field] || 'Unknown'] || 0) + 1 }), {});
    const converted = leads.filter(l => l.status === 'Converted').length;
    const billed = invoices.filter(i => i.paymentStatus !== 'Draft' && i.paymentStatus !== 'Cancelled');
    const received = quotes.filter(q => q.companyId !== userSession?.orgId && rfqs.some(r => r.id === q.rfqId));

    return {
      leads: { total: leads.length, converted, rate: leads.length ? Math.round((converted / leads.length) * 100) : 0, byStatus: byStatus(leads, 'status') },
      crm: { accounts: crm.length, strategic: crm.filter(a => a.currentStage === 'Strategic Partner').length, valueLakhs: crm.reduce((s, a) => s + (Number(a.businessValue) || 0), 0) },
      projects: { total: projects.length, active: projects.filter(p => p.status === 'In Progress').length, delayed: projects.filter(p => p.status === 'Delayed').length, avgProgress: projects.length ? Math.round(projects.reduce((s, p) => s + (Number(p.progress) || 0), 0) / projects.length) : 0, budgetLakhs: projects.reduce((s, p) => s + (Number(p.budget) || 0), 0) },
      finance: {
        invoiced: billed.reduce((s, i) => s + (Number(i.totalAmount) || 0), 0),
        collected: billed.reduce((s, i) => s + (Number(i.paidAmount) || 0), 0),
        overdue: invoices.filter(i => i.paymentStatus === 'Overdue').reduce((s, i) => s + ((Number(i.totalAmount) || 0) - (Number(i.paidAmount) || 0)), 0),
        expenses: expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0),
        count: invoices.length
      },
      inventory: { items: items.length, low: items.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock' || (Number(i.availableStock) <= Number(i.minStockLevel))).length },
      procurement: { requests: procurement.length, open: procurement.filter(p => !['Completed', 'Rejected'].includes(p.status)).length, spend: procurement.filter(p => p.status !== 'Rejected').reduce((s, p) => s + (Number(p.estimatedCost) || 0), 0) },
      hr: { employees: employees.filter(e => e.status === 'Active').length },
      network: { connections: connections.filter(c => c.status === 'accepted').length, pending: connections.filter(c => c.status === 'pending_incoming').length },
      market: { listings: listings.length, rfqs: rfqs.length, bidsReceived: received.length }
    };
  }, [tab, userSession?.orgId]);

  const Card = ({ title, value, note }: { title: string; value: string | number; note?: string }) => (
    <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-xl">
      <div className="text-[11px] text-slate-500">{title}</div>
      <div className="text-2xl font-bold text-slate-100 mt-1">{value}</div>
      {note && <div className="text-[11px] text-slate-500 mt-0.5">{note}</div>}
    </div>
  );

  const Section = ({ title, feature, children, empty }: { title: string; feature?: string; children: React.ReactNode; empty: boolean }) => {
    if (feature && !features.includes(feature)) return null;
    return (
      <section className="space-y-2">
        <h3 className="text-sm font-bold text-slate-200">{title}</h3>
        {empty ? <p className="text-xs text-slate-500 bg-slate-900/30 border border-dashed border-slate-800 rounded-xl p-4">Nothing recorded yet. Figures appear here as you add records in this module.</p> : <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{children}</div>}
      </section>
    );
  };

  const maxLead = Math.max(1, ...Object.values(stats.leads.byStatus).map(Number));

  // ---------- Plans ----------

  const choosePlan = async (plan: Plan) => {
    setBusyPlan(plan.id);
    try {
      const result = await api<any>('POST', '/billing/orders', { planId: plan.id, cycle });
      if (result.activated) {
        showToast(`You are now on the ${plan.name} plan.`, 'success');
        onLogTriggered('SUBSCRIPTION_PLAN_CHANGED', 'organizations', plan.id, 'SUCCESS', `Switched to ${plan.name}.`);
      } else if (result.razorpay) {
        await payWithRazorpay(result.razorpay, result.payment);
      } else {
        showToast(`Invoice ${result.payment.invoiceNo} created. See the instructions below to pay.`, 'success');
        onNotificationTriggered('in_app', userSession?.email || '', `Invoice ${result.payment.invoiceNo} for the ${plan.name} plan is awaiting payment.`);
      }
      loadBilling();
    } catch (err) {
      showToast(errorMessage(err), 'error');
    } finally {
      setBusyPlan(null);
    }
  };

  const payWithRazorpay = (order: { orderId: string; keyId: string; amountPaise: number }, payment: PaymentRow) =>
    new Promise<void>(resolve => {
      const open = () => {
        const Razorpay = (window as any).Razorpay;
        if (!Razorpay) {
          showToast('The payment window could not be loaded. Check your connection and try again.', 'error');
          return resolve();
        }
        new Razorpay({
          key: order.keyId,
          amount: order.amountPaise,
          currency: 'INR',
          order_id: order.orderId,
          name: 'RealtyConnect',
          description: `${payment.planName} plan (${payment.cycle})`,
          prefill: { email: userSession?.email },
          handler: (response: any) => {
            api('POST', '/billing/razorpay/verify', response)
              .then(() => showToast('Payment received. Your plan is active.', 'success'))
              .catch(err => showToast(errorMessage(err), 'error'))
              .finally(() => {
                loadBilling();
                resolve();
              });
          },
          modal: { ondismiss: () => resolve() }
        }).open();
      };
      if ((window as any).Razorpay) return open();
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = open;
      script.onerror = () => {
        showToast('The payment window could not be loaded.', 'error');
        resolve();
      };
      document.body.appendChild(script);
    });

  const cancelOrder = (id: string) =>
    api('DELETE', `/billing/orders/${encodeURIComponent(id)}`)
      .then(loadBilling)
      .catch(err => showToast(errorMessage(err), 'error'));

  const printInvoice = (p: PaymentRow) => {
    const ok = printReport(
      `Invoice ${p.invoiceNo}`,
      [{ key: 'item', label: 'Item' }, { key: 'amount', label: 'Amount' }],
      [
        { item: `${p.planName} plan (${p.cycle})`, amount: inr(p.amount) },
        { item: `GST @ ${Math.round((billing?.gstRate ?? 0.18) * 100)}%`, amount: inr(p.gst) },
        { item: 'Total', amount: inr(p.total) },
        { item: 'Status', amount: p.status === 'paid' ? `Paid ${p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN') : ''} (${p.method} ${p.reference})` : p.status }
      ],
      `Billed to ${userSession?.organizationName} • ${new Date(p.createdAt).toLocaleDateString('en-IN')}`
    );
    if (!ok) showToast('Allow pop-ups to print the invoice.', 'error');
  };

  const pending = billing?.payments.find(p => p.status === 'pending');

  // ---------- Exports ----------

  const exportable = DATASETS.filter(d => !d.feature || features.includes(d.feature));
  const exportDataset = (d: Dataset, kind: 'csv' | 'print') => {
    const rows = read<Record<string, unknown>>(d.key);
    if (rows.length === 0) {
      showToast(`There are no ${d.label.toLowerCase()} to export yet.`, 'info');
      return;
    }
    if (kind === 'csv') downloadCsv(`${d.id}-${new Date().toISOString().slice(0, 10)}`, d.columns, rows);
    else if (!printReport(`${d.label} - ${userSession?.organizationName}`, d.columns, rows)) showToast('Allow pop-ups to print the report.', 'error');
    onLogTriggered('REPORT_EXPORTED', 'reports', d.id, 'SUCCESS', `Exported ${rows.length} ${d.label.toLowerCase()} as ${kind === 'csv' ? 'CSV' : 'a printable report'}.`);
  };

  const meter = (label: string, used: number, limit: number, unit = '') => {
    const unlimited = limit < 0;
    const pct = unlimited ? 0 : Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
    return (
      <div className="space-y-1" key={label}>
        <div className="flex justify-between text-xs text-slate-300"><span>{label}</span><span>{used}{unit} / {unlimited ? 'Unlimited' : `${limit}${unit}`}</span></div>
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden"><div className={`h-full ${pct >= 90 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} /></div>
      </div>
    );
  };

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'membership', label: 'Plan & billing', icon: CreditCard },
    { id: 'reports', label: 'Reports & exports', icon: FileText }
  ] as const;

  return (
    <div className="space-y-6 text-xs text-slate-300" id="analytics-billing-root">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-900 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Analytics, plan and reports</h2>
          <p className="text-slate-400 mt-1">Figures are calculated from your own records. Current plan: <strong className="text-slate-200">{billing?.plan.name ?? userSession?.plan.name}</strong></p>
        </div>
        <div className="flex gap-1 p-1 bg-slate-950 border border-slate-900 rounded-xl">
          {tabs.map(t => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 ${tab === t.id ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}>
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {tab === 'analytics' && (
        <div className="space-y-6">
          <Section title="Network" empty={stats.network.connections + stats.network.pending + stats.market.listings + stats.market.rfqs === 0}>
            <Card title="Connections" value={stats.network.connections} note={`${stats.network.pending} waiting for you`} />
            <Card title="Marketplace listings" value={stats.market.listings} />
            <Card title="RFQs you issued" value={stats.market.rfqs} note={`${stats.market.bidsReceived} quotations received`} />
          </Section>
          <Section title="Leads and customers" feature="leads" empty={stats.leads.total + stats.crm.accounts === 0}>
            <Card title="Leads" value={stats.leads.total} note={`${stats.leads.converted} converted`} />
            <Card title="Conversion rate" value={`${stats.leads.rate}%`} />
            <Card title="CRM accounts" value={stats.crm.accounts} note={`${stats.crm.strategic} strategic partners`} />
            <Card title="Business value" value={`₹${stats.crm.valueLakhs.toLocaleString('en-IN')} L`} />
          </Section>
          {stats.leads.total > 0 && features.includes('leads') && (
            <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl space-y-2">
              <h3 className="font-bold text-slate-200">Leads by stage</h3>
              {Object.entries(stats.leads.byStatus).map(([status, n]) => (
                <div key={status} className="flex items-center gap-3">
                  <span className="w-28 text-slate-400">{status}</span>
                  <div className="flex-1 h-3 rounded bg-slate-800 overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${(Number(n) / maxLead) * 100}%` }} /></div>
                  <span className="w-8 text-right text-slate-300">{n}</span>
                </div>
              ))}
            </div>
          )}
          <Section title="Projects" feature="projects" empty={stats.projects.total === 0}>
            <Card title="Projects" value={stats.projects.total} note={`${stats.projects.active} in progress`} />
            <Card title="Delayed" value={stats.projects.delayed} />
            <Card title="Average progress" value={`${stats.projects.avgProgress}%`} />
            <Card title="Total budget" value={`₹${stats.projects.budgetLakhs.toLocaleString('en-IN')} L`} />
          </Section>
          <Section title="Finance" feature="finance" empty={stats.finance.count + stats.finance.expenses === 0}>
            <Card title="Invoiced" value={inr(stats.finance.invoiced)} />
            <Card title="Collected" value={inr(stats.finance.collected)} note={`${inr(stats.finance.invoiced - stats.finance.collected)} outstanding`} />
            <Card title="Overdue" value={inr(stats.finance.overdue)} />
            <Card title="Expenses" value={inr(stats.finance.expenses)} />
          </Section>
          <Section title="Procurement and inventory" feature="procurement" empty={stats.procurement.requests + stats.inventory.items === 0}>
            <Card title="Procurement requests" value={stats.procurement.requests} note={`${stats.procurement.open} open`} />
            <Card title="Planned spend" value={inr(stats.procurement.spend)} />
            <Card title="Stock items" value={stats.inventory.items} />
            <Card title="Low or out of stock" value={stats.inventory.low} />
          </Section>
          <Section title="People" feature="hr_dms" empty={stats.hr.employees === 0}>
            <Card title="Active employees" value={stats.hr.employees} />
          </Section>
        </div>
      )}

      {tab === 'membership' && billing && (
        <div className="space-y-6">
          {billing.lapsed && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Your paid plan expired{billing.expiresAt ? ` on ${new Date(billing.expiresAt).toLocaleDateString('en-IN')}` : ''}. Your account is on the Free plan until you renew.</span>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-xl lg:col-span-1 space-y-3">
              <div>
                <div className="text-[11px] text-slate-500">Current plan</div>
                <div className="text-xl font-bold text-slate-100">{billing.plan.name}</div>
                <div className="text-slate-400">{billing.expiresAt ? `Active until ${new Date(billing.expiresAt).toLocaleDateString('en-IN')}` : 'No expiry'}</div>
              </div>
              {meter('Users', billing.usage.users, billing.plan.limits.users)}
              {meter('Storage', billing.usage.storageMb, billing.plan.limits.storageMb, ' MB')}
              {meter('Marketplace listings', billing.usage.listings, billing.plan.limits.listings)}
              {meter('RFQs this month', billing.usage.rfqsThisMonth, billing.plan.limits.rfqsPerMonth)}
            </div>

            <div className="lg:col-span-2 space-y-3">
              {pending && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2" id="pending-invoice">
                  <div className="flex items-center gap-2 font-bold text-amber-300"><Clock className="w-4 h-4" />Invoice {pending.invoiceNo} is waiting for payment</div>
                  <p className="text-slate-300">{pending.planName} plan, {pending.cycle}: {inr(pending.amount)} + GST {inr(pending.gst)} = <strong>{inr(pending.total)}</strong></p>
                  <p className="text-slate-400">{billing.paymentInstructions}</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => printInvoice(pending)} className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 flex items-center gap-1.5"><Printer className="w-3.5 h-3.5" />Print invoice</button>
                    {canManageBilling && <button type="button" onClick={() => cancelOrder(pending.id)} className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">Cancel</button>}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-200">Choose a plan</h3>
                <div className="flex gap-1 p-1 bg-slate-950 border border-slate-900 rounded-lg">
                  {(['monthly', 'yearly'] as const).map(c => (
                    <button key={c} type="button" onClick={() => setCycle(c)} className={`px-3 py-1 rounded-md font-semibold ${cycle === c ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}>{c === 'monthly' ? 'Monthly' : 'Yearly'}</button>
                  ))}
                </div>
              </div>
              {!canManageBilling && <p className="text-slate-500 flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" />Only the company owner or an administrator can change the plan.</p>}

              <div className="grid md:grid-cols-2 gap-3">
                {billing.plans.map(plan => {
                  const current = plan.id === billing.subscribedPlanId && !billing.lapsed;
                  const price = cycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
                  return (
                    <div key={plan.id} className={`p-4 rounded-xl border space-y-2 ${current ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-900 bg-slate-900/30'}`}>
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-slate-100">{plan.name}</div>
                        {current && <span className="text-emerald-400 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />Current</span>}
                      </div>
                      <div className="text-lg font-bold text-slate-100">{price === 0 ? 'Free' : `${inr(price)} / ${cycle === 'yearly' ? 'year' : 'month'}`}</div>
                      <p className="text-slate-400">{plan.description}</p>
                      <ul className="text-slate-400 space-y-0.5">
                        <li>{plan.limits.users} users • {plan.limits.storageMb >= 1024 ? `${plan.limits.storageMb / 1024} GB` : `${plan.limits.storageMb} MB`} storage</li>
                        <li>{plan.limits.listings < 0 ? 'Unlimited' : plan.limits.listings} listings • {plan.limits.rfqsPerMonth < 0 ? 'unlimited' : plan.limits.rfqsPerMonth} RFQs a month</li>
                        <li className="text-slate-500">{plan.features.map(f => FEATURE_LABELS[f] ?? f).join(', ')}</li>
                      </ul>
                      <button
                        type="button"
                        disabled={current || !canManageBilling || busyPlan !== null}
                        onClick={() => choosePlan(plan)}
                        className="w-full py-2 rounded-lg font-bold bg-emerald-500 text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {current ? 'Your plan' : busyPlan === plan.id ? 'Please wait...' : plan.priceMonthly === 0 ? 'Switch to Free' : billing.gateway.razorpay ? 'Pay and upgrade' : 'Request invoice'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-200">Invoices</h3>
            {billing.payments.length === 0 ? (
              <p className="text-slate-500">No invoices yet.</p>
            ) : (
              <div className="overflow-x-auto border border-slate-900 rounded-xl">
                <table className="w-full text-left">
                  <thead className="bg-slate-900/60 text-slate-400"><tr>{['Invoice', 'Plan', 'Total', 'Status', 'Date', ''].map(h => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr></thead>
                  <tbody>
                    {billing.payments.map(p => (
                      <tr key={p.id} className="border-t border-slate-900">
                        <td className="px-3 py-2 font-mono">{p.invoiceNo}</td>
                        <td className="px-3 py-2">{p.planName} ({p.cycle})</td>
                        <td className="px-3 py-2">{inr(p.total)}</td>
                        <td className="px-3 py-2 capitalize">{p.status}</td>
                        <td className="px-3 py-2">{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                        <td className="px-3 py-2"><button type="button" onClick={() => printInvoice(p)} className="text-emerald-400 hover:underline">Print</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'reports' && (
        <div className="space-y-3">
          <p className="text-slate-400">Download your records as a CSV file (opens in Excel) or open a printable report that you can save as PDF.</p>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {exportable.map(d => {
              const count = read(d.key).length;
              return (
                <div key={d.id} className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-200">{d.label}</div>
                    <div className="text-slate-500">{count} record{count === 1 ? '' : 's'}</div>
                  </div>
                  <div className="flex gap-1.5">
                    <button type="button" onClick={() => exportDataset(d, 'csv')} className="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-semibold flex items-center gap-1"><Download className="w-3.5 h-3.5" />CSV</button>
                    <button type="button" onClick={() => exportDataset(d, 'print')} className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 flex items-center gap-1"><Printer className="w-3.5 h-3.5" />PDF</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
