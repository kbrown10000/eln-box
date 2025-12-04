import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { experiments, reagents } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// POST - Add a new reagent
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ boxFolderId: string }> }
) {
  const { error } = await requireApiAuth();
  if (error) return error;

  const { boxFolderId } = await params;
  const body = await request.json();

  try {
    const experiment = await db.query.experiments.findFirst({
      where: eq(experiments.boxFolderId, boxFolderId),
    });

    if (!experiment) {
      return NextResponse.json({ error: 'Experiment not found in database' }, { status: 404 });
    }

    const [newReagent] = await db
      .insert(reagents)
      .values({
        experimentId: experiment.id,
        name: body.name,
        amount: body.amount?.toString(),
        unit: body.unit,
        molarAmount: body.molarAmount?.toString(),
        molarUnit: body.molarUnit || 'mol',
        observations: body.observations,
      })
      .returning();

    return NextResponse.json(newReagent);
  } catch (err) {
    console.error('Error adding reagent:', err);
    return NextResponse.json({ error: 'Failed to add reagent' }, { status: 500 });
  }
}

// PUT - Update a reagent
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ boxFolderId: string }> }
) {
  const { error } = await requireApiAuth();
  if (error) return error;

  const body = await request.json();

  try {
    const [updatedReagent] = await db
      .update(reagents)
      .set({
        name: body.name,
        amount: body.amount?.toString(),
        unit: body.unit,
        molarAmount: body.molarAmount?.toString(),
        molarUnit: body.molarUnit,
        observations: body.observations,
        updatedAt: new Date(),
      })
      .where(eq(reagents.id, body.id))
      .returning();

    return NextResponse.json(updatedReagent);
  } catch (err) {
    console.error('Error updating reagent:', err);
    return NextResponse.json({ error: 'Failed to update reagent' }, { status: 500 });
  }
}

// DELETE - Remove a reagent
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ boxFolderId: string }> }
) {
  const { error } = await requireApiAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const reagentId = searchParams.get('id');

  if (!reagentId) {
    return NextResponse.json({ error: 'Reagent ID required' }, { status: 400 });
  }

  try {
    await db.delete(reagents).where(eq(reagents.id, reagentId));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting reagent:', err);
    return NextResponse.json({ error: 'Failed to delete reagent' }, { status: 500 });
  }
}
