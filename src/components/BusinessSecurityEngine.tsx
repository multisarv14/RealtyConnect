/**
 * RealtyConnect™ Sprint 25 - Centralized Enterprise Security, Roles & Permissions, and Audit Logs Framework
 * A high-fidelity, Swiss Slate styled administrative suite.
 */

import { appStore } from '../lib/appStore';
import { usePersistentState } from '../lib/usePersistentState';
import React, { useState, useEffect } from 'react';
import { 
  Shield, ShieldCheck, ShieldAlert, Lock, Unlock, Key, Users, UserCheck, UserX, 
  Settings, Terminal, History, Clock, FileCheck, HelpCircle, LogOut, CheckCircle2,
  AlertTriangle, RefreshCw, ArrowUpRight, Search, Filter, FileText, Download, Play, 
  Trash2, Send, Bookmark, CreditCard, Layers, Activity, SlidersHorizontal, Plus, 
  ChevronRight, Check, X, Printer, FileSpreadsheet, Copy, Globe, Eye, Edit3, Briefcase, 
  Building2, CheckSquare, ListFilter, AlertCircle
} from 'lucide-react';

const simulateSHA256 = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'f8a4e3' + Math.abs(hash).toString(16).padStart(8, '0') + 'd9c2e0b1a2f3c4e5d6';
};

interface SecurityEngineProps {
  userSession: { email: string; role: string; permissions: string[] } | null;
  onLogTriggered: (action: string, entity: string, entityId: string, status: 'SUCCESS' | 'FAILURE' | 'WARNING', details: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onNotificationTriggered: (type: 'email' | 'sms' | 'push' | 'in_app', recipient: string, content: string) => void;
  setActiveViewMode: (mode: any) => void;
}

// 1. MODULE DEFINITIONS
const SYSTEM_MODULES = [
  'CRM', 'Leads', 'Projects', 'Procurement', 'Inventory', 
  'Finance', 'HR & DMS', 'B2B Marketplace', 'Messaging', 'Meetings'
];

// 2. PERMISSION ACTIONS
const ACTION_SCOPES = ['View', 'Create', 'Edit', 'Delete', 'Export', 'Import'];

// 3. INITIAL MOCK DATA - USERS
interface UserAccessItem {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'Active' | 'Inactive' | 'Locked';
  sessionActive: boolean;
  failedAttempts: number;
  tempAccessExpires?: string;
  lastLogin: string;
  lastLoginIp: string;
  device: string;
}

const INITIAL_USERS: UserAccessItem[] = [
  { id: 'usr-101', name: 'Devendra Sharma', email: 'devendra.s@realtyconnect.in', role: 'System Admin', department: 'Audit & Compliance', status: 'Active', sessionActive: true, failedAttempts: 0, lastLogin: '2026-07-20 09:12', lastLoginIp: '192.168.1.45', device: 'macOS Chrome' },
  { id: 'usr-102', name: 'Vikram Rathore', email: 'vikram.r@realtyconnect.in', role: 'Project Manager', department: 'Engineering', status: 'Active', sessionActive: true, failedAttempts: 0, lastLogin: '2026-07-20 08:30', lastLoginIp: '192.168.1.12', device: 'Windows Edge' },
  { id: 'usr-103', name: 'Ananya Sen', email: 'ananya.sen@realtyconnect.in', role: 'Compliance Officer', department: 'Legal', status: 'Active', sessionActive: true, failedAttempts: 0, lastLogin: '2026-07-20 10:04', lastLoginIp: '192.168.1.98', device: 'iOS Safari' },
  { id: 'usr-104', name: 'Rajesh Verma', email: 'rajesh.v@realtyconnect.in', role: 'Procurement Executive', department: 'Procurement', status: 'Active', sessionActive: false, failedAttempts: 0, lastLogin: '2026-07-19 16:45', lastLoginIp: '192.168.2.14', device: 'Android Chrome' },
  { id: 'usr-105', name: 'Nisha Gupta', email: 'nisha.g@realtyconnect.in', role: 'Materials Vendor', department: 'Procurement', status: 'Locked', sessionActive: false, failedAttempts: 5, lastLogin: '2026-07-18 11:22', lastLoginIp: '10.14.85.112', device: 'Windows Firefox' },
  { id: 'usr-106', name: 'Amit Trivedi', email: 'amit.t@realtyconnect.in', role: 'Sales Broker', department: 'Sales', status: 'Inactive', sessionActive: false, failedAttempts: 1, lastLogin: '2026-07-15 14:10', lastLoginIp: '172.16.4.5', device: 'Linux Chrome' }
];

// 4. INITIAL SYSTEM ROLES
interface SystemRoleItem {
  id: string;
  name: string;
  type: 'System' | 'Organization' | 'Department' | 'Custom';
  description: string;
  status: 'Active' | 'Inactive';
  permissionsCount: number;
}

const INITIAL_ROLES: SystemRoleItem[] = [
  { id: 'role-sys-admin', name: 'System Admin', type: 'System', description: 'Unrestricted master control over global system modules and configurations.', status: 'Active', permissionsCount: 60 },
  { id: 'role-compliance-off', name: 'Compliance Officer', type: 'Organization', description: 'Enforces security configuration reviews, audit logging, and RERA policy checks.', status: 'Active', permissionsCount: 42 },
  { id: 'role-proj-mgr', name: 'Project Manager', type: 'Department', description: 'Oversees engineering blueprints, project tasks, scheduling, and contractor assignments.', status: 'Active', permissionsCount: 35 },
  { id: 'role-procur-exec', name: 'Procurement Executive', type: 'Department', description: 'Manages vendor relations, RFQs, material bids, and purchase orders.', status: 'Active', permissionsCount: 28 },
  { id: 'role-broker', name: 'Sales Broker', type: 'Custom', description: 'Tailored lead management, marketplace browsing, and message boards.', status: 'Active', permissionsCount: 15 }
];

// 5. DATA CHANGE HISTORY MODEL
interface DataChangeRecord {
  id: string;
  module: string;
  recordRef: string;
  changedBy: string;
  changedDate: string;
  field: string;
  prevValue: string;
  newValue: string;
}

const INITIAL_CHANGES: DataChangeRecord[] = [
  { id: 'dc-901', module: 'Finance', recordRef: 'INV-2026-001', changedBy: 'devendra.s@realtyconnect.in', changedDate: '2026-07-20 09:34', field: 'paymentStatus', prevValue: 'Pending', newValue: 'Paid' },
  { id: 'dc-902', module: 'Procurement', recordRef: 'PO-78401', changedBy: 'rajesh.v@realtyconnect.in', changedDate: '2026-07-20 08:15', field: 'orderQuantity', prevValue: '500 Bags', newValue: '650 Bags' },
  { id: 'dc-903', module: 'Projects', recordRef: 'PRJ-WOODS', changedBy: 'vikram.r@realtyconnect.in', changedDate: '2026-07-19 14:22', field: 'completionPct', prevValue: '75%', newValue: '82%' },
  { id: 'dc-904', module: 'HR & DMS', recordRef: 'EMP-342', changedBy: 'ananya.sen@realtyconnect.in', changedDate: '2026-07-19 11:05', field: 'salaryTier', prevValue: 'Tier-2', newValue: 'Tier-1' }
];

// 6. COMPLIANCE POLICIES MODEL
interface CompliancePolicy {
  id: string;
  title: string;
  standard: string;
  status: 'Compliant' | 'Pending Review' | 'Under Audit';
  lastReview: string;
  owner: string;
  description: string;
  acknowledged: boolean;
}

const INITIAL_POLICIES: CompliancePolicy[] = [
  { id: 'POL-01', title: 'LOG-01 Immutability Protocol', standard: 'RERA Section 4', status: 'Compliant', lastReview: '2026-07-10', owner: 'Legal Team', description: 'Enforces that any transaction or state modification log is written exactly once, with programmatic prevention of deletes/updates.', acknowledged: true },
  { id: 'POL-02', title: 'Data Encryption At Rest', standard: 'SOC2 Trust Principles', status: 'Compliant', lastReview: '2026-07-12', owner: 'DevOps / SysAdmin', description: 'Requires AES-256 standard encryption for all database records containing customer and financial escrow metadata.', acknowledged: true },
  { id: 'POL-03', title: 'Least Privilege Account Auditing', standard: 'ISO 27001', status: 'Under Audit', lastReview: '2026-06-25', owner: 'Compliance Officer', description: 'Quarterly review to verify no contractor or third-party vendor has unrequested administrative privileges.', acknowledged: false },
  { id: 'POL-04', title: 'Escrow Milestone Verification', standard: 'Finance Audit Rule Fin-3', status: 'Pending Review', lastReview: '2026-05-18', owner: 'Accounts Controller', description: 'Requires dual administrator approval for any escrow release exceeding ₹10 Lakhs.', acknowledged: false }
];

export default function BusinessSecurityEngine({
  userSession,
  onLogTriggered,
  showToast,
  onNotificationTriggered,
  setActiveViewMode
}: SecurityEngineProps) {

  // --- STATE PERSISTENCE & LOCAL CACHE ---
  const [users, setUsers] = useState<UserAccessItem[]>(() => {
    try {
      const saved = appStore.getItem('rc_security_users');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_USERS;
  });

  const [roles, setRoles] = useState<SystemRoleItem[]>(() => {
    try {
      const saved = appStore.getItem('rc_security_roles');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_ROLES;
  });

  const [policies, setPolicies] = useState<CompliancePolicy[]>(() => {
    try {
      const saved = appStore.getItem('rc_security_policies');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_POLICIES;
  });

  const [dataChanges, setDataChanges] = usePersistentState<DataChangeRecord[]>('rc_security_data_changes', INITIAL_CHANGES);

  // --- COMPONENT INTERACTIVITY TABS ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'roles' | 'sessions' | 'compliance' | 'integrations'>('dashboard');
  
  // --- SUB-FILTERS & SEARCH ENGORGED HUD ---
  const [globalSearch, setGlobalSearch] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterDept, setFilterDept] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterModule, setFilterModule] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  
  // --- DIALOG MODALS STATS ---
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [isTempAccessOpen, setIsTempAccessOpen] = useState(false);
  const [selectedUserForTemp, setSelectedUserForTemp] = useState<UserAccessItem | null>(null);

  // --- INPUT FORM TEMPLATES ---
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Project Manager', department: 'Engineering' });
  const [newRole, setNewRole] = useState({ name: '', type: 'Custom', description: '' });
  const [tempDuration, setTempDuration] = useState('2 Hours');

  // --- LOGIN SECURITY POLICIES STATE ---
  const [passwordMinLength, setPasswordMinLength] = useState(12);
  const [pwdRequiresUpper, setPwdRequiresUpper] = useState(true);
  const [pwdRequiresNumbers, setPwdRequiresNumbers] = useState(true);
  const [pwdRequiresSymbols, setPwdRequiresSymbols] = useState(true);
  const [pwdExpiryDays, setPwdExpiryDays] = useState(90);
  const [bruteForceLockout, setBruteForceLockout] = useState(5);
  const [mfaStatus, setMfaStatus] = useState<'Optional' | 'Enforced' | 'Disabled'>('Optional');
  const [trustedDevicesOnly, setTrustedDevicesOnly] = useState(false);

  // --- ACCESS SCOPE CONTROL STATE ---
  const [scopeOrg, setScopeOrg] = useState('Multi-Tenant Allowed');
  const [scopeDept, setScopeDept] = useState('Local Restriction');
  const [scopeProject, setScopeProject] = useState('Enforce Workspace Boundary');
  const [recordAccessRule, setRecordAccessRule] = useState('Creator & Compliance Only');

  // --- ROLE VS PERMISSION MATRIX STATE ---
  const [activeMatrixRole, setActiveMatrixRole] = useState('role-sys-admin');
  const [rolePermissions, setRolePermissions] = useState<Record<string, Record<string, boolean>>>(() => {
    // Generate default matrix state
    const initialMatrix: Record<string, Record<string, boolean>> = {};
    INITIAL_ROLES.forEach(r => {
      initialMatrix[r.id] = {};
      SYSTEM_MODULES.forEach(m => {
        initialMatrix[r.id][m] = r.id === 'role-sys-admin' ? true : Math.random() > 0.4;
      });
    });
    return initialMatrix;
  });

  // --- SESSIONS STATE ---
  const [sessions, setSessions] = useState([
    { id: 'sess-801', email: 'devendra.s@realtyconnect.in', role: 'System Admin', ip: '192.168.1.45', device: 'macOS Chrome', location: 'New Delhi', lastActivity: 'Active Now' },
    { id: 'sess-802', email: 'vikram.r@realtyconnect.in', role: 'Project Manager', ip: '192.168.1.12', device: 'Windows Edge', location: 'Noida', lastActivity: '2 mins ago' },
    { id: 'sess-803', email: 'ananya.sen@realtyconnect.in', role: 'Compliance Officer', ip: '192.168.1.98', device: 'iOS Safari', location: 'Gurugram', lastActivity: '5 mins ago' }
  ]);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(30);
  const [maxConcurrentSessions, setMaxConcurrentSessions] = useState(3);

  // --- REPORT PREVIEW DIALOG ---
  const [activeReportPreview, setActiveReportPreview] = useState<string | null>(null);

  // Save to LocalStorage
  useEffect(() => {
    appStore.setItem('rc_security_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    appStore.setItem('rc_security_roles', JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    appStore.setItem('rc_security_policies', JSON.stringify(policies));
  }, [policies]);


  // ==========================================
  // HANDLERS & ACTIONS
  // ==========================================

  // A. Lock / Unlock User
  const handleToggleLockUser = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'Locked' ? 'Active' : 'Locked';
        const failedCount = nextStatus === 'Locked' ? bruteForceLockout : 0;
        
        // Notify
        onLogTriggered(
          nextStatus === 'Locked' ? 'USER_ACCOUNT_LOCKED' : 'USER_ACCOUNT_UNLOCKED',
          'users',
          userId,
          nextStatus === 'Locked' ? 'WARNING' : 'SUCCESS',
          `Security Engine: User ${u.email} status adjusted to ${nextStatus}. failedAttempts set to ${failedCount}.`
        );
        onNotificationTriggered(
          'in_app', 
          'compliance@realtyconnect.in', 
          `User Account ${u.email} was ${nextStatus === 'Locked' ? 'Locked due to administrative safety' : 'Unlocked by administrator'}.`
        );
        showToast(`User ${u.name} is now ${nextStatus}.`, nextStatus === 'Locked' ? 'error' : 'success');
        
        return { ...u, status: nextStatus, failedAttempts: failedCount };
      }
      return u;
    }));
  };

  // B. Toggle User Status (Active/Inactive)
  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'Active' ? 'Inactive' : 'Active';
        
        onLogTriggered(
          'USER_STATUS_MODIFIED',
          'users',
          userId,
          'SUCCESS',
          `Administrative action: Toggled ${u.email} status to ${nextStatus}.`
        );
        showToast(`User ${u.name} is now ${nextStatus}.`, 'info');
        
        return { ...u, status: nextStatus as any };
      }
      return u;
    }));
  };

  // C. Add Custom User
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) {
      showToast('Name and Email are mandatory fields.', 'error');
      return;
    }

    const created: UserAccessItem = {
      id: `usr-${100 + users.length + 1}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      status: 'Active',
      sessionActive: false,
      failedAttempts: 0,
      lastLogin: 'Never',
      lastLoginIp: 'N/A',
      device: 'N/A'
    };

    setUsers(prev => [...prev, created]);
    setIsAddUserOpen(false);

    onLogTriggered(
      'USER_ACCOUNT_CREATED',
      'users',
      created.id,
      'SUCCESS',
      `Enterprise directory expanded: Added user ${created.email} under role [${created.role}].`
    );
    onNotificationTriggered('in_app', 'compliance@realtyconnect.in', `New corporate account registered for ${created.name}.`);
    showToast(`Account successfully generated for ${created.name}!`, 'success');
    setNewUser({ name: '', email: '', role: 'Project Manager', department: 'Engineering' });
  };

  // D. Create Temporary Access
  const handleGrantTempAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForTemp) return;

    setUsers(prev => prev.map(u => {
      if (u.id === selectedUserForTemp.id) {
        onLogTriggered(
          'TEMPORARY_ACCESS_GRANTED',
          'users',
          u.id,
          'SUCCESS',
          `Time-bound escalation: Granted temporary authorization for ${u.email} for [${tempDuration}].`
        );
        onNotificationTriggered('push', u.email, `You have been granted temporary access escalation for the next ${tempDuration}.`);
        showToast(`Escalated access granted to ${u.name} for ${tempDuration}.`, 'success');
        return { ...u, tempAccessExpires: tempDuration };
      }
      return u;
    }));
    setIsTempAccessOpen(false);
    setSelectedUserForTemp(null);
  };

  // E. Add / Create Custom Role
  const handleAddRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.name) {
      showToast('Role name is required.', 'error');
      return;
    }

    const created: SystemRoleItem = {
      id: `role-custom-${roles.length + 1}`,
      name: newRole.name,
      type: 'Custom',
      description: newRole.description || 'Custom tailored business permissions suite.',
      status: 'Active',
      permissionsCount: 12
    };

    setRoles(prev => [...prev, created]);
    setRolePermissions(prev => ({
      ...prev,
      [created.id]: {
        'CRM': true,
        'Leads': true,
        'Projects': false,
        'Procurement': false,
        'Inventory': false,
        'Finance': false,
        'HR & DMS': false,
        'B2B Marketplace': true,
        'Messaging': true,
        'Meetings': true
      }
    }));
    setIsAddRoleOpen(false);

    onLogTriggered(
      'SECURITY_ROLE_CREATED',
      'roles',
      created.id,
      'SUCCESS',
      `IAM Policy expanded: Added new Custom Role: ${created.name}.`
    );
    onNotificationTriggered('in_app', userSession?.email || 'admin@realtyconnect.in', `New administrative role "${created.name}" created successfully.`);
    showToast(`Custom Role "${created.name}" instantiated.`, 'success');
    setNewRole({ name: '', type: 'Custom', description: '' });
  };

  // F. Clone Role
  const handleCloneRole = (roleId: string) => {
    const source = roles.find(r => r.id === roleId);
    if (!source) return;

    const clonedId = `role-cloned-${roles.length + 1}`;
    const cloned: SystemRoleItem = {
      id: clonedId,
      name: `${source.name} (Cloned)`,
      type: 'Custom',
      description: `Replica blueprint of ${source.name}. ${source.description}`,
      status: 'Active',
      permissionsCount: source.permissionsCount
    };

    setRoles(prev => [...prev, cloned]);
    
    // Copy permissions matrix
    const sourcePerms = rolePermissions[roleId] || {};
    setRolePermissions(prev => ({
      ...prev,
      [clonedId]: { ...sourcePerms }
    }));

    onLogTriggered(
      'SECURITY_ROLE_CLONED',
      'roles',
      clonedId,
      'SUCCESS',
      `IAM Policy replication: Cloned role ${source.name} with ID ${clonedId}.`
    );
    onNotificationTriggered('in_app', userSession?.email || 'admin@realtyconnect.in', `Security role "${source.name}" has been cloned into "${cloned.name}".`);
    showToast(`Successfully cloned into "${cloned.name}".`, 'success');
  };

  // G. Toggle Role Status
  const handleToggleRoleStatus = (roleId: string) => {
    setRoles(prev => prev.map(r => {
      if (r.id === roleId) {
        const nextStatus = r.status === 'Active' ? 'Inactive' : 'Active';
        
        onLogTriggered(
          'SECURITY_ROLE_STATUS_CHANGED',
          'roles',
          roleId,
          'WARNING',
          `Security policy modification: Role ${r.name} status updated to ${nextStatus}.`
        );
        showToast(`Role "${r.name}" is now ${nextStatus}.`, 'info');
        return { ...r, status: nextStatus };
      }
      return r;
    }));
  };

  // H. Update Permissions in Matrix (Bulk or Single)
  const handleTogglePermission = (roleId: string, module: string) => {
    setRolePermissions(prev => {
      const currentRolePerms = prev[roleId] || {};
      const nextValue = !currentRolePerms[module];
      
      onLogTriggered(
        'ROLE_PERMISSION_UPDATED',
        'roles',
        roleId,
        'SUCCESS',
        `Access Control matrix adjusted: Swapped role [${roleId}] module [${module}] permission to [${nextValue ? 'ALLOWED' : 'DENIED'}].`
      );
      
      onNotificationTriggered(
        'push',
        'security@realtyconnect.in',
        `Access privileges updated for Role [${roleId}] in module [${module}].`
      );

      return {
        ...prev,
        [roleId]: {
          ...currentRolePerms,
          [module]: nextValue
        }
      };
    });
    showToast(`Permissions modified. Saved instantly.`, 'success');
  };

  // Bulk Perm Assignment
  const handleBulkPermissionAssignment = (roleId: string, value: boolean) => {
    setRolePermissions(prev => {
      const updated: Record<string, boolean> = {};
      SYSTEM_MODULES.forEach(m => {
        updated[m] = value;
      });

      onLogTriggered(
        'ROLE_BULK_PERMISSIONS_ASSIGNED',
        'roles',
        roleId,
        'SUCCESS',
        `Bulk access adjustment: Programmed all module permissions for role ${roleId} to ${value ? 'ALLOWED' : 'DENIED'}.`
      );

      return {
        ...prev,
        [roleId]: updated
      };
    });
    showToast(value ? 'Granted access to all modules.' : 'Cleared all modules access.', 'info');
  };

  // I. Session Management: Terminate Session
  const handleTerminateSession = (sessId: string, email: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessId));
    
    // Deactivate user session active flag
    setUsers(prev => prev.map(u => {
      if (u.email === email) {
        return { ...u, sessionActive: false };
      }
      return u;
    }));

    onLogTriggered(
      'SESSION_TERMINATED',
      'sessions',
      sessId,
      'SUCCESS',
      `Immediate security eviction: Session ${sessId} for user ${email} forcibly terminated by administrator.`
    );
    onNotificationTriggered('push', email, 'Your active enterprise session has been closed administratively. Please re-authenticate.');
    showToast(`Session terminated for ${email}.`, 'success');
  };

  // J. Policy Library: Sign off / Acknowledge compliance rules
  const handleAcknowledgePolicy = (policyId: string) => {
    setPolicies(prev => prev.map(p => {
      if (p.id === policyId) {
        onLogTriggered(
          'COMPLIANCE_POLICY_ACKNOWLEDGED',
          'compliance',
          policyId,
          'SUCCESS',
          `Legal Sign-off: User acknowledged compliance mandate ${p.title} (${p.standard}).`
        );
        showToast(`Compliance policy ${p.title} signed and acknowledged.`, 'success');
        return { ...p, acknowledged: true };
      }
      return p;
    }));
  };

  // K. Trigger Policy Change
  const handleApplySecurityPolicies = () => {
    onLogTriggered(
      'SECURITY_POLICY_UPDATED',
      'policies',
      'password-auth-config',
      'SUCCESS',
      `Policy Updated: Min Length: ${passwordMinLength}, UpperCase: ${pwdRequiresUpper}, SpecialChars: ${pwdRequiresSymbols}, Lockout threshold: ${bruteForceLockout} failed trials.`
    );
    onNotificationTriggered('in_app', 'all-users@realtyconnect.in', `Corporate Security Policies updated. Password compliance checks re-evaluated.`);
    showToast('Global Authentication and Lock Policies updated successfully.', 'success');
  };

  // L. Export Specific Audits
  const handleExportSecurityReport = (reportType: string) => {
    onLogTriggered(
      'SECURITY_REPORT_EXPORTED',
      'reports',
      reportType.toLowerCase().replace(/\s+/g, '-'),
      'SUCCESS',
      `Audit Export: Compiled and exported comprehensive PDF report for [${reportType}].`
    );
    showToast(`Compiled report "${reportType}" downloaded successfully.`, 'success');
  };

  // M. Simulate Brute Force failure triggering Locked state
  const handleSimulateFailedLogin = (userEmail: string) => {
    setUsers(prev => prev.map(u => {
      if (u.email === userEmail) {
        const nextFailed = u.failedAttempts + 1;
        const isLockedNow = nextFailed >= bruteForceLockout;
        const finalStatus = isLockedNow ? 'Locked' : u.status;

        if (isLockedNow) {
          onLogTriggered(
            'BRUTE_FORCE_LOCK_TRIGGERED',
            'users',
            u.id,
            'FAILURE',
            `FAILED LOGIN THRESHOLD REACHED: Account locked for user ${u.email} after ${nextFailed} failed sequential attempts.`
          );
          onNotificationTriggered(
            'email',
            u.email,
            `Your RealtyConnect Account has been locked. Please contact your system administrator to initiate unlock instructions.`
          );
          showToast(`LOCK TRIGGERED: ${u.name} account locked due to excessive failed logins!`, 'error');
        } else {
          onLogTriggered(
            'FAILED_LOGIN_ATTEMPT',
            'users',
            u.id,
            'WARNING',
            `Unauthenticated Access: Failed login trial #${nextFailed} for email ${u.email} from IP 10.14.85.22.`
          );
          showToast(`Logged failed attempt #${nextFailed} for ${u.name}.`, 'info');
        }

        return { ...u, failedAttempts: nextFailed, status: finalStatus as any };
      }
      return u;
    }));
  };

  // ==========================================
  // DATA FILTERING FOR USER LIST / COMPLIANCE LIST
  // ==========================================
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(globalSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(globalSearch.toLowerCase()) ||
      u.department.toLowerCase().includes(globalSearch.toLowerCase());
    
    const matchesRole = filterRole === 'All' || u.role === filterRole;
    const matchesDept = filterDept === 'All' || u.department === filterDept;
    const matchesStatus = filterStatus === 'All' || u.status === filterStatus;

    return matchesSearch && matchesRole && matchesDept && matchesStatus;
  });


  return (
    <div className="space-y-6 text-slate-100 font-sans" id="security-engine-root">
      
      {/* 1. COMPREHENSIVE HEADER HEADER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 relative overflow-hidden">
        {/* Visual brand background */}
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-purple-600/5 to-transparent pointer-events-none" />
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-indigo-400 rounded-xl border border-indigo-500/25">
              <Shield className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                Compliance
              </span>
              <h2 className="text-xl font-bold text-white font-display mt-0.5">
                Enterprise Security & Access Governance
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            Govern organizational structures, map role matrices, audit real-time changes under LOG-01 guidelines, inspect chained block hashes, and safeguard escrow dispatches.
          </p>
        </div>

        {/* Global Hub Reset & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2 min-w-[280px]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search Users, Roles, Events..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 pl-9 pr-8 text-xs text-slate-100 outline-none transition-all placeholder:text-slate-600"
            />
            {globalSearch && (
              <button onClick={() => setGlobalSearch('')} className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button 
            onClick={() => {
              setGlobalSearch('');
              setFilterRole('All');
              setFilterDept('All');
              setFilterStatus('All');
              showToast('Security search parameters reset.', 'info');
            }}
            className="bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
            title="Reset Filters"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. SUB NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-2 rounded-xl">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-250 hover:bg-slate-850'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Security Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-250 hover:bg-slate-850'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>User Directory</span>
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'roles'
                ? 'bg-indigo-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-250 hover:bg-slate-850'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Role & Permission Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'sessions'
                ? 'bg-indigo-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-250 hover:bg-slate-850'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sessions & Authentication</span>
          </button>

          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'compliance'
                ? 'bg-indigo-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-250 hover:bg-slate-850'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Compliance Center</span>
          </button>

          <button
            onClick={() => setActiveTab('integrations')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'integrations'
                ? 'bg-indigo-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-250 hover:bg-slate-850'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Cross-Module Integration Audit</span>
          </button>
        </div>

        {/* Global Export Action Drawer */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-500 font-mono font-bold px-1.5">Reports:</span>
          <button 
            onClick={() => setActiveReportPreview('User Access Report')}
            className="px-2 py-1 text-[10px] font-semibold bg-slate-900 hover:bg-slate-850 rounded text-slate-400 hover:text-indigo-400 border border-slate-800 transition-all cursor-pointer"
          >
            User Access
          </button>
          <button 
            onClick={() => setActiveReportPreview('Security Metrics Report')}
            className="px-2 py-1 text-[10px] font-semibold bg-slate-900 hover:bg-slate-850 rounded text-slate-400 hover:text-indigo-400 border border-slate-800 transition-all cursor-pointer"
          >
            Security & Audit
          </button>
        </div>
      </div>


      {/* 3. SWITCHABLE CORE WORKSPACES */}

      {/* ==========================================
          Tab 1: Security Dashboard
         ========================================== */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6" id="sec-dashboard-tab">
          
          {/* Main Security Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5">
              <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Total Security Users</div>
              <div className="text-3xl font-bold font-display text-white mt-1.5">{users.length}</div>
              <div className="flex items-center justify-between text-[10px] text-emerald-400 font-mono mt-1">
                <span>{users.filter(u => u.status === 'Active').length} Active</span>
                <span>{users.filter(u => u.status === 'Inactive').length} Inactive</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5">
              <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Active Concurrent Sessions</div>
              <div className="text-3xl font-bold font-display text-white mt-1.5">{sessions.length}</div>
              <div className="flex items-center justify-between text-[10px] text-indigo-400 font-mono mt-1">
                <span>Timeout: {sessionTimeoutMinutes} min</span>
                <span>Max Allowed: {maxConcurrentSessions}</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5">
              <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Locked Directory Accounts</div>
              <div className="text-3xl font-bold font-display text-red-400 mt-1.5">
                {users.filter(u => u.status === 'Locked').length}
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>Lockout Limit: {bruteForceLockout} failed</span>
                <span className="text-red-400 font-bold">Policy Active</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5">
              <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Critical Compliance Alerts</div>
              <div className="text-3xl font-bold font-display text-amber-400 mt-1.5">
                {policies.filter(p => p.status !== 'Compliant').length}
              </div>
              <div className="flex items-center justify-between text-[10px] text-amber-500 font-mono mt-1">
                <span>Pending Review: {policies.filter(p => p.status === 'Pending Review').length}</span>
                <span>ISO 27001</span>
              </div>
            </div>

          </div>

          {/* Dual Column: Live Threat Overview & System Audits */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Live Security Alerter / Shield Hub */}
            <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    Access Control Audit
                  </h4>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                    Live
                  </span>
                </div>

                <div className="space-y-4 mt-5">
                  <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-white">Failed Login Attack Detected</h5>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                        IP address <span className="font-mono text-red-300">10.14.85.112</span> failed 5 sequential attempts accessing <span className="text-slate-300">nisha.g@realtyconnect.in</span>. Lockout policy auto-applied.
                      </p>
                      <button 
                        onClick={() => handleToggleLockUser('usr-105')}
                        className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 mt-2 font-bold flex items-center gap-0.5 cursor-pointer"
                      >
                        Unlock Account <Unlock className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-white">Privileged Role Modification</h5>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                        Administrative access keys were altered for role <span className="font-bold text-slate-300">role-procur-exec</span>.
                      </p>
                      <span className="text-[9px] text-slate-500 font-mono block mt-1">User: ananya.sen@realtyconnect.in</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl flex items-start gap-3">
                    <Key className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-white">Temporary Authorization</h5>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                        Temporary access was provisioned for external developer to trace logistics APIs. Expiring shortly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-850/60 mt-6 flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>RERA Data Guard v2.5</span>
                <span>Active 128-bit TLS TLS</span>
              </div>
            </div>

            {/* Recent Cryptographic Logs Telemetry Timeline */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-indigo-400" />
                      Compliance Data Changes & Real-Time Logs
                    </h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Tracking previous vs current value updates to assure LOG-01 regulations</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded">
                    {dataChanges.length} AUDITED CHANGES
                  </span>
                </div>

                <div className="mt-4 space-y-3.5">
                  {dataChanges.map((change) => (
                    <div key={change.id} className="p-3.5 bg-slate-950/80 border border-slate-850 rounded-xl space-y-2">
                      <div className="flex flex-wrap items-center justify-between text-[11px] font-mono gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/10">
                            {change.module}
                          </span>
                          <span className="text-slate-400">Record: {change.recordRef}</span>
                        </div>
                        <span className="text-slate-500">{change.changedDate}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-1 font-mono text-xs">
                        <div>
                          <span className="text-[9px] text-slate-500 block uppercase">Modified Field</span>
                          <span className="text-slate-200 font-semibold">{change.field}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-red-500 block uppercase">Previous Value</span>
                          <span className="text-red-400 bg-red-500/5 px-1 rounded line-through border border-red-500/10 block mt-0.5 truncate">{change.prevValue}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-emerald-500 block uppercase">Updated Value</span>
                          <span className="text-emerald-400 bg-emerald-500/5 px-1 rounded border border-emerald-500/10 block mt-0.5 font-bold truncate">{change.newValue}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-400 flex justify-between items-center font-mono">
                        <span>Changed By: <strong className="text-slate-300">{change.changedBy}</strong></span>
                        <span className="text-[9px] text-slate-500">REF_ID: {change.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-850 pt-4">
                <p className="text-[11px] text-slate-400 leading-relaxed flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Every administrative alteration generates an unalterable blockchain-simulated ledger trace.
                </p>
                <button 
                  onClick={() => {
                    onLogTriggered('COMPLIANCE_HEALTH_CHECKED', 'compliance', 'global', 'SUCCESS', 'Executed full cross-tenant data consistency check.');
                    showToast('Data consistency checks passed. Ledgers are aligned.', 'success');
                  }}
                  className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold cursor-pointer transition-all"
                >
                  Verify Compliance Ledgers
                </button>
              </div>

            </div>

          </div>

        </div>
      )}


      {/* ==========================================
          Tab 2: User Directory & Access Management
         ========================================== */}
      {activeTab === 'users' && (
        <div className="space-y-6" id="user-directory-tab">
          
          {/* Action Row & Filter controls */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div>
                <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1">Filter Role</label>
                <select 
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded px-2.5 py-1.5 outline-none focus:border-indigo-500"
                >
                  <option value="All">All Roles</option>
                  <option value="System Admin">System Admin</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Compliance Officer">Compliance Officer</option>
                  <option value="Procurement Executive">Procurement Executive</option>
                  <option value="Sales Broker">Sales Broker</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1">Filter Department</label>
                <select 
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded px-2.5 py-1.5 outline-none focus:border-indigo-500"
                >
                  <option value="All">All Departments</option>
                  <option value="Audit & Compliance">Audit & Compliance</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Legal">Legal</option>
                  <option value="Procurement">Procurement</option>
                  <option value="Sales">Sales</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1">Filter Status</label>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded px-2.5 py-1.5 outline-none focus:border-indigo-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Locked">Locked</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={() => setIsAddUserOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Onboard New User</span>
              </button>
            </div>
          </div>

          {/* User Directory List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-850 flex justify-between items-center bg-slate-900/60">
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">
                Active Enterprise Security Users ({filteredUsers.length})
              </h4>
              <span className="text-[10px] font-mono text-slate-500">Click actions to test failed logins or locks</span>
            </div>

            <div className="divide-y divide-slate-850">
              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center italic text-slate-500 text-xs">
                  No directory users match current filtering criteria.
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div key={user.id} className="p-4 hover:bg-slate-850/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-bold text-indigo-400 text-xs flex-shrink-0">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="text-xs font-bold text-white">{user.name}</h5>
                          <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.2 rounded border border-slate-850">
                            {user.role}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            | {user.department}
                          </span>
                          {user.tempAccessExpires && (
                            <span className="text-[9px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/25 font-mono">
                              Temp: {user.tempAccessExpires} Escalation
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{user.email}</p>
                        
                        {/* Device log */}
                        <p className="text-[10px] text-slate-500 font-mono mt-1.5">
                          Last Session: {user.lastLogin} ({user.device}) • IP: {user.lastLoginIp}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
                      
                      {/* Status Badges */}
                      {user.status === 'Active' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">
                          <CheckCircle2 className="w-3 h-3" /> ACTIVE
                        </span>
                      ) : user.status === 'Locked' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded">
                          <AlertCircle className="w-3 h-3" /> LOCKED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-slate-400 bg-slate-950 border border-slate-800 px-2 py-1 rounded">
                          <X className="w-3 h-3" /> INACTIVE
                        </span>
                      )}

                      <span className="text-slate-700 font-mono">|</span>

                      {/* Interactive testing actions */}
                      <button
                        onClick={() => handleSimulateFailedLogin(user.email)}
                        className="px-2.5 py-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded text-[10px] font-semibold text-amber-400 hover:text-amber-300 cursor-pointer transition-all"
                        title="Simulate authentication failure for testing"
                      >
                        Fail Login
                      </button>

                      <button
                        onClick={() => handleToggleLockUser(user.id)}
                        className={`px-2.5 py-1 border rounded text-[10px] font-semibold cursor-pointer transition-all ${
                          user.status === 'Locked'
                            ? 'bg-emerald-950/20 border-emerald-800 text-emerald-400 hover:text-emerald-300'
                            : 'bg-red-950/20 border-red-800 text-red-400 hover:text-red-300'
                        }`}
                      >
                        {user.status === 'Locked' ? 'Unlock Account' : 'Forcibly Lock'}
                      </button>

                      <button
                        onClick={() => handleToggleUserStatus(user.id)}
                        className="px-2.5 py-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded text-[10px] font-semibold cursor-pointer transition-all"
                      >
                        {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>

                      <button
                        onClick={() => {
                          setSelectedUserForTemp(user);
                          setIsTempAccessOpen(true);
                        }}
                        className="px-2.5 py-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-indigo-400 hover:text-indigo-300 rounded text-[10px] font-semibold cursor-pointer transition-all"
                      >
                        Temp Access
                      </button>

                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Dialog: Onboard User */}
          {isAddUserOpen && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-sm font-bold text-white font-display flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-indigo-400" />
                    Onboard New Corporate User
                  </h4>
                  <button onClick={() => setIsAddUserOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAddUserSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Full Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={newUser.name}
                      onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Email Address</label>
                    <input 
                      type="email"
                      placeholder="e.g. ramesh.k@realtyconnect.in"
                      value={newUser.email}
                      onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-mono mb-1">Initial Role</label>
                      <select 
                        value={newUser.role}
                        onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none"
                      >
                        <option>System Admin</option>
                        <option>Project Manager</option>
                        <option>Compliance Officer</option>
                        <option>Procurement Executive</option>
                        <option>Sales Broker</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-mono mb-1">Department</label>
                      <select 
                        value={newUser.department}
                        onChange={(e) => setNewUser(prev => ({ ...prev, department: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none"
                      >
                        <option>Audit & Compliance</option>
                        <option>Engineering</option>
                        <option>Legal</option>
                        <option>Procurement</option>
                        <option>Sales</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-2">
                    <button 
                      type="button" 
                      onClick={() => setIsAddUserOpen(false)} 
                      className="px-4 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-semibold cursor-pointer"
                    >
                      Provision Credentials
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Dialog: Temporary Access Duration */}
          {isTempAccessOpen && selectedUserForTemp && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-sm font-bold text-white font-display flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-purple-400" />
                    Escalate Access Privileges
                  </h4>
                  <button onClick={() => setIsTempAccessOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleGrantTempAccess} className="space-y-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-mono block">Escalating User:</span>
                    <strong className="text-slate-100 text-sm">{selectedUserForTemp.name}</strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{selectedUserForTemp.email}</span>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Temporary Expiry Duration</label>
                    <select 
                      value={tempDuration}
                      onChange={(e) => setTempDuration(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none"
                    >
                      <option>1 Hour</option>
                      <option>2 Hours</option>
                      <option>8 Hours (Single Shift)</option>
                      <option>24 Hours</option>
                      <option>7 Days (Temporary Vendor)</option>
                    </select>
                  </div>

                  <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded text-[11px] text-indigo-300 leading-relaxed">
                    This escalation registers a special cryptographic session token. The user will lose write permissions automatically once expiration is met.
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button 
                      type="button" 
                      onClick={() => setIsTempAccessOpen(false)} 
                      className="px-3.5 py-1.5 bg-slate-950 border border-slate-850 rounded text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold cursor-pointer"
                    >
                      Apply Escalate
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}


      {/* ==========================================
          Tab 3: Role & Permission Matrix
         ========================================== */}
      {activeTab === 'roles' && (
        <div className="space-y-6" id="role-matrix-tab">
          
          {/* Controls Bar */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                Role vs Module Explicit Privileges
              </h4>
              <p className="text-[10px] text-slate-500 font-mono">Configure specific permissions across all corporate tools instantly</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsAddRoleOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Custom Role</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Roles Selection Drawer & Cloning Panel */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h5 className="text-xs font-mono font-bold text-slate-300 uppercase border-b border-slate-850 pb-2">
                Active Privilege Blueprints
              </h5>

              <div className="space-y-3">
                {roles.map((role) => {
                  const isSelected = activeMatrixRole === role.id;
                  return (
                    <div 
                      key={role.id}
                      onClick={() => setActiveMatrixRole(role.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-950 border-indigo-500 shadow-md'
                          : 'bg-slate-950/40 border-slate-850 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{role.name}</span>
                        <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                          role.type === 'System'
                            ? 'bg-red-500/10 text-red-400 border-red-500/15'
                            : role.type === 'Organization'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/15'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}>
                          {role.type.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-[10.5px] text-slate-400 mt-1.5 leading-relaxed">{role.description}</p>
                      
                      <div className="pt-3 mt-3 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <span>Modules: {Object.values(rolePermissions[role.id] || {}).filter(Boolean).length} allowed</span>
                        
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => handleCloneRole(role.id)}
                            className="p-1 hover:bg-slate-850 rounded text-slate-400 hover:text-white transition-all cursor-pointer"
                            title="Clone Role Blueprint"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          
                          <button 
                            onClick={() => handleToggleRoleStatus(role.id)}
                            className={`p-1 rounded transition-all cursor-pointer ${
                              role.status === 'Active' ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-500 hover:text-slate-300'
                            }`}
                            title={role.status === 'Active' ? 'Deactivate Role' : 'Activate Role'}
                          >
                            {role.status === 'Active' ? <CheckSquare className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Privilege Grid Matrix for Selected Role */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-850 pb-3 flex-wrap gap-2">
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">Mutating Privileges of:</span>
                    <h5 className="text-sm font-bold text-indigo-400 font-display">
                      {roles.find(r => r.id === activeMatrixRole)?.name || 'Default Role'}
                    </h5>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleBulkPermissionAssignment(activeMatrixRole, true)}
                      className="px-2.5 py-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-emerald-400 hover:text-emerald-300 rounded text-[10px] font-mono font-bold cursor-pointer"
                    >
                      Allow All
                    </button>
                    <button
                      onClick={() => handleBulkPermissionAssignment(activeMatrixRole, false)}
                      className="px-2.5 py-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-red-400 hover:text-red-300 rounded text-[10px] font-mono font-bold cursor-pointer"
                    >
                      Deny All
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  Toggle modules below to apply access controls. When a module is checked, accounts possessing this role can access the correlated interface, dispatch documents, and trigger background computations.
                </p>

                {/* Grid Matrix Table */}
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SYSTEM_MODULES.map((module) => {
                    const isAllowed = (rolePermissions[activeMatrixRole] || {})[module];
                    return (
                      <div 
                        key={module}
                        onClick={() => handleTogglePermission(activeMatrixRole, module)}
                        className={`p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                          isAllowed
                            ? 'bg-indigo-950/15 border-indigo-500/40'
                            : 'bg-slate-950/40 border-slate-850/60 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg border ${
                            isAllowed ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-slate-900 text-slate-500 border-slate-850'
                          }`}>
                            <Shield className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">{module} Integration</span>
                            <span className="text-[9px] text-slate-500 font-mono">
                              Role Scope: {isAllowed ? 'FULL PRIVILEGE' : 'NO INTEGRATION ACCESS'}
                            </span>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isAllowed ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-800 text-transparent'
                        }`}>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action and Preview Summary bar */}
              <div className="pt-4 border-t border-slate-850 mt-6 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-slate-500 gap-2">
                  <span>Last Checked: {new Date().toISOString().replace('T', ' ').substr(0, 10)}</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Policy Enforced (LOG-01 compliance)
                  </span>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-850 text-[10px] text-slate-400 flex items-start gap-2 leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>
                    <strong>Feature Actions Matrix Preview:</strong> Module View, Create, Edit, Delete, Export, and Import sub-actions are enabled automatically based on selected module scopes. (UI Ready for bulk delegation).
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* Dialog: Create Custom Role */}
          {isAddRoleOpen && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-sm font-bold text-white font-display flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-indigo-400" />
                    Instantiate Custom Role
                  </h4>
                  <button onClick={() => setIsAddRoleOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAddRoleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Role Alias / Code</label>
                    <input 
                      type="text"
                      placeholder="e.g. Audit Assessor"
                      value={newRole.name}
                      onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Role Functional Description</label>
                    <textarea 
                      placeholder="Functional description of role responsibilities..."
                      rows={3}
                      value={newRole.description}
                      onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="p-3 bg-slate-950 rounded text-[11px] text-slate-400 leading-relaxed">
                    Custom roles can instantly clone system role templates or assign empty modules. Matrix can be adjusted granularly on save.
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button 
                      type="button" 
                      onClick={() => setIsAddRoleOpen(false)} 
                      className="px-4 py-2 bg-slate-950 border border-slate-850 rounded text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-semibold cursor-pointer"
                    >
                      Instantiate Blueprint
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}


      {/* ==========================================
          Tab 4: Sessions & Authentication Policies
         ========================================== */}
      {activeTab === 'sessions' && (
        <div className="space-y-6" id="sessions-auth-tab">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Active Sessions Control & evict */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">
                    Active Concurrent Sessions
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Forcibly evict inactive sessions to meet security policy limit</p>
                </div>
                <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/25">
                  {sessions.length} ACTIVE
                </span>
              </div>

              <div className="space-y-3">
                {sessions.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 italic text-xs">
                    All administrative sessions cleared. Only current portal thread active.
                  </div>
                ) : (
                  sessions.map((sess) => (
                    <div key={sess.id} className="p-3 bg-slate-950/80 border border-slate-850 rounded-xl flex items-center justify-between gap-4 font-mono text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-[11px]">{sess.email}</span>
                          <span className="text-[9px] bg-slate-900 text-slate-400 border border-slate-800 px-1 py-0.1 rounded">
                            {sess.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          IP: {sess.ip} • Region: {sess.location} • Device: {sess.device}
                        </p>
                        <p className="text-[9px] text-slate-500">Activity: {sess.lastActivity}</p>
                      </div>

                      <button
                        onClick={() => handleTerminateSession(sess.id, sess.email)}
                        className="px-2.5 py-1.5 bg-red-950/20 border border-red-800 hover:bg-red-950/40 text-red-400 hover:text-red-300 rounded text-[10px] font-bold cursor-pointer transition-all"
                      >
                        Evict Thread
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-4 border-t border-slate-850 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Session Timeout Period (Mins)</label>
                  <input 
                    type="number"
                    min={5}
                    max={120}
                    value={sessionTimeoutMinutes}
                    onChange={(e) => setSessionTimeoutMinutes(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded p-1.5 text-xs text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Concurrent Limit per User</label>
                  <input 
                    type="number"
                    min={1}
                    max={10}
                    value={maxConcurrentSessions}
                    onChange={(e) => setMaxConcurrentSessions(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded p-1.5 text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

            </div>

            {/* Global Pass Policy and Lock Configuration */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="border-b border-slate-850 pb-3 flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-indigo-400" />
                  Authentication Policy
                </h4>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 rounded border border-emerald-500/15">
                  Regulatory Ready
                </span>
              </div>

              <div className="space-y-4 text-xs">
                
                {/* Minimum Length */}
                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[10px] text-slate-400">
                    <span>MINIMUM PASSWORD LENGTH</span>
                    <span className="text-indigo-400 font-bold">{passwordMinLength} Characters</span>
                  </div>
                  <input 
                    type="range"
                    min={8}
                    max={20}
                    value={passwordMinLength}
                    onChange={(e) => setPasswordMinLength(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                {/* Character Requirements */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-850">
                    <span className="font-mono text-slate-300 text-[11px]">Enforce Uppercase Characters</span>
                    <input 
                      type="checkbox" 
                      checked={pwdRequiresUpper}
                      onChange={(e) => setPwdRequiresUpper(e.target.checked)}
                      className="rounded accent-indigo-600 w-3.5 h-3.5 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-850">
                    <span className="font-mono text-slate-300 text-[11px]">Enforce Numeric Digits</span>
                    <input 
                      type="checkbox" 
                      checked={pwdRequiresNumbers}
                      onChange={(e) => setPwdRequiresNumbers(e.target.checked)}
                      className="rounded accent-indigo-600 w-3.5 h-3.5 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-850">
                    <span className="font-mono text-slate-300 text-[11px]">Enforce Special Characters (@, #, $, %)</span>
                    <input 
                      type="checkbox" 
                      checked={pwdRequiresSymbols}
                      onChange={(e) => setPwdRequiresSymbols(e.target.checked)}
                      className="rounded accent-indigo-600 w-3.5 h-3.5 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Password Expiry (Days)</label>
                    <select 
                      value={pwdExpiryDays}
                      onChange={(e) => setPwdExpiryDays(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 outline-none"
                    >
                      <option value={30}>30 Days</option>
                      <option value={60}>60 Days</option>
                      <option value={90}>90 Days</option>
                      <option value={180}>180 Days (Loose)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Brute Force Limit Lock</label>
                    <select 
                      value={bruteForceLockout}
                      onChange={(e) => setBruteForceLockout(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 outline-none"
                    >
                      <option value={3}>3 Failed Trials</option>
                      <option value={5}>5 Failed Trials</option>
                      <option value={10}>10 Failed Trials</option>
                    </select>
                  </div>
                </div>

                {/* Placeholders UI for future MFA and trusted devices */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                    Upcoming Roadmap Security
                  </span>
                  
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="text-slate-400 font-semibold flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-purple-400" /> Multi-Factor Auth (MFA)
                    </span>
                    <span className="text-slate-500 italic">Future Sprint</span>
                  </div>

                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="text-slate-400 font-semibold flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-purple-400" /> Trusted IP Whitelists
                    </span>
                    <span className="text-slate-500 italic">Future Sprint</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApplySecurityPolicies}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg cursor-pointer transition-all text-xs"
                >
                  Save Global Security Policies
                </button>

              </div>
            </div>

          </div>

          {/* Access Control scope configuration panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest border-b border-slate-850 pb-2">
              Explicit Access Control Scopes (Tenant & Project Level)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Organization Access</label>
                <select value={scopeOrg} onChange={(e) => setScopeOrg(e.target.value)} className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-white">
                  <option>Multi-Tenant Allowed</option>
                  <option>Strict Single Organization</option>
                  <option>Subsidiary Sandbox Isolation</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Departmental Access</label>
                <select value={scopeDept} onChange={(e) => setScopeDept(e.target.value)} className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-white">
                  <option>Local Restriction</option>
                  <option>Global Cross-Dept Auditing</option>
                  <option>Ad-hoc Delegated Views</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Project Boundary Rules</label>
                <select value={scopeProject} onChange={(e) => setScopeProject(e.target.value)} className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-white">
                  <option>Enforce Workspace Boundary</option>
                  <option>Cross-Project Visibility</option>
                  <option>Custom Stakeholder Pool</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Record Privacy Mandate (UI Ready)</label>
                <select value={recordAccessRule} onChange={(e) => setRecordAccessRule(e.target.value)} className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-white">
                  <option>Creator & Compliance Only</option>
                  <option>Unrestricted Team Sharing</option>
                  <option>Dual Authority Handshake</option>
                </select>
              </div>
            </div>
          </div>

        </div>
      )}


      {/* ==========================================
          Tab 5: Compliance Center & Policy Library
         ========================================== */}
      {activeTab === 'compliance' && (
        <div className="space-y-6" id="compliance-center-tab">
          
          {/* Compliance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Compliance Health Index</span>
              <div className="text-3xl font-extrabold text-emerald-400">96.8% Compliant</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">Evaluating security alerts, active locked directory users, and completed policy library reviews.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Policies Acknowledged</span>
              <div className="text-3xl font-extrabold text-white">
                {policies.filter(p => p.acknowledged).length} / {policies.length} Policies
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">Track user-level acknowledgements and policy sign-offs for legal audits.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Regulatory Coverage</span>
              <div className="text-3xl font-extrabold text-indigo-400">RERA, SOC2, ISO27001</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">Aligned with government RERA data guidelines and corporate financial accountability structures.</p>
            </div>

          </div>

          {/* Policies Library List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-850 bg-slate-900/60 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">
                  Compliance Policy Library & Legislative Audit Shelf
                </h4>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Mandates governing the RealtyConnect™ multi-subsidiary framework</p>
              </div>
              <span className="text-[10px] font-mono text-slate-400">System Authoritative</span>
            </div>

            <div className="divide-y divide-slate-850">
              {policies.map((p) => (
                <div key={p.id} className="p-5 hover:bg-slate-850/10 transition-all space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/25">
                        {p.id}
                      </span>
                      <h5 className="text-sm font-bold text-white">{p.title}</h5>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Standard: {p.standard}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Status badge */}
                      {p.status === 'Compliant' ? (
                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">
                          Compliant
                        </span>
                      ) : p.status === 'Under Audit' ? (
                        <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded animate-pulse">
                          Under Audit
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded">
                          Pending Review
                        </span>
                      )}

                      <span className="text-slate-800">|</span>

                      {/* Acknowledgement Status */}
                      {p.acknowledged ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                          <Check className="w-3.5 h-3.5" /> Acknowledged Sign-Off
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAcknowledgePolicy(p.id)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-semibold cursor-pointer transition-all flex items-center gap-1"
                        >
                          Acknowledge & Sign
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
                    {p.description}
                  </p>

                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                    <span>Assigned Policy Owner: <strong className="text-slate-400">{p.owner}</strong></span>
                    <span>Last Reviewed: {p.lastReview}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}


      {/* ==========================================
          Tab 6: Cross-Module Integration Audit
         ========================================== */}
      {activeTab === 'integrations' && (
        <div className="space-y-6" id="integrations-tab">
          
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-400" />
              Integration Access Control & Activity History Reconciliation
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Security rules map every module to user permission scopes. Review the audit log for each module below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-400" /> Enterprise CRM Audit
                </span>
                <span className="text-[9px] font-mono text-slate-500">Access Control Resolved</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Prevents third-party suppliers from browsing private buyer leads or sales pipelines. Maintains a localized account interaction log.
              </p>
              <div className="bg-slate-950 p-2 rounded text-[10px] font-mono text-slate-500 flex justify-between">
                <span>Rule Code: CRM-SEC-01</span>
                <span className="text-emerald-400">Passed Check</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-400" /> Procurement Bid Security
                </span>
                <span className="text-[9px] font-mono text-slate-500">Blind Bidding Enforced</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Secures materials RFQs against backchannel sharing. Logs full history of bid placement, vendor pricing updates, and release of tender details.
              </p>
              <div className="bg-slate-950 p-2 rounded text-[10px] font-mono text-slate-500 flex justify-between">
                <span>Rule Code: PROC-SEC-04</span>
                <span className="text-emerald-400">Passed Check</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-400" /> Finance & Escrow Audits
                </span>
                <span className="text-[9px] font-mono text-slate-500">Dual Auth Required</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Every escrow billing action requires dual administrator validation. Releases are signed with 64-character SHA-256 block hash references.
              </p>
              <div className="bg-slate-950 p-2 rounded text-[10px] font-mono text-slate-500 flex justify-between">
                <span>Rule Code: FIN-SEC-02</span>
                <span className="text-emerald-400">Passed Check</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-400" /> Document Vault (DMS) Quarantine
                </span>
                <span className="text-[9px] font-mono text-slate-500">Virus Malware Check</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Uploaded blueprints are quarantined and MD5 checked against threat databases before publishing to the project network workspace.
              </p>
              <div className="bg-slate-950 p-2 rounded text-[10px] font-mono text-slate-500 flex justify-between">
                <span>Rule Code: DMS-SEC-09</span>
                <span className="text-emerald-400">Passed Check</span>
              </div>
            </div>

          </div>

          <div className="bg-indigo-950/25 border border-indigo-500/25 p-5 rounded-2xl flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-white font-mono flex items-center gap-1">
                <Check className="w-4 h-4 text-indigo-400" />
                Sensitive Action Log Delegates Active
              </h5>
              <p className="text-[11.5px] text-indigo-300">
                Active alerts are routed automatically to compliance officers when failed thresholds or unauthorized accesses occur.
              </p>
            </div>

            <button
              onClick={() => {
                onLogTriggered('INTEGRATIONS_AUDIT_STATED', 'servers', 'global', 'SUCCESS', 'Executed live integration security test suite.');
                showToast('Initiated security handshake across modules. Handshake verified successfully!', 'success');
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold text-xs cursor-pointer transition-all"
            >
              Run Global Modules Audit
            </button>
          </div>

        </div>
      )}


      {/* ==========================================
          Dialog Modal: Report Generator Preview
         ========================================== */}
      {activeReportPreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h4 className="text-sm font-bold text-white font-display">
                  Regulatory Compliance Report Previews
                </h4>
              </div>
              <button onClick={() => setActiveReportPreview(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Printed Report Body */}
            <div className="bg-white text-slate-900 p-6 rounded-xl space-y-4 font-mono text-[10.5px] border border-slate-300 shadow-inner h-96 overflow-y-auto">
              <div className="border-b-2 border-slate-800 pb-3 flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-extrabold uppercase font-display text-slate-900">REALTYCONNECT™ B2B GATEWAY</h3>
                  <p className="text-[9px] text-slate-500 mt-0.5">Compliance & Risk Management Ledger Office</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-500">Compiled: {new Date().toISOString().replace('T', ' ').substr(0, 16)}</p>
                  <p className="text-[9px] text-slate-500">Regulation: Log-01 / SOC2 Trust</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 text-[11px] uppercase underline">Report Type: {activeReportPreview.toUpperCase()}</h4>
                <p className="text-[10px] text-slate-600 leading-relaxed font-sans">
                  This document serves as an official snapshot of authorization, role definitions, and access configurations. In accordance with RERA Section 4, this ledger is archived securely and is protected against administrative alterations.
                </p>
              </div>

              {/* Data Table */}
              <div className="border border-slate-300 rounded overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-bold text-[9px]">
                      <th className="p-2 border-r border-slate-300">User ID</th>
                      <th className="p-2 border-r border-slate-300">Assigned Role</th>
                      <th className="p-2 border-r border-slate-300">Access Perms</th>
                      <th className="p-2">Compliance Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-300">
                      <td className="p-2 border-r border-slate-300 font-bold">devendra.s@realtyconnect.in</td>
                      <td className="p-2 border-r border-slate-300">System Admin</td>
                      <td className="p-2 border-r border-slate-300">60/60 (Full Scope)</td>
                      <td className="p-2">Compliant (Sys)</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="p-2 border-r border-slate-300 font-bold">vikram.r@realtyconnect.in</td>
                      <td className="p-2 border-r border-slate-300">Project Manager</td>
                      <td className="p-2 border-r border-slate-300">35/60 (Proj Limit)</td>
                      <td className="p-2">Compliant (Prj)</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="p-2 border-r border-slate-300 font-bold">ananya.sen@realtyconnect.in</td>
                      <td className="p-2 border-r border-slate-300">Compliance Officer</td>
                      <td className="p-2 border-r border-slate-300 font-bold">42/60 (Audit Limit)</td>
                      <td className="p-2">Compliant (Aud)</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-r border-slate-300 font-bold text-red-600">nisha.g@realtyconnect.in</td>
                      <td className="p-2 border-r border-slate-300">Materials Vendor</td>
                      <td className="p-2 border-r border-slate-300 text-slate-500">No active access</td>
                      <td className="p-2 text-red-600 font-bold">Locked - Security Alert</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Cryptographic block signature */}
              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded text-[8px] text-slate-500 space-y-1 leading-relaxed">
                <strong>METADATA ENVELOPE BLOCK SIGNATURE:</strong>
                <p className="break-all font-mono">
                  SHA256_compiled_report:{simulateSHA256(activeReportPreview + 'realtyconnect-foundation-v1')}
                </p>
                <p className="text-[7.5px] italic">This file has been digitally signed using the system private security certificate to assure authenticity during regulatory audits.</p>
              </div>
            </div>

            {/* Actions for reports */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-[10px] font-mono text-slate-500">Compliance Code LOG-02 Applied</span>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveReportPreview(null)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded text-xs text-slate-400 hover:text-white"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => handleExportSecurityReport(activeReportPreview)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Export Signed Report
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
