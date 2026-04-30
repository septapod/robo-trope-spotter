/**
 * Daily-budget tracker and tier selector for the Energy Meter cascade.
 *
 * Tiers, in descending power:
 *   caffeine: full pipeline (Sonnet detect + Haiku validate)
 *   tea:      Sonnet detect only (skip the validation pass)
 *   water:    regex-only floor (no LLM call)
 *   napping:  cap exhausted, no analysis, return tomorrow
 *
 * Budget is approximate per-instance and resets at midnight UTC. The
 * existing per-IP and 500/day middleware caps remain as the financial floor.
 * This module's job is the UX cascade, not the financial limit.
 *
 * Thresholds are configurable via env vars. Defaults assume a $5/day budget
 * with the cascade kicking in at ~40% / ~70% / ~100% of that.
 */

export type Tier = 'caffeine' | 'tea' | 'water' | 'napping';

export interface BudgetState {
  tier: Tier;
  spendUsd: number;
  capUsd: number;
  resetAtMs: number;
}

const DEFAULT_DAILY_BUDGET_USD = 5;
const DEFAULT_TEA_THRESHOLD = 0.4;
const DEFAULT_WATER_THRESHOLD = 0.7;
const DEFAULT_NAPPING_THRESHOLD = 1.0;

let spendUsd = 0;
let resetAtMs = getNextMidnightUtc();

function getNextMidnightUtc(): number {
  const now = new Date();
  const tomorrow = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0)
  );
  return tomorrow.getTime();
}

function maybeReset(): void {
  if (Date.now() >= resetAtMs) {
    spendUsd = 0;
    resetAtMs = getNextMidnightUtc();
  }
}

function getDailyBudget(): number {
  const env = parseFloat(process.env.DAILY_BUDGET_USD ?? '');
  return Number.isFinite(env) && env > 0 ? env : DEFAULT_DAILY_BUDGET_USD;
}

function getThresholds(): { tea: number; water: number; napping: number } {
  return {
    tea: parseFloat(process.env.TEA_THRESHOLD ?? '') || DEFAULT_TEA_THRESHOLD,
    water: parseFloat(process.env.WATER_THRESHOLD ?? '') || DEFAULT_WATER_THRESHOLD,
    napping: parseFloat(process.env.NAPPING_THRESHOLD ?? '') || DEFAULT_NAPPING_THRESHOLD,
  };
}

export function selectTier(): Tier {
  maybeReset();
  const cap = getDailyBudget();
  if (cap <= 0) return 'napping';
  const ratio = spendUsd / cap;
  const t = getThresholds();
  if (ratio >= t.napping) return 'napping';
  if (ratio >= t.water) return 'water';
  if (ratio >= t.tea) return 'tea';
  return 'caffeine';
}

export function getBudgetState(): BudgetState {
  maybeReset();
  return {
    tier: selectTier(),
    spendUsd: Math.round(spendUsd * 10000) / 10000,
    capUsd: getDailyBudget(),
    resetAtMs,
  };
}

/**
 * Record actual spend after an analysis completes. Idempotent guard against
 * negative or non-finite inputs.
 */
export function recordSpend(amountUsd: number): void {
  if (!Number.isFinite(amountUsd) || amountUsd <= 0) return;
  maybeReset();
  spendUsd += amountUsd;
}

/**
 * Cost estimates per pipeline tier. Used to record approximate spend when the
 * Anthropic SDK doesn't return token usage (e.g., cached responses, errors).
 * Real usage is recorded per-call in cascade.ts when available.
 */
export const TIER_FALLBACK_COST_USD: Record<Tier, number> = {
  caffeine: 0.024, // ~$0.019 Sonnet detect + ~$0.005 Haiku validate
  tea: 0.019,      // ~$0.019 Sonnet detect, no validation
  water: 0,        // regex-only, free
  napping: 0,
};

/**
 * Test/admin hook to force-reset spend (used when admin manually toggles).
 * Not exposed via public API.
 */
export function resetSpend(): void {
  spendUsd = 0;
  resetAtMs = getNextMidnightUtc();
}
