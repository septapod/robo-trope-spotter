import { ImageResponse } from 'next/og';
import { db } from '@/db';
import { reports } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { ScoreResult, DnaStripBand } from '@/lib/analysis/scoring';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Roast lines keyed by score label, used when no roast-lines module exists.
const ROAST_LINES: Record<string, string> = {
  Clean: 'Genuinely human. No notes.',
  'Light Touches': 'A few patterns, nothing a quick edit won\'t fix.',
  'Noticeable Patterns': 'The AI fingerprint is showing through.',
  'Needs Another Pass': 'This one could use some serious editing.',
  'Full Robot Mode': 'Reads like an unrevised first draft from a chatbot.',
  'Unedited AI Output': 'Straight from prompt to publish. Zero editing detected.',
};

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<ImageResponse> {
  const { slug } = await params;

  // Fetch Inter font from Google Fonts CDN
  const [interBold, interRegular] = await Promise.all([
    fetch(
      'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf'
    ).then((res) => res.arrayBuffer()),
    fetch(
      'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf'
    ).then((res) => res.arrayBuffer()),
  ]);

  // Look up the report
  const [report] = await db()
    .select()
    .from(reports)
    .where(eq(reports.slug, slug))
    .limit(1);

  if (!report) {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: '#FAF9F6',
            color: '#71717a',
            fontFamily: 'Inter',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 28,
              letterSpacing: '0.12em',
              textTransform: 'uppercase' as const,
              color: '#71717a',
              marginBottom: 24,
            }}
          >
            ROBO TROPE SPOTTER
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 48,
              fontWeight: 700,
              color: '#18181b',
            }}
          >
            Report not found
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 20,
              color: '#a1a1aa',
              marginTop: 32,
            }}
          >
            robotropes.dxn.is
          </div>
        </div>
      ),
      {
        ...size,
        fonts: [
          { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
          { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
        ],
      }
    );
  }

  const resultsData = report.results as { score: ScoreResult };
  const { rawScore, label, labelColor, dnaStrip } = resultsData.score;

  const roastLine = ROAST_LINES[label] ?? 'Something went wrong scoring this text.';

  // Build DNA strip bands. If empty, show a single muted bar.
  const bands: DnaStripBand[] =
    dnaStrip && dnaStrip.length > 0 ? dnaStrip : [];

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#FAF9F6',
          fontFamily: 'Inter',
          padding: '48px 56px',
        }}
      >
        {/* Top branding */}
        <div
          style={{
            display: 'flex',
            fontSize: 18,
            letterSpacing: '0.16em',
            textTransform: 'uppercase' as const,
            color: '#a1a1aa',
            marginBottom: 8,
          }}
        >
          ROBO TROPE SPOTTER
        </div>

        {/* Spacer */}
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
          {/* Score row */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'baseline',
              gap: 20,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: 120,
                fontWeight: 700,
                color: labelColor,
                lineHeight: 1,
              }}
            >
              {Math.round(rawScore)}
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 18,
                color: '#71717a',
                letterSpacing: '0.05em',
                textTransform: 'uppercase' as const,
              }}
            >
              trope score
            </div>
          </div>

          {/* Label */}
          <div
            style={{
              display: 'flex',
              fontSize: 40,
              fontWeight: 700,
              color: '#18181b',
              marginBottom: 12,
            }}
          >
            {label}
          </div>

          {/* Roast line */}
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              color: '#71717a',
              lineHeight: 1.4,
              maxWidth: 800,
            }}
          >
            {roastLine}
          </div>
        </div>

        {/* DNA strip */}
        {bands.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              height: 16,
              borderRadius: 8,
              overflow: 'hidden',
              marginBottom: 24,
              gap: 3,
            }}
          >
            {bands.map((band, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flex: Math.max(band.count, 1),
                  backgroundColor: band.color,
                  height: '100%',
                  borderRadius: i === 0 ? '8px 0 0 8px' : i === bands.length - 1 ? '0 8px 8px 0' : '0',
                }}
              />
            ))}
          </div>
        )}

        {/* Empty DNA strip fallback */}
        {bands.length === 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              height: 16,
              borderRadius: 8,
              overflow: 'hidden',
              marginBottom: 24,
              backgroundColor: '#22c55e',
              opacity: 0.3,
            }}
          />
        )}

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 18,
              color: '#a1a1aa',
            }}
          >
            robotropes.dxn.is
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 16,
              color: '#a1a1aa',
            }}
          >
            {resultsData.score.totalTropesDetected} tropes found, {resultsData.score.totalInstancesDetected} instances
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
        { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
      ],
    }
  );
}
