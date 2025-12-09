'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface HubItem {
  id: string;
  type: 'file' | 'folder';
  name: string;
  description?: string;
}

interface KnowledgeBaseData {
  hubId: string;
  name: string;
  items: HubItem[];
  message?: string;
}

export default function KnowledgeBasePage() {
  const [data, setData] = useState<KnowledgeBaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKB = async () => {
      try {
        const res = await fetch('/api/knowledge-base');
        if (!res.ok) throw new Error('Failed to load Knowledge Base');
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchKB();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!data || !data.hubId) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Knowledge Base</h1>
        <p className="text-gray-600">
          {data?.message || 'The Knowledge Base is currently empty or inaccessible.'}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{data.name}</h1>
          <p className="text-gray-600">Central repository for SOPs, SDS, and Lab Manuals.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.items.map((item) => (
          <a 
            key={item.id} 
            href={`https://app.box.com/${item.type === 'folder' ? 'folder' : 'file'}/${item.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-white border rounded-xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${item.type === 'folder' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                {item.type === 'folder' ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <span className="text-xs font-medium text-gray-400 group-hover:text-blue-600 flex items-center">
                Open in Box
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-700">
              {item.name}
            </h3>
            {item.description && (
              <p className="text-sm text-gray-500 line-clamp-2">
                {item.description}
              </p>
            )}
          </a>
        ))}
      </div>

      {data.items.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">No items found in this Knowledge Base.</p>
        </div>
      )}
    </div>
  );
}
