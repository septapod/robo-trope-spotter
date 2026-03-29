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
      <div className="flex h-10 items-center justify-center rounded-full border-2 border-candy-green/30 bg-candy-green/5">
        <span className="text-sm text-candy-green font-display font-bold tracking-wide">all clear</span>
      </div>
    );
  }

  const totalCount = bands.reduce((sum, b) => sum + b.count, 0);

  return (
    <div className="animate-dna-shimmer space-y-3">
      <div className="relative overflow-hidden rounded-full h-10 shadow-inner bg-zinc-100">
        <div className="flex h-full gap-1 p-0.5">
          {bands.map((band) => {
            const widthPercent = Math.max((band.count / totalCount) * 100, 4);
            const def = tropeById(band.tropeId);
            const name = def?.name ?? band.tropeId;
            const isHovered = hoveredBand === band.tropeId;

            return (
              <div
                key={band.tropeId}
                className="relative rounded-full transition-all duration-300 cursor-pointer hover:brightness-110"
                style={{
                  width: `${widthPercent}%`,
                  backgroundColor: band.color,
                  opacity: hoveredBand && !isHovered ? 0.3 : 1,
                  transform: isHovered ? 'scaleY(1.15)' : 'scaleY(1)',
                }}
                onMouseEnter={() => setHoveredBand(band.tropeId)}
                onMouseLeave={() => setHoveredBand(null)}
              >
                {isHovered && (
                  <div className="absolute bottom-full left-1/2 z-20 mb-3 -translate-x-1/2 whitespace-nowrap rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm text-white shadow-xl font-mono">
                    <span className="font-bold">{name}</span>
                    <span className="text-zinc-400 ml-2">{band.count}x</span>
                    <div className="absolute left-1/2 top-full -translate-x-1/2 border-[6px] border-transparent border-t-zinc-900" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex justify-between font-mono text-xs tracking-widest text-zinc-400 uppercase px-1">
        <span>start</span>
        <span>end</span>
      </div>
      {(() => {
        const sorted = [...bands].sort((a, b) => b.count - a.count);
        const top3 = sorted.slice(0, 3);
        return (
          <div className="flex items-center gap-3 px-1">
            {top3.map((band) => {
              const def = tropeById(band.tropeId);
              const name = def?.name ?? band.tropeId;
              return (
                <span key={band.tropeId} className="font-mono text-xs text-zinc-400">
                  {name}
                </span>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}
