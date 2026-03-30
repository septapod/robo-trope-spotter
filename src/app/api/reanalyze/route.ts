import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reports } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * POST /api/reanalyze - Re-run analysis on an existing report.
 * Body: { slug: string }
 * This re-analyzes the stored sourceText and updates the results in place.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { slug } = await request.json();
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }

    const [report] = await db()
      .select()
      .from(reports)
      .where(eq(reports.slug, slug))
      .limit(1);

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const { analyzeWithLlm } = await import('@/lib/analysis/llm-engine');
    const { computeScoreFromLlm } = await import('@/lib/analysis/scoring');

    const text = report.sourceText;
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    const llmResult = await analyzeWithLlm(text);
    const scoreResult = computeScoreFromLlm(llmResult.detections, wordCount);

    const results = {
      score: scoreResult,
      llmDetections: llmResult.detections,
      processingTimeMs: llmResult.processingTimeMs,
    };

    await db()
      .update(reports)
      .set({ results })
      .where(eq(reports.slug, slug));

    return NextResponse.json({ slug, score: scoreResult });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
