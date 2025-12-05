import { NextRequest, NextResponse } from 'next/server';
import { getExperiment, updateExperiment } from '@/lib/box/folders';
import { requireApiAuth } from '@/lib/auth/session';
import { getUserClient } from '@/lib/box/client';

// GET /api/experiments/:folderId
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  const { error, session } = await requireApiAuth();
  if (error) return error;

  try {
    const { folderId } = await params;
    const boxClient = getUserClient(session!.accessToken);
    const experiment = await getExperiment(boxClient, folderId);
    return NextResponse.json(experiment);
  } catch (error) {
    console.error('Error fetching experiment:', error);
    return NextResponse.json(
      { error: 'Experiment not found', details: String(error) },
      { status: 404 }
    );
  }
}

// PATCH /api/experiments/:folderId
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  const { error, session } = await requireApiAuth();
  if (error) return error;

  try {
    const { folderId } = await params;
    const body = await req.json();
    const boxClient = getUserClient(session!.accessToken);
    const experiment = await updateExperiment(boxClient, folderId, body);
    return NextResponse.json(experiment);
  } catch (error) {
    console.error('Error updating experiment:', error);
    return NextResponse.json(
      { error: 'Failed to update experiment', details: String(error) },
      { status: 500 }
    );
  }
}
