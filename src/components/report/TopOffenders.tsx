import type { TropeResult } from '@/lib/analysis/scoring';
import { TropeCard } from './TropeCard';

interface TopOffendersProps {
  tropes: TropeResult[];
}

export function TopOffenders({ tropes }: TopOffendersProps) {
  if (tropes.length === 0) return null;

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-baseline gap-3">
        <h2 className="font-display text-2xl italic text-zinc-900">Top Offenders</h2>
        <span className="font-mono text-xs tracking-wider text-zinc-400 uppercase">
          worst first
        </span>
      </div>
      <div className="space-y-3">
        {tropes.map((trope, i) => (
          <TropeCard key={trope.tropeId} trope={trope} index={i} />
        ))}
      </div>
    </section>
  );
}
