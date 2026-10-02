/**
 * RealtyConnect™ Sprint 09 - Business Control Center Dashboard
 * A premium, highly polished Swiss Slate themed dashboard.
 */

import { appStore } from '../lib/appStore';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Briefcase, 
  Calendar, 
  Search, 
  Plus, 
  SlidersHorizontal, 
  Check, 
  UserCheck, 
  FileText, 
  TrendingDown, 
  Info, 
  X, 
  Clock, 
  ChevronRight, 
  MapPin, 
  DollarSign, 
  FileCheck,
  ShieldAlert,
  AlertTriangle,
  Menu,
  ChevronDown,
  ChevronUp,
  Heart,
  Bookmark,
  Bell,
  RefreshCw,
  Cpu,
  CornerDownRight,
  ShoppingBag,
  ArrowUpRight,
  ClipboardList
} from 'lucide-react';
import { Connection, Enquiry, Meeting, RfqOpportunity } from './BusinessNetworkingDashboard';

interface BusinessDashboardProps {
  userSession: { 
    email: string; 
    name?: string; 
    role: string; 
    permissions: string[]; 
    subscriptionPlan?: string; 
    organizationName?: string; 
    reraRegistration?: string; 
  } | null;
  connections: Connection[];
  enquiries: Enquiry[];
  meetings: Meeting[];
  rfqs: RfqOpportunity[];
  savedBusinesses: string[];
  favoriteCompanies: string[];
  following: string[];
  onToggleSave: (id: string, name: string) => void;
  onToggleFavorite: (id: string, name: string) => void;
  onLogTriggered: (action: string, entity: string, entityId: string, status: 'SUCCESS' | 'FAILURE' | 'WARNING', details: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onViewBusinessProfile: (id: string) => void;
  setActiveViewMode: (mode: 'directory' | 'network_dashboard' | 'feed' | 'dashboard' | 'opportunities' | 'rfq_management' | 'marketplace' | 'lead_management') => void;
  onTriggerCreateOpportunity?: () => void;
  // State multipliers to let the dashboard actually change states:
  setMeetings: React.Dispatch<React.SetStateAction<Meeting[]>>;
  setEnquiries: React.Dispatch<React.SetStateAction<Enquiry[]>>;
  setRfqs: React.Dispatch<React.SetStateAction<RfqOpportunity[]>>;
}

// 15 Roles available for preview selection
const DASHBOARD_PREVIEW_ROLES = [
  { id: 'BUILDER', name: 'Builder', sector: 'Construction' },
  { id: 'DEVELOPER', name: 'Developer', sector: 'Acquisition & Permits' },
  { id: 'VENDOR', name: 'Vendor / Material Supplier', sector: 'Materials Supply' },
  { id: 'CONTRACTOR', name: 'Contractor', sector: 'Civil Engineering' },
  { id: 'BROKER', name: 'Broker', sector: 'Transactional Sales' },
  { id: 'CHANNEL_PARTNER', name: 'Channel Partner', sector: 'Affiliate Marketing' },
  { id: 'DSA', name: 'DSA (Direct Selling Agent)', sector: 'Financial Referrals' },
  { id: 'BANK', name: 'Bank', sector: 'Project Syndication & Retail Loans' },
  { id: 'NBFC', name: 'NBFC (Non-Banking Financial Co)', sector: 'Structured Mezzanine Debt' },
  { id: 'INSURANCE', name: 'Insurance Provider', sector: 'Risk Mitigation' },
  { id: 'CONSULTANT', name: 'Consultant (Liaison & Legal)', sector: 'RERA & Compliance Advisory' },
  { id: 'PROPERTY_MANAGEMENT', name: 'Property Management', sector: 'Asset Optimization' },
  { id: 'FACILITY_MANAGEMENT', name: 'Facility Management', sector: 'Preventive Audits' },
  { id: 'RECRUITER', name: 'Recruiter', sector: 'Talent Acquisition' },
  { id: 'JOB_SEEKER', name: 'Job Seeker', sector: 'Technical Careers' }
];

export default function BusinessDashboard({
  userSession,
  connections,
  enquiries,
  meetings,
  rfqs,
  savedBusinesses,
  favoriteCompanies,
  following,
  onToggleSave,
  onToggleFavorite,
  onLogTriggered,
  showToast,
  onViewBusinessProfile,
  setActiveViewMode,
  onTriggerCreateOpportunity,
  setMeetings,
  setEnquiries,
  setRfqs
}: BusinessDashboardProps) {

  // Active role selected for the preview (defaults to logged-in user role or BUILDER)
  const [activeRole, setActiveRole] = useState<string>(() => {
    if (userSession?.role) {
      const match = DASHBOARD_PREVIEW_ROLES.find(r => r.id === userSession.role);
      if (match) return match.id;
    }
    return 'BUILDER';
  });

  // Dynamic B2B Marketplace Integration Data loaded from appStore
  const [localMktListings, setLocalMktListings] = useState<any[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_marketplace_listings');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [];
  });

  const [localMktEnquiries, setLocalMktEnquiries] = useState<any[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_product_enquiries');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [];
  });

  const [localMktSaved, setLocalMktSaved] = useState<string[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_saved_listings');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [];
  });

  const [dashboardLeads, setDashboardLeads] = useState<any[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_leads');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [enterpriseMeetings, setEnterpriseMeetings] = useState<any[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_meetings');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [];
  });

  useEffect(() => {
    const handleSync = () => {
      try {
        const savedListings = appStore.getItem('realtyconnect_marketplace_listings');
        if (savedListings) setLocalMktListings(JSON.parse(savedListings));
        
        const savedEnquiries = appStore.getItem('realtyconnect_product_enquiries');
        if (savedEnquiries) setLocalMktEnquiries(JSON.parse(savedEnquiries));

        const savedBookmarks = appStore.getItem('realtyconnect_saved_listings');
        if (savedBookmarks) setLocalMktSaved(JSON.parse(savedBookmarks));

        const savedLeads = appStore.getItem('realtyconnect_leads');
        if (savedLeads) setDashboardLeads(JSON.parse(savedLeads));

        const savedMeetings = appStore.getItem('realtyconnect_meetings');
        if (savedMeetings) setEnterpriseMeetings(JSON.parse(savedMeetings));
      } catch (e) {
        console.error('Error syncing marketplace dashboard stats', e);
      }
    };
    handleSync();
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  // Synchronized RFQ and Quotations States
  const [rfqList] = useState<any[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_rfq_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    // Default initial RFQs if none exist
    return [
      {
        id: 'RFQ-2026-1001',
        title: 'Bulk Supply of Fe550D TMT Reinforcement Steel Bars',
        category: 'Materials Supply',
        type: 'Procurement',
        budget: '₹4.5 Crore',
        quantity: '8,500 MT',
        status: 'Published',
        closingDate: '2026-07-30',
        responsesCount: 4,
        postedBy: 'Apex Developers Ltd',
        location: 'Mumbai, Maharashtra'
      },
      {
        id: 'RFQ-2026-1002',
        title: 'Bored Cast-in-Situ Piling & Diaphragm Wall Casting',
        category: 'Civil Construction',
        type: 'Subcontract',
        budget: '₹8.2 Crore',
        quantity: '420 Piles',
        status: 'Published',
        closingDate: '2026-08-05',
        responsesCount: 2,
        postedBy: 'BuildCorp Construction',
        location: 'Bangalore, Karnataka'
      }
    ];
  });

  const [quotationList] = useState<any[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_quotation_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'QUO-1011',
        rfqId: 'RFQ-2026-1001',
        rfqTitle: 'Bulk Supply of Fe550D TMT Reinforcement Steel Bars',
        bidAmount: '₹4.42 Crore',
        status: 'Submitted',
        deliveryDays: 45,
        remarks: 'Direct primary manufacturer pricing. Bureau Veritas certified steel shipment.',
        timestamp: '2026-07-16 14:35'
      }
    ];
  });

  // Local state modifiers for interactive Quick Actions
  const [profileStrength, setProfileStrength] = useState<number>(75);
  const [membershipStatus, setMembershipStatus] = useState<'Standard Free' | 'Enterprise Platinum'>('Standard Free');
  const [verificationStatus, setVerificationStatus] = useState<'KYC & RERA VERIFIED' | 'PENDING DOCUMENTS'>('PENDING DOCUMENTS');
  const [activeTeam, setActiveTeam] = useState<{ name: string; role: string; email: string }[]>([
    { name: 'Amit Desai', role: 'Head of Procurement', email: 'amit@multisarv.in' },
    { name: 'Siddharth Sen', role: 'Chief Structural Consultant', email: 'siddharth@multisarv.in' }
  ]);

  // Collapsible section flags to satisfy design requirements
  const [collapsibles, setCollapsibles] = useState({
    profileMetrics: true,
    commonWidgets: true,
    roleSpecificWidgets: true,
    recentConnections: true,
    recentEnquiries: true,
    recentMeetings: true,
    recentFeedUpdates: true
  });

  const toggleCollapsible = (section: keyof typeof collapsibles) => {
    setCollapsibles(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Interactive Modals State
  const [activeModal, setActiveModal] = useState<'publish' | 'enquiry' | 'meeting' | 'team' | 'upgrade' | null>(null);

  // Modal Form Inputs
  const [publishForm, setPublishForm] = useState({ title: '', content: '', tag: 'Market Update' });
  const [enquiryForm, setEnquiryForm] = useState({ subject: '', message: '', targetCompany: 'ent-1' });
  const [meetingForm, setMeetingForm] = useState({ title: '', date: '', time: '', type: 'Virtual Video Call', businessId: 'ent-1' });
  const [teamForm, setTeamForm] = useState({ name: '', role: '', email: '' });

  // Custom Simulated Notifications
  const [localNotifications, setLocalNotifications] = useState<{ id: string; text: string; time: string; unread: boolean }[]>([
    { id: 'noti-d1', text: 'Apex Developers Ltd approved your mutual networking connection proposal.', time: '10 mins ago', unread: true },
    { id: 'noti-d2', text: 'New tender opportunity published matching "TMT Reinforcement Steel" specifications.', time: '2 hours ago', unread: true },
    { id: 'noti-d3', text: 'Technical audit feedback received from RERA compliance officer.', time: '1 day ago', unread: false }
  ]);

  const handleMarkNotiRead = (id: string) => {
    setLocalNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  // 1. Interactive Today's Priorities List
  const [priorities, setPriorities] = useState<{ id: string; text: string; done: boolean; category: string }[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_dashboard_priorities');
      return saved ? JSON.parse(saved) : [
        { id: 'p1', text: 'Validate RERA compliance disclosures for Tower B filings', done: false, category: 'Compliance' },
        { id: 'p2', text: 'Approve quotation for 4,000 MT reinforcement steel', done: true, category: 'Procurement' },
        { id: 'p3', text: 'Sign Joint Venture escrow contract with Syndicate Bank', done: false, category: 'Finance' }
      ];
    } catch (e) {
      return [];
    }
  });

  const [newPriorityText, setNewPriorityText] = useState('');
  const [newPriorityCat, setNewPriorityCat] = useState('Compliance');

  const handleAddPriority = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPriorityText.trim()) return;
    const newP = {
      id: `p-${Date.now()}`,
      text: newPriorityText.trim(),
      done: false,
      category: newPriorityCat
    };
    const updated = [newP, ...priorities];
    setPriorities(updated);
    appStore.setItem('realtyconnect_dashboard_priorities', JSON.stringify(updated));
    setNewPriorityText('');
    showToast('New dynamic corporate priority logged!', 'success');
    onLogTriggered('B2B_PRIORITY_ADDED', 'priorities', newP.id, 'SUCCESS', `Added priority: ${newP.text}`);
  };

  const handleTogglePriority = (id: string) => {
    const updated = priorities.map(p => p.id === id ? { ...p, done: !p.done } : p);
    setPriorities(updated);
    appStore.setItem('realtyconnect_dashboard_priorities', JSON.stringify(updated));
    onLogTriggered('B2B_PRIORITY_TOGGLED', 'priorities', id, 'SUCCESS', `Toggled priority: ${id}`);
  };

  const handleDeletePriority = (id: string) => {
    const updated = priorities.filter(p => p.id !== id);
    setPriorities(updated);
    appStore.setItem('realtyconnect_dashboard_priorities', JSON.stringify(updated));
  };

  // 2. Interactive Pending Role Checklist
  const [checklists, setChecklists] = useState<{ id: string; text: string; done: boolean }[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_dashboard_checklist');
      return saved ? JSON.parse(saved) : [
        { id: 'c1', text: 'Submit foundation work blueprints', done: false },
        { id: 'c2', text: 'Publish cement supply RFQ on B2B portal', done: false },
        { id: 'c3', text: 'Update corporate directory details', done: true },
        { id: 'c4', text: 'Authorize payment to site subcontractors', done: false }
      ];
    } catch(e) {
      return [];
    }
  });

  const [newChecklistText, setNewChecklistText] = useState('');

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    const newC = {
      id: `c-${Date.now()}`,
      text: newChecklistText.trim(),
      done: false
    };
    const updated = [...checklists, newC];
    setChecklists(updated);
    appStore.setItem('realtyconnect_dashboard_checklist', JSON.stringify(updated));
    setNewChecklistText('');
    showToast('Task added to operational checklist.', 'success');
  };

  const handleToggleChecklist = (id: string) => {
    const updated = checklists.map(c => c.id === id ? { ...c, done: !c.done } : c);
    setChecklists(updated);
    appStore.setItem('realtyconnect_dashboard_checklist', JSON.stringify(updated));
  };

  const handleDeleteChecklist = (id: string) => {
    const updated = checklists.filter(c => c.id !== id);
    setChecklists(updated);
    appStore.setItem('realtyconnect_dashboard_checklist', JSON.stringify(updated));
  };

  // 3. Workspace Personalization States
  const [dashboardWidgets, setDashboardWidgets] = useState<Record<string, boolean>>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_dashboard_widgets');
      return saved ? JSON.parse(saved) : {
        priorities: true,
        checklist: true,
        kpis: true,
        calendar: true,
        notifications: true,
        recentActivity: true,
        productivity: true
      };
    } catch (e) {
      return { priorities: true, checklist: true, kpis: true, calendar: true, notifications: true, recentActivity: true, productivity: true };
    }
  });

  const toggleWidgetConfig = (widgetKey: string) => {
    const updated = { ...dashboardWidgets, [widgetKey]: !dashboardWidgets[widgetKey] };
    setDashboardWidgets(updated);
    appStore.setItem('realtyconnect_dashboard_widgets', JSON.stringify(updated));
    showToast(`Widget state adjusted for ${widgetKey}!`, 'info');
  };

  const [workspaceTheme, setWorkspaceTheme] = useState('Light Classic');

  // 4. Categorized Grouped Notifications
  const [categorizedNotifications, setCategorizedNotifications] = useState<{
    id: string;
    text: string;
    time: string;
    category: 'CRM' | 'Projects' | 'Marketplace' | 'Meetings' | 'Finance' | 'HR' | 'Documents' | 'System';
    unread: boolean;
  }[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_grouped_notifications');
      return saved ? JSON.parse(saved) : [
        { id: 'noti-c1', text: 'Lead "Nikhil Sharma" requested custom pricing brochure.', time: '5 mins ago', category: 'CRM', unread: true },
        { id: 'noti-c2', text: 'Construction concrete pour audit submitted for approval.', time: '1 hour ago', category: 'Projects', unread: true },
        { id: 'noti-c3', text: 'Received 3 new quotes for Grade 43 cement supply.', time: '3 hours ago', category: 'Marketplace', unread: true },
        { id: 'noti-c4', text: 'Meeting scheduled with Tata Steel structural engineer.', time: '4 hours ago', category: 'Meetings', unread: false },
        { id: 'noti-c5', text: 'Joint Venture Escrow milestone release approved.', time: '1 day ago', category: 'Finance', unread: false },
        { id: 'noti-c6', text: 'New application received for Structural Auditor seat.', time: '1 day ago', category: 'HR', unread: true },
        { id: 'noti-c7', text: 'RERA Phase III certification signed digitally.', time: '2 days ago', category: 'Documents', unread: false },
        { id: 'noti-c8', text: 'System backup and log rotational index finished.', time: '3 days ago', category: 'System', unread: false },
      ];
    } catch(e) { return []; }
  });

  const [activeNotificationTab, setActiveNotificationTab] = useState<'CRM' | 'Projects' | 'Marketplace' | 'Meetings' | 'Finance' | 'HR' | 'Documents' | 'System'>('CRM');

  const handleMarkGroupedRead = (id: string) => {
    const updated = categorizedNotifications.map(n => n.id === id ? { ...n, unread: false } : n);
    setCategorizedNotifications(updated);
    appStore.setItem('realtyconnect_grouped_notifications', JSON.stringify(updated));
    showToast('Notification marked as read.', 'success');
  };

  const handleArchiveNotification = (id: string) => {
    const updated = categorizedNotifications.filter(n => n.id !== id);
    setCategorizedNotifications(updated);
    appStore.setItem('realtyconnect_grouped_notifications', JSON.stringify(updated));
    showToast('Notification archived securely.', 'info');
  };

  // 5. Productivity logs
  const [recentSearches] = useState<string[]>(() => {
    return ['Fe550D TMT Reinforcement Steel', 'Grade 53 Portland Cement', 'Subcontractors in Mumbai', 'Worli layout surveyors', 'Escrow accounts'];
  });
  const [visitedBusinesses] = useState<any[]>(() => {
    return [
      { id: 'vis-1', name: 'Tata Steel Infrastructure', sector: 'Materials', rating: '4.9★' },
      { id: 'vis-2', name: 'L&T Foundations Limited', sector: 'Contractor', rating: '4.8★' },
      { id: 'vis-3', name: 'Adani Infrastructure Corp', sector: 'Builder', rating: '4.7★' }
    ];
  });

  // Profile completion handler
  const handleCompleteProfile = () => {
    setProfileStrength(100);
    setVerificationStatus('KYC & RERA VERIFIED');
    showToast('Enterprise Profile audit completed! Score is 100% and Verification badge is unlocked.', 'success');
    onLogTriggered('B2B_PROFILE_STRENGTH_COMPLETED', 'profiles', userSession?.email || 'SYSTEM', 'SUCCESS', 'Completed enterprise bio, certificates, and RERA licensure mapping.');
  };

  // Upgrading Membership
  const handleUpgradeMembership = () => {
    setMembershipStatus('Enterprise Platinum');
    showToast('Upgraded successfully to Enterprise Platinum Tier!', 'success');
    onLogTriggered('B2B_MEMBERSHIP_UPGRADED', 'billing', userSession?.email || 'SYSTEM', 'SUCCESS', 'Upgraded client subscription tier to Enterprise Platinum.');
    setActiveModal(null);
  };

  // Handle Quick Action modal submits
  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishForm.title || !publishForm.content) return;
    showToast('Professional update queued for the Business Feed.', 'success');
    onLogTriggered('B2B_FEED_UPDATE_PUBLISHED', 'feed', 'central', 'SUCCESS', `Published: "${publishForm.title}" under topic tags.`);
    setPublishForm({ title: '', content: '', tag: 'Market Update' });
    setActiveModal(null);
  };

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryForm.subject || !enquiryForm.message) return;

    const newEnq: Enquiry = {
      id: `enq-${Date.now()}`,
      businessId: enquiryForm.targetCompany,
      businessName: enquiryForm.targetCompany === 'ent-1' ? 'Apex Developers Ltd' : 'BuildCorp Construction',
      subject: enquiryForm.subject,
      category: 'Material Quotation',
      message: enquiryForm.message,
      senderEmail: userSession?.email || 'anonymous@multisarv.in',
      senderPhone: '+91 99999 88888',
      timestamp: new Date().toISOString().replace('T', ' ').substr(0, 16),
      status: 'replied' // Automated callback simulated instantly for fidelity
    };

    setEnquiries(prev => [newEnq, ...prev]);
    showToast('Business Enquiry dispatched securely with audit log track!', 'success');
    onLogTriggered('B2B_ENQUIRY_DISPATCHED', 'enquiries', newEnq.id, 'SUCCESS', `Dispatched quotation enquiry to ${newEnq.businessName}.`);
    setEnquiryForm({ subject: '', message: '', targetCompany: 'ent-1' });
    setActiveModal(null);
  };

  const handleMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingForm.title || !meetingForm.date || !meetingForm.time) return;

    const newMeeting: Meeting = {
      id: `meet-${Date.now()}`,
      businessId: meetingForm.businessId,
      businessName: meetingForm.businessId === 'ent-1' ? 'Apex Developers Ltd' : 'BuildCorp Construction',
      title: meetingForm.title,
      date: meetingForm.date,
      time: meetingForm.time,
      type: meetingForm.type,
      status: 'scheduled',
      timestamp: new Date().toISOString().replace('T', ' ').substr(0, 16)
    };

    setMeetings(prev => [newMeeting, ...prev]);
    showToast('Corporate Video Consult scheduled and integrated with calendar!', 'success');
    onLogTriggered('B2B_MEETING_SCHEDULED', 'meetings', newMeeting.id, 'SUCCESS', `Scheduled consulting call with ${newMeeting.businessName} on ${meetingForm.date}.`);
    setMeetingForm({ title: '', date: '', time: '', type: 'Virtual Video Call', businessId: 'ent-1' });
    setActiveModal(null);
  };

  const handleTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamForm.name || !teamForm.role || !teamForm.email) return;

    setActiveTeam(prev => [...prev, { ...teamForm }]);
    showToast(`Team member ${teamForm.name} invited and granted seat credentials.`, 'success');
    onLogTriggered('B2B_TEAM_MEMBER_ADDED', 'team', teamForm.email, 'SUCCESS', `Invited "${teamForm.name}" as role context "${teamForm.role}"`);
    setTeamForm({ name: '', role: '', email: '' });
  };

  // Pre-seed static role-specific panels for absolute coverage of 15 roles
  const getRoleSpecificContent = (roleId: string) => {
    switch (roleId) {
      case 'BUILDER':
        return {
          title: 'Builder Command Deck',
          icon: Building2,
          stats: [
            { label: 'Active Projects', value: '4 Towers', trend: 'RERA Approved' },
            { label: 'Pending Materials', value: '3 Slabs', trend: '2 Tender RFQs' },
            { label: 'Sub-Contractors', value: '8 Engaged', trend: '4 bids awaiting' }
          ],
          widgets: [
            {
              title: 'Active Highrise Projects',
              items: [
                { primary: 'Skyline Residency Tower B', secondary: 'Excavation phase completed; foundation concrete casting active.', status: '94% On-Track', color: 'text-emerald-400' },
                { primary: 'Apex Meadows Smart Township', secondary: 'Joint layout submission with structural surveyors.', status: 'Clearance Stage', color: 'text-yellow-400' }
              ]
            },
            {
              title: 'Material Procurement Demands',
              items: [
                { primary: 'TMT Structural Rebars (150 Tons)', secondary: 'Required high-ductility Fe550D grade reinforcement steel bars.', status: 'RFQ Active', color: 'text-cyan-400' },
                { primary: 'Grade 53 Portland Cement (400 MT)', secondary: 'Ready-mix batching compatibility certificate required.', status: 'Tender Stage', color: 'text-amber-400' }
              ]
            },
            {
              title: 'Contractor Bid Requests',
              items: [
                { primary: 'Electrical & HVAC Fitments - Block C', secondary: 'Looking for class-1 contractor with pre-sanctioned ESCROW.', status: '4 Proposals Received', color: 'text-indigo-400' }
              ]
            }
          ]
        };

      case 'DEVELOPER':
        return {
          title: 'Developer Ventures Matrix',
          icon: Sparkles,
          stats: [
            { label: 'Total Land Parcel', value: '18.4 Acres', trend: 'Zone Clear' },
            { label: 'RERA Compliance', value: '100% Filed', trend: 'Zero violations' },
            { label: 'Escrow Holdings', value: '₹4.8 Cr', trend: 'Audited Weekly' }
          ],
          widgets: [
            {
              title: 'Joint Venture Land Portfolios',
              items: [
                { primary: 'Bandra Tech Plaza Layout', secondary: 'RERA licensing approved; infrastructure clearance secured.', status: 'RERA Approved', color: 'text-emerald-400' },
                { primary: 'Worli Luxury Duplex Block', secondary: 'Joint development agreement validation with Elite Heights.', status: 'MoU Under Audit', color: 'text-yellow-400' }
              ]
            },
            {
              title: 'Venture Capital & Bank Escrows',
              items: [
                { primary: 'National Trust Bank Syndicate', secondary: 'Escrow account linked with dual-signature release authorization.', status: 'Active Linked', color: 'text-emerald-400' }
              ]
            }
          ]
        };

      case 'VENDOR':
        return {
          title: 'Vendor Inventory & Leads',
          icon: SlidersHorizontal,
          stats: [
            { label: 'Active Leads', value: '12 Quotes', trend: 'High Conversion' },
            { label: 'Fulfillment Rate', value: '98.4%', trend: 'Class-A Rating' },
            { label: 'Catalog SKU Count', value: '148 Items', trend: 'Updated Today' }
          ],
          widgets: [
            {
              title: 'Material & Product Enquiries',
              items: [
                { primary: 'Ready-Mix Concrete Grade M40 (500 Cum)', secondary: 'Requested by BuildCorp Construction for Metro substructures.', status: 'Awaiting Quote', color: 'text-yellow-400' },
                { primary: 'Low-Carbon Dry Mortar (2000 Bags)', secondary: 'Requested by Green Brick logistics with 30-day corporate credit.', status: 'Replied', color: 'text-emerald-400' }
              ]
            },
            {
              title: 'Corporate Orders Placement (Fulfillment Stream)',
              items: [
                { primary: 'Purchase Order #PO-9840 - Elite Heights', secondary: 'Reinforcing rebar batch 4. Weight verification sheets certified.', status: 'Dispatched & Tracked', color: 'text-emerald-400' },
                { primary: 'Purchase Order #PO-9921 - Vanguard Builders', secondary: 'Low-carbon AAC insulation walling modules awaiting QA scan.', status: 'In Warehouse Audit', color: 'text-cyan-400' }
              ]
            }
          ]
        };

      case 'CONTRACTOR':
        return {
          title: 'Contractor Heavy Engineering Desk',
          icon: Briefcase,
          stats: [
            { label: 'Active Crew Count', value: '240 Skilled', trend: 'Safety Certified' },
            { label: 'Machinery In-Use', value: '14 Heavy', trend: 'Zero Downtime' },
            { label: 'Current Tenders', value: '3 Active', trend: '₹14.2 Cr Valuation' }
          ],
          widgets: [
            {
              title: 'Project Tenders & Invitations',
              items: [
                { primary: 'Metro Line Phase 3 Substructure', secondary: 'Civil engineering bid for continuous concrete piling and grading.', status: 'Assigned', color: 'text-emerald-400' },
                { primary: 'BKC Corporate Headquarters Canopy', secondary: 'Structural steel and safety harness framing subcontract offer.', status: 'Invited to Bid', color: 'text-yellow-400' }
              ]
            },
            {
              title: 'Machinery & Equipment Registry',
              items: [
                { primary: 'Liebherr Tower Crane 150HC', secondary: 'Structural wind-stress certification valid until Dec 2026.', status: 'Deployed at Site B', color: 'text-cyan-400' },
                { primary: 'Caterpillar 320D Excavator', secondary: 'Standard hydraulic engine check and calibration logged.', status: 'Idle (Available Aug 1st)', color: 'text-amber-400' }
              ]
            }
          ]
        };

      case 'BROKER':
        return {
          title: 'Broker Premium Deal Board',
          icon: UserCheck,
          stats: [
            { label: 'Exclusive Listings', value: '14 High-end', trend: 'RERA Disclosed' },
            { label: 'HNW Clients', value: '8 Active', trend: 'Direct mandate' },
            { label: 'Average Cycle', value: '18 Days', trend: 'Fast-track' }
          ],
          widgets: [
            {
              title: 'Exclusive Commercial & Residential Portfolios',
              items: [
                { primary: 'Premium 4BHK Penthouse - Worli Layout', secondary: 'Fully furnished, double-height deck, private pool access.', status: 'Sale Mandate (₹12.5 Cr)', color: 'text-cyan-400' },
                { primary: 'Commercial Office Plate - BKC Tower B', secondary: '12,000 sqft premium executive suite plate, fit-outs ready.', status: 'Lease Mandate (₹4.5L/Mo)', color: 'text-indigo-400' }
              ]
            },
            {
              title: 'High-Priority Client Leads',
              items: [
                { primary: 'Vikas Singhal (Founder, Singhal Tech)', secondary: 'Seeking corporate guest houses and luxury residential duplexes.', status: 'Site Visit Scheduled', color: 'text-emerald-400' }
              ]
            }
          ]
        };

      case 'CHANNEL_PARTNER':
        return {
          title: 'Channel Partner Network Engine',
          icon: Award,
          stats: [
            { label: 'Registered Agency', value: 'MH-RERA', trend: 'P5180020' },
            { label: 'Direct Leads Logged', value: '38 Submissions', trend: '24 Pre-vetted' },
            { label: 'Unpaid Commission', value: '₹14,50,000', trend: 'Under Escrow' }
          ],
          widgets: [
            {
              title: 'Active Project RERA Commissions',
              items: [
                { primary: 'Apex Meadows Smart Township', secondary: 'Standard commission structure: 3.0% flat payout on signed contracts.', status: 'Active Campaign', color: 'text-emerald-400' },
                { primary: 'Nexus Corporate Tech Park', secondary: 'Commercial referral fee structure: 2.5% on verified lease value.', status: 'Exclusive Terms', color: 'text-indigo-400' }
              ]
            },
            {
              title: 'Pre-vetted Client Leads Stream',
              items: [
                { primary: 'Hitesh Rawal (Duplex Buyer)', secondary: 'Verified budget ₹6 Cr. Pre-sanctioned home loan document attached.', status: 'Lead Pre-approved', color: 'text-emerald-400' }
              ]
            }
          ]
        };

      case 'DSA':
        return {
          title: 'DSA Financial Referrals Command',
          icon: DollarSign,
          stats: [
            { label: 'Bank Integrations', value: '4 Gateways', trend: 'APIs Online' },
            { label: 'Disbursed Value', value: '₹22 Crores', trend: 'This Quarter' },
            { label: 'Referral Pipeline', value: '18 Active Leads', trend: 'KYC Screened' }
          ],
          widgets: [
            {
              title: 'Mortgage Referrals & Payout Matrices',
              items: [
                { primary: 'National Trust Bank Home Loans', secondary: 'DSA referral commission structure: 0.75% of sanctioned loan value.', status: 'Partner Sync Active', color: 'text-emerald-400' },
                { primary: 'Elite NBFC Commercial Bridge Loans', secondary: 'Developer project financing structure: 1.2% structured payout.', status: 'Premium Slates', color: 'text-amber-400' }
              ]
            },
            {
              title: 'Partner Financial Gateway Connection',
              items: [
                { primary: 'National Trust Bank API Sync', secondary: 'Secured identity tokens verified. Real-time lead tracking gateway.', status: 'ONLINE (Ping: 14ms)', color: 'text-emerald-400' },
                { primary: 'SBI Commercial Escrow Gateway', secondary: 'Compliance handshake delayed. Awaiting manual dossier audit.', status: 'Syncing Delayed', color: 'text-yellow-400' }
              ]
            }
          ]
        };

      case 'BANK':
        return {
          title: 'Bank Project Financing Portal',
          icon: FileCheck,
          stats: [
            { label: 'Consortium Capital', value: '₹1,200 Cr', trend: 'Aaa Rating' },
            { label: 'Underwriting Queue', value: '4 Developers', trend: 'RERA Audited' },
            { label: 'DSA Network API', value: '64 DSAs Linked', trend: 'OAuth Verified' }
          ],
          widgets: [
            {
              title: 'Developer Project Loan Applications',
              items: [
                { primary: 'Apex Developers Ltd - Project Green Meadows', secondary: 'Application for construction loan. Escrow structure requested.', status: '₹85 Cr (Underwriting)', color: 'text-yellow-400' },
                { primary: 'BuildCorp Metro Infrastructure Financing', secondary: 'Sovereign credit guarantee and state metro audit attached.', status: 'Approved (Disbursing)', color: 'text-emerald-400' }
              ]
            },
            {
              title: 'Active Commercial Escrow Accounts',
              items: [
                { primary: 'Skyline Towers Escrow Joint Account', secondary: 'Client subscription funds protected by strict milestone release rules.', status: 'Audited & Locked', color: 'text-emerald-400' }
              ]
            }
          ]
        };

      case 'NBFC':
        return {
          title: 'NBFC Mezzanine & Structured Debt',
          icon: TrendingUp,
          stats: [
            { label: 'Yield Target (IRR)', value: '18.4% Net', trend: 'Risk Managed' },
            { label: 'Bridge Loan Queue', value: '6 Mandates', trend: 'Secured Asset' },
            { label: 'Non-Performing Assets', value: '0.12%', trend: 'Ultra-low' }
          ],
          widgets: [
            {
              title: 'Structured Mezzanine Debt Mandates',
              items: [
                { primary: 'Vanguard Heights Commercial Block', secondary: 'Mezzanine funding tranche for structural engineering and MEP phases.', status: 'Underwriting Draft', color: 'text-yellow-400' },
                { primary: 'Green Brick Logistics Warehousing Park', secondary: 'Asset-backed bridge loan for sorting hub automated assembly.', status: 'Disbursed (Green)', color: 'text-emerald-400' }
              ]
            }
          ]
        };

      case 'INSURANCE':
        return {
          title: 'Enterprise Risk & Insurance Matrix',
          icon: ShieldCheck,
          stats: [
            { label: 'Liability Enrolled', value: '₹450 Cr', trend: 'Aaa Reinsured' },
            { label: 'Active Claim Files', value: '2 Under Assessment', trend: 'In-field Audit' },
            { label: 'Risk Premium Vol', value: '₹3.4 Cr / Yr', trend: '98% Renewal' }
          ],
          widgets: [
            {
              title: 'Contractor All-Risk (CAR) Policies',
              items: [
                { primary: 'Metro High-Stress Testing Laboratory', secondary: 'Comprehensive damage and civil engineering machinery CAR covers.', status: 'Policy Enrolled', color: 'text-emerald-400' },
                { primary: 'Skyline Residency Tower A Structural Defect', secondary: 'Latent structural defect policy covering foundation subsidence.', status: 'Premium Verified', color: 'text-emerald-400' }
              ]
            },
            {
              title: 'Active Asset Damage Claims Registry',
              items: [
                { primary: 'Noida Layout - Crane Damage Claim #C-002', secondary: 'Assessing heavy storm damage logs and wind shear telemetry.', status: 'Field Survey Pending', color: 'text-yellow-400' }
              ]
            }
          ]
        };

      case 'CONSULTANT':
        return {
          title: 'Consultancy & Liaison Desk',
          icon: SlidersHorizontal,
          stats: [
            { label: 'Active Client Mandates', value: '11 Developers', trend: 'Premium Liaison' },
            { label: 'RERA Compliance rate', value: '100% Spotless', trend: 'Direct link' },
            { label: 'Active RERA Filings', value: '4 Submissions', trend: 'Weekly audits' }
          ],
          widgets: [
            {
              title: 'RERA Compliance & Liaison Mandates',
              items: [
                { primary: 'Apex Developers Green Meadows Licensure', secondary: 'Resolving layout modification approvals and public amenity RERA maps.', status: 'Approved Filing', color: 'text-emerald-400' },
                { primary: 'Noida Sector 62 Residential Expansion Filing', secondary: 'Submitting updated corporate registry, deed declarations, and RERA audit trails.', status: 'Awaiting Signature', color: 'text-yellow-400' }
              ]
            },
            {
              title: 'Engineering & Structural Stability Audits',
              items: [
                { primary: 'ISO 9001 Compliance - BuildCorp Construction', secondary: 'Comprehensive audit of heavy equipment maintenance and onsite safety logs.', status: 'Audit Passed', color: 'text-emerald-400' }
              ]
            }
          ]
        };

      case 'PROPERTY_MANAGEMENT':
        return {
          title: 'Property Management Optimizer',
          icon: Building2,
          stats: [
            { label: 'Under Management', value: '1.2M Sqft', trend: '94% Occupied' },
            { label: 'Tenant Net Promoter', value: '4.8 Rating', trend: 'Excellence' },
            { label: 'Rental Collections', value: '96.2%', trend: 'Automated Invoicing' }
          ],
          widgets: [
            {
              title: 'Active Corporate Tenancies',
              items: [
                { primary: 'Unit 401 & 402 - Nexus Tech Park', secondary: 'Currently leased to Global Tech Equipment Ltd. Net-triple lease terms.', status: 'Paid (Current)', color: 'text-emerald-400' },
                { primary: 'Retail Space Galleria - Floor 1', secondary: 'Awaiting signature validation on boutique retail merchant agreement.', status: 'Lease Processing', color: 'text-yellow-400' }
              ]
            },
            {
              title: 'Tenant Maintenance & Service Tickets',
              items: [
                { primary: 'HVAC Duct and Air Filtration Recalibration', secondary: 'Scheduled preventive service for central compressor unit.', status: 'Scheduled (July 20th)', color: 'text-cyan-400' }
              ]
            }
          ]
        };

      case 'FACILITY_MANAGEMENT':
        return {
          title: 'Facility Management & Audits Desk',
          icon: SlidersHorizontal,
          stats: [
            { label: 'Managed Assets', value: '14 Tech Parks', trend: 'ISO 14001' },
            { label: 'Preventive Audits', value: '8 Scheduled', trend: 'Fire & Structural' },
            { label: 'Contractor Dispatch', value: '3 Active', trend: 'Emergency Support' }
          ],
          widgets: [
            {
              title: 'Preventive & Safety Compliance Audits',
              items: [
                { primary: 'High-Stress Lift Inspection (8 Units)', secondary: 'Annual safety drop-tests and control board telemetry calibration.', status: 'Scheduled July 22nd', color: 'text-cyan-400' },
                { primary: 'Central Fire Water Sprinkler Line Audit', secondary: 'Hydrostatic pressure test of piping manifold and alarms.', status: 'Signed Off', color: 'text-emerald-400' }
              ]
            },
            {
              title: 'Active Facility Maintenance Work Dispatches',
              items: [
                { primary: 'Parking Paving Ready-Mix Pouring', secondary: 'Contracted to Elite Materials Group for quick-setting high-strength concrete.', status: 'Truck Dispatched', color: 'text-emerald-400' }
              ]
            }
          ]
        };

      case 'RECRUITER':
        return {
          title: 'Talent Acquisition & Recruiting board',
          icon: Users,
          stats: [
            { label: 'Active Jobs Published', value: '6 Positions', trend: 'Premium Board' },
            { label: 'Candidate Applicants', value: '142 Profiles', trend: '38 Shortlisted' },
            { label: 'Scheduled Interviews', value: '8 Scheduled', trend: 'Technical Panel' }
          ],
          widgets: [
            {
              title: 'Active Job Openings & Requirements',
              items: [
                { primary: 'Lead Structural Engineer (Bangalore)', secondary: 'Civil master degree, 8-10 years heavy highrise construction experience.', status: '3 Applicants Shortlisted', color: 'text-emerald-400' },
                { primary: 'RERA Compliance Liaison Officer (Hyderabad)', secondary: 'Compliance background, deep knowledge of RERA statutory rules.', status: 'Resume Screening', color: 'text-cyan-400' }
              ]
            },
            {
              title: 'Active Interview Pipeline',
              items: [
                { primary: 'Amit Patel (Structural Design Candidate)', secondary: 'Final corporate round scheduled with BuildCorp Executive Panel.', status: 'July 21st, 11:30 AM', color: 'text-emerald-400' }
              ]
            }
          ]
        };

      case 'JOB_SEEKER':
        return {
          title: 'Career Dashboard & Jobs Board',
          icon: Briefcase,
          stats: [
            { label: 'Applications Sent', value: '4 Jobs', trend: 'Verified Companies' },
            { label: 'Pre-screened Badges', value: '2 Verified', trend: 'Structural & RERA' },
            { label: 'Interview Invites', value: '1 Request', trend: 'Technical assessment' }
          ],
          widgets: [
            {
              title: 'Your Job Applications',
              items: [
                { primary: 'Lead Civil Structural Engineer - Vanguard Builders', secondary: 'Status updated: CV pre-screen completed by Lead Recruiter.', status: 'Technical Interview Scheduled', color: 'text-emerald-400' },
                { primary: 'Site Operations Supervisor - BuildCorp', secondary: 'Resume forwarded to on-site project management leads.', status: 'Awaiting Assessment', color: 'text-yellow-400' }
              ]
            },
            {
              title: 'Saved Jobs Portfolio',
              items: [
                { primary: 'Senior Project Manager - Elite Heights Group', secondary: 'Salary Package: ₹24,00,000 / Yr. Immediate joining requested.', status: 'Saved July 15th', color: 'text-cyan-400' }
              ]
            },
            {
              title: 'Corporate Assessment Invites',
              items: [
                { primary: 'Vanguard Builders CAD Modeling Test', secondary: 'Interactive structural detailing challenge assigned.', status: 'Assessment Pending', color: 'text-yellow-400' }
              ]
            }
          ]
        };

      default:
        return {
          title: 'Enterprise Dashboard',
          icon: Building2,
          stats: [
            { label: 'B2B Trust Score', value: 'A+ Class', trend: 'KYC Screened' },
            { label: 'Active Channels', value: '6 Streams', trend: 'Real-time Linked' },
            { label: 'Pending Audits', value: 'None', trend: 'Secure' }
          ],
          widgets: [
            {
              title: 'System Access & Authentication Logs',
              items: [
                { primary: 'OAuth Identity Verified', secondary: 'Multi-role context tokens updated under governance rules.', status: 'Active', color: 'text-emerald-400' }
              ]
            }
          ]
        };
    }
  };

  const [currentTime, setCurrentTime] = useState('');
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getBusinessName = (roleId: string) => {
    switch (roleId) {
      case 'BUILDER': return 'Apex Developers Ltd';
      case 'DEVELOPER': return 'Worli Joint Ventures & Land Trust';
      case 'VENDOR': return 'Elite Materials Group';
      case 'CONTRACTOR': return 'BuildCorp Construction & Civil Ltd';
      case 'BROKER': return 'Singhal Premium Real Estate Advisors';
      case 'CHANNEL_PARTNER': return 'MH-RERA Certified Affiliate Alliance';
      case 'DSA': return 'National Trust Mortgage Consultants';
      case 'BANK': return 'National Trust Bank & Syndications';
      case 'NBFC': return 'Elite Structured Mezzanine Debt Corp';
      case 'INSURANCE': return 'Sovereign Risk Mitigation & Liability Co.';
      case 'CONSULTANT': return 'RERA Liaison & Compliance Advisory';
      case 'PROPERTY_MANAGEMENT': return 'Nexus Property Commercial Asset Management';
      case 'FACILITY_MANAGEMENT': return 'Preventive Facility Operations ISO 14001';
      case 'RECRUITER': return 'Talent Acquisition B2B Partners';
      case 'JOB_SEEKER': return 'Professional Structural Design Candidate';
      default: return 'RealtyConnect™ Enterprise Partner';
    }
  };

  const [tasks, setTasks] = useState([
    { id: 't1', text: 'Verify MH-RERA licensure certificate upload', completed: false },
    { id: 't2', text: 'Schedule initial video consult with Apex Developers', completed: false },
    { id: 't3', text: 'Publish premium B2B material catalog items', completed: false },
    { id: 't4', text: 'Audit incoming trade inquiries & lead pipeline', completed: false },
    { id: 't5', text: 'Seal Enterprise Platinum tier validation', completed: false }
  ]);

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
    showToast('Task status updated on Operational Monitor.', 'info');
  };

  const roleConfig = getRoleSpecificContent(activeRole);
  const RoleIcon = roleConfig.icon;

  return (
    <div className="space-y-6 pb-20 animate-fade-in text-slate-100" id="b2b-business-dashboard-container">
      {/* Premium Enterprise Command Center Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-stretch justify-between gap-6 relative z-10">
          {/* Welcome & Corporate Identity */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono px-2.5 py-1 rounded border border-emerald-500/20 uppercase tracking-widest font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Control Center
              </span>
            </div>
            
            <div className="space-y-1">
              <span className="text-xs text-slate-500 block">
                Signed in as {userSession?.email || ''}
              </span>
              <h1 className="font-display font-extrabold text-2xl lg:text-3xl text-slate-100 tracking-tight flex flex-wrap items-center gap-2.5">
                Welcome, <span className="text-emerald-400">{userSession?.name || (userSession?.email ? userSession.email.split('@')[0] : 'Partner')}</span>!
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-slate-300 font-medium">
                <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-md font-semibold text-slate-100">{userSession?.organizationName || getBusinessName(activeRole)}</span>
                <span className="text-xs bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-400 uppercase font-mono font-bold tracking-wider">
                  {activeRole}
                </span>
                {userSession?.reraRegistration && (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    RERA: {userSession.reraRegistration}
                  </span>
                )}
                {userSession?.subscriptionPlan && (
                  <span className="text-[10px] bg-gradient-to-r from-amber-500/10 to-yellow-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                    👑 {userSession.subscriptionPlan}
                  </span>
                )}
              </div>
            </div>

            {/* Live Clock & localized Date */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 font-mono border-t border-slate-900 pt-3">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-bold tracking-widest">{currentTime || '12:00:00 AM'}</span>
              </div>
              <span className="text-slate-700">|</span>
              <div>{formattedDate}</div>
              <span className="text-slate-700">|</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">All systems operational</span>
              </div>
            </div>
          </div>

          {/* Persona Selection & Security Desk Widget */}
          <div className="w-full lg:w-96 flex flex-col justify-between gap-4 bg-slate-900/40 border border-slate-800 p-4.5 rounded-xl shadow-inner shrink-0">
            {/* Persona Switcher */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                Stakeholder Persona Workspace
              </label>
              <select
                id="stakeholder-role-dashboard-selector"
                value={activeRole}
                onChange={(e) => {
                  setActiveRole(e.target.value);
                  showToast(`Command Center customized for ${e.target.value}!`, 'info');
                  onLogTriggered('B2B_DASHBOARD_ROLE_PREVIEW_SWITCHED', 'dashboards', e.target.value, 'SUCCESS', `Swapped live dashboard preview template to specialized role: ${e.target.value}`);
                }}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-emerald-500 transition-all cursor-pointer font-mono font-bold"
              >
                {DASHBOARD_PREVIEW_ROLES.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name} ({role.sector})
                  </option>
                ))}
              </select>
            </div>

            {/* Profile Completion & Trust Credentials */}
            <div className="space-y-2 border-t border-slate-900 pt-3 text-xs">
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="text-slate-400 uppercase font-bold">Profile Strength</span>
                <span className="text-emerald-400 font-extrabold">{profileStrength}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" 
                  style={{ width: `${profileStrength}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-1 font-mono text-[9px] gap-2">
                <span className="text-slate-500 uppercase">Trust Credentials</span>
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded font-bold border ${
                    verificationStatus.includes('VERIFIED') 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                  }`}>
                    {verificationStatus}
                  </span>
                  <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-bold uppercase">
                    {membershipStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 8-Metric Enterprise KPI Command Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Metric 1: Connections */}
        <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-xl flex flex-col justify-between hover:border-indigo-500/30 hover:scale-[1.02] transition-all duration-300 shadow-sm group">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">Connections</span>
            <Users className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2">
            <span className="font-mono font-bold text-lg text-slate-100">{connections.length}</span>
            <span className="text-[9px] text-slate-400 block font-sans">Active Handshakes</span>
          </div>
        </div>

        {/* Metric 2: Listings */}
        <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-xl flex flex-col justify-between hover:border-emerald-500/30 hover:scale-[1.02] transition-all duration-300 shadow-sm group">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">Products SKUs</span>
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2">
            <span className="font-mono font-bold text-lg text-slate-100">{localMktListings.length}</span>
            <span className="text-[9px] text-slate-400 block font-sans">Listed in Catalog</span>
          </div>
        </div>

        {/* Metric 3: Opportunities */}
        <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-xl flex flex-col justify-between hover:border-blue-500/30 hover:scale-[1.02] transition-all duration-300 shadow-sm group">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">Trade Opps</span>
            <Briefcase className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2">
            <span className="font-mono font-bold text-lg text-slate-100">22</span>
            <span className="text-[9px] text-emerald-400 block font-mono font-bold uppercase tracking-tight">+5 New Today</span>
          </div>
        </div>

        {/* Metric 4: RFQs */}
        <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-xl flex flex-col justify-between hover:border-cyan-400/30 hover:scale-[1.02] transition-all duration-300 shadow-sm group">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">Open RFQs</span>
            <FileText className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2">
            <span className="font-mono font-bold text-lg text-slate-100">{rfqList.length}</span>
            <span className="text-[9px] text-slate-400 block font-sans">Active Tenders</span>
          </div>
        </div>

        {/* Metric 5: Direct Enquiries */}
        <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-xl flex flex-col justify-between hover:border-amber-500/30 hover:scale-[1.02] transition-all duration-300 shadow-sm group">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">Direct Enq</span>
            <MessageSquare className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2">
            <span className="font-mono font-bold text-lg text-slate-100">{enquiries.length}</span>
            <span className="text-[9px] text-slate-400 block font-sans">B2B Proposals</span>
          </div>
        </div>

        {/* Metric 6: Product Enquiries */}
        <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-xl flex flex-col justify-between hover:border-emerald-500/30 hover:scale-[1.02] transition-all duration-300 shadow-sm group">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">Market Enq</span>
            <Plus className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2">
            <span className="font-mono font-bold text-lg text-slate-100">{localMktEnquiries.length}</span>
            <span className="text-[9px] text-slate-400 block font-sans">Buyer Responses</span>
          </div>
        </div>

        {/* Metric 7: Views */}
        <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-xl flex flex-col justify-between hover:border-purple-500/30 hover:scale-[1.02] transition-all duration-300 shadow-sm group">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">Catalog Views</span>
            <TrendingUp className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2">
            <span className="font-mono font-bold text-lg text-slate-100">
              {localMktListings.length > 0 ? (localMktListings.length * 12 + 45) : 0}
            </span>
            <span className="text-[9px] text-emerald-400 block font-mono font-bold uppercase tracking-tight">+12.4%</span>
          </div>
        </div>

        {/* Metric 8: Saved Businesses */}
        <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-xl flex flex-col justify-between hover:border-red-500/30 hover:scale-[1.02] transition-all duration-300 shadow-sm group">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">Bookmarks</span>
            <Heart className="w-3.5 h-3.5 text-red-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2">
            <span className="font-mono font-bold text-lg text-slate-100">
              {savedBusinesses.length + favoriteCompanies.length}
            </span>
            <span className="text-[9px] text-slate-400 block font-sans">Saved Registry</span>
          </div>
        </div>
      </div>

      {/* Grid: Main Column (Role Widgets, Actions) & Sidebar (Common Stats & Lists) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Quick Actions Grid Panel */}
          <div className="bg-slate-900/10 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-900">
              <h3 className="font-display font-semibold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Quick Operations Desk
              </h3>
              <span className="text-[10px] font-mono text-slate-500">7 Immediate Dispatchers</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
              <button
                type="button"
                id="action-complete-profile"
                onClick={handleCompleteProfile}
                disabled={profileStrength === 100}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/60 border border-slate-850 hover:border-emerald-500/40 text-center transition-all group disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-200">Complete Profile</span>
              </button>

              <button
                type="button"
                id="action-publish-update"
                onClick={() => setActiveModal('publish')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/60 border border-slate-850 hover:border-emerald-500/40 text-center transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-200">Publish Update</span>
              </button>

              <button
                type="button"
                id="action-search-businesses"
                onClick={() => setActiveViewMode('directory')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/60 border border-slate-850 hover:border-emerald-500/40 text-center transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Search className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-200">Search Directory</span>
              </button>

              <button
                type="button"
                id="action-create-enquiry"
                onClick={() => setActiveModal('enquiry')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/60 border border-slate-850 hover:border-emerald-500/40 text-center transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-200">Create Enquiry</span>
              </button>

              <button
                type="button"
                id="action-schedule-meeting"
                onClick={() => setActiveModal('meeting')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/60 border border-slate-850 hover:border-emerald-500/40 text-center transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-200">Schedule Meeting</span>
              </button>

              <button
                type="button"
                id="action-manage-team"
                onClick={() => setActiveModal('team')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/60 border border-slate-850 hover:border-emerald-500/40 text-center transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-200">Manage Team</span>
              </button>

              <button
                type="button"
                id="action-upgrade-membership"
                onClick={() => setActiveModal('upgrade')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/60 border border-slate-850 hover:border-emerald-500/40 text-center transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-yellow-500/10 text-yellow-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Award className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-200">Upgrade Plan</span>
              </button>
            </div>
          </div>

          {/* Today's Priorities & Action checklists (Part 2) */}
          {dashboardWidgets.priorities && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm" id="dashboard-priorities-desk">
              <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-display font-semibold text-xs text-slate-200 uppercase tracking-wider">
                    Today's Enterprise Priorities
                  </h3>
                </div>
                <span className="text-[9px] font-mono text-slate-500 uppercase">
                  {priorities.filter(p => !p.done).length} active items
                </span>
              </div>

              {/* Add Priority Form */}
              <form onSubmit={handleAddPriority} className="flex flex-wrap gap-2 bg-slate-950/60 p-2 rounded-xl border border-slate-850">
                <input
                  type="text"
                  placeholder="Type an urgent operational priority..."
                  value={newPriorityText}
                  onChange={(e) => setNewPriorityText(e.target.value)}
                  className="flex-1 min-w-[10rem] bg-transparent text-xs text-slate-200 outline-none placeholder:text-slate-650 px-2"
                />
                <select
                  value={newPriorityCat}
                  onChange={(e) => setNewPriorityCat(e.target.value)}
                  className="bg-slate-900 text-[10px] text-slate-400 font-mono rounded border border-slate-800 px-1 outline-none cursor-pointer"
                >
                  <option value="Compliance">Compliance</option>
                  <option value="Procurement">Procurement</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Technical">Technical</option>
                </select>
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  Add
                </button>
              </form>

              {/* Priorities List */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {priorities.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                      item.done
                        ? 'bg-slate-950/20 border-slate-900/40 text-slate-500 line-through'
                        : 'bg-slate-950/40 border-slate-850 text-slate-200 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleTogglePriority(item.id)}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer ${
                          item.done ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700 hover:border-emerald-500/50'
                        }`}
                      >
                        {item.done && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                      <span className="text-xs text-left flex-1">{item.text}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        item.category === 'Compliance' ? 'bg-indigo-500/10 text-indigo-400' :
                        item.category === 'Procurement' ? 'bg-emerald-500/10 text-emerald-400' :
                        item.category === 'Finance' ? 'bg-amber-500/10 text-amber-400' :
                        item.category === 'Marketing' ? 'bg-pink-500/10 text-pink-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.category}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeletePriority(item.id)}
                        className="text-slate-500 hover:text-red-400 text-xs p-1 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Tasks Role Checklist (Part 2) */}
          {dashboardWidgets.checklist && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm" id="dashboard-checklist-desk">
              <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-display font-semibold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    Operational Checklist: <span className="text-emerald-400 normal-case">{activeRole} Workspace</span>
                  </h3>
                </div>
                <span className="text-[9px] font-mono text-slate-500 uppercase">
                  {checklists.filter(c => c.done).length}/{checklists.length} Done
                </span>
              </div>

              {/* Add Task Checklist */}
              <form onSubmit={handleAddChecklist} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add custom workspace task item..."
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-850 rounded-lg text-xs text-slate-200 px-3 py-1.5 outline-none placeholder:text-slate-650 focus:border-emerald-500/50"
                />
                <button
                  type="submit"
                  className="bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Add Item
                </button>
              </form>

              {/* Checklist list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {checklists.map((c) => (
                  <div
                    key={c.id}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                      c.done ? 'bg-slate-950/20 border-slate-900/40 text-slate-500 line-through' : 'bg-slate-950/40 border-slate-850 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleToggleChecklist(c.id)}
                        className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all cursor-pointer ${
                          c.done ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700 hover:border-emerald-500/50'
                        }`}
                      >
                        {c.done && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </button>
                      <span className="text-xs truncate max-w-[180px]">{c.text}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteChecklist(c.id)}
                      className="text-slate-600 hover:text-red-400 p-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grouped Notifications by Category (Part 3) */}
          {dashboardWidgets.notifications && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm" id="dashboard-grouped-notifications-desk">
              <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <h3 className="font-display font-semibold text-xs text-slate-200 uppercase tracking-wider">
                    Categorized Notifications Hub
                  </h3>
                </div>
                <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                  {categorizedNotifications.filter(n => n.unread).length} Unread Alerts
                </span>
              </div>

              {/* Pills Navigation */}
              <div className="flex flex-wrap gap-1 border-b border-slate-900 pb-2">
                {(['CRM', 'Projects', 'Marketplace', 'Meetings', 'Finance', 'HR', 'Documents', 'System'] as const).map((tab) => {
                  const count = categorizedNotifications.filter(n => n.category === tab && n.unread).length;
                  const active = activeNotificationTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveNotificationTab(tab)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all relative flex items-center gap-1.5 cursor-pointer ${
                        active
                          ? 'bg-slate-800 text-white border border-slate-700'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>{tab}</span>
                      {count > 0 && (
                        <span className="bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full leading-none">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Categorized list */}
              <div className="space-y-1.5">
                {categorizedNotifications.filter(n => n.category === activeNotificationTab).length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    No active messages or audits inside {activeNotificationTab} category.
                  </div>
                ) : (
                  categorizedNotifications
                    .filter(n => n.category === activeNotificationTab)
                    .map((noti) => (
                      <div
                        key={noti.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          noti.unread ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-950/20 border-slate-900 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {noti.unread && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />}
                          <span className="text-xs text-left">{noti.text}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-4">
                          <span className="text-[10px] text-slate-500 font-mono">{noti.time}</span>
                          {noti.unread && (
                            <button
                              type="button"
                              onClick={() => handleMarkGroupedRead(noti.id)}
                              className="text-[9px] text-emerald-400 hover:underline cursor-pointer"
                            >
                              Mark Read
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleArchiveNotification(noti.id)}
                            className="text-[9px] text-slate-500 hover:text-slate-300 cursor-pointer"
                          >
                            Archive
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* Daily Activities & Operational Monitor */}
          <div className="bg-gradient-to-b from-slate-900/60 to-slate-900/20 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-850">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <h3 className="font-display font-bold text-sm text-slate-100 uppercase tracking-wider">
                  Daily Activities & Operational Monitor
                </h3>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Secure Telemetry Green
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Side: Upcoming Meetings */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    Upcoming Corporate Meetings
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded">
                    {meetings.length} Scheduled
                  </span>
                </div>

                {meetings.length === 0 ? (
                  <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 text-center">
                    <p className="text-xs text-slate-500 leading-relaxed">
                      No upcoming corporate video cabins scheduled today. Use the B2B Directory to arrange a meeting with certified developers, vendors, or DSA partners.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {meetings.slice(0, 3).map((meeting, idx) => (
                      <div key={meeting.id || idx} className="bg-slate-950/60 border border-slate-850/60 hover:border-slate-800 p-3 rounded-xl transition-all flex items-center justify-between gap-3 group">
                        <div className="space-y-1 min-w-0">
                          <p className="text-xs font-bold text-slate-200 truncate group-hover:text-emerald-400 transition-colors">
                            {meeting.title}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                            <span className="truncate">{meeting.businessName || 'B2B Partner'}</span>
                            <span>•</span>
                            <span className="shrink-0">{meeting.time}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            showToast(`Launching B2B Virtual Cabin for "${meeting.title}"...`, 'success');
                            onLogTriggered('B2B_MEETING_LAUNCHED', 'meetings', meeting.id, 'SUCCESS', `Initiated secure WebRTC consulting corridor for topic: ${meeting.title}`);
                          }}
                          className="shrink-0 px-2.5 py-1.5 bg-slate-900 hover:bg-emerald-500 hover:text-slate-950 border border-slate-800 hover:border-emerald-400 rounded-lg text-[10px] font-bold font-mono transition-all text-emerald-400 shadow-sm"
                        >
                          Launch Cabin
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Side: Closing Bids & Compliance Alerts */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Critical Trade Deadlines & Audits
                </h4>

                <div className="space-y-2.5">
                  {/* Deadline 1 */}
                  <div className="bg-slate-950/60 border border-slate-850/60 p-3 rounded-xl flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-slate-200">Fe550D Reinforcement Steel Bid</p>
                        <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded shrink-0 uppercase">3 Days Left</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Bureau Veritas compliance certificate and raw mill analysis must accompany digital RFQ quotation submission.
                      </p>
                    </div>
                  </div>

                  {/* Deadline 2 */}
                  <div className="bg-slate-950/60 border border-slate-850/60 p-3 rounded-xl flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-slate-200">Regulatory MH-RERA Licensure Audit</p>
                        <span className="text-[9px] font-mono font-bold text-red-400 bg-red-500/10 px-1.5 py-0.2 rounded shrink-0 uppercase">Action Due</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        License MH-RERA-P5180020 renewal filing is due in 45 days. Fully complete your corporate KYC bio to ensure continuous platform verification.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Centralized Lead Pipeline Intelligence Widget */}
          <div className="bg-gradient-to-b from-slate-900/60 to-slate-900/20 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-md text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-850">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-indigo-400" />
                <h3 className="font-display font-bold text-sm text-slate-100 uppercase tracking-wider">
                  Lead & Pipeline Intelligence Center
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveViewMode('lead_management')}
                className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded border border-indigo-500/20 transition-all font-bold"
              >
                Launch Lead Command Center
                <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400" />
              </button>
            </div>

            {/* Pipeline Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
              {/* Stat 1: Total & New */}
              <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3.5">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block tracking-wider mb-1">Lead Capture</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-mono font-bold text-slate-100">{dashboardLeads.length}</span>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded font-bold">
                    +{dashboardLeads.filter(l => l.status === 'New').length} New
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 block mt-1">Total Pipeline Depth</span>
              </div>

              {/* Stat 2: Follow-ups */}
              <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3.5">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block tracking-wider mb-1">Today's Agenda</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-mono font-bold text-slate-100">
                    {dashboardLeads.filter(l => l.followUps && l.followUps.some(f => f.nextFollowUpDate && new Date(f.nextFollowUpDate).toLocaleDateString() === new Date().toLocaleDateString())).length}
                  </span>
                  <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded font-bold">
                    {dashboardLeads.filter(l => l.followUps && l.followUps.some(f => f.nextFollowUpDate && new Date(f.nextFollowUpDate) < new Date() && l.status !== 'Converted' && l.status !== 'Closed')).length} Overdue
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 block mt-1">Follow-ups Active</span>
              </div>

              {/* Stat 3: Conversion */}
              <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3.5">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block tracking-wider mb-1">Conversion Ratio</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-mono font-bold text-emerald-400">
                    {dashboardLeads.length > 0 ? Math.round((dashboardLeads.filter(l => l.status === 'Converted' || l.status === 'Won').length / dashboardLeads.length) * 100) : 0}%
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-bold">
                    Target: 25%
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 block mt-1">Won vs. Total Captured</span>
              </div>

              {/* Stat 4: Closed States */}
              <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3.5">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block tracking-wider mb-1">Closed Pipeline</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-mono font-bold text-slate-300">
                    {dashboardLeads.filter(l => l.status === 'Converted' || l.status === 'Closed' || l.status === 'Lost' || l.status === 'Cancelled').length}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.2 rounded">
                    {dashboardLeads.filter(l => l.status === 'Lost').length} Lost
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 block mt-1">Outcome Handled</span>
              </div>
            </div>

            {/* Source Breakdown & Recent Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-900">
              {/* Left Column: Source Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Lead Sourcing Engine Breakdown
                  </h4>
                  <span className="text-[9px] font-mono text-slate-500">4 Integrated Channels</span>
                </div>

                <div className="space-y-2.5 bg-slate-950/40 p-3.5 rounded-xl border border-slate-900">
                  {['Marketplace', 'RFQ', 'Networking', 'Opportunities'].map(source => {
                    const count = dashboardLeads.filter(l => l.source === source).length;
                    const pct = dashboardLeads.length > 0 ? Math.round((count / dashboardLeads.length) * 100) : 0;
                    const colorMap: any = {
                      Marketplace: 'bg-emerald-500',
                      RFQ: 'bg-cyan-500',
                      Networking: 'bg-indigo-500',
                      Opportunities: 'bg-blue-500'
                    };
                    return (
                      <div key={source} className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-slate-400">{source} Channel</span>
                          <span className="text-slate-200 font-bold">{count} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${colorMap[source] || 'bg-slate-500'} rounded-full`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Recent Activity Feed */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Pipeline Active Enquiries
                  </h4>
                  <span className="text-[9px] font-mono text-slate-500">3 Latest Hooks</span>
                </div>

                <div className="space-y-2">
                  {dashboardLeads.slice(0, 3).map((lead, idx) => (
                    <div
                      key={lead.id || idx}
                      onClick={() => setActiveViewMode('lead_management')}
                      className="bg-slate-950/60 border border-slate-900 hover:border-slate-800 p-2.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all hover:scale-[1.01] group"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[11px] font-bold text-slate-200 truncate group-hover:text-indigo-400 transition-colors">
                            {lead.title}
                          </p>
                          <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800 uppercase">
                            {lead.source}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-400 truncate">{lead.company}</p>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5">
                        <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded border ${
                          lead.status === 'New' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          lead.status === 'Converted' || lead.status === 'Won' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          'bg-slate-900 text-slate-400 border-slate-800'
                        }`}>
                          {lead.status}
                        </span>
                        <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                      </div>
                    </div>
                  ))}
                  {dashboardLeads.length === 0 && (
                    <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-5 text-center">
                      <p className="text-[10px] text-slate-500 italic">No enquiries captured yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Role-Specific Dashboard Panels with toggle */}
          <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <RoleIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-md text-slate-100 flex items-center gap-1.5">
                    {roleConfig.title}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-mono">Role-Specific Action Widgets</p>
                </div>
              </div>

              <button
                onClick={() => toggleCollapsible('roleSpecificWidgets')}
                className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                id="btn-toggle-role-widgets"
              >
                {collapsibles.roleSpecificWidgets ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {collapsibles.roleSpecificWidgets && (
              <div className="space-y-6 animate-slide-in">
                {/* Role Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {roleConfig.stats.map((st, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between hover:border-slate-800 transition-colors">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">{st.label}</span>
                      <span className="font-display font-bold text-xl text-slate-200 mt-2 block">{st.value}</span>
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10 self-start mt-2">
                        {st.trend}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Role Specific Widgets Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roleConfig.widgets.map((widget, widIdx) => (
                    <div key={widIdx} className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-3">
                      <h4 className="font-display font-semibold text-xs text-slate-300 uppercase tracking-wide border-b border-slate-900 pb-2 flex items-center justify-between">
                        <span>{widget.title}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      </h4>

                      <div className="space-y-2.5">
                        {widget.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="text-xs p-2.5 rounded-lg bg-slate-950/80 border border-slate-900 hover:border-slate-850 transition-colors space-y-1">
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-semibold text-slate-200">{item.primary}</span>
                              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-900 ${item.color} border border-slate-800 shrink-0`}>
                                {item.status}
                              </span>
                            </div>
                            <p className="text-slate-400 text-[11px] leading-relaxed">{item.secondary}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* B2B Opportunities Exchanger Integration Widget */}
          <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-900 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Briefcase className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-sm text-slate-100 flex items-center gap-1.5">
                    B2B Opportunities Exchanger
                  </h2>
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Integrated Exchange & Handshake Logs</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onTriggerCreateOpportunity) {
                      onTriggerCreateOpportunity();
                    } else {
                      setActiveViewMode('opportunities');
                    }
                  }}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Publish Opportunity</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveViewMode('opportunities')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 active:scale-95 text-slate-300 font-bold text-[11px] rounded-lg transition-all border border-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore Exchange</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Opportunities Exchanger KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between hover:border-slate-800 transition-colors">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Open Opportunities</span>
                <span className="font-display font-bold text-lg text-slate-200 mt-1 block">22 Active</span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10 self-start mt-2">
                  5 New Today
                </span>
              </div>
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between hover:border-slate-800 transition-colors">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">My Handshakes</span>
                <span className="font-display font-bold text-lg text-slate-200 mt-1 block">4 Bids Filed</span>
                <span className="text-[9px] font-mono text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded-full border border-blue-500/10 self-start mt-2">
                  1 Response Pending
                </span>
              </div>
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between hover:border-slate-800 transition-colors">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Under Review</span>
                <span className="font-display font-bold text-lg text-slate-200 mt-1 block">2 Handshakes</span>
                <span className="text-[9px] font-mono text-yellow-400 bg-yellow-500/5 px-2 py-0.5 rounded-full border border-yellow-500/10 self-start mt-2">
                  KYC Verification
                </span>
              </div>
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between hover:border-slate-800 transition-colors">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Saved Drawers</span>
                <span className="font-display font-bold text-lg text-slate-200 mt-1 block">6 Bookmarks</span>
                <span className="text-[9px] font-mono text-purple-400 bg-purple-500/5 px-2 py-0.5 rounded-full border border-purple-500/10 self-start mt-2">
                  Synchronized
                </span>
              </div>
            </div>

            {/* Quick Recommended Opportunities inside Dashboard */}
            <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-900">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Recommended Trade Requirements for You</span>
                <span className="text-[9px] text-slate-500 font-normal">Matching Category: {userSession?.role || 'Builder'}</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div 
                  onClick={() => setActiveViewMode('opportunities')}
                  className="p-3 bg-slate-950 border border-slate-900 hover:border-slate-855 rounded-xl cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex justify-between items-center text-[9px] font-mono">
                    <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-semibold uppercase">Featured</span>
                    <span className="text-slate-500">Bandra BKC, Mumbai</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-200 leading-snug line-clamp-1">Procurement of 8,500 MT of High-Strength TMT Reinforcement Steel</h5>
                  <p className="text-[10px] text-slate-500 line-clamp-1">Published by: Apex Developers Ltd • Material Requirement</p>
                </div>

                <div 
                  onClick={() => setActiveViewMode('opportunities')}
                  className="p-3 bg-slate-950 border border-slate-900 hover:border-slate-855 rounded-xl cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex justify-between items-center text-[9px] font-mono">
                    <span className="text-red-400 bg-red-500/10 px-1.5 py-0.2 rounded font-semibold uppercase">Urgent</span>
                    <span className="text-slate-500">Whitefield, Bangalore</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-200 leading-snug line-clamp-1">Underground Concrete Shoring and Piling Work Subcontract</h5>
                  <p className="text-[10px] text-slate-500 line-clamp-1">Published by: BuildCorp Construction • Subcontract Requirement</p>
                </div>
              </div>
            </div>
          </div>

          {/* B2B RFQ & TENDERS INTEGRATION BOARD */}
          <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 space-y-6 shadow-sm" id="b2b-rfq-tenders-board">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-900 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <FileText className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-sm text-slate-100 flex items-center gap-1.5">
                    B2B RFQ & Tenders Board
                  </h2>
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Quotations, Commercial Submissions & Closing Timelines</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveViewMode('rfq_management');
                    showToast('Opening RFQ Creator Workspace...', 'info');
                  }}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Publish RFQ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveViewMode('rfq_management')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 active:scale-95 text-slate-300 font-bold text-[11px] rounded-lg transition-all border border-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore RFQ Directory</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* RFQ and Quotation KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between hover:border-slate-800 transition-colors">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Active RFQs</span>
                <span className="font-display font-bold text-lg text-slate-200 mt-1 block">{rfqList.length} Open</span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10 self-start mt-2">
                  System Live
                </span>
              </div>
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between hover:border-slate-800 transition-colors">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Submitted Bids</span>
                <span className="font-display font-bold text-lg text-slate-200 mt-1 block">{quotationList.length} Proposals</span>
                <span className="text-[9px] font-mono text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded-full border border-blue-500/10 self-start mt-2">
                  1 Under Review
                </span>
              </div>
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between hover:border-slate-800 transition-colors">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Closing Soon</span>
                <span className="font-display font-bold text-lg text-slate-200 mt-1 block">2 Gateways</span>
                <span className="text-[9px] font-mono text-red-400 bg-red-500/5 px-2 py-0.5 rounded-full border border-red-500/10 self-start mt-2">
                  Action Required
                </span>
              </div>
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between hover:border-slate-800 transition-colors">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Pending Responses</span>
                <span className="font-display font-bold text-lg text-slate-200 mt-1 block">0 Unread</span>
                <span className="text-[9px] font-mono text-purple-400 bg-purple-500/5 px-2 py-0.5 rounded-full border border-purple-500/10 self-start mt-2">
                  Fully Synced
                </span>
              </div>
            </div>

            {/* List of active system RFQs */}
            <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-900">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Active Commercial RFQs Directory Preview</span>
                <span className="text-[9px] text-emerald-400 font-semibold">RERA Compliant</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {rfqList.slice(0, 2).map((rfq) => (
                  <div 
                    key={rfq.id}
                    onClick={() => setActiveViewMode('rfq_management')}
                    className="p-3.5 bg-slate-950 border border-slate-900 hover:border-slate-800 rounded-xl cursor-pointer transition-all space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[9px] font-mono">
                        <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-semibold uppercase">{rfq.type}</span>
                        <span className="text-slate-500">{rfq.location}</span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-200 leading-snug line-clamp-2">{rfq.title}</h5>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono pt-1.5 border-t border-slate-900">
                      <span className="text-slate-400">Budget: <strong className="text-emerald-400 font-bold">{rfq.budget}</strong></span>
                      <span className="text-slate-500">Close: <strong className="text-red-400 font-bold">{rfq.closingDate}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* B2B Marketplace Integration Board */}
          <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-900">
              <div className="space-y-1">
                <h3 className="font-display font-semibold text-xs text-slate-200 uppercase tracking-wide flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  B2B Marketplace Integration Board
                </h3>
                <p className="text-[11px] text-slate-400">
                  Track cataloged inventory, verified buyer enquiries, and bookmark metrics.
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveViewMode('marketplace');
                  onLogTriggered('DASHBOARD_GO_TO_MARKETPLACE', 'navigation', 'b2b_marketplace', 'SUCCESS', 'Swapped view from dashboard to B2B Marketplace.');
                }}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all self-start"
              >
                <span>Enter Marketplace</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Marketplace KPI Mini Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-1 hover:border-slate-800 transition-colors">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">My Products</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-white">{localMktListings.length}</span>
                  <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase">Active</span>
                </div>
              </div>
              
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-1 hover:border-slate-800 transition-colors">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Recent Enquiries</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-emerald-400">{localMktEnquiries.length}</span>
                  <span className="text-[9px] font-mono text-slate-500">Received</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-1 hover:border-slate-800 transition-colors">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Product Views</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-white">
                    {localMktListings.length > 0 ? (localMktListings.length * 12 + 45) : 0}
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase font-sans">+12%</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-1 hover:border-slate-800 transition-colors">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Saved Items</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-white">{localMktSaved.length}</span>
                  <span className="text-[9px] font-mono text-slate-500">Bookmarked</span>
                </div>
              </div>
            </div>

            {/* Recent Marketplace Enquiries Section */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Recent Direct B2B Enquiries
              </h4>

              {localMktEnquiries.length === 0 ? (
                <div className="bg-slate-950/40 border border-slate-900 p-6 rounded-xl text-center space-y-2">
                  <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                    No active product enquiries received yet. Try listing high-volume items in the B2B Marketplace to attract verified buyers.
                  </p>
                  <button
                    onClick={() => {
                      setActiveViewMode('marketplace');
                      onLogTriggered('DASHBOARD_CATALOG_TRIGGERED', 'navigation', 'b2b_marketplace', 'SUCCESS', 'Swapped to B2B Marketplace via catalog empty state call-to-action.');
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[10px] font-bold font-mono px-3 py-1.5 rounded transition-all inline-flex items-center gap-1.5"
                  >
                    <span>Catalog Your First Product</span>
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                  {localMktEnquiries.slice().reverse().slice(0, 5).map((enq) => (
                    <div 
                      key={enq.id} 
                      className="bg-slate-950 border border-slate-900 p-3.5 rounded-xl hover:border-slate-800 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 text-left"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-slate-400">{enq.id}</span>
                          <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-1.5 rounded uppercase">
                            {enq.type || 'BUYER ENQUIRY'}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-white leading-tight">
                          Enquiry for: <span className="text-emerald-400">{enq.productTitle}</span>
                        </h5>
                        <div className="text-[11px] text-slate-400 italic">
                          "{enq.message}"
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                          <span>Sourced from: <strong>{enq.buyerCompany || 'Verified Developer'}</strong></span>
                          <span>•</span>
                          <span>By: {enq.sender}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start md:self-center">
                        <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                          {enq.status || 'Active Call'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Interactive Activities Tab Container */}
          <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 space-y-6 shadow-sm">
            
            {/* Recent Connections Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                <h3 className="font-display font-semibold text-xs text-slate-200 uppercase tracking-wide flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  Recent Connections Handshakes ({connections.length})
                </h3>
                <button
                  onClick={() => toggleCollapsible('recentConnections')}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                  id="btn-toggle-connections"
                >
                  {collapsibles.recentConnections ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {collapsibles.recentConnections && (
                <div className="space-y-2">
                  {connections.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2">No active business connections yet.</p>
                  ) : (
                    connections.slice(0, 3).map(conn => (
                      <div key={conn.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between hover:border-slate-800 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${conn.logoBg || 'bg-slate-800'} flex items-center justify-center text-slate-100 font-mono font-bold text-xs`}>
                            {conn.businessName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h5 className="font-bold text-xs text-slate-200 hover:text-emerald-400 cursor-pointer" onClick={() => onViewBusinessProfile(conn.businessId)}>
                                {conn.businessName}
                              </h5>
                              <span className="text-[9px] bg-slate-900 text-slate-400 px-1.5 py-0.2 rounded border border-slate-800">
                                {conn.businessCategory}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{conn.purpose || 'General business liaison alignment'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase">
                            {conn.status}
                          </span>
                          <button
                            type="button"
                            onClick={() => onViewBusinessProfile(conn.businessId)}
                            className="p-1 bg-slate-900 hover:bg-slate-850 rounded border border-slate-800 text-slate-400 hover:text-white"
                            title="View Profile Portfolio"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Recent Enquiries Tracker */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                <h3 className="font-display font-semibold text-xs text-slate-200 uppercase tracking-wide flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  Recent Business Enquiries ({enquiries.length})
                </h3>
                <button
                  onClick={() => toggleCollapsible('recentEnquiries')}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                  id="btn-toggle-enquiries"
                >
                  {collapsibles.recentEnquiries ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {collapsibles.recentEnquiries && (
                <div className="space-y-2">
                  {enquiries.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2">No active business inquiries registered.</p>
                  ) : (
                    enquiries.slice(0, 3).map(enq => (
                      <div key={enq.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-2 hover:border-slate-800 transition-colors">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200">{enq.subject}</span>
                            <span className="text-[9px] bg-indigo-500/10 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-500/15 font-mono">
                              {enq.category}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">{enq.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{enq.message}</p>
                        
                        {enq.reply && (
                          <div className="p-2.5 bg-slate-950/60 border-l-2 border-emerald-500 rounded text-[11px] text-slate-300 space-y-1">
                            <div className="flex items-center justify-between font-mono text-[9px] text-slate-500 font-bold uppercase">
                              <span>Instant Callback Dispatch</span>
                              <span className="text-emerald-400">Status: Autocallback</span>
                            </div>
                            <p className="italic line-clamp-2">{enq.reply}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Upcoming Enterprise Sourcing Meetings & Calendars */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                <h3 className="font-display font-semibold text-xs text-slate-200 uppercase tracking-wide flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  Enterprise Meetings & Calendar Hub ({enterpriseMeetings.length})
                </h3>
                <button
                  onClick={() => setActiveViewMode('meetings' as any)}
                  className="text-indigo-400 hover:text-indigo-300 text-[10px] font-mono flex items-center gap-1 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 hover:border-indigo-500/50 transition-all font-bold"
                >
                  Manage Hub <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-slate-950/60 p-2 border border-slate-900 rounded-xl text-center">
                  <span className="block text-[8px] font-mono uppercase text-slate-500">Today</span>
                  <span className="text-sm font-bold text-slate-200">
                    {enterpriseMeetings.filter(m => m.meetingDate === new Date().toISOString().split('T')[0]).length}
                  </span>
                </div>
                <div className="bg-slate-950/60 p-2 border border-slate-900 rounded-xl text-center">
                  <span className="block text-[8px] font-mono uppercase text-slate-500">Upcoming</span>
                  <span className="text-sm font-bold text-slate-200">
                    {enterpriseMeetings.filter(m => m.status === 'Scheduled').length}
                  </span>
                </div>
                <div className="bg-slate-950/60 p-2 border border-slate-900 rounded-xl text-center">
                  <span className="block text-[8px] font-mono uppercase text-slate-500">Completed</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {enterpriseMeetings.filter(m => m.status === 'Completed').length}
                  </span>
                </div>
                <div className="bg-slate-950/60 p-2 border border-slate-900 rounded-xl text-center">
                  <span className="block text-[8px] font-mono uppercase text-slate-500">Cancelled</span>
                  <span className="text-sm font-bold text-rose-400">
                    {enterpriseMeetings.filter(m => m.status === 'Cancelled').length}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {enterpriseMeetings.length === 0 ? (
                  <div className="p-4 bg-slate-950/50 border border-slate-900/60 rounded-xl text-center">
                    <p className="text-xs text-slate-500 italic">No enterprise meetings scheduled yet.</p>
                    <button
                      onClick={() => setActiveViewMode('meetings' as any)}
                      className="mt-2 text-[10px] font-mono text-indigo-400 hover:underline"
                    >
                      + Schedule Sourcing Call
                    </button>
                  </div>
                ) : (
                  enterpriseMeetings.slice(0, 3).map(meet => (
                    <div 
                      key={meet.id} 
                      onClick={() => setActiveViewMode('meetings' as any)}
                      className="p-3 bg-slate-950 border border-slate-900 hover:border-slate-800 rounded-xl flex items-center justify-between cursor-pointer group transition-all duration-200 hover:bg-slate-900/10"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          meet.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                          meet.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-400' :
                          'bg-indigo-500/10 text-indigo-400'
                        }`}>
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-bold text-xs text-slate-200 truncate group-hover:text-indigo-400 transition-colors">
                            {meet.title}
                          </h5>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                            With <span className="text-slate-300 font-bold">{meet.relatedCompany}</span> • {meet.meetingType}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-3">
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border block mb-1 ${
                          meet.status === 'Completed' ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/15' :
                          meet.status === 'Cancelled' ? 'text-rose-400 bg-rose-500/5 border-rose-500/15' :
                          'text-indigo-400 bg-indigo-500/5 border-indigo-500/15'
                        }`}>
                          {meet.meetingDate}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500 block">
                          {meet.startTime} - {meet.endTime}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Sidebar Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Business Insights & Growth Metrics Panel */}
          <div className="bg-gradient-to-b from-slate-900/60 to-slate-900/20 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-md">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-850">
              <h4 className="font-display font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Business Insights & Analytics
              </h4>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Realtime</span>
            </div>

            {/* Engagement Score Radial Dial & Text */}
            <div className="flex items-center gap-4 bg-slate-950/50 border border-slate-900 p-4 rounded-xl">
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                {/* Custom circular SVG dial */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle 
                    cx="40" 
                    cy="40" 
                    r="34" 
                    className="stroke-slate-850" 
                    strokeWidth="6" 
                    fill="transparent" 
                  />
                  <circle 
                    cx="40" 
                    cy="40" 
                    r="34" 
                    className="stroke-emerald-400 transition-all duration-1000 ease-out" 
                    strokeWidth="6" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 34} 
                    strokeDashoffset={2 * Math.PI * 34 - (92 / 100) * (2 * Math.PI * 34)} 
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-mono font-extrabold text-sm text-slate-100">92</span>
                  <span className="text-[7px] text-slate-500 uppercase font-mono font-bold">Score</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-200">B2B Engagement Level</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Your profile ranks in the <strong className="text-emerald-400">top 5%</strong> of active industry channels in your category.
                </p>
              </div>
            </div>

            {/* Sparklines Row (Views & Leads) */}
            <div className="grid grid-cols-2 gap-3">
              {/* Sparkline 1: Views */}
              <div className="bg-slate-950/40 border border-slate-900 p-3 rounded-xl space-y-2">
                <div className="flex items-center justify-between font-mono text-[9px] text-slate-500">
                  <span>PROFILE TRAFFIC</span>
                  <span className="text-emerald-400 font-bold">+12%</span>
                </div>
                <div className="flex items-end justify-between gap-2">
                  <span className="font-mono font-bold text-md text-slate-200">142</span>
                  {/* Inline Sparkline SVG */}
                  <svg className="w-14 h-6" viewBox="0 0 100 30">
                    <path d="M0,25 Q15,10 30,20 T60,5 T90,15 L100,10" fill="none" className="stroke-emerald-400" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M0,25 Q15,10 30,20 T60,5 T90,15 L100,10 L100,30 L0,30 Z" className="fill-emerald-500/5" />
                  </svg>
                </div>
              </div>

              {/* Sparkline 2: Leads */}
              <div className="bg-slate-950/40 border border-slate-900 p-3 rounded-xl space-y-2">
                <div className="flex items-center justify-between font-mono text-[9px] text-slate-500">
                  <span>LEAD INDEX</span>
                  <span className="text-emerald-400 font-bold">+8%</span>
                </div>
                <div className="flex items-end justify-between gap-2">
                  <span className="font-mono font-bold text-md text-slate-200">24</span>
                  {/* Inline Sparkline SVG */}
                  <svg className="w-14 h-6" viewBox="0 0 100 30">
                    <path d="M0,28 Q20,15 40,22 T80,8 L100,5" fill="none" className="stroke-indigo-400" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M0,28 Q20,15 40,22 T80,8 L100,5 L100,30 L0,30 Z" className="fill-indigo-500/5" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Recommendation Engine */}
          <div className="bg-gradient-to-b from-slate-900/60 to-slate-900/20 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
            <div className="flex items-center justify-between pb-2 border-b border-slate-850">
              <h4 className="font-display font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                Smart Recommendations
              </h4>
              <span className="text-[9px] font-mono text-slate-500">AI Targeted</span>
            </div>

            <div className="space-y-3">
              {/* Rec 1: Complete Profile */}
              {profileStrength < 100 && (
                <div className="p-3.5 bg-slate-950/80 border-l-2 border-emerald-400 rounded-xl space-y-2 transition-all hover:border-l-4">
                  <p className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    Complete Enterprise Bio Profile
                  </p>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Completing your enterprise profile, uploading tax registration certificates, and adding MH-RERA licensure documents elevates directory discovery rating by 35%.
                  </p>
                  <button
                    onClick={handleCompleteProfile}
                    className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/20 hover:border-transparent text-[9px] font-mono font-bold rounded uppercase transition-colors"
                  >
                    Complete Profile Now
                  </button>
                </div>
              )}

              {/* Rec 2: List Catalog Products */}
              {localMktListings.length === 0 && (
                <div className="p-3.5 bg-slate-950/80 border-l-2 border-amber-400 rounded-xl space-y-2 transition-all hover:border-l-4">
                  <p className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    Publish B2B Catalog Items
                  </p>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    You have listed zero catalog SKUs. Uploading steel, cement, or consultancy products will trigger automatic procurement match alerts.
                  </p>
                  <button
                    onClick={() => {
                      setActiveViewMode('marketplace');
                      showToast('Opening B2B Catalog publisher...', 'info');
                    }}
                    className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/20 hover:border-transparent text-[9px] font-mono font-bold rounded uppercase transition-colors"
                  >
                    Catalog First Product
                  </button>
                </div>
              )}

              {/* Rec 3: Respond to RFQs */}
              <div className="p-3.5 bg-slate-950/80 border-l-2 border-indigo-400 rounded-xl space-y-2 transition-all hover:border-l-4">
                <p className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  Audit Active Procurement Bids
                </p>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  There are {rfqList.length} open tenders in your industry sector. Submit structured bids early to stand out in developer audit registers.
                </p>
                <button
                  onClick={() => setActiveViewMode('rfq_management')}
                  className="px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-slate-100 border border-indigo-500/20 hover:border-transparent text-[9px] font-mono font-bold rounded uppercase transition-colors"
                >
                  Explore RFQs & Bids
                </button>
              </div>

              {/* Rec 4: Upgrade Tier */}
              {membershipStatus === 'Standard Free' && (
                <div className="p-3.5 bg-slate-950/80 border-l-2 border-yellow-500 rounded-xl space-y-2 transition-all hover:border-l-4">
                  <p className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-yellow-500" />
                    Seal Enterprise Platinum Tier
                  </p>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Unlocks unlimited multi-seat staff accounts, verified GOLD badge, zero-escrow fees, and direct priority API consultation channels.
                  </p>
                  <button
                    onClick={() => setActiveModal('upgrade')}
                    className="px-2.5 py-1.5 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-400 hover:text-slate-950 border border-yellow-500/20 hover:border-transparent text-[9px] font-mono font-bold rounded uppercase transition-colors"
                  >
                    Upgrade Tier Now
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Operational Checklist & Reminders */}
          <div className="bg-gradient-to-b from-slate-900/60 to-slate-900/20 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
            <div className="flex items-center justify-between pb-2 border-b border-slate-850">
              <h4 className="font-display font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Operational Reminders
              </h4>
              <span className="text-[9px] font-mono text-slate-500">Todo List</span>
            </div>

            <div className="space-y-3">
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => toggleTask(task.id)}
                  className="flex items-start gap-3 cursor-pointer select-none group p-2.5 bg-slate-950/40 border border-slate-900 rounded-xl hover:border-slate-800 transition-all"
                >
                  <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-all shrink-0 ${
                    task.completed 
                      ? 'bg-emerald-500 border-transparent text-slate-950' 
                      : 'border-slate-700 bg-slate-900 group-hover:border-emerald-500/50'
                  }`}>
                    {task.completed && <Check className="w-3 h-3" />}
                  </div>
                  <span className={`text-[11px] leading-snug transition-all ${
                    task.completed 
                      ? 'text-slate-500 line-through' 
                      : 'text-slate-300 group-hover:text-slate-100'
                  }`}>
                    {task.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Notifications Widget */}
          <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-900">
              <h4 className="font-display font-semibold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-emerald-400" />
                Live Control Desk Notifications
              </h4>
              <span className="text-[9px] font-mono text-slate-500">Realtime</span>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {localNotifications.map(noti => (
                <div 
                  key={noti.id} 
                  onClick={() => handleMarkNotiRead(noti.id)}
                  className={`p-3 rounded-xl border text-xs space-y-1 transition-all cursor-pointer ${
                    noti.unread 
                      ? 'bg-slate-900 border-emerald-500/30 hover:border-emerald-500/60' 
                      : 'bg-slate-950/40 border-slate-900 hover:border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${noti.unread ? 'bg-emerald-400' : 'bg-transparent'} mt-1.5 shrink-0`} />
                    <p className={`text-[11px] leading-relaxed flex-1 ${noti.unread ? 'text-slate-200 font-medium' : 'text-slate-400'}`}>
                      {noti.text}
                    </p>
                  </div>
                  <div className="flex justify-between items-center pl-3.5 text-[9px] text-slate-500 font-mono">
                    <span>{noti.time}</span>
                    {noti.unread && <span className="text-emerald-400 font-bold uppercase tracking-wider text-[8px]">Mark read</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Feed Updates Collapsible Widget */}
          <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-900">
              <h4 className="font-display font-semibold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                Recent Feed & Industry Updates
              </h4>
              <button
                onClick={() => toggleCollapsible('recentFeedUpdates')}
                className="text-slate-500 hover:text-slate-300 transition-colors"
                id="btn-toggle-recent-feed-updates"
              >
                {collapsibles.recentFeedUpdates ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {collapsibles.recentFeedUpdates && (
              <div className="space-y-3 animate-slide-in">
                <div className="p-2.5 bg-slate-950/60 border border-slate-900 rounded-lg space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 font-bold uppercase">RERA Regulation</span>
                    <span className="text-[9px] font-mono text-slate-500">3 hours ago</span>
                  </div>
                  <h5 className="font-bold text-xs text-slate-200 leading-tight">Maharashtra RERA implements mandate for project QR Codes on layout billboards</h5>
                  <p className="text-[10px] text-slate-400 line-clamp-2">All registered builders must display QR codes linking directly to the public registry page at construction site entrances.</p>
                </div>

                <div className="p-2.5 bg-slate-950/60 border border-slate-900 rounded-lg space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-500/20 font-bold uppercase">Steel Prices</span>
                    <span className="text-[9px] font-mono text-slate-500">1 day ago</span>
                  </div>
                  <h5 className="font-bold text-xs text-slate-200 leading-tight">Reinforcement TMT bar pricing stabilizes across major Indian ports</h5>
                  <p className="text-[10px] text-slate-400 line-clamp-2">Prices for Fe550D grades hold flat at ₹54,200 per metric ton amid steady logistics and balanced monsoon demands.</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveViewMode('feed');
                    showToast('Navigated to live industry news feed!', 'info');
                  }}
                  className="w-full py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 text-[10px] font-mono font-bold rounded uppercase tracking-wider transition-all border border-slate-800 flex items-center justify-center gap-1"
                >
                  <span>Go to B2B Feed</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Saved & Favorite Businesses Widgets combined */}
          <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-900">
              <h4 className="font-display font-semibold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-red-400" />
                Saved & Favorites Registry
              </h4>
              <span className="text-[9px] font-mono text-slate-500">{savedBusinesses.length + favoriteCompanies.length} Companies</span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1.5">Saved Companies ({savedBusinesses.length})</span>
                <div className="space-y-1.5">
                  {savedBusinesses.length === 0 ? (
                    <span className="text-[10px] text-slate-500 italic block pl-1">No saved companies yet.</span>
                  ) : (
                    savedBusinesses.slice(0, 3).map(id => (
                      <div key={id} className="p-2 bg-slate-950 border border-slate-900 hover:border-slate-850 rounded-lg flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium hover:text-emerald-400 cursor-pointer" onClick={() => onViewBusinessProfile(id)}>
                          {id === 'ent-1' ? 'Apex Developers Ltd' : id === 'ent-3' ? 'Elite Materials Group' : id === 'ent-8' ? 'Green Brick Logistics' : id}
                        </span>
                        <button
                          type="button"
                          onClick={() => onToggleSave(id, id === 'ent-1' ? 'Apex Developers Ltd' : id === 'ent-3' ? 'Elite Materials Group' : id === 'ent-8' ? 'Green Brick Logistics' : id)}
                          className="text-slate-500 hover:text-red-400 p-0.5 rounded transition-colors"
                        >
                          <Bookmark className="w-3.5 h-3.5 fill-slate-500" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1.5">Favorite Businesses ({favoriteCompanies.length})</span>
                <div className="space-y-1.5">
                  {favoriteCompanies.length === 0 ? (
                    <span className="text-[10px] text-slate-500 italic block pl-1">No favorites starred yet.</span>
                  ) : (
                    favoriteCompanies.slice(0, 3).map(id => (
                      <div key={id} className="p-2 bg-slate-950 border border-slate-900 hover:border-slate-850 rounded-lg flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium hover:text-emerald-400 cursor-pointer" onClick={() => onViewBusinessProfile(id)}>
                          {id === 'ent-1' ? 'Apex Developers Ltd' : id === 'ent-2' ? 'BuildCorp Construction' : id}
                        </span>
                        <button
                          type="button"
                          onClick={() => onToggleFavorite(id, id === 'ent-1' ? 'Apex Developers Ltd' : id === 'ent-2' ? 'BuildCorp Construction' : id)}
                          className="text-slate-500 hover:text-red-400 p-0.5 rounded transition-colors"
                        >
                          <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Workspace Personalization & Control Hub (Part 5) */}
          <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-sm" id="dashboard-personalization-desk">
            <div className="flex items-center justify-between pb-2 border-b border-slate-900">
              <h4 className="font-display font-semibold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                Workspace Settings
              </h4>
              <span className="text-[9px] font-mono text-slate-500">Customizer</span>
            </div>

            <div className="space-y-4">
              {/* Theme customizer */}
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Active Brand Theme
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['Light Classic', 'Warm Neutral', 'Dark Luxury'].map(theme => (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => {
                        setWorkspaceTheme(theme);
                        showToast(`Theme switched to ${theme}`, 'success');
                      }}
                      className={`text-[10px] py-1.5 px-2 rounded-lg border font-medium transition-all cursor-pointer ${
                        workspaceTheme === theme
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 font-bold'
                          : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle dashboard widgets */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  Dashboard Stream Filters
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(dashboardWidgets).map(([key, enabled]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleWidgetConfig(key)}
                      className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                        enabled
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-slate-950/40 border-slate-900 text-slate-500'
                      }`}
                    >
                      <span className="capitalize font-mono text-[9px]">
                        {key === 'kpis' ? 'Core KPIs' : key}
                      </span>
                      <span className={`w-1.5 h-1.5 rounded-full ${enabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Default landing selection */}
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Default Session View Landing
                </label>
                <select
                  defaultValue="dashboard"
                  onChange={(e) => showToast(`Preferred Default View set to ${e.target.value}!`, 'success')}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 outline-none cursor-pointer"
                >
                  <option value="dashboard">Operations Dashboard</option>
                  <option value="directory">B2B Directory Hub</option>
                  <option value="marketplace">B2B Product Marketplace</option>
                  <option value="lead_management">Lead Operations</option>
                </select>
              </div>
            </div>
          </div>

          {/* Productivity Flow Log Widget (Part 5) */}
          {dashboardWidgets.productivity && (
            <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-sm" id="dashboard-productivity-desk">
              <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                <h4 className="font-display font-semibold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4 text-emerald-400" />
                  Productivity Search Logs
                </h4>
                <span className="text-[9px] font-mono text-slate-500">Trace Trail</span>
              </div>

              <div className="space-y-3">
                {/* Search Terms */}
                <div>
                  <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider block mb-1">
                    Recent B2B Search Terms
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((term, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] bg-slate-950 border border-slate-900 text-slate-400 px-2 py-0.5 rounded-md hover:text-emerald-400 transition-colors cursor-pointer"
                        title="Click to search again"
                      >
                        🔍 {term}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Visited Businesses */}
                <div>
                  <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider block mb-1.5">
                    Recent Companies Visited
                  </span>
                  <div className="space-y-1">
                    {visitedBusinesses.map((corp) => (
                      <div
                        key={corp.id}
                        onClick={() => {
                          showToast(`Routing back to profile of ${corp.name}`, 'info');
                        }}
                        className="flex items-center justify-between p-1.5 bg-slate-950 border border-slate-900 rounded-lg hover:border-slate-800 transition-all cursor-pointer text-xs text-slate-300"
                      >
                        <span className="font-medium hover:text-emerald-400 transition-colors">
                          {corp.name}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                          <span>{corp.sector}</span>
                          <span className="text-amber-500 font-bold">{corp.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* --- ALL MODALS FOR DYNAMIC INTERACTION --- */}

      {/* 1. Publish Update Modal */}
      {activeModal === 'publish' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-display font-bold text-slate-200 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                Publish Professional Update
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePublishSubmit} className="space-y-4" id="form-publish-update">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Topic Category</label>
                <select
                  value={publishForm.tag}
                  onChange={(e) => setPublishForm(prev => ({ ...prev, tag: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded px-3 py-2 text-xs text-slate-200 outline-none transition-all"
                >
                  <option>Market Update</option>
                  <option>New Project</option>
                  <option>Project Completion</option>
                  <option>Tender Published</option>
                  <option>Price Update</option>
                  <option>Hiring</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Update Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Procuring 300 MT Fly Ash Bricks for Noida layout..."
                  value={publishForm.title}
                  onChange={(e) => setPublishForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded px-3 py-2 text-xs text-slate-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Content Details</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail the specifications, timelines, logistics, and joint venture parameters..."
                  value={publishForm.content}
                  onChange={(e) => setPublishForm(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded px-3 py-2 text-xs text-slate-200 outline-none transition-all"
                />
              </div>

              <div className="flex justify-end gap-2 text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded shadow-lg"
                >
                  Publish Stream Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Create Enquiry Modal */}
      {activeModal === 'enquiry' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-display font-bold text-slate-200 flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                Dispatch Corporate Enquiry
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEnquirySubmit} className="space-y-4" id="form-create-enquiry">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Target Registered Enterprise</label>
                <select
                  value={enquiryForm.targetCompany}
                  onChange={(e) => setEnquiryForm(prev => ({ ...prev, targetCompany: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded px-3 py-2 text-xs text-slate-200 outline-none transition-all"
                >
                  <option value="ent-1">Apex Developers Ltd (Developers)</option>
                  <option value="ent-2">BuildCorp Construction (Contractors)</option>
                  <option value="ent-3">Elite Materials Group (Vendors)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Subject / Objective</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Price quote for Ready-Mix Concrete Grade M40..."
                  value={enquiryForm.subject}
                  onChange={(e) => setEnquiryForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded px-3 py-2 text-xs text-slate-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Dossier / Message Context</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your bulk material requirements, credit cycles, and execution deadlines..."
                  value={enquiryForm.message}
                  onChange={(e) => setEnquiryForm(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded px-3 py-2 text-xs text-slate-200 outline-none transition-all"
                />
              </div>

              <div className="flex justify-end gap-2 text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded shadow-lg"
                >
                  Dispatch Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Schedule Meeting Modal */}
      {activeModal === 'meeting' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-display font-bold text-slate-200 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                Schedule Video Consult
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMeetingSubmit} className="space-y-4" id="form-schedule-meeting">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Consultant / Partner Company</label>
                <select
                  value={meetingForm.businessId}
                  onChange={(e) => setMeetingForm(prev => ({ ...prev, businessId: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded px-3 py-2 text-xs text-slate-200 outline-none transition-all"
                >
                  <option value="ent-1">Apex Developers Ltd</option>
                  <option value="ent-2">BuildCorp Construction</option>
                  <option value="ent-3">Elite Materials Group</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Meeting Agenda</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RERA Compliance alignment and layout audits..."
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded px-3 py-2 text-xs text-slate-200 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Target Date</label>
                  <input
                    type="date"
                    required
                    value={meetingForm.date}
                    onChange={(e) => setMeetingForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded px-3 py-2 text-xs text-slate-200 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Target Time</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 11:30 AM"
                    value={meetingForm.time}
                    onChange={(e) => setMeetingForm(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded px-3 py-2 text-xs text-slate-200 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Virtual Platform</label>
                <select
                  value={meetingForm.type}
                  onChange={(e) => setMeetingForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded px-3 py-2 text-xs text-slate-200 outline-none transition-all"
                >
                  <option>Virtual Video Call (Secure encrypted)</option>
                  <option>On-site Project Cabin (Physical audit)</option>
                  <option>Central Corporate HQ (Worli)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded shadow-lg"
                >
                  Secure Calendar Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Manage Team Modal */}
      {activeModal === 'team' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-display font-bold text-slate-200 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Manage Enterprise Team
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Active Members Seats</h4>
              <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                {activeTeam.map((m, i) => (
                  <div key={i} className="p-2.5 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-200">{m.name}</p>
                      <p className="text-[10px] text-slate-500">{m.email} • {m.role}</p>
                    </div>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase">
                      Seat Verified
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleTeamSubmit} className="border-t border-slate-800 pt-3 space-y-3" id="form-add-team-member">
              <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Invite New Executive Seat</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh K."
                    value={teamForm.name}
                    onChange={(e) => setTeamForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1">Corporate Role</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Project Director"
                    value={teamForm.role}
                    onChange={(e) => setTeamForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1">Business Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="ramesh@multisarv.in"
                  value={teamForm.email}
                  onChange={(e) => setTeamForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-slate-100 font-bold rounded text-xs transition-colors"
              >
                Dispatch Encrypted Seat Invitation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. Upgrade Membership Modal */}
      {activeModal === 'upgrade' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-display font-bold text-slate-200 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" />
                Upgrade Enterprise Plan
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
              <span className="text-[10px] font-mono bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded font-bold uppercase">
                Recommended Plan
              </span>
              <div className="flex justify-between items-baseline">
                <span className="text-md font-bold text-slate-200">Enterprise Platinum</span>
                <span className="text-xs text-slate-400">₹4,999 / Monthly</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Unlock unrestricted RFQ publishing, advanced multi-seat Team Management, RERA priority verified badging, and instant callback automation.
              </p>

              <div className="space-y-1.5 pt-2">
                <div className="flex items-center gap-2 text-[11px] text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Unrestricted Tender and RFQ Dispatch</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Up to 15 corporate team seat licences</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Priority verification within 2 hours</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleUpgradeMembership}
              className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-lg font-mono uppercase"
            >
              Seal Enterprise Platinum Membership
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
