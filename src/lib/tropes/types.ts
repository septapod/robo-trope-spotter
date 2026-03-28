export type Tier = 1 | 2 | 3 | 4 | 5;
export type DetectionType = 'heuristic' | 'llm';

export interface TropeDefinition {
  id: string;
  name: string;
  tier: Tier;
  detectionType: DetectionType;
  description: string;
  scoringWeight: number;
  /** For heuristic tropes: regex pattern to match against text */
  pattern?: RegExp;
  /** For heuristic tropes: word/phrase list to scan for */
  wordList?: string[];
}

export interface AnalysisMatch {
  tropeId: string;
  tier: Tier;
  matchedText: string;
  startIndex: number;
  endIndex: number;
}
