import { AnalysisMatch, Tier } from '@/lib/tropes/types';

export type { AnalysisMatch };

export interface HeuristicResult {
  matches: AnalysisMatch[];
  processingTimeMs: number;
}

export interface LlmDetection {
  tropeId: string;
  tier: Tier;
  confidence: number; // 0-1
  count: number; // how many times the pattern appears
  matchedExcerpts: string[];
  explanation: string;
  suggestion: string; // what a human writer would do instead
}

export interface LlmResult {
  detections: LlmDetection[];
  processingTimeMs: number;
}

export interface FullAnalysisResult {
  heuristicMatches: AnalysisMatch[];
  llmDetections: LlmDetection[];
  totalProcessingTimeMs: number;
}
