// Copilot: Executions API route
// POST: Create execution with quota checking
// Returns 402 Payment Required if quota exceeded

import { NextRequest, NextResponse } from 'next/server';
import { requireOrg } from '@/lib/org-context';
import { APIError, QuotaExceededError } from '@/lib/errors';

// POST /api/executions - Create new execution
export async function POST(request: NextRequest) {
  try {
    const context = await requireOrg();
    const body = await request.json();
    const { projectId, config } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Check quota (placeholder - would query database in production)
    const quotaExceeded = false; // Mock check
    
    if (quotaExceeded) {
      throw new QuotaExceededError(
        'Monthly execution quota exceeded. Please upgrade your plan.',
        context.orgId
      );
    }

    // In production, this would call the backend API
    // const execution = await apiClient<Execution>('/executions', {
    //   method: 'POST',
    //   body: JSON.stringify({ projectId, config }),
    // });

    // Mock response
    const execution = {
      id: `exec_${Date.now()}`,
      projectId,
      orgId: context.orgId,
      createdBy: context.userId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Audit log placeholder
    console.log('AUDIT:', {
      action: 'execution.created',
      userId: context.userId,
      orgId: context.orgId,
      executionId: execution.id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(execution, { status: 201 });
  } catch (error) {
    if (error instanceof QuotaExceededError) {
      return NextResponse.json(
        {
          error: error.message,
          code: 'QUOTA_EXCEEDED',
          orgId: error.orgId,
        },
        { status: 402 }
      );
    }
    if (error instanceof APIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create execution' },
      { status: 500 }
    );
  }
}

// GET /api/executions - List executions for organization
export async function GET(request: NextRequest) {
  try {
    const context = await requireOrg();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const projectId = searchParams.get('projectId');

    // In production, this would call the backend API with filters
    // const executions = await apiClient<Execution[]>(
    //   `/executions?status=${status}&projectId=${projectId}`
    // );

    // Mock response
    const executions = [];

    return NextResponse.json({
      executions,
      orgId: context.orgId,
      total: executions.length,
      filters: { status, projectId },
    });
  } catch (error) {
    if (error instanceof APIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch executions' },
      { status: 500 }
    );
  }
}
