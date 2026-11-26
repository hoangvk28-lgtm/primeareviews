// Fills `related` on every guide.
//
// The old version let each guide pick its 3 best matches and stopped there. That left
// 532 of 1,608 guides (a third of the site) with no inbound link from any other guide:
// a guide whose slug shares no token with its neighbours is nobody's best match, so it
// could only be reached from a hub or the paginated index. This version treats linking
// as two-sided: every guide GIVES `OUT` links and must RECEIVE at least `MIN_IN`.
//
// Relevance is inverse-document-frequency weighted. "vacuum" appears in 88 slugs and
// says little; "crankbait" appears in one and says everything. Counting every shared
// token equally is what pushed "best-cyclone-dust-collectors" towards garden hoses.
//
// Run after each batch, then `npm run index`.
import fs from "node:fs";
import path from "node:path";

const OUT = 6;      // links each guide gives
const MIN_IN = 3;   // links each guide must receive
const HOSTS = 60;   // candidate donors examined when rescuing an orphan

const dir = path.join(process.cwd(), "data", "guides");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
const guides = files.map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
const N = guides.length;

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

const STOP = new Set(["best", "for", "with", "and", "the", "under", "of", "in", "to", "a", "on", "s"]);
const tokensOf = (slug) => [...new Set(slug.split("-").filter((w) => !STOP.has(w) && !/^\d+$/.test(w)))];

const tok = new Map(guides.map((g) => [g.slug, tokensOf(g.slug)]));
const cat = new Map(guides.map((g) => [g.slug, g.category]));
const slugs = guides.map((g) => g.slug);

// Inverted index + IDF.
const postings = new Map();
for (const s of slugs) for (const t of tok.get(s)) (postings.get(t) ?? postings.set(t, []).get(t)).push(s);
const idf = new Map([...postings].map(([t, list]) => [t, Math.log(N / list.length)]));

// Sparse scoring: only guides sharing at least one token are candidates.
function candidatesFor(s) {
  const acc = new Map();
  for (const t of tok.get(s)) {
    const w = idf.get(t);
    // A token in hundreds of slugs is noise, and walking its postings is the slow part.
    if (postings.get(t).length > 150) continue;
    for (const o of postings.get(t)) if (o !== s) acc.set(o, (acc.get(o) ?? 0) + w);
  }
  for (const [o, v] of acc) if (cat.get(o) === cat.get(s)) acc.set(o, v + 0.75);
  return acc;
}

// A slug like "best-lint-rollers" shares no token with anything, so slug matching alone
// drops it into same-category alphabetical order. Build a small topical profile from the
// guide's own wording and use it as a second signal.
const PROFILE_STOP = new Set([
  ...STOP, "ranked", "reviewed", "2026", "our", "you", "your", "that", "this", "it", "is", "are", "we",
  "guide", "guides", "pick", "picks", "buy", "buying", "what", "how", "by", "or", "an", "at", "from",
  "most", "more", "than", "when", "which", "its", "has", "have", "can", "will", "one", "two", "up",
]);
const profileText = (g) =>
  [g.h1, g.mainKeyword, ...(g.whatMatters ?? []).map((w) => w.factor), ...(g.howToChoose ?? []).map((h) => h.subheading)]
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ");
const profileWords = (g) => [...new Set(profileText(g).split(/\s+/).filter((w) => w.length > 2 && !PROFILE_STOP.has(w) && !/^\d+$/.test(w)))];

const prof = new Map(guides.map((g) => [g.slug, profileWords(g)]));
const pPost = new Map();
for (const s of slugs) for (const w of prof.get(s)) (pPost.get(w) ?? pPost.set(w, []).get(w)).push(s);
const pIdf = new Map([...pPost].map(([w, list]) => [w, Math.log(N / list.length)]));
// Keep each guide's most distinctive terms; common ones say nothing about topic.
for (const s of slugs) {
  prof.set(s, prof.get(s).filter((w) => pPost.get(w).length <= 120).sort((a, b) => pIdf.get(b) - pIdf.get(a)).slice(0, 14));
}
function textCandidates(s) {
  const acc = new Map();
  for (const w of prof.get(s)) {
    for (const o of pPost.get(w)) if (o !== s && prof.get(o).includes(w)) acc.set(o, (acc.get(o) ?? 0) + pIdf.get(w));
  }
  return acc;
}

// The last meaningful token of a slug is its head noun: what the guide is actually about.
// "lightweight" is an attribute shared by skillets, vacuums, mops and garden hoses, and
// matching on it alone is what produced cast iron skillets linked to garden hoses.
const sing = (w) => (w.endsWith("s") && w.length > 3 ? w.slice(0, -1) : w);
const headOf = new Map(guides.map((g) => {
  const parts = g.slug.split("-").filter((w) => !STOP.has(w) && !/^\d+$/.test(w));
  return [g.slug, sing(parts[parts.length - 1] ?? "")];
}));

const scores = new Map(slugs.map((s) => [s, candidatesFor(s)]));
// Slug overlap stays dominant; the topical profile fills in behind it. A shared head noun
// multiplies the match, and a cross-category match is damped hard, because the long tail
// of weak links was almost all false friends from one shared adjective.
for (const s of slugs) {
  const acc = scores.get(s);
  for (const [o, v] of textCandidates(s)) acc.set(o, (acc.get(o) ?? 0) + v * 0.45);
  const mine = new Set(tok.get(s));
  for (const [o, v] of acc) {
    const sameHead = Boolean(headOf.get(s)) && headOf.get(s) === headOf.get(o);
    const same = cat.get(o) === cat.get(s);
    // Across categories, one shared adjective is not a relationship. Require the head
    // noun or at least two distinctive shared tokens, else drop the candidate outright.
    if (!same && !sameHead && tok.get(o).filter((w) => mine.has(w)).length < 2) { acc.delete(o); continue; }
    acc.set(o, v * (sameHead ? 1.9 : 1) * (same ? 1 : 0.5) + (same ? 0.4 : 0));
  }
}
const scoreOf = (a, b) => scores.get(a).get(b) ?? (cat.get(a) === cat.get(b) ? 0.75 : 0);
const byCat = new Map();
for (const s of slugs) (byCat.get(cat.get(s)) ?? byCat.set(cat.get(s), []).get(cat.get(s))).push(s);

// Pass 1: everyone picks their best matches, filling from the category if short.
const related = new Map();
for (const s of slugs) {
  if (OVERRIDES[s]) { related.set(s, [...OVERRIDES[s]]); continue; }
  const ranked = [...scores.get(s)].sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1)).map(([o]) => o);
  const picked = ranked.slice(0, OUT);
  if (picked.length < OUT) {
    // Nothing shares a token: fall back to the closest guides in the same category by
    // topical profile, and only then to the alphabet.
    const text = textCandidates(s);
    const fill = (byCat.get(cat.get(s)) ?? [])
      .filter((o) => o !== s && !picked.includes(o))
      .sort((x, y) => (text.get(y) ?? 0) - (text.get(x) ?? 0) || (x < y ? -1 : 1));
    for (const o of fill) { if (picked.length >= OUT) break; picked.push(o); }
  }
  related.set(s, picked);
}

const inlinks = new Map(slugs.map((s) => [s, 0]));
for (const list of related.values()) for (const r of list) inlinks.set(r, (inlinks.get(r) ?? 0) + 1);

// Pass 2: rescue every guide below the inbound quota by taking over the slot it costs
// the least to take, and never by creating a new orphan.
const pinned = new Set(Object.keys(OVERRIDES));
let rescued = 0, unreachable = 0;
const needy = slugs.filter((s) => inlinks.get(s) < MIN_IN).sort((a, b) => inlinks.get(a) - inlinks.get(b) || (a < b ? -1 : 1));
for (const u of needy) {
  while (inlinks.get(u) < MIN_IN) {
    const hosts = [...scores.get(u)].sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1)).map(([o]) => o);
    const pool = hosts.length >= HOSTS ? hosts.slice(0, HOSTS) : [...hosts, ...(byCat.get(cat.get(u)) ?? [])].slice(0, HOSTS);
    let best = null;
    // Cross-category donors are where false friends creep in ("cabinets" linking filing
    // cabinets to a paint sprayer guide), so they are a last resort.
    const sameCat = pool.filter((h) => cat.get(h) === cat.get(u));
    for (const h of (sameCat.length ? sameCat : pool)) {
      if (h === u || pinned.has(h) || related.get(h).includes(u)) continue;
      const gain = scoreOf(h, u);
      for (const t of related.get(h)) {
        if (inlinks.get(t) <= MIN_IN) continue; // dropping this would orphan t
        const cost = scoreOf(h, t) - gain;
        if (!best || cost < best.cost) best = { host: h, slot: t, cost };
      }
    }
    if (!best) { unreachable++; break; }
    const list = related.get(best.host);
    list[list.indexOf(best.slot)] = u;
    inlinks.set(best.slot, inlinks.get(best.slot) - 1);
    inlinks.set(u, inlinks.get(u) + 1);
    rescued++;
  }
}

for (const g of guides) {
  g.related = related.get(g.slug);
  fs.writeFileSync(path.join(dir, `${g.slug}.json`), JSON.stringify(g, null, 2) + "\n");
}

const counts = slugs.map((s) => inlinks.get(s));
const orphans = counts.filter((c) => c === 0).length;
const below = counts.filter((c) => c < MIN_IN).length;
console.log(`linked ${N} guides: ${OUT} out each, ${rescued} slot(s) reassigned`);
console.log(`inbound links: ${orphans} orphan(s), ${below} below ${MIN_IN}, max ${Math.max(...counts)}, mean ${(counts.reduce((a, b) => a + b, 0) / N).toFixed(1)}${unreachable ? `, ${unreachable} unreachable` : ""}`);
