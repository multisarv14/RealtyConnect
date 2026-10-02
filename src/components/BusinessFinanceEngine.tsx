import { appStore } from '../lib/appStore';
import React, { useState, useEffect } from 'react';
import { 
  Search, Building2, Users, CheckCircle2, ArrowRight, MapPin, Mail, Phone, 
  Briefcase, Award, Building, Check, MessageSquare, ChevronRight, Sparkles, 
  ShieldCheck, Database, Filter, DollarSign, AlertTriangle, LayoutDashboard, 
  FileText, ShoppingBag, ClipboardList, Layers, X, Plus, PlusCircle, Bookmark, 
  Activity, Calendar, TrendingUp, AlertCircle, Trash2, CheckCircle, Grid, List, 
  FileSpreadsheet, ChevronDown, ChevronLeft, Truck, Clock, BarChart3, Settings2, 
  RefreshCw, FileDown, Edit3, Copy, Ban, Printer, FileCheck, Coins
} from 'lucide-react';

// Interfaces for SPRINT 20 Finance & Billing Engine
export interface Quotation {
  id: string;
  number: string;
  customer: string;
  project: string;
  leadId?: string;
  date: string;
  expiryDate: string;
  amount: number; // subtotal
  tax: number;
  discount: number;
  total: number;
  status: 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Converted';
  items: { name: string; qty: number; rate: number; total: number }[];
  remarks: string;
  history: { date: string; action: string; user: string }[];
}

export interface BillingRecord {
  id: string;
  invoiceNumber: string;
  customer: string;
  project: string;
  leadId?: string;
  quotationRef?: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'Draft' | 'Pending' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Cancelled' | 'Refunded';
  remarks: string;
  timeline: { date: string; action: string; notes: string }[];
}

export interface ExpenseRecord {
  id: string;
  date: string;
  category: 'Construction Materials' | 'Equipment Rental' | 'Labor Costs' | 'Operations' | 'Marketing' | 'Travel' | 'Miscellaneous';
  categoryType: 'Project' | 'Operational' | 'Vendor';
  amount: number;
  project: string;
  supplier: string;
  reference: string;
  notes: string;
}

export interface PaymentRecord {
  id: string;
  invoiceNumber: string;
  date: string;
  customer: string;
  amount: number;
  paymentMethod: 'Bank Transfer' | 'Credit Card' | 'Cash' | 'Cheque';
  receiptReference: string;
  notes: string;
}

export interface FinanceNotification {
  id: string;
  type: 'Invoice Created' | 'Invoice Due' | 'Payment Received' | 'Payment Overdue' | 'Quotation Approved' | 'Expense Added';
  message: string;
  timestamp: string;
  read: boolean;
  severity: 'info' | 'warning' | 'error' | 'success';
}

const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'QT-2026-001',
    number: 'RC-QT-0941',
    customer: 'Rajesh Aggarwal',
    project: 'Amara Sky Towers',
    leadId: 'LD-4412',
    date: '2026-07-10',
    expiryDate: '2026-08-10',
    amount: 1200000,
    tax: 216000,
    discount: 50000,
    total: 1366000,
    status: 'Approved',
    items: [
      { name: 'Fe550 TMT Rebar (12mm) Bulk Procurement', qty: 20, rate: 50000, total: 1000000 },
      { name: 'Grade Casting OPC 53 Cement Delivery', qty: 1000, rate: 200, total: 200000 }
    ],
    remarks: 'Approved commercial quotation following RFQ #721. Subject to immediate mobilization.',
    history: [
      { date: '2026-07-10 10:00 AM', action: 'Draft Created', user: 'Finance Lead' },
      { date: '2026-07-11 02:30 PM', action: 'Approved by Client', user: 'System' }
    ]
  },
  {
    id: 'QT-2026-002',
    number: 'RC-QT-0942',
    customer: 'Nisha Mehta Logistics',
    project: 'Giga Logistics Park',
    leadId: 'LD-1029',
    date: '2026-07-15',
    expiryDate: '2026-08-15',
    amount: 450000,
    tax: 81000,
    discount: 10000,
    total: 521000,
    status: 'Pending',
    items: [
      { name: '3-Core 16 Sqmm Armoured Cable Spools', qty: 5, rate: 90000, total: 450000 }
    ],
    remarks: 'Linked to active industrial lead. Pending technical check.',
    history: [
      { date: '2026-07-15 11:15 AM', action: 'Sent for Internal Review', user: 'Sales Rep' }
    ]
  }
];

const INITIAL_BILLING: BillingRecord[] = [
  {
    id: 'INV-2026-001',
    invoiceNumber: 'RC-INV-8801',
    customer: 'Rajesh Aggarwal',
    project: 'Amara Sky Towers',
    leadId: 'LD-4412',
    quotationRef: 'RC-QT-0941',
    invoiceDate: '2026-07-12',
    dueDate: '2026-08-12',
    amount: 1200000,
    tax: 216000,
    discount: 50000,
    totalAmount: 1366000,
    paidAmount: 800000,
    paymentStatus: 'Partially Paid',
    remarks: 'First tranche milestone invoice for steel mobilization and structural plinth completion.',
    timeline: [
      { date: '2026-07-12', action: 'Invoice Issued', notes: 'Emailed to client accounts department.' },
      { date: '2026-07-14', action: 'Partial Payment Logged', notes: '₹8,00,000 received via RTGS.' }
    ]
  },
  {
    id: 'INV-2026-002',
    invoiceNumber: 'RC-INV-8802',
    customer: 'Phoenix Hub Retail',
    project: 'Phoenix Hub Mall',
    invoiceDate: '2026-07-01',
    dueDate: '2026-07-18',
    amount: 350000,
    tax: 63000,
    discount: 0,
    totalAmount: 413000,
    paidAmount: 0,
    paymentStatus: 'Overdue',
    remarks: 'Flooring tiles installation and logistics depot billing.',
    timeline: [
      { date: '2026-07-01', action: 'Invoice Issued', notes: 'Due date passed.' }
    ]
  }
];

const INITIAL_EXPENSES: ExpenseRecord[] = [
  {
    id: 'EXP-1001',
    date: '2026-07-14',
    category: 'Construction Materials',
    categoryType: 'Project',
    amount: 450000,
    project: 'Amara Sky Towers',
    supplier: 'Elite Materials Group',
    reference: 'PO-7712',
    notes: 'Direct reinforcement steel and cement purchase for level 16 slab.'
  },
  {
    id: 'EXP-1002',
    date: '2026-07-16',
    category: 'Equipment Rental',
    categoryType: 'Operational',
    amount: 85000,
    project: 'Giga Logistics Park',
    supplier: 'Soni Crane Services',
    reference: 'RENT-012',
    notes: '25-ton high mast crane rental for structural steel beam lifting.'
  },
  {
    id: 'EXP-1003',
    date: '2026-07-18',
    category: 'Operations',
    categoryType: 'Vendor',
    amount: 120000,
    project: 'Phoenix Hub Mall',
    supplier: 'Supreme Concrete Products',
    reference: 'BILL-441',
    notes: 'Paving blocks dispatch for mall courtyard finishing.'
  }
];

const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'PAY-8001',
    invoiceNumber: 'RC-INV-8801',
    date: '2026-07-14',
    customer: 'Rajesh Aggarwal',
    amount: 800000,
    paymentMethod: 'Bank Transfer',
    receiptReference: 'RTGS-HDFC-88912',
    notes: 'Tranche 1 payment for Amara plinth foundation.'
  }
];

const INITIAL_NOTIFICATIONS: FinanceNotification[] = [
  {
    id: 'FN-101',
    type: 'Invoice Due',
    message: 'Invoice RC-INV-8802 for Phoenix Hub Retail (₹4,13,000) has passed its due date and is now Overdue.',
    timestamp: '2026-07-19 09:00 AM',
    read: false,
    severity: 'error'
  },
  {
    id: 'FN-102',
    type: 'Payment Received',
    message: 'Partial payment of ₹8,00,000 logged for Invoice RC-INV-8801 from Rajesh Aggarwal.',
    timestamp: '2026-07-14 03:00 PM',
    read: true,
    severity: 'success'
  }
];

interface BusinessFinanceEngineProps {
  userSession: { email: string; role: string; permissions: string[] } | null;
  onLogTriggered: (action: string, entity: string, entityId: string, status: 'SUCCESS' | 'FAILURE' | 'WARNING', details: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  setActiveViewMode: (viewMode: any) => void;
}

export default function BusinessFinanceEngine({
  userSession,
  onLogTriggered,
  showToast,
  setActiveViewMode
}: BusinessFinanceEngineProps) {
  
  // States
  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_finance_quotations');
      return saved ? JSON.parse(saved) : INITIAL_QUOTATIONS;
    } catch { return INITIAL_QUOTATIONS; }
  });

  const [billings, setBillings] = useState<BillingRecord[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_finance_billings');
      return saved ? JSON.parse(saved) : INITIAL_BILLING;
    } catch { return INITIAL_BILLING; }
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_finance_expenses');
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch { return INITIAL_EXPENSES; }
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_finance_payments');
      return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
    } catch { return INITIAL_PAYMENTS; }
  });

  const [notifications, setNotifications] = useState<FinanceNotification[]>(() => {
    try {
      const saved = appStore.getItem('realtyconnect_finance_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch { return INITIAL_NOTIFICATIONS; }
  });

  useEffect(() => {
    appStore.setItem('realtyconnect_finance_quotations', JSON.stringify(quotations));
  }, [quotations]);

  useEffect(() => {
    appStore.setItem('realtyconnect_finance_billings', JSON.stringify(billings));
  }, [billings]);

  useEffect(() => {
    appStore.setItem('realtyconnect_finance_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    appStore.setItem('realtyconnect_finance_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    appStore.setItem('realtyconnect_finance_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Tab View
  const [activeTab, setActiveTab] = useState<'dashboard' | 'directory' | 'quotations' | 'invoices' | 'payments' | 'expenses' | 'integrations' | 'reports'>('dashboard');

  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCustomer, setFilterCustomer] = useState('All');
  const [filterProject, setFilterProject] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'card' | 'list'>('card');
  const [sortBy, setSortBy] = useState<'date_desc' | 'amount_desc' | 'amount_asc' | 'id'>('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selected Detail views & creation modals
  const [selectedInvoice, setSelectedInvoice] = useState<BillingRecord | null>(null);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isNewQuoteModalOpen, setIsNewQuoteModalOpen] = useState(false);
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);
  const [isNewExpenseModalOpen, setIsNewExpenseModalOpen] = useState(false);
  const [isPaymentEntryModalOpen, setIsPaymentEntryModalOpen] = useState(false);

  // Forms
  const [quoteForm, setQuoteForm] = useState({
    customer: 'Rajesh Aggarwal',
    project: 'Amara Sky Towers',
    leadId: 'LD-4412',
    amount: '600000',
    tax: '108000',
    discount: '10000',
    remarks: '',
    itemsText: 'Safety Helmet Batches;100;500\nHeavy Cement Mixer Hire;2;50000'
  });

  const [invoiceForm, setInvoiceForm] = useState({
    customer: 'Rajesh Aggarwal',
    project: 'Amara Sky Towers',
    quotationRef: '',
    amount: '400000',
    tax: '72000',
    discount: '5000',
    dueDate: '2026-08-30',
    remarks: ''
  });

  const [expenseForm, setExpenseForm] = useState({
    category: 'Construction Materials' as ExpenseRecord['category'],
    categoryType: 'Project' as ExpenseRecord['categoryType'],
    amount: '150000',
    project: 'Amara Sky Towers',
    supplier: 'Elite Materials Group',
    reference: 'PO-44112',
    notes: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    invoiceNumber: '',
    customer: 'Rajesh Aggarwal',
    amount: '400000',
    paymentMethod: 'Bank Transfer' as PaymentRecord['paymentMethod'],
    receiptReference: 'TXN-99128',
    notes: ''
  });

  // Notifications Helpers
  const addNotification = (type: FinanceNotification['type'], message: string, severity: FinanceNotification['severity']) => {
    const newNotif: FinanceNotification = {
      id: `FN-${Date.now()}`,
      type,
      message,
      timestamp: new Date().toLocaleString(),
      read: false,
      severity
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Finance Calculator Stats
  const stats = {
    totalRevenue: billings.reduce((sum, b) => b.paymentStatus === 'Paid' || b.paymentStatus === 'Partially Paid' ? sum + b.paidAmount : sum, 0),
    outstandingAmount: billings.reduce((sum, b) => b.paymentStatus !== 'Cancelled' ? sum + (b.totalAmount - b.paidAmount) : sum, 0),
    pendingInvoicesValue: billings.filter(b => b.paymentStatus === 'Pending').reduce((sum, b) => sum + b.totalAmount, 0),
    paidInvoicesValue: billings.filter(b => b.paymentStatus === 'Paid').reduce((sum, b) => sum + b.totalAmount, 0),
    totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
    draftInvoicesCount: billings.filter(b => b.paymentStatus === 'Draft').length,
    overdueInvoicesCount: billings.filter(b => b.paymentStatus === 'Overdue').length,
    totalQuotesCount: quotations.length,
    approvedQuotesCount: quotations.filter(q => q.status === 'Approved').length
  };

  // Handlers
  const handleCreateQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    const subTotal = parseFloat(quoteForm.amount) || 0;
    const taxVal = parseFloat(quoteForm.tax) || 0;
    const discVal = parseFloat(quoteForm.discount) || 0;
    const totalVal = subTotal + taxVal - discVal;

    // Parse itemsText
    const lines = quoteForm.itemsText.split('\n');
    const items = lines.map(line => {
      const parts = line.split(';');
      return {
        name: parts[0] || 'Generic Supply Item',
        qty: parseInt(parts[1]) || 1,
        rate: parseFloat(parts[2]) || 100,
        total: (parseInt(parts[1]) || 1) * (parseFloat(parts[2]) || 100)
      };
    });

    const newQuote: Quotation = {
      id: `QT-${Date.now().toString().slice(-4)}`,
      number: `RC-QT-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: quoteForm.customer,
      project: quoteForm.project,
      leadId: quoteForm.leadId,
      date: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      amount: subTotal,
      tax: taxVal,
      discount: discVal,
      total: totalVal,
      status: 'Pending',
      items,
      remarks: quoteForm.remarks || 'Standard business commercial proposal.',
      history: [{ date: new Date().toLocaleString(), action: 'Quotation Generated', user: 'Finance Officer' }]
    };

    setQuotations(prev => [newQuote, ...prev]);
    setIsNewQuoteModalOpen(false);
    showToast(`Quotation ${newQuote.number} registered as Pending!`, 'success');
    addNotification('Invoice Created', `New Quotation ${newQuote.number} registered for ${newQuote.customer}`, 'info');

    onLogTriggered(
      'FINANCE_QUOTATION_CREATED',
      'quotations',
      newQuote.id,
      'SUCCESS',
      `Finance: Generated quotation proposal ${newQuote.number} value ₹${newQuote.total}`
    );
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const subTotal = parseFloat(invoiceForm.amount) || 0;
    const taxVal = parseFloat(invoiceForm.tax) || 0;
    const discVal = parseFloat(invoiceForm.discount) || 0;
    const totalVal = subTotal + taxVal - discVal;

    const newInvoice: BillingRecord = {
      id: `INV-${Date.now().toString().slice(-4)}`,
      invoiceNumber: `RC-INV-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: invoiceForm.customer,
      project: invoiceForm.project,
      quotationRef: invoiceForm.quotationRef || undefined,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: invoiceForm.dueDate,
      amount: subTotal,
      tax: taxVal,
      discount: discVal,
      totalAmount: totalVal,
      paidAmount: 0,
      paymentStatus: 'Pending',
      remarks: invoiceForm.remarks || 'Standard business invoice.',
      timeline: [{ date: new Date().toLocaleString(), action: 'Invoice Issued', notes: 'Standard automated issue.' }]
    };

    setBillings(prev => [newInvoice, ...prev]);
    setIsNewInvoiceModalOpen(false);
    showToast(`Invoice ${newInvoice.invoiceNumber} has been issued!`, 'success');
    addNotification('Invoice Created', `Issued invoice ${newInvoice.invoiceNumber} for ₹${newInvoice.totalAmount}`, 'success');

    onLogTriggered(
      'FINANCE_INVOICE_CREATED',
      'billing_records',
      newInvoice.id,
      'SUCCESS',
      `Finance: Created invoice ${newInvoice.invoiceNumber} for project ${newInvoice.project}`
    );
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expenseForm.amount) || 0;

    const newExpense: ExpenseRecord = {
      id: `EXP-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      category: expenseForm.category,
      categoryType: expenseForm.categoryType,
      amount: amt,
      project: expenseForm.project,
      supplier: expenseForm.supplier,
      reference: expenseForm.reference,
      notes: expenseForm.notes || 'No description provided.'
    };

    setExpenses(prev => [newExpense, ...prev]);
    setIsNewExpenseModalOpen(false);
    showToast(`Expense recorded under ${newExpense.category}!`, 'success');
    addNotification('Expense Added', `Added ${newExpense.categoryType} expense of ₹${newExpense.amount}`, 'info');

    onLogTriggered(
      'FINANCE_EXPENSE_CREATED',
      'expense_records',
      newExpense.id,
      'SUCCESS',
      `Finance: Logged ₹${newExpense.amount} under ${newExpense.category} category.`
    );
  };

  const handlePaymentEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(paymentForm.amount) || 0;
    const invNum = paymentForm.invoiceNumber;

    if (!invNum) {
      showToast('Please select or specify a valid Invoice Number.', 'error');
      return;
    }

    let updated = false;
    const updatedInvoices = billings.map(inv => {
      if (inv.invoiceNumber === invNum) {
        updated = true;
        const totalPaid = inv.paidAmount + amt;
        let newStatus: BillingRecord['paymentStatus'] = inv.paymentStatus;
        if (totalPaid >= inv.totalAmount) {
          newStatus = 'Paid';
        } else if (totalPaid > 0) {
          newStatus = 'Partially Paid';
        }
        return {
          ...inv,
          paidAmount: Math.min(totalPaid, inv.totalAmount),
          paymentStatus: newStatus,
          timeline: [...inv.timeline, { date: new Date().toLocaleString(), action: 'Payment Received', notes: `Received ₹${amt} via ${paymentForm.paymentMethod}. Reference: ${paymentForm.receiptReference}` }]
        };
      }
      return inv;
    });

    if (!updated) {
      showToast(`Invoice ${invNum} not found, but logged as independent payment.`, 'info');
    } else {
      setBillings(updatedInvoices);
    }

    const newPayment: PaymentRecord = {
      id: `PAY-${Date.now().toString().slice(-4)}`,
      invoiceNumber: invNum,
      date: new Date().toISOString().split('T')[0],
      customer: paymentForm.customer,
      amount: amt,
      paymentMethod: paymentForm.paymentMethod,
      receiptReference: paymentForm.receiptReference,
      notes: paymentForm.notes || 'Recorded invoice payment tranche.'
    };

    setPayments(prev => [newPayment, ...prev]);
    setIsPaymentEntryModalOpen(false);
    showToast(`Payment receipt ${newPayment.receiptReference} logged!`, 'success');
    addNotification('Payment Received', `Payment of ₹${newPayment.amount} received from ${newPayment.customer}`, 'success');

    onLogTriggered(
      'FINANCE_PAYMENT_LOGGED',
      'payments',
      newPayment.id,
      'SUCCESS',
      `Finance: Recorded Payment transaction ₹${newPayment.amount} for ${newPayment.invoiceNumber}`
    );
  };

  const handleConvertQuoteToInvoice = (quote: Quotation) => {
    const newInvoice: BillingRecord = {
      id: `INV-${Date.now().toString().slice(-4)}`,
      invoiceNumber: `RC-INV-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: quote.customer,
      project: quote.project,
      leadId: quote.leadId,
      quotationRef: quote.number,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0], // 15 days due
      amount: quote.amount,
      tax: quote.tax,
      discount: quote.discount,
      totalAmount: quote.total,
      paidAmount: 0,
      paymentStatus: 'Pending',
      remarks: `Converted from approved quotation ${quote.number}.`,
      timeline: [{ date: new Date().toLocaleString(), action: 'Invoice Issued', notes: 'Converted from Quotation proposal' }]
    };

    setBillings(prev => [newInvoice, ...prev]);
    setQuotations(prev => prev.map(q => q.id === quote.id ? { ...q, status: 'Converted' } : q));
    showToast(`Quotation ${quote.number} converted to Invoice ${newInvoice.invoiceNumber}!`, 'success');
    addNotification('Invoice Created', `Converted quote ${quote.number} to invoice ${newInvoice.invoiceNumber}`, 'success');

    onLogTriggered(
      'FINANCE_QUOTE_CONVERTED',
      'billing_records',
      newInvoice.id,
      'SUCCESS',
      `Finance: Converted proposal ${quote.number} to legal invoice bill ${newInvoice.invoiceNumber}`
    );
  };

  const handleDuplicateQuotation = (quote: Quotation) => {
    const dup: Quotation = {
      ...quote,
      id: `QT-${Date.now().toString().slice(-4)}`,
      number: `RC-QT-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Draft',
      history: [{ date: new Date().toLocaleString(), action: 'Quotation Cloned/Duplicated', user: 'Finance Lead' }]
    };
    setQuotations(prev => [dup, ...prev]);
    showToast(`Duplicated Quotation to Draft ${dup.number}`, 'info');
  };

  const handleStatusChangeQuote = (quoteId: string, newStatus: Quotation['status']) => {
    setQuotations(prev => prev.map(q => {
      if (q.id === quoteId) {
        if (newStatus === 'Approved') {
          addNotification('Quotation Approved', `Proposal ${q.number} approved by client representative.`, 'success');
        }
        return {
          ...q,
          status: newStatus,
          history: [...q.history, { date: new Date().toLocaleString(), action: `Status changed to ${newStatus}`, user: 'Manager' }]
        };
      }
      return q;
    }));
    showToast(`Updated Quotation status to ${newStatus}`, 'success');
  };

  // Directory listing filters
  const filteredBillings = billings.filter(b => {
    const matchesSearch = b.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (b.remarks && b.remarks.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = filterStatus === 'All' || b.paymentStatus === filterStatus;
    const matchesCustomer = filterCustomer === 'All' || b.customer === filterCustomer;
    const matchesProject = filterProject === 'All' || b.project === filterProject;

    return matchesSearch && matchesStatus && matchesCustomer && matchesProject;
  });

  // Render Swiss Slate Theme
  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-950 text-slate-200 min-h-screen font-sans">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] uppercase tracking-widest font-bold mb-2">
            <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
            Finance & Billing
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            Finance & Billing Management Engine
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Centralized budgets auditing, interactive customer invoice templates, payment ledger reconciliation, and cross-sprint integrations.
          </p>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-900/60 border border-slate-850 rounded-xl">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'directory', label: 'Billing Directory', icon: Search },
            { id: 'quotations', label: 'Quotations', icon: FileText },
            { id: 'invoices', label: 'Invoices', icon: ClipboardList },
            { id: 'payments', label: 'Payments', icon: Coins },
            { id: 'expenses', label: 'Expenses', icon: BarChart3 },
            { id: 'integrations', label: 'Integrations', icon: RefreshCw },
            { id: 'reports', label: 'Reports Panel', icon: FileSpreadsheet }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  onLogTriggered('FINANCE_TAB_SWITCHED', 'finance', tab.id, 'SUCCESS', `Switched finance view to ${tab.label}`);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-slate-950 font-bold'
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

      {/* VIEW 1: FINANCE DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-200 text-left">
          
          {/* Key Metric Counters Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            
            <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Revenue Overview</span>
              <div className="mt-2">
                <div className="text-2xl font-extrabold text-white font-mono">₹{stats.totalRevenue.toLocaleString()}</div>
                <p className="text-[9px] text-emerald-400 mt-0.5">Total received cash flow</p>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Outstanding Receivable</span>
              <div className="mt-2">
                <div className="text-2xl font-extrabold text-rose-400 font-mono">₹{stats.outstandingAmount.toLocaleString()}</div>
                <p className="text-[9px] text-slate-500 mt-0.5">Unpaid client bills</p>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Pending Invoices</span>
              <div className="mt-2">
                <div className="text-2xl font-extrabold text-amber-400 font-mono">₹{stats.pendingInvoicesValue.toLocaleString()}</div>
                <p className="text-[9px] text-slate-500 mt-0.5">Awaiting first payment</p>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Expenses Outflow</span>
              <div className="mt-2">
                <div className="text-2xl font-extrabold text-blue-400 font-mono">₹{stats.totalExpenses.toLocaleString()}</div>
                <p className="text-[9px] text-slate-500 mt-0.5">Project & operations costs</p>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Overdue Bills</span>
              <div className="mt-2">
                <div className="text-2xl font-extrabold text-red-500 font-mono">{stats.overdueInvoicesCount}</div>
                <p className="text-[9px] text-red-400/80 font-semibold mt-0.5 animate-pulse">Follow-up required</p>
              </div>
            </div>

          </div>

          {/* Interactive Alerts and Budget Utilization Index */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Real-time Notifications/Alerts Block */}
            <div className="lg:col-span-2 bg-slate-900/20 border border-slate-900 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-white uppercase tracking-tight">Active Financial Safeguard Alerts</span>
                </div>
                <button
                  onClick={() => {
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                    showToast('All notifications set as read.', 'info');
                  }}
                  className="text-[9px] font-mono text-slate-500 hover:text-white uppercase"
                >
                  Mark all read
                </button>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {notifications.map((notif) => {
                  const colors = {
                    error: 'bg-red-500/10 text-red-400 border-red-500/20',
                    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  };
                  return (
                    <div 
                      key={notif.id} 
                      className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 transition-all ${colors[notif.severity]} ${
                        !notif.read ? 'ring-1 ring-emerald-500/30' : ''
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                      <div className="space-y-1 text-left flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold tracking-tight uppercase text-[10px]">{notif.type}</span>
                          <span className="text-[9px] text-slate-500 font-mono">{notif.timestamp}</span>
                        </div>
                        <p className="text-slate-300">{notif.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Project Budget Utilization Progress Index */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-tight">Project Budget Health</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">Utilization Indices</span>
                </div>

                <div className="space-y-4 pt-4">
                  {[
                    { name: 'Amara Sky Towers', budget: 48000000, color: 'bg-emerald-400' },
                    { name: 'Giga Logistics Park', budget: 32000000, color: 'bg-amber-400' },
                    { name: 'Phoenix Hub Mall', budget: 65000000, color: 'bg-rose-400' }
                  ].map((proj, idx) => {
                    const projectExp = expenses.filter(e => e.project === proj.name).reduce((sum, e) => sum + e.amount, 0);
                    const pct = Math.round((projectExp / proj.budget) * 100) || 5; // minimum visual width
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-300 font-sans truncate max-w-[150px]">{proj.name}</span>
                          <span className="text-slate-400">₹{projectExp.toLocaleString()} / ₹{(proj.budget/100000).toFixed(0)}L ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                          <div 
                            className={`h-full rounded-full ${proj.color}`}
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
                  onClick={() => setActiveTab('expenses')}
                  className="w-full py-1.5 rounded bg-slate-900 hover:bg-slate-850 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 border border-slate-800 cursor-pointer"
                >
                  Manage Operational Expenses
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Row: Pending Payments Timeline & Cash Flow Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Cash Flow Overview Widget (UI Ready) */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <span className="text-xs font-bold text-white uppercase tracking-tight">RealtyConnect Cash Flow Summary</span>
                <span className="text-[10px] font-mono text-emerald-400">Live Forecast</span>
              </div>

              <div className="space-y-3.5">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-900">
                    <span className="text-[9px] text-slate-500 uppercase font-mono">Total Inflow</span>
                    <p className="text-xs font-bold text-white font-mono mt-1">₹{(stats.totalRevenue/100000).toFixed(1)}L</p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-900">
                    <span className="text-[9px] text-slate-500 uppercase font-mono">Total Outflow</span>
                    <p className="text-xs font-bold text-slate-400 font-mono mt-1">₹{(stats.totalExpenses/100000).toFixed(1)}L</p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-900">
                    <span className="text-[9px] text-slate-500 uppercase font-mono">Net Surplus</span>
                    <p className="text-xs font-bold text-emerald-400 font-mono mt-1">₹{((stats.totalRevenue - stats.totalExpenses)/100000).toFixed(1)}L</p>
                  </div>
                </div>

                <div className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="text-xs font-bold text-white">Reconciled Commercial Status</p>
                      <p className="text-[9px] text-slate-400">Audited cash reserves and balance matching active.</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">Stable</span>
                </div>
              </div>
            </div>

            {/* Upcoming/Overdue billing ledger widget */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <span className="text-xs font-bold text-white uppercase tracking-tight">Overdue & Outstanding Ledger</span>
                <span className="text-[9px] font-mono text-rose-400">Awaiting Settlement</span>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {billings.filter(b => b.paymentStatus !== 'Paid' && b.paymentStatus !== 'Cancelled').map((b) => {
                  const balance = b.totalAmount - b.paidAmount;
                  return (
                    <div key={b.id} className="p-2.5 bg-slate-950 rounded-lg border border-slate-900 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-slate-500">{b.invoiceNumber}</span>
                          <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${
                            b.paymentStatus === 'Overdue' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>{b.paymentStatus.toUpperCase()}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white">{b.customer}</h4>
                      </div>

                      <div className="text-right font-mono text-xs">
                        <div className="text-rose-400 font-bold">₹{balance.toLocaleString()}</div>
                        <div className="text-[8px] text-slate-500">Due: {b.dueDate}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* VIEW 2: BILLING & CUSTOMER INVOICES DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-6 animate-in fade-in duration-200 text-left">
          
          {/* Advanced Search & Filtering Controls */}
          <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search invoices by Invoice Number, Customer, Project, Quotation reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => setIsNewInvoiceModalOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Invoice</span>
              </button>
            </div>

            {/* Quick Filters Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 font-mono uppercase mb-1 font-bold">Payment Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Pending">Pending</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-mono uppercase mb-1 font-bold">Customer</label>
                <select
                  value={filterCustomer}
                  onChange={(e) => setFilterCustomer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                >
                  <option value="All">All Customers</option>
                  <option value="Rajesh Aggarwal">Rajesh Aggarwal</option>
                  <option value="Phoenix Hub Retail">Phoenix Hub Retail</option>
                  <option value="Nisha Mehta Logistics">Nisha Mehta Logistics</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-mono uppercase mb-1 font-bold">Project Context</label>
                <select
                  value={filterProject}
                  onChange={(e) => setFilterProject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                >
                  <option value="All">All Projects</option>
                  <option value="Amara Sky Towers">Amara Sky Towers</option>
                  <option value="Giga Logistics Park">Giga Logistics Park</option>
                  <option value="Phoenix Hub Mall">Phoenix Hub Mall</option>
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={() => {
                    setFilterStatus('All');
                    setFilterCustomer('All');
                    setFilterProject('All');
                    setSearchQuery('');
                    showToast('Cleared filters.', 'info');
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs py-1.5 rounded font-mono font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              </div>
            </div>
          </div>

          {/* Results List */}
          <div className="bg-slate-900/20 border border-slate-900 rounded-xl overflow-hidden">
            <div className="p-4 bg-slate-900/60 border-b border-slate-850 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Active Billing Records ({filteredBillings.length})</span>
              <span className="text-[10px] font-mono text-slate-500">Milestone Legal Bills</span>
            </div>

            <div className="divide-y divide-slate-900">
              {filteredBillings.map((bill) => {
                const balance = bill.totalAmount - bill.paidAmount;
                return (
                  <div key={bill.id} className="p-4 hover:bg-slate-900/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-400">{bill.invoiceNumber}</span>
                        <span className="text-[10px] text-slate-500 font-mono">| Ref: {bill.quotationRef || 'Manual'}</span>
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          bill.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' :
                          bill.paymentStatus === 'Partially Paid' ? 'bg-amber-500/10 text-amber-400' :
                          bill.paymentStatus === 'Overdue' ? 'bg-red-500/10 text-red-400' : 'bg-slate-500/10 text-slate-400'
                        }`}>{bill.paymentStatus.toUpperCase()}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{bill.customer}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Project: {bill.project}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left md:text-right">
                      <div>
                        <span className="block text-[9px] text-slate-500 font-mono uppercase">Issued Date</span>
                        <span className="text-xs font-medium text-slate-300">{bill.invoiceDate}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-500 font-mono uppercase">Due Date</span>
                        <span className="text-xs font-medium text-slate-300">{bill.dueDate}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-500 font-mono uppercase">Total Amount</span>
                        <span className="text-sm font-bold text-white font-mono">₹{bill.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedInvoice(bill);
                            setIsPreviewModalOpen(true);
                          }}
                          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-2 rounded text-slate-300 transition-all cursor-pointer"
                          title="Preview & Print Invoice"
                        >
                          <Printer className="w-3.5 h-3.5 text-emerald-400" />
                        </button>
                        {bill.paymentStatus !== 'Paid' && (
                          <button
                            onClick={() => {
                              setPaymentForm(prev => ({
                                ...prev,
                                invoiceNumber: bill.invoiceNumber,
                                customer: bill.customer,
                                amount: balance.toString()
                              }));
                              setIsPaymentEntryModalOpen(true);
                            }}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-[10px] px-2.5 py-1.5 rounded tracking-wider uppercase cursor-pointer"
                          >
                            Pay
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 3: QUOTATION MANAGEMENT */}
      {activeTab === 'quotations' && (
        <div className="space-y-6 animate-in fade-in duration-200 text-left">
          
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Business Commercial Proposals & Quotations</h3>
            <button
              onClick={() => setIsNewQuoteModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Quotation</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Quotations List */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl divide-y divide-slate-900">
              <div className="p-4 bg-slate-900/60 flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase font-mono">Issued Quotations</span>
                <span className="text-[10px] font-mono text-slate-500">Interactive Proposals</span>
              </div>

              {quotations.map((q) => (
                <div 
                  key={q.id} 
                  onClick={() => setSelectedQuotation(q)}
                  className={`p-4 hover:bg-slate-900/40 transition-all cursor-pointer flex items-center justify-between ${
                    selectedQuotation?.id === q.id ? 'bg-slate-900/50 border-l-2 border-emerald-500' : ''
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-400">{q.number}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                        q.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' :
                        q.status === 'Pending' ? 'bg-amber-500/10 text-amber-400' :
                        q.status === 'Converted' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-500/10 text-slate-400'
                      }`}>{q.status.toUpperCase()}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white">{q.customer}</h4>
                    <p className="text-[11px] text-slate-400">Project: {q.project}</p>
                  </div>

                  <div className="text-right font-mono text-xs">
                    <span className="block font-bold text-white">₹{q.total.toLocaleString()}</span>
                    <span className="text-[9px] text-slate-500">Exp: {q.expiryDate}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Quotation Details Panel */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 space-y-4">
              {selectedQuotation ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">{selectedQuotation.number}</span>
                      <h3 className="text-sm font-bold text-white mt-0.5">Commercial Proposal</h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleDuplicateQuotation(selectedQuotation)}
                        className="bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3 text-slate-400" /> Duplicate
                      </button>

                      {selectedQuotation.status === 'Approved' && (
                        <button
                          onClick={() => handleConvertQuoteToInvoice(selectedQuotation)}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                        >
                          <FileCheck className="w-3 h-3" /> Convert to Bill
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Core details mapping info */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 uppercase font-mono text-[9px] block">Customer</span>
                      <span className="text-slate-300 font-semibold">{selectedQuotation.customer}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase font-mono text-[9px] block">Project</span>
                      <span className="text-slate-300 font-semibold">{selectedQuotation.project}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase font-mono text-[9px] block">Proposal Date</span>
                      <span className="text-slate-300">{selectedQuotation.date}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase font-mono text-[9px] block">Expiry Date</span>
                      <span className="text-slate-300">{selectedQuotation.expiryDate}</span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="border border-slate-900 rounded-lg overflow-hidden bg-slate-950/60">
                    <table className="w-full text-left text-xs font-sans">
                      <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-mono">
                        <tr>
                          <th className="p-2">Item Name</th>
                          <th className="p-2 text-center">Qty</th>
                          <th className="p-2 text-right">Rate</th>
                          <th className="p-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900 text-slate-300">
                        {selectedQuotation.items.map((itm, idx) => (
                          <tr key={idx}>
                            <td className="p-2 font-medium">{itm.name}</td>
                            <td className="p-2 text-center font-mono">{itm.qty}</td>
                            <td className="p-2 text-right font-mono">₹{itm.rate.toLocaleString()}</td>
                            <td className="p-2 text-right font-mono text-white">₹{itm.total.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Financial calculation details */}
                  <div className="space-y-1.5 border-t border-slate-900 pt-3 text-xs font-mono text-right">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Subtotal:</span>
                      <span className="text-slate-300">₹{selectedQuotation.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Applied Tax (18% GST):</span>
                      <span className="text-emerald-400">+₹{selectedQuotation.tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Contractor Discount:</span>
                      <span className="text-rose-400">-₹{selectedQuotation.discount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold border-t border-slate-900 pt-1.5 text-white">
                      <span>Total Value:</span>
                      <span>₹{selectedQuotation.total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Actions for Status Approval */}
                  {selectedQuotation.status === 'Pending' && (
                    <div className="flex gap-2 pt-3">
                      <button
                        onClick={() => handleStatusChangeQuote(selectedQuotation.id, 'Approved')}
                        className="flex-1 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold uppercase cursor-pointer"
                      >
                        Approve Proposal
                      </button>
                      <button
                        onClick={() => handleStatusChangeQuote(selectedQuotation.id, 'Rejected')}
                        className="flex-1 py-1.5 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-bold uppercase cursor-pointer"
                      >
                        Reject Proposal
                      </button>
                    </div>
                  )}

                  {/* Quote timeline logs */}
                  <div className="border-t border-slate-900 pt-3">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1 font-bold">Proposal Audit Timeline</span>
                    <div className="space-y-1 text-[11px] text-slate-400 font-mono">
                      {selectedQuotation.history.map((h, i) => (
                        <div key={i} className="flex justify-between">
                          <span>{h.action} by {h.user}</span>
                          <span>{h.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="h-44 flex items-center justify-center text-xs text-slate-500 font-mono">
                  Select a quotation from the list to view commercial terms, items, conversions and approvals.
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* VIEW 4: INVOICE TIMELINES & PREVIEWS */}
      {activeTab === 'invoices' && (
        <div className="space-y-6 animate-in fade-in duration-200 text-left">
          
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">RealtyConnect Master Client Invoices</h3>
            <button
              onClick={() => setIsNewInvoiceModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Manual Invoice</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left: Invoice grid list */}
            <div className="md:col-span-2 space-y-3">
              {billings.map((bill) => {
                const outstanding = bill.totalAmount - bill.paidAmount;
                return (
                  <div key={bill.id} className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl hover:border-slate-800 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-400">{bill.invoiceNumber}</span>
                        <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded ${
                          bill.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' :
                          bill.paymentStatus === 'Partially Paid' ? 'bg-amber-500/10 text-amber-400' :
                          bill.paymentStatus === 'Overdue' ? 'bg-red-500/10 text-red-400' : 'bg-slate-500/10 text-slate-400'
                        }`}>{bill.paymentStatus.toUpperCase()}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{bill.customer}</h4>
                      <p className="text-xs text-slate-400 font-sans">Project: {bill.project}</p>
                    </div>

                    <div className="text-right font-mono text-xs space-y-1">
                      <div>
                        <span className="text-slate-500 text-[10px] block uppercase">Outstanding Balance</span>
                        <span className="text-sm font-bold text-rose-400">₹{outstanding.toLocaleString()}</span>
                      </div>
                      <div className="flex gap-1.5 justify-end">
                        <button
                          onClick={() => {
                            setSelectedInvoice(bill);
                            setIsPreviewModalOpen(true);
                          }}
                          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2 py-1 rounded text-[10px] uppercase font-bold text-emerald-400 cursor-pointer"
                        >
                          Print Preview
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Master Invoice Timeline Widget */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-2">Central Billing Timeline</h3>
              
              <div className="relative border-l border-slate-850 pl-4 space-y-4 ml-2 text-left">
                {billings.map((bill, bIdx) => (
                  <div key={bIdx} className="relative space-y-1">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-4 ring-slate-950" />
                    <span className="text-[10px] font-mono text-slate-500">{bill.invoiceDate}</span>
                    <h4 className="text-xs font-bold text-white">{bill.invoiceNumber} — Issued</h4>
                    <p className="text-[11px] text-slate-400">Issued to {bill.customer} for project "{bill.project}". Value: ₹{bill.totalAmount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* VIEW 5: PAYMENTS RECEIVED LEDGER */}
      {activeTab === 'payments' && (
        <div className="space-y-6 animate-in fade-in duration-200 text-left">
          
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Payment Allocation Ledger & Receipts</h3>
            <button
              onClick={() => setIsPaymentEntryModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Coins className="w-4 h-4" />
              <span>Record Direct Payment</span>
            </button>
          </div>

          <div className="bg-slate-900/20 border border-slate-900 rounded-xl overflow-hidden">
            <div className="p-4 bg-slate-900/60 border-b border-slate-900 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase font-mono">Settlement Audit Logs</span>
              <span className="text-[10px] font-mono text-emerald-400">Real-time payment records</span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-900">
                <tr>
                  <th className="p-3">Payment ID</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Invoice Ref</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Payment Method</th>
                  <th className="p-3">Receipt Reference</th>
                  <th className="p-3 text-right">Settled Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-slate-300 font-mono">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/20">
                    <td className="p-3 text-slate-400 font-bold">{p.id}</td>
                    <td className="p-3">{p.date}</td>
                    <td className="p-3 text-emerald-400">{p.invoiceNumber}</td>
                    <td className="p-3 text-white font-sans">{p.customer}</td>
                    <td className="p-3">{p.paymentMethod}</td>
                    <td className="p-3 text-slate-500">{p.receiptReference}</td>
                    <td className="p-3 text-right text-emerald-400 font-bold">₹{p.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* VIEW 6: EXPENSE MANAGEMENT */}
      {activeTab === 'expenses' && (
        <div className="space-y-6 animate-in fade-in duration-200 text-left">
          
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Project & Business Outflow Expenses</h3>
            <button
              onClick={() => setIsNewExpenseModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left Column: List of logged expenses */}
            <div className="md:col-span-2 bg-slate-900/20 border border-slate-900 rounded-xl overflow-hidden text-left">
              <div className="p-4 bg-slate-900/60 border-b border-slate-900 flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase font-mono">Operational Ledger</span>
                <span className="text-[10px] font-mono text-slate-500">Expenses tracking</span>
              </div>

              <div className="divide-y divide-slate-900">
                {expenses.map((e) => (
                  <div key={e.id} className="p-4 flex items-center justify-between hover:bg-slate-900/40 transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-amber-500">{e.id}</span>
                        <span className="text-[9px] font-mono bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-bold">{e.categoryType.toUpperCase()}</span>
                        <span className="text-[10px] text-slate-500 font-mono">Ref: {e.reference}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white">{e.notes}</h4>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span>Project: {e.project}</span>
                        <span className="text-slate-600">•</span>
                        <span>Vendor: {e.supplier}</span>
                      </p>
                    </div>

                    <div className="text-right font-mono text-xs">
                      <span className="block font-bold text-white">₹{e.amount.toLocaleString()}</span>
                      <span className="text-[9px] text-slate-500">{e.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Categories Breakdowns */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-2">Category Allocations</h3>
              
              <div className="space-y-4 pt-2">
                {[
                  { name: 'Construction Materials', type: 'Project' },
                  { name: 'Equipment Rental', type: 'Operational' },
                  { name: 'Labor Costs', type: 'Project' },
                  { name: 'Operations', type: 'Operational' }
                ].map((cat, idx) => {
                  const catAmt = expenses.filter(e => e.category === cat.name).reduce((sum, e) => sum + e.amount, 0);
                  const pct = stats.totalExpenses > 0 ? Math.round((catAmt / stats.totalExpenses) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-300 font-sans">{cat.name}</span>
                        <span className="text-slate-400">₹{catAmt.toLocaleString()} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* VIEW 7: CROSS-MODULE SPRINT INTEGRATIONS */}
      {activeTab === 'integrations' && (
        <div className="space-y-6 animate-in fade-in duration-200 text-left">
          
          <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl space-y-2">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Cross-Module Commercial Integrations</h3>
            <p className="text-xs text-slate-400">
              Finance & Billing connects to Lead Management, RFQs, CRM profiles, Procurement and Inventory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Project Financial Summary */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-900 pb-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Project Integration</span>
              </h4>
              <p className="text-[11px] text-slate-400">Budgets and billing mapping linked to structural project timelines.</p>
              
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Amara Sky Towers Budget:</span>
                  <span className="text-white">₹4,80,00,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Project Expenses:</span>
                  <span className="text-amber-400">₹{expenses.filter(e => e.project === 'Amara Sky Towers').reduce((sum, e) => sum + e.amount, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Project Invoices Issued:</span>
                  <span className="text-emerald-400">₹{billings.filter(b => b.project === 'Amara Sky Towers').reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* CRM Financial Profile */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-900 pb-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>CRM Integration</span>
              </h4>
              <p className="text-[11px] text-slate-400">Client billing, payment receipts, and proposal histories tied to customer files.</p>
              
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Active Clients:</span>
                  <span className="text-white">Rajesh Aggarwal, Nisha Mehta</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Quotation History count:</span>
                  <span className="text-emerald-400">{quotations.length} Proposals</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Outstanding client balance:</span>
                  <span className="text-rose-400">₹{stats.outstandingAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Leads Commercial Value */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-900 pb-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Lead Integration</span>
              </h4>
              <p className="text-[11px] text-slate-400">Tying prospective opportunities to legal commercial quotation values.</p>
              
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Quotation Linked to Lead ID:</span>
                  <span className="text-white">LD-4412 (Aggarwal Steel)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lead Commercial Value:</span>
                  <span className="text-white">₹13,66,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Converted Revenue (UI Ready):</span>
                  <span className="text-emerald-400 font-bold">₹8,00,000</span>
                </div>
              </div>
            </div>

            {/* Procurement Costs */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-900 pb-2">
                <ClipboardList className="w-4 h-4 text-emerald-400" />
                <span>Procurement Integration</span>
              </h4>
              <p className="text-[11px] text-slate-400">Procurement purchase receipts mapped directly to operational expenses.</p>
              
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Vendor Bills:</span>
                  <span className="text-white">Elite Materials PO-7712</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Purchase Cost:</span>
                  <span className="text-white">₹4,50,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Procurement Expenses sum:</span>
                  <span className="text-emerald-400">₹{expenses.filter(e => e.categoryType === 'Vendor').reduce((sum, e) => sum + e.amount, 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Inventory Valuation */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-900 pb-2">
                <ClipboardList className="w-4 h-4 text-emerald-400" />
                <span>Inventory Valuation</span>
              </h4>
              <p className="text-[11px] text-slate-400">Live storage stock value index and materials purchase reconciliation.</p>
              
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Stock Valuation (UI Ready):</span>
                  <span className="text-white">₹1,85,00,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Material Costs logged:</span>
                  <span className="text-white">₹{expenses.filter(e => e.category === 'Construction Materials').reduce((sum, e) => sum + e.amount, 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Marketplace Billing & RFQ */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-900 pb-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span>Marketplace & RFQ Billing</span>
              </h4>
              <p className="text-[11px] text-slate-400">B2B marketplace orders commercial checkouts and RFQ awarded values.</p>
              
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Awarded RFQ Value:</span>
                  <span className="text-white">₹13,66,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Marketplace Orders (UI Ready):</span>
                  <span className="text-white">₹1,20,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Supplier Commercial Summary:</span>
                  <span className="text-emerald-400">Elite Group Active</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* VIEW 8: REPORTS PANEL */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-in fade-in duration-200 text-left">
          
          <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl space-y-1">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Financial Audit Report Generator</h3>
            <p className="text-xs text-slate-400">Generate on-demand ledger exports, customer balance grids, and budget execution reports.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { title: 'Revenue Report', desc: 'Summary of paid and partially paid milestones.', type: 'revenue' },
              { title: 'Expense Report', desc: 'Outflow categorized by operations vs project supplies.', type: 'expense' },
              { title: 'Outstanding Report', desc: 'Unpaid client bills and overdue collection tracking.', type: 'outstanding' },
              { title: 'Budget Report', desc: 'Project allocation utilization analysis.', type: 'budget' }
            ].map((rep, idx) => (
              <div key={idx} className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">{rep.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1">{rep.desc}</p>
                </div>
                <button
                  onClick={() => {
                    showToast(`Generated & downloaded "${rep.title}" PDF report.`, 'success');
                    onLogTriggered('FINANCE_REPORT_GENERATED', 'reports', rep.type, 'SUCCESS', `Finance: Generated audit report ${rep.title}`);
                  }}
                  className="w-full py-1 rounded bg-slate-900 hover:bg-slate-850 text-[10px] font-mono font-bold uppercase tracking-wider border border-slate-800 text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download Report</span>
                </button>
              </div>
            ))}
          </div>

          {/* Customer & Vendor Ledger previews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Customer Ledger Preview */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 text-left space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-2 font-mono">Customer Ledger Sheet</h4>
              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span>Rajesh Aggarwal</span>
                  <span className="text-emerald-400 font-bold">Total Invoiced: ₹13,66,000</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span>Phoenix Hub Retail</span>
                  <span className="text-amber-400 font-bold">Total Invoiced: ₹4,13,000</span>
                </div>
              </div>
            </div>

            {/* Vendor Ledger Preview */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 text-left space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-2 font-mono">Vendor Commercial Ledger</h4>
              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span>Elite Materials Group</span>
                  <span className="text-slate-400">Total Purchase: ₹4,50,000</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span>Soni Crane Services</span>
                  <span className="text-slate-400">Total Purchase: ₹85,000</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* MODAL 1: NEW QUOTATION CREATE */}
      {isNewQuoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Generate Quotation Proposal</h3>
              <button onClick={() => setIsNewQuoteModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuotation} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1 font-bold">Customer Name</label>
                  <input
                    type="text"
                    value={quoteForm.customer}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, customer: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1 font-bold">Project Context</label>
                  <input
                    type="text"
                    value={quoteForm.project}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, project: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1 font-bold">Subtotal Amount (₹)</label>
                  <input
                    type="number"
                    value={quoteForm.amount}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1 font-bold">Tax Value (₹)</label>
                  <input
                    type="number"
                    value={quoteForm.tax}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, tax: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1 font-bold">Discount (₹)</label>
                  <input
                    type="number"
                    value={quoteForm.discount}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, discount: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1 font-bold">Proposal Items (Format: Name;Qty;Rate - newline separated)</label>
                <textarea
                  value={quoteForm.itemsText}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, itemsText: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 h-20 font-mono"
                  placeholder="E.g. Safety Helmets;100;500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1 font-bold">Remarks & Mobilization clauses</label>
                <textarea
                  value={quoteForm.remarks}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, remarks: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 h-16"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold uppercase rounded-lg cursor-pointer"
              >
                Register & Save Quotation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: NEW INVOICE CREATE */}
      {isNewInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-slate-880 pb-3">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Issue New Customer Invoice</h3>
              <button onClick={() => setIsNewInvoiceModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1 font-bold">Client/Customer Name</label>
                  <input
                    type="text"
                    value={invoiceForm.customer}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, customer: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1 font-bold">Associated Project</label>
                  <input
                    type="text"
                    value={invoiceForm.project}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, project: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1 font-bold">Quotation Reference ID</label>
                  <input
                    type="text"
                    value={invoiceForm.quotationRef}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, quotationRef: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                    placeholder="E.g. RC-QT-0941"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1 font-bold">Invoice Due Date</label>
                  <input
                    type="date"
                    value={invoiceForm.dueDate}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1 font-bold">Amount Subtotal (₹)</label>
                  <input
                    type="number"
                    value={invoiceForm.amount}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1 font-bold">Estimated Tax (₹)</label>
                  <input
                    type="number"
                    value={invoiceForm.tax}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, tax: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1 font-bold">Discount Allowed (₹)</label>
                  <input
                    type="number"
                    value={invoiceForm.discount}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, discount: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1 font-bold">Milestone Summary Description</label>
                <textarea
                  value={invoiceForm.remarks}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, remarks: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 h-20"
                  placeholder="Specify milestone work accomplishments..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold uppercase rounded-lg cursor-pointer"
              >
                Issue and Email Legal Bill
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DIRECT PAYMENT RECONCILIATION ENTRY */}
      {isPaymentEntryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Record Invoice Settlement Tranche</h3>
              <button onClick={() => setIsPaymentEntryModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentEntry} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1 font-bold">Target Invoice Number</label>
                <input
                  type="text"
                  value={paymentForm.invoiceNumber}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                  placeholder="E.g. RC-INV-8801"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1 font-bold">Settled Amount (₹)</label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1 font-bold">Settlement Method</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300"
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cash">Cash Ledger</option>
                    <option value="Cheque">Corporate Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1 font-bold">RTGS/Receipt Reference ID</label>
                  <input
                    type="text"
                    value={paymentForm.receiptReference}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, receiptReference: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                    placeholder="E.g. TXN-HDFC-99121"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1 font-bold">Internal settlement reconciliation notes</label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 h-16"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold uppercase rounded-lg cursor-pointer"
              >
                Reconcile & Issue Receipt
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: RECORD OPERATIONAL EXPENSE */}
      {isNewExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Log Business/Project Outflow Expense</h3>
              <button onClick={() => setIsNewExpenseModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1 font-bold">Expense Category</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300"
                  >
                    <option value="Construction Materials">Construction Materials</option>
                    <option value="Equipment Rental">Equipment Rental</option>
                    <option value="Labor Costs">Labor Costs</option>
                    <option value="Operations">Operations</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Travel">Travel</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1 font-bold">Allocation Type</label>
                  <select
                    value={expenseForm.categoryType}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, categoryType: e.target.value as any }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300"
                  >
                    <option value="Project">Project Cost</option>
                    <option value="Operational">Operational Overhead</option>
                    <option value="Vendor">Vendor/Purchase Bill</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1 font-bold">Outflow Value (₹)</label>
                  <input
                    type="number"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1 font-bold">Project Allocation</label>
                  <select
                    value={expenseForm.project}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, project: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300"
                  >
                    <option value="Amara Sky Towers">Amara Sky Towers</option>
                    <option value="Giga Logistics Park">Giga Logistics Park</option>
                    <option value="Phoenix Hub Mall">Phoenix Hub Mall</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1 font-bold">Vendor/Supplier</label>
                  <input
                    type="text"
                    value={expenseForm.supplier}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, supplier: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1 font-bold">PO/Bill Reference ID</label>
                  <input
                    type="text"
                    value={expenseForm.reference}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, reference: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
                    placeholder="E.g. PO-7712"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-mono uppercase mb-1 font-bold">Expense description and remarks</label>
                <textarea
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 h-16"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold uppercase rounded-lg cursor-pointer"
              >
                Log Outflow Allocation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: SWISS SLATE LEGAL INVOICE PRINT PREVIEW */}
      {isPreviewModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-850 rounded-xl max-w-2xl w-full p-6 text-left space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Swiss Slate Print Layout (UI Ready)</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    showToast('Document sent to spooler stream.', 'success');
                  }}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1 text-xs font-extrabold uppercase rounded flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Send to Printer</span>
                </button>
                <button onClick={() => setIsPreviewModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Print Area Layout */}
            <div className="p-6 bg-slate-950 rounded-lg border border-slate-850 space-y-6 font-sans text-xs">
              
              {/* Header block */}
              <div className="flex justify-between items-start border-b border-slate-900 pb-5">
                <div>
                  <h2 className="text-lg font-black tracking-tight text-white uppercase">REALTYCONNECT™</h2>
                  <p className="text-[10px] text-slate-500 font-mono">B2B Sourcing, Networking & Infrastructure Solutions</p>
                  <p className="text-[10px] text-slate-500">BKC Area, Bandra East, Mumbai, India</p>
                </div>
                <div className="text-right font-mono">
                  <h3 className="text-base font-bold text-emerald-400">Tax Invoice</h3>
                  <p className="text-white font-bold">{selectedInvoice.invoiceNumber}</p>
                  <p className="text-slate-500">Date: {selectedInvoice.invoiceDate}</p>
                  <p className="text-slate-500">Due: {selectedInvoice.dueDate}</p>
                </div>
              </div>

              {/* Bill to block */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Bill to:</h4>
                  <p className="text-sm font-extrabold text-white">{selectedInvoice.customer}</p>
                  <p className="text-slate-400">Project: {selectedInvoice.project}</p>
                </div>
                <div className="text-right">
                  <h4 className="text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Remittance to:</h4>
                  <p className="text-sm font-extrabold text-white">RealtyConnect Infrastructure Ltd</p>
                  <p className="text-slate-400">Hdfc Bank — IFSC HDFC0001094</p>
                </div>
              </div>

              {/* Items Summary line */}
              <div className="border border-slate-900 rounded-lg overflow-hidden bg-slate-900/10">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 text-[9px] font-mono uppercase text-slate-400">
                    <tr>
                      <th className="p-2">Line Item Description</th>
                      <th className="p-2 text-right">Tax Basis</th>
                      <th className="p-2 text-right">Discount</th>
                      <th className="p-2 text-right">Settled Tranche</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-slate-300">
                      <td className="p-2">
                        <p className="font-bold text-white">Project Work Mobilization</p>
                        <p className="text-[10px] text-slate-500">{selectedInvoice.remarks}</p>
                      </td>
                      <td className="p-2 text-right font-mono">₹{selectedInvoice.amount.toLocaleString()}</td>
                      <td className="p-2 text-right font-mono text-rose-400">₹{selectedInvoice.discount.toLocaleString()}</td>
                      <td className="p-2 text-right font-mono text-white">₹{selectedInvoice.totalAmount.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation summary */}
              <div className="space-y-1 text-right font-mono">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Subtotal Amount:</span>
                  <span className="text-slate-300">₹{selectedInvoice.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Add GST (18% applied):</span>
                  <span className="text-emerald-400">+₹{selectedInvoice.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Less Mobilization Discount:</span>
                  <span className="text-rose-400">-₹{selectedInvoice.discount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-white border-t border-slate-900 pt-2">
                  <span>Grand Total Payable:</span>
                  <span>₹{selectedInvoice.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] text-emerald-400 font-bold border-t border-slate-900/60 pt-1">
                  <span>Amount Settled to Date:</span>
                  <span>₹{selectedInvoice.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] text-rose-400 font-bold">
                  <span>Outstanding Balance Due:</span>
                  <span>₹{(selectedInvoice.totalAmount - selectedInvoice.paidAmount).toLocaleString()}</span>
                </div>
              </div>

              {/* Remittance Terms footer */}
              <div className="border-t border-slate-900 pt-4 text-center text-[10px] text-slate-500 font-mono">
                <p>Thank you for your business. Terms: Settlement is due within 30 days of the invoice issuance date.</p>
                <p className="mt-1">© 2026 REALTYCONNECT™. All rights reserved.</p>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
