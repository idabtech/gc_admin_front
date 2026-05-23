# GlobalCare™ Super Admin Panel

A React-based web application for managing the **GlobalCare** healthcare platform. This frontend provides super administrators with tools to oversee hospitals, doctors, patients, care packages, email templates, roles/permissions, and internal team users.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Routing](#routing)
- [Authentication](#authentication)
- [API Layer](#api-layer)
- [UI & Theming](#ui--theming)
- [Key Components](#key-components)
- [Backend Integration](#backend-integration)
- [Development Notes](#development-notes)
- [License](#license)

---

## Overview

**GlobalCare™** is a healthcare administration dashboard built for super admins. It connects to a REST API backend and offers:

- Real-time dashboard analytics (hospitals, doctors, patients, appointments)
- Hospital onboarding, approval, and lifecycle management
- Doctor profile review, approval, suspension, and hospital assignment
- Patient listing, search, filters, and detail views
- Healthcare package (plan) management
- Email template CRUD for platform communications
- Role-based access control (RBAC) with permissions
- Team/user registration and activation for internal staff

The app runs on **Vite** (dev server port **3000**) and expects a separate API server (default `http://localhost:4000/api`).

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 |
| Build tool | Vite 8 |
| Routing | React Router DOM 7 |
| HTTP client | Axios |
| Styling | Tailwind CSS 4 + inline theme tokens |
| Icons | Lucide React |
| Notifications | Sonner (toast) |
| Language | JavaScript (JSX) + TypeScript (API service) |

---

## Features

### Dashboard (`/`)
- Admin analytics from `/analytics/admin-dashboard`
- Stats: total hospitals, active doctors, total patients, appointments today
- Top hospitals list and recent activity feed
- Weekly appointments chart

### Hospitals (`/hospitals`)
- List, search, and filter hospitals (status, approval)
- Create, view, edit via `HospitalModal`
- Approve, activate, and deactivate hospitals
- Hospital approval workflow at `/hospitals/:id/approve`

### Doctors (`/doctors`)
- List and filter doctors (status, specialization, approval)
- Approve / reject / suspend / unsuspend profiles
- Assign doctors to hospitals
- View and edit doctor details in `DoctorModal`

### Patients (`/patients`, `/patients/:id`)
- Paginated patient list with search and filters (status, travel status, hospital)
- Patient detail page for individual records

### Packages (`/packages`)
- CRUD for healthcare packages/plans
- Package features and plan comparison via `PackageList` / `PackageModal`

### Email Templates (`/email-templates`)
- Manage transactional and marketing email templates
- Template types: welcome, appointment, payment, password reset, newsletter, etc.

### Role Management (`/role-management`)
- Create and edit roles
- Assign permissions to roles (by category)
- Grant/revoke permissions per role

### Team Register (`/team-register`)
- Register internal users (`/auth/create-user`)
- Paginated user list with activate/deactivate
- Assign roles and hospitals to team members

### Additional routes (defined, some hidden in sidebar)
| Route | Page | Status |
|-------|------|--------|
| `/teams-conditions` | Teams & medical conditions | Route exists; sidebar link commented |
| `/appointments` | Appointments | Route exists; sidebar link commented |
| `/coordinators` | Coordinators | Route exists; sidebar link commented |
| `/reports` | Reports | In sidebar |
| `/settings` | Settings | In sidebar |
| `/profile` | User profile | Available |

### Login (`/login`)
- Email/password authentication
- Two-factor authentication (2FA): setup, verify, disable, backup codes
- OTP verification and password reset flows
- Session stored in `localStorage` (token + user)

---

## Prerequisites

- **Node.js** 18+ (recommended: LTS)
- **npm** 9+
- Running **GlobalCare backend API** (see [Backend Integration](#backend-integration))

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd gc_admin_front
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Copy the example env file and set your values:

```bash
cp .env.example .env
```

Edit `.env` with your API URL and keys (see [Environment Variables](#environment-variables)).

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production build

```bash
npm run build
npm run preview   # preview production build locally
```

Build output is written to the `dist/` folder.

---

## Environment Variables

Create a `.env` file in the project root (see `.env.example`):

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL for all API requests | `http://localhost:4000/api` |
| `VITE_APP_NAME` | Application display name | `GC Frontend` |
| `VITE_APP_VERSION` | App version string | `1.0.0` |
| `VITE_PUBLIC_BUILDER_KEY` | Public builder/integration key | `your-key` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID (if used) | `your-client-id` |

> **Note:** Never commit `.env` to version control. It is listed in `.gitignore`.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server on port **3000** |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint on the project |

---

## Project Structure

```
gc_admin_front/
├── public/                    # Static assets (favicon, icons)
├── src/
│   ├── assets/                # Images (hero, logos)
│   ├── components/
│   │   ├── constants/
│   │   │   └── data.js        # Theme colors (C), specialties
│   │   ├── superadmin/        # Layout & feature components
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── HospitalModal.jsx
│   │   │   ├── DoctorModal.jsx
│   │   │   ├── PackageList.jsx
│   │   │   ├── PackageModal.jsx
│   │   │   ├── EmailTemplateModal.jsx
│   │   │   └── StatsCard.jsx
│   │   └── CustomFileUpload.jsx
│   ├── context/
│   │   ├── AuthContext.jsx    # User session, login/logout
│   │   └── AppContext.jsx     # Global app state (theme)
│   ├── layouts/
│   │   └── SuperAdminLayout.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── NotFound.jsx
│   │   └── superadmin/        # Feature pages
│   ├── routes/
│   │   └── index.jsx          # React Router configuration
│   ├── service/               # API service modules
│   │   ├── api.service.ts     # Axios instance + interceptors
│   │   ├── auth.service.js
│   │   ├── hospital.service.js
│   │   ├── doctor.service.js
│   │   ├── patient.service.js
│   │   ├── package.service.js
│   │   ├── emailTemplate.service.js
│   │   ├── role.service.js
│   │   ├── permission.service.js
│   │   ├── team.service.js
│   │   ├── condition.service.js
│   │   ├── dashboard.service.js
│   │   └── upload.service.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── .env.example
├── eslint.config.js
├── index.html
├── package.json
└── vite.config.js
```

Path alias: `@` → `./src` (configured in `vite.config.js`).

---

## Routing

Routes are defined in `src/routes/index.jsx` using `createBrowserRouter`:

| Path | Component | Layout |
|------|-----------|--------|
| `/login` | Login | Standalone |
| `/` | Dashboard | SuperAdminLayout |
| `/hospitals` | Hospitals | SuperAdminLayout |
| `/hospitals/:id/approve` | HospitalApproval | SuperAdminLayout |
| `/doctors` | Doctors | SuperAdminLayout |
| `/patients` | Patients | SuperAdminLayout |
| `/patients/:id` | PatientDetail | SuperAdminLayout |
| `/packages` | Packages | SuperAdminLayout |
| `/email-templates` | EmailTemplates | SuperAdminLayout |
| `/role-management` | RoleManagement | SuperAdminLayout |
| `/team-register` | TeamRegister | SuperAdminLayout |
| `/teams-conditions` | TeamsAndConditions | SuperAdminLayout |
| `/appointments` | Appointments | SuperAdminLayout |
| `/coordinators` | Coordinators | SuperAdminLayout |
| `/reports` | Reports | SuperAdminLayout |
| `/settings` | Settings | SuperAdminLayout |
| `/profile` | Profile | SuperAdminLayout |
| `*` | NotFound | Standalone |

---

## Authentication

### Flow
1. User submits credentials on `/login`.
2. On success, `AuthContext.login()` stores `token` and `user` in `localStorage`.
3. Axios request interceptor attaches `Authorization: Bearer <token>` to API calls.
4. On **401** from protected endpoints, storage is cleared and user is redirected to `/login`.

### Auth service endpoints (`auth.service.js`)
- `POST /auth/login` — Login
- `POST /auth/register` — Register
- `POST /auth/verifyOtp` — OTP verification
- `POST /auth/sendResetOtp` — Password reset OTP
- `POST /auth/resetPassword` — Reset password
- `GET /auth/me` — Current user profile
- `POST /auth/change-password` — Change password
- `POST /auth/2fa/setup` — Enable 2FA
- `POST /auth/2fa/verify-setup` — Confirm 2FA setup
- `POST /auth/2fa/verify` — 2FA login verification
- `POST /auth/2fa/disable` — Disable 2FA
- `GET /auth/2fa/backup-codes` — Fetch backup codes

### Context usage

```jsx
import { useAuth } from '@/context/AuthContext';

const { user, isAuthenticated, login, logout } = useAuth();
```

---

## API Layer

All authenticated requests go through `src/service/api.service.ts`:

- **Base URL:** `import.meta.env.VITE_API_URL`
- **Credentials:** `withCredentials: true` (cookie support)
- **Auth header:** Bearer token from `localStorage` / `sessionStorage`
- **Error handling:** 401 → clear session, toast, redirect to login

### Service modules

| Service | Main endpoints |
|---------|----------------|
| `dashboard.service` | `GET /analytics/admin-dashboard` |
| `hospital.service` | `GET/POST/PUT/DELETE /hospitals`, approve/activate/deactivate |
| `doctor.service` | `GET /doctors`, approve/reject/suspend, assign hospital |
| `patient.service` | `GET /patients/all`, `GET /patients/:id` |
| `package.service` | CRUD `/packages`, features, compare |
| `emailTemplate.service` | CRUD `/email-templates` |
| `role.service` | CRUD `/roles`, assign permissions, bulk assign |
| `permission.service` | CRUD `/permissions`, grant/revoke |
| `team.service` | `/teams`, `/users`, `POST /auth/create-user` |
| `condition.service` | CRUD `/conditions`, protocols, symptoms |
| `upload.service` | `POST /uploads` (multipart file upload) |

---

## UI & Theming

Theme tokens live in `src/components/constants/data.js`:

- **Primary:** Teal (`#0BB5A0`) and gold accents
- **Background:** White/light gray (`#FFFFFF`, `#F8F9FA`)
- **Semantic:** Green (success), red (error/danger), purple, blue, orange

Components use inline styles with the `C` color object for consistency. Tailwind CSS 4 is available via the Vite plugin for utility classes where used.

**Toast notifications** (Sonner) are configured in `App.jsx` with teal styling and top-right placement.

**Medical specialties** constant: Cardiology, Oncology, Dental, Orthopedics, Cosmetic Surgery, Fertility, Neurology, Eye Care, Hair Transplant, Transplant, Pediatrics, and more.

---

## Key Components

| Component | Purpose |
|-----------|---------|
| `Sidebar` | Fixed navigation, logout |
| `Header` | Top bar for super admin layout |
| `HospitalModal` | Create/view/edit hospital records |
| `DoctorModal` | Doctor profile management |
| `PackageList` / `PackageModal` | Package listing and editing |
| `EmailTemplateModal` | Email template editor |
| `CustomFileUpload` | File upload with validation |
| `StatsCard` | Reusable dashboard stat card |

---

## Backend Integration

This frontend is **API-driven** and does not include a backend. You need the GlobalCare API server running and reachable at `VITE_API_URL`.

**Default API base:** `http://localhost:4000/api`

Ensure the backend:
- Accepts `Authorization: Bearer <token>` headers
- Supports CORS for `http://localhost:3000` (dev)
- Implements the endpoints listed in the [API Layer](#api-layer) section

**File uploads** use `POST {API_BASE}/uploads` (see `upload.service.js`). Allowed types include JPEG, PNG, GIF, WebP, PDF, Word, Excel, TXT, ZIP, RAR (max ~10 MB per file).

---

## Development Notes

- **Package name** in `package.json` is currently `temp_app` — consider renaming to `gc-admin-front` for consistency.
- **Vite proxy** in `vite.config.js` proxies `/api` to `localhost:5173`; confirm this matches your backend setup or adjust as needed.
- Some sidebar menu items are **commented out** (Teams & Conditions, Appointments, Coordinators) but routes still exist.
- Mixed **JS/TS**: `api.service.ts` and `admin.service.ts` use TypeScript; most pages use `.jsx`.
- `admin.service.ts` is a placeholder stub — dashboard stats use `dashboard.service.js` instead.
- Patient update/delete paths in `patient.service.js` use `/api/v1/patients/` — verify alignment with your backend API versioning.

### Linting

```bash
npm run lint
```

ESLint is configured with recommended JS rules, React Hooks, and React Refresh plugins.

---

## License

Proprietary — **GlobalCare™ / IDAB Tech**. All rights reserved.

---

## Support

For backend API documentation, deployment, or environment-specific setup, contact your platform administrator or refer to the GlobalCare backend repository.
