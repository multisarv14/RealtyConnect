import React, { useCallback, useEffect, useState } from 'react';
import { BadgeCheck, CreditCard, Flag, FileText } from 'lucide-react';
import { api, apiFetch, errorMessage, type Session } from '../lib/api';

interface Props {
  userSession: Session | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface VerificationItem { orgId: string; company: string; category: string; location: string; gstin: string; pan: string; cin: string; reraNumber: string; documents: { fileId: string; label: string }[]; submittedAt: string }
interface PaymentItem { id: string; invoiceNo: string; company: string; planName: string; cycle: string; total: number; requestedBy: string; createdAt: string }
interface ReportItem { id: string; reportedOrgId: string; reported: string; suspended: boolean; reporter: string; reportedBy: string; reason: string; details: string; createdAt: string }

const input = 'bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500';

export default function ReviewQueues({ userSession, showToast }: Props) {
  const can = (p: string) => !!userSession?.permissions.includes(p);
  const tabs = [
    ...(can('VERIFY_PROFILES') ? [{ id: 'verification', label: 'Verification', icon: BadgeCheck }] : []),
    ...(can('MANAGE_USERS') ? [{ id: 'payments', label: 'Payments', icon: CreditCard }, { id: 'reports', label: 'Reports', icon: Flag }] : [])
  ] as { id: 'verification' | 'payments' | 'reports'; label: string; icon: any }[];
  const [tab, setTab] = useState<'verification' | 'payments' | 'reports'>(tabs[0]?.id ?? 'verification');
  const [verifications, setVerifications] = useState<VerificationItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [paid, setPaid] = useState<Record<string, { method: string; reference: string }>>({});

  const load = useCallback(() => {
    const fail = (err: unknown) => showToast(errorMessage(err), 'error');
    if (can('VERIFY_PROFILES')) api<VerificationItem[]>('GET', '/verification/admin/queue').then(setVerifications).catch(fail);
    if (can('MANAGE_USERS')) {
      api<PaymentItem[]>('GET', '/billing/admin/pending').then(setPayments).catch(fail);
      api<ReportItem[]>('GET', '/moderation/reports').then(setReports).catch(fail);
    }
  }, [userSession?.role]);

  useEffect(load, [load]);

  const act = (promise: Promise<unknown>, done: string) =>
    promise.then(() => { showToast(done, 'success'); load(); }).catch(err => showToast(errorMessage(err), 'error'));

  const openDoc = async (fileId: string, label: string) => {
    const res = await apiFetch(`/files/${fileId}/download`);
    if (!res.ok) return showToast('The document could not be opened.', 'error');
    const url = URL.createObjectURL(await res.blob());
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    void label;
  };

  if (tabs.length === 0) return <p className="p-6 text-xs text-slate-400">You do not have review permissions.</p>;

  const empty = (text: string) => <p className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">{text}</p>;

  return (
    <div className="space-y-4 text-xs text-slate-300" id="review-queues">
      <div className="flex gap-1 p-1 bg-slate-950 border border-slate-900 rounded-xl w-fit">
        {tabs.map(t => (
          <button key={t.id} type="button" id={`review-tab-${t.id}`} onClick={() => setTab(t.id)} className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 ${tab === t.id ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
            {t.id === 'verification' && verifications.length > 0 && <span className="px-1.5 rounded-full bg-slate-900 text-emerald-400">{verifications.length}</span>}
            {t.id === 'payments' && payments.length > 0 && <span className="px-1.5 rounded-full bg-slate-900 text-emerald-400">{payments.length}</span>}
            {t.id === 'reports' && reports.length > 0 && <span className="px-1.5 rounded-full bg-slate-900 text-emerald-400">{reports.length}</span>}
          </button>
        ))}
      </div>

      {tab === 'verification' && (verifications.length === 0 ? empty('No companies are waiting for verification.') : verifications.map(v => (
        <div key={v.orgId} className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl space-y-3">
          <div className="flex justify-between gap-3 flex-wrap">
            <div><div className="font-bold text-slate-100 text-sm">{v.company}</div><div className="text-slate-500">{v.category} • {v.location} • submitted {new Date(v.submittedAt).toLocaleDateString('en-IN')}</div></div>
            <div className="font-mono text-slate-300 space-y-0.5"><div>GSTIN {v.gstin}</div><div>PAN {v.pan}</div>{v.cin && <div>CIN {v.cin}</div>}{v.reraNumber && <div>RERA {v.reraNumber}</div>}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {v.documents.map(d => <button key={d.fileId} type="button" onClick={() => openDoc(d.fileId, d.label)} className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 flex items-center gap-1.5 hover:underline"><FileText className="w-3.5 h-3.5" />{d.label}</button>)}
          </div>
          <div className="flex flex-wrap gap-2">
            <input className={`${input} flex-1 min-w-[12rem]`} placeholder="Note to the company (required to reject)" value={notes[v.orgId] ?? ''} onChange={e => setNotes({ ...notes, [v.orgId]: e.target.value })} />
            <button type="button" onClick={() => act(api('POST', `/verification/admin/${v.orgId}/approve`, { note: notes[v.orgId] ?? '' }), `${v.company} is verified.`)} className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold">Approve</button>
            <button type="button" onClick={() => act(api('POST', `/verification/admin/${v.orgId}/reject`, { note: notes[v.orgId] ?? '' }), 'Sent back for changes.')} className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-red-300 font-semibold">Ask for changes</button>
          </div>
        </div>
      )))}

      {tab === 'payments' && (payments.length === 0 ? empty('No payments are waiting for confirmation.') : payments.map(p => {
        const entry = paid[p.id] ?? { method: 'Bank transfer', reference: '' };
        return (
          <div key={p.id} className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl space-y-3">
            <div className="flex justify-between gap-3 flex-wrap">
              <div><div className="font-bold text-slate-100 text-sm">{p.company}</div><div className="text-slate-500">{p.invoiceNo} • {p.planName} ({p.cycle}) • requested by {p.requestedBy}</div></div>
              <div className="text-lg font-bold text-slate-100">₹{p.total.toLocaleString('en-IN')}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <select className={input} value={entry.method} onChange={e => setPaid({ ...paid, [p.id]: { ...entry, method: e.target.value } })}>{['Bank transfer', 'UPI', 'Cheque', 'Cash'].map(m => <option key={m}>{m}</option>)}</select>
              <input className={`${input} flex-1 min-w-[12rem]`} placeholder="Bank reference / UTR / cheque number" value={entry.reference} onChange={e => setPaid({ ...paid, [p.id]: { ...entry, reference: e.target.value } })} />
              <button type="button" onClick={() => act(api('POST', `/billing/admin/${p.id}/confirm`, entry), `${p.invoiceNo} confirmed; the plan is active.`)} className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold">Confirm payment</button>
              <button type="button" onClick={() => act(api('POST', `/billing/admin/${p.id}/reject`), 'Invoice rejected.')} className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">Reject</button>
            </div>
          </div>
        );
      }))}

      {tab === 'reports' && (reports.length === 0 ? empty('No open reports.') : reports.map(r => (
        <div key={r.id} className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl space-y-3">
          <div><div className="font-bold text-slate-100 text-sm">{r.reported}</div><div className="text-slate-500">Reported by {r.reporter} ({r.reportedBy}) • {new Date(r.createdAt).toLocaleDateString('en-IN')}</div></div>
          <p><strong className="text-slate-200">{r.reason}.</strong> {r.details}</p>
          <div className="flex flex-wrap gap-2">
            <input className={`${input} flex-1 min-w-[12rem]`} placeholder="Note" value={notes[r.id] ?? ''} onChange={e => setNotes({ ...notes, [r.id]: e.target.value })} />
            <button type="button" onClick={() => act(api('POST', `/moderation/reports/${r.id}/resolve`, { action: 'suspend', note: notes[r.id] ?? '' }), `${r.reported} is suspended.`)} className="px-4 py-2 rounded-lg bg-red-500/90 text-white font-bold">Suspend company</button>
            <button type="button" onClick={() => act(api('POST', `/moderation/reports/${r.id}/resolve`, { action: 'dismiss', note: notes[r.id] ?? '' }), 'Report dismissed.')} className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">Dismiss</button>
          </div>
        </div>
      )))}
    </div>
  );
}
