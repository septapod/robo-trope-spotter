---
title: "feat: Launch Sprint"
type: feat
status: active
date: 2026-04-30
origin: docs/brainstorms/2026-04-30-launch-sprint-requirements.md
---

# Launch Sprint

## Overview

A three-phase, ten-sprint plan to take Robotropes from its current iterating state to a publicly-launched, sharable product with a durable identity layer. Phase 1 (Sprints 1-6) is launch-critical: the eval that decides the model, the cost-and-UX safety net, the brand voice cleanup, the account foundation, the tip jar, the email gate, and the launch repost itself. Phase 2 (Sprints 7-8) builds the public Field Guide that anchors SEO and identity. Phase 3 (Sprints 9-10) adds the Sightings submission flow and the Pokémon-style trope collection mechanic that turns one-shot users into return visitors.

Each sprint is shippable independently. Pausing between sprints leaves the site working and deployable.

This plan is multi-session work. Brent picks it up across days or weeks. Every session begins by reading PROJECT_STATUS.md and this plan, finding the active sprint, and resuming from the last green commit. PROJECT_STATUS.md is updated continually with the active-sprint marker so cold pickups land in the right place.

## Problem Frame

Robotropes is live and works. It lacks the operational and product surface needed to safely take public to a meaningful audience. Three rounds of ideation surfaced the dominant risk as reputation damage from a broken-feeling tool during a spike, not API spend. Existing rate limits already cap Brent's daily exposure at ~$27 worst case.

The plan addresses spike-survival (Sprint 2), monetization safety (Sprint 5), audience capture (Sprint 5), share polish (Sprint 3), account foundation (Sprint 4), and the eval that gates the cascade design (Sprint 1). Phases 2 and 3 build the durable layer that converts the launch's attention into a compounding asset (Field Guide for SEO, Collection mechanic for return visits).

## Phase Structure

| Phase | Sprints | What it ships | Launch-critical |
|---|---|---|---|
| 1. Launch-ready | 1-6 | Eval, cost/UX safety, polish, accounts, tip jar, launch repost | Yes |
| 2. Field Guide | 7-8 | Public taxonomy at /field-guide with all 42 trope pages | No |
| 3. Social and collection | 9-10 | Sightings submission flow + Pokémon-style trope collection | No |

## Implementation Units

Each sprint is one Implementation Unit. Sprint dependencies are explicit. Verification criteria define the ship gate.

### U1. Three-model eval

**Goal.** Decide the primary detection model and the cascade fallback ordering by running Opus 4.7, Sonnet 4.6, and Haiku 4.5 against a 50-piece labeled test set covering all five severity tiers. Publish the result as a dxn.is post.

**Requirements.** R1, R2, R3.

**Files.**
- Create: `eval/test-set.json` (50 hand-labeled passages)
- Create: `eval/run-eval.ts` (harness that runs all three models, captures outputs, computes per-tier accuracy)
- Create: `eval/scoring.ts` (recall, false-positive rate, agreement metrics)
- Create: `eval/results-2026-04-30.md` (the comparison writeup)
- Reference (read-only): `src/lib/analysis/prompts.ts`, `src/lib/analysis/llm-engine.ts`, `src/lib/tropes/tier1.ts` through `tier5.ts`

**Approach.** Curate 50 passages: 10 from public LinkedIn posts, 10 from vendor white papers, 10 from consultant emails or blog posts, 10 from clearly-human writing (control), 10 from edge cases (mostly-human-with-AI-edits, AI-with-heavy-human-revision). Hand-label each passage by the trope set present and the expected severity tier. Eval harness runs the existing system prompt against each model variant. Results scored on recall (% of ground-truth tropes detected), false-positive rate (tropes detected that are not in ground truth), and explanation quality (sampled blind human rating). Final writeup names the recommended primary model and proposes cascade tiers.

**Execution note.** Test-set curation is the bottleneck. Brent's eye is on labels. Agent can scaffold the harness, suggest pseudo-labels using current Sonnet pipeline, then hand to Brent for review.

**Patterns to follow.** Existing prompt structure in `src/lib/analysis/prompts.ts`. Existing two-pass flow in `src/lib/analysis/llm-engine.ts`. Match output JSON shape used by analysis endpoint.

**Verification.**
- 50 labeled passages exist in `eval/test-set.json` with at least 5 entries per severity tier.
- Eval runs end-to-end against all three models and produces a per-model accuracy breakdown by tier.
- A markdown writeup exists at `eval/results-2026-04-30.md` with: methodology summary, per-tier accuracy table, recommended primary model, recommended cascade ordering.
- Writeup is shareable as-is to dxn.is (no internal-only language).

**Dependencies.** None. Starts immediately.

**Ship gate.** Eval results reviewed by Brent. Recommended primary model and cascade ordering confirmed.

---

### U2. Energy Meter cascade and Roll Call activity strip

**Goal.** Ship the cost-and-UX safety net so the LinkedIn launch cannot blow up Brent's API bill or leave the experience broken-feeling during a spike.

**Requirements.** R4, R5, R6, R7.

**Files.**
- Modify: `src/app/api/analyze/route.ts` (daily budget tracking, tier selection)
- Modify: `src/lib/analysis/llm-engine.ts` (add tier-based model selection)
- Create: `src/lib/analysis/budget.ts` (daily-spend tracking via Vercel KV or Postgres counter)
- Create: `src/components/EnergyMeter.tsx` (homepage indicator, cascade state copy)
- Create: `src/components/RollCall.tsx` (recent verdict icons, no denominator)
- Modify: `src/app/page.tsx` (mount Energy Meter + Roll Call above the textarea)
- Modify: `src/app/api/recent-verdicts/route.ts` (new endpoint feeding Roll Call)
- Reference: existing rate-limit module to ensure interaction is correct

**Approach.** Add a daily-budget counter (resets midnight UTC). Each analysis request reads current spend, picks the highest-quality tier within budget, calls that tier, increments spend by the actual cost. When the budget threshold passes preset levels, return tier metadata to the client. Energy Meter component reads the current tier from a lightweight `/api/status` endpoint (or the analyze response) and displays one of four states: caffeine (full Sonnet+Haiku), tea (Haiku-only or whatever Sprint 1 settles on), water (regex-only floor), napping (cap exhausted; come back tomorrow). Roll Call subscribes to recent analyses (server-side, public, anonymized) and shows verdict icons. No counts, no denominators.

**Execution note.** The cascade tier definitions depend on Sprint 1 result. Don't hardcode "Haiku-only" as the tea tier until eval confirms it's viable. If Haiku misses too much at tier 4-5, the tea tier becomes a different combination.

**Patterns to follow.** Existing rate-limit pattern. Existing telemetry / share-events pattern in `src/app/api/track-share/route.ts` for the recent-verdicts endpoint shape.

**Verification.**
- Setting `DAILY_BUDGET_USD=0.01` in env causes the analyzer to fall through tiers within a few requests, reaching the napping state.
- Energy Meter renders all four states correctly. Copy matches Brent's writing rules (no em dashes, no "it's not X, it's Y").
- Roll Call shows real recent verdicts, never numbers, never empty-feeling. Empty state shows the "First one of the day. Paste away." copy.
- Existing rate-limit (20/IP/hour) continues to work. Analysis path doesn't double-charge against budget on retries.

**Dependencies.** U1 result.

**Ship gate.** Energy Meter and Roll Call live on production homepage. Manual smoke test: a small fake daily budget cap triggers the cascade through all four states.

---

### U3. Brand voice audit, OG preview rebuild, arxiv citation

**Goal.** Sweep all UI copy for the new voice (drop "Wall of Shame" / "Cringe Library" framing, hold the playful direct register, strip any em dashes or "it's not X, it's Y" structures from copy that may have drifted), rebuild the OG preview to show a mid-analysis state, and add the arxiv citation footer line.

**Requirements.** R14, R15, R16, R17, R18.

**Files.**
- Audit and modify: every file under `src/components/`, `src/app/`, `src/lib/copy/`
- Modify: `src/app/report/[slug]/opengraph-image.tsx` (new design with three trope highlights visible, title "AI writing tropes, detected.")
- Modify: `src/app/opengraph-image.tsx` (homepage OG, same direction)
- Modify: `src/components/Footer.tsx` (or wherever footer is) - add one-line arxiv citation
- Reference: Brent's writing-quality rules, the arxiv link

**Approach.** Run the entire repo through the Robotropes analyzer itself as a meta-check (eat your own dog food). Sweep for any surface-level copy violations. Replace "Wall of Shame" / "Cringe Library" with "Sightings" wherever it appears (search-and-replace). Rebuild OG image: the existing Satori route currently renders score + label. New design shows three trope highlights from a fictional or anonymized analyzed text snippet, with the new title and the muted tier palette from the editorial deadpan reset. Footer adds: `Based on detection patterns documented in Russell et al., 2024.` with a link to arxiv.org/html/2501.15654v2. No badges, no "as featured in."

**Execution note.** Pure copy and visual asset work. No backend changes. Lowest-risk sprint.

**Patterns to follow.** Existing OG render pattern in `src/app/report/[slug]/opengraph-image.tsx`. Existing footer style.

**Verification.**
- Grep across `src/` for "Wall of Shame," "Cringe Library," "delve," em dashes (-), "it's not X, it's Y" (and variants like "not just X, but Y"). Zero hits in non-test, non-eval, non-trope-definition copy.
- OG card preview renders correctly when tested with LinkedIn's preview tool and Twitter's card validator.
- Arxiv citation is in the footer, links to `https://arxiv.org/html/2501.15654v2`, and reads as one understated line.

**Dependencies.** None directly. Best run after U2 because the Energy Meter copy is part of the audit.

**Ship gate.** Production deploy passes the meta-check (Robotropes analyzes its own homepage and reports a low score).

---

### U4. Account foundation and Spotter Credit

**Goal.** Introduce email-based magic-link auth and ship the first account-only feature: Spotter Credit on shared reports.

**Requirements.** R11, R12, R13.

**Files.**
- Create: `src/lib/auth/` directory (magic-link send, verify, session)
- Create: `src/app/api/auth/send-link/route.ts` (POST: email -> sends magic link)
- Create: `src/app/api/auth/verify/route.ts` (GET: token -> sets session cookie)
- Create: `src/app/api/auth/me/route.ts` (GET: returns logged-in user or null)
- Modify: `drizzle/` (new migration adding `users` table and `report_bylines` table)
- Create: `src/components/auth/SignInModal.tsx` (email-entry form, magic-link sent confirmation)
- Modify: `src/components/report/ReportPage.tsx` or wherever shared reports render (add Spotter Credit byline at top when set)
- Modify: `src/app/api/analyze/route.ts` (write byline if user is logged in)

**Approach.** Magic-link flow: user enters email, server generates a signed token, emails a one-time link via Resend or similar (decision deferred to implementation; budget item). Click verifies token, sets a httpOnly session cookie. Sessions live ~30 days. No password. New `users` table with id, email, display_name, profile_url. New `report_bylines` table linking report slug to user_id (one byline per report; only the first sharer claims credit). Report page reads the byline if present and shows "Spotted by [name, link]" at the top in marginalia register matching the editorial deadpan voice.

**Execution note.** Auth touches security-sensitive code. Take this slow. Use signed tokens with short TTL (15 min) for the magic link. Use httpOnly + secure + SameSite=Lax for the session cookie. Rate-limit the send-link endpoint.

**Patterns to follow.** Existing rate-limit module. Existing admin session pattern in `src/lib/admin/session.ts` for signed-token treatment. Drizzle migration pattern from prior PRs.

**Verification.**
- Signing in via magic link sets a session cookie that persists across page reloads.
- Logged-in users see a "Claim byline" toggle on their report; unticking removes the byline.
- Anonymous reports remain anonymous. Anonymous users see no auth UI by default (login is only surfaced on actions that require it).
- Magic-link rate limit prevents abuse (e.g., 5 requests/hour per IP).
- Database migration runs cleanly via Drizzle and rolls back without orphans.

**Dependencies.** U3 (so any auth UI lands in the new voice).

**Ship gate.** A logged-in user can claim a byline on a report they share. Anonymous flow is unchanged.

---

### U5. Polar.sh tip jar and email gate with newsletter unlock

**Goal.** When a user has used their daily allowance, present three friction-graded paths: subscribe to AI for FIs (newsletter unlock for 30 days), buy-me-a-coffee tip via Polar.sh (10 extra analyses today), or wait until tomorrow. The "$0 / no thanks" path also unlocks the 10 extras.

**Requirements.** R8, R9, R10.

**Files.**
- Add dependency: `@polar-sh/nextjs`
- Create: `src/app/api/polar/webhook/route.ts` (handles `checkout.updated` events)
- Create: `src/app/api/unlock/route.ts` (grants extra-analyses unlock)
- Create: `src/app/api/newsletter/subscribe/route.ts` (Beehiiv subscription confirmation, grants 30-day unlock)
- Create: `src/components/AllowanceExhaustedModal.tsx` (the three-path UX)
- Modify: `src/app/api/analyze/route.ts` (check for active unlock before falling through to budget cascade)
- Modify: `drizzle/` (new migration adding `unlocks` table: user_id or session_id, unlock_type, expires_at)

**Approach.** When the analysis endpoint detects allowance-exhausted state for a session (anonymous or logged-in), return a structured response that triggers the AllowanceExhaustedModal. Modal shows three buttons: "Subscribe to AI for FIs (free, 30 days unlimited)" / "Buy Brent a coffee" / "Come back tomorrow." Subscription path posts email to Beehiiv API and grants 30-day unlock on success. Coffee path opens Polar's embedded checkout; on webhook success, grants today's-only 10-analysis unlock. "$0 / no thanks" is rendered as a less-prominent tertiary link inside the coffee modal that bypasses Polar entirely and grants the same today's-only unlock. Unlocks are stored in `unlocks` table keyed by user_id (logged-in) or a signed session cookie (anonymous).

**Execution note.** Polar webhook must verify signature. The "$0 unlocks" path must be implemented carefully: it can't be exploitable as an unlimited bypass. Cap to 1/day per session/IP.

**Patterns to follow.** Existing rate-limit pattern (for the $0 unlock cap). Existing admin session signing pattern (for anonymous-session-cookie identity).

**Verification.**
- Allowance-exhausted state triggers the modal correctly.
- Subscribing via the form creates a Beehiiv subscriber and unlocks 30 days. Confirmed by checking Beehiiv API and trying to analyze after.
- Coffee tip via Polar succeeds end-to-end with a live $1 test transaction. Webhook fires. Unlock grants.
- $0 / no thanks path unlocks without Polar interaction, capped at 1/day per session.
- Existing analyze flow is unchanged for users below the daily allowance.

**Dependencies.** U4 (because logged-in users get user-keyed unlocks).

**Ship gate.** All three paths verified live in production. Test users complete the full flow at least once for each path.

---

### U6. Launch repost and day-of monitoring

**Goal.** Ship the LinkedIn repost. Watch the site live for the first 6 hours.

**Requirements.** R26, R27.

**Files.** None modified. This sprint is launch operations.

**Approach.** Brent writes and posts a short LinkedIn repost. Subject is the trope problem; Robotropes is mentioned as a consequence. No "I built X" energy. Link in sentence 3+. Run the post text through Robotropes itself before publishing as a meta-check. After posting, monitor:

- Vercel logs for analysis endpoint errors
- Anthropic dashboard for tier-limit warnings
- Energy Meter state on the live site every 30 min
- Recent submissions via the Roll Call (sanity check: are users actually seeing reports?)
- Vercel KV / DB for budget tracking accuracy

If anything breaks, the rollback is "set DAILY_BUDGET_USD env var to 0," which forces immediate napping state across the site. The site stays up; only the analyzer is paused.

**Execution note.** Operational, not engineering. Brent owns the post text; agent helps proofread but does not write the launch copy.

**Verification.**
- Post is live on Brent's LinkedIn feed.
- Site survives the first 6 hours without any 5xx errors at the analysis endpoint.
- Budget cap, if triggered, transitions the cascade gracefully and visibly.

**Dependencies.** U1, U2, U3, U4, U5 all merged and deployed to production.

**Ship gate.** End of the day-of monitoring window. Brent declares the launch landed.

---

### U7. Field Guide schema and first 10 trope pages

**Goal.** Build the public taxonomy at /field-guide. Index page plus the 10 highest-traffic candidate trope pages (the most-Mollick-named and most-frequently-detected ones).

**Requirements.** R19, R20, R21 (partial).

**Files.**
- Create: `src/app/field-guide/page.tsx` (index)
- Create: `src/app/field-guide/[slug]/page.tsx` (per-trope pages, dynamic route)
- Create: `src/lib/field-guide/content.ts` (per-trope content: definition, examples, why-LLMs-do-this, related)
- Create per-trope content files for the first 10: `src/lib/field-guide/content/load-bearing.ts`, etc.
- Modify: `src/lib/tropes/registry.ts` (link tropes to their field-guide slugs)
- Modify: `src/app/sitemap.ts` (add field-guide pages)

**Approach.** Define a per-trope content shape: definition (1-2 sentences), 3-5 real examples sourced from public writing with credit/links where possible, why-LLMs-do-this (1 paragraph on training-data root cause), what-humans-tend-to-write-instead, related-tropes (links to other field guide pages). Index page groups the 42 tropes into 4-6 legible categories. Per-trope page uses the Bricolage display font for the trope name, mono section ID treatment matching the editorial deadpan voice. SEO-optimized title and description per page.

The first 10 candidates: Load Bearing, "Not Just X, But Y," "I Keep Coming Back To," Em Dash Density, Delve / Tapestry / Vocabulary Tells, Contemplation As Opener, Tricolon Framing, Anaphora, Hollow Assessments, Formulaic Rhetorical Questions.

**Execution note.** Content writing is the heavy lift. Each trope page is 200-400 words plus 3-5 example excerpts. Brent or agent writes; agent can pseudo-draft from the existing trope definitions in `src/lib/tropes/tier1.ts` etc.

**Patterns to follow.** Editorial deadpan visual language from PR 2 (recently merged). Existing trope structure in `src/lib/tropes/`.

**Verification.**
- /field-guide loads, lists all 42 tropes grouped, shows "coming soon" or similar for the 32 unwritten ones.
- The 10 written trope pages each load at /field-guide/[slug] with all required content sections.
- Sitemap includes the field guide pages.
- Each trope page has an SEO-appropriate title and description.

**Dependencies.** Phase 1 ships first.

**Ship gate.** First 10 trope pages live in production. Manual SEO check: titles render correctly, links from tropes to related tropes work, meta descriptions are present.

---

### U8. Remaining 32 trope pages

**Goal.** Complete the field guide with the remaining 32 trope content pages.

**Requirements.** R19, R20, R21 (full coverage).

**Files.**
- Create: 32 more files under `src/lib/field-guide/content/`

**Approach.** Same per-trope content shape as U7. Content writing in batches.

**Execution note.** Pure content sprint. Can split across multiple sessions of 8-10 pages each.

**Verification.**
- All 42 tropes have field-guide content.
- Internal cross-links between related tropes are correct.
- No "coming soon" placeholders remain on the index.

**Dependencies.** U7.

**Ship gate.** Field Guide is complete. SEO crawl shows all 42 pages indexed.

---

### U9. Sightings page and submission flow

**Goal.** Logged-in users can submit AI-trope-laden writing they have spotted in the wild. Submissions auto-run through the analyzer and land on a public stream at /sightings.

**Requirements.** R22, R23.

**Files.**
- Create: `src/app/sightings/page.tsx` (public stream)
- Create: `src/app/sightings/submit/page.tsx` (submission form)
- Create: `src/app/api/sightings/route.ts` (POST: create sighting; GET: list)
- Modify: `drizzle/` (new migration: `sightings` table with submitter_id, source_url, submitter_note, analyzed_report_slug, public flag, created_at)
- Create: `src/components/sightings/SightingCard.tsx` (stream item)
- Modify: `src/app/api/analyze/route.ts` (allow analyses from sightings flow to write to sightings table)

**Approach.** Submission form takes pasted text plus optional source URL plus optional submitter note. On submit, the text runs through the analyzer (subject to the same daily budget and cascade rules), produces a report, and creates a sighting row linked to the report. Public stream filters to public sightings, paginated, ordered by recent. Each card shows: submitter name (if Spotter Credit on), top trope detected, severity, optional source URL, submitter note, link to full report.

**Execution note.** Sightings reuse the analyze pipeline; no new model calls. Rate-limit submissions per user (5/hour) on top of the global budget.

**Patterns to follow.** Existing analyze route. Existing report page. Drizzle migration pattern.

**Verification.**
- Logged-in user can submit a sighting with text + optional URL + note.
- Sighting analysis runs and produces a report.
- Sighting appears on /sightings within seconds.
- Anonymous users see /sightings (read-only) and the submit page redirects to login.

**Dependencies.** U4 (accounts), U7-U8 (field guide; sighting cards may link to relevant trope pages).

**Ship gate.** Brent submits 5-10 real sightings. Stream renders correctly. Submitter byline shows when claimed.

---

### U10. Pokémon-style trope collection mechanic

**Goal.** Each of the 42 tropes is a collectable. Logged-in users earn the trope's badge when they analyze (or submit a sighting of) text containing that trope. Profile shows their collection grid.

**Requirements.** R24, R25.

**Files.**
- Create: `src/app/profile/[slug]/page.tsx` (user profile + collection grid)
- Create: `src/app/profile/me/page.tsx` (private dashboard)
- Modify: `drizzle/` (new migration: `collections` table linking user_id + trope_id + first_spotted_at + count)
- Create: `src/components/profile/CollectionGrid.tsx` (42-cell grid; each cell shows badge + count or empty state)
- Create: trope badge SVG assets (or typographic badges) for all 42 tropes
- Modify: analysis pipeline to write collection rows when a logged-in user analyzes text with a trope match

**Approach.** When a logged-in user runs an analysis (their own or via Sightings), each detected trope creates or increments a collection row. Profile grid displays all 42 tropes; uncollected ones are greyed/silhouetted, collected ones show the badge in color with the user's spot count. No streaks, no points, no leaderboards. Collection display is meta-data overlay on the existing analyze flow; no behavioral change to the analyzer itself. Public profile pages let other users browse a collection (e.g., visit `/profile/brent-dixon` to see Brent's spots).

**Execution note.** Badge visual treatment is a brand-fit decision. Options to explore: SVG illustrations (most expressive, slowest), emoji-style glyphs (quick, may feel childish), typographic badges (most editorial-deadpan-aligned, least Pokémon-feeling). Test with 5-10 examples before committing.

**Patterns to follow.** Existing trope registry pattern. Existing report rendering. Drizzle migration pattern.

**Verification.**
- A logged-in user analyzing text with 3 detected tropes earns those 3 badges (visible on their profile).
- Re-analyzing text with the same tropes increments the count, doesn't duplicate the badge.
- Profile grid renders all 42 tropes; collected ones in color, uncollected ones in silhouette.
- No leaderboard, no streaks, no points anywhere.

**Dependencies.** U4 (accounts), U7-U8 (field guide; badges link to trope pages).

**Ship gate.** Brent earns at least 10 different trope badges through normal use. Profile renders correctly. Public profile URL works.

---

## Park List

These items surfaced in ideation but are not in the current plan. They are deliberately deferred with reasons preserved here so future-you doesn't reopen settled questions.

| Item | Reason parked |
|---|---|
| Personal Corpus dashboard (private trope-frequency-over-time charts) | Deferred to post-launch retention work; collection mechanic in U10 covers the immediate retention need |
| Calibration Quiz at /calibrate (5-passages-AI-or-human guess game) | Deferred; reconsider after Field Guide is up and SEO baseline established |
| Trope of the Week deep-dive series | Deferred; depends on Sightings stream (U9) producing fresh examples to draw from |
| Phrase lookup search bar in site header | Deferred; cheap to add post-Field-Guide once the taxonomy is browsable |
| Robotropes Pro for orgs ($99/mo B2B tier) | Out of current scope; reconsider only with concrete CU-client demand signals |
| Browser extension version | Out of current scope; web-app-first remains the primary surface |
| CU-specific compliance variant | Out of current scope; valid post-launch evolution if 2-3 active CU clients ask for it |
| Annual State of AI Writing community report | Long-term Phase 4+ play once Sightings stream has 6+ months of data |
| Sponsored daily allotment (named CU/fintech sponsors) | Out of scope until usage threshold (1k+ users/week) is achieved |
| Referral unlock mechanic | Rejected on voice grounds; "share to unlock" reads as grasping |
| Pay-per-analysis micropayments ($0.50 each) | Rejected on voice grounds; per-use pricing reads as transactional |
| Sample carousel of pre-analyzed examples on the homepage | Rejected; distracts from the textarea, which is the main event |
| Mollick referrer detection or banner | Rejected; site stays audience-agnostic |
| "Train your ear for AI prose" h1 reframe | Rejected; education is the punchline, not the headline |
| BYOK browser-direct API key paste path | Rejected; too high-friction for non-developer audience |
| Stripe Checkout (vs Polar.sh) | Rejected in favor of Polar.sh on tax-compliance grounds |
| Bakery cascade metaphor | Rejected in favor of Energy Meter |
| Three-model eval including non-Anthropic models (GPT-5, Gemini, DeepSeek) | Rejected for v1 eval; stay within Claude family for cleanest cascade design. Reconsider if Sonnet-vs-Haiku gap is small enough that cross-vendor cost gains are tempting |

---

## Cross-Cutting Decisions

- **Polar.sh, not Stripe.** Merchant of Record handles tax compliance. `@polar-sh/nextjs` SDK is native to Next.js 16.
- **Magic-link email auth, no passwords.** Lowest friction for non-developer professionals. Newsletter subscription stays a separate flow.
- **Daily budget cap at $5/day default.** Configurable via `DAILY_BUDGET_USD` env var. Adjust based on observed usage.
- **Anonymous use stays the default.** Accounts unlock optional features (Spotter Credit, Sightings submission, Collection profile). Anonymous flow is unchanged for the analyzer itself.
- **Education is implicit.** The Russell et al. paper informs the product but doesn't appear in marketing copy. Collection mechanic is the playful surface; educational result is the side effect.
- **Voice is direct and playful.** Drop metaphor-heavy framing where it strains. "Sightings" replaces "Wall of Shame" / "Cringe Library." No "Field Guide Submissions" (over-thematic).
- **Test set hand-labeled by Brent.** Eval pseudo-labels can come from current Sonnet pipeline as a starting point, but final labels are Brent's call.

## Open Questions

### Resolved During Planning

- Magic-link send provider (Resend vs Auth.js Email vs hand-rolled): deferred to U4 implementation. Current lean: Resend or Auth.js for security and deliverability. Hand-rolled would mean reinventing TLS-aware retry, bounce handling, deliverability monitoring. Not worth it.
- Polar.sh embedded checkout vs hosted: embedded, per the SDK's documented Next.js pattern.
- Cascade tier definitions: blocked by U1 result.

### Deferred to Implementation

- [Affects U1] [Technical] Test set sourcing strategy: should we reuse any of the existing reanalyzed report corpus, or start fresh with new passages? Decision in U1.
- [Affects U2] [Technical] Daily-budget storage: Vercel KV vs Postgres counter table. Decision in U2 based on speed vs durability needs.
- [Affects U2] [Technical] Recent verdicts feed: read live or cached. Decision in U2; latency budget depends on traffic.
- [Affects U4] [Technical] Magic-link provider: Resend vs Auth.js vs other. Decision in U4.
- [Affects U5] [Technical] Beehiiv subscription confirmation flow: API confirm-on-create vs double-opt-in webhook. Decision depends on Beehiiv tier (current is Free Launch per memory; some endpoints are Enterprise-only).
- [Affects U10] [Needs research] Trope badge visual treatment: SVG illustrations vs typographic glyphs vs emoji. Brand-fit decision; explore in U10.
- [Affects U7-U8] [Technical] Field Guide content sourcing: agent-drafted from existing trope definitions vs hand-written by Brent. Likely a mix; decision per-trope.

## Termination Clauses

If a sprint stalls (more than 14 days without commits), reassess scope. The plan is incremental for a reason: pause on any sprint without breaking the site.

If U1 (eval) reveals the model gap is much larger than expected (Sonnet vs Haiku at 50%+ recall difference on critical tiers), the cascade design may need to change to "Sonnet always, no fallback to Haiku." That changes U2 scope. Re-plan U2 if this happens.

If Phase 1 ships cleanly but the launch doesn't produce meaningful traffic, Phase 2 still proceeds (Field Guide is durable SEO regardless of launch outcome) but Phase 3 may be deprioritized.
