import type { ScoreResult } from '@/lib/analysis/scoring';

interface RoastTemplate {
  /** Return true if this template applies to the given score result. */
  match: (result: ScoreResult) => boolean;
  /** Build the roast line. Receives the score result for interpolation. */
  render: (result: ScoreResult) => string;
}

/** Find the top trope result by ID, if present. */
function findTrope(result: ScoreResult, tropeId: string) {
  return result.tropeResults.find((t) => t.tropeId === tropeId);
}

function totalCount(result: ScoreResult): number {
  return result.totalInstancesDetected;
}

const templates: RoastTemplate[] = [
  // ── Clean text ──
  {
    match: (r) => r.totalTropesDetected === 0,
    render: () =>
      'Zero tropes detected. Either someone cares about their writing, or they are running a very good post-processor.',
  },
  {
    match: (r) => r.rawScore <= 5 && r.totalTropesDetected > 0,
    render: (r) =>
      `Only ${r.totalInstancesDetected} instance${r.totalInstancesDetected === 1 ? '' : 's'} across ${r.totalTropesDetected} trope${r.totalTropesDetected === 1 ? '' : 's'}. Barely a whisper of robot. Nice work.`,
  },

  // ── Em dash addiction ──
  {
    match: (r) => {
      const t = findTrope(r, 'em-dash-addiction');
      return !!t && t.count >= 5;
    },
    render: (r) => {
      const t = findTrope(r, 'em-dash-addiction')!;
      const ratio = Math.round(1000 / t.count); // rough per-1000-chars
      return `${t.count} em dashes detected. That is roughly one every ${ratio} words. The punctuation key needs a rest.`;
    },
  },
  {
    match: (r) => {
      const t = findTrope(r, 'em-dash-addiction');
      return !!t && t.count >= 2 && t.count < 5;
    },
    render: (r) => {
      const t = findTrope(r, 'em-dash-addiction')!;
      return `${t.count} em dashes. Not extreme, but the pattern is showing.`;
    },
  },

  // ── Vocab Hall of Shame ──
  {
    match: (r) => {
      const t = findTrope(r, 'vocab-hall-of-shame');
      return !!t && t.count >= 3;
    },
    render: (r) => {
      const t = findTrope(r, 'vocab-hall-of-shame')!;
      const word = t.examples[0] ?? 'delve';
      return `This text "${word}s" ${t.count} times. The robots send their regards.`;
    },
  },
  {
    match: (r) => {
      const t = findTrope(r, 'vocab-hall-of-shame');
      return !!t && t.count >= 1;
    },
    render: (r) => {
      const t = findTrope(r, 'vocab-hall-of-shame')!;
      return `"${t.examples[0] ?? 'Delve'}" spotted. The AI vocabulary hall of shame claims another victim.`;
    },
  },

  // ── Not X, it's Y ──
  {
    match: (r) => {
      const t = findTrope(r, 'not-x-its-y');
      return !!t && t.count >= 4;
    },
    render: (r) => {
      const t = findTrope(r, 'not-x-its-y')!;
      return `${t.count} "not X, it's Y" constructions. The reframe factory is running overtime.`;
    },
  },
  {
    match: (r) => {
      const t = findTrope(r, 'not-x-its-y');
      return !!t && t.count >= 2;
    },
    render: (r) => {
      const t = findTrope(r, 'not-x-its-y')!;
      return `${t.count} instances of the "not X, it's Y" move. The most-memed AI writing pattern in the wild.`;
    },
  },
  {
    match: (r) => {
      const t = findTrope(r, 'not-x-its-y');
      return !!t && t.count === 1;
    },
    render: () =>
      'One "not X, it\'s Y" construction. Could be a coincidence. Could be the beginning of a pattern.',
  },

  // ── Fast-paced world ──
  {
    match: (r) => !!findTrope(r, 'fast-paced-world'),
    render: () =>
      '"In today\'s rapidly evolving landscape" is the AI equivalent of clearing your throat before saying nothing.',
  },

  // ── Sycophantic opener ──
  {
    match: (r) => !!findTrope(r, 'sycophantic-opener'),
    render: () =>
      'Opens with praise for the reader. No human does this. Chatbots do this.',
  },

  // ── Leftover artifacts ──
  {
    match: (r) => !!findTrope(r, 'leftover-artifacts'),
    render: () =>
      'Found leftover AI artifacts in the text. Someone forgot to proofread. That is the AI equivalent of leaving the price tag on.',
  },

  // ── Fabricated citations ──
  {
    match: (r) => {
      const t = findTrope(r, 'fabricated-citations');
      return !!t && t.count >= 2;
    },
    render: (r) => {
      const t = findTrope(r, 'fabricated-citations')!;
      return `"Studies show" appears ${t.count} times without naming a single study. Studies show this is suspicious.`;
    },
  },
  {
    match: (r) => !!findTrope(r, 'fabricated-citations'),
    render: () =>
      '"Studies show" without naming the study. The rhetorical equivalent of a fake Rolex.',
  },

  // ── Ornate metaphors ──
  {
    match: (r) => {
      const t = findTrope(r, 'ornate-metaphors');
      return !!t && t.count >= 3;
    },
    render: (r) => {
      const t = findTrope(r, 'ornate-metaphors')!;
      return `${t.count} ornate metaphors. The "tapestry" and "beacon" factory never takes a day off.`;
    },
  },
  {
    match: (r) => !!findTrope(r, 'ornate-metaphors'),
    render: () =>
      'Decorative metaphors detected. Real writers pick metaphors that surprise. AI picks wallpaper.',
  },

  // ── Rhetorical self-answer ──
  {
    match: (r) => !!findTrope(r, 'rhetorical-self-answer'),
    render: () =>
      'Asks a question, then answers it immediately. The rhetorical move AI models never get tired of.',
  },

  // ── Generic high-score fallbacks ──
  {
    match: (r) => r.rawScore > 75,
    render: (r) =>
      `${r.totalInstancesDetected} trope instances across ${r.totalTropesDetected} categories. This text went straight from prompt to publish.`,
  },
  {
    match: (r) => r.rawScore > 50,
    render: (r) =>
      `${r.totalTropesDetected} different AI tropes detected, ${r.totalInstancesDetected} instances total. This reads like an unedited first draft from a chatbot.`,
  },
  {
    match: (r) => r.rawScore > 30,
    render: (r) =>
      `${r.totalInstancesDetected} AI writing patterns found. The robot fingerprint is clear enough that attentive readers will notice.`,
  },
  {
    match: (r) => r.rawScore > 15,
    render: (r) =>
      `${r.totalTropesDetected} trope types, ${r.totalInstancesDetected} total hits. Not overwhelming, but the patterns are there.`,
  },
  {
    match: (r) => r.rawScore > 5,
    render: () =>
      'A few AI writing habits visible. Light editing would clean these up.',
  },

  // ── Absolute fallback ──
  {
    match: () => true,
    render: (r) =>
      r.totalTropesDetected > 0
        ? `${r.totalTropesDetected} trope${r.totalTropesDetected === 1 ? '' : 's'} detected. Could be worse. Could be better.`
        : 'Clean slate. No robot tells found.',
  },
];

/**
 * Returns a one-line roast based on the top tropes in the score result.
 * Picks the first matching template from a priority-ordered list.
 */
export function getRoastLine(scoreResult: ScoreResult): string {
  for (const template of templates) {
    if (template.match(scoreResult)) {
      return template.render(scoreResult);
    }
  }
  // Should never reach here because of the fallback, but TypeScript wants a return.
  return 'Analysis complete.';
}
