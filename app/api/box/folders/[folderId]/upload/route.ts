import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth/session';
import { getBoxClient } from '@/lib/box/client';
import { Readable } from 'stream';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  const { error, session } = await requireApiAuth();
  if (error) return error;

  const { folderId } = await params;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const boxClient = getBoxClient();

    if (!boxClient) {
        throw new Error("Failed to initialize Box Client");
    }

    // Convert File to Buffer then Stream
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = Readable.from(buffer);

    // Upload to Box
    const uploadedFile = await boxClient.uploads.uploadFile({
      attributes: {
        name: file.name,
        parent: { id: folderId }
      },
      file: stream
    });

    const fileEntry = uploadedFile.entries?.[0];

    if (!fileEntry) {
        throw new Error("File upload failed - no entry returned");
    }

    return NextResponse.json({
      id: fileEntry.id,
      name: fileEntry.name,
      size: fileEntry.size,
      type: 'file',
    });
  } catch (err: any) {
    console.error('Error uploading file:', err);
    return NextResponse.json(
      { error: 'Failed to upload file', details: err.message },
      { status: 500 }
    );
  }
}
