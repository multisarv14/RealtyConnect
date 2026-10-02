/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DevTask, TestCase } from '../types';

export const BUSINESS_REQUIREMENT = `
## 1. Executive Summary & Purpose
The Platform Foundation Module constitutes the digital bedrock of RealtyConnect. It provides unified, secure, high-performance services to all downstream modules. By centralizing security (authentication, authorization, audit logging), configuration (global variables, master data framework), and core services (file manager, notifications), this module guarantees absolute architectural consistency, strict regulatory compliance, and a seamless developer experience.

## 2. Business Objectives
- **Zero-Trust Security**: Ensure that every business transaction, API request, and data access is validated and authorized.
- **Durable Traceability**: Implement an unalterable audit trail that satisfies RERA compliance, financial audits, and enterprise-grade security standards.
- **Consistent Master Data**: Establish a single source of truth for global values (geographies, currency, project lifecycle states) to prevent master data redundancy and integrity errors.
- **Decoupled Architecture**: Provide standardized APIs for notifications and file storage, shielding domain modules from direct infrastructural dependencies.

## 3. Scope
### In-Scope (Core Platform Services)
- **Unified Identity Access Management (IAM)**: Token-based multi-factor authentication, enterprise role-based authorization (RBAC), and session expiration controls.
- **Centralized Master Data Management (MDM)**: A generic, highly queryable data registry for common lookups.
- **Global Configuration Management**: Runtime system toggles (e.g., system-wide maintenance mode, file size thresholds, throttling limits).
- **Secure File Storage Registry**: Standardized file upload flow including virus scanning hooks, hash checking, and authorization-protected file reads.
- **Multi-Channel Notification Dispatcher**: Asynchronous routing of system events to SMS, Email, In-App panels, and Push channels.
- **Unalterable Audit & Activity Logs**: Immutable recording of all security, data manipulation, and operational access logs.

### Out-of-Scope (Deferred to Later Domains)
- **User-Facing Registration Forms**: Multi-step registration flows and business profile wizard screens belong to the **Registration Module**.
- **External Identity Provider Sync**: SSO federation (Azure AD, Okta, Google Workspace for business users) is deferred to the Enterprise release stage.
- **Direct Physical File Scanning**: The physical file stream is scanned by isolated background cloud tasks; the platform database only acts as the registry and validation gate.
- **Predictive AI Insights**: Predictive analytics and intelligent logging are not included in the current release scope.

## 4. Stakeholder Impact
- **Platform Owner / Administrator**: Full operational visibility via audit logs and administrative authority over global configs and master data.
- **Enterprise Businesses (Developers, Builders, Suppliers)**: Absolute confidence that their commercial records, employee roles, and proprietary files are securely protected.
- **System Developers & QA Engineers**: Standardized, clean APIs to build and test new business features rapidly without rebuilding core systems.
- **Compliance Auditors**: Reliable, tamper-evident logs mapping "Who did What, When, Where, and Why."
`;

export const BUSINESS_RULES = `
## 1. Authentication & Session Security
- **Rule AUTH-01 (Password Complexity)**: Passwords must contain at least 12 characters, including one uppercase letter, one lowercase letter, one numeric digit, and one special character.
- **Rule AUTH-02 (Brute-Force Lockout)**: After 5 consecutive failed login attempts within 10 minutes, the account must be locked for exactly 30 minutes. An alert notification must be dispatched to the user.
- **Rule AUTH-03 (Session Lifespan)**: Access tokens (JWT) shall maintain a maximum active lifespan of 15 minutes. Refresh tokens are limited to 12 hours.
- **Rule AUTH-04 (Inactivity Timeout)**: Front-end sessions must automatically terminate and destroy local tokens after 15 minutes of user inactivity.

## 2. Authorization (RBAC) & Permissions
- **Rule AUTH-05 (Principle of Least Privilege)**: By default, a user possesses zero permissions. Permissions are granted exclusively via assigned Roles.
- **Rule AUTH-06 (Multi-Role Support)**: A user may hold multiple roles across different operational contexts. However, each session must operate under a single, explicitly selected identity to ensure accountability.
- **Rule AUTH-07 (Role Modification Traceability)**: Any change to a Role's permissions or a User's assigned Roles must trigger an immediate High-Priority Audit Log and require secondary administrator validation.

## 3. Secure File Uploads
- **Rule FILE-01 (MIME-Type Restrictions)**: Only approved MIME-types are allowed: \`application/pdf\`, \`image/png\`, \`image/jpeg\`. Executables or scripts are strictly rejected.
- **Rule FILE-02 (Size Limitations)**: Individual uploads are strictly limited to 10MB for documents, and 5MB for images.
- **Rule FILE-03 (Malware & Registry Block)**: Files are marked as 'scanning' upon upload. They must pass automated anti-malware evaluation before being transitioned to 'success' and made downloadable.

## 4. Audit & Activity Logging
- **Rule LOG-01 (Immutability)**: Audit log records are read-only. No system API, administrator, or database user may alter, delete, or truncate log tables.
- **Rule LOG-02 (Hashing & Integrity)**: Every audit log entry must be chained with the previous entry using a SHA-256 cryptographic hash to guarantee tamper-evidence.
`;

export const DATABASE_DESIGN = `
### 1. Table Schema: \`users\`
Stores core authentication and identity metadata.
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| \`id\` | \`UUID\` | PRIMARY KEY, DEFAULT \`gen_random_uuid()\` | Unique user identifier |
| \`email\` | \`VARCHAR(255)\` | UNIQUE, NOT NULL | Primary login identifier |
| \`password_hash\` | \`VARCHAR(255)\` | NOT NULL | Securely hashed password (bcrypt/Argon2) |
| \`status\` | \`VARCHAR(50)\` | NOT NULL | \`ACTIVE\`, \`LOCKED\`, \`INACTIVE\`, \`PENDING_VERIFICATION\` |
| \`failed_attempts\`| \`INT\` | DEFAULT 0, NOT NULL | Tracking brute-force security limits |
| \`lockout_until\` | \`TIMESTAMP\` | NULLABLE | End-time for brute-force lock |
| \`created_at\` | \`TIMESTAMP\` | DEFAULT \`CURRENT_TIMESTAMP\`, NOT NULL | Audit creation |
| \`updated_at\` | \`TIMESTAMP\` | DEFAULT \`CURRENT_TIMESTAMP\`, NOT NULL | Last update |

### 2. Table Schema: \`roles\`
Defines available system-wide security boundaries.
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| \`code\` | \`VARCHAR(50)\` | PRIMARY KEY | Unique string code (e.g., \`BUILDER\`, \`ARCHITECT\`) |
| \`name\` | \`VARCHAR(100)\` | NOT NULL | Human-readable role name |
| \`description\` | \`TEXT\` | NULLABLE | Detailed responsibility scope |
| \`is_system\` | \`BOOLEAN\` | DEFAULT FALSE, NOT NULL | True if hardcoded system role |

### 3. Table Schema: \`user_roles\`
Resolves Many-to-Many associations between Users and Roles.
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| \`user_id\` | \`UUID\` | FOREIGN KEY REFERENCES \`users(id)\` | Associated user |
| \`role_code\` | \`VARCHAR(50)\` | FOREIGN KEY REFERENCES \`roles(code)\` | Associated role code |
| | | PRIMARY KEY (\`user_id\`, \`role_code\`) | Dual primary keys |

### 4. Table Schema: \`permissions\`
Catalog of atomic platform capabilities.
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| \`code\` | \`VARCHAR(100)\` | PRIMARY KEY | Atomic authorization code (e.g., \`CREATE_RFQ\`) |
| \`name\` | \`VARCHAR(100)\` | NOT NULL | Descriptive permission name |
| \`module\` | \`VARCHAR(50)\` | NOT NULL | Module categorization (e.g., \`FOUNDATION\`, \`CRM\`) |

### 5. Table Schema: \`role_permissions\`
Maps permissions to roles.
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| \`role_code\` | \`VARCHAR(50)\` | FOREIGN KEY REFERENCES \`roles(code)\` | Associated role |
| \`permission_code\`| \`VARCHAR(100)\`| FOREIGN KEY REFERENCES \`permissions(code)\`| Associated permission |
| | | PRIMARY KEY (\`role_code\`, \`permission_code\`)| Dual primary keys |

### 6. Table Schema: \`common_masters\`
Generic key-value catalog supporting geographic, currency, and lookup masters.
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| \`id\` | \`UUID\` | PRIMARY KEY, DEFAULT \`gen_random_uuid()\` | Lookup ID |
| \`category\` | \`VARCHAR(50)\` | NOT NULL | Lookup category (e.g., \`COUNTRY\`, \`MEASUREMENT_UNIT\`) |
| \`code\` | \`VARCHAR(50)\` | UNIQUE, NOT NULL | Machine identifier (e.g., \`SQ_FT\`, \`INR\`) |
| \`name\` | \`VARCHAR(255)\` | NOT NULL | Display name |
| \`is_system\` | \`BOOLEAN\` | DEFAULT FALSE | Locked master values that cannot be deleted |

### 7. Table Schema: \`system_configs\`
Global system variables accessible at runtime.
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| \`key\` | \`VARCHAR(100)\` | PRIMARY KEY | Configuration variable key |
| \`value\` | \`TEXT\` | NOT NULL | Actual variable value |
| \`data_type\` | \`VARCHAR(50)\` | NOT NULL | \`BOOLEAN\`, \`STRING\`, \`NUMBER\` |
| \`description\` | \`TEXT\` | NULLABLE | System operator reference |

### 8. Table Schema: \`uploaded_files\`
Maintains storage references and metadata of business documentation.
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| \`id\` | \`UUID\` | PRIMARY KEY, DEFAULT \`gen_random_uuid()\` | Storage file reference identifier |
| \`name\` | \`VARCHAR(255)\` | NOT NULL | Original uploaded filename |
| \`size_bytes\` | \`BIGINT\` | NOT NULL | Exact byte-size |
| \`mime_type\` | \`VARCHAR(100)\` | NOT NULL | Verified MIME payload |
| \`status\` | \`VARCHAR(50)\` | NOT NULL | \`SCANNING\`, \`SUCCESS\`, \`FAILED\` |
| \`storage_path\` | \`TEXT\` | NOT NULL | Path inside secure bucket storage |
| \`md5_checksum\` | \`VARCHAR(32)\` | NOT NULL | Tamper validation hash |
| \`uploader_id\` | \`UUID\` | FOREIGN KEY REFERENCES \`users(id)\` | Account responsible for file upload |
| \`uploaded_at\` | \`TIMESTAMP\` | DEFAULT \`CURRENT_TIMESTAMP\` | Audit timestamp |

### 9. Table Schema: \`audit_logs\`
Unalterable system and database event tracker.
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| \`id\` | \`BIGSERIAL\` | PRIMARY KEY | Auto-incrementing large identifier |
| \`timestamp\` | \`TIMESTAMP\` | DEFAULT \`CURRENT_TIMESTAMP\`, NOT NULL | Precise occurrence timestamp |
| \`user_id\` | \`UUID\` | NULLABLE | Responsible user (null if system-triggered) |
| \`user_role\` | \`VARCHAR(50)\` | NULLABLE | Contextual role during activity |
| \`action\` | \`VARCHAR(100)\` | NOT NULL | Event name (e.g., \`AUTH_LOGIN_SUCCESS\`, \`MASTER_CREATE\`) |
| \`entity\` | \`VARCHAR(50)\` | NOT NULL | Affected entity schema (e.g., \`users\`, \`common_masters\`) |
| \`entity_id\` | \`VARCHAR(100)\` | NOT NULL | Targeted primary key reference |
| \`status\` | \`VARCHAR(50)\` | NOT NULL | \`SUCCESS\`, \`FAILURE\`, \`WARNING\` |
| \`details\` | \`TEXT\` | NOT NULL | Detailed JSON or narrative metadata |
| \`ip_address\` | \`VARCHAR(45)\` | NOT NULL | Client network address (IPv4/IPv6 support) |
| \`chain_hash\` | \`VARCHAR(64)\` | NOT NULL | SHA-256 cryptographic linkage hash |
`;

export const UI_FLOW = `
## 1. User Authentication Flow
1. **User Login Attempt**: User inputs email and password on the login console.
2. **Brute-Force Check**: System queries \`users\` table to confirm the status is not locked. If locked, throw an alert displaying time remaining.
3. **Password Verification**: Secure Argon2/bcrypt decryption compares input to hash.
   - **On Success**: Clear failed attempts. Generate secure JWT. Write an entry to \`audit_logs\`. Transition UI state to Dashboard.
   - **On Failure**: Increment failed attempts. If attempts >= 5, lock account for 30 minutes, send SMS/Email alert, log High-Priority Failure.
4. **Session Activity Monitor**: Front-end records keyboard/click activities. After 15 minutes of silence, pop a 30-second warning modal, then trigger a secure logout call, clearing tokens from local memory.

## 2. Secure File Management Workflow
1. **Selection (Drag-and-Drop or File Picker)**: User drops a document inside the touch-target container.
2. **Client-Side Checks**: Check file size (<= 10MB) and file extension (PDF, PNG, JPG). If invalid, abort and highlight red boundaries.
3. **Initiate Upload API**: Client makes a POST request, uploading raw bytes and obtaining an ID.
4. **Quarantine Sandbox Registry**: Server writes to \`uploaded_files\` table with status \`SCANNING\`. The file is quarantined inside a private cloud bucket.
5. **Virus/Malware Webhook**: Background microservice scans the file.
   - **Clean**: Updates state to \`SUCCESS\`. Dispatch in-app notification. File is unlocked.
   - **Malicious**: Updates state to \`FAILED\`. Dispatch High-Priority security log, alert admin, block download.

## 3. Role & Access Authorization Workflow
1. **Multi-Role Selector**: Upon landing, users with multiple roles (e.g., a person who is both a Contractor and a Supplier) select their current operational identity.
2. **Token Exchange**: Client exchanges the initial JWT for a context-specific Session Token containing only that role's approved permission arrays.
3. **UI Element Gating**: React routing guards and component hooks inspect active permission lists, hiding restricted actions and rendering custom dashboards in real-time.
`;

export const API_LIST = `
### 1. Authentication Endpoints
- **POST \`/api/v1/auth/login\`**
  - *Description*: Validates user credentials and supplies security tokens.
  - *Request*:
    \`\`\`json
    {
      "email": "admin@realtyconnect.com",
      "password": "Password@123"
    }
    \`\`\`
  - *Response (200 OK)*:
    \`\`\`json
    {
      "success": true,
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "e309cbdf-71d3-4629-87a4-09852be27b9c",
        "email": "admin@realtyconnect.com",
        "roles": ["ADMIN", "COMPLIANCE_AUDITOR"]
      }
    }
    \`\`\`
  - *Response (403 Locked)*:
    \`\`\`json
    {
      "success": false,
      "error": "Account is locked due to consecutive brute-force failures.",
      "lockoutUntil": "2026-07-16T07:47:13.000Z"
    }
    \`\`\`

- **POST \`/api/v1/auth/logout\`**
  - *Description*: Blacklists current refresh tokens and destroys the cookie-based session.
  - *Response (200 OK)*: \`{ "success": true, "message": "Session destroyed successfully." }\`

### 2. Common Masters Endpoints
- **GET \`/api/v1/masters\`**
  - *Description*: Retrieves all lookups, filtered by category.
  - *Query Params*: \`category=MEASUREMENT_UNIT\`
  - *Response (200 OK)*:
    \`\`\`json
    [
      { "id": "1", "code": "SQ_FT", "name": "Square Feet", "isSystem": true },
      { "id": "2", "code": "SQ_MT", "name": "Square Meters", "isSystem": true }
    ]
    \`\`\`

- **POST \`/api/v1/masters\`**
  - *Description*: Inserts a new common master lookup (Admin only).
  - *Request*: \`{ "category": "CITY", "code": "MUMBAI", "name": "Mumbai" }\`
  - *Response (201 Created)*: \`{ "success": true, "id": "f519cbdf-..." }\`

### 3. File Registry Endpoints
- **POST \`/api/v1/files/upload\`**
  - *Description*: Registers and streams file to quarantine sandbox.
  - *Response (202 Accepted)*:
    \`\`\`json
    {
      "fileId": "60a9cbdf-71d3-4629-87a4-09852be27b00",
      "status": "SCANNING",
      "message": "File is queued for security scans."
    }
    \`\`\`

### 4. Audit Trail Endpoints
- **GET \`/api/v1/audit-logs\`**
  - *Description*: Retrieves filterable audit trail entries.
  - *Response (200 OK)*:
    \`\`\`json
    [
      {
        "id": "10052",
        "timestamp": "2026-07-16T07:12:45.000Z",
        "userId": "e309cbdf-71d3-4629-87a4-09852be27b9c",
        "userRole": "ADMIN",
        "action": "CONFIG_UPDATE",
        "entity": "system_configs",
        "entityId": "MAINTENANCE_MODE",
        "status": "SUCCESS",
        "chainHash": "a9df48f...b38e"
      }
    ]
    \`\`\`
`;

export { STAKEHOLDER_ROLES } from '../../shared/roles';

export const DEVELOPMENT_TASKS: DevTask[] = [
  {
    id: 'TSK-001',
    title: 'Initialize Dockerized PostgreSQL Database & Setup Tables (users, roles, permissions, user_roles)',
    owner: 'Database Lead',
    estimate: '3 days',
    status: 'Completed',
    category: 'Database',
  },
  {
    id: 'TSK-002',
    title: 'Implement Cryptographic Audit Log Table trigger with SHA-256 chain calculation',
    owner: 'Security Architect',
    estimate: '4 days',
    status: 'In Progress',
    category: 'Security',
  },
  {
    id: 'TSK-003',
    title: 'Build JWT Token Engine with custom claims, MFA secret storage, and rotation parameters',
    owner: 'Backend Dev',
    estimate: '3 days',
    status: 'Todo',
    category: 'Security',
  },
  {
    id: 'TSK-004',
    title: 'Create Unified Common Master API endpoints (GET, POST, PUT, DELETE with System Lock safeguards)',
    owner: 'Backend Dev',
    estimate: '2 days',
    status: 'Todo',
    category: 'API Development',
  },
  {
    id: 'TSK-005',
    title: 'Design File Upload Middleware verifying magic bytes, extension whitelist, and scanning mocks',
    owner: 'Infrastructure Dev',
    estimate: '4 days',
    status: 'Todo',
    category: 'File Management',
  },
  {
    id: 'TSK-006',
    title: 'Construct Multi-Channel Notification Router (SMS via Twilio, Email via SendGrid, SSE for In-App)',
    owner: 'Backend Dev',
    estimate: '5 days',
    status: 'Todo',
    category: 'Notifications',
  },
  {
    id: 'TSK-007',
    title: 'Build Front-end Platform Foundation Console with stateful interactive simulators & Audit display',
    owner: 'UI Dev',
    estimate: '4 days',
    status: 'In Progress',
    category: 'UI/UX Design',
  },
];

export const TEST_CASES: TestCase[] = [
  {
    id: 'TC-SEC-01',
    title: 'Brute-Force Account Lockout Enforcement',
    precondition: 'Target account exists, state is ACTIVE.',
    steps: [
      'Submit incorrect password 5 consecutive times via login API.',
      'Query user database to check status and lockout_until timestamp.',
      'Submit correct password during lockout period.',
    ],
    expected: 'The 5th failure updates status to LOCKED. Correct credentials during lockout are rejected with a 403 Forbidden.',
    status: 'Passed',
  },
  {
    id: 'TC-SEC-02',
    title: 'Audit Log Chain Integrity Validation',
    precondition: 'Previous audit logs exist. Hashing chain is fully green.',
    steps: [
      'Insert a new audit log record.',
      'Manually attempt to UPDATE the details column of an old log entry.',
      'Run the cryptographic verification utility on the chain.',
    ],
    expected: 'Old record updates are prevented by database write triggers. Cryptographic verification highlights the mismatch if tampered.',
    status: 'Untested',
  },
  {
    id: 'TC-FILE-01',
    title: 'Malicious File Extension & Payload Rejection',
    precondition: 'Authenticated session is active. File drop zone is ready.',
    steps: [
      'Select a file named "invoice.exe" or "malicious.js".',
      'Attempt to drop the file or upload it via file selector.',
    ],
    expected: 'Client-side validator highlights red error immediately. File upload is prevented. Server API throws 415 Unsupported Media Type if bypassed.',
    status: 'Passed',
  },
  {
    id: 'TC-FILE-02',
    title: 'File Quarantine Scanning Workflow',
    precondition: 'Clean PDF document selected (e.g. "architect_blueprint.pdf").',
    steps: [
      'Upload file through the uploader component.',
      'Observe status in file registry (starts as SCANNING).',
      'Simulate positive webhook feedback from virus engine.',
    ],
    expected: 'Status changes to SUCCESS. In-app notification triggers. Download option is unlocked.',
    status: 'Passed',
  },
  {
    id: 'TC-RBAC-01',
    title: 'RBAC Permission Gating Enforcement',
    precondition: 'User is authenticated with role CONTRACTOR (without ADMIN permissions).',
    steps: [
      'Select CONTRACTOR role and render the UI.',
      'Attempt to invoke POST /api/v1/masters to create a city master.',
    ],
    expected: 'React UI disables/hides master creation buttons. Direct API requests are blocked with 403 Access Denied.',
    status: 'Passed',
  },
];

export const DEPLOYMENT_NOTES = `
## 1. Environmental Prerequisites
The RealtyConnect Platform Foundation services are designed to run as containerized microservices in cloud environments.
- **Database**: PostgreSQL 15+ (Local: docker-compose container; Cloud: Cloud SQL instances).
- **Caching**: Redis v7.0 (for session tracking, API rate limits, and brute-force tracking cache).
- **Environment Configuration**: Define the following variables in the secret manager:
  \`\`\`env
  PORT=3000
  NODE_ENV=production
  DATABASE_URL=postgresql://db_user:secure_pwd@db_host:5432/realtyconnect
  REDIS_URL=redis://default:cache_pwd@redis_host:6379
  JWT_ACCESS_SECRET=super_secret_access_signature_key
  JWT_REFRESH_SECRET=super_secret_refresh_signature_key
  VIRUS_SCANNER_WEBHOOK_SECRET=scanner_shared_signature
  \`\`\`

## 2. DB Seeding & Migrations
- **Database Migrations**: Execute Drizzle/Prisma schema pushes during CI/CD steps. Never run raw unchecked schema adjustments on live databases.
- **Seeding Policy**: System Roles (\`ADMIN\`, \`COMPLIANCE_AUDITOR\`) and baseline system Common Masters (e.g., standard measurement units, countries, project categories) are hardcoded and seeded automatically on first deployment.

## 3. Deployment Pipeline
- **Step 1 (Source Integration)**: Code check-in triggers GitHub Actions linting, security scanning (Snyk), and Docker container builds.
- **Step 2 (Staging Delivery)**: Containers push to private Google Artifact Registry. Automatic deploy to pre-production Cloud Run environments.
- **Step 3 (Smoke Testing)**: Automation suites run Test Cases \`TC-SEC-01\`, \`TC-FILE-01\`, and \`TC-RBAC-01\` against staging.
- **Step 4 (Canary Deploy)**: Production roll-out via 10% traffic routing increments. Automatic rollback triggers if API 5xx rates increase past 1%.
`;
