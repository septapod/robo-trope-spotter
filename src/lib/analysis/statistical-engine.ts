import type { LlmDetection } from './types';
import { tropeById } from '@/lib/tropes/registry';

/**
 * Deterministic stylometric + artifact layer.
 *
 * The old pipeline was LLM-only, which is why the eval showed 0% recall on
 * Tier 5 (low-burstiness, style-consistency): a language model cannot reliably
 * estimate the variance of its own sentence lengths by reading. These features
 * are arithmetic, so we compute them exactly and hand the LLM the things it is
 * actually good at (meaning, rhetoric) instead.
 *
 * Everything here is high-precision by construction. Leaked model markup is
 * essentially proof; burstiness only fires with enough sentences to be
 * meaningful. Counts are exact, not guessed.
 */

export interface DocStats {
  wordCount: number;
  sentenceCount: number;
  meanSentenceLength: number;
  sentenceLengthStdDev: number;
  /** Coefficient of variation of sentence length. Humans run high (~0.5-0.8); LLMs run flat. */
  burstiness: number;
  emDashCount: number;
  /** True when the text is too short for a meaningful score (research floor ~100 words). */
  tooShort: boolean;
}

export interface StatisticalResult {
  detections: LlmDetection[];
  stats: DocStats;
}

const MIN_WORDS_FOR_SCORE = 100;
const MIN_SENTENCES_FOR_BURSTINESS = 6;

const LEAKED_MARKUP =
  /(oai_citation|contentReference|:contentReference|\[oaicite|turn\d+(?:search|news|view|image)|【[^】]*】|\bas an? (?:large )?language model\b|\bI(?:'m| am) (?:just )?an AI\b|\bI (?:cannot|can't|don't) have (?:personal )?(?:opinions|feelings|experiences)\b|\[(?:insert|your name|topic|company name|date)[^\]]*\])/gi;

// Emoji used as a line-leading bullet marker.
const EMOJI =
  /[\u{1F300}-\u{1FAFF}\u{1F000}-\u{1F2FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{FE0F}\u{2705}\u{2728}\u{274C}\u{2B50}]/u;

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).filter(Boolean).length >= 2);
}

function det(
  tropeId: string,
  confidence: number,
  count: number,
  excerpt: string,
  explanation: string,
  suggestion: string
): LlmDetection {
  const def = tropeById(tropeId);
  return {
    tropeId,
    tier: def?.tier ?? 3,
    confidence: Math.round(Math.min(1, confidence) * 100) / 100,
    count,
    matchedExcerpts: [excerpt.slice(0, 140)],
    explanation,
    suggestion,
  };
}

export function analyzeStatistical(text: string): StatisticalResult {
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentences = splitSentences(text);
  const lens = sentences.map((s) => s.split(/\s+/).filter(Boolean).length);

  const mean = lens.length ? lens.reduce((a, b) => a + b, 0) / lens.length : 0;
  const variance = lens.length
    ? lens.reduce((a, b) => a + (b - mean) ** 2, 0) / lens.length
    : 0;
  const std = Math.sqrt(variance);
  const burstiness = mean > 0 ? std / mean : 0;

  const emDashCount = (text.match(/—/g) || []).length;

  const stats: DocStats = {
    wordCount,
    sentenceCount: sentences.length,
    meanSentenceLength: Math.round(mean * 10) / 10,
    sentenceLengthStdDev: Math.round(std * 10) / 10,
    burstiness: Math.round(burstiness * 100) / 100,
    emDashCount,
    tooShort: wordCount < MIN_WORDS_FOR_SCORE,
  };

  const detections: LlmDetection[] = [];

  // --- Leaked model markup (conclusive) ---
  const markupHits = [...text.matchAll(LEAKED_MARKUP)];
  if (markupHits.length > 0) {
    detections.push(
      det(
        'leaked-markup',
        0.98,
        markupHits.length,
        markupHits[0][0],
        `Found model-generated markup left in the text ("${markupHits[0][0].slice(0, 40)}"). This is paste residue from a chat window.`,
        'Delete it. Then read the whole thing before publishing. This got missed because nobody did.'
      )
    );
  }

  // --- Em dash density (low reliability, exact count) ---
  if (emDashCount > 0) {
    const per1k = wordCount > 0 ? (emDashCount / wordCount) * 1000 : emDashCount;
    // Confidence scales with DENSITY, not raw count, and stays modest: em dashes
    // are the most over-claimed tell and the most legitimately human.
    const confidence =
      per1k >= 12 ? 0.7 : per1k >= 6 ? 0.55 : emDashCount >= 3 ? 0.45 : 0.35;
    const example =
      sentences.find((s) => s.includes('—'))?.slice(0, 120) ??
      text.slice(0, 100);
    detections.push(
      det(
        'em-dash-addiction',
        confidence,
        emDashCount,
        example,
        `${emDashCount} em dash${emDashCount === 1 ? '' : 'es'} (${per1k.toFixed(1)} per 1,000 words). A weak tell on its own (plenty of humans love them), but worth a look at the density.`,
        'Where the dash sets off an aside, a comma or a period usually reads cleaner.'
      )
    );
  }

  // --- Burstiness / uniform length (high reliability, needs enough sentences) ---
  if (sentences.length >= MIN_SENTENCES_FOR_BURSTINESS && wordCount >= MIN_WORDS_FOR_SCORE) {
    if (burstiness < 0.45) {
      const conf = burstiness < 0.3 ? 0.9 : burstiness < 0.38 ? 0.78 : 0.62;
      detections.push(
        det(
          'low-burstiness',
          conf,
          1,
          sentences.slice(0, 2).join(' '),
          `Sentence lengths barely vary (burstiness ${burstiness.toFixed(2)}; mean ${mean.toFixed(0)} words, deviation ${std.toFixed(1)}). Human writing alternates short punches and long builds. This cruises at one speed.`,
          'Break a long sentence in two, or fuse two short ones. Vary the rhythm on purpose.'
        )
      );
    }
    if (burstiness < 0.4 && mean >= 14 && mean <= 26) {
      detections.push(
        det(
          'uniform-length',
          0.72,
          1,
          sentences.slice(0, 2).join(' '),
          `Sentences cluster near ${mean.toFixed(0)} words with little spread, the 15-to-25-word lane LLMs default to.`,
          'Drop a 4-word sentence in somewhere. Let one run long. The monotony is the tell.'
        )
      );
    }
  }

  // --- Emoji bullets ---
  const lines = text.split(/\r?\n/);
  const emojiBulletLines = lines.filter((l) => {
    const t = l.replace(/^\s*[-*•]\s*/, '').trimStart();
    return t.length > 0 && EMOJI.test(t.slice(0, 2));
  });
  if (emojiBulletLines.length >= 2) {
    detections.push(
      det(
        'emoji-bullets',
        emojiBulletLines.length >= 4 ? 0.85 : 0.65,
        emojiBulletLines.length,
        emojiBulletLines[0].trim(),
        `${emojiBulletLines.length} lines lead with a decorative emoji as a bullet. Default LLM formatting for a benefits list.`,
        'Use a plain hyphen, or fold the list into a sentence.'
      )
    );
  }

  // --- Title Case Headers ---
  const headerLines = lines.filter((l) => {
    const t = l.replace(/^#{1,6}\s*/, '').trim();
    const ws = t.split(/\s+/).filter(Boolean);
    if (ws.length < 2 || ws.length > 9) return false;
    if (/[.!?,;]$/.test(t)) return false;
    const major = ws.filter((w) => w.length > 3);
    if (major.length < 2) return false;
    const capd = major.filter((w) => /^[A-Z][a-z]/.test(w)).length;
    return capd / major.length >= 0.75;
  });
  if (headerLines.length >= 2) {
    detections.push(
      det(
        'title-case-headers',
        0.55,
        headerLines.length,
        headerLines[0].trim(),
        `${headerLines.length} headers capitalize every major word. A model default; sentence case is the human norm in casual contexts.`,
        'Use sentence case for headers unless your house style says otherwise.'
      )
    );
  }

  // --- Excessive bolding ---
  const boldRuns = [...text.matchAll(/\*\*([^*\n]{2,})\*\*/g)];
  const boldWords = boldRuns.reduce(
    (a, m) => a + m[1].split(/\s+/).filter(Boolean).length,
    0
  );
  if (boldRuns.length >= 4 && wordCount > 0 && boldWords / wordCount > 0.12) {
    detections.push(
      det(
        'excessive-bolding',
        0.6,
        boldRuns.length,
        boldRuns[0][1].slice(0, 60),
        `${boldRuns.length} bolded phrases, about ${Math.round((boldWords / wordCount) * 100)}% of the text is bold. Emphasis works by scarcity.`,
        'Bold one or two things, or nothing. If everything is loud, nothing is.'
      )
    );
  }

  return { detections, stats };
}
