import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { reports, shareEvents } from '@/db/schema';

const VALID_METHODS = new Set(['clipboard', 'native']);

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const contentType = request.headers.get('content-type') ?? '';
    if (!contentType.toLowerCase().includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json.' },
        { status: 415 }
      );
    }

    let body: { reportSlug?: unknown; method?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body.' },
        { status: 400 }
      );
    }

    const { reportSlug, method } = body;

    if (typeof reportSlug !== 'string' || reportSlug.trim().length === 0) {
      return NextResponse.json(
        { error: 'reportSlug is required and must be a non-empty string.' },
        { status: 400 }
      );
    }

    if (typeof method !== 'string' || !VALID_METHODS.has(method)) {
      return NextResponse.json(
        { error: 'method must be "clipboard" or "native".' },
        { status: 400 }
      );
    }

    const [existing] = await db()
      .select({ slug: reports.slug })
      .from(reports)
      .where(eq(reports.slug, reportSlug))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: 'Report not found.' },
        { status: 404 }
      );
    }

    await db().insert(shareEvents).values({
      reportSlug,
      method,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(
      '[track-share] Unexpected error:',
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: 'Failed to record share event.' },
      { status: 500 }
    );
  }
}
