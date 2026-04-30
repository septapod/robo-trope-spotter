import { NextRequest, NextResponse } from "next/server";
import { consumeMagicLink } from "@/lib/auth/magic-link";
import { setSessionCookie } from "@/lib/auth/session";

/**
 * GET /api/auth/verify?token=<raw token>
 *
 * Hit by the magic-link email. Verifies the token, creates the user (if
 * first sign-in), issues a session cookie, then redirects to the homepage.
 *
 * Failures redirect to /?signin_error=<reason> so the homepage can show a
 * friendly message rather than a blank API response.
 */
export const dynamic = "force-dynamic";

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://robotropes.dxn.is";
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(`${getAppUrl()}/?signin_error=missing`);
  }

  try {
    const { sessionToken } = await consumeMagicLink(token);
    await setSessionCookie(sessionToken);
    return NextResponse.redirect(`${getAppUrl()}/?signed_in=1`);
  } catch (err) {
    const reason = err instanceof Error && err.message.includes("expired") ? "expired" : "invalid";
    console.error("[auth/verify] failed:", err instanceof Error ? err.message : err);
    return NextResponse.redirect(`${getAppUrl()}/?signin_error=${reason}`);
  }
}
