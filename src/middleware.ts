import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api(.*)',
]);

// Define public API routes (health checks, webhooks)
const isPublicApiRoute = createRouteMatcher([
  '/api/health',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId, orgRole } = await auth();

  // Allow public API routes
  if (isPublicApiRoute(req)) {
    return NextResponse.next();
  }

  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    // Check if user is authenticated
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // For dashboard routes, require organization context
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
      if (!orgId) {
        const selectOrgUrl = new URL('/select-organization', req.url);
        selectOrgUrl.searchParams.set('redirect_url', req.url);
        return NextResponse.redirect(selectOrgUrl);
      }
    }

    // Inject organization context headers for API routes
    if (req.nextUrl.pathname.startsWith('/api')) {
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
