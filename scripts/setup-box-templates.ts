/**
 * Box Metadata Template Setup Script
 *
 * This script creates the necessary Box metadata templates for the ELN system.
 * Run this once after setting up your Box Custom App.
 *
 * Usage:
 *   npx tsx scripts/setup-box-templates.ts
 */

import { BoxClient, BoxJwtAuth, JwtConfig } from 'box-typescript-sdk-gen';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function createMetadataTemplates() {
  console.log('🚀 Starting Box metadata template creation...\n');

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

  // Template 1: Project Metadata
  console.log('📁 Creating projectMetadata template...');
  try {
    await client.metadataTemplates.createMetadataTemplate('enterprise', 'projectMetadata', {
      displayName: 'Project Metadata',
      hidden: false,
      fields: [
        {
          type: 'string',
          key: 'projectCode',
          displayName: 'Project Code',
          description: 'Unique project identifier (e.g., PROJ-001)',
        },
        {
          type: 'string',
          key: 'projectName',
          displayName: 'Project Name',
        },
        {
          type: 'string',
          key: 'piName',
          displayName: 'Principal Investigator',
        },
        {
          type: 'string',
          key: 'piEmail',
          displayName: 'PI Email',
        },
        {
          type: 'string',
          key: 'department',
          displayName: 'Department',
        },
        {
          type: 'date',
          key: 'startDate',
          displayName: 'Start Date',
        },
        {
          type: 'enum',
          key: 'status',
          displayName: 'Status',
          options: [
            { key: 'planning' },
            { key: 'active' },
            { key: 'on-hold' },
            { key: 'completed' },
            { key: 'archived' },
          ],
        },
        {
          type: 'string',
          key: 'description',
          displayName: 'Description',
        },
      ]
    });
    console.log('✅ projectMetadata template created successfully\n');
  } catch (error: any) {
    if (error.code === 'conflict' || error.message?.includes('template_key_already_exists') || error.response?.body?.code === 'conflict') {
      console.log('⚠️  projectMetadata template already exists\n');
    } else {
      console.error('❌ Failed to create projectMetadata template:', error, '\n');
    }
  }

  // Template 2: Experiment Metadata
  console.log('🧪 Creating experimentMetadata template...');
  try {
    await client.metadataTemplates.createMetadataTemplate('enterprise', 'experimentMetadata', {
      displayName: 'Experiment Metadata',
      hidden: false,
      fields: [
        {
          type: 'string',
          key: 'experimentId',
          displayName: 'Experiment ID',
          description: 'Unique experiment identifier (e.g., EXP-2024-001)',
        },
        {
          type: 'string',
          key: 'experimentTitle',
          displayName: 'Title',
        },
        {
          type: 'string',
          key: 'objective',
          displayName: 'Objective',
        },
        {
          type: 'string',
          key: 'hypothesis',
          displayName: 'Hypothesis',
        },
        {
          type: 'string',
          key: 'ownerName',
          displayName: 'Owner Name',
        },
        {
          type: 'string',
          key: 'ownerEmail',
          displayName: 'Owner Email',
        },
        {
          type: 'date',
          key: 'startedAt',
          displayName: 'Started Date',
        },
        {
          type: 'date',
          key: 'completedAt',
          displayName: 'Completed Date',
        },
        {
          type: 'enum',
          key: 'status',
          displayName: 'Status',
          options: [
            { key: 'draft' },
            { key: 'in-progress' },
            { key: 'completed' },
            { key: 'locked' },
          ],
        },
        {
          type: 'multiSelect',
          key: 'tags',
          displayName: 'Tags',
          options: [
            { key: 'synthesis' },
            { key: 'analysis' },
            { key: 'characterization' },
            { key: 'purification' },
            { key: 'validation' },
          ],
        },
      ]
    });
    console.log('✅ experimentMetadata template created successfully\n');
  } catch (error: any) {
    if (error.code === 'conflict' || error.message?.includes('template_key_already_exists') || error.response?.body?.code === 'conflict') {
      console.log('⚠️  experimentMetadata template already exists\n');
    } else {
      console.error('❌ Failed to create experimentMetadata template:', error, '\n');
    }
  }

  // Template 3: Entry Metadata
  console.log('📝 Creating entryMetadata template...');
  try {
    await client.metadataTemplates.createMetadataTemplate('enterprise', 'entryMetadata', {
      displayName: 'Entry Metadata',
      hidden: false,
      fields: [
        {
          type: 'string',
          key: 'entryId',
          displayName: 'Entry ID',
        },
        {
          type: 'date',
          key: 'entryDate',
          displayName: 'Entry Date',
        },
        {
          type: 'string',
          key: 'authorName',
          displayName: 'Author Name',
        },
        {
          type: 'string',
          key: 'authorEmail',
          displayName: 'Author Email',
        },
        {
          type: 'string',
          key: 'title',
          displayName: 'Title',
        },
        {
          type: 'enum',
          key: 'entryType',
          displayName: 'Entry Type',
          options: [
            { key: 'protocol' },
            { key: 'observation' },
            { key: 'results' },
            { key: 'analysis' },
            { key: 'conclusion' },
          ],
        },
        {
          type: 'enum',
          key: 'status',
          displayName: 'Status',
          options: [
            { key: 'draft' },
            { key: 'submitted' },
            { key: 'reviewed' },
            { key: 'signed' },
            { key: 'locked' },
          ],
        },
        {
          type: 'string',
          key: 'version',
          displayName: 'Version',
        },
        {
          type: 'date',
          key: 'signedAt',
          displayName: 'Signed Date',
        },
        {
          type: 'string',
          key: 'signedBy',
          displayName: 'Signed By',
        },
        {
          type: 'string',
          key: 'signatureHash',
          displayName: 'Signature Hash (SHA-256)',
        },
      ]
    });
    console.log('✅ entryMetadata template created successfully\n');
  } catch (error: any) {
    if (error.code === 'conflict' || error.message?.includes('template_key_already_exists') || error.response?.body?.code === 'conflict') {
      console.log('⚠️  entryMetadata template already exists\n');
    } else {
      console.error('❌ Failed to create entryMetadata template:', error, '\n');
    }
  }

  console.log('✨ Box metadata template setup complete!');
  console.log('\nNext steps:');
  console.log('1. Verify templates in Box Admin Console → Content → Metadata');
  console.log('2. Create your /ELN-Root/Projects folder structure in Box');
  console.log('3. Update BOX_ROOT_FOLDER_ID and BOX_PROJECTS_FOLDER_ID in .env.local');
  console.log('4. Run: npm run dev\n');
}

// Run the setup
createMetadataTemplates().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
