# HiveCraft Digital - Architecture

## Overview

HiveCraft Digital is a web design and development agency platform with three main areas:

1. **Marketing Website** - Public pages showcasing services
2. **Client Portal** - Authenticated area for clients to track their projects
3. **Staff Back Office** - Admin dashboard for team members

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Routing | wouter |
| State | TanStack Query v5 |
| UI Components | shadcn/ui (Radix primitives) |
| Styling | Tailwind CSS |
| Backend | Express.js + Node.js |
| Database | PostgreSQL + Drizzle ORM |
| Auth | Replit Auth (OpenID Connect) |
| Sessions | express-session + connect-pg-simple |

## Directory Structure

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── marketing/     # Marketing site components (nav, footer, sections)
│   │   │   ├── portal/        # Portal layouts (client + staff)
│   │   │   └── ui/            # shadcn/ui base components
│   │   ├── hooks/             # Custom hooks (use-auth, use-toast, use-mobile)
│   │   ├── lib/               # Utilities (queryClient, utils)
│   │   └── pages/
│   │       ├── marketing/     # Public pages (home, services, pricing, etc.)
│   │       └── portal/        # Authenticated pages (dashboard, projects)
├── server/
│   ├── index.ts               # Server entry point
│   ├── routes.ts              # All API endpoints
│   ├── storage.ts             # Database operations interface
│   ├── auth.ts                # Replit Auth setup
│   └── vite.ts                # Vite dev server integration
├── shared/
│   └── schema.ts              # Drizzle schema + types (single source of truth)
└── docs/
    ├── ARCHITECTURE.md        # This file
    ├── WORKFLOW.md            # How to run/test/deploy
    ├── CHANGELOG.md           # Change history
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
