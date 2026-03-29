import type { Tier } from '@/lib/tropes/types';
import type { LlmDetection } from './types';
import { tropeById } from '@/lib/tropes/registry';
import { getTropeColor } from './colors';
import { getLabel } from './labels';

export interface TropeResult {
  tropeId: string;
  tropeName: string;
  tier: Tier;
  count: number;
  weightedScore: number;
  color: string;
  examples: string[];
  explanation: string;
}

export interface DnaStripBand {
  tropeId: string;
  tier: Tier;
  count: number;
  color: string;
  position: number; // 0-1 ordering position
}

export interface ScoreResult {
  rawScore: number;
  label: string;
  labelColor: string;
  tropeResults: TropeResult[];
  topOffenders: TropeResult[];
  dnaStrip: DnaStripBand[];
  totalTropesDetected: number;
  totalInstancesDetected: number;
}

const TIER_WEIGHTS: Record<Tier, number> = {
  1: 5,
  2: 3,
  3: 2,
  4: 1.5,
  5: 1,
};

/**
 * Computes the score from LLM detections (the primary analysis path).
 * Each detection contributes: tier_weight * count * confidence.
 */
export function computeScoreFromLlm(
  detections: LlmDetection[]
): ScoreResult {
  const tropeResults: TropeResult[] = [];

  for (const detection of detections) {
    const weight = TIER_WEIGHTS[detection.tier] ?? 2;
    const count = detection.count ?? 1;
    const weightedScore = weight * count * detection.confidence;

    const def = tropeById(detection.tropeId);

    tropeResults.push({
      tropeId: detection.tropeId,
      tropeName: def?.name ?? detection.tropeId,
      tier: detection.tier,
      count,
      weightedScore: Math.round(weightedScore * 100) / 100,
      color: getTropeColor(detection.tier, count),
      examples: detection.matchedExcerpts.slice(0, 3),
      explanation: detection.explanation,
    });
  }

  // Sort by weighted score descending
  tropeResults.sort((a, b) => b.weightedScore - a.weightedScore);

  const rawScore = tropeResults.reduce((sum, r) => sum + r.weightedScore, 0);
  const totalInstancesDetected = tropeResults.reduce((sum, r) => sum + r.count, 0);
  const { label, color: labelColor } = getLabel(rawScore);

  // DNA strip: ordered by position in the detection list (proxy for text order)
  const dnaStrip: DnaStripBand[] = tropeResults.map((r, i) => ({
    tropeId: r.tropeId,
    tier: r.tier,
    count: r.count,
    color: r.color,
    position: tropeResults.length > 1 ? i / (tropeResults.length - 1) : 0.5,
  }));

  return {
    rawScore: Math.round(rawScore * 100) / 100,
    label,
    labelColor,
    tropeResults,
    topOffenders: tropeResults.slice(0, 5),
    dnaStrip,
    totalTropesDetected: tropeResults.length,
    totalInstancesDetected,
  };
}

// Keep backward-compatible export
export function computeScore(
  _heuristicMatches: unknown[],
  llmDetections: LlmDetection[],
  _textLength: number = 1
): ScoreResult {
  return computeScoreFromLlm(llmDetections);
}
