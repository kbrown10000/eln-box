import React from 'react';

interface SpectraByType {
  type: string;
  count: number;
}

interface SpectraByTypeCardProps {
  data: SpectraByType[];
}

const getSpectrumColor = (type: string) => {
  switch (type) {
    case 'IR':
      return 'bg-red-500';
    case 'NMR':
      return 'bg-blue-500';
    case 'MS':
      return 'bg-green-500';
    case 'UV-Vis':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
};

const SpectraByTypeCard: React.FC<SpectraByTypeCardProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-border-light">
        <h2 className="text-lg font-heading font-semibold text-primary">Spectra by Type</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {data.map((s) => (
            <div key={s.type} className="flex items-center p-3 bg-secondary rounded-lg">
              <div className={`w-3 h-3 rounded-full ${getSpectrumColor(s.type)} mr-3`} />
              <div>
                <p className="text-sm font-medium text-primary">{s.type}</p>
                <p className="text-lg font-semibold text-primary">{s.count}</p>
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <p className="col-span-2 text-text-body text-sm">No spectra data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(SpectraByTypeCard);
