'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface NewExperimentFormProps {
  projectFolderId: string;
  projectName: string;
}

export default function NewExperimentForm({ projectFolderId, projectName }: NewExperimentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    experimentId: '',
    experimentTitle: '',
    objective: '',
    hypothesis: '',
    status: 'draft',
    tags: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectFolderId}/experiments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create experiment');
      }

      const experiment = await response.json();
      router.push(`/experiments/${experiment.folderId}`);
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border shadow-sm">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="experimentId" className="block text-sm font-medium text-gray-700 mb-1">
            Experiment ID *
          </label>
          <input
            type="text"
            id="experimentId"
            name="experimentId"
            required
            placeholder="e.g., EXP-006"
            value={formData.experimentId}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="draft">Draft</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="locked">Locked</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="experimentTitle" className="block text-sm font-medium text-gray-700 mb-1">
          Experiment Title *
        </label>
        <input
          type="text"
          id="experimentTitle"
          name="experimentTitle"
          required
          placeholder="e.g., Synthesis of Compound X via Reduction"
          value={formData.experimentTitle}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="objective" className="block text-sm font-medium text-gray-700 mb-1">
          Objective
        </label>
        <textarea
          id="objective"
          name="objective"
          rows={2}
          placeholder="What is the goal of this experiment?"
          value={formData.objective}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="hypothesis" className="block text-sm font-medium text-gray-700 mb-1">
          Hypothesis
        </label>
        <textarea
          id="hypothesis"
          name="hypothesis"
          rows={2}
          placeholder="What do you expect to happen?"
          value={formData.hypothesis}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          placeholder="e.g., organic, synthesis, catalyst (comma-separated)"
          value={formData.tags}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">Separate multiple tags with commas</p>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Creating...' : 'Create Experiment'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
