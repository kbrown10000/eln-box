import { getBoxClient } from './client';

/**
 * Ensure the given user has at least editor access to the Projects root.
 * Uses the service account to add a collaboration when missing.
 */
export async function ensureProjectsRootAccess(userEmail: string) {
  const rootFolderId = process.env.BOX_PROJECTS_FOLDER_ID;
  if (!rootFolderId) {
    throw new Error('BOX_PROJECTS_FOLDER_ID is not configured');
  }

  const serviceClient = getBoxClient();

  try {
    await serviceClient.collaborations.createWithUserEmail(userEmail, rootFolderId, 'editor', {
      notify: false,
    });
  } catch (err: any) {
    // If already a collaborator, ignore conflict errors
    if (err?.statusCode === 409 || err?.message?.includes('conflicts_with_an_existing_collab')) {
      return;
    }
    throw err;
  }
}
