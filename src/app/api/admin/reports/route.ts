import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reports } from '@/db/schema';
import { desc, sql } from 'drizzle-orm';
import type { ScoreResult } from '@/lib/analysis/scoring';

function isAuthed(request: NextRequest): boolean {
  const cookie = request.cookies.get('admin_session')?.value;
  return !!cookie && cookie === process.env.ADMIN_PASSWORD;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allReports = await db()
    .select({
      slug: reports.slug,
      inputType: reports.inputType,
      results: reports.results,
      createdAt: reports.createdAt,
    })
    .from(reports)
    .orderBy(desc(reports.createdAt));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rows = allReports.map((r) => {
    const data = r.results as { score?: ScoreResult } | null;
    const score = data?.score;
    return {
      slug: r.slug,
      inputType: r.inputType,
      score: score?.rawScore ?? null,
      label: score?.label ?? null,
      wordCount: score?.wordCount ?? null,
      tropesDetected: score?.totalTropesDetected ?? null,
      createdAt: r.createdAt,
    };
  });

  const todayCount = rows.filter(
    (r) => r.createdAt && new Date(r.createdAt) >= today
  ).length;

  return NextResponse.json({
    total: rows.length,
    today: todayCount,
    reports: rows,
  });
}
