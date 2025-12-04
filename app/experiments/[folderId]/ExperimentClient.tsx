'use client';

import { useState } from 'react';
import { Experiment } from '@/lib/box/types';
import ProtocolSection from '@/app/components/experiment/ProtocolSection';
import ReagentsTable from '@/app/components/experiment/ReagentsTable';
import YieldCalculator from '@/app/components/experiment/YieldCalculator';
import SpectroscopySection from '@/app/components/experiment/SpectroscopySection';
import BoxFileBrowser from '@/app/components/experiment/BoxFileBrowser';

interface ExperimentClientProps {
  experiment: Experiment;
  folderId: string;
  userId: string;
}

// Types for experiment data
interface Reagent {
  id: string;
  name: string;
  amount: number;
  unit: string;
  molarAmount?: number;
  observations?: string;
}

interface Spectrum {
  id: string;
  spectrumType: 'IR' | 'NMR' | 'MS' | 'UV-Vis';
  caption: string;
  boxFileId: string;
  fileName: string;
  peakData?: Record<string, string>;
}

// Mock data for demonstration - in production this would come from the database
const mockProtocolSteps = [
  { id: '1', stepNumber: 1, instruction: 'Weigh 2.0g salicylic acid into a 100mL flask.' },
  { id: '2', stepNumber: 2, instruction: 'Add 5.0mL acetic anhydride and 5 drops conc. H2SO4.' },
  { id: '3', stepNumber: 3, instruction: 'Heat on a water bath at 85°C for 20 min.' },
  { id: '4', stepNumber: 4, instruction: 'Cool and add 50mL cold water.' },
  { id: '5', stepNumber: 5, instruction: 'Filter and recrystallize from ethanol.' },
];

const mockReagents: Reagent[] = [
  {
    id: '1',
    name: 'Salicylic Acid',
    amount: 2.01,
    unit: 'g',
    molarAmount: 0.0145,
    observations: 'White crystalline solid',
  },
];

const mockYieldData = {
  id: '1',
  theoretical: 2.61,
  actual: 2.20,
  percentage: 84.3,
  unit: 'g',
};

const mockSpectra: Spectrum[] = [
  {
    id: '1',
    spectrumType: 'IR',
    caption: 'Figure 1: IR Spectrum of Crude Product',
    boxFileId: '123456',
    fileName: 'IR_spectrum_aspirin_oct26.pdf',
    peakData: { '1750 cm-1': 'Strong peak indicates ester formation' },
  },
];

const mockFiles = [
  { id: '1', name: 'IR_spectrum_aspirin_oct26.pdf', type: 'file' as const, size: 256000 },
  { id: '2', name: 'reaction_notes.docx', type: 'file' as const, size: 18432 },
  { id: '3', name: 'TLC_plate.jpg', type: 'file' as const, size: 460800 },
];

export default function ExperimentClient({
  experiment,
  folderId,
  userId,
}: ExperimentClientProps) {
  // State for data - in production these would be fetched from the database
  const [protocolSteps, setProtocolSteps] = useState(mockProtocolSteps);
  const [reagents, setReagents] = useState(mockReagents);
  const [yieldData, setYieldData] = useState(mockYieldData);
  const [spectra, setSpectra] = useState(mockSpectra);
  const [files, setFiles] = useState(mockFiles);
  const [isEditing, setIsEditing] = useState(false);

  const handleAddProtocolStep = (instruction: string) => {
    const newStep = {
      id: `step-${Date.now()}`,
      stepNumber: protocolSteps.length + 1,
      instruction,
    };
    setProtocolSteps([...protocolSteps, newStep]);
  };

  const handleUpdateProtocolStep = (id: string, instruction: string) => {
    setProtocolSteps(
      protocolSteps.map((step) => (step.id === id ? { ...step, instruction } : step))
    );
  };

  const handleDeleteProtocolStep = (id: string) => {
    setProtocolSteps(protocolSteps.filter((step) => step.id !== id));
  };

  const handleAddReagent = (reagent: Omit<Reagent, 'id'>) => {
    setReagents([...reagents, { ...reagent, id: `reagent-${Date.now()}` }]);
  };

  const handleDeleteReagent = (id: string) => {
    setReagents(reagents.filter((r) => r.id !== id));
  };

  const handleSaveYield = (data: { theoretical: number; actual: number; unit: string }) => {
    setYieldData({
      ...data,
      id: yieldData?.id || `yield-${Date.now()}`,
      percentage: (data.actual / data.theoretical) * 100,
    });
  };

  const handleAddSpectrum = (spectrum: Omit<Spectrum, 'id'>) => {
    setSpectra([...spectra, { ...spectrum, id: `spectrum-${Date.now()}` }]);
  };

  const handleDeleteSpectrum = (id: string) => {
    setSpectra(spectra.filter((s) => s.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'locked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Experiment Header */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Experiment: {experiment.experimentTitle}
            </h1>
            <p className="text-gray-600 mt-1">
              Date: {experiment.startedAt || 'Not started'} | Author:{' '}
              {experiment.ownerName || 'Unknown'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(experiment.status)}`}>
              {experiment.status}
            </span>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded text-sm font-medium ${
                isEditing
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isEditing ? 'Done Editing' : 'Edit'}
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        {experiment.objective && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-600">Objective</h3>
            <p className="text-gray-700 mt-1">{experiment.objective}</p>
          </div>
        )}

        {experiment.hypothesis && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-600">Hypothesis</h3>
            <p className="text-gray-700 mt-1">{experiment.hypothesis}</p>
          </div>
        )}

        {experiment.tags && experiment.tags.length > 0 && (
          <div className="mt-4 flex gap-2">
            {experiment.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Protocol Section */}
      <ProtocolSection
        steps={protocolSteps}
        onAddStep={handleAddProtocolStep}
        onUpdateStep={handleUpdateProtocolStep}
        onDeleteStep={handleDeleteProtocolStep}
        editable={isEditing}
      />

      {/* Results Section */}
      <ReagentsTable
        reagents={reagents}
        onAddReagent={handleAddReagent}
        onDeleteReagent={handleDeleteReagent}
        editable={isEditing}
      />

      {/* Yield Calculator */}
      <YieldCalculator
        yieldData={yieldData}
        onSave={handleSaveYield}
        editable={isEditing}
      />

      {/* Spectroscopy Data */}
      <SpectroscopySection
        spectra={spectra}
        onAddSpectrum={handleAddSpectrum}
        onDeleteSpectrum={handleDeleteSpectrum}
        editable={isEditing}
      />

      {/* Box File Browser */}
      <BoxFileBrowser
        folderId={folderId}
        folderPath={['LabNoteX_Projects', 'Synthesis_of_Aspirin', 'reaction-1_data']}
        files={files}
        onNavigate={(id) => console.log('Navigate to folder:', id)}
        onUpload={(file) => console.log('Upload file:', file.name)}
      />
    </div>
  );
}
