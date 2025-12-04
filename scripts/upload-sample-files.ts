/**
 * Upload sample files to Box folders for demo experiments
 *
 * Run with: npx tsx scripts/upload-sample-files.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import BoxSDK from 'box-node-sdk';
import * as fs from 'fs';
import * as path from 'path';

console.log('BOX_CLIENT_ID:', process.env.BOX_CLIENT_ID ? 'SET' : 'NOT SET');

// Box JWT configuration
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

// Initialize Box SDK
const sdk = BoxSDK.getPreconfiguredInstance(boxConfig);
const client = sdk.getAppAuthClient('enterprise', boxConfig.enterpriseID);

// Sample files content (we'll create simple text files that represent scientific documents)
const sampleFiles = [
  {
    folderId: '354210879809', // Aspirin experiment folder
    files: [
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
The presence of two carbonyl peaks (1750 and 1680 cm⁻¹) confirms
both the ester and carboxylic acid functional groups.
No broad O-H stretch at 3300-3500 cm⁻¹ from salicylic acid starting material
confirms complete acetylation.

Purity Assessment: >95% based on spectral analysis
`,
      },
      {
        name: '1H_NMR_aspirin.txt',
        content: `¹H NMR SPECTRUM REPORT
======================

Sample: Acetylsalicylic Acid (Aspirin)
Solvent: CDCl₃
Frequency: 400 MHz
Date: ${new Date().toISOString().split('T')[0]}

Peak Assignments:
-----------------
δ 2.36 ppm - Singlet, 3H, Acetyl CH₃
δ 7.12 ppm - Doublet, 1H, J = 8.1 Hz, H-3
δ 7.32 ppm - Triplet, 1H, J = 7.6 Hz, H-5
δ 7.58 ppm - Triplet, 1H, J = 7.8 Hz, H-4
δ 8.12 ppm - Doublet, 1H, J = 7.9 Hz, H-6
δ 11.0 ppm - Broad singlet, 1H, COOH (exchangeable)

Integration: 3:1:1:1:1:1 (matches expected structure)

Notes:
------
- Clean spectrum with minimal impurities
- All peaks consistent with published aspirin NMR data
- No starting material (salicylic acid) detected
`,
      },
      {
        name: 'melting_point_data.txt',
        content: `MELTING POINT DETERMINATION
===========================

Sample: Synthesized Acetylsalicylic Acid
Date: ${new Date().toISOString().split('T')[0]}
Instrument: Stuart SMP30 Digital Melting Point Apparatus

Results:
--------
Trial 1: 134-136°C
Trial 2: 135-136°C
Trial 3: 135-137°C

Average: 135°C (range: 134-137°C)
Literature Value: 135-136°C

Assessment: PASS
The melting point range is within acceptable limits of the
literature value, indicating high purity of the product.

Notes:
- Capillary tubes packed uniformly
- Heating rate: 1°C/minute near melting point
- No decomposition observed
`,
      },
      {
        name: 'lab_notebook_page.txt',
        content: `LAB NOTEBOOK ENTRY
==================

Experiment: Synthesis of Aspirin
Date: ${new Date().toISOString().split('T')[0]}
Researcher: Dr. Sarah Chen
Notebook: #2024-001, Page 47

OBSERVATIONS:
-------------
10:00 AM - Began setup. Flask and glassware dried in oven overnight.
10:15 AM - Weighed salicylic acid: 2.01 g (target: 2.00 g)
10:20 AM - Added acetic anhydride (5.0 mL). Noted slight warmth.
10:25 AM - Added H₂SO₄ catalyst (5 drops). Mixture became warm.
10:30 AM - Placed on water bath at 85°C
10:45 AM - Observed solution became clear
10:50 AM - Removed from heat, added cold water
10:55 AM - White precipitate formed immediately
11:00 AM - Crystals settled, solution cooled in ice bath
11:15 AM - Vacuum filtration complete
11:30 AM - Recrystallization started with hot ethanol
12:00 PM - Crystals collected after cooling
12:30 PM - Product dried: 2.20 g

CALCULATIONS:
-------------
Theoretical yield: (2.01 g / 138.12 g/mol) × 180.16 g/mol = 2.62 g
Actual yield: 2.20 g
Percent yield: 84.0%

CONCLUSIONS:
------------
Reaction proceeded as expected. Good yield achieved.
Product appears pure based on melting point (135°C).
Will submit for IR and NMR analysis.
`,
      },
    ],
  },
];

async function uploadSampleFiles() {
  console.log('📁 Starting Box file upload...\n');

  try {
    for (const folder of sampleFiles) {
      console.log(`Uploading to folder: ${folder.folderId}`);

      for (const file of folder.files) {
        try {
          // Check if file already exists
          const existingFiles = await client.folders.getItems(folder.folderId, {
            fields: 'id,name',
          });

          const exists = existingFiles.entries?.some(
            (entry: any) => entry.name === file.name
          );

          if (exists) {
            console.log(`  ⏭️  ${file.name} already exists, skipping`);
            continue;
          }

          // Create a temporary file
          const tempPath = path.join(process.cwd(), 'temp_' + file.name);
          fs.writeFileSync(tempPath, file.content);

          // Upload to Box
          const stream = fs.createReadStream(tempPath);
          const uploadedFile = await client.files.uploadFile(folder.folderId, file.name, stream);

          console.log(`  ✓ Uploaded: ${file.name} (ID: ${uploadedFile.entries[0].id})`);

          // Clean up temp file
          fs.unlinkSync(tempPath);
        } catch (err: any) {
          if (err.statusCode === 409) {
            console.log(`  ⏭️  ${file.name} already exists`);
          } else {
            console.error(`  ❌ Failed to upload ${file.name}:`, err.message);
          }
        }
      }
    }

    console.log('\n✅ File upload complete!');
  } catch (error) {
    console.error('❌ Upload failed:', error);
    throw error;
  }
}

uploadSampleFiles();
