# HiveCraft Digital - Wix Studio Migration Guide

This comprehensive guide provides everything needed to transfer the HiveCraft Digital platform to Wix Studio with Velo backend.

## Quick Start

This migration pack is organized into 6 focused guides:

| Guide | File | Description |
|-------|------|-------------|
| 1. Wix Members Setup | [01-wix-members-setup.md](./01-wix-members-setup.md) | Login modal, email verification, member roles |
| 2. Collections Schema | [02-collections-schema.md](./02-collections-schema.md) | All 10 database collections with field definitions |
| 3. Permission Rules | [03-permission-rules.md](./03-permission-rules.md) | Collection permissions and backend enforcement |
| 4. Backend Modules | [04-backend-modules.md](./04-backend-modules.md) | Complete .jsw module implementations |
| 5. Page Architecture | [05-page-architecture.md](./05-page-architecture.md) | Public, portal, and admin page structure |
| 6. Security Tests | [06-security-tests.md](./06-security-tests.md) | 15 security test cases with checklist |

---

## Overview

The HiveCraft Digital platform consists of three main areas:

1. **Public Marketing Site** - Accessible to all visitors (7 pages)
2. **Client Portal** (Members Area) - For logged-in clients viewing their projects (6 pages)
3. **Staff Back Office** (Admin Area) - For team members managing all projects (6 pages)

### Architecture Principles

- **Single Source of Truth**: All data stored in Wix Collections
- **Wix Members Authentication**: Built-in login/signup modal with email verification
- **Role-Based Access**: Permissions enforced at database level AND in backend code
- **Cross-Platform Ready**: Same backend serves web and future mobile app

---

## Authentication Strategy

### V1 Implementation (Current)

- **Wix Members** built-in login/signup modal
- **Email verification** required for new accounts
- **Member roles** stored in MemberRoles collection
- **No SMS verification** (future enhancement)

### How It Works

1. User clicks Login/Signup on marketing site
2. Wix Members modal appears (handled by Wix, not custom)
3. User registers with email or social login
4. Email verification sent automatically
5. Once verified, user can access portal
6. Staff roles assigned by admin through back office

---

## Database Collections

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| Projects | Core entity - client projects | clientMemberId, title, status, progressPercent |
| Milestones | Project phases/stages | projectId, name, status, order |
| Tasks | Granular work items (staff only) | projectId, milestoneId, assigneeUserId |
| Messages | Project communication | projectId, senderMemberId, message |
| Previews | Staging links for review | projectId, url, version, status |
| Files | Uploaded assets | projectId, fileUrl, fileName |
| ActivityLog | Audit trail | projectId, eventType, description |
| Invoices | Billing records | projectId, invoiceNumber, amount, status |
| MemberRoles | User role assignments | userId, role |
| TeamAssignments | Staff project assignments | projectId, userId, role |

See [02-collections-schema.md](./02-collections-schema.md) for complete field definitions.

---

## Member Roles

| Role | Access Level | Capabilities |
|------|--------------|--------------|
| Admin | Full | All features, all projects, user management |
| Project Manager | High | All projects, milestone management |
| Designer | Medium | Assigned projects, previews, files |
| Developer | Medium | Assigned projects, all technical features |
| Editor | Medium | Content updates, messaging |
| Billing | Medium | Invoice management, financial reports |
| Client | Limited | Own projects only |

---

## Backend Web Modules

All backend logic is implemented in `.jsw` files:

| Module | Key Functions |
|--------|---------------|
| authzService.jsw | getCurrentUserRole, isStaff, ensureProjectAccess |
| projectService.jsw | getMyProjects, getProject, createProject |
| milestoneService.jsw | getMilestones, completeMilestone |
| taskService.jsw | getProjectTasks, getMyTasks |
| messagingService.jsw | getMessages, sendMessage |
| previewService.jsw | getPreviews, approvePreview, requestRevision |
| fileService.jsw | getFiles, uploadFileRecord |
| activityService.jsw | logActivity, getActivityLog |
| invoiceService.jsw | getInvoices, createInvoice, markInvoicePaid |

See [04-backend-modules.md](./04-backend-modules.md) for complete implementations.

---

## Page Structure

### Public Pages (No Login Required)
- `/` - Home
- `/services` - Services
- `/process` - Process
- `/pricing` - Pricing
- `/portfolio` - Portfolio
- `/about` - About
- `/contact` - Contact

### Client Portal (Members Only)
- `/portal/dashboard` - Client Dashboard
- `/portal/projects` - My Projects
- `/portal/project/{id}` - Project Detail (tabs: Overview, Timeline, Previews, Files, Messages, Billing)
- `/portal/messages` - All Messages
- `/portal/files` - All Files
- `/portal/billing` - Billing & Invoices

### Staff Back Office (Members + Staff Role)
- `/admin/dashboard` - Staff Dashboard
- `/admin/projects` - All Projects
- `/admin/project/{id}` - Project Management
- `/admin/projects/new` - Create Project
- `/admin/clients` - Client Management
- `/admin/team` - Team Management (Admin only)

---

## Implementation Checklist

### Phase 1: Database Setup
- [ ] Create all 10 collections in Wix CMS
- [ ] Set up collection permissions
- [ ] Add indexes for optimization
- [ ] Test permissions with different member types

### Phase 2: Authentication
- [ ] Enable Wix Members Area
- [ ] Configure login/signup modal
- [ ] Enable email verification
- [ ] Create MemberRoles collection
- [ ] Set up role assignment backend

### Phase 3: Backend Modules
- [ ] Create authzService.jsw
- [ ] Create projectService.jsw
- [ ] Create milestoneService.jsw
- [ ] Create taskService.jsw
- [ ] Create messagingService.jsw
- [ ] Create previewService.jsw
- [ ] Create fileService.jsw
- [ ] Create activityService.jsw
- [ ] Create invoiceService.jsw
- [ ] Test all service functions

### Phase 4: Public Pages
- [ ] Create Home page
- [ ] Create Services page
- [ ] Create Process page
- [ ] Create Pricing page
- [ ] Create Portfolio page
- [ ] Create About page
- [ ] Create Contact page
- [ ] Set up navigation
- [ ] Add footer component

### Phase 5: Client Portal
- [ ] Create Portal Dashboard
- [ ] Create Projects List
- [ ] Create Project Detail with tabs
- [ ] Create Messages page
- [ ] Create Files page
- [ ] Create Billing page
- [ ] Wire up all backend calls

### Phase 6: Staff Back Office
- [ ] Create Admin Dashboard
- [ ] Create Projects Management
- [ ] Create Project Editor
- [ ] Create New Project form
- [ ] Create Client Management
- [ ] Create Team Management (Admin only)
- [ ] Implement role-based routing

### Phase 7: Security & Testing
- [ ] Run all 15 security test cases
- [ ] Test client isolation
- [ ] Test staff access controls
- [ ] Verify all permission rules
- [ ] User acceptance testing

### Phase 8: Launch
- [ ] Connect custom domain
- [ ] Configure SEO settings
- [ ] Enable site monitoring
- [ ] Go live!

---

## Brand Guidelines

### Colors
- **Primary (Gold)**: `#f4b41a` / HSL(43, 89%, 53%)
- **Background Dark**: `#141414` / HSL(0, 0%, 8%)
- **Card Background**: `#1c1c1c` / HSL(0, 0%, 11%)
- **Text Primary**: `#f2f0ed` / HSL(40, 10%, 95%)
- **Text Muted**: `#9a9892` / HSL(40, 8%, 60%)

### Typography
- **Headings**: Montserrat (Bold, Semibold)
- **Body**: Inter (Regular, Medium)
- **Mono**: JetBrains Mono (for versions, code)

### Design Pattern
- Hexagonal motif throughout
- Dark mode primary theme
- Minimal shadows, subtle borders
- Gold accent highlights

---

## Asset Folder Structure

```
/assets
  /images
    /logos
      - logo-dark.png
      - logo-light.png
      - favicon.ico
    /icons
      - hex-pattern.svg
    /marketing
      - hero-bg.jpg
      - placeholder-project.jpg
  /fonts
    - Montserrat-*.woff2
    - Inter-*.woff2
    - JetBrainsMono-*.woff2
```

---

## Support

For questions about this migration guide, contact the HiveCraft Digital development team.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | December 2024 | Initial release with full platform spec |
| 1.1 | December 2024 | Added Wix Members setup, email verification, detailed page architecture |
