# Wix Members Setup Guide

This guide covers setting up Wix Members for the HiveCraft Digital platform with built-in login/signup modal and email verification.

## Table of Contents

1. [Enable Wix Members Area](#1-enable-wix-members-area)
2. [Configure Login/Signup Modal](#2-configure-loginsignup-modal)
3. [Enable Email Verification](#3-enable-email-verification)
4. [Set Up Member Roles](#4-set-up-member-roles)
5. [Configure Member Pages](#5-configure-member-pages)
6. [Testing the Setup](#6-testing-the-setup)

---

## 1. Enable Wix Members Area

### Step 1: Add Members Area to Your Site

1. In Wix Studio, click **Add Apps** in the left panel
2. Search for "Members Area"
3. Click **Add to Site**
4. Wait for the Members Area to install

### Step 2: Configure Members Area Settings

1. Go to **Dashboard > Site Members > Settings**
2. Under "Signup & Login", select:
   - **Allow visitors to sign up**: Yes
   - **Signup method**: Email (primary)
   - **Allow social login**: Yes (Google, Facebook optional)

### Step 3: Member Area Pages Added

The Members Area automatically creates these pages:
- `/account/my-account` - Member profile
- `/account/my-addresses` - Saved addresses
- `/account/my-wallet` - Payment methods
- `/account/my-subscriptions` - Subscriptions
- `/account/notifications` - Notification settings

---

## 2. Configure Login/Signup Modal

### Using the Built-in Modal (Recommended)

The Wix Members modal appears automatically when:
- User clicks a member-only restricted area
- You trigger it programmatically with Velo

### Triggering Login Modal with Velo

```javascript
// Page code - trigger login modal
import wixUsers from 'wix-users';

export function loginButton_click(event) {
  if (!wixUsers.currentUser.loggedIn) {
    wixUsers.promptLogin({
      mode: "login",
      lang: "en"
    }).then((user) => {
      console.log("User logged in:", user.id);
      // Redirect to portal dashboard
      wixLocation.to("/portal/dashboard");
    }).catch((err) => {
      console.log("Login cancelled or failed:", err);
    });
  }
}

export function signupButton_click(event) {
  wixUsers.promptLogin({
    mode: "signup",
    lang: "en"
  }).then((user) => {
    console.log("User signed up:", user.id);
    // Redirect to onboarding or portal
    wixLocation.to("/portal/dashboard");
  }).catch((err) => {
    console.log("Signup cancelled or failed:", err);
  });
}
```

### Customizing the Modal Appearance

1. Go to **Dashboard > Site Members > Settings > Member Signup Form**
2. Customize:
   - Logo displayed in modal
   - Welcome message
   - Required fields (name, phone, etc.)
   - Terms of service link
   - Privacy policy link

### Adding Custom Fields to Signup

1. Go to **Dashboard > Contacts > Contact Fields**
2. Click **+ Add Field**
3. Create fields like:
   - `company` (Text) - Client's company name
   - `phone` (Phone) - Contact phone number
   - `referralSource` (Dropdown) - How they found you

---

## 3. Enable Email Verification

### Step 1: Enable Email Verification in Settings

1. Go to **Dashboard > Site Members > Settings**
2. Scroll to "Email Verification"
3. Toggle **Require email verification**: ON
4. Configure verification email settings:
   - Subject: "Verify your HiveCraft Digital account"
   - Sender name: "HiveCraft Digital"

### Step 2: Customize Verification Email Template

1. Go to **Dashboard > Site Members > Emails**
2. Click on "Verification Email"
3. Customize the template:
   - Add your logo
   - Brand colors
   - Custom message

### Sample Verification Email Template

```html
Subject: Verify Your Email - HiveCraft Digital

Hi {{contact.firstName}},

Welcome to HiveCraft Digital!

Please verify your email address to access your client portal:

[Verify Email Button]

This link expires in 24 hours.

If you didn't create an account, please ignore this email.

Best,
The HiveCraft Digital Team
```

### Step 3: Handle Unverified Users

```javascript
// Page code - check verification status
import wixUsers from 'wix-users';

$w.onReady(async function () {
  if (wixUsers.currentUser.loggedIn) {
    const user = wixUsers.currentUser;
    const memberData = await user.getMember();
    
    if (memberData.status === "PENDING") {
      // Show verification required message
      $w("#verificationBanner").show();
      $w("#portalContent").collapse();
    } else if (memberData.status === "APPROVED") {
      // Allow access to portal
      $w("#verificationBanner").hide();
      $w("#portalContent").expand();
    }
  }
});
```

---

## 4. Set Up Member Roles

### Understanding the Role Hierarchy

| Role | Access Level | Description |
|------|--------------|-------------|
| Admin | Full | All features, all projects, user management |
| Project Manager | High | All projects, milestone/status management |
| Designer | Medium | Assigned projects, previews, files |
| Developer | Medium | Assigned projects, technical features |
| Editor | Medium | Content updates, messaging |
| Billing | Medium | Invoice management, financial reports |
| Client | Limited | Own projects only |

### Step 1: Create MemberRoles Collection

1. Go to **CMS > Collections**
2. Create collection: `MemberRoles`
3. Add fields:
   - `userId` (Text) - Member ID from wix-users
   - `role` (Text/Dropdown) - One of the roles above
   - `assignedBy` (Text) - Admin who assigned the role
   - `assignedAt` (Date/Time) - When role was assigned

### Step 2: Set Collection Permissions

For `MemberRoles` collection:
- **Read**: Site members (own items only)
- **Create**: Admin only
- **Update**: Admin only
- **Delete**: Admin only

### Step 3: Create Role Assignment Backend

```javascript
// backend/roleService.jsw
import wixData from 'wix-data';
import wixUsers from 'wix-users-backend';

// Get current user's role
export async function getCurrentUserRole() {
  const userId = wixUsers.currentUser.id;
  if (!userId) return null;
  
  const result = await wixData.query("MemberRoles")
    .eq("userId", userId)
    .find({ suppressAuth: true });
  
  if (result.items.length > 0) {
    return result.items[0].role;
  }
  
  // Default role for new members
  return "client";
}

// Check if user is staff (non-client)
export async function isStaff() {
  const role = await getCurrentUserRole();
  return role && role !== "client";
}

// Check if user is admin
export async function isAdmin() {
  const role = await getCurrentUserRole();
  return role === "admin";
}

// Assign role to user (admin only)
export async function assignRole(targetUserId, newRole) {
  // Verify caller is admin
  if (!(await isAdmin())) {
    throw new Error("Only admins can assign roles");
  }
  
  const currentUserId = wixUsers.currentUser.id;
  
  // Check if user already has a role
  const existing = await wixData.query("MemberRoles")
    .eq("userId", targetUserId)
    .find({ suppressAuth: true });
  
  if (existing.items.length > 0) {
    // Update existing role
    const item = existing.items[0];
    item.role = newRole;
    item.assignedBy = currentUserId;
    item.assignedAt = new Date();
    return wixData.update("MemberRoles", item, { suppressAuth: true });
  } else {
    // Create new role assignment
    return wixData.insert("MemberRoles", {
      userId: targetUserId,
      role: newRole,
      assignedBy: currentUserId,
      assignedAt: new Date()
    }, { suppressAuth: true });
  }
}

// Get all staff members
export async function getStaffMembers() {
  if (!(await isAdmin())) {
    throw new Error("Admin access required");
  }
  
  return wixData.query("MemberRoles")
    .ne("role", "client")
    .find({ suppressAuth: true });
}
```

### Step 4: Create Admin UI for Role Management

```javascript
// Page code for admin role management page
import { assignRole, getStaffMembers, isAdmin } from 'backend/roleService';
import wixLocation from 'wix-location';

$w.onReady(async function () {
  // Check admin access
  const adminAccess = await isAdmin();
  if (!adminAccess) {
    wixLocation.to("/portal/dashboard");
    return;
  }
  
  // Load staff members
  await loadStaffMembers();
});

async function loadStaffMembers() {
  const result = await getStaffMembers();
  $w("#staffRepeater").data = result.items;
}

export async function assignRoleButton_click(event) {
  const userId = $w("#userIdInput").value;
  const role = $w("#roleDropdown").value;
  
  try {
    await assignRole(userId, role);
    $w("#statusText").text = "Role assigned successfully!";
    await loadStaffMembers();
  } catch (err) {
    $w("#statusText").text = "Error: " + err.message;
  }
}
```

---

## 5. Configure Member Pages

### Making Pages Member-Only

1. In Wix Studio Editor, select the page
2. Click **Page Settings** (gear icon)
3. Under "Who Can View", select **Members Only**
4. Optionally restrict to specific member badges

### Page Access by Role

| Page | Access |
|------|--------|
| `/` (Home) | Public |
| `/services` | Public |
| `/process` | Public |
| `/pricing` | Public |
| `/contact` | Public |
| `/portal/dashboard` | Members Only |
| `/portal/projects` | Members Only |
| `/portal/project/:id` | Members Only (filtered by ownership) |
| `/admin/dashboard` | Members Only + Staff Role Check |
| `/admin/projects` | Members Only + Staff Role Check |

### Implementing Role-Based Page Protection

```javascript
// masterPage.js (runs on every page load)
import wixUsers from 'wix-users';
import wixLocation from 'wix-location';
import { isStaff } from 'backend/roleService';

$w.onReady(async function () {
  const path = wixLocation.path.join('/');
  
  // Check if on admin pages
  if (path.startsWith('admin')) {
    if (!wixUsers.currentUser.loggedIn) {
      wixUsers.promptLogin().catch(() => {
        wixLocation.to("/");
      });
      return;
    }
    
    const staffAccess = await isStaff();
    if (!staffAccess) {
      // Redirect non-staff away from admin
      wixLocation.to("/portal/dashboard");
    }
  }
  
  // Check if on portal pages
  if (path.startsWith('portal')) {
    if (!wixUsers.currentUser.loggedIn) {
      wixUsers.promptLogin().catch(() => {
        wixLocation.to("/");
      });
    }
  }
});
```

---

## 6. Testing the Setup

### Test Checklist

#### Email Verification Tests
- [ ] New user signs up and receives verification email
- [ ] Verification link works and activates account
- [ ] Unverified users cannot access protected content
- [ ] Resend verification email works

#### Login/Signup Modal Tests
- [ ] Modal opens when clicking login button
- [ ] Modal opens when accessing protected page
- [ ] Social login options work (if enabled)
- [ ] Forgot password flow works
- [ ] Modal closes after successful login
- [ ] User is redirected to correct page after login

#### Role Assignment Tests
- [ ] New members default to "client" role
- [ ] Admin can assign roles to other members
- [ ] Non-admin cannot access role assignment
- [ ] Role changes take effect immediately

#### Page Protection Tests
- [ ] Public pages accessible without login
- [ ] Portal pages require login
- [ ] Admin pages require login + staff role
- [ ] Unauthorized access redirects appropriately

### Test Accounts to Create

| Account | Email | Role | Purpose |
|---------|-------|------|---------|
| Test Client A | client.a@test.com | client | Client isolation testing |
| Test Client B | client.b@test.com | client | Client isolation testing |
| Test Admin | admin@test.com | admin | Admin feature testing |
| Test PM | pm@test.com | project_manager | PM workflow testing |
| Test Designer | designer@test.com | designer | Design workflow testing |

---

## Quick Reference: Wix Users API

### Check Login Status
```javascript
import wixUsers from 'wix-users';

const isLoggedIn = wixUsers.currentUser.loggedIn;
const userId = wixUsers.currentUser.id;
```

### Prompt Login Modal
```javascript
wixUsers.promptLogin({ mode: "login" })
  .then(user => console.log("Logged in:", user.id))
  .catch(err => console.log("Cancelled"));
```

### Logout User
```javascript
wixUsers.logout()
  .then(() => console.log("Logged out"));
```

### Get Current Member Info
```javascript
const member = await wixUsers.currentUser.getMember();
console.log(member.loginEmail);
console.log(member.contactDetails.firstName);
```

### Check if Email Verified
```javascript
const member = await wixUsers.currentUser.getMember();
if (member.status === "PENDING") {
  // Email not verified
} else if (member.status === "APPROVED") {
  // Email verified
}
```

---

## Next Steps

After completing this setup:
1. Proceed to [Collections Schema](./02-collections-schema.md)
2. Set up [Permission Rules](./03-permission-rules.md)
3. Create [Backend Web Modules](./04-backend-modules.md)
4. Build [Page Architecture](./05-page-architecture.md)
5. Run [Security Tests](./06-security-tests.md)
