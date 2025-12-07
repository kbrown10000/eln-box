import type { BoxClient } from './client';
import { Entry } from './types';
import { PaginationOptions, PaginatedResult } from './folders';
import { Readable } from 'stream';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

/**
 * Create a new entry as a markdown file
 */
export async function createEntry(
  client: BoxClient,
  experimentFolderId: string,
  entry: Omit<Entry, 'fileId'>,
  content: string
): Promise<Entry> {
  // Find Entries subfolder
  const items = await client.folders.getFolderItems(experimentFolderId);
  const entriesFolder = items.entries.find((e: any) => e.name === 'Entries');

  if (!entriesFolder) {
    throw new Error('Entries folder not found');
  }

  // Create file from content
  const fileName = `Entry-${entry.entryDate}-${entry.title.replace(/\s+/g, '-')}.md`;
  const buffer = Buffer.from(content, 'utf-8');
  const stream = Readable.from(buffer);

  const file = await client.uploads.uploadFile({
    attributes: {
      name: fileName,
      parent: { id: entriesFolder.id }
    },
    file: stream
  });

  // Apply metadata
  try {
    await client.fileMetadata.createFileMetadataById(file.entries[0].id, 'enterprise', 'entryMetadata', {
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
export async function getEntry(client: BoxClient, fileId: string): Promise<Entry> {
  let metadata: any = {};

  // Get metadata
  try {
    metadata = await client.fileMetadata.getFileMetadataById(fileId, 'enterprise', 'entryMetadata');
  } catch (error) {
    console.warn('Failed to get entry metadata:', error);
  }

  // Get file content
  const downloadStream = await client.downloads.downloadFile(fileId);
  const chunks: Buffer[] = [];

  for await (const chunk of downloadStream) {
    chunks.push(Buffer.from(chunk));
  }

  const content = Buffer.concat(chunks).toString('utf-8');

  // Get file info for fallback
  const fileInfo = await client.files.getFileById(fileId);

  return {
    fileId,
    entryId: metadata.entryId || fileInfo.id,
    entryDate: metadata.entryDate || fileInfo.createdAt || fileInfo.created_at, // Handle potential property name change
    authorName: metadata.authorName || '',
    authorEmail: metadata.authorEmail || '',
    title: metadata.title || fileInfo.name!.replace('.md', ''),
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
  client: BoxClient,
  fileId: string,
  content: string,
  metadataUpdates: Partial<Entry>
): Promise<Entry> {

  // Upload new version
  const buffer = Buffer.from(content, 'utf-8');
  const stream = Readable.from(buffer);
  await client.uploads.uploadFileVersion(fileId, {
    attributes: { name: 'new_version' }, // Name is usually ignored for version updates but might be required structure
    file: stream
  });

  // Update metadata version
  try {
    const currentMetadata: any = await client.fileMetadata.getFileMetadataById(fileId, 'enterprise', 'entryMetadata');
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

    await client.fileMetadata.updateFileMetadataById(fileId, 'enterprise', 'entryMetadata', operations);
  } catch (error) {
    console.warn('Failed to update entry metadata:', error);
  }

  return getEntry(client, fileId);
}

/**
 * List entries in an experiment
 */
export async function listEntries(
  client: BoxClient,
  experimentFolderId: string,
  options: PaginationOptions = {}
): Promise<PaginatedResult<Entry>> {
  const limit = Math.min(options.limit || DEFAULT_LIMIT, MAX_LIMIT);
  const offset = options.offset || 0;

  // Find Entries subfolder
  const items = await client.folders.getFolderItems(experimentFolderId);
  const entriesFolder = items.entries.find((e: any) => e.name === 'Entries');

  if (!entriesFolder) {
    return { items: [], totalCount: 0, limit, offset };
  }

  // Get entry files with pagination
  const entryItems = await client.folders.getFolderItems(entriesFolder.id, {
    limit,
    offset,
  });

  const entries: Entry[] = [];

  for (const item of entryItems.entries) {
    if (item.type === 'file' && item.name!.endsWith('.md')) {
      try {
        const entry = await getEntry(client, item.id);
        entries.push(entry);
      } catch (error) {
        console.error(`Failed to get entry ${item.id}:`, error);
      }
    }
  }

  return {
    items: entries,
    totalCount: entryItems.totalCount || entryItems.entries.length,
    limit,
    offset,
  };
}

/**
 * Sign an entry (update metadata with signature hash)
 */
export async function signEntry(
  client: BoxClient,
  fileId: string,
  signedBy: string,
  signatureHash: string
): Promise<Entry> {

  try {
    await client.fileMetadata.updateFileMetadataById(fileId, 'enterprise', 'entryMetadata', [
      { op: 'replace', path: '/status', value: 'signed' },
      { op: 'add', path: '/signedAt', value: new Date().toISOString() },
      { op: 'add', path: '/signedBy', value: signedBy },
      { op: 'add', path: '/signatureHash', value: signatureHash },
    ]);
  } catch (error) {
    console.error('Failed to sign entry:', error);
    throw error;
  }

  return getEntry(client, fileId);
}

/**
 * Delete an entry
 */
export async function deleteEntry(client: BoxClient, fileId: string): Promise<void> {
  await client.files.deleteFileById(fileId);
}
