/**
 * RealtyConnect™ Sprint 08 - Enterprise Business Feed & Industry Updates Module
 * A premium professional B2B update aggregator and publishing engine.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Flag, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Paperclip, 
  Download, 
  ExternalLink, 
  TrendingUp, 
  Building, 
  Briefcase, 
  Award, 
  ShieldAlert, 
  FileText, 
  Check, 
  MoreHorizontal,
  SlidersHorizontal,
  ChevronRight,
  Info,
  Clock,
  Send,
  AlertTriangle,
  Flame,
  Globe,
  Bell,
  X,
  PlusCircle,
  Hash,
  Play,
  Volume2,
  Sparkles,
  Users,
  Handshake,
  Lock,
  Eye,
  CheckSquare,
  Trash2,
  Edit2,
  FileCode,
  ShieldCheck,
  ShoppingBag,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface FeedComment {
  id: string;
  authorName: string;
  authorCategory: string;
  logoBg: string;
  content: string;
  timestamp: string;
  likes: number;
  likedByUser?: boolean;
  isPinned?: boolean;
  replies?: Array<{
    id: string;
    authorName: string;
    authorCategory: string;
    logoBg: string;
    content: string;
    timestamp: string;
    likes: number;
  }>;
}

export interface FeedPost {
  id: string;
  companyId: string;
  companyName: string;
  category: 'Builders' | 'Developers' | 'Contractors' | 'Material Vendors' | 'Banks' | 'Consultants' | 'DSA' | 'Recruitment' | 'Equipment' | 'Transport';
  logoBg: string;
  logoText: string;
  verified: boolean;
  premium: boolean;
  timestamp: string;
  postType: 
    | 'New Project'
    | 'Project Completion'
    | 'Tender Published'
    | 'RFQ Requirement'
    | 'Material Requirement'
    | 'New Product Launch'
    | 'New Service'
    | 'Hiring'
    | 'Company Achievement'
    | 'Award'
    | 'Branch Opening'
    | 'Business Partnership'
    | 'Industry Event'
    | 'Government Circular'
    | 'RERA Update'
    | 'Market Update'
    | 'Price Update';
  title: string;
  description: string;
  location: string;
  distanceKm: number; // For Nearby Businesses filter
  tags: string[];
  visibility?: 'Public Network' | 'Connections Only';
  imagePlaceholder?: {
    gradient: string;
    icon: string;
    label: string;
  };
  documentPlaceholder?: {
    name: string;
    size: string;
    format: string;
  };
  videoPlaceholder?: {
    title: string;
    duration: string;
    views: number;
  };
  likesCount: number;
  likedByUser?: boolean;
  savedByUser?: boolean;
  comments: FeedComment[];
  isFeatured?: boolean;
  isTrending?: boolean;
}

// Seed posts representing real-estate B2B transactions and critical updates
export const INITIAL_POSTS: FeedPost[] = [
  {
    id: 'post-1',
    companyId: 'ent-1',
    companyName: 'Apex Developers Ltd',
    category: 'Developers',
    logoBg: 'bg-indigo-600',
    logoText: 'AD',
    verified: true,
    premium: true,
    timestamp: '2026-07-16 09:30 AM',
    postType: 'New Project',
    title: 'Launch of Apex Green Meadows: Eco-certified Smart Township in Bandra Kurla Complex',
    description: 'We are thrilled to unveil our flagship sustainable smart residential development. Spanning over 15 acres, the project incorporates carbon-neutral structural concrete, centralized solar-grid panels, and greywater filtration. We are actively inviting bids from Grade-A civil contractors and MEP engineering consultants.',
    location: 'Bandra Kurla Complex, Mumbai',
    distanceKm: 2.4,
    tags: ['EcoTownship', 'BandraKurla', 'SustainableBuild', 'GradeADevelopment'],
    visibility: 'Public Network',
    imagePlaceholder: {
      gradient: 'from-indigo-950 via-slate-900 to-indigo-900',
      icon: 'Building',
      label: 'Apex Green Meadows - Phase 1 Layout Preview'
    },
    documentPlaceholder: {
      name: 'Apex_Green_Meadows_Procurement_Schedule_Q3.pdf',
      size: '4.8 MB',
      format: 'PDF'
    },
    likesCount: 34,
    likedByUser: false,
    savedByUser: true,
    isFeatured: true,
    isTrending: true,
    comments: [
      {
        id: 'c-1',
        authorName: 'Apex Developers Ltd',
        authorCategory: 'Developers',
        logoBg: 'bg-indigo-600',
        content: 'Pinned: Apex Green Meadows will host a live technical briefing at 2:00 PM UTC. Direct any immediate RFP queries to our bidding register.',
        timestamp: '2026-07-16 09:45 AM',
        likes: 15,
        isPinned: true,
        replies: [
          {
            id: 'r-1-1',
            authorName: 'Nexus Structural Consultants',
            authorCategory: 'Consultants',
            logoBg: 'bg-teal-600',
            content: 'We will be present to review the eco-concrete parameters.',
            timestamp: '2026-07-16 09:50 AM',
            likes: 4
          }
        ]
      },
      {
        id: 'c-2',
        authorName: 'BuildCorp Construction',
        authorCategory: 'Contractors',
        logoBg: 'bg-emerald-600',
        content: 'Fascinating layout. Our shoring and concrete piling teams would love to collaborate on the deep basement excavation phases.',
        timestamp: '2026-07-16 10:15 AM',
        likes: 8,
        replies: []
      }
    ]
  },
  {
    id: 'post-2',
    companyId: 'ent-2',
    companyName: 'BuildCorp Construction',
    category: 'Contractors',
    logoBg: 'bg-emerald-600',
    logoText: 'BC',
    verified: true,
    premium: true,
    timestamp: '2026-07-15 04:45 PM',
    postType: 'Tender Published',
    title: 'Subcontracting Tender: Underground Shoring & Concrete Piling for Metro Line 3 Extension',
    description: 'BuildCorp invites specialized civil engineering agencies to submit formal bids for shoring, excavation, and heavy pile-casting works for Sector 4 and 5 metro corridors. Bidder must possess continuous operation experience on underground metro segments of at least 5 years. Standard escrow facilities will be created for payment release.',
    location: 'Whitefield, Bangalore',
    distanceKm: 4.8,
    tags: ['MetroTender', 'Excavation', 'HeavyCivil', 'BangaloreInfrastructure'],
    visibility: 'Public Network',
    documentPlaceholder: {
      name: 'BuildCorp_Metro_Tender_Piling_Specs_v2.pdf',
      size: '12.4 MB',
      format: 'PDF'
    },
    likesCount: 52,
    likedByUser: false,
    savedByUser: false,
    isFeatured: false,
    isTrending: true,
    comments: [
      {
        id: 'c-3',
        authorName: 'Elite Materials Group',
        authorCategory: 'Material Vendors',
        logoBg: 'bg-amber-600',
        content: 'We have dispatched our ready-mix M55 concrete technical spec sheet for immediate approval for the piling phase.',
        timestamp: '2026-07-15 05:30 PM',
        likes: 12
      }
    ]
  },
  {
    id: 'post-3',
    companyId: 'ent-3',
    companyName: 'Elite Materials Group',
    category: 'Material Vendors',
    logoBg: 'bg-amber-600',
    logoText: 'EM',
    verified: true,
    premium: false,
    timestamp: '2026-07-16 08:15 AM',
    postType: 'Price Update',
    title: 'Q3 Pricing Adjustment: Bulk Reinforcement TMT Bars & High-Strength Ready-Mix Concrete',
    description: 'Notice of steel mill tariff adjustment. Bulk Fe550D TMT reinforcement bars adjusted to ₹53,800 per Metric Ton for contracts booked prior to August 1st. High-strength ready-mix concrete (M40 & M50 grade) prices remain locked. All supplies backed by certified chemical and physical lab testing reports.',
    location: 'Noida Sector 62, Delhi NCR',
    distanceKm: 8.5,
    tags: ['SteelPricing', 'TMTBars', 'MaterialTariffs', 'ReadyMixConcrete'],
    visibility: 'Public Network',
    likesCount: 22,
    likedByUser: false,
    savedByUser: false,
    isFeatured: false,
    isTrending: false,
    comments: []
  },
  {
    id: 'post-4',
    companyId: 'ent-4',
    companyName: 'RealtyConnect Pro Consultants',
    category: 'Consultants',
    logoBg: 'bg-purple-600',
    logoText: 'RC',
    verified: true,
    premium: true,
    timestamp: '2026-07-14 02:20 PM',
    postType: 'RERA Update',
    title: 'Advisory Circular: Essential Quarterly Compliance Disclosures under Section 11',
    description: 'Under the latest RERA authority guidance, developers are required to update plot reservation counts, financial drawdowns from the designated 70% escrow accounts, and structural photos on a monthly basis instead of the previous quarterly cycle. Failure to upload leads to instant penalty triggers. Read our analysis handbook attached.',
    location: 'Gachibowli, Hyderabad',
    distanceKm: 6.2,
    tags: ['RERACompliance', 'Advisory', 'EscrowAudit', 'DeveloperMandates'],
    visibility: 'Public Network',
    documentPlaceholder: {
      name: 'RERA_Section11_Compliance_Analysis_Guide.pdf',
      size: '3.1 MB',
      format: 'PDF'
    },
    likesCount: 45,
    likedByUser: true,
    savedByUser: true,
    isFeatured: true,
    isTrending: false,
    comments: [
      {
        id: 'c-4',
        authorName: 'TaxShield & Associates',
        authorCategory: 'Consultants',
        logoBg: 'bg-slate-600',
        content: 'This will require immediate integration between developers accounting ERP and their RERA uploading portals to avoid compliance delays.',
        timestamp: '2026-07-14 03:05 PM',
        likes: 9
      }
    ]
  },
  {
    id: 'post-5',
    companyId: 'ent-5',
    companyName: 'National Trust Bank',
    category: 'Banks',
    logoBg: 'bg-blue-600',
    logoText: 'NT',
    verified: true,
    premium: true,
    timestamp: '2026-07-13 11:00 AM',
    postType: 'Business Partnership',
    title: 'Strategic Consortium Alliance: Co-lending Pipeline established with Goldman NBFC Corp',
    description: 'We have executed an alliance to create a ₹2,500 Crore syndicated co-lending pool dedicated to financing Tier-1 brownfield redevelopment projects and high-volume smart cities. The facility features unified underwriting standards, centralized construction milestone checks, and dynamic last-mile debt deployment.',
    location: 'Nariman Point, Mumbai',
    distanceKm: 1.1,
    tags: ['ProjectFinancing', 'Consortium', 'RealEstateDebt', 'DeveloperFunding'],
    visibility: 'Public Network',
    imagePlaceholder: {
      gradient: 'from-blue-950 via-slate-900 to-indigo-950',
      icon: 'Award',
      label: 'Partnership Handshake & Strategic Signing Ceremony'
    },
    likesCount: 61,
    likedByUser: false,
    savedByUser: false,
    isFeatured: false,
    isTrending: true,
    comments: []
  },
  {
    id: 'post-6',
    companyId: 'ent-7',
    companyName: 'Global Tech Equipment Ltd',
    category: 'Equipment',
    logoBg: 'bg-cyan-600',
    logoText: 'GT',
    verified: true,
    premium: true,
    timestamp: '2026-07-15 09:15 AM',
    postType: 'New Service',
    title: 'Fleet Expansion: Smart Tower Crane Fleet (12T - 24T) with Live IoT Payload Telemetry',
    description: 'To meet the increasing speed demands of high-rise commercial structures, we have added 15 modern heavy-duty German luffing-jib tower cranes to our rental fleet. All cranes are retrofitted with real-time strain sensors, wind speed triggers, and electronic hook-sway controllers. Fully trained operators and breakdown crews included.',
    location: 'Chinchwad, Pune',
    distanceKm: 5.1,
    tags: ['TowerCranes', 'EquipmentRental', 'SmartSiteIoT', 'ConstructionLease'],
    visibility: 'Connections Only',
    likesCount: 19,
    likedByUser: false,
    savedByUser: false,
    isFeatured: false,
    isTrending: false,
    comments: []
  },
  {
    id: 'post-7',
    companyId: 'ent-22',
    companyName: 'PropTech Systems',
    category: 'Consultants',
    logoBg: 'bg-indigo-850',
    logoText: 'PT',
    verified: true,
    premium: true,
    timestamp: '2026-07-16 11:30 AM',
    postType: 'New Product Launch',
    title: 'Launch of PropTech SiteTrack Mobile App: Live Material Logs & Milestone Triggers',
    description: 'We have launched a field-ready mobile application enabling developers, site engineers, and material store managers to log concrete inventory slumps, TMT bar offloads, and shuttering approvals live from the field. Works offline with auto-sync, fully RERA compliant ledger logs. Request a 15-day enterprise sandbox.',
    location: 'HSR Layout, Bangalore',
    distanceKm: 3.9,
    tags: ['PropTech', 'SiteManagementApp', 'MaterialLedger', 'ConstructionSaaS'],
    visibility: 'Public Network',
    videoPlaceholder: {
      title: 'SiteTrack Mobile Interface Workflow walkthrough & CAD Syncing',
      duration: '02:15',
      views: 312
    },
    likesCount: 31,
    likedByUser: false,
    savedByUser: false,
    isFeatured: false,
    isTrending: true,
    comments: []
  }
];

// Helper to look up premium design configurations for all 13 Post Types
export function getPostTypeConfig(type: string) {
  switch (type) {
    case 'New Project':
    case 'Project Completion':
    case 'Project Update':
      return {
        label: 'Project Update',
        icon: Building,
        color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10',
        glow: 'shadow-[0_0_15px_rgba(99,102,241,0.05)]'
      };
    case 'Tender Published':
    case 'Tender':
      return {
        label: 'Tender',
        icon: FileText,
        color: 'text-amber-400 border-amber-500/20 bg-amber-500/10',
        glow: 'shadow-[0_0_15px_rgba(245,158,11,0.05)]'
      };
    case 'RFQ Requirement':
    case 'RFQ':
      return {
        label: 'RFQ',
        icon: SlidersHorizontal,
        color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/10',
        glow: 'shadow-[0_0_15px_rgba(6,182,212,0.05)]'
      };
    case 'Material Requirement':
    case 'Business Opportunity':
      return {
        label: 'Business Opportunity',
        icon: Briefcase,
        color: 'text-blue-400 border-blue-500/20 bg-blue-500/10',
        glow: 'shadow-[0_0_15px_rgba(59,130,246,0.05)]'
      };
    case 'New Product Launch':
    case 'New Service':
    case 'Marketplace Product':
      return {
        label: 'Marketplace Product',
        icon: ShoppingBag,
        color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
        glow: 'shadow-[0_0_15px_rgba(16,185,129,0.05)]'
      };
    case 'Hiring':
      return {
        label: 'Hiring',
        icon: Users,
        color: 'text-violet-400 border-violet-500/20 bg-violet-500/10',
        glow: 'shadow-[0_0_15px_rgba(139,92,246,0.05)]'
      };
    case 'Award':
      return {
        label: 'Award',
        icon: Award,
        color: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10',
        glow: 'shadow-[0_0_15px_rgba(234,179,8,0.05)]'
      };
    case 'Company Achievement':
    case 'Achievement':
      return {
        label: 'Achievement',
        icon: CheckCircle2,
        color: 'text-green-400 border-green-500/20 bg-green-500/10',
        glow: 'shadow-[0_0_15px_rgba(34,197,94,0.05)]'
      };
    case 'Government Circular':
    case 'Government Update':
      return {
        label: 'Government Update',
        icon: ShieldAlert,
        color: 'text-purple-400 border-purple-500/20 bg-purple-500/10',
        glow: 'shadow-[0_0_15px_rgba(168,85,247,0.05)]'
      };
    case 'RERA Update':
      return {
        label: 'RERA Update',
        icon: AlertTriangle,
        color: 'text-pink-400 border-pink-500/20 bg-pink-500/10',
        glow: 'shadow-[0_0_15px_rgba(236,72,153,0.05)]'
      };
    case 'Industry Event':
    case 'Market Update':
    case 'Price Update':
    case 'Industry News':
      return {
        label: 'Industry News',
        icon: Globe,
        color: 'text-slate-400 border-slate-500/20 bg-slate-500/10',
        glow: 'shadow-[0_0_15px_rgba(148,163,184,0.05)]'
      };
    case 'Branch Opening':
      return {
        label: 'Branch Opening',
        icon: PlusCircle,
        color: 'text-orange-400 border-orange-500/20 bg-orange-500/10',
        glow: 'shadow-[0_0_15px_rgba(249,115,22,0.05)]'
      };
    case 'Business Partnership':
    case 'Partnership':
      return {
        label: 'Partnership',
        icon: Handshake,
        color: 'text-rose-400 border-rose-500/20 bg-rose-500/10',
        glow: 'shadow-[0_0_15px_rgba(244,63,94,0.05)]'
      };
    default:
      return {
        label: 'Corporate Update',
        icon: Building,
        color: 'text-slate-300 border-slate-800 bg-slate-900',
        glow: ''
      };
  }
}

// Format hashtags and @mentions inside descriptions & comments
function formatContentText(text: string) {
  const parts = text.split(/(\s+)/);
  return parts.map((part, idx) => {
    if (part.startsWith('@')) {
      return (
        <span key={idx} className="text-emerald-400 hover:underline cursor-pointer font-semibold font-mono">
          {part}
        </span>
      );
    }
    if (part.startsWith('#')) {
      return (
        <span key={idx} className="text-indigo-400 hover:underline cursor-pointer font-mono font-medium">
          {part}
        </span>
      );
    }
    return part;
  });
}

// Video Player Component
const InteractiveVideoPlayer = ({ title, duration, views }: { title: string; duration: string; views: number }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(25);
  
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(p => (p >= 100 ? 0 : p + 2));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-850 aspect-video group">
      {/* Background blueprint elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-slate-950 flex flex-col justify-between p-4">
        {/* Top telemetry bar */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 z-10">
          <span className="bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 text-[9px] tracking-wider">Streaming • HD 1080P</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {views} Views
          </span>
        </div>

        {/* Center Play Button */}
        <div className="flex flex-col items-center justify-center gap-2 z-10">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-11 h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
          >
            {isPlaying ? (
              <span className="font-mono text-[9px] font-extrabold uppercase">Pause</span>
            ) : (
              <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
            )}
          </button>
          <p className="text-[10px] font-mono text-slate-300 text-center px-4 max-w-sm font-semibold">
            {isPlaying ? "Transmitting real-time project feed frames..." : title}
          </p>
        </div>

        {/* Bottom player controls bar */}
        <div className="space-y-1.5 z-10">
          <div 
            className="w-full h-1 bg-slate-800 rounded-full overflow-hidden cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const percentage = Math.round((clickX / rect.width) * 100);
              setProgress(percentage);
            }}
          >
            <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
            <span>{isPlaying ? `00:${progress.toString().padStart(2, '0')}` : '00:00'} / {duration}</span>
            <div className="flex items-center gap-1.5">
              <Volume2 className="w-3 h-3" />
              <span>MUTED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Image Blueprint Visual Component
const ArchitecturalVisual = ({ label, gradient }: { label: string; gradient: string }) => {
  return (
    <div className={`relative rounded-xl overflow-hidden bg-gradient-to-br ${gradient} border border-slate-800 p-6 flex flex-col items-center justify-center text-center h-44 gap-3`}>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
      <div className="absolute top-2.5 right-2.5 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-850 text-[8px] font-mono text-emerald-400">
        CAD_MODEL_LOCKED
      </div>
      <div className="p-2.5 bg-slate-900/80 rounded-2xl border border-slate-800 backdrop-blur-sm shadow">
        <Building className="w-5 h-5 text-emerald-400" />
      </div>
      <span className="text-[11px] font-mono font-bold text-slate-200 z-10 max-w-xs leading-normal">{label}</span>
      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">MultiSarv Vector CAD Pre-Renderer</span>
    </div>
  );
};

// Document Attachment Component
const DocumentAttachment = ({ name, size, format, onDownload }: { name: string; size: string; format: string; onDownload: () => void }) => {
  return (
    <div className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-xl flex items-center justify-between gap-3 group hover:border-slate-800 transition-all">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-850 flex items-center justify-center text-amber-500 font-bold text-xs relative overflow-hidden shrink-0">
          <FileText className="w-5 h-5 text-amber-500" />
          <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 font-mono text-[6px] font-extrabold px-1 rounded">
            PDF
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-200 truncate max-w-[160px] sm:max-w-md">
            {name}
          </p>
          <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono uppercase tracking-wider">
            <span>{format}</span>
            <span>•</span>
            <span>{size}</span>
            <span>•</span>
            <span className="text-emerald-400 flex items-center gap-0.5">
              <Check className="w-2.5 h-2.5" /> SECURE AUDIT
            </span>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onDownload}
        className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 rounded-lg text-emerald-400 hover:text-emerald-300 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-1 text-[10px] font-mono font-bold uppercase shrink-0"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Get PDF</span>
      </button>
    </div>
  );
};

interface BusinessFeedProps {
  onLogTriggered: (action: string, entity: string, entityId: string, status: 'SUCCESS' | 'FAILURE' | 'WARNING', details: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  savedBusinesses: string[];
  favoriteCompanies: string[];
  following: string[];
  onToggleSave: (id: string, name: string) => void;
  onToggleFavorite: (id: string, name: string) => void;
  onViewBusinessProfile: (id: string) => void;
  connectionsSent: string[];
  onConnectRequest: (id: string, name: string) => void;
  posts?: FeedPost[];
  setPosts?: React.Dispatch<React.SetStateAction<FeedPost[]>>;
}

export default function BusinessFeed({
  onLogTriggered,
  showToast,
  savedBusinesses,
  favoriteCompanies,
  following,
  onToggleSave,
  onToggleFavorite,
  onViewBusinessProfile,
  connectionsSent,
  onConnectRequest,
  posts: propPosts,
  setPosts: propSetPosts
}: BusinessFeedProps) {

  // Dynamic Feed state
  const [localPosts, setLocalPosts] = useState<FeedPost[]>(INITIAL_POSTS);
  const posts = propPosts !== undefined ? propPosts : localPosts;
  const setPosts = propSetPosts !== undefined ? propSetPosts : setLocalPosts;
  
  // Filtering, Search & Loading States
  const [activeFilterCategory, setActiveFilterCategory] = useState<string>('All Posts');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showOnlyVerified, setShowOnlyVerified] = useState<boolean>(false);
  const [isFeedLoading, setIsFeedLoading] = useState<boolean>(false);
  
  // Custom Comment Form State
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  
  // Create Post Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [publishTab, setPublishTab] = useState<'edit' | 'preview'>('edit');
  const [newPostType, setNewPostType] = useState<FeedPost['postType']>('New Project');
  const [newPostTitle, setNewPostTitle] = useState<string>('');
  const [newPostDesc, setNewPostDesc] = useState<string>('');
  const [newPostLoc, setNewPostLoc] = useState<string>('Bandra Kurla, Mumbai');
  const [newPostTags, setNewPostTags] = useState<string>('B2BAlliance, RealtyProject');
  const [newPostDocName, setNewPostDocName] = useState<string>('');
  const [newPostDocSize, setNewPostDocSize] = useState<string>('3.2 MB');
  const [newPostImgStyle, setNewPostImgStyle] = useState<string>('gradient-1');
  const [newPostVis, setNewPostVis] = useState<'Public Network' | 'Connections Only'>('Public Network');
  const [selectedPublisherId, setSelectedPublisherId] = useState<string>('ent-1');

  // Draft Save State
  const [hasSavedDraft, setHasSavedDraft] = useState<boolean>(false);

  // Share Dialog State
  const [sharingPost, setSharingPost] = useState<FeedPost | null>(null);

  // Report Dialog State
  const [reportingPost, setReportingPost] = useState<FeedPost | null>(null);
  const [reportReason, setReportReason] = useState<string>('Irrelevant/Non-business content');
  const [reportText, setReportText] = useState<string>('');

  // 10 Verified companies list
  const PUBLISHER_COMPANIES = useMemo(() => [
    { id: 'ent-1', name: 'Apex Developers Ltd', category: 'Developers', logoBg: 'bg-indigo-600', logoText: 'AD' },
    { id: 'ent-2', name: 'BuildCorp Construction', category: 'Contractors', logoBg: 'bg-emerald-600', logoText: 'BC' },
    { id: 'ent-3', name: 'Elite Materials Group', category: 'Material Vendors', logoBg: 'bg-amber-600', logoText: 'EM' },
    { id: 'ent-4', name: 'RealtyConnect Pro Consultants', category: 'Consultants', logoBg: 'bg-purple-600', logoText: 'RC' },
    { id: 'ent-5', name: 'National Trust Bank', category: 'Banks', logoBg: 'bg-blue-600', logoText: 'NT' },
    { id: 'ent-7', name: 'Global Tech Equipment Ltd', category: 'Equipment', logoBg: 'bg-cyan-600', logoText: 'GT' },
    { id: 'ent-8', name: 'Green Brick Logistics', category: 'Transport', logoBg: 'bg-emerald-700', logoText: 'GB' },
    { id: 'ent-12', name: 'TaxShield & Associates', category: 'Consultants', logoBg: 'bg-slate-600', logoText: 'TS' },
    { id: 'ent-22', name: 'PropTech Systems', category: 'Consultants', logoBg: 'bg-indigo-800', logoText: 'PT' },
    { id: 'ent-25', name: 'Zenith Safety Audits', category: 'Consultants', logoBg: 'bg-amber-800', logoText: 'ZS' }
  ], []);

  // Filter Categories
  const FILTER_OPTIONS = useMemo(() => [
    { name: 'All Posts', label: 'All Activity', count: posts.length, icon: Globe },
    { name: 'Projects', label: 'Projects & Developments', count: posts.filter(p => p.postType === 'New Project' || p.postType === 'Project Completion').length, icon: Building },
    { name: 'Marketplace', label: 'B2B Marketplace', count: posts.filter(p => p.postType === 'New Product Launch' || p.postType === 'New Service').length, icon: ShoppingBag },
    { name: 'RFQs', label: 'Open RFQs & Bids', count: posts.filter(p => p.postType === 'Tender Published' || p.postType === 'RFQ Requirement').length, icon: SlidersHorizontal },
    { name: 'Business Opportunities', label: 'Strategic Opportunities', count: posts.filter(p => p.postType === 'Material Requirement' || p.postType === 'Business Partnership' || p.postType === 'Branch Opening').length, icon: Briefcase },
    { name: 'Hiring', label: 'Careers & Hiring', count: posts.filter(p => p.postType === 'Hiring').length, icon: Users },
    { name: 'Government Updates', label: 'Government Circulars', count: posts.filter(p => p.postType === 'Government Circular' || p.postType === 'RERA Update').length, icon: ShieldAlert },
    { name: 'Industry News', label: 'Industry Highlights', count: posts.filter(p => p.postType === 'Industry Event' || p.postType === 'Market Update' || p.postType === 'Price Update' || p.postType === 'Company Achievement' || p.postType === 'Award').length, icon: Globe },
    { name: 'Following', label: 'Following Companies', count: posts.filter(p => following.includes(p.companyId)).length, icon: Bookmark },
    { name: 'My Posts', label: 'My Corporate Updates', count: posts.filter(p => p.companyId === 'ent-1').length, icon: UserCheck },
    { name: 'Saved Posts', label: 'Saved Highlights', count: posts.filter(p => p.savedByUser || savedBusinesses.includes(p.companyId)).length, icon: Bookmark }
  ], [posts, following, savedBusinesses]);

  // Handle Tab Switch Skeletons
  const handleTabSwitch = (filterName: string) => {
    setActiveFilterCategory(filterName);
    setIsFeedLoading(true);
    const timer = setTimeout(() => {
      setIsFeedLoading(false);
    }, 600);
    onLogTriggered('B2B_FEED_FILTER_CHANGED', 'feed', filterName, 'SUCCESS', `Feed: Toggled main filter mode: ${filterName}`);
    return () => clearTimeout(timer);
  };

  // Map Filter Category to actual postType
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Search term match
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesQuery = 
          post.title.toLowerCase().includes(query) ||
          post.description.toLowerCase().includes(query) ||
          post.companyName.toLowerCase().includes(query) ||
          post.tags.some(tag => tag.toLowerCase().includes(query));
        if (!matchesQuery) return false;
      }

      // Verification Badge filter
      if (showOnlyVerified && !post.verified) return false;

      const isSaved = post.savedByUser || savedBusinesses.includes(post.companyId);

      // Filter tabs mapping
      switch (activeFilterCategory) {
        case 'All Posts':
          return true;
        case 'Projects':
          return post.postType === 'New Project' || post.postType === 'Project Completion';
        case 'Marketplace':
          return post.postType === 'New Product Launch' || post.postType === 'New Service';
        case 'RFQs':
          return post.postType === 'Tender Published' || post.postType === 'RFQ Requirement';
        case 'Business Opportunities':
          return post.postType === 'Material Requirement' || post.postType === 'Business Partnership' || post.postType === 'Branch Opening';
        case 'Hiring':
          return post.postType === 'Hiring';
        case 'Industry News':
          return post.postType === 'Industry Event' || post.postType === 'Market Update' || post.postType === 'Price Update' || post.postType === 'Company Achievement' || post.postType === 'Award';
        case 'Government Updates':
          return post.postType === 'Government Circular' || post.postType === 'RERA Update';
        case 'Following':
          return following.includes(post.companyId);
        case 'My Posts':
          return post.companyId === 'ent-1';
        case 'Saved Posts':
          return isSaved;
        default:
          return true;
      }
    });
  }, [posts, activeFilterCategory, searchTerm, showOnlyVerified, following, savedBusinesses]);

  // Sidebar widgets data
  const trendingPostList = useMemo(() => {
    return [...posts].sort((a, b) => b.likesCount - a.likesCount).slice(0, 3);
  }, [posts]);

  const latestProjects = useMemo(() => {
    return posts.filter(p => p.postType === 'New Project' || p.postType === 'Project Completion').slice(0, 3);
  }, [posts]);

  // Handle post liking
  const handleLikePost = (postId: string, postTitle: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const currentlyLiked = p.likedByUser;
        onLogTriggered(
          currentlyLiked ? 'B2B_POST_UNLIKED' : 'B2B_POST_LIKED',
          'posts',
          postId,
          'SUCCESS',
          `Engagement: User toggled appreciation status on post: "${postTitle}".`
        );
        showToast(currentlyLiked ? 'Removed appreciation from B2B update.' : 'Appreciated B2B updates in feed.', 'success');
        return {
          ...p,
          likedByUser: !currentlyLiked,
          likesCount: currentlyLiked ? p.likesCount - 1 : p.likesCount + 1
        };
      }
      return p;
    }));
  };

  // Handle post saving
  const handleSavePost = (post: FeedPost) => {
    onToggleSave(post.companyId, post.companyName);
    setPosts(prev => prev.map(p => {
      if (p.id === post.id) {
        return { ...p, savedByUser: !p.savedByUser };
      }
      return p;
    }));
  };

  // Submit Comments
  const handleAddComment = (postId: string, postTitle: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) {
      showToast('Comment text cannot be empty.', 'error');
      return;
    }

    const newComment: FeedComment = {
      id: `comment-${Date.now()}`,
      authorName: 'MultiSarv Corporate Admin',
      authorCategory: 'Developers',
      logoBg: 'bg-slate-800',
      content: text,
      timestamp: 'Just Now',
      likes: 0,
      replies: []
    };

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        onLogTriggered(
          'B2B_COMMENT_PUBLISHED',
          'posts',
          postId,
          'SUCCESS',
          `Engagement: Submitted response to update: "${postTitle}".`
        );
        showToast('B2B feedback comment published successfully!', 'success');
        return {
          ...p,
          comments: [...p.comments, newComment]
        };
      }
      return p;
    }));

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  // Like a comment
  const handleLikeComment = (postId: string, commentId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: p.comments.map(c => {
            if (c.id === commentId) {
              const currentlyLiked = c.likedByUser;
              return {
                ...c,
                likedByUser: !currentlyLiked,
                likes: currentlyLiked ? c.likes - 1 : c.likes + 1
              };
            }
            return c;
          })
        };
      }
      return p;
    }));
    showToast('Toggled appreciation for comment.', 'info');
  };

  // Delete comment
  const handleDeleteComment = (postId: string, commentId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: p.comments.filter(c => c.id !== commentId)
        };
      }
      return p;
    }));
    showToast('Deleted response comment.', 'info');
  };

  // Rich Text helper in publisher
  const insertRichTextMarker = (marker: string) => {
    if (marker === 'B') {
      setNewPostDesc(prev => prev + ' **BoldText** ');
    } else if (marker === 'I') {
      setNewPostDesc(prev => prev + ' *ItalicText* ');
    } else if (marker === 'L') {
      setNewPostDesc(prev => prev + '\n- Bullet Point');
    } else if (marker === 'Q') {
      setNewPostDesc(prev => prev + '\n> Corporate Blockquote');
    } else if (marker === 'C') {
      setNewPostDesc(prev => prev + ' `audited_code_spec` ');
    }
    showToast('Inserted rich text placeholder formatting tags.', 'info');
  };

  // Draft handlers
  const handleSaveDraft = () => {
    setHasSavedDraft(true);
    showToast('Corporate update saved as draft successfully.', 'success');
    setShowCreateModal(false);
  };

  const handleClearDraft = () => {
    setHasSavedDraft(false);
    showToast('Draft cache cleared.', 'info');
  };

  // Publish post
  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPostTitle.trim() || !newPostDesc.trim()) {
      showToast('Please enter both a title and description for this corporate update.', 'error');
      return;
    }

    const matchedPublisher = PUBLISHER_COMPANIES.find(c => c.id === selectedPublisherId);
    if (!matchedPublisher) return;

    const processedTags = newPostTags
      .split(',')
      .map(t => t.trim().replace(/#/g, ''))
      .filter(t => t.length > 0);

    const gradients: { [key: string]: string } = {
      'gradient-1': 'from-indigo-950 via-slate-900 to-indigo-900',
      'gradient-2': 'from-emerald-950 via-slate-900 to-emerald-900',
      'gradient-3': 'from-amber-950 via-slate-900 to-amber-900',
      'gradient-4': 'from-rose-950 via-slate-900 to-rose-900'
    };

    const icons: { [key: string]: string } = {
      'gradient-1': 'Building',
      'gradient-2': 'SlidersHorizontal',
      'gradient-3': 'Award',
      'gradient-4': 'Briefcase'
    };

    const newPostItem: FeedPost = {
      id: `post-${Date.now()}`,
      companyId: matchedPublisher.id,
      companyName: matchedPublisher.name,
      category: matchedPublisher.category as any,
      logoBg: matchedPublisher.logoBg,
      logoText: matchedPublisher.logoText,
      verified: true,
      premium: matchedPublisher.id === 'ent-1' || matchedPublisher.id === 'ent-2' || matchedPublisher.id === 'ent-5',
      timestamp: 'Just Now',
      postType: newPostType,
      title: newPostTitle,
      description: newPostDesc,
      location: newPostLoc,
      distanceKm: parseFloat((Math.random() * 8 + 0.5).toFixed(1)),
      tags: processedTags.length > 0 ? processedTags : ['CorporateUpdate', 'B2BAlliance'],
      visibility: newPostVis,
      likesCount: 0,
      comments: [],
      likedByUser: false,
      savedByUser: false
    };

    if (newPostDocName.trim()) {
      newPostItem.documentPlaceholder = {
        name: newPostDocName.trim().replace(/\s+/g, '_') + '.pdf',
        size: newPostDocSize,
        format: 'PDF'
      };
    }

    if (newPostImgStyle !== 'none') {
      newPostItem.imagePlaceholder = {
        gradient: gradients[newPostImgStyle] || gradients['gradient-1'],
        icon: icons[newPostImgStyle] || 'Building',
        label: `${newPostTitle} - Pre-Render Blueprint Visual`
      };
    }

    setPosts(prev => [newPostItem, ...prev]);
    onLogTriggered(
      'B2B_POST_PUBLISHED',
      'posts',
      newPostItem.id,
      'SUCCESS',
      `Publishing: Verified publisher "${matchedPublisher.name}" published corporate update.`
    );
    showToast(`Corporate update published successfully on the Business Feed!`, 'success');

    // Reset Form
    setNewPostTitle('');
    setNewPostDesc('');
    setNewPostLoc('Bandra Kurla, Mumbai');
    setNewPostTags('B2BAlliance, RealtyProject');
    setNewPostDocName('');
    setHasSavedDraft(false);
    setShowCreateModal(false);
  };

  // Document download simulation
  const handleDownloadFile = (fileName: string, postId: string) => {
    onLogTriggered(
      'B2B_DOCUMENT_DOWNLOADED',
      'posts',
      postId,
      'SUCCESS',
      `Compliance: Downloaded audited technical documentation attachment: "${fileName}"`
    );
    showToast(`Securing document sandbox... Initiating download of "${fileName}"`, 'success');
  };

  // Report submit
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingPost) return;

    onLogTriggered(
      'B2B_POST_REPORTED',
      'posts',
      reportingPost.id,
      'WARNING',
      `Moderation Flag: Reported post "${reportingPost.title}" by ${reportingPost.companyName}. Reason: ${reportReason}`
    );
    showToast(`Post flagged. Handed over to the RealtyConnect enterprise compliance audit queue.`, 'info');
    
    // Remove flagged post for the user session
    setPosts(prev => prev.filter(p => p.id !== reportingPost.id));
    setReportingPost(null);
    setReportText('');
  };

  // Preview object computed dynamically for publisher Live Draft Preview
  const previewPostObject = useMemo(() => {
    const matched = PUBLISHER_COMPANIES.find(c => c.id === selectedPublisherId);
    return {
      companyName: matched ? matched.name : 'Apex Developers Ltd',
      category: matched ? matched.category : 'Developers',
      logoBg: matched ? matched.logoBg : 'bg-indigo-600',
      logoText: matched ? matched.logoText : 'AD',
      verified: true,
      premium: true,
      timestamp: 'Just Now',
      postType: newPostType,
      title: newPostTitle || 'Insert Headline/Title...',
      description: newPostDesc || 'Insert description scope...',
      location: newPostLoc || 'Bandra, Mumbai',
      distanceKm: 1.2,
      tags: newPostTags.split(',').map(t => t.trim()).filter(t => t.length > 0),
      visibility: newPostVis
    };
  }, [selectedPublisherId, newPostType, newPostTitle, newPostDesc, newPostLoc, newPostTags, newPostVis, PUBLISHER_COMPANIES]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

      {/* LEFT COLUMN: Feed Navigation and Filters */}
      <div className="lg:col-span-1 space-y-5">
        
        {/* Profile Card & Action */}
        <div className="bg-slate-900/90 border border-slate-850 p-5 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-extrabold text-sm shadow-md">
              MS
            </div>
            <div>
              <h5 className="font-bold text-xs text-slate-100 flex items-center gap-1">
                MultiSarv Corporate
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-500/10" />
              </h5>
              <p className="text-[9px] text-slate-500 font-mono tracking-wider uppercase">Verified B2B Administrator</p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => {
              setShowCreateModal(true);
              setPublishTab('edit');
              onLogTriggered('B2B_CREATION_MODAL_OPENED', 'posts', 'modal', 'SUCCESS', 'Interactive: Initiated B2B posting module.');
            }}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/10 active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3px]" />
            <span>Publish B2B Update</span>
          </button>
        </div>

        {/* Filters Menu */}
        <div className="bg-slate-900/90 border border-slate-850 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4">
            <h4 className="font-display font-bold text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
              Feed Filters
            </h4>
            {activeFilterCategory !== 'All Posts' && (
              <button 
                onClick={() => handleTabSwitch('All Posts')}
                className="text-[9px] font-mono text-emerald-400 hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
            {FILTER_OPTIONS.map(filter => {
              const active = activeFilterCategory === filter.name;
              const IconComp = filter.icon;
              return (
                <button
                  key={filter.name}
                  type="button"
                  onClick={() => handleTabSwitch(filter.name)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                    active 
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold' 
                      : 'hover:bg-slate-850 text-slate-400 hover:text-white border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <IconComp className={`w-3.5 h-3.5 ${active ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>{filter.label}</span>
                  </span>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded-md ${active ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'bg-slate-950 text-slate-500'}`}>
                    {filter.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-slate-850 mt-4 pt-3.5">
            <label className="flex items-center gap-2.5 cursor-pointer text-[11px] text-slate-400 font-mono hover:text-slate-300 select-none">
              <input
                type="checkbox"
                checked={showOnlyVerified}
                onChange={(e) => {
                  setShowOnlyVerified(e.target.checked);
                  onLogTriggered('B2B_FEED_VERIFIED_ONLY_TOGGLED', 'feed', 'verified_toggle', 'SUCCESS', `Filter: Showed only verified updates: ${e.target.checked}`);
                }}
                className="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
              />
              Show Only Verified Publishers
            </label>
          </div>
        </div>

        {/* Dynamic Tag Cloud widget */}
        <div className="bg-slate-900/90 border border-slate-850 p-5 rounded-2xl shadow-lg">
          <h4 className="font-display font-bold text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-850 pb-3 mb-4">
            <Hash className="w-3.5 h-3.5 text-emerald-400" />
            Trending Tags
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {['EcoTownship', 'BandraKurla', 'SustainableBuild', 'MetroTender', 'SteelPricing', 'RERACompliance', 'ProjectFinancing', 'ConstructionLease', 'GreenMaterials', 'TaxCompliance', 'PropTech'].map(tag => (
              <button
                key={tag}
                onClick={() => {
                  setSearchTerm(tag);
                  showToast(`Filtering feed updates matching hash: #${tag}`, 'info');
                }}
                className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  searchTerm === tag 
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-md shadow-emerald-500/10' 
                    : 'bg-slate-950 text-slate-400 border-slate-850 hover:bg-slate-850 hover:text-white'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* CENTER COLUMN: Main Feed and Search */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Custom Search Box */}
        <div className="bg-slate-900 border border-slate-850 p-4.5 rounded-2xl shadow-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search business updates, tenders, products, builders, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 hover:bg-slate-950/50 focus:bg-slate-950 border border-slate-850 focus:border-slate-700 text-xs rounded-xl py-3 pl-11 pr-11 text-slate-200 outline-none transition-all placeholder-slate-500 font-mono"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3.5 top-3 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-850 text-xs font-bold font-mono"
              >
                Reset
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="mt-2.5 text-[10px] text-slate-500 font-mono flex items-center justify-between">
              <span>Matched: <strong className="text-emerald-400">{filteredPosts.length}</strong> corporate logs</span>
              <button onClick={() => setSearchTerm('')} className="text-emerald-400 hover:underline">Clear Search</button>
            </div>
          )}
        </div>

        {/* Feed Loading Skeletons */}
        {isFeedLoading ? (
          <div className="space-y-6">
            {[1, 2].map(n => (
              <div key={n} className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3.5 bg-slate-800 rounded w-1/3" />
                    <div className="h-2.5 bg-slate-800 rounded w-1/4" />
                  </div>
                  <div className="h-5 bg-slate-800 rounded w-16" />
                </div>
                <div className="space-y-2 pt-1">
                  <div className="h-4 bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-800 rounded w-full" />
                  <div className="h-3 bg-slate-800 rounded w-5/6" />
                </div>
                <div className="h-28 bg-slate-800 rounded-xl w-full" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-7 bg-slate-800 rounded-lg w-20" />
                  <div className="h-7 bg-slate-800 rounded-lg w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-14 text-center bg-slate-900/30 border border-dashed border-slate-850 rounded-2xl space-y-4">
            <AlertTriangle className="w-9 h-9 text-amber-500 mx-auto animate-bounce" />
            <h5 className="font-bold text-sm text-slate-200">No B2B Updates Found</h5>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              We couldn't find any business updates matching your current filter checklist or search term. Try resetting your tags.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveFilterCategory('All Posts');
                setShowOnlyVerified(false);
                showToast('Reset feed defaults.', 'info');
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-mono font-bold text-emerald-400 border border-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map(post => {
              const isSaved = savedBusinesses.includes(post.companyId) || post.savedByUser;
              const typeCfg = getPostTypeConfig(post.postType);
              const IconComp = typeCfg.icon;

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  key={post.id}
                  id={`feed-card-${post.id}`}
                  className={`bg-gradient-to-b from-slate-900/90 to-slate-900/75 border border-slate-850/60 rounded-2xl p-6.5 space-y-4 hover:border-slate-800 transition-all shadow-md relative ${
                    post.isFeatured ? 'ring-1 ring-emerald-500/15' : ''
                  } ${typeCfg.glow}`}
                >
                  {post.isFeatured && (
                    <div className="absolute top-5 right-5 flex items-center gap-1 bg-emerald-500/10 text-emerald-300 text-[8px] font-mono font-extrabold px-2 py-0.5 rounded border border-emerald-500/15 uppercase tracking-wider">
                      <Flame className="w-2.5 h-2.5 fill-emerald-300" />
                      Featured Log
                    </div>
                  )}

                  {/* Feed Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Logo Frame */}
                      <div className={`w-11 h-11 rounded-xl ${post.logoBg} flex items-center justify-center text-white font-black text-sm shadow-md border border-white/5`}>
                        {post.logoText || post.companyName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        {/* Company row */}
                        <div className="flex items-center flex-wrap gap-1.5">
                          <button
                            onClick={() => onViewBusinessProfile(post.companyId)}
                            className="font-bold text-xs text-slate-100 hover:text-emerald-400 transition-colors text-left font-sans tracking-tight"
                          >
                            {post.companyName}
                          </button>
                          {post.verified && (
                            <span className="flex items-center" title="Verified Corporate Identity">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 fill-emerald-500/5 stroke-[2px]" />
                            </span>
                          )}
                          {post.premium && (
                            <span className="text-[8px] font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider">Elite Partner</span>
                          )}
                        </div>

                        {/* Sub-header meta info */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-mono">
                          <span>{post.category}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-[9px] text-slate-500">
                            <Clock className="w-2.5 h-2.5" />
                            {post.timestamp}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-500 text-[9px]">
                            {post.visibility === 'Connections Only' ? (
                              <>
                                <Lock className="w-2.5 h-2.5 text-indigo-400" />
                                <span>Network Only</span>
                              </>
                            ) : (
                              <>
                                <Globe className="w-2.5 h-2.5 text-emerald-400/80" />
                                <span>Public Feed</span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Highly stylized Post Type Badge */}
                    {!post.isFeatured && (
                      <div className="shrink-0">
                        <span className={`flex items-center gap-1 text-[9px] font-mono font-extrabold px-2.5 py-1 rounded-xl border ${typeCfg.color} uppercase tracking-wider`}>
                          <IconComp className="w-3 h-3" />
                          <span>{typeCfg.label}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Title & Body content */}
                  <div className="space-y-2 pt-1.5">
                    <h4 className="font-bold text-sm sm:text-base text-slate-100 leading-snug tracking-tight font-sans">
                      {post.title}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                      {formatContentText(post.description)}
                    </p>
                  </div>

                  {/* Attachment Visual Previews */}
                  {post.imagePlaceholder && (
                    <ArchitecturalVisual 
                      label={post.imagePlaceholder.label} 
                      gradient={post.imagePlaceholder.gradient} 
                    />
                  )}

                  {/* Video Previews */}
                  {post.videoPlaceholder && (
                    <InteractiveVideoPlayer 
                      title={post.videoPlaceholder.title} 
                      duration={post.videoPlaceholder.duration} 
                      views={post.videoPlaceholder.views} 
                    />
                  )}

                  {/* Document Attachment Previews */}
                  {post.documentPlaceholder && (
                    <DocumentAttachment 
                      name={post.documentPlaceholder.name} 
                      size={post.documentPlaceholder.size} 
                      format={post.documentPlaceholder.format} 
                      onDownload={() => handleDownloadFile(post.documentPlaceholder!.name, post.id)} 
                    />
                  )}

                  {/* Location & Tags Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] pt-1">
                    <span className="text-slate-400 font-mono flex items-center gap-1 text-[10px]">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      <span>{post.location}</span>
                      <span className="text-slate-600">({post.distanceKm} km)</span>
                    </span>

                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map((tag, i) => (
                        <span 
                          key={i} 
                          onClick={() => {
                            setSearchTerm(tag);
                            showToast(`Filtering feed updates matching hash: #${tag}`, 'info');
                          }}
                          className="text-[9px] font-mono bg-slate-950 hover:bg-slate-850 cursor-pointer text-emerald-400/80 border border-emerald-500/10 rounded-md px-2 py-0.5 transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Clean Engagement Statistics Strip */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 border-t border-slate-850/50 pt-3">
                    <div className="flex items-center gap-3">
                      <span>{post.likesCount} appreciations</span>
                      <span>•</span>
                      <span>{post.comments.length} responses</span>
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold bg-slate-950/40 px-2 py-0.5 rounded">
                      Audited Log Block
                    </div>
                  </div>

                  {/* Card Engagement Controls Row with motion buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                    <div className="flex items-center gap-2">
                      {/* Like button */}
                      <button
                        type="button"
                        onClick={() => handleLikePost(post.id, post.title)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          post.likedByUser
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/10'
                            : 'bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white border-slate-850/80'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{post.likedByUser ? 'Appreciated' : 'Appreciate'}</span>
                      </button>

                      {/* Connection request indicator */}
                      {!connectionsSent.includes(post.companyId) && post.companyId !== 'ent-1' && (
                        <button
                          type="button"
                          onClick={() => onConnectRequest(post.companyId, post.companyName)}
                          className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 hover:border-emerald-500/30 px-2.5 py-1.5 rounded-lg transition-all"
                        >
                          Connect Builder
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      
                      {/* Save Button */}
                      <button
                        type="button"
                        onClick={() => handleSavePost(post)}
                        className={`p-2 rounded-lg border transition-all cursor-pointer ${
                          isSaved
                            ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                            : 'bg-slate-950 hover:bg-slate-850 border-slate-850 text-slate-500 hover:text-white'
                        }`}
                        title={isSaved ? 'Unsave Post' : 'Save Post'}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>

                      {/* Share Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setSharingPost(post);
                          onLogTriggered('B2B_POST_SHARE_CLICKED', 'posts', post.id, 'SUCCESS', 'Engagement: Opened direct sharing toolbox.');
                        }}
                        className="p-2 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-500 hover:text-white rounded-lg transition-all cursor-pointer"
                        title="Share Corporate Update"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Report Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setReportingPost(post);
                          onLogTriggered('B2B_POST_REPORT_CLICKED', 'posts', post.id, 'SUCCESS', 'Moderation: Opened content grievance filing form.');
                        }}
                        className="p-2 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-500 hover:text-red-400 rounded-lg transition-all cursor-pointer"
                        title="Report Inappropriate Content"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>

                      {/* View Company Button */}
                      <button
                        type="button"
                        onClick={() => onViewBusinessProfile(post.companyId)}
                        className="px-3 py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-300 rounded-lg text-xs font-semibold hover:border-slate-700 transition-colors cursor-pointer"
                      >
                        View Builder
                      </button>
                    </div>
                  </div>

                  {/* Threaded Comments & Replies section */}
                  <div className="border-t border-slate-850/50 pt-4 space-y-3 bg-slate-950/40 p-4.5 rounded-xl border border-slate-850/30">
                    <h5 className="font-bold text-[10px] text-slate-400 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Direct Responses ({post.comments.length})</span>
                    </h5>

                    {/* Existing Comments list */}
                    {post.comments.length > 0 && (
                      <div className="space-y-3.5">
                        {post.comments.map(comment => (
                          <div key={comment.id} className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-850/60 space-y-2 relative">
                            {comment.isPinned && (
                              <div className="absolute top-3 right-3 flex items-center gap-1 text-[8px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/15">
                                <Check className="w-2.5 h-2.5 stroke-[3px]" />
                                Pinned by Author
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-200">{comment.authorName}</span>
                                <span className="text-[8px] font-mono bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded-md uppercase font-semibold">{comment.authorCategory}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[9px] text-slate-500 font-mono">
                                <span>{comment.timestamp}</span>
                                <span>•</span>
                                <button 
                                  onClick={() => handleDeleteComment(post.id, comment.id)}
                                  className="text-red-400 hover:underline cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed font-sans">{formatContentText(comment.content)}</p>
                            
                            {/* Comment like controls */}
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => handleLikeComment(post.id, comment.id)}
                                className={`text-[9px] font-mono flex items-center gap-1 px-2 py-0.5 rounded transition-all ${
                                  comment.likedByUser ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 hover:text-slate-300'
                                }`}
                              >
                                <ThumbsUp className="w-2.5 h-2.5" />
                                <span>{comment.likes} Likes</span>
                              </button>
                            </div>

                            {/* Threaded nested replies (UI only) */}
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="mt-3.5 pl-4 border-l border-slate-800 space-y-2.5">
                                {comment.replies.map(reply => (
                                  <div key={reply.id} className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850/40 space-y-1">
                                    <div className="flex items-center justify-between text-[10px]">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-slate-200">{reply.authorName}</span>
                                        <span className="text-[7px] font-mono bg-slate-950 text-slate-500 px-1.5 rounded uppercase">{reply.authorCategory}</span>
                                      </div>
                                      <span className="text-[8px] font-mono text-slate-500">{reply.timestamp}</span>
                                    </div>
                                    <p className="text-xs text-slate-400">{formatContentText(reply.content)}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Submit Comment Field */}
                    <div className="flex gap-2.5 pt-1">
                      <input
                        type="text"
                        placeholder="Write a structural inquiry or technical query response..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(post.id, post.title);
                        }}
                        className="w-full bg-slate-950 hover:bg-slate-900/50 focus:bg-slate-950 border border-slate-850 text-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-slate-750 transition-all font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddComment(post.id, post.title)}
                        className="bg-emerald-500 hover:bg-emerald-600 p-3 text-slate-950 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-500/10 shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </div>
        )}

      </div>

      {/* RIGHT COLUMN: Sidebar Highlights */}
      <div className="lg:col-span-1 space-y-5">
        
        {/* Dynamic Highlights Stats widget */}
        <div className="bg-slate-900/90 border border-slate-850 p-5 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
          <h4 className="font-display font-bold text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-850 pb-3 mb-4">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Feed Intelligence
          </h4>
          <div className="space-y-3 font-mono text-[11px] text-slate-400">
            <div className="flex items-center justify-between">
              <span>B2B Catalog Volume</span>
              <strong className="text-slate-200">{posts.length} Posts</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>RERA Advisory Status</span>
              <strong className="text-purple-400">Section 11 Compliant</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Active Tender Value</span>
              <strong className="text-amber-400">₹85.4 Crores</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Syndicated Escrow Pool</span>
              <strong className="text-emerald-400">₹2,500 Cr</strong>
            </div>
          </div>
        </div>

        {/* Trending Companies (NEWLY ADDED MODULE) */}
        <div className="bg-slate-900/90 border border-slate-850 p-5 rounded-2xl shadow-lg">
          <h4 className="font-display font-bold text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-850 pb-3 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Trending Companies
          </h4>
          <div className="space-y-3.5">
            {[
              { id: 'ent-1', name: 'Apex Developers Ltd', cat: 'Developers', rating: '4.9', followers: '1.2K' },
              { id: 'ent-2', name: 'BuildCorp Construction', cat: 'Contractors', rating: '4.8', followers: '940' },
              { id: 'ent-5', name: 'National Trust Bank', cat: 'Banks', rating: '4.7', followers: '1.5K' }
            ].map((company) => (
              <div key={company.id} className="flex items-center justify-between gap-2 p-2 bg-slate-950/40 rounded-xl border border-slate-850/40">
                <div className="min-w-0">
                  <span className="block font-bold text-[11px] text-slate-200 truncate">{company.name}</span>
                  <span className="block text-[8px] font-mono text-slate-500">{company.cat} • ★ {company.rating} ({company.followers})</span>
                </div>
                <button
                  onClick={() => onViewBusinessProfile(company.id)}
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded text-[9px] font-mono font-bold text-emerald-400 shrink-0 uppercase tracking-wider"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Posts / Trending Updates list */}
        <div className="bg-slate-900/90 border border-slate-850 p-5 rounded-2xl shadow-lg">
          <h4 className="font-display font-bold text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-850 pb-3 mb-4">
            <Flame className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            Trending Updates
          </h4>
          <div className="space-y-3">
            {trendingPostList.map(p => (
              <div 
                key={p.id} 
                onClick={() => {
                  const element = document.getElementById(`feed-card-${p.id}`);
                  if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="p-3 bg-slate-950/60 border border-slate-850 hover:border-slate-800 rounded-xl space-y-1.5 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                  <span className="font-bold">{p.companyName}</span>
                  <span className="text-emerald-400">★ {p.likesCount} Likes</span>
                </div>
                <h5 className="font-bold text-[11px] text-slate-300 line-clamp-1 leading-tight">{p.title}</h5>
                <span className="text-[8px] font-mono font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md inline-block border border-slate-850">{p.postType}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Industry Highlights / Latest Project News */}
        <div className="bg-slate-900/90 border border-slate-850 p-5 rounded-2xl shadow-lg">
          <h4 className="font-display font-bold text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-850 pb-3 mb-4">
            <Bell className="w-3.5 h-3.5 text-emerald-400" />
            Latest Project News
          </h4>
          <div className="space-y-3">
            {latestProjects.map(p => (
              <div 
                key={p.id}
                onClick={() => {
                  const element = document.getElementById(`feed-card-${p.id}`);
                  if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="p-3 bg-slate-950/60 border border-slate-850 hover:border-slate-800 rounded-xl space-y-1.5 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                  <span className="font-bold">{p.companyName}</span>
                  <span className="text-blue-400 font-bold text-[8px]">{p.postType}</span>
                </div>
                <h5 className="font-bold text-[11px] text-slate-300 line-clamp-2 leading-tight">{p.title}</h5>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CREATE UPDATE MODAL FORM */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 p-5 shrink-0 bg-slate-900">
                <div>
                  <h3 className="font-display font-extrabold text-base text-white flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-emerald-400" />
                    <span>Publish B2B Update</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono tracking-wider">RealtyConnect Verified Corporate Publisher Desk</p>
                </div>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Saved Draft Cache Bar */}
              {hasSavedDraft && (
                <div className="bg-emerald-500/10 border-b border-emerald-500/10 px-5 py-2 flex items-center justify-between text-[11px] font-mono text-emerald-400 shrink-0">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 stroke-[2.5px]" />
                    <span>A saved offline draft is loaded in the desk.</span>
                  </span>
                  <button onClick={handleClearDraft} className="underline hover:text-emerald-300">Clear Draft</button>
                </div>
              )}

              {/* Navigation Tabs (EDIT vs PREVIEW) */}
              <div className="flex border-b border-slate-850 shrink-0 bg-slate-950/25 px-5">
                <button
                  type="button"
                  onClick={() => setPublishTab('edit')}
                  className={`px-4 py-3 text-xs font-mono font-bold border-b-2 transition-all ${
                    publishTab === 'edit' 
                      ? 'border-emerald-400 text-emerald-400' 
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Configure Details
                </button>
                <button
                  type="button"
                  onClick={() => setPublishTab('preview')}
                  className={`px-4 py-3 text-xs font-mono font-bold border-b-2 transition-all ${
                    publishTab === 'preview' 
                      ? 'border-emerald-400 text-emerald-400' 
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Live Feed Preview
                </button>
              </div>

              {/* Modal scrollable body */}
              <div className="p-5 overflow-y-auto space-y-4 flex-1 font-sans">
                {publishTab === 'preview' ? (
                  /* Live Feed Preview mode */
                  <div className="space-y-4">
                    <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">Live feed rendering of your corporate update:</span>
                    <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850/60 shadow max-w-lg mx-auto">
                      <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${previewPostObject.logoBg} flex items-center justify-center text-white font-extrabold text-sm shadow`}>
                              {previewPostObject.logoText}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-slate-100">{previewPostObject.companyName}</span>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-slate-500 font-mono">
                                <span>{previewPostObject.category}</span>
                                <span>•</span>
                                <span>Just Now</span>
                                <span>•</span>
                                <span>{previewPostObject.visibility}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <span className="inline-block text-[9px] font-mono font-bold px-2 py-0.5 rounded-lg border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase tracking-wider">
                              {previewPostObject.postType}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <h4 className="font-bold text-sm text-slate-100">{previewPostObject.title}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">{previewPostObject.description}</p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] pt-1">
                          <span className="text-slate-500 font-mono flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-400" />
                            {previewPostObject.location}
                          </span>
                          <div className="flex gap-1">
                            {previewPostObject.tags.map((t, idx) => (
                              <span key={idx} className="text-[9px] font-mono text-emerald-400 bg-slate-950 px-2 py-0.5 rounded">#{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard Edit mode */
                  <form onSubmit={handlePublishPost} className="space-y-4">
                    
                    {/* Publisher Selector */}
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Publish As Corporate Entity</label>
                      <select
                        value={selectedPublisherId}
                        onChange={(e) => setSelectedPublisherId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl p-3 text-slate-300 outline-none"
                      >
                        {PUBLISHER_COMPANIES.map(comp => (
                          <option key={comp.id} value={comp.id}>
                            {comp.name} ({comp.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Grid 3 Column */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Post Type */}
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Post Type Category</label>
                        <select
                          value={newPostType}
                          onChange={(e) => setNewPostType(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl p-3 text-slate-300 outline-none"
                        >
                          {[
                            'New Project',
                            'Project Completion',
                            'Tender Published',
                            'RFQ Requirement',
                            'Material Requirement',
                            'New Product Launch',
                            'New Service',
                            'Hiring',
                            'Company Achievement',
                            'Award',
                            'Branch Opening',
                            'Business Partnership',
                            'Industry Event',
                            'Government Circular',
                            'RERA Update',
                            'Market Update',
                            'Price Update'
                          ].map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      {/* Location */}
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Geographic Location</label>
                        <input
                          type="text"
                          required
                          value={newPostLoc}
                          onChange={(e) => setNewPostLoc(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl p-3 text-slate-300 outline-none font-mono"
                          placeholder="e.g. Bandra Kurla, Mumbai"
                        />
                      </div>

                      {/* Visibility Selector */}
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Post Visibility Scope</label>
                        <select
                          value={newPostVis}
                          onChange={(e) => setNewPostVis(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl p-3 text-slate-300 outline-none"
                        >
                          <option value="Public Network">Public Network (All RealtyConnect)</option>
                          <option value="Connections Only">Connections Only (Verified Allies)</option>
                        </select>
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Update Headline / Title</label>
                      <input
                        type="text"
                        required
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl p-3 text-slate-300 outline-none"
                        placeholder="e.g. Carbon-neutral concrete casting tenders open for eco residential skyscrapers"
                      />
                    </div>

                    {/* Description Area with Rich Text Formatter Toolbar */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Detailed Update Scope</label>
                        {/* Rich Text controls */}
                        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-850 rounded-lg p-1">
                          <button
                            type="button"
                            onClick={() => insertRichTextMarker('B')}
                            className="px-2 py-0.5 hover:bg-slate-800 rounded font-bold text-[10px] text-slate-400 hover:text-white"
                            title="Insert Bold Text"
                          >
                            B
                          </button>
                          <button
                            type="button"
                            onClick={() => insertRichTextMarker('I')}
                            className="px-2 py-0.5 hover:bg-slate-800 rounded italic text-[10px] text-slate-400 hover:text-white"
                            title="Insert Italic Text"
                          >
                            I
                          </button>
                          <button
                            type="button"
                            onClick={() => insertRichTextMarker('L')}
                            className="px-2 py-0.5 hover:bg-slate-800 rounded text-[10px] text-slate-400 hover:text-white font-mono"
                            title="Insert Bullet"
                          >
                            • List
                          </button>
                          <button
                            type="button"
                            onClick={() => insertRichTextMarker('Q')}
                            className="px-2 py-0.5 hover:bg-slate-800 rounded text-[10px] text-slate-400 hover:text-white"
                            title="Insert Quote"
                          >
                            “ Quote
                          </button>
                          <button
                            type="button"
                            onClick={() => insertRichTextMarker('C')}
                            className="px-2 py-0.5 hover:bg-slate-800 rounded text-[10px] font-mono text-slate-400 hover:text-white"
                            title="Insert Inline Code"
                          >
                            Code
                          </button>
                        </div>
                      </div>
                      <textarea
                        required
                        rows={4}
                        value={newPostDesc}
                        onChange={(e) => setNewPostDesc(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl p-3 text-slate-300 outline-none resize-none leading-relaxed"
                        placeholder="Describe the structural specs, RERA schedules, material tenders or careers update scope..."
                      />
                    </div>

                    {/* Comma tags */}
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Tags (Comma Separated)</label>
                      <input
                        type="text"
                        value={newPostTags}
                        onChange={(e) => setNewPostTags(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl p-3 text-slate-300 outline-none font-mono"
                        placeholder="e.g. EcoTownship, BandraKurla, MaterialTender"
                      />
                    </div>

                    {/* Attachments panel */}
                    <div className="bg-slate-950/60 p-4.5 rounded-xl border border-slate-850/85 space-y-3">
                      <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider">Configure Enterprise Media Attachments</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* File Upload config */}
                        <div>
                          <label className="block text-[9px] font-mono text-slate-400 mb-1">Audit Document Name (PDF, Optional)</label>
                          <input
                            type="text"
                            value={newPostDocName}
                            onChange={(e) => setNewPostDocName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg p-2.5 text-slate-300 outline-none font-mono"
                            placeholder="e.g. Green_Meadows_Bidding_Spec_Q3"
                          />
                        </div>

                        {/* Visual blueprint renderer */}
                        <div>
                          <label className="block text-[9px] font-mono text-slate-400 mb-1">Blueprint CAD Pre-Renderer Graphic</label>
                          <select
                            value={newPostImgStyle}
                            onChange={(e) => setNewPostImgStyle(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg p-2.5 text-slate-300 outline-none"
                          >
                            <option value="none">No CAD Visual Rendering</option>
                            <option value="gradient-1">Indigo Slate (Skyscraper Rendering Layout)</option>
                            <option value="gradient-2">Emerald Meadows (Green Smart City Design)</option>
                            <option value="gradient-3">Amber Sparkles (Award Recognition Plaque)</option>
                            <option value="gradient-4">Corporate Rose (Jobs / Career Brief)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {/* Modal Actions Footer */}
              <div className="border-t border-slate-850 p-5 flex items-center justify-between text-xs shrink-0 bg-slate-900">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="px-4 py-2 bg-slate-950 hover:bg-slate-850 text-slate-300 rounded-xl border border-slate-850 transition-colors cursor-pointer font-mono text-[11px]"
                  >
                    Save Draft
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4.5 py-2.5 bg-slate-950 hover:bg-slate-850 text-slate-400 rounded-xl border border-slate-850 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePublishPost}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Publish Log</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SHARE DIALOG */}
      <AnimatePresence>
        {sharingPost && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  Direct Sharing Hub
                </h4>
                <button onClick={() => setSharingPost(null)} className="p-1 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs text-slate-400">
                <p>Securely route direct cryptographic linkage of this B2B update outside the ecosystem:</p>
                
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-emerald-400 truncate max-w-[240px]">
                    https://realtyconnect.in/feed/updates/{sharingPost.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`https://realtyconnect.in/feed/updates/${sharingPost.id}`);
                      showToast('Cryptographic direct post link copied to clipboard.', 'success');
                    }}
                    className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 hover:bg-emerald-500/20"
                  >
                    Copy Link
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    onClick={() => {
                      onLogTriggered('B2B_POST_EMAILED', 'posts', sharingPost.id, 'SUCCESS', 'Engagement: Emailed direct briefing packet.');
                      showToast('Corporate dispatch scheduled for delivery to your registration email desk.', 'success');
                      setSharingPost(null);
                    }}
                    className="p-2.5 bg-slate-950 hover:bg-slate-850 rounded-xl border border-slate-850 text-center font-bold text-slate-300 transition-colors"
                  >
                    Email Briefing
                  </button>
                  <button
                    onClick={() => {
                      window.print();
                      setSharingPost(null);
                    }}
                    className="p-2.5 bg-slate-950 hover:bg-slate-850 rounded-xl border border-slate-850 text-center font-bold text-slate-300 transition-colors"
                  >
                    Print PDF Brochure
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REPORT CONTENT DIALOG */}
      <AnimatePresence>
        {reportingPost && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Flag className="w-4 h-4 text-red-400" />
                  Report Content Grievance
                </h4>
                <button onClick={() => setReportingPost(null)} className="p-1 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitReport} className="space-y-4 text-xs text-slate-400">
                <p>
                  To maintain the professional integrity of RealtyConnect, every post must be business-oriented. Please specify your grievance against this update by <strong className="text-slate-200">{reportingPost.companyName}</strong>:
                </p>

                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-wider mb-1.5">Select Audit Reason</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-slate-300 outline-none"
                  >
                    <option value="Irrelevant/Non-business content">Irrelevant / Social / Non-business content</option>
                    <option value="Spam updates">Excessive Spam / Identical posts</option>
                    <option value="Misrepresentation">Misrepresentation / Mocked data</option>
                    <option value="Intellectual violation">Trademark or Patent infringement</option>
                    <option value="Other grievance">Other grievance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-wider mb-1.5">Additional Context Details (Optional)</label>
                  <textarea
                    rows={3}
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-slate-300 outline-none resize-none"
                    placeholder="Explain why this content violates the platform guidelines..."
                  />
                </div>

                <div className="flex items-center justify-end gap-2 text-xs pt-2">
                  <button
                    type="button"
                    onClick={() => setReportingPost(null)}
                    className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-400 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    File Complaint
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
