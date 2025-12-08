'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProjectForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    projectCode: '',
    projectName: '',
    description: '',
    piName: '',
    piEmail: '',
    department: '',
    status: 'planning',
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
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create project');
      }

      const project = await response.json();
      router.push(`/projects/${project.folderId}`);
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="space-y-6 bg-white p-6 rounded-lg border shadow-sm"
      suppressHydrationWarning
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="projectCode" className="block text-sm font-medium text-gray-700 mb-1">
            Project Code *
          </label>
          <input
            type="text"
            id="projectCode"
            name="projectCode"
            required
            placeholder="e.g., CHEM-2024-003"
            value={formData.projectCode}
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
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
          Project Name *
        </label>
        <input
          type="text"
          id="projectName"
          name="projectName"
          required
          placeholder="e.g., Novel Catalyst Development"
          value={formData.projectName}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Brief description of the project..."
          value={formData.description}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="piName" className="block text-sm font-medium text-gray-700 mb-1">
            Principal Investigator
          </label>
          <input
            type="text"
            id="piName"
            name="piName"
            placeholder="e.g., Dr. Jane Smith"
            value={formData.piName}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="piEmail" className="block text-sm font-medium text-gray-700 mb-1">
            PI Email
          </label>
          <input
            type="email"
            id="piEmail"
            name="piEmail"
            placeholder="e.g., jane.smith@university.edu"
            value={formData.piEmail}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
          Department
        </label>
        <input
          type="text"
          id="department"
          name="department"
          placeholder="e.g., Chemistry, Biology, Physics"
          value={formData.department}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Creating...' : 'Create Project'}
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
