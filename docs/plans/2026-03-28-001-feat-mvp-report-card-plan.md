---
title: "feat: Build Robo Trope Spotter MVP"
type: feat
status: active
date: 2026-03-28
origin: docs/brainstorms/2026-03-28-mvp-requirements.md
---

# feat: Build Robo Trope Spotter MVP

## Overview

Build a web app where users paste text (or a URL, or a screenshot), get an instant analysis of AI writing tropes, and receive a shareable report card at a unique URL with a designed OG image for social previews.

## Problem Frame

Public writing is flooded with unedited AI output. Existing AI detectors give binary yes/no judgments. Nothing identifies specific named patterns, shows them in context with quoted examples, and produces a shareable social object. (see origin: docs/brainstorms/2026-03-28-mvp-requirements.md)

## Requirements Trace

- R1-R4. Three input modes: text paste, URL, screenshot/OCR
- R5-R8. Heuristic-first detection for lexical patterns, LLM for semantic patterns, full 40-pattern taxonomy, with quoted text spans
- R9-R12. Weighted composite scoring with per-trope color coding and named labels
- R13-R18. Shareable report card at unique URL with top offenders, DNA strip, and clean-score treatment
- R19-R20. Trope DNA strip visualization
- R21-R22. Auto-generated OG image for social previews
- R23-R26. Calibrated voice, grades writing not writer, no em dashes, pre-written copy
- R27. Reports persist 30+ days

## Scope Boundaries

- No user accounts, login, or profiles
- No persona/archetype typing (v2)
- No browser extension, batch API, or team features
- No rewrite suggestions or before/after diffs
- No non-English support
- (see origin for full exclusion list)

## Context & Research

### Reusable Pattern Sources (All MIT Licensed or Openly Published)

- **LAID** (github.com/oldeucryptoboi/linkedin-ai-detector): 14 weighted signal analyzers in JavaScript with full word lists. Most technically complete heuristic engine. Includes burstiness (sentence length CV), em dash density, contraction rate, transition frequency, and abstraction buzzword ratio.
- **tropes.fyi**: 32 named tropes across 6 categories with downloadable tropes.md. Best taxonomy for naming and categorization.
- **stop-slop** (github.com/hardikpandya/stop-slop): ~60 phrase patterns and ~30 structural patterns with replacements. MIT licensed.
- **skill-deslop** (github.com/stephenturner/skill-deslop): Expanded fork of stop-slop with tropes.fyi catalog embedded.

### Cross-Tool Consensus (Strongest AI Tells)

These patterns appear in 3+ tools and should be highest priority for the heuristic engine:
1. Negative parallelism ("not X, it's Y") - 5/5 tools
2. Em dash overuse - 5/5 tools
3. Abstract buzzwords (delve, leverage, tapestry, landscape) - 4/5 tools
4. Filler transitions (moreover, furthermore, importantly) - 4/5 tools
5. Rule-of-three / tricolon abuse - 4/5 tools
6. Throat-clearing openers ("here's the thing", "let's dive in") - 4/5 tools
7. Sentence/paragraph length uniformity - quantified by LAID
8. Contraction avoidance - quantified by LAID
9. Bold-first bullets - 3/5 tools
10. Vague attributions ("experts say") - 3/5 tools

## Key Technical Decisions

- **Next.js 14+ on Vercel**: Matches Brent's existing stack (newsletter-curator, strategery-app, dxnos). App Router. Vercel Pro account available with 300s function timeout.
- **Tailwind v4 + shadcn/ui**: Consistent with other projects. Good for building the designed report card UI.
- **Heuristic engine as typed pattern registry**: Each trope is a self-documenting object with id, name, tier, regex/wordlist, description, and scoring weight. Patterns split by tier into separate files. Adapted from LAID's signal architecture and tropes.fyi's taxonomy.
- **Claude API for semantic analysis**: Tiers 4-5 (sentence length uniformity, missing specifics, treadmill effect, uniform tone) require understanding beyond regex. Send text + taxonomy context to Claude Sonnet. Run async after heuristic results render.
- **`@mozilla/readability` + `jsdom` for URL extraction**: Same algorithm as Firefox Reader View. Handles WordPress, Substack, Medium. LinkedIn will likely fail (login wall). Fallback: prompt user to paste text instead.
- **Claude Vision for screenshot OCR**: Already using the Anthropic API. Excellent accuracy on screenshots of text. One dependency instead of two.
- **`@vercel/og` (Satori) for OG images**: Built into Next.js, runs at the edge, generates PNG in ~50ms. Flexbox-only layout is sufficient for score + DNA strip + roast line.
- **Neon Postgres + Drizzle ORM for persistence**: Structured report data (scores, trope matches, metadata). Queryable. Drizzle is type-safe and already used in other projects.
- **Scoring model**: Each trope instance weighted by tier (Tier 1 = 5 points, Tier 2 = 3, Tier 3 = 2, Tier 4 = 1.5, Tier 5 = 1). Sum produces raw score. Named labels map to ranges. Thresholds calibrated by running the engine against known AI-heavy and human-written samples. Document rationale per threshold.

## Open Questions

### Resolved During Planning

- **Tech stack**: Next.js 14+, Tailwind v4, shadcn/ui, Drizzle, Neon, Vercel. Consistent with existing projects.
- **Pattern reuse**: Reference LAID word lists, tropes.fyi taxonomy, and stop-slop phrase catalogs. Adapt, don't copy wholesale.
- **OG image approach**: @vercel/og (Satori). Flexbox layout is sufficient for the report card preview.
- **OCR approach**: Claude Vision. Already using the Anthropic API.
- **URL extraction**: @mozilla/readability + jsdom. LinkedIn fallback: "LinkedIn blocks automated reading. Please paste the text directly."

### Deferred to Implementation

- Exact scoring thresholds and named label ranges (calibrate against real texts during Unit 6)
- Whether to pre-generate and cache OG images in Vercel Blob or generate on-the-fly (test performance first)
- Exact roast line templates (creative writing task during Unit 7)
- Which tropes from Brent's 40-pattern taxonomy map cleanly to regex vs. require LLM (audit during Unit 3)

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification.*

```
User Input (text / URL / screenshot)
        │
        ▼
  ┌─────────────────────┐
  │  Input Normalization │  URL → Readability extraction
  │                      │  Screenshot → Claude Vision OCR
  │                      │  Text → passthrough
  └──────────┬──────────┘
             │ plain text
             ▼
  ┌─────────────────────┐
  │  Heuristic Engine    │  Pattern registry (~30 regex/wordlist rules)
  │  (instant, client-   │  Returns: matches[] with spans, trope IDs, counts
  │   safe, no API cost) │
  └──────────┬──────────┘
             │
             ▼
  ┌─────────────────────┐
  │  LLM Semantic Layer  │  Claude Sonnet with taxonomy context
  │  (async, 1-3s)       │  Returns: Tier 4-5 detections
  └──────────┬──────────┘  (sentence uniformity, missing specifics,
             │              treadmill effect, emotion without feeling)
             ▼
  ┌─────────────────────┐
  │  Scoring Engine      │  Tier-weighted composite score
  │                      │  Per-trope color mapping
  │                      │  Named label assignment
  │                      │  Top 5 offenders selection
  │                      │  DNA strip data generation
  └──────────┬──────────┘
             │
       ┌─────┴─────┐
       ▼           ▼
  ┌────────┐  ┌──────────┐
  │ Report │  │ Persist  │
  │ Card   │  │ to Neon  │
  │ Page   │  │ (slug,   │
  │ (SSR)  │  │ results) │
  └────────┘  └──────────┘
       │
       ▼
  ┌─────────────────────┐
  │  OG Image Route      │  @vercel/og generates 1200x630 PNG
  │  /report/[slug]/     │  from stored report data
  │  opengraph-image     │
  └─────────────────────┘
```

## Implementation Units

- [ ] **Unit 1: Project Scaffold**

**Goal:** Set up the Next.js project with all dependencies, database schema, and basic landing page.

**Requirements:** R1 (landing page as input), R27 (persistence layer)

**Dependencies:** None

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `drizzle.config.ts`, `next.config.ts`
- Create: `src/app/layout.tsx`, `src/app/page.tsx` (landing page with text area)
- Create: `src/db/schema.ts` (reports table), `src/db/index.ts` (connection)
- Create: `src/lib/env.ts` (environment variable validation)
- Create: `.env.example`

**Approach:**
- `npx create-next-app@latest` with App Router, TypeScript, Tailwind, ESLint
- Add dependencies: `drizzle-orm`, `@neondatabase/serverless`, `@anthropic-ai/sdk`, `@mozilla/readability`, `jsdom`, `nanoid`
- Database schema: reports table with id (uuid), slug (text, unique), source_text (text), source_url (text, nullable), input_type (text), results (jsonb), created_at (timestamp)
- Landing page: large text area with ghost text ("paste something suspicious..."), URL input field below, screenshot drop zone. Submit button. No nav, no signup, no explainer.

**Patterns to follow:**
- Brent's existing Drizzle + Neon setup in dxnos and strategery-app

**Test scenarios:**
- Happy path: dev server starts, landing page renders with text area, URL field, and drop zone
- Happy path: database connection succeeds, reports table exists

**Verification:**
- `npm run dev` starts without errors
- `npm run db:push` creates the reports table in Neon
- Landing page loads at localhost:3000

---

- [ ] **Unit 2: Trope Taxonomy Data Model**

**Goal:** Define the full 40-pattern trope taxonomy as a typed data structure that the heuristic engine and report card UI both consume.

**Requirements:** R7 (full 5-tier taxonomy), R8 (trope ID, tier, count, text spans), R26 (pre-written descriptions)

**Dependencies:** Unit 1

**Files:**
- Create: `src/lib/tropes/types.ts` (TropeDefinition type, Tier enum, DetectionResult type)
- Create: `src/lib/tropes/tier1.ts` (instant credibility killers: ~6 tropes)
- Create: `src/lib/tropes/tier2.ts` (trust destroyers: ~9 tropes)
- Create: `src/lib/tropes/tier3.ts` (accumulation hazards: ~14 tropes)
- Create: `src/lib/tropes/tier4.ts` (gatekeeper signals: ~8 tropes, marked as LLM-required)
- Create: `src/lib/tropes/tier5.ts` (forensic tells: ~5 tropes, marked as LLM-required)
- Create: `src/lib/tropes/registry.ts` (combined registry, lookup by ID)
- Test: `src/lib/tropes/__tests__/registry.test.ts`

**Approach:**
- Each trope definition includes: id, name, tier, detectionType ('heuristic' | 'llm'), description (pre-written, human voice), scoringWeight, and for heuristic tropes: a regex pattern or word list.
- Reference Brent's 40-pattern taxonomy document as the source of truth for names, tiers, and descriptions.
- Reference tropes.fyi for taxonomy structure, LAID for regex patterns, stop-slop for phrase catalogs.
- Tier 4-5 tropes are defined in the registry with detectionType: 'llm' and no regex. The LLM analysis unit will use their definitions as prompt context.
- All description text must pass the irony test: no em dashes, no AI writing tropes.

**Test scenarios:**
- Happy path: registry exports all ~40 tropes, each with required fields
- Happy path: every trope has a unique ID
- Happy path: tier distribution matches taxonomy (Tier 1: ~6, Tier 2: ~9, Tier 3: ~14, Tier 4: ~8, Tier 5: ~5)
- Edge case: no trope description contains an em dash character
- Edge case: all heuristic tropes have a valid regex or word list
- Edge case: all LLM tropes have detectionType 'llm' and no regex

**Verification:**
- All tests pass
- Running the irony check (grep for em dashes) against trope description strings returns zero matches

---

- [ ] **Unit 3: Heuristic Detection Engine**

**Goal:** Build the regex/pattern-matching engine that detects Tier 1-3 tropes instantly and returns matches with text spans.

**Requirements:** R5 (heuristic detection, sub-second), R8 (trope ID, tier, count, text spans)

**Dependencies:** Unit 2

**Files:**
- Create: `src/lib/analysis/heuristic-engine.ts`
- Create: `src/lib/analysis/types.ts` (AnalysisMatch, HeuristicResult)
- Test: `src/lib/analysis/__tests__/heuristic-engine.test.ts`

**Approach:**
- Import all heuristic tropes from the registry.
- For each trope, execute its regex against the input text. Collect all matches with character offsets and matched text.
- Handle word list tropes by compiling to a single alternation regex at init time.
- Handle structural patterns (e.g., "not X, it's Y") with named capture groups.
- Return: array of AnalysisMatch objects (tropeId, tier, matchedText, startIndex, endIndex).
- Performance target: analyze 2,000 words in under 50ms.

**Patterns to follow:**
- LAID's signal analyzer architecture (each signal returns normalized 0-1 score)
- tropes.fyi's named pattern categories

**Test scenarios:**
- Happy path: text with 3 em dashes returns 3 matches for the em-dash trope with correct character offsets
- Happy path: text with "It's not a product, it's a movement" returns a match for negative-parallelism trope
- Happy path: text with "delve" and "landscape" returns matches for vocabulary-hall-of-shame trope
- Happy path: text with "In today's rapidly evolving digital landscape" returns a match for the fast-paced-world trope
- Happy path: text with "Here's the thing:" returns a match for the false-suspense trope
- Edge case: empty string returns zero matches
- Edge case: clean human-written text (no tropes) returns zero or near-zero matches
- Edge case: text with a single em dash returns one match (not over-counted)
- Edge case: case-insensitive matching ("DELVE" and "delve" both match)
- Edge case: overlapping patterns do not produce duplicate matches for the same text span
- Integration: analyzing a full LinkedIn post (~300 words) completes in under 50ms

**Verification:**
- All tests pass
- Performance benchmark shows sub-50ms for typical input lengths

---

- [ ] **Unit 4: LLM Semantic Analysis**

**Goal:** Build the Claude API integration that detects Tier 4-5 tropes requiring semantic understanding.

**Requirements:** R6 (LLM for semantic patterns), R7 (full taxonomy), R8 (quoted text spans)

**Dependencies:** Unit 2

**Files:**
- Create: `src/lib/analysis/llm-engine.ts`
- Create: `src/lib/analysis/prompts.ts` (system prompt with Tier 4-5 taxonomy context)
- Test: `src/lib/analysis/__tests__/llm-engine.test.ts`

**Approach:**
- Build a system prompt that includes all Tier 4-5 trope definitions from the registry and instructs Claude to identify which patterns appear, with quoted examples.
- Use structured output (tool use or JSON mode) to get back typed results: array of {tropeId, matchedExcerpts[], confidence}.
- Use Claude Sonnet for cost efficiency. The input is the full text + taxonomy context.
- This runs async. The heuristic results render immediately; LLM results append when ready.
- Handle API errors gracefully: if the LLM call fails, the report card still works with Tier 1-3 results only.

**Test scenarios:**
- Happy path: text with uniform sentence lengths returns a detection for the burstiness trope with example sentences
- Happy path: text with "various sectors" instead of named companies returns a detection for the missing-specifics trope
- Happy path: response parses into the expected typed structure
- Error path: API timeout returns empty LLM results without crashing
- Error path: malformed API response is handled gracefully

**Verification:**
- Tests pass (mock the API for unit tests)
- Manual test with a real AI-heavy text returns plausible Tier 4-5 detections

---

- [ ] **Unit 5: Scoring Engine**

**Goal:** Combine heuristic and LLM results into a weighted composite score with per-trope color coding and named labels.

**Requirements:** R9 (weighted composite), R10 (per-trope color coding), R11 (named labels), R12 (threshold rationale)

**Dependencies:** Units 3, 4

**Files:**
- Create: `src/lib/analysis/scoring.ts`
- Create: `src/lib/analysis/colors.ts` (tier + frequency to color mapping)
- Create: `src/lib/analysis/labels.ts` (score range to named label mapping with rationale comments)
- Test: `src/lib/analysis/__tests__/scoring.test.ts`

**Approach:**
- Scoring formula: each trope instance contributes its tier weight (Tier 1 = 5, Tier 2 = 3, Tier 3 = 2, Tier 4 = 1.5, Tier 5 = 1). Sum all instance weights for the raw score.
- Color mapping: map (tier, frequency) to a color on a green-to-red spectrum. Higher tier + more instances = more intense red.
- Named labels: "Clean" (0-5), "Light Touches" (6-15), "Noticeable Patterns" (16-30), "Needs Another Pass" (31-50), "Full Robot Mode" (51-75), "Unedited AI Output" (76+). Each threshold has a one-line rationale comment.
- Top 5 offenders: sort trope results by (tier weight * count), take top 5.
- DNA strip data: array of {tropeId, tier, count, color} for all detected tropes, ordered by position in text.

**Test scenarios:**
- Happy path: text with 3 Tier 1 tropes (em dash x2, delve x1) scores 15 (5*2 + 5*1) and maps to "Noticeable Patterns"
- Happy path: clean text with 0 tropes scores 0 and maps to "Clean"
- Happy path: heavily troped text scores 76+ and maps to "Unedited AI Output"
- Happy path: top 5 offenders are ordered by weighted impact (tier weight * count)
- Edge case: text with only LLM-detected tropes (no heuristic matches) still produces a valid score
- Edge case: DNA strip data is ordered by first occurrence position in text

**Verification:**
- All tests pass
- Score thresholds documented with rationale

---

- [ ] **Unit 6: Analysis API Route**

**Goal:** Build the server-side API route that accepts input (text, URL, or screenshot), runs analysis, persists the report, and returns the slug.

**Requirements:** R1-R3 (three input types), R13 (unique URL), R27 (persistence)

**Dependencies:** Units 1, 3, 4, 5

**Files:**
- Create: `src/app/api/analyze/route.ts`
- Create: `src/lib/input/url-extractor.ts` (Readability + jsdom)
- Create: `src/lib/input/screenshot-ocr.ts` (Claude Vision)
- Create: `src/lib/input/normalize.ts` (route input to correct extractor)
- Test: `src/lib/input/__tests__/url-extractor.test.ts`
- Test: `src/lib/input/__tests__/screenshot-ocr.test.ts`

**Approach:**
- POST `/api/analyze` accepts: `{ type: 'text' | 'url' | 'screenshot', content: string }`. For text, content is the text. For URL, content is the URL string. For screenshot, content is base64-encoded image data.
- Normalize input to plain text using the appropriate extractor.
- Run heuristic engine (sync, instant).
- Start LLM engine (async).
- Compute score from heuristic results.
- Generate slug (nanoid, 10 chars).
- Persist to Neon: slug, source text, input type, results JSON, score, label.
- Return: `{ slug, score, label }`.
- When LLM results arrive, update the persisted report with Tier 4-5 data and recalculated score.
- URL extraction: use @mozilla/readability + jsdom. If LinkedIn URL detected, return error with message "LinkedIn blocks automated reading. Please paste the text directly."
- Screenshot OCR: send to Claude Vision with extraction prompt.

**Test scenarios:**
- Happy path: POST with text input returns slug and score
- Happy path: POST with URL input (Substack article) extracts text and returns results
- Happy path: report is persisted to database with correct slug
- Error path: POST with LinkedIn URL returns helpful error message
- Error path: POST with empty text returns validation error
- Error path: POST with invalid image data returns error
- Edge case: very long text (10,000+ words) is handled without timeout

**Verification:**
- API route responds correctly for all three input types
- Reports are queryable in Neon by slug

---

- [ ] **Unit 7: Report Card Page**

**Goal:** Build the shareable report card page at `/report/[slug]` with the full visual treatment.

**Requirements:** R13-R18 (report card layout and content), R19-R20 (DNA strip), R23-R25 (voice and tone)

**Dependencies:** Units 1, 5, 6

**Files:**
- Create: `src/app/report/[slug]/page.tsx` (report card page, SSR)
- Create: `src/components/report/ScoreHero.tsx` (grade + named label + roast line)
- Create: `src/components/report/DnaStrip.tsx` (horizontal bar visualization)
- Create: `src/components/report/TropeCard.tsx` (individual trope card with name, explanation, quoted text)
- Create: `src/components/report/TopOffenders.tsx` (top 5 trope cards)
- Create: `src/components/report/AllDetections.tsx` (expandable full list)
- Create: `src/components/report/ShareBar.tsx` (copy link + share buttons)
- Create: `src/lib/copy/roast-lines.ts` (pre-written roast line templates)
- Create: `src/lib/copy/clean-score.ts` (clean score treatments)

**Approach:**
- Server-side render the report card from the persisted report data.
- Above the fold: ScoreHero (large score number + named label + color + roast line), DnaStrip.
- Below the fold: TopOffenders (5 cards with trope name, tier badge, description, quoted text with highlighted phrase), AllDetections (expandable).
- Clean score (0-5): special treatment with "Suspiciously Human" badge or "Certified Organic" stamp. Fun, shareable, no dead end.
- Roast lines: pre-written templates with slots for dynamic data. E.g., "{count} em dashes in {wordCount} words. That's one every {ratio} words." Store 30-50 templates in roast-lines.ts, select based on top trope profile.
- All copy must be pre-written. No LLM generation per page load.
- No em dashes in any visible text.
- ShareBar: "Copy Link" button (navigator.clipboard), native share button (navigator.share where available).
- 404 page for invalid slugs.

**Test scenarios:**
- Happy path: `/report/abc123` renders the full report card with score, roast line, DNA strip, and top offenders
- Happy path: clean-score report renders "Suspiciously Human" treatment
- Happy path: "Copy Link" button copies the report URL to clipboard
- Happy path: all trope cards show the trope name, tier badge, description, and quoted text
- Edge case: report with only 2 tropes shows 2 cards (not 5)
- Edge case: invalid slug returns 404
- Edge case: no em dashes appear in any rendered text (irony test)

**Verification:**
- Report card page renders correctly for reports with varying trope counts (0, 3, 15, 40+)
- Visual design feels polished and playful, not like a data dump
- Pasting the report card's own copy back into the tool produces a clean or near-clean score

---

- [ ] **Unit 8: OG Image Generation**

**Goal:** Auto-generate a designed 1200x630 OG image for each report that renders in Slack, iMessage, LinkedIn, and Twitter previews.

**Requirements:** R21-R22 (OG image, designed, makes people click)

**Dependencies:** Units 5, 6, 7

**Files:**
- Create: `src/app/report/[slug]/opengraph-image.tsx` (Next.js OG image route)
- Create: `src/components/og/OgReportCard.tsx` (flexbox layout for OG image)
- Create: `assets/` directory with font files (Inter Bold, Inter Regular as TTF)
- Modify: `src/app/report/[slug]/page.tsx` (add metadata export with OG image reference)

**Approach:**
- Use Next.js built-in `opengraph-image.tsx` convention with `ImageResponse` from `next/og`.
- Layout (flexbox): dark background, large score number with color, named label, roast line text, DNA strip rendered as colored flex divs, "robotropespotter.com" footer.
- Load Inter font (TTF) for consistent typography.
- Read report data from database by slug.
- The OG image should make someone curious enough to click. Lead with the score and roast line.

**Patterns to follow:**
- @vercel/og documentation and examples
- Flexbox-only constraints (no CSS grid, no position absolute)

**Test scenarios:**
- Happy path: requesting `/report/abc123/opengraph-image` returns a valid PNG image
- Happy path: image dimensions are 1200x630
- Happy path: sharing the report URL in Slack shows the OG image preview with score and roast line
- Edge case: report with clean score shows the "Suspiciously Human" treatment in the OG image
- Edge case: very long roast line text is truncated gracefully

**Verification:**
- OG image renders correctly for reports across the full score range
- Link preview in a real Slack workspace or iMessage shows the image correctly

---

- [ ] **Unit 9: Landing Page Polish and Input UX**

**Goal:** Polish the landing page input experience. Three input modes, clear visual hierarchy, instant feedback.

**Requirements:** R1-R4 (input modes and ghost text), R17 (no dead ends)

**Dependencies:** Units 1, 6

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/input/TextInput.tsx` (text area with ghost text)
- Create: `src/components/input/UrlInput.tsx` (URL field with extraction status)
- Create: `src/components/input/ScreenshotDrop.tsx` (drag-drop zone with preview)
- Create: `src/components/input/AnalyzeButton.tsx` (submit with loading state)

**Approach:**
- The landing page IS the input. No explainer wall, no signup prompt.
- Text area with ghost text "paste something suspicious..." as the primary input.
- Below: collapsible URL field ("or paste a URL") and screenshot drop zone ("or drop a screenshot").
- Submit button triggers `/api/analyze`, shows loading state, then redirects to `/report/[slug]`.
- Loading state should feel intentional, not broken. Brief animation or progress indicator.
- Mobile-responsive: all three inputs work well on phone screens.

**Test scenarios:**
- Happy path: pasting text and clicking analyze navigates to a report card page
- Happy path: pasting a URL and clicking analyze shows extraction progress then navigates to report
- Happy path: dropping a screenshot shows image preview then navigates to report on submit
- Edge case: submitting empty text shows inline validation message
- Edge case: all inputs work on mobile viewport widths

**Verification:**
- The path from landing page to report card works for all three input types
- The landing page feels fast, clean, and inviting

## System-Wide Impact

- **API surface:** One public endpoint (`POST /api/analyze`). One public page route (`/report/[slug]`). One OG image route.
- **Error propagation:** URL extraction or OCR failure should return a clear error message to the user, not a generic 500. LLM failure should degrade gracefully (report card works with Tier 1-3 only).
- **State lifecycle:** Reports are write-once-read-many. No update or delete flows in v1. Cleanup can be a future cron job.
- **External dependencies:** Anthropic API (for LLM analysis + screenshot OCR), Neon Postgres (for persistence). Both have free tiers. URL extraction uses no external service (Readability runs locally).

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| LinkedIn URLs fail (login wall) | Detect LinkedIn URLs, return helpful error asking user to paste text directly |
| LLM analysis is slow (2-4s) | Render heuristic results immediately, append LLM results async. Report card works without Tier 4-5. |
| OG image rendering issues across platforms | Test with Slack, iMessage, Twitter, LinkedIn. Use opengraph.xyz validator. Cache-bust with query params if needed. |
| Scoring thresholds feel arbitrary | Calibrate against 10+ real texts (known AI-heavy LinkedIn posts, known human-written articles). Document rationale per threshold. |
| Report card copy sounds AI-written (irony) | All copy pre-written. Run the tool on its own copy as a CI-like check. |
| Neon cold starts (free tier) | First report load may be slow (~1-3s). Subsequent loads fast. Vercel Pro + Neon paid plan eliminates this if needed. |

## Sources & References

- **Origin document:** [docs/brainstorms/2026-03-28-mvp-requirements.md](docs/brainstorms/2026-03-28-mvp-requirements.md)
- **Ideation:** [docs/ideation/2026-03-28-social-diagnostic-ideation.md](docs/ideation/2026-03-28-social-diagnostic-ideation.md)
- Reusable patterns: [LAID](https://github.com/oldeucryptoboi/linkedin-ai-detector), [tropes.fyi](https://tropes.fyi/), [stop-slop](https://github.com/hardikpandya/stop-slop), [skill-deslop](https://github.com/stephenturner/skill-deslop)
- Next.js OG images: [nextjs.org/docs/app/getting-started/metadata-and-og-images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
- @mozilla/readability: [github.com/mozilla/readability](https://github.com/mozilla/readability)
- Claude Vision docs: [docs.anthropic.com/en/docs/build-with-claude/vision](https://docs.anthropic.com/en/docs/build-with-claude/vision)
