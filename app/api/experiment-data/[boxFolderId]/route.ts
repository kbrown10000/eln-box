import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { experiments, protocolSteps, reagents, yields, spectra } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';

// GET all experiment data by Box folder ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ boxFolderId: string }> }
) {
  const { error } = await requireApiAuth();
  if (error) return error;

  const { boxFolderId } = await params;

  try {
    // Find experiment by Box folder ID
    const experiment = await db.query.experiments.findFirst({
      where: eq(experiments.boxFolderId, boxFolderId),
      with: {
        protocolSteps: {
          orderBy: [asc(protocolSteps.stepNumber)],
        },
        reagents: true,
        yields: true,
        spectra: true,
      },
    });

    if (!experiment) {
      // Return empty data structure if experiment not in DB yet
      return NextResponse.json({
        experimentId: null,
        protocolSteps: [],
        reagents: [],
        yields: [],
        spectra: [],
      });
    }

    return NextResponse.json({
      experimentId: experiment.id,
      protocolSteps: experiment.protocolSteps,
      reagents: experiment.reagents,
      yields: experiment.yields,
      spectra: experiment.spectra,
    });
  } catch (err) {
    console.error('Error fetching experiment data:', err);
    return NextResponse.json({ error: 'Failed to fetch experiment data' }, { status: 500 });
  }
}
