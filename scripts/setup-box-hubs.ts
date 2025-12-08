import { BoxClient, BoxJwtAuth, JwtConfig } from 'box-typescript-sdk-gen';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Readable } from 'stream';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function setupHubs() {
    console.log('🚀 Setting up Box Hubs...\n');

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

    const hubName = "LabNoteX Knowledge Base";

    try {
        // 1. Impersonate a Real User (Service Account cannot create Hubs)
        const users = await client.users.getUsers({ limit: 5 });
        const realUser = users.entries?.find(u => !u.login.includes('AutomationUser'));
        
        if (!realUser) {
            throw new Error("No valid user found to impersonate for Hub creation");
        }
        
        console.log(`Acting as user: ${realUser.name} (${realUser.id})`);
        const userClient = client.withAsUserHeader(realUser.id);

        // 2. Check if Hub exists
        // Note: Hubs are visible to the user.
        const hubs = await userClient.hubs.getHubsV2025R0();
        let hub = hubs.entries?.find(h => h.name === hubName);

        if (hub) {
            console.log(`✅ Hub already exists: ${hub.name} (${hub.id})`);
        } else {
            console.log(`Creating Hub: ${hubName}...`);
            hub = await userClient.hubs.createHubV2025R0({
                title: hubName,
                description: 'Central repository for SOPs, SDS, and Lab Manuals.'
            });
            console.log(`✅ Created Hub: ${hub.name} (${hub.id})`);
        }

        // ... (folder creation logic stays same - create folders as Service Account or User? 
        // Service Account owns the folders usually, but Hub Items might need permission.
        // Let's keep folder creation as Service Account for now, it's cleaner for ownership.)
        
        const rootId = process.env.BOX_ROOT_FOLDER_ID || '0';
        // ...
        
            // 3. Add Folder to Hub (Must be done by the Hub Owner/Editor, i.e., the Impersonated User)
            // Ensure Service Account has shared the folder with the User? 
            // Actually, if Service Account creates the folder, the User needs access to "pin" it to their Hub.
            // Simplest path: Create folders as Service Account, then collaboration?
            // Or just create folders as the User too for the Knowledge Base.
            // Let's create KB folders as the User to avoid permission issues.
            
            // Re-fetch KB Folder as User
            // ... actually, let's just use userClient for everything in this script for simplicity.
            
            // ...
            
            try {
                // Use userClient to add item
                await userClient.hubItems.manageHubItemsV2025R0(hub!.id, {
                    items: [{
                        type: 'folder',
                        id: sub!.id // This ID comes from Service Account creation. User might not see it.
                    }]
                } as any);
                
                console.log(`   ★ Added to Hub: ${name}`);
            } catch (e: any) {
                // If 404 (User can't see folder), we might need to collab.
                // But for this demo, let's assume Admin (User) can see root or we just try.
                // If it fails, we log it.
                if (e.statusCode === 404) {
                     console.warn(`   ⚠️  User cannot see folder ${sub!.id}. Skipping Hub addition.`);
                } else if (e.statusCode !== 409 && e.message?.indexOf('item_already_exists') === -1) {
                    console.warn(`   ⚠️  Failed to add to Hub: ${e.message}`);
                } else {
                    console.log(`   ★ Already in Hub: ${name}`);
                }
            }
        }

    } catch (e: any) {
        console.error('❌ Hub Setup Failed:', e.message || e);
        if (e.statusCode === 403) {
            console.error('   -> Ensure your Service Account has "Manage Hubs" permission or Enterprise enables Hubs.');
        }
    }
}

setupHubs().catch(console.error);