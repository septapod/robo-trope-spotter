import type { Tier } from '@/lib/tropes/types';

/**
 * Color intensities per tier, indexed by frequency bracket.
 * [low (1-2), medium (3-4), high (5+)]
 */
const tierColors: Record<Tier, [string, string, string]> = {
  5: ['#22c55e', '#16a34a', '#15803d'], // green-500, green-600, green-700
  4: ['#84cc16', '#65a30d', '#4d7c0f'], // lime-500, lime-600, lime-700
  3: ['#eab308', '#ca8a04', '#a16207'], // yellow-500, yellow-600, yellow-700
  2: ['#f97316', '#ea580c', '#c2410c'], // orange-500, orange-600, orange-700
  1: ['#ef4444', '#dc2626', '#b91c1c'], // red-500, red-600, red-700
};

/**
 * Returns a hex color for a trope based on its tier and how many times it appeared.
 * Higher counts produce darker, more saturated variants.
 */
export function getTropeColor(tier: Tier, count: number): string {
  const palette = tierColors[tier];
  if (count <= 2) return palette[0];
  if (count <= 4) return palette[1];
  return palette[2];
}

/** Label color mapping for the named score labels. */
const labelColors: Record<string, string> = {
  Clean: '#22c55e',
  'Light Touches': '#84cc16',
  'Noticeable Patterns': '#eab308',
  'Needs Another Pass': '#f97316',
  'Full Robot Mode': '#ef4444',
  'Unedited AI Output': '#b91c1c',
};

/**
 * Returns the hex color associated with a score label.
 * Falls back to a neutral gray if the label is unrecognized.
 */
export function getLabelColor(label: string): string {
  return labelColors[label] ?? '#6b7280';
}
