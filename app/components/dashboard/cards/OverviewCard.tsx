import React from 'react';

interface OverviewCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}

const OverviewCard: React.FC<OverviewCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-accent text-primary">
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-text-body">{title}</p>
          <p className="text-2xl font-semibold text-primary">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(OverviewCard);
