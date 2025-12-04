import { getBoxClient } from './client';
import { Entry } from './types';
import { Readable } from 'stream';

/**
 * Create a new entry as a markdown file
 */
export async function createEntry(
  experimentFolderId: string,
  entry: Omit<Entry, 'fileId'>,
  content: string
): Promise<Entry> {
  const client = getBoxClient();

  // Find Entries subfolder
  const items = await client.folders.getItems(experimentFolderId);
  const entriesFolder = items.entries.find((e: any) => e.name === 'Entries');

  if (!entriesFolder) {
    throw new Error('Entries folder not found');
  }

  // Create file from content
  const fileName = `Entry-${entry.entryDate}-${entry.title.replace(/\s+/g, '-')}.md`;
  const buffer = Buffer.from(content, 'utf-8');
  const stream = Readable.from(buffer);

  const file = await client.files.uploadFile(entriesFolder.id, fileName, stream);

  // Apply metadata
  try {
    await client.files.setMetadata(file.entries[0].id, 'enterprise', 'entryMetadata', {
      entryId: entry.entryId,
      entryDate: entry.entryDate,
      authorName: entry.authorName,
      authorEmail: entry.authorEmail,
      title: entry.title,
      entryType: entry.entryType,
      status: entry.status,
      version: entry.version,
    });
  } catch (error) {
    console.warn('Failed to apply entry metadata template:', error);
  }

  return {
    fileId: file.entries[0].id,
    ...entry,
    content,
  };
}

/**
 * Get entry content and metadata
 */
export async function getEntry(fileId: string): Promise<Entry> {
  const client = getBoxClient();

  let metadata: any = {};

  // Get metadata
  try {
    metadata = await client.files.getMetadata(fileId, 'enterprise', 'entryMetadata');
  } catch (error) {
    console.warn('Failed to get entry metadata:', error);
  }

  // Get file content
  const stream = await client.files.getReadStream(fileId);
  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }

  const content = Buffer.concat(chunks).toString('utf-8');

  // Get file info for fallback
  const fileInfo = await client.files.get(fileId);

  return {
    fileId,
    entryId: metadata.entryId || fileInfo.id,
    entryDate: metadata.entryDate || fileInfo.created_at,
    authorName: metadata.authorName || '',
    authorEmail: metadata.authorEmail || '',
    title: metadata.title || fileInfo.name.replace('.md', ''),
    entryType: metadata.entryType || 'observation',
    status: metadata.status || 'draft',
    version: metadata.version || '1',
    signedAt: metadata.signedAt,
    signedBy: metadata.signedBy,
    signatureHash: metadata.signatureHash,
    content,
  };
}

/**
 * Update entry content (creates new version)
 */
export async function updateEntry(
  fileId: string,
  content: string,
  metadataUpdates: Partial<Entry>
): Promise<Entry> {
  const client = getBoxClient();

  // Upload new version
  const buffer = Buffer.from(content, 'utf-8');
  const stream = Readable.from(buffer);
  await client.files.uploadNewFileVersion(fileId, stream);

  // Update metadata version
  try {
    const currentMetadata = await client.files.getMetadata(fileId, 'enterprise', 'entryMetadata');
    const newVersion = String(Number(currentMetadata.version || 1) + 1);

    const operations: any[] = [
      { op: 'replace', path: '/version', value: newVersion },
    ];

    if (metadataUpdates.status !== undefined) {
      operations.push({ op: 'replace', path: '/status', value: metadataUpdates.status });
    }
    if (metadataUpdates.title !== undefined) {
      operations.push({ op: 'replace', path: '/title', value: metadataUpdates.title });
    }
    if (metadataUpdates.entryType !== undefined) {
      operations.push({ op: 'replace', path: '/entryType', value: metadataUpdates.entryType });
    }

    await client.files.updateMetadata(fileId, 'enterprise', 'entryMetadata', operations);
  } catch (error) {
    console.warn('Failed to update entry metadata:', error);
  }

  return getEntry(fileId);
}

/**
 * List entries in an experiment
 */
export async function listEntries(experimentFolderId: string): Promise<Entry[]> {
  const client = getBoxClient();

  // Find Entries subfolder
  const items = await client.folders.getItems(experimentFolderId);
  const entriesFolder = items.entries.find((e: any) => e.name === 'Entries');

  if (!entriesFolder) {
    return [];
  }

  // Get all entry files
  const entryItems = await client.folders.getItems(entriesFolder.id);

  const entries: Entry[] = [];

  for (const item of entryItems.entries) {
    if (item.type === 'file' && item.name.endsWith('.md')) {
      try {
        const entry = await getEntry(item.id);
        entries.push(entry);
      } catch (error) {
        console.error(`Failed to get entry ${item.id}:`, error);
      }
    }
  }

  return entries;
}

/**
 * Sign an entry (update metadata with signature hash)
 */
export async function signEntry(
  fileId: string,
  signedBy: string,
  signatureHash: string
): Promise<Entry> {
  const client = getBoxClient();

  try {
    await client.files.updateMetadata(fileId, 'enterprise', 'entryMetadata', [
      { op: 'replace', path: '/status', value: 'signed' },
      { op: 'add', path: '/signedAt', value: new Date().toISOString() },
      { op: 'add', path: '/signedBy', value: signedBy },
      { op: 'add', path: '/signatureHash', value: signatureHash },
    ]);
  } catch (error) {
    console.error('Failed to sign entry:', error);
    throw error;
  }

  return getEntry(fileId);
}

/**
 * Delete an entry
 */
export async function deleteEntry(fileId: string): Promise<void> {
  const client = getBoxClient();
  await client.files.delete(fileId);
}
