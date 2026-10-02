import { currentUserName } from '../lib/identity';
import { appStore } from '../lib/appStore';
import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, ClipboardList, ShieldCheck, TrendingUp, Sparkles, Plus, Search, Filter, 
  Trash2, Edit3, Eye, FileText, Calendar, MessageSquare, AlertCircle, ArrowUpRight, CheckCircle2, 
  ChevronRight, Phone, Mail, MapPin, Globe, Award, DollarSign, Clock, HelpCircle, Briefcase, 
  ShoppingBag, Check, X, Sliders, ChevronDown, PlusCircle, ArrowRight, UserCheck, AlertTriangle
} from 'lucide-react';

export interface CrmContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Primary Contact' | 'Secondary Contact' | 'Decision Maker' | 'Technical Contact' | 'Finance Contact' | 'Procurement Contact' | 'Site Contact' | 'Emergency Contact';
}

export interface CrmTimelineEvent {
  id: string;
  timestamp: string;
  type: 'Lead Created' | 'Meeting' | 'Message' | 'Marketplace Enquiry' | 'RFQ' | 'Business Opportunity' | 'Note' | 'Status Change' | 'Relationship Update' | 'Call Log' | 'Visit Log';
  title: string;
  details: string;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING' | 'INFO';
}

export interface CrmAccount {
  id: string;
  name: string;
  businessType: 'Business Account' | 'Corporate Customer' | 'Supplier' | 'Vendor' | 'Channel Partner' | 'Consultant' | 'Bank & Financial Institution' | 'Government Organization';
  industry: string;
  address: string;
  gstNumber: string;
  website: string;
  businessCategory: string;
  verificationStatus: 'Verified' | 'Pending' | 'Unverified';
  membershipStatus: 'Elite Plus' | 'Premium Gold' | 'Standard' | 'Basic';
  relationshipStatus: 'Warm' | 'Cold' | 'Hot' | 'Disengaged';
  assignedManager: string;
  customerSince: string;
  businessValue: number; // in ₹ Lakhs
  currentStage: 'Prospect' | 'Qualified' | 'Customer' | 'Preferred Customer' | 'Strategic Partner' | 'Inactive' | 'Archived';
  contacts: CrmContact[];
  timeline: CrmTimelineEvent[];
}

interface BusinessCrmEngineProps {
  userSession: any;
  onLogTriggered: (action: string, entity: string, entityId: string, status: 'SUCCESS' | 'WARNING' | 'FAILURE', details: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  setActiveViewMode?: (view: any) => void;
}

// Initial high-fidelity CRM Accounts preloaded in system
const SEED_CRM_ACCOUNTS: CrmAccount[] = [
  {
    id: 'ent-1',
    name: 'Apex Developers Ltd',
    businessType: 'Corporate Customer',
    industry: 'Real Estate & Infrastructure Development',
    address: 'Vantage Tower, BKC Area, Bandra East, Mumbai, MH - 400051',
    gstNumber: '27AAACA1234F1Z5',
    website: 'www.apexdev.com',
    businessCategory: 'Developers',
    verificationStatus: 'Verified',
    membershipStatus: 'Elite Plus',
    relationshipStatus: 'Hot',
    assignedManager: 'Vikram Malhotra',
    customerSince: '2025-01-10',
    businessValue: 480, // ₹480 Lakhs
    currentStage: 'Strategic Partner',
    contacts: [
      { id: 'c-1', name: 'Rajesh Aggarwal', email: 'procurement@apexdev.in', phone: '+91 98200 44021', role: 'Decision Maker' },
      { id: 'c-2', name: 'Amit Sharma', email: 'amit.sharma@apexdev.com', phone: '+91 91122 33445', role: 'Technical Contact' },
      { id: 'c-3', name: 'Nisha Mehta', email: 'nmehta@apexdev.com', phone: '+91 98333 44556', role: 'Finance Contact' }
    ],
    timeline: [
      { id: 't-1', timestamp: '2026-07-15 16:10', type: 'Lead Created', title: 'Bulk Steel Procurement Lead Created', details: 'Enquiry for 1,200 MT premium high-ductility Fe550D TMT reinforcement bars.', status: 'SUCCESS' },
      { id: 't-2', timestamp: '2026-07-16 11:30', type: 'Note', title: 'Quotation Shared', details: 'Sent formal pricing of ₹54,500/MT with 30 days corporate credit limit terms.', status: 'INFO' },
      { id: 't-3', timestamp: '2026-07-18 10:00', type: 'Meeting', title: 'Technical Sourcing Review', details: 'Aligning with engineering team regarding structural tolerances and certified audit trails.', status: 'SUCCESS' }
    ]
  },
  {
    id: 'ent-2',
    name: 'BuildCorp Construction',
    businessType: 'Supplier',
    industry: 'Heavy Civil Contracting & Metro Infra',
    address: 'BuildCorp Chambers, Outer Ring Road, Bangalore, KA - 560103',
    gstNumber: '29AAACB5678B2Z2',
    website: 'www.buildcorpcon.com',
    businessCategory: 'Contractors',
    verificationStatus: 'Verified',
    membershipStatus: 'Premium Gold',
    relationshipStatus: 'Warm',
    assignedManager: 'Priya Iyer',
    customerSince: '2025-03-22',
    businessValue: 215, // ₹215 Lakhs
    currentStage: 'Preferred Customer',
    contacts: [
      { id: 'c-4', name: 'Siddharth Rao', email: 's.rao@buildcorpcon.com', phone: '+91 99000 88776', role: 'Primary Contact' },
      { id: 'c-5', name: 'Karan Patil', email: 'karan@buildcorpcon.com', phone: '+91 88776 65544', role: 'Site Contact' }
    ],
    timeline: [
      { id: 't-4', timestamp: '2026-07-12 14:00', type: 'Note', title: 'Site Inspection Report', details: 'Metro substructure project reviewed. Delivery schedule aligned with batching plant capacity.', status: 'SUCCESS' },
      { id: 't-5', timestamp: '2026-07-14 09:30', type: 'Message', title: 'Logistics SLA Aligned', details: 'Dispatched ready-mix delivery metrics for M40 grade wet pours.', status: 'INFO' }
    ]
  },
  {
    id: 'ent-3',
    name: 'Elite Materials Group',
    businessType: 'Vendor',
    industry: 'Aggregates & Ready-Mix Cement Logistics',
    address: 'Industrial Area Phase II, Okhla, New Delhi, DL - 110020',
    gstNumber: '07AAACE9911C3Z1',
    website: 'www.elitematerials.in',
    businessCategory: 'Vendors',
    verificationStatus: 'Verified',
    membershipStatus: 'Standard',
    relationshipStatus: 'Hot',
    assignedManager: 'Vikram Malhotra',
    customerSince: '2025-06-18',
    businessValue: 340,
    currentStage: 'Customer',
    contacts: [
      { id: 'c-6', name: 'Manish Gupta', email: 'info@elitematerials.in', phone: '+91 98111 22233', role: 'Primary Contact' }
    ],
    timeline: [
      { id: 't-6', timestamp: '2026-07-08 10:00', type: 'RFQ', title: 'RFQ Participation - Ready Mix Supply', details: 'Submitted bid for Delhi NCR Central Core materials tender.', status: 'SUCCESS' }
    ]
  },
  {
    id: 'ent-4',
    name: 'RealtyConnect Pro Consultants',
    businessType: 'Consultant',
    industry: 'Real Estate Legal Regulatory Advisory & RERA Compliance',
    address: 'Financial District, Gachibowli, Hyderabad, TS - 500032',
    gstNumber: '36AAACR4455R4Z4',
    website: 'www.realtyproconsultants.com',
    businessCategory: 'Consultants',
    verificationStatus: 'Verified',
    membershipStatus: 'Elite Plus',
    relationshipStatus: 'Warm',
    assignedManager: 'Ananya Deshmukh',
    customerSince: '2024-11-05',
    businessValue: 95,
    currentStage: 'Strategic Partner',
    contacts: [
      { id: 'c-7', name: 'Srinivas Reddy', email: 'reddy@realtypro.com', phone: '+91 94400 55667', role: 'Primary Contact' }
    ],
    timeline: [
      { id: 't-7', timestamp: '2026-07-10 12:00', type: 'Note', title: 'Compliance Briefing', details: 'Feasibility audit finalized for the proposed Gachibowli Tech Town RERA approvals.', status: 'SUCCESS' }
    ]
  },
  {
    id: 'ent-5',
    name: 'National Trust Bank',
    businessType: 'Bank & Financial Institution',
    industry: 'Corporate Real Estate Escrow Funding',
    address: 'Trust Towers, Nariman Point, Mumbai, MH - 400021',
    gstNumber: '27AAACN0022B1Z8',
    website: 'www.nationaltrustbank.com',
    businessCategory: 'Banks',
    verificationStatus: 'Verified',
    membershipStatus: 'Elite Plus',
    relationshipStatus: 'Warm',
    assignedManager: 'Vikram Malhotra',
    customerSince: '2025-02-15',
    businessValue: 720,
    currentStage: 'Customer',
    contacts: [
      { id: 'c-8', name: 'Sonal Sen', email: 'sonal.sen@nationaltrustbank.com', phone: '+91 98222 33344', role: 'Decision Maker' }
    ],
    timeline: [
      { id: 't-8', timestamp: '2026-07-11 15:30', type: 'Note', title: 'Escrow Integration Confirmed', details: 'Setup complete for Apex Tower retail home loan accounts escrow routing.', status: 'SUCCESS' }
    ]
  }
];

export default function BusinessCrmEngine({ 
  userSession, 
  onLogTriggered, 
  showToast, 
  setActiveViewMode 
}: BusinessCrmEngineProps) {

  // List of accounts
  const [accounts, setAccounts] = useState<CrmAccount[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_crm_accounts');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Prepopulate with seed accounts merged with registry or static
    appStore.setItem('realtyconnect_crm_accounts', JSON.stringify(SEED_CRM_ACCOUNTS));
    return SEED_CRM_ACCOUNTS;
  });

  // Selected Account for details inspector
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(() => {
    try {
      const activeId = appStore.getItem('realtyconnect_active_crm_account_id');
      if (activeId) return activeId;
    } catch(e) {}
    return SEED_CRM_ACCOUNTS[0]?.id || null;
  });

  // Synced External Resources for complete 360 dynamic activity aggregate
  const [externalLeads, setExternalLeads] = useState<any[]>([]);
  const [externalMeetings, setExternalMeetings] = useState<any[]>([]);
  const [externalConversations, setExternalConversations] = useState<any[]>([]);
  const [externalRfqs, setExternalRfqs] = useState<any[]>([]);
  const [externalProductEnquiries, setExternalProductEnquiries] = useState<any[]>([]);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStage, setFilterStage] = useState<string>('All');
  const [filterIndustry, setFilterIndustry] = useState<string>('All');
  const [filterManager, setFilterManager] = useState<string>('All');
  const [filterRelation, setFilterRelation] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'customerSince' | 'health'>('name');
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('list');

  // New Account Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAccountForm, setNewAccountForm] = useState<Partial<CrmAccount>>({
    name: '',
    businessType: 'Corporate Customer',
    industry: '',
    address: '',
    gstNumber: '',
    website: '',
    businessCategory: 'Developers',
    verificationStatus: 'Verified',
    membershipStatus: 'Standard',
    relationshipStatus: 'Warm',
    assignedManager: currentUserName(),
    currentStage: 'Prospect',
    businessValue: 10,
    contacts: []
  });

  // Edit Account Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editAccountForm, setEditAccountForm] = useState<CrmAccount | null>(null);

  // Quick Action Forms inside Account Profile Inspector
  const [activityTab, setActivityTab] = useState<'note' | 'call' | 'visit' | 'meeting' | 'contact' | 'document' | 'convert'>('note');
  
  // Quick Activity States
  const [customNote, setCustomNote] = useState('');
  const [callLog, setCallLog] = useState({ duration: '15 Mins', outcome: 'Connected', summary: '', followUpNeeded: false });
  const [visitLog, setVisitLog] = useState({ purpose: 'Project Inspection', feedback: '', attendees: '' });
  const [newContact, setNewContact] = useState<Partial<CrmContact>>({ name: '', email: '', phone: '', role: 'Secondary Contact' });
  const [newDoc, setNewDoc] = useState({ name: '', category: 'Contract' as const, size: '2.1 MB' });

  // Load and synchronize external modules from appStore
  const loadExternalData = () => {
    try {
      const leads = appStore.getItem('realtyconnect_leads');
      if (leads) setExternalLeads(JSON.parse(leads));

      const meets = appStore.getItem('realtyconnect_meetings');
      if (meets) setExternalMeetings(JSON.parse(meets));

      const convs = appStore.getItem('realtyconnect_conversations');
      if (convs) setExternalConversations(JSON.parse(convs));

      const rfqs = appStore.getItem('realtyconnect_rfq_list');
      if (rfqs) setExternalRfqs(JSON.parse(rfqs));

      const productEnqs = appStore.getItem('realtyconnect_product_enquiries');
      if (productEnqs) setExternalProductEnquiries(JSON.parse(productEnqs));
    } catch (e) {
      console.error('Error fetching external storage lists', e);
    }
  };

  useEffect(() => {
    loadExternalData();
    // Setup background sync polling
    const timer = setInterval(loadExternalData, 3000);
    return () => clearInterval(timer);
  }, []);

  // Save CRM Accounts list to state & storage
  const saveCrmAccountsList = (updatedList: CrmAccount[]) => {
    setAccounts(updatedList);
    appStore.setItem('realtyconnect_crm_accounts', JSON.stringify(updatedList));
  };

  // Find the selected account
  const selectedAccount = accounts.find(a => a.id === selectedAccountId) || accounts[0];

  // Selected account ID state synchronizer
  const handleSelectAccount = (id: string) => {
    setSelectedAccountId(id);
    appStore.setItem('realtyconnect_active_crm_account_id', id);
  };

  // Generate system notifications helper
  const triggerNotification = (title: string, details: string, status: 'SUCCESS' | 'WARNING' | 'FAILURE' = 'SUCCESS') => {
    // Write system log
    onLogTriggered('CRM_SYSTEM_EVENT', 'crm', selectedAccountId || 'system', status, `${title}: ${details}`);
    showToast(title, status === 'SUCCESS' ? 'success' : status === 'WARNING' ? 'info' : 'error');
  };

  // 360-Degree Aggregated Timeline calculation (Combining local notes + external logs)
  const getAggregatedTimeline = (acc: CrmAccount) => {
    if (!acc) return [];
    
    const aggregated: any[] = [];

    // 1. Local timeline events (Calls, Visits, Notes, RFQ Participation)
    acc.timeline?.forEach(ev => {
      aggregated.push({
        id: `crm-${acc.id}-${ev.id}`,
        timestamp: ev.timestamp,
        type: ev.type,
        title: ev.title,
        details: ev.details,
        status: ev.status,
        source: 'CRM'
      });
    });

    // 2. Filter dynamic external leads & conversion logs
    externalLeads
      .filter(l => l.company && l.company.toLowerCase().trim() === acc.name.toLowerCase().trim())
      .forEach(lead => {
        aggregated.push({
          id: `lead-created-${lead.id}`,
          timestamp: lead.createdDate || 'Recently',
          type: 'Lead Created',
          title: `Lead Capture: "${lead.title}"`,
          details: `Source: ${lead.source} • Value Status: [${lead.status}] • Preferred Channel: ${lead.preferredContactMethod || 'Email'}`,
          status: 'INFO',
          source: 'Lead Management'
        });

        // Pull lead timeline entries
        lead.timeline?.forEach((lt: any) => {
          aggregated.push({
            id: `lead-timeline-${lead.id}-${lt.id}`,
            timestamp: lt.date || 'Past Event',
            type: 'Note',
            title: `Lead Activity: ${lt.type}`,
            details: lt.text + (lt.outcome ? ` (Outcome: ${lt.outcome})` : ''),
            status: 'SUCCESS',
            source: 'Lead Management'
          });
        });
      });

    // 3. Filter dynamic external meetings
    externalMeetings
      .filter(m => m.companyId === acc.id || m.relatedCompany?.toLowerCase().trim() === acc.name.toLowerCase().trim())
      .forEach(m => {
        aggregated.push({
          id: `meeting-${m.id}`,
          timestamp: `${m.meetingDate} ${m.startTime}`,
          type: 'Meeting',
          title: `B2B Sourcing Meeting: "${m.title}"`,
          details: `Type: ${m.meetingType} • Mode: ${m.meetingMode} • Agenda: ${m.agenda || 'N/A'} • STATUS: [${m.status}]`,
          status: m.status === 'Completed' ? 'SUCCESS' : m.status === 'Cancelled' ? 'FAILURE' : 'INFO',
          source: 'Calendar Hub'
        });
      });

    // 4. Filter dynamic external conversations & messages
    externalConversations
      .filter(c => c.companyId === acc.id || c.companyName?.toLowerCase().trim() === acc.name.toLowerCase().trim())
      .forEach(conv => {
        conv.messages?.forEach((m: any, idx: number) => {
          // Push only the latest key communications or highlights to prevent overflow clutter
          if (idx === conv.messages.length - 1 || m.text?.toLowerCase().includes('proposal') || m.text?.toLowerCase().includes('rate')) {
            aggregated.push({
              id: `${conv.id}-msg-${idx}`,
              timestamp: m.timestamp || 'Real-time',
              type: 'Message',
              title: `${m.sender === 'me' ? 'Outbound' : 'Inbound'} Business Message`,
              details: `"${m.text}"`,
              status: 'INFO',
              source: 'B2B Messaging'
            });
          }
        });
      });

    // 5. Filter external RFQs & quotations
    externalRfqs
      .filter(r => r.organization?.toLowerCase().trim() === acc.name.toLowerCase().trim())
      .forEach(rfq => {
        aggregated.push({
          id: `rfq-${rfq.id}`,
          timestamp: rfq.publishedDate || 'Recently',
          type: 'RFQ',
          title: `Corporate RFQ Published: "${rfq.title}"`,
          details: `Budget: ₹${rfq.estimatedValue || 'Custom'} • Status: [${rfq.status}] • Submissions: ${rfq.bidsCount || 0} Bid(s)`,
          status: 'SUCCESS',
          source: 'RFQ & Tenders'
        });
      });

    // Sort aggregated lists chronologically descending (latest events first)
    return aggregated.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  };

  // Add a custom note / business activity directly to selected CRM Account
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNote.trim()) return;

    const newEvent: CrmTimelineEvent = {
      id: `RC-NOTE-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'Note',
      title: 'Business Note Logged',
      details: customNote,
      status: 'SUCCESS'
    };

    const updated = accounts.map(a => {
      if (a.id === selectedAccount.id) {
        return {
          ...a,
          timeline: [newEvent, ...a.timeline]
        };
      }
      return a;
    });

    saveCrmAccountsList(updated);
    setCustomNote('');
    triggerNotification('Business Note Saved', `Saved persistent note for ${selectedAccount.name}.`);
  };

  // Add Call activity directly to selected CRM Account
  const handleSaveCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callLog.summary.trim()) return;

    const newEvent: CrmTimelineEvent = {
      id: `RC-CALL-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'Call Log',
      title: `Corporate Call Logged: [${callLog.outcome}]`,
      details: `Duration: ${callLog.duration} • ${callLog.summary}${callLog.followUpNeeded ? ' (Follow-up scheduled)' : ''}`,
      status: 'SUCCESS'
    };

    const updated = accounts.map(a => {
      if (a.id === selectedAccount.id) {
        return {
          ...a,
          timeline: [newEvent, ...a.timeline]
        };
      }
      return a;
    });

    saveCrmAccountsList(updated);
    setCallLog({ duration: '15 Mins', outcome: 'Connected', summary: '', followUpNeeded: false });
    triggerNotification('Call Activity Saved', `Dispatched CRM call log metadata for ${selectedAccount.name}.`);
  };

  // Add Visit activity directly to selected CRM Account
  const handleSaveVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitLog.feedback.trim()) return;

    const newEvent: CrmTimelineEvent = {
      id: `RC-VIS-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'Visit Log',
      title: `On-Site Visit: "${visitLog.purpose}"`,
      details: `Attendees: ${visitLog.attendees || 'None'} • Findings: ${visitLog.feedback}`,
      status: 'SUCCESS'
    };

    const updated = accounts.map(a => {
      if (a.id === selectedAccount.id) {
        return {
          ...a,
          timeline: [newEvent, ...a.timeline]
        };
      }
      return a;
    });

    saveCrmAccountsList(updated);
    setVisitLog({ purpose: 'Project Inspection', feedback: '', attendees: '' });
    triggerNotification('Visit Activity Registered', `On-site inspection logged for ${selectedAccount.name}.`);
  };

  // Create new contact directly for selected CRM Account
  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name || !newContact.email || !newContact.phone) {
      showToast('Please fill out all contact fields.', 'error');
      return;
    }

    const contactItem: CrmContact = {
      id: `c-new-${Date.now()}`,
      name: newContact.name,
      email: newContact.email,
      phone: newContact.phone,
      role: newContact.role as any
    };

    const updated = accounts.map(a => {
      if (a.id === selectedAccount.id) {
        return {
          ...a,
          contacts: [...a.contacts, contactItem]
        };
      }
      return a;
    });

    saveCrmAccountsList(updated);
    setNewContact({ name: '', email: '', phone: '', role: 'Secondary Contact' });
    triggerNotification('Contact Managed Successfully', `Linked secondary stakeholder ${contactItem.name} as ${contactItem.role}.`);
  };

  // Document reference attaching (e.g. Proposals, contracts)
  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.name.trim()) return;

    const newEvent: CrmTimelineEvent = {
      id: `RC-DOC-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'Note',
      title: `Linked Document: [${newDoc.category}]`,
      details: `Attached file: "${newDoc.name}" (${newDoc.size}) under corporate repository.`,
      status: 'SUCCESS'
    };

    const updated = accounts.map(a => {
      if (a.id === selectedAccount.id) {
        return {
          ...a,
          timeline: [newEvent, ...a.timeline]
        };
      }
      return a;
    });

    saveCrmAccountsList(updated);
    setNewDoc({ name: '', category: 'Contract', size: '2.1 MB' });
    triggerNotification('Document Attached', 'Linked professional document to CRM account repository.');
  };

  // Convert B2B Lead to active CRM Customer
  const handleConvertLeadToCustomer = (lead: any) => {
    // Check if account already exists
    const exists = accounts.some(a => a.name.toLowerCase().trim() === lead.company?.toLowerCase().trim());
    
    if (exists) {
      showToast('CRM relationship already configured for this company.', 'info');
      return;
    }

    // Map Lead to rich CRM account
    const newCrmAccount: CrmAccount = {
      id: `RC-CRM-${Date.now().toString().slice(-4)}`,
      name: lead.company || 'New Partner',
      businessType: (lead.category === 'Vendors' ? 'Vendor' : lead.category === 'Consultants' ? 'Consultant' : 'Corporate Customer') as any,
      industry: lead.productService || 'Construction & Building Infrastructure Services',
      address: lead.location || 'Regional HQ Office',
      gstNumber: '27AAACG9944D4Z3',
      website: `www.${lead.company.toLowerCase().replace(/\s+/g, '')}.com`,
      businessCategory: lead.category || 'Developers',
      verificationStatus: 'Verified',
      membershipStatus: 'Premium Gold',
      relationshipStatus: 'Hot',
      assignedManager: currentUserName(),
      customerSince: new Date().toISOString().split('T')[0],
      businessValue: lead.priority === 'High' ? 120 : lead.priority === 'Urgent' ? 240 : 50,
      currentStage: 'Qualified',
      contacts: [
        {
          id: `c-init-${Date.now()}`,
          name: lead.contactPerson || 'Representative',
          email: lead.email || 'info@partner.com',
          phone: lead.mobile || '+91 99999 99999',
          role: 'Primary Contact'
        }
      ],
      timeline: [
        {
          id: `t-init-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          type: 'Lead Created',
          title: 'CRM Partnership Seeded from Sales Lead',
          details: `Lead "${lead.title}" converted successfully. Lifecycle transitioned into active pipeline stage.`,
          status: 'SUCCESS'
        }
      ]
    };

    // 1. Add CRM Account
    const updatedAccounts = [newCrmAccount, ...accounts];
    saveCrmAccountsList(updatedAccounts);

    // 2. Update status of the Lead in appStore to 'Converted'
    try {
      const savedLeadsStr = appStore.getItem('realtyconnect_leads');
      if (savedLeadsStr) {
        const currentLeads = JSON.parse(savedLeadsStr);
        const updatedLeads = currentLeads.map((l: any) => {
          if (l.id === lead.id) {
            return {
              ...l,
              status: 'Converted',
              timeline: [
                ...(l.timeline || []),
                { id: `t-conv-${Date.now()}`, date: new Date().toISOString().substring(0, 10), type: 'Converted to CRM', text: 'Lead successfully upgraded into active enterprise relationship account.' }
              ]
            };
          }
          return l;
        });
        appStore.setItem('realtyconnect_leads', JSON.stringify(updatedLeads));
        setExternalLeads(updatedLeads);
      }
    } catch(e) { console.error(e); }

    setSelectedAccountId(newCrmAccount.id);
    triggerNotification('Lead Converted to CRM Customer!', `Upgraded relationship stage for ${newCrmAccount.name}.`);
  };

  // Create new CRM Account via modal
  const handleCreateCrmAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountForm.name?.trim()) {
      showToast('Please enter corporate business name.', 'error');
      return;
    }

    const createdAccount: CrmAccount = {
      id: `RC-CRM-${Date.now().toString().slice(-4)}`,
      name: newAccountForm.name,
      businessType: newAccountForm.businessType as any,
      industry: newAccountForm.industry || 'Infrastructure Logistics',
      address: newAccountForm.address || 'Corporate Corporate Hub, MH',
      gstNumber: newAccountForm.gstNumber || '27AAACA1122D1ZX',
      website: newAccountForm.website || `www.${newAccountForm.name.toLowerCase().replace(/\s+/g, '')}.com`,
      businessCategory: newAccountForm.businessCategory || 'Developers',
      verificationStatus: newAccountForm.verificationStatus as any,
      membershipStatus: newAccountForm.membershipStatus as any,
      relationshipStatus: newAccountForm.relationshipStatus as any,
      assignedManager: newAccountForm.assignedManager || currentUserName(),
      customerSince: new Date().toISOString().split('T')[0],
      businessValue: Number(newAccountForm.businessValue) || 10,
      currentStage: newAccountForm.currentStage as any,
      contacts: newAccountForm.contacts || [],
      timeline: [
        {
          id: `t-created-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          type: 'Status Change',
          title: 'CRM Onboarding Finalized',
          details: 'Standard corporate account directory structure configured and approved by RM.',
          status: 'SUCCESS'
        }
      ]
    };

    const updated = [createdAccount, ...accounts];
    saveCrmAccountsList(updated);
    setIsAddModalOpen(false);
    setSelectedAccountId(createdAccount.id);
    
    // Reset form
    setNewAccountForm({
      name: '',
      businessType: 'Corporate Customer',
      industry: '',
      address: '',
      gstNumber: '',
      website: '',
      businessCategory: 'Developers',
      verificationStatus: 'Verified',
      membershipStatus: 'Standard',
      relationshipStatus: 'Warm',
      assignedManager: currentUserName(),
      currentStage: 'Prospect',
      businessValue: 10,
      contacts: []
    });

    triggerNotification('Corporate CRM Account Registered', `Successfully initialized ${createdAccount.name} into CRM workspace.`);
  };

  // Edit CRM Account Stage or details
  const handleEditCrmAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAccountForm) return;

    const original = accounts.find(a => a.id === editAccountForm.id);
    const timelineUpdates: CrmTimelineEvent[] = [...(original?.timeline || [])];

    // Track state changes
    if (original?.currentStage !== editAccountForm.currentStage) {
      timelineUpdates.unshift({
        id: `t-stage-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: 'Status Change',
        title: 'Relationship Stage Updated',
        details: `Transitioned lifecycle from [${original?.currentStage}] to [${editAccountForm.currentStage}]`,
        status: 'SUCCESS'
      });
    }

    if (original?.relationshipStatus !== editAccountForm.relationshipStatus) {
      timelineUpdates.unshift({
        id: `t-rel-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        type: 'Relationship Update',
        title: 'Relationship Temperature Shift',
        details: `Re-evaluated communication quality from [${original?.relationshipStatus}] to [${editAccountForm.relationshipStatus}]`,
        status: 'WARNING'
      });
    }

    const updatedAccount: CrmAccount = {
      ...editAccountForm,
      timeline: timelineUpdates
    };

    const updated = accounts.map(a => a.id === updatedAccount.id ? updatedAccount : a);
    saveCrmAccountsList(updated);
    setIsEditModalOpen(false);
    triggerNotification('Relationship Record Updated', `Successfully refreshed enterprise variables for ${updatedAccount.name}.`);
  };

  // Delete CRM relationship
  const handleDeleteCrmAccount = (id: string) => {
    if (window.confirm('Are you sure you want to decouple this business relationship from active CRM dashboard? This will not delete historical logs.')) {
      const updated = accounts.filter(a => a.id !== id);
      saveCrmAccountsList(updated);
      setSelectedAccountId(updated[0]?.id || null);
      showToast('CRM account decoupled successfully.', 'info');
    }
  };

  // Filter accounts list
  const filteredAccounts = accounts.filter(acc => {
    const matchSearch = 
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.assignedManager.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.contacts.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchType = filterType === 'All' || acc.businessType === filterType;
    const matchStage = filterStage === 'All' || acc.currentStage === filterStage;
    const matchIndustry = filterIndustry === 'All' || acc.industry.toLowerCase().includes(filterIndustry.toLowerCase());
    const matchManager = filterManager === 'All' || acc.assignedManager === filterManager;
    const matchRelation = filterRelation === 'All' || acc.relationshipStatus === filterRelation;

    return matchSearch && matchType && matchStage && matchIndustry && matchManager && matchRelation;
  }).sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'value') return b.businessValue - a.businessValue;
    if (sortBy === 'customerSince') return b.customerSince.localeCompare(a.customerSince);
    if (sortBy === 'health') {
      const scores = { Hot: 3, Warm: 2, Cold: 1, Disengaged: 0 };
      return (scores[b.relationshipStatus] || 0) - (scores[a.relationshipStatus] || 0);
    }
    return 0;
  });

  // Calculate high-fidelity stats
  const totalAccountsCount = accounts.length;
  const activeCustomers = accounts.filter(a => ['Customer', 'Preferred Customer', 'Strategic Partner'].includes(a.currentStage)).length;
  const prospects = accounts.filter(a => a.currentStage === 'Prospect').length;
  const strategicPartners = accounts.filter(a => a.currentStage === 'Strategic Partner').length;
  const totalPipelineValue = accounts.reduce((acc, curr) => acc + (curr.businessValue || 0), 0);
  
  // Followups due (dynamic simulated count)
  const pendingFollowupsCount = externalLeads.filter(l => l.status === 'Negotiation' || l.status === 'Quotation Sent').length;
  const scheduledMeetingsCount = externalMeetings.filter(m => m.status === 'Scheduled').length;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 font-sans text-slate-300">
      
      {/* Upper Enterprise Branding Header */}
      <div className="bg-slate-950 border-b border-slate-900 p-4 sm:px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-extrabold tracking-widest">
              Customer CRM
            </span>
            <span className="text-[10px] font-mono text-slate-500">• One record for every account</span>
          </div>
          <h1 className="text-xl font-display font-black text-white uppercase tracking-tight flex items-center gap-2 mt-1">
            <Building2 className="w-5 h-5 text-indigo-500" />
            Enterprise CRM relationship Hub
          </h1>
        </div>

        {/* Top summary cards */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs px-4 py-2 rounded-xl border border-indigo-500 shadow-lg shadow-indigo-600/10 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Register Corporate Client
          </button>
        </div>
      </div>

      {/* CRM DASHBOARD BANNER */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 p-4 sm:px-6 bg-slate-950/40 border-b border-slate-900">
        
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-900 flex flex-col justify-between">
          <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">Total CRM Portfolio</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-white">{totalAccountsCount}</span>
            <span className="text-[10px] text-slate-400 font-mono">Accounts</span>
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-900 flex flex-col justify-between">
          <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">Active Customers</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-emerald-400">{activeCustomers}</span>
            <span className="text-[10px] text-emerald-500 font-mono">Stage 3-5</span>
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-900 flex flex-col justify-between">
          <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">Strategic Partners</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-indigo-400">{strategicPartners}</span>
            <span className="text-[10px] text-slate-400 font-mono">Alliance</span>
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-900 flex flex-col justify-between">
          <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">B2B Opportunities</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-yellow-400">₹{totalPipelineValue}</span>
            <span className="text-[9px] text-yellow-500 font-bold">Lakhs Value</span>
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-900 flex flex-col justify-between">
          <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">Follow-ups Due</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-rose-400">{pendingFollowupsCount}</span>
            <span className="text-[9px] text-rose-500 font-bold">Sales Lead</span>
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-900 flex flex-col justify-between">
          <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">Scheduled Meetings</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-black text-blue-400">{scheduledMeetingsCount}</span>
            <span className="text-[10px] text-slate-400 font-mono">Upcoming</span>
          </div>
        </div>

      </div>

      {/* CORE SPLIT SCREEN VIEW */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-[calc(100vh-180px)]">
        
        {/* LEFT COLUMN: DIRECTORY ENGINE (5/12 grid span) */}
        <div className="lg:col-span-5 border-r border-slate-900 flex flex-col bg-slate-950 h-full overflow-hidden">
          
          {/* SEARCH & FILTERS CONTROLS PANEL */}
          <div className="p-4 border-b border-slate-900 bg-slate-950 space-y-3 shrink-0">
            
            {/* Unified Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search Account name, contacts, manager, RMX..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 hover:border-slate-800 focus:border-indigo-500 rounded-xl py-2 pl-9 pr-4 text-xs text-white outline-none placeholder:text-slate-500 transition-colors"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills Grid */}
            <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
              
              <div>
                <label className="text-[8px] text-slate-500 uppercase font-bold block mb-0.5">Category</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded px-1.5 py-1 text-slate-300 outline-none"
                >
                  <option value="All">All Types</option>
                  <option value="Corporate Customer">Corporate Customer</option>
                  <option value="Supplier">Supplier</option>
                  <option value="Vendor">Vendor</option>
                  <option value="Channel Partner">Channel Partner</option>
                  <option value="Consultant">Consultant</option>
                  <option value="Bank & Financial Institution">Financial Inst.</option>
                  <option value="Government Organization">Govt Org</option>
                </select>
              </div>

              <div>
                <label className="text-[8px] text-slate-500 uppercase font-bold block mb-0.5">Stage</label>
                <select
                  value={filterStage}
                  onChange={(e) => setFilterStage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded px-1.5 py-1 text-slate-300 outline-none"
                >
                  <option value="All">All Stages</option>
                  <option value="Prospect">Prospect</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Customer">Customer</option>
                  <option value="Preferred Customer">Preferred Customer</option>
                  <option value="Strategic Partner">Strategic Partner</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="text-[8px] text-slate-500 uppercase font-bold block mb-0.5">Relationship</label>
                <select
                  value={filterRelation}
                  onChange={(e) => setFilterRelation(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded px-1.5 py-1 text-slate-300 outline-none"
                >
                  <option value="All">All Relations</option>
                  <option value="Hot">🔥 Hot</option>
                  <option value="Warm">☀️ Warm</option>
                  <option value="Cold">❄️ Cold</option>
                  <option value="Disengaged">💤 Disengaged</option>
                </select>
              </div>

            </div>

            {/* Sorting & Layout selection */}
            <div className="flex items-center justify-between text-[10px] pt-1">
              <div className="flex items-center gap-2 font-mono text-slate-400">
                <span>SORT:</span>
                <button
                  onClick={() => setSortBy('name')}
                  className={`underline decoration-indigo-500/50 hover:text-white ${sortBy === 'name' ? 'text-indigo-400 font-bold' : ''}`}
                >
                  Alphabetical
                </button>
                <button
                  onClick={() => setSortBy('value')}
                  className={`underline decoration-indigo-500/50 hover:text-white ${sortBy === 'value' ? 'text-indigo-400 font-bold' : ''}`}
                >
                  Value
                </button>
                <button
                  onClick={() => setSortBy('health')}
                  className={`underline decoration-indigo-500/50 hover:text-white ${sortBy === 'health' ? 'text-indigo-400 font-bold' : ''}`}
                >
                  Relation
                </button>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900 p-0.5 rounded-lg border border-slate-850">
                <button
                  onClick={() => setViewLayout('list')}
                  className={`px-2 py-0.5 rounded font-mono text-[9px] ${viewLayout === 'list' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'}`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewLayout('grid')}
                  className={`px-2 py-0.5 rounded font-mono text-[9px] ${viewLayout === 'grid' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'}`}
                >
                  Grid
                </button>
              </div>
            </div>

          </div>

          {/* CRM DIRECTORY MAIN CONTAINER LIST */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {filteredAccounts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 italic text-xs border border-dashed border-slate-900 rounded-2xl">
                No CRM relationships found matching query.
              </div>
            ) : viewLayout === 'list' ? (
              filteredAccounts.map(acc => {
                const isSelected = acc.id === selectedAccount?.id;
                return (
                  <div
                    key={acc.id}
                    onClick={() => handleSelectAccount(acc.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-150 text-left relative ${
                      isSelected 
                        ? 'bg-indigo-950/20 border-indigo-500/60 shadow-lg shadow-indigo-600/5' 
                        : 'bg-slate-950 border-slate-900 hover:border-slate-800'
                    }`}
                  >
                    {/* Selected Left Ribbon Accent */}
                    {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-xl" />}

                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs text-slate-100 truncate group-hover:text-indigo-400">
                            {acc.name}
                          </h4>
                          {acc.verificationStatus === 'Verified' && (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{acc.industry}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          ₹{acc.businessValue}L
                        </span>
                      </div>
                    </div>

                    {/* Metadata indicators bar */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-900/40 text-[9px] font-mono">
                      <span className="text-slate-500">{acc.businessCategory}</span>
                      <span className="text-slate-500">•</span>
                      <span className={`font-bold ${
                        acc.relationshipStatus === 'Hot' ? 'text-rose-400' :
                        acc.relationshipStatus === 'Warm' ? 'text-yellow-400' :
                        'text-sky-400'
                      }`}>
                        {acc.relationshipStatus === 'Hot' ? '🔥 HOT' : acc.relationshipStatus === 'Warm' ? '☀️ WARM' : '❄️ COLD'}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-850 text-[8.5px]">
                        {acc.currentStage}
                      </span>
                      
                      <div className="ml-auto text-slate-500 flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-500" />
                        <span>{acc.contacts?.length || 0} Stakeholder(s)</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              // GRID CARD VIEW LAYOUT
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredAccounts.map(acc => {
                  const isSelected = acc.id === selectedAccount?.id;
                  return (
                    <div
                      key={acc.id}
                      onClick={() => handleSelectAccount(acc.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all text-left flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-indigo-950/20 border-indigo-500/60 shadow-lg shadow-indigo-600/5' 
                          : 'bg-slate-950 border-slate-900 hover:border-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-[8px] font-mono uppercase text-slate-500 tracking-wider">
                            {acc.businessCategory}
                          </span>
                          <span className={`text-[8px] font-mono px-1 py-0.2 rounded font-bold ${
                            acc.relationshipStatus === 'Hot' ? 'text-rose-400 bg-rose-500/10' :
                            acc.relationshipStatus === 'Warm' ? 'text-yellow-400 bg-yellow-500/10' :
                            'text-sky-400 bg-sky-500/10'
                          }`}>
                            {acc.relationshipStatus}
                          </span>
                        </div>

                        <h4 className="font-bold text-xs text-slate-200 mt-1.5 line-clamp-1 flex items-center gap-1">
                          {acc.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{acc.industry}</p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-900/60 flex items-center justify-between text-[9px] font-mono">
                        <span className="text-slate-400 bg-slate-900 px-1 py-0.5 rounded border border-slate-850">
                          {acc.currentStage}
                        </span>
                        <span className="font-bold text-slate-300">
                          ₹{acc.businessValue}L
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: 360 CRM PROFILE INSPECTOR & OUTCOMES PANEL (7/12 grid span) */}
        <div className="lg:col-span-7 bg-slate-950 flex flex-col h-full overflow-hidden">
          {selectedAccount ? (
            <div className="flex flex-col h-full overflow-hidden">
              
              {/* Profile Main Header Block */}
              <div className="p-4 sm:p-5 border-b border-slate-900 bg-slate-950 shrink-0">
                
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[8px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.2 rounded tracking-widest font-extrabold uppercase">
                        {selectedAccount.businessType}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">Since {selectedAccount.customerSince}</span>
                      <span className="text-[9px] font-mono text-slate-500">•</span>
                      <span className="text-[9px] font-mono text-slate-500">ID: {selectedAccount.id}</span>
                    </div>

                    <h2 className="text-base font-display font-black text-white mt-1.5 flex items-center gap-2">
                      {selectedAccount.name}
                      {selectedAccount.verificationStatus === 'Verified' && (
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      )}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedAccount.industry}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setEditAccountForm(selectedAccount);
                        setIsEditModalOpen(true);
                      }}
                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-850"
                      title="Edit Account Stage"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCrmAccount(selectedAccount.id)}
                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-rose-400 rounded-lg border border-slate-850"
                      title="Decouple Customer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Grid of details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3.5 p-3 bg-slate-950/45 border border-slate-900 rounded-xl text-[10px] font-mono">
                  <div>
                    <span className="block text-slate-500 uppercase text-[8px] font-bold">GSTIN Registration</span>
                    <span className="text-slate-300 font-bold">{selectedAccount.gstNumber || 'Placeholder'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 uppercase text-[8px] font-bold">Relationship Manager</span>
                    <span className="text-slate-300 font-bold">{selectedAccount.assignedManager || 'Unassigned'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 uppercase text-[8px] font-bold">Premium Membership</span>
                    <span className="text-indigo-400 font-bold">{selectedAccount.membershipStatus || 'Standard'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 uppercase text-[8px] font-bold">Physical Address</span>
                    <span className="text-slate-400 truncate block" title={selectedAccount.address}>{selectedAccount.address}</span>
                  </div>
                </div>

                {/* Additional Quick Info: Website / Category */}
                <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-slate-400 px-1">
                  <div className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-slate-500" />
                    <a href={`https://${selectedAccount.website}`} target="_blank" rel="noreferrer" className="hover:text-indigo-400 underline">
                      {selectedAccount.website}
                    </a>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Award className="w-3 h-3 text-indigo-400" />
                    <span>Stage: <strong className="text-indigo-400">{selectedAccount.currentStage}</strong></span>
                  </div>
                </div>

              </div>

              {/* CRM ACTIVITY INPUTS & ACTION HUB */}
              <div className="px-4 py-2 border-b border-slate-900 bg-slate-950/60 shrink-0">
                
                {/* Tabs to select activity */}
                <div className="flex items-center gap-3 border-b border-slate-900/60 pb-1.5 overflow-x-auto text-[10px] font-mono font-bold text-slate-500">
                  <button 
                    onClick={() => setActivityTab('note')}
                    className={`pb-1 px-1 transition-all flex items-center gap-1 ${activityTab === 'note' ? 'text-indigo-400 border-b-2 border-indigo-500 font-black' : 'hover:text-slate-300'}`}
                  >
                    <FileText className="w-3 h-3" /> Log Note
                  </button>
                  <button 
                    onClick={() => setActivityTab('call')}
                    className={`pb-1 px-1 transition-all flex items-center gap-1 ${activityTab === 'call' ? 'text-indigo-400 border-b-2 border-indigo-500 font-black' : 'hover:text-slate-300'}`}
                  >
                    <Phone className="w-3 h-3" /> Log Call
                  </button>
                  <button 
                    onClick={() => setActivityTab('visit')}
                    className={`pb-1 px-1 transition-all flex items-center gap-1 ${activityTab === 'visit' ? 'text-indigo-400 border-b-2 border-indigo-500 font-black' : 'hover:text-slate-300'}`}
                  >
                    <MapPin className="w-3 h-3" /> Visit Log
                  </button>
                  <button 
                    onClick={() => setActivityTab('meeting')}
                    className={`pb-1 px-1 transition-all flex items-center gap-1 ${activityTab === 'meeting' ? 'text-indigo-400 border-b-2 border-indigo-500 font-black' : 'hover:text-slate-300'}`}
                  >
                    <Calendar className="w-3 h-3" /> Schedule Meeting
                  </button>
                  <button 
                    onClick={() => setActivityTab('contact')}
                    className={`pb-1 px-1 transition-all flex items-center gap-1 ${activityTab === 'contact' ? 'text-indigo-400 border-b-2 border-indigo-500 font-black' : 'hover:text-slate-300'}`}
                  >
                    <Users className="w-3 h-3" /> Link Stakeholder
                  </button>
                  <button 
                    onClick={() => setActivityTab('document')}
                    className={`pb-1 px-1 transition-all flex items-center gap-1 ${activityTab === 'document' ? 'text-indigo-400 border-b-2 border-indigo-500 font-black' : 'hover:text-slate-300'}`}
                  >
                    <Briefcase className="w-3 h-3" /> Doc Reference
                  </button>
                  <button 
                    onClick={() => setActivityTab('convert')}
                    className={`pb-1 px-1 transition-all flex items-center gap-1 ${activityTab === 'convert' ? 'text-indigo-400 border-b-2 border-indigo-500 font-black text-yellow-400' : 'hover:text-slate-300'}`}
                  >
                    <Sparkles className="w-3 h-3 text-yellow-400" /> Conversion Hub
                  </button>
                </div>

                {/* Form Panels for specific actions */}
                <div className="pt-2 text-xs">
                  
                  {activityTab === 'note' && (
                    <form onSubmit={handleSaveNote} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Log dynamic business update, negotiation highlights, action items..."
                        value={customNote}
                        onChange={(e) => setCustomNote(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-850 hover:border-slate-800 focus:border-indigo-500 rounded-lg p-2 text-xs text-white outline-none"
                      />
                      <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-[10px] px-3.5 rounded-lg border border-indigo-500 shrink-0">
                        Log Note
                      </button>
                    </form>
                  )}

                  {activityTab === 'call' && (
                    <form onSubmit={handleSaveCall} className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <select
                          value={callLog.duration}
                          onChange={(e) => setCallLog({ ...callLog, duration: e.target.value })}
                          className="bg-slate-900 border border-slate-850 text-[10px] text-slate-300 rounded p-1.5 outline-none font-mono"
                        >
                          <option value="5 Mins">5 Mins Duration</option>
                          <option value="15 Mins">15 Mins Duration</option>
                          <option value="30 Mins">30 Mins Duration</option>
                          <option value="1 Hour">1 Hour Strategic Call</option>
                        </select>

                        <select
                          value={callLog.outcome}
                          onChange={(e) => setCallLog({ ...callLog, outcome: e.target.value })}
                          className="bg-slate-900 border border-slate-850 text-[10px] text-slate-300 rounded p-1.5 outline-none font-mono"
                        >
                          <option value="Connected">Connected & Aligned</option>
                          <option value="Left Voicemail">Left Voicemail</option>
                          <option value="Gatekeeper Blocked">Gatekeeper Blocked</option>
                          <option value="Busy / Callback Requested">Callback Requested</option>
                        </select>

                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-[10px] rounded border border-indigo-500">
                          Register Call
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Describe exact call objectives and pricing points aligned on..."
                        value={callLog.summary}
                        onChange={(e) => setCallLog({ ...callLog, summary: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-850 hover:border-slate-800 focus:border-indigo-500 rounded p-2 text-xs text-white outline-none"
                      />
                    </form>
                  )}

                  {activityTab === 'visit' && (
                    <form onSubmit={handleSaveVisit} className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Purpose (e.g. Concrete Audit)"
                          value={visitLog.purpose}
                          onChange={(e) => setVisitLog({ ...visitLog, purpose: e.target.value })}
                          className="bg-slate-900 border border-slate-850 text-[10px] rounded p-1.5 outline-none text-slate-200 font-mono"
                        />
                        <input
                          type="text"
                          placeholder="Attendees (e.g. Vikram Malhotra, Rajesh)"
                          value={visitLog.attendees}
                          onChange={(e) => setVisitLog({ ...visitLog, attendees: e.target.value })}
                          className="bg-slate-900 border border-slate-850 text-[10px] rounded p-1.5 outline-none text-slate-200 font-mono"
                        />
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-[10px] rounded border border-indigo-500">
                          Register Visit Log
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Log detailed on-site findings, concrete sample tests verified, etc."
                        value={visitLog.feedback}
                        onChange={(e) => setVisitLog({ ...visitLog, feedback: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-850 hover:border-slate-800 focus:border-indigo-500 rounded p-2 text-xs text-white outline-none"
                      />
                    </form>
                  )}

                  {activityTab === 'meeting' && (
                    <div className="p-2.5 bg-indigo-950/20 border border-indigo-900/60 rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-xs text-indigo-300">Schedule Strategic Consultation</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Redirect to integrated RealtyConnect calendar with prefilled client details.</p>
                      </div>
                      <button
                        onClick={() => {
                          const data = {
                            title: `Executive Discussion with ${selectedAccount.name}`,
                            meetingType: 'Client Discussion',
                            relatedCompany: selectedAccount.name,
                            companyId: selectedAccount.id,
                            contactPerson: selectedAccount.contacts[0]?.name || 'Representative',
                            meetingDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                            startTime: '10:00',
                            endTime: '11:00',
                            location: 'Corporate Suite 3B',
                            meetingMode: 'In Person',
                            priority: 'High',
                            agenda: 'Review commercial rate sheets, RERA compliance certificates, and credit limits.'
                          };
                          appStore.setItem('realtyconnect_prefill_meeting', JSON.stringify(data));
                          if (setActiveViewMode) {
                            setActiveViewMode('meetings');
                            showToast(`Configured calendar prefill for ${selectedAccount.name}`, 'success');
                          }
                        }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-[10px] px-3.5 py-1.5 rounded-lg border border-indigo-500 shrink-0"
                      >
                        Launch Calendar Wizard
                      </button>
                    </div>
                  )}

                  {activityTab === 'contact' && (
                    <form onSubmit={handleSaveContact} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="Contact Name"
                        value={newContact.name}
                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                        className="bg-slate-900 border border-slate-850 text-[10px] rounded p-1.5 outline-none text-slate-200"
                      />
                      <input
                        type="email"
                        placeholder="Corporate Email"
                        value={newContact.email}
                        onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                        className="bg-slate-900 border border-slate-850 text-[10px] rounded p-1.5 outline-none text-slate-200"
                      />
                      <input
                        type="text"
                        placeholder="Mobile (with country code)"
                        value={newContact.phone}
                        onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                        className="bg-slate-900 border border-slate-850 text-[10px] rounded p-1.5 outline-none text-slate-200"
                      />
                      
                      <div className="flex gap-1.5">
                        <select
                          value={newContact.role}
                          onChange={(e) => setNewContact({ ...newContact, role: e.target.value as any })}
                          className="flex-1 bg-slate-900 border border-slate-850 text-[10px] rounded px-1 outline-none text-slate-300 font-mono"
                        >
                          <option value="Decision Maker">Decision Maker</option>
                          <option value="Technical Contact">Technical Contact</option>
                          <option value="Finance Contact">Finance Contact</option>
                          <option value="Procurement Contact">Procurement Contact</option>
                          <option value="Site Contact">Site Contact</option>
                          <option value="Secondary Contact">Secondary Contact</option>
                          <option value="Emergency Contact">Emergency Contact</option>
                        </select>
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-[10px] px-3.5 rounded border border-indigo-500">
                          Link
                        </button>
                      </div>
                    </form>
                  )}

                  {activityTab === 'document' && (
                    <form onSubmit={handleSaveDocument} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="Document Name (e.g. Steel_BOQ_Locked.xlsx)"
                        value={newDoc.name}
                        onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                        className="sm:col-span-2 bg-slate-900 border border-slate-850 text-[10px] rounded p-1.5 outline-none text-slate-200"
                      />
                      <select
                        value={newDoc.category}
                        onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value as any })}
                        className="bg-slate-900 border border-slate-850 text-[10px] rounded p-1.5 outline-none text-slate-300 font-mono"
                      >
                        <option value="Contract">Master Agreement</option>
                        <option value="NDA">Non-Disclosure (NDA)</option>
                        <option value="Proposal">Commercial Proposal</option>
                        <option value="BOQ">Bill of Quantities (BOQ)</option>
                        <option value="Drawing">Engineering Drawing</option>
                      </select>
                      <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-[10px] rounded border border-indigo-500">
                        Link Document
                      </button>
                    </form>
                  )}

                  {activityTab === 'convert' && (
                    <div className="space-y-2">
                      <div className="bg-yellow-950/15 border border-yellow-900/30 p-2.5 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left">
                        <div>
                          <span className="text-[9px] font-mono font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-1.5 py-0.5 rounded uppercase">
                            Lead Conversion Hub
                          </span>
                          <h4 className="font-bold text-xs text-yellow-200 mt-1">Ready for upgrade into Enterprise Relationships?</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">Below are active B2B sales pipeline leads that can be fully integrated with a single click.</p>
                        </div>
                      </div>

                      {/* List of unconverted leads */}
                      <div className="space-y-1.5 max-h-36 overflow-y-auto mt-2">
                        {externalLeads.filter(l => l.status !== 'Converted' && l.company?.toLowerCase().trim() !== selectedAccount.name.toLowerCase().trim()).map(lead => (
                          <div key={lead.id} className="p-2.5 bg-slate-900/60 border border-slate-850 hover:border-slate-850 rounded-xl flex justify-between items-center text-left">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-mono text-slate-500 font-bold">[{lead.id}]</span>
                                <h5 className="font-bold text-xs text-slate-200">{lead.company}</h5>
                              </div>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">{lead.title} • {lead.contactPerson}</p>
                            </div>

                            <button
                              onClick={() => handleConvertLeadToCustomer(lead)}
                              className="text-[9.5px] font-mono bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-lg border border-indigo-500 flex items-center gap-1 shrink-0"
                            >
                              <UserCheck className="w-3.5 h-3.5" /> Convert Account
                            </button>
                          </div>
                        ))}

                        {externalLeads.filter(l => l.status !== 'Converted' && l.company?.toLowerCase().trim() !== selectedAccount.name.toLowerCase().trim()).length === 0 && (
                          <p className="text-[10px] text-slate-500 italic text-center py-2">No unconverted sales leads available.</p>
                        )}
                      </div>
                    </div>
                  )}

                </div>

              </div>

              {/* TABS OF COMPILATIONS: 360 AGGREGATE TIMELINE & TEAM */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden bg-slate-950">
                
                {/* MIDDLE PANEL: 360-degree Aggregate Activity Timeline (8/12 grid span) */}
                <div className="md:col-span-8 border-r border-slate-900 flex flex-col h-full overflow-hidden">
                  <div className="p-3 bg-slate-950/40 border-b border-slate-900 flex items-center justify-between shrink-0">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400 animate-pulse" />
                      360° RELATIONSHIP LIFECYCLE TIMELINE
                    </span>
                    <span className="text-[9px] font-mono bg-slate-900 text-indigo-400 border border-slate-850 px-2 py-0.2 rounded font-bold uppercase">
                      Auto-Aggregated from All Channels
                    </span>
                  </div>

                  {/* Aggregated timeline items */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {getAggregatedTimeline(selectedAccount).length === 0 ? (
                      <p className="text-xs text-slate-500 italic text-center py-8">No historical relationship actions compiled yet.</p>
                    ) : (
                      getAggregatedTimeline(selectedAccount).map((event, idx) => (
                        <div key={event.id || idx} className="flex gap-3 text-left group">
                          
                          {/* Left indicator line */}
                          <div className="flex flex-col items-center">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-black ${
                              event.type === 'Lead Created' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                              event.type === 'Meeting' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                              event.type === 'Message' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                              event.type === 'RFQ' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                              event.type === 'Call Log' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' :
                              event.type === 'Visit Log' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              'bg-slate-900 text-slate-400 border border-slate-850'
                            }`}>
                              {event.type === 'Lead Created' ? 'LE' : 
                               event.type === 'Meeting' ? 'MT' : 
                               event.type === 'Message' ? 'MS' : 
                               event.type === 'RFQ' ? 'RF' :
                               event.type === 'Call Log' ? 'CL' :
                               event.type === 'Visit Log' ? 'VL' : 'NT'}
                            </div>
                            <div className="w-0.5 flex-1 bg-slate-900 mt-2" />
                          </div>

                          {/* Event Body */}
                          <div className="flex-1 bg-slate-950/50 p-3 border border-slate-900 hover:border-slate-850 rounded-xl transition-colors">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono text-slate-500 font-bold bg-slate-900 px-1.5 py-0.2 rounded">
                                {event.source?.toUpperCase()}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500">
                                {event.timestamp}
                              </span>
                            </div>

                            <h5 className="font-bold text-xs text-slate-200 mt-1.5 group-hover:text-indigo-400 transition-colors">
                              {event.title}
                            </h5>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-sans mt-1">
                              {event.details}
                            </p>
                          </div>

                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* RIGHT PANEL: LINKED STAKEHOLDERS DIRECTORY (4/12 grid span) */}
                <div className="md:col-span-4 flex flex-col h-full overflow-hidden">
                  <div className="p-3 bg-slate-950/40 border-b border-slate-900 flex items-center justify-between shrink-0">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-400" />
                      Linked Contacts ({selectedAccount.contacts?.length || 0})
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
                    {selectedAccount.contacts?.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic text-center py-6">No associated contacts defined for corporate customer.</p>
                    ) : (
                      selectedAccount.contacts.map((contact, idx) => (
                        <div key={contact.id || idx} className="p-3 bg-slate-900/40 border border-slate-900 rounded-xl space-y-1.5 text-left hover:border-slate-850 transition-colors">
                          <div className="flex justify-between items-start gap-1">
                            <span className="text-[8.5px] font-mono font-bold uppercase tracking-wide bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.2 rounded shrink-0">
                              {contact.role}
                            </span>
                          </div>

                          <h5 className="font-bold text-xs text-slate-200">{contact.name}</h5>
                          
                          <div className="space-y-1 pt-1 border-t border-slate-900 text-[10px] font-mono text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-slate-500" />
                              <a href={`mailto:${contact.email}`} className="hover:text-indigo-400 underline">{contact.email}</a>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-500" />
                              <a href={`tel:${contact.phone}`} className="hover:text-indigo-400">{contact.phone}</a>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500 italic">
              Please register or select a corporate customer relationship above.
            </div>
          )}
        </div>

      </div>

      {/* MODAL: REGISTER NEW CRM ACCOUNT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-950 border border-slate-850 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl shadow-indigo-600/5">
            
            <div className="p-4 bg-slate-950 border-b border-slate-900 flex items-center justify-between">
              <h3 className="font-display font-black text-sm text-white uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-400" />
                Register CRM relationship account
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCrmAccount} className="p-5 space-y-4 text-left text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Materials Ltd"
                    value={newAccountForm.name}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Relationship Type *</label>
                  <select
                    value={newAccountForm.businessType}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, businessType: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none focus:border-indigo-500"
                  >
                    <option value="Corporate Customer">Corporate Customer</option>
                    <option value="Supplier">Supplier / Wholesale dealer</option>
                    <option value="Vendor">Vendor / Subcontractor</option>
                    <option value="Channel Partner">Channel Partner / DSA</option>
                    <option value="Consultant">Consultant / Advisory</option>
                    <option value="Bank & Financial Institution">Bank & Financial Institution</option>
                    <option value="Government Organization">Government Organization</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Core Industry / Line *</label>
                  <input
                    type="text"
                    placeholder="e.g. Cement, Structural Steel"
                    value={newAccountForm.industry}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, industry: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Business Directory Category *</label>
                  <select
                    value={newAccountForm.businessCategory}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, businessCategory: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none focus:border-indigo-500"
                  >
                    <option value="Developers">Developers / Builders</option>
                    <option value="Contractors">Contractors / Civil Engineers</option>
                    <option value="Vendors">Vendors / Suppliers</option>
                    <option value="Consultants">Consultants / Advisors</option>
                    <option value="Banks">Banks & escrows</option>
                    <option value="DSAs">DSAs / Brokers</option>
                    <option value="Equipment">Equipment / Machinery</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Relationship Manager</label>
                  <input
                    type="text"
                    value={newAccountForm.assignedManager}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, assignedManager: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">GSTIN Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 27AAACA..."
                    value={newAccountForm.gstNumber}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, gstNumber: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-indigo-500 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Annual Value (₹ Lakhs)</label>
                  <input
                    type="number"
                    value={newAccountForm.businessValue}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, businessValue: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Lifecycle Stage</label>
                  <select
                    value={newAccountForm.currentStage}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, currentStage: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-300 outline-none"
                  >
                    <option value="Prospect">Prospect</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Customer">Customer</option>
                    <option value="Preferred Customer">Preferred Customer</option>
                    <option value="Strategic Partner">Strategic Partner</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Relationship Temp</label>
                  <select
                    value={newAccountForm.relationshipStatus}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, relationshipStatus: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-300 outline-none"
                  >
                    <option value="Warm">☀️ Warm</option>
                    <option value="Hot">🔥 Hot</option>
                    <option value="Cold">❄️ Cold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Corporate Website</label>
                  <input
                    type="text"
                    placeholder="www.partner.com"
                    value={newAccountForm.website}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, website: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Corporate HQ Address</label>
                <textarea
                  rows={2}
                  placeholder="Street details, business complex, city, state..."
                  value={newAccountForm.address}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, address: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-900 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 font-mono text-[10px] font-bold rounded-lg border border-slate-850"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[10px] font-bold rounded-lg border border-indigo-500 shadow-lg shadow-indigo-600/15"
                >
                  Save & Link Relationship
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL: EDIT RELATIONSHIP VARIABLE */}
      {isEditModalOpen && editAccountForm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-950 border border-slate-850 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-indigo-600/5">
            
            <div className="p-4 bg-slate-950 border-b border-slate-900 flex items-center justify-between">
              <h3 className="font-display font-black text-xs text-white uppercase tracking-wider">
                Upgrade relationship stage: {editAccountForm.name}
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditCrmAccount} className="p-5 space-y-4 text-left text-xs">
              
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Assigned Relationship Manager</label>
                <input
                  type="text"
                  required
                  value={editAccountForm.assignedManager}
                  onChange={(e) => setEditAccountForm({ ...editAccountForm, assignedManager: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Customer Stage</label>
                  <select
                    value={editAccountForm.currentStage}
                    onChange={(e) => setEditAccountForm({ ...editAccountForm, currentStage: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-300 outline-none"
                  >
                    <option value="Prospect">Prospect</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Customer">Customer</option>
                    <option value="Preferred Customer">Preferred Customer</option>
                    <option value="Strategic Partner">Strategic Partner</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Relationship Temp</label>
                  <select
                    value={editAccountForm.relationshipStatus}
                    onChange={(e) => setEditAccountForm({ ...editAccountForm, relationshipStatus: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-300 outline-none"
                  >
                    <option value="Warm">☀️ Warm</option>
                    <option value="Hot">🔥 Hot</option>
                    <option value="Cold">❄️ Cold</option>
                    <option value="Disengaged">💤 Disengaged</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Annual Value (₹ Lakhs)</label>
                  <input
                    type="number"
                    value={editAccountForm.businessValue}
                    onChange={(e) => setEditAccountForm({ ...editAccountForm, businessValue: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Membership Status</label>
                  <select
                    value={editAccountForm.membershipStatus}
                    onChange={(e) => setEditAccountForm({ ...editAccountForm, membershipStatus: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-300 outline-none"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Basic">Basic</option>
                    <option value="Premium Gold">Premium Gold</option>
                    <option value="Elite Plus">Elite Plus</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-900 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 font-mono text-[10px] font-bold rounded-lg border border-slate-850"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[10px] font-bold rounded-lg border border-indigo-500 shadow-lg"
                >
                  Save Stage Transition
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
