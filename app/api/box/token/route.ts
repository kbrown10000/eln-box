import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth/session';

/**
 * GET /api/box/token
 * Returns a downscoped token for Box UI Elements
 *
 * Query params:
 * - fileId: Box file ID (for file preview)
 * - folderId: Box folder ID (for folder explorer)
 * - scopes: comma-separated list of scopes (default: item_preview,item_download)
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

    // Request downscoped token from Box
    const response = await fetch('https://api.box.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
        subject_token: session!.accessToken,
        subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
        scope: scopesParam.split(',').join(' '),
        resource: resource,
      }),
    });

    const tokenData = await response.json();

    if (!response.ok) {
      console.error('Token exchange error:', tokenData);
      return NextResponse.json(
        { error: 'Failed to get access token', details: tokenData },
        { status: response.status }
      );
    }

    return NextResponse.json({
      accessToken: tokenData.access_token,
      expiresIn: tokenData.expires_in,
      tokenType: tokenData.token_type,
    });
  } catch (err: any) {
    console.error('Token endpoint error:', err);
    return NextResponse.json(
      { error: 'Failed to get access token', details: err.message },
      { status: 500 }
    );
  }
}
