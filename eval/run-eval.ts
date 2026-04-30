/**
 * Three-model eval harness.
 *
 * Runs Opus 4.7, Sonnet 4.6, and Haiku 4.5 against a hand-labeled test set
 * in single-pass detection mode (no Haiku validation, no em-dash regex
 * injection). Captures raw outputs, computes scores, writes a markdown
 * comparison writeup.
 *
 * Usage:
 *   npm run eval                    # run full eval
 *   npm run eval -- --limit 5       # smoke-test on 5 entries
 *   npm run eval -- --models sonnet # subset of models
 *   npm run eval -- --skip-run      # only re-score existing runs
 *
 * Requires ANTHROPIC_API_KEY in env.
 *
 * Output:
 *   eval/runs/<timestamp>/<model>/<test-id>.json   # raw responses
 *   eval/results-<date>.md                          # writeup
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ANALYSIS_SYSTEM_PROMPT, buildUserPrompt } from '../src/lib/analysis/prompts';
import { allTropes } from '../src/lib/tropes/registry';
import {
  scoreSingleRun,
  aggregate,
  formatPercent,
  renderComparisonTable,
  topMisses,
  topHallucinations,
} from './scoring';
import type {
  TestEntry,
  ModelRun,
  ModelDetection,
  PerTestScore,
} from './types';
import type { Tier } from '../src/lib/tropes/types';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface ModelConfig {
  key: string;
  id: string;
  /** USD per 1M input tokens. */
  inputPrice: number;
  /** USD per 1M output tokens. */
  outputPrice: number;
}

const MODELS: ModelConfig[] = [
  { key: 'opus', id: 'claude-opus-4-7', inputPrice: 5, outputPrice: 25 },
  { key: 'sonnet', id: 'claude-sonnet-4-6', inputPrice: 3, outputPrice: 15 },
  { key: 'haiku', id: 'claude-haiku-4-5-20251001', inputPrice: 1, outputPrice: 5 },
];

const VALID_TROPE_IDS = new Set(allTropes.map(t => t.id));
const TROPE_TIER_MAP = new Map(allTropes.map(t => [t.id, t.tier]));

interface CliArgs {
  limit?: number;
  modelKeys: string[];
  skipRun: boolean;
  testSetPath: string;
  outDir: string;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const out: CliArgs = {
    modelKeys: MODELS.map(m => m.key),
    skipRun: false,
    testSetPath: join(__dirname, 'test-set.json'),
    outDir: join(__dirname, 'runs'),
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--limit') {
      out.limit = parseInt(args[++i], 10);
    } else if (arg === '--models') {
      out.modelKeys = args[++i].split(',').map(s => s.trim());
    } else if (arg === '--skip-run') {
      out.skipRun = true;
    } else if (arg === '--test-set') {
      out.testSetPath = args[++i];
    } else if (arg === '--out') {
      out.outDir = args[++i];
    } else if (arg === '--help' || arg === '-h') {
      console.log(`Usage: npm run eval -- [options]
  --limit N           Only run first N test entries
  --models keys       Comma-separated subset (opus,sonnet,haiku)
  --skip-run          Re-score existing runs without calling the API
  --test-set path     Path to test-set.json
  --out path          Output directory for runs`);
      process.exit(0);
    }
  }
  return out;
}

async function loadTestSet(path: string): Promise<TestEntry[]> {
  const raw = await readFile(path, 'utf8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`Test set at ${path} is not an array`);
  }
  return parsed as TestEntry[];
}

function parseModelResponse(raw: string): { detections: ModelDetection[]; error?: string } {
  let cleaned = raw.trim();
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  if (firstBracket === -1 || lastBracket <= firstBracket) {
    return { detections: [], error: 'No JSON array found in response' };
  }
  cleaned = cleaned.slice(firstBracket, lastBracket + 1);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    return { detections: [], error: `JSON parse failed: ${(err as Error).message}` };
  }
  if (!Array.isArray(parsed)) {
    return { detections: [], error: 'Parsed response is not an array' };
  }

  const detections: ModelDetection[] = [];
  for (const item of parsed) {
    if (typeof item !== 'object' || item === null) continue;
    const obj = item as Record<string, unknown>;
    const tropeId = typeof obj.tropeId === 'string' ? obj.tropeId : null;
    if (!tropeId || !VALID_TROPE_IDS.has(tropeId)) continue;
    const confidence = typeof obj.confidence === 'number' ? obj.confidence : NaN;
    if (isNaN(confidence) || confidence < 0 || confidence > 1) continue;
    const tier = TROPE_TIER_MAP.get(tropeId) ?? (typeof obj.tier === 'number' ? (obj.tier as Tier) : 3);
    const matchedExcerpts = Array.isArray(obj.matchedExcerpts)
      ? (obj.matchedExcerpts as unknown[]).filter((e): e is string => typeof e === 'string')
      : [];
    detections.push({
      tropeId,
      tier,
      confidence: Math.round(confidence * 100) / 100,
      count: typeof obj.count === 'number' ? Math.round(obj.count) : 1,
      matchedExcerpts,
      explanation: typeof obj.explanation === 'string' ? obj.explanation : '',
      suggestion: typeof obj.suggestion === 'string' ? obj.suggestion : '',
    });
  }
  return { detections };
}

async function runOnce(
  client: Anthropic,
  model: ModelConfig,
  entry: TestEntry
): Promise<ModelRun> {
  const start = performance.now();
  try {
    const response = await client.messages.create({
      model: model.id,
      max_tokens: 4096,
      system: ANALYSIS_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(entry.passage) }],
    });

    const content = response.content[0];
    const rawText = content?.type === 'text' ? content.text : '';
    const parsed = parseModelResponse(rawText);

    return {
      testId: entry.id,
      model: model.key,
      detections: parsed.detections,
      rawResponse: rawText,
      parseError: parsed.error,
      durationMs: Math.round(performance.now() - start),
      inputTokens: response.usage?.input_tokens,
      outputTokens: response.usage?.output_tokens,
    };
  } catch (err) {
    return {
      testId: entry.id,
      model: model.key,
      detections: [],
      rawResponse: '',
      parseError: `API error: ${(err as Error).message}`,
      durationMs: Math.round(performance.now() - start),
    };
  }
}

function estimateCost(runs: ModelRun[], model: ModelConfig): number {
  const inputTokens = runs.reduce((sum, r) => sum + (r.inputTokens ?? 0), 0);
  const outputTokens = runs.reduce((sum, r) => sum + (r.outputTokens ?? 0), 0);
  return (inputTokens / 1_000_000) * model.inputPrice + (outputTokens / 1_000_000) * model.outputPrice;
}

async function ensureDir(path: string): Promise<void> {
  if (!existsSync(path)) {
    await mkdir(path, { recursive: true });
  }
}

async function saveRun(runDir: string, modelKey: string, run: ModelRun): Promise<void> {
  const dir = join(runDir, modelKey);
  await ensureDir(dir);
  await writeFile(join(dir, `${run.testId}.json`), JSON.stringify(run, null, 2));
}

async function loadExistingRun(runDir: string, modelKey: string, testId: string): Promise<ModelRun | null> {
  const path = join(runDir, modelKey, `${testId}.json`);
  if (!existsSync(path)) return null;
  try {
    const raw = await readFile(path, 'utf8');
    return JSON.parse(raw) as ModelRun;
  } catch {
    return null;
  }
}

function formatTimestamp(): string {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
    '-',
    String(d.getHours()).padStart(2, '0'),
    String(d.getMinutes()).padStart(2, '0'),
  ].join('');
}

function renderWriteup(
  testEntries: TestEntry[],
  perModel: Map<string, { runs: ModelRun[]; scores: PerTestScore[]; cost: number; modelId: string }>
): string {
  const aggregates = [...perModel.entries()].map(([key, data]) =>
    aggregate(key, data.runs, data.scores)
  );

  const lines: string[] = [];
  lines.push('# Three-model eval: Opus 4.7 vs Sonnet 4.6 vs Haiku 4.5');
  lines.push('');
  lines.push(`Run on ${new Date().toISOString().split('T')[0]} against ${testEntries.length} hand-labeled passages.`);
  lines.push('');
  lines.push('## Methodology');
  lines.push('');
  lines.push('Each passage was sent to each model in single-pass detection mode using the production system prompt verbatim. No Haiku validation pass, no em-dash regex injection — those are pipeline artifacts that would muddy a model-vs-model comparison.');
  lines.push('');
  lines.push('Detections were scored by tropeId match against hand-labeled ground truth. Severity tier comes from the canonical registry, not the model output. Recall and precision are computed across all detections; per-tier metrics group by trope tier.');
  lines.push('');
  lines.push(`Test set composition:`);
  const sourceCounts = new Map<string, number>();
  for (const e of testEntries) {
    sourceCounts.set(e.source, (sourceCounts.get(e.source) ?? 0) + 1);
  }
  for (const [src, n] of sourceCounts) {
    lines.push(`- ${src}: ${n}`);
  }
  lines.push('');

  lines.push('## Headline comparison');
  lines.push('');
  lines.push(renderComparisonTable(aggregates));
  lines.push('');

  lines.push('## Cost');
  lines.push('');
  lines.push('| Model | Total cost (USD) | Avg cost / analysis |');
  lines.push('| --- | --- | --- |');
  for (const [key, data] of perModel) {
    const avg = data.cost / data.runs.length;
    lines.push(`| ${key} (${data.modelId}) | $${data.cost.toFixed(4)} | $${avg.toFixed(4)} |`);
  }
  lines.push('');

  lines.push('## Top misses by model');
  lines.push('');
  for (const [key, data] of perModel) {
    const misses = topMisses(data.scores).slice(0, 10);
    if (misses.length === 0) {
      lines.push(`### ${key}`);
      lines.push('No misses.');
      lines.push('');
      continue;
    }
    lines.push(`### ${key}`);
    lines.push('| Trope | Times missed |');
    lines.push('| --- | --- |');
    for (const m of misses) {
      lines.push(`| ${m.tropeId} | ${m.count} |`);
    }
    lines.push('');
  }

  lines.push('## Top hallucinations by model (false positives)');
  lines.push('');
  for (const [key, data] of perModel) {
    const hallucinations = topHallucinations(data.scores).slice(0, 10);
    if (hallucinations.length === 0) {
      lines.push(`### ${key}`);
      lines.push('No false positives.');
      lines.push('');
      continue;
    }
    lines.push(`### ${key}`);
    lines.push('| Trope | Times hallucinated |');
    lines.push('| --- | --- |');
    for (const h of hallucinations) {
      lines.push(`| ${h.tropeId} | ${h.count} |`);
    }
    lines.push('');
  }

  lines.push('## Recommendation');
  lines.push('');
  lines.push('_(Fill in after reviewing the table above. Recommended primary model + cascade ordering goes here.)_');
  lines.push('');

  lines.push('## Per-test breakdown');
  lines.push('');
  for (const entry of testEntries) {
    lines.push(`### ${entry.id} (${entry.source})`);
    lines.push('');
    lines.push(`Ground truth (${entry.groundTruth.length} tropes): ${entry.groundTruth.map(g => g.tropeId).join(', ') || '(none)'}`);
    lines.push('');
    lines.push('| Model | Detected | TP | FN | FP |');
    lines.push('| --- | --- | --- | --- | --- |');
    for (const [key, data] of perModel) {
      const score = data.scores.find(s => s.testId === entry.id);
      const run = data.runs.find(r => r.testId === entry.id);
      if (!score || !run) continue;
      lines.push(`| ${key} | ${run.detections.length} | ${score.truePositives.length} | ${score.falseNegatives.length} | ${score.falsePositives.length} |`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

async function main(): Promise<void> {
  const args = parseArgs();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey && !args.skipRun) {
    console.error('Missing ANTHROPIC_API_KEY in env. Run with --skip-run to score existing runs only.');
    process.exit(1);
  }

  const testEntries = await loadTestSet(args.testSetPath);
  const slice = args.limit ? testEntries.slice(0, args.limit) : testEntries;
  const selectedModels = MODELS.filter(m => args.modelKeys.includes(m.key));

  console.log(`Loaded ${testEntries.length} test entries; running ${slice.length}.`);
  console.log(`Models: ${selectedModels.map(m => `${m.key} (${m.id})`).join(', ')}`);
  console.log('');

  const runDir = join(args.outDir, formatTimestamp());
  await ensureDir(runDir);

  const client = new Anthropic({ apiKey });
  const perModel = new Map<string, { runs: ModelRun[]; scores: PerTestScore[]; cost: number; modelId: string }>();

  for (const model of selectedModels) {
    console.log(`\n=== ${model.key} (${model.id}) ===`);
    const runs: ModelRun[] = [];
    const scores: PerTestScore[] = [];

    for (const entry of slice) {
      let run: ModelRun | null = null;
      if (args.skipRun) {
        run = await loadExistingRun(args.outDir, model.key, entry.id);
        if (!run) {
          console.log(`  [skip] ${entry.id}: no existing run found, skipping`);
          continue;
        }
      } else {
        process.stdout.write(`  ${entry.id}... `);
        run = await runOnce(client, model, entry);
        await saveRun(runDir, model.key, run);
        const status = run.parseError ? `PARSE ERROR (${run.parseError})` : `${run.detections.length} detections`;
        console.log(`${status} (${run.durationMs}ms)`);
      }
      runs.push(run);
      scores.push(scoreSingleRun(entry, run));
    }

    const cost = estimateCost(runs, model);
    perModel.set(model.key, { runs, scores, cost, modelId: model.id });
    const agg = aggregate(model.key, runs, scores);
    console.log(`  Recall: ${formatPercent(agg.recall)}, Precision: ${formatPercent(agg.precision)}, F1: ${formatPercent(agg.f1)}`);
    console.log(`  Cost: $${cost.toFixed(4)}`);
  }

  const writeup = renderWriteup(slice, perModel);
  const writeupPath = join(__dirname, `results-${new Date().toISOString().split('T')[0]}.md`);
  await writeFile(writeupPath, writeup);
  console.log(`\nWriteup saved to ${writeupPath}`);
  console.log(`Raw runs in ${runDir}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
