# Primea guide writing brief

Input: `scripts/.work/facts/<slug>.json` (products with name, asin, imageUrl, specs, facts, bestFor, priceBucket).
Output: `data/guides/<slug>.json`, written in ONE Write call. Then run `node scripts/check-guides.mjs <slug>; node scripts/check-duplicates.mjs <slug>`; fix every error with Edit (ignore "related is empty"). Copied-phrase hits mean reword those sentences.

## Voice
Senior product reviewer, years in the category. Confident, decisive, plain English, concrete numbers from specs. Each guide gets its own opening angle (a buyer mistake or hidden tradeoff). Never reuse sentences across guides. Never copy the `facts` text; rewrite.

## Hard rules
- No testing claims: never "we tested/tried", "hands-on", "in our lab", "we measured", "our testing", "tested by". Use "we reviewed", "we ranked", "on paper", "the spec sheet", "owners report".
- Facts only from the facts file. Drop doubtful claims, and drop products that do not match the title's promise (keep 4+; 4 products is fine).
- No star ratings, review counts, exact prices. Use priceBucket wording ("under $50").
- No em dash or en dash characters.

## JSON shape (all keys required)
```
{
 "slug": "<slug>", "category": "home-office|tech-accessories|home-living|kitchen|outdoor-garden|health-mobility|seasonal",
 "h1": "The N Best <Product> of 2026, Ranked & Reviewed",
 "metaTitle": "Best <Product> 2026: Ranked & Reviewed",          // <= 51 chars, shorten product phrase if needed
 "metaDescription": "Ranked and reviewed by Primea: ...",            // 120-160 chars
 "mainKeyword": "...", "publishedAt": "2026-11-01", "updatedAt": "2026-11-01", "readTime": "10 min",
 "heroImage": "<facts.heroImage>",
 "summary": "3-4 sentences naming top picks by use case",
 "intro": ["hook paragraph", "what we ranked and how"],
 "products": [{
   "id": "kebab-name", "rank": 1, "award": "Best Overall", "name": "<exact name>", "score": 94,
   "imageUrl": "<facts>", "amazonUrl": "https://www.amazon.com/dp/<ASIN>?tag=primeareviews-amz-20",
   "verdict": "one punchy sentence",
   "description": "P1 role + 1-2 real specs\n\nP2 why it ranks here vs the pick above/below, naming the real tradeoff\n\nP3 who should buy + real caveat",
   "keySpecs": [{"label":"..","value":".."} x4],
   "pros": ["3-8 words" x4], "cons": ["3-8 words" x2-3],
   "idealFor": "one sentence", "skipIf": "one sentence"
 }],                                                                   // scores unique 78-96, descending, rank follows score
 "methodology": [{"title":"..","description":"1-2 sentences"} x5],    // category-specific criteria
 "whatMatters": [{"factor":"..","detail":"3-4 sentences: what it is, why it matters, how to check it on a listing"} x5],
 "howToChoose": [                                                       // exactly 6, this order, every pick named from this guide
   {"subheading":"By <primary attribute>","intro":"..","table":{"headers":["..","Our pick"],"rows":[[..],..]}},
   {"subheading":"By Budget","table":{"headers":["Spend","Our pick"],"rows":[["Under $50",".."],..]}},
   {"subheading":"<A> vs <B>","cards":[{"label":"A","text":"how it works + which picks"},{"label":"B","text":".."}],"note":"default recommendation"},
   {"subheading":"By <second axis>","table":{..}},
   {"subheading":"For <specific use case> Specifically","cards":[{"label":"Look for","text":".."},{"label":"In this ranking","text":".."}]},
   {"subheading":"When to Spend More","cards":[{"label":"Spend more if","text":".."},{"label":"Save if","text":".."}]}
 ],
 "faq": [{"q":"..","a":"2-3 sentences"} x6],                          // compatibility, common mistake, "worth it over", setup, maintenance, edge case
 "finalTake": "3-4 sentences",
 "related": []
}
```

## Depth targets (mandatory, checked by `node scripts/audit-depth.mjs`)
- products[].description: 3 paragraphs, ~110-130 words total.
- whatMatters[].detail: ~55-65 words. faq[].a: ~35-45 words, naming products from the guide.
- intro: 2 paragraphs, ~130 words. summary and finalTake: 3-4 sentences each.
A guide that audit-depth still flags as thin is not done.

## Expert voice
Follow the "Expert voice standard" section of scripts/.work/FIX-BRIEF.md (judgment not description, insider mechanism, named comparisons with real numbers, no filler, honest caveat per product, nothing reusable across guides).
