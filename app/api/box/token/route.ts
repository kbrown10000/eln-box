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
    const client = getBoxClient();
    const resourceType = fileId ? 'files' : 'folders';
    const resourceId = fileId || folderId;
    const resource = `https://api.box.com/2.0/${resourceType}/${resourceId}`;
    
    const scopes = scopesParam.split(',');
    
    const downscopedToken = await client.exchangeToken(scopes, resource);
    console.log('Successfully generated downscoped token:', downscopedToken);

    return NextResponse.json(downscopedToken);
  } catch (err: any) {
    console.error('Token endpoint error details:', err); // Log full error object

    return NextResponse.json(
      { error: 'Failed to get access token', details: err.message },
      { status: 500 }
    );
  }
}
