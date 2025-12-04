/**
 * Check Box files in experiment folders
 */
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import BoxSDK from 'box-node-sdk';

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
const client = sdk.getAppAuthClient('enterprise', boxConfig.enterpriseID);

async function main() {
  // Check folder 354210879809 (Aspirin experiment)
  const experimentFolderId = '354210879809';
  console.log('Checking experiment folder:', experimentFolderId);

  try {
    const items = await client.folders.getItems(experimentFolderId, {
      fields: 'id,name,type,size'
    });

    console.log('\nFiles found:', items.entries?.length || 0);

    if (items.entries && items.entries.length > 0) {
      items.entries.forEach((e: any) => {
        console.log(`  - ${e.type}: ${e.name} (id: ${e.id})`);
      });
    } else {
      console.log('  (No files in this folder)');
    }

    // Also check Projects folder
    const projectsFolderId = process.env.BOX_PROJECTS_FOLDER_ID;
    console.log('\n\nChecking Projects folder:', projectsFolderId);

    const projects = await client.folders.getItems(projectsFolderId!, {
      fields: 'id,name,type'
    });

    console.log('Projects found:', projects.entries?.length || 0);

    for (const project of projects.entries || []) {
      console.log(`\n  Project: ${project.name} (id: ${project.id})`);

      // Check experiments inside each project
      const experiments = await client.folders.getItems(project.id, {
        fields: 'id,name,type'
      });

      for (const exp of experiments.entries || []) {
        console.log(`    - ${exp.type}: ${exp.name} (id: ${exp.id})`);

        if (exp.type === 'folder') {
          // Check files inside experiment
          const expFiles = await client.folders.getItems(exp.id, {
            fields: 'id,name,type,size'
          });

          for (const file of expFiles.entries || []) {
            console.log(`      * ${file.type}: ${file.name}`);
          }
        }
      }
    }

  } catch (err: any) {
    console.error('Error:', err.message);
    console.error('Details:', err.response?.body || err);
  }
}

main();
