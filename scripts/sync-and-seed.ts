import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../lib/db/schema';
import { getBoxClient } from '../lib/box/client';
import { listProjects, listExperiments, createProject, createExperiment } from '../lib/box/folders';
import { Readable } from 'stream';

const connectionString = process.env.POSTGRES_URL!;
console.log('DB URL:', connectionString ? connectionString.substring(0, 20) + '...' : 'UNDEFINED');

const client = postgres(connectionString, {
    ssl: { rejectUnauthorized: false },
    max: 1
});
const db = drizzle(client, { schema });

// Sample Data Generators
const sampleProjects = [
    {
        projectCode: 'CHEM-2025-001',
        projectName: 'Advanced Polymer Synthesis',
        description: 'Synthesis of novel conducting polymers for solar cells.',
        status: 'active' as const,
        department: 'Chemistry'
    },
    // ... other projects ...
];

const sampleExperiments = [
    { title: 'Polymerization of Thiophene', objective: 'Synthesize polythiophene via oxidative coupling.', status: 'completed' },
    { title: 'Conductivity Measurement', objective: 'Measure conductivity of doped films.', status: 'in-progress' },
    { title: 'Vector Construction', objective: 'Clone gRNA into pX330 vector.', status: 'completed' },
    { title: 'Transfection Optimization', objective: 'Test Lipofectamine vs Electroporation.', status: 'in-progress' },
    { title: 'Absorption Spectra', objective: 'Measure UV-Vis absorption of QD samples.', status: 'completed' },
    { title: 'PL Quantum Yield', objective: 'Determine photoluminescence quantum yield.', status: 'draft' },
    { title: 'Algal Culture Growth', objective: 'Monitor growth rate under different light conditions.', status: 'in-progress' },
    { title: 'Lipid Extraction', objective: 'Extract lipids using Bligh-Dyer method.', status: 'draft' },
    { title: 'Nanoparticle Formulation', objective: 'Prepare PLGA NPs using nanoprecipitation.', status: 'completed' },
    { title: 'Release Profile Study', objective: 'Measure drug release over 72 hours.', status: 'in-progress' }
];

async function syncAndSeed() {
    console.log('🚀 Starting Sync & Seed Process...\n');

    const boxClient = getBoxClient();
    if (!boxClient) throw new Error('Failed to initialize Box Client');

    // 1. Clean Database (Optional but recommended for consistency)
    console.log('🧹 Cleaning Database...');
    await db.delete(schema.yields);
    await db.delete(schema.spectra);
    await db.delete(schema.reagents);
    await db.delete(schema.protocolSteps);
    await db.delete(schema.experiments);
    await db.delete(schema.projects);
    console.log('   ✓ Database cleaned.');

    // 2. Get or Create Demo User
    let user = await db.query.users.findFirst({
        where: eq(schema.users.email, 'demo@example.com')
    });

    if (!user) {
        console.log('👤 Creating Demo User...');
        const [newUser] = await db.insert(schema.users).values({
            boxUserId: 'demo_user_123',
            email: 'demo@example.com',
            name: 'Demo Researcher',
            role: 'researcher'
        }).returning();
        user = newUser;
    }
    console.log(`   ✓ User: ${user.name}`);

    // 3. Sync Existing Box Projects -> DB
    console.log('\n🔄 Syncing Existing Box Projects...');
    const existingBoxProjects = await listProjects(boxClient, { limit: 100 });
    console.log(`   Found ${existingBoxProjects.totalCount} projects in Box.`);

    for (const proj of existingBoxProjects.items) {
        try {
            // Insert into DB
            const [newProj] = await db.insert(schema.projects).values({
                boxFolderId: proj.folderId,
                projectCode: proj.projectCode,
                projectName: proj.projectName,
                description: proj.description,
                piName: proj.piName,
                piEmail: proj.piEmail,
                department: proj.department,
                status: proj.status,
                createdById: user.id
            }).returning();
            console.log(`   ✓ Synced Project: ${proj.projectName} -> DB ID: ${newProj.id}`);

            // Sync Experiments for this project
            const experiments = await listExperiments(boxClient, proj.folderId, { limit: 50 });
            for (const exp of experiments.items) {
                await db.insert(schema.experiments).values({
                    boxFolderId: exp.folderId,
                    projectId: newProj.id,
                    experimentId: exp.experimentId,
                    title: exp.experimentTitle,
                    objective: exp.objective,
                    hypothesis: exp.hypothesis,
                    status: exp.status as any,
                    authorId: user.id,
                    startedAt: exp.startedAt ? new Date(exp.startedAt) : new Date(),
                    completedAt: exp.completedAt ? new Date(exp.completedAt) : null
                });
                console.log(`      ✓ Synced Experiment: ${exp.experimentTitle}`);
            }

        } catch (e) {
            console.error(`   ❌ Failed to sync project ${proj.projectName}:`, e);
        }
    }

    // 4. Create New Demo Data (if we have fewer than 5 projects)
    if (existingBoxProjects.totalCount < 5) {
        console.log('\n🌱 Seeding New Demo Data...');
        let expIndex = 0;
        
        for (const projData of sampleProjects) {
            // Skip if code already exists (simple check)
            const exists = existingBoxProjects.items.some(p => p.projectCode === projData.projectCode);
            if (exists) continue;

            console.log(`   Creating Project: ${projData.projectName}...`);
            
            // Create in Box
            let boxProj;
            try {
                boxProj = await createProject(boxClient, {
                    ...projData,
                    piName: user.name,
                    piEmail: user.email,
                    startDate: new Date().toISOString()
                });
            } catch (err: any) {
                if (err?.responseInfo?.statusCode === 409) {
                    console.log(`      ⚠️ Project folder already exists (409). Skipping creation.`);
                    continue;
                }
                throw err;
            }

            // Create in DB
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

            // Create 2 Experiments per Project
            for (let i = 0; i < 2; i++) {
                const expData = sampleExperiments[expIndex % sampleExperiments.length];
                expIndex++;
                
                const expId = `EXP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
                
                console.log(`      Creating Experiment: ${expData.title}...`);
                
                // Create in Box
                const boxExp = await createExperiment(boxClient, boxProj.folderId, {
                    experimentId: expId,
                    experimentTitle: expData.title,
                    objective: expData.objective,
                    hypothesis: `Hypothesis for ${expData.title}`,
                    ownerName: user.name,
                    ownerEmail: user.email,
                    status: expData.status as any,
                    tags: ['demo', 'auto-generated']
                });

                // Create in DB
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

                // Upload a sample entry file
                const entryContent = `# ${expData.title}\n\n## Date: ${new Date().toISOString()}\n\nObservation:\nSample created successfully.\n\nResult:\nYield was consistent with expectations.`;
                const buffer = Buffer.from(entryContent);
                const stream = Readable.from(buffer);
                
                // Find Entries folder (we know structure from createExperiment)
                const subfolders = await boxClient.folders.getFolderItems(boxExp.folderId);
                const entriesFolder = subfolders.entries?.find(e => e.name === 'Entries');
                
                if (entriesFolder) {
                    await boxClient.uploads.uploadFile({
                        attributes: { name: `Entry-1-Initial-Obs.md`, parent: { id: entriesFolder.id } },
                        file: stream
                    });
                    console.log(`         ✓ Uploaded sample entry`);
                }
            }
        }
    } else {
        console.log('\nℹ️ Enough projects exist. Skipping creation.');
    }

    console.log('\n✅ Sync & Seed Complete!');
    process.exit(0);
}

syncAndSeed().catch(e => {
    console.error('Fatal Error:', e);
    process.exit(1);
});
