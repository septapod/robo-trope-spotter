/**
 * fair-score.ts — honest scoring of an eval run.
 *
 * The ground-truth labels in test-set.json predate the 2026 taxonomy rebuild
 * (which split several broad ids into precise ones and added 20 new tropes).
 * Exact-id matching therefore *understates* recall: the model now tags a tell
 * with a newer, more specific id than the label predates. This script reports
 * BOTH numbers so the gap between them is visible, never hidden:
 *
 *   - exact-id:     strict, the old yardstick (a detection counts only if its
 *                   id is identical to a ground-truth id).
 *   - family-aware: a detection counts if it lands in the same interchangeable
 *                   family as a ground-truth id (e.g. any buzzword-cluster id
 *                   covers any other). Engine-owned ids are excluded from the
 *                   LLM's recall, since the deterministic engine handles them.
 *
 * Usage: tsx eval/fair-score.ts <run-dir> [label]
 */
import fs from 'node:fs';
import path from 'node:path';

const ts = JSON.parse(fs.readFileSync('eval/test-set.json', 'utf8'));
const RUN = process.argv[2];
const LABEL = process.argv[3] || path.basename(RUN);
if (!RUN || !fs.existsSync(RUN)) {
  console.error(`run dir not found: ${RUN}`);
  process.exit(1);
}

// Families of genuinely interchangeable ids (the model now splits these finer
// than the old labels did). A hit anywhere in the family covers the label.
const FAMILIES: string[][] = [
  ['vocab-hall-of-shame','ai-vocab-cluster','significance-verbs','journey-verbs','container-nouns','travel-brochure','ornate-metaphors','testament-collocation','breathless-enthusiasm'],
  ['fast-paced-world','vague-universal-opener'],
];
const famOf = new Map<string, number>();
FAMILIES.forEach((g, i) => g.forEach(id => famOf.set(id, i)));
const sameFamily = (a: string, b: string) =>
  a === b || (famOf.has(a) && famOf.get(a) === famOf.get(b));

// Deterministic-engine-owned ids: not the LLM's job, so excluded from LLM recall/precision.
const ENGINE = new Set(['em-dash-addiction','leaked-markup','emoji-bullets','title-case-headers','excessive-bolding','low-burstiness','uniform-length','low-perplexity','perfect-grammar','style-consistency']);

type Tally = { tp: number; fn: number; fp: number; viol: number };
const exact: Tally = { tp: 0, fn: 0, fp: 0, viol: 0 };
const fair: Tally = { tp: 0, fn: 0, fp: 0, viol: 0 };

for (const e of ts) {
  const f = path.join(RUN, e.id + '.json');
  if (!fs.existsSync(f)) continue;
  const det: string[] = (JSON.parse(fs.readFileSync(f, 'utf8')).detections || []).map((d: any) => d.tropeId);
  const gtAll: string[] = (e.groundTruth || []).map((g: any) => g.tropeId);
  const gtFair = gtAll.filter(g => !ENGINE.has(g)); // engine ids don't count against LLM recall
  const nonT = new Set<string>(e.expectedNonTropes || []);

  // exact-id
  for (const g of gtAll) (det.includes(g) ? exact.tp++ : exact.fn++);
  for (const d of det) {
    if (!gtAll.includes(d)) exact.fp++;
    if (nonT.has(d)) exact.viol++;
  }
  // family-aware, engine-excluded
  for (const g of gtFair) (det.some(d => sameFamily(d, g)) ? fair.tp++ : fair.fn++);
  for (const d of det) {
    if (ENGINE.has(d)) continue;
    if (!gtAll.some(g => sameFamily(d, g))) fair.fp++;
    if ([...nonT].some(n => sameFamily(d, n))) fair.viol++;
  }
}

const pc = (x: number) => (100 * x).toFixed(1) + '%';
const line = (name: string, t: Tally) => {
  const P = t.tp / (t.tp + t.fp || 1), R = t.tp / (t.tp + t.fn || 1), F1 = 2 * P * R / (P + R || 1);
  console.log(`  ${name.padEnd(14)} P ${pc(P).padStart(6)} | R ${pc(R).padStart(6)} | F1 ${pc(F1).padStart(6)} | FP ${String(t.fp).padStart(3)} | viol ${t.viol}`);
};

console.log(`\n=== ${LABEL} ===`);
line('exact-id', exact);
line('family-aware', fair);
console.log(`\n  baseline (old prompt, exact-id):  P 46.7% | R 76.0% | F1 57.9% | FP 105 | viol 18`);
