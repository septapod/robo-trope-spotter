import type { Tier, Category, Reliability } from '@/lib/tropes/types';
import type { LlmDetection } from './types';
import type { DocStats } from './statistical-engine';
import { tropeById } from '@/lib/tropes/registry';
import { metaFor, reliabilityWeight } from '@/lib/tropes/meta';
import { getTropeColor } from './colors';
import { getLabel } from './labels';

export interface TropeResult {
  tropeId: string;
  tropeName: string;
  tier: Tier;
  category: Category;
  reliability: Reliability;
  count: number;
  weightedScore: number;
  color: string;
  examples: string[];
  explanation: string;
  suggestion: string;
}

export interface DnaStripBand {
  tropeId: string;
  tier: Tier;
  count: number;
  color: string;
  position: number;
}

export interface CategoryScore {
  category: Category;
  weighted: number;
  tropeCount: number;
}

export type Confidence = 'none' | 'low' | 'standard';

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
  actualWordCount: number;
  // ---- 2026 rebuild additions ----
  /** Length/co-occurrence confidence band. Drives how loudly the UI should speak. */
  confidence: Confidence;
  /** Human-readable note on why the confidence band is what it is. */
  confidenceNote: string;
  /** True when the text is too short to score reliably (< ~100 words). */
  gated: boolean;
  /** Per-research-family sub-scores for the report card. */
  categoryScores: CategoryScore[];
  /** The standing "advisory, not proof" caveat, scaled to the result. */
  advisory: string;
  /** Distinct research families that fired (the co-occurrence breadth). */
  distinctCategories: number;
  documentStats?: DocStats;
}

const MIN_WORDS_FOR_SCORE = 100;
const LOW_CONFIDENCE_CEILING = 250;
// Density (weighted tells per 100 words) is multiplied by this to land on a
// friendly 0-100+ display scale. Calibrated so clean human prose ≈ 0-3,
// moderate ≈ 25-35, unedited-AI ≈ 70-100+.
const DISPLAY_SCALE = 10;
// One lexical word-list shouldn't be able to dominate the whole score.
const PER_TROPE_COUNT_CAP = 6;

const ADVISORY_STRONG =
  'Treat this as a prompt to read the text again, not a verdict. Polished humans and careless machines write the same sentences. It points at patterns worth a closer look, never proof of who wrote it.';
const ADVISORY_LIGHT =
  'A few characteristics worth a glance, nothing conclusive. Read it as advisory, not a judgment of authorship.';

function diversityFactor(distinctCategories: number): number {
  // 1 family → 0.55 (likely a false-positive cluster); 3 → ~1.0; 5+ → 1.25.
  return Math.max(0.55, Math.min(1.25, 0.55 + 0.18 * (distinctCategories - 1)));
}

/**
 * Density-normalized, reliability-weighted, co-occurrence-gated score.
 */
export function computeScoreFromLlm(
  detections: LlmDetection[],
  wordCount: number = 0,
  stats?: DocStats
): ScoreResult {
  const actualWordCount = wordCount || stats?.wordCount || 0;
  const gated = actualWordCount > 0 && actualWordCount < MIN_WORDS_FOR_SCORE;

  const tropeResults: TropeResult[] = [];
  const categoryWeighted = new Map<Category, { weighted: number; count: number }>();
  let rawWeightedTotal = 0;
  let sawHighReliability = false;
  let sawMediumReliability = false;

  for (const d of detections) {
    const meta = metaFor(d.tropeId);
    const w = reliabilityWeight(d.tropeId);
    const cappedCount = Math.min(d.count ?? 1, PER_TROPE_COUNT_CAP);
    const weightedScore = w * cappedCount * d.confidence;

    if (meta.reliability === 'high' || meta.reliability === 'conclusive') sawHighReliability = true;
    if (meta.reliability === 'medium') sawMediumReliability = true;

    rawWeightedTotal += weightedScore;

    const bucket = categoryWeighted.get(meta.category) ?? { weighted: 0, count: 0 };
    bucket.weighted += weightedScore;
    bucket.count += 1;
    categoryWeighted.set(meta.category, bucket);

    const def = tropeById(d.tropeId);
    tropeResults.push({
      tropeId: d.tropeId,
      tropeName: def?.name ?? d.tropeId,
      tier: d.tier,
      category: meta.category,
      reliability: meta.reliability,
      count: d.count ?? 1,
      weightedScore: Math.round(weightedScore * 100) / 100,
      color: getTropeColor(d.tier, d.count ?? 1),
      examples: d.matchedExcerpts.slice(0, 3),
      explanation: d.explanation,
      suggestion: d.suggestion || '',
    });
  }

  tropeResults.sort((a, b) => b.weightedScore - a.weightedScore);

  const distinctCategories = categoryWeighted.size;

  // Density per 100 words, with a 100-word floor so short text can't inflate.
  const safeWords = Math.max(actualWordCount, MIN_WORDS_FOR_SCORE);
  const density = (rawWeightedTotal / safeWords) * 100;

  // Co-occurrence gating: breadth across families raises confidence; a result
  // built only from weak lexical/formatting tells gets damped, because that is
  // exactly where false positives live (Liang 2023).
  const onlyWeak = !sawHighReliability && !sawMediumReliability;
  const reliabilityFloor = onlyWeak ? 0.65 : 1;

  let finalScore = density * diversityFactor(distinctCategories) * reliabilityFloor * DISPLAY_SCALE;
  // A single conclusive tell (leaked markup) should read loud regardless of length.
  if (tropeResults.some((t) => t.reliability === 'conclusive')) {
    finalScore = Math.max(finalScore, 80);
  }
  finalScore = Math.min(finalScore, 130);
  // When gated, present detections but never a confident high score.
  if (gated) finalScore = Math.min(finalScore, 25);

  const totalInstancesDetected = tropeResults.reduce((sum, r) => sum + r.count, 0);
  const { label, color: labelColor } = getLabel(finalScore);

  // Confidence band
  let confidence: Confidence;
  let confidenceNote: string;
  if (gated) {
    confidence = 'none';
    confidenceNote = `Only ${actualWordCount} words. Under ${MIN_WORDS_FOR_SCORE}, there isn't enough text to score reliably. Short passages trip up every detector. Read this as a glance, not a grade.`;
  } else if (actualWordCount < LOW_CONFIDENCE_CEILING || distinctCategories <= 1) {
    confidence = 'low';
    confidenceNote =
      actualWordCount < LOW_CONFIDENCE_CEILING
        ? `Around ${actualWordCount} words, enough for a read, but the score carries a wide margin. More text would sharpen it.`
        : `The tells here are concentrated in one family, which is the zone where false positives live. Lower confidence on purpose.`;
  } else {
    confidence = 'standard';
    confidenceNote = `${actualWordCount} words across ${distinctCategories} families of tells, enough breadth for a confident read.`;
  }

  const categoryScores: CategoryScore[] = [...categoryWeighted.entries()]
    .map(([category, v]) => ({
      category,
      weighted: Math.round(v.weighted * 100) / 100,
      tropeCount: v.count,
    }))
    .sort((a, b) => b.weighted - a.weighted);

  const dnaStrip: DnaStripBand[] = tropeResults.map((r, i) => ({
    tropeId: r.tropeId,
    tier: r.tier,
    count: r.count,
    color: r.color,
    position: tropeResults.length > 1 ? i / (tropeResults.length - 1) : 0.5,
  }));

  return {
    rawScore: Math.round(finalScore),
    label,
    labelColor,
    tropeResults,
    topOffenders: tropeResults.slice(0, 5),
    dnaStrip,
    totalTropesDetected: tropeResults.length,
    totalInstancesDetected,
    wordCount: safeWords,
    actualWordCount,
    confidence,
    confidenceNote,
    gated,
    categoryScores,
    advisory: finalScore >= 30 ? ADVISORY_STRONG : ADVISORY_LIGHT,
    distinctCategories,
    documentStats: stats,
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
