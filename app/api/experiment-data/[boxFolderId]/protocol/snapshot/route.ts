import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { experiments, protocolSteps, protocolSnapshots } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { logActivity } from '@/lib/actions/audit';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ boxFolderId: string }> }
) {
  const { error } = await requireApiAuth();
  if (error) return error;

  const { boxFolderId } = await params;

  try {
    const experiment = await db.query.experiments.findFirst({
      where: eq(experiments.boxFolderId, boxFolderId),
    });

    if (!experiment) {
      return NextResponse.json({ error: 'Experiment not found' }, { status: 404 });
    }

    // Fetch all steps
    const steps = await db.query.protocolSteps.findMany({
      where: eq(protocolSteps.experimentId, experiment.id),
      orderBy: (steps, { asc }) => [asc(steps.stepNumber)],
    });

    // Determine version
    const lastSnapshot = await db.query.protocolSnapshots.findFirst({
      where: eq(protocolSnapshots.experimentId, experiment.id),
      orderBy: [desc(protocolSnapshots.versionNumber)],
    });

    const versionNumber = (lastSnapshot?.versionNumber || 0) + 1;

    // Save snapshot
    const [snapshot] = await db.insert(protocolSnapshots).values({
        experimentId: experiment.id,
        versionNumber,
        snapshotData: steps, // JSONB
    }).returning();

    await logActivity('create_protocol_snapshot', 'experiment', boxFolderId, {
      version: versionNumber
    });

    return NextResponse.json(snapshot);

  } catch (err) {
    console.error('Error creating snapshot:', err);
    return NextResponse.json({ error: 'Failed to create snapshot' }, { status: 500 });
  }
}
