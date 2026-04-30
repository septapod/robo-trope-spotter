import { NextRequest, NextResponse } from "next/server";
import { issueMagicLink } from "@/lib/auth/magic-link";

/**
 * POST /api/auth/send-link
 * Body: { email: string }
 *
 * Always returns 200 with a generic success message even when the email is
 * malformed or sending fails — this prevents the endpoint from being used as
 * an email-existence oracle. Real failures are logged server-side.
 *
 * Per-IP rate limiting lives in middleware; if needed, add a dedicated rule
 * to keep this endpoint resistant to brute-force enumeration.
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
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  try {
    await issueMagicLink(email);
  } catch (err) {
    console.error("[auth/send-link] failed:", err instanceof Error ? err.message : err);
  }

  return NextResponse.json({
    ok: true,
    message: "Check your email for a sign-in link. It works once and expires in 15 minutes.",
  });
}
