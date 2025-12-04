import ProjectsOverview from "../components/ProjectsOverview";
import CollaborationFeed from "../components/CollaborationFeed";
import RecentExperiments from "../components/RecentExperiments";
import ResourceBooking from "../components/ResourceBooking";
import DataManagement from "../components/DataManagement";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>Dashboard</span>
          <span>&gt;</span>
          <span className="font-semibold text-gray-700">Overview</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <ProjectsOverview />
          </div>
          <div className="lg:col-span-1">
            <CollaborationFeed />
          </div>
          <div className="lg:col-span-3">
            <RecentExperiments />
          </div>
          <div className="lg:col-span-2">
            <ResourceBooking />
          </div>
          <div className="lg:col-span-1">
            <DataManagement />
          </div>
        </div>
      </main>
    </div>
  );
}