import type { TropeResult } from '@/lib/analysis/scoring';
import { TropeCard } from './TropeCard';

interface TopOffendersProps {
  tropes: TropeResult[];
}

export function TopOffenders({ tropes }: TopOffendersProps) {
  if (tropes.length === 0) return null;

  return (
    <section className="mx-auto max-w-2xl px-4 py-8">
      <h2 className="mb-5 text-xl font-bold text-zinc-100">Top Offenders</h2>
      <div className="space-y-4">
        {tropes.map((trope) => (
          <TropeCard key={trope.tropeId} trope={trope} />
        ))}
      </div>
    </section>
  );
}
