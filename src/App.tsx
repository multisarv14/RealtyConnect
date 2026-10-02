/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { 
  Cpu, 
  Database, 
  Terminal, 
  Settings, 
  File, 
  Bell, 
  Lock, 
  ShieldCheck, 
  FileCheck, 
  AlertTriangle,
  History,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Sun,
  Moon,
  X
} from 'lucide-react';

import { AuditLog, SystemConfig, SystemNotification } from './types';
import LandingPortal from './components/LandingPortal';
import * as authApi from './lib/api';
import { api, errorMessage, type AuthMeta, type RegisterInput, type Session } from './lib/api';
import { appStore } from './lib/appStore';
import { setCurrentIdentity } from './lib/identity';

const DocViewer = React.lazy(() => import('./components/DocViewer'));
const AuthSimulator = React.lazy(() => import('./components/AuthSimulator'));
const MastersManager = React.lazy(() => import('./components/MastersManager'));
const ConfigPanel = React.lazy(() => import('./components/ConfigPanel'));
const FileUploader = React.lazy(() => import('./components/FileUploader'));
const NotificationSimulator = React.lazy(() => import('./components/NotificationSimulator'));
const LogsViewer = React.lazy(() => import('./components/LogsViewer'));
const ReviewQueues = React.lazy(() => import('./components/ReviewQueues'));

// Shown until the server's values arrive (and if it cannot be reached).
const DEFAULT_CONFIGS: SystemConfig[] = [
  { key: 'MAINTENANCE_MODE', value: 'false', description: 'Restricts active system logins exclusively to accounts holding admin roles.', type: 'boolean', category: 'System' },
  { key: 'MAX_UPLOAD_SIZE_MB', value: '10', description: 'Maximum permissible individual binary size for the quarantine uploader.', type: 'number', category: 'Storage' },
  { key: 'BRUTE_FORCE_THRESHOLD', value: '5', description: 'Consecutive incorrect authentication attempts before account lock triggers.', type: 'number', category: 'Security' },
  { key: 'AUDIT_LOG_ROTATION_DAYS', value: '90', description: 'Interval threshold for retaining compliance and audit chains before archiving.', type: 'number', category: 'Logging' }
];

const utcStamp = (length: number) => new Date().toISOString().replace('T', ' ').substr(0, length);

export default function App() {
  const [viewMode, setViewMode] = useState<'business' | 'foundation'>('business');
  const [activeTab, setActiveTab] = useState<'blueprint' | 'auth' | 'masters' | 'config' | 'file' | 'noti' | 'logs' | 'review'>('blueprint');

  // True until we know whether the browser still holds a live session.
  const [booting, setBooting] = useState(true);
  const [userSession, setUserSession] = useState<Session | null>(null);
  // Log/notification callbacks are handed to many modules; the ref lets them see the current session without re-binding.
  const sessionRef = useRef<Session | null>(null);
  const [authMeta, setAuthMeta] = useState<AuthMeta | null>(null);
  const authMetaRef = useRef<AuthMeta | null>(null);
  authMetaRef.current = authMeta;
  const [landingView, setLandingView] = useState('dashboard');

  const [configs, setConfigs] = useState<SystemConfig[]>(DEFAULT_CONFIGS);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  // Newest first. Signed-in activity is recorded by the server in a SHA-256 hash chain (Rules LOG-01, LOG-02).
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const localLogSeq = useRef(0);

  // Active time state for top bar
  const [currentTime, setCurrentTime] = useState(utcStamp(19));

  // Stateful custom toast alert container (non-blocking for iframes)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Theme Management (Light / Dark Mode State and Persistence)
  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    // Light is the default; a visitor who chose dark keeps it.
    return localStorage.getItem('realtyconnect_theme') !== 'dark';
  });

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('realtyconnect_theme', 'light');
    } else {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('realtyconnect_theme', 'dark');
    }
  }, [isLightMode]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setTimeout(() => {
      setToast({ message, type });
    }, 0);
    setTimeout(() => {
      setToast(null);
    }, 4500);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(utcStamp(19));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const canViewAuditLogs = !!userSession?.permissions.includes('VIEW_AUDIT_LOGS');

  const refreshAuditLogs = useCallback(() => {
    api<AuditLog[]>('GET', '/audit-logs?limit=300')
      .then(setLogs)
      .catch(err => console.warn('Could not load audit logs', err));
  }, []);

  // ---------- Session lifecycle ----------

  const enterWorkspace = useCallback(async (session: Session, view = 'dashboard') => {
    // Outside demo mode a new company starts with empty modules rather than the sample records.
    await appStore.hydrate(!authMetaRef.current?.demoMode);
    sessionRef.current = session;
    setCurrentIdentity(session);
    // Swap the workspace in one synchronous render: modules of the previous session must
    // unmount before they can write their state into the freshly loaded store.
    flushSync(() => {
      setLandingView(view);
      setUserSession(session);
      setLogs([]);
    });
    api<SystemNotification[]>('GET', '/notifications')
      .then(setNotifications)
      .catch(err => console.warn('Could not load notifications', err));
    if (session.permissions.includes('VIEW_AUDIT_LOGS')) refreshAuditLogs();
  }, [refreshAuditLogs]);

  const leaveWorkspace = useCallback(() => {
    appStore.reset();
    sessionRef.current = null;
    setCurrentIdentity(null);
    flushSync(() => {
      setUserSession(null);
      setLogs([]);
      setNotifications([]);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [meta, serverConfigs, session] = await Promise.all([
        api<AuthMeta>('GET', '/meta').catch(() => null),
        api<SystemConfig[]>('GET', '/configs').catch(() => null),
        authApi.restoreSession().catch(() => null)
      ]);
      if (cancelled) return;
      if (meta) {
        authMetaRef.current = meta;
        setAuthMeta(meta);
      }
      if (serverConfigs) setConfigs(serverConfigs);
      if (session) {
        try {
          await enterWorkspace(session);
        } catch (err) {
          showToast(errorMessage(err), 'error');
        }
      }
      if (!meta) showToast('Cannot reach the RealtyConnect server. Sign-in and saving are unavailable until it is back.', 'error');
      setBooting(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [enterWorkspace, showToast]);

  useEffect(() => {
    const offExpired = authApi.onSessionExpired(() => {
      if (!sessionRef.current) return;
      leaveWorkspace();
      showToast('Your session has expired. Please sign in again.', 'info');
    });
    const offStoreError = appStore.onError(message => showToast(message, 'error'));
    return () => {
      offExpired();
      offStoreError();
    };
  }, [leaveWorkspace, showToast]);

  // Things other companies deliver to this one (messages, leads, quotations, requests, new listings)
  // are picked up every few seconds while the workspace is open.
  useEffect(() => {
    if (!userSession) return;
    const keys = [
      'realtyconnect_conversations', 'realtyconnect_leads', 'realtyconnect_meetings', 'realtyconnect_quotation_list',
      'realtyconnect_product_enquiries', 'rc_net_connections', 'realtyconnect_marketplace_listings', 'realtyconnect_rfq_list',
      'rc_opportunities', 'rc_feed_posts'
    ];
    let busy = false;
    const timer = setInterval(() => {
      if (busy || document.visibilityState !== 'visible') return;
      busy = true;
      Promise.all([
        appStore.refresh(keys),
        api<SystemNotification[]>('GET', '/notifications').then(setNotifications)
      ])
        .catch(() => undefined)
        .finally(() => { busy = false; });
    }, 8000);
    return () => clearInterval(timer);
  }, [userSession?.id, userSession?.role]);

  const handleLogin = useCallback(async (email: string, password: string, role?: string, view = 'dashboard') => {
    await appStore.flushAll();
    const session = await authApi.login(email, password, role);
    await enterWorkspace(session, view);
    showToast(`Signed in as ${session.role} for ${session.organizationName}.`, 'success');
  }, [enterWorkspace, showToast]);

  const handleRegister = useCallback(async (input: RegisterInput, view = 'dashboard') => {
    const session = await authApi.register(input);
    await enterWorkspace(session, view);
    showToast(`Account created. Welcome, ${session.organizationName}!`, 'success');
  }, [enterWorkspace, showToast]);

  const handleSwitchRole = useCallback(async (role: string) => {
    await appStore.flushAll();
    await enterWorkspace(await authApi.switchRole(role));
  }, [enterWorkspace]);

  // Role permissions can change while signed in (Rule AUTH-07); re-read what this session may do.
  const reloadSession = useCallback(async () => {
    const { session } = await api<{ session: Session }>('GET', '/auth/me');
    sessionRef.current = session;
    setCurrentIdentity(session);
    setUserSession(session);
  }, []);

  const handleLogout = useCallback(async () => {
    await appStore.flushAll();
    await authApi.logout().catch(() => undefined);
    leaveWorkspace();
  }, [leaveWorkspace]);

  // ---------- Audit trail, notifications, configuration ----------

  const triggerLog = useCallback((
    action: string, 
    entity: string, 
    entityId: string, 
    status: 'SUCCESS' | 'FAILURE' | 'WARNING', 
    details: string
  ) => {
    if (!sessionRef.current) {
      // Activity before sign-in is only listed in this browser; the server records authenticated events.
      const local: AuditLog = {
        id: `local-${++localLogSeq.current}`,
        timestamp: utcStamp(19),
        userId: 'ANONYMOUS',
        userRole: 'VISITOR',
        action,
        entity,
        entityId,
        status,
        details,
        ipAddress: 'this browser',
        chainHash: 'not recorded (sign in to write to the audit chain)'
      };
      setLogs(prev => [local, ...prev]);
      return;
    }

    api<AuditLog>('POST', '/audit-logs', {
      action: action.slice(0, 100),
      entity: entity.slice(0, 50),
      entityId: String(entityId ?? '').slice(0, 200) || 'n/a',
      status,
      details: details.slice(0, 2000)
    })
      .then(log => setLogs(prev => [log, ...prev]))
      .catch(err => console.warn('Audit event was not recorded', err));
  }, []);

  const triggerNotification = useCallback((type: SystemNotification['type'], recipient: string, content: string) => {
    if (!sessionRef.current) {
      showToast('Sign in to dispatch notifications.', 'info');
      return;
    }
    api<SystemNotification>('POST', '/notifications', { type, recipient, content })
      .then(created => setNotifications(prev => [created, ...prev]))
      .catch(err => showToast(errorMessage(err), 'error'));
  }, [showToast]);

  const handleConfigChange = (key: string, newValue: string) => {
    api<SystemConfig>('PUT', `/configs/${encodeURIComponent(key)}`, { value: newValue })
      .then(updated => {
        setConfigs(prev => prev.map(cfg => (cfg.key === key ? updated : cfg)));
        if (canViewAuditLogs) refreshAuditLogs();
      })
      .catch(err => showToast(errorMessage(err), 'error'));
  };

  // The server also writes audit records of its own (logins, config and master changes);
  // pick those up whenever an authorised user opens the audit console.
  useEffect(() => {
    if (viewMode === 'foundation' && activeTab === 'logs' && canViewAuditLogs) refreshAuditLogs();
  }, [viewMode, activeTab, canViewAuditLogs, refreshAuditLogs]);

  const maintenanceModeActive = configs.find(c => c.key === 'MAINTENANCE_MODE')?.value === 'true';
  const maxUploadSizeMb = parseInt(configs.find(c => c.key === 'MAX_UPLOAD_SIZE_MB')?.value || '10', 10);

  if (booting) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/10" />
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-slate-400 font-mono text-[10px] uppercase tracking-wider mt-4 animate-pulse">
          Connecting to RealtyConnect...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {viewMode === 'business' ? (
        <div className="w-full min-h-screen flex flex-col">
          {/* Keyed on the session so every module remounts and reloads its data when it changes. */}
          <React.Fragment key={userSession ? `${userSession.id}:${userSession.role}` : 'anonymous'}>
          <LandingPortal 
            authMeta={authMeta}
            serverNotifications={notifications}
            initialViewMode={landingView}
            onLogTriggered={triggerLog}
            userSession={userSession}
            showToast={showToast}
            onToggleDevHub={() => setViewMode('foundation')}
            isLightMode={isLightMode}
            onToggleTheme={() => setIsLightMode(prev => !prev)}
            onLogout={handleLogout}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onSessionStale={() => {
              reloadSession().catch(err => showToast(errorMessage(err), 'error'));
            }}
          />
          </React.Fragment>
        </div>
      ) : (
        <>
          {/* Top Status & Telemetry Header */}
          <div className="bg-slate-900 border-b border-slate-850 px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-400 animate-pulse" />
                <span className="font-display font-bold text-sm tracking-tight text-slate-100">RealtyConnect™</span>
                <span className="hidden lg:inline text-[9px] font-mono text-slate-500 uppercase tracking-wider">Product of MultiSarv India</span>
                <span className="text-slate-750 font-mono">/</span>
                <span className="font-mono text-slate-400 tracking-tight font-semibold text-xs">Platform Foundation Hub</span>
              </div>
              
              

              <button
                type="button"
                onClick={() => setViewMode('business')}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-2.5 py-0.5 rounded text-[10px] flex items-center gap-1 transition-all"
              >
                <span>← Open Landing Portal</span>
              </button>
            </div>

            {/* Live System Clocks */}
            <div className="flex flex-wrap items-center gap-4 text-slate-400 font-mono text-[11px]">
              {maintenanceModeActive && (
                <span className="flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-bold animate-pulse text-[10px]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Maintenance Mode Active
                </span>
              )}

              <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold text-[10px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Production Baseline Ready
              </span>

              <button
                id="dev-theme-toggle"
                onClick={() => {
                  setIsLightMode(prev => !prev);
                  triggerLog(
                    'THEME_TOGGLED',
                    'system_preferences',
                    'theme',
                    'SUCCESS',
                    `User toggled theme preference in Developer view.`
                  );
                }}
                className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 px-2.5 py-1 rounded text-slate-300 transition-all cursor-pointer"
                title={isLightMode ? "Switch to Dark Mode" : "Switch to Light Mode"}
              >
                {isLightMode ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dark</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Light</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-850 px-2.5 py-1 rounded">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-300">{currentTime} UTC</span>
              </div>
            </div>
          </div>

          {/* Main Container */}
          <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
            
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-display font-semibold text-xs text-slate-100">Foundation Workspace Ready</p>
                  <p className="text-[11px] text-slate-400">Core modules are available for operations, onboarding, and governance workflows.</p>
                </div>
              </div>

              <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                Status: Ready
              </span>
            </div>

            {/* Dashboard Bento Hub Tabs */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-1.5 p-1 bg-slate-900 border border-slate-850 rounded-xl">
              {[
                { id: 'blueprint', label: 'Technical Blueprint', icon: FileCheck },
                { id: 'auth', label: 'IAM Gateway', icon: Lock },
                { id: 'masters', label: 'Lookups Registry', icon: Database },
                { id: 'config', label: 'Global variables', icon: Settings },
                { id: 'file', label: 'Quarantine Uploader', icon: File },
                { id: 'noti', label: 'Async Alerts', icon: Bell },
                { id: 'review', label: 'Review Queues', icon: ShieldCheck },
                { id: 'logs', label: 'Compliance Audits', icon: History }
              ].map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`btn-workspace-tab-${tab.id}`}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      triggerLog('SWAP_WORKSPACE_VIEW', 'workspace_hub', tab.id, 'SUCCESS', `Swapped workspace terminal view to: ${tab.label}`);
                    }}
                    className={`flex flex-col items-center justify-center gap-1 px-2.5 py-3 rounded-lg text-center transition-all ${
                      active 
                        ? 'bg-slate-950 text-emerald-400 border border-slate-800 shadow-lg' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="text-[10px] font-mono mt-1 font-bold truncate max-w-full leading-none">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Workspace Canvas */}
            <div className="flex-1 min-h-0 bg-slate-900/20 border border-slate-900 rounded-xl p-0.5" id="workspace-canvas">
              <React.Suspense fallback={
                <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
                  <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-500/10" />
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                  </div>
                  <p className="text-slate-400 font-mono text-[9px] uppercase tracking-wider mt-4 animate-pulse">
                    Streaming Technical Console...
                  </p>
                </div>
              }>
                {activeTab === 'blueprint' && (
                  <DocViewer onLogTriggered={triggerLog} />
                )}

                {activeTab === 'auth' && (
                  <AuthSimulator 
                    userSession={userSession}
                    authMeta={authMeta}
                    onLogin={handleLogin}
                    onLogout={handleLogout}
                    onSwitchRole={handleSwitchRole}
                    onPermissionsChanged={() => {
                      reloadSession().catch(err => showToast(errorMessage(err), 'error'));
                      if (canViewAuditLogs) refreshAuditLogs();
                    }}
                    maintenanceMode={maintenanceModeActive}
                    showToast={showToast}
                  />
                )}

                {activeTab === 'masters' && (
                  <MastersManager 
                    onLogTriggered={triggerLog} 
                    userSession={userSession}
                    showToast={showToast}
                  />
                )}

                {activeTab === 'config' && (
                  <ConfigPanel 
                    configs={configs} 
                    onConfigChanged={handleConfigChange} 
                    userSession={userSession}
                    showToast={showToast}
                  />
                )}

                {activeTab === 'file' && (
                  <FileUploader 
                    onLogTriggered={triggerLog} 
                    onNotificationTriggered={(type, content) => triggerNotification(type, userSession?.email || 'SYSTEM_OPERATOR', content)}
                    userSession={userSession}
                    maxSizeMb={maxUploadSizeMb}
                    showToast={showToast}
                  />
                )}

                {activeTab === 'noti' && (
                  <NotificationSimulator 
                    notifications={notifications} 
                    onTriggerNotification={triggerNotification} 
                    onLogTriggered={triggerLog}
                  />
                )}

                {activeTab === 'review' && <ReviewQueues userSession={userSession} showToast={showToast} />}

                {activeTab === 'logs' && (
                  <LogsViewer 
                    logs={logs} 
                    onClearSimulatorLogs={() => {
                      showToast('Immutability policy breach blocked. Compliance logs are read-only under LOG-01.', 'error');
                      triggerLog('SECURITY_CLEAR_LOGS_REJECTED', 'audit_logs', 'all', 'FAILURE', 'Immutability policy enforcement: Blocked user attempt to clear logs.');
                    }}
                  />
                )}
              </React.Suspense>
            </div>
          </div>
        </>
      )}

      {/* Floating Stateful Toast Notification Banner */}
      {toast && (
        <div 
          id="toast-notification-banner"
          className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl border shadow-2xl max-w-md flex flex-col gap-2 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
            toast.type === 'success' 
              ? 'bg-slate-900 border-emerald-500/40 text-slate-100' 
              : toast.type === 'error' 
              ? 'bg-slate-900 border-red-500/40 text-slate-100' 
              : 'bg-slate-900 border-slate-700/60 text-slate-100'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div className="flex-shrink-0 mt-0.5">
              {toast.type === 'success' ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : toast.type === 'error' ? (
                <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
              ) : (
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {toast.type === 'success' ? 'SUCCESS TRACE' : toast.type === 'error' ? 'RESTRICTION ALERT' : 'SYSTEM INFO'}
              </h5>
              <p className="text-slate-200 text-xs mt-1 font-sans leading-relaxed pr-6">{toast.message}</p>
            </div>
            
            {/* Interactive Manual Dismiss Button */}
            <button
              onClick={() => setToast(null)}
              className="absolute top-3 right-3 p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800/40 transition-all cursor-pointer"
              title="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Toast Duration Visual Progress Bar */}
          <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden mt-1">
            <div 
              className={`h-full rounded-full animate-progress-shrink ${
                toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-indigo-500'
              }`}
              style={{
                animation: 'shrinkWidth 4.5s linear forwards',
                width: '100%'
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
