# Robo Trope Spotter

**Status:** MVP code complete, all 9 units built, needs Neon DB + Vercel deploy

## What It Is
A social diagnostic tool that identifies AI writing tropes in pasted text and produces a shareable, playful report card. Think personality quiz meets gentle roast. Not an AI detector, not a writing assistant.

## What's Done
- [x] GitHub repo created (septapod/robo-trope-spotter)
- [x] 5-tier, 40-pattern trope taxonomy drafted
- [x] Competitive research (Un-AI-ify, tropes.fyi, SlopDetector.org, GPTZero, etc.)
- [x] Ideation: 8 ranked product ideas, 24 rejected with reasons
- [x] Confirmed gap: no existing tool combines named-pattern taxonomy + shareable social object
- [x] MVP requirements doc: docs/brainstorms/2026-03-28-mvp-requirements.md
- [x] Implementation plan: docs/plans/2026-03-28-001-feat-mvp-report-card-plan.md

## What's Next
- [ ] End-to-end test with DATABASE_URL set
- [ ] Deploy to Vercel

## Recently Completed
- [x] Unit 9: Landing page polish (three input modes, loading states, error handling, screenshot drag/drop with preview, auto-collapse logic, client-side POST to /api/analyze with redirect)
- [x] Unit 7: Report card page (ScoreHero, DnaStrip, TropeCard, TopOffenders, AllDetections, ShareBar, roast lines, clean-score copy)
- [x] Unit 8: OG image generation (1200x630 PNG via next/og, score + label + DNA strip, Inter font, fallback for missing reports)
- [x] Unit 6: API route + input handlers (URL extractor, screenshot OCR, normalize, POST /api/analyze with background LLM update)
- [x] Unit 5: Scoring engine (composite scores, tier-based color coding, 6 named labels, DNA strip bands)
- [x] Unit 3: Heuristic detection engine (regex + wordList matching, cloned regexes, character offsets, timing)
- [x] Unit 2: Trope taxonomy data model (42 tropes across 5 tiers, typed definitions, registry with lookup functions)
- [x] Unit 4: LLM semantic analysis engine (Claude API integration for Tier 4-5 trope detection)

## Key Decisions
- Social diagnostic, not writing tool (no Grammarly territory)
- Heuristic-first detection (regex for lexical, LLM for semantic patterns)
- Full 40-pattern taxonomy at launch, all 5 tiers
- All three input types: text paste, URL, screenshot/OCR
- Weighted composite score with per-trope color coding
- One calibrated voice (playful but forwardable, no tone toggle)
- Personas/archetypes deferred to v2
- Shareable report cards with unique URLs and OG image previews
- Pre-written copy components, never LLM-generated per-scan
