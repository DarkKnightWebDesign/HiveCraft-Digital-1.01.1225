# Wix Collections Schema

Complete schema definitions for all HiveCraft Digital collections in Wix CMS.

## Collection Overview

| Collection | Purpose | Records |
|------------|---------|---------|
| Projects | Core entity - client projects | Owned by clients |
| Milestones | Project phases/stages | Linked to projects |
| Tasks | Granular work items | Linked to projects/milestones |
| Messages | Project communication | Linked to projects |
| Previews | Staging links for review | Linked to projects |
| Files | Uploaded assets | Linked to projects |
| ActivityLog | Audit trail | Linked to projects |
| Invoices | Billing records | Linked to projects |
| MemberRoles | User role assignments | One per user |
| TeamAssignments | Staff project assignments | Many per project |

---

## Projects Collection

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | Text | Auto | Wix auto-generated ID |
| _owner | Text | Auto | Member who created (Wix system) |
| clientMemberId | Text | Yes | Client's member ID |
| title | Text | Yes | Project name |
| type | Text | Yes | managed_website, custom_website, online_store, web_app |
| tier | Text | Yes | launch, growth, scale |
| status | Text | Yes | discovery, design, build, launch, care, completed, on_hold |
| startDate | Date | No | When project started |
| targetLaunchDate | Date | No | Expected completion |
| progressPercent | Number | Yes | 0-100 completion percentage |
| summary | Text | No | Project description/notes |
| _createdDate | Date | Auto | Wix auto timestamp |
| _updatedDate | Date | Auto | Wix auto timestamp |

### Wix CMS Setup

```javascript
// Collection: Projects
{
  _id: "abc123",
  _owner: "member-id-123",
  clientMemberId: "member-id-123",
  title: "Artisan Coffee Website",
  type: "managed_website",
  tier: "growth",
  status: "design",
  startDate: new Date("2024-12-01"),
  targetLaunchDate: new Date("2025-02-15"),
  progressPercent: 35,
  summary: "Custom website for artisan coffee roaster...",
  _createdDate: new Date(),
  _updatedDate: new Date()
}
```

### Indexes

- `clientMemberId` - For filtering client's projects
- `status` - For filtering by project phase
- `_createdDate` - For sorting

---

## Milestones Collection

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | Text | Auto | Wix auto-generated ID |
| projectId | Reference | Yes | Link to Projects |
| name | Text | Yes | Milestone name |
| description | Text | No | Detailed description |
| status | Text | Yes | pending, in_progress, awaiting_approval, approved, completed |
| dueDate | Date | No | Target completion date |
| order | Number | Yes | Display order (0, 1, 2...) |
| approvalRequired | Boolean | Yes | Needs client sign-off |
| _createdDate | Date | Auto | When created |

### Wix CMS Setup

```javascript
// Collection: Milestones
{
  _id: "mile-001",
  projectId: "abc123",  // Reference to Projects
  name: "Discovery & Strategy",
  description: "Initial research and planning phase",
  status: "completed",
  dueDate: new Date("2024-12-08"),
  order: 0,
  approvalRequired: false,
  _createdDate: new Date()
}
```

---

## Tasks Collection

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | Text | Auto | Wix auto-generated ID |
| projectId | Reference | Yes | Link to Projects |
| milestoneId | Reference | No | Link to Milestones |
| title | Text | Yes | Task name |
| description | Text | No | Task details |
| assigneeRole | Text | No | designer, developer, etc. |
| assigneeUserId | Text | No | Specific staff member ID |
| status | Text | Yes | pending, in_progress, completed, blocked |
| dueDate | Date | No | Task deadline |
| _createdDate | Date | Auto | When created |

### Wix CMS Setup

```javascript
// Collection: Tasks
{
  _id: "task-001",
  projectId: "abc123",
  milestoneId: "mile-002",
  title: "Design homepage mockup",
  description: "Create initial homepage design with hero section",
  assigneeRole: "designer",
  assigneeUserId: "staff-member-456",
  status: "in_progress",
  dueDate: new Date("2024-12-15"),
  _createdDate: new Date()
}
```

---

## Messages Collection

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | Text | Auto | Wix auto-generated ID |
| projectId | Reference | Yes | Link to Projects |
| senderMemberId | Text | Yes | Who sent the message |
| senderRole | Text | Yes | client, admin, project_manager, etc. |
| message | Text | Yes | Message content |
| attachments | Array | No | File URLs |
| _createdDate | Date | Auto | Timestamp |

### Wix CMS Setup

```javascript
// Collection: Messages
{
  _id: "msg-001",
  projectId: "abc123",
  senderMemberId: "member-id-123",
  senderRole: "client",
  message: "I love the initial designs! Can we try a warmer color palette?",
  attachments: [],
  _createdDate: new Date()
}
```

---

## Previews Collection

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | Text | Auto | Wix auto-generated ID |
| projectId | Reference | Yes | Link to Projects |
| url | URL | Yes | Preview staging URL |
| label | Text | Yes | "Homepage Design", "Mobile View", etc. |
| notes | Text | No | Designer notes |
| version | Text | Yes | v1.0, v1.1, v2.0, etc. |
| status | Text | Yes | draft, ready, approved, rejected, revision_requested |
| feedback | Text | No | Client feedback |
| _createdDate | Date | Auto | When created |
| _updatedDate | Date | Auto | Last modified |

### Wix CMS Setup

```javascript
// Collection: Previews
{
  _id: "prev-001",
  projectId: "abc123",
  url: "https://preview.hivecraft.dev/proj-abc/homepage-v1",
  label: "Homepage Design",
  notes: "Initial design with hero section and about preview",
  version: "v1.0",
  status: "ready",
  feedback: null,
  _createdDate: new Date(),
  _updatedDate: new Date()
}
```

---

## Files Collection

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | Text | Auto | Wix auto-generated ID |
| projectId | Reference | Yes | Link to Projects |
| uploadedByMemberId | Text | Yes | Who uploaded |
| fileUrl | URL | Yes | Wix Media URL |
| fileName | Text | Yes | Original filename |
| fileType | Text | Yes | MIME type |
| fileSize | Number | No | Size in bytes |
| label | Text | No | Description/category |
| _createdDate | Date | Auto | Upload timestamp |

### Wix CMS Setup

```javascript
// Collection: Files
{
  _id: "file-001",
  projectId: "abc123",
  uploadedByMemberId: "member-id-123",
  fileUrl: "wix:image://v1/abc123/logo.png",
  fileName: "company-logo.png",
  fileType: "image/png",
  fileSize: 245000,
  label: "Brand Assets",
  _createdDate: new Date()
}
```

---

## ActivityLog Collection

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | Text | Auto | Wix auto-generated ID |
| projectId | Reference | Yes | Link to Projects |
| eventType | Text | Yes | Event identifier |
| description | Text | Yes | Human-readable description |
| actorMemberId | Text | Yes | Who performed action |
| metadata | Object | No | Additional data |
| _createdDate | Date | Auto | Event timestamp |

### Event Types

| Event Type | Description |
|------------|-------------|
| project_created | New project started |
| project_updated | Project details changed |
| status_changed | Project status changed |
| milestone_completed | Milestone marked complete |
| preview_created | New preview posted |
| preview_approved | Client approved preview |
| preview_revision | Client requested changes |
| message_sent | New message in thread |
| file_uploaded | File added to project |
| invoice_sent | Invoice sent to client |
| invoice_paid | Payment received |

### Wix CMS Setup

```javascript
// Collection: ActivityLog
{
  _id: "log-001",
  projectId: "abc123",
  eventType: "preview_approved",
  description: "Client approved Homepage Design (v1.0)",
  actorMemberId: "member-id-123",
  metadata: { previewId: "prev-001", version: "v1.0" },
  _createdDate: new Date()
}
```

---

## Invoices Collection

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | Text | Auto | Wix auto-generated ID |
| projectId | Reference | Yes | Link to Projects |
| invoiceNumber | Text | Yes | Unique invoice ID (HC-2024-001) |
| amount | Number | Yes | Amount in cents |
| status | Text | Yes | draft, sent, paid, overdue, cancelled |
| dueDate | Date | No | Payment due date |
| paidDate | Date | No | When paid |
| url | URL | No | Link to invoice PDF/page |
| _createdDate | Date | Auto | Invoice created |

### Wix CMS Setup

```javascript
// Collection: Invoices
{
  _id: "inv-001",
  projectId: "abc123",
  invoiceNumber: "HC-2024-001",
  amount: 150000,  // $1,500.00 in cents
  status: "paid",
  dueDate: new Date("2024-12-15"),
  paidDate: new Date("2024-12-10"),
  url: "https://invoices.hivecraft.dev/HC-2024-001",
  _createdDate: new Date()
}
```

---

## MemberRoles Collection

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | Text | Auto | Wix auto-generated ID |
| userId | Text | Yes | Wix member ID |
| role | Text | Yes | client, admin, project_manager, designer, developer, editor, billing |
| assignedBy | Text | No | Admin who assigned role |
| assignedAt | Date | No | When role was assigned |
| _createdDate | Date | Auto | Record created |

### Role Values

| Role | Access Level |
|------|--------------|
| client | View own projects only |
| admin | Full access to everything |
| project_manager | All projects, milestones, messaging |
| designer | Assigned projects, previews, files |
| developer | Assigned projects, all technical features |
| editor | Content updates, messaging |
| billing | Invoices, financial data |

### Wix CMS Setup

```javascript
// Collection: MemberRoles
{
  _id: "role-001",
  userId: "member-id-456",
  role: "project_manager",
  assignedBy: "admin-member-id",
  assignedAt: new Date(),
  _createdDate: new Date()
}
```

---

## TeamAssignments Collection

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | Text | Auto | Wix auto-generated ID |
| projectId | Reference | Yes | Link to Projects |
| userId | Text | Yes | Staff member ID |
| role | Text | Yes | Their role on this project |
| _createdDate | Date | Auto | Assignment created |

### Wix CMS Setup

```javascript
// Collection: TeamAssignments
{
  _id: "assign-001",
  projectId: "abc123",
  userId: "staff-member-789",
  role: "designer",
  _createdDate: new Date()
}
```

---

## Creating Collections in Wix Studio

### Step-by-Step

1. Go to **CMS** in left sidebar
2. Click **+ Add Collection**
3. Name the collection (e.g., "Projects")
4. Add each field with correct type:
   - Text for strings
   - Number for integers
   - Date and Time for dates
   - Reference for foreign keys
   - Object for JSON/metadata
5. Set primary display field
6. Configure permissions (see next guide)

### Reference Fields

When creating reference fields (like `projectId`):
1. Select field type: **Reference**
2. Choose the referenced collection
3. Display field: Usually `title` or `name`

### Best Practices

- Use consistent naming (camelCase for fields)
- Add `_createdDate` to all collections
- Create indexes for frequently queried fields
- Use References instead of storing IDs as text when possible
