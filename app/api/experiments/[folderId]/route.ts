import { NextRequest, NextResponse } from 'next/server';
import { getExperiment, updateExperiment } from '@/lib/box/folders';

// GET /api/experiments/:folderId
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  try {
    const { folderId } = await params;
    const experiment = await getExperiment(folderId);
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
  try {
    const { folderId } = await params;
    const body = await req.json();
    const experiment = await updateExperiment(folderId, body);
    return NextResponse.json(experiment);
  } catch (error) {
    console.error('Error updating experiment:', error);
    return NextResponse.json(
      { error: 'Failed to update experiment', details: String(error) },
      { status: 500 }
    );
  }
}
