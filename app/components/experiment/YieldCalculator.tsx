'use client';

import { useState, useEffect } from 'react';

interface YieldData {
  id?: string;
  theoretical: number;
  actual: number;
  percentage: number;
  unit: string;
}

interface YieldCalculatorProps {
  yieldData: YieldData | null;
  onSave?: (data: Omit<YieldData, 'id' | 'percentage'>) => void;
  editable?: boolean;
}

export default function YieldCalculator({
  yieldData,
  onSave,
  editable = false,
}: YieldCalculatorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    theoretical: yieldData?.theoretical?.toString() || '',
    actual: yieldData?.actual?.toString() || '',
    unit: yieldData?.unit || 'g',
  });

  const [calculatedPercentage, setCalculatedPercentage] = useState<number | null>(null);

  useEffect(() => {
    const theoretical = parseFloat(formData.theoretical);
    const actual = parseFloat(formData.actual);
    if (theoretical > 0 && actual >= 0) {
      setCalculatedPercentage((actual / theoretical) * 100);
    } else {
      setCalculatedPercentage(null);
    }
  }, [formData.theoretical, formData.actual]);

  const handleSave = () => {
    if (onSave && formData.theoretical && formData.actual) {
      onSave({
        theoretical: parseFloat(formData.theoretical),
        actual: parseFloat(formData.actual),
        unit: formData.unit,
      });
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Product Yield</h3>
        {editable && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Theoretical Yield
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={formData.theoretical}
                  onChange={(e) => setFormData({ ...formData, theoretical: e.target.value })}
                  className="border rounded px-3 py-2 flex-1"
                />
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="border rounded px-2 py-2"
                >
                  <option value="g">g</option>
                  <option value="mg">mg</option>
                  <option value="kg">kg</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actual Yield
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.actual}
                onChange={(e) => setFormData({ ...formData, actual: e.target.value })}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Percentage Yield
              </label>
              <div className="border rounded px-3 py-2 bg-gray-50 font-medium">
                {calculatedPercentage !== null ? `${calculatedPercentage.toFixed(1)}%` : '-'}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-gray-600 hover:text-gray-800 px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : yieldData ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left p-3 font-semibold text-gray-700">Theoretical Yield</th>
                <th className="text-left p-3 font-semibold text-gray-700">Actual Yield</th>
                <th className="text-left p-3 font-semibold text-gray-700">Percentage Yield</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3">
                  {yieldData.theoretical} {yieldData.unit}
                </td>
                <td className="p-3">
                  {yieldData.actual} {yieldData.unit}
                </td>
                <td className="p-3 font-medium">
                  {yieldData.percentage.toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 italic">
          No yield data recorded yet.
          {editable && (
            <button
              onClick={() => setIsEditing(true)}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              Add yield data
            </button>
          )}
        </p>
      )}
    </div>
  );
}
