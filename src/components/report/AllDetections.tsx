'use client';

import { useState } from 'react';
import type { TropeResult } from '@/lib/analysis/scoring';
import { TropeCard } from './TropeCard';

interface AllDetectionsProps {
  /** All trope results beyond the top 5. */
  remaining: TropeResult[];
}

export function AllDetections({ remaining }: AllDetectionsProps) {
  const [expanded, setExpanded] = useState(false);

  if (remaining.length === 0) return null;

  return (
    <section className="mx-auto max-w-2xl px-4 pb-8">
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-sm font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:bg-zinc-900/60 hover:text-zinc-300"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
          See all {remaining.length} more detection{remaining.length !== 1 ? 's' : ''}
        </button>
      ) : (
        <>
          <button
            onClick={() => setExpanded(false)}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-sm font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:bg-zinc-900/60 hover:text-zinc-300"
          >
            <svg
              className="h-4 w-4 rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
            Collapse
          </button>
          <div className="space-y-4">
            {remaining.map((trope) => (
              <TropeCard key={trope.tropeId} trope={trope} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
