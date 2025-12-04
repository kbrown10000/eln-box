import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth/session';
import { getBoxClient } from '@/lib/box/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  const { error } = await requireApiAuth();
  if (error) return error;

  const { folderId } = await params;

  try {
    const boxClient = getBoxClient();
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
