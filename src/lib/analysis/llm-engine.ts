import Anthropic from '@anthropic-ai/sdk';
import { LlmDetection, LlmResult } from './types';
import { SEMANTIC_ANALYSIS_SYSTEM_PROMPT, buildUserPrompt } from './prompts';

const VALID_TROPE_IDS = new Set([
  // Tier 4
  'consensus-middle',
  'uniform-length',
  'missing-specifics',
  'treadmill-effect',
  'third-person-detachment',
  'serves-as-dodge',
  'importance-adverbs',
  'uniform-tone',
  // Tier 5
  'low-perplexity',
  'low-burstiness',
  'perfect-grammar',
  'style-consistency',
  'hollow-sensory',
]);

const TROPE_TIER: Record<string, 4 | 5> = {
  'consensus-middle': 4,
  'uniform-length': 4,
  'missing-specifics': 4,
  'treadmill-effect': 4,
  'third-person-detachment': 4,
  'serves-as-dodge': 4,
  'importance-adverbs': 4,
  'uniform-tone': 4,
  'low-perplexity': 5,
  'low-burstiness': 5,
  'perfect-grammar': 5,
  'style-consistency': 5,
  'hollow-sensory': 5,
};

const TIMEOUT_MS = 15_000;
const MODEL = 'claude-sonnet-4-5-20250514';

function createClient(): Anthropic {
  return new Anthropic();
}

/**
 * Validates and sanitizes a single detection from the LLM response.
 * Returns null if the detection is invalid.
 */
function validateDetection(raw: unknown): LlmDetection | null {
  if (typeof raw !== 'object' || raw === null) return null;

  const obj = raw as Record<string, unknown>;

  const tropeId = typeof obj.tropeId === 'string' ? obj.tropeId : null;
  if (!tropeId || !VALID_TROPE_IDS.has(tropeId)) return null;

  const confidence = typeof obj.confidence === 'number' ? obj.confidence : NaN;
  if (isNaN(confidence) || confidence < 0.6 || confidence > 1) return null;

  const matchedExcerpts = Array.isArray(obj.matchedExcerpts)
    ? obj.matchedExcerpts.filter((e): e is string => typeof e === 'string').slice(0, 3)
    : [];
  if (matchedExcerpts.length === 0) return null;

  const explanation = typeof obj.explanation === 'string' ? obj.explanation : '';
  if (!explanation) return null;

  return {
    tropeId,
    tier: TROPE_TIER[tropeId],
    confidence: Math.round(confidence * 100) / 100,
    matchedExcerpts,
    explanation,
  };
}

/**
 * Parses the LLM text response into validated detections.
 */
function parseResponse(text: string): LlmDetection[] {
  // Strip markdown fences if the model wraps them anyway.
  const cleaned = text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error('[llm-engine] Failed to parse LLM response as JSON:', cleaned.slice(0, 200));
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
 * Runs semantic analysis on the provided text using Claude.
 * Returns detected Tier 4-5 tropes with confidence scores and evidence.
 *
 * Designed to fail gracefully: API errors, timeouts, and malformed responses
 * all result in an empty detections array rather than thrown exceptions.
 */
export async function analyzeSemantic(text: string): Promise<LlmResult> {
  const start = performance.now();

  if (!text || text.trim().length < 50) {
    return { detections: [], processingTimeMs: 0 };
  }

  try {
    const client = createClient();

    const response = await Promise.race([
      client.messages.create({
        model: MODEL,
        max_tokens: 2048,
        system: SEMANTIC_ANALYSIS_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildUserPrompt(text) }],
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('LLM request timed out')), TIMEOUT_MS)
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
    console.error('[llm-engine] Semantic analysis failed:', error instanceof Error ? error.message : error);
    return { detections: [], processingTimeMs: elapsed };
  }
}
