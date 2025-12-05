import { requireAuth, getAuthenticatedBoxClient } from '@/lib/auth/session';
import { getProject as getProjectFromBox } from '@/lib/box/folders';
import NewExperimentForm from './NewExperimentForm';
import Link from 'next/link';

async function getProject(folderId: string) {
  try {
    const client = await getAuthenticatedBoxClient();
    return await getProjectFromBox(client, folderId);
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

export default async function NewExperimentPage({
  params,
}: {
  params: Promise<{ folderId: string }>;
}) {
  await requireAuth();
  const { folderId } = await params;
  const project = await getProject(folderId);

  if (!project) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-red-600">Project Not Found</h1>
        <p className="mt-4">Cannot create experiment - the project does not exist.</p>
        <Link href="/projects" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link href="/projects" className="hover:text-gray-700">Projects</Link>
        <span>&gt;</span>
        <Link href={`/projects/${folderId}`} className="hover:text-gray-700">{project.projectName}</Link>
        <span>&gt;</span>
        <span className="font-semibold text-gray-700">New Experiment</span>
      </div>

      <h1 className="text-3xl font-bold mb-2">Create New Experiment</h1>
      <p className="text-gray-600 mb-6">Adding to project: <strong>{project.projectCode}</strong></p>

      <NewExperimentForm projectFolderId={folderId} projectName={project.projectName} />
    </div>
  );
}
