'use client';

import { useEffect, useState } from 'react';
import { getProjectAuditLogs, AuditLogEntryWithUser } from '@/lib/actions/audit';

export default function AuditLog({ projectFolderId }: { projectFolderId: string }) {
  const [logs, setLogs] = useState<AuditLogEntryWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjectAuditLogs(projectFolderId)
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectFolderId]);

  if (loading) return <div className="p-4 text-gray-500">Loading audit logs...</div>;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Audit Trail</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          History of all activities in this project.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.user?.name || 'System'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {log.action}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.entityType}
                  <span className="block text-xs text-gray-400">{log.entityId}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <pre className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No activity recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
