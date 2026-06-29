# Robo Trope Spotter

You know the feeling. You're scrolling LinkedIn and someone posted a thought leadership piece that opens with "In today's rapidly evolving landscape" and closes with "And that changes everything." There are four em dashes in the second paragraph. The word "delve" appears twice. Every sentence is the same length. You can feel the ChatGPT radiating off the screen.

You want to say something. But what do you say? "Hey, your writing sounds like a robot"? Rude. A detailed report card with highlighted examples and a severity score gives them something they can use.

**[robotropes.dxn.is](https://robotropes.dxn.is)**

## How it works

Paste text. (Or a URL. Or a screenshot.) Two engines run. A **statistical engine** measures the things that are arithmetic — sentence-length variance (burstiness), em-dash density, and leaked model markup — exactly, because a language model cannot eyeball its own variance. **Claude Sonnet 4.6** handles the things that need judgment — the rhetoric, the empty vocabulary, the structural tells — against a 64-tell taxonomy. You get back a shareable report card at a unique URL with:

- The original text with color-coded inline highlights on every detected tell
- A score that is **density-normalized per 100 words, weighted by reliability** (structural and substance tells count more than lexical and formatting ones, because they are harder to fake), **co-occurrence-gated** (one lonely "delve" doesn't move it), and shipped with a **confidence band** — anything under ~100 words is too short to score and says so
- A per-family report card (lexical / syntactic / rhetorical / structural / formatting / substance)
- Individual cards for each tell, with explanations, quoted excerpts, and one line of editing advice
- An OG preview image that renders when you drop the link in Slack, iMessage, or a group chat

It is built to be **fair**: it shows characteristics consistent with robotic writing, never a verdict on who wrote the text. The whole detection literature agrees the dominant failure mode is condemning real humans (61% of non-native-English essays get falsely flagged by typical detectors; GPTZero flags the US Constitution), so precision comes first.

## The tropes

64 tells across six research families (lexical, syntactic, rhetorical, structural, formatting, substance), each carrying a reliability weight and a false-positive guard. Severity tiers still drive the playful labels; reliability drives the score. A sampling:

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
