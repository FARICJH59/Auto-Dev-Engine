/**
 * Quota Engine Service
 * Phase-2 - Token bucket implementation with configuration
 */

/**
 * Quota request context
 */
export interface QuotaRequest {
  /** The principal requesting quota */
  principal: string;
  /** The resource/service being accessed */
  resource: string;
  /** Number of tokens requested */
  tokens: number;
}

/**
 * Quota reservation result
 */
export interface QuotaReservation {
  /** Unique reservation ID */
  id: string;
  /** Whether quota was available */
  available: boolean;
  /** Tokens actually reserved */
  tokensReserved: number;
  /** Tokens remaining after reservation */
  tokensRemaining: number;
  /** When the reservation expires */
  expiresAt: Date;
  /** Reason if not available */
  reason?: string;
}

/**
 * Token bucket configuration
 */
export interface TokenBucketConfig {
  /** Maximum tokens in the bucket */
  maxTokens: number;
  /** Tokens added per replenish interval */
  refillRate: number;
  /** Refill interval in milliseconds */
  refillIntervalMs: number;
  /** Initial token count */
  initialTokens?: number;
}

/**
 * Quota Engine configuration
 */
export interface QuotaEngineConfig {
  /** Default token bucket settings */
  defaultBucket: TokenBucketConfig;
  /** Per-principal overrides */
  principalOverrides?: Record<string, TokenBucketConfig>;
  /** Per-resource overrides */
  resourceOverrides?: Record<string, TokenBucketConfig>;
  /** Reservation expiry time in milliseconds */
  reservationExpiryMs: number;
}

/**
 * Token Bucket state
 */
interface TokenBucket {
  tokens: number;
  maxTokens: number;
  refillRate: number;
  refillIntervalMs: number;
  lastRefill: number;
}

/**
 * Active reservation tracking
 */
interface ActiveReservation {
  id: string;
  principal: string;
  resource: string;
  tokens: number;
  expiresAt: Date;
}

/**
 * Interface for quota management
 */
export interface IQuotaEngine {
  /** Reserve quota tokens */
  reserve(request: QuotaRequest): Promise<QuotaReservation>;
  /** Release a reservation */
  release(reservationId: string): Promise<boolean>;
  /** Check available quota without reserving */
  check(principal: string, resource: string): Promise<number>;
  /** Replenish all token buckets */
  replenish(): Promise<void>;
  /** Health check */
  healthCheck(): { healthy: boolean; message: string };
}

/**
 * Token Bucket Quota Engine implementation
 */
export class QuotaEngine implements IQuotaEngine {
  private config: QuotaEngineConfig;
  private buckets: Map<string, TokenBucket> = new Map();
  private reservations: Map<string, ActiveReservation> = new Map();
  private reservationCounter = 0;

  constructor(config?: Partial<QuotaEngineConfig>) {
    this.config = {
      defaultBucket: {
        maxTokens: 100,
        refillRate: 10,
        refillIntervalMs: 60000, // 1 minute
        initialTokens: 100
      },
      reservationExpiryMs: 300000, // 5 minutes
      ...config
    };
  }

  /**
   * Get or create a token bucket for a principal/resource combination
   */
  private getBucket(principal: string, resource: string): TokenBucket {
    const key = `${principal}:${resource}`;
    
    if (!this.buckets.has(key)) {
      // Determine configuration (principal > resource > default)
      let bucketConfig = this.config.defaultBucket;
      
      if (this.config.resourceOverrides?.[resource]) {
        bucketConfig = this.config.resourceOverrides[resource];
      }
      if (this.config.principalOverrides?.[principal]) {
        bucketConfig = this.config.principalOverrides[principal];
      }

      this.buckets.set(key, {
        tokens: bucketConfig.initialTokens ?? bucketConfig.maxTokens,
        maxTokens: bucketConfig.maxTokens,
        refillRate: bucketConfig.refillRate,
        refillIntervalMs: bucketConfig.refillIntervalMs,
        lastRefill: Date.now()
      });
    }

    return this.buckets.get(key)!;
  }

  /**
   * Generate a unique reservation ID
   */
  private generateReservationId(): string {
    return `res_${Date.now()}_${++this.reservationCounter}`;
  }

  /**
   * Reserve quota tokens
   */
  async reserve(request: QuotaRequest): Promise<QuotaReservation> {
    const bucket = this.getBucket(request.principal, request.resource);
    
    // Apply any pending refills
    this.refillBucket(bucket);

    const reservationId = this.generateReservationId();
    const expiresAt = new Date(Date.now() + this.config.reservationExpiryMs);

    if (bucket.tokens >= request.tokens) {
      // Reserve the tokens
      bucket.tokens -= request.tokens;

      // Track the reservation
      this.reservations.set(reservationId, {
        id: reservationId,
        principal: request.principal,
        resource: request.resource,
        tokens: request.tokens,
        expiresAt
      });

      return {
        id: reservationId,
        available: true,
        tokensReserved: request.tokens,
        tokensRemaining: bucket.tokens,
        expiresAt
      };
    }

    return {
      id: reservationId,
      available: false,
      tokensReserved: 0,
      tokensRemaining: bucket.tokens,
      expiresAt,
      reason: `Insufficient tokens. Requested: ${request.tokens}, Available: ${bucket.tokens}`
    };
  }

  /**
   * Release a reservation (return tokens to bucket)
   */
  async release(reservationId: string): Promise<boolean> {
    const reservation = this.reservations.get(reservationId);
    
    if (!reservation) {
      return false;
    }

    const bucket = this.getBucket(reservation.principal, reservation.resource);
    
    // Return tokens (capped at max)
    bucket.tokens = Math.min(bucket.tokens + reservation.tokens, bucket.maxTokens);
    
    // Remove reservation
    this.reservations.delete(reservationId);
    
    return true;
  }

  /**
   * Check available quota without reserving
   */
  async check(principal: string, resource: string): Promise<number> {
    const bucket = this.getBucket(principal, resource);
    this.refillBucket(bucket);
    return bucket.tokens;
  }

  /**
   * Refill a single bucket based on elapsed time
   */
  private refillBucket(bucket: TokenBucket): void {
    const now = Date.now();
    const elapsed = now - bucket.lastRefill;
    const intervals = Math.floor(elapsed / bucket.refillIntervalMs);

    if (intervals > 0) {
      const tokensToAdd = intervals * bucket.refillRate;
      bucket.tokens = Math.min(bucket.tokens + tokensToAdd, bucket.maxTokens);
      bucket.lastRefill = now;
    }
  }

  /**
   * Replenish all token buckets
   */
  async replenish(): Promise<void> {
    for (const bucket of this.buckets.values()) {
      this.refillBucket(bucket);
    }

    // Clean up expired reservations
    const now = Date.now();
    for (const [id, reservation] of this.reservations.entries()) {
      if (reservation.expiresAt.getTime() < now) {
        await this.release(id);
      }
    }
  }

  /**
   * Health check
   */
  healthCheck(): { healthy: boolean; message: string } {
    return {
      healthy: true,
      message: `QuotaEngine operational. ${this.buckets.size} buckets, ${this.reservations.size} active reservations`
    };
  }

  /**
   * Get current bucket statistics (for monitoring)
   */
  getStats(): { buckets: number; reservations: number; totalTokens: number } {
    let totalTokens = 0;
    for (const bucket of this.buckets.values()) {
      totalTokens += bucket.tokens;
    }
    return {
      buckets: this.buckets.size,
      reservations: this.reservations.size,
      totalTokens
    };
  }
}

// Default export: create a new instance with default configuration
export default new QuotaEngine();
