'use server';

import { db } from '@/lib/db';
import { experiments, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { logActivity } from '@/lib/actions/audit';
import { createNotification } from '@/lib/actions/notifications';
import { updateExperiment } from '@/lib/box/folders'; // Updates Box Metadata
import { getBoxClient } from '@/lib/box/client';
import { lockBoxFolder } from '@/lib/box/permissions';
import { revalidatePath } from 'next/cache';

type ExperimentStatus = 'draft' | 'in-progress' | 'review' | 'rejected' | 'completed' | 'locked';

export async function updateExperimentStatus(boxFolderId: string, newStatus: ExperimentStatus) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  // 1. Fetch current experiment and user role
  const experiment = await db.query.experiments.findFirst({
    where: eq(experiments.boxFolderId, boxFolderId),
    with: {
        author: true
    }
  });

  if (!experiment) throw new Error('Experiment not found');

  const userRole = session.user.role;
  const currentStatus = experiment.status;

  // 2. State Machine Logic
  // Allowed transitions:
  // ANY: -> draft (only from draft/rejected)
  // Researcher/PI: draft -> in-progress
  // Researcher/PI: in-progress -> review
  // PI/Admin: review -> completed
  // PI/Admin: review -> rejected
  // PI/Admin: completed -> locked
  
  let allowed = false;

  if (currentStatus === 'draft' && newStatus === 'in-progress') allowed = true;
  if (currentStatus === 'in-progress' && newStatus === 'review') allowed = true;
  if (currentStatus === 'review' && newStatus === 'completed') {
      if (userRole === 'pi' || userRole === 'admin') allowed = true;
  }
  if (currentStatus === 'review' && newStatus === 'rejected') {
      if (userRole === 'pi' || userRole === 'admin') allowed = true;
  }
  if (currentStatus === 'rejected' && newStatus === 'in-progress') allowed = true; // Retry
  if (currentStatus === 'completed' && newStatus === 'locked') {
       if (userRole === 'pi' || userRole === 'admin') allowed = true;
  }
  
  // Admin override (except unlocking, which needs special handling)
  if (userRole === 'admin' && newStatus !== 'draft') allowed = true;

  if (!allowed) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus} for role ${userRole}`);
  }

  // 3. Perform Updates
  
  // A. Update Database
  await db.update(experiments)
    .set({ 
        status: newStatus, 
        updatedAt: new Date(),
        completedAt: newStatus === 'completed' ? new Date() : experiment.completedAt
    })
    .where(eq(experiments.id, experiment.id));

  // B. Update Box Metadata
  const client = getBoxClient();
  await updateExperiment(client, boxFolderId, { status: newStatus });

  // C. Special Action: Locking
  if (newStatus === 'locked') {
      await lockBoxFolder(boxFolderId);
  }

  // 4. Log Activity
  await logActivity('update_status', 'experiment', boxFolderId, {
      oldStatus: currentStatus,
      newStatus: newStatus,
      changedBy: session.user.email
  });

  // 5. Notifications
  if ((newStatus === 'completed' || newStatus === 'rejected') && experiment.authorId) {
      await createNotification(
          experiment.authorId,
          `Experiment ${newStatus === 'completed' ? 'Approved' : 'Rejected'}!`,
          `Your experiment "${experiment.title}" has been ${newStatus}.`,
          `/experiments/${boxFolderId}`
      );
  }

  revalidatePath(`/experiments/${boxFolderId}`);
}
