/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { appStore } from '../lib/appStore';
import { usePersistentState } from '../lib/usePersistentState';
import { errorMessage, type AuthMeta, type RegisterInput, type Session } from '../lib/api';
import { fetchCompanies, isRegisteredCompanyId } from '../lib/companies';
import { api } from '../lib/api';
import { MODULE_FEATURE } from '../../shared/plans';
import { currentOrgName, currentUserEmail, currentUserName } from '../lib/identity';
import type { Company } from './BusinessDirectory';
import { passwordPolicyError } from '../../shared/roles';
import React, { useState } from 'react';
import { FeedPost, INITIAL_POSTS } from './BusinessFeed';
import { INITIAL_OPPORTUNITIES } from './BusinessOpportunitiesEngine';
import { INITIAL_RFQS } from './BusinessRfqEngine';
import { INITIAL_MARKETPLACE_LISTINGS } from './BusinessMarketplace';
import { 
  Connection, Enquiry, Meeting, Partnership, ContactExchange, CompanyVisit, 
  RfqOpportunity, ExternalInvitation, BlockedReported, TimelineEvent 
} from './BusinessNetworkingDashboard';

const BusinessProfileEngine = React.lazy(() => import('./BusinessProfileEngine'));
const MarketplaceHome = React.lazy(() => import('./MarketplaceHome'));
const BusinessDirectory = React.lazy(() => import('./BusinessDirectory'));
const BusinessFeed = React.lazy(() => import('./BusinessFeed'));
const BusinessDashboard = React.lazy(() => import('./BusinessDashboard'));
const BusinessOpportunitiesEngine = React.lazy(() => import('./BusinessOpportunitiesEngine'));
const BusinessRfqEngine = React.lazy(() => import('./BusinessRfqEngine'));
const BusinessMarketplace = React.lazy(() => import('./BusinessMarketplace'));
const BusinessLeadManagement = React.lazy(() => import('./BusinessLeadManagement'));
const BusinessNetworkingDashboard = React.lazy(() => import('./BusinessNetworkingDashboard'));
const BusinessMessagingEngine = React.lazy(() => import('./BusinessMessagingEngine'));
const BusinessMeetingsCalendar = React.lazy(() => import('./BusinessMeetingsCalendar'));
const BusinessCrmEngine = React.lazy(() => import('./BusinessCrmEngine'));
const BusinessProjectEngine = React.lazy(() => import('./BusinessProjectEngine'));
const BusinessProcurementEngine = React.lazy(() => import('./BusinessProcurementEngine'));
const BusinessInventoryEngine = React.lazy(() => import('./BusinessInventoryEngine'));
const BusinessFinanceEngine = React.lazy(() => import('./BusinessFinanceEngine'));
const BusinessHrDmsEngine = React.lazy(() => import('./BusinessHrDmsEngine'));
const BusinessAssetMaintenanceEngine = React.lazy(() => import('./BusinessAssetMaintenanceEngine'));
const BusinessAnalyticsSubscriptionEngine = React.lazy(() => import('./BusinessAnalyticsSubscriptionEngine'));
const BusinessSecurityEngine = React.lazy(() => import('./BusinessSecurityEngine'));

import { 
  Search, 
  Building2, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  MapPin, 
  Mail, 
  Phone, 
  Briefcase, 
  Award, 
  BookOpen, 
  Globe, 
  Building, 
  Check, 
  MessageSquare, 
  Send, 
  Share2, 
  ChevronRight, 
  Sparkles, 
  Shield,
  ShieldCheck, 
  Database,
  Terminal,
  Filter,
  DollarSign,
  AlertTriangle,
  LayoutDashboard,
  FileText,
  ShoppingBag,
  ClipboardList,
  Layers,
  Sun,
  Moon,
  ChevronLeft,
  X,
  Menu,
  Bell,
  ChevronDown,
  Clock,
  User,
  Settings,
  HelpCircle,
  LogOut,
  LogIn,
  UserPlus,
  Lock,
  Plus,
  PlusCircle,
  Bookmark,
  Activity,
  Calendar,
  Wrench,
  BarChart2,
  Pin,
  Star
} from 'lucide-react';

interface NavItem {
  id: 'directory' | 'network_dashboard' | 'feed' | 'dashboard' | 'opportunities' | 'rfq_management' | 'marketplace' | 'lead_management' | 'messaging' | 'meetings' | 'crm' | 'projects' | 'procurement' | 'inventory' | 'finance' | 'hr_dms' | 'assets_maintenance' | 'analytics_subscription' | 'security_compliance';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: {
    text: string;
    variant: 'new' | 'beta' | 'soon' | 'count';
  };
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

const NAVIGATION_GROUPS: NavGroup[] = [
  {
    groupName: 'Business',
    items: [
      { id: 'dashboard', label: 'Control Center', icon: LayoutDashboard },
      { id: 'directory', label: 'B2B Directory', icon: Search },
      { id: 'feed', label: 'Business Feed', icon: MessageSquare }
    ]
  },
  {
    groupName: 'Communication',
    items: [
      { id: 'network_dashboard', label: 'Networking Hub', icon: Users },
      { id: 'messaging', label: 'B2B Messaging', icon: MessageSquare },
      { id: 'meetings', label: 'Meetings & Calendar', icon: Calendar }
    ]
  },
  {
    groupName: 'Operations',
    items: [
      { id: 'opportunities', label: 'B2B Opportunities', icon: Briefcase },
      { id: 'rfq_management', label: 'RFQ & Tenders', icon: FileText },
      { id: 'projects', label: 'Project Portfolio', icon: Layers },
      { id: 'procurement', label: 'Procurement Engine', icon: ClipboardList },
      { id: 'inventory', label: 'Inventory Engine', icon: Layers },
      { id: 'finance', label: 'Finance & Billing', icon: DollarSign },
      { id: 'assets_maintenance', label: 'Assets & Maintenance', icon: Wrench }
    ]
  },
  {
    groupName: 'Management',
    items: [
      { id: 'marketplace', label: 'B2B Marketplace', icon: ShoppingBag },
      { id: 'lead_management', label: 'Lead Management', icon: ClipboardList },
      { id: 'crm', label: 'Enterprise CRM', icon: Building2 },
      { id: 'hr_dms', label: 'HR & Documents (DMS)', icon: Users },
      { id: 'analytics_subscription', label: 'Analytics & Subscriptions', icon: BarChart2 },
      { id: 'security_compliance', label: 'Security & Compliance', icon: Shield }
    ]
  }
];

const ROLE_NAV_ACCESS: Record<string, NavItem['id'][]> = {
  ADMIN: NAVIGATION_GROUPS.flatMap(group => group.items.map(item => item.id)),
  BUILDER: ['dashboard', 'directory', 'feed', 'network_dashboard', 'messaging', 'meetings', 'opportunities', 'rfq_management', 'projects', 'procurement', 'lead_management', 'crm', 'marketplace', 'analytics_subscription', 'security_compliance'],
  CONTRACTOR: ['dashboard', 'directory', 'feed', 'network_dashboard', 'messaging', 'meetings', 'projects', 'rfq_management', 'opportunities', 'lead_management', 'crm', 'analytics_subscription', 'security_compliance'],
  MATERIAL_SUPPLIER: ['dashboard', 'directory', 'feed', 'network_dashboard', 'messaging', 'meetings', 'marketplace', 'inventory', 'rfq_management', 'opportunities', 'lead_management', 'analytics_subscription', 'security_compliance'],
  CONSULTANT: ['dashboard', 'directory', 'feed', 'network_dashboard', 'messaging', 'meetings', 'lead_management', 'crm', 'analytics_subscription', 'security_compliance'],
  BANK: ['dashboard', 'directory', 'feed', 'network_dashboard', 'messaging', 'meetings', 'lead_management', 'finance', 'crm', 'analytics_subscription', 'security_compliance'],
  RECRUITER: ['dashboard', 'directory', 'feed', 'network_dashboard', 'messaging', 'meetings', 'hr_dms', 'lead_management', 'analytics_subscription', 'security_compliance'],
  FACILITY_MANAGEMENT: ['dashboard', 'directory', 'feed', 'network_dashboard', 'messaging', 'meetings', 'assets_maintenance', 'projects', 'analytics_subscription', 'security_compliance']
};

const DEFAULT_LOGGED_IN_MODULES: NavItem['id'][] = ['dashboard', 'directory', 'feed', 'network_dashboard', 'messaging', 'meetings', 'marketplace'];

interface LandingPortalProps {
  onLogTriggered: (action: string, entity: string, entityId: string, status: 'SUCCESS' | 'FAILURE' | 'WARNING', details: string) => void;
  userSession: Session | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onToggleDevHub: () => void;
  isLightMode?: boolean;
  onToggleTheme?: () => void;
  onLogout?: () => void;
  // Both reject when the server refuses the request; errorMessage() turns that into user-facing text.
  onLogin?: (email: string, password: string, role: string | undefined, landingView: string) => Promise<void>;
  onRegister?: (input: RegisterInput, landingView: string) => Promise<void>;
  authMeta?: AuthMeta | null;
  initialViewMode?: string;
  // The session's company details changed on the server (e.g. the company was renamed).
  onSessionStale?: () => void;
  // Notifications raised by the server for this company (requests, messages, quotations).
  serverNotifications?: { id: string; content: string; timestamp: string }[];
}

const SIGNUP_ROLE_LABELS: Record<string, string> = {
  BUILDER: 'Builder / Developer',
  DEVELOPER: 'Real Estate Developer',
  CONSTRUCTION_CO: 'Construction Company',
  CONTRACTOR: 'Civil Sub-Contractor',
  MATERIAL_SUPPLIER: 'Material Supplier / Vendor',
  ARCHITECT: 'Architect',
  CONSULTANT: 'Legal & Liaison Consultant',
  BANK: 'Syndicate Banker / Financer',
  RECRUITER: 'Enterprise Talent Recruiter',
  FACILITY_MANAGEMENT: 'Assets & Facility Manager'
};

// Rich mock data to support high-fidelity business discovery
const DISCOVERY_REGISTRY = [
  {
    id: 'ent-1',
    name: 'Apex Developers Ltd',
    category: 'Developers',
    location: 'Mumbai, MH',
    description: 'Premier builder specializing in sustainable luxury skyscrapers and integrated smart townships.',
    established: '2008',
    projectsCount: 14,
    rating: '4.9',
    featuredProject: 'Skyline Residency',
    website: 'www.apexdev.com',
    specialty: 'High-rise residential & commercial tech hubs',
    verified: true,
    logoBg: 'bg-indigo-600',
    tags: ['RERA Compliant', 'Eco-Design', 'Grade A Builder']
  },
  {
    id: 'ent-2',
    name: 'BuildCorp Construction',
    category: 'Contractors',
    location: 'Bangalore, KA',
    description: 'Leading civil engineering contractor executing major infrastructure, metro lines, and tech parks.',
    established: '1995',
    projectsCount: 42,
    rating: '4.8',
    featuredProject: 'Metro Line Phase 3 Substructure',
    website: 'www.buildcorpcon.com',
    specialty: 'Heavy concrete, piling, and steel structures',
    verified: true,
    logoBg: 'bg-emerald-600',
    tags: ['ISO 9001', 'High Capacity', 'Govt Grade-I']
  },
  {
    id: 'ent-3',
    name: 'Elite Materials Group',
    category: 'Vendors',
    location: 'Delhi NCR',
    description: 'Primary supplier of high-grade ready-mix concrete, reinforcing TMT bars, and fly ash bricks.',
    established: '2012',
    projectsCount: 150,
    rating: '4.7',
    featuredProject: 'Central Core Materials Supply',
    website: 'www.elitematerials.in',
    specialty: 'Ready-mix concrete & industrial bulk supply',
    verified: true,
    logoBg: 'bg-amber-600',
    tags: ['Ready-Mix Concrete', 'Bulk delivery', 'Bureau Veritas Certified']
  },
  {
    id: 'ent-4',
    name: 'RealtyConnect Pro Consultants',
    category: 'Consultants',
    location: 'Hyderabad, TS',
    description: 'Full-service real estate advisory providing RERA registrations, legal clearance, and feasibility audits.',
    established: '2016',
    projectsCount: 200,
    rating: '4.9',
    featuredProject: 'Hitech Zone Legal Clearance',
    website: 'www.realtyproconsultants.com',
    specialty: 'RERA Compliance & land acquisition advisory',
    verified: true,
    logoBg: 'bg-purple-600',
    tags: ['RERA Advisory', 'Due Diligence', 'M&A Advisors']
  },
  {
    id: 'ent-5',
    name: 'National Trust Bank',
    category: 'Banks',
    location: 'Mumbai, MH',
    description: 'Institutional banking and customized commercial lending models for real estate developers and escrow management.',
    established: '1984',
    projectsCount: 85,
    rating: '4.6',
    featuredProject: 'Apex Developers Escrow Management',
    website: 'www.nationaltrustbank.com',
    specialty: 'Developer project financing & Escrow accounts',
    verified: true,
    logoBg: 'bg-blue-600',
    tags: ['Institutional Funding', 'Escrow Management', 'NBFC Partner']
  },
  {
    id: 'ent-6',
    name: 'Finance Express DSA',
    category: 'DSAs',
    location: 'Chennai, TN',
    description: 'Authorized direct sales agency offering single-window mortgage approvals and developer retail channel integrations.',
    established: '2018',
    projectsCount: 1200,
    rating: '4.5',
    featuredProject: 'Retail Home Loan Campaign 2026',
    website: 'www.financeexpress.co.in',
    specialty: 'Retail mortgage distribution & corporate home loan channels',
    verified: true,
    logoBg: 'bg-rose-600',
    tags: ['Home Loans', 'Fast Sanction', '20+ Bank Ties']
  },
  {
    id: 'ent-7',
    name: 'Global Tech Equipment Ltd',
    category: 'Equipment',
    location: 'Pune, MH',
    description: 'Heavy duty crane lease, batching plant setup, and high-performance excavators for real estate builders.',
    established: '2005',
    projectsCount: 38,
    rating: '4.7',
    featuredProject: 'Apex Tower Crane Deployment',
    website: 'www.globaltechequip.com',
    specialty: 'Heavy crane rentals & concrete batching systems',
    verified: true,
    logoBg: 'bg-cyan-600',
    tags: ['Equipment Rental', 'OEM Spares', 'On-site Engineers']
  },
  {
    id: 'ent-8',
    name: 'Green Brick Logistics',
    category: 'Materials',
    location: 'Ahmedabad, GJ',
    description: 'Pioneers in high-strength eco-friendly clay bricks and carbon-cured AAC blocks with low environmental footprint.',
    established: '2015',
    projectsCount: 64,
    rating: '4.8',
    featuredProject: 'Eco-Living Residency Materials Supply',
    website: 'www.greenbricklogistics.com',
    specialty: 'AAC blocks & light-weight high-insulation walling',
    verified: false,
    logoBg: 'bg-emerald-700',
    tags: ['AAC Blocks', 'Eco-certified', 'Carbon Neutral']
  }
];

// Seeded featured projects
const FEATURED_PROJECTS = [
  { id: 'proj-1', title: 'Skyline Residency', developer: 'Apex Developers Ltd', location: 'Worli, Mumbai', status: 'Under Construction', completion: '2028', type: 'Residential Tower' },
  { id: 'proj-2', title: 'Nexus Tech Park', developer: 'Vanguard Builders', location: 'Whitefield, Bangalore', status: 'Completed', completion: '2025', type: 'Commercial Office Space' },
  { id: 'proj-3', title: 'Grand Central Galleria', developer: 'Metro Mall Group', location: 'Noida Sect 62', status: 'Structure Complete', completion: '2027', type: 'Retail Mall' }
];

// Seeded featured jobs
const FEATURED_JOBS = [
  { id: 'job-1', title: 'Lead Civil Structural Engineer', company: 'BuildCorp Construction', location: 'Bangalore, KA', salary: '₹18,00,000 - ₹24,00,000 / Yr', type: 'Full-time', experience: '8-10 Years' },
  { id: 'job-2', title: 'RERA Compliance & Liaison Officer', company: 'RealtyConnect Pro Consultants', location: 'Hyderabad, TS', salary: '₹12,00,000 - ₹15,00,000 / Yr', type: 'Full-time', experience: '5+ Years' },
  { id: 'job-3', title: 'Corporate Relationship Manager - Real Estate', company: 'National Trust Bank', location: 'Mumbai, MH', salary: '₹15,00,000 - ₹22,00,000 / Yr', type: 'Full-time', experience: '6+ Years' }
];

export default function LandingPortal({ 
  onLogTriggered, 
  userSession, 
  showToast, 
  onToggleDevHub, 
  isLightMode = false,
  onToggleTheme,
  onLogout,
  onLogin,
  onRegister,
  authMeta,
  initialViewMode,
  onSessionStale,
  serverNotifications = []
}: LandingPortalProps) {
  // Companies registered on the platform. The bundled sample companies are added only in demo mode.
  const [registeredCompanies, setRegisteredCompanies] = useState<Company[]>([]);
  const reloadCompanies = React.useCallback(() => {
    fetchCompanies()
      .then(setRegisteredCompanies)
      .catch(err => showToast(errorMessage(err), 'error'));
  }, [showToast]);
  React.useEffect(() => {
    reloadCompanies();
    // Companies that register while this one is open show up without a reload.
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') reloadCompanies();
    }, 30000);
    return () => clearInterval(timer);
  }, [reloadCompanies]);

  const companyRegistry = React.useMemo(() => {
    const registered = registeredCompanies.map(c => ({
      id: c.id,
      name: c.name,
      category: c.category,
      location: [c.city, c.state].filter(Boolean).join(', '),
      description: c.description || c.shortDescription,
      established: c.established,
      projectsCount: c.projects?.length ?? 0,
      rating: c.rating ? String(c.rating) : 'New',
      featuredProject: c.projects?.[0] ?? '',
      website: '',
      specialty: c.shortDescription,
      verified: c.verified,
      logoBg: c.logoBg,
      tags: [...c.products, ...c.services, ...c.keywords].slice(0, 6)
    }));
    return [...registered, ...(authMeta?.demoMode ? DISCOVERY_REGISTRY : [])];
  }, [registeredCompanies, authMeta?.demoMode]);

  // Discovery State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [searchResults, setSearchResults] = useState<typeof DISCOVERY_REGISTRY>([]);
  React.useEffect(() => {
    setSearchResults(companyRegistry);
  }, [companyRegistry]);


  // Role Profiles for Quick Access Flow
  const QUICK_ROLES = [
    {
      title: 'Builder / Developer',
      role: 'BUILDER',
      email: 'builder@realtyconnect.com',
      desc: 'Create, edit, and fund real estate projects; manage RFQs and evaluate materials bids.',
      permissions: ['CREATE_PROJECT', 'VIEW_VENDORS', 'CREATE_RFQ', 'VIEW_PROPOSALS', 'VIEW_CONTRACTS', 'COMMUNICATE_B2B'],
      color: 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/80 hover:bg-emerald-500/10 text-emerald-400',
      badge: 'BUILDER ENTERPRISE LICENSE',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
      icon: Building2,
      defaultView: 'dashboard' as const
    },
    {
      title: 'Construction Contractor',
      role: 'CONTRACTOR',
      email: 'contractor@realtyconnect.com',
      desc: 'Supervise daily labor force registers, submit tender quotations, and coordinate build logistics.',
      permissions: ['MANAGE_LABOUR', 'SUBMIT_PROPOSAL', 'CREATE_RFQ', 'VIEW_PROJECTS', 'COMMUNICATE_B2B'],
      color: 'border-blue-500/30 bg-blue-500/5 hover:border-blue-500/80 hover:bg-blue-500/10 text-blue-400',
      badge: 'OPERATIONS SPECIALIST',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
      icon: Briefcase,
      defaultView: 'projects' as const
    },
    {
      title: 'Material Supplier / Vendor',
      role: 'MATERIAL_SUPPLIER',
      email: 'supplier@realtyconnect.com',
      desc: 'Maintain product catalog listings, monitor incoming RFQs, and offer raw material rates.',
      permissions: ['MANAGE_PRODUCTS', 'VIEW_RFQS', 'SUBMIT_PROPOSAL', 'MANAGE_INVENTORY', 'COMMUNICATE_B2B'],
      color: 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/80 hover:bg-amber-500/10 text-amber-400',
      badge: 'COMMERCIAL SUPPLY HUB',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
      icon: Layers,
      defaultView: 'inventory' as const
    },
    {
      title: 'Compliance Chief',
      role: 'ADMIN',
      email: 'admin@realtyconnect.com',
      desc: 'Verify enterprise identities, update core lookups, and audit cryptographically chained system logs.',
      permissions: ['MANAGE_USERS', 'MANAGE_ROLES', 'MANAGE_SYSTEM_CONFIGS', 'MANAGE_COMMON_MASTERS', 'VIEW_AUDIT_LOGS'],
      color: 'border-purple-500/30 bg-purple-500/5 hover:border-purple-500/80 hover:bg-purple-500/10 text-purple-400',
      badge: 'COMPLIANCE AUDITOR (ADMIN)',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
      icon: ShieldCheck,
      defaultView: 'directory' as const
    }
  ];

  const handleQuickLogin = async (email: string, role: string, defaultView: string) => {
    // Demo personas (and their shared password) only exist on servers running in demo mode.
    if (!onLogin || !authMeta?.demoMode || !authMeta.demoPassword) {
      setAuthEmail(email);
      setAuthPassword('');
      setAuthError('');
      setAuthDefaultView(defaultView);
      setAuthModalTab('signin');
      setIsAuthModalOpen(true);
      return;
    }
    try {
      await onLogin(email, authMeta.demoPassword, role, defaultView);
    } catch (err) {
      showToast(errorMessage(err), 'error');
    }
  };

  // Active Stakeholder Entry Tab
  const [activeStakeholderTab, setActiveStakeholderTab] = useState('builders');

  // Contact State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactRole, setContactRole] = useState('Builder');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Modal / Interaction State
  const [selectedBusiness, setSelectedBusiness] = useState<typeof DISCOVERY_REGISTRY[0] | null>(null);

  /** Opens the profile of a company registered on the platform. Returns false for sample-company ids. */
  const openRegisteredCompany = (id: string): boolean => {
    if (!isRegisteredCompanyId(id)) return false;
    const company = companyRegistry.find(c => c.id === id);
    setSelectedBusiness((company ?? { id, name: '', category: '', location: '' }) as any);
    return true;
  };
  const [recommendationText, setRecommendationText] = useState('');
  const [recommendationList, setRecommendationList] = useState<{ [key: string]: string[] }>({
    'ent-1': ['Highly organized team. Exceptional engineering compliance and clear RERA disclosures.'],
    'ent-2': ['Delivered structural concrete works 20 days ahead of scheduled project milestone. Excellent safety logs.']
  });

  // B2B Connection state - Refactored as full Sprint 06 Enterprise State Machine
  const [activeViewMode, setActiveViewMode] = useState<'home' | 'directory' | 'network_dashboard' | 'feed' | 'dashboard' | 'opportunities' | 'rfq_management' | 'marketplace' | 'lead_management' | 'messaging' | 'meetings' | 'crm' | 'projects' | 'procurement' | 'inventory' | 'finance' | 'hr_dms' | 'assets_maintenance' | 'analytics_subscription' | 'security_compliance'>(() => {
    // The portal is remounted whenever the session changes (see App), so this initial value is the only sync needed.
    return userSession ? ((initialViewMode as any) || 'dashboard') : 'home';
  });

  // Smart Navigation Left Sidebar States (Part 4)
  const [pinnedModules, setPinnedModules] = useState<string[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_pinned_modules');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [favoriteModules, setFavoriteModules] = useState<string[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_favorite_modules');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [recentModules, setRecentModules] = useState<string[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_recent_modules');
      return saved ? JSON.parse(saved) : ['dashboard'];
    } catch (e) {
      return ['dashboard'];
    }
  });

  const [moduleClicks, setModuleClicks] = useState<Record<string, number>>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_module_clicks');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [sidebarSearch, setSidebarSearch] = useState('');

  // Sync active view updates with recents list
  React.useEffect(() => {
    if (activeViewMode && activeViewMode !== 'home') {
      setRecentModules(prev => {
        if (prev[0] === activeViewMode) return prev;
        const next = [activeViewMode, ...prev.filter(m => m !== activeViewMode)].slice(0, 5);
        try {
          appStore.setItem('realtyconnect_recent_modules', JSON.stringify(next));
        } catch (e) {}
        return next;
      });
    }
  }, [activeViewMode]);

  // Track module clicks for most used modules list
  const trackModuleClick = (moduleId: string) => {
    setModuleClicks(prev => {
      const next = { ...prev, [moduleId]: (prev[moduleId] || 0) + 1 };
      try {
        appStore.setItem('realtyconnect_module_clicks', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const togglePinModule = (moduleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedModules(prev => {
      const next = prev.includes(moduleId) ? prev.filter(m => m !== moduleId) : [...prev, moduleId];
      try {
        appStore.setItem('realtyconnect_pinned_modules', JSON.stringify(next));
      } catch (err) {}
      showToast(prev.includes(moduleId) ? `Unpinned module from quick access.` : `Pinned module to sidebar quick access!`, 'success');
      return next;
    });
  };

  const toggleFavoriteModule = (moduleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteModules(prev => {
      const next = prev.includes(moduleId) ? prev.filter(m => m !== moduleId) : [...prev, moduleId];
      try {
        appStore.setItem('realtyconnect_favorite_modules', JSON.stringify(next));
      } catch (err) {}
      showToast(prev.includes(moduleId) ? `Removed from favorite pages.` : `Added page to workspace favorites!`, 'success');
      return next;
    });
  };

  // The public menu has both "Products" and "Marketplace"; both open the marketplace screen,
  // Products showing goods only. This remembers which one was chosen so only that one lights up.
  const [marketplaceScope, setMarketplaceScope] = useState<'all' | 'products'>('all');
  React.useEffect(() => {
    if (activeViewMode !== 'marketplace') setMarketplaceScope('all');
  }, [activeViewMode]);
  const openMarketplace = (scope: 'all' | 'products') => {
    setMarketplaceScope(scope);
    setActiveViewMode('marketplace');
  };
  // "Businesses" shows the whole directory, clearing any slice left behind by "Services".
  const openAllBusinesses = () => {
    setSearchTerm('');
    setGlobalSearchTerm('');
    setSelectedCategory('All');
    setActiveViewMode('directory');
  };
  const isTopNavActive = (id: string): boolean => {
    if (id === 'products') return activeViewMode === 'marketplace' && marketplaceScope === 'products';
    if (id === 'marketplace-sec') return activeViewMode === 'marketplace' && marketplaceScope === 'all';
    if (id === 'services') return activeViewMode === 'directory' && selectedCategory === 'Consultants';
    // The plain Businesses entry is not "selected" while browsing the Services slice of the directory.
    if (id === 'directory') return activeViewMode === 'directory' && selectedCategory !== 'Consultants';
    return activeViewMode === id;
  };

  // Sync search state from the new homepage to the directory
  const [homepageSearchTerm, setHomepageSearchTerm] = useState('');
  const [homepageCategory, setHomepageCategory] = useState('All');
  const [homepageLocation, setHomepageLocation] = useState('All');

  // Custom B2B Authentication Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');

  // Authentication state for enterprise access
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authRole, setAuthRole] = useState('BUILDER');
  const [authOrgName, setAuthOrgName] = useState('');
  const [authName, setAuthName] = useState('');
  // Set when the visitor arrived through an invitation link.
  const [inviteCode, setInviteCode] = useState('');
  const [authCity, setAuthCity] = useState('');
  const [authRera, setAuthRera] = useState('');
  const [authDefaultView, setAuthDefaultView] = useState('dashboard');
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const openSignUp = () => {
    setInviteCode('');
    setAuthModalTab('signup');
    setAuthError('');
    setIsAuthModalOpen(true);
  };

  // An invitation link looks like /?invite=CODE&email=name@company.com
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('invite');
    if (!code) return;
    setInviteCode(code);
    setAuthEmail(params.get('email') || '');
    setAuthModalTab('signup');
    setIsAuthModalOpen(true);
    window.history.replaceState({}, '', window.location.pathname);
  }, []);

  const switchAuthTab = (tab: 'signin' | 'signup') => {
    setAuthModalTab(tab);
    setAuthError('');
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authSubmitting) return;
    setAuthError('');

    if (authModalTab === 'signup') {
      const policyError = passwordPolicyError(authPassword);
      if (policyError) {
        setAuthError(policyError);
        return;
      }
    }

    setAuthSubmitting(true);
    try {
      if (authModalTab === 'signin') {
        await onLogin?.(authEmail.trim(), authPassword, undefined, authDefaultView);
      } else {
        await onRegister?.(
          inviteCode
            ? { email: authEmail.trim(), password: authPassword, inviteCode, name: authName.trim() || undefined }
            : {
                email: authEmail.trim(),
                password: authPassword,
                organizationName: authOrgName.trim(),
                name: authName.trim() || undefined,
                city: authCity.trim() || undefined,
                role: authRole,
                reraRegistration: authRera.trim() || undefined
              },
          'dashboard'
        );
      }
      setIsAuthModalOpen(false);
    } catch (err) {
      setAuthError(errorMessage(err));
    } finally {
      setAuthSubmitting(false);
    }
  };

  const allowedModuleIds = React.useMemo(() => {
    if (!userSession) return new Set<NavItem['id']>();
    const modules = ROLE_NAV_ACCESS[userSession.role] || DEFAULT_LOGGED_IN_MODULES;
    // Modules the company's plan does not include are hidden (platform administrators see everything).
    const included = userSession.role === 'ADMIN'
      ? modules
      : modules.filter(id => !MODULE_FEATURE[id] || userSession.plan.features.includes(MODULE_FEATURE[id]));
    return new Set<NavItem['id']>(included);
  }, [userSession]);

  const visibleNavigationGroups = React.useMemo(
    () =>
      NAVIGATION_GROUPS.map(group => ({
        ...group,
        items: userSession ? group.items.filter(item => allowedModuleIds.has(item.id)) : group.items
      })).filter(group => group.items.length > 0),
    [userSession, allowedModuleIds]
  );

  React.useEffect(() => {
    if (!userSession || activeViewMode === 'home') return;
    if (!allowedModuleIds.has(activeViewMode as NavItem['id'])) {
      setActiveViewMode('dashboard');
      showToast('Access updated based on your active role policy.', 'info');
    }
  }, [activeViewMode, userSession, allowedModuleIds, showToast]);

  // Sidebar States for Premium Enterprise Navigation
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return appStore.getItem('realtyconnect_sidebar_collapsed') === 'true';
    } catch (e) {}
    return false;
  });
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        appStore.setItem('realtyconnect_sidebar_collapsed', String(next));
      } catch (e) {}
      return next;
    });
  };

  // Lifted Business Feed posts for synchronization across Opportunities Engine and Business Feed
  const [feedPosts, setFeedPosts] = usePersistentState<FeedPost[]>('rc_feed_posts', INITIAL_POSTS);

  // Lifted prefilled meeting scheduling state for cross-module integration
  const [prefilledMeeting, setPrefilledMeeting] = useState<any>(null);

  // --- Universal Search & Command Bar States ---
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_global_search_history');
      return saved ? JSON.parse(saved) : ['TMT Steel', 'Metro Piling', 'AAC Blocks'];
    } catch (e) {
      return ['TMT Steel', 'Metro Piling', 'AAC Blocks'];
    }
  });
  const [searchSuggestionIndex, setSearchSuggestionIndex] = useState(-1);
  const [isGlobalSearching, setIsGlobalSearching] = useState(false);

  // --- Header Panel States ---
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  // --- Grouped Seed Notification State ---
  const [globalNotifications, setGlobalNotifications] = usePersistentState<any[]>('rc_global_notifications', [
    {
      id: 'notif-1',
      title: 'New RFQ Bid Received',
      description: 'Elite Materials Group submitted a quote of ₹54,500/MT for your TMT Rebars RFQ.',
      category: 'RFQ',
      timestamp: '10 min ago',
      read: false
    },
    {
      id: 'notif-2',
      title: 'Handshake Request Accepted',
      description: 'Apex Developers Ltd has accepted your B2B connection handshake request.',
      category: 'Network',
      timestamp: '1 hour ago',
      read: false
    },
    {
      id: 'notif-3',
      title: 'Trending Opportunity Match',
      description: 'A new Investment Opportunity matching your profile was posted by Vanguard Builders.',
      category: 'Opportunity',
      timestamp: '2 hours ago',
      read: true
    },
    {
      id: 'notif-4',
      title: 'System Verification Complete',
      description: 'Your registered entity GSTIN and RERA certificates were successfully audited.',
      category: 'System',
      timestamp: '1 day ago',
      read: true
    }
  ]);

  // A new notification usually means another company did something; refresh the company list too.
  React.useEffect(() => {
    if (serverNotifications.length > 0) reloadCompanies();
  }, [serverNotifications.length]);

  // New server notifications appear in the bell once; whether they were read is remembered with the rest.
  React.useEffect(() => {
    if (serverNotifications.length === 0) return;
    setGlobalNotifications(prev => {
      const known = new Set(prev.map(n => n.id));
      const fresh = serverNotifications
        .filter(n => !known.has(`srv-${n.id}`))
        .map(n => ({ id: `srv-${n.id}`, title: 'New activity', description: n.content, category: 'Network', timestamp: n.timestamp, read: false }));
      return fresh.length ? [...fresh, ...prev] : prev;
    });
  }, [serverNotifications]);

  // Keyboard Ctrl+K shortcut and Escape key listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      } else if (e.key === 'Escape') {
        setSelectedBusiness(null);
        setIsNotificationsOpen(false);
        setIsProfileMenuOpen(false);
        setIsQuickCreateOpen(false);
        setIsSearchFocused(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Universal Grouped Search Results filter
  const universalSearchResults = React.useMemo(() => {
    if (!globalSearchTerm.trim()) return { companies: [], products: [], rfqs: [], opportunities: [], feed: [] };
    const query = globalSearchTerm.toLowerCase();

    // 1. Filter Companies
    const matchedCompanies = companyRegistry.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.specialty.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.tags.some(t => t.toLowerCase().includes(query)) ||
      item.location.toLowerCase().includes(query)
    ).map(item => ({
      id: item.id,
      title: item.name,
      category: item.category,
      description: item.description,
      location: item.location,
      type: 'company' as const,
      originalItem: item
    }));

    // 2. Filter Marketplace Listings (Products & Services)
    // Search what is actually saved; the bundled samples are only searchable on demo servers.
    const fromStore = <T,>(key: string, sample: T[]): T[] => {
      try {
        const parsed = JSON.parse(appStore.getItem(key) || 'null');
        if (Array.isArray(parsed)) return parsed;
      } catch { /* fall through */ }
      return authMeta?.demoMode ? sample : [];
    };
    const matchedProducts = fromStore('realtyconnect_marketplace_listings', INITIAL_MARKETPLACE_LISTINGS).filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.shortDescription.toLowerCase().includes(query) ||
      item.detailedDescription.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.subcategory.toLowerCase().includes(query) ||
      item.brand.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query)
    ).map(item => ({
      id: item.id,
      title: item.name,
      category: `${item.category} • ${item.subcategory}`,
      description: item.shortDescription,
      location: item.location,
      type: 'product' as const,
      originalItem: item
    }));

    // 3. Filter RFQs & Tenders
    const matchedRfqs = fromStore('realtyconnect_rfq_list', INITIAL_RFQS).filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.requiredProductsServices.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query)
    ).map(item => ({
      id: item.id,
      title: item.title,
      category: `${item.type} • Deadline: ${item.quotationSubmissionDeadline}`,
      description: item.description,
      location: item.location,
      type: 'rfq' as const,
      originalItem: item
    }));

    // 4. Filter Opportunities
    const matchedOpportunities = fromStore('rc_opportunities', INITIAL_OPPORTUNITIES).filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.requiredProductsServices.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query) ||
      `${item.location.area}, ${item.location.city}, ${item.location.state}`.toLowerCase().includes(query)
    ).map(item => ({
      id: item.id,
      title: item.title,
      category: `${item.type} • ${item.category}`,
      description: item.description,
      location: `${item.location.area}, ${item.location.city}`,
      type: 'opportunity' as const,
      originalItem: item
    }));

    // 5. Filter Feed & News
    const matchedFeed = feedPosts.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.postType.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query) ||
      item.tags.some(t => t.toLowerCase().includes(query))
    ).map(item => ({
      id: item.id,
      title: item.title,
      category: `${item.postType} • ${item.companyName}`,
      description: item.description,
      location: item.location,
      type: 'feed' as const,
      originalItem: item
    }));

    return {
      companies: matchedCompanies,
      products: matchedProducts,
      rfqs: matchedRfqs,
      opportunities: matchedOpportunities,
      feed: matchedFeed
    };
  }, [globalSearchTerm, feedPosts]);

  // Flattened items for keyboard navigation and rendering
  const flattenedSearchItems = React.useMemo(() => {
    const list: any[] = [];
    if (!globalSearchTerm.trim()) {
      const recentItems = searchHistory.map(term => ({ id: `term-hist-${term}`, title: term, type: 'history' as const }));
      const popularTerms = ['Fe550D TMT Steel', 'Piling rig lease', 'Luxury tower JV', 'Metro piling', 'Cement bulk quote'];
      const popularItems = popularTerms.map(term => ({ id: `term-pop-${term}`, title: term, type: 'popular' as const }));
      return [...recentItems, ...popularItems];
    }
    
    const { companies, products, rfqs, opportunities, feed } = universalSearchResults;
    return [
      ...companies.slice(0, 3),
      ...products.slice(0, 3),
      ...rfqs.slice(0, 3),
      ...opportunities.slice(0, 3),
      ...feed.slice(0, 3)
    ];
  }, [globalSearchTerm, universalSearchResults, searchHistory]);

  const handleSelectSearchResult = (item: any) => {
    setIsSearchFocused(false);
    setSearchSuggestionIndex(-1);

    const termToSave = item.title;
    if (termToSave) {
      setSearchHistory(prev => {
        const next = [termToSave, ...prev.filter(t => t !== termToSave)].slice(0, 6);
        try {
          appStore.setItem('realtyconnect_global_search_history', JSON.stringify(next));
        } catch (e) {}
        return next;
      });
    }

    if (item.type === 'company') {
      setSelectedBusiness(item.originalItem);
      onLogTriggered('B2B_SEARCH_NAV_COMPANY', 'companies', item.id, 'SUCCESS', `Universal Search: Clicked company profile "${item.title}". Opened detailed audit sheets.`);
    } else if (item.type === 'product') {
      setActiveViewMode('marketplace');
      onLogTriggered('B2B_SEARCH_NAV_PRODUCT', 'marketplace', item.id, 'SUCCESS', `Universal Search: Navigated to B2B Marketplace for product "${item.title}".`);
    } else if (item.type === 'rfq') {
      setActiveViewMode('rfq_management');
      onLogTriggered('B2B_SEARCH_NAV_RFQ', 'rfq_management', item.id, 'SUCCESS', `Universal Search: Navigated to RFQ & Tender hub for tender item "${item.title}".`);
    } else if (item.type === 'opportunity') {
      setActiveViewMode('opportunities');
      onLogTriggered('B2B_SEARCH_NAV_OPPORTUNITY', 'opportunities', item.id, 'SUCCESS', `Universal Search: Navigated to B2B Opportunities Engine for "${item.title}".`);
    } else if (item.type === 'feed') {
      setActiveViewMode('feed');
      onLogTriggered('B2B_SEARCH_NAV_FEED', 'feed', item.id, 'SUCCESS', `Universal Search: Opened Business Feed targeting post "${item.title}".`);
    } else if (item.type === 'history' || item.type === 'popular') {
      setGlobalSearchTerm(item.title);
      setSearchSuggestionIndex(-1);
    }
  };

  const handleSearchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSearchSuggestionIndex(prev => {
        const next = prev + 1;
        return next >= flattenedSearchItems.length ? 0 : next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSearchSuggestionIndex(prev => {
        const next = prev - 1;
        return next < 0 ? flattenedSearchItems.length - 1 : next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchSuggestionIndex >= 0 && searchSuggestionIndex < flattenedSearchItems.length) {
        handleSelectSearchResult(flattenedSearchItems[searchSuggestionIndex]);
      } else if (globalSearchTerm.trim()) {
        const term = globalSearchTerm.trim();
        setSearchHistory(prev => {
          const next = [term, ...prev.filter(t => t !== term)].slice(0, 6);
          try {
            appStore.setItem('realtyconnect_global_search_history', JSON.stringify(next));
          } catch (e) {}
          return next;
        });
        setIsSearchFocused(false);
        setSearchSuggestionIndex(-1);
        onLogTriggered('B2B_SEARCH_QUERY_SUBMITTED', 'directory', 'global', 'SUCCESS', `Universal Search: Submitted custom search phrase: "${term}". Matching grouped indices.`);
      }
    } else if (e.key === 'Escape') {
      setIsSearchFocused(false);
      setSearchSuggestionIndex(-1);
    }
  };

  const handleClearHistoryItem = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchHistory(prev => {
      const next = prev.filter(t => t !== term);
      try {
        appStore.setItem('realtyconnect_global_search_history', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const handleClearAllHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchHistory([]);
    try {
      appStore.removeItem('realtyconnect_global_search_history');
    } catch (e) {}
  };

  const handleQuickCreate = (actionType: 'opportunity' | 'feed' | 'rfq' | 'product' | 'meeting') => {
    setIsQuickCreateOpen(false);
    if (actionType === 'opportunity') {
      setActiveViewMode('opportunities');
      setOppPrefillOpen(true);
      onLogTriggered('QUICK_CREATE_TRIGGERED', 'opportunities', 'new', 'SUCCESS', 'Quick Create: Triggered Opportunity draft form pre-filled.');
      showToast('Drafting new B2B Opportunity...', 'info');
    } else if (actionType === 'feed') {
      setActiveViewMode('feed');
      onLogTriggered('QUICK_CREATE_TRIGGERED', 'feed', 'new', 'SUCCESS', 'Quick Create: Redirected to Professional Feed stream.');
      showToast('Navigating to B2B feed stream to post an update.', 'info');
    } else if (actionType === 'rfq') {
      setActiveViewMode('rfq_management');
      setRfqPrefillOpen(true);
      onLogTriggered('QUICK_CREATE_TRIGGERED', 'rfq_management', 'new', 'SUCCESS', 'Quick Create: Opened RFQ tender dispatch engine.');
      showToast('Opening RFQ & Tender wizard...', 'info');
    } else if (actionType === 'product') {
      setActiveViewMode('marketplace');
      onLogTriggered('QUICK_CREATE_TRIGGERED', 'marketplace', 'new', 'SUCCESS', 'Quick Create: Redirected to Product seller panel.');
      showToast('Opening B2B Marketplace to list product.', 'info');
    } else if (actionType === 'meeting') {
      setActiveViewMode('network_dashboard');
      onLogTriggered('QUICK_CREATE_TRIGGERED', 'network_dashboard', 'new', 'SUCCESS', 'Quick Create: Redirected to Networking hub for scheduling meetings.');
      showToast('Opening Networking Hub scheduler...', 'info');
    }
  };

  const handleMarkAllNotificationsAsRead = () => {
    setGlobalNotifications(prev => prev.map(n => ({ ...n, read: true })));
    onLogTriggered('NOTIFICATIONS_MARKED_READ', 'notifications', 'all', 'SUCCESS', 'Notifications Hub: Marked all active alerts as read.');
    showToast('All notifications marked as read', 'success');
  };

  const handleClearAllNotifications = () => {
    setGlobalNotifications([]);
    onLogTriggered('NOTIFICATIONS_CLEARED', 'notifications', 'all', 'SUCCESS', 'Notifications Hub: Flushed notification event log.');
    showToast('Notification log cleared', 'info');
  };

  const handleToggleNotificationRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGlobalNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  // State to handle prefill of Create Opportunity from Dashboard / Directory / Profile
  const [oppPrefillOpen, setOppPrefillOpen] = useState(false);
  const [rfqPrefillOpen, setRfqPrefillOpen] = useState(false);
  const [prefilledRfqOpp, setPrefilledRfqOpp] = useState<any | null>(null);
  
  const [connections, setConnections] = usePersistentState<Connection[]>('rc_net_connections', [
    {
      id: 'conn-1',
      businessId: 'ent-1',
      businessName: 'Apex Developers Ltd',
      businessCategory: 'Developers',
      businessLocation: 'Mumbai, MH',
      logoBg: 'bg-indigo-600',
      status: 'accepted',
      timestamp: '2026-07-14 10:30 AM',
      purpose: 'Smart Township Materials Liaison and Vendor Ring Integration',
      mutualCount: 4
    },
    {
      id: 'conn-2',
      businessId: 'ent-2',
      businessName: 'BuildCorp Construction',
      businessCategory: 'Contractors',
      businessLocation: 'Bangalore, KA',
      logoBg: 'bg-emerald-600',
      status: 'accepted',
      timestamp: '2026-07-15 02:45 PM',
      purpose: 'Heavy Civil Metrorail Subcontractor Cement Supply Contract',
      mutualCount: 6
    },
    {
      id: 'conn-3',
      businessId: 'ent-3',
      businessName: 'Elite Materials Group',
      businessCategory: 'Vendors',
      businessLocation: 'Delhi NCR',
      logoBg: 'bg-amber-600',
      status: 'pending_incoming',
      timestamp: '2026-07-16 08:15 AM',
      purpose: 'Requesting access to bid on the South Mumbai luxury tower reinforcement steel bulk tender',
      mutualCount: 2
    },
    {
      id: 'conn-4',
      businessId: 'ent-5',
      businessName: 'National Trust Bank',
      businessCategory: 'Banks',
      businessLocation: 'Mumbai, MH',
      logoBg: 'bg-indigo-600',
      status: 'pending_outgoing',
      timestamp: '2026-07-16 09:00 AM',
      purpose: 'Escrow account structuring proposal for highrise luxury developer syndication',
      mutualCount: 5
    }
  ]);

  const [connectionsSent, setConnectionsSent] = usePersistentState<string[]>('rc_net_connections_sent', ['ent-5']);
  const [following, setFollowing] = usePersistentState<string[]>('rc_net_following', ['ent-1', 'ent-4']);
  const [followers, setFollowers] = usePersistentState<string[]>('rc_net_followers', ['ent-2', 'ent-7']);
  const [savedBusinesses, setSavedBusinesses] = usePersistentState<string[]>('rc_net_saved_businesses', ['ent-3', 'ent-8']);
  const [favoriteCompanies, setFavoriteCompanies] = usePersistentState<string[]>('rc_net_favorite_companies', ['ent-1']);

  const [enquiries, setEnquiries] = usePersistentState<Enquiry[]>('rc_net_enquiries', [
    {
      id: 'enq-1',
      businessId: 'ent-3',
      businessName: 'Elite Materials Group',
      subject: 'Bulk Fe550D TMT Reinforcement Steel Quote',
      category: 'Material Quotation',
      message: 'Looking to procure 1200 Metric Tons of high-ductility TMT rebars for our active BKC residential skyscraper foundation contract. Please share standard pricing slab with logistics terms.',
      senderEmail: currentUserEmail(),
      senderPhone: '+91 98200 44021',
      timestamp: '2026-07-15 04:10 PM',
      reply: '[Automated Callback Response]\n\nGreetings from Elite Materials Group! Thank you for requesting a bulk rebar quote. For a volume of 1200 MT, our current price point is ₹54,500/MT including delivery to BKC. We provide 100% certified RERA audit trails and test sheets with every batch.\n\nA senior sales representative will call you at +91 98200 44021 to finalize custom credit terms.',
      status: 'replied'
    }
  ]);

  const [meetings, setMeetings] = usePersistentState<Meeting[]>('rc_net_meetings', [
    {
      id: 'meet-1',
      businessId: 'ent-1',
      businessName: 'Apex Developers Ltd',
      title: 'BKC Project Substructure Alignment Consult',
      date: '2026-07-20',
      time: '11:00 AM',
      type: 'Virtual Video Call',
      status: 'scheduled',
      timestamp: '2026-07-16 09:12 AM'
    }
  ]);

  const [partnerships, setPartnerships] = usePersistentState<Partnership[]>('rc_net_partnerships', [
    {
      id: 'part-1',
      businessId: 'ent-8',
      businessName: 'Green Brick Logistics',
      type: 'partnership',
      terms: '30-Day Corporate Credit Line with credit insurance',
      estimatedValue: '₹45,00,000 / Annually',
      scope: 'Exclusive supply chain logistics routing and warehousing integration for ready-mix dry mortar',
      status: 'pending',
      timestamp: '2026-07-16 08:30 AM'
    }
  ]);

  const [contactExchanges, setContactExchanges] = usePersistentState<ContactExchange[]>('rc_net_contact_exchanges', []);
  
  const [companyVisits, setCompanyVisits] = usePersistentState<CompanyVisit[]>('rc_net_company_visits', [
    {
      id: 'visit-1',
      businessId: 'ent-2',
      businessName: 'BuildCorp Construction',
      facilityName: 'Metro High-Stress Concrete Testing Laboratory',
      date: '2026-07-25',
      time: '10:00 AM',
      purpose: 'Auditing physical compression testing machines and ISO compliance standards prior to tender dispatch.',
      status: 'pending',
      timestamp: '2026-07-16 09:05 AM'
    }
  ]);

  const [rfqs, setRfqs] = usePersistentState<RfqOpportunity[]>('rc_net_rfqs', [
    {
      id: 'rfq-1',
      title: 'Supply of 350 MT Grade 43 Cement for Noida Layout',
      category: 'Materials Supply',
      quantity: '350 Metric Tons',
      estimatedValue: '₹1.4 Crores',
      closeDate: '2026-08-10',
      description: 'Requirements for premium quality quick-setting cement matching ISO standards. Immediate shipping to Noida Sector 62. Escrow account setup required.',
      publishedBy: 'Apex Developers Ltd',
      bidsCount: 8,
      status: 'active',
      timestamp: '2026-07-15 11:20 AM'
    },
    {
      id: 'rfq-2',
      title: 'Double-drum Heavy Hydraulic Road Roller Rental',
      category: 'Machinery Leasing',
      quantity: '2 Units (3 Months Lease)',
      estimatedValue: '₹8,50,000',
      closeDate: '2026-07-31',
      description: 'Requesting lease bids for heavy road rollers matching Tier-4 emission norms with onsite service and operator support included.',
      publishedBy: 'BuildCorp Construction',
      bidsCount: 12,
      status: 'active',
      timestamp: '2026-07-16 07:45 AM'
    }
  ]);

  const [invitations, setInvitations] = usePersistentState<ExternalInvitation[]>('rc_net_invitations', [
    {
      id: 'inv-1',
      email: 'procurement@ultratech-bulk.in',
      website: 'www.ultratechcement.com',
      role: 'Vendor',
      timestamp: '2026-07-16 08:00 AM',
      status: 'sent'
    },
    {
      id: 'inv-2',
      email: 'liaison@karnataka-rera.gov.in',
      website: 'www.rera.karnataka.gov.in',
      role: 'Consultant',
      timestamp: '2026-07-15 01:25 PM',
      status: 'activated'
    }
  ]);

  const [blockedReported, setBlockedReported] = usePersistentState<BlockedReported[]>('rc_net_blocked', []);
  
  const [timeline, setTimeline] = usePersistentState<TimelineEvent[]>('rc_net_timeline', [
    {
      id: 'time-1',
      timestamp: '2026-07-14 10:30 AM',
      action: 'B2B_CONNECTION_HANDSHAKE_COMPLETED',
      category: 'connections',
      details: 'Mutually established business connection with Apex Developers Ltd.',
      status: 'SUCCESS'
    },
    {
      id: 'time-2',
      timestamp: '2026-07-15 02:45 PM',
      action: 'B2B_CONNECTION_HANDSHAKE_COMPLETED',
      category: 'connections',
      details: 'Mutually established business connection with BuildCorp Construction.',
      status: 'SUCCESS'
    },
    {
      id: 'time-3',
      timestamp: '2026-07-15 04:10 PM',
      action: 'B2B_ENQUIRY_DISPATCHED',
      category: 'enquiries',
      details: 'Dispatched bulk rebar quotation inquiry to Elite Materials Group.',
      status: 'INFO'
    },
    {
      id: 'time-4',
      timestamp: '2026-07-15 04:11 PM',
      action: 'B2B_CALLBACK_RECEIVED',
      category: 'enquiries',
      details: 'Secured instant callback quote and verification terms from Elite Materials Group BD lead.',
      status: 'SUCCESS'
    }
  ]);

  const handleLogTimeline = (action: string, category: string, details: string, status: 'SUCCESS' | 'WARNING' | 'INFO' = 'SUCCESS') => {
    const newEvent: TimelineEvent = {
      id: `time-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString(),
      action,
      category,
      details,
      status
    };
    setTimeline(prev => [newEvent, ...prev]);
  };

  const handleAcceptConnection = (id: string) => {
    const target = connections.find(c => c.id === id);
    if (!target) return;
    const finish = () => {
      setConnections(prev => prev.map(c => (c.id === id ? { ...c, status: 'accepted' as const } : c)));
      handleLogTimeline('B2B_CONNECTION_HANDSHAKE_COMPLETED', 'connections', `Accepted incoming connection request from ${target.businessName}. Mutual access opened.`, 'SUCCESS');
      onLogTriggered('B2B_CONNECTION_HANDSHAKE_COMPLETED', 'companies', target.businessId, 'SUCCESS', `Accepted connection request from ${target.businessName}.`);
      showToast(`B2B connection established with ${target.businessName}!`, 'success');
    };
    if (isRegisteredCompanyId(target.businessId)) {
      // The other company is told, and sees the connection as accepted.
      api('POST', `/network/connections/${encodeURIComponent(id)}/respond`, { accept: true }).then(finish).catch(err => showToast(errorMessage(err), 'error'));
    } else {
      finish();
    }
  };

  const handleRejectConnection = (id: string) => {
    const target = connections.find(c => c.id === id);
    if (!target) return;

    if (isRegisteredCompanyId(target.businessId)) {
      api('POST', `/network/connections/${encodeURIComponent(id)}/respond`, { accept: false }).catch(err => showToast(errorMessage(err), 'error'));
    }
    setConnections(prev => prev.filter(c => c.id !== id));
    handleLogTimeline('B2B_CONNECTION_REQUEST_REJECTED', 'connections', `Declined connection request from ${target.businessName}.`, 'WARNING');
    onLogTriggered('B2B_CONNECTION_REQUEST_REJECTED', 'companies', target.businessId, 'WARNING', `Rejected connection invitation from ${target.businessName}`);
    showToast(`Declined connection request from ${target.businessName}.`, 'info');
  };

  const handleWithdrawConnection = (id: string) => {
    const target = connections.find(c => c.id === id);
    if (!target) return;

    if (isRegisteredCompanyId(target.businessId)) {
      api('DELETE', `/network/connections/${encodeURIComponent(id)}`).catch(err => showToast(errorMessage(err), 'error'));
    }
    setConnections(prev => prev.filter(c => c.id !== id));
    setConnectionsSent(prev => prev.filter(bid => bid !== target.businessId));
    handleLogTimeline('B2B_CONNECTION_REVOKED', 'connections', `Withdrew connection proposal/link with ${target.businessName}.`, 'WARNING');
    onLogTriggered('B2B_CONNECTION_REVOKED', 'companies', target.businessId, 'WARNING', `Revoked active connection tunnel with ${target.businessName}`);
    showToast(`Revoked link with ${target.businessName}.`, 'info');
  };

  const handleSendConnection = (businessId: string, name: string, category: string, location: string, logoBg: string, purpose: string) => {
    if (!userSession) {
      showToast('Please sign in or select your business role to dispatch connection handshakes.', 'info');
      setAuthModalTab('signin');
      setIsAuthModalOpen(true);
      return;
    }
    if (connections.some(c => c.businessId === businessId)) {
      showToast('A connection is already active or pending with this company.', 'error');
      return;
    }

    if (isRegisteredCompanyId(businessId)) {
      api<Connection>('POST', '/network/connections', { toOrgId: businessId, purpose })
        .then(created => {
          setConnections(prev => (prev.some(c => c.id === created.id) ? prev : [...prev, created]));
          setConnectionsSent(prev => [...prev, businessId]);
          handleLogTimeline('B2B_CONNECTION_REQUESTED', 'connections', `Sent a connection request to ${name}. Purpose: "${purpose}"`, 'INFO');
          showToast(`Connection request sent to ${name}.`, 'success');
        })
        .catch(err => showToast(errorMessage(err), 'error'));
      return;
    }

    const newConn: Connection = {
      id: `conn-${Date.now()}`,
      businessId,
      businessName: name,
      businessCategory: category,
      businessLocation: location,
      logoBg,
      status: 'pending_outgoing',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      purpose,
      mutualCount: 3
    };

    setConnections(prev => [...prev, newConn]);
    setConnectionsSent(prev => [...prev, businessId]);
    handleLogTimeline('B2B_CONNECTION_REQUESTED', 'connections', `Sent professional partnership connection proposal to ${name}. Purpose: "${purpose}"`, 'INFO');
    onLogTriggered('B2B_CONNECTION_REQUESTED', 'companies', businessId, 'SUCCESS', `Dispatched outgoing partnership handshake invitation to ${name}`);
    showToast(`Connection request dispatched to ${name}!`, 'success');
  };

  const handleToggleFollow = (businessId: string, name: string) => {
    setFollowing(prev => {
      const isFollowing = prev.includes(businessId);
      if (isFollowing) {
        handleLogTimeline('B2B_UNFOLLOW_ACTION', 'following', `Unsubscribed from corporate stream of ${name}.`, 'INFO');
        onLogTriggered('B2B_UNFOLLOW_ACTION', 'companies', businessId, 'SUCCESS', `Unsubscribed from corporate stream of ${name}`);
        showToast(`Unfollowed ${name}`, 'info');
        return prev.filter(id => id !== businessId);
      } else {
        handleLogTimeline('B2B_FOLLOW_ACTION', 'following', `Subscribed to real-time project updates and materials logs from ${name}.`, 'SUCCESS');
        onLogTriggered('B2B_FOLLOW_ACTION', 'companies', businessId, 'SUCCESS', `Subscribed to real-time updates and logs from ${name}`);
        showToast(`Following ${name}`, 'success');
        return [...prev, businessId];
      }
    });
  };

  const handleToggleSave = (businessId: string, name: string) => {
    setSavedBusinesses(prev => {
      const isSaved = prev.includes(businessId);
      if (isSaved) {
        handleLogTimeline('B2B_COMPANY_UNSAVED', 'saved', `Removed ${name} from saved index.`, 'INFO');
        showToast(`Removed ${name} from saved companies.`, 'info');
        return prev.filter(id => id !== businessId);
      } else {
        handleLogTimeline('B2B_COMPANY_SAVED', 'saved', `Saved ${name} to corporate catalog for strategic sourcing.`, 'SUCCESS');
        showToast(`Saved ${name} successfully!`, 'success');
        return [...prev, businessId];
      }
    });
  };

  const handleToggleFavorite = (businessId: string, name: string) => {
    setFavoriteCompanies(prev => {
      const isFav = prev.includes(businessId);
      if (isFav) {
        handleLogTimeline('B2B_COMPANY_FAVORITE_REMOVED', 'saved', `Removed ${name} from favorite vendor ring.`, 'INFO');
        showToast(`Removed ${name} from favorites`, 'info');
        return prev.filter(id => id !== businessId);
      } else {
        handleLogTimeline('B2B_COMPANY_FAVORITE_ADDED', 'saved', `Added ${name} to premium circle for direct bidding.`, 'SUCCESS');
        showToast(`Added ${name} to favorites!`, 'success');
        return [...prev, businessId];
      }
    });
  };

  const createLeadFromInteraction = (leadData: {
    title: string;
    type: string;
    source: string;
    company: string;
    contactPerson: string;
    email: string;
    mobile: string;
    category: string;
    productService: string;
    location: string;
    description: string;
    priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  }) => {
    try {
      const savedLeads = appStore.getItem('realtyconnect_leads');
      let currentLeads: any[] = [];
      if (savedLeads) {
        currentLeads = JSON.parse(savedLeads);
      } else {
        currentLeads = [
          {
            id: 'RC-LE-1001',
            title: 'Bulk Reinforcement Steel Supply',
            type: 'Material Requirement',
            source: 'RFQ',
            company: 'Apex Developers Ltd',
            contactPerson: 'Rajesh Aggarwal',
            email: 'procurement@apexdev.in',
            mobile: '+91 98200 44021',
            category: 'Developers',
            productService: 'Fe550D TMT Rebars',
            location: 'Worli, Mumbai',
            priority: 'High',
            description: 'Procurement enquiry for 1,200 Metric Tons of premium high-ductility steel for our active BKC foundation contract.',
            preferredContactMethod: 'Email',
            status: 'Quotation Sent',
            assignedTo: 'Ramesh Raut',
            createdDate: '2026-07-15 04:10 PM',
            updatedDate: '2026-07-16 11:30 AM',
            notes: 'Quotation of ₹54,500/MT dispatched with certified audit trails. Waiting for corporate credit approval.',
            timeline: [
              { id: 't1', date: '2026-07-15 04:10 PM', type: 'Enquiry Received', text: 'Lead captured automatically from RFQ module.' },
              { id: 't2', date: '2026-07-15 05:00 PM', type: 'Assignment', text: 'Assigned to Ramesh Raut for wholesale quotation routing.' },
              { id: 't3', date: '2026-07-16 11:30 AM', type: 'Quotation Dispatched', text: 'Sent formal quote sheet with 30-day corporate credit limit terms.', outcome: 'Quote sent' }
            ],
            followUps: [
              { id: 'f1', date: '2026-07-16 11:30 AM', notes: 'Discussed pricing threshold. Rajesh requested formal RERA certificate matching.', outcome: 'Pending approval', nextFollowUpDate: '2026-07-18 10:00 AM' }
            ]
          },
          {
            id: 'RC-LE-1002',
            title: 'Ready Mix Concrete Sourcing - Grade M40',
            type: 'Product Enquiry',
            source: 'Marketplace',
            company: 'BuildCorp Construction',
            contactPerson: 'Sanjay Mudaliar',
            email: 's.mudaliar@buildcorp.co.in',
            mobile: '+91 80451 99002',
            category: 'Contractors',
            productService: 'Grade M40 RMC',
            location: 'Whitefield, Bangalore',
            priority: 'High',
            description: 'Direct inquiry regarding wholesale rates for 450 cubic meters of high-stress ready mix concrete for metro substation columns.',
            preferredContactMethod: 'Mobile',
            status: 'Discussion',
            assignedTo: 'Sanjay Kumar',
            createdDate: '2026-07-16 09:12 AM',
            updatedDate: '2026-07-16 02:45 PM',
            notes: 'Contractor is auditing compression testing labs before signing RMC supply contract.',
            timeline: [
              { id: 't1', date: '2026-07-16 09:12 AM', type: 'Enquiry Received', text: 'Lead generated from B2B Marketplace product details click.' },
              { id: 't2', date: '2026-07-16 02:45 PM', type: 'Follow-Up Logged', text: 'Completed telephonic briefing on factory testing machines.' }
            ],
            followUps: [
              { id: 'f1', date: '2026-07-16 02:45 PM', notes: 'Scheduled physical site visit for quality inspection.', outcome: 'Meeting Scheduled', nextFollowUpDate: '2026-07-20 11:00 AM' }
            ]
          },
          {
            id: 'RC-LE-1003',
            title: 'Joint Venture Proposal for Commercial Slabs',
            type: 'Joint Venture',
            source: 'Networking',
            company: 'Elite Materials Group',
            contactPerson: 'Vikram Singh',
            email: 'v.singh@elitemat.com',
            mobile: '+91 99110 33455',
            category: 'Vendors',
            productService: 'Commercial Warehouses',
            location: 'Delhi NCR',
            priority: 'Urgent',
            description: 'Looking to form a strategic joint venture for logistics warehouse development near Greater Noida Expressway.',
            preferredContactMethod: 'Meet',
            status: 'New',
            assignedTo: 'Unassigned',
            createdDate: '2026-07-17 08:15 AM',
            updatedDate: '2026-07-17 08:15 AM',
            notes: 'New strategic handshake requested. Immediate executive assignment needed.',
            timeline: [
              { id: 't1', date: '2026-07-17 08:15 AM', type: 'Enquiry Received', text: 'Lead created automatically from networking connection request.' }
            ],
            followUps: []
          }
        ];
      }

      const nextId = `RC-LE-${1000 + currentLeads.length + 1}`;
      const newLead = {
        id: nextId,
        title: leadData.title,
        type: leadData.type,
        source: leadData.source,
        company: leadData.company,
        contactPerson: leadData.contactPerson,
        email: leadData.email || 'partner@realtyconnect.co.in',
        mobile: leadData.mobile || '+91 98200 44000',
        category: leadData.category || 'General',
        productService: leadData.productService || 'N/A',
        location: leadData.location || 'Mumbai, MH',
        priority: leadData.priority || 'Medium',
        description: leadData.description,
        preferredContactMethod: 'Email',
        status: 'New',
        assignedTo: 'Unassigned',
        createdDate: new Date().toLocaleString(),
        updatedDate: new Date().toLocaleString(),
        notes: 'Automatically captured via ecosystem cross-module interaction.',
        timeline: [
          { id: 't1', date: new Date().toLocaleString(), type: 'Enquiry Received', text: `Captured enquiry automatically from ${leadData.source} module.` }
        ],
        followUps: []
      };

      const updatedLeads = [newLead, ...currentLeads];
      appStore.setItem('realtyconnect_leads', JSON.stringify(updatedLeads));
      onLogTriggered('CRM_INTEGRATED_LEAD_CAPTURED', 'leads', nextId, 'SUCCESS', `Integrated CRM: Captured and synchronized cross-module Lead ${nextId} from ${leadData.source}.`);
    } catch (e) {
      console.error('Error creating integrated lead', e);
    }
  };

  const handleSendEnquiry = (businessId: string, name: string, subject: string, category: string, message: string, email: string, phone: string): Promise<boolean> => {
    if (!userSession) {
      showToast('Please sign in or select your business role to send secure business inquiries.', 'info');
      setAuthModalTab('signin');
      setIsAuthModalOpen(true);
      return Promise.resolve(false);
    }
    const newEnq: Enquiry = {
      id: `enq-${Date.now()}`,
      businessId,
      businessName: name,
      subject,
      category,
      message,
      senderEmail: email,
      senderPhone: phone,
      timestamp: new Date().toLocaleString(),
      status: 'sent'
    };

    if (isRegisteredCompanyId(businessId)) {
      // A real company receives this as a new lead and a conversation; its reply arrives in Messaging.
      return api<{ conversationId: string }>('POST', '/network/enquiries', { toOrgId: businessId, kind: 'profile', subject, category, message, email, phone })
        .then(() => {
          setEnquiries(prev => [newEnq, ...prev]);
          handleLogTimeline('B2B_ENQUIRY_DISPATCHED', 'enquiries', `Sent enquiry "${subject}" to ${name}.`, 'INFO');
          showToast(`Enquiry delivered to ${name}. Their reply will appear in Messaging.`, 'success');
          return true;
        })
        .catch(err => {
          showToast(errorMessage(err), 'error');
          return false;
        });
    }

    setEnquiries(prev => [newEnq, ...prev]);
    handleLogTimeline('B2B_ENQUIRY_DISPATCHED', 'enquiries', `Sent secured B2B Inquiry regarding "${subject}" to ${name}.`, 'INFO');
    onLogTriggered('B2B_ENQUIRY_DISPATCHED', 'enquiries', businessId, 'SUCCESS', `Sent direct B2B message inquiry to ${name} on subject "${subject}"`);
    showToast(`Secured enquiry sent to ${name}!`, 'success');

    createLeadFromInteraction({
      title: `Corporate Enquiry: ${subject}`,
      type: 'General Business Enquiry',
      source: 'Business Profile',
      company: name,
      contactPerson: 'Sourcing Liaison',
      email: email,
      mobile: phone,
      category: category,
      productService: subject,
      location: 'Mumbai, MH',
      description: message,
      priority: 'High'
    });

    // High fidelity callback response
    setTimeout(() => {
      setEnquiries(current => current.map(enq => {
        if (enq.id === newEnq.id) {
          const callbackReply = `[Automated Priority Callback Response]\n\nGreetings from ${name}! Thank you for your inquiry regarding "${subject}".\n\nOur corporate BD team has reviewed your company details and verified your background. For active B2B stakeholders, we offer priority wholesale pricing, 100% tax invoicing, and customizable 30-45 day corporate credit terms.\n\nAn account officer will call you at ${phone} to discuss specifications.`;
          handleLogTimeline('B2B_CALLBACK_RECEIVED', 'enquiries', `Received priority auto-reply callback and phone allocation from ${name}.`, 'SUCCESS');
          onLogTriggered('B2B_CALLBACK_RECEIVED', 'enquiries', businessId, 'SUCCESS', `Received callback notification log from ${name}`);
          showToast(`Automated callback reply received from ${name}!`, 'success');
          return { ...enq, reply: callbackReply, status: 'replied' as const };
        }
        return enq;
      }));
    }, 1500);
    return Promise.resolve(true);
  };

  const handleScheduleMeeting = (businessId: string, name: string, title: string, date: string, time: string, type: string) => {
    if (!userSession) {
      showToast('Please sign in or select your business role to schedule corporate consultations.', 'info');
      setAuthModalTab('signin');
      setIsAuthModalOpen(true);
      return;
    }
    // 1. Create a fully compliant CalendarMeeting for our new Meetings & Calendar Engine
    const newCalendarMeet = {
      id: `RC-MT-${Date.now().toString().slice(-4)}`,
      title: title || 'B2B Strategic Collaboration',
      meetingType: (type === 'Virtual Video Call' ? 'Online Meeting' : type === 'On-Site Construction Review' ? 'Site Visit' : 'Business Meeting') as any,
      relatedCompany: name || 'Apex Developers Ltd',
      companyId: businessId || 'ent-1',
      contactPerson: 'Representative',
      organizer: currentUserName(),
      participants: [currentUserName(), 'Representative'],
      meetingDate: date || '2026-07-20',
      startTime: time ? (time.includes('AM') || time.includes('PM') ? '11:00' : time) : '11:00',
      endTime: '12:00',
      location: type === 'Virtual Video Call' ? 'Virtual Video Bridge' : 'Corporate Office Site',
      meetingMode: (type === 'Virtual Video Call' ? 'Video Call' : 'In Person') as any,
      priority: 'High' as const,
      status: 'Scheduled' as const,
      agenda: `Automatically scheduled via profile interface for ${title}.`,
      notes: '',
      discussionPoints: [],
      actionItems: [],
      followUpTasks: [],
      reminderTime: '30 Minutes Before' as const,
      attachments: []
    };

    const timeTo24h = (t: string) => {
      const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(t.trim());
      if (!m) return '11:00';
      let h = parseInt(m[1], 10);
      if (m[3]?.toUpperCase() === 'PM' && h < 12) h += 12;
      if (m[3]?.toUpperCase() === 'AM' && h === 12) h = 0;
      return `${String(h).padStart(2, '0')}:${m[2]}`;
    };
    const registeredHost = isRegisteredCompanyId(businessId);
    if (registeredHost) {
      newCalendarMeet.startTime = timeTo24h(time || '11:00');
      newCalendarMeet.endTime = `${String((parseInt(newCalendarMeet.startTime, 10) + 1) % 24).padStart(2, '0')}:${newCalendarMeet.startTime.slice(3)}`;
      newCalendarMeet.participants = [currentUserName()];
      api('POST', '/network/meetings', {
        toOrgId: businessId,
        meetingId: newCalendarMeet.id,
        title: newCalendarMeet.title,
        meetingType: newCalendarMeet.meetingType,
        meetingDate: newCalendarMeet.meetingDate,
        startTime: newCalendarMeet.startTime,
        endTime: newCalendarMeet.endTime,
        meetingMode: newCalendarMeet.meetingMode,
        location: newCalendarMeet.location,
        agenda: newCalendarMeet.agenda
      }).catch(err => showToast(`The invitation could not be delivered: ${errorMessage(err)}`, 'error'));
    }

    // Save to appStore list
    try {
      const saved = appStore.getItem('realtyconnect_meetings');
      const currentList = saved ? JSON.parse(saved) : [];
      appStore.setItem('realtyconnect_meetings', JSON.stringify([newCalendarMeet, ...currentList]));
    } catch (e) { console.error(e); }

    const newMeet: Meeting = {
      id: `meet-${Date.now()}`,
      businessId,
      businessName: name,
      title,
      date,
      time,
      type: type as any,
      status: 'scheduled',
      timestamp: new Date().toLocaleString()
    };

    setMeetings(prev => [newMeet, ...prev]);
    handleLogTimeline('B2B_MEETING_SCHEDULED', 'meetings', `Scheduled B2B Consultation "${title}" with ${name} on ${date} at ${time}.`, 'SUCCESS');
    onLogTriggered('B2B_MEETING_SCHEDULED', 'companies', businessId, 'SUCCESS', `Scheduled virtual consultation with ${name}`);
    showToast(`Scheduled consultation with ${name}! Redirecting to Calendar.`, 'success');

    // Pre-fill form state and switch view so user can view/manage
    setPrefilledMeeting(newCalendarMeet);
    setActiveViewMode('meetings');

    if (!registeredHost) createLeadFromInteraction({
      title: `Consultation Schedule: ${title}`,
      type: 'Meeting Request',
      source: 'Networking',
      company: name,
      contactPerson: 'Meeting Partner',
      email: 'corporate@realtyconnect.in',
      mobile: '+91 90041 55600',
      category: 'General',
      productService: title,
      location: 'Virtual Conference',
      description: `Scheduled virtual consultation with ${name} on ${date} at ${time}. Interaction Type: ${type}`,
      priority: 'Medium'
    });
  };

  const handleSendPartnership = (businessId: string, name: string, type: 'partnership' | 'dealer' | 'distributor', terms: string, value: string, scope: string) => {
    if (!userSession) {
      showToast('Please sign in or select your business role to file channel partnerships.', 'info');
      setAuthModalTab('signin');
      setIsAuthModalOpen(true);
      return;
    }
    const newPart: Partnership = {
      id: `part-${Date.now()}`,
      businessId,
      businessName: name,
      type,
      terms,
      estimatedValue: value,
      scope,
      status: 'pending',
      timestamp: new Date().toLocaleString()
    };

    if (isRegisteredCompanyId(businessId)) {
      api('POST', '/network/enquiries', {
        toOrgId: businessId,
        kind: 'partnership',
        subject: `${type === 'partnership' ? 'Partnership' : type === 'dealer' ? 'Dealership' : 'Distributorship'} proposal: ${scope}`.slice(0, 200),
        category: 'Partnership',
        message: `Scope: ${scope}\nEstimated value: ${value}\nTerms: ${terms}`
      })
        .then(() => {
          setPartnerships(prev => [newPart, ...prev]);
          handleLogTimeline('B2B_PARTNERSHIP_PROPOSAL_FILED', 'partnerships', `Sent a ${type} proposal to ${name}.`, 'SUCCESS');
          showToast(`Proposal delivered to ${name}.`, 'success');
        })
        .catch(err => showToast(errorMessage(err), 'error'));
      return;
    }

    setPartnerships(prev => [newPart, ...prev]);
    handleLogTimeline('B2B_PARTNERSHIP_PROPOSAL_FILED', 'partnerships', `Filed regional ${type} franchise request with ${name} valued at ${value}.`, 'SUCCESS');
    onLogTriggered('B2B_PARTNERSHIP_PROPOSAL_FILED', 'companies', businessId, 'SUCCESS', `Filed strategic channel proposal with ${name}. Terms: ${terms}`);
    showToast(`Strategic partnership proposal dispatched to ${name}!`, 'success');

    createLeadFromInteraction({
      title: `Strategic Sourcing: ${scope}`,
      type: type === 'partnership' ? 'Business Partnership' : type === 'dealer' ? 'Dealer Request' : 'Distributor Request',
      source: 'Networking',
      company: name,
      contactPerson: 'Strategic Director',
      email: 'partnerships@realtyconnect.co.in',
      mobile: '+91 99110 33455',
      category: 'General',
      productService: scope,
      location: 'Mumbai, MH',
      description: `Dispatched channel proposal. Scope: ${scope}. Value: ${value}. Terms: ${terms}`,
      priority: 'Urgent'
    });
  };

  const handleSendContactExchange = (businessId: string, name: string, role: string, phone: string, email: string) => {
    const newExch: ContactExchange = {
      id: `exch-${Date.now()}`,
      businessId,
      businessName: name,
      role,
      phone,
      email,
      status: 'pending',
      timestamp: new Date().toLocaleString()
    };

    setContactExchanges(prev => [newExch, ...prev]);
    handleLogTimeline('B2B_CONTACT_CARD_EXCHANGED', 'preferences', `Requested digital business card swap with ${name}.`, 'INFO');
    onLogTriggered('B2B_CONTACT_CARD_EXCHANGED', 'companies', businessId, 'SUCCESS', `Dispatched contact exchange card with role ${role}`);
    showToast(`Exchanged business cards with ${name}!`, 'success');

    createLeadFromInteraction({
      title: `Digital Business Card Swap with ${name}`,
      type: 'General Business Enquiry',
      source: 'Networking',
      company: name,
      contactPerson: 'Sourcing Representative',
      email: email,
      mobile: phone,
      category: 'General',
      productService: role,
      location: 'Mumbai, MH',
      description: `Requested corporate business card exchange. Representative Role: ${role}`,
      priority: 'Low'
    });
  };

  const handleSendCompanyVisit = (businessId: string, name: string, facility: string, date: string, time: string, purpose: string) => {
    const newVisit: CompanyVisit = {
      id: `visit-${Date.now()}`,
      businessId,
      businessName: name,
      facilityName: facility,
      date,
      time,
      purpose,
      status: 'pending',
      timestamp: new Date().toLocaleString()
    };

    setCompanyVisits(prev => [newVisit, ...prev]);
    handleLogTimeline('B2B_SITE_AUDIT_REQUESTED', 'meetings', `Requested physical site/facility audit tour of ${facility} with ${name}.`, 'INFO');
    onLogTriggered('B2B_SITE_AUDIT_REQUESTED', 'companies', businessId, 'SUCCESS', `Requested manufacturing facility tour at ${facility}`);
    showToast(`Site audit request submitted to ${name}!`, 'success');

    createLeadFromInteraction({
      title: `Facility Sourcing Audit: ${facility}`,
      type: 'Project Requirement',
      source: 'Networking',
      company: name,
      contactPerson: 'Inspection Officer',
      email: 'audits@realtyconnect.co.in',
      mobile: '+91 91220 55110',
      category: 'General',
      productService: facility,
      location: facility,
      description: `Requested heavy manufacturing facility inspection tour. Purpose: ${purpose}. Schedule Date: ${date} ${time}`,
      priority: 'High'
    });
  };

  const handlePublishRfq = (title: string, category: string, quantity: string, value: string, closeDate: string, desc: string) => {
    const newRfq: RfqOpportunity = {
      id: `rfq-${Date.now()}`,
      title,
      category,
      quantity,
      estimatedValue: value,
      closeDate,
      description: desc,
      publishedBy: currentOrgName(),
      bidsCount: 0,
      status: 'active',
      timestamp: new Date().toLocaleString()
    };

    setRfqs(prev => [newRfq, ...prev]);
    handleLogTimeline('B2B_RFQ_PUBLISHED', 'enquiries', `Published technical RFQ tender: "${title}" on Opportunities Board.`, 'SUCCESS');
    onLogTriggered('B2B_RFQ_PUBLISHED', 'enquiries', `rfq-${Date.now()}`, 'SUCCESS', `Published materials RFQ to ecosystem partners`);
    showToast(`Published RFQ "${title}" successfully!`, 'success');

    createLeadFromInteraction({
      title: `Active RFQ Tender: ${title}`,
      type: 'Material Requirement',
      source: 'RFQ',
      company: currentOrgName(),
      contactPerson: 'Procurement Specialist',
      email: 'sourcing@multisarv.co.in',
      mobile: '+91 98200 44021',
      category: category,
      productService: title,
      location: 'Corporate HQ',
      description: `${desc}. Sourced Quantity: ${quantity}. Projected Value: ${value}. RFP Closure Date: ${closeDate}`,
      priority: 'High'
    });
  };

  const handleSendInvitation = (email: string, website: string, role: string) => {
    const newInv: ExternalInvitation = {
      id: `inv-${Date.now()}`,
      email,
      website,
      role,
      timestamp: new Date().toLocaleString(),
      status: 'sent'
    };

    setInvitations(prev => [newInv, ...prev]);
    handleLogTimeline('PARTNER_INVITATION_DISPATCHED', 'invitations', `Invited external stakeholder ${email} (URL: ${website}) to RealtyConnect.`, 'SUCCESS');
    onLogTriggered('PARTNER_INVITATION_DISPATCHED', 'companies', `inv-${Date.now()}`, 'SUCCESS', `Invited external supplier ${email} to ecosystem`);
    showToast(`Invitation dispatched to ${email}!`, 'success');
  };

  const handleBlockCompany = (businessId: string, name: string, reason: string) => {
    if (isRegisteredCompanyId(businessId)) {
      api('POST', '/network/blocks', { orgId: businessId }).catch(err => showToast(errorMessage(err), 'error'));
    }
    const newBlock: BlockedReported = {
      id: `block-${Date.now()}`,
      businessId,
      businessName: name,
      action: 'blocked',
      reason,
      timestamp: new Date().toLocaleString()
    };

    setBlockedReported(prev => [newBlock, ...prev]);
    setConnections(prev => prev.filter(c => c.businessId !== businessId));
    setConnectionsSent(prev => prev.filter(id => id !== businessId));
    handleLogTimeline('B2B_COMPANY_BLOCKED', 'preferences', `Blocked company ${name} from our networking circle. Reason: "${reason}".`, 'WARNING');
    onLogTriggered('B2B_COMPANY_BLOCKED', 'companies', businessId, 'WARNING', `Blocked ${name} from messaging and directory access.`);
    showToast(`Blocked company ${name}`, 'error');
  };

  const handleReportCompany = (businessId: string, name: string, reason: string, details: string) => {
    if (isRegisteredCompanyId(businessId)) {
      // Reports of real companies reach platform reviewers.
      api('POST', '/network/reports', { orgId: businessId, reason, details }).catch(err => showToast(errorMessage(err), 'error'));
    }
    const newReport: BlockedReported = {
      id: `report-${Date.now()}`,
      businessId,
      businessName: name,
      action: 'reported',
      reason,
      details,
      timestamp: new Date().toLocaleString()
    };

    setBlockedReported(prev => [newReport, ...prev]);
    handleLogTimeline('B2B_COMPANY_REPORTED', 'preferences', `Filed governance violation report against ${name}. Reason: "${reason}".`, 'WARNING');
    onLogTriggered('B2B_COMPANY_REPORTED', 'companies', businessId, 'WARNING', `Filed corporate spam/misconduct report against ${name}`);
    showToast(`Report filed against ${name}`, 'error');
  };

  const handleUnblockCompany = (businessId: string) => {
    const target = blockedReported.find(b => b.businessId === businessId);
    if (!target) return;
    if (isRegisteredCompanyId(businessId)) {
      api('DELETE', `/network/blocks/${encodeURIComponent(businessId)}`).catch(err => showToast(errorMessage(err), 'error'));
    }

    setBlockedReported(prev => prev.filter(b => b.businessId !== businessId));
    handleLogTimeline('B2B_COMPANY_UNBLOCKED', 'preferences', `Unblocked company ${target.businessName}.`, 'SUCCESS');
    onLogTriggered('B2B_COMPANY_UNBLOCKED', 'companies', businessId, 'SUCCESS', `Restored communication and connection access to ${target.businessName}`);
    showToast(`Unblocked company ${target.businessName}`, 'success');
  };

  // Connect request workflow
  const handleConnectRequest = (businessId: string, businessName: string) => {
    const target = companyRegistry.find(b => b.id === businessId);
    if (!target) return;
    handleSendConnection(businessId, businessName, target.category, target.location, target.logoBg, 'Standard Mutual Handshake via B2B Directory Card');
  };

  // Filter Handling
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const results = companyRegistry.filter(ent => {
      const matchesSearch = ent.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            ent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            ent.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            ent.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
                            
      const matchesCategory = selectedCategory === 'All' || ent.category === selectedCategory;
      const matchesLocation = selectedLocation === 'All' || ent.location.includes(selectedLocation);
      
      return matchesSearch && matchesCategory && matchesLocation;
    });
    
    setSearchResults(results);
    
    onLogTriggered(
      'B2B_DIRECTORY_SEARCH_EXECUTED',
      'directory',
      `search-${selectedCategory}-${selectedLocation}`,
      'SUCCESS',
      `B2B Business Discovery: Evaluated query "${searchTerm}" filtered by category "${selectedCategory}" and location "${selectedLocation}". Found ${results.length} results.`
    );
    
    showToast(`Search complete. Found ${results.length} matched B2B business profiles.`, 'info');
  };

  const handleResetSearch = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedLocation('All');
    setSearchResults(companyRegistry);
    showToast('B2B Registry filter cleared.', 'info');
  };

  // recommendation submit
  const handleAddRecommendation = (businessId: string, businessName: string) => {
    if (!recommendationText.trim()) return;
    
    setRecommendationList(prev => ({
      ...prev,
      [businessId]: [...(prev[businessId] || []), recommendationText]
    }));
    
    // Audit Log Integration (Background Platform)
    onLogTriggered(
      'B2B_PEER_RECOMMENDATION_REGISTERED',
      'companies',
      businessId,
      'SUCCESS',
      `Governance: Registered peer business endorsement under audited B2B pipeline. Endorsement: "${recommendationText.substring(0, 80)}..."`
    );
    
    setRecommendationText('');
    showToast(`Your professional recommendation for ${businessName} has been sealed and logged.`, 'success');
  };

  // Contact Form submit
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;

    setContactSubmitted(true);
    
    // Audit Log Integration (Background Platform)
    onLogTriggered(
      'LEAD_FORM_INQUIRY_REGISTERED',
      'leads',
      `lead-${Math.floor(Math.random() * 10000)}`,
      'SUCCESS',
      `Inquiry captured from "${contactName}" (${contactEmail}) representing stakeholder role: ${contactRole}. Details registered in CRM queue.`
    );

    createLeadFromInteraction({
      title: `Website Onboarding Request: ${contactRole}`,
      type: 'Consultation Request',
      source: 'Landing Contact Form',
      company: `${contactRole} Sourcing`,
      contactPerson: contactName,
      email: contactEmail,
      mobile: '+91 90041 55600',
      category: 'General',
      productService: 'Enterprise Onboarding',
      location: 'General Hub',
      description: contactMessage,
      priority: 'Medium'
    });

    showToast('Thank you! RealtyConnect regional representative will contact your business within 2 hours.', 'success');
    
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setContactSubmitted(false);
    }, 4000);
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 flex flex-col text-slate-200">
      
      {/* Immersive Spotlight Search Backdrop */}
      {isSearchFocused && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-[3px] z-40 transition-all duration-300" 
          onClick={() => {
            setIsSearchFocused(false);
            setSearchSuggestionIndex(-1);
          }}
        />
      )}

      {/* Enterprise Sticky Command Bar */}
      <nav className="bg-slate-950/90 backdrop-blur-md border-b border-slate-850 px-6 py-3.5 sticky top-0 z-50 flex items-center justify-between gap-4 transition-all">
        
        {/* Left Side: Brand Logo & Marketplace Nav */}
        <div className="flex items-center gap-6 shrink-0">
          <div 
            className="flex items-center gap-3 cursor-pointer select-none shrink-0"
            onClick={() => {
              setActiveViewMode(userSession ? 'dashboard' : 'home');
              onLogTriggered('BRAND_LOGO_CLICKED', 'brand', 'home', 'SUCCESS', 'Command Bar: Reset to active core viewport.');
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Building2 className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div className={userSession ? 'hidden sm:block' : ''}>
              <h1 className="font-display font-extrabold text-base tracking-tight text-white flex items-center gap-2 mt-0.5">
                RealtyConnect™
              </h1>
              <p className="hidden sm:block text-[9px] font-mono tracking-wider text-emerald-400 uppercase font-bold leading-none mt-1">The Real Estate Business Network</p>
            </div>
          </div>

          {!userSession && (
            <div className="hidden lg:flex items-center gap-1 xl:gap-2 border-l border-slate-800 pl-6">
              {[
                { id: 'home', label: 'Home' },
                { id: 'directory', label: 'Businesses', action: () => openAllBusinesses() },
                { id: 'products', label: 'Products', action: () => openMarketplace('products') },
                { id: 'services', label: 'Services', action: () => {
                  setSearchTerm('Consultants');
                  setGlobalSearchTerm('Consultants');
                  setSelectedCategory('Consultants');
                  setActiveViewMode('directory');
                } },
                { id: 'marketplace-sec', label: 'Marketplace', action: () => openMarketplace('all') },
                { id: 'rfq_management', label: 'RFQs' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else {
                      setActiveViewMode(item.id as any);
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer border ${
                    isTopNavActive(item.id)
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm shadow-emerald-500/5'
                      : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <a
                href="#membership"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveViewMode('home');
                  setTimeout(() => {
                    document.getElementById('membership-plans-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 120);
                }}
                className="px-2.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent"
              >
                Membership
              </a>
              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveViewMode('home');
                  setTimeout(() => {
                    document.getElementById('about-realtyconnect-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 120);
                }}
                className="px-2.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent"
              >
                About
              </a>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveViewMode('home');
                  setTimeout(() => {
                    document.getElementById('contact-us-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 120);
                }}
                className="px-2.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent"
              >
                Contact
              </a>
            </div>
          )}
        </div>

        {/* Center: Universal Command & Search Palette (Desktop & Tablet) */}
        <div className={`flex-1 max-w-xl mx-4 relative z-50 ${userSession ? 'hidden md:block' : 'hidden 2xl:block'}`}>
          <div className={`relative flex items-center bg-slate-900/80 border rounded-xl px-3.5 py-2 transition-all duration-200 ${
            isSearchFocused 
              ? 'border-emerald-500/80 ring-2 ring-emerald-500/10 shadow-lg shadow-emerald-500/5 bg-slate-900' 
              : 'border-slate-800 hover:border-slate-700'
          }`}>
            <Search className={`w-4 h-4 mr-2.5 transition-colors ${isSearchFocused ? 'text-emerald-400' : 'text-slate-500'}`} />
            <input
              id="global-search-input"
              type="text"
              placeholder="Search Companies, Products, Tenders, RFQs... (Ctrl+K)"
              value={globalSearchTerm}
              onChange={(e) => {
                setGlobalSearchTerm(e.target.value);
                setSearchSuggestionIndex(-1);
              }}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={handleSearchInputKeyDown}
              className="w-full bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-500"
              autoComplete="off"
            />
            {globalSearchTerm ? (
              <button 
                onClick={() => setGlobalSearchTerm('')} 
                className="text-slate-500 hover:text-white hover:bg-slate-800 p-0.5 rounded transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-850 font-mono text-[9px] text-slate-500 select-none">
                <span>Ctrl</span>
                <span>K</span>
              </div>
            )}
          </div>

          {/* Grouped Search Suggestion Dropdown Panel */}
          {isSearchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] divide-y divide-slate-850 select-none animate-in fade-in slide-in-from-top-2 duration-200">
              
              {/* Dropdown Meta Header / Quick Actions */}
              <div className="px-4 py-2 bg-slate-950 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>UNIVERSAL ENGINE MATCHES</span>
                <span className="flex items-center gap-1.5">
                  <span>Press <kbd className="text-slate-400 bg-slate-900 px-1 rounded">↑↓</kbd> to navigate</span>
                  <span>•</span>
                  <span><kbd className="text-slate-400 bg-slate-900 px-1 rounded">Enter</kbd> to select</span>
                </span>
              </div>

              {/* Suggestions Core Body */}
              <div className="overflow-y-auto max-h-[50vh]">
                
                {/* 1. State: Empty Search Term (Recent, Popular, Trending) */}
                {!globalSearchTerm.trim() && (
                  <div className="p-4 space-y-4">
                    {/* Recent Searches */}
                    {searchHistory.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 tracking-wider uppercase mb-2">
                          <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-slate-500" /> Recent Searches</span>
                          <button 
                            onClick={handleClearAllHistory}
                            className="text-emerald-400 hover:text-emerald-300 normal-case font-medium font-sans text-[10px]"
                          >
                            Clear All
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {searchHistory.map((term, index) => (
                            <div 
                              key={`hist-${term}-${index}`}
                              onClick={() => {
                                setGlobalSearchTerm(term);
                                onLogTriggered('B2B_SEARCH_HISTORY_CLICKED', 'search_analytics', term, 'SUCCESS', `Universal Search: Selected recent term "${term}".`);
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950 border border-slate-850 hover:border-slate-750 text-xs text-slate-300 hover:text-emerald-400 transition-all cursor-pointer group"
                            >
                              <span>{term}</span>
                              <button 
                                onClick={(e) => handleClearHistoryItem(term, e)}
                                className="text-slate-500 hover:text-red-400 rounded-full hover:bg-slate-900 p-0.5 group-hover:text-slate-300"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Popular Searches */}
                    <div>
                      <h4 className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mb-2 flex items-center gap-1.5">
                        <Bookmark className="w-3 h-3 text-slate-500" /> Popular Resources
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { term: 'Fe550D TMT Steel', desc: 'Material supply chain index' },
                          { term: 'Piling rig lease', desc: 'Equipment rentals & machinery' },
                          { term: 'Luxury tower JV', desc: 'Joint venture proposals' },
                          { term: 'Metro piling', desc: 'Heavy infrastructure RFQs' },
                        ].map((item, index) => (
                          <div 
                            key={`pop-${index}`}
                            onClick={() => {
                              setGlobalSearchTerm(item.term);
                              onLogTriggered('B2B_SEARCH_POPULAR_CLICKED', 'search_analytics', item.term, 'SUCCESS', `Universal Search: Clicked popular shortcut term "${item.term}".`);
                            }}
                            className="p-2 rounded bg-slate-950 border border-slate-850 hover:border-slate-750 hover:bg-slate-900/50 transition-all cursor-pointer text-left"
                          >
                            <div className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400">{item.term}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Trending Search Terms */}
                    <div>
                      <h4 className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mb-2 flex items-center gap-1.5">
                        <Activity className="w-3 h-3 text-emerald-500" /> Trending Topics
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {['AAC Blocks', 'Metro substructures', 'Solar townships', 'Apex Developers', 'Vanguard Builders'].map((term, index) => (
                          <button 
                            key={`trend-${index}`}
                            onClick={() => {
                              setGlobalSearchTerm(term);
                              onLogTriggered('B2B_SEARCH_TRENDING_CLICKED', 'search_analytics', term, 'SUCCESS', `Universal Search: Traced trending hashtag "${term}".`);
                            }}
                            className="text-xs px-2.5 py-1 rounded-full bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 hover:bg-emerald-900/30 transition-all cursor-pointer font-medium"
                          >
                            🔥 {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. State: Non-Empty Search Term (Grouped Results) */}
                {globalSearchTerm.trim() && (
                  <div className="divide-y divide-slate-850">
                    
                    {/* Companies Section */}
                    {universalSearchResults.companies.length > 0 && (
                      <div className="p-3">
                        <div className="px-3 py-1 text-[10px] font-semibold font-mono text-slate-500 tracking-wider uppercase flex items-center gap-1">
                          <Building className="w-3.5 h-3.5" /> Companies & Profiles
                        </div>
                        <div className="space-y-1 mt-1.5">
                          {universalSearchResults.companies.slice(0, 3).map((item) => (
                            <div 
                              key={`res-${item.id}`}
                              onClick={() => handleSelectSearchResult(item)}
                              className="px-3 py-2 rounded-lg hover:bg-slate-850 cursor-pointer flex items-center justify-between text-left transition-all"
                            >
                              <div className="min-w-0 flex-1 pr-4">
                                <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                                  {item.title}
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">{item.category}</span>
                                </div>
                                <div className="text-[10.5px] text-slate-400 truncate mt-0.5">{item.description}</div>
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono whitespace-nowrap flex items-center gap-1 shrink-0 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                                <MapPin className="w-3 h-3 text-slate-500" /> {item.location}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Products & Services Section */}
                    {universalSearchResults.products.length > 0 && (
                      <div className="p-3">
                        <div className="px-3 py-1 text-[10px] font-semibold font-mono text-slate-500 tracking-wider uppercase flex items-center gap-1">
                          <ShoppingBag className="w-3.5 h-3.5" /> Marketplace Products
                        </div>
                        <div className="space-y-1 mt-1.5">
                          {universalSearchResults.products.slice(0, 3).map((item) => (
                            <div 
                              key={`res-${item.id}`}
                              onClick={() => handleSelectSearchResult(item)}
                              className="px-3 py-2 rounded-lg hover:bg-slate-850 cursor-pointer flex items-center justify-between text-left transition-all"
                            >
                              <div className="min-w-0 flex-1 pr-4">
                                <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                                  {item.title}
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400">{item.category}</span>
                                </div>
                                <div className="text-[10.5px] text-slate-400 truncate mt-0.5">{item.description}</div>
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono whitespace-nowrap flex items-center gap-1 shrink-0 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                                <MapPin className="w-3 h-3 text-slate-500" /> {item.location}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* RFQs Section */}
                    {universalSearchResults.rfqs.length > 0 && (
                      <div className="p-3">
                        <div className="px-3 py-1 text-[10px] font-semibold font-mono text-slate-500 tracking-wider uppercase flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" /> RFQ Tenders
                        </div>
                        <div className="space-y-1 mt-1.5">
                          {universalSearchResults.rfqs.slice(0, 3).map((item) => (
                            <div 
                              key={`res-${item.id}`}
                              onClick={() => handleSelectSearchResult(item)}
                              className="px-3 py-2 rounded-lg hover:bg-slate-850 cursor-pointer flex items-center justify-between text-left transition-all"
                            >
                              <div className="min-w-0 flex-1 pr-4">
                                <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                                  {item.title}
                                </div>
                                <div className="text-[10.5px] text-slate-400 truncate mt-0.5">{item.description}</div>
                                <div className="text-[9px] text-emerald-400 mt-1 font-mono">{item.category}</div>
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono whitespace-nowrap flex items-center gap-1 shrink-0 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                                <MapPin className="w-3 h-3 text-slate-500" /> {item.location}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Opportunities Section */}
                    {universalSearchResults.opportunities.length > 0 && (
                      <div className="p-3">
                        <div className="px-3 py-1 text-[10px] font-semibold font-mono text-slate-500 tracking-wider uppercase flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" /> Opportunities & JVs
                        </div>
                        <div className="space-y-1 mt-1.5">
                          {universalSearchResults.opportunities.slice(0, 3).map((item) => (
                            <div 
                              key={`res-${item.id}`}
                              onClick={() => handleSelectSearchResult(item)}
                              className="px-3 py-2 rounded-lg hover:bg-slate-850 cursor-pointer flex items-center justify-between text-left transition-all"
                            >
                              <div className="min-w-0 flex-1 pr-4">
                                <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                                  {item.title}
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400">{item.category}</span>
                                </div>
                                <div className="text-[10.5px] text-slate-400 truncate mt-0.5">{item.description}</div>
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono whitespace-nowrap flex items-center gap-1 shrink-0 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                                <MapPin className="w-3 h-3 text-slate-500" /> {item.location}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Business Feed & News Section */}
                    {universalSearchResults.feed.length > 0 && (
                      <div className="p-3">
                        <div className="px-3 py-1 text-[10px] font-semibold font-mono text-slate-500 tracking-wider uppercase flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" /> Business Feed Updates
                        </div>
                        <div className="space-y-1 mt-1.5">
                          {universalSearchResults.feed.slice(0, 3).map((item) => (
                            <div 
                              key={`res-${item.id}`}
                              onClick={() => handleSelectSearchResult(item)}
                              className="px-3 py-2 rounded-lg hover:bg-slate-850 cursor-pointer flex items-center justify-between text-left transition-all"
                            >
                              <div className="min-w-0 flex-1 pr-4">
                                <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                                  {item.title}
                                </div>
                                <div className="text-[10.5px] text-slate-400 truncate mt-0.5">{item.description}</div>
                                <div className="text-[9px] text-slate-500 font-mono mt-0.5">{item.category}</div>
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono whitespace-nowrap flex items-center gap-1 shrink-0 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                                <MapPin className="w-3 h-3 text-slate-500" /> {item.location}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {universalSearchResults.companies.length === 0 && 
                     universalSearchResults.products.length === 0 && 
                     universalSearchResults.rfqs.length === 0 && 
                     universalSearchResults.opportunities.length === 0 && 
                     universalSearchResults.feed.length === 0 && (
                      <div className="p-8 text-center text-slate-500">
                        <AlertTriangle className="w-8 h-8 text-amber-500/80 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-slate-300">No matches found for "{globalSearchTerm}"</p>
                        <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto">Try typing a more general category or query like "TMT", "Metro", "Apex", or "AAC Blocks".</p>
                        <button 
                          onClick={() => setGlobalSearchTerm('')}
                          className="mt-3 text-[10px] bg-slate-800 hover:bg-slate-750 text-slate-300 px-3 py-1 rounded font-semibold transition-all"
                        >
                          Clear Search
                        </button>
                      </div>
                    )}

                  </div>
                )}
                
              </div>

            </div>
          )}
        </div>

        {/* Right Side: Professional Header Actions */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          
          {!userSession && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAuthModalTab('signin');
                  setIsAuthModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono uppercase bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-200 transition-all cursor-pointer shadow-sm"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={openSignUp}
                className="hidden sm:block px-3 py-1.5 rounded-lg text-xs font-bold font-mono uppercase bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-all cursor-pointer shadow-md shadow-emerald-500/10"
              >
                Sign Up
              </button>
            </div>
          )}

          {userSession && (
            <>
              {/* 1. Quick Create Action (Dropdown Menu) */}
          <div className="relative">
            <button
              onClick={() => {
                setIsQuickCreateOpen(!isQuickCreateOpen);
                setIsNotificationsOpen(false);
                setIsProfileMenuOpen(false);
                onLogTriggered('QUICK_CREATE_MENU_TOGGLED', 'navigation', 'quick_create', 'SUCCESS', `Quick Create menu toggled: ${!isQuickCreateOpen ? 'OPEN' : 'CLOSED'}`);
              }}
              className={`bg-slate-900 border hover:bg-slate-850 text-slate-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                isQuickCreateOpen ? 'border-emerald-500 bg-slate-850 text-white' : 'border-slate-800'
              }`}
              title="Create new listings quickly"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Quick Create</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isQuickCreateOpen ? 'rotate-180' : ''}`} />
            </button>

            {isQuickCreateOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsQuickCreateOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 py-1 divide-y divide-slate-850 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3.5 py-1.5 text-[9.5px] font-mono text-slate-500 tracking-wider uppercase">
                    Platform Core Creator
                  </div>
                  <div className="py-1">
                    <button 
                      onClick={() => handleQuickCreate('opportunity')}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-850 flex items-center gap-2.5 text-xs text-slate-300 hover:text-white transition-all"
                    >
                      <Briefcase className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-semibold">Create Opportunity</div>
                        <div className="text-[9.5px] text-slate-500">Advertise a B2B requirement</div>
                      </div>
                    </button>
                    <button 
                      onClick={() => handleQuickCreate('rfq')}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-850 flex items-center gap-2.5 text-xs text-slate-300 hover:text-white transition-all"
                    >
                      <FileText className="w-4 h-4 text-blue-400" />
                      <div>
                        <div className="font-semibold">Publish RFQ / Tender</div>
                        <div className="text-[9.5px] text-slate-500">Settle materials & service bids</div>
                      </div>
                    </button>
                    <button 
                      onClick={() => handleQuickCreate('product')}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-850 flex items-center gap-2.5 text-xs text-slate-300 hover:text-white transition-all"
                    >
                      <ShoppingBag className="w-4 h-4 text-indigo-400" />
                      <div>
                        <div className="font-semibold">Add Marketplace Listing</div>
                        <div className="text-[9.5px] text-slate-500">Sell equipment or materials</div>
                      </div>
                    </button>
                  </div>
                  <div className="py-1">
                    <button 
                      onClick={() => handleQuickCreate('feed')}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-850 flex items-center gap-2.5 text-xs text-slate-300 hover:text-white transition-all"
                    >
                      <MessageSquare className="w-4 h-4 text-purple-400" />
                      <div>
                        <div className="font-semibold">Publish Feed Update</div>
                        <div className="text-[9.5px] text-slate-500">Broadcast news or price update</div>
                      </div>
                    </button>
                    <button 
                      onClick={() => handleQuickCreate('meeting')}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-850 flex items-center gap-2.5 text-xs text-slate-300 hover:text-white transition-all"
                    >
                      <Clock className="w-4 h-4 text-amber-400" />
                      <div>
                        <div className="font-semibold">Schedule Meeting</div>
                        <div className="text-[9.5px] text-slate-500">Book corporate consultations</div>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 2. Advanced Notifications Center (Dropdown) */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsProfileMenuOpen(false);
                setIsQuickCreateOpen(false);
                if (!isNotificationsOpen) {
                  onLogTriggered('NOTIFICATIONS_HUB_ACCESSED', 'navigation', 'alerts', 'SUCCESS', 'Notifications Hub: Consulted corporate event logging terminal.');
                }
              }}
              className={`bg-slate-900 border hover:bg-slate-850 text-slate-200 p-2 rounded-lg transition-all cursor-pointer relative ${
                isNotificationsOpen ? 'border-emerald-500 bg-slate-850 text-white' : 'border-slate-800'
              }`}
              title="Notifications Panel"
            >
              <Bell className="w-4 h-4" />
              {globalNotifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-sans font-extrabold text-[9px] flex items-center justify-center animate-pulse">
                  {globalNotifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col divide-y divide-slate-850 animate-in fade-in slide-in-from-top-2 duration-200">
                  
                  {/* Notifications Header */}
                  <div className="p-3 bg-slate-950 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">Notifications</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono">
                        {globalNotifications.filter(n => !n.read).length} unread
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={handleMarkAllNotificationsAsRead}
                        className="text-[10px] text-slate-400 hover:text-emerald-400 transition-colors font-medium"
                      >
                        Read All
                      </button>
                      <span className="text-slate-800 text-xs font-normal">|</span>
                      <button 
                        onClick={handleClearAllNotifications}
                        className="text-[10px] text-slate-400 hover:text-red-400 transition-colors font-medium"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* Notification List Container */}
                  <div className="overflow-y-auto max-h-72 divide-y divide-slate-850/50">
                    {globalNotifications.length > 0 ? (
                      globalNotifications.map((notif) => (
                        <div 
                          key={notif.id}
                          className={`p-3 text-left transition-all relative hover:bg-slate-850/40 flex gap-2.5 ${
                            !notif.read ? 'bg-slate-900/50 border-l-2 border-emerald-500' : ''
                          }`}
                        >
                          <div className="shrink-0 mt-0.5">
                            {notif.category === 'RFQ' ? (
                              <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-400"><FileText className="w-3.5 h-3.5" /></div>
                            ) : notif.category === 'Network' ? (
                              <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-400"><Users className="w-3.5 h-3.5" /></div>
                            ) : notif.category === 'Opportunity' ? (
                              <div className="w-6 h-6 rounded-md bg-indigo-500/10 flex items-center justify-center text-indigo-400"><Briefcase className="w-3.5 h-3.5" /></div>
                            ) : (
                              <div className="w-6 h-6 rounded-md bg-purple-500/10 flex items-center justify-center text-purple-400"><Activity className="w-3.5 h-3.5" /></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-slate-500 font-semibold">{notif.category}</span>
                              <span className="text-[9px] text-slate-500">{notif.timestamp}</span>
                            </div>
                            <h5 className="text-[11px] font-semibold text-slate-200 mt-0.5 truncate">{notif.title}</h5>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{notif.description}</p>
                          </div>
                          <button 
                            onClick={(e) => handleToggleNotificationRead(notif.id, e)}
                            className="text-slate-500 hover:text-emerald-400 p-1 shrink-0 self-start"
                            title={notif.read ? "Mark as unread" : "Mark as read"}
                          >
                            <Check className={`w-3.5 h-3.5 ${notif.read ? 'text-slate-600' : 'text-slate-400'}`} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-500">
                        <CheckCircle2 className="w-6 h-6 text-slate-600 mx-auto mb-1.5" />
                        <p className="text-xs">All caught up!</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">No unread alerts in system registry.</p>
                      </div>
                    )}
                  </div>

                  {/* Notification Footer Action */}
                  <div className="p-2 bg-slate-950 text-center">
                    <button 
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        setActiveViewMode('network_dashboard');
                        showToast('Opening Networking Hub activity timeline.', 'info');
                      }}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      Open Activity Logs <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                </div>
              </>
            )}
          </div>

          {/* 3. Saved Items Quick Bookmark trigger */}
          <button
            onClick={() => {
              setActiveViewMode('dashboard');
              onLogTriggered('SAVED_ITEMS_ACCESSED', 'navigation', 'saved_businesses', 'SUCCESS', 'Universal Header: Navigated to dashboard saved items panel.');
              showToast(`Redirecting to saved items. You have ${savedBusinesses.length} saved profiles.`, 'info');
            }}
            className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-200 p-2 rounded-lg transition-all cursor-pointer relative"
            title="Saved Items"
          >
            <Bookmark className="w-4 h-4 text-slate-400" />
            {savedBusinesses.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-slate-800 text-emerald-400 font-sans text-[8px] font-bold flex items-center justify-center border border-slate-750">
                {savedBusinesses.length}
              </span>
            )}
          </button>
            </>
          )}

          {/* 4. Theme Preference Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={() => {
              onToggleTheme?.();
              onLogTriggered(
                'THEME_TOGGLED',
                'system_preferences',
                'theme',
                'SUCCESS',
                `User toggled theme preference to ${!isLightMode ? 'LIGHT' : 'DARK'} mode.`
              );
            }}
            className="bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center"
            title={isLightMode ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {isLightMode ? (
              <Moon className="w-4 h-4 text-amber-400" />
            ) : (
              <Sun className="w-4 h-4 text-yellow-400" />
            )}
          </button>

          {/* 5. Enterprise User Profile Dropdown Menu (Authenticated Only) */}
          {userSession && (
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileMenuOpen(!isProfileMenuOpen);
                  setIsNotificationsOpen(false);
                  setIsQuickCreateOpen(false);
                  onLogTriggered('PROFILE_MENU_TOGGLED', 'navigation', 'user_session', 'SUCCESS', `Enterprise profile menu toggled: ${!isProfileMenuOpen ? 'OPEN' : 'CLOSED'}`);
                }}
                className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 p-1 pr-2.5 rounded-xl transition-all cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg flex items-center justify-center font-bold font-mono text-[10px] shadow-sm bg-gradient-to-tr from-emerald-600 to-teal-500 text-slate-950">
                  {userSession.email.substring(0, 2).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left select-none leading-none">
                  <div className="text-[10px] font-bold text-white truncate max-w-[90px]">
                    {userSession.email.split('@')[0]}
                  </div>
                  <div className="text-[8.5px] font-mono text-emerald-400 uppercase tracking-wide mt-0.5 leading-none">
                    {userSession.role}
                  </div>
                </div>
                <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 py-1 divide-y divide-slate-850 animate-in fade-in slide-in-from-top-2 duration-200">
                    
                    {/* Dropdown Profile Detail */}
                    <div className="px-3.5 py-2.5 text-left bg-slate-950/60">
                      <div className="text-xs font-bold text-white truncate">
                        {userSession.email}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-mono text-slate-400">
                          Role: {userSession.role.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Profile Action Links */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setSelectedBusiness({ id: userSession.orgId, name: userSession.organizationName, category: '', location: '' } as any);
                          onLogTriggered('MY_PROFILE_ACCESSED', 'companies', userSession.orgId, 'SUCCESS', 'Profile Dropdown: Opened own company profile.');
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-850 flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-all"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>My Company Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setActiveViewMode('dashboard');
                          showToast('Returned to Dashboard Control Center.', 'info');
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-850 flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-all"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                        <span>Dashboard Hub</span>
                      </button>
                      <a
                        href="#membership"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-850 flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-all"
                      >
                        <Award className="w-3.5 h-3.5 text-slate-400" />
                        <span>Membership Status</span>
                      </a>
                    </div>

                    {/* Settings & Support */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          showToast('System preference panel opened successfully.', 'success');
                          onLogTriggered('SETTINGS_TAB_ACCESSED', 'preferences', 'global', 'SUCCESS', 'Profile Dropdown: Consulted localized network settings.');
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-850 flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-all"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                        <span>Settings & Preferences</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          showToast('Help Desk ticketing queue initialized in background.', 'info');
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-850 flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-all"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span>Help & Support Center</span>
                      </button>
                    </div>

                    {/* Safety Resets (Logout) */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          showToast('Corporate session logged out. Security logs saved.', 'success');
                          onLogTriggered('ENTERPRISE_USER_LOGGED_OUT', 'session', 'user', 'SUCCESS', 'Profile Dropdown: Safe session reset requested.');
                          onLogout?.();
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-red-950/20 flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-all font-semibold"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-400" />
                        <span>Logout Workspace</span>
                      </button>
                    </div>

                  </div>
                </>
              )}
            </div>
          )}

          {/* Hamburger Menu (Mobile & Tablet - toggle drawer) */}
          <button
            onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
            className="lg:hidden bg-slate-900 hover:bg-slate-850 text-slate-200 p-2 rounded-lg border border-slate-800 cursor-pointer"
            title="Open navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>

        </div>

      </nav>

      {/* Mobile-Only Search Input Bar (Visible only below md screens, for pristine UX) */}
      <div className="p-3 bg-slate-950 border-b border-slate-850 md:hidden block">
        <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
          <Search className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Global search companies, items, opportunities..."
            value={globalSearchTerm}
            onChange={(e) => {
              setGlobalSearchTerm(e.target.value);
              setIsSearchFocused(true);
            }}
            onFocus={() => setIsSearchFocused(true)}
            className="w-full bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-500"
          />
          {globalSearchTerm && (
            <button onClick={() => setGlobalSearchTerm('')} className="text-slate-500 mr-1">
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Mobile Grouped Search Suggestion Dropdown Panel */}
          {isSearchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[60vh] divide-y divide-slate-850 select-none animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              {/* Dropdown Meta Header */}
              <div className="px-3 py-1.5 bg-slate-950 flex items-center justify-between text-[9px] font-mono text-slate-500">
                <span>UNIVERSAL ENGINE MATCHES</span>
                <span>Tap to select</span>
              </div>

              {/* Suggestions Core Body */}
              <div className="overflow-y-auto max-h-[50vh]">
                
                {/* Empty Search Term (Recent, Popular, Trending) */}
                {!globalSearchTerm.trim() && (
                  <div className="p-3 space-y-3">
                    {/* Recent Searches */}
                    {searchHistory.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between text-[9px] font-semibold text-slate-400 tracking-wider uppercase mb-1.5">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-500" /> Recent</span>
                          <button 
                            type="button"
                            onClick={handleClearAllHistory}
                            className="text-emerald-400 hover:text-emerald-300 normal-case font-medium font-sans text-[9px]"
                          >
                            Clear All
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {searchHistory.map((term, index) => (
                            <div 
                              key={`m-hist-${term}-${index}`}
                              onClick={() => {
                                setGlobalSearchTerm(term);
                                onLogTriggered('B2B_SEARCH_HISTORY_CLICKED', 'search_analytics', term, 'SUCCESS', `Universal Search (Mobile): Selected recent term "${term}".`);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950 border border-slate-850 text-[10px] text-slate-300 hover:text-emerald-400 cursor-pointer"
                            >
                              <span>{term}</span>
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClearHistoryItem(term, e);
                                }}
                                className="text-slate-500 hover:text-red-400 ml-1"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Popular Searches */}
                    <div>
                      <h4 className="text-[9px] font-semibold text-slate-400 tracking-wider uppercase mb-1.5 flex items-center gap-1">
                        <Bookmark className="w-3 h-3 text-slate-500" /> Popular Resources
                      </h4>
                      <div className="grid grid-cols-1 gap-1.5">
                        {[
                          { term: 'Fe550D TMT Steel', desc: 'Material supply chain index' },
                          { term: 'Piling rig lease', desc: 'Equipment rentals & machinery' },
                          { term: 'Luxury tower JV', desc: 'Joint venture proposals' },
                          { term: 'Metro piling', desc: 'Heavy infrastructure RFQs' },
                        ].map((item, index) => (
                          <div 
                            key={`m-pop-${index}`}
                            onClick={() => {
                              setGlobalSearchTerm(item.term);
                              onLogTriggered('B2B_SEARCH_POPULAR_CLICKED', 'search_analytics', item.term, 'SUCCESS', `Universal Search (Mobile): Clicked popular shortcut term "${item.term}".`);
                            }}
                            className="p-2 rounded bg-slate-950 border border-slate-850 hover:bg-slate-900/50 cursor-pointer text-left"
                          >
                            <div className="text-[11px] font-semibold text-slate-200">{item.term}</div>
                            <div className="text-[9px] text-slate-500 mt-0.5">{item.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Trending Search Terms */}
                    <div>
                      <h4 className="text-[9px] font-semibold text-slate-400 tracking-wider uppercase mb-1.5 flex items-center gap-1">
                        <Activity className="w-3 h-3 text-emerald-500" /> Trending Topics
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {['AAC Blocks', 'Metro substructures', 'Solar townships', 'Apex Developers', 'Vanguard Builders'].map((term, index) => (
                          <button 
                            type="button"
                            key={`m-trend-${index}`}
                            onClick={() => {
                              setGlobalSearchTerm(term);
                              onLogTriggered('B2B_SEARCH_TRENDING_CLICKED', 'search_analytics', term, 'SUCCESS', `Universal Search (Mobile): Traced trending hashtag "${term}".`);
                            }}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 font-medium text-left"
                          >
                            🔥 {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Non-Empty Search Term (Grouped Results) */}
                {globalSearchTerm.trim() && (
                  <div className="divide-y divide-slate-850">
                    
                    {/* Companies Section */}
                    {universalSearchResults.companies.length > 0 && (
                      <div className="p-2">
                        <div className="px-2 py-0.5 text-[9px] font-semibold font-mono text-slate-500 tracking-wider uppercase flex items-center gap-1">
                          <Building className="w-3 h-3" /> Companies
                        </div>
                        <div className="space-y-1 mt-1">
                          {universalSearchResults.companies.slice(0, 3).map((item) => (
                            <div 
                              key={`m-res-${item.id}`}
                              onClick={() => handleSelectSearchResult(item)}
                              className="px-2 py-1.5 rounded-lg hover:bg-slate-850 cursor-pointer flex flex-col text-left transition-all"
                            >
                              <div className="text-[11px] font-semibold text-white truncate flex items-center gap-1">
                                {item.title}
                                <span className="text-[8px] px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-400">{item.category}</span>
                              </div>
                              <div className="text-[9px] text-slate-400 truncate mt-0.5">{item.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Products & Services Section */}
                    {universalSearchResults.products.length > 0 && (
                      <div className="p-2">
                        <div className="px-2 py-0.5 text-[9px] font-semibold font-mono text-slate-500 tracking-wider uppercase flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3" /> Products
                        </div>
                        <div className="space-y-1 mt-1">
                          {universalSearchResults.products.slice(0, 3).map((item) => (
                            <div 
                              key={`m-res-${item.id}`}
                              onClick={() => handleSelectSearchResult(item)}
                              className="px-2 py-1.5 rounded-lg hover:bg-slate-850 cursor-pointer flex flex-col text-left transition-all"
                            >
                              <div className="text-[11px] font-semibold text-white truncate flex items-center gap-1">
                                {item.title}
                                <span className="text-[8px] px-1 py-0.5 rounded bg-indigo-500/10 text-indigo-400">{item.category}</span>
                              </div>
                              <div className="text-[9px] text-slate-400 truncate mt-0.5">{item.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* RFQs Section */}
                    {universalSearchResults.rfqs.length > 0 && (
                      <div className="p-2">
                        <div className="px-2 py-0.5 text-[9px] font-semibold font-mono text-slate-500 tracking-wider uppercase flex items-center gap-1">
                          <FileText className="w-3 h-3" /> RFQs
                        </div>
                        <div className="space-y-1 mt-1">
                          {universalSearchResults.rfqs.slice(0, 3).map((item) => (
                            <div 
                              key={`m-res-${item.id}`}
                              onClick={() => handleSelectSearchResult(item)}
                              className="px-2 py-1.5 rounded-lg hover:bg-slate-850 cursor-pointer flex flex-col text-left transition-all"
                            >
                              <div className="text-[11px] font-semibold text-white truncate">{item.title}</div>
                              <div className="text-[9px] text-slate-400 truncate mt-0.5">{item.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Opportunities Section */}
                    {universalSearchResults.opportunities.length > 0 && (
                      <div className="p-2">
                        <div className="px-2 py-0.5 text-[9px] font-semibold font-mono text-slate-500 tracking-wider uppercase flex items-center gap-1">
                          <Briefcase className="w-3 h-3" /> Opportunities & JVs
                        </div>
                        <div className="space-y-1 mt-1">
                          {universalSearchResults.opportunities.slice(0, 3).map((item) => (
                            <div 
                              key={`m-res-${item.id}`}
                              onClick={() => handleSelectSearchResult(item)}
                              className="px-2 py-1.5 rounded-lg hover:bg-slate-850 cursor-pointer flex flex-col text-left transition-all"
                            >
                              <div className="text-[11px] font-semibold text-white truncate flex items-center gap-1">
                                {item.title}
                                <span className="text-[8px] px-1 py-0.5 rounded bg-teal-500/10 text-teal-400">{item.category}</span>
                              </div>
                              <div className="text-[9px] text-slate-400 truncate mt-0.5">{item.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Business Feed Updates */}
                    {universalSearchResults.feed.length > 0 && (
                      <div className="p-2">
                        <div className="px-2 py-0.5 text-[9px] font-semibold font-mono text-slate-500 tracking-wider uppercase flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> Business Feed Updates
                        </div>
                        <div className="space-y-1 mt-1">
                          {universalSearchResults.feed.slice(0, 3).map((item) => (
                            <div 
                              key={`m-res-${item.id}`}
                              onClick={() => handleSelectSearchResult(item)}
                              className="px-2 py-1.5 rounded-lg hover:bg-slate-850 cursor-pointer flex flex-col text-left transition-all"
                            >
                              <div className="text-[11px] font-semibold text-white truncate">{item.title}</div>
                              <div className="text-[9px] text-slate-400 truncate mt-0.5">{item.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {universalSearchResults.companies.length === 0 && 
                     universalSearchResults.products.length === 0 && 
                     universalSearchResults.rfqs.length === 0 && 
                     universalSearchResults.opportunities.length === 0 && 
                     universalSearchResults.feed.length === 0 && (
                      <div className="p-6 text-center text-slate-500">
                        <AlertTriangle className="w-6 h-6 text-amber-500/80 mx-auto mb-1.5" />
                        <p className="text-[11px] font-semibold text-slate-300">No matches found for "{globalSearchTerm}"</p>
                        <button 
                          type="button"
                          onClick={() => setGlobalSearchTerm('')}
                          className="mt-2 text-[9px] bg-slate-800 hover:bg-slate-750 text-slate-300 px-2 py-1 rounded font-semibold transition-all"
                        >
                          Clear Search
                        </button>
                      </div>
                    )}

                  </div>
                )}
                
              </div>

            </div>
          )}
        </div>
      </div>

      {/* 1. Guest Marketplace Home (Full-screen high-conversion entry point) */}
      {activeViewMode === 'home' && (
        <MarketplaceHome
          userSession={userSession}
          demoMode={!!authMeta?.demoMode}
          onLogTriggered={onLogTriggered}
          showToast={showToast}
          onTriggerLogin={() => {
            setAuthModalTab('signin');
            setIsAuthModalOpen(true);
          }}
          onTriggerOnboarding={openSignUp}
          onSelectBusiness={(comp) => setSelectedBusiness(comp)}
          setActiveViewMode={setActiveViewMode}
          onSearchGlobal={(term, cat, loc) => {
            setSearchTerm(term);
            setGlobalSearchTerm(term);
            setSelectedCategory(cat);
            setSelectedLocation(loc);
            setActiveViewMode('directory');
          }}
        />
      )}


      {/* Phase 2: Live Business Discovery Directory Results Grid & B2B Networking Engine */}
      {activeViewMode !== 'home' && (
        <section className="px-4 md:px-6 py-6 bg-slate-950 border-b border-slate-850">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-end lg:hidden">
            {/* Mobile Sidebar Toggle Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(true)}
                className="bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Menu className="w-4 h-4 text-emerald-400" />
                <span>B2B Operations Menu</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-start relative">
            {/* Desktop / Tablet Sidebar */}
            <aside 
              className={`hidden lg:flex flex-col bg-slate-900/30 border border-slate-850 rounded-2xl transition-all duration-300 shrink-0 sticky top-24 ${
                isSidebarCollapsed ? 'w-16' : 'w-64'
              }`}
            >
              {/* Sidebar Header with Collapse Button */}
              <div className="flex items-center justify-between p-4 border-b border-slate-850">
                {!isSidebarCollapsed && (
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    B2B Operations
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleToggleSidebar}
                  className={`p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer ${isSidebarCollapsed ? 'mx-auto' : 'ml-auto'}`}
                  title={isSidebarCollapsed ? "Expand Navigation" : "Collapse Navigation"}
                >
                  {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Sidebar Groups */}
              {/* Sidebar Search & Quick Jump (Part 4: Smart Navigation) */}
              {!isSidebarCollapsed && (
                <div className="p-3 border-b border-slate-850 space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search modules..."
                      value={sidebarSearch}
                      onChange={(e) => setSidebarSearch(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-850 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 outline-none placeholder:text-slate-650 focus:border-emerald-500/50 transition-all"
                    />
                  </div>

                </div>
              )}

              {/* Sidebar Scroll Container */}
              <div className="p-2 space-y-4 overflow-y-auto max-h-[calc(100vh-220px)] scrollbar-thin">
                
                {/* 1. Pinned Modules (if any) */}
                {!isSidebarCollapsed && pinnedModules.length > 0 && !sidebarSearch && (
                  <div className="space-y-1">
                    <h5 className="px-3.5 text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase flex items-center justify-between">
                      <span>Pinned</span>
                      <Pin className="w-2.5 h-2.5 text-slate-600" />
                    </h5>
                    <div className="space-y-0.5">
                      {visibleNavigationGroups.flatMap(g => g.items)
                        .filter(item => pinnedModules.includes(item.id))
                        .map(item => {
                          const Icon = item.icon;
                          const active = activeViewMode === item.id;
                          return (
                            <div key={`pin-${item.id}`} className="group/item relative flex items-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveViewMode(item.id);
                                  trackModuleClick(item.id);
                                }}
                                className={`w-full flex items-center gap-3 py-2 px-3.5 transition-all duration-150 rounded-xl cursor-pointer text-left ${
                                  active 
                                    ? 'bg-emerald-500/10 text-emerald-400 font-semibold' 
                                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                                }`}
                              >
                                <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-emerald-400' : 'text-slate-500 group-hover/item:text-slate-300'}`} />
                                <span className="text-xs truncate flex-1">{item.label}</span>
                              </button>
                              
                              {/* Pin Action toggle visible on hover */}
                              <div className="absolute right-2 opacity-0 group-hover/item:opacity-100 flex items-center gap-1 bg-slate-900/90 py-0.5 px-1 rounded-md border border-slate-800 transition-opacity">
                                <button
                                  type="button"
                                  onClick={(e) => togglePinModule(item.id, e)}
                                  className="p-1 hover:text-emerald-400 text-slate-500 transition-colors"
                                  title="Unpin module"
                                >
                                  <Pin className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* 2. Favorite Modules (if any) */}
                {!isSidebarCollapsed && favoriteModules.length > 0 && !sidebarSearch && (
                  <div className="space-y-1">
                    <h5 className="px-3.5 text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase flex items-center justify-between">
                      <span>Favorites</span>
                      <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                    </h5>
                    <div className="space-y-0.5">
                      {visibleNavigationGroups.flatMap(g => g.items)
                        .filter(item => favoriteModules.includes(item.id))
                        .map(item => {
                          const Icon = item.icon;
                          const active = activeViewMode === item.id;
                          return (
                            <div key={`fav-${item.id}`} className="group/item relative flex items-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveViewMode(item.id);
                                  trackModuleClick(item.id);
                                }}
                                className={`w-full flex items-center gap-3 py-2 px-3.5 transition-all duration-150 rounded-xl cursor-pointer text-left ${
                                  active 
                                    ? 'bg-amber-500/10 text-amber-400 font-semibold' 
                                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                                }`}
                              >
                                <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-amber-400' : 'text-slate-500 group-hover/item:text-slate-300'}`} />
                                <span className="text-xs truncate flex-1">{item.label}</span>
                              </button>
                              
                              <div className="absolute right-2 opacity-0 group-hover/item:opacity-100 flex items-center gap-1 bg-slate-900/90 py-0.5 px-1 rounded-md border border-slate-800 transition-opacity">
                                <button
                                  type="button"
                                  onClick={(e) => toggleFavoriteModule(item.id, e)}
                                  className="p-1 hover:text-amber-400 text-slate-500 transition-colors"
                                  title="Remove from favorites"
                                >
                                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* 4. Core Navigation Groups */}
                <div className="space-y-4 pt-2 border-t border-slate-850/40">
                  {visibleNavigationGroups.map((group, gIdx) => {
                    // Filter items if search is active
                    const filteredItems = group.items.filter(item => 
                      item.label.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
                      item.id.toLowerCase().includes(sidebarSearch.toLowerCase())
                    );

                    if (filteredItems.length === 0) return null;

                    return (
                      <div key={gIdx} className="space-y-1">
                        {!isSidebarCollapsed && (
                          <h5 className="px-3.5 text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase mt-2">
                            {group.groupName}
                          </h5>
                        )}
                        <div className="space-y-0.5">
                          {filteredItems.map(item => {
                            const Icon = item.icon;
                            const active = activeViewMode === item.id;
                            const isPinned = pinnedModules.includes(item.id);
                            const isFavorite = favoriteModules.includes(item.id);
                            
                            return (
                              <div key={item.id} className="group/item relative flex items-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveViewMode(item.id);
                                    trackModuleClick(item.id);
                                  }}
                                  className={`w-full relative flex items-center gap-3 py-2.5 transition-all duration-200 rounded-xl cursor-pointer ${
                                    isSidebarCollapsed ? 'px-3 justify-center' : 'px-3.5'
                                  } ${
                                    active 
                                      ? 'bg-emerald-500/10 text-emerald-400 font-semibold' 
                                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                                  }`}
                                >
                                  {/* Smooth Active Left Indicator */}
                                  {active && (
                                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-500 rounded-r transition-all" />
                                  )}

                                  {/* Icon with perfect alignment */}
                                  <div className="relative flex items-center justify-center">
                                    <Icon className={`w-4 h-4 flex-shrink-0 transition-transform ${active ? 'scale-110 text-emerald-400' : 'text-slate-400 group-hover/item:text-slate-200'}`} />
                                    {/* Small badge dot when collapsed */}
                                    {isSidebarCollapsed && item.badge && (
                                      <span className={`absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full ${
                                        item.badge.variant === 'count' ? 'bg-red-500' :
                                        item.badge.variant === 'new' ? 'bg-emerald-400' : 'bg-amber-400'
                                      }`} />
                                    )}
                                  </div>

                                  {/* Label */}
                                  {!isSidebarCollapsed && (
                                    <span className="text-xs tracking-tight truncate flex-1 text-left font-sans font-medium">
                                      {item.label}
                                    </span>
                                  )}

                                  {/* Premium Minimal Badge */}
                                  {!isSidebarCollapsed && item.badge && (
                                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-mono font-bold shrink-0 ${
                                      item.badge.variant === 'new' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                                      item.badge.variant === 'beta' ? 'bg-teal-500/15 text-teal-300 border border-teal-500/20' :
                                      item.badge.variant === 'soon' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
                                      'bg-red-500/15 text-red-400'
                                    }`}>
                                      {item.badge.text}
                                    </span>
                                  )}

                                  {/* Custom CSS Hover Tooltip when collapsed */}
                                  {isSidebarCollapsed && (
                                    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-slate-100 text-[11px] rounded-lg border border-slate-800 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none z-50 shadow-xl flex items-center gap-1.5">
                                      <span className="font-semibold">{item.label}</span>
                                      {item.badge && (
                                        <span className="text-[7px] bg-slate-950 px-1 py-0.5 rounded text-emerald-400 font-mono border border-slate-800">
                                          {item.badge.text}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </button>

                                {/* Inline actions on hover */}
                                {!isSidebarCollapsed && (
                                  <div className="absolute right-2.5 opacity-0 group-hover/item:opacity-100 flex items-center gap-1 bg-slate-900/90 py-0.5 px-1.5 rounded-md border border-slate-800 transition-opacity">
                                    <button
                                      type="button"
                                      onClick={(e) => togglePinModule(item.id, e)}
                                      className={`p-1 transition-colors ${isPinned ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                                      title={isPinned ? "Unpin module" : "Pin module to top"}
                                    >
                                      <Pin className={`w-2.5 h-2.5 ${isPinned ? 'fill-emerald-400' : ''}`} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => toggleFavoriteModule(item.id, e)}
                                      className={`p-1 transition-colors ${isFavorite ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                                      title={isFavorite ? "Remove from favorites" : "Mark as favorite"}
                                    >
                                      <Star className={`w-2.5 h-2.5 ${isFavorite ? 'fill-amber-400' : ''}`} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </aside>

            {/* Mobile Drawer Overlay Portal */}
            {isMobileDrawerOpen && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 lg:hidden flex justify-start">
                <div className="w-72 max-w-[85vw] h-full bg-slate-950 border-r border-slate-850 p-4 flex flex-col gap-4 overflow-y-auto">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-850">
                    <span className="font-display font-extrabold text-sm text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      RealtyConnect™ Menu
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 space-y-6">
                    {!userSession ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h5 className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase px-2">
                            Marketplace Navigation
                          </h5>
                          <div className="space-y-1">
                            {[
                              { id: 'home', label: 'Home', icon: Building2 },
                              { id: 'directory', label: 'Businesses', icon: Search, action: () => openAllBusinesses() },
                              { id: 'marketplace-prods', label: 'Products', icon: ShoppingBag, action: () => openMarketplace('products') },
                              { id: 'services', label: 'Services', icon: Briefcase, action: () => {
                                setSearchTerm('Consultants');
                                setGlobalSearchTerm('Consultants');
                                setSelectedCategory('Consultants');
                                setActiveViewMode('directory');
                              } },
                              { id: 'marketplace', label: 'Marketplace', icon: Layers, action: () => openMarketplace('all') },
                              { id: 'rfq_management', label: 'RFQs', icon: FileText },
                              { id: 'membership', label: 'Membership', icon: Award, action: () => {
                                setActiveViewMode('home');
                                setTimeout(() => {
                                  document.getElementById('membership-plans-section')?.scrollIntoView({ behavior: 'smooth' });
                                }, 120);
                              } },
                              { id: 'about', label: 'About', icon: BookOpen, action: () => {
                                setActiveViewMode('home');
                                setTimeout(() => {
                                  document.getElementById('about-realtyconnect-section')?.scrollIntoView({ behavior: 'smooth' });
                                }, 120);
                              } },
                              { id: 'contact', label: 'Contact', icon: Mail, action: () => {
                                setActiveViewMode('home');
                                setTimeout(() => {
                                  document.getElementById('contact-us-section')?.scrollIntoView({ behavior: 'smooth' });
                                }, 120);
                              } },
                            ].map(item => {
                              const Icon = item.icon;
                              const active = item.id === 'marketplace-prods'
                                ? activeViewMode === 'marketplace' && marketplaceScope === 'products'
                                : item.id === 'marketplace'
                                ? activeViewMode === 'marketplace' && marketplaceScope === 'all'
                                : activeViewMode === item.id;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => {
                                    if (item.action) {
                                      item.action();
                                    } else {
                                      setActiveViewMode(item.id as any);
                                    }
                                    setIsMobileDrawerOpen(false);
                                  }}
                                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                                    active
                                      ? 'bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20'
                                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                                  }`}
                                >
                                  <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
                                  <span className="text-xs truncate flex-1 text-left">{item.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-850 space-y-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsMobileDrawerOpen(false);
                              setAuthModalTab('signin');
                              setIsAuthModalOpen(true);
                            }}
                            className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-200 font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>Sign In</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsMobileDrawerOpen(false);
                              openSignUp();
                            }}
                            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-500/10"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Join Free</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      visibleNavigationGroups.map((group, gIdx) => (
                        <div key={gIdx} className="space-y-2">
                          <h5 className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase px-2">
                            {group.groupName}
                          </h5>
                          <div className="space-y-1">
                            {group.items.map(item => {
                              const Icon = item.icon;
                              const active = activeViewMode === item.id;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => {
                                    setActiveViewMode(item.id);
                                    setIsMobileDrawerOpen(false);
                                    onLogTriggered(
                                      `B2B_${item.id.toUpperCase()}_OPENED`,
                                      item.id,
                                      'central',
                                      'SUCCESS',
                                      `Mobile Navigation: Navigated to ${item.label}.`
                                    );
                                  }}
                                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                                    active
                                      ? 'bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20'
                                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                                  }`}
                                >
                                  <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
                                  <span className="text-xs truncate flex-1 text-left">{item.label}</span>
                                  {item.badge && (
                                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-mono font-bold shrink-0 ${
                                      item.badge.variant === 'new' ? 'bg-emerald-500/15 text-emerald-400' :
                                      item.badge.variant === 'beta' ? 'bg-teal-500/15 text-teal-300' :
                                      'bg-red-500/15 text-red-400'
                                    }`}>
                                      {item.badge.text}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                {/* Close drawer on clicking outside backdrop */}
                <div className="flex-1" onClick={() => setIsMobileDrawerOpen(false)} />
              </div>
            )}

            {/* Active View Module Content Container */}
            <div className="flex-1 w-full min-w-0 bg-slate-950">
              <React.Suspense fallback={
                <div className="flex flex-col items-center justify-center py-20 px-4 min-h-[400px]">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-500/10" />
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                  </div>
                  <p className="text-slate-400 font-mono text-[10px] uppercase tracking-wider mt-4 animate-pulse">
                    Loading Enterprise Module...
                  </p>
                </div>
              }>
                {activeViewMode === 'dashboard' ? (
            <BusinessDashboard
              userSession={userSession}
              connections={connections}
              enquiries={enquiries}
              meetings={meetings}
              rfqs={rfqs}
              savedBusinesses={savedBusinesses}
              favoriteCompanies={favoriteCompanies}
              following={following}
              onToggleSave={handleToggleSave}
              onToggleFavorite={handleToggleFavorite}
              onLogTriggered={onLogTriggered}
              showToast={showToast}
              onViewBusinessProfile={(id) => {
                if (openRegisteredCompany(id)) return;
                const target = DISCOVERY_REGISTRY.find(b => b.id === id);
                if (target) {
                  setSelectedBusiness(target);
                  onLogTriggered('B2B_PROFILE_MODAL_VIEWED', 'companies', id, 'SUCCESS', `Navigated via Business Dashboard: opened portfolio sheet for ${target.name}.`);
                }
              }}
              setActiveViewMode={setActiveViewMode}
              onTriggerCreateOpportunity={() => {
                setActiveViewMode('opportunities');
                setOppPrefillOpen(true);
              }}
              setMeetings={setMeetings}
              setEnquiries={setEnquiries}
              setRfqs={setRfqs}
            />
          ) : activeViewMode === 'network_dashboard' ? (
            <BusinessNetworkingDashboard
              connections={connections}
              following={following}
              followers={followers}
              savedBusinesses={savedBusinesses}
              favoriteCompanies={favoriteCompanies}
              enquiries={enquiries}
              meetings={meetings}
              partnerships={partnerships}
              contactExchanges={contactExchanges}
              companyVisits={companyVisits}
              rfqs={rfqs}
              invitations={invitations}
              blockedReported={blockedReported}
              timeline={timeline}
              onAcceptConnection={handleAcceptConnection}
              onRejectConnection={handleRejectConnection}
              onWithdrawConnection={handleWithdrawConnection}
              onSendConnection={handleSendConnection}
              onToggleFollow={handleToggleFollow}
              onToggleSave={handleToggleSave}
              onToggleFavorite={handleToggleFavorite}
              onSendEnquiry={handleSendEnquiry}
              onScheduleMeeting={handleScheduleMeeting}
              onSendPartnership={handleSendPartnership}
              onSendContactExchange={handleSendContactExchange}
              onSendCompanyVisit={handleSendCompanyVisit}
              onPublishRfq={handlePublishRfq}
              onSendInvitation={handleSendInvitation}
              onBlockCompany={handleBlockCompany}
              onReportCompany={handleReportCompany}
              onUnblockCompany={handleUnblockCompany}
              onLogTimeline={handleLogTimeline}
              onViewBusinessProfile={(id) => {
                if (openRegisteredCompany(id)) return;
                const target = DISCOVERY_REGISTRY.find(b => b.id === id);
                if (target) {
                  setSelectedBusiness(target);
                  onLogTriggered('B2B_PROFILE_MODAL_VIEWED', 'companies', id, 'SUCCESS', `Navigated via Networking Dashboard: opened portfolio sheet for ${target.name}.`);
                }
              }}
              onLogTriggered={onLogTriggered}
              showToast={showToast}
              allBusinesses={companyRegistry}
            />
          ) : activeViewMode === 'feed' ? (
            <BusinessFeed
              onLogTriggered={onLogTriggered}
              showToast={showToast}
              savedBusinesses={savedBusinesses}
              favoriteCompanies={favoriteCompanies}
              following={following}
              onToggleSave={handleToggleSave}
              onToggleFavorite={handleToggleFavorite}
              connectionsSent={connectionsSent}
              onConnectRequest={handleConnectRequest}
              posts={feedPosts}
              setPosts={setFeedPosts}
              onViewBusinessProfile={(id) => {
                if (openRegisteredCompany(id)) return;
                const target = DISCOVERY_REGISTRY.find(b => b.id === id);
                if (target) {
                  setSelectedBusiness(target);
                  onLogTriggered('B2B_PROFILE_MODAL_VIEWED', 'companies', id, 'SUCCESS', `Navigated via Business Feed: opened portfolio sheet for ${target.name}.`);
                }
              }}
            />
          ) : activeViewMode === 'opportunities' ? (
            <BusinessOpportunitiesEngine
              userSession={userSession}
              onLogTriggered={onLogTriggered}
              showToast={showToast}
              posts={feedPosts}
              setPosts={setFeedPosts}
              initialCreateOpen={oppPrefillOpen}
              onCloseCreatePrefill={() => setOppPrefillOpen(false)}
              onConvertToRfq={(opp) => {
                setPrefilledRfqOpp(opp);
                setRfqPrefillOpen(true);
                setActiveViewMode('rfq_management');
              }}
            />
          ) : activeViewMode === 'rfq_management' ? (
            <BusinessRfqEngine
              userSession={userSession}
              onLogTriggered={onLogTriggered}
              showToast={showToast}
              posts={feedPosts}
              setPosts={setFeedPosts}
              initialCreateOpen={rfqPrefillOpen}
              onCloseCreatePrefill={() => {
                setRfqPrefillOpen(false);
                setPrefilledRfqOpp(null);
              }}
              prefilledOpp={prefilledRfqOpp}
              setActiveViewMode={setActiveViewMode}
            />
          ) : activeViewMode === 'marketplace' ? (
            <BusinessMarketplace
              key={marketplaceScope}
              productsOnly={marketplaceScope === 'products'}
              userSession={userSession}
              onLogTriggered={onLogTriggered}
              showToast={showToast}
              posts={feedPosts}
              setPosts={setFeedPosts}
              setActiveViewMode={setActiveViewMode}
            />
          ) : activeViewMode === 'messaging' ? (
            <BusinessMessagingEngine
              userSession={userSession}
              onLogTriggered={onLogTriggered}
              showToast={showToast}
              setActiveViewMode={setActiveViewMode}
            />
          ) : activeViewMode === 'lead_management' ? (
            <BusinessLeadManagement
              userSession={userSession}
              onLogTriggered={onLogTriggered}
              showToast={showToast}
              setActiveViewMode={setActiveViewMode}
            />
          ) : activeViewMode === 'meetings' ? (
            <React.Suspense fallback={<div className="p-8 text-slate-500 font-mono text-xs text-center">Configuring Enterprise Scheduler...</div>}>
              <BusinessMeetingsCalendar
                userSession={userSession}
                onLogTriggered={onLogTriggered}
                showToast={showToast}
                setActiveViewMode={setActiveViewMode}
                initialCreateWithPreFill={prefilledMeeting}
                onClearPreFill={() => setPrefilledMeeting(null)}
              />
            </React.Suspense>
          ) : activeViewMode === 'projects' ? (
            <React.Suspense fallback={<div className="p-8 text-slate-500 font-mono text-xs text-center">Launching B2B Project Portfolio...</div>}>
              <BusinessProjectEngine
                userSession={userSession}
                onLogTriggered={onLogTriggered}
                showToast={showToast}
                setActiveViewMode={setActiveViewMode}
              />
            </React.Suspense>
          ) : activeViewMode === 'procurement' ? (
            <React.Suspense fallback={<div className="p-8 text-slate-500 font-mono text-xs text-center">Launching Procurement Sourcing Engine...</div>}>
              <BusinessProcurementEngine
                userSession={userSession}
                onLogTriggered={onLogTriggered}
                showToast={showToast}
                setActiveViewMode={setActiveViewMode}
              />
            </React.Suspense>
          ) : activeViewMode === 'inventory' ? (
            <React.Suspense fallback={<div className="p-8 text-slate-500 font-mono text-xs text-center">Launching Inventory & Warehouse Engine...</div>}>
              <BusinessInventoryEngine
                userSession={userSession}
                onLogTriggered={onLogTriggered}
                showToast={showToast}
                setActiveViewMode={setActiveViewMode}
              />
            </React.Suspense>
          ) : activeViewMode === 'finance' ? (
            <React.Suspense fallback={<div className="p-8 text-slate-500 font-mono text-xs text-center">Launching Finance & Billing Management Engine...</div>}>
              <BusinessFinanceEngine
                userSession={userSession}
                onLogTriggered={onLogTriggered}
                showToast={showToast}
                setActiveViewMode={setActiveViewMode}
              />
            </React.Suspense>
          ) : activeViewMode === 'hr_dms' ? (
            <React.Suspense fallback={<div className="p-8 text-slate-500 font-mono text-xs text-center">Launching HR & Document Registry (DMS)...</div>}>
              <BusinessHrDmsEngine
                userSession={userSession}
                onLogTriggered={onLogTriggered}
                showToast={showToast}
                setActiveViewMode={setActiveViewMode}
              />
            </React.Suspense>
          ) : activeViewMode === 'crm' ? (
            <React.Suspense fallback={<div className="p-8 text-slate-500 font-mono text-xs text-center">Launching B2B Relationship CRM...</div>}>
              <BusinessCrmEngine
                userSession={userSession}
                onLogTriggered={onLogTriggered}
                showToast={showToast}
                setActiveViewMode={setActiveViewMode}
              />
            </React.Suspense>
          ) : activeViewMode === 'assets_maintenance' ? (
            <React.Suspense fallback={<div className="p-8 text-slate-500 font-mono text-xs text-center">Launching Asset & Maintenance Management Engine...</div>}>
              <BusinessAssetMaintenanceEngine
                userSession={userSession}
                onLogTriggered={onLogTriggered}
                showToast={showToast}
                setActiveViewMode={setActiveViewMode}
              />
            </React.Suspense>
          ) : activeViewMode === 'analytics_subscription' ? (
            <React.Suspense fallback={<div className="p-8 text-slate-500 font-mono text-xs text-center">Launching Analytics, BI & Membership Control Hub...</div>}>
              <BusinessAnalyticsSubscriptionEngine
                userSession={userSession}
                onLogTriggered={onLogTriggered}
                showToast={showToast}
                onNotificationTriggered={(type, recipient, content) => {
                  onLogTriggered('NOTIFICATION_SENT', 'notifications', type, 'SUCCESS', `Dispatched ${type} notification to ${recipient}: ${content}`);
                }}
                setActiveViewMode={setActiveViewMode}
              />
            </React.Suspense>
          ) : activeViewMode === 'security_compliance' ? (
            <React.Suspense fallback={<div className="p-8 text-slate-500 font-mono text-xs text-center">Launching Centralized Enterprise Security & Access Governance Hub...</div>}>
              <BusinessSecurityEngine
                userSession={userSession}
                onLogTriggered={onLogTriggered}
                showToast={showToast}
                onNotificationTriggered={(type, recipient, content) => {
                  onLogTriggered('NOTIFICATION_SENT', 'notifications', type, 'SUCCESS', `Dispatched ${type} notification to ${recipient}: ${content}`);
                }}
                setActiveViewMode={setActiveViewMode}
              />
            </React.Suspense>
          ) : (
            <BusinessDirectory
              onLogTriggered={onLogTriggered}
              showToast={showToast}
              connectionsSent={connectionsSent}
              savedBusinesses={savedBusinesses}
              favoriteCompanies={favoriteCompanies}
              registeredCompanies={registeredCompanies}
              showSampleCompanies={!!authMeta?.demoMode}
              onToggleSave={handleToggleSave}
              onToggleFavorite={handleToggleFavorite}
              onConnectRequest={handleConnectRequest}
              onViewBusinessProfile={(id) => {
                if (openRegisteredCompany(id)) return;
                const target = DISCOVERY_REGISTRY.find(b => b.id === id);
                if (target) {
                  setSelectedBusiness(target);
                } else {
                  // Fallback registry matching for new enterprise seeds
                  const nameMap: { [key: string]: string } = {
                    'ent-1': 'Apex Developers Ltd',
                    'ent-2': 'BuildCorp Construction',
                    'ent-3': 'Elite Materials Group',
                    'ent-4': 'RealtyConnect Pro Consultants',
                    'ent-5': 'National Trust Bank',
                    'ent-6': 'Finance Express DSA',
                    'ent-7': 'Global Tech Equipment Ltd',
                    'ent-8': 'Green Brick Logistics',
                    'ent-9': 'Aura Interior Studio',
                    'ent-10': 'Nexus Structural Consultants',
                    'ent-11': 'Matrix MEP Engineers',
                    'ent-12': 'TaxShield & Associates',
                    'ent-13': 'Vanguard Realty Advisors',
                    'ent-14': 'Goldman NBFC Corp',
                    'ent-15': 'Hindustan Cement Corp',
                    'ent-16': 'Titan Steel Distributors',
                    'ent-17': 'Sovereign Insurance Co',
                    'ent-18': 'Alpha Facility Care',
                    'ent-19': 'Prime Property Managers',
                    'ent-20': 'Apex Recruiters',
                    'ent-21': 'AdVantage Real Estate Marketing',
                    'ent-22': 'PropTech Systems',
                    'ent-23': 'Maharashtra Industrial Dev Authority',
                    'ent-24': 'Supreme Concrete Products',
                    'ent-25': 'Zenith Safety Audits'
                  };
                  const catMap: { [key: string]: string } = {
                    'ent-1': 'Developers',
                    'ent-23': 'Developers',
                    'ent-2': 'Contractors',
                    'ent-3': 'Material Vendors',
                    'ent-15': 'Material Vendors',
                    'ent-16': 'Material Vendors',
                    'ent-24': 'Material Vendors',
                    'ent-5': 'Banks',
                    'ent-14': 'Banks',
                    'ent-17': 'Banks',
                    'ent-6': 'DSA',
                    'ent-7': 'Equipment',
                    'ent-8': 'Transport'
                  };
                  const locMap: { [key: string]: string } = {
                    'ent-2': 'Bangalore, KA',
                    'ent-10': 'Bangalore, KA',
                    'ent-18': 'Bangalore, KA',
                    'ent-22': 'Bangalore, KA',
                    'ent-3': 'Delhi NCR, DL',
                    'ent-12': 'Delhi NCR, DL',
                    'ent-21': 'Delhi NCR, DL',
                    'ent-4': 'Hyderabad, TS',
                    'ent-11': 'Hyderabad, TS',
                    'ent-20': 'Hyderabad, TS',
                    'ent-6': 'Chennai, TN',
                    'ent-14': 'Chennai, TN',
                    'ent-24': 'Chennai, TN',
                    'ent-13': 'Pune, MH',
                    'ent-19': 'Pune, MH',
                    'ent-16': 'Ahmedabad, GJ'
                  };
                  setSelectedBusiness({
                    id,
                    name: nameMap[id] || 'Zenith Safety Audits',
                    category: catMap[id] || 'Consultants',
                    location: locMap[id] || 'Mumbai, MH'
                  } as any);
                }
                onLogTriggered('B2B_PROFILE_MODAL_VIEWED', 'companies', id, 'SUCCESS', `Navigated via B2B Directory: opened portfolio sheet.`);
              }}
              outerSearchTerm={searchTerm}
              outerCategory={selectedCategory}
              outerLocation={selectedLocation}
            />
          )}
              </React.Suspense>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Business Details Portfolio Modal Popup -> Re-engineered as Sprint 05 Business Profile Engine */}
      {selectedBusiness && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 lg:p-8 z-50 overflow-y-auto">
          <div className="w-full max-w-6xl my-auto">
            <BusinessProfileEngine
              businessId={selectedBusiness.id}
              businessName={selectedBusiness.name}
              businessCategory={selectedBusiness.category}
              businessLocation={selectedBusiness.location}
              onClose={() => setSelectedBusiness(null)}
              onLogTriggered={onLogTriggered}
              showToast={showToast}
              userRole={userSession?.role}
              currentOrgId={userSession?.orgId}
              userOrgRole={userSession?.orgRole}
              onProfileSaved={() => {
                reloadCompanies();
                onSessionStale?.();
              }}
              connections={connections}
              following={following}
              onToggleFollow={handleToggleFollow}
              onSendConnection={handleSendConnection}
              onWithdrawConnection={handleWithdrawConnection}
              onSendEnquiry={handleSendEnquiry}
              onScheduleMeeting={handleScheduleMeeting}
              onSendPartnership={handleSendPartnership}
            />
          </div>
        </div>
      )}

      {/* B2B Authentication & Corporate Access Modal Portal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 z-50 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
            
            {/* Visual Branding Left Column */}
            <div className="bg-gradient-to-br from-slate-950 to-slate-900 border-r border-slate-850 p-6 md:p-8 flex flex-col justify-between w-full md:w-80 shrink-0 text-left">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/10">
                    <Building2 className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white font-display text-md tracking-tight">RealtyConnect™</h3>
                    <p className="text-[10px] font-mono text-slate-500 leading-none">Account access</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-extrabold text-slate-100 leading-snug">
                    Sign in to your business workspace
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Find verified partners, respond to RFQs and tenders, list your products and manage projects, procurement and finance in one place.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-850/60 mt-6 md:mt-0 text-[10px] text-slate-500 font-mono">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Verified business profiles</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Every action recorded in a tamper-evident audit log</span>
                </div>
              </div>
            </div>

            {/* Form Area Right Column */}
            <form
              onSubmit={handleAuthSubmit}
              className="flex-1 p-6 md:p-8 flex flex-col justify-between text-left bg-slate-900/60"
            >
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => switchAuthTab('signin')}
                    className={`pb-1 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                      authModalTab === 'signin' ? 'border-emerald-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Corporate Sign In
                  </button>
                  <span className="text-slate-800 font-mono">/</span>
                  <button
                    type="button"
                    onClick={() => switchAuthTab('signup')}
                    className={`pb-1 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                      authModalTab === 'signup' ? 'border-emerald-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(false)}
                  className="p-1 rounded bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 py-4 flex-1">
                {/* Demo personas (only offered by servers running in demo mode) */}
                {authModalTab === 'signin' && authMeta?.demoMode && authMeta.demoAccounts.length > 0 && (
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">
                        Choose a Demo Corporate Persona
                      </h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">
                        Select a role below to fill in the credentials of a pre-configured demo account:
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {authMeta.demoAccounts.map(p => {
                        const isSelected = authEmail === p.email;
                        return (
                          <button
                            key={p.email}
                            type="button"
                            onClick={() => {
                              setAuthEmail(p.email);
                              setAuthPassword(authMeta.demoPassword || '');
                              setAuthDefaultView(p.view);
                              setAuthError('');
                            }}
                            className={`p-2.5 rounded-lg border text-left transition-all ${
                              isSelected 
                                ? 'bg-emerald-500/10 border-emerald-500/60 shadow-lg shadow-emerald-500/5 text-emerald-400' 
                                : 'bg-slate-950 border-slate-850 hover:border-slate-750 text-slate-300'
                            }`}
                          >
                            <div className="text-[11px] font-extrabold truncate">{p.title}</div>
                            <div className="text-[10px] font-mono text-slate-500 truncate mt-0.5">{p.role.replace(/_/g, ' ').toLowerCase()}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Credentials */}
                <div className={`space-y-3 ${authModalTab === 'signin' && authMeta?.demoMode ? 'border-t border-slate-850/60 pt-4' : ''}`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="auth-email" className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Corporate Email Address</label>
                      <input
                        id="auth-email"
                        type="email"
                        required
                        autoComplete="username"
                        readOnly={!!inviteCode}
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="sourcing@adani.com"
                        className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="auth-password" className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Password</label>
                      <input
                        id="auth-password"
                        type="password"
                        required
                        autoComplete={authModalTab === 'signin' ? 'current-password' : 'new-password'}
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder={authModalTab === 'signin' ? 'Enter password' : 'At least 12 characters'}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {authModalTab === 'signup' && inviteCode && (
                    <>
                      <p className="text-[11px] text-emerald-400 leading-relaxed">You were invited to join a company on RealtyConnect. Choose a password to create your account.</p>
                      <div>
                        <label htmlFor="auth-name" className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Your Name</label>
                        <input id="auth-name" type="text" required autoComplete="name" value={authName} onChange={(e) => setAuthName(e.target.value)} placeholder="Full name" className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none transition-all" />
                      </div>
                    </>
                  )}

                  {authModalTab === 'signup' && !inviteCode && (
                    <>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        Passwords need 12+ characters with an uppercase letter, a lowercase letter, a digit and a special character.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="auth-org" className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Organization Name</label>
                          <input
                            id="auth-org"
                            type="text"
                            required
                            minLength={2}
                            autoComplete="organization"
                            value={authOrgName}
                            onChange={(e) => setAuthOrgName(e.target.value)}
                            placeholder="Adani Infrastructure Ltd"
                            className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label htmlFor="auth-role" className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Stakeholder Role Class</label>
                          <select
                            id="auth-role"
                            value={authRole}
                            onChange={(e) => setAuthRole(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none transition-all font-mono"
                          >
                            {(authMeta?.selfServiceRoles ?? Object.keys(SIGNUP_ROLE_LABELS)).map(code => (
                              <option key={code} value={code}>{SIGNUP_ROLE_LABELS[code] ?? code}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label htmlFor="auth-name" className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Your Name</label>
                          <input
                            id="auth-name"
                            type="text"
                            required
                            autoComplete="name"
                            value={authName}
                            onChange={(e) => setAuthName(e.target.value)}
                            placeholder="Full name"
                            className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label htmlFor="auth-city" className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">City</label>
                          <input
                            id="auth-city"
                            type="text"
                            required
                            value={authCity}
                            onChange={(e) => setAuthCity(e.target.value)}
                            placeholder="Mumbai"
                            className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label htmlFor="auth-rera" className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">RERA ID (optional)</label>
                          <input
                            id="auth-rera"
                            type="text"
                            value={authRera}
                            onChange={(e) => setAuthRera(e.target.value)}
                            placeholder="RERA-MH-90432"
                            className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {authError && (
                  <div role="alert" className="bg-red-950/20 border border-red-900/40 text-red-300 p-3 rounded-lg flex items-start gap-2 text-[11px] leading-relaxed">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="border-t border-slate-850/60 pt-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Lock className="w-3.5 h-3.5 text-emerald-500" />
                  {authModalTab === 'signin' ? 'New here? Choose Create Account above.' : 'Your company is listed in the directory as soon as you sign up.'}
                </p>
                
                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-500/10 active:scale-95"
                >
                  <span>
                    {authSubmitting
                      ? 'Please wait...'
                      : authModalTab === 'signin'
                      ? 'Sign In & Open Workspace →'
                      : 'Create Account & Open Workspace →'}
                  </span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Premium Corporate Footer & Bridge to Foundation Developer Hub */}
      {activeViewMode !== 'home' && (
        <footer className="bg-slate-950 border-t border-slate-850 px-6 py-8 text-xs text-slate-500 space-y-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-left">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center">
                  <Building2 className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
                </div>
                <span className="font-extrabold text-white font-display text-sm tracking-tight">RealtyConnect™</span>
              </div>
              <span className="hidden sm:inline text-slate-800">|</span>
              <div className="text-slate-400 font-medium">
                A Product of <span className="text-slate-200 font-semibold">MultiSarv India Pvt. Ltd.</span>
              </div>
              <span className="hidden sm:inline text-slate-800">|</span>
              <span className="text-emerald-500/80 font-mono text-[10px] uppercase tracking-wider">The Real Estate Business Ecosystem</span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-slate-400 font-medium">
              <a href="#discovery-portal" className="hover:text-emerald-400">Directory</a>
              <button type="button" onClick={() => setActiveViewMode('directory')} className="hover:text-emerald-400">Businesses</button>
              <button type="button" onClick={() => setActiveViewMode(userSession ? 'analytics_subscription' : 'home')} className="hover:text-emerald-400">Plans</button>
              
            </div>
          </div>

          <div className="border-t border-slate-850/60 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-mono leading-relaxed">
            <div>
              &copy; 2026 MultiSarv India Pvt. Ltd. All Rights Reserved. RealtyConnect™ - The Real Estate Business Ecosystem. Registered under RERA B2B Governance standards.
            </div>

            {/* Platform tools (audit log, masters, system settings) are for administrators and demo servers only */}
            {(authMeta?.demoMode || userSession?.permissions.includes('MANAGE_SYSTEM_CONFIGS') || userSession?.permissions.includes('VIEW_AUDIT_LOGS')) && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onLogTriggered('DEV_FOUNDATION_HUB_BYPASS_ENGAGED', 'system_operator', 'dev_hub_toggle', 'WARNING', 'System bypass: Administrator toggled landing view back to the developer Platform Foundation Hub.');
                  onToggleDevHub();
                }}
                className="text-emerald-500/60 hover:text-emerald-400 hover:underline flex items-center gap-1 border border-emerald-500/10 hover:border-emerald-500/20 bg-emerald-500/5 px-2 py-1 rounded"
                title="Audit log, master data, system settings and access control"
              >
                <Terminal className="w-3 h-3 text-emerald-400" />
                <span>Platform Administration</span>
              </button>
            </div>
            )}
          </div>
        </footer>
      )}

    </div>
  );
}
