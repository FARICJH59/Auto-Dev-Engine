// Copilot: Database schema types for multi-tenant architecture
// All database tables should include orgId for tenant isolation

/**
 * Base entity with organization context
 * All database models should extend this interface
 */
export interface BaseEntity {
  id: string;
  orgId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Project entity
 */
export interface Project extends BaseEntity {
  name: string;
  description?: string;
  status: 'active' | 'archived';
  createdBy: string;
}

/**
 * Execution entity
 */
export interface Execution extends BaseEntity {
  projectId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  createdBy: string;
}

/**
 * Organization quota tracking
 */
export interface OrganizationQuota {
  orgId: string;
  executionsUsed: number;
  executionsLimit: number;
  storageUsed: number;
  storageLimit: number;
}
