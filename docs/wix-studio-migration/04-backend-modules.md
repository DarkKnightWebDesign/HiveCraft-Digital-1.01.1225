# Backend Web Modules (.jsw)

Complete Velo backend module implementations for HiveCraft Digital.

## Module Overview

| Module | Purpose | Key Functions |
|--------|---------|---------------|
| authzService.jsw | Authorization & access control | getCurrentUserRole, isStaff, ensureProjectAccess |
| projectService.jsw | Project CRUD operations | getMyProjects, getProject, createProject |
| milestoneService.jsw | Milestone management | getMilestones, updateMilestone |
| taskService.jsw | Task management | getProjectTasks, getMyTasks, updateTask |
| messagingService.jsw | Project messaging | getMessages, sendMessage |
| previewService.jsw | Preview management | getPreviews, createPreview, approvePreview |
| fileService.jsw | File management | getFiles, uploadFileRecord, deleteFile |
| activityService.jsw | Activity logging | logActivity, getActivityLog |
| invoiceService.jsw | Invoice management | getInvoices, createInvoice |

---

## authzService.jsw

Core authorization module used by all other services.

```javascript
// backend/authzService.jsw
import wixUsers from 'wix-users-backend';
import wixData from 'wix-data';

/**
 * Get the current user's role
 * @returns {Promise<string|null>} Role name or null if not logged in
 */
export async function getCurrentUserRole() {
  const userId = wixUsers.currentUser.id;
  if (!userId) return null;
  
  const result = await wixData.query("MemberRoles")
    .eq("userId", userId)
    .find({ suppressAuth: true });
  
  return result.items.length > 0 ? result.items[0].role : "client";
}

/**
 * Check if current user is a staff member (non-client)
 * @returns {Promise<boolean>}
 */
export async function isStaff() {
  const role = await getCurrentUserRole();
  return role && role !== "client";
}

/**
 * Check if current user is an admin
 * @returns {Promise<boolean>}
 */
export async function isAdmin() {
  const role = await getCurrentUserRole();
  return role === "admin";
}

/**
 * Check if current user is admin or project manager
 * @returns {Promise<boolean>}
 */
export async function isProjectManager() {
  const role = await getCurrentUserRole();
  return role === "admin" || role === "project_manager";
}

/**
 * Check if current user can access a specific project
 * @param {string} projectId - Project ID to check
 * @returns {Promise<boolean>}
 */
export async function canAccessProject(projectId) {
  const userId = wixUsers.currentUser.id;
  if (!userId) return false;
  
  // Staff can access all projects
  if (await isStaff()) return true;
  
  // Clients can only access their own projects
  const project = await wixData.get("Projects", projectId, { suppressAuth: true });
  return project && project.clientMemberId === userId;
}

/**
 * Ensure current user can access project, throw if not
 * @param {string} projectId - Project ID to check
 * @throws {Error} If access denied
 */
export async function ensureProjectAccess(projectId) {
  const canAccess = await canAccessProject(projectId);
  if (!canAccess) {
    throw new Error("Access denied");
  }
}

/**
 * Ensure current user is staff, throw if not
 * @throws {Error} If not staff
 */
export async function ensureStaff() {
  if (!(await isStaff())) {
    throw new Error("Staff access required");
  }
}

/**
 * Ensure current user is admin, throw if not
 * @throws {Error} If not admin
 */
export async function ensureAdmin() {
  if (!(await isAdmin())) {
    throw new Error("Admin access required");
  }
}

/**
 * Assign a role to a user (admin only)
 * @param {string} targetUserId - User to assign role to
 * @param {string} newRole - Role to assign
 * @returns {Promise<Object>} Updated/created role record
 */
export async function assignRole(targetUserId, newRole) {
  await ensureAdmin();
  
  const currentUserId = wixUsers.currentUser.id;
  const validRoles = ["client", "admin", "project_manager", "designer", "developer", "editor", "billing"];
  
  if (!validRoles.includes(newRole)) {
    throw new Error("Invalid role");
  }
  
  const existing = await wixData.query("MemberRoles")
    .eq("userId", targetUserId)
    .find({ suppressAuth: true });
  
  if (existing.items.length > 0) {
    const item = existing.items[0];
    item.role = newRole;
    item.assignedBy = currentUserId;
    item.assignedAt = new Date();
    return wixData.update("MemberRoles", item, { suppressAuth: true });
  }
  
  return wixData.insert("MemberRoles", {
    userId: targetUserId,
    role: newRole,
    assignedBy: currentUserId,
    assignedAt: new Date()
  }, { suppressAuth: true });
}

/**
 * Get all staff members (admin only)
 * @returns {Promise<Object>} Query result with staff records
 */
export async function getStaffMembers() {
  await ensureAdmin();
  
  return wixData.query("MemberRoles")
    .ne("role", "client")
    .find({ suppressAuth: true });
}
```

---

## projectService.jsw

Project management operations.

```javascript
// backend/projectService.jsw
import wixData from 'wix-data';
import wixUsers from 'wix-users-backend';
import { isStaff, ensureProjectAccess, ensureStaff } from 'backend/authzService';
import { logActivity } from 'backend/activityService';

/**
 * Get projects for current user
 * Staff sees all, clients see only their own
 * @returns {Promise<Object>} Query result with projects
 */
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

/**
 * Get a single project by ID
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>} Project data
 */
export async function getProject(projectId) {
  await ensureProjectAccess(projectId);
  return wixData.get("Projects", projectId, { suppressAuth: true });
}

/**
 * Create a new project (staff only)
 * @param {Object} projectData - Project data
 * @returns {Promise<Object>} Created project
 */
export async function createProject(projectData) {
  await ensureStaff();
  
  const project = {
    ...projectData,
    progressPercent: 0,
    status: projectData.status || "discovery",
    _createdDate: new Date(),
    _updatedDate: new Date()
  };
  
  const result = await wixData.insert("Projects", project, { suppressAuth: true });
  
  await logActivity({
    projectId: result._id,
    eventType: "project_created",
    description: `Project "${result.title}" was created`
  });
  
  return result;
}

/**
 * Update a project (staff only)
 * @param {string} projectId - Project ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated project
 */
export async function updateProject(projectId, updates) {
  await ensureStaff();
  
  const existing = await wixData.get("Projects", projectId, { suppressAuth: true });
  if (!existing) throw new Error("Project not found");
  
  const updated = {
    ...existing,
    ...updates,
    _updatedDate: new Date()
  };
  
  await wixData.update("Projects", updated, { suppressAuth: true });
  
  await logActivity({
    projectId,
    eventType: "project_updated",
    description: "Project was updated"
  });
  
  return updated;
}

/**
 * Update project status (staff only)
 * @param {string} projectId - Project ID
 * @param {string} newStatus - New status
 * @returns {Promise<Object>} Updated project
 */
export async function updateProjectStatus(projectId, newStatus) {
  await ensureStaff();
  
  const validStatuses = ["discovery", "design", "build", "launch", "care", "completed", "on_hold"];
  if (!validStatuses.includes(newStatus)) {
    throw new Error("Invalid status");
  }
  
  const existing = await wixData.get("Projects", projectId, { suppressAuth: true });
  const oldStatus = existing.status;
  
  existing.status = newStatus;
  existing._updatedDate = new Date();
  
  await wixData.update("Projects", existing, { suppressAuth: true });
  
  await logActivity({
    projectId,
    eventType: "status_changed",
    description: `Status changed from ${oldStatus} to ${newStatus}`,
    metadata: { oldStatus, newStatus }
  });
  
  return existing;
}

/**
 * Get project summary with related data
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>} Project with milestones, previews, etc.
 */
export async function getProjectWithDetails(projectId) {
  await ensureProjectAccess(projectId);
  
  const project = await wixData.get("Projects", projectId, { suppressAuth: true });
  
  const [milestones, previews, messages, files, invoices, activity] = await Promise.all([
    wixData.query("Milestones").eq("projectId", projectId).ascending("order").find({ suppressAuth: true }),
    wixData.query("Previews").eq("projectId", projectId).descending("_createdDate").find({ suppressAuth: true }),
    wixData.query("Messages").eq("projectId", projectId).descending("_createdDate").limit(10).find({ suppressAuth: true }),
    wixData.query("Files").eq("projectId", projectId).descending("_createdDate").find({ suppressAuth: true }),
    wixData.query("Invoices").eq("projectId", projectId).descending("_createdDate").find({ suppressAuth: true }),
    wixData.query("ActivityLog").eq("projectId", projectId).descending("_createdDate").limit(20).find({ suppressAuth: true })
  ]);
  
  return {
    ...project,
    milestones: milestones.items,
    previews: previews.items,
    messages: messages.items,
    files: files.items,
    invoices: invoices.items,
    activity: activity.items
  };
}
```

---

## milestoneService.jsw

Milestone management operations.

```javascript
// backend/milestoneService.jsw
import wixData from 'wix-data';
import { ensureProjectAccess, ensureStaff } from 'backend/authzService';
import { logActivity } from 'backend/activityService';

/**
 * Get milestones for a project
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>} Query result with milestones
 */
export async function getMilestones(projectId) {
  await ensureProjectAccess(projectId);
  
  return wixData.query("Milestones")
    .eq("projectId", projectId)
    .ascending("order")
    .find({ suppressAuth: true });
}

/**
 * Create a milestone (staff only)
 * @param {string} projectId - Project ID
 * @param {Object} milestoneData - Milestone data
 * @returns {Promise<Object>} Created milestone
 */
export async function createMilestone(projectId, milestoneData) {
  await ensureStaff();
  
  // Get current max order
  const existing = await wixData.query("Milestones")
    .eq("projectId", projectId)
    .descending("order")
    .limit(1)
    .find({ suppressAuth: true });
  
  const nextOrder = existing.items.length > 0 ? existing.items[0].order + 1 : 0;
  
  const milestone = {
    ...milestoneData,
    projectId,
    order: milestoneData.order ?? nextOrder,
    status: "pending",
    approvalRequired: milestoneData.approvalRequired ?? false
  };
  
  const result = await wixData.insert("Milestones", milestone, { suppressAuth: true });
  
  await logActivity({
    projectId,
    eventType: "milestone_created",
    description: `Milestone "${milestone.name}" was created`
  });
  
  return result;
}

/**
 * Update a milestone (staff only)
 * @param {string} projectId - Project ID
 * @param {string} milestoneId - Milestone ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated milestone
 */
export async function updateMilestone(projectId, milestoneId, updates) {
  await ensureStaff();
  
  const milestone = await wixData.get("Milestones", milestoneId, { suppressAuth: true });
  
  if (!milestone || milestone.projectId !== projectId) {
    throw new Error("Invalid milestone");
  }
  
  const updated = { ...milestone, ...updates };
  return wixData.update("Milestones", updated, { suppressAuth: true });
}

/**
 * Mark milestone as complete (staff only)
 * @param {string} projectId - Project ID
 * @param {string} milestoneId - Milestone ID
 * @returns {Promise<Object>} Updated milestone
 */
export async function completeMilestone(projectId, milestoneId) {
  await ensureStaff();
  
  const milestone = await wixData.get("Milestones", milestoneId, { suppressAuth: true });
  
  if (!milestone || milestone.projectId !== projectId) {
    throw new Error("Invalid milestone");
  }
  
  milestone.status = "completed";
  await wixData.update("Milestones", milestone, { suppressAuth: true });
  
  await logActivity({
    projectId,
    eventType: "milestone_completed",
    description: `Milestone "${milestone.name}" was completed`
  });
  
  // Update project progress
  await updateProjectProgress(projectId);
  
  return milestone;
}

/**
 * Recalculate and update project progress based on milestones
 * @param {string} projectId - Project ID
 */
async function updateProjectProgress(projectId) {
  const milestones = await wixData.query("Milestones")
    .eq("projectId", projectId)
    .find({ suppressAuth: true });
  
  if (milestones.items.length === 0) return;
  
  const completed = milestones.items.filter(m => m.status === "completed").length;
  const progressPercent = Math.round((completed / milestones.items.length) * 100);
  
  const project = await wixData.get("Projects", projectId, { suppressAuth: true });
  project.progressPercent = progressPercent;
  project._updatedDate = new Date();
  
  await wixData.update("Projects", project, { suppressAuth: true });
}
```

---

## messagingService.jsw

Project messaging operations.

```javascript
// backend/messagingService.jsw
import wixData from 'wix-data';
import wixUsers from 'wix-users-backend';
import { ensureProjectAccess, getCurrentUserRole } from 'backend/authzService';
import { logActivity } from 'backend/activityService';

/**
 * Get messages for a project
 * @param {string} projectId - Project ID
 * @param {number} limit - Max messages to return
 * @returns {Promise<Object>} Query result with messages
 */
export async function getMessages(projectId, limit = 50) {
  await ensureProjectAccess(projectId);
  
  return wixData.query("Messages")
    .eq("projectId", projectId)
    .ascending("_createdDate")
    .limit(limit)
    .find({ suppressAuth: true });
}

/**
 * Send a message in a project
 * @param {string} projectId - Project ID
 * @param {string} messageText - Message content
 * @param {Array<string>} attachments - Optional file URLs
 * @returns {Promise<Object>} Created message
 */
export async function sendMessage(projectId, messageText, attachments = []) {
  await ensureProjectAccess(projectId);
  
  const userId = wixUsers.currentUser.id;
  const role = await getCurrentUserRole();
  
  if (!messageText || messageText.trim().length === 0) {
    throw new Error("Message cannot be empty");
  }
  
  const message = {
    projectId,
    senderMemberId: userId,
    senderRole: role || "client",
    message: messageText.trim(),
    attachments: attachments || []
  };
  
  const result = await wixData.insert("Messages", message, { suppressAuth: true });
  
  await logActivity({
    projectId,
    eventType: "message_sent",
    description: "New message sent"
  });
  
  return result;
}

/**
 * Get unread message count for dashboard
 * @param {string} projectId - Project ID
 * @param {Date} lastReadDate - Last time user read messages
 * @returns {Promise<number>} Unread count
 */
export async function getUnreadCount(projectId, lastReadDate) {
  await ensureProjectAccess(projectId);
  
  const result = await wixData.query("Messages")
    .eq("projectId", projectId)
    .gt("_createdDate", lastReadDate)
    .count({ suppressAuth: true });
  
  return result;
}
```

---

## previewService.jsw

Preview management for client review.

```javascript
// backend/previewService.jsw
import wixData from 'wix-data';
import wixUsers from 'wix-users-backend';
import { ensureProjectAccess, ensureStaff, isStaff } from 'backend/authzService';
import { logActivity } from 'backend/activityService';

/**
 * Get previews for a project
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>} Query result with previews
 */
export async function getPreviews(projectId) {
  await ensureProjectAccess(projectId);
  
  return wixData.query("Previews")
    .eq("projectId", projectId)
    .descending("_createdDate")
    .find({ suppressAuth: true });
}

/**
 * Create a preview (staff only)
 * @param {string} projectId - Project ID
 * @param {Object} previewData - Preview data (url, label, notes, version)
 * @returns {Promise<Object>} Created preview
 */
export async function createPreview(projectId, previewData) {
  await ensureStaff();
  
  const preview = {
    projectId,
    url: previewData.url,
    label: previewData.label,
    notes: previewData.notes || "",
    version: previewData.version || "v1.0",
    status: "draft"
  };
  
  const result = await wixData.insert("Previews", preview, { suppressAuth: true });
  
  await logActivity({
    projectId,
    eventType: "preview_created",
    description: `Preview "${preview.label}" (${preview.version}) was posted`
  });
  
  return result;
}

/**
 * Publish a preview for client review (staff only)
 * @param {string} projectId - Project ID
 * @param {string} previewId - Preview ID
 * @returns {Promise<Object>} Updated preview
 */
export async function publishPreview(projectId, previewId) {
  await ensureStaff();
  
  const preview = await wixData.get("Previews", previewId, { suppressAuth: true });
  
  if (!preview || preview.projectId !== projectId) {
    throw new Error("Invalid preview");
  }
  
  preview.status = "ready";
  preview._updatedDate = new Date();
  
  await wixData.update("Previews", preview, { suppressAuth: true });
  
  await logActivity({
    projectId,
    eventType: "preview_published",
    description: `Preview "${preview.label}" is ready for review`
  });
  
  return preview;
}

/**
 * Approve a preview (client action)
 * @param {string} projectId - Project ID
 * @param {string} previewId - Preview ID
 * @param {string} feedback - Optional approval feedback
 * @returns {Promise<Object>} Updated preview
 */
export async function approvePreview(projectId, previewId, feedback = "") {
  await ensureProjectAccess(projectId);
  
  const preview = await wixData.get("Previews", previewId, { suppressAuth: true });
  
  if (!preview || preview.projectId !== projectId) {
    throw new Error("Invalid preview");
  }
  
  preview.status = "approved";
  preview.feedback = feedback;
  preview._updatedDate = new Date();
  
  await wixData.update("Previews", preview, { suppressAuth: true });
  
  await logActivity({
    projectId,
    eventType: "preview_approved",
    description: `Preview "${preview.label}" (${preview.version}) was approved`
  });
  
  return preview;
}

/**
 * Request revision on a preview (client action)
 * @param {string} projectId - Project ID
 * @param {string} previewId - Preview ID
 * @param {string} feedback - Revision feedback (required)
 * @returns {Promise<Object>} Updated preview
 */
export async function requestRevision(projectId, previewId, feedback) {
  await ensureProjectAccess(projectId);
  
  if (!feedback || feedback.trim().length === 0) {
    throw new Error("Please provide feedback for the revision request");
  }
  
  const preview = await wixData.get("Previews", previewId, { suppressAuth: true });
  
  if (!preview || preview.projectId !== projectId) {
    throw new Error("Invalid preview");
  }
  
  preview.status = "revision_requested";
  preview.feedback = feedback.trim();
  preview._updatedDate = new Date();
  
  await wixData.update("Previews", preview, { suppressAuth: true });
  
  await logActivity({
    projectId,
    eventType: "preview_revision_requested",
    description: `Revision requested for "${preview.label}"`
  });
  
  return preview;
}
```

---

## fileService.jsw

File management operations.

```javascript
// backend/fileService.jsw
import wixData from 'wix-data';
import wixUsers from 'wix-users-backend';
import { ensureProjectAccess, ensureStaff } from 'backend/authzService';
import { logActivity } from 'backend/activityService';

/**
 * Get files for a project
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>} Query result with files
 */
export async function getFiles(projectId) {
  await ensureProjectAccess(projectId);
  
  return wixData.query("Files")
    .eq("projectId", projectId)
    .descending("_createdDate")
    .find({ suppressAuth: true });
}

/**
 * Record an uploaded file
 * @param {string} projectId - Project ID
 * @param {Object} fileData - File metadata
 * @returns {Promise<Object>} Created file record
 */
export async function uploadFileRecord(projectId, fileData) {
  await ensureProjectAccess(projectId);
  
  const userId = wixUsers.currentUser.id;
  
  const file = {
    projectId,
    uploadedByMemberId: userId,
    fileUrl: fileData.url,
    fileName: fileData.name,
    fileType: fileData.mimeType || "application/octet-stream",
    fileSize: fileData.size || 0,
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

/**
 * Delete a file (staff only)
 * @param {string} projectId - Project ID
 * @param {string} fileId - File ID
 */
export async function deleteFile(projectId, fileId) {
  await ensureStaff();
  
  const file = await wixData.get("Files", fileId, { suppressAuth: true });
  
  if (!file || file.projectId !== projectId) {
    throw new Error("Invalid file");
  }
  
  await wixData.remove("Files", fileId, { suppressAuth: true });
  
  await logActivity({
    projectId,
    eventType: "file_deleted",
    description: `File "${file.fileName}" was deleted`
  });
}
```

---

## activityService.jsw

Activity logging for audit trail.

```javascript
// backend/activityService.jsw
import wixData from 'wix-data';
import wixUsers from 'wix-users-backend';
import { ensureProjectAccess } from 'backend/authzService';

/**
 * Log an activity event
 * @param {Object} data - Activity data
 * @returns {Promise<Object>} Created log entry
 */
export async function logActivity(data) {
  const userId = wixUsers.currentUser.id;
  
  const entry = {
    projectId: data.projectId,
    eventType: data.eventType,
    description: data.description,
    actorMemberId: userId || "system",
    metadata: data.metadata || {}
  };
  
  return wixData.insert("ActivityLog", entry, { suppressAuth: true });
}

/**
 * Get activity log for a project
 * @param {string} projectId - Project ID
 * @param {number} limit - Max entries to return
 * @returns {Promise<Object>} Query result with activity entries
 */
export async function getActivityLog(projectId, limit = 50) {
  await ensureProjectAccess(projectId);
  
  return wixData.query("ActivityLog")
    .eq("projectId", projectId)
    .descending("_createdDate")
    .limit(limit)
    .find({ suppressAuth: true });
}
```

---

## invoiceService.jsw

Invoice management operations.

```javascript
// backend/invoiceService.jsw
import wixData from 'wix-data';
import { ensureProjectAccess, ensureStaff } from 'backend/authzService';
import { logActivity } from 'backend/activityService';

/**
 * Get invoices for a project
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>} Query result with invoices
 */
export async function getInvoices(projectId) {
  await ensureProjectAccess(projectId);
  
  return wixData.query("Invoices")
    .eq("projectId", projectId)
    .descending("_createdDate")
    .find({ suppressAuth: true });
}

/**
 * Create an invoice (staff only)
 * @param {string} projectId - Project ID
 * @param {Object} invoiceData - Invoice data
 * @returns {Promise<Object>} Created invoice
 */
export async function createInvoice(projectId, invoiceData) {
  await ensureStaff();
  
  // Generate invoice number
  const year = new Date().getFullYear();
  const count = await wixData.query("Invoices")
    .startsWith("invoiceNumber", `HC-${year}`)
    .count({ suppressAuth: true });
  
  const invoiceNumber = `HC-${year}-${String(count + 1).padStart(3, "0")}`;
  
  const invoice = {
    projectId,
    invoiceNumber,
    amount: invoiceData.amount,
    status: "draft",
    dueDate: invoiceData.dueDate,
    url: invoiceData.url || null
  };
  
  const result = await wixData.insert("Invoices", invoice, { suppressAuth: true });
  
  await logActivity({
    projectId,
    eventType: "invoice_created",
    description: `Invoice ${invoiceNumber} created for $${(invoice.amount / 100).toFixed(2)}`
  });
  
  return result;
}

/**
 * Send an invoice (staff only)
 * @param {string} projectId - Project ID
 * @param {string} invoiceId - Invoice ID
 * @returns {Promise<Object>} Updated invoice
 */
export async function sendInvoice(projectId, invoiceId) {
  await ensureStaff();
  
  const invoice = await wixData.get("Invoices", invoiceId, { suppressAuth: true });
  
  if (!invoice || invoice.projectId !== projectId) {
    throw new Error("Invalid invoice");
  }
  
  invoice.status = "sent";
  await wixData.update("Invoices", invoice, { suppressAuth: true });
  
  await logActivity({
    projectId,
    eventType: "invoice_sent",
    description: `Invoice ${invoice.invoiceNumber} was sent`
  });
  
  return invoice;
}

/**
 * Mark invoice as paid (staff only)
 * @param {string} projectId - Project ID
 * @param {string} invoiceId - Invoice ID
 * @returns {Promise<Object>} Updated invoice
 */
export async function markInvoicePaid(projectId, invoiceId) {
  await ensureStaff();
  
  const invoice = await wixData.get("Invoices", invoiceId, { suppressAuth: true });
  
  if (!invoice || invoice.projectId !== projectId) {
    throw new Error("Invalid invoice");
  }
  
  invoice.status = "paid";
  invoice.paidDate = new Date();
  await wixData.update("Invoices", invoice, { suppressAuth: true });
  
  await logActivity({
    projectId,
    eventType: "invoice_paid",
    description: `Invoice ${invoice.invoiceNumber} was paid`
  });
  
  return invoice;
}
```

---

## Using Modules in Page Code

### Importing Backend Functions

```javascript
// Page code
import { getMyProjects, getProjectWithDetails } from 'backend/projectService';
import { sendMessage } from 'backend/messagingService';
import { approvePreview, requestRevision } from 'backend/previewService';

$w.onReady(async function () {
  try {
    const projects = await getMyProjects();
    $w("#projectsRepeater").data = projects.items;
  } catch (err) {
    console.error("Error loading projects:", err);
    // Handle error - redirect to login if unauthorized
  }
});
```

### Error Handling Pattern

```javascript
import wixLocation from 'wix-location';
import wixUsers from 'wix-users';

async function loadData() {
  try {
    const data = await getMyProjects();
    // Process data
  } catch (err) {
    if (err.message === "Not authenticated") {
      wixUsers.promptLogin();
    } else if (err.message === "Access denied") {
      wixLocation.to("/portal/dashboard");
    } else {
      console.error("Error:", err);
      $w("#errorMessage").text = "Something went wrong. Please try again.";
      $w("#errorMessage").show();
    }
  }
}
```
