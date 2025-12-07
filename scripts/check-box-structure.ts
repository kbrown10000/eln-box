/**
 * Check complete Box folder structure
 */
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { getBoxClient, BoxClient } from '../lib/box/client';

async function listFolderRecursive(client: BoxClient, folderId: string, depth = 0) {
  const indent = '  '.repeat(depth);

  try {
    const folder = await client.folders.getFolderById(folderId);
    console.log(`${indent}📁 ${folder.name} (id: ${folderId})`);

    const items = await client.folders.getFolderItems(folderId, {
      // fields: ['id', 'name', 'type', 'size']
    });

    for (const item of items.entries || []) {
      if (item.type === 'folder') {
        await listFolderRecursive(client, item.id, depth + 1);
      } else {
        console.log(`${indent}  📄 ${item.name} (id: ${item.id})`);
      }
    }
  } catch (err: any) {
    console.log(`${indent}❌ Error accessing folder ${folderId}: ${err}`);
  }
}

async function main() {
  const client = getBoxClient();

  if (!client) {
      throw new Error("Failed to initialize Box Client");
  }

  console.log('Box Folder Structure:\n');

  // Start from root folder
  const rootFolderId = process.env.BOX_ROOT_FOLDER_ID!;
  await listFolderRecursive(client, rootFolderId);
}

main();
