import React from 'react';

interface StatusDistribution {
  status: string;
  count: number;
}

interface StatusDistributionCardProps {
  data: StatusDistribution[];
}

const StatusDistributionCard: React.FC<StatusDistributionCardProps> = ({ data }) => {
  const total = data.reduce((acc, i) => acc + i.count, 0);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-border-light">
        <h2 className="text-lg font-heading font-semibold text-primary">Status Distribution</h2>
      </div>
      <div className="p-6 space-y-4">
        {data.map((item) => {
          const percentage = total > 0 ? (item.count / total) * 100 : 0;
          return (
            <div key={item.status}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-primary capitalize">{item.status}</span>
                <span className="text-sm text-text-body">{item.count}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    item.status === 'completed' ? 'bg-accent' :
                    item.status === 'in-progress' ? 'bg-yellow-500' :
                    item.status === 'draft' ? 'bg-gray-400' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
        {data.length === 0 && (
            <div className="text-center text-text-body">
                No status data available.
            </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(StatusDistributionCard);
