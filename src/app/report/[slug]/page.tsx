import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { reports } from '@/db/schema';
import type { ScoreResult } from '@/lib/analysis/scoring';
import type { Metadata } from 'next';
import { ScoreHero } from '@/components/report/ScoreHero';
import { TopOffenders } from '@/components/report/TopOffenders';
import { AllDetections } from '@/components/report/AllDetections';
import { ShareBar } from '@/components/report/ShareBar';
import { HighlightedText } from '@/components/report/HighlightedText';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getReport(slug: string) {
  const result = await db()
    .select()
    .from(reports)
    .where(eq(reports.slug, slug))
    .limit(1);
  return result[0] ?? null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const report = await getReport(slug);

  if (!report) {
    return { title: 'Report Not Found' };
  }

  const resultsData = report.results as { score: ScoreResult };
  const scoreResult = resultsData.score;
  const title = `Score: ${scoreResult.rawScore} (${scoreResult.label})`;
  const description = `${scoreResult.totalTropesDetected} AI writing tropes detected, ${scoreResult.totalInstancesDetected} total instances.`;

  return {
    title: `${title} | Robo Trope Spotter`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: [`/og/${slug}`],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/og/${slug}`],
    },
  };
}

export default async function ReportPage({ params }: PageProps) {
  const { slug } = await params;
  const report = await getReport(slug);

  if (!report) {
    notFound();
  }

  const resultsData = report.results as { score: ScoreResult; llmTimedOut?: boolean };
  const scoreResult = resultsData.score;
  const llmTimedOut = resultsData.llmTimedOut ?? false;
  const remaining = scoreResult.tropeResults.slice(5);

  return (
    <main className="min-h-screen bg-surface-0 gradient-mesh">
      {/* Decorative blob */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="animate-blob blob-shape absolute left-1/4 top-0 h-[500px] w-[500px] blur-[100px] opacity-[0.1]"
          style={{ backgroundColor: scoreResult.labelColor }}
        />
        <div
          className="animate-blob-alt blob-shape-alt absolute right-0 bottom-1/4 h-[350px] w-[350px] blur-[80px] opacity-[0.08]"
          style={{ backgroundColor: '#3A86FF' }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between border-b border-zinc-200/60 px-6 py-4 backdrop-blur-sm bg-surface-0/80">
        <a href="/" className="flex items-center gap-3 group">
          <div className="editorial-rule w-6 transition-all group-hover:w-10" />
          <span className="font-display text-base font-extrabold tracking-tight text-zinc-400 transition-colors group-hover:text-pop-pink">
            Robo Trope Spotter
          </span>
        </a>
        <ShareBar title={scoreResult.label} score={scoreResult.rawScore} />
      </nav>

      {/* LLM timeout notice */}
      {llmTimedOut && (
        <div className="relative z-10 mx-auto max-w-2xl px-4 pt-6">
          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 px-5 py-4">
            <p className="text-amber-800 text-base text-center font-semibold">
              Analysis timed out — results may be incomplete. Try again for a fuller report.
            </p>
          </div>
        </div>
      )}

      <div className="relative z-10">
        <ScoreHero scoreResult={scoreResult} />

        <div className="mt-4">
          <HighlightedText
            sourceText={report.sourceText}
            tropeResults={scoreResult.tropeResults}
          />
        </div>

        <div className="mt-8">
          <TopOffenders tropes={scoreResult.topOffenders} />
          <AllDetections remaining={remaining} />
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-200/60 px-4 py-12 text-center">
        <div className="editorial-rule w-10 mx-auto mb-5" />
        <p className="font-accent italic text-base text-zinc-400">
          Because someone should tell them.
        </p>
        <a
          href="/"
          className="mt-5 inline-block font-display font-extrabold text-base btn-gradient rounded-2xl px-7 py-3 shadow-md shadow-pop-pink/15 transition-all hover:shadow-lg hover:shadow-pop-pink/25"
        >
          <span className="relative z-10">Analyze another text</span>
        </a>
      </footer>
    </main>
  );
}
