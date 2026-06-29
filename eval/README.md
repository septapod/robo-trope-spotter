# Three-model eval

Compares Claude Opus 4.8, Sonnet 4.6, and Haiku 4.5 on the Robotropes 64-tell detection task. Sonnet 4.6 is the production detector; the Opus and Haiku columns exist to answer whether the recall gap is a prompt problem or a model ceiling (as of the 2026-06-28 run, it is near the ceiling: Opus only reaches 64% family-aware recall).

## Prerequisites

- `ANTHROPIC_API_KEY` available to the run. `run-eval.ts` auto-loads `.env` and `.env.local` from the repo root, so a key in either file is enough; a real env var also works and wins.
- `tsx` installed (added as a dev dep). Run `npm install` if you have not already.

## Quick smoke test

Before running the full eval, verify the harness works against the 5 starter passages with one model and one entry:

```bash
npm run eval -- --models sonnet --limit 1
```

This calls the Sonnet API once, parses the response, scores it, and writes the writeup. If this works, expand.

## Full eval

```bash
npm run eval
```

Runs all 3 models against every entry in `test-set.json`. Saves raw runs to `eval/runs/<timestamp>/<model>/<test-id>.json` and writes the comparison to `eval/results-YYYY-MM-DD.md`.

Actual cost on the 55-passage set × 3 models (2026-06-28 run): about $3.10 total (Opus $2.00, Sonnet $0.82, Haiku $0.29). Opus is the expensive one; add `--models sonnet` to run only the production model for ~$0.80.

## Curating the test set

`test-set.json` is the labeled ground truth. Each entry follows the `TestEntry` shape in `eval/types.ts`:

```json
{
  "id": "unique-slug",
  "source": "linkedin-post | vendor-white-paper | consultant-email | newsletter | human-blog | human-edited-ai | edge-case",
  "attribution": "optional source/URL",
  "passage": "the actual text",
  "groundTruth": [
    { "tropeId": "vocab-hall-of-shame", "confidence": "high", "evidence": "delve, tapestry" }
  ],
  "expectedNonTropes": ["formal-transitions"],
  "notes": "any rationale for the labels"
}
```

`groundTruth` is the set of tropes a correct model should detect. `expectedNonTropes` is the set of tropes that should NOT fire — useful for testing false-positive behavior on edge cases (e.g., a passage that DISCUSSES "load-bearing" without USING the trope; the prompt's DISCUSSION vs USAGE rule should prevent a false positive).

The set has 55 entries covering all five severity tiers and every source category, including 6 adversarial false-positive cases (non-native English, the US Constitution, a neurodivergent-structured passage, a formal academic abstract, legitimate human use of flagged constructs, and clean short text) that must stay clean. Suggested distribution for the trope-bearing entries:

| Source | Target count |
| --- | --- |
| linkedin-post | 10 |
| vendor-white-paper | 8 |
| consultant-email | 6 |
| newsletter | 4 |
| human-blog | 10 (control) |
| human-edited-ai | 6 |
| edge-case | 6 |

Edge cases worth including:
- Passages that DISCUSS tropes without using them (Mollick post is the canonical one).
- Academic abstracts where "Moreover" and "Furthermore" are correct (the prompt has a guard for this; verify it holds).
- Lists with three SPECIFIC concrete items that should NOT trigger triplet-framing.
- Short fragments that are concrete (not punchy-fragments).
- Classical literary contrasts ("not from ignorance, but from fear") that should NOT trigger not-x-its-y.

## Scoring

The built-in harness scores detections by exact `tropeId` match against ground truth. Severity tier comes from the canonical registry, not the model output. Recall and precision are computed across all detections; per-tier metrics group by trope tier.

**Exact-id understates recall, on purpose know this.** The ground-truth labels predate the 2026 taxonomy rebuild, which split several broad ids into precise ones and added 20 new tropes. The model now tags a tell with a newer, more specific id than the label carries, so exact-id matching scores a correct catch as a miss. Two companion scripts correct for this:

- `eval/fair-score.ts <run-dir> [label]` reports exact-id **and** family-aware numbers side by side, where a hit anywhere in an interchangeable family (e.g. any buzzword-cluster id) covers the label, and the deterministic-engine-owned ids are excluded from the LLM's recall. This is the honest yardstick. On the 2026-06-28 Sonnet run: exact-id F1 50.3%, family-aware F1 68.4%.
- `eval/cat-recall.ts <run-dir>` breaks recall down by category to show which families the model systematically misses.
- `eval/validate-rebuild.ts` is a deterministic, no-API check of the scoring engine (length gating, reliability weighting, density normalization). Run it after any `scoring.ts` change before spending tokens on a live eval.

The eval intentionally bypasses the production pipeline's Haiku validation pass and em-dash regex injection. The eval measures **raw model behavior**, not the production cascade.

## Re-scoring without re-running

After tweaking `scoring.ts`, re-score existing runs without spending API tokens:

```bash
npm run eval -- --skip-run
```

This loads the most recent runs from `eval/runs/<timestamp>/` and recomputes the writeup.

## Output structure

```
eval/
├── README.md
├── types.ts
├── scoring.ts                 # built-in exact-id scorer (run during eval)
├── run-eval.ts                # auto-loads .env/.env.local
├── fair-score.ts              # exact-id + family-aware, the honest yardstick
├── cat-recall.ts              # recall broken down by category
├── validate-rebuild.ts        # deterministic scoring-engine check, no API
├── test-set.json              # the labeled ground truth (Brent maintains)
├── results-YYYY-MM-DD.md      # writeup, regenerated each run
└── runs/                      # raw model responses, gitignored
    └── <YYYYMMDD-HHMM>/
        ├── opus/<test-id>.json
        ├── sonnet/<test-id>.json
        └── haiku/<test-id>.json
```

## Interpreting the result

The writeup includes recall, precision, F1, and per-tier breakdown for each model. The recommendation section is intentionally blank in the auto-generated output — Brent fills it in after reviewing the table.

Key questions the eval answers:

1. **Is Sonnet 4.6 dropping enough recall vs Opus to justify upgrading the primary detector?** Settled as of 2026-06-28: stay on Sonnet. Family-aware, Sonnet reaches 56.5% recall vs Opus 64.3%, an 8-point gap for roughly 2.5x the per-analysis cost. Not worth it before launch traffic says recall is the complaint. Re-open this only with real usage data.
2. **Is Haiku 4.5 viable as a fallback?** It lags: 41.7% family-aware recall and 4 never-flag violations on the 2026-06-28 run vs Sonnet's 0. Fine as the cheap validation pass it already plays in production, not as a primary detector.
3. **Are there specific tropes any model systematically misses?** `cat-recall.ts` surfaces this by family. The 2026-06-28 misses clustered in syntactic/rhetorical tells (not-x-its-y, anaphora, rhetorical-self-answer), which drove the v3 prompt pass that recovered them.
