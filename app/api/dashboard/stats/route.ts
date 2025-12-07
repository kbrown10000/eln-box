import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth/session';
import { getDashboardStats } from '@/lib/data/dashboard';

export async function GET() {
  const { error } = await requireApiAuth();
  if (error) return error;

  try {
    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
