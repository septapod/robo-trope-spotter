/**
 * Shared types for the three-model eval (Opus 4.7 vs Sonnet 4.6 vs Haiku 4.5).
 * Single-pass detection comparison: no Haiku validation pass, no em-dash regex
 * injection. The eval measures raw model recall and false-positive rate against
 * a hand-labeled ground truth.
 */

import type { Tier } from '../src/lib/tropes/types';

/** A single ground-truth trope expected to be detected in a passage. */
export interface GroundTruthTrope {
  tropeId: string;
  /** Confidence at which a human labeler is willing to assert this trope is present. */
  confidence: 'high' | 'medium' | 'low';
  /** Optional: the specific phrase or excerpt that exemplifies the trope. */
  evidence?: string;
}

/** Severity tier of the source — coarse expected register. */
export type SourceCategory =
  | 'linkedin-post'
  | 'vendor-white-paper'
  | 'consultant-email'
  | 'newsletter'
  | 'human-blog'
  | 'human-edited-ai'
  | 'edge-case';

export interface TestEntry {
  id: string;
  source: SourceCategory;
  /** Optional URL or attribution. */
  attribution?: string;
  /** The text the model analyzes. */
  passage: string;
  /** Hand-labeled tropes the model is expected to detect. */
  groundTruth: GroundTruthTrope[];
  /** Optional: tropes a model might flag that should be REJECTED for this passage. */
  expectedNonTropes?: string[];
  notes?: string;
}

/** A single detection returned by a model — mirrors the LlmDetection shape from production. */
export interface ModelDetection {
  tropeId: string;
  tier: Tier;
  confidence: number;
  count: number;
  matchedExcerpts: string[];
  explanation: string;
  suggestion?: string;
}

export interface ModelRun {
  testId: string;
  model: string;
  detections: ModelDetection[];
  rawResponse: string;
  parseError?: string;
  durationMs: number;
  inputTokens?: number;
  outputTokens?: number;
}

export interface PerTestScore {
  testId: string;
  model: string;
  /** Tropes correctly detected (in ground truth and detected). */
  truePositives: string[];
  /** Tropes in ground truth but missed by the model. */
  falseNegatives: string[];
  /** Tropes detected by the model but not in ground truth. */
  falsePositives: string[];
  /** Tropes flagged that the test entry explicitly says should NOT fire. */
  expectedNonTropeViolations: string[];
}

export interface AggregateScore {
  model: string;
  totalTests: number;
  totalGroundTruth: number;
  totalTruePositives: number;
  totalFalseNegatives: number;
  totalFalsePositives: number;
  totalExpectedNonTropeViolations: number;
  /** truePositives / (truePositives + falseNegatives). */
  recall: number;
  /** truePositives / (truePositives + falsePositives). */
  precision: number;
  /** Harmonic mean of recall and precision. */
  f1: number;
  perTier: Record<Tier, {
    recall: number;
    precision: number;
    truePositives: number;
    falseNegatives: number;
    falsePositives: number;
  }>;
  totalDurationMs: number;
  totalCostUsd?: number;
}
