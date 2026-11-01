# Deepen thin Primea guides

Goal: bring each listed guide up to the depth of the approved sample `data/guides/best-dual-monitor-arms.json` (read it once for tone and depth, never copy its wording). Voice: senior product reviewer with years in the category, confident, specific, decisive.

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
