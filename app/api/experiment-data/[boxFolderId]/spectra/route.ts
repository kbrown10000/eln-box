import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { experiments, spectra } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// POST - Add a new spectrum
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

    const [newSpectrum] = await db
      .insert(spectra)
      .values({
        experimentId: experiment.id,
        boxFileId: body.boxFileId,
        spectrumType: body.spectrumType,
        title: body.fileName || body.title,
        caption: body.caption,
        peakData: body.peakData || {},
      })
      .returning();

    return NextResponse.json(newSpectrum);
  } catch (err) {
    console.error('Error adding spectrum:', err);
    return NextResponse.json({ error: 'Failed to add spectrum' }, { status: 500 });
  }
}

// PUT - Update a spectrum
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ boxFolderId: string }> }
) {
  const { error } = await requireApiAuth();
  if (error) return error;

  const body = await request.json();

  try {
    const [updatedSpectrum] = await db
      .update(spectra)
      .set({
        boxFileId: body.boxFileId,
        spectrumType: body.spectrumType,
        title: body.fileName || body.title,
        caption: body.caption,
        peakData: body.peakData,
        updatedAt: new Date(),
      })
      .where(eq(spectra.id, body.id))
      .returning();

    return NextResponse.json(updatedSpectrum);
  } catch (err) {
    console.error('Error updating spectrum:', err);
    return NextResponse.json({ error: 'Failed to update spectrum' }, { status: 500 });
  }
}

// DELETE - Remove a spectrum
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ boxFolderId: string }> }
) {
  const { error } = await requireApiAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const spectrumId = searchParams.get('id');

  if (!spectrumId) {
    return NextResponse.json({ error: 'Spectrum ID required' }, { status: 400 });
  }

  try {
    await db.delete(spectra).where(eq(spectra.id, spectrumId));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting spectrum:', err);
    return NextResponse.json({ error: 'Failed to delete spectrum' }, { status: 500 });
  }
}
