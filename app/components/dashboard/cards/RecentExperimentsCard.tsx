import React from 'react';
import Link from 'next/link';
import { FiChevronRight } from 'react-icons/fi';

interface RecentExperiment {
  id: string;
  title: string;
  status: string;
  boxFolderId: string;
  createdAt: string;
}

interface RecentExperimentsCardProps {
  experiments: RecentExperiment[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'in-progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'locked':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const RecentExperimentsCard: React.FC<RecentExperimentsCardProps> = ({ experiments }) => {
  return (
    <div className="lg:col-span-2 bg-white rounded-lg shadow">
      <div className="p-6 border-b border-border-light">
        <h2 className="text-lg font-heading font-semibold text-primary">Recent Experiments</h2>
      </div>
      <div className="divide-y divide-border-light">
        {experiments.map((exp) => (
          <Link
            key={exp.id}
            href={`/experiments/${exp.boxFolderId}`}
            className="block p-4 hover:bg-secondary transition-colors"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-primary">{exp.title}</p>
                <p className="text-sm text-text-body">
                  {new Date(exp.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exp.status)}`}>
                  {exp.status}
                </span>
                <FiChevronRight className="w-5 h-5 text-gray-400 ml-2" />
              </div>
            </div>
          </Link>
        ))}
        {experiments.length === 0 && (
          <div className="p-6 text-center text-text-body">
            No recent experiments found.
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(RecentExperimentsCard);
