/**
 * RealtyConnect™ Sprint 07 - Enterprise Business Directory Engine
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  CheckCircle2, 
  Star, 
  Clock, 
  Heart, 
  Share2, 
  Phone, 
  MessageSquare, 
  Mail, 
  Layers, 
  Award, 
  ShieldCheck, 
  Landmark, 
  Sparkles, 
  RefreshCw, 
  X, 
  ChevronDown, 
  Copy, 
  Printer, 
  QrCode, 
  AlertCircle, 
  Eye, 
  Check, 
  HelpCircle,
  TrendingUp,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Info,
  Building,
  Building2,
  HardHat,
  Package,
  Users,
  Truck,
  Compass,
  FileText,
  Calendar,
  ArrowRight,
  ExternalLink,
  Plus,
  Briefcase,
  ShoppingBag,
  FileSpreadsheet
} from 'lucide-react';

export interface Company {
  id: string;
  name: string;
  category: 'Builders' | 'Developers' | 'Contractors' | 'Material Vendors' | 'Banks' | 'Consultants' | 'DSA' | 'Recruitment' | 'Equipment' | 'Transport';
  businessType: string;
  logoBg: string;
  logoText: string;
  description: string;
  shortDescription: string;
  rating: number;
  established: string;
  experienceYears: number;
  membership: 'Starter' | 'Commercial Pro' | 'Corporate Elite';
  
  // Location
  country: string;
  state: string;
  city: string;
  area: string;
  pincode: string;
  
  // Verifications
  verified: boolean;
  gstVerified: boolean;
  reraVerified: boolean;
  premiumMember: boolean;
  featuredMember: boolean;

  // Stats
  views: number;
  connectionsCount: number;
  recentlyJoined: boolean;
  trending: boolean;
  distanceKm: number | null; // Sample companies carry a made-up distance; registered ones have none
  registered?: boolean; // true for companies registered on the platform (as opposed to bundled samples)
  reviewCount?: number;

  // Products & Services
  products: string[];
  services: string[];
  brands: string[];
  keywords: string[];

  // Premium properties
  coverGradient?: string;
  availability?: string;
  projects?: string[];
  feedPosts?: string[];
  rfqs?: string[];
  opportunities?: string[];
  phone?: string;
  email?: string;
  employeeCount?: string;
}

// Robust seed database with 25 diverse real-estate B2B entities
const SEED_COMPANIES: Company[] = [
  {
    id: 'ent-1',
    name: 'Apex Developers Ltd',
    category: 'Developers',
    businessType: 'Developer',
    logoBg: 'bg-indigo-600',
    logoText: 'AD',
    description: 'Premier builder specializing in sustainable luxury skyscrapers and integrated smart townships. Focused on grade-A smart residential towers.',
    shortDescription: 'Sustainable luxury skyscrapers & smart township developer.',
    rating: 4.9,
    established: '2008',
    experienceYears: 18,
    membership: 'Corporate Elite',
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai',
    area: 'Bandra Kurla Complex',
    pincode: '400051',
    verified: true,
    gstVerified: true,
    reraVerified: true,
    premiumMember: true,
    featuredMember: true,
    views: 1450,
    connectionsCount: 24,
    recentlyJoined: false,
    trending: true,
    distanceKm: 2.4,
    products: ['Luxury Smart Penthouses', 'Eco-certified Residential Flats', 'Corporate Offices'],
    services: ['Land acquisition feasibility', 'Sustainable building architecture', 'B2B asset syndication'],
    brands: ['Apex Signature Towers', 'Apex Green Meadows'],
    keywords: ['developer', 'highrise', 'luxury', 'rera', 'mumbai', 'bkc', 'sustainable']
  },
  {
    id: 'ent-2',
    name: 'BuildCorp Construction',
    category: 'Contractors',
    businessType: 'Contractor',
    logoBg: 'bg-emerald-600',
    logoText: 'BC',
    description: 'Leading civil engineering contractor executing major infrastructure, metro lines, highway structures, and commercial tech parks.',
    shortDescription: 'Heavy infrastructure, concrete piling & metro rail contractors.',
    rating: 4.8,
    established: '1995',
    experienceYears: 31,
    membership: 'Corporate Elite',
    country: 'India',
    state: 'Karnataka',
    city: 'Bangalore',
    area: 'Whitefield',
    pincode: '560066',
    verified: true,
    gstVerified: true,
    reraVerified: false,
    premiumMember: true,
    featuredMember: true,
    views: 1120,
    connectionsCount: 42,
    recentlyJoined: false,
    trending: true,
    distanceKm: 4.8,
    products: ['Heavy concrete precast slabs', 'Reinforced foundation piles', 'Pre-engineered steel columns'],
    services: ['Excavation & Shoring', 'Superstructure framing', 'ISO-certified structural testing'],
    brands: ['BuildCorp FrameTech', 'BuildCorp PreCast'],
    keywords: ['contractor', 'infrastructure', 'metro', 'pile', 'piling', 'civil', 'bangalore']
  },
  {
    id: 'ent-3',
    name: 'Elite Materials Group',
    category: 'Material Vendors',
    businessType: 'Material Supplier',
    logoBg: 'bg-amber-600',
    logoText: 'EM',
    description: 'Primary supplier of high-grade ready-mix concrete, reinforcing TMT bars, autoclaved aerated concrete (AAC) blocks and fly ash bricks.',
    shortDescription: 'High-grade ready-mix concrete and bulk TMT bar supplier.',
    rating: 4.7,
    established: '2012',
    experienceYears: 14,
    membership: 'Commercial Pro',
    country: 'India',
    state: 'Delhi',
    city: 'Delhi NCR',
    area: 'Noida Sector 62',
    pincode: '201301',
    verified: true,
    gstVerified: true,
    reraVerified: false,
    premiumMember: true,
    featuredMember: false,
    views: 950,
    connectionsCount: 51,
    recentlyJoined: false,
    trending: false,
    distanceKm: 8.5,
    products: ['Ready-Mix Concrete (M40/M50)', 'Fe550D TMT Reinforcement Bars', 'AAC Light-weight Blocks'],
    services: ['Bulk site deliveries', 'Concrete slump testing', 'Materials logistics routing'],
    brands: ['Ultratech cement', 'Tata Tiscon', 'JSW NeoSteel', 'Lafarge Holcim'],
    keywords: ['vendor', 'materials', 'ready-mix', 'concrete', 'tmt', 'steel', 'blocks', 'delhi', 'noida']
  },
  {
    id: 'ent-4',
    name: 'RealtyConnect Pro Consultants',
    category: 'Consultants',
    businessType: 'Legal Consultant',
    logoBg: 'bg-purple-600',
    logoText: 'RC',
    description: 'Full-service real estate advisory providing expert RERA registrations, quarterly compliance filing, legal title searches, and land acquisition feasibility audits.',
    shortDescription: 'RERA compliance, title search, and land feasibility consultants.',
    rating: 4.9,
    established: '2016',
    experienceYears: 10,
    membership: 'Commercial Pro',
    country: 'India',
    state: 'Telangana',
    city: 'Hyderabad',
    area: 'Gachibowli',
    pincode: '500032',
    verified: true,
    gstVerified: true,
    reraVerified: true,
    premiumMember: false,
    featuredMember: true,
    views: 820,
    connectionsCount: 18,
    recentlyJoined: false,
    trending: true,
    distanceKm: 6.2,
    products: ['Legal Compliance Audit Handbooks', 'RERA Filing Blueprints', 'Due Diligence Packets'],
    services: ['RERA advisory & registration', 'Land title search', 'Project joint venture mediation'],
    brands: ['RERA-Sureshot', 'Feasibility-Pro'],
    keywords: ['consultant', 'legal', 'rera', 'compliance', 'title search', 'due diligence', 'hyderabad']
  },
  {
    id: 'ent-5',
    name: 'National Trust Bank',
    category: 'Banks',
    businessType: 'Bank',
    logoBg: 'bg-blue-600',
    logoText: 'NT',
    description: 'Institutional banking and customized commercial lending models for real estate developers, escrow management, and commercial construction loans.',
    shortDescription: 'Developer project financing, escrow and wholesale mortgage bank.',
    rating: 4.6,
    established: '1984',
    experienceYears: 42,
    membership: 'Corporate Elite',
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai',
    area: 'Nariman Point',
    pincode: '400021',
    verified: true,
    gstVerified: true,
    reraVerified: false,
    premiumMember: true,
    featuredMember: false,
    views: 1250,
    connectionsCount: 85,
    recentlyJoined: false,
    trending: false,
    distanceKm: 1.1,
    products: ['Developer Construction Finance', 'B2B Project Escrow Pipelines', 'Corporate Lease Rental Discounting'],
    services: ['Sovereign fund syndication', 'Financial restructuring', 'Retail home loan campaign ties'],
    brands: ['National Trust Escrow', 'NT Construction Loans'],
    keywords: ['bank', 'finance', 'escrow', 'funding', 'commercial', 'loan', 'mortgage', 'mumbai']
  },
  {
    id: 'ent-6',
    name: 'Finance Express DSA',
    category: 'DSA',
    businessType: 'DSA',
    logoBg: 'bg-rose-600',
    logoText: 'FE',
    description: 'Authorized direct sales agency offering single-window mortgage approvals and developer retail channel integrations. Tie-ups with 20+ premium financial institutions.',
    shortDescription: 'Direct sales agency providing fast home loan retail mortgage deals.',
    rating: 4.5,
    established: '2018',
    experienceYears: 8,
    membership: 'Starter',
    country: 'India',
    state: 'Tamil Nadu',
    city: 'Chennai',
    area: 'Anna Nagar',
    pincode: '600040',
    verified: true,
    gstVerified: true,
    reraVerified: false,
    premiumMember: false,
    featuredMember: false,
    views: 540,
    connectionsCount: 12,
    recentlyJoined: true,
    trending: false,
    distanceKm: 12.3,
    products: ['Express Retail Home Loans', 'Corporate Mortgage Enclosures', 'LAP (Loan Against Property)'],
    services: ['Single-window loan verification', 'Developer channel campaign integrations', 'Credit rating analysis'],
    brands: ['ExpressMortgage', 'DSA-LoanLink'],
    keywords: ['dsa', 'loan', 'mortgage', 'home loan', 'bank ties', 'lap', 'chennai']
  },
  {
    id: 'ent-7',
    name: 'Global Tech Equipment Ltd',
    category: 'Equipment',
    businessType: 'Equipment Rental',
    logoBg: 'bg-cyan-600',
    logoText: 'GT',
    description: 'Heavy duty crane lease, modern concrete batching plant setups, and high-performance excavators with professional on-site engineering crews.',
    shortDescription: 'Heavy tower crane leasing & concrete batching system rental.',
    rating: 4.7,
    established: '2005',
    experienceYears: 21,
    membership: 'Corporate Elite',
    country: 'India',
    state: 'Maharashtra',
    city: 'Pune',
    area: 'Chinchwad',
    pincode: '411019',
    verified: true,
    gstVerified: true,
    reraVerified: false,
    premiumMember: true,
    featuredMember: true,
    views: 710,
    connectionsCount: 38,
    recentlyJoined: false,
    trending: true,
    distanceKm: 5.1,
    products: ['Heavy-Duty Tower Cranes (12T-24T)', 'Concrete Transit Mixers', 'Crawler Excavators'],
    services: ['Machinery mobilization', 'On-site breakdown engineering', 'OEM operator training'],
    brands: ['Liebherr Cranes', 'Schwing Stetter', 'Caterpillar'],
    keywords: ['equipment', 'machinery', 'crane', 'batching plant', 'excavator', 'leasing', 'rental', 'pune']
  },
  {
    id: 'ent-8',
    name: 'Green Brick Logistics',
    category: 'Transport',
    businessType: 'Transport Company',
    logoBg: 'bg-emerald-700',
    logoText: 'GB',
    description: 'Sustainable bulk materials logistics routing and warehousing. Pioneers in low-emission raw material haulage and ready-mix dry mortar transit.',
    shortDescription: 'Bulk materials transportation, eco-friendly hauling & warehousing.',
    rating: 4.8,
    established: '2015',
    experienceYears: 11,
    membership: 'Commercial Pro',
    country: 'India',
    state: 'Gujarat',
    city: 'Ahmedabad',
    area: 'Sarkhej',
    pincode: '382210',
    verified: true,
    gstVerified: true,
    reraVerified: false,
    premiumMember: true,
    featuredMember: false,
    views: 630,
    connectionsCount: 19,
    recentlyJoined: false,
    trending: false,
    distanceKm: 14.2,
    products: ['Carbon-cured dry-mix aggregates', 'Eco-haul transport bins', 'Heavy aggregate storage siloes'],
    services: ['Bulk cement bulk transport', 'Eco-certified transit scheduling', '3PL warehousing solutions'],
    brands: ['GreenTransit', 'AAC-LoadExpress'],
    keywords: ['transport', 'logistics', 'cement', 'hauling', 'aggregates', 'trucking', 'warehouse', 'ahmedabad']
  },
  {
    id: 'ent-9',
    name: 'Aura Interior Studio',
    category: 'Consultants',
    businessType: 'Interior Designer',
    logoBg: 'bg-indigo-500',
    logoText: 'AI',
    description: 'High-concept spatial planning and interior design for luxury residences, commercial workspace models, and premium sales offices.',
    shortDescription: 'High-concept commercial and residential spatial interior designer.',
    rating: 4.9,
    established: '2020',
    experienceYears: 6,
    membership: 'Commercial Pro',
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai',
    area: 'Andheri West',
    pincode: '400053',
    verified: true,
    gstVerified: true,
    reraVerified: false,
    premiumMember: false,
    featuredMember: true,
    views: 450,
    connectionsCount: 15,
    recentlyJoined: true,
    trending: true,
    distanceKm: 3.6,
    products: ['Ergonomic Workspace Layouts', 'Eco-friendly Acoustic Panels', 'Bespoke Executive Furniture'],
    services: ['3D spatial prototyping', 'Turnkey fit-out contracting', 'Material palette curating'],
    brands: ['AuraLux', 'AuraEco-Workplace'],
    keywords: ['interior', 'designer', 'spatial', 'furniture', 'acoustic', 'mumbai', 'andheri']
  },
  {
    id: 'ent-10',
    name: 'Nexus Structural Consultants',
    category: 'Consultants',
    businessType: 'Structural Consultant',
    logoBg: 'bg-teal-600',
    logoText: 'NS',
    description: 'Specialist earthquake-resistant structural analysis, high-rise wind tunnel simulation structural framing, and concrete mix optimizations.',
    shortDescription: 'High-rise structural stability, wind tunnel analysis & seismic design.',
    rating: 4.9,
    established: '2010',
    experienceYears: 16,
    membership: 'Corporate Elite',
    country: 'India',
    state: 'Karnataka',
    city: 'Bangalore',
    area: 'Jayanagar',
    pincode: '560041',
    verified: true,
    gstVerified: true,
    reraVerified: true,
    premiumMember: true,
    featuredMember: true,
    views: 680,
    connectionsCount: 28,
    recentlyJoined: false,
    trending: false,
    distanceKm: 5.4,
    products: ['Seismic Isolation Blueprints', 'Concrete Mix Optimizer Software', 'Pre-stressed Cable Formats'],
    services: ['Wind-tunnel structural audits', 'Seismic code structural retrofitting', 'Foundation load optimization'],
    brands: ['NexusSeismic', 'NexusFrame-Solver'],
    keywords: ['structural', 'consultant', 'seismic', 'earthquake', 'wind', 'stability', 'civil', 'bangalore']
  },
  {
    id: 'ent-11',
    name: 'Matrix MEP Engineers',
    category: 'Consultants',
    businessType: 'MEP Consultant',
    logoBg: 'bg-violet-600',
    logoText: 'MM',
    description: 'Comprehensive mechanical, electrical, plumbing (MEP), and fire fighting system designs for high-occupancy corporate hubs and premium apartments.',
    shortDescription: 'Mechanical, electrical, plumbing & fire fighting engineering.',
    rating: 4.6,
    established: '2014',
    experienceYears: 12,
    membership: 'Starter',
    country: 'India',
    state: 'Telangana',
    city: 'Hyderabad',
    area: 'Madhapur',
    pincode: '500081',
    verified: false,
    gstVerified: true,
    reraVerified: false,
    premiumMember: false,
    featuredMember: false,
    views: 390,
    connectionsCount: 9,
    recentlyJoined: true,
    trending: false,
    distanceKm: 7.9,
    products: ['High-volume HVAC Air handlers', 'Smart Busbar Trunking Systems', 'Sprinkler Flow Indicators'],
    services: ['Energy performance modeling', 'Acoustic plumbing optimization', 'Fire suppression licensing audits'],
    brands: ['MatrixAir-Flow', 'MatrixFire-Shield'],
    keywords: ['mep', 'plumbing', 'electrical', 'hvac', 'fire', 'air conditioning', 'hyderabad']
  },
  {
    id: 'ent-12',
    name: 'TaxShield & Associates',
    category: 'Consultants',
    businessType: 'CA',
    logoBg: 'bg-slate-600',
    logoText: 'TS',
    description: 'B2B financial advisors, GST tax auditors, real estate developer audit experts, and corporate structured tax advisors.',
    shortDescription: 'Developer tax compliance, auditing, GST and corporate CA.',
    rating: 4.8,
    established: '2005',
    experienceYears: 21,
    membership: 'Commercial Pro',
    country: 'India',
    state: 'Delhi',
    city: 'Delhi NCR',
    area: 'Connaught Place',
    pincode: '110001',
    verified: true,
    gstVerified: true,
    reraVerified: false,
    premiumMember: false,
    featuredMember: false,
    views: 480,
    connectionsCount: 14,
    recentlyJoined: false,
    trending: false,
    distanceKm: 9.1,
    products: ['GST Real Estate Audit manuals', 'Escrow Cash Flow Templates', 'Corporate Tax Schedules'],
    services: ['Developer bookkeeping audits', 'Input tax credit recovery checks', 'Lending diligence audits'],
    brands: ['TaxShield-RealEstate', 'AuditVerify'],
    keywords: ['ca', 'tax', 'gst', 'auditor', 'accounting', 'escrow', 'delhi']
  },
  {
    id: 'ent-13',
    name: 'Vanguard Realty Advisors',
    category: 'Consultants',
    businessType: 'Broker',
    logoBg: 'bg-blue-700',
    logoText: 'VR',
    description: 'Corporate real estate brokerage representing grade-A developers for bulk commercial leases, warehouse allocations, and land parcel sales.',
    shortDescription: 'Bulk commercial leasing, land parcels, and warehouse broker.',
    rating: 4.7,
    established: '2013',
    experienceYears: 13,
    membership: 'Commercial Pro',
    country: 'India',
    state: 'Maharashtra',
    city: 'Pune',
    area: 'Kalyani Nagar',
    pincode: '411006',
    verified: true,
    gstVerified: true,
    reraVerified: true,
    premiumMember: true,
    featuredMember: false,
    views: 590,
    connectionsCount: 22,
    recentlyJoined: false,
    trending: true,
    distanceKm: 5.9,
    products: ['Premium IT Park Bare-shell plots', 'Logistics Warehousing Outlays', 'Industrial Zone parcels'],
    services: ['Tenant representation audits', 'Lease restructuring advisory', 'Joint venture underwriting'],
    brands: ['Vanguard-ITLease', 'Vanguard-Landmark'],
    keywords: ['broker', 'realty', 'lease', 'commercial', 'it park', 'land', 'warehouse', 'pune']
  },
  {
    id: 'ent-14',
    name: 'Goldman NBFC Corp',
    category: 'Banks',
    businessType: 'NBFC',
    logoBg: 'bg-amber-700',
    logoText: 'GN',
    description: 'Non-Banking Financial Company focused on custom developer mezzanine debt financing, inventory funding, and last-mile distress funding solutions.',
    shortDescription: 'Mezzanine funding, inventory finance and last-mile funding NBFC.',
    rating: 4.6,
    established: '2011',
    experienceYears: 15,
    membership: 'Corporate Elite',
    country: 'India',
    state: 'Tamil Nadu',
    city: 'Chennai',
    area: 'T Nagar',
    pincode: '600017',
    verified: true,
    gstVerified: true,
    reraVerified: false,
    premiumMember: true,
    featuredMember: true,
    views: 890,
    connectionsCount: 41,
    recentlyJoined: false,
    trending: true,
    distanceKm: 11.2,
    products: ['Mezzanine Developer Debt Pack', 'Inventory bridge funding limits', 'Structured high-yield bonds'],
    services: ['Fast loan sanction processing', 'Distress asset resolution', 'Co-lending syndications'],
    brands: ['Goldman-BridgeFin', 'Goldman-InventoryLink'],
    keywords: ['nbfc', 'mezzanine', 'bridge', 'funding', 'debt', 'finance', 'chennai']
  },
  {
    id: 'ent-15',
    name: 'Hindustan Cement Corp',
    category: 'Material Vendors',
    businessType: 'Manufacturer',
    logoBg: 'bg-emerald-800',
    logoText: 'HC',
    description: 'National manufacturer of sustainable ultra-high-strength fly ash blended OPC/PPC cements. Low carbon footprint certifications.',
    shortDescription: 'Blended PPC/OPC green cement and high-strength concrete manufacturer.',
    rating: 4.8,
    established: '2001',
    experienceYears: 25,
    membership: 'Corporate Elite',
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai',
    area: 'Wagle Estate Thane',
    pincode: '400604',
    verified: true,
    gstVerified: true,
    reraVerified: false,
    premiumMember: true,
    featuredMember: true,
    views: 1310,
    connectionsCount: 66,
    recentlyJoined: false,
    trending: true,
    distanceKm: 8.9,
    products: ['OPC 53 Grade High-Early Concrete Cement', 'PPC EcoShield Low-Carbon Blended Cement', 'Micro-Silica Slag Powders'],
    services: ['Bulk cement factory transport dispatch', 'Mix-design trial evaluations', 'SLA supply contracts'],
    brands: ['Hindustan OPC 53', 'Hindustan EcoShield PPC'],
    keywords: ['vendor', 'materials', 'cement', 'concrete', 'manufacturer', 'bulk', 'opc', 'ppc', 'mumbai']
  },
  {
    id: 'ent-16',
    name: 'Titan Steel Distributors',
    category: 'Material Vendors',
    businessType: 'Distributor',
    logoBg: 'bg-sky-700',
    logoText: 'TS',
    description: 'Authorized distributor of national steel conglomerates, managing bulk warehouse storage and logistics deliveries for Fe550D TMT reinforcement steel bars.',
    shortDescription: 'National bulk steel distributor for reinforcement TMT bars.',
    rating: 4.7,
    established: '2009',
    experienceYears: 17,
    membership: 'Commercial Pro',
    country: 'India',
    state: 'Gujarat',
    city: 'Ahmedabad',
    area: 'GIDC Vatva',
    pincode: '382440',
    verified: true,
    gstVerified: true,
    reraVerified: false,
    premiumMember: false,
    featuredMember: false,
    views: 620,
    connectionsCount: 23,
    recentlyJoined: false,
    trending: false,
    distanceKm: 15.6,
    products: ['Fe550D High-Ductility TMT Bars', 'Structural steel girders and angles', 'High-tensile wire reels'],
    services: ['Coil de-coiling and customized cutting', 'Third-party physical lab test checks', 'Aggregated supply dispatch'],
    brands: ['Tata Tiscon', 'JSW NeoSteel', 'Sail-Max TMT', 'Vizag Steel'],
    keywords: ['vendor', 'materials', 'steel', 'distributor', 'dealer', 'tmt', 'bars', 'ahmedabad']
  },
  {
    id: 'ent-17',
    name: 'Sovereign Insurance Co',
    category: 'Banks',
    businessType: 'Insurance Company',
    logoBg: 'bg-purple-800',
    logoText: 'SI',
    description: 'Specialist real estate asset protection models, contractor general liability protection structures, and builder corporate health coverage policies.',
    shortDescription: 'Contractor liability, building damage, and project risk insurance.',
    rating: 4.6,
    established: '1999',
    experienceYears: 27,
    membership: 'Commercial Pro',
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai',
    area: 'Colaba',
    pincode: '400005',
    verified: true,
    gstVerified: true,
    reraVerified: false,
    premiumMember: false,
    featuredMember: false,
    views: 510,
    connectionsCount: 16,
    recentlyJoined: false,
    trending: false,
    distanceKm: 1.8,
    products: ['CAR (Contractors All Risks) Insurance Package', 'Commercial Structural damage coverage', 'Third-party bodily injury policies'],
    services: ['Fast damage claim assessment', 'Structural site risk audits', 'Corporate bulk pricing brackets'],
    brands: ['Sovereign-CAR', 'Sovereign-LiabilityShield'],
    keywords: ['bank', 'insurance', 'nbfc', 'risk', 'contractors risk', 'liability', 'mumbai']
  },
  {
    id: 'ent-18',
    name: 'Alpha Facility Care',
    category: 'Consultants',
    businessType: 'Facility Management',
    logoBg: 'bg-indigo-700',
    logoText: 'AF',
    description: 'Comprehensive high-efficiency corporate facilities operations, structural HVAC maintenance cycles, and integrated industrial green park security services.',
    shortDescription: 'Commercial IT parks and manufacturing facilities management.',
    rating: 4.7,
    established: '2015',
    experienceYears: 11,
    membership: 'Starter',
    country: 'India',
    state: 'Karnataka',
    city: 'Bangalore',
    area: 'Electronic City',
    pincode: '560100',
    verified: true,
    gstVerified: true,
    reraVerified: false,
    premiumMember: false,
    featuredMember: false,
    views: 410,
    connectionsCount: 8,
    recentlyJoined: false,
    trending: false,
    distanceKm: 6.9,
    products: ['BMS (Building Management System) software', 'Eco-friendly cleaning solvents', 'Integrated surveillance arrays'],
    services: ['Preventative HVAC maintenance', 'Corporate waste audit reports', 'High-security guard dispatching'],
    brands: ['Alpha-CleanShield', 'Alpha-BMS'],
    keywords: ['consultant', 'facility', 'property management', 'maintenance', 'hvac', 'bangalore']
  },
  {
    id: 'ent-19',
    name: 'Prime Property Managers',
    category: 'Consultants',
    businessType: 'Property Management',
    logoBg: 'bg-blue-800',
    logoText: 'PP',
    description: 'Post-handover residential smart complex maintenance, tenant rental collections management, and administrative escrow budgeting audits.',
    shortDescription: 'Post-handover complex management, rentals and association escrows.',
    rating: 4.6,
    established: '2017',
    experienceYears: 9,
    membership: 'Starter',
    country: 'India',
    state: 'Maharashtra',
    city: 'Pune',
    area: 'Viman Nagar',
    pincode: '411014',
    verified: false,
    gstVerified: true,
    reraVerified: false,
    premiumMember: false,
    featuredMember: false,
    views: 320,
    connectionsCount: 5,
    recentlyJoined: true,
    trending: false,
    distanceKm: 7.2,
    products: ['Smart Society App Portal license', 'Automated energy meters', 'RERA bookkeeping kits'],
    services: ['Society association bookkeeping', 'Tenant background lease screening', 'Routine fire drill scheduling'],
    brands: ['Prime-SocietyLink', 'Prime-TenantSafe'],
    keywords: ['consultant', 'property management', 'rentals', 'society', 'escrow', 'pune']
  },
  {
    id: 'ent-20',
    name: 'Apex Recruiters',
    category: 'Recruitment',
    businessType: 'Recruitment Agency',
    logoBg: 'bg-purple-700',
    logoText: 'AR',
    description: 'Niche real estate talent recruitment agency, sourcing veteran structural engineers, project managers, legal liaison heads, and RERA compliance specialists.',
    shortDescription: 'Civil engineering, project management and RERA head recruiters.',
    rating: 4.8,
    established: '2012',
    experienceYears: 14,
    membership: 'Commercial Pro',
    country: 'India',
    state: 'Telangana',
    city: 'Hyderabad',
    area: 'Banjara Hills',
    pincode: '500034',
    verified: true,
    gstVerified: true,
    reraVerified: false,
    premiumMember: false,
    featuredMember: false,
    views: 520,
    connectionsCount: 17,
    recentlyJoined: false,
    trending: false,
    distanceKm: 4.1,
    products: ['Pre-vetted structural engineer directory', 'Executive placement profiles', 'Contract staff payroll matrices'],
    services: ['Senior leadership talent search', 'Contract construction crew allocation', 'Dynamic skill tests'],
    brands: ['ApexTalent-RealEstate', 'ApexContractors'],
    keywords: ['recruitment', 'jobs', 'careers', 'staffing', 'engineers', 'hr', 'hyderabad']
  },
  {
    id: 'ent-21',
    name: 'AdVantage Real Estate Marketing',
    category: 'Consultants',
    businessType: 'Marketing Agency',
    logoBg: 'bg-teal-700',
    logoText: 'AM',
    description: '3D hyper-realistic layout visualizers, interactive walkthrough design and focused digital lead generation campaigns for premium builders.',
    shortDescription: '3D walkthrough visualizers & developer digital lead agency.',
    rating: 4.7,
    established: '2016',
    experienceYears: 10,
    membership: 'Commercial Pro',
    country: 'India',
    state: 'Delhi',
    city: 'Delhi NCR',
    area: 'Saket',
    pincode: '110017',
    verified: true,
    gstVerified: true,
    reraVerified: false,
    premiumMember: false,
    featuredMember: false,
    views: 460,
    connectionsCount: 13,
    recentlyJoined: false,
    trending: false,
    distanceKm: 10.5,
    products: ['Hyper-Realistic 3D CAD Walkthroughs', 'Interactive AR Project Maps', 'Developer Lead generation bots'],
    services: ['Digital launch marketing campaigns', 'RERA-approved pitch-deck design', 'Corporate brand identity overhauls'],
    brands: ['AdVantage-3DWalk', 'AdVantage-Leads'],
    keywords: ['marketing', 'advertising', '3d walkthrough', 'leads', 'brand', 'delhi']
  },
  {
    id: 'ent-22',
    name: 'PropTech Systems',
    category: 'Consultants',
    businessType: 'Software Company',
    logoBg: 'bg-indigo-800',
    logoText: 'PT',
    description: 'Enterprise ERP software suites built for real estate. Live tracking of material inventory pipelines, construction millstones, and sales escrows.',
    shortDescription: 'Enterprise real-estate ERP, material supply & billing software.',
    rating: 4.9,
    established: '2018',
    experienceYears: 8,
    membership: 'Commercial Pro',
    country: 'India',
    state: 'Karnataka',
    city: 'Bangalore',
    area: 'HSR Layout',
    pincode: '560102',
    verified: true,
    gstVerified: true,
    reraVerified: false,
    premiumMember: true,
    featuredMember: true,
    views: 740,
    connectionsCount: 31,
    recentlyJoined: true,
    trending: true,
    distanceKm: 3.9,
    products: ['PropTech ERP Enterprise Licence', 'PropTech BillMaster Software', 'PropTech SiteTrack Mobile App'],
    services: ['ERP database setup integration', 'On-site technical training audits', 'Cloud compliance updates'],
    brands: ['PropTech-ERP', 'PropTech-AuditSafe'],
    keywords: ['software', 'erp', 'proptech', 'billing', 'inventory', 'app', 'bangalore']
  },
  {
    id: 'ent-23',
    name: 'Maharashtra Industrial Dev Authority',
    category: 'Developers',
    businessType: 'Government Authority',
    logoBg: 'bg-slate-800',
    logoText: 'MA',
    description: 'Sovereign industrial zone developer, planning state-of-the-art warehouses, special economic tech corridors, and heavy manufacture grids.',
    shortDescription: 'State industrial economic tech corridors development authority.',
    rating: 4.8,
    established: '1962',
    experienceYears: 64,
    membership: 'Corporate Elite',
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai',
    area: 'Andheri East',
    pincode: '400093',
    verified: true,
    gstVerified: false,
    reraVerified: false,
    premiumMember: true,
    featuredMember: true,
    views: 1980,
    connectionsCount: 110,
    recentlyJoined: false,
    trending: false,
    distanceKm: 4.2,
    products: ['Industrial Lease Plot allocations', 'Special Economic Zone grid space', 'Heavy concrete warehouse floors'],
    services: ['Sovereign single-window clearances', 'Regional highway water line ties', 'Industrial energy allocations'],
    brands: ['MIDC industrial grid', 'MIDC Smart-SEZ'],
    keywords: ['government', 'authority', 'midc', 'industrial', 'land allocation', 'clearance', 'mumbai']
  },
  {
    id: 'ent-24',
    name: 'Supreme Concrete Products',
    category: 'Material Vendors',
    businessType: 'Manufacturer',
    logoBg: 'bg-emerald-900',
    logoText: 'SC',
    description: 'ISO-certified manufacturing plants specializing in precast reinforced stormwater drains, concrete flyover precast girders, and pavement interlocks.',
    shortDescription: 'Stormwater precast pipes, pavement tiles & concrete girders.',
    rating: 4.7,
    established: '2007',
    experienceYears: 19,
    membership: 'Commercial Pro',
    country: 'India',
    state: 'Tamil Nadu',
    city: 'Chennai',
    area: 'Ambattur GIDC',
    pincode: '600058',
    verified: true,
    gstVerified: true,
    reraVerified: false,
    premiumMember: false,
    featuredMember: false,
    views: 580,
    connectionsCount: 18,
    recentlyJoined: false,
    trending: false,
    distanceKm: 13.5,
    products: ['Stormwater Precast pipes (NP3/NP4)', 'Prestressed concrete girder slabs', 'Heavy duty industrial block pavements'],
    services: ['High-stress aggregate physical test evaluations', 'Hydraulic load certification audits', 'Contract site fittings'],
    brands: ['SupremePreCast', 'SupremePaveTiles'],
    keywords: ['vendor', 'materials', 'concrete', 'precast', 'manufacturer', 'pipes', 'pavements', 'chennai']
  },
  {
    id: 'ent-25',
    name: 'Zenith Safety Audits',
    category: 'Consultants',
    businessType: 'Technical Consultant',
    logoBg: 'bg-amber-800',
    logoText: 'ZS',
    description: 'Expert third-party structural fire-safety mapping, high-rise scaffold stability audits, and OHSAS compliance consulting for commercial builders.',
    shortDescription: 'Industrial site fire-safety, scaffold audits & OHSAS consulting.',
    rating: 4.9,
    established: '2017',
    experienceYears: 9,
    membership: 'Starter',
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai',
    area: 'Powai Hiranandani',
    pincode: '400076',
    verified: true,
    gstVerified: true,
    reraVerified: false,
    premiumMember: false,
    featuredMember: true,
    views: 440,
    connectionsCount: 11,
    recentlyJoined: true,
    trending: true,
    distanceKm: 2.9,
    products: ['Fire Escape Routing Map sets', 'Structural load testing matrices', 'OHSAS safety manuals'],
    services: ['Live site safety drill planning', 'Scaffolding load physical test inspections', 'Lending safety audits'],
    brands: ['ZenithSafe', 'ZenithOHSAS'],
    keywords: ['consultant', 'safety', 'fire', 'scaffold', 'audit', 'compliance', 'mumbai', 'powai']
  }
];

export function augmentCompany(comp: Company) {
  // Registered companies show only what they entered themselves; nothing is invented for them.
  if (comp.registered) return comp;

  const gradients = [
    'from-indigo-950 via-slate-900 to-slate-950',
    'from-emerald-950 via-slate-900 to-slate-950',
    'from-purple-950 via-slate-900 to-slate-950',
    'from-sky-950 via-slate-900 to-slate-950',
    'from-teal-950 via-slate-900 to-slate-950',
    'from-rose-950 via-slate-900 to-slate-950',
    'from-amber-950 via-slate-900 to-slate-950'
  ];
  const hash = comp.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const coverGradient = gradients[hash % gradients.length];
  
  let availability = 'Available Now';
  if (comp.category === 'Material Vendors') {
    availability = 'In Stock / Immediate Dispatch';
  } else if (comp.category === 'Equipment') {
    availability = 'Immediate Leasing Available';
  } else if (comp.category === 'Developers' || comp.category === 'Builders') {
    availability = 'Live Projects Under Escrow';
  } else if (comp.category === 'Banks' || comp.category === 'DSA') {
    availability = 'Pre-approvals in 48 Hours';
  } else {
    availability = 'SLA Consultations Open';
  }

  let projects: string[] = [];
  if (comp.category === 'Developers' || comp.category === 'Builders') {
    projects = [`${comp.name.split(' ')[0]} Smart Heights`, `${comp.name.split(' ')[0]} Eco-Meadows`, 'Imperial Trade Center'];
  } else if (comp.category === 'Contractors') {
    projects = ['Metro Line 3 Civil Works', 'Elevated Highway Precast Sector 4', 'Grand IT Hub Structural Shell'];
  } else if (comp.category === 'Material Vendors') {
    projects = ['Bulk delivery to Mumbai Heights', 'Precast Stormwater Lines Noida', 'Smart City Base Materials Supply'];
  } else if (comp.category === 'Consultants') {
    projects = ['BIM Level 3 Architectural Layouts', 'Highrise Wind Tunnel Vetting', 'Corporate HQ Interior Fit-out'];
  } else {
    projects = ['Commercial Escrow Restructuring', 'Fintech Channel Integration campaign', 'B2B Procurement syndication'];
  }

  const feedPosts = [
    `Announced a new strategic collaboration to provide compliance-approved B2B solutions for regional infrastructure.`,
    `Successfully completed quarterly audit filings, validating full transparency and adherence to RERA standards.`,
    `We have updated our catalog with premium, sustainable additions designed for modern green-certified developments.`
  ];

  let rfqs: string[] = [];
  if (comp.category === 'Material Vendors') {
    rfqs = ['Supply of Fe550D TMT reinforcement bars (80 Tons)', 'Procurement of 500 Bags OPC 53 Grade Cement'];
  } else if (comp.category === 'Equipment') {
    rfqs = ['Leasing request for 12T Tower Cranes (6 months)', 'Setup of high-performance concrete batching plants'];
  } else {
    rfqs = ['Architectural design vetting for 30-story commercial tower', 'Structural soil bearing capacity physical analysis'];
  }

  const opportunities = [
    `Joint Venture opportunity for a 10-acre smart development in high-growth corridor.`,
    `Wholesale bulk pricing agreement available for registered corporate procurement officers.`
  ];

  return {
    ...comp,
    coverGradient,
    availability,
    projects,
    feedPosts,
    rfqs,
    opportunities,
    phone: '+91 98200 12345',
    email: `procurement@${comp.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    employeeCount: hash % 2 === 0 ? '150 - 500 Employees' : '50 - 150 Employees'
  };
}

interface BusinessDirectoryProps {
  onLogTriggered: (action: string, entity: string, entityId: string, status: 'SUCCESS' | 'FAILURE' | 'WARNING', details: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  connectionsSent: string[];
  savedBusinesses: string[];
  favoriteCompanies: string[];
  onToggleSave: (id: string, name: string) => void;
  onToggleFavorite: (id: string, name: string) => void;
  onConnectRequest: (id: string, name: string) => void;
  onViewBusinessProfile: (id: string) => void;
  // Companies registered on the platform, and whether the bundled sample companies are shown beside them.
  registeredCompanies: Company[];
  showSampleCompanies: boolean;
  
  // Outer search syncing
  outerSearchTerm?: string;
  outerCategory?: string;
  outerLocation?: string;
}

export default function BusinessDirectory({
  onLogTriggered,
  showToast,
  connectionsSent,
  savedBusinesses,
  favoriteCompanies,
  onToggleSave,
  onToggleFavorite,
  onConnectRequest,
  onViewBusinessProfile,
  registeredCompanies,
  showSampleCompanies,
  outerSearchTerm,
  outerCategory,
  outerLocation
}: BusinessDirectoryProps) {

  const allCompanies = useMemo(
    () => [...registeredCompanies, ...(showSampleCompanies ? SEED_COMPANIES : [])],
    [registeredCompanies, showSampleCompanies]
  );

  // Advanced Search States
  const [searchName, setSearchName] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [searchService, setSearchService] = useState('');
  const [searchBrand, setSearchBrand] = useState('');
  const [searchCategory, setSearchCategory] = useState('All');
  const [searchCity, setSearchCity] = useState('All');
  const [searchState, setSearchState] = useState('All');
  const [searchArea, setSearchArea] = useState('');
  const [searchPincode, setSearchPincode] = useState('');
  const [searchKeywords, setSearchKeywords] = useState('');

  // Enhanced visual states
  const [recentSearches, setRecentSearches] = useState<string[]>(['Apex', 'Ready-Mix Concrete', 'Legal RERA', 'Tower Cranes']);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState('All'); // Immediate, Live Projects, Consultation Open, All
  const [activePreviewCompany, setActivePreviewCompany] = useState<Company | null>(null);
  const [previewTab, setPreviewTab] = useState('overview');
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [enquiryType, setEnquiryType] = useState('Quotation Request');

  // Tab Loading simulator for micro interactions
  useEffect(() => {
    setIsTabLoading(true);
    const timer = setTimeout(() => {
      setIsTabLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchCategory, searchCity, searchState, selectedAvailability]);

  // Category Metadata with icons & description for the Popular Categories experience
  const categoryMetadata = useMemo(() => [
    { name: 'Builders', icon: Landmark, count: allCompanies.filter(c => c.category === 'Builders').length, desc: 'Civil construction, superstructures, and smart building envelopes.', brands: 'L&T, Shapoorji, Tata' },
    { name: 'Developers', icon: Building2, count: allCompanies.filter(c => c.category === 'Developers').length, desc: 'Sustainable luxurious skyscrapers, IT parks, and integrated townships.', brands: 'Apex, Lodha, DLF, Godrej' },
    { name: 'Contractors', icon: HardHat, count: allCompanies.filter(c => c.category === 'Contractors').length, desc: 'Civil engineering, pilling infrastructure, metro transit grids.', brands: 'BuildCorp, NCC, Afcons' },
    { name: 'Material Vendors', icon: Package, count: allCompanies.filter(c => c.category === 'Material Vendors').length, desc: 'Ready-mix concrete, reinforcing high-ductility TMT bars, blocks.', brands: 'Ultratech, Tata Steel, JSW' },
    { name: 'Banks', icon: Landmark, count: allCompanies.filter(c => c.category === 'Banks').length, desc: 'Developer project financing, escrow and wholesale mortgage bank.', brands: 'SBI, HDFC, National Trust' },
    { name: 'Consultants', icon: FileText, count: allCompanies.filter(c => c.category === 'Consultants').length, desc: 'Structural wind-tunnel analysis, RERA legal compliance, interior design.', brands: 'Nexus, Aura, TaxShield' },
    { name: 'DSA', icon: Users, count: allCompanies.filter(c => c.category === 'DSA').length, desc: 'Authorized direct sales channel retail home loan approvals.', brands: 'ExpressMortgage, LoanLink' },
    { name: 'Recruitment', icon: Users, count: allCompanies.filter(c => c.category === 'Recruitment').length, desc: 'Niche civil engineering, project management, liaison sourcing.', brands: 'Apex Recruiters, HR Pro' },
    { name: 'Equipment', icon: Truck, count: allCompanies.filter(c => c.category === 'Equipment').length, desc: 'Heavy duty tower crane leases, batching plants, crawler excavators.', brands: 'Liebherr, Caterpillar, Schwing' },
    { name: 'Transport', icon: Compass, count: allCompanies.filter(c => c.category === 'Transport').length, desc: 'Raw material haulage logistics and 3PL aggregate dry mortar transit.', brands: 'Green Brick, LoadExpress' }
  ], []);

  // Outer search syncing effects
  useEffect(() => {
    if (outerSearchTerm !== undefined) {
      setSearchName(outerSearchTerm);
    }
  }, [outerSearchTerm]);

  useEffect(() => {
    if (outerCategory !== undefined) {
      if (outerCategory === 'DSAs') {
        setSearchCategory('DSA');
      } else if (outerCategory === 'Vendors' || outerCategory === 'Materials') {
        setSearchCategory('Material Vendors');
      } else if (outerCategory === 'All') {
        setSearchCategory('All');
      } else {
        setSearchCategory(outerCategory);
      }
    }
  }, [outerCategory]);

  useEffect(() => {
    if (outerLocation !== undefined) {
      setSearchCity(outerLocation);
    }
  }, [outerLocation]);

  // Collapsible advanced filters state
  const [showFilters, setShowFilters] = useState(false);

  // Filters state
  const [selectedBusinessType, setSelectedBusinessType] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [filterState, setFilterState] = useState('All');
  const [filterCity, setFilterCity] = useState('All');
  const [filterArea, setFilterArea] = useState('');
  const [filterPincode, setFilterPincode] = useState('');
  
  // Verification filters
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterGst, setFilterGst] = useState(false);
  const [filterRera, setFilterRera] = useState(false);
  const [filterPremium, setFilterPremium] = useState(false);
  const [filterFeatured, setFilterFeatured] = useState(false);

  // Experience & Membership filters
  const [selectedExperience, setSelectedExperience] = useState('All'); // All, 0-2, 2-5, 5-10, 10+
  const [selectedMembership, setSelectedMembership] = useState('All');

  // Featured directory section state
  const [activeSection, setActiveSection] = useState<'All' | 'Featured' | 'Recently Joined' | 'Highest Rated' | 'Most Viewed' | 'Most Connected' | 'Premium' | 'Trending' | 'Nearby'>('All');

  // Categories list quick actions
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');

  // Comparison list state (holds ids of up to 3 companies)
  const [compareList, setCompareList] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Recently Viewed Companies (stored in React state)
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  // Share overlay states
  const [sharingCompany, setSharingCompany] = useState<Company | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const itemsPerPage = 6;

  // Track coordinates for nearby (simulated distance center)
  const [userLocationDemo, setUserLocationDemo] = useState(true);

  // Reset all filters and search parameters
  const handleResetFilters = () => {
    setSearchName('');
    setSearchProduct('');
    setSearchService('');
    setSearchBrand('');
    setSearchCategory('All');
    setSearchCity('All');
    setSearchState('All');
    setSearchArea('');
    setSearchPincode('');
    setSearchKeywords('');

    setSelectedBusinessType('All');
    setSelectedCountry('All');
    setFilterState('All');
    setFilterCity('All');
    setFilterArea('');
    setFilterPincode('');
    
    setFilterVerified(false);
    setFilterGst(false);
    setFilterRera(false);
    setFilterPremium(false);
    setFilterFeatured(false);

    setSelectedExperience('All');
    setSelectedMembership('All');

    setActiveSection('All');
    setActiveCategoryFilter('All');
    setCurrentPage(1);

    onLogTriggered('B2B_DIRECTORY_FILTERS_RESET', 'directory', 'all', 'SUCCESS', 'Filters reset: Reset all search variables, state filters, and category selections.');
    showToast('All search and directory filters cleared successfully.', 'info');
  };

  // Compute states, cities, types from database for filters dropdown
  const uniqueStates = useMemo(() => {
    return Array.from(new Set(allCompanies.map(c => c.state)));
  }, [allCompanies]);

  const uniqueCities = useMemo(() => {
    return Array.from(new Set(allCompanies.map(c => c.city)));
  }, [allCompanies]);

  const uniqueBusinessTypes = useMemo(() => {
    return Array.from(new Set(allCompanies.map(c => c.businessType)));
  }, [allCompanies]);

  // Main filter function
  const filteredCompanies = useMemo(() => {
    return allCompanies.filter(comp => {
      // 1. Text Search matching multi-fields
      if (searchName && !comp.name.toLowerCase().includes(searchName.toLowerCase())) return false;
      if (searchProduct && !comp.products.some(p => p.toLowerCase().includes(searchProduct.toLowerCase()))) return false;
      if (searchService && !comp.services.some(s => s.toLowerCase().includes(searchService.toLowerCase()))) return false;
      if (searchBrand && !comp.brands.some(b => b.toLowerCase().includes(searchBrand.toLowerCase()))) return false;
      
      if (searchCategory !== 'All' && comp.category !== searchCategory) return false;
      if (searchCity !== 'All' && comp.city !== searchCity) return false;
      if (searchState !== 'All' && comp.state !== searchState) return false;
      if (searchArea && !comp.area.toLowerCase().includes(searchArea.toLowerCase())) return false;
      if (searchPincode && comp.pincode !== searchPincode) return false;
      
      if (searchKeywords) {
        const query = searchKeywords.toLowerCase();
        const matchesKeyword = comp.keywords.some(k => k.includes(query)) ||
                               comp.name.toLowerCase().includes(query) ||
                               comp.description.toLowerCase().includes(query);
        if (!matchesKeyword) return false;
      }

      // 2. Business Type Filter
      if (selectedBusinessType !== 'All' && comp.businessType !== selectedBusinessType) return false;

      // 3. Location Filters (Sidebar)
      if (selectedCountry !== 'All' && comp.country !== selectedCountry) return false;
      if (filterState !== 'All' && comp.state !== filterState) return false;
      if (filterCity !== 'All' && comp.city !== filterCity) return false;
      if (filterArea && !comp.area.toLowerCase().includes(filterArea.toLowerCase())) return false;
      if (filterPincode && comp.pincode !== filterPincode) return false;

      // 4. Verification Badges
      if (filterVerified && !comp.verified) return false;
      if (filterGst && !comp.gstVerified) return false;
      if (filterRera && !comp.reraVerified) return false;
      if (filterPremium && !comp.premiumMember) return false;
      if (filterFeatured && !comp.featuredMember) return false;

      // 5. Experience Filter
      if (selectedExperience !== 'All') {
        if (selectedExperience === '0-2 Years' && comp.experienceYears > 2) return false;
        if (selectedExperience === '2-5 Years' && (comp.experienceYears <= 2 || comp.experienceYears > 5)) return false;
        if (selectedExperience === '5-10 Years' && (comp.experienceYears <= 5 || comp.experienceYears > 10)) return false;
        if (selectedExperience === '10+ Years' && comp.experienceYears <= 10) return false;
      }

      // 6. Membership Filter
      if (selectedMembership !== 'All' && comp.membership !== selectedMembership) return false;

      // 7. Category Quick filter list (standard)
      if (activeCategoryFilter !== 'All' && comp.category !== activeCategoryFilter) return false;

      // 8. Featured Directory Sections filter
      if (activeSection !== 'All') {
        if (activeSection === 'Featured' && !comp.featuredMember) return false;
        if (activeSection === 'Recently Joined' && !comp.recentlyJoined) return false;
        if (activeSection === 'Highest Rated' && comp.rating < 4.8) return false;
        if (activeSection === 'Most Viewed' && comp.views < 1000) return false;
        if (activeSection === 'Most Connected' && comp.connectionsCount < 30) return false;
        if (activeSection === 'Premium' && !comp.premiumMember) return false;
        if (activeSection === 'Trending' && !comp.trending) return false;
        if (activeSection === 'Nearby' && (comp.distanceKm == null || comp.distanceKm > 5.0)) return false; // Simulated 5km boundary
      }

      // 9. Availability Filter
      if (selectedAvailability !== 'All') {
        const aug = augmentCompany(comp);
        if (selectedAvailability === 'Immediate' && !aug.availability.toLowerCase().includes('immediate') && !aug.availability.toLowerCase().includes('stock')) return false;
        if (selectedAvailability === 'Live Projects' && !aug.availability.toLowerCase().includes('live')) return false;
        if (selectedAvailability === 'Consultation Open' && !aug.availability.toLowerCase().includes('consultation') && !aug.availability.toLowerCase().includes('sla')) return false;
      }

      return true;
    });
  }, [
    allCompanies,
    searchName, searchProduct, searchService, searchBrand, searchCategory, searchCity, searchState, searchArea, searchPincode, searchKeywords,
    selectedBusinessType, selectedCountry, filterState, filterCity, filterArea, filterPincode,
    filterVerified, filterGst, filterRera, filterPremium, filterFeatured,
    selectedExperience, selectedMembership,
    activeCategoryFilter,
    activeSection,
    selectedAvailability
  ]);

  // Handle pagination list segmenting
  const displayedCompanies = useMemo(() => {
    return filteredCompanies.slice(0, currentPage * itemsPerPage);
  }, [filteredCompanies, currentPage]);

  const augmentedDisplayedCompanies = useMemo(() => {
    return displayedCompanies.map(c => augmentCompany(c));
  }, [displayedCompanies]);

  const hasMore = filteredCompanies.length > displayedCompanies.length;

  // Execute pagination load simulation (Rule lazy loading)
  const handleLoadMore = () => {
    setLoadingMore(true);
    onLogTriggered('B2B_DIRECTORY_LAZY_LOADING_TRIGGERED', 'directory', `page-${currentPage + 1}`, 'SUCCESS', `Performance: Initiating lazy loading segments for matched business entries. Matched size: ${filteredCompanies.length}`);
    setTimeout(() => {
      setCurrentPage(prev => prev + 1);
      setLoadingMore(false);
      showToast('Loaded next catalog segment of corporate profiles.', 'success');
    }, 600);
  };

  // Reset page whenever filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchName, searchProduct, searchService, searchBrand, searchCategory, searchCity, searchState, searchArea, searchPincode, searchKeywords,
    selectedBusinessType, selectedCountry, filterState, filterCity, filterArea, filterPincode,
    filterVerified, filterGst, filterRera, filterPremium, filterFeatured,
    selectedExperience, selectedMembership,
    activeCategoryFilter,
    activeSection
  ]);

  // Handle comparing items
  const handleToggleCompare = (id: string, name: string) => {
    setCompareList(prev => {
      if (prev.includes(id)) {
        showToast(`Removed ${name} from comparison registry.`, 'info');
        return prev.filter(item => item !== id);
      }
      if (prev.length >= 3) {
        showToast('You can compare a maximum of 3 companies at a time.', 'error');
        return prev;
      }
      showToast(`Added ${name} to comparison roster.`, 'success');
      onLogTriggered('B2B_COMPARE_ITEM_ADDED', 'directory', id, 'SUCCESS', `Technical: Added "${name}" to side-by-side comparison matrix.`);
      return [...prev, id];
    });
  };

  const comparedCompanies = useMemo(() => {
    return allCompanies.filter(c => compareList.includes(c.id));
  }, [compareList, allCompanies]);

  // Track profile views for "Recently Viewed"
  const handleViewProfile = (comp: Company) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(id => id !== comp.id);
      return [comp.id, ...filtered].slice(0, 5); // Keep up to 5 recently viewed
    });
    onViewBusinessProfile(comp.id);
  };

  // Sharing actions
  const handleCopyLink = (comp: Company) => {
    const url = `https://realtyconnect.in/directory/profile/${comp.id}`;
    navigator.clipboard.writeText(url);
    showToast(`Corporate web URL for ${comp.name} copied to clipboard!`, 'success');
    onLogTriggered('B2B_PROFILE_LINK_COPIED', 'companies', comp.id, 'SUCCESS', `Security: Copied cryptographic direct link to clipboard for entity: ${comp.name}.`);
  };

  const handlePrintProfile = (comp: Company) => {
    onLogTriggered('B2B_PROFILE_PRINT_TRIGGERED', 'companies', comp.id, 'SUCCESS', `Compliance: Captured system request to generate audited print layout for ${comp.name}.`);
    showToast(`Print layout triggered for ${comp.name}. Formatting PDF brochure...`, 'info');
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Category Quick-listings */}
      <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h4 className="font-display font-extrabold text-xs text-slate-100 uppercase tracking-widest flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              Category-Specific Directories
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Explore curated corporate portfolios segmented by real-estate specialization</p>
          </div>
          <span className="text-[10px] text-slate-500 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-850">Instant Taxonomy Filtering</span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5 text-center animate-fade-in" id="category-listing-grid">
          {[
            { name: 'All', code: 'ALL', count: allCompanies.length, icon: Layers },
            { name: 'Builders', code: 'BLD', count: allCompanies.filter(c => c.category === 'Builders').length, icon: Landmark },
            { name: 'Developers', code: 'DEV', count: allCompanies.filter(c => c.category === 'Developers').length, icon: Building2 },
            { name: 'Contractors', code: 'CON', count: allCompanies.filter(c => c.category === 'Contractors').length, icon: HardHat },
            { name: 'Material Vendors', code: 'VND', count: allCompanies.filter(c => c.category === 'Material Vendors').length, icon: Package },
            { name: 'Banks', code: 'BNK', count: allCompanies.filter(c => c.category === 'Banks').length, icon: Landmark },
            { name: 'Consultants', code: 'CNS', count: allCompanies.filter(c => c.category === 'Consultants').length, icon: FileText },
            { name: 'DSA', code: 'DSA', count: allCompanies.filter(c => c.category === 'DSA').length, icon: Users },
            { name: 'Recruitment', code: 'REC', count: allCompanies.filter(c => c.category === 'Recruitment').length, icon: Users },
            { name: 'Equipment', code: 'EQP', count: allCompanies.filter(c => c.category === 'Equipment').length, icon: Truck }
          ].map(cat => {
            const active = activeCategoryFilter === cat.name;
            const IconComponent = cat.icon;
            return (
              <button
                key={cat.code}
                onClick={() => {
                  setActiveCategoryFilter(cat.name);
                  onLogTriggered('B2B_DIRECTORY_CATEGORY_SELECTED', 'directory', cat.code, 'SUCCESS', `Directory: Swapped taxonomy view filter to: ${cat.name}. matched count: ${cat.count}`);
                }}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between h-24 ${
                  active 
                    ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 text-slate-950 border-emerald-400 font-bold shadow-lg shadow-emerald-500/10' 
                    : 'bg-slate-950 hover:bg-slate-900 border-slate-850 hover:border-slate-800 text-slate-300'
                }`}
              >
                <div className={`p-1.5 rounded-lg mb-1 ${active ? 'bg-slate-950/20' : 'bg-slate-900'}`}>
                  <IconComponent className={`w-4 h-4 ${active ? 'text-slate-950' : 'text-emerald-400'}`} />
                </div>
                <div>
                  <span className="text-[10px] font-semibold truncate block w-full leading-tight">{cat.name}</span>
                  <span className={`text-[9px] font-mono leading-none ${active ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>{cat.count} listings</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* CURATED CATEGORY PORTAL HEADER (CATEGORY EXPERIENCE) */}
        {activeCategoryFilter !== 'All' && (() => {
          const matchedMeta = categoryMetadata.find(m => m.name === activeCategoryFilter);
          return (
            <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-950 border border-slate-850 rounded-xl p-5 relative overflow-hidden animate-fade-in mt-4">
              <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/5 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none" />
              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 z-10">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400" /> Curated Category Channel
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">• {allCompanies.filter(c => c.category === activeCategoryFilter && c.verified).length} Verified Operators</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 font-display">
                    {activeCategoryFilter} Portal
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {matchedMeta?.desc || 'Procure direct commercial products, structural materials, and technical consultancy services.'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[10px] text-slate-500 font-mono">Popular Brands:</span>
                    {(matchedMeta?.brands || 'Tata Steel, JSW, Ultratech').split(', ').map(br => (
                      <span key={br} className="bg-slate-950/60 border border-slate-850 px-2 py-0.5 rounded text-[10px] text-slate-300 font-medium">
                        {br}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-850 rounded-xl p-4 text-center min-w-[140px] flex flex-col justify-center">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Total Trade Volume</span>
                  <span className="text-xl font-bold text-emerald-400 font-mono mt-0.5">₹24.5 Cr+</span>
                  <span className="text-[9px] text-slate-500 font-mono mt-0.5">Managed under ESCROW</span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Advanced Unified Multi-field Search Bar */}
      <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-emerald-400" />
            <div>
              <h4 className="font-bold text-sm text-white">Enterprise Search & Discovery</h4>
              <p className="text-[11px] text-slate-500">Cross-reference Company, Product, Service, Brand and location properties simultaneously.</p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold font-mono flex items-center gap-1.5 border transition-all ${
              showFilters 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}</span>
            <span className="bg-slate-900 px-1.5 rounded text-[10px] text-slate-500 font-bold">12</span>
          </button>
        </div>

        {/* 10-Field Advanced Search Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5" id="advanced-search-grid">
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Company Name</label>
            <div className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 flex items-center text-slate-200 relative">
              <input
                type="text"
                placeholder="e.g. Apex"
                value={searchName}
                onChange={(e) => {
                  setSearchName(e.target.value);
                  setShowSearchSuggestions(true);
                }}
                onFocus={() => setShowSearchSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                className="w-full bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-650"
              />
              
              {/* Search suggestions panel popup */}
              {showSearchSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-2xl z-30 space-y-3 text-left w-64 max-h-72 overflow-y-auto">
                  <div>
                    <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">Recent Searches</span>
                    <div className="flex flex-wrap gap-1">
                      {recentSearches.map(term => (
                        <button
                          key={term}
                          type="button"
                          onMouseDown={() => {
                            setSearchName(term);
                            setShowSearchSuggestions(false);
                          }}
                          className="bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded px-1.5 py-0.5 text-[9px] font-mono cursor-pointer transition-all"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">Popular Searches</span>
                    <div className="flex flex-wrap gap-1">
                      {['Legal RERA', 'Structural Design', 'Sovereign Bank'].map(term => (
                        <button
                          key={term}
                          type="button"
                          onMouseDown={() => {
                            setSearchName(term);
                            setShowSearchSuggestions(false);
                          }}
                          className="bg-slate-950 hover:bg-slate-850 border border-slate-800 text-emerald-400 rounded px-1.5 py-0.5 text-[9px] font-mono cursor-pointer transition-all"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Suggested Companies</span>
                    <div className="space-y-1">
                      {allCompanies.filter(c => c.name.toLowerCase().includes(searchName.toLowerCase())).slice(0, 4).map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onMouseDown={() => {
                            setSearchName(c.name);
                            setShowSearchSuggestions(false);
                          }}
                          className="w-full text-left bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-slate-800 rounded px-2 py-1 text-[10px] text-slate-300 flex items-center justify-between cursor-pointer"
                        >
                          <span className="truncate font-semibold">{c.name}</span>
                          <span className="text-[8px] text-slate-500 font-mono">{c.category}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Product Name</label>
            <div className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 flex items-center text-slate-200">
              <input
                type="text"
                placeholder="e.g. Concrete, Steel"
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-650"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Service Name</label>
            <div className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 flex items-center text-slate-200">
              <input
                type="text"
                placeholder="e.g. Feasibility, Design"
                value={searchService}
                onChange={(e) => setSearchService(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-650"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Brand Name</label>
            <div className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 flex items-center text-slate-200">
              <input
                type="text"
                placeholder="e.g. Ultratech, Tata"
                value={searchBrand}
                onChange={(e) => setSearchBrand(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-650"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Taxonomy Category</label>
            <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 outline-none font-mono"
            >
              <option value="All">All Categories</option>
              <option value="Builders">Builders</option>
              <option value="Developers">Developers</option>
              <option value="Contractors">Contractors</option>
              <option value="Material Vendors">Material Vendors</option>
              <option value="Banks">Banks</option>
              <option value="Consultants">Consultants</option>
              <option value="DSA">DSA</option>
              <option value="Recruitment">Recruitment</option>
              <option value="Equipment">Equipment</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">State</label>
            <select
              value={searchState}
              onChange={(e) => setSearchState(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 outline-none font-mono"
            >
              <option value="All">All States</option>
              {uniqueStates.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">City</label>
            <select
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 outline-none font-mono"
            >
              <option value="All">All Cities</option>
              {uniqueCities.map(ct => <option key={ct} value={ct}>{ct}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Area / Locality</label>
            <div className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 flex items-center text-slate-200">
              <input
                type="text"
                placeholder="e.g. BKC, Whitefield"
                value={searchArea}
                onChange={(e) => setSearchArea(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-650"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Pincode</label>
            <div className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 flex items-center text-slate-200">
              <input
                type="text"
                placeholder="6-digit PIN"
                maxLength={6}
                value={searchPincode}
                onChange={(e) => setSearchPincode(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-650"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">General Keywords</label>
            <div className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 flex items-center text-slate-200">
              <input
                type="text"
                placeholder="e.g. eco-certified, highrise"
                value={searchKeywords}
                onChange={(e) => setSearchKeywords(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-650"
              />
            </div>
          </div>
        </div>

        {/* Collapsible Advanced Filters Section */}
        {showFilters && (
          <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-4 animate-fade-in" id="advanced-filters-panel">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              
              {/* Business Type Selector (30 options from request) */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">Business Type</label>
                <select
                  value={selectedBusinessType}
                  onChange={(e) => setSelectedBusinessType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300 outline-none"
                >
                  <option value="All">All Business Types</option>
                  <option value="Builder">Builder</option>
                  <option value="Developer">Developer</option>
                  <option value="Vendor">Vendor</option>
                  <option value="Material Supplier">Material Supplier</option>
                  <option value="Manufacturer">Manufacturer</option>
                  <option value="Dealer">Dealer</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Contractor">Contractor</option>
                  <option value="Sub Contractor">Sub Contractor</option>
                  <option value="Architect">Architect</option>
                  <option value="Interior Designer">Interior Designer</option>
                  <option value="Structural Consultant">Structural Consultant</option>
                  <option value="MEP Consultant">MEP Consultant</option>
                  <option value="Legal Consultant">Legal Consultant</option>
                  <option value="CA">CA</option>
                  <option value="Broker">Broker</option>
                  <option value="Channel Partner">Channel Partner</option>
                  <option value="DSA">DSA</option>
                  <option value="Bank">Bank</option>
                  <option value="NBFC">NBFC</option>
                  <option value="Insurance Company">Insurance Company</option>
                  <option value="Equipment Rental">Equipment Rental</option>
                  <option value="Transport Company">Transport Company</option>
                  <option value="Property Management">Property Management</option>
                  <option value="Facility Management">Facility Management</option>
                  <option value="Recruitment Agency">Recruitment Agency</option>
                  <option value="Marketing Agency">Marketing Agency</option>
                  <option value="Software Company">Software Company</option>
                  <option value="Government Authority">Government Authority</option>
                </select>
              </div>

              {/* Geographic Country / State dropdown */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">Geographical Scope</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300 outline-none"
                  >
                    <option value="All">All Countries</option>
                    <option value="India">India</option>
                  </select>
                  <select
                    value={filterState}
                    onChange={(e) => setFilterState(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300 outline-none"
                  >
                    <option value="All">All States</option>
                    {uniqueStates.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
              </div>

              {/* Years in Business / Experience Category */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">Years in Business</label>
                <select
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300 outline-none font-mono"
                >
                  <option value="All">Any Experience</option>
                  <option value="0-2 Years">0-2 Years (Emerging)</option>
                  <option value="2-5 Years">2-5 Years (Established)</option>
                  <option value="5-10 Years">5-10 Years (Veteran)</option>
                  <option value="10+ Years">10+ Years (Enterprise)</option>
                </select>
              </div>

              {/* Membership Grade */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">Membership Grade</label>
                <select
                  value={selectedMembership}
                  onChange={(e) => setSelectedMembership(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300 outline-none font-mono"
                >
                  <option value="All">Any Membership</option>
                  <option value="Starter">Starter (Free)</option>
                  <option value="Commercial Pro">Commercial Pro</option>
                  <option value="Corporate Elite">Corporate Elite</option>
                </select>
              </div>

              {/* B2B Operational Availability */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">Operational Availability</label>
                <select
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-emerald-400 outline-none font-mono"
                >
                  <option value="All">Any Availability</option>
                  <option value="Immediate">Immediate / In Stock</option>
                  <option value="Live Projects">Live Projects</option>
                  <option value="Consultation Open">SLA / Consultation Open</option>
                </select>
              </div>

            </div>

            {/* Verification and Trust Badges checkboxes */}
            <div className="border-t border-slate-850 pt-3.5 space-y-2">
              <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest">Trust & Status Verifications</span>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={filterVerified}
                    onChange={(e) => setFilterVerified(e.target.checked)}
                    className="w-3.5 h-3.5 accent-emerald-500 bg-slate-900 border-slate-850 rounded"
                  />
                  <span>Verified B2B Business</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={filterGst}
                    onChange={(e) => setFilterGst(e.target.checked)}
                    className="w-3.5 h-3.5 accent-emerald-500 bg-slate-900 border-slate-850 rounded"
                  />
                  <span>GST Verified</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={filterRera}
                    onChange={(e) => setFilterRera(e.target.checked)}
                    className="w-3.5 h-3.5 accent-emerald-500 bg-slate-900 border-slate-850 rounded"
                  />
                  <span>RERA Registered</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={filterPremium}
                    onChange={(e) => setFilterPremium(e.target.checked)}
                    className="w-3.5 h-3.5 accent-emerald-500 bg-slate-900 border-slate-850 rounded"
                  />
                  <span>Premium Member</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={filterFeatured}
                    onChange={(e) => setFilterFeatured(e.target.checked)}
                    className="w-3.5 h-3.5 accent-emerald-500 bg-slate-900 border-slate-850 rounded"
                  />
                  <span>Featured Placements</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Form controls (Reset / Counts) */}
        <div className="flex flex-col gap-3 pt-3 border-t border-slate-850">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs font-mono text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Search match: <strong className="text-emerald-400">{filteredCompanies.length}</strong> companies found</span>
              
              {/* SMART GROUPING SUMMARY */}
              {filteredCompanies.length > 0 && (
                <span className="hidden md:inline text-slate-600">
                  | Specializations: {
                    Array.from(new Set(filteredCompanies.map(c => c.category)))
                      .map(cat => `${filteredCompanies.filter(c => c.category === cat).length} ${cat}`)
                      .join(', ')
                  }
                </span>
              )}
            </div>

            {(searchName || searchProduct || searchService || searchBrand || searchCategory !== 'All' || searchCity !== 'All' || searchState !== 'All' || searchArea || searchPincode || searchKeywords || selectedBusinessType !== 'All' || selectedCountry !== 'All' || filterState !== 'All' || filterCity !== 'All' || filterArea || filterPincode || filterVerified || filterGst || filterRera || filterPremium || filterFeatured || selectedExperience !== 'All' || selectedMembership !== 'All' || selectedAvailability !== 'All') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-emerald-400 hover:underline flex items-center gap-1 font-bold cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset All Query Filters</span>
              </button>
            )}
          </div>

          {/* ACTIVE FILTER CHIPS (DISMISSABLE) */}
          {(searchName || searchProduct || searchService || selectedBusinessType !== 'All' || filterState !== 'All' || selectedExperience !== 'All' || selectedMembership !== 'All' || selectedAvailability !== 'All') && (
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/40 p-2 rounded-xl border border-slate-850/60 animate-fade-in">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mr-1">Active Criteria:</span>
              
              {searchName && (
                <span className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-2 py-0.5 text-[10px] flex items-center gap-1">
                  Name: {searchName}
                  <button type="button" onClick={() => setSearchName('')} className="text-slate-500 hover:text-slate-300 font-bold ml-0.5">✕</button>
                </span>
              )}
              {searchProduct && (
                <span className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-2 py-0.5 text-[10px] flex items-center gap-1">
                  Product: {searchProduct}
                  <button type="button" onClick={() => setSearchProduct('')} className="text-slate-500 hover:text-slate-300 font-bold ml-0.5">✕</button>
                </span>
              )}
              {searchService && (
                <span className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-2 py-0.5 text-[10px] flex items-center gap-1">
                  Service: {searchService}
                  <button type="button" onClick={() => setSearchService('')} className="text-slate-500 hover:text-slate-300 font-bold ml-0.5">✕</button>
                </span>
              )}
              {selectedBusinessType !== 'All' && (
                <span className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-2 py-0.5 text-[10px] flex items-center gap-1">
                  Type: {selectedBusinessType}
                  <button type="button" onClick={() => setSelectedBusinessType('All')} className="text-slate-500 hover:text-slate-300 font-bold ml-0.5">✕</button>
                </span>
              )}
              {filterState !== 'All' && (
                <span className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-2 py-0.5 text-[10px] flex items-center gap-1">
                  State: {filterState}
                  <button type="button" onClick={() => setFilterState('All')} className="text-slate-500 hover:text-slate-300 font-bold ml-0.5">✕</button>
                </span>
              )}
              {selectedExperience !== 'All' && (
                <span className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-2 py-0.5 text-[10px] flex items-center gap-1">
                  Exp: {selectedExperience}
                  <button type="button" onClick={() => setSelectedExperience('All')} className="text-slate-500 hover:text-slate-300 font-bold ml-0.5">✕</button>
                </span>
              )}
              {selectedMembership !== 'All' && (
                <span className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-2 py-0.5 text-[10px] flex items-center gap-1">
                  Member: {selectedMembership}
                  <button type="button" onClick={() => setSelectedMembership('All')} className="text-slate-500 hover:text-slate-300 font-bold ml-0.5">✕</button>
                </span>
              )}
              {selectedAvailability !== 'All' && (
                <span className="bg-slate-900 border border-slate-800 text-emerald-400 rounded px-2 py-0.5 text-[10px] flex items-center gap-1 font-mono">
                  Avail: {selectedAvailability}
                  <button type="button" onClick={() => setSelectedAvailability('All')} className="text-emerald-400 hover:text-emerald-200 font-bold ml-0.5">✕</button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Featured directory sections tab navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-850 pb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'All', label: 'All Listings', icon: Layers },
            { id: 'Featured', label: 'Featured Companies', icon: Sparkles },
            { id: 'Recently Joined', label: 'Recently Joined', icon: Clock },
            { id: 'Highest Rated', label: 'Highest Rated', icon: Star },
            { id: 'Most Viewed', label: 'Most Viewed', icon: Eye },
            { id: 'Most Connected', label: 'Most Connected', icon: SlidersHorizontal },
            { id: 'Premium', label: 'Premium Businesses', icon: Award },
            { id: 'Trending', label: 'Trending Businesses', icon: TrendingUp },
            { id: 'Nearby', label: 'Nearby (Demo 5km)', icon: MapPin }
          ].map(sect => {
            const Icon = sect.icon;
            const active = activeSection === sect.id;
            return (
              <button
                key={sect.id}
                onClick={() => {
                  setActiveSection(sect.id as any);
                  onLogTriggered('B2B_DIRECTORY_SECTION_CHANGED', 'directory', sect.id, 'SUCCESS', `Directory: Swapped featured segment section view to: ${sect.label}`);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                  active 
                    ? 'bg-slate-900 text-emerald-400 border border-slate-800' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                <span>{sect.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active compare counter bubble */}
        {compareList.length > 0 && (
          <button
            onClick={() => setShowCompareModal(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold font-mono px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 cursor-pointer animate-pulse"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Compare Companies ({compareList.length}/3)</span>
          </button>
        )}
      </div>

      {/* Directory entries rendering list */}
      {isTabLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="skeleton-loader-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-slate-900 border border-slate-850 rounded-2xl p-5 space-y-4 animate-pulse h-96 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-20 bg-slate-950 rounded-xl relative overflow-hidden" />
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-slate-950 rounded-xl -mt-8 border-2 border-slate-900" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-950 rounded w-2/3" />
                    <div className="h-3 bg-slate-950 rounded w-1/3" />
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="h-3 bg-slate-950 rounded w-full" />
                  <div className="h-3 bg-slate-950 rounded w-5/6" />
                </div>
              </div>
              <div className="space-y-2 pt-3 border-t border-slate-850">
                <div className="flex gap-2 justify-between">
                  <div className="h-8 bg-slate-950 rounded-lg w-24" />
                  <div className="h-8 bg-slate-950 rounded-lg w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : augmentedDisplayedCompanies.length === 0 ? (
        <div className="p-16 text-center bg-slate-900/20 border border-dashed border-slate-850 rounded-2xl" id="empty-state-container">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto animate-bounce mb-3" />
          <h5 className="font-bold text-slate-200 text-base">
            {searchCategory !== 'All' ? 'No Category Match Found' : 'No Companies Match Filters'}
          </h5>
          <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
            There are no B2B enterprise listings currently matching your exact query. Try broadening your keywords, clearing some active verifications, or clicking different categories.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-5 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            Reset Search Database
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="business-directory-cards">
          {augmentedDisplayedCompanies.map(comp => {
            const isSaved = savedBusinesses.includes(comp.id);
            const isFav = favoriteCompanies.includes(comp.id);
            const isPending = connectionsSent.includes(comp.id);
            
            return (
              <div
                key={comp.id}
                id={`directory-card-${comp.id}`}
                className="bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-2xl flex flex-col justify-between overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5 group relative"
              >
                {/* 1. BRANDING HERO BANNER & COVER */}
                <div className={`h-20 w-full bg-gradient-to-r ${comp.coverGradient} relative border-b border-slate-800/40 overflow-hidden`}>
                  <div className="absolute inset-0 bg-slate-950/20" />
                  
                  {/* Top-left: Membership Badge */}
                  <div className="absolute top-2.5 left-3 z-10 flex items-center gap-1">
                    {comp.membership === 'Corporate Elite' && (
                      <span className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-extrabold font-mono text-[9px] px-2 py-0.5 rounded shadow-sm border border-amber-300 uppercase tracking-widest flex items-center gap-0.5">
                        <Award className="w-2.5 h-2.5" /> Elite
                      </span>
                    )}
                    {comp.membership === 'Commercial Pro' && (
                      <span className="bg-slate-950 text-emerald-400 font-bold font-mono text-[9px] px-2 py-0.5 rounded border border-emerald-500/30 uppercase tracking-widest flex items-center gap-0.5 shadow">
                        <Sparkles className="w-2.5 h-2.5" /> Pro
                      </span>
                    )}
                    {comp.membership === 'Starter' && (
                      <span className="bg-slate-950/80 text-slate-400 font-medium font-mono text-[9px] px-1.5 py-0.5 rounded border border-slate-800">
                        Starter
                      </span>
                    )}
                  </div>

                  {/* Top-right Action Buttons over cover */}
                  <div className="absolute top-2.5 right-3 z-10 flex items-center gap-1.5">
                    {/* Compare Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggleCompare(comp.id, comp.name)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        compareList.includes(comp.id)
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                          : 'bg-slate-950/80 backdrop-blur-sm border-slate-850 text-slate-400 hover:text-white'
                      }`}
                      title="Add to comparison matrix"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </button>

                    {/* Favorite heart */}
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(comp.id, comp.name)}
                      className={`p-1.5 rounded-lg border backdrop-blur-sm transition-all cursor-pointer ${
                        isFav 
                          ? 'bg-rose-500 border-rose-400 text-white' 
                          : 'bg-slate-950/80 border-slate-850 text-slate-400 hover:text-rose-400'
                      }`}
                      title="Toggle Favorite Circle"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* 2. CIRCULAR OVERLAPPING CORPORATE LOGO */}
                <div className="relative h-6">
                  <div className={`w-14 h-14 rounded-xl ${comp.logoBg} flex items-center justify-center text-white font-black text-base shadow-xl border-4 border-slate-900 absolute -top-8 left-5 z-10`}>
                    {comp.logoText}
                  </div>
                  
                  {/* Operational Availability Indicator badge overlay */}
                  <span className={`absolute -top-3.5 right-4 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 border shadow ${
                    comp.availability === 'Immediate'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : comp.availability === 'Live Projects'
                      ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      comp.availability === 'Immediate' ? 'bg-emerald-400' : comp.availability === 'Live Projects' ? 'bg-indigo-400' : 'bg-amber-400'
                    }`} />
                    {comp.availability}
                  </span>
                </div>

                {/* 3. CARD BODY */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Title and location */}
                    <div>
                      <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
                        {comp.name}
                        {comp.verified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" title="Identity Verified" />
                        )}
                      </h4>

                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px]">
                        <span className="font-mono font-bold text-slate-400">
                          {comp.businessType}
                        </span>
                        <span className="text-slate-600 font-mono">•</span>
                        <span className="text-slate-400 flex items-center gap-0.5 font-mono">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {comp.city}, {comp.state.substring(0, 2).toUpperCase()}
                        </span>
                        <span className="text-slate-600 font-mono">•</span>
                        <span className="text-amber-400 flex items-center gap-0.5 font-mono">
                          ★ {comp.rating || 'New'}
                        </span>
                      </div>
                    </div>

                    {/* Trust status verifications */}
                    <div className="flex flex-wrap items-center gap-1 text-[9px] font-mono">
                      {comp.gstVerified && (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          ✓ GSTIN
                        </span>
                      )}
                      {comp.reraVerified && (
                        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          ✓ RERA
                        </span>
                      )}
                      {comp.distanceKm && (
                        <span className="bg-slate-950 text-slate-500 border border-slate-850 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          📍 {comp.distanceKm} km nearby
                        </span>
                      )}
                    </div>

                    {/* Short Bio */}
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {comp.shortDescription}
                    </p>

                    {/* Catalog counts & trade stats */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-950/40 p-2 rounded-xl border border-slate-850/40 text-[10px] font-mono text-slate-400">
                      <div className="flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 text-emerald-500" />
                        <span><strong>{comp.products.length}</strong> Products</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HardHat className="w-3.5 h-3.5 text-indigo-400" />
                        <span><strong>{comp.services.length}</strong> Services</span>
                      </div>
                    </div>
                  </div>

                  {/* 4. ACTIONS AREA */}
                  <div className="space-y-2.5 pt-3 border-t border-slate-850/80">
                    {/* Share, Age, and Bookmark save */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-600" />
                        Est: <strong className="text-slate-300">{comp.experienceYears} Yrs</strong>
                      </span>

                      <div className="flex items-center gap-2">
                        {/* Share action */}
                        <button
                          type="button"
                          onClick={() => setSharingCompany(comp)}
                          className="text-slate-500 hover:text-indigo-400 transition-colors"
                          title="Share Profile Card"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Save bookmark */}
                        <button
                          type="button"
                          onClick={() => onToggleSave(comp.id, comp.name)}
                          className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border transition-all ${
                            isSaved 
                              ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400' 
                              : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {isSaved ? 'Saved' : 'Save'}
                        </button>
                      </div>
                    </div>

                    {/* Main row actions */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleViewProfile(comp)}
                        className="bg-slate-950 hover:bg-slate-850 text-slate-300 text-[10px] font-mono font-bold py-2 rounded-lg border border-slate-800 text-center transition-all cursor-pointer"
                      >
                        Profile
                      </button>

                      {/* Interactive QUICK PREVIEW button */}
                      <button
                        type="button"
                        onClick={() => {
                          setActivePreviewCompany(comp);
                          setPreviewTab('overview');
                          onLogTriggered('B2B_PREVIEW_MODAL_OPENED', 'companies', comp.id, 'SUCCESS', `Quick Preview: Opened modal sheet for ${comp.name}.`);
                        }}
                        className="bg-slate-950 hover:bg-slate-850 text-emerald-400 text-[10px] font-mono font-bold py-2 rounded-lg border border-slate-800 text-center flex items-center justify-center gap-1 transition-all cursor-pointer"
                        title="Quick corporate overview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Quick View</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (isPending) return;
                          onConnectRequest(comp.id, comp.name);
                        }}
                        disabled={isPending}
                        className={`text-[10px] font-mono font-bold py-2 rounded-lg text-center transition-all cursor-pointer ${
                          isPending
                            ? 'bg-slate-850 border border-slate-800 text-slate-600 cursor-not-allowed'
                            : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold shadow-sm shadow-emerald-500/10'
                        }`}
                      >
                        {isPending ? 'Pending' : 'Connect'}
                      </button>
                    </div>

                    {/* Sub dialer, WhatsApp, and enquiry links */}
                    <div className="grid grid-cols-3 gap-1">
                      <a
                        href={`tel:+919820000000`}
                        onClick={() => onLogTriggered('B2B_CARD_CALL_INITIATED', 'companies', comp.id, 'SUCCESS', `Call log: Initiated direct corporate dialer link to ${comp.name}.`)}
                        className="bg-slate-950/60 hover:bg-slate-850 text-slate-400 hover:text-slate-200 text-[10px] font-mono py-1 rounded-md border border-slate-850 text-center flex items-center justify-center gap-1 transition-all"
                      >
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>Call</span>
                      </a>

                      <a
                        href={`https://wa.me/919820000000`}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        onClick={() => onLogTriggered('B2B_CARD_WHATSAPP_INITIATED', 'companies', comp.id, 'SUCCESS', `WhatsApp chat link opened for entity: ${comp.name}.`)}
                        className="bg-slate-950/60 hover:bg-slate-850 text-slate-400 hover:text-slate-200 text-[10px] font-mono py-1 rounded-md border border-slate-850 text-center flex items-center justify-center gap-1 transition-all"
                      >
                        <MessageSquare className="w-3 h-3 text-emerald-500" />
                        <span>WhatsApp</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          setActivePreviewCompany(comp);
                          setPreviewTab('contact');
                          showToast(`Direct message channel opened for ${comp.name}. Provide specs below.`, 'info');
                        }}
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-mono py-1 rounded-md border border-emerald-500/20 text-center flex items-center justify-center transition-all cursor-pointer"
                      >
                        Enquiry
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Pagination & Load More Controls (Simulated Lazy Loading) */}
      {hasMore && (
        <div className="flex flex-col items-center justify-center pt-6 space-y-3" id="pagination-footer">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-bold font-mono tracking-tight text-slate-200 hover:text-white flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>Simulating Lazy Loading...</span>
              </>
            ) : (
              <>
                <span>Load More Matched Listings</span>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </>
            )}
          </button>
          
          <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
            <span>Viewing segment {displayedCompanies.length} of {filteredCompanies.length} matches</span>
          </div>
        </div>
      )}

      {/* Side-by-side Company Comparison Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 lg:p-8 z-50 overflow-y-auto animate-fade-in" id="compare-modal">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-5xl w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
                <h3 className="font-display font-extrabold text-base text-slate-100">B2B Company Comparison Matrix</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="p-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {compareList.length < 2 ? (
              <div className="p-10 text-center space-y-2">
                <Info className="w-8 h-8 text-indigo-400 mx-auto" />
                <p className="text-sm font-bold text-slate-300">Minimum 2 companies required to run comparisons.</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">Please close this window and select at least 2 companies using the compare buttons on the cards.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-xs text-left text-slate-300 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 bg-slate-900/40">
                      <th className="p-4 font-mono text-[10px] text-slate-400 uppercase tracking-widest w-44">Parameters</th>
                      {comparedCompanies.map(c => (
                        <th key={c.id} className="p-4 font-bold text-sm text-white border-l border-slate-850">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg ${c.logoBg} flex items-center justify-center text-white font-extrabold text-xs`}>
                              {c.logoText}
                            </div>
                            <div>
                              <span>{c.name}</span>
                              <span className="block text-[9px] text-slate-500 font-mono font-normal">{c.businessType}</span>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    <tr>
                      <td className="p-4 font-mono text-slate-400 font-semibold bg-slate-900/10">Location</td>
                      {comparedCompanies.map(c => (
                        <td key={c.id} className="p-4 border-l border-slate-850">
                          <span className="font-medium text-slate-200">{c.city}, {c.state}</span>
                          <span className="block text-[10px] text-slate-500 font-mono mt-0.5">{c.area}, {c.pincode}</span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-mono text-slate-400 font-semibold bg-slate-900/10">Business Age</td>
                      {comparedCompanies.map(c => (
                        <td key={c.id} className="p-4 border-l border-slate-850">
                          <span className="font-medium text-slate-200">{c.experienceYears} Years in Operations</span>
                          <span className="block text-[10px] text-slate-500 font-mono mt-0.5">Est. {c.established}</span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-mono text-slate-400 font-semibold bg-slate-900/10">Verification Trust</td>
                      {comparedCompanies.map(c => (
                        <td key={c.id} className="p-4 border-l border-slate-850 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${c.verified ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                            <span>B2B Profile: {c.verified ? 'Verified' : 'Pending'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${c.gstVerified ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                            <span>GST Status: {c.gstVerified ? 'GST Registered' : 'Not Provided'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${c.reraVerified ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                            <span>RERA Status: {c.reraVerified ? 'Registered' : 'Not Applicable'}</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-mono text-slate-400 font-semibold bg-slate-900/10">B2B Ratings</td>
                      {comparedCompanies.map(c => (
                        <td key={c.id} className="p-4 border-l border-slate-850">
                          <div className="flex items-center gap-1">
                            <span className="text-amber-400 font-bold text-sm">★ {c.rating}</span>
                            <span className="text-slate-500 text-[10px] font-mono">({c.views} portfolio visits)</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-mono text-slate-400 font-semibold bg-slate-900/10">Membership tier</td>
                      {comparedCompanies.map(c => (
                        <td key={c.id} className="p-4 border-l border-slate-850">
                          <span className={`px-2.5 py-0.5 rounded font-mono font-bold text-[10px] ${
                            c.membership === 'Corporate Elite' 
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                              : c.membership === 'Commercial Pro'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-900 text-slate-400 border border-slate-800'
                          }`}>
                            {c.membership}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-mono text-slate-400 font-semibold bg-slate-900/10">Primary Products</td>
                      {comparedCompanies.map(c => (
                        <td key={c.id} className="p-4 border-l border-slate-850">
                          <div className="flex flex-wrap gap-1 max-w-sm">
                            {c.products.map((p, i) => (
                              <span key={i} className="text-[10px] bg-slate-900 border border-slate-850 text-slate-300 px-1.5 py-0.5 rounded">
                                {p}
                              </span>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-mono text-slate-400 font-semibold bg-slate-900/10">Primary Services</td>
                      {comparedCompanies.map(c => (
                        <td key={c.id} className="p-4 border-l border-slate-850">
                          <div className="flex flex-wrap gap-1 max-w-sm">
                            {c.services.map((s, i) => (
                              <span key={i} className="text-[10px] bg-slate-900 border border-slate-850 text-emerald-400 px-1.5 py-0.5 rounded">
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800 pt-3">
              <span>Comparing {compareList.length} companies</span>
              <button
                type="button"
                onClick={() => {
                  setCompareList([]);
                  setShowCompareModal(false);
                  showToast('Comparison roster reset successfully.', 'info');
                }}
                className="text-emerald-400 hover:underline font-mono cursor-pointer"
              >
                Clear comparison list
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Corporate Profile Modal Sheet */}
      {sharingCompany && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="share-modal">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h4 className="font-display font-extrabold text-sm text-slate-100 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-emerald-400" />
                Share Corporate Profile
              </h4>
              <button
                type="button"
                onClick={() => setSharingCompany(null)}
                className="p-1 bg-slate-950 border border-slate-850 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3 text-center">
              <div className={`w-12 h-12 rounded-2xl ${sharingCompany.logoBg} flex items-center justify-center text-white font-extrabold text-sm mx-auto shadow-md`}>
                {sharingCompany.logoText}
              </div>
              <div>
                <h5 className="font-bold text-slate-200 text-sm">{sharingCompany.name}</h5>
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{sharingCompany.businessType} • {sharingCompany.city}</span>
              </div>

              {/* QR Code Placeholder (Rendered as beautiful high contrast mock SVG vector block) */}
              <div className="p-3 bg-white w-28 h-28 rounded-lg mx-auto flex items-center justify-center border border-slate-800 shadow" id="qr-code-placeholder">
                <QrCode className="w-24 h-24 text-slate-950 stroke-[1.5]" />
              </div>
              <span className="text-[9px] font-mono text-slate-500 block">QR scan code placeholder for physical brochures</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  handleCopyLink(sharingCompany);
                  setSharingCompany(null);
                }}
                className="bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 font-mono py-2 rounded-xl flex items-center justify-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handlePrintProfile(sharingCompany);
                  setSharingCompany(null);
                }}
                className="bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 font-mono py-2 rounded-xl flex items-center justify-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Curated Enterprise Discovery Preview Modal Sheet */}
      {activePreviewCompany && (() => {
        const previewComp = augmentCompany(activePreviewCompany);
        const isSaved = savedBusinesses.includes(previewComp.id);
        const isFav = favoriteCompanies.includes(previewComp.id);
        const isPending = connectionsSent.includes(previewComp.id);

        return (
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 lg:p-8 z-50 overflow-y-auto animate-fade-in" id="preview-company-modal">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col md:h-[80vh] max-h-[90vh]">
              
              {/* Header/Banner Block */}
              <div className={`h-32 bg-gradient-to-r ${previewComp.coverGradient} relative flex flex-col justify-end p-5 shrink-0`}>
                <div className="absolute inset-0 bg-slate-950/35" />
                <button
                  type="button"
                  onClick={() => setActivePreviewCompany(null)}
                  className="absolute top-4 right-4 p-2 bg-slate-950/80 backdrop-blur-sm border border-slate-800 rounded-full text-slate-400 hover:text-slate-100 transition-colors cursor-pointer z-20"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-end gap-4 relative z-10 -mb-10">
                  <div className={`w-16 h-16 rounded-xl ${previewComp.logoBg} flex items-center justify-center text-white font-black text-xl shadow-2xl border-4 border-slate-900`}>
                    {previewComp.logoText}
                  </div>
                  <div className="pb-1.5">
                    <h3 className="font-display font-black text-lg text-white flex items-center gap-2 drop-shadow-md">
                      {previewComp.name}
                      {previewComp.verified && <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-slate-950" />}
                    </h3>
                    <p className="text-xs text-slate-200 font-medium drop-shadow">{previewComp.businessType} • {previewComp.city}, {previewComp.state}</p>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs Bar */}
              <div className="bg-slate-950 border-b border-slate-850 pt-12 px-4 flex flex-wrap gap-1 shrink-0 overflow-x-auto scrollbar-hide">
                {[
                  { id: 'overview', label: 'Overview', icon: Landmark },
                  { id: 'products', label: 'Products', icon: Package },
                  { id: 'services', label: 'Services', icon: HardHat },
                  { id: 'projects', label: 'Projects', icon: Briefcase },
                  { id: 'feed', label: 'Recent Feed', icon: MessageSquare },
                  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
                  { id: 'rfqs', label: 'RFQs', icon: FileSpreadsheet },
                  { id: 'opportunities', label: 'Opportunities', icon: TrendingUp },
                  { id: 'contact', label: 'Quick Contact', icon: Mail }
                ].map(t => {
                  const Icon = t.icon;
                  const active = previewTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setPreviewTab(t.id)}
                      className={`px-3 py-2 text-xs font-bold font-mono border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                        active 
                          ? 'border-emerald-500 text-emerald-400 bg-slate-900/40' 
                          : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/10'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Panel Content (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-900/40 text-slate-300">
                
                {/* 1. Overview Panel */}
                {previewTab === 'overview' && (
                  <div className="space-y-6 animate-fade-in" id="preview-tab-overview">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850/60 space-y-1">
                        <span className="text-[10px] text-slate-500 font-mono uppercase block">Verification & Legitimacy</span>
                        <div className="text-xs space-y-1.5 pt-1">
                          <p className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono">
                            ✓ {previewComp.gstVerified ? 'GSTIN Verified' : 'GST Registered'}
                          </p>
                          <p className={`flex items-center gap-1.5 font-mono ${previewComp.reraVerified ? 'text-indigo-400 font-bold' : 'text-slate-500'}`}>
                            {previewComp.reraVerified ? '✓ RERA Compliant' : '✗ No RERA Required'}
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850/60 space-y-1">
                        <span className="text-[10px] text-slate-500 font-mono uppercase block">Membership Tier</span>
                        <div className="text-xs pt-1">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            previewComp.membership === 'Corporate Elite'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : previewComp.membership === 'Commercial Pro'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-900 text-slate-400 border border-slate-800'
                          }`}>
                            {previewComp.membership} Member
                          </span>
                          <span className="block text-[10px] text-slate-500 mt-1.5 font-mono">Established: {previewComp.established}</span>
                        </div>
                      </div>

                      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850/60 space-y-1">
                        <span className="text-[10px] text-slate-500 font-mono uppercase block">B2B Ratings & Impact</span>
                        <div className="text-xs pt-1 flex items-center gap-3">
                          <div className="text-amber-400 font-bold text-lg flex items-center gap-0.5 font-mono">★ {previewComp.rating}</div>
                          <div className="text-[10px] font-mono text-slate-500 leading-tight">
                            <span>{previewComp.views} Views</span><br />
                            <span>{previewComp.experienceYears} Years Active</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-sm text-slate-200">About {previewComp.name}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans">{previewComp.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/40 space-y-2">
                        <h5 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">Corporate Coordinates</h5>
                        <div className="text-xs space-y-1.5 text-slate-400 font-mono">
                          <p>📍 {previewComp.area}, {previewComp.city}, {previewComp.state} - {previewComp.pincode}</p>
                          <p>📞 Phone: +91 98200 00000 (Primary B2B Desk)</p>
                          <p>✉ Email: desk@{previewComp.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com</p>
                        </div>
                      </div>

                      <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/40 space-y-2">
                        <h5 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">Operational Availability</h5>
                        <div className="text-xs space-y-1 text-slate-400">
                          <p className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <strong>Current Status:</strong> {previewComp.availability}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1 font-mono leading-relaxed">
                            This B2B vendor has signed SLA commitments for guaranteed response times and compliance clearances.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Products Panel */}
                {previewTab === 'products' && (
                  <div className="space-y-4 animate-fade-in" id="preview-tab-products">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="text-sm font-bold text-slate-200">B2B Product Catalog</h4>
                      <span className="text-[10px] font-mono text-slate-500">{previewComp.products.length} Products Cataloged</span>
                    </div>

                    {previewComp.products.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-8">No specific products cataloged in this directory category.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {previewComp.products.map((prod, i) => (
                          <div key={i} className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                              <Package className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-xs text-slate-200">{prod}</p>
                              <span className="text-[9px] font-mono text-slate-500">Corporate-grade certified standard SKU • Available for Bulk Freight</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Services Panel */}
                {previewTab === 'services' && (
                  <div className="space-y-4 animate-fade-in" id="preview-tab-services">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="text-sm font-bold text-slate-200">Professional Services Profile</h4>
                      <span className="text-[10px] font-mono text-slate-500">{previewComp.services.length} Core Services</span>
                    </div>

                    {previewComp.services.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-8">No specific services declared in this listing.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {previewComp.services.map((serv, i) => (
                          <div key={i} className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-850 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                <HardHat className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-bold text-xs text-slate-200">{serv}</p>
                                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Compliant SLA Service • Pre-vetted team</p>
                              </div>
                            </div>
                            <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded">SLA Enabled</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Projects Panel */}
                {previewTab === 'projects' && (
                  <div className="space-y-4 animate-fade-in" id="preview-tab-projects">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="text-sm font-bold text-slate-200">Project Portfolio History</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {previewComp.projects.map((proj, i) => (
                        <div key={i} className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
                              Reference Project
                            </span>
                            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active/Completed
                            </span>
                          </div>
                          <p className="font-bold text-xs text-slate-200">{proj}</p>
                          <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                            Official sub-contracting or supply relationship established under strict regulatory verification guidelines.
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Recent Feed Panel */}
                {previewTab === 'feed' && (
                  <div className="space-y-4 animate-fade-in" id="preview-tab-feed">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="text-sm font-bold text-slate-200">Recent Corporate Feed & Updates</h4>
                    </div>

                    <div className="space-y-3">
                      {previewComp.feedPosts.map((post, i) => (
                        <div key={i} className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                            <span>Posted: 2 days ago</span>
                            <span className="text-emerald-400">Verified Update</span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">{post}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Marketplace Panel */}
                {previewTab === 'marketplace' && (
                  <div className="space-y-4 animate-fade-in" id="preview-tab-marketplace">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="text-sm font-bold text-slate-200">Active Marketplace Listings</h4>
                      <span className="text-[10px] font-mono text-slate-500">B2B Product Discoveries</span>
                    </div>

                    <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-850 text-center space-y-3">
                      <ShoppingBag className="w-8 h-8 text-emerald-500/80 mx-auto" />
                      <div>
                        <h5 className="font-bold text-xs text-slate-200">Enterprise Product Catalog Active</h5>
                        <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                          Bulk materials, tools, and custom logistics modules offered by {previewComp.name} can be browsed in our main **Marketplace** portal.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActivePreviewCompany(null);
                          showToast(`Redirecting to Marketplace search for ${previewComp.name}...`, 'info');
                        }}
                        className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg transition-all"
                      >
                        Search Materials Marketplace
                      </button>
                    </div>
                  </div>
                )}

                {/* 7. RFQs Panel */}
                {previewTab === 'rfqs' && (
                  <div className="space-y-4 animate-fade-in" id="preview-tab-rfqs">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="text-sm font-bold text-slate-200">Active Request for Quotations (RFQs)</h4>
                    </div>

                    {previewComp.rfqs.length === 0 ? (
                      <div className="bg-slate-950/40 p-6 rounded-xl border border-slate-850 text-center space-y-2">
                        <FileSpreadsheet className="w-6 h-6 text-slate-600 mx-auto" />
                        <p className="text-xs text-slate-500">No open RFQs at this time from this vendor.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {previewComp.rfqs.map((rfq, i) => (
                          <div key={i} className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                                Bid Tender Open
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">Closing in 15 days</span>
                            </div>
                            <p className="font-bold text-xs text-slate-200">{rfq}</p>
                            <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                              Verified procurement requirements post. Standard compliance vetting protocols mandatory.
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 8. Opportunities Panel */}
                {previewTab === 'opportunities' && (
                  <div className="space-y-4 animate-fade-in" id="preview-tab-opportunities">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="text-sm font-bold text-slate-200">B2B Opportunities & Joint Ventures</h4>
                    </div>

                    <div className="space-y-3">
                      {previewComp.opportunities.map((opp, i) => (
                        <div key={i} className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                              Alliance Partner
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">Scope: Joint Consortium</span>
                          </div>
                          <p className="font-bold text-xs text-slate-200">{opp}</p>
                          <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                            Interested pre-approved entities are invited to submit their interest proposals directly.
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 9. Contact Panel */}
                {previewTab === 'contact' && (
                  <div className="space-y-4 animate-fade-in" id="preview-tab-contact">
                    <div className="border-b border-slate-800 pb-2">
                      <h4 className="text-sm font-bold text-slate-200">Send Direct B2B Enquiry</h4>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!enquiryMessage.trim()) return;
                        onLogTriggered('B2B_ENQUIRY_SUBMITTED', 'enquiries', previewComp.id, 'SUCCESS', `Enquiry: Submitted direct requirement of type: ${enquiryType} to ${previewComp.name}. Message: ${enquiryMessage}`);
                        showToast(`Enquiry submitted successfully to ${previewComp.name}! B2B Desk will reply soon.`, 'success');
                        setEnquiryMessage('');
                      }}
                      className="space-y-3.5"
                    >
                      <div>
                        <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Requirement Category</label>
                        <select
                          value={enquiryType}
                          onChange={(e) => setEnquiryType(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="Quotation Request">Quotation Request (Bulk SKU pricing)</option>
                          <option value="Technical Partnership">Technical Partnership (Consortium/SLA)</option>
                          <option value="Sample Request">Sample Material Dispatch Request</option>
                          <option value="Site Consultation">Site Liaison Consultation Desk</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Message Detail</label>
                        <textarea
                          rows={4}
                          value={enquiryMessage}
                          onChange={(e) => setEnquiryMessage(e.target.value)}
                          placeholder="Provide detailed specifications, timeline, structural quantities, or regulatory clearance specs..."
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold font-mono text-xs py-2.5 rounded-xl transition-all shadow-md"
                      >
                        Submit Request to {previewComp.name}
                      </button>
                    </form>
                  </div>
                )}

              </div>

              {/* Sticky Footer */}
              <div className="bg-slate-950 border-t border-slate-850 p-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="text-[10px] font-mono text-slate-500">
                  <span>ID: {previewComp.id} • SLA Verified</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (isPending) return;
                      onConnectRequest(previewComp.id, previewComp.name);
                    }}
                    disabled={isPending}
                    className={`px-4 py-2 text-xs font-mono font-bold rounded-xl transition-all ${
                      isPending
                        ? 'bg-slate-850 border border-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                    }`}
                  >
                    {isPending ? 'Pending Connection' : 'Connect'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleViewProfile(previewComp);
                      setActivePreviewCompany(null);
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-200 text-xs font-mono font-bold rounded-xl border border-slate-800"
                  >
                    Full B2B Profile View
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
