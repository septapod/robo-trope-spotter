'use client';

import { useState } from 'react';
import type { TropeResult } from '@/lib/analysis/scoring';

interface HighlightedTextProps {
  sourceText: string;
  tropeResults: TropeResult[];
}

interface Highlight {
  start: number;
  end: number;
  tropeId: string;
  tropeName: string;
  color: string;
}

/**
 * Normalize a string for fuzzy matching: collapse whitespace, trim.
 */
function normalize(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

/**
 * Find all occurrences of a needle in the source text using normalized matching.
 * Returns positions mapped back to the original source string.
 */
function findNormalized(
  source: string,
  normalizedSource: string,
  sourceMap: number[],
  needle: string
): { start: number; end: number }[] {
  if (needle.length < 3) return [];

  const positions: { start: number; end: number }[] = [];
  const lowerNormalized = normalizedSource.toLowerCase();
  const lowerNeedle = needle.toLowerCase();

  let searchFrom = 0;
  while (searchFrom < lowerNormalized.length) {
    const idx = lowerNormalized.indexOf(lowerNeedle, searchFrom);
    if (idx === -1) break;
    const originalStart = sourceMap[idx];
    const originalEnd = sourceMap[idx + needle.length - 1] + 1;
    positions.push({ start: originalStart, end: originalEnd });
    searchFrom = idx + 1;
  }

  return positions;
}

/**
 * Build a mapping from normalized string indices to original string indices.
 * sourceMap[normalizedIdx] = originalIdx
 */
function buildSourceMap(source: string): { normalized: string; sourceMap: number[] } {
  const sourceMap: number[] = [];
  let normalized = '';
  let inSpace = false;
  // Skip leading whitespace
  let startIdx = 0;
  while (startIdx < source.length && /\s/.test(source[startIdx])) startIdx++;

  for (let i = startIdx; i < source.length; i++) {
    if (/\s/.test(source[i])) {
      if (!inSpace && normalized.length > 0) {
        sourceMap.push(i);
        normalized += ' ';
        inSpace = true;
      }
    } else {
      sourceMap.push(i);
      normalized += source[i];
      inSpace = false;
    }
  }

  // Trim trailing space
  if (normalized.endsWith(' ')) {
    normalized = normalized.slice(0, -1);
    sourceMap.pop();
  }

  return { normalized, sourceMap };
}

/**
 * Find all occurrences of an excerpt in the source text.
 * Uses normalized matching with fallbacks for LLM-quoted excerpt differences:
 * 1. Full normalized excerpt match
 * 2. First 40 characters if full match fails
 * 3. Middle portion if ends don't match
 * 4. Split on ellipsis and match each segment
 */
function findExcerptPositions(
  source: string,
  excerpt: string
): { start: number; end: number }[] {
  const clean = normalize(excerpt);
  if (clean.length < 3) return [];

  const { normalized: normalizedSource, sourceMap } = buildSourceMap(source);

  // Strategy 1: full normalized match
  const fullMatch = findNormalized(source, normalizedSource, sourceMap, clean);
  if (fullMatch.length > 0) return fullMatch;

  // Strategy 2: first 40 characters
  if (clean.length > 40) {
    const prefix = clean.slice(0, 40);
    const prefixMatch = findNormalized(source, normalizedSource, sourceMap, prefix);
    if (prefixMatch.length > 0) return prefixMatch;
  }

  // Strategy 3: middle portion (drop first and last 15% of characters)
  if (clean.length > 20) {
    const trimLen = Math.max(3, Math.floor(clean.length * 0.15));
    const middle = clean.slice(trimLen, clean.length - trimLen);
    if (middle.length >= 10) {
      const middleMatch = findNormalized(source, normalizedSource, sourceMap, middle);
      if (middleMatch.length > 0) return middleMatch;
    }
  }

  // Strategy 4: split on ellipsis and match each segment
  const ellipsisPattern = /\.{3}|\u2026/;
  if (ellipsisPattern.test(clean)) {
    const segments = clean.split(ellipsisPattern).map(s => normalize(s)).filter(s => s.length >= 10);
    const allPositions: { start: number; end: number }[] = [];
    for (const segment of segments) {
      const segMatch = findNormalized(source, normalizedSource, sourceMap, segment);
      allPositions.push(...segMatch);
    }
    if (allPositions.length > 0) return allPositions;
  }

  return [];
}

/**
 * Build a list of non-overlapping highlights, sorted by position.
 * When highlights overlap, keep the higher-tier (lower number) one.
 */
function buildHighlights(
  sourceText: string,
  tropeResults: TropeResult[]
): Highlight[] {
  const raw: Highlight[] = [];

  for (const trope of tropeResults) {
    for (const example of trope.examples) {
      const positions = findExcerptPositions(sourceText, example);
      for (const pos of positions) {
        raw.push({
          start: pos.start,
          end: pos.end,
          tropeId: trope.tropeId,
          tropeName: trope.tropeName,
          color: trope.color,
        });
      }
    }
  }

  // Supplemental pass: for certain tropes, find ALL instances in the
  // source text that the LLM's excerpts might have missed.
  const supplementalPatterns: Record<string, RegExp> = {
    'em-dash-addiction': /\u2014/g,
  };

  for (const trope of tropeResults) {
    const pattern = supplementalPatterns[trope.tropeId];
    if (!pattern) continue;

    const regex = new RegExp(pattern.source, pattern.flags);
    let match: RegExpExecArray | null;
    while ((match = regex.exec(sourceText)) !== null) {
      // Expand to include surrounding sentence context (up to 40 chars each side)
      const contextStart = Math.max(0, sourceText.lastIndexOf(' ', Math.max(0, match.index - 30)));
      const contextEnd = Math.min(sourceText.length, sourceText.indexOf(' ', match.index + match[0].length + 30));
      const start = contextStart === 0 ? 0 : contextStart + 1;
      const end = contextEnd === -1 ? sourceText.length : contextEnd;

      // Only add if this region isn't already covered by an existing highlight
      const alreadyCovered = raw.some(h =>
        h.tropeId === trope.tropeId && h.start <= match!.index && h.end >= match!.index + match![0].length
      );
      if (!alreadyCovered) {
        raw.push({
          start,
          end,
          tropeId: trope.tropeId,
          tropeName: trope.tropeName,
          color: trope.color,
        });
      }
    }
  }

  // Sort by start position
  raw.sort((a, b) => a.start - b.start);

  // Remove overlaps (keep earlier/higher-priority one)
  const merged: Highlight[] = [];
  for (const h of raw) {
    const last = merged[merged.length - 1];
    if (last && h.start < last.end) continue; // overlaps, skip
    merged.push(h);
  }

  return merged;
}

export function HighlightedText({ sourceText, tropeResults }: HighlightedTextProps) {
  const [hoveredTrope, setHoveredTrope] = useState<string | null>(null);
  const highlights = buildHighlights(sourceText, tropeResults);

  // Build segments: alternating plain text and highlighted spans
  const segments: { text: string; highlight?: Highlight }[] = [];
  let cursor = 0;

  for (const h of highlights) {
    // Plain text before this highlight
    if (h.start > cursor) {
      segments.push({ text: sourceText.slice(cursor, h.start) });
    }
    // The highlighted span
    segments.push({
      text: sourceText.slice(h.start, h.end),
      highlight: h,
    });
    cursor = h.end;
  }

  // Remaining plain text after last highlight
  if (cursor < sourceText.length) {
    segments.push({ text: sourceText.slice(cursor) });
  }

  if (highlights.length === 0) {
    // No highlights found (excerpts didn't match source text)
    return (
      <section className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-2xl bg-white border border-zinc-200 p-6 shadow-sm">
          <p className="text-[15px] leading-relaxed text-zinc-700 whitespace-pre-wrap">
            {sourceText}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-8">
      <div className="rounded-2xl bg-white border border-zinc-200 p-6 shadow-sm">
        <p className="text-[15px] leading-[1.8] text-zinc-700 whitespace-pre-wrap">
          {segments.map((seg, i) => {
            if (!seg.highlight) {
              return <span key={i}>{seg.text}</span>;
            }

            const h = seg.highlight;
            const isHovered = hoveredTrope === h.tropeId;

            return (
              <span
                key={i}
                className="relative cursor-pointer rounded-md px-0.5 transition-all duration-150"
                style={{
                  backgroundColor: h.color + (isHovered ? '30' : '18'),
                  borderBottom: `2px solid ${h.color}`,
                }}
                onMouseEnter={() => setHoveredTrope(h.tropeId)}
                onMouseLeave={() => setHoveredTrope(null)}
              >
                {seg.text}
                {isHovered && (
                  <span className="absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-zinc-900 px-3 py-1.5 text-xs text-white shadow-lg font-mono">
                    {h.tropeName}
                    <span className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-zinc-900" />
                  </span>
                )}
              </span>
            );
          })}
        </p>
      </div>
    </section>
  );
}
