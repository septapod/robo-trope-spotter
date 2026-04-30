import { NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';
import { db } from '@/db';
import { reports } from '@/db/schema';

/**
 * Recent verdicts feed for the Roll Call activity strip.
 *
 * Returns the labels (Dead Giveaway / Red Flag / Worth Noting / Subtle Tell /
 * clean) of recent reports. No counts, no denominators — the strip's job is
 * to show the tool is alive, not measure popularity.
 *
 * Quotes from user input are NEVER returned. Only the verdict label.
 */

export const dynamic = 'force-dynamic';

interface ReportResultsShape {
  score?: { label?: string; rawScore?: number };
}

export async function GET(): Promise<NextResponse> {
  try {
    const rows = await db()
      .select({
        results: reports.results,
        createdAt: reports.createdAt,
      })
      .from(reports)
      .orderBy(desc(reports.createdAt))
      .limit(15);

    const verdicts = rows
      .map(row => {
        const results = row.results as ReportResultsShape;
        const label = results?.score?.label ?? null;
        const rawScore = results?.score?.rawScore ?? null;
        return label ? { label, rawScore, at: row.createdAt } : null;
      })
      .filter((v): v is { label: string; rawScore: number | null; at: Date } => v !== null)
      .slice(0, 8);

    return NextResponse.json(
      { verdicts },
      {
        headers: {
          'Cache-Control': 'public, max-age=20, s-maxage=20',
        },
      }
    );
  } catch (err) {
    console.error('[recent-verdicts] error:', err);
    return NextResponse.json({ verdicts: [] }, { status: 200 });
  }
}
