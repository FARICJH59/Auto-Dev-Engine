// Copilot: Clerk middleware for authentication and organization context
// Uses clerkMiddleware() (NOT deprecated authMiddleware)
// Protects routes and injects organization context headers

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define route matchers
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/health(.*)',
  '/api/webhooks(.*)',
]);

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId, orgRole } = await auth();

  // Allow public routes without authentication
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protect all other routes
  if (isProtectedRoute(req)) {
    // Redirect to sign-in if not authenticated
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Redirect to organization selection if no organization
    // Exception: allow access to select-organization page
    if (!orgId && !req.nextUrl.pathname.startsWith('/select-organization')) {
      const selectOrgUrl = new URL('/select-organization', req.url);
      selectOrgUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(selectOrgUrl);
    }

    // Inject organization context headers for API routes
    if (req.nextUrl.pathname.startsWith('/api') && !isPublicRoute(req)) {
      const requestHeaders = new Headers(req.headers);
      
      if (orgId) {
        requestHeaders.set('X-Organization-ID', orgId);
      }
      if (userId) {
        requestHeaders.set('X-User-ID', userId);
      }
      if (orgRole) {
        requestHeaders.set('X-Clerk-Org-Role', orgRole);
      }

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
