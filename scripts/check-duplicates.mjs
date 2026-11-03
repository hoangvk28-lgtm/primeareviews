// Uniqueness gate. Flags (1) Primea guides sharing an identical product lineup, and
// (2) any 10-word run copied verbatim from the source DeskFinds/WorthRated guide or repeated
// across 3+ Primea guides. Exit 1 on any hit.
import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "data", "guides");
const cands = new Map(JSON.parse(fs.readFileSync(path.join(process.cwd(), "scripts", ".work", "candidates.json"), "utf8")).map((c) => [c.slug, c]));
// Optional slug args: only report issues involving those slugs.
const only = new Set(process.argv.slice(2));
const isMine = (slug) => !only.size || only.has(slug);
const guides = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));

const words = (t) => t.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter(Boolean);
const shingles = (t, n = 10) => {
  const w = words(t);
  const out = new Set();
  for (let i = 0; i + n <= w.length; i++) out.add(w.slice(i, i + n).join(" "));
  return out;
};
const prose = (g) => [g.summary, ...g.intro, ...g.products.flatMap((p) => [p.description, p.verdict]), ...g.whatMatters.map((w) => w.detail), ...g.faq.map((f) => f.a), g.finalTake].join(" ");

let hits = 0;
const sets = new Map();
for (const g of guides) {
  const key = g.products.map((p) => p.amazonUrl.match(/dp\/(\w+)/)?.[1]).sort().join(",");
  if (sets.has(key) && (isMine(g.slug) || isMine(sets.get(key)))) { hits++; console.log(`✗ identical lineup: ${g.slug} = ${sets.get(key)}`); } else sets.set(key, g.slug);
}

const seen = new Map();
for (const g of guides) {
  const mine = shingles(prose(g));
  const c = cands.get(g.slug);
  // candidates.json stores Windows paths; fall back to the sibling checkout on other machines.
  const file = c && (fs.existsSync(c.file) ? c.file : path.join(process.cwd(), "..", c.source === "deskfinds" ? "smartspace-picks" : "BestFindsReviews", "data", "guides", `${c.slug}.ts`));
  if (c && isMine(g.slug) && fs.existsSync(file)) {
    const src = shingles(fs.readFileSync(file, "utf8"));
    const copied = [...mine].filter((s) => src.has(s));
    if (copied.length) { hits++; console.log(`✗ ${g.slug}: ${copied.length} phrase(s) copied from source, e.g. "${copied[0]}"`); }
  }
  for (const s of mine) seen.set(s, (seen.get(s) ?? new Set()).add(g.slug));
}
const repeated = [...seen].filter(([, v]) => v.size >= 3 && [...v].some(isMine));
if (repeated.length) {
  hits++;
  console.log(`✗ ${repeated.length} phrase(s) repeated across 3+ guides, e.g. "${repeated[0][0]}" in ${[...repeated[0][1]].slice(0, 3).join(", ")}`);
}
console.log(`${guides.length} guides scanned, ${hits} issue(s)`);
process.exit(hits ? 1 : 0);
