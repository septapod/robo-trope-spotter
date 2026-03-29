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
 * Find all occurrences of an excerpt in the source text.
 * Uses case-insensitive substring matching, trimming whitespace.
 */
function findExcerptPositions(
  source: string,
  excerpt: string
): { start: number; end: number }[] {
  // Clean up the excerpt (LLM sometimes adds/removes whitespace)
  const clean = excerpt.trim();
  if (clean.length < 3) return [];

  const positions: { start: number; end: number }[] = [];
  const lowerSource = source.toLowerCase();
  const lowerExcerpt = clean.toLowerCase();

  let searchFrom = 0;
  while (searchFrom < lowerSource.length) {
    const idx = lowerSource.indexOf(lowerExcerpt, searchFrom);
    if (idx === -1) break;
    positions.push({ start: idx, end: idx + clean.length });
    searchFrom = idx + 1;
  }

  return positions;
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
