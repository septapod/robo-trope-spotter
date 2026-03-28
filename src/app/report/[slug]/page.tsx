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
  const result = await db
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

  const scoreResult = report.results as ScoreResult;
  const title = `Score: ${scoreResult.rawScore} (${scoreResult.label})`;
  const description = `${scoreResult.totalTropesDetected} AI writing tropes detected, ${scoreResult.totalInstancesDetected} total instances. Analyzed by Robo Trope Spotter.`;

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

  const scoreResult = report.results as ScoreResult;
  const remaining = scoreResult.tropeResults.slice(5);

  return (
    <main className="min-h-screen bg-zinc-950 pb-24">
      {/* Header */}
      <header className="flex items-center justify-center border-b border-zinc-900 px-4 py-4">
        <a href="/" className="text-sm font-bold tracking-tight text-zinc-400 transition-colors hover:text-zinc-200">
          Robo Trope Spotter
        </a>
      </header>

      <ScoreHero scoreResult={scoreResult} />
      <DnaStrip bands={scoreResult.dnaStrip} />

      <div className="mt-4">
        <TopOffenders tropes={scoreResult.topOffenders} />
        <AllDetections remaining={remaining} />
      </div>

      <ShareBar title={scoreResult.label} score={scoreResult.rawScore} />

      {/* Footer */}
      <footer className="mt-8 border-t border-zinc-900 px-4 py-6 text-center text-xs text-zinc-600">
        <p>
          This tool grades writing patterns, not people. A high score means the
          text contains common AI writing tropes. It does not mean the text is
          bad, or that the author is lazy.
        </p>
      </footer>
    </main>
  );
}
