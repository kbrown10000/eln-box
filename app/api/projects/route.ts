import { NextRequest, NextResponse } from 'next/server';
import { listProjects, createProject } from '@/lib/box/folders';

// GET /api/projects - List all projects
export async function GET(req: NextRequest) {
  try {
    const projects = await listProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects', details: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.projectCode || !body.projectName) {
      return NextResponse.json(
        { error: 'projectCode and projectName are required' },
        { status: 400 }
      );
    }

    const project = await createProject({
      projectCode: body.projectCode,
      projectName: body.projectName,
      piName: body.piName || '',
      piEmail: body.piEmail || '',
      department: body.department || '',
      startDate: body.startDate || new Date().toISOString().split('T')[0],
      status: body.status || 'planning',
      description: body.description || '',
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project', details: String(error) },
      { status: 500 }
    );
  }
}
