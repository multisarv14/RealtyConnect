import { appStore } from '../lib/appStore';
import React, { useState, useEffect } from 'react';
import { 
  Search, Building2, Users, CheckCircle2, ArrowRight, MapPin, Mail, Phone, 
  Briefcase, Award, Globe, Building, Check, MessageSquare, Send, Share2, 
  ChevronRight, Sparkles, ShieldCheck, Database, Terminal, Filter, DollarSign, 
  AlertTriangle, LayoutDashboard, FileText, ShoppingBag, ClipboardList, Layers, 
  X, Plus, PlusCircle, Bookmark, Activity, Calendar, TrendingUp, 
  AlertCircle, Trash2, CheckCircle, Grid, List, HardHat, FileSpreadsheet, ChevronDown, ChevronLeft
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  code: string;
  type: string;
  company: string;
  manager: string;
  client: string;
  location: string;
  startDate: string;
  expectedCompletion: string;
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  status: 'Planning' | 'Approved' | 'In Progress' | 'On Hold' | 'Delayed' | 'Completed' | 'Cancelled' | 'Archived';
  phase: 'Planning' | 'Design' | 'Approvals' | 'Procurement' | 'Execution' | 'Quality Inspection' | 'Handover' | 'Closure';
  progress: number;
  budget: number; // in Lakhs (INR)
  description: string;
  documents: { id: string; name: string; size: string; type: string; date: string }[];
  tasks: {
    id: string;
    title: string;
    assignedTo: string;
    priority: 'Low' | 'Normal' | 'High' | 'Urgent';
    status: 'Todo' | 'In Progress' | 'Completed';
    dueDate: string;
    notes: string;
    progress: number;
  }[];
  milestones: {
    id: string;
    title: string;
    dueDate: string;
    status: 'Upcoming' | 'Completed' | 'Delayed';
    progress: number;
  }[];
  team: {
    name: string;
    role: string;
    department: string;
    email: string;
    phone: string;
    companyType: 'Internal' | 'Vendor' | 'Consultant';
  }[];
  history: {
    timestamp: string;
    action: string;
    details: string;
    user: string;
  }[];
  // Integrations references
  associatedOpportunityId?: string;
}

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Amara Sky Towers',
    code: 'RC-PROJ-AMARA',
    type: 'Residential Project',
    company: 'Apex Developers Ltd',
    manager: 'Vikram Malhotra',
    client: 'Rajesh Aggarwal',
    location: 'BKC Area, Bandra East, Mumbai',
    startDate: '2026-01-10',
    expectedCompletion: '2028-12-31',
    priority: 'High',
    status: 'In Progress',
    phase: 'Execution',
    progress: 48,
    budget: 480, // ₹480 Lakhs
    description: 'Stunning 45-storey twin residential skyscrapers incorporating premium luxury penthouses, smart elevators, and solar-paneled green balconies.',
    documents: [
      { id: 'd-1', name: 'Architectural_Masterplan_v3.pdf', size: '14.2 MB', type: 'PDF', date: '2026-01-15' },
      { id: 'd-2', name: 'Structural_Stability_Certificate.pdf', size: '3.8 MB', type: 'PDF', date: '2026-02-02' },
      { id: 'd-3', name: 'Environmental_Clearance_NOC.pdf', size: '8.4 MB', type: 'PDF', date: '2026-01-08' }
    ],
    tasks: [
      { id: 't-101', title: 'Foundation Concreting (M40 Grade)', assignedTo: 'Amit Kumar', priority: 'High', status: 'Completed', dueDate: '2026-05-15', notes: 'Using premium high-early strength cement for fast curing.', progress: 100 },
      { id: 't-102', title: 'Plumbing and Vertical Drainage Shafts', assignedTo: 'Suresh Patel', priority: 'Normal', status: 'In Progress', dueDate: '2026-08-25', notes: 'Installing heavy-duty PVC pipelines.', progress: 65 },
      { id: 't-103', title: 'Premium Glass Curtain Wall Installation', assignedTo: 'Vikram Malhotra', priority: 'Urgent', status: 'Todo', dueDate: '2026-10-30', notes: 'Double-glazed vacuum acoustic glass panels.', progress: 0 }
    ],
    milestones: [
      { id: 'm-101', title: 'Excavation & Shoring Completion', dueDate: '2026-03-15', status: 'Completed', progress: 100 },
      { id: 'm-102', title: 'Plinth Level RCC Foundation', dueDate: '2026-06-30', status: 'Completed', progress: 100 },
      { id: 'm-103', title: 'Slab Casting - 15th Floor', dueDate: '2026-09-15', status: 'Upcoming', progress: 10 },
      { id: 'm-104', title: 'Structural Superstructure Handover', dueDate: '2027-04-10', status: 'Upcoming', progress: 0 }
    ],
    team: [
      { name: 'Vikram Malhotra', role: 'Project Manager', department: 'Construction Division', email: 'v.malhotra@realtyconnect.in', phone: '+91 98220 11442', companyType: 'Internal' },
      { name: 'Neha Deshmukh', role: 'Lead Architect', department: 'Design & Visuals', email: 'neha@creativearchitects.in', phone: '+91 97732 44101', companyType: 'Consultant' },
      { name: 'Anil Gupta', role: 'HVAC Supervisor', department: 'Engineering Services', email: 'anil@guptamechanicals.com', phone: '+91 91122 88771', companyType: 'Vendor' }
    ],
    history: [
      { timestamp: '2026-01-10 09:30', action: 'Project Initiated', details: 'Project officially registered and initial parameters locked.', user: 'Vikram Malhotra' },
      { timestamp: '2026-03-15 17:00', action: 'Milestone Completed', details: 'Excavation and shoring milestone marked as completed.', user: 'Suresh Patel' }
    ],
    associatedOpportunityId: 'opp-1'
  },
  {
    id: 'proj-2',
    name: 'Giga Logistics Park',
    code: 'RC-PROJ-GIGA',
    type: 'Industrial Project',
    company: 'True North Logistics',
    manager: 'Rohit Sharma',
    client: 'Sanjay Thampy',
    location: 'Saman Village, Kalyan Road, Bhiwandi, Thane',
    startDate: '2026-08-01',
    expectedCompletion: '2027-12-31',
    priority: 'Normal',
    status: 'Planning',
    phase: 'Design',
    progress: 12,
    budget: 1250, // ₹1250 Lakhs
    description: 'Mega warehousing facility with temperature-controlled pharmaceutical chambers, high-density robotic loading docks, and grade-A flooring.',
    documents: [
      { id: 'd-201', name: 'Feasibility_Report_Bhiwandi.pdf', size: '21.0 MB', type: 'PDF', date: '2026-06-12' },
      { id: 'd-202', name: 'Site_Soil_Investigation.pdf', size: '5.2 MB', type: 'PDF', date: '2026-07-01' }
    ],
    tasks: [
      { id: 't-201', title: 'Layout Engineering and Soil Testing', assignedTo: 'Rajesh Mishra', priority: 'High', status: 'Completed', dueDate: '2026-07-10', notes: 'Sandy clay encountered, raft foundation recommended.', progress: 100 },
      { id: 't-202', title: 'Steel Portal Frame Prefabrication', assignedTo: 'Kamlesh Steel', priority: 'Normal', status: 'In Progress', dueDate: '2026-09-05', notes: 'Fabrication under way at Pune workshop.', progress: 30 }
    ],
    milestones: [
      { id: 'm-201', title: 'Soil Compaction & Ground Leveling', dueDate: '2026-08-20', status: 'Upcoming', progress: 0 },
      { id: 'm-202', title: 'Erection of Steel Portal Frames', dueDate: '2026-11-15', status: 'Upcoming', progress: 0 }
    ],
    team: [
      { name: 'Rohit Sharma', role: 'Project Lead', department: 'Industrial Projects', email: 'rohit@truenorth.in', phone: '+91 99201 55431', companyType: 'Internal' }
    ],
    history: [
      { timestamp: '2026-07-01 11:15', action: 'Project Registered', details: 'Industrial logistics park profile logged.', user: 'Rohit Sharma' }
    ],
    associatedOpportunityId: 'opp-2'
  },
  {
    id: 'proj-3',
    name: 'Phoenix Hub Mall',
    code: 'RC-PROJ-PHOENIX',
    type: 'Commercial Project',
    company: 'Phoenix Infrastructure Ltd',
    manager: 'Ananya Birla',
    client: 'Gaurav Sabnis',
    location: 'Senapati Bapat Marg, Lower Parel, Mumbai',
    startDate: '2025-05-01',
    expectedCompletion: '2026-11-30',
    priority: 'High',
    status: 'Delayed',
    phase: 'Execution',
    progress: 75,
    budget: 3500, // ₹3500 Lakhs
    description: 'Premium premium luxury B2B and retail mall space containing double-height atriums, fine dining open patios, and multi-tier robotic parking structures.',
    documents: [
      { id: 'd-301', name: 'Mall_Retail_Layout_v9.dwg', size: '88.1 MB', type: 'CAD', date: '2025-11-20' },
      { id: 'd-302', name: 'Fire_NOC_Mumbai_Police.pdf', size: '1.4 MB', type: 'PDF', date: '2026-04-14' }
    ],
    tasks: [
      { id: 't-301', title: 'Central Glass Dome Framing', assignedTo: 'Super Glass Tech', priority: 'Urgent', status: 'In Progress', dueDate: '2026-06-30', notes: 'Delayed due to material transit delay at customs.', progress: 80 },
      { id: 't-302', title: 'Escalator Mechanical Commissioning', assignedTo: 'Otis Elevators', priority: 'High', status: 'In Progress', dueDate: '2026-07-28', notes: 'Electrical sync is pending.', progress: 45 }
    ],
    milestones: [
      { id: 'm-301', title: 'Core Structural Shell Handover', dueDate: '2025-12-15', status: 'Completed', progress: 100 },
      { id: 'm-302', title: 'Atrium Glass Dome Closure', dueDate: '2026-05-30', status: 'Delayed', progress: 85 }
    ],
    team: [
      { name: 'Ananya Birla', role: 'Retail Space Director', department: 'Commercial Div', email: 'ananya.birla@phoenix.in', phone: '+91 98200 99441', companyType: 'Internal' }
    ],
    history: [
      { timestamp: '2026-06-01 10:00', action: 'Delay Logged', details: 'Atrium Glass Dome marked DELAYED due to customs clearance.', user: 'Ananya Birla' }
    ]
  },
  {
    id: 'proj-4',
    name: 'Mumbai Metro Line 12 Extension',
    code: 'RC-PROJ-METRO12',
    type: 'Infrastructure Project',
    company: 'J Kumar Infraprojects & MMRDA',
    manager: 'Pradeep Jha',
    client: 'MMRDA Executive Body',
    location: 'Shilphata to Kalyan Segment, Thane District',
    startDate: '2025-01-15',
    expectedCompletion: '2027-06-30',
    priority: 'Urgent',
    status: 'In Progress',
    phase: 'Execution',
    progress: 35,
    budget: 9800, // ₹9800 Lakhs
    description: 'Elevated viaduct metro segment consisting of 18 double-line metro stations, automated signaling sub-control stations, and power subgrid bays.',
    documents: [
      { id: 'd-401', name: 'Metro_Line_Alignment_Map.pdf', size: '44.5 MB', type: 'PDF', date: '2024-12-18' }
    ],
    tasks: [
      { id: 't-401', title: 'Segment Launching - Pier 45 to Pier 70', assignedTo: 'Crane Operators Team', priority: 'Urgent', status: 'In Progress', dueDate: '2026-08-15', notes: 'Launching during night block hours (11 PM - 5 AM).', progress: 50 }
    ],
    milestones: [
      { id: 'm-401', title: 'Piling Foundation Complete', dueDate: '2025-09-30', status: 'Completed', progress: 100 },
      { id: 'm-402', title: 'Viaduct Erection Shilphata Section', dueDate: '2026-10-31', status: 'Upcoming', progress: 20 }
    ],
    team: [
      { name: 'Pradeep Jha', role: 'Chief Engineer', department: 'Transit Infra', email: 'pradeep.jha@jkumar.in', phone: '+91 98401 22998', companyType: 'Consultant' }
    ],
    history: [
      { timestamp: '2025-01-15 08:00', action: 'Project Initiated', details: 'Authorized alignment map loaded.', user: 'Pradeep Jha' }
    ]
  }
];

interface BusinessProjectEngineProps {
  userSession: { email: string; role: string; permissions: string[] } | null;
  onLogTriggered: (action: string, entity: string, entityId: string, status: 'SUCCESS' | 'FAILURE' | 'WARNING', details: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  setActiveViewMode?: (mode: any) => void;
}

export default function BusinessProjectEngine({
  userSession,
  onLogTriggered,
  showToast,
  setActiveViewMode
}: BusinessProjectEngineProps) {
  // Navigation tabs within CRM component
  const [activeTab, setActiveTab] = useState<'dashboard' | 'directory'>( 'dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  // Selected Project Tab
  const [detailTab, setDetailTab] = useState<'overview' | 'tasks' | 'milestones' | 'team' | 'integrations'>('overview');

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterCompany, setFilterCompany] = useState<string>('All');
  const [filterLocation, setFilterLocation] = useState<string>('All');
  const [filterProgress, setFilterProgress] = useState<number>(0);
  const [viewLayout, setViewLayout] = useState<'grid' | 'card' | 'list'>('grid');
  
  // Modals for Creation
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);

  // External Mapped State for Integrations
  const [crmAccounts, setCrmAccounts] = useState<any[]>([]);
  const [leadsList, setLeadsList] = useState<any[]>([]);
  const [meetingsList, setMeetingsList] = useState<any[]>([]);
  const [rfqList, setRfqList] = useState<any[]>([]);
  const [marketplaceListings, setMarketplaceListings] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);

  // New Project Form
  const [newProj, setNewProj] = useState({
    name: '',
    code: '',
    type: 'Residential Project',
    company: '',
    manager: '',
    client: '',
    location: '',
    startDate: '',
    expectedCompletion: '',
    priority: 'Normal' as 'Low' | 'Normal' | 'High' | 'Urgent',
    status: 'Planning' as Project['status'],
    phase: 'Planning' as Project['phase'],
    budget: 100,
    description: ''
  });

  // New Task Form
  const [newTask, setNewTask] = useState({
    title: '',
    assignedTo: '',
    priority: 'Normal' as 'Low' | 'Normal' | 'High' | 'Urgent',
    status: 'Todo' as 'Todo' | 'In Progress' | 'Completed',
    dueDate: '',
    notes: '',
    progress: 0
  });

  // New Milestone Form
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    dueDate: '',
    status: 'Upcoming' as 'Upcoming' | 'Completed' | 'Delayed',
    progress: 0
  });

  // New Conversation/Message for Project
  const [projectMessage, setProjectMessage] = useState('');

  // Load and Init Project Storage & Integrations
  useEffect(() => {
    const initData = () => {
      try {
        // Projects Init
        const storedProjects = appStore.getItem('realtyconnect_projects');
        if (storedProjects) {
          setProjects(JSON.parse(storedProjects));
        } else {
          appStore.setItem('realtyconnect_projects', JSON.stringify(INITIAL_PROJECTS));
          setProjects(INITIAL_PROJECTS);
        }

        // CRM Accounts
        const savedCrm = appStore.getItem('realtyconnect_crm_accounts');
        if (savedCrm) setCrmAccounts(JSON.parse(savedCrm));

        // Leads
        const savedLeads = appStore.getItem('realtyconnect_leads');
        if (savedLeads) setLeadsList(JSON.parse(savedLeads));

        // Meetings
        const savedMeetings = appStore.getItem('realtyconnect_meetings');
        if (savedMeetings) setMeetingsList(JSON.parse(savedMeetings));

        // RFQs
        const savedRfqs = appStore.getItem('realtyconnect_rfq_list');
        if (savedRfqs) setRfqList(JSON.parse(savedRfqs));

        // Marketplace
        const savedMkt = appStore.getItem('realtyconnect_marketplace_listings');
        if (savedMkt) setMarketplaceListings(JSON.parse(savedMkt));

        // Conversations
        const savedConvs = appStore.getItem('realtyconnect_conversations');
        if (savedConvs) setConversations(JSON.parse(savedConvs));
      } catch (e) {
        console.error('Error synchronizing local databases for projects:', e);
      }
    };

    initData();
    // Refresh storage states every 4 seconds to mirror database sync loops
    const interval = setInterval(initData, 4000);
    return () => clearInterval(interval);
  }, []);

  const saveProjects = (updated: Project[]) => {
    setProjects(updated);
    appStore.setItem('realtyconnect_projects', JSON.stringify(updated));
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId) || null;

  // Notification trigger helper
  const notify = (title: string, details: string, status: 'SUCCESS' | 'WARNING' | 'FAILURE' = 'SUCCESS') => {
    onLogTriggered('PROJECT_NOTIFICATION', 'projects', selectedProjectId || 'system', status, `${title}: ${details}`);
    showToast(title, status === 'SUCCESS' ? 'success' : status === 'WARNING' ? 'info' : 'error');

    // Persist into system_notifications so other components can fetch
    try {
      const currentNotifs = appStore.getItem('system_notifications');
      const parsed = currentNotifs ? JSON.parse(currentNotifs) : [];
      const newNotif = {
        id: `noti-p-${Date.now()}`,
        type: 'in_app',
        recipient: userSession?.email || 'all_users',
        content: `[PROJECTS] ${title}: ${details}`,
        status: 'sent',
        timestamp: new Date().toISOString()
      };
      appStore.setItem('system_notifications', JSON.stringify([newNotif, ...parsed]));
    } catch(err) {
      console.error(err);
    }
  };

  // Create Project handler
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProj.name || !newProj.code || !newProj.company) {
      showToast('Please provide Name, Code, and Developer Company.', 'error');
      return;
    }

    const created: Project = {
      id: `proj-${Date.now()}`,
      name: newProj.name,
      code: newProj.code.toUpperCase(),
      type: newProj.type,
      company: newProj.company,
      manager: newProj.manager || userSession?.email?.split('@')[0] || 'Unassigned',
      client: newProj.client || 'General Market',
      location: newProj.location || 'Panvel, Navi Mumbai',
      startDate: newProj.startDate || new Date().toISOString().split('T')[0],
      expectedCompletion: newProj.expectedCompletion || '2028-01-01',
      priority: newProj.priority,
      status: newProj.status,
      phase: newProj.phase,
      progress: 0,
      budget: Number(newProj.budget) || 100,
      description: newProj.description || 'Enterprise building construction segment.',
      documents: [],
      tasks: [],
      milestones: [],
      team: [
        {
          name: newProj.manager || userSession?.email?.split('@')[0] || 'Unassigned',
          role: 'Project Manager',
          department: 'Operations',
          email: userSession?.email || 'pm@realtyconnect.in',
          phone: '+91 99999 88888',
          companyType: 'Internal'
        }
      ],
      history: [
        {
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          action: 'Project Registered',
          details: `Enterprise project successfully registered under code ${newProj.code}.`,
          user: userSession?.email || 'System'
        }
      ]
    };

    const updated = [created, ...projects];
    saveProjects(updated);
    setShowCreateModal(false);
    
    // Clear Form
    setNewProj({
      name: '',
      code: '',
      type: 'Residential Project',
      company: '',
      manager: '',
      client: '',
      location: '',
      startDate: '',
      expectedCompletion: '',
      priority: 'Normal',
      status: 'Planning',
      phase: 'Planning',
      budget: 100,
      description: ''
    });

    notify('Project Created', `Project "${created.name}" has been successfully logged.`, 'SUCCESS');
    notify('Project Assigned', `Assigned manager "${created.manager}" to project "${created.name}".`, 'SUCCESS');
  };

  // Create Task handler
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !newTask.title) return;

    const taskObj = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      assignedTo: newTask.assignedTo || 'Unassigned',
      priority: newTask.priority,
      status: newTask.status,
      dueDate: newTask.dueDate || new Date().toISOString().split('T')[0],
      notes: newTask.notes,
      progress: newTask.status === 'Completed' ? 100 : newTask.progress
    };

    const updated = projects.map(proj => {
      if (proj.id === selectedProjectId) {
        const nextTasks = [...proj.tasks, taskObj];
        const calculatedProgress = Math.round(
          nextTasks.reduce((sum, t) => sum + (t.status === 'Completed' ? 100 : t.progress), 0) / nextTasks.length
        );

        return {
          ...proj,
          tasks: nextTasks,
          progress: isNaN(calculatedProgress) ? proj.progress : calculatedProgress,
          history: [
            {
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              action: 'Task Added',
              details: `Task "${taskObj.title}" assigned to ${taskObj.assignedTo}.`,
              user: userSession?.email || 'System'
            },
            ...proj.history
          ]
        };
      }
      return proj;
    });

    saveProjects(updated);
    setShowTaskModal(false);
    setNewTask({
      title: '',
      assignedTo: '',
      priority: 'Normal',
      status: 'Todo',
      dueDate: '',
      notes: '',
      progress: 0
    });

    notify('Task Assigned', `Assigned task "${taskObj.title}" to "${taskObj.assignedTo}".`, 'SUCCESS');
  };

  // Create Milestone handler
  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !newMilestone.title) return;

    const milestoneObj = {
      id: `mstone-${Date.now()}`,
      title: newMilestone.title,
      dueDate: newMilestone.dueDate || new Date().toISOString().split('T')[0],
      status: newMilestone.status,
      progress: newMilestone.status === 'Completed' ? 100 : newMilestone.progress
    };

    const updated = projects.map(proj => {
      if (proj.id === selectedProjectId) {
        return {
          ...proj,
          milestones: [...proj.milestones, milestoneObj],
          history: [
            {
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              action: 'Milestone Added',
              details: `Milestone "${milestoneObj.title}" registered for target date ${milestoneObj.dueDate}.`,
              user: userSession?.email || 'System'
            },
            ...proj.history
          ]
        };
      }
      return proj;
    });

    saveProjects(updated);
    setShowMilestoneModal(false);
    setNewMilestone({
      title: '',
      dueDate: '',
      status: 'Upcoming',
      progress: 0
    });

    notify('Milestone Due', `New Milestone Added: "${milestoneObj.title}" is due on ${milestoneObj.dueDate}.`, 'SUCCESS');
  };

  // Toggle Task Status
  const handleToggleTaskStatus = (taskId: string, newStatus: 'Todo' | 'In Progress' | 'Completed') => {
    if (!selectedProjectId) return;

    const updated = projects.map(proj => {
      if (proj.id === selectedProjectId) {
        const nextTasks = proj.tasks.map(t => {
          if (t.id === taskId) {
            return {
              ...t,
              status: newStatus,
              progress: newStatus === 'Completed' ? 100 : t.progress
            };
          }
          return t;
        });

        const calculatedProgress = Math.round(
          nextTasks.reduce((sum, t) => sum + (t.status === 'Completed' ? 100 : t.progress), 0) / nextTasks.length
        );

        return {
          ...proj,
          tasks: nextTasks,
          progress: isNaN(calculatedProgress) ? proj.progress : calculatedProgress,
          history: [
            {
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              action: 'Task Updated',
              details: `Task status updated to ${newStatus}.`,
              user: userSession?.email || 'System'
            },
            ...proj.history
          ]
        };
      }
      return proj;
    });

    saveProjects(updated);
    notify('Task Assigned', `Task status updated to ${newStatus}.`, 'SUCCESS');
  };

  // Toggle Milestone Status
  const handleToggleMilestoneStatus = (milestoneId: string, newStatus: 'Upcoming' | 'Completed' | 'Delayed') => {
    if (!selectedProjectId) return;

    const updated = projects.map(proj => {
      if (proj.id === selectedProjectId) {
        return {
          ...proj,
          milestones: proj.milestones.map(m => 
            m.id === milestoneId ? { ...m, status: newStatus, progress: newStatus === 'Completed' ? 100 : m.progress } : m
          ),
          history: [
            {
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              action: 'Milestone Updated',
              details: `Milestone status updated to ${newStatus}.`,
              user: userSession?.email || 'System'
            },
            ...proj.history
          ]
        };
      }
      return proj;
    });

    saveProjects(updated);
    if (newStatus === 'Completed') {
      notify('Milestone Completed', `Milestone marked as complete.`, 'SUCCESS');
    } else if (newStatus === 'Delayed') {
      notify('Project Delayed', `Milestone delay warning logged.`, 'WARNING');
    }
  };

  // File Upload Simulator
  const handleFakeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedProjectId || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const docObj = {
      id: `doc-${Date.now()}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: file.name.split('.').pop()?.toUpperCase() || 'DOC',
      date: new Date().toISOString().split('T')[0]
    };

    const updated = projects.map(proj => {
      if (proj.id === selectedProjectId) {
        return {
          ...proj,
          documents: [...proj.documents, docObj],
          history: [
            {
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              action: 'Document Uploaded',
              details: `Uploaded associated specification ledger: ${docObj.name}`,
              user: userSession?.email || 'System'
            },
            ...proj.history
          ]
        };
      }
      return proj;
    });

    saveProjects(updated);
    showToast(`Uploaded ${docObj.name} successfully!`, 'success');
  };

  // Delete Project
  const handleDeleteProject = (projId: string) => {
    if (confirm('Are you sure you want to archive and remove this project from the active workspace?')) {
      const updated = projects.filter(p => p.id !== projId);
      saveProjects(updated);
      setSelectedProjectId(null);
      notify('Project Completed', 'Project successfully archived out of active database viewports.', 'SUCCESS');
    }
  };

  // Send message on integrated project channel
  const handleSendProjectMessage = () => {
    if (!projectMessage.trim() || !selectedProject) return;

    // Check if there is an existing conversation or create one
    const projConvName = `Project Feed: ${selectedProject.name}`;
    const targetConv = conversations.find(c => c.companyName === selectedProject.company || c.relatedCompany === selectedProject.company);
    
    const newMsgObj = {
      sender: userSession?.email || 'ramdasraut9@gmail.com',
      text: `[PROJECT DISCUSSION - ${selectedProject.code}] ${projectMessage}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0]
    };

    let updatedConvs;
    if (targetConv) {
      updatedConvs = conversations.map(c => {
        if (c.id === targetConv.id) {
          return {
            ...c,
            lastMessage: newMsgObj.text,
            lastActiveDate: 'Just Now',
            unreadCount: (c.unreadCount || 0) + 1,
            messages: [...(c.messages || []), newMsgObj]
          };
        }
        return c;
      });
    } else {
      const newConv = {
        id: `conv-proj-${Date.now()}`,
        companyName: selectedProject.company,
        category: selectedProject.type,
        logo: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=80&h=80',
        lastMessage: newMsgObj.text,
        lastActiveDate: 'Just Now',
        unreadCount: 1,
        messages: [newMsgObj]
      };
      updatedConvs = [newConv, ...conversations];
    }

    appStore.setItem('realtyconnect_conversations', JSON.stringify(updatedConvs));
    setConversations(updatedConvs);

    // Save project history
    const updatedProjects = projects.map(p => {
      if (p.id === selectedProject.id) {
        return {
          ...p,
          history: [
            {
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              action: 'Channel Communication',
              details: `Dispatched encrypted project telegram message: "${projectMessage.slice(0, 40)}..."`,
              user: userSession?.email || 'System'
            },
            ...p.history
          ]
        };
      }
      return p;
    });
    saveProjects(updatedProjects);

    setProjectMessage('');
    showToast('Project message broadcasted over active channels!', 'success');
  };

  // Filter Projects Logic
  const filteredProjects = projects.filter(proj => {
    // Search query matches
    const matchesSearch = 
      proj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.manager.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.status.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'All' || proj.status === filterStatus;
    const matchesPriority = filterPriority === 'All' || proj.priority === filterPriority;
    const matchesType = filterType === 'All' || proj.type === filterType;
    const matchesCompany = filterCompany === 'All' || proj.company === filterCompany;
    const matchesLocation = filterLocation === 'All' || proj.location.toLowerCase().includes(filterLocation.toLowerCase());
    const matchesProgress = proj.progress >= filterProgress;

    return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesCompany && matchesLocation && matchesProgress;
  });

  // Calculate high-fidelity dashboard metrics
  const totalCount = projects.length;
  const activeCount = projects.filter(p => p.status === 'In Progress' || p.status === 'Approved').length;
  const completedCount = projects.filter(p => p.status === 'Completed').length;
  const delayedCount = projects.filter(p => p.status === 'Delayed').length;
  
  // Total overall milestones upcoming
  const totalUpcomingMilestones = projects.reduce((acc, p) => 
    acc + p.milestones.filter(m => m.status === 'Upcoming').length, 0
  );

  // Health Calculation: percentage of completed tasks across all projects
  const totalTasks = projects.reduce((acc, p) => acc + p.tasks.length, 0);
  const completedTasks = projects.reduce((acc, p) => acc + p.tasks.filter(t => t.status === 'Completed').length, 0);
  const healthPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 92; // default premium baseline

  // Average progress across active projects
  const avgProgress = projects.length > 0 ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length) : 0;

  // Total Portfolio Capital Budget Estimate
  const totalPortfolioBudget = projects.reduce((acc, p) => acc + p.budget, 0);

  // List of unique companies/locations/managers for filters
  const uniqueCompanies = Array.from(new Set(projects.map(p => p.company)));
  const uniqueManagers = Array.from(new Set(projects.map(p => p.manager)));

  // Render Dashboard
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-2 sm:p-3 lg:p-4 font-sans space-y-4" id="project-management-engine-root">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/40 border border-slate-900 rounded-xl p-4 shadow-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 font-mono text-xs uppercase tracking-widest mb-1.5 font-bold">
            <Layers className="w-4 h-4" />
            <span>Projects</span>
          </div>
          <h1 className="text-2xl font-bold font-sans text-white flex items-center gap-2">
            RealtyConnect™ Project Portfolio Management Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-project execution ledger, construction phase scheduling, and 360-degree CRM/RFQ audit mapping.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setSelectedProjectId(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 border ${
              activeTab === 'dashboard' && !selectedProjectId
                ? 'bg-emerald-600 border-emerald-500 text-white' 
                : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-800'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Control Center
          </button>
          
          <button
            onClick={() => {
              setActiveTab('directory');
              setSelectedProjectId(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 border ${
              activeTab === 'directory' && !selectedProjectId
                ? 'bg-emerald-600 border-emerald-500 text-white' 
                : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Project Directory
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-900/20"
          >
            <Plus className="w-4 h-4" />
            Register Project
          </button>
        </div>
      </div>

      {/* Main Container Switch */}
      {!selectedProjectId && activeTab === 'dashboard' && (
        <div className="space-y-4">
          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-slate-900/30 border border-slate-900 p-3.5 rounded-xl flex flex-col justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold block mb-1">Total Projects</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white tracking-tight">{totalCount}</span>
                <span className="text-[10px] font-mono text-slate-500">Registered</span>
              </div>
            </div>

            <div className="bg-slate-900/30 border border-slate-900 p-3.5 rounded-xl flex flex-col justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold block mb-1">Active Blocks</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">{activeCount}</span>
                <span className="text-[10px] font-mono text-emerald-600">Executing</span>
              </div>
            </div>

            <div className="bg-slate-900/30 border border-slate-900 p-3.5 rounded-xl flex flex-col justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold block mb-1">Portfolio Budget</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-white tracking-tight font-mono">₹{totalPortfolioBudget}L</span>
                <span className="text-[9px] font-mono text-slate-500 block">Est Value</span>
              </div>
            </div>

            <div className="bg-slate-900/30 border border-slate-900 p-3.5 rounded-xl flex flex-col justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold block mb-1">Delayed Warns</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-extrabold tracking-tight ${delayedCount > 0 ? 'text-rose-500' : 'text-slate-500'}`}>{delayedCount}</span>
                <span className="text-[10px] font-mono text-rose-600/70">At Risk</span>
              </div>
            </div>

            <div className="bg-slate-900/30 border border-slate-900 p-3.5 rounded-xl col-span-2 md:col-span-1 flex flex-col justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold block mb-1">Project Health</span>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-mono">Task Ratio</span>
                  <span className="text-emerald-400 font-bold font-mono">{healthPercentage}%</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900/60">
                  <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${healthPercentage}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Left Column: My Active Projects Progress & Quick Access */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-900/50 pb-3">
                  <h2 className="text-white font-bold text-sm flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    Overall Project Progress & Execution Status
                  </h2>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full">
                    Weighted Portfolio: {avgProgress}% Done
                  </span>
                </div>

                <div className="space-y-3">
                  {projects.map(proj => (
                    <div 
                      key={proj.id} 
                      onClick={() => {
                        setSelectedProjectId(proj.id);
                        setDetailTab('overview');
                      }}
                      className="p-3 bg-slate-950/50 border border-slate-900 hover:border-slate-800 rounded-xl cursor-pointer transition-all hover:bg-slate-950 group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-white font-bold text-xs group-hover:text-emerald-400 transition-colors">{proj.name}</span>
                            <span className="text-[10px] font-mono text-slate-500">[{proj.code}]</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{proj.type} • {proj.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider font-bold ${
                            proj.priority === 'Urgent' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            proj.priority === 'High' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-slate-500/10 text-slate-400 border border-slate-800'
                          }`}>
                            {proj.priority} Priority
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider font-bold ${
                            proj.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            proj.status === 'Delayed' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            proj.status === 'Planning' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {proj.status}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>Construction Phase: <strong className="text-slate-300">{proj.phase}</strong></span>
                          <span>{proj.progress}% Completed</span>
                        </div>
                        <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${proj.progress}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget Allocations & High-Fidelity Capital Projection */}
              <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-3">
                <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  Portfolio Capital Allocations (UI Ready)
                </h3>
                <p className="text-xs text-slate-400">
                  Estimated budget outlines allocated for project phases. Capital represents procurement margins and RERA reserves.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projects.map(p => (
                    <div key={`budget-${p.id}`} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl flex items-center justify-between">
                      <div className="truncate">
                        <span className="text-xs text-slate-300 font-bold block truncate">{p.name}</span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">{p.type}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono text-white font-bold block">₹{p.budget} Lakhs</span>
                        <span className="text-[9px] font-mono text-emerald-500">{Math.round((p.budget/totalPortfolioBudget)*100)}% weight</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Upcoming Milestones & Recent Project Activities */}
            <div className="space-y-4">
              
              {/* Upcoming Milestones */}
              <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-900/50 pb-3">
                  <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    Upcoming Milestones ({totalUpcomingMilestones})
                  </h3>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {projects.flatMap(p => p.milestones.map(m => ({ ...m, projName: p.name, projCode: p.code }))).filter(m => m.status === 'Upcoming').length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-xs text-slate-500 font-mono">No upcoming milestones registered.</p>
                    </div>
                  ) : (
                    projects.flatMap(p => p.milestones.map(m => ({ ...m, projName: p.name, projCode: p.code })))
                      .filter(m => m.status === 'Upcoming')
                      .slice(0, 5)
                      .map((m, idx) => (
                        <div key={idx} className="p-3 bg-slate-950/60 border border-slate-900 rounded-xl space-y-1.5">
                          <div className="flex justify-between items-start gap-1">
                            <span className="text-xs text-white font-bold leading-tight">{m.title}</span>
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[8px] font-mono font-bold uppercase shrink-0">Upcoming</span>
                          </div>
                          <div className="flex justify-between text-[10px] font-mono text-slate-400">
                            <span>Project: {m.projCode}</span>
                            <span>Due: {m.dueDate}</span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Timeline Audits & Project Activity Log */}
              <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-3">
                <div className="border-b border-slate-900/50 pb-3">
                  <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    Recent Activity Audit
                  </h3>
                </div>

                <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
                  {projects.flatMap(p => p.history.map(h => ({ ...h, projName: p.name, projCode: p.code })))
                    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
                    .slice(0, 6)
                    .map((act, idx) => (
                      <div key={idx} className="flex gap-2.5 items-start text-xs border-b border-slate-900/40 pb-2.5 last:border-0 last:pb-0">
                        <div className="mt-1">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full block"></span>
                        </div>
                        <div className="space-y-0.5 flex-1">
                          <div className="flex justify-between items-baseline gap-2">
                            <span className="text-slate-200 font-bold">{act.action}</span>
                            <span className="text-[9px] font-mono text-slate-500 shrink-0">{act.timestamp}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-normal">{act.details}</p>
                          <span className="text-[9px] font-mono text-emerald-500 block">{act.projCode} • {act.user}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Project Directory Tab */}
      {!selectedProjectId && activeTab === 'directory' && (
        <div className="space-y-4">
          
          {/* Advanced Filtering & Query Controls */}
          <div className="bg-slate-900/30 border border-slate-900 p-4 rounded-xl space-y-3 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by project title, developer company, client, manager or location..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-slate-800 text-slate-200 placeholder:text-slate-500 font-mono"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 font-mono text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* View Layout Switcher */}
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-900 p-1 rounded-xl shrink-0">
                <button
                  onClick={() => setViewLayout('grid')}
                  className={`p-1.5 rounded-lg transition-all ${viewLayout === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  title="Grid View"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewLayout('card')}
                  className={`p-1.5 rounded-lg transition-all ${viewLayout === 'card' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  title="Detailed Cards"
                >
                  <Layers className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewLayout('list')}
                  className={`p-1.5 rounded-lg transition-all ${viewLayout === 'list' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  title="Tabular List"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Expanded Filters */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2 border-t border-slate-900/50">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 block">Status</label>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-lg p-1.5 text-[11px] font-mono text-slate-300 focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Planning">Planning</option>
                  <option value="Approved">Approved</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 block">Priority</label>
                <select
                  value={filterPriority}
                  onChange={e => setFilterPriority(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-lg p-1.5 text-[11px] font-mono text-slate-300 focus:outline-none"
                >
                  <option value="All">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 block">Project Type</label>
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-lg p-1.5 text-[11px] font-mono text-slate-300 focus:outline-none"
                >
                  <option value="All">All Types</option>
                  <option value="Residential Project">Residential</option>
                  <option value="Commercial Project">Commercial</option>
                  <option value="Industrial Project">Industrial</option>
                  <option value="Infrastructure Project">Infrastructure</option>
                  <option value="Mixed Use Project">Mixed Use</option>
                  <option value="Renovation Project">Renovation</option>
                  <option value="Maintenance Project">Maintenance</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 block">Developer / CO</label>
                <select
                  value={filterCompany}
                  onChange={e => setFilterCompany(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-lg p-1.5 text-[11px] font-mono text-slate-300 focus:outline-none"
                >
                  <option value="All">All Developers</option>
                  {uniqueCompanies.map((c, i) => <option key={i} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 block">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, Kalyan"
                  value={filterLocation === 'All' ? '' : filterLocation}
                  onChange={e => setFilterLocation(e.target.value || 'All')}
                  className="w-full bg-slate-950 border border-slate-900 rounded-lg p-1.5 text-[11px] font-mono text-slate-300 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>MIN PROGRESS</span>
                  <span className="text-slate-300">{filterProgress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filterProgress}
                  onChange={e => setFilterProgress(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-2 bg-slate-950 rounded border border-slate-900 mt-2 cursor-pointer"
                />
              </div>
            </div>

            {/* Saved Quick Filters */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-900/40">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider mr-2">Saved Filters:</span>
              <button
                onClick={() => {
                  setFilterStatus('Delayed');
                  setFilterPriority('All');
                }}
                className="px-2.5 py-1 bg-rose-950/20 text-rose-400 border border-rose-900/40 hover:border-rose-500/50 rounded-lg text-[10px] font-mono transition-all"
              >
                At Risk / Delayed
              </button>
              <button
                onClick={() => {
                  setFilterPriority('Urgent');
                  setFilterStatus('All');
                }}
                className="px-2.5 py-1 bg-amber-950/20 text-amber-400 border border-amber-900/40 hover:border-amber-500/50 rounded-lg text-[10px] font-mono transition-all"
              >
                Urgent Priorities
              </button>
              <button
                onClick={() => {
                  setFilterType('Residential Project');
                  setFilterStatus('All');
                }}
                className="px-2.5 py-1 bg-blue-950/20 text-blue-400 border border-blue-900/40 hover:border-blue-500/50 rounded-lg text-[10px] font-mono transition-all"
              >
                Residential Only
              </button>
              <button
                onClick={() => {
                  setFilterStatus('All');
                  setFilterPriority('All');
                  setFilterType('All');
                  setFilterCompany('All');
                  setFilterLocation('All');
                  setFilterProgress(0);
                }}
                className="px-2.5 py-1 bg-slate-900/40 text-slate-400 border border-slate-800 hover:border-slate-700 rounded-lg text-[10px] font-mono transition-all"
              >
                Reset All Filters
              </button>
            </div>
          </div>

          {/* Grid View rendering */}
          {viewLayout === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredProjects.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProjectId(p.id)}
                  className="bg-slate-900/20 border border-slate-900 hover:border-slate-800 p-4 rounded-xl cursor-pointer transition-all hover:bg-slate-900 group flex flex-col justify-between h-56"
                >
                  <div>
                    <div className="flex justify-between items-start gap-1 mb-2.5">
                      <span className="px-2 py-0.5 rounded bg-slate-950 text-[9px] font-mono border border-slate-900 text-slate-400 font-bold shrink-0">{p.code}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                        p.priority === 'Urgent' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        p.priority === 'High' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-slate-500/10 text-slate-400 border border-slate-800'
                      }`}>{p.priority}</span>
                    </div>

                    <h4 className="text-white font-bold text-xs group-hover:text-emerald-400 transition-colors line-clamp-1">{p.name}</h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{p.company}</p>
                    <p className="text-slate-400 text-[11px] line-clamp-3 mt-2 mb-3 leading-relaxed">{p.description}</p>
                  </div>

                  <div className="space-y-2 border-t border-slate-900/50 pt-3">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-500" />{p.location.split(',').pop()?.trim()}</span>
                      <span>{p.progress}% Completed</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900/50">
                      <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${p.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredProjects.length === 0 && (
                <div className="col-span-full text-center py-12 bg-slate-900/10 border border-dashed border-slate-900 rounded-2xl">
                  <p className="text-xs font-mono text-slate-500">No projects match the specified directory filters.</p>
                </div>
              )}
            </div>
          )}

          {/* Cards View Rendering */}
          {viewLayout === 'card' && (
            <div className="space-y-3">
              {filteredProjects.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProjectId(p.id)}
                  className="bg-slate-900/20 border border-slate-900 hover:border-slate-800 p-4 rounded-xl cursor-pointer transition-all hover:bg-slate-900 flex flex-col sm:flex-row items-stretch gap-4 group"
                >
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-950 text-[10px] font-mono border border-slate-900 text-slate-400 font-bold">{p.code}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{p.type}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        p.priority === 'Urgent' ? 'bg-rose-500/10 text-rose-400' :
                        p.priority === 'High' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-slate-500/10 text-slate-400'
                      }`}>{p.priority} Priority</span>
                    </div>

                    <div>
                      <h4 className="text-white font-bold text-sm group-hover:text-emerald-400 transition-colors">{p.name}</h4>
                      <p className="text-[11px] text-slate-400 font-sans mt-1">Developer: <strong className="text-slate-300">{p.company}</strong> • Project Manager: <strong className="text-slate-300">{p.manager}</strong></p>
                    </div>

                    <p className="text-slate-400 text-xs leading-relaxed max-w-2xl">{p.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-mono text-slate-400 pt-1.5">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {p.location}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" /> Timeline: {p.startDate} to {p.expectedCompletion}</span>
                    </div>
                  </div>

                  <div className="sm:w-56 shrink-0 border-t sm:border-t-0 sm:border-l border-slate-900/60 pt-3 sm:pt-0 sm:pl-4 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 block uppercase tracking-wider mb-1">Execution Status</span>
                      <span className="text-white font-bold text-xs">{p.phase} Phase</span>
                    </div>

                    <div className="space-y-1.5 my-3 sm:my-0">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>Task Progress</span>
                        <span>{p.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${p.progress}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] font-mono text-slate-500 block uppercase tracking-wider mb-0.5">Budget Estimates</span>
                      <span className="text-emerald-400 font-bold font-mono text-xs">₹{p.budget} Lakhs</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List View Rendering */}
          {viewLayout === 'list' && (
            <div className="bg-slate-900/10 border border-slate-900 rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-900 bg-slate-900/30 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Project Code</th>
                    <th className="p-4">Project Title</th>
                    <th className="p-4">Developer</th>
                    <th className="p-4">Manager</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Completion Date</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/50">
                  {filteredProjects.map(p => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedProjectId(p.id)}
                      className="hover:bg-slate-900/40 cursor-pointer transition-all"
                    >
                      <td className="p-4 font-mono font-bold text-slate-400">{p.code}</td>
                      <td className="p-4 font-bold text-white hover:text-emerald-400 transition-colors">{p.name}</td>
                      <td className="p-4 text-slate-300">{p.company}</td>
                      <td className="p-4 text-slate-400 font-mono">{p.manager}</td>
                      <td className="p-4 text-slate-400 truncate max-w-xs">{p.location.split(',').pop()?.trim()}</td>
                      <td className="p-4 text-slate-400 font-mono">{p.expectedCompletion}</td>
                      <td className="p-4">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                          p.priority === 'Urgent' ? 'bg-rose-500/10 text-rose-400' :
                          p.priority === 'High' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-slate-500/10 text-slate-400'
                        }`}>{p.priority}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                          p.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                          p.status === 'Delayed' ? 'bg-rose-500/10 text-rose-400' :
                          'bg-slate-500/10 text-slate-400'
                        }`}>{p.status}</span>
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-emerald-400">{p.progress}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* Selected Project Detailed View */}
      {selectedProject && (
        <div className="space-y-4">
          
          {/* Detailed View Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/30 border border-slate-900 p-3.5 rounded-xl">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedProjectId(null)}
                className="p-2 bg-slate-950/50 hover:bg-slate-950 border border-slate-900 hover:border-slate-800 rounded-xl transition-all"
                title="Back to Directory"
              >
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-white font-bold text-sm sm:text-base">{selectedProject.name}</h2>
                  <span className="px-2 py-0.5 rounded bg-slate-950 text-[10px] font-mono border border-slate-900 text-slate-400 font-bold">{selectedProject.code}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">{selectedProject.type} • {selectedProject.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-mono uppercase font-bold`}>
                ✓ {selectedProject.phase} Phase
              </span>
              <button
                onClick={() => handleDeleteProject(selectedProject.id)}
                className="p-2 bg-slate-950 hover:bg-rose-950/20 border border-slate-900 hover:border-rose-900/40 text-slate-400 hover:text-rose-400 rounded-xl transition-all"
                title="Archive Project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2 overflow-x-auto whitespace-nowrap">
            <button
              onClick={() => setDetailTab('overview')}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all border ${
                detailTab === 'overview' ? 'bg-slate-900 border-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              Overview & Scope
            </button>
            <button
              onClick={() => setDetailTab('tasks')}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all border ${
                detailTab === 'tasks' ? 'bg-slate-900 border-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              Tasks ({selectedProject.tasks.length})
            </button>
            <button
              onClick={() => setDetailTab('milestones')}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all border ${
                detailTab === 'milestones' ? 'bg-slate-900 border-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              Milestones ({selectedProject.milestones.length})
            </button>
            <button
              onClick={() => setDetailTab('team')}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all border ${
                detailTab === 'team' ? 'bg-slate-900 border-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              Team Directory
            </button>
            <button
              onClick={() => setDetailTab('integrations')}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all border ${
                detailTab === 'integrations' ? 'bg-slate-900 border-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              360° Integrations ({
                (crmAccounts.find(c => c.name === selectedProject.company) ? 1 : 0) +
                (meetingsList.filter(m => m.companyId === selectedProject.id || m.relatedCompany === selectedProject.company).length) +
                (rfqList.filter(r => r.organization === selectedProject.company).length)
              } linked)
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Left/Middle Column based on Tab */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Overview Tab Content */}
              {detailTab === 'overview' && (
                <div className="space-y-4">
                  
                  {/* Scope Description */}
                  <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-3">
                    <h3 className="text-white font-bold text-sm border-b border-slate-900/50 pb-2">Project Description & Scope Definition</h3>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{selectedProject.description}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 text-xs">
                      <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl space-y-1">
                        <span className="text-[9px] font-mono text-slate-500 block uppercase">Start Date</span>
                        <span className="text-slate-200 font-semibold">{selectedProject.startDate}</span>
                      </div>
                      <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl space-y-1">
                        <span className="text-[9px] font-mono text-slate-500 block uppercase">Target Completion</span>
                        <span className="text-slate-200 font-semibold">{selectedProject.expectedCompletion}</span>
                      </div>
                    </div>
                  </div>

                  {/* Document specifications */}
                  <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-900/50 pb-2">
                      <h3 className="text-white font-bold text-sm">Specification Documents & CAD Blueprints</h3>
                      
                      <div className="relative cursor-pointer">
                        <input
                          type="file"
                          onChange={handleFakeFileUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full"
                          id="blueprint-upload"
                        />
                        <button className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-900 rounded-lg text-[10px] font-mono text-slate-400 font-bold transition-all">
                          + Upload Specification
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {selectedProject.documents.length === 0 ? (
                        <div className="text-center py-4 text-slate-500 text-xs font-mono">
                          No specifications or structural blueprints uploaded to workspace directory yet.
                        </div>
                      ) : (
                        selectedProject.documents.map(doc => (
                          <div key={doc.id} className="p-3 bg-slate-950/50 border border-slate-900 rounded-xl flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                              <span className="text-slate-200 font-bold truncate">{doc.name}</span>
                            </div>
                            <div className="flex items-center gap-4 text-slate-400 font-mono text-[10px] shrink-0">
                              <span>{doc.size}</span>
                              <span>{doc.date}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* Tasks Tab Content */}
              {detailTab === 'tasks' && (
                <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-900/50 pb-3">
                    <h3 className="text-white font-bold text-sm">Active Project Tasks & Deliverables</h3>
                    <button
                      onClick={() => setShowTaskModal(true)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold transition-all"
                    >
                      + Create Task
                    </button>
                  </div>

                  <div className="space-y-3">
                    {selectedProject.tasks.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-xs font-mono">
                        No tasks created for this project scope. Add tasks to calculate overall weighted progress.
                      </div>
                    ) : (
                      selectedProject.tasks.map(task => (
                        <div key={task.id} className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h4 className="text-white font-bold text-xs">{task.title}</h4>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Assigned To: {task.assignedTo} • Due: {task.dueDate}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                value={task.status}
                                onChange={e => handleToggleTaskStatus(task.id, e.target.value as any)}
                                className="bg-slate-950 border border-slate-900 rounded px-2 py-0.5 text-[10px] font-mono text-slate-300 focus:outline-none"
                              >
                                <option value="Todo">Todo</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                              </select>

                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                                task.priority === 'Urgent' ? 'bg-rose-500/10 text-rose-400' :
                                task.priority === 'High' ? 'bg-amber-500/10 text-amber-400' :
                                'bg-slate-500/10 text-slate-400'
                              }`}>{task.priority}</span>
                            </div>
                          </div>

                          {task.notes && (
                            <p className="text-[11px] text-slate-400 bg-slate-950/20 border border-slate-900 p-2.5 rounded-lg leading-relaxed">{task.notes}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Milestones Tab Content */}
              {detailTab === 'milestones' && (
                <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-900/50 pb-3">
                    <h3 className="text-white font-bold text-sm">Target Milestones Timeline</h3>
                    <button
                      onClick={() => setShowMilestoneModal(true)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold transition-all"
                    >
                      + Create Milestone
                    </button>
                  </div>

                  <div className="space-y-3">
                    {selectedProject.milestones.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-xs font-mono">
                        No milestones logged for this project yet.
                      </div>
                    ) : (
                      selectedProject.milestones.map(m => (
                        <div key={m.id} className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl flex justify-between items-center text-xs">
                          <div className="space-y-1">
                            <h4 className="text-white font-bold">{m.title}</h4>
                            <p className="text-[10px] text-slate-400 font-mono">Target Date: {m.dueDate}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <select
                              value={m.status}
                              onChange={e => handleToggleMilestoneStatus(m.id, e.target.value as any)}
                              className="bg-slate-950 border border-slate-900 rounded px-2 py-0.5 text-[10px] font-mono text-slate-300 focus:outline-none"
                            >
                              <option value="Upcoming">Upcoming</option>
                              <option value="Completed">Completed</option>
                              <option value="Delayed">Delayed</option>
                            </select>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider font-bold ${
                              m.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                              m.status === 'Delayed' ? 'bg-rose-500/10 text-rose-400 font-bold' :
                              'bg-blue-500/10 text-blue-400'
                            }`}>{m.status}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Team Tab Content */}
              {detailTab === 'team' && (
                <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-3">
                  <h3 className="text-white font-bold text-sm border-b border-slate-900/50 pb-3">Project Members, Vendors & Consultants</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedProject.team.map((member, i) => (
                      <div key={i} className="p-4 bg-slate-950/50 border border-slate-900 rounded-xl space-y-2 text-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-white font-bold">{member.name}</h4>
                            <p className="text-[10px] text-slate-400 font-mono">{member.role} • {member.department}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-wider font-bold ${
                            member.companyType === 'Internal' ? 'bg-emerald-500/10 text-emerald-400' :
                            member.companyType === 'Vendor' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-purple-500/10 text-purple-400'
                          }`}>{member.companyType}</span>
                        </div>
                        <div className="pt-2 border-t border-slate-900/40 text-[10px] font-mono text-slate-400 space-y-0.5">
                          <p>Email: {member.email}</p>
                          <p>Phone: {member.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Integrations Tab Content */}
              {detailTab === 'integrations' && (
                <div className="space-y-4">
                  
                  {/* 1. CRM Account Linkage */}
                  <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-3">
                    <h3 className="text-white font-bold text-sm border-b border-slate-900/50 pb-2 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-emerald-500" />
                      Associated Enterprise CRM Account
                    </h3>

                    {crmAccounts.find(c => c.name?.toLowerCase().trim() === selectedProject.company?.toLowerCase().trim()) ? (
                      (() => {
                        const matched = crmAccounts.find(c => c.name?.toLowerCase().trim() === selectedProject.company?.toLowerCase().trim());
                        return (
                          <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl space-y-3 text-xs">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-white font-bold">{matched.name}</h4>
                                <p className="text-[10px] text-slate-400 font-mono">{matched.industry}</p>
                              </div>
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-mono uppercase font-bold">Matched in CRM</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-900/40">
                              <p>GSTIN: {matched.gstNumber}</p>
                              <p>Account Value: ₹{matched.businessValue} Lakhs</p>
                              <p>Stage: {matched.currentStage}</p>
                              <p>Relationship: {matched.relationshipStatus}</p>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="p-4 bg-slate-950/20 border border-slate-900 border-dashed rounded-xl text-center py-6 text-xs text-slate-500">
                        No matching developer corporate profile found in CRM accounts list.
                      </div>
                    )}
                  </div>

                  {/* 2. Qualified Leads Linkage */}
                  <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-3">
                    <h3 className="text-white font-bold text-sm border-b border-slate-900/50 pb-2 flex items-center gap-1.5">
                      <ClipboardList className="w-4 h-4 text-emerald-500" />
                      Linked Qualified B2B Leads
                    </h3>

                    {leadsList.filter(l => l.companyName?.toLowerCase().trim() === selectedProject.company?.toLowerCase().trim()).length === 0 ? (
                      <div className="p-4 bg-slate-950/20 border border-slate-900 border-dashed rounded-xl text-center py-6 text-xs text-slate-500">
                        No active qualified pipeline leads linked to this developer's capital project.
                      </div>
                    ) : (
                      leadsList.filter(l => l.companyName?.toLowerCase().trim() === selectedProject.company?.toLowerCase().trim()).map((lead, i) => (
                        <div key={i} className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl space-y-2 text-xs">
                          <div className="flex justify-between">
                            <h4 className="text-white font-bold">{lead.name || lead.contactPerson}</h4>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[8px] font-bold uppercase">{lead.status}</span>
                          </div>
                          <p className="text-slate-400 text-[11px] font-mono">Requirement: {lead.requirement || 'Premium grade construction supply.'}</p>
                          <p className="text-slate-400 text-[10px] font-mono">Lead Value: ₹{lead.estimatedValue || 12} Lakhs</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* 3. Project Meetings Integration */}
                  <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-3">
                    <h3 className="text-white font-bold text-sm border-b border-slate-900/50 pb-2 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-emerald-500" />
                      Project Site & Review Meetings
                    </h3>

                    {meetingsList.filter(m => m.companyId === selectedProject.id || m.relatedCompany?.toLowerCase().trim() === selectedProject.company?.toLowerCase().trim()).length === 0 ? (
                      <div className="p-4 bg-slate-950/20 border border-slate-900 border-dashed rounded-xl text-center py-6 text-xs text-slate-500">
                        No site meetings, design reviews, or progress reviews scheduled for this project.
                      </div>
                    ) : (
                      meetingsList.filter(m => m.companyId === selectedProject.id || m.relatedCompany?.toLowerCase().trim() === selectedProject.company?.toLowerCase().trim()).map((meet, i) => (
                        <div key={i} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl flex justify-between items-start text-xs gap-3">
                          <div className="space-y-1">
                            <h4 className="text-white font-bold">{meet.title}</h4>
                            <p className="text-slate-400 text-[11px] leading-relaxed">{meet.agenda || 'Project review discussion.'}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-mono text-slate-500 block">{meet.meetingDate} {meet.startTime}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono uppercase tracking-wider font-bold ${
                              meet.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                              meet.status === 'Cancelled' ? 'bg-red-500/10 text-red-400' :
                              'bg-amber-500/10 text-amber-400'
                            }`}>{meet.status}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* 4. RFQs / Tenders Integration */}
                  <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-3">
                    <h3 className="text-white font-bold text-sm border-b border-slate-900/50 pb-2 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-500" />
                      Active RFQs & Supply Tenders
                    </h3>

                    {rfqList.filter(r => r.organization?.toLowerCase().trim() === selectedProject.company?.toLowerCase().trim()).length === 0 ? (
                      <div className="p-4 bg-slate-950/20 border border-slate-900 border-dashed rounded-xl text-center py-6 text-xs text-slate-500">
                        No active material RFQs listed under this project company.
                      </div>
                    ) : (
                      rfqList.filter(r => r.organization?.toLowerCase().trim() === selectedProject.company?.toLowerCase().trim()).map((rfq, i) => (
                        <div key={i} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl flex justify-between items-start text-xs gap-3">
                          <div className="space-y-1">
                            <h4 className="text-white font-bold">{rfq.title}</h4>
                            <p className="text-slate-400 text-[11px]">Material: {rfq.materialSpecification || rfq.category}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-mono text-slate-500 block">Value: ₹{rfq.estimatedValue || rfq.budget}L</span>
                            <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[8px] font-mono uppercase tracking-wider font-bold">{rfq.status}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* 5. Marketplace Preferred Suppliers & Materials */}
                  <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-3">
                    <h3 className="text-white font-bold text-sm border-b border-slate-900/50 pb-2 flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-emerald-500" />
                      Required Materials & Purchased Products (UI Ready)
                    </h3>

                    <div className="space-y-3.5">
                      <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl text-xs space-y-1.5">
                        <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block">Purchased Products</span>
                        <div className="flex justify-between items-center bg-slate-900/40 border border-slate-900/60 p-2 rounded">
                          <span className="text-white font-semibold">Fe550D TMT Reinforcement Steel</span>
                          <span className="text-slate-400 font-mono text-[10px]">1,200 MT • Completed</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-900/40 border border-slate-900/60 p-2 rounded">
                          <span className="text-white font-semibold">M40 Grade Readymix Concrete</span>
                          <span className="text-slate-400 font-mono text-[10px]">4,500 CuM • Completed</span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl text-xs space-y-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Preferred Suppliers</span>
                        <p className="text-slate-300 font-sans leading-relaxed">JSW Steel Ltd, Ultratech Cement, Hindalco Extrusions.</p>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Right Column Project Specs & Team Overview */}
            <div className="space-y-4">
              
              {/* Project Health & Progress Widget */}
              <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Overall Status</span>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-sans">Project Completion</span>
                    <span className="text-emerald-400 font-bold font-mono">{selectedProject.progress}%</span>
                  </div>
                  
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900/60">
                    <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${selectedProject.progress}%` }}></div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 block uppercase">Priority</span>
                      <span className="text-slate-200 font-semibold">{selectedProject.priority}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 block uppercase">Status</span>
                      <span className="text-slate-200 font-semibold">{selectedProject.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Integrated Channel Live Feed Discussions */}
              <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-3">
                <h3 className="text-white font-bold text-sm border-b border-slate-900/50 pb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                  Project Discussion Channel
                </h3>

                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {(() => {
                    const matchedConv = conversations.find(c => c.companyName === selectedProject.company || c.relatedCompany === selectedProject.company);
                    if (!matchedConv || !matchedConv.messages || matchedConv.messages.length === 0) {
                      return (
                        <div className="text-center py-4 text-xs font-mono text-slate-500">
                          Secure project telegram channel empty. Dispatched parameters are logged here.
                        </div>
                      );
                    }
                    return matchedConv.messages.slice(-4).map((msg: any, idx: number) => (
                      <div key={idx} className="p-2.5 bg-slate-950/50 border border-slate-900 rounded-lg text-[11px] leading-normal">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-slate-200 font-mono font-bold truncate">{msg.sender.split('@')[0]}</span>
                          <span className="text-[9px] font-mono text-slate-500 shrink-0">{msg.time}</span>
                        </div>
                        <p className="text-slate-400">{msg.text}</p>
                      </div>
                    ));
                  })()}
                </div>

                <div className="pt-2 border-t border-slate-900/40">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type project discussion..."
                      value={projectMessage}
                      onChange={e => setProjectMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendProjectMessage()}
                      className="flex-1 bg-slate-950 border border-slate-900 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                    />
                    <button
                      onClick={handleSendProjectMessage}
                      className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Project Parameters */}
              <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-2.5 text-xs">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Metadata Specs</span>
                
                <div className="space-y-2.5">
                  <div className="flex justify-between border-b border-slate-900/30 pb-1.5">
                    <span className="text-slate-400">Project Code</span>
                    <span className="font-mono text-slate-200 font-semibold">{selectedProject.code}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900/30 pb-1.5">
                    <span className="text-slate-400">Lead Manager</span>
                    <span className="text-slate-200 font-semibold">{selectedProject.manager}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900/30 pb-1.5">
                    <span className="text-slate-400">Client / Sponsor</span>
                    <span className="text-slate-200 font-semibold">{selectedProject.client}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900/30 pb-1.5">
                    <span className="text-slate-400">Total Capital Budget</span>
                    <span className="font-mono text-emerald-400 font-bold">₹{selectedProject.budget} Lakhs</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Creation Modal: Project Registration */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-white font-bold text-sm sm:text-base">Register Corporate Capital Project</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-500 hover:text-slate-300 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono">PROJECT NAME *</label>
                  <input
                    type="text"
                    required
                    placeholder="Amara Sky Towers"
                    value={newProj.name}
                    onChange={e => setNewProj({ ...newProj, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono">PROJECT CODE *</label>
                  <input
                    type="text"
                    required
                    placeholder="RC-PROJ-AMARA"
                    value={newProj.code}
                    onChange={e => setNewProj({ ...newProj, code: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono">DEVELOPER / COMPANY *</label>
                  <input
                    type="text"
                    required
                    placeholder="Apex Developers Ltd"
                    value={newProj.company}
                    onChange={e => setNewProj({ ...newProj, company: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono">Project Type</label>
                  <select
                    value={newProj.type}
                    onChange={e => setNewProj({ ...newProj, type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none"
                  >
                    <option value="Residential Project">Residential Project</option>
                    <option value="Commercial Project">Commercial Project</option>
                    <option value="Industrial Project">Industrial Project</option>
                    <option value="Infrastructure Project">Infrastructure Project</option>
                    <option value="Mixed Use Project">Mixed Use Project</option>
                    <option value="Renovation Project">Renovation Project</option>
                    <option value="Maintenance Project">Maintenance Project</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono">Project Manager</label>
                  <input
                    type="text"
                    placeholder="Vikram Malhotra"
                    value={newProj.manager}
                    onChange={e => setNewProj({ ...newProj, manager: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono font-bold text-emerald-500">Capital Budget (₹ Lakhs)</label>
                  <input
                    type="number"
                    value={newProj.budget}
                    onChange={e => setNewProj({ ...newProj, budget: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono">Start Date</label>
                  <input
                    type="date"
                    value={newProj.startDate}
                    onChange={e => setNewProj({ ...newProj, startDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono">Target Completion</label>
                  <input
                    type="date"
                    value={newProj.expectedCompletion}
                    onChange={e => setNewProj({ ...newProj, expectedCompletion: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono">Priority</label>
                  <select
                    value={newProj.priority}
                    onChange={e => setNewProj({ ...newProj, priority: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono">Initial Status</label>
                  <select
                    value={newProj.status}
                    onChange={e => setNewProj({ ...newProj, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Approved">Approved</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono">Initial Phase</label>
                  <select
                    value={newProj.phase}
                    onChange={e => setNewProj({ ...newProj, phase: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Design">Design</option>
                    <option value="Approvals">Approvals</option>
                    <option value="Procurement">Procurement</option>
                    <option value="Execution">Execution</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-mono">Project Description & Site Specs</label>
                <textarea
                  rows={3}
                  placeholder="Outline the construction scope, parameters, concrete grades, RERA clearance IDs..."
                  value={newProj.description}
                  onChange={e => setNewProj({ ...newProj, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800 rounded-xl font-mono font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-mono font-bold transition-all"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Creation Modal: Task Creation */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-white font-bold text-sm">Add Task Specification</h3>
              <button onClick={() => setShowTaskModal(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-mono">TASK DESCRIPTION *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electrical core conduit testing"
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono">Assign to</label>
                  <input
                    type="text"
                    placeholder="Amit Kumar"
                    value={newTask.assignedTo}
                    onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={e => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200"
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono">Initial Progress</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newTask.progress}
                    onChange={e => setNewTask({ ...newTask, progress: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-mono">Task Work Notes</label>
                <textarea
                  rows={2}
                  placeholder="Notes for execution team..."
                  value={newTask.notes}
                  onChange={e => setNewTask({ ...newTask, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 bg-slate-950 text-slate-400 border border-slate-800 rounded-xl font-mono font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-mono font-bold"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Creation Modal: Milestone Creation */}
      {showMilestoneModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-white font-bold text-sm">Add Milestone Definition</h3>
              <button onClick={() => setShowMilestoneModal(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMilestone} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-mono">MILESTONE TITLE *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Slab casting 20th floor"
                  value={newMilestone.title}
                  onChange={e => setNewMilestone({ ...newMilestone, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono">TARGET DATE *</label>
                  <input
                    type="date"
                    required
                    value={newMilestone.dueDate}
                    onChange={e => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono">Initial Status</label>
                  <select
                    value={newMilestone.status}
                    onChange={e => setNewMilestone({ ...newMilestone, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                    <option value="Delayed">Delayed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMilestoneModal(false)}
                  className="px-4 py-2 bg-slate-950 text-slate-400 border border-slate-800 rounded-xl font-mono font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-mono font-bold"
                >
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
