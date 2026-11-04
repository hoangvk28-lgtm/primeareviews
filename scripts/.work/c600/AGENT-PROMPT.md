# Primea writer agent (cloud-600 run)

Working dir: /home/user/primeareviews. You write Primea Reviews buying guides as JSON, one slug at a time, for the slugs in your assigned chunk file. Other agents write other slugs in parallel: create/edit ONLY data/guides/<slug>.json for your own slugs, plus append to your own skip file. Do not commit, do not run git, do not touch any other file.

## Before the first slug (read once)
1. scripts/.work/BRIEF.md (full spec, JSON shape, Depth targets).
2. The "Expert voice standard" section of scripts/.work/FIX-BRIEF.md.
3. CLAUDE.md sections 4, 6, 7.
4. data/guides/best-dual-monitor-arms.json as the reference for voice and depth. Never copy its sentences.

## Per slug
1. If data/guides/<slug>.json already exists, skip it silently.
2. Read scripts/.work/facts/<slug>.json. Use only its facts for specs and numbers; never invent model-specific numbers.
3. Decide how many products genuinely match the slug's promise (e.g. "4-leg standing desks" needs actual 4-leg desks; "165hz portable monitors" needs 165Hz portable monitors; accessories, wrong product types, or specs that contradict the slug do not count). Drop off-topic or duplicate products silently. If fewer than 5 genuine matches remain, SKIP: write no guide, and append one line `<slug>\t<short reason>` to your skip file (given in your task). Never reframe a guide away from its slug keyword.
4. Otherwise write data/guides/<slug>.json in ONE Write call, following the BRIEF JSON shape exactly. publishedAt/updatedAt "2026-11-04". related: []. category from facts.categoryHint (must be one of the allowed values). heroImage from facts. amazonUrl "https://www.amazon.com/dp/<ASIN>?tag=primeareviews-amz-20". Title wording must differ from the facts' "title"; metaTitle keeps the slug's core product phrase, contains "Ranked & Reviewed", and is <= 51 chars (count characters, do not eyeball). h1 uses the actual product count N.
5. Depth (mandatory, audited): each product description 3 paragraphs separated by \n\n, ~110-130 words total; whatMatters detail ~55-65 words each; faq answers ~35-45 words each, naming products from the guide; intro 2 paragraphs ~130 words total; summary and finalTake 3-4 sentences.
6. Voice: senior reviewer with 10+ years in this exact category. Judgment not description; explain the mechanism behind specs; compare picks by name with real numbers from facts; one honest caveat per product tied to a spec or a missing spec; original opening angle (a buyer mistake or hidden tradeoff). No filler ("great option", "solid choice", "worth considering", "offers good value", "a reliable pick"). Every sentence must read as written for THIS guide. Vary sentence openings; do not reuse your own stock sentences across guides (a duplicate checker flags phrases repeated across 3+ guides).
7. Hard rules: no testing claims ("we tested", "we tried", "hands-on", "in our lab", "we measured", "our testing", "tested by", "after N weeks of use"); no star ratings, review counts or exact prices (price buckets only, e.g. "under $50", "$50 to $100"); NO em dash or en dash characters anywhere; scores unique, 78-96, strictly descending, rank follows score; pros 3-8 words; cons 2-3; 4 keySpecs; exactly 6 howToChoose sections in the BRIEF order, every recommendation naming a product in this guide; 6 FAQs; 5 whatMatters; 5 methodology; no medical cure claims. Never mention "source", "facts file", or that products were dropped.
8. Run: `node scripts/check-guides.mjs <slug>; node scripts/check-duplicates.mjs <slug>`. Ignore only "related is empty". Fix every other error with the Edit tool (never sed/perl/scripts for edits). Copied/repeated-phrase hits mean reword those sentences. Re-run until clean.

## Final report (short)
One line per slug: written (N products, checks clean) or skipped (reason). Nothing else.

## Duplicate-lineup rule (added)
Never pad or tweak a lineup with duplicate/variant listings (same product in another colour, "alternate listing", bundles of the same item) to dodge the identical-lineup check. If the only way to pass is such padding, the guide is a duplicate: delete your file and SKIP the slug with reason "lineup duplicates <other-slug>". Every product must be a distinct model with its exact name.

## No outside-knowledge specs (added)
A product counts toward the slug only if its name or facts state the slug feature. Never assign a spec, class or rating "from your own knowledge" (e.g. a BTU figure the facts do not give). If that leaves fewer than 5, skip.

## Price-cap slugs (added)
For "under-$N" slugs, a product counts only if its priceBucket lies entirely under $N (e.g. "under $25" does NOT prove under $20; "$50-100" does NOT prove under $75). Fewer than 5 such products: skip.

## Depth floor (added)
audit-depth flags a guide as thin when the whatMatters average is under 45 words (also desc < 85, faq < 30, intro < 80). Write every whatMatters detail at 55-65 words and every faq answer at 35-45 words. Do not run audit-depth yourself (it rewrites a shared file); count words instead.

## Image/ASIN check (added)
Each product's imageUrl must be that product's own imageUrl from the facts file (never the heroImage for every product). After writing, run `node scripts/.work/c600/asincheck.mjs | grep <slug>`; it must print nothing for your slug.

## Category (added)
categoryHint in facts is often wrong. Pick the category by product type: networking/computer/audio/video gear -> tech-accessories; garden tools, watering, bird feeders, outdoor seating -> outdoor-garden; cookware/utensils/can openers/peelers -> kitchen; mobility and daily-living aids (incl. arthritis/senior aids) -> health-mobility; desks, office chairs, office safes -> home-office; Halloween/holiday, heaters, humidifiers, fans -> seasonal; otherwise home-living.
