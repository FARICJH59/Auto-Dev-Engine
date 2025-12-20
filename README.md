# Auto Dev Engine

A Next.js 16 App Router project with Clerk v6 multi-tenant authentication, organization-based access control, and backend integration patterns.

## Features

- ✅ Next.js 16 App Router with TypeScript
- ✅ Clerk v6 authentication with multi-tenant organization support
- ✅ Organization-based access control (RBAC)
- ✅ Protected API routes with automatic header injection
- ✅ Server Component utilities for authentication enforcement
- ✅ Error boundaries and loading states
- ✅ Security headers configuration
- ✅ Comprehensive documentation

## Prerequisites

- Node.js 20.x or later
- npm or yarn
- A Clerk account (sign up at [clerk.com](https://clerk.com))

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/FARICJH59/Auto-Dev-Engine.git
cd Auto-Dev-Engine
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Clerk

1. Create a new application in the [Clerk Dashboard](https://dashboard.clerk.com)
2. Enable the **Organizations** feature in Settings → Organizations
3. Configure organization roles (admin, member, viewer)
4. Copy your API keys

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Clerk keys:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
CLERK_SECRET_KEY=sk_test_your_actual_key_here
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**Important:** Never commit `.env.local` or any file containing real API keys!

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
Auto-Dev-Engine/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API routes
│   │   │   ├── accounts/         # Account management API
│   │   │   ├── executions/       # Execution API
│   │   │   └── projects/         # Projects API
│   │   ├── dashboard/            # Protected dashboard routes
│   │   │   ├── projects/         # Projects page
│   │   │   ├── settings/         # Settings page (admin only)
│   │   │   └── layout.tsx        # Dashboard layout
│   │   ├── select-organization/  # Organization selection
│   │   ├── layout.tsx            # Root layout with ClerkProvider
│   │   └── page.tsx              # Home page
│   ├── lib/                      # Utility libraries
│   │   ├── api-client.ts         # API client utilities
│   │   ├── errors.ts             # Custom error classes
│   │   └── org-context.ts        # Organization context helpers
│   ├── types/                    # TypeScript type definitions
│   │   └── database.ts           # Database schema types
│   └── middleware.ts             # Clerk middleware with header injection
├── docs/                         # Documentation
│   ├── CLERK_INTEGRATION.md      # Clerk setup guide
│   ├── BACKEND_INTEGRATION.md    # Backend integration guide
│   └── MULTI_TENANT_ARCHITECTURE.md  # Multi-tenant patterns
├── .env.example                  # Environment variables template
├── next.config.js                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

## Authentication Flow

1. **Sign In** - User authenticates with Clerk
2. **Organization Selection** - User selects or creates an organization
3. **Dashboard Access** - User can access protected routes with organization context
4. **Organization Switching** - User can switch between organizations using the OrganizationSwitcher

## Protected Routes

### Dashboard Routes

All routes under `/dashboard/*` require:
- ✅ User authentication
- ✅ Organization context (user must be part of an organization)

### API Routes

All routes under `/api/*` (except `/api/health` and `/api/webhooks/*`) require:
- ✅ User authentication
- ✅ Automatic header injection:
  - `X-Organization-ID` - Current organization ID
  - `X-User-ID` - Current user ID
  - `X-Clerk-Org-Role` - User's role in the organization

## Usage Examples

### Server Component with Organization Context

```typescript
import { requireOrg } from '@/lib/org-context';

export default async function MyPage() {
  const { orgId, userId, orgRole } = await requireOrg();
  
  return (
    <div>
      <h1>Organization: {orgId}</h1>
      <p>Role: {orgRole}</p>
    </div>
  );
}
```

### Server Component with Role Requirement

```typescript
import { requireRole } from '@/lib/org-context';

export default async function AdminPage() {
  const { orgId } = await requireRole(['org:admin']);
  
  return <div>Admin-only content</div>;
}
```

### Protected API Route

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireOrg } from '@/lib/org-context';

export async function GET() {
  try {
    const { orgId } = await requireOrg();
    
    // Your API logic here
    return NextResponse.json({ data: [] });
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
```

### Client-Side API Call

```typescript
'use client';

import { clientApiClient } from '@/lib/api-client';

export function MyComponent() {
  async function fetchData() {
    const data = await clientApiClient('/projects');
    console.log(data);
  }
  
  return <button onClick={fetchData}>Fetch</button>;
}
```

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Multi-Tenant Architecture

This application uses a **shared database, shared schema** multi-tenant architecture:

- **Tenant Identification:** Clerk Organization ID
- **Data Isolation:** All database queries filter by `org_id`
- **Header Injection:** Middleware automatically injects organization context
- **Role-Based Access:** Three roles (admin, member, viewer) with different permissions

See [docs/MULTI_TENANT_ARCHITECTURE.md](docs/MULTI_TENANT_ARCHITECTURE.md) for detailed patterns.

## Backend Integration

Your backend service should:

1. Read `X-Organization-ID` header from all requests
2. Filter ALL database queries by `org_id`
3. Check `X-Clerk-Org-Role` for role-based operations
4. Log actions with `X-User-ID` for audit trails

See [docs/BACKEND_INTEGRATION.md](docs/BACKEND_INTEGRATION.md) for implementation examples.

## Security

- ✅ All routes protected by authentication
- ✅ Organization context enforced on protected routes
- ✅ Role-based access control (RBAC)
- ✅ Security headers configured (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- ✅ Multi-tenant data isolation enforced
- ✅ No hardcoded secrets (all in environment variables)

## Documentation

- [Clerk Integration Guide](docs/CLERK_INTEGRATION.md) - Complete Clerk v6 setup and usage
- [Backend Integration Guide](docs/BACKEND_INTEGRATION.md) - How to integrate with backend services
- [Multi-Tenant Architecture](docs/MULTI_TENANT_ARCHITECTURE.md) - Architecture patterns and best practices

## Troubleshooting

### Build fails with Clerk error

The build requires valid Clerk API keys. Make sure you have:
1. Created a `.env.local` file
2. Added valid Clerk keys from your dashboard
3. Keys are in the correct format (pk_test_... and sk_test_...)

### Redirected to /select-organization

This means you're authenticated but not part of an organization. Create or join an organization to continue.

### 401 Unauthorized errors

Check that:
- You're signed in with Clerk
- Your session is valid
- The route is properly configured

### 403 Forbidden errors

You don't have the required role. Check:
- Your role in the current organization
- The required roles for the route
- Contact an organization admin to change your role

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Next.js + Clerk Quickstart](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Organizations Guide](https://clerk.com/docs/organizations/overview)

