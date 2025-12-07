'use client';

import React from 'react';

interface IngestionReviewProps {
  results: {
    yields?: Array<{ productName?: string; theoretical?: number; actual?: number; percentage?: number; unit?: string }>;
    spectra?: Array<{ spectrumType: string; title: string; caption?: string; peakData?: Record<string, string> }>;
    reagents?: Array<{ name: string; amount?: number; unit?: string; molarAmount?: number; observations?: string }>;
    notes?: string;
  };
  onApplyYields: (yields: any[]) => void;
  onApplySpectra: (spectra: any[]) => void;
  onApplyReagents: (reagents: any[]) => void;
  onCancel: () => void;
}

export default function IngestionReview({
  results,
  onApplyYields,
  onApplySpectra,
  onApplyReagents,
  onCancel,
}: IngestionReviewProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/5 shadow-lg rounded-md bg-white">
        <h3 className="text-xl font-semibold mb-4 text-gray-900">AI Ingestion Results Review</h3>
        <p className="text-gray-600 mb-6">Review the data extracted by AI. Apply sections to update your experiment.</p>

        {results.yields && results.yields.length > 0 && (
          <div className="mb-6 border p-4 rounded-md bg-gray-50">
            <h4 className="text-lg font-medium mb-3">Suggested Yields</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Theoretical</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.yields.map((y, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{y.productName || 'N/A'}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{y.theoretical || 'N/A'}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{y.actual || 'N/A'}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{y.percentage || 'N/A'}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{y.unit || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => onApplyYields(results.yields || [])}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              Apply Yields
            </button>
          </div>
        )}

        {results.spectra && results.spectra.length > 0 && (
          <div className="mb-6 border p-4 rounded-md bg-gray-50">
            <h4 className="text-lg font-medium mb-3">Suggested Spectra</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Caption</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peak Data</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.spectra.map((s, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{s.spectrumType}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{s.title}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{s.caption || 'N/A'}</td>
                      <td className="px-3 py-2 text-sm text-gray-500">
                        <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(s.peakData, null, 2)}</pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => onApplySpectra(results.spectra || [])}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              Apply Spectra
            </button>
          </div>
        )}

        {results.reagents && results.reagents.length > 0 && (
          <div className="mb-6 border p-4 rounded-md bg-gray-50">
            <h4 className="text-lg font-medium mb-3">Suggested Reagents</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Molar Amount</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observations</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.reagents.map((r, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{r.name}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{r.amount || 'N/A'}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{r.unit || 'N/A'}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{r.molarAmount || 'N/A'}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{r.observations || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => onApplyReagents(results.reagents || [])}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              Apply Reagents
            </button>
          </div>
        )}

        {results.notes && (
          <div className="mb-6 border p-4 rounded-md bg-gray-50">
            <h4 className="text-lg font-medium mb-3">AI Notes</h4>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">{results.notes}</p>
          </div>
        )}
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm"
          >
            Cancel Review
          </button>
        </div>
      </div>
    </div>
  );
}
