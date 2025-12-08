import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth/session';
import { getDashboardStats } from '@/lib/data/dashboard';

export async function GET() {
  const { error } = await requireApiAuth();
  if (error) return error;

  try {
    // Now fetching from Box Metadata (via lib/data/dashboard)
    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (err: any) {
    // Safe error logging
    try {
        console.error('Dashboard Stats Error:', err?.message || String(err));
        if (err?.responseInfo) {
             console.error('Box API Error Response:', JSON.stringify(err.responseInfo, null, 2));
        }
    } catch (logError) {
        console.error('Failed to log error details:', logError);
    }
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
