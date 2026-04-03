# Robo Trope Spotter

**Status:** Live at robotropes.dxn.is, actively iterating

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
- [x] Typography: Bricolage Grotesque (display) + Outfit (body) + JetBrains Mono (data)
- [x] Bold candy color palette (pink, yellow, orange, teal, green, purple, blue)
- [x] Human-readable severity labels: Dead Giveaway, Red Flag, Worth Noting, Subtle Tell, Deep Cut
- [x] Supplemental em dash highlighting (catches all instances, not just LLM-quoted ones)
- [x] SSRF protection, input size limits, proper error surfacing
- [x] Custom favicon, branded 404 page, light-theme OG images
- [x] Reanalyze endpoint for updating old reports with new scoring

## Recent Changes
- [x] Added two new Tier 3 tropes: Elegant Variation and "Despite Challenges" Pivot (LLM-detected)
- [x] Added temporal awareness guidance to LLM analysis prompt (weight currently prevalent patterns higher)
- [x] Updated score explanation copy in ScoreHero and tropes page to emphasize clustering over individual flags
- [x] Fuzzy excerpt matching for highlighted text (normalize whitespace, prefix/middle/ellipsis fallbacks)
- [x] Contrast accessibility pass: all text-zinc-400 upgraded to text-zinc-500 or text-zinc-600 across app
- [x] TropeCard severity badges now use solid color backgrounds with white text for readability
- [x] Roast line text changed from dynamic labelColor to text-zinc-700 for consistent readability

## What's Next
- [ ] Persona/archetype typing (v2 shareability feature)
- [ ] Browser extension (v2 distribution)
- [ ] Rate limiting on public API
- [ ] Scoring calibration against more real-world samples

## Key Decisions
- Social diagnostic, not a writing tool (no Grammarly territory)
- LLM-primary analysis (Claude Sonnet 4.6), heuristic engine deprecated
- Density-normalized scoring: short texts with dense tropes score higher
- Em dash scoring capped at 4 points (density signal, never dominates)
- Tagline: "Because someone should tell them."
- Reports are public by URL, no public archive or browse page
