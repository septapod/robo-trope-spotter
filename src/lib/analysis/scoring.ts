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
  position: number;
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
  wordCount: number;
}

const TIER_WEIGHTS: Record<Tier, number> = {
  1: 5,
  2: 3,
  3: 2,
  4: 1.5,
  5: 1,
};

const EM_DASH_SCORE_CAP = 4;

// Normalize scores to "tropes per 500 words" so short dense text
// scores higher than long text with the same absolute count.
const NORMALIZATION_BASE = 500;

/**
 * Computes a density-normalized score from LLM detections.
 * The score represents weighted trope density per 500 words.
 */
export function computeScoreFromLlm(
  detections: LlmDetection[],
  wordCount: number = 500
): ScoreResult {
  const tropeResults: TropeResult[] = [];

  let rawWeightedTotal = 0;

  for (const detection of detections) {
    const weight = TIER_WEIGHTS[detection.tier] ?? 2;
    const count = detection.count ?? 1;
    let weightedScore = weight * count * detection.confidence;

    if (detection.tropeId === 'em-dash-addiction') {
      weightedScore = Math.min(weightedScore, EM_DASH_SCORE_CAP);
    }

    rawWeightedTotal += weightedScore;

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

  // Normalize: score per 500 words. Floor at 300 words so short
  // LinkedIn posts don't get wildly inflated.
  const safeWordCount = Math.max(wordCount, 300);
  const normalizedScore = (rawWeightedTotal / safeWordCount) * NORMALIZATION_BASE;

  const totalInstancesDetected = tropeResults.reduce((sum, r) => sum + r.count, 0);
  const { label, color: labelColor } = getLabel(normalizedScore);

  const dnaStrip: DnaStripBand[] = tropeResults.map((r, i) => ({
    tropeId: r.tropeId,
    tier: r.tier,
    count: r.count,
    color: r.color,
    position: tropeResults.length > 1 ? i / (tropeResults.length - 1) : 0.5,
  }));

  return {
    rawScore: Math.round(normalizedScore),
    label,
    labelColor,
    tropeResults,
    topOffenders: tropeResults.slice(0, 5),
    dnaStrip,
    totalTropesDetected: tropeResults.length,
    totalInstancesDetected,
    wordCount: safeWordCount,
  };
}

// Backward-compatible export
export function computeScore(
  _heuristicMatches: unknown[],
  llmDetections: LlmDetection[],
  _textLength: number = 1
): ScoreResult {
  return computeScoreFromLlm(llmDetections);
}
