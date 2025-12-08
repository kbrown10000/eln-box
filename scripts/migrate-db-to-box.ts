import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import { BoxClient, BoxJwtAuth, JwtConfig } from 'box-typescript-sdk-gen';

const connectionString = process.env.POSTGRES_URL!;
const client = postgres(connectionString, { ssl: { rejectUnauthorized: false }, max: 1 });
const db = drizzle(client, { schema });

function formatPrivateKey(key: string): string {
  if (!key) return '';
  if (key.includes('\n')) {
    return key;
  }
  return key.replace(/\\n/g, '\n');
}

// Box Setup
const jwtConfig = new JwtConfig({
    clientId: process.env.BOX_CLIENT_ID!,
    clientSecret: process.env.BOX_CLIENT_SECRET!,
    jwtKeyId: process.env.BOX_PUBLIC_KEY_ID!,
    privateKey: formatPrivateKey(process.env.BOX_PRIVATE_KEY!),
    privateKeyPassphrase: process.env.BOX_PASSPHRASE!,
    enterpriseId: process.env.BOX_ENTERPRISE_ID!,
});
const auth = new BoxJwtAuth({ config: jwtConfig });
const boxClient = new BoxClient({ auth });

async function migrate() {
    console.log('🚀 Starting DB -> Box Metadata Migration...\n');

    // 1. Fetch all experiments from DB with their related data
    const experiments = await db.query.experiments.findMany({
        with: {
            yields: true,
            reagents: true,
            spectra: true
        }
    });

    console.log(`Found ${experiments.length} experiments to migrate.`);

    for (const exp of experiments) {
        console.log(`\nProcessing: ${exp.title} (${exp.boxFolderId})`);

        try {
            // --- Upsert Experiment Folder Metadata ---
            
            // Valid tags from template definition
            const validTags = new Set(['synthesis', 'analysis', 'characterization', 'purification', 'validation']);
            
            // Construct full metadata payload from DB
            const metadataPayload: any = {
                experimentId: exp.experimentId,
                experimentTitle: exp.title,
                objective: exp.objective || '',
                hypothesis: exp.hypothesis || '',
                status: exp.status,
            };

            if (exp.startedAt) metadataPayload.startedAt = exp.startedAt.toISOString().split('.')[0] + 'Z';
            if (exp.completedAt) metadataPayload.completedAt = exp.completedAt.toISOString().split('.')[0] + 'Z';

            // Add new fields
            if (exp.yields && exp.yields.length > 0) {
                const y = exp.yields[0];
                metadataPayload.yield = parseFloat(y.percentage as string);
                metadataPayload.theoreticalYield = parseFloat(y.theoretical as string);
                metadataPayload.actualYield = parseFloat(y.actual as string);
                metadataPayload.productName = y.productName;
                console.log(`   + Yield: ${y.percentage}%`);
            }

            if (exp.reagents && exp.reagents.length > 0) {
                metadataPayload.keyReagentsIndex = exp.reagents.map(r => r.name).join(', ');
                console.log(`   + Reagents: ${exp.reagents.length} items`);
            }

            console.log('   Payload:', JSON.stringify(metadataPayload, null, 2));

            try {
                // Try Create first
                await boxClient.folderMetadata.createFolderMetadataById(
                    exp.boxFolderId,
                    'enterprise',
                    'experimentMetadata',
                    metadataPayload
                );
                console.log('   ✅ Created Experiment Metadata');
            } catch (e: any) {
                if (e.responseInfo?.statusCode === 409) {
                    // Conflict -> Update
                    const updateOps = [];
                    if (metadataPayload.yield) updateOps.push({ op: 'add', path: '/yield', value: metadataPayload.yield });
                    if (metadataPayload.theoreticalYield) updateOps.push({ op: 'add', path: '/theoreticalYield', value: metadataPayload.theoreticalYield });
                    if (metadataPayload.actualYield) updateOps.push({ op: 'add', path: '/actualYield', value: metadataPayload.actualYield });
                    if (metadataPayload.productName) updateOps.push({ op: 'add', path: '/productName', value: metadataPayload.productName });
                    if (metadataPayload.keyReagentsIndex) updateOps.push({ op: 'add', path: '/keyReagentsIndex', value: metadataPayload.keyReagentsIndex });

                    try {
                        await boxClient.folderMetadata.updateFolderMetadataById(
                            exp.boxFolderId,
                            'enterprise',
                            'experimentMetadata',
                            updateOps
                        );
                        console.log('   ✅ Updated Experiment Metadata');
                    } catch (updateErr: any) {
                         try {
                             const replaceOps = updateOps.map(op => ({ ...op, op: 'replace' }));
                             await boxClient.folderMetadata.updateFolderMetadataById(
                                exp.boxFolderId,
                                'enterprise',
                                'experimentMetadata',
                                replaceOps
                            );
                            console.log('   ✅ Updated Experiment Metadata (via replace)');
                         } catch (replaceErr: any) {
                             console.warn(`   ⚠️  Update failed: ${replaceErr.message}`);
                         }
                    }
                } else if (e.responseInfo?.statusCode === 400) {
                    console.error(`   ❌ Failed to create metadata (400 Bad Request): ${e.message}`);
                    if (e.responseInfo?.body?.context_info) {
                        console.error('      Context Info:', JSON.stringify(e.responseInfo.body.context_info, null, 2));
                    }
                } else {
                    console.warn(`   ⚠️  Failed to create metadata: ${e.message}`);
                    if (e.responseInfo?.body) {
                        console.warn('   Error Body:', JSON.stringify(e.responseInfo.body, null, 2));
                    }
                }
            }

            // --- Migrate Spectra to File Metadata ---
            if (exp.spectra && exp.spectra.length > 0) {
                console.log(`   + Spectra: ${exp.spectra.length} records. Searching for files...`);
                
                const items = await boxClient.folders.getFolderItems(exp.boxFolderId);
                const attachmentsFolder = items.entries?.find(e => e.name === 'Attachments');
                let allFiles: any[] = [];
                
                // Root files
                if (items.entries) allFiles = [...items.entries.filter(e => e.type === 'file')];

                // Attachment files
                if (attachmentsFolder) {
                     const attItems = await boxClient.folders.getFolderItems(attachmentsFolder.id);
                     for (const item of attItems.entries || []) {
                         if (item.type === 'file') {
                             allFiles.push(item);
                         } else if (item.type === 'folder') {
                             // Check subfolders like 'Images'
                             const subFiles = await boxClient.folders.getFolderItems(item.id);
                             if (subFiles.entries) {
                                 allFiles = [...allFiles, ...subFiles.entries.filter(e => e.type === 'file')];
                             }
                         }
                     }
                }
                console.log(`      Scanned ${allFiles.length} files in folder.`);

                for (const spec of exp.spectra) {
                    // Fuzzy match filename
                    const safeTitle = spec.title || '';
                    const file = allFiles.find(f => 
                        f.name.includes(safeTitle) || 
                        (safeTitle && f.name.includes(safeTitle.split('.')[0]))
                    );
                    
                    if (file) {
                        console.log(`      Found file for ${spec.title}: ${file.name} (${file.id})`);
                        
                        // Create spectrumMetadata on file
                        try {
                            await boxClient.fileMetadata.createFileMetadataById(
                                file.id,
                                'enterprise',
                                'spectrumMetadata',
                                {
                                    technique: spec.spectrumType === 'other' ? 'Other' : spec.spectrumType, // Map enum
                                    instrument: 'Unknown', // Not in DB
                                    sampleId: exp.experimentId,
                                    peakSummary: JSON.stringify(spec.peakData) // Store peak data as string for now
                                }
                            );
                            console.log('      ✅ Applied Spectrum Metadata');
                        } catch (e: any) {
                             console.warn(`      ⚠️  Metadata likely exists or error: ${e.message}`);
                        }
                    } else {
                        console.log(`      ❌ Could not find file for spectrum: ${spec.title}`);
                    }
                }
            }

        } catch (err) {
            console.error(`❌ Error processing experiment ${exp.experimentId}:`, err);
        }
    }

    console.log('\n✨ Migration complete!');
    process.exit(0);
}

migrate().catch(console.error);
