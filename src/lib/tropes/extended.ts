import type { TropeDefinition } from './types';

/**
 * Extended taxonomy (2026 rebuild). Eighteen tells the original 42 missed,
 * drawn from the excess-vocabulary studies (Kobak 2024; FSU "delve" 2024), the
 * Wikipedia "Signs of AI writing" guide, and Brent's own anti-slop rule set.
 *
 * Deterministic tells (leaked-markup, emoji-bullets, title-case-headers,
 * excessive-bolding) are detected by the statistical engine, not the LLM, so
 * their counts are exact. The rest are LLM tells with a guard line apiece.
 */
export const extendedTropes: TropeDefinition[] = [
  // ---------- Formatting / deterministic ----------
  {
    id: 'leaked-markup',
    name: 'Leaked Model Markup',
    tier: 1,
    detectionType: 'statistical',
    scoringWeight: 6,
    category: 'formatting',
    reliability: 'conclusive',
    description:
      'Copy-paste residue from the model\'s own plumbing: oai_citation, contentReference, turn0search, the :contentReference[oaicite] tags, or 【】 bracket citations. When these survive into a published draft, there is no ambiguity left to argue about. Someone pasted straight from a chat window and never read it.',
    guard: 'A genuine [1] footnote marker or a real citation is not this. Only the model-specific tokens count.',
  },
  {
    id: 'emoji-bullets',
    name: 'Emoji Bullets',
    tier: 2,
    detectionType: 'statistical',
    scoringWeight: 3,
    category: 'formatting',
    reliability: 'medium',
    description:
      'Lines that open with a decorative emoji standing in for a bullet: ✅ this, 🚀 that, 💡 the other. Default LLM formatting for any "benefits" list. A human reaches for a hyphen.',
    guard: 'One emoji inside a sentence is fine. This is emoji used as the structural list marker, repeatedly.',
  },
  {
    id: 'title-case-headers',
    name: 'Title Case Headers',
    tier: 3,
    detectionType: 'statistical',
    scoringWeight: 2,
    category: 'formatting',
    reliability: 'low',
    description:
      'Headers That Capitalize Every Major Word, reflexively, in contexts where sentence case is the human norm (a LinkedIn post, a casual blog). Models default to title case because their training corpus is full of it.',
    guard: 'Title case is correct in many publications and style guides. Weak signal; only matters alongside others.',
  },
  {
    id: 'excessive-bolding',
    name: 'Excessive Bolding',
    tier: 3,
    detectionType: 'statistical',
    scoringWeight: 2,
    category: 'formatting',
    reliability: 'low',
    description:
      'Bolding any phrase the model judged "important," until a large fraction of the text is bold and none of it stands out. Emphasis works by scarcity; this is emphasis by the bucket.',
    guard: 'A few bolded terms in a long doc is normal. Flags only when bold density is high.',
  },

  // ---------- Lexical families (the excess-vocabulary studies) ----------
  {
    id: 'significance-verbs',
    name: 'Significance Verbs',
    tier: 3,
    detectionType: 'llm',
    scoringWeight: 2,
    category: 'lexical',
    reliability: 'low',
    description:
      'The copula-avoidance verbs: underscore, highlight, showcase, exemplify, illustrate, demonstrate, reflect, signify, illuminate. "This underscores the importance of X" is just "this matters because X" wearing a blazer. "underscores" rose 904% in abstracts after ChatGPT; "showcasing" rose 1,396%.',
    guard: 'Any one of these can be the right word. Flag the habit of reaching for them instead of "is" or "shows."',
  },
  {
    id: 'container-nouns',
    name: 'Empty Container Nouns',
    tier: 3,
    detectionType: 'llm',
    scoringWeight: 2,
    category: 'lexical',
    reliability: 'low',
    description:
      'Abstract vessels for nothing in particular: realm, landscape, tapestry, ecosystem, paradigm, nexus, sphere, domain, fabric, frontier. "In the realm of the digital landscape" is two of them holding hands and saying nothing.',
    guard: '"Ecosystem" for an actual biological or software ecosystem is literal and fine. Flag the decorative use.',
  },
  {
    id: 'journey-verbs',
    name: 'Corporate Journey Verbs',
    tier: 3,
    detectionType: 'llm',
    scoringWeight: 2,
    category: 'lexical',
    reliability: 'low',
    description:
      'The uplift register: leverage, foster, harness, unlock, unleash, elevate, cultivate, spearhead, catalyze, propel, amplify, empower, streamline. "We harness data to empower teams and unlock potential" is three of them in one breath, and it means "we use data."',
    guard: '"Leverage" in a finance context (financial leverage) is literal. Flag the metaphorical pile-up.',
  },
  {
    id: 'travel-brochure',
    name: 'Travel-Brochure Words',
    tier: 3,
    detectionType: 'llm',
    scoringWeight: 2,
    category: 'lexical',
    reliability: 'low',
    description:
      'The words a model reaches for to describe a place, a product, or a person it admires: nestled, vibrant, bustling, renowned, breathtaking, picturesque, charming, boasts, a hidden gem, in the heart of. "boasts" alone rose 918% in abstracts. Inanimate things do not boast.',
    guard: 'Travel and real-estate copy uses these by convention. Genre-aware: weaker in a product page than a personal note.',
  },
  {
    id: 'testament-collocation',
    name: '"A Testament To"',
    tier: 2,
    detectionType: 'llm',
    scoringWeight: 3,
    category: 'lexical',
    reliability: 'low',
    description:
      'Hollow grandeur in fixed phrases: "a testament to," "stands as a beacon of," "plays a pivotal role in," "leaves an indelible mark," "a reminder that." They sound like meaning and carry none.',
    guard: 'Rare; usually a clean tell when present. Still, one earnest "a reminder that" is not a conviction.',
  },

  // ---------- Rhetorical ----------
  {
    id: 'vague-universal-opener',
    name: 'Cosmic Throat-Clearing',
    tier: 2,
    detectionType: 'llm',
    scoringWeight: 3,
    category: 'rhetorical',
    reliability: 'medium',
    description:
      'The opener that fits any essay because it is about nothing: "In a world where," "We live in an age of," "Since the dawn of time," "More than ever," "At its core." A warm-up lap the reader has to run before the writing starts.',
    guard: 'A specific scene-setting opener is fine. This flags the universal, swappable preamble.',
  },
  {
    id: 'false-vulnerability',
    name: 'Performed Candor',
    tier: 3,
    detectionType: 'llm',
    scoringWeight: 2,
    category: 'rhetorical',
    reliability: 'low',
    description:
      'Announcing honesty instead of being honest: "Let me be honest," "Truth be told," "I\'ll be real with you," "Let\'s be clear." Real candor doesn\'t need a label, and the label usually precedes something bland.',
    guard: 'Occasional use is human and fine. Flags the tic, especially as a recurring paragraph-starter.',
  },
  {
    id: 'scaffold-opener',
    name: 'Scaffold Openers',
    tier: 3,
    detectionType: 'llm',
    scoringWeight: 2,
    category: 'rhetorical',
    reliability: 'medium',
    description:
      'A runway that announces what the sentence is about to do before it does it: "The part that stuck with me is," "What\'s interesting here is," "The thing to notice is," "What matters is," "The reason this works is." Strip the scaffold and lead with the actual idea. "The part that stuck with me is the ending" is just "The ending stuck with me."',
    guard: 'A real subject-first sentence is the goal, not the violation. Flag the announce-then-state cadence.',
  },
  {
    id: 'imperative-cta-close',
    name: 'Motivational Sign-Off',
    tier: 3,
    detectionType: 'llm',
    scoringWeight: 2,
    category: 'rhetorical',
    reliability: 'low',
    description:
      'The closing pep talk: "So the next time you…," "Remember:," "Embrace the…," "The choice is yours." LinkedIn-coach ending grafted onto any topic.',
    guard: 'A genuine call to action in marketing copy is doing its job. Flags the reflexive uplift close.',
  },

  // ---------- Syntactic ----------
  {
    id: 'wh-cleft',
    name: 'Wh-Cleft Fronting',
    tier: 3,
    detectionType: 'llm',
    scoringWeight: 2,
    category: 'syntactic',
    reliability: 'medium',
    description:
      'Starting with "What X does/needs/is…" and then delivering the real subject later: "What this moment demands is bold action." The plain version leads with the subject: "This moment demands bold action."',
    guard: 'A real question ("What does this cost?") is not a cleft. Flag the it-cleft/wh-cleft used to inflate.',
  },
  {
    id: 'fronted-clause-default',
    name: 'Fronted-Clause Metronome',
    tier: 4,
    detectionType: 'llm',
    scoringWeight: 1.5,
    category: 'syntactic',
    reliability: 'high',
    description:
      'Most sentences open with a dependent clause before the main one: "When organizations embrace change, they unlock potential. Because the market shifted, teams adapted. As the data grew, patterns emerged." One or two is rhythm. As the default sentence shape, it is a machine pouring every thought into the same mold.',
    guard: 'Requires the pattern to dominate the passage, not appear twice. A whole-text property, like burstiness.',
  },
  {
    id: 'abstract-noun-subject',
    name: 'Abstract-Noun Subjects',
    tier: 4,
    detectionType: 'llm',
    scoringWeight: 1.5,
    category: 'syntactic',
    reliability: 'medium',
    description:
      'The actor disappears behind an abstraction: "The decision carries weight." "This realization transformed the team." Who decided? Who realized? Human writing tends to name the person and the verb; the machine hides them inside a noun.',
    guard: 'Abstract subjects are sometimes exactly right. Flags the habit of hiding agents, not a single instance.',
  },

  // ---------- Substance ----------
  {
    id: 'both-sides-balance',
    name: 'False Balance',
    tier: 4,
    detectionType: 'llm',
    scoringWeight: 1.5,
    category: 'substance',
    reliability: 'high',
    description:
      'Every view presented with equal weight and no judgment: "There are advantages and disadvantages, and reasonable people disagree." The model is trained to avoid being wrong, so it commits to nothing and calls the fence a conclusion.',
    guard: 'Genuinely presenting a real tradeoff with a stance is not this. Flags the refusal to ever land.',
  },
  {
    id: 'it-depends-nonanswer',
    name: '"It Depends" Non-Answer',
    tier: 3,
    detectionType: 'llm',
    scoringWeight: 2,
    category: 'substance',
    reliability: 'high',
    description:
      'Naming the factors instead of resolving them: "The best choice depends on your needs, budget, goals, and context." Technically true, completely useless, and a reliable sign nobody (or nothing) wanted to risk an actual answer.',
    guard: '"It depends, and here is how to decide" is a real answer. Flags "it depends" used as the whole answer.',
  },
  {
    id: 'restating-the-prompt',
    name: 'Restating the Prompt',
    tier: 3,
    detectionType: 'llm',
    scoringWeight: 2,
    category: 'substance',
    reliability: 'high',
    description:
      'Answering a question by paraphrasing it. Asked how to improve retention: "Improving retention means getting people to stay, which requires focusing on retention." The text moves its mouth and says the question back.',
    guard: 'Briefly framing a question before answering is normal. Flags an answer that is only the question, reworded.',
  },
  {
    id: 'circular-padding',
    name: 'Circular Padding',
    tier: 4,
    detectionType: 'llm',
    scoringWeight: 1.5,
    category: 'substance',
    reliability: 'medium',
    description:
      'Defining a thing by restating it. "Effective communication is about communicating effectively." "Success requires being successful." The sentence completes a loop and deposits the reader exactly where they started.',
    guard: 'A real definition that adds information is fine. Flags the tautology dressed as insight.',
  },
];
