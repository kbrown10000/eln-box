import { getAuthenticatedBoxClient } from '@/lib/auth/session';
import { listProjects, listExperiments } from '@/lib/box/folders';

export const getDashboardStats = async () => {
    console.log('Fetching dashboard stats...');
    const client = await getAuthenticatedBoxClient();
    if (!client) {
        // Return zero-state if no auth (or handle error upstream)
        console.warn("Box client not initialized in getDashboardStats");
        return {
            overview: { projects: 0, experiments: 0, users: 0, spectra: 0, avgYield: 0 },
            experimentsByStatus: [],
            recentExperiments: [],
            yieldsData: [],
            spectraByType: [],
            topReagents: [],
        };
    }

    const ancestorFolderId = process.env.BOX_PROJECTS_FOLDER_ID;
    if (!ancestorFolderId) {
        throw new Error("BOX_PROJECTS_FOLDER_ID is not defined");
    }

    // 1. Fetch Projects (Use shared logic with fallback)
    let projects: any[] = [];
    try {
        const result = await listProjects(client, { limit: 100 });
        projects = result.items;
    } catch (e: any) {
        console.error("Failed to list projects for dashboard:", e);
    }

    // 2. Fetch Experiments (Use shared logic)
    let experiments: any[] = [];
    try {
        // Fetch experiments for ALL projects? 
        // listExperiments takes a projectFolderId. 
        // To get a global dashboard, we might need a search. 
        // BUT, let's use the optimized search in listExperiments if possible or a global search here.
        // Since listExperiments is scoped to a project, let's keep the global search logic here BUT make it robust 
        // or iterate projects if the count is small.
        // Actually, for a dashboard, a global search is better.
        
        const enterpriseId = process.env.BOX_ENTERPRISE_ID;
        const expFrom = `enterprise_${enterpriseId}.experimentMetadata`;

        const searchResult = await client.search.searchByMetadataQuery({
          from: expFrom,
          query: "experimentId IS NOT NULL",
          limit: 100,
          ancestorFolderId: ancestorFolderId,
          fields: [
            "name", "created_at", "id",
            `metadata.${expFrom}.experimentId`,
            `metadata.${expFrom}.experimentTitle`,
            `metadata.${expFrom}.status`,
            `metadata.${expFrom}.yield`,
            `metadata.${expFrom}.theoreticalYield`,
            `metadata.${expFrom}.actualYield`,
            `metadata.${expFrom}.keyReagentsIndex`
          ],
          orderBy: [{ fieldKey: "created_at", direction: "desc" }]
        });
        experiments = (searchResult.entries as any[]) || [];
        
    } catch (e: any) {
        console.warn("Failed to search experiments for dashboard:", e.message);
    }

    // 3. Spectra (Keep existing logic but safe)
    let spectraCount = 0;
    const spectraMap: Record<string, number> = {};
    try {
         const enterpriseId = process.env.BOX_ENTERPRISE_ID;
         const specFrom = `enterprise_${enterpriseId}.spectrumMetadata`;
         
        const spectra = await client.search.searchByMetadataQuery({
            from: specFrom,
            query: "technique IS NOT NULL",
            limit: 200,
            ancestorFolderId: ancestorFolderId,
            fields: [`metadata.${specFrom}.technique`]
        });
        const items = (spectra.entries as any[]) || [];
        spectraCount = items.length;
        
        items.forEach((item: any) => {
            const md = item.metadata?.[`enterprise_${enterpriseId}`]?.spectrumMetadata || {};
            const type = md.technique || 'Other';
            spectraMap[type] = (spectraMap[type] || 0) + 1;
        });
    } catch (e: any) {
        console.warn("Failed to fetch spectra metadata:", e.message);
    }

    // 4. Users (Mock for now, as we don't have a user list endpoint ready)
    const userCount = 5; 

    // --- Calculations ---

    const enterpriseId = process.env.BOX_ENTERPRISE_ID;

    // Status Distribution
    const statusMap: Record<string, number> = {};
    experiments.forEach((item: any) => {
        const md = item.metadata?.[`enterprise_${enterpriseId}`]?.experimentMetadata || {};
        const status = md.status || 'draft';
        statusMap[status] = (statusMap[status] || 0) + 1;
    });

    // Avg Yield
    const yieldValues = experiments
        .map((item: any) => item.metadata?.[`enterprise_${enterpriseId}`]?.experimentMetadata?.yield)
        .filter((y: any) => typeof y === 'number');
    const avgYield = yieldValues.length > 0 
        ? (yieldValues.reduce((a: number, b: number) => a + b, 0) / yieldValues.length).toFixed(1)
        : 0;

    // Top Reagents
    const reagentMap: Record<string, number> = {};
    experiments.forEach((item: any) => {
        const md = item.metadata?.[`enterprise_${enterpriseId}`]?.experimentMetadata || {};
        if (md.keyReagentsIndex) {
            const reagents = md.keyReagentsIndex.split(',').map((s: string) => s.trim());
            reagents.forEach((r: string) => {
                if (r) reagentMap[r] = (reagentMap[r] || 0) + 1;
            });
        }
    });
    const topReagents = Object.entries(reagentMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    // Yields Data
    const yieldsData = experiments
        .filter((item: any) => {
            const md = item.metadata?.[`enterprise_${enterpriseId}`]?.experimentMetadata || {};
            return typeof md.yield === 'number';
        })
        .map((item: any) => {
            const md = item.metadata?.[`enterprise_${enterpriseId}`]?.experimentMetadata || {};
            return {
                title: md.experimentTitle || item.name,
                theoretical: md.theoreticalYield || 0,
                actual: md.actualYield || 0,
                percentage: md.yield || 0,
                unit: 'g'
            };
        })
        .sort((a: any, b: any) => b.percentage - a.percentage)
        .slice(0, 10);

    return {
      overview: {
        projects: projects.length,
        experiments: experiments.length,
        users: userCount,
        spectra: spectraCount,
        avgYield: Number(avgYield),
      },
      experimentsByStatus: Object.entries(statusMap).map(([status, count]) => ({ status, count })),
      recentExperiments: experiments.slice(0, 5).map((item: any) => {
          const md = item.metadata?.[`enterprise_${enterpriseId}`]?.experimentMetadata || {};
          return {
            id: md.experimentId || item.id,
            title: md.experimentTitle || item.name,
            status: md.status || 'draft',
            boxFolderId: item.id,
            createdAt: item.createdAt || item.created_at,
          };
      }),
      yieldsData,
      spectraByType: Object.entries(spectraMap).map(([type, count]) => ({ type, count })),
      topReagents,
    };
  };
