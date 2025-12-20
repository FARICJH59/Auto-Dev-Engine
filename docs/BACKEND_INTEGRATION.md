# Backend Integration Guide

This guide explains how to integrate a backend service with the Next.js frontend using the organization context headers injected by Clerk middleware.

## Overview

The Next.js middleware automatically injects three critical headers into all API requests:

- **`X-Organization-ID`** - Tenant isolation identifier
- **`X-User-ID`** - User attribution identifier
- **`X-Clerk-Org-Role`** - User's role in the organization

Your backend **MUST** read these headers to enforce multi-tenant data isolation and role-based access control.

## Header Injection Flow

```
1. User authenticates with Clerk
2. User selects/joins organization
3. Middleware intercepts API request
4. Middleware injects headers:
   - X-Organization-ID: org_abc123
   - X-User-ID: user_xyz789
   - X-Clerk-Org-Role: org:admin
5. Request forwarded to backend
6. Backend reads headers and enforces isolation
```

## Required Headers

### X-Organization-ID

**Purpose:** Multi-tenant data isolation

**Format:** `org_[a-zA-Z0-9]{24}` (Clerk organization ID)

**Usage:**
```sql
-- CORRECT: Filter by organization
SELECT * FROM projects WHERE org_id = $1;

-- WRONG: No org filter (security vulnerability!)
SELECT * FROM projects;
```

### X-User-ID

**Purpose:** User attribution and audit logging

**Format:** `user_[a-zA-Z0-9]{24}` (Clerk user ID)

**Usage:**
```sql
-- Attribute actions to user
INSERT INTO audit_logs (org_id, user_id, action, timestamp)
VALUES ($1, $2, 'project.create', NOW());
```

### X-Clerk-Org-Role

**Purpose:** Role-based access control (RBAC)

**Format:** One of:
- `org:admin` - Full administrative access
- `org:member` - Standard member access
- `org:viewer` - Read-only access

**Usage:**
```python
# Check role before allowing action
if role != 'org:admin':
    return {'error': 'Insufficient permissions'}, 403
```

## Backend Implementation Patterns

### Pattern 1: Read Headers (Required)

All backend handlers MUST read and validate the organization header.

#### Node.js/Express Example

```javascript
const express = require('express');
const app = express();

// Middleware to extract and validate headers
app.use((req, res, next) => {
  const orgId = req.headers['x-organization-id'];
  const userId = req.headers['x-user-id'];
  const orgRole = req.headers['x-clerk-org-role'];

  if (!orgId) {
    return res.status(401).json({ error: 'Organization context required' });
  }

  // Attach to request for use in handlers
  req.orgContext = { orgId, userId, orgRole };
  next();
});

// Example handler
app.get('/api/projects', async (req, res) => {
  const { orgId } = req.orgContext;
  
  // Query with org_id filter
  const projects = await db.query(
    'SELECT * FROM projects WHERE org_id = $1',
    [orgId]
  );
  
  res.json({ data: projects });
});
```

#### Python/FastAPI Example

```python
from fastapi import FastAPI, Header, HTTPException
from typing import Optional

app = FastAPI()

async def get_org_context(
    x_organization_id: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None),
    x_clerk_org_role: Optional[str] = Header(None),
):
    if not x_organization_id:
        raise HTTPException(status_code=401, detail="Organization context required")
    
    return {
        "org_id": x_organization_id,
        "user_id": x_user_id,
        "org_role": x_clerk_org_role,
    }

@app.get("/api/projects")
async def get_projects(org_context: dict = Depends(get_org_context)):
    org_id = org_context["org_id"]
    
    # Query with org_id filter
    projects = await db.fetch_all(
        "SELECT * FROM projects WHERE org_id = :org_id",
        {"org_id": org_id}
    )
    
    return {"data": projects}
```

#### Go/Gin Example

```go
package main

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

type OrgContext struct {
    OrgID   string
    UserID  string
    OrgRole string
}

func OrgContextMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        orgID := c.GetHeader("X-Organization-ID")
        userID := c.GetHeader("X-User-ID")
        orgRole := c.GetHeader("X-Clerk-Org-Role")

        if orgID == "" {
            c.JSON(http.StatusUnauthorized, gin.H{
                "error": "Organization context required",
            })
            c.Abort()
            return
        }

        c.Set("orgContext", OrgContext{
            OrgID:   orgID,
            UserID:  userID,
            OrgRole: orgRole,
        })
        c.Next()
    }
}

func main() {
    r := gin.Default()
    r.Use(OrgContextMiddleware())

    r.GET("/api/projects", func(c *gin.Context) {
        ctx := c.MustGet("orgContext").(OrgContext)
        
        // Query with org_id filter
        var projects []Project
        db.Where("org_id = ?", ctx.OrgID).Find(&projects)
        
        c.JSON(http.StatusOK, gin.H{"data": projects})
    })

    r.Run(":8080")
}
```

### Pattern 2: Enforce Multi-Tenant Isolation (Critical)

**NEVER** return data without filtering by `org_id`.

#### ✅ CORRECT - Always filter by org_id

```sql
-- List projects
SELECT * FROM projects WHERE org_id = $1;

-- Get specific project
SELECT * FROM projects WHERE id = $1 AND org_id = $2;

-- Update project
UPDATE projects SET name = $1 WHERE id = $2 AND org_id = $3;

-- Delete project
DELETE FROM projects WHERE id = $1 AND org_id = $2;
```

#### ❌ WRONG - Missing org_id filter (SECURITY VULNERABILITY!)

```sql
-- NEVER do this - allows cross-tenant data access!
SELECT * FROM projects WHERE id = $1;
```

### Pattern 3: Role-Based Access Control

Check the `X-Clerk-Org-Role` header before allowing privileged operations.

```javascript
function requireRole(allowedRoles) {
  return (req, res, next) => {
    const { orgRole } = req.orgContext;
    
    if (!allowedRoles.includes(orgRole)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required_roles: allowedRoles,
        current_role: orgRole,
      });
    }
    
    next();
  };
}

// Admin-only endpoint
app.delete('/api/projects/:id', 
  requireRole(['org:admin']), 
  async (req, res) => {
    const { orgId } = req.orgContext;
    const { id } = req.params;
    
    await db.query(
      'DELETE FROM projects WHERE id = $1 AND org_id = $2',
      [id, orgId]
    );
    
    res.json({ success: true });
  }
);
```

### Pattern 4: Audit Logging

Log all actions with organization and user context for compliance and debugging.

```javascript
async function logAction(orgContext, action, resourceType, resourceId, metadata = {}) {
  await db.query(
    `INSERT INTO audit_logs 
     (id, org_id, user_id, action, resource_type, resource_id, metadata, timestamp)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
    [
      generateId(),
      orgContext.orgId,
      orgContext.userId,
      action,
      resourceType,
      resourceId,
      JSON.stringify(metadata),
    ]
  );
}

// Example usage
app.post('/api/projects', async (req, res) => {
  const { orgId, userId } = req.orgContext;
  const { name, description } = req.body;
  
  const project = await createProject(orgId, name, description, userId);
  
  // Log the action
  await logAction(
    req.orgContext,
    'project.create',
    'project',
    project.id,
    { name, description }
  );
  
  res.json({ data: project });
});
```

### Pattern 5: Quota Enforcement

Check organization quotas before allowing resource-intensive operations.

```javascript
app.post('/api/executions', async (req, res) => {
  const { orgId } = req.orgContext;
  
  // Check quota
  const account = await db.query(
    'SELECT executions_used, executions_limit FROM accounts WHERE org_id = $1',
    [orgId]
  );
  
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }
  
  if (account.executions_used >= account.executions_limit) {
    return res.status(402).json({
      error: 'Execution quota exceeded',
      used: account.executions_used,
      limit: account.executions_limit,
    });
  }
  
  // Create execution
  const execution = await createExecution(orgId, req.body);
  
  // Increment usage
  await db.query(
    'UPDATE accounts SET executions_used = executions_used + 1 WHERE org_id = $1',
    [orgId]
  );
  
  res.json({ data: execution });
});
```

## Database Schema Requirements

All tables MUST include an `org_id` column for tenant isolation.

### Example Schema

```sql
-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    org_id VARCHAR(255) NOT NULL,  -- Tenant isolation key
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Index for fast org-scoped queries
    INDEX idx_projects_org_id (org_id),
    
    -- Composite index for common queries
    INDEX idx_projects_org_created (org_id, created_at DESC)
);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    org_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(255) NOT NULL,
    resource_id VARCHAR(255) NOT NULL,
    metadata JSONB,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    
    INDEX idx_audit_logs_org_id (org_id),
    INDEX idx_audit_logs_timestamp (timestamp DESC)
);

-- Accounts table
CREATE TABLE accounts (
    id UUID PRIMARY KEY,
    org_id VARCHAR(255) NOT NULL UNIQUE,  -- One account per org
    billing_status VARCHAR(50) NOT NULL,
    executions_used INTEGER NOT NULL DEFAULT 0,
    executions_limit INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    INDEX idx_accounts_org_id (org_id)
);
```

## Security Checklist

- [ ] Read `X-Organization-ID` header in all endpoints
- [ ] Return 401 if organization header is missing
- [ ] Filter ALL database queries by `org_id`
- [ ] Check `X-Clerk-Org-Role` for privileged operations
- [ ] Log actions with `X-User-ID` for audit trail
- [ ] Never allow users to specify `org_id` in request body
- [ ] Use prepared statements to prevent SQL injection
- [ ] Add database indexes on `org_id` columns
- [ ] Test with multiple organizations to verify isolation
- [ ] Implement rate limiting per organization

## Testing Multi-Tenant Isolation

### Test Case 1: Cross-Tenant Data Access

```bash
# Should return data for org_abc123
curl -H "X-Organization-ID: org_abc123" http://localhost:8080/api/projects

# Should return DIFFERENT data for org_xyz789
curl -H "X-Organization-ID: org_xyz789" http://localhost:8080/api/projects

# Verify no data leakage between organizations
```

### Test Case 2: Missing Organization Header

```bash
# Should return 401 Unauthorized
curl http://localhost:8080/api/projects
```

### Test Case 3: Role-Based Access Control

```bash
# Should succeed (admin role)
curl -X DELETE \
  -H "X-Organization-ID: org_abc123" \
  -H "X-Clerk-Org-Role: org:admin" \
  http://localhost:8080/api/projects/123

# Should return 403 Forbidden (viewer role)
curl -X DELETE \
  -H "X-Organization-ID: org_abc123" \
  -H "X-Clerk-Org-Role: org:viewer" \
  http://localhost:8080/api/projects/123
```

## Common Pitfalls

1. **Forgetting to filter by org_id** - Always include `WHERE org_id = $1`
2. **Using user-provided org_id** - Only trust the header, never request body
3. **Missing role checks** - Check role for DELETE, UPDATE operations
4. **No audit logging** - Always log who did what and when
5. **Hardcoded organization IDs** - Use header value dynamically
6. **Missing indexes** - Add indexes on org_id for performance
7. **Inconsistent header names** - Use exact header names (case-sensitive)

## Resources

- [Multi-Tenant Architecture Patterns](../docs/MULTI_TENANT_ARCHITECTURE.md)
- [Clerk Session Claims](https://clerk.com/docs/backend-requests/making/custom-session-token)
- [OWASP Multi-Tenancy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multitenant_Application_Cheat_Sheet.html)
