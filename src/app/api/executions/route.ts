import { NextRequest, NextResponse } from 'next/server';
import { requireOrg } from '@/lib/org-context';
import { Execution, Account } from '@/types/database';
import { QuotaError } from '@/lib/errors';

/**
 * POST /api/executions - Create a new execution
 * 
 * Backend Integration Pattern:
 * 1. Extract X-Organization-ID and X-User-ID headers
 * 2. Check quota: SELECT * FROM accounts WHERE org_id = $1
 * 3. If quota exceeded, return 402
 * 4. Insert execution: INSERT INTO executions (org_id, project_id, user_id, status) VALUES (...)
 * 5. Update usage: UPDATE accounts SET executions_used = executions_used + 1 WHERE org_id = $1
 * 6. Return execution details
 */
export async function POST(request: NextRequest) {
  try {
    const { orgId, userId } = await requireOrg();
    const body = await request.json();

    // Validate required fields
    if (!body.project_id || typeof body.project_id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Check quota (mock implementation)
    // In a real app: const account = await db.query('SELECT * FROM accounts WHERE org_id = $1', [orgId]);
    const mockAccount: Account = {
      id: `account_${orgId}`,
      org_id: orgId,
      billing_status: 'trial',
      executions_used: 0,
      executions_limit: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (mockAccount.executions_used >= mockAccount.executions_limit) {
      throw new QuotaError(
        'Execution quota exceeded. Please upgrade your plan.',
        mockAccount.executions_used,
        mockAccount.executions_limit
      );
    }

    // Create execution (mock implementation)
    const newExecution: Execution = {
      id: `execution_${Date.now()}`,
      org_id: orgId,
      project_id: body.project_id,
      user_id: userId,
      status: 'pending',
      started_at: new Date().toISOString(),
    };

    // In a real app, also increment executions_used:
    // await db.query('UPDATE accounts SET executions_used = executions_used + 1 WHERE org_id = $1', [orgId]);

    return NextResponse.json(
      {
        success: true,
        data: newExecution,
        message: 'Execution created successfully',
        quota: {
          used: mockAccount.executions_used + 1,
          limit: mockAccount.executions_limit,
          remaining: mockAccount.executions_limit - mockAccount.executions_used - 1,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'AuthError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    if (error instanceof QuotaError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          quota: {
            used: error.currentUsage,
            limit: error.limit,
          },
        },
        { status: 402 } // Payment Required
      );
    }

    console.error('Error creating execution:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create execution' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/executions - List executions for the current organization
 * 
 * Backend Integration Pattern:
 * 1. Extract X-Organization-ID header
 * 2. Query: SELECT * FROM executions WHERE org_id = $1 ORDER BY started_at DESC
 * 3. Return paginated results
 */
export async function GET() {
  try {
    const { orgId } = await requireOrg();

    // In a real app, query the database with org_id filter
    // Example: const executions = await db.query('SELECT * FROM executions WHERE org_id = $1 ORDER BY started_at DESC LIMIT 50', [orgId]);
    
    const executions: Execution[] = [];

    return NextResponse.json({
      success: true,
      data: executions,
      meta: {
        orgId,
        count: executions.length,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AuthError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    console.error('Error fetching executions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch executions' },
      { status: 500 }
    );
  }
}
