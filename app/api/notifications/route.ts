import { NextResponse } from 'next/server';
import { getNotifications } from '@/lib/actions/notifications';

export async function GET() {
  const notifications = await getNotifications();
  return NextResponse.json(notifications);
}
