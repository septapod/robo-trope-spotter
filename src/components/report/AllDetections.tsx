'use client';

import { useState } from 'react';
import type { TropeResult } from '@/lib/analysis/scoring';
import { TropeCard } from './TropeCard';

interface AllDetectionsProps {
  remaining: TropeResult[];
}

export function AllDetections({ remaining }: AllDetectionsProps) {
  const [expanded, setExpanded] = useState(false);

  if (remaining.length === 0) return null;

  return (
    <section className="mx-auto max-w-2xl px-4 pb-10">
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-800/40 bg-surface-1/40 px-4 py-4 font-mono text-xs tracking-wide text-zinc-500 transition-all hover:border-zinc-700/60 hover:bg-surface-1 hover:text-zinc-400"
        >
          <svg
            className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5"
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
          {remaining.length} more detection{remaining.length !== 1 ? 's' : ''}
        </button>
      ) : (
        <>
          <div className="space-y-3">
            {remaining.map((trope, i) => (
              <TropeCard key={trope.tropeId} trope={trope} index={i} />
            ))}
          </div>
          <button
            onClick={() => setExpanded(false)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-800/40 bg-surface-1/40 px-4 py-3 font-mono text-xs tracking-wide text-zinc-600 transition-all hover:border-zinc-700/60 hover:text-zinc-500"
          >
            <svg
              className="h-3.5 w-3.5 rotate-180"
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
            collapse
          </button>
        </>
      )}
    </section>
  );
}
