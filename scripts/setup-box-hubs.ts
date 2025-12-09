import { BoxClient, BoxJwtAuth, JwtConfig } from 'box-typescript-sdk-gen';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Readable } from 'stream';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function setupHubs() {
    console.log('🚀 Setting up Box Hubs & Knowledge Base...\n');

    const jwtConfig = new JwtConfig({
        clientId: process.env.BOX_CLIENT_ID!,
        clientSecret: process.env.BOX_CLIENT_SECRET!,
        jwtKeyId: process.env.BOX_PUBLIC_KEY_ID!,
        privateKey: process.env.BOX_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        privateKeyPassphrase: process.env.BOX_PASSPHRASE!,
        enterpriseId: process.env.BOX_ENTERPRISE_ID!,
    });

    const auth = new BoxJwtAuth({ config: jwtConfig });
    const serviceClient = new BoxClient({ auth });

    const hubName = "LabNoteX Knowledge Base";
    const KB_FOLDERS = [
        { name: 'Standard Operating Procedures (SOPs)', desc: 'Official protocols for lab operations.' },
        { name: 'Safety Data Sheets (SDS)', desc: 'Chemical safety information.' },
        { name: 'Equipment Manuals', desc: 'User guides for lab instruments.' }
    ];

    try {
        // 1. Impersonate a Real User (Hubs are user-centric)
        const users = await serviceClient.users.getUsers({ limit: 5 });
        const realUser = users.entries?.find(u => u.login && !u.login.includes('AutomationUser'));
        
        if (!realUser) {
            throw new Error("No valid user found to impersonate for Hub creation");
        }
        
        console.log(`Acting as user: ${realUser.name} (${realUser.id})`);
        const userClient = serviceClient.withAsUserHeader(realUser.id);

        // 2. Create Content Folders (Use Search to find existing)
        console.log('\n📂 Setting up Content Folders...');
        let rootFolderId = '0';
        
        try {
            const root = await userClient.folders.createFolder({
                parent: { id: '0' },
                name: 'LabNoteX KB Content'
            });
            rootFolderId = root.id;
            console.log(`   Created Root Folder: ${root.id}`);
        } catch (e: any) {
            if (e.statusCode === 409) {
                // Extract existing ID from error context info if available
                // e.context_info.conflicts[0].id
                const conflictId = e.context_info?.conflicts?.[0]?.id;
                if (conflictId) {
                    rootFolderId = conflictId;
                    console.log(`   Found Root Folder (via conflict): ${rootFolderId}`);
                } else {
                    // Fallback to search if context info is missing
                    const search = await userClient.search.searchForContent({
                        query: '"LabNoteX KB Content"',
                        ancestorFolderIds: ['0'],
                        type: 'folder'
                    });
                    const existing = search.entries?.find(i => (i as any).name === 'LabNoteX KB Content');
                    if (existing) {
                        rootFolderId = (existing as any).id;
                        console.log(`   Found Root Folder (via search): ${rootFolderId}`);
                    }
                }
            }
        }

        const createdFolders: { id: string, name: string }[] = [];

        if (rootFolderId !== '0') {
            for (const f of KB_FOLDERS) {
                let folderId = '';
                try {
                    const folder = await userClient.folders.createFolder({
                        parent: { id: rootFolderId },
                        name: f.name
                    });
                    folderId = folder.id;
                    console.log(`   Created: ${f.name}`);
                } catch (e: any) {
                    if (e.statusCode === 409) {
                        const conflictId = e.context_info?.conflicts?.[0]?.id;
                        if (conflictId) {
                            folderId = conflictId;
                            console.log(`   Found: ${f.name} (via conflict)`);
                        } else {
                            const search = await userClient.search.searchForContent({
                                query: `"${f.name}"`,
                                ancestorFolderIds: [rootFolderId],
                                type: 'folder'
                            });
                            const existing = search.entries?.find(i => (i as any).name === f.name);
                            if (existing) {
                                folderId = (existing as any).id;
                                console.log(`   Found: ${f.name} (via search)`);
                            }
                        }
                    }
                }

                if (folderId) {
                    createdFolders.push({ id: folderId, name: f.name });
                    
                    // Upload dummy file
                    const fileName = `Sample_${f.name.split(' ')[0]}_001.pdf`;
                    try {
                        const stream = Readable.from(Buffer.from(`Dummy content for ${f.name}`));
                        await userClient.uploads.uploadFile({
                            attributes: { name: fileName, parent: { id: folderId } },
                            file: stream
                        });
                        console.log(`      + Uploaded ${fileName}`);
                    } catch (e: any) {
                        // Ignore 409 (file exists)
                    }
                }
            }
        }

        // 3. Create/Get Hub
        console.log('\n🌐 Setting up Hub...');
        const hubs = await userClient.hubs.getHubsV2025R0();
        let hub = hubs.entries?.find(h => (h as any).name === hubName);

        if (hub) {
            console.log(`   Hub exists: ${(hub as any).name} (${hub.id})`);
        } else {
            console.log(`   Creating Hub: ${hubName}...`);
            hub = await userClient.hubs.createHubV2025R0({
                title: hubName,
                description: 'Central repository for SOPs, SDS, and Lab Manuals.'
            });
            // Log 'name' property which represents the Hub name/title
            console.log(`   ✅ Created Hub: ${(hub as any).name} (${hub.id})`);
        }

        // 4. Add Folders to Hub using Service Client with Header
        console.log('\n🔗 Linking Content to Hub...');
        
        for (const folder of createdFolders) {
            try {
                // Use serviceClient.hubItems with explicit header because userClient might be a light wrapper
                // Force cast to any because TS definitions might be missing the create method
                await (serviceClient.hubItems as any).createHubItemV2025R0({
                    hub: { id: hub!.id, type: 'hub' },
                    item: { id: folder.id, type: 'folder' }
                }, {
                    headers: { 'As-User': realUser.id }
                });
                console.log(`   Linked: ${folder.name}`);
            } catch (e: any) {
                if (e.message?.includes('item_already_exists') || e.statusCode === 409) {
                    console.log(`   Already linked: ${folder.name}`);
                } else {
                    console.warn(`   Failed to link ${folder.name}: ${e.message}`);
                }
            }
        }

        console.log('\n✨ Knowledge Base Setup Complete!');

    } catch (e: any) {
        console.error('❌ Hub Setup Failed:', e.message || e);
        if (e.statusCode === 403) {
            console.error('   -> Ensure your Service Account has "Manage Hubs" permission or Enterprise enables Hubs.');
        }
    }
}

setupHubs().catch(console.error);
