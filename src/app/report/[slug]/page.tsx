import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { reports } from '@/db/schema';
import type { ScoreResult } from '@/lib/analysis/scoring';
import type { Metadata } from 'next';
import { ScoreHero } from '@/components/report/ScoreHero';
import { DnaStrip } from '@/components/report/DnaStrip';
import { TopOffenders } from '@/components/report/TopOffenders';
import { AllDetections } from '@/components/report/AllDetections';
import { ShareBar } from '@/components/report/ShareBar';

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
    <main className="min-h-screen bg-surface-0">
      {/* Gradient backdrop behind score */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full blur-[120px] opacity-[0.08]"
          style={{ backgroundColor: scoreResult.labelColor }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between border-b border-zinc-200 px-6 py-4">
        <a href="/" className="font-mono text-sm tracking-widest uppercase text-zinc-400 transition-colors hover:text-candy-pink">
          Robo Trope Spotter
        </a>
        <ShareBar title={scoreResult.label} score={scoreResult.rawScore} />
      </nav>

      <div className="relative z-10">
        <ScoreHero scoreResult={scoreResult} />

        <div className="mx-auto max-w-2xl px-4">
          <DnaStrip bands={scoreResult.dnaStrip} />
        </div>

        <TopOffenders tropes={scoreResult.topOffenders} />
        <AllDetections remaining={remaining} />
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-200 px-4 py-8 text-center">
        <p className="font-mono text-sm tracking-wider text-zinc-400 uppercase">
          Grades writing patterns, not people
        </p>
        <a
          href="/"
          className="mt-3 inline-block font-mono text-sm text-candy-pink/70 hover:text-candy-pink transition-colors"
        >
          Analyze another text
        </a>
      </footer>
    </main>
  );
}
