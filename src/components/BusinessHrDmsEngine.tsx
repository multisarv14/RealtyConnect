import { appStore } from '../lib/appStore';
import React, { useState, useEffect } from 'react';
import { 
  Users, Folder, FileText, Bell, Sparkles, TrendingUp, AlertCircle, HelpCircle, 
  Layers, Clock, ClipboardList, Building2, Calendar, CheckCircle2, ChevronRight, X
} from 'lucide-react';

// Import Types and Mock Initial Data
import { 
  Employee, Department, JobOpening, Candidate, Interview, EmployeeActivity, Folder as FolderType, DocumentRecord, HrDmsNotification,
  INITIAL_EMPLOYEES, INITIAL_DEPARTMENTS, INITIAL_JOB_OPENINGS, INITIAL_CANDIDATES, INITIAL_INTERVIEWS, INITIAL_ACTIVITIES,
  INITIAL_FOLDERS, INITIAL_DOCUMENTS, INITIAL_HR_DMS_NOTIFICATIONS
} from './hrDmsMockData';

// Import Modular Views
import BusinessHrView from './BusinessHrView';
import BusinessDmsView from './BusinessDmsView';

interface BusinessHrDmsEngineProps {
  userSession: { email: string; role: string; permissions: string[] } | null;
  onLogTriggered: (action: string, entity: string, entityId: string, status: 'SUCCESS' | 'FAILURE' | 'WARNING', details: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  setActiveViewMode: (view: any) => void;
}

export default function BusinessHrDmsEngine({
  userSession,
  onLogTriggered,
  showToast,
  setActiveViewMode
}: BusinessHrDmsEngineProps) {

  // Main Module toggle: 'hr' (HR & Recruitment) | 'dms' (Document Management System)
  const [activeTab, setActiveTab] = useState<'hr' | 'dms'>('hr');

  // ==========================================
  // PERSISTENT STATE MANAGEMENT
  // ==========================================
  
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = appStore.getItem('rc_hr_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = appStore.getItem('rc_hr_departments');
    return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS;
  });

  const [openings, setOpenings] = useState<JobOpening[]>(() => {
    const saved = appStore.getItem('rc_hr_openings');
    return saved ? JSON.parse(saved) : INITIAL_JOB_OPENINGS;
  });

  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const saved = appStore.getItem('rc_hr_candidates');
    return saved ? JSON.parse(saved) : INITIAL_CANDIDATES;
  });

  const [interviews, setInterviews] = useState<Interview[]>(() => {
    const saved = appStore.getItem('rc_hr_interviews');
    return saved ? JSON.parse(saved) : INITIAL_INTERVIEWS;
  });

  const [activities, setActivities] = useState<EmployeeActivity[]>(() => {
    const saved = appStore.getItem('rc_hr_activities');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  // DMS persistence
  const [folders, setFolders] = useState<FolderType[]>(() => {
    const saved = appStore.getItem('rc_dms_folders');
    return saved ? JSON.parse(saved) : INITIAL_FOLDERS;
  });

  const [documents, setDocuments] = useState<DocumentRecord[]>(() => {
    const saved = appStore.getItem('rc_dms_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [notifications, setNotifications] = useState<HrDmsNotification[]>(() => {
    const saved = appStore.getItem('rc_hrdms_notifications');
    return saved ? JSON.parse(saved) : INITIAL_HR_DMS_NOTIFICATIONS;
  });

  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Sync to local storage on changes
  useEffect(() => { appStore.setItem('rc_hr_employees', JSON.stringify(employees)); }, [employees]);
  useEffect(() => { appStore.setItem('rc_hr_departments', JSON.stringify(departments)); }, [departments]);
  useEffect(() => { appStore.setItem('rc_hr_openings', JSON.stringify(openings)); }, [openings]);
  useEffect(() => { appStore.setItem('rc_hr_candidates', JSON.stringify(candidates)); }, [candidates]);
  useEffect(() => { appStore.setItem('rc_hr_interviews', JSON.stringify(interviews)); }, [interviews]);
  useEffect(() => { appStore.setItem('rc_hr_activities', JSON.stringify(activities)); }, [activities]);
  useEffect(() => { appStore.setItem('rc_dms_folders', JSON.stringify(folders)); }, [folders]);
  useEffect(() => { appStore.setItem('rc_dms_documents', JSON.stringify(documents)); }, [documents]);
  useEffect(() => { appStore.setItem('rc_hrdms_notifications', JSON.stringify(notifications)); }, [notifications]);

  // Helper to add notification
  const addNotification = (type: HrDmsNotification['type'], message: string) => {
    const newNotif: HrDmsNotification = {
      id: `NTF-${Date.now()}`,
      type,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleClearNotif = (notifId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notifId));
    showToast('Notification cleared.', 'info');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Total Metric Variables for active counters
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'Active').length;
  const onLeaveEmployees = employees.filter(e => e.status === 'On Leave').length;
  const openPositionsCount = openings.reduce((acc, curr) => acc + curr.openPositions, 0);
  const candidatesCount = candidates.length;
  const interviewsToday = interviews.filter(i => i.date === '2026-07-20' && i.status === 'Scheduled').length;

  const totalDocuments = documents.length;
  const totalFolders = folders.length;
  const sharedDocsCount = documents.filter(d => d.sharingSettings.type !== 'Internal').length;
  const pendingApprovalsCount = documents.filter(d => d.status === 'Under Review' || d.status === 'Draft').length;

  return (
    <div className="space-y-6 text-slate-100 pb-16 font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-6 rounded-2xl border border-slate-900 text-left relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase">
              HR & Documents
            </span>
            <span className="text-[10px] font-mono text-slate-500">• People and documents in one place</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>HR, Talent & Document Management System (DMS)</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Manage organization members, department hierarchy, recruitment pipeline, interview panel schedulers, and publish secure business dossiers in our decentralized document storage engine.
          </p>
        </div>

        {/* Action controls & Notification Bell */}
        <div className="flex items-center gap-3 z-10">
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              // Mark all as read when opening
              setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            }}
            className="p-2 bg-slate-950 border border-slate-900 rounded-lg hover:border-slate-800 text-slate-400 hover:text-white transition-all relative cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-rose-500 border border-slate-950 text-white rounded-full flex items-center justify-center text-[9px] font-mono font-bold animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          <div className="flex bg-slate-950 border border-slate-900 rounded-xl p-1 shrink-0">
            <button
              onClick={() => {
                setActiveTab('hr');
                onLogTriggered('HRDMS_ACTIVE_TAB_SWITCHED', 'hr_dms', 'hr', 'SUCCESS', 'Switched core workspace to HR Management');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'hr'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>HR & Recruitment</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('dms');
                onLogTriggered('HRDMS_ACTIVE_TAB_SWITCHED', 'hr_dms', 'dms', 'SUCCESS', 'Switched core workspace to DMS Management');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'dms'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Folder className="w-3.5 h-3.5 text-emerald-400" />
              <span>Enterprise DMS</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative grid overlay */}
        <div className="absolute right-0 top-0 w-1/3 h-full bg-radial-gradient from-emerald-500/5 via-transparent to-transparent opacity-40 pointer-events-none" />
      </div>

      {/* ========================================== */}
      {/* COUNTERS / TICKERS ROW */}
      {/* ========================================== */}
      {activeTab === 'hr' ? (
        // HR & Recruitment Summary Cards
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 text-left">
          {[
            { label: 'Total Employees', value: totalEmployees, sub: 'Active Files' },
            { label: 'Active Staff', value: activeEmployees, sub: `${Math.round((activeEmployees/totalEmployees)*100)}% Capacity` },
            { label: 'On Leave (UI)', value: onLeaveEmployees, sub: 'Out of Office', highlight: true },
            { label: 'Departments', value: departments.length, sub: 'Organizational Nodes' },
            { label: 'Open Positions', value: openPositionsCount, sub: 'Active Job Openings' },
            { label: 'Candidates', value: candidatesCount, sub: 'Active Pipeline Applicants' },
            { label: 'Interviews Today', value: interviewsToday, sub: 'Scheduled Panels' },
            { label: 'New Joinees', value: employees.filter(e => e.joiningDate.includes('2025') || e.joiningDate.includes('2026')).length, sub: 'Onboarding complete' }
          ].map((card, idx) => (
            <div 
              key={idx} 
              className={`bg-slate-900/30 border border-slate-900 rounded-xl p-3 space-y-1.5 hover:border-slate-850 transition-all ${
                card.highlight ? 'bg-amber-500/5' : ''
              }`}
            >
              <span className="text-[10px] font-mono text-slate-500 block leading-tight font-bold uppercase truncate">{card.label}</span>
              <p className="text-xl font-extrabold text-white tracking-tight">{card.value}</p>
              <span className="text-[9px] text-slate-400 block font-mono truncate">{card.sub}</span>
            </div>
          ))}
        </div>
      ) : (
        // DMS Registry Summary Cards
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
          {[
            { label: 'Total Registered Documents', value: totalDocuments, sub: 'All business categories tracked', icon: FileText },
            { label: 'Nested Folders Map', value: totalFolders, sub: 'Hierarchical file directories', icon: Folder },
            { label: 'Shared Document Policies', value: sharedDocsCount, sub: 'Internal & role based access rules', icon: Layers },
            { label: 'Pending Audits & Approvals', value: pendingApprovalsCount, sub: 'Awaiting Departmental Release', icon: ClipboardList }
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="bg-slate-900/30 border border-slate-900 rounded-2xl p-4 flex items-center justify-between hover:border-slate-850 transition-all">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 block leading-tight font-bold uppercase">{card.label}</span>
                  <p className="text-2xl font-black text-white tracking-tight">{card.value}</p>
                  <span className="text-xs text-slate-400 block">{card.sub}</span>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-emerald-400">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================== */}
      {/* CORE MODULAR ACTIVE TAB OUTLETS */}
      {/* ========================================== */}
      <div className="bg-slate-900/10 border border-slate-900 p-6 rounded-2xl backdrop-blur-sm">
        {activeTab === 'hr' ? (
          <BusinessHrView
            employees={employees}
            setEmployees={setEmployees}
            departments={departments}
            setDepartments={setDepartments}
            openings={openings}
            setOpenings={setOpenings}
            candidates={candidates}
            setCandidates={setCandidates}
            interviews={interviews}
            setInterviews={setInterviews}
            activities={activities}
            setActivities={setActivities}
            documents={documents}
            addNotification={addNotification}
            onLogTriggered={onLogTriggered}
            showToast={showToast}
          />
        ) : (
          <BusinessDmsView
            documents={documents}
            setDocuments={setDocuments}
            folders={folders}
            setFolders={setFolders}
            employees={employees}
            addNotification={addNotification}
            onLogTriggered={onLogTriggered}
            showToast={showToast}
          />
        )}
      </div>

      {/* ========================================== */}
      {/* NOTIFICATIONS BELL PANEL SIDEBAR */}
      {/* ========================================== */}
      {isNotifOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-end">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-sm h-full shadow-2xl flex flex-col justify-between text-left p-6">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400 animate-pulse" />
                <h3 className="text-sm font-extrabold text-white">HR & DMS Notification Center</h3>
              </div>
              <button 
                onClick={() => setIsNotifOpen(false)}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notification items */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {notifications.map((notif) => (
                <div 
                  key={notif.id}
                  className="p-3 bg-slate-950 rounded-lg border border-slate-850 flex items-start gap-2.5 text-xs text-slate-300 relative group"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                  <div className="space-y-1 pr-4">
                    <p className="font-semibold text-[10px] text-slate-500 uppercase font-mono">{notif.type}</p>
                    <p className="text-slate-200 leading-normal">{notif.message}</p>
                    <span className="text-[9px] font-mono text-slate-600 block">{notif.timestamp}</span>
                  </div>

                  <button
                    onClick={() => handleClearNotif(notif.id)}
                    className="absolute right-2 top-2 text-slate-600 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="p-8 text-center text-slate-500 italic text-xs">
                  No active notification logs inside HR & DMS system.
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setNotifications([]);
                showToast('All notifications cleared.', 'info');
              }}
              className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 font-bold text-xs uppercase tracking-wider rounded-lg text-center"
            >
              Clear All Logs
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
