import type { BoxClient } from './client';
import { Project, Experiment } from './types';

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
    await client.folderMetadata.createFolderMetadataById(folder.id, 'enterprise', 'projectMetadata', {
      projectCode: project.projectCode,
      projectName: project.projectName,
      piName: project.piName,
      piEmail: project.piEmail,
      department: project.department,
      startDate: project.startDate,
      status: project.status,
      description: project.description,
    });
  } catch (error) {
    console.warn('Failed to apply metadata template. This is normal if the template does not exist yet:', error);
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

    return {
      folderId,
      projectCode: metadata.projectCode,
      projectName: metadata.projectName,
      piName: metadata.piName,
      piEmail: metadata.piEmail,
      department: metadata.department,
      startDate: metadata.startDate,
      status: metadata.status,
      description: metadata.description,
    };
  } catch (error) {
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
      startDate: folder.createdAt ? String(folder.createdAt) : new Date().toISOString(),
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
      // fields: ['name', 'created_at', 'modified_at'], // Removed fields
      // limit, offset // Removed standard options that might not be in strict type or supported in getFolderItems signature directly if different
    });

    const projects: Project[] = [];
    for (const item of items.entries || []) { // Added optional chaining/fallback
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
    // Note: This requires the template to be indexed.

    const results = await client.search.searchByMetadataQuery({
      from: "enterprise.projectMetadata",
      ancestorFolderId: projectsFolderId,
      query: "projectCode IS NOT NULL",
      fields: [
        "name", "created_at", 
        "metadata.enterprise.projectMetadata.projectCode",
        "metadata.enterprise.projectMetadata.projectName",
        "metadata.enterprise.projectMetadata.piName",
        "metadata.enterprise.projectMetadata.piEmail",
        "metadata.enterprise.projectMetadata.department",
        "metadata.enterprise.projectMetadata.startDate",
        "metadata.enterprise.projectMetadata.status",
        "metadata.enterprise.projectMetadata.description"
      ],
      limit
    });

    const projects = (results.entries || []).map((item: any) => {
      const md = item.metadata?.enterprise?.projectMetadata || {};
      // Map metadata to Project type
      return {
        folderId: item.id,
        projectCode: md.projectCode || 'UNKNOWN',
        projectName: md.projectName || item.name,
        piName: md.piName || '',
        piEmail: md.piEmail || '',
        department: md.department || '',
        startDate: md.startDate || item.createdAt || item.created_at,
        status: md.status || 'planning',
        description: md.description || ''
      };
    });

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
    await client.folderMetadata.createFolderMetadataById(folder.id, 'enterprise', 'experimentMetadata', {
      experimentId: experiment.experimentId,
      experimentTitle: experiment.experimentTitle,
      objective: experiment.objective,
      hypothesis: experiment.hypothesis,
      ownerName: experiment.ownerName,
      ownerEmail: experiment.ownerEmail,
      status: experiment.status,
      tags: experiment.tags,
    });
  } catch (error) {
    console.warn('Failed to apply experiment metadata template:', error);
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

    return {
      folderId,
      experimentId: metadata.experimentId,
      experimentTitle: metadata.experimentTitle,
      objective: metadata.objective,
      hypothesis: metadata.hypothesis,
      ownerName: metadata.ownerName,
      ownerEmail: metadata.ownerEmail,
      startedAt: metadata.startedAt,
      completedAt: metadata.completedAt,
      status: metadata.status,
      tags: metadata.tags || [],
    };
  } catch (error) {
    // Fallback to folder name parsing
    const folder = await client.folders.getFolderById(folderId);
    const nameParts = folder.name!.split('-');
    const experimentId = nameParts[0] || 'UNKNOWN';
    const experimentTitle = nameParts.slice(1).join(' ') || folder.name!;

    return {
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
        items: experiments,
        totalCount: experimentItems.totalCount || experimentItems.entries?.length || 0,
        limit,
        offset,
      };
  };

  if (offset > 0) return executeFallback();

  try {
    // Optimistic Metadata Query
    const results = await client.search.searchByMetadataQuery({
      from: "enterprise.experimentMetadata",
      ancestorFolderId: experimentsFolderId,
      query: "experimentId IS NOT NULL", // Basic filter
      fields: [
        "name", "created_at",
        "metadata.enterprise.experimentMetadata.experimentId",
        "metadata.enterprise.experimentMetadata.experimentTitle",
        "metadata.enterprise.experimentMetadata.objective",
        "metadata.enterprise.experimentMetadata.hypothesis",
        "metadata.enterprise.experimentMetadata.ownerName",
        "metadata.enterprise.experimentMetadata.ownerEmail",
        "metadata.enterprise.experimentMetadata.startedAt",
        "metadata.enterprise.experimentMetadata.completedAt",
        "metadata.enterprise.experimentMetadata.status",
        "metadata.enterprise.experimentMetadata.tags"
      ],
      limit
    });

    const experiments = (results.entries || []).map((item: any) => {
      const md = item.metadata?.enterprise?.experimentMetadata || {};
      return {
        folderId: item.id,
        experimentId: md.experimentId || 'UNKNOWN',
        experimentTitle: md.experimentTitle || item.name,
        objective: md.objective || '',
        hypothesis: md.hypothesis || '',
        ownerName: md.ownerName || '',
        ownerEmail: md.ownerEmail || '',
        startedAt: md.startedAt,
        completedAt: md.completedAt,
        status: md.status || 'draft',
        tags: md.tags || [],
      };
    });

    return {
      items: experiments,
      totalCount: experiments.length,
      limit,
      offset
    };

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
