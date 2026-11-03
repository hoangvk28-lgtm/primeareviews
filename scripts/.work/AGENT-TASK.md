# Writer agent task (Primea Reviews)

Working dir: /home/admin1/Downloads/AGENT/projects/primeareviews. Write the guides listed in your assigned list file (one slug per line), one at a time. Other agents write other slugs in parallel; touch only your own slugs' files.

First read scripts/.work/BRIEF.md (full spec + JSON shape) and CLAUDE.md sections 4, 6, 7. Read data/guides/best-mesh-office-chair.json as a quality/length reference (match structure and depth, never wording).

For each slug:
- Input: scripts/.work/facts/<slug>.json. Use only these facts for specs; never open sister-site source .ts files.
- If the products don't match the slug's topic (e.g. accessories instead of the product itself) and fewer than 5 genuine matches remain, SKIP the slug (write nothing) and report it. Never reframe a guide away from its slug keyword.
- Write data/guides/<slug>.json in ONE Write call. publishedAt/updatedAt "2026-11-03". related: [].
- Length: ~2,800-3,000 words of prose. Product descriptions 3 substantial paragraphs; FAQ answers 2-3 full sentences; whatMatters 3-4 sentences each.
- Voice: senior reviewer with 10+ years in that exact category. Real domain knowledge (engineering terms, what spec numbers mean in practice, typical failure points, common owner complaints). Decisive buy/skip calls, short paragraphs, specific numbers from facts. Original opening angle per guide (a buyer mistake or hidden tradeoff); vary sentence openings. Title wording differs from the facts' source title. metaTitle keeps the slug's core product phrase.
- Never mention "source", "facts file", "the title", or that products were dropped. Silently drop off-topic or duplicate products (keep 5+).
- Hard rules: no testing claims ("we tested", "hands-on", "our testing", "we measured", "tested by"); no star ratings, review counts or exact prices (price buckets only); NO em dash or en dash; metaTitle contains "Ranked & Reviewed" and <=51 chars; metaDescription 120-160 chars starting "Ranked and reviewed by Primea:"; scores unique 78-96 descending; pros 3-8 words; exactly 6 howToChoose sections in brief order; 6 FAQs; 5 whatMatters; 5 methodology. Never invent model-specific numbers. No medical cure claims.
- Then run: node scripts/check-guides.mjs <slug>; node scripts/check-duplicates.mjs <slug>. Fix every error with Edit (ignore "related is empty"). Copied/repeated-phrase hits mean reword. Re-run until clean.

Do not touch other files, do not commit. Final report (short): per slug one line (product count, check status, anything doubtful), plus skipped slugs and why.
