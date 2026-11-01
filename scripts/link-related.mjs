// Fills `related` (3 slugs) on every guide: same category first, ranked by shared keyword tokens.
// Run after each batch is collected, then `npm run index`.
import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "data", "guides");
const guides = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
const STOP = new Set(["best", "for", "with", "and", "the", "under", "of", "in", "to", "a"]);
const tokens = (g) => new Set(g.slug.split("-").filter((w) => !STOP.has(w) && !/^\d+$/.test(w)));
const tok = new Map(guides.map((g) => [g.slug, tokens(g)]));

for (const g of guides) {
  const mine = tok.get(g.slug);
  const ranked = guides
    .filter((o) => o.slug !== g.slug)
    .map((o) => {
      let shared = 0;
      for (const w of tok.get(o.slug)) if (mine.has(w)) shared++;
      return { slug: o.slug, s: shared * 2 + (o.category === g.category ? 1 : 0) };
    })
    .sort((x, y) => y.s - x.s || x.slug.localeCompare(y.slug));
  g.related = ranked.slice(0, 3).map((r) => r.slug);
  fs.writeFileSync(path.join(dir, `${g.slug}.json`), JSON.stringify(g, null, 2) + "\n");
}
console.log(`linked ${guides.length} guides`);
