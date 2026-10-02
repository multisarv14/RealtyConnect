/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Database, 
  Plus, 
  Trash2, 
  Check, 
  ShieldAlert, 
  Search, 
  Info,
  MapPin,
  Scale,
  Calendar,
  Grid
} from 'lucide-react';
import { MasterDataCategory } from '../types';
import { api, errorMessage } from '../lib/api';

interface MastersManagerProps {
  onLogTriggered: (action: string, entity: string, entityId: string, status: 'SUCCESS' | 'FAILURE' | 'WARNING', details: string) => void;
  userSession: { email: string; role: string; permissions: string[] } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const INITIAL_CATEGORIES: MasterDataCategory[] = [
  {
    key: 'GEOGRAPHY_CITY',
    name: 'Geographical Cities',
    description: 'Permitted operational cities for local real estate projects and vendor networks.',
    items: [
      { id: '1', code: 'MUMBAI', name: 'Mumbai', isSystem: true },
      { id: '2', code: 'PUNE', name: 'Pune', isSystem: true },
      { id: '3', code: 'BANGALORE', name: 'Bangalore', isSystem: false },
      { id: '4', code: 'DELHI_NCR', name: 'Delhi NCR', isSystem: true }
    ]
  },
  {
    key: 'MEASUREMENT_UNIT',
    name: 'Units of Measurement',
    description: 'Standard standardized units utilized for physical works, estimations, and material trading.',
    items: [
      { id: '10', code: 'SQ_FT', name: 'Square Feet', isSystem: true },
      { id: '11', code: 'SQ_MT', name: 'Square Meters', isSystem: true },
      { id: '12', code: 'TON', name: 'Metric Ton', isSystem: false },
      { id: '13', code: 'BRASS', name: 'Brass (Volume)', isSystem: true }
    ]
  },
  {
    key: 'PROJECT_STAGES',
    name: 'Real Estate Project Stages',
    description: 'System-wide construction process stages for tracking project development.',
    items: [
      { id: '20', code: 'PLANNING', name: 'Pre-Construction Planning', isSystem: true },
      { id: '21', code: 'STRUCTURAL', name: 'Structural Civil Work', isSystem: true },
      { id: '22', code: 'MEP_INSTALL', name: 'MEP & Utility Installations', isSystem: false },
      { id: '23', code: 'FINISHING', name: 'Interior Finishing Trades', isSystem: false }
    ]
  }
];

export default function MastersManager({ onLogTriggered, userSession, showToast }: MastersManagerProps) {
  // The built-in list is only a placeholder until the server's registry arrives.
  const [categories, setCategories] = useState<MasterDataCategory[]>(INITIAL_CATEGORIES);
  const [activeCategoryKey, setActiveCategoryKey] = useState<string>('GEOGRAPHY_CITY');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Master Item form state
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');

  const loadMasters = useCallback(() => {
    return api<MasterDataCategory[]>('GET', '/masters')
      .then(setCategories)
      .catch(err => showToast(errorMessage(err), 'error'));
  }, [showToast]);

  useEffect(() => {
    void loadMasters();
  }, [loadMasters]);

  const activeCategory = categories.find(c => c.key === activeCategoryKey) ?? categories[0];

  const handleAddMaster = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCode.trim() || !newName.trim()) return;

    // RBAC check: Must have MANAGE_COMMON_MASTERS permission (only Admin has by default).
    // This only saves a round trip - the server enforces the same rule.
    const canManage = userSession?.permissions.includes('MANAGE_COMMON_MASTERS');

    if (!canManage) {
      onLogTriggered(
        'SECURITY_AUTHORIZATION_BREACH_ATTEMPT',
        'common_masters',
        activeCategoryKey,
        'FAILURE',
        `Access Denied: User "${userSession?.email || 'Anonymous'}" attempted to write common master "${newCode}" under category "${activeCategoryKey}" without MANAGE_COMMON_MASTERS permission.`
      );
      showToast('Security Alert: 403 Forbidden. You do not hold sufficient privileges (MANAGE_COMMON_MASTERS) to modify global registry masters. Access Denied.', 'error');
      return;
    }

    api('POST', '/masters', { category: activeCategoryKey, code: newCode.trim(), name: newName.trim() })
      .then(() => {
        setNewCode('');
        setNewName('');
        return loadMasters();
      })
      .catch(err => showToast(errorMessage(err), 'error'));
  };

  const handleDeleteMaster = (id: string, code: string, name: string) => {
    // RBAC check
    const canManage = userSession?.permissions.includes('MANAGE_COMMON_MASTERS');

    if (!canManage) {
      onLogTriggered(
        'SECURITY_AUTHORIZATION_BREACH_ATTEMPT',
        'common_masters',
        id,
        'FAILURE',
        `Access Denied: User "${userSession?.email || 'Anonymous'}" attempted to delete common master "${code}" without authorization.`
      );
      showToast('Security Alert: 403 Forbidden. You do not hold sufficient privileges (MANAGE_COMMON_MASTERS) to delete registry items.', 'error');
      return;
    }

    // System masters are locked; the server refuses (and audits) the attempt.
    api('DELETE', `/masters/${encodeURIComponent(id)}`)
      .then(() => loadMasters())
      .catch(err => showToast(errorMessage(err), 'error'));
  };

  const filteredItems = activeCategory.items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" id="masters-manager-root">
      {/* Categories Navigator */}
      <div className="lg:col-span-4 flex flex-col gap-3">
        <span className="text-[10px] text-slate-500 font-mono block uppercase px-1 tracking-wider">Select Common Master Registry</span>
        <div className="space-y-2">
          {categories.map(cat => {
            const isActive = cat.key === activeCategoryKey;
            return (
              <button
                key={cat.key}
                id={`btn-select-cat-${cat.key}`}
                onClick={() => {
                  setActiveCategoryKey(cat.key);
                  setSearchQuery('');
                }}
                className={`w-full p-3.5 rounded-lg border text-left transition-all duration-150 flex items-start gap-3 ${
                  isActive 
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-100 shadow-sm' 
                    : 'bg-slate-900/20 hover:bg-slate-900/40 border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-250'
                }`}
              >
                <div className={`p-1.5 rounded-md mt-0.5 ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-850 text-slate-400'}`}>
                  {cat.key === 'GEOGRAPHY_CITY' && <MapPin className="w-4 h-4" />}
                  {cat.key === 'MEASUREMENT_UNIT' && <Scale className="w-4 h-4" />}
                  {cat.key === 'PROJECT_STAGES' && <Calendar className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-xs leading-none">{cat.name}</p>
                  <p className="text-[10px] text-slate-500 truncate mt-1.5 leading-relaxed">{cat.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lookup Table & Entry Registry */}
      <div className="lg:col-span-8 p-5 bg-slate-900/30 border border-slate-800 rounded-xl flex flex-col justify-between" id="common-masters-workspace">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-3 border-b border-slate-900">
            <div>
              <h3 className="font-display font-bold text-slate-100 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                Registry Workspace: {activeCategory.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage global parameters referenced by the CRM, ERP, and Vendor domains.
              </p>
            </div>

            {/* Simple Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Filter entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded px-2.5 py-1 text-xs text-slate-200 pl-8 outline-none transition-all placeholder:text-slate-650"
              />
              <Search className="absolute left-2.5 top-1.5 w-3.5 h-3.5 text-slate-650" />
            </div>
          </div>

          {/* Master Item List */}
          <div className="space-y-1.5 mt-4 max-h-[190px] overflow-y-auto pr-1">
            {filteredItems.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs font-mono">
                No lookup records match filter parameters.
              </div>
            ) : (
              filteredItems.map(item => (
                <div 
                  key={item.id}
                  id={`master-item-${item.id}`}
                  className="p-2 bg-slate-950/60 border border-slate-900 hover:border-slate-850 rounded flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-250">{item.name}</span>
                    <span className="font-mono text-[9px] text-slate-500 block uppercase mt-0.5">ID_CODE: {item.code}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {item.isSystem ? (
                      <span className="text-[9px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded flex items-center gap-1 font-bold">
                        System Lock
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDeleteMaster(item.id, item.code, item.name)}
                        id={`btn-delete-master-${item.id}`}
                        className="text-slate-600 hover:text-red-400 p-1 rounded hover:bg-slate-900 transition-all"
                        title="Delete lookup record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Form to insert new Master Item */}
        <div className="mt-5 border-t border-slate-900 pt-4">
          <span className="text-[10px] text-slate-500 font-mono block mb-2 uppercase">Append Lookup Entry</span>
          
          <form onSubmit={handleAddMaster} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5" id="form-add-master">
            <input
              type="text"
              required
              aria-label="New master entry identifier code"
              placeholder="e.g. SQUARE_FEET (Code)"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded px-3 py-1.5 text-xs text-slate-200 outline-none transition-all font-mono uppercase"
            />
            <input
              type="text"
              required
              aria-label="New master entry friendly name"
              placeholder="e.g. Square Feet (Name)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded px-3 py-1.5 text-xs text-slate-200 outline-none transition-all font-sans"
            />
            <button
              type="submit"
              id="btn-add-master-submit"
              className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold py-1.5 px-3 rounded text-xs transition-colors flex items-center justify-center gap-1 font-mono"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              Write Master
            </button>
          </form>

          {/* Security Alert warning box for non-Admins */}
          {userSession && !userSession.permissions.includes('MANAGE_COMMON_MASTERS') && (
            <div className="mt-3.5 p-3.5 bg-red-950/20 border border-red-900/40 rounded-lg flex items-start gap-2 text-[10px] text-red-400 font-mono">
              <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>
                <strong>RBAC Warning:</strong> Your current session identity ({userSession.role}) is unauthorized to modify global lookups. Submitting will test API privilege containment and register security blocks.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
