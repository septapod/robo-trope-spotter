import { NextResponse } from "next/server";
import { getCurrentSession, clearSessionCookie, revokeSession } from "@/lib/auth/session";

/**
 * POST /api/auth/signout
 *
 * Revokes the current session row and clears the cookie. Idempotent — calling
 * when not signed in returns 200 anyway.
 */
export const dynamic = "force-dynamic";

export async function POST(): Promise<NextResponse> {
  const session = await getCurrentSession();
  if (session) {
    await revokeSession(session.sessionId);
  }
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
