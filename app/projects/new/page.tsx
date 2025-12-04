import { requireAuth } from '@/lib/auth/session';
import NewProjectForm from './NewProjectForm';
import Link from 'next/link';

export default async function NewProjectPage() {
  await requireAuth();

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link href="/projects" className="hover:text-gray-700">Projects</Link>
        <span>&gt;</span>
        <span className="font-semibold text-gray-700">New Project</span>
      </div>

      <h1 className="text-3xl font-bold mb-6">Create New Project</h1>

      <NewProjectForm />
    </div>
  );
}
