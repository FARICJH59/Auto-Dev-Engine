import { NextRequest, NextResponse } from 'next/server';
import { requireOrg } from '@/lib/org-context';
import { Project } from '@/types/database';

/**
 * GET /api/projects - List all projects for the current organization
 * 
 * Backend Integration Pattern:
 * 1. Extract X-Organization-ID header (injected by middleware)
 * 2. Query: SELECT * FROM projects WHERE org_id = $1
 * 3. Never allow cross-tenant data access
 */
export async function GET() {
  try {
    const { orgId, userId } = await requireOrg();

    // In a real app, query the database with org_id filter
    // Example: const projects = await db.query('SELECT * FROM projects WHERE org_id = $1', [orgId]);
    
    // Mock response for demonstration
    const projects: Project[] = [];

    return NextResponse.json({
      success: true,
      data: projects,
      meta: {
        orgId,
        userId,
        count: projects.length,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AuthError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects - Create a new project
 * 
 * Backend Integration Pattern:
 * 1. Extract X-Organization-ID and X-User-ID headers
 * 2. Validate request body
 * 3. INSERT INTO projects (org_id, name, description, created_by) VALUES (...)
 * 4. Return created project
 */
export async function POST(request: NextRequest) {
  try {
    const { orgId, userId } = await requireOrg();
    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Project name is required' },
        { status: 400 }
      );
    }

    // In a real app, insert into database with org_id
    // Example: const project = await db.query(
    //   'INSERT INTO projects (id, org_id, name, description, created_by, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
    //   [uuid(), orgId, body.name, body.description || '', userId]
    // );

    const newProject: Project = {
      id: `project_${Date.now()}`,
      org_id: orgId,
      name: body.name,
      description: body.description || '',
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: newProject,
        message: 'Project created successfully',
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

    console.error('Error creating project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
