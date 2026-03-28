'use client';

import type { DnaStripBand } from '@/lib/analysis/scoring';
import { useState } from 'react';
import { tropeById } from '@/lib/tropes/registry';

interface DnaStripProps {
  bands: DnaStripBand[];
}

export function DnaStrip({ bands }: DnaStripProps) {
  const [hoveredBand, setHoveredBand] = useState<string | null>(null);

  if (bands.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4">
        <div className="flex h-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50">
          <span className="text-xs text-zinc-600">No tropes to visualize</span>
        </div>
      </div>
    );
  }

  const totalCount = bands.reduce((sum, b) => sum + b.count, 0);

  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="relative overflow-hidden rounded-lg border border-zinc-800">
        <div className="flex h-10">
          {bands.map((band) => {
            const widthPercent = Math.max((band.count / totalCount) * 100, 4);
            const def = tropeById(band.tropeId);
            const name = def?.name ?? band.tropeId;
            const isHovered = hoveredBand === band.tropeId;

            return (
              <div
                key={band.tropeId}
                className="relative transition-opacity duration-150"
                style={{
                  width: `${widthPercent}%`,
                  backgroundColor: band.color,
                  opacity: hoveredBand && !isHovered ? 0.4 : 1,
                }}
                onMouseEnter={() => setHoveredBand(band.tropeId)}
                onMouseLeave={() => setHoveredBand(null)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-100 shadow-lg ring-1 ring-zinc-700">
                    {name} ({band.count})
                    <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-zinc-600">
        <span>Start of text</span>
        <span>End of text</span>
      </div>
    </div>
  );
}
