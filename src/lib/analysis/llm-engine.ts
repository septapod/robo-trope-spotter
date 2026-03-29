import Anthropic from '@anthropic-ai/sdk';
import { LlmDetection, LlmResult } from './types';
import { ANALYSIS_SYSTEM_PROMPT, buildUserPrompt } from './prompts';
import { allTropes } from '@/lib/tropes/registry';
import type { Tier } from '@/lib/tropes/types';

// Build the set of valid trope IDs from the registry
const VALID_TROPE_IDS = new Set(allTropes.map(t => t.id));
const TROPE_TIER_MAP = new Map(allTropes.map(t => [t.id, t.tier]));

const TIMEOUT_MS = 30_000; // 30s for full analysis
const MODEL = 'claude-sonnet-4-6';

function createClient(): Anthropic {
  return new Anthropic();
}

/**
 * Validates a single detection from the LLM response.
 */
function validateDetection(raw: unknown): LlmDetection | null {
  if (typeof raw !== 'object' || raw === null) return null;

  const obj = raw as Record<string, unknown>;

  const tropeId = typeof obj.tropeId === 'string' ? obj.tropeId : null;
  if (!tropeId || !VALID_TROPE_IDS.has(tropeId)) return null;

  const confidence = typeof obj.confidence === 'number' ? obj.confidence : NaN;
  if (isNaN(confidence) || confidence < 0.2 || confidence > 1) return null;

  const count = typeof obj.count === 'number' && obj.count >= 1
    ? Math.round(obj.count)
    : 1;

  const matchedExcerpts = Array.isArray(obj.matchedExcerpts)
    ? obj.matchedExcerpts.filter((e): e is string => typeof e === 'string').slice(0, 3)
    : [];
  if (matchedExcerpts.length === 0) return null;

  const explanation = typeof obj.explanation === 'string' ? obj.explanation : '';
  if (!explanation) return null;

  const tier = TROPE_TIER_MAP.get(tropeId) ?? (typeof obj.tier === 'number' ? obj.tier as Tier : 3);

  return {
    tropeId,
    tier,
    confidence: Math.round(confidence * 100) / 100,
    matchedExcerpts,
    explanation,
    count,
  };
}

/**
 * Parses the LLM text response into validated detections.
 */
function parseResponse(text: string): LlmDetection[] {
  // Strip markdown fences if present
  let cleaned = text.trim();

  // Find the JSON array in the response
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    cleaned = cleaned.slice(firstBracket, lastBracket + 1);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error('[llm-engine] Failed to parse LLM response as JSON:', cleaned.slice(0, 300));
    return [];
  }

  if (!Array.isArray(parsed)) {
    console.error('[llm-engine] LLM response is not an array');
    return [];
  }

  const detections: LlmDetection[] = [];
  for (const item of parsed) {
    const valid = validateDetection(item);
    if (valid) detections.push(valid);
  }

  return detections;
}

/**
 * Runs full trope analysis on the provided text using Claude.
 * This is the PRIMARY analysis engine. It covers all 5 tiers.
 *
 * Falls back gracefully: API errors, timeouts, and malformed responses
 * all result in an empty detections array.
 */
export async function analyzeWithLlm(text: string): Promise<LlmResult> {
  const start = performance.now();

  if (!text || text.trim().length < 30) {
    return { detections: [], processingTimeMs: 0 };
  }

  try {
    const client = createClient();

    const response = await Promise.race([
      client.messages.create({
        model: MODEL,
        max_tokens: 4096,
        system: ANALYSIS_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildUserPrompt(text) }],
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Analysis timed out')), TIMEOUT_MS)
      ),
    ]);

    const content = response.content[0];
    if (content.type !== 'text') {
      console.error('[llm-engine] Unexpected content type:', content.type);
      return { detections: [], processingTimeMs: performance.now() - start };
    }

    const detections = parseResponse(content.text);

    return {
      detections,
      processingTimeMs: Math.round(performance.now() - start),
    };
  } catch (error) {
    const elapsed = Math.round(performance.now() - start);
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[llm-engine] Analysis failed:', msg);
    // Re-throw so the API route can surface the error to the user
    throw new Error(`LLM analysis failed: ${msg}`);
  }
}

// Keep backward-compatible export name
export const analyzeSemantic = analyzeWithLlm;
