import { NextRequest, NextResponse } from 'next/server';
import { listProjects, createProject } from '@/lib/box/folders';
import { requireApiAuth } from '@/lib/auth/session';

// GET /api/projects - List all projects
// Query params: ?limit=50&offset=0
export async function GET(req: NextRequest) {
  const { error, session } = await requireApiAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const result = await listProjects({ limit, offset });
    return NextResponse.json(result);
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
  const { error, session } = await requireApiAuth();
  if (error) return error;

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
      piName: body.piName || session!.user.name,
      piEmail: body.piEmail || session!.user.email,
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
