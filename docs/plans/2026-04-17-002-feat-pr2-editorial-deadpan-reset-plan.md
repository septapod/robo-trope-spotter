---
title: "feat: PR 2. Editorial Deadpan Reset"
type: feat
status: active
date: 2026-04-17
origin: docs/brainstorms/2026-04-17-editorial-redesign-requirements.md
---

# PR 2. Editorial Deadpan Reset

## Overview

PR 2 commits the product to editorial deadpan as its visual language. It replaces the candy SaaS aesthetic with an FT/Bloomberg-adjacent register: muted OKLCH tier palette, a single vivid pink accent reserved for actions, editorial marginalia (section IDs, hairline rules), decoration stripped, score hero rewritten as oversized numeral + single-line mono stats, trope cards rebuilt around mono tier labels and large leading numerals. PR 1 shipped the objective a11y and performance fixes plus `share_events` instrumentation. PR 2 is the tonal bet.

PR 2 ships only if the pre-merge acceptance gate passes (see origin: `docs/brainstorms/2026-04-17-editorial-redesign-requirements.md`).

## Problem Frame

The 8/20 audit flagged the current visual language as template-recognizable (candy palette, stacked blobs, gradient mesh, glow shadows, BAN 1 side-stripes, three-colored-dots stat layout, gradient buttons). PR 1 repaired objective failures without touching this. The product is still readable as AI-dashboard template.

Editorial deadpan was selected during brainstorm as the replacement direction. FT salmon on neutral ground, Bloomberg Businessweek chapter markers, Pentagram functional ornament, design-spec document cues (section numbers, mono annotations, hairlines). The tone is dry, observational, confident. Not candy. Not costumey.

PR 2 has known product risk: the current design already works (reports get shared; candy palette has personality). A wrong tonal reset could kill virality silently. The gate (below) exists to catch that before merge and within 30 days post-merge.

## Requirements Trace

- R1. Single vivid pink accent reserved for the Analyze button, primary CTAs, highest-severity score number, and one marginalia mark per page (origin: C1).
- R2. Five muted OKLCH tier hues (chroma 0.08-0.12) replacing the saturated tier-500 palette. Tier semantics preserved (origin: C3).
- R3. All component color usage references `@theme` tokens; zero hex in components outside `src/lib/analysis/colors.ts` and Satori-rendered files (origin: F2).
- R4. 5-step modular type scale, min 1.25 ratio, fluid on marketing headings, fixed rem on UI labels (origin: T4).
- R5. Body prose capped at 65-75ch (origin: T6).
- R6. Tier labels in the taxonomy set at modular step 4 as section chapters (origin: T7).
- R7. All three decorative blobs removed across pages (origin: D1).
- R8. `.gradient-mesh` background removed (origin: D2).
- R9. Candy-pink glow shadows removed (origin: D3).
- R10. Gradient button class removed; share button becomes solid pink (origin: D4).
- R11. BAN 1 left-stripe borders removed from trope cards and taxonomy cards (origin: D-PR2-ban).
- R12. Editorial marginalia: mono section IDs (`§ 01 / ANALYSIS` style) in corners, hairline zinc rules between sections (origin: D5).
- R13. Bounce-dot loader replaced with static cycling mono messages in `aria-live="polite"` (origin: D7).
- R14. Score hero rewritten: oversized Bricolage numeral, mobile-aware single-line mono stats row, decorative blob wrapper deleted (origin: L1).
- R15. Roast line moves out of pink-tinted card: body-size, left-aligned, opening and closing Bricolage quotes (origin: L2).
- R16. Trope card rewritten: mono tier label (`§ T1 / DEAD GIVEAWAY` format), Bricolage name, large muted tier-hue leading numeral, hairline-rule Try callout, indented pull-quote examples (origin: L3, L4).
- R17. Score scale bar keeps shape, takes muted palette + mono labels + thin black marker (origin: L6).
- R18. Zero-trope report state renders cleanly (0 score, 0 TROPES, clean-score line). No empty card sections (origin: L7).
- R19. Partial-detection states render only populated sections (origin: L8).
- R20. OKLCH `@theme` tokens: surface-0..3, ink-100..900, accent, tier-1..5. Values per F1 reference triad (origin: F1).
- R21. Old reports re-derive colors at render time from `rawScore` (score level) and `tier`+`count` (trope level) via `src/lib/analysis/colors.ts`. Stored hex in jsonb ignored. Fallback to stored `color` only when `tier` is missing on old trope results (origin: C-PR2-derive).
- R22. Tier colors centralized in `src/lib/analysis/colors.ts`; duplicate table in `src/app/tropes/page.tsx:10-41` deleted (origin: C7).
- R23. Hex-alpha string concatenation replaced with `color-mix(in oklch, ..., transparent <N>%)` (origin: C5, C6). Browser floor Chrome 111+, Safari 16.2+, Firefox 113+. No `@supports` fallbacks.
- R24. Gradient scale bar colors switch to muted tier palette (origin: C8).
- R25. OG image (`src/app/report/[slug]/opengraph-image.tsx`) matches redesigned language: Bricolage oversized score, mono stats, muted tier accent, hairlines >= 2px, hex constants from `colors.ts`, fonts via `fetch + arrayBuffer`, no marginalia (origin: S1).
- R26. 404 page (`src/app/not-found.tsx`) matches editorial language: display numeral, no candy button, no rounded-3xl (origin: S2).
- R27. Favicon (`src/app/icon.tsx`) verified on new warm off-white surface; brand mark stays pink (origin: S3).
- R28. `prefers-reduced-motion` guards continue to apply to any remaining keyframe animations from PR 1 (origin: PR 2 Scope Boundaries note).

## Scope Boundaries

- Dark mode. F1's OKLCH tokens unblock it as a side effect, but no dark palette is defined and no dark UI is built.
- Component library / Storybook.
- Admin dashboard redesign. `/admin` and `/admin/shares` keep their current utilitarian look.
- Animation system beyond `prefers-reduced-motion` guards from PR 1.
- Copy pass on landing headline, input placeholders, error messages. Existing copy ships with the redesign; tone clashes get a separate pass later.
- Persona typing, browser extension, scoring calibration. v2 roadmap.
- No new features. This is a visual reset on existing functionality.

### Deferred to Separate Tasks

- Animated scan-line loader variant (D7 optional polish). Ships only if static cycling mono reads flat in preview. Not a PR 2 merge blocker.
- Dark mode palette and toggle. Future, enabled by F1's OKLCH foundation.

## Context & Research

### Relevant Code and Patterns

- `src/app/globals.css` holds the Tailwind 4 `@theme` block (post-PR-1 state). Token additions and font variable wiring already landed; extending with OKLCH tokens follows the same pattern.
- `src/lib/analysis/colors.ts` currently exports `getTropeColor(tier, count)`, `getLabelColor(label)`, `getLabelInkColor(label)`. PR 2 extends this file as the single color source of truth; components stop importing hex.
- `src/lib/analysis/labels.ts` holds the `rawScore` to label mapping. R21 keeps label semantics but moves color derivation off the string and onto the numeric band.
- `src/components/report/ScoreHero.tsx`: score hero with colored-dots stats row, gradient scale bar, roast-line pink card, decorative blob wrapper (lines 15-21). Rewrite target for Unit 5.
- `src/components/report/TropeCard.tsx`: 6px left-stripe (BAN 1), candy-color backgrounds, severity badge as solid-color pill. Rewrite target for Unit 6.
- `src/components/report/HighlightedText.tsx`: post-PR-1 state uses `trope.color` on button backgrounds. Color derivation needs updating for R21.
- `src/app/tropes/page.tsx:10-41`: duplicate tierMeta table with hex values; delete as part of R22.
- `src/app/report/[slug]/opengraph-image.tsx`: Satori route with explicit font fetches. Rewrite target for Unit 10.
- `src/app/not-found.tsx`: minimal 404 with candy-pink button. Rewrite target for Unit 11.
- `src/app/icon.tsx`: 32x32 favicon route. Surface check for Unit 11.

### Institutional Learnings

- `docs/solutions/` is not yet seeded. Six patterns from PR 1 (WCAG color audits, Drizzle bootstrap, serverless rate-limit, sendBeacon fallback, roving tabindex, OKLCH-safe color derivation) plus this PR's muted-palette migration are good first entries but not a prerequisite for shipping PR 2.

### External References

- FT (ft.com) salmon `#FFF1E5` surface and mono accent treatment.
- Bloomberg Businessweek editorial layout, section chapter markers.
- Pentagram identity work (functional ornament, hairline rules).
- MDN `color-mix()` and OKLCH browser support tables (R23 floor confirmed).

## Key Technical Decisions

- **Two color resolution paths, not one.** Components consume OKLCH tokens via `@theme` custom properties; Satori consumes hex constants via direct import from `src/lib/analysis/colors.ts`. Satori does not resolve CSS custom properties, does not support `color-mix()`, and has limited OKLCH support. This is the only exception to R3 "zero hex in components."
- **Numeric score-band derivation instead of label-string lookup.** Labels are human-readable copy that may drift. `rawScore` is the authoritative numeric signal. Components read `rawScore` and call a `getScoreBandColor(rawScore)` helper. Old reports with outdated label strings still resolve correctly because the jsonb blob stores `rawScore` alongside `label`.
- **Legacy fallback kept minimal.** Old trope results predate `tier` being stored reliably on every row. When `tier` is missing, fall back to the stored `color` hex unchanged. One branch, one edge case, no migration.
- **Static cycling mono loader first.** D7 defers the animated scan-line to post-merge polish. Static version wrapped in `aria-live="polite"` satisfies a11y and ships faster. Keeps the PR from stalling on a vibe debate.
- **Marginalia classified as decorative for a11y.** `aria-hidden="true"`, minimum 11px. Screen readers rely on actual section headings. Users who need larger text are not asked to read 11px chrome.
- **`color-mix()` without `@supports` fallback.** Browser floor covers ~95% of modern traffic. Silent degradation on legacy browsers is acceptable for a B2B consulting tool with no enterprise support matrix.
- **Score hero blob deleted, not hidden.** `ScoreHero.tsx:15-21` is removed entirely. No conditional rendering. Keeps the component simpler than branching on visual mode.
- **Gradient mesh removal is a pure delete.** `.gradient-mesh` class stripped from three pages plus the CSS definition; no replacement backdrop. Warm off-white surface carries the ground.
- **Termination clause tracked on the plan, not in code.** If PR 2 hasn't merged within 60 days of PR 1 (2026-04-17 + 60 = 2026-06-16), this branch is deleted and the brainstorm is archived. No feature flag, no dead code. (see origin: 60-day termination clause)

## Open Questions

### Resolved During Planning

- Trope label format (`§ T1 / DEAD GIVEAWAY` vs other variants)? Resolved in brainstorm L3.
- Marginalia naming convention distinct from tier naming? Resolved in brainstorm L3. Tier uses `§ T` + tier number; marginalia uses `§ NN` without leading letter.
- Zero-trope state copy? Use existing `src/lib/copy/clean-score.ts` output, typographically treated the same as the roast line.
- OG image font loading? Keep current `fetch + arrayBuffer` pattern for Bricolage and Hanken. No `next/font` in Satori context (unsupported).
- Old report jsonb migration? None. Derive colors at render time from the numeric fields already stored.

### Deferred to Implementation

- Exact OKLCH values for the five muted tier hues. Target chroma 0.08-0.12. Implementer picks values during Unit 1 and verifies AA contrast against `--color-surface-0`.
- Fluid clamp curves on the modular type scale (Unit 3). Implementer picks exact breakpoints based on visual testing.
- Whether the roast line's opening/closing Bricolage quotes need a typographic adjustment for quote style (curly vs straight). Decide in Unit 5 during visual pass.
- Exact hairline rule weight in OG image (1px or 2px after verifying Satori render). Decide in Unit 10.
- Whether to preserve any animation on focus-glow after motion guards; PR 1 already replaced the infinite animation with a one-shot transition. Unit 5 may simplify further if the editorial tone calls for static-only focus styles.

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

Token architecture:

```
@theme (globals.css)
 ├─ --color-surface-0..3         OKLCH warm off-white ramp
 ├─ --color-ink-100..900         OKLCH near-neutral zinc with hue 20-30°
 ├─ --color-accent               Darkened candy-pink (PR 1 --color-brand-pink)
 ├─ --color-tier-1..5            Muted OKLCH tier hues (chroma 0.08-0.12)
 ├─ --font-display/sans/mono     Existing from PR 1
 └─ --text-1..5                  Modular type scale (clamp for 4-5, rem for 1-3)

src/lib/analysis/colors.ts
 ├─ TIER_OKLCH: Record<Tier, OklchTripleByCount>  // for @theme tokens
 ├─ TIER_HEX:   Record<Tier, HexTripleByCount>    // for Satori
 ├─ getTropeColor(tier, count): hex               // Satori path (existing)
 ├─ getTropeCssVar(tier, count): string           // component path, returns "var(--color-tier-N)"
 ├─ getScoreBandColor(rawScore): {css, hex}       // replaces getLabelColor
 └─ getScoreBandInk(rawScore):   {css, hex}       // replaces getLabelInkColor
```

Component color resolution (post-refactor):

```
ScoreHero({scoreResult}) ──────► getScoreBandColor(rawScore).css  ──► inline style or className
TropeCard({trope})      ──────► getTropeCssVar(tier, count)       ──► inline style or className
HighlightedText         ──────► getTropeCssVar(tier, count)       ──► button style
opengraph-image.tsx     ──────► getTropeColor(tier, count) hex    ──► Satori inline style
```

Old-report fallback (R21) handled inline:

```
const color = trope.tier != null
  ? getTropeCssVar(trope.tier, trope.count)
  : trope.color; // legacy hex, pre-tier data
```

## Implementation Units

- [ ] **Unit 1: OKLCH token foundations and centralized color source**

**Goal:** Define the editorial OKLCH token system in `@theme`, rebuild `src/lib/analysis/colors.ts` as the single source of truth for both CSS variables and Satori hex constants, and delete the duplicate tier table in `src/app/tropes/page.tsx`.

**Requirements:** R2, R3, R20, R22, R23

**Dependencies:** None.

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/lib/analysis/colors.ts`
- Modify: `src/lib/analysis/labels.ts` (export ScoreBand type if helpful)
- Modify: `src/app/tropes/page.tsx` (delete duplicate tierMeta table)
- Test: none (no new behavior; contrast verified visually)

**Approach:**
- Add OKLCH tokens to `@theme`: `--color-surface-0..3` (warm off-white ramp), `--color-ink-100..900` (near-neutral zinc with hue 20-30°, chroma 0.005-0.01), `--color-accent` (darkened brand pink; reuse PR 1 `--color-brand-pink` or define fresh at oklch lightness ~55%), `--color-tier-1..5` (muted tier hues, chroma 0.08-0.12, one per tier). Reference triad for ink: ink-100 oklch(95% 0.005 25), ink-500 oklch(55% 0.008 25), ink-900 oklch(10% 0.005 25).
- Keep PR 1 tokens (`--color-surface-0..3`, `--color-candy-pink`, `--color-brand-pink`, `--color-link-pink`, `--color-candy-yellow`, etc.) for one iteration to avoid breaking components mid-refactor. Mark them deprecated in a comment; later units replace consumers.
- In `colors.ts`, add `TIER_OKLCH` and `TIER_HEX` records keyed by tier and count-bucket. Add `getTropeCssVar(tier, count)` returning `"var(--color-tier-N)"` strings. Add `getScoreBandColor(rawScore)` and `getScoreBandInk(rawScore)` that bucket by the same numeric boundaries as `getLabel` (`<=5`, `<=15`, `<=30`, `<=50`, `<=75`, `>75`). Keep existing `getTropeColor`, `getLabelColor`, `getLabelInkColor` until all consumers migrate in later units.
- Delete `src/app/tropes/page.tsx:10-41` tierMeta and import from `colors.ts` instead. Expose an `editorialTierMeta` or similar from `colors.ts` that pairs each tier with its `severity` copy and OKLCH variable name.
- Verify AA contrast of every token pair that will carry text: `--color-ink-900` on `--color-surface-0` (target >= 7:1), `--color-tier-N` on `--color-surface-0` (target >= 4.5:1 when used as text, >= 3:1 when used as UI border/icon).

**Patterns to follow:**
- PR 1 `@theme` block in `src/app/globals.css`.
- OKLCH color functions per the `/color-design` skill's accessibility reference.

**Test scenarios:**
- Test expectation: none. Token definitions and exports have no behavioral change that unit tests can verify. Contrast is checked during implementation using a WCAG tool; the acceptance gate confirms visual correctness.

**Verification:**
- `globals.css` `@theme` block contains all tokens from F1.
- `src/lib/analysis/colors.ts` exports the two lookup paths (CSS var + hex) and the new band helpers.
- `src/app/tropes/page.tsx` no longer contains inline tier hex values; imports from `colors.ts`.
- Manual contrast check: every tier token passes 4.5:1 on `--color-surface-0` when used as text, or has a designated text-only darker variant.

---

- [ ] **Unit 2: Color derivation refactor across components**

**Goal:** Replace stored `labelColor` and per-trope `color` reads at render time with numeric-band and tier+count lookups from `colors.ts`. Keep the `color` field as fallback for legacy trope rows missing `tier`.

**Requirements:** R21

**Dependencies:** Unit 1.

**Files:**
- Modify: `src/components/report/ScoreHero.tsx`
- Modify: `src/components/report/TropeCard.tsx`
- Modify: `src/components/report/HighlightedText.tsx`
- Modify: `src/app/report/[slug]/opengraph-image.tsx`
- Test: none (covered by integration with later visual units and the gate's old-report check)

**Approach:**
- In `ScoreHero.tsx`, stop reading `scoreResult.labelColor`. Call `getScoreBandColor(scoreResult.rawScore)` and `getScoreBandInk(scoreResult.rawScore)`. Use `.css` for decorative contexts (blob wrapper is being deleted in Unit 5; this change lands cleanly after) and `.hex` only if a component needs a hex literal.
- In `TropeCard.tsx`, replace `trope.color` with `trope.tier != null ? getTropeCssVar(trope.tier, trope.count) : trope.color`. Legacy branch covers reports generated before tier was reliably stored.
- In `HighlightedText.tsx`, apply the same tier+count lookup to the button background tint and the border-bottom color.
- In `opengraph-image.tsx`, switch to `getTropeColor(tier, count)` hex and `getScoreBandColor(rawScore).hex`. Satori does not resolve CSS variables.

**Patterns to follow:**
- The `getLabelInkColor` pattern from PR 1 (safe fallback for unknown labels).

**Test scenarios:**
- Edge case: a stored trope result with `tier` undefined renders using the legacy `color` hex unchanged.
- Edge case: a stored trope result with `tier: 3` and `count: 1` renders using `var(--color-tier-3)` regardless of what `color` is stored.
- Happy path: a fresh report generates colors entirely from numeric inputs; no `labelColor` read.
- Integration: opening an old shared report URL still renders a recognizable trope card without hex mismatch.

**Verification:**
- grep for `\.color` / `labelColor` references in the four components returns only the fallback branch or cases where a different field is being read.
- A manually preserved old report (pre-PR-1 slug from prod) still renders on the new build without fallback text colors appearing.

---

- [ ] **Unit 3: Modular type scale and prose constraints**

**Goal:** Define a 5-step type scale (fluid at steps 4-5, fixed rem at steps 1-3), apply `max-width: 65-75ch` to body prose blocks, upgrade taxonomy tier labels to display at step 4.

**Requirements:** R4, R5, R6

**Dependencies:** None (parallel to Units 1-2).

**Files:**
- Modify: `src/app/globals.css` (scale tokens)
- Modify: `src/app/tropes/page.tsx` (tier label treatment)
- Modify: `src/app/page.tsx` (landing headline)
- Modify: `src/app/report/[slug]/page.tsx` (report heading)
- Modify: `src/components/report/TropeCard.tsx` (description/example prose widths)
- Test: none

**Approach:**
- Add `--text-1` through `--text-5` tokens to `@theme`. Steps 1-3 in rem (0.75/0.875/1rem or similar). Steps 4-5 use `clamp()` (e.g., `clamp(1.25rem, 2vw, 1.5rem)` and `clamp(2rem, 4vw, 3rem)`; exact curves decided during implementation per target ratio 1.25+).
- Score hero keeps its existing `clamp(6rem, 22vw, 11rem)` from PR 1 as the top display size; this sits above `--text-5` and is used only on the score number.
- Apply `max-w-[75ch]` to prose containers: roast line (ScoreHero), trope description and examples (TropeCard), taxonomy intro (tropes/page), error messages (page.tsx).
- Taxonomy tier label ("Dead Giveaway", etc.) upgrades from the current `font-mono text-xs` treatment to Bricolage display at `--text-4`, reading as chapter markers.

**Patterns to follow:**
- PR 1 fluid score sizing (`clamp(6rem, 22vw, 11rem)` in `ScoreHero.tsx`).
- Tailwind arbitrary-value syntax for `max-w-[75ch]`.

**Test scenarios:**
- Responsive: taxonomy tier labels scale smoothly between 320px and 1440px viewports.
- Regression: existing headings and prose still render at comparable size ranges; nothing shrinks to illegibility or grows to overflow.

**Verification:**
- `@theme` contains the five scale tokens.
- Taxonomy page renders tier labels as section chapters (visually larger than current state).
- Prose blocks measured in DevTools cap at ~75ch.

---

- [ ] **Unit 4: Strip candy decoration**

**Goal:** Remove all decorative blobs, gradient mesh, candy-pink glow shadows, gradient button class, and BAN 1 left-stripe borders across the app. Pure delete work; no replacement elements added in this unit.

**Requirements:** R7, R8, R9, R10, R11

**Dependencies:** Unit 1 (so `--color-accent` is available for the replacement share button).

**Files:**
- Modify: `src/app/globals.css` (delete `.gradient-mesh`, `@keyframes blob-float`, `@keyframes blob-float-alt`, `@keyframes blob-pulse`, `.animate-blob*`, `.blob-shape*`, `.btn-gradient` and descendants)
- Modify: `src/app/page.tsx` (remove gradient-mesh class, remove blob divs at lines ~159-162, remove `shadow-candy-pink/*` classes on Analyze button)
- Modify: `src/app/report/[slug]/page.tsx` (remove gradient-mesh class, remove blob div at line ~75, remove glow shadow classes)
- Modify: `src/app/tropes/page.tsx` (remove any glow shadow classes, remove BAN 1 left-stripe on taxonomy cards)
- Modify: `src/app/not-found.tsx` (remove gradient-mesh, remove glow shadows; full rewrite lands in Unit 11)
- Modify: `src/components/report/TropeCard.tsx` (remove 6px left-stripe; full card rewrite lands in Unit 6)
- Modify: `src/components/report/ShareBar.tsx` (replace `btn-gradient` class on share button with solid `bg-accent` / `--color-accent`; remove glow shadow classes)
- Test: none (visual regression only)

**Approach:**
- Delete decoration from CSS first, then component usage. This order means any stale class reference fails gracefully (no style applied) rather than silently rendering the old decoration.
- ShareBar's share button becomes solid pink using the new `--color-accent` token. Match the Analyze button's visual weight so the two primary actions have consistent treatment.
- TropeCard left-stripe: remove `borderLeftWidth: '6px'` and `borderLeftColor: trope.color` inline styles. Full card redesign lands in Unit 6; this unit only strips the BAN 1 violation so the card reads as a plain card in the interim.
- After removal, grep the codebase for `animate-blob`, `gradient-mesh`, `btn-gradient`, `shadow-candy-pink`, `shadow-candy-yellow`, `shadow-candy-teal` to confirm nothing else references them.

**Patterns to follow:**
- None specific; this is decoration removal.

**Test scenarios:**
- Regression: pages load without console errors and without visible broken layout after decoration removal.
- Regression: Analyze and Share buttons remain visually distinguishable as primary actions despite losing glow shadows.

**Verification:**
- `grep -r "gradient-mesh\|animate-blob\|btn-gradient\|shadow-candy-" src/` returns zero results.
- Visual check on `/`, `/tropes`, `/report/<slug>`: no blobs visible, no radial gradient backdrop, no colored glow shadows, no left-stripe on cards.

---

- [ ] **Unit 5: Score hero rewrite**

**Goal:** Rewrite the score hero around the oversized numeral + single-line mono stats row. Move the roast line out of the pink-tinted card to left-aligned body text with Bricolage display quotes. Update the scale bar to the muted palette with a thin black marker. Explicitly delete the decorative blob wrapper.

**Requirements:** R14, R15, R17, R24, R28

**Dependencies:** Unit 1 (tokens), Unit 2 (color derivation), Unit 4 (blob wrapper gone).

**Files:**
- Modify: `src/components/report/ScoreHero.tsx`
- Modify: `src/app/globals.css` (if any keyframe cleanup needed beyond what Unit 4 did)
- Test: none (visual; zero-trope case covered by Unit 9)

**Approach:**
- Delete the decorative blob wrapper at `src/components/report/ScoreHero.tsx:15-21` entirely. No conditional, no `prefers-reduced-motion` gate. Gone.
- Score number: Bricolage at existing `clamp(6rem, 22vw, 11rem)`, color from `getScoreBandInk(rawScore).css`.
- Stats row: single line of mono text in the format `N TROPES · M INSTANCES · W WORDS`, middle-dot separators. On viewport < 480px, break after `M INSTANCES`. Use `flex` + `flex-wrap` with an explicit `break` control (e.g., a `<br>` wrapped in a media-query-aware display, or a flex-wrap arrangement where the third item pushes to the next line).
- Roast line: `<p>` at `--text-4` size, `font-display`, left-aligned, `max-w-[75ch]`, opening/closing curly quotes as Bricolage characters. Not inside a pink-tinted container.
- Clean-score state: use `src/lib/copy/clean-score.ts` output in the same typographic treatment. Zero-trope full edge case lands in Unit 9 but this unit renders clean-score copy correctly for non-zero clean scores.
- Scale bar: keep the bar + marker. Replace the gradient stops with the muted tier palette (green-like at left, red-like at right, walking through tiers). Marker becomes a 1.5px black rule with no ring. Labels under the bar in mono (`CLEAN`, `MILD`, `HEAVY`).

**Patterns to follow:**
- PR 1 score number fluid sizing.
- PR 1 `getLabelInkColor` helper pattern; equivalent is `getScoreBandInk` after Unit 1.

**Test scenarios:**
- Happy path: mid-range score (e.g., 42 "Needs Another Pass") renders with muted orange numeral, stats row on one line on desktop, roast line in body at large size.
- Edge case: viewport at 320px renders stats row with the break after the second item; no horizontal overflow.
- Edge case: score of 0 renders using clean-score copy (zero-trope full state lands in Unit 9).
- Regression: score hero still fits above the fold on 1440px desktop.

**Verification:**
- No decorative elements (blob, gradient-mesh wrapper, pink tint card) visible in the score hero.
- Roast line reads as editorial body prose, not a UI card.
- Scale bar uses muted palette.

---

- [ ] **Unit 6: Trope card rewrite**

**Goal:** Rebuild the trope card around a mono tier label, Bricolage name, large muted leading numeral for count, hairline-rule Try callout, indented pull-quote examples. No left-stripe, no candy tint.

**Requirements:** R11, R16

**Dependencies:** Unit 1, Unit 2, Unit 4.

**Files:**
- Modify: `src/components/report/TropeCard.tsx`
- Test: none (visual)

**Approach:**
- Top-row layout: small mono tier label in the tier's muted OKLCH color (e.g., `§ T1 / DEAD GIVEAWAY` for tier 1). Label is text, not a pill or badge.
- Trope name: Bricolage display at modular step 4. Replaces the current `text-xl font-bold`.
- Count: leading numeral at modular step 5 (or larger) in the muted tier color. Example: a large `3×` set next to or above the name. No pink or candy background pill.
- Description: body size at `max-w-[75ch]`.
- Try callout: no colored box. A hairline rule (1px `--color-ink-300` or similar) above the line, then `Try:` in mono, then the suggestion in body. Visual separation by whitespace and the rule, not by background fill.
- Examples: pull-quote treatment. Left-indent, no box. Optional small mono marker (`→`) at the start of each. No colored border.
- Remove `backgroundColor: trope.color + '06'` from the article container. Container is plain `--color-surface-1` (white) on the page's warm-off-white background.

**Patterns to follow:**
- Editorial pull-quote treatment in long-form web typography (FT, NYT Magazine long reads).
- Brainstorm L4 structure: tier label, name, leading numeral, description, Try callout, examples.

**Test scenarios:**
- Happy path: tier 1 trope with count 3 renders with mono `§ T1 / DEAD GIVEAWAY`, Bricolage name, large `3×` in muted ink-red, hairline-rule Try callout, indented pull-quote examples.
- Edge case: trope with zero examples renders without the examples section (no "No examples" string).
- Edge case: trope with no suggestion renders without the Try callout.
- Regression: card hover behavior (if any) does not regress into glow shadows; any elevation change is done with a neutral shadow per Unit 4's D3 mandate.
- Integration: a 10-trope report renders the cards in a clean vertical rhythm; cumulative visual noise is noticeably lower than the candy version.

**Verification:**
- Visual: no left-stripe, no candy-tint background, no solid-color severity badge pill. Mono tier label, Bricolage name, large muted numeral all present.
- grep: no `borderLeftWidth`, `borderLeftColor`, or `backgroundColor: trope.color` patterns remain in `TropeCard.tsx`.

---

- [ ] **Unit 7: Editorial marginalia and hairline rules**

**Goal:** Add mono section IDs (`§ 01 / ANALYSIS`, etc.) to corners of major sections and hairline zinc rules between sections. Classified as decorative (`aria-hidden="true"`) with 11px minimum size.

**Requirements:** R12

**Dependencies:** Unit 1 (ink tokens).

**Files:**
- Modify: `src/app/page.tsx` (landing sections)
- Modify: `src/app/report/[slug]/page.tsx` (report sections)
- Modify: `src/app/tropes/page.tsx` (taxonomy sections)
- Modify: `src/components/report/ScoreHero.tsx` (section ID on score hero container)
- Modify: `src/components/report/TopOffenders.tsx` (section ID on top-offenders container)
- Modify: `src/components/report/AllDetections.tsx` (section ID on all-detections container)
- Test: none

**Approach:**
- Define a small helper or inline pattern for the marginalia element: `<span aria-hidden="true" className="font-mono text-[11px] tracking-widest uppercase text-ink-500">§ 01 / ANALYSIS</span>`.
- Place marginalia at the start of each major section: landing (`§ 01 / INPUT`), report score hero (`§ 01 / SCORE`), top offenders (`§ 02 / PATTERNS`), all-detections (`§ 03 / DETAIL`), taxonomy (`§ 01 / TAXONOMY`).
- Hairline rules between sections: `<hr className="border-t border-ink-200">` or equivalent with `--color-ink-200`. 1px. Not 2px.
- Cool-not-corny gate: after implementation, preview the Vercel build and cut any marginalia that reads costumey, nostalgic, or fake-newspaper.

**Patterns to follow:**
- Design-spec document conventions (two-digit section numbers, `/` separator, uppercase keyword).

**Test scenarios:**
- A11y: screen reader does not announce the marginalia elements. Section headings (h1/h2/h3) carry the navigation burden.
- Regression: at 200% zoom, marginalia scales but remains visually subordinate to real headings.

**Verification:**
- Each major section on each page has a section ID marker and a hairline rule.
- `aria-hidden="true"` confirmed on every marginalia element.
- Brent's cool-not-corny preview check passes (see D5 gate, origin).

---

- [ ] **Unit 8: Loader replacement**

**Goal:** Replace the bounce-dot loader in the Analyze button with static cycling mono messages wrapped in `aria-live="polite"`. The animated variant (scan-line-through-sample-trope) is deferred.

**Requirements:** R13

**Dependencies:** Unit 1 (fonts already in place from PR 1).

**Files:**
- Modify: `src/app/page.tsx` (loader inside Analyze button)
- Modify: `src/app/globals.css` (may delete `.loading-dots` styles and `@keyframes bounce-dot` if no other consumer)
- Test: none (existing a11y pattern covered by PR 1's `aria-live` setup)

**Approach:**
- Keep the existing cycling `loadingMessages` array and `loadingMsgIndex` state.
- Replace the three-dot animation with the mono message, wrapped in a `<span aria-live="polite" aria-atomic="true" className="font-mono">`. No animated dots.
- `aria-busy={loading}` on the Analyze button stays (from PR 1).
- Delete `.loading-dots` CSS and `@keyframes bounce-dot` if no other consumer exists after this change.

**Patterns to follow:**
- PR 1 cycling loader message + `aria-live` setup.

**Test scenarios:**
- A11y: screen reader announces each cycling message as it changes.
- Reduced-motion: no animation in either motion state; static mono text always.
- Happy path: user clicks Analyze, sees mono "Reading the text..." then "Scanning for patterns..." etc., no bouncing dots.

**Verification:**
- No bounce-dot animation visible.
- grep for `loading-dots` returns no matches in components or CSS.

---

- [ ] **Unit 9: Zero-trope and partial-detection layouts**

**Goal:** Make the report page render cleanly when there are zero detections (clean score) and when only some detection sections have content. Avoid empty card lists, avoid "No additional detections" strings.

**Requirements:** R18, R19

**Dependencies:** Unit 5 (score hero structure), Unit 6 (trope card structure).

**Files:**
- Modify: `src/app/report/[slug]/page.tsx`
- Modify: `src/components/report/ScoreHero.tsx` (clean-score branch)
- Modify: `src/components/report/TopOffenders.tsx` (return null when empty)
- Modify: `src/components/report/AllDetections.tsx` (return null when empty)
- Test: none (visual)

**Approach:**
- `ScoreHero` clean-score branch (`isCleanScore(scoreResult) === true`): renders `0` in the muted clean-tier color, stats row shows `0 TROPES · 0 INSTANCES · N WORDS`, roast line replaced with `src/lib/copy/clean-score.ts` output in the same typographic treatment.
- `TopOffenders` returns `null` when `tropes.length === 0`. Parent page renders nothing for that section.
- `AllDetections` returns `null` when `remaining.length === 0`.
- Page-level: conditional rendering of section containers. If a section has no children, neither the container nor the marginalia marker renders. No "no data" placeholder strings.
- Partial states: e.g., 5 tropes detected, all in top offenders, no remaining. `AllDetections` returns null. Top offenders section renders normally. Page still reads as a complete report.

**Patterns to follow:**
- `src/lib/copy/clean-score.ts` existing copy helpers (`isCleanScore`, `getCleanBadge`, `getCleanSubtitle`).

**Test scenarios:**
- Happy path (zero tropes): score 0, clean-score copy visible, no trope card sections render.
- Happy path (5 tropes, all shown): top offenders section renders; all-detections section does not render.
- Edge case (1 trope): top offenders shows 1 card; all-detections returns null.
- Regression (10 tropes, 5 top + 5 remaining): both sections render as before.

**Verification:**
- Zero-trope report URL renders a clean editorial layout without empty containers.
- No literal "No additional detections" or equivalent strings in any rendered state.

---

- [ ] **Unit 10: OG image redesign**

**Goal:** Rewrite `src/app/report/[slug]/opengraph-image.tsx` to match the editorial language. Bricolage oversized score, mono stats row, muted tier accent, hairlines >= 2px, hex constants from `colors.ts`.

**Requirements:** R25

**Dependencies:** Unit 1 (hex constants in `colors.ts`), Unit 2 (color derivation from numeric fields).

**Files:**
- Modify: `src/app/report/[slug]/opengraph-image.tsx`
- Test: none (visual; covered by acceptance gate check 4)

**Approach:**
- Switch from Inter to Hanken Grotesk (body) and Bricolage Grotesque (display) via `fetch + arrayBuffer`. Load only the weights needed (e.g., 700 for display, 400 for body).
- Layout: warm off-white background (`#FAF9F6` hex), Bricolage oversized score number in muted tier-band ink color, mono stats row below (`N TROPES · M INSTANCES · W WORDS`), muted tier accent color on the top-left corner marker (not marginalia full text; OG thumbnail is too small for 11px chrome).
- Hairline rule: 2px minimum. Satori can drop 1px rules at thumbnail resolution.
- Dimensions: unchanged at 1200x630.
- Color sourcing: `getScoreBandColor(rawScore).hex` for the score numeral, `getTropeColor(tier, count)` hex for any per-trope element (probably none at this layout size).
- No marginalia section IDs (too small).
- No decorative blobs, no gradient mesh, no pink pills (match the page-level editorial reset).

**Patterns to follow:**
- Existing `src/app/report/[slug]/opengraph-image.tsx` font-fetch pattern.
- Brainstorm S1 constraints (Satori limits).

**Test scenarios:**
- Happy path: high-severity score (e.g., 78 "Unedited AI Output") renders with muted red-tier numeral and mono stats.
- Happy path: clean score (0) renders with muted green-tier `0` and clean-score copy in place of a stats breakdown.
- Edge case: very long slug does not cause layout overflow.
- Regression: previously-shared report URLs generate OG images in the new language (derived from numeric fields; no hex mismatch from legacy storage).

**Verification:**
- Vercel preview OG image renders for at least 3 representative report slugs (one low, one mid, one high severity) with the muted palette.
- No Satori errors in the route's logs.

---

- [ ] **Unit 11: 404 page and favicon**

**Goal:** Rewrite the 404 page to match editorial language (display numeral, no candy button, no rounded-3xl). Verify favicon reads correctly on the new warm off-white surface.

**Requirements:** R26, R27

**Dependencies:** Unit 1, Unit 3, Unit 4.

**Files:**
- Modify: `src/app/not-found.tsx`
- Modify: `src/app/icon.tsx` (only if contrast fails; brand mark stays pink)
- Test: none

**Approach:**
- `not-found.tsx`: Bricolage oversized `404` numeral in muted tier-red ink, short mono copy underneath (`§ 404 / NOT FOUND`), link back to landing as a simple underlined text link (no rounded-3xl button, no candy pink shadow).
- `icon.tsx`: rendered at 32x32 on the warm off-white surface. Current brand mark is pink on a light background. If DevTools contrast check confirms >= 3:1 on the new surface-0 OKLCH, ship unchanged. If not, adjust fill only.

**Patterns to follow:**
- Editorial landing page structure (Unit 7 marginalia pattern applies).

**Test scenarios:**
- Happy path: navigating to `/nonexistent` renders the editorial 404 with display numeral and plain text link home.
- Regression: favicon renders correctly in Chrome, Safari, Firefox tabs.

**Verification:**
- 404 page visually matches the editorial language.
- Favicon contrast check passes 3:1 in DevTools color picker against the new surface-0.

---

- [ ] **Unit 12: Acceptance gate execution**

**Goal:** Run the pre-merge acceptance gate defined in the brainstorm. This is not a code unit; it is the set of gated decisions that must pass before PR 2 merges.

**Requirements:** PR 2 Acceptance Gate (brainstorm section), R28

**Dependencies:** All preceding units complete on a Vercel preview.

**Files:**
- None. Execution-only.

**Approach:**
- Gate check 1: Share-rate baseline. Query `share_events` for the window from PR 1 ship (2026-04-17) to present. Confirm >= 14 days have elapsed and >= 30 total share events logged. Compute share rate = `COUNT(DISTINCT share_events.report_slug) / COUNT(reports in window)`. Record baseline in the PR description.
- Gate check 2: Mockup comparison. Pull the 20 most-shared report slugs from `share_events`. Generate current OG image and PR-2-preview OG image for each. Brent compares side by side. Decision rule: if 8 or more of 20 read meaningfully less likely to be screenshot-shared in the new language, stop and rethink (do not merge).
- Gate check 3: Cool-not-corny review of marginalia on the Vercel preview. Cut any element that reads costumey.
- Gate check 4: OG image Satori render check. Deploy preview with at least 3 representative slugs (low/mid/high severity). Confirm OG images render with the muted palette, not fallback colors.
- Post-merge monitoring plan: 30-day share-rate comparison. If share rate drops > 20% over a 30-day window with >= 50 reports generated, revert. Documented in the ship PR description for handoff.

**Patterns to follow:**
- Acceptance gate structure in the brainstorm document. Direct handoff, not reinterpretation.

**Test scenarios:**
- None. This unit is a decision gate, not code.

**Verification:**
- All four gate checks documented in the PR description with pass/fail and evidence links.
- If any check fails, merge is blocked and the failure is named specifically. The PR does not get merged "with caveats."
- 60-day termination clause: if PR 2 hasn't merged by 2026-06-16, delete the branch and archive the brainstorm.

## System-Wide Impact

- **Interaction graph:** Every page surface (landing, report, taxonomy, 404, admin) receives visual updates. The admin dashboard is explicitly out of scope and retains its current utilitarian look. Share instrumentation (PR 1) and the analyze pipeline are unchanged.
- **Error propagation:** No changes to error-handling pathways. A11y error announcements (`role="alert"` from PR 1) continue to fire.
- **State lifecycle risks:** None introduced. Old reports read from jsonb and resolve colors numerically at render time.
- **API surface parity:** No API changes in PR 2. `/api/track-share` and `/api/admin/shares` remain as shipped in PR 1.
- **Integration coverage:** Old-report rendering is the only cross-cutting integration concern. Legacy trope results with missing `tier` fall back to stored `color` hex unchanged.
- **Unchanged invariants:** All three input modes (text, URL, screenshot) remain. Scoring logic in `src/lib/analysis/scoring.ts` is untouched. Share URLs and slugs are unchanged. Admin authentication remains session-cookie-based. Rate limiting in `src/middleware.ts` is unchanged. `prefers-reduced-motion` a11y guards from PR 1 continue to apply to any residual animation.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Share rate regresses after merge (tonal reset kills virality). | Post-merge 30-day share-rate comparison. If share rate drops > 20% with >= 50 reports, revert PR 2. PR 1 a11y wins stay. |
| Acceptance gate check 1 has insufficient data (fewer than 30 share events in 14 days). | Brainstorm permits extending the window or accepting thin baseline with explicit note. Do not force-merge on unclear evidence. |
| OKLCH tokens render differently across browsers (Chrome 111+, Safari 16.2+, Firefox 113+ floor). | Accept silent degradation below floor; no `@supports` fallbacks. ~95% of modern traffic is covered. |
| Satori OG rendering drops hairlines below 2px. | Unit 10 uses 2px minimum for all rules in OG. Preview check in gate step 4. |
| Marginalia reads costumey or nostalgic (fake-newspaper). | Brent's cool-not-corny review in gate check 3. Any offending element is cut before merge. |
| Old reports render with fallback color (missing `tier` on legacy trope results). | Unit 2 keeps stored `color` hex as the fallback branch. Not perfect, but legacy URLs still generate a recognizable card. |
| PR 2 becomes a zombie branch. | 60-day termination clause. If unmerged by 2026-06-16, delete the branch and archive the brainstorm. |
| Type scale breaks existing prose widths on mobile. | Unit 3 verifies responsive behavior at 320px. `max-w-[75ch]` is content cap, not minimum width. |
| Static mono loader reads flat. | D7 accepts this as a tradeoff to avoid vibe debate. Animated scan-line variant is documented as post-merge polish if the static version does not hold up. |

## Documentation / Operational Notes

- **PROJECT_STATUS.md update after merge.** Edit, not Write. Add a Recent Changes entry describing the editorial reset.
- **Archive of the candy palette.** The deprecated candy tokens (`--color-candy-pink`, `--color-candy-yellow`, etc.) live in `globals.css` through Unit 1 for one iteration, then get deleted in a cleanup commit after all consumers are migrated. Keep a code comment naming the removal date for future archaeologists.
- **Revert plan.** One git command: `git revert <merge-commit>`. PR 1's a11y wins remain because they are separate commits on main.
- **Termination date.** 2026-06-16. Calendar it. If unmerged by then, the branch is deleted and the brainstorm moves to an archive folder with the termination reason recorded.
- **Share-rate monitoring.** After merge, schedule a 30-day check. Query `/api/admin/shares` weekly; compare against the baseline captured in gate check 1. Document the baseline and any regression triggers in the PR description so the monitoring does not get forgotten.
- **Solutions capture.** After shipping, seed `docs/solutions/` with at minimum: OKLCH token migration from saturated HSL, numeric-band color derivation from stored jsonb, `color-mix` adoption with browser floor acceptance, editorial marginalia a11y classification. Compound-engineering payback.

## Sources & References

- **Origin document:** [docs/brainstorms/2026-04-17-editorial-redesign-requirements.md](../brainstorms/2026-04-17-editorial-redesign-requirements.md)
- Related PR: #6 (PR 1 audit repair + share instrumentation, merged 2026-04-17)
- Related code: `src/lib/analysis/colors.ts`, `src/lib/analysis/labels.ts`, `src/app/globals.css`, `src/components/report/*`, `src/app/report/[slug]/opengraph-image.tsx`
- External docs: MDN `color-mix()`, MDN OKLCH color space, WCAG 2.2 AA contrast
