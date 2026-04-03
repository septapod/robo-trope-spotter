import type { TropeDefinition, Tier, DetectionType } from './types';

export const tier3: TropeDefinition[] = [
  {
    id: 'formal-transitions',
    name: 'Formal Transitions',
    tier: 3,
    detectionType: 'heuristic',
    scoringWeight: 2,
    description:
      'Your blog post isn\'t a dissertation. "Moreover" and "furthermore" and "additionally" belong in legal briefs and academic papers, not a LinkedIn post about team culture. AI defaults to formal transitions because it learned from formal text. Real humans say "also" or just start a new sentence.',
    wordList: [
      'moreover',
      'furthermore',
      'additionally',
      'consequently',
      'nevertheless',
      'henceforth',
      'notwithstanding',
      'inasmuch as',
      'in light of the foregoing',
      'it bears mentioning',
    ],
  },
  {
    id: 'ai-vocab-cluster',
    name: 'AI Vocab Cluster',
    tier: 3,
    detectionType: 'heuristic',
    scoringWeight: 2,
    description:
      'Any one of these words is fine in isolation, but cluster a few in the same paragraph and your AI detector starts beeping. They sit at the exact center of the model\'s vocabulary distribution, safe and polished enough to appear in any context without friction.',
    wordList: [
      'nuanced',
      'multifaceted',
      'comprehensive',
      'robust',
      'pivotal',
      'meticulous',
      'intricate',
      'commendable',
      'paramount',
      'utilize',
      'facilitate',
      'endeavor',
      'underscore',
      'bolster',
      'harness',
      'synergy',
      'holistic',
    ],
  },
  {
    id: 'listicle-bullets',
    name: 'Listicle Bullets',
    tier: 3,
    detectionType: 'heuristic',
    scoringWeight: 2,
    description:
      'AI turns everything into a numbered list with bold lead-ins. "1. **Improved Efficiency**: By streamlining..." Readable, yes, but also the formatting equivalent of a uniform. Every AI output looks the same, and this pattern is the main reason.',
    pattern:
      /(?:^\d+\.\s+\*\*.+?\*\*[:\s]|^[-*]\s+\*\*.+?\*\*[:\s])/gm,
  },
  {
    id: 'punchy-fragments',
    name: 'Punchy Fragments',
    tier: 3,
    detectionType: 'heuristic',
    scoringWeight: 2,
    description:
      'Short sentence. For emphasis. That lands. Except when every paragraph ends this way, it stops landing and starts grating. AI learned this trick from copywriting courses and now deploys it with the subtlety of a car alarm.',
    pattern:
      /(?:[.!]\s+[A-Z][a-z]{1,12}\.(?:\s+[A-Z][a-z]{1,12}\.){1,})/g,
  },
  {
    id: 'hollow-signaling',
    name: 'Hollow Signaling',
    tier: 3,
    detectionType: 'heuristic',
    scoringWeight: 2,
    description:
      '"It\'s worth noting" that if something were actually worth noting, you wouldn\'t need to announce it. Same with "interestingly" (let the reader decide if it\'s interesting) and "importantly" (ditto). These phrases are filler dressed up as emphasis.',
    pattern:
      /\b(?:it(?:'s| is) (?:worth|important to) (?:not(?:e|ing)|mention(?:ing)?)|interestingly(?:,| enough)|importantly|notably|significantly|remarkably|crucially)(?:,|\s)/gi,
  },
  {
    id: 'stakes-inflation',
    name: 'Stakes Inflation',
    tier: 3,
    detectionType: 'heuristic',
    scoringWeight: 2,
    description:
      'AI treats a SaaS feature update like the moon landing. "This fundamentally reshapes how we think about project management." It added a Gantt chart. When every feature is a watershed moment, the reader tunes out all of them.',
    pattern:
      /\b(?:fundamentally (?:reshap|transform|chang|alter|redefin)|(?:forever|profoundly|irrevocably|fundamentally) chang(?:e|ed|ing)|redefin(?:e|ed|es|ing) (?:what it means|how we|the way)|this is (?:a |the )(?:defining|watershed|seminal|pivotal) moment)\b/gi,
  },
  {
    id: 'participial-overuse',
    name: 'Participial Overuse',
    tier: 3,
    detectionType: 'heuristic',
    scoringWeight: 2,
    description:
      'Trailing "-ing" phrases piled onto sentences like luggage on a roof rack. "The team shipped the feature, improving performance, reducing costs, and enabling new workflows." One participial phrase is fine. Three in a row is AI stacking clauses because it can\'t commit to a period.',
    pattern:
      /,\s+\w+ing\b.{5,40},\s+(?:and\s+)?\w+ing\b/gi,
  },
  {
    id: 'from-x-to-y',
    name: '"From X to Y"',
    tier: 3,
    detectionType: 'heuristic',
    scoringWeight: 2,
    description:
      '"From beginners to experts." "Everything from design to deployment." "From ideation to execution." AI loves this construction because it implies comprehensiveness without any specifics. The range gesture replaces actual detail every time.',
    pattern:
      /\bfrom \w[\w\s]{1,25} to \w[\w\s]{1,25}(?:,|\.|\band\b)/gi,
  },
  {
    id: 'triplet-framing',
    name: 'Triplet Framing',
    tier: 3,
    detectionType: 'heuristic',
    scoringWeight: 2,
    description:
      'Everything comes in threes. "Speed, scale, and simplicity." "Plan, build, and ship." "Clear, concise, and compelling." The rule of three is a real rhetorical device, but AI applies it on autopilot. When every sentence is a triad, the pattern becomes the message.',
    pattern:
      /\b(\w+),\s+(\w+),\s+and\s+(\w+)\b/gi,
  },
  {
    id: 'anaphora-abuse',
    name: 'Anaphora Abuse',
    tier: 3,
    detectionType: 'heuristic',
    scoringWeight: 2,
    description:
      '"They built the platform. They scaled the team. They changed the industry." Repetition at the start of consecutive sentences is a powerful rhetorical device when used deliberately (ask MLK). AI uses it like a toddler who just learned a new word.',
    pattern:
      /(?:^|\n)((?:they|we|it|she|he|this|these|the company|the team)\b.+?\.\s*){3,}/gi,
  },
  {
    id: 'equivocation-seesaw',
    name: 'Equivocation Seesaw',
    tier: 3,
    detectionType: 'heuristic',
    scoringWeight: 2,
    description:
      'Make a claim, then immediately soften it. "This is a major breakthrough, though challenges remain." "The results are promising, but more research is needed." AI is allergic to taking a position. Every assertion gets an instant counterweight, leaving the reader exactly where they started.',
    pattern:
      /\b(?:however|though|that said|on the other hand|at the same time|but it(?:'s| is) (?:important|worth|crucial) to (?:note|remember|consider|keep in mind))\b/gi,
  },
  {
    id: 'latinate-vocab',
    name: 'Latinate Vocabulary',
    tier: 3,
    detectionType: 'heuristic',
    scoringWeight: 2,
    description:
      '"Utilize" instead of "use." "Facilitate" instead of "help." "Commence" instead of "start." AI defaults to the fancier word because its training data is full of academic papers and corporate memos. Clear writing picks the shorter word almost every time.',
    wordList: [
      'utilize',
      'facilitate',
      'commence',
      'terminate',
      'endeavor',
      'ascertain',
      'elucidate',
      'delineate',
      'promulgate',
      'effectuate',
      'operationalize',
      'conceptualize',
      'incentivize',
    ],
  },
  {
    id: 'dramatic-countdown',
    name: 'Dramatic Countdown',
    tier: 3,
    detectionType: 'heuristic',
    scoringWeight: 2,
    description:
      '"Not complex. Not costly. Just effective." Three short negations (or affirmations) building to a mic drop. AI borrowed this from ad copy and uses it constantly. It works in a Nike commercial because you hear it once. In AI text, it shows up every 200 words.',
    pattern:
      /(?:not \w+\.\s+not \w+\.\s+(?:just|only|simply) \w+\.)/gi,
  },
  {
    id: 'colon-preface',
    name: 'Colon Preface',
    tier: 3,
    detectionType: 'heuristic',
    scoringWeight: 2,
    description:
      '"Here\'s the takeaway: start with the member." "The lesson is clear: invest early." AI loves to build a little runway before the actual point, using a colon as the launchpad. Once or twice is fine. But when every insight needs a setup clause, the text reads like a series of fortune cookies.',
    pattern:
      /\b(?:(?:here's|here is) the (?:takeaway|key|point|lesson|truth|reality|bottom line)|the (?:takeaway|key|point|lesson|answer|truth|reality|message|implication) (?:is |here (?:is )?)?(?:clear|simple|obvious|straightforward)?)\s*:/gi,
  },
  {
    id: 'elegant-variation',
    name: 'Elegant Variation',
    tier: 3 as Tier,
    detectionType: 'llm' as DetectionType,
    scoringWeight: 2,
    description:
      'AI avoids repeating a word by cycling through synonyms for the same thing. A company becomes "the platform," then "this tool," then "the solution," then "the offering," all in the same paragraph. Each synonym tries to sound fresh, but the effect is the opposite: the reader notices the writer is dancing around repetition instead of owning it.',
  },
  {
    id: 'despite-challenges-pivot',
    name: '"Despite Challenges" Pivot',
    tier: 3 as Tier,
    detectionType: 'llm' as DetectionType,
    scoringWeight: 2,
    description:
      'A rigid three-part formula: acknowledge something positive, list challenges or concerns, then pivot to vague optimism about the future. "Despite these challenges, the potential remains significant." AI uses this structure to handle any topic that involves tradeoffs, and it always lands in the same noncommittal place.',
  },
];
