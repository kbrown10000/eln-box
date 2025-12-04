'use client';

import { useState } from 'react';

interface Reagent {
  id: string;
  name: string;
  amount: number;
  unit: string;
  molarAmount?: number;
  observations?: string;
}

interface ReagentsTableProps {
  reagents: Reagent[];
  onAddReagent?: (reagent: Omit<Reagent, 'id'>) => void;
  onUpdateReagent?: (id: string, reagent: Partial<Reagent>) => void;
  onDeleteReagent?: (id: string) => void;
  editable?: boolean;
}

export default function ReagentsTable({
  reagents,
  onAddReagent,
  onUpdateReagent,
  onDeleteReagent,
  editable = false,
}: ReagentsTableProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReagent, setNewReagent] = useState({
    name: '',
    amount: '',
    unit: 'g',
    molarAmount: '',
    observations: '',
  });

  const handleAddReagent = () => {
    if (newReagent.name && newReagent.amount && onAddReagent) {
      onAddReagent({
        name: newReagent.name,
        amount: parseFloat(newReagent.amount),
        unit: newReagent.unit,
        molarAmount: newReagent.molarAmount ? parseFloat(newReagent.molarAmount) : undefined,
        observations: newReagent.observations || undefined,
      });
      setNewReagent({ name: '', amount: '', unit: 'g', molarAmount: '', observations: '' });
      setShowAddForm(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Results</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left p-3 font-semibold text-gray-700">Reagent</th>
              <th className="text-left p-3 font-semibold text-gray-700">Amount Used</th>
              <th className="text-left p-3 font-semibold text-gray-700">Molar Amount</th>
              <th className="text-left p-3 font-semibold text-gray-700">Observations</th>
              {editable && <th className="text-left p-3 font-semibold text-gray-700">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {reagents.length === 0 ? (
              <tr>
                <td colSpan={editable ? 5 : 4} className="p-3 text-gray-500 italic text-center">
                  No reagents recorded yet.
                </td>
              </tr>
            ) : (
              reagents.map((reagent) => (
                <tr key={reagent.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{reagent.name}</td>
                  <td className="p-3">
                    {reagent.amount} {reagent.unit}
                  </td>
                  <td className="p-3">
                    {reagent.molarAmount ? `${reagent.molarAmount} mol` : '-'}
                  </td>
                  <td className="p-3 text-gray-600">{reagent.observations || '-'}</td>
                  {editable && (
                    <td className="p-3">
                      <button
                        onClick={() => onDeleteReagent?.(reagent.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editable && !showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          + Add Reagent
        </button>
      )}

      {editable && showAddForm && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-3">Add Reagent</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Name"
              value={newReagent.name}
              onChange={(e) => setNewReagent({ ...newReagent, name: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={newReagent.amount}
                onChange={(e) => setNewReagent({ ...newReagent, amount: e.target.value })}
                className="border rounded px-3 py-2 flex-1"
              />
              <select
                value={newReagent.unit}
                onChange={(e) => setNewReagent({ ...newReagent, unit: e.target.value })}
                className="border rounded px-2 py-2"
              >
                <option value="g">g</option>
                <option value="mg">mg</option>
                <option value="mL">mL</option>
                <option value="L">L</option>
                <option value="mol">mol</option>
                <option value="mmol">mmol</option>
              </select>
            </div>
            <input
              type="number"
              step="0.0001"
              placeholder="Molar Amount (optional)"
              value={newReagent.molarAmount}
              onChange={(e) => setNewReagent({ ...newReagent, molarAmount: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Observations (optional)"
              value={newReagent.observations}
              onChange={(e) => setNewReagent({ ...newReagent, observations: e.target.value })}
              className="border rounded px-3 py-2"
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleAddReagent}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-600 hover:text-gray-800 px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
