# Security Test Checklist

Comprehensive security testing plan for HiveCraft Digital platform.

## Test Environment Setup

### Required Test Accounts

| Account | Email | Role | Purpose |
|---------|-------|------|---------|
| Client A | client.a@test.com | client | Client isolation testing |
| Client B | client.b@test.com | client | Client isolation testing |
| Admin User | admin@test.com | admin | Full access testing |
| Project Manager | pm@test.com | project_manager | PM workflow testing |
| Designer | designer@test.com | designer | Designer workflow testing |
| Developer | developer@test.com | developer | Developer workflow testing |
| Billing User | billing@test.com | billing | Billing workflow testing |

### Required Test Data

1. Create 2 projects for Client A
2. Create 2 projects for Client B
3. Assign Designer to one of Client A's projects
4. Create previews, messages, files for each project
5. Create invoices for each project

---

## Test Cases

### TC-001: Client Isolation - Project Access

**Objective**: Verify clients cannot access other clients' projects

**Steps**:
1. Log in as Client A
2. Navigate to `/portal/projects`
3. Note the project IDs visible
4. Log out
5. Log in as Client B
6. Attempt to access Client A's project by URL: `/portal/project/{clientA_projectId}`

**Expected Result**: 
- Client B should see "Access denied" or be redirected
- Client A's project data should NOT be visible

**Pass Criteria**: Client B cannot view Client A's project

---

### TC-002: Client Isolation - Direct API Bypass

**Objective**: Verify backend services enforce client isolation

**Steps**:
1. Log in as Client A
2. Open browser developer tools (F12)
3. Go to Console tab
4. Execute: `import('backend/projectService').then(m => m.getProject('CLIENT_B_PROJECT_ID'))`

**Expected Result**: 
- Should throw "Access denied" error
- Should NOT return Client B's project data

**Pass Criteria**: API rejects cross-client access

---

### TC-003: Client Cannot Access Admin Pages

**Objective**: Verify clients cannot access staff-only pages

**Steps**:
1. Log in as Client A
2. Navigate directly to `/admin/dashboard`
3. Navigate directly to `/admin/projects`
4. Navigate directly to `/admin/team`

**Expected Result**: 
- Client should be redirected to `/portal/dashboard`
- Admin content should NOT be visible

**Pass Criteria**: All admin pages redirect non-staff users

---

### TC-004: Staff Access to All Projects

**Objective**: Verify staff can access all client projects

**Steps**:
1. Log in as Project Manager
2. Navigate to `/admin/projects`
3. Verify both Client A and Client B projects are visible
4. Open Client A's project
5. Open Client B's project

**Expected Result**: 
- Staff can see all projects in the list
- Staff can access details of any project

**Pass Criteria**: Staff has cross-client project access

---

### TC-005: Preview Approval - Owner Only

**Objective**: Verify only project owner can approve/reject previews

**Steps**:
1. As staff, create a preview for Client A's project
2. Publish the preview (status = "ready")
3. Log in as Client B
4. Attempt to access Client A's project preview
5. Attempt to approve/reject the preview

**Expected Result**: 
- Client B should NOT see Client A's previews
- Approval API should reject Client B's request

**Pass Criteria**: Cross-client preview access denied

---

### TC-006: Message Security

**Objective**: Verify messages only visible to project participants

**Steps**:
1. Log in as Client A
2. Send a message on Client A's project
3. Log out
4. Log in as Client B
5. Attempt to view Client A's project messages
6. Attempt to send a message on Client A's project

**Expected Result**: 
- Client B cannot view Client A's messages
- Message API should reject unauthorized requests

**Pass Criteria**: Cross-client message access denied

---

### TC-007: File Access Control

**Objective**: Verify file access is protected

**Steps**:
1. Log in as Client A
2. Upload a file to Client A's project
3. Copy the file URL
4. Log out
5. Log in as Client B
6. Attempt to access the file URL directly
7. Attempt to view Client A's project files list

**Expected Result**: 
- File URL access may depend on Wix Media settings
- Files list API should deny access

**Pass Criteria**: File listing denied for non-owners

---

### TC-008: Role Escalation Prevention

**Objective**: Verify clients cannot elevate their role

**Steps**:
1. Log in as Client A
2. Open developer tools
3. Attempt to call: `import('backend/authzService').then(m => m.assignRole('CLIENT_A_USER_ID', 'admin'))`

**Expected Result**: 
- Should throw "Admin access required" error
- Role should NOT change

**Pass Criteria**: Role assignment blocked for non-admins

---

### TC-009: Staff Role Boundaries

**Objective**: Verify staff roles have appropriate limits

**Steps**:
1. Log in as Designer
2. Attempt to create a new project
3. Attempt to access billing/invoices
4. Attempt to assign roles to other users

**Expected Result**: 
- Designer may have limited project creation rights (depending on implementation)
- Role assignment should be admin-only

**Pass Criteria**: Staff roles respect boundaries

---

### TC-010: Unauthenticated Access

**Objective**: Verify unauthenticated users cannot access protected data

**Steps**:
1. Log out completely
2. Navigate directly to `/portal/dashboard`
3. Navigate directly to `/admin/dashboard`
4. Try to call backend APIs directly via console

**Expected Result**: 
- Should be prompted to log in
- API calls should fail with "Not authenticated"

**Pass Criteria**: All protected resources require authentication

---

### TC-011: Email Verification Required

**Objective**: Verify unverified users have limited access

**Steps**:
1. Create a new account but don't verify email
2. Log in
3. Attempt to access portal features

**Expected Result**: 
- Unverified users should see verification prompt
- Certain actions may be restricted

**Pass Criteria**: Email verification enforced (if configured)

---

### TC-012: Session Security

**Objective**: Verify session management is secure

**Steps**:
1. Log in as Client A
2. Copy session cookies/tokens
3. Log out
4. Attempt to use copied session in incognito window

**Expected Result**: 
- Old session should be invalidated after logout
- Copied session should not work

**Pass Criteria**: Sessions properly invalidated on logout

---

### TC-013: Data Modification Security

**Objective**: Verify clients cannot modify data they don't own

**Steps**:
1. Log in as Client A
2. Get a milestone ID from Client B's project
3. Attempt to update that milestone via API
4. Attempt to update Client B's project status

**Expected Result**: 
- All modification attempts should fail
- "Access denied" or "Staff access required" errors

**Pass Criteria**: Cross-client modifications blocked

---

### TC-014: Invoice Access Control

**Objective**: Verify invoice data is protected

**Steps**:
1. Log in as Client A
2. View Client A's invoices
3. Attempt to view Client B's invoices via API
4. Attempt to create an invoice (client)

**Expected Result**: 
- Client A can only see their invoices
- Invoice creation should require staff role

**Pass Criteria**: Invoice access properly restricted

---

### TC-015: Team Assignment Security

**Objective**: Verify team assignments are staff-only

**Steps**:
1. Log in as Client A
2. Attempt to view team assignments for any project
3. Attempt to add themselves to a team

**Expected Result**: 
- Team assignment data should not be accessible to clients
- Team modification should require staff access

**Pass Criteria**: Team management restricted to staff

---

## Security Checklist Summary

### Authentication & Authorization
- [ ] TC-001: Client isolation - project access
- [ ] TC-002: Client isolation - API bypass prevention
- [ ] TC-003: Client cannot access admin pages
- [ ] TC-004: Staff access to all projects
- [ ] TC-010: Unauthenticated access blocked
- [ ] TC-011: Email verification required (if enabled)
- [ ] TC-012: Session security

### Data Protection
- [ ] TC-005: Preview approval - owner only
- [ ] TC-006: Message security
- [ ] TC-007: File access control
- [ ] TC-013: Data modification security
- [ ] TC-014: Invoice access control
- [ ] TC-015: Team assignment security

### Role Management
- [ ] TC-008: Role escalation prevention
- [ ] TC-009: Staff role boundaries

---

## Automated Testing Script

For each test case, create a simple verification script:

```javascript
// tests/security-tests.js
import wixData from 'wix-data';
import { getProject, getMyProjects } from 'backend/projectService';

// Run with different logged-in users to verify isolation

async function testClientIsolation() {
  console.log("Testing client isolation...");
  
  try {
    // This should fail if current user doesn't own the project
    const project = await getProject("OTHER_CLIENT_PROJECT_ID");
    console.error("FAIL: Accessed another client's project!");
    return false;
  } catch (err) {
    if (err.message === "Access denied") {
      console.log("PASS: Client isolation working");
      return true;
    }
    console.error("UNEXPECTED:", err);
    return false;
  }
}

async function testStaffAccess() {
  console.log("Testing staff access...");
  
  try {
    const projects = await getMyProjects();
    // Staff should see all projects
    console.log(`Found ${projects.items.length} projects`);
    return true;
  } catch (err) {
    console.error("FAIL:", err);
    return false;
  }
}

// Export for manual execution
export { testClientIsolation, testStaffAccess };
```

---

## Reporting

### Test Results Template

```markdown
# Security Test Report

**Date**: [Date]
**Tester**: [Name]
**Environment**: [Dev/Staging/Production]

## Summary
- Total Tests: 15
- Passed: [X]
- Failed: [X]
- Blocked: [X]

## Failed Tests

### [Test ID]: [Test Name]
**Status**: FAILED
**Description**: [What went wrong]
**Evidence**: [Screenshots, logs, etc.]
**Severity**: [Critical/High/Medium/Low]
**Recommendation**: [How to fix]

## Notes
[Any additional observations]
```

---

## Remediation Priority

If tests fail, prioritize fixes in this order:

### Critical (Fix Immediately)
- TC-001, TC-002: Client isolation failures
- TC-008: Role escalation possible
- TC-010: Unauthenticated access to data

### High (Fix Within 24 Hours)
- TC-003: Admin page access by clients
- TC-005, TC-006: Preview/message leakage
- TC-013: Cross-client data modification

### Medium (Fix Within 1 Week)
- TC-009: Staff role boundary issues
- TC-014: Invoice access issues
- TC-015: Team assignment access

### Low (Fix Before Launch)
- TC-011: Email verification bypass
- TC-012: Session management issues
