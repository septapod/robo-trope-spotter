# Robo Trope Spotter. Session Handoff

**Timestamp:** 2026-06-29
**Reason for handoff:** Detection-rebuild thread closing out. Work is done, live, and documented.

## What this session did

Improved the detection engine and shipped it to production (robotropes.dxn.is auto-deploys on push to main).

1. **Precision-first rebuild** (committed earlier, `9d04ba9`). Fixed the inverted scoring weights (lexical "delve"/em-dash had outranked structural burstiness, backwards from every detection study), added a deterministic statistical engine (burstiness, leaked chat-window markup, em-dash density), added length gating under 100 words, density normalization per 100 words, confidence bands, a per-family report card, and advisory framing. Taxonomy grew 44 to 64 tells, each with a false-positive guard.

2. **v3 recall recovery** (this session, `e98dd42`, live). The rebuild over-corrected recall. v3 names the eight tells the model was going quiet on (not-x-its-y, rhetorical-self-answer, anaphora-abuse, punchy-fragments, stakes-inflation, verdict-language, from-x-to-y, listicle-bullets) and tells it not to skip a clear instance, every guard left intact, plus a relaxed under-100-words rule. An earlier global-loosening pass (v2) added false positives with no recall gain and was reverted.

3. **Report copy cleanup** (`1fe4752`). The user-facing advisory and confidence strings carried em dashes and used "signal" as a noun, breaking Brent's writing rules. Rewritten plainly. Detection regexes that scan input for em dashes were left untouched.

4. **Docs brought current** (this session). README (font fix, Haiku validation pass), eval/README (64 tells, Opus 4.8, 55-entry set, real $3.10 cost, fair-score tooling, settled model decision), PROJECT_STATUS rebuild entry, this handoff.

## Measured result (Sonnet 4.6, production model)

| | old tool (exact-id) | v3 live (exact-id) | v3 live (family-aware) |
|---|---|---|---|
| Precision | 46.7% | 74.2% | 86.7% |
| Recall | 76.0% | 38.0% | 56.5% |
| False positives | 105 | 16 | 10 |
| Never-flag violations | 18 | 0 | 0 |

The win is trust, not raw catch rate. The old tool's 76% recall came bundled with 105 false positives and 18 cases it should never have flagged (the US Constitution, non-native English). v3 cuts false positives 6.5x and takes catastrophic misfires to zero. Recall dropped because precision came first; about half the drop is a stale-label artifact (the 20 new tropes mean exact-id scores correct catches as misses), which is why family-aware recall is 56.5%, not 38%.

## Current production state

- **Pipeline:** Sonnet 4.6 detection + Haiku 4.5 validation + deterministic statistical engine, fused in `src/lib/analysis/cascade.ts`. v3 prompt live.
- **Scoring:** `src/lib/analysis/scoring.ts`, reliability-weighted, density-normalized, length-gated, advisory.
- **Taxonomy:** 64 tells across `src/lib/tropes/{tier1,tier2,tier3,extended}.ts`, with `meta.ts` holding the category + reliability map.
- Git clean on main. Typecheck and `next build` green. Smoke-tested live: slop passage caught the recovered tells, plain human passage stayed clean.

## One open action (Brent only)

**Rotate the Anthropic API key** that was pasted into the chat during the eval. It only ever lived in the gitignored `.env.local` and was never committed, but the paste is the exposure.

## Recommended next steps (none required)

- **Stop at v3.** It is the trustworthy version and it is live. Do not chase the recall gap with prompt tuning; it is near the model ceiling (Opus only reaches 64% family-aware recall).
- **Re-open the model decision only with launch traffic.** If users say detection feels too soft, the lever is an Opus-tier production detector (about 2.5x per-analysis cost for ~8 more recall points), or relabeling the ground truth for the new taxonomy. Not before.
- **Unrelated dormant work:** `RUN_NEXT.md` holds the runbook to activate the tip-jar / newsletter / quota modal (U5), gated behind `ALLOWANCE_MODAL_ENABLED`. Independent of detection.

## How to re-measure

```bash
npm run eval -- --models sonnet          # production model only, ~$0.80
npx tsx eval/fair-score.ts eval/runs/<latest>/sonnet "label"   # honest yardstick
```
