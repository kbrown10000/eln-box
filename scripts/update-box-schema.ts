import { BoxClient, BoxJwtAuth, JwtConfig } from 'box-typescript-sdk-gen';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function updateBoxSchema() {
  console.log('🚀 Updating Box metadata schema for Box-First Architecture...\n');

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

  // 1. Update experimentMetadata with Yields and Reagents
  console.log('🧪 Updating experimentMetadata template...');
  try {
    await client.metadataTemplates.updateMetadataTemplate('enterprise', 'experimentMetadata', [
        { op: 'addField', fieldKey: 'yieldPercentage', data: { type: 'float', displayName: 'Yield (%)' } },
        { op: 'addField', fieldKey: 'theoreticalYield', data: { type: 'float', displayName: 'Theoretical Yield' } },
        { op: 'addField', fieldKey: 'actualYield', data: { type: 'float', displayName: 'Actual Yield' } },
        { op: 'addField', fieldKey: 'productName', data: { type: 'string', displayName: 'Product Name' } },
        { op: 'addField', fieldKey: 'keyReagents', data: { type: 'string', displayName: 'Key Reagents (Index)' } }, // Simplest for search
    ]);
    console.log('✅ experimentMetadata updated successfully\n');
  } catch (error: any) {
    console.warn('⚠️  Update failed (likely already exists):', error.message || error, '\n');
  }

  // 2. Create spectrumMetadata
  console.log('📈 Creating spectrumMetadata template...');
  try {
    await client.metadataTemplates.createMetadataTemplate({
      scope: 'enterprise',
      templateKey: 'spectrumMetadata',
      displayName: 'Spectrum Metadata',
      hidden: false,
      fields: [
        {
          type: 'enum',
          key: 'technique',
          displayName: 'Technique',
          options: [
              { key: 'IR' }, { key: 'NMR' }, { key: 'MS' }, { key: 'UV-Vis' }, { key: 'Other' }
          ]
        },
        {
          type: 'string',
          key: 'instrument',
          displayName: 'Instrument',
        },
        {
          type: 'string',
          key: 'sampleId',
          displayName: 'Sample ID',
        },
        {
          type: 'string',
          key: 'peakSummary',
          displayName: 'Peak Summary',
          description: 'Key peaks for search indexing'
        }
      ]
    });
    console.log('✅ spectrumMetadata template created successfully\n');
  } catch (error: any) {
    if (error.code === 'conflict' || error.message?.includes('template_key_already_exists')) {
        console.log('⚠️  spectrumMetadata template already exists\n');
    } else {
        console.error('❌ Failed to create spectrumMetadata template:', error, '\n');
    }
  }

  console.log('✨ Schema update complete!');
}

updateBoxSchema().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
