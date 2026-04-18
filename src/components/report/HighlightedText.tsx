'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const highlights = useMemo(
    () => buildHighlights(sourceText, tropeResults),
    [sourceText, tropeResults]
  );

  // Global click-outside dismissal (mousedown so it fires before focus shifts).
  useEffect(() => {
    if (!pinnedId) return;
    const handler = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      if (!(e.target instanceof Node) || !container.contains(e.target)) {
        setPinnedId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [pinnedId]);

  // Global Escape dismissal (fires even when focus has left the highlight region).
  useEffect(() => {
    if (!pinnedId) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPinnedId(null);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [pinnedId]);

  const segments = useMemo(() => {
    const out: { text: string; highlight?: Highlight }[] = [];
    let cursor = 0;
    for (const h of highlights) {
      if (h.start > cursor) out.push({ text: sourceText.slice(cursor, h.start) });
      out.push({ text: sourceText.slice(h.start, h.end), highlight: h });
      cursor = h.end;
    }
    if (cursor < sourceText.length) out.push({ text: sourceText.slice(cursor) });
    return out;
  }, [sourceText, highlights]);

  const highlightCount = highlights.length;

  const focusAt = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(highlightCount - 1, index));
    setActiveIndex(clamped);
    buttonRefs.current[clamped]?.focus();
  }, [highlightCount]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, index: number, tropeId: string) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        focusAt(index + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        focusAt(index - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        focusAt(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        focusAt(highlightCount - 1);
      } else if (e.key === 'Escape' && pinnedId) {
        e.preventDefault();
        setPinnedId(null);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setPinnedId((prev) => (prev === tropeId ? null : tropeId));
      }
    },
    [focusAt, highlightCount, pinnedId]
  );

  if (highlightCount === 0) {
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

  let highlightIndex = 0;

  return (
    <section className="mx-auto max-w-2xl px-4 py-8">
      <div
        ref={containerRef}
        role="group"
        aria-label="Detected writing tropes"
        className="rounded-2xl bg-white border border-zinc-200 p-6 shadow-sm"
      >
        <p className="text-[15px] leading-[1.8] text-zinc-700 whitespace-pre-wrap">
          {segments.map((seg, i) => {
            if (!seg.highlight) {
              return <span key={i}>{seg.text}</span>;
            }

            const h = seg.highlight;
            const idx = highlightIndex++;
            const tooltipId = `trope-tip-${i}`;
            const isPinned = pinnedId === h.tropeId;

            return (
              <button
                key={i}
                type="button"
                aria-describedby={tooltipId}
                aria-pressed={isPinned}
                tabIndex={idx === activeIndex ? 0 : -1}
                ref={(el) => {
                  buttonRefs.current[idx] = el;
                }}
                onClick={() => {
                  setActiveIndex(idx);
                  setPinnedId((prev) => (prev === h.tropeId ? null : h.tropeId));
                }}
                onKeyDown={(e) => handleKeyDown(e, idx, h.tropeId)}
                onFocus={() => setActiveIndex(idx)}
                className="highlight-trigger group relative cursor-pointer rounded-md px-0.5 text-left align-baseline transition-all duration-150"
                style={{
                  backgroundColor: h.color + (isPinned ? '30' : '18'),
                  borderBottom: `2px solid ${h.color}`,
                }}
              >
                {seg.text}
                <span
                  id={tooltipId}
                  role="tooltip"
                  data-pinned={isPinned || undefined}
                  className="highlight-tooltip pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-zinc-900 px-3 py-1.5 text-xs text-white shadow-lg font-mono opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 data-[pinned]:opacity-100"
                >
                  {h.tropeName}
                  <span className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-zinc-900" />
                </span>
              </button>
            );
          })}
        </p>
      </div>
    </section>
  );
}
