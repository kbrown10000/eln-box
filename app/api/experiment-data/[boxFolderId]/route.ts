import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth/session';
import { getBoxClient } from '@/lib/box/client';
import { db } from '@/lib/db';
import {
  experiments,
  protocolSteps as protocolStepsSchema,
  reagents as reagentsSchema,
  yields as yieldsSchema,
  spectra as spectraSchema
} from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';

// GET all experiment data by Box folder ID (From Box Metadata)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ boxFolderId: string }> }
) {
  const { error } = await requireApiAuth();
  if (error) return error;

  const { boxFolderId } = await params;

  try {
    const client = getBoxClient();
    if (!client) {
      throw new Error('Box client not initialized');
    }
    const enterpriseId = process.env.BOX_ENTERPRISE_ID;

    // 1. Fetch Experiment Folder Metadata
    let metadata: any = {};
    try {
        metadata = await client.folderMetadata.getFolderMetadataById(
            boxFolderId,
            'enterprise',
            'experimentMetadata'
        );
    } catch (e: any) {
        // Metadata might not exist yet
        console.warn(`Metadata not found for folder ${boxFolderId}`);
    }

    // 2. Parse Yields
    const yields: any[] = [];
    if (typeof metadata.yield === 'number') {
        yields.push({
            id: 'yield-1', // Mock ID
            productName: metadata.productName || 'Product',
            theoretical: metadata.theoreticalYield || 0,
            actual: metadata.actualYield || 0,
            percentage: metadata.yield,
            unit: 'g' // Default
        });
    }

    // 3. Parse Reagents
    const reagents: any[] = [];
    if (metadata.keyReagentsIndex) {
        const names = metadata.keyReagentsIndex.split(',').map((s: string) => s.trim());
        names.forEach((name: string, index: number) => {
            if (name) {
                reagents.push({
                    id: `reagent-${index}`,
                    name: name,
                    amount: 0, // Not stored in metadata
                    unit: 'mL',
                    observations: 'From Box Metadata'
                });
            }
        });
    }

    // 4. Fetch Spectra (Files with spectrumMetadata)
    const spectra: any[] = [];
    try {
        const specFrom = `enterprise_${enterpriseId}.spectrumMetadata`;
        // Search for files inside this experiment folder that have the metadata
        const searchResults = await client.search.searchByMetadataQuery({
            from: specFrom,
            query: "technique IS NOT NULL",
            ancestorFolderId: boxFolderId,
            fields: [
                "name", "id",
                `metadata.${specFrom}.technique`,
                `metadata.${specFrom}.instrument`,
                `metadata.${specFrom}.peakSummary`
            ]
        });

        if (searchResults.entries) {
            for (const item of searchResults.entries) {
                const md = (item.metadata as any)?.[`enterprise_${enterpriseId}`]?.spectrumMetadata || {};
                spectra.push({
                    id: item.id,
                    spectrumType: md.technique || 'Other',
                    caption: md.instrument || '',
                    boxFileId: item.id,
                    title: item.name,
                    peakData: md.peakSummary ? JSON.parse(md.peakSummary) : {} // Assuming JSON string
                });
            }
        }
    } catch (e) {
        console.warn('Error fetching spectra metadata:', e);
    }

    // 5. Protocol Steps, Reagents, Yields, Spectra (From Database)
    let protocolSteps: any[] = [];
    try {
        const dbExperiment = await db.query.experiments.findFirst({
            where: eq(experiments.boxFolderId, boxFolderId),
            with: {
                protocolSteps: { orderBy: asc(protocolStepsSchema.stepNumber) },
                reagents: true,
                yields: true,
                spectra: true
            }
        });

        if (dbExperiment) {
            protocolSteps = dbExperiment.protocolSteps;
            // Override metadata-based arrays if DB has data
            if (dbExperiment.reagents.length > 0) {
                // Map DB reagents to expected format (ensure numbers are numbers)
                reagents.length = 0; // Clear metadata reagents
                reagents.push(...dbExperiment.reagents.map(r => ({
                    ...r,
                    amount: parseFloat(r.amount as any) || 0,
                    molarAmount: parseFloat(r.molarAmount as any) || 0
                })));
            }
            
            if (dbExperiment.yields.length > 0) {
                yields.length = 0;
                yields.push(...dbExperiment.yields.map(y => ({
                    ...y,
                    theoretical: parseFloat(y.theoretical as any) || 0,
                    actual: parseFloat(y.actual as any) || 0,
                    percentage: parseFloat(y.percentage as any) || 0
                })));
            }

            if (dbExperiment.spectra.length > 0) {
                spectra.length = 0;
                spectra.push(...dbExperiment.spectra);
            }
        }
    } catch (e) {
        console.error('Error fetching experiment data from DB:', e);
    }

    return NextResponse.json({
      experimentId: metadata.experimentId || 'Unknown',
      protocolSteps,
      reagents,
      yields,
      spectra,
    });

  } catch (err) {
    console.error('Error fetching experiment data from Box:', err);
    return NextResponse.json({ error: 'Failed to fetch experiment data' }, { status: 500 });
  }
}
