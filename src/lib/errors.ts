/**
 * Custom error classes for the application
 */

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public orgContext?: { orgId?: string; userId?: string }
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class AuthError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthError';
  }
}

export class QuotaError extends Error {
  constructor(
    message: string = 'Quota exceeded',
    public currentUsage?: number,
    public limit?: number
  ) {
    super(message);
    this.name = 'QuotaError';
  }
}

export class PermissionError extends Error {
  constructor(
    message: string = 'Insufficient permissions',
    public requiredRole?: string
  ) {
    super(message);
    this.name = 'PermissionError';
  }
}
