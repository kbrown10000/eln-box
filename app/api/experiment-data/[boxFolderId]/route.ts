import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth/session';
import { getBoxClient } from '@/lib/box/client';

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
                const md = item.metadata?.[`enterprise_${enterpriseId}`]?.spectrumMetadata || {};
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

    // 5. Protocol Steps (Not in metadata yet)
    const protocolSteps: any[] = [];

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
