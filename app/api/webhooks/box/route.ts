import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { experiments, filesCache } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getBoxClient } from '@/lib/box/client';

const WEBHOOK_SECRET = process.env.BOX_WEBHOOK_SECRET;

// Function to verify webhook signature
function verifySignature(body: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) {
    console.error('BOX_WEBHOOK_SECRET is not configured. Webhook signature cannot be verified.');
    return false; // In production, you'd want to throw here or fail hard
  }
  
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  hmac.update(body, 'utf8');
  const digest = hmac.digest('base64');
  
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('Box-Signature-Primary');
  
  if (!signature) {
    return NextResponse.json({ message: 'No signature header' }, { status: 401 });
  }

  const rawBody = await request.text();

  if (!verifySignature(rawBody, signature)) {
    console.warn('Webhook signature verification failed.');
    return NextResponse.json({ message: 'Invalid signature' }, { status: 403 });
  }

  const event = JSON.parse(rawBody);

  switch (event.trigger) {
    case 'FILE.UPLOADED':
      console.log('FILE.UPLOADED event received:', event);
      await handleFileUploaded(event.source.id, event.source.parent.id);
      break;
    // Add other event handlers as needed (e.g., FILE.MOVED, FILE.DELETED)
    default:
      console.log(`Unhandled Box webhook event: ${event.trigger}`);
      break;
  }

  return NextResponse.json({ message: 'Webhook received' });
}

async function handleFileUploaded(fileId: string, parentFolderId: string) {
  try {
    // Check if the parent folder is an experiment
    const experiment = await db.query.experiments.findFirst({
      where: eq(experiments.boxFolderId, parentFolderId),
    });

    if (experiment) {
      const boxClient = getBoxClient();

      if (!boxClient) {
          throw new Error("Failed to initialize Box Client");
      }

      const fileInfo = await boxClient.files.getFileById(fileId);

      // Add/update file in filesCache
      await db.insert(filesCache)
        .values({
          boxFileId: fileId,
          experimentId: experiment.id,
          filename: fileInfo.name || 'Unknown File',
          fileType: 'application/octet-stream', // contentType not directly available on FileFull
          fileSize: fileInfo.size || 0,
          boxFolderId: parentFolderId,
        })
        .onConflictDoUpdate({
          target: filesCache.boxFileId,
          set: {
            filename: fileInfo.name || 'Unknown File',
            fileType: 'application/octet-stream',
            fileSize: fileInfo.size || 0,
            updatedAt: new Date(),
          },
        });
      console.log(`File ${fileInfo.name} (${fileId}) linked to experiment ${experiment.experimentId}`);
    } else {
      console.log(`Uploaded file ${fileId} in non-experiment folder ${parentFolderId}. Not linking to DB.`);
    }
  } catch (error) {
    console.error(`Error handling FILE.UPLOADED for file ${fileId}:`, error);
  }
}
