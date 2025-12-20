# Clerk Setup Guide

This guide walks you through setting up Clerk authentication for the QGPS Control Plane.

## Prerequisites

- A Clerk account (sign up at [clerk.com](https://clerk.com))
- Node.js 18+ installed
- Basic understanding of Next.js

## Step 1: Create a Clerk Application

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Click "Add application"
3. Choose a name (e.g., "QGPS Control Plane")
4. Select your authentication methods:
   - ✅ Email + Password
   - ✅ Google OAuth (recommended)
   - ✅ GitHub OAuth (recommended)
5. Click "Create application"

## Step 2: Enable Organizations

1. In your Clerk dashboard, go to **Organizations** in the left sidebar
2. Click **Enable organizations**
3. Configure organization settings:
   - ✅ Enable "Personal workspace" (optional)
   - ✅ Enable "Organization creation"
   - ✅ Enable "Organization switching"
4. Configure organization roles:
   - **org:admin** - Full access to organization management
   - **org:member** - Can create and manage projects
   - **org:viewer** - Read-only access
5. Save changes

## Step 3: Get Your API Keys

1. In the Clerk dashboard, go to **API Keys**
2. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)
3. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)

⚠️ **Never commit your secret key to version control!**

## Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Clerk keys to `.env.local`:
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
   CLERK_SECRET_KEY=sk_test_YOUR_SECRET_KEY
   ```

3. Configure redirect URLs (optional - defaults are pre-configured):
   ```bash
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/select-organization
   ```

## Step 5: Configure Allowed Redirect URLs

1. In Clerk dashboard, go to **Paths**
2. Add your application URLs:
   - Development: `http://localhost:3000/*`
   - Production: `https://yourdomain.com/*`
3. Save changes

## Step 6: Test Authentication

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000)

3. Test the authentication flow:
   - Click "Sign Up" and create an account
   - Verify your email
   - Create or join an organization
   - Access the dashboard

## Troubleshooting

### "Invalid publishable key" error
- Ensure your key starts with `pk_test_` or `pk_live_`
- Make sure there are no extra spaces or quotes
- Verify the key is in `.env.local`, not `.env`

### "Organization not found" error
- Enable organizations in Clerk dashboard
- Restart your development server after enabling

## Support

- Clerk Documentation: [docs.clerk.com](https://docs.clerk.com)
- Clerk Support: [clerk.com/support](https://clerk.com/support)
