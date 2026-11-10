// Top up or rebuild scripts/.work/facts/<slug>.json from the Amazon Creators API.
// Usage: node scripts/fetch-facts.mjs <slug> ["extra query" ...]
//        node scripts/fetch-facts.mjs --file scripts/.work/refetch.txt
// Credentials: AMAZON_PAAPI_* from this repo's .env.local, else a sibling checkout's.
import fs from "node:fs";
import path from "node:path";

const W = "scripts/.work/";
const ENV_CANDIDATES = [
  ".env.local",
  "../BestFindsReviews/.env.local",
  "../smartspace-picks/.env.local",
];
for (const f of ENV_CANDIDATES) {
  if (process.env.AMAZON_PAAPI_ACCESS_KEY) break;
  if (!fs.existsSync(f)) continue;
  for (const line of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    if (!process.env[k]) process.env[k] = t.slice(i + 1).split(/\s+#/)[0].trim();
  }
}
const ACCESS_KEY = process.env.AMAZON_CREATORS_CREDENTIAL_ID || process.env.AMAZON_PAAPI_ACCESS_KEY;
const SECRET_KEY = process.env.AMAZON_CREATORS_CREDENTIAL_SECRET || process.env.AMAZON_PAAPI_SECRET_KEY;
const PARTNER_TAG = process.env.AMAZON_CREATORS_PARTNER_TAG || process.env.AMAZON_PAAPI_PARTNER_TAG;
if (!ACCESS_KEY || !SECRET_KEY) {
  console.error("Missing AMAZON_CREATORS_CREDENTIAL_ID / AMAZON_CREATORS_CREDENTIAL_SECRET");
  process.exit(1);
}
const MARKETPLACE = process.env.AMAZON_CREATORS_MARKETPLACE || "www.amazon.com";

let token;
async function getToken() {
  if (token) return token;
  const res = await fetch("https://api.amazon.com/auth/o2/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: ACCESS_KEY,
      client_secret: SECRET_KEY,
      scope: "creatorsapi::default",
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("token: " + JSON.stringify(data));
  token = data.access_token;
  return token;
}

async function search(keywords) {
  const t = await getToken();
  const res = await fetch("https://creatorsapi.amazon/catalog/v1/searchItems", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}`, "x-marketplace": MARKETPLACE },
    body: JSON.stringify({
      keywords,
      marketplace: MARKETPLACE,
      partnerTag: PARTNER_TAG,
      itemCount: 10,
      resources: [
        "images.primary.large",
        "itemInfo.title",
        "itemInfo.features",
        "itemInfo.byLineInfo",
        "itemInfo.productInfo",
        "itemInfo.technicalInfo",
        "offersV2.listings.price",
      ],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`search ${res.status}: ${JSON.stringify(data).slice(0, 300)}`);
  return data.itemsResult?.items || data.searchResult?.items || [];
}

function bucket(displayAmount) {
  const n = Number(String(displayAmount || "").replace(/[^0-9.]/g, ""));
  if (!n) return null;
  if (n < 30) return "under $30";
  if (n < 50) return "$30-50";
  if (n < 100) return "$50-100";
  if (n < 200) return "$100-200";
  if (n < 500) return "$200-500";
  if (n < 1000) return "$500-1000";
  return "over $1000";
}

const STOP = new Set(["best", "the", "for", "with", "and", "of", "in", "a", "under", "over", "to"]);
function tokens(s) {
  return String(s).toLowerCase().split(/[^a-z0-9]+/).filter((w) => w && !STOP.has(w));
}
// A product is on topic only when EVERY distinctive word of the keyword shows up in
// its title or its bullet features. Qualifiers like "with desk", "biometric" or
// "wireless" are exactly what the title-only, 60-percent rule used to let through.
// The price part of a keyword ("under 50") is a budget, not a product attribute:
// it is enforced by priceCap, never matched against the title.
function stripPrice(keyword) {
  return String(keyword || "").replace(/\b(under|below|over|above|up to)\s*\$?\d+\b/gi, " ").replace(/\$\d+/g, " ");
}
function onTopic(name, keyword, extraText = "") {
  keyword = stripPrice(keyword);
  const hay = (String(name || "") + " " + extraText).toLowerCase();
  // Keep short numeric qualifiers ("82", "4 cu ft", "10 inch"): they are the whole slug.
  const need = tokens(keyword).filter((w) => w.length > 2 || /\d/.test(w));
  if (!need.length) return true;
  return need.every((w) => hay.includes(w) || hay.includes(w.replace(/s$/, "")) || (w.endsWith("s") && hay.includes(w.slice(0, -1))));
}
function priceCap(slug) {
  const m = slug.match(/under-(\d+)/);
  return m ? Number(m[1]) : null;
}
function priceOf(displayAmount) {
  const n = Number(String(displayAmount || "").replace(/[^0-9.]/g, ""));
  return n || null;
}

function queriesFor(slug, keyword, extra) {
  const base = keyword || slug.replace(/^best-/, "").replace(/-/g, " ");
  const qs = [base, `${base} 2026`, `best ${base}`];
  const priced = base.match(/under \$?(\d+)/i);
  if (priced) qs.push(base.replace(/under \$?\d+/i, "").trim());
  return [...new Set([...extra, ...qs])].filter(Boolean);
}

async function doSlug(slug, extra) {
  const factsPath = `${W}facts/${slug}.json`;
  let facts = fs.existsSync(factsPath) ? JSON.parse(fs.readFileSync(factsPath, "utf8")) : null;
  if (!facts) {
    const cands = JSON.parse(fs.readFileSync(W + "candidates.json", "utf8"));
    const c = cands.find((x) => x.slug === slug);
    facts = { slug, title: c?.title || slug, mainKeyword: c?.mainKeyword || "", categoryHint: c?.categoryHint || "", products: [] };
  }
  const keyword = facts.mainKeyword || slug.replace(/^best-/, "").replace(/-/g, " ");
  const cap = priceCap(slug);
  // A carried-over product must still match the topic AND sit inside the slug's budget.
  const overCap = (b) => {
    if (!cap || !b) return false;
    const m = String(b).match(/(\d+)\s*-\s*(\d+)/);
    if (m) return Number(m[1]) >= cap;
    const over = String(b).match(/over \$?(\d+)/i);
    if (over) return Number(over[1]) >= cap;
    const under = String(b).match(/under \$?(\d+)/i);
    if (under) return Number(under[1]) > cap * 1.5;
    return false;
  };
  const kept = (facts.products || []).filter(
    (p) => onTopic(p.name, keyword, (p.specs || []).join(" ")) && !overCap(p.priceBucket)
  );
  const byAsin = new Map(kept.map((p) => [p.asin, p]));
  const names = new Set(kept.map((p) => String(p.name).toLowerCase().slice(0, 40)));

  let fetched = 0, rejected = 0;
  for (const q of queriesFor(slug, keyword, extra)) {
    if (byAsin.size >= 8) break;
    let items = [];
    try {
      items = await search(q);
    } catch (e) {
      console.error(`  ! ${q}: ${e.message}`);
      continue;
    }
    for (const i of items) {
      const asin = i.itemId || i.asin;
      const name = i.itemInfo?.title?.displayValue;
      const img = i.images?.primary?.large?.url;
      if (!asin || !name || !img || byAsin.has(asin)) continue;
      const nk = name.toLowerCase().slice(0, 40);
      if (names.has(nk)) continue;
      const info = i.itemInfo || {};
      const dim = info.productInfo?.itemDimensions;
      const dimStr = dim && dim.width && dim.height
        ? `${dim.width.displayValue} x ${dim.height.displayValue}${dim.length ? " x " + dim.length.displayValue : ""} ${dim.width.unit || "inches"}`.replace(/\s+/g, " ")
        : null;
      // Amazon bullets are long and sales-flavoured. Keep the whole bullet (the specs
      // live mid-sentence) but drop the pure-marketing and support boilerplate ones.
      const feats = (info.features?.displayValues || [])
        .map((f) => f.replace(/\s+/g, " ").trim())
        .filter((f) => f.length > 15 && f.length < 600)
        .filter((f) => !/customer support|satisfaction is our|shop with confidence|contact us|money back|free return|our professional support/i.test(f));
      const tech = (info.technicalInfo ? Object.values(info.technicalInfo) : [])
        .map((v) => (v && v.displayValue ? `${v.label}: ${v.displayValue}` : null))
        .filter(Boolean);
      const extras = [
        info.manufactureInfo?.model?.displayValue ? `Model ${info.manufactureInfo.model.displayValue}` : null,
        dimStr ? `Dimensions ${dimStr}` : null,
        ...tech,
      ].filter(Boolean);
      if (!onTopic(name, keyword, feats.join(" "))) { rejected++; continue; }
      const amount = priceOf(i.offersV2?.listings?.[0]?.price?.money?.displayAmount);
      if (cap && amount && amount > cap) { rejected++; continue; }
      byAsin.set(asin, {
        name,
        asin,
        imageUrl: img,
        brand: i.itemInfo?.byLineInfo?.brand?.displayValue || undefined,
        specs: [...extras.slice(0, 3), ...feats].slice(0, 8),
        priceBucket: bucket(i.offersV2?.listings?.[0]?.price?.money?.displayAmount),
      });
      names.add(nk);
      fetched++;
      if (byAsin.size >= 8) break;
    }
    await new Promise((r) => setTimeout(r, 400));
  }

  const products = [...byAsin.values()];
  facts.products = products;
  facts.heroImage = products[0]?.imageUrl || facts.heroImage;
  if (products.length >= 5) delete facts.skip;
  else facts.skip = `only ${products.length} on-topic products found`;
  fs.mkdirSync(path.dirname(factsPath), { recursive: true });
  fs.writeFileSync(factsPath, JSON.stringify(facts, null, 2));
  console.log(`${slug}: ${products.length} products (kept ${kept.length}, new ${fetched}, off-topic rejected ${rejected})${facts.skip ? " SKIP" : ""}`);
  return products.length;
}

const args = process.argv.slice(2);
if (args[0] === "--file") {
  const slugs = fs.readFileSync(args[1], "utf8").split("\n").map((s) => s.trim()).filter(Boolean);
  for (const s of slugs) {
    try { await doSlug(s, []); } catch (e) { console.error(`${s}: FAILED ${e.message}`); }
  }
} else {
  await doSlug(args[0], args.slice(1));
}
