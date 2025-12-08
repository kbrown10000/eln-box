import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth/session';
import { getBoxClient } from '@/lib/box/client';

/**
 * GET /api/box/token
 * Returns a downscoped token for Box UI Elements.
 *
 * Query params:
 * - fileId: Box file ID (for file preview)
 * - folderId: Box folder ID (for folder explorer)
 * - scopes: comma-separated list of scopes (default: item_preview,item_download,item_readwrite,root_readonly)
 */
export async function GET(request: NextRequest) {
  const { error, session } = await requireApiAuth();
  if (error) return error;

  const searchParams = request.nextUrl.searchParams;
  const fileId = searchParams.get('fileId');
  const folderId = searchParams.get('folderId');
  const scopesParam = searchParams.get('scopes') || 'item_preview,item_download,item_readwrite,root_readonly';

  if (!fileId && !folderId) {
    return NextResponse.json(
      { error: 'Either fileId or folderId is required' },
      { status: 400 }
    );
  }

  try {
    const resourceId = fileId || folderId;
    console.log('[API] Generating Box Token for:', resourceId);
    const client = getBoxClient();
    if (!client) {
        throw new Error("Failed to initialize Box Client");
    }
    const resourceType = fileId ? 'files' : 'folders';
      // const resourceId = fileId || folderId; // Removed re-declaration
      const resource = `https://api.box.com/2.0/${resourceType}/${resourceId}`;
      
      // Security: Validate requested scopes against a whitelist
      const allowedScopes = new Set([
        'item_preview', 
        'item_download', 
        'item_upload', 
        'item_share',
        'item_delete', // Only if we really want to allow deletion
        'base_explorer', 
        'base_picker',
        'base_preview',
        'root_readonly',
        'annotation_edit',
        'annotation_view_all',
        'annotation_view_self'
      ]);
    
      const requestedScopes = scopesParam.split(',');
      const scopes = requestedScopes.filter(scope => allowedScopes.has(scope));
    
      if (scopes.length === 0) {
        // Default to minimum safe scopes if all requested scopes were invalid
        scopes.push('item_preview');
      }
      
      // The new SDK uses auth.downscopeToken instead of exchangeToken
      console.log('[API] Requesting downscoped token with scopes:', scopes);
      const downscopedToken = await client.auth.downscopeToken(
        scopes, 
        resource, 
        undefined // sharedLink
      );
    
    if (!downscopedToken || !downscopedToken.accessToken) {
        throw new Error("Box SDK returned empty token");
    }

    // Normalize token response to camelCase for frontend consistency
    const token = downscopedToken.accessToken;
    console.log('[API] Token generated successfully');

    return NextResponse.json({ accessToken: token });
  } catch (err: any) {
    // Safe error logging
    try {
        console.error('Token endpoint error message:', err?.message || String(err));
        if (err?.responseInfo) {
             console.error('Box API Error Response:', JSON.stringify(err.responseInfo, null, 2));
        } else {
             console.error('Full Error Object:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
        }
    } catch (logError) {
        console.error('Failed to log error details:', logError);
    }

    return NextResponse.json(
      { error: 'Failed to get access token', details: err?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
