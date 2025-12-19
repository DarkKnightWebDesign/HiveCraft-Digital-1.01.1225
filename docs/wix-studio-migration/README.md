# HiveCraft Digital - Wix Studio Migration Guide

This comprehensive guide provides everything needed to transfer the HiveCraft Digital platform to Wix Studio with Velo backend.

## Table of Contents

1. [Overview](#overview)
2. [Database Collections](#database-collections)
3. [Permissions Matrix](#permissions-matrix)
4. [Backend Web Modules (.jsw)](#backend-web-modules)
5. [Page Architecture](#page-architecture)
6. [Member Roles Setup](#member-roles-setup)
7. [Step-by-Step Implementation Checklist](#step-by-step-implementation-checklist)
8. [Security Test Plan](#security-test-plan)

---

## Overview

The HiveCraft Digital platform consists of three main areas:

1. **Public Marketing Site** - Accessible to all visitors
2. **Client Portal** (Members Area) - For logged-in clients viewing their projects
3. **Staff Back Office** (Admin Area) - For team members managing all projects

### Architecture Principles

- **Single Source of Truth**: All data stored in Wix Collections
- **Role-Based Access**: Permissions enforced at database level
- **Cross-Platform Ready**: Same backend serves web and future mobile app

---

## Database Collections

### Projects Collection
```javascript
// Collection: Projects
{
  _id: String,                    // Auto-generated
  _owner: String,                 // Wix member ID (client)
  clientMemberId: String,         // Client's member ID
  title: String,                  // Project name
  type: String,                   // "managed_website" | "custom_website" | "online_store" | "web_app"
  tier: String,                   // "launch" | "growth" | "scale"
  status: String,                 // "discovery" | "design" | "build" | "launch" | "care" | "completed" | "on_hold"
  startDate: Date,
  targetLaunchDate: Date,
  progressPercent: Number,        // 0-100
  summary: String,
  _createdDate: Date,
  _updatedDate: Date
}
```

### Milestones Collection
```javascript
// Collection: Milestones
{
  _id: String,
  projectId: String,              // Reference to Projects
  name: String,
  description: String,
  status: String,                 // "pending" | "in_progress" | "awaiting_approval" | "approved" | "completed"
  dueDate: Date,
  order: Number,
  approvalRequired: Boolean,
  _createdDate: Date
}
```

### Tasks Collection
```javascript
// Collection: Tasks
{
  _id: String,
  projectId: String,              // Reference to Projects
  milestoneId: String,            // Reference to Milestones (optional)
  title: String,
  description: String,
  assigneeRole: String,           // Staff role
  assigneeUserId: String,         // Specific assignee
  status: String,                 // "pending" | "in_progress" | "completed" | "blocked"
  dueDate: Date,
  _createdDate: Date
}
```

### Messages Collection
```javascript
// Collection: Messages
{
  _id: String,
  projectId: String,              // Reference to Projects
  senderMemberId: String,         // Who sent it
  senderRole: String,             // "client" | "admin" | "project_manager" | etc.
  message: String,
  attachments: Array<String>,     // File URLs
  _createdDate: Date
}
```

### Previews Collection
```javascript
// Collection: Previews
{
  _id: String,
  projectId: String,              // Reference to Projects
  url: String,                    // Preview URL
  label: String,                  // "Homepage Design" etc.
  notes: String,
  version: String,                // "v1.0", "v1.1", etc.
  status: String,                 // "draft" | "ready" | "approved" | "rejected" | "revision_requested"
  feedback: String,               // Client feedback
  _createdDate: Date,
  _updatedDate: Date
}
```

### Files Collection
```javascript
// Collection: Files
{
  _id: String,
  projectId: String,              // Reference to Projects
  uploadedByMemberId: String,
  fileUrl: String,
  fileName: String,
  fileType: String,               // MIME type
  fileSize: Number,               // Bytes
  label: String,                  // Optional description
  _createdDate: Date
}
```

### ActivityLog Collection
```javascript
// Collection: ActivityLog
{
  _id: String,
  projectId: String,              // Reference to Projects
  eventType: String,              // "project_created", "milestone_completed", etc.
  description: String,
  actorMemberId: String,          // Who performed the action
  metadata: Object,               // Additional data
  _createdDate: Date
}
```

### Invoices Collection
```javascript
// Collection: Invoices
{
  _id: String,
  projectId: String,              // Reference to Projects
  invoiceNumber: String,          // Unique
  amount: Number,                 // Cents
  status: String,                 // "draft" | "sent" | "paid" | "overdue" | "cancelled"
  dueDate: Date,
  paidDate: Date,
  url: String,                    // Link to invoice
  _createdDate: Date
}
```

### MemberRoles Collection
```javascript
// Collection: MemberRoles
{
  _id: String,
  userId: String,                 // Wix member ID
  role: String,                   // "client" | "admin" | "project_manager" | "designer" | "developer" | "editor" | "billing"
  _createdDate: Date
}
```

### TeamAssignments Collection
```javascript
// Collection: TeamAssignments
{
  _id: String,
  projectId: String,              // Reference to Projects
  userId: String,                 // Staff member ID
  role: String,                   // Their role on this project
  _createdDate: Date
}
```

---

## Permissions Matrix

### Collection Permissions Table

| Collection | Anyone | Site Member | Site Member Author | Admin |
|------------|--------|-------------|-------------------|-------|
| Projects | Read (public fields only) | Read own | Create, Update, Delete own | Full |
| Milestones | - | Read (via project) | - | Full |
| Tasks | - | - | - | Full |
| Messages | - | Read/Create (via project) | - | Full |
| Previews | - | Read/Update status (via project) | - | Full |
| Files | - | Read/Create (via project) | - | Full |
| ActivityLog | - | Read (via project) | - | Full |
| Invoices | - | Read (via project) | - | Full |
| MemberRoles | - | Read own | Update own | Full |
| TeamAssignments | - | - | - | Full |

### Critical Permission Rules

1. **Projects**: `clientMemberId == currentMemberId` for client access
2. **All project-related data**: Verify project ownership before allowing access
3. **Staff access**: Check MemberRoles for non-client roles
4. **Never expose**: Other clients' project data

---

## Backend Web Modules

### authzService.jsw
```javascript
// backend/authzService.jsw
import wixUsers from 'wix-users-backend';
import wixData from 'wix-data';

export async function getCurrentUserRole() {
  const userId = wixUsers.currentUser.id;
  if (!userId) return null;
  
  const result = await wixData.query("MemberRoles")
    .eq("userId", userId)
    .find({ suppressAuth: true });
  
  return result.items.length > 0 ? result.items[0].role : "client";
}

export async function isStaff() {
  const role = await getCurrentUserRole();
  return role && role !== "client";
}

export async function canAccessProject(projectId) {
  const userId = wixUsers.currentUser.id;
  if (!userId) return false;
  
  // Staff can access all
  if (await isStaff()) return true;
  
  // Clients can only access their own
  const project = await wixData.get("Projects", projectId, { suppressAuth: true });
  return project && project.clientMemberId === userId;
}

export async function ensureProjectAccess(projectId) {
  const canAccess = await canAccessProject(projectId);
  if (!canAccess) {
    throw new Error("Access denied");
  }
}
```

### projectService.jsw
```javascript
// backend/projectService.jsw
import wixData from 'wix-data';
import wixUsers from 'wix-users-backend';
import { isStaff, ensureProjectAccess } from 'backend/authzService';
import { logActivity } from 'backend/activityService';

export async function getMyProjects() {
  const userId = wixUsers.currentUser.id;
  if (!userId) throw new Error("Not authenticated");
  
  if (await isStaff()) {
    return wixData.query("Projects")
      .descending("_createdDate")
      .find({ suppressAuth: true });
  }
  
  return wixData.query("Projects")
    .eq("clientMemberId", userId)
    .descending("_createdDate")
    .find({ suppressAuth: true });
}

export async function getProject(projectId) {
  await ensureProjectAccess(projectId);
  return wixData.get("Projects", projectId, { suppressAuth: true });
}

export async function createProject(projectData) {
  if (!(await isStaff())) throw new Error("Staff only");
  
  const result = await wixData.insert("Projects", projectData, { suppressAuth: true });
  
  await logActivity({
    projectId: result._id,
    eventType: "project_created",
    description: `Project "${result.title}" was created`
  });
  
  return result;
}

export async function updateProject(projectId, updates) {
  if (!(await isStaff())) throw new Error("Staff only");
  
  const existing = await wixData.get("Projects", projectId, { suppressAuth: true });
  const updated = { ...existing, ...updates, _updatedDate: new Date() };
  
  await wixData.update("Projects", updated, { suppressAuth: true });
  
  await logActivity({
    projectId,
    eventType: "project_updated",
    description: "Project was updated"
  });
  
  return updated;
}

export async function getMilestones(projectId) {
  await ensureProjectAccess(projectId);
  
  return wixData.query("Milestones")
    .eq("projectId", projectId)
    .ascending("order")
    .find({ suppressAuth: true });
}

export async function getPreviews(projectId) {
  await ensureProjectAccess(projectId);
  
  return wixData.query("Previews")
    .eq("projectId", projectId)
    .descending("_createdDate")
    .find({ suppressAuth: true });
}

export async function getFiles(projectId) {
  await ensureProjectAccess(projectId);
  
  return wixData.query("Files")
    .eq("projectId", projectId)
    .descending("_createdDate")
    .find({ suppressAuth: true });
}

export async function getInvoices(projectId) {
  await ensureProjectAccess(projectId);
  
  return wixData.query("Invoices")
    .eq("projectId", projectId)
    .descending("_createdDate")
    .find({ suppressAuth: true });
}
```

### messagingService.jsw
```javascript
// backend/messagingService.jsw
import wixData from 'wix-data';
import wixUsers from 'wix-users-backend';
import { ensureProjectAccess, getCurrentUserRole } from 'backend/authzService';
import { logActivity } from 'backend/activityService';

export async function getMessages(projectId) {
  await ensureProjectAccess(projectId);
  
  return wixData.query("Messages")
    .eq("projectId", projectId)
    .ascending("_createdDate")
    .find({ suppressAuth: true });
}

export async function sendMessage(projectId, message) {
  await ensureProjectAccess(projectId);
  
  const userId = wixUsers.currentUser.id;
  const role = await getCurrentUserRole();
  
  const newMessage = {
    projectId,
    senderMemberId: userId,
    senderRole: role || "client",
    message,
    attachments: []
  };
  
  const result = await wixData.insert("Messages", newMessage, { suppressAuth: true });
  
  await logActivity({
    projectId,
    eventType: "message_sent",
    description: "New message sent"
  });
  
  return result;
}
```

### previewService.jsw
```javascript
// backend/previewService.jsw
import wixData from 'wix-data';
import wixUsers from 'wix-users-backend';
import { ensureProjectAccess, isStaff } from 'backend/authzService';
import { logActivity } from 'backend/activityService';

export async function createPreview(projectId, previewData) {
  if (!(await isStaff())) throw new Error("Staff only");
  
  const preview = {
    ...previewData,
    projectId,
    status: "draft",
    version: previewData.version || "v1.0"
  };
  
  const result = await wixData.insert("Previews", preview, { suppressAuth: true });
  
  await logActivity({
    projectId,
    eventType: "preview_created",
    description: `Preview "${preview.label}" (${preview.version}) was posted`
  });
  
  return result;
}

export async function updatePreviewStatus(projectId, previewId, status, feedback) {
  await ensureProjectAccess(projectId);
  
  const preview = await wixData.get("Previews", previewId, { suppressAuth: true });
  if (preview.projectId !== projectId) throw new Error("Invalid preview");
  
  preview.status = status;
  if (feedback) preview.feedback = feedback;
  preview._updatedDate = new Date();
  
  await wixData.update("Previews", preview, { suppressAuth: true });
  
  await logActivity({
    projectId,
    eventType: "preview_status_changed",
    description: `Preview "${preview.label}" status changed to ${status}`
  });
  
  return preview;
}

export async function approvePreview(projectId, previewId, feedback) {
  return updatePreviewStatus(projectId, previewId, "approved", feedback);
}

export async function requestRevision(projectId, previewId, feedback) {
  return updatePreviewStatus(projectId, previewId, "revision_requested", feedback);
}
```

### fileService.jsw
```javascript
// backend/fileService.jsw
import wixData from 'wix-data';
import wixUsers from 'wix-users-backend';
import { ensureProjectAccess } from 'backend/authzService';
import { logActivity } from 'backend/activityService';

export async function uploadFile(projectId, fileData) {
  await ensureProjectAccess(projectId);
  
  const userId = wixUsers.currentUser.id;
  
  const file = {
    projectId,
    uploadedByMemberId: userId,
    fileUrl: fileData.url,
    fileName: fileData.name,
    fileType: fileData.mimeType,
    fileSize: fileData.size,
    label: fileData.label || null
  };
  
  const result = await wixData.insert("Files", file, { suppressAuth: true });
  
  await logActivity({
    projectId,
    eventType: "file_uploaded",
    description: `File "${file.fileName}" was uploaded`
  });
  
  return result;
}

export async function deleteFile(projectId, fileId) {
  await ensureProjectAccess(projectId);
  
  const file = await wixData.get("Files", fileId, { suppressAuth: true });
  if (file.projectId !== projectId) throw new Error("Invalid file");
  
  await wixData.remove("Files", fileId, { suppressAuth: true });
  
  await logActivity({
    projectId,
    eventType: "file_deleted",
    description: `File "${file.fileName}" was deleted`
  });
}
```

### activityService.jsw
```javascript
// backend/activityService.jsw
import wixData from 'wix-data';
import wixUsers from 'wix-users-backend';

export async function logActivity(data) {
  const userId = wixUsers.currentUser.id;
  
  const entry = {
    projectId: data.projectId,
    eventType: data.eventType,
    description: data.description,
    actorMemberId: userId,
    metadata: data.metadata || {}
  };
  
  return wixData.insert("ActivityLog", entry, { suppressAuth: true });
}

export async function getActivityLog(projectId) {
  return wixData.query("ActivityLog")
    .eq("projectId", projectId)
    .descending("_createdDate")
    .limit(50)
    .find({ suppressAuth: true });
}
```

---

## Page Architecture

### Public Pages (No Authentication Required)
- `/` - Home
- `/services` - Services
- `/process` - Process
- `/pricing` - Pricing
- `/portfolio` - Portfolio / Work
- `/about` - About Us
- `/contact` - Contact

### Members Area (Client Portal)
- `/account/my-account` - Client Dashboard
- `/account/projects` - My Projects List
- `/account/projects/{id}` - Project Detail
- `/account/messages` - All Messages
- `/account/files` - All Files
- `/account/billing` - Billing & Invoices

### Staff-Only Pages (Back Office)
- `/admin` - Staff Dashboard
- `/admin/projects` - All Projects
- `/admin/projects/{id}` - Project Management
- `/admin/projects/new` - Create Project
- `/admin/clients` - Client Management
- `/admin/team` - Team Management
- `/admin/settings` - Settings

---

## Member Roles Setup

### Wix Members App Configuration

1. Enable Members Area in Wix Dashboard
2. Create custom member fields:
   - `role` (Text): Store member role
   
### Role Hierarchy

| Role | Access Level | Capabilities |
|------|--------------|--------------|
| Admin | Full | All features, all projects, user management |
| Project Manager | High | All projects, milestone management |
| Designer | Medium | Assigned projects, previews, files |
| Developer | Medium | Assigned projects, all technical features |
| Editor | Medium | Content updates, messaging |
| Billing | Medium | Invoice management, financial reports |
| Client | Limited | Own projects only |

### Setting Up Roles in Wix

```javascript
// Page code for admin role assignment
import { assignRole } from 'backend/roleService';

$w.onReady(function () {
  $w("#roleDropdown").onChange(async () => {
    const userId = $w("#userSelector").value;
    const role = $w("#roleDropdown").value;
    
    await assignRole(userId, role);
    $w("#statusText").text = "Role updated successfully";
  });
});
```

---

## Step-by-Step Implementation Checklist

### Phase 1: Database Setup
- [ ] Create all 10 collections in Wix CMS
- [ ] Set up collection permissions as per matrix
- [ ] Add indexes for query optimization (projectId, clientMemberId, status)
- [ ] Test collection permissions with different member types

### Phase 2: Backend Modules
- [ ] Create `backend/authzService.jsw`
- [ ] Create `backend/projectService.jsw`
- [ ] Create `backend/messagingService.jsw`
- [ ] Create `backend/previewService.jsw`
- [ ] Create `backend/fileService.jsw`
- [ ] Create `backend/activityService.jsw`
- [ ] Test all service functions

### Phase 3: Public Pages
- [ ] Create Home page with hero section
- [ ] Create Services page
- [ ] Create Process page
- [ ] Create Pricing page
- [ ] Create Portfolio page
- [ ] Create About page
- [ ] Create Contact page with form
- [ ] Set up navigation menu
- [ ] Add footer component

### Phase 4: Members Area
- [ ] Enable Members Area app
- [ ] Create client dashboard page
- [ ] Create projects list page
- [ ] Create project detail page with tabs
- [ ] Create messages page
- [ ] Create files page
- [ ] Create billing page
- [ ] Wire up all backend service calls

### Phase 5: Staff Back Office
- [ ] Create admin dashboard page
- [ ] Create admin projects list
- [ ] Create project management page
- [ ] Create new project form
- [ ] Create client management page
- [ ] Implement role-based routing
- [ ] Add "Create Preview" functionality
- [ ] Add milestone management

### Phase 6: Security & Testing
- [ ] Run security test plan
- [ ] Test client isolation
- [ ] Test staff access controls
- [ ] Verify all permission rules
- [ ] Load testing
- [ ] User acceptance testing

### Phase 7: Launch
- [ ] Connect custom domain
- [ ] Set up SSL
- [ ] Configure SEO settings
- [ ] Enable site monitoring
- [ ] Create backup schedule
- [ ] Go live!

---

## Security Test Plan

### Test Case 1: Client Isolation
**Objective**: Verify clients cannot access other clients' data

1. Create two test client accounts (Client A, Client B)
2. Create projects for each client
3. Log in as Client A
4. Attempt to access Client B's project by ID
5. **Expected**: Access denied / 404

### Test Case 2: Client Cannot Access Admin Routes
**Objective**: Verify clients cannot access staff pages

1. Log in as a client
2. Navigate directly to `/admin`
3. **Expected**: Redirect to client portal or access denied

### Test Case 3: Staff Access Validation
**Objective**: Verify staff can access all projects

1. Create a staff account (Project Manager role)
2. Log in as staff member
3. View all projects list
4. **Expected**: Can see all clients' projects

### Test Case 4: Preview Approval Flow
**Objective**: Verify only project owner can approve previews

1. Staff creates preview for Client A's project
2. Client B attempts to approve/reject the preview
3. **Expected**: Access denied

### Test Case 5: Message Security
**Objective**: Verify messages only visible to project participants

1. Client A sends message on their project
2. Client B attempts to view that project's messages
3. **Expected**: Access denied

### Test Case 6: File Access Control
**Objective**: Verify files are protected

1. Client A uploads file to their project
2. Get the file URL
3. Client B attempts to access file URL directly
4. **Expected**: Access denied (use Wix Media protected files)

### Test Case 7: Direct API Bypass Attempt
**Objective**: Verify backend services validate access

1. Use browser dev tools to call backend functions directly
2. Attempt to pass a different projectId
3. **Expected**: Access denied from authzService

### Test Case 8: Role Escalation Prevention
**Objective**: Verify clients cannot make themselves staff

1. Log in as client
2. Attempt to modify own MemberRoles record
3. **Expected**: Collection permissions prevent update

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

## Brand Guidelines Reference

- **Primary Color (Gold)**: `#f4b41a` / HSL(43, 89%, 53%)
- **Background Dark**: `#141414` / HSL(0, 0%, 8%)
- **Card Background**: `#1c1c1c` / HSL(0, 0%, 11%)
- **Text Primary**: `#f2f0ed` / HSL(40, 10%, 95%)
- **Text Muted**: `#9a9892` / HSL(40, 8%, 60%)
- **Heading Font**: Montserrat (Bold, Semibold)
- **Body Font**: Inter (Regular, Medium)
- **Mono Font**: JetBrains Mono (for versions, code)

---

## Support & Maintenance

For questions about this migration guide or the React prototype, contact the HiveCraft Digital development team.

**Document Version**: 1.0  
**Last Updated**: December 2024
