import { Project, Experiment } from '@/lib/box/types';

async function getProject(folderId: string): Promise<Project | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/projects/${folderId}`,
      { cache: 'no-store' }
    );

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

async function getExperiments(folderId: string): Promise<Experiment[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/projects/${folderId}/experiments`,
      { cache: 'no-store' }
    );

    if (!res.ok) {
      return [];
    }

    return res.json();
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

      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Experiments</h2>
          <a
            href={`/projects/${folderId}/experiments/new`}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            + New Experiment
          </a>
        </div>

        {experiments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 text-lg mb-4">No experiments yet</p>
            <p className="text-gray-500">Create your first experiment to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {experiments.map((experiment) => (
              <div
                key={experiment.folderId}
                className="border rounded-lg p-6 shadow hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">{experiment.experimentTitle}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      experiment.status === 'in-progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : experiment.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : experiment.status === 'locked'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {experiment.status}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-3">{experiment.experimentId}</p>

                <p className="text-gray-700 mb-4 line-clamp-2">
                  <strong>Objective:</strong> {experiment.objective || 'No objective specified'}
                </p>

                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <p><strong>Owner:</strong> {experiment.ownerName || 'Not assigned'}</p>
                  {experiment.startedAt && <p><strong>Started:</strong> {experiment.startedAt}</p>}
                  {experiment.tags && experiment.tags.length > 0 && (
                    <p>
                      <strong>Tags:</strong> {experiment.tags.join(', ')}
                    </p>
                  )}
                </div>

                <a
                  href={`/experiments/${experiment.folderId}`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  View Experiment →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
