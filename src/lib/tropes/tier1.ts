import type { TropeDefinition } from './types';

export const tier1: TropeDefinition[] = [
  {
    id: 'not-x-its-y',
    name: '"It\'s not X, it\'s Y"',
    tier: 1,
    detectionType: 'heuristic',
    scoringWeight: 5,
    description:
      'The single most commonly identified AI writing tell. A stray instance is forgivable, but ten in a blog post insults the reader. AI models love this rhetorical move because it sounds profound while requiring zero actual insight.',
    pattern:
      /\b(?:it(?:'s| is)|this (?:isn't|is not)) not .+?,?\s*(?:it(?:'s| is)|this is) .+?[.!]/gi,
  },
  {
    id: 'em-dash-addiction',
    name: 'Em Dash Addiction',
    tier: 1,
    detectionType: 'heuristic',
    scoringWeight: 5,
    description:
      'This text treats em dashes like oxygen. GPT-4o uses roughly 10x more em dashes than GPT-3.5, and readers now pattern-match them as a robot tell. A couple per page blend in, but a couple per paragraph announce the machine.',
    pattern: /\u2014/g,
  },
  {
    id: 'vocab-hall-of-shame',
    name: 'Vocab Hall of Shame',
    tier: 1,
    detectionType: 'heuristic',
    scoringWeight: 5,
    description:
      'The word "delve" spiked 900% in academic papers after ChatGPT launched. A Chapman professor went viral saying if it shows up in your paper, there\'s a 99% chance AI wrote it. These words are fine in small doses. Their sudden ubiquity is the giveaway.',
    wordList: [
      'delve',
      'tapestry',
      'landscape',
      'pivotal',
      'robust',
      'leverage',
      'facilitate',
      'moreover',
      'embark',
      'foster',
      'seamless',
      'innovative',
      'transformative',
      'underscores',
      'navigating',
      'realm',
      'multifaceted',
      'cornerstone',
    ],
  },
  {
    id: 'leftover-artifacts',
    name: 'Leftover Artifacts',
    tier: 1,
    detectionType: 'heuristic',
    scoringWeight: 5,
    description:
      'Oops. Someone forgot to proofread the AI output. "As a large language model" is the classic, but you also see placeholder brackets, table stubs, and half-finished instructions the model was supposed to fill in. This is the AI equivalent of leaving the price tag on your shirt.',
    pattern:
      /(?:as (?:a|an) (?:large )?language model|as an AI|I (?:don't|cannot) have (?:personal )?(?:opinions|experiences|feelings)|\[insert .+?\]|\[Table \d+\]|\[Figure \d+\]|\[Source\]|\[Citation needed\])/gi,
  },
  {
    id: 'fabricated-citations',
    name: 'Fabricated Citations',
    tier: 1,
    detectionType: 'heuristic',
    scoringWeight: 5,
    description:
      'The rhetorical equivalent of a fake Rolex. "Studies show" without naming the study. "Experts say" without naming the expert. "Research suggests" without linking the research. AI loves these because they sound authoritative while committing to nothing.',
    pattern:
      /\b(?:studies (?:show|suggest|indicate|have shown|demonstrate|reveal)|research (?:shows|suggests|indicates|has shown|demonstrates)|experts (?:say|suggest|agree|believe|recommend)|according to (?:experts|researchers|studies|recent research))(?!\s*(?:at|from|by|published|conducted|led|in the)\b)/gi,
  },
  {
    id: 'sycophantic-opener',
    name: 'Sycophantic Opener',
    tier: 1,
    detectionType: 'heuristic',
    scoringWeight: 5,
    description:
      'Nothing screams "a chatbot wrote this" like opening with lavish praise of the question itself. "Great question!" "That\'s a really insightful observation!" Real humans just answer the question. They don\'t warm up with a compliment first.',
    pattern:
      /^(?:great question|that's (?:a |an )?(?:really |very )?(?:great|excellent|insightful|thoughtful|fascinating|wonderful|fantastic|interesting) (?:question|observation|point|insight)|what (?:a |an )?(?:great|excellent|insightful|thoughtful|fascinating) (?:question|observation|point))[.!]/gim,
  },
];
