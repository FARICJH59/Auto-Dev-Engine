// Copilot: API client utilities for making authenticated requests
// Server-side client uses Clerk token, client-side uses proxy
// Automatically injects organization context headers

import { auth } from '@clerk/nextjs/server';
import { APIError } from './errors';

/**
 * Server-side API client
 * Automatically injects Clerk session token and organization context
 * 
 * Usage in Server Component or API Route:
 * ```tsx
 * const projects = await apiClient<Project[]>('/projects');
 * ```
 */
export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit & { acceptsToken?: 'session' | 'api_key' }
): Promise<T> {
  const { userId, orgId, orgRole, getToken } = await auth();

  if (!userId) {
    throw new APIError(401, 'Unauthorized');
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL not configured');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  // Inject organization context headers
  if (orgId) {
    headers['X-Organization-ID'] = orgId;
  }
  if (userId) {
    headers['X-User-ID'] = userId;
  }
  if (orgRole) {
    headers['X-Clerk-Org-Role'] = orgRole;
  }

  // Get Clerk token
  const token = await getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${apiUrl}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new APIError(response.status, errorText || response.statusText, orgId || undefined);
  }

  // Handle empty responses
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T;
  }

  return response.json();
}

/**
 * Client-side API client
 * Uses Next.js API routes as proxy to leverage middleware headers
 * 
 * Usage in Client Component:
 * ```tsx
 * const projects = await clientApiClient<Project[]>('/api/projects');
 * ```
 */
export async function clientApiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new APIError(response.status, errorText || response.statusText);
  }

  // Handle empty responses
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T;
  }

  return response.json();
}
