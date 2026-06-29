import fs from 'node:fs';
import path from 'node:path';
import { metaFor } from '../src/lib/tropes/meta';
const ts = JSON.parse(fs.readFileSync('eval/test-set.json', 'utf8'));
const RUN = process.argv[2];
const ENGINE = new Set(['em-dash-addiction','leaked-markup','emoji-bullets','title-case-headers','excessive-bolding','low-burstiness','uniform-length','low-perplexity','perfect-grammar','style-consistency']);
let exTP = 0, exFN = 0, softTP = 0, softFN = 0;
const realMiss: string[] = [];
for (const e of ts) {
  const f = path.join(RUN, e.id + '.json');
  if (!fs.existsSync(f)) continue;
  const det: string[] = (JSON.parse(fs.readFileSync(f, 'utf8')).detections || []).map((d: any) => d.tropeId);
  const detCat = new Set(det.map((id) => metaFor(id).category));
  for (const g of (e.groundTruth || []).map((x: any) => x.tropeId)) {
    if (ENGINE.has(g)) continue;
    if (det.includes(g)) exTP++; else exFN++;
    if (det.includes(g) || detCat.has(metaFor(g).category)) softTP++;
    else { softFN++; realMiss.push(e.id + ':' + g); }
  }
}
const p = (a: number, b: number) => (b + a ? (100 * a / (a + b)).toFixed(1) + '%' : 'n/a');
console.log('LLM-path recall (engine-owned tells excluded):');
console.log('  EXACT-id recall:  ', p(exTP, exFN), ' (penalized by 20 new ids vs stale labels)');
console.log('  CATEGORY recall:  ', p(softTP, softFN), ' (caught the right KIND of tell)');
console.log('Genuine family-level misses:', realMiss.length);
console.log(realMiss.slice(0, 16).join('\n'));
