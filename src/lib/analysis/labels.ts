import { getLabelColor } from './colors';

/**
 * Maps a raw composite score to a named label and color.
 *
 * Score ranges and rationale:
 *   0-5:   "Clean"                Zero to minimal trope presence. Text reads as genuinely human.
 *   6-15:  "Light Touches"        A few patterns present but not distracting. Normal editing would catch these.
 *   16-30: "Noticeable Patterns"  Multiple AI writing habits visible. Attentive readers will notice.
 *   31-50: "Needs Another Pass"   Dense enough that the AI fingerprint is obvious. Editing required.
 *   51-75: "Full Robot Mode"      Heavy AI pattern clustering. This reads like an unrevised first draft.
 *   76+:   "Unedited AI Output"   Virtually every paragraph triggers patterns. This went straight from prompt to publish.
 */
export function getLabel(rawScore: number): { label: string; color: string } {
  let label: string;

  if (rawScore <= 5) {
    label = 'Clean';
  } else if (rawScore <= 15) {
    label = 'Light Touches';
  } else if (rawScore <= 30) {
    label = 'Noticeable Patterns';
  } else if (rawScore <= 50) {
    label = 'Needs Another Pass';
  } else if (rawScore <= 75) {
    label = 'Full Robot Mode';
  } else {
    label = 'Unedited AI Output';
  }

  return { label, color: getLabelColor(label) };
}
