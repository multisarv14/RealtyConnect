import { errorMessage } from '../lib/api';
import { formatBytes, saveFile, uploadFile } from '../lib/files';
import React, { useState } from 'react';
import { 
  Folder as FolderIcon, FileText, Plus, PlusCircle, Search, Grid, List, 
  Trash2, X, Share2, Download, History, Tag, ShieldCheck, ChevronRight, 
  Building2, ArrowRight, RefreshCw, Layers, Edit3, Eye, Calendar, User, 
  FileCheck, Star, Sparkles, FolderPlus, HelpCircle, Archive, ArrowUpRight
} from 'lucide-react';
import { 
  DocumentRecord, Folder, DocumentVersion, Employee 
} from './hrDmsMockData';

interface BusinessDmsViewProps {
  documents: DocumentRecord[];
  setDocuments: React.Dispatch<React.SetStateAction<DocumentRecord[]>>;
  folders: Folder[];
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
  employees: Employee[];
  addNotification: (type: 'Employee Added' | 'Interview Scheduled' | 'Candidate Selected' | 'Document Uploaded' | 'Document Shared' | 'Document Approved' | 'New Version Available', message: string) => void;
  onLogTriggered: (action: string, entity: string, entityId: string, status: 'SUCCESS' | 'FAILURE' | 'WARNING', details: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function BusinessDmsView({
  documents, setDocuments,
  folders, setFolders,
  employees,
  addNotification,
  onLogTriggered,
  showToast
}: BusinessDmsViewProps) {

  // DMS subtab: 'explorer' | 'integrations' | 'reports'
  const [dmsSubTab, setDmsSubTab] = useState<'explorer' | 'integrations' | 'reports'>('explorer');

  // Breadcrumb folder history tracking
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // Layout & Search Filters
  const [docSearch, setDocSearch] = useState('');
  const [docCategoryFilter, setDocCategoryFilter] = useState('All');
  const [docStatusFilter, setDocStatusFilter] = useState('All');
  const [docOwnerFilter, setDocOwnerFilter] = useState('All');
  const [docLayout, setDocLayout] = useState<'grid' | 'list'>('grid');

  // Selected Detail views
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);

  // Sharing states
  const [isSharingModalOpen, setIsSharingModalOpen] = useState(false);
  const [shareType, setShareType] = useState<'Internal' | 'Department' | 'Project' | 'Role-Based'>('Internal');
  const [shareRolesAllowed, setShareRolesAllowed] = useState<string[]>([]);
  const [shareDeptsAllowed, setShareDeptsAllowed] = useState<string[]>([]);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Upload Form
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: 'Project Documents' as DocumentRecord['category'],
    documentType: 'pdf',
    owner: 'Ananya Sharma',
    department: 'Human Resources & Talent',
    description: '',
    relatedProjectId: '',
    relatedCrmId: '',
    relatedLeadId: '',
    relatedRfqId: '',
    relatedMarketplaceId: ''
  });

  // Version form
  const [newVersionNote, setNewVersionNote] = useState('');

  // Active Integration filter
  const [activeIntegrationModule, setActiveIntegrationModule] = useState<string>('CRM');

  // Drag over state for upload drag & drop visual feedback
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ fileId: string; name: string; size: string } | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const attachFile = async (file: File) => {
    setIsUploadingFile(true);
    try {
      const stored = await uploadFile(file);
      setPendingFile({ fileId: stored.id, name: stored.name, size: formatBytes(stored.size) });
      const base = stored.name.substring(0, stored.name.lastIndexOf('.')) || stored.name;
      setUploadForm(prev => ({ ...prev, title: prev.title || base, documentType: stored.name.split('.').pop() || 'pdf' }));
    } catch (err) {
      showToast(errorMessage(err), 'error');
    } finally {
      setIsUploadingFile(false);
    }
  };

  // Folder actions
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const newFld: Folder = {
      id: `FLD-${Date.now().toString().slice(-4)}`,
      name: newFolderName.trim(),
      parentFolderId: currentFolderId,
      createdAt: new Date().toISOString().split('T')[0],
      isArchived: false
    };

    setFolders(prev => [...prev, newFld]);
    setNewFolderName('');
    setIsNewFolderOpen(false);
    showToast(`Folder "${newFld.name}" created!`, 'success');
    onLogTriggered('DMS_FOLDER_CREATED', 'folders', newFld.id, 'SUCCESS', `Created folder ${newFld.name}`);
  };

  const handleDeleteFolder = (fldId: string) => {
    if (confirm('Are you sure you want to delete this folder? This will move documents inside back to Root.')) {
      setFolders(prev => prev.filter(f => f.id !== fldId));
      setDocuments(prev => prev.map(d => d.folderId === fldId ? { ...d, folderId: null } : d));
      showToast('Folder deleted successfully.', 'info');
      onLogTriggered('DMS_FOLDER_DELETED', 'folders', fldId, 'SUCCESS', `Deleted folder`);
    }
  };

  // Document Upload
  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.title) {
      showToast('Please specify a document title.', 'error');
      return;
    }
    if (!pendingFile) {
      showToast('Attach a file first.', 'error');
      return;
    }

    const newDoc: DocumentRecord = {
      id: `DOC-${uploadForm.category.slice(0,3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
      fileId: pendingFile.fileId,
      fileName: pendingFile.name,
      title: uploadForm.title.replace(/\s+/g, '_'),
      documentType: uploadForm.documentType,
      category: uploadForm.category,
      owner: uploadForm.owner,
      department: uploadForm.department,
      folderId: currentFolderId,
      relatedProjectId: uploadForm.relatedProjectId || undefined,
      relatedCrmId: uploadForm.relatedCrmId || undefined,
      relatedLeadId: uploadForm.relatedLeadId || undefined,
      relatedRfqId: uploadForm.relatedRfqId || undefined,
      relatedMarketplaceId: uploadForm.relatedMarketplaceId || undefined,
      uploadDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      version: '1.0',
      status: 'Active',
      description: uploadForm.description || 'Standard corporate asset upload.',
      sharingSettings: { type: 'Internal' },
      versionHistory: [
        { version: '1.0', updatedBy: uploadForm.owner, updatedAt: new Date().toLocaleString(), changeNote: 'Initial upload release.' }
      ]
    };

    setDocuments(prev => [newDoc, ...prev]);
    setIsUploadOpen(false);
    // Reset form
    setUploadForm(prev => ({ ...prev, title: '', description: '' }));
    setPendingFile(null);
    
    showToast(`Document "${newDoc.title}" registered!`, 'success');
    addNotification('Document Uploaded', `Document ${newDoc.title} has been uploaded to the registry.`);
    onLogTriggered('DMS_DOCUMENT_UPLOADED', 'documents', newDoc.id, 'SUCCESS', `Uploaded document ${newDoc.title}`);
  };

  // Add Document Version
  const handleAddNewVersion = (docId: string) => {
    if (!newVersionNote.trim()) {
      showToast('Please specify a change log note.', 'error');
      return;
    }

    setDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        const currentVerNum = parseFloat(doc.version) || 1.0;
        const nextVerNum = (currentVerNum + 0.1).toFixed(1);
        const newVerObj: DocumentVersion = {
          version: nextVerNum,
          updatedBy: 'Ananya Sharma', // Default actor HR
          updatedAt: new Date().toLocaleString(),
          changeNote: newVersionNote
        };
        const updatedDoc = {
          ...doc,
          version: nextVerNum,
          lastUpdated: new Date().toISOString().split('T')[0],
          versionHistory: [newVerObj, ...doc.versionHistory]
        };
        setSelectedDoc(updatedDoc);
        return updatedDoc;
      }
      return doc;
    }));

    setNewVersionNote('');
    showToast('New version registered successfully!', 'success');
    addNotification('New Version Available', `New version ${selectedDoc ? (parseFloat(selectedDoc.version)+0.1).toFixed(1) : ''} of document is available.`);
    onLogTriggered('DMS_VERSION_ADDED', 'documents', docId, 'SUCCESS', `Registered new file version`);
  };

  const handleUpdateDocumentStatus = (docId: string, nextStatus: DocumentRecord['status']) => {
    setDocuments(prev => prev.map(d => {
      if (d.id === docId) {
        if (nextStatus === 'Approved') {
          addNotification('Document Approved', `Document "${d.title}" approved by department head.`);
        }
        const updated = { ...d, status: nextStatus };
        if (selectedDoc?.id === docId) {
          setSelectedDoc(updated);
        }
        return updated;
      }
      return d;
    }));
    showToast(`Status updated to ${nextStatus}`, 'success');
    onLogTriggered('DMS_STATUS_UPDATED', 'documents', docId, 'SUCCESS', `Changed status to ${nextStatus}`);
  };

  const handleUpdateSharingSettings = (docId: string) => {
    setDocuments(prev => prev.map(d => {
      if (d.id === docId) {
        const updated = {
          ...d,
          sharingSettings: {
            type: shareType,
            rolesAllowed: shareType === 'Role-Based' ? shareRolesAllowed : undefined,
            departmentsAllowed: shareType === 'Department' ? shareDeptsAllowed : undefined
          }
        };
        setSelectedDoc(updated);
        return updated;
      }
      return d;
    }));
    setIsSharingModalOpen(false);
    showToast('Sharing policies successfully updated.', 'success');
    addNotification('Document Shared', `Updated secure access permissions for file.`);
    onLogTriggered('DMS_SHARE_UPDATED', 'documents', docId, 'SUCCESS', `Updated file share policy to ${shareType}`);
  };

  // Filtering Logic
  const filteredFolders = folders.filter(f => f.parentFolderId === currentFolderId && !f.isArchived);

  const filteredDocuments = documents.filter(doc => {
    // Only show inside current folder if in Explorer mode
    const insideFolder = dmsSubTab !== 'explorer' || doc.folderId === currentFolderId;

    const matchesSearch = doc.title.toLowerCase().includes(docSearch.toLowerCase()) || 
                          doc.description.toLowerCase().includes(docSearch.toLowerCase()) ||
                          doc.category.toLowerCase().includes(docSearch.toLowerCase()) ||
                          (doc.relatedProjectId && doc.relatedProjectId.toLowerCase().includes(docSearch.toLowerCase()));

    const matchesCategory = docCategoryFilter === 'All' || doc.category === docCategoryFilter;
    const matchesStatus = docStatusFilter === 'All' || doc.status === docStatusFilter;
    const matchesOwner = docOwnerFilter === 'All' || doc.owner === docOwnerFilter;

    return insideFolder && matchesSearch && matchesCategory && matchesStatus && matchesOwner;
  });

  // Integrations mapping lists
  const getIntegratedDocuments = (module: string) => {
    return documents.filter(doc => {
      if (module === 'CRM') return doc.category === 'Contracts' || doc.category === 'Agreements' || !!doc.relatedCrmId;
      if (module === 'PROJECTS') return doc.category === 'Technical Drawings' || doc.category === 'Project Documents' || !!doc.relatedProjectId;
      if (module === 'PROCUREMENT') return doc.category === 'Purchase Documents' || !!doc.relatedSupplier;
      if (module === 'FINANCE') return doc.category === 'Invoices' || !!doc.relatedProjectId;
      if (module === 'HR') return doc.category === 'HR Documents' || doc.category === 'Employee Documents' || doc.category === 'Policies';
      if (module === 'MEETINGS') return doc.category === 'Project Documents' && doc.description.includes('Meeting');
      if (module === 'RFQ') return !!doc.relatedRfqId || doc.description.includes('Tender');
      if (module === 'MARKETPLACE') return doc.category === 'Marketing Files' || !!doc.relatedMarketplaceId;
      return false;
    });
  };

  // Helper for Breadcrumb Trail navigation
  const getBreadcrumbs = () => {
    const trail: { id: string | null; name: string }[] = [{ id: null, name: 'DMS Registry' }];
    if (!currentFolderId) return trail;

    let targetId: string | null = currentFolderId;
    const path: { id: string | null; name: string }[] = [];
    while (targetId) {
      const fld = folders.find(f => f.id === targetId);
      if (fld) {
        path.unshift({ id: fld.id, name: fld.name });
        targetId = fld.parentFolderId;
      } else {
        break;
      }
    }
    return [...trail, ...path];
  };

  return (
    <div className="space-y-6">
      
      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/40 rounded-lg border border-slate-850">
          {[
            { id: 'explorer', label: 'File Explorer', icon: FolderIcon },
            { id: 'integrations', label: 'Enterprise Integrations', icon: Layers },
            { id: 'reports', label: 'DMS Audit Reports', icon: FileCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setDmsSubTab(tab.id as any);
                  onLogTriggered('DMS_SUBTAB_SWITCHED', 'dms', tab.id, 'SUCCESS', `Switched to DMS: ${tab.label}`);
                }}
                className={`px-3 py-1 rounded text-xs font-semibold tracking-tight transition-all flex items-center gap-2 ${
                  dmsSubTab === tab.id
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {dmsSubTab === 'explorer' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNewFolderOpen(true)}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Create Folder</span>
            </button>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SUBTAB 1: EXPLORER VIEW */}
      {/* ========================================================= */}
      {dmsSubTab === 'explorer' && (
        <div className="space-y-4 text-left">
          
          {/* Breadcrumb path */}
          <div className="flex items-center gap-2.5 text-xs text-slate-400 font-mono bg-slate-950 p-2.5 rounded border border-slate-900">
            {getBreadcrumbs().map((crumb, idx, arr) => (
              <React.Fragment key={idx}>
                <button
                  onClick={() => setCurrentFolderId(crumb.id)}
                  className={`hover:text-emerald-400 font-semibold cursor-pointer ${
                    idx === arr.length - 1 ? 'text-white font-bold' : ''
                  }`}
                >
                  {crumb.name}
                </button>
                {idx < arr.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
              </React.Fragment>
            ))}
          </div>

          {/* Explorer Search Filters */}
          <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search files by title, description, project, CRM client..."
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Layout toggler */}
              <div className="flex items-center bg-slate-950 border border-slate-900 p-0.5 rounded-lg">
                <button
                  onClick={() => setDocLayout('grid')}
                  className={`p-1.5 rounded ${docLayout === 'grid' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDocLayout('list')}
                  className={`p-1.5 rounded ${docLayout === 'list' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick selectors */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[10px] text-slate-500 font-mono uppercase mb-1 font-bold">Document Category</label>
                <select
                  value={docCategoryFilter}
                  onChange={(e) => setDocCategoryFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-300"
                >
                  <option value="All">All Categories</option>
                  <option value="Project Documents">Project Documents</option>
                  <option value="Contracts">Contracts</option>
                  <option value="Agreements">Agreements</option>
                  <option value="Invoices">Invoices</option>
                  <option value="HR Documents">HR Documents</option>
                  <option value="Employee Documents">Employee Documents</option>
                  <option value="Technical Drawings">Technical Drawings</option>
                  <option value="Marketing Files">Marketing Files</option>
                  <option value="Legal Documents">Legal Documents</option>
                  <option value="Policies">Policies</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-mono uppercase mb-1 font-bold">Status</label>
                <select
                  value={docStatusFilter}
                  onChange={(e) => setDocStatusFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-300"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Approved">Approved</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-mono uppercase mb-1 font-bold">Owner</label>
                <select
                  value={docOwnerFilter}
                  onChange={(e) => setDocOwnerFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-300"
                >
                  <option value="All">All Owners</option>
                  {Array.from(new Set(documents.map(d => d.owner))).map(owner => (
                    <option key={owner} value={owner}>{owner}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Grid Folder Listing */}
          {filteredFolders.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase block">Folders</span>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {filteredFolders.map((fld) => (
                  <div 
                    key={fld.id}
                    className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl hover:border-emerald-500/30 hover:bg-slate-900/60 transition-all cursor-pointer flex items-center justify-between group"
                    onClick={() => setCurrentFolderId(fld.id)}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FolderIcon className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span className="text-xs font-bold text-white truncate">{fld.name}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteFolder(fld.id); }}
                      className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files section */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase block">Documents ({filteredDocuments.length})</span>
            
            {filteredDocuments.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/10 border border-dashed border-slate-900 rounded-xl text-slate-500 italic text-xs">
                No enterprise files found in this folder path matching filters.
              </div>
            ) : docLayout === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredDocuments.map((doc) => (
                  <div 
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className="p-4 bg-slate-900/40 border border-slate-900 rounded-xl hover:border-emerald-500/40 hover:bg-slate-900/60 transition-all cursor-pointer flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">{doc.id}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          doc.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' :
                          doc.status === 'Under Review' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-500/10 text-slate-400'
                        }`}>{doc.status}</span>
                      </div>

                      <div className="flex items-start gap-2.5 mt-3">
                        <FileText className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{doc.title}</h4>
                          <p className="text-[9px] font-mono text-slate-500 uppercase">{doc.documentType} | v{doc.version}</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 truncate">{doc.description}</p>

                    <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-500 flex items-center justify-between">
                      <span>Owner: {doc.owner}</span>
                      <span>{doc.uploadDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List layout of documents
              <div className="bg-slate-900/20 border border-slate-900 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900/60 border-b border-slate-850 font-mono text-[10px] text-slate-400 uppercase">
                    <tr>
                      <th className="p-3">File ID & Title</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Uploaded Date</th>
                      <th className="p-3">Owner</th>
                      <th className="p-3">Version</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {filteredDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-3 flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div>
                            <p className="font-bold text-white">{doc.title}</p>
                            <p className="text-[10px] font-mono text-slate-500">{doc.id}</p>
                          </div>
                        </td>
                        <td className="p-3 text-slate-300 font-medium">{doc.category}</td>
                        <td className="p-3 text-slate-400">{doc.uploadDate}</td>
                        <td className="p-3 text-slate-400">{doc.owner}</td>
                        <td className="p-3 font-mono text-emerald-400 font-semibold">v{doc.version}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            doc.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' :
                            doc.status === 'Under Review' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-500/10 text-slate-400'
                          }`}>{doc.status}</span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedDoc(doc)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded text-[10px] uppercase font-bold"
                          >
                            DMS Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 2: ENTERPRISE INTEGRATIONS MODULE */}
      {/* ========================================================= */}
      {dmsSubTab === 'integrations' && (
        <div className="space-y-6 text-left">
          
          <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl space-y-2">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Cross-Sprint Integrated Document Hub</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Browse, filter, and audit documents across all active business modules in the RealtyConnect enterprise directory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Sidebar Modules Selectors */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-3 flex flex-col gap-1.5">
              {[
                { id: 'CRM', label: 'CRM & Client Records', desc: 'Contracts, Agreements, deeds' },
                { id: 'PROJECTS', label: 'Project Blueprints', desc: 'Technical Drawings, approvals' },
                { id: 'PROCUREMENT', label: 'Procurement POs', desc: 'Purchase orders, vendor dossiers' },
                { id: 'FINANCE', label: 'Finance Invoices', desc: 'Milestone Invoices, Receipts' },
                { id: 'HR', label: 'HR Onboarding Files', desc: 'Employee folders, policies' },
                { id: 'MEETINGS', label: 'Meetings Minutes', desc: 'Meeting agenda documents' },
                { id: 'RFQ', label: 'RFQ & Tenders', desc: 'Tender submittals, proposals' },
                { id: 'MARKETPLACE', label: 'Marketplace Catalogs', desc: 'Products brochures, brochures' }
              ].map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => setActiveIntegrationModule(mod.id)}
                  className={`p-3 rounded-lg text-left transition-all ${
                    activeIntegrationModule === mod.id
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'hover:bg-slate-850 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <p className="text-xs font-bold leading-tight">{mod.label}</p>
                  <p className={`text-[9px] mt-0.5 ${activeIntegrationModule === mod.id ? 'text-slate-800' : 'text-slate-500'}`}>{mod.desc}</p>
                </button>
              ))}
            </div>

            {/* Content Integrations Browser */}
            <div className="md:col-span-3 space-y-4">
              <div className="p-3 bg-slate-950 rounded border border-slate-900 flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Integrated Category: {activeIntegrationModule} Documents
                </span>
                <span className="text-[10px] font-mono text-emerald-400">Security Rule Mapped</span>
              </div>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {getIntegratedDocuments(activeIntegrationModule).map((doc) => (
                  <div 
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className="p-3.5 bg-slate-900/30 border border-slate-900 rounded-xl hover:border-emerald-500/40 hover:bg-slate-900/60 transition-all cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-emerald-400">{doc.id}</span>
                        <span className="text-[10px] font-mono text-slate-500">| v{doc.version}</span>
                      </div>
                      <h4 className="font-extrabold text-slate-200">{doc.title}</h4>
                      <p className="text-slate-400 text-[11px]">{doc.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono bg-slate-950 border border-slate-900 text-slate-400 px-2 py-0.5 rounded font-bold">
                        {doc.status}
                      </span>
                      <p className="text-[10px] text-slate-500 font-mono mt-1">{doc.uploadDate}</p>
                    </div>
                  </div>
                ))}

                {getIntegratedDocuments(activeIntegrationModule).length === 0 && (
                  <p className="text-xs text-slate-500 italic text-center p-8 bg-slate-900/10 rounded-xl border border-dashed border-slate-900">
                    No documents currently linked to the {activeIntegrationModule} category. Uploading a document and selecting relevant links will associate files here.
                  </p>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 3: DMS AUDIT REPORTS */}
      {/* ========================================================= */}
      {dmsSubTab === 'reports' && (
        <div className="space-y-6 text-left">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Category Breakdown list */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 space-y-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider block border-b border-slate-900 pb-2">Category distribution chart</span>
              <div className="space-y-3.5">
                {['Project Documents', 'Contracts', 'Technical Drawings', 'Policies', 'Invoices'].map((cat, i) => {
                  const count = documents.filter(d => d.category === cat).length;
                  const pct = Math.round((count / documents.length) * 100) || 5;
                  return (
                    <div key={i} className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-300 font-medium">{cat}</span>
                        <span className="text-slate-500 font-mono">{count} Files ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DMS Audit activity logs */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 space-y-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider block border-b border-slate-900 pb-2">Document Audit Logs</span>
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {[
                  { title: 'Stability Certificate approved', user: 'Legal Head', time: '2026-07-10 12:00 PM' },
                  { title: 'Drawing version 1.1 published', user: 'Rajeev Malhotra', time: '2026-07-15 02:00 PM' },
                  { title: 'HR Policy handbook indexed', user: 'Ananya Sharma', time: '2026-01-01 09:00 AM' }
                ].map((log, idx) => (
                  <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-900 flex justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-300">{log.title}</p>
                      <p className="text-[10px] text-slate-500">By: {log.user}</p>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 shrink-0">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <div>
              <p className="font-bold text-white">Generate DMS Compliance Log & Certification</p>
              <p className="text-slate-400">Compile audit indices, category metrics, and historical logs into a secure PDF register.</p>
            </div>
            <button
              onClick={() => {
                showToast('DMS Compliance register compiled & exported! (Simulated)', 'success');
                onLogTriggered('DMS_COMPLIANCE_DOWNLOAD', 'dms', 'all', 'SUCCESS', 'Exported consolidated DMS registry logs.');
              }}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-lg uppercase tracking-wide cursor-pointer"
            >
              Export DMS Compliance Data
            </button>
          </div>

        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 1: FILE UPLOAD */}
      {/* ========================================== */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>Upload Corporate Document</span>
              </h3>
              <button onClick={() => setIsUploadOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drag and Drop Zone */}
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files[0];
                if (file) void attachFile(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-xl text-center space-y-2 transition-all cursor-pointer ${
                isDragging ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 bg-slate-950/40'
              }`}
            >
              <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" hidden onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void attachFile(f); }} />
              <Sparkles className="w-8 h-8 text-emerald-400 mx-auto" />
              {isUploadingFile ? (
                <p className="text-xs font-bold text-white">Uploading...</p>
              ) : pendingFile ? (
                <p className="text-xs font-bold text-emerald-400">{pendingFile.name} ({pendingFile.size}) is ready. Fill in the details and register it.</p>
              ) : (
                <>
                  <p className="text-xs font-bold text-white">Drag and drop your file here, or click to browse</p>
                  <p className="text-[10px] text-slate-500 font-mono">PDF, PNG or JPEG, up to the size your plan allows</p>
                </>
              )}
            </div>

            <form onSubmit={handleUploadDocument} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono text-slate-500 block">Document Title *</label>
                  <input
                    type="text"
                    required
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1.5 text-slate-200"
                    placeholder="Amara_Stability_Audit"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono text-slate-500 block">Document Category</label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1.5 text-slate-300"
                  >
                    <option value="Project Documents">Project Documents</option>
                    <option value="Contracts">Contracts</option>
                    <option value="Agreements">Agreements</option>
                    <option value="Invoices">Invoices</option>
                    <option value="Purchase Documents">Purchase Documents</option>
                    <option value="HR Documents">HR Documents</option>
                    <option value="Employee Documents">Employee Documents</option>
                    <option value="Technical Drawings">Technical Drawings</option>
                    <option value="Marketing Files">Marketing Files</option>
                    <option value="Legal Documents">Legal Documents</option>
                    <option value="Policies">Policies</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono text-slate-500 block">Document Type</label>
                  <input
                    type="text"
                    required
                    value={uploadForm.documentType}
                    onChange={(e) => setUploadForm({ ...uploadForm, documentType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1.5 text-slate-200"
                    placeholder="pdf"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono text-slate-500 block">Document Owner</label>
                  <select
                    value={uploadForm.owner}
                    onChange={(e) => setUploadForm({ ...uploadForm, owner: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1.5 text-slate-300"
                  >
                    {employees.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Cross sprint integrations optional mappings */}
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg space-y-2">
                <span className="text-[9px] font-mono uppercase text-slate-500 font-bold block">Cross-Module Integration Linkings (Optional)</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <input
                    type="text"
                    placeholder="Related Project Name (e.g. Amara Sky)"
                    value={uploadForm.relatedProjectId}
                    onChange={(e) => setUploadForm({ ...uploadForm, relatedProjectId: e.target.value })}
                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300"
                  />
                  <input
                    type="text"
                    placeholder="Related CRM Client (e.g. Rajesh Aggarwal)"
                    value={uploadForm.relatedCrmId}
                    onChange={(e) => setUploadForm({ ...uploadForm, relatedCrmId: e.target.value })}
                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono text-slate-500 block">Short Description</label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1.5 text-slate-200"
                  placeholder="Structural audit calculations or corporate policy updates..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded uppercase tracking-wider text-center cursor-pointer font-sans"
              >
                Register & Upload to DMS
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 2: CREATE NEW FOLDER */}
      {/* ========================================== */}
      {isNewFolderOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-6 space-y-4 text-left shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-extrabold text-white">Create New Folder</h3>
              <button onClick={() => setIsNewFolderOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono text-slate-500 block">Folder Name</label>
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-slate-200"
                  placeholder="e.g. RFQ Documents"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded uppercase"
              >
                Create Folder
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* DRAWER: DOCUMENT DETAILED INFO & VERSIONS */}
      {/* ========================================== */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-end p-0 md:p-4">
          <div className="bg-slate-900 border-l border-slate-800 md:border md:rounded-xl max-w-xl w-full h-full md:h-[95vh] shadow-2xl flex flex-col justify-between text-left">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">{selectedDoc.id}</span>
                <h3 className="text-sm font-extrabold text-white mt-0.5">DMS Document Properties</h3>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="p-1 rounded hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable info */}
            <div className="p-5 flex-1 overflow-y-auto space-y-5 text-xs">
              
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-850 flex items-start gap-3">
                <FileText className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-sm font-extrabold text-white truncate">{selectedDoc.title}</h4>
                  <p className="text-emerald-400 font-mono text-[10px]">Type: {selectedDoc.documentType} | Category: {selectedDoc.category}</p>
                  <p className="text-slate-500 text-[10px]">{selectedDoc.description}</p>
                </div>
              </div>

              {/* Grid properties */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-950/60 rounded border border-slate-900 space-y-1">
                  <span className="text-slate-500 uppercase font-mono text-[9px] block">Corporate Properties</span>
                  <p className="text-slate-300">Owner: <span className="text-white font-bold">{selectedDoc.owner}</span></p>
                  <p className="text-slate-300">Department: <span className="text-white">{selectedDoc.department}</span></p>
                </div>

                <div className="p-3 bg-slate-950/60 rounded border border-slate-900 space-y-1">
                  <span className="text-slate-500 uppercase font-mono text-[9px] block">DMS Audit Index</span>
                  <p className="text-slate-300">Upload Date: <span className="text-white">{selectedDoc.uploadDate}</span></p>
                  <p className="text-slate-300">Latest Version: <span className="text-emerald-400 font-bold font-mono">v{selectedDoc.version}</span></p>
                </div>
              </div>

              {/* Linked Integration properties */}
              {(selectedDoc.relatedProjectId || selectedDoc.relatedCrmId || selectedDoc.relatedRfqId || selectedDoc.relatedMarketplaceId) && (
                <div className="p-3 bg-emerald-500/5 rounded border border-emerald-500/10 space-y-1.5">
                  <span className="text-[9px] font-mono uppercase text-emerald-400 font-bold block">Sprint Integration Linkings</span>
                  {selectedDoc.relatedProjectId && <p className="text-slate-300 font-medium">Project Name: <span className="text-white">{selectedDoc.relatedProjectId}</span></p>}
                  {selectedDoc.relatedCrmId && <p className="text-slate-300 font-medium">CRM Client Name: <span className="text-white">{selectedDoc.relatedCrmId}</span></p>}
                  {selectedDoc.relatedRfqId && <p className="text-slate-300 font-medium">Linked RFQ ID: <span className="text-white">{selectedDoc.relatedRfqId}</span></p>}
                  {selectedDoc.relatedMarketplaceId && <p className="text-slate-300 font-medium">Marketplace Listing: <span className="text-white">{selectedDoc.relatedMarketplaceId}</span></p>}
                </div>
              )}

              {/* Access Share Policies display */}
              <div className="p-3 bg-slate-950 rounded border border-slate-850 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Secure Access Shares policy</span>
                  <button 
                    onClick={() => {
                      setShareType(selectedDoc.sharingSettings.type);
                      setShareRolesAllowed(selectedDoc.sharingSettings.rolesAllowed || []);
                      setShareDeptsAllowed(selectedDoc.sharingSettings.departmentsAllowed || []);
                      setIsSharingModalOpen(true);
                    }}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 uppercase font-bold flex items-center gap-1"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>Change policy</span>
                  </button>
                </div>

                <div className="text-xs text-slate-300 space-y-1">
                  <p>Type: <span className="font-bold text-white">{selectedDoc.sharingSettings.type} Sharing</span></p>
                  {selectedDoc.sharingSettings.type === 'Role-Based' && (
                    <p className="text-[10px] text-slate-500">Allowed Roles: {selectedDoc.sharingSettings.rolesAllowed?.join(', ') || 'None'}</p>
                  )}
                  {selectedDoc.sharingSettings.type === 'Department' && (
                    <p className="text-[10px] text-slate-500">Allowed Depts: {selectedDoc.sharingSettings.departmentsAllowed?.join(', ') || 'None'}</p>
                  )}
                </div>
              </div>

              {/* Version History */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Versioning History Log</span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {selectedDoc.versionHistory.map((ver, idx) => (
                    <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-900 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-200">Version {ver.version}</p>
                        <p className="text-[10px] text-slate-400">By {ver.updatedBy} - "{ver.changeNote}"</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[9px] text-slate-500 font-mono block">{ver.updatedAt}</span>
                        {idx > 0 && (
                          <button
                            onClick={() => {
                              showToast(`Restored to Version ${ver.version} successfully!`, 'success');
                              handleUpdateDocumentStatus(selectedDoc.id, 'Active');
                            }}
                            className="text-[9px] text-emerald-400 hover:text-emerald-300 underline font-semibold mt-0.5 uppercase cursor-pointer"
                          >
                            Restore Version
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Version publish panel */}
              <div className="p-3 bg-slate-950 rounded border border-slate-850 space-y-2">
                <span className="text-[10px] uppercase font-mono text-slate-500 font-bold block">Publish New Document Revision</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newVersionNote}
                    onChange={(e) => setNewVersionNote(e.target.value)}
                    placeholder="Enter short revision notes (e.g., added section 4)..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 text-xs"
                  />
                  <button
                    onClick={() => handleAddNewVersion(selectedDoc.id)}
                    className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded text-xs uppercase cursor-pointer"
                  >
                    Commit
                  </button>
                </div>
              </div>

            </div>

            {/* Footer triggers */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateDocumentStatus(selectedDoc.id, 'Approved')}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-emerald-400 font-bold rounded text-[10px] uppercase"
                >
                  Approve File
                </button>
                <button
                  onClick={() => handleUpdateDocumentStatus(selectedDoc.id, 'Archived')}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-red-400 font-bold rounded text-[10px] uppercase"
                >
                  Archive File
                </button>
              </div>

              <button
                onClick={() => {
                  if (!selectedDoc.fileId) {
                    showToast('This sample record has no stored file.', 'info');
                    return;
                  }
                  saveFile(selectedDoc.fileId, selectedDoc.fileName || `${selectedDoc.title}.${selectedDoc.documentType}`).then(ok => ok || showToast('The file could not be downloaded.', 'error'));
                  onLogTriggered('DMS_FILE_DOWNLOADED', 'documents', selectedDoc.id, 'SUCCESS', `Downloaded file ${selectedDoc.title}`);
                }}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded uppercase tracking-wider text-[10px] flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Asset</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* SHARING MODAL CONTROL */}
      {/* ========================================== */}
      {isSharingModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-6 space-y-4 text-left shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-extrabold text-white">Update File Security Shares</h3>
              <button onClick={() => setIsSharingModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono text-slate-500 block">Select Sharing Protocol</label>
                <select
                  value={shareType}
                  onChange={(e) => setShareType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1.5 text-slate-300"
                >
                  <option value="Internal">Internal (All Employees)</option>
                  <option value="Department">Department Sharing</option>
                  <option value="Project">Project Sharing</option>
                  <option value="Role-Based">Role-Based Access</option>
                </select>
              </div>

              {shareType === 'Role-Based' && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono text-slate-500 block">Select Roles Allowed</label>
                  <div className="flex flex-wrap gap-1.5 p-2 bg-slate-950 border border-slate-850 rounded">
                    {['Admin', 'Manager', 'Finance', 'Engineer', 'Procurement'].map(role => {
                      const isSelected = shareRolesAllowed.includes(role);
                      return (
                        <button
                          key={role}
                          onClick={() => {
                            if (isSelected) setShareRolesAllowed(prev => prev.filter(r => r !== role));
                            else setShareRolesAllowed(prev => [...prev, role]);
                          }}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          {role}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {shareType === 'Department' && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono text-slate-500 block">Select Departments Allowed</label>
                  <div className="flex flex-col gap-1 p-2 bg-slate-950 border border-slate-850 rounded">
                    {['Engineering & Construction', 'Human Resources & Talent', 'Finance & Accounts', 'Legal & Compliance'].map(dept => {
                      const isSelected = shareDeptsAllowed.includes(dept);
                      return (
                        <button
                          key={dept}
                          onClick={() => {
                            if (isSelected) setShareDeptsAllowed(prev => prev.filter(d => d !== dept));
                            else setShareDeptsAllowed(prev => [...prev, dept]);
                          }}
                          className={`px-2 py-1 rounded text-left text-[10px] font-bold ${
                            isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          {dept}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                onClick={() => handleUpdateSharingSettings(selectedDoc.id)}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded uppercase"
              >
                Apply Sharing Policy
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
