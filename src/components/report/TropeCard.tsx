import type { TropeResult } from '@/lib/analysis/scoring';
import { tropeById } from '@/lib/tropes/registry';

interface TropeCardProps {
  trope: TropeResult;
  index: number;
}

const tierNames: Record<number, string> = {
  1: 'Credibility Killer',
  2: 'Trust Destroyer',
  3: 'Accumulation Hazard',
  4: 'Gatekeeper Signal',
  5: 'Forensic Tell',
};

export function TropeCard({ trope, index }: TropeCardProps) {
  const def = tropeById(trope.tropeId);
  const description = def?.description ?? '';

  return (
    <article
      className="animate-card-enter group relative overflow-hidden rounded-2xl bg-white border border-zinc-200 shadow-sm transition-shadow hover:shadow-md"
      style={{
        animationDelay: `${index * 80}ms`,
        borderLeftWidth: '4px',
        borderLeftColor: trope.color,
      }}
    >
      <div className="p-5 sm:p-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="font-display text-lg text-zinc-900 italic">
              {trope.tropeName}
            </h3>
            <p className="font-mono text-xs tracking-wider uppercase" style={{ color: trope.color }}>
              Tier {trope.tier} · {tierNames[trope.tier]}
            </p>
          </div>
          <span
            className="shrink-0 rounded-xl px-2.5 py-1 font-mono text-xs font-bold tabular-nums"
            style={{
              backgroundColor: trope.color + '18',
              color: trope.color,
            }}
          >
            {trope.count}x
          </span>
        </div>

        {/* Description */}
        {description && (
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            {description}
          </p>
        )}

        {/* Quoted examples */}
        {trope.examples.length > 0 && (
          <div className="mt-4 space-y-2">
            {trope.examples.map((example, i) => (
              <div
                key={i}
                className="rounded-xl bg-surface-2 px-4 py-2.5 text-sm leading-relaxed font-mono"
              >
                <span style={{ color: trope.color }}>
                  &ldquo;{example}&rdquo;
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
