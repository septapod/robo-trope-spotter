import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import Image from 'next/image';
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

  // Next.js auto-generates the OG image URL from `opengraph-image.tsx` in
  // this route segment. Do not override `images:` here — the auto path is
  // `/report/<slug>/opengraph-image` and that's what we want LinkedIn,
  // Twitter, and iMessage to fetch.
  return {
    title: `${title} | Robo Trope Spotter`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
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
        <a href="/" className="font-display text-base font-bold tracking-tight text-zinc-500 transition-colors hover:text-link-pink">
          Robo Trope Spotter
        </a>
        <ShareBar title={scoreResult.label} score={scoreResult.rawScore} slug={report.slug} />
      </nav>

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
      <footer className="relative z-10 border-t border-zinc-200/60 px-4 py-10 text-center">
        <p className="font-mono text-sm tracking-wider text-zinc-500 uppercase">
          Because it's better to know.
        </p>
        <div className="mt-4 flex items-center justify-center gap-4">
          <a
            href="/"
            className="inline-flex items-center min-h-[44px] font-display font-bold text-sm bg-candy-pink text-white rounded-2xl px-6 py-2.5 shadow-md shadow-candy-pink/15 transition-all hover:bg-pink-600"
          >
            Analyze another text
          </a>
          <a
            href="/tropes"
            className="font-mono text-sm text-link-pink underline underline-offset-4 hover:no-underline inline-flex items-center min-h-[44px] px-3 py-3"
          >
            See all 42 tropes
          </a>
        </div>
        <a
          href="https://dxn.is"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 min-h-[44px] px-3 py-3 text-zinc-500 hover:text-zinc-600 transition-colors"
        >
          <Image src="/dxn-logomark.png" alt="Dixon Strategic Labs" width={20} height={20} />
          <span className="text-xs font-mono">Dixon Strategic Labs</span>
        </a>
      </footer>
    </main>
  );
}
