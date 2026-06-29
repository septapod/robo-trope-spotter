/**
 * Two-state runner: either we run the full pipeline or we return paused.
 * No middle "degraded mode" — analysis quality is the brand promise.
 *
 * 2026 rebuild: the cascade now fuses two engines. The statistical engine runs
 * locally and for free, measuring the deterministic and forensic tells exactly
 * (leaked markup, em-dash density, burstiness, uniform length, emoji bullets,
 * title case, bolding). The LLM handles meaning, rhetoric, and structure. Where
 * both could speak to the same tell, the deterministic measurement wins.
 */

import { analyzeWithLlm } from './llm-engine';
import { analyzeStatistical, type DocStats } from './statistical-engine';
import { selectTier, recordSpend, PER_ANALYSIS_COST, type Tier } from './budget';
import type { LlmResult } from './types';

export interface CascadeResult {
  tier: Tier;
  detections: LlmResult['detections'];
  processingTimeMs: number;
  /** True when the daily cap is exhausted and we returned no analysis. */
  paused: boolean;
  /** Deterministic document statistics, used for scoring + length gating. */
  stats?: DocStats;
}

export async function runCascade(text: string): Promise<CascadeResult> {
  const start = performance.now();
  const tier = selectTier();

  if (tier === 'paused') {
    return { tier, detections: [], processingTimeMs: 0, paused: true };
  }

  // Local, deterministic, free. Runs regardless of model outcome.
  const statistical = analyzeStatistical(text);

  let llm: LlmResult;
  try {
    llm = await analyzeWithLlm(text);
  } catch (err) {
    recordSpend(PER_ANALYSIS_COST / 2);
    throw err;
  }

  recordSpend(PER_ANALYSIS_COST);

  // Fuse: statistical detections own their tell ids; drop any LLM detection
  // that collides with one (the engine's count is exact, the model's is a guess).
  const statIds = new Set(statistical.detections.map((d) => d.tropeId));
  const detections = [
    ...llm.detections.filter((d) => !statIds.has(d.tropeId)),
    ...statistical.detections,
  ];

  return {
    tier,
    detections,
    processingTimeMs: Math.round(performance.now() - start),
    paused: false,
    stats: statistical.stats,
  };
}
