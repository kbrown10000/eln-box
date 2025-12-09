import { NextRequest, NextResponse } from 'next/server';
import { listExperiments, createExperiment } from '@/lib/box/folders';
import { requireApiAuth } from '@/lib/auth/session';
import { getBoxClient } from '@/lib/box/client';
import { logActivity } from '@/lib/actions/audit';
import { db } from '@/lib/db';
import { projects, experiments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/projects/:folderId/experiments - List experiments in a project
// Query params: ?limit=50&offset=0
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  const { error, session } = await requireApiAuth();
  if (error) return error;

  try {
    const { folderId } = await params;
    const boxClient = getBoxClient();

    if (!boxClient) {
        throw new Error("Failed to initialize Box Client");
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const result = await listExperiments(boxClient, folderId, { limit, offset });
    return NextResponse.json(result);
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
  const { error, session } = await requireApiAuth();
  if (error) return error;

  try {
    const { folderId } = await params;
    const boxClient = getBoxClient();

    if (!boxClient) {
        throw new Error("Failed to initialize Box Client");
    }

    const body = await req.json();

    // Validate required fields
    if (!body.experimentId || !body.experimentTitle) {
      return NextResponse.json(
        { error: 'experimentId and experimentTitle are required' },
        { status: 400 }
      );
    }

    const experiment = await createExperiment(boxClient, folderId, {
      experimentId: body.experimentId,
      experimentTitle: body.experimentTitle,
      objective: body.objective || '',
      hypothesis: body.hypothesis || '',
      ownerName: body.ownerName || session!.user.name,
      ownerEmail: body.ownerEmail || session!.user.email,
      startedAt: body.startedAt,
      completedAt: body.completedAt,
      status: body.status || 'draft',
      tags: body.tags || [],
    });

    // Sync with Database
    try {
        const project = await db.query.projects.findFirst({
            where: eq(projects.boxFolderId, folderId)
        });

        if (project) {
            await db.insert(experiments).values({
                boxFolderId: experiment.folderId,
                projectId: project.id,
                experimentId: experiment.experimentId,
                title: experiment.experimentTitle,
                objective: experiment.objective,
                hypothesis: experiment.hypothesis,
                status: (experiment.status as any) || 'draft',
                authorId: session!.user.id,
                startedAt: experiment.startedAt ? new Date(experiment.startedAt) : new Date()
            });
        } else {
            console.warn(`Project ${folderId} not found in DB. Experiment ${experiment.folderId} created in Box only.`);
        }
    } catch (dbError) {
        console.error('Failed to sync experiment to DB:', dbError);
        // Continue, as Box creation was successful
    }

    // Log activity
    await logActivity(
      'create_experiment',
      'experiment',
      experiment.folderId,
      {
        projectFolderId: folderId,
        title: experiment.experimentTitle,
        experimentId: experiment.experimentId
      }
    );

    return NextResponse.json(experiment, { status: 201 });
  } catch (error) {
    console.error('Error creating experiment:', error);
    return NextResponse.json(
      { error: 'Failed to create experiment', details: String(error) },
      { status: 500 }
    );
  }
}
