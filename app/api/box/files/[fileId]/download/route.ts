import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth/session';
import { getBoxClient } from '@/lib/box/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { error, session } = await requireApiAuth();
  if (error) return error;

  const { fileId } = await params;

  try {
    const boxClient = getBoxClient();

    // Get download URL from Box
    const downloadUrl = await boxClient.files.getDownloadURL(fileId);

    return NextResponse.json({ downloadUrl });
  } catch (err: any) {
    console.error('Error getting download URL:', err);
    return NextResponse.json(
      { error: 'Failed to get download URL', details: err.message },
      { status: 500 }
    );
  }
}
