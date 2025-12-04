import { auth } from './config';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import BoxSDK from 'box-node-sdk';

/**
 * Get the current session (returns null if not authenticated)
 */
export async function getSession() {
  return await auth();
}

/**
 * API route auth check - returns session or unauthorized response
 * Use in API routes instead of requireAuth (which redirects)
 */
export async function requireApiAuth() {
  const session = await auth();

  if (!session?.user) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
      session: null
    };
  }

  if (session.error === 'RefreshAccessTokenError') {
    return {
      error: NextResponse.json(
        { error: 'Session expired, please log in again' },
        { status: 401 }
      ),
      session: null
    };
  }

  return { error: null, session };
}

/**
 * Require authentication - redirects to login if not authenticated
 * Use in server components and API routes
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return session;
}

/**
 * Get Box client authenticated as the current user
 * Uses the user's OAuth access token
 */
export async function getAuthenticatedBoxClient() {
  const session = await requireAuth();

  if (!session.accessToken) {
    throw new Error('No access token available');
  }

  if (session.error === 'RefreshAccessTokenError') {
    redirect('/login');
  }

  const sdk = new BoxSDK({
    clientID: process.env.BOX_OAUTH_CLIENT_ID!,
    clientSecret: process.env.BOX_OAUTH_CLIENT_SECRET!,
  });

  return sdk.getBasicClient(session.accessToken);
}

/**
 * Check if the current user has a specific role
 */
export async function requireRole(allowedRoles: string[]) {
  const session = await requireAuth();

  if (!allowedRoles.includes(session.user.role)) {
    throw new Error('Insufficient permissions');
  }

  return session;
}

/**
 * Get current user ID (for database queries)
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
