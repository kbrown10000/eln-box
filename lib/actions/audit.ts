'use server';

import { db, auditLog, projects } from '@/lib/db';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import { eq, or, and, desc } from 'drizzle-orm';

/**
 * Logs an activity to the audit_log table.
 * 
 * @param action The action performed (e.g., 'create_experiment', 'update_protocol')
 * @param entityType The type of entity (e.g., 'experiment', 'project', 'file')
 * @param entityId The ID of the entity (Box ID or DB UUID)
 * @param details Optional JSON details
 */
export async function logActivity(
  action: string,
  entityType: string,
  entityId: string,
  details?: Record<string, any>
) {
  const session = await auth();
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || 'unknown';

  try {
    await db.insert(auditLog).values({
      userId: session?.user?.id, // Can be null for system actions or if not found
      action,
      entityType,
      entityId,
      details,
      ipAddress: ip,
    });
  } catch (error) {
    console.error('Failed to write to audit log:', error);
    // Don't throw, so we don't block the main action
  }
}

export type AuditLogEntryWithUser = typeof auditLog.$inferSelect & {
  user: { name: string; email: string } | null;
};

/**
 * Fetches audit logs for a specific project (by Box Folder ID).
 * Returns logs for the project itself AND any experiments within it.
 * 
 * Note: This relies on entityId matching the Box Folder ID.
 */
export async function getProjectAuditLogs(projectBoxFolderId: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  // 1. Get Project DB ID if it exists (for robustness, though we mainly use Box IDs for now)
  // For now, we assume entityId IS the Box Folder ID for projects and experiments as per current implementation plan.
  
  // We want logs where:
  // (entityType = 'project' AND entityId = projectBoxFolderId)
  // OR
  // (entityType = 'experiment' AND details->>'projectFolderId' = projectBoxFolderId) 
  // ^ usage of details for linking is a good strategy if we don't have full DB relational mapping yet.

  // However, `logActivity` for experiment creation will be called with experiment folder ID.
  // We need to know which experiments belong to this project to fetch their logs.
  // Or, we can simply pass the projectFolderId in the `details` of the experiment logs.
  
  const logs = await db.query.auditLog.findMany({
    where: (auditLog, { eq, or, and }) => or(
        and(eq(auditLog.entityType, 'project'), eq(auditLog.entityId, projectBoxFolderId)),
        // We will ensure we log 'projectFolderId' in details for child items
        sql`${auditLog.details}->>'projectFolderId' = ${projectBoxFolderId}`
    ),
    with: {
      user: {
        columns: {
          name: true,
          email: true,
        }
      }
    },
    orderBy: [desc(auditLog.createdAt)],
    limit: 100,
  });

  return logs;
}

import { sql } from 'drizzle-orm';
