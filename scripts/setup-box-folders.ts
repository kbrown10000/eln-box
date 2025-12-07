/**
 * Box Folder Structure Setup Script (GxP Edition)
 *
 * This script creates the complete folder structure for the USDM ELN system:
 * /USDM_ELN
 *   /00_Governance
 *   /01_Projects
 *   /02_Sample_Registry
 *   /03_Instruments_Data
 *   /04_Reference_Data
 *   /05_QA_QC
 *   /06_Final_Records
 *
 * Usage:
 *   npx tsx scripts/setup-box-folders.ts
 */

import { BoxClient, BoxJwtAuth, JwtConfig } from 'box-typescript-sdk-gen';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function createFolderIfNotExists(client: BoxClient, parentId: string, name: string): Promise<string> {
  try {
    const folder = await client.folders.createFolder({
      parent: { id: parentId },
      name: name
    });
    console.log(`✅ Created /${name} (ID: ${folder.id})`);
    return folder.id;
  } catch (error: any) {
    if (error.code === 'item_name_in_use' || error.message?.includes('item_name_in_use') || (error.response?.body?.code === 'item_name_in_use')) {
       // Find the existing folder
       const items = await client.folders.getFolderItems(parentId);
       const existing = items.entries?.find((e: any) => e.name === name);
       if (existing) {
         console.log(`ℹ️  Folder /${name} already exists (ID: ${existing.id})`);
         return existing.id;
       }
    }
    throw error;
  }
}

async function setupBoxFolders() {
  console.log('🚀 Starting Box folder structure setup (GxP Edition)...\n');

  // Initialize Box SDK
  const jwtConfig = new JwtConfig({
    clientId: process.env.BOX_CLIENT_ID!,
    clientSecret: process.env.BOX_CLIENT_SECRET!,
    jwtKeyId: process.env.BOX_PUBLIC_KEY_ID!,
    privateKey: process.env.BOX_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    privateKeyPassphrase: process.env.BOX_PASSPHRASE!,
    enterpriseId: process.env.BOX_ENTERPRISE_ID!,
  });

  const auth = new BoxJwtAuth({ config: jwtConfig });
  const client = new BoxClient({ auth });

  try {
    // 1. Create Root: /USDM_ELN
    const rootId = await createFolderIfNotExists(client, '0', 'USDM_ELN');

    // 2. Create Top-Level Folders
    await createFolderIfNotExists(client, rootId, '00_Governance');
    
    // This is the critical one for our App
    const projectsId = await createFolderIfNotExists(client, rootId, '01_Projects');
    
    const samplesId = await createFolderIfNotExists(client, rootId, '02_Sample_Registry');
    await createFolderIfNotExists(client, rootId, '03_Instruments_Data');
    await createFolderIfNotExists(client, rootId, '04_Reference_Data');
    await createFolderIfNotExists(client, rootId, '05_QA_QC');
    const recordsId = await createFolderIfNotExists(client, rootId, '06_Final_Records');

    // 3. Create Sub-folders for Registry
    await createFolderIfNotExists(client, samplesId, 'Active');
    await createFolderIfNotExists(client, samplesId, 'Aliquots');
    await createFolderIfNotExists(client, samplesId, 'Disposed');
    await createFolderIfNotExists(client, samplesId, 'Chain_of_Custody_Logs');

    // 4. Create Sub-folders for Final Records
    await createFolderIfNotExists(client, recordsId, 'Signed_Experiments');
    await createFolderIfNotExists(client, recordsId, 'Archived_Projects');
    await createFolderIfNotExists(client, recordsId, 'Regulatory_Submissions');

    // 5. Update .env.local
    console.log('\n📝 Updating .env.local with folder IDs...');
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = fs.readFileSync(envPath, 'utf-8');

    // Regex to replace existing or append if not found
    // Note: We are replacing BOX_ROOT_FOLDER_ID with the new USDM_ELN root
    // And BOX_PROJECTS_FOLDER_ID with the new 01_Projects
    
    const updateEnvVar = (key: string, val: string) => {
        const regex = new RegExp(`${key}=.*`);
        if (regex.test(envContent)) {
            envContent = envContent.replace(regex, `${key}=${val}`);
        } else {
            envContent += `\n${key}=${val}`;
        }
    };

    updateEnvVar('BOX_ROOT_FOLDER_ID', rootId);
    updateEnvVar('BOX_PROJECTS_FOLDER_ID', projectsId);

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Updated .env.local\n');

    console.log('✨ Enterprise Folder Structure Setup Complete!\n');
    console.log(`   Root: /USDM_ELN (${rootId})`);
    console.log(`   Projects: /01_Projects (${projectsId})`);

  } catch (error: any) {
    console.error('\n❌ Error creating folders:', error);
    process.exit(1);
  }
}

setupBoxFolders().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
