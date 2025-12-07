'use client';

import { useState } from 'react';

interface ProtocolStep {
  id: string;
  stepNumber: number;
  instruction: string;
}

interface ProtocolSectionProps {
  steps: ProtocolStep[];
  onAddStep?: (instruction: string) => void;
  onUpdateStep?: (id: string, instruction: string) => void;
  onDeleteStep?: (id: string) => void;
  onSnapshot?: () => void;
  editable?: boolean;
}

export default function ProtocolSection({
  steps,
  onAddStep,
  onUpdateStep,
  onDeleteStep,
  onSnapshot,
  editable = false,
}: ProtocolSectionProps) {
  const [newStep, setNewStep] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleAddStep = () => {
    if (newStep.trim() && onAddStep) {
      onAddStep(newStep.trim());
      setNewStep('');
    }
  };

  const startEditing = (step: ProtocolStep) => {
    setEditingId(step.id);
    setEditText(step.instruction);
  };

  const saveEdit = () => {
    if (editingId && editText.trim() && onUpdateStep) {
      onUpdateStep(editingId, editText.trim());
    }
    setEditingId(null);
    setEditText('');
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Protocol</h2>
        {editable && onSnapshot && (
          <button
            onClick={onSnapshot}
            className="text-sm border border-gray-300 rounded px-3 py-1 hover:bg-gray-50"
            title="Save a snapshot of current steps"
          >
            Create Version
          </button>
        )}
      </div>

      {steps.length === 0 ? (
        <p className="text-gray-500 italic">No protocol steps defined yet.</p>
      ) : (
        <ol className="list-decimal list-inside space-y-2">
          {steps.sort((a, b) => a.stepNumber - b.stepNumber).map((step) => (
            <li key={step.id} className="text-gray-700">
              {editingId === step.id ? (
                <span className="inline-flex items-center gap-2 ml-2">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="border rounded px-2 py-1 flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                  />
                  <button
                    onClick={saveEdit}
                    className="text-green-600 hover:text-green-800"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </span>
              ) : (
                <span>
                  {step.instruction}
                  {editable && (
                    <span className="ml-2 space-x-2">
                      <button
                        onClick={() => startEditing(step)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      {onDeleteStep && (
                        <button
                          onClick={() => onDeleteStep(step.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </span>
                  )}
                </span>
              )}
            </li>
          ))}
        </ol>
      )}

      {editable && onAddStep && (
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={newStep}
            onChange={(e) => setNewStep(e.target.value)}
            placeholder="Add new step..."
            className="flex-1 border rounded px-3 py-2"
            onKeyDown={(e) => e.key === 'Enter' && handleAddStep()}
          />
          <button
            onClick={handleAddStep}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Step
          </button>
        </div>
      )}
    </div>
  );
}