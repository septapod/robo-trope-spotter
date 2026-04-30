import { NextRequest, NextResponse } from "next/server";
import { getPolarClient, getCoffeeProductId, getAppUrl } from "@/lib/billing/polar";
import { getCurrentSession } from "@/lib/auth/session";

/**
 * POST /api/checkout
 *
 * Creates a Polar checkout session for the buy-me-a-coffee tip. Returns
 * `{ url }` for the client to redirect the user. On success, the Polar
 * webhook (POST /api/polar/webhook) fires and grants the tip_today unlock.
 *
 * Body: optional `{ amount?: number }` — Polar treats this as suggested
 * pricing. The actual amount is determined at the Polar checkout UI for
 * pay-what-you-want products.
 */
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getCurrentSession();
    const polar = getPolarClient();
    const productId = getCoffeeProductId();
    const appUrl = getAppUrl();

    let body: { amount?: unknown } = {};
    try {
      body = await request.json();
    } catch {
      // body is optional
    }

    const amount = typeof body.amount === "number" && body.amount > 0
      ? Math.round(body.amount * 100)
      : undefined;

    const checkout = await polar.checkouts.create({
      products: [productId],
      successUrl: `${appUrl}/?tip_succeeded=1`,
      customerEmail: session?.user.email,
      metadata: {
        userId: session?.user.id ?? "anonymous",
        suggestedAmountCents: amount?.toString() ?? "0",
      },
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error("[checkout] failed:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Could not start checkout. Try again." },
      { status: 500 }
    );
  }
}
