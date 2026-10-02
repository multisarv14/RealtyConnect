import { currentUserName } from '../lib/identity';
import { appStore } from '../lib/appStore';
import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Search, 
  Plus, 
  Filter, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ChevronRight, 
  Phone, 
  Mail, MessageSquare,
  Calendar, 
  MapPin, 
  ArrowUpRight, 
  Check, 
  X, 
  Send, 
  ClipboardList, 
  TrendingUp, 
  AlertCircle, 
  Clock, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Bell, 
  Info,
  Sliders,
  Briefcase,
  Layers,
  ArrowRight
} from 'lucide-react';

export interface Lead {
  id: string;
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
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  description: string;
  preferredContactMethod: 'Email' | 'Mobile' | 'Phone' | 'WhatsApp' | 'Meet';
  status: 'New' | 'Assigned' | 'Contacted' | 'Discussion' | 'Quotation Sent' | 'Negotiation' | 'Converted' | 'Closed' | 'Lost' | 'Cancelled';
  assignedTo: string;
  createdDate: string;
  updatedDate: string;
  notes: string;
  timeline: { id: string; date: string; type: string; text: string; outcome?: string }[];
  followUps: { id: string; date: string; notes: string; outcome?: string; outcomeType?: string; reminder?: boolean; nextFollowUpDate?: string }[];
}

interface BusinessLeadManagementProps {
  userSession: any;
  onLogTriggered: (action: string, entity: string, entityId: string, status: 'SUCCESS' | 'WARNING' | 'FAILURE', details: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  setActiveViewMode?: (view: any) => void;
}

const SEED_LEADS: Lead[] = [
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
  },
  {
    id: 'RC-LE-1004',
    title: 'Consultation for RERA Compliance & Liaison',
    type: 'Consultation Request',
    source: 'Landing Contact Form',
    company: 'Green Brick Logistics',
    contactPerson: 'Ananya Sharma',
    email: 'a.sharma@greenbrick.com',
    mobile: '+91 91220 55110',
    category: 'Transport',
    productService: 'RERA Advisory',
    location: 'Pune, MH',
    priority: 'Medium',
    description: 'Inquired through main contact form requesting a customized onboarding call for RERA filing and escrow setups.',
    preferredContactMethod: 'Email',
    status: 'Contacted',
    assignedTo: 'Ramesh Raut',
    createdDate: '2026-07-16 01:25 PM',
    updatedDate: '2026-07-16 04:00 PM',
    notes: 'Called and confirmed company registration specs. Scheduled a detailed screen share consultation.',
    timeline: [
      { id: 't1', date: '2026-07-16 01:25 PM', type: 'Form Submitted', text: 'Inquiry received via website landing footer contact block.' },
      { id: 't2', date: '2026-07-16 04:00 PM', type: 'Status Update', text: 'Contact established. Emailed standard RERA documentation requirements.' }
    ],
    followUps: [
      { id: 'f1', date: '2026-07-16 04:00 PM', notes: 'Emailed onboarding guidelines. Waiting for document submission.', outcome: 'Emailed guidelines', nextFollowUpDate: '2026-07-19 02:00 PM' }
    ]
  },
  {
    id: 'RC-LE-1005',
    title: 'AAC Wall Block Franchise Sourcing',
    type: 'Dealer Request',
    source: 'Business Opportunities',
    company: 'Zenith Safety Audits',
    contactPerson: 'Karan Mehra',
    email: 'karan@zenithaudits.co.in',
    mobile: '+91 77110 99443',
    category: 'Consultants',
    productService: 'AAC Blocks',
    location: 'Hyderabad, TS',
    priority: 'Low',
    description: 'Interested in becoming a verified state-level distributor and safety certification auditor for thermal insulating AAC block masonry.',
    preferredContactMethod: 'Phone',
    status: 'Converted',
    assignedTo: 'MultiSarv Lead Manager',
    createdDate: '2026-07-14 10:00 AM',
    updatedDate: '2026-07-15 02:00 PM',
    notes: 'Successfully verified company credentials and activated state-level dealership badge on profile.',
    timeline: [
      { id: 't1', date: '2026-07-14 10:00 AM', type: 'Enquiry Received', text: 'Lead created from B2B Opportunities dealer request.' },
      { id: 't2', date: '2026-07-15 02:00 PM', type: 'Conversion', text: 'Dealership proposal finalized and approved. Commercial tier activated.' }
    ],
    followUps: []
  }
];

const STAGES = [
  'New',
  'Assigned',
  'Contacted',
  'Discussion',
  'Quotation Sent',
  'Negotiation',
  'Converted',
  'Closed',
  'Lost',
  'Cancelled'
];

const ENQUIRY_TYPES = [
  'General Business Enquiry',
  'Product Enquiry',
  'Service Enquiry',
  'Material Requirement',
  'RFQ Response',
  'Tender Response',
  'Business Partnership',
  'Joint Venture',
  'Dealer Request',
  'Distributor Request',
  'Channel Partner Request',
  'Consultation Request',
  'Recruitment Enquiry',
  'Project Requirement',
  'Meeting Request'
];

const SOURCES = [
  'Business Directory',
  'Business Profile',
  'Marketplace',
  'Business Feed',
  'Business Opportunities',
  'RFQ',
  'Networking',
  'Membership',
  'Landing Contact Form',
  'Website Search',
  'Manual Entry'
];

const USERS = [
  'Unassigned',
  'Ramesh Raut',
  'Sanjay Kumar',
  'MultiSarv Lead Manager'
];

export default function BusinessLeadManagement({ userSession, onLogTriggered, showToast, setActiveViewMode }: BusinessLeadManagementProps) {
  // Master Lead State with persistent appStore synchronization
  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_leads');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return SEED_LEADS;
  });

  // Keep appStore in sync
  useEffect(() => {
    appStore.setItem('realtyconnect_leads', JSON.stringify(leads));
  }, [leads]);

  // Syncing external marketplace/enquiry updates
  useEffect(() => {
    const importExternalInquiries = () => {
      try {
        const savedMktEnquiries = appStore.getItem('realtyconnect_product_enquiries');
        if (savedMktEnquiries) {
          const mktEnquiries = JSON.parse(savedMktEnquiries);
          let updated = false;
          const currentLeads = [...leads];

          mktEnquiries.forEach((enq: any) => {
            const leadId = `RC-MKT-${enq.id}`;
            const exists = currentLeads.some(l => l.id === leadId);
            if (!exists) {
              const newLead: Lead = {
                id: leadId,
                title: `Marketplace Product Enquiry: ${enq.productTitle}`,
                type: 'Product Enquiry',
                source: 'Marketplace',
                company: enq.buyerCompany || 'Verified Developer',
                contactPerson: enq.sender || 'Sourcing Manager',
                email: 'sourcing@verifiedpartner.in',
                mobile: '+91 90041 55600',
                category: 'Vendors',
                productService: enq.productTitle,
                location: 'Mumbai, MH',
                priority: 'High',
                description: enq.message || `Buyer requested detailed wholesale quotation for ${enq.productTitle}.`,
                preferredContactMethod: 'Email',
                status: 'New',
                assignedTo: 'Unassigned',
                createdDate: new Date().toLocaleDateString() + ' 10:00 AM',
                updatedDate: new Date().toLocaleDateString() + ' 10:00 AM',
                notes: 'Imported dynamically from active B2B Marketplace transaction engine.',
                timeline: [
                  { id: 't1', date: new Date().toLocaleDateString() + ' 10:00 AM', type: 'Enquiry Received', text: `Captured catalog product inquiry for ${enq.productTitle}.` }
                ],
                followUps: []
              };
              currentLeads.unshift(newLead);
              updated = true;
            }
          });

          if (updated) {
            setLeads(currentLeads);
            showToast('Synchronized direct product enquiries from B2B Marketplace!', 'info');
          }
        }
      } catch (e) {
        console.error('Error importing external enquiries', e);
      }
    };

    importExternalInquiries();
    window.addEventListener('storage', importExternalInquiries);
    // Periodically poll since other components might write to appStore in the same tab without storage event
    const interval = setInterval(importExternalInquiries, 5000);
    return () => {
      window.removeEventListener('storage', importExternalInquiries);
      clearInterval(interval);
    };
  }, [leads]);

  // Layout View Tabs
  const [activeTab, setActiveTab] = useState<'all' | 'assigned' | 'open' | 'followups' | 'pending' | 'converted' | 'lost' | 'closed'>('all');
  const [viewMode, setViewMode] = useState<'directory' | 'kanban'>('directory');

  // Search and Advanced Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterSource, setFilterSource] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterAssigned, setFilterAssigned] = useState('All');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchProductService, setSearchProductService] = useState('');

  // Selected Lead Details State
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Manual Creation State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    title: '',
    type: 'General Business Enquiry',
    source: 'Manual Entry',
    company: '',
    contactPerson: '',
    email: '',
    mobile: '',
    category: 'Developers',
    productService: '',
    location: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Urgent',
    description: '',
    preferredContactMethod: 'Email' as 'Email' | 'Mobile' | 'Phone' | 'WhatsApp' | 'Meet',
    assignedTo: 'Unassigned'
  });

  // Follow-up input state inside details view
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [followUpOutcome, setFollowUpOutcome] = useState('Pending approval');
  const [followUpOutcomeType, setFollowUpOutcomeType] = useState('Call Outcome');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [includeReminder, setIncludeReminder] = useState(false);

  // New Notification simulator states
  const [notifications, setNotifications] = useState<{ id: string; text: string; time: string; type: string }[]>([]);

  const addNotification = (text: string, type: string) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // KPI Calculations
  const totalLeads = leads.length;
  const newLeadsCount = leads.filter(l => l.status === 'New').length;
  const convertedLeadsCount = leads.filter(l => l.status === 'Converted').length;
  const lostLeadsCount = leads.filter(l => l.status === 'Lost').length;
  const closedLeadsCount = leads.filter(l => l.status === 'Closed').length;

  const todayStr = new Date().toLocaleDateString();
  const todayFollowUpsCount = leads.filter(l => 
    l.followUps.some(f => f.nextFollowUpDate && new Date(f.nextFollowUpDate).toLocaleDateString() === todayStr)
  ).length;

  const pendingFollowUpsCount = leads.filter(l => 
    l.followUps.some(f => f.nextFollowUpDate && new Date(f.nextFollowUpDate) < new Date() && l.status !== 'Converted' && l.status !== 'Closed')
  ).length;

  const conversionRate = totalLeads > 0 ? Math.round((convertedLeadsCount / totalLeads) * 100) : 0;

  // Manual Lead Submission
  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.title || !newLeadForm.company || !newLeadForm.contactPerson) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    const nextId = `RC-LE-${1000 + totalLeads + 1}`;
    const newLead: Lead = {
      id: nextId,
      ...newLeadForm,
      status: newLeadForm.assignedTo === 'Unassigned' ? 'New' : 'Assigned',
      createdDate: new Date().toLocaleString(),
      updatedDate: new Date().toLocaleString(),
      notes: newLeadForm.description || 'Manual lead entry established.',
      timeline: [
        { 
          id: 't1', 
          date: new Date().toLocaleString(), 
          type: 'Enquiry Received', 
          text: `Lead created manually with source ${newLeadForm.source}.` 
        }
      ],
      followUps: []
    };

    if (newLeadForm.assignedTo !== 'Unassigned') {
      newLead.timeline.push({
        id: 't2',
        date: new Date().toLocaleString(),
        type: 'Assignment',
        text: `Assigned directly to executive ${newLeadForm.assignedTo}.`
      });
    }

    setLeads(prev => [newLead, ...prev]);
    setIsCreateModalOpen(false);
    showToast(`Lead ${nextId} created successfully!`, 'success');
    onLogTriggered('LEAD_MANUAL_CREATION', 'leads', nextId, 'SUCCESS', `Enterprise CRM: Manual lead entry ${nextId} cataloged under ${newLeadForm.company}.`);
    
    // Notifications trigger
    addNotification(`New Lead Generated: [${nextId}] for ${newLeadForm.company}`, 'new');
    if (newLeadForm.assignedTo !== 'Unassigned') {
      addNotification(`Lead Assigned: [${nextId}] assigned to ${newLeadForm.assignedTo}`, 'assigned');
    }

    // Reset form
    setNewLeadForm({
      title: '',
      type: 'General Business Enquiry',
      source: 'Manual Entry',
      company: '',
      contactPerson: '',
      email: '',
      mobile: '',
      category: 'Developers',
      productService: '',
      location: '',
      priority: 'Medium',
      description: '',
      preferredContactMethod: 'Email',
      assignedTo: 'Unassigned'
    });
  };

  // Edit/Assign quick action
  const handleAssignLead = (leadId: string, user: string) => {
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        const isNewAssignment = l.assignedTo !== user;
        const updatedTimeline = [...l.timeline];
        if (isNewAssignment) {
          updatedTimeline.push({
            id: `t-${Date.now()}`,
            date: new Date().toLocaleString(),
            type: 'Assignment',
            text: `Lead owner modified to ${user}.`
          });
        }
        return {
          ...l,
          assignedTo: user,
          status: user === 'Unassigned' ? 'New' : 'Assigned',
          updatedDate: new Date().toLocaleString(),
          timeline: updatedTimeline
        };
      }
      return l;
    }));

    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead(prev => prev ? { 
        ...prev, 
        assignedTo: user, 
        status: user === 'Unassigned' ? 'New' : 'Assigned',
        updatedDate: new Date().toLocaleString()
      } : null);
    }

    showToast(`Assigned lead to ${user}!`, 'success');
    onLogTriggered('LEAD_OWNER_ASSIGNED', 'leads', leadId, 'SUCCESS', `Enterprise CRM: Reassigned owner of lead ${leadId} to ${user}.`);
    addNotification(`Lead Assigned: [${leadId}] has been routed to ${user}`, 'assigned');
  };

  // Change pipeline status
  const handleUpdateStatus = (leadId: string, nextStatus: Lead['status']) => {
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        const oldStatus = l.status;
        if (oldStatus === nextStatus) return l;

        const updatedTimeline = [...l.timeline];
        updatedTimeline.push({
          id: `t-${Date.now()}`,
          date: new Date().toLocaleString(),
          type: 'Status Change',
          text: `Pipeline status transitioned from ${oldStatus} to ${nextStatus}.`
        });

        return {
          ...l,
          status: nextStatus,
          updatedDate: new Date().toLocaleString(),
          timeline: updatedTimeline
        };
      }
      return l;
    }));

    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead(prev => prev ? { 
        ...prev, 
        status: nextStatus, 
        updatedDate: new Date().toLocaleString()
      } : null);
    }

    showToast(`Status updated to ${nextStatus}`, 'success');
    onLogTriggered('LEAD_STATUS_TRANSITION', 'leads', leadId, 'SUCCESS', `Pipeline: Lead ${leadId} transitioned to "${nextStatus}".`);
    
    if (nextStatus === 'Converted') {
      addNotification(`Lead Converted: [${leadId}] has been successfully converted! 🎉`, 'converted');
    } else if (nextStatus === 'Closed') {
      addNotification(`Lead Closed: [${leadId}] marked as successfully closed.`, 'closed');
    }
  };

  // Delete Lead
  const handleDeleteLead = (leadId: string) => {
    if (confirm('Are you sure you want to permanently archive this lead entry?')) {
      setLeads(prev => prev.filter(l => l.id !== leadId));
      if (selectedLead?.id === leadId) setSelectedLead(null);
      showToast('Lead archived.', 'error');
      onLogTriggered('LEAD_ARCHIVED', 'leads', leadId, 'WARNING', `CRM: Hard deleted/archived lead ${leadId} from registry.`);
    }
  };

  // Save Follow-up
  const handleAddFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !followUpNotes.trim()) {
      showToast('Please insert notes for the follow-up.', 'error');
      return;
    }

    const followUpId = `f-${Date.now()}`;
    const newFollowUp = {
      id: followUpId,
      date: new Date().toLocaleString(),
      notes: followUpNotes,
      outcome: followUpOutcome,
      outcomeType: followUpOutcomeType,
      reminder: includeReminder,
      nextFollowUpDate: nextFollowUpDate || undefined
    };

    setLeads(prev => prev.map(l => {
      if (l.id === selectedLead.id) {
        const updatedTimeline = [...l.timeline];
        updatedTimeline.push({
          id: `t-${Date.now()}`,
          date: new Date().toLocaleString(),
          type: 'Follow-Up Action',
          text: `Logged follow-up call. Next review date: ${nextFollowUpDate || 'Not Scheduled'}. Note: "${followUpNotes}"`,
          outcome: followUpOutcome
        });

        // Auto transition status if contacted
        let nextStatus = l.status;
        if (l.status === 'New' || l.status === 'Assigned') {
          nextStatus = 'Contacted';
        }

        return {
          ...l,
          status: nextStatus,
          updatedDate: new Date().toLocaleString(),
          followUps: [...l.followUps, newFollowUp],
          timeline: updatedTimeline
        };
      }
      return l;
    }));

    // Update locally viewed lead
    setSelectedLead(prev => {
      if (!prev) return null;
      let nextStatus = prev.status;
      if (prev.status === 'New' || prev.status === 'Assigned') {
        nextStatus = 'Contacted';
      }
      return {
        ...prev,
        status: nextStatus,
        followUps: [...prev.followUps, newFollowUp],
        updatedDate: new Date().toLocaleString()
      };
    });

    if (includeReminder && nextFollowUpDate) {
      addNotification(`Follow-up Reminder scheduled for [${selectedLead.id}] on ${nextFollowUpDate}`, 'reminder');
    }

    showToast('Follow-up logged successfully!', 'success');
    onLogTriggered('LEAD_FOLLOWUP_LOGGED', 'leads', selectedLead.id, 'SUCCESS', `CRM: Logged follow-up under ${selectedLead.id}. Next action scheduled: ${nextFollowUpDate || 'None'}`);

    // Clear inputs
    setFollowUpNotes('');
    setNextFollowUpDate('');
    setIncludeReminder(false);
  };

  // Filtering leads based on active tabs, search, and advanced filters
  const filteredLeads = leads.filter(l => {
    // 1. All/Tab Filters
    if (activeTab === 'assigned') {
      if (l.assignedTo === 'Unassigned') return false;
    } else if (activeTab === 'open') {
      if (l.status === 'Converted' || l.status === 'Closed' || l.status === 'Lost' || l.status === 'Cancelled') return false;
    } else if (activeTab === 'followups') {
      const today = new Date().toLocaleDateString();
      const hasToday = l.followUps.some(f => f.nextFollowUpDate && new Date(f.nextFollowUpDate).toLocaleDateString() === today);
      if (!hasToday) return false;
    } else if (activeTab === 'pending') {
      const hasPending = l.followUps.some(f => f.nextFollowUpDate && new Date(f.nextFollowUpDate) < new Date());
      const isClosedState = l.status === 'Converted' || l.status === 'Closed' || l.status === 'Lost' || l.status === 'Cancelled';
      if (!hasPending || isClosedState) return false;
    } else if (activeTab === 'converted') {
      if (l.status !== 'Converted') return false;
    } else if (activeTab === 'lost') {
      if (l.status !== 'Lost') return false;
    } else if (activeTab === 'closed') {
      if (l.status !== 'Closed') return false;
    }

    // 2. Search query (Lead number, Company, Contact, Email, Mobile, keywords)
    if (searchQuery.trim() !== '') {
      const term = searchQuery.toLowerCase();
      const match = 
        l.id.toLowerCase().includes(term) ||
        l.company.toLowerCase().includes(term) ||
        l.contactPerson.toLowerCase().includes(term) ||
        l.email.toLowerCase().includes(term) ||
        l.mobile.toLowerCase().includes(term) ||
        l.title.toLowerCase().includes(term) ||
        l.description.toLowerCase().includes(term);
      if (!match) return false;
    }

    // 3. Location filter
    if (searchLocation.trim() !== '') {
      if (!l.location.toLowerCase().includes(searchLocation.toLowerCase())) return false;
    }

    // 4. Product/Service filter
    if (searchProductService.trim() !== '') {
      if (!l.productService.toLowerCase().includes(searchProductService.toLowerCase())) return false;
    }

    // 5. Advanced dropdown filters
    if (filterStatus !== 'All' && l.status !== filterStatus) return false;
    if (filterPriority !== 'All' && l.priority !== filterPriority) return false;
    if (filterType !== 'All' && l.type !== filterType) return false;
    if (filterSource !== 'All' && l.source !== filterSource) return false;
    if (filterCategory !== 'All' && l.category !== filterCategory) return false;
    if (filterAssigned !== 'All' && l.assignedTo !== filterAssigned) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold font-mono px-2 py-0.5 rounded-full uppercase tracking-wider">
              Lead Management
            </span>
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-bold font-mono px-2 py-0.5 rounded-full uppercase tracking-wider">
              Control Center Sync
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white font-display tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            Lead & Enquiry Management Hub
          </h2>
          <p className="text-xs text-slate-400">
            Unified centralized platform enquiry capture, client pipeline routing, follow-up scheduler, and compliance audits.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 self-start cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2]" />
          <span>Manual Entry Enquiry</span>
        </button>
      </div>

      {/* Main KPI Stats Dashboard Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900/30 border border-slate-900 p-4 rounded-2xl hover:border-slate-800 transition-colors space-y-1.5">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Total Captured Leads</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">{totalLeads}</span>
            <span className="text-[10px] font-mono font-semibold text-slate-400">Sourced</span>
          </div>
        </div>

        <div className="bg-slate-900/30 border border-slate-900 p-4 rounded-2xl hover:border-slate-800 transition-colors space-y-1.5">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Unassigned / New</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-amber-400">{newLeadsCount}</span>
            <span className="text-[10px] font-mono font-semibold text-amber-500/80 uppercase">In Queue</span>
          </div>
        </div>

        <div className="bg-slate-900/30 border border-slate-900 p-4 rounded-2xl hover:border-slate-800 transition-colors space-y-1.5">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Today's Follow-ups</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-400">{todayFollowUpsCount}</span>
            <span className="text-[10px] font-mono font-semibold text-slate-400">Scheduled</span>
          </div>
        </div>

        <div className="bg-slate-900/30 border border-slate-900 p-4 rounded-2xl hover:border-slate-800 transition-colors space-y-1.5">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Overdue Follow-ups</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-rose-400">{pendingFollowUpsCount}</span>
            <span className="text-[10px] font-mono font-semibold text-rose-500/80 uppercase">Attention</span>
          </div>
        </div>

        <div className="bg-slate-900/30 border border-slate-900 p-4 rounded-2xl hover:border-slate-800 transition-colors space-y-1.5 col-span-2 lg:col-span-1">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Conversion Efficiency</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">{conversionRate}%</span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">{convertedLeadsCount} Leads</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout Block */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left column sidebar for advanced search & filters, notifications log */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-4.5 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
              <h3 className="font-display font-semibold text-[11px] text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                Advanced Filters
              </h3>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSearchLocation('');
                  setSearchProductService('');
                  setFilterStatus('All');
                  setFilterPriority('All');
                  setFilterType('All');
                  setFilterSource('All');
                  setFilterCategory('All');
                  setFilterAssigned('All');
                  showToast('Lead directory filters reset!', 'info');
                }}
                className="text-[10px] font-mono text-slate-500 hover:text-emerald-400 transition-colors"
              >
                Clear All
              </button>
            </div>

            {/* Form controls */}
            <div className="space-y-3.5 text-left">
              <div>
                <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">Local Sourcing Location</label>
                <div className="relative">
                  <MapPin className="w-3 h-3 text-slate-600 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. Worli, Whitefield"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-lg pl-8 pr-2.5 py-1.5 text-[11px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">Product SKU / Service Scope</label>
                <div className="relative">
                  <Briefcase className="w-3 h-3 text-slate-600 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. Steel, RMC, Advisory"
                    value={searchProductService}
                    onChange={(e) => setSearchProductService(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-lg pl-8 pr-2.5 py-1.5 text-[11px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">Pipeline Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 font-mono outline-none focus:border-slate-800"
                >
                  <option value="All">All Pipeline Stages</option>
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">Enquiry Core Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 font-mono outline-none focus:border-slate-800"
                >
                  <option value="All">All Core Types</option>
                  {ENQUIRY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">Captured Lead Source</label>
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 font-mono outline-none focus:border-slate-800"
                >
                  <option value="All">All Sources</option>
                  {SOURCES.map(src => <option key={src} value={src}>{src}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">Assignee Executive</label>
                <select
                  value={filterAssigned}
                  onChange={(e) => setFilterAssigned(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 font-mono outline-none focus:border-slate-800"
                >
                  <option value="All">All Team Members</option>
                  {USERS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">Risk / Priority Level</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 font-mono outline-none focus:border-slate-800"
                >
                  <option value="All">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Integrated Real-time Notification Logs */}
          <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-4.5 space-y-4">
            <h3 className="font-display font-semibold text-[11px] text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2.5">
              <Bell className="w-3.5 h-3.5 text-emerald-400" />
              Ecosystem Notification Logs
            </h3>

            {notifications.length === 0 ? (
              <p className="text-[10px] text-slate-500 italic text-center py-2">
                No new notification triggers logged since active session.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {notifications.map(notif => (
                  <div key={notif.id} className="bg-slate-950/60 border border-slate-900 p-2.5 rounded-lg flex gap-2 text-left">
                    <div className="mt-0.5">
                      {notif.type === 'new' && <Plus className="w-3 h-3 text-emerald-400" />}
                      {notif.type === 'assigned' && <Users className="w-3 h-3 text-indigo-400" />}
                      {notif.type === 'reminder' && <Clock className="w-3 h-3 text-amber-400" />}
                      {notif.type === 'converted' && <CheckCircle2 className="w-3 h-3 text-emerald-400 animate-bounce" />}
                      {notif.type === 'closed' && <Check className="w-3 h-3 text-slate-400" />}
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <p className="text-[10px] text-slate-300 leading-normal">{notif.text}</p>
                      <span className="text-[8px] font-mono text-slate-600">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column main tab grid & directories */}
        <div className="xl:col-span-3 space-y-4.5 text-left">
          
          {/* Main Navigation Tab bar and View swapper */}
          <div className="bg-slate-900/30 border border-slate-900 p-2 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Quick Filter Tabs */}
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'all', label: 'All Sourced' },
                { id: 'assigned', label: 'My Assigned' },
                { id: 'open', label: 'Open Pipeline' },
                { id: 'followups', label: "Today's Review" },
                { id: 'pending', label: 'Overdue Follow-ups' },
                { id: 'converted', label: 'Converted' },
                { id: 'closed', label: 'Closed/Sealed' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all tracking-tight ${
                    activeTab === tab.id
                      ? 'bg-slate-950 border border-slate-800 text-emerald-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* View Swapper */}
            <div className="flex bg-slate-950 border border-slate-900 p-1 rounded-xl self-end sm:self-auto">
              <button
                onClick={() => setViewMode('directory')}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                  viewMode === 'directory'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pipeline
              </button>
            </div>
          </div>

          {/* Quick Search and summary bar */}
          <div className="bg-slate-900/30 border border-slate-900 p-4 rounded-2xl space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-600 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search across Lead No, Company, Contact Representative, Corporate Sourcing, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 focus:border-slate-800 outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-1">
              <span>Displaying <strong>{filteredLeads.length}</strong> of <strong>{leads.length}</strong> active registered B2B enquiries</span>
              <span>Workspace Sync: Active</span>
            </div>
          </div>

          {/* Core Lead Directory: Grid/List View */}
          {viewMode === 'directory' ? (
            <div className="space-y-3">
              {filteredLeads.length === 0 ? (
                <div className="bg-slate-900/10 border border-slate-900 p-12 rounded-2xl text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400 font-mono">No matching lead records discovered in the current slice.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchLocation('');
                      setSearchProductService('');
                      setFilterStatus('All');
                      setActiveTab('all');
                    }}
                    className="text-[10px] text-emerald-400 hover:underline font-mono"
                  >
                    Reset Directory Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredLeads.map((lead) => (
                    <div 
                      key={lead.id} 
                      className="bg-slate-900/30 border border-slate-900 hover:border-slate-800 p-5 rounded-2xl transition-all space-y-4 text-left group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono font-bold bg-slate-950 text-slate-400 border border-slate-900 px-2 py-0.5 rounded">
                              {lead.id}
                            </span>
                            <span className={`text-[8px] font-mono font-bold px-1.5 rounded uppercase ${
                              lead.priority === 'Urgent' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25' :
                              lead.priority === 'High' ? 'bg-amber-500/10 text-amber-400' :
                              lead.priority === 'Medium' ? 'bg-indigo-500/10 text-indigo-400' :
                              'bg-slate-950 text-slate-400'
                            }`}>
                              {lead.priority} Priority
                            </span>
                          </div>
                          <h4 className="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors leading-tight">
                            {lead.title}
                          </h4>
                        </div>

                        <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          lead.status === 'Converted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          lead.status === 'Closed' ? 'bg-slate-950 text-slate-400 border-slate-900' :
                          lead.status === 'New' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse' :
                          'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        }`}>
                          {lead.status}
                        </span>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[10px] text-slate-400 border-t border-b border-slate-950 py-3.5">
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-mono text-slate-600 uppercase block">Company / Sourcing</span>
                          <span className="font-bold text-slate-200 truncate block">{lead.company}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-mono text-slate-600 uppercase block">Contact Person</span>
                          <span className="text-slate-300 block">{lead.contactPerson}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-mono text-slate-600 uppercase block">Source Module</span>
                          <span className="text-emerald-400 font-mono block">{lead.source}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-mono text-slate-600 uppercase block">Enquiry Core Type</span>
                          <span className="text-slate-300 block">{lead.type}</span>
                        </div>
                      </div>

                      {/* Footer buttons / actions */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                          <span>Owner: <strong>{lead.assignedTo}</strong></span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <select
                            value={lead.assignedTo}
                            onChange={(e) => handleAssignLead(lead.id, e.target.value)}
                            className="bg-slate-950 border border-slate-900 rounded px-1.5 py-1 text-[9px] font-mono text-slate-400 outline-none"
                          >
                            {USERS.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>

                          <button
                            onClick={() => {
                              setSelectedLead(lead);
                              onLogTriggered('LEAD_DETAILS_MODAL_VIEWED', 'leads', lead.id, 'SUCCESS', `CRM Panel: Viewed complete enquiry specifications for ${lead.id}.`);
                            }}
                            className="bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/25 px-2.5 py-1 rounded text-[9px] font-bold font-mono transition-all uppercase"
                          >
                            Manage
                          </button>

                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            className="text-slate-600 hover:text-rose-400 p-1 rounded transition-colors"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Kanban / Lead Pipeline View */
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
              {['New', 'Assigned', 'Contacted', 'Discussion', 'Quotation Sent', 'Negotiation', 'Converted', 'Closed', 'Lost'].map((stage) => {
                const stageLeads = filteredLeads.filter(l => {
                  if (stage === 'Converted') {
                    return l.status === 'Converted' || l.status === 'Won';
                  }
                  return l.status === stage;
                });

                return (
                  <div key={stage} className="bg-slate-900/20 border border-slate-900 p-3 rounded-2xl space-y-3 min-w-[250px] flex-1">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider block">
                        {stage === 'Converted' ? 'Won / Converted' : stage}
                      </span>
                      <span className="bg-slate-950 text-slate-500 text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold">
                        {stageLeads.length}
                      </span>
                    </div>

                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-0.5">
                      {stageLeads.length === 0 ? (
                        <p className="text-[10px] text-slate-600 italic py-4 text-center">Empty Stage</p>
                      ) : (
                        stageLeads.map(lead => (
                          <div 
                            key={lead.id} 
                            onClick={() => {
                              setSelectedLead(lead);
                              onLogTriggered('LEAD_DETAILS_MODAL_VIEWED', 'leads', lead.id, 'SUCCESS', `CRM Panel: Opened board details for ${lead.id}`);
                            }}
                            className="bg-slate-950 hover:bg-slate-900/60 border border-slate-900 p-3 rounded-xl space-y-2 text-left cursor-pointer transition-all hover:border-slate-800"
                          >
                            <div className="flex items-center justify-between text-[8px] font-mono text-slate-500">
                              <span>{lead.id}</span>
                              <span className="text-emerald-400 uppercase font-bold">{lead.source}</span>
                            </div>
                            <h5 className="font-bold text-[11px] text-white leading-tight truncate">{lead.title}</h5>
                            <div className="space-y-1">
                              <p className="text-[9px] text-slate-400 truncate">{lead.company}</p>
                              <div className="flex items-center justify-between text-[8px] text-slate-500 font-mono">
                                <span>Owner: {lead.assignedTo.split(' ')[0]}</span>
                                <span className={`font-bold uppercase ${
                                  lead.priority === 'Urgent' ? 'text-rose-400' :
                                  lead.priority === 'High' ? 'text-amber-400' :
                                  'text-slate-400'
                                }`}>
                                  {lead.priority}
                                </span>
                              </div>
                            </div>

                            {/* Quick pipeline advance */}
                            <div className="pt-2 border-t border-slate-900 flex justify-between gap-1" onClick={(e) => e.stopPropagation()}>
                              <span className="text-[8px] text-slate-600 self-center">Advance:</span>
                              <div className="flex gap-1">
                                {lead.status !== 'Converted' && (
                                  <button
                                    onClick={() => handleUpdateStatus(lead.id, 'Converted')}
                                    className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 p-1 rounded text-[8px] font-bold font-mono transition-all"
                                    title="Mark Converted"
                                  >
                                    Win
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    const currentIndex = STAGES.indexOf(lead.status);
                                    if (currentIndex < STAGES.length - 1) {
                                      handleUpdateStatus(lead.id, STAGES[currentIndex + 1] as any);
                                    }
                                  }}
                                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 p-1 rounded text-[8px] font-mono transition-all"
                                  title="Next Stage"
                                >
                                  Next →
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Creation modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-950 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 text-left space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <h3 className="font-display font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Register Manual B2B Enquiry
              </h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Enquiry Title (Required)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bulk Cement Procurement NCR"
                    value={newLeadForm.title}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Enquiry Core Type</label>
                  <select
                    value={newLeadForm.type}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500 font-mono"
                  >
                    {ENQUIRY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Source Module</label>
                  <select
                    value={newLeadForm.source}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, source: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500 font-mono"
                  >
                    {SOURCES.map(src => <option key={src} value={src}>{src}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Company (Required)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ultratech Bulk Division"
                    value={newLeadForm.company}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Contact Person (Required)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Kumar"
                    value={newLeadForm.contactPerson}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, contactPerson: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Corporate Email</label>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Mobile / Phone</label>
                  <input
                    type="text"
                    placeholder="+91 XXXXX XXXXX"
                    value={newLeadForm.mobile}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, mobile: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Product / Service Sourced</label>
                  <input
                    type="text"
                    placeholder="e.g. Portland Cement, Subcontracting"
                    value={newLeadForm.productService}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, productService: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Project Site Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Noida Sector 62, Worli"
                    value={newLeadForm.location}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Enquiry Risk Priority</label>
                  <select
                    value={newLeadForm.priority}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Team Assignee Owner</label>
                  <select
                    value={newLeadForm.assignedTo}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500 font-mono"
                  >
                    {USERS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Preferred Contact Method</label>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['Email', 'Mobile', 'Phone', 'WhatsApp', 'Meet'].map(m => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setNewLeadForm(prev => ({ ...prev, preferredContactMethod: m as any }))}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all border ${
                          newLeadForm.preferredContactMethod === m
                            ? 'bg-emerald-500 text-slate-950 border-transparent'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Requirements Description</label>
                  <textarea
                    rows={3}
                    placeholder="Detailed procurement specifications, custom bulk pricing slabs requested, audit certificates required..."
                    value={newLeadForm.description}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="bg-slate-900 hover:bg-slate-850 text-slate-400 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-500/20"
                >
                  Seal & Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Lead Details View Modal Popover */}
      {selectedLead && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 lg:p-8 z-50 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-850 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden my-auto text-left flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-900/40 px-6 py-4 border-b border-slate-900 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-slate-950 border border-slate-900 px-2 py-0.5 rounded text-slate-400">
                    {selectedLead.id}
                  </span>
                  <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 rounded uppercase">
                    {selectedLead.source} Capture
                  </span>
                  <span className={`text-[9px] font-mono font-bold px-2 rounded uppercase ${
                    selectedLead.priority === 'Urgent' ? 'bg-rose-500/10 text-rose-400' :
                    selectedLead.priority === 'High' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-slate-950 text-slate-400'
                  }`}>
                    {selectedLead.priority} Priority
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-base text-white">
                  {selectedLead.title}
                </h3>
              </div>

              <button 
                onClick={() => setSelectedLead(null)}
                className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white p-2 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Container */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
              
              {/* Left Column: Core Lead Information (2/3 width on lg) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Section 1: Customer Info & Sourcing specs */}
                <div className="bg-slate-900/20 border border-slate-900 p-5 rounded-2xl space-y-4">
                  <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-950 pb-2">
                    <Info className="w-3.5 h-3.5 text-emerald-400" />
                    B2B Sourcing Specifications
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-slate-600 uppercase block">Company Name</span>
                      <strong className="text-slate-200 text-xs block">{selectedLead.company}</strong>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-slate-600 uppercase block">Contact Representative</span>
                      <strong className="text-slate-200 text-xs block">{selectedLead.contactPerson}</strong>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-slate-600 uppercase block">Direct Sourcing Category</span>
                      <span className="text-slate-300 block">{selectedLead.category}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-slate-600 uppercase block">Product SKU / Service</span>
                      <span className="text-emerald-400 font-mono font-bold block">{selectedLead.productService || 'N/A'}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-slate-600 uppercase block">Project Delivery Site</span>
                      <span className="text-slate-300 block">{selectedLead.location || 'N/A'}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-slate-600 uppercase block">Enquiry Core Class</span>
                      <span className="text-slate-300 block">{selectedLead.type}</span>
                    </div>
                  </div>

                  <div className="space-y-1 pt-2">
                    <span className="text-[9px] font-mono text-slate-600 uppercase block">Original Sourcing Inquiry / Message</span>
                    <p className="bg-slate-950 border border-slate-900 p-3 rounded-xl text-xs text-slate-300 leading-relaxed italic">
                      "{selectedLead.description}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1.5">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 text-left space-y-1">
                      <span className="text-[8px] font-mono text-slate-600 uppercase block">Email Address</span>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-xs text-slate-300 truncate font-mono">{selectedLead.email || 'No email recorded'}</span>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 text-left space-y-1">
                      <span className="text-[8px] font-mono text-slate-600 uppercase block">Telephone / Mobile</span>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-xs text-slate-300 font-mono">{selectedLead.mobile || 'No mobile recorded'}</span>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 text-left space-y-1">
                      <span className="text-[8px] font-mono text-slate-600 uppercase block">Contact Rule</span>
                      <span className="text-xs text-emerald-400 font-mono font-bold block uppercase">{selectedLead.preferredContactMethod} preferred</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Audit Trail Timeline / Historical Log */}
                <div className="bg-slate-900/20 border border-slate-900 p-5 rounded-2xl space-y-4">
                  <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-950 pb-2">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    Audited Activity Logs & Sourcing Timeline
                  </h4>

                  <div className="relative border-l border-slate-900 pl-4 space-y-4 text-left ml-2">
                    {selectedLead.timeline.map((event) => (
                      <div key={event.id} className="relative space-y-1">
                        {/* Circle bullet */}
                        <div className="w-2 h-2 rounded-full bg-emerald-500 border border-slate-950 absolute -left-[20.5px] top-1.5" />
                        
                        <div className="flex flex-wrap items-center gap-x-2 text-[10px]">
                          <span className="font-mono text-slate-500">{event.date}</span>
                          <span className="bg-slate-950 text-emerald-400 border border-slate-900 font-mono text-[8px] font-bold px-1.5 rounded uppercase">
                            {event.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-normal">{event.text}</p>
                        {event.outcome && (
                          <span className="text-[10px] font-mono text-slate-500">Outcome sealed: <strong className="text-slate-300">{event.outcome}</strong></span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Attachments & Documents placeholder */}
                <div className="bg-slate-900/20 border border-slate-900 p-5 rounded-2xl text-left space-y-3">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Verified Document Attachments</span>
                  <div className="border border-dashed border-slate-900 rounded-xl p-4 text-center space-y-1">
                    <FileText className="w-6 h-6 text-slate-700 mx-auto" />
                    <p className="text-[10px] font-mono text-slate-500">Secure Blueprint/GST attachment vault.</p>
                    <span className="text-[9px] bg-slate-950 text-slate-600 px-2 py-0.5 rounded border border-slate-900 inline-block font-mono">No files uploaded. Attachments disabled in Phase 1</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Follow-up Management & CRM State machine */}
              <div className="space-y-6">
                
                {/* B2B Messaging & Collaboration Hub */}
                <div className="bg-slate-900/35 border border-indigo-500/10 p-5 rounded-2xl space-y-4 text-left">
                  <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-950 pb-2">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                    B2B Communication Hub
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Initiate or resume secure, documented B2B discussions with <strong>{selectedLead.company}</strong> regarding this lead pipeline.
                  </p>
                  
                  {/* Quick message options */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        // Generate or retrieve conversation
                        const newConv = {
                          id: `conv-lead-${selectedLead.id}`,
                          companyName: selectedLead.company,
                          companyId: selectedLead.id,
                          logoBg: 'bg-indigo-600',
                          conversationType: 'Lead Discussion' as const,
                          lastMessageText: `Lead Thread started for: ${selectedLead.title}`,
                          lastMessageTime: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                          unreadCount: 0,
                          priority: selectedLead.priority === 'Urgent' ? 'Urgent' as const : selectedLead.priority === 'High' ? 'High' as const : 'Normal' as const,
                          pinned: false,
                          archived: false,
                          assignedExecutive: selectedLead.assignedTo || currentUserName(),
                          relatedEntity: {
                            type: 'Lead' as const,
                            id: selectedLead.id,
                            title: selectedLead.title
                          },
                          messages: [
                            {
                              id: `msg-lead-init-${Date.now()}`,
                              sender: 'system' as const,
                              senderName: 'System',
                              senderCompany: 'RealtyConnect',
                              text: `B2B Communication thread auto-initiated for CRM Lead [${selectedLead.id}] - ${selectedLead.title}.`,
                              timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                              type: 'system' as const
                            },
                            {
                              id: `msg-lead-note-${Date.now()}`,
                              sender: 'them' as const,
                              senderName: selectedLead.contactPerson || 'Representative',
                              senderCompany: selectedLead.company,
                              text: `Hi Elite Materials & Co team, we have registered this lead with preferred contact method: ${selectedLead.preferredContactMethod}. Looking forward to your communication.`,
                              timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                              type: 'text' as const
                            }
                          ]
                        };

                        try {
                          const existingJson = appStore.getItem('realtyconnect_conversations');
                          let conversationsList = existingJson ? JSON.parse(existingJson) : [];
                          // Check if conversation already exists
                          const existsIdx = conversationsList.findIndex((c: any) => c.id === newConv.id || (c.relatedEntity && c.relatedEntity.id === selectedLead.id));
                          if (existsIdx === -1) {
                            conversationsList.unshift(newConv);
                            appStore.setItem('realtyconnect_conversations', JSON.stringify(conversationsList));
                          } else {
                            // Focus on the existing one
                            newConv.id = conversationsList[existsIdx].id;
                          }
                          
                          appStore.setItem('realtyconnect_active_conversation_id', newConv.id);
                          if (setActiveViewMode) {
                            setActiveViewMode('messaging');
                            showToast(`Connected to B2B Messaging thread for ${selectedLead.company}`, 'success');
                            onLogTriggered('LEAD_MESSAGING_LAUNCHED', 'leads', selectedLead.id, 'SUCCESS', `CRM: Launched messaging channel for lead ${selectedLead.id}`);
                          } else {
                            showToast(`Active conversation configured. Switch to B2B Messaging tab to chat!`, 'info');
                          }
                        } catch (e) {
                          showToast('Error syncing communication session', 'error');
                        }
                      }}
                      className="w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-[10px] py-2 rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Open B2B Channel
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          showToast(`Contacting ${selectedLead.contactPerson} via registered Mobile: ${selectedLead.mobile || 'No mobile'}.`, 'info');
                          onLogTriggered('LEAD_CALL_INITIATED', 'leads', selectedLead.id, 'SUCCESS', `CRM: Dialed lead phone ${selectedLead.mobile}`);
                        }}
                        className="text-center bg-slate-950 hover:bg-slate-900 border border-slate-800 text-[9px] font-mono font-bold py-1.5 rounded-lg text-slate-300 transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Phone className="w-3 h-3" />
                        Call Representative
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          showToast(`Drafting mail to ${selectedLead.email || 'representative'}.`, 'info');
                          onLogTriggered('LEAD_EMAIL_DRAFTED', 'leads', selectedLead.id, 'SUCCESS', `CRM: Drafted workspace email to ${selectedLead.email}`);
                        }}
                        className="text-center bg-slate-950 hover:bg-slate-900 border border-slate-800 text-[9px] font-mono font-bold py-1.5 rounded-lg text-slate-300 transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Mail className="w-3 h-3" />
                        Send Intro Email
                      </button>
                    </div>
                  </div>

                  {/* Conversation History brief status */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 flex justify-between items-center text-[9px] font-mono">
                    <span className="text-slate-500">History Status:</span>
                    <span className="text-emerald-400 font-bold uppercase">Ready to Chat</span>
                  </div>
                </div>

                {/* State Controls card */}
                <div className="bg-slate-900/30 border border-slate-900 p-5 rounded-2xl space-y-4 text-left">
                  <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-950 pb-2">
                    <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                    State Pipeline Controls
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">Assigned Executive Owner</label>
                      <select
                        value={selectedLead.assignedTo}
                        onChange={(e) => handleAssignLead(selectedLead.id, e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-slate-800 font-mono"
                      >
                        {USERS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">Pipeline Transition Stage</label>
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {STAGES.map(s => (
                          <button
                            type="button"
                            key={s}
                            onClick={() => handleUpdateStatus(selectedLead.id, s as any)}
                            className={`px-2 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase border tracking-tight text-center truncate ${
                              selectedLead.status === s
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-slate-950 border-slate-900 text-slate-500 hover:text-white'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Follow-up Logger Panel */}
                <div className="bg-slate-900/30 border border-slate-900 p-5 rounded-2xl space-y-4 text-left">
                  <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-950 pb-2">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    Log Sourcing Follow-Up
                  </h4>

                  <form onSubmit={handleAddFollowUp} className="space-y-3.5">
                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">Follow-Up Note / Action Taken</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="e.g. Telephonic review of bulk rebar pricing. Shared certified ISO catalogs..."
                        value={followUpNotes}
                        onChange={(e) => setFollowUpNotes(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 focus:border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 outline-none transition-all resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">Outcome Type</label>
                        <select
                          value={followUpOutcomeType}
                          onChange={(e) => setFollowUpOutcomeType(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-300 font-mono outline-none focus:border-slate-800"
                        >
                          <option value="Call Outcome">Phone Call</option>
                          <option value="Meeting Outcome">Consultation</option>
                          <option value="Email Outcome">Email Proposal</option>
                          <option value="Negotiation Outcome">Pricing Audit</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">Sealed Outcome</label>
                        <select
                          value={followUpOutcome}
                          onChange={(e) => setFollowUpOutcome(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-300 font-mono outline-none focus:border-slate-800"
                        >
                          <option value="Pending approval">Pending</option>
                          <option value="Callback Requested">Callback Req</option>
                          <option value="Meeting Scheduled">Meet Sched</option>
                          <option value="Quotation Approved">Quote Apprv</option>
                          <option value="Unreachable/No Ans">No Answer</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">Schedule Next Review</label>
                      <input
                        type="datetime-local"
                        value={nextFollowUpDate}
                        onChange={(e) => setNextFollowUpDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-slate-800 font-mono"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="include-reminder"
                        checked={includeReminder}
                        onChange={(e) => setIncludeReminder(e.target.checked)}
                        className="rounded bg-slate-950 border-slate-900 text-emerald-500 focus:ring-emerald-500"
                      />
                      <label htmlFor="include-reminder" className="text-[10px] font-mono text-slate-400 select-none cursor-pointer">
                        Add to Ecosystem Reminder Queue
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs py-2 rounded-xl transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1"
                    >
                      <span>Log Follow-Up & Sourcing Update</span>
                      <Send className="w-3 h-3" />
                    </button>
                  </form>

                  {/* Historical list of followups */}
                  {selectedLead.followUps.length > 0 && (
                    <div className="space-y-2.5 pt-3 border-t border-slate-950">
                      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block">Previous Review Updates</span>
                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-0.5">
                        {selectedLead.followUps.map(f => (
                          <div key={f.id} className="bg-slate-950/60 border border-slate-900 p-2.5 rounded-xl space-y-1.5">
                            <div className="flex items-center justify-between text-[8px] font-mono text-slate-500">
                              <span>{f.date}</span>
                              <span className="bg-emerald-500/10 text-emerald-400 px-1 rounded uppercase">{f.outcomeType}</span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-normal font-sans">"{f.notes}"</p>
                            <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                              <span>Outcome: <strong className="text-slate-400">{f.outcome}</strong></span>
                              {f.nextFollowUpDate && <span>Next: {new Date(f.nextFollowUpDate).toLocaleDateString()}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-900/40 px-6 py-4 border-t border-slate-900 flex justify-between gap-4">
              <button
                onClick={() => handleDeleteLead(selectedLead.id)}
                className="bg-slate-950 hover:bg-rose-500/10 text-rose-400 border border-slate-900 hover:border-rose-500/20 px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Archive Sourcing Record</span>
              </button>

              <button
                onClick={() => setSelectedLead(null)}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-4 py-1.5 rounded-xl transition-all shadow-md shadow-emerald-500/20"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
