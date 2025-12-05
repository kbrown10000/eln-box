import React from 'react';

interface YieldData {
  title: string;
  theoretical: number;
  actual: number;
  percentage: number;
  unit: string;
}

interface YieldPerformanceCardProps {
  data: YieldData[];
}

const YieldPerformanceCard: React.FC<YieldPerformanceCardProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-border-light">
        <h2 className="text-lg font-heading font-semibold text-primary">Yield Performance</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {data.map((y, index) => (
            <div key={index} className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-primary truncate">{y.title}</p>
                <div className="flex items-center mt-1">
                  <div className="flex-1 bg-border-light rounded-full h-2 mr-2">
                    <div
                      className={`h-2 rounded-full ${
                        y.percentage >= 80 ? 'bg-accent' :
                        y.percentage >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(y.percentage, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-primary">{y.percentage.toFixed(1)}%</span>
                </div>
                <p className="text-xs text-text-body mt-1">
                  {y.actual} / {y.theoretical} {y.unit}
                </p>
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <p className="text-text-body text-sm">No yield data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(YieldPerformanceCard);
