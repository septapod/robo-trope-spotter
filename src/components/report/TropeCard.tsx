import type { TropeResult } from '@/lib/analysis/scoring';
import { tropeById } from '@/lib/tropes/registry';

interface TropeCardProps {
  trope: TropeResult;
}

const tierLabels: Record<number, string> = {
  1: 'Tier 1',
  2: 'Tier 2',
  3: 'Tier 3',
  4: 'Tier 4',
  5: 'Tier 5',
};

export function TropeCard({ trope }: TropeCardProps) {
  const def = tropeById(trope.tropeId);
  const description = def?.description ?? '';

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-bold text-zinc-100">{trope.tropeName}</h3>
        <span
          className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold"
          style={{
            backgroundColor: trope.color + '20',
            color: trope.color,
          }}
        >
          {tierLabels[trope.tier]}
        </span>
      </div>

      {/* Description */}
      {description && (
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          {description}
        </p>
      )}

      {/* Count */}
      <p className="mt-3 text-sm font-medium text-zinc-300">
        Found {trope.count} time{trope.count !== 1 ? 's' : ''}
      </p>

      {/* Examples */}
      {trope.examples.length > 0 && (
        <div className="mt-3 space-y-2">
          {trope.examples.map((example, i) => (
            <blockquote
              key={i}
              className="rounded-lg border-l-2 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-300"
              style={{ borderLeftColor: trope.color }}
            >
              <span style={{ color: trope.color, fontWeight: 600 }}>
                {example}
              </span>
            </blockquote>
          ))}
        </div>
      )}
    </div>
  );
}
