import { NextResponse } from 'next/server';
import { getBudgetState } from '@/lib/analysis/budget';

/**
 * Public Energy Meter status endpoint. Returns the current tier so the
 * homepage can render the "running on caffeine / tea / water / napping"
 * state without needing to make a real analysis call first.
 *
 * Spend amount is NOT exposed publicly — only the qualitative tier. Internal
 * dollar tracking stays internal.
 */
export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const state = getBudgetState();
  return NextResponse.json(
    {
      tier: state.tier,
      resetAtUtc: new Date(state.resetAtMs).toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=30, s-maxage=30',
      },
    }
  );
}
