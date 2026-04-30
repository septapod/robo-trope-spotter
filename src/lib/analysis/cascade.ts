/**
 * Two-state runner: either we run the full pipeline or we return paused.
 * No middle "degraded mode" — analysis quality is the brand promise.
 */

import { analyzeWithLlm } from './llm-engine';
import { selectTier, recordSpend, PER_ANALYSIS_COST, type Tier } from './budget';
import type { LlmResult } from './types';

export interface CascadeResult {
  tier: Tier;
  detections: LlmResult['detections'];
  processingTimeMs: number;
  /** True when the daily cap is exhausted and we returned no analysis. */
  paused: boolean;
}

export async function runCascade(text: string): Promise<CascadeResult> {
  const start = performance.now();
  const tier = selectTier();

  if (tier === 'paused') {
    return { tier, detections: [], processingTimeMs: 0, paused: true };
  }

  let llm: LlmResult;
  try {
    llm = await analyzeWithLlm(text);
  } catch (err) {
    recordSpend(PER_ANALYSIS_COST / 2);
    throw err;
  }

  recordSpend(PER_ANALYSIS_COST);
  return {
    tier,
    detections: llm.detections,
    processingTimeMs: llm.processingTimeMs,
    paused: false,
  };
}
