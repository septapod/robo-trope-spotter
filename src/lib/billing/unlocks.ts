/**
 * Active-unlock lookup and grant helpers.
 *
 * An unlock bypasses the daily free quota. Three sources:
 *   newsletter_30d  AI for FIs subscription, 30 days unlimited
 *   tip_today       Polar tip succeeded, today's quota lifted
 *   gift_today      User picked $0 / "no thanks", today's quota lifted (capped)
 */

import { and, gt, eq, or, isNull, isNotNull, desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { unlocks, type Unlock } from "@/db/schema";

export type UnlockType = "newsletter_30d" | "tip_today" | "gift_today";

const TTL_MS: Record<UnlockType, number> = {
  newsletter_30d: 30 * 24 * 60 * 60 * 1000,
  tip_today: endOfTodayUtcMsFromNow(),
  gift_today: endOfTodayUtcMsFromNow(),
};

function endOfTodayUtcMsFromNow(): number {
  const now = new Date();
  const tomorrow = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0)
  );
  return tomorrow.getTime() - now.getTime();
}

function expirationFor(type: UnlockType): Date {
  if (type === "newsletter_30d") {
    return new Date(Date.now() + TTL_MS.newsletter_30d);
  }
  // tip_today and gift_today expire at next midnight UTC
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0)
  );
}

export interface UnlockLookup {
  userId?: string | null;
  scopeKey?: string | null;
}

/**
 * Returns the currently-active unlock for the given user or scope, or null
 * if none. When multiple are active, the longest-living one wins (so a
 * 30-day newsletter unlock takes precedence over a today-only tip).
 */
export async function findActiveUnlock(lookup: UnlockLookup): Promise<Unlock | null> {
  const now = new Date();
  const conditions = [];
  if (lookup.userId) conditions.push(eq(unlocks.userId, lookup.userId));
  if (lookup.scopeKey) conditions.push(eq(unlocks.scopeKey, lookup.scopeKey));
  if (conditions.length === 0) return null;

  const rows = await db()
    .select()
    .from(unlocks)
    .where(and(or(...conditions), gt(unlocks.expiresAt, now)))
    .orderBy(desc(unlocks.expiresAt))
    .limit(1);
  return rows[0] ?? null;
}

interface GrantInput {
  userId?: string | null;
  scopeKey?: string | null;
  unlockType: UnlockType;
  polarCheckoutId?: string;
}

export async function grantUnlock(input: GrantInput): Promise<Unlock> {
  if (!input.userId && !input.scopeKey) {
    throw new Error("grantUnlock requires either userId or scopeKey.");
  }
  const inserted = await db()
    .insert(unlocks)
    .values({
      userId: input.userId ?? null,
      scopeKey: input.scopeKey ?? null,
      unlockType: input.unlockType,
      polarCheckoutId: input.polarCheckoutId,
      expiresAt: expirationFor(input.unlockType),
    })
    .returning();
  return inserted[0];
}

/**
 * Has this scope already used a gift_today unlock today? Used to cap the
 * "$0 / no thanks" path at one per day per user/IP so it can't be looped.
 */
export async function hasUsedGiftToday(lookup: UnlockLookup): Promise<boolean> {
  const startOfDayUtc = new Date();
  startOfDayUtc.setUTCHours(0, 0, 0, 0);
  const conditions = [];
  if (lookup.userId) conditions.push(eq(unlocks.userId, lookup.userId));
  if (lookup.scopeKey) conditions.push(eq(unlocks.scopeKey, lookup.scopeKey));
  if (conditions.length === 0) return false;

  const rows = await db()
    .select({ count: sql<number>`count(*)` })
    .from(unlocks)
    .where(
      and(
        or(...conditions),
        eq(unlocks.unlockType, "gift_today"),
        gt(unlocks.createdAt, startOfDayUtc)
      )
    );
  return (rows[0]?.count ?? 0) > 0;
}

/**
 * Mark the currently-deduced unlock as silent — useful in tests/admin.
 * Not exposed to public routes.
 */
export async function expireAllUnlocks(lookup: UnlockLookup): Promise<void> {
  const conditions = [];
  if (lookup.userId) conditions.push(eq(unlocks.userId, lookup.userId));
  if (lookup.scopeKey) conditions.push(eq(unlocks.scopeKey, lookup.scopeKey));
  if (conditions.length === 0) return;
  await db()
    .update(unlocks)
    .set({ expiresAt: new Date() })
    .where(and(or(...conditions), gt(unlocks.expiresAt, new Date())));
}

// Suppress unused-import warning when isNull/isNotNull aren't used in a build
void isNull;
void isNotNull;
