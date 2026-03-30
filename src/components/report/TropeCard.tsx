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
  const def = tropeById(trope.tropeId);
  const description = trope.explanation || def?.description || '';
  const num = String(index + 1).padStart(2, '0');

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
        {/* Header row with editorial number */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-4">
            {/* Big editorial number */}
            <span
              className="font-accent text-3xl font-bold leading-none opacity-30 select-none shrink-0 mt-0.5"
              style={{ color: trope.color }}
            >
              {num}.
            </span>
            <div className="space-y-2">
              <h3 className="font-display text-xl font-extrabold text-zinc-900 leading-tight">
                {trope.tropeName}
              </h3>
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-sm font-bold tracking-wider uppercase"
                style={{
                  backgroundColor: trope.color + '20',
                  color: trope.color,
                }}
              >
                {severityLabels[trope.tier]}
              </span>
            </div>
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
          <p className="mt-3 text-base leading-relaxed text-zinc-500 pl-12">
            {description}
          </p>
        )}

        {/* Quoted examples */}
        {trope.examples.length > 0 && (
          <div className="mt-4 space-y-2 pl-12">
            {trope.examples.map((example, i) => (
              <div
                key={i}
                className="rounded-xl px-4 py-3 text-base leading-relaxed border"
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
