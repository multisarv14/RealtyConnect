/**
 * RealtyConnect™ Sprint 10 - Business Opportunities Engine Module
 * A premium professional B2B Opportunity Exchange portal for real estate stakeholders.
 */

import { currentOrgId, currentOrgName, currentOrgVerified } from '../lib/identity';
import { appStore } from '../lib/appStore';
import { api, errorMessage } from '../lib/api';
import { isRegisteredCompanyId } from '../lib/companies';
import { usePersistentState } from '../lib/usePersistentState';
import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  ArrowRight, 
  Bookmark, 
  Share2, 
  AlertTriangle, 
  Clock, 
  Award, 
  Send, 
  RefreshCw, 
  ChevronRight, 
  X, 
  FileText, 
  Check, 
  Eye, 
  Sparkles, 
  Building2, 
  UserCheck, 
  Megaphone, 
  FolderCheck, 
  History, 
  Lock, 
  Users,
  ShieldCheck,
  ChevronDown,
  Info,
  Layers,
  Heart,
  Flag,
  CheckSquare
} from 'lucide-react';
import { FeedPost } from './BusinessFeed';

// 21 supported opportunity types
export const OPPORTUNITY_TYPES = [
  'Material Requirement',
  'Service Requirement',
  'Project Requirement',
  'Business Partnership',
  'Joint Venture Opportunity',
  'Investment Opportunity',
  'Hiring Requirement',
  'Equipment Requirement',
  'Rental Requirement',
  'Subcontract Requirement',
  'Consultancy Requirement',
  'Channel Partner Requirement',
  'Distributor Requirement',
  'Dealer Requirement',
  'Banking Requirement',
  'Insurance Requirement',
  'Property Management Requirement',
  'Facility Management Requirement',
  'Marketing Requirement',
  'Technology Requirement',
  'Government Tender Notice (Placeholder)'
];

// 10 key real estate business categories
export const BUSINESS_CATEGORIES = [
  'Builders',
  'Developers',
  'Vendors',
  'Contractors',
  'Consultants',
  'Banks',
  'DSAs',
  'Equipment Suppliers',
  'Property Management',
  'Facility Management'
];

export interface B2BOpportunity {
  id: string;
  title: string;
  type: string;
  category: string;
  companyId: string;
  companyName: string;
  companyLogoBg: string;
  companyLogoText: string;
  verified: boolean;
  premium: boolean;
  description: string;
  requiredProductsServices: string;
  preferredPartnerType: string;
  budget?: string;
  quantity?: string;
  location: {
    state: string;
    city: string;
    area: string;
  };
  expectedStartDate: string;
  expectedClosingDate: string;
  priority: 'Normal' | 'High' | 'Urgent';
  visibility: 'Public' | 'Connections Only' | 'Premium Members';
  status: 'Open' | 'In Progress' | 'Closed' | 'Cancelled';
  postedDate: string;
  responsesCount: number;
  isFeatured?: boolean;
  isTrending?: boolean;
}

// Rich pre-populated high-fidelity B2B opportunities
export const INITIAL_OPPORTUNITIES: B2BOpportunity[] = [
  {
    id: 'opp-1',
    title: 'Procurement of 8,500 Metric Tons of High-Strength Fe550D TMT Reinforcement Steel',
    type: 'Material Requirement',
    category: 'Builders',
    companyId: 'ent-1',
    companyName: 'Apex Developers Ltd',
    companyLogoBg: 'bg-indigo-600',
    companyLogoText: 'AD',
    verified: true,
    premium: true,
    description: 'We are inviting sealed commercial bids from certified manufacturers and primary dealers for bulk supply of Fe550D grade Thermo-Mechanically Treated (TMT) steel bars for our ongoing residential skyscraper projects in Mumbai. Delivery schedule spans 6 months with bi-weekly dispatches. Standard bank escrow backed LC payment terms.',
    requiredProductsServices: 'Fe550D TMT Steel Reinforcement Bars (8mm to 32mm cross-sections)',
    preferredPartnerType: 'Primary Steel Manufacturers, Authorized National Vendors with Bureau Veritas or ISO-9001 certifications.',
    budget: '₹4.5 Crore',
    quantity: '8,500 MT',
    location: {
      state: 'Maharashtra',
      city: 'Mumbai',
      area: 'Bandra Kurla Complex'
    },
    expectedStartDate: '2026-08-15',
    expectedClosingDate: '2026-07-30',
    priority: 'Urgent',
    visibility: 'Public',
    status: 'Open',
    postedDate: '2026-07-16',
    responsesCount: 14,
    isFeatured: true,
    isTrending: true
  },
  {
    id: 'opp-2',
    title: 'Underground Concrete Shoring and Piling Work Subcontract for Metro Corridor Expansion',
    type: 'Subcontract Requirement',
    category: 'Contractors',
    companyId: 'ent-2',
    companyName: 'BuildCorp Construction',
    companyLogoBg: 'bg-emerald-600',
    companyLogoText: 'BC',
    verified: true,
    premium: true,
    description: 'BuildCorp requires a specialized piling agency holding deep-excavation machinery to execute shoring, diaphragm wall casting, and heavy bored cast-in-situ concrete piles. Project involves a 2.1km underground segment of metro works. Contractor must provide full insurance cover and comply with local statutory safety standards.',
    requiredProductsServices: 'Hydraulic Piling Rigs, Diaphragm Wall Construction, Concrete Piling Core Works',
    preferredPartnerType: 'Grade-I Civil Contractors, Heavy Engineering Firms with metro segment experience.',
    budget: '₹8.2 Crore',
    quantity: '420 Piles / 1.2km Shoring',
    location: {
      state: 'Karnataka',
      city: 'Bangalore',
      area: 'Whitefield'
    },
    expectedStartDate: '2026-09-01',
    expectedClosingDate: '2026-08-05',
    priority: 'High',
    visibility: 'Public',
    status: 'Open',
    postedDate: '2026-07-15',
    responsesCount: 8,
    isFeatured: true,
    isTrending: false
  },
  {
    id: 'opp-3',
    title: 'Seeking Strategic Joint Venture Partner for 10-Acre Luxury Lakefront Smart Township',
    type: 'Joint Venture Opportunity',
    category: 'Developers',
    companyId: 'ent-1',
    companyName: 'Apex Developers Ltd',
    companyLogoBg: 'bg-indigo-600',
    companyLogoText: 'AD',
    verified: true,
    premium: true,
    description: 'Apex Developers owns 10 acres of clear-titled RERA pre-approved residential zone land facing Pune lakefront. We are seeking an established B2B equity or joint-development partner to co-execute the premium villas and smart clubhouse components. Land is completely paid up, no encumbrances.',
    requiredProductsServices: 'Equity Capital, Co-development Resources, Luxury Housing Premium Contractors',
    preferredPartnerType: 'Institutional Funds, Premium Residential Developers, Real Estate Syndicates',
    budget: '₹65 Crore',
    quantity: '10 Acres Joint Development',
    location: {
      state: 'Maharashtra',
      city: 'Pune',
      area: 'Mulshi Lakefront'
    },
    expectedStartDate: '2026-10-01',
    expectedClosingDate: '2026-08-15',
    priority: 'Normal',
    visibility: 'Premium Members',
    status: 'Open',
    postedDate: '2026-07-14',
    responsesCount: 4,
    isFeatured: false,
    isTrending: true
  },
  {
    id: 'opp-4',
    title: 'Pneumatic Dry Fly Ash Bulk Logistics Contract (Class-F Grade, IS-3812 Conforming)',
    type: 'Material Requirement',
    category: 'Vendors',
    companyId: 'ent-8',
    companyName: 'Green Brick Logistics',
    companyLogoBg: 'bg-emerald-700',
    companyLogoText: 'GB',
    verified: true,
    premium: false,
    description: 'We require continuous supply of dry Class-F fly ash conforming to IS-3812 guidelines for our green concrete blocks manufacturing facility. Bidders must possess high-capacity closed pneumatic tanker trucks to ensure dust-free fly ash transfer at our plant silo. Contract features stable pricing matrices.',
    requiredProductsServices: 'Class-F Fly Ash Supply, Sealed Tanker Shipping Logistics',
    preferredPartnerType: 'Thermal Power Plant Fly ash authorized distributers, Dry Flyash Processors.',
    budget: '₹85 Lakhs',
    quantity: '15,000 Metric Tons',
    location: {
      state: 'Gujarat',
      city: 'Ahmedabad',
      area: 'Sarkhej Ind Area'
    },
    expectedStartDate: '2026-08-01',
    expectedClosingDate: '2026-07-25',
    priority: 'Normal',
    visibility: 'Public',
    status: 'Open',
    postedDate: '2026-07-16',
    responsesCount: 19,
    isFeatured: false,
    isTrending: true
  },
  {
    id: 'opp-5',
    title: 'Escrow-backed Housing Project Funding Campaign Launch & DSA Partner Expansion',
    type: 'Channel Partner Requirement',
    category: 'Banks',
    companyId: 'ent-5',
    companyName: 'National Trust Bank',
    companyLogoBg: 'bg-blue-600',
    companyLogoText: 'NT',
    verified: true,
    premium: true,
    description: 'National Trust Bank is launching an exclusive retail home-loan tie-up with five RERA registered townships. We are expanding our authorized direct sales agency (DSA) network to fast-track customer mortgage approvals with integrated digital handovers. Offering premium commission grids and instant payouts.',
    requiredProductsServices: 'Home Loan Leads Generation, Customer Verification, Channel Distribution Network',
    preferredPartnerType: 'Registered DSAs, Real Estate Brokers, Financial Consultants, Mortgage Agencies.',
    budget: '₹120 Crore Sanction Target',
    quantity: '30+ DSA Partners',
    location: {
      state: 'Maharashtra',
      city: 'Mumbai',
      area: 'Nariman Point Head Office'
    },
    expectedStartDate: '2026-08-01',
    expectedClosingDate: '2026-07-31',
    priority: 'High',
    visibility: 'Public',
    status: 'Open',
    postedDate: '2026-07-16',
    responsesCount: 32,
    isFeatured: true,
    isTrending: true
  },
  {
    id: 'opp-6',
    title: 'Safety Compliance Audit & ISO certifications consultancy for High-rise Commercial Tech Hub',
    type: 'Consultancy Requirement',
    category: 'Consultants',
    companyId: 'ent-4',
    companyName: 'RealtyConnect Pro Consultants',
    companyLogoBg: 'bg-purple-600',
    companyLogoText: 'RC',
    verified: true,
    premium: true,
    description: 'We are seeking an accredited external safety auditor to evaluate statutory site operations, high-wind crane mechanics compliance, and civil excavation protocols for a 45-story commercial skyscraper. Consultant will formulate safety checklists, conduct scaffolding tests, and handle certification filing.',
    requiredProductsServices: 'OHSAS Safety Site Audits, Statutory Clearance Filings, Safety Manual Drafts',
    preferredPartnerType: 'Accredited Safety Advisors, Government Registered Valuers/Auditors.',
    budget: '₹12 Lakhs',
    quantity: '1 Site Audit Plan',
    location: {
      state: 'Maharashtra',
      city: 'Mumbai',
      area: 'Worli'
    },
    expectedStartDate: '2026-08-10',
    expectedClosingDate: '2026-07-28',
    priority: 'Normal',
    visibility: 'Public',
    status: 'Open',
    postedDate: '2026-07-14',
    responsesCount: 5,
    isFeatured: false,
    isTrending: false
  }
];

interface BusinessOpportunitiesEngineProps {
  userSession: { email: string; role: string; permissions: string[] } | null;
  onLogTriggered: (action: string, entity: string, entityId: string, status: 'SUCCESS' | 'FAILURE' | 'WARNING', details: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  posts: FeedPost[];
  setPosts: React.Dispatch<React.SetStateAction<FeedPost[]>>;
  initialCreateOpen?: boolean;
  onCloseCreatePrefill?: () => void;
  onConvertToRfq?: (opp: any) => void;
}

export default function BusinessOpportunitiesEngine({
  userSession,
  onLogTriggered,
  showToast,
  posts,
  setPosts,
  initialCreateOpen = false,
  onCloseCreatePrefill,
  onConvertToRfq
}: BusinessOpportunitiesEngineProps) {

  // Central opportunities state
  const [opportunities, setOpportunities] = usePersistentState<B2BOpportunity[]>('rc_opportunities', INITIAL_OPPORTUNITIES);
  const [savedOppIds, setSavedOppIds] = usePersistentState<string[]>('rc_opp_saved_ids', ['opp-1', 'opp-4']);
  const [respondedOpps, setRespondedOpps] = usePersistentState<Record<string, { proposalText: string; remarks: string; date: string }>>('rc_opp_responses', {
    'opp-2': { proposalText: 'BuildCorp Metro Proposal v1', remarks: 'Our shoring and heavy rigs are ready to deploy in Bangalore Whitefield immediately.', date: '2026-07-16' }
  });
  const [reportedOppIds, setReportedOppIds] = useState<string[]>([]);

  // View States
  const [currentTab, setCurrentTab] = useState<'all' | 'published' | 'drafts' | 'saved' | 'responded'>('all');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(initialCreateOpen);
  const [selectedOpp, setSelectedOpp] = useState<B2BOpportunity | null>(null);
  const [responseModalOpp, setResponseModalOpp] = useState<B2BOpportunity | null>(null);
  const [reportModalOpp, setReportModalOpp] = useState<B2BOpportunity | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterPremium, setFilterPremium] = useState(false);
  const [filterRecentlyPosted, setFilterRecentlyPosted] = useState(false);
  const [filterClosingSoon, setFilterClosingSoon] = useState(false);

  // Form States for creating new Opportunity
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState(OPPORTUNITY_TYPES[0]);
  const [formCategory, setFormCategory] = useState(BUSINESS_CATEGORIES[0]);
  const [formDescription, setFormDescription] = useState('');
  const [formReqProducts, setFormReqProducts] = useState('');
  const [formPrefPartner, setFormPrefPartner] = useState('');
  const [formBudget, setFormBudget] = useState('');
  const [formQuantity, setFormQuantity] = useState('');
  const [formState, setFormState] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formArea, setFormArea] = useState('');
  const [formStartDate, setFormStartDate] = useState('2026-08-01');
  const [formClosingDate, setFormClosingDate] = useState('2026-07-28');
  const [formPriority, setFormPriority] = useState<'Normal' | 'High' | 'Urgent'>('Normal');
  const [formVisibility, setFormVisibility] = useState<'Public' | 'Connections Only' | 'Premium Members'>('Public');

  // Response Form States
  const [respSendInterest, setRespSendInterest] = useState(true);
  const [respSubmitProposalPlaceholder, setRespSubmitProposalPlaceholder] = useState('');
  const [respAttachProfile, setRespAttachProfile] = useState(true);
  const [respRemarks, setRespRemarks] = useState('');
  const [respScheduleDiscussionPlaceholder, setRespScheduleDiscussionPlaceholder] = useState('');

  // Report Form States
  const [reportReason, setReportReason] = useState('Inaccurate Details');
  const [reportDetails, setReportDetails] = useState('');

  // Clear Form fields
  const resetForm = () => {
    setFormTitle('');
    setFormType(OPPORTUNITY_TYPES[0]);
    setFormCategory(BUSINESS_CATEGORIES[0]);
    setFormDescription('');
    setFormReqProducts('');
    setFormPrefPartner('');
    setFormBudget('');
    setFormQuantity('');
    setFormState('');
    setFormCity('');
    setFormArea('');
    setFormStartDate('2026-08-01');
    setFormClosingDate('2026-07-28');
    setFormPriority('Normal');
    setFormVisibility('Public');
  };

  // Handle Opportunity Creation
  const handleCreateOpportunity = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim() || !formDescription.trim() || !formCity.trim()) {
      showToast('Opportunity Title, Description, and City are required fields.', 'error');
      return;
    }

    const newOpp: B2BOpportunity = {
      id: `opp-${Date.now()}`,
      title: formTitle,
      type: formType,
      category: formCategory,
      companyId: currentOrgId() || 'user-comp-9',
      companyName: currentOrgName(),
      companyLogoBg: 'bg-emerald-600',
      companyLogoText: currentOrgName().substring(0, 2).toUpperCase(),
      verified: currentOrgVerified(),
      premium: false,
      description: formDescription,
      requiredProductsServices: formReqProducts,
      preferredPartnerType: formPrefPartner,
      budget: formBudget || undefined,
      quantity: formQuantity || undefined,
      location: {
        state: formState || 'Maharashtra',
        city: formCity,
        area: formArea || 'Industrial Hub'
      },
      expectedStartDate: formStartDate,
      expectedClosingDate: formClosingDate,
      priority: formPriority,
      visibility: formVisibility,
      status: 'Open',
      postedDate: new Date().toISOString().split('T')[0],
      responsesCount: 0
    };

    setOpportunities(prev => [newOpp, ...prev]);
    setShowCreateModal(false);
    resetForm();

    try {
      const savedLeads = appStore.getItem('realtyconnect_leads');
      let currentLeads = [];
      if (savedLeads) {
        currentLeads = JSON.parse(savedLeads);
      }
      const nextId = `RC-LE-${1000 + currentLeads.length + 1}`;
      const newLead = {
        id: nextId,
        title: `Opportunity Created: ${newOpp.title}`,
        type: newOpp.type,
        source: 'Business Opportunities',
        company: newOpp.companyName,
        contactPerson: 'Opportunity Publisher',
        email: userSession?.email || 'publisher@realtyconnect.co.in',
        mobile: '+91 98200 44021',
        category: newOpp.category,
        productService: newOpp.requiredProductsServices,
        location: `${newOpp.location.city}, ${newOpp.location.state}`,
        priority: newOpp.priority === 'High' || newOpp.priority === 'Urgent' ? 'High' : 'Medium',
        description: newOpp.description,
        preferredContactMethod: 'Email',
        status: 'New',
        assignedTo: 'Unassigned',
        createdDate: new Date().toLocaleString(),
        updatedDate: new Date().toLocaleString(),
        notes: 'Captured via B2B Opportunities requirement publisher flow.',
        timeline: [
          { id: 't1', date: new Date().toLocaleString(), type: 'Enquiry Received', text: 'Lead captured automatically from new Opportunity Publication.' }
        ],
        followUps: []
      };
      appStore.setItem('realtyconnect_leads', JSON.stringify([newLead, ...currentLeads]));
    } catch (e) {
      console.error('Error auto capturing lead from opportunity publish', e);
    }

    if (onCloseCreatePrefill) {
      onCloseCreatePrefill();
    }

    // 1. Audit Logging
    onLogTriggered(
      'B2B_OPPORTUNITY_PUBLISHED',
      'opportunities',
      newOpp.id,
      'SUCCESS',
      `Opportunities Engine: Published strategic requirement "${newOpp.title}" under priority [${newOpp.priority}] targeting sector: ${newOpp.category}.`
    );

    // 2. Feed Integration: Automatically publish as B2B Feed Post!
    const newFeedPost: FeedPost = {
      id: `post-opp-${Date.now()}`,
      companyId: newOpp.companyId,
      companyName: newOpp.companyName,
      category: newOpp.category === 'Builders' ? 'Builders' : newOpp.category === 'Contractors' ? 'Contractors' : newOpp.category === 'Vendors' ? 'Material Vendors' : 'Consultants',
      logoBg: newOpp.companyLogoBg,
      logoText: newOpp.companyLogoText,
      verified: currentOrgVerified(),
      premium: false,
      timestamp: 'Just Now',
      postType: newOpp.type.includes('Material') ? 'Material Requirement' : 'RFQ Requirement',
      title: `B2B REQUIREMENT EXCHANGER: ${newOpp.title}`,
      description: `We have published a formal B2B requirement for "${newOpp.title}". Preferred Partners: ${newOpp.preferredPartnerType || 'Not Specified'}. Requirements: ${newOpp.requiredProductsServices}. Location: ${newOpp.location.area}, ${newOpp.location.city}. Budget/Scale: ${newOpp.budget || 'Open Quotations Invited'}.`,
      location: `${newOpp.location.city}, ${newOpp.location.state}`,
      distanceKm: 2.5,
      tags: [newOpp.type.replace(/\s+/g, ''), newOpp.priority, newOpp.location.city],
      likesCount: 0,
      comments: []
    };

    setPosts(prev => [newFeedPost, ...prev]);

    showToast(`B2B Opportunity "${newOpp.title}" published & integrated with professional feed!`, 'success');
  };

  // Opportunity Responses
  const handleRespondSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseModalOpp) return;

    const oppId = responseModalOpp.id;

    if (isRegisteredCompanyId(responseModalOpp.companyId)) {
      const opp = responseModalOpp;
      // The company that posted the opportunity receives the response as a lead and a conversation.
      api('POST', '/network/enquiries', {
        toOrgId: opp.companyId,
        kind: 'opportunity',
        subject: `Response: ${opp.title}`.slice(0, 200),
        category: opp.category,
        message: [respSubmitProposalPlaceholder, respRemarks].filter(Boolean).join('\n\n') || 'We are interested in this opportunity.',
        relatedId: opp.id,
        relatedTitle: opp.title
      })
        .then(() => {
          setRespondedOpps(prev => ({ ...prev, [oppId]: { proposalText: respSubmitProposalPlaceholder || 'Response sent', remarks: respRemarks, date: new Date().toISOString().split('T')[0] } }));
          setResponseModalOpp(null);
          setRespRemarks('');
          setRespSubmitProposalPlaceholder('');
          onLogTriggered('B2B_OPPORTUNITY_RESPONDED', 'opportunities', oppId, 'SUCCESS', `Responded to "${opp.title}" from ${opp.companyName}.`);
          showToast(`Your response was delivered to ${opp.companyName}.`, 'success');
        })
        .catch(err => showToast(errorMessage(err), 'error'));
      return;
    }

    setRespondedOpps(prev => ({
      ...prev,
      [oppId]: {
        proposalText: respSubmitProposalPlaceholder || 'Standard Response Dispatched',
        remarks: respRemarks,
        date: new Date().toISOString().split('T')[0]
      }
    }));

    // Update opportunity count
    setOpportunities(prev => prev.map(o => o.id === oppId ? { ...o, responsesCount: o.responsesCount + 1 } : o));

    setResponseModalOpp(null);
    setRespRemarks('');
    setRespSubmitProposalPlaceholder('');

    try {
      const savedLeads = appStore.getItem('realtyconnect_leads');
      let currentLeads = [];
      if (savedLeads) {
        currentLeads = JSON.parse(savedLeads);
      }
      const nextId = `RC-LE-${1000 + currentLeads.length + 1}`;
      const newLead = {
        id: nextId,
        title: `Proposal Sent: ${responseModalOpp.title}`,
        type: responseModalOpp.type,
        source: 'Business Opportunities',
        company: responseModalOpp.companyName,
        contactPerson: 'Sourcing Rep',
        email: 'responder@realtyconnect.co.in',
        mobile: '+91 90041 55600',
        category: responseModalOpp.category,
        productService: responseModalOpp.requiredProductsServices || 'Consultation',
        location: `${responseModalOpp.location.city}, ${responseModalOpp.location.state}`,
        priority: 'High',
        description: `Submitted proposal to opportunity "${responseModalOpp.title}". Remarks: ${respRemarks}`,
        preferredContactMethod: 'Email',
        status: 'New',
        assignedTo: 'Unassigned',
        createdDate: new Date().toLocaleString(),
        updatedDate: new Date().toLocaleString(),
        notes: 'Captured automatically from Opportunities proposal submission.',
        timeline: [
          { id: 't1', date: new Date().toLocaleString(), type: 'Enquiry Received', text: 'Lead captured automatically from Opportunity Response bid.' }
        ],
        followUps: []
      };
      appStore.setItem('realtyconnect_leads', JSON.stringify([newLead, ...currentLeads]));
    } catch (e) {
      console.error('Error auto capturing lead from opportunity response', e);
    }

    onLogTriggered(
      'B2B_OPPORTUNITY_RESPONDED',
      'opportunities',
      oppId,
      'SUCCESS',
      `Opportunities Engine: Dispatched official contact handshake proposal matching company criteria. Profile documents scanned.`
    );

    showToast(`Your professional response has been dispatched to ${responseModalOpp.companyName}!`, 'success');
  };

  // Report Opportunity
  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportModalOpp) return;

    setReportedOppIds(prev => [...prev, reportModalOpp.id]);
    setReportModalOpp(null);
    setReportDetails('');

    onLogTriggered(
      'B2B_OPPORTUNITY_REPORTED',
      'governance_compliance',
      reportModalOpp.id,
      'WARNING',
      `Corporate compliance review requested for listing ID "${reportModalOpp.id}". Reason: ${reportReason}. Details: ${reportDetails}`
    );

    showToast(`Compliance review filed. Our team will verify this listing shortly.`, 'info');
  };

  // Toggle Save
  const toggleSaveOpp = (id: string, title: string) => {
    setSavedOppIds(prev => {
      const isSaved = prev.includes(id);
      if (isSaved) {
        showToast('Removed opportunity from saved drawer.', 'info');
        return prev.filter(item => item !== id);
      } else {
        showToast('Opportunity saved successfully!', 'success');
        return [...prev, id];
      }
    });
  };

  // Simulated sharing
  const triggerShareOpp = (title: string) => {
    navigator.clipboard?.writeText?.(window.location.href);
    showToast(`Encrypted listing link copied to clipboard for secure sharing!`, 'success');
  };

  // Filter & Search Evaluation
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      // 1. Tab constraints
      if (currentTab === 'published' && opp.companyId !== 'user-comp-9') return false;
      if (currentTab === 'saved' && !savedOppIds.includes(opp.id)) return false;
      if (currentTab === 'responded' && !respondedOpps[opp.id]) return false;
      if (currentTab === 'drafts') return false; // Demo draft simulation empty by default

      // Skip reported listings
      if (reportedOppIds.includes(opp.id)) return false;

      // 2. Search query check
      const text = `${opp.title} ${opp.companyName} ${opp.description} ${opp.requiredProductsServices} ${opp.location.city} ${opp.location.state} ${opp.location.area}`.toLowerCase();
      if (searchQuery.trim() && !text.includes(searchQuery.toLowerCase())) return false;

      // 3. Dropdown filters
      if (filterType !== 'All' && opp.type !== filterType) return false;
      if (filterCategory !== 'All' && opp.category !== filterCategory) return false;
      if (filterLocation !== 'All' && !opp.location.city.toLowerCase().includes(filterLocation.toLowerCase())) return false;
      if (filterPriority !== 'All' && opp.priority !== filterPriority) return false;
      if (filterStatus !== 'All' && opp.status !== filterStatus) return false;

      // 4. Toggle filters
      if (filterVerified && !opp.verified) return false;
      if (filterPremium && !opp.premium) return false;
      if (filterRecentlyPosted && opp.postedDate !== '2026-07-16') return false;
      if (filterClosingSoon && opp.expectedClosingDate > '2026-07-31') return false;

      return true;
    });
  }, [opportunities, currentTab, savedOppIds, respondedOpps, reportedOppIds, searchQuery, filterType, filterCategory, filterLocation, filterPriority, filterStatus, filterVerified, filterPremium, filterRecentlyPosted, filterClosingSoon]);

  // Split calculations for "Featured Sections"
  const urgentOpportunities = useMemo(() => opportunities.filter(o => o.priority === 'Urgent' && !reportedOppIds.includes(o.id)), [opportunities, reportedOppIds]);
  const featuredOpportunities = useMemo(() => opportunities.filter(o => o.isFeatured && !reportedOppIds.includes(o.id)), [opportunities, reportedOppIds]);
  const trendingOpportunities = useMemo(() => opportunities.filter(o => o.isTrending && !reportedOppIds.includes(o.id)), [opportunities, reportedOppIds]);
  const closingSoonOpportunities = useMemo(() => opportunities.filter(o => o.expectedClosingDate <= '2026-07-31' && !reportedOppIds.includes(o.id)), [opportunities, reportedOppIds]);

  // Tailored recommendations based on user role (Demo placeholder)
  const recommendedOpportunities = useMemo(() => {
    const userRole = userSession?.role || 'builder';
    return opportunities.filter(o => {
      if (reportedOppIds.includes(o.id)) return false;
      if (userRole === 'vendor') return o.type.includes('Material');
      if (userRole === 'contractor') return o.type.includes('Service') || o.type.includes('Subcontract');
      if (userRole === 'bank') return o.type.includes('Banking') || o.type.includes('Investment') || o.type.includes('Escrow');
      return o.type.includes('Project') || o.type.includes('Partnership');
    });
  }, [opportunities, userSession, reportedOppIds]);

  return (
    <div className="w-full space-y-8 animate-fade-in pb-12">
      
      {/* Dynamic Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-900/30 p-6 rounded-2xl border border-slate-900">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] uppercase tracking-wider rounded-full font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            B2B Opportunity Exchange Platform
          </div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-emerald-400 stroke-[2]" />
            Business Opportunities Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Centralized B2B requirement directory. Publish raw material pipelines, contracting RFQs, equity joint-ventures, and mortgage channels. Connect directly with verified corporate stakeholders.
          </p>
        </div>

        <button
          onClick={() => {
            setShowCreateModal(true);
            onLogTriggered('B2B_OPPORTUNITY_CREATOR_OPENED', 'forms', 'new', 'SUCCESS', 'Opened creation modal inside Business Opportunities Engine.');
          }}
          className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-bold text-xs px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 self-start lg:self-center cursor-pointer"
          id="btn-publish-opportunity-trigger"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Publish B2B Opportunity</span>
        </button>
      </div>

      {/* Featured Horizontal Reels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Urgent Requirements Card */}
        <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
            <h3 className="font-display font-semibold text-xs text-red-400 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
              Urgent Requirements
            </h3>
            <span className="text-[10px] font-mono text-slate-500">{urgentOpportunities.length} Active</span>
          </div>
          <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
            {urgentOpportunities.map(opp => (
              <div 
                key={opp.id} 
                onClick={() => setSelectedOpp(opp)}
                className="p-2 bg-slate-950/60 hover:bg-slate-950 border border-slate-900 hover:border-slate-800 rounded-lg cursor-pointer transition-all space-y-1"
              >
                <div className="flex justify-between items-center text-[9px] font-mono">
                  <span className="text-red-400 bg-red-400/10 px-1 py-0.2 rounded font-semibold uppercase">{opp.priority}</span>
                  <span className="text-slate-500">{opp.location.city}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-200 line-clamp-1 leading-tight">{opp.title}</h4>
                <p className="text-[10px] text-slate-400 line-clamp-1">{opp.companyName}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Opportunities Card */}
        <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
            <h3 className="font-display font-semibold text-xs text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              Featured Opportunities
            </h3>
            <span className="text-[10px] font-mono text-slate-500">{featuredOpportunities.length} Active</span>
          </div>
          <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
            {featuredOpportunities.map(opp => (
              <div 
                key={opp.id} 
                onClick={() => setSelectedOpp(opp)}
                className="p-2 bg-slate-950/60 hover:bg-slate-950 border border-slate-900 hover:border-slate-800 rounded-lg cursor-pointer transition-all space-y-1"
              >
                <div className="flex justify-between items-center text-[9px] font-mono">
                  <span className="text-emerald-400 bg-emerald-400/10 px-1 py-0.2 rounded font-semibold uppercase">Featured</span>
                  <span className="text-slate-500">{opp.location.city}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-200 line-clamp-1 leading-tight">{opp.title}</h4>
                <p className="text-[10px] text-slate-400 line-clamp-1">{opp.companyName}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tailored For You Card */}
        <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
            <h3 className="font-display font-semibold text-xs text-teal-400 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              Recommended (Based on Role)
            </h3>
            <span className="text-[10px] font-mono text-slate-500">{recommendedOpportunities.length} Matches</span>
          </div>
          <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
            {recommendedOpportunities.map(opp => (
              <div 
                key={opp.id} 
                onClick={() => setSelectedOpp(opp)}
                className="p-2 bg-slate-950/60 hover:bg-slate-950 border border-slate-900 hover:border-slate-800 rounded-lg cursor-pointer transition-all space-y-1"
              >
                <div className="flex justify-between items-center text-[9px] font-mono">
                  <span className="text-teal-400 bg-teal-400/10 px-1 py-0.2 rounded font-semibold uppercase">{opp.type.split(' ')[0]}</span>
                  <span className="text-slate-500">{opp.location.city}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-200 line-clamp-1 leading-tight">{opp.title}</h4>
                <p className="text-[10px] text-slate-400 line-clamp-1">{opp.companyName}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Advanced Search & Filtering Console */}
      <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-xl">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-900 pb-2">
          <Filter className="w-4 h-4 text-emerald-400" />
          Advanced Search & Discovery Controls
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          
          {/* Main Search Input */}
          <div className="lg:col-span-2 flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-300">
            <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search opportunity title, company, materials, services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-500"
            />
          </div>

          {/* Opportunity Type Filter */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-[11px] text-slate-300 font-mono"
            >
              <option value="All">All Types ({OPPORTUNITY_TYPES.length})</option>
              {OPPORTUNITY_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-[11px] text-slate-300 font-mono"
            >
              <option value="All">All Categories ({BUSINESS_CATEGORIES.length})</option>
              {BUSINESS_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Row 2: Secondary Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
          
          <div className="bg-slate-900/60 border border-slate-900 rounded-lg px-2.5 py-1.5 flex items-center gap-1 text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-[10px] text-slate-300 font-mono"
            >
              <option value="All">All Locations</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Pune">Pune</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Ahmedabad">Ahmedabad</option>
            </select>
          </div>

          <div className="bg-slate-900/60 border border-slate-900 rounded-lg px-2.5 py-1.5 flex items-center gap-1 text-slate-400">
            <AlertTriangle className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-[10px] text-slate-300 font-mono"
            >
              <option value="All">All Priorities</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div className="bg-slate-900/60 border border-slate-900 rounded-lg px-2.5 py-1.5 flex items-center gap-1 text-slate-400">
            <CheckSquare className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-[10px] text-slate-300 font-mono"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Reset Filters Quick Action */}
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterType('All');
              setFilterCategory('All');
              setFilterLocation('All');
              setFilterPriority('All');
              setFilterStatus('All');
              setFilterVerified(false);
              setFilterPremium(false);
              setFilterRecentlyPosted(false);
              setFilterClosingSoon(false);
              showToast('Opportunities search filters cleared.', 'info');
            }}
            className="sm:col-span-2 lg:col-span-2 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] font-mono text-slate-300 uppercase tracking-wider rounded-lg transition-all"
          >
            Reset Filters
          </button>
        </div>

        {/* Row 3: Boolean Toggles */}
        <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2 text-xs font-mono text-slate-400 border-t border-slate-900/60">
          <label className="flex items-center gap-2 cursor-pointer hover:text-slate-200">
            <input
              type="checkbox"
              checked={filterVerified}
              onChange={(e) => setFilterVerified(e.target.checked)}
              className="accent-emerald-500 rounded border-slate-800 bg-slate-900"
            />
            <span>Verified Companies Only</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-slate-200">
            <input
              type="checkbox"
              checked={filterPremium}
              onChange={(e) => setFilterPremium(e.target.checked)}
              className="accent-emerald-500 rounded border-slate-800 bg-slate-900"
            />
            <span>Premium Members Only</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-slate-200">
            <input
              type="checkbox"
              checked={filterRecentlyPosted}
              onChange={(e) => setFilterRecentlyPosted(e.target.checked)}
              className="accent-emerald-500 rounded border-slate-800 bg-slate-900"
            />
            <span>Posted Recently (Last 24h)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-slate-200">
            <input
              type="checkbox"
              checked={filterClosingSoon}
              onChange={(e) => setFilterClosingSoon(e.target.checked)}
              className="accent-emerald-500 rounded border-slate-800 bg-slate-900"
            />
            <span>Closing Soon (Before July 31st)</span>
          </label>
        </div>
      </div>

      {/* Main Content Layout with Navigation Tabs */}
      <div className="space-y-6">
        
        {/* Navigation Tabs for My Opportunities tracking */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-900 pb-2 gap-4">
          <div className="flex bg-slate-900/60 border border-slate-900 p-0.5 rounded-xl">
            <button
              onClick={() => setCurrentTab('all')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'all' ? 'bg-emerald-500 text-slate-950 font-extrabold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All B2B Opportunities ({opportunities.length})
            </button>
            <button
              onClick={() => setCurrentTab('published')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'published' ? 'bg-emerald-500 text-slate-950 font-extrabold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              My Published ({opportunities.filter(o => o.companyId === 'user-comp-9').length})
            </button>
            <button
              onClick={() => setCurrentTab('responded')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'responded' ? 'bg-emerald-500 text-slate-950 font-extrabold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              My Responded ({Object.keys(respondedOpps).length})
            </button>
            <button
              onClick={() => setCurrentTab('saved')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'saved' ? 'bg-emerald-500 text-slate-950 font-extrabold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Saved Drawers ({savedOppIds.length})
            </button>
            <button
              onClick={() => {
                setCurrentTab('drafts');
                showToast('Draft simulation loaded. Ready to build draft templates!', 'info');
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'drafts' ? 'bg-emerald-500 text-slate-950 font-extrabold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Drafts (0)
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            Showing <strong className="text-emerald-400">{filteredOpportunities.length}</strong> matching exchange opportunities
          </div>
        </div>

        {/* Opportunity Listing Grid */}
        {filteredOpportunities.length === 0 ? (
          <div className="bg-slate-900/10 border border-slate-900 rounded-2xl p-16 text-center space-y-4">
            <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-500">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-300">No B2B Opportunities Match Your Search Criteria</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">Try resetting filters, modifying your search keywords, or publishing a brand new requirement using the primary button above.</p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterType('All');
                setFilterCategory('All');
                setFilterLocation('All');
                setFilterPriority('All');
                setFilterStatus('All');
                setFilterVerified(false);
                setFilterPremium(false);
              }}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 text-[10px] font-mono font-bold rounded uppercase tracking-wider transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOpportunities.map(opp => {
              const isSaved = savedOppIds.includes(opp.id);
              const hasResponded = !!respondedOpps[opp.id];

              return (
                <div 
                  key={opp.id} 
                  className={`bg-slate-900/30 border border-slate-900 hover:border-slate-850 rounded-2xl p-6 transition-all space-y-4 shadow-sm relative overflow-hidden group ${
                    opp.priority === 'Urgent' ? 'border-l-[3px] border-l-red-500' : opp.isFeatured ? 'border-l-[3px] border-l-emerald-500' : ''
                  }`}
                >
                  
                  {/* Top company and priority block */}
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${opp.companyLogoBg} flex items-center justify-center font-extrabold text-sm text-white shadow-md`}>
                        {opp.companyLogoText}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-200 text-xs">{opp.companyName}</span>
                          {opp.verified && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.1 rounded font-bold uppercase">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Verified
                            </span>
                          )}
                          {opp.premium && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1 py-0.1 rounded font-bold uppercase">
                              Premium
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-slate-500 mt-0.5 uppercase tracking-wider">{opp.category} • Posted: {opp.postedDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold uppercase tracking-wider ${
                        opp.priority === 'Urgent' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        opp.priority === 'High' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-slate-800 text-slate-400 border-slate-700/50'
                      }`}>
                        {opp.priority} Priority
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                        opp.status === 'Open' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        opp.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-slate-900 text-slate-500 border-slate-800'
                      }`}>
                        {opp.status}
                      </span>
                    </div>
                  </div>

                  {/* Title and Short Description */}
                  <div className="space-y-1.5">
                    <h4 
                      onClick={() => setSelectedOpp(opp)}
                      className="text-sm font-extrabold text-slate-100 hover:text-emerald-400 cursor-pointer transition-all leading-tight max-w-4xl"
                    >
                      {opp.title}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{opp.description}</p>
                  </div>

                  {/* Metadata specs grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950/40 p-3.5 rounded-xl border border-slate-900/60 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Opportunity Type</span>
                      <span className="text-slate-300 font-semibold line-clamp-1">{opp.type}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Location (State/City)</span>
                      <span className="text-slate-300 font-semibold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        {opp.location.city}, {opp.location.state}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Scale / Budget</span>
                      <span className="text-slate-300 font-semibold text-emerald-400">{opp.budget || 'Inquire Quote'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Closing Date</span>
                      <span className="text-slate-300 font-semibold flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500 flex-shrink-0" />
                        {opp.expectedClosingDate}
                      </span>
                    </div>
                  </div>

                  {/* Actions & stats row */}
                  <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-900/60 gap-4">
                    <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <strong>{opp.responsesCount}</strong> Response{opp.responsesCount !== 1 ? 's' : ''}
                      </span>
                      {hasResponded && (
                        <span className="text-emerald-400 flex items-center gap-1 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/15 font-bold">
                          <Check className="w-3 h-3" />
                          Proposal Filed
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedOpp(opp)}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 rounded-lg text-xs font-bold transition-all border border-slate-800 flex items-center gap-1"
                        title="View Full Technical Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>

                      <button
                        onClick={() => {
                          setResponseModalOpp(opp);
                          onLogTriggered('B2B_OPPORTUNITY_RESPONSE_STARTED', 'forms', opp.id, 'SUCCESS', `Initiated proposal builder for ${opp.companyName}.`);
                        }}
                        disabled={hasResponded}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          hasResponded 
                            ? 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                            : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md shadow-emerald-500/5 cursor-pointer'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{hasResponded ? 'Responded' : 'Respond'}</span>
                      </button>

                      <button
                        onClick={() => toggleSaveOpp(opp.id, opp.title)}
                        className={`p-2 bg-slate-900 hover:bg-slate-850 text-slate-400 rounded-lg transition-all border border-slate-800 cursor-pointer ${isSaved ? 'text-emerald-400' : ''}`}
                        title={isSaved ? 'Unsave' : 'Save opportunity'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                      </button>

                      <button
                        onClick={() => triggerShareOpp(opp.title)}
                        className="p-2 bg-slate-900 hover:bg-slate-850 text-slate-400 rounded-lg transition-all border border-slate-800 cursor-pointer"
                        title="Share link"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setReportModalOpp(opp)}
                        className="p-2 bg-slate-900 hover:bg-red-950 hover:text-red-400 text-slate-500 rounded-lg transition-all border border-slate-800 cursor-pointer"
                        title="Report Compliance Violation"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE OPPORTUNITY MODAL SHEET */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6 animate-scale-in">
            
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                <h3 className="font-display font-extrabold text-sm text-slate-100 uppercase tracking-wider">Publish B2B Requirement Opportunity</h3>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  if (onCloseCreatePrefill) onCloseCreatePrefill();
                }}
                className="text-slate-500 hover:text-slate-300 p-1.5 hover:bg-slate-900 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOpportunity} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Opportunity Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Procurement of 8,500 MT of TMT Reinforcement Steel grade Fe550D"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Opportunity Type *</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 outline-none"
                  >
                    {OPPORTUNITY_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Target Business Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 outline-none"
                  >
                    {BUSINESS_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Scope Description & Compliance Terms *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detailed technical description. Mention specifications, compliance standards, payment terms, or delivery logs."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Required Products / Services</label>
                  <input
                    type="text"
                    placeholder="e.g., Cement grades M40/M50, Excavation Rigs"
                    value={formReqProducts}
                    onChange={(e) => setFormReqProducts(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Preferred Partner Type</label>
                  <input
                    type="text"
                    placeholder="e.g., Authorized power power-plant distributors"
                    value={formPrefPartner}
                    onChange={(e) => setFormPrefPartner(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Budget Estimate (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., ₹4.5 Crore, ₹80 Lakhs, Open"
                    value={formBudget}
                    onChange={(e) => setFormBudget(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-emerald-400 font-mono outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Quantity / Scale (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., 8,500 MT, 12 Cranes"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-3">
                <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Geographic Scope (Location)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-slate-500 uppercase">State</label>
                    <input
                      type="text"
                      placeholder="Maharashtra"
                      value={formState}
                      onChange={(e) => setFormState(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-slate-500 uppercase">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="Mumbai"
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-slate-500 uppercase">Area / Landmark</label>
                    <input
                      type="text"
                      placeholder="Bandra Kurla Complex"
                      value={formArea}
                      onChange={(e) => setFormArea(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Expected Start Date</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Closing Date *</label>
                  <input
                    type="date"
                    required
                    value={formClosingDate}
                    onChange={(e) => setFormClosingDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Priority Level</label>
                  <div className="flex gap-2">
                    {['Normal', 'High', 'Urgent'].map(level => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFormPriority(level as any)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          formPriority === level 
                            ? 'bg-emerald-500 text-slate-950 border-emerald-500' 
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Visibility Scope</label>
                  <select
                    value={formVisibility}
                    onChange={(e) => setFormVisibility(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none"
                  >
                    <option value="Public">Public (All B2B Members)</option>
                    <option value="Connections Only">My Networking Connections Only</option>
                    <option value="Premium Members">Premium Members Only</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-900 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    if (onCloseCreatePrefill) onCloseCreatePrefill();
                  }}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-300 font-bold text-xs rounded-xl border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/15 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Publish Exchange Opportunity</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* DETAIL MODAL SHEET */}
      {selectedOpp && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6 animate-scale-in">
            
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                <span className="font-mono text-slate-400 text-xs">Technical Prospect Profile</span>
              </div>
              <button
                onClick={() => setSelectedOpp(null)}
                className="text-slate-500 hover:text-slate-300 p-1.5 hover:bg-slate-900 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              
              {/* Header inside detail */}
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${selectedOpp.companyLogoBg} flex items-center justify-center font-extrabold text-base text-white shadow-md`}>
                  {selectedOpp.companyLogoText}
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base text-slate-100 leading-tight">{selectedOpp.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">{selectedOpp.companyName}</span>
                    <span className="text-slate-700">•</span>
                    <span>{selectedOpp.category}</span>
                    <span className="text-slate-700">•</span>
                    <span className="text-emerald-400 font-mono text-[10px] bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/15 uppercase font-bold">{selectedOpp.type}</span>
                  </div>
                </div>
              </div>

              {/* Scope Description */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Complete Scope Description</h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-4 rounded-xl border border-slate-900">{selectedOpp.description}</p>
              </div>

              {/* Tech Spec checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 bg-slate-900/10 border border-slate-900 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Required Products / Services</span>
                  <p className="text-xs text-slate-300 font-semibold">{selectedOpp.requiredProductsServices || 'Contact company for specifics'}</p>
                </div>
                <div className="space-y-1 bg-slate-900/10 border border-slate-900 p-3 rounded-xl">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Preferred Partner Type</span>
                  <p className="text-xs text-slate-300 font-semibold">{selectedOpp.preferredPartnerType || 'All verified business members'}</p>
                </div>
              </div>

              {/* Parameter Table */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 border-y border-slate-900/80 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block">Est. Scale Value</span>
                  <span className="text-slate-200 font-bold text-emerald-400">{selectedOpp.budget || 'Inquire Price'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Required Vol</span>
                  <span className="text-slate-200 font-bold">{selectedOpp.quantity || 'Open Target'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Project Launch</span>
                  <span className="text-slate-200 font-bold">{selectedOpp.expectedStartDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Closing Gate</span>
                  <span className="text-slate-200 font-bold text-red-400">{selectedOpp.expectedClosingDate}</span>
                </div>
              </div>

              {/* Geography and Visibility */}
              <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Geographic scope: <strong>{selectedOpp.location.area}, {selectedOpp.location.city}, {selectedOpp.location.state}</strong></span>
                </div>

                <div className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Visibility scope: <strong>{selectedOpp.visibility}</strong></span>
                </div>
              </div>

              {/* Actions inside detailed sheet */}
              <div className="pt-4 border-t border-slate-900 flex justify-between items-center gap-4">
                <div className="text-xs text-slate-500 font-mono">
                  Posted on: {selectedOpp.postedDate}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedOpp(null);
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 font-bold text-xs rounded-xl border border-slate-800"
                  >
                    Close
                  </button>
                  {onConvertToRfq && (
                    <button
                      onClick={() => {
                        onConvertToRfq(selectedOpp);
                        setSelectedOpp(null);
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Convert to RFQ</span>
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setResponseModalOpp(selectedOpp);
                      setSelectedOpp(null);
                    }}
                    disabled={!!respondedOpps[selectedOpp.id]}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                      respondedOpps[selectedOpp.id]
                        ? 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-lg'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{respondedOpps[selectedOpp.id] ? 'Proposal Filed' : 'Respond to Opportunity'}</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* RESPOND FORM MODAL */}
      {responseModalOpp && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl p-6 space-y-5 animate-scale-in">
            
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-400" />
                <h3 className="font-display font-extrabold text-sm text-slate-100 uppercase tracking-wider">File B2B Handshake Response</h3>
              </div>
              <button
                onClick={() => setResponseModalOpp(null)}
                className="text-slate-500 hover:text-slate-300 p-1.5 hover:bg-slate-900 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-900 space-y-1">
              <span className="text-[9px] font-mono text-emerald-400 block uppercase font-bold">Target Opportunity</span>
              <h4 className="text-xs font-bold text-slate-200 leading-tight">{responseModalOpp.title}</h4>
              <p className="text-[10px] text-slate-400 font-mono">Published by: {responseModalOpp.companyName}</p>
            </div>

            <form onSubmit={handleRespondSubmit} className="space-y-4">
              
              <label className="flex items-center gap-3 cursor-pointer text-xs font-mono text-slate-300 bg-slate-900/20 p-2.5 rounded-lg border border-slate-900 hover:border-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={respSendInterest}
                  onChange={(e) => setRespSendInterest(e.target.checked)}
                  className="accent-emerald-500 w-4 h-4 rounded"
                />
                <div className="space-y-0.5">
                  <span className="font-bold block">Send B2B Mutual Handshake Notice</span>
                  <span className="text-[10px] text-slate-500 block">Instantly notify developer/buyer of your matching interest with live logs.</span>
                </div>
              </label>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Submit Proposal Spec / Attachment Name</label>
                <input
                  type="text"
                  placeholder="e.g., TMT_Steel_Supply_Proposal_Apex.pdf"
                  value={respSubmitProposalPlaceholder}
                  onChange={(e) => setRespSubmitProposalPlaceholder(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer text-xs font-mono text-slate-300 bg-slate-900/20 p-2.5 rounded-lg border border-slate-900 hover:border-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={respAttachProfile}
                  onChange={(e) => setRespAttachProfile(e.target.checked)}
                  className="accent-emerald-500 w-4 h-4 rounded"
                />
                <div className="space-y-0.5">
                  <span className="font-bold block">Attach Verified Corporate Dossier</span>
                  <span className="text-[10px] text-slate-500 block">Automatically shares your scanned RERA/GST compliance certificates with buyer.</span>
                </div>
              </label>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Cover Note & Pitch Remarks *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Summarize why your company is the ideal candidate. Mention certifications, previous contracts, or localized logistical speed."
                  value={respRemarks}
                  onChange={(e) => setRespRemarks(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Proposed Virtual Meeting Date (Placeholder)</label>
                <input
                  type="datetime-local"
                  value={respScheduleDiscussionPlaceholder}
                  onChange={(e) => setRespScheduleDiscussionPlaceholder(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-900 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setResponseModalOpp(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 font-bold text-xs rounded-xl border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Sealed Proposal</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* REPORT FORM MODAL */}
      {reportModalOpp && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-red-400" />
                <h3 className="font-display font-extrabold text-sm text-slate-100 uppercase tracking-wider">Report Compliance Violation</h3>
              </div>
              <button
                onClick={() => setReportModalOpp(null)}
                className="text-slate-500 hover:text-slate-300 p-1.5 hover:bg-slate-900 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Reason for Review</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 outline-none"
                >
                  <option value="Inaccurate Details">Inaccurate Technical Details</option>
                  <option value="RERA Non-compliance">RERA statutory non-compliance</option>
                  <option value="Corporate Misconduct">Corporate spam / solicitation</option>
                  <option value="Duplicate Post">Duplicate listing</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Additional details *</label>
                <textarea
                  required
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Provide precise details of the statutory violation or incorrect details for our system moderator panel."
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-900 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReportModalOpp(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 font-bold text-xs rounded-xl border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-500/10 cursor-pointer"
                >
                  Submit Violation Report
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
