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
    <section className="relative flex flex-col items-center gap-6 py-16 px-4 text-center sm:py-20">
      {/* Score number with glow */}
      <div className="animate-score-reveal relative">
        <div
          className="absolute inset-0 blur-3xl opacity-15 rounded-full scale-150"
          style={{ backgroundColor: scoreResult.labelColor }}
        />
        <span
          className="relative font-mono text-[120px] font-bold tabular-nums tracking-tighter leading-none sm:text-[160px]"
          style={{ color: scoreResult.labelColor }}
        >
          {scoreResult.rawScore}
        </span>
      </div>

      {/* Label */}
      <div className="animate-score-reveal" style={{ animationDelay: '0.1s' }}>
        <h1 className="font-sans text-3xl font-black tracking-tight sm:text-4xl text-zinc-900">
          {clean ? getCleanBadge(scoreResult) : scoreResult.label}
        </h1>
      </div>

      {/* Clean score subtitle */}
      {clean && (
        <p className="animate-score-reveal max-w-sm text-sm text-zinc-500 leading-relaxed" style={{ animationDelay: '0.15s' }}>
          {getCleanSubtitle(scoreResult)}
        </p>
      )}

      {/* Roast line */}
      <p className="animate-score-reveal max-w-md text-base leading-relaxed text-zinc-600" style={{ animationDelay: '0.2s' }}>
        {roastLine}
      </p>

      {/* Stats */}
      <div className="animate-score-reveal flex items-center gap-4 font-mono text-sm tracking-wide text-zinc-400" style={{ animationDelay: '0.3s' }}>
        <span>
          {scoreResult.totalTropesDetected} trope{scoreResult.totalTropesDetected !== 1 ? 's' : ''}
        </span>
        <span className="h-2.5 w-px bg-zinc-300" />
        <span>
          {scoreResult.totalInstancesDetected} instance{scoreResult.totalInstancesDetected !== 1 ? 's' : ''}
        </span>
      </div>
    </section>
  );
}
