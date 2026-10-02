import { appStore } from '../lib/appStore';
import React, { useState, useEffect } from 'react';
import { 
  Search, Building2, Users, CheckCircle2, ArrowRight, MapPin, Mail, Phone, 
  Briefcase, Award, Building, Check, MessageSquare, ChevronRight, Sparkles, 
  ShieldCheck, Database, Filter, DollarSign, AlertTriangle, LayoutDashboard, 
  FileText, ShoppingBag, ClipboardList, Layers, X, Plus, PlusCircle, Bookmark, 
  Activity, Calendar, TrendingUp, AlertCircle, Trash2, CheckCircle, Grid, List, 
  HardHat, FileSpreadsheet, ChevronDown, ChevronLeft, Truck, CheckSquare, 
  Star, Clock, BarChart3, Settings2, Sparkle, RefreshCw, Send, SlidersHorizontal, Eye
} from 'lucide-react';

// Interfaces for Inventory Engine
export interface InventoryItem {
  id: string; // Item ID
  code: string; // Item Code
  name: string; // Item Name
  category: string;
  subCategory: string;
  brand: string;
  unitOfMeasure: string;
  warehouse: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  preferredSupplier: string;
  associatedProject: string;
  status: 'Available' | 'Reserved' | 'Low Stock' | 'Out of Stock' | 'Discontinued' | 'Archived';
  description: string;
  imageUrl?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacityMax: number; // in metric tonnes or units
  capacityCurrent: number;
  manager: string;
  status: 'Active' | 'Under Maintenance' | 'Full' | 'Inactive';
  sections: string[];
}

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'Stock In' | 'Stock Out' | 'Stock Transfer' | 'Stock Reserved' | 'Stock Returned' | 'Stock Adjustment';
  quantity: number;
  unit: string;
  sourceLocation: string;
  destLocation: string;
  timestamp: string;
  operator: string;
  notes: string;
  referenceId?: string; // Purchase reference, RFQ, or Project ID
}

export interface InventoryNotification {
  id: string;
  type: 'Low Stock' | 'Out of Stock' | 'Stock Received' | 'Stock Reserved' | 'Stock Returned' | 'Warehouse Alert';
  message: string;
  timestamp: string;
  read: boolean;
  itemId?: string;
  severity: 'info' | 'warning' | 'error' | 'success';
}

const INITIAL_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-1',
    name: 'Mumbai Central Depot',
    location: 'Thane Belapur Road, MH',
    capacityMax: 5000,
    capacityCurrent: 3850,
    manager: 'Arvind Sawant',
    status: 'Active',
    sections: ['Aisle A - Metals', 'Aisle B - Cement', 'Aisle C - Machinery', 'Cold Storage Room']
  },
  {
    id: 'wh-2',
    name: 'Delhi NCR Logistics Hub',
    location: 'Gurugram Sector 72, DL',
    capacityMax: 8000,
    capacityCurrent: 4200,
    manager: 'Rajeev Sharma',
    status: 'Active',
    sections: ['Block Alpha - Steel', 'Block Beta - Electrical', 'Yard Delta - Safety Gears']
  },
  {
    id: 'wh-3',
    name: 'Chennai Port Storage',
    location: 'Ennore Port, TN',
    capacityMax: 3000,
    capacityCurrent: 2900,
    manager: 'K. Srinivasan',
    status: 'Full',
    sections: ['Shed 1 - Tiles & Paint', 'Shed 2 - Heavy Equipment']
  }
];

const INITIAL_ITEMS: InventoryItem[] = [
  {
    id: 'INV-001',
    code: 'STEEL-FE550-12MM',
    name: 'Fe550 TMT Rebar (12mm)',
    category: 'Steel',
    subCategory: 'Structural Steel',
    brand: 'Tata Tiscon',
    unitOfMeasure: 'Metric Tons',
    warehouse: 'Mumbai Central Depot',
    currentStock: 145,
    reservedStock: 35,
    availableStock: 110,
    minStockLevel: 20,
    maxStockLevel: 500,
    preferredSupplier: 'Elite Materials Group',
    associatedProject: 'Amara Sky Towers',
    status: 'Available',
    description: 'High strength, high ductility reinforcement steel bars for earthquake resistant concrete structures conforming to IS 1786 standards.'
  },
  {
    id: 'INV-002',
    code: 'CEM-PORT-OPC53',
    name: 'Premium OPC 53 Grade Cement',
    category: 'Cement',
    subCategory: 'Portland Cement',
    brand: 'UltraTech',
    unitOfMeasure: 'Bags',
    warehouse: 'Mumbai Central Depot',
    currentStock: 80,
    reservedStock: 75,
    availableStock: 5,
    minStockLevel: 150,
    maxStockLevel: 2000,
    preferredSupplier: 'Hindustan Cement Corp',
    associatedProject: 'Amara Sky Towers',
    status: 'Low Stock',
    description: 'Ordinary Portland Cement, high stress resistance grade, ideal for heavy load structural slabs and concrete castings.'
  },
  {
    id: 'INV-003',
    code: 'TILE-ITAL-80X80',
    name: 'Polished Vitrified Floor Tiles (80x80)',
    category: 'Tiles',
    subCategory: 'Double Charged Vitrified',
    brand: 'Kajaria',
    unitOfMeasure: 'Boxes',
    warehouse: 'Chennai Port Storage',
    currentStock: 0,
    reservedStock: 0,
    availableStock: 0,
    minStockLevel: 50,
    maxStockLevel: 1000,
    preferredSupplier: 'Supreme Concrete Products',
    associatedProject: 'Phoenix Hub Mall',
    status: 'Out of Stock',
    description: 'Ultra-glossy wear-resistant Italian series tiles, suitable for luxury office corridors and high footfall mall floors.'
  },
  {
    id: 'INV-004',
    code: 'CABLE-ARM-3C-16',
    name: '3-Core 16 Sqmm Armoured Cable',
    category: 'Electrical',
    subCategory: 'Power Cables',
    brand: 'Polycab',
    unitOfMeasure: 'Meters',
    warehouse: 'Delhi NCR Logistics Hub',
    currentStock: 1200,
    reservedStock: 200,
    availableStock: 1000,
    minStockLevel: 300,
    maxStockLevel: 5000,
    preferredSupplier: 'Green Brick Logistics',
    associatedProject: 'Giga Logistics Park',
    status: 'Available',
    description: 'Heavy duty underground copper armoured cables, moisture resistant insulation, high dielectric strength.'
  },
  {
    id: 'INV-005',
    code: 'PLUMB-PVC-4INCH',
    name: 'PVC Drainage Pipe (4-inch, Class 3)',
    category: 'Plumbing',
    subCategory: 'Rigid PVC Pipes',
    brand: 'Supreme Pipes',
    unitOfMeasure: 'Meters',
    warehouse: 'Delhi NCR Logistics Hub',
    currentStock: 450,
    reservedStock: 50,
    availableStock: 400,
    minStockLevel: 100,
    maxStockLevel: 1500,
    preferredSupplier: 'Elite Materials Group',
    associatedProject: 'Amara Sky Towers',
    status: 'Available',
    description: 'Unplasticized Polyvinyl Chloride drainage pipes, heavy wall density, leak proof joint alignments.'
  },
  {
    id: 'INV-006',
    code: 'PAINT-EXT-WEATH-20L',
    name: 'Weatherproof External Paint (20L White)',
    category: 'Paint',
    subCategory: 'Acrylic Emulsion',
    brand: 'Asian Paints',
    unitOfMeasure: 'Buckets',
    warehouse: 'Chennai Port Storage',
    currentStock: 12,
    reservedStock: 10,
    availableStock: 2,
    minStockLevel: 15,
    maxStockLevel: 100,
    preferredSupplier: 'Green Brick Logistics',
    associatedProject: 'Phoenix Hub Mall',
    status: 'Low Stock',
    description: 'Apex Ultima high performance weather shielding exterior emulsion. Resists algae, UV radiation, and paint flaking.'
  }
];

const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: 'MV-1001',
    itemId: 'INV-001',
    itemName: 'Fe550 TMT Rebar (12mm)',
    type: 'Stock In',
    quantity: 100,
    unit: 'Metric Tons',
    sourceLocation: 'Elite Materials Plant, Delhi NCR',
    destLocation: 'Mumbai Central Depot - Aisle A',
    timestamp: '2026-07-15 11:30 AM',
    operator: 'Arvind Sawant',
    notes: 'Inbound consignment associated with Procurement Order PR-2026-001.',
    referenceId: 'PR-2026-001'
  },
  {
    id: 'MV-1002',
    itemId: 'INV-002',
    itemName: 'Premium OPC 53 Grade Cement',
    type: 'Stock Out',
    quantity: 450,
    unit: 'Bags',
    sourceLocation: 'Mumbai Central Depot - Aisle B',
    destLocation: 'Amara Sky Towers Project Site',
    timestamp: '2026-07-17 09:15 AM',
    operator: 'Arvind Sawant',
    notes: 'Dispatched for Level 16 column casting. Consumed directly.',
    referenceId: 'proj-1'
  },
  {
    id: 'MV-1003',
    itemId: 'INV-001',
    itemName: 'Fe550 TMT Rebar (12mm)',
    type: 'Stock Reserved',
    quantity: 35,
    unit: 'Metric Tons',
    sourceLocation: 'Mumbai Central Depot - Available',
    destLocation: 'Mumbai Central Depot - Reserved Block',
    timestamp: '2026-07-18 04:00 PM',
    operator: 'System Auto-Linker',
    notes: 'Materials reserved for upcoming Amara Tower B core slab casting.',
    referenceId: 'proj-1'
  },
  {
    id: 'MV-1004',
    itemId: 'INV-005',
    itemName: 'PVC Drainage Pipe (4-inch, Class 3)',
    type: 'Stock Transfer',
    quantity: 150,
    unit: 'Meters',
    sourceLocation: 'Delhi NCR Logistics Hub',
    destLocation: 'Mumbai Central Depot',
    timestamp: '2026-07-19 10:00 AM',
    operator: 'Rajeev Sharma',
    notes: 'Inter-warehouse transfer to fulfill localized plumbing plumbing demand spikes.',
    referenceId: 'wh-1'
  }
];

const INITIAL_NOTIFICATIONS: InventoryNotification[] = [
  {
    id: 'NOT-101',
    type: 'Low Stock',
    message: 'Premium OPC 53 Grade Cement is currently low on stock (Only 5 bags available, min safety limit is 150).',
    timestamp: '2026-07-19 09:15 AM',
    read: false,
    itemId: 'INV-002',
    severity: 'warning'
  },
  {
    id: 'NOT-102',
    type: 'Out of Stock',
    message: 'Polished Vitrified Floor Tiles (80x80) is completely out of stock at Chennai Port Storage.',
    timestamp: '2026-07-18 03:30 PM',
    read: false,
    itemId: 'INV-003',
    severity: 'error'
  },
  {
    id: 'NOT-103',
    type: 'Stock Received',
    message: '100 Metric Tons of Fe550 TMT Rebar received at Mumbai Central Depot from Elite Materials Group.',
    timestamp: '2026-07-15 11:32 AM',
    read: true,
    itemId: 'INV-001',
    severity: 'success'
  }
];

interface BusinessInventoryEngineProps {
  userSession: { email: string; role: string; permissions: string[] } | null;
  onLogTriggered: (action: string, entity: string, entityId: string, status: 'SUCCESS' | 'FAILURE' | 'WARNING', details: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  setActiveViewMode: (viewMode: any) => void;
}

export default function BusinessInventoryEngine({
  userSession,
  onLogTriggered,
  showToast,
  setActiveViewMode
}: BusinessInventoryEngineProps) {
  
  // Persistence using local storage
  const [items, setItems] = useState<InventoryItem[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_inventory_items');
      return saved ? JSON.parse(saved) : INITIAL_ITEMS;
    } catch (e) {
      return INITIAL_ITEMS;
    }
  });

  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_inventory_warehouses');
      return saved ? JSON.parse(saved) : INITIAL_WAREHOUSES;
    } catch (e) {
      return INITIAL_WAREHOUSES;
    }
  });

  const [movements, setMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_inventory_movements');
      return saved ? JSON.parse(saved) : INITIAL_MOVEMENTS;
    } catch (e) {
      return INITIAL_MOVEMENTS;
    }
  });

  const [notifications, setNotifications] = useState<InventoryNotification[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_inventory_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch (e) {
      return INITIAL_NOTIFICATIONS;
    }
  });

  useEffect(() => {
    appStore.setItem('realtyconnect_inventory_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    appStore.setItem('realtyconnect_inventory_warehouses', JSON.stringify(warehouses));
  }, [warehouses]);

  useEffect(() => {
    appStore.setItem('realtyconnect_inventory_movements', JSON.stringify(movements));
  }, [movements]);

  useEffect(() => {
    appStore.setItem('realtyconnect_inventory_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Main navigation tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'directory' | 'warehouses' | 'movements' | 'projects' | 'integrations' | 'reports'>('dashboard');

  // Directory visual & searching state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedWarehouse, setSelectedWarehouse] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('All');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'stock_desc' | 'stock_asc' | 'code'>('id');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'card' | 'list'>('card');
  const [savedFilters, setSavedFilters] = useState<{name: string, cat: string, wh: string}[]>([
    { name: 'Low Stock Slabs', cat: 'Cement', wh: 'Mumbai Central Depot' },
    { name: 'Steel Assets', cat: 'Steel', wh: 'All' }
  ]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Selected Item details panel or action state
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [isStockAdjustmentModalOpen, setIsStockAdjustmentModalOpen] = useState(false);
  const [isNewWarehouseModalOpen, setIsNewWarehouseModalOpen] = useState(false);

  // New Item form fields
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCategory, setFormCategory] = useState('Construction Materials');
  const [formSubCategory, setFormSubCategory] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formUom, setFormUom] = useState('Units');
  const [formWarehouse, setFormWarehouse] = useState('Mumbai Central Depot');
  const [formCurrentStock, setFormCurrentStock] = useState('100');
  const [formReservedStock, setFormReservedStock] = useState('0');
  const [formMinStock, setFormMinStock] = useState('20');
  const [formMaxStock, setFormMaxStock] = useState('1000');
  const [formPreferredSupplier, setFormPreferredSupplier] = useState('Elite Materials Group');
  const [formAssociatedProject, setFormAssociatedProject] = useState('Amara Sky Towers');
  const [formDescription, setFormDescription] = useState('');

  // Stock Movement form fields
  const [adjustmentType, setAdjustmentType] = useState<'Stock In' | 'Stock Out' | 'Stock Transfer' | 'Stock Reserved' | 'Stock Returned' | 'Stock Adjustment'>('Stock In');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('50');
  const [adjustmentSource, setAdjustmentSource] = useState('Outside Vendor');
  const [adjustmentDest, setAdjustmentDest] = useState('Mumbai Central Depot');
  const [adjustmentNotes, setAdjustmentNotes] = useState('');
  const [adjustmentReference, setAdjustmentReference] = useState('');

  // New Warehouse form fields
  const [whName, setWhName] = useState('');
  const [whLocation, setWhLocation] = useState('');
  const [whCapacity, setWhCapacity] = useState('5000');
  const [whManager, setWhManager] = useState('');
  const [whSectionsText, setWhSectionsText] = useState('Aisle A, Aisle B, Aisle C');

  // Alert Notifications
  const addNotification = (type: InventoryNotification['type'], message: string, itemId?: string, severity: InventoryNotification['severity'] = 'info') => {
    const newNotif: InventoryNotification = {
      id: `NOT-${Date.now()}`,
      type,
      message,
      timestamp: new Date().toLocaleString(),
      read: false,
      itemId,
      severity
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Creation & adjustment handlers
  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) {
      showToast('Item Name and Item Code are mandatory.', 'error');
      return;
    }

    const currentStockVal = parseInt(formCurrentStock) || 0;
    const reservedVal = parseInt(formReservedStock) || 0;
    const availableVal = Math.max(0, currentStockVal - reservedVal);
    const minVal = parseInt(formMinStock) || 0;
    const maxVal = parseInt(formMaxStock) || 0;

    let initialStatus: InventoryItem['status'] = 'Available';
    if (currentStockVal === 0) initialStatus = 'Out of Stock';
    else if (availableVal <= minVal) initialStatus = 'Low Stock';

    const newItem: InventoryItem = {
      id: `INV-${String(items.length + 1).padStart(3, '0')}`,
      code: formCode.toUpperCase(),
      name: formName,
      category: formCategory,
      subCategory: formSubCategory || 'General Supply',
      brand: formBrand || 'Generic Brand',
      unitOfMeasure: formUom,
      warehouse: formWarehouse,
      currentStock: currentStockVal,
      reservedStock: reservedVal,
      availableStock: availableVal,
      minStockLevel: minVal,
      maxStockLevel: maxVal,
      preferredSupplier: formPreferredSupplier,
      associatedProject: formAssociatedProject,
      status: initialStatus,
      description: formDescription || 'No description provided.'
    };

    setItems(prev => [newItem, ...prev]);
    setIsNewItemModalOpen(false);
    
    // Add stock-in movement
    if (currentStockVal > 0) {
      const newMv: StockMovement = {
        id: `MV-${Date.now().toString().slice(-4)}`,
        itemId: newItem.id,
        itemName: newItem.name,
        type: 'Stock In',
        quantity: currentStockVal,
        unit: formUom,
        sourceLocation: 'Initial Intake / Setup',
        destLocation: formWarehouse,
        timestamp: new Date().toLocaleString(),
        operator: userSession ? userSession.email.split('@')[0] : 'System Manager',
        notes: 'Initial material master creation ingestion.'
      };
      setMovements(prev => [newMv, ...prev]);
    }

    onLogTriggered(
      'INVENTORY_ITEM_CREATED',
      'inventory_items',
      newItem.id,
      'SUCCESS',
      `Inventory: Saved item master "${newItem.name}" (${newItem.code}) with stock balance of ${newItem.currentStock} ${newItem.unitOfMeasure}`
    );
    
    showToast(`Registered item master ${newItem.id}!`, 'success');
    addNotification('Stock Received', `Registered new master item: ${newItem.name} with ${newItem.currentStock} ${newItem.unitOfMeasure} at ${newItem.warehouse}.`, newItem.id, 'success');
    
    // Clear forms
    setFormName('');
    setFormCode('');
    setFormSubCategory('');
    setFormBrand('');
    setFormDescription('');
  };

  const handleStockAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const quant = parseInt(adjustmentQuantity) || 0;
    if (quant <= 0) {
      showToast('Quantity must be greater than 0', 'error');
      return;
    }

    let updatedItems = items.map(itm => {
      if (itm.id === selectedItem.id) {
        let current = itm.currentStock;
        let reserved = itm.reservedStock;

        if (adjustmentType === 'Stock In') {
          current += quant;
        } else if (adjustmentType === 'Stock Out') {
          if (current - reserved < quant) {
            showToast('Insufficient available stock after reservation subtraction.', 'error');
            return itm;
          }
          current -= quant;
        } else if (adjustmentType === 'Stock Reserved') {
          if (current - reserved < quant) {
            showToast('Insufficient unreserved stock to earmark.', 'error');
            return itm;
          }
          reserved += quant;
        } else if (adjustmentType === 'Stock Returned') {
          current += quant;
        } else if (adjustmentType === 'Stock Adjustment') {
          current = quant; // set absolute stock value
        }

        const available = Math.max(0, current - reserved);
        let status: InventoryItem['status'] = 'Available';
        if (current === 0) status = 'Out of Stock';
        else if (available <= itm.minStockLevel) status = 'Low Stock';

        const updated = {
          ...itm,
          currentStock: current,
          reservedStock: reserved,
          availableStock: available,
          status
        };

        // Trigger automatic notifications
        if (status === 'Low Stock') {
          addNotification('Low Stock', `Material ${itm.name} reached Low Stock safety threshold (Remaining: ${available} ${itm.unitOfMeasure}).`, itm.id, 'warning');
        } else if (status === 'Out of Stock') {
          addNotification('Out of Stock', `Material ${itm.name} is completely Out of Stock at ${itm.warehouse}.`, itm.id, 'error');
        }

        if (adjustmentType === 'Stock Reserved') {
          addNotification('Stock Reserved', `Reserved ${quant} ${itm.unitOfMeasure} of ${itm.name} for project context.`, itm.id, 'info');
        } else if (adjustmentType === 'Stock Returned') {
          addNotification('Stock Returned', `Returned ${quant} ${itm.unitOfMeasure} of ${itm.name} to storage rack.`, itm.id, 'success');
        }

        setSelectedItem(updated);
        return updated;
      }
      return itm;
    });

    setItems(updatedItems);
    
    // Log stock movement
    const movementId = `MV-${Date.now().toString().slice(-4)}`;
    const newMv: StockMovement = {
      id: movementId,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      type: adjustmentType,
      quantity: quant,
      unit: selectedItem.unitOfMeasure,
      sourceLocation: adjustmentSource || 'External/Vendor',
      destLocation: adjustmentDest || selectedItem.warehouse,
      timestamp: new Date().toLocaleString(),
      operator: userSession ? userSession.email.split('@')[0] : 'Inventory Lead',
      notes: adjustmentNotes || `Manual adjustment entry: ${adjustmentType}`,
      referenceId: adjustmentReference
    };

    setMovements(prev => [newMv, ...prev]);
    setIsStockAdjustmentModalOpen(false);
    
    onLogTriggered(
      'INVENTORY_STOCK_ADJUSTED',
      'inventory_items',
      selectedItem.id,
      'SUCCESS',
      `Inventory: Logged Stock Movement ${adjustmentType} of ${quant} units for "${selectedItem.name}"`
    );

    showToast(`Successfully registered stock movement for ${selectedItem.name}!`, 'success');
    
    // Clear forms
    setAdjustmentQuantity('50');
    setAdjustmentNotes('');
    setAdjustmentReference('');
  };

  const handleCreateWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whName.trim() || !whLocation.trim()) {
      showToast('Warehouse Name and Location are mandatory.', 'error');
      return;
    }

    const capMax = parseInt(whCapacity) || 1000;
    const newWh: Warehouse = {
      id: `wh-${Date.now().toString().slice(-3)}`,
      name: whName,
      location: whLocation,
      capacityMax: capMax,
      capacityCurrent: 0,
      manager: whManager || 'General Custodian',
      status: 'Active',
      sections: whSectionsText.split(',').map(s => s.trim()).filter(Boolean)
    };

    setWarehouses(prev => [...prev, newWh]);
    setIsNewWarehouseModalOpen(false);

    onLogTriggered(
      'INVENTORY_WAREHOUSE_CREATED',
      'inventory_warehouses',
      newWh.id,
      'SUCCESS',
      `Inventory: Registered new depot ${whName} managed by ${newWh.manager}.`
    );

    showToast(`Added warehouse depot: ${whName}`, 'success');
    addNotification('Warehouse Alert', `Newly whitelisted warehouse depot online: ${whName}`, undefined, 'success');
    
    setWhName('');
    setWhLocation('');
    setWhManager('');
  };

  const handleSaveFilter = () => {
    if (selectedCategory !== 'All' || selectedWarehouse !== 'All') {
      const name = prompt('Enter a name for this custom filter preset:');
      if (name) {
        setSavedFilters(prev => [...prev, { name, cat: selectedCategory, wh: selectedWarehouse }]);
        showToast(`Saved filter: ${name}`, 'success');
      }
    } else {
      showToast('Please select a Category or Warehouse to create a preset.', 'info');
    }
  };

  // Derived filters & operations
  const filteredItems = items.filter(itm => {
    const matchesSearch = 
      itm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      itm.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      itm.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      itm.warehouse.toLowerCase().includes(searchQuery.toLowerCase()) ||
      itm.preferredSupplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      itm.associatedProject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || itm.category === selectedCategory;
    const matchesWarehouse = selectedWarehouse === 'All' || itm.warehouse === selectedWarehouse;
    const matchesStatus = selectedStatus === 'All' || itm.status === selectedStatus;
    const matchesProject = selectedProjectFilter === 'All' || itm.associatedProject === selectedProjectFilter;
    const matchesBrand = selectedBrandFilter === 'All' || itm.brand === selectedBrandFilter;

    return matchesSearch && matchesCategory && matchesWarehouse && matchesStatus && matchesProject && matchesBrand;
  }).sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'code') return a.code.localeCompare(b.code);
    if (sortBy === 'stock_desc') return b.currentStock - a.currentStock;
    if (sortBy === 'stock_asc') return a.currentStock - b.currentStock;
    return b.id.localeCompare(a.id); // Default sorted by ID desc
  });

  // Calculate stats for Dashboard display
  const stats = {
    totalItems: items.length,
    totalStockUnits: items.reduce((acc, itm) => acc + itm.currentStock, 0),
    availableStockUnits: items.reduce((acc, itm) => acc + itm.availableStock, 0),
    reservedStockUnits: items.reduce((acc, itm) => acc + itm.reservedStock, 0),
    lowStockCount: items.filter(itm => itm.status === 'Low Stock').length,
    outOfStockCount: items.filter(itm => itm.status === 'Out of Stock').length,
    discontinuedCount: items.filter(itm => itm.status === 'Discontinued').length,
    warehouseCount: warehouses.length
  };

  // Pagination bounds
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPaginatedItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const priorityColors = {
    Available: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    Reserved: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    'Low Stock': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    'Out of Stock': 'bg-red-500/10 text-red-400 border border-red-500/25',
    Discontinued: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
    Archived: 'bg-slate-700/10 text-slate-500 border border-slate-700/20'
  };

  const categories = [
    'Construction Materials', 'Electrical', 'Plumbing', 'Steel', 'Cement', 
    'Tiles', 'Paint', 'Hardware', 'Machinery', 'Safety Equipment', 'Office Supplies'
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-950 text-slate-200 min-h-screen font-sans">
      
      {/* Enterprise Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[9px] uppercase tracking-widest font-bold mb-2">
            <Sparkle className="w-3 h-3 text-amber-400 animate-pulse" />
            Inventory Management
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-500" />
            Inventory & Warehouse Hub
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time material assets tracking, warehouse utilization indices, stock reserve earmarking, and logistics audits.
          </p>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/60 border border-slate-850 rounded-xl shrink-0">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'directory', label: 'Master Directory', icon: Search },
            { id: 'warehouses', label: 'Warehouses', icon: Building2 },
            { id: 'movements', label: 'Stock Movements', icon: Activity },
            { id: 'projects', label: 'Project Allocations', icon: ClipboardList },
            { id: 'integrations', label: 'Ecosystem Integrations', icon: RefreshCw },
            { id: 'reports', label: 'Reports Panel', icon: FileSpreadsheet }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  onLogTriggered('INVENTORY_TAB_SWITCHED', 'inventory', tab.id, 'SUCCESS', `Switched inventory tab to ${tab.label}`);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW 1: INVENTORY DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Key Metric Counters Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            
            <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Total Items</span>
              <div className="mt-2">
                <div className="text-2xl font-extrabold text-white font-mono">{stats.totalItems}</div>
                <p className="text-[9px] text-slate-500 mt-0.5">Active master categories</p>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Available Stock</span>
              <div className="mt-2">
                <div className="text-2xl font-extrabold text-emerald-400 font-mono">{stats.availableStockUnits}</div>
                <p className="text-[9px] text-slate-500 mt-0.5">Ready for project issue</p>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Reserved Stock</span>
              <div className="mt-2">
                <div className="text-2xl font-extrabold text-purple-400 font-mono">{stats.reservedStockUnits}</div>
                <p className="text-[9px] text-slate-500 mt-0.5">Earmarked to projects</p>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Low Stock Items</span>
              <div className="mt-2">
                <div className="text-2xl font-extrabold text-amber-500 font-mono">{stats.lowStockCount}</div>
                <p className="text-[9px] text-amber-500/80 font-semibold mt-0.5 animate-pulse">Needs purchase request</p>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Out of Stock</span>
              <div className="mt-2">
                <div className="text-2xl font-extrabold text-red-400 font-mono">{stats.outOfStockCount}</div>
                <p className="text-[9px] text-slate-500 mt-0.5">Critical deficit alerts</p>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Active Depots</span>
              <div className="mt-2">
                <div className="text-2xl font-extrabold text-blue-400 font-mono">{stats.warehouseCount}</div>
                <p className="text-[9px] text-slate-500 mt-0.5">Total registered yards</p>
              </div>
            </div>

          </div>

          {/* Quick Action Widgets Block & Alerts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Interactive Alerts and Warnings widget */}
            <div className="lg:col-span-2 bg-slate-900/20 border border-slate-900 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-white uppercase tracking-tight">Real-Time Inventory Safeguard Alerts</span>
                </div>
                <button
                  onClick={() => {
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                    showToast('Cleared notifications.', 'info');
                  }}
                  className="text-[9px] font-mono text-slate-500 hover:text-white uppercase"
                >
                  Mark all read
                </button>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {notifications.map((notif, idx) => {
                  const severityStyles = {
                    error: 'bg-red-500/10 text-red-400 border-red-500/20',
                    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  };
                  return (
                    <div 
                      key={notif.id} 
                      className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 transition-all ${severityStyles[notif.severity]} ${
                        !notif.read ? 'ring-1 ring-amber-500/30' : ''
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                      <div className="space-y-1 text-left flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold tracking-tight uppercase text-[10px]">{notif.type}</span>
                          <span className="text-[9px] text-slate-500 font-mono">{notif.timestamp}</span>
                        </div>
                        <p className="text-slate-300 font-sans">{notif.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Warehouse Overview Utilization Card */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-tight">Depot Capacities</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">Aisles Monitored</span>
                </div>

                <div className="space-y-4 pt-4 text-left">
                  {warehouses.map((wh) => {
                    const pct = Math.round((wh.capacityCurrent / wh.capacityMax) * 100);
                    return (
                      <div key={wh.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-300 font-sans truncate max-w-44">{wh.name}</span>
                          <span className="text-slate-400">{wh.capacityCurrent} / {wh.capacityMax} MT ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900/80">
                          <div 
                            className={`h-full rounded-full ${pct > 90 ? 'bg-red-400' : pct > 75 ? 'bg-amber-400' : 'bg-blue-400'}`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-900 mt-4">
                <button
                  onClick={() => setActiveTab('warehouses')}
                  className="w-full py-1.5 rounded bg-slate-900 hover:bg-slate-850 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 border border-slate-800 cursor-pointer"
                >
                  Manage Warehouses & Sections
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Row: Recent Stock Movements widget & Quick Sinks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Low & Out Of Stock Widgets */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 text-left space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <span className="text-xs font-bold text-white uppercase tracking-tight">Urgent Replenishment Queue</span>
                <span className="text-[9px] font-mono text-amber-400">Low or Out of Stock</span>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {items.filter(itm => ['Low Stock', 'Out of Stock'].includes(itm.status)).map((itm) => (
                  <div key={itm.id} className="p-2.5 bg-slate-950 rounded-lg border border-slate-900 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-slate-500">{itm.code}</span>
                        <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${priorityColors[itm.status]}`}>{itm.status.toUpperCase()}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white">{itm.name}</h4>
                    </div>

                    <div className="text-right font-mono text-xs">
                      <div className="text-slate-400 font-bold">{itm.availableStock} {itm.unitOfMeasure}</div>
                      <div className="text-[8px] text-slate-500">Min limit: {itm.minStockLevel}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Stock Movements Short Table */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 text-left space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <span className="text-xs font-bold text-white uppercase tracking-tight">Recent Depot Transactions</span>
                <button
                  onClick={() => setActiveTab('movements')}
                  className="text-[10px] font-mono font-bold text-amber-500 hover:underline cursor-pointer"
                >
                  View All logs
                </button>
              </div>

              <div className="divide-y divide-slate-900">
                {movements.slice(0, 3).map((mv, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono text-slate-500">{mv.id}</span>
                        <span className="text-[9px] text-slate-300 font-bold">{mv.type}</span>
                      </div>
                      <p className="text-xs text-white truncate max-w-44">{mv.itemName}</p>
                    </div>

                    <div className="text-right font-mono space-y-0.5">
                      <div className="text-xs font-bold text-amber-400">{mv.quantity} {mv.unit}</div>
                      <p className="text-[8px] text-slate-500">{mv.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* VIEW 2: INVENTORY MASTER DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Advanced Search & Filtering Controls */}
          <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-4 space-y-4">
            
            <div className="flex flex-col md:flex-row gap-3">
              
              {/* Query bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search material assets by Item Name, Item Code, Brand, Supplier, Warehouse, Project..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Grid / List layout selectors */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 border border-slate-900 rounded-lg">
                <button
                  onClick={() => setLayoutMode('grid')}
                  className={`p-1.5 rounded ${layoutMode === 'grid' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setLayoutMode('card')}
                  className={`p-1.5 rounded ${layoutMode === 'card' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <Layers className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setLayoutMode('list')}
                  className={`p-1.5 rounded ${layoutMode === 'list' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Register Item trigger */}
              <button
                onClick={() => setIsNewItemModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Register Item Master</span>
              </button>

            </div>

            {/* Custom Filters Segment */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              
              <div>
                <label className="block text-[10px] text-slate-500 font-mono uppercase mb-1 font-bold">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="All">All Categories</option>
                  {categories.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-mono uppercase mb-1 font-bold">Warehouse</label>
                <select
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="All">All Warehouses</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.name}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-mono uppercase mb-1 font-bold">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                  <option value="Discontinued">Discontinued</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-mono uppercase mb-1 font-bold">Assoc. Project</label>
                <select
                  value={selectedProjectFilter}
                  onChange={(e) => setSelectedProjectFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="All">All Projects</option>
                  <option value="Amara Sky Towers">Amara Sky Towers</option>
                  <option value="Giga Logistics Park">Giga Logistics Park</option>
                  <option value="Phoenix Hub Mall">Phoenix Hub Mall</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-mono uppercase mb-1 font-bold font-bold">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="id">Item ID (Latest)</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="code">Code (A-Z)</option>
                  <option value="stock_desc">Highest Stock</option>
                  <option value="stock_asc">Lowest Stock</option>
                </select>
              </div>

              {/* Action buttons */}
              <div className="flex items-end gap-2">
                <button
                  onClick={handleSaveFilter}
                  className="flex-1 bg-slate-950 hover:bg-slate-900 border border-slate-900 text-slate-300 text-xs py-1.5 rounded font-mono font-bold flex items-center justify-center gap-1 cursor-pointer"
                  title="Save current filters"
                >
                  <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                  <span>Save Filter</span>
                </button>
              </div>

            </div>

            {/* Saved Filters Presets Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-900/60">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Presets:</span>
              {savedFilters.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedCategory(preset.cat);
                    setSelectedWarehouse(preset.wh);
                    showToast(`Loaded filter: ${preset.name}`, 'info');
                  }}
                  className="bg-slate-900 hover:bg-slate-850 px-2.5 py-1 rounded text-[10px] font-mono text-slate-300 border border-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>{preset.name}</span>
                  <SlidersHorizontal className="w-3 h-3 text-slate-500" />
                </button>
              ))}
            </div>

          </div>

          {/* Directory Listings */}
          {layoutMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
              {currentPaginatedItems.map((itm) => (
                <div 
                  key={itm.id} 
                  className="bg-slate-900/30 border border-slate-900 rounded-xl p-5 hover:border-slate-800 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500">{itm.id}</span>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${priorityColors[itm.status]}`}>{itm.status.toUpperCase()}</span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white leading-tight">{itm.name}</h3>
                      <p className="text-[11px] text-slate-400 font-mono">{itm.code}</p>
                    </div>

                    <div className="text-xs text-slate-300 font-sans line-clamp-2">
                      {itm.description}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-3 border-t border-slate-900/50">
                      <div>
                        <span className="text-slate-500 block text-[9px] font-sans uppercase">Warehouse</span>
                        <span className="text-slate-300 font-bold truncate block">{itm.warehouse}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] font-sans uppercase">Brand / UOM</span>
                        <span className="text-slate-300 font-bold block">{itm.brand} ({itm.unitOfMeasure})</span>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded border border-slate-900 flex items-center justify-between mt-3">
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase font-mono">Available</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">{itm.availableStock} {itm.unitOfMeasure}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 block uppercase font-mono">Reserved</span>
                        <span className="text-xs font-mono font-bold text-purple-400">{itm.reservedStock} {itm.unitOfMeasure}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-900 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedItem(itm);
                        onLogTriggered('INVENTORY_ITEM_AUDIT', 'inventory_items', itm.id, 'SUCCESS', `Inspected inventory item audit trail for ${itm.name}`);
                      }}
                      className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Audit Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedItem(itm);
                        setAdjustmentType('Stock In');
                        setIsStockAdjustmentModalOpen(true);
                      }}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer"
                    >
                      Issue Stock Movement
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {layoutMode === 'card' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {currentPaginatedItems.map((itm) => (
                <div 
                  key={itm.id} 
                  className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 hover:border-slate-800 transition-all flex flex-col md:flex-row gap-5"
                >
                  <div className="w-full md:w-32 h-32 bg-slate-950 border border-slate-900 rounded-lg flex flex-col items-center justify-center p-3 shrink-0 relative overflow-hidden">
                    <Building className="w-8 h-8 text-slate-600 mb-1" />
                    <span className="text-[9px] font-mono text-slate-400 text-center uppercase font-bold tracking-tight">Rack Location</span>
                    <span className="text-[10px] font-mono text-amber-500 font-bold block truncate max-w-28">{itm.brand}</span>
                    <div className="absolute bottom-1 right-1 px-1 rounded bg-slate-900 text-[8px] text-slate-500 font-mono">Placeholder</div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-500">{itm.id}</span>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${priorityColors[itm.status]}`}>{itm.status.toUpperCase()}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white leading-tight">{itm.name}</h3>
                      <p className="text-xs text-slate-400 font-mono">{itm.code}</p>
                    </div>

                    <p className="text-[11px] text-slate-300 font-sans line-clamp-2">{itm.description}</p>

                    <div className="grid grid-cols-3 gap-2 text-[10px] font-mono pt-2 border-t border-slate-900/40 text-slate-400">
                      <div>
                        <span className="text-[8px] text-slate-500 block uppercase">Warehouse</span>
                        <span className="text-slate-300 font-bold block truncate">{itm.warehouse}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500 block uppercase">Supplier</span>
                        <span className="text-slate-300 font-bold block truncate">{itm.preferredSupplier}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500 block uppercase">Project</span>
                        <span className="text-slate-300 font-bold block truncate">{itm.associatedProject}</span>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-2 rounded flex items-center justify-between text-xs font-mono border border-slate-900">
                      <div>
                        <span className="text-[8px] text-slate-500 block">Available</span>
                        <span className="text-emerald-400 font-bold">{itm.availableStock} {itm.unitOfMeasure}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500 block">Reserved</span>
                        <span className="text-purple-400 font-bold">{itm.reservedStock} {itm.unitOfMeasure}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500 block">Current Stock</span>
                        <span className="text-slate-200 font-bold">{itm.currentStock} {itm.unitOfMeasure}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-900/30">
                      <button
                        onClick={() => setSelectedItem(itm)}
                        className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Audit Log</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedItem(itm);
                          setAdjustmentType('Stock In');
                          setIsStockAdjustmentModalOpen(true);
                        }}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer"
                      >
                        Register Stock Movement
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {layoutMode === 'list' && (
            <div className="bg-slate-900/10 border border-slate-900 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 font-mono uppercase tracking-wider text-[10px] border-b border-slate-900">
                      <th className="p-3.5">ID</th>
                      <th className="p-3.5">Item Name</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Warehouse</th>
                      <th className="p-3.5 text-right">Available Stock</th>
                      <th className="p-3.5 text-right">Reserved Stock</th>
                      <th className="p-3.5 text-right">Current Stock</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {currentPaginatedItems.map((itm) => (
                      <tr key={itm.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="p-3.5 font-mono text-slate-400">{itm.id}</td>
                        <td className="p-3.5 font-sans">
                          <div className="font-bold text-white">{itm.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{itm.code}</div>
                        </td>
                        <td className="p-3.5 text-slate-300">{itm.category}</td>
                        <td className="p-3.5 text-slate-300">{itm.warehouse}</td>
                        <td className="p-3.5 text-right font-mono font-bold text-emerald-400">{itm.availableStock} {itm.unitOfMeasure}</td>
                        <td className="p-3.5 text-right font-mono font-bold text-purple-400">{itm.reservedStock} {itm.unitOfMeasure}</td>
                        <td className="p-3.5 text-right font-mono text-slate-300">{itm.currentStock} {itm.unitOfMeasure}</td>
                        <td className="p-3.5">
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded font-mono ${priorityColors[itm.status]}`}>
                            {itm.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedItem(itm)}
                              className="text-amber-500 hover:underline text-[10px] font-mono uppercase font-bold cursor-pointer"
                            >
                              Audit
                            </button>
                            <span className="text-slate-800">|</span>
                            <button
                              onClick={() => {
                                setSelectedItem(itm);
                                setAdjustmentType('Stock In');
                                setIsStockAdjustmentModalOpen(true);
                              }}
                              className="text-white hover:text-amber-400 text-[10px] font-mono uppercase font-bold cursor-pointer"
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
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-900 pt-4">
              <span className="text-xs font-mono text-slate-500">
                Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredItems.length)} of {filteredItems.length} material lines
              </span>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="p-1.5 rounded bg-slate-900 border border-slate-850 hover:bg-slate-800 disabled:opacity-50 text-slate-400 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                      currentPage === idx + 1 ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 hover:bg-slate-850 text-slate-300'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="p-1.5 rounded bg-slate-900 border border-slate-850 hover:bg-slate-800 disabled:opacity-50 text-slate-400 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* VIEW 3: WAREHOUSES & LOCATIONS MASTER */}
      {activeTab === 'warehouses' && (
        <div className="space-y-6 animate-in fade-in duration-200 text-left">
          
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-tight">Active Storage Depots & Capacities</h3>
            <button
              onClick={() => setIsNewWarehouseModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Storage Depot</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {warehouses.map((wh) => {
              const itemsInWh = items.filter(i => i.warehouse === wh.name);
              const totalWhStock = itemsInWh.reduce((sum, i) => sum + i.currentStock, 0);
              const capPercent = Math.round((totalWhStock / wh.capacityMax) * 100);

              return (
                <div key={wh.id} className="bg-slate-900/30 border border-slate-900 rounded-xl p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500">{wh.id}</span>
                      <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded ${
                        wh.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {wh.status.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">{wh.name}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{wh.location}</span>
                      </p>
                    </div>

                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">Warehouse Capacity (UI Ready)</span>
                        <span className="text-white font-bold">{totalWhStock} / {wh.capacityMax} MT</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            capPercent > 90 ? 'bg-red-400' : capPercent > 70 ? 'bg-amber-400' : 'bg-emerald-400'
                          }`}
                          style={{ width: `${Math.min(100, capPercent)}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-900/50">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Storage Sections / Aisles:</span>
                      <div className="flex flex-wrap gap-1">
                        {wh.sections.map((sec, idx) => (
                          <span key={idx} className="bg-slate-950 text-slate-300 text-[9px] font-mono px-2 py-0.5 rounded border border-slate-900">
                            {sec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-xs text-slate-400">
                    <div>
                      <span className="text-[8px] text-slate-500 uppercase block">Custodian / Manager</span>
                      <span className="text-slate-200 font-medium">{wh.manager}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-slate-500 uppercase block">Tracked Lines</span>
                      <span className="text-slate-200 font-mono font-bold">{itemsInWh.length} SKU codes</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* VIEW 4: STOCK MOVEMENT HISTORY */}
      {activeTab === 'movements' && (
        <div className="space-y-6 animate-in fade-in duration-200 text-left">
          
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-tight">Stock Movement & Logistics Log Audit</h3>
            <span className="text-[10px] font-mono text-slate-500">Authorized personnel signatures active</span>
          </div>

          <div className="bg-slate-900/10 border border-slate-900 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 font-mono uppercase tracking-wider text-[10px] border-b border-slate-900">
                    <th className="p-3.5">Movement ID</th>
                    <th className="p-3.5">Material SKU</th>
                    <th className="p-3.5">Movement Type</th>
                    <th className="p-3.5 text-right">Qty Transacted</th>
                    <th className="p-3.5">Origin Location</th>
                    <th className="p-3.5">Destination Location</th>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Operator</th>
                    <th className="p-3.5">Sourcing Ref ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 font-mono">
                  {movements.map((mv) => {
                    const typeColors = {
                      'Stock In': 'text-emerald-400',
                      'Stock Out': 'text-red-400',
                      'Stock Transfer': 'text-blue-400',
                      'Stock Reserved': 'text-purple-400',
                      'Stock Returned': 'text-teal-400',
                      'Stock Adjustment': 'text-amber-400'
                    };
                    return (
                      <tr key={mv.id} className="hover:bg-slate-900/20 text-slate-300">
                        <td className="p-3.5 text-slate-500 font-bold">{mv.id}</td>
                        <td className="p-3.5 font-sans">
                          <span className="text-white font-bold block">{mv.itemName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{mv.itemId}</span>
                        </td>
                        <td className="p-3.5">
                          <span className={`font-bold uppercase text-[10px] ${typeColors[mv.type]}`}>{mv.type}</span>
                        </td>
                        <td className="p-3.5 text-right font-bold text-white">{mv.quantity} {mv.unit}</td>
                        <td className="p-3.5 text-slate-400 truncate max-w-44 font-sans">{mv.sourceLocation}</td>
                        <td className="p-3.5 text-slate-400 truncate max-w-44 font-sans">{mv.destLocation}</td>
                        <td className="p-3.5 text-slate-400 font-sans">{mv.timestamp}</td>
                        <td className="p-3.5 text-slate-400 font-sans">{mv.operator}</td>
                        <td className="p-3.5">
                          {mv.referenceId ? (
                            <span className="bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-900 text-[10px]">{mv.referenceId}</span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* VIEW 5: PROJECT ALLOCATIONS & INTEGRATION */}
      {activeTab === 'projects' && (
        <div className="space-y-6 animate-in fade-in duration-200 text-left">
          
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">Project Portfolio Material Allocations</h3>
              <p className="text-[11px] text-slate-400">Inventory assets linked and allocated directly to active sites.</p>
            </div>
            <span className="text-[9px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded">RERA Vault Sync</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { id: 'proj-1', name: 'Amara Sky Towers', manager: 'Vikram Malhotra', budget: '₹12.5 Crores', items: items.filter(i => i.associatedProject === 'Amara Sky Towers') },
              { id: 'proj-2', name: 'Giga Logistics Park', manager: 'Rohit Sharma', budget: '₹45.0 Crores', items: items.filter(i => i.associatedProject === 'Giga Logistics Park') },
              { id: 'proj-3', name: 'Phoenix Hub Mall', manager: 'Sanjay Kumar', budget: '₹22.0 Crores', items: items.filter(i => i.associatedProject === 'Phoenix Hub Mall') }
            ].map((p) => {
              const totalItemsCount = p.items.length;
              const totalStockVal = p.items.reduce((sum, i) => sum + i.currentStock, 0);
              const reservedStockVal = p.items.reduce((sum, i) => sum + i.reservedStock, 0);

              return (
                <div key={p.id} className="bg-slate-900/30 border border-slate-900 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                    <div>
                      <h4 className="text-sm font-bold text-white">{p.name}</h4>
                      <p className="text-[10px] text-slate-500">Project Liaison: {p.manager}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-500">{p.budget}</span>
                  </div>

                  {/* Real Allocation Stats */}
                  <div className="grid grid-cols-3 gap-3 bg-slate-950 p-3 rounded border border-slate-900 text-center font-mono text-xs">
                    <div>
                      <span className="text-[8px] text-slate-500 block">Material SKUs</span>
                      <span className="text-white font-bold">{totalItemsCount} Types</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-500 block">Allocated Stock</span>
                      <span className="text-emerald-400 font-bold">{totalStockVal} units</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-500 block font-bold">Reserved Mat.</span>
                      <span className="text-purple-400 font-bold">{reservedStockVal} units</span>
                    </div>
                  </div>

                  {/* Consumption Summary (UI Ready) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Material Consumption Summary (UI Ready)</span>
                      <span className="text-[9px] font-mono text-emerald-400">92% On schedule</span>
                    </div>
                    <div className="space-y-1.5">
                      {p.items.slice(0, 2).map((itm, idx) => {
                        const pct = Math.round((itm.reservedStock / (itm.currentStock || 1)) * 100);
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-[11px] font-mono">
                              <span className="text-slate-300 truncate max-w-44 font-sans">{itm.name}</span>
                              <span className="text-slate-400">{itm.reservedStock} Reserved / {itm.currentStock} Total</span>
                            </div>
                            <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden border border-slate-900">
                              <div className="bg-purple-500 h-full rounded-full" style={{ width: `${Math.min(100, pct)}%` }} />
                            </div>
                          </div>
                        );
                      })}
                      {p.items.length === 0 && (
                        <p className="text-[11px] text-slate-500 italic">No materials assigned or active yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* VIEW 6: ECOSYSTEM SPREAD INTEGRATIONS */}
      {activeTab === 'integrations' && (
        <div className="space-y-6 animate-in fade-in duration-200 text-left">
          
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">RealtyConnect Ecosystem Inter-Module Alignments</h3>
              <p className="text-xs text-slate-400">Automatic synchronization ledger linking Procurement, Marketplace, RFQs, CRM and Inventory.</p>
            </div>
            <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Procurement Engine Integration */}
            <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-tight flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4 text-emerald-400" />
                  Procurement Pipeline Integration
                </span>
                <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">Auto Link active</span>
              </div>

              <div className="space-y-2">
                <div className="bg-slate-950 p-3 rounded border border-slate-900 text-xs">
                  <div className="flex items-center justify-between font-mono font-bold text-slate-300">
                    <span>Pending Deliveries</span>
                    <span className="text-amber-400">1 Consignment En Route</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Ingested via Purchase reference: PR-2026-001</p>
                </div>

                <div className="p-3 bg-slate-950 rounded border border-slate-900 text-xs space-y-1">
                  <div className="text-slate-400 font-bold uppercase text-[9px] font-mono">Incoming Stock Parameter Ingestion</div>
                  <p className="text-slate-300 font-sans">Fe550 TMT Rebar (12mm) – Expected Qty: 120 Metric Tons from Elite Materials Group</p>
                </div>
              </div>
            </div>

            {/* B2B Marketplace Integration */}
            <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-tight flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  B2B Marketplace Linking
                </span>
                <span className="text-[9px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">Marketplace Active</span>
              </div>

              <div className="space-y-2">
                <div className="bg-slate-950 p-3 rounded border border-slate-900 text-xs space-y-1">
                  <span className="text-[9px] text-slate-500 font-mono uppercase block">Related Marketplace Products</span>
                  <div className="flex justify-between font-bold text-slate-300">
                    <span>Tata Tiscon High-Ductility Rebar</span>
                    <span className="text-emerald-400">₹65,400/Ton</span>
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-2">
                    <span>Supplier: Elite Materials Group</span>
                    <span>•</span>
                    <span className="text-amber-500 underline cursor-pointer">View RFQ References</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RFQ & Tenders Integration */}
            <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-tight flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-400" />
                  RFQ Tender Alignment
                </span>
                <span className="text-[9px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">RFP Syncing</span>
              </div>

              <div className="space-y-2">
                <div className="bg-slate-950 p-3 rounded border border-slate-900 text-xs text-left space-y-1">
                  <div className="flex items-center justify-between font-mono font-bold text-slate-300">
                    <span>Linked RFQs & Tenders</span>
                    <span className="text-slate-400">1 Published</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans">RFQ Ref: rfq-1 – Cement wholesale tender bids requested.</p>
                </div>
              </div>
            </div>

            {/* Enterprise CRM Supplier Integration */}
            <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-tight flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  CRM & Partner Integration
                </span>
                <span className="text-[9px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded font-bold">Profile aligned</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="bg-slate-950 p-3 rounded border border-slate-900 space-y-1 text-left">
                  <div className="font-bold text-slate-300">Elite Materials Group Profile</div>
                  <p className="text-[10px] text-slate-400">Supplied Materials: Fe550 TMT Rebar (12mm)</p>
                  <p className="text-[10px] text-slate-400">Ecosystem History: 45 deliveries cleared without defects</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* VIEW 7: STOCK LEDGERS & AUDIT REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-in fade-in duration-200 text-left">
          
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">Stock Ledgers & Compliance Reports (UI Ready)</h3>
              <p className="text-xs text-slate-400">Generate, evaluate and print authorized corporate material records.</p>
            </div>
            <FileSpreadsheet className="w-5 h-5 text-amber-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Stock Summary Report', desc: 'Consolidated aggregate of warehouse current stocks, code indexes, brand divisions, and total safety margins.', icon: ClipboardList, action: 'STOCK_SUMMARY_REPORT' },
              { title: 'Warehouse Utilization Report', desc: 'Real-time analysis of space volume, active aisles, managers on duty, and under-maintenance storage sections.', icon: Building2, action: 'WAREHOUSE_UTILIZATION_REPORT' },
              { title: 'Low Stock Deficit Report', desc: 'Critical material lines below the set safety levels. Formulates ready PDF structures for procurement ingestion.', icon: AlertCircle, action: 'LOW_STOCK_REPORT' },
              { title: 'Supplier Inventory Ledger', desc: 'Supplier performance scorecard, verified badges, defect-free shipment rates, and active cargo items.', icon: Award, action: 'SUPPLIER_INVENTORY_REPORT' },
              { title: 'Project Inventory Allocation', desc: 'Earmarked rebar, concrete levels, and PVC pipelines allocated to Amara Towers and Giga Logistics.', icon: Layers, action: 'PROJECT_INVENTORY_REPORT' },
              { title: 'Stock Movement Audit Log', desc: 'Complete chronology of inbound stock, outbound issue, inter-warehouse transfers, and adjustments.', icon: Clock, action: 'MOVEMENT_CHRONO_REPORT' }
            ].map((rep, idx) => {
              const Icon = rep.icon;
              return (
                <div key={idx} className="bg-slate-900/30 border border-slate-900 rounded-xl p-5 flex flex-col justify-between hover:border-slate-800 transition-all">
                  <div className="space-y-2.5">
                    <div className="p-2 w-fit bg-slate-950 border border-slate-900 rounded-lg text-amber-500">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-white">{rep.title}</h4>
                    <p className="text-xs text-slate-400 font-sans leading-relaxed">{rep.desc}</p>
                  </div>

                  <button
                    onClick={() => {
                      onLogTriggered('INVENTORY_REPORT_GENERATED', 'inventory_reports', rep.action, 'SUCCESS', `Inventory: Compiled and generated PDF audit layout for "${rep.title}".`);
                      showToast(`Compiled report: ${rep.title}`, 'success');
                    }}
                    className="mt-4 w-full bg-slate-950 border border-slate-900 hover:bg-slate-900 text-slate-200 text-xs font-mono font-bold py-1.5 rounded flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                    <span>Compile PDF Ledger</span>
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* MODAL A: NEW ITEM REGISTRATION */}
      {isNewItemModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col text-left">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h3 className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-amber-500" />
                Register Material / Equipment Master
              </h3>
              <button 
                onClick={() => setIsNewItemModalOpen(false)}
                className="p-1 rounded bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Item Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fe550 TMT Rebar (12mm)"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Item SKU Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STEEL-TMT-12"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-2 text-slate-300 focus:outline-none focus:border-amber-500"
                  >
                    {categories.map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Sub Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Structural, Power"
                    value={formSubCategory}
                    onChange={(e) => setFormSubCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Brand Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Tata, Kajaria"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Unit of Measure</label>
                  <input
                    type="text"
                    placeholder="e.g. Bags, Tons, Boxes"
                    value={formUom}
                    onChange={(e) => setFormUom(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Intake Warehouse Depot</label>
                  <select
                    value={formWarehouse}
                    onChange={(e) => setFormWarehouse(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-2 text-slate-300 focus:outline-none focus:border-amber-500"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Project Allocation</label>
                  <select
                    value={formAssociatedProject}
                    onChange={(e) => setFormAssociatedProject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-2 text-slate-300 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Amara Sky Towers">Amara Sky Towers</option>
                    <option value="Giga Logistics Park">Giga Logistics Park</option>
                    <option value="Phoenix Hub Mall">Phoenix Hub Mall</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Current Stock *</label>
                  <input
                    type="number"
                    value={formCurrentStock}
                    onChange={(e) => setFormCurrentStock(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Reserved Stock</label>
                  <input
                    type="number"
                    value={formReservedStock}
                    onChange={(e) => setFormReservedStock(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Min Stock Limit *</label>
                  <input
                    type="number"
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Max Stock Limit</label>
                  <input
                    type="number"
                    value={formMaxStock}
                    onChange={(e) => setFormMaxStock(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Preferred Supplier</label>
                <select
                  value={formPreferredSupplier}
                  onChange={(e) => setFormPreferredSupplier(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-2 text-slate-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="Elite Materials Group">Elite Materials Group</option>
                  <option value="Hindustan Cement Corp">Hindustan Cement Corp</option>
                  <option value="Green Brick Logistics">Green Brick Logistics</option>
                  <option value="Supreme Concrete Products">Supreme Concrete Products</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Item Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe material dimensions, quality tests, and specifications..."
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2 bg-slate-900">
                <button
                  type="button"
                  onClick={() => setIsNewItemModalOpen(false)}
                  className="bg-slate-950 hover:bg-slate-850 text-slate-400 border border-slate-800 px-4 py-2 rounded font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded cursor-pointer"
                >
                  Confirm Ingestion
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL B: INVENTORY STOCK MOVEMENT REGISTRATION */}
      {isStockAdjustmentModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col text-left">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">Issue Material Stock Movement</h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Target: {selectedItem.name} ({selectedItem.code})</p>
              </div>
              <button 
                onClick={() => setIsStockAdjustmentModalOpen(false)}
                className="p-1 rounded bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStockAdjustment} className="p-6 space-y-4 text-xs">
              
              <div>
                <label className="block text-slate-400 mb-1 font-bold">Movement Type *</label>
                <select
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-slate-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="Stock In">Stock In (Consignment Arrival)</option>
                  <option value="Stock Out">Stock Out (Project Dispensation)</option>
                  <option value="Stock Transfer">Stock Transfer (Inter-depot Yard)</option>
                  <option value="Stock Reserved">Stock Reserved (Earmark Site Materials)</option>
                  <option value="Stock Returned">Stock Returned (Over-supply Handback)</option>
                  <option value="Stock Adjustment">Stock Adjustment (Manual Reconciliation)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Quantity * ({selectedItem.unitOfMeasure})</label>
                  <input
                    type="number"
                    required
                    value={adjustmentQuantity}
                    onChange={(e) => setAdjustmentQuantity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Purchase Ref / Tender ID</label>
                  <input
                    type="text"
                    placeholder="e.g. PR-2026-001"
                    value={adjustmentReference}
                    onChange={(e) => setAdjustmentReference(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Source Location</label>
                  <input
                    type="text"
                    value={adjustmentSource}
                    onChange={(e) => setAdjustmentSource(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Destination Location</label>
                  <input
                    type="text"
                    value={adjustmentDest}
                    onChange={(e) => setAdjustmentDest(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Movement Reason / Verification Notes</label>
                <textarea
                  rows={2}
                  value={adjustmentNotes}
                  onChange={(e) => setAdjustmentNotes(e.target.value)}
                  placeholder="State project details, transit truck IDs, or audit compliance justifications..."
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2 bg-slate-900">
                <button
                  type="button"
                  onClick={() => setIsStockAdjustmentModalOpen(false)}
                  className="bg-slate-950 hover:bg-slate-850 text-slate-400 border border-slate-800 px-4 py-2 rounded font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded cursor-pointer"
                >
                  Verify & Dispatch
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL C: NEW WAREHOUSE REGISTER */}
      {isNewWarehouseModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md overflow-hidden flex flex-col text-left">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">Add Storage Depot</h3>
              <button 
                onClick={() => setIsNewWarehouseModalOpen(false)}
                className="p-1 rounded bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWarehouse} className="p-6 space-y-4 text-xs">
              
              <div>
                <label className="block text-slate-400 mb-1 font-bold">Warehouse Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pune Logistics Depot"
                  value={whName}
                  onChange={(e) => setWhName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Physical Location / Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wagholi Industrial Area, Pune"
                  value={whLocation}
                  onChange={(e) => setWhLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Max capacity (Metric Tons)</label>
                  <input
                    type="number"
                    value={whCapacity}
                    onChange={(e) => setWhCapacity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Warehouse Manager</label>
                  <input
                    type="text"
                    placeholder="Arvind Sawant"
                    value={whManager}
                    onChange={(e) => setWhManager(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Storage Sections / Aisles (Comma separated)</label>
                <input
                  type="text"
                  value={whSectionsText}
                  onChange={(e) => setWhSectionsText(e.target.value)}
                  placeholder="Aisle A - Metals, Yard Beta - Cement"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2 bg-slate-900">
                <button
                  type="button"
                  onClick={() => setIsNewWarehouseModalOpen(false)}
                  className="bg-slate-950 hover:bg-slate-850 text-slate-400 border border-slate-800 px-4 py-2 rounded font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded cursor-pointer"
                >
                  Confirm Ingest
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DETAILED DIALOG: ITEM AUDIT REPORT OVERVIEW */}
      {selectedItem && !isStockAdjustmentModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col text-left">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-tight">Ecosystem Material Audit Ledger</h3>
                <p className="text-[10px] text-amber-500 font-mono mt-0.5">ID Ref: {selectedItem.id} • SKU: {selectedItem.code}</p>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs text-slate-300">
              
              {/* Profile Details Block */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h4 className="text-white text-sm font-bold">{selectedItem.name}</h4>
                    <p className="text-slate-400 font-mono text-[10px] mt-0.5">{selectedItem.category} • {selectedItem.subCategory}</p>
                  </div>

                  <p className="text-slate-300 leading-relaxed font-sans">{selectedItem.description}</p>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-900/50">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block font-mono">Assigned Project</span>
                      <span className="text-white font-bold block">{selectedItem.associatedProject}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block font-mono">Preferred Sourcing Vendor</span>
                      <span className="text-white font-bold block">{selectedItem.preferredSupplier}</span>
                    </div>
                  </div>
                </div>

                {/* Stock summary card */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono uppercase block font-bold">Ledger Balance</span>
                    <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">{selectedItem.availableStock} {selectedItem.unitOfMeasure}</div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Available for issue</p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-900/60 text-[11px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Reserved:</span>
                      <span className="text-purple-400 font-bold">{selectedItem.reservedStock}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total physical:</span>
                      <span className="text-slate-200">{selectedItem.currentStock}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Min Safety Limit:</span>
                      <span className="text-amber-400 font-bold">{selectedItem.minStockLevel}</span>
                    </div>
                  </div>

                  <span className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded block text-center ${priorityColors[selectedItem.status]}`}>
                    {selectedItem.status.toUpperCase()}
                  </span>
                </div>

              </div>

              {/* Inbound/Outbound Movements for this Item */}
              <div className="space-y-3.5 pt-4 border-t border-slate-850">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Consignment Movement Chronology</span>
                
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {movements.filter(m => m.itemId === selectedItem.id).map((m) => (
                    <div key={m.id} className="p-3 bg-slate-950 rounded-lg border border-slate-900 flex items-center justify-between font-mono text-[11px]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{m.type}</span>
                          <span className="text-slate-500 text-[10px]">{m.timestamp}</span>
                        </div>
                        <p className="text-slate-400 mt-1 font-sans">{m.notes}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-amber-500 block">{m.quantity} {m.unit}</span>
                        <span className="text-[9px] text-slate-500 block">Op: {m.operator}</span>
                      </div>
                    </div>
                  ))}

                  {movements.filter(m => m.itemId === selectedItem.id).length === 0 && (
                    <p className="text-slate-500 italic text-center py-4">No logged chronological movements for this material SKU.</p>
                  )}
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950 text-xs">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to permanently decommission material master ${selectedItem.id}?`)) {
                    setItems(prev => prev.filter(i => i.id !== selectedItem.id));
                    setSelectedItem(null);
                    onLogTriggered('INVENTORY_ITEM_DELETED', 'inventory_items', selectedItem.id, 'WARNING', `Decommissioned material master ${selectedItem.id} from listings.`);
                    showToast('Decommissioned material SKU.', 'error');
                  }
                }}
                className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Decommission Material SKU</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
