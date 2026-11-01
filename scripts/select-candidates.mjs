// Picks the first N source guides to rewrite for Primea from DeskFinds + WorthRated.
// Output: scripts/.work/candidates.json  (array of { slug, source, file, category, products })
// Usage: node scripts/select-candidates.mjs [N=1000]
//
// Rules:
//  - only "best-*" product roundups with 5+ products (skips informational/how-to/vs pages)
//  - skips slugs already published in data/guides/
//  - drops a candidate whose product set (sorted ASINs) duplicates one already picked,
//    so two Primea URLs never review the identical lineup
//  - caps each keyword cluster (first 2 meaningful words) so 1000 articles spread across niches
//  - interleaves the two sources so neither dominates
import fs from "node:fs";
import path from "node:path";

const N = Number(process.argv[2] ?? 1000);
const SOURCES = [
  { name: "deskfinds", dir: "C:/Users/ADMIN/Downloads/Roo-Code-main/smartspace-picks/data/guides" },
  { name: "worthrated", dir: "C:/Users/ADMIN/Downloads/BestFindsReviews/data/guides" },
];
const CLUSTER_CAP = 6;

const CATEGORY_RULES = [
  ["kitchen", /kitchen|cook|blender|fridge|microwave|kettle|coffee|toaster|air fryer|knife|pan\b|pot\b|mixer|oven|dish|food|spice|cutting board/],
  ["outdoor-garden", /garden|lawn|mower|patio|outdoor|yard|hose|grill|leaf|trimmer|chainsaw|planter|shed|pool/],
  ["health-mobility", /senior|walker|rollator|ramp|wheelchair|cane|grab bar|shower chair|mobility|bed rail|lift chair|compression|massager|heating pad|posture|orthopedic/],
  ["seasonal", /halloween|christmas|holiday|heater|fan\b|air conditioner|humidifier|dehumidifier|snow|electric blanket/],
  ["tech-accessories", /keyboard|mouse|dock|charger|usb|hub|cable|webcam|microphone|headphone|speaker|laptop|tablet|monitor\b|ups\b|router|ssd|printer|projector|mini pc|3d print/],
  ["home-office", /desk|chair|monitor|office|footrest|file cabinet|bookshelf|lamp|whiteboard|credenza|safe|filing|ergonomic|standing/],
];
const categorize = (t) => CATEGORY_RULES.find(([, re]) => re.test(t))?.[0] ?? "home-living";

function extract(src) {
  const title = src.match(/export const guideTitle\s*=\s*"([^"]+)"/)?.[1];
  const kw = src.match(/export const mainKeyword\s*=\s*"([^"]+)"/)?.[1] ?? "";
  const asins = [...src.matchAll(/amazon\.com\/dp\/([A-Z0-9]{10})/g)].map((m) => m[1]);
  return { title, kw, asins: [...new Set(asins)] };
}

const published = new Set(fs.readdirSync(path.join(process.cwd(), "data", "guides")).map((f) => f.replace(/\.json$/, "")));
const pools = SOURCES.map(({ name, dir }) => {
  const out = [];
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".ts")).sort()) {
    const slug = f.replace(/\.ts$/, "");
    if (!slug.startsWith("best-") || published.has(slug)) continue;
    const src = fs.readFileSync(path.join(dir, f), "utf8");
    if (!/export const products/.test(src)) continue;
    const { title, kw, asins } = extract(src);
    if (!title || asins.length < 5) continue;
    // Prefer richer source files: more products and more FAQ/criteria content.
    const richness = asins.length * 2 + (src.match(/\bq:\s*"/g)?.length ?? 0) + src.length / 8000;
    out.push({ slug, source: name, file: path.join(dir, f), title, kw, asins, richness });
  }
  return out.sort((a, b) => b.richness - a.richness);
});

const picked = [];
const seenSets = new Set();
const seenSlugs = new Set();
const clusterCount = new Map();
const idx = pools.map(() => 0);
while (picked.length < N && idx.some((i, p) => i < pools[p].length)) {
  for (let p = 0; p < pools.length && picked.length < N; p++) {
    while (idx[p] < pools[p].length) {
      const c = pools[p][idx[p]++];
      const setKey = [...c.asins].sort().join(",");
      const cluster = c.slug.replace(/^best-/, "").split("-").filter((w) => !/^(for|with|and|the|under|\d+)$/.test(w)).slice(0, 2).join("-");
      if (seenSlugs.has(c.slug) || seenSets.has(setKey) || (clusterCount.get(cluster) ?? 0) >= CLUSTER_CAP) continue;
      seenSlugs.add(c.slug);
      seenSets.add(setKey);
      clusterCount.set(cluster, (clusterCount.get(cluster) ?? 0) + 1);
      picked.push({ slug: c.slug, source: c.source, file: c.file, title: c.title, mainKeyword: c.kw, category: categorize(`${c.title} ${c.kw}`.toLowerCase()) });
      break;
    }
  }
}

fs.mkdirSync(path.join(process.cwd(), "scripts", ".work"), { recursive: true });
fs.writeFileSync(path.join(process.cwd(), "scripts", ".work", "candidates.json"), JSON.stringify(picked, null, 1));
const bySource = picked.reduce((m, c) => ((m[c.source] = (m[c.source] ?? 0) + 1), m), {});
const byCat = picked.reduce((m, c) => ((m[c.category] = (m[c.category] ?? 0) + 1), m), {});
console.log(`Picked ${picked.length} candidates`, bySource, byCat);
