import type { NextRequest } from "next/server";

/**
 * Returns the client identity used as the unlock/quota scope key for
 * anonymous users. Mirrors the IP extraction logic in middleware so the
 * key matches what the rate-limiter uses.
 */
export function getClientScope(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map(s => s.trim()).filter(Boolean);
    return `ip:${parts[parts.length - 1] || "unknown"}`;
  }
  return `ip:${request.headers.get("x-real-ip") ?? "unknown"}`;
}
