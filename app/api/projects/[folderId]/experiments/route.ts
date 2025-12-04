import { NextRequest, NextResponse } from 'next/server';
import { listExperiments, createExperiment } from '@/lib/box/folders';

// GET /api/projects/:folderId/experiments - List experiments in a project
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  try {
    const { folderId } = await params;
    const experiments = await listExperiments(folderId);
    return NextResponse.json(experiments);
  } catch (error) {
    console.error('Error fetching experiments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch experiments', details: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/projects/:folderId/experiments - Create new experiment
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  try {
    const { folderId } = await params;
    const body = await req.json();

    // Validate required fields
    if (!body.experimentId || !body.experimentTitle) {
      return NextResponse.json(
        { error: 'experimentId and experimentTitle are required' },
        { status: 400 }
      );
    }

    const experiment = await createExperiment(folderId, {
      experimentId: body.experimentId,
      experimentTitle: body.experimentTitle,
      objective: body.objective || '',
      hypothesis: body.hypothesis || '',
      ownerName: body.ownerName || '',
      ownerEmail: body.ownerEmail || '',
      startedAt: body.startedAt,
      completedAt: body.completedAt,
      status: body.status || 'draft',
      tags: body.tags || [],
    });

    return NextResponse.json(experiment, { status: 201 });
  } catch (error) {
    console.error('Error creating experiment:', error);
    return NextResponse.json(
      { error: 'Failed to create experiment', details: String(error) },
      { status: 500 }
    );
  }
}
