/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Briefcase, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Upload, 
  FileText, 
  Check, 
  Search, 
  Award, 
  MapPin, 
  Database, 
  HelpCircle, 
  Lock, 
  CreditCard,
  Building,
  Terminal,
  FileCheck,
  AlertTriangle,
  FileCode,
  DollarSign,
  Activity,
  Plus,
  Send,
  Eye,
  CheckSquare,
  MessageSquare,
  Sliders,
  Filter,
  UserPlus,
  Trash2,
  ChevronRight,
  Globe,
  Share2
} from 'lucide-react';

import {
  StakeholderType,
  ELIGIBILITY_RULES,
  DOCUMENT_REQUIREMENTS,
  MEMBERSHIP_PLANS,
  MOCK_DIRECTORY_PARTNERS,
  TECHNICAL_BLUEPRINT_TABS,
  DirectoryPartner,
  MembershipPlan
} from './RegistrationSpecs';

interface RegistrationOnboardingProps {
  onLogTriggered: (action: string, entity: string, entityId: string, status: 'SUCCESS' | 'FAILURE' | 'WARNING', details: string) => void;
  userSession: { email: string; role: string; permissions: string[] } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onBackToLanding: () => void;
}

// Interactive Simulated Test Interface
interface SimulatedTestResult {
  name: string;
  category: string;
  status: 'passed' | 'failed' | 'idle' | 'running';
  log: string;
}

export default function RegistrationOnboarding({ 
  onLogTriggered, 
  userSession, 
  showToast, 
  onBackToLanding 
}: RegistrationOnboardingProps) {
  
  // Design Specification / Module Documentation Modal State
  const [showSpecsDrawer, setShowSpecsDrawer] = useState<boolean>(false);
  const [activeSpecTab, setActiveSpecTab] = useState<string>('requirements');

  // Test Suite execution states
  const [runningTests, setRunningTests] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<SimulatedTestResult[]>([
    { name: 'RERA Registration ID Compliance check', category: 'Business Rules', status: 'idle', log: 'Awaiting execution...' },
    { name: 'Cryptographic Document Quarantine Verification', category: 'Security Gateway', status: 'idle', log: 'Awaiting execution...' },
    { name: 'Business Profile Strength Progression', category: 'Data Schema', status: 'idle', log: 'Awaiting execution...' },
    { name: 'Dynamic B2B Inquiry Routing Loop', category: 'API Integration', status: 'idle', log: 'Awaiting execution...' },
    { name: 'RBI Escrow API Disbursement Authorization', category: 'Financial Escrows', status: 'idle', log: 'Awaiting execution...' }
  ]);

  // General wizard steps (1 to 5)
  const [activeRole, setActiveRole] = useState<StakeholderType>('builder');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [roleFinalized, setRoleFinalized] = useState<boolean>(false);

  // Profile states
  const [businessName, setBusinessName] = useState<string>('');
  const [headquarters, setHeadquarters] = useState<string>('');
  const [foundedYear, setFoundedYear] = useState<string>('2019');
  const [employeeCount, setEmployeeCount] = useState<string>('30');
  const [companyLogo, setCompanyLogo] = useState<string>('');
  const [govId, setGovId] = useState<string>('');
  
  // Custom metadata based on stakeholder
  const [extraField1, setExtraField1] = useState<string>(''); // Class License or Machinery count
  const [extraField2, setExtraField2] = useState<string>(''); // Annual Turnover or Lending limit

  // Eligibility Checkbox States
  const [checkedCriteria, setCheckedCriteria] = useState<Record<string, boolean>>({});
  const [eligibilityPassed, setEligibilityPassed] = useState<boolean>(false);

  // Verification Audit States (GST / RERA / RBI API simulation)
  const [verifying, setVerifying] = useState<boolean>(false);
  const [verifiedEntity, setVerifiedEntity] = useState<any | null>(null);

  // Document Upload States
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { name: string; size: string; hash: string; scanned: boolean }>>({});
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Membership Pricing State
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(false);
  const [enteredDashboard, setEnteredDashboard] = useState<boolean>(false);

  // ==========================================
  // STATEFUL LIVE DASHBOARD WORKSPACE VALUES
  // ==========================================
  const [catalogProducts, setCatalogProducts] = useState<{ id: string; name: string; price: string; desc: string }[]>([]);
  const [catalogServices, setCatalogServices] = useState<{ id: string; name: string; rate: string }[]>([]);
  const [catalogProjects, setCatalogProjects] = useState<{ id: string; name: string; budget: string; location: string }[]>([]);
  const [teamMembers, setTeamMembers] = useState<{ id: string; email: string; role: string }[]>([
    { id: 't1', email: 'director@realtyconnect.in', role: 'Executive Board Member' }
  ]);

  // Input fields for dashboard checklist modals
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newServName, setNewServName] = useState('');
  const [newServRate, setNewServRate] = useState('');
  const [newProjName, setNewProjName] = useState('');
  const [newProjBudget, setNewProjBudget] = useState('');
  const [newProjLoc, setNewProjLoc] = useState('');
  const [newTeamEmail, setNewTeamEmail] = useState('');
  const [newTeamRole, setNewTeamRole] = useState('Manager');

  // Currently opened action modal inside growth checklist
  const [activeChecklistModal, setActiveChecklistModal] = useState<string | null>(null);

  // ==========================================
  // INTERACTIVE NETWORKING STATES
  // ==========================================
  const [networkingDistance, setNetworkingDistance] = useState<number>(30);
  const [networkingCategory, setNetworkingCategory] = useState<string>('All');
  const [connectedPartners, setConnectedPartners] = useState<Record<string, 'Connect' | 'Connected' | 'Following'>>({});
  const [activeInquiryPartner, setActiveInquiryPartner] = useState<DirectoryPartner | null>(null);
  const [inquiryMessage, setInquiryMessage] = useState<string>('');
  const [sendingInquiry, setSendingInquiry] = useState<boolean>(false);
  const [inquiryConversations, setInquiryConversations] = useState<Record<string, { sender: 'me' | 'partner'; text: string; time: string }[]>>({});

  // Trigger default plan selection when active role shifts
  useEffect(() => {
    const plans = MEMBERSHIP_PLANS[activeRole];
    if (plans && plans.length > 0) {
      setSelectedPlan(plans[plans.length > 1 ? 1 : 0].name);
    }
    setCheckedCriteria({});
    setEligibilityPassed(false);
    setGovId('');
    setVerifiedEntity(null);
  }, [activeRole]);

  // Keyboard Accessibility: Escape key handler for dialogs/drawers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSpecsDrawer(false);
        setActiveChecklistModal(null);
        setActiveInquiryPartner(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Dynamic Profile Strength calculator based on step and completed records
  const getProfileStrength = (): { label: 'Basic' | 'Growing' | 'Professional' | 'Verified' | 'Enterprise Ready'; color: string; desc: string; percent: number } => {
    if (enteredDashboard && catalogProducts.length > 0 && teamMembers.length > 1) {
      return { 
        label: 'Enterprise Ready', 
        color: 'text-purple-400 border-purple-500/30 bg-purple-500/5', 
        desc: 'Fully established and primed to submit public tenders & match local bank escrows.',
        percent: 100 
      };
    }
    if (onboardingComplete || enteredDashboard) {
      return { 
        label: 'Verified', 
        color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5', 
        desc: 'RERA/GSTIN matching confirmed. Authorized security tokens generated.',
        percent: 85 
      };
    }
    if (currentStep === 5) {
      return { 
        label: 'Professional', 
        color: 'text-blue-400 border-blue-500/30 bg-blue-500/5', 
        desc: 'Documentation scanned and cryptographic seals generated.',
        percent: 65 
      };
    }
    if (currentStep === 3 || currentStep === 4) {
      return { 
        label: 'Growing', 
        color: 'text-amber-400 border-amber-500/30 bg-amber-500/5', 
        desc: 'Ecosystem credentials gathered, waiting for legal COI scanning.',
        percent: 45 
      };
    }
    return { 
      label: 'Basic', 
      color: 'text-slate-400 border-slate-800 bg-slate-900/40', 
      desc: 'Initial qualification checklist in progress.',
      percent: 20 
    };
  };

  // Automated SHA256 simulation for blockchain-grade log consistency
  const calculateSHA256 = (input: string): string => {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = (hash << 5) - hash + input.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(16, 'ff') + "82b4010a39ce01e";
  };

  // Handle Eligibility check logic
  const handleToggleCriterion = (id: string) => {
    const updated = { ...checkedCriteria, [id]: !checkedCriteria[id] };
    setCheckedCriteria(updated);

    const rules = ELIGIBILITY_RULES[activeRole];
    const passedAllRequired = rules
      .filter(r => r.required)
      .every(r => updated[r.id] === true);

    setEligibilityPassed(passedAllRequired);
  };

  // Simulating live Government registry connection (RERA, GST, RBI)
  const handleVerifyId = () => {
    if (!govId.trim()) {
      showToast('Please specify a valid Statutory Corporate Identifier.', 'error');
      return;
    }
    setVerifying(true);
    
    onLogTriggered(
      'GOV_REGISTRY_QUERY_DISPATCHED',
      'external_api_service',
      govId,
      'SUCCESS',
      `Registry lookup requested. Contacting Central GSTIN & State RERA databases.`
    );

    setTimeout(() => {
      setVerifying(false);
      let entityName = '';
      let address = '';
      let coino = '';

      if (activeRole === 'builder') {
        entityName = govId.includes('MUM') ? 'Signature Global Infra Projects Ltd' : 'Apex Residency & Housing Developers Ltd';
        address = 'Golf Course Extension, High-Rise Cluster Sector 54, Gurugram';
        coino = 'L45201DL2015PLC279822';
        setBusinessName(entityName);
        setHeadquarters(address);
        setExtraField1('RERA-MUM-CLASS-01');
        setExtraField2('₹45 Crores');
      } else if (activeRole === 'vendor') {
        entityName = 'Larsen & Toubro Metal Castings & aggregates';
        address = 'Industrial Belt Phase-IV, Noida Sector 62';
        coino = 'L27100MH1946PLC004768';
        setBusinessName(entityName);
        setHeadquarters(address);
        setExtraField1('Bureau of Indian Standards BIS-53R');
        setExtraField2('₹12.8 Crores');
      } else if (activeRole === 'contractor') {
        entityName = 'Ahluwalia Structural Civil Contractors Pvt Ltd';
        address = 'Structural Yard, Sector-11, Rohini, New Delhi';
        coino = 'U45201DL1979PTC009584';
        setBusinessName(entityName);
        setHeadquarters(address);
        setExtraField1('Class-I Public Works license');
        setExtraField2('32 Certified Site Technicians');
      } else {
        entityName = 'State Bank Infrastructure & Escrow Unit';
        address = 'RBI Commercial Banking Tower, Sansad Marg, New Delhi';
        coino = 'L65190MH1956PLC008220';
        setBusinessName(entityName);
        setHeadquarters(address);
        setExtraField1('RBI-SCHEDULED-COMM-07');
        setExtraField2('₹1,500 Crores AUM capacity');
      }

      const match = {
        legalName: entityName,
        registeredAddress: address,
        incorporationNo: coino,
        status: 'Active & Solvent'
      };

      setVerifiedEntity(match);
      showToast(`Ecosystem trust matched: Found verified record for "${entityName}"`, 'success');
      
      onLogTriggered(
        'GOV_REGISTRY_QUERY_MATCHED',
        'external_api_service',
        govId,
        'SUCCESS',
        `Corporate ID matches legal entity "${entityName}". Auto-populating company dossier.`
      );
    }, 1200);
  };

  // Simulating quarantine document scanner
  const handleSimulateDocumentUpload = (docId: string, label: string) => {
    setUploadingDocId(docId);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const simulatedHash = calculateSHA256(docId + Date.now().toString()).substring(0, 32);
            setUploadedDocs(old => ({
              ...old,
              [docId]: {
                name: `${docId}_verified_sealed.pdf`,
                size: '2.4 MB',
                hash: `SHA256:${simulatedHash}`,
                scanned: true
              }
            }));
            setUploadingDocId(null);
            showToast(`Document "${label}" hash-locked & approved. Clean scan verified!`, 'success');
            
            onLogTriggered(
              'CREDENTIAL_HASH_LOCKED_SUCCESS',
              'quarantine_uploader',
              docId,
              'SUCCESS',
              `File scanned for malicious payload: CLEAN. Locked cryptographic signature [${simulatedHash.substring(0, 10)}] into portal node.`
            );
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  // Handle Wizard Advancement with Toast warnings
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!eligibilityPassed) {
        showToast('To maintain corporate compliance, we require all core criteria to be met.', 'error');
        return;
      }
      setRoleFinalized(true);
      setCurrentStep(2);
      onLogTriggered('ONBOARDING_ROLE_LOCKED', 'registration_wizard', activeRole, 'SUCCESS', `Stakeholder confirmed eligibility track for role "${activeRole}".`);
    } else if (currentStep === 2) {
      if (!verifiedEntity) {
        showToast('Please perform a RERA/GSTIN Registry verification first.', 'error');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      const requiredDocs = DOCUMENT_REQUIREMENTS[activeRole];
      const allUploaded = requiredDocs.every(doc => uploadedDocs[doc.id]);
      if (!allUploaded) {
        showToast('All mandated credentials must be uploaded to unlock the Trust Seal.', 'error');
        return;
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (!businessName.trim() || !headquarters.trim()) {
        showToast('Please fill out all primary business profile fields.', 'error');
        return;
      }
      setCurrentStep(5);
    }
  };

  // Complete onboarding signup
  const handleFinalizeOnboarding = () => {
    setOnboardingComplete(true);
    showToast(`Access credentials and B2B keys generated under tier: ${selectedPlan}!`, 'success');
    
    onLogTriggered(
      'ONBOARDING_COMPLETED_SUCCESS',
      'user_profile',
      businessName,
      'SUCCESS',
      `New B2B stakeholder registered: "${businessName}" approved with ${selectedPlan} license.`
    );
  };

  // Reset Onboarding Simulator
  const handleFullReset = () => {
    setCurrentStep(1);
    setRoleFinalized(false);
    setCheckedCriteria({});
    setEligibilityPassed(false);
    setGovId('');
    setVerifiedEntity(null);
    setUploadedDocs({});
    setBusinessName('');
    setHeadquarters('');
    setSelectedPlan('');
    setOnboardingComplete(false);
    setEnteredDashboard(false);
    setCatalogProducts([]);
    setCatalogServices([]);
    setCatalogProjects([]);
    setConnectedPartners({});
    setActiveInquiryPartner(null);
    
    onLogTriggered(
      'ONBOARDING_SIMULATOR_WIZARD_RESET',
      'registration_wizard',
      activeRole,
      'SUCCESS',
      `Onboarding flow completely reset by user.`
    );
  };

  // ==========================================
  // DYNAMIC COMPONENT ACTIONS (GROWTH MODULES)
  // ==========================================
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice.trim()) return;
    const newProd = {
      id: `p-${Date.now()}`,
      name: newProdName,
      price: newProdPrice,
      desc: newProdDesc
    };
    setCatalogProducts(prev => [...prev, newProd]);
    setNewProdName('');
    setNewProdPrice('');
    setNewProdDesc('');
    setActiveChecklistModal(null);
    showToast(`Catalog updated: "${newProd.name}" added to public products!`, 'success');
    onLogTriggered('CATALOG_ITEM_ADDED', 'products', newProd.id, 'SUCCESS', `Vendor product "${newProd.name}" published for quote biddings.`);
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServName.trim() || !newServRate.trim()) return;
    const newServ = {
      id: `s-${Date.now()}`,
      name: newServName,
      rate: newServRate
    };
    setCatalogServices(prev => [...prev, newServ]);
    setNewServName('');
    setNewServRate('');
    setActiveChecklistModal(null);
    showToast(`Service registered: "${newServ.name}" published to directory!`, 'success');
    onLogTriggered('CATALOG_ITEM_ADDED', 'services', newServ.id, 'SUCCESS', `Contracting service listed at ${newServ.rate}.`);
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim() || !newProjBudget.trim()) return;
    const newProj = {
      id: `pr-${Date.now()}`,
      name: newProjName,
      budget: newProjBudget,
      location: newProjLoc || 'Delhi NCR'
    };
    setCatalogProjects(prev => [...prev, newProj]);
    setNewProjName('');
    setNewProjBudget('');
    setNewProjLoc('');
    setActiveChecklistModal(null);
    showToast(`Portfolio expanded: "${newProj.name}" project listed!`, 'success');
    onLogTriggered('CATALOG_ITEM_ADDED', 'projects', newProj.id, 'SUCCESS', `Builder project portfolio expanded with budget: ${newProj.budget}.`);
  };

  const handleInviteTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamEmail.trim()) return;
    const newMember = {
      id: `t-${Date.now()}`,
      email: newTeamEmail,
      role: newTeamRole
    };
    setTeamMembers(prev => [...prev, newMember]);
    setNewTeamEmail('');
    setActiveChecklistModal(null);
    showToast(`Invitation dispatched to: ${newMember.email}`, 'success');
    onLogTriggered('TEAM_MEMBER_INVITED', 'organization', newMember.id, 'SUCCESS', `Dispatched onboarding registration invitation to colleague.`);
  };

  // Handle Connecting and Networking Actions
  const handleToggleConnect = (partnerId: string, partnerName: string) => {
    const current = connectedPartners[partnerId] || 'Connect';
    let next: 'Connect' | 'Connected' | 'Following' = 'Connected';
    
    if (current === 'Connected') {
      next = 'Following';
      showToast(`Now following ${partnerName} for feed updates!`, 'success');
      onLogTriggered('NETWORKING_FOLLOW_ACTIVE', 'connection', partnerId, 'SUCCESS', `User followed enterprise profile "${partnerName}".`);
    } else if (current === 'Following') {
      next = 'Connect';
      showToast(`Removed connection with ${partnerName}.`, 'info');
      onLogTriggered('NETWORKING_CONNECTION_REMOVED', 'connection', partnerId, 'SUCCESS', `User disconnected from "${partnerName}".`);
    } else {
      showToast(`Connection invitation locked with ${partnerName}!`, 'success');
      onLogTriggered('NETWORKING_CONNECTION_ESTABLISHED', 'connection', partnerId, 'SUCCESS', `User connected with enterprise profile "${partnerName}".`);
    }

    setConnectedPartners(prev => ({ ...prev, [partnerId]: next }));
  };

  // Simulating Real-time Inquiry sending and responsive B2B bot responses
  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInquiryPartner || !inquiryMessage.trim()) return;

    const partnerId = activeInquiryPartner.id;
    const userMsg = {
      sender: 'me' as const,
      text: inquiryMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setInquiryConversations(prev => ({
      ...prev,
      [partnerId]: [...(prev[partnerId] || []), userMsg]
    }));
    setInquiryMessage('');
    setSendingInquiry(true);

    onLogTriggered(
      'B2B_INQUIRY_DISPATCHED',
      'messaging_queue',
      partnerId,
      'SUCCESS',
      `Inquiry dispatched to secure business mailbox: "${activeInquiryPartner.name}"`
    );

    // Simulate 1 second reply delay from corporate partner
    setTimeout(() => {
      setSendingInquiry(false);
      const partnerReply = {
        sender: 'partner' as const,
        text: activeInquiryPartner.initialInquiryReply.replace('[User Business Name]', businessName || 'Signature Global Infra'),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setInquiryConversations(prev => ({
        ...prev,
        [partnerId]: [...(prev[partnerId] || []), partnerReply]
      }));

      showToast(`Received new business message from ${activeInquiryPartner.name}!`, 'success');
      onLogTriggered(
        'B2B_INQUIRY_REPLY_RECIEVED',
        'messaging_queue',
        partnerId,
        'SUCCESS',
        `Simulated instant callback response generated from partner: "${activeInquiryPartner.name}"`
      );
    }, 1200);
  };

  // ==========================================
  // RUN SIMULATED INTERACTIVE TEST SUITE
  // ==========================================
  const handleRunSpecsTests = () => {
    setRunningTests(true);
    onLogTriggered('TEST_SUITE_STARTED', 'onboarding_tests', 'rc-onboarding-v3', 'SUCCESS', 'Automated system-level verification loop initialized.');

    // Stagger test outputs for visual high fidelity
    testResults.forEach((t, index) => {
      // Set to running
      setTestResults(prev => prev.map((item, idx) => idx === index ? { ...item, status: 'running', log: 'Executing statutory sandbox validation...' } : item));

      setTimeout(() => {
        setTestResults(prev => prev.map((item, idx) => {
          if (idx === index) {
            let logMsg = '';
            let status: 'passed' | 'failed' = 'passed';

            if (idx === 0) {
              logMsg = '✓ TEST PASSED: State RERA validation format matched regrex [RERA-[A-Z]{3}-[0-9]{5}]. Mock query returns active builder status code 200.';
            } else if (idx === 1) {
              logMsg = '✓ TEST PASSED: Cryptographic file upload detected. Quarantine virus engine returns 0 infections. Generated unique 256-bit hash block [f436ab...].';
            } else if (idx === 2) {
              logMsg = '✓ TEST PASSED: Verified dynamic profile reputation progression. Moving criteria ticks correctly incremented strength enum state.';
            } else if (idx === 3) {
              logMsg = '✓ TEST PASSED: Verified instant B2B chat router. Queue latency < 15ms. Auto-reply text correctly injected user brand parameters.';
            } else {
              logMsg = '✓ TEST PASSED: RBI milestone survey release protocol verified. Security key matches live signed signature key: [rc_key_live_442].';
            }

            return {
              ...item,
              status,
              log: logMsg
            };
          }
          return item;
        }));

        if (index === testResults.length - 1) {
          setRunningTests(false);
          showToast('Registration Module automated test suite passed successfully!', 'success');
          onLogTriggered('TEST_SUITE_COMPLETED', 'onboarding_tests', 'rc-onboarding-v3', 'SUCCESS', 'All 5 integration sandboxes validated successfully.');
        }
      }, (index + 1) * 800);
    });
  };

  // Filters for local business directory
  const filteredPartners = MOCK_DIRECTORY_PARTNERS.filter(p => {
    // complementary matches based on stakeholder
    const roleComplement: Record<StakeholderType, StakeholderType[]> = {
      builder: ['vendor', 'contractor', 'bank'],
      vendor: ['builder', 'contractor', 'bank'],
      contractor: ['builder', 'vendor', 'bank'],
      bank: ['builder', 'contractor']
    };
    
    const isComplementary = roleComplement[activeRole].includes(p.role);
    const matchesDistance = p.distance <= networkingDistance;
    const matchesCategory = networkingCategory === 'All' || p.category.toLowerCase().includes(networkingCategory.toLowerCase());

    return isComplementary && matchesDistance && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* HEADER UTILITY PANEL - Interactive Specs Drawer for Production Module Readiness */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <FileCode className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              Registration & Business Identity Module
              <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/15 px-2 py-0.5 rounded uppercase">
                Production Baselined
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Active design blueprints, interactive databases, entity diagrams, APIs, and sandboxed unit tests.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowSpecsDrawer(!showSpecsDrawer)}
          className="bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-xs font-mono font-bold tracking-tight text-slate-300 px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer"
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span>{showSpecsDrawer ? 'Collapse Developer Console' : 'Expand Module Blueprint & Tests'}</span>
        </button>
      </div>

      {/* EXPANDABLE MODULE SPECIFICATION DRAWER */}
      {showSpecsDrawer && (
        <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 space-y-6 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-500/5 text-emerald-400 border-l border-b border-slate-850 text-[9px] font-mono px-3 py-1 font-bold">
            Secure Sandbox Workspace
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* COLUMN 1 & 2: Architectural Blueprints & Code Contracts */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Module Specifications:</span>
                <div className="flex flex-wrap gap-1">
                  {Object.keys(TECHNICAL_BLUEPRINT_TABS).map(tabKey => {
                    const active = activeSpecTab === tabKey;
                    return (
                      <button
                        key={tabKey}
                        onClick={() => setActiveSpecTab(tabKey)}
                        className={`text-[10px] font-mono px-2.5 py-1 rounded transition-all ${
                          active 
                            ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/25' 
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {TECHNICAL_BLUEPRINT_TABS[tabKey as keyof typeof TECHNICAL_BLUEPRINT_TABS].title}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 h-64 overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-300 space-y-2 whitespace-pre-line">
                {TECHNICAL_BLUEPRINT_TABS[activeSpecTab as keyof typeof TECHNICAL_BLUEPRINT_TABS].content}
              </div>
            </div>

            {/* COLUMN 3: Automated Onboarding Unit Tests Panel */}
            <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <h5 className="font-extrabold text-xs text-slate-200 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  Simulated Unit Tests
                </h5>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Execute integrated sandbox test cases to verify RERA matching compliance, uploader quarantine checksums, and messaging loops.
                </p>
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto max-h-[140px] pr-1">
                {testResults.map((test, index) => (
                  <div key={index} className="p-2 bg-slate-950 border border-slate-850 rounded-lg text-[10px] font-mono space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold truncate max-w-[160px]">{test.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                        test.status === 'passed' ? 'bg-emerald-500/10 text-emerald-400' :
                        test.status === 'running' ? 'bg-amber-500/10 text-amber-400 animate-pulse' :
                        'bg-slate-800 text-slate-500'
                      }`}>
                        {test.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-500 leading-tight truncate">{test.log}</p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleRunSpecsTests}
                disabled={runningTests}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-mono font-bold text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {runningTests ? (
                  <>
                    <span className="w-3 h-3 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                    <span>Executing Suite...</span>
                  </>
                ) : (
                  <>
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Run Module Unit Tests</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CORE EXPERIENCE CANVAS */}
      {!enteredDashboard ? (
        
        /* -------------------------------------------------------------
           1. WIZARD EXPERIENCE: VALUE FIRST REGISTRATION JOURNEY
           ------------------------------------------------------------- */
        <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden flex flex-col lg:flex-row min-h-[580px] shadow-2xl">
          
          {/* Left-hand Progress Rail & Growth Advantages */}
          <div className="w-full lg:w-80 bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-850 p-6 flex flex-col justify-between gap-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Select Growth Track</h3>
                <p className="text-[11px] text-slate-400 mt-1">Select your active role profile to configure your custom workspace.</p>
              </div>

              <div className="space-y-2">
                {[
                  { id: 'builder', label: 'Builder & Developer', desc: 'Accelerate RERA projects & hire sub-contractors', icon: Building2 },
                  { id: 'vendor', label: 'Vendor & Supplier', desc: 'List catalogs and bid on raw material tenders', icon: Database },
                  { id: 'contractor', label: 'Contractor & Consultant', desc: 'Bid on structural work and lease heavy machinery', icon: Users },
                  { id: 'bank', label: 'Bank & NBFC', desc: 'Set up escrow accounts & generate developer loans', icon: Briefcase }
                ].map(role => {
                  const Icon = role.icon;
                  const selected = activeRole === role.id;
                  return (
                    <button
                      key={role.id}
                      disabled={roleFinalized && activeRole !== role.id}
                      onClick={() => {
                        setActiveRole(role.id as StakeholderType);
                        onLogTriggered('ONBOARDING_ROLE_SWITCHED', 'registration_wizard', role.id, 'SUCCESS', `Switched path finder role to: ${role.label}`);
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3.5 ${
                        selected 
                          ? 'bg-slate-900 border-emerald-500/40 text-white shadow-md' 
                          : roleFinalized 
                            ? 'opacity-40 cursor-not-allowed border-transparent text-slate-650'
                            : 'bg-slate-900/30 border-slate-850 hover:bg-slate-900/60 hover:border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className={`p-2 rounded-lg mt-0.5 flex-shrink-0 ${selected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-950 text-slate-500'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs leading-tight">{role.label}</h4>
                        <p className="text-[10px] text-slate-500 mt-1 leading-normal">{role.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Persistent Business Value Highlights Panel */}
            <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-3">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                Why Register?
              </span>

              <div className="space-y-2 text-[10px] text-slate-400">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <p><strong>Verified Business Profile</strong>: Gain up to 3x higher organic search visibility in local builder directory.</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <p><strong>Active Lead Generation</strong>: Receive real-time matched quote requests for raw materials directly.</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <p><strong>Secure Milestone Escrows</strong>: Partner safely using structured commercial banking milestones.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right-hand Stepper Form Canvas */}
          <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between gap-8 bg-slate-900/40">
            
            {/* Horizontal Stepper Indicator with dynamic Strength Rating */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-5">
              
              {/* Active Step Indicator */}
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                <span className="text-slate-500 uppercase tracking-wider block font-bold">Progress Strength:</span>
                <div className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getProfileStrength().color}`}>
                  {getProfileStrength().label.toUpperCase()}
                </div>
              </div>

              {/* Steps Progress Visual Dots */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(stepNum => {
                  const isPassed = currentStep > stepNum;
                  const isActive = currentStep === stepNum;
                  return (
                    <div 
                      key={stepNum}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        isPassed ? 'w-8 bg-emerald-500' :
                        isActive ? 'w-10 bg-emerald-400 shadow-sm shadow-emerald-400/20' :
                        'w-4 bg-slate-800'
                      }`}
                    />
                  );
                })}
              </div>

            </div>

            {/* STEP VIEWS CANVAS */}
            <div className="flex-1 flex flex-col justify-center min-h-[340px]">
              
              {/* STEP 1: VALUE FIRST PRE-QUALIFICATION & ELIGIBILITY */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-fade-in">
                  
                  {/* Tailored Welcome Experience */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">Growth Track Stage 01</span>
                    
                    {activeRole === 'builder' && (
                      <>
                        <h3 className="text-lg font-extrabold text-white">Welcome, Real Estate Builder & Developer!</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          RealtyConnect is designed to help you **Grow your projects**, **Connect with contractors**, **Find reliable vendors**, and **Purchase bulk materials** under verified RERA compliance.
                        </p>
                      </>
                    )}
                    {activeRole === 'vendor' && (
                      <>
                        <h3 className="text-lg font-extrabold text-white">Welcome, Raw Materials Vendor & Supplier!</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          RealtyConnect helps you **Showcase your products**, **Receive direct business enquiries**, **Connect with verified builders**, and **Expand your dealer sales network**.
                        </p>
                      </>
                    )}
                    {activeRole === 'contractor' && (
                      <>
                        <h3 className="text-lg font-extrabold text-white">Welcome, Civil Engineering Contractor!</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          RealtyConnect is your portal to **Find structural projects**, **Submit competitive bids**, **Rent commercial machinery**, and **Grow your civil workforce**.
                        </p>
                      </>
                    )}
                    {activeRole === 'bank' && (
                      <>
                        <h3 className="text-lg font-extrabold text-white">Welcome, Banking & Escrow Partner!</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          RealtyConnect empowers institutions to **Connect with housing developers**, **Generate commercial loans**, and **Expand direct escrow channels** under full regulatory visibility.
                        </p>
                      </>
                    )}
                  </div>

                  {/* Qualification Rules Checkboxes */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <h4 className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">Eligibility Pre-Qualification Checklist:</h4>
                      <span className="text-[9px] font-mono text-slate-500 uppercase">Registration Bylaws</span>
                    </div>

                    <div className="space-y-2">
                      {ELIGIBILITY_RULES[activeRole].map(criterion => (
                        <div 
                          key={criterion.id}
                          onClick={() => handleToggleCriterion(criterion.id)}
                          className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            checkedCriteria[criterion.id]
                              ? 'bg-emerald-500/5 border-emerald-500/25 text-white'
                              : 'bg-slate-900/30 border-slate-850 text-slate-400 hover:border-slate-800'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className={`w-4 h-4 rounded mt-0.5 border flex items-center justify-center ${
                              checkedCriteria[criterion.id] 
                                ? 'bg-emerald-500 border-emerald-500 text-slate-950' 
                                : 'border-slate-700'
                            }`}>
                              {checkedCriteria[criterion.id] && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="text-xs leading-relaxed">{criterion.text}</span>
                          </div>
                          
                          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                            criterion.required 
                              ? 'bg-red-500/10 text-red-400 border border-red-500/15' 
                              : 'bg-slate-800 text-slate-500'
                          }`}>
                            {criterion.required ? 'REQUIRED' : 'OPTIONAL'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {!eligibilityPassed && (
                    <div className="p-3.5 bg-amber-500/5 border border-amber-500/15 rounded-xl flex items-start gap-2.5 text-amber-500 text-xs">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        To maintain a trusted enterprise network, please read and verify that your company meets all required eligibility rules.
                      </p>
                    </div>
                  )}

                </div>
              )}

              {/* STEP 2: TRUST SHIELD BADGE VERIFICATION */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">Growth Track Stage 02</span>
                    <h3 className="text-base font-extrabold text-white">Ecosystem Trust Shield Verification</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      RealtyConnect frames regulatory IDs as trust badges. Verification fetched directly from state registries unlocks higher search indexing and bidding priority.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        {activeRole === 'builder' ? 'State RERA Registration ID' : activeRole === 'bank' ? 'RBI Scheduled License Reference' : 'Central Company GSTIN Number'}
                      </label>
                      
                      <div className="flex gap-2">
                        <div className="flex-1 bg-slate-950 border border-slate-850 focus-within:border-emerald-500 rounded-lg px-3 py-2 flex items-center gap-2 text-slate-300">
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                          <input
                            type="text"
                            value={govId}
                            onChange={(e) => setGovId(e.target.value.toUpperCase())}
                            placeholder={activeRole === 'builder' ? 'e.g. RERA-MUM-90824' : activeRole === 'bank' ? 'e.g. RBI-COMM-773' : 'e.g. 27AAECB2931K1Z5'}
                            className="w-full bg-transparent border-none outline-none text-xs text-slate-200 uppercase font-mono font-bold placeholder:text-slate-700"
                          />
                        </div>
                        
                        <button
                          type="button"
                          onClick={handleVerifyId}
                          disabled={verifying}
                          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-4 rounded-lg transition-all flex items-center justify-center gap-1 min-w-[120px] cursor-pointer"
                        >
                          {verifying ? (
                            <>
                              <span className="w-3 h-3 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                              <span>Scanning...</span>
                            </>
                          ) : (
                            <>
                              <Search className="w-3.5 h-3.5" />
                              <span>Verify Registry</span>
                            </>
                          )}
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                        ✓ Triggers automated queries to verify company status with the MCA, GSTIN, or RERA schedules.
                      </span>
                    </div>

                    {verifiedEntity && (
                      <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/20 space-y-3.5 relative overflow-hidden animate-fade-in">
                        <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-400 border-l border-b border-emerald-500/15 text-[8px] font-mono font-bold px-2.5 py-0.5 rounded-bl uppercase">
                          Registry Active Match
                        </div>

                        <div className="space-y-1">
                          <span className="text-slate-500 text-[9px] font-mono uppercase tracking-wider block">Legal Corporate Registry Name</span>
                          <strong className="text-white text-xs font-bold block">{verifiedEntity.legalName}</strong>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5 text-[11px] border-t border-slate-900 pt-3">
                          <div>
                            <span className="text-slate-500 text-[9px] font-mono block">Trust Status</span>
                            <span className="text-emerald-400 font-bold font-mono text-[10px] flex items-center gap-1 mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              {activeRole === 'builder' ? 'RERA Certified' : activeRole === 'bank' ? 'RBI Scheduled' : 'Verified Taxpayer'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[9px] font-mono block">Corporate Coi</span>
                            <span className="text-slate-300 font-mono mt-0.5 block">{verifiedEntity.incorporationNo}</span>
                          </div>
                        </div>

                        <div className="text-[10px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                          <span className="text-slate-500 block uppercase font-mono text-[8px] font-bold mb-1">Registered Address</span>
                          <span className="text-slate-300 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                            {verifiedEntity.registeredAddress}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: CRYPTOGRAPHIC DOCUMENT QUARANTINE */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">Growth Track Stage 03</span>
                    <h3 className="text-base font-extrabold text-white">Trust Document Quarantine Scanner</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Securely upload necessary operating credentials. Files are passed through real-time virus scans in background sandboxes prior to generating permanent cryptographic hashes.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {DOCUMENT_REQUIREMENTS[activeRole].map(doc => {
                      const uploaded = uploadedDocs[doc.id];
                      const isUploading = uploadingDocId === doc.id;

                      return (
                        <div 
                          key={doc.id}
                          className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4"
                        >
                          <div className="space-y-1 flex-1 text-center sm:text-left">
                            <h4 className="font-bold text-xs text-slate-200">{doc.label}</h4>
                            <p className="text-[10px] text-slate-400 leading-tight">{doc.description}</p>
                          </div>

                          <div className="flex-shrink-0 min-w-[150px] flex justify-center">
                            {uploaded ? (
                              <div className="flex flex-col items-center sm:items-end text-right">
                                <span className="text-emerald-400 font-bold text-[9px] flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                                  <FileCheck className="w-3.5 h-3.5" />
                                  <span>HASH SECURED</span>
                                </span>
                                <span className="text-[9px] text-slate-500 font-mono mt-1 max-w-[120px] truncate block">{uploaded.hash}</span>
                              </div>
                            ) : isUploading ? (
                              <div className="w-full space-y-1 text-center">
                                <span className="text-[9px] font-mono text-emerald-400 animate-pulse block">Scanning payload {uploadProgress}%</span>
                                <div className="w-24 h-1 bg-slate-900 rounded-full mx-auto overflow-hidden">
                                  <div className="h-full bg-emerald-500" style={{ width: `${uploadProgress}%` }} />
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSimulateDocumentUpload(doc.id, doc.label)}
                                className="w-full bg-slate-900 hover:bg-slate-850 text-[10px] border border-slate-800 text-slate-300 font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Upload className="w-3.5 h-3.5 text-slate-400" />
                                <span>Upload & Scan File</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4: BRAND IDENTITY & PROFILE STRENGTH */}
              {currentStep === 4 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">Growth Track Stage 04</span>
                    <h3 className="text-base font-extrabold text-white">Assemble Company Profile</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Complete secondary corporate attributes to build a robust B2B profile strength. Verified company details are visible to potential bidders and loan escrows.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Company Trade Name</label>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Corporate HQ Headquarters</label>
                      <input
                        type="text"
                        required
                        value={headquarters}
                        onChange={(e) => setHeadquarters(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Founding Year</label>
                      <input
                        type="number"
                        required
                        value={foundedYear}
                        onChange={(e) => setFoundedYear(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Active Headcount / Employees</label>
                      <input
                        type="number"
                        required
                        value={employeeCount}
                        onChange={(e) => setEmployeeCount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                        {activeRole === 'builder' ? 'Governing License Seal' : activeRole === 'vendor' ? 'Material Certification Standard' : 'Contractor Class Level'}
                      </label>
                      <input
                        type="text"
                        required
                        value={extraField1}
                        onChange={(e) => setExtraField1(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                        {activeRole === 'builder' ? 'Annual Project Turnover Cap' : activeRole === 'bank' ? 'Target Infrastructure Fund Limit' : 'Verified Workforce Size'}
                      </label>
                      <input
                        type="text"
                        required
                        value={extraField2}
                        onChange={(e) => setExtraField2(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: ASPIRATIONAL MEMBERSHIP */}
              {currentStep === 5 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">Growth Track Stage 05</span>
                    <h3 className="text-base font-extrabold text-white">Select Aspirational Business Tier</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      RealtyConnect memberships highlight growth metrics and transaction capabilities, rather than simple operational billing modules. Select the tier tailored to your corporate goals.
                    </p>
                  </div>

                  {!onboardingComplete ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {MEMBERSHIP_PLANS[activeRole].map(plan => {
                          const isSelected = selectedPlan === plan.name;
                          return (
                            <div 
                              key={plan.name}
                              onClick={() => setSelectedPlan(plan.name)}
                              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-4 ${
                                isSelected
                                  ? 'bg-emerald-500/5 border-emerald-500/40 text-white shadow-xl'
                                  : 'bg-slate-950/40 border-slate-850 text-slate-450 hover:border-slate-800'
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-extrabold text-xs text-slate-200">{plan.name}</h4>
                                    <span className="text-[9px] text-slate-500 block mt-0.5 leading-none">{plan.badge}</span>
                                  </div>
                                  <span className="font-mono text-xs font-bold text-emerald-400">{plan.price}</span>
                                </div>

                                <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-900 text-[10px] space-y-1">
                                  <span className="text-slate-500 block uppercase font-mono text-[8px] font-bold">Growth Multiplier:</span>
                                  <span className="text-emerald-400 font-semibold">{plan.growthMetrics}</span>
                                </div>

                                <ul className="space-y-1.5 text-[10px] text-slate-400 pt-2 border-t border-slate-900">
                                  {plan.features.map((f, i) => (
                                    <li key={i} className="flex items-start gap-1.5 leading-snug">
                                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                      <span>{f}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-900/60 text-[10px] font-mono">
                                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                  isSelected ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700'
                                }`}>
                                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                </div>
                                <span className={isSelected ? 'text-white font-bold' : 'text-slate-500'}>
                                  {isSelected ? 'SELECTED PLAN' : 'SELECT SUBSCRIPTION'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={handleFinalizeOnboarding}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs py-2.5 rounded-lg transition-all font-mono tracking-tight flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/15"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Sign Subscription Mandate & Generate B2B Access Keys</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 bg-slate-950/65 p-6 rounded-2xl border border-emerald-500/20 text-center animate-fade-in max-w-xl mx-auto">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                        <Check className="w-6 h-6 stroke-[3]" />
                      </div>
                      <h4 className="font-bold text-base text-white">B2B Identity Registered!</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Registry matched, cryptographic license hashes committed, and {selectedPlan} growth subscription activated. Your verified credentials has been successfully deployed!
                      </p>

                      <div className="bg-slate-900 border border-slate-850 p-3 rounded-lg text-left text-[11px] font-mono text-slate-400 space-y-1">
                        <div className="flex justify-between">
                          <span>🔑 SECURE_B2B_ACCESS_KEY:</span>
                          <span className="text-emerald-400 font-bold">rc_key_live_{calculateSHA256(businessName).substring(0, 16)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>🔒 COMPLIANCE_SEAL_HASH:</span>
                          <span className="text-slate-400">{calculateSHA256(govId)}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setEnteredDashboard(true);
                          onLogTriggered(
                            'B2B_STAKEHOLDER_DASHBOARD_ENTERED',
                            'dashboard',
                            activeRole,
                            'SUCCESS',
                            `Dashboard entrance: Corporate partner "${businessName}" successfully logged in via verified access keys.`
                          );
                        }}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs py-2.5 rounded-lg transition-all font-mono tracking-tight flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20 animate-pulse"
                      >
                        <span>Activate Welcome Insights Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Step Navigation Footer */}
            {!onboardingComplete && (
              <div className="border-t border-slate-850 pt-5 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={currentStep === 1 ? onBackToLanding : () => setCurrentStep(prev => prev - 1)}
                  className="bg-slate-950 hover:bg-slate-850 text-xs text-slate-300 font-bold border border-slate-800 rounded-lg px-4 py-2 transition-all cursor-pointer flex items-center gap-1"
                >
                  {currentStep === 1 ? '← Back to Landing' : 'Previous Step'}
                </button>

                <div className="text-xs font-mono text-slate-500">
                  Step <strong className="text-slate-350">{currentStep}</strong> / 5
                </div>

                <button
                  type="button"
                  onClick={currentStep === 5 ? handleFinalizeOnboarding : handleNextStep}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-5 py-2 rounded-lg transition-all font-mono tracking-tight flex items-center gap-1 cursor-pointer"
                >
                  <span>{currentStep === 5 ? 'Sign Up' : 'Proceed'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>

        </div>
      ) : (
        
        /* -------------------------------------------------------------
           2. LIVE DASHBOARD SYSTEM: PORTAL GROWTH & INTERACTIVE NETWORKING
           ------------------------------------------------------------- */
        <div className="space-y-6 animate-fade-in">
          
          {/* Dashboard Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
            <div className="flex items-center gap-4">
              
              {/* Profile Image with Dynamic Logo replacement */}
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                  {companyLogo ? (
                    <img src={companyLogo} alt="Corporate Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-mono font-bold text-emerald-400">
                      {businessName ? businessName.charAt(0) : 'B'}
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => setActiveChecklistModal('logo')}
                  className="absolute -bottom-1.5 -right-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 rounded-full p-1 transition-all cursor-pointer"
                  title="Update Logo"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-extrabold text-base text-white">
                    {businessName || 'Signature Global Infra Projects Ltd'}
                  </h3>
                  <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-bold">
                    {activeRole} Track Verified
                  </span>
                  <span className="text-[9px] font-mono bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 uppercase font-bold">
                    {selectedPlan} Tier
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-tight">
                  HQ Location: {headquarters} | Founded: {foundedYear} | Verified Credentials: <strong className="text-emerald-400">{govId}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/5 border border-emerald-500/15 px-2.5 py-1 rounded">
                ● SECURITY ACCELERATOR ACTIVE
              </span>
              <button
                type="button"
                onClick={handleFullReset}
                className="text-xs bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-slate-800 text-slate-350 hover:text-white px-3.5 py-1.5 rounded-xl transition-all cursor-pointer font-bold"
              >
                Reset Wizard
              </button>
            </div>
          </div>

          {/* DYNAMIC DASHBOARD SECTIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* COLUMN 1 & 2: Welcome, Insights, Checklist, & Custom catalogs */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Personalized Welcome Banner */}
              <div className="bg-slate-900/60 border border-slate-850 p-5 rounded-xl space-y-2">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">Ecosystem Insights Panel</span>
                
                {activeRole === 'builder' && (
                  <>
                    <h4 className="text-base font-extrabold text-white">Let's grow your real-estate project pipeline!</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Now that your RERA Trust Seal is published, you can list active projects, invite subcontractors to bid, and send encrypted inquiries to steel/cement suppliers in your vicinity.
                    </p>
                  </>
                )}
                {activeRole === 'vendor' && (
                  <>
                    <h4 className="text-base font-extrabold text-white">Showcase your structural concrete catalogs!</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Your GSTIN Trust Badge is live. Add concrete products, upload BIS grade certificates, and accept incoming quotation requests directly from nearby residential builders.
                    </p>
                  </>
                )}
                {activeRole === 'contractor' && (
                  <>
                    <h4 className="text-base font-extrabold text-white">Find structural tenders matching your rating!</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Your Class-I Government license is validated. List active services, bid on infrastructure foundations, and manage structural milestones.
                    </p>
                  </>
                )}
                {activeRole === 'bank' && (
                  <>
                    <h4 className="text-base font-extrabold text-white">Expand your Escrow & Lending portfolio!</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Liaison with developers on RealtyConnect, set up secure micro-milestone escrow accounts, and review audited credit credentials.
                    </p>
                  </>
                )}
              </div>

              {/* THREE CORE BUSINESS INSIGHT WIDGETS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-1">
                  <span className="text-slate-500 text-[10px] font-mono block uppercase">Profile Views</span>
                  <div className="flex items-baseline gap-2">
                    <strong className="text-xl font-bold text-white">2,840</strong>
                    <span className="text-emerald-400 text-[10px] font-mono font-bold">+14.2%</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Impressions in buyer directory searches</p>
                </div>

                <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-1">
                  <span className="text-slate-500 text-[10px] font-mono block uppercase">Active RFQ Matches</span>
                  <div className="flex items-baseline gap-2">
                    <strong className="text-xl font-bold text-emerald-400">8 Leads</strong>
                    <span className="text-[9px] text-slate-500 font-mono">Real-time alerts</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Tenders aligning with your categories</p>
                </div>

                <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-1">
                  <span className="text-slate-500 text-[10px] font-mono block uppercase">Ecosystem Rank</span>
                  <div className="flex items-baseline gap-2">
                    <strong className="text-xl font-bold text-white">Top 5%</strong>
                    <span className="text-emerald-400 text-[10px] font-mono font-bold">★ Verified</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Reputation rating among realtors</p>
                </div>
              </div>

              {/* ACTIVE BUSINESS CATALOG LISTS */}
              <div className="bg-slate-900 border border-slate-850 p-5 rounded-xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                  <h4 className="font-extrabold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    Published Business Ledger
                  </h4>
                  <div className="flex gap-2">
                    {activeRole === 'builder' && (
                      <button 
                        onClick={() => setActiveChecklistModal('project')}
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-bold font-mono text-[10px] px-2.5 py-1 rounded cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Project
                      </button>
                    )}
                    {activeRole === 'vendor' && (
                      <button 
                        onClick={() => setActiveChecklistModal('product')}
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-bold font-mono text-[10px] px-2.5 py-1 rounded cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Product SKU
                      </button>
                    )}
                    {activeRole === 'contractor' && (
                      <button 
                        onClick={() => setActiveChecklistModal('service')}
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-bold font-mono text-[10px] px-2.5 py-1 rounded cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> List Service
                      </button>
                    )}
                    <button 
                      onClick={() => setActiveChecklistModal('team')}
                      className="bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold font-mono text-[10px] px-2.5 py-1 rounded cursor-pointer flex items-center gap-1"
                    >
                      <UserPlus className="w-3 h-3" /> Invite Team
                    </button>
                  </div>
                </div>

                {/* Products lists (Vendor) */}
                {activeRole === 'vendor' && (
                  <div className="space-y-2">
                    {catalogProducts.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-500">
                        No product SKUs published yet. Use "Add Product SKU" to list materials like steel, aggregate, or cement.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {catalogProducts.map(prod => (
                          <div key={prod.id} className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex items-start justify-between">
                            <div>
                              <strong className="text-xs text-white block">{prod.name}</strong>
                              <p className="text-[10px] text-slate-400 mt-1">{prod.desc || 'Certified BIS concrete ready-mix.'}</p>
                            </div>
                            <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/15">
                              {prod.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Services lists (Contractor) */}
                {activeRole === 'contractor' && (
                  <div className="space-y-2">
                    {catalogServices.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-500">
                        No services published yet. Use "List Service" to register expertise categories like civil foundations, excavation, or MEP setups.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {catalogServices.map(serv => (
                          <div key={serv.id} className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-between">
                            <div>
                              <strong className="text-xs text-white block">{serv.name}</strong>
                              <span className="text-[9px] text-emerald-400 font-mono mt-1 block">Class-I Verified Service</span>
                            </div>
                            <span className="text-[11px] font-mono font-bold text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              {serv.rate}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Projects lists (Builder) */}
                {activeRole === 'builder' && (
                  <div className="space-y-2">
                    {catalogProjects.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-500">
                        No projects listed yet. Use "Add Project" to showcase commercial portfolios to prospective bankers & contractors.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {catalogProjects.map(proj => (
                          <div key={proj.id} className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex items-start justify-between">
                            <div>
                              <strong className="text-xs text-white block">{proj.name}</strong>
                              <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-500" /> {proj.location}
                              </span>
                            </div>
                            <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/15">
                              {proj.budget}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Team Members List */}
                <div className="border-t border-slate-900 pt-3">
                  <span className="text-[9px] font-mono text-slate-550 uppercase tracking-widest block mb-2">Verified Team Credentials</span>
                  <div className="flex flex-wrap gap-2">
                    {teamMembers.map(member => (
                      <div key={member.id} className="p-2 bg-slate-950 rounded-lg border border-slate-900 flex items-center gap-2 text-[10px]">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-slate-300 font-mono font-bold">{member.email}</span>
                        <span className="text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-850 text-[9px]">{member.role}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* COLUMN 3: Ecosystem Growth Checklist & Local B2B Connections */}
            <div className="space-y-6">
              
              {/* Dynamic Profile Strength Progress Status Card */}
              <div className="bg-slate-900 border border-slate-850 p-5 rounded-xl space-y-4">
                <h4 className="font-extrabold text-xs text-slate-200 uppercase tracking-wider">
                  Profile Reputation Strength
                </h4>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-slate-400 uppercase tracking-wider block">Completed Level:</span>
                    <span className="font-bold font-mono text-emerald-400">{getProfileStrength().label}</span>
                  </div>
                  
                  {/* Visual Node Path */}
                  <div className="grid grid-cols-5 gap-1 pt-1">
                    {['Basic', 'Growing', 'Professional', 'Verified', 'Enterprise Ready'].map((level, idx) => {
                      const stages = ['Basic', 'Growing', 'Professional', 'Verified', 'Enterprise Ready'];
                      const currentIdx = stages.indexOf(getProfileStrength().label);
                      const active = idx <= currentIdx;
                      const isTarget = idx === currentIdx;

                      return (
                        <div key={level} className="space-y-1">
                          <div className={`h-1.5 rounded-full transition-all duration-300 ${
                            active 
                              ? isTarget 
                                ? 'bg-emerald-400 animate-pulse' 
                                : 'bg-emerald-500' 
                              : 'bg-slate-850'
                          }`} />
                          <span className="text-[7px] text-slate-550 block font-mono text-center truncate">{level}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <p className="text-[11px] text-slate-450 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-850/60">
                  {getProfileStrength().desc}
                </p>

                {/* GROWTH CHECKLIST ROADMAP (STATEFUL) */}
                <div className="space-y-2.5 pt-2 border-t border-slate-900">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Suggested Next Steps to Rank higher:</span>
                  
                  <div className="space-y-2 text-[11px]">
                    
                    {/* Logo checklist item */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-900 hover:border-slate-850">
                      <div className="flex items-center gap-2">
                        <CheckSquare className={`w-4 h-4 ${companyLogo ? 'text-emerald-400' : 'text-slate-600'}`} />
                        <span className={companyLogo ? 'line-through text-slate-500' : 'text-slate-300'}>Upload Company Logo</span>
                      </div>
                      {!companyLogo && (
                        <button 
                          onClick={() => setActiveChecklistModal('logo')}
                          className="text-[9px] font-mono text-emerald-400 underline cursor-pointer"
                        >
                          Execute
                        </button>
                      )}
                    </div>

                    {/* Product checklist item */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-900 hover:border-slate-850">
                      <div className="flex items-center gap-2">
                        <CheckSquare className={`w-4 h-4 ${(catalogProducts.length > 0 || catalogServices.length > 0 || catalogProjects.length > 0) ? 'text-emerald-400' : 'text-slate-600'}`} />
                        <span className={(catalogProducts.length > 0 || catalogServices.length > 0 || catalogProjects.length > 0) ? 'line-through text-slate-500' : 'text-slate-300'}>
                          {activeRole === 'vendor' ? 'Add raw material SKUs' : activeRole === 'builder' ? 'List commercial projects' : 'Add civil services'}
                        </span>
                      </div>
                      {!(catalogProducts.length > 0 || catalogServices.length > 0 || catalogProjects.length > 0) && (
                        <button 
                          onClick={() => setActiveChecklistModal(activeRole === 'vendor' ? 'product' : activeRole === 'builder' ? 'project' : 'service')}
                          className="text-[9px] font-mono text-emerald-400 underline cursor-pointer"
                        >
                          Execute
                        </button>
                      )}
                    </div>

                    {/* Team invitation item */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-900 hover:border-slate-850">
                      <div className="flex items-center gap-2">
                        <CheckSquare className={`w-4 h-4 ${teamMembers.length > 1 ? 'text-emerald-400' : 'text-slate-600'}`} />
                        <span className={teamMembers.length > 1 ? 'line-through text-slate-500' : 'text-slate-300'}>Invite Team Colleagues</span>
                      </div>
                      {teamMembers.length <= 1 && (
                        <button 
                          onClick={() => setActiveChecklistModal('team')}
                          className="text-[9px] font-mono text-emerald-400 underline cursor-pointer"
                        >
                          Execute
                        </button>
                      )}
                    </div>

                    {/* Premium membership indicator */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-900">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                        <span className="line-through text-slate-500">Subscribe to Membership</span>
                      </div>
                      <span className="text-[8px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold">
                        Active
                      </span>
                    </div>

                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* ECOSYSTEM NETWORKING & DIRECT LEAD ENQUIRY DISCOVERY */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-850 pb-4">
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  Ecosystem Networking Directory
                </h4>
                <p className="text-xs text-slate-400">
                  Instantly interact with nearby complementary businesses to connect, follow, and trigger live business inquiries!
                </p>
              </div>

              {/* Filters Panel */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Distance Limit:</span>
                  <input 
                    type="range" 
                    min="5" 
                    max="50" 
                    value={networkingDistance}
                    onChange={(e) => setNetworkingDistance(parseInt(e.target.value))}
                    className="w-24 accent-emerald-500 cursor-pointer h-1 bg-slate-950 rounded-lg appearance-none" 
                  />
                  <span className="text-emerald-400 font-bold">{networkingDistance}km</span>
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-500">Category:</span>
                  <select 
                    value={networkingCategory} 
                    onChange={(e) => setNetworkingCategory(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-2 py-1 text-xs outline-none"
                  >
                    <option value="All">All Categories</option>
                    <option value="Concrete">Concrete</option>
                    <option value="Steel">Structural Steel</option>
                    <option value="Civil">Civil Foundations</option>
                    <option value="Residential">Residential</option>
                    <option value="Bank">Lenders / Banking</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Directory listings */}
              <div className="lg:col-span-2 space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {filteredPartners.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-850">
                    No matching local businesses found within {networkingDistance}km matching the category filters. Try expanding the slider.
                  </div>
                ) : (
                  filteredPartners.map(partner => {
                    const status = connectedPartners[partner.id] || 'Connect';
                    return (
                      <div 
                        key={partner.id}
                        className="p-4 bg-slate-950 rounded-xl border border-slate-850 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-slate-800"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className={`p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 mt-1 flex-shrink-0`}>
                            {partner.role === 'vendor' ? <Database className="w-4.5 h-4.5" /> : 
                             partner.role === 'contractor' ? <Users className="w-4.5 h-4.5" /> :
                             partner.role === 'bank' ? <Briefcase className="w-4.5 h-4.5" /> :
                             <Building2 className="w-4.5 h-4.5" />}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-xs text-white leading-tight">{partner.name}</h5>
                              <span className="text-[8px] font-mono font-bold bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded uppercase border border-slate-850">
                                {partner.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-normal">
                              Focus: <span className="text-slate-300 font-medium">{partner.focus}</span>
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                              <span className="flex items-center gap-0.5">
                                <MapPin className="w-3 h-3 text-slate-650" /> {partner.location}
                              </span>
                              <span>•</span>
                              <span>Distance: <strong className="text-slate-400">{partner.distance} km</strong></span>
                              <span>•</span>
                              <span className="text-amber-400 font-bold">★ {partner.rating}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => handleToggleConnect(partner.id, partner.name)}
                            className={`flex-1 sm:w-28 text-[11px] font-bold py-1.5 rounded-lg transition-all text-center border font-mono cursor-pointer ${
                              status === 'Connected' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                              status === 'Following' ? 'bg-slate-900 border-slate-800 text-slate-300' :
                              'bg-emerald-500 hover:bg-emerald-600 border-transparent text-slate-950'
                            }`}
                          >
                            {status === 'Connected' ? '✓ CONNECTED' : status === 'Following' ? '✓ FOLLOWING' : 'CONNECT'}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveInquiryPartner(partner);
                              // Trigger default messaging if none exists
                              if (!inquiryConversations[partner.id]) {
                                setInquiryConversations(prev => ({
                                  ...prev,
                                  [partner.id]: [{
                                    sender: 'partner',
                                    text: `Hello ${businessName || 'Signature Global'}! We noted your RERA/GSTIN Trust profile. How can we assist your operations today?`,
                                    time: '09:30 AM'
                                  }]
                                }));
                              }
                            }}
                            className="flex-1 sm:w-28 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-[11px] font-bold py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1 cursor-pointer font-mono"
                          >
                            <MessageSquare className="w-3 h-3 text-slate-500" />
                            <span>ENQUIRE</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Real-time B2B Message Composer & Callback Simulator */}
              <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col justify-between min-h-[300px]">
                {activeInquiryPartner ? (
                  <div className="flex-1 flex flex-col justify-between gap-4 h-full">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <div>
                          <h5 className="font-bold text-xs text-white leading-none">{activeInquiryPartner.name}</h5>
                          <span className="text-[9px] text-slate-500 font-mono mt-1 block">Active callback channel</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveInquiryPartner(null)}
                        className="text-[10px] font-mono text-slate-500 hover:text-slate-300"
                      >
                        Close
                      </button>
                    </div>

                    {/* Conversations window */}
                    <div className="flex-1 overflow-y-auto space-y-3 max-h-[180px] p-1 font-sans text-xs">
                      {(inquiryConversations[activeInquiryPartner.id] || []).map((msg, i) => {
                        const isMe = msg.sender === 'me';
                        return (
                          <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-0.5`}>
                            <span className="text-[8px] text-slate-550 font-mono">{isMe ? 'Your Brand' : activeInquiryPartner.name} • {msg.time}</span>
                            <div className={`p-2.5 rounded-xl max-w-[85%] leading-relaxed ${
                              isMe 
                                ? 'bg-emerald-500/10 text-emerald-300 rounded-tr-none border border-emerald-500/15' 
                                : 'bg-slate-900 text-slate-300 rounded-tl-none border border-slate-850'
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        );
                      })}

                      {sendingInquiry && (
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 animate-pulse">
                          <span className="w-2 h-2 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                          <span>{activeInquiryPartner.name} processing quotation...</span>
                        </div>
                      )}
                    </div>

                    {/* Input Composer */}
                    <form onSubmit={handleSendInquiry} className="flex gap-2 flex-shrink-0">
                      <input
                        type="text"
                        value={inquiryMessage}
                        onChange={(e) => setInquiryMessage(e.target.value)}
                        placeholder={`Type customized RFQ message...`}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-emerald-500 placeholder:text-slate-650"
                      />
                      <button
                        type="submit"
                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 p-2 rounded-lg transition-all cursor-pointer flex-shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>

                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
                    <MessageSquare className="w-10 h-10 text-slate-700 animate-pulse" />
                    <div>
                      <h5 className="font-bold text-xs text-slate-400">Live B2B Inquiry Terminal</h5>
                      <p className="text-[11px] text-slate-550 leading-relaxed mt-1">
                        Select "ENQUIRE" on any local business in the directory list to draft a message and get an automated callback quote simulation!
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* DYNAMIC CHECKLIST ACTION MODALS */}
          {activeChecklistModal && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
                
                <div className="flex items-start justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-sm text-white">
                      {activeChecklistModal === 'logo' && 'Upload Corporate Logo'}
                      {activeChecklistModal === 'product' && 'Add Material Catalog Product'}
                      {activeChecklistModal === 'service' && 'List Contracting Service'}
                      {activeChecklistModal === 'project' && 'Add Real-Estate Project'}
                      {activeChecklistModal === 'team' && 'Invite Corporate Colleague'}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setActiveChecklistModal(null)}
                    className="text-xs text-slate-500 hover:text-slate-350 font-mono"
                  >
                    Close
                  </button>
                </div>

                {/* Upload Logo Modal */}
                {activeChecklistModal === 'logo' && (
                  <div className="space-y-4 text-xs">
                    <p className="text-slate-400 leading-relaxed">
                      Select a simulated corporate brand logo asset to establish professional credibility across the network.
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { name: 'UltraTech Yellow', value: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=100&fit=crop&q=80' },
                        { name: 'TATA Blue', value: 'https://images.unsplash.com/photo-1513829096999-4978602294fc?w=100&fit=crop&q=80' },
                        { name: 'DLF Red', value: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&fit=crop&q=80' }
                      ].map(logo => (
                        <div 
                          key={logo.name}
                          onClick={() => {
                            setCompanyLogo(logo.value);
                            setActiveChecklistModal(null);
                            showToast(`Brand logo updated successfully!`, 'success');
                            onLogTriggered('LOGO_UPDATED_SUCCESS', 'organization', 'logo', 'SUCCESS', `Updated profile corporate brand asset.`);
                          }}
                          className="p-1 border border-slate-800 hover:border-emerald-500/40 rounded-lg cursor-pointer text-center bg-slate-950 transition-all space-y-1.5"
                        >
                          <img src={logo.value} alt={logo.name} className="w-12 h-12 object-cover rounded mx-auto" />
                          <span className="text-[9px] text-slate-400 block truncate">{logo.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Product Modal */}
                {activeChecklistModal === 'product' && (
                  <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1">Product Item Name</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. M40 Grade Ready Mix Concrete" 
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1">Price per Unit (₹)</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. ₹4,200/Cubic Meter" 
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1">BIS Quality / Cert Description</label>
                      <textarea 
                        placeholder="e.g. ISO 9001 certified ready-mix concrete." 
                        value={newProdDesc}
                        onChange={(e) => setNewProdDesc(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 outline-none focus:border-emerald-500 h-16"
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="w-full bg-emerald-500 text-slate-950 font-bold py-2 rounded font-mono text-xs cursor-pointer"
                    >
                      Publish Item to Public Directory Catalog
                    </button>
                  </form>
                )}

                {/* List Service Modal */}
                {activeChecklistModal === 'service' && (
                  <form onSubmit={handleAddService} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1">Service Skill Category</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. High-Rise Foundation Excavation" 
                        value={newServName}
                        onChange={(e) => setNewServName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1">Standard Rate Metric</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. ₹85/sq. ft." 
                        value={newServRate}
                        onChange={(e) => setNewServRate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 outline-none focus:border-emerald-500"
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="w-full bg-emerald-500 text-slate-950 font-bold py-2 rounded font-mono text-xs cursor-pointer"
                    >
                      Publish Service to Directory
                    </button>
                  </form>
                )}

                {/* Add Project Modal */}
                {activeChecklistModal === 'project' && (
                  <form onSubmit={handleAddProject} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1">Project Name</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Apex premium Heights Tower 4" 
                        value={newProjName}
                        onChange={(e) => setNewProjName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1">Development Location</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Sector 62, Noida" 
                        value={newProjLoc}
                        onChange={(e) => setNewProjLoc(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1">Project Budget Cap (Cr)</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. ₹28 Crores" 
                        value={newProjBudget}
                        onChange={(e) => setNewProjBudget(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 outline-none focus:border-emerald-500"
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="w-full bg-emerald-500 text-slate-950 font-bold py-2 rounded font-mono text-xs cursor-pointer"
                    >
                      Publish Project Portfolio
                    </button>
                  </form>
                )}

                {/* Invite Team Modal */}
                {activeChecklistModal === 'team' && (
                  <form onSubmit={handleInviteTeam} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1">Colleague Email Address</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="e.g. engineering@signatureglobal.in" 
                        value={newTeamEmail}
                        onChange={(e) => setNewTeamEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-mono text-[10px] uppercase mb-1">Workspace Permission Role</label>
                      <select 
                        value={newTeamRole}
                        onChange={(e) => setNewTeamRole(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-350 rounded px-3 py-2 outline-none"
                      >
                        <option value="Manager">Workspace Manager</option>
                        <option value="Surveyor">RERA Certified Surveyor</option>
                        <option value="Auditor">Compliance Auditor</option>
                        <option value="Procurement lead">Procurement Lead</option>
                      </select>
                    </div>
                    <button 
                      type="submit" 
                      className="w-full bg-emerald-500 text-slate-950 font-bold py-2 rounded font-mono text-xs cursor-pointer"
                    >
                      Dispatch Secure Portal Invitation
                    </button>
                  </form>
                )}

              </div>
            </div>
          )}

          {/* Post-Onboarding Dashboard Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-850 p-4 rounded-xl text-xs font-mono text-slate-500">
            <span>Corporate Node Registry Seal ID: #RC-NODE-STAKEHOLDER-{activeRole.toUpperCase()}</span>
            <button
              type="button"
              onClick={handleFullReset}
              className="text-slate-450 hover:text-white underline cursor-pointer"
            >
              Sign Out Hub & Reset Wizard
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
