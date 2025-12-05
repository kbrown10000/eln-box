import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth/session';
import { getUserClient } from '@/lib/box/client';
import { ensureProjectsRootAccess } from '@/lib/box/access';

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

    await ensureProjectsRootAccess(session!.user.email);
    const boxClient = getUserClient(session!.accessToken);

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Box
    const uploadedFile = await boxClient.files.uploadFile(folderId, file.name, buffer);

    const fileEntry = uploadedFile.entries[0];

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
