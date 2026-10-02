# RealtyConnect

India's integrated real-estate business network: directory, feed, RFQs, marketplace, CRM, projects,
procurement, inventory, finance, HR/DMS, assets and compliance in one workspace.

**Stack:** React 19 + Vite + Tailwind (client) · Node.js + Express (API) · MongoDB (data).

## Run locally

Prerequisites: Node.js 20+ and Docker (or any MongoDB 6+ reachable through `MONGODB_URI`).

```bash
npm install
docker compose up -d      # MongoDB on localhost:27017
npm run dev               # API on :4000, web app on :3000
```

Open http://localhost:3000. In development the server creates demo accounts for every stakeholder
role; the sign-in dialog lists them and fills in the shared demo password for you.

No `.env` file is needed for development. To change settings, copy `.env.example` to `.env`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | API (with reload) and Vite dev server together |
| `npm run build` | Builds the web app to `dist/` and the API to `server/dist/` |
| `npm start` | Runs the built API in production mode; it also serves `dist/` |
| `npm run lint` | Type-checks client and server |
| `node --test server/test/smoke.test.mjs` | API smoke tests against a running dev server (creates throwaway accounts; development databases only) |

## Layout

```
src/                 React app
  components/        One file per business module, plus the admin consoles
  lib/api.ts         HTTP client: access token in memory, refresh via httpOnly cookie
  lib/appStore.ts    Workspace data store (see "How module data is saved")
server/src/          Express API
  routes/auth.ts     Register, login, refresh, logout, role switch
  routes/platform.ts Roles, system config, masters, audit log, notifications
  routes/files.ts    Document upload / download
  routes/store.ts    Workspace data
  models.ts          Mongoose models for the platform collections
shared/              Code used by both sides (role table, workspace key registry)
```

## How module data is saved

The business modules read and write through `appStore`, a synchronous key/value store. At sign-in
it loads the user's data from `GET /api/v1/store`; every change is then pushed to
`PATCH /api/v1/store/:key` in the background.

`shared/storeKeys.ts` lists every key, the MongoDB collection behind it, and who can see it:

- **public** – one dataset for the whole platform (marketplace listings, RFQs, opportunities, feed).
  Any signed-in user can add or edit items; only the publishing organization (or an admin) can remove them.
- **org** – private to an organization (leads, CRM, projects, inventory, finance, HR, ...).
- **user** – private to one user (saved items, dashboard layout, pinned modules).

List data is stored one document per item, and only changed items are sent, so two people editing
different records do not overwrite each other. Changes made by someone else appear at the next
sign-in or page reload; there is no live push.

Keys that are not in the registry (theme, sidebar state, search history) stay in the browser.

## Security model

- Passwords are hashed with bcrypt and must be 12+ characters with upper, lower, digit and special.
- Access tokens last 15 minutes; refresh tokens last 12 hours, rotate on every use and are revoked on logout.
- Five wrong passwords within 10 minutes lock the account for 30 minutes (`BRUTE_FORCE_THRESHOLD` config).
- Every permission check happens on the server against the role's permissions in the `roles`
  collection. Admins can edit that matrix at runtime; changes apply to live sessions within 30 seconds.
- `ADMIN` and `COMPLIANCE_AUDITOR` cannot be self-registered. Create the first administrator with
  `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- Each registration creates a new organization. There is no flow yet to invite a colleague into an
  existing organization.
- The audit log is append-only and each record is chained to the previous one with SHA-256;
  `GET /api/v1/audit-logs/verify` re-computes the chain.
- Uploads are limited to PDF, PNG and JPEG, checked against the file's actual content, and capped by
  the `MAX_UPLOAD_SIZE_MB` config.

## Look and feel

The design system lives in `src/index.css`: Inter (self-hosted via `@fontsource-variable/inter`), a light theme by
default (white cards on a soft grey page, deep-green brand colour) and an optional dark theme from the toggle in the
header. Small text is raised to a readable minimum and labels use sentence case. To re-brand, change the accent
colour values in the `.light-mode` block. The page title, description and favicon are in `index.html` and `public/`.

## Companies and the directory

Every registration creates a company (organization) that is listed in the B2B directory. The owner edits its
public profile under **My Company Profile → Owner Portal**; changes are saved to MongoDB and are visible to
every visitor according to the profile and contact visibility settings.

- `GET /api/v1/companies` – the directory (public); `GET /api/v1/companies/:id` – one profile.
- `PUT /api/v1/companies/me` – the owner edits its own profile. Verification status and plan cannot be set here.
- `POST /api/v1/companies/:id/reviews` – a signed-in member reviews another company (one review per company; the
  reviewer name and company come from the account).
- The bundled sample companies are shown beside real ones only in demo mode (`SEED_DEMO_USERS`).
- Nothing is marked "verified" until a verification flow exists (see below).

## Not built yet

- **Cross-company delivery.** Messages, enquiries, quotations and connection requests are saved in
  the sender's organization only. The other company does not receive them; the replies shown in
  the UI are still simulated on the client.
- **Verification.** No company is verified yet: there are no document uploads or admin approval, so the "Verified" badge never appears for real companies.
- **Starter data.** A new organization sees the sample records that ship with each module the first
  time it opens that module, and those records are saved as its own data.
- **Virus scanning.** Uploaded files are released from quarantine after a short hold without being
  scanned. Connect a scanner in `releaseFromQuarantine` (`server/src/routes/files.ts`).
- **Email / SMS / push.** These notifications are stored with status `queued`; no provider is connected.
- **The onboarding walkthrough** (`RegistrationOnboarding`) is a guided demo; it does not create an account.
  Accounts are created from the "Create Account" tab of the sign-in dialog.

## Deploying

Build, then run `npm start` with at least `NODE_ENV=production`, `MONGODB_URI`, `JWT_ACCESS_SECRET`
and the `ADMIN_*` variables set. The single Node process serves both the API and the web app, so it
must sit behind HTTPS (the session cookie is marked `Secure` in production).

`firebase.json` only describes static hosting of `dist/`. Static hosting alone can no longer run the
app, because it now needs the API.
