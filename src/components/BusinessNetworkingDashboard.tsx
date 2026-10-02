import React, { useState, useMemo } from 'react';
import { 
  Building2, Users, UserCheck, Bell, Calendar, Mail, Send, Globe, Bookmark, 
  ShieldAlert, Check, Plus, Search, Trash2, Edit3, Save, X, Activity, 
  ChevronRight, Sparkles, TrendingUp, ExternalLink, FileText, CheckCircle2, 
  AlertTriangle, Heart, MapPin, Filter, ArrowUpRight, Download, UserPlus, 
  PhoneCall, Compass, AlertCircle, RefreshCw, Trash, ThumbsUp, Map, Award, 
  ListFilter, Share2, Star, Eye, MessageSquare, Clock, ShieldCheck, Lock
} from 'lucide-react';

// Unified interfaces representing the robust B2B relationship state machine
export interface Connection {
  id: string;
  businessId: string;
  businessName: string;
  businessCategory: string;
  businessLocation: string;
  logoBg: string;
  status: 'pending_incoming' | 'pending_outgoing' | 'accepted';
  timestamp: string;
  purpose: string;
  mutualCount: number;
}

export interface Enquiry {
  id: string;
  businessId: string;
  businessName: string;
  subject: string;
  category: string;
  message: string;
  senderEmail: string;
  senderPhone: string;
  timestamp: string;
  reply?: string;
  status: 'sent' | 'replied';
}

export interface Meeting {
  id: string;
  businessId: string;
  businessName: string;
  title: string;
  date: string;
  time: string;
  type: 'Virtual Video Call' | 'In-Person Corporate Office' | 'On-Site Construction Review';
  status: 'scheduled' | 'cancelled' | 'completed';
  timestamp: string;
}

export interface Partnership {
  id: string;
  businessId: string;
  businessName: string;
  type: 'partnership' | 'dealer' | 'distributor';
  terms: string;
  estimatedValue: string;
  scope: string;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: string;
}

export interface ContactExchange {
  id: string;
  businessId: string;
  businessName: string;
  role: string;
  phone: string;
  email: string;
  status: 'pending' | 'accepted';
  timestamp: string;
}

export interface CompanyVisit {
  id: string;
  businessId: string;
  businessName: string;
  facilityName: string;
  date: string;
  time: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}

export interface RfqOpportunity {
  id: string;
  title: string;
  category: string;
  quantity: string;
  estimatedValue: string;
  closeDate: string;
  description: string;
  publishedBy: string;
  bidsCount: number;
  status: 'active' | 'closed';
  timestamp: string;
}

export interface ExternalInvitation {
  id: string;
  email: string;
  website: string;
  role: string;
  timestamp: string;
  status: 'sent' | 'activated';
}

export interface BlockedReported {
  id: string;
  businessId: string;
  businessName: string;
  action: 'blocked' | 'reported';
  reason: string;
  details?: string;
  timestamp: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  action: string;
  category: string;
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'INFO';
}

interface BusinessNetworkingDashboardProps {
  connections: Connection[];
  following: string[];
  followers: string[];
  savedBusinesses: string[];
  favoriteCompanies: string[];
  enquiries: Enquiry[];
  meetings: Meeting[];
  partnerships: Partnership[];
  contactExchanges: ContactExchange[];
  companyVisits: CompanyVisit[];
  rfqs: RfqOpportunity[];
  invitations: ExternalInvitation[];
  blockedReported: BlockedReported[];
  timeline: TimelineEvent[];
  
  onAcceptConnection: (id: string) => void;
  onRejectConnection: (id: string) => void;
  onWithdrawConnection: (id: string) => void;
  onSendConnection: (businessId: string, name: string, category: string, loc: string, logo: string, purpose: string) => void;
  onToggleFollow: (businessId: string, name: string) => void;
  onToggleSave: (businessId: string, name: string) => void;
  onToggleFavorite: (businessId: string, name: string) => void;
  onSendEnquiry: (businessId: string, name: string, subject: string, category: string, message: string, email: string, phone: string) => void;
  onScheduleMeeting: (businessId: string, name: string, title: string, date: string, time: string, type: string) => void;
  onSendPartnership: (businessId: string, name: string, type: 'partnership' | 'dealer' | 'distributor', terms: string, value: string, scope: string) => void;
  onSendContactExchange: (businessId: string, name: string, role: string, phone: string, email: string) => void;
  onSendCompanyVisit: (businessId: string, name: string, facility: string, date: string, time: string, purpose: string) => void;
  onPublishRfq: (title: string, category: string, quantity: string, value: string, closeDate: string, desc: string) => void;
  onSendInvitation: (email: string, website: string, role: string) => void;
  onBlockCompany: (businessId: string, name: string, reason: string) => void;
  onReportCompany: (businessId: string, name: string, reason: string, details: string) => void;
  onUnblockCompany: (businessId: string) => void;
  onLogTimeline: (action: string, category: string, details: string, status?: 'SUCCESS' | 'WARNING' | 'INFO') => void;
  onLogTriggered: (action: string, targetType: string, targetId: string, status: string, details: string) => void;
  
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onViewBusinessProfile: (businessId: string) => void;
  allBusinesses: any[];
}

export default function BusinessNetworkingDashboard({
  connections, following, followers, savedBusinesses, favoriteCompanies,
  enquiries, meetings, partnerships, contactExchanges, companyVisits, rfqs,
  invitations, blockedReported, timeline,
  onAcceptConnection, onRejectConnection, onWithdrawConnection, onSendConnection,
  onToggleFollow, onToggleSave, onToggleFavorite, onSendEnquiry, onScheduleMeeting,
  onSendPartnership, onSendContactExchange, onSendCompanyVisit, onPublishRfq,
  onSendInvitation, onBlockCompany, onReportCompany, onUnblockCompany,
  onLogTimeline, onLogTriggered, showToast, onViewBusinessProfile, allBusinesses
}: BusinessNetworkingDashboardProps) {
  
  // High-level navigation and sub-navigation states
  const [activeTab, setActiveTab] = useState<'overview' | 'connections' | 'enquiries' | 'partnerships' | 'meetings' | 'invitations' | 'preferences'>('overview');
  const [connectionsSubTab, setConnectionsSubTab] = useState<'roster' | 'requests' | 'following' | 'activity'>('roster');
  
  // Interactive Overrides for Meeting / Partnership dynamic states
  const [localMeetings, setLocalMeetings] = useState<Meeting[]>(meetings);
  const [localPartnerships, setLocalPartnerships] = useState<Partnership[]>(partnerships);
  const [localFollowing, setLocalFollowing] = useState<string[]>(following);
  const [localSaved, setLocalSaved] = useState<string[]>(savedBusinesses);
  const [localFavorites, setLocalFavorites] = useState<string[]>(favoriteCompanies);

  // Filters and queries
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [meetingsSubFilter, setMeetingsSubFilter] = useState<'all' | 'upcoming' | 'pending' | 'cancelled'>('all');
  const [partnershipsSubFilter, setPartnershipsSubFilter] = useState<'all' | 'jv' | 'partnership' | 'dealer' | 'distributor'>('all');

  // Modals state management
  const [activeModal, setActiveModal] = useState<'rfq' | 'invite' | 'meeting' | 'visit' | 'proposal' | 'block' | 'message' | null>(null);
  const [modalTargetCompanyId, setModalTargetCompanyId] = useState('');
  const [modalFormData, setModalFormData] = useState<any>({});

  // Intercepting props for local responsiveness
  React.useEffect(() => { setLocalMeetings(meetings); }, [meetings]);
  React.useEffect(() => { setLocalPartnerships(partnerships); }, [partnerships]);
  React.useEffect(() => { setLocalFollowing(following); }, [following]);
  React.useEffect(() => { setLocalSaved(savedBusinesses); }, [savedBusinesses]);
  React.useEffect(() => { setLocalFavorites(favoriteCompanies); }, [favoriteCompanies]);

  // Comprehensive company lookups and default mock state generator
  const getCompanyDetails = (id: string) => {
    const b = allBusinesses.find(item => item.id === id);
    return {
      id,
      name: b?.name || (id === 'ent-1' ? 'Apex Developers Ltd' : id === 'ent-2' ? 'BuildCorp Construction' : id === 'ent-3' ? 'Elite Materials Group' : 'Premium Partner'),
      category: b?.category || 'Enterprise Segment',
      location: b?.location || 'Mumbai, MH',
      verified: b?.verified ?? true,
      logoBg: b?.logoBg || 'bg-slate-700',
      rating: b?.rating || '4.8',
      membership: id === 'ent-1' || id === 'ent-2' ? 'Enterprise Platinum' : 'Premium Gold',
      specialty: b?.specialty || b?.description || 'Corporate Infrastructure Partner',
      tags: b?.tags || ['RERA Compliant', 'ISO Certified']
    };
  };

  // Connection Requests filters
  const pendingIncomingRequests = connections.filter(c => c.status === 'pending_incoming');
  const pendingOutgoingRequests = connections.filter(c => c.status === 'pending_outgoing');
  const acceptedConnections = connections.filter(c => c.status === 'accepted');

  // Interactive local triggers
  const triggerFollow = (id: string, name: string) => {
    onToggleFollow(id, name);
    setLocalFollowing(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const triggerSave = (id: string, name: string) => {
    onToggleSave(id, name);
    setLocalSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const triggerFavorite = (id: string, name: string) => {
    onToggleFavorite(id, name);
    setLocalFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleShareCompany = (name: string) => {
    const mockLink = `https://realtyconnect.in/co/${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    navigator.clipboard.writeText(mockLink);
    onLogTimeline('CORPORATE_B2B_LINK_SHARED', 'connections', `Dispatched share link of ${name} with encrypted token payload.`, 'INFO');
    showToast(`Corporate handshake link for ${name} copied to clipboard!`, 'success');
  };

  const handleAcceptMeeting = (id: string) => {
    setLocalMeetings(prev => prev.map(m => m.id === id ? { ...m, status: 'scheduled' } : m));
    onLogTimeline('B2B_MEETING_ACCEPTED', 'meetings', `Confirmed active calendar agenda for block ${id}.`, 'SUCCESS');
    showToast('B2B Consultation scheduled and synced to corporate calendar!', 'success');
  };

  const handleCancelMeeting = (id: string) => {
    setLocalMeetings(prev => prev.map(m => m.id === id ? { ...m, status: 'cancelled' } : m));
    onLogTimeline('B2B_MEETING_CANCELLED', 'meetings', `Withdrew calendar reservation for block ${id}.`, 'WARNING');
    showToast('Meeting cancelled successfully.', 'info');
  };

  const handleAcceptPartnership = (id: string) => {
    setLocalPartnerships(prev => prev.map(p => p.id === id ? { ...p, status: 'accepted' } : p));
    onLogTimeline('PARTNERSHIP_PROPOSAL_ACCEPTED', 'partnerships', `Accepted official commercial terms for alliance ${id}.`, 'SUCCESS');
    showToast('B2B Channel Partnership approved and registered in ledger!', 'success');
  };

  const handleDeclinePartnership = (id: string) => {
    setLocalPartnerships(prev => prev.map(p => p.id === id ? { ...p, status: 'declined' } : p));
    onLogTimeline('PARTNERSHIP_PROPOSAL_DECLINED', 'partnerships', `Rejected proposal terms for alliance ${id}.`, 'WARNING');
    showToast('Partnership proposal declined.', 'info');
  };

  // Unified submit handler for consolidated modals
  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = modalFormData;
    if (activeModal === 'rfq') {
      onPublishRfq(fd.title, fd.category || 'Materials Supply', fd.quantity, fd.estimatedValue, fd.closeDate || '2026-08-30', fd.description);
    } else if (activeModal === 'invite') {
      onSendInvitation(fd.email, fd.website, fd.role || 'Vendor');
    } else if (activeModal === 'meeting') {
      const co = getCompanyDetails(modalTargetCompanyId || fd.businessId);
      onScheduleMeeting(co.id, co.name, fd.title || 'Procurement Consult', fd.date || '2026-07-25', fd.time || '11:00 AM', fd.type || 'Virtual Video Call');
    } else if (activeModal === 'visit') {
      const co = getCompanyDetails(modalTargetCompanyId || fd.businessId);
      onSendCompanyVisit(co.id, co.name, fd.facilityName || 'Main Batching Plant', fd.date || '2026-07-28', fd.time || '02:30 PM', fd.purpose);
    } else if (activeModal === 'proposal') {
      const co = getCompanyDetails(modalTargetCompanyId || fd.businessId);
      onSendPartnership(co.id, co.name, fd.type || 'partnership', fd.terms, fd.estimatedValue, fd.scope);
    } else if (activeModal === 'block') {
      const co = getCompanyDetails(modalTargetCompanyId || fd.businessId);
      onBlockCompany(co.id, co.name, fd.reason || 'Spam activities');
    } else if (activeModal === 'message') {
      const co = getCompanyDetails(modalTargetCompanyId);
      onSendEnquiry(co.id, co.name, fd.subject || 'Enterprise Liaison Enquiry', fd.category || 'General Liaison', fd.message, fd.senderEmail || 'liaison@corporate.in', fd.senderPhone || '+91 90000 11111');
    }
    setActiveModal(null);
    setModalFormData({});
    setModalTargetCompanyId('');
  };

  // Helper connection card renderer supporting full actions & micro-interactions
  const renderConnectionCard = (bizId: string, relationStatus?: 'connected' | 'pending_in' | 'pending_out' | 'none', purposeText?: string, connId?: string) => {
    const b = getCompanyDetails(bizId);
    const isSaved = localSaved.includes(bizId);
    const isFav = localFavorites.includes(bizId);
    const isFollowing = localFollowing.includes(bizId);

    return (
      <div key={bizId} className="group relative bg-slate-900/50 border border-slate-850 hover:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between gap-5 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/[0.02]">
        
        {/* Card Header & Brand Block */}
        <div className="space-y-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl ${b.logoBg} flex items-center justify-center text-white font-black text-sm shadow-md shadow-slate-950/40 transform group-hover:scale-105 transition-transform duration-300`}>
                {b.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-extrabold text-white text-xs hover:underline cursor-pointer tracking-tight font-display" onClick={() => onViewBusinessProfile(bizId)}>
                    {b.name}
                  </h4>
                  {b.verified && (
                    <span className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="Verified Professional Identity">
                      <CheckCircle2 className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-medium">{b.category}</span>
                  <span className="text-slate-700 font-mono text-[9px]">•</span>
                  <span className="text-[9px] font-mono text-amber-500 flex items-center gap-0.5 bg-amber-500/5 px-1 rounded border border-amber-500/10">
                    <Star className="w-2.5 h-2.5 fill-amber-500" />
                    {b.rating}
                  </span>
                </div>
              </div>
            </div>

            {/* Premium Membership Ribbon */}
            <span className={`text-[8px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
              b.membership.includes('Platinum') 
                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              {b.membership.replace('Premium ', '').replace('Enterprise ', '')}
            </span>
          </div>

          {/* Description & Metadata */}
          <div className="space-y-2">
            <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 min-h-[32px]">
              {b.specialty}
            </p>
            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
              <span className="flex items-center gap-1 text-slate-400">
                <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                {b.location}
              </span>
              <span>•</span>
              <span className="text-emerald-400/90 font-semibold bg-emerald-500/[0.03] px-1.5 py-0.5 rounded border border-emerald-500/5">
                {b.id === 'ent-1' ? 4 : b.id === 'ent-2' ? 6 : 2} mutual partners
              </span>
            </div>
          </div>

          {purposeText && (
            <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-850/60 text-[11px] italic text-slate-300">
              <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest font-bold mb-1 leading-none">handshake proposal:</span>
              "{purposeText}"
            </div>
          )}
        </div>

        {/* Card Quick Action Bar */}
        <div className="pt-3 border-t border-slate-850 flex items-center justify-between gap-2 text-[10px] font-mono">
          <div className="flex items-center gap-1">
            <button 
              onClick={() => triggerFavorite(bizId, b.name)}
              className={`p-2 rounded-lg border transition-colors ${isFav ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-rose-400'}`}
              title="Add to Corporate Favorites"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
            </button>
            <button 
              onClick={() => triggerFollow(bizId, b.name)}
              className={`px-2.5 py-1.5 rounded-lg border font-bold transition-all ${isFollowing ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white'}`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
            <button 
              onClick={() => handleShareCompany(b.name)}
              className="p-2 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-500 hover:text-white rounded-lg transition-colors"
              title="Share handshakes reference"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {relationStatus === 'connected' && (
              <div className="flex gap-1.5">
                <button 
                  onClick={() => { setModalTargetCompanyId(bizId); setActiveModal('message'); }}
                  className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-300 rounded-lg font-bold"
                >
                  Inquire
                </button>
                <button 
                  onClick={() => { setModalTargetCompanyId(bizId); setActiveModal('meeting'); }}
                  className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg font-black shadow-md shadow-emerald-500/10"
                >
                  Meet
                </button>
              </div>
            )}

            {relationStatus === 'pending_in' && connId && (
              <div className="flex gap-1">
                <button onClick={() => onRejectConnection(connId)} className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-850 text-slate-400 rounded-lg">Ignore</button>
                <button onClick={() => onAcceptConnection(connId)} className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg font-bold">Accept</button>
              </div>
            )}

            {relationStatus === 'pending_out' && connId && (
              <button onClick={() => onWithdrawConnection(connId)} className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-red-400 rounded-lg">Withdraw</button>
            )}

            {relationStatus === 'none' && (
              <button 
                onClick={() => {
                  const purpose = `Corporate liaison and bulk contract synergy routing with ${b.name}`;
                  onSendConnection(bizId, b.name, b.category, b.location, b.logoBg, purpose);
                  showToast(`Handshake invitation dispatched to ${b.name}`, 'success');
                }}
                className="px-3 py-1.5 bg-slate-950 hover:bg-emerald-500 hover:text-slate-950 border border-slate-850 text-slate-300 rounded-lg font-bold transition-all"
              >
                Connect
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Filtered lists for various tab view displays
  const suggestedConnections = useMemo(() => {
    return allBusinesses.filter(b => 
      !connections.some(c => c.businessId === b.id) && 
      (categoryFilter === 'All' || b.category === categoryFilter) &&
      b.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allBusinesses, connections, categoryFilter, searchQuery]);

  return (
    <div className="bg-slate-950 border border-slate-850 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-slate-200 font-sans" id="realty-networking-system">
      
      {/* 1. Dynamic Welcome & Executive Stats Board */}
      <div className="bg-slate-900/60 p-6 sm:p-8 border-b border-slate-850 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-5 h-5 animate-pulse" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-display">
              Enterprise Discovery & Handshake Hub
            </h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Monitor real-time RERA verified contractor handshakes, coordinate audited manufacturing yard visits, publish bulk material RFQs, and manage cross-corporate joint venture parameters.
          </p>
        </div>

        {/* Hub Action Command Bar */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={() => { setModalFormData({ category: 'Materials Supply', closeDate: '2026-08-15' }); setActiveModal('rfq'); }}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/10 transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Publish Bulk RFQ
          </button>
          <button
            onClick={() => { setModalFormData({ role: 'Vendor' }); setActiveModal('invite'); }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
          >
            <UserPlus className="w-4 h-4 text-emerald-400" />
            Invite External Vendor
          </button>
        </div>
      </div>

      {/* 2. Sleek B2B Metrics Block */}
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 bg-slate-900/10 border-b border-slate-850/80">
        {[
          { label: 'Active Handshakes', value: acceptedConnections.length, color: 'text-emerald-400', desc: 'Verified partners', icon: UserCheck },
          { label: 'Incoming Invites', value: pendingIncomingRequests.length, color: 'text-amber-400', desc: 'Awaiting signature', icon: Bell },
          { label: 'Outgoing Pending', value: pendingOutgoingRequests.length, color: 'text-indigo-400', desc: 'In outbound pipeline', icon: Send },
          { label: 'Consult Pipelines', value: localMeetings.filter(m => m.status === 'scheduled').length, color: 'text-cyan-400', desc: 'Upcoming site audits', icon: Calendar },
          { label: 'Alliance Proposals', value: localPartnerships.length, color: 'text-rose-400', desc: 'Joint venture boards', icon: Award },
          { label: 'Saved Directory', value: localSaved.length + localFavorites.length, color: 'text-teal-400', desc: 'Bookmarks ledger', icon: Bookmark }
        ].map((k, i) => {
          const Icon = k.icon;
          return (
            <div key={i} className="bg-slate-900/40 p-4.5 rounded-2xl border border-slate-850/60 flex flex-col justify-between hover:border-slate-800 hover:bg-slate-900/60 transition-all duration-300 group">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold group-hover:text-slate-400 transition-colors">{k.label}</span>
                <Icon className={`w-4 h-4 ${k.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
              </div>
              <div className="mt-3">
                <span className={`text-2xl font-black font-mono tracking-tight block ${k.color}`}>{k.value}</span>
                <span className="text-[9px] text-slate-500 font-sans mt-0.5 block truncate">{k.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Primary Module Navigation */}
      <div className="bg-slate-900/20 px-6 border-b border-slate-850 flex items-center gap-6 overflow-x-auto font-mono text-xs font-bold text-slate-400 scrollbar-none">
        {[
          { id: 'overview', label: 'Network Home', icon: Compass },
          { id: 'connections', label: 'Connections & Requests', icon: Users },
          { id: 'enquiries', label: 'Enquiry & RFQ Room', icon: Mail },
          { id: 'partnerships', label: 'Alliances & Channels', icon: Award },
          { id: 'meetings', label: 'Meetings & Site Audits', icon: Calendar },
          { id: 'invitations', label: 'External Inviter', icon: Globe },
          { id: 'preferences', label: 'Guardrails & Favorites', icon: ShieldAlert }
        ].map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 flex items-center gap-2 border-b-2 shrink-0 transition-all duration-200 cursor-pointer ${
                isSelected 
                  ? 'border-emerald-500 text-emerald-400 font-extrabold translate-y-[1px]' 
                  : 'border-transparent hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 4. Main Tab Panel Renderers */}
      <div className="p-6 sm:p-8 min-h-[500px]">
        
        {/* ========================================================= */}
        {/* TAB: NETWORK HOME                                         */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in text-xs">
            
            {/* Left Pane - Recommendations, Invites, and Discovery */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Highlight incoming invites immediately */}
              {pendingIncomingRequests.length > 0 && (
                <div className="bg-amber-500/[0.02] border border-amber-500/20 p-5 rounded-3xl space-y-4">
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Bell className="w-4 h-4 animate-bounce" />
                    Incoming Connection Handshake Invites ({pendingIncomingRequests.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingIncomingRequests.map(r => renderConnectionCard(r.businessId, 'pending_in', r.purpose, r.id))}
                  </div>
                </div>
              )}

              {/* Suggestions / Discovery Grid */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      Suggested Partners & Recommended Connections
                    </h3>
                    <p className="text-[11px] text-slate-400">Discover top-rated developers, contractors, and cement/steel manufacturers based on your sector tags.</p>
                  </div>
                  
                  {/* Quick Categories Filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-slate-500" />
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-[10px] text-slate-300 px-2 py-1.5 rounded-lg outline-none font-mono"
                    >
                      <option value="All">All Categories</option>
                      <option value="Developers">Developers</option>
                      <option value="Contractors">Contractors</option>
                      <option value="Vendors">Vendors</option>
                      <option value="Consultants">Consultants</option>
                    </select>
                  </div>
                </div>

                {suggestedConnections.length === 0 ? (
                  <div className="p-12 text-center bg-slate-900/20 border border-dashed border-slate-850 rounded-2xl text-slate-500">
                    No suggestions found matching active segment filters.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {suggestedConnections.slice(0, 4).map(b => renderConnectionCard(b.id, 'none'))}
                  </div>
                )}
              </div>
              
              {/* Mutual/Recently Connected Carousel */}
              {acceptedConnections.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Recently Connected (Mutual Alliance roster)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {acceptedConnections.slice(0, 3).map(conn => {
                      const b = getCompanyDetails(conn.businessId);
                      return (
                        <div key={conn.id} className="bg-slate-900/30 border border-slate-850/80 p-4 rounded-2xl flex items-center gap-3 hover:border-slate-800 transition-all">
                          <div className={`w-8 h-8 rounded-lg ${b.logoBg} flex items-center justify-center text-white text-[11px] font-black shrink-0`}>
                            {b.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="space-y-0.5 truncate">
                            <strong className="text-white hover:underline cursor-pointer text-xs truncate block" onClick={() => onViewBusinessProfile(b.id)}>{b.name}</strong>
                            <span className="text-[10px] text-slate-500 font-mono block">{b.category}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Pane - Activity & Timeline sidebar */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Dynamic Relationship Actions Quick Launcher */}
              <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-3xl space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider font-mono text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  Quick Relationship Tools
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { label: 'Schedule Consult Request', icon: Calendar, color: 'text-cyan-400', onClick: () => { setModalFormData({ title: 'Commercial Contract Alignment' }); setActiveModal('meeting'); } },
                    { label: 'Request Facility Site Tour', icon: MapPin, color: 'text-emerald-400', onClick: () => { setModalFormData({ purpose: 'Audit compression machines and ISO raw materials' }); setActiveModal('visit'); } },
                    { label: 'Propose Alliance/Dealership', icon: Award, color: 'text-amber-400', onClick: () => { setModalFormData({ terms: '30-Day Corporate Credit Line with credit insurance' }); setActiveModal('proposal'); } },
                    { label: 'Report spam or breach', icon: ShieldAlert, color: 'text-rose-500', onClick: () => { setModalFormData({ reason: 'Irrelevant bids spamming channels' }); setActiveModal('block'); } }
                  ].map((act, i) => {
                    const ActIcon = act.icon;
                    return (
                      <button
                        key={i}
                        onClick={act.onClick}
                        className="w-full bg-slate-950 hover:bg-slate-900/80 text-slate-300 font-bold py-2.5 px-3 rounded-xl text-left text-xs border border-slate-850 flex items-center justify-between group transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <ActIcon className={`w-3.5 h-3.5 ${act.color}`} />
                          {act.label}
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Audit Log stream */}
              <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-3xl space-y-4 text-[11px]">
                <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                  <h4 className="font-extrabold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Network Ledger Timeline
                  </h4>
                </div>
                <div className="space-y-3.5 max-h-[290px] overflow-y-auto pr-1">
                  {timeline.slice(0, 5).map(event => (
                    <div key={event.id} className="space-y-1 relative pl-3 border-l border-slate-800">
                      <span className="absolute -left-[4.5px] top-1 w-2 h-2 bg-emerald-500 rounded-full border border-slate-950" />
                      <div className="flex justify-between text-[9px] font-mono text-slate-500 leading-none">
                        <span className="text-emerald-400 uppercase font-black">{event.action}</span>
                        <span>{event.timestamp.split(' ')[1]}</span>
                      </div>
                      <p className="text-slate-300 font-sans leading-relaxed text-[10px]">{event.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: CONNECTIONS & REQUESTS                               */}
        {/* ========================================================= */}
        {activeTab === 'connections' && (
          <div className="space-y-6 animate-fade-in text-xs">
            
            {/* Connections sub-tab bar */}
            <div className="flex items-center gap-2 border-b border-slate-850 pb-3 overflow-x-auto">
              {[
                { id: 'roster', label: `My Roster (${acceptedConnections.length})`, icon: UserCheck },
                { id: 'requests', label: `Pending Requests (${pendingIncomingRequests.length + pendingOutgoingRequests.length})`, icon: Bell },
                { id: 'following', label: `Followers & Following`, icon: Users },
                { id: 'activity', label: `Alliances Opportunity Feed`, icon: Sparkles }
              ].map(sub => {
                const SubIcon = sub.icon;
                const isSel = connectionsSubTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setConnectionsSubTab(sub.id as any)}
                    className={`px-3.5 py-1.5 rounded-lg border font-mono text-[10px] font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                      isSel ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400' : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-white'
                    }`}
                  >
                    <SubIcon className="w-3.5 h-3.5" />
                    {sub.label}
                  </button>
                );
              })}
            </div>

            {/* Sub-tab viewport */}
            {connectionsSubTab === 'roster' && (
              <div className="space-y-5">
                <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl flex items-center gap-3">
                  <Search className="w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search connection directory by brand name or industry niche..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none w-full text-slate-200 placeholder:text-slate-600 font-mono text-xs"
                  />
                </div>

                {acceptedConnections.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 italic">No connections in your verified network roster yet. Send handshake requests from suggestions above.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {acceptedConnections.map(c => renderConnectionCard(c.businessId, 'connected', undefined, c.id))}
                  </div>
                )}
              </div>
            )}

            {connectionsSubTab === 'requests' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-extrabold uppercase font-mono tracking-wider text-amber-400 flex items-center gap-2">
                    <Download className="w-4 h-4" /> Incoming Handshakes ({pendingIncomingRequests.length})
                  </h4>
                  {pendingIncomingRequests.length === 0 ? (
                    <p className="text-slate-500 italic p-4 bg-slate-900/20 border border-slate-850 rounded-2xl text-center">No incoming handshake invitations awaiting compliance signature.</p>
                  ) : (
                    <div className="space-y-4">
                      {pendingIncomingRequests.map(r => renderConnectionCard(r.businessId, 'pending_in', r.purpose, r.id))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="font-extrabold uppercase font-mono tracking-wider text-indigo-400 flex items-center gap-2">
                    <Send className="w-4 h-4" /> Outgoing Requests ({pendingOutgoingRequests.length})
                  </h4>
                  {pendingOutgoingRequests.length === 0 ? (
                    <p className="text-slate-500 italic p-4 bg-slate-900/20 border border-slate-850 rounded-2xl text-center">No outgoing pending handshakes.</p>
                  ) : (
                    <div className="space-y-4">
                      {pendingOutgoingRequests.map(r => renderConnectionCard(r.businessId, 'pending_out', r.purpose, r.id))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {connectionsSubTab === 'following' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-6 space-y-4">
                  <h4 className="font-extrabold uppercase font-mono text-white">Following Companies ({localFollowing.length})</h4>
                  {localFollowing.length === 0 ? (
                    <p className="text-slate-500 italic py-2">Not following any brand feeds currently.</p>
                  ) : (
                    <div className="space-y-3">
                      {localFollowing.map(id => {
                        const b = getCompanyDetails(id);
                        return (
                          <div key={id} className="bg-slate-900 border border-slate-850 rounded-xl p-3 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg ${b.logoBg} flex items-center justify-center text-white text-xs font-black`}>
                                {b.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <strong className="text-white hover:underline cursor-pointer font-bold block" onClick={() => onViewBusinessProfile(id)}>{b.name}</strong>
                                <span className="text-[10px] font-mono text-slate-500 block">{b.category} • {b.location}</span>
                              </div>
                            </div>
                            <button onClick={() => triggerFollow(id, b.name)} className="px-2 py-1 bg-slate-950 hover:bg-slate-800 text-slate-400 rounded border border-slate-850 font-mono text-[9px]">
                              Unfollow
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-6 space-y-4">
                  <h4 className="font-extrabold uppercase font-mono text-white">Followers ({followers.length})</h4>
                  {followers.length === 0 ? (
                    <p className="text-slate-500 italic py-2">No external entities following your brand feed yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {followers.map(id => {
                        const b = getCompanyDetails(id);
                        return (
                          <div key={id} className="bg-slate-900 border border-slate-850 rounded-xl p-3 flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg ${b.logoBg} flex items-center justify-center text-white text-xs font-black`}>
                              {b.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <strong className="text-white hover:underline cursor-pointer font-bold block" onClick={() => onViewBusinessProfile(id)}>{b.name}</strong>
                              <span className="text-[10px] font-mono text-slate-500 block">{b.category} • {b.location}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {connectionsSubTab === 'activity' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Active Opportunities matching feed */}
                <div className="bg-slate-900/40 p-5 border border-slate-850 rounded-3xl space-y-4">
                  <h4 className="text-xs font-extrabold uppercase font-mono text-white flex items-center gap-2">
                    <Compass className="w-4 h-4 text-emerald-400" /> Latest Opportunity Listings
                  </h4>
                  <div className="space-y-3">
                    {[
                      { title: 'BKC Smart Commercial Highrise Concrete Tender', budget: '₹12 Crores', author: 'Apex Developers Ltd' },
                      { title: 'Subcontractor required for Bangalore High Capacity Piling', budget: '₹4.5 Crores', author: 'BuildCorp Construction' }
                    ].map((opp, i) => (
                      <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-850/60 text-[11px] space-y-1">
                        <h5 className="font-bold text-white text-xs">{opp.title}</h5>
                        <div className="flex justify-between font-mono text-[9px] text-slate-500">
                          <span>AUTHOR: <strong className="text-slate-300">{opp.author}</strong></span>
                          <span>BUDGET: <strong className="text-amber-500">{opp.budget}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulated connection feed posts */}
                <div className="bg-slate-900/40 p-5 border border-slate-850 rounded-3xl space-y-4">
                  <h4 className="text-xs font-extrabold uppercase font-mono text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" /> Latest Feed Updates
                  </h4>
                  <div className="space-y-3">
                    {[
                      { text: 'Excavation complete for Skyline Worli Tower Phase 2 block structure! Looking for bulk AAC cement blocks bids.', author: 'Apex Developers' },
                      { text: 'Metrorail high-stress compression logs cleared ISO audit. Commencing main RCC frame works.', author: 'BuildCorp Construction' }
                    ].map((feed, i) => (
                      <div key={i} className="bg-slate-950 p-3.5 rounded-xl border border-slate-850/60 space-y-1.5">
                        <div className="flex items-center gap-2 text-[10px] font-mono">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <strong className="text-white">{feed.author}</strong>
                        </div>
                        <p className="text-slate-300 italic">"{feed.text}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: ENQUIRIES & RFQS                                     */}
        {/* ========================================================= */}
        {activeTab === 'enquiries' && (
          <div className="space-y-6 animate-fade-in text-xs">
            <div className="bg-slate-900/40 p-5 border border-slate-850 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <h4 className="font-extrabold uppercase text-white font-mono flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" /> Materials RFQ Boards & Tenders
                </h4>
                <button
                  onClick={() => { setModalFormData({ category: 'Materials Supply', closeDate: '2026-08-15' }); setActiveModal('rfq'); }}
                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg font-mono text-[10px]"
                >
                  + Post RFQ
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {rfqs.map(rfq => (
                  <div key={rfq.id} className="bg-slate-950 p-4.5 rounded-2xl border border-slate-850 flex flex-col justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
                        <span className="text-emerald-400 font-bold bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">{rfq.category}</span>
                        <span>Closes: {rfq.closeDate}</span>
                      </div>
                      <h5 className="font-extrabold text-white text-xs">{rfq.title}</h5>
                      <p className="text-slate-400 leading-relaxed font-sans">{rfq.description}</p>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-850/60 grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div>
                        <span className="text-slate-500 block uppercase">Required Volume:</span>
                        <span className="text-slate-200 font-bold">{rfq.quantity}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase">Est Budget:</span>
                        <span className="text-amber-500 font-bold">{rfq.estimatedValue}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 pt-2 border-t border-slate-900">
                      <span>Dispatch: {rfq.publishedBy}</span>
                      <span className="text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded-md font-bold">{rfq.bidsCount} Corporate bids</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Message Log */}
            <div className="bg-slate-900/40 p-5 border border-slate-850 rounded-3xl space-y-4">
              <h4 className="font-extrabold uppercase text-white font-mono flex items-center gap-2 border-b border-slate-850 pb-3">
                <Mail className="w-4 h-4 text-emerald-400" /> Direct Enquiries Log
              </h4>
              {enquiries.map(enq => (
                <div key={enq.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <div>
                      <strong className="text-white text-xs">{enq.subject}</strong>
                      <span className="text-[10px] text-slate-400 block font-sans">Recipient: {enq.businessName}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{enq.timestamp}</span>
                  </div>
                  <p className="text-slate-300 italic font-sans leading-relaxed">"{enq.message}"</p>
                  {enq.reply && (
                    <div className="p-3 bg-emerald-500/[0.02] border border-emerald-500/15 rounded-xl space-y-1 text-[11px]">
                      <strong className="text-emerald-400 font-mono text-[9px] uppercase font-black">✔ Secured Callback Reply:</strong>
                      <p className="text-slate-300 font-sans italic">{enq.reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: PARTNERSHIPS & ALLIANCES                             */}
        {/* ========================================================= */}
        {activeTab === 'partnerships' && (
          <div className="space-y-6 animate-fade-in text-xs">
            <div className="bg-slate-900/40 p-5 border border-slate-850 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <h4 className="font-extrabold uppercase text-white font-mono flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" /> Joint Ventures & Partnerships Desk
                </h4>
                <button
                  onClick={() => { setModalFormData({ type: 'partnership' }); setActiveModal('proposal'); }}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg font-mono text-[10px]"
                >
                  + Propose Alliance
                </button>
              </div>

              {/* Sub-filtering categorization pills */}
              <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono font-bold">
                {[
                  { id: 'all', label: 'All Proposals' },
                  { id: 'jv', label: 'Joint Ventures' },
                  { id: 'partnership', label: 'Corporate Alliances' },
                  { id: 'dealer', label: 'Dealer Channels' },
                  { id: 'distributor', label: 'Distributors' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPartnershipsSubFilter(p.id as any)}
                    className={`px-3 py-1.5 rounded-lg border ${partnershipsSubFilter === p.id ? 'bg-amber-500/10 border-amber-500/25 text-amber-400' : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white'}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {localPartnerships
                  .filter(p => partnershipsSubFilter === 'all' || p.type === partnershipsSubFilter || (partnershipsSubFilter === 'jv' && p.scope.toLowerCase().includes('joint venture')))
                  .map(prop => (
                    <div key={prop.id} className="bg-slate-950 p-5 border border-slate-850 rounded-2xl flex flex-col justify-between gap-4">
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-mono font-black text-amber-500 uppercase tracking-widest block">{prop.type} proposal</span>
                            <h5 className="font-extrabold text-white text-xs mt-1">With: {prop.businessName}</h5>
                          </div>
                          <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border ${
                            prop.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            prop.status === 'declined' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                          }`}>
                            {prop.status}
                          </span>
                        </div>

                        <div className="space-y-2 text-[11px] leading-relaxed">
                          <p className="text-slate-400"><strong className="text-slate-500 uppercase font-mono text-[9px] block">Association scope:</strong> "{prop.scope}"</p>
                          <p className="text-slate-400"><strong className="text-slate-500 uppercase font-mono text-[9px] block">Contract Terms:</strong> {prop.terms}</p>
                        </div>
                      </div>

                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-850/60 flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-500 block uppercase">Valuation:</span>
                        <strong className="text-amber-500">{prop.estimatedValue}</strong>
                      </div>

                      {prop.status === 'pending' && (
                        <div className="flex justify-end gap-1.5 font-mono text-[10px]">
                          <button onClick={() => handleDeclinePartnership(prop.id)} className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-850 text-red-400 rounded-lg">Decline</button>
                          <button onClick={() => handleAcceptPartnership(prop.id)} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg">Accept Proposal</button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: MEETINGS & VISITS                                    */}
        {/* ========================================================= */}
        {activeTab === 'meetings' && (
          <div className="space-y-6 animate-fade-in text-xs">
            <div className="bg-slate-900/40 p-5 border border-slate-850 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <h4 className="font-extrabold uppercase text-white font-mono flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" /> B2B Commercial Consultations & Site Audits
                </h4>
                <button
                  onClick={() => { setModalFormData({ type: 'Virtual Video Call' }); setActiveModal('meeting'); }}
                  className="px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-lg font-mono text-[10px]"
                >
                  + Schedule Agenda
                </button>
              </div>

              {/* Scheduler sub-filters */}
              <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono font-bold">
                {[
                  { id: 'all', label: 'All Agendas' },
                  { id: 'upcoming', label: 'Confirmed Upcoming' },
                  { id: 'pending', label: 'Pending Invitations' },
                  { id: 'cancelled', label: 'Cancelled' }
                ].map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setMeetingsSubFilter(sub.id as any)}
                    className={`px-3 py-1.5 rounded-lg border ${meetingsSubFilter === sub.id ? 'bg-cyan-500/10 border-cyan-500/25 text-cyan-400' : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white'}`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {localMeetings
                  .filter(m => {
                    if (meetingsSubFilter === 'all') return true;
                    if (meetingsSubFilter === 'upcoming') return m.status === 'scheduled';
                    if (meetingsSubFilter === 'pending') return m.status === 'completed'; // completed acts as simulated pending here
                    return m.status === meetingsSubFilter;
                  })
                  .map(meet => (
                    <div key={meet.id} className="bg-slate-950 p-4.5 rounded-2xl border border-slate-850 flex flex-col justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start text-[9px] font-mono">
                          <span className="text-cyan-400 font-bold uppercase">{meet.type}</span>
                          <span className={`px-1.5 py-0.5 rounded border uppercase font-bold ${meet.status === 'scheduled' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>{meet.status}</span>
                        </div>
                        <h5 className="font-extrabold text-white text-xs">{meet.title}</h5>
                        <p className="text-slate-400 font-sans">With: {meet.businessName}</p>
                      </div>

                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-850/60 flex gap-4 text-[10px] font-mono">
                        <div className="flex-1">
                          <span className="text-slate-500 block">Date:</span>
                          <span className="text-slate-200 font-bold">{meet.date}</span>
                        </div>
                        <div className="flex-1">
                          <span className="text-slate-500 block">Time:</span>
                          <span className="text-slate-200 font-bold">{meet.time}</span>
                        </div>
                      </div>

                      {meet.status === 'scheduled' ? (
                        <button onClick={() => handleCancelMeeting(meet.id)} className="w-full bg-slate-900 hover:bg-red-500/10 hover:text-red-400 py-1.5 border border-slate-850 rounded-lg text-[10px] font-mono transition-all">Cancel Booking</button>
                      ) : meet.status === 'cancelled' ? (
                        <button onClick={() => handleAcceptMeeting(meet.id)} className="w-full bg-slate-900 hover:bg-emerald-500 hover:text-slate-950 py-1.5 border border-slate-850 rounded-lg text-[10px] font-mono transition-all">Reschedule Agenda</button>
                      ) : null}
                    </div>
                  ))}
              </div>
            </div>

            {/* Site Audits Yard tour list */}
            <div className="bg-slate-900/40 p-5 border border-slate-850 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <h4 className="font-extrabold uppercase text-white font-mono flex items-center gap-2">
                  <Map className="w-4 h-4 text-emerald-400" /> Physical Manufacturing yard & Liaison Site Audits
                </h4>
                <button
                  onClick={() => { setModalFormData({ purpose: 'Verify compression testing standards' }); setActiveModal('visit'); }}
                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg font-mono text-[10px]"
                >
                  + Request Yard Audit
                </button>
              </div>

              <div className="space-y-4">
                {companyVisits.map(visit => (
                  <div key={visit.id} className="bg-slate-950 p-4.5 rounded-2xl border border-slate-850 space-y-2.5">
                    <div className="flex justify-between items-start border-b border-slate-900 pb-2">
                      <div>
                        <strong className="text-white text-xs block">Site Audit: {visit.facilityName}</strong>
                        <span className="text-[10px] text-slate-400 block">Target: {visit.businessName}</span>
                      </div>
                      <span className="text-[9px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">{visit.status}</span>
                    </div>
                    <p className="text-slate-300 italic">"Purpose: {visit.purpose}"</p>
                    <div className="bg-slate-900 p-2 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-[9px] font-mono border border-slate-850/60">
                      <div><span className="text-slate-500 block">Date:</span><span className="text-slate-200 font-bold">{visit.date}</span></div>
                      <div><span className="text-slate-500 block">Time:</span><span className="text-slate-200 font-bold">{visit.time}</span></div>
                      <div><span className="text-slate-500 block">Liaison Deed:</span><span className="text-emerald-400 font-bold">Verified</span></div>
                      <div><span className="text-slate-500 block">Ref Block:</span><span className="text-slate-400">{visit.id}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: EXTERNAL INVITATIONS                                 */}
        {/* ========================================================= */}
        {activeTab === 'invitations' && (
          <div className="space-y-6 animate-fade-in text-xs">
            <div className="bg-slate-900/40 p-5 border border-slate-850 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <h4 className="font-extrabold uppercase text-white font-mono flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400 animate-spin duration-10000" /> B2B Partner Invitations Panel
                </h4>
                <button
                  onClick={() => { setModalFormData({ role: 'Vendor' }); setActiveModal('invite'); }}
                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg font-mono text-[10px]"
                >
                  + Invite Partner
                </button>
              </div>

              <div className="space-y-3.5">
                {invitations.map(inv => (
                  <div key={inv.id} className="bg-slate-950 p-4.5 rounded-2xl border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <strong className="text-white text-xs block">{inv.email}</strong>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                        <span>Target Segment: <strong className="text-slate-400">{inv.role}</strong></span>
                        <span>•</span>
                        <span>Website: <a href={`https://${inv.website}`} className="text-emerald-400 hover:underline">{inv.website}</a></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-[9px] font-mono font-black uppercase ${inv.status === 'activated' ? 'text-emerald-400' : 'text-amber-500'}`}>{inv.status === 'activated' ? '✔ active' : '✉ delivered'}</span>
                      {inv.status === 'sent' && (
                        <button
                          onClick={() => {
                            onLogTimeline('PARTNER_INVITATION_ACTIVATED', 'invitations', `Simulated signup pipeline sequence for ${inv.email} on RealtyConnect database.`, 'SUCCESS');
                            showToast(`External stakeholder accepted terms & loaded custom dashboard profile.`, 'success');
                          }}
                          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[10px] font-mono font-black px-2.5 py-1 rounded-lg"
                        >
                          Simulate Acceptance
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: PREFERENCES & FAVORITES                              */}
        {/* ========================================================= */}
        {activeTab === 'preferences' && (
          <div className="space-y-6 animate-fade-in text-xs">
            <div className="bg-slate-900/40 p-5 border border-slate-850 rounded-3xl space-y-4">
              <h4 className="font-extrabold uppercase text-white font-mono flex items-center gap-2 border-b border-slate-850 pb-3">
                <Bookmark className="w-4 h-4 text-emerald-400" /> Bookmarked & Saved Organizations Directory
              </h4>

              {localSaved.length === 0 && localFavorites.length === 0 ? (
                <p className="text-slate-500 italic p-4 text-center">No companies bookmarked as favorites or saved. Utilize cards actions to bookmark.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allBusinesses.filter(b => localSaved.includes(b.id) || localFavorites.includes(b.id)).map(b => (
                    <div key={b.id} className="bg-slate-950 p-4 border border-slate-850 rounded-2xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${b.logoBg} flex items-center justify-center text-white text-xs font-black`}>
                          {b.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <strong className="text-white hover:underline cursor-pointer block text-xs" onClick={() => onViewBusinessProfile(b.id)}>{b.name}</strong>
                          <span className="text-[10px] text-slate-500 font-mono">{b.category} • {b.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => triggerFavorite(b.id, b.name)} className={`p-2 rounded-lg border ${localFavorites.includes(b.id) ? 'bg-rose-500/15 border-rose-500/20 text-rose-500' : 'bg-slate-900 border-slate-850 text-slate-500'}`}>
                          <Heart className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button onClick={() => triggerSave(b.id, b.name)} className="px-2 py-1.5 bg-slate-900 border border-slate-850 text-slate-400 font-mono text-[9px] rounded-lg">
                          Remove Saved
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Block / Spam reporting list */}
            <div className="bg-slate-900/40 p-5 border border-slate-850 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <h4 className="font-extrabold uppercase text-white font-mono flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" /> B2B Block Guardrails & Spam Reporting
                </h4>
                <button
                  onClick={() => { setModalFormData({ reason: 'Irrelevant bids spam' }); setActiveModal('block'); }}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg font-mono text-[10px]"
                >
                  Block or Report Entity
                </button>
              </div>

              {blockedReported.length === 0 ? (
                <p className="text-slate-500 italic py-2">No companies currently blocked or reported. Network parameters operating cleanly.</p>
              ) : (
                <div className="space-y-3">
                  {blockedReported.map(item => (
                    <div key={item.id} className="bg-slate-950 p-4 border border-slate-850 rounded-2xl flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-white text-xs">{item.businessName}</strong>
                          <span className={`text-[8px] font-mono font-black uppercase px-1.5 py-0.5 rounded border ${item.action === 'blocked' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{item.action}</span>
                        </div>
                        <p className="text-slate-400">Stated reason: "{item.reason}"</p>
                      </div>
                      {item.action === 'blocked' ? (
                        <button onClick={() => onUnblockCompany(item.businessId)} className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-slate-300 text-[10px] font-mono">Unblock</button>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic font-mono">Report Filed</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 5. CONSOLIDATED RICH POPUP MODAL ENGINE                   */}
      {/* ========================================================= */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-left space-y-4 shadow-2xl relative">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer text-lg">✕</button>
            
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <span className="p-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Compass className="w-4 h-4 animate-spin" />
              </span>
              <h3 className="font-black text-sm text-white uppercase tracking-wider font-mono">
                {activeModal === 'rfq' ? 'Publish Corporate RFQ Tender' :
                 activeModal === 'invite' ? 'Invite External Partner' :
                 activeModal === 'meeting' ? 'Schedule B2B Consultation' :
                 activeModal === 'visit' ? 'Request Site Yard Audit' :
                 activeModal === 'proposal' ? 'Alliance Partnership Proposal' :
                 activeModal === 'block' ? 'Execute Guardrail Action' : 'Direct Message Liaison'}
              </h3>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4 text-xs font-sans">
              
              {/* Select target company dropdown when target id is empty and modal needs it */}
              {['meeting', 'visit', 'proposal', 'block'].includes(activeModal) && !modalTargetCompanyId && (
                <div>
                  <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">Target Corporate Entity *</label>
                  <select
                    required
                    value={modalFormData.businessId || ''}
                    onChange={(e) => setModalFormData({ ...modalFormData, businessId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none"
                  >
                    <option value="" disabled>-- Select Corporate Entity --</option>
                    {allBusinesses.map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.category})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Form elements for Publish RFQ */}
              {activeModal === 'rfq' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">RFQ Title *</label>
                      <input type="text" required placeholder="e.g., Supply of 350 MT TMT Rebars" value={modalFormData.title || ''} onChange={(e) => setModalFormData({ ...modalFormData, title: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Category Segment</label>
                      <select value={modalFormData.category || ''} onChange={(e) => setModalFormData({ ...modalFormData, category: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200">
                        <option value="Materials Supply">Materials Supply</option>
                        <option value="Machinery Leasing">Machinery Leasing</option>
                        <option value="Liaison Consultation">Liaison Consultation</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Volume Quantity Required *</label>
                      <input type="text" required placeholder="e.g., 350 Metric Tons" value={modalFormData.quantity || ''} onChange={(e) => setModalFormData({ ...modalFormData, quantity: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Estimated Budget Val *</label>
                      <input type="text" required placeholder="e.g., ₹1.4 Crores" value={modalFormData.estimatedValue || ''} onChange={(e) => setModalFormData({ ...modalFormData, estimatedValue: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Detailed Technical Requirements</label>
                    <textarea rows={3} placeholder="Provide ISO grades, certification requirements, delivery terms..." value={modalFormData.description || ''} onChange={(e) => setModalFormData({ ...modalFormData, description: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200" />
                  </div>
                </>
              )}

              {/* Form elements for External Invite */}
              {activeModal === 'invite' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Corporate Email Address *</label>
                      <input type="email" required placeholder="procurement@partner.com" value={modalFormData.email || ''} onChange={(e) => setModalFormData({ ...modalFormData, email: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Corporate Website *</label>
                      <input type="text" required placeholder="www.partner.com" value={modalFormData.website || ''} onChange={(e) => setModalFormData({ ...modalFormData, website: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Primary Role Type</label>
                    <select value={modalFormData.role || ''} onChange={(e) => setModalFormData({ ...modalFormData, role: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200">
                      <option value="Vendor">Vendor</option>
                      <option value="Contractor">Contractor</option>
                      <option value="Consultant">Consultant</option>
                      <option value="Developer">Developer</option>
                    </select>
                  </div>
                </>
              )}

              {/* Form elements for Schedule Meeting */}
              {activeModal === 'meeting' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Meeting Agenda Title *</label>
                      <input type="text" required placeholder="e.g., Procurement Contract Terms Review" value={modalFormData.title || ''} onChange={(e) => setModalFormData({ ...modalFormData, title: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Consultation Channel</label>
                      <select value={modalFormData.type || ''} onChange={(e) => setModalFormData({ ...modalFormData, type: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200">
                        <option value="Virtual Video Call">Virtual Video Call</option>
                        <option value="In-Person Corporate Office">In-Person Corporate Office</option>
                        <option value="On-Site Construction Review">On-Site Construction Review</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Consultation Date *</label>
                      <input type="date" required value={modalFormData.date || ''} onChange={(e) => setModalFormData({ ...modalFormData, date: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Time Slot *</label>
                      <input type="text" required placeholder="e.g., 11:00 AM" value={modalFormData.time || ''} onChange={(e) => setModalFormData({ ...modalFormData, time: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono" />
                    </div>
                  </div>
                </>
              )}

              {/* Form elements for Request Visit */}
              {activeModal === 'visit' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Target Manufacturing Facility Name *</label>
                      <input type="text" required placeholder="e.g., Elite Cement batching yard alpha" value={modalFormData.facilityName || ''} onChange={(e) => setModalFormData({ ...modalFormData, facilityName: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Preferred Arrival Time *</label>
                      <input type="text" required placeholder="e.g., 02:30 PM" value={modalFormData.time || ''} onChange={(e) => setModalFormData({ ...modalFormData, time: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 tracking-widest uppercase mb-1">Audit Date *</label>
                      <input type="date" required value={modalFormData.date || ''} onChange={(e) => setModalFormData({ ...modalFormData, date: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 tracking-widest uppercase mb-1">Purpose of Visit *</label>
                      <input type="text" required placeholder="e.g., Audit materials compression limits" value={modalFormData.purpose || ''} onChange={(e) => setModalFormData({ ...modalFormData, purpose: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200" />
                    </div>
                  </div>
                </>
              )}

              {/* Form elements for Propose Partnership Alliance */}
              {activeModal === 'proposal' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Alliance Partnership Type</label>
                      <select value={modalFormData.type || ''} onChange={(e) => setModalFormData({ ...modalFormData, type: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200">
                        <option value="partnership">Joint Venture Consortium</option>
                        <option value="dealer">Authorized Dealership Channel</option>
                        <option value="distributor">Regional Distribution franchise</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Contract Valuation *</label>
                      <input type="text" required placeholder="e.g., ₹50,00,000 / Annually" value={modalFormData.estimatedValue || ''} onChange={(e) => setModalFormData({ ...modalFormData, estimatedValue: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 tracking-widest uppercase mb-1">Commercial Credit Terms *</label>
                      <input type="text" required placeholder="e.g., 30-Day Corporate Credit Line with credit insurance" value={modalFormData.terms || ''} onChange={(e) => setModalFormData({ ...modalFormData, terms: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 tracking-widest uppercase mb-1">Scope of Operations *</label>
                      <input type="text" required placeholder="e.g., Primary logistics and warehousing dry mortar supply" value={modalFormData.scope || ''} onChange={(e) => setModalFormData({ ...modalFormData, scope: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200" />
                    </div>
                  </div>
                </>
              )}

              {/* Form elements for Block/Report */}
              {activeModal === 'block' && (
                <>
                  <div>
                    <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Primary Breach/Spam Reason *</label>
                    <input type="text" required placeholder="e.g., Frequent irrelevant pricing bids spams" value={modalFormData.reason || ''} onChange={(e) => setModalFormData({ ...modalFormData, reason: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200" />
                  </div>
                </>
              )}

              {/* Form elements for Direct Message Inquiry */}
              {activeModal === 'message' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Subject of Inquiry *</label>
                      <input type="text" required placeholder="e.g., Bulk Steel Procurement Liaison Query" value={modalFormData.subject || ''} onChange={(e) => setModalFormData({ ...modalFormData, subject: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Inquiry Category</label>
                      <select value={modalFormData.category || ''} onChange={(e) => setModalFormData({ ...modalFormData, category: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200">
                        <option value="Material Quotation">Material Quotation</option>
                        <option value="Liaison Clearance">Liaison Clearance</option>
                        <option value="Joint Venture Board">Joint Venture Board</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Message Body *</label>
                    <textarea required rows={4} placeholder="Inquire about custom credit lines, volume pricing grids, delivery routes..." value={modalFormData.message || ''} onChange={(e) => setModalFormData({ ...modalFormData, message: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200" />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-850 text-slate-400 border border-slate-800 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl cursor-pointer"
                >
                  File Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
