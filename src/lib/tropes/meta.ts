import type { Category, Reliability } from './types';

/**
 * Authoritative category + reliability for every trope id (existing + extended).
 *
 * This is the single source of truth for the 2026 rebuild's two new dimensions.
 * It deliberately lives apart from the tier files so we can re-weight the whole
 * taxonomy without editing 60 object literals.
 *
 * RELIABILITY is the heart of the precision fix. The old scoring weighted by
 * tier, which put em-dash and "delve" (lexical, weight 5) ABOVE burstiness and
 * missing-specifics (structural/substance, weight 1) — exactly backwards from
 * every detection study (Liang 2023; RAID 2024; Weber-Wulff 2023). We now weight
 * by how hard a tell is to fake or false-positive on.
 */

export interface TropeMeta {
  category: Category;
  reliability: Reliability;
}

export const RELIABILITY_WEIGHT: Record<Reliability, number> = {
  conclusive: 6, // leaked model markup — essentially proof
  high: 3, // structural/substance — hard to fake, low false-positive risk
  medium: 1.6, // rhetorical/syntactic — suggestive in clusters
  low: 0.7, // lexical/formatting — heavy legitimate human use
};

export const TROPE_META: Record<string, TropeMeta> = {
  // ---- Tier 1 (existing) ----
  'not-x-its-y': { category: 'syntactic', reliability: 'medium' },
  'em-dash-addiction': { category: 'formatting', reliability: 'low' },
  'vocab-hall-of-shame': { category: 'lexical', reliability: 'low' },
  'leftover-artifacts': { category: 'formatting', reliability: 'conclusive' },
  'fabricated-citations': { category: 'substance', reliability: 'medium' },
  'sycophantic-opener': { category: 'rhetorical', reliability: 'high' },

  // ---- Tier 2 (existing) ----
  'fast-paced-world': { category: 'rhetorical', reliability: 'medium' },
  'ornate-metaphors': { category: 'lexical', reliability: 'low' },
  'rhetorical-self-answer': { category: 'rhetorical', reliability: 'medium' },
  'not-only-but-also': { category: 'syntactic', reliability: 'medium' },
  'false-suspense': { category: 'rhetorical', reliability: 'medium' },
  'formulaic-conclusion': { category: 'rhetorical', reliability: 'medium' },
  'excessive-hedging': { category: 'substance', reliability: 'medium' },
  'verdict-language': { category: 'rhetorical', reliability: 'medium' },
  'breathless-enthusiasm': { category: 'lexical', reliability: 'low' },

  // ---- Tier 3 (existing) ----
  'formal-transitions': { category: 'lexical', reliability: 'low' },
  'ai-vocab-cluster': { category: 'lexical', reliability: 'low' },
  'listicle-bullets': { category: 'formatting', reliability: 'medium' },
  'punchy-fragments': { category: 'syntactic', reliability: 'low' },
  'hollow-signaling': { category: 'lexical', reliability: 'low' },
  'stakes-inflation': { category: 'rhetorical', reliability: 'medium' },
  'participial-overuse': { category: 'syntactic', reliability: 'medium' },
  'from-x-to-y': { category: 'syntactic', reliability: 'low' },
  'triplet-framing': { category: 'syntactic', reliability: 'low' },
  'anaphora-abuse': { category: 'syntactic', reliability: 'medium' },
  'equivocation-seesaw': { category: 'substance', reliability: 'medium' },
  'latinate-vocab': { category: 'lexical', reliability: 'low' },
  'dramatic-countdown': { category: 'syntactic', reliability: 'low' },
  'colon-preface': { category: 'rhetorical', reliability: 'low' },
  'elegant-variation': { category: 'substance', reliability: 'medium' },
  'despite-challenges-pivot': { category: 'structural', reliability: 'high' },

  // ---- Tier 4 (existing) ----
  'consensus-middle': { category: 'lexical', reliability: 'medium' },
  'uniform-length': { category: 'structural', reliability: 'high' },
  'missing-specifics': { category: 'substance', reliability: 'high' },
  'treadmill-effect': { category: 'substance', reliability: 'high' },
  'third-person-detachment': { category: 'rhetorical', reliability: 'medium' },
  'serves-as-dodge': { category: 'syntactic', reliability: 'low' },
  'importance-adverbs': { category: 'lexical', reliability: 'low' },
  'uniform-tone': { category: 'structural', reliability: 'high' },

  // ---- Tier 5 (existing) ----
  'low-perplexity': { category: 'structural', reliability: 'medium' },
  'low-burstiness': { category: 'structural', reliability: 'high' },
  'perfect-grammar': { category: 'structural', reliability: 'low' },
  'style-consistency': { category: 'structural', reliability: 'medium' },
  'hollow-sensory': { category: 'substance', reliability: 'medium' },

  // ---- Extended (2026 rebuild) ----
  'leaked-markup': { category: 'formatting', reliability: 'conclusive' },
  'significance-verbs': { category: 'lexical', reliability: 'low' },
  'container-nouns': { category: 'lexical', reliability: 'low' },
  'journey-verbs': { category: 'lexical', reliability: 'low' },
  'travel-brochure': { category: 'lexical', reliability: 'low' },
  'testament-collocation': { category: 'lexical', reliability: 'low' },
  'emoji-bullets': { category: 'formatting', reliability: 'medium' },
  'title-case-headers': { category: 'formatting', reliability: 'low' },
  'excessive-bolding': { category: 'formatting', reliability: 'low' },
  'vague-universal-opener': { category: 'rhetorical', reliability: 'medium' },
  'false-vulnerability': { category: 'rhetorical', reliability: 'low' },
  'scaffold-opener': { category: 'rhetorical', reliability: 'medium' },
  'wh-cleft': { category: 'syntactic', reliability: 'medium' },
  'fronted-clause-default': { category: 'syntactic', reliability: 'high' },
  'both-sides-balance': { category: 'substance', reliability: 'high' },
  'it-depends-nonanswer': { category: 'substance', reliability: 'high' },
  'restating-the-prompt': { category: 'substance', reliability: 'high' },
  'circular-padding': { category: 'substance', reliability: 'medium' },
  'abstract-noun-subject': { category: 'syntactic', reliability: 'medium' },
  'imperative-cta-close': { category: 'rhetorical', reliability: 'low' },
};

const FALLBACK: TropeMeta = { category: 'lexical', reliability: 'low' };

export function metaFor(tropeId: string): TropeMeta {
  return TROPE_META[tropeId] ?? FALLBACK;
}

export function reliabilityWeight(tropeId: string): number {
  return RELIABILITY_WEIGHT[metaFor(tropeId).reliability];
}

export function categoryFor(tropeId: string): Category {
  return metaFor(tropeId).category;
}
