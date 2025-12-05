export interface DashboardStats {
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
