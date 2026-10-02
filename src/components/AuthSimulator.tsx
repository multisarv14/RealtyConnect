/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  User, 
  Shield, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Clock
} from 'lucide-react';
import { STAKEHOLDER_ROLES } from '../data/blueprint';
import { api, errorMessage, type AuthMeta, type Session } from '../lib/api';

interface AuthGatewayProps {
  userSession: Session | null;
  authMeta: AuthMeta | null;
  onLogin: (email: string, password: string) => Promise<void>;
  onLogout: () => Promise<void>;
  onSwitchRole: (role: string) => Promise<void>;
  // Called after the role matrix was changed on the server.
  onPermissionsChanged: () => void;
  maintenanceMode: boolean;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface RoleRecord {
  code: string;
  permissions: string[];
}

export default function AuthGateway({ userSession, authMeta, onLogin, onLogout, onSwitchRole, onPermissionsChanged, maintenanceMode, showToast }: AuthGatewayProps) {
  // Authentication Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Role -> permissions. The built-in table is shown to visitors; signed-in users see the live matrix.
  const [customRolesPermissions, setCustomRolesPermissions] = useState<{ [role: string]: string[] }>(STAKEHOLDER_ROLES);
  const [activeMatrixRole, setActiveMatrixRole] = useState<string>('ADMIN');

  useEffect(() => {
    if (!userSession) {
      setCustomRolesPermissions(STAKEHOLDER_ROLES);
      return;
    }
    let cancelled = false;
    api<RoleRecord[]>('GET', '/roles')
      .then(roles => {
        if (!cancelled) setCustomRolesPermissions(Object.fromEntries(roles.map(r => [r.code, r.permissions])));
      })
      .catch(err => showToast(errorMessage(err), 'error'));
    return () => {
      cancelled = true;
    };
  }, [userSession?.id]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      // Lockout (AUTH-02) and maintenance-mode rules are enforced, and audited, by the server.
      await onLogin(email.trim(), password);
      setPassword('');
    } catch (err) {
      showToast(`Authentication Failure: ${errorMessage(err)}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleSwitch = (newRole: string) => {
    if (!userSession || newRole === userSession.role) return;
    onSwitchRole(newRole).catch(err => showToast(errorMessage(err), 'error'));
  };

  const handleLogout = () => {
    setEmail('');
    setPassword('');
    void onLogout();
  };

  const togglePermissionInMatrix = (role: string, permission: string) => {
    if (!userSession?.permissions.includes('MANAGE_ROLES')) {
      showToast('Security Alert: 403 Forbidden. Only users holding MANAGE_ROLES permission (ADMIN role) may alter the access matrix.', 'error');
      return;
    }
    const current = customRolesPermissions[role] || [];
    const updatedPermissions = current.includes(permission)
      ? current.filter(p => p !== permission)
      : [...current, permission];

    api<RoleRecord>('PUT', `/roles/${encodeURIComponent(role)}/permissions`, { permissions: updatedPermissions })
      .then(saved => {
        setCustomRolesPermissions(prev => ({ ...prev, [saved.code]: saved.permissions }));
        onPermissionsChanged();
      })
      .catch(err => showToast(errorMessage(err), 'error'));
  };

  // List of all unique permission tags across system
  const allSystemPermissions = [
    { code: 'CREATE_PROJECT', name: 'Create Projects', module: 'PROJECT' },
    { code: 'VIEW_VENDORS', name: 'Search & View Vendors', module: 'VENDORS' },
    { code: 'CREATE_RFQ', name: 'Publish RFQs', module: 'PROCUREMENT' },
    { code: 'VIEW_PROPOSALS', name: 'View Commercial Bids', module: 'PROCUREMENT' },
    { code: 'SUBMIT_PROPOSAL', name: 'Submit Proposals', module: 'MARKETPLACE' },
    { code: 'VIEW_AUDIT_LOGS', name: 'Review Cryptographic Logs', module: 'FOUNDATION' },
    { code: 'MANAGE_SYSTEM_CONFIGS', name: 'Alter System Configuration', module: 'FOUNDATION' },
    { code: 'MANAGE_COMMON_MASTERS', name: 'Alter Global Masters', module: 'FOUNDATION' },
    { code: 'UPLOAD_BLUEPRINTS', name: 'Upload High-Fidelity Files', module: 'FILES' },
    { code: 'VIEW_ALL_FILES', name: 'Access Restricted Files', module: 'FILES' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" id="auth-gateway-root">
      {/* Auth Form and User Selector */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        <div className="p-5 bg-slate-900/30 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              Unified Identity Console
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Secure credential gateway with role context, lockout controls, and session governance.
            </p>
          </div>

          {!userSession ? (
            <form onSubmit={handleLogin} className="space-y-3.5 mt-5" id="form-login">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Business Email</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded px-3 py-2 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-650"
                  />
                  <User className="absolute right-3 top-2.5 w-4 h-4 text-slate-650" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Access Credentials</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded px-3 py-2 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-650"
                  />
                  <Lock className="absolute right-3 top-2.5 w-4 h-4 text-slate-650" />
                </div>
              </div>

              <button
                type="submit"
                id="btn-login-submit"
                disabled={submitting}
                className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-semibold py-2 px-4 rounded text-sm transition-colors shadow-lg"
              >
                Authenticate Identity
              </button>
            </form>
          ) : (
            <div className="space-y-4 mt-5" id="logged-in-profile">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono">Authenticated as</span>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">{userSession.email}</p>
                </div>
                <Unlock className="w-5 h-5 text-emerald-400" />
              </div>

              {/* Multi Role Selector */}
              <div className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-lg">
                <span className="text-[10px] text-slate-500 font-mono block mb-1.5 uppercase">Identity Selector (Rule AUTH-06)</span>
                <div className="flex flex-wrap gap-1.5">
                  {userSession.roles.map(role => {
                    const isActive = userSession.role === role;
                    return (
                      <button
                        key={role}
                        id={`btn-select-role-${role}`}
                        onClick={() => handleRoleSwitch(role)}
                        className={`px-3 py-1 text-xs font-semibold rounded font-mono transition-all duration-150 ${
                          isActive 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/40' 
                            : 'bg-slate-900 hover:bg-slate-850 text-slate-400 border border-slate-800/80'
                        }`}
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  Swapping roles swaps permission tokens, generating security traces in audit logs.
                </p>
              </div>

              {/* Session monitoring details */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-950 border border-slate-850 rounded flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-yellow-400" />
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-mono">Access Token Life</span>
                    <span className="font-mono font-semibold text-slate-200">15 min, auto-renewed</span>
                  </div>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-850 rounded flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-mono">Active Scope</span>
                    <span className="font-mono font-semibold text-slate-200">
                      {userSession.permissions.length} Perms
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleLogout()}
                id="btn-logout"
                className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 hover:text-white py-2 px-4 rounded text-xs transition-all font-mono"
              >
                Terminate Active Session
              </button>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-900/10 border border-slate-850 rounded-xl" id="identity-profiles">
          <h4 className="font-display font-medium text-xs text-slate-400 uppercase tracking-wider mb-3">Authorized Identity Profiles</h4>
          {authMeta?.demoMode ? (
            <div className="space-y-2">
              {authMeta.demoAccounts.map(account => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(authMeta.demoPassword || '');
                  }}
                  className="w-full text-left p-2.5 rounded border text-xs font-mono transition-all bg-slate-900/30 border-slate-800/60 hover:border-slate-700"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-200">{account.email}</span>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                      {account.role}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-450 text-[10px]">
                    <span>Demo account: <span className="text-slate-300 font-bold">click to fill credentials</span></span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Demo identities are disabled on this server. Sign in with your own account.
            </p>
          )}
          {maintenanceMode && (
            <p className="text-[10px] text-red-400 font-mono mt-3 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Maintenance Mode: only administrator identities can sign in.
            </p>
          )}
        </div>
      </div>

      {/* RBAC Permission Matrix */}
      <div className="lg:col-span-7 p-5 bg-slate-900/30 border border-slate-800 rounded-xl flex flex-col justify-between" id="rbac-permission-matrix">
        <div>
          <h3 className="font-display font-bold text-slate-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            Central RBAC Authorization Matrix
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Standard permissions are bound to roles. As an Administrator, toggle checkboxes to dynamically update the system access policy at runtime.
          </p>
        </div>

        {/* Matrix Role Selector tabs */}
        <div className="flex flex-wrap gap-1 p-1 bg-slate-950 border border-slate-850 rounded-lg mt-4.5">
          {Object.keys(customRolesPermissions).map(role => {
            const isCurrent = activeMatrixRole === role;
            return (
              <button
                key={role}
                id={`btn-matrix-role-${role}`}
                onClick={() => setActiveMatrixRole(role)}
                className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded ${
                  isCurrent 
                    ? 'bg-slate-850 text-emerald-400 border border-slate-700' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                {role}
              </button>
            );
          })}
        </div>

        {/* Matrix Core Toggles */}
        <div className="bg-slate-950 border border-slate-850 rounded-lg p-3.5 mt-3 space-y-2.5">
          <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest pb-1 border-b border-slate-900">
            <span>Atomic Permission Identifier</span>
            <span>Policy Status</span>
          </div>

          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {allSystemPermissions.map(perm => {
              const isAssigned = customRolesPermissions[activeMatrixRole]?.includes(perm.code);
              return (
                <div 
                  key={perm.code}
                  id={`matrix-perm-row-${perm.code}`}
                  onClick={() => togglePermissionInMatrix(activeMatrixRole, perm.code)}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer transition-all ${
                    isAssigned 
                      ? 'bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20' 
                      : 'bg-slate-900/20 hover:bg-slate-900/40 border border-transparent hover:border-slate-850'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-slate-200">{perm.name}</span>
                      <span className="text-[8px] font-mono font-bold bg-slate-900 text-slate-400 px-1 py-0.2 rounded border border-slate-800">
                        {perm.module}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 block mt-0.5">{perm.code}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAssigned ? (
                      <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle className="w-3 h-3" />
                        Granted
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-slate-500 flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-850">
                        Restricted
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Matrix Explanatory Notice */}
        <div className="p-3.5 bg-slate-900/20 border border-slate-850 rounded-lg text-[11px] text-slate-400 flex items-start gap-2.5 mt-3">
          <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Governance Mandate AUTH-07 enforced:</strong> Changes made directly to this access matrix will instantly update active tokens in memory, enforcing least-privilege borders and triggering high-priority security trails.
          </span>
        </div>
      </div>
    </div>
  );
}
