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
          className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-4 font-display text-base font-bold tracking-tight text-zinc-500 transition-all hover:border-pop-pink/40 hover:text-pop-pink shadow-sm"
        >
          <svg
            className="h-4 w-4 transition-transform group-hover:translate-y-0.5"
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
              <TropeCard key={trope.tropeId} trope={trope} index={i + 5} />
            ))}
          </div>
          <button
            onClick={() => setExpanded(false)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 font-display text-base font-bold text-zinc-500 transition-all hover:border-pop-pink/40 hover:text-pop-pink shadow-sm"
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
            collapse
          </button>
        </>
      )}
    </section>
  );
}
