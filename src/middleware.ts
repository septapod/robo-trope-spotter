import { NextRequest, NextResponse } from 'next/server';

/**
 * Rate limiting middleware.
 * - Per-IP: 20 requests per hour to /api/analyze
 * - Global: 500 analyses per day (resets at midnight UTC)
 *
 * Uses in-memory stores. On serverless, each instance has its own map,
 * so the effective per-IP limit is per-instance. The global cap is
 * approximate but still provides real protection against bill spikes.
 */

interface RateEntry {
  count: number;
  resetAt: number;
}

const ipStore = new Map<string, RateEntry>();
const IP_LIMIT = 20;
const IP_WINDOW_MS = 60 * 60 * 1000; // 1 hour

let globalCount = 0;
let globalResetAt = getNextMidnightUtc();
const GLOBAL_DAILY_CAP = 500;

// --- Share tracking rate limit (separate store + budget) ---
const shareIpStore = new Map<string, RateEntry>();
const SHARE_IP_LIMIT = Number(process.env.TRACK_SHARE_IP_LIMIT) || 60;
const SHARE_IP_WINDOW_MS = 60 * 60 * 1000; // 1 hour

let shareGlobalCount = 0;
let shareGlobalResetAt = getNextMidnightUtc();
const SHARE_GLOBAL_DAILY_CAP = Number(process.env.TRACK_SHARE_GLOBAL_CAP) || 5000;

function getNextMidnightUtc(): number {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  ));
  return tomorrow.getTime();
}

function getClientIp(request: NextRequest): string {
  // Use the last value in X-Forwarded-For (set by the edge proxy, not the client)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded.split(',').map(s => s.trim()).filter(Boolean);
    return parts[parts.length - 1] || 'unknown';
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Only rate-limit POST (not OPTIONS/preflight)
  if (request.method !== 'POST') {
    return NextResponse.next();
  }

  const now = Date.now();

  // --- Share tracking branch (dedicated store, higher cap) ---
  if (path.startsWith('/api/track-share')) {
    if (now >= shareGlobalResetAt) {
      shareGlobalCount = 0;
      shareGlobalResetAt = getNextMidnightUtc();
    }
    if (shareGlobalCount >= SHARE_GLOBAL_DAILY_CAP) {
      return NextResponse.json(
        { error: 'Share tracking daily cap reached.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((shareGlobalResetAt - now) / 1000)) },
        }
      );
    }

    const shareIp = getClientIp(request);
    const shareEntry = shareIpStore.get(shareIp);
    if (shareEntry) {
      if (now >= shareEntry.resetAt) {
        shareIpStore.set(shareIp, { count: 1, resetAt: now + SHARE_IP_WINDOW_MS });
      } else if (shareEntry.count >= SHARE_IP_LIMIT) {
        const retryAfter = Math.ceil((shareEntry.resetAt - now) / 1000);
        return NextResponse.json(
          { error: 'Share tracking rate limit exceeded.' },
          { status: 429, headers: { 'Retry-After': String(retryAfter) } }
        );
      } else {
        shareEntry.count++;
      }
    } else {
      shareIpStore.set(shareIp, { count: 1, resetAt: now + SHARE_IP_WINDOW_MS });
    }

    shareGlobalCount++;
    if (shareGlobalCount % 500 === 0) {
      for (const [key, val] of shareIpStore) {
        if (now >= val.resetAt) shareIpStore.delete(key);
      }
    }

    return NextResponse.next();
  }

  // --- Analysis branch (existing) ---
  if (!path.startsWith('/api/analyze') && !path.startsWith('/api/reanalyze')) {
    return NextResponse.next();
  }

  // --- Global daily cap ---
  if (now >= globalResetAt) {
    globalCount = 0;
    globalResetAt = getNextMidnightUtc();
  }

  if (globalCount >= GLOBAL_DAILY_CAP) {
    return NextResponse.json(
      {
        error: 'The trope spotter has hit its daily limit. Try again tomorrow.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((globalResetAt - now) / 1000)),
        },
      }
    );
  }

  // --- Per-IP rate limit ---
  const ip = getClientIp(request);
  const entry = ipStore.get(ip);

  if (entry) {
    if (now >= entry.resetAt) {
      // Window expired, reset
      ipStore.set(ip, { count: 1, resetAt: now + IP_WINDOW_MS });
    } else if (entry.count >= IP_LIMIT) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      return NextResponse.json(
        {
          error: `Slow down. ${IP_LIMIT} analyses per hour. Try again in ${Math.ceil(retryAfter / 60)} minutes.`,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfter) },
        }
      );
    } else {
      entry.count++;
    }
  } else {
    ipStore.set(ip, { count: 1, resetAt: now + IP_WINDOW_MS });
  }

  // Increment global counter
  globalCount++;

  // Clean up old IP entries periodically (every 100 requests)
  if (globalCount % 100 === 0) {
    for (const [key, val] of ipStore) {
      if (now >= val.resetAt) ipStore.delete(key);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/analyze', '/api/reanalyze', '/api/track-share'],
};
