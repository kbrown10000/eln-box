import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth/session';
import { getUserClient } from '@/lib/box/client';
import { ensureProjectsRootAccess } from '@/lib/box/access';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  const { error, session } = await requireApiAuth();
  if (error) return error;

  const { folderId } = await params;

  try {
    await ensureProjectsRootAccess(session!.user.email);
    const boxClient = getUserClient(session!.accessToken);
    const folder = await boxClient.folders.getItems(folderId, {
      fields: 'id,name,type,size,modified_at,created_at',
    });

    return NextResponse.json({
      entries: folder.entries || [],
      totalCount: folder.total_count || 0,
    });
  } catch (err: any) {
    console.error('Error fetching folder items:', err);
    return NextResponse.json(
      { error: 'Failed to fetch folder items', details: err.message },
      { status: 500 }
    );
  }
}
