import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth/session';

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

  // Check if we have the user's access token
  if (!session?.accessToken) {
    return NextResponse.json(
      { error: 'No access token available. Please log in again.' },
      { status: 401 }
    );
  }

  try {
    // Build resource URL for the specific file or folder
    const resourceType = fileId ? 'files' : 'folders';
    const resourceId = fileId || folderId;
    const resource = `https://api.box.com/2.0/${resourceType}/${resourceId}`;

    // Try to get a downscoped token first (more secure)
    const response = await fetch('https://api.box.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
        subject_token: session.accessToken,
        subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
        scope: scopesParam.split(',').join(' '),
        resource: resource,
        // Include client credentials for token exchange
        client_id: process.env.BOX_OAUTH_CLIENT_ID || '',
        client_secret: process.env.BOX_OAUTH_CLIENT_SECRET || '',
      }),
    });

    const tokenData = await response.json();

    if (response.ok && tokenData.access_token) {
      // Downscoped token succeeded
      return NextResponse.json({
        accessToken: tokenData.access_token,
        expiresIn: tokenData.expires_in,
        tokenType: tokenData.token_type,
      });
    }

    // Downscoping failed - fall back to user's full access token
    // This is less secure but allows the UI Elements to work
    console.warn('Token downscoping failed, using full access token:', tokenData);

    return NextResponse.json({
      accessToken: session.accessToken,
      expiresIn: 3600, // Assume 1 hour, actual expiry tracked in session
      tokenType: 'bearer',
    });
  } catch (err: any) {
    console.error('Token endpoint error:', err);

    // Even on error, try to return the user's token as fallback
    if (session?.accessToken) {
      return NextResponse.json({
        accessToken: session.accessToken,
        expiresIn: 3600,
        tokenType: 'bearer',
      });
    }

    return NextResponse.json(
      { error: 'Failed to get access token', details: err.message },
      { status: 500 }
    );
  }
}
