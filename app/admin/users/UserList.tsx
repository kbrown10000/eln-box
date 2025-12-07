'use client';

import { useState } from 'react';
import { updateUserRole } from '@/lib/actions/users';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'pi' | 'researcher' | 'viewer';
  avatarUrl: string | null;
  createdAt: Date;
};

export default function UserList({ users }: { users: User[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'pi' | 'researcher' | 'viewer') => {
    setLoadingId(userId);
    setError(null);
    try {
      await updateUserRole(userId, newRole);
    } catch (err: any) {
      setError(err.message || 'Failed to update role');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {error && (
        <div className="bg-red-50 p-4 border-l-4 border-red-400">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Joined
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    {user.avatarUrl ? (
                      <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt="" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                  disabled={loadingId === user.id}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="admin">Admin</option>
                  <option value="pi">PI</option>
                  <option value="researcher">Researcher</option>
                  <option value="viewer">Viewer</option>
                </select>
                {loadingId === user.id && (
                  <span className="text-xs text-gray-500 ml-2">Updating...</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
