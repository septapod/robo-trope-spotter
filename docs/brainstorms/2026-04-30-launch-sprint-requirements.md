---
date: 2026-04-30
topic: launch-sprint
---

# Launch Sprint: Public Launch Readiness for Robotropes

## Summary

A three-phase incremental plan to take Robotropes from its current iterating state to a publicly-shareable product. Phase 1 ships launch-ready safety, polish, account foundation, monetization, and audience capture. Phase 2 builds the public field guide that anchors the SEO and identity layer. Phase 3 adds the social and collection mechanic that turns one-shot users into return visitors. Phase 1 is the only phase required before the public launch post.

---

## Problem Frame

Robotropes is live at robotropes.dxn.is and works. What it lacks is the operational and product surface needed to safely take it public to a meaningful audience. The owner (Brent) wants to share it on LinkedIn but is afraid of three things: hitting Anthropic tier limits during a viral moment, eating a runaway API bill, and the experience breaking right when 10K-100K people might see it.

Three rounds of ideation surfaced that the API spend is already bounded by existing rate limits (~$27/day max), so the dominant risk is reputation damage from a broken-feeling tool during the launch moment. A public launch also surfaces a second-order need: ways to convert the inevitable spike of attention into something durable (newsletter subscribers, a public corpus, return visitors), since one-shot anonymous traffic compounds at zero.

The launch surface is no longer planned as a comment under Ethan Mollick's post (4/30 LinkedIn post on AI writing tells). It is a repost from Brent's own feed, audience-agnostic, treating the trope problem as the subject and Robotropes as a consequence.

---

## Requirements

**Eval and detection model**
- R1. Run a head-to-head eval comparing Claude Opus 4.7, Sonnet 4.6, and Haiku 4.5 on a 50-piece labeled test set covering all five severity tiers.
- R2. Eval result must produce a per-tier accuracy comparison plus a recommendation on the primary detection model and any tier-cascade fallback ordering.
- R3. Eval methodology, dataset shape, and headline result must be publishable as a dxn.is post.

**Cost and UX safety**
- R4. Add a daily budget cap at the analysis endpoint with automatic tier-based fallback through models. Default cap configurable; recommended starting value $5/day.
- R5. Cascade UX uses an "Energy Meter" metaphor visible on the homepage and within the analyzer state: caffeine (full), tea (slightly degraded), water (pattern-matching only), napping (tomorrow only).
- R6. Replace any existing rate-limit error UX with the Energy Meter language. No "429" or "rate limit" copy visible to end users.
- R7. Add a Roll Call activity strip showing recent verdict icons with no denominator. Empty state copy turns zero into an invitation.

**Audience capture and monetization**
- R8. Add an email gate on save/share/PDF actions. The gate offers a newsletter unlock granting 30 days of unlimited analyses to anyone subscribing to the AI for FIs newsletter (Beehiiv).
- R9. Add a Polar.sh tip jar accessible when a user has used their daily allowance. Presets $1/$3/$7/name-your-own. A "$0 / no thanks" path also unlocks 10 extra analyses for the day. Polar handles tax compliance (Merchant of Record).
- R10. Polar webhook grants the unlock programmatically. No manual reconciliation.

**Accounts and identity**
- R11. Introduce account creation. Anonymous use stays as the default; accounts unlock optional features.
- R12. Logged-in users get Spotter Credit (a small byline, opt-in, with name and optional link) on any public report they share.
- R13. Account creation flow uses email-based magic-link auth. No password.

**Brand voice and shareability**
- R14. Voice stays playful, social, and direct. Education is the punchline; not a headline reframe. The h1 stays in current playful register.
- R15. Replace "Wall of Shame" / "Cringe Library" framing with "Sightings."
- R16. UI copy follows Brent's writing rules: no em dashes, no "it's not X, it's Y," specific over generic, no consultant cosplay.
- R17. Footer carries a one-line citation to Russell, Karpinska, and Iyyer (2025), arxiv.org/html/2501.15654v2. No badges, no "as featured in" energy.
- R18. OG preview image shows a mid-analysis state with three trope highlights visible. Title: "AI writing tropes, detected." No logo-only card.

**Field guide (Phase 2)**
- R19. Public taxonomy at /field-guide. Index page groups the 42 tropes into legible categories. Each trope gets its own permalink page.
- R20. Each per-trope page contains: definition, 3-5 real examples sourced from public writing, why LLMs do this, what humans tend to write instead, related tropes, and a "report a sighting" link pre-tagged with that trope.
- R21. Field guide is publicly indexable. SEO-optimized titles and descriptions per trope.

**Social and collection (Phase 3)**
- R22. Sightings page where logged-in users submit AI-trope-laden writing they have spotted in the wild. Submissions accept text plus optional source URL plus optional submitter note.
- R23. Each Sighting auto-runs through the analyzer and gets tagged with detected tropes. Public stream at /sightings.
- R24. Pokémon/birdwatching collection mechanic: each of the 42 tropes is a collectable. Logged-in users earn the trope's badge when they analyze (or submit a sighting of) text containing that trope. Profile shows their collection.
- R25. Collection mechanic includes no streaks, no points, no leaderboards. Identity capital, not gamification.

**Launch act**
- R26. Launch is a repost from Brent's own LinkedIn feed about the trope problem, linking to robotropes.dxn.is. No site-side accommodation for any specific referrer or source.
- R27. Day-of monitoring window: tier cascade and Roll Call are watched live for the first 6 hours after the post.

---

## Success Criteria

- The public launch post can ship without exposing Brent to a runaway API bill, broken UX during a spike, or an anonymous-only relationship with the audience that arrives.
- Each phase ships independently. Pausing between phases leaves the site in a working, deployable state.
- Multi-session work is recoverable. Any session can pick up where the prior one left off by reading the plan doc and PROJECT_STATUS.md.
- The eval result is decisive: it tells Brent which Claude model to use as primary and which tiers the cascade should fall through.
- Field Guide pages are linkable, citable, and indexable enough that searches like "what is the load-bearing trope in writing" surface Robotropes within a quarter.
- The collection mechanic produces return visits without crossing into childish gamification.

---

## Scope Boundaries

**Deferred for later (post-launch phases or beyond):**

- Personal Corpus dashboard (logged-in user trends over time)
- Calibration Quiz at /calibrate (5-passages-AI-or-human guessing game)
- Trope of the Week deep-dive series
- Phrase lookup search bar in site header
- Robotropes Pro for orgs ($99/mo B2B tier)
- Browser extension version
- CU-specific compliance variant
- Annual State of AI Writing community report
- Sponsored daily allotment (named CU/fintech sponsors)
- Referral unlock mechanic (share-with-a-friend bonus analyses)

**Outside this product's identity:**

- Sample carousel of pre-analyzed examples on the homepage. Distracting from the textarea, which is the main event.
- Mollick referrer detection, banner, or any post-specific UX. Site stays audience-agnostic.
- "Train your ear" h1 reframe. Education is the punchline, not the headline.
- BYOK browser-direct API key paste path. Too high-friction for the non-developer audience.
- Stripe Checkout. Replaced by Polar.sh.
- Bakery cascade metaphor. Replaced by Energy Meter.
- Dark mode. Outside scope unless trivially enabled by an Energy Meter or other change.
- Pay-per-analysis micropayments. Off-brand against the playful, anti-grasping voice.

---

## Key Decisions

- **Polar.sh over Stripe for the tip jar.** Merchant of Record handles tax compliance for Brent's S-Corp. Embedded checkout. `@polar-sh/nextjs` is native to the existing Next.js 16 stack.
- **Magic-link email auth, no password.** Lowest friction for a non-developer professional audience. Newsletter subscription stays a separate flow from account creation.
- **Eval gates the cascade.** The Energy Meter tiers cannot be designed before the eval result establishes which models can carry which detection workloads.
- **Three-phase structure.** Phase 1 is launch-critical; Phase 2 (Field Guide) and Phase 3 (Social/Collection) can ship after launch without blocking it.
- **Education is implicit, not headline.** The Russell et al. paper's exposure-based detection mechanism informs the product but is not used as a positioning frame. The collection mechanic is the playful surface; the educational result is the side effect.
- **Repost, not comment, for the launch.** Brent's own feed, audience-agnostic, no Mollick-specific UX.
- **Share-page commenting, leaderboards, streaks all deferred or rejected.** Identity capital and curatorial framing fit the audience; gamification does not.

---

## Dependencies / Assumptions

- Beehiiv API supports programmatic subscription confirmation. Newsletter unlock relies on this.
- Polar.sh `@polar-sh/nextjs` SDK works with Next.js 16. Latest verified version supports the embedded checkout pattern.
- Anthropic SDK pricing as of April 2026 holds (Sonnet 4.6 $3/$15 with $0.30 cached input, Haiku 4.5 $1/$5, Opus 4.7 $5/$25). Eval cost ~$15 worst case.
- The existing 42-trope taxonomy in `src/lib/tropes/tier1.ts` through `tier5.ts` is treated as canonical for this work. No taxonomy changes mid-sprint.
- Vercel deploy via `npx vercel deploy --prod` continues to work. GitHub force push to `septapod/robo-trope-spotter` is currently broken (pre-commit hook blocked); deploys bypass via direct vercel CLI.

---

## Outstanding Questions

### Resolve Before Planning

None. The scope is locked in.

### Deferred to Planning

- [Affects R1, R2] [Technical] Test set sourcing: which 50 passages to include? Mix of public LinkedIn posts, vendor white papers, consultant emails, plus human-written controls. Curation happens during Sprint 1.
- [Affects R5, R6] [Technical] Exact daily budget cap default value. $5/day is recommended; final value calibrates against the eval result and current usage observed in admin dashboards.
- [Affects R11, R13] [Technical] Magic-link implementation choice: Resend, Auth.js with email provider, or a minimal handcrafted flow. Decision lives in Sprint 4.
- [Affects R22-R25] [Technical] Sightings submission flow vs analyzer flow: shared analysis path, or separate code path with different rate-limit policy? Decision lives in Sprint 9.
- [Affects R24] [Needs research] Pokémon-style badge visual treatment. Brand-fit decision; explore SVG illustration vs emoji vs typographic glyphs during Sprint 10.
