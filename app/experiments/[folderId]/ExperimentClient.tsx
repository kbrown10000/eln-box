'use client';

import { useState, useEffect, useCallback } from 'react';
import { Experiment } from '@/lib/box/types';
import ProtocolSection from '@/app/components/experiment/ProtocolSection';
import ReagentsTable from '@/app/components/experiment/ReagentsTable';
import YieldCalculator from '@/app/components/experiment/YieldCalculator';
import SpectroscopySection from '@/app/components/experiment/SpectroscopySection';
import BoxFileBrowser from '@/app/components/experiment/BoxFileBrowser';
import { updateExperimentStatus } from '@/lib/actions/workflow';
import { createSignRequest } from '@/lib/actions/sign';
import { ingestInstrumentFile } from '@/lib/actions/ingestion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import IngestionReview from '@/app/components/experiment/IngestionReview';
import ProtocolGeneratorModal from '@/app/components/experiment/ProtocolGeneratorModal';

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
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(experiment.status);
  const [showInstrumentFilePicker, setShowInstrumentFilePicker] = useState(false);
  const [ingestionResults, setIngestionResults] = useState<any | null>(null);
  const [showProtocolGenerator, setShowProtocolGenerator] = useState(false);

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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const handleSnapshot = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/experiment-data/${folderId}/protocol/snapshot`, {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        alert(`Protocol version ${data.versionNumber} saved successfully.`);
      } else {
        const err = await response.json();
        alert('Failed to save version: ' + err.error);
      }
    } catch (err) {
      console.error('Error creating snapshot:', err);
      alert('Error creating snapshot');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileSelectedForIngestion = async (fileId: string, fileName: string) => {
    setShowInstrumentFilePicker(false);
    setIsSaving(true);
    setIngestionResults(null);

    try {
      const results = await ingestInstrumentFile(fileId, folderId);
      setIngestionResults(results);
      alert(`AI analysis for "${fileName}" complete. Review suggested data.`);
    } catch (err: any) {
      console.error('Error during AI ingestion:', err);
      alert('Failed to ingest file with AI: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyIngestedYields = (yieldsToApply: any[]) => {
    console.log('Applying yields:', yieldsToApply);
    alert('Yields applied (console log for now)');
    setIngestionResults(null);
  };

  const handleApplyIngestedSpectra = (spectraToApply: any[]) => {
    console.log('Applying spectra:', spectraToApply);
    alert('Spectra applied (console log for now)');
    setIngestionResults(null);
  };

  const handleApplyIngestedReagents = (reagentsToApply: any[]) => {
    console.log('Applying reagents:', reagentsToApply);
    alert('Reagents applied (console log for now)');
    setIngestionResults(null);
  };

  const handleCancelIngestion = () => {
    setIngestionResults(null);
  };

  const handleProtocolGenerated = (generatedProtocol: any) => {
    console.log('Generated Protocol:', generatedProtocol);
    generatedProtocol.steps.forEach((step: any) => {
      handleAddProtocolStep(step.instruction);
    });
    alert('AI Generated Protocol added to your experiment. Please review.');
  };

  const handleStatusChange = async (newStatus: any) => {
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
    setIsSaving(true);
    try {
      await updateExperimentStatus(folderId, newStatus);
      window.location.reload(); 
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateAndSign = async () => {
    if (!confirm('This will generate a PDF report and send it for signature. Continue?')) return;
    setIsSaving(true);

    try {
      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.text(experiment.experimentTitle, 14, 20);
      doc.setFontSize(12);
      doc.text(`ID: ${experiment.experimentId}`, 14, 30);
      doc.text(`Author: ${experiment.ownerName}`, 14, 36);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 42);

      doc.setFontSize(14);
      doc.text('Objective', 14, 55);
      doc.setFontSize(10);
      const splitObjective = doc.splitTextToSize(experiment.objective || 'N/A', 180);
      doc.text(splitObjective, 14, 62);

      let yPos = 62 + (splitObjective.length * 5) + 10;

      doc.setFontSize(14);
      doc.text('Protocol', 14, yPos);
      yPos += 8;

      const protocolRows = protocolSteps
        .sort((a, b) => a.stepNumber - b.stepNumber)
        .map(step => [step.stepNumber, step.instruction, step.notes || '']);

      autoTable(doc, {
        startY: yPos,
        head: [['#', 'Instruction', 'Notes']],
        body: protocolRows,
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      doc.setFontSize(14);
      doc.text('Reagents', 14, yPos);
      yPos += 8;

      const reagentRows = reagents.map(r => [
        r.name, 
        `${r.amount} ${r.unit}`, 
        r.molarAmount ? `${r.molarAmount} ${r.unit === 'g' || r.unit === 'mg' ? 'mmol' : ''}` : '-',
        r.observations || ''
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Name', 'Amount', 'Moles', 'Observations']],
        body: reagentRows,
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      if (yieldData) {
         doc.setFontSize(14);
         doc.text('Results', 14, yPos);
         yPos += 8;
         doc.setFontSize(10);
         doc.text(`Theoretical Yield: ${yieldData.theoretical} ${yieldData.unit}`, 14, yPos);
         doc.text(`Actual Yield: ${yieldData.actual} ${yieldData.unit}`, 14, yPos + 6);
         doc.text(`Percentage: ${yieldData.percentage}%`, 14, yPos + 12);
      }

      const pdfBlob = doc.output('blob');
      const formData = new FormData();
      formData.append('file', pdfBlob, `${experiment.experimentId}_Report.pdf`);

      const uploadRes = await fetch(`/api/box/folders/${folderId}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Failed to upload report');
      const uploadedFile = await uploadRes.json();

      const signers = [
          { email: experiment.ownerEmail, role: 'signer' }
      ];

      await createSignRequest(uploadedFile.id, signers as any, folderId);

      alert('Report generated and sent for signature!');

    } catch (err: any) {
      console.error(err);
      alert('Error: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'review':
        return 'bg-purple-100 text-purple-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'locked':
        return 'bg-gray-800 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
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
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentStatus)}`}>
              {currentStatus}
            </span>

            {/* Workflow Actions */}
            {currentStatus === 'draft' && (
              <button
                onClick={() => handleStatusChange('in-progress')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
              >
                Start Experiment
              </button>
            )}
            {currentStatus === 'in-progress' && (
              <button
                onClick={() => handleStatusChange('review')}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium"
              >
                Submit for Review
              </button>
            )}
            {currentStatus === 'review' && (
              <div className="flex gap-2">
                <button
                  onClick={handleGenerateAndSign}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                >
                  Sign & Close
                </button>
                <button
                  onClick={() => handleStatusChange('completed')}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleStatusChange('rejected')}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
                >
                  Reject
                </button>
              </div>
            )}
            {currentStatus === 'completed' && (
              <button
                onClick={() => handleStatusChange('locked')}
                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 text-sm font-medium"
              >
                Lock Record
              </button>
            )}

            {currentStatus !== 'locked' && (
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
            )}
            
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Import Instrument File Button */}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => setShowInstrumentFilePicker(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium"
          >
            Import from Instrument File (AI)
          </button>
          <button
            onClick={() => setShowProtocolGenerator(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-medium"
          >
            Generate Protocol (AI)
          </button>
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
        onSnapshot={handleSnapshot}
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
      />

      {showInstrumentFilePicker && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/5 shadow-lg rounded-md bg-white">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Select Instrument File for AI Ingestion</h3>
            <div className="max-h-96 overflow-y-auto">
              <BoxFileBrowser folderId={folderId} folderPath={['Instrument Files']} onFileSelect={handleFileSelectedForIngestion} />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowInstrumentFilePicker(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {ingestionResults && (
        <IngestionReview
          results={ingestionResults}
          onApplyYields={handleApplyIngestedYields}
          onApplySpectra={handleApplyIngestedSpectra}
          onApplyReagents={handleApplyIngestedReagents}
          onCancel={handleCancelIngestion}
        />
      )}

      {showProtocolGenerator && (
        <ProtocolGeneratorModal
          experimentFolderId={folderId}
          onClose={() => setShowProtocolGenerator(false)}
          onProtocolGenerated={handleProtocolGenerated}
        />
      )}
    </div>
  );
}