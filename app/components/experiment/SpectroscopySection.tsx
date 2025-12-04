'use client';

import { useState } from 'react';

interface Spectrum {
  id: string;
  spectrumType: 'IR' | 'NMR' | 'MS' | 'UV-Vis';
  caption: string;
  boxFileId: string;
  fileName: string;
  peakData?: Record<string, string>;
}

interface SpectroscopySectionProps {
  spectra: Spectrum[];
  onAddSpectrum?: (spectrum: Omit<Spectrum, 'id'>) => void;
  onDeleteSpectrum?: (id: string) => void;
  editable?: boolean;
}

type SpectrumType = 'IR' | 'NMR' | 'MS' | 'UV-Vis';

export default function SpectroscopySection({
  spectra,
  onAddSpectrum,
  onDeleteSpectrum,
  editable = false,
}: SpectroscopySectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSpectrum, setNewSpectrum] = useState<{
    spectrumType: SpectrumType;
    caption: string;
    boxFileId: string;
    fileName: string;
  }>({
    spectrumType: 'IR',
    caption: '',
    boxFileId: '',
    fileName: '',
  });

  const handleAddSpectrum = () => {
    if (newSpectrum.caption && newSpectrum.boxFileId && onAddSpectrum) {
      onAddSpectrum({
        ...newSpectrum,
      });
      setNewSpectrum({ spectrumType: 'IR', caption: '', boxFileId: '', fileName: '' });
      setShowAddForm(false);
    }
  };

  const getSpectrumTypeColor = (type: string) => {
    switch (type) {
      case 'IR':
        return 'bg-red-100 text-red-800';
      case 'NMR':
        return 'bg-blue-100 text-blue-800';
      case 'MS':
        return 'bg-green-100 text-green-800';
      case 'UV-Vis':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Spectroscopy Data</h2>
        {editable && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            + Add Spectrum
          </button>
        )}
      </div>

      {spectra.length === 0 && !showAddForm ? (
        <p className="text-gray-500 italic">No spectroscopy data added yet.</p>
      ) : (
        <div className="space-y-6">
          {spectra.map((spectrum) => (
            <div key={spectrum.id} className="border rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="w-48 h-32 bg-gray-100 rounded flex items-center justify-center text-gray-400 border">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getSpectrumTypeColor(
                        spectrum.spectrumType
                      )}`}
                    >
                      {spectrum.spectrumType}
                    </span>
                    <span className="text-sm text-gray-500">{spectrum.fileName}</span>
                  </div>
                  <p className="text-gray-700 font-medium">{spectrum.caption}</p>
                  {spectrum.peakData && Object.keys(spectrum.peakData).length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Key Peaks:</strong>{' '}
                      {Object.entries(spectrum.peakData)
                        .map(([peak, description]) => `${peak}: ${description}`)
                        .join(', ')}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Source: Box (file: {spectrum.fileName})
                  </p>
                </div>
                {editable && (
                  <button
                    onClick={() => onDeleteSpectrum?.(spectrum.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {editable && showAddForm && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-3">Add Spectrum</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={newSpectrum.spectrumType}
              onChange={(e) =>
                setNewSpectrum({
                  ...newSpectrum,
                  spectrumType: e.target.value as SpectrumType,
                })
              }
              className="border rounded px-3 py-2"
            >
              <option value="IR">IR</option>
              <option value="NMR">NMR</option>
              <option value="MS">MS</option>
              <option value="UV-Vis">UV-Vis</option>
            </select>
            <input
              type="text"
              placeholder="Box File ID"
              value={newSpectrum.boxFileId}
              onChange={(e) => setNewSpectrum({ ...newSpectrum, boxFileId: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="File Name"
              value={newSpectrum.fileName}
              onChange={(e) => setNewSpectrum({ ...newSpectrum, fileName: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Caption (e.g., Figure 1: IR Spectrum of Product)"
              value={newSpectrum.caption}
              onChange={(e) => setNewSpectrum({ ...newSpectrum, caption: e.target.value })}
              className="border rounded px-3 py-2 md:col-span-2"
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleAddSpectrum}
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
