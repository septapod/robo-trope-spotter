import type { AnalysisMatch } from '@/lib/tropes/types';
import type { HeuristicResult } from './types';
import { heuristicTropes } from '@/lib/tropes/registry';

/**
 * Build a global regex from a word list using word-boundary alternation.
 * Each entry is escaped for special regex chars, then joined with |.
 */
function wordListToRegex(words: string[]): RegExp {
  const escaped = words.map((w) =>
    w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  return new RegExp(`\\b(?:${escaped.join('|')})\\b`, 'gi');
}

/**
 * Clone a RegExp so we never mutate shared state on the trope definitions.
 * Always resets lastIndex to 0.
 */
function cloneRegex(re: RegExp): RegExp {
  return new RegExp(re.source, re.flags);
}

/**
 * Run a single global regex against text and collect all matches
 * as AnalysisMatch objects.
 */
function collectMatches(
  regex: RegExp,
  text: string,
  tropeId: string,
  tier: 1 | 2 | 3 | 4 | 5
): AnalysisMatch[] {
  const matches: AnalysisMatch[] = [];
  const re = cloneRegex(regex);
  re.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    matches.push({
      tropeId,
      tier,
      matchedText: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });

    // Guard against zero-length matches causing infinite loops
    if (match[0].length === 0) {
      re.lastIndex++;
    }
  }

  return matches;
}

/**
 * Analyze text against all heuristic tropes (Tiers 1-3) using
 * regex pattern matching and word-list scanning.
 *
 * Returns every match with character offsets and timing info.
 */
export function analyzeHeuristic(text: string): HeuristicResult {
  const start = performance.now();

  if (!text || text.length === 0) {
    return { matches: [], processingTimeMs: 0 };
  }

  const allMatches: AnalysisMatch[] = [];

  for (const trope of heuristicTropes) {
    if (trope.pattern) {
      const matches = collectMatches(trope.pattern, text, trope.id, trope.tier);
      allMatches.push(...matches);
    }

    if (trope.wordList && trope.wordList.length > 0) {
      const regex = wordListToRegex(trope.wordList);
      const matches = collectMatches(regex, text, trope.id, trope.tier);
      allMatches.push(...matches);
    }
  }

  const processingTimeMs = performance.now() - start;

  return {
    matches: allMatches,
    processingTimeMs,
  };
}
