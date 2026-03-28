---
date: 2026-03-28
topic: mvp-report-card
---

# Robo Trope Spotter: MVP Requirements

## Problem Frame

Public writing (LinkedIn, blogs, newsletters) is increasingly flooded with unedited AI output that uses the same predictable patterns: em dash addiction, "delve," "it's not X it's Y," hedge stacking, rhetorical question openers, sycophantic framing. People notice this but have no tool to name the specific patterns, see them concretely, and share the diagnosis. Existing AI detectors give binary yes/no authorship judgments. Nothing produces a shareable, playful, pattern-level report card.

The target user is anyone who encounters obviously AI-shaped writing and wants to (a) see exactly what makes it feel robotic, and (b) send the diagnosis to someone with a "you might want to do another editing pass" vibe.

This is a social diagnostic tool. Think personality quiz meets gentle roast. Not a writing assistant, not an AI detector.

## Requirements

**Input**
- R1. Accept text via paste into a large text area on the landing page. The landing page IS the input. No signup, no explainer wall.
- R2. Accept a URL. Auto-fetch page content, strip navigation/footer/boilerplate, analyze the body text.
- R3. Accept a screenshot (drag-drop or file upload). OCR the image to extract text, then analyze.
- R4. Ghost text in the text area should set the tone (e.g., "paste something suspicious...").

**Detection Engine**
- R5. Heuristic-first: detect lexical/structural tropes (Tiers 1-3) using regex and pattern matching. These should return results instantly (sub-second).
- R6. LLM-powered: detect semantic tropes (Tiers 4-5) using an LLM call with the taxonomy as context. These include: sentence length uniformity, missing specific details, treadmill effect, uniform tone, emotion without feeling, no subtext.
- R7. Cover the full 5-tier taxonomy (~40 patterns) at launch.
- R8. For each detected trope: record the trope ID, tier, count of occurrences, and the specific text spans (quotes) where it appears.

**Scoring**
- R9. Weighted composite score: each trope instance is weighted by its tier severity (Tier 1 highest weight, Tier 5 lowest). The total produces a single numeric score.
- R10. Per-trope color coding: each listed trope is color-coded based on its tier and frequency. More occurrences + higher tier = more intense color (toward red). Low frequency + lower tier = cooler/milder color.
- R11. Top-level score maps to a named label (e.g., "Clean," "Light Touches," "Needs Another Pass," "Full Robot Mode," "Unedited AI Output"). These labels are playful, not clinical.
- R12. Document the rationale for each scoring threshold (why does "Clean" end at X?).

**Report Card Page**
- R13. Each analysis produces a unique URL (e.g., robotropespotter.com/report/abc123). No login required to view.
- R14. Above the fold: the top-level score (number + named label + color), a one-line roast/summary tailored to the trope profile, and the trope DNA strip.
- R15. Below the fold: individual trope cards showing trope name, tier badge, one-line plain-English explanation, count, and quoted examples from the analyzed text with the offending phrase highlighted.
- R16. Show up to 5 "top offenders" prominently. Remaining tropes accessible via "See all N detections" expandable section.
- R17. Clean-scoring text gets its own fun treatment ("Suspiciously Human," "Certified Organic," or similar). No dead-end results.
- R18. A "Copy link" and "Share" button for easy forwarding. The share action should feel like one click.

**Trope DNA Strip**
- R19. A compact horizontal visualization (barcode-style) where each detected trope is a thin vertical band, color-coded by tier, width proportional to frequency. Every analysis produces a unique visual pattern.
- R20. The DNA strip appears in both the report card page and the OG share image.

**OG Share Image**
- R21. Auto-generate a designed Open Graph image (1200x630) for each report. Shows: the numeric score with named label, the roast line, and the DNA strip. This renders as the preview when the report URL is shared in Slack, iMessage, LinkedIn, Twitter, etc.
- R22. The OG image must look designed, not like a data dump. It should make someone curious enough to click through.

**Voice and Tone**
- R23. One calibrated voice throughout: playful, specific, friend-calling-you-out energy. Sharp enough to be fun, warm enough to forward to the author without it feeling like an attack.
- R24. All copy grades the WRITING, never assumes the person who pasted it is the writer. Observational language: "This text contains..." not "You used..."
- R25. No em dashes in any output. No AI writing tropes in any output. The report card must pass its own test.
- R26. Trope descriptions and roast lines should be pre-written components assembled per-scan, not LLM-generated per-scan.

**Persistence**
- R27. Reports persist at their unique URLs long enough to be useful for sharing (minimum 30 days). The analyzed text does not need to be stored if the analysis results are sufficient.

## Success Criteria

- A user can paste Danny's LinkedIn post, get a report card, and text Danny the URL within 60 seconds of landing on the site
- The OG image preview in iMessage/Slack is legible, fun, and makes the recipient want to click
- Pasting the report card's own copy back into the tool produces a clean or near-clean score (the irony test)
- The product feels visually designed and playful, not like a developer tool or a clinical detector

## Scope Boundaries

- No user accounts, no login, no persistent user profiles (v2)
- No persona/archetype typing (v2, requires creative writing work)
- No diplomatic forwarding mode / tone toggle (single calibrated voice instead)
- No browser extension (v2 distribution channel)
- No longitudinal tracking or "voice drift" analysis (v2)
- No batch/API mode (v3)
- No team scorecards (v3)
- No before/after rewrite suggestions (different product)
- No non-English support (v2+)
- English-language web content is the launch use case (primarily LinkedIn, blogs, newsletters)

## Key Decisions

- **Social diagnostic, not writing tool**: The product helps people see and share what makes writing feel robotic. It does not help them fix it in real-time. That's Grammarly's territory.
- **Heuristic + LLM hybrid**: Regex for speed on lexical patterns, LLM for depth on semantic patterns. Avoids full LLM cost per scan while catching the hard-to-detect stuff.
- **Full taxonomy at launch**: All 5 tiers, ~40 patterns. The richness of the taxonomy is a differentiator vs. Un-AI-ify's 7 categories.
- **Personas deferred**: The archetype/personality engine is the highest-leverage v2 feature but requires significant creative writing. Ship the core analysis first.
- **Pre-written copy components**: Trope descriptions, roast lines, and labels are authored in advance and assembled per scan. This avoids the irony of using AI to write the report card and keeps the voice controlled.
- **All three input types at launch**: Text paste, URL, and screenshot/OCR. Covers the full discovery-to-diagnosis flow.

## Dependencies / Assumptions

- OCR for screenshot input will use an existing service (e.g., Tesseract, Google Vision API, or browser-native)
- URL content extraction will need a scraping/parsing approach that handles LinkedIn, Substack, Medium, WordPress, and general HTML
- OG image generation will need a server-side rendering approach (Vercel OG, Satori, Puppeteer, or similar)
- The trope taxonomy document (the detailed 5-tier report card Brent drafted) serves as the source of truth for pattern definitions

## Outstanding Questions

### Deferred to Planning
- [Affects R5, R6][Technical] What's the right tech stack? (Next.js on Vercel is the likely candidate given Brent's other projects)
- [Affects R5][Needs research] Which regex patterns already exist in tropes.fyi or stop-slop that could be reused vs. built from scratch?
- [Affects R21][Technical] Best approach for OG image generation (Vercel OG/Satori vs. Puppeteer vs. canvas-based)?
- [Affects R27][Technical] Persistence layer for reports (database vs. KV store vs. file-based)?
- [Affects R3][Needs research] Best OCR approach for screenshot input (Tesseract, Google Vision API, browser-native, or LLM vision)?
- [Affects R2][Technical] URL content extraction approach (Readability.js, custom scraper, or LLM-based extraction)?
- [Affects R9, R12][Technical] Specific tier weights and score thresholds (needs calibration against real texts)

## Next Steps

All product decisions resolved. Ready for `/ce:plan` for structured implementation planning.
