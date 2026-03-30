# Robo Trope Spotter

**See the AI writing tropes. Get the report card. Send it to someone who needs it.**

[robotropes.dxn.is](https://robotropes.dxn.is)

Robo Trope Spotter identifies specific writing patterns that make text feel AI-generated, formulaic, or machine-assisted. It produces a shareable report card with inline highlighting, severity scoring, and quoted examples.

This is a social diagnostic tool. Think personality quiz meets gentle roast. Paste in a LinkedIn post, a blog article, or a newsletter draft. See what readers already notice. Because someone should tell them.

## What it does

1. **Paste text** (or a URL, or a screenshot)
2. **Claude Sonnet 4.6 analyzes** the text against a 42-pattern trope taxonomy across 5 severity tiers
3. **Get a report card** at a unique shareable URL with:
   - A density-normalized trope score (weighted by severity, adjusted for text length)
   - The original text with inline color-coded highlights on every detected pattern
   - Individual trope cards with severity labels, explanations, and quoted excerpts
   - An OG image that renders in Slack, iMessage, LinkedIn, and Twitter previews

## What it detects

42 named patterns across 5 tiers:

- **Dead Giveaway** (Tier 1): "It's not X, it's Y" constructions, em dash overuse, the vocabulary hall of shame (delve, tapestry, landscape, leverage), leftover AI artifacts, fabricated citations
- **Red Flag** (Tier 2): "In today's rapidly evolving landscape," rhetorical self-answers ("The result?"), false suspense ("Here's the thing."), formulaic conclusions, excessive hedging
- **Worth Noting** (Tier 3): Formal transitions in casual writing, listicle bullet formatting, punchy fragments for manufactured emphasis, triplet framing, colon prefaces
- **Subtle Tell** (Tier 4): Consensus-middle word choices, uniform sentence lengths, missing specifics, the treadmill effect (same point restated), uniform tone
- **Deep Cut** (Tier 5): Low burstiness, perfect grammar as an uncanny signal, style over-consistency

## What it does not do

This is not an AI detector. It does not answer "was this written by AI?" It answers "what specific patterns make this text feel robotic?" A human who writes with these patterns gets the same flags.

## Stack

- Next.js 16 (App Router) on Vercel
- Claude Sonnet 4.6 via Anthropic API (analysis + screenshot OCR)
- Neon Postgres + Drizzle ORM (report persistence)
- Bricolage Grotesque + Outfit + JetBrains Mono (typography)
- @vercel/og for social preview images
- @mozilla/readability for URL content extraction

## Running locally

```bash
git clone https://github.com/septapod/robo-trope-spotter.git
cd robo-trope-spotter
npm install
```

Create a `.env` file:

```
DATABASE_URL=postgresql://...your-neon-connection-string...
ANTHROPIC_API_KEY=sk-ant-...
```

Set up the database and start:

```bash
npm run db:push
npm run dev
```

## Rate limits

- 20 analyses per IP per hour
- 500 total analyses per day (global cap)

## License

Private repository. Not open source.
