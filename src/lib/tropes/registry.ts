import type { Tier, TropeDefinition } from './types';
import { tier1 } from './tier1';
import { tier2 } from './tier2';
import { tier3 } from './tier3';
import { tier4 } from './tier4';
import { tier5 } from './tier5';

export const allTropes: TropeDefinition[] = [
  ...tier1,
  ...tier2,
  ...tier3,
  ...tier4,
  ...tier5,
];

export const tropeById = (id: string): TropeDefinition | undefined =>
  allTropes.find((t) => t.id === id);

export const tropesByTier = (tier: Tier): TropeDefinition[] =>
  allTropes.filter((t) => t.tier === tier);

export const heuristicTropes: TropeDefinition[] = allTropes.filter(
  (t) => t.detectionType === 'heuristic'
);

export const llmTropes: TropeDefinition[] = allTropes.filter(
  (t) => t.detectionType === 'llm'
);
