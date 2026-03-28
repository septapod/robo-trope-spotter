import type { AnalysisMatch, Tier } from '@/lib/tropes/types';
import type { LlmDetection } from './types';
import { tropeById } from '@/lib/tropes/registry';
import { getTropeColor } from './colors';
import { getLabel } from './labels';

// ── Exported types ──────────────────────────────────────────────────

export interface TropeResult {
  tropeId: string;
  tropeName: string;
  tier: Tier;
  count: number;
  weightedScore: number; // count * tier weight
  color: string; // hex color
  examples: string[]; // matched text excerpts (max 3)
}

export interface DnaStripBand {
  tropeId: string;
  tier: Tier;
  count: number;
  color: string;
  position: number; // 0-1, first occurrence position in text as fraction
}

export interface ScoreResult {
  rawScore: number;
  label: string;
  labelColor: string;
  tropeResults: TropeResult[]; // all detected tropes, sorted by weightedScore desc
  topOffenders: TropeResult[]; // top 5
  dnaStrip: DnaStripBand[];
  totalTropesDetected: number;
  totalInstancesDetected: number;
}

// ── Tier weight lookup ──────────────────────────────────────────────

const TIER_WEIGHTS: Record<Tier, number> = {
  1: 5,
  2: 3,
  3: 2,
  4: 1.5,
  5: 1,
};

// ── Internal accumulator ────────────────────────────────────────────

interface TropeAccumulator {
  tropeId: string;
  tier: Tier;
  weightedScore: number;
  count: number;
  examples: string[];
  firstPosition: number; // raw character index of first occurrence
}

// ── Main scoring function ───────────────────────────────────────────

/**
 * Combines heuristic regex matches and LLM detections into a single
 * weighted composite score with per-trope breakdowns and a DNA strip.
 *
 * @param heuristicMatches - Matches from the heuristic (regex/word-list) engine.
 * @param llmDetections    - Detections returned by the LLM analysis pass.
 * @param textLength       - Total character length of the analyzed text (for DNA strip positioning).
 *                           Defaults to 1 to avoid division by zero.
 */
export function computeScore(
  heuristicMatches: AnalysisMatch[],
  llmDetections: LlmDetection[],
  textLength: number = 1
): ScoreResult {
  const accumulators = new Map<string, TropeAccumulator>();

  // Helper: get or create an accumulator for a trope.
  function getAcc(tropeId: string, tier: Tier): TropeAccumulator {
    let acc = accumulators.get(tropeId);
    if (!acc) {
      acc = {
        tropeId,
        tier,
        weightedScore: 0,
        count: 0,
        examples: [],
        firstPosition: Infinity,
      };
      accumulators.set(tropeId, acc);
    }
    return acc;
  }

  // Process heuristic matches: each match scores tier weight * 1.
  for (const match of heuristicMatches) {
    const weight = TIER_WEIGHTS[match.tier];
    const acc = getAcc(match.tropeId, match.tier);
    acc.weightedScore += weight;
    acc.count += 1;
    if (acc.examples.length < 3) {
      acc.examples.push(match.matchedText);
    }
    if (match.startIndex < acc.firstPosition) {
      acc.firstPosition = match.startIndex;
    }
  }

  // Process LLM detections: each detection scores tier weight * confidence.
  for (const detection of llmDetections) {
    const weight = TIER_WEIGHTS[detection.tier];
    const acc = getAcc(detection.tropeId, detection.tier);
    acc.weightedScore += weight * detection.confidence;
    acc.count += 1;
    for (const excerpt of detection.matchedExcerpts) {
      if (acc.examples.length < 3) {
        acc.examples.push(excerpt);
      }
    }
    // LLM detections don't have a character index, so leave firstPosition as-is.
  }

  // Build TropeResult array.
  const safeDivisor = Math.max(textLength, 1);
  const tropeResults: TropeResult[] = [];

  for (const acc of accumulators.values()) {
    const def = tropeById(acc.tropeId);
    tropeResults.push({
      tropeId: acc.tropeId,
      tropeName: def?.name ?? acc.tropeId,
      tier: acc.tier,
      count: acc.count,
      weightedScore: Math.round(acc.weightedScore * 100) / 100,
      color: getTropeColor(acc.tier, acc.count),
      examples: acc.examples,
    });
  }

  // Sort by weighted score descending.
  tropeResults.sort((a, b) => b.weightedScore - a.weightedScore);

  // Compute totals.
  const rawScore = tropeResults.reduce((sum, r) => sum + r.weightedScore, 0);
  const totalInstancesDetected = tropeResults.reduce((sum, r) => sum + r.count, 0);
  const { label, color: labelColor } = getLabel(rawScore);

  // DNA strip: one band per trope, ordered by first occurrence position.
  const dnaStrip: DnaStripBand[] = Array.from(accumulators.values())
    .filter((acc) => acc.firstPosition !== Infinity)
    .sort((a, b) => a.firstPosition - b.firstPosition)
    .map((acc) => ({
      tropeId: acc.tropeId,
      tier: acc.tier,
      count: acc.count,
      color: getTropeColor(acc.tier, acc.count),
      position: Math.min(acc.firstPosition / safeDivisor, 1),
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
