import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { getClientScope } from "@/lib/billing/scope";
import { grantUnlock } from "@/lib/billing/unlocks";
import { subscribeToAiForFis } from "@/lib/newsletter/beehiiv";

/**
 * POST /api/newsletter/subscribe
 * Body: { email: string }
 *
 * Subscribes the email to AI for FIs via Beehiiv, then grants a 30-day
 * newsletter_30d unlock keyed to the logged-in user (if any) or the
 * client IP.
 */
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: { email?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email || !email.includes("@") || email.length > 254) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  const result = await subscribeToAiForFis(email);
  if (!result.ok) {
    console.error("[newsletter:subscribe]", result.error);
    return NextResponse.json(
      { error: "Could not subscribe right now. Try again in a moment." },
      { status: 502 }
    );
  }

  const session = await getCurrentSession();
  const userId = session?.user.id ?? null;
  const scopeKey = session ? null : getClientScope(request);

  await grantUnlock({ userId, scopeKey, unlockType: "newsletter_30d" });

  return NextResponse.json({
    ok: true,
    message: "You're on the list. Unlimited analyses for the next 30 days.",
  });
}
