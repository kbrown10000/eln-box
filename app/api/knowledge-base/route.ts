import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth/session';
import { getBoxClient } from '@/lib/box/client';

export async function GET(request: NextRequest) {
  const { error, session } = await requireApiAuth();
  if (error) return error;

  try {
    const client = getBoxClient();
    if (!client) throw new Error('Box client not initialized');
    
    const HUB_NAME = "LabNoteX Knowledge Base";

    // 1. List Hubs
    // The Hub was likely created by a specific user (via impersonation in the script).
    // The Service Account (JWT) usually CANNOT see content owned by managed users unless it impersonates them or is a collaborator.
    // Since we don't know exactly who owns it, we should try to impersonate the CURRENTLY LOGGED IN USER.
    // If they have access (e.g. it's public to enterprise or they are the owner), they will see it.

    let hubId = '';
    let items: any[] = [];
    let userClient = client;

    // Try to impersonate the current user if we have their Box ID
    if (session?.user?.boxUserId) {
        try {
            userClient = client.withAsUserHeader(session.user.boxUserId);
        } catch (e) {
            console.warn('Failed to impersonate user for Hub listing:', e);
        }
    }

    try {
        const hubs = await userClient.hubs.getHubsV2025R0();
        const kbHub = hubs.entries?.find((h: any) => h.name === HUB_NAME);
        if (kbHub) {
            hubId = kbHub.id;
        }
    } catch (e) {
        console.warn('Client could not list Hubs:', e);
    }

    // If not found, try Service Account directly as fallback (in case it WAS created by SA)
    if (!hubId && userClient !== client) {
         try {
            const hubs = await client.hubs.getHubsV2025R0();
            const kbHub = hubs.entries?.find((h: any) => h.name === HUB_NAME);
            if (kbHub) hubId = kbHub.id;
        } catch (e) {}
    }
    
    if (!hubId) {
        return NextResponse.json({ items: [], message: 'Knowledge Base Hub not found. Ensure you have run the setup script and have permission.' });
    }

    // 2. Get Hub Items (as the same client that found it)
    const hubItems = await userClient.hubItems.getHubItemsV2025R0({ hubId: hubId } as any);
    
    // 3. Format Items
    // The items return usually contains { id, type, item: { id, type, name, ... } }
    items = (hubItems.entries || []).map((entry: any) => {
        const item = entry.item || {}; // The actual file/folder
        return {
            id: item.id,
            type: item.type,
            name: item.name,
            description: item.description || '',
            // Add other fields as needed
        };
    });

    return NextResponse.json({ 
        hubId,
        name: HUB_NAME,
        items 
    });

  } catch (err: any) {
    console.error('Error fetching Knowledge Base:', err);
    return NextResponse.json({ error: 'Failed to fetch Knowledge Base' }, { status: 500 });
  }
}
