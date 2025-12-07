import { getUsers } from '@/lib/actions/users';
import UserList from './UserList';
import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/');
  }

  const users = await getUsers();

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">User Management</h1>
        <p className="mb-4 text-gray-600">
          Manage user roles and permissions. Only Admins can access this page.
        </p>
        <UserList users={users} />
      </div>
    </div>
  );
}
