/**
 * Check complete Box folder structure
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

async function listFolderRecursive(folderId: string, depth = 0) {
  const indent = '  '.repeat(depth);

  try {
    const folder = await client.folders.get(folderId, { fields: 'id,name' });
    console.log(`${indent}📁 ${folder.name} (id: ${folderId})`);

    const items = await client.folders.getItems(folderId, {
      fields: 'id,name,type,size'
    });

    for (const item of items.entries || []) {
      if (item.type === 'folder') {
        await listFolderRecursive(item.id, depth + 1);
      } else {
        console.log(`${indent}  📄 ${item.name} (id: ${item.id})`);
      }
    }
  } catch (err: any) {
    console.log(`${indent}❌ Error accessing folder ${folderId}: ${err.message}`);
  }
}

async function main() {
  console.log('Box Folder Structure:\n');

  // Start from root folder
  const rootFolderId = process.env.BOX_ROOT_FOLDER_ID!;
  await listFolderRecursive(rootFolderId);
}

main();
