// Copilot: Admin API Keys management (admin only)
// POST: Create API key programmatically
// GET: List organization's API keys
// Uses Clerk's API key management

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/org-context';
import { APIError } from '@/lib/errors';
import type { APIKeyMetadata } from '@/types/clerk';

// POST /api/admin/api-keys - Create API key (admin only)
export async function POST(request: NextRequest) {
  try {
    // Require admin role
    const context = await requireRole(['org:admin']);
    const body = await request.json();
    const { name, scopes = [], expiresAt } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'API key name is required' },
        { status: 400 }
      );
    }

    // Note: Clerk v6 API key creation
    // This is a placeholder - actual implementation depends on Clerk's API key feature
    // which may require additional configuration in the Clerk dashboard

    // In production, create API key via Clerk
    // const apiKey = await clerkClient().apiKeys.create({
    //   organizationId: context.orgId,
    //   name,
    //   scopes,
    //   expiresAt,
    // });

    // Mock response
    const apiKey = {
      id: `key_${Date.now()}`,
      name,
      secret: `sk_${context.orgId}_${Math.random().toString(36).substring(2)}`,
      scopes,
      expiresAt,
      createdAt: new Date().toISOString(),
      orgId: context.orgId,
    };

    // Audit log
    console.log('AUDIT:', {
      action: 'api_key.created',
      userId: context.userId,
      orgId: context.orgId,
      keyId: apiKey.id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      ...apiKey,
      warning: 'Save the secret securely. It will not be shown again.',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof APIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    if ((error as Error).message === 'Insufficient permissions') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}

// GET /api/admin/api-keys - List API keys (admin only)
export async function GET() {
  try {
    // Require admin role
    const context = await requireRole(['org:admin']);

    // In production, list API keys via Clerk
    // const apiKeys = await clerkClient().apiKeys.list({
    //   organizationId: context.orgId,
    // });

    // Mock response
    const apiKeys: APIKeyMetadata[] = [];

    return NextResponse.json({
      apiKeys,
      orgId: context.orgId,
      total: apiKeys.length,
    });
  } catch (error) {
    if (error instanceof APIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    if ((error as Error).message === 'Insufficient permissions') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}
