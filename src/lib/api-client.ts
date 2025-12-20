import { auth } from '@clerk/nextjs/server';
import { APIError } from './errors';

/**
 * Server-side API client that auto-injects authentication and organization context
 * Use this in Server Components and Server Actions
 * 
 * @param endpoint - API endpoint (e.g., '/projects')
 * @param options - Fetch options
 * @returns Parsed JSON response
 * @throws APIError with status code and org context
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { getToken, userId, orgId } = await auth();

  // Get the session token from Clerk
  const token = await getToken();

  // Prepare headers
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (orgId) {
    headers.set('X-Organization-ID', orgId);
  }
  
  if (userId) {
    headers.set('X-User-ID', userId);
  }

  headers.set('Content-Type', 'application/json');

  // Build full URL
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle error responses
    if (!response.ok) {
      let errorMessage = `API error: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If response is not JSON, use status text
      }

      throw new APIError(errorMessage, response.status, { 
        orgId: orgId || undefined, 
        userId: userId || undefined 
      });
    }

    // Parse successful response
    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    // Wrap other errors
    throw new APIError(
      error instanceof Error ? error.message : 'Unknown API error',
      500,
      { orgId: orgId || undefined, userId: userId || undefined }
    );
  }
}

/**
 * Client-side API client for use in Client Components
 * Uses Next.js API routes as a proxy to leverage middleware headers
 * 
 * @param endpoint - API endpoint relative to /api (e.g., '/projects')
 * @param options - Fetch options
 * @returns Parsed JSON response
 * @throws APIError with status code
 */
export async function clientApiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  // Use Next.js API routes which will have middleware-injected headers
  const url = `/api${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle error responses
    if (!response.ok) {
      let errorMessage = `API error: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If response is not JSON, use status text
      }

      throw new APIError(errorMessage, response.status);
    }

    // Parse successful response
    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    // Wrap other errors
    throw new APIError(
      error instanceof Error ? error.message : 'Unknown API error',
      500
    );
  }
}
