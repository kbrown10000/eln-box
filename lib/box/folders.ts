import type { BoxClient } from './client';
import { Project, Experiment } from './types';

/**
 * Helper to ensure dates are always strings (for serialization)
 */
function toDateString(date: any): string {
  if (!date) return '';
  if (typeof date === 'string') return date;
  if (date instanceof Date) return date.toISOString();
  
  // Attempt to parse standard date strings or timestamps
  const parsed = new Date(date);
  if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
  }
  
  return '';
}

/**
 * Get the projects folder ID from environment
 * Fails fast if not configured (validation happens in getBoxClient)
 */
function getProjectsFolderId(): string {
  const folderId = process.env.BOX_PROJECTS_FOLDER_ID;
  if (!folderId || folderId === '0') {
    throw new Error(
      'BOX_PROJECTS_FOLDER_ID is not configured or set to "0". ' +
      'Run npm run setup-box-folders to create the folder structure.'
    );
  }
  return folderId;
}

/**
 * Create a new project folder with metadata
 */
export async function createProject(client: BoxClient, project: Omit<Project, 'folderId'>): Promise<Project> {
  const projectsFolderId = getProjectsFolderId();

  // 1. Create folder under /Projects
  const folder = await client.folders.createFolder({
    parent: { id: projectsFolderId },
    name: `${project.projectCode}-${project.projectName.replace(/\s+/g, '-')}`
  });

  // 2. Create subfolders
  await client.folders.createFolder({
    parent: { id: folder.id },
    name: 'Experiments'
  });

  // 3. Apply metadata template
  try {
    const metadata: any = {
      projectCode: project.projectCode,
      projectName: project.projectName,
      piName: project.piName,
      piEmail: project.piEmail,
      department: project.department,
      status: project.status,
      description: project.description,
    };
    if (project.startDate) metadata.startDate = project.startDate;

    console.log('DEBUG: Applying project metadata:', JSON.stringify(metadata));
    await client.folderMetadata.createFolderMetadataById(folder.id, 'enterprise', 'projectMetadata', metadata);
  } catch (error: any) {
    console.warn('Failed to apply metadata template:', error.message || String(error));
  }

  return {
    folderId: folder.id,
    ...project,
  };
}

/**
 * Get project by folder ID
 */
export async function getProject(client: BoxClient, folderId: string): Promise<Project> {
  try {
    const metadata: any = await client.folderMetadata.getFolderMetadataById(folderId, 'enterprise', 'projectMetadata');
    console.log(`DEBUG: getProject ${folderId} raw metadata:`, JSON.stringify(metadata));

    const data = metadata.extraData || metadata; // Handle extraData wrapper if present

    return {
      folderId,
      projectCode: data.projectCode,
      projectName: data.projectName,
      piName: data.piName,
      piEmail: data.piEmail,
      department: data.department,
      startDate: toDateString(data.startDate),
      status: data.status,
      description: data.description,
    };
  } catch (error: any) {
    console.warn(`DEBUG: Failed to get metadata for project ${folderId}:`, error.message || String(error));
    // If metadata doesn't exist, fall back to folder name parsing
    const folder = await client.folders.getFolderById(folderId);
    const nameParts = folder.name!.split('-');
    const projectCode = nameParts[0] || 'UNKNOWN';
    const projectName = nameParts.slice(1).join(' ') || folder.name!;

    return {
      folderId,
      projectCode,
      projectName,
      piName: '',
      piEmail: '',
      department: '',
      startDate: toDateString(folder.createdAt || new Date()),
      status: 'planning',
      description: '',
    };
  }
}

/**
 * Pagination options for list operations
 */
export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  limit: number;
  offset: number;
}

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

/**
 * List all projects (query Box for folders with projectMetadata)
 */
export async function listProjects(
  client: BoxClient,
  options: PaginationOptions = {}
): Promise<PaginatedResult<Project>> {
  const limit = Math.min(options.limit || DEFAULT_LIMIT, MAX_LIMIT);
  const offset = options.offset || 0;

  // Fallback logic using N+1 iteration (reliable but slow)
  const executeFallback = async () => {
    const projectsFolderId = getProjectsFolderId();
    const items = await client.folders.getFolderItems(projectsFolderId, {
      // limit, offset // Removed to match strict type
    });

    const projects: Project[] = [];
    for (const item of items.entries || []) {
      if (item.type === 'folder') {
        try {
          const project = await getProject(client, item.id);
          projects.push(project);
        } catch (error) {
          console.error(`Failed to get project ${item.id}:`, error);
        }
      }
    }
    return {
      items: projects,
      totalCount: items.totalCount || items.entries?.length || 0,
      limit,
      offset,
    };
  };

  // If using offset pagination, fallback (Metadata Query uses markers)
  if (offset > 0) {
    return executeFallback();
  }

  try {
    const projectsFolderId = getProjectsFolderId();
    
    // Optimistic Metadata Query
    const enterpriseId = process.env.BOX_ENTERPRISE_ID;
    const from = `enterprise_${enterpriseId}.projectMetadata`;

    const results = await client.search.searchByMetadataQuery({
      from,
      ancestorFolderId: projectsFolderId,
      query: "projectCode IS NOT NULL",
      fields: [
        "name", "created_at", 
        `metadata.${from}.projectCode`,
        `metadata.${from}.projectName`,
        `metadata.${from}.piName`,
        `metadata.${from}.piEmail`,
        `metadata.${from}.department`,
        `metadata.${from}.startDate`,
        `metadata.${from}.status`,
        `metadata.${from}.description`
      ],
      limit
    });

    console.log(`DEBUG: listProjects Search Found ${results.entries?.length || 0} items`);

    const projects = (results.entries || []).map((item: any) => {
      // Robust metadata extraction
      const md = item.metadata?.extraData || 
                 item.metadata?.[`enterprise_${enterpriseId}`]?.projectMetadata || 
                 item.metadata?.projectMetadata || 
                 {};

      // Fallback: Parse name if metadata is missing or incomplete
      let projectCode = md.projectCode;
      let projectName = md.projectName;

      if (!projectCode || projectCode === 'UNKNOWN' || !projectName) {
          const nameParts = item.name.split('-');
          if (!projectCode || projectCode === 'UNKNOWN') {
              projectCode = nameParts[0] || 'UNKNOWN';
          }
          if (!projectName) {
              projectName = nameParts.slice(1).join(' ') || item.name;
          }
      }

      return {
        folderId: item.id,
        projectCode: projectCode,
        projectName: projectName,
        piName: md.piName || '',
        piEmail: md.piEmail || '',
        department: md.department || '',
        startDate: toDateString(md.startDate || item.createdAt || item.created_at),
        status: md.status || 'planning',
        description: md.description || ''
      };
    });

    // Force fallback if metadata query returns 0 results (likely indexing delay)
    if (projects.length === 0) {
        console.log("Metadata query returned 0 results. Falling back to folder traversal.");
        return executeFallback();
    }

    return {
      items: projects,
      totalCount: projects.length, // Approximate
      limit,
      offset
    };

  } catch (error) {
    // Fallback on any error (API error, missing index, SDK mismatch)
    console.warn("Metadata Query optimization failed, using fallback:", error);
    return executeFallback();
  }
}

/**
 * Update project metadata
 */
export async function updateProject(
  client: BoxClient,
  folderId: string,
  updates: Partial<Omit<Project, 'folderId'>>
): Promise<Project> {

  const operations: any[] = [];

  if (updates.status !== undefined) {
    operations.push({ op: 'replace', path: '/status', value: updates.status });
  }
  if (updates.projectName !== undefined) {
    operations.push({ op: 'replace', path: '/projectName', value: updates.projectName });
  }
  if (updates.piName !== undefined) {
    operations.push({ op: 'replace', path: '/piName', value: updates.piName });
  }
  if (updates.piEmail !== undefined) {
    operations.push({ op: 'replace', path: '/piEmail', value: updates.piEmail });
  }
  if (updates.department !== undefined) {
    operations.push({ op: 'replace', path: '/department', value: updates.department });
  }
  if (updates.description !== undefined) {
    operations.push({ op: 'replace', path: '/description', value: updates.description });
  }

  if (operations.length > 0) {
    try {
      await client.folderMetadata.updateFolderMetadataById(
        folderId,
        'enterprise',
        'projectMetadata',
        operations
      );
    } catch (error) {
      console.error('Failed to update metadata:', error);
    }
  }

  return getProject(client, folderId);
}

/**
 * Create experiment under a project
 */
export async function createExperiment(
  client: BoxClient,
  projectFolderId: string,
  experiment: Omit<Experiment, 'folderId'>
): Promise<Experiment> {
  // Find Experiments subfolder
  const items = await client.folders.getFolderItems(projectFolderId);
  const experimentsFolder = items.entries?.find((e: any) => e.name === 'Experiments');

  if (!experimentsFolder) {
    throw new Error('Experiments folder not found');
  }

  // Create experiment folder
  const folder = await client.folders.createFolder({
    parent: { id: experimentsFolder.id },
    name: `${experiment.experimentId}-${experiment.experimentTitle.replace(/\s+/g, '-')}`
  });

  // Create subfolders
  await client.folders.createFolder({ parent: { id: folder.id }, name: 'Entries' });
  const attachmentsFolder = await client.folders.createFolder({ parent: { id: folder.id }, name: 'Attachments' });

  // Create subfolders under Attachments
  await client.folders.createFolder({ parent: { id: attachmentsFolder.id }, name: 'Raw-Data' });
  await client.folders.createFolder({ parent: { id: attachmentsFolder.id }, name: 'Images' });
  await client.folders.createFolder({ parent: { id: attachmentsFolder.id }, name: 'Reports' });

  // Apply metadata
  try {
    const metadata: any = {
      experimentId: experiment.experimentId,
      experimentTitle: experiment.experimentTitle,
      objective: experiment.objective,
      hypothesis: experiment.hypothesis,
      ownerName: experiment.ownerName,
      ownerEmail: experiment.ownerEmail,
      status: experiment.status,
    };
    const VALID_TAGS = ['synthesis', 'analysis', 'characterization', 'purification', 'validation'];
    if (experiment.tags) {
        const validTags = experiment.tags.filter(t => VALID_TAGS.includes(t.toLowerCase()));
        if (validTags.length > 0) {
            metadata.tags = validTags;
        }
    }

    console.log('DEBUG: Applying experiment metadata:', JSON.stringify(metadata));
    await client.folderMetadata.createFolderMetadataById(folder.id, 'enterprise', 'experimentMetadata', metadata);
  } catch (error: any) {
    console.warn('Failed to apply experiment metadata template:', error.message || String(error));
  }

  return {
    folderId: folder.id,
    ...experiment,
  };
}

/**
 * Get experiment by folder ID
 */
export async function getExperiment(client: BoxClient, folderId: string): Promise<Experiment> {
  try {
    const metadata: any = await client.folderMetadata.getFolderMetadataById(folderId, 'enterprise', 'experimentMetadata');

    const experiment = {
      folderId,
      experimentId: metadata.experimentId,
      experimentTitle: metadata.experimentTitle,
      objective: metadata.objective,
      hypothesis: metadata.hypothesis,
      ownerName: metadata.ownerName,
      ownerEmail: metadata.ownerEmail,
      startedAt: toDateString(metadata.startedAt),
      completedAt: toDateString(metadata.completedAt),
      status: metadata.status,
      tags: metadata.tags || [],
    };
    
    // Ensure strict serializability
    return JSON.parse(JSON.stringify(experiment));

  } catch (error) {
    // Fallback to folder name parsing
    const folder = await client.folders.getFolderById(folderId);
    const nameParts = folder.name!.split('-');
    const experimentId = nameParts[0] || 'UNKNOWN';
    const experimentTitle = nameParts.slice(1).join(' ') || folder.name!;

    const fallback = {
      folderId,
      experimentId,
      experimentTitle,
      objective: '',
      hypothesis: '',
      ownerName: '',
      ownerEmail: '',
      status: 'draft',
      tags: [],
    };
    return JSON.parse(JSON.stringify(fallback));
  }
}

/**
 * List experiments in a project
 */
export async function listExperiments(
  client: BoxClient,
  projectFolderId: string,
  options: PaginationOptions = {}
): Promise<PaginatedResult<Experiment>> {
  const limit = Math.min(options.limit || DEFAULT_LIMIT, MAX_LIMIT);
  const offset = options.offset || 0;

  // Find Experiments subfolder first (needed for both methods)
  // We could optimize this too, but it's just one call.
  let experimentsFolderId: string | null = null;
  try {
      const items = await client.folders.getFolderItems(projectFolderId);
      const experimentsFolder = items.entries?.find((e: any) => e.name === 'Experiments');
      if (experimentsFolder) {
          experimentsFolderId = experimentsFolder.id;
      }
  } catch (e) {
      console.warn('Failed to find Experiments folder:', e);
  }

  if (!experimentsFolderId) {
    return { items: [], totalCount: 0, limit, offset };
  }

  // Fallback logic
  const executeFallback = async () => {
      const experimentItems = await client.folders.getFolderItems(experimentsFolderId!, {
        
      });
    
      const experiments: Experiment[] = [];
    
      for (const item of experimentItems.entries || []) {
        if (item.type === 'folder') {
          try {
            const experiment = await getExperiment(client, item.id);
            experiments.push(experiment);
          } catch (error) {
            console.error(`Failed to get experiment ${item.id}:`, error);
          }
        }
      }
    
      return {
        items: JSON.parse(JSON.stringify(experiments)),
        totalCount: experimentItems.totalCount || experimentItems.entries?.length || 0,
        limit,
        offset,
      };
  };

  if (offset > 0) return executeFallback();

  try {
    // Optimistic Metadata Query
    const enterpriseId = process.env.BOX_ENTERPRISE_ID;
    const from = `enterprise_${enterpriseId}.experimentMetadata`;

    const results = await client.search.searchByMetadataQuery({
      from,
      ancestorFolderId: experimentsFolderId,
      query: "experimentId IS NOT NULL", // Basic filter
      fields: [
        "name", "created_at",
        `metadata.${from}.experimentId`,
        `metadata.${from}.experimentTitle`,
        `metadata.${from}.objective`,
        `metadata.${from}.hypothesis`,
        `metadata.${from}.ownerName`,
        `metadata.${from}.ownerEmail`,
        `metadata.${from}.startedAt`,
        `metadata.${from}.completedAt`,
        `metadata.${from}.status`,
        `metadata.${from}.tags`
      ],
      limit
    });

    const experiments = (results.entries || []).map((item: any) => {
      const md = item.metadata?.[`enterprise_${enterpriseId}`]?.experimentMetadata || {};
      return {
        folderId: item.id,
        experimentId: md.experimentId || 'UNKNOWN',
        experimentTitle: md.experimentTitle || item.name,
        objective: md.objective || '',
        hypothesis: md.hypothesis || '',
        ownerName: md.ownerName || '',
        ownerEmail: md.ownerEmail || '',
        startedAt: toDateString(md.startedAt),
        completedAt: toDateString(md.completedAt),
        status: md.status || 'draft',
        tags: md.tags || [],
      };
    });

    return JSON.parse(JSON.stringify({
      items: experiments,
      totalCount: experiments.length,
      limit,
      offset
    }));

  } catch (error) {
    console.warn("Metadata Query optimization failed for experiments, using fallback:", error);
    return executeFallback();
  }
}

/**
 * Update experiment metadata
 */
export async function updateExperiment(
  client: BoxClient,
  folderId: string,
  updates: Partial<Omit<Experiment, 'folderId'>>
): Promise<Experiment> {

  const operations: any[] = [];

  if (updates.status !== undefined) {
    operations.push({ op: 'replace', path: '/status', value: updates.status });
  }
  if (updates.experimentTitle !== undefined) {
    operations.push({ op: 'replace', path: '/experimentTitle', value: updates.experimentTitle });
  }
  if (updates.objective !== undefined) {
    operations.push({ op: 'replace', path: '/objective', value: updates.objective });
  }
  if (updates.hypothesis !== undefined) {
    operations.push({ op: 'replace', path: '/hypothesis', value: updates.hypothesis });
  }
  if (updates.ownerName !== undefined) {
    operations.push({ op: 'replace', path: '/ownerName', value: updates.ownerName });
  }
  if (updates.ownerEmail !== undefined) {
    operations.push({ op: 'replace', path: '/ownerEmail', value: updates.ownerEmail });
  }
  if (updates.completedAt !== undefined) {
    operations.push({ op: 'replace', path: '/completedAt', value: updates.completedAt });
  }
  if (updates.tags !== undefined) {
    operations.push({ op: 'replace', path: '/tags', value: updates.tags });
  }

  if (operations.length > 0) {
    try {
      await client.folderMetadata.updateFolderMetadataById(
        folderId,
        'enterprise',
        'experimentMetadata',
        operations
      );
    } catch (error) {
      console.error('Failed to update experiment metadata:', error);
    }
  }

  return getExperiment(client, folderId);
}