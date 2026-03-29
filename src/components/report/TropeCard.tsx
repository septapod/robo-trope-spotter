import type { TropeResult } from '@/lib/analysis/scoring';
import { tropeById } from '@/lib/tropes/registry';

interface TropeCardProps {
  trope: TropeResult;
  index: number;
}

const severityLabels: Record<number, string> = {
  1: 'Dead Giveaway',
  2: 'Red Flag',
  3: 'Worth Noting',
  4: 'Subtle Tell',
  5: 'Deep Cut',
};

export function TropeCard({ trope, index }: TropeCardProps) {
  // Prefer the LLM's contextual explanation over the static description
  const def = tropeById(trope.tropeId);
  const description = trope.explanation || def?.description || '';

  return (
    <article
      className="animate-card-enter group relative overflow-hidden rounded-2xl bg-white border border-zinc-100 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
      style={{
        animationDelay: `${index * 80}ms`,
        borderLeftWidth: '6px',
        borderLeftColor: trope.color,
        backgroundColor: trope.color + '06',
      }}
    >
      <div className="p-5 sm:p-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <h3 className="font-display text-xl font-bold text-zinc-900">
              {trope.tropeName}
            </h3>
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase"
              style={{
                backgroundColor: trope.color + '20',
                color: trope.color,
              }}
            >
              {severityLabels[trope.tier]}
            </span>
          </div>
          <span
            className="shrink-0 rounded-2xl px-3 py-1.5 font-mono text-base font-bold tabular-nums"
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
                className="rounded-xl px-4 py-3 text-sm leading-relaxed font-mono border"
                style={{
                  backgroundColor: trope.color + '08',
                  borderColor: trope.color + '20',
                }}
              >
                <span style={{ color: trope.color }} className="font-medium">
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
