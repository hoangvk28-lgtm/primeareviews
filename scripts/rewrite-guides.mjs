// Rewrites DeskFinds / WorthRated source guides into unique Primea Reviews guides with Claude.
// Uses the Message Batches API (50% cost) and a cached system prompt containing the Primea style
// guide plus the approved sample guide.
//
// Usage:
//   node scripts/rewrite-guides.mjs one <slug>                 # synchronous single rewrite (for spot checks)
//   node scripts/rewrite-guides.mjs submit <start> <count>     # queue candidates[start..start+count) as one batch
//   node scripts/rewrite-guides.mjs collect <batch_id>         # download results, validate, write data/guides/*.json
//
// Requires ANTHROPIC_API_KEY (or an `ant auth login` profile). Candidates come from select-candidates.mjs.
import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";

const ROOT = process.cwd();
const WORK = path.join(ROOT, "scripts", ".work");
const GUIDES = path.join(ROOT, "data", "guides");
const MODEL = "claude-opus-5-5";
const TAG = "primeareviews-20";
const TODAY = new Date().toISOString().slice(0, 10);

const client = new Anthropic();
const candidates = JSON.parse(fs.readFileSync(path.join(WORK, "candidates.json"), "utf8"));
const sample = fs.readFileSync(path.join(GUIDES, "best-dual-monitor-arms.json"), "utf8");

const SYSTEM = `You are the senior editor at Primea Reviews (primeareviews.com), a product-review site whose editors have reviewed home, office, kitchen and outdoor products for many years. You rewrite a competitor-format source guide into an original Primea guide.

OUTPUT: a single JSON object, no prose before or after, matching exactly the shape of the APPROVED SAMPLE below (same keys, same nesting). "related" must be [] (filled later). "publishedAt" and "updatedAt" are "${TODAY}".

VOICE: confident, expert, decisive. Short paragraphs, plain English, concrete numbers. Tell the reader what to buy and what to skip. Every guide must read as freshly written: do not reuse sentences, sentence structures, headings phrasing or ordering from the source. Restructure the argument, find a different opening angle, and re-rank by your own judgment of the specs.

HONESTY RULES (non-negotiable):
- Never claim physical testing: no "we tested", "we tried", "hands-on", "in our lab", "we measured", "after N weeks of use", "our testing". Say "we reviewed", "we ranked", "we evaluated", "on paper", "based on the spec sheet", "owners report".
- Use only facts present in the source (specs, features, capacities, dimensions). Never invent numbers, certifications or features. If the source data looks wrong or self-contradictory, leave that claim out.
- Never write Amazon star ratings, review counts, or exact prices like "$23.99". Budget buckets ("under $50", "$50 to $100") are fine.
- No em dash or en dash characters anywhere. Use commas, periods or colons.

TITLE & SEO:
- "metaTitle" must contain "Ranked & Reviewed" and be at most 51 characters (" | Primea" is appended). Pattern: "Best <Product> 2026: Ranked & Reviewed" or "<Product>: Ranked & Reviewed (2026)". Shorten the product phrase if needed. Count characters.
- "h1": "The N Best <Product> of 2026, Ranked & Reviewed" or a close variant, where N = number of products.
- "metaDescription": 120 to 160 characters, starts with "Ranked and reviewed by Primea:".
- "slug": keep the source slug exactly.

CONTENT SHAPE:
- products: keep every source product (same name, imageUrl, ASIN). amazonUrl = "https://www.amazon.com/dp/<ASIN>?tag=${TAG}". Assign a Primea Score 78 to 96, unique per product, sorted descending, rank 1..N following the score order. "award" is your own label (do not copy the source badge wording).
- description: exactly 3 paragraphs separated by "\\n\\n": (1) what it is and its role, with 1-2 real specs; (2) why it ranks where it does vs the picks next to it, naming the actual tradeoff; (3) who should buy it plus any real caveat.
- verdict: one punchy sentence. pros: 4 short scannable points (3 to 8 words). cons: 2 to 3. keySpecs: 4 label/value pairs from real specs. idealFor / skipIf: one sentence each.
- summary: 3 to 4 sentences naming the top picks by use case.
- intro: 2 paragraphs with an original hook (a buyer mistake or non-obvious tradeoff).
- whatMatters: 5 entries, each 3 to 4 sentences: what it is, why it concretely matters, how to check it on a listing.
- methodology: 5 category-specific criteria.
- howToChoose: exactly 6 sections in this order: "By <primary attribute>" (table), "By Budget" (table with dollar buckets), "<A> vs <B>" (2 cards + note), a second decision-axis table, "For <specific use case> Specifically" (cards "Look for" and "In this ranking"), "When to Spend More" (cards "Spend more if" and "Save if"). Every recommendation names a product from this guide.
- faq: 6 entries covering compatibility, a common mistake, a "worth it over" comparison, setup/how-to, and maintenance or edge case.
- finalTake: 3 to 4 sentences.
- category: one of home-office, tech-accessories, home-living, kitchen, outdoor-garden, health-mobility, seasonal (the hint may be wrong; choose the best fit).

APPROVED SAMPLE (match its structure and quality, never its wording):
${sample}`;

function buildParams(c) {
  const src = fs.readFileSync(c.file, "utf8");
  return {
    model: MODEL,
    max_tokens: 32000,
    output_config: { effort: "medium" },
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral", ttl: "1h" } }],
    messages: [
      {
        role: "user",
        content: `Category hint: ${c.category}\nSource slug: ${c.slug}\n\nSOURCE GUIDE (TypeScript data file, use only as fact source):\n${src}`,
      },
    ],
  };
}

function parseGuide(message) {
  if (message.stop_reason === "refusal") throw new Error("refused");
  if (message.stop_reason === "max_tokens") throw new Error("hit max_tokens");
  const text = message.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  return JSON.parse(json);
}

function save(c, guide) {
  guide.slug = c.slug;
  guide.related = [];
  fs.writeFileSync(path.join(GUIDES, `${c.slug}.json`), JSON.stringify(guide, null, 2) + "\n");
}

const [cmd, a, b] = process.argv.slice(2);

if (cmd === "one") {
  const c = candidates.find((x) => x.slug === a);
  if (!c) throw new Error(`not a candidate: ${a}`);
  const msg = await client.messages.stream(buildParams(c)).finalMessage();
  save(c, parseGuide(msg));
  console.log(`wrote data/guides/${c.slug}.json`, msg.usage);
} else if (cmd === "submit") {
  const slice = candidates.slice(Number(a ?? 0), Number(a ?? 0) + Number(b ?? 100)).filter((c) => !fs.existsSync(path.join(GUIDES, `${c.slug}.json`)));
  // custom_id is capped at 64 chars, so map ids back to slugs through a local manifest.
  const requests = slice.map((c, i) => ({ custom_id: `g${Number(a ?? 0) + i}`, params: buildParams(c) }));
  const batch = await client.messages.batches.create({ requests });
  fs.writeFileSync(path.join(WORK, `${batch.id}.json`), JSON.stringify(Object.fromEntries(requests.map((r, i) => [r.custom_id, slice[i].slug]))));
  console.log(`submitted ${requests.length} requests as ${batch.id}`);
} else if (cmd === "collect") {
  const batch = await client.messages.batches.retrieve(a);
  if (batch.processing_status !== "ended") {
    console.log(`batch ${a} is ${batch.processing_status}`, batch.request_counts);
    process.exit(0);
  }
  const ids = JSON.parse(fs.readFileSync(path.join(WORK, `${a}.json`), "utf8"));
  const failed = [];
  for await (const r of await client.messages.batches.results(a)) {
    const c = candidates.find((x) => x.slug === ids[r.custom_id]);
    try {
      if (r.result.type !== "succeeded") throw new Error(r.result.type);
      save(c, parseGuide(r.result.message));
    } catch (e) {
      failed.push(`${c.slug}: ${e.message}`);
    }
  }
  console.log(`collected ${Object.keys(ids).length - failed.length} guides, ${failed.length} failed`);
  if (failed.length) console.log(failed.join("\n"));
} else {
  console.log("usage: one <slug> | submit <start> <count> | collect <batch_id>");
}
