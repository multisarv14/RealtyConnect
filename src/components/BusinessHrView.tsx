import { downloadCsv } from '../lib/exportFile';
import React, { useState } from 'react';
import { 
  Search, Users, Building2, Briefcase, Plus, Grid, List, CheckCircle2, 
  X, Mail, Phone, Calendar, Clock, MapPin, Award, PlusCircle, AlertCircle, 
  ChevronRight, ArrowRight, UserPlus, FileText, CheckCircle, RefreshCw, 
  TrendingUp, Trash2, Edit3, MessageSquare, ShieldCheck, Star
} from 'lucide-react';
import { 
  Employee, Department, JobOpening, Candidate, Interview, EmployeeActivity, DocumentRecord 
} from './hrDmsMockData';

interface BusinessHrViewProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  departments: Department[];
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
  openings: JobOpening[];
  setOpenings: React.Dispatch<React.SetStateAction<JobOpening[]>>;
  candidates: Candidate[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  interviews: Interview[];
  setInterviews: React.Dispatch<React.SetStateAction<Interview[]>>;
  activities: EmployeeActivity[];
  setActivities: React.Dispatch<React.SetStateAction<EmployeeActivity[]>>;
  documents: DocumentRecord[];
  addNotification: (type: 'Employee Added' | 'Interview Scheduled' | 'Candidate Selected' | 'Document Uploaded' | 'Document Shared' | 'Document Approved' | 'New Version Available', message: string) => void;
  onLogTriggered: (action: string, entity: string, entityId: string, status: 'SUCCESS' | 'FAILURE' | 'WARNING', details: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function BusinessHrView({
  employees, setEmployees,
  departments, setDepartments,
  openings, setOpenings,
  candidates, setCandidates,
  interviews, setInterviews,
  activities, setActivities,
  documents,
  addNotification,
  onLogTriggered,
  showToast
}: BusinessHrViewProps) {

  // Navigation Sub-tabs inside HR
  const [subTab, setSubTab] = useState<'employees' | 'departments' | 'recruitment' | 'interviews' | 'reports'>('employees');

  // Employee Filter & Layout States
  const [empSearch, setEmpSearch] = useState('');
  const [empDeptFilter, setEmpDeptFilter] = useState('All');
  const [empStatusFilter, setEmpStatusFilter] = useState('All');
  const [empTypeFilter, setEmpTypeFilter] = useState('All');
  const [empLocFilter, setEmpLocFilter] = useState('All');
  const [empLayout, setEmpLayout] = useState<'grid' | 'list'>('grid');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Activity Input
  const [newActivityText, setNewActivityText] = useState('');
  const [newActivityType, setNewActivityType] = useState<'Note' | 'Meeting' | 'Project' | 'Task'>('Note');

  // Candidate Filters
  const [candSearch, setCandSearch] = useState('');
  const [candStatusFilter, setCandStatusFilter] = useState('All');

  // New Employee Modal
  const [isAddEmpOpen, setIsAddEmpOpen] = useState(false);
  const [addEmpForm, setAddEmpForm] = useState({
    name: '',
    department: 'Engineering & Construction',
    designation: '',
    manager: 'Rajeev Malhotra',
    email: '',
    mobile: '',
    employmentType: 'Full-Time' as Employee['employmentType'],
    officeLocation: 'Noida HQ' as Employee['officeLocation'],
    skillsText: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: 'Spouse'
  });

  // New Interview Modal
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    candidateId: '',
    date: '2026-07-20',
    time: '11:00 AM',
    interviewersText: 'Ananya Sharma, Rajeev Malhotra',
    notes: ''
  });

  // New Department Form
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({
    id: '',
    name: '',
    head: '',
    hierarchyLevel: 'Tier-2 Departmental' as Department['hierarchyLevel'],
    parentDept: ''
  });

  // Candidate Pipeline details
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // Pagination states
  const [empPage, setEmpPage] = useState(1);
  const itemsPerPage = 6;

  // Handlers
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addEmpForm.name || !addEmpForm.designation || !addEmpForm.email) {
      showToast('Please fill in required fields.', 'error');
      return;
    }

    const code = `RC-EMP-${Math.floor(200 + Math.random() * 800)}`;
    const newEmp: Employee = {
      id: `EMP-${Date.now().toString().slice(-3)}`,
      code,
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=60', // default photo
      name: addEmpForm.name,
      department: addEmpForm.department,
      designation: addEmpForm.designation,
      manager: addEmpForm.manager,
      email: addEmpForm.email,
      mobile: addEmpForm.mobile || '+91 99999 88888',
      joiningDate: new Date().toISOString().split('T')[0],
      employmentType: addEmpForm.employmentType,
      status: 'Active',
      officeLocation: addEmpForm.officeLocation,
      skills: addEmpForm.skillsText.split(',').map(s => s.trim()).filter(Boolean),
      emergencyContact: {
        name: addEmpForm.emergencyName || 'Secondary Contact',
        relation: addEmpForm.emergencyRelation,
        phone: addEmpForm.emergencyPhone || '+91 98765 43210'
      },
      linkedDocuments: []
    };

    setEmployees(prev => [newEmp, ...prev]);
    
    // Add activity
    const newAct: EmployeeActivity = {
      id: `ACT-${Date.now()}`,
      employeeId: newEmp.id,
      type: 'System',
      title: 'Dossier Created',
      description: `Employee profile officially initialized by HR on joining.`,
      timestamp: new Date().toLocaleString()
    };
    setActivities(prev => [newAct, ...prev]);

    // Update department counts
    setDepartments(prev => prev.map(d => d.name === addEmpForm.department ? { ...d, membersCount: d.membersCount + 1 } : d));

    setIsAddEmpOpen(false);
    showToast(`${newEmp.name} added to ${newEmp.department}!`, 'success');
    addNotification('Employee Added', `New employee ${newEmp.name} (${newEmp.designation}) has been registered.`);
    onLogTriggered('HR_EMPLOYEE_ADDED', 'employees', newEmp.id, 'SUCCESS', `Registered employee ${newEmp.name} - ${newEmp.code}`);
  };

  const handleAddActivity = (empId: string) => {
    if (!newActivityText.trim()) return;

    const newAct: EmployeeActivity = {
      id: `ACT-${Date.now()}`,
      employeeId: empId,
      type: newActivityType,
      title: `${newActivityType} Logged`,
      description: newActivityText,
      timestamp: new Date().toLocaleString()
    };

    setActivities(prev => [newAct, ...prev]);
    setNewActivityText('');
    showToast('Activity logged successfully!', 'success');
    onLogTriggered('HR_ACTIVITY_ADDED', 'employees', empId, 'SUCCESS', `Logged ${newActivityType} for employee`);
  };

  const handleUpdateCandidateStatus = (candId: string, nextStatus: Candidate['status']) => {
    setCandidates(prev => prev.map(c => {
      if (c.id === candId) {
        if (nextStatus === 'Selected') {
          addNotification('Candidate Selected', `Candidate ${c.name} selected for position: ${c.appliedPositionTitle}`);
        }
        return { ...c, status: nextStatus };
      }
      return c;
    }));
    showToast(`Candidate status updated to ${nextStatus}`, 'success');
    onLogTriggered('HR_CANDIDATE_STAGE_UPDATE', 'candidates', candId, 'SUCCESS', `Moved candidate to stage: ${nextStatus}`);
  };

  const handleScheduleInterview = (e: React.FormEvent) => {
    e.preventDefault();
    const cand = candidates.find(c => c.id === interviewForm.candidateId);
    if (!cand) {
      showToast('Please select a candidate.', 'error');
      return;
    }

    const newInt: Interview = {
      id: `INT-${Math.floor(500 + Math.random() * 500)}`,
      candidateId: cand.id,
      candidateName: cand.name,
      jobTitle: cand.appliedPositionTitle,
      date: interviewForm.date,
      time: interviewForm.time,
      interviewers: interviewForm.interviewersText.split(',').map(i => i.trim()).filter(Boolean),
      notes: interviewForm.notes || 'Technical competency panel.',
      status: 'Scheduled'
    };

    setInterviews(prev => [newInt, ...prev]);
    // Move candidate status
    handleUpdateCandidateStatus(cand.id, 'Interview Scheduled');

    setIsScheduleOpen(false);
    showToast(`Interview scheduled for ${cand.name}!`, 'success');
    addNotification('Interview Scheduled', `Interview scheduled for candidate ${cand.name} on ${newInt.date}`);
    onLogTriggered('HR_INTERVIEW_SCHEDULED', 'interviews', newInt.id, 'SUCCESS', `Scheduled interview for ${cand.name}`);
  };

  const handleLogInterviewFeedback = (intId: string, rating: number, notes: string) => {
    setInterviews(prev => prev.map(i => i.id === intId ? { ...i, status: 'Completed', feedbackRating: rating, feedbackNotes: notes } : i));
    const intr = interviews.find(i => i.id === intId);
    if (intr) {
      handleUpdateCandidateStatus(intr.candidateId, 'Interview Completed');
    }
    showToast('Interview feedback logged.', 'success');
  };

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.head) {
      showToast('Please fill department name and head.', 'error');
      return;
    }

    const newDept: Department = {
      id: deptForm.id || `DEP-${deptForm.name.slice(0, 3).toUpperCase()}`,
      name: deptForm.name,
      head: deptForm.head,
      membersCount: 0,
      hierarchyLevel: deptForm.hierarchyLevel,
      status: 'Operational',
      parentDept: deptForm.parentDept || undefined
    };

    setDepartments(prev => [...prev, newDept]);
    setIsAddDeptOpen(false);
    showToast(`Department ${newDept.name} created!`, 'success');
    onLogTriggered('HR_DEPARTMENT_CREATED', 'departments', newDept.id, 'SUCCESS', `Created department ${newDept.name}`);
  };

  // Filter Employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(empSearch.toLowerCase()) || 
                          emp.designation.toLowerCase().includes(empSearch.toLowerCase()) ||
                          emp.skills.some(s => s.toLowerCase().includes(empSearch.toLowerCase())) ||
                          emp.code.toLowerCase().includes(empSearch.toLowerCase());
    
    const matchesDept = empDeptFilter === 'All' || emp.department === empDeptFilter;
    const matchesStatus = empStatusFilter === 'All' || emp.status === empStatusFilter;
    const matchesType = empTypeFilter === 'All' || emp.employmentType === empTypeFilter;
    const matchesLoc = empLocFilter === 'All' || emp.officeLocation === empLocFilter;

    return matchesSearch && matchesDept && matchesStatus && matchesType && matchesLoc;
  });

  // Pagination Math
  const totalEmpPages = Math.ceil(filteredEmployees.length / itemsPerPage) || 1;
  const paginatedEmployees = filteredEmployees.slice((empPage - 1) * itemsPerPage, empPage * itemsPerPage);

  // Filter Candidates
  const filteredCandidates = candidates.filter(cand => {
    const matchesSearch = cand.name.toLowerCase().includes(candSearch.toLowerCase()) || 
                          cand.appliedPositionTitle.toLowerCase().includes(candSearch.toLowerCase()) ||
                          cand.skills.some(s => s.toLowerCase().includes(candSearch.toLowerCase()));
    
    const matchesStatus = candStatusFilter === 'All' || cand.status === candStatusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Mini Tabs for HR */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/40 rounded-lg border border-slate-850">
          {[
            { id: 'employees', label: 'Employee Directory', count: employees.length },
            { id: 'departments', label: 'Departments & Org', count: departments.length },
            { id: 'recruitment', label: 'Recruitment & Pipeline', count: candidates.length },
            { id: 'interviews', label: 'Interviews Panel', count: interviews.length },
            { id: 'reports', label: 'HR Analytics Reports', count: null }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSubTab(tab.id as any);
                onLogTriggered('HR_SUBTAB_SWITCHED', 'hr', tab.id, 'SUCCESS', `Switched to HR: ${tab.label}`);
              }}
              className={`px-3 py-1 rounded text-xs font-semibold tracking-tight transition-all flex items-center gap-2 ${
                subTab === tab.id
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 font-bold border border-slate-800">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {subTab === 'employees' && (
          <button
            onClick={() => setIsAddEmpOpen(true)}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Onboard Employee</span>
          </button>
        )}
        {subTab === 'interviews' && (
          <button
            onClick={() => setIsScheduleOpen(true)}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedule Interview</span>
          </button>
        )}
        {subTab === 'departments' && (
          <button
            onClick={() => setIsAddDeptOpen(true)}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Create Department</span>
          </button>
        )}
      </div>

      {/* ========================================================= */}
      {/* SUBTAB 1: EMPLOYEES */}
      {/* ========================================================= */}
      {subTab === 'employees' && (
        <div className="space-y-4 text-left">
          
          {/* Filters Bar */}
          <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search employees by ID, name, designation, skills..."
                  value={empSearch}
                  onChange={(e) => { setEmpSearch(e.target.value); setEmpPage(1); }}
                  className="w-full bg-slate-950 border border-slate-900 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Layout Switcher */}
              <div className="flex items-center bg-slate-950 border border-slate-900 p-0.5 rounded-lg">
                <button
                  onClick={() => setEmpLayout('grid')}
                  className={`p-1.5 rounded ${empLayout === 'grid' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEmpLayout('list')}
                  className={`p-1.5 rounded ${empLayout === 'list' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                  title="List/Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[10px] text-slate-500 font-mono uppercase mb-1 font-bold">Department</label>
                <select
                  value={empDeptFilter}
                  onChange={(e) => { setEmpDeptFilter(e.target.value); setEmpPage(1); }}
                  className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-emerald-500"
                >
                  <option value="All">All Departments</option>
                  {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-mono uppercase mb-1 font-bold">Status</label>
                <select
                  value={empStatusFilter}
                  onChange={(e) => { setEmpStatusFilter(e.target.value); setEmpPage(1); }}
                  className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-emerald-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-mono uppercase mb-1 font-bold">Employment Type</label>
                <select
                  value={empTypeFilter}
                  onChange={(e) => { setEmpTypeFilter(e.target.value); setEmpPage(1); }}
                  className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-emerald-500"
                >
                  <option value="All">All Types</option>
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Contractor">Contractor</option>
                  <option value="Intern">Intern</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-mono uppercase mb-1 font-bold">Office Location</label>
                <select
                  value={empLocFilter}
                  onChange={(e) => { setEmpLocFilter(e.target.value); setEmpPage(1); }}
                  className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-emerald-500"
                >
                  <option value="All">All Locations</option>
                  <option value="Noida HQ">Noida HQ</option>
                  <option value="Mumbai Tech Hub">Mumbai Tech Hub</option>
                  <option value="Bengaluru R&D">Bengaluru R&D</option>
                  <option value="On-Site NCR">On-Site NCR</option>
                </select>
              </div>
            </div>
          </div>

          {/* Employee Cards - Grid */}
          {empLayout === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedEmployees.map((emp) => (
                <div 
                  key={emp.id} 
                  onClick={() => setSelectedEmployee(emp)}
                  className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 hover:border-emerald-500/40 transition-all cursor-pointer flex flex-col justify-between text-left space-y-4 hover:bg-slate-900/60"
                >
                  <div className="flex items-start gap-3">
                    <img 
                      src={emp.photo} 
                      alt={emp.name} 
                      className="w-12 h-12 rounded-lg object-cover border border-slate-800 shrink-0" 
                    />
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">{emp.code}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded ${
                          emp.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>{emp.status.toUpperCase()}</span>
                      </div>
                      <h4 className="text-sm font-extrabold text-white truncate">{emp.name}</h4>
                      <p className="text-xs text-emerald-400 font-medium truncate">{emp.designation}</p>
                      <p className="text-[10px] text-slate-500 truncate">{emp.department}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-3 border-t border-slate-900 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Location</span>
                      <span className="text-slate-300 font-medium">{emp.officeLocation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Joining Date</span>
                      <span className="text-slate-300">{emp.joiningDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Employment</span>
                      <span className="text-emerald-500 font-semibold">{emp.employmentType}</span>
                    </div>
                  </div>

                  {/* Skills tags preview */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {emp.skills.slice(0, 3).map((skill, i) => (
                      <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-900">
                        {skill}
                      </span>
                    ))}
                    {emp.skills.length > 3 && (
                      <span className="text-[9px] text-slate-500 font-mono px-1 py-0.5">
                        +{emp.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Employee Directory - List View
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900/60 border-b border-slate-850 font-mono text-[10px] text-slate-400 uppercase">
                  <tr>
                    <th className="p-3">Employee</th>
                    <th className="p-3">Department & Designation</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {paginatedEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3 flex items-center gap-2.5">
                        <img src={emp.photo} className="w-8 h-8 rounded object-cover border border-slate-800" alt="" />
                        <div>
                          <p className="font-bold text-white">{emp.name}</p>
                          <p className="text-[10px] font-mono text-slate-500">{emp.code}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="font-medium text-slate-200">{emp.designation}</p>
                        <p className="text-[10px] text-slate-500">{emp.department}</p>
                      </td>
                      <td className="p-3 font-semibold text-emerald-400">{emp.employmentType}</td>
                      <td className="p-3 text-slate-300">{emp.officeLocation}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          emp.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>{emp.status}</span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedEmployee(emp)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded text-[10px] uppercase font-bold cursor-pointer"
                        >
                          View Dossier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalEmpPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-900 pt-4 text-xs font-mono">
              <span className="text-slate-500">Showing page {empPage} of {totalEmpPages} ({filteredEmployees.length} filtered)</span>
              <div className="flex items-center gap-1">
                <button
                  disabled={empPage === 1}
                  onClick={() => setEmpPage(p => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-850 text-slate-400 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={empPage === totalEmpPages}
                  onClick={() => setEmpPage(p => Math.min(totalEmpPages, p + 1))}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-850 text-slate-400 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 2: DEPARTMENTS */}
      {/* ========================================================= */}
      {subTab === 'departments' && (
        <div className="space-y-6 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((dept) => {
              // find parent department if any
              const parent = departments.find(d => d.id === dept.parentDept);
              const depthClass = dept.hierarchyLevel === 'Tier-1 Executive' 
                ? 'border-emerald-500/20' 
                : dept.hierarchyLevel === 'Tier-2 Departmental'
                  ? 'border-slate-900'
                  : 'border-blue-500/10';

              return (
                <div 
                  key={dept.id} 
                  className={`bg-slate-900/40 border rounded-xl p-5 space-y-4 hover:border-slate-800 transition-all ${depthClass}`}
                >
                  <div className="flex items-start justify-between border-b border-slate-900 pb-3">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">{dept.hierarchyLevel}</span>
                      <h3 className="text-sm font-extrabold text-white mt-0.5">{dept.name}</h3>
                      {parent && (
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <span>Sub-dept of:</span>
                          <span className="font-semibold text-slate-400">{parent.name}</span>
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold">
                      {dept.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 font-mono block text-[9px] uppercase">Department Head</span>
                      <span className="font-bold text-slate-200 block mt-1">{dept.head}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-mono block text-[9px] uppercase">Total Active Members</span>
                      <span className="font-mono font-extrabold text-emerald-400 text-sm block mt-0.5">{dept.membersCount} Members</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-900/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">ID: {dept.id}</span>
                    <button
                      onClick={() => {
                        setEmpDeptFilter(dept.name);
                        setSubTab('employees');
                        showToast(`Filtered to ${dept.name}`, 'info');
                      }}
                      className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 uppercase tracking-wider flex items-center gap-1"
                    >
                      <span>View Team Directory</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 3: RECRUITMENT */}
      {/* ========================================================= */}
      {subTab === 'recruitment' && (
        <div className="space-y-6 text-left">
          
          {/* Top Grid: Open Job Openings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Active Job Postings & Hiring</h3>
              <span className="text-[10px] font-mono text-slate-500">Recruitment Dashboard</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {openings.map((job) => (
                <div key={job.id} className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">{job.id}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded ${
                        job.status === 'Published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>{job.status}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-200 mt-2">{job.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{job.department}</p>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-900 text-[10px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Required</span>
                      <span className="text-slate-300 font-medium">{job.experienceRequired}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sal Budget</span>
                      <span className="text-slate-300">{job.salaryRange}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Openings</span>
                      <span className="text-emerald-400 font-bold">{job.openPositions} Active</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCandSearch(job.title);
                      showToast(`Filtered candidates for ${job.title}`, 'info');
                    }}
                    className="w-full py-1 bg-slate-950 hover:bg-slate-900 rounded text-[9px] font-mono text-slate-400 font-bold uppercase border border-slate-900 text-center"
                  >
                    View {job.candidatesCount} Applicants
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Application Pipeline */}
          <div className="space-y-4">
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-900 pb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Candidate Pipeline</span>
                
                {/* Simple Filter bar for candidates */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search candidate or job..."
                    value={candSearch}
                    onChange={(e) => setCandSearch(e.target.value)}
                    className="bg-slate-950 border border-slate-900 rounded px-2 py-1 text-xs text-slate-300"
                  />
                  <select
                    value={candStatusFilter}
                    onChange={(e) => setCandStatusFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-900 rounded px-2 py-1 text-xs text-slate-300"
                  >
                    <option value="All">All Stages</option>
                    <option value="Applied">Applied</option>
                    <option value="Screening">Screening</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                    <option value="Interview Completed">Interview Completed</option>
                    <option value="Selected">Selected</option>
                    <option value="Offer Released">Offer Released</option>
                    <option value="Joined">Joined</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Table of Candidates */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950 border-b border-slate-900 font-mono text-[10px] text-slate-400 uppercase">
                    <tr>
                      <th className="p-3">Candidate</th>
                      <th className="p-3">Applied Position</th>
                      <th className="p-3">Experience</th>
                      <th className="p-3">Stage / Pipeline Status</th>
                      <th className="p-3 text-right">Interactions & Transitions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {filteredCandidates.map((cand) => (
                      <tr key={cand.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-3">
                          <p className="font-bold text-white">{cand.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{cand.email} | {cand.phone}</p>
                        </td>
                        <td className="p-3">
                          <p className="font-semibold text-slate-300">{cand.appliedPositionTitle}</p>
                          <p className="text-[10px] text-slate-500">{cand.department}</p>
                        </td>
                        <td className="p-3 font-mono text-slate-400">{cand.experienceYears} Years</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            cand.status === 'Joined' ? 'bg-emerald-500/10 text-emerald-400' :
                            cand.status === 'Selected' || cand.status === 'Offer Released' ? 'bg-blue-500/10 text-blue-400' :
                            cand.status === 'Rejected' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>{cand.status}</span>
                        </td>
                        <td className="p-3 text-right flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedCandidate(cand)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded text-[10px] uppercase font-bold"
                          >
                            Details
                          </button>
                          
                          {/* Next Pipeline Step drop trigger */}
                          <select
                            value={cand.status}
                            onChange={(e) => handleUpdateCandidateStatus(cand.id, e.target.value as any)}
                            className="bg-slate-950 border border-slate-850 rounded px-2 py-1 text-[10px] text-slate-300 cursor-pointer"
                          >
                            <option value="Applied">Applied</option>
                            <option value="Screening">Screening</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Interview Scheduled">Interview Scheduled</option>
                            <option value="Interview Completed">Interview Completed</option>
                            <option value="Selected">Selected</option>
                            <option value="Offer Released">Offer Released</option>
                            <option value="Joined">Joined</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 4: INTERVIEWS */}
      {/* ========================================================= */}
      {subTab === 'interviews' && (
        <div className="space-y-4 text-left">
          
          <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4">
            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Interviewer Scheduling Ledger</span>
            <div className="divide-y divide-slate-900 mt-3">
              {interviews.map((intr) => (
                <div key={intr.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-400">{intr.id}</span>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                        intr.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>{intr.status.toUpperCase()}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Candidate: {intr.candidateName}</h4>
                    <p className="text-xs text-slate-400">Position: {intr.jobTitle}</p>
                    <p className="text-xs text-slate-500 font-mono">Interviewers: {intr.interviewers.join(', ')}</p>
                  </div>

                  <div className="flex flex-col md:items-end gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span>{intr.date}</span>
                      <span className="text-slate-600">|</span>
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>{intr.time}</span>
                    </div>

                    <p className="text-xs text-slate-400 max-w-sm italic">Notes: "{intr.notes}"</p>

                    {intr.feedbackRating && (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500 font-mono">Score:</span>
                        <div className="flex text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3 h-3 fill-current ${i < (intr.feedbackRating || 0) ? 'text-amber-400' : 'text-slate-700'}`} />
                          ))}
                        </div>
                      </div>
                    )}

                    {intr.status === 'Scheduled' ? (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => {
                            const note = prompt('Enter Technical feedback notes:');
                            const stars = parseInt(prompt('Enter Rating Score (1-5):') || '5') || 5;
                            if (note !== null) {
                              handleLogInterviewFeedback(intr.id, stars, note);
                            }
                          }}
                          className="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-[10px] rounded uppercase tracking-wider cursor-pointer"
                        >
                          Submit Feedback
                        </button>
                        <button
                          onClick={() => {
                            setInterviews(prev => prev.map(i => i.id === intr.id ? { ...i, status: 'Cancelled' } : i));
                            showToast('Interview Cancelled.', 'info');
                          }}
                          className="px-2 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-900 text-red-400 font-semibold text-[10px] rounded uppercase cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      intr.feedbackNotes && (
                        <div className="bg-slate-950 p-2 rounded border border-slate-900 text-[11px] text-slate-400 mt-1 max-w-md">
                          <span className="font-bold text-slate-300 block">Feedback:</span>
                          "{intr.feedbackNotes}"
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 5: REPORTS */}
      {/* ========================================================= */}
      {subTab === 'reports' && (
        <div className="space-y-6 text-left">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Employee Department Breakdown */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 space-y-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider block border-b border-slate-900 pb-2">Department Allocations</span>
              <div className="space-y-3">
                {departments.map((d, i) => {
                  const percentage = Math.round((d.membersCount / employees.length) * 100) || 0;
                  return (
                    <div key={i} className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-300 font-medium">{d.name}</span>
                        <span className="text-slate-500 font-mono">{d.membersCount} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hiring Conversion Rates */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 space-y-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider block border-b border-slate-900 pb-2">Recruitment Yield metrics</span>
              <div className="space-y-3.5 text-xs">
                {[
                  { stage: 'Total Candidates', count: candidates.length, color: 'text-slate-300' },
                  { stage: 'Interviews Logged', count: interviews.length, color: 'text-blue-400' },
                  { stage: 'Selected Offers', count: candidates.filter(c => c.status === 'Selected' || c.status === 'Offer Released' || c.status === 'Joined').length, color: 'text-emerald-400' },
                  { stage: 'Successful Joinees', count: candidates.filter(c => c.status === 'Joined').length, color: 'text-emerald-400 font-bold' }
                ].map((row, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-slate-950 rounded border border-slate-900">
                    <span className="text-slate-400">{row.stage}</span>
                    <span className={`font-mono text-sm ${row.color}`}>{row.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Distribution (UI Ready) */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 space-y-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider block border-b border-slate-900 pb-2">HR Security Audit Index</span>
              <div className="p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/10 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-semibold">RERA compliance index:</span>
                  <span className="font-mono text-emerald-400 font-bold">100%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-semibold">Linked Dossiers:</span>
                  <span className="font-mono text-slate-300">5 / 5 Employees</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-semibold">Active NDAs / Contracts:</span>
                  <span className="font-mono text-slate-300">4 Active</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed pt-2 border-t border-slate-900">
                  Employee dossiers automatically mapped to active organization blueprints. Complete history synced with DMS system.
                </p>
              </div>
            </div>

          </div>

          {/* Action to download reports */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <div>
              <p className="font-bold text-white">Generate Official Enterprise HR Audit Report</p>
              <p className="text-slate-400">Assemble candidate dossiers, pipeline metrics, and structural headcounts into a secure printable format.</p>
            </div>
            <button
              onClick={() => {
                if (employees.length + candidates.length === 0) return showToast('There are no employees or candidates to export yet.', 'info');
                const rows = [
                  ...(employees as unknown as Record<string, unknown>[]).map(e => ({ kind: 'Employee', code: e.code, name: e.name, department: e.department, role: e.designation, email: e.email, mobile: e.mobile, status: e.status, date: e.joiningDate })),
                  ...(candidates as unknown as Record<string, unknown>[]).map(c => ({ kind: 'Candidate', code: c.id, name: c.name, department: '', role: c.appliedPositionTitle, email: c.email, mobile: c.phone, status: c.status, date: '' }))
                ];
                downloadCsv(`hr-report-${new Date().toISOString().slice(0, 10)}`, [{ key: 'kind', label: 'Record' }, { key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }, { key: 'department', label: 'Department' }, { key: 'role', label: 'Designation / applied for' }, { key: 'email', label: 'Email' }, { key: 'mobile', label: 'Mobile' }, { key: 'status', label: 'Status' }, { key: 'date', label: 'Joined / applied' }], rows);
                onLogTriggered('HR_REPORT_DOWNLOAD', 'hr', 'all', 'SUCCESS', `Exported ${rows.length} HR records.`);
              }}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-lg uppercase tracking-wide cursor-pointer"
            >
              Download HR Data (CSV)
            </button>
          </div>

        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 1: ADD EMPLOYEE */}
      {/* ========================================== */}
      {isAddEmpOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>Onboard New Employee Profile</span>
              </h3>
              <button onClick={() => setIsAddEmpOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono text-slate-500 block">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={addEmpForm.name}
                    onChange={(e) => setAddEmpForm({ ...addEmpForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1.5 text-slate-200"
                    placeholder="e.g. Rajiv Ranjan"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono text-slate-500 block">Designation / Role *</label>
                  <input
                    type="text"
                    required
                    value={addEmpForm.designation}
                    onChange={(e) => setAddEmpForm({ ...addEmpForm, designation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1.5 text-slate-200"
                    placeholder="e.g. Lead Planner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono text-slate-500 block">Department</label>
                  <select
                    value={addEmpForm.department}
                    onChange={(e) => setAddEmpForm({ ...addEmpForm, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1.5 text-slate-200"
                  >
                    {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono text-slate-500 block">Work Location</label>
                  <select
                    value={addEmpForm.officeLocation}
                    onChange={(e) => setAddEmpForm({ ...addEmpForm, officeLocation: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1.5 text-slate-200"
                  >
                    <option value="Noida HQ">Noida HQ</option>
                    <option value="Mumbai Tech Hub">Mumbai Tech Hub</option>
                    <option value="Bengaluru R&D">Bengaluru R&D</option>
                    <option value="On-Site NCR">On-Site NCR</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono text-slate-500 block">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={addEmpForm.email}
                    onChange={(e) => setAddEmpForm({ ...addEmpForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1.5 text-slate-200"
                    placeholder="employee@realtyconnect.in"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono text-slate-500 block">Mobile No.</label>
                  <input
                    type="text"
                    value={addEmpForm.mobile}
                    onChange={(e) => setAddEmpForm({ ...addEmpForm, mobile: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1.5 text-slate-200"
                    placeholder="+91 xxxxx xxxxx"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono text-slate-500 block">Employment Type</label>
                  <select
                    value={addEmpForm.employmentType}
                    onChange={(e) => setAddEmpForm({ ...addEmpForm, employmentType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1.5 text-slate-200"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contractor">Contractor</option>
                    <option value="Intern">Intern</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono text-slate-500 block">Skills (Comma separated)</label>
                  <input
                    type="text"
                    value={addEmpForm.skillsText}
                    onChange={(e) => setAddEmpForm({ ...addEmpForm, skillsText: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1.5 text-slate-200"
                    placeholder="e.g. AutoCAD, Concrete Cast, Estimations"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-850 space-y-2">
                <span className="text-[9px] font-mono uppercase text-slate-500 block font-bold">Emergency Contact Information</span>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Contact Name"
                    value={addEmpForm.emergencyName}
                    onChange={(e) => setAddEmpForm({ ...addEmpForm, emergencyName: e.target.value })}
                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-300"
                  />
                  <input
                    type="text"
                    placeholder="Relation"
                    value={addEmpForm.emergencyRelation}
                    onChange={(e) => setAddEmpForm({ ...addEmpForm, emergencyRelation: e.target.value })}
                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-300"
                  />
                  <input
                    type="text"
                    placeholder="Mobile No."
                    value={addEmpForm.emergencyPhone}
                    onChange={(e) => setAddEmpForm({ ...addEmpForm, emergencyPhone: e.target.value })}
                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded uppercase tracking-wider cursor-pointer text-center"
              >
                Onboard Employee
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 2: INTERVIEW SCHEDULER */}
      {/* ========================================== */}
      {isScheduleOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full shadow-2xl p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white">Schedule Technical Interview Panel</h3>
              <button onClick={() => setIsScheduleOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleInterview} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono text-slate-500 block">Select Candidate *</label>
                <select
                  required
                  value={interviewForm.candidateId}
                  onChange={(e) => setInterviewForm({ ...interviewForm, candidateId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1.5 text-slate-300 focus:outline-none"
                >
                  <option value="">-- Choose Candidate --</option>
                  {candidates.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.appliedPositionTitle})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono text-slate-500 block">Interview Date</label>
                  <input
                    type="date"
                    value={interviewForm.date}
                    onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1.5 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono text-slate-500 block">Time Slot</label>
                  <input
                    type="text"
                    value={interviewForm.time}
                    onChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1.5 text-slate-200"
                    placeholder="e.g. 11:00 AM"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono text-slate-500 block">Assign Interviewers (Comma separated)</label>
                <input
                  type="text"
                  value={interviewForm.interviewersText}
                  onChange={(e) => setInterviewForm({ ...interviewForm, interviewersText: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1.5 text-slate-200"
                  placeholder="e.g. Rajeev Malhotra, Ananya Sharma"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono text-slate-500 block">Interview Objectives / Notes</label>
                <textarea
                  value={interviewForm.notes}
                  onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1.5 text-slate-200"
                  placeholder="Review TMT design structures, RERA familiarity..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded uppercase tracking-wider cursor-pointer"
              >
                Schedule & Alert Panel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 3: CREATE DEPARTMENT */}
      {/* ========================================== */}
      {isAddDeptOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full shadow-2xl p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white">Create Enterprise Department</h3>
              <button onClick={() => setIsAddDeptOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDepartment} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono text-slate-500 block">Dept Code (Unique)</label>
                  <input
                    type="text"
                    required
                    value={deptForm.id}
                    onChange={(e) => setDeptForm({ ...deptForm, id: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1.5 text-slate-200"
                    placeholder="DEP-ENG"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono text-slate-500 block">Department Name</label>
                  <input
                    type="text"
                    required
                    value={deptForm.name}
                    onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1.5 text-slate-200"
                    placeholder="Engineering"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono text-slate-500 block">Department Head (Manager)</label>
                <input
                  type="text"
                  required
                  value={deptForm.head}
                  onChange={(e) => setDeptForm({ ...deptForm, head: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1.5 text-slate-200"
                  placeholder="John Doe"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono text-slate-500 block">Hierarchy Level</label>
                  <select
                    value={deptForm.hierarchyLevel}
                    onChange={(e) => setDeptForm({ ...deptForm, hierarchyLevel: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1.5 text-slate-300"
                  >
                    <option value="Tier-1 Executive">Tier-1 Executive</option>
                    <option value="Tier-2 Departmental">Tier-2 Departmental</option>
                    <option value="Tier-3 Functional">Tier-3 Functional</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono text-slate-500 block">Parent Department</label>
                  <select
                    value={deptForm.parentDept}
                    onChange={(e) => setDeptForm({ ...deptForm, parentDept: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1.5 text-slate-300"
                  >
                    <option value="">None (Top-Level)</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded uppercase tracking-wider cursor-pointer"
              >
                Create Department Master
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* DRAWER: EMPLOYEE DOSSIER DETAIL */}
      {/* ========================================== */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-end p-0 md:p-4">
          <div className="bg-slate-900 border-l border-slate-800 md:border md:rounded-xl max-w-2xl w-full h-full md:h-[95vh] shadow-2xl flex flex-col justify-between text-left">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">{selectedEmployee.code}</span>
                <h3 className="text-sm font-extrabold text-white mt-0.5">Employee Dossier</h3>
              </div>
              <button onClick={() => setSelectedEmployee(null)} className="p-1 rounded hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 flex-1 overflow-y-auto space-y-6 text-xs">
              
              {/* Profile Card Summary */}
              <div className="flex items-start gap-4 p-4 bg-slate-950 rounded-lg border border-slate-850">
                <img src={selectedEmployee.photo} alt="" className="w-16 h-16 rounded-lg object-cover border border-slate-800 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-base font-extrabold text-white">{selectedEmployee.name}</h4>
                  <p className="text-emerald-400 font-bold">{selectedEmployee.designation}</p>
                  <p className="text-slate-400">{selectedEmployee.department}</p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-600" />
                    <span>Office: {selectedEmployee.officeLocation}</span>
                  </p>
                </div>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-950/60 rounded border border-slate-900 space-y-1">
                  <span className="text-slate-500 uppercase font-mono text-[9px] block">Contact Details</span>
                  <div className="space-y-1 text-slate-300">
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{selectedEmployee.email}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{selectedEmployee.mobile}</span>
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded border border-slate-900 space-y-1">
                  <span className="text-slate-500 uppercase font-mono text-[9px] block">Corporate Hierarchy</span>
                  <div className="space-y-1 text-slate-300">
                    <p className="flex justify-between">
                      <span className="text-slate-500">Manager:</span>
                      <span className="font-semibold text-slate-200">{selectedEmployee.manager}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-500">Employment:</span>
                      <span className="text-emerald-400 font-bold">{selectedEmployee.employmentType}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-950/60 rounded border border-slate-900 space-y-1">
                  <span className="text-slate-500 uppercase font-mono text-[9px] block">Skills Inventory</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedEmployee.skills.map((skill, idx) => (
                      <span key={idx} className="text-[9px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded border border-slate-900 space-y-1">
                  <span className="text-slate-500 uppercase font-mono text-[9px] block">Emergency Contact</span>
                  <div className="space-y-0.5 text-slate-300">
                    <p className="font-bold text-slate-200">{selectedEmployee.emergencyContact.name} ({selectedEmployee.emergencyContact.relation})</p>
                    <p className="font-mono text-[11px] text-slate-400">{selectedEmployee.emergencyContact.phone}</p>
                  </div>
                </div>
              </div>

              {/* Linked Documents inside HR */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Linked Corporate Documents ({selectedEmployee.linkedDocuments.length})</span>
                <div className="space-y-1.5">
                  {selectedEmployee.linkedDocuments.map((docId) => {
                    const doc = documents.find(d => d.id === docId);
                    return (
                      <div key={docId} className="p-2 bg-slate-950 rounded border border-slate-900 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-400" />
                          <div>
                            <p className="font-bold text-slate-300">{doc ? doc.title : docId}</p>
                            <p className="text-[9px] text-slate-500 uppercase font-mono">ID: {docId}</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                          {doc ? doc.status : 'Active'}
                        </span>
                      </div>
                    );
                  })}
                  {selectedEmployee.linkedDocuments.length === 0 && (
                    <p className="text-slate-500 italic">No enterprise documents linked to this profile.</p>
                  )}
                </div>
              </div>

              {/* Add Activity & Activity Timeline */}
              <div className="space-y-3 pt-4 border-t border-slate-850">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Employee Activities Log</span>
                  
                  {/* Select Activity Type */}
                  <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-900 p-0.5 rounded text-[10px]">
                    {(['Note', 'Meeting', 'Project', 'Task'] as any[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewActivityType(t)}
                        className={`px-1.5 py-0.5 rounded ${newActivityType === t ? 'bg-slate-850 text-white font-bold' : 'text-slate-500'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newActivityText}
                    onChange={(e) => setNewActivityText(e.target.value)}
                    placeholder={`Log a new ${newActivityType.toLowerCase()}...`}
                    className="flex-1 bg-slate-950 border border-slate-850 rounded px-2 py-1 text-xs text-slate-200"
                  />
                  <button
                    onClick={() => handleAddActivity(selectedEmployee.id)}
                    className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded uppercase"
                  >
                    Log
                  </button>
                </div>

                {/* Timeline rendering */}
                <div className="space-y-2 mt-4 max-h-52 overflow-y-auto pr-1">
                  {activities.filter(act => act.employeeId === selectedEmployee.id).map((act) => (
                    <div key={act.id} className="p-2 bg-slate-950/60 rounded border border-slate-900 flex items-start gap-2.5 text-xs text-left">
                      <div className="p-1 rounded bg-slate-900 border border-slate-800 text-[9px] uppercase font-mono tracking-tighter text-emerald-400 shrink-0">
                        {act.type}
                      </div>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">{act.title}</span>
                          <span className="text-[9px] font-mono text-slate-500">{act.timestamp}</span>
                        </div>
                        <p className="text-slate-400">{act.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer buttons */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between gap-3">
              <button
                onClick={() => {
                  const status = selectedEmployee.status === 'Active' ? 'On Leave' : 'Active';
                  setEmployees(prev => prev.map(e => e.id === selectedEmployee.id ? { ...e, status } : e));
                  setSelectedEmployee(prev => prev ? { ...prev, status } : null);
                  showToast(`Updated status to ${status}`, 'success');
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold rounded uppercase tracking-wider text-[10px]"
              >
                Toggle Work Status
              </button>

              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded uppercase tracking-wider text-[10px]"
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 4: CANDIDATE DETAIL & PIPELINE MODAL */}
      {/* ========================================== */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full shadow-2xl p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">{selectedCandidate.id}</span>
                <h3 className="text-sm font-extrabold text-white">Candidate Hiring Dossier</h3>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-950 rounded border border-slate-850">
                <h4 className="text-sm font-extrabold text-white">{selectedCandidate.name}</h4>
                <p className="text-emerald-400 font-semibold">{selectedCandidate.appliedPositionTitle}</p>
                <p className="text-slate-500 mt-1 font-mono">{selectedCandidate.email} | {selectedCandidate.phone}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-mono text-[9px] uppercase">Technical Skill Index</span>
                <div className="flex flex-wrap gap-1">
                  {selectedCandidate.skills.map((skill, idx) => (
                    <span key={idx} className="text-[9px] px-2 py-0.5 rounded bg-slate-950 border border-slate-900 text-slate-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 bg-slate-950/60 rounded border border-slate-900">
                  <span className="text-[9px] text-slate-500 uppercase font-mono block">Experience</span>
                  <span className="font-bold text-slate-200 mt-1 block">{selectedCandidate.experienceYears} Years</span>
                </div>
                <div className="p-2 bg-slate-950/60 rounded border border-slate-900">
                  <span className="text-[9px] text-slate-500 uppercase font-mono block">Interviews Done</span>
                  <span className="font-mono text-emerald-400 font-bold mt-1 block">{selectedCandidate.interviewsCount} Rounds</span>
                </div>
              </div>

              {selectedCandidate.offerDetails && (
                <div className="p-3 bg-blue-500/5 rounded border border-blue-500/10 text-[11px] text-slate-400 space-y-1">
                  <span className="font-bold text-slate-300 uppercase block text-[9px]">Compensation Proposal</span>
                  <p className="flex justify-between">
                    <span>Base Offer Salary:</span>
                    <span className="font-mono text-white font-bold">₹{selectedCandidate.offerDetails.salary.toLocaleString()}/yr</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Offer Released on:</span>
                    <span className="text-white">{selectedCandidate.offerDetails.dateReleased}</span>
                  </p>
                </div>
              )}

              <div className="p-3 bg-slate-950 rounded border border-slate-850 space-y-2">
                <span className="text-[9px] font-mono uppercase text-slate-500 block font-bold">Move Pipeline Stage</span>
                <div className="grid grid-cols-3 gap-1">
                  {(['Screening', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Offer Released', 'Joined', 'Rejected'] as any[]).map((stg) => (
                    <button
                      key={stg}
                      onClick={() => {
                        handleUpdateCandidateStatus(selectedCandidate.id, stg);
                        setSelectedCandidate(prev => prev ? { ...prev, status: stg } : null);
                      }}
                      className={`px-1.5 py-1 text-[8px] font-bold uppercase rounded border transition-all ${
                        selectedCandidate.status === stg 
                          ? 'bg-emerald-500 text-slate-950 border-emerald-500' 
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {stg.replace('Interview Scheduled', 'Int Scheduled')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action to create a linked employee when candidate joins */}
              {selectedCandidate.status === 'Selected' && (
                <button
                  onClick={() => {
                    // Populate Onboarding form
                    setAddEmpForm({
                      name: selectedCandidate.name,
                      department: selectedCandidate.department,
                      designation: selectedCandidate.appliedPositionTitle,
                      manager: 'Rajeev Malhotra',
                      email: selectedCandidate.email,
                      mobile: selectedCandidate.phone,
                      employmentType: 'Full-Time',
                      officeLocation: 'Noida HQ',
                      skillsText: selectedCandidate.skills.join(', '),
                      emergencyName: '',
                      emergencyPhone: '',
                      emergencyRelation: 'Spouse'
                    });
                    setIsAddEmpOpen(true);
                    setSelectedCandidate(null);
                    showToast('Candidate dossier mapped to Employee Onboarding form.', 'info');
                  }}
                  className="w-full py-1.5 bg-blue-500 hover:bg-blue-400 text-slate-950 font-extrabold text-[10px] rounded uppercase tracking-wider text-center cursor-pointer"
                >
                  Onboard Candidate as Employee
                </button>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
