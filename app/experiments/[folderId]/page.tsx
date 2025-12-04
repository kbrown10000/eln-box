import { Experiment } from '@/lib/box/types';
import { getExperiment as getExperimentFromBox } from '@/lib/box/folders';
import { requireAuth } from '@/lib/auth/session';
import Link from 'next/link';
import ExperimentClient from './ExperimentClient';

async function getExperiment(folderId: string): Promise<Experiment | null> {
  try {
    return await getExperimentFromBox(folderId);
  } catch (error) {
    console.error('Error fetching experiment:', error);
    return null;
  }
}

export default async function ExperimentDetailPage({
  params,
}: {
  params: Promise<{ folderId: string }>;
}) {
  // Require authentication
  const session = await requireAuth();

  const { folderId } = await params;
  const experiment = await getExperiment(folderId);

  if (!experiment) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-red-600">Experiment Not Found</h1>
        <p className="mt-4">The experiment you are looking for does not exist.</p>
        <Link href="/projects" className="text-blue-600 hover:underline mt-4 inline-block">
          &larr; Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-8 py-3">
          <nav className="text-sm text-gray-600">
            <Link href="/projects" className="hover:text-blue-600">
              Projects
            </Link>
            <span className="mx-2">&gt;</span>
            <span className="text-gray-900 font-medium">
              {experiment.experimentTitle}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-8">
        <ExperimentClient
          experiment={experiment}
          folderId={folderId}
          userId={session.user.id}
        />
      </div>
    </div>
  );
}
