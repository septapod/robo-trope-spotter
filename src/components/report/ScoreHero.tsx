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
    <section className="flex flex-col items-center gap-4 py-12 px-4 text-center">
      {/* Score number */}
      <div className="relative">
        <span
          className="text-8xl font-black tabular-nums tracking-tight sm:text-9xl"
          style={{ color: scoreResult.labelColor }}
        >
          {scoreResult.rawScore}
        </span>
      </div>

      {/* Label */}
      <h1
        className="text-2xl font-bold tracking-tight sm:text-3xl"
        style={{ color: scoreResult.labelColor }}
      >
        {clean ? getCleanBadge(scoreResult) : scoreResult.label}
      </h1>

      {/* Subtitle for clean scores */}
      {clean && (
        <p className="max-w-md text-sm text-zinc-400">
          {getCleanSubtitle(scoreResult)}
        </p>
      )}

      {/* Roast line */}
      <p className="max-w-lg text-base leading-relaxed text-zinc-300">
        {roastLine}
      </p>

      {/* Stats bar */}
      <div className="mt-2 flex items-center gap-6 text-xs text-zinc-500">
        <span>
          {scoreResult.totalTropesDetected} trope
          {scoreResult.totalTropesDetected !== 1 ? 's' : ''} detected
        </span>
        <span className="h-3 w-px bg-zinc-700" />
        <span>
          {scoreResult.totalInstancesDetected} total instance
          {scoreResult.totalInstancesDetected !== 1 ? 's' : ''}
        </span>
      </div>
    </section>
  );
}
