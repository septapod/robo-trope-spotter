import type { TropeDefinition } from './types';

export const tier2: TropeDefinition[] = [
  {
    id: 'fast-paced-world',
    name: 'Fast-Paced World',
    tier: 2,
    detectionType: 'heuristic',
    scoringWeight: 3,
    description:
      'The laziest possible opening for any article about technology, business, or really anything written after 1995. "In today\'s rapidly evolving landscape" is the AI equivalent of a throat-clearing noise. It says nothing and everyone skips it.',
    pattern:
      /\bin (?:today's|the current|our|this) (?:rapidly |ever[- ])?(?:evolving|changing|shifting|fast[- ]paced|dynamic) (?:landscape|world|environment|era|age|digital age|marketplace)\b/gi,
  },
  {
    id: 'ornate-metaphors',
    name: 'Ornate Metaphors',
    tier: 2,
    detectionType: 'heuristic',
    scoringWeight: 3,
    description:
      'AI models reach for the same decorative metaphors like a college freshman reaching for a thesaurus. "Tapestry of innovation." "Beacon of progress." "Fabric of society." These aren\'t metaphors. They\'re wallpaper. Real writers pick metaphors that surprise.',
    wordList: [
      'tapestry of',
      'landscape of',
      'realm of',
      'beacon of',
      'ecosystem of',
      'mosaic of',
      'fabric of',
      'arena of',
      'pillar of',
      'cornerstone of',
      'bedrock of',
      'crucible of',
    ],
  },
  {
    id: 'rhetorical-self-answer',
    name: 'Rhetorical Self-Answer',
    tier: 2,
    detectionType: 'heuristic',
    scoringWeight: 3,
    description:
      'Ask a question, then immediately answer it. "The result? Devastating." "So what does this mean? It means everything." This is the literary equivalent of high-fiving yourself. Once per piece can work. AI does it every other paragraph.',
    pattern:
      /(?:the (?:result|answer|truth|reality|takeaway|bottom line|catch|problem|solution|lesson|key|secret)\?\s+.{2,60}\.|so (?:what|why|how) (?:does|did|is|are|should|can|could) .+?\?\s+(?:it |well,? |simply |the answer is )?)/gi,
  },
  {
    id: 'not-only-but-also',
    name: '"Not Only... But Also"',
    tier: 2,
    detectionType: 'heuristic',
    scoringWeight: 3,
    description:
      'AI adores parallel constructions. "Not only did they improve efficiency, but they also boosted morale." It sounds balanced and polished, which is exactly the problem. Real writing has rough edges. This construction sands them all off.',
    pattern: /\bnot only\b.{3,80}\bbut (?:also|they also|it also|we also)\b/gi,
  },
  {
    id: 'false-suspense',
    name: 'False Suspense',
    tier: 2,
    detectionType: 'heuristic',
    scoringWeight: 3,
    description:
      'Creating drama where none exists. "Here\'s the thing." "Here\'s where it gets interesting." "Let that sink in." If you have to tell the reader something is interesting, it probably isn\'t. This is the writing equivalent of a drumroll before opening a bag of chips.',
    pattern:
      /\b(?:here's (?:the (?:thing|kicker|catch|twist|rub|deal)|where it gets (?:interesting|tricky|complicated|real))|let that sink in|buckle up|you might (?:want to|be) sit(?:ting| down)|spoiler alert|plot twist|wait for it)\b/gi,
  },
  {
    id: 'formulaic-conclusion',
    name: 'Formulaic Conclusion',
    tier: 2,
    detectionType: 'heuristic',
    scoringWeight: 3,
    description:
      'The "In conclusion" of it all. AI wraps up pieces like a fifth-grader ending an essay. "In summary." "Overall." "To wrap things up." Good writing doesn\'t announce that it\'s ending. It just ends.',
    pattern:
      /\b(?:in (?:conclusion|summary|closing)|to (?:summarize|sum up|wrap (?:up|things up))|(?:overall|ultimately|all in all|at the end of the day),?\s)/gi,
  },
  {
    id: 'excessive-hedging',
    name: 'Excessive Hedging',
    tier: 2,
    detectionType: 'heuristic',
    scoringWeight: 3,
    description:
      'AI hedges like a lawyer drafting a liability waiver. "It could be argued." "One might suggest." "This may potentially." It\'s trained to avoid being wrong, so it qualifies everything into meaninglessness. A paragraph with four "mays" is a paragraph that says nothing.',
    pattern:
      /\b(?:it (?:could|might|may) be argued|one (?:could|might|may) (?:argue|suggest|say|contend)|(?:perhaps|possibly|potentially|conceivably) .{0,30}(?:may|might|could)|it is (?:worth|important to) (?:noting|considering|mentioning) that)\b/gi,
  },
  {
    id: 'verdict-language',
    name: 'Verdict Language',
    tier: 2,
    detectionType: 'heuristic',
    scoringWeight: 3,
    description:
      'Handing down a judgment from on high. "That\'s what leadership looks like." "And that changes everything." "This is what the future demands." AI loves to play the wise narrator delivering final verdicts. The reader didn\'t ask for a ruling.',
    pattern:
      /\b(?:that's what .{2,30} looks like|and that (?:changes|makes all the difference|is what matters)|this is (?:what .{2,30} (?:looks like|demands|requires|means))|(?:and |but )?that(?:'s| is) (?:the (?:real|true|whole) (?:story|point|lesson|takeaway)))\b/gi,
  },
  {
    id: 'breathless-enthusiasm',
    name: 'Breathless Enthusiasm',
    tier: 2,
    detectionType: 'heuristic',
    scoringWeight: 3,
    description:
      'Everything is "groundbreaking" and "transformative" and "remarkable." AI writes like a press release for a product launch that will change the world (it won\'t). When everything is extraordinary, nothing is. Save the big words for things that actually earn them.',
    wordList: [
      'groundbreaking',
      'game-changing',
      'game changer',
      'revolutionary',
      'trailblazing',
      'unparalleled',
      'unprecedented',
      'remarkable',
      'extraordinary',
      'paradigm shift',
      'paradigm-shifting',
      'cutting-edge',
      'bleeding-edge',
      'world-class',
      'best-in-class',
    ],
  },
];
