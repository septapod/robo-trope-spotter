import type { ScoreResult } from '@/lib/analysis/scoring';

const cleanBadges = [
  'Suspiciously Human',
  'Certified Organic',
  'Not a Robot in Sight',
  'Turing Test: Passed',
  'Human Until Proven Otherwise',
  'The Machines Did Not Write This',
  'Clean as a Whistle',
  'Trope-Free Zone',
];

const cleanSubtitles = [
  'No AI writing patterns detected. This text reads like a human wrote it.',
  'Zero robot tells. Someone actually cared about the words they chose.',
  'The trope scanner came up empty. That takes either skill or a very good editor.',
  'Not a single AI fingerprint. This is what intentional writing looks like.',
  'The algorithm found nothing. Respect.',
];

const nearCleanSubtitles = [
  'Barely a trace. A quick edit would make this spotless.',
  'Almost nothing. The few patterns detected are minor enough to ignore.',
  'Light touches only. This is well within the range of normal human writing.',
];

/**
 * Returns a fun badge string for clean or near-clean scores.
 * Deterministic based on the raw score so the same report always shows the same badge.
 */
export function getCleanBadge(scoreResult: ScoreResult): string {
  const idx = Math.abs(Math.round(scoreResult.rawScore * 7)) % cleanBadges.length;
  return cleanBadges[idx];
}

/**
 * Returns a subtitle line for clean or near-clean scores.
 */
export function getCleanSubtitle(scoreResult: ScoreResult): string {
  if (scoreResult.rawScore <= 2) {
    const idx = Math.abs(Math.round(scoreResult.rawScore * 13)) % cleanSubtitles.length;
    return cleanSubtitles[idx];
  }
  const idx = Math.abs(Math.round(scoreResult.rawScore * 11)) % nearCleanSubtitles.length;
  return nearCleanSubtitles[idx];
}

/**
 * Returns true if the score qualifies for clean-score treatment.
 */
export function isCleanScore(scoreResult: ScoreResult): boolean {
  return scoreResult.rawScore <= 5;
}
