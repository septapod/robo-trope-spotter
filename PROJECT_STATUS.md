# Robo Trope Spotter

**Status:** Live at robotropes.dxn.is. Active plan: Launch Sprint (Phase 1, U1 in progress) — see `docs/plans/2026-04-30-001-feat-launch-sprint-plan.md`.

## What It Is
A social diagnostic tool that identifies AI writing tropes in pasted text and produces a shareable, playful report card. Paste text, get a report, send it to someone who needs it.

## What's Done
- [x] MVP built and deployed to Vercel (robotropes.dxn.is)
- [x] LLM-primary analysis using Claude Sonnet 4.6 with full 42-trope taxonomy
- [x] Three input modes: text paste, URL extraction, screenshot OCR
- [x] Shareable report cards with unique URLs and OG image previews
- [x] Inline highlighted text showing where tropes appear in context
- [x] Density-normalized scoring (weighted by severity, normalized per 500 words)
- [x] Visual scale bar showing where score falls on clean-to-heavy spectrum
- [x] Typography: Bricolage Grotesque (display) + Hanken Grotesk (body) + JetBrains Mono (data), loaded via next/font
- [x] Bold candy color palette (pink, yellow, orange, teal, green, purple, blue)
- [x] Human-readable severity labels: Dead Giveaway, Red Flag, Worth Noting, Subtle Tell, Deep Cut
- [x] Supplemental em dash highlighting (catches all instances, not just LLM-quoted ones)
- [x] SSRF protection, input size limits, proper error surfacing
- [x] Custom favicon, branded 404 page, light-theme OG images
- [x] Reanalyze endpoint for updating old reports with new scoring (admin-only)
- [x] Rate limiting: 20/IP/hour, 500/day global on analysis endpoints
- [x] Admin dashboard with session-based auth
- [x] Two-pass LLM pipeline: Sonnet detection + Haiku validation (rejects false positives)

## Recent Changes
- [x] **Drizzle migration baseline bootstrapped** -- ran `drizzle-kit introspect` against prod, committed `drizzle/0000_silky_harrier.sql` (commented-out baseline) and `drizzle/meta/` (journal + snapshot). Removed `/drizzle/meta` from `.gitignore` since bookkeeping has to travel with migrations. Future `db:generate` runs emit clean deltas from this baseline.
- [x] **Systematic WCAG AA contrast pass** -- swept all remaining color-on-light failures after the initial audit. `text-candy-pink` on white (3.5:1) moved to `text-link-pink` in every small-text context (admin stat, admin slug links, landing eyebrow, nav hovers, ShareBar, AllDetections, UrlInput active). `text-candy-teal` (2.8:1) and `border-candy-teal` moved to `teal-700` in ScreenshotInput. `text-emerald-600` on emerald-50 (3.6:1) moved to emerald-700. `placeholder-zinc-400` (2.9:1) moved to `placeholder-zinc-500`.
- [x] **TropeCard contrast hotfix** -- quote text and count pill used `trope.color` as text on colored tint, failing AA for yellow/lime/green/orange tiers. Quote text now `text-zinc-900`; count pill uses solid tier-color bg with tier-conditional zinc-900/white ink. Tropes page tier labels moved to zinc-600. ScoreHero added `getLabelInkColor()` returning the 700-level shade per label (all six pass >=4.5:1 on surface-0).
- [x] **Review-round P1/P2 fixes** -- capped `reportSlug` at 128 chars in `/api/track-share`, distinguished `shareRate` (% reports shared) from `eventsPerReport` in admin shares, added global document-level Escape listener for pinned tooltip dismissal in HighlightedText, removed `IF NOT EXISTS` from the pre-bootstrap migration, kept `.focus-glow` outline visible outside the motion media query so forced-colors contexts still show focus.
- [x] **PR 1 audit repair + share instrumentation** -- next/font migration (Hanken replaces Outfit), candy-pink split into `--color-brand-pink` (vivid, kept on OG/buttons) + `--color-link-pink` `oklch(55% 0.18 0)` for WCAG link contrast, tier-3+ badge ink color, form labels + role=alert + aria-live + aria-busy, all keyframes wrapped in `prefers-reduced-motion: no-preference`, drop zone keyboard-operable (role=button + Enter/Space), HighlightedText tooltip rewritten as buttons with click-to-pin + roving tabindex + aria-describedby, focus-glow replaced infinite animation with one-shot transition + solid outline fallback, next/image logomark, 44x44 touch targets, fluid score `clamp(6rem, 22vw, 11rem)`, share_events table + `/api/track-share` POST + dedicated rate limit (`TRACK_SHARE_IP_LIMIT` default 60/h, `TRACK_SHARE_GLOBAL_CAP` default 5000/day), ShareBar sendBeacon with fetch keepalive fallback, admin `/api/admin/shares` + SharesPanel with score-band breakdown
- [x] **Detection: 5-round iterative testing loop** -- prompt refinements and engine fixes across rounds 1-5
- [x] **Detection: guaranteed em dash** -- regex-based injection after Haiku validation; count always corrected from regex (not LLM)
- [x] **Detection: not-x-its-y** -- tightened to exclude classical literary contrasts; only AI pivot constructions fire
- [x] **Detection: anaphora** -- requires exact same starting word; "The research... The early..." no longer fires
- [x] **Detection: punchy-fragments** -- concrete/specific sentences excluded; only manufactured staccato emphasis fires
- [x] **Detection: triplet-framing** -- abstract interchangeable items required; specific factual lists are excluded
- [x] **Detection: multi-pattern overlap** -- same passage correctly triggers multiple patterns (ornate+vocab, suspense+colon, etc.)
- [x] **Deployment: switched to `npx vercel deploy --prod`** -- GitHub force push was failing silently; direct deploy bypasses the issue


- [x] **Security: credential leak fixed** -- removed .env.vercel from git tracking, added to .gitignore. Password rotation required (Neon console).
- [x] **Security: admin cookie** -- replaced raw password in cookie with random session token (new shared session module at src/lib/admin/session.ts)
- [x] **Security: reanalyze endpoint** -- added admin auth check + rate limiting. Was previously open to unauthenticated requests.
- [x] **Security: IP spoofing** -- rate limiter now uses last X-Forwarded-For value (edge proxy's entry) instead of first (client-spoofable)
- [x] **Reliability: Haiku validation bug** -- fixed condition where missing Haiku responses defaulted to VALID instead of REJECT
- [x] **Reliability: maxDuration** -- added export to analyze and reanalyze routes (120s for Sonnet + Haiku pipeline)
- [x] Added two new Tier 3 tropes: Elegant Variation and "Despite Challenges" Pivot (LLM-detected)
- [x] Added temporal awareness guidance to LLM analysis prompt (weight currently prevalent patterns higher)
- [x] Updated score explanation copy in ScoreHero and tropes page to emphasize clustering over individual flags
- [x] Fuzzy excerpt matching for highlighted text (normalize whitespace, prefix/middle/ellipsis fallbacks)
- [x] Contrast accessibility pass: all text-zinc-400 upgraded to text-zinc-500 or text-zinc-600 across app
- [x] TropeCard severity badges now use solid color backgrounds with white text for readability
- [x] Roast line text changed from dynamic labelColor to text-zinc-700 for consistent readability

## What's Next

**Active: Launch Sprint** — `docs/plans/2026-04-30-001-feat-launch-sprint-plan.md` (origin: `docs/brainstorms/2026-04-30-launch-sprint-requirements.md`)

Three-phase plan (10 sprints) to ship a public launch with cost/UX safety, account foundation, monetization, audience capture, public taxonomy, and a Pokémon-style trope collection mechanic. Each sprint shippable independently. Branch: `feat/launch-sprint`.

- [ ] **Phase 1 (launch-critical):**
  - [ ] U1. Three-model eval (Opus 4.7 vs Sonnet 4.6 vs Haiku 4.5) on 50-piece labeled test set — HARNESS READY, awaiting Brent: smoke test, label review, expansion to ~50 entries, full run. See `eval/README.md`.
  - [ ] U2. Energy Meter cascade + daily budget cap + Roll Call activity strip
  - [ ] U3. Brand voice audit + OG preview rebuild + arxiv citation footer
  - [ ] U4. Account foundation (magic-link auth) + Spotter Credit on shared reports
  - [ ] U5. Polar.sh tip jar + email gate with newsletter unlock
  - [ ] U6. Launch repost + day-of monitoring
- [ ] **Phase 2 (Field Guide, post-launch):**
  - [ ] U7. Field Guide schema + index + first 10 trope pages
  - [ ] U8. Remaining 32 trope pages
- [ ] **Phase 3 (Social and collection, post-launch):**
  - [ ] U9. Sightings page + submission flow
  - [ ] U10. Pokémon-style trope collection mechanic + profile pages

**Other backlog (not in current plan):**
- [ ] Sync GitHub remote with local history (force push has been blocked by hook; use `npx vercel deploy --prod` as workaround for now)
- [ ] Scoring calibration against more real-world samples (partially folded into U1 eval)

## Key Decisions
- Social diagnostic, not a writing tool (no Grammarly territory)
- LLM-primary analysis (Claude Sonnet 4.6), heuristic engine deprecated
- Density-normalized scoring: short texts with dense tropes score higher
- Em dash scoring capped at 4 points (density signal, never dominates)
- Tagline: "Because it's better to know."
- Reports are public by URL, no public archive or browse page
