import { auth } from '@clerk/nextjs/server';
import { AuthError, PermissionError } from './errors';

/**
 * Organization role types from Clerk
 */
export type OrgRole = 'org:admin' | 'org:member' | 'org:viewer';

/**
 * Organization context interface
 */
export interface OrgContext {
  orgId: string;
  userId: string;
  orgRole: OrgRole;
}

/**
 * Server Component helper to enforce authentication and organization context
 * Throws AuthError if user is not authenticated or lacks organization context
 * 
 * @returns OrgContext with orgId, userId, and orgRole
 * @throws AuthError if authentication or organization context is missing
 */
export async function requireOrg(): Promise<OrgContext> {
  const { userId, orgId, orgRole } = await auth();

  if (!userId) {
    throw new AuthError('Authentication required');
  }

  if (!orgId) {
    throw new AuthError('Organization context required. Please select an organization.');
  }

  if (!orgRole) {
    throw new AuthError('Organization role not found');
  }

  return {
    orgId,
    userId,
    orgRole: orgRole as OrgRole,
  };
}

/**
 * Server Component helper to enforce role-based access control
 * Checks if the user has one of the allowed roles
 * 
 * @param allowedRoles - Array of allowed organization roles
 * @returns OrgContext with orgId, userId, and orgRole
 * @throws AuthError if authentication or organization context is missing
 * @throws PermissionError if user doesn't have required role
 */
export async function requireRole(allowedRoles: OrgRole[]): Promise<OrgContext> {
  const context = await requireOrg();

  if (!allowedRoles.includes(context.orgRole)) {
    throw new PermissionError(
      `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
      allowedRoles.join(', ')
    );
  }

  return context;
}

/**
 * Optional organization context retrieval (doesn't throw)
 * Returns null if authentication or organization context is missing
 * 
 * @returns OrgContext or null
 */
export async function getOrgContext(): Promise<OrgContext | null> {
  const { userId, orgId, orgRole } = await auth();

  if (!userId || !orgId || !orgRole) {
    return null;
  }

  return {
    orgId,
    userId,
    orgRole: orgRole as OrgRole,
  };
}

/**
 * Check if the current user has a specific role
 * 
 * @param role - The role to check
 * @returns boolean indicating if user has the role
 */
export async function hasRole(role: OrgRole): Promise<boolean> {
  const context = await getOrgContext();
  return context?.orgRole === role;
}

/**
 * Check if the current user is an admin
 * 
 * @returns boolean indicating if user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole('org:admin');
}
