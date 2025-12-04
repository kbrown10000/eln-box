/**
 * Box Folder Structure Setup Script
 *
 * This script creates the complete folder structure for the ELN system:
 * /ELN-Root
 *   /Projects
 *
 * Usage:
 *   npx tsx scripts/setup-box-folders.ts
 */

import BoxSDK from 'box-node-sdk';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function setupBoxFolders() {
  console.log('🚀 Starting Box folder structure setup...\n');

  // Initialize Box SDK
  const sdk = BoxSDK.getPreconfiguredInstance({
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
  });

  const client = sdk.getAppAuthClient('enterprise');

  try {
    // Step 1: Create /ELN-Root folder in the root (0)
    console.log('📁 Creating /ELN-Root folder...');
    const elnRootFolder = await client.folders.create('0', 'ELN-Root');
    console.log(`✅ Created /ELN-Root (ID: ${elnRootFolder.id})\n`);

    // Step 2: Create /Projects subfolder
    console.log('📁 Creating /Projects folder...');
    const projectsFolder = await client.folders.create(elnRootFolder.id, 'Projects');
    console.log(`✅ Created /Projects (ID: ${projectsFolder.id})\n`);

    // Step 3: Update .env.local with folder IDs
    console.log('📝 Updating .env.local with folder IDs...');
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = fs.readFileSync(envPath, 'utf-8');

    // Replace the folder ID placeholders
    envContent = envContent.replace(
      /BOX_ROOT_FOLDER_ID=0/,
      `BOX_ROOT_FOLDER_ID=${elnRootFolder.id}`
    );
    envContent = envContent.replace(
      /BOX_PROJECTS_FOLDER_ID=0/,
      `BOX_PROJECTS_FOLDER_ID=${projectsFolder.id}`
    );

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Updated .env.local with folder IDs\n');

    // Success summary
    console.log('✨ Box folder structure setup complete!\n');
    console.log('📋 Summary:');
    console.log(`   /ELN-Root    → ID: ${elnRootFolder.id}`);
    console.log(`   /Projects    → ID: ${projectsFolder.id}\n`);

    console.log('🔗 View your folders in Box:');
    console.log(`   https://app.box.com/folder/${elnRootFolder.id}\n`);

    console.log('✅ Your .env.local has been updated automatically!\n');

    console.log('Next steps:');
    console.log('1. Run: npm run setup-box-templates');
    console.log('2. Run: npm run dev');
    console.log('3. Open: http://localhost:3000\n');

  } catch (error: any) {
    if (error.response?.body?.code === 'item_name_in_use') {
      console.error('\n❌ Error: Folder already exists');
      console.error('The /ELN-Root folder already exists in your Box account.');
      console.error('\nOptions:');
      console.error('1. Delete or rename the existing /ELN-Root folder in Box');
      console.error('2. Or manually get the folder IDs from Box and update .env.local\n');
    } else {
      console.error('\n❌ Error creating folders:', error.message);
      if (error.response?.body) {
        console.error('Details:', JSON.stringify(error.response.body, null, 2));
      }
    }
    process.exit(1);
  }
}

// Run the setup
setupBoxFolders().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
