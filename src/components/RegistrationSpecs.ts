/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type StakeholderType = 'builder' | 'vendor' | 'contractor' | 'bank';

export interface EligibilityCriterion {
  id: string;
  text: string;
  required: boolean;
}

export interface DocRequirement {
  id: string;
  label: string;
  description: string;
}

export interface MembershipPlan {
  name: string;
  badge: string;
  price: string;
  growthMetrics: string;
  features: string[];
}

export interface DirectoryPartner {
  id: string;
  name: string;
  role: StakeholderType;
  distance: number; // in km
  category: string;
  rating: number;
  location: string;
  focus: string;
  avatarColor: string;
  initialInquiryReply: string;
}

export const ELIGIBILITY_RULES: Record<StakeholderType, EligibilityCriterion[]> = {
  builder: [
    { id: 'b-1', text: 'Possess a valid active state RERA registration certificate', required: true },
    { id: 'b-2', text: 'At least 2 successfully delivered residential/commercial projects', required: true },
    { id: 'b-3', text: 'Corporate net-worth above ₹2 Crores to absorb material volume commitments', required: true },
    { id: 'b-4', text: 'Zero pending solvency or liquidation disputes in corporate tribunal NCLT', required: true }
  ],
  vendor: [
    { id: 'v-1', text: 'Active tax status registered under Central and State GSTIN', required: true },
    { id: 'v-2', text: 'Minimum 3 years of commercial material manufacturing or distribution history', required: true },
    { id: 'v-3', text: 'Warehousing/logistics footprint of at least 3,000 sq. ft.', required: true },
    { id: 'v-4', text: 'Audited certification from Bureau of Indian Standards (BIS) or equivalent ISO', required: false }
  ],
  contractor: [
    { id: 'c-1', text: 'Class-I Government Licensed Civil Contractor or registered Architect', required: true },
    { id: 'c-2', text: 'Active safety directors and structural engineers on payroll', required: true },
    { id: 'c-3', text: 'Active permanent labor roster of 25+ verified specialists', required: true },
    { id: 'c-4', text: 'Active public liability insurance covering up to ₹25 Lakhs per active work site', required: false }
  ],
  bank: [
    { id: 'ba-1', text: 'RBI Registered Commercial Bank or Tier-1 Non-Banking Financial Corp (NBFC)', required: true },
    { id: 'ba-2', text: 'Commercial real-estate real loan limit capacity of ₹50 Crores or more', required: true },
    { id: 'ba-3', text: 'Willingness to support dynamic ESCROW micro-milestone cashflow release hooks', required: true },
    { id: 'ba-4', text: 'CRISIL/ICRA high credit score ratings of A+ or higher', required: true }
  ]
};

export const DOCUMENT_REQUIREMENTS: Record<StakeholderType, DocRequirement[]> = {
  builder: [
    { id: 'doc-b-rera', label: 'RERA Operating License', description: 'Certified state license confirming real-estate development authorization.' },
    { id: 'doc-b-inc', label: 'Certificate of Incorporation', description: 'MCA issued COI validating company legal identity.' },
    { id: 'doc-b-aud', label: 'Audited Financial Statement', description: 'Most recent fiscal year balance sheet proving capital solvency.' }
  ],
  vendor: [
    { id: 'doc-v-gst', label: 'GSTIN Registration Copy', description: 'Form GST REG-06 showing active trade registration.' },
    { id: 'doc-v-plant', label: 'Logistics Space Tenancy Deed', description: 'Lease agreement or deed confirming warehouse capability.' },
    { id: 'doc-v-iso', label: 'ISO / BIS Grade Certificate', description: 'Official certification verifying structural material grade.' }
  ],
  contractor: [
    { id: 'doc-c-lic', label: 'Govt Contractor Class-I License', description: 'Engineering department license proving project bidding capacity.' },
    { id: 'doc-c-pnd', label: 'Provident Fund (PF) Registration', description: 'Labor welfare statutory compliance credential.' },
    { id: 'doc-c-saf', label: 'Standard Site Safety manual', description: 'Operational workbook for site hazard prevention.' }
  ],
  bank: [
    { id: 'doc-ba-rbi', label: 'RBI Banking Charter License', description: 'Statutory bank certificate verifying monetary operations.' },
    { id: 'doc-ba-resol', label: 'Board Resolution on Escrows', description: 'Board approval authorizing integration with real-estate Escrows.' },
    { id: 'doc-ba-aud', label: 'RBI Capital Adequacy Report', description: 'Form detailing statutory capital reserves compliance.' }
  ]
};

export const MEMBERSHIP_PLANS: Record<StakeholderType, MembershipPlan[]> = {
  builder: [
    {
      name: 'Starter Space',
      badge: 'Perfect for new developers',
      price: '₹2,499/mo',
      growthMetrics: '1x organic search visibility',
      features: [
        'List up to 1 active project portfolio',
        'Post up to 1 material bidding procurement tender',
        'Direct inquiry mailbox access',
        'Manual Escrow payment releases'
      ]
    },
    {
      name: 'Commercial Pro',
      badge: 'Designed for active builders',
      price: '₹5,999/mo',
      growthMetrics: '3.5x directory search multiplier',
      features: [
        'Unlimited project portfolio showcases',
        'Publish unlimited active tenders to the contractor network',
        'Priority matching with RERA-Verified sub-contractors',
        'Semi-automated escrow cashflow releases',
        'Receive direct competitive quotations from 100+ raw vendors'
      ]
    },
    {
      name: 'Corporate Elite',
      badge: 'Full enterprise networking suite',
      price: '₹14,999/mo',
      growthMetrics: 'Top featured listings & custom APIs',
      features: [
        'Dedicated Enterprise Account Manager',
        'Instant host-to-host banking integrations',
        'Automated RBI Escrow compliance audits',
        'Priority B2B Lead matching telemetry',
        'Custom workspace credentials & developer console access'
      ]
    }
  ],
  vendor: [
    {
      name: 'Starter Hub',
      badge: 'Perfect for local suppliers',
      price: '₹0/mo',
      growthMetrics: 'Local search visibility only',
      features: [
        'List up to 5 material catalogs (SKUs)',
        'Submit bids on local district tenders',
        'Standard B2B email communication'
      ]
    },
    {
      name: 'Commercial Pro',
      badge: 'Grow your dealer network',
      price: '₹4,999/mo',
      growthMetrics: '4x visibility & premium search listings',
      features: [
        'Unlimited material catalog uploads',
        'Submit bids on state-wide megaproject tenders',
        'Verified B2B Trust Seal on listing profile',
        'Receive immediate direct purchase requests from large builders',
        'Detailed competitor price analysis metrics'
      ]
    }
  ],
  contractor: [
    {
      name: 'Starter Bidding',
      badge: 'Perfect for independent crews',
      price: '₹0/mo',
      growthMetrics: 'Basic profile directory presence',
      features: [
        'Bid on projects up to ₹15 Lakhs budget',
        'Standard credential registry listing',
        'Direct email inquiries'
      ]
    },
    {
      name: 'Commercial Pro',
      badge: 'Designed for growing firms',
      price: '₹3,999/mo',
      growthMetrics: '3x bid matching priority',
      features: [
        'Bid on unlimited megaprojects & structural tenders',
        'Exclusive verified contractor profile badge',
        'Machinery rental portfolio integration (List up to 5 cranes/excavators)',
        'Direct Escrow payment collection channels with commercial banks',
        'Featured directory rank within local sectors'
      ]
    }
  ],
  bank: [
    {
      name: 'Corporate Elite',
      badge: 'Maximize developer lending volume',
      price: '₹19,999/mo',
      growthMetrics: 'Exclusive real-time credit matching',
      features: [
        'Host-to-host API integration for real-time Escrow account creation',
        'Direct credit scoring evaluation for prospective builders',
        'Verify structural site milestone logs automatically with surveyor feeds',
        'Uncapped lending portfolio referral pipeline',
        'Enterprise developer dashboard access'
      ]
    }
  ]
};

export const MOCK_DIRECTORY_PARTNERS: DirectoryPartner[] = [
  // Complementary business directory based on stakeholder
  {
    id: 'dp-1',
    name: 'Ultratech Aggregates & ReadyMix',
    role: 'vendor',
    distance: 4.8,
    category: 'Concrete & Raw Materials',
    rating: 4.9,
    location: 'Gurugram, Sector 65',
    focus: 'FE550 TMT Steel, ReadyMix Grade M40 Concrete',
    avatarColor: 'emerald',
    initialInquiryReply: 'Hello! Thank you for contacting Ultratech Aggregates. We specialize in custom high-strength structural grade concrete. For your prospective project, we can offer a customized B2B bulk rate of ₹4,200/cubic meter with delivery within 24 hours. Let us set up a direct meeting!'
  },
  {
    id: 'dp-2',
    name: 'TATA Tiscon Distribution Depot',
    role: 'vendor',
    distance: 12.5,
    category: 'Structural Steel',
    rating: 4.8,
    location: 'Noida Phase-II',
    focus: 'Fe550D TMT Reinforcement Bars',
    avatarColor: 'teal',
    initialInquiryReply: 'Greetings from TATA Tiscon. Our Fe550D reinforcement rebars are fully certified by BIS standards. For registered RealtyConnect premium builders, we provide flexible 45-day payment credit lines. Shall we arrange a quotation call?'
  },
  {
    id: 'dp-3',
    name: 'Ahluwalia Civil Infrastructure Ltd',
    role: 'contractor',
    distance: 8.2,
    category: 'Civil & Foundation Works',
    rating: 4.7,
    location: 'New Delhi, Connaught Place',
    focus: 'Heavy excavation, pile foundations, structural slabs',
    avatarColor: 'amber',
    initialInquiryReply: 'Thank you for reaching out to Ahluwalia Infrastructure. We have completed over 35 high-rise RCC foundations across Delhi NCR. We currently have 3 excavation crews ready to deploy immediately. Please share your architectural layout so we can quote!'
  },
  {
    id: 'dp-4',
    name: 'Sterling Electrical Grid Contracting',
    role: 'contractor',
    distance: 15.1,
    category: 'MEP Services',
    rating: 4.6,
    location: 'Faridabad Industrial Area',
    focus: 'Substations, commercial wiring, high-voltage HVAC grids',
    avatarColor: 'orange',
    initialInquiryReply: 'Hello! Sterling MEP is ready to collaborate. We hold a Class-A Government Electrical Contractor license and possess a full roster of 45 licensed safety technicians. We would love to review your MEP requirements.'
  },
  {
    id: 'dp-5',
    name: 'Signature Global Real Estate',
    role: 'builder',
    distance: 3.1,
    category: 'Residential Developer',
    rating: 4.9,
    location: 'Gurugram, Golf Course Extension',
    focus: 'Affordable high-rises and premium township projects',
    avatarColor: 'blue',
    initialInquiryReply: 'Greetings! Signature Global is currently scouting Class-I structural contractors for our upcoming Phase-04 towers. We operate strictly through secure escrow structures. Let us set up a site meeting to discuss collaboration terms.'
  },
  {
    id: 'dp-6',
    name: 'DLF Cybercity Developers',
    role: 'builder',
    distance: 6.7,
    category: 'Commercial Developer',
    rating: 4.9,
    location: 'Gurugram, DLF Phase-III',
    focus: 'Grade-A tech parks and retail malls',
    avatarColor: 'indigo',
    initialInquiryReply: 'Thank you for your business enquiry. DLF Procurement is looking for verified raw material suppliers for concrete block manufacturing. We have active tenders on RealtyConnect and require verified ISO credentials.'
  },
  {
    id: 'dp-7',
    name: 'HDFC ESCROW Corporate Banking',
    role: 'bank',
    distance: 5.2,
    category: 'Commercial Lender',
    rating: 4.9,
    location: 'New Delhi, KG Marg',
    focus: 'RERA corporate Escrow accounts & developer project funding',
    avatarColor: 'purple',
    initialInquiryReply: 'Hello! HDFC Corporate Banking offers specialized real-estate Escrow accounts linked directly to project milestone surveyors. We can auto-approve developer credit lines up to ₹50 Crores based on your profile strength.'
  },
  {
    id: 'dp-8',
    name: 'ICICI Commercial Credit & NBFC',
    role: 'bank',
    distance: 10.4,
    category: 'Project Finance',
    rating: 4.8,
    location: 'Noida Sector 62',
    focus: 'Construction finance, machinery leasing escrows',
    avatarColor: 'rose',
    initialInquiryReply: 'Thank you for reaching out to ICICI Infrastructure Finance. We support structured machinery lease financing and fast-track escrow approvals for verified contractors.'
  }
];

export const TECHNICAL_BLUEPRINT_TABS = {
  requirements: {
    title: '1. Business Requirements',
    content: `### Strategic Objective
The RealtyConnect Registration & Onboarding Module is re-engineered from a rigid regulatory audit system into a **Business Growth Accelerator**. While static compliance checks (RERA, GSTIN, RBI license) happen safely in the background, the user-facing journey constantly promotes professional network expansion, directory visibility, and corporate revenue growth.

### Core High-Fidelity Elements
- **Value-First Discovery Tracks**: Tailored introductory dashboards showing exactly how the platform drives growth prior to formal document submissions.
- **Ecosystem Trust Verification**: Compliance fields are reframed as "Trust Shield Badges" that prove market authenticity and help win premium contracts.
- **Dynamic Profile Strength Meter**: Traditional percentages are replaced with descriptive reputation benchmarks (\`Basic\`, \`Growing\`, \`Professional\`, \`Verified\`, \`Enterprise Ready\`).
- **Instant B2B Directory & Inquiry Simulator**: Users immediately interact with simulated local businesses to trigger actual inquiries and receive responsive feedback.`
  },
  rules: {
    title: '2. Business Rules',
    content: `### Industry Guardrails
1. **Developer Trust Shield Requirements**:
   - Builders must present a formatted RERA ID (checked via simulated API loop).
   - Capital cap threshold of ₹2 Crore required to host public material tenders.
2. **Vendor Material Standards**:
   - GSTIN format must match standard 15-character statutory structure.
   - ISO/BIS grading verification required for featured premium catalog rankings.
3. **Contractor Workforce Security**:
   - Requires Class-I technical license or certified mechanical registry.
   - Permanent payroll list validated to avoid temporary safety violations.
4. **Bank Lending Governance**:
   - Strictly limited to RBI-scheduled commercial entities or Category-I NBFCs.`
  },
  database: {
    title: '3. Database Design',
    content: `### Schema Blueprints (Relational mapping for Firestore/SQL)
\`\`\`json
{
  "users": {
    "id": "uuid [PK]",
    "email": "string [UNIQUE]",
    "role": "enum('builder', 'vendor', 'contractor', 'bank')",
    "created_at": "timestamp"
  },
  "business_profiles": {
    "id": "uuid [PK]",
    "user_id": "uuid [FK -> users.id]",
    "legal_name": "string",
    "gov_id": "string [INDEX]",
    "headquarters": "string",
    "strength": "enum('Basic', 'Growing', 'Professional', 'Verified', 'Enterprise_Ready')",
    "membership_tier": "string",
    "logo_url": "string [NULLABLE]"
  },
  "catalogs": {
    "id": "uuid [PK]",
    "profile_id": "uuid [FK -> business_profiles.id]",
    "item_type": "enum('product', 'service', 'project')",
    "title": "string",
    "metadata": "json_b"
  },
  "connections": {
    "id": "uuid [PK]",
    "sender_id": "uuid [FK -> business_profiles.id]",
    "receiver_id": "uuid [FK -> business_profiles.id]",
    "status": "enum('pending', 'connected', 'following')",
    "updated_at": "timestamp"
  }
}
\`\`\``
  },
  erDiagram: {
    title: '4. Entity-Relationship Diagram',
    content: `\`\`\`text
 +------------------+                +-------------------------+
 |     USERS        |                |    BUSINESS_PROFILES    |
 +------------------+                +-------------------------+
 | id [PK]          | 1 ---------- 1 | id [PK]                 |
 | email            |                | user_id [FK]            |
 | role             |                | legal_name              |
 | created_at       |                | gov_id                  |
 +------------------+                | strength                |
                                     | membership_tier         |
                                     | logo_url                |
                                     +-------------------------+
                                                  |
                                                  | 1
                                                  |
                                                  | *
                                     +-------------------------+
                                     |   PRODUCTS / SERVICES   |
                                     +-------------------------+
                                     | id [PK]                 |
                                     | profile_id [FK]         |
                                     | item_type               |
                                     | title                   |
                                     | metadata                |
                                     +-------------------------+
\`\`\``
  },
  apis: {
    title: '5. API Contract Planning',
    content: `### Active Gateway Endpoints

1. \`POST /api/v1/onboarding/pre-qualify\`
   - **Payload**: \`{ role: StakeholderType, criteria: Record<string, boolean> }\`
   - **Response**: \`{ status: 'qualified' | 'disqualified', unmetRules: string[] }\`

2. \`POST /api/v1/onboarding/verify-trust-id\`
   - **Payload**: \`{ role: StakeholderType, govId: string }\`
   - **Response**: \`{ status: 'matched', companyName: string, registeredAddress: string }\`

3. \`POST /api/v1/profile/update-catalog\`
   - **Payload**: \`{ itemType: 'product'|'service'|'project', title: string, price?: string }\`
   - **Response**: \`{ status: 'success', itemId: string, currentProfileStrength: string }\`

4. \`POST /api/v1/networking/send-inquiry\`
   - **Payload**: \`{ receiverId: string, messageText: string }\`
   - **Response**: \`{ status: 'dispatched', simulatedReplyText: string }\`

5. \`POST /api/v1/membership/subscribe\`
   - **Payload**: \`{ tierName: string, paymentHash: string }\`
   - **Response**: \`{ status: 'active', accessKey: string }\``
  }
};
