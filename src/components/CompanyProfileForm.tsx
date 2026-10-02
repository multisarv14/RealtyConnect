import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { DIRECTORY_CATEGORIES } from '../../shared/roles';
import type { CompanyProfile } from '../lib/companies';

interface CompanyProfileFormProps {
  profile: CompanyProfile;
  // Receives only the fields this form edits; the caller persists them.
  onSave: (changes: Partial<CompanyProfile>) => void;
}

const TEXT_FIELDS = [
  { key: 'name', label: 'Company Name', placeholder: 'Registered company name' },
  { key: 'tagline', label: 'Tagline', placeholder: 'One line describing what you do' },
  { key: 'city', label: 'City', placeholder: 'Mumbai' },
  { key: 'state', label: 'State', placeholder: 'Maharashtra' },
  { key: 'yearEstablished', label: 'Year Established', placeholder: '2012' },
  { key: 'companyType', label: 'Company Type', placeholder: 'Private Limited Company' },
  { key: 'website', label: 'Website', placeholder: 'www.example.com' },
  { key: 'email', label: 'Business Email', placeholder: 'sales@example.com' },
  { key: 'phone', label: 'Phone', placeholder: '+91 98200 00000' },
  { key: 'whatsapp', label: 'WhatsApp', placeholder: '+91 98200 00000' },
  { key: 'businessHours', label: 'Business Hours', placeholder: '09:30 AM - 06:30 PM (Mon-Sat)' },
  { key: 'addressCorporate', label: 'Registered Address', placeholder: 'Building, street, area, city, PIN' }
] as const;

const LONG_TEXT_FIELDS = [
  { key: 'description', label: 'Company Description', placeholder: 'What your company does, for whom, and where.' },
  { key: 'vision', label: 'Vision', placeholder: '' },
  { key: 'mission', label: 'Mission', placeholder: '' }
] as const;

// Edited as one entry per line.
const LIST_FIELDS = [
  { key: 'products', label: 'Products' },
  { key: 'services', label: 'Services' },
  { key: 'brands', label: 'Brands Dealt In' },
  { key: 'specializations', label: 'Specializations' },
  { key: 'coreStrengths', label: 'Core Strengths' },
  { key: 'industriesServed', label: 'Industries Served' },
  { key: 'workingCities', label: 'Cities Served' },
  { key: 'workingStates', label: 'States Served' },
  { key: 'languages', label: 'Languages' }
] as const;

type Draft = Record<string, string>;

function toDraft(profile: CompanyProfile): Draft {
  const draft: Draft = { category: profile.category };
  for (const f of [...TEXT_FIELDS, ...LONG_TEXT_FIELDS]) draft[f.key] = (profile as any)[f.key] || '';
  for (const f of LIST_FIELDS) draft[f.key] = ((profile as any)[f.key] || []).join('\n');
  return draft;
}

const inputClass = 'w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none transition-all';
const labelClass = 'block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1';

export default function CompanyProfileForm({ profile, onSave }: CompanyProfileFormProps) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(profile));
  const set = (key: string, value: string) => setDraft(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const changes: Record<string, unknown> = { category: draft.category };
    for (const f of [...TEXT_FIELDS, ...LONG_TEXT_FIELDS]) changes[f.key] = draft[f.key].trim();
    for (const f of LIST_FIELDS) {
      changes[f.key] = draft[f.key].split('\n').map(item => item.trim()).filter(Boolean);
    }
    onSave(changes as Partial<CompanyProfile>);
  };

  return (
    <form onSubmit={handleSubmit} id="company-profile-form" className="bg-slate-900/30 p-4 rounded-xl border border-slate-900 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-900 pb-2">
        <h4 className="text-white font-bold text-xs uppercase tracking-wider font-mono">Company Details</h4>
        <span className="text-[10px] text-slate-500">Shown on your public profile and in the B2B directory</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-sans">
        <div>
          <label htmlFor="cp-category" className={labelClass}>Directory Category</label>
          <select id="cp-category" value={draft.category} onChange={e => set('category', e.target.value)} className={inputClass}>
            {DIRECTORY_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        {TEXT_FIELDS.map(f => (
          <div key={f.key}>
            <label htmlFor={`cp-${f.key}`} className={labelClass}>{f.label}</label>
            <input
              id={`cp-${f.key}`}
              type="text"
              required={f.key === 'name'}
              value={draft[f.key]}
              onChange={e => set(f.key, e.target.value)}
              placeholder={f.placeholder}
              className={inputClass}
            />
          </div>
        ))}
      </div>

      <div className="space-y-3 font-sans">
        {LONG_TEXT_FIELDS.map(f => (
          <div key={f.key}>
            <label htmlFor={`cp-${f.key}`} className={labelClass}>{f.label}</label>
            <textarea
              id={`cp-${f.key}`}
              rows={f.key === 'description' ? 3 : 2}
              value={draft[f.key]}
              onChange={e => set(f.key, e.target.value)}
              placeholder={f.placeholder}
              className={inputClass}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-sans">
        {LIST_FIELDS.map(f => (
          <div key={f.key}>
            <label htmlFor={`cp-${f.key}`} className={labelClass}>{f.label} <span className="normal-case text-slate-600">(one per line)</span></label>
            <textarea
              id={`cp-${f.key}`}
              rows={3}
              value={draft[f.key]}
              onChange={e => set(f.key, e.target.value)}
              className={inputClass}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-1.5 rounded-lg text-xs flex items-center gap-1.5 font-mono transition-all">
          <Save className="w-3.5 h-3.5" />
          Save Company Details
        </button>
      </div>
    </form>
  );
}
