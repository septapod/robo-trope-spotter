---
date: 2026-03-28
topic: social-diagnostic-product-concept
focus: MVP ideation for Robo Trope Spotter as a social diagnostic tool
---

# Ideation: Robo Trope Spotter

## Codebase Context

- **Repo**: septapod/robo-trope-spotter (private), at ~/dev/robo-trope-spotter
- **State**: Empty repo, README only. Greenfield project.
- **Existing asset**: Brent's writing-quality skill (~/.claude/skills/writing-quality/SKILL.md) contains a battle-tested trope taxonomy
- **Existing asset**: Detailed 5-tier, 40-pattern report card taxonomy document with scoring, model-specific fingerprints, and engagement data
- **Key framing**: This is a SOCIAL DIAGNOSTIC TOOL, not a writing assistant. Think personality quiz meets gentle roast, not Grammarly.

## Competitive Landscape

### Closest competitors (confirmed via research 2026-03-28)
- **Un-AI-ify** (unaiify.com): 7 named pattern categories, color-coded highlights, rhetorical score, shareable URLs. Closest UX but Grammarly-style inline editor, not a report card. Limited taxonomy.
- **Tropes.fyi**: 32+ named tropes, best taxonomy. AI Vetter scores URLs. But it's a developer tool/system prompt, not a consumer product. No social sharing.
- **SlopDetector.org**: Shareable links, irreverent tone, named categories. But evaluates content quality, not AI writing fingerprints.
- **YouSuckAtWriting.com**: Shareable roast reports ($5/each). General writing critique, not AI-pattern-specific.

### The gap (confirmed)
Nobody combines: (1) comprehensive named-trope taxonomy, (2) paste-and-analyze tool, (3) designed shareable social object, (4) persona/archetype typing, (5) "send this to someone as a gentle callout" framing. Items 3-5 are genuinely unoccupied territory.

## Ranked Ideas

### 1. The Persona Engine (The Shareability Core)
**Description:** Assign each analyzed text a named archetype based on its trope profile. "The Corporate Middle Manager Who Just Discovered ChatGPT." "The Hedge Maze." "The LinkedIn Guru." The persona is the headline of the report card.
**Rationale:** People share identities, not data. BuzzFeed quiz mechanics. "I got Corporate Middle Manager" is a sentence someone says out loud. "You scored 34/80" is not.
**Downsides:** Requires designing 8-12 compelling archetypes. If personas are weak, the product falls flat.
**Confidence:** 90%
**Complexity:** Medium (design challenge, not engineering)
**Status:** Unexplored

### 2. The Headline Roast + Grade (The Screenshot Moment)
**Description:** Top of every report: a large grade paired with a one-line roast. "C- : This text has never met a noun it didn't want to 'leverage.'" The grade and roast are the screenshot artifact.
**Rationale:** Every shareable diagnostic needs a single, instantly legible top-line result.
**Downsides:** Letter grades feel school-ish. May need a different scale (custom labels, stars, health inspection placards).
**Confidence:** 85%
**Complexity:** Low
**Status:** Unexplored

### 3. Top 5 Offenders with Quoted Text (The Substance)
**Description:** Below the headline, 5 trope "cards." Each: trope name, one-line explanation, quoted sentence from the text with the offending phrase highlighted. "See all N detections" expands full list.
**Rationale:** Quotes ground the diagnosis in evidence. Makes each report genuinely unique.
**Downsides:** Short texts might not have 5 distinct tropes.
**Confidence:** 95%
**Complexity:** Low-Medium
**Status:** Unexplored

### 4. Social Card with Progressive Disclosure (The Distribution Mechanism)
**Description:** Two layers. Layer 1: OG image (1200x630) showing grade, persona, DNA strip, roast line. Renders in Slack/iMessage/Twitter. Layer 2: full interactive page at unique URL. No login to view.
**Rationale:** The OG card IS the distribution mechanism. Spotify Wrapped model.
**Downsides:** Server-side OG image generation is fiddly. Each report needs persistent storage.
**Confidence:** 90%
**Complexity:** Medium
**Status:** Unexplored

### 5. Diplomatic Forwarding Mode (The Social Friction Solver)
**Description:** Two versions of every report. Version A: sharp, funny (for friends). Version B: warm, constructive ("Your post has patterns that readers increasingly associate with AI. Here's where a quick editing pass would help."). Version B includes link to tool.
**Rationale:** Solves the awkwardness of sending someone their diagnosis. Every "sent" report becomes a referral.
**Downsides:** Doubles copy-writing work. Risk of passive-aggressive tone even in gentle mode.
**Confidence:** 80%
**Complexity:** Low
**Status:** Unexplored

### 6. The Clean Score as a Flex ("Suspiciously Human")
**Description:** Clean-scoring text gets its own fun result. "Certified Organic" stamp, "Suspiciously Human" badge. No dead-end results.
**Rationale:** People who write well want validation. Every quiz result needs to feel like a reveal.
**Confidence:** 90%
**Complexity:** Low
**Status:** Unexplored

### 7. The Irony Defense (Hand-Crafted Voice)
**Description:** All report card copy is pre-written, never LLM-generated. Passes the tool's own test. Voice: Letterboxd reviews, not Grammarly feedback.
**Rationale:** A trope-spotting tool that uses tropes is dead on arrival. Someone WILL paste the report card text back in.
**Downsides:** Bounded writing project: ~40 trope descriptions, 8-12 persona archetypes, ~50 roast templates. Weekend of work, not ongoing.
**Confidence:** 95%
**Complexity:** Ongoing editorial effort
**Status:** Unexplored

### 8. The Trope DNA Strip (The Visual Fingerprint)
**Description:** Compact horizontal bar (barcode/DNA strip). Each trope = thin vertical band, color-coded by tier, width = frequency. Every paste generates a unique visual pattern.
**Rationale:** Dense data as color. GitHub contribution graphs, Wordle grids. Builds visual brand recognition.
**Downsides:** Supporting visual, needs grade and persona to contextualize.
**Confidence:** 80%
**Complexity:** Low-Medium
**Status:** Unexplored

## Architectural Decisions (Carried Forward)
- **Heuristic-first engine**: Regex catches 80% of Tier 1-3 tropes. LLM only for semantic patterns. Enables instant results.
- **Zero-friction landing**: The page IS the input. No signup, no explainer.
- **"Grades the writing, not the writer" voice**: Observational language throughout.

## Design Constraints
1. The irony test: paste the report card's own text back in. It must score clean.
2. False positive framing: "These patterns correlate with AI output" not "this was written by AI."
3. Pro-writer positioning: The problem is generic writing, not AI use.
4. No dead-end results: Clean, medium, and heavy scores all produce fun, shareable output.
5. No em dashes in any output (Brent's standing rule).

## Rejection Summary

| # | Idea | Reason Rejected |
|---|------|-----------------|
| 1 | Real-time writing feedback | Grammarly's territory. Not the game. |
| 2 | Browser extension | Distribution channel, not MVP. v2. |
| 3 | Before/after diff view | Crosses into writing tool territory. |
| 4 | Voice drift tracker / longitudinal | Requires accounts. v2 retention feature. |
| 5 | House style ruleset builder | Too complex for MVP. |
| 6 | Team scorecard | Enterprise feature. v3. |
| 7 | Editor's API / batch mode | Enterprise feature. v3. |
| 8 | Embeddable badge | Premature. Requires adoption first. |
| 9 | LinkedIn Trope Index | Content marketing tactic, not product feature. |
| 10 | Adversarial "trope generator" | Fun but different product. |
| 11 | Mugshot/Autopsy theming | Locks in one metaphor too early. Persona engine is more flexible. |
| 12 | Trading card collectibles | Overcomplicates output. |
| 13 | "Which AI wrote this?" profiler | Blurs "patterns not authorship" positioning. |
| 14 | Leaderboard / Hall of Fame | Legal/reputation risk. v2 if community wants it. |
| 15 | Side-by-side comparison | Adds complexity. v2. |
| 16 | Screenshot OCR input | Adds OCR pipeline complexity. v2. |
| 17 | Rewrite-only (no report card) | Contradicts core concept. |
| 18 | One-number product | Single score is what detectors already do. |
| 19 | Ship taxonomy as PDF first | GTM tactic, not product idea. |
| 20 | Five-trope razor | Taxonomy richness IS the value. |
| 21 | Season pass / longitudinal | v2 retention feature. |
| 22 | Corporate batch audit | v2 monetization path. |
| 23 | Non-English support | v2+. English LinkedIn is launch use case. |
| 24 | Scroll-linked heatmap | Power user feature for drill-down page. |

## Session Log
- 2026-03-28: Initial ideation. 40 raw ideas across 5 frames (pain, unmet need, inversion, leverage, assumption-breaking). 8 survivors after filtering.
- 2026-03-28: Reframe correction (social diagnostic, not writing tool). Second round: 32 ideas across 4 frames (social object, unique positioning, report card design, edge cases). 8 survivors after filtering.
- 2026-03-28: Competitive research confirmed gap. Un-AI-ify and tropes.fyi are closest but neither has the social report card layer.
- 2026-03-28: Moving to ce:brainstorm for MVP definition.
