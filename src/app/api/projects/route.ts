// Copilot: Projects API route
// GET: List projects for current org
// POST: Create project (admin/member only)
// Automatically injects org context headers via middleware

import { NextRequest, NextResponse } from 'next/server';
import { requireOrg } from '@/lib/org-context';
import { APIError } from '@/lib/errors';
import type { Project } from '@/types/database';

// GET /api/projects - List projects for organization
export async function GET() {
  try {
    const context = await requireOrg();

    // In production, this would call the backend API
    // For now, return mock data
    const projects: Project[] = [
      // Mock projects would be fetched from backend here
      // const response = await apiClient<Project[]>('/projects');
    ];

    return NextResponse.json({
      projects,
      orgId: context.orgId,
      total: projects.length,
    });
  } catch (error) {
    if (error instanceof APIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const context = await requireOrg();

    // Check if user has permission to create projects (admin or member)
    const roleHierarchy: Record<string, number> = {
      'org:admin': 3,
      'org:member': 2,
      'org:viewer': 1,
    };
    
    if ((roleHierarchy[context.orgRole] || 0) < roleHierarchy['org:member']) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Members or admins can create projects.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    // In production, this would call the backend API
    // const project = await apiClient<Project>('/projects', {
    //   method: 'POST',
    //   body: JSON.stringify({ name, description }),
    // });

    // Mock response
    const project = {
      id: `proj_${Date.now()}`,
      name,
      description,
      orgId: context.orgId,
      createdBy: context.userId,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    if (error instanceof APIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
