# Quick Setup Guide

This guide will help you get the Auto Dev Engine running locally in under 5 minutes.

## Prerequisites

- Node.js 20.x or later
- npm or yarn
- A Clerk account (free tier works)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This will install:
- Next.js 15.5.9
- React 19
- Clerk v6 (@clerk/nextjs)
- TypeScript
- ESLint

### 2. Create Clerk Application

1. Go to [clerk.com](https://clerk.com) and sign up/sign in
2. Click "Add application"
3. Choose a name (e.g., "Auto Dev Engine")
4. Select authentication methods (Email, Google, GitHub, etc.)
5. Click "Create application"

### 3. Enable Organizations

In your Clerk Dashboard:

1. Navigate to **Configure** → **Organizations**
2. Toggle **Enable organizations** ON
3. Configure settings:
   - ✅ Allow users to create organizations
   - ✅ Enable organization switcher
   - Set "Maximum number of organizations per user" (e.g., 5)
4. Click **Save**

### 4. Configure Organization Roles

In your Clerk Dashboard:

1. Go to **Configure** → **Organizations** → **Roles & Permissions**
2. Ensure these roles exist (they should be default):
   - `org:admin` - Full administrative access
   - `org:member` - Standard member access
   - (Optional) Add custom roles like `org:viewer` for read-only access
3. Click **Save** if you made changes

### 5. Get Your API Keys

In your Clerk Dashboard:

1. Navigate to **Developers** → **API Keys**
2. Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)
3. Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)

### 6. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and paste your Clerk keys:

```env
# Replace with your actual Clerk keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_abcd1234...
CLERK_SECRET_KEY=sk_test_wxyz9876...

# Backend API URL (optional for now)
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**⚠️ Important:** Never commit `.env.local` to Git! It's already in `.gitignore`.

### 7. Start Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### 8. Test the Application

1. Open [http://localhost:3000](http://localhost:3000)
2. Click **Sign In** to authenticate
3. After signing in, you'll be redirected to **Select an Organization**
4. Create a new organization (e.g., "My Team")
5. You'll be redirected to the dashboard
6. Explore:
   - Dashboard home (shows org context)
   - Projects page
   - Settings page (admin only)

## Verification Checklist

- [ ] Development server runs without errors
- [ ] Can sign in with Clerk
- [ ] Can create/select an organization
- [ ] Dashboard displays organization context
- [ ] Can navigate between dashboard pages
- [ ] Organization switcher works
- [ ] User button (profile/logout) works
- [ ] Settings page shows admin-only content
- [ ] No TypeScript errors in terminal
- [ ] No ESLint warnings

## Common Issues

### "Missing publishableKey" Error

**Problem:** Clerk keys are not configured

**Solution:** 
1. Verify `.env.local` exists
2. Check that keys are correct (copy from Clerk Dashboard)
3. Restart the dev server: `npm run dev`

### Redirected to /select-organization

**Problem:** You're authenticated but not part of an organization

**Solution:** 
1. This is expected behavior!
2. Create or join an organization
3. You'll be redirected to the dashboard

### Port 3000 Already in Use

**Problem:** Another process is using port 3000

**Solution:**
```bash
# Kill process on port 3000 (Mac/Linux)
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### 401 Unauthorized on API Routes

**Problem:** Authentication is not working

**Solution:**
1. Check that middleware is configured (`src/middleware.ts`)
2. Verify Clerk secret key is correct
3. Clear browser cookies and sign in again

## Next Steps

1. **Explore the Code:**
   - Review `src/middleware.ts` - See how headers are injected
   - Check `src/lib/org-context.ts` - Organization utilities
   - Look at `src/app/api/projects/route.ts` - API route example

2. **Read Documentation:**
   - [docs/CLERK_INTEGRATION.md](docs/CLERK_INTEGRATION.md) - Complete Clerk guide
   - [docs/BACKEND_INTEGRATION.md](docs/BACKEND_INTEGRATION.md) - Backend setup
   - [docs/MULTI_TENANT_ARCHITECTURE.md](docs/MULTI_TENANT_ARCHITECTURE.md) - Architecture

3. **Start Building:**
   - Add your own pages in `src/app/dashboard/`
   - Create API routes in `src/app/api/`
   - Connect to your backend service

4. **Test Multi-Tenancy:**
   - Create multiple organizations
   - Switch between them
   - Verify data isolation works

## Development Tips

### ESLint

Run linter to check code quality:
```bash
npm run lint
```

### Build Production

Test production build:
```bash
npm run build
npm start
```

### TypeScript Type Checking

Check types without building:
```bash
npx tsc --noEmit
```

## Production Deployment

### Environment Variables

In production, set these environment variables:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Publishable key (starts with `pk_live_`)
- `CLERK_SECRET_KEY` - Secret key (starts with `sk_live_`)
- `NEXT_PUBLIC_API_URL` - Your backend API URL

### Recommended Platforms

- **Vercel** - One-click deploy, optimized for Next.js
- **Netlify** - Good alternative with serverless functions
- **AWS Amplify** - AWS-native deployment
- **Railway** - Simple deployment with database support
- **Fly.io** - Deploy anywhere with global edge network

### Deployment Checklist

- [ ] Use production Clerk keys (`pk_live_`, `sk_live_`)
- [ ] Set all required environment variables
- [ ] Test authentication flow
- [ ] Test organization creation/switching
- [ ] Verify API routes work
- [ ] Check security headers
- [ ] Enable HTTPS
- [ ] Configure custom domain (optional)

## Support

- **Documentation:** See `/docs` directory
- **Clerk Support:** [clerk.com/support](https://clerk.com/support)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **Issues:** Open an issue on GitHub

## Summary

You now have a fully functional Next.js 16 + Clerk v6 multi-tenant application! 

The app includes:
- ✅ Authentication with Clerk
- ✅ Organization-based multi-tenancy
- ✅ Protected routes (dashboard + API)
- ✅ Role-based access control
- ✅ Error handling
- ✅ TypeScript + ESLint
- ✅ Security headers
- ✅ Comprehensive documentation

Happy coding! 🚀
