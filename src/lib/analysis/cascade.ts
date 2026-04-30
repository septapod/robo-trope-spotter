/**
 * Energy Meter cascade orchestrator.
 *
 * Selects the right pipeline tier given the current daily budget and runs it.
 * Returns detections + the tier that produced them so the API response and
 * UI can communicate honestly about which mode was used.
 */

import { analyzeWithLlm, analyzeWithSonnetOnly } from './llm-engine';
import { analyzeHeuristic } from './heuristic-engine';
import { allTropes } from '@/lib/tropes/registry';
import { selectTier, recordSpend, TIER_FALLBACK_COST_USD, type Tier } from './budget';
import type { LlmDetection, LlmResult } from './types';

const TROPE_TIER_MAP = new Map(allTropes.map(t => [t.id, t.tier]));
const TROPE_NAME_MAP = new Map(allTropes.map(t => [t.id, t.name]));
const TROPE_DESC_MAP = new Map(allTropes.map(t => [t.id, t.description]));

export interface CascadeResult {
  tier: Tier;
  detections: LlmDetection[];
  processingTimeMs: number;
  /** True when the cascade returned no analysis because the cap was exhausted. */
  napping: boolean;
}

/**
 * Convert heuristic regex matches into the LlmDetection shape so the UI
 * renders the water-tier output the same as the higher-tier output.
 *
 * Heuristic matches are aggregated by tropeId — we count occurrences and
 * keep the first 3 matched excerpts per trope. Confidence is fixed at 0.7
 * (heuristic has no probabilistic signal, only presence).
 */
function heuristicToDetections(text: string): LlmDetection[] {
  const heuristicResult = analyzeHeuristic(text);
  const grouped = new Map<string, { count: number; excerpts: string[] }>();

  for (const m of heuristicResult.matches) {
    const existing = grouped.get(m.tropeId);
    if (existing) {
      existing.count++;
      if (existing.excerpts.length < 3) {
        const ctx = extractContext(text, m.startIndex, m.endIndex);
        if (ctx) existing.excerpts.push(ctx);
      }
    } else {
      const ctx = extractContext(text, m.startIndex, m.endIndex);
      grouped.set(m.tropeId, { count: 1, excerpts: ctx ? [ctx] : [] });
    }
  }

  const detections: LlmDetection[] = [];
  for (const [tropeId, agg] of grouped) {
    const tier = TROPE_TIER_MAP.get(tropeId);
    if (!tier) continue;
    const name = TROPE_NAME_MAP.get(tropeId) ?? tropeId;
    const desc = TROPE_DESC_MAP.get(tropeId) ?? '';
    detections.push({
      tropeId,
      tier,
      confidence: 0.7,
      count: agg.count,
      matchedExcerpts: agg.excerpts.length > 0 ? agg.excerpts : [name],
      explanation: `Found ${agg.count} instance${agg.count === 1 ? '' : 's'} via pattern match.`,
      suggestion: `Pattern-only mode is running today. Description: ${desc}`,
    });
  }

  // Em dash needs the same treatment the LLM pipeline applies — count is
  // authoritative from regex even in higher tiers.
  const emDashCount = (text.match(/—/g) || []).length;
  if (emDashCount > 0) {
    const exampleSentence = text.split(/[.!?]/).find(s => s.includes('—'))?.trim() ?? text.slice(0, 80);
    const existing = detections.findIndex(d => d.tropeId === 'em-dash-addiction');
    const conf = emDashCount === 1 ? 0.5 : emDashCount <= 3 ? 0.65 : emDashCount <= 6 ? 0.85 : 1.0;
    const detection: LlmDetection = {
      tropeId: 'em-dash-addiction',
      tier: emDashCount <= 2 ? 2 : 1,
      confidence: conf,
      count: emDashCount,
      matchedExcerpts: [exampleSentence.slice(0, 120)],
      explanation: `Found ${emDashCount} em dash${emDashCount === 1 ? '' : 'es'}.`,
      suggestion: 'Try a period or comma. The sentence usually works without the aside.',
    };
    if (existing >= 0) detections[existing] = detection;
    else detections.push(detection);
  }

  return detections;
}

function extractContext(text: string, start: number, end: number): string | null {
  if (start < 0 || end > text.length) return null;
  const ctxStart = Math.max(0, start - 30);
  const ctxEnd = Math.min(text.length, end + 30);
  let snippet = text.slice(ctxStart, ctxEnd).replace(/\s+/g, ' ').trim();
  if (snippet.length > 120) snippet = snippet.slice(0, 117) + '...';
  return snippet || null;
}

/**
 * Run the cascade: pick a tier, run it, record actual spend, return result.
 *
 * The tier is decided BEFORE the call (based on current spend). If the call
 * fails or returns short, the tier reflects what was attempted, not what
 * succeeded.
 */
export async function runCascade(text: string): Promise<CascadeResult> {
  const start = performance.now();
  const tier = selectTier();

  if (tier === 'napping') {
    return {
      tier,
      detections: [],
      processingTimeMs: 0,
      napping: true,
    };
  }

  if (tier === 'water') {
    const detections = heuristicToDetections(text);
    return {
      tier,
      detections,
      processingTimeMs: Math.round(performance.now() - start),
      napping: false,
    };
  }

  let llm: LlmResult;
  try {
    llm = tier === 'tea'
      ? await analyzeWithSonnetOnly(text)
      : await analyzeWithLlm(text);
  } catch (err) {
    // Spend is partial at best. Record fallback so a runaway error path
    // doesn't drain the budget without registering anything.
    recordSpend(TIER_FALLBACK_COST_USD[tier] / 2);
    throw err;
  }

  recordSpend(TIER_FALLBACK_COST_USD[tier]);
  return {
    tier,
    detections: llm.detections,
    processingTimeMs: llm.processingTimeMs,
    napping: false,
  };
}
