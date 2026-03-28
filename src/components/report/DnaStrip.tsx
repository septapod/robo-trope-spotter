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
      <div className="flex h-3 items-center justify-center rounded-full border border-zinc-800/50 bg-surface-1">
        <span className="text-[9px] text-zinc-700 font-mono">clean</span>
      </div>
    );
  }

  const totalCount = bands.reduce((sum, b) => sum + b.count, 0);

  return (
    <div className="animate-dna-shimmer space-y-2">
      <div className="relative overflow-hidden rounded-full h-3">
        <div className="flex h-full">
          {bands.map((band, i) => {
            const widthPercent = Math.max((band.count / totalCount) * 100, 3);
            const def = tropeById(band.tropeId);
            const name = def?.name ?? band.tropeId;
            const isHovered = hoveredBand === band.tropeId;

            return (
              <div
                key={band.tropeId}
                className="relative transition-all duration-200 cursor-pointer"
                style={{
                  width: `${widthPercent}%`,
                  backgroundColor: band.color,
                  opacity: hoveredBand && !isHovered ? 0.25 : 1,
                  marginLeft: i > 0 ? '1px' : 0,
                }}
                onMouseEnter={() => setHoveredBand(band.tropeId)}
                onMouseLeave={() => setHoveredBand(null)}
              >
                {isHovered && (
                  <div className="absolute bottom-full left-1/2 z-20 mb-3 -translate-x-1/2 whitespace-nowrap rounded-lg bg-zinc-900 px-3 py-2 text-xs text-zinc-200 shadow-xl ring-1 ring-zinc-700/50 font-mono">
                    <span className="font-semibold">{name}</span>
                    <span className="text-zinc-500 ml-2">{band.count}x</span>
                    <div className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-zinc-900" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex justify-between font-mono text-[9px] tracking-wider text-zinc-700 uppercase">
        <span>start</span>
        <span>end</span>
      </div>
    </div>
  );
}
