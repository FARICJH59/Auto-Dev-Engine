// Copilot: Organization context utilities for server components
// Provides helpers for authentication and authorization checks
// Use these functions in Server Components and API routes

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { OrgContext, OrgRole } from '@/types/clerk';

/**
 * Requires user to be authenticated and have an active organization
 * Redirects to appropriate page if requirements not met
 * 
 * Usage in Server Component:
 * ```tsx
 * const { userId, orgId, orgRole } = await requireOrg();
 * ```
 */
export async function requireOrg(): Promise<OrgContext> {
  const { userId, orgId, orgRole } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  if (!orgId || !orgRole) {
    redirect('/select-organization');
  }

  return {
    userId,
    orgId,
    orgRole: orgRole as OrgRole,
  };
}

/**
 * Requires user to have specific role(s) in the organization
 * Throws 403 error if user doesn't have required role
 * 
 * Usage in Server Component:
 * ```tsx
 * const context = await requireRole(['org:admin']);
 * ```
 */
export async function requireRole(allowedRoles: OrgRole[]): Promise<OrgContext> {
  const context = await requireOrg();

  if (!hasPermission(context.orgRole, allowedRoles)) {
    throw new Error('Insufficient permissions');
  }

  return context;
}

/**
 * Gets organization context without enforcing requirements
 * Returns null if user is not authenticated or has no org
 * 
 * Usage in Server Component:
 * ```tsx
 * const context = await getOrgContext();
 * if (context) {
 *   // Show org-specific content
 * }
 * ```
 */
export async function getOrgContext(): Promise<OrgContext | null> {
  const { userId, orgId, orgRole } = await auth();

  if (!userId || !orgId || !orgRole) {
    return null;
  }

  return {
    userId,
    orgId,
    orgRole: orgRole as OrgRole,
  };
}

/**
 * Checks if user's role has permission
 * Role hierarchy: admin > member > viewer
 */
export function hasPermission(userRole: OrgRole, allowedRoles: OrgRole[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Role hierarchy for comparison
 */
const roleHierarchy: Record<OrgRole, number> = {
  'org:admin': 3,
  'org:member': 2,
  'org:viewer': 1,
};

/**
 * Checks if user role meets minimum required role
 */
export function hasMinimumRole(userRole: OrgRole, minimumRole: OrgRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[minimumRole];
}
