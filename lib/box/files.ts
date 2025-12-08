import type { BoxClient } from './client';
import { Entry } from './types';
import { PaginationOptions, PaginatedResult } from './folders';
import { Readable } from 'stream';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

/**
 * Helper to ensure dates are always strings
 */
function toDateString(date: any): string {
  if (!date) return '';
  if (typeof date === 'string') return date;
  if (date instanceof Date) return date.toISOString();
  return String(date);
}

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
  const entriesFolder = items.entries?.find((e: any) => e.name === 'Entries');

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

  const uploadedFileId = file.entries?.[0]?.id;
  if (!uploadedFileId) {
      throw new Error("Failed to upload entry file - no ID returned");
  }

  // Apply metadata
  try {
    await client.fileMetadata.createFileMetadataById(uploadedFileId, 'enterprise', 'entryMetadata', {
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
    fileId: uploadedFileId,
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
  
  if (!downloadStream) {
      throw new Error(`Failed to download file content for ${fileId}`);
  }

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
    entryDate: toDateString(metadata.entryDate || fileInfo.createdAt),
    authorName: metadata.authorName || '',
    authorEmail: metadata.authorEmail || '',
    title: metadata.title || fileInfo.name!.replace('.md', ''),
    entryType: metadata.entryType || 'observation',
    status: metadata.status || 'draft',
    version: metadata.version || '1',
    signedAt: toDateString(metadata.signedAt),
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

  // Find Entries subfolder first
  let entriesFolderId: string | null = null;
  try {
      const items = await client.folders.getFolderItems(experimentFolderId);
      const entriesFolder = items.entries?.find((e: any) => e.name === 'Entries');
      if (entriesFolder) {
          entriesFolderId = entriesFolder.id;
      }
  } catch (e) {
      console.warn('Failed to find Entries folder:', e);
  }

  if (!entriesFolderId) {
    return { items: [], totalCount: 0, limit, offset };
  }

  // Fallback logic
  const executeFallback = async () => {
      const entryItems = await client.folders.getFolderItems(entriesFolderId!, {
        // limit, offset // API might not support strict type here, or SDK differences
      });
    
      const entries: Entry[] = [];
    
      for (const item of entryItems.entries || []) {
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
        totalCount: entryItems.totalCount || entryItems.entries?.length || 0,
        limit,
        offset,
      };
  };

  if (offset > 0) return executeFallback();

  try {
    const enterpriseId = process.env.BOX_ENTERPRISE_ID;
    const from = `enterprise_${enterpriseId}.entryMetadata`;

    const results = await client.search.searchByMetadataQuery({
      from,
      ancestorFolderId: entriesFolderId,
      query: "entryId IS NOT NULL",
      fields: [
        "name", "created_at",
        `metadata.${from}.entryId`,
        `metadata.${from}.entryDate`,
        `metadata.${from}.authorName`,
        `metadata.${from}.authorEmail`,
        `metadata.${from}.title`,
        `metadata.${from}.entryType`,
        `metadata.${from}.status`,
        `metadata.${from}.version`,
        `metadata.${from}.signedAt`,
        `metadata.${from}.signedBy`,
        `metadata.${from}.signatureHash`
      ],
      limit
    });

    const entries = (results.entries || []).map((item: any) => {
      const md = item.metadata?.[`enterprise_${enterpriseId}`]?.entryMetadata || {};
      return {
        fileId: item.id,
        entryId: md.entryId || item.id,
        entryDate: toDateString(md.entryDate || item.createdAt || item.created_at),
        authorName: md.authorName || '',
        authorEmail: md.authorEmail || '',
        title: md.title || item.name.replace('.md', ''),
        entryType: md.entryType || 'observation',
        status: md.status || 'draft',
        version: md.version || '1',
        signedAt: toDateString(md.signedAt),
        signedBy: md.signedBy,
        signatureHash: md.signatureHash,
        content: undefined, // Content not loaded in list view for performance
      };
    });

    return {
      items: entries,
      totalCount: entries.length,
      limit,
      offset
    };

  } catch (error) {
    console.warn("Metadata Query optimization failed for entries, using fallback:", error);
    return executeFallback();
  }
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
