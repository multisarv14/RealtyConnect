/**
 * Control Center: the first screen after sign-in.
 * Everything here is calculated from the company's own saved records and live account state.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, BadgeCheck, Bell, Briefcase, Calendar, CheckCircle2, ClipboardList, CreditCard, FileText, Handshake,
  Layers, MessageSquare, Package, Plus, ShoppingBag, Trash2, Users
} from 'lucide-react';
import { appStore } from '../lib/appStore';
import { api, type Session } from '../lib/api';
import { usePersistentState } from '../lib/usePersistentState';

interface DashboardProps {
  userSession: Session | null;
  setActiveViewMode: (view: any) => void;
  onLogTriggered?: (action: string, entity: string, entityId: string, status: 'SUCCESS' | 'FAILURE' | 'WARNING', details: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onTriggerCreateOpportunity?: () => void;
  [extra: string]: unknown;
}

interface Task {
  id: string;
  text: string;
  done: boolean;
}

const read = <T,>(key: string): T[] => {
  try {
    const parsed = JSON.parse(appStore.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const today = () => new Date().toISOString().slice(0, 10);
const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export default function BusinessDashboard({ userSession, setActiveViewMode, showToast, onTriggerCreateOpportunity }: DashboardProps) {
  const [tasks, setTasks] = usePersistentState<Task[]>('realtyconnect_dashboard_checklist', []);
  const [newTask, setNewTask] = useState('');
  const [activity, setActivity] = useState<{ id: string; content: string; timestamp: string }[]>([]);
  const [tick, setTick] = useState(0);

  const features = userSession?.plan.features ?? [];
  const has = (f: string) => userSession?.role === 'ADMIN' || features.includes(f);

  useEffect(() => {
    api<{ id: string; content: string; timestamp: string }[]>('GET', '/notifications')
      .then(rows => setActivity(rows.slice(0, 8)))
      .catch(() => undefined);
    // Counts follow the live data that other companies deliver.
    const timer = setInterval(() => setTick(t => t + 1), 10_000);
    return () => clearInterval(timer);
  }, []);

  const d = useMemo(() => {
    const orgId = userSession?.orgId;
    const connections = read<any>('rc_net_connections');
    const leads = read<any>('realtyconnect_leads');
    const conversations = read<any>('realtyconnect_conversations');
    const meetings = read<any>('realtyconnect_meetings');
    const quotes = read<any>('realtyconnect_quotation_list');
    const rfqs = read<any>('realtyconnect_rfq_list').filter(r => r.companyId === orgId);
    const listings = read<any>('realtyconnect_marketplace_listings').filter(l => l.businessId === orgId);
    const projects = read<any>('realtyconnect_projects');
    const invoices = read<any>('realtyconnect_finance_billings');
    const items = read<any>('realtyconnect_inventory_items');
    const myRfqIds = new Set(rfqs.map(r => r.id));
    const receivedBids = quotes.filter(q => q.companyId !== orgId && myRfqIds.has(q.rfqId));
    const upcoming = meetings
      .filter(m => ['Scheduled', 'Confirmed', 'Rescheduled'].includes(m.status) && m.meetingDate >= today())
      .sort((a, b) => `${a.meetingDate} ${a.startTime}`.localeCompare(`${b.meetingDate} ${b.startTime}`));
    const overdue = invoices.filter(i => i.paymentStatus === 'Overdue' || (i.dueDate && i.dueDate < today() && ['Pending', 'Partially Paid'].includes(i.paymentStatus)));
    return {
      connections: connections.filter(c => c.status === 'accepted').length,
      pendingRequests: connections.filter(c => c.status === 'pending_incoming'),
      newLeads: leads.filter(l => l.status === 'New'),
      leads: leads.length,
      unread: conversations.reduce((n, c) => n + (c.archived ? 0 : c.unreadCount || 0), 0),
      upcoming,
      todayMeetings: upcoming.filter(m => m.meetingDate === today()).length,
      openRfqs: rfqs.filter(r => r.status === 'Open').length,
      receivedBids,
      pendingBids: receivedBids.filter(q => q.status === 'Pending'),
      myBids: quotes.filter(q => q.companyId === orgId),
      listings: listings.length,
      projects: projects.filter(p => !['Completed', 'Cancelled', 'Archived'].includes(p.status)).length,
      delayedProjects: projects.filter(p => p.status === 'Delayed'),
      overdue,
      overdueAmount: overdue.reduce((s: number, i: any) => s + ((Number(i.totalAmount) || 0) - (Number(i.paidAmount) || 0)), 0),
      lowStock: items.filter(i => Number(i.availableStock) <= Number(i.minStockLevel)),
    };
  }, [tick, userSession?.orgId]);

  const attention: { key: string; icon: any; text: string; action: string; view: string }[] = [];
  if (!userSession?.verified) attention.push({ key: 'verify', icon: BadgeCheck, text: 'Your company is not verified yet. Verified companies are trusted more by buyers and suppliers.', action: 'Start verification', view: '__profile' });
  if (d.pendingRequests.length) attention.push({ key: 'conn', icon: Handshake, text: `${d.pendingRequests.length} connection request${d.pendingRequests.length === 1 ? '' : 's'} waiting for your reply.`, action: 'Review', view: 'network_dashboard' });
  if (d.unread) attention.push({ key: 'msg', icon: MessageSquare, text: `${d.unread} unread message${d.unread === 1 ? '' : 's'}.`, action: 'Open messages', view: 'messaging' });
  if (d.newLeads.length) attention.push({ key: 'leads', icon: ClipboardList, text: `${d.newLeads.length} new lead${d.newLeads.length === 1 ? '' : 's'} not yet assigned or contacted.`, action: 'Open leads', view: 'lead_management' });
  if (d.pendingBids.length) attention.push({ key: 'bids', icon: FileText, text: `${d.pendingBids.length} quotation${d.pendingBids.length === 1 ? '' : 's'} received on your RFQs, waiting for a decision.`, action: 'Review bids', view: 'rfq_management' });
  if (d.todayMeetings) attention.push({ key: 'meet', icon: Calendar, text: `${d.todayMeetings} meeting${d.todayMeetings === 1 ? '' : 's'} today.`, action: 'Open calendar', view: 'meetings' });
  if (d.overdue.length && has('finance')) attention.push({ key: 'overdue', icon: AlertTriangle, text: `${d.overdue.length} overdue invoice${d.overdue.length === 1 ? '' : 's'} worth ${inr(d.overdueAmount)}.`, action: 'Open finance', view: 'finance' });
  if (d.lowStock.length && has('inventory')) attention.push({ key: 'stock', icon: Package, text: `${d.lowStock.length} stock item${d.lowStock.length === 1 ? ' is' : 's are'} at or below the minimum level.`, action: 'Open inventory', view: 'inventory' });
  if (d.delayedProjects.length && has('projects')) attention.push({ key: 'proj', icon: Layers, text: `${d.delayedProjects.length} project${d.delayedProjects.length === 1 ? ' is' : 's are'} delayed.`, action: 'Open projects', view: 'projects' });

  const openProfile = () => {
    // The profile opens from the account menu; scroll the user there.
    showToast('Open your account menu (top right) and choose My Company Profile, then the Owner Portal tab.', 'info');
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    const text = newTask.trim();
    if (!text) return;
    setTasks(prev => [...prev, { id: `t-${Date.now()}`, text, done: false }]);
    setNewTask('');
  };

  const Tile = ({ label, value, note, view, icon: Icon }: { label: string; value: string | number; note?: string; view: string; icon: any }) => (
    <button type="button" onClick={() => setActiveViewMode(view)} className="text-left p-4 bg-slate-900/40 border border-slate-900 rounded-xl hover:border-emerald-500/40 transition-colors">
      <div className="flex items-center justify-between text-slate-500"><span className="text-xs">{label}</span><Icon className="w-4 h-4" /></div>
      <div className="text-2xl font-bold text-slate-100 mt-1">{value}</div>
      {note && <div className="text-[11px] text-slate-500">{note}</div>}
    </button>
  );

  const quick: { label: string; view: string; icon: any; show: boolean; run?: () => void }[] = [
    { label: 'Find companies', view: 'directory', icon: Users, show: true },
    { label: 'Post an RFQ', view: 'rfq_management', icon: FileText, show: has('rfq') },
    { label: 'List a product', view: 'marketplace', icon: ShoppingBag, show: has('marketplace') },
    { label: 'Post an opportunity', view: 'opportunities', icon: Briefcase, show: has('opportunities'), run: onTriggerCreateOpportunity },
    { label: 'Schedule a meeting', view: 'meetings', icon: Calendar, show: has('meetings') },
    { label: 'Invite your team', view: 'security_compliance', icon: Users, show: true },
  ];

  const fresh = d.connections + d.leads + d.listings + d.openRfqs + d.myBids.length === 0;

  return (
    <div className="space-y-6 text-xs text-slate-300" id="control-center">
      <header className="p-5 bg-slate-900/40 border border-slate-900 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-slate-500">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <h2 className="text-2xl font-bold text-slate-100 mt-1">Welcome, {userSession?.name || userSession?.email}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="font-semibold text-slate-200">{userSession?.organizationName}</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{userSession?.role.replace(/_/g, ' ').toLowerCase()}</span>
            {userSession?.verified ? (
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 flex items-center gap-1"><BadgeCheck className="w-3.5 h-3.5" />Verified</span>
            ) : (
              <button type="button" onClick={openProfile} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 hover:underline">Not verified</button>
            )}
            <button type="button" onClick={() => setActiveViewMode('analytics_subscription')} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-emerald-400 flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" />{userSession?.plan.name} plan</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {quick.filter(q => q.show).map(q => (
            <button key={q.label} type="button" onClick={() => { setActiveViewMode(q.view); q.run?.(); }} className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 hover:border-emerald-500/50 flex items-center gap-1.5">
              <q.icon className="w-3.5 h-3.5 text-emerald-500" />{q.label}
            </button>
          ))}
        </div>
      </header>

      {fresh && (
        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-slate-300 space-y-1">
          <div className="font-bold text-emerald-400">Getting started</div>
          <p>Complete your company profile so others can find you, then connect with companies in the directory, list what you sell or post what you need. Everything you do here is saved to your company.</p>
        </div>
      )}

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tile label="Connections" value={d.connections} note={d.pendingRequests.length ? `${d.pendingRequests.length} waiting` : undefined} view="network_dashboard" icon={Handshake} />
        <Tile label="Unread messages" value={d.unread} view="messaging" icon={MessageSquare} />
        <Tile label="Leads" value={d.leads} note={`${d.newLeads.length} new`} view="lead_management" icon={ClipboardList} />
        <Tile label="Meetings ahead" value={d.upcoming.length} note={`${d.todayMeetings} today`} view="meetings" icon={Calendar} />
        <Tile label="Your open RFQs" value={d.openRfqs} note={`${d.receivedBids.length} quotations received`} view="rfq_management" icon={FileText} />
        <Tile label="Quotations you sent" value={d.myBids.length} note={`${d.myBids.filter(b => b.status === 'Accepted').length} accepted`} view="rfq_management" icon={CheckCircle2} />
        <Tile label="Marketplace listings" value={d.listings} view="marketplace" icon={ShoppingBag} />
        {has('projects') ? <Tile label="Active projects" value={d.projects} note={d.delayedProjects.length ? `${d.delayedProjects.length} delayed` : undefined} view="projects" icon={Layers} /> : <Tile label="Team" value="Manage" view="security_compliance" icon={Users} />}
      </section>

      <div className="grid lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2 space-y-4">
          <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl space-y-3">
            <h3 className="font-bold text-slate-100 text-sm">Needs your attention</h3>
            {attention.length === 0 ? (
              <p className="text-slate-500">Nothing needs attention right now.</p>
            ) : (
              attention.map(a => (
                <div key={a.key} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-950 border border-slate-900">
                  <span className="flex items-start gap-2"><a.icon className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />{a.text}</span>
                  <button type="button" onClick={() => (a.view === '__profile' ? openProfile() : setActiveViewMode(a.view))} className="shrink-0 text-emerald-400 hover:underline font-semibold">{a.action}</button>
                </div>
              ))
            )}
          </div>

          {d.upcoming.length > 0 && (
            <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl space-y-2">
              <h3 className="font-bold text-slate-100 text-sm">Upcoming meetings</h3>
              {d.upcoming.slice(0, 5).map((m: any) => (
                <div key={m.id} className="flex justify-between gap-3 p-2.5 rounded-lg bg-slate-950 border border-slate-900">
                  <div><div className="text-slate-100 font-medium">{m.title}</div><div className="text-slate-500">{m.relatedCompany}</div></div>
                  <div className="text-right text-slate-400">{m.meetingDate}<br />{m.startTime}</div>
                </div>
              ))}
            </div>
          )}

          {d.receivedBids.length > 0 && (
            <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl space-y-2">
              <h3 className="font-bold text-slate-100 text-sm">Latest quotations on your RFQs</h3>
              {d.receivedBids.slice(0, 5).map((q: any) => (
                <div key={q.id} className="flex justify-between gap-3 p-2.5 rounded-lg bg-slate-950 border border-slate-900">
                  <div><div className="text-slate-100 font-medium">{q.companyName}</div><div className="text-slate-500">{q.quotationAmount} • {q.deliveryTimeline}</div></div>
                  <span className={q.status === 'Accepted' ? 'text-emerald-400' : q.status === 'Declined' ? 'text-red-400' : 'text-amber-400'}>{q.status}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl space-y-3">
            <h3 className="font-bold text-slate-100 text-sm">My to-do list</h3>
            <form onSubmit={addTask} className="flex gap-2">
              <input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Add a task" className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 outline-none focus:border-emerald-500" />
              <button type="submit" className="px-3 rounded-lg bg-emerald-500 text-slate-950 font-bold" aria-label="Add task"><Plus className="w-4 h-4" /></button>
            </form>
            {tasks.length === 0 && <p className="text-slate-500">No tasks yet.</p>}
            {tasks.map(t => (
              <div key={t.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-900">
                <input type="checkbox" checked={t.done} onChange={() => setTasks(prev => prev.map(x => (x.id === t.id ? { ...x, done: !x.done } : x)))} />
                <span className={`flex-1 ${t.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>{t.text}</span>
                <button type="button" onClick={() => setTasks(prev => prev.filter(x => x.id !== t.id))} className="text-slate-500 hover:text-red-400" aria-label="Delete task"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl space-y-2">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2"><Bell className="w-4 h-4 text-emerald-500" />Recent activity</h3>
            {activity.length === 0 && <p className="text-slate-500">Activity from your network appears here.</p>}
            {activity.map(a => (
              <div key={a.id} className="p-2 rounded-lg bg-slate-950 border border-slate-900">
                <div className="text-slate-200">{a.content}</div>
                <div className="text-slate-500 mt-0.5">{a.timestamp}</div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
