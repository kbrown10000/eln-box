import { NextRequest, NextResponse } from 'next/server';
import { getEntry, updateEntry, deleteEntry } from '@/lib/box/files';

// GET /api/entries/:fileId
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    const entry = await getEntry(fileId);
    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error fetching entry:', error);
    return NextResponse.json(
      { error: 'Entry not found', details: String(error) },
      { status: 404 }
    );
  }
}

// PATCH /api/entries/:fileId
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    const body = await req.json();

    const entry = await updateEntry(
      fileId,
      body.content,
      {
        title: body.title,
        status: body.status,
        entryType: body.entryType,
      }
    );

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error updating entry:', error);
    return NextResponse.json(
      { error: 'Failed to update entry', details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/entries/:fileId
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    await deleteEntry(fileId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete entry', details: String(error) },
      { status: 500 }
    );
  }
}
