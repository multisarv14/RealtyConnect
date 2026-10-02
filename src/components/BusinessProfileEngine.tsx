import { appStore } from '../lib/appStore';
import React, { useEffect, useRef, useState } from 'react';
import { 
  Building2, CheckCircle2, MapPin, Calendar, DollarSign, Briefcase, Award, Users, Star, 
  MessageSquare, Share2, Send, Clock, Phone, Mail, FileText, Plus, Trash2, Edit3, Save, X, 
  Shield, Activity, ChevronRight, Image as ImageIcon, Video, Download, Maximize2, Settings, 
  Lock, Globe, Bookmark, ThumbsUp, Check, Eye, EyeOff, Bell, ExternalLink, AlertTriangle, 
  Heart, UserCheck, Map, Grid, Info, ShieldAlert, BadgeHelp, UploadCloud, Eye as ViewIcon, Sparkles,
  PhoneCall, Heart as HeartIcon, CheckCircle, Tag, ShieldCheck, ChevronLeft, ClipboardList
} from 'lucide-react';
import { 
  BusinessProfile, TeamMember, ProjectItem, ReviewItem, GalleryItem, getSeededProfile 
} from './ProfileMockData';
import { emptyCompanyProfile, fetchCompanyProfile, isRegisteredCompanyId, postCompanyReview, saveMyCompanyProfile, type CompanyProfile } from '../lib/companies';
import { errorMessage } from '../lib/api';
import { currentUserEmail, currentUserName } from '../lib/identity';
import CompanyProfileForm from './CompanyProfileForm';

interface BusinessProfileEngineProps {
  businessId: string;
  businessName: string;
  businessCategory: string;
  businessLocation: string;
  onClose: () => void;
  onLogTriggered: (
    action: string, 
    entity: string, 
    entityId: string, 
    status: 'SUCCESS' | 'FAILURE' | 'WARNING', 
    details: string
  ) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  userRole?: string;
  // Organization of the signed-in user; a company's own profile is editable only by it.
  currentOrgId?: string | null;
  // Called after the owner's changes were saved on the server.
  onProfileSaved?: () => void;
  connections?: any[];
  following?: string[];
  onToggleFollow?: (id: string, name: string) => void;
  onSendConnection?: (id: string, name: string, cat: string, loc: string, logo: string, purpose: string) => void;
  onWithdrawConnection?: (id: string) => void;
  onSendEnquiry?: (id: string, name: string, sub: string, cat: string, msg: string, email: string, phone: string) => void;
  onScheduleMeeting?: (id: string, name: string, title: string, date: string, time: string, type: string) => void;
  onSendPartnership?: (id: string, name: string, type: 'partnership' | 'dealer' | 'distributor', terms: string, val: string, scope: string) => void;
}

// Compact helper to dynamically extract category-specific premium B2B content
const getPremiumB2BData = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('developer') || cat.includes('builder')) {
    return {
      products: [
        { name: "Premium Commercial Tower Shell", specs: "LEED Platinum, Grade-A post-tensioned RCC superstructure, high solar-reflectance glaze.", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=400", tags: ["Commercial", "Grade A+"], priceRange: "₹140 Cr - ₹350 Cr", related: "Green Concrete Mix, Structural Steel Fe550D" },
        { name: "Elite Sky-Villa Penthouse Complex", specs: "12,500 sqft floor plates, multi-zone automation, zero-carbon offgrid thermal battery systems.", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400", tags: ["Residential", "Luxe Private"], priceRange: "₹24 Cr - ₹45 Cr", related: "Smart Facade Systems, Architectural Glass" },
        { name: "Heavy-Duty Integrated Warehouses", specs: "FM2 laser-screed flooring, 12m clear height column spacing, automatic thermal smoke vents.", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400", tags: ["Industrial", "Logistics"], priceRange: "₹65 Cr - ₹90 Cr", related: "Precast Concrete slabs, Gantry Girders" }
      ],
      caseStudies: [
        { title: "Passive Thermal Highrise Integration", client: "Vantage Global Holdings", challenge: "Reduce structural heat gains by 28% in tropical urban zoning.", solution: "Implemented dual-skin insulated facade layouts paired with low-emissivity glass assemblies and solar roof collection units." }
      ],
      certifications: [
        { name: "RERA Regulatory Approved License", id: "PRM/KA/RERA/1251/310/PR/201211", type: "RERA License", authority: "State RERA Authority", status: "VERIFIED ACTIVE" },
        { name: "ISO 9001:2015 (QMS Verification)", id: "ISO-QMS-889201A", type: "ISO Standard", authority: "TUV SUD Germany", status: "AUDITED COMPLIANT" },
        { name: "MSME National UDYAM Certificate", id: "UDYAM-MH-12-0092122", type: "MSME Registration", authority: "Ministry of MSME", status: "REGISTERED" }
      ],
      highlights: [
        "15 Million sqft of A-class floor plates delivered.",
        "100% compliant with RBI escrow capital protection standards.",
        "Winner of the 2025 National Green Energy Infrastructure Award."
      ],
      opportunities: [
        { title: "Bulk Steel Sourcing & Delivery Tender", type: "Opportunity", budget: "₹8.5 Crores", date: "Closing in 12 days" },
        { title: "RFQ for Structural Facade Engineering", type: "RFQ", budget: "₹14 Crores", date: "Closing in 20 days" }
      ],
      similar: [
        { name: "Aura Spatial Design Studio", category: "Architects", location: "Pune, MH" },
        { name: "BuildCorp Construction", category: "Contractors", location: "Bangalore, KA" }
      ]
    };
  } else if (cat.includes('contractor') || cat.includes('engineering')) {
    return {
      products: [
        { name: "Deep Foundation Piling & Shoring", specs: "High-torque continuous flight auger rigs, diaphragm slurry walls, custom retaining arrays.", image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=400", tags: ["Foundations", "Civil"], priceRange: "₹2.5 Cr - ₹15 Cr", related: "Heavy Piling Equipment, Slurry Pumps" },
        { name: "RCC Superstructure Structural Framing", specs: "Rapid cycle climbing formwork, post-tensioned steel tendons, ultra-early strength curing cycles.", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=400", tags: ["RCC", "Structural"], priceRange: "₹10 Cr - ₹85 Cr", related: "Ready-Mix Concrete M50, Formwork Panels" },
        { name: "Heavy Steel Truss Girders Fabrication", specs: "AISI structural steel plates, sub-arc automatic welding, verified ultrasonic weld tests.", image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=400", tags: ["Fabrication", "Industrial"], priceRange: "₹5 Cr - ₹40 Cr", related: "TMT Steel Bars, Welding Consumables" }
      ],
      caseStudies: [
        { title: "Skyscraper Deep Basement Shoring", client: "Apex Skynet Highrises", challenge: "Safeguard adjacent subway tunnel from structural shifting during 22-meter basement excavation.", solution: "Engineered high-stiffness contiguous bored pile walls pre-loaded with hydraulic struts monitored by real-time laser telemetry." }
      ],
      certifications: [
        { name: "ISO 45001:2018 (Occupational Health & Safety)", id: "OHSMS-BV-9812", type: "ISO Standard", authority: "Bureau Veritas", status: "AUDITED ACTIVE" },
        { name: "A-Class Registered PWD Government License", id: "PWD-A-CIVIL-7711", type: "State License", authority: "Public Works Department", status: "VERIFIED ACTIVE" },
        { name: "ISO 14001:2015 (Environmental Management)", id: "EMS-BV-22019", type: "ISO Standard", authority: "Bureau Veritas", status: "AUDITED COMPLIANT" }
      ],
      highlights: [
        "Zero Lost-Time Injuries (LTI) over 12 Million consecutive man-hours.",
        "In-house mechanized fleet worth ₹85+ Cr including tower cranes and excavators.",
        "Empanelled first-class structural builder with national banking syndicates."
      ],
      opportunities: [
        { title: "Subcontract RFQ for 3B+45 Floor RCC Frame", type: "RFQ", budget: "₹42 Crores", date: "Closing in 8 days" },
        { title: "Piling & Earthworks Tender Request", type: "Opportunity", budget: "₹6.8 Crores", date: "Closing in 14 days" }
      ],
      similar: [
        { name: "Elite Materials Group", category: "Vendors", location: "Delhi NCR" },
        { name: "Global Tech Equipment Ltd", category: "Equipment", location: "Pune, MH" }
      ]
    };
  } else if (cat.includes('vendor') || cat.includes('material')) {
    return {
      products: [
        { name: "High-Ductility Reinforcement TMT Steel Fe550D", specs: "High energy absorption seismic bars, sizes 8mm to 40mm, corrosion resistant.", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400", tags: ["Steel", "Rebars"], priceRange: "₹58,000 / MT", related: "Structural Beams, Binding Wire" },
        { name: "Ready-Mix High-Strength M50 Concrete", specs: "Fly-ash slag optimized, ultra-low shrinkage rate, 4.5-hour workable slump window.", image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=400", tags: ["Concrete", "Ready-Mix"], priceRange: "₹6,800 / Cubic M", related: "Aggregate Base, Concrete Pumps" },
        { name: "Thermally Insulated AAC Lightweight Blocks", specs: "Autoclaved lightweight concrete block arrays, Class-A fire insulation, noise reduction rated.", image: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=400", tags: ["Blocks", "Masonry"], priceRange: "₹3,400 / Cubic M", related: "Tile Adhesives, Plaster Mortar" }
      ],
      caseStudies: [
        { title: "Flyover Bulk Concrete Dispatch Optimization", client: "Infrastructure Consortium Ltd", challenge: "Maintain zero-slump loss over a 32km highway delivery transit in 42°C heat.", solution: "Formulated a specialized dual-action chemical retarder blend retaining optimal flowability for up to 5 hours with zero water re-addition." }
      ],
      certifications: [
        { name: "Bureau of Indian Standards Quality Mark (BIS)", id: "BIS-CML-982101", type: "National Standard", authority: "BIS Govt Registry", status: "VERIFIED ACTIVE" },
        { name: "ISO 9001:2015 Quality Management", id: "ISO-QMS-889201A", type: "ISO Standard", authority: "TUV SUD Germany", status: "AUDITED ACTIVE" },
        { name: "MSME Registered National UDYAM Card", id: "UDYAM-MH-12-0092122", type: "MSME Registration", authority: "Ministry of MSME", status: "REGISTERED" }
      ],
      highlights: [
        "Dual computerized automated batching plants producing 120 m³/hr.",
        "Dedicated fleet of 45 thermal-isolated transit mixers with real-time GPS routing.",
        "100% compliant with BIS structural product testing guidelines."
      ],
      opportunities: [
        { title: "Supply Contract of 12,500 Tons TMT Rebar", type: "Opportunity", budget: "₹7.2 Crores", date: "Closing in 15 days" },
        { title: "RFQ for Lightweight AAC Blocks procurement", type: "RFQ", budget: "₹85 Lakhs", date: "Closing in 5 days" }
      ],
      similar: [
        { name: "BuildCorp Construction", category: "Contractors", location: "Bangalore, KA" },
        { name: "Elite Materials Group", category: "Vendors", location: "Delhi NCR" }
      ]
    };
  } else {
    // Default / Architects / Consultants / Bankers
    return {
      products: [
        { name: "BIM Integrated Spatial Layout Architecture", specs: "Complete Autodesk Revit LOD 400 design coordination, passive solar orientation, LEED compliance.", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=400", tags: ["BIM", "Design"], priceRange: "₹250 - ₹650 / Sqft", related: "Interior Spatial Render, Structural Analysis" },
        { name: "Finite Element Method Structural Analysis", specs: "Ansys structural verification, seismic wind tunnel simulation models, slab load redesign.", image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?q=80&w=400", tags: ["Analysis", "Engineering"], priceRange: "₹80,000 / Design", related: "Geotechnical Review, Structural Reinforcements" },
        { name: "Escrow Advisory & RERA Liaison Audit", specs: "Corporate escrow account setups, quarterly RERA project compliance logs compilation.", image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=400", tags: ["Liaison", "RERA"], priceRange: "₹5 Lakhs / Project", related: "Title Deed Audit, Legal Diligence" }
      ],
      caseStudies: [
        { title: "Thermal Envelope Aeration Optimization", client: "Noida Spatial Tech Hub", challenge: "Reduce structural active HVAC cooling energy requirements.", solution: "Engineered passive wind scoop corridors paired with vertical green breathing walls reducing thermal loads by 24%." }
      ],
      certifications: [
        { name: "National Council of Architecture License", id: "COA-REG-2009-45210", type: "Council License", authority: "CoA India", status: "VERIFIED ACTIVE" },
        { name: "State Approved Town Planner Accreditation", id: "STP-CIVIL-9981A", type: "Municipal Accreditation", authority: "Urban Dev Dept", status: "VERIFIED ACTIVE" },
        { name: "ISO 9001:2015 Certified Blueprints", id: "ISO-BLUE-22019", type: "ISO Standard", authority: "TUV SUD India", status: "AUDITED ACTIVE" }
      ],
      highlights: [
        "15 Million square feet of premium blueprinting approved dynamically.",
        "Winner of the National Eco-Infrastructure Planning Award 2024.",
        "Fully equipped with digital AR/VR spatial simulation facilities."
      ],
      opportunities: [
        { title: "BIM Layout Subcontract for Metro Terminal", type: "RFQ", budget: "₹4.8 Crores", date: "Closing in 11 days" },
        { title: "Structural Integrity Audit Tender Invitation", type: "Opportunity", budget: "₹95 Lakhs", date: "Closing in 22 days" }
      ],
      similar: [
        { name: "Aura Spatial Design Studio", category: "Architects", location: "Pune, MH" },
        { name: "RealtyConnect Pro Consultants", category: "Consultants", location: "Hyderabad, TS" }
      ]
    };
  }
};

export default function BusinessProfileEngine({
  businessId,
  businessName,
  businessCategory,
  businessLocation,
  onClose,
  onLogTriggered,
  showToast,
  userRole,
  currentOrgId,
  onProfileSaved,
  connections,
  following,
  onToggleFollow,
  onSendConnection,
  onWithdrawConnection,
  onSendEnquiry,
  onScheduleMeeting,
  onSendPartnership
}: BusinessProfileEngineProps) {
  
  // Companies registered on the platform load their real profile from the server.
  // The bundled sample companies (demo mode) get a generated one.
  const isRegistered = isRegisteredCompanyId(businessId);
  const isOwner = isRegistered && !!currentOrgId && businessId === currentOrgId;

  const [profile, setProfile] = useState<BusinessProfile>(() => 
    isRegistered
      ? emptyCompanyProfile(businessId, businessName, businessCategory)
      : getSeededProfile(businessId, businessName, businessCategory, businessLocation)
  );
  const [isLoadingProfile, setIsLoadingProfile] = useState(isRegistered);
  // JSON of the profile as the server last confirmed it; anything different is an unsaved change.
  const savedProfileRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isRegistered) return;
    let cancelled = false;
    fetchCompanyProfile(businessId)
      .then(loaded => {
        if (cancelled) return;
        savedProfileRef.current = JSON.stringify(loaded);
        setProfile(loaded);
        setIsLoadingProfile(false);
      })
      .catch(err => {
        if (cancelled) return;
        showToast(errorMessage(err), 'error');
        onClose();
      });
    return () => {
      cancelled = true;
    };
  }, [businessId]);

  // Switcher presets for sandboxed test roles
  const STAKEHOLDER_PRESETS = [
    { role: 'Developer', cat: 'Developers', name: 'Apex Developers Ltd', loc: 'Mumbai, MH' },
    { role: 'Contractor', cat: 'Contractors', name: 'BuildCorp Construction', loc: 'Bangalore, KA' },
    { role: 'Vendor', cat: 'Vendors', name: 'Elite Materials Group', loc: 'Delhi NCR' },
    { role: 'Architect', cat: 'Architects', name: 'Aura Spatial Design Studio', loc: 'Pune, MH' },
    { role: 'Consultant', cat: 'Consultants', name: 'RealtyConnect Pro Consultants', loc: 'Hyderabad, TS' },
  ];

  const handleLoadPreset = (preset: typeof STAKEHOLDER_PRESETS[0]) => {
    const loaded = getSeededProfile(
      preset.name.toLowerCase().replace(/\s+/g, '-'),
      preset.name,
      preset.cat,
      preset.loc
    );
    setProfile(loaded);
    onLogTriggered(
      'STAKEHOLDER_PROFILE_PRESET_LOADED',
      'profiles',
      loaded.id,
      'SUCCESS',
      `Loaded demo role preset: "${preset.role}" representing ${preset.name}`
    );
    showToast(`Loaded ${preset.role} Profile Preset successfully!`, 'success');
  };

  const [isOwnerView, setIsOwnerView] = useState<boolean>(isOwner); // Visitors always get the public view
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Save the owner's changes shortly after they are made. Inline text edits wait for "Save Settings".
  useEffect(() => {
    if (!isOwner || isLoadingProfile || isEditing) return;
    const snapshot = JSON.stringify(profile);
    if (snapshot === savedProfileRef.current) return;
    const timer = setTimeout(() => {
      saveMyCompanyProfile(profile as CompanyProfile)
        .then(() => {
          savedProfileRef.current = snapshot;
          onProfileSaved?.();
        })
        .catch(err => showToast(`Profile not saved: ${errorMessage(err)}`, 'error'));
    }, 500);
    return () => clearTimeout(timer);
  }, [profile, isOwner, isLoadingProfile, isEditing]);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'portfolio' | 'team' | 'reviews' | 'related' | 'leads' | 'settings'>('overview');

  const [profileLeads, setProfileLeads] = useState<any[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_leads');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = appStore.getItem('realtyconnect_leads');
        if (saved) setProfileLeads(JSON.parse(saved));
      } catch (e) {}
    };
    window.addEventListener('storage', handleSync);
    const interval = setInterval(handleSync, 3000);
    return () => {
      window.removeEventListener('storage', handleSync);
      clearInterval(interval);
    };
  }, []);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Form states
  const [newReview, setNewReview] = useState({ author: '', company: '', rating: 5, comment: '' });
  const [newTeam, setNewTeam] = useState<Partial<TeamMember>>({ name: '', role: '', department: 'Engineering & Delivery', email: '', phone: '' });
  const [newProject, setNewProject] = useState<Partial<ProjectItem>>({ title: '', type: 'Commercial Tower', status: 'Completed', value: '', area: '', location: '', description: '', completionYear: '2026' });

  // Modals & triggers
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalDetails, setProposalDetails] = useState({ terms: '45-Day Corporate Credit Line with bank guarantee', estimatedValue: '₹75,00,000 / Annually', scope: 'Direct material supply and regional logistics representation.' });
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [meetingDate, setMeetingDate] = useState('2026-07-20');
  const [meetingTime, setMeetingTime] = useState('11:00 AM');
  const [meetingType, setMeetingType] = useState('Virtual Video Call');

  // Sync connections & following
  const [isConnected, setIsConnected] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (connections) {
      setIsConnected(connections.some(c => c.businessId === businessId && c.status === 'accepted'));
    }
  }, [connections, businessId]);

  useEffect(() => {
    if (following) {
      setIsFollowing(following.includes(businessId));
    }
  }, [following, businessId]);

  // CRM Integration local variables
  const [crmAccounts, setCrmAccounts] = useState<any[]>([]);
  const [associatedCrmAccount, setAssociatedCrmAccount] = useState<any | null>(null);
  const [profileMeetings, setProfileMeetings] = useState<any[]>([]);
  const [profileConversations, setProfileConversations] = useState<any[]>([]);
  const [profileRfqs, setProfileRfqs] = useState<any[]>([]);

  useEffect(() => {
    const loadCrmData = () => {
      try {
        // Load CRM Accounts
        const savedCrm = appStore.getItem('realtyconnect_crm_accounts');
        let accountsList = [];
        if (savedCrm) {
          accountsList = JSON.parse(savedCrm);
          setCrmAccounts(accountsList);
        } else {
          // Fallback init
          const initialCrm = [
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
              assignedManager: currentUserName(),
              customerSince: '2025-01-10',
              businessValue: 480,
              currentStage: 'Strategic Partner',
              contacts: [
                { id: 'c-1', name: 'Rajesh Aggarwal', email: 'procurement@apexdev.in', phone: '+91 98200 44021', role: 'Decision Maker' }
              ],
              timeline: [
                { id: 't-1', timestamp: '2026-07-15 16:10', type: 'Lead Created', title: 'Bulk Steel Procurement Lead Created', details: 'Enquiry for 1,200 MT premium high-ductility Fe550D TMT reinforcement bars.', status: 'SUCCESS' }
              ]
            }
          ];
          appStore.setItem('realtyconnect_crm_accounts', JSON.stringify(initialCrm));
          setCrmAccounts(initialCrm);
          accountsList = initialCrm;
        }

        // Match current profile to crm account
        const matched = accountsList.find((a: any) => 
          a.id === businessId || 
          a.name?.toLowerCase().trim() === businessName?.toLowerCase().trim()
        );
        setAssociatedCrmAccount(matched || null);

        // Load meetings
        const meetsStr = appStore.getItem('realtyconnect_meetings');
        if (meetsStr) {
          const allMeets = JSON.parse(meetsStr);
          const filteredMeets = allMeets.filter((m: any) => 
            m.companyId === businessId || 
            m.relatedCompany?.toLowerCase().trim() === businessName?.toLowerCase().trim()
          );
          setProfileMeetings(filteredMeets);
        }

        // Load conversations
        const convStr = appStore.getItem('realtyconnect_conversations');
        if (convStr) {
          const allConvs = JSON.parse(convStr);
          const filteredConvs = allConvs.filter((c: any) => 
            c.companyId === businessId || 
            c.companyName?.toLowerCase().trim() === businessName?.toLowerCase().trim()
          );
          setProfileConversations(filteredConvs);
        }

        // Load RFQs
        const rfqStr = appStore.getItem('realtyconnect_rfq_list');
        if (rfqStr) {
          const allRfqs = JSON.parse(rfqStr);
          const filteredRfqs = allRfqs.filter((r: any) => 
            r.organization?.toLowerCase().trim() === businessName?.toLowerCase().trim()
          );
          setProfileRfqs(filteredRfqs);
        }

      } catch (e) {
        console.error(e);
      }
    };

    loadCrmData();
    const interval = setInterval(loadCrmData, 3000);
    return () => clearInterval(interval);
  }, [businessId, businessName]);

  const handleOnboardToCrm = () => {
    try {
      const newCrmAcc = {
        id: businessId || `RC-CRM-${Date.now().toString().slice(-4)}`,
        name: businessName || 'Corporate Client',
        businessType: (businessCategory === 'Vendors' ? 'Vendor' : businessCategory === 'Consultants' ? 'Consultant' : 'Corporate Customer'),
        industry: profile.specialty || 'General Infrastructure & Real Estate Logistics',
        address: profile.location || 'HQ Area, Mumbai, India',
        gstNumber: '27AAACG9944D4Z3',
        website: profile.website || 'www.realtypartner.com',
        businessCategory: businessCategory || 'Developers',
        verificationStatus: 'Verified',
        membershipStatus: 'Premium Gold',
        relationshipStatus: 'Warm',
        assignedManager: currentUserName(),
        customerSince: new Date().toISOString().split('T')[0],
        businessValue: 75, // ₹75 Lakhs value estimate
        currentStage: 'Prospect',
        contacts: [
          {
            id: `c-init-${Date.now()}`,
            name: profile.primaryContact || 'Corporate Representative',
            email: `contact@${(businessName || 'company').toLowerCase().replace(/\s+/g, '')}.com`,
            phone: '+91 99999 88888',
            role: 'Primary Contact'
          }
        ],
        timeline: [
          {
            id: `t-init-${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            type: 'Status Change',
            title: 'CRM Partnership Initiated from Profile',
            details: 'Account profile linked directly to standard active enterprise CRM relationship indexes.',
            status: 'SUCCESS'
          }
        ]
      };

      const updated = [newCrmAcc, ...crmAccounts];
      appStore.setItem('realtyconnect_crm_accounts', JSON.stringify(updated));
      setCrmAccounts(updated);
      setAssociatedCrmAccount(newCrmAcc);
      showToast(`Onboarded ${businessName} into Active CRM Relationships!`, 'success');
      onLogTriggered('CRM_ONBOARDING', 'profile', businessId, 'SUCCESS', `Onboarded ${businessName} as a CRM relationship.`);
    } catch(e) {
      console.error(e);
    }
  };

  // Premium content values matching Priority 03 B2B criteria
  // Showcase content is generated per category for the sample companies only.
  const b2bContent = isRegistered
    ? { products: [], caseStudies: [], opportunities: [], similar: [], highlights: [], certifications: [] } as unknown as ReturnType<typeof getPremiumB2BData>
    : getPremiumB2BData(profile.category);
  const reviewCount = profile.reviews.length;
  const averageRating = reviewCount ? Math.round((profile.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10 : 0;
  const yearsInBusiness = 2026 - parseInt(profile.yearEstablished || '2008');

  // Calculate completeness progress
  const calculateCompleteness = () => {
    let score = 20;
    const checklist = [
      { text: 'Register Regulatory Identifiers (GSTIN, PAN)', complete: !!(profile.gstin && profile.pan), field: 'regulatory', value: 20 },
      { text: 'Provide Corporate Mission & Vision Statements', complete: !!(profile.vision && profile.mission), field: 'statements', value: 20 },
      { text: 'Publish at least 3 Portfolio Projects', complete: profile.portfolio.length >= 3, field: 'portfolio', value: 20 },
      { text: 'Add Active Leadership Team Members', complete: profile.team.length >= 3, field: 'team', value: 20 }
    ];
    checklist.forEach(item => { if (item.complete) score += item.value; });
    return { score, checklist };
  };
  const completeness = calculateCompleteness();

  // B2B Message Composer State
  const [enquiry, setEnquiry] = useState({
    subject: `B2B Procurement Consultation - ${profile.name}`,
    category: 'Material Quotation',
    message: '',
    senderEmail: currentUserEmail(),
    senderPhone: ''
  });
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);
  const [simulatedReply, setSimulatedReply] = useState<string | null>(null);

  // Handler functions
  const handleSaveProfile = () => {
    setIsEditing(false);
    onLogTriggered('BUSINESS_PROFILE_UPDATED', 'profiles', profile.id, 'SUCCESS', 'Saved modified corporate identity details.');
    showToast('Corporate identity saved and synchronized!', 'success');
  };

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name || !newTeam.role) return showToast('Please specify officer name and corporate title.', 'error');
    const member: TeamMember = {
      id: `t-${Date.now()}`,
      name: newTeam.name,
      role: newTeam.role,
      department: newTeam.department || 'Management',
      email: newTeam.email || '',
      phone: newTeam.phone || '',
      photoUrl: ''
    };
    setProfile(prev => ({ ...prev, team: [...prev.team, member] }));
    setNewTeam({ name: '', role: '', department: 'Engineering & Delivery', email: '', phone: '' });
    onLogTriggered('PROFILE_TEAM_ADDED', 'profiles', profile.id, 'SUCCESS', `Added leadership member: ${member.name}`);
    showToast(`${member.name} added to corporate roster!`, 'success');
  };

  const handleDeleteTeam = (id: string, name: string) => {
    setProfile(prev => ({ ...prev, team: prev.team.filter(t => t.id !== id) }));
    onLogTriggered('PROFILE_TEAM_REMOVED', 'profiles', profile.id, 'SUCCESS', `Removed ${name}`);
    showToast(`Removed ${name} from roster.`, 'info');
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title || !newProject.value) return showToast('Please provide project title and contract value.', 'error');
    const proj: ProjectItem = {
      id: `p-${Date.now()}`,
      title: newProject.title,
      type: newProject.type || 'Commercial Tower',
      status: newProject.status as any || 'Completed',
      value: newProject.value,
      area: newProject.area || 'N/A',
      location: newProject.location || profile.workingCities[0] || '',
      description: newProject.description || '',
      completionYear: newProject.completionYear || '2026'
    };
    setProfile(prev => ({ ...prev, portfolio: [...prev.portfolio, proj] }));
    setNewProject({ title: '', type: 'Commercial Tower', status: 'Completed', value: '', area: '', location: '', description: '', completionYear: '2026' });
    onLogTriggered('PROFILE_PROJECT_ADDED', 'profiles', profile.id, 'SUCCESS', `Added project: ${proj.title}`);
    showToast(`Project "${proj.title}" published!`, 'success');
  };

  const handleDeleteProject = (id: string, title: string) => {
    setProfile(prev => ({ ...prev, portfolio: prev.portfolio.filter(p => p.id !== id) }));
    onLogTriggered('PROFILE_PROJECT_REMOVED', 'profiles', profile.id, 'SUCCESS', `Deleted portfolio project: ${title}`);
    showToast(`Project "${title}" deleted.`, 'info');
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistered) {
      // The reviewer is whoever is signed in; the server records their name and company.
      if (!currentOrgId) return showToast('Sign in to review a company.', 'info');
      if (isOwner) return showToast('A company cannot review itself.', 'error');
      if (newReview.comment.trim().length < 5) return showToast('Please write a few words about your experience.', 'error');
      postCompanyReview(profile.id, newReview.rating, newReview.comment.trim())
        .then(updated => {
          setProfile(updated);
          setNewReview({ author: '', company: '', rating: 5, comment: '' });
          onProfileSaved?.();
          showToast('Your review has been posted.', 'success');
        })
        .catch(err => showToast(errorMessage(err), 'error'));
      return;
    }
    if (!newReview.author || !newReview.comment) return showToast('Please enter your name and recommendation text.', 'error');
    const item: ReviewItem = {
      id: `r-${Date.now()}`,
      authorName: newReview.author,
      authorCompany: newReview.company || 'B2B Procurement Client',
      rating: newReview.rating,
      date: new Date().toISOString().substring(0, 10),
      comment: newReview.comment,
      verified: true
    };
    setProfile(prev => ({ ...prev, reviews: [item, ...prev.reviews] }));
    setNewReview({ author: '', company: '', rating: 5, comment: '' });
    onLogTriggered('PROFILE_REVIEW_ADDED', 'profiles', profile.id, 'SUCCESS', `Peer review posted by ${item.authorName}`);
    showToast('Verified recommendation posted instantly!', 'success');
  };

  const handleSubmitEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiry.message) return showToast('Please type your proposal requirements.', 'error');
    setIsSubmittingEnquiry(true);

    if (onSendEnquiry) {
      onSendEnquiry(profile.id, profile.name, enquiry.subject, enquiry.category, enquiry.message, enquiry.senderEmail, enquiry.senderPhone);
    } else {
      onLogTriggered('B2B_ENQUIRY_DISPATCHED', 'enquiries', profile.id, 'SUCCESS', `Sent procurement message: ${enquiry.subject}`);
    }

    setTimeout(() => {
      setIsSubmittingEnquiry(false);
      setSimulatedReply(`[Verified Corporate Priority Callback]\n\nThank you for reaching out to ${profile.name}.\n\nOur procurement and business development desks have received your inquiry. A designated corporate representative will initiate a WhatsApp follow-up or direct telephone consultation within the next 2 hours. We look forward to evaluating commercial terms.`);
      showToast('B2B Inquiry dispatched. Private tunnel secured!', 'success');
    }, 1000);
  };

  const handleBookMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCalendarModal(false);
    if (onScheduleMeeting) {
      onScheduleMeeting(profile.id, profile.name, 'Q3 Technical Consultation', meetingDate, meetingTime, meetingType);
    } else {
      onLogTriggered('B2B_MEETING_SCHEDULED', 'meetings', profile.id, 'SUCCESS', `Scheduled consultation on ${meetingDate} at ${meetingTime}`);
    }
    showToast(`B2B Consultation Scheduled for ${meetingDate} at ${meetingTime}!`, 'success');
  };

  const handleSendProposal = (e: React.FormEvent) => {
    e.preventDefault();
    setShowProposalModal(false);
    if (onSendPartnership) {
      onSendPartnership(profile.id, profile.name, 'partnership', proposalDetails.terms, proposalDetails.estimatedValue, proposalDetails.scope);
    } else {
      onLogTriggered('B2B_PARTNERSHIP_PROPOSAL_FILED', 'partnerships', profile.id, 'SUCCESS', `Partnership proposal filed with value ${proposalDetails.estimatedValue}`);
    }
    showToast('Alliance and dealership application registered successfully!', 'success');
  };

  if (isLoadingProfile) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono text-xs" id="company-profile-loading">Loading company profile...</div>
    );
  }

  return (
    <div className="bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-[85vh] animate-fade-in text-slate-200">
      
      {/* Dynamic Sandbox Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-5 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider text-white font-mono">B2B Corporate Identity Portal</span>
              <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-emerald-500/20">Enterprise Audit Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Preset Demo Switcher (sample companies only) */}
          <select 
            hidden={isRegistered}
            onChange={(e) => {
              const p = STAKEHOLDER_PRESETS.find(pr => pr.role === e.target.value);
              if (p) handleLoadPreset(p);
            }}
            className="bg-slate-950 border border-slate-800 text-[10px] text-slate-300 px-2 py-1 rounded font-mono outline-none"
            defaultValue=""
          >
            <option value="" disabled>-- Demo Preset Role --</option>
            {STAKEHOLDER_PRESETS.map((p, idx) => (
              <option key={idx} value={p.role}>{p.role} - {p.name}</option>
            ))}
          </select>

          {/* Toggle Owner vs Visitor View (only the company's own members can manage it) */}
          <div hidden={!isOwner} id="profile-view-toggle" className="bg-slate-950 p-0.5 rounded-lg border border-slate-800 flex items-center">
            <button
              onClick={() => { setIsOwnerView(false); setIsEditing(false); }}
              className={`px-3 py-1 text-[10px] font-mono font-bold rounded-md transition-all flex items-center gap-1 ${!isOwnerView ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <ViewIcon className="w-3 h-3" />
              Visitor View
            </button>
            <button
              onClick={() => { setIsOwnerView(true); }}
              className={`px-3 py-1 text-[10px] font-mono font-bold rounded-md transition-all flex items-center gap-1 ${isOwnerView ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Settings className="w-3 h-3" />
              Owner View
            </button>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Profile Hero Area */}
      <div className="relative border-b border-slate-900 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-8 sm:px-8">
        
        {/* Banner Overlay */}
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={profile.coverBanner || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200"} 
            className="w-full h-full object-cover opacity-15 filter saturate-0" 
            alt="Corporate Banner"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        {/* Corporate Header Details */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Elegant Brand Logo */}
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ${profile.logoBg || 'bg-slate-700'} border-2 border-slate-800 flex items-center justify-center text-white font-extrabold text-2xl sm:text-3xl shadow-2xl shrink-0`}>
              {profile.name.substring(0, 2).toUpperCase()}
            </div>

            <div className="space-y-1.5 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-sans font-black text-xl sm:text-3xl text-white tracking-tight leading-none">
                  {profile.name}
                </h1>
                {profile.verified && (
                  <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono text-[9px] font-bold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Verified Corporate B2B
                  </span>
                )}
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono text-[9px] font-bold">
                  {profile.membership}
                </span>
              </div>

              {isEditing ? (
                <input 
                  type="text" 
                  value={profile.tagline} 
                  onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs px-2.5 py-1 rounded outline-none w-full max-w-lg focus:border-emerald-500 font-sans"
                />
              ) : (
                <p className="text-xs sm:text-sm text-slate-300 italic max-w-xl leading-relaxed">{profile.tagline}</p>
              )}

              {/* Badges Strip */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1.5 text-[10px] font-mono text-slate-400">
                <span className="text-emerald-400 font-semibold">{profile.category}</span>
                <span>•</span>
                <span>{profile.yearEstablished ? `Established ${profile.yearEstablished} (${yearsInBusiness} Years)` : 'Establishment year not provided'}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.workingCities[0]}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-400 font-semibold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {isRegistered ? (reviewCount ? `${averageRating} (${reviewCount} review${reviewCount === 1 ? '' : 's'})` : 'No reviews yet') : '4.9 (142 endorsements)'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Block or Edit Button */}
          <div className="flex flex-col items-end gap-3 shrink-0">
            {isOwnerView && (
              <div>
                {isEditing ? (
                  <button
                    onClick={handleSaveProfile}
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-lg font-mono transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Settings
                  </button>
                ) : (
                  <button
                    onClick={() => { setIsEditing(true); showToast('Inline editing mode activated.', 'info'); }}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold border border-slate-800 px-4 py-1.5 rounded-lg text-xs flex items-center gap-1.5 font-mono transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                    Edit Identity
                  </button>
                )}
              </div>
            )}

            {/* Quick Micro Performance Metrics */}
            <div className="flex items-center gap-4 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-right">
              <div>
                <span className="text-[8px] font-mono text-slate-500 block">Connections</span>
                <span className="text-emerald-400 font-mono text-xs font-bold">{isRegistered ? '—' : profile.portfolio.length * 3 + 120}</span>
              </div>
              <div className="border-l border-slate-800 h-6" />
              <div>
                <span className="text-[8px] font-mono text-slate-500 block">Followers</span>
                <span className="text-emerald-400 font-mono text-xs font-bold">{isRegistered ? '—' : 840}</span>
              </div>
              <div className="border-l border-slate-800 h-6" />
              <div>
                <span className="text-[8px] font-mono text-slate-500 block">RFQs Issued</span>
                <span className="text-emerald-400 font-mono text-xs font-bold">{isRegistered ? '—' : b2bContent.opportunities.length + 1}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Structural Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left 8 Columns - Tabs and Main Content */}
        <div className="lg:col-span-8 border-r border-slate-900 flex flex-col">
          
          {/* Tab Navigation */}
          <div className="bg-slate-950 border-b border-slate-900 px-6 flex items-center gap-5 overflow-x-auto text-xs font-mono font-bold text-slate-400">
            {[
              { id: 'overview', label: 'Company Overview', icon: FileText },
              { id: 'products', label: 'Products & Services', icon: Grid },
              { id: 'portfolio', label: 'Portfolio & Media', icon: Briefcase },
              { id: 'team', label: 'Team', icon: Users },
              { id: 'reviews', label: 'Social Proof', icon: Star },
              { id: 'related', label: 'Related Content', icon: Sparkles },
              { id: 'leads', label: 'CRM Leads', icon: ClipboardList },
              ...(isOwnerView ? [{ id: 'settings', label: 'Owner Portal', icon: Settings }] : [])
            ].map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3.5 flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${active ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-transparent hover:text-slate-200'}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Dynamic Tab Panel Scrollable Canvas */}
          <div className="p-6 sm:p-8 space-y-8 flex-1">

            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-fade-in text-xs text-slate-300 leading-relaxed text-left">
                
                {/* Introduction & Vision/Mission */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-emerald-500" />
                      About Corporate Company
                    </h3>
                    {isEditing ? (
                      <textarea
                        value={profile.introduction}
                        onChange={(e) => setProfile({ ...profile, introduction: e.target.value })}
                        rows={5}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-slate-200 text-xs focus:border-emerald-500 outline-none"
                      />
                    ) : (
                      <p className="p-4 bg-slate-900/35 border border-slate-900 rounded-xl leading-relaxed font-sans">
                        {profile.introduction || profile.description || (isRegistered ? <span className="text-slate-500">This company has not added a description yet.</span> : null)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      Core Values
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="p-3 bg-slate-900/35 border border-slate-900 rounded-lg">
                        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block mb-0.5 font-bold">Our Corporate Vision</span>
                        <p className="italic text-slate-300 font-sans">"{profile.vision}"</p>
                      </div>
                      <div className="p-3 bg-slate-900/35 border border-slate-900 rounded-lg">
                        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block mb-0.5 font-bold">Our Mission Objective</span>
                        <p className="italic text-slate-300 font-sans">"{profile.mission}"</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Highlights and Strengths */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl space-y-3">
                    <h4 className="text-white font-bold font-mono text-[10px] uppercase tracking-wider text-emerald-400">Core Business Highlights</h4>
                    <ul className="space-y-2 text-slate-300 font-sans text-[11px]">
                      {b2bContent.highlights.map((hl, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl space-y-3">
                    <h4 className="text-white font-bold font-mono text-[10px] uppercase tracking-wider text-emerald-400">Key Strengths & Solutions</h4>
                    <ul className="space-y-2 text-slate-300 font-sans text-[11px]">
                      {profile.coreStrengths.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Certifications registry block */}
                <div className="space-y-4 pt-4 border-t border-slate-900">
                  <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-500" />
                    Verified Certifications & Corporate Licenses
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {b2bContent.certifications.map((cert, idx) => (
                      <div key={idx} className="p-3 bg-slate-950 border border-slate-900 rounded-lg flex flex-col justify-between gap-3 relative overflow-hidden group">
                        <div className="space-y-1">
                          <span className="text-[8px] font-mono text-emerald-400 uppercase font-bold tracking-widest">{cert.type}</span>
                          <h4 className="text-white font-bold font-sans text-[11px] leading-tight">{cert.name}</h4>
                          <p className="text-[10px] font-mono text-slate-500">{cert.authority} • {cert.id}</p>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-900/50 pt-2 text-[9px] font-mono">
                          <span className="text-emerald-500 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {cert.status}
                          </span>
                          <span className="text-slate-400 hover:text-emerald-400 cursor-pointer flex items-center gap-0.5">
                            <Download className="w-3 h-3" />
                            PDF
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trust identifiers */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  <div className="p-3 bg-slate-900/20 border border-slate-900 rounded-lg">
                    <span className="text-[8px] font-mono text-slate-500 block mb-0.5 font-bold">GST Registration</span>
                    <strong className="text-slate-200 font-mono text-[11px] block">{profile.gstin || (isRegistered ? 'Not provided' : 'VERIFIED')}</strong>
                  </div>
                  <div className="p-3 bg-slate-900/20 border border-slate-900 rounded-lg">
                    <span className="text-[8px] font-mono text-slate-500 block mb-0.5 font-bold">Tax PAN Indices</span>
                    <strong className="text-slate-200 font-mono text-[11px] block">{profile.pan || (isRegistered ? 'Not provided' : 'VERIFIED')}</strong>
                  </div>
                  <div className="p-3 bg-slate-900/20 border border-slate-900 rounded-lg">
                    <span className="text-[8px] font-mono text-slate-500 block mb-0.5 font-bold">RERA Registry ID</span>
                    <strong className="text-slate-200 font-mono text-[11px] block truncate">{profile.reraNumber || (isRegistered ? 'Not provided' : 'EXEMPT/CIVIL')}</strong>
                  </div>
                  <div className="p-3 bg-slate-900/20 border border-slate-900 rounded-lg">
                    <span className="text-[8px] font-mono text-slate-500 block mb-0.5 font-bold">Corporate CIN</span>
                    <strong className="text-slate-200 font-mono text-[10px] block truncate">{profile.registrationNumber || (isRegistered ? 'Not provided' : 'VERIFIED')}</strong>
                  </div>
                </div>

                {/* Enterprise CRM Relationship & 360-Degree Intelligence Panel */}
                <div className="pt-6 mt-6 border-t border-slate-900 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                    <div>
                      <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-emerald-500" />
                        Enterprise CRM Relationship Engine
                      </h3>
                      <p className="text-[11px] text-slate-400 font-sans">
                        Real-time relationship mapping, key accounts manager assignments, and historical activity ledger.
                      </p>
                    </div>
                    
                    {!associatedCrmAccount ? (
                      <button
                        onClick={handleOnboardToCrm}
                        className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 self-start sm:self-center"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Onboard Account to CRM
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold">
                        ✓ Active CRM Partnership
                      </span>
                    )}
                  </div>

                  {associatedCrmAccount ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left: Relationship Status & Info */}
                      <div className="lg:col-span-1 bg-slate-950/40 border border-slate-900 rounded-xl p-4 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-900/50 pb-3">
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Relationship State</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider font-bold ${
                            associatedCrmAccount.relationshipStatus === 'Hot' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            associatedCrmAccount.relationshipStatus === 'Warm' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {associatedCrmAccount.relationshipStatus} Stage
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-[9px] font-mono text-slate-500 block">CRM Status</span>
                              <span className="text-slate-200 font-semibold">{associatedCrmAccount.currentStage || 'Prospect'}</span>
                            </div>
                            <div>
                              <span className="text-[9px] font-mono text-slate-500 block">Membership</span>
                              <span className="text-emerald-400 font-bold">{associatedCrmAccount.membershipStatus || 'Gold Partner'}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-[9px] font-mono text-slate-500 block">Relationship Manager</span>
                              <span className="text-slate-200 font-semibold flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                {associatedCrmAccount.assignedManager || currentUserName()}
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] font-mono text-slate-500 block">Portfolio Value</span>
                              <span className="text-white font-bold font-mono">₹{associatedCrmAccount.businessValue || 0} Lakhs</span>
                            </div>
                          </div>

                          <div>
                            <span className="text-[9px] font-mono text-slate-500 block">Tax Identifier</span>
                            <span className="text-slate-300 font-mono text-xs">{associatedCrmAccount.gstNumber || '27AAACA1234F1Z5'}</span>
                          </div>

                          {associatedCrmAccount.contacts && associatedCrmAccount.contacts.length > 0 && (
                            <div className="pt-3 border-t border-slate-900/60">
                              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-2 font-bold">Primary Contacts</span>
                              <div className="space-y-2">
                                {associatedCrmAccount.contacts.map((contact: any, i: number) => (
                                  <div key={i} className="p-2 bg-slate-900/30 border border-slate-900 rounded text-xs space-y-1">
                                    <div className="flex justify-between items-center">
                                      <span className="text-slate-200 font-bold">{contact.name}</span>
                                      <span className="text-[9px] font-mono text-slate-500 uppercase">{contact.role}</span>
                                    </div>
                                    <p className="text-[10px] font-mono text-slate-400">{contact.email} • {contact.phone}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Aggregated Tabs for Communication, Meetings, Leads, RFQs */}
                      <div className="lg:col-span-2 bg-slate-950/20 border border-slate-900 rounded-xl p-4 flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="flex items-center gap-1.5 border-b border-slate-900/60 pb-2 overflow-x-auto whitespace-nowrap">
                            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mr-2">360-Degree Intelligence:</span>
                            <span className="text-slate-300 text-xs px-2 py-0.5 bg-slate-900/40 rounded border border-slate-800">
                              Meetings ({profileMeetings.length})
                            </span>
                            <span className="text-slate-300 text-xs px-2 py-0.5 bg-slate-900/40 rounded border border-slate-800">
                              RFQs ({profileRfqs.length})
                            </span>
                            <span className="text-slate-300 text-xs px-2 py-0.5 bg-slate-900/40 rounded border border-slate-800">
                              Conversations ({profileConversations.length})
                            </span>
                          </div>

                          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                            {/* Meeting Log Timeline */}
                            {profileMeetings.length === 0 && profileRfqs.length === 0 && profileConversations.length === 0 && (
                              <div className="text-center py-6">
                                <p className="text-xs text-slate-500 font-mono">No direct meeting logs or transactions mapped to this account index yet.</p>
                              </div>
                            )}

                            {/* List Meetings */}
                            {profileMeetings.map((m: any, idx: number) => (
                              <div key={`m-${idx}`} className="p-3 bg-slate-900/40 border border-slate-900/80 rounded-lg flex justify-between items-start text-xs gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Scheduled Meeting</span>
                                  </div>
                                  <h5 className="text-white font-bold">{m.title}</h5>
                                  <p className="text-slate-400 text-[11px] leading-tight">{m.description}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-[10px] font-mono text-slate-500 block">{m.date} {m.time}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono uppercase tracking-wider font-bold ${
                                    m.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                                    m.status === 'Cancelled' ? 'bg-red-500/10 text-red-400' :
                                    'bg-amber-500/10 text-amber-400'
                                  }`}>{m.status}</span>
                                </div>
                              </div>
                            ))}

                            {/* List RFQs */}
                            {profileRfqs.map((r: any, idx: number) => (
                              <div key={`r-${idx}`} className="p-3 bg-slate-900/40 border border-slate-900/80 rounded-lg flex justify-between items-start text-xs gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">RFQ / Tender</span>
                                  </div>
                                  <h5 className="text-white font-bold">{r.title}</h5>
                                  <p className="text-slate-400 text-[11px]">Material Requirement: {r.materialSpecification}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-[10px] font-mono text-slate-500 block">Value: ₹{r.estimatedValue}L</span>
                                  <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[8px] font-mono uppercase tracking-wider font-bold">{r.status}</span>
                                </div>
                              </div>
                            ))}

                            {/* List Conversations */}
                            {profileConversations.map((c: any, idx: number) => (
                              <div key={`c-${idx}`} className="p-3 bg-slate-900/40 border border-slate-900/80 rounded-lg flex justify-between items-start text-xs gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Communication Ledger</span>
                                  </div>
                                  <p className="text-slate-300 font-sans text-[11px] italic">"{c.lastMessage || 'Channel established.'}"</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-[10px] font-mono text-slate-500 block">{c.lastActiveDate || 'Just Now'}</span>
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-mono uppercase font-bold">Active</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Account Timeline */}
                        <div className="pt-4 border-t border-slate-900/60 mt-4">
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2 font-bold">Account Timeline & Audit Log</span>
                          <div className="space-y-2">
                            {associatedCrmAccount.timeline?.slice(0, 2).map((t: any, i: number) => (
                              <div key={i} className="flex gap-2.5 items-start text-xs">
                                <div className="mt-1 shrink-0">
                                  <span className={`w-1.5 h-1.5 rounded-full block ${t.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                </div>
                                <div className="space-y-0.5 flex-1">
                                  <div className="flex justify-between items-baseline gap-2">
                                    <span className="text-slate-200 font-bold">{t.title}</span>
                                    <span className="text-[9px] font-mono text-slate-500 shrink-0">{t.timestamp}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 leading-normal">{t.details}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-slate-950/40 border border-slate-900/80 rounded-xl text-center space-y-3">
                      <p className="text-xs text-slate-400 font-sans max-w-md mx-auto leading-relaxed">
                        This corporate account is not yet active on the Enterprise CRM Engine. Onboarding adds it to pipeline value projections, relationship tracking matrices, and logs a full 360-degree timeline.
                      </p>
                      <button
                        onClick={handleOnboardToCrm}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold transition-all inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Onboard Account to CRM Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: PRODUCTS & SERVICES */}
            {activeTab === 'products' && (
              <div className="space-y-6 animate-fade-in text-left">
                
                {/* Introduction Bar */}
                <div className="p-3 bg-slate-900/40 border border-slate-900 rounded-xl flex items-center gap-2 text-slate-300 font-sans text-xs">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Showing audited material specifications and commercial products. Direct inquiries are cryptographically validated for quick dispatch.</span>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {b2bContent.products.map((p, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800/85 hover:border-slate-750 rounded-xl overflow-hidden flex flex-col justify-between relative group">
                      
                      {/* Product Image */}
                      <div className="h-40 w-full overflow-hidden bg-slate-950 relative">
                        <img 
                          src={p.image} 
                          alt={p.name} 
                          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                        <div className="absolute top-2 left-2 flex gap-1">
                          {p.tags.map((tg, i) => (
                            <span key={i} className="bg-slate-950/80 text-emerald-400 border border-emerald-500/20 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded">
                              {tg}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-4 space-y-2 text-xs">
                        <h4 className="text-white font-sans font-bold text-xs">{p.name}</h4>
                        <p className="text-slate-400 font-sans text-[11px] leading-relaxed line-clamp-3">{p.specs}</p>
                        
                        <div className="border-t border-slate-950 pt-2 space-y-1 text-[10px] font-mono text-slate-500">
                          <div className="flex justify-between">
                            <span>B2B Pricing Category:</span>
                            <strong className="text-white">{p.priceRange}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Compatible Materials:</span>
                            <span className="text-slate-300 font-bold truncate max-w-[120px]">{p.related}</span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Enquiry button */}
                      <div className="p-3 bg-slate-950 border-t border-slate-950">
                        <button
                          onClick={() => {
                            setEnquiry({
                              ...enquiry,
                              subject: `Quotation Inquiry - ${p.name}`,
                              message: `Greetings, we are interested in procurement terms regarding "${p.name}". Please share the detailed technical datasheet and wholesale pricing matrix.`
                            });
                            showToast(`Selected "${p.name}". Direct your query in the right panel!`, 'info');
                          }}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-1.5 rounded text-[11px] transition-colors"
                        >
                          Quick Enquiry
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

                {/* Brands Association Strip */}
                <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl space-y-2">
                  <h4 className="text-white font-mono font-bold text-[10px] uppercase tracking-wider text-slate-400">Authorized B2B Brand Alliances</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.brands.map((b, idx) => (
                      <span key={idx} className="bg-slate-950 border border-slate-850 text-slate-300 font-mono text-[10px] px-2.5 py-1 rounded">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB: PORTFOLIO */}
            {activeTab === 'portfolio' && (
              <div className="space-y-6 animate-fade-in text-left">
                
                {/* Form to add project (Owner only) */}
                {isOwnerView && (
                  <form onSubmit={handleAddProject} className="p-4 bg-slate-900/50 border border-slate-900 rounded-xl space-y-3">
                    <h4 className="text-white font-mono font-bold text-[10px] uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" />
                      Add Completed / Active Project
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                      <input 
                        type="text" 
                        placeholder="Project Title"
                        value={newProject.title}
                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                        className="bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 text-xs outline-none focus:border-emerald-500"
                      />
                      <input 
                        type="text" 
                        placeholder="Contract Value (e.g. ₹120 Cr)"
                        value={newProject.value}
                        onChange={(e) => setNewProject({ ...newProject, value: e.target.value })}
                        className="bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 text-xs outline-none focus:border-emerald-500"
                      />
                      <input 
                        type="text" 
                        placeholder="Built-up Area (e.g. 4 Lakh sqft)"
                        value={newProject.area}
                        onChange={(e) => setNewProject({ ...newProject, area: e.target.value })}
                        className="bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 text-xs outline-none focus:border-emerald-500"
                      />
                      <select
                        value={newProject.status}
                        onChange={(e) => setNewProject({ ...newProject, status: e.target.value as any })}
                        className="bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300 text-xs outline-none"
                      >
                        <option value="Completed">Completed</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Upcoming">Upcoming</option>
                      </select>
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3 py-1 rounded text-xs">
                        Publish Project
                      </button>
                    </div>
                  </form>
                )}

                {/* Case Studies Presentation */}
                <div className="space-y-4">
                  <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-500" />
                    B2B Success Case Studies
                  </h3>
                  {b2bContent.caseStudies.map((cs, idx) => (
                    <div key={idx} className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest">Verified Case Study</span>
                        <span className="text-[10px] font-mono text-slate-500">Client Partner: {cs.client}</span>
                      </div>
                      <h4 className="text-white font-sans font-bold text-xs">{cs.title}</h4>
                      <p className="text-[11px] text-slate-300 font-sans"><strong className="text-slate-400">Engineering Challenge:</strong> {cs.challenge}</p>
                      <p className="text-[11px] text-slate-300 font-sans"><strong className="text-emerald-400">Audited Resolution:</strong> {cs.solution}</p>
                    </div>
                  ))}
                </div>

                {/* Projects Grid */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-emerald-500" />
                    Civil & Infrastructure Portfolio
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {profile.portfolio.map((p) => (
                      <div key={p.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl relative flex flex-col justify-between gap-3 text-xs font-sans">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              p.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                              {p.status.toUpperCase()}
                            </span>
                            <span className="text-[9px] font-mono text-slate-500">FY {p.completionYear}</span>
                          </div>
                          <h4 className="text-white font-bold text-xs">{p.title}</h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">{p.description}</p>
                        </div>

                        <div className="border-t border-slate-950 pt-2 space-y-1 text-[10px] font-mono text-slate-500">
                          <div className="flex justify-between">
                            <span>Value:</span>
                            <strong className="text-white">{p.value}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Area:</span>
                            <strong className="text-white">{p.area}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Location:</span>
                            <strong className="text-white truncate max-w-[110px]">{p.location}</strong>
                          </div>
                        </div>

                        {isOwnerView && (
                          <button onClick={() => handleDeleteProject(p.id, p.title)} className="absolute top-2 right-2 text-red-400 p-1 bg-slate-950 rounded">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Media Gallery Block */}
                <div className="space-y-4 pt-4 border-t border-slate-900">
                  <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-500" />
                    Media Gallery & Downloadable Brochures
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {profile.gallery.map((g) => (
                      <div key={g.id} className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col justify-between relative group">
                        {g.type === 'image' ? (
                          <div className="aspect-video bg-slate-950">
                            <img src={g.url} alt={g.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-90" referrerPolicy="no-referrer" loading="lazy" />
                          </div>
                        ) : (
                          <div className="aspect-video bg-slate-950 flex flex-col items-center justify-center text-emerald-400 gap-1.5">
                            <FileText className="w-6 h-6" />
                            <span className="text-[8px] font-mono uppercase text-slate-500">E-Brochure / PDF</span>
                          </div>
                        )}
                        <div className="p-2 flex items-center justify-between text-[10px] font-sans">
                          <span className="text-slate-300 truncate w-24 block" title={g.title}>{g.title}</span>
                          <a href={g.url} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline shrink-0">
                            <Download className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB: TEAM */}
            {activeTab === 'team' && (
              <div className="space-y-6 animate-fade-in text-left">
                
                {isOwnerView && (
                  <form onSubmit={handleAddTeam} className="p-4 bg-slate-900/50 border border-slate-900 rounded-xl space-y-3">
                    <h4 className="text-white font-mono font-bold text-[10px] uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" />
                      Add Officer to Roster
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <input 
                        type="text" 
                        placeholder="Officer Name"
                        value={newTeam.name}
                        onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                        className="bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 text-xs outline-none focus:border-emerald-500"
                      />
                      <input 
                        type="text" 
                        placeholder="Corporate Role"
                        value={newTeam.role}
                        onChange={(e) => setNewTeam({ ...newTeam, role: e.target.value })}
                        className="bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 text-xs outline-none focus:border-emerald-500"
                      />
                      <select
                        value={newTeam.department}
                        onChange={(e) => setNewTeam({ ...newTeam, department: e.target.value })}
                        className="bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300 text-xs outline-none"
                      >
                        <option value="Executive Leadership">Executive Leadership</option>
                        <option value="Engineering & Delivery">Engineering & Delivery</option>
                        <option value="Sales & B2B Partnerships">Sales & B2B Partnerships</option>
                        <option value="Compliance & Liaison">Compliance & Liaison</option>
                      </select>
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3 py-1 rounded text-xs">
                        Onboard Officer
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {profile.team.map((member) => (
                    <div key={member.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3 relative group">
                      <img 
                        src={member.photoUrl || `data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' fill='#1e293b'/><text x='32' y='40' font-size='24' font-family='sans-serif' text-anchor='middle' fill='#94a3b8'>${member.name.replace(/[^A-Za-z ]/g, '').split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase()}</text></svg>`)}`} 
                        alt={member.name} 
                        className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      <div className="space-y-0.5 truncate text-left">
                        <h4 className="text-white font-bold text-xs truncate">{member.name}</h4>
                        <p className="text-[11px] text-emerald-400 font-semibold truncate">{member.role}</p>
                        <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider truncate">{member.department}</p>
                        <p className="text-[10px] font-mono text-slate-400 truncate">{member.email}</p>
                      </div>

                      {isOwnerView && (
                        <button onClick={() => handleDeleteTeam(member.id, member.name)} className="absolute top-2 right-2 text-red-400 p-1 bg-slate-950 rounded">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* TAB: REVIEWS (SOCIAL PROOF) */}
            {activeTab === 'reviews' && (
              <div className="space-y-6 animate-fade-in text-left">
                
                {/* Peer Review Submission form */}
                <form onSubmit={handleAddReview} className="p-4 bg-slate-900/50 border border-slate-900 rounded-xl space-y-3">
                  <h4 className="text-white font-mono font-bold text-[10px] uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Submit Peer Endorsement
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <input 
                      type="text" 
                      hidden={isRegistered}
                      placeholder="Your Full Name"
                      value={newReview.author}
                      onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                      className="bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 text-xs outline-none focus:border-emerald-500"
                    />
                    <input 
                      type="text" 
                      hidden={isRegistered}
                      placeholder="Your Company Name"
                      value={newReview.company}
                      onChange={(e) => setNewReview({ ...newReview, company: e.target.value })}
                      className="bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 text-xs outline-none focus:border-emerald-500"
                    />
                    <select
                      value={newReview.rating}
                      onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                      className="bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300 text-xs outline-none"
                    >
                      <option value="5">★★★★★ Outstanding (5/5)</option>
                      <option value="4">★★★★☆ Highly Recommended (4/5)</option>
                      <option value="3">★★★☆☆ Satisfactory (3/5)</option>
                      <option value="2">★★☆☆☆ Below Expectations (2/5)</option>
                      <option value="1">★☆☆☆☆ Poor (1/5)</option>
                    </select>
                  </div>
                  <textarea 
                    placeholder="Enter endorsement details (procurement accuracy, logistics timelines, invoice audits compliance, etc...)"
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 text-xs outline-none focus:border-emerald-500"
                  />
                  <div className="flex justify-end">
                    <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-1.5 rounded-lg text-xs">
                      Submit Verified Endorsement
                    </button>
                  </div>
                </form>

                {/* Testimonials list */}
                <div className="space-y-4">
                  {profile.reviews.map((r) => (
                    <div key={r.id} className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <strong className="text-white text-xs block">{r.authorName}</strong>
                          <span className="text-[10px] text-slate-500 font-mono">{r.authorCompany} • {r.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-400 font-mono text-xs font-bold">{'★'.repeat(r.rating)}</span>
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-mono px-1.5 py-0.5 rounded font-bold">
                            Verified B2B
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-300 font-sans italic">"{r.comment}"</p>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* TAB: RELATED CONTENT */}
            {activeTab === 'related' && (
              <div className="space-y-6 animate-fade-in text-left">
                
                {/* Opportunities Section */}
                <div className="space-y-3">
                  <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                    Published Tenders & Live RFQs
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {b2bContent.opportunities.map((opp, idx) => (
                      <div key={idx} className="p-4 bg-slate-900/35 border border-slate-900 rounded-xl flex flex-col justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[8px] font-mono font-bold px-2 py-0.5 rounded">
                              {opp.type}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">{opp.date}</span>
                          </div>
                          <h4 className="text-white font-bold font-sans text-xs">{opp.title}</h4>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-950/60 pt-2 text-[10px] font-mono">
                          <span className="text-slate-400">Escrow Allocations:</span>
                          <strong className="text-emerald-400">{opp.budget}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Similar Corporate Entities */}
                <div className="space-y-3 pt-4 border-t border-slate-900">
                  <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-500" />
                    Similar Verified B2B Businesses nearby
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {b2bContent.similar.map((sim, idx) => (
                      <div key={idx} className="p-3 bg-slate-900/20 border border-slate-900 rounded-lg flex items-center justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <h4 className="text-white font-bold text-xs">{sim.name}</h4>
                          <p className="text-[10px] font-mono text-slate-500">{sim.category} • {sim.location}</p>
                        </div>
                        <button 
                          onClick={() => {
                            setProfile(getSeededProfile(sim.name.toLowerCase().replace(/\s+/g, '-'), sim.name, sim.category, sim.location));
                            setActiveTab('overview');
                            showToast(`Navigated to: ${sim.name}`, 'info');
                          }}
                          className="bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold px-2.5 py-1 rounded text-[10px] font-mono border border-slate-800"
                        >
                          View Profile
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB: CRM LEADS & PIPELINE HISTORY */}
            {activeTab === 'leads' && (
              <div className="space-y-6 animate-fade-in text-xs text-slate-300 text-left">
                
                {/* Metrics Header Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Metric 1: Generated Leads */}
                  <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-900 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Generated Leads</span>
                      <strong className="text-xl font-mono font-bold text-white block mt-1">
                        {profileLeads.filter(l => 
                          l.company && profile.name && 
                          (l.company.toLowerCase().includes(profile.name.toLowerCase()) || 
                           profile.name.toLowerCase().includes(l.company.toLowerCase()))
                        ).length}
                      </strong>
                    </div>
                    <span className="text-[9px] text-slate-500 block mt-2">All-Time Captured Opportunities</span>
                  </div>

                  {/* Metric 2: Open Leads */}
                  <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-900 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Active Pipeline</span>
                      <strong className="text-xl font-mono font-bold text-amber-400 block mt-1">
                        {profileLeads.filter(l => 
                          l.company && profile.name && 
                          (l.company.toLowerCase().includes(profile.name.toLowerCase()) || 
                           profile.name.toLowerCase().includes(l.company.toLowerCase())) &&
                          l.status !== 'Converted' && l.status !== 'Closed' && l.status !== 'Lost' && l.status !== 'Cancelled'
                        ).length}
                      </strong>
                    </div>
                    <span className="text-[9px] text-slate-500 block mt-2">In Discussion & Negotiation</span>
                  </div>

                  {/* Metric 3: Closed Leads */}
                  <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-900 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Closed Outcomes</span>
                      <strong className="text-xl font-mono font-bold text-emerald-400 block mt-1">
                        {profileLeads.filter(l => 
                          l.company && profile.name && 
                          (l.company.toLowerCase().includes(profile.name.toLowerCase()) || 
                           profile.name.toLowerCase().includes(l.company.toLowerCase())) &&
                          (l.status === 'Converted' || l.status === 'Closed' || l.status === 'Lost' || l.status === 'Cancelled')
                        ).length}
                      </strong>
                    </div>
                    <span className="text-[9px] text-slate-500 block mt-2">Won, Lost & Settled Contracts</span>
                  </div>
                </div>

                {/* Lead History List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                    <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                      <ClipboardList className="w-4 h-4 text-emerald-400" />
                      Lead Interaction & Pipeline Ledger
                    </h3>
                    <span className="text-[9px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded">
                      {profileLeads.filter(l => 
                        l.company && profile.name && 
                        (l.company.toLowerCase().includes(profile.name.toLowerCase()) || 
                         profile.name.toLowerCase().includes(l.company.toLowerCase()))
                      ).length} RECORDS REGISTERED
                    </span>
                  </div>

                  {profileLeads.filter(l => 
                    l.company && profile.name && 
                    (l.company.toLowerCase().includes(profile.name.toLowerCase()) || 
                     profile.name.toLowerCase().includes(l.company.toLowerCase()))
                  ).length === 0 ? (
                    <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-8 text-center space-y-2">
                      <p className="text-slate-400">No CRM leads recorded for this company yet.</p>
                      <p className="text-[10px] text-slate-500 leading-relaxed max-w-md mx-auto">
                        Inquiries, video meetings scheduled, RFQ quote submissions, and joint venture handshakes across RealtyConnect will automatically generate high-fidelity leads here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {profileLeads.filter(l => 
                        l.company && profile.name && 
                        (l.company.toLowerCase().includes(profile.name.toLowerCase()) || 
                         profile.name.toLowerCase().includes(l.company.toLowerCase()))
                      ).map((lead) => (
                        <div key={lead.id} className="bg-slate-900/20 border border-slate-900/60 p-4 rounded-xl space-y-3">
                          
                          {/* Top row */}
                          <div className="flex flex-col sm:flex-row justify-between gap-2 border-b border-slate-900 pb-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-mono font-bold text-slate-500">{lead.id}</span>
                                <span className="text-[8px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded uppercase shrink-0">
                                  {lead.source} Channel
                                </span>
                                <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded ${
                                  lead.priority === 'Urgent' ? 'bg-rose-500/10 text-rose-400' :
                                  lead.priority === 'High' ? 'bg-amber-500/10 text-amber-400' :
                                  'bg-slate-900 text-slate-400'
                                } uppercase`}>
                                  {lead.priority} Priority
                                </span>
                              </div>
                              <h4 className="text-white font-bold text-xs">{lead.title}</h4>
                            </div>
                            <div className="sm:text-right self-start sm:self-center">
                              <span className={`inline-block text-[9px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                                lead.status === 'New' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse' :
                                lead.status === 'Converted' || lead.status === 'Won' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                lead.status === 'Lost' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                'bg-slate-950 text-slate-300 border-slate-900'
                              }`}>
                                {lead.status}
                              </span>
                            </div>
                          </div>

                          {/* Info row */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px] font-sans text-slate-400">
                            <div>
                              <strong className="block text-[8px] font-mono uppercase text-slate-500">Contact Person</strong>
                              <span className="text-slate-200 font-bold">{lead.contactPerson}</span>
                            </div>
                            <div>
                              <strong className="block text-[8px] font-mono uppercase text-slate-500">Contact Mobile</strong>
                              <span>{lead.mobile}</span>
                            </div>
                            <div>
                              <strong className="block text-[8px] font-mono uppercase text-slate-500">Corporate Email</strong>
                              <span className="truncate block">{lead.email}</span>
                            </div>
                            <div>
                              <strong className="block text-[8px] font-mono uppercase text-slate-500">Assigned Executive</strong>
                              <span className="text-slate-300">{lead.assignedTo || 'Unassigned'}</span>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-[10.5px] leading-relaxed text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-900">
                            {lead.description}
                          </p>

                          {/* Timeline events preview */}
                          {lead.timeline && lead.timeline.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              <strong className="block text-[8px] font-mono uppercase text-slate-500">Interactive Timeline History</strong>
                              <div className="space-y-1">
                                {lead.timeline.map((event: any, idx: number) => (
                                  <div key={event.id || idx} className="flex gap-2 text-[9px] text-slate-500 font-mono">
                                    <span className="text-slate-600 font-bold">{event.date}</span>
                                    <span className="text-emerald-500 font-bold">[{event.type}]</span>
                                    <span className="text-slate-400">{event.text}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB: OWNER PORTAL */}
            {activeTab === 'settings' && isOwnerView && (
              <div className="space-y-6 animate-fade-in text-xs text-slate-300 text-left">
                {isOwner && (
                  <CompanyProfileForm
                    profile={profile as CompanyProfile}
                    onSave={changes => {
                      setProfile(prev => ({ ...prev, ...changes }));
                      showToast('Saving company details...', 'info');
                    }}
                  />
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Category 1: Preferences */}
                  <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-900 space-y-4">
                    <h4 className="text-white font-bold text-xs uppercase tracking-wider font-mono border-b border-slate-900 pb-2">
                      Commercial Inquiry Routing
                    </h4>
                    
                    <div className="space-y-3 font-sans">
                      <div className="flex items-center justify-between">
                        <div>
                          <strong className="text-slate-200 block text-[11px]">Dynamic Auto-Response</strong>
                          <span className="text-[9px] text-slate-500 block">Reply instantly with pre-approved corporate draft</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={profile.leadPreferences.autoReply}
                          onChange={(e) => setProfile({
                            ...profile,
                            leadPreferences: { ...profile.leadPreferences, autoReply: e.target.checked }
                          })}
                          className="w-4 h-4 accent-emerald-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <strong className="text-slate-200 block text-[11px]">E-Mail Dispatches</strong>
                          <span className="text-[9px] text-slate-500 block">Forward copies of RFQs directly to {profile.email}</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={profile.leadPreferences.notifyEmail}
                          onChange={(e) => setProfile({
                            ...profile,
                            leadPreferences: { ...profile.leadPreferences, notifyEmail: e.target.checked }
                          })}
                          className="w-4 h-4 accent-emerald-500"
                        />
                      </div>

                      <div className="pt-2">
                        <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">Preferred Sourcing Size</label>
                        <select
                          value={profile.leadPreferences.preferredLeadValue}
                          onChange={(e) => setProfile({
                            ...profile,
                            leadPreferences: { ...profile.leadPreferences, preferredLeadValue: e.target.value }
                          })}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded p-1.5 font-mono text-[11px] outline-none"
                        >
                          <option value="Any size">Any Sourcing Capacity</option>
                          <option value="₹10,00,000+">₹10 Lakhs+ Tenders</option>
                          <option value="₹50,00,000+">₹50 Lakhs+ Enterprise Contracts</option>
                          <option value="₹1,00,000,00+">₹1 Crore+ Priority Tenders</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Category 2: Access & Privacy */}
                  <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-900 space-y-4">
                    <h4 className="text-white font-bold text-xs uppercase tracking-wider font-mono border-b border-slate-900 pb-2">
                      Corporate Privacy
                    </h4>

                    <div className="space-y-3 font-sans">
                      <div>
                        <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">Profile Visibility Level</label>
                        <select
                          value={profile.profileVisibility}
                          onChange={(e) => setProfile({ ...profile, profileVisibility: e.target.value as any })}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded p-1.5 font-mono outline-none"
                        >
                          <option value="Public">Public (Indexed on RealtyConnect Directory)</option>
                          <option value="Connections Only">Connected Stakeholders Only (Mutual Handshake)</option>
                          <option value="Private">Private Draft (Audit Only)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">Officer Contact Details</label>
                        <select
                          value={profile.contactVisibility}
                          onChange={(e) => setProfile({ ...profile, contactVisibility: e.target.value as any })}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded p-1.5 font-mono outline-none"
                        >
                          <option value="Public">Open corporate indices</option>
                          <option value="Verified Only">Expose only to RERA-verified developers</option>
                          <option value="None">Hide details (Enquiry Form routing only)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Real-time feed of recent corporate actions at bottom of left panel */}
          <div className="border-t border-slate-900 p-6 bg-slate-900/10 text-left text-xs text-slate-400 font-mono space-y-2">
            <span className="text-[9px] font-mono font-bold tracking-wider text-slate-500">Recent Live Corporate Actions</span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>[Update] Verified ISO audit report logged on the blockchain registry dynamically.</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              <span>[Audit Logs] Handshake connection requests updated 18 minutes ago.</span>
            </div>
          </div>

        </div>

        {/* Right 4 Columns - Actions Panel & Contact Details */}
        <div className="lg:col-span-4 p-6 sm:p-8 bg-slate-900/15 space-y-6 flex flex-col justify-between">
          
          <div className="space-y-6 text-left">
            
            {/* Owner view: Profile Strength progress block */}
            {isOwnerView && (
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-900 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider font-mono text-white flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    Profile Completeness
                  </span>
                  <span className="text-emerald-400 font-mono font-bold text-xs">{completeness.score}%</span>
                </div>
                
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-900">
                  <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${completeness.score}%` }} />
                </div>

                <div className="space-y-2 pt-1 text-[10px] font-sans text-slate-400">
                  {completeness.checklist.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {item.complete ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 ml-1 mr-1 animate-pulse" />
                      )}
                      <span className={item.complete ? 'line-through text-slate-500' : 'text-slate-300 font-medium'}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick trust scores */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 grid grid-cols-2 gap-3 text-center">
              <div>
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block mb-0.5">{isRegistered ? 'PEER RATING' : 'TRUST SCORE'}</span>
                <span className="text-white font-mono text-xs font-bold flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {isRegistered ? (reviewCount ? `${averageRating} / 5` : 'No reviews yet') : '9.9 / 10'}
                </span>
              </div>
              <div>
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block mb-0.5">Response Ratio</span>
                <span className="text-white font-mono text-xs font-bold flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  {isRegistered ? 'Not tracked yet' : '99% / 2hr'}
                </span>
              </div>
            </div>

            {/* Networking Actions Widget */}
            <div className="space-y-3">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Liaison Actions</span>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    if (onSendConnection && onWithdrawConnection && connections) {
                      const existing = connections.find(c => c.businessId === businessId);
                      if (existing) {
                        onWithdrawConnection(existing.id);
                        setIsConnected(false);
                      } else {
                        onSendConnection(businessId, businessName, businessCategory, businessLocation, profile.logoBg, 'Verified B2B Handshake Connection');
                        setIsConnected(true);
                      }
                    } else {
                      setIsConnected(!isConnected);
                    }
                    showToast(isConnected ? 'Connection removed.' : 'Connection requested dynamically!', 'success');
                  }}
                  className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all font-mono ${
                    isConnected 
                      ? 'bg-slate-900 text-slate-400 border border-slate-800' 
                      : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                  }`}
                >
                  {isConnected ? <UserCheck className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  {isConnected ? 'Connected' : 'Connect'}
                </button>

                <button
                  onClick={() => {
                    setIsFollowing(!isFollowing);
                    if (onToggleFollow) onToggleFollow(businessId, businessName);
                    showToast(isFollowing ? 'Unfollowed stream.' : 'Subscribed to real-time feed updates!', 'success');
                  }}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 font-mono"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isFollowing ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2 pt-1">
                <button
                  onClick={() => setShowProposalModal(true)}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-2 px-4 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-md font-mono"
                >
                  <Award className="w-3.5 h-3.5" />
                  Apply Dealership / Alliance
                </button>

                <button
                  onClick={() => setShowCalendarModal(true)}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 py-2 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all font-mono"
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Schedule B2B Meeting
                </button>
              </div>
            </div>

            {/* B2B Procurement Message Room */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-3">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block font-extrabold">Instant Secure Sourcing Room</span>
              
              {simulatedReply ? (
                <div className="space-y-2.5 animate-fade-in">
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-[10px] font-mono text-slate-300 leading-relaxed whitespace-pre-line max-h-40 overflow-y-auto">
                    {simulatedReply}
                  </div>
                  <button
                    onClick={() => { setSimulatedReply(null); setEnquiry({ ...enquiry, message: '' }); }}
                    className="text-[10px] font-mono font-bold text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    ← Dispatch another priority message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitEnquiry} className="space-y-2.5 text-xs">
                  <select
                    value={enquiry.category}
                    onChange={(e) => setEnquiry({ ...enquiry, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 text-[10px] text-slate-300 px-2.5 py-1.5 rounded outline-none"
                  >
                    <option value="Material Quotation">Material Quotation Request</option>
                    <option value="General Partnership">General Corporate Collaboration</option>
                    <option value="Subcontracting bid">Subcontracting Bid</option>
                  </select>

                  <textarea
                    required
                    placeholder="Describe B2B procurement sizes, specifications, or timelines needed..."
                    value={enquiry.message}
                    onChange={(e) => setEnquiry({ ...enquiry, message: e.target.value })}
                    rows={3}
                    className="w-full bg-slate-900 border border-slate-800 text-xs p-2 text-slate-200 rounded outline-none focus:border-emerald-500 placeholder:text-slate-600"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="Contact Phone" 
                      value={enquiry.senderPhone} 
                      onChange={(e) => setEnquiry({ ...enquiry, senderPhone: e.target.value })}
                      className="bg-slate-900 border border-slate-800 text-[10px] p-1.5 rounded outline-none text-slate-300"
                    />
                    <input 
                      type="email" 
                      placeholder="Contact Email" 
                      value={enquiry.senderEmail} 
                      onChange={(e) => setEnquiry({ ...enquiry, senderEmail: e.target.value })}
                      className="bg-slate-900 border border-slate-800 text-[10px] p-1.5 rounded outline-none text-slate-300"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingEnquiry}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 font-bold py-1.5 rounded text-[11px] flex items-center justify-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    {isSubmittingEnquiry ? 'Securing Connection...' : 'Secure Sourcing Request'}
                  </button>
                </form>
              )}
            </div>

            {/* Quick Actions Actions Centre (Bookmark & Save) */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
              <button 
                onClick={() => {
                  setIsSaved(!isSaved);
                  showToast(isSaved ? 'Business profile removed from saved bookmarks.' : 'Business profile saved to corporate bookmarks!', 'success');
                }}
                className="bg-slate-900/40 hover:bg-slate-900 p-2 rounded border border-slate-900 flex items-center justify-center gap-1"
              >
                <HeartIcon className={`w-3.5 h-3.5 ${isSaved ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                {isSaved ? 'Saved Portfolio' : 'Save Business'}
              </button>

              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('Corporate profile link copied to clipboard!', 'success');
                  onLogTriggered('BUSINESS_PROFILE_SHARED', 'profiles', profile.id, 'SUCCESS', 'Copied corporate shortlink.');
                }}
                className="bg-slate-900/40 hover:bg-slate-900 p-2 rounded border border-slate-900 flex items-center justify-center gap-1"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share Profile
              </button>
            </div>

          </div>

          {/* Quick Contact & Address */}
          <div className="border-t border-slate-900 pt-5 mt-5 space-y-3 text-xs text-slate-400 font-sans">
            <div className="flex items-start gap-2 text-left">
              <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-mono text-[9px] uppercase tracking-wider">Corporate HQ Address</strong>
                <span className="leading-normal">{profile.addressCorporate}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{profile.businessHours}</span>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{profile.phone}</span>
            </div>

            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{profile.email}</span>
            </div>
          </div>

        </div>

      </div>

      {/* ALLIANCE / PARTNERSHIP MODAL */}
      {showProposalModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in text-left">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-5 space-y-4">
            <div>
              <h3 className="font-sans font-bold text-base text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Alliance & Dealership Application
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Draft a high-priority corporate agreement to establish verified supply and procurement channels.
              </p>
            </div>

            <form onSubmit={handleSendProposal} className="space-y-3 text-xs">
              <div>
                <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1">Corporate Credit Terms</label>
                <input 
                  type="text" 
                  required 
                  value={proposalDetails.terms} 
                  onChange={(e) => setProposalDetails({ ...proposalDetails, terms: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1">Estimated Procurement size (Annual)</label>
                  <input 
                    type="text" 
                    required 
                    value={proposalDetails.estimatedValue} 
                    onChange={(e) => setProposalDetails({ ...proposalDetails, estimatedValue: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1">Joint Operations Scope Outline</label>
                <textarea 
                  required 
                  value={proposalDetails.scope} 
                  onChange={(e) => setProposalDetails({ ...proposalDetails, scope: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 text-xs font-mono">
                <button type="button" onClick={() => setShowProposalModal(false)} className="px-3.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-400">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded">
                  Submit Alliance Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE MEETING MODAL */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in text-left">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-5 space-y-4">
            <div>
              <h3 className="font-sans font-bold text-base text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                Schedule B2B Technical Consultation
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Book a corporate video or telephonic session directly with {profile.name} team leaders.
              </p>
            </div>

            <form onSubmit={handleBookMeeting} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1">Select Date</label>
                  <input 
                    type="date" 
                    required 
                    value={meetingDate} 
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1">Preferred Time Block</label>
                  <input 
                    type="text" 
                    required 
                    value={meetingTime} 
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1">Consultation Channel Mode</label>
                <select
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300 outline-none"
                >
                  <option value="Virtual Video Call">Secured B2B Video Meet (Google Meet / Zoom)</option>
                  <option value="Telephonic Consultation">Phone Consultation Call</option>
                  <option value="At Corporate Office">In-Person at Corporate Office Location</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 text-xs font-mono">
                <button type="button" onClick={() => setShowCalendarModal(false)} className="px-3.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-400">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded">
                  Confirm Meeting Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
