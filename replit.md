# HiveCraft Digital Platform

## Overview

HiveCraft Digital is a comprehensive web design and development agency platform consisting of:

1. **Marketing Website** - Public-facing site showcasing services, process, pricing, portfolio
2. **Client Portal** - Members-only area for clients to track their projects
3. **Staff Back Office** - Admin dashboard for team members to manage all projects

## Current State

The platform is built with React/Node.js and designed for future migration to Wix Studio. All authentication uses Replit Auth, and data is stored in PostgreSQL.

## Architecture

### Frontend (React + Vite)
- **Framework**: React 18 with TypeScript
- **Routing**: wouter
- **State Management**: TanStack Query
- **UI Components**: shadcn/ui (Radix primitives)
- **Styling**: Tailwind CSS with custom HiveCraft theme

### Backend (Express + Node.js)
- **API**: REST endpoints with Express
- **Authentication**: Replit Auth (OpenID Connect)
- **Database**: PostgreSQL with Drizzle ORM
- **Session**: Express session with PostgreSQL store

### Database Schema
- **Projects**: Core entity linking clients to their work
- **Milestones**: Project stages with approval gates
- **Tasks**: Granular work items
- **Messages**: Project-scoped communication
- **Previews**: Staging links for client review
- **Files**: Uploaded assets
- **ActivityLog**: Audit trail
- **Invoices**: Billing records
- **MemberRoles**: Role-based access control
- **TeamAssignments**: Staff assigned to projects

## Key Files

### Frontend
- `client/src/App.tsx` - Main router and providers
- `client/src/index.css` - Theme variables and custom utilities
- `client/src/components/marketing/` - Marketing site components
- `client/src/components/portal/` - Portal layouts (client + staff)
- `client/src/pages/` - All page components

### Backend
- `server/routes.ts` - API endpoints
- `server/storage.ts` - Database operations
- `shared/schema.ts` - Drizzle schema and types

### Documentation
- `design_guidelines.md` - Brand and design system
- `docs/wix-studio-migration/` - Wix Studio transfer guide

## Recent Changes

- **December 2024**: Initial platform build
  - Complete marketing website (7 pages)
  - Client portal with project management
  - Staff back office with admin dashboard
  - Role-based access control
  - Wix Studio migration documentation

## User Preferences

- **Theme**: Dark mode is primary (HiveCraft brand)
- **Colors**: Dark charcoal (#141414) + Gold accents (#f4b41a)
- **Fonts**: Montserrat (headings), Inter (body), JetBrains Mono (code)
- **Pattern**: Hexagonal motif for brand consistency

## Running the Project

```bash
npm run dev     # Start development server
npm run db:push # Push schema to database
```

The app runs on port 5000 with hot reload enabled.

## Security Model

- **Client Isolation**: Clients can ONLY see their own projects
- **Staff Access**: Staff roles can view/manage all projects
- **Permission Check**: Every API route validates access via `ensureProjectAccess()`
- **Role Hierarchy**: admin > project_manager > designer/developer/editor/billing > client
