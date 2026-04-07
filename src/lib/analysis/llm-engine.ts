import Anthropic from '@anthropic-ai/sdk';
import { LlmDetection, LlmResult } from './types';
import { ANALYSIS_SYSTEM_PROMPT, buildUserPrompt } from './prompts';
import { allTropes } from '@/lib/tropes/registry';
import type { Tier } from '@/lib/tropes/types';

const VALID_TROPE_IDS = new Set(allTropes.map(t => t.id));
const TROPE_TIER_MAP = new Map(allTropes.map(t => [t.id, t.tier]));
const TROPE_NAME_MAP = new Map(allTropes.map(t => [t.id, t.name]));
const TROPE_DESC_MAP = new Map(allTropes.map(t => [t.id, t.description]));

const TIMEOUT_MS = 90_000;
const DETECTION_MODEL = 'claude-sonnet-4-6';
const VALIDATION_MODEL = 'claude-haiku-4-5-20251001';
const DISPLAY_CONFIDENCE_THRESHOLD = 0.5;

function createClient(): Anthropic {
  return new Anthropic();
}

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

  const suggestion = typeof obj.suggestion === 'string' ? obj.suggestion : '';

  const tier = TROPE_TIER_MAP.get(tropeId) ?? (typeof obj.tier === 'number' ? obj.tier as Tier : 3);

  return {
    tropeId,
    tier,
    confidence: Math.round(confidence * 100) / 100,
    matchedExcerpts,
    explanation,
    suggestion,
    count,
  };
}

function parseResponse(text: string): LlmDetection[] {
  let cleaned = text.trim();
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    cleaned = cleaned.slice(firstBracket, lastBracket + 1);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error('[llm-engine] Failed to parse JSON:', cleaned.slice(0, 300));
    return [];
  }

  if (!Array.isArray(parsed)) {
    console.error('[llm-engine] Response is not an array');
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
 * Haiku validation pass: reviews each detection and rejects false positives.
 */
async function validateWithHaiku(
  client: Anthropic,
  detections: LlmDetection[],
  sourceText: string
): Promise<LlmDetection[]> {
  if (detections.length === 0) return [];

  const validationPrompt = detections.map((d, i) => {
    const name = TROPE_NAME_MAP.get(d.tropeId) ?? d.tropeId;
    const definition = TROPE_DESC_MAP.get(d.tropeId) ?? '';
    return `Detection ${i + 1}:
Pattern: "${name}" (${d.tropeId})
Definition: ${definition}
Excerpt: "${d.matchedExcerpts[0]}"
Explanation: ${d.explanation}`;
  }).join('\n\n');

  const truncatedSource = sourceText.length > 4000
    ? sourceText.slice(0, 4000) + '\n[truncated]'
    : sourceText;

  try {
    const response = await Promise.race([
      client.messages.create({
        model: VALIDATION_MODEL,
        max_tokens: 1024,
        system: `You are a precision validator for an AI writing trope detector. Your job is to review each detection and determine if the excerpt GENUINELY exhibits the specific pattern described in the definition.

For each detection, respond with ONLY "VALID" or "REJECT" followed by a brief reason.

Be strict about FALSE POSITIVES but do not reject valid detections. Common false positives to watch for:
- A normal sentence flagged as "listicle-bullets" (requires actual formatted lists, not prose with commas)
- A naturally short sentence flagged as "punchy-fragments" (requires manufactured staccato emphasis)
- A comma-separated list flagged as "from-x-to-y" (requires literal "from X to Y" range construction)
- Normal concluding sentences flagged as "verdict-language" (requires grand pronouncements)
- A colon introducing a list flagged as "colon-preface" (requires unnecessary setup phrase before the colon)
- Text that DISCUSSES a pattern being flagged as USING the pattern

IMPORTANT: Do NOT reject a detection just because the same passage was also flagged for a different pattern. Multiple patterns CAN apply to the same text. Do NOT reject em-dash-addiction at any count. Reject only when the excerpt does not match the pattern definition.`,
        messages: [{
          role: 'user',
          content: `Source text:\n---\n${truncatedSource}\n---\n\nDetections to validate:\n\n${validationPrompt}\n\nFor each detection (1 through ${detections.length}), respond with "Detection N: VALID" or "Detection N: REJECT - reason". One per line.`
        }],
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Validation timed out')), 30_000)
      ),
    ]);

    const content = response.content[0];
    if (content.type !== 'text') return detections;

    const lines = content.text.split('\n').filter(l => l.trim());
    const validated: LlmDetection[] = [];

    for (let i = 0; i < detections.length; i++) {
      const line = lines.find(l => l.includes(`Detection ${i + 1}`));
      if (line && line.includes('VALID')) {
        validated.push(detections[i]);
      } else {
        console.log(`[validator] Rejected: ${detections[i].tropeId} - ${line}`);
      }
    }

    return validated;
  } catch (error) {
    console.error('[validator] Validation failed, keeping all detections:', error instanceof Error ? error.message : error);
    return detections; // If validation fails, keep all detections rather than losing them
  }
}

/**
 * Two-pass analysis pipeline:
 * 1. Sonnet detects patterns
 * 2. Haiku validates each detection (rejects false positives)
 * 3. Confidence threshold filters remaining detections
 */
export async function analyzeWithLlm(text: string): Promise<LlmResult> {
  const start = performance.now();

  if (!text || text.trim().length < 30) {
    return { detections: [], processingTimeMs: 0 };
  }

  try {
    const client = createClient();

    // Pass 1: Sonnet detection
    const response = await Promise.race([
      client.messages.create({
        model: DETECTION_MODEL,
        max_tokens: 4096,
        system: ANALYSIS_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildUserPrompt(text) }],
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Analysis took too long. Try shorter text or try again.')), TIMEOUT_MS)
      ),
    ]);

    const content = response.content[0];
    if (content.type !== 'text') {
      return { detections: [], processingTimeMs: performance.now() - start };
    }

    let detections = parseResponse(content.text);
    console.log(`[llm-engine] Sonnet found ${detections.length} detections`);

    // Pass 2: Haiku validation (before em dash injection — Haiku can't reject regex-guaranteed detection)
    detections = await validateWithHaiku(client, detections, text);
    console.log(`[llm-engine] After Haiku validation: ${detections.length} detections`);

    // Guaranteed em dash correction — runs AFTER Haiku so count is always accurate
    // Regex is 100% reliable; LLM count is not. Always override count and confidence.
    const emDashCount = (text.match(/\u2014/g) || []).length;
    if (emDashCount > 0) {
      const confidence = emDashCount === 1 ? 0.5 : emDashCount <= 3 ? 0.65 : emDashCount <= 6 ? 0.85 : 1.0;
      const exampleSentence = text.split(/[.!?]/).find(s => s.includes('\u2014'))?.trim() ?? text.slice(0, 80);
      const existingIdx = detections.findIndex(d => d.tropeId === 'em-dash-addiction');
      const emDashDetection: LlmDetection = {
        tropeId: 'em-dash-addiction',
        tier: 1,
        confidence,
        count: emDashCount,
        matchedExcerpts: [exampleSentence.slice(0, 120)],
        explanation: `Found ${emDashCount} em dash${emDashCount === 1 ? '' : 'es'}. ${emDashCount === 1 ? 'Even one is worth noting.' : emDashCount <= 3 ? 'A noticeable pattern.' : 'Heavy usage.'}`,
        suggestion: 'Try a period or comma instead. The sentence usually works without the aside.',
      };
      if (existingIdx >= 0) {
        const oldCount = detections[existingIdx].count;
        detections[existingIdx] = emDashDetection; // correct LLM's count
        console.log(`[llm-engine] Corrected em-dash count to ${emDashCount} (LLM had ${oldCount})`);
      } else {
        detections.push(emDashDetection);
        console.log(`[llm-engine] Added guaranteed em-dash detection (count: ${emDashCount})`);
      }
    } else {
      // No real em dashes — remove any hallucinated detection
      detections = detections.filter(d => d.tropeId !== 'em-dash-addiction');
    }

    // Pass 3: Confidence threshold
    detections = detections.filter(d => d.confidence >= DISPLAY_CONFIDENCE_THRESHOLD);
    console.log(`[llm-engine] After confidence filter (>=${DISPLAY_CONFIDENCE_THRESHOLD}): ${detections.length} detections`);

    return {
      detections,
      processingTimeMs: Math.round(performance.now() - start),
    };
  } catch (error) {
    const elapsed = Math.round(performance.now() - start);
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[llm-engine] Analysis failed:', msg);
    throw new Error(`LLM analysis failed: ${msg}`);
  }
}

export const analyzeSemantic = analyzeWithLlm;
