'use client';

import { useState } from 'react';
import BoxHub from '@/app/components/box/BoxHub';
import { Project, Experiment } from '@/lib/box/types';

interface ProjectTabsProps {
  project: Project;
  experiments: Experiment[];
  folderId: string;
}

type TabType = 'experiments' | 'files';

export default function ProjectTabs({ project, experiments, folderId }: ProjectTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('experiments');

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('experiments')}
          className={`px-6 py-3 font-medium text-sm transition-colors ${
            activeTab === 'experiments'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            Experiments
            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
              {experiments.length}
            </span>
          </span>
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`px-6 py-3 font-medium text-sm transition-colors ${
            activeTab === 'files'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h18v18H3V3zm16 16V5H5v14h14z" />
            </svg>
            Project Hub
          </span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'experiments' && (
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
      )}

      {activeTab === 'files' && (
        <BoxHub
          folderId={folderId}
          folderName={project.projectName}
        />
      )}
    </div>
  );
}
