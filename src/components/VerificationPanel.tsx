import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BadgeCheck, FileUp, Send, Trash2, Clock, AlertTriangle } from 'lucide-react';
import { api, apiFetch, errorMessage, ApiError } from '../lib/api';

interface Doc {
  fileId: string;
  label: string;
}

interface Record_ {
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  gstin: string;
  pan: string;
  cin: string;
  reraNumber: string;
  documents: Doc[];
  note: string;
}

interface State {
  verified: boolean;
  record: Record_;
  requiredDocuments: string[];
  reraExpected: boolean;
}

const input = 'w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none';
const label = 'block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1';

export default function VerificationPanel({ showToast, canEdit }: { showToast: (m: string, t?: 'success' | 'error' | 'info') => void; canEdit: boolean }) {
  const [state, setState] = useState<State | null>(null);
  const [draft, setDraft] = useState<Record_ | null>(null);
  const [uploading, setUploading] = useState(false);
  const [docLabel, setDocLabel] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    api<State>('GET', '/verification')
      .then(s => {
        setState(s);
        setDraft(s.record);
        setDocLabel(prev => prev || s.requiredDocuments[0]);
      })
      .catch(err => showToast(errorMessage(err), 'error'));
  }, [showToast]);

  useEffect(load, [load]);
  if (!state || !draft) return null;

  const locked = !canEdit || draft.status === 'submitted' || state.verified;
  const set = (k: keyof Record_, v: string) => setDraft({ ...draft, [k]: v } as Record_);

  const save = async (): Promise<boolean> => {
    try {
      await api('PUT', '/verification', { gstin: draft.gstin, pan: draft.pan, cin: draft.cin, reraNumber: draft.reraNumber, documents: draft.documents });
      return true;
    } catch (err) {
      showToast(errorMessage(err), 'error');
      return false;
    }
  };

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file, file.name);
      const res = await apiFetch('/files', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiError(res.status, data?.error || 'Upload failed.', data);
      // A document can be attached once it has cleared the upload checks.
      for (let i = 0; i < 20; i++) {
        const f = await api<{ status: string }>('GET', `/files/${data.id}`);
        if (f.status === 'success') break;
        await new Promise(r => setTimeout(r, 1000));
      }
      setDraft(d => (d ? { ...d, documents: [...d.documents, { fileId: data.id, label: docLabel }] } : d));
      showToast(`${file.name} attached as "${docLabel}". Save to keep it.`, 'success');
    } catch (err) {
      showToast(errorMessage(err), 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const submit = async () => {
    if (!(await save())) return;
    try {
      await api('POST', '/verification/submit');
      showToast('Submitted for review. We will notify you of the decision.', 'success');
      load();
    } catch (err) {
      showToast(errorMessage(err), 'error');
    }
  };

  const badge = state.verified ? (
    <span className="flex items-center gap-1 text-emerald-400 font-semibold"><BadgeCheck className="w-4 h-4" />Verified</span>
  ) : draft.status === 'submitted' ? (
    <span className="flex items-center gap-1 text-amber-400 font-semibold"><Clock className="w-4 h-4" />Under review</span>
  ) : draft.status === 'rejected' ? (
    <span className="flex items-center gap-1 text-red-400 font-semibold"><AlertTriangle className="w-4 h-4" />Changes needed</span>
  ) : (
    <span className="text-slate-400 font-semibold">Not verified</span>
  );

  return (
    <section className="bg-slate-900/30 p-4 rounded-xl border border-slate-900 space-y-4" id="verification-panel">
      <div className="flex items-center justify-between border-b border-slate-900 pb-2">
        <h4 className="text-white font-bold text-xs uppercase tracking-wider font-mono">Company verification</h4>
        {badge}
      </div>
      <p className="text-xs text-slate-400">
        A verified badge tells other companies you are a registered business. Enter your numbers and attach the documents; our team compares them and approves or tells you what to fix.
      </p>
      {draft.status === 'rejected' && draft.note && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">Reviewer note: {draft.note}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div><label className={label} htmlFor="v-gstin">GSTIN</label><input id="v-gstin" disabled={locked} className={input} value={draft.gstin} onChange={e => set('gstin', e.target.value.toUpperCase())} placeholder="27AAPFU0939F1ZV" maxLength={15} /></div>
        <div><label className={label} htmlFor="v-pan">PAN</label><input id="v-pan" disabled={locked} className={input} value={draft.pan} onChange={e => set('pan', e.target.value.toUpperCase())} placeholder="AAPFU0939F" maxLength={10} /></div>
        <div><label className={label} htmlFor="v-cin">CIN (companies)</label><input id="v-cin" disabled={locked} className={input} value={draft.cin} onChange={e => set('cin', e.target.value.toUpperCase())} placeholder="U45200MH2012PTC184120" maxLength={21} /></div>
        <div><label className={label} htmlFor="v-rera">RERA registration{state.reraExpected ? '' : ' (if applicable)'}</label><input id="v-rera" disabled={locked} className={input} value={draft.reraNumber} onChange={e => set('reraNumber', e.target.value)} placeholder="Registration number" /></div>
      </div>

      <div className="space-y-2">
        <div className={label}>Supporting documents (PDF, PNG or JPEG)</div>
        {draft.documents.length === 0 && <p className="text-xs text-slate-500">Nothing attached. Required: {state.requiredDocuments.join(', ')}.</p>}
        {draft.documents.map(d => (
          <div key={d.fileId} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950 border border-slate-900">
            <span className="text-slate-200">{d.label}</span>
            {!locked && <button type="button" onClick={() => setDraft({ ...draft, documents: draft.documents.filter(x => x.fileId !== d.fileId) })} className="text-slate-500 hover:text-red-400" title="Remove"><Trash2 className="w-3.5 h-3.5" /></button>}
          </div>
        ))}
        {!locked && (
          <div className="flex flex-wrap gap-2 items-center">
            <select value={docLabel} onChange={e => setDocLabel(e.target.value)} className={`${input} !w-auto`}>
              {[...state.requiredDocuments, 'RERA registration certificate', 'Other supporting document'].map(l => <option key={l}>{l}</option>)}
            </select>
            <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg" hidden onChange={e => e.target.files?.[0] && upload(e.target.files[0])} />
            <button type="button" disabled={uploading} onClick={() => fileRef.current?.click()} className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs flex items-center gap-1.5 disabled:opacity-50">
              <FileUp className="w-3.5 h-3.5" />{uploading ? 'Uploading...' : 'Attach document'}
            </button>
          </div>
        )}
      </div>

      {!locked && (
        <div className="flex gap-2 justify-end">
          <button type="button" disabled={uploading} onClick={async () => { if (await save()) { showToast('Draft saved.', 'success'); load(); } }} className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold disabled:opacity-50">Save draft</button>
          <button type="button" disabled={uploading} onClick={submit} className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"><Send className="w-3.5 h-3.5" />Submit for review</button>
        </div>
      )}
      {!canEdit && !state.verified && <p className="text-xs text-slate-500">Only the company owner or an administrator can submit verification.</p>}
    </section>
  );
}
