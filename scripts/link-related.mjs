// Fills `related` (3 slugs) on every guide: same category first, ranked by shared keyword tokens.
// Run after each batch is collected, then `npm run index`.
import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "data", "guides");
const guides = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
const STOP = new Set(["best", "for", "with", "and", "the", "under", "of", "in", "to", "a"]);
// Niche guides whose slug shares no token with any sibling fall back to same-category
// alphabetical order, which reads as random. Pin those by hand.
const OVERRIDES = {
  "best-cyclone-dust-collectors": ["best-commercial-wet-dry-vacuums", "best-compact-wet-dry-vacuums", "best-cordless-shop-vacuums"],
  "best-grapefruit-knives": ["best-vegetable-peelers", "best-y-peelers", "best-electric-knife-under-50"],
  "best-titanium-pencils": ["best-digital-notebooks-for-note-taking", "best-budget-digital-notebooks", "best-digital-notebook-tablets"],
  "best-balcony-chair-sets": ["best-adirondack-rocking-chairs", "best-camping-rocking-chairs", "best-tabletop-patio-heaters"],
  "best-lithium-jump-starters": ["best-1800w-portable-power-stations", "best-2000wh-portable-power-stations", "best-240v-portable-power-stations"],
  "best-fatboy-holsters": ["best-personal-small-safes", "best-portable-small-safes", "best-hidden-small-safes"],
  "best-paint-sprayers-for-cabinets": ["best-anti-fatigue-mats-for-garage-workshop", "best-commercial-wet-dry-vacuums", "best-electric-air-dusters"],
  "best-climbing-stand-seats": ["best-camping-rocking-chairs", "best-360-degree-swivel-garden-seats", "best-garden-carts-with-seats"],
  "best-thermal-scopes": ["best-backpack-leaf-blowers", "best-camping-rocking-chairs", "best-personal-small-safes"],
  "best-airsoft-pistols": ["best-personal-small-safes", "best-portable-small-safes", "best-camping-rocking-chairs"],
};
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
  g.related = OVERRIDES[g.slug] ?? ranked.slice(0, 3).map((r) => r.slug);
  fs.writeFileSync(path.join(dir, `${g.slug}.json`), JSON.stringify(g, null, 2) + "\n");
}
console.log(`linked ${guides.length} guides`);
