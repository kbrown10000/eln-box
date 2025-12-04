import { getBoxClient } from './client';
import { Project, Experiment } from './types';

const PROJECTS_FOLDER_ID = process.env.BOX_PROJECTS_FOLDER_ID || '0';

/**
 * Create a new project folder with metadata
 */
export async function createProject(project: Omit<Project, 'folderId'>): Promise<Project> {
  const client = getBoxClient();

  // 1. Create folder under /Projects
  const folder = await client.folders.create(
    PROJECTS_FOLDER_ID,
    `${project.projectCode}-${project.projectName.replace(/\s+/g, '-')}`
  );

  // 2. Create subfolders
  await client.folders.create(folder.id, 'Experiments');

  // 3. Apply metadata template
  try {
    await client.metadata.createMetadataOnFolder(folder.id, 'enterprise', 'projectMetadata', {
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
export async function getProject(folderId: string): Promise<Project> {
  const client = getBoxClient();

  try {
    const metadata = await client.metadata.getMetadataOnFolder(folderId, 'enterprise', 'projectMetadata');

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
    const folder = await client.folders.get(folderId);
    const nameParts = folder.name.split('-');
    const projectCode = nameParts[0] || 'UNKNOWN';
    const projectName = nameParts.slice(1).join(' ') || folder.name;

    return {
      folderId,
      projectCode,
      projectName,
      piName: '',
      piEmail: '',
      department: '',
      startDate: folder.created_at,
      status: 'planning',
      description: '',
    };
  }
}

/**
 * List all projects (query Box for folders with projectMetadata)
 */
export async function listProjects(): Promise<Project[]> {
  const client = getBoxClient();

  // Get all folders in the Projects folder
  const items = await client.folders.getItems(PROJECTS_FOLDER_ID, {
    fields: 'name,created_at,modified_at',
    limit: 1000,
  });

  const projects: Project[] = [];

  for (const item of items.entries) {
    if (item.type === 'folder') {
      try {
        const project = await getProject(item.id);
        projects.push(project);
      } catch (error) {
        console.error(`Failed to get project ${item.id}:`, error);
      }
    }
  }

  return projects;
}

/**
 * Update project metadata
 */
export async function updateProject(
  folderId: string,
  updates: Partial<Omit<Project, 'folderId'>>
): Promise<Project> {
  const client = getBoxClient();

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
      await client.metadata.updateMetadataOnFolder(
        folderId,
        'enterprise',
        'projectMetadata',
        operations
      );
    } catch (error) {
      console.error('Failed to update metadata:', error);
    }
  }

  return getProject(folderId);
}

/**
 * Create experiment under a project
 */
export async function createExperiment(
  projectFolderId: string,
  experiment: Omit<Experiment, 'folderId'>
): Promise<Experiment> {
  const client = getBoxClient();

  // Find Experiments subfolder
  const items = await client.folders.getItems(projectFolderId);
  const experimentsFolder = items.entries.find((e: any) => e.name === 'Experiments');

  if (!experimentsFolder) {
    throw new Error('Experiments folder not found');
  }

  // Create experiment folder
  const folder = await client.folders.create(
    experimentsFolder.id,
    `${experiment.experimentId}-${experiment.experimentTitle.replace(/\s+/g, '-')}`
  );

  // Create subfolders
  await client.folders.create(folder.id, 'Entries');
  const attachmentsFolder = await client.folders.create(folder.id, 'Attachments');

  // Create subfolders under Attachments
  await client.folders.create(attachmentsFolder.id, 'Raw-Data');
  await client.folders.create(attachmentsFolder.id, 'Images');
  await client.folders.create(attachmentsFolder.id, 'Reports');

  // Apply metadata
  try {
    await client.metadata.createMetadataOnFolder(folder.id, 'enterprise', 'experimentMetadata', {
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
export async function getExperiment(folderId: string): Promise<Experiment> {
  const client = getBoxClient();

  try {
    const metadata = await client.metadata.getMetadataOnFolder(folderId, 'enterprise', 'experimentMetadata');

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
    const folder = await client.folders.get(folderId);
    const nameParts = folder.name.split('-');
    const experimentId = nameParts[0] || 'UNKNOWN';
    const experimentTitle = nameParts.slice(1).join(' ') || folder.name;

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
export async function listExperiments(projectFolderId: string): Promise<Experiment[]> {
  const client = getBoxClient();

  // Find Experiments subfolder
  const items = await client.folders.getItems(projectFolderId);
  const experimentsFolder = items.entries.find((e: any) => e.name === 'Experiments');

  if (!experimentsFolder) {
    return [];
  }

  // Get all experiment folders
  const experimentItems = await client.folders.getItems(experimentsFolder.id);

  const experiments: Experiment[] = [];

  for (const item of experimentItems.entries) {
    if (item.type === 'folder') {
      try {
        const experiment = await getExperiment(item.id);
        experiments.push(experiment);
      } catch (error) {
        console.error(`Failed to get experiment ${item.id}:`, error);
      }
    }
  }

  return experiments;
}

/**
 * Update experiment metadata
 */
export async function updateExperiment(
  folderId: string,
  updates: Partial<Omit<Experiment, 'folderId'>>
): Promise<Experiment> {
  const client = getBoxClient();

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
      await client.metadata.updateMetadataOnFolder(
        folderId,
        'enterprise',
        'experimentMetadata',
        operations
      );
    } catch (error) {
      console.error('Failed to update experiment metadata:', error);
    }
  }

  return getExperiment(folderId);
}
