import { BoxClient, BoxJwtAuth, JwtConfig } from 'box-typescript-sdk-gen';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function fixProjectMetadata() {
  console.log('🚀 Starting Project Metadata Backfill...\n');

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

  const projectsFolderId = process.env.BOX_PROJECTS_FOLDER_ID;
  if (!projectsFolderId) {
      throw new Error("BOX_PROJECTS_FOLDER_ID is missing from .env.local");
  }

  console.log(`📂 Scanning Projects Folder: ${projectsFolderId}`);

  const items = await client.folders.getFolderItems(projectsFolderId);
  const folders = items.entries?.filter((i: any) => i.type === 'folder') || [];

  console.log(`Found ${folders.length} project folders.\n`);

  for (const folder of folders) {
      console.log(`Processing: ${folder.name} (${folder.id})...`);

      try {
          // Check if metadata already exists
          let existingMetadata: any = null;
          try {
              existingMetadata = await client.folderMetadata.getFolderMetadataById(folder.id, 'enterprise', 'projectMetadata');
          } catch (e: any) {
              const isNotFound = 
                  e.statusCode === 404 || 
                  e.response?.statusCode === 404 || 
                  (e.message && e.message.includes('not found'));
                  
              if (!isNotFound) {
                  throw e; // Rethrow if it's a real error (e.g. 500, 403)
              }
              console.log(`  ⚠️  Metadata missing. Applying default template...`);
          }

          // Parse Folder Name for defaults
          let projectCode = 'UNKNOWN';
          let projectName = folder.name!;
          
          const parts = folder.name!.split('-');
          if (parts.length > 1) {
              if (parts[0].match(/^[A-Z0-9]+$/)) {
                  projectCode = parts[0];
                  if (parts.length > 2 && parts[1].match(/^[A-Z0-9]+$/)) {
                       projectCode = `${parts[0]}-${parts[1]}`;
                       projectName = parts.slice(2).join(' ');
                  } else if (parts.length > 2 && parts[1].match(/^\d+$/)) {
                      if (parts.length > 3 && parts[2].match(/^\d+$/)) {
                          projectCode = `${parts[0]}-${parts[1]}-${parts[2]}`;
                          projectName = parts.slice(3).join(' ');
                      } else {
                           projectCode = `${parts[0]}-${parts[1]}`;
                           projectName = parts.slice(2).join(' ');
                      }
                  } else {
                      projectName = parts.slice(1).join(' ');
                  }
              }
          }

          const defaultMetadata = {
            projectCode: projectCode,
            projectName: projectName || folder.name!,
            piName: 'Dr. Sarah Chen', // Demo PI
            piEmail: 'schen@usdm.com',
            department: 'R&D',
            startDate: new Date().toISOString(),
            status: 'planning',
            description: `Project for ${projectName || folder.name}`,
          };

          if (!existingMetadata) {
              // Create new metadata
              console.log(`  📝 Creating metadata: ${JSON.stringify(defaultMetadata)}`);
              await client.folderMetadata.createFolderMetadataById(
                  folder.id, 
                  'enterprise', 
                  'projectMetadata', 
                  defaultMetadata
              );
              console.log(`  ✨ Created!`);
          } else {
              // Update existing metadata if fields are missing/empty
              const updates: any[] = [];
              const md = existingMetadata; // shortcut

              if (!md.piName || md.piName === 'Not assigned' || md.piName === 'Not Assigned') {
                  updates.push({ op: 'replace', path: '/piName', value: defaultMetadata.piName });
              }
              if (!md.piEmail) {
                  updates.push({ op: 'replace', path: '/piEmail', value: defaultMetadata.piEmail });
              }
              if (!md.department || md.department === 'Not specified') {
                  updates.push({ op: 'replace', path: '/department', value: defaultMetadata.department });
              }
              if (!md.projectCode || md.projectCode === 'UNKNOWN') {
                  updates.push({ op: 'replace', path: '/projectCode', value: defaultMetadata.projectCode });
              }
               // Fix the "description" if it is missing
               if (!md.description) {
                   updates.push({ op: 'replace', path: '/description', value: defaultMetadata.description });
               }

              if (updates.length > 0) {
                  console.log(`  🔄 Updating ${updates.length} fields...`);
                  await client.folderMetadata.updateFolderMetadataById(
                      folder.id,
                      'enterprise',
                      'projectMetadata',
                      updates
                  );
                  console.log(`  ✨ Updated!`);
              } else {
                  console.log(`  ✅ Metadata exists and looks complete. Skipping.`);
              }
          }

      } catch (error: any) {
          console.error(`  ❌ Failed to process folder ${folder.id}:`, error.message);
      }
  }

  console.log('\n✅ Metadata backfill complete.');
}

fixProjectMetadata().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
