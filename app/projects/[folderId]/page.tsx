import { Project, Experiment } from '@/lib/box/types';
import { getProject as getProjectFromBox, listExperiments } from '@/lib/box/folders';
import { getAuthenticatedBoxClient } from '@/lib/auth/session';
import ProjectTabs from './ProjectTabs';

async function getProject(folderId: string): Promise<Project | null> {
  try {
    const client = await getAuthenticatedBoxClient();
    if (!client) {
        throw new Error("Failed to initialize Box Client");
    }
    return await getProjectFromBox(client, folderId);
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

async function getExperiments(folderId: string): Promise<Experiment[]> {
  try {
    const client = await getAuthenticatedBoxClient();
    if (!client) {
        throw new Error("Failed to initialize Box Client");
    }
    const result = await listExperiments(client, folderId);
    return result.items;
  } catch (error) {
    console.error('Error fetching experiments:', error);
    return [];
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ folderId: string }>;
}) {
  const { folderId } = await params;
  const project = await getProject(folderId);
  const experiments = await getExperiments(folderId);

  if (!project) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-red-600">Project Not Found</h1>
        <p className="mt-4">The project you are looking for does not exist.</p>
        <a href="/projects" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Back to Projects
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-6">
        <a href="/projects" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Projects
        </a>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow-md mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold">{project.projectName}</h1>
            <p className="text-gray-600">{project.projectCode}</p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              project.status === 'active'
                ? 'bg-green-100 text-green-800'
                : project.status === 'completed'
                ? 'bg-blue-100 text-blue-800'
                : project.status === 'on-hold'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {project.status}
          </span>
        </div>

        <p className="text-gray-700 mb-6">{project.description || 'No description provided'}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-semibold text-gray-600">Principal Investigator</p>
            <p className="mt-1">{project.piName || 'Not assigned'}</p>
            <p className="text-gray-600">{project.piEmail}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-600">Department</p>
            <p className="mt-1">{project.department || 'Not specified'}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-600">Start Date</p>
            <p className="mt-1">{project.startDate || 'Unknown'}</p>
          </div>
        </div>
      </div>

      <ProjectTabs
        project={project}
        experiments={experiments}
        folderId={folderId}
      />
    </div>
  );
}