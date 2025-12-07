'use server';

import { db, notifications } from '@/lib/db';
import { auth } from '@/lib/auth/config';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Creates a notification for a user
 */
export async function createNotification(userId: string, title: string, message: string, link?: string) {
  try {
    await db.insert(notifications).values({
      userId,
      title,
      message,
      link,
    });
  } catch (error) {
    console.error('Failed to create notification', error);
  }
}

/**
 * Get current user's unread notifications
 */
export async function getNotifications() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return db.select()
    .from(notifications)
    .where(eq(notifications.userId, session.user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(20);
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  await db.update(notifications)
    .set({ read: 1 })
    .where(eq(notifications.id, notificationId));
    
  revalidatePath('/');
}

/**
 * Mark all current user's notifications as read
 */
export async function markAllAsRead() {
    const session = await auth();
    if (!session?.user?.id) return;
  
    await db.update(notifications)
      .set({ read: 1 })
      .where(eq(notifications.userId, session.user.id));
      
    revalidatePath('/');
}
