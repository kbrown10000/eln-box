'use client';

import { useState, useEffect, useCallback } from 'react';
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
interface ProtocolStep {
  id: string;
  stepNumber: number;
  instruction: string;
  notes?: string;
}

interface Reagent {
  id: string;
  name: string;
  amount: number;
  unit: string;
  molarAmount?: number;
  observations?: string;
}

interface YieldData {
  id: string;
  theoretical: number;
  actual: number;
  percentage: number;
  unit: string;
  productName?: string;
}

interface Spectrum {
  id: string;
  spectrumType: 'IR' | 'NMR' | 'MS' | 'UV-Vis';
  caption: string;
  boxFileId: string;
  fileName: string;
  peakData?: Record<string, string>;
}

interface BoxFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
}

export default function ExperimentClient({
  experiment,
  folderId,
  userId,
}: ExperimentClientProps) {
  // State for data
  const [protocolSteps, setProtocolSteps] = useState<ProtocolStep[]>([]);
  const [reagents, setReagents] = useState<Reagent[]>([]);
  const [yieldData, setYieldData] = useState<YieldData | null>(null);
  const [spectra, setSpectra] = useState<Spectrum[]>([]);
  const [files, setFiles] = useState<BoxFile[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch experiment data from database
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/experiment-data/${folderId}`);
      if (response.ok) {
        const data = await response.json();

        // Transform database records to component format
        setProtocolSteps(
          data.protocolSteps.map((step: any) => ({
            id: step.id,
            stepNumber: step.stepNumber,
            instruction: step.instruction,
            notes: step.notes,
          }))
        );

        setReagents(
          data.reagents.map((r: any) => ({
            id: r.id,
            name: r.name,
            amount: parseFloat(r.amount) || 0,
            unit: r.unit || 'g',
            molarAmount: r.molarAmount ? parseFloat(r.molarAmount) : undefined,
            observations: r.observations,
          }))
        );

        if (data.yields && data.yields.length > 0) {
          const y = data.yields[0];
          setYieldData({
            id: y.id,
            theoretical: parseFloat(y.theoretical) || 0,
            actual: parseFloat(y.actual) || 0,
            percentage: parseFloat(y.percentage) || 0,
            unit: y.unit || 'g',
            productName: y.productName,
          });
        }

        setSpectra(
          data.spectra.map((s: any) => ({
            id: s.id,
            spectrumType: s.spectrumType,
            caption: s.caption || '',
            boxFileId: s.boxFileId || '',
            fileName: s.title || '',
            peakData: s.peakData || {},
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching experiment data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [folderId]);

  // Fetch Box files
  const fetchFiles = useCallback(async () => {
    try {
      const response = await fetch(`/api/box/folders/${folderId}/items`);
      if (response.ok) {
        const data = await response.json();
        setFiles(
          data.entries?.map((item: any) => ({
            id: item.id,
            name: item.name,
            type: item.type,
            size: item.size,
          })) || []
        );
      }
    } catch (err) {
      console.error('Error fetching files:', err);
    }
  }, [folderId]);

  useEffect(() => {
    fetchData();
    fetchFiles();
  }, [fetchData, fetchFiles]);

  // Protocol step handlers
  const handleAddProtocolStep = async (instruction: string) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/experiment-data/${folderId}/protocol`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction }),
      });

      if (response.ok) {
        const newStep = await response.json();
        setProtocolSteps(prev => [...prev, {
          id: newStep.id,
          stepNumber: newStep.stepNumber,
          instruction: newStep.instruction,
          notes: newStep.notes,
        }]);
      }
    } catch (err) {
      console.error('Error adding step:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateProtocolStep = async (id: string, instruction: string) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/experiment-data/${folderId}/protocol`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, instruction }),
      });

      if (response.ok) {
        setProtocolSteps(prev =>
          prev.map(step => (step.id === id ? { ...step, instruction } : step))
        );
      }
    } catch (err) {
      console.error('Error updating step:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProtocolStep = async (id: string) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/experiment-data/${folderId}/protocol?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProtocolSteps(prev => prev.filter(step => step.id !== id));
      }
    } catch (err) {
      console.error('Error deleting step:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Reagent handlers
  const handleAddReagent = async (reagent: Omit<Reagent, 'id'>) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/experiment-data/${folderId}/reagents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reagent),
      });

      if (response.ok) {
        const newReagent = await response.json();
        setReagents(prev => [...prev, {
          id: newReagent.id,
          name: newReagent.name,
          amount: parseFloat(newReagent.amount) || 0,
          unit: newReagent.unit,
          molarAmount: newReagent.molarAmount ? parseFloat(newReagent.molarAmount) : undefined,
          observations: newReagent.observations,
        }]);
      }
    } catch (err) {
      console.error('Error adding reagent:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteReagent = async (id: string) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/experiment-data/${folderId}/reagents?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setReagents(prev => prev.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error('Error deleting reagent:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Yield handler
  const handleSaveYield = async (data: { theoretical: number; actual: number; unit: string }) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/experiment-data/${folderId}/yields`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const savedYield = await response.json();
        setYieldData({
          id: savedYield.id,
          theoretical: parseFloat(savedYield.theoretical) || 0,
          actual: parseFloat(savedYield.actual) || 0,
          percentage: parseFloat(savedYield.percentage) || 0,
          unit: savedYield.unit,
          productName: savedYield.productName,
        });
      }
    } catch (err) {
      console.error('Error saving yield:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Spectrum handlers
  const handleAddSpectrum = async (spectrum: Omit<Spectrum, 'id'>) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/experiment-data/${folderId}/spectra`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spectrum),
      });

      if (response.ok) {
        const newSpectrum = await response.json();
        setSpectra(prev => [...prev, {
          id: newSpectrum.id,
          spectrumType: newSpectrum.spectrumType,
          caption: newSpectrum.caption || '',
          boxFileId: newSpectrum.boxFileId || '',
          fileName: newSpectrum.title || '',
          peakData: newSpectrum.peakData || {},
        }]);
      }
    } catch (err) {
      console.error('Error adding spectrum:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSpectrum = async (id: string) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/experiment-data/${folderId}/spectra?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSpectra(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error('Error deleting spectrum:', err);
    } finally {
      setIsSaving(false);
    }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading experiment data...</p>
        </div>
      </div>
    );
  }

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
            {isSaving && (
              <span className="text-sm text-gray-500 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Saving...
              </span>
            )}
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

      {/* Reagents Table */}
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
        folderPath={['LabNoteX_Projects', experiment.experimentTitle || 'Experiment']}
        files={files}
        onNavigate={(id) => console.log('Navigate to folder:', id)}
        onFileUploaded={fetchFiles}
      />
    </div>
  );
}
