import { requireAuth } from '@/lib/auth/session';
import DashboardClient from '../components/dashboard/DashboardClient';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await requireAuth();

  return (
    <div className="bg-secondary min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm font-body text-gray-500 mb-2">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>&gt;</span>
          <span className="font-semibold text-primary">Dashboard</span>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold text-primary">Research Dashboard</h1>
          <p className="mt-1 font-body text-text-body">
            Welcome back, {session.user.name}. Here&apos;s your lab activity overview.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 flex flex-wrap gap-3">
          <Link
            href="/projects"
            className="inline-flex items-center px-4 py-2 bg-accent text-white rounded-md shadow-sm hover:bg-opacity-90 transition-colors font-body"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Experiment
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center px-4 py-2 border border-border-light text-primary rounded-md shadow-sm hover:bg-secondary transition-colors font-body"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            View All Projects
          </Link>
        </div>

        {/* Dashboard Content */}
        <DashboardClient />
      </main>
    </div>
  );
}