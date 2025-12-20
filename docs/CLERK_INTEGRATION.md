# Clerk v6 Integration Guide

This guide explains how to set up and use Clerk v6 authentication with multi-tenant organization support in this Next.js 16 application.

## Setup

### 1. Environment Variables

Create a `.env.local` file in the root directory with your Clerk credentials:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
```

Get these keys from the [Clerk Dashboard](https://dashboard.clerk.com).

### 2. Enable Organizations

In your Clerk Dashboard:

1. Navigate to **Settings** → **Organizations**
2. Enable **Organizations** feature
3. Configure organization settings:
   - Allow users to create organizations
   - Set default role for new members
   - Configure organization permissions

### 3. Configure Roles

This application uses three organization roles:

- **`org:admin`** - Full administrative access
- **`org:member`** - Standard member access
- **`org:viewer`** - Read-only access

Configure these roles in Clerk Dashboard under **Organizations** → **Roles & Permissions**.

## Middleware Configuration

The middleware (`src/middleware.ts`) handles:

1. **Authentication** - Redirects unauthenticated users to `/sign-in`
2. **Organization Context** - Redirects users without an organization to `/select-organization`
3. **Header Injection** - Injects organization context headers for API routes:
   - `X-Organization-ID` - Current organization ID
   - `X-User-ID` - Current user ID
   - `X-Clerk-Org-Role` - User's role in the organization

### Protected Routes

- **Dashboard Routes** (`/dashboard/*`) - Require authentication + organization context
- **API Routes** (`/api/*`) - Require authentication + inject headers
- **Exceptions**:
  - `/api/health` - Public health check
  - `/api/webhooks/*` - Public webhooks (verify signatures separately)

## Authentication Flow

### 1. Sign In Flow

```
User → Sign In → Select/Create Organization → Dashboard
```

### 2. Organization Selection Flow

If a user doesn't have an organization context:

```typescript
// User is redirected to /select-organization
// After selection, redirected back to original URL
```

### 3. Organization Switching

Users can switch organizations using the `<OrganizationSwitcher>` component in the dashboard layout.

## Server Components

### Enforce Authentication + Organization Context

```typescript
import { requireOrg } from '@/lib/org-context';

export default async function MyPage() {
  const { orgId, userId, orgRole } = await requireOrg();
  
  // Page content - user is authenticated and has org context
}
```

### Enforce Role-Based Access

```typescript
import { requireRole } from '@/lib/org-context';

export default async function AdminPage() {
  const { orgId, userId, orgRole } = await requireRole(['org:admin']);
  
  // Page content - user is admin
}
```

### Optional Context Retrieval

```typescript
import { getOrgContext } from '@/lib/org-context';

export default async function MyPage() {
  const context = await getOrgContext();
  
  if (!context) {
    // User is not authenticated or lacks org context
  }
}
```

## API Routes

### Protected API Route Example

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireOrg } from '@/lib/org-context';

export async function GET(request: NextRequest) {
  try {
    const { orgId, userId } = await requireOrg();
    
    // API logic with org context
    return NextResponse.json({ data: [] });
  } catch (error) {
    if (error instanceof Error && error.name === 'AuthError') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    // Handle other errors
  }
}
```

### Role-Based API Route Example

```typescript
import { requireRole } from '@/lib/org-context';

export async function DELETE(request: NextRequest) {
  try {
    const { orgId } = await requireRole(['org:admin']);
    
    // Admin-only logic
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof PermissionError) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    // Handle other errors
  }
}
```

## Client Components

### Using Clerk Hooks

```typescript
'use client';

import { useOrganization, useUser } from '@clerk/nextjs';

export function MyComponent() {
  const { organization } = useOrganization();
  const { user } = useUser();
  
  return (
    <div>
      <p>Organization: {organization?.name}</p>
      <p>User: {user?.firstName}</p>
    </div>
  );
}
```

### Making API Calls from Client

```typescript
'use client';

import { clientApiClient } from '@/lib/api-client';

export function MyComponent() {
  async function handleClick() {
    try {
      const data = await clientApiClient('/projects');
      console.log(data);
    } catch (error) {
      console.error('API error:', error);
    }
  }
  
  return <button onClick={handleClick}>Fetch Projects</button>;
}
```

## Webhooks

To receive Clerk webhook events:

1. Create a webhook endpoint in Clerk Dashboard
2. Add the webhook secret to `.env.local`:
   ```
   CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```
3. Create a webhook handler at `src/app/api/webhooks/clerk/route.ts`

Example webhook handler:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }
  
  const payload = await request.text();
  const headers = {
    'svix-id': request.headers.get('svix-id') || '',
    'svix-timestamp': request.headers.get('svix-timestamp') || '',
    'svix-signature': request.headers.get('svix-signature') || '',
  };
  
  try {
    const wh = new Webhook(webhookSecret);
    const event = wh.verify(payload, headers);
    
    // Handle webhook event
    console.log('Webhook event:', event);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
}
```

## Troubleshooting

### User Redirected to Sign In

- Check that `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are set
- Verify keys are correct in Clerk Dashboard
- Clear browser cookies and try again

### Organization Context Missing

- Ensure user has created or joined an organization
- Check that Organizations feature is enabled in Clerk Dashboard
- Verify middleware is correctly configured

### 401 Unauthorized Errors

- Check that the route is properly protected with `requireOrg()` or `requireRole()`
- Verify user is authenticated
- Check that session is valid

### 403 Forbidden Errors

- Verify user has the required role
- Check role configuration in Clerk Dashboard
- Ensure `requireRole()` is passed correct role array

## Best Practices

1. **Always use `requireOrg()` in protected routes** - Ensures authentication and org context
2. **Use `requireRole()` for admin-only features** - Enforces role-based access control
3. **Never hardcode organization IDs** - Always get from session context
4. **Validate API requests** - Check headers are properly injected by middleware
5. **Handle errors gracefully** - Provide clear error messages to users
6. **Use webhooks for sync** - Keep your database in sync with Clerk data
7. **Test with multiple organizations** - Verify tenant isolation works correctly

## Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Next.js Quickstart](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Organizations Guide](https://clerk.com/docs/organizations/overview)
- [Next.js 16 Documentation](https://nextjs.org/docs)
