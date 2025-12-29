# HiveCraft Digital - Architecture

## Overview

HiveCraft Digital is a full-stack web design and development agency platform built with Azure-first architecture. The platform consists of three main areas:

1. **Marketing Website** - Public pages showcasing services, pricing, and portfolio
2. **Client Portal** - Authenticated area for clients to track projects, view milestones, upload files
3. **Staff Back Office** - Admin dashboard for team members to manage all projects and clients

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Users                               │
│  (Clients, Staff, Public)                                  │
└────────────┬────────────────────────────────────────────────┘
             │
             ├─────────────┐
             │             │
┌────────────▼───┐    ┌────▼─────────────────────────────────┐
│  Static Web    │    │  App Service (Backend API)           │
│  App (React)   │◄───┤  - Express.js REST API               │
│  - Marketing   │    │  - OAuth authentication              │
│  - Client UI   │    │  - Project management                │
│  - Admin UI    │    │  - File upload handlers              │
└────────────────┘    └─────┬────────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
      ┌───────▼──────┐  ┌───▼─────┐  ┌───▼──────────────┐
      │ Azure SQL    │  │ Blob    │  │ Communication    │
      │ (PostgreSQL) │  │ Storage │  │ Services (SMS)   │
      │ - Users      │  │ - Files │  │ - Verification   │
      │ - Projects   │  │ - Images│  │ (optional)       │
      │ - Sessions   │  │         │  │                  │
      └──────────────┘  └─────────┘  └──────────────────┘
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | | |
| Framework | React 18 + TypeScript | Component-based UI |
| Build Tool | Vite | Fast dev server and bundling |
| Routing | wouter | Lightweight SPA routing |
| State | TanStack Query v5 | Server state & caching |
| UI Library | shadcn/ui | Accessible components |
| Styling | Tailwind CSS | Utility-first styling |
| **Backend** | | |
| Runtime | Node.js 20 | Server runtime |
| Framework | Express.js | REST API framework |
| Database ORM | Drizzle ORM | Type-safe database queries |
| **Authentication** | | |
| OAuth | Passport.js | OAuth 2.0 strategies |
| Social Login | Google, Facebook, GitHub | Third-party authentication |
| Sessions | express-session | PostgreSQL session store |
| Password | bcrypt | Secure password hashing |
| **Azure Services** | | |
| Frontend Host | Static Web Apps | Global CDN, auto-scaling |
| Backend Host | App Service | Managed Node.js hosting |
| Database | Azure SQL (PostgreSQL) | Managed database |
| File Storage | Blob Storage | Object storage for uploads |
| SMS (optional) | Communication Services | Phone verification |

## Directory Structure

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── marketing/     # Marketing site components (nav, footer, sections)
│   │   │   ├── portal/        # Portal layouts (client + staff)
│   │   │   └── ui/            # shadcn/ui base components
│   │   ├── hooks/             # Custom hooks (use-auth, use-toast, use-mobile)
│   │   ├── lib/               # Utilities (queryClient, utils, auth-utils)
│   │   └── pages/
│   │       ├── admin/         # Staff back office pages
│   │       ├── portal/        # Client portal pages
│   │       └── (marketing)    # Public pages (home, services, pricing)
├── server/
│   ├── index.ts               # Server entry point
│   ├── routes.ts              # Main routes registration
│   ├── routes/
│   │   └── projects.ts        # Project management API
│   ├── auth/
│   │   ├── oauth-config.ts    # Passport OAuth strategies
│   │   ├── routes.ts          # OAuth callback routes
│   │   ├── email-auth.ts      # Email/password middleware
│   │   └── sms-service.ts     # Azure SMS integration
│   ├── storage/
│   │   └── azure-blob.ts      # Azure Blob Storage service
│   ├── storage.ts             # Database operations
│   └── vite.ts                # Vite dev server integration
├── shared/
│   ├── schema.ts              # Drizzle schema (single source of truth)
│   └── models/
│       └── auth.ts            # User and session types
├── azure/
│   ├── infra/
│   │   └── infrastructure.bicep    # Azure infrastructure (IaC)
│   └── db/migrations/              # SQL migration scripts
├── .github/workflows/
│   └── azure-deploy.yml            # CI/CD pipeline
└── docs/
    ├── ARCHITECTURE.md        # This file
    ├── AUTH_SETUP.md          # Authentication setup guide
    ├── OAUTH_SMS_IMPLEMENTATION.md
    └── AUTH_QUICK_REFERENCE.md
    ├── TASKS.md               # Current TODOs
    └── wix-studio-migration/  # Wix Studio transfer guide
```

## Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `projects` | Client projects with status, type, tier, progress |
| `milestones` | Project stages with approval gates |
| `tasks` | Granular work items within milestones |
| `messages` | Project-scoped communication |
| `previews` | Staging links for client review |
| `files` | Uploaded assets |
| `activity_log` | Audit trail of all actions |
| `invoices` | Billing records |
| `member_roles` | Role-based access control |
| `team_assignments` | Staff assigned to projects |

### Key Relationships

```
User (Replit Auth)
  └── MemberRoles (client | admin | project_manager | designer | developer | editor | billing)
       └── Projects (via clientMemberId for clients, all for staff)
            ├── Milestones
            ├── Tasks
            ├── Messages
            ├── Previews
            ├── Files
            ├── Invoices
            └── ActivityLog
```

## Authentication Flow

1. User clicks "Login" → redirected to Replit Auth
2. After OAuth, user returned with session cookie
3. Session stored in PostgreSQL via connect-pg-simple
4. `useAuth()` hook fetches `/api/auth/user` for current user
5. `isStaff` check via `member_roles` table

## API Routes

### Public
- `GET /api/auth/user` - Current user info (or 401)
- `GET /api/auth/login` - Initiate OAuth flow
- `POST /api/auth/logout` - End session
- `POST /api/contact` - Contact form submission

### Client Portal (authenticated)
- `GET /api/projects` - User's projects (filtered by clientMemberId)
- `GET /api/projects/:id` - Single project (with access check)
- `GET /api/projects/:id/milestones` - Project milestones
- `GET /api/projects/:id/previews` - Preview links
- `GET /api/projects/:id/messages` - Message history
- `POST /api/projects/:id/messages` - Send message
- `GET /api/projects/:id/files` - Project files
- `GET /api/projects/:id/invoices` - Project invoices
- `PATCH /api/projects/:projectId/previews/:previewId` - Approve/reject preview

### Staff Back Office (staff only)
- `GET /api/admin/projects` - All projects
- `POST /api/admin/projects` - Create project
- `PATCH /api/admin/projects/:id` - Update project
- `POST /api/admin/projects/:id/milestones` - Add milestone
- `POST /api/admin/projects/:id/previews` - Add preview

## Security Model

### Client Isolation (Critical)
- Every client query filters by `clientMemberId === currentUser.id`
- `getProjectForClient()` in storage.ts enforces this
- Clients cannot access other clients' data

### Staff Access
- Staff roles checked via `member_roles` table
- Staff can access all projects
- `isStaff()` helper in routes.ts

### Permission Hierarchy
```
admin > project_manager > designer/developer/editor/billing > client
```

## Frontend Routing

### Marketing (public)
- `/` - Home
- `/services` - Services
- `/process` - Process
- `/pricing` - Pricing
- `/portfolio` - Portfolio
- `/about` - About
- `/contact` - Contact

### Portal (authenticated)
- `/portal` - Client dashboard
- `/portal/projects` - Projects list
- `/portal/projects/:id` - Project detail (6 tabs)

### Admin (staff only)
- `/admin` - Staff dashboard
- `/admin/projects` - All projects
- `/admin/projects/:id` - Project management
- `/admin/projects/new` - Create project

## Design System

- **Theme**: Dark mode primary (#141414 background)
- **Accent**: Gold (#f4b41a)
- **Fonts**: Montserrat (headings), Inter (body), JetBrains Mono (code)
- **Components**: shadcn/ui with custom theme tokens
- **Pattern**: Hexagonal motifs for brand identity

See `design_guidelines.md` for full specification.
