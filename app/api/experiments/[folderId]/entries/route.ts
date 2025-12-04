import { NextRequest, NextResponse } from 'next/server';
import { listEntries, createEntry } from '@/lib/box/files';

// GET /api/experiments/:folderId/entries - List entries in an experiment
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  try {
    const { folderId } = await params;
    const entries = await listEntries(folderId);
    return NextResponse.json(entries);
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
        authorName: body.authorName || 'Unknown',
        authorEmail: body.authorEmail || '',
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
