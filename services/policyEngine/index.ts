/**
 * Policy Engine Service
 * Phase-2 - Interface for policy evaluation with default deny-all stub
 */

/**
 * Policy evaluation context
 */
export interface PolicyContext {
  /** The principal requesting access (user, service, etc.) */
  principal: string;
  /** The action being requested */
  action: string;
  /** The resource being accessed */
  resource: string;
  /** Additional context attributes */
  attributes?: Record<string, unknown>;
}

/**
 * Policy evaluation result
 */
export interface PolicyResult {
  /** Whether the action is allowed */
  allowed: boolean;
  /** Reason for the decision */
  reason: string;
  /** Policy that matched (if any) */
  matchedPolicy?: string;
  /** Additional decision metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Policy definition structure
 */
export interface Policy {
  /** Unique policy identifier */
  id: string;
  /** Human-readable policy name */
  name: string;
  /** Policy description */
  description: string;
  /** Effect: allow or deny */
  effect: 'allow' | 'deny';
  /** Principals this policy applies to (wildcards supported) */
  principals: string[];
  /** Actions this policy covers (wildcards supported) */
  actions: string[];
  /** Resources this policy covers (wildcards supported) */
  resources: string[];
  /** Optional conditions for policy evaluation */
  conditions?: Record<string, unknown>;
  /** Policy priority (higher = evaluated first) */
  priority: number;
}

/**
 * Policy Engine configuration
 */
export interface PolicyEngineConfig {
  /** Default policy effect when no policies match */
  defaultEffect: 'allow' | 'deny';
  /** Enable audit logging */
  auditEnabled: boolean;
  /** Path to policy definitions */
  policyPath?: string;
}

/**
 * Interface for policy evaluation
 */
export interface IPolicyEngine {
  /** Evaluate a policy decision */
  evaluate(context: PolicyContext): Promise<PolicyResult>;
  /** Load policies from configuration */
  loadPolicies(policies: Policy[]): void;
  /** Add a single policy */
  addPolicy(policy: Policy): void;
  /** Remove a policy by ID */
  removePolicy(id: string): boolean;
  /** Get all loaded policies */
  getPolicies(): Policy[];
  /** Health check */
  healthCheck(): { healthy: boolean; message: string };
}

/**
 * Default deny-all Policy Engine implementation
 * This is a stub that denies all requests by default for security.
 */
export class PolicyEngine implements IPolicyEngine {
  private policies: Policy[] = [];
  private config: PolicyEngineConfig;

  constructor(config?: Partial<PolicyEngineConfig>) {
    this.config = {
      defaultEffect: 'deny',
      auditEnabled: true,
      ...config
    };
  }

  /**
   * Evaluate a policy decision
   * Default implementation: deny all requests
   */
  async evaluate(context: PolicyContext): Promise<PolicyResult> {
    // Log audit event if enabled
    if (this.config.auditEnabled) {
      this.audit('evaluate', context);
    }

    // Sort policies by priority (highest first)
    const sortedPolicies = [...this.policies].sort((a, b) => b.priority - a.priority);

    // Check each policy
    for (const policy of sortedPolicies) {
      if (this.matchesPolicy(context, policy)) {
        return {
          allowed: policy.effect === 'allow',
          reason: `Matched policy: ${policy.name}`,
          matchedPolicy: policy.id,
          metadata: { policyName: policy.name, effect: policy.effect }
        };
      }
    }

    // Default: deny all (secure by default)
    return {
      allowed: this.config.defaultEffect === 'allow',
      reason: `Default policy: ${this.config.defaultEffect} all`,
      metadata: { defaultApplied: true }
    };
  }

  /**
   * Check if a context matches a policy
   */
  private matchesPolicy(context: PolicyContext, policy: Policy): boolean {
    const matchesPrincipal = policy.principals.some(p => 
      p === '*' || p === context.principal
    );
    const matchesAction = policy.actions.some(a => 
      a === '*' || a === context.action
    );
    const matchesResource = policy.resources.some(r => 
      r === '*' || r === context.resource
    );

    return matchesPrincipal && matchesAction && matchesResource;
  }

  /**
   * Audit log helper
   */
  private audit(operation: string, data: unknown): void {
    console.log(`[PolicyEngine:Audit] ${operation}:`, JSON.stringify(data));
  }

  /**
   * Load multiple policies
   */
  loadPolicies(policies: Policy[]): void {
    this.policies = [...policies];
    if (this.config.auditEnabled) {
      this.audit('loadPolicies', { count: policies.length });
    }
  }

  /**
   * Add a single policy
   */
  addPolicy(policy: Policy): void {
    this.policies.push(policy);
    if (this.config.auditEnabled) {
      this.audit('addPolicy', { id: policy.id, name: policy.name });
    }
  }

  /**
   * Remove a policy by ID
   */
  removePolicy(id: string): boolean {
    const initialLength = this.policies.length;
    this.policies = this.policies.filter(p => p.id !== id);
    const removed = this.policies.length < initialLength;
    if (this.config.auditEnabled) {
      this.audit('removePolicy', { id, removed });
    }
    return removed;
  }

  /**
   * Get all loaded policies
   */
  getPolicies(): Policy[] {
    return [...this.policies];
  }

  /**
   * Health check
   */
  healthCheck(): { healthy: boolean; message: string } {
    return {
      healthy: true,
      message: `PolicyEngine operational. ${this.policies.length} policies loaded. Default: ${this.config.defaultEffect}`
    };
  }
}

// Default export: create a new instance with default deny-all configuration
export default new PolicyEngine();
