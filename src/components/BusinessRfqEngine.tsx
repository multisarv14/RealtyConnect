/**
 * RealtyConnect™ Sprint 11 - RFQ & Tender Management Module
 * An enterprise-grade, high-fidelity quotation and tender exchange platform.
 */

import { currentOrgId, currentOrgName, currentOrgVerified, currentUserName } from '../lib/identity';
import { api, errorMessage } from '../lib/api';
import { openFile, uploadFile } from '../lib/files';
import { isRegisteredCompanyId } from '../lib/companies';
import { useStoreSync } from '../lib/usePersistentState';
import { appStore } from '../lib/appStore';
import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileText, 
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
  Check, 
  Eye, 
  Sparkles, 
  Building2, 
  UserCheck, 
  Briefcase,
  Layers,
  Heart,
  ShieldCheck,
  ChevronDown,
  Info,
  Flag,
  CheckSquare,
  Building,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Users
} from 'lucide-react';
import { FeedPost } from './BusinessFeed';

// Supported RFQ Types
export const RFQ_TYPES = [
  'Material RFQ',
  'Service RFQ',
  'Equipment RFQ',
  'Machinery Rental RFQ',
  'Labour RFQ',
  'Subcontract RFQ',
  'Consultancy RFQ',
  'Technology RFQ',
  'Marketing RFQ',
  'Transportation RFQ',
  'Financial Service RFQ',
  'Insurance RFQ',
  'Facility Management RFQ',
  'Property Management RFQ',
  'Government Tender',
  'Private Tender',
  'Open Tender',
  'Limited Tender'
];

// Business Categories
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

export interface RfqTender {
  id: string;
  rfqNumber: string; // Auto Generated
  title: string;
  type: string;
  businessCategory: string;
  description: string;
  requiredProductsServices: string;
  quantity: string;
  unit: string;
  technicalSpecification: string;
  attachmentName?: string;
  attachmentFileId?: string;
  location: string;
  deliveryLocation: string;
  expectedDeliveryDate: string;
  quotationSubmissionDeadline: string;
  estimatedBudget?: string;
  priority: 'Normal' | 'High' | 'Urgent';
  visibility: 'Public' | 'Private' | 'Invite Only' | 'Premium Members';
  status: 'Draft' | 'Open' | 'Closed' | 'Cancelled';
  companyId: string;
  companyName: string;
  companyLogoBg: string;
  companyLogoText: string;
  verified: boolean;
  premium: boolean;
  postedDate: string;
  bidsCount: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  isGovernment?: boolean;
  isPrivate?: boolean;
}

export interface QuotationResponse {
  id: string;
  rfqId: string;
  companyId: string;
  companyName: string;
  companyLogoBg: string;
  companyProfile: string;
  quotationAmount: string;
  validity: string;
  deliveryTimeline: string;
  remarks: string;
  attachmentName?: string;
  attachmentFileId?: string;
  submittedDate: string;
  status: 'Pending' | 'Accepted' | 'Declined' | 'Under Review';
}

// Initial high-fidelity seeded RFQs & Tenders
export const INITIAL_RFQS: RfqTender[] = [
  {
    id: 'rfq-seed-1',
    rfqNumber: 'RFQ-2026-1029',
    title: 'Procurement of 12,000 MT High-Strength Fe550D TMT Reinforcement Steel',
    type: 'Material RFQ',
    businessCategory: 'Vendors',
    description: 'Bids invited from tier-1 steel mills and primary national distributors for supplying certified Fe550D TMT bars. Ready schedule with rolling delivery over 8 months starting September 2026. Custom corporate bank LC terms available.',
    requiredProductsServices: 'Fe550D Grade Steel rebars (10mm, 12mm, 16mm, 20mm)',
    quantity: '12,000',
    unit: 'Metric Tons',
    technicalSpecification: 'Yield strength >= 550 N/mm2, Elongation >= 14.5%, conforming to IS 1786 standards. Anti-corrosive coating certification required.',
    attachmentName: 'FE550D_Technical_Specs_SlabA.pdf',
    location: 'Worli, Mumbai',
    deliveryLocation: 'Symphony Tower Site, Worli Seaface, Mumbai MH',
    expectedDeliveryDate: '2026-09-10',
    quotationSubmissionDeadline: '2026-08-15',
    estimatedBudget: '₹6.4 Crores',
    priority: 'Urgent',
    visibility: 'Public',
    status: 'Open',
    companyId: 'ent-1',
    companyName: 'Apex Developers Ltd',
    companyLogoBg: 'bg-indigo-600',
    companyLogoText: 'AD',
    verified: true,
    premium: true,
    postedDate: '2026-07-14',
    bidsCount: 5,
    isFeatured: true,
    isTrending: true,
    isPrivate: true
  },
  {
    id: 'rfq-seed-2',
    rfqNumber: 'RFQ-2026-3021',
    title: 'Noida Sec-62 Metro Corridor Shoring and Bored Cast-in-Situ Piling Subcontract',
    type: 'Subcontract RFQ',
    businessCategory: 'Contractors',
    description: 'Subcontract tenders for structural engineering and pile casting works. Excavations exceed 15 meters, requiring advanced hydraulic piling rigs and continuous ultrasonic test compliance.',
    requiredProductsServices: 'Rotary Boring Machinery, Pile Casing, Tremie Concrete Pouring Services',
    quantity: '340',
    unit: 'Bored Piles',
    technicalSpecification: '1200mm diameter bored cast-in-situ concrete piles. Minimum Grade M40 concrete with high slump and specialized plasticizers.',
    attachmentName: 'Sec62_Piling_Shoring_Drwgs.zip',
    location: 'Noida Sect 62',
    deliveryLocation: 'Noida Metro Yard Expansion Site, UP',
    expectedDeliveryDate: '2026-10-01',
    quotationSubmissionDeadline: '2026-08-20',
    estimatedBudget: '₹4.8 Crores',
    priority: 'High',
    visibility: 'Public',
    status: 'Open',
    companyId: 'ent-2',
    companyName: 'BuildCorp Construction',
    companyLogoBg: 'bg-emerald-600',
    companyLogoText: 'BC',
    verified: true,
    premium: true,
    postedDate: '2026-07-15',
    bidsCount: 3,
    isFeatured: true,
    isTrending: false,
    isPrivate: true
  },
  {
    id: 'rfq-seed-3',
    rfqNumber: 'TEN-2026-8004',
    title: 'MHADA Smart Township Integrated CCTV and IoT Surveillance System Tender',
    type: 'Government Tender',
    businessCategory: 'Consultants',
    description: 'Official bidding invited on behalf of Maharashtra Housing and Area Development Authority (MHADA) for executing a campus-wide surveillance grid integrated with localized facial recognition and incident alert engine.',
    requiredProductsServices: '4K IP Bullet Cameras, NVR Systems, Edge AI Video Analytics Software, Fiber Optics Ring',
    quantity: '1',
    unit: 'Complete Grid Package',
    technicalSpecification: 'CCTV cameras must have minimum IK10 vandal-proof rating and IP67 weather rating. Central video wall server with AI detection trigger.',
    attachmentName: 'MHADA_Tender_IoT_TechSpecs.pdf',
    location: 'Bandra BKC, Mumbai',
    deliveryLocation: 'MHADA Township Hub, Sector 4, Pune-Mumbai Bypass',
    expectedDeliveryDate: '2026-12-15',
    quotationSubmissionDeadline: '2026-09-05',
    estimatedBudget: '₹12.5 Crores',
    priority: 'Normal',
    visibility: 'Public',
    status: 'Open',
    companyId: 'mhd-gov',
    companyName: 'MHADA Infrastructure Board',
    companyLogoBg: 'bg-amber-700',
    companyLogoText: 'MI',
    verified: true,
    premium: false,
    postedDate: '2026-07-16',
    bidsCount: 11,
    isFeatured: false,
    isTrending: true,
    isGovernment: true
  },
  {
    id: 'rfq-seed-4',
    rfqNumber: 'RFQ-2026-4402',
    title: 'Double-drum Heavy Hydraulic Road Roller Fleet Rental',
    type: 'Machinery Rental RFQ',
    businessCategory: 'Equipment Suppliers',
    description: 'Lease tender for three heavy-duty dynamic double-drum vibratory road rollers. Required for rigid pavement expressway base compaction.',
    requiredProductsServices: 'Double-drum Vibratory Compactor Lease & Onsite Operator Maintenance Service',
    quantity: '3',
    unit: 'Vehicles (4 Months)',
    technicalSpecification: 'Minimum operating weight of 11 Metric Tons, dual amplitude vibration frequency, fuel efficiency Tier-4 compliant.',
    attachmentName: 'RoadRoller_Maintenance_SLA.docx',
    location: 'Ahmedabad, GJ',
    deliveryLocation: 'Sardar Ring Road Compaction Site, Ahmedabad',
    expectedDeliveryDate: '2026-08-25',
    quotationSubmissionDeadline: '2026-08-05',
    estimatedBudget: '₹18,00,000',
    priority: 'Normal',
    visibility: 'Premium Members',
    status: 'Open',
    companyId: 'ent-7',
    companyName: 'Global Tech Equipment Ltd',
    companyLogoBg: 'bg-cyan-600',
    companyLogoText: 'GT',
    verified: true,
    premium: true,
    postedDate: '2026-07-16',
    bidsCount: 2,
    isFeatured: false,
    isTrending: false,
    isPrivate: true
  },
  {
    id: 'rfq-seed-5',
    rfqNumber: 'RFQ-2026-9051',
    title: 'Super-Structure Structural Engineering Design and BIM Level-3 Modeling Consult',
    type: 'Consultancy RFQ',
    businessCategory: 'Consultants',
    description: 'Looking to hire senior structural architects and seismic consultant consortiums for designing a complex 52-story mixed-use composite structure.',
    requiredProductsServices: 'BIM Level-3 architectural files, ETABS wind-tunnel analysis and pile cap drafting',
    quantity: '1',
    unit: 'Project Consultation',
    technicalSpecification: 'Compliance with IS 1893 (Seismic Design Criteria) and wind load simulations mimicking cyclonic zones up to 55 m/s structural resistance.',
    location: 'Hyderabad, TS',
    deliveryLocation: 'Cyber Towers corporate offices, HITEC City, Hyderabad',
    expectedDeliveryDate: '2026-11-01',
    quotationSubmissionDeadline: '2026-07-28',
    estimatedBudget: '₹45,00,000',
    priority: 'High',
    visibility: 'Public',
    status: 'Open',
    companyId: 'ent-4',
    companyName: 'RealtyConnect Pro Consultants',
    companyLogoBg: 'bg-slate-700',
    companyLogoText: 'RP',
    verified: true,
    premium: true,
    postedDate: '2026-07-16',
    bidsCount: 4,
    isFeatured: true,
    isTrending: false,
    isPrivate: true
  }
];

// Seeded quotation submissions
const INITIAL_QUOTATIONS: QuotationResponse[] = [
  {
    id: 'q-seed-1',
    rfqId: 'rfq-seed-1',
    companyId: 'ent-3',
    companyName: 'Elite Materials Group',
    companyLogoBg: 'bg-amber-600',
    companyProfile: 'National tier-1 structural steel manufacturers and distributors with multiple stocking yards across major ports. Direct partner of SAIL and Tata Steel.',
    quotationAmount: '₹6.28 Crores',
    validity: '45 Days',
    deliveryTimeline: 'Bi-weekly lots of 500 MT starting within 10 days of LC receipt.',
    remarks: 'Our price points include complete shipping and unloading logistics at your Worli site. Fully certified Fe550D grade matching chemical composites. Testing sheets included.',
    attachmentName: 'Elite_Materials_Steel_Quote_Signed.pdf',
    submittedDate: '2026-07-15 03:22 PM',
    status: 'Under Review'
  },
  {
    id: 'q-seed-2',
    rfqId: 'rfq-seed-2',
    companyId: 'ent-3',
    companyName: 'Elite Materials Group',
    companyLogoBg: 'bg-amber-600',
    companyProfile: 'Pioneering heavy infrastructure and civil reinforcement solutions. ISO certified quality team.',
    quotationAmount: '₹4.65 Crores',
    validity: '30 Days',
    deliveryTimeline: 'Mobilization of rotary piling rigs within 14 calendar days of signing.',
    remarks: 'We own three brand new Casagrande B250 heavy-duty hydraulic boring rigs, available for immediate deployment at Noida Metro Yard.',
    attachmentName: 'EMG_Noida_Metro_Boring_Piles_Bid.pdf',
    submittedDate: '2026-07-16 01:10 PM',
    status: 'Pending'
  }
];

interface BusinessRfqEngineProps {
  userSession: any;
  onLogTriggered: (
    action: string, 
    entity: string, 
    entityId: string, 
    status: 'SUCCESS' | 'FAILURE' | 'WARNING', 
    details: string
  ) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  posts: FeedPost[];
  setPosts: React.Dispatch<React.SetStateAction<FeedPost[]>>;
  initialCreateOpen?: boolean;
  onCloseCreatePrefill?: () => void;
  // Let user convert from B2B Opportunity
  prefilledOpp?: any; 
  setActiveViewMode?: (view: any) => void;
}

export default function BusinessRfqEngine({
  userSession,
  onLogTriggered,
  showToast,
  posts,
  setPosts,
  initialCreateOpen = false,
  onCloseCreatePrefill,
  prefilledOpp,
  setActiveViewMode
}: BusinessRfqEngineProps) {
  // Master RFQ list and Quotations list stored in React state
  const [rfqList, setRfqList] = useState<RfqTender[]>(() => {
    const saved = appStore.getItem('realtyconnect_rfq_list');
    return saved ? JSON.parse(saved) : INITIAL_RFQS;
  });

  const [quotationList, setQuotationList] = useState<QuotationResponse[]>(() => {
    const saved = appStore.getItem('realtyconnect_quotation_list');
    return saved ? JSON.parse(saved) : INITIAL_QUOTATIONS;
  });

  const [savedRfqs, setSavedRfqs] = useState<string[]>(() => {
    const saved = appStore.getItem('realtyconnect_saved_rfqs');
    return saved ? JSON.parse(saved) : ['rfq-seed-1', 'rfq-seed-5'];
  });

  // RFQs and quotations delivered by other companies appear without a reload.
  useStoreSync<RfqTender[]>('realtyconnect_rfq_list', setRfqList);
  useStoreSync<QuotationResponse[]>('realtyconnect_quotation_list', setQuotationList);

  // Sync to local storage
  useEffect(() => {
    appStore.setItem('realtyconnect_rfq_list', JSON.stringify(rfqList));
  }, [rfqList]);

  useEffect(() => {
    appStore.setItem('realtyconnect_quotation_list', JSON.stringify(quotationList));
  }, [quotationList]);

  useEffect(() => {
    appStore.setItem('realtyconnect_saved_rfqs', JSON.stringify(savedRfqs));
  }, [savedRfqs]);

  // Main navigation tab modes: 'directory' | 'my_rfqs' | 'create_rfq' | 'convert_opportunity'
  const [activeTab, setActiveTab] = useState<'directory' | 'my_rfqs' | 'create_rfq' | 'convert_opp'>('directory');

  // Featured sections filter presets: 'All' | 'Latest' | 'Urgent' | 'Featured' | 'Closing Soon' | 'Govt' | 'Private'
  const [featuredFilter, setFeaturedFilter] = useState<string>('All');

  // Directory Search & Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDeadline, setFilterDeadline] = useState('All'); // 'All' | 'Closing Soon' | 'Recently Published'
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
  const [filterPremiumOnly, setFilterPremiumOnly] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  // Active RFQ Detail modal / pane view
  const [selectedRfq, setSelectedRfq] = useState<RfqTender | null>(null);

  // Submit Quotation Dialog state
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    companyProfile: userSession ? `${userSession.name} is a leading enterprise operating in real estate. Fully compliant with GST, RERA, and statutory B2B norms.` : '',
    quotationAmount: '',
    validity: '30 Days',
    deliveryTimeline: '14 Days',
    remarks: '',
    attachmentName: ''
  });

  // Create RFQ form state
  const [newRfqForm, setNewRfqForm] = useState({
    title: '',
    type: 'Material RFQ',
    businessCategory: 'Builders',
    description: '',
    requiredProductsServices: '',
    quantity: '',
    unit: 'Metric Tons',
    technicalSpecification: '',
    location: userSession?.location || 'Mumbai, MH',
    deliveryLocation: '',
    expectedDeliveryDate: '',
    quotationSubmissionDeadline: '',
    estimatedBudget: '',
    priority: 'Normal' as 'Normal' | 'High' | 'Urgent',
    visibility: 'Public' as 'Public' | 'Private' | 'Invite Only' | 'Premium Members',
    attachmentName: ''
  });

  // File upload simulator states
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // My RFQs inner filtering: 'published' | 'drafts' | 'saved' | 'submissions'
  const [myRfqSubFilter, setMyRfqSubFilter] = useState<'published' | 'drafts' | 'saved' | 'submissions'>('published');

  // Handle auto prefill from props
  useEffect(() => {
    if (initialCreateOpen) {
      setActiveTab('create_rfq');
      if (onCloseCreatePrefill) onCloseCreatePrefill();
    }
  }, [initialCreateOpen]);

  // Handle prefilled from converted opportunity
  useEffect(() => {
    if (prefilledOpp) {
      setActiveTab('create_rfq');
      setNewRfqForm({
        title: prefilledOpp.title || '',
        type: prefilledOpp.type?.includes('Material') ? 'Material RFQ' : prefilledOpp.type?.includes('Service') ? 'Service RFQ' : 'Subcontract RFQ',
        businessCategory: prefilledOpp.category || 'Builders',
        description: prefilledOpp.description || '',
        requiredProductsServices: prefilledOpp.requiredProductsServices || '',
        quantity: prefilledOpp.quantity?.split(' ')[0] || '',
        unit: prefilledOpp.quantity?.split(' ')[1] || 'Units',
        technicalSpecification: 'Conformance to premium engineering practices.',
        location: prefilledOpp.location?.city ? `${prefilledOpp.location.city}, ${prefilledOpp.location.state}` : 'Mumbai, MH',
        deliveryLocation: prefilledOpp.location?.area || '',
        expectedDeliveryDate: prefilledOpp.expectedStartDate || '',
        quotationSubmissionDeadline: prefilledOpp.expectedClosingDate || '',
        estimatedBudget: prefilledOpp.budget || '',
        priority: prefilledOpp.priority || 'Normal',
        visibility: 'Public',
        attachmentName: ''
      });
      showToast('Opportunity details pre-populated into RFQ Creation form!', 'success');
    }
  }, [prefilledOpp]);

  // Simulated list of opportunities for in-app conversion feature
  const convertableOpportunities = useMemo(() => {
    return [
      { id: 'opp-1', title: 'Procurement of 8,500 Metric Tons of High-Strength Fe550D TMT Reinforcement Steel', category: 'Builders', budget: '₹4.5 Crore', description: 'sealed commercial bids from certified manufacturers and primary dealers for bulk supply...', date: '2026-07-16' },
      { id: 'opp-2', title: 'Underground Concrete Shoring and Piling Work Subcontract for Metro Corridor Expansion', category: 'Contractors', budget: '₹8.2 Crore', description: 'BuildCorp requires a specialized piling agency holding deep-excavation machinery...', date: '2026-07-15' },
      { id: 'opp-3', title: 'Smart Township integrated sewage treatment plant turnkey fabrication', category: 'Developers', budget: '₹1.5 Crore', description: 'Requires modular fabrication of 1.2 MLD wastewater treating system with active carbon filter grids...', date: '2026-07-14' }
    ];
  }, []);

  // Filter & Search RFQs
  const filteredRfqs = useMemo(() => {
    return rfqList.filter(rfq => {
      // 1. Text Search
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const numMatch = rfq.rfqNumber.toLowerCase().includes(query);
        const titleMatch = rfq.title.toLowerCase().includes(query);
        const compMatch = rfq.companyName.toLowerCase().includes(query);
        const prodMatch = rfq.requiredProductsServices.toLowerCase().includes(query);
        const descMatch = rfq.description.toLowerCase().includes(query);
        const locMatch = rfq.location.toLowerCase().includes(query);
        if (!numMatch && !titleMatch && !compMatch && !prodMatch && !descMatch && !locMatch) {
          return false;
        }
      }

      // 2. Advanced Filters
      if (filterType !== 'All' && rfq.type !== filterType) return false;
      if (filterCategory !== 'All' && rfq.businessCategory !== filterCategory) return false;
      if (filterLocation !== 'All' && !rfq.location.toLowerCase().includes(filterLocation.toLowerCase())) return false;
      if (filterPriority !== 'All' && rfq.priority !== filterPriority) return false;
      if (filterStatus !== 'All' && rfq.status !== filterStatus) return false;
      if (filterVerifiedOnly && !rfq.verified) return false;
      if (filterPremiumOnly && !rfq.premium) return false;

      // 3. Deadline Filter
      if (filterDeadline === 'Closing Soon') {
        const today = new Date('2026-07-17');
        const deadline = new Date(rfq.quotationSubmissionDeadline);
        const diffTime = deadline.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 0 || diffDays > 15) return false; // Not closing within 15 days, or already closed
      } else if (filterDeadline === 'Recently Published') {
        const posted = new Date(rfq.postedDate);
        const today = new Date('2026-07-17');
        const diffTime = today.getTime() - posted.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 3) return false; // older than 3 days
      }

      // 4. Featured tabs presets
      if (featuredFilter === 'Latest') {
        const posted = new Date(rfq.postedDate);
        const today = new Date('2026-07-17');
        const diffDays = Math.ceil((today.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 5) return false;
      } else if (featuredFilter === 'Urgent' && rfq.priority !== 'Urgent') {
        return false;
      } else if (featuredFilter === 'Featured' && !rfq.isFeatured) {
        return false;
      } else if (featuredFilter === 'Closing Soon') {
        const deadline = new Date(rfq.quotationSubmissionDeadline);
        const diffDays = Math.ceil((deadline.getTime() - new Date('2026-07-17').getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0 || diffDays > 14) return false;
      } else if (featuredFilter === 'Govt' && !rfq.isGovernment) {
        return false;
      } else if (featuredFilter === 'Private' && rfq.isGovernment) {
        return false;
      }

      return true;
    });
  }, [rfqList, searchTerm, filterType, filterCategory, filterLocation, filterPriority, filterStatus, filterDeadline, filterVerifiedOnly, filterPremiumOnly, featuredFilter]);

  // Cities extracted for filter dropdown
  const locationOptions = useMemo(() => {
    return Array.from(new Set(rfqList.map(r => r.location.split(',')[0].trim())));
  }, [rfqList]);

  // Handle Save / Bookmark RFQ
  const handleToggleSaveRfq = (id: string, title: string) => {
    if (savedRfqs.includes(id)) {
      setSavedRfqs(prev => prev.filter(item => item !== id));
      showToast(`RFQ "${title}" removed from saved bookmarks.`, 'info');
      onLogTriggered('RFQ_BOOKMARK_REMOVED', 'rfq', id, 'SUCCESS', `Removed RFQ bookmark for: ${title}`);
    } else {
      setSavedRfqs(prev => [...prev, id]);
      showToast(`RFQ "${title}" bookmarked and saved!`, 'success');
      onLogTriggered('RFQ_BOOKMARK_ADDED', 'rfq', id, 'SUCCESS', `Saved RFQ bookmark for: ${title}`);
    }
  };

  // Simulated file upload handler
  const handleSimulatedUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setIsUploading(true);
    try {
      const stored = await uploadFile(file);
      setUploadedFile(stored.name);
      setUploadedFileId(stored.id);
      showToast(`"${stored.name}" uploaded and attached.`, 'success');
    } catch (err) {
      showToast(errorMessage(err), 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Submit quotation to RFQ
  const handleSubmitQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRfq) return;
    if (!quoteForm.quotationAmount) {
      showToast('Please state your commercial bidding amount.', 'error');
      return;
    }

    const newQuote: QuotationResponse = {
      id: `q-${Date.now()}`,
      rfqId: selectedRfq.id,
      companyId: currentOrgId() || 'ent-user',
      companyName: currentOrgName(),
      companyLogoBg: userSession?.logoBg || 'bg-emerald-600',
      companyProfile: quoteForm.companyProfile,
      quotationAmount: quoteForm.quotationAmount,
      validity: quoteForm.validity,
      deliveryTimeline: quoteForm.deliveryTimeline,
      remarks: quoteForm.remarks,
      attachmentName: uploadedFile || undefined,
      attachmentFileId: uploadedFileId || undefined,
      submittedDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Pending'
    };

    if (isRegisteredCompanyId(selectedRfq.companyId)) {
      // The company that issued the RFQ receives the quotation in its own workspace.
      api('POST', '/network/bids', {
        toOrgId: selectedRfq.companyId,
        bidId: newQuote.id,
        rfqId: selectedRfq.id,
        rfqTitle: selectedRfq.title,
        quotationAmount: newQuote.quotationAmount,
        validity: newQuote.validity,
        deliveryTimeline: newQuote.deliveryTimeline,
        remarks: newQuote.remarks,
        ...(newQuote.attachmentName ? { attachmentName: newQuote.attachmentName } : {}),
        ...(newQuote.attachmentFileId ? { attachmentFileId: newQuote.attachmentFileId } : {})
      })
        .then(() => {
          setQuotationList(prev => [newQuote, ...prev.filter(q => q.id !== newQuote.id)]);
          showToast(`Quotation of ${newQuote.quotationAmount} delivered to ${selectedRfq.companyName}.`, 'success');
          onLogTriggered('RFQ_QUOTATION_SUBMITTED', 'rfq_quotations', selectedRfq.id, 'SUCCESS', `Submitted B2B quotation for ${selectedRfq.rfqNumber}. Bidding amount: ${newQuote.quotationAmount}.`);
          setIsSubmittingQuote(false);
          setUploadedFile(null);
    setUploadedFileId(null);
        })
        .catch(err => showToast(`Quotation not delivered: ${errorMessage(err)}`, 'error'));
      return;
    }

    setQuotationList(prev => [newQuote, ...prev]);

    // Update bid count on the RFQ
    setRfqList(prev => prev.map(r => {
      if (r.id === selectedRfq.id) {
        return { ...r, bidsCount: r.bidsCount + 1 };
      }
      return r;
    }));

    // Update selectedRfq too so it reflects immediately on detail panel
    setSelectedRfq(prev => prev ? { ...prev, bidsCount: prev.bidsCount + 1 } : null);

    try {
      const savedLeads = appStore.getItem('realtyconnect_leads');
      let currentLeads = [];
      if (savedLeads) {
        currentLeads = JSON.parse(savedLeads);
      }
      const nextId = `RC-LE-${1000 + currentLeads.length + 1}`;
      const newLead = {
        id: nextId,
        title: `Quotation Bid: ${selectedRfq.title}`,
        type: 'RFQ Response',
        source: 'RFQ',
        company: selectedRfq.creatorCompany || 'Apex Developers Ltd',
        contactPerson: 'Tender Evaluation Officer',
        email: 'tender@realtyconnect.co.in',
        mobile: '+91 98200 44021',
        category: selectedRfq.category || 'Developers',
        productService: selectedRfq.title,
        location: selectedRfq.deliveryLocation || 'Mumbai, MH',
        priority: selectedRfq.priority || 'High',
        description: `Submitted commercial bidding quotation. Amount: ${quoteForm.quotationAmount}. Validity: ${quoteForm.validity}. Timeline: ${quoteForm.deliveryTimeline}. Remarks: ${quoteForm.remarks || 'None'}`,
        preferredContactMethod: 'Email',
        status: 'Quotation Sent',
        assignedTo: 'Unassigned',
        createdDate: new Date().toLocaleString(),
        updatedDate: new Date().toLocaleString(),
        notes: 'Automatically captured via RFQ bidding engine quotation submission.',
        timeline: [
          { id: 't1', date: new Date().toLocaleString(), type: 'Enquiry Received', text: `Submitted B2B quotation response of ${quoteForm.quotationAmount} for tender ${selectedRfq.rfqNumber}.` }
        ],
        followUps: []
      };
      appStore.setItem('realtyconnect_leads', JSON.stringify([newLead, ...currentLeads]));
    } catch (e) {
      console.error('Error auto capturing lead from RFQ quote submission', e);
    }

    showToast(`Quotation of ${quoteForm.quotationAmount} submitted successfully to ${selectedRfq.rfqNumber}!`, 'success');
    onLogTriggered(
      'RFQ_QUOTATION_SUBMITTED', 
      'rfq_quotations', 
      selectedRfq.id, 
      'SUCCESS', 
      `Submitted B2B quotation for ${selectedRfq.rfqNumber}. Bidding amount: ${quoteForm.quotationAmount}.`
    );

    // Reset Form
    setQuoteForm({
      companyProfile: userSession ? `${userSession.name} is a leading enterprise operating in real estate.` : '',
      quotationAmount: '',
      validity: '30 Days',
      deliveryTimeline: '14 Days',
      remarks: '',
      attachmentName: ''
    });
    setUploadedFile(null);
    setUploadedFileId(null);
    setIsSubmittingQuote(false);
  };

  // Publish new RFQ / Tender
  const handleCreateRfq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRfqForm.title || !newRfqForm.description || !newRfqForm.quantity) {
      showToast('Please complete all required fields.', 'error');
      return;
    }

    const generatedNum = `${newRfqForm.type === 'Government Tender' ? 'TEN' : 'RFQ'}-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRfqItem: RfqTender = {
      id: `rfq-${Date.now()}`,
      rfqNumber: generatedNum,
      title: newRfqForm.title,
      type: newRfqForm.type,
      businessCategory: newRfqForm.businessCategory,
      description: newRfqForm.description,
      requiredProductsServices: newRfqForm.requiredProductsServices || 'Standard Material Supply',
      quantity: newRfqForm.quantity,
      unit: newRfqForm.unit,
      technicalSpecification: newRfqForm.technicalSpecification || 'Standard ASTM / Bureau of Indian Standards (BIS) parameters apply.',
      attachmentName: uploadedFile || undefined,
      attachmentFileId: uploadedFileId || undefined,
      location: newRfqForm.location,
      deliveryLocation: newRfqForm.deliveryLocation || newRfqForm.location,
      expectedDeliveryDate: newRfqForm.expectedDeliveryDate || '2026-09-01',
      quotationSubmissionDeadline: newRfqForm.quotationSubmissionDeadline || '2026-08-15',
      estimatedBudget: newRfqForm.estimatedBudget || undefined,
      priority: newRfqForm.priority,
      visibility: newRfqForm.visibility,
      status: 'Open',
      companyId: currentOrgId() || 'ent-user',
      companyName: currentOrgName(),
      companyLogoBg: userSession?.logoBg || 'bg-emerald-600',
      companyLogoText: userSession?.name?.substring(0, 2).toUpperCase() || 'MY',
      verified: currentOrgVerified(),
      premium: false,
      postedDate: new Date().toISOString().substring(0, 10),
      bidsCount: 0,
      isFeatured: false,
      isTrending: false,
      isGovernment: newRfqForm.type === 'Government Tender',
      isPrivate: newRfqForm.visibility !== 'Public'
    };

    setRfqList(prev => [newRfqItem, ...prev]);
    // Bidders (other companies) must be able to open the tender documents.
    if (uploadedFileId) api('POST', `/files/${uploadedFileId}/publish`).catch(err => showToast(`The attachment could not be shared with bidders: ${errorMessage(err)}`, 'error'));

    // INTEGRATION 2: Automatically publish a B2B professional feed update
    const feedId = `feed-rfq-${Date.now()}`;
    const rfqFeedPost: FeedPost = {
      id: feedId,
      companyId: newRfqItem.companyId,
      companyName: newRfqItem.companyName,
      category: 'Builders',
      logoBg: newRfqItem.companyLogoBg,
      logoText: newRfqItem.companyLogoText,
      verified: newRfqItem.verified,
      premium: newRfqItem.premium,
      timestamp: 'Just Now',
      postType: 'RFQ Requirement',
      title: `B2B RFQ OUTBOX: ${newRfqItem.title}`,
      description: `📢 OFFICIAL B2B RFQ BULLETIN:\n\nWe have published a new verified B2B requirement (Ref: ${newRfqItem.rfqNumber}) on RealtyConnect.\n\n📋 TITLE: ${newRfqItem.title}\n📦 REQUIREMENT: ${newRfqItem.quantity} ${newRfqItem.unit}\n📍 DELIVERY TO: ${newRfqItem.deliveryLocation}\n⏱️ DEADLINE: ${newRfqItem.quotationSubmissionDeadline}\n\nQualified manufacturers, contractors and suppliers are invited to submit their compliant commercial and technical quotes directly.`,
      location: newRfqItem.deliveryLocation,
      distanceKm: 1.5,
      tags: ['RFQ', newRfqItem.businessCategory.replace(/\s+/g, ''), 'Procurement'],
      likesCount: 0,
      comments: []
    };

    setPosts(prev => [rfqFeedPost, ...prev]);

    showToast(`RFQ ${newRfqItem.rfqNumber} published & broad-casted to Business Feed!`, 'success');
    onLogTriggered(
      'RFQ_PUBLISHED',
      'rfqs',
      newRfqItem.id,
      'SUCCESS',
      `Published new B2B tender ${newRfqItem.rfqNumber}: "${newRfqItem.title}". Broad-casted feed update.`
    );

    // Reset Form
    setNewRfqForm({
      title: '',
      type: 'Material RFQ',
      businessCategory: 'Builders',
      description: '',
      requiredProductsServices: '',
      quantity: '',
      unit: 'Metric Tons',
      technicalSpecification: '',
      location: userSession?.location || 'Mumbai, MH',
      deliveryLocation: '',
      expectedDeliveryDate: '',
      quotationSubmissionDeadline: '',
      estimatedBudget: '',
      priority: 'Normal',
      visibility: 'Public',
      attachmentName: ''
    });
    setUploadedFile(null);
    setUploadedFileId(null);
    setActiveTab('directory');
  };

  // Convert Opportunity directly from list
  const handleConvertOpportunity = (opp: any) => {
    setNewRfqForm({
      title: opp.title,
      type: opp.title.toLowerCase().includes('procurement') || opp.title.toLowerCase().includes('supply') ? 'Material RFQ' : 'Service RFQ',
      businessCategory: opp.category,
      description: `Formal RFQ initiated via B2B Opportunity Exchange mapping.\n\nDescription details: ${opp.description}`,
      requiredProductsServices: opp.title.split('of')?.[1]?.trim() || 'Required Material',
      quantity: opp.budget?.includes('Crore') ? '1' : '100',
      unit: 'Project Lots',
      technicalSpecification: 'Technical parameters as per original opportunity criteria and state real-estate regulation clauses.',
      location: 'Mumbai, MH',
      deliveryLocation: 'Project site headquarters',
      expectedDeliveryDate: '2026-09-01',
      quotationSubmissionDeadline: '2026-08-15',
      estimatedBudget: opp.budget,
      priority: 'High',
      visibility: 'Public',
      attachmentName: ''
    });
    setActiveTab('create_rfq');
    showToast('Opportunity converted! Adjust technical configurations below.', 'success');
    onLogTriggered('B2B_OPPORTUNITY_CONVERTED_TO_RFQ', 'opportunities', opp.id, 'SUCCESS', `Initiated RFQ conversion from opportunity: "${opp.title}"`);
  };

  // Manage quotation status lifecycle (My RFQs panel)
  const handleUpdateQuoteStatus = (quoteId: string, status: 'Accepted' | 'Declined' | 'Under Review') => {
    const quote = quotationList.find(q => q.id === quoteId);
    if (quote && isRegisteredCompanyId(quote.companyId)) {
      // Tell the bidding company the outcome.
      api('POST', `/network/bids/${encodeURIComponent(quoteId)}/status`, { status }).catch(err => showToast(errorMessage(err), 'error'));
    }
    setQuotationList(prev => prev.map(q => {
      if (q.id === quoteId) {
        return { ...q, status };
      }
      return q;
    }));
    showToast(`Quotation has been placed under status: "${status}"`, 'info');
    onLogTriggered('RFQ_QUOTATION_STATUS_UPDATED', 'rfq_quotations', quoteId, 'SUCCESS', `Updated quotation status to: ${status}`);
  };

  return (
    <div className="space-y-6">
      {/* Header bar and Navigation tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
              RFQ & Tenders
            </span>
            <span className="text-[10px] text-slate-500 font-mono">REALTYCONNECT™ ECOSYSTEM</span>
          </div>
          <h1 className="font-display font-black text-xl sm:text-2xl text-white mt-1">
            RFQ & Tender Management
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Streamlined quotation interchange and structural tender exchange for certified B2B real estate construction builders, operators, and vendors.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex max-w-full overflow-x-auto bg-slate-950 p-1 rounded-xl border border-slate-900 gap-1 self-start md:self-center">
          <button
            type="button"
            onClick={() => {
              setActiveTab('directory');
              setSelectedRfq(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'directory' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>RFQ Directory</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('my_rfqs');
              setSelectedRfq(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 relative ${
              activeTab === 'my_rfqs' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>My RFQs</span>
            {quotationList.filter(q => q.status === 'Pending').length > 0 && (
              <span className="absolute -top-1.5 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[8px] flex items-center justify-center border border-slate-950 animate-pulse font-bold">
                {quotationList.filter(q => q.status === 'Pending').length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('create_rfq');
              setSelectedRfq(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'create_rfq' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create RFQ</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('convert_opp');
              setSelectedRfq(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'convert_opp' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Opportunity Sync</span>
          </button>
        </div>
      </div>

      {/* Main Container Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* VIEW 1: DIRECTORY */}
        {activeTab === 'directory' && (
          <div className="lg:col-span-12 space-y-6">
            
            {/* Featured Section Horizontal Filters */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-900 pb-3">
              <span className="text-[10px] font-mono text-slate-500 font-semibold uppercase mr-2">Featured Grids:</span>
              {[
                { id: 'All', label: 'All Open RFQs' },
                { id: 'Latest', label: 'Latest RFQs' },
                { id: 'Urgent', label: 'Urgent Requirements' },
                { id: 'Featured', label: 'Featured Solicitations' },
                { id: 'Closing Soon', label: 'Closing Soon' },
                { id: 'Govt', label: 'Government Tenders' },
                { id: 'Private', label: 'Private Group Tenders' }
              ].map(sec => (
                <button
                  key={sec.id}
                  onClick={() => setFeaturedFilter(sec.id)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors font-mono font-bold ${
                    featuredFilter === sec.id 
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-400/25' 
                      : 'bg-slate-950 hover:bg-slate-900 text-slate-400 border border-slate-900'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>

            {/* Quick Search & Expandable Filter Widget */}
            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search RFQs by title, keyword, products, company or RFQ number..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-900 rounded-xl text-xs text-slate-200 outline-none focus:border-emerald-500/50 transition-colors placeholder:text-slate-600"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                    isFiltersExpanded 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-slate-900/60 border-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Advanced Filters</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isFiltersExpanded ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Collapsible Advanced Filters Section */}
              {isFiltersExpanded && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-slate-900/40 animate-fade-in text-xs">
                  {/* RFQ Type */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 uppercase font-bold">RFQ Type</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500/30"
                    >
                      <option value="All">All Types</option>
                      {RFQ_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Business Category */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 uppercase font-bold">Business Category</label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500/30"
                    >
                      <option value="All">All Categories</option>
                      {BUSINESS_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 uppercase font-bold">Location</label>
                    <select
                      value={filterLocation}
                      onChange={(e) => setFilterLocation(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500/30"
                    >
                      <option value="All">All Cities</option>
                      {locationOptions.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>

                  {/* Priority */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 uppercase font-bold">Priority</label>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500/30"
                    >
                      <option value="All">All Priorities</option>
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 uppercase font-bold">Quotation Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500/30"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Open">Open</option>
                      <option value="Closed">Closed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Submission Deadline */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-500 uppercase font-bold">Time Window</label>
                    <select
                      value={filterDeadline}
                      onChange={(e) => setFilterDeadline(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500/30"
                    >
                      <option value="All">Any Time</option>
                      <option value="Closing Soon">Closing Soon (Under 15 Days)</option>
                      <option value="Recently Published">Recently Published (Last 3 Days)</option>
                    </select>
                  </div>

                  {/* Checkboxes */}
                  <div className="col-span-2 flex items-end gap-6 h-full pb-2">
                    <label className="flex items-center gap-2 cursor-pointer font-mono text-[10px] text-slate-400 font-bold uppercase select-none">
                      <input
                        type="checkbox"
                        checked={filterVerifiedOnly}
                        onChange={(e) => setFilterVerifiedOnly(e.target.checked)}
                        className="w-3.5 h-3.5 accent-emerald-500 rounded bg-slate-900 border-slate-800"
                      />
                      <span>Verified Businesses Only</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-mono text-[10px] text-slate-400 font-bold uppercase select-none">
                      <input
                        type="checkbox"
                        checked={filterPremiumOnly}
                        onChange={(e) => setFilterPremiumOnly(e.target.checked)}
                        className="w-3.5 h-3.5 accent-emerald-500 rounded bg-slate-900 border-slate-800"
                      />
                      <span>Premium Members Only</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* RFQs List Rendering */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredRfqs.length === 0 ? (
                <div className="col-span-2 bg-slate-950/40 border border-dashed border-slate-900 rounded-3xl p-12 text-center">
                  <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-300">No matching RFQs or Tenders discovered</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Try loosening your advanced filter metrics or look under our featured township procurement scopes.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterType('All');
                      setFilterCategory('All');
                      setFilterLocation('All');
                      setFilterPriority('All');
                      setFilterStatus('All');
                      setFilterDeadline('All');
                      setFilterVerifiedOnly(false);
                      setFilterPremiumOnly(false);
                      setFeaturedFilter('All');
                    }}
                    className="mt-4 px-4 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 rounded-lg text-xs font-mono font-bold border border-slate-800"
                  >
                    Clear Filter Criteria
                  </button>
                </div>
              ) : (
                filteredRfqs.map((rfq) => {
                  const isSaved = savedRfqs.includes(rfq.id);
                  return (
                    <div 
                      key={rfq.id}
                      className="bg-slate-950 border border-slate-900 hover:border-slate-850 rounded-2xl p-5 flex flex-col justify-between transition-all space-y-4 shadow-sm"
                    >
                      <div className="space-y-3">
                        {/* Card Topline Row */}
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-10 h-10 rounded-xl ${rfq.companyLogoBg} text-white font-black text-xs flex items-center justify-center`}>
                              {rfq.companyLogoText}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-200 hover:underline cursor-pointer">{rfq.companyName}</span>
                                {rfq.verified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-500/10" />}
                                {rfq.premium && <Award className="w-3.5 h-3.5 text-amber-400" />}
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono">Posted: {rfq.postedDate}</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1.5">
                            <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
                              {rfq.rfqNumber}
                            </span>
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                              rfq.priority === 'Urgent' 
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                : rfq.priority === 'High' 
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                : 'bg-slate-900 text-slate-400 border border-slate-800'
                            }`}>
                              {rfq.priority}
                            </span>
                          </div>
                        </div>

                        {/* Title & Category info */}
                        <div className="space-y-1">
                          <h3 
                            onClick={() => setSelectedRfq(rfq)}
                            className="font-display font-bold text-xs text-slate-100 leading-snug cursor-pointer hover:text-emerald-400 transition-colors line-clamp-2"
                          >
                            {rfq.title}
                          </h3>
                          <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-[10px] font-mono text-slate-400">
                            <span className="text-emerald-400 font-bold">{rfq.type}</span>
                            <span className="text-slate-600">•</span>
                            <span>{rfq.businessCategory}</span>
                            <span className="text-slate-600">•</span>
                            <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3 text-slate-500" /> {rfq.location}</span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {rfq.description}
                        </p>

                        {/* Bid Count KPI Bar */}
                        <div className="bg-slate-900/40 border border-slate-900 p-2.5 rounded-xl flex items-center justify-between text-[10px] font-mono">
                          <span className="text-slate-400 font-bold uppercase tracking-wider">Responses Filed:</span>
                          <span className="text-slate-200 font-bold text-[11px] bg-slate-950 px-2.5 py-0.5 rounded-md border border-slate-850">
                            {rfq.bidsCount} Bids Submitted
                          </span>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-900/60">
                        <div className="text-[10px] font-mono text-slate-500">
                          Deadline: <span className="text-slate-300 font-bold">{rfq.quotationSubmissionDeadline}</span>
                        </div>

                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleSaveRfq(rfq.id, rfq.title)}
                            className="p-1.5 bg-slate-900/60 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg border border-slate-850 transition-colors"
                            title="Save for Later"
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRfq(rfq);
                              onLogTriggered('RFQ_MODAL_OPENED', 'rfqs', rfq.id, 'SUCCESS', `Opened direct details sheet for tender scope ${rfq.rfqNumber}`);
                            }}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <span>Interact & Bid</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: MY RFQS */}
        {activeTab === 'my_rfqs' && (
          <div className="lg:col-span-12 space-y-6">
            
            {/* My RFQs Sidebar Filters */}
            <div className="flex max-w-full overflow-x-auto bg-slate-950 p-1 rounded-xl border border-slate-900 gap-1 self-start">
              <button
                type="button"
                onClick={() => setMyRfqSubFilter('published')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  myRfqSubFilter === 'published' ? 'bg-slate-800 text-emerald-400 border border-emerald-400/20' : 'text-slate-400'
                }`}
              >
                My Published RFQs ({rfqList.filter(r => r.companyId === (currentOrgId() || 'ent-user')).length})
              </button>
              <button
                type="button"
                onClick={() => setMyRfqSubFilter('drafts')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  myRfqSubFilter === 'drafts' ? 'bg-slate-800 text-emerald-400 border border-emerald-400/20' : 'text-slate-400'
                }`}
              >
                Draft RFQs
              </button>
              <button
                type="button"
                onClick={() => setMyRfqSubFilter('saved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  myRfqSubFilter === 'saved' ? 'bg-slate-800 text-emerald-400 border border-emerald-400/20' : 'text-slate-400'
                }`}
              >
                Bookmarked RFQs ({savedRfqs.length})
              </button>
              <button
                type="button"
                onClick={() => setMyRfqSubFilter('submissions')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  myRfqSubFilter === 'submissions' ? 'bg-slate-800 text-emerald-400 border border-emerald-400/20' : 'text-slate-400'
                }`}
              >
                Submitted Quotations ({quotationList.filter(q => q.companyId === (currentOrgId() || 'ent-user')).length})
              </button>
            </div>

            {/* List for each sub-filter */}
            <div className="space-y-4">
              {myRfqSubFilter === 'published' && (
                <div className="space-y-4">
                  {rfqList.filter(r => r.companyId === (currentOrgId() || 'ent-user')).length === 0 ? (
                    <div className="bg-slate-950/40 border border-dashed border-slate-900 rounded-3xl p-10 text-center">
                      <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-300">No RFQs published under your current session</p>
                      <button
                        onClick={() => setActiveTab('create_rfq')}
                        className="mt-3 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[11px] rounded-lg transition-all"
                      >
                        Publish Your First RFQ
                      </button>
                    </div>
                  ) : (
                    rfqList.filter(r => r.companyId === (currentOrgId() || 'ent-user')).map(rfq => (
                      <div key={rfq.id} className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase">{rfq.type}</span>
                            <h3 className="text-xs font-bold text-slate-100 mt-1">{rfq.title}</h3>
                            <p className="text-[10px] text-slate-500 font-mono mt-1">
                              ID: {rfq.rfqNumber} • Posted: {rfq.postedDate} • Deadline: {rfq.quotationSubmissionDeadline}
                            </p>
                          </div>
                          <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase">
                            {rfq.status}
                          </span>
                        </div>

                        {/* Direct Quotes/Bids received list under this RFQ */}
                        <div className="space-y-3 bg-slate-900/30 p-4 rounded-xl border border-slate-900">
                          <h4 className="text-[10px] font-mono uppercase font-black text-slate-400 tracking-wider flex items-center justify-between">
                            <span>BIDS RECEIVED FOR THIS WORK</span>
                            <span className="text-slate-500">{quotationList.filter(q => q.rfqId === rfq.id).length} Active Submissions</span>
                          </h4>

                          {quotationList.filter(q => q.rfqId === rfq.id).length === 0 ? (
                            <p className="text-[10px] text-slate-600 italic">No formal bids filed by verified vendors yet.</p>
                          ) : (
                            <div className="divide-y divide-slate-900">
                              {quotationList.filter(q => q.rfqId === rfq.id).map(q => (
                                <div key={q.id} className="py-3.5 first:pt-0 last:pb-0 space-y-2">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-6 h-6 rounded-md ${q.companyLogoBg} text-white font-black text-[9px] flex items-center justify-center`}>
                                        {q.companyName.substring(0, 2).toUpperCase()}
                                      </div>
                                      <div>
                                        <p className="text-[11px] font-bold text-slate-200">{q.companyName}</p>
                                        <p className="text-[9px] text-slate-500 font-mono">{q.submittedDate}</p>
                                      </div>
                                    </div>

                                    <div className="text-right">
                                      <p className="text-xs font-bold text-emerald-400">{q.quotationAmount}</p>
                                      <p className="text-[9px] text-slate-500 font-mono">Validity: {q.validity}</p>
                                    </div>
                                  </div>

                                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                                    {q.remarks}
                                  </p>

                                  <div className="flex justify-between items-center text-[10px] font-mono pt-1">
                                    <span className="text-slate-500">Attachment: {q.attachmentName ? <span onClick={() => q.attachmentFileId && openFile(q.attachmentFileId).then(ok => ok || showToast('The file could not be opened.', 'error'))} className="text-slate-300 hover:underline cursor-pointer">{q.attachmentName}</span> : 'none'}</span>
                                    
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateQuoteStatus(q.id, 'Declined')}
                                        className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/25 rounded hover:bg-red-500/20 text-[9px]"
                                      >
                                        Decline
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateQuoteStatus(q.id, 'Under Review')}
                                        className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/25 rounded hover:bg-yellow-500/20 text-[9px]"
                                      >
                                        Under Review
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateQuoteStatus(q.id, 'Accepted')}
                                        className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded hover:bg-emerald-500/20 text-[9px]"
                                      >
                                        Accept Quote
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {myRfqSubFilter === 'drafts' && (
                <div className="bg-slate-950/40 border border-dashed border-slate-900 rounded-3xl p-10 text-center">
                  <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-300">No Draft Tender specifications under your current desk</p>
                  <p className="text-[10px] text-slate-500 mt-1">You can save progress as draft anytime during RFQ creation.</p>
                </div>
              )}

              {myRfqSubFilter === 'saved' && (
                <div className="space-y-4">
                  {savedRfqs.length === 0 ? (
                    <div className="bg-slate-950/40 border border-dashed border-slate-900 rounded-3xl p-10 text-center">
                      <Bookmark className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-300">No RFQs saved to your bookmarked boards yet</p>
                    </div>
                  ) : (
                    rfqList.filter(r => savedRfqs.includes(r.id)).map(rfq => (
                      <div key={rfq.id} className="bg-slate-950 border border-slate-900 rounded-2xl p-4 flex items-center justify-between gap-4">
                        <div>
                          <span className="text-[9px] font-mono bg-slate-900 px-2 py-0.5 border border-slate-800 rounded text-slate-400">{rfq.rfqNumber}</span>
                          <h4 className="text-xs font-bold text-slate-200 mt-1">{rfq.title}</h4>
                          <p className="text-[10px] text-slate-500 mt-1">Published by: {rfq.companyName} • Location: {rfq.location}</p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleSaveRfq(rfq.id, rfq.title)}
                            className="p-1.5 bg-slate-900 text-red-400 rounded-lg border border-slate-800 hover:bg-slate-850"
                          >
                            Remove
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRfq(rfq)}
                            className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold text-[11px] rounded-lg"
                          >
                            Open Details
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {myRfqSubFilter === 'submissions' && (
                <div className="space-y-4">
                  {quotationList.filter(q => q.companyId === (currentOrgId() || 'ent-user')).length === 0 ? (
                    <div className="bg-slate-950/40 border border-dashed border-slate-900 rounded-3xl p-10 text-center">
                      <Send className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-300">No quotation responses submitted by you yet</p>
                      <p className="text-[10px] text-slate-500 mt-1">Browse the RFQ Directory to bid on active material scopes.</p>
                    </div>
                  ) : (
                    quotationList.filter(q => q.companyId === (currentOrgId() || 'ent-user')).map(q => {
                      const parentRfq = rfqList.find(r => r.id === q.rfqId);
                      return (
                        <div key={q.id} className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[9px] font-mono bg-slate-900 px-2 py-0.5 border border-slate-800 rounded text-slate-400">
                                Bidding on {parentRfq?.rfqNumber || 'RFQ-2026'}
                              </span>
                              <h4 className="text-xs font-bold text-slate-200 mt-1.5">{parentRfq?.title || 'Required Real-estate procurement'}</h4>
                              <p className="text-[10px] text-slate-500 mt-0.5">Published by: {parentRfq?.companyName}</p>
                            </div>

                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                              q.status === 'Accepted' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' 
                                : q.status === 'Declined' 
                                ? 'bg-red-500/10 text-red-400 border border-red-500/25' 
                                : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/25'
                            }`}>
                              {q.status}
                            </span>
                          </div>

                          <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-900 flex justify-between items-center text-xs">
                            <div>
                              <span className="text-slate-500 block text-[9px] font-mono uppercase">My Quote Amount</span>
                              <span className="text-slate-200 font-bold">{q.quotationAmount}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-500 block text-[9px] font-mono uppercase">Delivery Timeline</span>
                              <span className="text-slate-200 font-bold">{q.deliveryTimeline}</span>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-500 font-sans italic">"{q.remarks}"</p>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: CREATE RFQ */}
        {activeTab === 'create_rfq' && (
          <div className="lg:col-span-8 bg-slate-950 border border-slate-900 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="font-display font-bold text-sm text-slate-200">Initiate B2B Procurement Tender / RFQ</h2>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase tracking-wider">All publishing fields verified for active regulatory compliance</p>
            </div>

            <form onSubmit={handleCreateRfq} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">RFQ/Tender Title *</label>
                  <input
                    type="text"
                    value={newRfqForm.title}
                    onChange={(e) => setNewRfqForm({ ...newRfqForm, title: e.target.value })}
                    placeholder="e.g. Supply of 5,000 Bags of Grade 53 Portland Pozzolana Cement"
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500/40"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">RFQ Type *</label>
                  <select
                    value={newRfqForm.type}
                    onChange={(e) => setNewRfqForm({ ...newRfqForm, type: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500/40"
                  >
                    {RFQ_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Target Business Category *</label>
                  <select
                    value={newRfqForm.businessCategory}
                    onChange={(e) => setNewRfqForm({ ...newRfqForm, businessCategory: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500/40"
                  >
                    {BUSINESS_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Scope Requirement Quantity *</label>
                  <input
                    type="text"
                    value={newRfqForm.quantity}
                    onChange={(e) => setNewRfqForm({ ...newRfqForm, quantity: e.target.value })}
                    placeholder="e.g. 5,000"
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500/40"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Unit *</label>
                  <select
                    value={newRfqForm.unit}
                    onChange={(e) => setNewRfqForm({ ...newRfqForm, unit: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500/40"
                  >
                    <option value="Metric Tons">Metric Tons</option>
                    <option value="Units">Units / Numbers</option>
                    <option value="Sq Ft">Sq Footage</option>
                    <option value="Bags">Bags (Sacks)</option>
                    <option value="Truck Loads">Truck Loads</option>
                    <option value="Months Lease">Months Lease</option>
                    <option value="Consolidated Services">Consolidated Services</option>
                  </select>
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Scope Description *</label>
                  <textarea
                    value={newRfqForm.description}
                    onChange={(e) => setNewRfqForm({ ...newRfqForm, description: e.target.value })}
                    rows={4}
                    placeholder="Describe specific project background, delivery milestones, mobilization schedule, and standard commercial compliance needs..."
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500/40 font-sans"
                    required
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Required Products / Services Specification</label>
                  <input
                    type="text"
                    value={newRfqForm.requiredProductsServices}
                    onChange={(e) => setNewRfqForm({ ...newRfqForm, requiredProductsServices: e.target.value })}
                    placeholder="e.g. UltraTech Grade 53 cement, Coromandel premium OPC, ACC Gold..."
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500/40"
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Detailed Technical Specification clauses</label>
                  <textarea
                    value={newRfqForm.technicalSpecification}
                    onChange={(e) => setNewRfqForm({ ...newRfqForm, technicalSpecification: e.target.value })}
                    rows={2}
                    placeholder="Describe chemical composition, grade, safety ratings, compliance standard (e.g. IS 12269)..."
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500/40 font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Posting Location *</label>
                  <input
                    type="text"
                    value={newRfqForm.location}
                    onChange={(e) => setNewRfqForm({ ...newRfqForm, location: e.target.value })}
                    placeholder="e.g. Mumbai, MH"
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500/40"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Consignee Delivery Location *</label>
                  <input
                    type="text"
                    value={newRfqForm.deliveryLocation}
                    onChange={(e) => setNewRfqForm({ ...newRfqForm, deliveryLocation: e.target.value })}
                    placeholder="e.g. Symbiosis Township site, Worli, Mumbai"
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500/40"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Expected Delivery Date *</label>
                  <input
                    type="date"
                    value={newRfqForm.expectedDeliveryDate}
                    onChange={(e) => setNewRfqForm({ ...newRfqForm, expectedDeliveryDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500/40"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Quotation Submission Deadline *</label>
                  <input
                    type="date"
                    value={newRfqForm.quotationSubmissionDeadline}
                    onChange={(e) => setNewRfqForm({ ...newRfqForm, quotationSubmissionDeadline: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500/40"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Estimated Budget (Optional)</label>
                  <input
                    type="text"
                    value={newRfqForm.estimatedBudget}
                    onChange={(e) => setNewRfqForm({ ...newRfqForm, estimatedBudget: e.target.value })}
                    placeholder="e.g. ₹2.4 Crores"
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Priority Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Normal', 'High', 'Urgent'].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewRfqForm({ ...newRfqForm, priority: p as any })}
                        className={`py-2 text-xs font-mono font-bold rounded-xl transition-all border ${
                          newRfqForm.priority === p 
                            ? 'bg-slate-800 text-emerald-400 border-emerald-500/30' 
                            : 'bg-slate-900 border-slate-850 text-slate-400'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">RFQ Visibility Rule</label>
                  <select
                    value={newRfqForm.visibility}
                    onChange={(e) => setNewRfqForm({ ...newRfqForm, visibility: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500/40"
                  >
                    <option value="Public">Public (Global Discoverable)</option>
                    <option value="Private">Private (Connections Only)</option>
                    <option value="Invite Only">Invite Only</option>
                    <option value="Premium Members">Premium Members Only</option>
                  </select>
                </div>

                {/* Upload attachment simulator */}
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Tender Annexure / Tech Drawings Spec Sheet</label>
                  <div className="border border-dashed border-slate-900 rounded-xl p-4 bg-slate-900/10 flex flex-col items-center text-center relative cursor-pointer hover:bg-slate-900/20 transition-all">
                    <input
                      type="file"
                      onChange={handleSimulatedUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <FileSpreadsheet className="w-8 h-8 text-slate-600 mb-2" />
                    {isUploading ? (
                      <span className="text-[11px] text-emerald-400 font-mono animate-pulse">Running ISO-9001 virus threat scans...</span>
                    ) : uploadedFile ? (
                      <span className="text-[11px] text-emerald-400 font-mono font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Checked: {uploadedFile}
                      </span>
                    ) : (
                      <>
                        <span className="text-[11px] text-slate-400">Drag files here or click to upload drawings/spec schedules</span>
                        <span className="text-[9px] text-slate-500 mt-1 font-mono">Supported: PDF, ZIP, XLSX (Max 15MB)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('directory');
                    showToast('RFQ draft discarded.', 'info');
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-400 font-mono font-bold rounded-xl"
                >
                  Discard Draft
                </button>
                
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-mono font-bold rounded-xl shadow-lg transition-transform"
                >
                  Publish RFP / Tender
                </button>
              </div>
            </form>
          </div>
        )}

        {/* VIEW 4: CONVERT OPPORTUNITY PANEL */}
        {activeTab === 'convert_opp' && (
          <div className="lg:col-span-12 space-y-6">
            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 space-y-4">
              <div>
                <h2 className="font-display font-bold text-sm text-slate-200">Convert B2B Exchange Opportunities to Quotation Tenders</h2>
                <p className="text-[11px] text-slate-500 font-sans leading-relaxed mt-0.5">
                  Our automatic compiler maps high-level real estate requests directly into structured RFQ forms. No duplicate entries, full data integrity.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {convertableOpportunities.map(opp => (
                  <div key={opp.id} className="bg-slate-900/30 border border-slate-900 p-4 rounded-xl space-y-3 hover:border-slate-800 transition-all flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[9px] font-mono">
                        <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase font-bold">{opp.category}</span>
                        <span className="text-slate-500">{opp.date}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 leading-snug line-clamp-2">{opp.title}</h4>
                      <p className="text-[10px] text-slate-500 line-clamp-2 font-sans leading-relaxed">{opp.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[10px] font-mono">
                      <span>Value: <span className="text-emerald-400 font-bold">{opp.budget}</span></span>
                      <button
                        type="button"
                        onClick={() => handleConvertOpportunity(opp)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-emerald-500 hover:text-slate-950 font-bold text-[10px] rounded transition-all border border-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Convert to RFQ</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Widgets (Only shown when not in full-screen tabs) */}
        {activeTab !== 'convert_opp' && activeTab !== 'my_rfqs' && (
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Stats Panel */}
            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 space-y-3">
              <h3 className="text-[10px] font-mono text-slate-400 font-black uppercase tracking-wider">Tender Activity Monitor</h3>
              
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-900">
                  <span className="text-slate-500 block text-[9px]">Active Ten-RFQs</span>
                  <span className="text-slate-200 font-bold text-sm block mt-1">{rfqList.filter(r => r.status === 'Open').length} Solicitations</span>
                </div>
                <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-900">
                  <span className="text-slate-500 block text-[9px]">Total MY Quotes</span>
                  <span className="text-slate-200 font-bold text-sm block mt-1">{quotationList.length} Responses</span>
                </div>
              </div>
            </div>

            {/* In-app guidelines */}
            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 space-y-3.5 text-xs text-slate-400 leading-relaxed font-sans">
              <h3 className="text-[10px] font-mono text-slate-400 font-black uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Ecosystem Regulations</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                RealtyConnect enforces strict standard specifications:
              </p>
              <ul className="space-y-1.5 list-disc pl-4 text-[10px] text-slate-500 font-mono">
                <li>All bidding quotes represent firm commercial binding commitments.</li>
                <li>ISO cert check scheduled prior to contract award.</li>
                <li>Tender updates automatically sync to stakeholders feed.</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL DRAWER / OVERLAY MODAL */}
      {selectedRfq && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-850 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col justify-between overflow-hidden shadow-2xl animate-scale-up text-xs">
            {/* Header */}
            <div className="p-5 border-b border-slate-900 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono px-2 py-0.5 rounded">
                    {selectedRfq.rfqNumber}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{selectedRfq.type}</span>
                </div>
                <h3 className="font-display font-bold text-sm text-slate-100 mt-1 leading-snug">{selectedRfq.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRfq(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body Scroll Area */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Publisher Card */}
              <div className="bg-slate-900/30 border border-slate-900 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${selectedRfq.companyLogoBg} text-white font-black text-xs flex items-center justify-center`}>
                    {selectedRfq.companyLogoText}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">{selectedRfq.companyName}</h4>
                    <span className="text-[10px] text-slate-500">Established B2B Enterprise Client</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 uppercase">
                    Verified RFP
                  </span>
                </div>
              </div>

              {/* Requirement Summary */}
              <div className="grid grid-cols-2 gap-4 bg-slate-900/10 border border-slate-900 p-4 rounded-xl font-mono text-[10px]">
                <div>
                  <span className="text-slate-500 block uppercase font-bold mb-1">Target Category</span>
                  <span className="text-slate-300 font-semibold">{selectedRfq.businessCategory}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold mb-1">Quantity Scope</span>
                  <span className="text-slate-300 font-semibold">{selectedRfq.quantity} {selectedRfq.unit}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold mb-1">Delivery Destination</span>
                  <span className="text-slate-300 font-semibold">{selectedRfq.deliveryLocation}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold mb-1">Expected Delivery Date</span>
                  <span className="text-slate-300 font-semibold">{selectedRfq.expectedDeliveryDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold mb-1">Submission Deadline</span>
                  <span className="text-red-400 font-bold">{selectedRfq.quotationSubmissionDeadline}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold mb-1">Estimated Budget</span>
                  <span className="text-emerald-400 font-bold">{selectedRfq.estimatedBudget || 'Under ND Clause'}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="font-mono text-[10px] text-slate-400 uppercase font-black tracking-wider">Detailed Scope Background</h4>
                <p className="text-slate-400 leading-relaxed font-sans text-[11px] bg-slate-900/30 p-3.5 rounded-xl border border-slate-900/50">
                  {selectedRfq.description}
                </p>
              </div>

              {/* Technical specifications */}
              <div className="space-y-2">
                <h4 className="font-mono text-[10px] text-slate-400 uppercase font-black tracking-wider">Quality Compliance & Material Spec Standards</h4>
                <p className="text-slate-400 leading-relaxed font-sans text-[11px] bg-slate-900/30 p-3.5 rounded-xl border border-slate-900/50">
                  {selectedRfq.technicalSpecification}
                </p>
              </div>

              {/* Specifications Attachments */}
              {selectedRfq.attachmentName && (
                <div className="space-y-2">
                  <h4 className="font-mono text-[10px] text-slate-400 uppercase font-black tracking-wider">Tender Specifications & Bill of Quantities (BoQ)</h4>
                  <div className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-900 rounded-xl">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                      <span className="text-slate-300 font-mono text-[11px]">{selectedRfq.attachmentName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => selectedRfq.attachmentFileId
                        ? openFile(selectedRfq.attachmentFileId).then(ok => ok || showToast('The file could not be opened.', 'error'))
                        : showToast('This sample RFQ has no downloadable file.', 'info')}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded font-mono text-[10px] border border-slate-850 flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Direct Quotation Form Section */}
              {isSubmittingQuote ? (
                <form onSubmit={handleSubmitQuotation} className="space-y-4 border-t border-slate-900 pt-5 text-xs animate-fade-in">
                  <div>
                    <h4 className="font-mono text-[10px] text-emerald-400 uppercase font-black tracking-wider">Submit Quotation Proposal</h4>
                    <p className="text-[10px] text-slate-500 font-sans mt-0.5">Submit certified commercial bids to request final contract review</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Our Company Profile summary *</label>
                      <textarea
                        value={quoteForm.companyProfile}
                        onChange={(e) => setQuoteForm({ ...quoteForm, companyProfile: e.target.value })}
                        rows={2}
                        className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500/40"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Commercial Bidding Quote Amount *</label>
                      <input
                        type="text"
                        value={quoteForm.quotationAmount}
                        onChange={(e) => setQuoteForm({ ...quoteForm, quotationAmount: e.target.value })}
                        placeholder="e.g. ₹6,12,50,000"
                        className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500/40"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Quote Validity *</label>
                      <select
                        value={quoteForm.validity}
                        onChange={(e) => setQuoteForm({ ...quoteForm, validity: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500/40"
                      >
                        <option value="15 Days">15 Days</option>
                        <option value="30 Days">30 Days (Standard)</option>
                        <option value="45 Days">45 Days</option>
                        <option value="60 Days">60 Days</option>
                        <option value="90 Days">90 Days</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Project Delivery Timeline *</label>
                      <input
                        type="text"
                        value={quoteForm.deliveryTimeline}
                        onChange={(e) => setQuoteForm({ ...quoteForm, deliveryTimeline: e.target.value })}
                        placeholder="e.g. Bi-weekly dispatches of 400 MT"
                        className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500/40"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Drawing spec Attachment (PDF/DOCX)</label>
                      <input
                        type="file"
                        onChange={handleSimulatedUpload}
                        className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300"
                      />
                    </div>

                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Commercial & Execution Remarks</label>
                      <textarea
                        value={quoteForm.remarks}
                        onChange={(e) => setQuoteForm({ ...quoteForm, remarks: e.target.value })}
                        rows={3}
                        placeholder="State clear logistic delivery clauses, credit terms, and standard taxations..."
                        className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500/40"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsSubmittingQuote(false)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-400 font-mono font-bold rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-mono font-bold rounded-lg flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Response Bids</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="border-t border-slate-900 pt-5 flex flex-wrap justify-between items-center gap-3">
                  {/* B2B Collaboration Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const newConversationId = `conv-rfq-supplier-${selectedRfq.id}`;
                        // Seed conversation
                        try {
                          const conversationsJson = appStore.getItem('realtyconnect_conversations');
                          let conversationsList = conversationsJson ? JSON.parse(conversationsJson) : [];
                          const exists = conversationsList.some((c: any) => c.id === newConversationId);
                          if (!exists) {
                            const newConv = {
                              id: newConversationId,
                              companyName: selectedRfq.companyName,
                              companyId: selectedRfq.companyId || 'company-rfq',
                              logoBg: selectedRfq.companyLogoBg || 'bg-indigo-600',
                              conversationType: 'RFQ Supplier Discussion' as const,
                              lastMessageText: `Collaboration request created for RFQ Tender: ${selectedRfq.title}`,
                              lastMessageTime: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                              unreadCount: 0,
                              priority: 'High' as const,
                              pinned: false,
                              archived: false,
                              assignedExecutive: currentUserName(),
                              relatedEntity: {
                                type: 'RFQ' as const,
                                id: selectedRfq.id,
                                title: selectedRfq.title
                              },
                              messages: [
                                {
                                  id: `msg-rfq-sys-${Date.now()}`,
                                  sender: 'system' as any,
                                  senderName: 'System',
                                  senderCompany: 'RealtyConnect',
                                  text: `RFQ Supplier Discussion initiated for Tender Reference: ${selectedRfq.rfqNumber}`,
                                  timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                  type: 'system' as const
                                },
                                {
                                  id: `msg-rfq-user-${Date.now()}`,
                                  sender: 'self' as any,
                                  senderName: 'Procurement Officer',
                                  senderCompany: 'Elite Materials & Co',
                                  text: `Hello, we would like to initiate a formal Supplier Discussion regarding RFQ ${selectedRfq.rfqNumber} ("${selectedRfq.title}"). Please let us know your standard net-30 execution margins and warranty credentials.`,
                                  timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                  type: 'text' as const,
                                  status: 'read' as const
                                }
                              ] as any[]
                            };
                            conversationsList.unshift(newConv);
                            appStore.setItem('realtyconnect_conversations', JSON.stringify(conversationsList));
                          }
                        } catch (e) {}

                        appStore.setItem('realtyconnect_active_conversation_id', newConversationId);
                        if (setActiveViewMode) {
                          setActiveViewMode('messaging');
                          showToast(`Supplier Discussion thread loaded for ${selectedRfq.rfqNumber}`, 'success');
                          onLogTriggered('RFQ_COLLAB_SUPPLIER_STARTED', 'rfqs', selectedRfq.id, 'SUCCESS', `CRM: Initiated supplier-level collaborative thread on ${selectedRfq.rfqNumber}`);
                        } else {
                          showToast('Supplier thread configured. Select B2B Messaging to view.', 'info');
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 font-mono text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Supplier Discussion
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const newConversationId = `conv-rfq-buyer-${selectedRfq.id}`;
                        // Seed conversation
                        try {
                          const conversationsJson = appStore.getItem('realtyconnect_conversations');
                          let conversationsList = conversationsJson ? JSON.parse(conversationsJson) : [];
                          const exists = conversationsList.some((c: any) => c.id === newConversationId);
                          if (!exists) {
                            const newConv = {
                              id: newConversationId,
                              companyName: selectedRfq.companyName,
                              companyId: selectedRfq.companyId || 'company-rfq',
                              logoBg: selectedRfq.companyLogoBg || 'bg-teal-600',
                              conversationType: 'RFQ Buyer Discussion' as const,
                              lastMessageText: `Buyer Discussion initiated for: ${selectedRfq.title}`,
                              lastMessageTime: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                              unreadCount: 0,
                              priority: 'Normal' as const,
                              pinned: false,
                              archived: false,
                              assignedExecutive: currentUserName(),
                              relatedEntity: {
                                type: 'RFQ' as const,
                                id: selectedRfq.id,
                                title: selectedRfq.title
                              },
                              messages: [
                                {
                                  id: `msg-rfq-sys-${Date.now()}`,
                                  sender: 'system' as any,
                                  senderName: 'System',
                                  senderCompany: 'RealtyConnect',
                                  text: `RFQ Buyer-to-Publisher Discussion initiated for Reference: ${selectedRfq.rfqNumber}`,
                                  timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                  type: 'system' as const
                                },
                                {
                                  id: `msg-rfq-user-${Date.now()}`,
                                  sender: 'self' as any,
                                  senderName: 'Procurement Specialist',
                                  senderCompany: 'Elite Materials & Co',
                                  text: `Hi B2B Procurement Desk at ${selectedRfq.companyName}, we are reviewing your active RFQ Tender ("${selectedRfq.title}"). We would appreciate additional details on the material grades and site logistic permissions.`,
                                  timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                  type: 'text' as const,
                                  status: 'read' as const
                                }
                              ] as any[]
                            };
                            conversationsList.unshift(newConv);
                            appStore.setItem('realtyconnect_conversations', JSON.stringify(conversationsList));
                          }
                        } catch (e) {}

                        appStore.setItem('realtyconnect_active_conversation_id', newConversationId);
                        if (setActiveViewMode) {
                          setActiveViewMode('messaging');
                          showToast(`Buyer Discussion thread loaded for ${selectedRfq.rfqNumber}`, 'success');
                          onLogTriggered('RFQ_COLLAB_BUYER_STARTED', 'rfqs', selectedRfq.id, 'SUCCESS', `CRM: Initiated buyer-level discussion on RFQ ${selectedRfq.rfqNumber}`);
                        } else {
                          showToast('Buyer discussion configured. Select B2B Messaging to view.', 'info');
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 font-mono text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Buyer Discussion
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const newConversationId = `conv-rfq-clarify-${selectedRfq.id}`;
                        // Seed conversation
                        try {
                          const conversationsJson = appStore.getItem('realtyconnect_conversations');
                          let conversationsList = conversationsJson ? JSON.parse(conversationsJson) : [];
                          const exists = conversationsList.some((c: any) => c.id === newConversationId);
                          if (!exists) {
                            const newConv = {
                              id: newConversationId,
                              companyName: selectedRfq.companyName,
                              companyId: selectedRfq.companyId || 'company-rfq',
                              logoBg: selectedRfq.companyLogoBg || 'bg-amber-600',
                              conversationType: 'Quotation Clarification' as const,
                              lastMessageText: `Quotation Clarification requested on: ${selectedRfq.title}`,
                              lastMessageTime: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                              unreadCount: 0,
                              priority: 'Normal' as const,
                              pinned: false,
                              archived: false,
                              assignedExecutive: currentUserName(),
                              relatedEntity: {
                                type: 'RFQ' as const,
                                id: selectedRfq.id,
                                title: selectedRfq.title
                              },
                              messages: [
                                {
                                  id: `msg-rfq-sys-${Date.now()}`,
                                  sender: 'system' as any,
                                  senderName: 'System',
                                  senderCompany: 'RealtyConnect',
                                  text: `Quotation Clarification thread created for RFQ: ${selectedRfq.rfqNumber}`,
                                  timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                  type: 'system' as const
                                },
                                {
                                  id: `msg-rfq-user-${Date.now()}`,
                                  sender: 'self' as any,
                                  senderName: 'Senior Estimator',
                                  senderCompany: 'Elite Materials & Co',
                                  text: `Greetings. We are preparing our commercial quote bid proposal for "${selectedRfq.title}". We would like to request technical clarification on the specified concrete additives and site delivery access times.`,
                                  timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                  type: 'text' as const,
                                  status: 'read' as const
                                }
                              ] as any[]
                            };
                            conversationsList.unshift(newConv);
                            appStore.setItem('realtyconnect_conversations', JSON.stringify(conversationsList));
                          }
                        } catch (e) {}

                        appStore.setItem('realtyconnect_active_conversation_id', newConversationId);
                        if (setActiveViewMode) {
                          setActiveViewMode('messaging');
                          showToast(`Clarification discussion thread loaded for ${selectedRfq.rfqNumber}`, 'success');
                          onLogTriggered('RFQ_COLLAB_CLARIFY_STARTED', 'rfqs', selectedRfq.id, 'SUCCESS', `CRM: Requested technical quotation clarification on ${selectedRfq.rfqNumber}`);
                        } else {
                          showToast('Clarification thread configured. Select B2B Messaging to view.', 'info');
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 font-mono text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Quotation Clarification
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmittingQuote(true);
                      onLogTriggered('RFQ_QUOTE_FORM_OPENED', 'rfqs', selectedRfq.id, 'SUCCESS', `Opened interactive quote sheet to submit commercial proposal on ${selectedRfq.rfqNumber}`);
                    }}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-mono font-bold rounded-xl transition-all flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>File Commercial Quotation</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
