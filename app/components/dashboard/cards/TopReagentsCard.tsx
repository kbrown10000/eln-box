import React from 'react';

interface TopReagent {
  name: string;
  count: number;
}

interface TopReagentsCardProps {
  data: TopReagent[];
}

const TopReagentsCard: React.FC<TopReagentsCardProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-border-light">
        <h2 className="text-lg font-heading font-semibold text-primary">Most Used Reagents</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {data.slice(0, 10).map((r, index) => (
            <div key={r.name} className="text-center p-3 bg-secondary rounded-lg">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-accent text-primary flex items-center justify-center">
                <span className="font-semibold">{index + 1}</span>
              </div>
              <p className="text-sm font-medium text-primary truncate" title={r.name}>{r.name}</p>
              <p className="text-xs text-text-body">Used {r.count}x</p>
            </div>
          ))}
          {data.length === 0 && (
            <p className="col-span-full text-center text-text-body">No reagent data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(TopReagentsCard);
