import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../lib/db/schema';
import { getBoxClient } from '../lib/box/client';
import { createProject, createExperiment } from '../lib/box/folders';
import { Readable } from 'stream';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { eq } from 'drizzle-orm';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const connectionString = process.env.POSTGRES_URL!;
const client = postgres(connectionString, { ssl: { rejectUnauthorized: false }, max: 1 });
const db = drizzle(client, { schema });

// Helper: Random Item
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

async function hyperTest() {
    console.log('🚀 Starting HYPER-TEST (Power User Simulation)...\n');

    const boxClient = getBoxClient();
    if (!boxClient) throw new Error('Failed to initialize Box Client');

    // 1. Get or Create User
    let user = await db.query.users.findFirst({
        where: eq(schema.users.email, 'power_user@example.com')
    });

    if (!user) {
        console.log('👤 Creating Power User...');
        const [newUser] = await db.insert(schema.users).values({
            boxUserId: 'power_user_999',
            email: 'power_user@example.com',
            name: 'Max Power',
            role: 'pi'
        }).returning();
        user = newUser;
    }
    console.log(`   ✓ Active User: ${user.name}`);

    // 2. Create Projects (3 distinct types)
    const departments = ['Organic Chemistry', 'Quantum Physics', 'Molecular Biology'];
    
    for (const dept of departments) {
        const timestamp = Date.now();
        const code = `HYPER-${dept.substring(0,3).toUpperCase()}-${timestamp}`;
        console.log(`\n📁 Creating Project: ${code} (${dept})...\n`);

        // Box Creation
        const boxProj = await createProject(boxClient, {
            projectCode: code,
            projectName: `${dept} Advanced Research`,
            description: `Hyper-test generated project for ${dept}`,
            piName: user.name,
            piEmail: user.email,
            department: dept,
            status: 'active',
            startDate: new Date().toISOString()
        });

        // DB Creation
        const [dbProj] = await db.insert(schema.projects).values({
            boxFolderId: boxProj.folderId,
            projectCode: boxProj.projectCode,
            projectName: boxProj.projectName,
            description: boxProj.description,
            piName: boxProj.piName,
            piEmail: boxProj.piEmail,
            department: boxProj.department,
            status: boxProj.status,
            createdById: user.id
        }).returning();
        console.log(`   ✓ Project synced to DB (ID: ${dbProj.id})`);

        // 3. Create Experiments (3 per project)
        for (let i = 1; i <= 3; i++) {
            const expTitle = `Experiment ${i}: ${pick(['Synthesis', 'Analysis', 'Calibration'])}`;
            console.log(`      🧪 Creating Experiment: ${expTitle}...\n`);

            // Box Creation
            const boxExp = await createExperiment(boxClient, boxProj.folderId, {
                experimentId: `EXP-${code}-${i}`,
                experimentTitle: expTitle,
                objective: `Objective for ${expTitle}`,
                hypothesis: `Hypothesis for ${expTitle}`,
                ownerName: user.name,
                ownerEmail: user.email,
                status: pick(['draft', 'in-progress', 'completed']),
                tags: [pick(['synthesis', 'analysis', 'validation'])] // Valid tags only
            });

            // DB Creation
            const [dbExp] = await db.insert(schema.experiments).values({
                boxFolderId: boxExp.folderId,
                projectId: dbProj.id,
                experimentId: boxExp.experimentId,
                title: boxExp.experimentTitle,
                objective: boxExp.objective,
                hypothesis: boxExp.hypothesis,
                status: boxExp.status as any,
                authorId: user.id,
                startedAt: new Date()
            }).returning();

            // 4. Inject Micro-Data (Protocol, Reagents, Yields)
            
            // Protocol Steps
            const steps = [];
            for (let s = 1; s <= 5; s++) {
                steps.push({
                    experimentId: dbExp.id,
                    stepNumber: s,
                    instruction: `Step ${s}: Perform ${pick(['heating', 'cooling', 'stirring', 'filtering'])} operation.`,
                    notes: `Note: Observe color change.`
                });
            }
            await db.insert(schema.protocolSteps).values(steps);
            console.log(`         + Added 5 Protocol Steps`);

            // Reagents
            await db.insert(schema.reagents).values([
                { experimentId: dbExp.id, name: 'Reagent A', amount: '10', unit: 'mL', molarAmount: '0.1' },
                { experimentId: dbExp.id, name: 'Reagent B', amount: '5', unit: 'g', molarAmount: '0.05' }
            ]);
            console.log(`         + Added 2 Reagents`);

            // Yield (if completed)
            if (boxExp.status === 'completed') {
                await db.insert(schema.yields).values({
                    experimentId: dbExp.id,
                    productName: 'Final Product',
                    theoretical: '100',
                    actual: String(rand(80, 99)),
                    percentage: String(rand(80, 99)),
                    unit: 'mg'
                });
                console.log(`         + Added Yield Calculation`);
            }

            // 5. File Operation (Spectra)
            // Upload dummy file to Box
            const filename = `Spectrum_Data_${i}.txt`;
            const content = `Instrument Data\nDate: ${new Date().toISOString()}\nPeaks: ${rand(100, 500)}, ${rand(500, 1000)}`;
            const stream = Readable.from(Buffer.from(content));

            // Find Attachments folder
            const items = await boxClient.folders.getFolderItems(boxExp.folderId);
            const attFolder = items.entries?.find(e => e.name === 'Attachments');

            if (attFolder) {
                const upload = await boxClient.uploads.uploadFile({
                    attributes: { name: filename, parent: { id: attFolder.id } },
                    file: stream
                });
                const fileId = upload.entries![0].id;

                // Link in DB
                await db.insert(schema.spectra).values({
                    experimentId: dbExp.id,
                    boxFileId: fileId,
                    spectrumType: 'IR',
                    title: filename,
                    caption: 'Auto-generated spectrum'
                });
                console.log(`         + Uploaded & Linked File: ${filename}`);
            }
        }
    }

    console.log('\n✅ HYPER-TEST COMPLETE.');
    console.log('   - 3 Projects Created');
    console.log('   - 9 Experiments Created');
    console.log('   - 45 Protocol Steps Added');
    console.log('   - 18 Reagents Added');
    console.log('   - 9 Files Uploaded & Linked');
    
    process.exit(0);
}

hyperTest().catch(console.error);
