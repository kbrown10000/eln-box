import { BoxClient, BoxJwtAuth, JwtConfig } from 'box-typescript-sdk-gen';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Readable } from 'stream';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Helper: Random float
const rand = (min: number, max: number, dec: number = 1) => 
    parseFloat((Math.random() * (max - min) + min).toFixed(dec));

// Helper: Random Item
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const DEPARTMENTS = ['Organic Chem', 'Materials Science', 'Biochem'];
const PROJECT_PREFIXES = ['POLY', 'NANO', 'DRUG'];
const REAGENTS = ['Benzene', 'Acetone', 'Ethanol'];
const TECHNIQUES = ['IR', 'NMR', 'MS'];

function formatPrivateKey(key: string): string {
    if (!key) return '';
    if (key.includes('\n')) return key;
    return key.replace(/\\n/g, '\n');
}

async function generateVolumeData() {
    console.log('🚀 Generating Volume Data (Box Metadata-First)...');

    const envKey = process.env.BOX_PRIVATE_KEY || '';
    const pKey = formatPrivateKey(envKey);

    const jwtConfig = new JwtConfig({
        clientId: process.env.BOX_CLIENT_ID!,
        clientSecret: process.env.BOX_CLIENT_SECRET!,
        jwtKeyId: process.env.BOX_PUBLIC_KEY_ID!,
        privateKey: pKey,
        privateKeyPassphrase: process.env.BOX_PASSPHRASE!,
        enterpriseId: process.env.BOX_ENTERPRISE_ID!,
    });

    const auth = new BoxJwtAuth({ config: jwtConfig });
    const client = new BoxClient({ auth });

    const projectsFolderId = process.env.BOX_PROJECTS_FOLDER_ID;
    if (!projectsFolderId) throw new Error("Missing BOX_PROJECTS_FOLDER_ID");

    const NUM_PROJECTS = 5; 
    const EXPS_PER_PROJECT = 3;

    for (let i = 0; i < NUM_PROJECTS; i++) {
        const dept = pick(DEPARTMENTS);
        const prefix = pick(PROJECT_PREFIXES);
        const year = 2025;
        const code = `${prefix}-${year}-${100 + i}`;
        const name = `${dept} Research ${code}`;
        
        console.log(`
📁 Creating Project [${i+1}/${NUM_PROJECTS}]: ${name}`);

        try {
            // 1. Create Project Folder
            const folder = await client.folders.createFolder({
                parent: { id: projectsFolderId },
                name: `${code}-${name.replace(/\s+/g, '-')}`
            });

            // 2. Project Metadata
            await client.folderMetadata.createFolderMetadataById(
                folder.id,
                'enterprise',
                'projectMetadata',
                {
                    projectCode: code,
                    projectName: name,
                    piName: 'Dr. Box Generator',
                    piEmail: 'generator@box.demo',
                    department: dept,
                    startDate: new Date().toISOString().split('T')[0] + 'T00:00:00Z',
                    status: pick(['active', 'planning', 'completed']),
                    description: `Auto-generated project for ${dept} research.`
                }
            );

            // 3. Create Experiments Folder
            const expRoot = await client.folders.createFolder({
                parent: { id: folder.id },
                name: 'Experiments'
            });

            for (let j = 0; j < EXPS_PER_PROJECT; j++) {
                const expId = `EXP-${code}-${j+1}`;
                const expTitle = `${pick(['Synthesis', 'Analysis', 'Characterization'])} of Sample ${j+1}`;
                
                console.log(`   🧪 Experiment: ${expTitle}`);

                const expFolder = await client.folders.createFolder({
                    parent: { id: expRoot.id },
                    name: `${expId}-${expTitle.replace(/\s+/g, '-')}`
                });

                // Attachments folder for spectra
                const attFolder = await client.folders.createFolder({
                    parent: { id: expFolder.id },
                    name: 'Attachments'
                });

                // Experiment Metadata (Rich Data)
                const theoretical = rand(5, 20);
                const actual = rand(0, theoretical);
                const yieldPct = (actual / theoretical) * 100;
                const reagentsList = [pick(REAGENTS), pick(REAGENTS)];

                await client.folderMetadata.createFolderMetadataById(
                    expFolder.id,
                    'enterprise',
                    'experimentMetadata',
                    {
                        experimentId: expId,
                        experimentTitle: expTitle,
                        objective: 'Automated data generation',
                        hypothesis: 'Box Metadata scales well.',
                        ownerName: 'Dr. Box Generator',
                        ownerEmail: 'generator@box.demo',
                        status: pick(['draft', 'in-progress', 'completed']),
                        startedAt: new Date().toISOString().split('T')[0] + 'T00:00:00Z',
                        // New Fields
                        yield: yieldPct,
                        theoreticalYield: theoretical,
                        actualYield: actual,
                        productName: `Compound ${prefix}-${j}`,
                        keyReagentsIndex: reagentsList.join(', ')
                    }
                );

                // Upload Spectrum File
                if (Math.random() > 0.3) {
                    const tech = pick(TECHNIQUES);
                    const specName = `${tech}_Spectrum_${j}.pdf`;
                    const stream = Readable.from(Buffer.from(`Fake PDF Content for ${tech}`));
                    
                    const file = await client.uploads.uploadFile({
                        attributes: { name: specName, parent: { id: attFolder.id } },
                        file: stream
                    });
                    
                    const fileId = file.entries![0].id;

                    await client.fileMetadata.createFileMetadataById(
                        fileId,
                        'enterprise',
                        'spectrumMetadata',
                        {
                            technique: tech === 'Other' ? 'Other' : tech,
                            instrument: 'Auto-Bot 3000',
                            sampleId: expId,
                            peakSummary: JSON.stringify({ peak1: rand(100, 3000) })
                        }
                    );
                    console.log(`      📄 Added Spectrum: ${specName}`);
                }
            }

        } catch (e: any) {
            if (e.responseInfo?.statusCode === 409) {
                console.log('      ⚠️ Exists, skipping.');
            } else {
                console.error('      ❌ Error:', e.message);
            }
        }
    }
    console.log('\n✨ Volume Data Generation Complete!');
}

generateVolumeData().catch(console.error);
