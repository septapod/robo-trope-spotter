# Robo Trope Spotter

You know the feeling. You're scrolling LinkedIn and someone posted a thought leadership piece that opens with "In today's rapidly evolving landscape" and closes with "And that changes everything." There are four em dashes in the second paragraph. The word "delve" appears twice. Every sentence is the same length. You can feel the ChatGPT radiating off the screen.

You want to say something. But what do you say? "Hey, your writing sounds like a robot"? Rude. A detailed report card with highlighted examples and a severity score gives them something they can actually use.

**[robotropes.dxn.is](https://robotropes.dxn.is)**

## How it works

Paste text. (Or a URL. Or a screenshot.) The app sends it to Claude Sonnet 4.6 with a 42-pattern trope taxonomy covering five severity tiers. You get back a shareable report card at a unique URL with:

- The original text with color-coded inline highlights on every detected pattern
- A density-normalized trope score (shorter texts packed with tropes score higher)
- Individual cards for each pattern found, with severity labels, explanations, and quoted excerpts
- An OG preview image that renders when you drop the link in Slack, iMessage, or a group chat

## The tropes

42 patterns, five tiers of severity:

**Dead Giveaway.** "It's not X, it's Y." Em dash addiction. The vocabulary hall of shame: delve, tapestry, landscape, leverage, innovative, transformative. Leftover AI artifacts. Fabricated citations ("studies show" with no study named).

**Red Flag.** "In today's rapidly evolving landscape." Rhetorical self-answers ("The result? Devastating."). False suspense ("Here's the thing."). Formulaic conclusions. Breathless enthusiasm with no substance behind it.

**Worth Noting.** "Moreover" in a LinkedIn post. Bold-first bullet formatting. Punchy fragments for manufactured emphasis. Ideas grouped in threes on autopilot. Colon prefaces that add nothing.

**Subtle Tell.** Safe, predictable word choices throughout. Sentences clustering between 15 and 25 words. Vague language where a human would be specific, and the same flat tone from first paragraph to last.

**Deep Cut.** Flat sentence-length variation, perfect grammar as an uncanny signal, and the kind of consistency in style and formatting that only a machine would sustain.

## Because someone should tell them

The whole point of this tool is that you can paste someone's writing, get a report card, and send them the link. The tone is playful and the intent is constructive. The hope is that next time they'll do one more editing pass before hitting publish.

## Running it yourself

```bash
git clone https://github.com/septapod/robo-trope-spotter.git
cd robo-trope-spotter
npm install
```

You need two environment variables in a `.env` file:

```
DATABASE_URL=postgresql://...neon-connection-string...
ANTHROPIC_API_KEY=sk-ant-...
```

Then:

```bash
npm run db:push   # create the reports table
npm run dev       # start the app
```

## Stack

Next.js 16 on Vercel. Claude Sonnet 4.6 for analysis and screenshot OCR. Neon Postgres for report persistence. Bricolage Grotesque, Outfit, and JetBrains Mono for typography. @vercel/og for social preview images. @mozilla/readability for URL extraction.

## Rate limits

20 analyses per IP per hour. 500 total per day.

## License

[CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/). Use it, remix it, share it. Give credit. Keep it non-commercial.
