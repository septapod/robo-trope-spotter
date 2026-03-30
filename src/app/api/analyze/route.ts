import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { normalizeInput } from '@/lib/input/normalize';
import { db } from '@/db';
import { reports } from '@/db/schema';

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

    // 4. Run LLM analysis (the primary and only analysis engine)
    const { analyzeWithLlm } = await import('@/lib/analysis/llm-engine');
    const { computeScoreFromLlm } = await import('@/lib/analysis/scoring');

    const llmResult = await analyzeWithLlm(text);
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const scoreResult = computeScoreFromLlm(llmResult.detections, wordCount);

    console.log('[analyze] LLM detections:', llmResult.detections.length,
      'time:', llmResult.processingTimeMs, 'ms',
      'timedOut:', llmResult.timedOut ?? false);

    // 5. Generate a slug and persist
    const slug = nanoid(10);

    const results = {
      score: scoreResult,
      llmDetections: llmResult.detections,
      processingTimeMs: llmResult.processingTimeMs,
      llmTimedOut: llmResult.timedOut ?? false,
    };

    await db().insert(reports).values({
      slug,
      sourceText: text,
      sourceUrl: sourceUrl ?? null,
      inputType,
      results,
    });

    // 6. Return the results (include warning if LLM timed out)
    return NextResponse.json({
      slug,
      score: scoreResult,
      ...(llmResult.timedOut && { warning: 'Analysis timed out. Results may be incomplete.' }),
    });
  } catch (error) {
    console.error(
      '[analyze] Unexpected error:',
      error instanceof Error ? error.message : error
    );
    const rawMsg = error instanceof Error ? error.message : 'Unknown error';
    const msg = rawMsg.length > 120 ? rawMsg.slice(0, 120) + '...' : rawMsg;
    return NextResponse.json(
      { error: `Analysis failed: ${msg}` },
      { status: 500 }
    );
  }
}
