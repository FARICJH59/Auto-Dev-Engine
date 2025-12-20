// Copilot: Custom error classes for API and application errors
// Provides structured error handling with status codes and context

/**
 * Base API error class
 * Used for all API-related errors with HTTP status codes
 */
export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public orgId?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Authentication error (401)
 */
export class UnauthorizedError extends APIError {
  constructor(message = 'Unauthorized') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Permission error (403)
 */
export class ForbiddenError extends APIError {
  constructor(message = 'Forbidden') {
    super(403, message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Quota exceeded error (402)
 */
export class QuotaExceededError extends APIError {
  constructor(message = 'Quota exceeded', orgId?: string) {
    super(402, message, orgId);
    this.name = 'QuotaExceededError';
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends APIError {
  constructor(message = 'Not found') {
    super(404, message);
    this.name = 'NotFoundError';
  }
}
