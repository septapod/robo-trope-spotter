/**
 * Scoring logic for the three-model eval. Compares model detections
 * against hand-labeled ground truth and computes recall, precision, F1
 * overall and per-tier.
 */

import { allTropes } from '../src/lib/tropes/registry';
import type { Tier } from '../src/lib/tropes/types';
import type {
  TestEntry,
  ModelRun,
  PerTestScore,
  AggregateScore,
  ModelDetection,
} from './types';

const TROPE_TIER_MAP = new Map(allTropes.map(t => [t.id, t.tier]));

const ALL_TIERS: Tier[] = [1, 2, 3, 4, 5];

/**
 * Score a single model's run against the test entry's ground truth.
 *
 * A detection is "correct" iff its tropeId is in the ground truth.
 * We do NOT match on excerpt, count, or confidence — only on tropeId presence.
 * Severity tier comes from the canonical registry, not the model's claim.
 */
export function scoreSingleRun(entry: TestEntry, run: ModelRun): PerTestScore {
  const groundTruthIds = new Set(entry.groundTruth.map(g => g.tropeId));
  const detectedIds = new Set(run.detections.map(d => d.tropeId));
  const expectedNonTropeIds = new Set(entry.expectedNonTropes ?? []);

  const truePositives: string[] = [];
  const falseNegatives: string[] = [];
  const falsePositives: string[] = [];
  const expectedNonTropeViolations: string[] = [];

  for (const id of groundTruthIds) {
    if (detectedIds.has(id)) truePositives.push(id);
    else falseNegatives.push(id);
  }

  for (const id of detectedIds) {
    if (!groundTruthIds.has(id)) falsePositives.push(id);
    if (expectedNonTropeIds.has(id)) expectedNonTropeViolations.push(id);
  }

  return {
    testId: entry.id,
    model: run.model,
    truePositives,
    falseNegatives,
    falsePositives,
    expectedNonTropeViolations,
  };
}

interface PerTierAccumulator {
  truePositives: number;
  falseNegatives: number;
  falsePositives: number;
}

function emptyTierAcc(): Record<Tier, PerTierAccumulator> {
  return {
    1: { truePositives: 0, falseNegatives: 0, falsePositives: 0 },
    2: { truePositives: 0, falseNegatives: 0, falsePositives: 0 },
    3: { truePositives: 0, falseNegatives: 0, falsePositives: 0 },
    4: { truePositives: 0, falseNegatives: 0, falsePositives: 0 },
    5: { truePositives: 0, falseNegatives: 0, falsePositives: 0 },
  };
}

function tierFor(tropeId: string): Tier | undefined {
  return TROPE_TIER_MAP.get(tropeId);
}

/**
 * Aggregate per-test scores into model-level metrics with per-tier breakdown.
 */
export function aggregate(model: string, runs: ModelRun[], scores: PerTestScore[]): AggregateScore {
  const tierAcc = emptyTierAcc();
  let totalTruePositives = 0;
  let totalFalseNegatives = 0;
  let totalFalsePositives = 0;
  let totalExpectedNonTropeViolations = 0;
  let totalGroundTruth = 0;

  for (const score of scores) {
    totalTruePositives += score.truePositives.length;
    totalFalseNegatives += score.falseNegatives.length;
    totalFalsePositives += score.falsePositives.length;
    totalExpectedNonTropeViolations += score.expectedNonTropeViolations.length;
    totalGroundTruth += score.truePositives.length + score.falseNegatives.length;

    for (const id of score.truePositives) {
      const tier = tierFor(id);
      if (tier) tierAcc[tier].truePositives++;
    }
    for (const id of score.falseNegatives) {
      const tier = tierFor(id);
      if (tier) tierAcc[tier].falseNegatives++;
    }
    for (const id of score.falsePositives) {
      const tier = tierFor(id);
      if (tier) tierAcc[tier].falsePositives++;
    }
  }

  const recall = totalTruePositives + totalFalseNegatives === 0
    ? 0
    : totalTruePositives / (totalTruePositives + totalFalseNegatives);
  const precision = totalTruePositives + totalFalsePositives === 0
    ? 0
    : totalTruePositives / (totalTruePositives + totalFalsePositives);
  const f1 = recall + precision === 0 ? 0 : (2 * recall * precision) / (recall + precision);

  const perTier: AggregateScore['perTier'] = {} as AggregateScore['perTier'];
  for (const tier of ALL_TIERS) {
    const acc = tierAcc[tier];
    const tierRecall = acc.truePositives + acc.falseNegatives === 0
      ? 0
      : acc.truePositives / (acc.truePositives + acc.falseNegatives);
    const tierPrecision = acc.truePositives + acc.falsePositives === 0
      ? 0
      : acc.truePositives / (acc.truePositives + acc.falsePositives);
    perTier[tier] = {
      recall: tierRecall,
      precision: tierPrecision,
      truePositives: acc.truePositives,
      falseNegatives: acc.falseNegatives,
      falsePositives: acc.falsePositives,
    };
  }

  const totalDurationMs = runs.reduce((sum, r) => sum + r.durationMs, 0);

  return {
    model,
    totalTests: runs.length,
    totalGroundTruth,
    totalTruePositives,
    totalFalseNegatives,
    totalFalsePositives,
    totalExpectedNonTropeViolations,
    recall,
    precision,
    f1,
    perTier,
    totalDurationMs,
  };
}

export function formatPercent(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

/**
 * Render a markdown comparison table for the writeup.
 */
export function renderComparisonTable(aggregates: AggregateScore[]): string {
  const headerRow = ['Metric', ...aggregates.map(a => a.model)].join(' | ');
  const separator = ['---', ...aggregates.map(() => '---')].join(' | ');

  const rows: string[] = [
    `| ${headerRow} |`,
    `| ${separator} |`,
    `| Recall (overall) | ${aggregates.map(a => formatPercent(a.recall)).join(' | ')} |`,
    `| Precision (overall) | ${aggregates.map(a => formatPercent(a.precision)).join(' | ')} |`,
    `| F1 (overall) | ${aggregates.map(a => formatPercent(a.f1)).join(' | ')} |`,
    `| Tier 1 recall | ${aggregates.map(a => formatPercent(a.perTier[1].recall)).join(' | ')} |`,
    `| Tier 2 recall | ${aggregates.map(a => formatPercent(a.perTier[2].recall)).join(' | ')} |`,
    `| Tier 3 recall | ${aggregates.map(a => formatPercent(a.perTier[3].recall)).join(' | ')} |`,
    `| Tier 4 recall | ${aggregates.map(a => formatPercent(a.perTier[4].recall)).join(' | ')} |`,
    `| Tier 5 recall | ${aggregates.map(a => formatPercent(a.perTier[5].recall)).join(' | ')} |`,
    `| False positives | ${aggregates.map(a => a.totalFalsePositives.toString()).join(' | ')} |`,
    `| Expected-non-trope violations | ${aggregates.map(a => a.totalExpectedNonTropeViolations.toString()).join(' | ')} |`,
    `| Total duration | ${aggregates.map(a => `${(a.totalDurationMs / 1000).toFixed(1)}s`).join(' | ')} |`,
  ];

  return rows.join('\n');
}

/**
 * Identify the tropes most often missed by a given model — useful for the writeup.
 */
export function topMisses(scores: PerTestScore[]): Array<{ tropeId: string; count: number }> {
  const counts = new Map<string, number>();
  for (const s of scores) {
    for (const id of s.falseNegatives) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tropeId, count]) => ({ tropeId, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Identify the tropes most often hallucinated (false-positive) by a given model.
 */
export function topHallucinations(scores: PerTestScore[]): Array<{ tropeId: string; count: number }> {
  const counts = new Map<string, number>();
  for (const s of scores) {
    for (const id of s.falsePositives) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tropeId, count]) => ({ tropeId, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Public helper for tests that want to know if a detection from raw model output
 * survives confidence thresholding. The eval doesn't apply the production
 * threshold by default — we want raw model behavior.
 */
export function passesConfidenceThreshold(detection: ModelDetection, threshold: number): boolean {
  return detection.confidence >= threshold;
}
