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

  if (!serviceClient) {
      throw new Error("Failed to initialize Box Client");
  }

  try {
    await serviceClient.userCollaborations.createCollaboration({
      item: { id: rootFolderId, type: 'folder' },
      accessibleBy: { type: 'user', login: userEmail },
      role: 'editor'
    });
  } catch (err: any) {
    // If already a collaborator, ignore conflict errors
    if (err?.statusCode === 409 || err?.message?.includes('conflicts_with_an_existing_collab')) {
      return;
    }
    throw err;
  }
}
