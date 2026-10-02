/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  Building2, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  MapPin, 
  Mail, 
  Phone, 
  Briefcase, 
  Award, 
  BookOpen, 
  Globe, 
  Building, 
  Check, 
  MessageSquare, 
  Send, 
  ChevronRight, 
  Sparkles, 
  Shield,
  ShieldCheck, 
  DollarSign,
  AlertTriangle,
  FileText,
  ShoppingBag,
  ClipboardList,
  Layers,
  ChevronLeft,
  X,
  Clock,
  Star,
  Zap,
  MessageCircle,
  HelpCircle,
  Terminal,
  Building as BuildingIcon
} from 'lucide-react';

// Import seed datasets for rich homepage integration
import { INITIAL_MARKETPLACE_LISTINGS } from './BusinessMarketplace';
import { INITIAL_RFQS } from './BusinessRfqEngine';
import { INITIAL_OPPORTUNITIES } from './BusinessOpportunitiesEngine';

interface MarketplaceHomeProps {
  userSession: { email: string; role: string; permissions: string[] } | null;
  onTriggerLogin: () => void;
  onTriggerOnboarding: () => void;
  onSelectBusiness: (comp: any) => void;
  setActiveViewMode: (view: 'home' | 'directory' | 'network_dashboard' | 'feed' | 'dashboard' | 'opportunities' | 'rfq_management' | 'marketplace' | 'lead_management' | 'messaging' | 'meetings' | 'crm' | 'projects' | 'procurement' | 'inventory' | 'finance' | 'hr_dms' | 'assets_maintenance' | 'analytics_subscription' | 'security_compliance') => void;
  onLogTriggered: (action: string, entity: string, entityId: string, status: 'SUCCESS' | 'FAILURE' | 'WARNING', details: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onSearchGlobal: (term: string, cat: string, loc: string) => void;
  onToggleDevHub?: () => void;
}

export default function MarketplaceHome({
  userSession,
  onTriggerLogin,
  onTriggerOnboarding,
  onSelectBusiness,
  setActiveViewMode,
  onLogTriggered,
  showToast,
  onSearchGlobal,
  onToggleDevHub
}: MarketplaceHomeProps) {

  // Search Fields state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('All');
  const [searchLocation, setSearchLocation] = useState('All');

  // Contact Inquiry state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Quick inquiry state for specific cards
  const [quickInquiryItem, setQuickInquiryItem] = useState<any | null>(null);
  const [quickInquiryMessage, setQuickInquiryMessage] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogTriggered(
      'MARKETPLACE_HOME_SEARCH_SUBMITTED',
      'search_engine',
      `term-${searchTerm || 'all'}`,
      'SUCCESS',
      `Marketplace Search: Searched for "${searchTerm}" under category "${searchCategory}" in "${searchLocation}".`
    );
    onSearchGlobal(searchTerm, searchCategory, searchLocation);
  };

  const handleProtectedAction = (actionName: string, eventDetails: string) => {
    if (!userSession) {
      onLogTriggered(
        'GUEST_PROTECTED_ACTION_INTERCEPTED',
        'security_gateway',
        actionName,
        'WARNING',
        `Guest Intercept: Guest user attempted protected action "${actionName}" (${eventDetails}). Redirecting to auth gateway.`
      );
      showToast(`Sign in to unlock professional B2B tools like ${actionName}!`, 'info');
      onTriggerLogin();
    } else {
      onLogTriggered(
        'MEMBER_ACTION_APPROVED',
        'members',
        userSession.email,
        'SUCCESS',
        `Approved protected action "${actionName}" for ${userSession.email}.`
      );
      showToast(`Action "${actionName}" initialized successfully!`, 'success');
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }
    setContactSubmitted(true);
    onLogTriggered(
      'MARKETPLACE_HOME_CONTACT_SUBMITTED',
      'contact_leads',
      contactEmail,
      'SUCCESS',
      `Contact Form: Received enquiry from ${contactName} (${contactEmail}). Message: "${contactMessage}"`
    );
    showToast('Enquiry received. Our B2B representative will contact you shortly.', 'success');
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setContactMessage('');
      setContactSubmitted(false);
    }, 3000);
  };

  const handleQuickInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInquiryMessage.trim()) return;

    onLogTriggered(
      'MARKETPLACE_HOME_QUICK_INQUIRY',
      'enquiries',
      quickInquiryItem.id,
      'SUCCESS',
      `Quick Enquiry sent for "${quickInquiryItem.name || quickInquiryItem.title}". Message: "${quickInquiryMessage}"`
    );
    showToast('Inquiry dispatched directly to vendor. They will revert in the messaging center.', 'success');
    setQuickInquiryItem(null);
    setQuickInquiryMessage('');
  };

  // Static Business Types with counts (TradeIndia style)
  const PREMIUM_CATEGORIES = [
    { name: 'Builders', count: '1,450+', icon: Building, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', featured: 'Apex Developers', products: 'Residential/Commercial', rfqs: '12 Active' },
    { name: 'Developers', count: '890+', icon: Layers, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', featured: 'Vanguard Realty', products: 'Townships & JVs', rfqs: '8 Active' },
    { name: 'Contractors', count: '2,120+', icon: Users, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', featured: 'BuildCorp Civil', products: 'Civil & Foundation', rfqs: '24 Active' },
    { name: 'Architects', count: '740+', icon: Award, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', featured: 'Aura Interior Studio', products: 'Structural Blueprint', rfqs: '5 Active' },
    { name: 'Consultants', count: '1,100+', icon: Briefcase, color: 'text-teal-400 bg-teal-500/10 border-teal-500/20', featured: 'RealtyPro Advisors', products: 'RERA Compliance', rfqs: '9 Active' },
    { name: 'Material Suppliers', count: '3,200+', icon: ShoppingBag, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', featured: 'Elite Materials', products: 'TMT Steel, Cement', rfqs: '45 Active' },
    { name: 'Equipment Rentals', count: '610+', icon: Layers, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20', featured: 'Global Tech Equip', products: 'Piling Rigs, Cranes', rfqs: '11 Active' },
    { name: 'Interior Designers', count: '940+', icon: Sparkles, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', featured: 'Nexus Studio', products: 'Fit-outs, Drywalls', rfqs: '14 Active' },
    { name: 'Finance Partners', count: '340+', icon: DollarSign, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', featured: 'National Trust Bank', products: 'Developer Loans', rfqs: '3 Active' },
    { name: 'Insurance Brokers', count: '180+', icon: Shield, color: 'text-red-400 bg-red-500/10 border-red-500/20', featured: 'Sovereign Ins', products: 'CAR & Liability', rfqs: '2 Active' },
    { name: 'Legal Advisories', count: '290+', icon: CheckCircle2, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', featured: 'TaxShield Assoc', products: 'Due Diligence', rfqs: '6 Active' },
    { name: 'Recruitment', count: '450+', icon: Users, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', featured: 'Apex Recruiters', products: 'Project Staffing', rfqs: '4 Active' },
    { name: 'Technology Vendors', count: '520+', icon: Zap, color: 'text-lime-400 bg-lime-500/10 border-lime-500/20', featured: 'PropTech Systems', products: 'BIM Software, ERP', rfqs: '7 Active' },
    { name: 'Government Bodies', count: '120+', icon: Landmark, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20', featured: 'MH Industrial Dev', products: 'Industrial Plots', rfqs: '3 Active' },
    { name: 'Transport & Logistics', count: '850+', icon: Clock, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', featured: 'Green Brick Log', products: 'Bulk Delivery', rfqs: '19 Active' }
  ];

  // Dummy Landmark Icon since it's used in Government
  function Landmark(props: any) {
    return <BuildingIcon {...props} />;
  }

  // Top Indian cities with listings count
  const POPULAR_CITIES = [
    { name: 'Mumbai', state: 'MH', count: '1,420 Businesses', icon: '🏙️', color: 'from-blue-600/20 to-slate-950 border-blue-900/30' },
    { name: 'Bangalore', state: 'KA', count: '980 Businesses', icon: '💻', color: 'from-emerald-600/20 to-slate-950 border-emerald-900/30' },
    { name: 'Delhi NCR', state: 'DL', count: '1,150 Businesses', icon: '🏛️', color: 'from-amber-600/20 to-slate-950 border-amber-900/30' },
    { name: 'Hyderabad', state: 'TS', count: '810 Businesses', icon: '🕌', color: 'from-purple-600/20 to-slate-950 border-purple-900/30' },
    { name: 'Pune', state: 'MH', count: '640 Businesses', icon: '🏔️', color: 'from-teal-600/20 to-slate-950 border-teal-900/30' },
    { name: 'Chennai', state: 'TN', count: '570 Businesses', icon: '🌊', color: 'from-indigo-600/20 to-slate-950 border-indigo-900/30' }
  ];

  // Mock Success Stories
  const SUCCESS_STORIES = [
    {
      quote: "RealtyConnect transformed our procurement process. We sourced 400 Metric Tons of high-strength TMT steel in 48 hours, saving 8% on intermediary margins.",
      author: "Rajesh Singhal",
      role: "Procurement Director, Singhal Homes",
      location: "Mumbai",
      avatarBg: "bg-emerald-600"
    },
    {
      quote: "As a regional ready-mix concrete supplier, getting verified leads was difficult. The platform's verified badges doubled our conversion with Tier-1 contractors.",
      author: "Meenakshi Iyer",
      role: "Managing Partner, Elite Materials Group",
      location: "Bangalore",
      avatarBg: "bg-blue-600"
    }
  ];

  // Mock Industry Updates
  const INDUSTRY_UPDATES = [
    {
      date: "July 20, 2026",
      title: "RERA Guidelines updated for Joint Venture township models",
      category: "Compliance",
      desc: "New amendments mandate complete registration of structural blueprints prior to land-acquisition agreements.",
      link: "#"
    },
    {
      date: "July 18, 2026",
      title: "National Steel Index registers stabilization in Fe550D rates",
      category: "Market Rates",
      desc: "Raw material pricing shows minor consolidation with bulk transport logistical credits easing across Maharashtra corridors.",
      link: "#"
    }
  ];

  // Specific featured businesses (Top 4 from discovery registry)
  const FEATURED_BUSINESSES = [
    { id: 'ent-1', name: 'Apex Developers Ltd', category: 'Developers', rating: '4.9', exp: '18 Years', location: 'Mumbai, MH', verified: true, premium: true, logoText: 'AD', logoBg: 'bg-indigo-600' },
    { id: 'ent-2', name: 'BuildCorp Construction', category: 'Contractors', rating: '4.8', exp: '31 Years', location: 'Bangalore, KA', verified: true, premium: true, logoText: 'BC', logoBg: 'bg-emerald-600' },
    { id: 'ent-3', name: 'Elite Materials Group', category: 'Material Suppliers', rating: '4.7', exp: '14 Years', location: 'Delhi NCR', verified: true, premium: true, logoText: 'EM', logoBg: 'bg-amber-600' },
    { id: 'ent-4', name: 'RealtyConnect Pro Consultants', category: 'Consultants', rating: '4.9', exp: '10 Years', location: 'Hyderabad, TS', verified: true, premium: true, logoText: 'RC', logoBg: 'bg-purple-600' }
  ];

  return (
    <div id="marketplace-home-view" className="space-y-16 pb-12">
      
      {/* 1. HERO EXPERIENCE (Reduced whitespace, clear branding, bold display typography) */}
      <section className="relative px-4 sm:px-6 py-10 md:py-16 bg-gradient-to-b from-slate-950 via-slate-950/80 to-slate-900 border-b border-slate-850 overflow-hidden text-center">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 rounded-full text-emerald-400 font-mono text-[10px] font-bold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            India's Premier B2B Real Estate Marketplace
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight font-display">
            India's Integrated <br className="hidden sm:inline"/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400">
              Real Estate Business Network
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium">
            India's Integrated Real Estate Business Network—a unified platform where every stakeholder in the real estate ecosystem can discover, connect, collaborate, buy, sell, hire, finance, and manage business operations.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                onLogTriggered('CTA_EXPLORE_MARKETPLACE', 'navigation', 'marketplace', 'SUCCESS', 'Hero CTA clicked: Swapped current view to Listed Products.');
                setActiveViewMode('marketplace');
              }}
              className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-extrabold text-xs px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
              <span>Explore Marketplace</span>
            </button>
            <button
              onClick={onTriggerOnboarding}
              className="bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 font-bold text-xs px-6 py-3 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>List Your Business Free</span>
            </button>
          </div>

          {/* Core Trust Metrics Header Banner */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10.5px] font-mono text-slate-400 pt-4 border-t border-slate-850/60 max-w-3xl mx-auto">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold"><Check className="w-3.5 h-3.5 text-emerald-500" /> 24,800+ Verified Businesses</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold"><Check className="w-3.5 h-3.5 text-emerald-500" /> 150,000+ Products & Materials</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold"><Check className="w-3.5 h-3.5 text-emerald-500" /> 5,200+ Trusted Suppliers</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold"><Check className="w-3.5 h-3.5 text-emerald-500" /> 8,500+ Active RFQs</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold"><Check className="w-3.5 h-3.5 text-emerald-500" /> 120+ Cities Covered</span>
          </div>
        </div>
      </section>

      {/* 2. MARKETPLACE SEARCH SECTION (Core search hub) */}
      <section className="px-4 md:px-6 max-w-5xl mx-auto -mt-10 sm:-mt-14 relative z-20">
        <div className="bg-slate-900/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-2xl space-y-3.5">
          
          {/* Quick Category Tab Selectors */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800/80">
            {[
              { id: 'All', label: 'All' },
              { id: 'Businesses', label: 'Businesses' },
              { id: 'Products', label: 'Products' },
              { id: 'Materials', label: 'Materials' },
              { id: 'Equipment', label: 'Equipment' },
              { id: 'Services', label: 'Services' },
              { id: 'Consultants', label: 'Consultants' },
              { id: 'RFQs', label: 'RFQs & Tenders' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSearchCategory(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer whitespace-nowrap ${
                  searchCategory === tab.id
                    ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20'
                    : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-850'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-2">
            
            {/* Search Query Input */}
            <div className="md:col-span-5 flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-300 focus-within:border-emerald-500/80 transition-colors">
              <Search className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search Businesses, Products, Materials, Services or RFQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-500"
              />
            </div>

            {/* Category Dropdown */}
            <div className="md:col-span-3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 flex items-center gap-2 text-slate-300">
              <span className="text-[10px] text-slate-500 font-mono flex-shrink-0 uppercase font-bold">What:</span>
              <select
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-[11px] text-slate-300 font-semibold cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Builders">Builders</option>
                <option value="Developers">Developers</option>
                <option value="Contractors">Contractors</option>
                <option value="Architects">Architects</option>
                <option value="Consultants">Consultants</option>
                <option value="Materials">Material Suppliers</option>
                <option value="Equipment">Equipment Rentals</option>
                <option value="Finance">Finance Partners</option>
                <option value="RFQs">RFQs & Tenders</option>
              </select>
            </div>

            {/* Location Selector */}
            <div className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 flex items-center gap-2 text-slate-300">
              <span className="text-[10px] text-slate-500 font-mono flex-shrink-0 uppercase font-bold">Where:</span>
              <select
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-[11px] text-slate-300 font-semibold cursor-pointer"
              >
                <option value="All">All Cities</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Delhi">Delhi NCR</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Pune">Pune</option>
                <option value="Chennai">Chennai</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
              </select>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="md:col-span-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-extrabold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1 shadow-md shadow-emerald-500/15 cursor-pointer"
            >
              <span>Search B2B</span>
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Quick Shortcuts below search */}
          <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-[10.5px]">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-slate-500 font-mono">Trending Searches:</span>
              {['TMT Steel Fe550D', 'Piling rig lease', 'AAC Blocks', 'Metro Piling', 'RERA feasibility'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setSearchTerm(term);
                    onSearchGlobal(term, 'All', 'All');
                  }}
                  className="text-slate-300 hover:text-emerald-400 underline decoration-dotted transition-colors cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
            
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-slate-500 font-mono">Top Cities:</span>
              {['Mumbai', 'Bangalore', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai'].map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => {
                    setSearchLocation(loc);
                    onSearchGlobal('', 'All', loc);
                  }}
                  className="text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. POPULAR CATEGORIES (Marketplace Entry Points - TradeIndia Inspired) */}
      <section className="px-4 md:px-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-850 pb-3">
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2 font-display">
              <Layers className="w-5 h-5 text-emerald-400" />
              Discover B2B Categories
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Explore businesses, product specifications, and active RFQ registers by vertical.</p>
          </div>
          <button
            onClick={() => {
              onLogTriggered('VIEW_ALL_CATEGORIES', 'navigation', 'directory', 'SUCCESS', 'Swapped view to directory to list all categories.');
              setActiveViewMode('directory');
            }}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {PREMIUM_CATEGORIES.slice(0, 10).map((cat, idx) => {
            const IconComponent = cat.icon;
            return (
              <div 
                key={idx}
                className="bg-slate-900/40 hover:bg-slate-900 border border-slate-850 hover:border-slate-750 p-4 rounded-xl transition-all group flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg ${cat.color} border`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">{cat.count}</span>
                </div>
                
                <div>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">{cat.name}</h4>
                  <div className="mt-2 space-y-1 text-[10px] text-slate-400 font-mono">
                    <div><span className="text-slate-600">Featured:</span> {cat.featured}</div>
                    <div><span className="text-slate-600">Offers:</span> {cat.products}</div>
                    <div><span className="text-slate-600">Tenders:</span> {cat.rfqs}</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onLogTriggered('CATEGORY_SHORTCUT_CLICKED', 'directory', cat.name, 'SUCCESS', `Navigated directory via homepage category tile: ${cat.name}`);
                    onSearchGlobal('', cat.name, 'All');
                  }}
                  className="w-full mt-1 bg-slate-950 hover:bg-slate-850 text-slate-300 group-hover:text-white py-1 text-[10px] font-semibold border border-slate-800 rounded transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Explore {cat.name}</span>
                  <ChevronRight className="w-3 h-3 text-slate-500" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. FEATURED BUSINESSES (Premium verified corporate listings with direct CTAs) */}
      <section className="px-4 md:px-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-850 pb-3">
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2 font-display">
              <Building className="w-5 h-5 text-emerald-400" />
              Verified Premium B2B Enterprises
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Contact audited real estate builders, developers, material distributors, and corporate advisers.</p>
          </div>
          <button
            onClick={() => setActiveViewMode('directory')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>All Businesses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {FEATURED_BUSINESSES.map((comp) => (
            <div 
              key={comp.id}
              className="bg-slate-900/30 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-xl p-4 transition-all relative flex flex-col justify-between"
            >
              {/* Badges top right */}
              <div className="flex items-center gap-1 absolute top-3 right-3">
                <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/25 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  Premium
                </span>
                <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider flex items-center gap-0.5">
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                  Verified
                </span>
              </div>

              {/* Company Header */}
              <div className="flex items-start gap-3 pt-2">
                <div className={`w-10 h-10 rounded-lg ${comp.logoBg} text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-lg shadow-black/40 font-mono`}>
                  {comp.logoText}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 
                    onClick={() => onSelectBusiness(comp)}
                    className="text-xs font-extrabold text-slate-100 hover:text-emerald-400 transition-colors cursor-pointer truncate"
                    title={comp.name}
                  >
                    {comp.name}
                  </h4>
                  <p className="text-[10px] font-mono text-emerald-400 mt-0.5">{comp.category}</p>
                </div>
              </div>

              {/* Meta stats */}
              <div className="grid grid-cols-3 gap-2 py-3.5 my-3.5 border-y border-slate-850 text-center text-slate-400 text-[10px] font-mono">
                <div>
                  <div className="text-slate-600 uppercase text-[8px] tracking-wider">Rating</div>
                  <div className="font-extrabold text-slate-200 mt-0.5 flex items-center justify-center gap-0.5">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{comp.rating}</span>
                  </div>
                </div>
                <div>
                  <div className="text-slate-600 uppercase text-[8px] tracking-wider">Experience</div>
                  <div className="font-extrabold text-slate-200 mt-0.5">{comp.exp}</div>
                </div>
                <div>
                  <div className="text-slate-600 uppercase text-[8px] tracking-wider">Location</div>
                  <div className="font-semibold text-slate-200 mt-0.5 truncate">{comp.location.split(',')[0]}</div>
                </div>
              </div>

              {/* Action Buttons conform to Part 8 specifications */}
              <div className="grid grid-cols-2 gap-2">
                {/* Secondary Actions: Call & WhatsApp */}
                <div className="grid grid-cols-2 gap-1">
                  <a 
                    href="tel:+919004155600"
                    onClick={() => onLogTriggered('B2B_CARD_CALL_INITIATED', 'companies', comp.id, 'SUCCESS', `Call log: Initiated direct corporate dialer link to ${comp.name}.`)}
                    className="bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 p-2 rounded-lg flex items-center justify-center transition-all hover:text-emerald-400"
                    title="Initiate direct dial"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                  <a 
                    href="https://wa.me/919004155600"
                    target="_blank"
                    rel="referrer noopener"
                    onClick={() => onLogTriggered('B2B_CARD_WHATSAPP_INITIATED', 'companies', comp.id, 'SUCCESS', `WhatsApp chat link opened for entity: ${comp.name}.`)}
                    className="bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 p-2 rounded-lg flex items-center justify-center transition-all hover:text-emerald-400"
                    title="Connect on WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  </a>
                </div>

                {/* Primary B2B Action: Connect */}
                <button
                  type="button"
                  onClick={() => handleProtectedAction('Connect Handshake', `With ${comp.name}`)}
                  className="bg-slate-950 hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/30 text-[10px] font-bold py-2 rounded-lg transition-all cursor-pointer"
                >
                  Connect
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setQuickInquiryItem(comp);
                    setQuickInquiryMessage(`Hello ${comp.name}, we are interested in exploring a potential business cooperation with your enterprise. Please share your catalog and corporate brochure.`);
                  }}
                  className="col-span-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[10.5px] py-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Mail className="w-3 h-3" />
                  <span>Send Enquiry</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* 5. FEATURED PRODUCTS (Marketplace Listings - TradeIndia style) */}
      <section className="px-4 md:px-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-850 pb-3">
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2 font-display">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              Featured B2B Products & Materials
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Explore listed machinery, reinforcement steel, ready-mix concrete, and building components.</p>
          </div>
          <button
            onClick={() => setActiveViewMode('marketplace')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>B2B Marketplace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INITIAL_MARKETPLACE_LISTINGS.slice(0, 3).map((prod) => (
            <div 
              key={prod.id}
              className="bg-slate-900/30 border border-slate-850 hover:border-slate-800 p-4 rounded-xl transition-all flex flex-col justify-between"
            >
              <div>
                {/* Product Meta */}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-semibold">
                    {prod.subcategory}
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {prod.location.split(',')[0]}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-200 mt-2.5 line-clamp-1">{prod.name}</h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{prod.shortDescription}</p>

                {/* Seller Detail */}
                <div className="mt-3 flex items-center justify-between bg-slate-950/60 p-2 rounded-lg text-[10px] font-mono border border-slate-850/60">
                  <span className="text-slate-400 truncate max-w-[130px]">{prod.businessName}</span>
                  <span className="text-emerald-400 text-[8px] border border-emerald-500/25 px-1 rounded uppercase tracking-wider font-extrabold bg-emerald-500/5">
                    Verified Seller
                  </span>
                </div>

                {/* Price block */}
                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">Wholesale Price</span>
                    <span className="text-sm font-extrabold text-white">{prod.price} <span className="text-[10px] font-normal text-slate-400">/ {prod.unit.split(' ')[0]}</span></span>
                  </div>
                  <div className="text-right text-[10px] font-mono text-slate-400">
                    <div>MOQ: <span className="text-slate-200 font-bold">{prod.moq}</span></div>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-850/60">
                <a
                  href="tel:+919004155600"
                  onClick={() => onLogTriggered('CALL_SELLER_INITIATED', 'marketplace', prod.id, 'SUCCESS', `Call initiated to seller of ${prod.name}`)}
                  className="bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-emerald-400 border border-slate-800 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Phone className="w-3 h-3 text-emerald-400" />
                  <span>Call Seller</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setQuickInquiryItem(prod);
                    setQuickInquiryMessage(`Hello, we are interested in procuring your listed item: "${prod.name}" (${prod.model}). Please provide technical datasheets, delivery lead times, and discounts for a bulk trial order.`);
                  }}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 py-1.5 rounded text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Mail className="w-3 h-3" />
                  <span>Send Inquiry</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* 6. LATEST RFQS (Tenders and Material requirements) */}
      <section className="px-4 md:px-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-850 pb-3">
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2 font-display">
              <FileText className="w-5 h-5 text-emerald-400" />
              Latest RFQs & Active Tenders
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Submit quotes directly to builders and developers for construction subcontracts and materials.</p>
          </div>
          <button
            onClick={() => setActiveViewMode('rfq_management')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>All RFQ Tenders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INITIAL_RFQS.slice(0, 2).map((rfq) => (
            <div 
              key={rfq.id}
              className="bg-slate-900/30 border border-slate-850 hover:border-slate-800 p-4 rounded-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-500">
                    {rfq.rfqNumber}
                  </span>
                  <span className="text-[10px] text-red-400 font-semibold bg-red-950/20 px-2 py-0.5 rounded font-mono">
                    Urgent Requirement
                  </span>
                </div>

                <h4 className="text-xs font-extrabold text-slate-200 mt-2.5 leading-snug line-clamp-1">{rfq.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{rfq.description}</p>

                {/* Sourcing Specs */}
                <div className="grid grid-cols-3 gap-2 py-2.5 my-3 bg-slate-950/40 border border-slate-850 rounded-lg text-center text-[10px] font-mono text-slate-400">
                  <div>
                    <span className="text-slate-600 block text-[8px] uppercase">Quantity</span>
                    <span className="font-extrabold text-slate-300 mt-0.5">{rfq.quantity} {rfq.unit.split(' ')[0]}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 block text-[8px] uppercase">Est. Budget</span>
                    <span className="font-extrabold text-slate-300 mt-0.5">{rfq.estimatedBudget}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 block text-[8px] uppercase">Location</span>
                    <span className="font-semibold text-slate-300 mt-0.5 truncate block px-1">{rfq.location}</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                  <span>Posted by: <strong className="text-slate-400">{rfq.companyName}</strong></span>
                  <span>•</span>
                  <span>Deadline: <strong className="text-slate-400">{rfq.quotationSubmissionDeadline}</strong></span>
                </div>
              </div>

              {/* CTA Handled for Guest vs Member */}
              <button
                type="button"
                onClick={() => handleProtectedAction('Quote Submission', `RFQ ${rfq.rfqNumber}`)}
                className="w-full mt-4 bg-slate-950 hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/20 py-2 rounded text-xs font-extrabold transition-all cursor-pointer"
              >
                Submit Quote Proposal
              </button>

            </div>
          ))}
        </div>
      </section>

      {/* 7. BUSINESS OPPORTUNITIES */}
      <section className="px-4 md:px-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-850 pb-3">
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2 font-display">
              <Briefcase className="w-5 h-5 text-emerald-400" />
              Investment & JV Opportunities
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Explore high-value joint ventures, development proposals, and equity collaborations.</p>
          </div>
          <button
            onClick={() => setActiveViewMode('opportunities')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>All Opportunities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INITIAL_OPPORTUNITIES.slice(0, 2).map((opp) => (
            <div 
              key={opp.id}
              className="bg-slate-900/30 border border-slate-850 hover:border-slate-800 p-4 rounded-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold uppercase">
                    {opp.type}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Closes: {opp.expectedClosingDate}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-200 mt-2.5 leading-snug line-clamp-1">{opp.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{opp.description}</p>

                <div className="mt-3 flex items-center justify-between text-[10.5px]">
                  <span className="text-slate-500 font-mono">Valuation/Budget: <strong className="text-slate-300">{opp.budget}</strong></span>
                  <span className="text-slate-500 font-mono">City: <strong className="text-slate-300">{opp.location.city}</strong></span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-850/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">
                  🔥 {opp.responsesCount} corporate responses received
                </span>
                <button
                  type="button"
                  onClick={() => handleProtectedAction('Express Interest', `Opportunity: ${opp.title.substring(0, 20)}...`)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[11px] font-extrabold px-4 py-1.5 rounded transition-all cursor-pointer"
                >
                  Express Interest
                </button>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* 8. TOP CITIES */}
      <section className="px-4 md:px-6 max-w-7xl mx-auto space-y-6">
        <div className="border-b border-slate-850 pb-3">
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2 font-display">
            <MapPin className="w-5 h-5 text-emerald-400" />
            Top Active Indian Construction Hubs
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Filter the verified B2B repository based on metro clusters and geographical commercial corridors.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {POPULAR_CITIES.map((city, index) => (
            <div 
              key={index}
              onClick={() => {
                onLogTriggered('CITY_FILTER_CLICKED', 'directory', city.name, 'SUCCESS', `Homepage City Filter: Selected "${city.name}".`);
                onSearchGlobal('', 'All', city.name);
              }}
              className={`bg-gradient-to-br ${city.color} border p-4 rounded-xl text-center cursor-pointer transition-all hover:scale-102 hover:border-slate-700`}
            >
              <div className="text-2xl mb-1">{city.icon}</div>
              <h4 className="text-xs font-bold text-white">{city.name}</h4>
              <p className="text-[10px] font-mono text-emerald-400 mt-0.5">{city.count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 9. WHY REALTYCONNECT (Value Proposition) */}
      <section className="px-4 md:px-6 max-w-7xl mx-auto">
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" /> Trusted Governance
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white font-display leading-tight">
              Why Real Estate Businesses Trust RealtyConnect™
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We eliminate traditional middleman markups by connecting builders, contractors, and material suppliers directly, backed by robust statutory verification and trusted B2B credentials.
            </p>
            <div className="pt-2">
              <button 
                onClick={onTriggerOnboarding}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1 group cursor-pointer"
              >
                <span>Learn about our Verification Standards</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Direct Contact, Zero Commissions", desc: "Negotiate raw material quotes, subcontracting fees, and service pricing directly with verified stakeholders.", icon: DollarSign },
              { title: "Verified RERA & GSTIN", desc: "Every profile undergoes verification of Indian statutory registrations to ensure zero fake listings.", icon: CheckCircle2 },
              { title: "Verified Trust & Compliance", desc: "Transparent business credentials, verified client reviews, and authenticated statutory registration records.", icon: ShieldCheck },
              { title: "Unified CRM & Operations", desc: "Synchronize leads, manage project deliverables, and trace supplier inventories all inside one platform.", icon: Layers }
            ].map((prop, idx) => {
              const Icon = prop.icon;
              return (
                <div key={idx} className="bg-slate-950/80 p-4 rounded-xl border border-slate-850/60 space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-200">{prop.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{prop.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. MEMBERSHIP PLANS (Pricing matrix) */}
      <section id="membership-plans-section" className="px-4 md:px-6 max-w-7xl mx-auto space-y-6">
        <div className="border-b border-slate-850 pb-3 text-center max-w-2xl mx-auto space-y-1.5">
          <span className="text-[9.5px] font-mono text-emerald-400 uppercase tracking-widest font-extrabold">Grow Your B2B Presence</span>
          <h3 className="text-lg sm:text-xl font-extrabold text-white font-display">
            Premium Corporate Membership Plans
          </h3>
          <p className="text-xs text-slate-400">Unlock verified badges, top-tier search visibility, and advanced CRM integrations.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { name: "Bronze Member", price: "Free", period: "Forever", features: ["Basic Business Directory Listing", "Standard Search Visibility", "Receive up to 5 RFQ Inquiries/mo", "Public Project Portfolio Tab", "Multi-User Access"], color: "border-slate-850 bg-slate-900/20 text-slate-400", button: "Get Started Free", premium: false },
            { name: "Silver Member", price: "₹12,500", period: "Per Year", features: ["Bronze Features Included", "Verified Supplier Badge", "Double Search Visibility Matrix", "Unrestricted RFQ Inquiries", "Standard CRM & Lead Pipeline", "Up to 3 Team Member Seats"], color: "border-blue-900/30 bg-blue-950/5 text-blue-400", button: "Upgrade to Silver", premium: true },
            { name: "Gold Corporate", price: "₹24,000", period: "Per Year", features: ["Silver Features Included", "Premium Seller Badge", "Triple Search Rank Booster", "Direct B2B Messaging Enabled", "Full Procurement & Materials Tools", "Up to 10 Team Member Seats"], color: "border-indigo-900/40 bg-indigo-950/10 text-indigo-400", button: "Subscribe Gold", premium: true },
            { name: "Platinum Enterprise", price: "₹48,000", period: "Per Year", features: ["Gold Features Included", "Verified Platinum Badge", "Top-of-List Search Priority", "Custom JV Opportunity Creator", "Priority Account Management & Support", "Unlimited Seats & Custom CRM"], color: "border-emerald-900/40 bg-emerald-950/10 text-emerald-400", button: "Request Platinum", premium: true }
          ].map((plan, idx) => (
            <div 
              key={idx}
              className={`bg-slate-900/40 border rounded-xl p-5 transition-all flex flex-col justify-between hover:scale-102 ${plan.color}`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                  <span className="text-xs font-extrabold text-slate-100">{plan.name}</span>
                  {plan.premium && (
                    <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1.5 rounded font-mono font-bold uppercase">Pro</span>
                  )}
                </div>

                <div className="py-4 font-display">
                  <span className="text-2xl font-extrabold text-white">{plan.price}</span>
                  {plan.period && <span className="text-[10px] font-mono text-slate-500 ml-1">/ {plan.period}</span>}
                </div>

                <ul className="space-y-2 text-[10.5px] text-slate-400">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => handleProtectedAction('Subscription Upgrade', `Plan: ${plan.name}`)}
                className="w-full mt-6 bg-slate-950 hover:bg-slate-850 text-slate-200 hover:text-white py-1.5 text-xs font-semibold rounded-lg border border-slate-800 transition-all cursor-pointer"
              >
                {plan.button}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 11. CUSTOMER SUCCESS STORIES */}
      <section className="px-4 md:px-6 max-w-4xl mx-auto space-y-6">
        <div className="border-b border-slate-850 pb-3 text-center">
          <h3 className="text-lg font-extrabold text-white font-display">
            Stories of Growth from our B2B Members
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">Over ₹450 Crores of real estate materials and subcontracts sourced.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SUCCESS_STORIES.map((story, index) => (
            <div 
              key={index}
              className="bg-slate-900/30 p-5 rounded-xl border border-slate-850 relative flex flex-col justify-between"
            >
              <div className="text-3xl text-slate-700 font-serif absolute top-3 left-4 select-none">“</div>
              <p className="text-xs text-slate-300 italic leading-relaxed relative z-10 pl-2">
                {story.quote}
              </p>
              
              <div className="flex items-center gap-2.5 mt-4 pt-3 border-t border-slate-850/60">
                <div className={`w-7 h-7 rounded-full ${story.avatarBg} text-white flex items-center justify-center text-[10px] font-bold`}>
                  {story.author.substring(0, 1)}
                </div>
                <div>
                  <h5 className="text-[11px] font-bold text-slate-200 leading-none">{story.author}</h5>
                  <p className="text-[9px] text-slate-500 mt-1">{story.role} • {story.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 12. INDUSTRY UPDATES */}
      <section className="px-4 md:px-6 max-w-7xl mx-auto space-y-6">
        <div className="border-b border-slate-850 pb-3">
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2 font-display">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            Indian Real Estate Market Registry Updates
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Stay informed on standard RERA changes, central cement indexes, and B2B announcements.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INDUSTRY_UPDATES.map((upd, idx) => (
            <div 
              key={idx}
              className="bg-slate-900/20 border border-slate-850 hover:border-slate-800 p-4 rounded-xl flex items-start gap-4 transition-all"
            >
              <div className="bg-slate-950 p-2 border border-slate-850 rounded-lg text-center shrink-0">
                <Clock className="w-4 h-4 text-slate-500" />
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[9.5px] font-mono">
                  <span className="text-slate-500">{upd.date}</span>
                  <span className="text-slate-800">•</span>
                  <span className="text-emerald-400 font-bold uppercase">{upd.category}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-200 hover:text-emerald-400 transition-colors">
                  {upd.title}
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {upd.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 13. CONTACT FORM SECTION (Leads registration) */}
      <section id="contact-us-section" className="px-4 md:px-6 max-w-3xl mx-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-base font-extrabold text-white flex items-center justify-center gap-1.5 font-display">
              <Mail className="w-4 h-4 text-emerald-400" />
              Settle Your Procurement Requirement Instantly
            </h3>
            <p className="text-[11px] text-slate-400">Provide details of your bulk requirements to receive immediate quotes from verified Indian manufacturers.</p>
          </div>

          <form onSubmit={handleContactSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase font-semibold mb-1">Company / Your Name *</label>
                <input 
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Singhal Homes"
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-emerald-500/50"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase font-semibold mb-1">Corporate Email *</label>
                <input 
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="e.g. procurement@singhal.in"
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase font-semibold mb-1">Mobile / Phone Number</label>
                <input 
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="e.g. +91 98200 12345"
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase font-semibold mb-1">Describe Material Requirement or Subcontract Specs *</label>
              <textarea 
                rows={3}
                required
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="e.g. Looking to source 250 MT of Fe550D TMT Rebar steel diameters 12mm and 16mm, delivery needed in Worli Mumbai by late August. Standard payment LC."
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-emerald-500/50 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={contactSubmitted}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 disabled:text-slate-950 text-slate-950 font-extrabold text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1 shadow-md shadow-emerald-500/15 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{contactSubmitted ? 'Submitting Sourcing Ticket...' : 'Post Sourcing Ticket & Get Quotes'}</span>
            </button>
          </form>
        </div>
      </section>

      {/* 14. FOOTER */}
      <footer className="border-t border-slate-850 pt-8 mt-12 bg-slate-950 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                <Building2 className="w-4.5 h-4.5 text-slate-950 stroke-[2.5]" />
              </div>
              <span className="font-display font-extrabold text-base text-white tracking-tight">RealtyConnect™</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              India's Integrated Real Estate Business Network—a unified platform where every stakeholder in the real estate ecosystem can discover, connect, collaborate, buy, sell, hire, finance, and manage business operations.
            </p>
            <p className="text-[10px] text-slate-600 font-mono">
              Designed & Managed by MultiSarv India Pvt. Ltd. <br/>
              ISO 9001:2015 & RERA Feasibility Audited.
            </p>
          </div>

          <div className="md:col-span-2 space-y-2 text-xs">
            <h5 className="font-extrabold text-white text-[11px] tracking-wider uppercase font-mono">Public Links</h5>
            <ul className="space-y-1">
              <li><button onClick={() => setActiveViewMode('home')} className="hover:text-emerald-400 transition-colors cursor-pointer text-[11px] text-left">Marketplace Home</button></li>
              <li><button onClick={() => setActiveViewMode('directory')} className="hover:text-emerald-400 transition-colors cursor-pointer text-[11px] text-left">Registered Businesses</button></li>
              <li><button onClick={() => setActiveViewMode('marketplace')} className="hover:text-emerald-400 transition-colors cursor-pointer text-[11px] text-left">Listed Products</button></li>
              <li><button onClick={() => setActiveViewMode('rfq_management')} className="hover:text-emerald-400 transition-colors cursor-pointer text-[11px] text-left">Active RFQs & Tenders</button></li>
              <li><button onClick={() => setActiveViewMode('opportunities')} className="hover:text-emerald-400 transition-colors cursor-pointer text-[11px] text-left">JVs & Opportunities</button></li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-2 text-xs">
            <h5 className="font-extrabold text-white text-[11px] tracking-wider uppercase font-mono">Verified Cities</h5>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              {['Mumbai MH', 'Bangalore KA', 'Delhi NCR', 'Hyderabad TS', 'Pune MH', 'Chennai TN'].map((c) => (
                <button
                  key={c}
                  onClick={() => onSearchGlobal('', 'All', c.split(' ')[0])}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-[11px] text-left block"
                >
                  • {c}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-3 space-y-2 text-xs">
            <h5 className="font-extrabold text-white text-[11px] tracking-wider uppercase font-mono">Get in Touch</h5>
            <p className="text-[11px] leading-normal text-slate-500">Have customized licensing questions? Contact our corporate team at:</p>
            <div className="space-y-1 font-mono text-[10px] text-slate-400">
              <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-500" /> support@realtyconnect.in</div>
              <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-500" /> +91 90041 55600</div>
              <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-500" /> Bandra Kurla Complex, Mumbai</div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 mt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-600 font-mono">
          <div>© 2026 RealtyConnect™. All rights reserved by MultiSarv India.</div>
          <div className="flex flex-wrap items-center gap-4">
            <a href="#" className="hover:text-slate-400">Privacy Standards</a>
            <a href="#" className="hover:text-slate-400">RERA Disclosures</a>
            <a href="#" className="hover:text-slate-400">LOG-01 Cryptographic Audits</a>
            {onToggleDevHub && (
              <button
                type="button"
                onClick={() => {
                  onLogTriggered('DEV_FOUNDATION_HUB_BYPASS_ENGAGED', 'system_operator', 'dev_hub_toggle', 'WARNING', 'System bypass: Administrator toggled landing view back to the developer Platform Foundation Hub.');
                  onToggleDevHub();
                }}
                className="text-emerald-500/60 hover:text-emerald-400 hover:underline flex items-center gap-1 border border-emerald-500/10 hover:border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 rounded cursor-pointer transition-all"
                title="Return to Technical Foundation for testing and logs verification"
              >
                <Terminal className="w-3 h-3 text-emerald-400" />
                <span>Developer Foundation Hub</span>
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* QUICK INQUIRY MODAL SHEET */}
      {quickInquiryItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 bg-slate-950 border-b border-slate-850 flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-emerald-400" />
                Inquire Directly with Seller
              </h4>
              <button 
                onClick={() => setQuickInquiryItem(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-850"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickInquirySubmit} className="p-4 space-y-4">
              <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-850 flex items-start gap-2.5">
                <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-xs font-mono font-bold text-emerald-400">
                  {quickInquiryItem.logoText || (quickInquiryItem.imageIcon || '📦')}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-200 truncate">{quickInquiryItem.name || quickInquiryItem.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{quickInquiryItem.category} • {quickInquiryItem.location || 'Mumbai MH'}</div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase font-semibold mb-1">Your Requirements / Proposal Message *</label>
                <textarea 
                  rows={4}
                  required
                  value={quickInquiryMessage}
                  onChange={(e) => setQuickInquiryMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-emerald-500/50 resize-none font-sans"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setQuickInquiryItem(null)}
                  className="w-1/2 bg-slate-950 hover:bg-slate-850 text-slate-300 font-bold text-xs py-2 rounded-lg border border-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send B2B Inquiry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
