/**
 * RealtyConnect™ Sprint 12 - B2B Marketplace Module
 */

import { currentOrgId, currentOrgName, currentOrgVerified, currentUserEmail, currentUserName } from '../lib/identity';
import { appStore } from '../lib/appStore';
import { api, errorMessage } from '../lib/api';
import { isRegisteredCompanyId } from '../lib/companies';
import { useStoreSync } from '../lib/usePersistentState';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, MapPin, ShieldCheck, Heart, Share2, Phone, MessageSquare, Send, Mail, Info, FileText, 
  Plus, RefreshCw, X, ChevronRight, SlidersHorizontal, ArrowLeft, Check, Download, Video, Award, Star, 
  User, Layers, ShieldAlert, Sparkles, Folder, ExternalLink, Bookmark, Building, ShoppingBag, Eye, HelpCircle, AlertTriangle,
  Grid, List, Copy, Shield, FileCheck, CheckCircle2
} from 'lucide-react';
import { FeedPost } from './BusinessFeed';

export interface MarketplaceListing {
  id: string;
  name: string;
  category: 'Construction Materials' | 'Industrial Equipment' | 'Professional Services' | 'Financial Services';
  subcategory: string;
  brand: string;
  model: string;
  shortDescription: string;
  detailedDescription: string;
  imagePlaceholderColor: string; // Tailwinds bg gradient class
  imageIcon: string; // Emoji or category identifier
  brochureName: string;
  videoUrl: string;
  specifications: { name: string; value: string }[];
  availableQuantity?: string;
  moq: string;
  unit: string;
  price?: string; // e.g. "₹52,000"
  priceOnRequest: boolean;
  location: string;
  deliveryAvailability: string; // e.g. "Pan-India", "Within 100km"
  businessId: string;
  businessName: string;
  verifiedSeller: boolean;
  membershipLevel: 'Basic' | 'Premium Gold' | 'Enterprise Platinum';
  rating: number;
  featured: boolean;
  trending: boolean;
  createdDate: string;
}

export interface ProductEnquiry {
  id: string;
  listingId: string;
  listingName: string;
  sellerId: string;
  sellerName: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  message: string;
  timestamp: string;
  status: 'Pending' | 'Replied';
  reply?: string;
}

export interface SupplierDetails {
  overview: string;
  products: string;
  services: string;
  rating: string;
  yearsInBusiness: string;
  stats: string;
  responseRate: string;
  leadTime: string;
  compliance: string;
}

export const getSupplierDetails = (businessName: string): SupplierDetails => {
  const nameLower = businessName.toLowerCase();
  if (nameLower.includes('elite')) {
    return {
      overview: 'Elite Materials Group is a premier national Tier-1 manufacturer and distributor of high-strength structural cements, customized ceramic tile profiles, and eco-Shield vitrified flooring products. Built with sustainable operations.',
      products: 'UltraTech Pozzolana Cement (PPC), EcoShield Glazed Vitrified Tiles, High-Density Concrete Aggregates',
      services: 'Pan-India Freight Logistics, Certified Stress Testing, Volume Rebates, Project Site Consultation',
      rating: '4.9 / 5.0 RERA Sensex Score',
      yearsInBusiness: 'Established in 2012 (14 Years of Service)',
      stats: '12,000+ Bags In Stock • 100% On-Time delivery',
      responseRate: '99% within 2 hrs',
      leadTime: 'Within 48 hours for regional hubs',
      compliance: 'Fully certified ISO 9001, IS 1489 Compliant'
    };
  }
  if (nameLower.includes('tata') || nameLower.includes('steel')) {
    return {
      overview: 'Tata Steel Enterprise Division manufactures high-ductility Fe 550 TMT rebars designed for high-rise residential towers and heavy seismic load regions. A trusted backbone of Indian infrastructure.',
      products: 'Fe 550D High-Ductility TMT Rebars, Structural Steel H-Beams, Cold-Rolled Support Frames',
      services: 'Custom structural cutting, Metallurgical test certification reports, Escrow logistics clearing',
      rating: '4.8 / 5.0 RERA Sensex Score',
      yearsInBusiness: 'Established in 2008 (18 Years of Service)',
      stats: '500+ Tonnes Capacity • Pre-Approved RERA Escrows',
      responseRate: '98% within 1 hr',
      leadTime: 'Within 3-5 working days direct from mills',
      compliance: 'IS 1786 Certified, Seismic Resistance Zone-V compliant'
    };
  }
  if (nameLower.includes('global') || nameLower.includes('equipment')) {
    return {
      overview: 'Global Tech Equipment Ltd operates India\'s premier certified commercial equipment rental fleet, leasing advanced vibratory road rollers, intelligent hydraulic excavators, and compactors.',
      products: 'Sany 10-Ton Hydraulic Double-Drum Road Rollers, Heavy Excavators, Batching Cranes',
      services: 'On-site licensed operator dispatch, 24/7 technical field breakdown maintenance, fuel efficiency monitoring',
      rating: '4.7 / 5.0 RERA Sensex Score',
      yearsInBusiness: 'Established in 2015 (11 Years of Service)',
      stats: '4 Active Machinery Units • Pan-India Lease Logistics',
      responseRate: '95% within 4 hrs',
      leadTime: 'Scheduled deployment within 72 hours',
      compliance: 'CEV Stage-IV / BS-IV Emission compliant'
    };
  }
  if (nameLower.includes('aura') || nameLower.includes('spatial') || nameLower.includes('design')) {
    return {
      overview: 'Aura Spatial Design Studio is a highly accredited BIM Level 3 architectural consulting firm, specializing in finite element analysis, high-rise wind simulation, and structural design stamps.',
      products: 'BIM Architectural 3D Modeling, Structural Engineering Blueprints, Foundation Load Matrices',
      services: 'Seismic engineering audits, material cost optimization consultancy, municipal approval representation',
      rating: '4.9 / 5.0 RERA Sensex Score',
      yearsInBusiness: 'Established in 2018 (8 Years of Service)',
      stats: '60+ Towers Completed • 100% Approval Rate',
      responseRate: '100% within 2 hrs',
      leadTime: 'Sprint milestone deliverables every 7 days',
      compliance: 'BS EN ISO 19650 certified, IS 1893 seismic stamp registered'
    };
  }
  if (nameLower.includes('national') || nameLower.includes('bank') || nameLower.includes('trust')) {
    return {
      overview: 'National Trust Bank is the premier designated financial trustee on RealtyConnect, backing development syndicates with RERA-compliant project escrows and automated builder disbursements.',
      products: 'Section 4(2)(l)(D) RERA Escrows, Corporate Builder Project Bridge Finance Lines',
      services: 'Real-time ERP API integrations, sub-contractor escrow releases, tax invoice withholdings',
      rating: '4.8 / 5.0 RERA Sensex Score',
      yearsInBusiness: 'Established in 2010 (16 Years of Service)',
      stats: '₹180Cr Trade Volume Secured • Pan-India Bank Nodes',
      responseRate: '99% within 1 hr',
      leadTime: 'Instant Escrow account provisioning',
      compliance: 'RBI Registered Commercial Bank, RERA Compliant Escrow Shield'
    };
  }
  // Default Client corporate supplier
  return {
    overview: 'MultiSarv India Pvt. Ltd. is our elite in-house registered distributor node for specialized structural materials, chemical cements, and heavy-duty logistics frameworks.',
    products: 'Premium Sourcing Materials, Commercial Slabs',
    services: 'On-Demand delivery, Escrow integration, Bulk quotation counseling',
    rating: '5.0 / 5.0 Client Rating',
    yearsInBusiness: 'Established in 2020 (6 Years of Service)',
    stats: 'Verified Seller • RERA Audited',
    responseRate: '99% within 1 hr',
    leadTime: 'Direct project-by-project delivery',
    compliance: 'ISO 9001 certified manufacturer'
  };
};

export const getBusinessInitialsAndColor = (name: string) => {
  const clean = name.replace(/[^a-zA-Z\s]/g, '').trim();
  const words = clean.split(/\s+/);
  let initials = '';
  if (words.length >= 2) {
    initials = (words[0][0] + words[1][0]).toUpperCase();
  } else if (words.length === 1 && words[0].length >= 2) {
    initials = words[0].substring(0, 2).toUpperCase();
  } else {
    initials = 'RC';
  }

  // Generate a premium aesthetic background color based on name hash
  const colors = [
    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'bg-sky-500/10 text-sky-400 border-sky-500/20',
    'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'bg-teal-500/10 text-teal-400 border-teal-500/20',
    'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'bg-rose-500/10 text-rose-400 border-rose-500/20'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colors.length;
  return { initials, colorClass: colors[colorIndex] };
};

interface BusinessMarketplaceProps {
  userSession: { email: string; role: string; permissions: string[] } | null;
  onLogTriggered: (action: string, entity: string, entityId: string, status: 'SUCCESS' | 'FAILURE' | 'WARNING', details: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  posts: FeedPost[];
  setPosts: React.Dispatch<React.SetStateAction<FeedPost[]>>;
  setActiveViewMode?: (view: any) => void;
  // "Products" in the top menu shows goods only (materials, equipment); services stay under "Services".
  productsOnly?: boolean;
}

// Categories that are goods rather than services.
const PRODUCT_CATEGORIES: MarketplaceListing['category'][] = ['Construction Materials', 'Industrial Equipment'];

// Seed listings inside B2B Marketplace
export const INITIAL_MARKETPLACE_LISTINGS: MarketplaceListing[] = [
  {
    id: 'mkt-1',
    name: 'Tata Tiscon Fe 550D Super Ductile Reinforcement Steel Bars',
    category: 'Construction Materials',
    subcategory: 'Steel',
    brand: 'Tata Steel',
    model: 'Tiscon Fe 550D SD',
    shortDescription: 'High-ductility earthquake-resistant TMT reinforcement rebars for highrise construction.',
    detailedDescription: 'Tata Tiscon 550D is a high-strength, high-ductility reinforcement steel manufactured using cutting-edge thermo-mechanical treatment. Designed specifically for construction in seismic zones, it provides superior elongation, higher load-bearing capacity, and exceptional bonding with cement.',
    imagePlaceholderColor: 'from-blue-900 to-slate-900',
    imageIcon: '🏗️',
    brochureName: 'tata_tiscon_fe550d_specs.pdf',
    videoUrl: 'https://www.youtube.com/embed/demo1',
    specifications: [
      { name: 'Grade', value: 'Fe 550D Super Ductile' },
      { name: 'Diameter Range', value: '8mm - 32mm' },
      { name: 'Standard Compliance', value: 'IS 1786:2008' },
      { name: 'Carbon Equivalent', value: '0.40% max' },
      { name: 'Yield Strength', value: '550 N/mm² minimum' }
    ],
    availableQuantity: '4,500 MT',
    moq: '40 MT',
    unit: 'Metric Tons (MT)',
    price: '₹56,400',
    priceOnRequest: false,
    location: 'Mumbai, Maharashtra',
    deliveryAvailability: 'Pan-India Delivery (Logistics Included for Orders > 100 MT)',
    businessId: 'ent-3',
    businessName: 'Elite Materials Group',
    verifiedSeller: true,
    membershipLevel: 'Enterprise Platinum',
    rating: 4.8,
    featured: true,
    trending: true,
    createdDate: '2026-07-10'
  },
  {
    id: 'mkt-2',
    name: 'UltraTech Premium Portland Pozzolana Cement (PPC)',
    category: 'Construction Materials',
    subcategory: 'Cement',
    brand: 'UltraTech Cement',
    model: 'Premium PPC Grade',
    shortDescription: 'Super-fine blended cement providing high early strength and maximum concrete durability.',
    detailedDescription: 'UltraTech Premium PPC is a specialized blended cement produced by inter-grinding high-strength clinker with highly reactive silica fly ash. It creates high-density concrete that is extremely resistant to chemical attacks, water ingress, and corrosion, making it perfect for marine works and deep foundations.',
    imagePlaceholderColor: 'from-amber-950 to-slate-900',
    imageIcon: '🧱',
    brochureName: 'ultratech_premium_ppc_datasheet.pdf',
    videoUrl: 'https://www.youtube.com/embed/demo2',
    specifications: [
      { name: 'Type', value: 'Portland Pozzolana Cement (Blended)' },
      { name: 'Fly Ash content', value: '28% - 33%' },
      { name: 'Specific Surface Area', value: '300 m²/kg min' },
      { name: 'Initial Setting Time', value: '115 minutes' },
      { name: 'Final Setting Time', value: '240 minutes' }
    ],
    availableQuantity: '12,000 Bags',
    moq: '500 Bags',
    unit: 'Bags (50 kg)',
    price: '₹415',
    priceOnRequest: false,
    location: 'Delhi NCR',
    deliveryAvailability: 'Within 150 km of Regional Warehouses',
    businessId: 'ent-3',
    businessName: 'Elite Materials Group',
    verifiedSeller: true,
    membershipLevel: 'Enterprise Platinum',
    rating: 4.9,
    featured: true,
    trending: false,
    createdDate: '2026-07-12'
  },
  {
    id: 'mkt-3',
    name: 'Sany 10-Ton Double-Drum Heavy Hydraulic Road Roller',
    category: 'Industrial Equipment',
    subcategory: 'Machinery Rental',
    brand: 'Sany Heavy Industry',
    model: 'SSR120C-10',
    shortDescription: 'Double-drum vibratory asphalt compactor with intelligent compaction command sensors.',
    detailedDescription: 'Available for immediate 3-month to 12-month lease contracts. The Sany SSR120C-10 road roller is a top-tier compaction machine featuring an electronic fuel injection engine, customized vibration frequencies, and dual amplitude controls. Perfect for heavy-duty subgrade and asphalt compaction on expressways.',
    imagePlaceholderColor: 'from-yellow-950 to-slate-900',
    imageIcon: '🚜',
    brochureName: 'sany_ssr120c_lease_terms.pdf',
    videoUrl: 'https://www.youtube.com/embed/demo3',
    specifications: [
      { name: 'Operating Weight', value: '12,200 kg' },
      { name: 'Drum Width', value: '2,130 mm' },
      { name: 'Vibration Frequency', value: '33 Hz / 40 Hz' },
      { name: 'Rated Power', value: '97 kW @ 2200 rpm' },
      { name: 'Emission Compliance', value: 'CEV Stage-IV / BS-IV' }
    ],
    availableQuantity: '4 Units',
    moq: '1 Unit',
    unit: 'Units (Lease Basis)',
    priceOnRequest: true,
    location: 'Pune, Maharashtra',
    deliveryAvailability: 'Maharashtra, Gujarat & Karnataka region',
    businessId: 'ent-6',
    businessName: 'Global Tech Equipment Ltd',
    verifiedSeller: true,
    membershipLevel: 'Premium Gold',
    rating: 4.7,
    featured: false,
    trending: true,
    createdDate: '2026-07-14'
  },
  {
    id: 'mkt-4',
    name: 'Aura BIM-Enabled Structural Engineering & High-Rise Design Consult',
    category: 'Professional Services',
    subcategory: 'Structural Consultant',
    brand: 'Aura Spatial Design Studio',
    model: 'BIM Level 3 Architectural',
    shortDescription: 'Advanced seismic and wind structural modeling for towers up to 60 residential storeys.',
    detailedDescription: 'Our senior consultants provide fully stamp-certified structural design and structural blueprint generation. We utilize advanced FEA software and Revit BIM Level 3 integration to optimize steel ratios, foundation cement volumes, and wind-stabilization structures for luxury skyscrapers.',
    imagePlaceholderColor: 'from-emerald-950 to-slate-900',
    imageIcon: '📐',
    brochureName: 'aura_structural_portfolio_2026.pdf',
    videoUrl: '',
    specifications: [
      { name: 'Software Stack', value: 'ETABS, SAFE, STAAD.Pro, Autodesk Revit' },
      { name: 'Seismic Standards', value: 'IS 1893:2016 Compliant' },
      { name: 'BIM Standard', value: 'BS EN ISO 19650 certified' },
      { name: 'Licensure', value: 'Chartered structural engineers & municipal stamp authorities' }
    ],
    moq: '1 Project Scope',
    unit: 'Scope basis',
    priceOnRequest: true,
    location: 'Pune, Maharashtra',
    deliveryAvailability: 'Global Remote Services / Onsite Site Audits within India',
    businessId: 'ent-4',
    businessName: 'Aura Spatial Design Studio',
    verifiedSeller: true,
    membershipLevel: 'Premium Gold',
    rating: 4.9,
    featured: true,
    trending: false,
    createdDate: '2026-07-15'
  },
  {
    id: 'mkt-5',
    name: 'National Commercial Construction Escrow & Syndicated Funding Program',
    category: 'Financial Services',
    subcategory: 'Banks',
    brand: 'National Trust Bank',
    model: 'Escrow Account Shield V2',
    shortDescription: 'Dedicated RERA-compliant project escrows with customized automated payout triggers.',
    detailedDescription: 'National Trust Bank provides state-of-the-art commercial escrow packages for large development syndicates. Our system offers real-time API integrations, instant verified builder sub-contractor releases, automatic GST tax withholdings, and pre-approved project bridge financing lines linked to escrow deposits.',
    imagePlaceholderColor: 'from-purple-900 to-slate-900',
    imageIcon: '🏦',
    brochureName: 'national_trust_escrow_model_brief.pdf',
    videoUrl: '',
    specifications: [
      { name: 'Regulatory Model', value: '100% RERA Section 4(2)(l)(D) compliant' },
      { name: 'Bridge Funding Limit', value: 'Up to ₹150 Crore per project' },
      { name: 'API Integrations', value: 'Direct ERP connection / Webhooks' },
      { name: 'Minimum Escrow Volume', value: '₹15 Crore initial project deposit' }
    ],
    moq: '1 Project Escrow setup',
    unit: 'Arrangement basis',
    priceOnRequest: true,
    location: 'Mumbai, Maharashtra',
    deliveryAvailability: 'Available across all certified RERA states in India',
    businessId: 'ent-5',
    businessName: 'National Trust Bank',
    verifiedSeller: true,
    membershipLevel: 'Enterprise Platinum',
    rating: 4.8,
    featured: false,
    trending: false,
    createdDate: '2026-07-15'
  },
  {
    id: 'mkt-6',
    name: 'Eco-Premium Vitrified Floor & Cladding Wall Tiles',
    category: 'Construction Materials',
    subcategory: 'Tiles & Flooring',
    brand: 'Elite Materials Group',
    model: 'EcoShield Glazed Vitrified',
    shortDescription: 'Double-charged, scratch-resistant glazed tiles with ultra-low water absorption ratings.',
    detailedDescription: 'EcoShield Vitrified Tiles are manufactured using hydraulic high-temperature firing of eco-refined porcelain clay. Ideal for heavy corporate foyers, high-traffic commercial building pathways, and luxurious residential restrooms. Features custom antimicrobial glazing and slip-resistant structural textures.',
    imagePlaceholderColor: 'from-slate-800 to-slate-900',
    imageIcon: '🟫',
    brochureName: 'ecoshield_tile_catalog_2026.pdf',
    videoUrl: '',
    specifications: [
      { name: 'Dimensions', value: '1200mm x 600mm / 800mm x 800mm' },
      { name: 'Thickness', value: '9.5 mm nominal' },
      { name: 'Water Absorption', value: 'Less than 0.05%' },
      { name: 'Mohs Hardness', value: 'Grade 7 scratch resistance' },
      { name: 'Anti-Skid Rating', value: 'R10 certified' }
    ],
    availableQuantity: '15,000 Sq. Mtr.',
    moq: '300 Sq. Mtr.',
    unit: 'Square Metres (Sq.M)',
    price: '₹720',
    priceOnRequest: false,
    location: 'Delhi NCR',
    deliveryAvailability: 'Pan-India direct container shipping',
    businessId: 'ent-3',
    businessName: 'Elite Materials Group',
    verifiedSeller: true,
    membershipLevel: 'Enterprise Platinum',
    rating: 4.6,
    featured: false,
    trending: true,
    createdDate: '2026-07-16'
  }
];

export default function BusinessMarketplace({
  userSession,
  onLogTriggered,
  showToast,
  posts,
  setPosts,
  setActiveViewMode,
  productsOnly = false
}: BusinessMarketplaceProps) {

  // Active View Tab: 'explore', 'details', 'my_marketplace'
  const [mktTab, setMktTab] = useState<'explore' | 'my_marketplace'>('explore');

  // Listings State
  const [listings, setListings] = useState<MarketplaceListing[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_marketplace_listings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load marketplace listings', e);
    }
    return INITIAL_MARKETPLACE_LISTINGS;
  });

  // Saved Listings State
  const [savedListingIds, setSavedListingIds] = useState<string[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_saved_listings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return ['mkt-1', 'mkt-4']; // Default saved products
  });

  // Favorite Listing Ids State
  const [favListingIds, setFavListingIds] = useState<string[]>(() => {
    try {
      const fav = appStore.getItem('realtyconnect_fav_listings');
      if (fav) return JSON.parse(fav);
    } catch (e) {
      console.error(e);
    }
    return ['mkt-2'];
  });

  // Enquiries State
  const [enquiries, setEnquiries] = useState<ProductEnquiry[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_product_enquiries');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    // Default initial enquiries
    return [
      {
        id: 'enq-101',
        listingId: 'mkt-1',
        listingName: 'Tata Tiscon Fe 550D Super Ductile Reinforcement Steel Bars',
        sellerId: 'ent-3',
        sellerName: 'Elite Materials Group',
        senderName: 'Apex Developers Ltd',
        senderEmail: 'procurement@apexdev.com',
        senderPhone: '+91 98220 11440',
        message: 'Requesting wholesale quote for foundation steel supply for 180 MT delivered to BKC sector 2. What is your fastest delivery timeframe?',
        timestamp: '2026-07-15 11:20 AM',
        status: 'Replied',
        reply: '[Elite Materials Group Response]\n\nThank you for the enquiry. For 180 MT of Tiscon Fe 550D delivered to BKC, we can supply at a special rate of ₹55,200/MT inclusive of transit. Materials can be dispatched in 4 continuous container batches starting within 72 hours of purchase order.'
      }
    ];
  });

  // Current selected listing details
  // Listings and enquiries from other companies arrive without a reload.
  useStoreSync<MarketplaceListing[]>('realtyconnect_marketplace_listings', setListings);
  useStoreSync<ProductEnquiry[]>('realtyconnect_product_enquiries', setEnquiries);

  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);

  // Enquiry modal triggers
  const [enquiryModalListing, setEnquiryModalListing] = useState<MarketplaceListing | null>(null);
  const [enqMessage, setEnqMessage] = useState('');
  const [enqSenderName, setEnqSenderName] = useState(userSession ? 'MultiSarv Representative' : 'Sourcing Manager');
  const [enqSenderEmail, setEnqSenderEmail] = useState(userSession?.email || '');
  const [enqSenderPhone, setEnqSenderPhone] = useState('+91 98200 44021');

  // New Listing creation state
  const [isPublishing, setIsPublishing] = useState(false);
  const [newListing, setNewListing] = useState<Partial<MarketplaceListing>>({
    name: '',
    category: 'Construction Materials',
    subcategory: 'Cement',
    brand: '',
    model: '',
    shortDescription: '',
    detailedDescription: '',
    brochureName: '',
    moq: '100',
    unit: 'Bags',
    price: '',
    priceOnRequest: true,
    location: 'Mumbai, Maharashtra',
    deliveryAvailability: 'Pan-India',
    availableQuantity: '',
    specifications: [{ name: '', value: '' }]
  });

  // Active view filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterSubcategory, setFilterSubcategory] = useState('All');
  const [filterBrand, setFilterBrand] = useState('All');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterPriceRange, setFilterPriceRange] = useState('All'); // All, Under 1K, 1K-50K, 50K+, Price On Request
  const [filterAvailability, setFilterAvailability] = useState<'All' | 'Immediate' | 'OnDemand'>('All');
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
  const [filterPremiumOnly, setFilterPremiumOnly] = useState(false);
  const [filterFeaturedOnly, setFilterFeaturedOnly] = useState(false);
  const [filterTrendingOnly, setFilterTrendingOnly] = useState(false);
  const [filterSort, setFilterSort] = useState<'newest' | 'rating' | 'popular'>('newest');

  // Modern UI & B2B Sourcing Refinement States
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSearching, setIsSearching] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  // Reset interactive image/gallery indexes whenever selected item changes
  useEffect(() => {
    setGalleryIndex(0);
    setZoomActive(false);
  }, [selectedListing]);

  // Simulate premium catalog search micro-delay/skeleton-trigger for high fidelity
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setIsSearching(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [searchQuery, filterCategory, filterSubcategory, filterBrand, filterLocation, filterPriceRange, filterAvailability, filterVerifiedOnly, filterPremiumOnly, filterFeaturedOnly, filterTrendingOnly, filterSort]);

  // Synchronize appStore on states update
  useEffect(() => {
    appStore.setItem('realtyconnect_marketplace_listings', JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    appStore.setItem('realtyconnect_saved_listings', JSON.stringify(savedListingIds));
  }, [savedListingIds]);

  useEffect(() => {
    appStore.setItem('realtyconnect_fav_listings', JSON.stringify(favListingIds));
  }, [favListingIds]);

  useEffect(() => {
    appStore.setItem('realtyconnect_product_enquiries', JSON.stringify(enquiries));
  }, [enquiries]);

  // Derived filters options
  const categoryOptions = productsOnly
    ? ['All', ...PRODUCT_CATEGORIES]
    : ['All', 'Construction Materials', 'Industrial Equipment', 'Professional Services', 'Financial Services'];
  const locationOptions = useMemo(() => {
    const locs = listings.map(l => l.location.split(',')[0].trim());
    return ['All', ...Array.from(new Set(locs))];
  }, [listings]);

  const brandOptions = useMemo(() => {
    const brands = listings.map(l => l.brand).filter(Boolean);
    return ['All', ...Array.from(new Set(brands))];
  }, [listings]);

  // Dynamic Subcategory options based on selected category
  const subcategoryOptions = useMemo(() => {
    if (filterCategory === 'All') return ['All'];
    const subs = listings
      .filter(l => l.category === filterCategory)
      .map(l => l.subcategory);
    return ['All', ...Array.from(new Set(subs))];
  }, [listings, filterCategory]);

  // Process filters
  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      if (productsOnly && !PRODUCT_CATEGORIES.includes(item.category)) return false;
      // Search text
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        item.name.toLowerCase().includes(query) ||
        item.brand.toLowerCase().includes(query) ||
        item.subcategory.toLowerCase().includes(query) ||
        item.shortDescription.toLowerCase().includes(query) ||
        item.detailedDescription.toLowerCase().includes(query) ||
        item.businessName.toLowerCase().includes(query);

      // Filters
      const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
      const matchesSubcategory = filterSubcategory === 'All' || item.subcategory === filterSubcategory;
      const matchesBrand = filterBrand === 'All' || item.brand === filterBrand;
      const matchesLocation = filterLocation === 'All' || item.location.includes(filterLocation);

      // Price Filter
      let matchesPrice = true;
      if (filterPriceRange !== 'All') {
        if (filterPriceRange === 'Request') {
          matchesPrice = item.priceOnRequest;
        } else {
          if (item.priceOnRequest || !item.price) {
            matchesPrice = false;
          } else {
            const numericPrice = parseInt(item.price.replace(/[^\d]/g, ''), 10);
            if (filterPriceRange === 'Under1K') matchesPrice = numericPrice < 1000;
            else if (filterPriceRange === '1K-50K') matchesPrice = numericPrice >= 1000 && numericPrice <= 50000;
            else if (filterPriceRange === '50K+') matchesPrice = numericPrice > 50000;
          }
        }
      }

      // Availability Filter
      let matchesAvailability = true;
      if (filterAvailability !== 'All') {
        const qty = item.availableQuantity ? item.availableQuantity.toLowerCase() : 'in stock';
        const isDemand = qty.includes('demand') || qty === 'on-demand';
        if (filterAvailability === 'Immediate') {
          matchesAvailability = !isDemand;
        } else if (filterAvailability === 'OnDemand') {
          matchesAvailability = isDemand;
        }
      }

      const matchesVerified = !filterVerifiedOnly || item.verifiedSeller;
      const matchesPremium = !filterPremiumOnly || item.membershipLevel !== 'Basic';
      const matchesFeatured = !filterFeaturedOnly || item.featured;
      const matchesTrending = !filterTrendingOnly || item.trending;

      return matchesSearch && matchesCategory && matchesSubcategory && matchesBrand && matchesLocation && matchesPrice && matchesAvailability && matchesVerified && matchesPremium && matchesFeatured && matchesTrending;
    }).sort((a, b) => {
      if (filterSort === 'newest') return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      if (filterSort === 'rating') return b.rating - a.rating;
      // popular (trending)
      return (b.trending ? 1 : 0) - (a.trending ? 1 : 0);
    });
  }, [listings, searchQuery, filterCategory, filterSubcategory, filterBrand, filterLocation, filterPriceRange, filterAvailability, filterVerifiedOnly, filterPremiumOnly, filterFeaturedOnly, filterTrendingOnly, filterSort]);

  // Featured lists for side/featured boards
  const featuredProducts = useMemo(() => listings.filter(l => l.featured), [listings]);
  const trendingProducts = useMemo(() => listings.filter(l => l.trending), [listings]);
  const premiumSuppliers = useMemo(() => {
    const suppliers = listings.filter(l => l.verifiedSeller && l.membershipLevel !== 'Basic').map(l => ({
      name: l.businessName,
      level: l.membershipLevel,
      rating: l.rating
    }));
    // unique by name
    return Array.from(new Map(suppliers.map(s => [s.name, s])).values()).slice(0, 4);
  }, [listings]);

  // Toggle Save product
  const handleToggleSaveListing = (id: string, name: string) => {
    setSavedListingIds(prev => {
      const active = prev.includes(id);
      if (active) {
        onLogTriggered('B2B_MKT_ITEM_UNSAVED', 'marketplace', id, 'SUCCESS', `Removed product from bookmarks: ${name}`);
        showToast('Removed from saved items.', 'info');
        return prev.filter(item => item !== id);
      } else {
        onLogTriggered('B2B_MKT_ITEM_SAVED', 'marketplace', id, 'SUCCESS', `Saved product to bookmarks: ${name}`);
        showToast('Saved to My Marketplace Bookmark List!', 'success');
        return [...prev, id];
      }
    });
  };

  // Toggle Favorite product
  const handleToggleFavListing = (id: string, name: string) => {
    setFavListingIds(prev => {
      const active = prev.includes(id);
      if (active) {
        showToast('Removed from favorite vendors products.', 'info');
        return prev.filter(item => item !== id);
      } else {
        showToast('Added to Favorite products!', 'success');
        return [...prev, id];
      }
    });
  };

  // Submit Enquiry
  const handleSendEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryModalListing) return;

    const newEnq: ProductEnquiry = {
      id: `enq-${Date.now()}`,
      listingId: enquiryModalListing.id,
      listingName: enquiryModalListing.name,
      sellerId: enquiryModalListing.businessId,
      sellerName: enquiryModalListing.businessName,
      senderName: enqSenderName,
      senderEmail: enqSenderEmail,
      senderPhone: enqSenderPhone,
      message: enqMessage,
      timestamp: new Date().toLocaleString(),
      status: 'Pending'
    };

    if (isRegisteredCompanyId(enquiryModalListing.businessId)) {
      const listing = enquiryModalListing;
      const conversationId = `conv-mkt-${listing.id}`;
      // The seller receives a lead, a marketplace enquiry and a conversation it can answer.
      api('POST', '/network/enquiries', {
        toOrgId: listing.businessId,
        kind: 'product',
        subject: `Enquiry: ${listing.name}`.slice(0, 200),
        category: listing.category,
        message: enqMessage,
        email: enqSenderEmail,
        phone: enqSenderPhone,
        relatedId: listing.id,
        relatedTitle: listing.name,
        conversationId
      })
        .then(() => {
          setEnquiries(prev => [newEnq, ...prev]);
          try {
            const list = JSON.parse(appStore.getItem('realtyconnect_conversations') || '[]');
            const now = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const message = { id: `msg-${Date.now()}`, sender: 'self', senderName: currentUserName(), senderCompany: currentOrgName(), text: `Enquiry: ${listing.name}\n\n${enqMessage}`, timestamp: now, type: 'text', status: 'delivered' };
            const existing = list.find((c: any) => c.id === conversationId);
            if (existing) {
              existing.messages.push(message);
              existing.lastMessageText = message.text.slice(0, 140);
              existing.lastMessageTime = now;
            } else {
              list.unshift({ id: conversationId, companyName: listing.businessName, companyId: listing.businessId, logoBg: 'bg-emerald-600', conversationType: 'Marketplace Enquiry', lastMessageText: message.text.slice(0, 140), lastMessageTime: now, unreadCount: 0, priority: 'Normal', pinned: false, archived: false, assignedExecutive: currentUserName(), relatedEntity: { type: 'Marketplace', id: listing.id, title: listing.name }, messages: [message] });
            }
            appStore.setItem('realtyconnect_conversations', JSON.stringify(list));
          } catch (err) {
            console.error('Could not record the conversation locally', err);
          }
          onLogTriggered('B2B_MKT_ENQUIRY_DISPATCHED', 'marketplace', listing.id, 'SUCCESS', `Sent product enquiry about "${listing.name}" to ${listing.businessName}`);
          showToast(`Enquiry delivered to ${listing.businessName}. Their reply will appear in Messaging.`, 'success');
          setEnqMessage('');
          setEnquiryModalListing(null);
        })
        .catch(err => showToast(errorMessage(err), 'error'));
      return;
    }

    setEnquiries(prev => [newEnq, ...prev]);
    onLogTriggered(
      'B2B_MKT_ENQUIRY_DISPATCHED',
      'marketplace',
      enquiryModalListing.id,
      'SUCCESS',
      `Sent Product Sourcing Inquiry regarding "${enquiryModalListing.name}" to ${enquiryModalListing.businessName}`
    );

    try {
      const savedLeads = appStore.getItem('realtyconnect_leads');
      let currentLeads = [];
      if (savedLeads) {
        currentLeads = JSON.parse(savedLeads);
      }
      const nextId = `RC-LE-${1000 + currentLeads.length + 1}`;
      const newLead = {
        id: nextId,
        title: `Product Sourcing: ${enquiryModalListing.name}`,
        type: 'Product Enquiry',
        source: 'Marketplace',
        company: enquiryModalListing.businessName,
        contactPerson: enqSenderName || 'Sourcing Manager',
        email: enqSenderEmail || currentUserEmail(),
        mobile: enqSenderPhone || '+91 98200 44021',
        category: enquiryModalListing.category,
        productService: enquiryModalListing.name,
        location: enquiryModalListing.location,
        priority: 'Medium',
        description: enqMessage,
        preferredContactMethod: 'Email',
        status: 'New',
        assignedTo: 'Unassigned',
        createdDate: new Date().toLocaleString(),
        updatedDate: new Date().toLocaleString(),
        notes: 'Automatically captured via ecosystem marketplace interaction.',
        timeline: [
          { id: 't1', date: new Date().toLocaleString(), type: 'Enquiry Received', text: `Captured enquiry automatically from B2B Marketplace.` }
        ],
        followUps: []
      };
      appStore.setItem('realtyconnect_leads', JSON.stringify([newLead, ...currentLeads]));
    } catch (e) {
      console.error('Error auto capturing lead from marketplace', e);
    }

    // Automatically spawn a B2B Conversation
    try {
      const conversationsJson = appStore.getItem('realtyconnect_conversations');
      let conversationsList = conversationsJson ? JSON.parse(conversationsJson) : [];
      
      const newConversationId = `conv-mkt-${enquiryModalListing.id}`;
      
      const existingIdx = conversationsList.findIndex((c: any) => c.id === newConversationId);
      if (existingIdx === -1) {
        const newConv = {
          id: newConversationId,
          companyName: enquiryModalListing.businessName,
          companyId: enquiryModalListing.businessId,
          logoBg: 'bg-emerald-600',
          conversationType: 'Marketplace Enquiry' as const,
          lastMessageText: enqMessage || `Sourcing Enquiry created for ${enquiryModalListing.name}`,
          lastMessageTime: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unreadCount: 0,
          priority: 'Normal' as const,
          pinned: false,
          archived: false,
          assignedExecutive: currentUserName(),
          relatedEntity: {
            type: 'Marketplace' as const,
            id: enquiryModalListing.id,
            title: enquiryModalListing.name
          },
          messages: [
            {
              id: `msg-mkt-sys-${Date.now()}`,
              sender: 'system' as const,
              senderName: 'System',
              senderCompany: 'RealtyConnect',
              text: `B2B Sourcing Enquiry submitted for listing: ${enquiryModalListing.name}.`,
              timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: 'system' as const
            },
            {
              id: `msg-mkt-user-${Date.now()}`,
              sender: 'self' as const,
              senderName: enqSenderName || 'Sourcing Manager',
              senderCompany: 'Elite Materials & Co',
              text: enqMessage,
              timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: 'text' as const,
              status: 'read' as const,
              attachment: {
                name: `Sourcing_Specs_${enquiryModalListing.name.replace(/\s+/g, '_').substring(0, 30)}.pdf`,
                type: 'pdf' as const,
                size: '1.2 MB'
              }
            }
          ]
        };
        conversationsList.unshift(newConv);
        appStore.setItem('realtyconnect_conversations', JSON.stringify(conversationsList));
      }
    } catch (e) {
      console.error('Error syncing marketplace inquiry to conversations', e);
    }

    showToast(`Inquiry dispatched to ${enquiryModalListing.businessName}!`, 'success');
    
    const targetListing = enquiryModalListing;
    setEnqMessage('');
    setEnquiryModalListing(null);

    // Simulated callback reply after 1.5 seconds to make the UI look alive and high fidelity
    setTimeout(() => {
      setEnquiries(current => current.map(item => {
        if (item.id === newEnq.id) {
          const autoReply = `[Automated Verified Quote Response]\n\nGreetings from the B2B team at ${targetListing.businessName}!\n\nThank you for reaching out regarding "${targetListing.name}". We have received your query: "${item.message}".\n\nOur trade coordinator has reserved inventory matching your parameters. Based on your profile and our active MOQ (${targetListing.moq} ${targetListing.unit}), we offer specialized commercial slabs and net 30 RERA-compliant credit lines.\n\nAn executive will contact you at ${item.senderPhone} or ${item.senderEmail} shortly to coordinate formal technical data sheets.`;
          
          showToast(`Trade quote callback received from ${targetListing.businessName}!`, 'success');
          onLogTriggered(
            'B2B_MKT_CALLBACK_RECEIVED',
            'marketplace',
            targetListing.id,
            'SUCCESS',
            `Received dynamic trade quotation feedback callback from ${targetListing.businessName}`
          );

          // Append to B2B Messaging history!
          try {
            const conversationsJson = appStore.getItem('realtyconnect_conversations');
            if (conversationsJson) {
              let conversationsList = JSON.parse(conversationsJson);
              const convIdx = conversationsList.findIndex((c: any) => c.id === `conv-mkt-${targetListing.id}`);
              if (convIdx !== -1) {
                conversationsList[convIdx].messages.push({
                  id: `msg-mkt-reply-${Date.now()}`,
                  sender: 'them' as const,
                  senderName: 'Sales Coordinator',
                  senderCompany: targetListing.businessName,
                  text: autoReply,
                  timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  type: 'text' as const
                });
                conversationsList[convIdx].lastMessageText = autoReply;
                conversationsList[convIdx].lastMessageTime = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                conversationsList[convIdx].unreadCount = 1;
                appStore.setItem('realtyconnect_conversations', JSON.stringify(conversationsList));
              }
            }
          } catch (e) {}

          return { ...item, status: 'Replied', reply: autoReply };
        }
        return item;
      }));
    }, 1500);
  };

  // Publish dynamic B2B listing
  const handlePublishListingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListing.name || !newListing.brand || !newListing.shortDescription || !newListing.detailedDescription) {
      showToast('Please fill out all required corporate fields.', 'error');
      return;
    }

    const createdId = `mkt-${Date.now()}`;
    const cleanSpecs = (newListing.specifications || []).filter(s => s.name.trim() && s.value.trim());

    const completedListing: MarketplaceListing = {
      id: createdId,
      name: newListing.name,
      category: newListing.category as any,
      subcategory: newListing.subcategory || 'General',
      brand: newListing.brand,
      model: newListing.model || 'Standard',
      shortDescription: newListing.shortDescription,
      detailedDescription: newListing.detailedDescription,
      imagePlaceholderColor: 'from-slate-800 to-indigo-950',
      imageIcon: newListing.category === 'Professional Services' ? '📐' : newListing.category === 'Industrial Equipment' ? '🚜' : newListing.category === 'Financial Services' ? '🏦' : '🧱',
      brochureName: newListing.brochureName || 'commercial_specification_brief.pdf',
      videoUrl: '',
      specifications: cleanSpecs.length > 0 ? cleanSpecs : [{ name: 'Sourcing Model', value: 'B2B Wholesale' }],
      moq: newListing.moq || '1',
      unit: newListing.unit || 'Units',
      price: newListing.priceOnRequest ? undefined : (newListing.price ? `₹${newListing.price}` : undefined),
      priceOnRequest: !!newListing.priceOnRequest,
      location: newListing.location || 'Mumbai, Maharashtra',
      deliveryAvailability: newListing.deliveryAvailability || 'Pan-India',
      availableQuantity: newListing.availableQuantity || 'On Demand',
      businessId: (currentOrgId() || 'ent-client'),
      businessName: currentOrgName(),
      verifiedSeller: currentOrgVerified(),
      membershipLevel: 'Enterprise Platinum',
      rating: 5.0,
      featured: false,
      trending: false,
      createdDate: new Date().toISOString().split('T')[0]
    };

    setListings(prev => [completedListing, ...prev]);
    onLogTriggered(
      'B2B_MKT_ITEM_PUBLISHED',
      'marketplace',
      createdId,
      'SUCCESS',
      `Corporate Cataloging: Successfully cataloged and published new B2B listing "${completedListing.name}"`
    );
    showToast('Product Listing Published successfully!', 'success');

    // Business Feed integration: Automatically generate a Business Feed update!
    const feedId = `post-mkt-${Date.now()}`;
    const mktFeedPost: FeedPost = {
      id: feedId,
      companyId: (currentOrgId() || 'ent-client'),
      companyName: currentOrgName(),
      category: 'Contractors', // or Developers
      logoBg: 'bg-emerald-600',
      logoText: 'MS',
      verified: currentOrgVerified(),
      premium: false,
      timestamp: 'Just Now',
      postType: 'New Product Launch',
      title: `PRODUCT LAUNCH: ${completedListing.name}`,
      description: `📢 NEW B2B CATALOGUE PUBLISHED:\n\nWe have catalogued a new business resource on RealtyConnect.\n\n📦 ITEM: ${completedListing.name}\n🏷️ BRAND/MODEL: ${completedListing.brand} (${completedListing.model})\n🔢 MOQ: ${completedListing.moq} ${completedListing.unit}\n💰 PRICE: ${completedListing.priceOnRequest ? 'Price on Request' : completedListing.price}\n\nStakeholders and developers are welcome to explore full specifications, download the commercial brochure, and submit active procurement inquiries.`,
      location: completedListing.location,
      distanceKm: 1.0,
      tags: ['B2BMarketplace', completedListing.subcategory.replace(/\s+/g, ''), 'ProcurementCatalog'],
      likesCount: 0,
      comments: []
    };

    setPosts(prev => [mktFeedPost, ...prev]);
    onLogTriggered(
      'B2B_FEED_SYNCHRONIZED',
      'feed',
      feedId,
      'SUCCESS',
      `Feed Synced: Automatically broadcasted launch post for "${completedListing.name}" on professional Business Feed.`
    );

    // Reset publishing states
    setIsPublishing(false);
    setNewListing({
      name: '',
      category: 'Construction Materials',
      subcategory: 'Cement',
      brand: '',
      model: '',
      shortDescription: '',
      detailedDescription: '',
      brochureName: '',
      moq: '100',
      unit: 'Bags',
      price: '',
      priceOnRequest: true,
      location: 'Mumbai, Maharashtra',
      deliveryAvailability: 'Pan-India',
      availableQuantity: '',
      specifications: [{ name: '', value: '' }]
    });
  };

  return (
    <div className="space-y-6 text-slate-200" id="b2b-marketplace-portal">
      
      {/* Header Banner Section - Swiss Slate Premium Theme */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-900 p-6 rounded-2xl shadow-xl">
        {/* Background ambient mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-inner shrink-0">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/10 uppercase tracking-widest">
                  REALTYCONNECT™ CORE
                </span>
                <span className="text-[9px] font-mono text-slate-500 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
                  Secure B2B Spec Discovery
                </span>
              </div>
              <h2 className="text-xl font-display font-extrabold text-white mt-1.5 tracking-tight">Enterprise Product & Sourcing Catalog</h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-2xl mt-1.5">
                Discover verified regional manufacturers, heavy rental operators, and corporate consultants. Catalogue items, inspect chemical/mechanical specifications, stream video demonstrations, and coordinate direct wholesale inquiries.
              </p>
            </div>
          </div>

          {/* Action tab switcher */}
          <div className="flex items-center gap-3 self-stretch lg:self-auto bg-slate-950/80 p-1.5 rounded-xl border border-slate-900/80 shrink-0">
            <button
              type="button"
              onClick={() => setMktTab('explore')}
              className={`flex-1 lg:flex-none px-4 py-2 font-mono font-bold text-[11px] rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${mktTab === 'explore' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10' : 'hover:bg-slate-900 hover:text-slate-200 text-slate-400'}`}
            >
              <Layers className="w-4 h-4" />
              <span>Discover Catalogue</span>
            </button>
            <button
              type="button"
              onClick={() => setMktTab('my_marketplace')}
              className={`flex-1 lg:flex-none px-4 py-2 font-mono font-bold text-[11px] rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${mktTab === 'my_marketplace' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10' : 'hover:bg-slate-900 hover:text-slate-200 text-slate-400'}`}
            >
              <User className="w-4 h-4" />
              <span>My Sourcing</span>
              {enquiries.filter(e => e.status === 'Pending').length > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Live Marketplace Statistics to inspire enterprise confidence */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-900/60 relative z-10 text-xs">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-900 hover:border-slate-800 transition-all shadow-sm">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              Verified SKU Cataloged
            </span>
            <span className="block text-base font-extrabold text-white mt-1">4,850+ Items</span>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-900 hover:border-slate-800 transition-all shadow-sm">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              RERA Audited Sellers
            </span>
            <span className="block text-base font-extrabold text-emerald-400 mt-1">100% Tax Invoiced</span>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-900 hover:border-slate-800 transition-all shadow-sm">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              Secured Trade Volume
            </span>
            <span className="block text-base font-extrabold text-white mt-1">₹180Cr+ Handled</span>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-900 hover:border-slate-800 transition-all shadow-sm">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              Active Logistics Radius
            </span>
            <span className="block text-base font-extrabold text-white mt-1">Pan-India Support</span>
          </div>
        </div>
      </div>

      {/* EXPLORE / CATALOG DIRECTORY MODE */}
      {mktTab === 'explore' && !selectedListing && (
        <div className="space-y-6">
          
          {/* FEATURED CATEGORIES SECTION - NEW IMPROVED B2B VIEW */}
          {searchQuery === '' && filterCategory === 'All' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-extrabold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  {productsOnly ? 'Product Categories' : 'Featured B2B Categories'}
                </h3>
                <span className="text-[10px] font-mono text-slate-500">Click to filter catalogs instantaneously</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    name: 'Construction Materials',
                    icon: '🧱',
                    description: 'High-grade steel rebars, premium PPC/OPC cement blocks, concrete, tiles and floorings.',
                    brands: 'Tata Steel, UltraTech, JSW',
                    count: listings.filter(l => l.category === 'Construction Materials').length
                  },
                  {
                    name: 'Industrial Equipment',
                    icon: '🚜',
                    description: 'Heavy machinery rentals, hydraulic excavators, compaction road rollers and equipment leases.',
                    brands: 'Sany Heavy, JCB, Cat',
                    count: listings.filter(l => l.category === 'Industrial Equipment').length
                  },
                  {
                    name: 'Professional Services',
                    icon: '📐',
                    description: 'Seismic engineering design, BIM architectural blueprints, structural engineering consultants.',
                    brands: 'Aura Studio, CAD Experts',
                    count: listings.filter(l => l.category === 'Professional Services').length
                  },
                  {
                    name: 'Financial Services',
                    icon: '🏦',
                    description: 'RERA syndicated commercial project escrows, builders bridge financing & bank trust shields.',
                    brands: 'National Trust Bank',
                    count: listings.filter(l => l.category === 'Financial Services').length
                  }
                ].filter(cat => !productsOnly || (PRODUCT_CATEGORIES as string[]).includes(cat.name)).map((cat, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setFilterCategory(cat.name);
                      showToast(`Filtered category: ${cat.name}`, 'success');
                    }}
                    className="group bg-slate-900/20 hover:bg-slate-900/40 border border-slate-900/80 hover:border-emerald-500/20 p-4 rounded-xl cursor-pointer transition-all space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="bg-slate-950 border border-slate-900 px-2 py-0.5 text-[9px] font-mono text-slate-400 rounded-full group-hover:text-emerald-400 group-hover:border-emerald-500/20 transition-all">
                        {cat.count} listings
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs text-slate-200 group-hover:text-emerald-400 transition-colors">{cat.name}</h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-sans line-clamp-2">{cat.description}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-900/60 text-[9px] font-mono text-slate-500 flex justify-between items-center">
                      <span>Brands: {cat.brands}</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-all text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: FILTERS & SEARCH */}
            <div className="lg:col-span-3 bg-slate-900/10 border border-slate-900/60 rounded-2xl p-4.5 space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                <span className="font-display font-bold text-xs text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                  Advanced Sourcing Filters
                </span>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterCategory('All');
                    setFilterSubcategory('All');
                    setFilterBrand('All');
                    setFilterLocation('All');
                    setFilterPriceRange('All');
                    setFilterAvailability('All');
                    setFilterVerifiedOnly(false);
                    setFilterPremiumOnly(false);
                    setFilterFeaturedOnly(false);
                    setFilterTrendingOnly(false);
                    showToast('Marketplace filters cleared.', 'info');
                  }}
                  className="text-[10px] font-mono text-slate-500 hover:text-emerald-400 transition-colors"
                >
                  Clear All
                </button>
              </div>

              {/* Global Search Bar */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Search Catalogs / Products</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cement, Steel, Sany Roller..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500/50 rounded-xl px-3.5 py-2 pl-9 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-600"
                  />
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Core Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    setFilterSubcategory('All');
                  }}
                  className="w-full bg-slate-950 border border-slate-900 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none font-sans cursor-pointer focus:border-emerald-500/50"
                >
                  {categoryOptions.map(cat => (
                    <option key={cat} value={cat}>{cat === 'All' ? 'All Core Categories' : cat}</option>
                  ))}
                </select>
              </div>

              {/* Subcategory Filter */}
              {filterCategory !== 'All' && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Subcategory</label>
                  <select
                    value={filterSubcategory}
                    onChange={(e) => setFilterSubcategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none font-sans cursor-pointer focus:border-emerald-500/50"
                  >
                    {subcategoryOptions.map(sub => (
                      <option key={sub} value={sub}>{sub === 'All' ? 'All Subcategories' : sub}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Brand Filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Sourcing Brand</label>
                <select
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none font-sans cursor-pointer focus:border-emerald-500/50"
                >
                  {brandOptions.map(br => (
                    <option key={br} value={br}>{br === 'All' ? 'All Verified Brands' : br}</option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Sourcing Region / Warehouse</label>
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none font-sans cursor-pointer focus:border-emerald-500/50"
                >
                  {locationOptions.map(loc => (
                    <option key={loc} value={loc}>{loc === 'All' ? 'All Regions' : loc}</option>
                  ))}
                </select>
              </div>

              {/* Price range filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Commercial Pricing Bracket</label>
                <select
                  value={filterPriceRange}
                  onChange={(e) => setFilterPriceRange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none font-sans cursor-pointer focus:border-emerald-500/50"
                >
                  <option value="All">All Price Points</option>
                  <option value="Under1K">Wholesale Under ₹1,000</option>
                  <option value="1K-50K">₹1,000 to ₹50,000</option>
                  <option value="50K+">Wholesale Above ₹50,000</option>
                  <option value="Request">Price On Request Only</option>
                </select>
              </div>

              {/* Inventory Availability Filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Inventory Status</label>
                <select
                  value={filterAvailability}
                  onChange={(e) => setFilterAvailability(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-900 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none font-sans cursor-pointer focus:border-emerald-500/50"
                >
                  <option value="All">All Availability Models</option>
                  <option value="Immediate">Immediate Sourcing (In Stock)</option>
                  <option value="OnDemand">On Demand (Project-by-Project)</option>
                </select>
              </div>

              {/* Toggles verification and badges */}
              <div className="space-y-3 pt-3 border-t border-slate-900">
                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={filterVerifiedOnly}
                    onChange={(e) => setFilterVerifiedOnly(e.target.checked)}
                    className="rounded border-slate-900 bg-slate-950 text-emerald-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="flex items-center gap-2 font-sans">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Verified Sellers Only</span>
                  </span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={filterPremiumOnly}
                    onChange={(e) => setFilterPremiumOnly(e.target.checked)}
                    className="rounded border-slate-900 bg-slate-950 text-emerald-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="flex items-center gap-2 font-sans">
                    <Award className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Enterprise Gold / Platinum</span>
                  </span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={filterFeaturedOnly}
                    onChange={(e) => setFilterFeaturedOnly(e.target.checked)}
                    className="rounded border-slate-900 bg-slate-950 text-emerald-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="flex items-center gap-2 font-sans">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Featured Listings</span>
                  </span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={filterTrendingOnly}
                    onChange={(e) => setFilterTrendingOnly(e.target.checked)}
                    className="rounded border-slate-900 bg-slate-950 text-emerald-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="flex items-center gap-2 font-sans text-indigo-400">
                    <span>🔥 Trending Products</span>
                  </span>
                </label>
              </div>

              {/* Sorter Selector */}
              <div className="pt-2.5 border-t border-slate-900 space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Sort Matrix</label>
                <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-900">
                  {[
                    { id: 'newest', label: 'Newest' },
                    { id: 'rating', label: 'Top Rated' },
                    { id: 'popular', label: 'Popular' }
                  ].map(sort => (
                    <button
                      key={sort.id}
                      onClick={() => setFilterSort(sort.id as any)}
                      className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer font-mono text-[9px] ${filterSort === sort.id ? 'bg-slate-900 text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      {sort.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* MAIN PRODUCT CATALOG DIRECTORY (9 columns) */}
            <div className="lg:col-span-9 space-y-6">
              
              {/* FEATURED RIBBON FOR IMMERSIVE PRODUCT DISCOVERY */}
              {searchQuery === '' && filterCategory === 'All' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-extrabold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                      Featured B2B Catalog Highlights
                    </h3>
                    <span className="text-[10px] font-mono text-slate-500">RERA Audited Manufacturers</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {featuredProducts.slice(0, 3).map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => setSelectedListing(item)}
                        className="group bg-gradient-to-b from-slate-900/60 to-slate-950 border border-slate-900 hover:border-emerald-500/25 p-4 rounded-xl cursor-pointer transition-all space-y-3 flex flex-col justify-between shadow-lg hover:shadow-emerald-500/5 relative overflow-hidden"
                      >
                        {/* Technical Blueprint pattern */}
                        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] opacity-15"></div>
                        
                        <div className="space-y-2 relative z-10">
                          <div className="flex items-center justify-between text-[9px] font-mono">
                            <span className="text-slate-500 uppercase">{item.subcategory}</span>
                            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/25">Featured</span>
                          </div>
                          
                          <div className="flex items-start gap-2.5">
                            {/* Blueprints preview */}
                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.imagePlaceholderColor} flex items-center justify-center text-xl shrink-0 border border-slate-800/80 shadow-md group-hover:scale-105 transition-all`}>
                              {item.imageIcon}
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-slate-100 line-clamp-2 leading-snug group-hover:text-emerald-400 transition-colors">{item.name}</h4>
                              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{item.businessName}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-900/60 text-[10px] font-mono relative z-10">
                          <span className="text-slate-500">MOQ: <strong className="text-slate-300 font-semibold">{item.moq} {item.unit.split(' ')[0]}</strong></span>
                          <span className="text-emerald-400 font-bold font-sans">{item.priceOnRequest ? 'Price On Request' : item.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ACTIVE FILTER CHIPS SECTION */}
              {(() => {
                const activeChips = (() => {
                  const chips = [];
                  if (filterCategory !== 'All') chips.push({ label: filterCategory, type: 'category' });
                  if (filterSubcategory !== 'All') chips.push({ label: filterSubcategory, type: 'subcategory' });
                  if (filterBrand !== 'All') chips.push({ label: `Brand: ${filterBrand}`, type: 'brand' });
                  if (filterLocation !== 'All') chips.push({ label: `Region: ${filterLocation}`, type: 'location' });
                  if (filterPriceRange !== 'All') chips.push({ label: `Price Range: ${filterPriceRange}`, type: 'price' });
                  if (filterAvailability !== 'All') chips.push({ label: filterAvailability === 'Immediate' ? 'Immediate Sourcing' : 'On-Demand Sourcing', type: 'availability' });
                  if (filterVerifiedOnly) chips.push({ label: 'RERA Verified', type: 'verified' });
                  if (filterPremiumOnly) chips.push({ label: 'Enterprise Premium', type: 'premium' });
                  if (filterFeaturedOnly) chips.push({ label: 'Featured SKUs', type: 'featured' });
                  if (filterTrendingOnly) chips.push({ label: 'Trending SKUs', type: 'trending' });
                  return chips;
                })();
                
                return activeChips.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 p-3 bg-slate-950 border border-slate-900 rounded-xl">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mr-1">Active Sourcing Criteria:</span>
                    {activeChips.map((chip, idx) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 py-0.5 px-2 rounded-lg"
                      >
                        <span>{chip.label}</span>
                        <button
                          onClick={() => {
                            if (chip.type === 'category') { setFilterCategory('All'); setFilterSubcategory('All'); }
                            else if (chip.type === 'subcategory') setFilterSubcategory('All');
                            else if (chip.type === 'brand') setFilterBrand('All');
                            else if (chip.type === 'location') setFilterLocation('All');
                            else if (chip.type === 'price') setFilterPriceRange('All');
                            else if (chip.type === 'availability') setFilterAvailability('All');
                            else if (chip.type === 'verified') setFilterVerifiedOnly(false);
                            else if (chip.type === 'premium') setFilterPremiumOnly(false);
                            else if (chip.type === 'featured') setFilterFeaturedOnly(false);
                            else if (chip.type === 'trending') setFilterTrendingOnly(false);
                          }}
                          className="text-emerald-500 hover:text-red-400 transition-colors ml-1 focus:outline-none"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <button 
                      onClick={() => {
                        setFilterCategory('All');
                        setFilterSubcategory('All');
                        setFilterBrand('All');
                        setFilterLocation('All');
                        setFilterPriceRange('All');
                        setFilterAvailability('All');
                        setFilterVerifiedOnly(false);
                        setFilterPremiumOnly(false);
                        setFilterFeaturedOnly(false);
                        setFilterTrendingOnly(false);
                        setSearchQuery('');
                      }}
                      className="text-[9px] font-mono text-red-400 hover:underline ml-auto"
                    >
                      Reset All Filters
                    </button>
                  </div>
                );
              })()}

              {/* CATEGORY EXPERIENCE - HIGHLIGHTS FOR SELECTED B2B CATEGORY */}
              {filterCategory !== 'All' && (() => {
                const catData = {
                  'Construction Materials': {
                    description: 'Procure structural high-ductility steel, premium Pozzolana portland cement, chemical aggregates, and vitrified tiles directly from registered regional manufacturers.',
                    brands: ['Tata Steel', 'UltraTech', 'JSW Steel', 'Ambuja'],
                    suppliers: ['Elite Materials Group', 'Tata Steel Enterprise Division'],
                    icon: '🧱',
                    color: 'from-amber-950/20 via-slate-900 to-slate-950 border-amber-500/10 text-amber-400'
                  },
                  'Industrial Equipment': {
                    description: 'Acquire high-performance diesel road rollers, heavy hydraulic crawler excavators, mobile concrete mixers, and batching cranes with certified dispatch operators.',
                    brands: ['Sany Heavy', 'JCB', 'Caterpillar', 'Komatsu'],
                    suppliers: ['Global Tech Equipment Ltd'],
                    icon: '🚜',
                    color: 'from-orange-950/20 via-slate-900 to-slate-950 border-orange-500/10 text-orange-400'
                  },
                  'Professional Services': {
                    description: 'Deploy Level 3 BIM architectural models, wind structural stress simulation drafts, and geotechnical load-bearing calculations stamped by chartered engineers.',
                    brands: ['Aura Studio', 'CAD Experts', 'BIM Solutions', 'StaadPro'],
                    suppliers: ['Aura Spatial Design Studio'],
                    icon: '📐',
                    color: 'from-teal-950/20 via-slate-900 to-slate-950 border-teal-500/10 text-teal-400'
                  },
                  'Financial Services': {
                    description: 'Manage builder project bridge finance networks and section 4(2)(l)(D) RERA compliant trustee escrows backed by accredited commercial banks.',
                    brands: ['National Trust Bank', 'RERA Escrow Node'],
                    suppliers: ['National Trust Bank'],
                    icon: '🏦',
                    color: 'from-sky-950/20 via-slate-900 to-slate-950 border-sky-500/10 text-sky-400'
                  }
                }[filterCategory as 'Construction Materials' | 'Industrial Equipment' | 'Professional Services' | 'Financial Services'];

                if (!catData) return null;

                return (
                  <div className={`relative overflow-hidden bg-gradient-to-r ${catData.color} border p-5 rounded-2xl shadow-lg space-y-4`}>
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <span className="text-4xl p-2 bg-slate-950/60 rounded-xl border border-slate-900 shadow-inner shrink-0">{catData.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Active Category Catalogue</span>
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                          </div>
                          <h3 className="font-display font-extrabold text-base text-white mt-1">{filterCategory}</h3>
                          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-2xl">{catData.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 pt-3.5 border-t border-slate-900/60 text-[11px]">
                      <div className="space-y-1 bg-slate-950/40 p-2.5 rounded-xl border border-slate-900/30">
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Core Sourcing Brands</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {catData.brands.map((b) => (
                            <span key={b} className="bg-slate-950 px-2 py-0.5 rounded-md text-slate-300 font-mono text-[10px] border border-slate-900">
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1 bg-slate-950/40 p-2.5 rounded-xl border border-slate-900/30">
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Featured Enterprise Suppliers</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {catData.suppliers.map((s) => (
                            <span key={s} className="bg-slate-950/80 px-2 py-0.5 rounded-md text-emerald-400 font-bold font-sans text-[10px] border border-emerald-500/10 flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* PRIMARY DIRECTORY HEADER WITH GRID/LIST TOGGLE */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-extrabold text-xs text-slate-300 uppercase tracking-wider">
                      Commercial Sourcing Directory
                    </h3>
                    <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400 rounded-full">
                      {filteredListings.length} Match{filteredListings.length === 1 ? '' : 'es'}
                    </span>
                  </div>
                  
                  {/* Grid/List layout toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500 mr-1.5 hidden sm:inline">Layout View</span>
                    <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-900">
                      <button
                        type="button"
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-slate-900 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                        title="Display Product Grid Catalog"
                      >
                        <Grid className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-slate-900 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                        title="Display Compact Specification List"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Simulated Loading skeletons / Empty states */}
                {isSearching ? (
                  <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-3"}>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-slate-900/10 border border-slate-900/60 p-4 rounded-2xl animate-pulse space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="h-2.5 w-24 bg-slate-800 rounded"></div>
                          <div className="h-2.5 w-12 bg-slate-800 rounded"></div>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-14 h-14 bg-slate-800 rounded-xl shrink-0"></div>
                          <div className="space-y-2 flex-1">
                            <div className="h-3 w-3/4 bg-slate-800 rounded"></div>
                            <div className="h-2.5 w-1/2 bg-slate-800 rounded"></div>
                          </div>
                        </div>
                        <div className="h-10 bg-slate-800/40 rounded-xl"></div>
                        <div className="flex items-center justify-between pt-2">
                          <div className="h-3 w-16 bg-slate-800 rounded"></div>
                          <div className="h-6 w-24 bg-slate-800 rounded-lg"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredListings.length === 0 ? (
                  <div className="bg-slate-900/10 border border-slate-900/60 rounded-2xl p-12 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-slate-200">No B2B listings match parameters</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">Try widening your category filters, clearing the text query, or searching for broader terms like "Steel" or "Cement".</p>
                    </div>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setFilterCategory('All');
                        setFilterSubcategory('All');
                        setFilterBrand('All');
                        setFilterLocation('All');
                        setFilterPriceRange('All');
                        setFilterVerifiedOnly(false);
                        setFilterPremiumOnly(false);
                        setFilterFeaturedOnly(false);
                        setFilterTrendingOnly(false);
                      }}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-emerald-400 border border-slate-800 rounded-xl font-mono text-[10px] font-bold cursor-pointer transition-all"
                    >
                      Reset Directory Filters
                    </button>
                  </div>
                ) : viewMode === 'grid' ? (
                  /* GRID VIEW - ENHANCED PRODUCT CARDS */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredListings.map((item) => {
                      const saved = savedListingIds.includes(item.id);
                      const { initials, colorClass } = getBusinessInitialsAndColor(item.businessName);
                      return (
                        <div
                          key={item.id}
                          className="group bg-gradient-to-b from-slate-900/20 to-slate-950 hover:bg-slate-900/40 border border-slate-900 hover:border-slate-800 p-4.5 rounded-2xl transition-all flex flex-col justify-between gap-4 relative overflow-hidden shadow-md hover:shadow-lg"
                        >
                          {/* Inner Technical Blueprint Grid effect on card hover */}
                          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-10 group-hover:opacity-20 transition-all"></div>
                          
                          {/* Upper Section */}
                          <div className="space-y-3 relative z-10">
                            {/* Company / Supplier Header */}
                            <div className="flex items-center gap-2 bg-slate-950/40 p-2 rounded-xl border border-slate-900/50">
                              <div className={`w-7 h-7 rounded-full border flex items-center justify-center font-mono font-bold text-[9px] shrink-0 ${colorClass}`}>
                                {initials}
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="font-semibold text-slate-350 text-[10.5px] block truncate" title={item.businessName}>{item.businessName}</span>
                                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block font-bold">{item.membershipLevel}</span>
                              </div>
                              {item.verifiedSeller && (
                                <span className="inline-flex items-center gap-0.5 text-[8px] font-mono font-bold text-emerald-450 bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10 uppercase shrink-0">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                  Verified
                                </span>
                              )}
                            </div>

                            <div className="flex justify-between items-center text-[9px] font-mono">
                              <span className="text-slate-500 font-semibold uppercase tracking-wider">{item.category} • {item.subcategory}</span>
                              <div className="flex items-center gap-1 text-slate-400 bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-850">
                                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span className="truncate max-w-[100px]">{item.location}</span>
                              </div>
                            </div>

                            <div className="flex gap-3">
                              {/* Blueprint style Large Product Image placeholder */}
                              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.imagePlaceholderColor} border border-slate-800 flex flex-col items-center justify-center text-3xl shrink-0 shadow-inner group-hover:scale-105 transition-all relative overflow-hidden`}>
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:8px_8px] opacity-30"></div>
                                <span className="relative z-10">{item.imageIcon}</span>
                              </div>

                              <div className="space-y-1 flex-1 min-w-0">
                                <h4 
                                  onClick={() => setSelectedListing(item)}
                                  className="font-bold text-xs text-slate-100 hover:text-emerald-400 cursor-pointer transition-colors leading-snug line-clamp-2"
                                >
                                  {item.name}
                                </h4>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <span className="font-mono text-slate-500">Model:</span>
                                  <span className="font-semibold text-slate-300 truncate">{item.brand} {item.model}</span>
                                </div>
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-400 leading-relaxed font-sans line-clamp-2">{item.shortDescription}</p>
                          </div>

                          {/* Middle KPIs block */}
                          <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-900/60 text-[9px] font-mono relative z-10 bg-slate-950/40 p-1.5 rounded-xl">
                            <div>
                              <span className="text-slate-500 block uppercase tracking-wide">Min Order Qty</span>
                              <span className="text-slate-200 font-bold">{item.moq} {item.unit.split(' ')[0]}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block uppercase tracking-wide">Availability</span>
                              <span className="text-slate-205 font-bold truncate block">{item.availableQuantity || 'In Stock'}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block uppercase tracking-wide">Supplier Rating</span>
                              <span className="text-amber-400 font-bold flex items-center gap-0.5">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                {item.rating}
                              </span>
                            </div>
                          </div>

                          {/* Lower Action bar & specifications */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1.5 relative z-10">
                            <div className="text-left">
                              <span className="text-[8px] font-mono text-slate-500 block uppercase">Wholesale Price</span>
                              <span className="text-xs font-bold text-emerald-400">
                                {item.priceOnRequest ? 'Price On Request' : `${item.price} / ${item.unit.split(' ')[0]}`}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                              {/* Bookmark action */}
                              <button
                                type="button"
                                onClick={() => handleToggleSaveListing(item.id, item.name)}
                                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${saved ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-950 border-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-200'}`}
                                title={saved ? 'Remove Bookmark' : 'Bookmark Product Sku'}
                              >
                                <Bookmark className="w-3.5 h-3.5" />
                              </button>
                              
                              {/* Share action */}
                              <button
                                type="button"
                                onClick={() => {
                                  const textToCopy = `${item.name} (${item.brand}) - Sourced via RealtyConnect™`;
                                  navigator.clipboard.writeText(textToCopy);
                                  showToast('Specification link copied to clipboard!', 'success');
                                  onLogTriggered('B2B_MKT_ITEM_SHARED', 'marketplace', item.id, 'SUCCESS', `Copied secure catalog share link for "${item.name}"`);
                                }}
                                className="p-1.5 rounded-lg bg-slate-950 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                                title="Copy Sourcing Spec Link"
                              >
                                <Share2 className="w-3.5 h-3.5 text-slate-400 hover:text-emerald-400" />
                              </button>

                              {/* Voice Call action */}
                              <button
                                type="button"
                                onClick={() => {
                                  onLogTriggered('B2B_MKT_CALL_CLICKED', 'marketplace', item.id, 'SUCCESS', `User connected secure corporate voice line to ${item.businessName}`);
                                  showToast(`Routing secure voice line to ${item.businessName}...`, 'success');
                                }}
                                className="p-1.5 rounded-lg bg-slate-950 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-emerald-400 transition-all cursor-pointer"
                                title="Route voice call connection"
                              >
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                              </button>

                              {/* WhatsApp action */}
                              <button
                                type="button"
                                onClick={() => {
                                  onLogTriggered('B2B_MKT_WHATSAPP_CLICKED', 'marketplace', item.id, 'SUCCESS', `User initialized WhatsApp procurement chat regarding ${item.name}`);
                                  showToast('WhatsApp trade channel link initialized.', 'success');
                                }}
                                className="p-1.5 rounded-lg bg-slate-950 border border-slate-900 hover:border-slate-800 text-slate-400 transition-all cursor-pointer"
                                title="Connect WhatsApp Trade channel"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setSelectedListing(item)}
                                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white font-mono text-[9px] font-bold rounded-lg transition-all cursor-pointer"
                              >
                                Details
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  setEnquiryModalListing(item);
                                  setEnqMessage(`Greetings ${item.businessName} sales team,\n\nWe are interested in procuring your registered item "${item.name}" under RERA escrow terms.\n\nPlease share commercial discount slabs for a bulk batch delivered to our project site. Thank you.`);
                                }}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[9px] font-mono rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <span>Enquire</span>
                                <Send className="w-2.5 h-2.5 stroke-[2.5]" />
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* LIST VIEW - COMPACT HIGH DENSITY LIST SPREADSHEET LAYOUT */
                  <div className="space-y-2 border border-slate-900 bg-slate-950/60 p-2.5 rounded-2xl">
                    {/* Headers */}
                    <div className="grid grid-cols-12 gap-2 px-3 py-1.5 text-[9px] font-mono text-slate-500 uppercase border-b border-slate-900">
                      <div className="col-span-5">Product Sku & Manufacturer</div>
                      <div className="col-span-2 text-right">Wholesale Price</div>
                      <div className="col-span-2 text-center">Min Order Qty</div>
                      <div className="col-span-1 text-center">Rating</div>
                      <div className="col-span-2 text-right">Actions</div>
                    </div>

                    {filteredListings.map((item) => {
                      const saved = savedListingIds.includes(item.id);
                      const { initials, colorClass } = getBusinessInitialsAndColor(item.businessName);
                      return (
                        <div
                          key={item.id}
                          className="grid grid-cols-12 gap-2 items-center px-3 py-2 bg-slate-900/20 hover:bg-slate-900/40 rounded-xl border border-transparent hover:border-slate-900 transition-all text-xs"
                        >
                          <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                            {/* Compact Initials logo */}
                            <div className={`w-7 h-7 rounded-full border flex items-center justify-center font-mono font-bold text-[9px] shrink-0 ${colorClass}`}>
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <h4 
                                onClick={() => setSelectedListing(item)}
                                className="font-bold text-slate-200 hover:text-emerald-400 cursor-pointer truncate transition-colors"
                              >
                                {item.name}
                              </h4>
                              <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                                <span className="text-slate-300 font-semibold">{item.businessName}</span>
                                {item.verifiedSeller && <span className="text-[8px] font-mono text-emerald-400 font-bold bg-emerald-500/5 px-1 rounded border border-emerald-500/10">Verified</span>}
                              </p>
                            </div>
                          </div>

                          <div className="col-span-2 text-right font-mono font-bold text-emerald-400">
                            {item.priceOnRequest ? 'Request' : item.price}
                          </div>

                          <div className="col-span-2 text-center font-mono text-slate-300">
                            {item.moq} {item.unit.split(' ')[0]}
                          </div>

                          <div className="col-span-1 text-center font-mono">
                            <span className="inline-flex items-center gap-0.5 text-amber-400 font-bold bg-amber-500/5 px-1.5 py-0.5 rounded border border-amber-500/10">
                              <Star className="w-2.5 h-2.5 fill-amber-400" />
                              {item.rating}
                            </span>
                          </div>

                          <div className="col-span-2 flex items-center justify-end gap-1 shrink-0">
                            {/* Bookmark */}
                            <button
                              onClick={() => handleToggleSaveListing(item.id, item.name)}
                              className={`p-1.5 rounded border transition-colors cursor-pointer ${saved ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-slate-950 border-slate-900 text-slate-500 hover:text-slate-300'}`}
                              title="Bookmark Product Sku"
                            >
                              <Bookmark className="w-3 h-3" />
                            </button>

                            {/* Call */}
                            <button
                              onClick={() => {
                                onLogTriggered('B2B_MKT_CALL_CLICKED', 'marketplace', item.id, 'SUCCESS', `User connected secure corporate voice line to ${item.businessName}`);
                                showToast(`Routing secure voice line to ${item.businessName}...`, 'success');
                              }}
                              className="p-1.5 rounded bg-slate-950 border border-slate-900 text-slate-500 hover:text-emerald-400 transition-colors cursor-pointer"
                              title="Route secure voice line"
                            >
                              <Phone className="w-3 h-3" />
                            </button>

                            {/* WhatsApp */}
                            <button
                              onClick={() => {
                                onLogTriggered('B2B_MKT_WHATSAPP_CLICKED', 'marketplace', item.id, 'SUCCESS', `User initialized WhatsApp procurement chat regarding ${item.name}`);
                                showToast('WhatsApp trade channel link initialized.', 'success');
                              }}
                              className="p-1.5 rounded bg-slate-950 border border-slate-900 text-slate-500 hover:text-emerald-400 transition-colors cursor-pointer"
                              title="Connect WhatsApp Trade channel"
                            >
                              <MessageSquare className="w-3 h-3 text-emerald-400" />
                            </button>

                            <button
                              onClick={() => setSelectedListing(item)}
                              className="px-1.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded font-mono text-[9px] font-bold text-slate-300 transition-colors cursor-pointer"
                            >
                              Open
                            </button>
                            <button
                              onClick={() => {
                                setEnquiryModalListing(item);
                                setEnqMessage(`Greetings ${item.businessName} sales team,\n\nWe are interested in procuring your registered item "${item.name}" under RERA escrow terms.\n\nPlease share commercial discount slabs for a bulk batch delivered to our project site. Thank you.`);
                              }}
                              className="px-1.5 py-1 bg-emerald-500 hover:bg-emerald-600 rounded font-mono text-[9px] font-bold text-slate-950 transition-colors cursor-pointer"
                            >
                              Enquire
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SIDE FEATURED SECTIONS: TOP SUPPLIERS & RECENT LOGS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* Premium Businesses & Top rated suppliers */}
                <div className="bg-slate-900/10 border border-slate-900/60 rounded-2xl p-4 space-y-3">
                  <h4 className="font-display font-extrabold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    Premium Rated Suppliers Grid
                  </h4>
                  <div className="space-y-2">
                    {premiumSuppliers.map((supplier, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-900 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <div>
                            <strong className="text-slate-200 block text-[11px]">{supplier.name}</strong>
                            <span className="text-[8px] font-mono text-amber-400 uppercase tracking-wider">{supplier.level}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-mono">
                          <span className="text-slate-400">Rating: </span>
                          <strong className="text-amber-400 font-bold flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400" />{supplier.rating}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Compliance notes / Help */}
                <div className="bg-slate-900/10 border border-slate-900/60 rounded-2xl p-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h4 className="font-display font-extrabold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      RealtyConnect Sourcing Compliance
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      All B2B listings displayed represent verified businesses registered under official RERA frameworks. RealityConnect guarantees escrow capabilities, automated tax invoice audits, and continuous corporate background checks.
                    </p>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-900 flex items-center gap-2 text-[10px] font-mono text-emerald-400 mt-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>100% Tax Invoiced and RERA Registered</span>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* DETAILED VIEW MODE FOR A SELECTED PRODUCT */}
      {selectedListing && (
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-900 rounded-2xl p-6 space-y-6 animate-fade-in text-xs relative overflow-hidden shadow-2xl">
          {/* Subtle architectural design elements */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20 pointer-events-none"></div>

          {/* Back controller */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-900 relative z-10">
            <button
              onClick={() => setSelectedListing(null)}
              className="px-3.5 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-900 text-slate-300 font-mono font-bold text-[10px] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer hover:border-slate-800"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>Back to Marketplace Directory</span>
            </button>
            <div className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span>Cataloged SKU ID: <strong className="text-slate-300 font-semibold">{selectedListing.id}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
            
            {/* Left column: Image mock, Multi-gallery zoom, brochure download */}
            <div className="lg:col-span-4 space-y-5">
              
              {/* Image box with Hover Magnifying Zoom */}
              <div className="space-y-3">
                <div 
                  className="relative aspect-square rounded-2xl bg-slate-950 border border-slate-900 overflow-hidden flex flex-col items-center justify-center p-6 text-center select-none cursor-zoom-in group shadow-inner"
                  onMouseEnter={() => setZoomActive(true)}
                  onMouseLeave={() => setZoomActive(false)}
                  onMouseMove={(e) => {
                    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - left) / width) * 100;
                    const y = ((e.clientY - top) / height) * 100;
                    setZoomPosition({ x, y });
                  }}
                >
                  {/* Grid lines to resemble draft paper */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:12px_12px] opacity-40 pointer-events-none"></div>
                  
                  {/* Main Gallery State Rendering */}
                  {galleryIndex === 0 && (
                    <div className="space-y-3 relative z-10">
                      <span className="text-6xl filter drop-shadow-md block transform group-hover:scale-105 transition-all">{selectedListing.imageIcon}</span>
                      <div>
                        <h5 className="font-bold text-xs text-slate-200 uppercase tracking-widest">{selectedListing.brand}</h5>
                        <p className="text-[9px] font-mono text-slate-500 uppercase mt-0.5">{selectedListing.model}</p>
                      </div>
                    </div>
                  )}

                  {galleryIndex === 1 && (
                    <div className="w-full h-full flex flex-col items-center justify-center space-y-2 p-4 text-slate-400 font-mono relative z-10">
                      <Layers className="w-10 h-10 text-emerald-400 opacity-60" />
                      <span className="text-[10px] uppercase font-bold text-slate-300">CAD Blueprint Draft</span>
                      <div className="w-full border-t border-dashed border-slate-900/60 my-1"></div>
                      <span className="text-[8px] text-slate-500 text-center leading-normal">
                        X-AXIS TOLERANCE: ±0.02mm<br />
                        TENSILE BREAK POINT: 415 MPa
                      </span>
                    </div>
                  )}

                  {galleryIndex === 2 && (
                    <div className="w-full h-full flex flex-col items-center justify-center space-y-2 p-4 text-slate-400 font-mono relative z-10">
                      <Sparkles className="w-10 h-10 text-indigo-400 opacity-60" />
                      <span className="text-[10px] uppercase font-bold text-slate-300">Constituent Chemical Spec</span>
                      <div className="w-full border-t border-dashed border-slate-900/60 my-1"></div>
                      <span className="text-[8px] text-slate-500 text-center leading-normal">
                        CALCIUM SILICATE: 63%<br />
                        ALUMINA COMPOUND: 8.5%
                      </span>
                    </div>
                  )}

                  {galleryIndex === 3 && (
                    <div className="w-full h-full flex flex-col items-center justify-center space-y-2 p-4 text-slate-400 font-mono relative z-10">
                      <Building className="w-10 h-10 text-teal-400 opacity-60" />
                      <span className="text-[10px] uppercase font-bold text-slate-300">Wholesale Bulk Packaging</span>
                      <div className="w-full border-t border-dashed border-slate-900/60 my-1"></div>
                      <span className="text-[8px] text-slate-500 text-center leading-normal">
                        PALLET WRAPPED CONTAINER LOAD<br />
                        Moisture Protected Shielding
                      </span>
                    </div>
                  )}

                  <div className="absolute top-2.5 right-2.5 text-[8px] font-mono bg-slate-950 border border-slate-900 px-2 py-0.5 rounded text-emerald-400 uppercase tracking-widest">
                    RERA Secure SKU
                  </div>

                  {/* Dynamic Hover Zoom Magnifier Glass overlay */}
                  {zoomActive && (
                    <div 
                      className="absolute inset-0 bg-slate-950/90 pointer-events-none border border-emerald-500/10 flex items-center justify-center"
                      style={{
                        backgroundImage: `radial-gradient(circle, transparent 20%, #030712 80%)`
                      }}
                    >
                      <div className="text-center font-mono space-y-1 p-4">
                        <span className="text-emerald-400 text-base font-extrabold uppercase tracking-widest animate-pulse">Spec Magnified 2.0X</span>
                        <p className="text-[8px] text-slate-500 leading-normal">
                          COORDINATES: X: {zoomPosition.x.toFixed(1)}% | Y: {zoomPosition.y.toFixed(1)}%<br />
                          Hovering Over Primary Spec Matrix
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Interactive thumbnails row */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Primary Sku', icon: '🛠️' },
                    { label: 'CAD Draft', icon: '📐' },
                    { label: 'Constituent', icon: '🔬' },
                    { label: 'Packaging', icon: '📦' }
                  ].map((thumb, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setGalleryIndex(idx);
                        onLogTriggered('B2B_MKT_GALLERY_THUMB_CLICKED', 'marketplace', selectedListing.id, 'SUCCESS', `User selected gallery thumbnail ${idx} (${thumb.label})`);
                      }}
                      className={`py-2 px-1 rounded-xl border font-mono text-[8px] uppercase tracking-wider text-center flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${galleryIndex === idx ? 'bg-slate-950 border-emerald-500/40 text-emerald-400 font-extrabold' : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-300'}`}
                    >
                      <span className="text-sm">{thumb.icon}</span>
                      <span className="truncate w-full">{thumb.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Commercial brochure mock & technical downloads list */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 space-y-3 shadow-md">
                <h5 className="font-bold text-xs text-slate-200 font-mono uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  Wholesale Sourcing Documents
                </h5>
                <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                  Inspect physical stress certifications, biochemical safety protocols, environmental compliance certificates, and commercial quotation drafts.
                </p>

                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      onLogTriggered('B2B_MKT_BROCHURE_DOWNLOADED', 'marketplace', selectedListing.id, 'SUCCESS', `Downloaded technical spec brief PDF for ${selectedListing.name}`);
                      showToast(`Technical Datasheet downloaded successfully.`, 'success');
                    }}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-850 hover:border-slate-800 text-emerald-400 font-mono font-bold text-[10px] rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Technical Spec Sheet (.PDF)</span>
                  </button>

                  <button
                    onClick={() => {
                      onLogTriggered('B2B_MKT_STRESS_REPORT_DOWNLOADED', 'marketplace', selectedListing.id, 'SUCCESS', `Downloaded compressive test certificates for ${selectedListing.name}`);
                      showToast('Compressive stress test report (.PDF) downloaded.', 'success');
                    }}
                    className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-slate-850 text-slate-400 hover:text-slate-200 font-mono text-[9px] rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3 h-3 text-slate-500" />
                    <span>Stress Certification (.PDF)</span>
                  </button>

                  <button
                    onClick={() => {
                      onLogTriggered('B2B_MKT_CAD_DOWNLOADED', 'marketplace', selectedListing.id, 'SUCCESS', `Downloaded 3D STEP assets for ${selectedListing.name}`);
                      showToast('3D CAD STEP file downloaded to workspace.', 'success');
                    }}
                    className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-slate-850 text-slate-400 hover:text-slate-200 font-mono text-[9px] rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3 h-3 text-slate-500" />
                    <span>2D / 3D CAD Drawing (.DWG / .STEP)</span>
                  </button>
                </div>
              </div>

              {/* Video introduction mock */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 space-y-3 shadow-md">
                <h5 className="font-bold text-xs text-slate-200 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-amber-400" />
                  Product Field Demonstration
                </h5>
                <p className="text-[10px] text-slate-400 leading-relaxed">Watch the 2-minute physical factory quality run and active deployment video in regional development towers.</p>
                
                <button
                  onClick={() => {
                    onLogTriggered('B2B_MKT_VIDEO_PLAYED', 'marketplace', selectedListing.id, 'SUCCESS', `User launched factory demo video for ${selectedListing.name}`);
                    showToast('Playing factory demonstration stream...', 'info');
                  }}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-amber-400 hover:text-amber-300 font-mono font-bold text-[10px] rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5 animate-pulse" />
                  <span>Stream Video Demonstration</span>
                </button>
              </div>

            </div>

            {/* Middle Column: Detailed specs, description, Related products */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Product name & badges */}
              <div className="space-y-2 bg-slate-950 p-4.5 rounded-2xl border border-slate-900 shadow-md">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-semibold uppercase border border-emerald-500/10">{selectedListing.category}</span>
                  <span className="text-[9px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{selectedListing.subcategory}</span>
                  {selectedListing.featured && (
                    <span className="text-[8px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/15 font-bold uppercase tracking-widest">Featured</span>
                  )}
                </div>
                <h3 className="font-display font-extrabold text-base text-white leading-snug tracking-tight mt-1">{selectedListing.name}</h3>
                
                <div className="grid grid-cols-2 gap-4 text-[10px] font-mono text-slate-400 pt-2.5 border-t border-slate-900">
                  <span>Sourcing Brand: <strong className="text-slate-200">{selectedListing.brand}</strong></span>
                  <span className="text-right">Model Specification: <strong className="text-slate-200">{selectedListing.model}</strong></span>
                </div>
              </div>

              {/* Complete Description */}
              <div className="space-y-2.5">
                <h4 className="font-display font-extrabold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-emerald-400" />
                  Product Sourcing Summary
                </h4>
                <p className="bg-slate-950/80 p-4.5 rounded-2xl border border-slate-900 font-sans text-slate-300 leading-relaxed text-[11px] whitespace-pre-line shadow-inner">
                  {selectedListing.detailedDescription}
                </p>
              </div>

              {/* Complete Specifications Grid */}
              <div className="space-y-2.5">
                <h4 className="font-display font-extrabold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Technical Specifications Matrix
                </h4>
                <div className="bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-md">
                  {selectedListing.specifications.map((spec, i) => (
                    <div 
                      key={i} 
                      className={`grid grid-cols-2 p-3 text-[10px] font-mono leading-none border-b border-slate-900 last:border-b-0 ${i % 2 === 0 ? 'bg-slate-900/10' : 'bg-transparent'}`}
                    >
                      <span className="text-slate-500 font-semibold">{spec.name}</span>
                      <strong className="text-slate-300 font-bold text-right">{spec.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Similar / Related products */}
              <div className="space-y-2.5">
                <h4 className="font-display font-extrabold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Similar Products from Verified Suppliers
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {listings.filter(l => l.category === selectedListing.category && l.id !== selectedListing.id).slice(0, 2).map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => {
                        setSelectedListing(item);
                        onLogTriggered('B2B_MKT_RELATED_PRODUCT_NAVIGATED', 'marketplace', item.id, 'SUCCESS', `Navigated to related product catalog: ${item.name}`);
                      }}
                      className="group p-3.5 bg-slate-950 border border-slate-900 hover:border-emerald-500/20 rounded-2xl cursor-pointer transition-all flex items-center gap-3 shadow-md"
                    >
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.imagePlaceholderColor} flex items-center justify-center text-xl shrink-0 border border-slate-900 group-hover:scale-105 transition-all`}>
                        {item.imageIcon}
                      </div>
                      <div className="space-y-1 truncate flex-1">
                        <h5 className="font-bold text-[11px] text-slate-200 group-hover:text-emerald-400 transition-colors truncate leading-snug">{item.name}</h5>
                        <p className="text-[9px] text-slate-500 font-mono truncate">{item.brand} • <span className="text-emerald-400 font-sans font-bold">{item.priceOnRequest ? 'Request' : item.price}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Seller profile, pricing terms, Quick enquiry */}
            <div className="lg:col-span-3 space-y-5">
              
              {/* Seller Profile Summary card */}
              {(() => {
                const sDetails = getSupplierDetails(selectedListing.businessName);
                return (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 space-y-3.5 shadow-md">
                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500 uppercase font-bold tracking-widest border-b border-slate-900 pb-2">
                      <Building className="w-4 h-4 text-emerald-400" />
                      <span>Verified Manufacturer Node</span>
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs text-slate-100 flex items-center gap-1.5 leading-none">
                        {selectedListing.businessName}
                        {selectedListing.verifiedSeller && (
                          <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-inner">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                          </span>
                        )}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/5 px-1.5 py-0.2 rounded border border-emerald-500/10 uppercase font-bold tracking-wider">
                          {selectedListing.membershipLevel}
                        </span>
                      </div>
                    </div>

                    <p className="text-[10.5px] text-slate-400 leading-normal font-sans border-b border-slate-900/40 pb-2">
                      {sDetails.overview}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[9px] font-mono py-2.5 border-y border-slate-900">
                      <div>
                        <span className="text-slate-500 block">Sensex Rating</span>
                        <span className="text-slate-200 font-extrabold flex items-center gap-0.5 mt-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {selectedListing.rating} / 5.0
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Established</span>
                        <span className="text-slate-200 font-extrabold mt-0.5 block truncate" title={sDetails.yearsInBusiness}>
                          {sDetails.yearsInBusiness.split(' ')[2] || '2012'} (Live)
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-[10px] text-slate-400 font-mono">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{selectedListing.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>Delivery: {selectedListing.deliveryAvailability}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-sky-400 shrink-0" />
                        <span>Lead Time: {sDetails.leadTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Response: {sDetails.responseRate}</span>
                      </div>
                      <div className="flex items-start gap-2 pt-1 border-t border-slate-900/40">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-[9px] text-slate-400 leading-normal font-mono">{sDetails.compliance}</span>
                      </div>
                    </div>

                {/* Seller Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1.5">
                  <button
                    onClick={() => {
                      onLogTriggered('B2B_MKT_SELLER_PHONE_DIALED', 'marketplace', selectedListing.id, 'SUCCESS', `Dialed sales lead for "${selectedListing.businessName}"`);
                      showToast('Initializing direct telephone dialer...', 'success');
                    }}
                    className="py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 font-mono text-[9px] rounded-lg border border-slate-800 transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>Dial Sales</span>
                  </button>
                  <button
                    onClick={() => {
                      onLogTriggered('B2B_MKT_SELLER_WHATSAPP_DIALED', 'marketplace', selectedListing.id, 'SUCCESS', `Triggered WhatsApp trade link for ${selectedListing.name}`);
                      showToast('Direct WhatsApp chat link established.', 'success');
                    }}
                    className="py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 font-mono text-[9px] rounded-lg border border-slate-800 transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3 text-emerald-400" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
                );
              })()}

              {/* Sourcing terms & rate block */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 space-y-3 shadow-md">
                <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold tracking-widest border-b border-slate-900 pb-2">Wholesale Sourcing Slabs</span>
                <div className="space-y-1">
                  <span className="text-slate-500 block text-[9px] font-mono">Indicative Wholesale Price</span>
                  <span className="text-sm font-display font-extrabold text-emerald-400 block">
                    {selectedListing.priceOnRequest ? 'Price On Request' : `${selectedListing.price} / ${selectedListing.unit.split(' ')[0]}`}
                  </span>
                </div>
                <div className="text-[10px] font-sans text-slate-400 leading-snug py-1.5 border-t border-slate-900 space-y-1.5">
                  <p>• Minimum Order Volume: <strong className="text-slate-200">{selectedListing.moq} {selectedListing.unit}</strong></p>
                  <p>• Delivery Support: <strong className="text-slate-200">{selectedListing.deliveryAvailability}</strong></p>
                  <p>• Logistics Escrow: <strong className="text-slate-200">100% Tax Invoiced</strong></p>
                  <p>• Custom Slabs: <strong className="text-slate-200">Available upon formal enquiry</strong></p>
                </div>
              </div>

              {/* Quick direct inquiry form */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 space-y-3 shadow-md">
                <span className="text-[9px] font-mono text-indigo-400 block uppercase font-bold tracking-wider border-b border-slate-900 pb-2">Secured Escrow RFQ</span>
                
                <form onSubmit={handleSendEnquirySubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase text-slate-500">Procurement Contact Number</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 99000 12345"
                      value={enqSenderPhone}
                      onChange={(e) => setEnqSenderPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1.5 text-[10px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-emerald-500/40"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase text-slate-500">Official RFQ Specifications Message</label>
                    <textarea
                      required
                      rows={4}
                      value={enqMessage}
                      onChange={(e) => setEnqMessage(e.target.value)}
                      placeholder="Specify your cement grade, volume, or timeline requirements..."
                      className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1.5 text-[10px] text-slate-200 outline-none resize-none placeholder:text-slate-600 focus:border-emerald-500/40"
                    />
                  </div>

                  <button
                    type="submit"
                    onClick={() => setEnquiryModalListing(selectedListing)}
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[10px] font-mono rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/10"
                  >
                    <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Dispatch trade Enquiry</span>
                  </button>
                </form>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* MY MARKETPLACE PORTAL */}
      {mktTab === 'my_marketplace' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT MY MARKETPLACE CONTROLLER (4 columns) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Publisher overview */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-5 space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center text-slate-950 font-display font-extrabold text-base">
                  MS
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-200">{currentOrgName()}</h4>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded uppercase">Enterprise Platinum</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center py-2.5 border-y border-slate-900/60 font-mono text-[9px]">
                <div>
                  <span className="text-slate-500 block">MY Listings</span>
                  <span className="text-slate-200 font-bold">{listings.filter(l => l.businessId === (currentOrgId() || 'ent-client')).length} Items</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Saved</span>
                  <span className="text-slate-200 font-bold">{savedListingIds.length} Products</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Enquiries</span>
                  <span className="text-slate-200 font-bold">{enquiries.length} Active</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPublishing(true)}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-display font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/15 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Catalogue Product / Service</span>
              </button>
            </div>

            {/* List of bookmarks / Saved Products */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-4 space-y-3">
              <h4 className="font-display font-extrabold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-indigo-400" />
                Bookmarked B2B Products
              </h4>

              {savedListingIds.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic">No bookmarked products found.</p>
              ) : (
                <div className="space-y-2">
                  {listings.filter(l => savedListingIds.includes(l.id)).map((item) => (
                    <div 
                      key={item.id}
                      className="p-2.5 bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-between gap-3"
                    >
                      <div 
                        onClick={() => setSelectedListing(item)}
                        className="flex items-center gap-2.5 cursor-pointer truncate flex-1"
                      >
                        <span className="text-xl">{item.imageIcon}</span>
                        <div className="truncate">
                          <strong className="text-slate-200 block text-[10px] truncate leading-tight hover:text-emerald-400 transition-colors">{item.name}</strong>
                          <span className="text-[8px] font-mono text-slate-500 truncate block mt-0.5">{item.brand} • {item.priceOnRequest ? 'Request' : item.price}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleSaveListing(item.id, item.name)}
                        className="text-slate-500 hover:text-red-400 transition-colors shrink-0"
                        title="Remove Bookmark"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMNS: LISTINGS LIST / CREATE FORM / ENQUIRIES LOG (8 columns) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* INLINE PRODUCT CATALOGUING FORM (Triggered by button) */}
            {isPublishing ? (
              <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 space-y-4 animate-fade-in">
                
                <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                  <h4 className="font-display font-extrabold text-xs text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
                    <Plus className="w-4 h-4 text-emerald-400" />
                    Catalogue Sourcing Product / Service Listing
                  </h4>
                  <button
                    onClick={() => setIsPublishing(false)}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handlePublishListingSubmit} className="space-y-4 text-xs font-sans">
                  
                  {/* Basic section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Product / Service Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Premium Grade-A OPC 53 Cement Bags"
                        value={newListing.name}
                        onChange={(e) => setNewListing({ ...newListing, name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Core Category *</label>
                      <select
                        value={newListing.category}
                        onChange={(e) => setNewListing({ ...newListing, category: e.target.value as any, subcategory: e.target.value === 'Professional Services' ? 'Architecture' : 'Cement' })}
                        className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none"
                      >
                        <option value="Construction Materials">Construction Materials</option>
                        <option value="Industrial Equipment">Industrial Equipment</option>
                        <option value="Professional Services">Professional Services</option>
                        <option value="Financial Services">Financial Services</option>
                      </select>
                    </div>
                  </div>

                  {/* Subcat & Brand */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Subcategory *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Cement, Steel, Interior Design"
                        value={newListing.subcategory}
                        onChange={(e) => setNewListing({ ...newListing, subcategory: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Brand Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. UltraTech, Tata Steel, Self-Owned"
                        value={newListing.brand}
                        onChange={(e) => setNewListing({ ...newListing, brand: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Model / Grade</label>
                      <input
                        type="text"
                        placeholder="e.g. OPC Grade 53, Fe550D"
                        value={newListing.model}
                        onChange={(e) => setNewListing({ ...newListing, model: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                      />
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Short Catchy Description *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ultra-fine heavy concrete cement with rapid setting for foundation columns."
                        value={newListing.shortDescription}
                        onChange={(e) => setNewListing({ ...newListing, shortDescription: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Detailed Specifications & Sourcing Terms *</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Provide deep architectural specifications, standard warranties, regional test certificates, packing details, and shipping terms..."
                        value={newListing.detailedDescription}
                        onChange={(e) => setNewListing({ ...newListing, detailedDescription: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none resize-none"
                      />
                    </div>
                  </div>

                  {/* MOQ, Price & Units */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Min Order Qty (MOQ)</label>
                      <input
                        type="text"
                        placeholder="e.g. 50"
                        value={newListing.moq}
                        onChange={(e) => setNewListing({ ...newListing, moq: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Unit</label>
                      <input
                        type="text"
                        placeholder="e.g. Bags, Metric Tons, Sq.M."
                        value={newListing.unit}
                        onChange={(e) => setNewListing({ ...newListing, unit: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Price (indicative, ₹)</label>
                      <input
                        type="number"
                        disabled={newListing.priceOnRequest}
                        placeholder="e.g. 450"
                        value={newListing.price}
                        onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none disabled:opacity-40"
                      />
                    </div>

                    <div className="space-y-1 flex flex-col justify-end">
                      <label className="flex items-center gap-2 text-xs text-slate-300 py-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={!!newListing.priceOnRequest}
                          onChange={(e) => setNewListing({ ...newListing, priceOnRequest: e.target.checked, price: e.target.checked ? '' : newListing.price })}
                          className="rounded border-slate-900 bg-slate-950 text-emerald-500 focus:ring-0 w-3.5 h-3.5"
                        />
                        <span className="font-mono text-[10px]">Price On Request</span>
                      </label>
                    </div>
                  </div>

                  {/* Location & Delivery range */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Primary Location *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mumbai, Maharashtra"
                        value={newListing.location}
                        onChange={(e) => setNewListing({ ...newListing, location: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Delivery Availability *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Pan-India, Local only"
                        value={newListing.deliveryAvailability}
                        onChange={(e) => setNewListing({ ...newListing, deliveryAvailability: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Total Available Quantity</label>
                      <input
                        type="text"
                        placeholder="e.g. 5000 MT, Unlimited"
                        value={newListing.availableQuantity}
                        onChange={(e) => setNewListing({ ...newListing, availableQuantity: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                      />
                    </div>
                  </div>

                  {/* Specifications sub-fields builder */}
                  <div className="space-y-2 pt-2 border-t border-slate-900">
                    <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Technical Specifications Attributes</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(newListing.specifications || []).map((spec, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Attribute e.g. Grade"
                            value={spec.name}
                            onChange={(e) => {
                              const updated = [...(newListing.specifications || [])];
                              updated[i].name = e.target.value;
                              setNewListing({ ...newListing, specifications: updated });
                            }}
                            className="w-1/2 bg-slate-950 border border-slate-900 rounded p-1.5 text-[10px] outline-none text-slate-300"
                          />
                          <input
                            type="text"
                            placeholder="Value e.g. PPC Premium"
                            value={spec.value}
                            onChange={(e) => {
                              const updated = [...(newListing.specifications || [])];
                              updated[i].value = e.target.value;
                              setNewListing({ ...newListing, specifications: updated });
                            }}
                            className="w-1/2 bg-slate-950 border border-slate-900 rounded p-1.5 text-[10px] outline-none text-slate-300"
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewListing({ ...newListing, specifications: [...(newListing.specifications || []), { name: '', value: '' }] })}
                      className="text-[10px] font-mono text-emerald-400 hover:underline"
                    >
                      + Add Attribute Row
                    </button>
                  </div>

                  {/* Submit and cancel */}
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsPublishing(false)}
                      className="px-4 py-2 bg-slate-950 border border-slate-900 text-slate-400 font-mono text-[10px] font-bold rounded-lg hover:border-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-mono text-[10px] font-bold rounded-lg shadow-lg cursor-pointer"
                    >
                      Catalogue and Publish Listing
                    </button>
                  </div>

                </form>

              </div>
            ) : null}

            {/* MY COMMERCIALLY PUBLISHED LISTINGS PANEL */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-4 space-y-4">
              <h4 className="font-display font-extrabold text-xs text-slate-200 uppercase tracking-wider flex items-center justify-between border-b border-slate-900 pb-2.5">
                <span>My Published Commercial Catalog</span>
                <span className="text-[10px] text-slate-500 font-mono">Published under MultiSarv ID</span>
              </h4>

              {listings.filter(l => l.businessId === (currentOrgId() || 'ent-client')).length === 0 ? (
                <div className="p-8 text-center bg-slate-950/20 rounded-xl border border-slate-900">
                  <p className="text-slate-500 italic">No products catalogued yet. Click "Catalogue Product" above to list your commercial supplies!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {listings.filter(l => l.businessId === (currentOrgId() || 'ent-client')).map((item) => (
                    <div 
                      key={item.id}
                      className="p-3 bg-slate-950 border border-slate-900 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span className="text-3xl shrink-0">{item.imageIcon}</span>
                        <div className="truncate">
                          <h5 className="font-bold text-xs text-slate-100 hover:text-emerald-400 cursor-pointer transition-colors leading-none truncate" onClick={() => setSelectedListing(item)}>
                            {item.name}
                          </h5>
                          <span className="text-[9px] font-mono text-slate-500 block mt-1 uppercase">MOQ: {item.moq} {item.unit} • {item.priceOnRequest ? 'Price on request' : item.price}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-bold rounded border border-emerald-500/15 uppercase">
                          Published
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setListings(prev => prev.filter(l => l.id !== item.id));
                            showToast('Catalogue listing removed.', 'info');
                          }}
                          className="p-1.5 bg-slate-900 hover:bg-red-500/10 hover:text-red-400 text-slate-500 rounded border border-slate-800 transition-all cursor-pointer"
                          title="Delete Listing"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PRODUCT ENQUIRIES PANEL (Incoming and Outgoing logs) */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-4 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-2.5">
                <h4 className="font-display font-extrabold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  Sourcing Enquiries & Trade Leads Log
                </h4>
                <span className="text-[9px] text-slate-500 font-mono">1.5s Auto Callback Active</span>
              </div>

              {enquiries.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/20 rounded-xl border border-slate-900">
                  <p className="text-slate-500 italic">No trade inquiries logged yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {enquiries.map((enq) => (
                    <div 
                      key={enq.id}
                      className="bg-slate-950 border border-slate-900 rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[10px] font-mono border-b border-slate-900 pb-2 gap-2">
                        <div className="space-y-0.5">
                          <span className="text-slate-500 block uppercase">Product Enquired</span>
                          <span className="text-slate-200 font-bold block truncate max-w-sm">{enq.listingName}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-slate-500 block">{enq.timestamp}</span>
                          <span className={`inline-block px-1.5 py-0.2 rounded text-[8px] font-bold uppercase mt-0.5 ${enq.status === 'Replied' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400 animate-pulse'}`}>
                            {enq.status}
                          </span>
                        </div>
                      </div>

                      {/* Sender metadata */}
                      <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-slate-400">
                        <span>Sender: <strong className="text-slate-200">{enq.senderName}</strong></span>
                        <span>Phone: <strong className="text-slate-200">{enq.senderPhone}</strong></span>
                        <span>Email: <strong className="text-slate-200">{enq.senderEmail}</strong></span>
                      </div>

                      {/* Custom Enquiry Message */}
                      <div className="bg-slate-900/30 p-3 rounded-xl border border-slate-900 font-sans text-slate-300 leading-relaxed text-[11px]">
                        "{enq.message}"
                      </div>

                      {/* Trade coordinate reply */}
                      {enq.reply && (
                        <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 text-emerald-300 space-y-1">
                          <div className="flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400 uppercase">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Trade Officer Quotation Callback</span>
                          </div>
                          <p className="font-sans leading-relaxed text-[10.5px] whitespace-pre-line">{enq.reply}</p>
                        </div>
                      )}

                      {/* Interactive Messaging integration actions */}
                      <div className="flex gap-2 pt-2 border-t border-slate-900/60 mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            const newConversationId = `conv-mkt-${enq.listingId}`;
                            // Force check in conversations list
                            try {
                              const conversationsJson = appStore.getItem('realtyconnect_conversations');
                              let conversationsList = conversationsJson ? JSON.parse(conversationsJson) : [];
                              const exists = conversationsList.some((c: any) => c.id === newConversationId);
                              
                              if (!exists) {
                                // Seed a conversation if it doesn't exist
                                const newConv = {
                                  id: newConversationId,
                                  companyName: enq.sellerName,
                                  companyId: enq.sellerId,
                                  logoBg: 'bg-emerald-600',
                                  conversationType: 'Marketplace Enquiry' as const,
                                  lastMessageText: enq.message,
                                  lastMessageTime: enq.timestamp,
                                  unreadCount: 0,
                                  priority: 'Normal' as const,
                                  pinned: false,
                                  archived: false,
                                  assignedExecutive: currentUserName(),
                                  relatedEntity: {
                                    type: 'Marketplace' as const,
                                    id: enq.listingId,
                                    title: enq.listingName
                                  },
                                  messages: [
                                    {
                                      id: `msg-mkt-sys-${Date.now()}`,
                                      sender: 'system' as any,
                                      senderName: 'System',
                                      senderCompany: 'RealtyConnect',
                                      text: `B2B Sourcing Enquiry submitted for listing: ${enq.listingName}.`,
                                      timestamp: enq.timestamp,
                                      type: 'system' as const
                                    },
                                    {
                                      id: `msg-mkt-user-${Date.now()}`,
                                      sender: 'self' as any,
                                      senderName: enq.senderName || 'Self',
                                      senderCompany: 'Elite Materials & Co',
                                      text: enq.message,
                                      timestamp: enq.timestamp,
                                      type: 'text' as const,
                                      status: 'read' as const
                                    }
                                  ] as any[]
                                };
                                if (enq.reply) {
                                  newConv.messages.push({
                                    id: `msg-mkt-reply-${Date.now()}`,
                                    sender: 'them' as any,
                                    senderName: 'Sales Specialist',
                                    senderCompany: enq.sellerName,
                                    text: enq.reply,
                                    timestamp: enq.timestamp,
                                    type: 'text' as const
                                  });
                                  newConv.lastMessageText = enq.reply;
                                }
                                conversationsList.unshift(newConv);
                                appStore.setItem('realtyconnect_conversations', JSON.stringify(conversationsList));
                              }
                            } catch (e) {}

                            appStore.setItem('realtyconnect_active_conversation_id', newConversationId);
                            if (setActiveViewMode) {
                              setActiveViewMode('messaging');
                              showToast(`Continuing conversation stream with ${enq.sellerName}`, 'success');
                              onLogTriggered('MKT_COMMUNICATION_RESUMED', 'marketplace', enq.listingId, 'SUCCESS', `CRM: Continued conversation with seller ${enq.sellerName}`);
                            } else {
                              showToast('Active conversation configured. Select B2B Messaging to chat!', 'info');
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Message Seller
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            // Find and inspect this listing
                            const matchedListing = listings.find(l => l.id === enq.listingId);
                            if (matchedListing) {
                              setSelectedListing(matchedListing);
                              setViewMode('details');
                              showToast(`Inspecting listing: ${matchedListing.name}`, 'info');
                            } else {
                              showToast('Item listing profile could not be located.', 'error');
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Related Product
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* REACTION ENQUIRY DIALOG MODAL */}
      {enquiryModalListing && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl max-w-lg w-full space-y-4 animate-fade-in text-xs font-sans">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-900">
              <h4 className="font-display font-extrabold text-xs text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
                <Mail className="w-4 h-4 text-emerald-400" />
                Dispatch Trade Sourcing Inquiry
              </h4>
              <button onClick={() => setEnquiryModalListing(null)} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 bg-slate-900/30 p-3 rounded-xl border border-slate-900">
              <span className="text-[8px] font-mono text-slate-500 block uppercase">Selected Catalog Sku</span>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{enquiryModalListing.imageIcon}</span>
                <div>
                  <h5 className="font-bold text-slate-200 leading-tight">{enquiryModalListing.name}</h5>
                  <p className="text-[9px] font-mono text-slate-500 mt-0.5">{enquiryModalListing.businessName} • MOQ: {enquiryModalListing.moq} {enquiryModalListing.unit}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSendEnquirySubmit} className="space-y-3">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-slate-500">Contact Representative</label>
                  <input
                    type="text"
                    required
                    value={enqSenderName}
                    onChange={(e) => setEnqSenderName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 focus:border-emerald-500 rounded px-3 py-1.5 text-xs text-slate-200 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-slate-500">Contact Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 99000 12345"
                    value={enqSenderPhone}
                    onChange={(e) => setEnqSenderPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 focus:border-emerald-500 rounded px-3 py-1.5 text-xs text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-slate-500">Sourcing Request details *</label>
                <textarea
                  required
                  rows={4}
                  value={enqMessage}
                  onChange={(e) => setEnqMessage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 focus:border-emerald-500 rounded px-3 py-1.5 text-xs text-slate-200 outline-none resize-none"
                />
                <span className="text-[9px] font-mono text-slate-500 block leading-snug">
                  * Note: Inquiries are securely transmitted over RealtyConnect channels with auto-verified audit credentials.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setEnquiryModalListing(null)}
                  className="px-4 py-2 bg-slate-950 border border-slate-900 text-slate-400 font-mono text-[9px] font-bold rounded-lg hover:border-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-mono text-[9px] font-bold rounded-lg shadow-lg cursor-pointer"
                >
                  Dispatch Secured Enquiry
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
