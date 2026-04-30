/**
 * Per-day free analysis quota for the AllowanceExhaustedModal funnel.
 *
 * Tracked in-memory per instance with midnight-UTC reset, mirroring the
 * existing rate-limit middleware pattern. Approximate at multi-instance
 * scale; that's acceptable here because the quota is a UX funnel, not a
 * cost cap. The cost cap is the global 500/day in middleware.
 *
 * Scope is per logged-in user (when authenticated) or per IP (when not).
 */

const FREE_PER_DAY_DEFAULT = 5;

interface Counter {
  count: number;
  resetAtMs: number;
}

const counts = new Map<string, Counter>();

function getNextMidnightUtc(): number {
  const now = new Date();
  const tomorrow = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0)
  );
  return tomorrow.getTime();
}

function getFreePerDay(): number {
  const v = parseInt(process.env.FREE_ANALYSES_PER_DAY ?? '', 10);
  return Number.isFinite(v) && v > 0 ? v : FREE_PER_DAY_DEFAULT;
}

function bucketFor(scope: string): Counter {
  const now = Date.now();
  const existing = counts.get(scope);
  if (!existing || now >= existing.resetAtMs) {
    const fresh: Counter = { count: 0, resetAtMs: getNextMidnightUtc() };
    counts.set(scope, fresh);
    return fresh;
  }
  return existing;
}

export interface QuotaState {
  used: number;
  limit: number;
  remaining: number;
  exhausted: boolean;
}

export function getQuota(scope: string): QuotaState {
  const limit = getFreePerDay();
  const bucket = bucketFor(scope);
  const remaining = Math.max(0, limit - bucket.count);
  return {
    used: bucket.count,
    limit,
    remaining,
    exhausted: bucket.count >= limit,
  };
}

export function consumeQuota(scope: string): QuotaState {
  bucketFor(scope).count++;
  return getQuota(scope);
}
