# Permission Rules

Comprehensive permission configuration for all HiveCraft Digital collections.

## Permission Principles

1. **Client Isolation**: Clients can ONLY see their own projects and related data
2. **Staff Access**: Staff roles can view/manage projects based on their role
3. **Backend Enforcement**: Always use `{ suppressAuth: true }` in .jsw files with manual checks
4. **Defense in Depth**: Permissions at collection level AND in backend code

---

## Collection Permission Matrix

| Collection | Anyone | Site Member | Member Author | Admin |
|------------|--------|-------------|---------------|-------|
| Projects | - | Read (filtered) | Create, Update own | Full |
| Milestones | - | Read (via project) | - | Full |
| Tasks | - | - | - | Full |
| Messages | - | Read/Create (via project) | - | Full |
| Previews | - | Read/Update status (via project) | - | Full |
| Files | - | Read/Create (via project) | - | Full |
| ActivityLog | - | Read (via project) | - | Full |
| Invoices | - | Read (via project) | - | Full |
| MemberRoles | - | Read own | - | Full |
| TeamAssignments | - | - | - | Full |

---

## Setting Permissions in Wix CMS

### For Each Collection

1. Open the collection in CMS
2. Click **More Actions** (three dots) > **Permissions**
3. Configure based on the rules below

---

## Projects Collection

### Wix CMS Permissions

| Action | Permission |
|--------|------------|
| Who can read content | Site member |
| Who can create content | Site member author |
| Who can update content | Site member author |
| Who can delete content | Admin |

### Backend Enforcement

```javascript
// backend/projectService.jsw
import wixData from 'wix-data';
import wixUsers from 'wix-users-backend';
import { isStaff } from 'backend/authzService';

export async function getMyProjects() {
  const userId = wixUsers.currentUser.id;
  if (!userId) throw new Error("Not authenticated");
  
  // Staff sees all projects
  if (await isStaff()) {
    return wixData.query("Projects")
      .descending("_createdDate")
      .find({ suppressAuth: true });
  }
  
  // Clients see only their projects
  return wixData.query("Projects")
    .eq("clientMemberId", userId)
    .descending("_createdDate")
    .find({ suppressAuth: true });
}

export async function getProject(projectId) {
  const userId = wixUsers.currentUser.id;
  if (!userId) throw new Error("Not authenticated");
  
  const project = await wixData.get("Projects", projectId, { suppressAuth: true });
  
  if (!project) {
    throw new Error("Project not found");
  }
  
  // Check access
  const staffAccess = await isStaff();
  const ownerAccess = project.clientMemberId === userId;
  
  if (!staffAccess && !ownerAccess) {
    throw new Error("Access denied");
  }
  
  return project;
}
```

---

## Milestones Collection

### Wix CMS Permissions

| Action | Permission |
|--------|------------|
| Who can read content | Site member |
| Who can create content | Admin |
| Who can update content | Admin |
| Who can delete content | Admin |

### Backend Enforcement

```javascript
// backend/projectService.jsw
export async function getMilestones(projectId) {
  // First verify project access
  await ensureProjectAccess(projectId);
  
  return wixData.query("Milestones")
    .eq("projectId", projectId)
    .ascending("order")
    .find({ suppressAuth: true });
}

export async function updateMilestone(projectId, milestoneId, updates) {
  // Staff only
  if (!(await isStaff())) {
    throw new Error("Staff access required");
  }
  
  const milestone = await wixData.get("Milestones", milestoneId, { suppressAuth: true });
  
  if (milestone.projectId !== projectId) {
    throw new Error("Invalid milestone");
  }
  
  return wixData.update("Milestones", { ...milestone, ...updates }, { suppressAuth: true });
}
```

---

## Tasks Collection

### Wix CMS Permissions

| Action | Permission |
|--------|------------|
| Who can read content | Admin |
| Who can create content | Admin |
| Who can update content | Admin |
| Who can delete content | Admin |

### Backend Enforcement

```javascript
// backend/taskService.jsw
import wixData from 'wix-data';
import { isStaff, getCurrentUserRole } from 'backend/authzService';

export async function getProjectTasks(projectId) {
  // Staff only - clients don't see individual tasks
  if (!(await isStaff())) {
    throw new Error("Staff access required");
  }
  
  return wixData.query("Tasks")
    .eq("projectId", projectId)
    .ascending("dueDate")
    .find({ suppressAuth: true });
}

export async function getMyTasks() {
  const userId = wixUsers.currentUser.id;
  const role = await getCurrentUserRole();
  
  if (role === "client") {
    throw new Error("Staff access required");
  }
  
  // Get tasks assigned to this user or their role
  return wixData.query("Tasks")
    .eq("assigneeUserId", userId)
    .or(wixData.query("Tasks").eq("assigneeRole", role))
    .ne("status", "completed")
    .ascending("dueDate")
    .find({ suppressAuth: true });
}
```

---

## Messages Collection

### Wix CMS Permissions

| Action | Permission |
|--------|------------|
| Who can read content | Site member |
| Who can create content | Site member |
| Who can update content | Admin |
| Who can delete content | Admin |

### Backend Enforcement

```javascript
// backend/messagingService.jsw
export async function getMessages(projectId) {
  // Verify caller has project access
  await ensureProjectAccess(projectId);
  
  return wixData.query("Messages")
    .eq("projectId", projectId)
    .ascending("_createdDate")
    .find({ suppressAuth: true });
}

export async function sendMessage(projectId, messageText) {
  // Verify caller has project access
  await ensureProjectAccess(projectId);
  
  const userId = wixUsers.currentUser.id;
  const role = await getCurrentUserRole();
  
  const message = {
    projectId,
    senderMemberId: userId,
    senderRole: role || "client",
    message: messageText,
    attachments: []
  };
  
  return wixData.insert("Messages", message, { suppressAuth: true });
}
```

---

## Previews Collection

### Wix CMS Permissions

| Action | Permission |
|--------|------------|
| Who can read content | Site member |
| Who can create content | Admin |
| Who can update content | Site member |
| Who can delete content | Admin |

### Backend Enforcement

```javascript
// backend/previewService.jsw
export async function getPreviews(projectId) {
  await ensureProjectAccess(projectId);
  
  return wixData.query("Previews")
    .eq("projectId", projectId)
    .descending("_createdDate")
    .find({ suppressAuth: true });
}

export async function createPreview(projectId, previewData) {
  // Staff only can create previews
  if (!(await isStaff())) {
    throw new Error("Staff access required");
  }
  
  return wixData.insert("Previews", {
    ...previewData,
    projectId,
    status: "draft"
  }, { suppressAuth: true });
}

export async function updatePreviewStatus(projectId, previewId, status, feedback) {
  // Both clients and staff can update status
  await ensureProjectAccess(projectId);
  
  const preview = await wixData.get("Previews", previewId, { suppressAuth: true });
  
  if (preview.projectId !== projectId) {
    throw new Error("Invalid preview");
  }
  
  // Clients can only approve/reject/request revision
  const userId = wixUsers.currentUser.id;
  const isOwner = (await getProject(projectId)).clientMemberId === userId;
  
  if (isOwner) {
    const allowedStatuses = ["approved", "rejected", "revision_requested"];
    if (!allowedStatuses.includes(status)) {
      throw new Error("Invalid status for client");
    }
  }
  
  preview.status = status;
  preview.feedback = feedback || preview.feedback;
  preview._updatedDate = new Date();
  
  return wixData.update("Previews", preview, { suppressAuth: true });
}
```

---

## Files Collection

### Wix CMS Permissions

| Action | Permission |
|--------|------------|
| Who can read content | Site member |
| Who can create content | Site member |
| Who can update content | Admin |
| Who can delete content | Admin |

### Backend Enforcement

```javascript
// backend/fileService.jsw
export async function getFiles(projectId) {
  await ensureProjectAccess(projectId);
  
  return wixData.query("Files")
    .eq("projectId", projectId)
    .descending("_createdDate")
    .find({ suppressAuth: true });
}

export async function uploadFileRecord(projectId, fileData) {
  await ensureProjectAccess(projectId);
  
  const userId = wixUsers.currentUser.id;
  
  return wixData.insert("Files", {
    projectId,
    uploadedByMemberId: userId,
    fileUrl: fileData.url,
    fileName: fileData.name,
    fileType: fileData.mimeType,
    fileSize: fileData.size,
    label: fileData.label
  }, { suppressAuth: true });
}

export async function deleteFile(projectId, fileId) {
  // Only staff can delete files
  if (!(await isStaff())) {
    throw new Error("Staff access required");
  }
  
  const file = await wixData.get("Files", fileId, { suppressAuth: true });
  
  if (file.projectId !== projectId) {
    throw new Error("Invalid file");
  }
  
  return wixData.remove("Files", fileId, { suppressAuth: true });
}
```

---

## MemberRoles Collection

### Wix CMS Permissions

| Action | Permission |
|--------|------------|
| Who can read content | Site member (own only) |
| Who can create content | Admin |
| Who can update content | Admin |
| Who can delete content | Admin |

### Backend Enforcement

```javascript
// backend/authzService.jsw
export async function getCurrentUserRole() {
  const userId = wixUsers.currentUser.id;
  if (!userId) return null;
  
  const result = await wixData.query("MemberRoles")
    .eq("userId", userId)
    .find({ suppressAuth: true });
  
  return result.items.length > 0 ? result.items[0].role : "client";
}

export async function assignRole(targetUserId, newRole) {
  // Only admins can assign roles
  const callerRole = await getCurrentUserRole();
  if (callerRole !== "admin") {
    throw new Error("Admin access required");
  }
  
  // Check if user already has a role
  const existing = await wixData.query("MemberRoles")
    .eq("userId", targetUserId)
    .find({ suppressAuth: true });
  
  if (existing.items.length > 0) {
    const item = existing.items[0];
    item.role = newRole;
    return wixData.update("MemberRoles", item, { suppressAuth: true });
  }
  
  return wixData.insert("MemberRoles", {
    userId: targetUserId,
    role: newRole
  }, { suppressAuth: true });
}
```

---

## Authorization Helper Functions

### authzService.jsw Complete Reference

```javascript
// backend/authzService.jsw
import wixUsers from 'wix-users-backend';
import wixData from 'wix-data';

// Cache role to avoid repeated queries
let cachedRole = null;
let cachedUserId = null;

export async function getCurrentUserRole() {
  const userId = wixUsers.currentUser.id;
  if (!userId) return null;
  
  // Return cached if same user
  if (cachedUserId === userId && cachedRole) {
    return cachedRole;
  }
  
  const result = await wixData.query("MemberRoles")
    .eq("userId", userId)
    .find({ suppressAuth: true });
  
  cachedUserId = userId;
  cachedRole = result.items.length > 0 ? result.items[0].role : "client";
  
  return cachedRole;
}

export async function isStaff() {
  const role = await getCurrentUserRole();
  return role && role !== "client";
}

export async function isAdmin() {
  const role = await getCurrentUserRole();
  return role === "admin";
}

export async function isProjectManager() {
  const role = await getCurrentUserRole();
  return role === "admin" || role === "project_manager";
}

export async function canAccessProject(projectId) {
  const userId = wixUsers.currentUser.id;
  if (!userId) return false;
  
  // Staff can access all projects
  if (await isStaff()) return true;
  
  // Clients can only access their own projects
  const project = await wixData.get("Projects", projectId, { suppressAuth: true });
  return project && project.clientMemberId === userId;
}

export async function ensureProjectAccess(projectId) {
  const canAccess = await canAccessProject(projectId);
  if (!canAccess) {
    throw new Error("Access denied");
  }
}

export async function ensureStaff() {
  if (!(await isStaff())) {
    throw new Error("Staff access required");
  }
}

export async function ensureAdmin() {
  if (!(await isAdmin())) {
    throw new Error("Admin access required");
  }
}
```

---

## Security Checklist

### Before Launch

- [ ] All collections have correct CMS permissions
- [ ] All backend functions use `{ suppressAuth: true }` with manual checks
- [ ] `ensureProjectAccess()` called before returning project-related data
- [ ] `ensureStaff()` called before staff-only operations
- [ ] `ensureAdmin()` called before admin-only operations
- [ ] No direct wixData calls in page code (always go through backend)
- [ ] Error messages don't leak sensitive information
- [ ] Rate limiting considered for sensitive operations
