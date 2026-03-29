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

  const resultsData = report.results as { score: ScoreResult };
  const scoreResult = resultsData.score;
  const remaining = scoreResult.tropeResults.slice(5);

  return (
    <main className="min-h-screen bg-surface-0 gradient-mesh">
      {/* Decorative blob */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="animate-blob blob-shape absolute left-1/4 top-0 h-[500px] w-[500px] blur-[100px] opacity-[0.1]"
          style={{ backgroundColor: scoreResult.labelColor }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between border-b border-zinc-200/60 px-6 py-4 backdrop-blur-sm bg-surface-0/80">
        <a href="/" className="font-display text-base font-bold tracking-tight text-zinc-400 transition-colors hover:text-candy-pink">
          Robo Trope Spotter
        </a>
        <ShareBar title={scoreResult.label} score={scoreResult.rawScore} />
      </nav>

      <div className="relative z-10">
        <div className="py-16">
          <ScoreHero scoreResult={scoreResult} />
        </div>

        <div className="py-16">
          <HighlightedText
            sourceText={report.sourceText}
            tropeResults={scoreResult.tropeResults}
          />
        </div>

        <div className="py-16">
          <TopOffenders tropes={scoreResult.topOffenders} />
        </div>

        <div className="py-16">
          <AllDetections remaining={remaining} />
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-200/60 px-4 py-10 text-center">
        <p className="font-mono text-sm tracking-wider text-zinc-400 uppercase">
          We grade the writing. The writer is none of our business.
        </p>
        <a
          href="/"
          className="mt-4 inline-block font-display font-bold text-sm btn-gradient rounded-2xl px-6 py-2.5 shadow-md shadow-candy-pink/15 transition-all hover:shadow-lg hover:shadow-candy-pink/25"
        >
          <span className="relative z-10">Analyze another text</span>
        </a>
      </footer>
    </main>
  );
}
