import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { normalizeInput } from '@/lib/input/normalize';
import { analyzeHeuristic } from '@/lib/analysis/heuristic-engine';
import { computeScore } from '@/lib/analysis/scoring';
import { db } from '@/db';
import { reports } from '@/db/schema';
import { eq } from 'drizzle-orm';

const VALID_TYPES = new Set(['text', 'url', 'screenshot']);

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Parse request body
    let body: { type?: string; content?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body.' },
        { status: 400 }
      );
    }

    const { type, content } = body;

    // 2. Validate input
    if (!type || !VALID_TYPES.has(type)) {
      return NextResponse.json(
        { error: 'Invalid input type. Must be "text", "url", or "screenshot".' },
        { status: 400 }
      );
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required and must be a non-empty string.' },
        { status: 400 }
      );
    }

    // Size limits: 50KB for text/URL, 10MB for screenshots (base64)
    const maxSize = type === 'screenshot' ? 10_000_000 : 50_000;
    if (content.length > maxSize) {
      return NextResponse.json(
        { error: `Content too large. Maximum ${type === 'screenshot' ? '10MB' : '50,000 characters'}.` },
        { status: 413 }
      );
    }

    // 3. Normalize input (extract text from URL/screenshot if needed)
    const inputType = type as 'text' | 'url' | 'screenshot';
    let normalized: { text: string; sourceUrl?: string };
    try {
      normalized = await normalizeInput({ type: inputType, content });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to process input.';
      return NextResponse.json({ error: message }, { status: 422 });
    }

    const { text, sourceUrl } = normalized;

    // 4. Run heuristic analysis (synchronous, fast)
    const heuristicResult = analyzeHeuristic(text);

    // 5. Dynamically import LLM engine to avoid loading @anthropic-ai/sdk at module init
    const { analyzeSemantic } = await import('@/lib/analysis/llm-engine');
    const llmPromise = analyzeSemantic(text);

    // 6. Compute initial score from heuristic results only
    const scoreResult = computeScore(heuristicResult.matches, [], text.length);

    // 7. Generate a slug
    const slug = nanoid(10);

    // 8. Persist to database
    const initialResults = {
      score: scoreResult,
      heuristicMatches: heuristicResult.matches,
      llmDetections: [],
      heuristicProcessingTimeMs: heuristicResult.processingTimeMs,
      llmProcessingTimeMs: null as number | null,
      llmComplete: false,
    };

    await db().insert(reports).values({
      slug,
      sourceText: text,
      sourceUrl: sourceUrl ?? null,
      inputType,
      results: initialResults,
    });

    // 9. Register background LLM work with after() so the serverless
    // runtime keeps the function alive until completion.
    try {
      const { after } = await import('next/server');
      if (typeof after === 'function') {
        after(async () => {
          try {
            const llmResult = await llmPromise;

            const updatedScore = computeScore(
              heuristicResult.matches,
              llmResult.detections,
              text.length
            );

            const updatedResults = {
              score: updatedScore,
              heuristicMatches: heuristicResult.matches,
              llmDetections: llmResult.detections,
              heuristicProcessingTimeMs: heuristicResult.processingTimeMs,
              llmProcessingTimeMs: llmResult.processingTimeMs,
              llmComplete: true,
            };

            await db()
              .update(reports)
              .set({ results: updatedResults })
              .where(eq(reports.slug, slug));
          } catch (error) {
            console.error(
              '[analyze] Background LLM update failed:',
              error instanceof Error ? error.message : error
            );
          }
        });
      }
    } catch {
      // after() not available in this runtime — LLM results won't be persisted
    }

    // 10. Return immediate response with heuristic-only results
    return NextResponse.json({ slug, score: scoreResult });
  } catch (error) {
    console.error(
      '[analyze] Unexpected error:',
      error instanceof Error ? error.message : error
    );
    const rawMsg = error instanceof Error ? error.message : 'Unknown error';
    const msg = rawMsg.length > 120 ? rawMsg.slice(0, 120) + '…' : rawMsg;
    return NextResponse.json(
      { error: `Analysis failed: ${msg}` },
      { status: 500 }
    );
  }
}
