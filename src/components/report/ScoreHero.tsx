import type { ScoreResult } from '@/lib/analysis/scoring';
import { getRoastLine } from '@/lib/copy/roast-lines';
import { isCleanScore, getCleanBadge, getCleanSubtitle } from '@/lib/copy/clean-score';

interface ScoreHeroProps {
  scoreResult: ScoreResult;
}

export function ScoreHero({ scoreResult }: ScoreHeroProps) {
  const clean = isCleanScore(scoreResult);
  const roastLine = getRoastLine(scoreResult);

  return (
    <section className="relative flex flex-col items-center gap-8 py-20 px-4 text-center sm:py-24">
      {/* Decorative blob behind score */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="animate-blob-pulse blob-shape absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-15"
          style={{ backgroundColor: scoreResult.labelColor }}
        />
      </div>

      {/* Score number */}
      <div className="animate-score-reveal relative">
        <span
          className="relative font-display font-bold tabular-nums tracking-tighter leading-none"
          style={{ color: scoreResult.labelColor, fontSize: 'clamp(6rem, 22vw, 11rem)' }}
        >
          {scoreResult.rawScore}
        </span>
        <p className="font-mono text-sm tracking-widest uppercase text-zinc-600 mt-2">
          trope score
        </p>
        {/* Visual scale bar */}
        <div className="mt-6 w-72 sm:w-80">
          <div className="relative h-3 rounded-full overflow-hidden bg-zinc-200">
            {/* Gradient bar */}
            <div className="absolute inset-0 rounded-full" style={{
              background: 'linear-gradient(to right, #22c55e, #eab308, #f97316, #ef4444)',
            }} />
            {/* Position marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 h-5 w-1.5 rounded-full bg-zinc-900 shadow-md ring-2 ring-white"
              style={{ left: `${Math.min(scoreResult.rawScore, 75) / 75 * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 font-mono text-xs text-zinc-600">
            <span>Clean</span>
            <span>Mild</span>
            <span>Heavy</span>
          </div>
        </div>
      </div>

      {/* Label */}
      <div className="animate-score-reveal" style={{ animationDelay: '0.1s' }}>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl text-zinc-900">
          {clean ? getCleanBadge(scoreResult) : scoreResult.label}
        </h1>
      </div>

      {/* Clean score subtitle */}
      {clean && (
        <p className="animate-score-reveal max-w-sm text-base text-zinc-500 leading-relaxed" style={{ animationDelay: '0.15s' }}>
          {getCleanSubtitle(scoreResult)}
        </p>
      )}

      {/* Roast line */}
      <div
        className="animate-score-reveal max-w-lg rounded-2xl px-6 py-4"
        style={{
          animationDelay: '0.2s',
          backgroundColor: scoreResult.labelColor + '12',
        }}
      >
        <p
          className="text-lg leading-relaxed font-medium text-zinc-700"
        >
          {roastLine}
        </p>
      </div>

      {/* Stats */}
      <div className="animate-score-reveal flex flex-col items-center gap-3" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center gap-5 font-mono text-sm tracking-wide text-zinc-600">
          <span className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-candy-pink" />
            {scoreResult.totalTropesDetected} trope{scoreResult.totalTropesDetected !== 1 ? 's' : ''}
          </span>
          <span className="h-3 w-px bg-zinc-300" />
          <span className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-candy-orange" />
            {scoreResult.totalInstancesDetected} instance{scoreResult.totalInstancesDetected !== 1 ? 's' : ''}
          </span>
          <span className="h-3 w-px bg-zinc-300" />
          <span className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-candy-teal" />
            {scoreResult.actualWordCount} words analyzed
          </span>
        </div>
        <p className="text-xs text-zinc-500">
          Individual patterns can be coincidental. The score reflects how many cluster together in a short text.
        </p>
      </div>
    </section>
  );
}
