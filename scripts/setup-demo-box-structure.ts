/**
 * Set up proper Box folder structure and update database
 *
 * This script:
 * 1. Creates experiment folders in Box (under the Experiments subfolder)
 * 2. Updates the database with the real Box folder IDs
 * 3. Uploads sample files to the experiment folders
 */
import { config } from 'dotenv';
import { resolve } from 'path';
import { Readable } from 'stream';

config({ path: resolve(process.cwd(), '.env.local') });

import { BoxClient, BoxJwtAuth, JwtConfig } from 'box-typescript-sdk-gen';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, sql } from 'drizzle-orm';
import postgres from 'postgres';
import * as schema from '../lib/db/schema';

// Box setup
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

// Database setup
const queryClient = postgres(process.env.POSTGRES_URL!);
const db = drizzle(queryClient, { schema });

// Sample file contents
const sampleFiles: Record<string, { name: string; content: string }[]> = {
  'EXP-001': [
    {
      name: 'IR_aspirin_product.txt',
      content: `INFRARED SPECTRUM REPORT
========================

Sample: Acetylsalicylic Acid (Aspirin)
Date: ${new Date().toISOString().split('T')[0]}
Instrument: Nicolet iS50 FT-IR

Peak Analysis:
--------------
3000 cm⁻¹ - C-H stretches (aromatic and aliphatic)
1750 cm⁻¹ - C=O stretch (ester carbonyl) - STRONG
1680 cm⁻¹ - C=O stretch (carboxylic acid) - MEDIUM
1580 cm⁻¹ - Aromatic C=C stretch
1220 cm⁻¹ - C-O stretch (ester)
760 cm⁻¹ - Aromatic C-H bend (ortho-substituted)

Interpretation:
--------------
The spectrum is consistent with acetylsalicylic acid.
The presence of two carbonyl peaks confirms both ester and carboxylic acid groups.

Purity Assessment: >95%
`,
    },
    {
      name: '1H_NMR_aspirin.txt',
      content: `¹H NMR SPECTRUM REPORT
======================

Sample: Acetylsalicylic Acid (Aspirin)
Solvent: CDCl₃
Frequency: 400 MHz

Peak Assignments:
-----------------
δ 2.36 ppm - Singlet, 3H, Acetyl CH₃
δ 7.12 ppm - Doublet, 1H, J = 8.1 Hz, H-3
δ 7.32 ppm - Triplet, 1H, J = 7.6 Hz, H-5
δ 7.58 ppm - Triplet, 1H, J = 7.8 Hz, H-4
δ 8.12 ppm - Doublet, 1H, J = 7.9 Hz, H-6
δ 11.0 ppm - Broad singlet, 1H, COOH

Integration: 3:1:1:1:1:1 (matches expected structure)
`,
    },
    {
      name: 'melting_point_data.txt',
      content: `MELTING POINT DETERMINATION
===========================

Sample: Aspirin Product
Date: ${new Date().toISOString().split('T')[0]}

Trial 1: 134-136°C
Trial 2: 135-137°C
Trial 3: 134-136°C

Average: 135°C (range: 134-137°C)
Literature value: 135-136°C

Conclusion: Melting point consistent with pure aspirin.
`,
    },
  ],
  'EXP-002': [
    {
      name: 'reaction_monitoring.txt',
      content: `GRIGNARD REACTION MONITORING
============================

Reaction: Phenylmagnesium bromide + Benzophenone → Triphenylmethanol

Time points:
0 min - Added PhMgBr to benzophenone solution
15 min - Color changed from clear to yellow
30 min - Reaction mixture became thick
60 min - Quenched with saturated NH₄Cl

TLC Analysis (Hexanes:EtOAc 4:1):
Starting material Rf: 0.65
Product Rf: 0.35
No starting material visible after workup
`,
    },
  ],
  'EXP-003': [
    {
      name: 'fischer_esterification.txt',
      content: `FISCHER ESTERIFICATION LOG
==========================

Reaction: Benzoic Acid + Methanol → Methyl Benzoate

Conditions:
- Temperature: Reflux (~65°C)
- Time: 2 hours
- Catalyst: Conc. H₂SO₄ (5 drops)

Observations:
- Vigorous reflux maintained throughout
- Extraction with NaHCO₃ removed excess acid
- Product dried over MgSO₄

Yield: 86% (colorless liquid)
`,
    },
  ],
  'EXP-004': [
    {
      name: 'aldol_product_analysis.txt',
      content: `ALDOL CONDENSATION PRODUCT
==========================

Product: Dibenzalacetone (trans,trans-1,5-diphenyl-1,4-pentadien-3-one)

Physical Properties:
- Appearance: Bright yellow crystals
- Melting Point: 110-112°C (lit. 110-111°C)
- Yield: 84%

IR confirms α,β-unsaturated ketone (1660 cm⁻¹)
`,
    },
  ],
  'EXP-005': [
    {
      name: 'diels_alder_notes.txt',
      content: `DIELS-ALDER REACTION NOTES
==========================

Diene: Anthracene
Dienophile: Maleic Anhydride

Reaction Conditions:
- Solvent: Xylene
- Temperature: Reflux (~140°C)
- Time: 30 minutes

Product: 9,10-dihydroanthracene-9,10-endo-α,β-succinic anhydride
Expected MP: 261-263°C (with decomposition)

Status: Draft - awaiting characterization
`,
    },
  ],
};

async function main() {
  console.log('Setting up Box folder structure and updating database...\n');

  // 1. Get the Experiments folder ID (under the project)
  const projectFolderId = '354210879809'; // PROJ-001-Test-Project
  const experimentsFolderId = '354210193655'; // Experiments subfolder

  console.log('Using Experiments folder:', experimentsFolderId);

  // 2. Get experiments from database
  const dbExperiments = await db.select().from(schema.experiments);
  console.log(`\nFound ${dbExperiments.length} experiments in database`);

  // 3. Create Box folders for each experiment and update database
  for (const exp of dbExperiments) {
    console.log(`\nProcessing: ${exp.experimentId} - ${exp.title}`);

    // Create folder in Box
    const folderName = `${exp.experimentId}-${exp.title.replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 30)}`;

    try {
      // Check if folder already exists
      const existingItems = await boxClient.folders.getFolderItems(experimentsFolderId, {
        fields: ['id', 'name']
      });

      let boxFolderId: string;
      const existingFolder = existingItems.entries?.find((e: any) =>
        e.name.startsWith(exp.experimentId)
      );

      if (existingFolder) {
        boxFolderId = existingFolder.id;
        console.log(`  ✓ Using existing folder: ${existingFolder.name} (${boxFolderId})`);
      } else {
        // Create new folder
        const newFolder = await boxClient.folders.createFolder({
          parent: { id: experimentsFolderId },
          name: folderName
        });
        boxFolderId = newFolder.id;
        console.log(`  ✓ Created folder: ${folderName} (${boxFolderId})`);
      }

      // Update database with real folder ID
      await db
        .update(schema.experiments)
        .set({ boxFolderId })
        .where(eq(schema.experiments.id, exp.id));

      console.log(`  ✓ Updated database with folder ID: ${boxFolderId}`);

      // Upload sample files if we have any for this experiment
      const files = sampleFiles[exp.experimentId];
      if (files) {
        for (const file of files) {
          try {
            // Check if file already exists
            const folderContents = await boxClient.folders.getFolderItems(boxFolderId, {
              fields: ['id', 'name']
            });

            const existingFile = folderContents.entries?.find((e: any) => e.name === file.name);

            if (existingFile) {
              console.log(`  ✓ File already exists: ${file.name}`);
            } else {
              // Upload file
              const buffer = Buffer.from(file.content);
              const stream = Readable.from(buffer);
              
              const uploadedFile = await boxClient.uploads.uploadFile({
                attributes: {
                  name: file.name,
                  parent: { id: boxFolderId }
                },
                file: stream
              });
              console.log(`  ✓ Uploaded: ${file.name} (${uploadedFile.entries![0].id})`);
            }
          } catch (uploadErr: any) {
            console.log(`  ⚠ Could not upload ${file.name}: ${uploadErr.message}`);
          }
        }
      }
    } catch (err: any) {
      console.error(`  ✗ Error: ${err.message}`);
    }
  }

  // 4. Clean up old files from project folder (optional - leave them for now)
  console.log('\n✓ Setup complete!');
  console.log('\nNew folder structure:');

  // List the new structure
  const items = await boxClient.folders.getFolderItems(experimentsFolderId, {
    fields: ['id', 'name', 'type']
  });

  for (const item of items.entries || []) {
    console.log(`  📁 ${item.name} (${item.id})`);
    if (item.type === 'folder') {
      const subItems = await boxClient.folders.getFolderItems(item.id, { fields: ['id', 'name', 'type'] });
      for (const sub of subItems.entries || []) {
        console.log(`    📄 ${sub.name}`);
      }
    }
  }

  await queryClient.end();
}

main().catch(console.error);
