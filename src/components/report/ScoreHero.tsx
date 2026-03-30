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

      {/* Score number — massive, editorial */}
      <div className="animate-score-reveal relative">
        <span
          className="relative font-accent text-[160px] font-black tabular-nums tracking-tighter leading-none sm:text-[200px]"
          style={{ color: scoreResult.labelColor }}
        >
          {scoreResult.rawScore}
        </span>
        <p className="font-mono text-sm tracking-[0.25em] uppercase text-zinc-400 mt-3">
          trope score
        </p>
        {/* Visual scale bar */}
        <div className="mt-6 w-72 sm:w-80">
          <div className="relative h-3 rounded-full overflow-hidden bg-zinc-200">
            <div className="absolute inset-0 rounded-full" style={{
              background: 'linear-gradient(to right, #06D6A0, #FFBE0B, #FF6D2E, #EF233C)',
            }} />
            <div
              className="absolute top-1/2 -translate-y-1/2 h-5 w-1.5 rounded-full bg-zinc-900 shadow-md ring-2 ring-white"
              style={{ left: `${Math.min(scoreResult.rawScore, 75) / 75 * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 font-mono text-sm text-zinc-400">
            <span>Clean</span>
            <span>Mild</span>
            <span>Heavy</span>
          </div>
        </div>
      </div>

      {/* Label — big display */}
      <div className="animate-score-reveal" style={{ animationDelay: '0.1s' }}>
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl text-zinc-900">
          {clean ? getCleanBadge(scoreResult) : scoreResult.label}
        </h1>
      </div>

      {/* Clean score subtitle */}
      {clean && (
        <p className="animate-score-reveal max-w-sm text-lg text-zinc-500 leading-relaxed" style={{ animationDelay: '0.15s' }}>
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
          className="text-lg leading-relaxed font-semibold font-accent italic"
          style={{ color: scoreResult.labelColor }}
        >
          {roastLine}
        </p>
      </div>

      {/* Stats row */}
      <div className="animate-score-reveal flex flex-col items-center gap-3" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center gap-5 font-mono text-sm tracking-wide text-zinc-500">
          <span className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-pop-pink" />
            {scoreResult.totalTropesDetected} trope{scoreResult.totalTropesDetected !== 1 ? 's' : ''}
          </span>
          <span className="h-4 w-px bg-zinc-300" />
          <span className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-pop-orange" />
            {scoreResult.totalInstancesDetected} instance{scoreResult.totalInstancesDetected !== 1 ? 's' : ''}
          </span>
          <span className="h-4 w-px bg-zinc-300" />
          <span className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-pop-teal" />
            {scoreResult.wordCount} words
          </span>
        </div>
        <p className="text-sm text-zinc-400">
          Score reflects concentration: fewer words with more tropes scores higher.
        </p>
      </div>
    </section>
  );
}
