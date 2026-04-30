import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

/**
 * GET /api/auth/me
 *
 * Returns the current user's public profile, or `{ user: null }` when
 * anonymous. Used by client components that decide whether to show a
 * "Sign in" button vs a profile menu.
 */
export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ user: null });

  return NextResponse.json({
    user: {
      id: session.user.id,
      email: session.user.email,
      displayName: session.user.displayName,
      profileUrl: session.user.profileUrl,
    },
  });
}
