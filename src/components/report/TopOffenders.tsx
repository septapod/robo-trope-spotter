import type { TropeResult } from '@/lib/analysis/scoring';
import { TropeCard } from './TropeCard';

interface TopOffendersProps {
  tropes: TropeResult[];
}

export function TopOffenders({ tropes }: TopOffendersProps) {
  if (tropes.length === 0) return null;

  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 flex items-baseline gap-4">
        <h2 className="font-display text-3xl font-bold text-zinc-900 sm:text-4xl">
          Top Offenders
        </h2>
        <span className="font-mono text-sm tracking-wider text-candy-pink uppercase font-medium">
          worst first
        </span>
      </div>
      <div className="space-y-4">
        {tropes.map((trope, i) => (
          <TropeCard key={trope.tropeId} trope={trope} index={i} />
        ))}
      </div>
    </section>
  );
}
