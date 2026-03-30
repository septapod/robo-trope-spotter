import type { TropeResult } from '@/lib/analysis/scoring';
import { TropeCard } from './TropeCard';

interface TopOffendersProps {
  tropes: TropeResult[];
}

export function TopOffenders({ tropes }: TopOffendersProps) {
  if (tropes.length === 0) return null;

  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      {/* Editorial section header */}
      <div className="mb-8">
        <div className="editorial-rule w-12 mb-4" />
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
          Top Offenders
        </h2>
        <p className="text-base text-zinc-500 mt-1">
          The tropes that stood out the most.
        </p>
      </div>

      <div className="space-y-4">
        {tropes.map((trope, i) => (
          <TropeCard key={trope.tropeId} trope={trope} index={i} />
        ))}
      </div>
    </section>
  );
}
