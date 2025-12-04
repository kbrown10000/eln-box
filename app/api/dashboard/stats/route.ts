import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { experiments, projects, protocolSteps, reagents, yields, spectra, users } from '@/lib/db/schema';
import { eq, count, avg, sql } from 'drizzle-orm';

export async function GET() {
  const { error } = await requireApiAuth();
  if (error) return error;

  try {
    // Get counts
    const [projectCount] = await db.select({ count: count() }).from(projects);
    const [experimentCount] = await db.select({ count: count() }).from(experiments);
    const [userCount] = await db.select({ count: count() }).from(users);
    const [spectraCount] = await db.select({ count: count() }).from(spectra);

    // Get experiments by status
    const experimentsByStatus = await db
      .select({
        status: experiments.status,
        count: count(),
      })
      .from(experiments)
      .groupBy(experiments.status);

    // Get average yield percentage
    const [avgYield] = await db
      .select({
        avgPercentage: avg(yields.percentage),
      })
      .from(yields);

    // Get recent experiments
    const recentExperiments = await db
      .select({
        id: experiments.id,
        title: experiments.title,
        status: experiments.status,
        boxFolderId: experiments.boxFolderId,
        createdAt: experiments.createdAt,
      })
      .from(experiments)
      .orderBy(sql`${experiments.createdAt} DESC`)
      .limit(5);

    // Get experiments with yield data
    const experimentsWithYields = await db
      .select({
        title: experiments.title,
        theoretical: yields.theoretical,
        actual: yields.actual,
        percentage: yields.percentage,
        unit: yields.unit,
      })
      .from(experiments)
      .innerJoin(yields, eq(yields.experimentId, experiments.id))
      .orderBy(sql`${yields.percentage} DESC`)
      .limit(10);

    // Get spectra by type
    const spectraByType = await db
      .select({
        spectrumType: spectra.spectrumType,
        count: count(),
      })
      .from(spectra)
      .groupBy(spectra.spectrumType);

    // Get top reagents used
    const topReagents = await db
      .select({
        name: reagents.name,
        count: count(),
      })
      .from(reagents)
      .groupBy(reagents.name)
      .orderBy(sql`count(*) DESC`)
      .limit(10);

    return NextResponse.json({
      overview: {
        projects: projectCount.count,
        experiments: experimentCount.count,
        users: userCount.count,
        spectra: spectraCount.count,
        avgYield: avgYield.avgPercentage ? parseFloat(avgYield.avgPercentage as string).toFixed(1) : 0,
      },
      experimentsByStatus: experimentsByStatus.map(e => ({
        status: e.status,
        count: e.count,
      })),
      recentExperiments: recentExperiments.map(e => ({
        id: e.id,
        title: e.title,
        status: e.status,
        boxFolderId: e.boxFolderId,
        createdAt: e.createdAt,
      })),
      yieldsData: experimentsWithYields.map(e => ({
        title: e.title,
        theoretical: parseFloat(e.theoretical as string),
        actual: parseFloat(e.actual as string),
        percentage: parseFloat(e.percentage as string),
        unit: e.unit,
      })),
      spectraByType: spectraByType.map(s => ({
        type: s.spectrumType,
        count: s.count,
      })),
      topReagents: topReagents.map(r => ({
        name: r.name,
        count: r.count,
      })),
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
