# Robo Trope Spotter

**Status:** Implementation plan complete, ready to build

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
- [ ] Build v1 (9 implementation units)

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
