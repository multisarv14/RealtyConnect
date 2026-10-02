/**
 * RealtyConnect™ Sprint 14 - Business Messaging & Collaboration Engine
 * High-fidelity enterprise collaboration platform for the Indian B2B real estate sector.
 */

import { currentUserName } from '../lib/identity';
import { appStore } from '../lib/appStore';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Mail, Phone, Globe, ShieldCheck, Pin, Archive, Trash2, Edit2, Copy, 
  CornerUpLeft, Star, Clock, Send, MessageSquare, Paperclip, FileText, CheckCheck, 
  User, Check, ChevronRight, X, AlertCircle, Sparkles, Filter, Briefcase, ShoppingBag, 
  Folder, ArrowRight, Download, Eye, ExternalLink, HelpCircle, Calendar
} from 'lucide-react';

export interface Message {
  id: string;
  sender: 'self' | 'them' | 'system';
  senderName: string;
  senderCompany: string;
  text: string;
  timestamp: string;
  type: 'text' | 'note' | 'system';
  status?: 'sent' | 'delivered' | 'read';
  attachment?: {
    name: string;
    type: 'pdf' | 'doc' | 'excel' | 'image' | 'drawing' | 'boq' | 'contract' | 'presentation';
    size: string;
  };
  replyToId?: string;
}

export interface Conversation {
  id: string;
  companyName: string;
  companyId: string;
  logoBg: string;
  conversationType: 'Direct Business' | 'Lead Discussion' | 'Marketplace Enquiry' | 'RFQ Discussion' | 'Opportunity Discussion' | 'Partnership Discussion' | 'Support';
  lastMessageText: string;
  lastMessageTime: string;
  unreadCount: number;
  priority: 'Urgent' | 'High' | 'Normal';
  pinned: boolean;
  archived: boolean;
  assignedExecutive?: string;
  businessCategory?: string;
  relatedEntity?: {
    type: 'Lead' | 'Marketplace' | 'RFQ' | 'Opportunity';
    id: string;
    title: string;
  };
  messages: Message[];
}

const DEFAULT_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    companyName: 'Apex Developers Ltd',
    companyId: 'ent-1',
    logoBg: 'bg-indigo-600',
    conversationType: 'RFQ Discussion',
    businessCategory: 'Developers',
    lastMessageText: 'We can deliver within 15 working days post LC confirmation.',
    lastMessageTime: '2026-07-18 04:32 PM',
    unreadCount: 1,
    priority: 'High',
    pinned: true,
    archived: false,
    assignedExecutive: 'Vikram Malhotra',
    relatedEntity: {
      type: 'RFQ',
      id: 'RFQ-2026-0391',
      title: 'Bulk Cement OPC 53 Grade - 5000 MT'
    },
    messages: [
      {
        id: 'msg-1-1',
        sender: 'them',
        senderName: 'Sanjay Rawat',
        senderCompany: 'Apex Developers Ltd',
        text: 'Hello, we noticed your quotation response for our cement tender. Please confirm your delivery capabilities.',
        timestamp: '2026-07-18 02:15 PM',
        type: 'text',
        status: 'read'
      },
      {
        id: 'msg-1-2',
        sender: 'system',
        senderName: 'System',
        senderCompany: 'RealtyConnect',
        text: 'Sanjay Rawat initiated Quotation Clarification. Reference: RFQ-2026-0391.',
        timestamp: '2026-07-18 02:16 PM',
        type: 'system'
      },
      {
        id: 'msg-1-3',
        sender: 'self',
        senderName: 'Self (Admin)',
        senderCompany: 'Elite Materials & Co',
        text: 'We can supply ultra-high-grade OPC 53 cement. Our commercial proposal and RERA standard certifications are fully approved. See details below.',
        timestamp: '2026-07-18 02:45 PM',
        type: 'text',
        status: 'read'
      },
      {
        id: 'msg-1-4',
        sender: 'self',
        senderName: 'Self (Admin)',
        senderCompany: 'Elite Materials & Co',
        text: 'PROPOSAL HIGHLIGHT:\n• OPC 53 Grade Cement: ₹385 per Bag (incl. GST)\n• Direct factory dispatch with active batch quality logs\n• Payment: Letter of Credit (LC) on 45-day cycle.',
        timestamp: '2026-07-18 02:46 PM',
        type: 'note',
        status: 'read',
        attachment: {
          name: 'EMC_Cement_OPC53_Technical_Specs.pdf',
          type: 'pdf',
          size: '2.4 MB'
        }
      },
      {
        id: 'msg-1-5',
        sender: 'them',
        senderName: 'Sanjay Rawat',
        senderCompany: 'Apex Developers Ltd',
        text: 'Please confirm your lead timeline for 5000 MT delivery to Mumbai port.',
        timestamp: '2026-07-18 04:30 PM',
        type: 'text',
        status: 'read'
      },
      {
        id: 'msg-1-6',
        sender: 'self',
        senderName: 'Self (Admin)',
        senderCompany: 'Elite Materials & Co',
        text: 'We can deliver within 15 working days post LC confirmation.',
        timestamp: '2026-07-18 04:32 PM',
        type: 'text',
        status: 'delivered'
      }
    ]
  },
  {
    id: 'conv-2',
    companyName: 'L&T Construction (Infra Division)',
    companyId: 'ent-2',
    logoBg: 'bg-emerald-600',
    conversationType: 'Opportunity Discussion',
    businessCategory: 'Contractors',
    lastMessageText: 'Let\'s arrange a preliminary technical call next Tuesday.',
    lastMessageTime: '2026-07-18 01:10 PM',
    unreadCount: 2,
    priority: 'Urgent',
    pinned: true,
    archived: false,
    assignedExecutive: 'Vikram Malhotra',
    relatedEntity: {
      type: 'Opportunity',
      id: 'OPP-1049',
      title: 'Metro Tunnel Boring Subcontract'
    },
    messages: [
      {
        id: 'msg-2-1',
        sender: 'system',
        senderName: 'System',
        senderCompany: 'RealtyConnect',
        text: 'Joint Venture / Opportunity thread initialized for Metro Tunnel Boring Subcontract.',
        timestamp: '2026-07-18 10:00 AM',
        type: 'system'
      },
      {
        id: 'msg-2-2',
        sender: 'them',
        senderName: 'Rajesh Nair',
        senderCompany: 'L&T Construction',
        text: 'We received your interest in the micro-tunneling boring package. The technical specifications demand certified heavy-diameter shields.',
        timestamp: '2026-07-18 11:20 AM',
        type: 'text',
        status: 'read'
      },
      {
        id: 'msg-2-3',
        sender: 'them',
        senderName: 'Rajesh Nair',
        senderCompany: 'L&T Construction',
        text: 'TECHNICAL REQUISITES & GUIDELINES:\n• Boring Shield Diameter: 6.2m EPB\n• Soil condition: Mixed face hard rock with high water table\n• Experience: Min 3km completed tunnel references.',
        timestamp: '2026-07-18 11:22 AM',
        type: 'note',
        status: 'read',
        attachment: {
          name: 'Noida_Metro_Boring_Piles_Specs.pdf',
          type: 'pdf',
          size: '4.8 MB'
        }
      },
      {
        id: 'msg-2-4',
        sender: 'them',
        senderName: 'Rajesh Nair',
        senderCompany: 'L&T Construction',
        text: 'Let\'s arrange a preliminary technical call next Tuesday.',
        timestamp: '2026-07-18 01:10 PM',
        type: 'text'
      }
    ]
  },
  {
    id: 'conv-3',
    companyName: 'Godrej Properties Ltd',
    companyId: 'ent-3',
    logoBg: 'bg-amber-600',
    conversationType: 'Lead Discussion',
    businessCategory: 'Developers',
    lastMessageText: 'Can you share the test certificates of the Fe550D steel rebars?',
    lastMessageTime: '2026-07-17 11:15 AM',
    unreadCount: 0,
    priority: 'Normal',
    pinned: false,
    archived: false,
    assignedExecutive: 'Neha Sharma',
    relatedEntity: {
      type: 'Lead',
      id: 'RC-LE-1002',
      title: 'Quotation Bid: Structural Steel Rebars'
    },
    messages: [
      {
        id: 'msg-3-1',
        sender: 'system',
        senderName: 'System',
        senderCompany: 'RealtyConnect',
        text: 'Lead interaction capture launched automatically.',
        timestamp: '2026-07-17 09:00 AM',
        type: 'system'
      },
      {
        id: 'msg-3-2',
        sender: 'self',
        senderName: 'Self (Admin)',
        senderCompany: 'Elite Materials & Co',
        text: 'Hi Godrej Purchase Team, we have registered our quotation for the Fe550D TMT Rebars for your Pune residential township.',
        timestamp: '2026-07-17 10:15 AM',
        type: 'text',
        status: 'read'
      },
      {
        id: 'msg-3-3',
        sender: 'them',
        senderName: 'Karan Johar',
        senderCompany: 'Godrej Properties Ltd',
        text: 'Can you share the test certificates of the Fe550D steel rebars?',
        timestamp: '2026-07-17 11:15 AM',
        type: 'text',
        status: 'read'
      }
    ]
  },
  {
    id: 'conv-4',
    companyName: 'Tata Steel Infrastructure',
    companyId: 'ent-4',
    logoBg: 'bg-blue-600',
    conversationType: 'Marketplace Enquiry',
    businessCategory: 'Suppliers',
    lastMessageText: 'Our regional depot has logged your interest. Dispatch schedule is uploaded.',
    lastMessageTime: '2026-07-16 05:40 PM',
    unreadCount: 0,
    priority: 'Normal',
    pinned: false,
    archived: false,
    assignedExecutive: 'Vikram Malhotra',
    relatedEntity: {
      type: 'Marketplace',
      id: 'MKT-081',
      title: 'High-Tensile Structural I-Beams'
    },
    messages: [
      {
        id: 'msg-4-1',
        sender: 'self',
        senderName: 'Self (Admin)',
        senderCompany: 'Elite Materials & Co',
        text: 'We are looking to acquire 150 MT of High-Tensile Structural I-Beams from your listed marketplace offer.',
        timestamp: '2026-07-16 02:10 PM',
        type: 'text',
        status: 'read'
      },
      {
        id: 'msg-4-2',
        sender: 'them',
        senderName: 'Aditya Birla',
        senderCompany: 'Tata Steel',
        text: 'Thank you for your enquiry. We have available stocks at our Taloja depot.',
        timestamp: '2026-07-16 04:30 PM',
        type: 'text',
        status: 'read'
      },
      {
        id: 'msg-4-3',
        sender: 'them',
        senderName: 'Aditya Birla',
        senderCompany: 'Tata Steel',
        text: 'TALOJA DEPOT DESPATCH TERMS:\n• Ex-depot loading included\n• Weighment at Tata certified weighbridge\n• Freight to be arranged by buyer.',
        timestamp: '2026-07-16 04:35 PM',
        type: 'note',
        status: 'read',
        attachment: {
          name: 'Tata_Steel_IBeam_Dispatch_Schedule.xlsx',
          type: 'excel',
          size: '1.2 MB'
        }
      },
      {
        id: 'msg-4-4',
        sender: 'them',
        senderName: 'Aditya Birla',
        senderCompany: 'Tata Steel',
        text: 'Our regional depot has logged your interest. Dispatch schedule is uploaded.',
        timestamp: '2026-07-16 05:40 PM',
        type: 'text',
        status: 'read'
      }
    ]
  },
  {
    id: 'conv-5',
    companyName: 'Noida Metro Rail Authority',
    companyId: 'ent-5',
    logoBg: 'bg-slate-700',
    conversationType: 'RFQ Discussion',
    businessCategory: 'Government',
    lastMessageText: 'Please review Section 4.2 in the bid document and confirm compliance.',
    lastMessageTime: '2026-07-15 03:00 PM',
    unreadCount: 0,
    priority: 'High',
    pinned: false,
    archived: true,
    assignedExecutive: 'Neha Sharma',
    relatedEntity: {
      type: 'RFQ',
      id: 'RFQ-2026-0324',
      title: 'Geotechnical Soil Testing Noida Line 4'
    },
    messages: [
      {
        id: 'msg-5-1',
        sender: 'them',
        senderName: 'Principal Engineer',
        senderCompany: 'Noida Metro Rail Authority',
        text: 'Please review Section 4.2 in the bid document and confirm compliance.',
        timestamp: '2026-07-15 03:00 PM',
        type: 'text',
        status: 'read'
      }
    ]
  },
  {
    id: 'conv-6',
    companyName: 'UltraTech Cement Ltd',
    companyId: 'ent-6',
    logoBg: 'bg-rose-600',
    conversationType: 'Partnership Discussion',
    businessCategory: 'Suppliers',
    lastMessageText: 'Indemnity terms received. Legal division is auditing the draft.',
    lastMessageTime: '2026-07-14 02:12 PM',
    unreadCount: 0,
    priority: 'Normal',
    pinned: false,
    archived: false,
    assignedExecutive: 'Vikram Malhotra',
    messages: [
      {
        id: 'msg-6-1',
        sender: 'self',
        senderName: 'Self (Admin)',
        senderCompany: 'Elite Materials & Co',
        text: 'We are sending over the customized Joint Venture indemnification charter for the metro corridor works.',
        timestamp: '2026-07-14 11:30 AM',
        type: 'text',
        status: 'read'
      },
      {
        id: 'msg-6-2',
        sender: 'self',
        senderName: 'Self (Admin)',
        senderCompany: 'Elite Materials & Co',
        text: 'JV DEED CLAUSES:\n• Article 14: Shared risk pool capping\n• Article 15: Dispute escalation to Bombay High Court\n• Tenure: 36 months starting October 2026.',
        timestamp: '2026-07-14 11:32 AM',
        type: 'note',
        status: 'read',
        attachment: {
          name: 'Joint_Venture_Indemnity_Draft.pdf',
          type: 'contract',
          size: '5.1 MB'
        }
      },
      {
        id: 'msg-6-3',
        sender: 'them',
        senderName: 'Nikhil Sen',
        senderCompany: 'UltraTech Cement',
        text: 'Indemnity terms received. Legal division is auditing the draft.',
        timestamp: '2026-07-14 02:12 PM',
        type: 'text',
        status: 'read'
      }
    ]
  }
];

interface BusinessMessagingEngineProps {
  userSession: { email: string; role: string; permissions: string[] } | null;
  onLogTriggered: (action: string, entity: string, entityId: string, status: 'SUCCESS' | 'WARNING' | 'FAILURE', details: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  setActiveViewMode?: (view: any) => void;
}

export default function BusinessMessagingEngine({
  userSession,
  onLogTriggered,
  showToast,
  setActiveViewMode
}: BusinessMessagingEngineProps) {
  // Main Conversations State loaded from appStore or seeded
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_conversations');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_CONVERSATIONS;
  });

  // Selected Conversation ID
  const [selectedConvId, setSelectedConvId] = useState<string>(() => {
    return DEFAULT_CONVERSATIONS[0].id;
  });

  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'pinned' | 'priority' | 'archived'>('all');
  const [filterType, setFilterType] = useState<string>('All Types');
  const [filterCategory, setFilterCategory] = useState<string>('All Categories');
  const [filterExecutive, setFilterExecutive] = useState<string>('All Executives');

  // Input states
  const [newMessageText, setNewMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; type: any; size: string } | null>(null);
  
  // Message interaction states
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editInputText, setEditInputText] = useState('');

  // UI state
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(true);
  const [activeAttachmentCategory, setActiveAttachmentCategory] = useState<'All' | 'pdf' | 'excel' | 'drawing' | 'contract'>('All');
  
  // Enterprise meetings local state
  const [enterpriseMeetings, setEnterpriseMeetings] = useState<any[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_meetings');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    const syncMeetings = () => {
      try {
        const saved = appStore.getItem('realtyconnect_meetings');
        if (saved) {
          setEnterpriseMeetings(JSON.parse(saved));
        } else {
          setEnterpriseMeetings([]);
        }
      } catch (e) {}
    };
    syncMeetings();
    const timer = setInterval(syncMeetings, 2000);
    return () => clearInterval(timer);
  }, []);
  
  // Pre-prepared mock files database to simulate actual file picker integration
  const MOCK_ATTACHMENTS = [
    { name: 'Elite_BOQ_Steel_Consolidation_v2.xlsx', type: 'excel', size: '1.4 MB' },
    { name: 'Metro_Station_Boring_Piles_Drawing.cad', type: 'drawing', size: '22 MB' },
    { name: 'Apex_OPC53_Technical_Audit_Report.pdf', type: 'pdf', size: '3.1 MB' },
    { name: 'Corporate_Supply_Agreement_Godrej_Signed.pdf', type: 'contract', size: '4.2 MB' },
    { name: 'RealtyConnect_Networking_Introduction_Brief.pptx', type: 'presentation', size: '5.8 MB' }
  ];

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync to local storage
  const saveConversations = (updated: Conversation[]) => {
    setConversations(updated);
    try {
      appStore.setItem('realtyconnect_conversations', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving conversations', e);
    }
  };

  // Scroll to bottom helper
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConvId, conversations]);

  // Synchronize dynamic routing requests (e.g., from other dashboards)
  useEffect(() => {
    const checkActiveRouting = () => {
      try {
        const routeId = appStore.getItem('realtyconnect_active_conversation_id');
        if (routeId) {
          // Find if conversation exists
          const exists = conversations.some(c => c.id === routeId);
          if (exists) {
            setSelectedConvId(routeId);
            // Mark as read immediately
            const updated = conversations.map(c => {
              if (c.id === routeId) {
                return { ...c, unreadCount: 0 };
              }
              return c;
            });
            saveConversations(updated);
          }
          appStore.removeItem('realtyconnect_active_conversation_id');
        }
      } catch (e) {}
    };

    const interval = setInterval(checkActiveRouting, 1000);
    return () => clearInterval(interval);
  }, [conversations]);

  const activeConv = conversations.find(c => c.id === selectedConvId) || conversations[0];

  // Mark selected as read
  useEffect(() => {
    if (activeConv && activeConv.unreadCount > 0) {
      const updated = conversations.map(c => {
        if (c.id === activeConv.id) {
          return { ...c, unreadCount: 0 };
        }
        return c;
      });
      saveConversations(updated);
    }
  }, [selectedConvId]);

  // Simulated Typing indicator helper
  const triggerTypingIndicator = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 4000);
  };

  // Action: Send Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() && !selectedFile) return;

    const newMsg: Message = {
      id: `msg-user-${Date.now()}`,
      sender: 'self',
      senderName: 'Self (Admin)',
      senderCompany: 'Elite Materials & Co',
      text: newMessageText,
      timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: selectedFile && selectedFile.type === 'contract' ? 'note' : 'text',
      status: 'sent',
      ...(selectedFile ? { attachment: selectedFile } : {}),
      ...(replyingToMessage ? { replyToId: replyingToMessage.id } : {})
    };

    const updatedMessages = [...activeConv.messages, newMsg];
    const updatedConversations = conversations.map(c => {
      if (c.id === activeConv.id) {
        return {
          ...c,
          messages: updatedMessages,
          lastMessageText: selectedFile ? `📎 Attachment: ${selectedFile.name}` : newMessageText,
          lastMessageTime: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      return c;
    });

    saveConversations(updatedConversations);
    setNewMessageText('');
    setSelectedFile(null);
    setReplyingToMessage(null);

    // Trigger Notification & Log
    onLogTriggered(
      'MESSAGING_SEND_SUCCESS',
      'conversations',
      activeConv.id,
      'SUCCESS',
      `Sent B2B message to ${activeConv.companyName} on ${activeConv.conversationType} thread.`
    );

    // Simulate double-checkmark updates
    setTimeout(() => {
      setConversations(prev => {
        const updated = prev.map(c => {
          if (c.id === activeConv.id) {
            return {
              ...c,
              messages: c.messages.map(m => m.id === newMsg.id ? { ...m, status: 'delivered' as const } : m)
            };
          }
          return c;
        });
        appStore.setItem('realtyconnect_conversations', JSON.stringify(updated));
        return updated;
      });
    }, 1200);

    // Simulate "read" checkmark & automatic typing reply placeholder
    setTimeout(() => {
      setConversations(prev => {
        const updated = prev.map(c => {
          if (c.id === activeConv.id) {
            return {
              ...c,
              messages: c.messages.map(m => m.id === newMsg.id ? { ...m, status: 'read' as const } : m)
            };
          }
          return c;
        });
        appStore.setItem('realtyconnect_conversations', JSON.stringify(updated));
        return updated;
      });

      // Simulate a quick reply typing indicator from the corporate client
      triggerTypingIndicator();
    }, 2800);
  };

  // Action: Edit Message
  const handleEditMessageSubmit = () => {
    if (!editingMessage || !editInputText.trim()) return;

    const updatedConversations = conversations.map(c => {
      if (c.id === activeConv.id) {
        return {
          ...c,
          messages: c.messages.map(m => {
            if (m.id === editingMessage.id) {
              return { ...m, text: editInputText };
            }
            return m;
          })
        };
      }
      return c;
    });

    saveConversations(updatedConversations);
    showToast('Message edited successfully.', 'success');
    setEditingMessage(null);
    setEditInputText('');
  };

  // Action: Delete Message
  const handleDeleteMessage = (msgId: string) => {
    const updatedConversations = conversations.map(c => {
      if (c.id === activeConv.id) {
        return {
          ...c,
          messages: c.messages.filter(m => m.id !== msgId)
        };
      }
      return c;
    });

    saveConversations(updatedConversations);
    showToast('Message deleted successfully.', 'info');
  };

  // Action: Pin Conversation
  const togglePinConversation = (id: string) => {
    const updated = conversations.map(c => {
      if (c.id === id) {
        const nextState = !c.pinned;
        showToast(nextState ? 'Conversation pinned to top.' : 'Conversation unpinned.', 'success');
        return { ...c, pinned: nextState };
      }
      return c;
    });
    saveConversations(updated);
  };

  // Action: Archive Conversation
  const toggleArchiveConversation = (id: string) => {
    const updated = conversations.map(c => {
      if (c.id === id) {
        const nextState = !c.archived;
        showToast(nextState ? 'Conversation moved to archive.' : 'Conversation restored from archive.', 'info');
        return { ...c, archived: nextState };
      }
      return c;
    });
    saveConversations(updated);
  };

  // Action: Mark as Unread
  const markAsUnread = (id: string) => {
    const updated = conversations.map(c => {
      if (c.id === id) {
        showToast('Conversation marked as unread.', 'info');
        return { ...c, unreadCount: 1 };
      }
      return c;
    });
    saveConversations(updated);
  };

  // Copy message helper
  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Message copied to clipboard.', 'success');
  };

  // Filtering conversations logic
  const filteredConversations = conversations.filter(c => {
    // 1. Sidebar Tabs Filter
    if (activeFilter === 'unread' && c.unreadCount === 0) return false;
    if (activeFilter === 'pinned' && !c.pinned) return false;
    if (activeFilter === 'archived' && !c.archived) return false;
    if (activeFilter === 'priority' && c.priority === 'Normal') return false;
    if (activeFilter !== 'archived' && c.archived) return false; // Hide archived by default unless in archived tab

    // 2. Dropdown Filters
    if (filterType !== 'All Types' && c.conversationType !== filterType) return false;
    if (filterCategory !== 'All Categories' && c.businessCategory !== filterCategory) return false;
    if (filterExecutive !== 'All Executives' && c.assignedExecutive !== filterExecutive) return false;

    // 3. Search Term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const matchCompany = c.companyName.toLowerCase().includes(term);
      const matchType = c.conversationType.toLowerCase().includes(term);
      const matchExecutive = c.assignedExecutive?.toLowerCase().includes(term);
      const matchEntity = c.relatedEntity?.title.toLowerCase().includes(term) || c.relatedEntity?.id.toLowerCase().includes(term);
      const matchMessages = c.messages.some(m => m.text.toLowerCase().includes(term));
      return matchCompany || matchType || matchExecutive || matchEntity || matchMessages;
    }

    return true;
  });

  // Sort pinned first, then last message timestamp descending
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
  });

  // Collect all unique executives, types, and categories for dropdown filters
  const conversationTypes = ['All Types', 'Direct Business', 'Lead Discussion', 'Marketplace Enquiry', 'RFQ Discussion', 'Opportunity Discussion', 'Partnership Discussion'];
  const businessCategories = ['All Categories', 'Developers', 'Contractors', 'Suppliers', 'Government'];
  const executives = ['All Executives', currentUserName(), 'Neha Sharma', 'Unassigned'];

  // Total Unread KPI
  const totalUnreadCount = conversations.reduce((acc, c) => acc + (c.archived ? 0 : c.unreadCount), 0);
  const urgentCount = conversations.filter(c => !c.archived && c.priority === 'Urgent').length;

  return (
    <div className="space-y-6 text-slate-100 animate-fade-in text-xs max-w-full">
      
      {/* Header and KPI Statistics bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-900 text-left">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-500/10 p-1.5 rounded border border-indigo-500/20">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-slate-100 flex items-center gap-2">
                Business Messaging & Collaboration Workspace
                <span className="bg-indigo-500/15 text-indigo-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-indigo-500/20 font-bold uppercase">
                  Messaging
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">Secure corporate messaging hub for certified vendors, constructors, and developers.</p>
            </div>
          </div>
        </div>

        {/* Dynamic Workspace metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-900 text-left">
            <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">Unread Streams</span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono font-bold text-white text-base">{totalUnreadCount}</span>
              {totalUnreadCount > 0 && <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block animate-pulse" />}
            </div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-900 text-left">
            <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">Priority Discussions</span>
            <span className="font-mono font-bold text-rose-400 text-base">{urgentCount}</span>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-900 text-left">
            <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">Active Channels</span>
            <span className="font-mono font-bold text-emerald-400 text-base">
              {conversations.filter(c => !c.archived).length}
            </span>
          </div>
        </div>
      </div>

      {/* Main split work layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-220px)] min-h-[600px] text-left">
        
        {/* Left Side: Conversation List & Filtering Workspace (4 Cols) */}
        <div className="lg:col-span-4 bg-gradient-to-b from-slate-900/60 to-slate-900/20 border border-slate-850 rounded-2xl flex flex-col overflow-hidden">
          
          {/* Top Search & Filter Bar */}
          <div className="p-4 border-b border-slate-850 space-y-3 shrink-0">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-3.5 h-3.5 text-slate-500" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conversations, messages, RFQs..."
                className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 text-[11px] transition-all"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Sub-Filters Tabs Grid */}
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'All Channels' },
                { id: 'unread', label: 'Unread' },
                { id: 'pinned', label: 'Pinned' },
                { id: 'priority', label: 'Priority' },
                { id: 'archived', label: 'Archived' }
              ].map(tab => {
                const isActive = activeFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-wide font-bold whitespace-nowrap border transition-all ${
                      isActive 
                        ? 'bg-slate-100 text-slate-950 border-white' 
                        : 'bg-slate-950 text-slate-400 border-slate-900 hover:border-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Dropdown Filters Accordion style */}
            <div className="grid grid-cols-3 gap-1.5 pt-1.5">
              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-950 border border-slate-900 text-slate-300 rounded px-1.5 py-1 text-[9px] font-mono outline-none"
              >
                {conversationTypes.map(t => (
                  <option key={t} value={t}>{t === 'All Types' ? 'All Types' : t.split(' ')[0]}</option>
                ))}
              </select>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-950 border border-slate-900 text-slate-300 rounded px-1.5 py-1 text-[9px] font-mono outline-none"
              >
                {businessCategories.map(c => (
                  <option key={c} value={c}>{c === 'All Categories' ? 'All Categories' : c}</option>
                ))}
              </select>

              {/* Executive Filter */}
              <select
                value={filterExecutive}
                onChange={(e) => setFilterExecutive(e.target.value)}
                className="bg-slate-950 border border-slate-900 text-slate-300 rounded px-1.5 py-1 text-[9px] font-mono outline-none"
              >
                {executives.map(ex => (
                  <option key={ex} value={ex}>{ex === 'All Executives' ? 'All Staff' : ex.split(' ')[0]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Chat List Scroll Container */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {sortedConversations.map(conv => {
              const isSelected = conv.id === selectedConvId;
              const isUrgent = conv.priority === 'Urgent';
              const isHigh = conv.priority === 'High';
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border flex items-start gap-3 relative ${
                    isSelected 
                      ? 'bg-indigo-950/40 border-indigo-500/40 shadow-inner' 
                      : 'bg-slate-950/20 border-slate-900 hover:bg-slate-900/30'
                  }`}
                >
                  {/* Left Side Color logo prefix */}
                  <div className={`w-9 h-9 rounded-lg ${conv.logoBg} flex items-center justify-center text-white text-[11px] font-display font-black uppercase shadow`}>
                    {conv.companyName.substring(0, 2)}
                  </div>

                  {/* Central Text block */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-slate-200 truncate text-[11px] font-display">
                        {conv.companyName}
                      </h4>
                      <span className="text-[8px] font-mono text-slate-500 whitespace-nowrap shrink-0">
                        {conv.lastMessageTime.split(' ')[1]} {conv.lastMessageTime.split(' ')[2] || ''}
                      </span>
                    </div>

                    {/* Metadata indicators block */}
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[7px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                        conv.conversationType === 'RFQ Discussion' ? 'bg-cyan-500/10 text-cyan-400' :
                        conv.conversationType === 'Lead Discussion' ? 'bg-amber-500/10 text-amber-400' :
                        conv.conversationType === 'Marketplace Enquiry' ? 'bg-emerald-500/10 text-emerald-400' :
                        conv.conversationType === 'Opportunity Discussion' ? 'bg-indigo-500/10 text-indigo-400' :
                        'bg-slate-900 text-slate-400'
                      }`}>
                        {conv.conversationType}
                      </span>
                      {conv.assignedExecutive && (
                        <span className="text-[7.5px] font-mono text-slate-500">
                          👤 {conv.assignedExecutive}
                        </span>
                      )}
                    </div>

                    {/* Last message preview snippet */}
                    <p className="text-[10px] text-slate-400 truncate leading-tight">
                      {conv.lastMessageText}
                    </p>
                  </div>

                  {/* Badges & Actions Indicator row */}
                  <div className="shrink-0 flex flex-col items-end gap-1.5 justify-between self-stretch">
                    {/* Priority and Unread Badges */}
                    <div className="flex items-center gap-1">
                      {conv.pinned && <Pin className="w-2.5 h-2.5 text-slate-500 rotate-45" />}
                      {isUrgent && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
                      {(isUrgent || isHigh) && (
                        <span className={`text-[7px] font-mono font-extrabold px-1 py-0.2 rounded ${isUrgent ? 'bg-rose-500/15 text-rose-400' : 'bg-amber-500/15 text-amber-400'}`}>
                          {conv.priority}
                        </span>
                      )}
                    </div>

                    {/* Unread Pill count */}
                    {conv.unreadCount > 0 && (
                      <span className="bg-indigo-500 text-white font-mono font-bold text-[8px] px-1.5 py-0.5 rounded-full">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {sortedConversations.length === 0 && (
              <div className="bg-slate-950/40 p-8 rounded-xl border border-slate-900 text-center space-y-1.5">
                <AlertCircle className="w-5 h-5 text-slate-600 mx-auto" />
                <p className="text-slate-400 font-bold text-[10px] uppercase font-mono tracking-wider">No Conversations Found</p>
                <p className="text-[9px] text-slate-500 leading-relaxed">Adjust filters or search criteria to view corporate streams.</p>
              </div>
            )}
          </div>
        </div>

        {/* Center: Core Chat Workspace (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col overflow-hidden relative">
          
          {/* Active Conversation Header */}
          {activeConv ? (
            <>
              <div className="p-4 border-b border-slate-850 bg-slate-900/30 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${activeConv.logoBg} flex items-center justify-center text-white text-[11px] font-black uppercase`}>
                    {activeConv.companyName.substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                      {activeConv.companyName}
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" title="RealtyConnect KYC Verified B2B Partner" />
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-[9px] text-slate-400">
                      <span className="font-mono bg-slate-900 px-1.5 py-0.2 rounded text-slate-300">
                        {activeConv.conversationType}
                      </span>
                      {activeConv.assignedExecutive && (
                        <span>• Executive: <strong className="text-slate-300">{activeConv.assignedExecutive}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick actions for current stream */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => togglePinConversation(activeConv.id)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      activeConv.pinned 
                        ? 'bg-indigo-500/15 border-indigo-500/35 text-indigo-400' 
                        : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-white'
                    }`}
                    title={activeConv.pinned ? "Unpin Conversation" : "Pin Conversation"}
                  >
                    <Pin className={`w-3 h-3 ${activeConv.pinned ? 'rotate-0' : 'rotate-45'}`} />
                  </button>
                  <button
                    onClick={() => toggleArchiveConversation(activeConv.id)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      activeConv.archived 
                        ? 'bg-amber-500/15 border-amber-500/35 text-amber-400' 
                        : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-white'
                    }`}
                    title={activeConv.archived ? "Restore Channel" : "Archive Channel"}
                  >
                    <Archive className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => markAsUnread(activeConv.id)}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-850 text-slate-400 hover:text-white transition-all"
                    title="Mark as Unread"
                  >
                    <Mail className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setIsInfoPanelOpen(!isInfoPanelOpen)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      isInfoPanelOpen 
                        ? 'bg-slate-100 border-white text-slate-950' 
                        : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-white'
                    }`}
                    title="Toggle Context Intelligence Panel"
                  >
                    <Folder className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Linked Entity Banner */}
              {activeConv.relatedEntity && (
                <div className="bg-indigo-950/20 border-b border-slate-850 px-4 py-2 flex items-center justify-between text-[10px] text-slate-300 shrink-0">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-mono bg-indigo-500/10 text-indigo-400 px-1 rounded font-bold uppercase tracking-wider text-[8px]">
                      Linked {activeConv.relatedEntity.type}
                    </span>
                    <span className="text-slate-400 font-mono">[{activeConv.relatedEntity.id}]</span>
                    <span className="truncate font-semibold text-slate-200">{activeConv.relatedEntity.title}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (setActiveViewMode) {
                        const viewMap: any = {
                          RFQ: 'rfq_management',
                          Lead: 'lead_management',
                          Marketplace: 'marketplace',
                          Opportunity: 'opportunities'
                        };
                        const target = viewMap[activeConv.relatedEntity!.type];
                        if (target) {
                          // Seed entity routing in appStore
                          appStore.setItem(`realtyconnect_route_${activeConv.relatedEntity!.type.toLowerCase()}_id`, activeConv.relatedEntity!.id);
                          setActiveViewMode(target);
                          showToast(`Routing to linked ${activeConv.relatedEntity!.type} context.`, 'info');
                        }
                      }
                    }}
                    className="text-[8px] font-mono font-bold text-indigo-400 hover:text-indigo-300 uppercase shrink-0 flex items-center gap-1"
                  >
                    Inspect Context
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}

              {/* Chat Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                
                {activeConv.messages.map((msg, index) => {
                  const isSelf = msg.sender === 'self';
                  const isSystem = msg.sender === 'system';
                  
                  if (isSystem) {
                    return (
                      <div key={msg.id} className="flex justify-center my-2">
                        <div className="bg-slate-900/60 border border-slate-850 px-3.5 py-1.5 rounded-full text-[9px] font-mono text-slate-400 max-w-sm text-center">
                          ⚙️ {msg.text}
                          <span className="block text-[7px] text-slate-600 mt-0.5">{msg.timestamp}</span>
                        </div>
                      </div>
                    );
                  }

                  const matchedReply = msg.replyToId ? activeConv.messages.find(m => m.id === msg.replyToId) : null;

                  return (
                    <div 
                      key={msg.id} 
                      className={`flex gap-3 group relative max-w-[85%] ${isSelf ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                    >
                      {/* Message Bubble Frame */}
                      <div className="space-y-1">
                        
                        {/* Sender info */}
                        <div className={`flex items-center gap-1.5 text-[8px] text-slate-500 font-mono ${isSelf ? 'justify-end' : ''}`}>
                          <span>{msg.senderName}</span>
                          <span>•</span>
                          <span>{msg.senderCompany}</span>
                        </div>

                        {/* Interactive Body container */}
                        <div className={`p-3 rounded-2xl relative border ${
                          isSelf 
                            ? 'bg-slate-900 border-slate-800 text-slate-100 rounded-tr-none' 
                            : 'bg-indigo-950/20 border-indigo-950/40 text-slate-200 rounded-tl-none'
                        } ${msg.type === 'note' ? 'border-dashed border-indigo-400/50 bg-indigo-500/[0.02]' : ''}`}>
                          
                          {/* Reply Quote Block if referenced */}
                          {matchedReply && (
                            <div className="mb-2 bg-slate-950/80 p-2 rounded-lg border-l-2 border-indigo-500 text-[9px] text-slate-400 italic">
                              <span className="block text-[8px] font-mono text-indigo-400 not-italic font-bold">In reply to:</span>
                              <span className="line-clamp-2">{matchedReply.text}</span>
                            </div>
                          )}

                          {/* Text Message Content */}
                          <p className="whitespace-pre-wrap leading-relaxed text-[10.5px]">
                            {msg.text}
                          </p>

                          {/* Attachment Card Layout */}
                          {msg.attachment && (
                            <div className="mt-3 bg-slate-950/80 p-2.5 rounded-xl border border-slate-900 flex items-center justify-between gap-3 text-left">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[10px] font-bold text-slate-200 truncate">{msg.attachment.name}</p>
                                  <span className="text-[8px] font-mono text-slate-500 block">{msg.attachment.size} • {msg.attachment.type.toUpperCase()}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  showToast(`Downloading file ${msg.attachment!.name} (Placeholder)`, 'info');
                                  onLogTriggered('MESSAGING_ATTACHMENT_DOWNLOAD_TRIGGERED', 'attachments', msg.id, 'SUCCESS', `Triggered mock attachment download for ${msg.attachment!.name}`);
                                }}
                                className="p-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-all shrink-0"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Timestamp & Status indicators under the bubble */}
                        <div className={`flex items-center gap-1 text-[8px] text-slate-500 font-mono ${isSelf ? 'justify-end' : ''}`}>
                          <span>{msg.timestamp.split(' ')[1]} {msg.timestamp.split(' ')[2] || ''}</span>
                          {isSelf && (
                            <span>
                              {msg.status === 'read' ? (
                                <span className="text-indigo-400 flex items-center" title="B2B Partner read this message"><CheckCheck className="w-3.5 h-3.5" /></span>
                              ) : msg.status === 'delivered' ? (
                                <span className="text-slate-400 flex items-center" title="Delivered"><CheckCheck className="w-3.5 h-3.5" /></span>
                              ) : (
                                <span className="text-slate-500 flex items-center" title="Sent"><Check className="w-3.5 h-3.5" /></span>
                              )}
                            </span>
                          )}
                        </div>

                      </div>

                      {/* Floating Message Actions on Hover */}
                      <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all z-10 flex gap-1 ${
                        isSelf ? 'right-full mr-2 flex-row-reverse' : 'left-full ml-2'
                      }`}>
                        <button
                          onClick={() => setReplyingToMessage(msg)}
                          className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                          title="Reply"
                        >
                          <CornerUpLeft className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleCopyMessage(msg.text)}
                          className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                          title="Copy"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        {isSelf && (
                          <>
                            <button
                              onClick={() => {
                                setEditingMessage(msg);
                                setEditInputText(msg.text);
                              }}
                              className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                              title="Edit"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="p-1.5 rounded bg-slate-900 border border-slate-800 text-rose-500 hover:bg-rose-500/10 hover:border-rose-900/40"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>

                    </div>
                  );
                })}

                {/* Live simulation typing indicator */}
                {isTyping && (
                  <div className="flex gap-3 max-w-[85%] mr-auto items-center animate-pulse">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 font-mono text-[9px]">
                      💬
                    </div>
                    <div className="bg-slate-900/40 p-2.5 rounded-2xl rounded-tl-none border border-slate-850">
                      <div className="flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        <span className="text-[9px] font-mono text-slate-500 ml-1.5">Apex procurement replying...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Reply Reference Preview Card block */}
              {replyingToMessage && (
                <div className="bg-slate-900 border-t border-slate-850 px-4 py-2 flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-mono text-indigo-400 font-bold uppercase text-[8px]">Reply to</span>
                    <span className="truncate font-semibold text-slate-200">"{replyingToMessage.text}"</span>
                  </div>
                  <button onClick={() => setReplyingToMessage(null)} className="text-slate-500 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Message Typing and Attachment Entry Field */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-850 bg-slate-900/30 space-y-2 shrink-0 text-left">
                
                {/* Simulated file picker display */}
                {selectedFile && (
                  <div className="flex items-center justify-between bg-indigo-950/40 border border-indigo-500/20 rounded-xl px-3.5 py-1.5">
                    <div className="flex items-center gap-2 text-[10px]">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <span className="text-slate-300 font-bold">{selectedFile.name}</span>
                      <span className="text-slate-500 font-mono">({selectedFile.size})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-slate-500 hover:text-white p-0.5 rounded-full bg-slate-950"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Entry row */}
                <div className="flex items-center gap-2">
                  {/* File Pick trigger */}
                  <div className="relative group">
                    <button
                      type="button"
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 text-slate-400 hover:text-white transition-all hover:border-slate-700"
                      title="Attach Technical CAD Drawings, BOQs, Excel proposals"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    {/* Simulated File List selection */}
                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-2 hidden group-hover:block hover:block z-50 animate-fade-in text-[10px]">
                      <div className="p-1.5 border-b border-slate-800 font-mono font-bold text-slate-400 uppercase text-[8px]">
                        Document vault (sample files)
                      </div>
                      <div className="space-y-1 mt-1.5">
                        {MOCK_ATTACHMENTS.map((f, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              setSelectedFile({ name: f.name, type: f.type, size: f.size });
                              showToast(`Attached ${f.name} to message pipeline.`, 'success');
                            }}
                            className="p-2 rounded-lg bg-slate-950 hover:bg-indigo-950/40 border border-slate-900 hover:border-indigo-500/20 text-slate-300 cursor-pointer flex justify-between items-center transition-all"
                          >
                            <span className="truncate max-w-[150px] font-mono text-[9px]">{f.name}</span>
                            <span className="text-[7.5px] bg-slate-900 px-1 py-0.2 rounded font-mono font-bold text-slate-500 uppercase">{f.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Core Text Input */}
                  <input
                    type="text"
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    placeholder="Type corporate communication or attachment briefing..."
                    className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 text-[11px] transition-all"
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md shadow-indigo-950"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <MessageSquare className="w-8 h-8 text-slate-700 animate-pulse" />
              <p className="text-slate-400 font-bold uppercase font-mono tracking-wider text-[11px]">Select B2B Channel</p>
              <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed">Choose an active collaboration thread from the left list to begin high-fidelity negotiation.</p>
            </div>
          )}
        </div>

        {/* Right Side: Context Intelligence Panel & Communication Summary (3 Cols) */}
        <div className={`lg:col-span-3 bg-gradient-to-b from-slate-900/60 to-slate-900/20 border border-slate-850 rounded-2xl flex flex-col overflow-hidden transition-all text-left ${
          isInfoPanelOpen ? 'block' : 'hidden lg:flex opacity-30 pointer-events-none'
        }`}>
          
          {/* Header */}
          <div className="p-4 border-b border-slate-850 shrink-0 bg-slate-900/20">
            <h4 className="font-display font-bold text-slate-200 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-indigo-400" />
              Context Intelligence
            </h4>
            <p className="text-[8.5px] text-slate-500 font-mono">B2B Negotiation Records</p>
          </div>

          {activeConv ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              
              {/* Partner Overview profile snippet */}
              <div className="space-y-2.5 bg-slate-950/40 p-3.5 rounded-xl border border-slate-900 text-left">
                <h5 className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-slate-500">Corporate Registry</h5>
                
                <div className="space-y-1.5">
                  <strong className="text-slate-200 text-xs font-bold block">{activeConv.companyName}</strong>
                  <span className="text-[10px] font-mono text-indigo-400 block">{activeConv.businessCategory || 'B2B Enterprise Partner'}</span>
                  
                  <div className="pt-2 grid grid-cols-2 gap-2 text-[9px] font-mono text-slate-400 border-t border-slate-900">
                    <div>
                      <span className="text-[7.5px] text-slate-500 uppercase block">Category</span>
                      <span>{activeConv.businessCategory || 'Developers'}</span>
                    </div>
                    <div>
                      <span className="text-[7.5px] text-slate-500 uppercase block">KYC Status</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-0.5">● Active</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => {
                      if (setActiveViewMode) {
                        appStore.setItem('realtyconnect_active_profile_id', activeConv.companyId);
                        setActiveViewMode('directory');
                        showToast(`Loading company profile for ${activeConv.companyName}`, 'info');
                      }
                    }}
                    className="w-full text-center bg-slate-950 hover:bg-slate-900 border border-slate-800 text-[8.5px] font-mono font-bold py-1.5 rounded uppercase tracking-wider text-slate-300 transition-all flex items-center justify-center gap-1"
                  >
                    View Verified Profile
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Shared Assets Drawer */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-900">
                  <h5 className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-slate-500">Shared Documents</h5>
                  <span className="text-[8px] font-mono text-slate-500 font-bold">
                    {activeConv.messages.filter(m => m.attachment).length} FILES
                  </span>
                </div>

                <div className="space-y-2">
                  {activeConv.messages.filter(m => m.attachment).map((m, idx) => (
                    <div 
                      key={m.id || idx}
                      className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-900 hover:border-slate-800 flex items-center justify-between gap-2.5 group transition-all"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-slate-300 truncate font-semibold">{m.attachment?.name}</p>
                          <span className="text-[7.5px] text-slate-500 font-mono uppercase block">{m.attachment?.type} • {m.attachment?.size}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => showToast(`Previewing file ${m.attachment?.name}`, 'info')}
                        className="text-[8px] font-mono font-extrabold text-indigo-400 hover:text-white uppercase transition-colors shrink-0"
                      >
                        Preview
                      </button>
                    </div>
                  ))}

                  {activeConv.messages.filter(m => m.attachment).length === 0 && (
                    <div className="bg-slate-950/20 border border-slate-900 rounded-xl p-4 text-center">
                      <p className="text-[9.5px] text-slate-500 italic">No files exchanged yet on this thread.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Communication Summary Audit Log */}
              <div className="space-y-3">
                <h5 className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-slate-500 pb-1.5 border-b border-slate-900">
                  Communication Audit Summary
                </h5>

                <div className="space-y-2.5 text-[9.5px] font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Active Stream Since:</span>
                    <span className="text-slate-200">July 14, 2026</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Internal Owner:</span>
                    <span className="text-slate-200">RealtyConnect B2B</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Messages Exchanged:</span>
                    <span className="text-slate-200">{activeConv.messages.length} Posts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Response Gap:</span>
                    <span className="text-emerald-400">Under 2 hours</span>
                  </div>
                </div>
              </div>

              {/* B2B Sourcing Meetings Section */}
              <div className="space-y-3 bg-slate-950/40 p-3.5 rounded-xl border border-slate-900 text-left">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-900">
                  <h5 className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-slate-500">B2B Sourcing Meetings</h5>
                  <span className="text-[8px] font-mono text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded">
                    {enterpriseMeetings.filter(m => m.companyId === activeConv.companyId || m.relatedCompany === activeConv.companyName).length} MEETINGS
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {enterpriseMeetings.filter(m => m.companyId === activeConv.companyId || m.relatedCompany === activeConv.companyName).map((meet, idx) => (
                    <div 
                      key={meet.id || idx}
                      onClick={() => {
                        if (setActiveViewMode) {
                          // View meeting details by setting selected meeting in appStore
                          appStore.setItem('realtyconnect_selected_meeting_id', meet.id);
                          setActiveViewMode('meetings');
                          showToast(`Opening meeting details: ${meet.title}`, 'info');
                        }
                      }}
                      className="p-2 bg-slate-950 hover:bg-slate-900/40 border border-slate-900 rounded-lg flex flex-col gap-1 cursor-pointer group transition-all"
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[10px] text-slate-200 font-bold group-hover:text-indigo-400 transition-colors line-clamp-1">
                          {meet.title}
                        </span>
                        <span className={`text-[7px] font-mono px-1 py-0.2 rounded shrink-0 border uppercase font-bold ${
                          meet.status === 'Completed' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' :
                          meet.status === 'Cancelled' ? 'text-rose-400 border-rose-500/20 bg-rose-500/5' :
                          'text-indigo-400 border-indigo-500/20 bg-indigo-500/5'
                        }`}>
                          {meet.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[8px] font-mono text-slate-500">
                        <span>{meet.meetingDate} @ {meet.startTime}</span>
                        <span className="text-[8px] text-indigo-400">{meet.meetingType}</span>
                      </div>
                    </div>
                  ))}

                  {enterpriseMeetings.filter(m => m.companyId === activeConv.companyId || m.relatedCompany === activeConv.companyName).length === 0 && (
                    <p className="text-[9px] text-slate-500 italic text-center py-2">No meetings scheduled with this partner.</p>
                  )}
                </div>

                <button 
                  onClick={() => {
                    if (setActiveViewMode) {
                      const prefillData = {
                        title: `Strategic Sourcing Review with ${activeConv.companyName}`,
                        meetingType: 'Business Meeting',
                        relatedCompany: activeConv.companyName,
                        companyId: activeConv.companyId,
                        contactPerson: activeConv.assignedExecutive || 'Representative',
                        meetingDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days in future
                        startTime: '11:00',
                        endTime: '12:00',
                        location: 'RealtyConnect Secure Virtual Corridor',
                        meetingMode: 'Video Call',
                        priority: 'High',
                        agenda: `Direct sourcing/procurement negotiation concerning ${activeConv.conversationType} collaboration.`
                      };
                      appStore.setItem('realtyconnect_prefill_meeting', JSON.stringify(prefillData));
                      setActiveViewMode('meetings');
                      showToast(`Configuring enterprise meeting prefill for ${activeConv.companyName}`, 'success');
                    }
                  }}
                  className="w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 text-[8.5px] font-mono font-bold py-1.5 rounded uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-lg shadow-indigo-600/10"
                >
                  <Calendar className="w-3 h-3" />
                  Schedule B2B Meeting
                </button>
              </div>

              {/* Future Ready disclaimer */}
              <div className="p-3 bg-slate-950/60 border border-slate-900 rounded-xl space-y-1 text-slate-500">
                <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wide block">💡 Future Support Ready</span>
                <p className="text-[8.5px] leading-relaxed">
                  Real-time synchronization, team channels, voice logs, CAD live viewers, and native signet contracts will launch automatically in future RealtyConnect updates.
                </p>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-slate-500 text-center text-[10px] italic">
              No conversation active to compile context statistics.
            </div>
          )}
        </div>

      </div>

      {/* Message Editing Modal */}
      {editingMessage && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl animate-fade-in text-left">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h4 className="font-display font-bold text-slate-100 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                Amend Corporate Message
              </h4>
              <button 
                onClick={() => setEditingMessage(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Message Original Context</label>
              <p className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-900 text-[10px] text-slate-400 italic">
                "{editingMessage.text}"
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">New Proposed Content *</label>
              <textarea
                value={editInputText}
                onChange={(e) => setEditInputText(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 text-[11px]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingMessage(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-850 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEditMessageSubmit}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-mono font-bold uppercase tracking-wide transition-all"
              >
                Apply Correction
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
