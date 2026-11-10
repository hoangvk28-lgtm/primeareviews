# Deepen thin cloud-600 guides

Working dir: /home/user/primeareviews. For each slug in your list file, edit data/guides/<slug>.json in place with the Edit tool (no sed/perl/scripts). Touch nothing else; do not commit; do not run audit-depth.mjs.

1. Read the "Expert voice standard" section of scripts/.work/FIX-BRIEF.md once.
2. Per guide: rewrite every whatMatters[].detail to 55-65 words (what it is, why it concretely matters with the mechanism, how to verify it on a listing), naming products from this guide where useful. If faq answers are under 35 words, bring them to 35-45 words, naming products from the guide. Facts only from the guide and scripts/.work/facts/<slug>.json; never invent numbers.
3. Rules: no testing claims, no star ratings/review counts/exact prices, no em/en dashes, no filler, no sentences reused across guides.
4. Run `node scripts/check-guides.mjs <slug>; node scripts/check-duplicates.mjs <slug>`; fix every error except "related is empty".
Final report: one line per slug with the new whatMatters average word count.
