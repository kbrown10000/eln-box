'use server';

import { db, users } from '@/lib/db';
import { auth } from '@/lib/auth/config';
import { eq, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getUsers() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const allUsers = await db.select().from(users).orderBy(users.name);
  return allUsers;
}

export async function updateUserRole(userId: string, newRole: 'admin' | 'pi' | 'researcher' | 'viewer') {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  // Prevent admin from removing their own admin status (optional but good safety)
  if (session.user.id === userId && newRole !== 'admin') {
      // Check if there are other admins. If not, prevent this change.
      const otherAdmins = await db.select().from(users).where(eq(users.role, 'admin'));
      if (otherAdmins.length <= 1) {
          throw new Error('Cannot remove the last admin');
      }
  }

  await db.update(users).set({ role: newRole }).where(eq(users.id, userId));
  revalidatePath('/admin/users');
}
