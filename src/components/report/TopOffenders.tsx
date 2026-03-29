import type { TropeResult } from '@/lib/analysis/scoring';
import { TropeCard } from './TropeCard';

interface TopOffendersProps {
  tropes: TropeResult[];
}

export function TopOffenders({ tropes }: TopOffendersProps) {
  if (tropes.length === 0) return null;

  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <div className="space-y-4">
        {tropes.map((trope, i) => (
          <TropeCard key={trope.tropeId} trope={trope} index={i} />
        ))}
      </div>
    </section>
  );
}
