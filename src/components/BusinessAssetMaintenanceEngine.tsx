/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { appStore } from '../lib/appStore';
import React, { useState, useEffect } from 'react';
import { 
  Wrench, Plus, Search, Filter, Calendar, FileText, Briefcase, Users, 
  LayoutDashboard, DollarSign, Activity, AlertTriangle, ShieldCheck, Tag, 
  MapPin, Layers, ClipboardList, Clock, ArrowRight, Share2, MessageSquare, 
  Send, CheckCircle2, RefreshCw, BarChart2, BookOpen, ShoppingBag, Check, X,
  ChevronRight, Trash2, FileCheck, HelpCircle
} from 'lucide-react';

import { 
  Asset, ServiceRequest, AmcContract, INITIAL_ASSETS, INITIAL_SERVICES, 
  INITIAL_AMC_CONTRACTS, SPARE_PARTS_INVENTORY, PROJECTS_ROSTER, 
  DEPARTMENTS_LIST, EMPLOYEES_ROSTER, APPROVED_VENDORS
} from './BusinessAssetMockData';

interface EngineProps {
  userSession: any;
  onLogTriggered: (action: string, entity: string, entityId: string, status: 'SUCCESS' | 'FAILURE' | 'WARNING', details: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  setActiveViewMode: (mode: any) => void;
}

export default function BusinessAssetMaintenanceEngine({
  userSession,
  onLogTriggered,
  showToast,
  setActiveViewMode
}: EngineProps) {
  // --- STATES & STORAGE ---
  const [assets, setAssets] = useState<Asset[]>([]);
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [contracts, setContracts] = useState<AmcContract[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'directory' | 'service' | 'amc' | 'reports' | 'integrations'>('dashboard');

  // Directory Views & Filters
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('All');
  const [customCategories, setCustomCategories] = useState<string[]>(['HVAC Systems', 'MEP Infrastructure']);

  // Selected Entities for Details/Modals
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceRequest | null>(null);

  // Modals & Forms
  const [isNewAssetModalOpen, setIsNewAssetModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isAmcModalOpen, setIsAmcModalOpen] = useState(false);

  // Form states - New Asset
  const [newAsset, setNewAsset] = useState({
    code: '', name: '', category: 'Construction Equipment', subCategory: '',
    manufacturer: '', model: '', serialNumber: '', purchaseDate: new Date().toISOString().split('T')[0],
    purchaseCost: '', warrantyStatus: 'In Warranty' as any, warrantyExpiryDate: '',
    assignedProjectId: '', assignedDepartment: '', assignedEmployeeId: '',
    currentLocation: '', vendorName: 'Global Tech Equipment Ltd', description: ''
  });

  // Form states - Move Asset
  const [movementForm, setMovementForm] = useState({
    type: 'Allocation' as 'Allocation' | 'Transfer' | 'Return' | 'Location Change',
    projectId: '', department: '', employeeId: '', location: '', notes: ''
  });

  // Form states - Service Request / Breakdown
  const [serviceForm, setServiceForm] = useState({
    assetId: '', serviceType: 'Preventive Maintenance' as any, priority: 'Medium' as any,
    description: '', technicianName: 'Rohan Sharma', scheduledDate: new Date().toISOString().split('T')[0],
    serviceCost: ''
  });

  // Form states - AMC Contract
  const [amcForm, setAmcForm] = useState({
    contractNumber: '', contractName: '', vendorName: 'Global Tech Equipment Ltd',
    vendorContact: 'sales@globaltech-equip.in', startDate: new Date().toISOString().split('T')[0],
    endDate: '', serviceFrequency: 'Quarterly' as any, cost: '', coverageDetails: '', linkedAssetId: ''
  });

  // Interactive Discussion and Repair Resolution states
  const [discussionInput, setDiscussionInput] = useState('');
  const [resolutionInput, setResolutionInput] = useState('');
  const [rootCauseInput, setRootCauseInput] = useState('');
  const [downtimeInput, setDowntimeInput] = useState('0');
  const [selectedSparePartId, setSelectedSparePartId] = useState('');
  const [sparePartQty, setSparePartQty] = useState('1');

  // Dynamic Finance Calculator (Useful Life & Depreciation)
  const [deprAssetId, setDeprAssetId] = useState('');
  const [usefulLife, setUsefulLife] = useState(10);
  const [salvageValue, setSalvageValue] = useState(10); // percent

  // Load / Save Local Storage
  useEffect(() => {
    const storedAssets = appStore.getItem('rc_assets');
    const storedServices = appStore.getItem('rc_services');
    const storedContracts = appStore.getItem('rc_contracts');
    const storedCustCats = appStore.getItem('rc_custom_categories');

    if (storedAssets) setAssets(JSON.parse(storedAssets));
    else {
      setAssets(INITIAL_ASSETS);
      appStore.setItem('rc_assets', JSON.stringify(INITIAL_ASSETS));
    }

    if (storedServices) setServices(JSON.parse(storedServices));
    else {
      setServices(INITIAL_SERVICES);
      appStore.setItem('rc_services', JSON.stringify(INITIAL_SERVICES));
    }

    if (storedContracts) setContracts(JSON.parse(storedContracts));
    else {
      setContracts(INITIAL_AMC_CONTRACTS);
      appStore.setItem('rc_contracts', JSON.stringify(INITIAL_AMC_CONTRACTS));
    }

    if (storedCustCats) setCustomCategories(JSON.parse(storedCustCats));
  }, []);

  const saveToStorage = (updatedAssets: Asset[], updatedServices: ServiceRequest[], updatedContracts: AmcContract[]) => {
    setAssets(updatedAssets);
    setServices(updatedServices);
    setContracts(updatedContracts);
    appStore.setItem('rc_assets', JSON.stringify(updatedAssets));
    appStore.setItem('rc_services', JSON.stringify(updatedServices));
    appStore.setItem('rc_contracts', JSON.stringify(updatedContracts));
  };

  const handleAddCustomCategory = (cat: string) => {
    if (!cat.trim() || customCategories.includes(cat)) return;
    const updated = [...customCategories, cat];
    setCustomCategories(updated);
    appStore.setItem('rc_custom_categories', JSON.stringify(updated));
    showToast(`Category "${cat}" registered!`, 'success');
  };

  // --- BUSINESS MUTATION FUNCTIONS ---

  // 1. Create Asset
  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.code || !newAsset.name) {
      showToast('Asset Code and Name are required.', 'error');
      return;
    }

    const proj = PROJECTS_ROSTER.find(p => p.id === newAsset.assignedProjectId);
    const emp = EMPLOYEES_ROSTER.find(m => m.id === newAsset.assignedEmployeeId);

    const assetId = `ast-${Date.now()}`;
    const costNum = parseFloat(newAsset.purchaseCost) || 0;
    const brandNewAsset: Asset = {
      id: assetId,
      code: newAsset.code,
      name: newAsset.name,
      category: newAsset.category,
      subCategory: newAsset.subCategory || 'General',
      manufacturer: newAsset.manufacturer || 'Unknown',
      model: newAsset.model || 'Standard',
      serialNumber: newAsset.serialNumber || `SN-${Date.now().toString().slice(-6)}`,
      purchaseDate: newAsset.purchaseDate,
      purchaseCost: costNum,
      currentValue: costNum, // Init value is cost
      warrantyStatus: newAsset.warrantyStatus,
      warrantyExpiryDate: newAsset.warrantyExpiryDate || newAsset.purchaseDate,
      assignedProjectId: newAsset.assignedProjectId || undefined,
      assignedProjectName: proj ? proj.name : undefined,
      assignedDepartment: newAsset.assignedDepartment || undefined,
      assignedEmployeeId: newAsset.assignedEmployeeId || undefined,
      assignedEmployeeName: emp ? emp.name : undefined,
      currentLocation: newAsset.currentLocation || 'Central Warehouse',
      vendorName: newAsset.vendorName,
      status: newAsset.assignedProjectId ? 'In Use' : 'Available',
      description: newAsset.description,
      timeline: [
        {
          id: `atl-${Date.now()}`,
          date: new Date().toLocaleString(),
          type: 'Purchase',
          title: 'Asset Commissioned',
          notes: `Asset purchased for ₹${costNum.toLocaleString()} from ${newAsset.vendorName}. Warranty: ${newAsset.warrantyStatus}.`,
          user: userSession?.email || 'Admin Agent'
        }
      ]
    };

    const updated = [brandNewAsset, ...assets];
    saveToStorage(updated, services, contracts);
    setIsNewAssetModalOpen(false);
    showToast(`Asset "${newAsset.name}" cataloged successfully!`, 'success');
    onLogTriggered('ASSET_CREATED', 'assets', assetId, 'SUCCESS', `Registered asset ${newAsset.code} inside category ${newAsset.category}.`);
  };

  // 2. Asset Movement / Allocation
  const handleAssetMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;

    const proj = PROJECTS_ROSTER.find(p => p.id === movementForm.projectId);
    const emp = EMPLOYEES_ROSTER.find(m => m.id === movementForm.employeeId);

    const updatedAssets = assets.map(ast => {
      if (ast.id === selectedAsset.id) {
        const nextStatus = movementForm.type === 'Return' ? 'Available' : 
                           movementForm.type === 'Allocation' ? 'In Use' : ast.status;

        const logEntry = {
          id: `atl-${Date.now()}`,
          date: new Date().toLocaleString(),
          type: 'Allocation' as any,
          title: `Asset ${movementForm.type}`,
          notes: `${movementForm.type} completed. Location: ${movementForm.location || 'Site'}. Notes: ${movementForm.notes}`,
          user: userSession?.email || 'Asset Custodian'
        };

        return {
          ...ast,
          status: nextStatus,
          assignedProjectId: movementForm.type === 'Return' ? undefined : (movementForm.projectId || ast.assignedProjectId),
          assignedProjectName: movementForm.type === 'Return' ? undefined : (proj ? proj.name : ast.assignedProjectName),
          assignedDepartment: movementForm.type === 'Return' ? undefined : (movementForm.department || ast.assignedDepartment),
          assignedEmployeeId: movementForm.type === 'Return' ? undefined : (movementForm.employeeId || ast.assignedEmployeeId),
          assignedEmployeeName: movementForm.type === 'Return' ? undefined : (emp ? emp.name : ast.assignedEmployeeName),
          currentLocation: movementForm.location || ast.currentLocation,
          timeline: [logEntry, ...ast.timeline]
        };
      }
      return ast;
    });

    saveToStorage(updatedAssets, services, contracts);
    setIsMovementModalOpen(false);
    setSelectedAsset(updatedAssets.find(a => a.id === selectedAsset.id) || null);
    showToast(`Asset ${selectedAsset.code} updated with movement log.`, 'success');
    onLogTriggered('ASSET_MOVEMENT', 'assets', selectedAsset.id, 'SUCCESS', `Logged movement: ${movementForm.type}.`);
  };

  // 3. Service Ticket or Breakdown Raise
  const handleCreateServiceRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.assetId || !serviceForm.description) {
      showToast('Please select an Asset and describe the issue.', 'error');
      return;
    }

    const targetAst = assets.find(a => a.id === serviceForm.assetId);
    if (!targetAst) return;

    const reqId = `srv-${Date.now()}`;
    const isBreakdown = serviceForm.serviceType === 'Emergency Breakdown';

    const newTicket: ServiceRequest = {
      id: reqId,
      requestNumber: `REQ-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      assetId: targetAst.id,
      assetName: targetAst.name,
      assetCode: targetAst.code,
      serviceType: serviceForm.serviceType,
      priority: serviceForm.priority,
      status: 'Scheduled',
      description: serviceForm.description,
      assignedTechnicianName: serviceForm.technicianName,
      scheduledDate: serviceForm.scheduledDate,
      serviceCost: parseFloat(serviceForm.serviceCost) || 0,
      discussion: [
        {
          id: `dis-${Date.now()}`,
          user: userSession?.email || 'Operations Desk',
          role: 'Admin Dispatcher',
          message: `Ticket opened for ${targetAst.name}. Priority set to ${serviceForm.priority}.`,
          timestamp: new Date().toLocaleString()
        }
      ]
    };

    // Update asset status to Under Maintenance if Emergency Breakdown or major Corrective repair
    const updatedAssets = assets.map(ast => {
      if (ast.id === targetAst.id) {
        return {
          ...ast,
          status: isBreakdown ? 'Under Maintenance' as const : ast.status,
          timeline: [
            {
              id: `atl-${Date.now()}`,
              date: new Date().toLocaleString(),
              type: isBreakdown ? 'Breakdown' as const : 'Maintenance' as const,
              title: `Service Dispatched: ${serviceForm.serviceType}`,
              notes: `Service request ${newTicket.requestNumber} logged: ${serviceForm.description}`,
              user: userSession?.email || 'Admin Agent'
            },
            ...ast.timeline
          ]
        };
      }
      return ast;
    });

    const updatedServices = [newTicket, ...services];
    saveToStorage(updatedAssets, updatedServices, contracts);
    setIsServiceModalOpen(false);
    showToast(`Service ticket ${newTicket.requestNumber} dispatched successfully!`, 'success');
    onLogTriggered('SERVICE_REQUESTED', 'services', reqId, 'SUCCESS', `Raised service ticket: ${newTicket.requestNumber} (${serviceForm.serviceType}).`);
  };

  // 4. Update Service Status / Close ticket with Parts
  const handleUpdateServiceStatus = (ticketId: string, nextStatus: any) => {
    const updatedServices = services.map(srv => {
      if (srv.id === ticketId) {
        return {
          ...srv,
          status: nextStatus,
          discussion: [
            ...srv.discussion,
            {
              id: `dis-${Date.now()}`,
              user: userSession?.email || 'Operations Team',
              role: 'Coordinator',
              message: `Service status updated to: ${nextStatus}.`,
              timestamp: new Date().toLocaleString()
            }
          ]
        };
      }
      return srv;
    });

    saveToStorage(assets, updatedServices, contracts);
    setSelectedService(updatedServices.find(s => s.id === ticketId) || null);
    showToast(`Ticket status updated to ${nextStatus}`, 'info');
  };

  const handleResolveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !resolutionInput.trim()) {
      showToast('Resolution notes are required to close/resolve.', 'error');
      return;
    }

    const costNum = parseFloat(sparePartQty) * 1000; // Mock calculation
    const partObj = SPARE_PARTS_INVENTORY.find(p => p.id === selectedSparePartId);
    const resolvedParts = partObj ? [{
      partId: partObj.id,
      partName: partObj.name,
      quantity: parseInt(sparePartQty) || 1,
      unitCost: partObj.unitCost
    }] : [];

    const totalCalculatedCost = selectedService.serviceCost + (partObj ? (partObj.unitCost * (parseInt(sparePartQty) || 1)) : 0);

    const updatedServices = services.map(srv => {
      if (srv.id === selectedService.id) {
        return {
          ...srv,
          status: 'Completed' as const,
          resolutionNotes: resolutionInput,
          rootCause: rootCauseInput || 'Normal mechanical fatigue',
          downtimeHours: parseFloat(downtimeInput) || 0,
          completedDate: new Date().toISOString().split('T')[0],
          serviceCost: totalCalculatedCost,
          partsUsed: resolvedParts,
          discussion: [
            ...srv.discussion,
            {
              id: `dis-${Date.now()}`,
              user: userSession?.email || 'Service Engineer',
              role: 'MEP Tech',
              message: `Resolved: ${resolutionInput}. Root Cause: ${rootCauseInput || 'Fatigue'}. Parts used: ${partObj ? partObj.name : 'None'}. Downtime: ${downtimeInput} hrs.`,
              timestamp: new Date().toLocaleString()
            }
          ]
        };
      }
      return srv;
    });

    // Update asset back to Available or In Use
    const updatedAssets = assets.map(ast => {
      if (ast.id === selectedService.assetId) {
        return {
          ...ast,
          status: ast.assignedProjectId ? 'In Use' as const : 'Available' as const,
          lastServiceDate: new Date().toISOString().split('T')[0],
          timeline: [
            {
              id: `atl-${Date.now()}`,
              date: new Date().toLocaleString(),
              type: 'Maintenance' as const,
              title: `Service Completed: ${selectedService.requestNumber}`,
              notes: `Resolved. Cost: ₹${totalCalculatedCost.toLocaleString()}. Notes: ${resolutionInput}`,
              user: userSession?.email || 'System'
            },
            ...ast.timeline
          ]
        };
      }
      return ast;
    });

    saveToStorage(updatedAssets, updatedServices, contracts);
    setSelectedService(updatedServices.find(s => s.id === selectedService.id) || null);
    setResolutionInput('');
    setRootCauseInput('');
    setDowntimeInput('0');
    setSelectedSparePartId('');
    showToast(`Service request successfully completed & closed!`, 'success');
    onLogTriggered('SERVICE_COMPLETED', 'services', selectedService.id, 'SUCCESS', `Completed service ticket: ${selectedService.requestNumber}.`);
  };

  // 5. Create AMC Contract
  const handleCreateAmc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amcForm.contractNumber || !amcForm.contractName || !amcForm.linkedAssetId) {
      showToast('All fields are required to register AMC.', 'error');
      return;
    }

    const newContract: AmcContract = {
      id: `amc-${Date.now()}`,
      contractNumber: amcForm.contractNumber,
      contractName: amcForm.contractName,
      vendorName: amcForm.vendorName,
      vendorContact: amcForm.vendorContact,
      startDate: amcForm.startDate,
      endDate: amcForm.endDate || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
      serviceFrequency: amcForm.serviceFrequency,
      cost: parseFloat(amcForm.cost) || 0,
      coverageDetails: amcForm.coverageDetails || 'Full coverage',
      status: 'Active',
      renewalReminderSent: false,
      linkedAssetIds: [amcForm.linkedAssetId]
    };

    const updatedContracts = [newContract, ...contracts];
    saveToStorage(assets, services, updatedContracts);
    setIsAmcModalOpen(false);
    showToast(`AMC Contract ${amcForm.contractNumber} recorded!`, 'success');
    onLogTriggered('AMC_CREATED', 'contracts', newContract.id, 'SUCCESS', `Recorded AMC Contract for ${amcForm.contractName}.`);
  };

  const handlePostDiscussionMessage = (ticketId: string) => {
    if (!discussionInput.trim()) return;
    const updated = services.map(s => {
      if (s.id === ticketId) {
        return {
          ...s,
          discussion: [
            ...s.discussion,
            {
              id: `dis-${Date.now()}`,
              user: userSession?.email || 'Operator',
              role: 'Team Member',
              message: discussionInput,
              timestamp: new Date().toLocaleString()
            }
          ]
        };
      }
      return s;
    });
    saveToStorage(assets, updated, contracts);
    setSelectedService(updated.find(x => x.id === ticketId) || null);
    setDiscussionInput('');
    showToast('Message posted.', 'success');
  };

  // --- STATS & ANALYTICS CALCULATIONS ---
  const activeAssets = assets.filter(a => a.status === 'In Use' || a.status === 'Assigned').length;
  const maintenanceAssets = assets.filter(a => a.status === 'Under Maintenance').length;
  const idleAssets = assets.filter(a => a.status === 'Available').length;
  const totalPurchaseCost = assets.reduce((sum, a) => sum + a.purchaseCost, 0);
  const totalMaintenanceCost = services.reduce((sum, s) => sum + s.serviceCost, 0);
  const totalAmcCost = contracts.reduce((sum, c) => sum + c.cost, 0);

  // Search & Filtering Directory list
  const filteredAssets = assets.filter(a => {
    const matchesSearch = 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.assignedProjectName && a.assignedProjectName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      a.vendorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = selectedCategory === 'All' || a.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || a.status === selectedStatus;
    const matchesProj = selectedProjectFilter === 'All' || a.assignedProjectId === selectedProjectFilter;

    return matchesSearch && matchesCat && matchesStatus && matchesProj;
  });

  // Target Asset for depreciation calculator
  const deprAsset = assets.find(a => a.id === deprAssetId) || assets[0];

  // Depreciation schedule calculator
  const getDepreciationSchedule = (ast: Asset | undefined) => {
    if (!ast) return [];
    const cost = ast.purchaseCost;
    const salvage = cost * (salvageValue / 100);
    const annualDepr = (cost - salvage) / usefulLife;
    const schedule = [];
    let currentBookVal = cost;

    for (let i = 1; i <= usefulLife; i++) {
      currentBookVal = Math.max(salvage, currentBookVal - annualDepr);
      schedule.push({
        year: i,
        depreciation: annualDepr,
        accumulated: annualDepr * i,
        bookValue: currentBookVal
      });
    }
    return schedule;
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen border border-slate-900 rounded-2xl p-6 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-5 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-950 border border-emerald-500/40 text-emerald-400 rounded-lg">
              <Wrench className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
                REALTYCONNECT™ Asset & Service Engine
              </h1>
              <p className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">
                Physical assets, breakdown logs and AMC contracts
              </p>
            </div>
          </div>
        </div>

        {/* TOP LEVEL NAVIGATION TABS */}
        <div className="flex flex-wrap gap-1 bg-slate-900/60 p-1 rounded-lg border border-slate-850">
          {(['dashboard', 'directory', 'service', 'amc', 'reports', 'integrations'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium capitalize transition-all font-mono ${
                activeTab === tab 
                  ? 'bg-slate-950 border border-slate-800 text-emerald-400 font-semibold shadow-inner' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'amc' ? 'AMC Contracts' : tab === 'service' ? 'Service & Repairs' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* ======================================= */}
      {/* 1. DASHBOARD VIEW */}
      {/* ======================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* TOP METRICS BENTO GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col justify-between hover:border-slate-850 transition-all">
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Total Cataloged Assets</span>
              <span className="text-2xl font-bold text-white font-mono mt-2">{assets.length}</span>
              <span className="text-[10px] text-slate-500 font-mono mt-1">₹{(totalPurchaseCost/10000000).toFixed(2)} Cr valuation</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-emerald-900/40 bg-gradient-to-br from-emerald-950/10 to-transparent flex flex-col justify-between hover:border-emerald-800/40 transition-all">
              <span className="text-[10px] text-emerald-400 uppercase font-mono tracking-wider">Active Assets In Use</span>
              <span className="text-2xl font-bold text-emerald-400 font-mono mt-2">{activeAssets}</span>
              <span className="text-[10px] text-slate-400 font-mono mt-1">{(assets.length ? (activeAssets/assets.length * 100).toFixed(0) : 0)}% Utilization Rate</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-rose-900/40 bg-gradient-to-br from-rose-950/10 to-transparent flex flex-col justify-between hover:border-rose-800/40 transition-all">
              <span className="text-[10px] text-rose-400 uppercase font-mono tracking-wider">Under Maintenance</span>
              <span className="text-2xl font-bold text-rose-400 font-mono mt-2">{maintenanceAssets}</span>
              <span className="text-[10px] text-slate-400 font-mono mt-1">{services.filter(s => s.status !== 'Completed').length} active repairs</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-blue-900/40 flex flex-col justify-between hover:border-blue-850 transition-all">
              <span className="text-[10px] text-blue-400 uppercase font-mono tracking-wider font-mono">Available / Idle</span>
              <span className="text-2xl font-bold text-blue-400 font-mono mt-2">{idleAssets}</span>
              <span className="text-[10px] text-slate-500 font-mono mt-1">Ready for site dispatch</span>
            </div>
            <div className="col-span-2 md:col-span-4 lg:col-span-1 bg-slate-950 p-4 rounded-xl border border-amber-900/30 flex flex-col justify-between">
              <span className="text-[10px] text-amber-400 uppercase font-mono tracking-wider">AMC Contracts</span>
              <span className="text-2xl font-bold text-amber-400 font-mono mt-2">{contracts.filter(c => c.status === 'Active').length}</span>
              <span className="text-[10px] text-rose-300 font-mono mt-1">{contracts.filter(c => c.status === 'Expired').length} renewal required</span>
            </div>
          </div>

          {/* LOWER GRID FOR ACTION CORNER & UPCOMING REPAIRS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Quick Actions & Category Distribution */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-900 space-y-4">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Quick Actions Control</h3>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setIsNewAssetModalOpen(true)}
                  className="p-3 bg-slate-900 border border-slate-850 hover:border-slate-700 rounded-lg text-left text-xs font-semibold hover:text-emerald-400 transition-all space-y-1"
                >
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <div>Catalog New Asset</div>
                </button>
                <button 
                  onClick={() => setIsServiceModalOpen(true)}
                  className="p-3 bg-slate-900 border border-slate-850 hover:border-slate-700 rounded-lg text-left text-xs font-semibold hover:text-rose-400 transition-all space-y-1"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
                  <div>Raise Breakdown Ticket</div>
                </button>
                <button 
                  onClick={() => setIsAmcModalOpen(true)}
                  className="p-3 bg-slate-900 border border-slate-850 hover:border-slate-700 rounded-lg text-left text-xs font-semibold hover:text-amber-400 transition-all space-y-1"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <div>Register AMC Contract</div>
                </button>
                <button 
                  onClick={() => {
                    setSelectedSparePartId('');
                    setActiveTab('reports');
                  }}
                  className="p-3 bg-slate-900 border border-slate-850 hover:border-slate-700 rounded-lg text-left text-xs font-semibold hover:text-indigo-400 transition-all space-y-1"
                >
                  <BarChart2 className="w-4 h-4 text-indigo-400" />
                  <div>Asset Register Report</div>
                </button>
              </div>

              {/* Dynamic Add Categories */}
              <div className="border-t border-slate-900 pt-4 mt-2">
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-2">Registered Categories</span>
                <div className="flex flex-wrap gap-1.5">
                  {['Heavy Machinery', 'Construction Equipment', 'Vehicles', 'IT Assets', 'Office Equipment', 'Safety Equipment', ...customCategories].map(cat => (
                    <span key={cat} className="px-2 py-0.5 bg-slate-900 text-slate-300 text-[10px] font-mono rounded border border-slate-850 flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5 text-indigo-400" />
                      {cat}
                    </span>
                  ))}
                </div>
                {/* Input for custom category */}
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const name = fd.get('new_category') as string;
                  handleAddCustomCategory(name);
                  e.currentTarget.reset();
                }} className="mt-3 flex gap-1">
                  <input 
                    name="new_category" 
                    placeholder="New custom category..." 
                    className="bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-xs outline-none text-slate-200 focus:border-indigo-500 w-full font-mono"
                  />
                  <button type="submit" className="p-1 bg-indigo-950 text-indigo-400 hover:bg-indigo-900 border border-indigo-800 rounded">
                    <Plus className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

            {/* Active Service Requests & Breakdowns */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-900 space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Current Service Operations</h3>
                <span className="px-2 py-0.5 bg-rose-950 text-rose-300 font-mono text-[10px] rounded border border-rose-800 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-rose-400 animate-pulse" />
                  Realtime Breakdown Alert Panel
                </span>
              </div>

              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-2">
                {services.map(ticket => {
                  const isCritical = ticket.priority === 'Critical' || ticket.priority === 'High';
                  return (
                    <div 
                      key={ticket.id} 
                      onClick={() => {
                        setSelectedService(ticket);
                        setActiveTab('service');
                      }}
                      className="p-3 bg-slate-900/50 border border-slate-900 hover:border-slate-800 rounded-lg transition-all flex items-start justify-between cursor-pointer group text-left"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-indigo-400 group-hover:underline">{ticket.requestNumber}</span>
                          <span className={`px-1.5 py-0.5 text-[9px] uppercase font-mono rounded ${
                            ticket.serviceType === 'Emergency Breakdown' ? 'bg-rose-950/80 text-rose-300 border border-rose-800/40' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {ticket.serviceType}
                          </span>
                        </div>
                        <h4 className="text-xs font-medium text-slate-200">{ticket.assetName}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{ticket.description}</p>
                        <div className="flex gap-4 text-[10px] text-slate-500 font-mono">
                          <span>Tech: {ticket.assignedTechnicianName}</span>
                          <span>Date: {ticket.scheduledDate}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono border ${
                          isCritical 
                            ? 'bg-rose-950 text-rose-300 border-rose-700/50 animate-pulse' 
                            : 'bg-amber-950 text-amber-300 border-amber-800/50'
                        }`}>
                          {ticket.priority}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{ticket.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 2. ASSET DIRECTORY & ALLOCATION */}
      {/* ======================================= */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          
          {/* SEARCH, SORTING & FILTERING CONTROL BAR */}
          <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-3">
            <div className="flex flex-col md:flex-row gap-2">
              
              {/* Query search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  placeholder="Search by Asset Name, Code, Project, Vendor, Serial Number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded px-9 py-2 text-xs outline-none text-slate-200 focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Category selector */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-900 border border-slate-850 rounded text-xs px-3 py-2 outline-none text-slate-300 focus:border-indigo-500 font-mono"
              >
                <option value="All">All Categories</option>
                {['Construction Equipment', 'Heavy Machinery', 'Vehicles', 'Office Equipment', 'IT Assets', 'Electrical Equipment', 'Safety Equipment', 'Tools', 'Furniture', ...customCategories].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {/* Status selector */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-900 border border-slate-850 rounded text-xs px-3 py-2 outline-none text-slate-300 focus:border-indigo-500 font-mono"
              >
                <option value="All">All Statuses</option>
                {['Available', 'Assigned', 'In Use', 'Under Maintenance', 'Inactive', 'Disposed', 'Archived'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {/* Project selector */}
              <select
                value={selectedProjectFilter}
                onChange={(e) => setSelectedProjectFilter(e.target.value)}
                className="bg-slate-900 border border-slate-850 rounded text-xs px-3 py-2 outline-none text-slate-300 focus:border-indigo-500 font-mono"
              >
                <option value="All">All Projects</option>
                {PROJECTS_ROSTER.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              {/* View toggle */}
              <div className="flex gap-1 border border-slate-850 p-1 rounded bg-slate-900">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`px-2 py-1 rounded text-[11px] font-mono ${viewMode === 'grid' ? 'bg-slate-950 text-emerald-400 font-bold' : 'text-slate-400'}`}
                >
                  Grid
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`px-2 py-1 rounded text-[11px] font-mono ${viewMode === 'list' ? 'bg-slate-950 text-emerald-400 font-bold' : 'text-slate-400'}`}
                >
                  List
                </button>
              </div>
            </div>

            {/* Sub filter counters and Clear filters */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Found <strong className="text-emerald-400">{filteredAssets.length}</strong> catalog records matching criteria</span>
              {(selectedCategory !== 'All' || selectedStatus !== 'All' || selectedProjectFilter !== 'All' || searchQuery !== '') && (
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setSelectedStatus('All');
                    setSelectedProjectFilter('All');
                  }}
                  className="text-indigo-400 hover:underline flex items-center gap-1"
                >
                  Clear Filters <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* GRID VIEW RENDERING */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssets.map(ast => {
                const isUnderMaintenance = ast.status === 'Under Maintenance';
                const isAvailable = ast.status === 'Available';
                return (
                  <div 
                    key={ast.id} 
                    className={`bg-slate-950 border rounded-xl p-4.5 space-y-3.5 hover:border-slate-800 transition-all flex flex-col justify-between ${
                      isUnderMaintenance 
                        ? 'border-rose-950/60 bg-gradient-to-b from-rose-950/5 to-transparent' 
                        : 'border-slate-900'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-mono text-[10px] text-indigo-400 bg-indigo-950/30 border border-indigo-900/40 px-2 py-0.5 rounded">
                            {ast.code}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-1.5 font-mono">{ast.category}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                          ast.status === 'In Use' ? 'bg-emerald-950 text-emerald-300 border-emerald-800/40' :
                          ast.status === 'Under Maintenance' ? 'bg-rose-950 text-rose-300 border-rose-800/40' :
                          ast.status === 'Available' ? 'bg-blue-950 text-blue-300 border-blue-900/40' :
                          'bg-slate-900 text-slate-300 border-slate-800'
                        }`}>
                          {ast.status}
                        </span>
                      </div>

                      <h3 className="text-sm font-semibold text-white tracking-tight text-left">{ast.name}</h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2 text-left">{ast.description || 'No detailed description registered.'}</p>
                      
                      <div className="border-t border-slate-900/60 pt-2.5 space-y-1.5 text-left">
                        {ast.assignedProjectName && (
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <Briefcase className="w-3 h-3 text-slate-500" />
                            <span className="truncate">Proj: <strong className="text-slate-300">{ast.assignedProjectName}</strong></span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span className="truncate">Loc: {ast.currentLocation}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                          <span>Cost: ₹{ast.purchaseCost.toLocaleString()}</span>
                          <span className={ast.warrantyStatus === 'In Warranty' ? 'text-emerald-400' : 'text-slate-500'}>
                            {ast.warrantyStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1.5 pt-2 border-t border-slate-900/60 mt-2">
                      <button 
                        onClick={() => setSelectedAsset(ast)}
                        className="flex-1 py-1.5 bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-200 text-xs font-mono rounded"
                      >
                        Profile Sheet
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedAsset(ast);
                          setMovementForm({
                            type: 'Allocation',
                            projectId: ast.assignedProjectId || '',
                            department: ast.assignedDepartment || '',
                            employeeId: ast.assignedEmployeeId || '',
                            location: ast.currentLocation,
                            notes: ''
                          });
                          setIsMovementModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-indigo-950/60 text-indigo-300 border border-indigo-900/40 hover:bg-indigo-900 text-xs font-mono rounded"
                      >
                        Transfer / Assign
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* LIST VIEW RENDERING */
            <div className="bg-slate-950 border border-slate-900 rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 bg-slate-900/40 text-slate-400 text-[10px] uppercase font-mono tracking-wider">
                    <th className="p-3">Asset Code / Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Assigned Location</th>
                    <th className="p-3">Custodian</th>
                    <th className="p-3">Warranty</th>
                    <th className="p-3">Purchase Cost</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-xs text-slate-300">
                  {filteredAssets.map(ast => (
                    <tr key={ast.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="p-3">
                        <div className="font-mono text-indigo-400 font-bold">{ast.code}</div>
                        <div className="text-white font-medium">{ast.name}</div>
                      </td>
                      <td className="p-3 text-slate-400 font-mono">{ast.category}</td>
                      <td className="p-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                          ast.status === 'In Use' ? 'bg-emerald-950 text-emerald-300 border-emerald-800/40' :
                          ast.status === 'Under Maintenance' ? 'bg-rose-950 text-rose-300 border-rose-800/40' :
                          ast.status === 'Available' ? 'bg-blue-950 text-blue-300 border-blue-900/40' :
                          'bg-slate-900 text-slate-300 border-slate-800'
                        }`}>
                          {ast.status}
                        </span>
                      </td>
                      <td className="p-3 truncate max-w-[150px]">
                        <div className="truncate text-slate-200">{ast.assignedProjectName || 'Central Depot'}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{ast.currentLocation}</div>
                      </td>
                      <td className="p-3 text-slate-400 font-medium">
                        {ast.assignedEmployeeName || ast.assignedDepartment || 'Unassigned'}
                      </td>
                      <td className="p-3">
                        <span className={`font-mono text-[10px] ${ast.warrantyStatus === 'In Warranty' ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {ast.warrantyStatus}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-200">₹{ast.purchaseCost.toLocaleString()}</td>
                      <td className="p-3 text-right">
                        <div className="flex gap-1 justify-end">
                          <button 
                            onClick={() => setSelectedAsset(ast)}
                            className="px-2 py-1 bg-slate-900 border border-slate-800 text-[10px] font-mono rounded hover:bg-slate-800 text-slate-300"
                          >
                            Profile
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedAsset(ast);
                              setMovementForm({
                                type: 'Allocation',
                                projectId: ast.assignedProjectId || '',
                                department: ast.assignedDepartment || '',
                                employeeId: ast.assignedEmployeeId || '',
                                location: ast.currentLocation,
                                notes: ''
                              });
                              setIsMovementModalOpen(true);
                            }}
                            className="px-2 py-1 bg-indigo-950 text-indigo-300 border border-indigo-900 text-[10px] font-mono rounded hover:bg-indigo-900"
                          >
                            Move
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ======================================= */}
      {/* 3. MAINTENANCE & SERVICE TICKETS */}
      {/* ======================================= */}
      {activeTab === 'service' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left/Middle Column: List of Tickets */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <div className="flex justify-between items-center bg-slate-950 p-4 border border-slate-900 rounded-xl">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-white">Service Workorders Directory</h3>
                <p className="text-[11px] text-slate-400">Manage reactive breakdowns, proactive inspections & warranty repairs</p>
              </div>
              <button 
                onClick={() => setIsServiceModalOpen(true)}
                className="px-3.5 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded text-xs font-mono font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Raise Breakdown / Service Ticket
              </button>
            </div>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-2">
              {services.map(ticket => {
                const isActive = selectedService?.id === ticket.id;
                return (
                  <div 
                    key={ticket.id}
                    onClick={() => setSelectedService(ticket)}
                    className={`p-4 bg-slate-950 border rounded-xl transition-all cursor-pointer flex justify-between items-start ${
                      isActive 
                        ? 'border-emerald-500/40 bg-gradient-to-r from-slate-900 to-emerald-950/10' 
                        : 'border-slate-900 hover:border-slate-800'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-indigo-400 font-bold">{ticket.requestNumber}</span>
                        <span className="px-1.5 py-0.5 bg-slate-900 text-slate-300 text-[9px] uppercase font-mono rounded">
                          {ticket.serviceType}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${
                          ticket.priority === 'Critical' ? 'bg-rose-950 text-rose-300 border border-rose-800/40' :
                          ticket.priority === 'High' ? 'bg-amber-950 text-amber-300' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-white">{ticket.assetName}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{ticket.description}</p>
                      
                      <div className="flex gap-4 text-[10px] text-slate-500 font-mono pt-1">
                        <span>Technician: <strong className="text-slate-300">{ticket.assignedTechnicianName}</strong></span>
                        <span>Scheduled: {ticket.scheduledDate}</span>
                        {ticket.completedDate && <span className="text-emerald-400">Closed: {ticket.completedDate}</span>}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                        ticket.status === 'Completed' ? 'bg-emerald-950 text-emerald-300 border-emerald-800/30' :
                        ticket.status === 'In Progress' ? 'bg-blue-950 text-blue-300 border-blue-900/30' :
                        ticket.status === 'Scheduled' ? 'bg-slate-900 text-slate-400 border-slate-800' :
                        'bg-amber-950 text-amber-300 border-amber-900/30'
                      }`}>
                        {ticket.status}
                      </span>
                      <span className="text-[11px] font-mono text-slate-300 font-bold">
                        {ticket.serviceCost > 0 ? `₹${ticket.serviceCost.toLocaleString()}` : 'No Cost / AMC'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Interactive Details Panel */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-5 text-left">
            {selectedService ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start border-b border-slate-900 pb-3">
                  <div>
                    <h3 className="text-xs font-semibold font-mono text-indigo-400">{selectedService.requestNumber}</h3>
                    <h4 className="text-sm font-bold text-white mt-1">{selectedService.assetName}</h4>
                    <span className="text-[10px] font-mono text-slate-500">Asset Ref: {selectedService.assetCode}</span>
                  </div>
                  <button onClick={() => setSelectedService(null)} className="p-1 hover:bg-slate-900 text-slate-400 rounded">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Ticket Details */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500 font-mono text-[10px] uppercase block">Fault / Task Description</span>
                    <p className="text-slate-200 mt-1">{selectedService.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-t border-slate-900/60 pt-2 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Type</span>
                      <span className="text-slate-300">{selectedService.serviceType}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Priority</span>
                      <span className="text-slate-300">{selectedService.priority}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Technician</span>
                      <span className="text-slate-300">{selectedService.assignedTechnicianName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Cost Logged</span>
                      <span className="text-emerald-400 font-bold">₹{selectedService.serviceCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Resolution Form if not completed */}
                {selectedService.status !== 'Completed' && selectedService.status !== 'Closed' ? (
                  <form onSubmit={handleResolveService} className="border-t border-slate-900/60 pt-4 space-y-3">
                    <h4 className="text-xs font-bold font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Resolve & Close Workorder
                    </h4>
                    
                    <div>
                      <label className="text-slate-500 font-mono text-[9px] uppercase block mb-1">Resolution Summary / Actions Taken *</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Detail what was repaired, testing done..."
                        value={resolutionInput}
                        onChange={(e) => setResolutionInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-850 rounded p-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-slate-500 font-mono text-[9px] uppercase block mb-1">Root Cause (UI Ready)</label>
                        <input
                          placeholder="e.g. seal fatigue"
                          value={rootCauseInput}
                          onChange={(e) => setRootCauseInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 font-mono text-[9px] uppercase block mb-1">Downtime Hours</label>
                        <input
                          type="number"
                          step="0.5"
                          value={downtimeInput}
                          onChange={(e) => setDowntimeInput(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                        />
                      </div>
                    </div>

                    {/* Spare Parts dropdown */}
                    <div className="grid grid-cols-3 gap-1 pt-1.5">
                      <div className="col-span-2">
                        <label className="text-slate-500 font-mono text-[9px] uppercase block mb-1">Use Spare Part (Inventory Ref)</label>
                        <select
                          value={selectedSparePartId}
                          onChange={(e) => setSelectedSparePartId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-300 outline-none"
                        >
                          <option value="">No parts required</option>
                          {SPARE_PARTS_INVENTORY.map(p => (
                            <option key={p.id} value={p.id}>{p.name} (In stock: {p.stock})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-500 font-mono text-[9px] uppercase block mb-1">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={sparePartQty}
                          onChange={(e) => setSparePartQty(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-1.5 pt-1">
                      <button 
                        type="button"
                        onClick={() => handleUpdateServiceStatus(selectedService.id, 'In Progress')}
                        className="px-2 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded text-[11px] font-mono text-slate-300"
                      >
                        Start Repair
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded text-xs font-mono font-semibold"
                      >
                        Submit & Close Ticket
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-lg space-y-1 text-xs">
                    <span className="font-semibold text-emerald-400 font-mono flex items-center gap-1">
                      <Check className="w-4 h-4" /> Workorder Resolved Successfully
                    </span>
                    <p className="text-slate-300">Notes: "{selectedService.resolutionNotes}"</p>
                    {selectedService.rootCause && (
                      <div className="text-[10px] text-slate-400 font-mono pt-1">
                        <div>Root Cause: {selectedService.rootCause}</div>
                        <div>Downtime recorded: {selectedService.downtimeHours} hours</div>
                        {selectedService.partsUsed?.map(p => (
                          <div key={p.partId} className="text-indigo-400">Part: {p.partName} x {p.quantity}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Service Discussion and Maintenance Notes */}
                <div className="border-t border-slate-900 pt-4 space-y-2">
                  <span className="text-slate-500 font-mono text-[10px] uppercase block">Worksite Discussion Log</span>
                  
                  {/* Message History */}
                  <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                    {selectedService.discussion.map(msg => (
                      <div key={msg.id} className="p-2 bg-slate-900/60 rounded border border-slate-900 text-[10px]">
                        <div className="flex justify-between text-slate-400 font-mono mb-1">
                          <span>{msg.user} ({msg.role})</span>
                          <span>{msg.timestamp.split(' ')[1]}</span>
                        </div>
                        <p className="text-slate-200">{msg.message}</p>
                      </div>
                    ))}
                  </div>

                  {/* Input forum */}
                  <div className="flex gap-1.5 pt-1">
                    <input
                      placeholder="Ask technician for update..."
                      value={discussionInput}
                      onChange={(e) => setDiscussionInput(e.target.value)}
                      className="bg-slate-900 border border-slate-850 rounded px-2.5 py-1 text-[11px] text-slate-200 outline-none flex-1 focus:border-indigo-500 font-mono"
                    />
                    <button 
                      onClick={() => handlePostDiscussionMessage(selectedService.id)}
                      className="p-1 bg-indigo-950 text-indigo-400 border border-indigo-800 rounded hover:bg-indigo-900"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Interactive Inspection Scheduling (Meetings integration) */}
                <div className="border-t border-slate-900 pt-4 space-y-2">
                  <span className="text-slate-500 font-mono text-[10px] uppercase block">Linked Inspection Alignment</span>
                  {selectedService.meetingScheduled ? (
                    <div className="p-2 bg-slate-900/40 border border-slate-850 rounded text-xs flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-slate-300">{selectedService.meetingScheduled.title}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {selectedService.meetingScheduled.date} @ {selectedService.meetingScheduled.time}
                        </div>
                      </div>
                      <a href={selectedService.meetingScheduled.link} target="_blank" className="px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-900 rounded text-[10px] font-mono">
                        Join Meeting
                      </a>
                    </div>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => {
                        const updated = services.map(s => {
                          if (s.id === selectedService.id) {
                            return {
                              ...s,
                              meetingScheduled: {
                                title: `MEP Review: ${s.requestNumber}`,
                                date: new Date().toISOString().split('T')[0],
                                time: '02:00 PM',
                                link: 'https://meet.realtyconnect.in/inspections'
                              }
                            };
                          }
                          return s;
                        });
                        saveToStorage(assets, updated, contracts);
                        setSelectedService(updated.find(x => x.id === selectedService.id) || null);
                        showToast('Inspection meeting scheduled in Calendar!', 'success');
                      }}
                      className="w-full py-1.5 bg-slate-900 border border-slate-850 hover:bg-slate-850 text-slate-300 text-[11px] font-mono rounded flex items-center justify-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Schedule Vendor Alignment Meeting
                    </button>
                  )}
                </div>

              </div>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-slate-500">
                <Wrench className="w-8 h-8 text-slate-700 stroke-1 mb-2 animate-bounce" />
                <p className="text-xs font-mono">Select a service workorder to view details, load parts, or post technician alignment comments.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ======================================= */}
      {/* 4. AMC CONTRACTS VIEW */}
      {/* ======================================= */}
      {activeTab === 'amc' && (
        <div className="space-y-6 text-left">
          <div className="flex justify-between items-center bg-slate-950 p-4 border border-slate-900 rounded-xl">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-white">Annual Maintenance Contracts (AMC)</h3>
              <p className="text-[11px] text-slate-400">Track multi-equipment service coverage, vendor terms, and proactive renewal alerts</p>
            </div>
            <button 
              onClick={() => setIsAmcModalOpen(true)}
              className="px-3.5 py-1.5 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 rounded text-xs font-mono font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Register New AMC Contract
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contracts.map(cnt => {
              const isExpired = cnt.status === 'Expired';
              const isExpiring = cnt.status === 'Expiring Soon';
              return (
                <div 
                  key={cnt.id}
                  className={`bg-slate-950 border rounded-xl p-5 space-y-4 hover:border-slate-800 transition-all flex flex-col justify-between ${
                    isExpired ? 'border-rose-950 bg-rose-950/5' : 'border-slate-900'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[10px] text-amber-400 bg-amber-950/20 border border-amber-900/30 px-2 py-0.5 rounded">
                        {cnt.contractNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                        cnt.status === 'Active' ? 'bg-emerald-950 text-emerald-300 border-emerald-900/40' :
                        cnt.status === 'Expired' ? 'bg-rose-950 text-rose-300 border-rose-900/40' :
                        'bg-amber-950 text-amber-300 border-amber-900/40'
                      }`}>
                        {cnt.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white tracking-tight">{cnt.contractName}</h4>
                    
                    <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-900 pt-3">
                      <div><span className="text-slate-500 font-mono text-[10px] uppercase">Vendor:</span> <strong className="text-slate-200">{cnt.vendorName}</strong></div>
                      <div><span className="text-slate-500 font-mono text-[10px] uppercase">Coverage:</span> {cnt.coverageDetails}</div>
                      <div><span className="text-slate-500 font-mono text-[10px] uppercase">Cycle:</span> {cnt.serviceFrequency} Services</div>
                      <div><span className="text-slate-500 font-mono text-[10px] uppercase">Duration:</span> <span className="font-mono text-[11px]">{cnt.startDate} to {cnt.endDate}</span></div>
                    </div>
                  </div>

                  <div className="border-t border-slate-900 pt-3 flex items-center justify-between mt-2">
                    <div>
                      <span className="text-slate-500 text-[9px] uppercase font-mono block">Annual Cost</span>
                      <span className="text-sm font-bold text-emerald-400 font-mono">₹{cnt.cost.toLocaleString()}</span>
                    </div>

                    {isExpired || isExpiring ? (
                      <button 
                        onClick={() => {
                          const updated = contracts.map(c => {
                            if (c.id === cnt.id) {
                              return {
                                ...c,
                                status: 'Active' as const,
                                endDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
                                renewalReminderSent: false
                              };
                            }
                            return c;
                          });
                          saveToStorage(assets, services, updated);
                          showToast(`Contract ${cnt.contractNumber} renewed for another 12 months!`, 'success');
                        }}
                        className="px-3 py-1.5 bg-indigo-950 text-indigo-300 border border-indigo-900 hover:bg-indigo-900 rounded text-[11px] font-mono"
                      >
                        Renew Now
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          const updated = contracts.map(c => {
                            if (c.id === cnt.id) {
                              return { ...c, renewalReminderSent: true };
                            }
                            return c;
                          });
                          saveToStorage(assets, services, updated);
                          showToast(`Renewal notifications and quote requests dispatched to ${cnt.vendorName}.`, 'info');
                        }}
                        disabled={cnt.renewalReminderSent}
                        className={`px-3 py-1.5 border rounded text-[11px] font-mono ${
                          cnt.renewalReminderSent 
                            ? 'bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed' 
                            : 'bg-slate-900 text-amber-400 border-amber-900/40 hover:bg-slate-850'
                        }`}
                      >
                        {cnt.renewalReminderSent ? 'Dispatched' : 'Renewal Alert'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 5. REPORTS & FINANCE VIEW (Depreciation) */}
      {/* ======================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6 text-left">
          
          {/* Straight line depreciation dynamic calculator */}
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-900 space-y-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-white flex items-center gap-1.5">
                <DollarSign className="text-emerald-400 w-4 h-4" /> Capital Asset Straight Line Depreciation & Book Value Calculator
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                A compliance tool for calculating depreciation schedules based on purchase cost, useful life years, and residual scrap values.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/40 p-4 rounded-lg border border-slate-900">
              <div>
                <label className="text-slate-500 font-mono text-[10px] uppercase block mb-1">Target Asset</label>
                <select
                  value={deprAssetId}
                  onChange={(e) => setDeprAssetId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-300 outline-none"
                >
                  <option value="">Select Asset...</option>
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-500 font-mono text-[10px] uppercase block mb-1">Useful Life (Years)</label>
                <select
                  value={usefulLife}
                  onChange={(e) => setUsefulLife(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-300 outline-none"
                >
                  {[3, 5, 8, 10, 12, 15, 20].map(y => (
                    <option key={y} value={y}>{y} Years</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-500 font-mono text-[10px] uppercase block mb-1">Residual Salvage Value (%)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={salvageValue}
                  onChange={(e) => setSalvageValue(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none font-mono"
                />
              </div>

              <div className="flex flex-col justify-end">
                <button 
                  onClick={() => {
                    if (deprAsset) {
                      const updated = assets.map(a => {
                        if (a.id === deprAsset.id) {
                          const sched = getDepreciationSchedule(a);
                          const latestVal = sched[sched.length - 1]?.bookValue || a.purchaseCost;
                          return { ...a, currentValue: latestVal };
                        }
                        return a;
                      });
                      saveToStorage(updated, services, contracts);
                      showToast(`Current value recalculation synced for ${deprAsset.code}`, 'success');
                    }
                  }}
                  className="w-full py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded text-xs font-mono font-semibold"
                >
                  Recalculate Book Value
                </button>
              </div>
            </div>

            {deprAsset ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                
                {/* Book value cards summary */}
                <div className="space-y-3.5 bg-slate-950 p-4 border border-slate-900 rounded-lg">
                  <h4 className="text-xs font-bold text-white font-mono uppercase">Financial Matrix - {deprAsset.code}</h4>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <span className="text-slate-500">Acquisition Cost:</span>
                      <span className="text-slate-200">₹{deprAsset.purchaseCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <span className="text-slate-500">Salvage Value ({salvageValue}%):</span>
                      <span className="text-slate-200">₹{(deprAsset.purchaseCost * (salvageValue/100)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <span className="text-slate-500">Depreciable Base:</span>
                      <span className="text-slate-200">₹{(deprAsset.purchaseCost - (deprAsset.purchaseCost * (salvageValue/100))).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pb-1 text-emerald-400 font-bold">
                      <span>Annual Depr. Charge:</span>
                      <span>₹{((deprAsset.purchaseCost - (deprAsset.purchaseCost * (salvageValue/100))) / usefulLife).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Grid calculation table */}
                <div className="lg:col-span-2 overflow-x-auto border border-slate-900 rounded-lg max-h-[220px]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase">
                      <tr>
                        <th className="p-2.5">Year</th>
                        <th className="p-2.5">Annual Depreciation</th>
                        <th className="p-2.5">Accumulated Depreciation</th>
                        <th className="p-2.5 text-right">Ending Book Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-slate-300">
                      {getDepreciationSchedule(deprAsset).map(row => (
                        <tr key={row.year} className="hover:bg-slate-900/30">
                          <td className="p-2.5">Year {row.year}</td>
                          <td className="p-2.5">₹{row.depreciation.toLocaleString()}</td>
                          <td className="p-2.5">₹{row.accumulated.toLocaleString()}</td>
                          <td className="p-2.5 text-right font-bold text-white">₹{row.bookValue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            ) : (
              <div className="p-4 bg-slate-900/30 text-slate-500 text-xs font-mono text-center rounded-lg">
                Please select an asset above to compute its dynamic straight-line depreciation calendar schedule.
              </div>
            )}
          </div>

          {/* Compliance Register Reports */}
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-900 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-white">Compliance Registers & Reporting Hub</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { title: 'Asset Register Report', desc: 'Complete breakdown valuation list', count: assets.length },
                { title: 'Asset Allocation Report', desc: 'Current site assignments list', count: activeAssets },
                { title: 'Maintenance Report', desc: 'Workorders resolved & pending', count: services.length },
                { title: 'AMC Contracts Audit', desc: 'Linked services contract details', count: contracts.length }
              ].map((rep, idx) => (
                <div key={idx} className="p-4 bg-slate-900/40 border border-slate-900 rounded-lg space-y-2">
                  <span className="font-semibold text-slate-200 text-xs block">{rep.title}</span>
                  <p className="text-[10px] text-slate-500">{rep.desc}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-lg font-bold text-white font-mono">{rep.count}</span>
                    <button 
                      onClick={() => showToast(`Generating exportable PDF/Excel template for ${rep.title}...`, 'info')}
                      className="px-2 py-0.5 bg-slate-950 text-indigo-400 border border-slate-800 rounded text-[10px] font-mono hover:bg-slate-900"
                    >
                      Export
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ======================================= */}
      {/* 6. CROSS-MODULE INTEGRATIONS PANEL */}
      {/* ======================================= */}
      {activeTab === 'integrations' && (
        <div className="space-y-6 text-left">
          
          <div className="p-4 bg-slate-950 border border-emerald-900/40 rounded-xl bg-gradient-to-br from-emerald-950/10 to-transparent">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-emerald-400 flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" /> Active Enterprise Integration Router
            </h3>
            <p className="text-[11px] text-slate-300 mt-1">
              RealtyConnect standard integrations verify equipment assignments, sync spare parts with inventory, monitor procurement warranties, track project utilization, and balance asset registers inside the general ledger.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Project integration */}
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-4.5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-indigo-400" /> 1. Project Operations
              </h4>
              <p className="text-[11px] text-slate-400">Assets currently dispatched to construction and metro station infrastructure sites:</p>
              <div className="space-y-1.5">
                {assets.filter(a => a.assignedProjectId).map(ast => (
                  <div key={ast.id} className="p-2 bg-slate-900/50 rounded border border-slate-900 flex justify-between text-xs font-mono">
                    <span className="text-slate-300">{ast.name.slice(0, 20)}...</span>
                    <span className="text-indigo-400 font-bold">{ast.assignedProjectName?.slice(0, 15)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Inventory integration */}
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-4.5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" /> 2. Inventory & Warehouse
              </h4>
              <p className="text-[11px] text-slate-400">Compliance spare parts link for heavy corrective maintenance and onsite repairs:</p>
              <div className="space-y-1.5">
                {SPARE_PARTS_INVENTORY.map(part => (
                  <div key={part.id} className="p-2 bg-slate-900/50 rounded border border-slate-900 flex justify-between text-xs font-mono">
                    <span className="text-slate-300">{part.name}</span>
                    <span className="text-slate-400">Stock: <strong className="text-emerald-400">{part.stock}</strong></span>
                  </div>
                ))}
              </div>
            </div>

            {/* HR Assignment */}
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-4.5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-400" /> 3. HR Responsibility Roster
              </h4>
              <p className="text-[11px] text-slate-400">Employee-level physical custodianship and responsibility rosters:</p>
              <div className="space-y-1.5">
                {assets.filter(a => a.assignedEmployeeName).map(ast => (
                  <div key={ast.id} className="p-2 bg-slate-900/50 rounded border border-slate-900 flex justify-between text-xs font-mono">
                    <span className="text-slate-300">{ast.name.slice(0, 18)}...</span>
                    <span className="text-amber-400 font-medium">{ast.assignedEmployeeName}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* --- MODAL 1: CATALOG NEW ASSET --- */}
      {/* ======================================= */}
      {isNewAssetModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateAsset} className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-4 text-left shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold uppercase font-mono text-white flex items-center gap-1.5">
                <Plus className="text-emerald-400" /> Catalog New Corporate Asset
              </h3>
              <button type="button" onClick={() => setIsNewAssetModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">Asset Code *</label>
                <input required placeholder="RC-EQ-CRANE-99" value={newAsset.code} onChange={e => setNewAsset({...newAsset, code: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none" />
              </div>
              <div>
                <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">Asset Name *</label>
                <input required placeholder="Tower Crane 12-T" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none" />
              </div>

              <div>
                <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">Category</label>
                <select value={newAsset.category} onChange={e => setNewAsset({...newAsset, category: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-slate-350 rounded p-2 outline-none">
                  <option value="Construction Equipment">Construction Equipment</option>
                  <option value="Heavy Machinery">Heavy Machinery</option>
                  <option value="Vehicles">Vehicles</option>
                  <option value="IT Assets">IT Assets</option>
                  <option value="Office Equipment">Office Equipment</option>
                  <option value="Safety Equipment">Safety Equipment</option>
                  <option value="Tools">Tools</option>
                  <option value="Furniture">Furniture</option>
                  {customCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">Sub-Category</label>
                <input placeholder="Hydraulics / Servers" value={newAsset.subCategory} onChange={e => setNewAsset({...newAsset, subCategory: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
              </div>

              <div>
                <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">Manufacturer</label>
                <input placeholder="Caterpillar / Dell" value={newAsset.manufacturer} onChange={e => setNewAsset({...newAsset, manufacturer: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
              </div>
              <div>
                <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">Purchase Date</label>
                <input type="date" value={newAsset.purchaseDate} onChange={e => setNewAsset({...newAsset, purchaseDate: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded p-2 outline-none" />
              </div>

              <div>
                <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">Purchase Cost (₹)</label>
                <input type="number" placeholder="4200000" value={newAsset.purchaseCost} onChange={e => setNewAsset({...newAsset, purchaseCost: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
              </div>
              <div>
                <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">Warranty Status</label>
                <select value={newAsset.warrantyStatus} onChange={e => setNewAsset({...newAsset, warrantyStatus: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 text-slate-350 rounded p-2">
                  <option value="In Warranty">In Warranty</option>
                  <option value="Out of Warranty">Out of Warranty</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">Procured Vendor Link</label>
                <select value={newAsset.vendorName} onChange={e => setNewAsset({...newAsset, vendorName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-slate-350 rounded p-2">
                  {APPROVED_VENDORS.map(v => (
                    <option key={v.id} value={v.name}>{v.name} ({v.category})</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">Description / Spec Sheet Details</label>
                <textarea rows={2} placeholder="Add specific technical capacity, power requirements..." value={newAsset.description} onChange={e => setNewAsset({...newAsset, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none" />
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 flex justify-end gap-2">
              <button type="button" onClick={() => setIsNewAssetModalOpen(false)} className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 rounded text-xs font-mono text-slate-400">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-850 rounded text-xs font-mono font-semibold">Catalog Asset</button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================= */}
      {/* --- MODAL 2: ASSET PROFILE DETAILS SHEET --- */}
      {/* ======================================= */}
      {selectedAsset && !isMovementModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-5 text-left shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="font-mono text-xs text-indigo-400">{selectedAsset.code}</span>
                <h3 className="text-base font-bold text-white mt-1">{selectedAsset.name}</h3>
                <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-850 text-slate-400 font-mono">{selectedAsset.category}</span>
              </div>
              <button onClick={() => setSelectedAsset(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* General Specs */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div><span className="text-slate-500 font-mono text-[9px] uppercase">Manufacturer:</span> <div className="text-slate-200 mt-0.5">{selectedAsset.manufacturer}</div></div>
              <div><span className="text-slate-500 font-mono text-[9px] uppercase">Model / Variant:</span> <div className="text-slate-200 mt-0.5">{selectedAsset.model}</div></div>
              <div><span className="text-slate-500 font-mono text-[9px] uppercase">Serial Number:</span> <div className="text-slate-200 mt-0.5 font-mono">{selectedAsset.serialNumber}</div></div>
              <div><span className="text-slate-500 font-mono text-[9px] uppercase">Purchase Date:</span> <div className="text-slate-200 mt-0.5 font-mono">{selectedAsset.purchaseDate}</div></div>
              <div><span className="text-slate-500 font-mono text-[9px] uppercase">Warranty Status:</span> <div className="text-emerald-400 mt-0.5 font-mono">{selectedAsset.warrantyStatus}</div></div>
              <div><span className="text-slate-500 font-mono text-[9px] uppercase">Warranty Expiry:</span> <div className="text-slate-300 mt-0.5 font-mono">{selectedAsset.warrantyExpiryDate || 'N/A'}</div></div>
              <div><span className="text-slate-500 font-mono text-[9px] uppercase">Acquisition Cost:</span> <div className="text-emerald-400 mt-0.5 font-bold font-mono">₹{selectedAsset.purchaseCost.toLocaleString()}</div></div>
              <div><span className="text-slate-500 font-mono text-[9px] uppercase">Current Book Value:</span> <div className="text-indigo-400 mt-0.5 font-bold font-mono">₹{selectedAsset.currentValue.toLocaleString()}</div></div>
              <div><span className="text-slate-500 font-mono text-[9px] uppercase">Linked Project:</span> <div className="text-slate-300 mt-0.5">{selectedAsset.assignedProjectName || 'Unassigned'}</div></div>
            </div>

            {/* Movement Timeline */}
            <div className="border-t border-slate-800 pt-4 space-y-2.5">
              <h4 className="text-xs font-semibold text-white uppercase font-mono">Allocation & Service Audit Timeline</h4>
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {selectedAsset.timeline.map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-950 rounded border border-slate-900 text-xs flex justify-between gap-4">
                    <div className="space-y-0.5">
                      <span className="font-mono text-[10px] text-indigo-400">[{item.type}]</span>
                      <strong className="text-slate-200 ml-1.5">{item.title}</strong>
                      <p className="text-slate-400 mt-1">{item.notes}</p>
                    </div>
                    <div className="text-right text-[10px] text-slate-500 font-mono">
                      <div>{item.date}</div>
                      <div>By: {item.user}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Manual / DMS Attachment View */}
            <div className="border-t border-slate-800 pt-4 space-y-2">
              <h4 className="text-xs font-semibold text-white uppercase font-mono flex items-center gap-1">
                <FileCheck className="w-4 h-4 text-emerald-400" /> Attached Manuals & Certificates (DMS)
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-slate-950 border border-slate-900 rounded flex items-center justify-between">
                  <span>Operating_Manual.pdf</span>
                  <button onClick={() => showToast('Downloading manual...', 'info')} className="text-indigo-400 hover:underline">Download</button>
                </div>
                <div className="p-2 bg-slate-950 border border-slate-900 rounded flex items-center justify-between">
                  <span>Warranty_Receipt.pdf</span>
                  <button onClick={() => showToast('Downloading receipt...', 'info')} className="text-indigo-400 hover:underline">Download</button>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 flex justify-end">
              <button onClick={() => setSelectedAsset(null)} className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-xs font-mono text-slate-300 rounded">Close Sheet</button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* --- MODAL 3: ASSET MOVEMENT / ALLOCATION --- */}
      {/* ======================================= */}
      {isMovementModalOpen && selectedAsset && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAssetMovement} className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 text-left shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold uppercase font-mono text-white">
                Log Asset Dispatch / Allocation
              </h3>
              <button type="button" onClick={() => setIsMovementModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-500 font-mono text-[10px] block">Target Equipment</span>
                <strong className="text-white text-sm">{selectedAsset.name}</strong>
                <div className="text-[10px] text-slate-400 font-mono">Current Location: {selectedAsset.currentLocation}</div>
              </div>

              <div>
                <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">Movement Action Type</label>
                <select 
                  value={movementForm.type} 
                  onChange={e => setMovementForm({...movementForm, type: e.target.value as any})}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-350 rounded p-2 outline-none"
                >
                  <option value="Allocation">Allocation (Site Dispatch)</option>
                  <option value="Transfer">Transfer (Site-to-Site Transfer)</option>
                  <option value="Return">Return (Return to Central Depot)</option>
                  <option value="Location Change">Location Change / Stock Adjustment</option>
                </select>
              </div>

              {movementForm.type !== 'Return' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">Assign to Project</label>
                      <select 
                        value={movementForm.projectId} 
                        onChange={e => setMovementForm({...movementForm, projectId: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-350 rounded p-2 outline-none"
                      >
                        <option value="">None / Off-site</option>
                        {PROJECTS_ROSTER.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">Assign to Employee</label>
                      <select 
                        value={movementForm.employeeId} 
                        onChange={e => setMovementForm({...movementForm, employeeId: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-350 rounded p-2 outline-none"
                      >
                        <option value="">None / Unassigned</option>
                        {EMPLOYEES_ROSTER.map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">Current Department Custody</label>
                    <select 
                      value={movementForm.department} 
                      onChange={e => setMovementForm({...movementForm, department: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-350 rounded p-2 outline-none"
                    >
                      <option value="">Select Department...</option>
                      {DEPARTMENTS_LIST.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">New Geographical Location</label>
                    <input 
                      placeholder="e.g. Sector 36 Site Box 2" 
                      value={movementForm.location} 
                      onChange={e => setMovementForm({...movementForm, location: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none" 
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">Allocation Log Notes</label>
                <textarea 
                  required
                  rows={2} 
                  placeholder="Reason for transfer, structural verification, safe commissioning check notes..." 
                  value={movementForm.notes} 
                  onChange={e => setMovementForm({...movementForm, notes: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none" 
                />
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 flex justify-end gap-2">
              <button type="button" onClick={() => setIsMovementModalOpen(false)} className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-xs font-mono text-slate-400 rounded">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-850 rounded text-xs font-mono font-semibold">Log Dispatch</button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================= */}
      {/* --- MODAL 4: SERVICE / BREAKDOWN TICKET --- */}
      {/* ======================================= */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateServiceRequest} className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 text-left shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold uppercase font-mono text-white flex items-center gap-1.5">
                <AlertTriangle className="text-rose-400" /> Raise Breakdown / Service Workorder
              </h3>
              <button type="button" onClick={() => setIsServiceModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">Target Equipment Asset *</label>
                <select 
                  required
                  value={serviceForm.assetId} 
                  onChange={e => setServiceForm({...serviceForm, assetId: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-350 rounded p-2 outline-none"
                >
                  <option value="">Select Asset...</option>
                  {assets.filter(a => a.status !== 'Disposed' && a.status !== 'Archived').map(a => (
                    <option key={a.id} value={a.id}>{a.code} - {a.name} ({a.status})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">Service Type</label>
                  <select 
                    value={serviceForm.serviceType} 
                    onChange={e => setServiceForm({...serviceForm, serviceType: e.target.value as any})}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-350 rounded p-2 outline-none"
                  >
                    <option value="Preventive Maintenance">Preventive Maintenance</option>
                    <option value="Corrective Maintenance">Corrective Maintenance</option>
                    <option value="Emergency Breakdown">Emergency Breakdown</option>
                    <option value="Inspection">Inspection</option>
                    <option value="Calibration">Calibration</option>
                    <option value="Installation">Installation</option>
                    <option value="Warranty Service">Warranty Service</option>
                    <option value="AMC Service">AMC Service</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">Priority</label>
                  <select 
                    value={serviceForm.priority} 
                    onChange={e => setServiceForm({...serviceForm, priority: e.target.value as any})}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-350 rounded p-2 outline-none"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Critical">Critical (Breakdown!)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">Assigned MEP Technician</label>
                  <input placeholder="Rohan Sharma" value={serviceForm.technicianName} onChange={e => setServiceForm({...serviceForm, technicianName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
                </div>
                <div>
                  <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">Scheduled Date</label>
                  <input type="date" value={serviceForm.scheduledDate} onChange={e => setServiceForm({...serviceForm, scheduledDate: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded p-2 outline-none" />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">Initial Service Cost Budget (₹)</label>
                <input type="number" placeholder="Leave empty if covered by AMC" value={serviceForm.serviceCost} onChange={e => setServiceForm({...serviceForm, serviceCost: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
              </div>

              <div>
                <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">Description of Issue / Failure Symptoms *</label>
                <textarea required rows={3} placeholder="Gasket leak, electrical failure, noise in hydraulic line..." value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none" />
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 flex justify-end gap-2">
              <button type="button" onClick={() => setIsServiceModalOpen(false)} className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-xs font-mono text-slate-400 rounded">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-850 rounded text-xs font-mono font-semibold">Dispatch Ticket</button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================= */}
      {/* --- MODAL 5: NEW AMC CONTRACT --- */}
      {/* ======================================= */}
      {isAmcModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateAmc} className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 text-left shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold uppercase font-mono text-white flex items-center gap-1.5">
                <ShieldCheck className="text-amber-400" /> Register Corporate AMC Contract
              </h3>
              <button type="button" onClick={() => setIsAmcModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">Contract Number *</label>
                  <input required placeholder="AMC-2026-VOLTAS-10" value={amcForm.contractNumber} onChange={e => setAmcForm({...amcForm, contractNumber: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none" />
                </div>
                <div>
                  <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">Contract Name *</label>
                  <input required placeholder="Voltas AC Chiller System AMC" value={amcForm.contractName} onChange={e => setAmcForm({...amcForm, contractName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">Contractor / Vendor</label>
                  <select value={amcForm.vendorName} onChange={e => setAmcForm({...amcForm, vendorName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-slate-350 rounded p-2 outline-none">
                    {APPROVED_VENDORS.map(v => (
                      <option key={v.id} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">Vendor Contact Email</label>
                  <input value={amcForm.vendorContact} onChange={e => setAmcForm({...amcForm, vendorContact: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">Coverage Frequency</label>
                  <select value={amcForm.serviceFrequency} onChange={e => setAmcForm({...amcForm, serviceFrequency: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 text-slate-350 rounded p-2 outline-none">
                    <option value="Monthly">Monthly Cycle</option>
                    <option value="Quarterly">Quarterly Cycle</option>
                    <option value="Bi-Annual">Bi-Annual Cycle</option>
                    <option value="Annual">Annual Cycle</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">Annual Contract Cost (₹)</label>
                  <input type="number" placeholder="150000" value={amcForm.cost} onChange={e => setAmcForm({...amcForm, cost: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">Start Date</label>
                  <input type="date" value={amcForm.startDate} onChange={e => setAmcForm({...amcForm, startDate: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded p-2 outline-none" />
                </div>
                <div>
                  <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">End Date</label>
                  <input type="date" value={amcForm.endDate} onChange={e => setAmcForm({...amcForm, endDate: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded p-2 outline-none" />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">Link Covered Asset *</label>
                <select required value={amcForm.linkedAssetId} onChange={e => setAmcForm({...amcForm, linkedAssetId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-slate-350 rounded p-2 outline-none">
                  <option value="">Select Asset...</option>
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-mono text-[9px] uppercase block mb-1">Scope of Coverage Details</label>
                <textarea rows={2} placeholder="Includes electrical components, periodic lubrication, wire tension checks..." value={amcForm.coverageDetails} onChange={e => setAmcForm({...amcForm, coverageDetails: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 outline-none" />
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 flex justify-end gap-2">
              <button type="button" onClick={() => setIsAmcModalOpen(false)} className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-xs font-mono text-slate-400 rounded">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-850 rounded text-xs font-mono font-semibold">Save AMC</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
