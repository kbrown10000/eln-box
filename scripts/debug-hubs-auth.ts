import { BoxClient, BoxJwtAuth, JwtConfig } from 'box-typescript-sdk-gen';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

function formatPrivateKey(key: string): string {
    if (!key) return '';
    if (key.includes('\n')) return key;
    return key.replace(/\\n/g, '\n');
}

async function debugHubs() {
    console.log('🔍 Debugging Box Hubs Auth...\n');

    const jwtConfig = new JwtConfig({
        clientId: process.env.BOX_CLIENT_ID!,
        clientSecret: process.env.BOX_CLIENT_SECRET!,
        jwtKeyId: process.env.BOX_PUBLIC_KEY_ID!,
        privateKey: formatPrivateKey(process.env.BOX_PRIVATE_KEY!),
        privateKeyPassphrase: process.env.BOX_PASSPHRASE!,
        enterpriseId: process.env.BOX_ENTERPRISE_ID!,
    });

    const auth = new BoxJwtAuth({ config: jwtConfig });
    const client = new BoxClient({ auth });

    try {
        // 1. Check Service Account
        const me = await client.users.getUserMe();
        console.log(`1. Service Account: ${me.name} (ID: ${me.id}, Login: ${me.login})`);

        // 2. List Users (to find a real human/admin to impersonate)
        console.log('\n2. Listing Users...');
        const users = await client.users.getUsers({ limit: 5 });
        const realUser = users.entries?.find(u => !u.login.includes('AutomationUser')); // Filter out service accounts if possible

        if (realUser) {
            console.log(`   Found Real User: ${realUser.name} (ID: ${realUser.id}, Login: ${realUser.login})`);
            
            // 3. Try creating Hub AS THE USER
            console.log(`\n3. Attempting to create Hub AS USER (${realUser.name})...`);
            
            const userClient = client.withAsUserHeader(realUser.id);
            
            const hubName = "LabNoteX Knowledge Hub (User)";
            try {
                const hub = await userClient.hubs.createHubV2025R0({
                    title: hubName,
                    description: 'Created via User Impersonation'
                });
                console.log(`   ✅ SUCCESS! Created Hub: ${hub.name} (${hub.id})`);
            } catch (e: any) {
                console.error(`   ❌ Failed as User: ${e.message}`);
                if (e.responseInfo?.body) console.error('   Error:', JSON.stringify(e.responseInfo.body, null, 2));
            }

        } else {
            console.log('   ⚠️ No real users found to impersonate.');
        }

        // 4. Try Service Account (just to confirm failure mode)
        console.log('\n4. Attempting to create Hub AS SERVICE ACCOUNT...');
        try {
            const hub = await client.hubs.createHubV2025R0({
                title: "LabNoteX Service Hub",
                description: "Created by Service Account"
            });
            console.log(`   ✅ SUCCESS! Created Hub: ${hub.name} (${hub.id})`);
        } catch (e: any) {
            console.error(`   ❌ Failed as Service Account: ${e.message}`);
             if (e.responseInfo?.body) console.error('   Error:', JSON.stringify(e.responseInfo.body, null, 2));
        }

    } catch (e: any) {
        console.error('Fatal Error:', e);
    }
}

debugHubs().catch(console.error);
