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
          className="relative font-display text-[140px] font-bold tabular-nums tracking-tighter leading-none sm:text-[180px]"
          style={{ color: scoreResult.labelColor }}
        >
          {scoreResult.totalInstancesDetected}
        </span>
      </div>

      {/* Label */}
      <div className="animate-score-reveal" style={{ animationDelay: '0.1s' }}>
        <h1 className="font-display italic text-4xl font-bold tracking-tight sm:text-5xl text-zinc-900">
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
          className="text-lg leading-relaxed font-medium"
          style={{ color: scoreResult.labelColor }}
        >
          {roastLine}
        </p>
      </div>

      {/* Stats */}
      <div className="animate-score-reveal flex items-center gap-5 font-mono text-sm tracking-wide text-zinc-400" style={{ animationDelay: '0.3s' }}>
        <span className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-candy-pink" />
          {scoreResult.totalTropesDetected} trope{scoreResult.totalTropesDetected !== 1 ? 's' : ''}
        </span>
        <span className="h-3 w-px bg-zinc-300" />
        <span className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-candy-orange" />
          {scoreResult.totalInstancesDetected} instance{scoreResult.totalInstancesDetected !== 1 ? 's' : ''}
        </span>
      </div>
    </section>
  );
}
