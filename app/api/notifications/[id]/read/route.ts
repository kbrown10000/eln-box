import { NextResponse } from 'next/server';
import { markAsRead } from '@/lib/actions/notifications';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await markAsRead(id);
  return NextResponse.json({ success: true });
}
