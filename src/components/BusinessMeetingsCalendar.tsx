import { currentUserName } from '../lib/identity';
import { appStore } from '../lib/appStore';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, Clock, MapPin, Users, Plus, Search, Filter, Check, X, 
  ChevronLeft, ChevronRight, Edit, Trash2, Paperclip, SlidersHorizontal, 
  List, Grid, AlertCircle, MessageSquare, ArrowUpRight, Tag, 
  ChevronDown, CheckSquare, FileText, Phone, Video, Info, CalendarDays,
  Send, ExternalLink, PlusCircle
} from 'lucide-react';
import { CalendarMeeting, MeetingAttachment } from '../types';

export const INITIAL_MEETINGS: CalendarMeeting[] = [
  {
    id: 'RC-MT-9001',
    title: 'Sustainability Standard & Smart Bricks Demo',
    meetingType: 'Marketplace Product Demo',
    relatedCompany: 'Apex Developers Ltd',
    companyId: 'ent-1',
    contactPerson: 'Vikram Malhotra',
    organizer: 'Vikram Malhotra',
    participants: ['Vikram Malhotra', 'Siddharth Roy', 'Anil Mehta'],
    relatedProductId: 'prod-ecobricks',
    meetingDate: '2026-07-19', // Today
    startTime: '11:00',
    endTime: '12:00',
    location: 'Meeting Room 3B, Apex HQ (Mumbai)',
    meetingMode: 'In Person',
    priority: 'High',
    status: 'Scheduled',
    agenda: 'Live testing of compression strength and water absorption for eco-friendly insulating brick samples.',
    notes: 'Samples have been dispatched to their testing facility. Need physical verification of tests.',
    discussionPoints: ['Compressive load limit', 'Thermal conductivity values', 'Bulk shipping timelines'],
    actionItems: ['Provide RERA certification copy', 'Send final price quote per thousand bricks'],
    followUpTasks: ['Deliver physical brick samples', 'Confirm technical compliance clearance'],
    reminderTime: '30 Minutes Before',
    attachments: [
      { name: 'EcoBricks_Compressive_Test_Report.pdf', size: '1.4 MB' },
      { name: 'Sourcing_Proposal_Apex.pdf', size: '950 KB' }
    ]
  },
  {
    id: 'RC-MT-9002',
    title: 'AAC Block Supply Tender Clarification',
    meetingType: 'RFQ Discussion',
    relatedCompany: 'Elite Materials & Co',
    companyId: 'company-rfq',
    contactPerson: 'Ramesh Raut',
    organizer: 'Sanjay Deshmukh',
    participants: ['Ramesh Raut', 'Sanjay Deshmukh', 'Vikram Malhotra'],
    relatedRfqId: 'rfq-aac-102',
    meetingDate: '2026-07-19', // Today
    startTime: '15:30',
    endTime: '16:30',
    location: 'Secure Video Bridge - Link RC-778',
    meetingMode: 'Video Call',
    priority: 'Urgent',
    status: 'In Progress',
    agenda: 'Resolve pending queries on commercial delivery SLA and payment security escrows.',
    notes: 'Buyer is insisting on a bank guarantee. Need to align standard RealtyConnect ESCROW pathways.',
    discussionPoints: ['Credit terms (net-45 vs net-30)', 'SLA penalty clauses', 'Escrow verification'],
    actionItems: ['Review legal team standard guarantee drafts', 'Update RFQ quotation spreadsheet'],
    followUpTasks: ['Submit finalized quote bid'],
    reminderTime: '15 Minutes Before',
    attachments: [
      { name: 'RFQ_AAC_Tender_Specs.pdf', size: '2.1 MB' }
    ]
  },
  {
    id: 'RC-MT-9003',
    title: 'Ghatkopar Residential Site Visit',
    meetingType: 'Site Visit',
    relatedCompany: 'Green Brick Logistics',
    companyId: 'ent-4',
    contactPerson: 'Ananya Sharma',
    organizer: 'Ananya Sharma',
    participants: ['Ananya Sharma', 'Vikram Malhotra', 'Siddharth Roy'],
    relatedLeadId: 'RC-LE-1004',
    meetingDate: '2026-07-20', // Tomorrow
    startTime: '10:00',
    endTime: '12:30',
    location: 'Ghatkopar East Project Site, Mumbai',
    meetingMode: 'In Person',
    priority: 'Normal',
    status: 'Confirmed',
    agenda: 'Inspect physical access gates, logistic unloading zones, and RERA compliance signs.',
    notes: 'Required helmets and safety boots. Meet at Gate 2 construction office.',
    discussionPoints: ['Transit entry constraints', 'Storage yard area boundaries', 'Local municipal NOC status'],
    actionItems: ['Coordinate site safety passes', 'Prepare site survey layout maps'],
    followUpTasks: ['Log inspection checklist into Lead CRM'],
    reminderTime: '1 Day Before',
    attachments: [
      { name: 'Ghatkopar_Site_Plan_R2.pdf', size: '4.8 MB' }
    ]
  },
  {
    id: 'RC-MT-9004',
    title: 'State-Level Partnership Structuring',
    meetingType: 'Partnership Meeting',
    relatedCompany: 'L&T Infrastructure',
    companyId: 'ent-3',
    contactPerson: 'Sanjay Deshmukh',
    organizer: 'Vikram Malhotra',
    participants: ['Vikram Malhotra', 'Sanjay Deshmukh', 'Rajesh Kulkarni'],
    relatedOpportunityId: 'opp-steel-101',
    meetingDate: '2026-07-21',
    startTime: '14:00',
    endTime: '15:30',
    location: 'Main Boardroom, L&T Tower (Mumbai)',
    meetingMode: 'In Person',
    priority: 'High',
    status: 'Scheduled',
    agenda: 'Explore strategic steel sourcing partnerships and structural precast integration pathways.',
    notes: 'L&T representatives are extremely keen on sustainable material options.',
    discussionPoints: ['Volume pricing tiers', 'Carbon offset integration', 'Inter-state shipping clearances'],
    actionItems: ['Draft preliminary MoU template', 'Request technical specifications list'],
    followUpTasks: [],
    reminderTime: '1 Hour Before',
    attachments: []
  },
  {
    id: 'RC-MT-9005',
    title: 'Initial Partnership Exploration',
    meetingType: 'Networking Meeting',
    relatedCompany: 'Zenith Safety Audits',
    companyId: 'ent-5',
    contactPerson: 'Karan Mehra',
    organizer: 'Ramesh Raut',
    participants: ['Ramesh Raut', 'Karan Mehra'],
    relatedLeadId: 'RC-LE-1005',
    meetingDate: '2026-07-18', // Yesterday
    startTime: '16:00',
    endTime: '17:00',
    location: 'RealtyConnect Messaging Audio Bridge',
    meetingMode: 'Voice Call',
    priority: 'Low',
    status: 'Completed',
    agenda: 'Discuss safety audit collaborations and verified corporate registration on the Networking Hub.',
    notes: 'Very successful call. Karan confirmed they would list their certifications in the directory.',
    discussionPoints: ['Directory listings benefits', 'Safety validation timeline', 'Platform subscription tiers'],
    actionItems: ['Approve Zenith safety credentials badge', 'Send onboarding welcome pack'],
    followUpTasks: ['Follow up regarding audit pricing schedules'],
    reminderTime: 'None',
    attachments: []
  }
];

interface BusinessMeetingsCalendarProps {
  prefilledMeeting?: any;
  onLogTriggered: (action: string, entity: string, entityId: string, status: 'SUCCESS' | 'FAILURE' | 'WARNING', details: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  userSession?: any;
  setActiveViewMode?: (view: any) => void;
  initialCreateWithPreFill?: Partial<CalendarMeeting> | null;
  onClearPreFill?: () => void;
}

export default function BusinessMeetingsCalendar({
  onLogTriggered,
  showToast,
  userSession,
  setActiveViewMode,
  initialCreateWithPreFill,
  onClearPreFill
}: BusinessMeetingsCalendarProps) {
  // Meetings state
  const [meetings, setMeetings] = useState<CalendarMeeting[]>(() => {
    const saved = appStore.getItem('realtyconnect_meetings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_MEETINGS;
  });

  useEffect(() => {
    appStore.setItem('realtyconnect_meetings', JSON.stringify(meetings));
  }, [meetings]);

  // Main navigation tabs: 'directory' (Directory, Card, List views) or 'calendar'
  const [activeTab, setActiveTab] = useState<'directory' | 'calendar'>('calendar');
  
  // Display Mode under Directory: 'card' | 'list'
  const [directoryViewMode, setDirectoryViewMode] = useState<'card' | 'list'>('card');
  
  // Calendar specific views: 'month' | 'week' | 'day' | 'agenda' | 'upcoming' | 'today'
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day' | 'agenda' | 'upcoming' | 'today'>('month');

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const history = appStore.getItem('realtyconnect_meeting_search_history');
    return history ? JSON.parse(history) : ['Apex', 'RFQ', 'Malhotra', 'Site Visit'];
  });

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterMeetingType, setFilterMeetingType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterOrganizer, setFilterOrganizer] = useState<string>('all');
  const [filterCompany, setFilterCompany] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<string>('all');

  // Sorting
  const [sortBy, setSortBy] = useState<'date-asc' | 'date-desc' | 'priority-high' | 'title'>('date-asc');

  // Pagination (Directory list only)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Selected meeting for inspection panel
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(() => {
    try {
      const redirectedId = appStore.getItem('realtyconnect_selected_meeting_id');
      if (redirectedId) {
        appStore.removeItem('realtyconnect_selected_meeting_id');
        return redirectedId;
      }
    } catch (e) {}
    return meetings.length > 0 ? meetings[0].id : null;
  });
  const selectedMeeting = meetings.find(m => m.id === selectedMeetingId) || null;

  useEffect(() => {
    try {
      const redirectedId = appStore.getItem('realtyconnect_selected_meeting_id');
      if (redirectedId) {
        appStore.removeItem('realtyconnect_selected_meeting_id');
        setSelectedMeetingId(redirectedId);
      }
    } catch (e) {}
  }, [meetings]);

  // Create/Edit modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<CalendarMeeting | null>(null);

  // Form Field states
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<CalendarMeeting['meetingType']>('Business Meeting');
  const [formCompany, setFormCompany] = useState('');
  const [formCompanyId, setFormCompanyId] = useState('');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formOrganizer, setFormOrganizer] = useState(currentUserName());
  const [formParticipants, setFormParticipants] = useState<string[]>([]);
  const [participantInput, setParticipantInput] = useState('');
  const [formLeadId, setFormLeadId] = useState('');
  const [formRfqId, setFormRfqId] = useState('');
  const [formOppId, setFormOppId] = useState('');
  const [formProdId, setFormProdId] = useState('');
  const [formDate, setFormDate] = useState('2026-07-19');
  const [formStartTime, setFormStartTime] = useState('10:00');
  const [formEndTime, setFormEndTime] = useState('11:00');
  const [formLocation, setFormLocation] = useState('');
  const [formMode, setFormMode] = useState<CalendarMeeting['meetingMode']>('In Person');
  const [formPriority, setFormPriority] = useState<CalendarMeeting['priority']>('Normal');
  const [formStatus, setFormStatus] = useState<CalendarMeeting['status']>('Scheduled');
  const [formAgenda, setFormAgenda] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formReminder, setFormReminder] = useState<CalendarMeeting['reminderTime']>('30 Minutes Before');

  // Agenda Checklist management inside inspection panel
  const [newDiscussionPoint, setNewDiscussionPoint] = useState('');
  const [newActionItem, setNewActionItem] = useState('');
  const [newFollowUpTask, setNewFollowUpTask] = useState('');

  // Follow-up scheduling form inside details view
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [followUpTitle, setFollowUpTitle] = useState('');
  const [followUpDate, setFollowUpDate] = useState('2026-07-20');
  const [followUpStartTime, setFollowUpStartTime] = useState('11:00');
  const [followUpEndTime, setFollowUpEndTime] = useState('12:00');
  const [followUpNotes, setFollowUpNotes] = useState('');

  // Selected date for Month/Week/Day Navigation
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date('2026-07-19'));

  // Notification generator helper
  const triggerNotification = (type: 'scheduled' | 'reminder' | 'updated' | 'cancelled' | 'completed', title: string, company: string, time: string) => {
    let msg = '';
    switch (type) {
      case 'scheduled':
        msg = `Meeting Scheduled: "${title}" with ${company} at ${time}.`;
        break;
      case 'reminder':
        msg = `Upcoming Meeting Reminder: "${title}" starts in 30 minutes.`;
        break;
      case 'updated':
        msg = `Meeting Updated: "${title}" details have been modified.`;
        break;
      case 'cancelled':
        msg = `Meeting Cancelled: "${title}" has been cancelled.`;
        break;
      case 'completed':
        msg = `Meeting Completed: Please log discussion points and action items for "${title}".`;
        break;
    }
    showToast(msg, type === 'cancelled' ? 'error' : type === 'completed' ? 'success' : 'info');
  };

  // Handle outside link/prefill integration when initialCreateWithPreFill changes
  useEffect(() => {
    if (initialCreateWithPreFill) {
      resetFormFields();
      if (initialCreateWithPreFill.title) setFormTitle(initialCreateWithPreFill.title);
      if (initialCreateWithPreFill.meetingType) setFormType(initialCreateWithPreFill.meetingType);
      if (initialCreateWithPreFill.relatedCompany) setFormCompany(initialCreateWithPreFill.relatedCompany);
      if (initialCreateWithPreFill.companyId) setFormCompanyId(initialCreateWithPreFill.companyId);
      if (initialCreateWithPreFill.contactPerson) setFormContactPerson(initialCreateWithPreFill.contactPerson);
      if (initialCreateWithPreFill.relatedLeadId) setFormLeadId(initialCreateWithPreFill.relatedLeadId);
      if (initialCreateWithPreFill.relatedRfqId) setFormRfqId(initialCreateWithPreFill.relatedRfqId);
      if (initialCreateWithPreFill.relatedOpportunityId) setFormOppId(initialCreateWithPreFill.relatedOpportunityId);
      if (initialCreateWithPreFill.relatedProductId) setFormProdId(initialCreateWithPreFill.relatedProductId);
      if (initialCreateWithPreFill.meetingDate) setFormDate(initialCreateWithPreFill.meetingDate);
      if (initialCreateWithPreFill.startTime) setFormStartTime(initialCreateWithPreFill.startTime);
      if (initialCreateWithPreFill.endTime) setFormEndTime(initialCreateWithPreFill.endTime);
      if (initialCreateWithPreFill.location) setFormLocation(initialCreateWithPreFill.location);
      if (initialCreateWithPreFill.meetingMode) setFormMode(initialCreateWithPreFill.meetingMode);
      if (initialCreateWithPreFill.priority) setFormPriority(initialCreateWithPreFill.priority);
      
      setFormOrganizer(currentUserName());
      setFormParticipants([currentUserName(), initialCreateWithPreFill.contactPerson || 'Representative']);

      setEditingMeeting(null);
      setIsFormModalOpen(true);
      if (onClearPreFill) onClearPreFill();
    }
  }, [initialCreateWithPreFill]);

  // Handle storage-based prefill fallback for decoupled modules
  useEffect(() => {
    try {
      const savedPrefill = appStore.getItem('realtyconnect_prefill_meeting');
      if (savedPrefill) {
        const data = JSON.parse(savedPrefill);
        appStore.removeItem('realtyconnect_prefill_meeting');
        resetFormFields();
        if (data.title) setFormTitle(data.title);
        if (data.meetingType) setFormType(data.meetingType);
        if (data.relatedCompany) setFormCompany(data.relatedCompany);
        if (data.companyId) setFormCompanyId(data.companyId);
        if (data.contactPerson) setFormContactPerson(data.contactPerson);
        if (data.relatedLeadId) setFormLeadId(data.relatedLeadId);
        if (data.relatedRfqId) setFormRfqId(data.relatedRfqId);
        if (data.relatedOpportunityId) setFormOppId(data.relatedOpportunityId);
        if (data.relatedProductId) setFormProdId(data.relatedProductId);
        if (data.meetingDate) setFormDate(data.meetingDate);
        if (data.startTime) setFormStartTime(data.startTime);
        if (data.endTime) setFormEndTime(data.endTime);
        if (data.location) setFormLocation(data.location);
        if (data.meetingMode) setFormMode(data.meetingMode);
        if (data.priority) setFormPriority(data.priority);
        setFormParticipants([currentUserName(), data.contactPerson || 'Representative']);
        setEditingMeeting(null);
        setIsFormModalOpen(true);
      }
    } catch (e) {}
  }, []);

  const resetFormFields = () => {
    setFormTitle('');
    setFormType('Business Meeting');
    setFormCompany('');
    setFormCompanyId('');
    setFormContactPerson('');
    setFormOrganizer(currentUserName());
    setFormParticipants([currentUserName()]);
    setParticipantInput('');
    setFormLeadId('');
    setFormRfqId('');
    setFormOppId('');
    setFormProdId('');
    setFormDate('2026-07-19');
    setFormStartTime('10:00');
    setFormEndTime('11:00');
    setFormLocation('');
    setFormMode('In Person');
    setFormPriority('Normal');
    setFormStatus('Scheduled');
    setFormAgenda('');
    setFormNotes('');
    setFormReminder('30 Minutes Before');
  };

  const openCreateModal = () => {
    resetFormFields();
    setEditingMeeting(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (meeting: CalendarMeeting) => {
    setEditingMeeting(meeting);
    setFormTitle(meeting.title);
    setFormType(meeting.meetingType);
    setFormCompany(meeting.relatedCompany);
    setFormCompanyId(meeting.companyId || '');
    setFormContactPerson(meeting.contactPerson);
    setFormOrganizer(meeting.organizer);
    setFormParticipants(meeting.participants);
    setFormLeadId(meeting.relatedLeadId || '');
    setFormRfqId(meeting.relatedRfqId || '');
    setFormOppId(meeting.relatedOpportunityId || '');
    setFormProdId(meeting.relatedProductId || '');
    setFormDate(meeting.meetingDate);
    setFormStartTime(meeting.startTime);
    setFormEndTime(meeting.endTime);
    setFormLocation(meeting.location);
    setFormMode(meeting.meetingMode);
    setFormPriority(meeting.priority);
    setFormStatus(meeting.status);
    setFormAgenda(meeting.agenda);
    setFormNotes(meeting.notes);
    setFormReminder(meeting.reminderTime);
    setIsFormModalOpen(true);
  };

  const saveMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formCompany || !formDate || !formStartTime || !formEndTime) {
      showToast('Please fill out all required scheduling parameters.', 'error');
      return;
    }

    if (editingMeeting) {
      // Edit mode
      const updatedMeetings = meetings.map(m => {
        if (m.id === editingMeeting.id) {
          const wasStatus = m.status;
          const statusChanged = wasStatus !== formStatus;
          
          if (statusChanged) {
            triggerNotification(
              formStatus === 'Cancelled' ? 'cancelled' : formStatus === 'Completed' ? 'completed' : 'updated',
              formTitle,
              formCompany,
              `${formDate} ${formStartTime}`
            );
          }

          return {
            ...m,
            title: formTitle,
            meetingType: formType,
            relatedCompany: formCompany,
            companyId: formCompanyId,
            contactPerson: formContactPerson,
            organizer: formOrganizer,
            participants: formParticipants,
            relatedLeadId: formLeadId || undefined,
            relatedRfqId: formRfqId || undefined,
            relatedOpportunityId: formOppId || undefined,
            relatedProductId: formProdId || undefined,
            meetingDate: formDate,
            startTime: formStartTime,
            endTime: formEndTime,
            location: formLocation,
            meetingMode: formMode,
            priority: formPriority,
            status: formStatus,
            agenda: formAgenda,
            notes: formNotes,
            reminderTime: formReminder
          };
        }
        return m;
      });

      setMeetings(updatedMeetings);
      showToast(`Meeting "${formTitle}" updated successfully.`, 'success');
      onLogTriggered('MEETING_UPDATED', 'meetings', editingMeeting.id, 'SUCCESS', `Updated meeting metadata & reminders for ${formTitle}`);
    } else {
      // Create mode
      const newMeetingId = `RC-MT-${Date.now().toString().slice(-4)}`;
      const newMeeting: CalendarMeeting = {
        id: newMeetingId,
        title: formTitle,
        meetingType: formType,
        relatedCompany: formCompany,
        companyId: formCompanyId || 'company-custom',
        contactPerson: formContactPerson,
        organizer: formOrganizer,
        participants: formParticipants,
        relatedLeadId: formLeadId || undefined,
        relatedRfqId: formRfqId || undefined,
        relatedOpportunityId: formOppId || undefined,
        relatedProductId: formProdId || undefined,
        meetingDate: formDate,
        startTime: formStartTime,
        endTime: formEndTime,
        location: formLocation,
        meetingMode: formMode,
        priority: formPriority,
        status: 'Scheduled',
        agenda: formAgenda,
        notes: formNotes,
        discussionPoints: [],
        actionItems: [],
        followUpTasks: [],
        reminderTime: formReminder,
        attachments: []
      };

      setMeetings([newMeeting, ...meetings]);
      setSelectedMeetingId(newMeetingId);
      triggerNotification('scheduled', formTitle, formCompany, `${formDate} ${formStartTime}`);
      showToast(`Appointment registered for ${formCompany}!`, 'success');
      onLogTriggered('MEETING_SCHEDULED', 'meetings', newMeetingId, 'SUCCESS', `Created calendar appointment: ${formTitle}`);
    }

    setIsFormModalOpen(false);
  };

  const deleteMeeting = (meetingId: string) => {
    const target = meetings.find(m => m.id === meetingId);
    if (!target) return;
    
    if (confirm(`Are you sure you want to completely delete meeting: "${target.title}"?`)) {
      setMeetings(meetings.filter(m => m.id !== meetingId));
      if (selectedMeetingId === meetingId) {
        setSelectedMeetingId(meetings.length > 1 ? meetings.find(m => m.id !== meetingId)?.id || null : null);
      }
      showToast('Meeting appointment purged from calendar.', 'info');
      onLogTriggered('MEETING_DELETED', 'meetings', meetingId, 'SUCCESS', `Purged appointment: ${target.title}`);
    }
  };

  const handleAddRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const cleanTerm = term.trim();
    const updated = [cleanTerm, ...recentSearches.filter(s => s !== cleanTerm)].slice(0, 5);
    setRecentSearches(updated);
    appStore.setItem('realtyconnect_meeting_search_history', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    appStore.removeItem('realtyconnect_meeting_search_history');
    showToast('Search history cleared.', 'info');
  };

  // Add agenda points
  const appendDiscussionPoint = () => {
    if (!newDiscussionPoint.trim() || !selectedMeeting) return;
    const updated = meetings.map(m => {
      if (m.id === selectedMeeting.id) {
        return { ...m, discussionPoints: [...m.discussionPoints, newDiscussionPoint.trim()] };
      }
      return m;
    });
    setMeetings(updated);
    setNewDiscussionPoint('');
    showToast('Added discussion point.', 'success');
    onLogTriggered('MEETING_AGENDA_MODIFIED', 'meetings', selectedMeeting.id, 'SUCCESS', `Added agenda point to ${selectedMeeting.title}`);
  };

  const appendActionItem = () => {
    if (!newActionItem.trim() || !selectedMeeting) return;
    const updated = meetings.map(m => {
      if (m.id === selectedMeeting.id) {
        return { ...m, actionItems: [...m.actionItems, newActionItem.trim()] };
      }
      return m;
    });
    setMeetings(updated);
    setNewActionItem('');
    showToast('Action item assigned.', 'success');
  };

  const appendFollowUpTask = () => {
    if (!newFollowUpTask.trim() || !selectedMeeting) return;
    const updated = meetings.map(m => {
      if (m.id === selectedMeeting.id) {
        return { ...m, followUpTasks: [...m.followUpTasks, newFollowUpTask.trim()] };
      }
      return m;
    });
    setMeetings(updated);
    setNewFollowUpTask('');
    showToast('Logged follow-up task.', 'success');
  };

  // Quick Action: Complete meeting
  const markAsCompleted = (meetingId: string) => {
    const updated = meetings.map(m => {
      if (m.id === meetingId) {
        return { ...m, status: 'Completed' as const };
      }
      return m;
    });
    setMeetings(updated);
    showToast('Meeting marked as Completed!', 'success');
    triggerNotification('completed', selectedMeeting?.title || '', selectedMeeting?.relatedCompany || '', '');
    onLogTriggered('MEETING_COMPLETED', 'meetings', meetingId, 'SUCCESS', `Marked appointment as completed.`);
  };

  // Quick Action: Cancel meeting
  const markAsCancelled = (meetingId: string) => {
    const updated = meetings.map(m => {
      if (m.id === meetingId) {
        return { ...m, status: 'Cancelled' as const };
      }
      return m;
    });
    setMeetings(updated);
    showToast('Meeting cancelled.', 'error');
    triggerNotification('cancelled', selectedMeeting?.title || '', selectedMeeting?.relatedCompany || '', '');
    onLogTriggered('MEETING_CANCELLED', 'meetings', meetingId, 'SUCCESS', `Cancelled scheduled appointment.`);
  };

  // Schedule follow-up meeting action
  const saveFollowUpMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeeting) return;
    if (!followUpTitle) {
      showToast('Please provide a title for the follow-up session.', 'error');
      return;
    }

    const newMeetingId = `RC-MT-${Date.now().toString().slice(-4)}`;
    const newMeeting: CalendarMeeting = {
      id: newMeetingId,
      title: followUpTitle,
      meetingType: 'Client Discussion',
      relatedCompany: selectedMeeting.relatedCompany,
      companyId: selectedMeeting.companyId,
      contactPerson: selectedMeeting.contactPerson,
      organizer: currentUserName(),
      participants: selectedMeeting.participants,
      relatedLeadId: selectedMeeting.relatedLeadId,
      relatedRfqId: selectedMeeting.relatedRfqId,
      relatedOpportunityId: selectedMeeting.relatedOpportunityId,
      relatedProductId: selectedMeeting.relatedProductId,
      meetingDate: followUpDate,
      startTime: followUpStartTime,
      endTime: followUpEndTime,
      location: selectedMeeting.location,
      meetingMode: selectedMeeting.meetingMode,
      priority: 'High',
      status: 'Scheduled',
      agenda: `Follow-up to check progress of: "${selectedMeeting.title}". Notes: ${followUpNotes}`,
      notes: '',
      discussionPoints: [],
      actionItems: [],
      followUpTasks: [],
      reminderTime: '1 Hour Before',
      attachments: []
    };

    setMeetings([newMeeting, ...meetings]);
    setSelectedMeetingId(newMeetingId);
    setShowFollowUpForm(false);
    setFollowUpTitle('');
    setFollowUpNotes('');
    
    showToast(`Follow-up meeting registered for ${followUpDate}!`, 'success');
    onLogTriggered('MEETING_FOLLOW_UP_SCHEDULED', 'meetings', newMeetingId, 'SUCCESS', `Scheduled follow-up meeting linked to parent ${selectedMeeting.id}`);
  };

  // Search filter and sorter pipeline
  const filteredMeetings = meetings.filter(m => {
    // Search terms
    const s = searchTerm.toLowerCase();
    const matchesSearch = 
      m.title.toLowerCase().includes(s) ||
      m.relatedCompany.toLowerCase().includes(s) ||
      m.contactPerson.toLowerCase().includes(s) ||
      m.participants.some(p => p.toLowerCase().includes(s)) ||
      (m.relatedLeadId && m.relatedLeadId.toLowerCase().includes(s)) ||
      (m.relatedRfqId && m.relatedRfqId.toLowerCase().includes(s)) ||
      (m.relatedProductId && m.relatedProductId.toLowerCase().includes(s)) ||
      (m.relatedOpportunityId && m.relatedOpportunityId.toLowerCase().includes(s));

    // Filters
    const matchesType = filterMeetingType === 'all' || m.meetingType === filterMeetingType;
    const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || m.priority === filterPriority;
    const matchesOrganizer = filterOrganizer === 'all' || m.organizer.toLowerCase().includes(filterOrganizer.toLowerCase());
    const matchesCompany = filterCompany === 'all' || m.relatedCompany === filterCompany;
    const matchesMode = filterMode === 'all' || m.meetingMode === filterMode;

    return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesOrganizer && matchesCompany && matchesMode;
  });

  // Calendar specific filter view sets
  const getCalendarSet = () => {
    const todayStr = '2026-07-19'; // Today reference in the system metadata
    if (calendarView === 'today') {
      return filteredMeetings.filter(m => m.meetingDate === todayStr);
    } else if (calendarView === 'upcoming') {
      return filteredMeetings.filter(m => m.meetingDate >= todayStr && m.status !== 'Completed' && m.status !== 'Cancelled');
    } else if (calendarView === 'agenda') {
      // Return everything sorted chronologically
      return [...filteredMeetings].sort((a,b) => a.meetingDate.localeCompare(b.meetingDate));
    }
    return filteredMeetings;
  };

  const calendarSet = getCalendarSet();

  // Sorting pipeline
  const sortedMeetings = [...calendarSet].sort((a, b) => {
    if (sortBy === 'date-asc') {
      return `${a.meetingDate} ${a.startTime}`.localeCompare(`${b.meetingDate} ${b.startTime}`);
    } else if (sortBy === 'date-desc') {
      return `${b.meetingDate} ${b.startTime}`.localeCompare(`${a.meetingDate} ${a.startTime}`);
    } else if (sortBy === 'priority-high') {
      const pLevel = { Urgent: 4, High: 3, Normal: 2, Low: 1 };
      return (pLevel[b.priority] || 0) - (pLevel[a.priority] || 0);
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  // Pagination pipeline
  const totalPages = Math.ceil(sortedMeetings.length / itemsPerPage);
  const paginatedMeetings = sortedMeetings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Statistics for Profile integration / Dashboard Widgets
  const totalScheduled = meetings.filter(m => m.status === 'Scheduled' || m.status === 'Confirmed').length;
  const totalCompleted = meetings.filter(m => m.status === 'Completed').length;
  const totalInProg = meetings.filter(m => m.status === 'In Progress').length;
  const pendingConfirmations = meetings.filter(m => m.status === 'Scheduled').length;

  // Calendar Month view generation helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay(); // 0 is Sunday
  };

  const generateMonthDays = () => {
    const numDays = getDaysInMonth(currentCalendarDate);
    const firstDay = getFirstDayOfMonth(currentCalendarDate);
    const dayArray = [];

    // Pad previous month's days
    for (let i = 0; i < firstDay; i++) {
      dayArray.push({ type: 'empty', dayNum: null });
    }

    // Current month's days
    for (let d = 1; d <= numDays; d++) {
      dayArray.push({ type: 'current', dayNum: d });
    }

    return dayArray;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentCalendarDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentCalendarDate(newDate);
  };

  // Format Helper for Year/Month title
  const getCalendarTitle = () => {
    return currentCalendarDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const getPriorityColor = (priority: CalendarMeeting['priority']) => {
    switch (priority) {
      case 'Urgent': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'High': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Normal': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Low': return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const getStatusColor = (status: CalendarMeeting['status']) => {
    switch (status) {
      case 'Scheduled': return 'text-sky-400 bg-sky-950/40 border border-sky-800/50';
      case 'Confirmed': return 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/50';
      case 'Rescheduled': return 'text-amber-400 bg-amber-950/40 border border-amber-800/50';
      case 'In Progress': return 'text-indigo-400 bg-indigo-950/40 border border-indigo-800/50 animate-pulse';
      case 'Completed': return 'text-slate-400 bg-slate-800/50 border border-slate-700/50';
      case 'Cancelled': return 'text-rose-400 bg-rose-950/40 border border-rose-800/50';
      case 'No Show': return 'text-purple-400 bg-purple-950/40 border border-purple-800/50';
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full text-slate-100 font-sans" id="meetings_module_root">
      {/* Visual Header */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-indigo-600 text-white flex items-center justify-center shadow-lg">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800/40 tracking-widest font-bold uppercase">Calendar</span>
              <span className="font-mono text-[9px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-800 tracking-wider">Enterprise Scheduling</span>
            </div>
            <h1 className="text-xl font-bold font-display mt-1 text-white tracking-tight flex items-center gap-2">
              Meetings & Calendar Engine
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
              Organize inspections, commercial site audits, supplier negotiations, and product demos across your RealityConnect ecosystem.
            </p>
          </div>
        </div>

        {/* Dynamic KPI Widget Strip */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-950/60 border border-slate-800/60 p-3 rounded-xl md:self-stretch">
          <div className="px-3 border-r border-slate-800">
            <span className="block text-[9px] uppercase tracking-wider font-mono text-slate-500">Today's Meetings</span>
            <span className="text-sm font-bold font-mono text-emerald-400">
              {meetings.filter(m => m.meetingDate === '2026-07-19').length}
            </span>
          </div>
          <div className="px-3 border-r border-slate-800">
            <span className="block text-[9px] uppercase tracking-wider font-mono text-slate-500">Upcoming</span>
            <span className="text-sm font-bold font-mono text-sky-400">{totalScheduled}</span>
          </div>
          <div className="px-3 border-r border-slate-800">
            <span className="block text-[9px] uppercase tracking-wider font-mono text-slate-500">Completed</span>
            <span className="text-sm font-bold font-mono text-slate-400">{totalCompleted}</span>
          </div>
          <div className="px-3">
            <span className="block text-[9px] uppercase tracking-wider font-mono text-slate-500">Pending Confirm</span>
            <span className="text-sm font-bold font-mono text-amber-400">{pendingConfirmations}</span>
          </div>
        </div>
      </div>

      {/* Main Calendar Navigation & Actions Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          {/* Main Module Tabs */}
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-lg font-mono text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'calendar'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Calendar Grid
          </button>
          
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-lg font-mono text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'directory'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Meeting Directory
          </button>

          {activeTab === 'calendar' && (
            <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-lg ml-2">
              {(['month', 'week', 'day', 'agenda', 'upcoming', 'today'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setCalendarView(v)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold capitalize transition-all cursor-pointer ${
                    calendarView === v
                      ? 'bg-slate-800 text-emerald-400'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Universal Search block */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search meetings, companies, organizers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddRecentSearch(searchTerm);
              }}
              className="pl-9 pr-4 py-2 w-64 md:w-80 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-emerald-500 font-mono transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              showFilters || filterMeetingType !== 'all' || filterStatus !== 'all' || filterPriority !== 'all'
                ? 'bg-indigo-950/40 border-indigo-500/60 text-indigo-400'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Advanced Filters"
          >
            <Filter className="w-4 h-4" />
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-mono text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Schedule Meeting
          </button>
        </div>
      </div>

      {/* Advanced Filter Drawer */}
      {showFilters && (
        <div className="bg-slate-950 border border-indigo-950/80 p-5 rounded-xl grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">Meeting Type</label>
            <select
              value={filterMeetingType}
              onChange={(e) => setFilterMeetingType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="Business Meeting">Business Meeting</option>
              <option value="Sales Meeting">Sales Meeting</option>
              <option value="Client Discussion">Client Discussion</option>
              <option value="Vendor Meeting">Vendor Meeting</option>
              <option value="Supplier Meeting">Supplier Meeting</option>
              <option value="RFQ Discussion">RFQ Discussion</option>
              <option value="Marketplace Product Demo">Product Demo</option>
              <option value="Opportunity Discussion">Opportunity Discussion</option>
              <option value="Partnership Meeting">Partnership Meeting</option>
              <option value="Networking Meeting">Networking Meeting</option>
              <option value="Site Visit">Site Visit</option>
              <option value="Online Meeting">Online Meeting</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Rescheduled">Rescheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="No Show">No Show</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">Organizer</label>
            <input
              type="text"
              placeholder="Filter organizer..."
              value={filterOrganizer === 'all' ? '' : filterOrganizer}
              onChange={(e) => setFilterOrganizer(e.target.value || 'all')}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">Mode</label>
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Modes</option>
              <option value="In Person">In Person</option>
              <option value="Video Call">Video Call</option>
              <option value="Voice Call">Voice Call</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterMeetingType('all');
                setFilterStatus('all');
                setFilterPriority('all');
                setFilterOrganizer('all');
                setFilterCompany('all');
                setFilterMode('all');
                setSearchTerm('');
                showToast('Scheduling filters cleared.', 'info');
              }}
              className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-lg font-mono text-[9px] uppercase font-bold tracking-wider cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Recent Searches history block */}
      {recentSearches.length > 0 && (
        <div className="flex items-center gap-2 px-2">
          <span className="text-[10px] text-slate-500 font-mono">Recent:</span>
          <div className="flex flex-wrap gap-1.5">
            {recentSearches.map((hist, i) => (
              <button
                key={i}
                onClick={() => setSearchTerm(hist)}
                className="bg-slate-900 hover:bg-slate-850 hover:text-slate-300 text-slate-400 text-[10px] px-2 py-0.5 rounded border border-slate-800/80 font-mono cursor-pointer"
              >
                {hist}
              </button>
            ))}
            <button
              onClick={clearRecentSearches}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono underline ml-1 cursor-pointer"
            >
              Clear History
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Layout (Two columns: list/view grid vs details card panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Directory or Calendar Grid */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {activeTab === 'calendar' ? (
            /* CALENDAR VIEW ENGINE */
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
              
              {/* Calendar Month Selector Header */}
              {calendarView === 'month' && (
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <h2 className="text-sm font-mono font-bold text-slate-100 uppercase tracking-wider">
                      {getCalendarTitle()}
                    </h2>
                    <button
                      onClick={() => navigateMonth('next')}
                      className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => setCurrentCalendarDate(new Date('2026-07-19'))}
                    className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase text-indigo-400 bg-indigo-950/20 border border-indigo-900/40 rounded hover:bg-indigo-900/30 cursor-pointer"
                  >
                    Go To Today
                  </button>
                </div>
              )}

              {/* RENDER VIEW: Monthly Grid */}
              {calendarView === 'month' && (
                <div className="flex flex-col gap-1">
                  {/* Days of week */}
                  <div className="grid grid-cols-7 text-center font-mono text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800/40 pb-2">
                    <div>Sun</div>
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                  </div>

                  {/* Date Grid */}
                  <div className="grid grid-cols-7 gap-1.5 pt-1.5">
                    {generateMonthDays().map((day, idx) => {
                      const isToday = day.type === 'current' && day.dayNum === 19 && currentCalendarDate.getMonth() === 6 && currentCalendarDate.getFullYear() === 2026;
                      const dateStr = day.dayNum 
                        ? `2026-07-${day.dayNum.toString().padStart(2, '0')}` 
                        : '';
                      
                      const dayMeetings = day.dayNum 
                        ? filteredMeetings.filter(m => m.meetingDate === dateStr) 
                        : [];

                      return (
                        <div
                          key={idx}
                          className={`min-h-[72px] p-1.5 rounded-lg border flex flex-col justify-between transition-all ${
                            day.type === 'empty' 
                              ? 'bg-slate-950/20 border-slate-950/20 text-slate-800 pointer-events-none' 
                              : isToday
                                ? 'bg-indigo-950/30 border-indigo-500/50 text-slate-100'
                                : 'bg-slate-950 border-slate-850 hover:border-slate-700 text-slate-400'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className={`text-[10px] font-mono font-bold ${isToday ? 'text-indigo-400' : 'text-slate-400'}`}>
                              {day.dayNum}
                            </span>
                            {dayMeetings.length > 0 && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            )}
                          </div>

                          <div className="flex flex-col gap-1 mt-1 overflow-hidden">
                            {dayMeetings.slice(0, 2).map(m => (
                              <button
                                key={m.id}
                                onClick={() => setSelectedMeetingId(m.id)}
                                className={`text-[8px] font-mono tracking-tight text-left truncate px-1 py-0.5 rounded leading-tight ${
                                  m.id === selectedMeetingId 
                                    ? 'bg-emerald-500 text-slate-950 font-bold' 
                                    : 'bg-slate-900 text-slate-300 hover:bg-slate-850'
                                }`}
                                title={m.title}
                              >
                                {m.startTime} {m.title.slice(0, 10)}...
                              </button>
                            ))}
                            {dayMeetings.length > 2 && (
                              <span className="text-[8px] font-mono text-slate-500 text-right">+{dayMeetings.length - 2} more</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* RENDER VIEW: Weekly & Daily Slots / Agenda */}
              {calendarView === 'week' && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                    Week of July 19 - July 25, 2026
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                    {['2026-07-19', '2026-07-20', '2026-07-21', '2026-07-22', '2026-07-23', '2026-07-24', '2026-07-25'].map((dStr, idx) => {
                      const dayMeetings = filteredMeetings.filter(m => m.meetingDate === dStr);
                      const displayDay = new Date(dStr).toLocaleDateString('default', { weekday: 'short', day: 'numeric' });
                      const isToday = dStr === '2026-07-19';

                      return (
                        <div key={idx} className={`p-2.5 rounded-lg border ${isToday ? 'bg-indigo-950/20 border-indigo-500/40' : 'bg-slate-950 border-slate-850'}`}>
                          <div className="text-[10px] font-mono font-bold text-slate-400 border-b border-slate-800 pb-1 mb-1.5 text-center">
                            {displayDay}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            {dayMeetings.length === 0 ? (
                              <div className="text-[9px] text-slate-600 font-mono text-center py-4">No appointments</div>
                            ) : (
                              dayMeetings.map(m => (
                                <div
                                  key={m.id}
                                  onClick={() => setSelectedMeetingId(m.id)}
                                  className={`p-1.5 rounded text-[9px] font-mono border transition-all cursor-pointer ${
                                    m.id === selectedMeetingId 
                                      ? 'bg-emerald-500 text-slate-950 border-emerald-400' 
                                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                                  }`}
                                >
                                  <div className="font-bold truncate">{m.title}</div>
                                  <div className="text-[8px] opacity-80 mt-0.5">{m.startTime} - {m.endTime}</div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* RENDER VIEW: Daily View */}
              {calendarView === 'day' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                      Chrono Schedule: July 19, 2026 (Today)
                    </h3>
                  </div>
                  <div className="flex flex-col gap-2">
                    {filteredMeetings.filter(m => m.meetingDate === '2026-07-19').length === 0 ? (
                      <div className="text-xs text-slate-500 font-mono py-12 text-center">No meetings scheduled for today.</div>
                    ) : (
                      filteredMeetings
                        .filter(m => m.meetingDate === '2026-07-19')
                        .sort((a,b) => a.startTime.localeCompare(b.startTime))
                        .map(m => (
                          <div
                            key={m.id}
                            onClick={() => setSelectedMeetingId(m.id)}
                            className={`p-3 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                              m.id === selectedMeetingId 
                                ? 'bg-indigo-950/40 border-indigo-500/60 text-slate-100' 
                                : 'bg-slate-950 border-slate-850 hover:border-slate-800 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[10px] font-mono text-emerald-400">
                                {m.startTime} - {m.endTime}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold">{m.title}</h4>
                                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{m.relatedCompany} • {m.meetingType}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[8px] font-mono px-2 py-0.5 rounded font-bold uppercase ${getPriorityColor(m.priority)}`}>
                                {m.priority}
                              </span>
                              <span className={`text-[8px] font-mono px-2 py-0.5 rounded border ${getStatusColor(m.status)}`}>
                                {m.status}
                              </span>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}

              {/* RENDER VIEW: Agenda / Upcoming / Today list views */}
              {(calendarView === 'agenda' || calendarView === 'upcoming' || calendarView === 'today') && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                      {calendarView === 'agenda' ? 'Complete Schedule Timeline' : calendarView === 'upcoming' ? 'All Pending Upcoming Sessions' : 'Appointments Registered Today'}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">({sortedMeetings.length} records found)</span>
                  </div>

                  <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1">
                    {sortedMeetings.length === 0 ? (
                      <div className="text-xs text-slate-500 font-mono py-12 text-center">No matching appointment records located.</div>
                    ) : (
                      sortedMeetings.map(m => (
                        <div
                          key={m.id}
                          onClick={() => setSelectedMeetingId(m.id)}
                          className={`p-3 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all cursor-pointer ${
                            m.id === selectedMeetingId 
                              ? 'bg-slate-950 border-emerald-500 text-slate-100 shadow-md' 
                              : 'bg-slate-950 border-slate-850 hover:border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex flex-col items-center bg-slate-900 border border-slate-800 p-2 rounded text-center min-w-[56px]">
                              <span className="block text-[8px] font-mono text-slate-500 uppercase">
                                {new Date(m.meetingDate).toLocaleDateString('default', { month: 'short' })}
                              </span>
                              <span className="block text-sm font-bold font-mono text-slate-200">
                                {new Date(m.meetingDate).getDate()}
                              </span>
                              <span className="block text-[8px] font-mono text-emerald-400 mt-1">{m.startTime}</span>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold leading-snug">{m.title}</h4>
                              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                                Company: <span className="text-slate-300 font-semibold">{m.relatedCompany}</span>
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[9px] font-mono text-indigo-400">{m.meetingType}</span>
                                <span className="text-slate-600">•</span>
                                <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
                                  <MapPin className="w-2.5 h-2.5" />
                                  {m.meetingMode}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center md:flex-col items-end gap-2 self-end md:self-auto">
                            <span className={`text-[8px] font-mono px-2 py-0.5 rounded font-bold uppercase ${getPriorityColor(m.priority)}`}>
                              {m.priority}
                            </span>
                            <span className={`text-[8px] font-mono px-2 py-0.5 rounded border ${getStatusColor(m.status)}`}>
                              {m.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* DIRECTORY VIEW ENGINE */
            <div className="flex flex-col gap-4">
              
              {/* Directory Sub-Header */}
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800/80 p-3.5 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 rounded p-1 text-[11px] text-slate-300 font-mono"
                  >
                    <option value="date-asc">Date: Soonest First</option>
                    <option value="date-desc">Date: Latest First</option>
                    <option value="priority-high">Priority: Highest</option>
                    <option value="title">Alphabetical Title</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 p-1 rounded-lg">
                  <button
                    onClick={() => setDirectoryViewMode('card')}
                    className={`p-1.5 rounded transition-all cursor-pointer ${
                      directoryViewMode === 'card' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDirectoryViewMode('list')}
                    className={`p-1.5 rounded transition-all cursor-pointer ${
                      directoryViewMode === 'list' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Grid / List render content */}
              {paginatedMeetings.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 font-mono text-xs">
                  No meetings match your directory search filters.
                </div>
              ) : directoryViewMode === 'card' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paginatedMeetings.map(m => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMeetingId(m.id)}
                      className={`bg-slate-900 border rounded-xl p-4 flex flex-col justify-between gap-4 transition-all hover:border-slate-700 cursor-pointer ${
                        m.id === selectedMeetingId ? 'border-emerald-500 ring-1 ring-emerald-500/20' : 'border-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] font-mono text-slate-500 tracking-wider uppercase">ID: {m.id}</span>
                          <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${getPriorityColor(m.priority)}`}>
                            {m.priority}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-slate-100 mt-1.5 line-clamp-1">{m.title}</h3>
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">{m.relatedCompany}</p>
                        
                        <div className="flex items-center gap-2 mt-3">
                          <Calendar className="w-3 h-3 text-emerald-500" />
                          <span className="text-[10px] text-slate-300 font-mono">{m.meetingDate} at {m.startTime}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <MapPin className="w-3 h-3 text-indigo-400" />
                          <span className="text-[10px] text-slate-300 truncate max-w-[200px]">{m.location || m.meetingMode}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 mt-2">
                        <span className={`text-[8px] font-mono px-2 py-0.5 rounded border ${getStatusColor(m.status)}`}>
                          {m.status}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-mono">
                          <span>Inspect details</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Compact Directory List */
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                  <table className="w-full text-left font-mono text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                        <th className="p-3">Ref ID</th>
                        <th className="p-3">Meeting Title & Partner</th>
                        <th className="p-3">Date & Time</th>
                        <th className="p-3">Type</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedMeetings.map(m => (
                        <tr
                          key={m.id}
                          onClick={() => setSelectedMeetingId(m.id)}
                          className={`border-b border-slate-800/40 hover:bg-slate-850/40 cursor-pointer transition-all ${
                            m.id === selectedMeetingId ? 'bg-slate-950 text-slate-100' : 'text-slate-300'
                          }`}
                        >
                          <td className="p-3 text-slate-500 font-bold">{m.id}</td>
                          <td className="p-3">
                            <div className="font-bold font-sans text-xs text-slate-200">{m.title}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{m.relatedCompany} • contact: {m.contactPerson}</div>
                          </td>
                          <td className="p-3 text-slate-400">
                            <div>{m.meetingDate}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{m.startTime} - {m.endTime}</div>
                          </td>
                          <td className="p-3">
                            <span className="text-indigo-400">{m.meetingType}</span>
                          </td>
                          <td className="p-3 text-right">
                            <span className={`inline-block text-[8px] font-mono px-2 py-0.5 rounded border ${getStatusColor(m.status)}`}>
                              {m.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Controller */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-xl mt-2">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Showing Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-2.5 py-1 text-[10px] font-mono font-bold bg-slate-950 hover:bg-slate-850 text-slate-400 rounded border border-slate-800 disabled:opacity-50 cursor-pointer"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-2.5 py-1 text-[10px] font-mono font-bold bg-slate-950 hover:bg-slate-850 text-slate-400 rounded border border-slate-800 disabled:opacity-50 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Right Side: Meeting Inspection & Agenda Management Panel */}
        <div className="lg:col-span-5">
          {selectedMeeting ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-5 sticky top-6">
              
              {/* Card Title Header with controls */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900/40 font-bold uppercase">{selectedMeeting.meetingType}</span>
                    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${getStatusColor(selectedMeeting.status)}`}>
                      {selectedMeeting.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold font-display text-slate-100 mt-2 leading-snug">{selectedMeeting.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">Reference: <span className="text-slate-300 font-semibold">{selectedMeeting.id}</span></p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(selectedMeeting)}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:text-emerald-400 text-slate-400 cursor-pointer"
                    title="Edit Appointment"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteMeeting(selectedMeeting.id)}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:text-rose-400 text-slate-400 cursor-pointer"
                    title="Delete Appointment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Core Parameters Block */}
              <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-850">
                <div>
                  <span className="block text-[8px] font-mono uppercase text-slate-500 tracking-wider">Date & Duration</span>
                  <span className="text-xs font-semibold text-slate-200 block mt-1 font-mono">
                    {selectedMeeting.meetingDate}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {selectedMeeting.startTime} - {selectedMeeting.endTime}
                  </span>
                </div>

                <div>
                  <span className="block text-[8px] font-mono uppercase text-slate-500 tracking-wider">Related Company</span>
                  <span className="text-xs font-semibold text-indigo-400 block mt-1">
                    {selectedMeeting.relatedCompany}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Contact: {selectedMeeting.contactPerson}</span>
                </div>

                <div>
                  <span className="block text-[8px] font-mono uppercase text-slate-500 tracking-wider">Meeting Location / Mode</span>
                  <span className="text-xs font-semibold text-slate-200 block mt-1 truncate">
                    {selectedMeeting.location || 'Online Bridge'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{selectedMeeting.meetingMode}</span>
                </div>

                <div>
                  <span className="block text-[8px] font-mono uppercase text-slate-500 tracking-wider">Organizer</span>
                  <span className="text-xs font-semibold text-slate-200 block mt-1">
                    {selectedMeeting.organizer}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Remind: {selectedMeeting.reminderTime}</span>
                </div>
              </div>

              {/* Integrated Related Entity Badges (Dynamic cross-module navigation hooks) */}
              <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-950/30 border border-slate-800/50 rounded-lg">
                <span className="text-[9px] font-mono text-slate-500 mr-1.5 uppercase">Linked Ecosystem Modules:</span>
                
                {selectedMeeting.relatedLeadId && (
                  <button
                    onClick={() => {
                      if (setActiveViewMode) {
                        appStore.setItem('realtyconnect_active_lead_id', selectedMeeting.relatedLeadId);
                        setActiveViewMode('lead_management');
                        showToast(`Routing to Lead CRM profile: ${selectedMeeting.relatedLeadId}`, 'success');
                      }
                    }}
                    className="px-2 py-0.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 font-mono text-[8px] uppercase font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Lead CRM</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                )}

                {selectedMeeting.relatedRfqId && (
                  <button
                    onClick={() => {
                      if (setActiveViewMode) {
                        setActiveViewMode('rfq_management');
                        showToast(`Routing to RFQ & Tender: ${selectedMeeting.relatedRfqId}`, 'success');
                      }
                    }}
                    className="px-2 py-0.5 rounded bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 font-mono text-[8px] uppercase font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>RFQ {selectedMeeting.relatedRfqId}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                )}

                {selectedMeeting.relatedOpportunityId && (
                  <button
                    onClick={() => {
                      if (setActiveViewMode) {
                        setActiveViewMode('opportunities');
                        showToast(`Routing to B2B Opportunities Engine`, 'success');
                      }
                    }}
                    className="px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 font-mono text-[8px] uppercase font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Opportunity Hub</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                )}

                {selectedMeeting.relatedProductId && (
                  <button
                    onClick={() => {
                      if (setActiveViewMode) {
                        setActiveViewMode('marketplace');
                        showToast(`Routing to Sourcing Catalogue`, 'success');
                      }
                    }}
                    className="px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-mono text-[8px] uppercase font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Product Catalog</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                )}

                {!selectedMeeting.relatedLeadId && !selectedMeeting.relatedRfqId && !selectedMeeting.relatedOpportunityId && !selectedMeeting.relatedProductId && (
                  <span className="text-[9px] font-mono text-slate-600">No linked business objects.</span>
                )}
              </div>

              {/* Participants list */}
              <div>
                <span className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5">Participants List ({selectedMeeting.participants.length})</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMeeting.participants.map((person, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-950 text-slate-300 text-[10px] rounded border border-slate-800 font-mono flex items-center gap-1">
                      <Users className="w-2.5 h-2.5 text-slate-500" />
                      {person}
                    </span>
                  ))}
                </div>
              </div>

              {/* Agenda & Notes panel */}
              <div className="flex flex-col gap-1 text-xs">
                <span className="block text-[10px] font-mono uppercase text-slate-400">Meeting Agenda / Scope</span>
                <p className="text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-850 italic text-[11px] leading-relaxed">
                  {selectedMeeting.agenda || 'No formal agenda declared. Use the form below to append points.'}
                </p>
              </div>

              {/* INTERACTIVE AGENDA MANAGEMENT */}
              <div className="border-t border-slate-800 pt-4 flex flex-col gap-4">
                
                {/* Discussion Points Section */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="block text-[10px] font-mono uppercase text-slate-400">Discussion Points</span>
                    <span className="text-[9px] font-mono text-slate-600">({selectedMeeting.discussionPoints?.length || 0})</span>
                  </div>
                  <div className="flex flex-col gap-1.5 mb-2 max-h-[110px] overflow-y-auto">
                    {(!selectedMeeting.discussionPoints || selectedMeeting.discussionPoints.length === 0) ? (
                      <span className="text-[10px] text-slate-500 font-mono italic">No key points logged.</span>
                    ) : (
                      selectedMeeting.discussionPoints.map((point, idx) => (
                        <div key={idx} className="flex items-start gap-2 bg-slate-950/40 p-2 rounded text-[11px] border border-slate-850">
                          <span className="text-emerald-500 font-mono font-bold">#{idx + 1}</span>
                          <span className="text-slate-300 leading-tight">{point}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Add key discussion point..."
                      value={newDiscussionPoint}
                      onChange={(e) => setNewDiscussionPoint(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-850 rounded p-1.5 text-[11px] text-slate-300 focus:outline-none"
                    />
                    <button
                      onClick={appendDiscussionPoint}
                      className="px-2.5 bg-indigo-600 hover:bg-indigo-500 rounded text-white text-[10px] font-mono uppercase font-bold cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Action Items Section */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="block text-[10px] font-mono uppercase text-slate-400">Action Items & Deliverables</span>
                    <span className="text-[9px] font-mono text-slate-600">({selectedMeeting.actionItems?.length || 0})</span>
                  </div>
                  <div className="flex flex-col gap-1.5 mb-2 max-h-[110px] overflow-y-auto">
                    {(!selectedMeeting.actionItems || selectedMeeting.actionItems.length === 0) ? (
                      <span className="text-[10px] text-slate-500 font-mono italic">No action items logged.</span>
                    ) : (
                      selectedMeeting.actionItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-950/40 p-2 rounded text-[11px] border border-slate-850">
                          <div className="flex items-center gap-2">
                            <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-slate-300">{item}</span>
                          </div>
                          <span className="text-[9px] font-mono text-emerald-400 uppercase bg-emerald-950 px-1.5 rounded border border-emerald-900/20">Assigned</span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Add deliverable..."
                      value={newActionItem}
                      onChange={(e) => setNewActionItem(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-850 rounded p-1.5 text-[11px] text-slate-300 focus:outline-none"
                    />
                    <button
                      onClick={appendActionItem}
                      className="px-2.5 bg-indigo-600 hover:bg-indigo-500 rounded text-white text-[10px] font-mono uppercase font-bold cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Follow-up Tasks Section */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="block text-[10px] font-mono uppercase text-slate-400">Follow-up Tasks</span>
                    <span className="text-[9px] font-mono text-slate-600">({selectedMeeting.followUpTasks?.length || 0})</span>
                  </div>
                  <div className="flex flex-col gap-1.5 mb-2 max-h-[110px] overflow-y-auto">
                    {(!selectedMeeting.followUpTasks || selectedMeeting.followUpTasks.length === 0) ? (
                      <span className="text-[10px] text-slate-500 font-mono italic">No follow-ups logged yet.</span>
                    ) : (
                      selectedMeeting.followUpTasks.map((task, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-slate-950/40 p-2 rounded text-[11px] border border-slate-850">
                          <Info className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-slate-300">{task}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Add follow-up task..."
                      value={newFollowUpTask}
                      onChange={(e) => setNewFollowUpTask(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-850 rounded p-1.5 text-[11px] text-slate-300 focus:outline-none"
                    />
                    <button
                      onClick={appendFollowUpTask}
                      className="px-2.5 bg-indigo-600 hover:bg-indigo-500 rounded text-white text-[10px] font-mono uppercase font-bold cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

              </div>

              {/* Attachments Section */}
              {selectedMeeting.attachments && selectedMeeting.attachments.length > 0 && (
                <div className="border-t border-slate-800 pt-4">
                  <span className="block text-[10px] font-mono uppercase text-slate-400 mb-2">Attachments (Simulated Files)</span>
                  <div className="flex flex-col gap-1.5">
                    {selectedMeeting.attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-950 p-2.5 rounded border border-slate-850 text-xs">
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-slate-300 font-mono text-[11px] truncate max-w-[200px]">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-mono">{file.size}</span>
                          <button
                            onClick={() => showToast(`Downloading simulated attachment: ${file.name}`, 'info')}
                            className="text-xs text-indigo-400 hover:text-indigo-300 underline font-mono cursor-pointer"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons Footer panel (Follow-up & Close shortcuts) */}
              <div className="border-t border-slate-800 pt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  {selectedMeeting.status !== 'Completed' && selectedMeeting.status !== 'Cancelled' && (
                    <button
                      onClick={() => markAsCompleted(selectedMeeting.id)}
                      className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-mono text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      Complete Meeting
                    </button>
                  )}

                  {selectedMeeting.status !== 'Cancelled' && selectedMeeting.status !== 'Completed' && (
                    <button
                      onClick={() => markAsCancelled(selectedMeeting.id)}
                      className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-mono text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {!showFollowUpForm ? (
                  <button
                    onClick={() => {
                      setFollowUpTitle(`Follow-up Discussion: ${selectedMeeting.title}`);
                      setShowFollowUpForm(true);
                    }}
                    className="w-full py-2 bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-lg font-mono text-[10px] uppercase font-bold tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-400" />
                    Schedule Follow-up Meeting
                  </button>
                ) : (
                  /* Follow-up Inline Form */
                  <form onSubmit={saveFollowUpMeeting} className="bg-slate-950 p-4 rounded-xl border border-indigo-950 flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1">
                      <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">Configure Follow-up</span>
                      <button type="button" onClick={() => setShowFollowUpForm(false)} className="text-slate-500 hover:text-slate-300 cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono uppercase text-slate-500 mb-1">Follow-up Title *</label>
                      <input
                        type="text"
                        value={followUpTitle}
                        onChange={(e) => setFollowUpTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-850 rounded p-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                        placeholder="e.g. Contract Sign Off Meeting"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <label className="block text-[9px] font-mono uppercase text-slate-500 mb-1">Date *</label>
                        <input
                          type="date"
                          value={followUpDate}
                          onChange={(e) => setFollowUpDate(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-850 rounded p-1.5 text-xs text-slate-300 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono uppercase text-slate-500 mb-1">Start *</label>
                        <input
                          type="time"
                          value={followUpStartTime}
                          onChange={(e) => setFollowUpStartTime(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-850 rounded p-1.5 text-xs text-slate-300 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono uppercase text-slate-500 mb-1">End *</label>
                        <input
                          type="time"
                          value={followUpEndTime}
                          onChange={(e) => setFollowUpEndTime(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-850 rounded p-1.5 text-xs text-slate-300 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono uppercase text-slate-500 mb-1">Follow-up Agenda Notes</label>
                      <textarea
                        value={followUpNotes}
                        onChange={(e) => setFollowUpNotes(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-850 rounded p-1.5 text-xs text-slate-300 focus:outline-none h-12"
                        placeholder="Key requirements for this session..."
                      />
                    </div>

                    <div className="flex gap-2 justify-end mt-1">
                      <button
                        type="button"
                        onClick={() => setShowFollowUpForm(false)}
                        className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-400 rounded text-[10px] font-mono uppercase cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[10px] font-bold uppercase rounded cursor-pointer"
                      >
                        Confirm Booking
                      </button>
                    </div>
                  </form>
                )}

              </div>

            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500 font-mono text-xs">
              Select any schedule appointment from the directory or grid to inspect agenda and take collaborative actions.
            </div>
          )}
        </div>

      </div>

      {/* FORM MODAL: CREATE / EDIT SCHEDULER */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
            
            {/* Modal Header */}
            <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm text-slate-100 font-sans">
                    {editingMeeting ? `Edit Appointment: ${editingMeeting.id}` : 'Schedule Enterprise Meeting Appointment'}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">RealtyConnect Integrated CRM & Sourcing Ecosystem</p>
                </div>
              </div>
              <button 
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={saveMeeting} className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
              
              {/* Row 1: Title & Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Meeting Title *</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Pre-Bid Concrete Sourcing Negotiation"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Meeting Type *</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                    required
                  >
                    <option value="Business Meeting">Business Meeting</option>
                    <option value="Sales Meeting">Sales Meeting</option>
                    <option value="Client Discussion">Client Discussion</option>
                    <option value="Vendor Meeting">Vendor Meeting</option>
                    <option value="Supplier Meeting">Supplier Meeting</option>
                    <option value="RFQ Discussion">RFQ Discussion</option>
                    <option value="Marketplace Product Demo">Marketplace Product Demo</option>
                    <option value="Opportunity Discussion">Opportunity Discussion</option>
                    <option value="Partnership Meeting">Partnership Meeting</option>
                    <option value="Networking Meeting">Networking Meeting</option>
                    <option value="Site Visit">Site Visit</option>
                    <option value="Online Meeting">Online Meeting (Placeholder)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Company & Contact Person */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Related B2B Company / Partner *</label>
                  <input
                    type="text"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="e.g. Apex Developers Ltd"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Contact Representative *</label>
                  <input
                    type="text"
                    value={formContactPerson}
                    onChange={(e) => setFormContactPerson(e.target.value)}
                    placeholder="e.g. Vikram Malhotra"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Row 3: Linked Objects (RFQ, Opportunity, Lead, Product) */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-4 border-b border-slate-800 pb-2 mb-1">
                  <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">Cross-Module Integration References (Optional)</span>
                </div>
                <div>
                  <label className="block text-[9px] font-mono uppercase text-slate-500 mb-1">Lead Ref ID</label>
                  <input
                    type="text"
                    value={formLeadId}
                    onChange={(e) => setFormLeadId(e.target.value)}
                    placeholder="RC-LE-1004"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[11px] text-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono uppercase text-slate-500 mb-1">RFQ Ref ID</label>
                  <input
                    type="text"
                    value={formRfqId}
                    onChange={(e) => setFormRfqId(e.target.value)}
                    placeholder="rfq-aac-102"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[11px] text-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono uppercase text-slate-500 mb-1">Opp Ref ID</label>
                  <input
                    type="text"
                    value={formOppId}
                    onChange={(e) => setFormOppId(e.target.value)}
                    placeholder="opp-steel-101"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[11px] text-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono uppercase text-slate-500 mb-1">Product ID</label>
                  <input
                    type="text"
                    value={formProdId}
                    onChange={(e) => setFormProdId(e.target.value)}
                    placeholder="prod-ecobricks"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-[11px] text-slate-300 font-mono"
                  />
                </div>
              </div>

              {/* Row 4: Chrono details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Meeting Date *</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Start Time *</label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">End Time *</label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Row 5: Organizer & Mode & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Organizer *</label>
                  <input
                    type="text"
                    value={formOrganizer}
                    onChange={(e) => setFormOrganizer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Meeting Mode *</label>
                  <select
                    value={formMode}
                    onChange={(e) => setFormMode(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="In Person">In Person</option>
                    <option value="Video Call">Video Call</option>
                    <option value="Voice Call">Voice Call</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Priority *</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Row 6: Location & Reminders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Physical Location / Room / Link</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Conference Room 3 or Video Meet Link"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Scheduled Reminder time</label>
                  <select
                    value={formReminder}
                    onChange={(e) => setFormReminder(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="None">None (Do not remind)</option>
                    <option value="15 Minutes Before">15 Minutes Before</option>
                    <option value="30 Minutes Before">30 Minutes Before</option>
                    <option value="1 Hour Before">1 Hour Before</option>
                    <option value="1 Day Before">1 Day Before</option>
                  </select>
                </div>
              </div>

              {/* Participants multi tag element */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Participants List</label>
                <div className="flex flex-wrap gap-1.5 mb-2 bg-slate-950/40 p-2 rounded-lg border border-slate-850">
                  {formParticipants.map((p, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-900 text-slate-300 text-[10px] font-mono rounded border border-slate-800 flex items-center gap-1">
                      {p}
                      <button
                        type="button"
                        onClick={() => setFormParticipants(formParticipants.filter(pName => pName !== p))}
                        className="text-slate-500 hover:text-slate-300 font-bold ml-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {formParticipants.length === 0 && <span className="text-[10px] text-slate-600 font-mono italic">No participants registered.</span>}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type person name and click Add"
                    value={participantInput}
                    onChange={(e) => setParticipantInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (participantInput.trim() && !formParticipants.includes(participantInput.trim())) {
                        setFormParticipants([...formParticipants, participantInput.trim()]);
                        setParticipantInput('');
                      }
                    }}
                    className="px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs rounded-lg cursor-pointer"
                  >
                    Add Partner
                  </button>
                </div>
              </div>

              {/* Row 7: Agenda textarea */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Meeting Agenda / Scope description</label>
                <textarea
                  value={formAgenda}
                  onChange={(e) => setFormAgenda(e.target.value)}
                  placeholder="Draft main discussion points, expectations, and prerequisites..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 h-20"
                />
              </div>

              {/* Modal footer actions */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-5 mt-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800 font-mono text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-mono text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all shadow-md cursor-pointer"
                >
                  {editingMeeting ? 'Save Changes' : 'Confirm & Schedule'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
