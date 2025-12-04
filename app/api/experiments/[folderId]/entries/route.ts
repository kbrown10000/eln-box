import { NextRequest, NextResponse } from 'next/server';
import { listEntries, createEntry } from '@/lib/box/files';
import { requireApiAuth } from '@/lib/auth/session';

// GET /api/experiments/:folderId/entries - List entries in an experiment
// Query params: ?limit=50&offset=0
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  const { error } = await requireApiAuth();
  if (error) return error;

  try {
    const { folderId } = await params;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const result = await listEntries(folderId, { limit, offset });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entries', details: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/experiments/:folderId/entries - Create new entry
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  const { error, session } = await requireApiAuth();
  if (error) return error;

  try {
    const { folderId } = await params;
    const body = await req.json();

    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'title and content are required' },
        { status: 400 }
      );
    }

    const entry = await createEntry(
      folderId,
      {
        entryId: body.entryId || `entry-${Date.now()}`,
        entryDate: body.entryDate || new Date().toISOString().split('T')[0],
        authorName: body.authorName || session!.user.name,
        authorEmail: body.authorEmail || session!.user.email,
        title: body.title,
        entryType: body.entryType || 'observation',
        status: body.status || 'draft',
        version: body.version || '1',
      },
      body.content
    );

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Error creating entry:', error);
    return NextResponse.json(
      { error: 'Failed to create entry', details: String(error) },
      { status: 500 }
    );
  }
}
