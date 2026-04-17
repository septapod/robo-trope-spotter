import { NextRequest, NextResponse } from 'next/server';
import { desc, gte, sql } from 'drizzle-orm';
import { db } from '@/db';
import { reports, shareEvents } from '@/db/schema';
import { isValidSession } from '@/lib/admin/session';

const WINDOW_DAYS = 14;
const EVENTS_LIMIT = 500;

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!isValidSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const windowStart = new Date(now.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const startOfToday = new Date(now);
  startOfToday.setUTCHours(0, 0, 0, 0);

  const database = db();

  const [totalSharesRow] = await database
    .select({ count: sql<number>`count(*)::int` })
    .from(shareEvents)
    .where(gte(shareEvents.createdAt, windowStart));

  const [sharesTodayRow] = await database
    .select({ count: sql<number>`count(*)::int` })
    .from(shareEvents)
    .where(gte(shareEvents.createdAt, startOfToday));

  const [totalReportsRow] = await database
    .select({ count: sql<number>`count(*)::int` })
    .from(reports)
    .where(gte(reports.createdAt, windowStart));

  const totalShares = totalSharesRow?.count ?? 0;
  const sharesToday = sharesTodayRow?.count ?? 0;
  const totalReportsInWindow = totalReportsRow?.count ?? 0;
  const shareRate = totalReportsInWindow > 0 ? totalShares / totalReportsInWindow : 0;

  // Score-band aggregation: join share_events on reports by slug, group by score label.
  const bandRows = await database.execute(sql`
    WITH report_labels AS (
      SELECT
        ${reports.slug} AS slug,
        (${reports.results} -> 'score' ->> 'label') AS label
      FROM ${reports}
      WHERE ${reports.createdAt} >= ${windowStart}
    ),
    share_counts AS (
      SELECT ${shareEvents.reportSlug} AS slug, COUNT(*)::int AS share_count
      FROM ${shareEvents}
      WHERE ${shareEvents.createdAt} >= ${windowStart}
      GROUP BY ${shareEvents.reportSlug}
    )
    SELECT
      COALESCE(rl.label, 'Unknown') AS band_label,
      COUNT(DISTINCT rl.slug)::int AS report_count,
      COALESCE(SUM(sc.share_count), 0)::int AS share_count
    FROM report_labels rl
    LEFT JOIN share_counts sc ON sc.slug = rl.slug
    GROUP BY band_label
    ORDER BY band_label ASC
  `);

  type BandRow = { band_label: string; report_count: number; share_count: number };
  const byScoreBand = (bandRows.rows as unknown as BandRow[]).map((r) => ({
    bandLabel: r.band_label,
    reportCount: r.report_count,
    shareCount: r.share_count,
    rate: r.report_count > 0 ? r.share_count / r.report_count : 0,
  }));

  const events = await database
    .select({
      id: shareEvents.id,
      reportSlug: shareEvents.reportSlug,
      method: shareEvents.method,
      createdAt: shareEvents.createdAt,
    })
    .from(shareEvents)
    .where(gte(shareEvents.createdAt, windowStart))
    .orderBy(desc(shareEvents.createdAt))
    .limit(EVENTS_LIMIT);

  return NextResponse.json({
    totalShares,
    sharesToday,
    shareRate,
    byScoreBand,
    events,
  });
}
