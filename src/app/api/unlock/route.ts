import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { getClientScope } from "@/lib/billing/scope";
import { grantUnlock, hasUsedGiftToday } from "@/lib/billing/unlocks";

/**
 * POST /api/unlock
 *
 * The "$0 / no thanks" path. Grants a gift_today unlock that lifts today's
 * quota without requiring payment. Capped at one per day per user/IP so it
 * cannot be looped indefinitely.
 *
 * Anonymous: keyed by client IP. Logged-in: keyed by userId.
 */
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getCurrentSession();
  const scopeKey = session ? null : getClientScope(request);
  const userId = session?.user.id ?? null;

  if (!userId && !scopeKey) {
    return NextResponse.json({ error: "Could not identify you." }, { status: 400 });
  }

  const already = await hasUsedGiftToday({ userId, scopeKey });
  if (already) {
    return NextResponse.json(
      { error: "You've already used today's free unlock. Come back tomorrow." },
      { status: 429 }
    );
  }

  await grantUnlock({ userId, scopeKey, unlockType: "gift_today" });
  return NextResponse.json({ ok: true, message: "Today's quota lifted." });
}
