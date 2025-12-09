import { getBoxClient } from '../lib/box/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkAuth() {
    try {
        console.log('Initializing client...');
        const client = getBoxClient();
        if (!client) throw new Error('Box client not initialized');
        console.log('Getting current user...');
        const user = await client.users.getUserMe();
        console.log('User:', user.name, user.login);
    } catch (e: any) {
        console.error('Auth Error:', e.message);
        if (e.responseInfo) {
            console.error('Response Body:', JSON.stringify(e.responseInfo.body, null, 2));
        }
    }
}

checkAuth();
