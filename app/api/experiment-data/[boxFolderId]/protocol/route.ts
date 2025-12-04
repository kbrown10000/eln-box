import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { experiments, protocolSteps } from '@/lib/db/schema';
import { eq, and, asc, max } from 'drizzle-orm';

// POST - Add a new protocol step
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ boxFolderId: string }> }
) {
  const { error, session } = await requireApiAuth();
  if (error) return error;

  const { boxFolderId } = await params;
  const body = await request.json();

  try {
    // Find or create experiment record
    let experiment = await db.query.experiments.findFirst({
      where: eq(experiments.boxFolderId, boxFolderId),
    });

    if (!experiment) {
      return NextResponse.json({ error: 'Experiment not found in database' }, { status: 404 });
    }

    // Get the next step number
    const existingSteps = await db
      .select({ maxStep: max(protocolSteps.stepNumber) })
      .from(protocolSteps)
      .where(eq(protocolSteps.experimentId, experiment.id));

    const nextStepNumber = (existingSteps[0]?.maxStep || 0) + 1;

    // Insert new step
    const [newStep] = await db
      .insert(protocolSteps)
      .values({
        experimentId: experiment.id,
        stepNumber: body.stepNumber || nextStepNumber,
        instruction: body.instruction,
        notes: body.notes,
      })
      .returning();

    return NextResponse.json(newStep);
  } catch (err) {
    console.error('Error adding protocol step:', err);
    return NextResponse.json({ error: 'Failed to add protocol step' }, { status: 500 });
  }
}

// PUT - Update a protocol step
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ boxFolderId: string }> }
) {
  const { error } = await requireApiAuth();
  if (error) return error;

  const body = await request.json();

  try {
    const [updatedStep] = await db
      .update(protocolSteps)
      .set({
        instruction: body.instruction,
        notes: body.notes,
        updatedAt: new Date(),
      })
      .where(eq(protocolSteps.id, body.id))
      .returning();

    return NextResponse.json(updatedStep);
  } catch (err) {
    console.error('Error updating protocol step:', err);
    return NextResponse.json({ error: 'Failed to update protocol step' }, { status: 500 });
  }
}

// DELETE - Remove a protocol step
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ boxFolderId: string }> }
) {
  const { error } = await requireApiAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const stepId = searchParams.get('id');

  if (!stepId) {
    return NextResponse.json({ error: 'Step ID required' }, { status: 400 });
  }

  try {
    await db.delete(protocolSteps).where(eq(protocolSteps.id, stepId));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting protocol step:', err);
    return NextResponse.json({ error: 'Failed to delete protocol step' }, { status: 500 });
  }
}
