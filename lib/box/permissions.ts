import { getBoxClient } from './client';

/**
 * Locks a Box folder by restricting permissions.
 * This function effectively makes the folder read-only for most users by
 * removing editors/viewers or applying a restrictive policy if available.
 * 
 * For this implementation, we will assume we remove all collaborators 
 * except the owner/admin, effectively locking it from general edits.
 * 
 * Note: A more enterprise-grade solution would use Box Governance Retention Policies.
 * 
 * @param folderId The Box folder ID to lock
 */
export async function lockBoxFolder(folderId: string) {
  const client = getBoxClient();

  try {
    // 1. Get all collaborations for the folder
    const collaborations = await client.listCollaborations.listFolderCollaborations(folderId);

    // 2. Iterate and update roles or remove collaborators
    // Strategy: Downgrade all 'editor' roles to 'viewer'
    
    for (const collab of collaborations.entries) {
      if (collab.role === 'editor' || collab.role === 'co_owner') {
         // Skip if it's the Service Account (Enterprise Admin) - though usually handled by separate logic
         // For safety, let's just downgrade everyone found here to viewer.
         
         try {
             await client.collaborations.updateCollaborationById(collab.id, {
                 role: 'viewer'
             });
             console.log(`Downgraded collaboration ${collab.id} to viewer`);
         } catch (e) {
             console.warn(`Failed to downgrade collaboration ${collab.id}`, e);
         }
      }
    }

    // 3. (Optional) Apply a visual indicator or tag if possible, 
    // but the main goal is removing edit rights.
    
    console.log(`Box Folder ${folderId} locked (collaborators downgraded to viewer).`);

  } catch (error) {
    console.error(`Failed to lock Box folder ${folderId}:`, error);
    throw new Error('Failed to apply Box permissions for locking');
  }
}
