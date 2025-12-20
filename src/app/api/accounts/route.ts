import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/org-context';
import { Account } from '@/types/database';
import { PermissionError } from '@/lib/errors';

/**
 * GET /api/accounts - Get account information (Admin only)
 * 
 * Backend Integration Pattern:
 * 1. Extract X-Organization-ID and X-Clerk-Org-Role headers
 * 2. Verify role is 'org:admin'
 * 3. Query: SELECT * FROM accounts WHERE org_id = $1
 * 4. Return account details
 */
export async function GET() {
  try {
    // Require admin role to access account information
    const { orgId } = await requireRole(['org:admin']);

    // In a real app, query the database with org_id filter
    // Example: const account = await db.query('SELECT * FROM accounts WHERE org_id = $1', [orgId]);
    
    const mockAccount: Account = {
      id: `account_${orgId}`,
      org_id: orgId,
      billing_status: 'trial',
      executions_used: 0,
      executions_limit: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: mockAccount,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AuthError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    if (error instanceof PermissionError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          required_role: error.requiredRole,
        },
        { status: 403 }
      );
    }

    console.error('Error fetching account:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch account information' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/accounts - Update account settings (Admin only)
 * 
 * Backend Integration Pattern:
 * 1. Extract X-Organization-ID and X-Clerk-Org-Role headers
 * 2. Verify role is 'org:admin'
 * 3. Validate request body
 * 4. UPDATE accounts SET ... WHERE org_id = $1
 * 5. Return updated account
 */
export async function PATCH(request: NextRequest) {
  try {
    const { orgId } = await requireRole(['org:admin']);
    const body = await request.json();

    // Validate that only allowed fields are being updated
    const allowedFields = ['executions_limit'];
    const updates: Partial<Account> = {};

    for (const field of allowedFields) {
      if (field in body) {
        updates[field as keyof Account] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // In a real app, update the database
    // Example: await db.query('UPDATE accounts SET executions_limit = $1, updated_at = NOW() WHERE org_id = $2', [updates.executions_limit, orgId]);

    const updatedAccount: Account = {
      id: `account_${orgId}`,
      org_id: orgId,
      billing_status: 'trial',
      executions_used: 0,
      executions_limit: updates.executions_limit || 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: updatedAccount,
      message: 'Account updated successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AuthError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    if (error instanceof PermissionError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          required_role: error.requiredRole,
        },
        { status: 403 }
      );
    }

    console.error('Error updating account:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update account' },
      { status: 500 }
    );
  }
}
