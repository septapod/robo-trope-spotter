---
title: "feat: PR 1. Audit Repair + Share Instrumentation"
type: feat
status: active
date: 2026-04-17
origin: docs/brainstorms/2026-04-17-editorial-redesign-requirements.md
---

# PR 1. Audit Repair + Share Instrumentation

## Overview

PR 1 closes the objective findings from the April 17 impeccable audit and instruments share-event tracking so PR 2's acceptance gate has real data to operate on. The candy palette and existing decorative visual language are preserved; decoration-removal moves to PR 2 alongside its editorial-deadpan replacement. No user-visible redesign in this PR. the changes are a11y repairs, perf fixes, touch-target adjustments, font migration, link-color contrast fix, and one new data pipeline for share analytics.

## Problem Frame

The audit scored the site 8/20 (see origin: `docs/brainstorms/2026-04-17-editorial-redesign-requirements.md`). Document review confirmed that audit findings split into two classes: objective failures (WCAG, perf, browser contract) and aesthetic critiques (template recognition, palette taste). Bundling them forces a visual-language decision under audit-score pressure and risks reverting a11y wins if the tonal bet fails. PR 1 scope is confined to the objective class plus instrumentation; PR 2 handles tone.

## Requirements Trace

- R1. Zero WCAG AA contrast failures across body text, links, tier badges, and score number (origin: PR 1 Success Criteria).
- R2. 100% of interactive elements reachable by keyboard, including the drop zone (origin: A2, A3, A8).
- R3. `prefers-reduced-motion` honored on every keyframe animation (origin: A6).
- R4. Font load does not block render; no CDN `@import` in `globals.css` (origin: T1, T2, T3).
- R5. Clear-file button and footer links all ≥44×44px touch targets (origin: R1, R2).
- R6. Share-event tracking live and writing to `share_events` table; admin view available at `/admin/shares` (origin: ST1, ST4).
- R7. All existing functionality and visual language preserved (candy palette, blobs, mesh, glow shadows, score hero, card stripes all intact until PR 2).
- R8. Screen readers announce form field purposes, loading state changes, and analyze errors (origin: A1, A4, A5).
- R9. Tooltips on highlighted text reachable by focus, touch, and hover; dismissible by Escape or click-outside (origin: A3, R4).
- R10. Brand pink preserved at current vivid value on OG images, buttons, and decorative surfaces; link pink darkened only in small-text link contexts (origin: C-PR1-tokens, C-PR1-link).
- R11. Fluid score hero sizing `clamp(6rem, 22vw, 11rem)` replaces fixed 140-180px (origin: T-PR1-score).
- R12. `buildHighlights` memoized; logomark swapped to `next/image`; `focus-glow` stops animating box-shadow on infinite loop (origin: P2, P3, P4).

## Scope Boundaries

- Visual language unchanged: candy palette, decorative blobs, gradient mesh, glow shadows, gradient button class, 6px/4px colored left-stripes on cards all stay in PR 1.
- Score hero layout unchanged in structure (colored-dots stats row, gradient scale bar, pink roast-line card all remain).
- No OG image template changes.
- No OKLCH migration, no `color-mix` migration, no tier color muting.
- No new marginalia, no loader redesign, no modular type scale beyond the fluid score size.
- No copy pass on placeholders, error messages, or landing headline.

### Deferred to Separate Tasks

- Decoration removal (blobs, gradient mesh, glow shadows, gradient button, BAN 1 stripes): PR 2 (origin: D1, D4, D-PR2-ban).
- Editorial tonal redesign (muted tier hues, marginalia, score hero rewrite, OG image redesign): PR 2.
- Tier color centralization and OKLCH tokenization: PR 2 (origin: C3, C5, C7, F1, F2).
- Gradient scale bar replacement and score-reveal blur cleanup: PR 2 (origin: C8, L1).

## Context & Research

### Relevant Code and Patterns

- **API route pattern**: `src/app/api/analyze/route.ts` (POST with JSON body parsing, validation, 400/413 error shapes, Drizzle insert). Mirror for `src/app/api/track-share/route.ts`.
- **Admin-auth route pattern**: `src/app/api/admin/reports/route.ts` (session check via `isValidSession(request)` from `src/lib/admin/session.ts`, returns `{ error: 'Unauthorized' }` on 401, then reads from DB). Mirror for `src/app/api/admin/shares/route.ts`.
- **Admin page pattern**: `src/app/admin/page.tsx` is the existing admin dashboard. Mirror for `src/app/admin/shares/page.tsx` or extend the existing page with a new section.
- **Drizzle schema pattern**: `src/db/schema.ts` defines tables with `pgTable`, `uuid` primary keys with `defaultRandom()`, `timestamp` with `defaultNow()`. Follow for `share_events` table.
- **Drizzle migration workflow**: `drizzle-kit generate` produces SQL in `./drizzle` directory (doesn't exist yet. first migration creates it). `drizzle-kit migrate` applies.
- **Middleware matcher pattern**: `src/middleware.ts:120-122` uses `config.matcher` to scope rate limiting. Extend matcher to include `/api/track-share` with a separate (higher, lighter-cost) limit branch.
- **Client component with browser APIs**: `src/components/report/ShareBar.tsx` already uses `navigator.clipboard` and `navigator.share` with `try/catch`. Fire-and-forget tracking call fits the same pattern.
- **Existing loader copy pattern**: `src/app/page.tsx:24` holds the cycling loading messages array. Interval pattern at lines 28-45.
- **Existing `focus-glow` class**: `src/app/globals.css:160-186`. Applied via `focus-glow` class on inputs.
- **Existing keyframes inventory**: `animate-blob`, `animate-blob-alt`, `animate-blob-pulse`, `animate-score-reveal`, `animate-card-enter`, `focus-glow`, bounce-dot loader. all in `src/app/globals.css`.
- **Tailwind 4 `@theme` block**: `src/app/globals.css:4-21` defines `--color-candy-pink` etc. Variable-first fonts wire from `next/font/google` will plug in here.
- **Next/Image setup**: No existing `next/image` usages in the code I read; Next 16 supports it out of the box.

### Institutional Learnings

- Recent PROJECT_STATUS notes: "Contrast accessibility pass: all text-zinc-400 upgraded to text-zinc-500 or text-zinc-600 across app" and "TropeCard severity badges now use solid color backgrounds with white text for readability". This plan fixes the gap: Tier 3 badge (white on candy-yellow) still fails; C-PR1-badge addresses it. The earlier pass went in the right direction but didn't catch the yellow case.
- `npx vercel deploy --prod` is the working deploy path; GitHub force-push is blocked by a hook (see PROJECT_STATUS). Not relevant to this plan's content but relevant for shipping.

### External References

None needed. Codebase patterns are sufficient.

## Key Technical Decisions

- **Pink token split implementation**: keep `--color-candy-pink` as an alias for `--color-brand-pink` so existing Tailwind classes (`bg-candy-pink`, `text-candy-pink`, `shadow-candy-pink/20`) continue to work without refactoring every reference. Add new `--color-link-pink` and a new Tailwind class `text-link-pink`. Only rewrite the three link locations. Rationale: minimizes diff size, preserves brand color identity on OG images and decorative surfaces, confines the WCAG fix to the failing context.
- **Share tracking: POST endpoint, not query-string GET**: POST to `/api/track-share` with JSON body. GET would look cleaner but POST is the right verb for "record this event" and matches existing API style. Fire-and-forget from client; UX never blocks on the tracking call.
- **Share tracking: separate table, not column on `reports`**: append-only event log supports rate-over-time queries and multiple events per report (same report can be shared repeatedly). Aggregates happen in the admin query, not in the write path.
- **Share tracking: rate limit via existing middleware**: extend `src/middleware.ts` matcher to include `/api/track-share` with a dedicated limit branch (e.g., 60/hour/IP). Rationale: share events are cheap (one DB row each) but uncapped POSTs invite abuse. Reuse existing in-memory store pattern.
- **Tooltip click-to-pin**: swap highlighted `<span>` for `<button type="button">`. Show tooltip on `:hover`, `:focus-visible`, and tap-pin. Escape + click-outside dismiss pinned. Rationale: resolves the A3 requirement, keyboard-operable without adding a new library, handles touch natively.
- **Reduced-motion strategy**: wrap keyframe selectors (`@keyframes X`) and their consumers (`.animate-X`) in `@media (prefers-reduced-motion: no-preference) { ... }`. When a user prefers reduced motion, the animation declaration is absent and the element stays in its "from" state. Rationale: single-source approach, no JavaScript runtime check needed.
- **`focus-glow` rework**: remove the infinite `animation: focus-glow 4s ease-in-out infinite`. Replace with a one-shot 400ms color-transition + solid `outline` fallback. Keeps visual character of the cycling color without the repaint cost. Solid outline ensures WCAG-visible focus when the user opts out of motion.
- **Font migration order**: import fonts in `src/app/layout.tsx` with `next/font/google` using the `variable` option, apply combined variable classes to `<html>`, then update `@theme` in `globals.css` to reference the variables. Remove `@import url(...)` as the final step. Rationale: keeps @theme working throughout by using CSS variables as the bridge (current hardcoded font-family strings stop resolving once CDN @import is removed).
- **Admin shares view: extend existing admin page, not a new route**: add a `<SharesPanel>` section to `src/app/admin/page.tsx`. Rationale: single admin dashboard is easier to maintain than multiple gated routes; the share data volume is small enough to fit alongside the reports list.

## Open Questions

### Resolved During Planning

- Does share tracking need rate limiting? Yes, per-IP + global daily cap via the existing middleware pattern. See Unit 3 for specifics.
- Should `/admin/shares` be a new route or a section of existing `/admin`? Section. Simpler.
- Does the tooltip need click-to-pin or is focus-reveal enough? Click-to-pin. Matches A3's touch-reachable requirement.
- How to preserve candy pink visually while fixing link contrast? Token split (brand vs. link).
- Font-display strategy? `swap` with next/font's automatic fallback adjustment. Accept minor CLS on the score hero. the display font is not critical to first meaningful paint.
- SQL shape of the admin shares aggregate query? Server-side aggregation: endpoint returns `{ totalShares, sharesToday, shareRate, byScoreBand: [{ bandLabel, count, rate }...], events }` over a 14-day window. Score-band breakdown comes from joining `share_events` with `reports.results->>'score'->>'label'`. See Unit 4b.
- Rate-limit store: separate `Map` for share-tracking, distinct from the existing `/api/analyze` `ipStore`. Keyed by IP. Prevents share traffic from consuming analyze budget.
- Client transport for share tracking: `navigator.sendBeacon` with `fetch` POST fallback. `sendBeacon` survives tab unload/nav; `fetch` is the fallback path when sendBeacon is unavailable or rejects. Fire-and-forget on either path.
- `--color-link-pink` starting value: `oklch(55% 0.18 0)`. a desaturated darkened candy-pink that should reach ≥4.5:1 against `--color-surface-0`. If under 4.5:1 at implementation, drop lightness another step; if the color stops reading as pink, add underline-by-default to links as an additional distinction signal.
- CSRF posture for `/api/track-share`: JSON-body parse is the implicit CSRF defense (cross-origin form POSTs land as `application/x-www-form-urlencoded` and fail JSON parse). Endpoint requires `Content-Type: application/json` and validates body shape.

### Deferred to Implementation

- Exact `next/font` weight subset to load for Bricolage Grotesque and Hanken Grotesk. Start with 400/500/700 for Hanken, 400/600/700/800 for Bricolage optical sizes. Trim if bundle inspection shows waste.
- Whether `next/font` automatic fallback-metric adjustment is sufficient for the 140-180px score hero CLS, or if a manual fallback with explicit `ascent-override` / `size-adjust` is needed. Determine from Vercel preview after Unit 1 ships.

## Implementation Units

- [ ] **Unit 1: Typography migration. next/font + @theme bridge**

**Goal:** Replace the CDN `@import` font load with `next/font/google`, wire the fonts to Tailwind 4's `@theme` via CSS variables, swap Outfit for Hanken Grotesk.

**Requirements:** R4

**Dependencies:** None

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

**Approach:**
- Import Bricolage Grotesque, Hanken Grotesk, and JetBrains Mono from `next/font/google` at the top of `src/app/layout.tsx`.
- Use the `variable` option to expose each as a CSS variable: `--font-bricolage`, `--font-hanken`, `--font-jetbrains-mono`.
- Apply the combined variable classes to the `<html>` element.
- In `src/app/globals.css`, remove the `@import url(...)` line. Update the `@theme` font-family tokens from hardcoded strings to `var(--font-hanken), system-ui, sans-serif` (for `--font-sans`), `var(--font-bricolage), system-ui, sans-serif` (for `--font-display`), and `var(--font-jetbrains-mono), ui-monospace, monospace` (for `--font-mono`).
- No component changes needed; existing `font-sans`, `font-display`, `font-mono` Tailwind utility classes continue to resolve.
- Font-display: `swap` (next/font default with `display: 'swap'`). Accept automatic fallback-metric adjustment.
- **OG image font check**: `src/app/report/[slug]/opengraph-image.tsx` runs in a Satori `ImageResponse` context that does not inherit the `<html>` font variables. Before merge, inspect the OG route: if it currently relies on the CDN `@import` in `globals.css` for Bricolage, add explicit font loading via `fetch + arrayBuffer` with the `fonts` option on `ImageResponse`. If it already uses explicit font bytes or accepts a fallback sans-serif, no change needed. PR 2 will update the OG image template itself; this step only prevents a silent font regression in PR 1.

**Patterns to follow:**
- Tailwind 4 `@theme` CSS variable references (existing pattern in `globals.css:4-21`).

**Test scenarios:**
- Happy path: page loads, body text renders in Hanken Grotesk (system fallback swaps to Hanken after font fetch completes), no `@import` network call in devtools Network tab.
- Happy path: display headings render in Bricolage Grotesque with the existing variable-width character.
- Happy path: mono labels render in JetBrains Mono (unchanged from before).
- Edge case: page loads with slow network. fallback font (system sans) displays first, then swaps without layout collapse.
- Integration: `@theme` tokens resolve to the correct `var(--font-*)` values; no regression on `font-sans` / `font-display` / `font-mono` utility classes.
- Regression: Outfit no longer appears anywhere in the codebase (grep check); `@import url(...)` removed from globals.css.

**Verification:**
- Network tab shows no `fonts.googleapis.com` request on page load.
- Hanken Grotesk is the computed `font-family` on body in devtools.
- Score hero renders in Bricolage at fluid size (confirmed when Unit 4 ships; in this unit, any existing fixed size still works).

---

- [ ] **Unit 2: Color token split + tier-3 badge contrast fix**

**Goal:** Split `--color-candy-pink` into `--color-brand-pink` (original vivid) and `--color-link-pink` (darkened) to fix WCAG AA link contrast without shifting brand color on OG images and buttons. Fix Tier 3 severity badge (white text on candy-yellow background) by switching to dark text.

**Requirements:** R1, R10

**Dependencies:** None (parallel to Unit 1)

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/page.tsx` (line 257, link to `/tropes`)
- Modify: `src/app/tropes/page.tsx` (line 52, link to `/`)
- Modify: `src/app/report/[slug]/page.tsx` (line 117, link to `/tropes`)
- Modify: `src/components/report/TropeCard.tsx` (tier-3 badge text color logic)

**Approach:**
- In `src/app/globals.css` `@theme` block, rename `--color-candy-pink` to `--color-brand-pink`, then add `--color-candy-pink: var(--color-brand-pink)` as an alias so existing Tailwind classes continue to work without component refactoring.
- Add `--color-link-pink: oklch(…)` with a value one OKLCH lightness step darker than brand; verify 4.5:1 against `--color-surface-0` (`#FAF9F6`) before committing the exact value.
- Add a Tailwind utility: `text-link-pink`, `hover:text-link-pink`. Apply only to the three link sites listed above, replacing `text-candy-pink`.
- In `TropeCard.tsx`, add a conditional: if `trope.tier === 3`, use dark ink text on the candy-yellow badge (existing `text-white` becomes e.g. `text-zinc-900`). All other tiers keep `text-white` (verify contrast on each; update any others that fail).

**Patterns to follow:**
- Tailwind 4 `@theme` custom-color pattern in `globals.css:14-20`.
- Severity badge conditional rendering in `TropeCard.tsx:39-46` (tier-based styling).

**Test scenarios:**
- Contrast: automated check. `--color-link-pink` on `--color-surface-0` passes 4.5:1.
- Contrast: automated check. Tier 3 badge text-on-background passes 4.5:1 (dark ink on candy-yellow).
- Contrast: all other tier badges (1, 2, 4, 5) verified at 4.5:1 minimum; any additional failures get ink text.
- Regression: Analyze button, primary CTAs, OG image, pink glow shadows all render with unchanged brand-pink (visual check + grep `candy-pink` still references brand).
- Regression: three link sites (landing, taxonomy, report) now render in darker link-pink; visually distinguishable from buttons.
- Integration: OG image preview (at a shared report URL) still shows original vivid pink. no brand-continuity break on already-shared reports.

**Verification:**
- WCAG contrast checker passes on all text-link-pink / candy-yellow-badge pairings.
- No visual change on Analyze button or OG image.

---

- [ ] **Unit 3: Share-event schema, POST endpoint, rate limit, and admin indexes**

**Goal:** Add `share_events` table with indexes, `POST /api/track-share` endpoint with slug validation and global cap, middleware rate limiting for the new route using a dedicated store. Bootstrap Drizzle migrations against the existing production DB safely.

**Requirements:** R6

**Dependencies:** None (parallel to Units 1 and 2)

**Files:**
- Modify: `src/db/schema.ts`
- Create: `src/app/api/track-share/route.ts`
- Modify: `src/middleware.ts`
- Create: `drizzle/` directory contents (generated baseline + share_events migration)

**Approach:**
- **Drizzle baseline first.** The `drizzle/` directory does not exist yet; the production DB already has a `reports` table from `db:push`. Running `db:generate` against this state would emit `CREATE TABLE reports` in the first migration, which fails on apply. Two acceptable paths: (a) run `drizzle-kit introspect` (or `drizzle-kit pull`) against the production DB first to seed `drizzle/meta/_journal.json` with the existing schema baseline, commit that, then run `db:generate` so the delta contains only `share_events`; OR (b) hand-write the baseline migration representing the current `reports` schema, mark it as applied in `__drizzle_migrations` on prod manually, then run `db:generate` for share_events. Path (a) is preferred; path (b) is the fallback if introspect produces noise.
- Add `share_events` table to `src/db/schema.ts`: `id uuid primary key default random`, `report_slug text not null`, `method text not null` (`'clipboard' | 'native'`), `created_at timestamp default now`. Add composite index on `(report_slug, created_at)` and single index on `created_at desc` for admin query performance. No foreign key to `reports.slug`. keeping write path cheap, validation happens in the handler (below).
- Create `src/app/api/track-share/route.ts`: POST handler, require `Content-Type: application/json` header (reject otherwise with 415), parse JSON body, validate `reportSlug` (non-empty string) and `method` (`in ['clipboard', 'native']`). Before insert, verify the slug exists in `reports` (single SELECT by slug. cheap, indexed). If slug not found, return 404 quietly. Otherwise insert into `share_events`, return `{ ok: true }` with 200. Return 400 on body-shape failures.
- Extend `src/middleware.ts` `config.matcher` to include `/api/track-share`. Add a dedicated `shareIpStore = new Map<string, RateEntry>()` separate from `ipStore` so share traffic does not consume the analyze budget. Per-IP limit tunable via env var `TRACK_SHARE_IP_LIMIT` (default 60/hour). Add a global daily cap mirroring the existing `globalCount` pattern: `TRACK_SHARE_GLOBAL_CAP` env var (default 5000/day). Reuse `getClientIp`. Document that IP-based rate limiting trusts Vercel edge to set `X-Forwarded-For`; if hosting changes, re-evaluate.
- Run `npm run db:generate` AFTER baseline is established to produce the migration SQL for `share_events` only; commit the generated file in `drizzle/`.
- Do not run `db:push` locally on production DB; migrations apply via `db:migrate` against production on deploy.

**Execution note:** Test-first on the route handler. Write the request/response contract test first, then implement.

**Patterns to follow:**
- POST endpoint with JSON body parsing and validation: `src/app/api/analyze/route.ts:12-50`.
- Drizzle table declaration: `src/db/schema.ts:3-11`.
- Middleware rate-limit branch pattern: `src/middleware.ts:47-115`.

**Test scenarios:**
- Happy path: POST `/api/track-share` with `{ reportSlug: "abc123", method: "clipboard" }` (where `abc123` exists in `reports`) returns 200 `{ ok: true }` and inserts one row into `share_events`.
- Happy path: POST with `method: "native"` and an existing slug also inserts one row.
- Edge case: POST with empty `reportSlug` returns 400 with error message.
- Edge case: POST with `method: "something-else"` returns 400.
- Edge case: POST with malformed JSON body returns 400.
- Edge case: POST without `Content-Type: application/json` returns 415.
- Edge case: POST with `reportSlug` that does not exist in `reports` returns 404, no row inserted.
- Error path: database write failure propagates as 500 (or handler returns a graceful 500. verify no unhandled rejection).
- Rate limit: IP limit + 1 requests from the same IP within an hour returns 429 with `Retry-After` header.
- Rate limit: global daily cap + 1 requests across all IPs within a 24h window returns 429.
- Rate limit: the existing `/api/analyze` rate limit is unaffected by the new branch (share traffic does not deplete analyze budget).
- Integration: baseline migration step succeeds (introspect-then-generate produces a migration containing only `CREATE TABLE share_events` + indexes, not `reports`).
- Integration: `db:migrate` against a staging DB applies cleanly without re-creating `reports`.

**Verification:**
- POST endpoint returns 200 and DB row appears.
- Rate limit returns 429 after threshold.
- No regression on `/api/analyze` or `/api/reanalyze` rate limits.

---

- [ ] **Unit 4a: Share tracking client integration**

**Goal:** Fire tracking calls from `ShareBar` on successful share actions using `sendBeacon` with `fetch` fallback. Ensures events survive tab unload / navigation after native share.

**Requirements:** R6

**Dependencies:** Unit 3

**Files:**
- Modify: `src/components/report/ShareBar.tsx`
- Modify: `src/app/report/[slug]/page.tsx` (thread slug prop)

**Approach:**
- In `ShareBar.tsx`, add a `trackShare(method)` helper:
  - Prefer `navigator.sendBeacon('/api/track-share', blob)` where `blob` is a `Blob([JSON.stringify({ reportSlug, method })], { type: 'application/json' })`. `sendBeacon` queues the request past tab unload and is the correct transport for fire-and-forget tracking.
  - If `sendBeacon` returns `false` (queue rejected) OR `navigator.sendBeacon` is undefined, fall back to `fetch('/api/track-share', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(...), keepalive: true })`. The `keepalive: true` flag lets fetch survive page unload in supporting browsers.
  - Swallow all errors on both paths. Tracking must never affect UX.
- Pass the report slug via a new `slug` prop on `<ShareBar>`, threaded from `src/app/report/[slug]/page.tsx:84`.
- In `handleCopy`, call `trackShare('clipboard')` after successful copy.
- In `handleShare`, call `trackShare('native')` in the try branch (after `navigator.share` resolves); also call it when falling back to `handleCopy` (method='clipboard' in that case).

**Patterns to follow:**
- Existing `ShareBar.tsx:13-28` try/catch structure for graceful browser-API fallbacks.
- `navigator.sendBeacon` is a standard browser API; no library needed.

**Test scenarios:**
- Happy path: clicking "copy link" fires `sendBeacon` with `method: "clipboard"` and the report slug; UX transition to "copied" state is unchanged.
- Happy path: clicking "share" on a device that supports `navigator.share` fires `sendBeacon` with `method: "native"` after the native share sheet resolves.
- Happy path: on a device without `navigator.share`, clicking "share" falls back to copy and fires `sendBeacon` with `method: "clipboard"`.
- Happy path: when the user taps the native share sheet and the OS immediately backgrounds the page, the `sendBeacon` request still lands in the DB (verify on iOS Safari specifically).
- Fallback: on a browser without `sendBeacon` (or when `sendBeacon` returns `false`), `fetch` with `keepalive: true` runs.
- Error path: if both `sendBeacon` and `fetch` fail silently, no UI impact. the "copied" transition still fires.
- Regression: no new network activity visible when the report page loads (only on user action).

**Verification:**
- Share row appears in DB after copy or share click.
- Share row appears even when user navigates away immediately after tapping native share.
- No UX regression on the share interaction.

---

- [ ] **Unit 4b: Admin shares API + SharesPanel**

**Goal:** Add a read-only admin API and UI panel showing share events + aggregate rate with score-band breakdown.

**Requirements:** R6

**Dependencies:** Unit 3, Unit 4a (no strict dependency on 4a ordering, but 4a gives real data to test against)

**Files:**
- Create: `src/app/api/admin/shares/route.ts`
- Modify: `src/app/admin/page.tsx`

**Approach:**
- Create `src/app/api/admin/shares/route.ts` mirroring `src/app/api/admin/reports/route.ts`: session check via `isValidSession(request)`, returns `{ totalShares, sharesToday, shareRate, byScoreBand, events }` for a 14-day window where:
  - `totalShares`: count of `share_events` in the window.
  - `sharesToday`: count of `share_events` with `created_at >= today-utc-midnight`.
  - `shareRate`: `totalShares / totalReports` where `totalReports` is the count of `reports` in the same 14-day window.
  - `byScoreBand`: array of `{ bandLabel, shareCount, reportCount, rate }` joining `share_events.report_slug` with `reports.slug` and pulling the label from `reports.results->'score'->>'label'`. Restores the origin-doc ST3 score-band breakdown.
  - `events`: LIMIT 500, ordered by `created_at desc`. Paginated when the table grows; 500 is a pragmatic cap for the v1 view.
- Add a `<SharesPanel>` section to `src/app/admin/page.tsx` that fetches `/api/admin/shares` on mount (behind the existing login gate. reuse the auth state from the existing page; don't fetch until authed). Renders a header stats row (total / today / overall rate / per-band rates) followed by a table: `report_slug | method | created_at`.
- Visual treatment matches the existing reports table in `admin/page.tsx:113-169`: `rounded-xl border border-zinc-200 bg-white` wrapper, `font-mono uppercase tracking-wider text-zinc-500` headers, `hover:bg-surface-2/50` row hover. No new design language introduced in PR 1.
- Section placement: below the existing reports table. No refactor of the existing panel.

**Patterns to follow:**
- Admin route auth: `src/app/api/admin/reports/route.ts:8-11`.
- Existing admin page client-side fetch + login-gate pattern (read `src/app/admin/page.tsx` to mirror).
- Existing reports-table markup: `src/app/admin/page.tsx:113-169`.

**Test scenarios:**
- Admin: GET `/api/admin/shares` returns 401 when not authenticated.
- Admin: GET with a valid admin session returns all five fields (`totalShares`, `sharesToday`, `shareRate`, `byScoreBand`, `events`).
- Admin: `events` array caps at 500 rows.
- Admin: `byScoreBand` contains one entry per distinct score label in the window; entries without shares have `shareCount: 0` and `rate: 0`.
- UI: SharesPanel fetches only after login; unauthenticated view does not make the request.
- UI: table renders with the existing admin visual language.
- UI: aggregate stats render above the table.
- Integration: a share fired from ShareBar (Unit 4a) appears in SharesPanel within seconds.
- Perf: at 10k rows, the API query returns in <1s (assumes index on `created_at desc` from Unit 3).

**Verification:**
- Panel renders, stats update with real activity.
- Score-band breakdown reflects the join correctly.

---

- [ ] **Unit 5: Form, status, and animation a11y**

**Goal:** Add labels to all form inputs, `role="alert"` to the error container, `aria-live` to the loading message, `aria-busy` to the Analyze button, and wrap all keyframe animations in `prefers-reduced-motion` guards.

**Requirements:** R3, R8

**Dependencies:** None (parallel)

**Files:**
- Modify: `src/components/input/TextInput.tsx`
- Modify: `src/components/input/UrlInput.tsx`
- Modify: `src/components/input/ScreenshotInput.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`

**Approach:**
- In each input component, wrap the form element in a `<label>` with a visually-hidden span (use `sr-only` Tailwind utility) describing the field purpose. Alternatively, add `aria-label` to the input. Prefer `<label>` for stronger semantics.
- In `src/app/page.tsx:249-253` (error container), add `role="alert"` to the `<div>`.
- In `src/app/page.tsx:220-226` (loading message span), wrap in a container with `aria-live="polite"` and `aria-atomic="true"`.
- Add `aria-busy={loading}` to the Analyze button at `src/app/page.tsx:208-218`.
- In `src/app/globals.css`, wrap every `@keyframes` declaration and its `.animate-*` consumer in `@media (prefers-reduced-motion: no-preference) { ... }`. Covers: `blob-float`, `blob-float-alt`, `blob-pulse`, `score-reveal`, `card-enter`, `focus-glow`, bounce-dot `@keyframes`. When reduced motion is set, elements stay in the `from` state of their animation.
- **Card-enter fallback**: `.animate-card-enter` at `globals.css:151-154` currently sets `opacity: 0` as its base style before the animation runs (the animation's `forwards` fill reveals it). If only the keyframes get wrapped, reduced-motion users see invisible cards permanently. Fix: move `opacity: 0` INSIDE the `@media (prefers-reduced-motion: no-preference)` block, so the reduced-motion default is `opacity: 1` and the animation is simply skipped. Apply the same pattern to `.animate-score-reveal` if it has a base `opacity: 0` (verify during implementation).
- **Focus-glow coordination with Unit 6**: Unit 6 replaces the infinite `focus-glow` animation with a one-shot transition. Both the original `@keyframes focus-glow` and Unit 6's replacement transition declaration live INSIDE the `@media (prefers-reduced-motion: no-preference)` block. When reduced motion is set, users see the solid `outline` fallback from Unit 6 without any transition or animation.

**Patterns to follow:**
- Visually-hidden labels: Tailwind's `sr-only` class (built-in utility).
- Live regions: standard ARIA patterns (no library needed).

**Test scenarios:**
- A11y: screen reader announces "paste something suspicious, text area" (or similar) when textarea is focused.
- A11y: screen reader announces the URL field and screenshot drop zone by their purpose.
- A11y: triggering an analyze error causes the screen reader to announce the error text.
- A11y: during loading, screen reader announces the cycling messages ("Reading the text...", "Scanning for patterns...", "Scoring the results...") as they change.
- A11y: Analyze button is announced as "busy" while loading.
- Reduced-motion: set browser to `prefers-reduced-motion: reduce`; verify blobs don't move, score-reveal stays in final state, card-enter reveals cards at `opacity: 1` (not invisible), loading dots don't bounce, focus-glow shows solid outline only (no color transition, no animation).
- Reduced-motion: `animate-card-enter` cards ARE VISIBLE under reduced motion (regression-proof the opacity fallback).
- Regression: with `prefers-reduced-motion: no-preference` (default), all existing animations still run at previous behavior.

**Verification:**
- Lighthouse a11y score improves.
- Manual screen reader check (VoiceOver or equivalent) confirms announcements.
- `@media (prefers-reduced-motion)` queries visible in dev inspector CSS panel.

---

- [ ] **Unit 6: Drop zone keyboard + tooltip click-to-pin + focus-glow rework**

**Goal:** Make the screenshot drop zone keyboard-operable, rewrite the highlighted-text tooltip to be focus-reachable and touch-reachable with click-to-pin, and replace the infinite `focus-glow` animation with a one-shot transition and solid outline fallback.

**Requirements:** R2, R9, R12

**Dependencies:** None (parallel to Unit 5)

**Files:**
- Modify: `src/components/input/ScreenshotInput.tsx`
- Modify: `src/components/report/HighlightedText.tsx` (tooltip rewrite + the `useMemo` optimization moved from Unit 7. single owner of this file)
- Modify: `src/app/globals.css`

**Approach:**
- In `ScreenshotInput.tsx:119-150`, change the drop zone `<div onClick={...}>` to `<div role="button" tabIndex={0} onClick={...} onKeyDown={...}>`. The `onKeyDown` handler: if `e.key === 'Enter' || e.key === ' '`, call `e.preventDefault()` then trigger the file input click. Add `aria-label="Upload screenshot"`.
- In `HighlightedText.tsx:268-286`, swap the highlighted `<span>` for `<button type="button">`. Add a new piece of state `pinnedTropeId: string | null` alongside existing `hoveredTropeId`. Use CSS `:focus-visible` in the stylesheet to show the tooltip on focus (keeps the DOM rendering pattern consistent without a third React state). The tooltip-content `<span>` is always in the DOM but visually hidden (`opacity: 0; pointer-events: none`) unless hovered, pinned, or its associated button matches `:focus-visible`.
- On click, toggle `pinnedTropeId`. On `Escape` keydown (when pinned), clear it. Add a global click listener on `document` (mousedown, not click. fires before focus changes) that clears `pinnedTropeId` when the target is outside any highlighted button AND outside the tooltip content node. Call `e.stopPropagation` only when dismissing, so link clicks on links adjacent to tooltips still navigate.
- Add `aria-describedby` linking the button to its tooltip-content `<span id={...}>`.
- **Roving tabindex** for the highlighted-text region: the container uses `role="group"` with `aria-label="Detected writing tropes"`. The first highlighted button has `tabIndex={0}`; all subsequent highlights have `tabIndex={-1}`. Arrow keys (`ArrowLeft`, `ArrowRight`) move between highlights within the region by updating the active tabindex and calling `.focus()` on the target. `Home` moves to the first highlight; `End` moves to the last. `Tab` exits the region to the next interactive element on the page. This keeps a long report's highlighted span out of the default tab sequence (one tab stop enters, Tab again exits) while preserving keyboard navigation among highlights. Pattern reference: ARIA Authoring Practices "Toolbar" / "Grid" composite-widget pattern.
- Wrap the `buildHighlights(sourceText, tropeResults)` call in `useMemo(() => buildHighlights(sourceText, tropeResults), [sourceText, tropeResults])` (moved from former Unit 7. Unit 6 is the sole owner of `HighlightedText.tsx` in PR 1). Parent is a server component, so prop refs are stable.
- In `globals.css:160-186`, remove `animation: focus-glow 4s ease-in-out infinite` on `.focus-glow:focus`. Replace with a one-shot 400ms transition on `box-shadow` + `border-color` that fires on focus-in and settles into the final candy-pink ring. Both the replacement transition and any residual `@keyframes focus-glow` live inside the `@media (prefers-reduced-motion: no-preference)` block from Unit 5. Add `outline: 2px solid var(--color-brand-pink); outline-offset: 2px;` OUTSIDE the media query as a WCAG-visible fallback that works in both motion contexts.

**Patterns to follow:**
- Button-as-interactive-element pattern (existing `<button>` usage throughout the codebase).
- State-driven tooltip visibility (existing `hoveredTrope` state in `HighlightedText.tsx:218`).

**Test scenarios:**
- Keyboard: Tab focus reaches the drop zone; pressing Enter opens the file picker.
- Keyboard: pressing Space while drop zone is focused opens the file picker.
- A11y: screen reader announces drop zone as a button with label "Upload screenshot".
- Tooltip: hover on highlighted word shows tooltip (unchanged behavior).
- Tooltip: Tab focus on the FIRST highlighted word (entry to the region) reveals its tooltip.
- Roving tabindex: arrow keys move focus between highlights within the region; Tab exits the region to the next interactive element (does NOT land on the next highlight).
- Roving tabindex: `Home` focuses the first highlight, `End` focuses the last.
- Roving tabindex: screen reader announces the region as "Detected writing tropes, group" on entry.
- Tooltip: click on highlighted word pins the tooltip open.
- Tooltip: Escape dismisses pinned tooltip.
- Tooltip: click outside any highlight dismisses pinned tooltip.
- Tooltip: touch tap pins tooltip (iOS / Android Safari/Chrome).
- Tooltip: `aria-describedby` links button to content; screen reader announces trope name when the button is focused.
- Focus-glow: on focus, input shows one-shot color transition; animation does not repeat.
- Focus-glow: with `prefers-reduced-motion: reduce`, the one-shot transition is also suppressed and only the solid outline shows.
- Regression: clicking the drop zone still opens the file picker (mouse path unchanged).
- Perf: hovering a highlighted word does not re-run `buildHighlights` (verify via React DevTools profiler or console.log added-then-removed).
- Integration: with a tooltip pinned, single-tap on the footer "Analyze another text" link navigates on first tap without requiring a second tap (iOS Safari specifically. no double-tap issue). The global dismissal handler does not eat the link click.

**Verification:**
- Keyboard-only navigation through the entire app succeeds.
- Tooltip works on desktop hover, keyboard focus, touch tap, with Escape dismissal.
- Performance: `focus-glow` no longer shows continuous box-shadow animations in DevTools Performance tab.

---

- [ ] **Unit 7: Responsive polish and fluid score sizing**

**Goal:** Swap native `<img>` to `next/image` for the logomark, enlarge clear-file X button and footer links to 44×44px touch targets, and apply fluid sizing to the score hero. (The `buildHighlights` memoization moved into Unit 6 to keep a single owner on `HighlightedText.tsx`.)

**Requirements:** R5, R11, R12

**Dependencies:** None (parallel)

**Files:**
- Modify: `src/app/page.tsx` (logomark, footer links)
- Modify: `src/app/tropes/page.tsx` (logomark, footer links)
- Modify: `src/app/report/[slug]/page.tsx` (logomark, footer links)
- Modify: `src/components/input/ScreenshotInput.tsx` (clear-file X button)
- Modify: `src/components/report/ScoreHero.tsx` (fluid score sizing)

**Approach:**
- Replace `<img src="/dxn-logomark.png" alt="Dixon Strategic Labs" />` with `import Image from 'next/image'` + `<Image src="/dxn-logomark.png" alt="Dixon Strategic Labs" width={20} height={20} />` across the three pages.
- In `ScreenshotInput.tsx:100-113`, enlarge the clear-file X button: change `p-2` to `p-3` and ensure the total hit area reaches 44×44px (if icon is 14px and padding is 15px, total is 44px). Visually the icon stays the same size; only the clickable area grows.
- In footer links across the three pages: wrap each inline `<a>` in appropriate display to accept padding. Add `inline-block min-h-[44px] px-3 py-3` (or equivalent; verify 44×44 at computed size). For the combo logomark+text link, ensure the wrapping anchor reaches 44×44 via padding on the anchor itself.
- In `ScoreHero.tsx:25-29`, change the score number's fixed `text-[140px] sm:text-[180px]` to fluid `style={{ fontSize: 'clamp(6rem, 22vw, 11rem)' }}` (or a Tailwind arbitrary value: `text-[clamp(6rem,22vw,11rem)]`).

**Patterns to follow:**
- `useMemo` with dependency array: standard React pattern.
- `next/image` with explicit width/height: Next 16 docs / existing Next patterns.
- Tailwind arbitrary values for `clamp()`: `text-[clamp(...)]` syntax.

**Test scenarios:**
- Perf: logomark image loads as WebP (verify in Network tab) on devices that support it.
- Perf: Lighthouse perf score improves; no CLS on logomark.
- Touch: clear-file X button hit area measures ≥44×44 in DevTools (device toolbar).
- Touch: footer links "See all 42 tropes", "Analyze text", "Analyze another text", and the Dixon Strategic Labs attribution each measure ≥44×44.
- Responsive: score hero number scales smoothly between 320px viewport (shows 6rem) and 1440px viewport (shows 11rem).
- Responsive: at 320px viewport, score hero does not overflow horizontally.
- Responsive: at 1440px viewport, score hero does not exceed 11rem (no gap growth).
- Regression: logomark renders correctly on all three pages; no broken image.
- Regression: hit area enlargements do not cause adjacent elements to overlap or shift (visual check).

**Verification:**
- DevTools measures all named touch targets at ≥44×44.
- `next/image` delivers optimized format.
- `useMemo` prevents recomputation on unrelated re-renders.
- Score hero fluidly scales with viewport width.

## System-Wide Impact

- **Interaction graph:** New `/api/track-share` endpoint interacts with the existing rate-limit middleware and the Drizzle write path. `ShareBar` now has a side effect (network call) on share actions; kept fire-and-forget so it cannot block UX.
- **Error propagation:** Tracking errors are swallowed client-side (fire-and-forget). Route handler errors return structured JSON matching existing API shape. Admin fetch errors display a simple error state in the admin panel.
- **State lifecycle risks:** No persistent client state added except `pinnedTropeId` in `HighlightedText`. Global click-outside listener added for tooltip dismissal must be cleaned up on unmount.
- **API surface parity:** No breaking changes to existing APIs. New `/api/track-share` and `/api/admin/shares` are additive.
- **Integration coverage:** End-to-end verification that a share click writes a DB row and appears in `/admin/shares` is the primary integration test.
- **Unchanged invariants:** Candy color palette, decorative blobs, gradient mesh, glow shadows, gradient button class, BAN 1 left-stripes, existing score hero layout, existing trope card layout, OG image template, 404 page, landing copy, rate limits on `/api/analyze` and `/api/reanalyze`. all preserved. PR 2 changes them.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| `next/font` automatic fallback-metric adjustment leaves visible CLS on the score hero at 140-180px. | Accept minor CLS; score hero is below the fold and not first meaningful paint. If user complaint surfaces, add manual `ascent-override` / `size-adjust` for Bricolage in a follow-up. |
| Token rename (`--color-candy-pink` → `--color-brand-pink` alias) misses a consumer that references the hex directly. | Grep for `#EC4899` across the repo before merge; replace any direct hex with `var(--color-brand-pink)`. Note: `rgba(244, 63, 94, ...)` in `globals.css` is `#F43F5E` (rose-500), NOT candy-pink. leave those alone in PR 1; they are a known color inconsistency that PR 2's palette consolidation will address. |
| `@keyframes` wrapped in `@media (prefers-reduced-motion)` regresses default animation if Tailwind's `animate-*` class is defined outside the media query but the keyframes are inside. | Both the `.animate-*` selector and the `@keyframes` live INSIDE the media query block. Base-state fallbacks (like `opacity: 0` on `.animate-card-enter`) also move inside the block so reduced-motion users see the final visible state. Verify animation still runs with default settings in DevTools after Unit 5 ships. |
| Global click-outside listener for tooltip dismissal eats link navigation when a user taps an adjacent link with a tooltip pinned (iOS Safari tap-delay specifically). | Listener uses `mousedown` (before focus changes), checks target is outside both button AND tooltip content, does not call `stopPropagation` on the original event so link clicks still navigate. Explicit test scenario for iOS link interaction in Unit 6. |
| Share-event per-IP rate limit too tight for legitimate users (e.g., users who click share multiple times while the UI is transitioning). | `TRACK_SHARE_IP_LIMIT` env var (default 60/hour) allows tuning without deploy. 1/minute average is generous for human behavior. Monitor `/admin/shares` for 429 feedback. |
| `sendBeacon` fails silently (returns `false` or throws). | Fallback to `fetch` with `keepalive: true`. Neither path surfaces errors to the user; baseline biased downward is acceptable for directional gate use. See F4 in Cross-PR Notes. |
| Abusive scripted POSTs pollute `share_events` with fabricated slugs, skewing PR 2's baseline. | Handler validates slug exists in `reports` before insert (extra SELECT per request, cheap with indexed `slug`). Global daily cap (`TRACK_SHARE_GLOBAL_CAP`, default 5000/day) bounds total writes regardless of IP count. |
| First-ever Drizzle migration emits `CREATE TABLE reports` against a prod DB that already has it. | `drizzle-kit introspect` runs FIRST to snapshot the existing schema as baseline; `db:generate` only after that produces the share_events-only migration. Handwritten migration is the fallback path if introspect output is noisy. |
| OG image `ImageResponse` loses Bricolage when the CDN `@import` is removed in Unit 1 (font variables don't inherit into Satori). | Unit 1 includes an explicit check of `src/app/report/[slug]/opengraph-image.tsx` for font usage; if it currently relies on the `@import`, add explicit `fetch + arrayBuffer` font loading with the `fonts` option on `ImageResponse`. |
| Rate-limiter in-memory store is per-serverless-instance on Vercel. cold-start creates a fresh counter, effectively multiplying the per-IP cap. | Documented limitation shared with existing `/api/analyze` limit. Global daily cap provides coarse upper bound. If virality arrives, migrate to Redis/KV; out of scope for PR 1. |

## Documentation / Operational Notes

- **Migration deploy**: PR 1 includes Drizzle migrations (baseline + share_events). Production deploy sequence: (1) run `drizzle-kit introspect` to capture existing prod schema as baseline, commit that; (2) run `db:generate` for share_events; (3) run `db:migrate` against a staging DB to verify; (4) run against production before or alongside code deploy. Vercel build hook can run the final migrate step.
- **Environment variables**: new variables `TRACK_SHARE_IP_LIMIT` (default 60) and `TRACK_SHARE_GLOBAL_CAP` (default 5000) allow rate-limit tuning without redeploy. Set in Vercel dashboard.
- **Rate-limit observability**: the existing in-memory rate limiter has no persistence. on redeploy, counters reset. Acceptable for share tracking (cheap operation). Document in admin page header that baseline collection starts at deploy time.
- **PROJECT_STATUS update**: after PR 1 ships, update `PROJECT_STATUS.md` to note the a11y pass, next/font migration, pink token split, share-event tracking, and the new env vars. Follow existing "Recent Changes" section style.
- **Baseline collection window**: per the origin document, PR 2's acceptance gate needs at least 14 days of `share_events` data and ≥30 total events. Clock starts on PR 1 merge.
- **X-Forwarded-For trust**: IP-based rate limiting on `/api/track-share` inherits the same trust model as `/api/analyze`. relies on Vercel edge setting the last value in X-Forwarded-For. If hosting changes, re-evaluate.
- **Privacy posture (decided 2026-04-17)**: `share_events` stores only anonymous data (`report_slug` = nanoid, `method`, `created_at`. no user ID, no IP in the row, IP used only in-memory for rate limiting). Decision: ship without additional consent mechanism or privacy policy page. Trace data is anonymous enough that the risk threshold doesn't justify the UX cost of a banner or disclosure. If the product acquires meaningful EU traffic or a user specifically asks about logging, revisit.
- **Deprecation path if PR 2 terminates**: per the origin document's 60-day termination clause, if PR 2 is abandoned, file a follow-up issue to deprecate `/api/track-share`, the SharesPanel, and the `share_events` table. Share instrumentation has no standalone product value; its purpose is to feed PR 2's gate.
- **P5 from origin doc (backdrop-blur audit)**: moved to PR 2 Deferred. The existing `backdrop-blur-sm` in nav surfaces is tied to the visual decoration that PR 2 removes; auditing it in PR 1 has no action.

## Sources & References

- **Origin document:** `docs/brainstorms/2026-04-17-editorial-redesign-requirements.md`
- Related files (codebase patterns): `src/app/api/analyze/route.ts`, `src/app/api/admin/reports/route.ts`, `src/middleware.ts`, `src/db/schema.ts`, `src/app/globals.css`
- Impeccable audit (generated earlier in this session): scored 8/20, identified the objective failures this PR addresses.
- Document review passes (generated earlier in this session): consensus on two-PR split, instrumentation-first approach.
