/**
 * Two-state budget tracker. Either Robotropes is running at full quality
 * (Sonnet detect + Haiku validate) or it's paused for the day. No degraded
 * middle states — analysis quality is the brand promise; better to pause
 * than to silently underdetect.
 *
 * Spend is approximate per-instance and resets at midnight UTC. The existing
 * 500/day middleware cap remains as the secondary financial floor.
 *
 * Configurable via env: DAILY_BUDGET_USD (default 5).
 */

export type Tier = 'on' | 'paused';

export interface BudgetState {
  tier: Tier;
  spendUsd: number;
  capUsd: number;
  resetAtMs: number;
}

const DEFAULT_DAILY_BUDGET_USD = 5;
const PER_ANALYSIS_COST_USD = 0.024; // ~$0.019 Sonnet detect + ~$0.005 Haiku validate

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

export function selectTier(): Tier {
  maybeReset();
  const cap = getDailyBudget();
  if (cap <= 0) return 'paused';
  return spendUsd >= cap ? 'paused' : 'on';
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

export function recordSpend(amountUsd: number): void {
  if (!Number.isFinite(amountUsd) || amountUsd <= 0) return;
  maybeReset();
  spendUsd += amountUsd;
}

export const PER_ANALYSIS_COST = PER_ANALYSIS_COST_USD;

export function resetSpend(): void {
  spendUsd = 0;
  resetAtMs = getNextMidnightUtc();
}
