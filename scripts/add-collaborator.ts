/**
 * Script to add a Box user as a collaborator to the ELN folders
 *
 * This is needed because folders created by the JWT service account
 * are not accessible to users who log in via OAuth.
 *
 * Usage: POSTGRES_URL="..." BOX_USER_EMAIL="user@example.com" npx tsx scripts/add-collaborator.ts
 */

import { getBoxClient } from '../lib/box/client';
import { db } from '../lib/db';
import { projects, experiments } from '../lib/db/schema';

const BOX_USER_EMAIL = process.env.BOX_USER_EMAIL;
const BOX_PROJECTS_FOLDER_ID = process.env.BOX_PROJECTS_FOLDER_ID;

async function addCollaborator() {
  if (!BOX_USER_EMAIL) {
    console.error('ERROR: BOX_USER_EMAIL environment variable is required');
    console.log('Usage: BOX_USER_EMAIL="your@email.com" npx tsx scripts/add-collaborator.ts');
    process.exit(1);
  }

  console.log(`\n📧 Adding ${BOX_USER_EMAIL} as collaborator to all ELN folders...\n`);

  const boxClient = getBoxClient();

  if (!boxClient) {
      throw new Error("Failed to initialize Box Client");
  }

  // Helper to add collaboration
  async function addCollab(folderId: string, folderName: string) {
    try {
      await boxClient!.userCollaborations.createCollaboration({
        item: { id: folderId, type: 'folder' },
        accessibleBy: { type: 'user', login: BOX_USER_EMAIL! },
        role: 'editor'
      });
      console.log(`  ✓ Added to: ${folderName} (${folderId})`);
      return true;
    } catch (err: any) {
      if (err.code === 'user_already_collaborator' || err.message?.includes('user_already_collaborator') || (err.response?.body?.code === 'user_already_collaborator')) {
        console.log(`  ⚠ Already collaborator: ${folderName} (${folderId})`);
        return true;
      }
      console.error(`  ✗ Failed: ${folderName} (${folderId}) - ${err}`);
      return false;
    }
  }

  // 1. Add to root Projects folder
  if (BOX_PROJECTS_FOLDER_ID) {
    console.log('1. Root Projects Folder:');
    await addCollab(BOX_PROJECTS_FOLDER_ID, 'ELN Projects Root');
  }

  // 2. Add to all project folders from database
  console.log('\n2. Project Folders:');
  const allProjects = await db.select().from(projects);
  for (const project of allProjects) {
    if (project.boxFolderId) {
      await addCollab(project.boxFolderId, `Project: ${project.projectName}`);
    }
  }

  // 3. Add to all experiment folders from database
  console.log('\n3. Experiment Folders:');
  const allExperiments = await db.select().from(experiments);
  for (const experiment of allExperiments) {
    if (experiment.boxFolderId) {
      await addCollab(experiment.boxFolderId, `Experiment: ${experiment.title}`);
    }
  }

  console.log('\n✅ Done! The user should now have access to all ELN folders.\n');
}

addCollaborator()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Script failed:', err);
    process.exit(1);
  });
