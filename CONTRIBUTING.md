# Contributing to Auto Dev Engine

Thank you for your interest in contributing! This document provides guidelines and best practices for contributing to this project.

## Development Setup

See [SETUP.md](SETUP.md) for complete setup instructions.

## Code Style

### TypeScript

- Use TypeScript strict mode
- Define types for all function parameters and return values
- Avoid `any` type - use `unknown` if necessary
- Use interfaces for object types

### React Components

**Server Components (default):**
```typescript
// No 'use client' directive
export default async function MyPage() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

**Client Components (when needed):**
```typescript
'use client';

export function MyComponent() {
  const [state, setState] = useState();
  return <div>{state}</div>;
}
```

### Naming Conventions

- **Files:** `kebab-case.tsx` or `kebab-case.ts`
- **Components:** `PascalCase`
- **Functions:** `camelCase`
- **Constants:** `UPPER_SNAKE_CASE`
- **Types/Interfaces:** `PascalCase`

### Organization Context

**Always use organization context in protected routes:**

```typescript
// Server Component
import { requireOrg } from '@/lib/org-context';

export default async function MyPage() {
  const { orgId, userId } = await requireOrg();
  // Component logic
}
```

**For role-based access:**

```typescript
import { requireRole } from '@/lib/org-context';

export default async function AdminPage() {
  const context = await requireRole(['org:admin']);
  // Admin-only logic
}
```

## API Routes

### Structure

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireOrg } from '@/lib/org-context';

export async function GET() {
  try {
    const { orgId } = await requireOrg();
    
    // API logic here
    
    return NextResponse.json({ 
      success: true, 
      data: [] 
    });
  } catch (error) {
    // Error handling
    return NextResponse.json(
      { success: false, error: 'Error message' },
      { status: 500 }
    );
  }
}
```

### Status Codes

Use appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `402` - Payment Required (quota exceeded)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Response Format

Consistent response format:

```typescript
// Success
{
  success: true,
  data: { /* result */ },
  meta: { /* optional metadata */ }
}

// Error
{
  success: false,
  error: "Error message",
  details?: { /* optional error details */ }
}
```

## Database Integration

### Multi-Tenant Isolation

**ALWAYS** filter queries by `org_id`:

```typescript
// ✅ CORRECT
const projects = await db.query(
  'SELECT * FROM projects WHERE org_id = $1',
  [orgId]
);

// ❌ WRONG - Security vulnerability!
const projects = await db.query('SELECT * FROM projects');
```

### Schema Requirements

All tables MUST include:

```sql
CREATE TABLE table_name (
  id UUID PRIMARY KEY,
  org_id VARCHAR(255) NOT NULL,  -- Required for multi-tenancy
  -- other columns
  
  INDEX idx_table_org_id (org_id)  -- Required for performance
);
```

## Testing

### Manual Testing Checklist

Before submitting a PR:

- [ ] Test with multiple organizations
- [ ] Verify data isolation (org A can't see org B's data)
- [ ] Test role-based access (admin, member, viewer)
- [ ] Test error handling (invalid inputs, missing auth)
- [ ] Verify TypeScript compiles (`npm run build`)
- [ ] Run ESLint (`npm run lint`)
- [ ] Test in browser (sign in, switch orgs, etc.)

### Test Data Isolation

```typescript
// Example test flow
1. Create project in Org A
2. Switch to Org B
3. Verify project from Org A is not visible
4. Create project in Org B
5. Switch back to Org A
6. Verify only Org A projects are visible
```

## Security

### Never Commit Secrets

- Don't commit `.env.local` or `.env*.local`
- Don't hardcode API keys or secrets
- Use environment variables for all sensitive data

### Multi-Tenant Security

- Always filter by `org_id`
- Never trust user-provided `org_id` (use session context)
- Validate all inputs
- Use prepared statements to prevent SQL injection
- Check roles before privileged operations

### Authentication

- Use `requireOrg()` for all protected routes
- Use `requireRole()` for admin/privileged operations
- Never bypass middleware authentication

## Documentation

### Code Comments

Add comments for:
- Complex business logic
- Security-critical code
- Non-obvious behavior
- Multi-tenant considerations

```typescript
/**
 * Fetch projects for the current organization
 * 
 * SECURITY: Always filters by org_id to ensure tenant isolation
 * 
 * @returns Array of projects for the current org
 */
export async function getProjects(orgId: string) {
  // CRITICAL: Must filter by org_id for multi-tenant isolation
  return await db.query(
    'SELECT * FROM projects WHERE org_id = $1',
    [orgId]
  );
}
```

### Documentation Updates

When adding new features:
- Update relevant documentation in `/docs`
- Update README.md if needed
- Add examples to SETUP.md if applicable

## Pull Request Process

### Before Submitting

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes:**
   - Follow code style guidelines
   - Add necessary comments
   - Test thoroughly

3. **Run checks:**
   ```bash
   npm run lint
   npm run build
   ```

4. **Commit with clear message:**
   ```bash
   git commit -m "Add feature: clear description"
   ```

5. **Push to your fork:**
   ```bash
   git push origin feature/my-feature
   ```

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested with multiple organizations
- [ ] Verified data isolation
- [ ] Tested role-based access
- [ ] No TypeScript errors
- [ ] No ESLint warnings

## Screenshots (if applicable)
Add screenshots of UI changes

## Documentation
- [ ] Updated relevant documentation
- [ ] Added code comments
- [ ] Updated README if needed
```

## Common Patterns

### Server-Side Data Fetching

```typescript
import { requireOrg } from '@/lib/org-context';
import { apiClient } from '@/lib/api-client';

export default async function MyPage() {
  const { orgId } = await requireOrg();
  
  // Fetch data server-side
  const data = await apiClient('/api/endpoint');
  
  return <div>...</div>;
}
```

### Client-Side Data Fetching

```typescript
'use client';

import { useState, useEffect } from 'react';
import { clientApiClient } from '@/lib/api-client';

export function MyComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    clientApiClient('/endpoint')
      .then(setData)
      .catch(console.error);
  }, []);
  
  return <div>...</div>;
}
```

### Error Handling

```typescript
try {
  const result = await someOperation();
  return NextResponse.json({ success: true, data: result });
} catch (error) {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }
  
  if (error instanceof PermissionError) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 403 }
    );
  }
  
  console.error('Unexpected error:', error);
  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  );
}
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (protected)
│   ├── dashboard/         # Dashboard pages (protected)
│   ├── layout.tsx         # Root layout with ClerkProvider
│   └── page.tsx           # Home page
├── lib/                   # Utility libraries
│   ├── api-client.ts      # API client utilities
│   ├── errors.ts          # Custom error classes
│   └── org-context.ts     # Organization context helpers
├── types/                 # TypeScript types
│   └── database.ts        # Database schema types
└── middleware.ts          # Clerk middleware
```

## Questions?

- Read the [documentation](./docs)
- Open an issue for bugs or feature requests
- Check existing issues before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
