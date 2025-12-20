/**
 * Database schema types for multi-tenant architecture
 * All tables MUST include org_id for tenant isolation
 */

export interface Project {
  id: string;
  org_id: string; // Multi-tenant isolation key - ALWAYS filter by this
  name: string;
  description: string;
  created_by: string; // Clerk user ID
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  org_id: string; // Multi-tenant isolation key - ALWAYS filter by this
  user_id: string;
  action: string; // "project.create", "execution.run", etc.
  resource_type: string;
  resource_id: string;
  metadata: Record<string, unknown>;
  timestamp: string;
}

export interface Account {
  id: string;
  org_id: string; // Multi-tenant isolation key - ALWAYS filter by this
  billing_status: 'trial' | 'active' | 'suspended';
  executions_used: number;
  executions_limit: number;
  created_at: string;
  updated_at: string;
}

export interface Execution {
  id: string;
  org_id: string; // Multi-tenant isolation key - ALWAYS filter by this
  project_id: string;
  user_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  result?: Record<string, unknown>;
  error_message?: string;
}
