/**
 * Check Box files in experiment folders
 */
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { getBoxClient } from '../lib/box/client';

async function main() {
  const client = getBoxClient();

  if (!client) {
      throw new Error("Failed to initialize Box Client");
  }

  // Check folder 354210879809 (Aspirin experiment)
  const experimentFolderId = '354210879809';
  console.log('Checking experiment folder:', experimentFolderId);

  try {
    const items = await client.folders.getFolderItems(experimentFolderId, {
      // fields: ['id', 'name', 'type', 'size']
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

    const projects = await client.folders.getFolderItems(projectsFolderId!, {
      // fields: ['id', 'name', 'type']
    });

    console.log('Projects found:', projects.entries?.length || 0);

    for (const project of projects.entries || []) {
      console.log(`\n  Project: ${project.name} (id: ${project.id})`);

      if (project.type === 'folder') {
        // Check experiments inside each project
        const experiments = await client.folders.getFolderItems(project.id, {
          // fields: ['id', 'name', 'type']
        });

        for (const exp of experiments.entries || []) {
          console.log(`    - ${exp.type}: ${exp.name} (id: ${exp.id})`);

          if (exp.type === 'folder') {
            // Check files inside experiment
            const expFiles = await client.folders.getFolderItems(exp.id, {
              // fields: ['id', 'name', 'type', 'size']
            });

            for (const file of expFiles.entries || []) {
              console.log(`      * ${file.type}: ${file.name}`);
            }
          }
        }
      }
    }

  } catch (err: any) {
    console.error('Error:', err);
  }
}

main();
