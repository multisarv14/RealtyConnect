/**
 * RealtyConnect™ Sprint 23 - Analytics, Business Intelligence & Subscription Management Engine
 * A clean, highly legible Swiss Slate styled dashboard.
 */

import { appStore } from '../lib/appStore';
import React, { useState, useEffect } from 'react';
import { 
  BarChart2, Shield, Calendar, Users, TrendingUp, Layers, DollarSign, 
  Search, Filter, FileText, Download, Play, CheckCircle2, AlertTriangle, 
  RefreshCw, ArrowUpRight, HelpCircle, UserCheck, ShieldCheck, 
  Trash2, Send, Bookmark, CreditCard, Layers3, Activity, Clock, SlidersHorizontal,
  Plus, ChevronRight, Check, X, Printer, FileSpreadsheet, Lock
} from 'lucide-react';

interface EngineProps {
  userSession: { email: string; role: string; permissions: string[] } | null;
  onLogTriggered: (action: string, entity: string, entityId: string, status: 'SUCCESS' | 'FAILURE' | 'WARNING', details: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onNotificationTriggered: (type: 'email' | 'sms' | 'push' | 'in_app', recipient: string, content: string) => void;
  setActiveViewMode: (mode: any) => void;
}

// 1. MOCK INTEGRATED DATA REPRESENTING RECON MODULES
const INTEGRATION_STATS = {
  crm: { customerSatisfaction: '94.2%', pipelineDeals: 142, averageLtv: '₹14.2L' },
  leads: { totalLeads: 2480, convertedLeads: 854, conversionRate: '34.4%' },
  projects: { totalActive: 12, milestoneStatus: '88% On-Time', delayAlerts: 1 },
  finance: { grossRevenue: '₹2.48 Cr', monthlyRecurring: '₹34.5 Lakhs', pendingDues: '₹8.4 Lakhs' },
  procurement: { vendorsEvaluated: 48, totalPoAmount: '₹94.2 Lakhs', savingPct: '12.4%' },
  inventory: { totalStockItems: 1450, stockoutAlerts: 2, totalValue: '₹58.6 Lakhs' },
  hr: { activeHeadcount: 124, departmentCount: 8, averagePerformance: '4.8/5.0' },
  marketplace: { listedProducts: 342, totalSalesValue: '₹18.4 Lakhs', activeSuppliers: 112 },
  networking: { activeConnections: 412, engagementRate: '78.5%', monthlyMeetings: 64 },
  feed: { totalPosts: 128, interactionCount: 1542, reachRate: '88.2%' },
  dms: { totalDocuments: 894, storageUsed: '4.2 GB', storageLimit: '10 GB' }
};

// 2. MOCK SUBSCRIPTION PLANS (PLAN DETAILS)
interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  trialDuration: string;
  features: string[];
  storageLimit: string;
  userLimit: number;
  orgLimit: number;
  supportLevel: string;
  status: 'Active' | 'Popular' | 'Custom';
}

const PLANS_DATA: SubscriptionPlan[] = [
  {
    id: 'plan-free',
    name: 'Free Trial',
    description: 'Basic access to B2B Directory and secure messaging feed.',
    priceMonthly: 0,
    priceYearly: 0,
    trialDuration: '14 Days',
    features: ['directory', 'messaging', 'business feed'],
    storageLimit: '500 MB',
    userLimit: 2,
    orgLimit: 1,
    supportLevel: 'Community Support',
    status: 'Active'
  },
  {
    id: 'plan-starter',
    name: 'Starter Plan',
    description: 'Perfect for small scale contracting firms and materials traders.',
    priceMonthly: 4999,
    priceYearly: 49900,
    trialDuration: '0 Days',
    features: ['directory', 'messaging', 'business feed', 'marketplace', 'crm'],
    storageLimit: '2 GB',
    userLimit: 5,
    orgLimit: 1,
    supportLevel: 'Email Support',
    status: 'Active'
  },
  {
    id: 'plan-professional',
    name: 'Professional Plan',
    description: 'Ideal for mid-sized builders seeking robust RFQ and project management tools.',
    priceMonthly: 14999,
    priceYearly: 149900,
    trialDuration: '7 Days',
    features: ['directory', 'messaging', 'business feed', 'marketplace', 'crm', 'projects', 'rfq', 'procurement', 'inventory'],
    storageLimit: '10 GB',
    userLimit: 25,
    orgLimit: 3,
    supportLevel: 'Priority Email & Chat',
    status: 'Popular'
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise Plan',
    description: 'Full operational suite including custom Analytics, Finance, and HR DMS.',
    priceMonthly: 29999,
    priceYearly: 299900,
    trialDuration: '14 Days',
    features: ['directory', 'messaging', 'business feed', 'marketplace', 'crm', 'projects', 'rfq', 'procurement', 'inventory', 'finance', 'analytics', 'hr_dms', 'document_management'],
    storageLimit: '100 GB',
    userLimit: 100,
    orgLimit: 10,
    supportLevel: 'Dedicated 24/7 Account Manager',
    status: 'Active'
  },
  {
    id: 'plan-corporate',
    name: 'Corporate Plan',
    description: 'Multi-subsidiary governance controls with strict security configurations.',
    priceMonthly: 59999,
    priceYearly: 599900,
    trialDuration: '30 Days',
    features: ['directory', 'messaging', 'business feed', 'marketplace', 'crm', 'projects', 'rfq', 'procurement', 'inventory', 'finance', 'analytics', 'hr_dms', 'document_management', 'assets_maintenance', 'networking'],
    storageLimit: '1 TB',
    userLimit: 999,
    orgLimit: 50,
    supportLevel: 'Custom SLA & Onsite Boarding',
    status: 'Active'
  }
];

// 3. INITIAL STATE MODELS FOR LOCALSTORAGE PERSISTENCE
interface OrgSubscriptionState {
  currentPlanId: string;
  billingCycle: 'monthly' | 'yearly';
  status: 'Trial' | 'Active' | 'Expiring Soon' | 'Expired' | 'Cancelled' | 'Suspended';
  renewalDate: string;
  activeUsersCount: number;
  organizationCount: number;
  storageUsedBytes: number;
}

const DEFAULT_SUBSCRIPTION: OrgSubscriptionState = {
  currentPlanId: 'plan-professional',
  billingCycle: 'monthly',
  status: 'Active',
  renewalDate: '2026-08-15',
  activeUsersCount: 14,
  organizationCount: 2,
  storageUsedBytes: 4509715620 // ~4.2 GB
};

export default function BusinessAnalyticsSubscriptionEngine({
  userSession,
  onLogTriggered,
  showToast,
  onNotificationTriggered,
  setActiveViewMode
}: EngineProps) {

  // --- PERSISTENT STATE ---
  const [subState, setSubState] = useState<OrgSubscriptionState>(() => {
    try {
      const saved = appStore.getItem('rc_subscription_state');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_SUBSCRIPTION;
  });

  const [paymentHistory, setPaymentHistory] = useState<any[]>(() => {
    try {
      const saved = appStore.getItem('rc_payment_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'INV-2026-001', date: '2026-07-15', planName: 'Professional Plan', amount: '₹14,999', status: 'Paid', method: 'Razorpay UPI' },
      { id: 'INV-2026-002', date: '2026-06-15', planName: 'Professional Plan', amount: '₹14,999', status: 'Paid', method: 'Corporate Card' },
      { id: 'INV-2026-003', date: '2026-05-15', planName: 'Starter Plan (Upgrade Pro-rata)', amount: '₹10,500', status: 'Paid', method: 'Netbanking' }
    ];
  });

  const [savedDashboards, setSavedDashboards] = useState<string[]>(() => {
    try {
      const saved = appStore.getItem('rc_saved_dashboards');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return ['Executive Q2 Revenue View', 'Weekly Lead Progression Track'];
  });

  // --- FILTERS & INTERACTIVITY ---
  const [activeTab, setActiveTab] = useState<'analytics' | 'membership' | 'reports'>('analytics');
  const [analyticsViewType, setAnalyticsViewType] = useState<'executive' | 'kpis' | 'insights'>('executive');
  
  // Custom Dashboard Selection
  const [customDashboardSelection, setCustomDashboardSelection] = useState<'Executive' | 'Personal' | 'Role-Based' | 'Department'>('Executive');

  // Search and global filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('Last 30 Days');
  const [deptFilter, setDeptFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');
  const [customerFilter, setCustomerFilter] = useState('All');
  const [supplierFilter, setSupplierFilter] = useState('All');
  const [employeeFilter, setEmployeeFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  
  // Interactive Custom Plan Builder state
  const [isCustomPlanModalOpen, setIsCustomPlanModalOpen] = useState(false);
  const [customPlanState, setCustomPlanState] = useState({
    userLimit: 50,
    storageGB: 50,
    supportLevel: 'Priority Email & Chat',
    selectedFeatures: ['directory', 'messaging', 'projects']
  });

  // Save State
  useEffect(() => {
    appStore.setItem('rc_subscription_state', JSON.stringify(subState));
  }, [subState]);

  useEffect(() => {
    appStore.setItem('rc_payment_history', JSON.stringify(paymentHistory));
  }, [paymentHistory]);

  useEffect(() => {
    appStore.setItem('rc_saved_dashboards', JSON.stringify(savedDashboards));
  }, [savedDashboards]);

  // Handle Subscription Actions
  const handleUpgradePlan = (planId: string) => {
    const targetPlan = PLANS_DATA.find(p => p.id === planId);
    if (!targetPlan) return;

    const newSub: OrgSubscriptionState = {
      ...subState,
      currentPlanId: planId,
      status: 'Active',
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    setSubState(newSub);

    // Add invoice entry
    const newInvoice = {
      id: `INV-2026-0${paymentHistory.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      planName: targetPlan.name,
      amount: `₹${targetPlan.priceMonthly.toLocaleString()}`,
      status: 'Paid',
      method: 'Razorpay UPI'
    };
    setPaymentHistory(prev => [newInvoice, ...prev]);

    // Triggers
    onLogTriggered('SUBSCRIPTION_PLAN_UPGRADED', 'organizations', planId, 'SUCCESS', `Successfully upgraded plan to ${targetPlan.name}. Limits expanded.`);
    onNotificationTriggered('in_app', userSession?.email || 'operator@realtyconnect.in', `Congratulations! Your subscription has been upgraded to ${targetPlan.name}. Enjoy unlocked features and higher storage limits.`);
    onNotificationTriggered('email', userSession?.email || 'operator@realtyconnect.in', `Receipt for ${targetPlan.name} Subscription Change`);
    showToast(`Successfully upgraded to ${targetPlan.name}!`, 'success');
  };

  const handleDowngradePlan = (planId: string) => {
    const targetPlan = PLANS_DATA.find(p => p.id === planId);
    if (!targetPlan) return;

    const newSub: OrgSubscriptionState = {
      ...subState,
      currentPlanId: planId,
      status: 'Active',
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    setSubState(newSub);
    onLogTriggered('SUBSCRIPTION_PLAN_DOWNGRADED', 'organizations', planId, 'WARNING', `Plan adjusted to ${targetPlan.name}. Limits reduced.`);
    onNotificationTriggered('in_app', userSession?.email || 'operator@realtyconnect.in', `Your subscription has been changed to ${targetPlan.name}. Please audit your active users and assets count.`);
    showToast(`Plan adjusted to ${targetPlan.name}.`, 'info');
  };

  const handleCancelSubscription = () => {
    setSubState(prev => ({
      ...prev,
      status: 'Cancelled'
    }));
    onLogTriggered('SUBSCRIPTION_CANCEL_REQUESTED', 'organizations', subState.currentPlanId, 'WARNING', 'User requested subscription cancellation. Access preserved until current cycle end.');
    onNotificationTriggered('email', userSession?.email || 'operator@realtyconnect.in', `Confirming cancellation of your RealtyConnect Subscription`);
    showToast('Subscription scheduled for cancellation. We hate to see you go!', 'info');
  };

  const handleReactivateSubscription = () => {
    setSubState(prev => ({
      ...prev,
      status: 'Active',
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));
    onLogTriggered('SUBSCRIPTION_REACTIVATED', 'organizations', subState.currentPlanId, 'SUCCESS', 'Subscription successfully reactivated by organizational owner.');
    onNotificationTriggered('in_app', userSession?.email || 'operator@realtyconnect.in', 'Welcome back! Your subscription renewal has been reactivated successfully.');
    showToast('Subscription successfully reactivated!', 'success');
  };

  const handleRenewSubscription = () => {
    const targetPlan = PLANS_DATA.find(p => p.id === subState.currentPlanId) || PLANS_DATA[2];
    const newSub: OrgSubscriptionState = {
      ...subState,
      status: 'Active',
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    setSubState(newSub);

    // Add invoice
    const newInvoice = {
      id: `INV-2026-0${paymentHistory.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      planName: `${targetPlan.name} (Renewal)`,
      amount: `₹${targetPlan.priceMonthly.toLocaleString()}`,
      status: 'Paid',
      method: 'Razorpay UPI'
    };
    setPaymentHistory(prev => [newInvoice, ...prev]);

    onLogTriggered('SUBSCRIPTION_RENEWED', 'organizations', subState.currentPlanId, 'SUCCESS', `Subscription renewed for next monthly term under plan ${targetPlan.name}.`);
    onNotificationTriggered('in_app', userSession?.email || 'operator@realtyconnect.in', `Thank you! Your ${targetPlan.name} membership has been renewed.`);
    showToast('Subscription renewed successfully!', 'success');
  };

  // Check feature permission based on current active plan
  const activePlan = PLANS_DATA.find(p => p.id === subState.currentPlanId) || PLANS_DATA[2];
  const hasAccess = (featureKey: string) => {
    return activePlan.features.includes(featureKey);
  };

  // Simulated Export Support
  const handleExport = (type: 'PDF' | 'Excel' | 'CSV' | 'Print') => {
    onLogTriggered('ANALYTICS_REPORT_EXPORTED', 'reports', 'analytics-center-01', 'SUCCESS', `User executed file compilation and downloaded report in format: ${type}.`);
    onNotificationTriggered('in_app', userSession?.email || 'operator@realtyconnect.in', `Your custom analytics report has been compiled and downloaded as ${type}.`);
    showToast(`Compiled document and downloaded ${type} package successfully!`, 'success');
  };

  // Save Dashboard View
  const handleSaveDashboardView = () => {
    const customTitle = `Custom View [${dateFilter}] - ${new Date().toISOString().substr(11, 8)}`;
    setSavedDashboards(prev => [...prev, customTitle]);
    onLogTriggered('CUSTOM_DASHBOARD_VIEW_SAVED', 'dashboards', 'custom', 'SUCCESS', `Successfully persisted view: ${customTitle}`);
    onNotificationTriggered('push', userSession?.email || 'operator@realtyconnect.in', `New dashboard shared/saved: ${customTitle}`);
    showToast('Current filters and layout configurations saved!', 'success');
  };

  // Simulated Custom Plan Creation
  const handleCreateCustomPlan = (e: React.FormEvent) => {
    e.preventDefault();
    const calculatedPrice = (customPlanState.userLimit * 200) + (customPlanState.storageGB * 15) + (customPlanState.selectedFeatures.length * 500);
    
    // Auto-migrate to custom plan
    const newSub: OrgSubscriptionState = {
      ...subState,
      currentPlanId: 'plan-custom',
      status: 'Active',
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    setSubState(newSub);

    // Dynamic Plan injection or replacement
    const customObj: SubscriptionPlan = {
      id: 'plan-custom',
      name: 'Custom Corporate Plan',
      description: 'SLA-tailored configuration compiled dynamically.',
      priceMonthly: calculatedPrice,
      priceYearly: calculatedPrice * 10,
      trialDuration: '0 Days',
      features: customPlanState.selectedFeatures,
      storageLimit: `${customPlanState.storageGB} GB`,
      userLimit: customPlanState.userLimit,
      orgLimit: 5,
      supportLevel: customPlanState.supportLevel,
      status: 'Custom'
    };

    // Replace or add to PLANS_DATA in local memory (simulated)
    const existingIndex = PLANS_DATA.findIndex(p => p.id === 'plan-custom');
    if (existingIndex > -1) PLANS_DATA[existingIndex] = customObj;
    else PLANS_DATA.push(customObj);

    setIsCustomPlanModalOpen(false);
    onLogTriggered('CUSTOM_SUBSCRIPTION_CONSTRUCTED', 'organizations', 'plan-custom', 'SUCCESS', `Tailored SLA subscription created. Price calculated: ₹${calculatedPrice}/month.`);
    onNotificationTriggered('in_app', userSession?.email || 'operator@realtyconnect.in', `Dynamic Custom Plan has been registered with customized user limits (${customPlanState.userLimit} seats).`);
    showToast('Custom subscription provisioned & activated!', 'success');
  };

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* 1. TOP HEADER & SEARCH HUB */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <BarChart2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded">
                Analytics
              </span>
              <h2 className="text-xl font-bold text-white font-display mt-0.5">
                Analytics, BI & Membership Control Hub
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Configure enterprise analytics, track active KPIs, download regulatory Swiss Slate summaries, and govern subscription plans, invoice logs, and feature permissions.
          </p>
        </div>

        {/* Global Hub Search */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2 xl:min-w-[420px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search Reports, Plans, Organizations, Customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-100 outline-none transition-all placeholder:text-slate-600"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          
          <button 
            onClick={() => {
              setSearchQuery('');
              setDateFilter('Last 30 Days');
              setDeptFilter('All');
              setProjectFilter('All');
              showToast('Filters reset to enterprise default', 'info');
            }}
            className="bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl px-3.5 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 2. SUB NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-2 rounded-xl">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-purple-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Part 1: Analytics & BI Center</span>
          </button>

          <button
            onClick={() => setActiveTab('membership')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'membership'
                ? 'bg-purple-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Part 2: Membership & Subscriptions</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'reports'
                ? 'bg-purple-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Executive Report Registry</span>
          </button>
        </div>

        {/* Global Export actions */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button onClick={() => handleExport('PDF')} className="p-1.5 hover:bg-slate-850 rounded text-slate-400 hover:text-emerald-400 transition-all cursor-pointer" title="Export PDF">
            <FileText className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => handleExport('Excel')} className="p-1.5 hover:bg-slate-850 rounded text-slate-400 hover:text-emerald-400 transition-all cursor-pointer" title="Export Excel">
            <FileSpreadsheet className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => handleExport('CSV')} className="p-1.5 hover:bg-slate-850 rounded text-slate-400 hover:text-emerald-400 transition-all cursor-pointer" title="Export CSV">
            <Download className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => handleExport('Print')} className="p-1.5 hover:bg-slate-850 rounded text-slate-400 hover:text-emerald-400 transition-all cursor-pointer" title="Print Dashboard">
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. MULTI-LEVEL FILTERS (BAR) */}
      <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold uppercase tracking-wider">
            <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
            <span>Interactive Multi-Criteria Filters</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Filters dynamically compute stats below</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Date range filter */}
          <div>
            <label className="block text-[10px] text-slate-400 font-mono mb-1">Date Period</label>
            <select 
              value={dateFilter} 
              onChange={(e) => {
                setDateFilter(e.target.value);
                onLogTriggered('ANALYTICS_FILTER_CHANGED', 'dates', e.target.value, 'SUCCESS', `Date interval updated to ${e.target.value}`);
              }}
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg p-1.5 text-xs text-slate-200 outline-none"
            >
              <option>Today</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Current Quarter (Q2)</option>
              <option>Financial Year 2026</option>
            </select>
          </div>

          {/* Department filter */}
          <div>
            <label className="block text-[10px] text-slate-400 font-mono mb-1">Department</label>
            <select 
              value={deptFilter} 
              onChange={(e) => {
                setDeptFilter(e.target.value);
                onLogTriggered('ANALYTICS_FILTER_CHANGED', 'departments', e.target.value, 'SUCCESS', `Department filter shifted to ${e.target.value}`);
              }}
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg p-1.5 text-xs text-slate-200 outline-none"
            >
              <option>All</option>
              <option>Engineering</option>
              <option>Acquisitions & Legal</option>
              <option>Procurement & Logistics</option>
              <option>Sales & Brokerage</option>
              <option>Audit & Finance</option>
            </select>
          </div>

          {/* Project Roster Filter */}
          <div>
            <label className="block text-[10px] text-slate-400 font-mono mb-1">Project Target</label>
            <select 
              value={projectFilter} 
              onChange={(e) => {
                setProjectFilter(e.target.value);
                onLogTriggered('ANALYTICS_FILTER_CHANGED', 'projects', e.target.value, 'SUCCESS', `Project context changed to ${e.target.value}`);
              }}
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg p-1.5 text-xs text-slate-200 outline-none"
            >
              <option>All</option>
              <option>DLF CyberPark Phase II</option>
              <option>Metro Line Phase 3 Substructure</option>
              <option>Godrej Woods Premium Tower</option>
              <option>Prestige High-Rise Estate</option>
            </select>
          </div>

          {/* Location / Geography */}
          <div>
            <label className="block text-[10px] text-slate-400 font-mono mb-1">Geographic Region</label>
            <select 
              value={locationFilter} 
              onChange={(e) => {
                setLocationFilter(e.target.value);
                onLogTriggered('ANALYTICS_FILTER_CHANGED', 'locations', e.target.value, 'SUCCESS', `Geographical target set to ${e.target.value}`);
              }}
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-lg p-1.5 text-xs text-slate-200 outline-none"
            >
              <option>All</option>
              <option>Delhi NCR (Gurugram)</option>
              <option>Mumbai Metropolitan Region (MMR)</option>
              <option>Bengaluru Tech Corridor</option>
              <option>Pune IT Park Hub</option>
            </select>
          </div>
        </div>

        {/* Additional Collateral Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-850/40">
          <div>
            <label className="block text-[10px] text-slate-400 font-mono mb-1">B2B Client / Customer</label>
            <select value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 outline-none">
              <option>All</option>
              <option>Apex Builders Ltd</option>
              <option>Adani Infra Corp</option>
              <option>L&T Heavy Civil</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 font-mono mb-1">Approved Supplier</label>
            <select value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 outline-none">
              <option>All</option>
              <option>Tata Steel Ltd</option>
              <option>Ultratech Cement Co</option>
              <option>Jindal Iron Works</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 font-mono mb-1">Site Supervisor / EE</label>
            <select value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-200 outline-none">
              <option>All</option>
              <option>Vikram Rathore (PM)</option>
              <option>Ananya Sen (Compliance)</option>
              <option>Rajesh Verma (Procurement)</option>
            </select>
          </div>
          <div className="flex items-end justify-end">
            <button
              onClick={() => {
                setDeptFilter('All');
                setProjectFilter('All');
                setCustomerFilter('All');
                setSupplierFilter('All');
                setEmployeeFilter('All');
                setLocationFilter('All');
                showToast('Secondary filters reset successfully!', 'info');
              }}
              className="w-full text-center py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-[10px] font-mono tracking-wider font-bold transition-all cursor-pointer"
            >
              Clear Secondary Filters
            </button>
          </div>
        </div>
      </div>

      {/* 4. MAIN CONTENT AREA */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          
          {/* Sub Navigation: Executive, KPIs, Insights, Custom dashboards */}
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAnalyticsViewType('executive')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  analyticsViewType === 'executive'
                    ? 'bg-purple-500/10 border border-purple-500 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Executive Executive Overview
              </button>
              <button
                onClick={() => setAnalyticsViewType('kpis')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  analyticsViewType === 'kpis'
                    ? 'bg-purple-500/10 border border-purple-500 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                KPI Analytics Metrics
              </button>
              <button
                onClick={() => setAnalyticsViewType('insights')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  analyticsViewType === 'insights'
                    ? 'bg-purple-500/10 border border-purple-500 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Business Insights Ranking
              </button>
            </div>

            {/* Custom Saved Dashboard Toggle */}
            <div className="flex items-center gap-2 bg-slate-950 px-2 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Saved View:</span>
              <select
                value={customDashboardSelection}
                onChange={(e: any) => {
                  setCustomDashboardSelection(e.target.value);
                  showToast(`Swapped layout to: ${e.target.value} Dashboard Perspective`, 'success');
                }}
                className="bg-transparent border-none text-xs text-purple-400 font-bold outline-none cursor-pointer"
              >
                <option value="Executive">Executive Portfolio (Default)</option>
                <option value="Personal">My Personal Dashboard</option>
                <option value="Role-Based">Role-Based ({userSession?.role || 'Guest'})</option>
                <option value="Department">Departmental Core (Audit)</option>
              </select>
              <button
                onClick={handleSaveDashboardView}
                className="ml-1 px-2 py-0.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded text-[9px] font-mono transition-all cursor-pointer"
              >
                Save New View
              </button>
            </div>
          </div>

          {/* A. EXECUTIVE DASHBOARD SUB-VIEW */}
          {analyticsViewType === 'executive' && (
            <div className="space-y-6">
              
              {/* Business Health & Core Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Gauge: Business Health Score */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">Business Health Rating</span>
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded font-bold">RERA Compliant</span>
                  </div>
                  
                  <div className="py-6 flex flex-col items-center justify-center">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      {/* Outer simulated progress ring */}
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                        <circle cx="50" cy="50" r="42" stroke="#10b981" strokeWidth="8" fill="transparent" strokeDasharray="264" strokeDashoffset="31" />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-extrabold text-white font-display">92.4</span>
                        <span className="text-[9px] font-mono text-slate-500">Out of 100</span>
                      </div>
                    </div>
                    <div className="text-center mt-3">
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> Excellent Health Trend (+4.2%)
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">Weighted score across leads, compliance, and material deliveries.</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-800/60 pt-3 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Audit Status: Passed</span>
                    <span className="font-mono text-[9px] text-slate-500">Next Update: 24 Hrs</span>
                  </div>
                </div>

                {/* Card: Revenue Overview */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">Revenue Overview</span>
                    <span className="text-[10px] bg-indigo-500/15 text-indigo-400 px-2 py-0.5 rounded font-mono">Q2 Targets</span>
                  </div>

                  <div className="space-y-4 py-4">
                    <div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-2xl font-extrabold text-white">₹2,48,50,000</span>
                        <span className="text-xs font-mono text-emerald-400 font-semibold">+18.5% Y-o-Y</span>
                      </div>
                      <p className="text-[10px] text-slate-500">Gross revenue booked across B2B contracts & subscription fees.</p>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Recurring Subscription Income</span>
                          <span className="font-semibold text-slate-200">₹34.5L/mo</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden mt-1">
                          <div className="bg-purple-500 h-full rounded-full" style={{ width: '74%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Escrow Milestone Disbursals</span>
                          <span className="font-semibold text-slate-200">₹2.14 Cr</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden mt-1">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: '85%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-800/60 pt-3 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Average Deal Size: ₹14.8L</span>
                    <button onClick={() => setActiveViewMode('finance')} className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-0.5">
                      Open Finance <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Card: Sales Pipeline Stage analysis */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">Sales Pipeline Stages</span>
                    <span className="text-[10px] text-slate-500 font-mono">142 Contracts</span>
                  </div>

                  <div className="space-y-2.5 py-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">1. Leads Identified</span>
                      <span className="font-mono font-bold text-slate-200">42 (Value: ₹62L)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: '100%' }} />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">2. Active RFQ Bids</span>
                      <span className="font-mono font-bold text-slate-200">31 (Value: ₹84L)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '78%' }} />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">3. Proposals Under Negotiation</span>
                      <span className="font-mono font-bold text-slate-200">18 (Value: ₹1.4 Cr)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: '58%' }} />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">4. Contracts Disbursed</span>
                      <span className="font-mono font-bold text-slate-200">11 (Value: ₹2.1 Cr)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '38%' }} />
                    </div>
                  </div>

                  <div className="border-t border-slate-800/60 pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Average Win Rate: 34.4%</span>
                    <span className="font-mono text-emerald-400">+1.5% this month</span>
                  </div>
                </div>

              </div>

              {/* Grid 2: Horizontal Metric Blocks for multi-module integration */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Block 1: Lead Conversion */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs text-slate-500 font-mono">Lead Conversion</div>
                  <div className="text-2xl font-extrabold text-white mt-1">34.4%</div>
                  <div className="flex justify-between items-center text-[10px] text-emerald-400 font-semibold mt-1.5">
                    <span>Target: 30% met</span>
                    <span>+2.1%</span>
                  </div>
                </div>

                {/* Block 2: Project Progress */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs text-slate-500 font-mono">Project Portfolio</div>
                  <div className="text-2xl font-extrabold text-white mt-1">88% <span className="text-xs font-normal text-slate-400">Milestones</span></div>
                  <div className="flex justify-between items-center text-[10px] text-emerald-400 font-semibold mt-1.5">
                    <span>On-Schedule</span>
                    <span className="text-amber-400 font-mono">1 Delay Alert</span>
                  </div>
                </div>

                {/* Block 3: Procurement Summary */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs text-slate-500 font-mono">Procurement Budget</div>
                  <div className="text-2xl font-extrabold text-white mt-1">84% <span className="text-xs font-normal text-slate-400">Utilized</span></div>
                  <div className="flex justify-between items-center text-[10px] text-emerald-400 font-semibold mt-1.5">
                    <span>Save: ₹11.6L (12.4%)</span>
                    <span className="text-slate-400 font-mono">48 Vendors</span>
                  </div>
                </div>

                {/* Block 4: Inventory & Stock */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs text-slate-500 font-mono">Inventory Valuation</div>
                  <div className="text-2xl font-extrabold text-white mt-1">₹58.6 Lakhs</div>
                  <div className="flex justify-between items-center text-[10px] text-amber-400 font-semibold mt-1.5">
                    <span>2 Stockout Warnings</span>
                    <span className="text-emerald-400 font-mono">1,450 Items</span>
                  </div>
                </div>

              </div>

              {/* Grid 3: Human & Organization Summary Block */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Employee summary */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <h4 className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider mb-3">Employee & Labor Allocation</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg">
                      <span className="text-xs font-semibold text-slate-300">Total Active Workforce</span>
                      <span className="text-xs font-mono font-bold text-white">124 Headcount</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg">
                      <span className="text-xs font-semibold text-slate-300">Roster Attendance Compliance</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">98.2%</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg">
                      <span className="text-xs font-semibold text-slate-300">Average Performance Rating</span>
                      <span className="text-xs font-mono font-bold text-purple-400">4.8 / 5.0</span>
                    </div>
                  </div>
                </div>

                {/* Customer Growth */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <h4 className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider mb-3">B2B Network Customer Growth</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg">
                      <span className="text-xs font-semibold text-slate-300">New Registered Entities (Month)</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">+14 Companies</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg">
                      <span className="text-xs font-semibold text-slate-300">Total Connected B2B Members</span>
                      <span className="text-xs font-mono font-bold text-white">412 Members</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg">
                      <span className="text-xs font-semibold text-slate-300">Active RFP Interaction Rate</span>
                      <span className="text-xs font-mono font-bold text-indigo-400">78.5% Engagement</span>
                    </div>
                  </div>
                </div>

                {/* Organization Entitlements / Performance limits */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <h4 className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider mb-3">Organization Performance & Entitlement Limits</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>User Seat Utilization</span>
                        <span className="font-semibold text-white">{subState.activeUsersCount} / {activePlan.userLimit} Seats</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full rounded-full" style={{ width: `${(subState.activeUsersCount / activePlan.userLimit) * 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Organization Limit</span>
                        <span className="font-semibold text-white">{subState.organizationCount} / {activePlan.orgLimit} Units</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(subState.organizationCount / activePlan.orgLimit) * 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Encrypted DMS Storage Usage</span>
                        <span className="font-semibold text-white">4.2 GB / {activePlan.storageLimit}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '42%' }} />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Interactive Trend Analysis / Comparison charts (Part of Analytics Center) */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-white font-display flex items-center gap-2">
                      Interactive Analytics Center & Trend Analysis
                    </h4>
                    <p className="text-xs text-slate-400">Visual comparison of monthly operational costs vs. sales pipeline revenue.</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 px-2 font-mono">Q2 Progress</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                </div>

                {/* Simulated Chart with dynamic tooltips on Hover */}
                <div className="py-2">
                  <div className="grid grid-cols-6 gap-3 items-end h-44 border-b border-slate-800 pb-2 relative">
                    
                    {/* Horizontal helper lines */}
                    <div className="absolute inset-x-0 top-1/4 border-b border-slate-800/40 pointer-events-none" />
                    <div className="absolute inset-x-0 top-2/4 border-b border-slate-800/40 pointer-events-none" />
                    <div className="absolute inset-x-0 top-3/4 border-b border-slate-800/40 pointer-events-none" />

                    {/* Jan bar */}
                    <div className="flex flex-col items-center h-full justify-end group cursor-pointer">
                      <div className="w-full flex gap-1 items-end h-full px-2">
                        <div className="flex-1 bg-purple-500/85 hover:bg-purple-400 transition-all rounded-t" style={{ height: '35%' }} title="Sales: ₹12 Lakhs" />
                        <div className="flex-1 bg-emerald-500/85 hover:bg-emerald-400 transition-all rounded-t" style={{ height: '25%' }} title="Expense: ₹8 Lakhs" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-1.5">Jan</span>
                    </div>

                    {/* Feb bar */}
                    <div className="flex flex-col items-center h-full justify-end group cursor-pointer">
                      <div className="w-full flex gap-1 items-end h-full px-2">
                        <div className="flex-1 bg-purple-500/85 hover:bg-purple-400 transition-all rounded-t" style={{ height: '48%' }} title="Sales: ₹16 Lakhs" />
                        <div className="flex-1 bg-emerald-500/85 hover:bg-emerald-400 transition-all rounded-t" style={{ height: '30%' }} title="Expense: ₹10 Lakhs" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-1.5">Feb</span>
                    </div>

                    {/* Mar bar */}
                    <div className="flex flex-col items-center h-full justify-end group cursor-pointer">
                      <div className="w-full flex gap-1 items-end h-full px-2">
                        <div className="flex-1 bg-purple-500/85 hover:bg-purple-400 transition-all rounded-t" style={{ height: '62%' }} title="Sales: ₹21 Lakhs" />
                        <div className="flex-1 bg-emerald-500/85 hover:bg-emerald-400 transition-all rounded-t" style={{ height: '34%' }} title="Expense: ₹12 Lakhs" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-1.5">Mar</span>
                    </div>

                    {/* Apr bar */}
                    <div className="flex flex-col items-center h-full justify-end group cursor-pointer">
                      <div className="w-full flex gap-1 items-end h-full px-2">
                        <div className="flex-1 bg-purple-500/85 hover:bg-purple-400 transition-all rounded-t" style={{ height: '74%' }} title="Sales: ₹25 Lakhs" />
                        <div className="flex-1 bg-emerald-500/85 hover:bg-emerald-400 transition-all rounded-t" style={{ height: '42%' }} title="Expense: ₹14 Lakhs" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-1.5">Apr</span>
                    </div>

                    {/* May bar */}
                    <div className="flex flex-col items-center h-full justify-end group cursor-pointer">
                      <div className="w-full flex gap-1 items-end h-full px-2">
                        <div className="flex-1 bg-purple-500/85 hover:bg-purple-400 transition-all rounded-t" style={{ height: '88%' }} title="Sales: ₹30 Lakhs" />
                        <div className="flex-1 bg-emerald-500/85 hover:bg-emerald-400 transition-all rounded-t" style={{ height: '50%' }} title="Expense: ₹16 Lakhs" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-1.5">May (Actual)</span>
                    </div>

                    {/* Jun bar */}
                    <div className="flex flex-col items-center h-full justify-end group cursor-pointer">
                      <div className="w-full flex gap-1 items-end h-full px-2">
                        <div className="flex-1 bg-purple-500/85 hover:bg-purple-400 transition-all rounded-t" style={{ height: '94%' }} title="Sales: ₹34 Lakhs" />
                        <div className="flex-1 bg-emerald-500/85 hover:bg-emerald-400 transition-all rounded-t" style={{ height: '52%' }} title="Expense: ₹18 Lakhs" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-1.5">Jun (Forecast)</span>
                    </div>

                  </div>

                  {/* Chart Legend & Indicators */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-3 text-xs">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 bg-purple-500 rounded" />
                        <span className="text-slate-400">Monthly Deal Volume (B2B Pipelines)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 bg-emerald-500 rounded" />
                        <span className="text-slate-400">Milestone Expenses Outflow</span>
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      * Hover bars for exact calculations. Dynamic forecasting placeholder activated.
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* B. KPI DASHBOARD METRICS */}
          {analyticsViewType === 'kpis' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Box 1: Lead & Sales KPIs */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-purple-500 rounded" />
                    Lead & Sales KPIs
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-950 rounded-xl space-y-1">
                    <div className="text-[10px] text-slate-500 font-mono">Average Conversion Time</div>
                    <div className="text-lg font-bold text-white">4.2 Days</div>
                    <p className="text-[10px] text-slate-400">Time from directory lead capture to active RFQ proposal.</p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl space-y-1">
                    <div className="text-[10px] text-slate-500 font-mono">Acquisition Cost (CAC)</div>
                    <div className="text-lg font-bold text-emerald-400">₹450 / Lead</div>
                    <p className="text-[10px] text-slate-400">Average platform cost based on subscription level metrics.</p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl space-y-1">
                    <div className="text-[10px] text-slate-500 font-mono">Win Rate by Pipeline</div>
                    <div className="text-lg font-bold text-white">34.4%</div>
                    <p className="text-[10px] text-slate-400">Quotations approved vs total proposals submitted.</p>
                  </div>
                </div>
              </div>

              {/* Box 2: Project, Procurement & Inventory KPIs */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-blue-500 rounded" />
                    Operations & Procurement KPIs
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-950 rounded-xl space-y-1">
                    <div className="text-[10px] text-slate-500 font-mono">Supplier Compliance Ratio</div>
                    <div className="text-lg font-bold text-emerald-400">97.8% On-Time</div>
                    <p className="text-[10px] text-slate-400">Raw materials delivery conforming to contract SLAs.</p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl space-y-1">
                    <div className="text-[10px] text-slate-500 font-mono">RFQ Savings Index</div>
                    <div className="text-lg font-bold text-white">12.4% Average</div>
                    <p className="text-[10px] text-slate-400">Savings calculated compared to baseline offline market rates.</p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl space-y-1">
                    <div className="text-[10px] text-slate-500 font-mono">Stockout Frequency</div>
                    <div className="text-lg font-bold text-amber-400">0.4% / Month</div>
                    <p className="text-[10px] text-slate-400">Critical items running out before milestone delivery cycles.</p>
                  </div>
                </div>
              </div>

              {/* Box 3: Network & Subscription KPIs */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-emerald-500 rounded" />
                    Marketplace & Subscription KPIs
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-950 rounded-xl space-y-1">
                    <div className="text-[10px] text-slate-500 font-mono">Monthly Recurring Revenue (MRR)</div>
                    <div className="text-lg font-bold text-purple-400">₹34.5 Lakhs</div>
                    <p className="text-[10px] text-slate-400">Active recurring membership license billing value.</p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl space-y-1">
                    <div className="text-[10px] text-slate-500 font-mono">User Retention (Churn)</div>
                    <div className="text-lg font-bold text-emerald-400">0.8% Churn</div>
                    <p className="text-[10px] text-slate-400">Low turnover rate indicating extreme value in active sprints.</p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl space-y-1">
                    <div className="text-[10px] text-slate-500 font-mono">Average ARPU (Organization)</div>
                    <div className="text-lg font-bold text-white">₹16,400 / Mo</div>
                    <p className="text-[10px] text-slate-400">Weighted average transaction spend per active enterprise unit.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* C. BUSINESS INSIGHTS SCREEN */}
          {analyticsViewType === 'insights' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Column 1: Performance Ranking Lists */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white font-display">Top Commercial Rankings</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Top Performing Real Estate Projects</span>
                    <div className="space-y-2 mt-1">
                      <div className="flex justify-between text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                        <span className="text-slate-200">1. DLF CyberPark Phase II</span>
                        <span className="font-bold text-emerald-400">96.2% Performance</span>
                      </div>
                      <div className="flex justify-between text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                        <span className="text-slate-200">2. Prestige High-Rise Towers</span>
                        <span className="font-bold text-emerald-400">91.4% Performance</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Top Revenue-Contributing Customers</span>
                    <div className="space-y-2 mt-1">
                      <div className="flex justify-between text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                        <span className="text-slate-200">1. Apex Builders Ltd</span>
                        <span className="font-bold text-white">₹84 Lakhs Volume</span>
                      </div>
                      <div className="flex justify-between text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                        <span className="text-slate-200">2. Adani Infrastructure</span>
                        <span className="font-bold text-white">₹62 Lakhs Volume</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Top Compliant Suppliers</span>
                    <div className="space-y-2 mt-1">
                      <div className="flex justify-between text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                        <span className="text-slate-200">1. Tata Steel Ltd (Tenders)</span>
                        <span className="font-bold text-emerald-400">99.2% Rating</span>
                      </div>
                      <div className="flex justify-between text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                        <span className="text-slate-200">2. Ultratech Cement Co</span>
                        <span className="font-bold text-emerald-400">97.4% Rating</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: Operational Highlights */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white font-display">Operational Highlights</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Best Selling Materials Categories</span>
                    <div className="space-y-2 mt-1">
                      <div className="flex justify-between text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                        <span className="text-slate-200">1. Fe550 Reinforcement Bars</span>
                        <span className="font-bold text-purple-400">Fastest Growing (+22%)</span>
                      </div>
                      <div className="flex justify-between text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                        <span className="text-slate-200">2. PPC Grade 53 Portland Cement</span>
                        <span className="font-bold text-purple-400">High Volume (+14%)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Most Active Employees (Sandbox Task Credits)</span>
                    <div className="space-y-2 mt-1">
                      <div className="flex justify-between text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                        <span className="text-slate-200">1. Vikram Rathore (Project Manager)</span>
                        <span className="font-mono text-slate-300">32 Submittals</span>
                      </div>
                      <div className="flex justify-between text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                        <span className="text-slate-200">2. Rajesh Verma (Lead Buyer)</span>
                        <span className="font-mono text-slate-300">28 Bids Completed</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Primary Organizational Revenue Source</span>
                    <div className="space-y-2 mt-1">
                      <div className="flex justify-between text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                        <span className="text-slate-200">1. Escrow Project Milestone Cut</span>
                        <span className="font-bold text-white">65% Allocation</span>
                      </div>
                      <div className="flex justify-between text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                        <span className="text-slate-200">2. SaaS B2B Licenses (MRR)</span>
                        <span className="font-bold text-white">35% Allocation</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* activeTab === 'membership' */}
      {activeTab === 'membership' && (
        <div className="space-y-6">
          
          {/* Active Subscription State overview */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 grid grid-cols-1 lg:grid-cols-3 gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Active profile and status */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider bg-slate-950 border border-slate-800 px-2.5 py-1 rounded">
                Active Organization Profile
              </span>
              <div className="pt-2">
                <h3 className="text-lg font-bold text-white font-display">Apex Developers Ltd</h3>
                <p className="text-xs text-slate-400 mt-1">Primary Tenant Segment: Acquisition, Engineering & Compliance</p>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-slate-400 flex justify-between">
                  <span>Current Subscription Plan:</span>
                  <span className="font-bold text-purple-400 uppercase">{activePlan.name}</span>
                </div>
                <div className="text-xs text-slate-400 flex justify-between">
                  <span>Subscription Status:</span>
                  <span className={`font-bold uppercase ${
                    subState.status === 'Active' ? 'text-emerald-400' : 'text-amber-400 animate-pulse'
                  }`}>{subState.status}</span>
                </div>
                <div className="text-xs text-slate-400 flex justify-between">
                  <span>Next Renewal Invoice:</span>
                  <span className="font-mono text-slate-300 font-bold">{subState.renewalDate}</span>
                </div>
              </div>
            </div>

            {/* Current Limit Gauges */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">Usage & Subscriptions Analytics</span>
              
              <div className="space-y-2 pt-1">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-0.5">
                    <span>Active User Seats</span>
                    <span className="font-mono text-slate-200">{subState.activeUsersCount} / {activePlan.userLimit} Seats</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${(subState.activeUsersCount / activePlan.userLimit) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-0.5">
                    <span>DMS Storage Used</span>
                    <span className="font-mono text-slate-200">4.2 GB / {activePlan.storageLimit}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '42%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-0.5">
                    <span>Registered Business Sites</span>
                    <span className="font-mono text-slate-200">{subState.organizationCount} / {activePlan.orgLimit} Locations</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(subState.organizationCount / activePlan.orgLimit) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Actions Panel */}
            <div className="bg-slate-950/80 border border-slate-850 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Mutate Subscription Status</span>
                <p className="text-[10.5px] text-slate-400 mt-1 leading-relaxed">
                  Safely trigger plan actions. Pricing and active compliance policies are adapted in local memory logs.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3">
                {subState.status === 'Active' ? (
                  <>
                    <button
                      onClick={handleRenewSubscription}
                      className="text-center py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs transition-all cursor-pointer"
                    >
                      Renew Term
                    </button>
                    <button
                      onClick={handleCancelSubscription}
                      className="text-center py-2 bg-slate-900 hover:bg-red-950/20 border border-slate-800 text-slate-400 hover:text-red-400 rounded-lg text-xs transition-all cursor-pointer"
                    >
                      Cancel Plan
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleReactivateSubscription}
                    className="col-span-2 text-center py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-all cursor-pointer"
                  >
                    Reactivate Active Status
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Feature Access Matrix Based on Current Active Plan */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-2 font-display">Active Subscriptions Feature Gate Matrix</h3>
            <p className="text-xs text-slate-400 mb-4">Features marked with red locks are restricted based on your current simulated subscription status. Click any plan in the grid below to upgrade instantly!</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
              {[
                { key: 'directory', label: 'B2B Directory' },
                { key: 'messaging', label: 'B2B Messaging' },
                { key: 'business feed', label: 'Business Feed' },
                { key: 'marketplace', label: 'B2B Marketplace' },
                { key: 'crm', label: 'Enterprise CRM' },
                { key: 'projects', label: 'Projects Engine' },
                { key: 'rfq', label: 'RFQ & Tenders' },
                { key: 'procurement', label: 'Procurement' },
                { key: 'inventory', label: 'Inventory Suite' },
                { key: 'finance', label: 'Finance Engine' },
                { key: 'analytics', label: 'Analytics BI' },
                { key: 'hr_dms', label: 'HR DMS Portal' }
              ].map((fItem, fIdx) => {
                const isUnlocked = hasAccess(fItem.key);
                return (
                  <div key={fIdx} className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all ${
                    isUnlocked 
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                      : 'bg-slate-950 border-slate-850 text-slate-600'
                  }`}>
                    <span className="font-semibold">{fItem.label}</span>
                    {isUnlocked ? (
                      <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                        Unlocked
                      </span>
                    ) : (
                      <div className="flex items-center gap-1 text-red-500 text-[9px] font-mono bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                        <Lock className="w-2.5 h-2.5" />
                        <span>LOCKED</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5 Plans Management Grid */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white font-display">Simulated Subscription Licenses</h3>
                <p className="text-xs text-slate-400">Upgrade or downgrade dynamically below. Taxes and gateway fees are omitted in sandbox.</p>
              </div>

              <button
                onClick={() => setIsCustomPlanModalOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 px-4 py-2 rounded-xl text-xs font-semibold text-purple-400 hover:text-purple-300 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Build Custom Plan SLA</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
              {PLANS_DATA.map((plan, pIdx) => {
                const isActive = subState.currentPlanId === plan.id;
                return (
                  <div 
                    key={pIdx} 
                    className={`bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between transition-all relative overflow-hidden ${
                      isActive 
                        ? 'border-purple-500 shadow-xl ring-1 ring-purple-500/25 bg-gradient-to-b from-slate-900 to-slate-950' 
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {plan.status === 'Popular' && (
                      <div className="absolute top-0 right-0 bg-purple-600 text-white font-mono text-[8px] font-bold px-2 py-0.5 rounded-bl uppercase tracking-wider">
                        Popular
                      </div>
                    )}
                    {isActive && (
                      <div className="absolute top-0 right-0 bg-emerald-600 text-white font-mono text-[8px] font-bold px-2.5 py-0.5 rounded-bl uppercase tracking-wider flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" />
                        <span>ACTIVE</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="text-xs font-bold text-white font-display">{plan.name}</div>
                      <p className="text-[10px] text-slate-400 leading-snug">{plan.description}</p>
                      
                      <div className="pt-2 border-b border-slate-850 pb-2">
                        <div className="text-xl font-extrabold text-white">₹{plan.priceMonthly.toLocaleString()}<span className="text-xs font-normal text-slate-500">/mo</span></div>
                        <div className="text-[9px] font-mono text-slate-500 mt-0.5">Yearly: ₹{plan.priceYearly.toLocaleString()}/yr</div>
                      </div>

                      {/* Details specs */}
                      <div className="space-y-1.5 pt-2 text-[10.5px]">
                        <div className="text-slate-400 flex justify-between">
                          <span>User Seats Limit:</span>
                          <span className="text-white font-semibold">{plan.userLimit}</span>
                        </div>
                        <div className="text-slate-400 flex justify-between">
                          <span>DMS Storage:</span>
                          <span className="text-white font-semibold">{plan.storageLimit}</span>
                        </div>
                        <div className="text-slate-400 flex justify-between">
                          <span>Allowed Businesses:</span>
                          <span className="text-white font-semibold">{plan.orgLimit}</span>
                        </div>
                        <div className="text-slate-400 flex justify-between">
                          <span>Support Level:</span>
                          <span className="text-slate-300 font-semibold">{plan.supportLevel}</span>
                        </div>
                      </div>

                      {/* Included Core Features */}
                      <div className="pt-3">
                        <div className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider mb-1">Included Workflows:</div>
                        <div className="flex flex-wrap gap-1">
                          {plan.features.slice(0, 4).map((feat, fIdx) => (
                            <span key={fIdx} className="text-[8px] bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-850 font-mono uppercase">
                              {feat.replace('_', ' ')}
                            </span>
                          ))}
                          {plan.features.length > 4 && (
                            <span className="text-[8px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded font-mono font-bold">
                              +{plan.features.length - 4} MORE
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-850">
                      {isActive ? (
                        <button
                          disabled
                          className="w-full text-center bg-slate-950 border border-slate-800 text-slate-500 py-2 rounded-xl text-xs font-semibold font-mono"
                        >
                          Active Plan
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (plan.priceMonthly > activePlan.priceMonthly) {
                              handleUpgradePlan(plan.id);
                            } else {
                              handleDowngradePlan(plan.id);
                            }
                          }}
                          className={`w-full text-center py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                            plan.priceMonthly > activePlan.priceMonthly
                              ? 'bg-purple-600 hover:bg-purple-500 text-white'
                              : 'bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300'
                          }`}
                        >
                          {plan.priceMonthly > activePlan.priceMonthly ? 'Upgrade Plan' : 'Downgrade Plan'}
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment & Invoice summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-1.5 font-display">Subscription Payments & Invoices Ledger</h3>
            <p className="text-xs text-slate-400 mb-4">Complete historic billing logs conforming to financial audit compliance.</p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-mono">
                    <th className="pb-2.5">Invoice ID</th>
                    <th className="pb-2.5">Billing Date</th>
                    <th className="pb-2.5">Plan Type</th>
                    <th className="pb-2.5">Amount Paid</th>
                    <th className="pb-2.5">Payment Method</th>
                    <th className="pb-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {paymentHistory.map((inv, idx) => (
                    <tr key={idx} className="hover:bg-slate-850/40">
                      <td className="py-3 font-mono font-bold text-slate-200">{inv.id}</td>
                      <td className="py-3 text-slate-300">{inv.date}</td>
                      <td className="py-3 text-white font-semibold">{inv.planName}</td>
                      <td className="py-3 font-mono text-slate-200">{inv.amount}</td>
                      <td className="py-3 text-slate-400">{inv.method}</td>
                      <td className="py-3">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono text-[10px] font-bold">
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* activeTab === 'reports' */}
      {activeTab === 'reports' && (
        <div className="space-y-6 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-bold text-white font-display">Central Executive Report Compilation Center</h3>
            <p className="text-xs text-slate-400 mt-1">Select and compile custom regulatory reports based on live simulated multi-module datasets.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Lead Generation & Conversion Report', cat: 'Leads & Marketing', desc: 'Breakdown of cost per lead, quality status, and sales channel performance.' },
              { title: 'Enterprise CRM Engagement Analysis', cat: 'CRM & Accounts', desc: 'Customer satisfaction benchmarks and high-value project escalations.' },
              { title: 'Project Portfolio Milestone Log', cat: 'Civil Works Portfolio', desc: 'Average completion timelines, contractor performance ratings, and material bottlenecks.' },
              { title: 'Finance Revenue & Subscriptions Ledger', cat: 'Finance & Escrow', desc: 'MRR tracking, pro-rata plan upgrade receipts, and pending invoices.' },
              { title: 'Inventory Utilization Summary', cat: 'Inventory & Stocks', desc: 'Stock turnover ratios, material scrap volume, and urgent replenishment schedules.' },
              { title: 'Supplier Procurement Performance Audit', cat: 'Procurement Logistics', desc: 'Supplier bid variances, historical RFQ savings, and contract compliance ratings.' },
              { title: 'Marketplace Gross Sales Volume', cat: 'Marketplace Hub', desc: 'Aggregate material listings traded, platform fee collections, and buyer leads.' },
              { title: 'Audit Trail and Compliance Chain', cat: 'System Integrity', desc: 'Unalterable cryptographic hash integrity check for LOG-01 parameters.' },
              { title: 'Active Membership Entitlement Census', cat: 'SaaS Administration', desc: 'License allocations, seat usage limits, and trial renewal projections.' }
            ].map((rep, idx) => (
              <div key={idx} className="p-4 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-xl flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      {rep.cat}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Code: REP-00{idx+1}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white font-display">{rep.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{rep.desc}</p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-900 pt-3">
                  <span className="text-[9.5px] font-mono text-slate-500">Formats: PDF, XLS, CSV</span>
                  <button 
                    onClick={() => {
                      onLogTriggered('REPORT_GENERATION_REQUESTED', 'reports', `REP-00${idx+1}`, 'SUCCESS', `Executed custom compilation parameters for ${rep.title}.`);
                      onNotificationTriggered('in_app', userSession?.email || 'operator@realtyconnect.in', `Your requested document '${rep.title}' has been generated.`);
                      showToast(`Generated: ${rep.title}`, 'success');
                    }}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-1 px-3 rounded text-[10px] font-mono transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>Compile Report</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. INTERACTIVE PLAN BUILDER DIALOG (MODAL) */}
      {isCustomPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <button 
              onClick={() => setIsCustomPlanModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-800 pb-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-purple-400" />
                Tailored SLA Custom Plan Builder
              </h3>
              <p className="text-xs text-slate-400">Configure exact seats, storage caps, and module authorizations.</p>
            </div>

            <form onSubmit={handleCreateCustomPlan} className="space-y-4">
              
              {/* User seat slider */}
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  ALLOCATED USER SEATS: <span className="text-purple-400 font-mono font-bold">{customPlanState.userLimit} Seats</span>
                </label>
                <input 
                  type="range" 
                  min="5" 
                  max="500" 
                  value={customPlanState.userLimit}
                  onChange={(e) => setCustomPlanState({...customPlanState, userLimit: parseInt(e.target.value)})}
                  className="w-full accent-purple-500 bg-slate-950 rounded-lg cursor-pointer h-2"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                  <span>5 Seats</span>
                  <span>500 Seats max</span>
                </div>
              </div>

              {/* Storage slider */}
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  SECURED DOCUMENT CLOUD STORAGE: <span className="text-purple-400 font-mono font-bold">{customPlanState.storageGB} GB</span>
                </label>
                <input 
                  type="range" 
                  min="10" 
                  max="1000" 
                  value={customPlanState.storageGB}
                  onChange={(e) => setCustomPlanState({...customPlanState, storageGB: parseInt(e.target.value)})}
                  className="w-full accent-purple-500 bg-slate-950 rounded-lg cursor-pointer h-2"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                  <span>10 GB</span>
                  <span>1 TB (1000 GB) max</span>
                </div>
              </div>

              {/* Support SLA level */}
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Support Level Level SLA</label>
                <select 
                  value={customPlanState.supportLevel}
                  onChange={(e) => setCustomPlanState({...customPlanState, supportLevel: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none"
                >
                  <option>Email & Chat (24 Hrs Response)</option>
                  <option>Priority Email & Chat (4 Hrs SLA)</option>
                  <option>Dedicated 24/7 Account Manager (30 Mins SLA)</option>
                  <option>Corporate Boardroom Direct Liaison (On-Demand)</option>
                </select>
              </div>

              {/* Allowed modules */}
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1.5">Permitted Cooperative Modules</label>
                <div className="grid grid-cols-2 gap-2 max-h-24 overflow-y-auto bg-slate-950 p-2 rounded-lg border border-slate-800">
                  {[
                    { key: 'directory', label: 'B2B Directory' },
                    { key: 'messaging', label: 'B2B Messaging' },
                    { key: 'projects', label: 'Projects Engine' },
                    { key: 'rfq', label: 'RFQ & Tenders' },
                    { key: 'finance', label: 'Finance & Escrow' },
                    { key: 'analytics', label: 'Analytics BI' }
                  ].map((feat, idx) => {
                    const isSelected = customPlanState.selectedFeatures.includes(feat.key);
                    return (
                      <label key={idx} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            const nextFeats = isSelected 
                              ? customPlanState.selectedFeatures.filter(f => f !== feat.key)
                              : [...customPlanState.selectedFeatures, feat.key];
                            setCustomPlanState({...customPlanState, selectedFeatures: nextFeats});
                          }}
                          className="accent-purple-500 rounded"
                        />
                        <span>{feat.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Estimated calculations summary */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Estimated Monthly Charge</span>
                <div className="text-lg font-bold text-white">
                  ₹{((customPlanState.userLimit * 200) + (customPlanState.storageGB * 15) + (customPlanState.selectedFeatures.length * 500)).toLocaleString()} / Month
                </div>
                <p className="text-[9.5px] text-slate-400">Excludes standard government GST (18%). Term contract renews monthly.</p>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsCustomPlanModalOpen(false)}
                  className="bg-slate-950 hover:bg-slate-850 border border-slate-800 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl text-xs"
                >
                  Confirm & Provision Custom Plan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
