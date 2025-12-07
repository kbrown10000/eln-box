'use client';

import React, { useState } from 'react';
import { generateProtocol } from '@/lib/actions/protocol-generation';

interface ProtocolGeneratorModalProps {
  experimentFolderId: string;
  onClose: () => void;
  onProtocolGenerated: (protocol: { title?: string; objective?: string; hypothesis?: string; steps: Array<{ instruction: string; expectedResult?: string; reagents?: string[] }>; notes?: string }) => void;
}

export default function ProtocolGeneratorModal({
  experimentFolderId,
  onClose,
  onProtocolGenerated,
}: ProtocolGeneratorModalProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const generatedProtocol = await generateProtocol(prompt, experimentFolderId);
      onProtocolGenerated(generatedProtocol);
      onClose(); // Close modal after generation
    } catch (err: any) {
      setError(err.message || 'Failed to generate protocol.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/5 lg:w-2/5 shadow-lg rounded-md bg-white">
        <h3 className="text-xl font-semibold mb-4 text-gray-900">Generate Protocol with AI</h3>

        {error && (
          <div className="bg-red-50 p-3 border-l-4 border-red-400 text-red-700 mb-4">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="protocolPrompt" className="block text-sm font-medium text-gray-700 mb-2">
              Describe the experiment protocol you want to generate:
            </label>
            <textarea
              id="protocolPrompt"
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 'Synthesis of aspirin from salicylic acid and acetic anhydride', 'PCR protocol for DNA amplification'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
            ></textarea>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate Protocol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
