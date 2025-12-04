import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { experiments, yields } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// POST - Add or update yield data
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

    // Calculate percentage
    const percentage = body.theoretical > 0
      ? ((body.actual / body.theoretical) * 100).toFixed(2)
      : '0';

    // Check if yield already exists for this experiment
    const existingYield = await db.query.yields.findFirst({
      where: eq(yields.experimentId, experiment.id),
    });

    let result;
    if (existingYield) {
      // Update existing
      [result] = await db
        .update(yields)
        .set({
          productName: body.productName,
          theoretical: body.theoretical?.toString(),
          actual: body.actual?.toString(),
          percentage: percentage,
          unit: body.unit,
          updatedAt: new Date(),
        })
        .where(eq(yields.id, existingYield.id))
        .returning();
    } else {
      // Insert new
      [result] = await db
        .insert(yields)
        .values({
          experimentId: experiment.id,
          productName: body.productName,
          theoretical: body.theoretical?.toString(),
          actual: body.actual?.toString(),
          percentage: percentage,
          unit: body.unit,
        })
        .returning();
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Error saving yield:', err);
    return NextResponse.json({ error: 'Failed to save yield' }, { status: 500 });
  }
}

// DELETE - Remove yield data
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ boxFolderId: string }> }
) {
  const { error } = await requireApiAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const yieldId = searchParams.get('id');

  if (!yieldId) {
    return NextResponse.json({ error: 'Yield ID required' }, { status: 400 });
  }

  try {
    await db.delete(yields).where(eq(yields.id, yieldId));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting yield:', err);
    return NextResponse.json({ error: 'Failed to delete yield' }, { status: 500 });
  }
}
