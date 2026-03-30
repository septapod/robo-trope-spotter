import type { TropeDefinition } from './types';

export const tier5: TropeDefinition[] = [
  {
    id: 'low-perplexity',
    name: 'Low Perplexity',
    tier: 5,
    detectionType: 'llm',
    scoringWeight: 1,
    description:
      'Every word in this text is the statistically safest choice given the words before it. That\'s literally how language models work, picking the highest-probability next token. The result reads smoothly but predictably, like a song where you can always guess the next note, and it never takes the weird left turn that makes human writing feel alive.',
  },
  {
    id: 'low-burstiness',
    name: 'Low Burstiness',
    tier: 5,
    detectionType: 'llm',
    scoringWeight: 1,
    description:
      'Burstiness measures how much sentence length varies. Humans are bursty. We write a 6-word zinger, then a 40-word monster, then something in between. AI flattens this curve into a gentle hum. The standard deviation of sentence lengths in AI text is measurably, consistently lower than in human text.',
  },
  {
    id: 'perfect-grammar',
    name: 'Perfect Grammar',
    tier: 5,
    detectionType: 'llm',
    scoringWeight: 1,
    description:
      'Zero typos, zero fragments, zero sentences starting with "And" or "But," and not a single comma splice or stylistic risk anywhere. This sounds like a compliment until you realize that real writers break rules on purpose, constantly. Perfect grammar in a casual blog post is like wearing a tuxedo to a barbecue.',
  },
  {
    id: 'style-consistency',
    name: 'Style Consistency',
    tier: 5,
    detectionType: 'llm',
    scoringWeight: 1,
    description:
      'The comma habits hold steady from paragraph one to paragraph fifty, the capitalization choices never waver, and the formatting conventions show zero drift. Humans are inconsistent creatures who sometimes use an Oxford comma and sometimes don\'t, even in the same document. AI\'s unwavering perfection is itself the tell.',
  },
  {
    id: 'hollow-sensory',
    name: 'Hollow Sensory Details',
    tier: 5,
    detectionType: 'llm',
    scoringWeight: 1,
    description:
      '"The aroma of fresh coffee filled the room." "Sunlight streamed through the window." "A gentle breeze carried the scent of pine." AI sprinkles generic sensory details like stock photos in a PowerPoint. They\'re technically descriptive but weirdly impersonal, because the model has never smelled coffee or felt a breeze.',
  },
];
