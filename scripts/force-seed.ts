import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../lib/db/schema';
import { getBoxClient } from '../lib/box/client';
import { createProject, createExperiment } from '../lib/box/folders';
import { Readable } from 'stream';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const connectionString = process.env.POSTGRES_URL!;
const client = postgres(connectionString, { ssl: { rejectUnauthorized: false }, max: 1 });
const db = drizzle(client, { schema });

async function forceSeed() {
    console.log('🚀 Starting Force Seed...\n');

    const boxClient = getBoxClient();
    if (!boxClient) throw new Error('Failed to initialize Box Client');

    // Get User
    const user = await db.query.users.findFirst();
    if (!user) {
        console.error('No user found. Run sync-and-seed first.');
        process.exit(1);
    }

    const timestamp = Date.now();
    const projCode = `FORCE-${timestamp}`;
    
    console.log(`Creating Project: ${projCode}...`);

    // Create Project in Box
    const boxProj = await createProject(boxClient, {
        projectCode: projCode,
        projectName: 'Forced Migration Test',
        description: 'Data created specifically to test DB-to-Box migration.',
        piName: user.name,
        piEmail: user.email,
        department: 'Testing',
        status: 'active'
    });

    // Create Project in DB
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

    console.log(`   ✓ Created Project DB ID: ${dbProj.id}`);

    // Create Experiment with Rich Data
    const expTitle = 'High Yield Synthesis Test';
    console.log(`   Creating Experiment: ${expTitle}...`);

    const boxExp = await createExperiment(boxClient, boxProj.folderId, {
        experimentId: `EXP-${timestamp}`,
        experimentTitle: expTitle,
        objective: 'Generate data for migration.',
        hypothesis: 'Data will move to metadata.',
        ownerName: user.name,
        ownerEmail: user.email,
        status: 'completed',
        tags: ['migration-test']
    });

    // Create Experiment in DB
    const [dbExp] = await db.insert(schema.experiments).values({
        boxFolderId: boxExp.folderId,
        projectId: dbProj.id,
        experimentId: boxExp.experimentId,
        title: boxExp.experimentTitle,
        objective: boxExp.objective,
        hypothesis: boxExp.hypothesis,
        status: 'completed',
        authorId: user.id,
        startedAt: new Date()
    }).returning();

    // Add DB-Only Data (to be migrated)
    
    // 1. Yields
    await db.insert(schema.yields).values({
        experimentId: dbExp.id,
        productName: 'Test Compound A',
        theoretical: '10.0',
        actual: '9.5',
        percentage: '95.0',
        unit: 'g'
    });
    console.log('   + Added Yield (DB)');

    // 2. Reagents
    await db.insert(schema.reagents).values([
        { experimentId: dbExp.id, name: 'Benzene', amount: '50', unit: 'mL' },
        { experimentId: dbExp.id, name: 'Nitric Acid', amount: '10', unit: 'mL' }
    ]);
    console.log('   + Added Reagents (DB)');

    // 3. Spectra (File must exist in Box to migrate metadata!)
    // Upload a dummy spectrum file first
    const spectrumFilename = 'IR_Spectrum_Test.pdf';
    const buffer = Buffer.from('%PDF-1.4 ... dummy pdf content ...');
    const stream = Readable.from(buffer);
    
    const items = await boxClient.folders.getFolderItems(boxExp.folderId);
    const attFolder = items.entries?.find(e => e.name === 'Attachments');
    
    if (attFolder) {
        await boxClient.uploads.uploadFile({
            attributes: { name: spectrumFilename, parent: { id: attFolder.id } },
            file: stream
        });
        console.log('   + Uploaded dummy spectrum file to Box');

        await db.insert(schema.spectra).values({
            experimentId: dbExp.id,
            spectrumType: 'IR',
            title: spectrumFilename,
            caption: 'Test IR Spectrum'
        });
        console.log('   + Added Spectrum record (DB)');
    }

    console.log('\n✅ Force Seed Complete!');
    process.exit(0);
}

forceSeed().catch(console.error);
