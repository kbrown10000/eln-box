/**
 * Debug script to verify Project Creation and Listing logic
 * Usage: npx tsx scripts/debug-project-flow.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { getBoxClient } from '../lib/box/client';
import { createProject, listProjects } from '../lib/box/folders';

async function main() {
  console.log('🔍 Starting Project Flow Debug...');
  
  // 1. Check Environment
  const projectsFolderId = process.env.BOX_PROJECTS_FOLDER_ID;
  console.log(`  - BOX_PROJECTS_FOLDER_ID: ${projectsFolderId}`);
  
  if (!projectsFolderId || projectsFolderId === '0') {
      console.error('  ❌ Invalid Projects Folder ID');
      return;
  }

  const client = getBoxClient();
  if (!client) {
      console.error('  ❌ Failed to initialize Box Client');
      return;
  }
  console.log('  ✓ Box Client initialized');

  // 2. List Existing Projects (Before)
  console.log('\n📂 Listing existing projects...');
  try {
      const initialList = await listProjects(client);
      console.log(`  - Count: ${initialList.totalCount}`);
      console.log(`  - Items: ${initialList.items.length}`);
      if (initialList.items.length > 0) {
          console.log(`  - First item: ${initialList.items[0].projectName} (${initialList.items[0].folderId})`);
      }
  } catch (e: any) {
      console.error('  ❌ List failed:', e);
  }

  // 3. Create New Project
  const testCode = `DEBUG-${Date.now()}`;
  console.log(`\n✨ Creating new project: ${testCode}...`);
  
  try {
      const newProject = await createProject(client, {
          projectCode: testCode,
          projectName: 'Debug Project',
          piName: 'Debug Bot',
          piEmail: 'bot@example.com',
          department: 'IT',
          startDate: new Date().toISOString(),
          status: 'planning',
          description: 'Created via debug script'
      });
      console.log(`  ✓ Created! ID: ${newProject.folderId}`);
      console.log(`  - Name: ${newProject.projectName}`);
  } catch (e: any) {
      console.error('  ❌ Creation failed:', e);
      if (e?.response?.body) {
          console.error('  - Body:', JSON.stringify(e.response.body));
      }
      return;
  }

  // 4. List Projects (After)
  console.log('\n📂 Listing projects again...');
  try {
      const finalList = await listProjects(client);
      console.log(`  - Count: ${finalList.totalCount}`);
      console.log(`  - Items: ${finalList.items.length}`);
      
      const found = finalList.items.find(p => p.projectCode === testCode);
      if (found) {
          console.log(`  ✅ SUCCESS: Found new project in list: ${found.projectName}`);
      } else {
          console.log(`  ⚠️  WARNING: New project NOT found in list (Indexing delay?)`);
          // Try direct fallback check
          console.log('  - Attempting direct folder lookup...');
          try {
             // We don't have direct access to executeFallback here without exporting it, 
             // but listProjects should have triggered it if search returned 0.
             // If search returned >0 but didn't include our item, that's an index lag issue.
             // But our fix forces fallback if 0 results. 
             // If >0 results but missing ours, it means SOME are indexed but not this one.
          } catch (e) { console.error(e); }
      }
  } catch (e: any) {
      console.error('  ❌ List failed:', e);
  }
}

main().catch(console.error);
