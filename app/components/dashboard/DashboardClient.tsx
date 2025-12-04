'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardStats {
  overview: {
    projects: number;
    experiments: number;
    users: number;
    spectra: number;
    avgYield: number;
  };
  experimentsByStatus: Array<{ status: string; count: number }>;
  recentExperiments: Array<{
    id: string;
    title: string;
    status: string;
    boxFolderId: string;
    createdAt: string;
  }>;
  yieldsData: Array<{
    title: string;
    theoretical: number;
    actual: number;
    percentage: number;
    unit: string;
  }>;
  spectraByType: Array<{ type: string; count: number }>;
  topReagents: Array<{ name: string; count: number }>;
}

export default function DashboardClient() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-gray-500">
        Failed to load dashboard data
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'locked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSpectrumColor = (type: string) => {
    switch (type) {
      case 'IR':
        return 'bg-red-500';
      case 'NMR':
        return 'bg-blue-500';
      case 'MS':
        return 'bg-green-500';
      case 'UV-Vis':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Projects</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.overview.projects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Experiments</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.overview.experiments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Spectra</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.overview.spectra}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Researchers</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.overview.users}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg. Yield</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.overview.avgYield}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Experiments */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Experiments</h2>
          </div>
          <div className="divide-y">
            {stats.recentExperiments.map((exp) => (
              <Link
                key={exp.id}
                href={`/experiments/${exp.boxFolderId}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{exp.title}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(exp.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exp.status)}`}>
                    {exp.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Experiment Status Distribution */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Status Distribution</h2>
          </div>
          <div className="p-6 space-y-4">
            {stats.experimentsByStatus.map((item) => {
              const total = stats.experimentsByStatus.reduce((acc, i) => acc + i.count, 0);
              const percentage = total > 0 ? (item.count / total) * 100 : 0;
              return (
                <div key={item.status}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">{item.status}</span>
                    <span className="text-sm text-gray-500">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.status === 'completed' ? 'bg-green-500' :
                        item.status === 'in-progress' ? 'bg-yellow-500' :
                        item.status === 'draft' ? 'bg-gray-400' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Yields and Spectra Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yield Performance */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Yield Performance</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.yieldsData.map((y, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{y.title}</p>
                    <div className="flex items-center mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            y.percentage >= 80 ? 'bg-green-500' :
                            y.percentage >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(y.percentage, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{y.percentage.toFixed(1)}%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {y.actual} / {y.theoretical} {y.unit}
                    </p>
                  </div>
                </div>
              ))}
              {stats.yieldsData.length === 0 && (
                <p className="text-gray-500 text-sm">No yield data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Spectra by Type */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Spectra by Type</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {stats.spectraByType.map((s) => (
                <div key={s.type} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${getSpectrumColor(s.type)} mr-3`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.type}</p>
                    <p className="text-lg font-semibold text-gray-900">{s.count}</p>
                  </div>
                </div>
              ))}
              {stats.spectraByType.length === 0 && (
                <p className="col-span-2 text-gray-500 text-sm">No spectra data available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top Reagents */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Most Used Reagents</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {stats.topReagents.slice(0, 10).map((r, index) => (
              <div key={r.name} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">{index + 1}</span>
                </div>
                <p className="text-sm font-medium text-gray-900 truncate" title={r.name}>{r.name}</p>
                <p className="text-xs text-gray-500">Used {r.count}x</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
