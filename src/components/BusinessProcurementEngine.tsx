import { currentUserName } from '../lib/identity';
import { appStore } from '../lib/appStore';
import React, { useState, useEffect } from 'react';
import { 
  Search, Building2, Users, CheckCircle2, ArrowRight, MapPin, Mail, Phone, 
  Briefcase, Award, Building, Check, MessageSquare, ChevronRight, Sparkles, 
  ShieldCheck, Database, Filter, DollarSign, AlertTriangle, LayoutDashboard, 
  FileText, ShoppingBag, ClipboardList, Layers, X, Plus, PlusCircle, Bookmark, 
  Activity, Calendar, TrendingUp, AlertCircle, Trash2, CheckCircle, Grid, List, 
  HardHat, FileSpreadsheet, ChevronDown, ChevronLeft, Truck, CheckSquare, 
  Star, Clock, BarChart3, Settings2, Sparkle
} from 'lucide-react';

// Interfaces for Procurement Engine
export interface ProcurementRequest {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  category: string;
  quantity: string;
  estimatedCost: number; // in INR Rupees
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Sourcing Bids' | 'Ordered' | 'In Transit' | 'Completed' | 'Rejected';
  requiredDate: string;
  requestedBy: string;
  assignedSupplierId?: string;
  assignedSupplierName?: string;
  associatedRfqId?: string;
  specifications: string;
  comments: string;
  createdDate: string;
  timeline: {
    id: string;
    date: string;
    status: string;
    text: string;
    user: string;
  }[];
}

export interface ProcurementSupplier {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number; // out of 5.0
  verified: boolean;
  preferred: boolean;
  contactPerson: string;
  email: string;
  phone: string;
  deliveryPerformance: number; // % on-time
  qualityPerformance: number; // % defect-free
  overallScore: number; // out of 100
  recentDeliveries: number;
  activeOrdersCount: number;
}

const INITIAL_SUPPLIERS: ProcurementSupplier[] = [
  {
    id: 'sup-1',
    name: 'Elite Materials Group',
    category: 'Structural Steel & Rebars',
    location: 'Delhi NCR, DL',
    rating: 4.8,
    verified: true,
    preferred: true,
    contactPerson: 'Vikram Singh',
    email: 'v.singh@elitemat.com',
    phone: '+91 99110 33455',
    deliveryPerformance: 98,
    qualityPerformance: 99,
    overallScore: 98.5,
    recentDeliveries: 45,
    activeOrdersCount: 2
  },
  {
    id: 'sup-2',
    name: 'Hindustan Cement Corp',
    category: 'Cement & Concrete',
    location: 'Mumbai, MH',
    rating: 4.7,
    verified: true,
    preferred: true,
    contactPerson: 'Rajesh Raut',
    email: 'procurement@hindustancement.com',
    phone: '+91 98200 44021',
    deliveryPerformance: 96,
    qualityPerformance: 97,
    overallScore: 96.5,
    recentDeliveries: 120,
    activeOrdersCount: 3
  },
  {
    id: 'sup-3',
    name: 'Titan Steel Distributors',
    category: 'Structural Steel & Plates',
    location: 'Ahmedabad, GJ',
    rating: 4.6,
    verified: true,
    preferred: false,
    contactPerson: 'Amit Patel',
    email: 'sales@titansteel.co.in',
    phone: '+91 79220 55110',
    deliveryPerformance: 92,
    qualityPerformance: 96,
    overallScore: 94.0,
    recentDeliveries: 28,
    activeOrdersCount: 1
  },
  {
    id: 'sup-4',
    name: 'Green Brick Logistics',
    category: 'Transport & Dry Mortar',
    location: 'Pune, MH',
    rating: 4.9,
    verified: true,
    preferred: true,
    contactPerson: 'Milind Sane',
    email: 'm.sane@greenbrick.in',
    phone: '+91 20441 55600',
    deliveryPerformance: 100,
    qualityPerformance: 98,
    overallScore: 99.0,
    recentDeliveries: 84,
    activeOrdersCount: 4
  },
  {
    id: 'sup-5',
    name: 'Supreme Concrete Products',
    category: 'Precast & AAC Blocks',
    location: 'Chennai, TN',
    rating: 4.5,
    verified: false,
    preferred: false,
    contactPerson: 'K. Srinivasan',
    email: 'ks@supremeconcrete.co.in',
    phone: '+91 44210 99001',
    deliveryPerformance: 90,
    qualityPerformance: 95,
    overallScore: 92.5,
    recentDeliveries: 15,
    activeOrdersCount: 0
  }
];

const INITIAL_REQUESTS: ProcurementRequest[] = [
  {
    id: 'PR-2026-001',
    title: 'High-Ductility Fe550D TMT Reinforcement Steel',
    projectId: 'proj-1',
    projectName: 'Amara Sky Towers',
    category: 'Structural Steel',
    quantity: '120 Metric Tons',
    estimatedCost: 6540000, // ₹65.4 Lakhs
    priority: 'High',
    status: 'In Transit',
    requiredDate: '2026-08-15',
    requestedBy: 'Vikram Malhotra',
    assignedSupplierId: 'sup-1',
    assignedSupplierName: 'Elite Materials Group',
    associatedRfqId: 'rfq-1',
    specifications: 'Grade Fe550D rebar matching IS 1786:2008 standards. Bureau Veritas certification required with physical steel test sheets upon dispatch. Bundle length: 12m.',
    comments: 'Critical foundation steel for tower B central shear core slab casting. Direct escrow payment backed by National Trust Bank is configured.',
    createdDate: '2026-07-01',
    timeline: [
      { id: 'ev-1', date: '2026-07-01 10:30 AM', status: 'Draft', text: 'Material requirements analyzed and request draft saved.', user: 'Vikram Malhotra' },
      { id: 'ev-2', date: '2026-07-02 02:15 PM', status: 'Pending Approval', text: 'Request submitted for corporate budgetary review and project compliance alignment.', user: 'Vikram Malhotra' },
      { id: 'ev-3', date: '2026-07-04 11:00 AM', status: 'Approved', text: 'Sourcing budget allocated. Approved by Procurement Director.', user: 'Director of Sourcing' },
      { id: 'ev-4', date: '2026-07-05 09:30 AM', status: 'Sourcing Bids', text: 'Linked with ecosystem RFQ tender: published to local verified steel supply circle.', user: 'System Auto-Linker' },
      { id: 'ev-5', date: '2026-07-10 04:00 PM', status: 'Ordered', text: 'Bids finalized. Elite Materials Group selected as preferred vendor. Purchase confirmation dispatched.', user: 'Vikram Malhotra' },
      { id: 'ev-6', date: '2026-07-15 01:20 PM', status: 'In Transit', text: 'Wholesale batch dispatched with certified physical test logs. Truck transit ID: MH-43-AG-2090.', user: 'Elite Logistics desk' }
    ]
  },
  {
    id: 'PR-2026-002',
    title: 'Grade M40 High-Stress Ready Mix Concrete',
    projectId: 'proj-1',
    projectName: 'Amara Sky Towers',
    category: 'Cement & Concrete',
    quantity: '450 Cubic Meters',
    estimatedCost: 2250000, // ₹22.5 Lakhs
    priority: 'Urgent',
    status: 'Approved',
    requiredDate: '2026-07-28',
    requestedBy: 'Sanjay Kumar',
    assignedSupplierId: 'sup-2',
    assignedSupplierName: 'Hindustan Cement Corp',
    specifications: 'High-early strength M40 grade cement with micro-silica additives for fast shear wall hardening. Slump flow retention of 120 minutes.',
    comments: 'Required for pouring columns from level 15 to 17. Delay in concrete batch arrival will trigger penalty clause on civil subcontractor.',
    createdDate: '2026-07-10',
    timeline: [
      { id: 'ev-201', date: '2026-07-10 09:15 AM', status: 'Draft', text: 'Request drafted to mitigate potential concrete shortage.', user: 'Sanjay Kumar' },
      { id: 'ev-202', date: '2026-07-11 11:45 AM', status: 'Pending Approval', text: 'Forwarded directly as urgent supply line.', user: 'Sanjay Kumar' },
      { id: 'ev-203', date: '2026-07-13 03:30 PM', status: 'Approved', text: 'Authorized bypass clearance by Project Manager. Hindustan Cement allocated for priority transit.', user: 'Vikram Malhotra' }
    ]
  },
  {
    id: 'PR-2026-003',
    title: 'Heavy Double-Drum Precast Shuttering Columns',
    projectId: 'proj-2',
    projectName: 'Giga Logistics Park',
    category: 'Heavy Equipment & Precast',
    quantity: '30 Units',
    estimatedCost: 4500000, // ₹45.0 Lakhs
    priority: 'Normal',
    status: 'Sourcing Bids',
    requiredDate: '2026-09-10',
    requestedBy: 'Rohit Sharma',
    specifications: 'Self-climbing horizontal precast shutters conforming to industrial warehouse ceiling dimensions. Loading capacity 20T/sqm.',
    comments: 'Sourcing bids from global and local industrial prefab equipment rental companies.',
    createdDate: '2026-07-14',
    timeline: [
      { id: 'ev-301', date: '2026-07-14 08:00 AM', status: 'Draft', text: 'Structural blueprint matching precast framework requirements created.', user: 'Rohit Sharma' },
      { id: 'ev-302', date: '2026-07-14 10:20 AM', status: 'Pending Approval', text: 'Awaiting structural compliance review.', user: 'Rohit Sharma' },
      { id: 'ev-303', date: '2026-07-15 11:55 AM', status: 'Approved', text: 'Civil engineering compliance approved.', user: 'Project Lead' },
      { id: 'ev-304', date: '2026-07-16 02:45 PM', status: 'Sourcing Bids', text: 'Tender details compiled and exported to procurement listings feed.', user: 'System Auto-Linker' }
    ]
  },
  {
    id: 'PR-2026-004',
    title: 'Precision Temperature-Control HVAC Chillers',
    projectId: 'proj-2',
    projectName: 'Giga Logistics Park',
    category: 'Electrical & Mechanical',
    quantity: '4 Units',
    estimatedCost: 11200000, // ₹1.12 Crores
    priority: 'High',
    status: 'Pending Approval',
    requiredDate: '2026-11-20',
    requestedBy: 'Rohit Sharma',
    specifications: 'Industrial grade 150-ton scroll chillers with digital thermostat monitoring and redundant standby loops. Required for cold pharma warehouse bay.',
    comments: 'Slightly high budget item. Needs Board of Sourcing executive alignment before signing the RFP parameters.',
    createdDate: '2026-07-16',
    timeline: [
      { id: 'ev-401', date: '2026-07-16 11:30 AM', status: 'Draft', text: 'Drafted mechanical specs using cold storage blueprint v1.4.', user: 'Rohit Sharma' },
      { id: 'ev-402', date: '2026-07-16 04:10 PM', status: 'Pending Approval', text: 'Sent to corporate audit and project budgeting board.', user: 'Rohit Sharma' }
    ]
  },
  {
    id: 'PR-2026-005',
    title: 'Fly Ash Eco-Bricks (Strength Grade 10)',
    projectId: 'proj-1',
    projectName: 'Amara Sky Towers',
    category: 'Materials Supply',
    quantity: '75,000 Bricks',
    estimatedCost: 1275000, // ₹12.75 Lakhs
    priority: 'Normal',
    status: 'Completed',
    requiredDate: '2026-06-30',
    requestedBy: 'Vikram Malhotra',
    assignedSupplierId: 'sup-4',
    assignedSupplierName: 'Green Brick Logistics',
    specifications: 'Eco-friendly autoclaved aerated concrete (AAC) blocks, density 600kg/m3, thermal conductivity 0.16 W/mK. Sourced from recycled fly ash.',
    comments: 'Procured successfully under sustainable carbon-offset commercial program.',
    createdDate: '2026-05-10',
    timeline: [
      { id: 'ev-501', date: '2026-05-10 11:00 AM', status: 'Draft', text: 'Drafted green material specs.', user: 'Vikram Malhotra' },
      { id: 'ev-502', date: '2026-05-12 01:45 PM', status: 'Approved', text: 'Approved for carbon offset credits alignment.', user: 'Sustainability Auditor' },
      { id: 'ev-503', date: '2026-05-15 03:00 PM', status: 'Ordered', text: 'Contract signed with Green Brick Logistics.', user: 'Vikram Malhotra' },
      { id: 'ev-504', date: '2026-06-25 10:00 AM', status: 'In Transit', text: 'Shipped from Pune factory in 3 batch loads.', user: 'Green Brick dispatch' },
      { id: 'ev-505', date: '2026-06-29 04:30 PM', status: 'Completed', text: 'Received onsite. Verified compliance, compression tests approved.', user: 'Vikram Malhotra' }
    ]
  }
];

interface BusinessProcurementEngineProps {
  userSession: { email: string; role: string; permissions: string[] } | null;
  onLogTriggered: (action: string, entity: string, entityId: string, status: 'SUCCESS' | 'FAILURE' | 'WARNING', details: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  setActiveViewMode: (viewMode: any) => void;
}

export default function BusinessProcurementEngine({
  userSession,
  onLogTriggered,
  showToast,
  setActiveViewMode
}: BusinessProcurementEngineProps) {
  
  // Storage persistence
  const [requests, setRequests] = useState<ProcurementRequest[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_procurement_requests');
      return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
    } catch (e) {
      return INITIAL_REQUESTS;
    }
  });

  const [suppliers, setSuppliers] = useState<ProcurementSupplier[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_procurement_suppliers');
      return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
    } catch (e) {
      return INITIAL_SUPPLIERS;
    }
  });

  useEffect(() => {
    try {
      appStore.setItem('realtyconnect_procurement_requests', JSON.stringify(requests));
    } catch (e) {
      console.error('Error saving requests', e);
    }
  }, [requests]);

  useEffect(() => {
    try {
      appStore.setItem('realtyconnect_procurement_suppliers', JSON.stringify(suppliers));
    } catch (e) {
      console.error('Error saving suppliers', e);
    }
  }, [suppliers]);

  // UI States
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'suppliers'>('dashboard');
  
  // Filtering & Sorting States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'id' | 'cost_asc' | 'cost_desc' | 'date' | 'title' | 'status'>('id');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'card' | 'list'>('card');
  
  // Selection & Details panel state
  const [selectedRequest, setSelectedRequest] = useState<ProcurementRequest | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<ProcurementSupplier | null>(null);

  // Modal Creation States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);

  // New Request Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formProjectId, setFormProjectId] = useState('proj-1');
  const [formCategory, setFormCategory] = useState('Materials Supply');
  const [formQuantity, setFormQuantity] = useState('');
  const [formCost, setFormCost] = useState('');
  const [formPriority, setFormPriority] = useState<'Low' | 'Normal' | 'High' | 'Urgent'>('Normal');
  const [formRequiredDate, setFormRequiredDate] = useState('');
  const [formSpecifications, setFormSpecifications] = useState('');
  const [formComments, setFormComments] = useState('');

  // New Supplier Form Fields
  const [supName, setSupName] = useState('');
  const [supCategory, setSupCategory] = useState('Cement & Concrete');
  const [supLocation, setSupLocation] = useState('');
  const [supContact, setSupContact] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supPhone, setSupPhone] = useState('');

  // Sourcing Action Helper
  const [promotionTargetRequest, setPromotionTargetRequest] = useState<ProcurementRequest | null>(null);

  // Reset Sourcing request form
  const resetForm = () => {
    setFormTitle('');
    setFormProjectId('proj-1');
    setFormCategory('Materials Supply');
    setFormQuantity('');
    setFormCost('');
    setFormPriority('Normal');
    setFormRequiredDate('');
    setFormSpecifications('');
    setFormComments('');
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formQuantity.trim() || !formCost.trim() || !formRequiredDate) {
      showToast('Please fill in all mandatory procurement fields.', 'error');
      return;
    }

    const costNum = parseFloat(formCost.replace(/,/g, ''));
    if (isNaN(costNum) || costNum <= 0) {
      showToast('Please specify a valid budget amount.', 'error');
      return;
    }

    const projectNamesMap: { [key: string]: string } = {
      'proj-1': 'Amara Sky Towers',
      'proj-2': 'Giga Logistics Park',
      'proj-3': 'Phoenix Hub Mall'
    };

    const newId = `PR-2026-${String(requests.length + 1).padStart(3, '0')}`;
    const newReq: ProcurementRequest = {
      id: newId,
      title: formTitle,
      projectId: formProjectId,
      projectName: projectNamesMap[formProjectId] || 'General Allocation',
      category: formCategory,
      quantity: formQuantity,
      estimatedCost: costNum,
      priority: formPriority,
      status: 'Draft',
      requiredDate: formRequiredDate,
      requestedBy: userSession ? userSession.email.split('@')[0] : 'Sourcing Liaison',
      specifications: formSpecifications || 'Standard industry specifications apply.',
      comments: formComments || 'No comments.',
      createdDate: new Date().toISOString().split('T')[0],
      timeline: [
        {
          id: `ev-${Date.now()}-1`,
          date: new Date().toLocaleString(),
          status: 'Draft',
          text: 'Material procurement parameters drafted in system catalog.',
          user: userSession ? userSession.email : 'system'
        }
      ]
    };

    setRequests(prev => [newReq, ...prev]);
    setIsCreateModalOpen(false);
    resetForm();
    onLogTriggered(
      'PROCUREMENT_REQUEST_CREATED',
      'procurement_requests',
      newId,
      'SUCCESS',
      `Procurement Engine: Registered Purchase Request "${formTitle}" in Draft mode with budget ₹${(costNum / 100000).toFixed(2)} Lakhs.`
    );
    showToast(`Registered draft request ${newId}!`, 'success');
  };

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim() || !supLocation.trim() || !supContact.trim() || !supEmail.trim()) {
      showToast('Please fill in all mandatory supplier fields.', 'error');
      return;
    }

    const newId = `sup-${Date.now().toString().slice(-4)}`;
    const newSup: ProcurementSupplier = {
      id: newId,
      name: supName,
      category: supCategory,
      location: supLocation,
      rating: 5.0,
      verified: true,
      preferred: true,
      contactPerson: supContact,
      email: supEmail,
      phone: supPhone || '+91 90000 00000',
      deliveryPerformance: 100,
      qualityPerformance: 100,
      overallScore: 100,
      recentDeliveries: 0,
      activeOrdersCount: 0
    };

    setSuppliers(prev => [...prev, newSup]);
    setIsAddSupplierModalOpen(false);
    setSupName('');
    setSupLocation('');
    setSupContact('');
    setSupEmail('');
    setSupPhone('');
    
    onLogTriggered(
      'PROCUREMENT_SUPPLIER_ADDED',
      'procurement_suppliers',
      newId,
      'SUCCESS',
      `Procurement Engine: Whitelisted new Preferred Supplier ${supName} under category ${supCategory}.`
    );
    showToast(`Added Preferred Supplier: ${supName}`, 'success');
  };

  const handleApproveRequest = (id: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        const nextStatus = 'Approved';
        const newTimelineEvent = {
          id: `ev-${Date.now()}`,
          date: new Date().toLocaleString(),
          status: nextStatus,
          text: 'Request evaluated and approved by budgetary authority.',
          user: userSession ? userSession.email : 'Director Sourcing'
        };
        onLogTriggered(
          'PROCUREMENT_REQUEST_APPROVED',
          'procurement_requests',
          id,
          'SUCCESS',
          `Procurement: Budget approved for ${req.title}. Ready for direct supplier assignment or RFQ bidding.`
        );
        showToast(`Approved Request ${id}`, 'success');
        const updated = { ...req, status: nextStatus as any, timeline: [...req.timeline, newTimelineEvent] };
        if (selectedRequest?.id === id) {
          setSelectedRequest(updated);
        }
        return updated;
      }
      return req;
    }));
  };

  const handleRejectRequest = (id: string, reason: string = 'Budgetary mismatch / standard review guidelines limit') => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        const nextStatus = 'Rejected';
        const newTimelineEvent = {
          id: `ev-${Date.now()}`,
          date: new Date().toLocaleString(),
          status: nextStatus,
          text: `Request rejected. Reason: ${reason}`,
          user: userSession ? userSession.email : 'Director Sourcing'
        };
        onLogTriggered(
          'PROCUREMENT_REQUEST_REJECTED',
          'procurement_requests',
          id,
          'WARNING',
          `Procurement: Request ${id} rejected due to budget/priority alignment checks.`
        );
        showToast(`Rejected Request ${id}`, 'error');
        const updated = { ...req, status: nextStatus as any, timeline: [...req.timeline, newTimelineEvent] };
        if (selectedRequest?.id === id) {
          setSelectedRequest(updated);
        }
        return updated;
      }
      return req;
    }));
  };

  const handleSendToApproval = (id: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        const nextStatus = 'Pending Approval';
        const newTimelineEvent = {
          id: `ev-${Date.now()}`,
          date: new Date().toLocaleString(),
          status: nextStatus,
          text: 'Request submitted for budget audit clearance.',
          user: userSession ? userSession.email : 'system'
        };
        onLogTriggered(
          'PROCUREMENT_SUBMIT_APPROVAL',
          'procurement_requests',
          id,
          'SUCCESS',
          `Procurement: Sent request ${id} to Board approval queue.`
        );
        showToast(`Submitted request ${id} for approval`, 'info');
        const updated = { ...req, status: nextStatus as any, timeline: [...req.timeline, newTimelineEvent] };
        if (selectedRequest?.id === id) {
          setSelectedRequest(updated);
        }
        return updated;
      }
      return req;
    }));
  };

  const handlePromoteToRfq = (req: ProcurementRequest) => {
    // Integration logic: create a dummy RFQ in appStore to simulate cross-engine promotion
    try {
      const activeRfqs = appStore.getItem('realtyconnect_rfqs');
      const currentList = activeRfqs ? JSON.parse(activeRfqs) : [];
      
      const newRfqId = `rfq-${Date.now().toString().slice(-4)}`;
      const newRfqObj = {
        id: newRfqId,
        title: `Procurement Sourcing: ${req.title}`,
        category: req.category,
        quantity: req.quantity,
        estimatedValue: `₹${(req.estimatedCost / 100000).toFixed(2)} Lakhs`,
        closeDate: req.requiredDate,
        description: req.specifications,
        publishedBy: req.projectName,
        bidsCount: 0,
        status: 'active',
        timestamp: new Date().toLocaleString()
      };

      appStore.setItem('realtyconnect_rfqs', JSON.stringify([newRfqObj, ...currentList]));
      
      // Update our procurement status
      setRequests(prev => prev.map(r => {
        if (r.id === req.id) {
          const nextStatus = 'Sourcing Bids';
          const newTimelineEvent = {
            id: `ev-${Date.now()}`,
            date: new Date().toLocaleString(),
            status: nextStatus,
            text: `RFQ launched automatically under ID ${newRfqId}. Synchronized with B2B RFQs & Tenders engine.`,
            user: userSession ? userSession.email : 'system'
          };
          onLogTriggered(
            'PROCUREMENT_PROMOTED_TO_RFQ',
            'procurement_requests',
            req.id,
            'SUCCESS',
            `Procurement: Promoted procurement PR ${req.id} into active RFQ Tender ${newRfqId}.`
          );
          showToast(`RFQ tender successfully published for PR ${req.id}!`, 'success');
          const updated = { ...r, status: nextStatus as any, associatedRfqId: newRfqId, timeline: [...r.timeline, newTimelineEvent] };
          if (selectedRequest?.id === r.id) {
            setSelectedRequest(updated);
          }
          return updated;
        }
        return r;
      }));
    } catch (e) {
      console.error(e);
      showToast('Ecosystem integration mismatch.', 'error');
    }
  };

  const handleAssignSupplier = (reqId: string, supplierId: string) => {
    const targetSup = suppliers.find(s => s.id === supplierId);
    if (!targetSup) return;

    setRequests(prev => prev.map(r => {
      if (r.id === reqId) {
        const nextStatus = 'Ordered';
        const newTimelineEvent = {
          id: `ev-${Date.now()}`,
          date: new Date().toLocaleString(),
          status: nextStatus,
          text: `Vendor allocated: assigned procurement order parameters to ${targetSup.name}. Direct pricing terms finalized.`,
          user: userSession ? userSession.email : 'system'
        };

        // Also update supplier metrics in state
        setSuppliers(curr => curr.map(s => {
          if (s.id === supplierId) {
            return {
              ...s,
              activeOrdersCount: s.activeOrdersCount + 1
            };
          }
          return s;
        }));

        onLogTriggered(
          'PROCUREMENT_SUPPLIER_ASSIGNED',
          'procurement_requests',
          reqId,
          'SUCCESS',
          `Procurement: Finalized supplier contract with ${targetSup.name} for PR ${reqId}.`
        );
        showToast(`Assigned ${targetSup.name} to Request ${reqId}`, 'success');

        const updated = {
          ...r,
          status: nextStatus as any,
          assignedSupplierId: supplierId,
          assignedSupplierName: targetSup.name,
          timeline: [...r.timeline, newTimelineEvent]
        };

        if (selectedRequest?.id === reqId) {
          setSelectedRequest(updated);
        }
        return updated;
      }
      return r;
    }));
  };

  const handleUpdateTransitStatus = (reqId: string) => {
    setRequests(prev => prev.map(r => {
      if (r.id === reqId) {
        const nextStatus = 'In Transit';
        const newTimelineEvent = {
          id: `ev-${Date.now()}`,
          date: new Date().toLocaleString(),
          status: nextStatus,
          text: 'Dispatch completed by vendor. Sourcing transit timeline actively logging.',
          user: r.assignedSupplierName || 'Supplier Logistics'
        };

        onLogTriggered(
          'PROCUREMENT_TRANSIT_ACTIVATED',
          'procurement_requests',
          reqId,
          'SUCCESS',
          `Procurement: Active tracking initiated for transit delivery on PR ${reqId}.`
        );
        showToast(`Material status updated to In Transit!`, 'info');

        const updated = {
          ...r,
          status: nextStatus as any,
          timeline: [...r.timeline, newTimelineEvent]
        };

        if (selectedRequest?.id === reqId) {
          setSelectedRequest(updated);
        }
        return updated;
      }
      return r;
    }));
  };

  const handleMarkRequestComplete = (reqId: string) => {
    setRequests(prev => prev.map(r => {
      if (r.id === reqId) {
        const nextStatus = 'Completed';
        const newTimelineEvent = {
          id: `ev-${Date.now()}`,
          date: new Date().toLocaleString(),
          status: nextStatus,
          text: 'Materials received on site. Quality metrics approved. RERA compliance checklist updated.',
          user: currentUserName()
        };

        // Update supplier delivery statistics
        if (r.assignedSupplierId) {
          setSuppliers(curr => curr.map(s => {
            if (s.id === r.assignedSupplierId) {
              return {
                ...s,
                activeOrdersCount: Math.max(0, s.activeOrdersCount - 1),
                recentDeliveries: s.recentDeliveries + 1
              };
            }
            return s;
          }));
        }

        onLogTriggered(
          'PROCUREMENT_REQUEST_COMPLETED',
          'procurement_requests',
          reqId,
          'SUCCESS',
          `Procurement: Handover finalized for PR ${reqId}. Materials cleared and stacked on project site.`
        );
        showToast(`Completed material handover for PR ${reqId}!`, 'success');

        const updated = {
          ...r,
          status: nextStatus as any,
          timeline: [...r.timeline, newTimelineEvent]
        };

        if (selectedRequest?.id === reqId) {
          setSelectedRequest(updated);
        }
        return updated;
      }
      return r;
    }));
  };

  const handleDeleteRequest = (id: string) => {
    if (window.confirm(`Are you sure you want to delete procurement request ${id}?`)) {
      setRequests(prev => prev.filter(req => req.id !== id));
      setSelectedRequest(null);
      onLogTriggered(
        'PROCUREMENT_REQUEST_DELETED',
        'procurement_requests',
        id,
        'WARNING',
        `Procurement: Deleted Purchase Request ${id} from corporate registers.`
      );
      showToast(`Deleted request ${id}`, 'error');
    }
  };

  // Sourcing Filters implementation
  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.requestedBy.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesProject = selectedProject === 'All' || req.projectId === selectedProject;
    const matchesStatus = selectedStatus === 'All' || req.status === selectedStatus;
    const matchesPriority = selectedPriority === 'All' || req.priority === selectedPriority;
    const matchesCategory = selectedCategory === 'All' || req.category === selectedCategory;

    return matchesSearch && matchesProject && matchesStatus && matchesPriority && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'cost_asc') return a.estimatedCost - b.estimatedCost;
    if (sortBy === 'cost_desc') return b.estimatedCost - a.estimatedCost;
    if (sortBy === 'date') return new Date(b.requiredDate).getTime() - new Date(a.requiredDate).getTime();
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'status') return a.status.localeCompare(b.status);
    return b.id.localeCompare(a.id); // Default sorted by ID desc
  });

  // Supplier Search & Sorting
  const filteredSuppliers = suppliers.filter(sup => 
    sup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sup.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sup.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Computed Dashboard Analytics
  const stats = {
    totalRequests: requests.length,
    pendingApprovals: requests.filter(r => r.status === 'Pending Approval').length,
    approvedRequests: requests.filter(r => r.status === 'Approved').length,
    openProcurements: requests.filter(r => ['Approved', 'Sourcing Bids', 'Ordered', 'In Transit'].includes(r.status)).length,
    completedProcurements: requests.filter(r => r.status === 'Completed').length,
    preferredSuppliers: suppliers.filter(s => s.preferred).length,
    upcomingDeliveries: requests.filter(r => r.status === 'In Transit').length,
    totalBudgetLakhs: requests.reduce((acc, r) => acc + r.estimatedCost, 0) / 100000
  };

  const priorityColors = {
    Low: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
    Normal: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    High: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    Urgent: 'bg-red-500/10 text-red-400 border border-red-500/25 animate-pulse'
  };

  const statusColors = {
    Draft: 'bg-slate-500/10 text-slate-300 border border-slate-800',
    'Pending Approval': 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    Approved: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    'Sourcing Bids': 'bg-teal-500/10 text-teal-300 border border-teal-500/20',
    Ordered: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    'In Transit': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    Completed: 'bg-emerald-500 text-slate-950 font-bold',
    Rejected: 'bg-red-500/10 text-red-400 border border-red-500/20'
  };

  const formatCurrency = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(val / 100000).toFixed(2)} Lakhs`;
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-950 text-slate-200 min-h-screen font-sans">
      
      {/* Enterprise Header Preserving Style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] uppercase tracking-widest font-bold mb-2">
            <Sparkle className="w-3 h-3 text-emerald-400 animate-pulse" />
            Procurement
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
            <HardHat className="w-5 h-5 text-emerald-500" />
            Procurement Management Engine
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage the full material requisition cycle, budget approvals, preferred suppliers, and transit compliance logs.
          </p>
        </div>

        {/* Global Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/60 border border-slate-850 rounded-xl shrink-0">
          <button
            onClick={() => {
              setActiveTab('dashboard');
              onLogTriggered('PROCUREMENT_TAB_SWITCHED', 'procurement', 'dashboard', 'SUCCESS', 'Switched procurement screen tab to Dashboard.');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          
          <button
            onClick={() => {
              setActiveTab('requests');
              onLogTriggered('PROCUREMENT_TAB_SWITCHED', 'procurement', 'requests', 'SUCCESS', 'Switched procurement screen tab to Sourcing Directory.');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all flex items-center gap-1.5 relative ${
              activeTab === 'requests'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Requisitions</span>
            {requests.filter(r => r.status === 'Pending Approval').length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
            )}
          </button>
          
          <button
            onClick={() => {
              setActiveTab('suppliers');
              onLogTriggered('PROCUREMENT_TAB_SWITCHED', 'procurement', 'suppliers', 'SUCCESS', 'Switched procurement screen tab to Suppliers Performance.');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all flex items-center gap-1.5 ${
              activeTab === 'suppliers'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Preferred Suppliers</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: PROCUREMENT DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-250">
          
          {/* Quick Metrics Counters Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 flex flex-col justify-between hover:border-slate-800 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Purchase Requests</span>
                <div className="p-1 rounded bg-slate-950 text-slate-400 border border-slate-850"><ClipboardList className="w-3.5 h-3.5" /></div>
              </div>
              <div className="mt-2.5">
                <div className="text-2xl font-extrabold text-white font-mono">{stats.totalRequests}</div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <span className="text-purple-400 font-bold font-mono">{stats.pendingApprovals}</span> awaiting review audits
                </div>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 flex flex-col justify-between hover:border-slate-800 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Approved / Active</span>
                <div className="p-1 rounded bg-slate-950 text-emerald-400 border border-slate-850"><CheckCircle className="w-3.5 h-3.5" /></div>
              </div>
              <div className="mt-2.5">
                <div className="text-2xl font-extrabold text-white font-mono">{stats.approvedRequests + stats.openProcurements}</div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <span className="text-teal-400 font-bold font-mono">{requests.filter(r => r.status === 'Sourcing Bids').length}</span> actively sourcing tenders
                </div>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 flex flex-col justify-between hover:border-slate-800 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Transit Deliveries</span>
                <div className="p-1 rounded bg-slate-950 text-amber-400 border border-slate-850"><Truck className="w-3.5 h-3.5" /></div>
              </div>
              <div className="mt-2.5">
                <div className="text-2xl font-extrabold text-white font-mono">{stats.upcomingDeliveries}</div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <span className="text-amber-400 font-bold font-mono">{stats.upcomingDeliveries}</span> dispatch shipments en route
                </div>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 flex flex-col justify-between hover:border-slate-800 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Suppliers Whitelist</span>
                <div className="p-1 rounded bg-slate-950 text-blue-400 border border-slate-850"><Award className="w-3.5 h-3.5" /></div>
              </div>
              <div className="mt-2.5">
                <div className="text-2xl font-extrabold text-white font-mono">{stats.preferredSuppliers}</div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  Overall Avg Score: <span className="text-emerald-400 font-bold font-mono">96.1%</span>
                </div>
              </div>
            </div>

          </div>

          {/* Core Analytics Showcase Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Category Sourcing Volume Distribution */}
            <div className="lg:col-span-2 bg-slate-900/20 border border-slate-900 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-tight">Sourcing Volume Category Breakdown</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Aggregate Budget: ₹{stats.totalBudgetLakhs.toFixed(2)} Lakhs</span>
              </div>
              
              <div className="space-y-3.5 pt-1">
                {[
                  { label: 'Structural Steel', count: 2, value: 11040000, color: 'bg-emerald-500' },
                  { label: 'Cement & Concrete', count: 1, value: 2250000, color: 'bg-indigo-500' },
                  { label: 'Heavy Shuttering Prefab', count: 1, value: 4500000, color: 'bg-teal-500' },
                  { label: 'Sustainable Fly Ash', count: 1, value: 1275000, color: 'bg-amber-400' }
                ].map((item, idx) => {
                  const maxVal = 11040000;
                  const percent = (item.value / maxVal) * 100;
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-300 font-sans font-medium">{item.label} ({item.count} items)</span>
                        <span className="text-white font-bold">{formatCurrency(item.value)}</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900/60">
                        <div 
                          className={`${item.color} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[10px] text-slate-400">Total allocations aligned with RERA Project Escrow directives.</p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('requests');
                    onLogTriggered('PROCUREMENT_INTEGRATION_AUDIT', 'procurement', 'escrow', 'SUCCESS', 'Procurement Dashboard: Exported sourcing ledger logs.');
                  }}
                  className="text-[9px] font-mono font-bold text-emerald-400 hover:underline flex items-center gap-0.5 uppercase cursor-pointer"
                >
                  Audit Ledger <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Upcoming Sourcing Deliveries */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-tight">Active Deliveries</span>
                  </div>
                  <span className="text-[9px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">Real-time GPS</span>
                </div>

                <div className="space-y-3.5 pt-4">
                  {requests.filter(r => r.status === 'In Transit').map((req, i) => (
                    <div 
                      key={i} 
                      onClick={() => {
                        setSelectedRequest(req);
                        setActiveTab('requests');
                      }}
                      className="p-3 bg-slate-950 rounded-lg border border-slate-900 hover:border-slate-800 transition-all cursor-pointer space-y-2 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-400">{req.id}</span>
                        <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">In Transit</span>
                      </div>
                      <h4 className="text-xs font-bold text-white leading-snug truncate">{req.title}</h4>
                      
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-900/50">
                        <div>
                          <div className="text-[8px] text-slate-500 font-sans uppercase">Vendor</div>
                          <div className="text-slate-300 font-bold truncate">{req.assignedSupplierName}</div>
                        </div>
                        <div>
                          <div className="text-[8px] text-slate-500 font-sans uppercase">ETA Destination</div>
                          <div className="text-slate-300 font-bold">{req.requiredDate}</div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {requests.filter(r => r.status === 'In Transit').length === 0 && (
                    <div className="p-8 text-center text-slate-500 space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-xs">No pending shipments in transit.</p>
                      <p className="text-[9px] text-slate-600">Approved orders await supplier dispatch clearance logs.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-900 mt-4 text-center">
                <p className="text-[9px] text-slate-500">Logistics dispatch channels managed via Green Brick cargo desks.</p>
              </div>
            </div>

          </div>

          {/* Quick Action shortcuts & Suppliers Lookup */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Preferred Sourcing Partners */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-tight">Ecosystem Preferred Supplier Directory</span>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('suppliers');
                    onLogTriggered('PROCUREMENT_SUPPLIERS_LOOKUP', 'procurement', 'suppliers_link', 'SUCCESS', 'Dashboard: Swapped to Supplier tab.');
                  }}
                  className="text-[10px] font-mono font-bold text-emerald-400 hover:underline flex items-center gap-0.5 uppercase cursor-pointer"
                >
                  All Partners <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-900">
                {suppliers.slice(0, 3).map((sup, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-left">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{sup.name}</h4>
                        {sup.verified && (
                          <span className="text-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 rounded font-mono font-bold">Verified</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">{sup.category} • {sup.location}</p>
                    </div>

                    <div className="text-right font-mono space-y-1">
                      <div className="text-xs font-bold text-emerald-400">{sup.overallScore}% score</div>
                      <div className="text-[9px] text-slate-500">{sup.activeOrdersCount} active orders</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Sourcing Operations Desk */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 space-y-4 text-left">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Quick Procurement Sourcing Operations</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Initiate standard purchase requisitions for your active real estate projects. Approved requisitions automatically link to B2B directories and tender listings.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsCreateModalOpen(true);
                    onLogTriggered('PROCUREMENT_CREATE_INITIATED', 'procurement', 'shortcut', 'SUCCESS', 'Dashboard: Opened shortcut material requisition form.');
                  }}
                  className="p-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all flex flex-col justify-between h-24 text-left cursor-pointer"
                >
                  <PlusCircle className="w-5 h-5 stroke-[2]" />
                  <div>
                    <span className="block font-extrabold uppercase tracking-tight">Requisition</span>
                    <span className="text-[9px] text-slate-900 font-semibold leading-none">Draft material request</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('requests');
                    setSelectedStatus('Pending Approval');
                    onLogTriggered('PROCUREMENT_APPROVAL_shortcut', 'procurement', 'shortcut', 'SUCCESS', 'Dashboard: Navigated to pending approvals queue.');
                  }}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-200 font-bold text-xs transition-all flex flex-col justify-between h-24 text-left cursor-pointer"
                >
                  <CheckSquare className="w-5 h-5 text-purple-400" />
                  <div>
                    <span className="block font-bold uppercase tracking-tight">Approve Desk</span>
                    <span className="text-[9px] text-slate-400 font-mono leading-none">
                      {requests.filter(r => r.status === 'Pending Approval').length} requests pending
                    </span>
                  </div>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* VIEW 2: PROCUREMENT DIRECTORY / REQUISITIONS */}
      {activeTab === 'requests' && (
        <div className="space-y-6 animate-in fade-in duration-250">
          
          {/* Sourcing Filter Controls */}
          <div className="bg-slate-900/20 border border-slate-900 p-4 rounded-xl space-y-4">
            <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
              
              {/* Left Side: Real-time Search input */}
              <div className="relative w-full lg:max-w-md flex items-center bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-slate-300">
                <Search className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Search requisitions by ID, material name, category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-500"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-slate-300">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Right Side: Requisitions actions & layout toggle */}
              <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                
                {/* Layout Toggler */}
                <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-850 rounded-lg">
                  <button
                    onClick={() => setLayoutMode('grid')}
                    className={`p-1.5 rounded transition-all cursor-pointer ${layoutMode === 'grid' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                    title="Grid View"
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setLayoutMode('card')}
                    className={`p-1.5 rounded transition-all cursor-pointer ${layoutMode === 'card' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                    title="Card View"
                  >
                    <Layers className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setLayoutMode('list')}
                    className={`p-1.5 rounded transition-all cursor-pointer ${layoutMode === 'list' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                    title="List View"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Sourcing Requisition trigger */}
                <button
                  onClick={() => {
                    setIsCreateModalOpen(true);
                    onLogTriggered('PROCUREMENT_CREATE_INITIATED', 'procurement', 'action', 'SUCCESS', 'Requisitions Directory: Opened material requisition form.');
                  }}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/15 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Create Request</span>
                </button>
              </div>

            </div>

            {/* Sourcing advanced filters drawer */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-1 border-t border-slate-900/60">
              
              {/* Project Filter */}
              <div className="space-y-1 text-left">
                <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Project Link</label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 font-mono outline-none"
                >
                  <option value="All">All Projects</option>
                  <option value="proj-1">Amara Sky Towers</option>
                  <option value="proj-2">Giga Logistics Park</option>
                  <option value="proj-3">Phoenix Hub Mall</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="space-y-1 text-left">
                <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Process Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 font-mono outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Approved">Approved</option>
                  <option value="Sourcing Bids">Sourcing Bids</option>
                  <option value="Ordered">Ordered</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div className="space-y-1 text-left">
                <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Sourcing Priority</label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 font-mono outline-none"
                >
                  <option value="All">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="space-y-1 text-left">
                <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Material Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 font-mono outline-none"
                >
                  <option value="All">All Categories</option>
                  <option value="Structural Steel">Structural Steel</option>
                  <option value="Cement & Concrete">Cement & Concrete</option>
                  <option value="Heavy Equipment & Precast">Heavy Equipment & Precast</option>
                  <option value="Electrical & Mechanical">Electrical & Mechanical</option>
                  <option value="Materials Supply">Materials Supply</option>
                </select>
              </div>

              {/* Sorting Filter */}
              <div className="space-y-1 text-left">
                <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Sort Order</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 font-mono outline-none"
                >
                  <option value="id">Requisition ID</option>
                  <option value="cost_asc">Cost (Low → High)</option>
                  <option value="cost_desc">Cost (High → Low)</option>
                  <option value="date">Required Date</option>
                  <option value="title">Material Title</option>
                  <option value="status">Process Status</option>
                </select>
              </div>

            </div>

          </div>

          {/* Core Requisitions Views Implementation */}
          {filteredRequests.length > 0 ? (
            <div>
              
              {/* 1. Layout Mode: Grid View (Compact Cards) */}
              {layoutMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                  {filteredRequests.map((req) => (
                    <div
                      key={req.id}
                      onClick={() => {
                        setSelectedRequest(req);
                        onLogTriggered('PROCUREMENT_REQUEST_VIEWED', 'procurement_requests', req.id, 'SUCCESS', `Requisitions Grid: Consulted detail records for PR ${req.id}.`);
                      }}
                      className="bg-slate-900/20 border border-slate-900 hover:border-slate-800 rounded-xl p-3.5 space-y-3 cursor-pointer hover:bg-slate-900/30 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono text-slate-500 font-bold">{req.id}</span>
                          <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-extrabold ${priorityColors[req.priority]}`}>{req.priority}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">{req.title}</h4>
                        <div className="text-[10px] text-slate-400 font-mono">{req.projectName}</div>
                      </div>

                      <div className="pt-2 border-t border-slate-900/60 flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 font-mono">{formatCurrency(req.estimatedCost)}</span>
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${statusColors[req.status]}`}>{req.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 2. Layout Mode: Card View (Medium Interactive Cards) */}
              {layoutMode === 'card' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                  {filteredRequests.map((req) => (
                    <div
                      key={req.id}
                      onClick={() => {
                        setSelectedRequest(req);
                        onLogTriggered('PROCUREMENT_REQUEST_VIEWED', 'procurement_requests', req.id, 'SUCCESS', `Requisitions Cards: Consulted detail records for PR ${req.id}.`);
                      }}
                      className="bg-slate-900/20 border border-slate-900 hover:border-slate-850 rounded-xl p-4.5 space-y-3.5 cursor-pointer hover:bg-slate-900/35 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-500 font-semibold">{req.id} • {req.category}</span>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${priorityColors[req.priority]}`}>{req.priority}</span>
                            <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${statusColors[req.status]}`}>{req.status}</span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">{req.title}</h4>
                          <p className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-500" /> {req.projectName}</p>
                        </div>

                        <p className="text-[10.5px] text-slate-400 line-clamp-2">{req.specifications}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-900/60 flex items-center justify-between">
                        <div>
                          <span className="text-[8px] text-slate-500 block">Budget Estimate</span>
                          <span className="text-xs font-bold text-emerald-400 font-mono">{formatCurrency(req.estimatedCost)}</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-500 block text-right">Required Date</span>
                          <span className="text-[10px] font-mono text-slate-300 font-bold block text-right">{req.requiredDate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 3. Layout Mode: List View (Table Grid Rows) */}
              {layoutMode === 'list' && (
                <div className="bg-slate-900/10 border border-slate-900 rounded-xl overflow-hidden overflow-x-auto text-left">
                  <table className="w-full min-w-[700px] border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-900 text-slate-500 font-mono text-[9px] uppercase tracking-wider">
                        <th className="p-3">ID</th>
                        <th className="p-3">Material Title</th>
                        <th className="p-3">Project</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Quantity</th>
                        <th className="p-3">Budget</th>
                        <th className="p-3">Required Date</th>
                        <th className="p-3">Priority</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/50">
                      {filteredRequests.map((req) => (
                        <tr
                          key={req.id}
                          onClick={() => {
                            setSelectedRequest(req);
                            onLogTriggered('PROCUREMENT_REQUEST_VIEWED', 'procurement_requests', req.id, 'SUCCESS', `Requisitions List: Consulted detail records for PR ${req.id}.`);
                          }}
                          className="hover:bg-slate-900/30 cursor-pointer transition-all"
                        >
                          <td className="p-3 font-mono text-[10px] text-slate-400 font-bold">{req.id}</td>
                          <td className="p-3 font-bold text-white truncate max-w-[150px]">{req.title}</td>
                          <td className="p-3 text-slate-300 font-mono">{req.projectName}</td>
                          <td className="p-3 text-slate-400">{req.category}</td>
                          <td className="p-3 text-slate-300 font-mono">{req.quantity}</td>
                          <td className="p-3 font-bold text-emerald-400 font-mono">{formatCurrency(req.estimatedCost)}</td>
                          <td className="p-3 font-mono text-slate-400">{req.requiredDate}</td>
                          <td className="p-3">
                            <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${priorityColors[req.priority]}`}>{req.priority}</span>
                          </td>
                          <td className="p-3">
                            <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${statusColors[req.status]}`}>{req.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-slate-900/10 border border-slate-900 rounded-xl p-12 text-center text-slate-500 space-y-3">
              <AlertTriangle className="w-8 h-8 text-amber-500/80 mx-auto" />
              <p className="text-xs font-semibold text-slate-300">No active material requisitions matched your filters.</p>
              <p className="text-[10px] text-slate-600 max-w-sm mx-auto">Try resetting filters or searching for standard material words like "Steel" or "Concrete".</p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedProject('All');
                  setSelectedStatus('All');
                  setSelectedPriority('All');
                  setSelectedCategory('All');
                  setSortBy('id');
                  showToast('Requisition directory filter reset.', 'info');
                }}
                className="mt-3 text-[10px] bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 px-4 py-1.5 rounded-lg transition-all"
              >
                Reset Filters
              </button>
            </div>
          )}

        </div>
      )}

      {/* VIEW 3: SUPPLIERS PERFORMANCE DIRECTORY */}
      {activeTab === 'suppliers' && (
        <div className="space-y-6 animate-in fade-in duration-250">
          
          {/* Supplier Directory control bar */}
          <div className="bg-slate-900/20 border border-slate-900 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:max-w-md flex items-center bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5 text-slate-300">
              <Search className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search suppliers by name, category, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-500"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-slate-300">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setIsAddSupplierModalOpen(true);
                onLogTriggered('PROCUREMENT_SUPPLIER_FORM_OPENED', 'procurement', 'action', 'SUCCESS', 'Suppliers Directory: Opened whitelist add form.');
              }}
              className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/15 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Preferred Supplier</span>
            </button>
          </div>

          {/* Suppliers Cards Grid */}
          {filteredSuppliers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
              {filteredSuppliers.map((sup) => (
                <div
                  key={sup.id}
                  onClick={() => {
                    setSelectedSupplier(sup);
                    onLogTriggered('PROCUREMENT_SUPPLIER_VIEWED', 'procurement_suppliers', sup.id, 'SUCCESS', `Suppliers Performance: Opened statistics sheet for ${sup.name}.`);
                  }}
                  className="bg-slate-900/20 border border-slate-900 hover:border-slate-850 rounded-xl p-5 space-y-4 cursor-pointer hover:bg-slate-900/35 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">{sup.id} • {sup.location}</span>
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5 leading-snug">
                          {sup.name}
                          {sup.verified && (
                            <span className="text-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">Verified</span>
                          )}
                        </h4>
                      </div>
                      <div className="flex items-center gap-0.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/15 px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono">
                        <Star className="w-3 h-3 fill-yellow-500" />
                        <span>{sup.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 font-sans font-medium">{sup.category}</p>

                    {/* Sourcing performance metrics */}
                    <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-lg border border-slate-900/60 text-[11px] font-mono">
                      <div>
                        <div className="text-[8px] text-slate-500 font-sans uppercase">On-Time Transit</div>
                        <div className="text-slate-200 font-bold mt-0.5 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>{sup.deliveryPerformance}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[8px] text-slate-500 font-sans uppercase">Quality Grade</div>
                        <div className="text-slate-200 font-bold mt-0.5 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          <span>{sup.qualityPerformance}%</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Sourcing statistics */}
                  <div className="pt-3 border-t border-slate-900/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Performance: <strong className="text-emerald-400">{sup.overallScore}%</strong></span>
                    <span>{sup.activeOrdersCount} active / {sup.recentDeliveries} delivered</span>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/10 border border-slate-900 rounded-xl p-12 text-center text-slate-500 space-y-3">
              <Building className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
              <p className="text-xs font-semibold text-slate-300">No whitelisted procurement suppliers matched your search query.</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-3 text-[10px] bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 px-4 py-1.5 rounded-lg transition-all"
              >
                Clear Sourcing Search
              </button>
            </div>
          )}

        </div>
      )}

      {/* REQUISITION DETAILS SLIDE-OVER SHEET */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-200">
          
          {/* Slide Backdrop close hook */}
          <div className="flex-1" onClick={() => setSelectedRequest(null)} />
          
          <div className="w-full max-w-xl bg-slate-950 border-l border-slate-900 p-6 overflow-y-auto h-full flex flex-col justify-between space-y-6 text-left shadow-2xl animate-in slide-in-from-right duration-250">
            
            {/* Sheet Header */}
            <div className="space-y-3 border-b border-slate-900 pb-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-500">Requisition Specification Sheet</span>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer border border-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-mono font-extrabold text-slate-400">{selectedRequest.id}</span>
                  <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${statusColors[selectedRequest.status]}`}>{selectedRequest.status}</span>
                  <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${priorityColors[selectedRequest.priority]}`}>{selectedRequest.priority}</span>
                </div>
                <h3 className="text-base font-extrabold text-white leading-snug">{selectedRequest.title}</h3>
              </div>
            </div>

            {/* Core details body */}
            <div className="flex-1 space-y-6">
              
              {/* Context Summary Cards */}
              <div className="grid grid-cols-2 gap-3.5 bg-slate-900/20 border border-slate-900 p-4 rounded-xl text-xs font-mono">
                <div>
                  <span className="text-[8px] text-slate-500 font-sans uppercase">Linked Project Portfolio</span>
                  <div className="text-slate-200 font-bold mt-1 font-sans">{selectedRequest.projectName}</div>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 font-sans uppercase">Required Delivery Date</span>
                  <div className="text-slate-200 font-bold mt-1">{selectedRequest.requiredDate}</div>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 font-sans uppercase">Volume Quantity Required</span>
                  <div className="text-slate-200 font-bold mt-1">{selectedRequest.quantity}</div>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 font-sans uppercase">Budgetary Valuation</span>
                  <div className="text-emerald-400 font-bold mt-1 font-bold">{formatCurrency(selectedRequest.estimatedCost)}</div>
                </div>
              </div>

              {/* Material specifications text area */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-white uppercase tracking-tight flex items-center gap-1"><FileSpreadsheet className="w-4 h-4 text-slate-400" /> Material Specifications</h4>
                <div className="bg-slate-900/40 border border-slate-900 p-3.5 rounded-xl text-xs text-slate-300 leading-relaxed font-mono">
                  {selectedRequest.specifications}
                </div>
              </div>

              {/* Comments / Sourcing memo */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-white uppercase tracking-tight flex items-center gap-1"><MessageSquare className="w-4 h-4 text-slate-400" /> Sourcing Comments & Memos</h4>
                <p className="text-xs text-slate-400 leading-relaxed pl-1">{selectedRequest.comments}</p>
              </div>

              {/* Vendor Sourcing Link Details */}
              <div className="space-y-2 border-t border-slate-900 pt-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-tight flex items-center gap-1"><HardHat className="w-4 h-4 text-slate-400" /> Associated Vendor Sourcing</h4>
                {selectedRequest.assignedSupplierId ? (
                  <div className="bg-slate-950 border border-slate-900 p-3.5 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[8px] text-slate-500 font-sans uppercase font-bold">Assigned Preferred Supplier</div>
                      <div className="text-white font-bold mt-0.5">{selectedRequest.assignedSupplierName}</div>
                    </div>
                    <button
                      onClick={() => {
                        const sup = suppliers.find(s => s.id === selectedRequest.assignedSupplierId);
                        if (sup) {
                          setSelectedSupplier(sup);
                          setSelectedRequest(null);
                          setActiveTab('suppliers');
                        }
                      }}
                      className="text-[10px] font-mono font-bold text-emerald-400 hover:underline flex items-center gap-0.5 uppercase cursor-pointer"
                    >
                      View Partner <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl text-center space-y-3.5">
                    <p className="text-[11px] text-slate-400">No supplier has been assigned to this requisition yet.</p>
                    
                    {selectedRequest.status === 'Approved' ? (
                      <div className="space-y-3">
                        <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Direct Sourcing Actions</div>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {suppliers.filter(s => s.category.includes(selectedRequest.category) || s.preferred).map((sup) => (
                            <button
                              key={sup.id}
                              onClick={() => handleAssignSupplier(selectedRequest.id, sup.id)}
                              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10.5px] font-bold text-slate-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                            >
                              Assign {sup.name}
                            </button>
                          ))}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">OR</div>
                        <button
                          onClick={() => handlePromoteToRfq(selectedRequest)}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Promote Request to RFQ / Tender Listing</span>
                        </button>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500 font-mono">Requisition budget must be "Approved" first to unlock sourcing channels.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Immutable Sourcing Chronological Timeline */}
              <div className="space-y-3.5 border-t border-slate-900 pt-4 text-left">
                <h4 className="text-xs font-bold text-white uppercase tracking-tight flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> Procurement Timeline & Governance Logs</h4>
                <div className="relative border-l border-slate-900 ml-2.5 pl-4 space-y-4 pt-1">
                  {selectedRequest.timeline.map((event, i) => (
                    <div key={event.id} className="relative text-xs">
                      <div className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                      </div>
                      <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                        <span>{event.date} • {event.user}</span>
                        <span className="font-bold text-[9px] uppercase tracking-wider text-emerald-400">{event.status}</span>
                      </div>
                      <p className="text-slate-300 mt-1 leading-relaxed font-mono">{event.text}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Direct Audit Lifecycle actions */}
            <div className="pt-5 border-t border-slate-900 flex flex-wrap gap-2">
              {selectedRequest.status === 'Draft' && (
                <button
                  onClick={() => handleSendToApproval(selectedRequest.id)}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Submit for Approval
                </button>
              )}

              {selectedRequest.status === 'Pending Approval' && (
                <>
                  <button
                    onClick={() => handleApproveRequest(selectedRequest.id)}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Approve Budget
                  </button>
                  <button
                    onClick={() => {
                      const reason = window.prompt("Specify rejection reason details:");
                      if (reason !== null) handleRejectRequest(selectedRequest.id, reason || undefined);
                    }}
                    className="flex-1 bg-slate-900 hover:bg-red-950/20 text-red-400 border border-slate-800 hover:border-red-900/30 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Reject Requisition
                  </button>
                </>
              )}

              {selectedRequest.status === 'Ordered' && (
                <button
                  onClick={() => handleUpdateTransitStatus(selectedRequest.id)}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Truck className="w-4 h-4" />
                  <span>Mark Material Dispatched</span>
                </button>
              )}

              {selectedRequest.status === 'In Transit' && (
                <button
                  onClick={() => handleMarkRequestComplete(selectedRequest.id)}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>Receive Materials Onsite</span>
                </button>
              )}

              <button
                onClick={() => handleDeleteRequest(selectedRequest.id)}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-red-950/20 text-slate-500 hover:text-red-400 border border-slate-800 hover:border-red-900/30 transition-all cursor-pointer"
                title="Delete Request"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SUPPLIER DETAILS PERFORMANCE SHEET */}
      {selectedSupplier && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-200">
          
          <div className="flex-1" onClick={() => setSelectedSupplier(null)} />
          
          <div className="w-full max-w-xl bg-slate-950 border-l border-slate-900 p-6 overflow-y-auto h-full flex flex-col justify-between space-y-6 text-left shadow-2xl animate-in slide-in-from-right duration-250">
            
            {/* Header */}
            <div className="space-y-3 border-b border-slate-900 pb-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-500">Supplier Performance Portfolio</span>
                <button
                  onClick={() => setSelectedSupplier(null)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer border border-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400">{selectedSupplier.id} • {selectedSupplier.location}</span>
                  {selectedSupplier.verified && (
                    <span className="text-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono font-bold">Verified</span>
                  )}
                  {selectedSupplier.preferred && (
                    <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono font-bold">Preferred</span>
                  )}
                </div>
                <h3 className="text-base font-extrabold text-white leading-snug">{selectedSupplier.name}</h3>
              </div>
            </div>

            {/* Performance analysis & data sheets */}
            <div className="flex-1 space-y-6">
              
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-tight">Audit KPI Metric Cards</h4>
                <div className="grid grid-cols-3 gap-3 text-center font-mono text-xs">
                  <div className="bg-slate-900/30 border border-slate-900 p-3 rounded-xl">
                    <span className="text-[8px] text-slate-500 font-sans block uppercase">Delivery Time</span>
                    <span className="text-emerald-400 font-bold mt-1.5 block text-sm">{selectedSupplier.deliveryPerformance}%</span>
                    <span className="text-[7.5px] text-slate-500 font-sans block mt-0.5">On-Time rate</span>
                  </div>
                  <div className="bg-slate-900/30 border border-slate-900 p-3 rounded-xl">
                    <span className="text-[8px] text-slate-500 font-sans block uppercase">Quality Rating</span>
                    <span className="text-blue-400 font-bold mt-1.5 block text-sm">{selectedSupplier.qualityPerformance}%</span>
                    <span className="text-[7.5px] text-slate-500 font-sans block mt-0.5">Defect-free rate</span>
                  </div>
                  <div className="bg-slate-900/30 border border-slate-900 p-3 rounded-xl">
                    <span className="text-[8px] text-slate-500 font-sans block uppercase">Total Handover</span>
                    <span className="text-white font-bold mt-1.5 block text-sm">{selectedSupplier.recentDeliveries}</span>
                    <span className="text-[7.5px] text-slate-500 font-sans block mt-0.5">Successful orders</span>
                  </div>
                </div>
              </div>

              {/* Sourcing Performance Breakdown Charts */}
              <div className="bg-slate-900/10 border border-slate-900 p-4 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-tight flex items-center gap-1"><BarChart3 className="w-4 h-4 text-emerald-400" /> Sourcing Performance Index</h4>
                
                <div className="space-y-3 font-mono text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Logistics Alignment Score</span>
                      <span className="text-white font-bold">{selectedSupplier.deliveryPerformance}/100</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900/50">
                      <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${selectedSupplier.deliveryPerformance}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Material ISO Compliance</span>
                      <span className="text-white font-bold">{selectedSupplier.qualityPerformance}/100</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900/50">
                      <div className="bg-blue-400 h-full rounded-full" style={{ width: `${selectedSupplier.qualityPerformance}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">B2B Financial Trust Settlement</span>
                      <span className="text-white font-bold">100/100</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900/50">
                      <div className="bg-indigo-400 h-full rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-tight flex items-center gap-1"><Users className="w-4 h-4 text-slate-400" /> Sourcing Liaison Contacts</h4>
                <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-3.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-slate-500" />
                    <div>
                      <div className="text-[8px] text-slate-500 font-sans uppercase">Contact Officer</div>
                      <div className="text-slate-200 font-bold">{selectedSupplier.contactPerson}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <div>
                      <div className="text-[8px] text-slate-500 font-sans uppercase">Corporate Email</div>
                      <div className="text-slate-200 font-bold font-mono">{selectedSupplier.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <div>
                      <div className="text-[8px] text-slate-500 font-sans uppercase">Direct Phone Hotline</div>
                      <div className="text-slate-200 font-bold font-mono">{selectedSupplier.phone}</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="pt-5 border-t border-slate-900 flex gap-3">
              <button
                onClick={() => {
                  setActiveViewMode('messaging');
                  setSelectedSupplier(null);
                  onLogTriggered('PROCUREMENT_SUPPLIER_CHAT_INITIATED', 'procurement_suppliers', selectedSupplier.id, 'SUCCESS', `Suppliers Performance: Opened B2B messaging bridge to ${selectedSupplier.name}.`);
                  showToast(`Opening secure channel to ${selectedSupplier.name}...`, 'info');
                }}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4 stroke-[2]" />
                <span>Message Sourcing Liaison</span>
              </button>
              
              <button
                onClick={() => setSelectedSupplier(null)}
                className="px-5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer border border-slate-850"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 1: MATERIAL PURCHASE REQUISITION CREATION FORM (CRUD - CREATE) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-950 border-b border-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">Draft Material Purchase Requisition</h3>
              </div>
              <button 
                onClick={() => {
                  setIsCreateModalOpen(false);
                  resetForm();
                }}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white transition-all cursor-pointer border border-slate-850"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleCreateRequest} className="p-5 space-y-4 text-left">
              
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Material Title / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fe550D TMT Reinforcement Steel Batch A"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Linked Project *</label>
                  <select
                    value={formProjectId}
                    onChange={(e) => setFormProjectId(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="proj-1">Amara Sky Towers (proj-1)</option>
                    <option value="proj-2">Giga Logistics Park (proj-2)</option>
                    <option value="proj-3">Phoenix Hub Mall (proj-3)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Material Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="Structural Steel">Structural Steel</option>
                    <option value="Cement & Concrete">Cement & Concrete</option>
                    <option value="Heavy Equipment & Precast">Heavy Equipment & Precast</option>
                    <option value="Electrical & Mechanical">Electrical & Mechanical</option>
                    <option value="Materials Supply">Materials Supply</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-1">
                  <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Quantity / Volume *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 120 Metric Tons"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="space-y-1 col-span-1">
                  <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Estimated Budget (INR) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 6500000"
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-emerald-500 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1 col-span-1">
                  <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Required Date *</label>
                  <input
                    type="date"
                    required
                    value={formRequiredDate}
                    onChange={(e) => setFormRequiredDate(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 col-span-2">
                  <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Sourcing Priority *</label>
                  <div className="flex gap-2">
                    {['Low', 'Normal', 'High', 'Urgent'].map((priority) => (
                      <button
                        key={priority}
                        type="button"
                        onClick={() => setFormPriority(priority as any)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                          formPriority === priority
                            ? 'bg-emerald-500 text-slate-950 font-bold border-transparent'
                            : 'bg-slate-900/40 text-slate-400 border-slate-850 hover:text-slate-200'
                        }`}
                      >
                        {priority}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Material Specifications</label>
                <textarea
                  placeholder="Include grades, sizing criteria, certification constraints..."
                  value={formSpecifications}
                  onChange={(e) => setFormSpecifications(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 h-20 outline-none focus:border-emerald-500 transition-all font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Sourcing Comments</label>
                <input
                  type="text"
                  placeholder="e.g. Backed by central financial project credit allocation."
                  value={formComments}
                  onChange={(e) => setFormComments(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Confirm Requisition
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                  }}
                  className="px-5 bg-slate-900 hover:bg-slate-850 text-slate-300 font-bold text-xs py-2.5 rounded-xl border border-slate-850 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PREFERRED SUPPLIER ADDITION FORM */}
      {isAddSupplierModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-950 border-b border-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">Whitelist Preferred Supplier</h3>
              </div>
              <button 
                onClick={() => setIsAddSupplierModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white transition-all cursor-pointer border border-slate-850"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleAddSupplier} className="p-5 space-y-4 text-left">
              
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Supplier / Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Cement Distributors"
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Supply Category *</label>
                  <select
                    value={supCategory}
                    onChange={(e) => setSupCategory(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="Structural Steel & Rebars">Structural Steel & Rebars</option>
                    <option value="Cement & Concrete">Cement & Concrete</option>
                    <option value="Electrical & HVAC Controls">Electrical & HVAC Controls</option>
                    <option value="Precast Prefabrication">Precast Prefabrication</option>
                    <option value="Dry Mortar & Transport">Dry Mortar & Transport</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Operational Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai, MH"
                    value={supLocation}
                    onChange={(e) => setSupLocation(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Liaison Contact Person *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sanjay Mudaliar"
                  value={supContact}
                  onChange={(e) => setSupContact(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Liaison Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. s.mudaliar@buildcorp.co.in"
                    value={supEmail}
                    onChange={(e) => setSupEmail(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-emerald-500 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Hotline Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98000 44000"
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-emerald-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Whitelist Partner
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddSupplierModalOpen(false)}
                  className="px-5 bg-slate-900 hover:bg-slate-850 text-slate-300 font-bold text-xs py-2.5 rounded-xl border border-slate-850 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
