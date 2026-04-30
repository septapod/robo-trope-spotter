import crypto from "node:crypto";

/**
 * Token primitives for magic-link auth and session cookies.
 *
 * Magic-link tokens and session tokens are both 32 random bytes encoded as
 * base64url. The database stores SHA-256 hashes, never the raw token. The
 * cookie / link URL carries the raw token; on verify, we hash and compare.
 *
 * This means a database compromise alone cannot impersonate users — the
 * attacker would need both the database and ongoing sight of cookies or
 * email contents.
 */

export function generateToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Constant-time string compare. Use for any cookie / token comparison so
 * timing attacks can't leak token contents.
 */
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  return crypto.timingSafeEqual(aBuf, bBuf);
}
