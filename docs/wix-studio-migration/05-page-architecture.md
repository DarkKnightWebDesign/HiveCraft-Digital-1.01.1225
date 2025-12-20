# Page Architecture

Complete page structure for HiveCraft Digital in Wix Studio.

## Page Overview

| Category | Pages | Access |
|----------|-------|--------|
| Public Marketing | 7 pages | Anyone |
| Client Portal | 6 pages | Members Only |
| Staff Back Office | 6 pages | Members + Staff Role |

---

## Public Marketing Pages

These pages are accessible to all visitors without login.

### Home (/)

**Purpose**: Main landing page with value proposition and CTAs

**Sections**:
1. Hero with headline and CTA buttons
2. Services overview (3 cards)
3. Process preview (5 steps)
4. Featured work / testimonials
5. Pricing preview
6. Contact CTA
7. Footer

**Key Elements**:
- Login/Signup buttons in header (trigger Wix Members modal)
- "Start Your Project" CTA → Contact page or signup
- "View Pricing" → Pricing page

**Page Code**:
```javascript
import wixUsers from 'wix-users';
import wixLocation from 'wix-location';

$w.onReady(function () {
  // Update header based on login status
  if (wixUsers.currentUser.loggedIn) {
    $w("#loginButton").hide();
    $w("#portalButton").show();
  } else {
    $w("#loginButton").show();
    $w("#portalButton").hide();
  }
});

export function loginButton_click(event) {
  wixUsers.promptLogin({ mode: "login" })
    .then(user => wixLocation.to("/portal/dashboard"))
    .catch(err => console.log("Login cancelled"));
}

export function signupButton_click(event) {
  wixUsers.promptLogin({ mode: "signup" })
    .then(user => wixLocation.to("/portal/dashboard"))
    .catch(err => console.log("Signup cancelled"));
}
```

---

### Services (/services)

**Purpose**: Detailed service offerings

**Sections**:
1. Page header with title
2. Service categories (Managed, Custom, E-commerce, Web Apps)
3. Service cards with features
4. Comparison table
5. CTA section

**Key Elements**:
- data-testid attributes for testing
- "Get Started" buttons → Contact or signup

---

### Process (/process)

**Purpose**: Explain the project workflow

**Sections**:
1. Page header
2. Process timeline (5 phases):
   - Discovery
   - Design
   - Build
   - Launch
   - Care
3. Each phase with description, deliverables, timeline
4. FAQ accordion
5. CTA section

---

### Pricing (/pricing)

**Purpose**: Display pricing tiers

**Sections**:
1. Page header
2. Pricing cards (Launch, Growth, Scale)
3. Feature comparison table
4. Add-ons section
5. FAQ
6. CTA section

**Key Elements**:
- Toggle for monthly/annual pricing (if applicable)
- "Choose Plan" → Contact or signup

---

### Portfolio (/portfolio)

**Purpose**: Showcase past work

**Sections**:
1. Page header
2. Filter by category
3. Project cards grid
4. Project detail modal/lightbox
5. Testimonials
6. CTA section

---

### About (/about)

**Purpose**: Company story and team

**Sections**:
1. Page header
2. Company story
3. Team section
4. Values/mission
5. Stats (projects completed, clients, etc.)
6. CTA section

---

### Contact (/contact)

**Purpose**: Contact form and information

**Sections**:
1. Page header
2. Contact form (name, email, phone, message, project type)
3. Contact information
4. Office hours
5. Map (optional)

**Form Handling**:
```javascript
import wixData from 'wix-data';
import { sendEmail } from 'backend/emailService';

export async function submitButton_click(event) {
  const formData = {
    name: $w("#nameInput").value,
    email: $w("#emailInput").value,
    phone: $w("#phoneInput").value,
    message: $w("#messageInput").value,
    projectType: $w("#projectTypeDropdown").value
  };
  
  try {
    // Save to collection
    await wixData.insert("ContactSubmissions", formData);
    
    // Send notification email
    await sendEmail({
      to: "hello@hivecraft.dev",
      subject: "New Contact Form Submission",
      body: `Name: ${formData.name}\nEmail: ${formData.email}\nMessage: ${formData.message}`
    });
    
    $w("#successMessage").show();
    $w("#contactForm").hide();
  } catch (err) {
    $w("#errorMessage").text = "Something went wrong. Please try again.";
    $w("#errorMessage").show();
  }
}
```

---

## Client Portal Pages

These pages require Wix Members login. Set page permissions to "Members Only".

### Portal Dashboard (/portal/dashboard)

**Purpose**: Client's home with project overview

**Sections**:
1. Welcome header with user name
2. Active projects summary cards
3. Recent activity feed
4. Pending approvals alert
5. Quick actions (view projects, messages, files)

**Page Code**:
```javascript
import wixUsers from 'wix-users';
import wixLocation from 'wix-location';
import { getMyProjects } from 'backend/projectService';
import { getCurrentUserRole } from 'backend/authzService';

$w.onReady(async function () {
  // Check authentication
  if (!wixUsers.currentUser.loggedIn) {
    wixUsers.promptLogin()
      .then(() => loadDashboard())
      .catch(() => wixLocation.to("/"));
    return;
  }
  
  // Check if staff - redirect to admin
  const role = await getCurrentUserRole();
  if (role && role !== "client") {
    wixLocation.to("/admin/dashboard");
    return;
  }
  
  await loadDashboard();
});

async function loadDashboard() {
  try {
    // Get user info
    const member = await wixUsers.currentUser.getMember();
    $w("#welcomeText").text = `Welcome back, ${member.contactDetails.firstName || "there"}!`;
    
    // Load projects
    const projects = await getMyProjects();
    
    if (projects.items.length === 0) {
      $w("#noProjectsCard").show();
      $w("#projectsSection").hide();
    } else {
      $w("#noProjectsCard").hide();
      $w("#projectsSection").show();
      $w("#projectsRepeater").data = projects.items;
    }
  } catch (err) {
    console.error("Dashboard error:", err);
    $w("#errorMessage").show();
  }
}
```

**Repeater Item Setup**:
```javascript
$w("#projectsRepeater").onItemReady(($item, itemData) => {
  $item("#projectTitle").text = itemData.title;
  $item("#projectStatus").text = itemData.status;
  $item("#projectProgress").value = itemData.progressPercent;
  
  $item("#viewProjectButton").onClick(() => {
    wixLocation.to(`/portal/project/${itemData._id}`);
  });
});
```

---

### My Projects (/portal/projects)

**Purpose**: List all client projects

**Sections**:
1. Page header
2. Filter/sort options
3. Projects list/grid
4. Empty state if no projects

---

### Project Detail (/portal/project/{id})

**Purpose**: Full project view with tabs

**URL**: Dynamic page with project ID parameter

**Tabs**:
1. **Overview** - Project summary, status, timeline
2. **Timeline** - Milestones and progress
3. **Previews** - Staging links for review
4. **Files** - Uploaded assets
5. **Messages** - Communication thread
6. **Billing** - Invoices and payments

**Page Code**:
```javascript
import wixLocation from 'wix-location';
import { getProjectWithDetails } from 'backend/projectService';

let projectId;
let projectData;

$w.onReady(async function () {
  // Get project ID from URL
  projectId = wixLocation.query.id || wixLocation.path[2];
  
  if (!projectId) {
    wixLocation.to("/portal/dashboard");
    return;
  }
  
  await loadProject();
});

async function loadProject() {
  try {
    projectData = await getProjectWithDetails(projectId);
    
    // Populate overview
    $w("#projectTitle").text = projectData.title;
    $w("#projectStatus").text = projectData.status;
    $w("#progressBar").value = projectData.progressPercent;
    
    // Populate tabs
    populateMilestones(projectData.milestones);
    populatePreviews(projectData.previews);
    populateFiles(projectData.files);
    populateMessages(projectData.messages);
    populateInvoices(projectData.invoices);
    populateActivity(projectData.activity);
    
  } catch (err) {
    console.error("Error loading project:", err);
    if (err.message === "Access denied") {
      wixLocation.to("/portal/dashboard");
    }
  }
}

function populateMilestones(milestones) {
  $w("#milestonesRepeater").data = milestones;
}

function populatePreviews(previews) {
  const readyPreviews = previews.filter(p => p.status !== "draft");
  $w("#previewsRepeater").data = readyPreviews;
  
  // Check for pending approvals
  const pending = readyPreviews.filter(p => p.status === "ready");
  if (pending.length > 0) {
    $w("#pendingApprovalsAlert").show();
    $w("#pendingCount").text = String(pending.length);
  }
}
```

**Preview Approval Actions**:
```javascript
import { approvePreview, requestRevision } from 'backend/previewService';

export async function approveButton_click(event) {
  const previewId = event.context.itemId;
  const feedback = $w("#feedbackInput").value;
  
  try {
    await approvePreview(projectId, previewId, feedback);
    await loadProject(); // Refresh data
    $w("#successToast").show();
  } catch (err) {
    $w("#errorToast").show();
  }
}

export async function revisionButton_click(event) {
  const previewId = event.context.itemId;
  const feedback = $w("#feedbackInput").value;
  
  if (!feedback) {
    $w("#feedbackError").show();
    return;
  }
  
  try {
    await requestRevision(projectId, previewId, feedback);
    await loadProject();
    $w("#successToast").show();
  } catch (err) {
    $w("#errorToast").show();
  }
}
```

---

### Messages (/portal/messages)

**Purpose**: View all project messages

**Sections**:
1. Project selector dropdown
2. Messages list
3. Message composer

---

### Files (/portal/files)

**Purpose**: View all project files

**Sections**:
1. Project selector dropdown
2. File list with filters
3. Upload button

---

### Billing (/portal/billing)

**Purpose**: View all invoices

**Sections**:
1. Outstanding balance summary
2. Invoice list with status
3. Payment history

---

## Staff Back Office Pages

These pages require Members login AND staff role verification.

### Admin Dashboard (/admin/dashboard)

**Purpose**: Staff overview of all projects

**Page Code (Role Check)**:
```javascript
import wixUsers from 'wix-users';
import wixLocation from 'wix-location';
import { isStaff, getCurrentUserRole } from 'backend/authzService';

$w.onReady(async function () {
  // Check authentication
  if (!wixUsers.currentUser.loggedIn) {
    wixUsers.promptLogin()
      .catch(() => wixLocation.to("/"));
    return;
  }
  
  // Check staff access
  const staffAccess = await isStaff();
  if (!staffAccess) {
    wixLocation.to("/portal/dashboard");
    return;
  }
  
  const role = await getCurrentUserRole();
  await loadAdminDashboard(role);
});

async function loadAdminDashboard(role) {
  // Load stats
  const stats = await getProjectStats();
  $w("#activeProjectsCount").text = String(stats.active);
  $w("#pendingApprovalsCount").text = String(stats.pendingApprovals);
  $w("#overdueTasksCount").text = String(stats.overdueTasks);
  
  // Load projects
  const projects = await getAllProjects();
  $w("#projectsRepeater").data = projects.items;
  
  // Role-specific UI
  if (role === "billing") {
    $w("#invoicesSection").show();
    $w("#tasksSection").hide();
  }
}
```

**Sections**:
1. Stats cards (active projects, pending approvals, overdue tasks)
2. Recent activity feed
3. Quick actions
4. Project list with filters

---

### All Projects (/admin/projects)

**Purpose**: Manage all client projects

**Sections**:
1. Search and filters
2. Projects table/list
3. Bulk actions
4. "New Project" button

---

### Project Management (/admin/project/{id})

**Purpose**: Staff view of project with full controls

**Additional Features vs Client View**:
- Edit project details
- Update status
- Create/publish previews
- Manage milestones
- Assign team members
- Create invoices

---

### Create Project (/admin/projects/new)

**Purpose**: Form to create new project

**Form Fields**:
- Client (member selector)
- Title
- Type
- Tier
- Start date
- Target launch date
- Summary

**Page Code**:
```javascript
import { createProject } from 'backend/projectService';
import { createMilestone } from 'backend/milestoneService';
import wixLocation from 'wix-location';

export async function createButton_click(event) {
  const projectData = {
    clientMemberId: $w("#clientSelector").value,
    title: $w("#titleInput").value,
    type: $w("#typeDropdown").value,
    tier: $w("#tierDropdown").value,
    startDate: $w("#startDatePicker").value,
    targetLaunchDate: $w("#launchDatePicker").value,
    summary: $w("#summaryInput").value
  };
  
  try {
    const project = await createProject(projectData);
    
    // Create default milestones
    const milestones = ["Discovery", "Design", "Build", "Launch", "Care"];
    for (let i = 0; i < milestones.length; i++) {
      await createMilestone(project._id, {
        name: milestones[i],
        order: i,
        approvalRequired: i === 1 // Design requires approval
      });
    }
    
    wixLocation.to(`/admin/project/${project._id}`);
  } catch (err) {
    $w("#errorMessage").text = err.message;
    $w("#errorMessage").show();
  }
}
```

---

### Clients (/admin/clients)

**Purpose**: Manage client accounts

**Sections**:
1. Search clients
2. Client list with project counts
3. Client detail modal

---

### Team Management (/admin/team)

**Purpose**: Manage staff roles (Admin only)

**Page Code**:
```javascript
import { isAdmin, getStaffMembers, assignRole } from 'backend/authzService';

$w.onReady(async function () {
  if (!(await isAdmin())) {
    wixLocation.to("/admin/dashboard");
    return;
  }
  
  await loadTeamMembers();
});

async function loadTeamMembers() {
  const staff = await getStaffMembers();
  $w("#teamRepeater").data = staff.items;
}

export async function assignRoleButton_click(event) {
  const userId = $w("#userIdInput").value;
  const role = $w("#roleDropdown").value;
  
  try {
    await assignRole(userId, role);
    $w("#successToast").show();
    await loadTeamMembers();
  } catch (err) {
    $w("#errorToast").text = err.message;
    $w("#errorToast").show();
  }
}
```

---

## Page Settings Summary

### Public Pages
| Page | Path | Permission |
|------|------|------------|
| Home | / | Anyone |
| Services | /services | Anyone |
| Process | /process | Anyone |
| Pricing | /pricing | Anyone |
| Portfolio | /portfolio | Anyone |
| About | /about | Anyone |
| Contact | /contact | Anyone |

### Member Pages
| Page | Path | Permission | Role Check |
|------|------|------------|------------|
| Portal Dashboard | /portal/dashboard | Members Only | Client redirect if staff |
| My Projects | /portal/projects | Members Only | - |
| Project Detail | /portal/project/{id} | Members Only | Project access check |
| Messages | /portal/messages | Members Only | - |
| Files | /portal/files | Members Only | - |
| Billing | /portal/billing | Members Only | - |

### Staff Pages
| Page | Path | Permission | Role Check |
|------|------|------------|------------|
| Admin Dashboard | /admin/dashboard | Members Only | isStaff() required |
| All Projects | /admin/projects | Members Only | isStaff() required |
| Project Management | /admin/project/{id} | Members Only | isStaff() required |
| Create Project | /admin/projects/new | Members Only | isStaff() required |
| Clients | /admin/clients | Members Only | isStaff() required |
| Team Management | /admin/team | Members Only | isAdmin() required |

---

## Navigation Structure

### Header Navigation (Public)
```
Logo | Services | Process | Pricing | Portfolio | About | Contact | [Login] [Get Started]
```

### Header Navigation (Logged In - Client)
```
Logo | Dashboard | My Projects | Messages | Files | Billing | [Profile] [Logout]
```

### Header Navigation (Logged In - Staff)
```
Logo | Dashboard | Projects | Clients | Team | [Profile] [Logout]
```

### Sidebar Navigation (Portal)
```
Dashboard
My Projects
Messages
Files
Billing
---
Account Settings
Logout
```

### Sidebar Navigation (Admin)
```
Dashboard
All Projects
Create Project
Clients
Team (Admin only)
---
Settings
Logout
```
