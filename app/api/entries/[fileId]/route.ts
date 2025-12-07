import { NextRequest, NextResponse } from 'next/server';
import { getEntry, updateEntry, deleteEntry } from '@/lib/box/files';
import { requireApiAuth } from '@/lib/auth/session';
import { getBoxClient } from '@/lib/box/client';

// GET /api/entries/:fileId
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { error, session } = await requireApiAuth();
  if (error) return error;

  try {
    const { fileId } = await params;
    const boxClient = getBoxClient();

    if (!boxClient) {
        throw new Error("Failed to initialize Box Client");
    }

    const entry = await getEntry(boxClient, fileId);
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
  const { error, session } = await requireApiAuth();
  if (error) return error;

  try {
    const { fileId } = await params;
    const body = await req.json();
    const boxClient = getBoxClient();

    if (!boxClient) {
        throw new Error("Failed to initialize Box Client");
    }

    const entry = await updateEntry(
      boxClient,
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
  const { error, session } = await requireApiAuth();
  if (error) return error;

  try {
    const { fileId } = await params;
    const boxClient = getBoxClient();

    if (!boxClient) {
        throw new Error("Failed to initialize Box Client");
    }

    await deleteEntry(boxClient, fileId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete entry', details: String(error) },
      { status: 500 }
    );
  }
}