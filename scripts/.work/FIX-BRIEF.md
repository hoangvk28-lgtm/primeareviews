# Deepen thin Primea guides

Goal: bring each listed guide up to the depth of the approved sample `data/guides/best-dual-monitor-arms.json` (read it once for tone and depth, never copy its wording). Voice: senior product reviewer with years in the category, confident, specific, decisive.

## Expert voice standard (the main point of this pass)
Write like a reviewer who has covered this category for 10+ years and has seen every generation of these products. Every paragraph must pass these tests:
- **Judgment, not description.** Each paragraph makes a call: what to buy, what to skip, which tradeoff matters. A sentence that only restates a spec without saying why it matters gets cut or rewritten.
- **Category insider knowledge.** Explain the mechanism behind a spec (why low suction struggles on thick rugs, why a minimum load rating matters for light monitors, why brushless motors outlast brushed ones). Name the buyer mistake competitors never mention.
- **Concrete comparisons.** Compare picks by name with real numbers from the guide ("the Ergotron holds 20 lb per arm, the VIVO 22 lb, but only the Ergotron uses gas springs").
- **Decisive and specific.** No filler ("great option", "worth considering", "solid choice", "offers good value", "a reliable pick"). No hedging stacks ("may potentially"). Short, confident sentences; vary rhythm.
- **Honest caveats.** Every product gets one real limitation tied to a spec or a missing spec.
- **Reads as written for THIS guide.** If a sentence could be pasted into another guide by swapping the product name, rewrite it.

Before (thin, generic): "The Shark AV2501S is a good robot vacuum with self-emptying. It is a solid choice for most homes and offers good value."
After (expert): "Shark's AV2501S earns its spot on the dock, not the robot: the bagless base holds weeks of debris, so you skip the bag refills most rivals here need. The tradeoff is navigation. Without LiDAR it maps by camera and gyro, so it hesitates in dim rooms where the LiDAR picks keep their lines straight."
(Use only numbers that appear in the guide or its facts file.)

For each slug in the list, edit `data/guides/<slug>.json` in place:
- products[].description: 3 paragraphs, ~110-130 words total. P1 role + concrete specs, P2 why it ranks here vs the neighbouring picks (name the real tradeoff), P3 who should buy + honest caveat.
- whatMatters[].detail: 3-4 sentences (~55-65 words): what it is, why it concretely matters, how to check it on a listing.
- faq[].a: 2-3 sentences (~35-45 words) naming specific products from the guide.
- intro: 2 paragraphs, ~130 words, with an original hook.
- summary and finalTake: 3-4 sentences each.
Keep every other field (names, ASINs, scores, URLs, specs, howToChoose) unchanged unless it is factually wrong.

Facts only from the guide itself and `scripts/.work/facts/<slug>.json` when present. Never invent numbers.
Rules: no testing claims ("we tested", "hands-on", "in our lab", "we measured"); no star ratings, review counts or exact prices; no em/en dashes; no stock sentences reused across guides.

After each guide run: `node scripts/check-guides.mjs <slug>; node scripts/check-duplicates.mjs <slug>` and fix any error (ignore none). Then `node scripts/audit-depth.mjs` periodically to confirm the guide is no longer flagged.
