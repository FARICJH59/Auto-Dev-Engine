# Multi-Tenant Architecture Guide

This document outlines the multi-tenant architecture patterns used in this application, focusing on data isolation, security, and scalability.

## Overview

This application uses a **shared database, shared schema** multi-tenant architecture with organization-based isolation. Each organization is a separate tenant with isolated data.

## Architecture Components

### 1. Tenant Identification

**Primary Key:** Clerk Organization ID (`org_abc123`)

**How it works:**
1. User authenticates with Clerk
2. User selects/joins an organization
3. Clerk session includes `orgId` claim
4. Middleware injects `X-Organization-ID` header
5. Backend filters all queries by `org_id`

### 2. Data Isolation Strategy

#### Database Level

All tables include an `org_id` column as a tenant discriminator:

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    org_id VARCHAR(255) NOT NULL,  -- Tenant isolation key
    name VARCHAR(255) NOT NULL,
    -- other columns
    
    INDEX idx_org_id (org_id)  -- Essential for performance
);
```

#### Application Level

Every query MUST include the `org_id` filter:

```typescript
// CORRECT
const projects = await db.query(
  'SELECT * FROM projects WHERE org_id = $1',
  [orgId]
);

// WRONG - Security vulnerability!
const projects = await db.query('SELECT * FROM projects');
```

#### Middleware Level

The Next.js middleware injects organization context into request headers:

```typescript
// src/middleware.ts
export default clerkMiddleware(async (auth, req) => {
  const { orgId, userId, orgRole } = await auth();
  
  if (req.nextUrl.pathname.startsWith('/api')) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('X-Organization-ID', orgId);
    requestHeaders.set('X-User-ID', userId);
    requestHeaders.set('X-Clerk-Org-Role', orgRole);
    
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }
});
```

## Security Model

### Principle: Defense in Depth

Multiple layers of security ensure data isolation:

1. **Authentication** - Clerk verifies user identity
2. **Authorization** - Clerk verifies organization membership
3. **Middleware** - Injects verified organization context
4. **Application** - Enforces org_id filtering
5. **Database** - Indexes optimize org-scoped queries

### Access Control Hierarchy

```
Organization (Tenant)
├── org:admin (Full access)
├── org:member (Standard access)
└── org:viewer (Read-only access)
```

### Role-Based Access Control (RBAC)

Implemented at two levels:

#### Frontend (Next.js)

```typescript
// Require specific role
import { requireRole } from '@/lib/org-context';

export default async function AdminPage() {
  const context = await requireRole(['org:admin']);
  // Admin-only content
}
```

#### Backend (API)

```typescript
// Check role header
const role = req.headers['x-clerk-org-role'];
if (role !== 'org:admin') {
  return res.status(403).json({ error: 'Insufficient permissions' });
}
```

## Data Flow Architecture

### Read Operations

```
User Request
    ↓
Clerk Authentication
    ↓
Middleware (inject org_id)
    ↓
API Route (requireOrg())
    ↓
Database Query (WHERE org_id = $1)
    ↓
Response (filtered data)
```

### Write Operations

```
User Request (with data)
    ↓
Clerk Authentication
    ↓
Middleware (inject org_id, user_id)
    ↓
API Route (requireOrg())
    ↓
Validate Input
    ↓
Database Insert (with org_id)
    ↓
Audit Log (with user_id)
    ↓
Response (created resource)
```

## Database Design Patterns

### Pattern 1: Tenant Discriminator Column

Every table includes `org_id`:

```sql
CREATE TABLE {table_name} (
    id UUID PRIMARY KEY,
    org_id VARCHAR(255) NOT NULL,
    -- other columns
    
    -- Essential indexes
    INDEX idx_{table}_org_id (org_id),
    INDEX idx_{table}_org_created (org_id, created_at DESC)
);
```

### Pattern 2: Composite Keys

Use composite indexes for common query patterns:

```sql
-- Fast lookup of user's projects in an org
CREATE INDEX idx_projects_org_user ON projects(org_id, created_by);

-- Fast pagination within org
CREATE INDEX idx_projects_org_date ON projects(org_id, created_at DESC);
```

### Pattern 3: Foreign Key Constraints

Ensure referential integrity within tenant:

```sql
CREATE TABLE executions (
    id UUID PRIMARY KEY,
    org_id VARCHAR(255) NOT NULL,
    project_id UUID NOT NULL,
    
    -- Ensure project belongs to same org
    FOREIGN KEY (project_id) REFERENCES projects(id),
    CHECK (org_id = (SELECT org_id FROM projects WHERE id = project_id))
);
```

### Pattern 4: Row-Level Security (Optional)

For additional security, use PostgreSQL row-level security:

```sql
-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY tenant_isolation ON projects
    USING (org_id = current_setting('app.current_org_id')::text);

-- Set org_id in application
SET app.current_org_id = 'org_abc123';
```

## API Design Patterns

### Pattern 1: Context Extraction

Always extract organization context first:

```typescript
export async function GET(request: NextRequest) {
  const { orgId, userId } = await requireOrg();
  
  // Use orgId for all queries
}
```

### Pattern 2: Response Metadata

Include tenant context in responses for debugging:

```typescript
return NextResponse.json({
  success: true,
  data: projects,
  meta: {
    orgId,
    count: projects.length,
    timestamp: new Date().toISOString(),
  },
});
```

### Pattern 3: Error Handling

Return appropriate status codes:

- **401 Unauthorized** - Missing authentication
- **403 Forbidden** - Insufficient permissions
- **402 Payment Required** - Quota exceeded
- **404 Not Found** - Resource not found in org
- **500 Internal Server Error** - Server error

```typescript
try {
  const { orgId } = await requireOrg();
  // Logic
} catch (error) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  if (error instanceof PermissionError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  if (error instanceof QuotaError) {
    return NextResponse.json({ error: error.message }, { status: 402 });
  }
  return NextResponse.json({ error: 'Internal error' }, { status: 500 });
}
```

## Quota Management

### Per-Organization Quotas

Track resource usage per tenant:

```typescript
// Check quota before creating resource
const account = await getAccount(orgId);

if (account.executions_used >= account.executions_limit) {
  throw new QuotaError('Execution quota exceeded');
}

// Create resource
await createExecution(orgId, data);

// Increment usage
await incrementUsage(orgId, 'executions');
```

### Quota Enforcement Points

1. **API Routes** - Before expensive operations
2. **Background Jobs** - When processing async tasks
3. **Webhooks** - When receiving external events

## Audit Logging

### What to Log

Log ALL data modifications:

```typescript
interface AuditLog {
  id: string;
  org_id: string;           // Which tenant
  user_id: string;          // Who did it
  action: string;           // What they did
  resource_type: string;    // What type of resource
  resource_id: string;      // Which specific resource
  metadata: object;         // Additional context
  timestamp: string;        // When it happened
}
```

### Example Actions

- `project.create`
- `project.update`
- `project.delete`
- `execution.start`
- `execution.complete`
- `user.invite`
- `settings.update`

### Audit Log Usage

```typescript
await createAuditLog({
  org_id: orgId,
  user_id: userId,
  action: 'project.create',
  resource_type: 'project',
  resource_id: project.id,
  metadata: { name: project.name },
  timestamp: new Date().toISOString(),
});
```

## Scalability Considerations

### Database Optimization

1. **Index all org_id columns** - Essential for query performance
2. **Use composite indexes** - For common query patterns
3. **Partition large tables** - By org_id or date ranges
4. **Connection pooling** - Reuse database connections

### Caching Strategy

Cache per organization:

```typescript
// Cache key includes org_id
const cacheKey = `projects:${orgId}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const projects = await db.query(/* ... */);
await redis.set(cacheKey, JSON.stringify(projects), 'EX', 300);
```

### Rate Limiting

Apply rate limits per organization:

```typescript
// Rate limit by org_id, not IP
const rateLimit = await checkRateLimit(orgId);

if (rateLimit.exceeded) {
  return res.status(429).json({ error: 'Rate limit exceeded' });
}
```

## Migration Strategies

### Adding New Tenant

1. Create organization in Clerk
2. Insert account record: `INSERT INTO accounts (org_id, ...) VALUES ($1, ...)`
3. Set initial quotas
4. User joins organization
5. Ready to use

### Moving Between Plans

```sql
-- Upgrade to higher tier
UPDATE accounts 
SET billing_status = 'active',
    executions_limit = 1000
WHERE org_id = $1;
```

### Data Export (Tenant Offboarding)

```typescript
async function exportOrgData(orgId: string) {
  const projects = await db.query('SELECT * FROM projects WHERE org_id = $1', [orgId]);
  const executions = await db.query('SELECT * FROM executions WHERE org_id = $1', [orgId]);
  const auditLogs = await db.query('SELECT * FROM audit_logs WHERE org_id = $1', [orgId]);
  
  return {
    projects,
    executions,
    audit_logs: auditLogs,
  };
}
```

## Testing Multi-Tenancy

### Unit Tests

Test tenant isolation:

```typescript
test('should only return projects for current org', async () => {
  const org1Projects = await getProjects('org_1');
  const org2Projects = await getProjects('org_2');
  
  expect(org1Projects).not.toEqual(org2Projects);
  expect(org1Projects.every(p => p.org_id === 'org_1')).toBe(true);
  expect(org2Projects.every(p => p.org_id === 'org_2')).toBe(true);
});
```

### Integration Tests

Test with multiple organizations:

```typescript
test('should isolate data between organizations', async () => {
  // Create project in org 1
  await createProject('org_1', 'Project 1');
  
  // Try to access from org 2
  const org2Projects = await getProjects('org_2');
  
  expect(org2Projects).toHaveLength(0);
});
```

### Security Tests

Test for data leakage:

```typescript
test('should prevent cross-tenant access', async () => {
  const project = await createProject('org_1', 'Secret Project');
  
  // Try to access with different org_id
  const result = await getProject('org_2', project.id);
  
  expect(result).toBeNull();
});
```

## Monitoring & Alerting

### Metrics to Track

- **Queries without org_id filter** - Security risk!
- **Cross-tenant access attempts** - Potential attack
- **Quota usage per org** - Billing and capacity
- **API latency per org** - Performance issues
- **Error rates per org** - Quality issues

### Alerts to Configure

1. **Security:** Query without org_id filter detected
2. **Security:** Unauthorized access attempt
3. **Usage:** Organization nearing quota limit
4. **Performance:** Slow queries (>1s) for org
5. **Error:** High error rate (>5%) for org

## Best Practices Checklist

- [ ] All tables include `org_id` column
- [ ] All queries filter by `org_id`
- [ ] Indexes exist on all `org_id` columns
- [ ] API routes use `requireOrg()` or `requireRole()`
- [ ] Role checks for privileged operations
- [ ] Audit logging for all data modifications
- [ ] Quota enforcement before expensive operations
- [ ] Error handling with appropriate status codes
- [ ] Tests verify tenant isolation
- [ ] Monitoring for security and performance

## Resources

- [Clerk Organizations Documentation](https://clerk.com/docs/organizations/overview)
- [Multi-Tenant SaaS Patterns](https://docs.aws.amazon.com/whitepapers/latest/saas-architecture-fundamentals/multi-tenant-data-isolation.html)
- [PostgreSQL Row-Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [OWASP Multi-Tenancy Security](https://cheatsheetseries.owasp.org/cheatsheets/Multitenant_Application_Cheat_Sheet.html)
