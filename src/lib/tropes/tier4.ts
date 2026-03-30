import type { TropeDefinition } from './types';

export const tier4: TropeDefinition[] = [
  {
    id: 'consensus-middle',
    name: 'Consensus Middle',
    tier: 4,
    detectionType: 'llm',
    scoringWeight: 1.5,
    description:
      'Every word is the safest possible pick from the center of the vocabulary distribution. The adjectives are predictable, the verb choices generic, and the whole thing reads like a committee wrote it, because statistically, a committee did (a committee of billions of training tokens all averaged together).',
  },
  {
    id: 'uniform-length',
    name: 'Uniform Sentence Length',
    tier: 4,
    detectionType: 'llm',
    scoringWeight: 1.5,
    description:
      'Human sentences range from 3 words to 40. AI sentences cluster between 15 and 25 like they\'re observing a speed limit, and the variance is unnervingly low. Real writers alternate between terse bursts and winding, clause-heavy builds. AI just cruises at one speed.',
  },
  {
    id: 'missing-specifics',
    name: 'Missing Specifics',
    tier: 4,
    detectionType: 'llm',
    scoringWeight: 1.5,
    description:
      '"Various sectors" instead of naming three companies. "Numerous studies" without citing one. "Significant impact" without a number. AI is allergic to specifics because specifics can be wrong, and being wrong is the one thing it\'s trained to avoid. The result is prose that gestures vaguely at reality.',
  },
  {
    id: 'treadmill-effect',
    name: 'Treadmill Effect',
    tier: 4,
    detectionType: 'llm',
    scoringWeight: 1.5,
    description:
      'The text moves its legs but goes nowhere. The same point gets restated in slightly different words, paragraph after paragraph. "Innovation drives growth. By innovating, organizations can grow. Growth-oriented organizations prioritize innovation." You just read three sentences that said one thing.',
  },
  {
    id: 'third-person-detachment',
    name: 'Third-Person Detachment',
    tier: 4,
    detectionType: 'llm',
    scoringWeight: 1.5,
    description:
      '"One might consider the implications." "It could be observed that." AI writes like an anthropologist studying humans from behind a two-way mirror. Real people say "I think" or "you should try." The clinical distance is a safety mechanism, and readers feel it.',
  },
  {
    id: 'serves-as-dodge',
    name: '"Serves As" Dodge',
    tier: 4,
    detectionType: 'llm',
    scoringWeight: 1.5,
    description:
      '"Is" becomes "serves as." "Works as" becomes "stands as." "Shows" becomes "represents." AI avoids direct statements the way a diplomat avoids direct answers. "The dashboard serves as a window into performance" just means "the dashboard shows performance." Say that instead.',
  },
  {
    id: 'importance-adverbs',
    name: 'Importance Adverbs',
    tier: 4,
    detectionType: 'llm',
    scoringWeight: 1.5,
    description:
      '"Quietly orchestrating." "Deeply transformative." "Remarkably consistent." AI sprinkles these adverbs like seasoning to make bland sentences taste important. If you have to tell the reader something is deep or remarkable, the sentence itself probably isn\'t doing the work.',
  },
  {
    id: 'uniform-tone',
    name: 'Uniform Tone',
    tier: 4,
    detectionType: 'llm',
    scoringWeight: 1.5,
    description:
      'The politeness level stays constant from first word to last, the formality never shifts, and the emotional register holds perfectly flat. The writer never gets angry or funny. Human writing has texture because human moods have texture, and AI flattens all of it out.',
  },
];
