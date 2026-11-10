// Validates every data/guides/*.json against the CLAUDE.md content rules. Exit 1 on any error.
// Usage: npm run check            (all guides)
//        node scripts/check-guides.mjs slug-a slug-b
import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "data", "guides");
const only = process.argv.slice(2);
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json") && (!only.length || only.includes(f.replace(/\.json$/, ""))));
const known = new Set(fs.readdirSync(dir).map((f) => f.replace(/\.json$/, "")));

const BANNED = [
  /\bwe tested\b/i, /\bwe tried\b/i, /\bin our lab\b/i, /\bwe measured\b/i, /\bhands-on\b/i, /\bour testing\b/i,
  /\btested by\b/i, /\bafter \d+ (days|weeks|months) of (use|testing)\b/i,
  /\$\d+\.\d{2}/, // exact prices
  /\b\d(\.\d)? (out of 5 )?stars?\b/i, /\b[\d,]{3,} (reviews|ratings)\b/i, // Amazon rating/review data
  /[—–]/, // em / en dash
];

let errors = 0;
const fail = (slug, msg) => { errors++; console.log(`✗ ${slug}: ${msg}`); };

for (const f of files) {
  const g = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  const s = g.slug;
  const titleLen = g.metaTitle.length + " | Primea".length;
  if (titleLen > 60) fail(s, `metaTitle renders ${titleLen} chars (max 60)`);
  if (!/Ranked & Reviewed/.test(g.metaTitle)) fail(s, `metaTitle missing "Ranked & Reviewed"`);
  if (g.metaDescription.length < 120 || g.metaDescription.length > 160) fail(s, `metaDescription ${g.metaDescription.length} chars (120-160)`);
  if (!/ranked and reviewed by primea/i.test(g.metaDescription)) fail(s, `metaDescription should open with "Ranked and reviewed by Primea"`);
  if (g.products.length < 4) fail(s, `only ${g.products.length} products`);
  if (g.faq.length < 5) fail(s, `only ${g.faq.length} FAQ entries`);
  if (g.whatMatters.length < 5) fail(s, `only ${g.whatMatters.length} whatMatters entries`);
  if (g.howToChoose.length < 6) fail(s, `only ${g.howToChoose.length} howToChoose sections`);
  if (g.methodology.length < 4) fail(s, `only ${g.methodology.length} methodology entries`);
  if (!g.related?.length) fail(s, "related is empty");
  for (const r of g.related ?? []) if (!known.has(r)) fail(s, `related slug not found: ${r}`);
  const scores = g.products.map((p) => p.score);
  if (scores.some((x, i) => i && x > scores[i - 1])) fail(s, "products not sorted by score descending");
  for (const p of g.products) {
    if (p.pros.length < 3) fail(s, `${p.id}: fewer than 3 pros`);
    if (p.description.split("\n\n").length < 2) fail(s, `${p.id}: description needs 2-3 paragraphs`);
    if (!p.amazonUrl.includes("tag=primeareviews-amz-20")) fail(s, `${p.id}: amazonUrl missing primeareviews-amz-20 tag`);
    if (p.score < 70 || p.score > 99) fail(s, `${p.id}: score ${p.score} out of range`);
  }
  const text = JSON.stringify({ ...g, products: g.products.map(({ price, ...p }) => p) });
  for (const re of BANNED) {
    const m = text.match(re);
    if (m) fail(s, `banned pattern ${re} -> "${m[0]}"`);
  }
}

console.log(`${files.length} guides checked, ${errors} error(s)`);
process.exit(errors ? 1 : 0);
