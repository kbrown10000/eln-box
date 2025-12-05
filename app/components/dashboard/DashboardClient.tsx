'use client';

import { useDashboardStats } from '@/lib/hooks/useDashboardStats';
import dynamic from 'next/dynamic';
import { FiHome, FiDroplet, FiBarChart2, FiUsers, FiCheckCircle } from 'react-icons/fi';
import ErrorState from '@/app/components/ErrorState';

const OverviewCard = dynamic(() => import('./cards/OverviewCard'));
const RecentExperimentsCard = dynamic(() => import('./cards/RecentExperimentsCard'));
const StatusDistributionCard = dynamic(() => import('./cards/StatusDistributionCard'));
const YieldPerformanceCard = dynamic(() => import('./cards/YieldPerformanceCard'));
const SpectraByTypeCard = dynamic(() => import('./cards/SpectraByTypeCard'));
const TopReagentsCard = dynamic(() => import('./cards/TopReagentsCard'));

export default function DashboardClient() {
  const { stats, loading, error, refetch } = useDashboardStats(); // Add refetch from hook

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <ErrorState
        message={error?.message || 'We could not load your dashboard data.'}
        onRetry={refetch}
      />
    );
  }

  const overviewData = [
    { title: 'Projects', value: stats.overview.projects, icon: <FiHome className="w-6 h-6" /> },
    { title: 'Experiments', value: stats.overview.experiments, icon: <FiDroplet className="w-6 h-6" /> },
    { title: 'Spectra', value: stats.overview.spectra, icon: <FiBarChart2 className="w-6 h-6" /> },
    { title: 'Researchers', value: stats.overview.users, icon: <FiUsers className="w-6 h-6" /> },
    { title: 'Avg. Yield', value: `${stats.overview.avgYield}%`, icon: <FiCheckCircle className="w-6 h-6" /> },
  ];

  return (
    <div className="space-y-6 font-body">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {overviewData.map((item) => (
          <OverviewCard key={item.title} title={item.title} value={item.value} icon={item.icon} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentExperimentsCard experiments={stats.recentExperiments} />
        <StatusDistributionCard data={stats.experimentsByStatus} />
      </div>

      {/* Yields and Spectra Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <YieldPerformanceCard data={stats.yieldsData} />
        <SpectraByTypeCard data={stats.spectraByType} />
      </div>

      {/* Top Reagents */}
      <TopReagentsCard data={stats.topReagents} />
    </div>
  );
}