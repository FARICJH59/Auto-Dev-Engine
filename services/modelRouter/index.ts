/**
 * Model Router Service
 * Phase-2 - Route selection by policy and quota
 */

import type { PolicyContext, PolicyResult } from '../policyEngine';
import type { QuotaRequest, QuotaReservation } from '../quotaEngine';

/**
 * Model endpoint definition
 */
export interface ModelEndpoint {
  /** Unique endpoint identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Model provider (e.g., openai, anthropic, google) */
  provider: string;
  /** Model name/version */
  model: string;
  /** Endpoint URL */
  url: string;
  /** Is this endpoint currently active */
  active: boolean;
  /** Priority for selection (higher = preferred) */
  priority: number;
  /** Maximum tokens per request */
  maxTokens: number;
  /** Cost per 1K tokens (for cost optimization) */
  costPer1kTokens: number;
  /** Capabilities supported by this endpoint */
  capabilities: string[];
  /** Health status */
  healthy: boolean;
}

/**
 * Routing request
 */
export interface RoutingRequest {
  /** The principal making the request */
  principal: string;
  /** Required capabilities */
  capabilities: string[];
  /** Estimated token usage */
  estimatedTokens: number;
  /** Prefer cost optimization over performance */
  preferCost?: boolean;
  /** Specific model preference (optional) */
  preferredModel?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Routing result
 */
export interface RoutingResult {
  /** Selected endpoint (null if none available) */
  endpoint: ModelEndpoint | null;
  /** Whether routing was successful */
  success: boolean;
  /** Reason for selection or failure */
  reason: string;
  /** Policy evaluation result */
  policyResult?: PolicyResult;
  /** Quota reservation (if successful) */
  quotaReservation?: QuotaReservation;
  /** Alternative endpoints considered */
  alternatives: ModelEndpoint[];
}

/**
 * Model Router configuration
 */
export interface ModelRouterConfig {
  /** Available model endpoints */
  endpoints: ModelEndpoint[];
  /** Default cost preference */
  defaultPreferCost: boolean;
  /** Fallback endpoint ID */
  fallbackEndpointId?: string;
}

/**
 * Policy Engine interface (for dependency injection)
 */
export interface IPolicyEngine {
  evaluate(context: PolicyContext): Promise<PolicyResult>;
}

/**
 * Quota Engine interface (for dependency injection)
 */
export interface IQuotaEngine {
  reserve(request: QuotaRequest): Promise<QuotaReservation>;
  check(principal: string, resource: string): Promise<number>;
}

/**
 * Interface for model routing
 */
export interface IModelRouter {
  /** Select the best route for a request */
  selectRoute(request: RoutingRequest): Promise<RoutingResult>;
  /** Get all available endpoints */
  getEndpoints(): ModelEndpoint[];
  /** Add a new endpoint */
  addEndpoint(endpoint: ModelEndpoint): void;
  /** Remove an endpoint */
  removeEndpoint(id: string): boolean;
  /** Update endpoint health status */
  updateHealth(id: string, healthy: boolean): void;
  /** Health check */
  healthCheck(): { healthy: boolean; message: string };
}

/**
 * Model Router implementation
 * Routes requests to appropriate model endpoints based on policy and quota
 */
export class ModelRouter implements IModelRouter {
  private config: ModelRouterConfig;
  private policyEngine?: IPolicyEngine;
  private quotaEngine?: IQuotaEngine;

  constructor(
    config?: Partial<ModelRouterConfig>,
    policyEngine?: IPolicyEngine,
    quotaEngine?: IQuotaEngine
  ) {
    this.config = {
      endpoints: [],
      defaultPreferCost: false,
      ...config
    };
    this.policyEngine = policyEngine;
    this.quotaEngine = quotaEngine;
  }

  /**
   * Set the policy engine instance
   */
  setPolicyEngine(engine: IPolicyEngine): void {
    this.policyEngine = engine;
  }

  /**
   * Set the quota engine instance
   */
  setQuotaEngine(engine: IQuotaEngine): void {
    this.quotaEngine = engine;
  }

  /**
   * Select the best route for a request
   */
  async selectRoute(request: RoutingRequest): Promise<RoutingResult> {
    // Get eligible endpoints
    let eligibleEndpoints = this.config.endpoints.filter(ep => 
      ep.active && 
      ep.healthy &&
      ep.maxTokens >= request.estimatedTokens &&
      request.capabilities.every(cap => ep.capabilities.includes(cap))
    );

    // Filter by preferred model if specified
    if (request.preferredModel) {
      const preferred = eligibleEndpoints.filter(ep => 
        ep.model.toLowerCase().includes(request.preferredModel!.toLowerCase())
      );
      if (preferred.length > 0) {
        eligibleEndpoints = preferred;
      }
    }

    if (eligibleEndpoints.length === 0) {
      // Try fallback
      const fallback = this.config.endpoints.find(ep => 
        ep.id === this.config.fallbackEndpointId && ep.active && ep.healthy
      );

      if (fallback) {
        eligibleEndpoints = [fallback];
      } else {
        return {
          endpoint: null,
          success: false,
          reason: 'No eligible endpoints available for the requested capabilities',
          alternatives: []
        };
      }
    }

    // Sort endpoints
    const preferCost = request.preferCost ?? this.config.defaultPreferCost;
    eligibleEndpoints.sort((a, b) => {
      if (preferCost) {
        // Cost optimization: lower cost first
        return a.costPer1kTokens - b.costPer1kTokens;
      } else {
        // Performance: higher priority first
        return b.priority - a.priority;
      }
    });

    // Check policy for each endpoint (if policy engine available)
    for (const endpoint of eligibleEndpoints) {
      let policyResult: PolicyResult | undefined;

      if (this.policyEngine) {
        policyResult = await this.policyEngine.evaluate({
          principal: request.principal,
          action: 'use',
          resource: `model:${endpoint.id}`,
          attributes: {
            provider: endpoint.provider,
            model: endpoint.model,
            estimatedTokens: request.estimatedTokens
          }
        });

        if (!policyResult.allowed) {
          continue;
        }
      }

      // Check quota (if quota engine available)
      let quotaReservation: QuotaReservation | undefined;

      if (this.quotaEngine) {
        quotaReservation = await this.quotaEngine.reserve({
          principal: request.principal,
          resource: `model:${endpoint.id}`,
          tokens: request.estimatedTokens
        });

        if (!quotaReservation.available) {
          continue;
        }
      }

      // Success!
      return {
        endpoint,
        success: true,
        reason: `Selected endpoint: ${endpoint.name} (${endpoint.model})`,
        policyResult,
        quotaReservation,
        alternatives: eligibleEndpoints.filter(ep => ep.id !== endpoint.id)
      };
    }

    // All endpoints failed policy or quota checks
    return {
      endpoint: null,
      success: false,
      reason: 'All eligible endpoints failed policy or quota checks',
      alternatives: eligibleEndpoints
    };
  }

  /**
   * Get all available endpoints
   */
  getEndpoints(): ModelEndpoint[] {
    return [...this.config.endpoints];
  }

  /**
   * Add a new endpoint
   */
  addEndpoint(endpoint: ModelEndpoint): void {
    this.config.endpoints.push(endpoint);
  }

  /**
   * Remove an endpoint
   */
  removeEndpoint(id: string): boolean {
    const initialLength = this.config.endpoints.length;
    this.config.endpoints = this.config.endpoints.filter(ep => ep.id !== id);
    return this.config.endpoints.length < initialLength;
  }

  /**
   * Update endpoint health status
   */
  updateHealth(id: string, healthy: boolean): void {
    const endpoint = this.config.endpoints.find(ep => ep.id === id);
    if (endpoint) {
      endpoint.healthy = healthy;
    }
  }

  /**
   * Health check
   */
  healthCheck(): { healthy: boolean; message: string } {
    const activeEndpoints = this.config.endpoints.filter(ep => ep.active);
    const healthyEndpoints = activeEndpoints.filter(ep => ep.healthy);

    return {
      healthy: healthyEndpoints.length > 0,
      message: `ModelRouter: ${healthyEndpoints.length}/${activeEndpoints.length} endpoints healthy`
    };
  }
}

// Default export: create a new instance with empty configuration
export default new ModelRouter();
