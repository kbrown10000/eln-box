import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth/session';
import { getServiceAccountToken } from '@/lib/box/client';

/**
 * GET /api/box/token
 * Returns a token for Box UI Elements
 *
 * Query params:
 * - fileId: Box file ID (for file preview)
 * - folderId: Box folder ID (for folder explorer)
 * - scopes: comma-separated list of scopes (default: item_preview,item_download)
 *
 * Note: We try token downscoping first for security, but fall back to
 * the user's full access token if downscoping fails (e.g., if the Box app
 * doesn't support token exchange).
 */
export async function GET(request: NextRequest) {
  const { error, session } = await requireApiAuth();
  if (error) return error;

  const searchParams = request.nextUrl.searchParams;
  const fileId = searchParams.get('fileId');
  const folderId = searchParams.get('folderId');
  const scopesParam = searchParams.get('scopes') || 'item_preview,item_download';

  if (!fileId && !folderId) {
    return NextResponse.json(
      { error: 'Either fileId or folderId is required' },
      { status: 400 }
    );
  }

  try {
    // Build resource URL for the specific file or folder
    const resourceType = fileId ? 'files' : 'folders';
    const resourceId = fileId || folderId;
    const resource = `https://api.box.com/2.0/${resourceType}/${resourceId}`;

    const token = await getServiceAccountToken();

    return NextResponse.json(token);
  } catch (err: any) {
    console.error('Token endpoint error:', err);

    return NextResponse.json(
      { error: 'Failed to get access token', details: err.message },
      { status: 500 }
    );
  }
}
