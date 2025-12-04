import { Project } from '@/lib/box/types';
import { listProjects } from '@/lib/box/folders';

async function getProjects(): Promise<Project[]> {
  try {
    const result = await listProjects();
    return result.items;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <a
          href="/projects/new"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          + New Project
        </a>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg mb-4">No projects found</p>
          <p className="text-gray-500">Create your first project to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.folderId} className="border rounded-lg p-6 shadow hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold">{project.projectName}</h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
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

              <p className="text-gray-600 text-sm mb-3">{project.projectCode}</p>

              <p className="text-gray-700 mb-4 line-clamp-2">{project.description || 'No description'}</p>

              <div className="text-sm text-gray-600 space-y-1 mb-4">
                <p><strong>PI:</strong> {project.piName || 'Not assigned'}</p>
                <p><strong>Department:</strong> {project.department || 'Not specified'}</p>
                <p><strong>Started:</strong> {project.startDate || 'Unknown'}</p>
              </div>

              <a
                href={`/projects/${project.folderId}`}
                className="text-blue-600 hover:underline font-medium"
              >
                View Project →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
