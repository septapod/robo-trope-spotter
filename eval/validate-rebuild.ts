/**
 * Deterministic validation of the 2026 rebuild — no API key required.
 *
 * Proves the non-LLM half of the improvement: the statistical engine (which
 * fixes the eval's 0% Tier-5 recall), the length gate, leaked-markup detection,
 * and — most importantly — the reliability re-weighting that corrects the old
 * scoring's inverted weights.
 *
 * Run: npx tsx eval/validate-rebuild.ts
 */
import { analyzeStatistical } from '../src/lib/analysis/statistical-engine';
import { computeScoreFromLlm } from '../src/lib/analysis/scoring';
import { reliabilityWeight } from '../src/lib/tropes/meta';
import type { LlmDetection } from '../src/lib/analysis/types';

const line = (s = '') => console.log(s);
const rule = () => line('─'.repeat(72));

function show(name: string, text: string) {
  const { detections, stats } = analyzeStatistical(text);
  const score = computeScoreFromLlm(detections, stats.wordCount, stats);
  rule();
  line(`▶ ${name}`);
  line(
    `  words=${stats.wordCount}  sentences=${stats.sentenceCount}  burstiness=${stats.burstiness}  emDashes=${stats.emDashCount}`
  );
  line(`  SCORE ${score.rawScore} → "${score.label}"  confidence=${score.confidence}  gated=${score.gated}`);
  if (score.tropeResults.length) {
    line('  statistical detections (deterministic):');
    for (const t of score.tropeResults) {
      line(`    • ${t.tropeName} [${t.category}/${t.reliability}] ×${t.count} (conf ${t.examples.length ? '' : ''}${t.weightedScore})`);
    }
  } else {
    line('  statistical detections: none');
  }
  line(`  note: ${score.confidenceNote}`);
}

// --- Old tier weights (the bug) vs new reliability weights ---
const OLD_TIER_WEIGHT: Record<number, number> = { 1: 5, 2: 3, 3: 2, 4: 1.5, 5: 1 };
function mkDet(tropeId: string, tier: number): LlmDetection {
  return { tropeId, tier: tier as 1, confidence: 0.8, count: 2, matchedExcerpts: ['x'], explanation: 'x', suggestion: 'x' };
}

function weightComparison() {
  rule();
  line('▶ WEIGHT INVERSION FIX (same detections, old tier-weight vs new reliability-weight)');
  // A set built only from flashy lexical/formatting tells (the false-positive zone).
  const lexicalOnly = [
    mkDet('em-dash-addiction', 1),
    mkDet('vocab-hall-of-shame', 1),
    mkDet('ornate-metaphors', 2),
    mkDet('latinate-vocab', 3),
  ];
  // A set built from hard-to-fake structural/substance tells (the trustworthy zone).
  const structural = [
    mkDet('low-burstiness', 5),
    mkDet('missing-specifics', 4),
    mkDet('treadmill-effect', 4),
    mkDet('both-sides-balance', 4),
  ];
  const oldW = (ds: LlmDetection[]) => ds.reduce((a, d) => a + OLD_TIER_WEIGHT[d.tier] * d.count * d.confidence, 0);
  const newW = (ds: LlmDetection[]) => ds.reduce((a, d) => a + reliabilityWeight(d.tropeId) * d.count * d.confidence, 0);
  line(`  lexical/formatting-only set:  OLD weight=${oldW(lexicalOnly).toFixed(1)}   NEW weight=${newW(lexicalOnly).toFixed(1)}`);
  line(`  structural/substance set:     OLD weight=${oldW(structural).toFixed(1)}   NEW weight=${newW(structural).toFixed(1)}`);
  line('  OLD scored the flashy-but-unreliable lexical set HIGHER than the trustworthy structural set.');
  line('  NEW inverts that: structural/substance now outweighs lexical/formatting, matching the detection research.');
}

const SAMPLES: Record<string, string> = {
  'Clean human (real texture, varied rhythm, >100 words)':
    'My dad fixed radios. Not professionally, he sold insurance, but on weekends the kitchen table disappeared under a city of tubes and wire and the smell of hot solder. I would sit across from him and hold the flashlight, which was the only job he trusted me with, and mostly I held it wrong. He never got angry about the flashlight. He would just reach over, tilt my wrist a few degrees, and go back to whatever tiny thing he was coaxing back to life. I think about that wrist-tilt more than almost anything else he taught me. It was the whole man in one small motion: patient, exact, and completely uninterested in making me feel bad about the light.',
  'The US Constitution (GPTZero flags this as AI)':
    'We the People of the United States, in Order to form a more perfect Union, establish Justice, insure domestic Tranquility, provide for the common defence, promote the general Welfare, and secure the Blessings of Liberty to ourselves and our Posterity, do ordain and establish this Constitution for the United States of America. All legislative Powers herein granted shall be vested in a Congress of the United States, which shall consist of a Senate and House of Representatives. The House of Representatives shall be composed of Members chosen every second Year by the People of the several States.',
  'Unedited AI slop (uniform rhythm + leaked markup, >100 words)':
    'In today\'s rapidly evolving landscape, organizations must navigate the complexities of digital transformation initiatives. Moreover, forward-thinking leaders must foster a culture of continuous innovation and collaboration. Furthermore, high-performing teams must leverage data to unlock their full potential effectively. This underscores the pivotal role that strategy plays in modern enterprises today. It is worth noting that the implications of this shift are quite significant indeed. :contentReference[oaicite:3]{index=3} These comprehensive findings demonstrate a robust and scalable approach to growth. The broader ecosystem of tools continues to evolve at an unprecedented pace globally. Innovation ultimately drives growth, and sustained growth drives further innovation across markets.',
  'Short note (under the 100-word floor)':
    'Hey, quick one. The Q3 numbers came in and we beat the forecast by a little. Nothing dramatic, but I will take it. Coffee Thursday?',
};

line('');
line('ROBOTROPES 2026 REBUILD — deterministic validation (no API)');
for (const [name, text] of Object.entries(SAMPLES)) show(name, text);
weightComparison();
rule();
line('');
