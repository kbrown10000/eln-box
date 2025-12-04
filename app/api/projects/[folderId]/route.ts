import { NextRequest, NextResponse } from 'next/server';
import { getProject, updateProject, listExperiments } from '@/lib/box/folders';
import { requireApiAuth } from '@/lib/auth/session';

// GET /api/projects/:folderId
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  const { error } = await requireApiAuth();
  if (error) return error;

  try {
    const { folderId } = await params;
    const project = await getProject(folderId);
    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Project not found', details: String(error) },
      { status: 404 }
    );
  }
}

// PATCH /api/projects/:folderId
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  const { error } = await requireApiAuth();
  if (error) return error;

  try {
    const { folderId } = await params;
    const body = await req.json();
    const project = await updateProject(folderId, body);
    return NextResponse.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project', details: String(error) },
      { status: 500 }
    );
  }
}
