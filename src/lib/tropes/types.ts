export type Tier = 1 | 2 | 3 | 4 | 5;
export type DetectionType = 'heuristic' | 'llm' | 'statistical';

/**
 * The six research-grounded families of robotic-writing tells. Drives the
 * per-category report card and the co-occurrence diversity bonus in scoring.
 */
export type Category =
  | 'lexical'
  | 'syntactic'
  | 'rhetorical'
  | 'structural'
  | 'formatting'
  | 'substance';

/**
 * How trustworthy a tell is as evidence of robotic authorship, independent of
 * how *noticeable* it is (that's `tier`/severity). This is the key correction
 * from the 2026 rebuild: the literature is unambiguous that lexical and
 * em-dash signals are the weakest and most false-positive-prone, while
 * structural and substance signals (burstiness, missing specifics, template
 * shape) are the hardest to fake and the safest to weight. Scoring weights by
 * reliability, NOT by how flashy the tell looks.
 *   - conclusive: near-proof on its own (leaked model markup).
 *   - high:       structural/substance; hard to produce by accident or to instruct away.
 *   - medium:     rhetorical/syntactic moves; suggestive in clusters.
 *   - low:        lexical/formatting; heavy legitimate human use, instruct away in one line.
 */
export type Reliability = 'low' | 'medium' | 'high' | 'conclusive';

export interface TropeDefinition {
  id: string;
  name: string;
  tier: Tier;
  detectionType: DetectionType;
  description: string;
  scoringWeight: number;
  /** Research family. Defaults via meta map if omitted. */
  category?: Category;
  /** Evidentiary weight. Defaults via meta map if omitted. */
  reliability?: Reliability;
  /** One line on what is NOT this pattern — the false-positive guard. */
  guard?: string;
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
