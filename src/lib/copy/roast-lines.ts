import type { ScoreResult } from '@/lib/analysis/scoring';

/**
 * Returns a one-line summary roast based on the overall trope profile.
 * Prioritizes holistic summaries over single-trope callouts.
 */
export function getRoastLine(scoreResult: ScoreResult): string {
  const { totalTropesDetected, totalInstancesDetected, rawScore, tropeResults } = scoreResult;

  // Clean text
  if (totalTropesDetected === 0) {
    return 'Zero tropes detected. Either someone cares about their writing, or they are running a very good post-processor.';
  }

  if (rawScore <= 5 && totalTropesDetected > 0) {
    return `Only ${totalInstancesDetected} instance${totalInstancesDetected === 1 ? '' : 's'} across ${totalTropesDetected} trope${totalTropesDetected === 1 ? '' : 's'}. Barely a whisper of robot.`;
  }

  // Build a summary from the top 3 trope names (not counting em dashes first)
  const topNames = tropeResults
    .filter(t => t.tropeId !== 'em-dash-addiction')
    .slice(0, 3)
    .map(t => t.tropeName.toLowerCase());

  // If em dashes are present but not the only thing, include them at the end
  const hasEmDashes = tropeResults.some(t => t.tropeId === 'em-dash-addiction');
  if (hasEmDashes && topNames.length > 0) {
    topNames.push('em dash overuse');
  }

  const nameList = topNames.length > 0
    ? topNames.slice(0, 3).join(', ')
    : tropeResults[0]?.tropeName.toLowerCase() ?? 'AI patterns';

  // Score-based summaries that mention the actual patterns found
  if (rawScore > 75) {
    return `${totalInstancesDetected} hits across ${totalTropesDetected} trope types, including ${nameList}. This went from prompt to publish without a second look.`;
  }

  if (rawScore > 50) {
    return `${totalTropesDetected} trope types found (${nameList}). The AI fingerprint is unmistakable. Another editing pass would help.`;
  }

  if (rawScore > 30) {
    return `Patterns detected: ${nameList}. ${totalInstancesDetected} total instances across ${totalTropesDetected} categories. Attentive readers will notice.`;
  }

  if (rawScore > 15) {
    return `A few patterns showing: ${nameList}. Readers will notice.`;
  }

  if (rawScore > 5) {
    return `Light traces of ${nameList}. Minor editing would clean these up.`;
  }

  return `${totalTropesDetected} trope${totalTropesDetected === 1 ? '' : 's'} detected. Could be worse.`;
}
