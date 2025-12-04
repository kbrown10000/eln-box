/**
 * Fix EXP-001 - Create folder and upload files
 */
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import BoxSDK from 'box-node-sdk';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import * as schema from '../lib/db/schema';

const boxConfig = {
  boxAppSettings: {
    clientID: process.env.BOX_CLIENT_ID!,
    clientSecret: process.env.BOX_CLIENT_SECRET!,
    appAuth: {
      publicKeyID: process.env.BOX_PUBLIC_KEY_ID!,
      privateKey: process.env.BOX_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      passphrase: process.env.BOX_PASSPHRASE!,
    },
  },
  enterpriseID: process.env.BOX_ENTERPRISE_ID!,
};

const sdk = BoxSDK.getPreconfiguredInstance(boxConfig);
const boxClient = sdk.getAppAuthClient('enterprise', boxConfig.enterpriseID);

const queryClient = postgres(process.env.POSTGRES_URL!);
const db = drizzle(queryClient, { schema });

const experimentsFolderId = '354210193655';

const files = [
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
];

async function main() {
  console.log('Fixing EXP-001...\n');

  // 1. Create the folder
  const folderName = 'EXP-001-Synthesis of Aspirin';

  try {
    // Check if it already exists
    const existingItems = await boxClient.folders.getItems(experimentsFolderId, {
      fields: 'id,name'
    });

    let boxFolderId: string;
    const existingFolder = existingItems.entries?.find((e: any) =>
      e.name.startsWith('EXP-001')
    );

    if (existingFolder) {
      boxFolderId = existingFolder.id;
      console.log(`✓ Using existing folder: ${existingFolder.name} (${boxFolderId})`);
    } else {
      const newFolder = await boxClient.folders.create(experimentsFolderId, folderName);
      boxFolderId = newFolder.id;
      console.log(`✓ Created folder: ${folderName} (${boxFolderId})`);
    }

    // 2. Update database
    await db
      .update(schema.experiments)
      .set({ boxFolderId })
      .where(eq(schema.experiments.experimentId, 'EXP-001'));

    console.log(`✓ Updated database with folder ID: ${boxFolderId}`);

    // 3. Upload files
    for (const file of files) {
      try {
        const folderContents = await boxClient.folders.getItems(boxFolderId, {
          fields: 'id,name'
        });

        const existingFile = folderContents.entries?.find((e: any) => e.name === file.name);

        if (existingFile) {
          console.log(`✓ File already exists: ${file.name}`);
        } else {
          const buffer = Buffer.from(file.content);
          const uploadedFile = await boxClient.files.uploadFile(boxFolderId, file.name, buffer);
          console.log(`✓ Uploaded: ${file.name} (${uploadedFile.entries[0].id})`);
        }
      } catch (uploadErr: any) {
        console.log(`⚠ Could not upload ${file.name}: ${uploadErr.message}`);
      }
    }

    console.log('\n✓ EXP-001 fixed!');
  } catch (err: any) {
    console.error('Error:', err.message);
    console.error(err);
  }

  await queryClient.end();
}

main();
