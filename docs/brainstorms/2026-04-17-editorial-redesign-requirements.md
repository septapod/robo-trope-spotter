---
date: 2026-04-17
topic: editorial-redesign-audit-repair
---

# Audit Repair and Editorial Deadpan Reset

## Problem Frame

The April 17 impeccable audit scored the site 8/20. Two classes of finding emerged:

1. **Objective failures** — WCAG AA contrast fails on candy-yellow severity badge and pink links, no form labels, drop zone unreachable by keyboard, tooltips hover-only, no live regions, no reduced-motion guards, blocking font `@import`, animated box-shadow repaints, native `<img>` tags, 44px touch-target misses. These have WCAG / browser / perf basis independent of tone.

2. **Aesthetic critique** — BAN 1 side-stripe borders, Outfit on the reflex-reject list, stacked AI-template decoration (blobs, gradient mesh, glow shadows), candy palette reading as template, score-hero dots+metric layout. These are the same audit tool's aesthetic rubric, not independent objective findings.

Document review (2026-04-17, two passes) surfaced strong consensus that these two classes should not ship together. The objective failures stand on their own merits regardless of what tone the product takes. The aesthetic reset is a positioning bet that deserves its own gate, its own share-rate evidence, and its own acceptance criterion. Bundling them means a tonal regret would revert the a11y wins with it — and the PR 2 gate would have no real data to operate on.

**This doc commits to a two-PR sequence:**

- **PR 1 — Audit Repair + Share Instrumentation.** Objective a11y, performance, responsive fixes. Split brand pink from link pink so WCAG AA on links doesn't shift the brand color on shared OGs. Keeps full existing visual language intact (candy palette, blobs, gradient mesh, glow shadows, card stripes all preserved — their removal moves to PR 2 alongside their replacement). Adds share-event tracking so PR 2's acceptance gate has real data. Defensible regardless of any tone decisions downstream. Ships immediately.
- **PR 2 — Editorial Deadpan Reset.** Visual-language redesign (muted tier hues, pink-only accent, decoration removal, editorial marginalia, score hero rewrite, OG image update). Tonal bet. Gated on PR 1 shipping + 14 days of share baseline + counted mockup comparison + post-merge monitoring. May not ship. 60-day termination clause.

## Design Context (applies to PR 2 only)

Locked in from earlier brainstorm dialogue. PR 1 does not depend on these.

**Tone**: Editorial deadpan. The interface reads like a media brand or a wry analytical publication. Dry, observational, confident.

**Anti-references**: AI-dashboard template (candy palettes, blurred blobs, gradient meshes, glowing brand-colored shadows), fake-vintage costumery (kraft paper, typewriter body fonts, "EST. 2026" medallions, hand-drawn circles), dashboard SaaS patterns (pill toggles with hover glows, three-colored-dots stat rows), decorative sparklines and filigree.

**References**: FT salmon accent on neutral ground, Bloomberg Businessweek editorial, The Browser, Pentagram's functional ornament, design spec documents (§ sections, mono annotations, hairline rules).

---

## PR 1 — Audit Repair

Scope: fix every objective audit failure without touching tone or visual language. Candy palette, blobs, gradient mesh, glow shadows, existing score hero, existing OG image, and existing card stripes all preserved here. PR 2 handles the tonal reset and all decoration-removal separately — that way PR 1's standalone state is coherent rather than an orphaned candy-palette-without-scaffolding.

PR 1 also instruments share-event tracking so PR 2's acceptance gate has real data to read from.

### Typography (PR 1)

- T1. Replace Outfit with Hanken Grotesk as the body font.
- T2. Keep Bricolage Grotesque as display. Keep JetBrains Mono for data.
- T3. Migrate to `next/font/google`. Remove the `@import url(...)` blocking font load in `src/app/globals.css`. Wiring: import each font in `src/app/layout.tsx` with `next/font/google` using the `variable` option (e.g., `--font-hanken`, `--font-bricolage`, `--font-jetbrains-mono`), apply the combined variable classes to `<html>`, then update `@theme` in `globals.css` to reference the variables (e.g., `--font-sans: var(--font-hanken), system-ui, sans-serif`). The current hardcoded font-family strings in `@theme` stop resolving once the CDN `@import` is removed. Font-display strategy: `swap` with system-font fallbacks that metric-match to minimize CLS on the score hero.
- T-PR1-score. Score hero number uses fluid sizing: `clamp(6rem, 22vw, 11rem)`. No fixed 140-180px.

### Color (PR 1)

- C-PR1-tokens. Split `--color-candy-pink` into two tokens: `--color-brand-pink` (current vivid value `#EC4899`, used on Analyze button, primary CTAs, OG image backgrounds, logomark tints, the existing score hero blob, and anywhere pink appears as a decorative surface) and `--color-link-pink` (darkened one OKLCH step from brand, used exclusively on small-text links where WCAG AA contrast requires it). This preserves brand continuity on shared OG images and existing report URLs while fixing the WCAG failure.
- C-PR1-link. Apply `--color-link-pink` to: "See all 42 tropes" link in `src/app/page.tsx:257`, "Analyze text" link in `src/app/tropes/page.tsx:52`, "See all 42 tropes" link in `src/app/report/[slug]/page.tsx:117`. Verify 4.5:1 contrast on warm-white surface.
- C-PR1-badge. Tier 3 severity badge text switches to dark ink on candy-yellow. Other tier badges verified at 4.5:1 minimum; any failures get ink text instead of white.

### Share-Event Tracking (PR 1)

- ST1. Add `POST /api/track-share` endpoint that accepts `{ reportSlug: string, method: "clipboard" | "native" }`. Write to a new `share_events` table (columns: `id`, `report_slug`, `method`, `created_at`). No PII, no user agent, no IP beyond what rate-limiting already logs.
- ST2. Update `src/components/report/ShareBar.tsx` to fire the tracking call on successful `handleCopy` and `handleShare`. Fire fire-and-forget (don't block the UI). Silently swallow network failures.
- ST3. Add a read-only admin view at `/admin/shares` (gated by existing admin auth) showing: total shares, shares per day, share rate (shares / report generation count) by score band. Minimum viable; no charts needed.
- ST4. Baseline collection begins the moment PR 1 ships. PR 2's acceptance gate (below) reads from this table.

### Accessibility (PR 1)

- A1. Add visually-hidden `<label>` on every form input: `src/components/input/TextInput.tsx`, `src/components/input/UrlInput.tsx`, the screenshot file input.
- A2. Make the screenshot drop zone in `src/components/input/ScreenshotInput.tsx:119-150` keyboard-operable: wrap in `<button type="button">` or add `role="button"`, `tabIndex={0}`, and `onKeyDown` handlers for Enter and Space.
- A3. Make highlighted-text tooltips in `src/components/report/HighlightedText.tsx:268-286` focus-reachable and touch-reachable. **Decision:** swap the `<span>` for a `<button type="button">` with `aria-describedby` pointing to the tooltip content. Show tooltip on `:hover`, `:focus-visible`, and tap (click-to-pin state). Escape dismisses pinned tooltip. Click outside dismisses. This resolves the earlier Open Question.
- A4. Add `role="alert"` to the analyze error container in `src/app/page.tsx:249-253`.
- A5. Wrap the cycling loader message in `aria-live="polite"` and add `aria-busy={loading}` to the Analyze button.
- A6. Wrap all keyframe animations in `@media (prefers-reduced-motion: no-preference) { ... }`. Freeze positions and disable transitions when reduced-motion is set. Covers: `animate-score-reveal`, `animate-card-enter`, `focus-glow`, and any future loader.
- A7. Every interactive surface passes WCAG AA contrast (4.5:1 small text, 3:1 large text).
- A8. Focus indicators on all interactive elements. `focus-glow` gets a solid fallback `outline` so low-vision users and `prefers-reduced-motion` contexts see the ring without animation.

### Performance (PR 1)

- P1. `next/font/google` migration (covered in T3).
- P2. Memoize `buildHighlights` in `src/components/report/HighlightedText.tsx:219` with `useMemo([sourceText, tropeResults])`. Parent (`src/app/report/[slug]/page.tsx`) is a server component so the prop reference is stable for the client component's lifetime — no upstream change needed.
- P3. Swap native `<img>` tags for `next/image` on the dxn-logomark across `src/app/page.tsx`, `src/app/tropes/page.tsx`, `src/app/report/[slug]/page.tsx`.
- P4. Rework `focus-glow` in `src/app/globals.css:160-186`. Either one-shot animation on focus-in, or solid outline-color transition. No infinite box-shadow animation.
- P5. Verify no residual `backdrop-blur` or `blur-[100px]` on navs after D1/D2 unless there's a real reason.

### Responsive (PR 1)

- R1. Clear-file X button in `src/components/input/ScreenshotInput.tsx:100-113` becomes 44×44px touch target.
- R2. Footer links get block-level padding to reach 44px on mobile.
- R3. Score hero fluid sizing (covered in T-PR1-score).
- R4. Highlighted-text tooltips work on touch (covered in A3 resolution).

### PR 1 Success Criteria

- Zero WCAG AA contrast failures across body text, links, tier badges, and score number.
- 100% of interactive elements reachable by keyboard, including the drop zone.
- `prefers-reduced-motion` honored on every keyframe animation (blobs, gradient mesh, focus-glow, score-reveal, card-enter — all frozen when the user opts out).
- Font load does not block render; no CDN `@import` in `globals.css`.
- Clear-file button and footer links all ≥44×44px touch targets.
- Share-event tracking live and writing to `share_events` table.
- All existing functionality and visual language preserved (three input modes, scoring, share URLs, OG images, candy palette, blobs, gradient mesh, glow shadows, existing score hero, existing card stripes all intact).

### PR 1 Scope Boundaries

- Candy palette kept as-is. Brand pink unchanged; only link-pink darkened (C-PR1-tokens, C-PR1-link).
- Tier colors kept as-is except for Tier 3 badge text fix in C-PR1-badge.
- Score hero layout unchanged in structure (colored dots stats row, gradient scale bar, pink roast-line card all stay).
- All decorative elements preserved: blobs, gradient mesh, candy-pink glow shadows, gradient button class, 6px / 4px colored left-stripes on cards. These are audit-flagged aesthetic anti-patterns, not objective failures, and move to PR 2 alongside their editorial-deadpan replacement so PR 1's standalone state is coherent.
- No OG image changes.
- No 404 page changes.
- No color tokenization beyond the pink split and tier-3 fix.
- No OKLCH migration.
- No `color-mix` migration.
- `prefers-reduced-motion` guards mitigate any perf concern around `animate-blob` repaints for users who opt out; non-opt-out users accept the existing cost until PR 2.

### PR 1 Shipping

Standalone PR. Vercel preview. Merge as soon as the acceptance list passes. Revert plan: one git command.

---

## PR 2 — Editorial Deadpan Reset (gated, may not ship)

Scope: commit to editorial deadpan as the product's visual tone. Ships only if the pre-merge share-rate check (see acceptance gate below) does not show regression risk.

### Typography (PR 2)

- T4. Build a 5-step modular type scale with at least 1.25 ratio between steps. Fluid sizing (clamp) on marketing headings (landing, report score, taxonomy header). Fixed rem on UI labels.
- T6. Body text max-width 65-75ch everywhere prose appears (roast line, trope description, taxonomy intro, error states).
- T7. Tier labels in the taxonomy use Bricolage display at step 4 of the modular scale (approximately 2rem / 32px at 1.25 ratio), making tiers read as section chapters, not row headers.

### Color (PR 2)

- C1. `--color-brand-pink` (PR 1 C-PR1-tokens) becomes the single vivid brand accent in the editorial layout. Used only on: Analyze button, primary CTAs, the score number when in highest-severity band, and one marginalia mark per page. Not on every link — links continue using `--color-link-pink` from PR 1.
- C3. Mute the five tier colors hard. Convert each to editorial OKLCH with lower chroma (target ~0.08-0.12 chroma). Working names: ink-red (T1), mustard (T2), moss (T3), slate-teal (T4), ink-plum (T5). Preserve tier order semantics.
- C-PR2-derive. **Old-report color strategy.** Stop reading stored `labelColor` and per-trope `color` fields at render time. At the score level, derive color from `rawScore` via a numeric band lookup in `src/lib/analysis/colors.ts` (NOT from the `label` string — labels may be renamed in future passes without affecting score derivation). At the per-trope level, derive color from `tier` and `count` via the same lookup. Legacy hex values in the `results` jsonb blob become ignored data — no migration. For the rare edge case where an old report lacks `tier` on a trope result, fall back to the stored `color` field unchanged. Affects: `ScoreHero.tsx`, `TropeCard.tsx`, `HighlightedText.tsx`, `opengraph-image.tsx`.
- C5. Replace hex-alpha string concatenation (`trope.color + '18'`) with `color-mix(in oklch, <color>, transparent 90%)`. Browser floor: Chrome 111+, Safari 16.2+, Firefox 113+ (~95% of modern traffic). Accept silent degradation below that; do not add `@supports` fallbacks.
- C6. Replace `rgba(0, 0, 0, ...)` shadow hacks with `color-mix(in oklch, var(--color-ink-900), transparent 92%)` style.
- C7. Centralize tier colors in `src/lib/analysis/colors.ts`. Delete duplicate tier color table in `src/app/tropes/page.tsx:10-41`. Export both as hex constants (for Satori / OG image) and as OKLCH strings (for `@theme` tokens).
- C8. Replace the green-to-red gradient scale bar in `src/components/report/ScoreHero.tsx:38-40` with the muted tier palette, same gradient shape, new colors.

### Decoration Removal and Marginalia (PR 2)

- D1. Remove all three decorative blobs (`animate-blob`, `animate-blob-alt`, `animate-blob-pulse`) across landing, report, and taxonomy pages.
- D2. Remove the `.gradient-mesh` radial-gradient background.
- D3. Remove candy-pink glow shadows (`shadow-candy-pink/20`, `shadow-candy-pink/30`, etc.). Cards use a single neutral shadow if elevation is needed.
- D4. Remove the gradient button class (`.btn-gradient`). Share button becomes solid pink consistent with Analyze.
- D-PR2-ban. Remove the 6px colored left-stripe from `src/components/report/TropeCard.tsx:26-30` and the 4px colored left-stripe from `src/app/tropes/page.tsx:97` (both BAN 1 violations). Card rewrite per L4.
- D5. Add editorial marginalia: small mono section IDs in the corner of each major section (format: `§ 01 / ANALYSIS`, `§ 02 / TAXONOMY`), hairline zinc rules between sections. **Accessibility classification**: decorative. `aria-hidden="true"`. Minimum font size 11px — users who need larger text rely on the actual section headings, not the marginalia. **Cool-not-corny gate**: Brent reviews Vercel preview before merge. If any piece reads as costumey (fake-newspaper, hand-drawn, nostalgic), cut that piece and ship without it.
- D6. No kraft-paper textures, no fake-newspaper headlines, no "EST." medallions, no hand-drawn underlines.
- D7. Replace the bounce-dot loader. **Implementation plan**: start with static cycling mono messages (no per-character animation) wrapped in `aria-live="polite"`. If the static version ships and reads flat, a follow-on iteration can add the scan-line-through-sample-trope treatment. Commitment in PR 2 is the static version; the animated variant is optional polish deferred. Simpler to accept and keeps D7 from becoming a vibe debate.

### Score Hero and Report Layout (PR 2)

- L1. Redesign the score hero without the three-colored-dots stats template. Score number stays oversized at the T5 fluid size (`clamp(6rem, 22vw, 11rem)`) and carries the visual weight. Explicitly delete the decorative blob wrapper at `src/components/report/ScoreHero.tsx:15-21`. Below the score: a single-line typographic stats row in mono (e.g., `42 TROPES · 87 INSTANCES · 412 WORDS`), no colored dots, no pipe separators beyond a simple middle dot. On viewports < 480px, the stats row breaks after the second item: `42 TROPES · 87 INSTANCES` on line 1, `412 WORDS` on line 2. Middle dots between items are preserved; the wrap is a flex `flex-wrap` at the middle separator.
- L2. Move the roast line out of the pink-tinted card. Set it in body at large size, **left-aligned** under the score, with opening and closing quotation marks in Bricolage display. Resolves earlier ambiguity between centered and left-aligned.
- L3. Replace the pink-tinted severity badge on trope cards with a small mono tier label above the trope name. Use muted tier hue for the badge text, not as a solid background. Label copy per tier: T1 `§ T1 / DEAD GIVEAWAY`, T2 `§ T2 / RED FLAG`, T3 `§ T3 / WORTH NOTING`, T4 `§ T4 / SUBTLE TELL`, T5 `§ T5 / DEEP CUT`. Note: the `§ Tn` tier convention and the `§ NN` marginalia convention (per D5, e.g., `§ 01 / ANALYSIS`) are deliberately distinct; tier labels use `T` + tier number, marginalia uses two-digit section number without a leading letter.
- L4. Card structure becomes: mono tier label, trope name in Bricolage display, muted tier-color leading numeral for count (e.g., a large `3×` in the tier's muted hue, step 5 of the modular scale), description, "Try:" suggestion in a subtle callout using hairline rule, examples as indented pull quotes.
- L6. Score scale bar simplifies: keep the gradient-filled bar and the position marker, use the muted tier palette and mono labels. Marker is a thin black rule.

### Zero-Trope and Edge-State Layouts (PR 2)

- L7. **Zero-trope report state.** Score renders `0`. Stats row shows `0 TROPES · 0 INSTANCES · N WORDS`. Roast line is replaced with a clean-score line (existing copy in `src/lib/copy/clean-score.ts`) in the same typographic treatment. No trope card list section renders.
- L8. **Partial detection states.** Any state where top offenders exist but additional detections don't — render only the sections with content. No empty card lists, no "No additional detections" strings.

### Theming Foundations (PR 2)

- F1. Define `@theme` tokens in OKLCH. Include: `--color-surface-0` through `--color-surface-3` (warm off-white at lightness 99%, 96%, 92%, 88%; chroma 0.01-0.02; hue 20-30° for pink warmth), `--color-ink-100` through `--color-ink-900` (near-neutral zinc; chroma 0.005-0.01; hue 20-30°; lightness progression 95% → 85% → 75% → 65% → 55% → 45% → 35% → 25% → 10%), `--color-accent` (darkened candy-pink from PR 1 C-PR1-pink), `--color-tier-1` through `--color-tier-5` (muted tier hues per C3, chroma 0.08-0.12). Reference triad for ink: ink-100 `oklch(95% 0.005 25)`, ink-500 `oklch(55% 0.008 25)`, ink-900 `oklch(10% 0.005 25)`.
- F2. All component color usage references tokens, not hex. Grep the codebase after migration; none should remain in components. **Exception**: `src/app/report/[slug]/opengraph-image.tsx` and any other Satori-rendered surface. Those consume hex exports from `src/lib/analysis/colors.ts` directly because Satori does not resolve CSS custom properties, does not support `color-mix()`, and has limited OKLCH support.

### Supporting Updates (PR 2)

- S1. Update the OG image generator in `src/app/report/[slug]/opengraph-image.tsx` to match the redesigned visual language. Uses hex constants from `src/lib/analysis/colors.ts` (Satori-safe). Dimensions stay at current (1200×630). Elements that translate: the oversized score number in Bricolage, the stats row in mono, the muted tier accent. Elements that don't translate: hairline rules beyond 1px can disappear in Satori rendering — verify or bump to 2px. No marginalia section IDs in OG (too small to read at thumbnail size). Fonts loaded via `fetch + arrayBuffer` in the route (not `next/font`).
- S2. Update the 404 page in `src/app/not-found.tsx` to match (display numeral, editorial layout, no rounded-3xl candy button).
- S3. Confirm the favicon / `src/app/icon.tsx` reads correctly against the new warm off-white surface. Adjust only if contrast fails; brand mark itself stays pink.

### PR 2 Acceptance Gate (pre-merge)

Before PR 2 merges, run these checks. The baseline comes from the `share_events` table populated by PR 1's ST1-ST4 since PR 1 shipped.

1. **Share-rate baseline established.** At least 14 days of `share_events` data since PR 1 shipped, minimum 30 total share events logged. If the baseline is thinner than that, either extend the window or accept that the gate runs on limited data (and say so explicitly in the ship decision). Report current share rate (shares / report-generations) for the baseline period.
2. **Mockup comparison against top shares.** Pull the 20 most-shared reports from `share_events`. Generate OG image mockups in the new visual language for each. Brent compares side-by-side with current OG images. Decision rule: if Brent judges the new ones meaningfully less likely to generate a screenshot on 8 or more of the 20, stop and rethink. This is subjective but bounded (counted, not vibes).
3. **Cool-not-corny check on marginalia.** Brent reviews Vercel preview. Any element that reads costumey (fake-newspaper, hand-drawn, nostalgic) gets cut before merge.
4. **OG image Satori render check.** Deploy a preview with at least 3 representative report slugs and verify the OG images render with the muted palette as expected, not as fallback/broken colors.

Post-merge monitoring: compare share-rate for 30 days post-merge against the PR-1 baseline. If share rate drops more than 20% over a 30-day window with ≥50 reports generated, that meets the "user evidence" bar in the durable reversal criterion and PR 2 gets reverted. Otherwise editorial deadpan stands.

If any check surfaces problems that aren't fixable inside PR 2, keep PR 1's wins and defer PR 2 without losing work.

### PR 2 Success Criteria

- The interface reads as editorial deadpan on first impression.
- Candy palette reduced to: pink as single vivid accent, five muted tier hues for signaling.
- OG images render consistently with the new language in Satori.
- Zero hex values in components outside `src/lib/analysis/colors.ts` and Satori-rendered files.
- Old reports re-derive colors at render time from tier/label; stored hex values in the jsonb blob are ignored.
- Zero-trope and partial-detection states render cleanly.

### PR 2 Scope Boundaries

- Dark mode: **not in scope.** F1's OKLCH tokens unblock dark mode as a side effect, but no dark mode palette is defined and no dark mode UI is built.
- Component library / Storybook: **not in scope.**
- Admin dashboard: **not in scope.**
- Animation system beyond `prefers-reduced-motion` guards: **not in scope.**
- Copy pass on landing headline, input placeholders, error messages: **not in scope** (existing copy ships with the redesign; if tone clashes surface, separate pass later).
- Persona typing, browser extension, scoring calibration: **not in scope** (these are v2 roadmap items).

### PR 2 Shipping

Standalone PR after PR 1 has shipped. Vercel preview. Acceptance gate (above) runs pre-merge. Revert plan: one git command — and because PR 1 is already merged, the a11y and perf wins stay.

**Termination clause.** If PR 2 has not merged within 60 days of PR 1 shipping, the editorial-deadpan direction is considered not pursued: PR 2 branch is deleted and the March 29 candy-palette decision stands until new evidence (share-rate data, qualitative user feedback, product-job conflict) justifies revisiting. This prevents PR 2 from becoming a zombie branch and forces a real ship-or-kill decision on a calendar.

---

## Cross-PR Notes

### Rejected per-review but worth flagging

- **Reviewing the premise.** Three reviewers challenged the editorial-deadpan direction on product-fit grounds (roast-tool JTBD, no user research, audit-as-proxy). Brent has chosen to proceed. PR 2's acceptance gate is the explicit counter-check. If the share-rate sanity fails, PR 2 doesn't ship and the question gets revisited with evidence.
- **Reversing the March 29 'candy palette stays' decision.** PR 1 keeps the candy palette. PR 2 reverses it only if the acceptance gate passes. The durable criterion for future redesigns: do not reverse a shipped aesthetic direction without either (a) user evidence (share-rate regression from non-Brent traffic, engagement drop, qualitative complaints from actual users) or (b) a concrete product-job conflict the current direction creates. "A new audit scored lower" is not sufficient by itself. The share-tracking instrumentation in PR 1 ST1-ST4 is what makes "user evidence" a real bar, not a rhetorical one.
- **This decision uses the criterion honestly.** PR 2 as written is an aesthetic bet Brent is making on taste, backed by a rubric-defined audit. The mockup comparison (gate check 2) is subjective preview, counted but still judgmental. The acceptance gate is designed to prevent ship-under-pressure more than to provide external evidence this specific decision is correct. Named explicitly so the criterion doesn't quietly grandfather itself past its own bar.

### Open Questions

None outstanding. Prior open questions (tooltip pattern, marginalia naming, loader fallback) are resolved in A3, D5, and D7 above.

## Next Steps

- -> `/ce:plan` for PR 1 implementation sequencing. Start there. PR 1 is safe to plan and ship regardless of PR 2's fate.
- -> `/ce:plan` for PR 2 implementation sequencing, after PR 1 ships and the acceptance gate is designed. Do not plan PR 2 prematurely — if PR 1 changes the user or engagement picture, PR 2's scope should revisit in light of that.
