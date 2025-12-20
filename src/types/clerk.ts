// Copilot: Define Clerk-specific types for organization roles and context
// These types are used throughout the application for type-safe organization management

/**
 * Organization roles supported by Clerk
 * - org:admin: Full administrative access to organization
 * - org:member: Regular member with standard permissions
 * - org:viewer: Read-only access to organization resources
 */
export type OrgRole = 'org:admin' | 'org:member' | 'org:viewer';

/**
 * Organization context passed through the application
 * Contains user identity and organization membership information
 */
export interface OrgContext {
  userId: string;
  orgId: string;
  orgRole: OrgRole;
}

/**
 * API Key metadata returned from Clerk
 * Used for programmatic API access
 */
export interface APIKeyMetadata {
  id: string;
  name: string;
  secret?: string; // Only available on creation
  scopes: string[];
  expiresAt?: string;
  createdAt: string;
}
