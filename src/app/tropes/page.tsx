import { allTropes } from '@/lib/tropes/registry';
import type { Tier } from '@/lib/tropes/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The 42 AI Writing Tropes | Robo Trope Spotter',
  description: 'Every AI writing pattern we scan for, organized by severity. The full taxonomy.',
};

const tierMeta: Record<Tier, { label: string; severity: string; color: string; description: string }> = {
  1: {
    label: 'Tier 1',
    severity: 'Dead Giveaway',
    color: '#ef4444',
    description: 'Patterns that generate the strongest reader reactions. Any one of these appearing prominently can break trust on contact.',
  },
  2: {
    label: 'Tier 2',
    severity: 'Red Flag',
    color: '#f97316',
    description: 'Patterns that reliably cause readers to disengage. Editors and hiring managers both flag these.',
  },
  3: {
    label: 'Tier 3',
    severity: 'Worth Noting',
    color: '#eab308',
    description: 'These are harmless alone, but when three or more cluster in a few paragraphs, they signal an unedited draft.',
  },
  4: {
    label: 'Tier 4',
    severity: 'Subtle Tell',
    color: '#14b8a6',
    description: 'Casual readers miss these, but editors and publishers who evaluate writing professionally catch them every time.',
  },
  5: {
    label: 'Tier 5',
    severity: 'Deep Cut',
    color: '#8b5cf6',
    description: 'Statistical and structural patterns, detectable through analysis rather than casual reading.',
  },
};

export default function TropesPage() {
  const tiers: Tier[] = [1, 2, 3, 4, 5];

  return (
    <main className="min-h-screen bg-surface-0">
      <nav className="flex items-center justify-between border-b border-zinc-200/60 px-6 py-4 backdrop-blur-sm bg-surface-0/80">
        <a href="/" className="font-display text-base font-bold tracking-tight text-zinc-500 transition-colors hover:text-candy-pink">
          Robo Trope Spotter
        </a>
        <a href="/" className="font-mono text-sm text-candy-pink hover:underline">
          Analyze text
        </a>
      </nav>

      <div className="mx-auto max-w-2xl px-4 py-12">
        <header className="mb-12">
          <h1 className="font-display text-4xl font-bold text-zinc-900 sm:text-5xl">
            The 42 Tropes
          </h1>
          <p className="mt-4 text-lg text-zinc-500 leading-relaxed">
            Every AI writing pattern we scan for. Organized by severity,
            starting with the patterns that make readers stop reading and ending with the ones
            only editors catch. No single pattern proves anything. The score reflects concentration, and some flags will be coincidental.
          </p>
        </header>

        {tiers.map((tier) => {
          const meta = tierMeta[tier];
          const tropes = allTropes.filter((t) => t.tier === tier);

          return (
            <section key={tier} className="mb-16">
              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <h2 className="font-display text-2xl font-bold text-zinc-900">
                    {meta.severity}
                  </h2>
                  <span
                    className="font-mono text-xs tracking-wider uppercase font-semibold"
                    style={{ color: meta.color }}
                  >
                    {meta.label} ({tropes.length} patterns)
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                  {meta.description}
                </p>
              </div>

              <div className="space-y-4">
                {tropes.map((trope) => (
                  <div
                    key={trope.id}
                    className="rounded-xl bg-white border border-zinc-200 p-5 shadow-sm"
                    style={{ borderLeftWidth: '4px', borderLeftColor: meta.color }}
                  >
                    <h3 className="font-display text-lg font-bold text-zinc-900">
                      {trope.name}
                    </h3>
                    <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                      {trope.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        <footer className="border-t border-zinc-200/60 pt-8 text-center">
          <a
            href="/"
            className="inline-block font-display font-bold text-sm bg-candy-pink text-white rounded-2xl px-6 py-2.5 shadow-md shadow-candy-pink/15 transition-all hover:bg-pink-600"
          >
            Analyze some text
          </a>
          <p className="mt-4 font-mono text-xs text-zinc-500">
            Because it's better to know.
          </p>
          <a href="https://dxn.is" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-600 transition-colors">
            <img src="/dxn-logomark.png" alt="Dixon Strategic Labs" className="h-5 w-5" />
            <span className="text-xs font-mono">Dixon Strategic Labs</span>
          </a>
        </footer>
      </div>
    </main>
  );
}
