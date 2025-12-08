/**
 * Deploy Demo & Sync Script
 * 
 * 1. Syncs existing Box folders (Projects/Experiments) to Postgres DB.
 * 2. Hydrates DB with demo data (Reagents, Protocols) for specific experiments.
 * 3. Uploads sample files to Box if missing. 
 * 
 * Usage: npx tsx scripts/deploy-demo.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { Readable } from 'stream';

config({ path: resolve(process.cwd(), '.env.local') });

import { BoxClient, BoxJwtAuth, JwtConfig } from 'box-typescript-sdk-gen';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import * as schema from '../lib/db/schema';

// --- Configuration ---
const BOX_PROJECTS_FOLDER_ID = process.env.BOX_PROJECTS_FOLDER_ID!;
if (!BOX_PROJECTS_FOLDER_ID) throw new Error("BOX_PROJECTS_FOLDER_ID not set");

const jwtConfig = new JwtConfig({
  clientId: process.env.BOX_CLIENT_ID!,
  clientSecret: process.env.BOX_CLIENT_SECRET!,
  jwtKeyId: process.env.BOX_PUBLIC_KEY_ID!,
  privateKey: process.env.BOX_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  privateKeyPassphrase: process.env.BOX_PASSPHRASE!,
  enterpriseId: process.env.BOX_ENTERPRISE_ID!,
});

const auth = new BoxJwtAuth({ config: jwtConfig });
const boxClient = new BoxClient({ auth });

const queryClient = postgres(process.env.POSTGRES_URL!);
const db = drizzle(queryClient, { schema });

// --- Demo Data Definitions ---
const DEMO_DATA: any = {
  'EXP-001': {
    protocol: [
      'Weigh 2.00 g of salicylic acid.', 'Add 5.0 mL acetic anhydride.', 'Add 5 drops H2SO4.', 'Heat at 85°C for 15 min.', 'Cool and add water.', 'Filter crystals.', 'Recrystallize from ethanol.', 'Dry and weigh.'
    ],
    reagents: [
      { name: 'Salicylic Acid', amount: '2.01', unit: 'g', molarAmount: '0.01455', observations: 'White powder' },
      { name: 'Acetic Anhydride', amount: '5.0', unit: 'mL', molarAmount: '0.0529', observations: 'Clear liquid' },
      { name: 'Sulfuric Acid', amount: '0.25', unit: 'mL', molarAmount: '0.0045', observations: 'Catalyst' }
    ],
    yield: { theoretical: '2.61', actual: '2.20', percentage: '84.29', unit: 'g', productName: 'Aspirin' },
    files: [
      { name: 'IR_Report.txt', content: 'IR Spectrum: Peaks at 1750, 1680 cm-1 consistent with aspirin.' }
    ]
  }
  // Add more demo exp data here if needed
};

async function main() {
  console.log('🚀 Starting Sync & Seed...');

  // 0. Ensure User Exists (Service Account Owner)
  const userEmail = 'admin@labnotex.demo';
  let user = await db.query.users.findFirst({ where: eq(schema.users.email, userEmail) });
  if (!user) {
      const [newUser] = await db.insert(schema.users).values({
          boxUserId: 'service-account',
          name: 'System Admin',
          email: userEmail,
          role: 'admin'
      }).returning();
      user = newUser;
      console.log(`✓ Created admin user: ${user.id}`);
  }

  // 1. Sync Projects
  console.log('\n📂 Syncing Projects...');
  const projectFolders = await boxClient.folders.getFolderItems(BOX_PROJECTS_FOLDER_ID);
  
  for (const folder of projectFolders.entries || []) {
      if (folder.type !== 'folder') continue;
      
      console.log(`  Processing Project: ${folder.name}`);
      
      // Try to get metadata, or parse name
      let projectCode = 'UNKNOWN';
      let projectName = folder.name!;
      let status = 'planning';
      
      try {
          const enterpriseId = process.env.BOX_ENTERPRISE_ID;
          const scope = `enterprise_${enterpriseId}`;
          const md: any = await boxClient.folderMetadata.getFolderMetadataById(folder.id, scope, 'projectMetadata');
          projectCode = md.projectCode;
          projectName = md.projectName;
          status = md.status;
      } catch (e) {
          // Fallback parsing
          const parts = folder.name!.split('-');
          if (parts.length > 1) {
             projectCode = parts[0]; // Rough guess
             // We won't try too hard on name if metadata missing
          }
      }

      // Upsert Project
      let dbProject = await db.query.projects.findFirst({ where: eq(schema.projects.boxFolderId, folder.id) });
      if (!dbProject) {
          const [newProj] = await db.insert(schema.projects).values({
              boxFolderId: folder.id,
              projectCode,
              projectName,
              status,
              createdById: user!.id
          }).returning();
          dbProject = newProj;
          console.log(`    ✓ Inserted DB record: ${dbProject.id}`);
      } else {
          console.log(`    ✓ DB record exists`);
      }

      // 2. Sync Experiments for this Project
      const subItems = await boxClient.folders.getFolderItems(folder.id);
      const expRoot = subItems.entries?.find((e: any) => e.name === 'Experiments');
      
      if (expRoot) {
          const expFolders = await boxClient.folders.getFolderItems(expRoot.id);
          for (const expFolder of expFolders.entries || []) {
              if (expFolder.type !== 'folder') continue;
              console.log(`    Processing Experiment: ${expFolder.name}`);

              // Get metadata
              let expId = 'UNKNOWN';
              let expTitle = expFolder.name!;
              let expStatus = 'draft';

              try {
                  const md: any = await boxClient.folderMetadata.getFolderMetadataById(expFolder.id, 'enterprise', 'experimentMetadata');
                  expId = md.experimentId;
                  expTitle = md.experimentTitle;
                  expStatus = md.status;
              } catch (e) {
                   const parts = expFolder.name!.split('-');
                   if (parts.length > 1) expId = parts[0];
              }

              // Upsert Experiment
              let dbExp = await db.query.experiments.findFirst({ where: eq(schema.experiments.boxFolderId, expFolder.id) });
              if (!dbExp) {
                  const [newExp] = await db.insert(schema.experiments).values({
                      boxFolderId: expFolder.id,
                      projectId: dbProject.id,
                      experimentId: expId,
                      title: expTitle,
                      status: expStatus as any,
                      authorId: user!.id
                  }).returning();
                  dbExp = newExp;
                  console.log(`      ✓ Inserted DB record`);
              }

              // 3. Hydrate Demo Data (if matching ID)
              const seed = DEMO_DATA[expId];
              if (seed) {
                  console.log(`      💧 Hydrating data for ${expId}...`);
                  
                  // Protocol
                  const steps = await db.query.protocolSteps.findMany({ where: eq(schema.protocolSteps.experimentId, dbExp.id) });
                  if (steps.length === 0) {
                      for (let i=0; i<seed.protocol.length; i++) {
                          await db.insert(schema.protocolSteps).values({
                              experimentId: dbExp.id,
                              stepNumber: i+1,
                              instruction: seed.protocol[i]
                          });
                      }
                      console.log(`        + Added protocol steps`);
                  }

                  // Reagents
                  const reagents = await db.query.reagents.findMany({ where: eq(schema.reagents.experimentId, dbExp.id) });
                  if (reagents.length === 0) {
                      for (const r of seed.reagents) {
                          await db.insert(schema.reagents).values({
                              experimentId: dbExp.id,
                              ...r
                          });
                      }
                      console.log(`        + Added reagents`);
                  }

                  // Yield
                  const yields = await db.query.yields.findMany({ where: eq(schema.yields.experimentId, dbExp.id) });
                  if (yields.length === 0 && seed.yield) {
                      await db.insert(schema.yields).values({
                          experimentId: dbExp.id,
                          ...seed.yield
                      });
                      console.log(`        + Added yield`);
                  }

                  // Files
                  if (seed.files) {
                      for (const f of seed.files) {
                          const buffer = Buffer.from(f.content);
                          const stream = Readable.from(buffer);
                          // Check exist
                          const items = await boxClient.folders.getFolderItems(expFolder.id); // Root of exp
                          if (!items.entries?.find((e: any) => e.name === f.name)) {
                              await boxClient.uploads.uploadFile({
                                  attributes: { name: f.name, parent: { id: expFolder.id } },
                                  file: stream
                              });
                              console.log(`        + Uploaded ${f.name}`);
                          }
                      }
                  }
              }
          }
      }
  }

  console.log('\n✅ Sync & Seed Complete!');
  await queryClient.end();
}

main().catch(console.error);
