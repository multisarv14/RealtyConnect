import { 
  Users, Building2, Briefcase, FileText, Calendar, Clock, CheckCircle2, AlertCircle
} from 'lucide-react';

// ==========================================
// INTERFACES & TYPES
// ==========================================

export interface Employee {
  id: string;
  code: string;
  name: string;
  photo: string;
  department: string;
  designation: string;
  manager: string;
  email: string;
  mobile: string;
  joiningDate: string;
  employmentType: 'Full-Time' | 'Part-Time' | 'Contractor' | 'Intern';
  status: 'Active' | 'On Leave' | 'Suspended' | 'Terminated';
  officeLocation: 'Noida HQ' | 'Mumbai Tech Hub' | 'Bengaluru R&D' | 'On-Site NCR';
  skills: string[];
  emergencyContact: { name: string; relation: string; phone: string };
  linkedDocuments: string[]; // Document IDs
}

export interface Department {
  id: string;
  name: string;
  head: string;
  membersCount: number;
  hierarchyLevel: 'Tier-1 Executive' | 'Tier-2 Departmental' | 'Tier-3 Functional';
  status: 'Operational' | 'Restructuring' | 'Merged';
  parentDept?: string;
}

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  status: 'Draft' | 'Published' | 'On Hold' | 'Closed';
  experienceRequired: string;
  openPositions: number;
  candidatesCount: number;
  salaryRange: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  appliedPositionId: string;
  appliedPositionTitle: string;
  department: string;
  status: 'Applied' | 'Screening' | 'Shortlisted' | 'Interview Scheduled' | 'Interview Completed' | 'Selected' | 'Offer Released' | 'Joined' | 'Rejected';
  experienceYears: number;
  resumeUrl: string;
  skills: string[];
  interviewsCount: number;
  offerDetails?: { salary: number; dateReleased: string; responseDate?: string };
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  date: string;
  time: string;
  interviewers: string[];
  notes: string;
  status: 'Scheduled' | 'Completed' | 'Rescheduled' | 'Cancelled';
  feedbackRating?: number; // 1-5 stars
  feedbackNotes?: string;
}

export interface EmployeeActivity {
  id: string;
  employeeId: string;
  type: 'Note' | 'Meeting' | 'Project' | 'Task' | 'Document' | 'System';
  title: string;
  description: string;
  timestamp: string;
  metaData?: string;
}

// DMS Interfaces
export interface Folder {
  id: string;
  name: string;
  parentFolderId: string | null; // null for root folders
  createdAt: string;
  isArchived: boolean;
}

export interface DocumentVersion {
  version: string;
  updatedBy: string;
  updatedAt: string;
  changeNote: string;
}

export interface DocumentRecord {
  id: string;
  /** Stored file behind this record (absent for sample documents). */
  fileId?: string;
  fileName?: string;
  title: string;
  documentType: string; // e.g., pdf, xlsx, docx, dwg, zip
  category: 
    | 'Project Documents' | 'Contracts' | 'Agreements' | 'Invoices' 
    | 'Purchase Documents' | 'HR Documents' | 'Employee Documents' 
    | 'Technical Drawings' | 'Marketing Files' | 'Legal Documents' 
    | 'Certificates' | 'Policies' | 'Other';
  owner: string;
  department: string;
  folderId: string | null;
  // Integrations mapping
  relatedProjectId?: string;
  relatedCrmId?: string;
  relatedLeadId?: string;
  relatedRfqId?: string;
  relatedMarketplaceId?: string;
  relatedMeetingId?: string;
  relatedSupplier?: string;
  
  uploadDate: string;
  lastUpdated: string;
  version: string;
  status: 'Draft' | 'Active' | 'Under Review' | 'Approved' | 'Archived' | 'Expired';
  description: string;
  sharingSettings: {
    type: 'Internal' | 'Department' | 'Project' | 'Role-Based';
    rolesAllowed?: string[];
    departmentsAllowed?: string[];
    projectsAllowed?: string[];
  };
  versionHistory: DocumentVersion[];
}

export interface HrDmsNotification {
  id: string;
  type: 'Employee Added' | 'Interview Scheduled' | 'Candidate Selected' | 'Document Uploaded' | 'Document Shared' | 'Document Approved' | 'New Version Available';
  message: string;
  timestamp: string;
  read: boolean;
}

// ==========================================
// MOCK DATASETS (SPRINT 21 CENTRALIZED)
// ==========================================

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'DEP-ENG', name: 'Engineering & Construction', head: 'Rajeev Malhotra', membersCount: 14, hierarchyLevel: 'Tier-2 Departmental', status: 'Operational' },
  { id: 'DEP-HR', name: 'Human Resources & Talent', head: 'Ananya Sharma', membersCount: 3, hierarchyLevel: 'Tier-2 Departmental', status: 'Operational' },
  { id: 'DEP-FIN', name: 'Finance & Accounts', head: 'Vikram Grover', membersCount: 5, hierarchyLevel: 'Tier-2 Departmental', status: 'Operational' },
  { id: 'DEP-LGL', name: 'Legal & Compliance', head: 'Meenakshi Iyer', membersCount: 2, hierarchyLevel: 'Tier-2 Departmental', status: 'Operational' },
  { id: 'DEP-OPS', name: 'Projects & Operations', head: 'Sanjay Dutt', membersCount: 18, hierarchyLevel: 'Tier-2 Departmental', status: 'Operational' },
  { id: 'DEP-MKT', name: 'Sales & Marketing', head: 'Nisha Singhal', membersCount: 8, hierarchyLevel: 'Tier-2 Departmental', status: 'Operational' }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'EMP-001',
    code: 'RC-EMP-102',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=60',
    name: 'Ananya Sharma',
    department: 'Human Resources & Talent',
    designation: 'Head of Human Resources',
    manager: 'CEO Office',
    email: 'ananya.sharma@realtyconnect.in',
    mobile: '+91 98765 43210',
    joiningDate: '2024-01-15',
    employmentType: 'Full-Time',
    status: 'Active',
    officeLocation: 'Noida HQ',
    skills: ['Talent Acquisition', 'Strategic HR', 'Conflict Resolution', 'Employee Onboarding'],
    emergencyContact: { name: 'Kunal Sharma', relation: 'Spouse', phone: '+91 98765 99881' },
    linkedDocuments: ['DOC-HR-001', 'DOC-POL-002']
  },
  {
    id: 'EMP-002',
    code: 'RC-EMP-105',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60',
    name: 'Vikram Grover',
    department: 'Finance & Accounts',
    designation: 'Chief Financial Controller',
    manager: 'CEO Office',
    email: 'vikram.grover@realtyconnect.in',
    mobile: '+91 91234 56789',
    joiningDate: '2024-03-22',
    employmentType: 'Full-Time',
    status: 'Active',
    officeLocation: 'Noida HQ',
    skills: ['Treasury Management', 'Tax Audits', 'Milestone Invoicing', 'Corporate Finance'],
    emergencyContact: { name: 'Preeti Grover', relation: 'Spouse', phone: '+91 91234 88776' },
    linkedDocuments: ['DOC-INV-001', 'DOC-INV-002']
  },
  {
    id: 'EMP-003',
    code: 'RC-EMP-114',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60',
    name: 'Rajeev Malhotra',
    department: 'Engineering & Construction',
    designation: 'Principal Structural Engineer',
    manager: 'Sanjay Dutt',
    email: 'rajeev.malhotra@realtyconnect.in',
    mobile: '+91 95432 10987',
    joiningDate: '2024-06-10',
    employmentType: 'Full-Time',
    status: 'Active',
    officeLocation: 'On-Site NCR',
    skills: ['Structural Designing', 'RERA Compliance', 'Concrete Testing', 'Vast Engineering'],
    emergencyContact: { name: 'Suman Malhotra', relation: 'Mother', phone: '+91 95432 66554' },
    linkedDocuments: ['DOC-PRJ-001', 'DOC-DWG-002']
  },
  {
    id: 'EMP-004',
    code: 'RC-EMP-119',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60',
    name: 'Nisha Singhal',
    department: 'Sales & Marketing',
    designation: 'VP Business Development',
    manager: 'CEO Office',
    email: 'nisha.singhal@realtyconnect.in',
    mobile: '+91 99887 76655',
    joiningDate: '2025-02-01',
    employmentType: 'Full-Time',
    status: 'Active',
    officeLocation: 'Mumbai Tech Hub',
    skills: ['B2B Sales', 'Real Estate Investment', 'Enterprise CRM', 'Key Account Relations'],
    emergencyContact: { name: 'Ravi Singhal', relation: 'Father', phone: '+91 99887 11223' },
    linkedDocuments: ['DOC-CRM-001']
  },
  {
    id: 'EMP-005',
    code: 'RC-EMP-128',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=60',
    name: 'Rahul Roy',
    department: 'Engineering & Construction',
    designation: 'Site Supervisor',
    manager: 'Rajeev Malhotra',
    email: 'rahul.roy@realtyconnect.in',
    mobile: '+91 98989 88776',
    joiningDate: '2025-05-18',
    employmentType: 'Contractor',
    status: 'On Leave',
    officeLocation: 'On-Site NCR',
    skills: ['Site Supervision', 'Materials Inspection', 'Safety Auditing', 'Logistics Operations'],
    emergencyContact: { name: 'Bijoy Roy', relation: 'Brother', phone: '+91 98989 11223' },
    linkedDocuments: ['DOC-DWG-002']
  }
];

export const INITIAL_JOB_OPENINGS: JobOpening[] = [
  { id: 'JOB-001', title: 'Senior MEP Coordinator', department: 'Engineering & Construction', location: 'On-Site NCR', status: 'Published', experienceRequired: '5-8 Years', openPositions: 2, candidatesCount: 8, salaryRange: '₹12,00,000 - ₹18,00,000' },
  { id: 'JOB-002', title: 'Real Estate Legal Counsel', department: 'Legal & Compliance', location: 'Noida HQ', status: 'Published', experienceRequired: '4-6 Years', openPositions: 1, candidatesCount: 4, salaryRange: '₹10,00,000 - ₹15,00,000' },
  { id: 'JOB-003', title: 'Procurement Specialist', department: 'Finance & Accounts', location: 'Noida HQ', status: 'Published', experienceRequired: '3-5 Years', openPositions: 1, candidatesCount: 12, salaryRange: '₹7,00,000 - ₹10,00,000' },
  { id: 'JOB-004', title: 'Structural Analyst (Advisory)', department: 'Engineering & Construction', location: 'Bengaluru R&D', status: 'On Hold', experienceRequired: '8+ Years', openPositions: 1, candidatesCount: 2, salaryRange: '₹18,00,000 - ₹24,00,000' }
];

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'CAN-101',
    name: 'Devashish Sen',
    email: 'dev.sen@gmail.com',
    phone: '+91 88123 45678',
    appliedPositionId: 'JOB-001',
    appliedPositionTitle: 'Senior MEP Coordinator',
    department: 'Engineering & Construction',
    status: 'Shortlisted',
    experienceYears: 6.5,
    resumeUrl: 'Resume_Devashish_MEP_Coordinator.pdf',
    skills: ['HVAC Design', 'Firefighting Systems', 'Electrical Substation Planning', 'BIM Autocad'],
    interviewsCount: 1
  },
  {
    id: 'CAN-102',
    name: 'Shreya Deshmukh',
    email: 'shreya.deshmukh@lawcorp.in',
    phone: '+91 77123 99881',
    appliedPositionId: 'JOB-002',
    appliedPositionTitle: 'Real Estate Legal Counsel',
    department: 'Legal & Compliance',
    status: 'Selected',
    experienceYears: 5,
    resumeUrl: 'Resume_Shreya_RERA_Legal.pdf',
    skills: ['RERA Registrations', 'Due Diligence', 'Lease Agreements', 'Arbitration'],
    interviewsCount: 2,
    offerDetails: { salary: 1400000, dateReleased: '2026-07-15' }
  },
  {
    id: 'CAN-103',
    name: 'Gaurav Kulkarni',
    email: 'gaurav.k@outlook.com',
    phone: '+91 90088 11223',
    appliedPositionId: 'JOB-003',
    appliedPositionTitle: 'Procurement Specialist',
    department: 'Finance & Accounts',
    status: 'Interview Scheduled',
    experienceYears: 4,
    resumeUrl: 'Resume_Gaurav_SupplyChain.pdf',
    skills: ['Vendor Negotiations', 'TMT Steel Procurement', 'SAP ERP', 'Material Scheduling'],
    interviewsCount: 0
  },
  {
    id: 'CAN-104',
    name: 'Prakash Chandra',
    email: 'prakash.civil@yahoo.com',
    phone: '+91 94432 77123',
    appliedPositionId: 'JOB-001',
    appliedPositionTitle: 'Senior MEP Coordinator',
    department: 'Engineering & Construction',
    status: 'Joined',
    experienceYears: 7,
    resumeUrl: 'Resume_Prakash_CivilMEP.pdf',
    skills: ['Mechanical Layouts', 'Water Reticulation', 'Plumbing Codes', 'Safety Compliance'],
    interviewsCount: 2
  }
];

export const INITIAL_INTERVIEWS: Interview[] = [
  {
    id: 'INT-501',
    candidateId: 'CAN-101',
    candidateName: 'Devashish Sen',
    jobTitle: 'Senior MEP Coordinator',
    date: '2026-07-20',
    time: '11:00 AM',
    interviewers: ['Rajeev Malhotra', 'Ananya Sharma'],
    notes: 'Technical review focusing on HVAC layouts for Amara Sky Towers.',
    status: 'Scheduled'
  },
  {
    id: 'INT-502',
    candidateId: 'CAN-102',
    candidateName: 'Shreya Deshmukh',
    jobTitle: 'Real Estate Legal Counsel',
    date: '2026-07-14',
    time: '02:30 PM',
    interviewers: ['Ananya Sharma', 'Vikram Grover'],
    notes: 'In-depth discussion on NCR land title clearance protocols.',
    status: 'Completed',
    feedbackRating: 5,
    feedbackNotes: 'Exceptional knowledge of NCR local RERA procedures. Highly recommended.'
  }
];

export const INITIAL_ACTIVITIES: EmployeeActivity[] = [
  { id: 'ACT-901', employeeId: 'EMP-001', type: 'System', title: 'Account Initialized', description: 'Employee master file uploaded during HR mobilization.', timestamp: '2024-01-15 09:00 AM' },
  { id: 'ACT-902', employeeId: 'EMP-003', type: 'Project', title: 'Assigned to Amara Sky Towers', description: 'Allocated as Principal structural audit lead.', timestamp: '2024-06-12 10:30 AM' },
  { id: 'ACT-903', employeeId: 'EMP-003', type: 'Document', title: 'Uploaded Structural Dwg', description: 'Uploaded Amara_TMT_Slab_Reinforcement.dwg for RERA submittal.', timestamp: '2026-07-10 03:15 PM', metaData: 'DOC-DWG-002' },
  { id: 'ACT-904', employeeId: 'EMP-004', type: 'Meeting', title: 'CRM Client Pitch', description: 'Led initial pitch meeting with Amara Group Accounts Executive.', timestamp: '2026-07-12 11:00 AM' }
];

// DMS FOLDERS & FILES
export const INITIAL_FOLDERS: Folder[] = [
  { id: 'FLD-PRJ', name: 'Project Designs & Blueprints', parentFolderId: null, createdAt: '2026-01-10', isArchived: false },
  { id: 'FLD-LGL', name: 'Legal Contracts & RERA', parentFolderId: null, createdAt: '2026-01-15', isArchived: false },
  { id: 'FLD-FIN', name: 'Financial Invoices & POs', parentFolderId: null, createdAt: '2026-02-01', isArchived: false },
  { id: 'FLD-HR', name: 'HR Employee Dossiers', parentFolderId: null, createdAt: '2026-02-15', isArchived: false },
  { id: 'FLD-PRJ-AMARA', name: 'Amara Sky Towers', parentFolderId: 'FLD-PRJ', createdAt: '2026-02-20', isArchived: false },
  { id: 'FLD-PRJ-GIGA', name: 'Giga Logistics Park', parentFolderId: 'FLD-PRJ', createdAt: '2026-02-21', isArchived: false }
];

export const INITIAL_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'DOC-PRJ-001',
    title: 'Amara_Structural_Stability_RERA_Certificate',
    documentType: 'pdf',
    category: 'Project Documents',
    owner: 'Rajeev Malhotra',
    department: 'Engineering & Construction',
    folderId: 'FLD-PRJ-AMARA',
    relatedProjectId: 'Amara Sky Towers',
    relatedRfqId: 'RC-RFQ-0941',
    uploadDate: '2026-07-10',
    lastUpdated: '2026-07-10',
    version: '1.0',
    status: 'Approved',
    description: 'Certified structural stability certificate issued by IIT Civil Audit Board for Amara high rise levels 1 to 25.',
    sharingSettings: {
      type: 'Project',
      projectsAllowed: ['Amara Sky Towers']
    },
    versionHistory: [
      { version: '1.0', updatedBy: 'Rajeev Malhotra', updatedAt: '2026-07-10 09:30 AM', changeNote: 'Initial certified blueprint audit release.' }
    ]
  },
  {
    id: 'DOC-DWG-002',
    title: 'Amara_TMT_Slab_Reinforcement',
    documentType: 'dwg',
    category: 'Technical Drawings',
    owner: 'Rajeev Malhotra',
    department: 'Engineering & Construction',
    folderId: 'FLD-PRJ-AMARA',
    relatedProjectId: 'Amara Sky Towers',
    uploadDate: '2026-07-12',
    lastUpdated: '2026-07-15',
    version: '1.1',
    status: 'Active',
    description: 'Detailed structural slab drawing showing Fe550 rebar alignment for Level 16 casting.',
    sharingSettings: {
      type: 'Department',
      departmentsAllowed: ['Engineering & Construction']
    },
    versionHistory: [
      { version: '1.1', updatedBy: 'Rajeev Malhotra', updatedAt: '2026-07-15 02:00 PM', changeNote: 'Modified column offsets to match revised elevator specs.' },
      { version: '1.0', updatedBy: 'Rajeev Malhotra', updatedAt: '2026-07-12 11:30 AM', changeNote: 'Initial blueprint draft.' }
    ]
  },
  {
    id: 'DOC-LGL-001',
    title: 'Amara_Land_Title_Due_Diligence_Report',
    documentType: 'pdf',
    category: 'Legal Documents',
    owner: 'Meenakshi Iyer',
    department: 'Legal & Compliance',
    folderId: 'FLD-LGL',
    relatedCrmId: 'Rajesh Aggarwal',
    relatedLeadId: 'LD-4412',
    uploadDate: '2026-06-28',
    lastUpdated: '2026-06-28',
    version: '1.0',
    status: 'Approved',
    description: 'Title audit confirming unencumbered clear title deed of Noida Sector-62 plot for Amara Towers.',
    sharingSettings: {
      type: 'Internal'
    },
    versionHistory: [
      { version: '1.0', updatedBy: 'Meenakshi Iyer', updatedAt: '2026-06-28 04:30 PM', changeNote: 'Deed register search cleared successfully.' }
    ]
  },
  {
    id: 'DOC-INV-001',
    title: 'Invoice_RC-INV-8801_Rajesh_Aggarwal',
    documentType: 'pdf',
    category: 'Invoices',
    owner: 'Vikram Grover',
    department: 'Finance & Accounts',
    folderId: 'FLD-FIN',
    relatedCrmId: 'Rajesh Aggarwal',
    relatedProjectId: 'Amara Sky Towers',
    uploadDate: '2026-07-12',
    lastUpdated: '2026-07-12',
    version: '1.0',
    status: 'Active',
    description: 'Milestone 1 invoice of ₹12,00,000 for slab mobilization.',
    sharingSettings: {
      type: 'Role-Based',
      rolesAllowed: ['Finance', 'Manager']
    },
    versionHistory: [
      { version: '1.0', updatedBy: 'Vikram Grover', updatedAt: '2026-07-12 11:45 AM', changeNote: 'Issued ledger link invoice.' }
    ]
  },
  {
    id: 'DOC-POL-002',
    title: 'RealtyConnect_Enterprise_HR_Policy_Handbook',
    documentType: 'pdf',
    category: 'Policies',
    owner: 'Ananya Sharma',
    department: 'Human Resources & Talent',
    folderId: 'FLD-HR',
    uploadDate: '2026-01-01',
    lastUpdated: '2026-01-01',
    version: '2.4',
    status: 'Approved',
    description: 'Updated employee handbook detailing code of conduct, remote operations protocol, and leaves.',
    sharingSettings: {
      type: 'Internal'
    },
    versionHistory: [
      { version: '2.4', updatedBy: 'Ananya Sharma', updatedAt: '2026-01-01 09:00 AM', changeNote: 'Added new hybrid operation policy clauses.' }
    ]
  },
  {
    id: 'DOC-MKT-010',
    title: 'Amara_Corporate_Brochure_Premium',
    documentType: 'pdf',
    category: 'Marketing Files',
    owner: 'Nisha Singhal',
    department: 'Sales & Marketing',
    folderId: 'FLD-PRJ-AMARA',
    relatedMarketplaceId: 'Amara Luxury Suite Space',
    uploadDate: '2026-07-05',
    lastUpdated: '2026-07-05',
    version: '1.0',
    status: 'Active',
    description: 'High-resolution PDF brochure displaying luxury layout specs and pricing structures.',
    sharingSettings: {
      type: 'Internal'
    },
    versionHistory: [
      { version: '1.0', updatedBy: 'Nisha Singhal', updatedAt: '2026-07-05 10:00 AM', changeNote: 'Completed brochures.' }
    ]
  }
];

export const INITIAL_HR_DMS_NOTIFICATIONS: HrDmsNotification[] = [
  { id: 'NTF-001', type: 'Employee Added', message: 'New employee Rahul Roy registered as Site Supervisor in Engineering.', timestamp: '2026-07-18 02:30 PM', read: false },
  { id: 'NTF-002', type: 'Interview Scheduled', message: 'Interview scheduled for Devashish Sen for job: Senior MEP Coordinator.', timestamp: '2026-07-19 11:00 AM', read: false },
  { id: 'NTF-003', type: 'Document Uploaded', message: 'Document Amara_TMT_Slab_Reinforcement uploaded by Rajeev Malhotra.', timestamp: '2026-07-15 02:05 PM', read: true },
  { id: 'NTF-004', type: 'Document Approved', message: 'Amara_Structural_Stability_RERA_Certificate approved by Legal team.', timestamp: '2026-07-10 12:00 PM', read: true }
];
