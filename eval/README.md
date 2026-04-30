# Three-model eval

Compares Claude Opus 4.7, Sonnet 4.6, and Haiku 4.5 on the Robotropes 42-trope detection task. Output drives the model decision for the production cascade (U1 of the launch sprint).

## Prerequisites

- `ANTHROPIC_API_KEY` in your environment (a `.env` file at repo root works if loaded; the script reads the env var directly).
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

Estimated cost on 50 passages × 3 models: ~$15 worst case (Opus is the expensive one).

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

The starter set has 5 entries. Brent expands to ~50 covering all five severity tiers and every source category. Suggested distribution:

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

Detections are scored by `tropeId` match against ground truth. Severity tier comes from the canonical registry, not the model output. Recall and precision are computed across all detections; per-tier metrics group by trope tier.

The eval intentionally bypasses the production pipeline's Haiku validation pass and em-dash regex injection. The eval measures **raw model behavior**, not the production cascade. The cascade comparison is a separate question handled in U2.

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
├── scoring.ts
├── run-eval.ts
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

1. **Is Sonnet 4.6 dropping enough recall vs Opus 4.7 to justify upgrading the primary detector to Opus?** If the gap is small (under 5%) on Tier 1-3 tropes, stay on Sonnet. Opus is 1.7x the input cost.
2. **Is Haiku 4.5 viable as a fallback tier in the cascade?** If Haiku catches 85%+ of what Sonnet catches on Tier 1-2 tropes, it's a viable degraded-mode model. Tier 4-5 tropes likely fall off; the cascade documentation should be honest about that.
3. **Are there specific tropes any model systematically misses?** Top-misses tables surface this. May inform prompt tweaks.

Once the eval result is in, U1 closes and U2 (Energy Meter cascade) can begin with concrete tier definitions.
