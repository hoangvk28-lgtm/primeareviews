// Adds extra on-topic product candidates to scripts/.work/facts/<slug>.json from the Amazon Creators API,
// so slugs skipped for "fewer than 5 genuine matches" can be retried.
// Never stores star ratings, review counts or exact prices (only a price bucket for internal use).
//
// Env (never commit these): AMAZON_PAAPI_ACCESS_KEY (client id), AMAZON_PAAPI_SECRET_KEY (client secret)
// Optional overrides: AMZ_TOKEN_URL, AMZ_API_BASE, AMZ_SEARCH_PATH, AMZ_CRED_VERSION, AMZ_MARKETPLACE
// Network: api.amazon.com and creatorsapi.amazon must be allowed in the environment.
//
// Usage: node scripts/enrich-facts.mjs slug-a slug-b ...
//        node scripts/enrich-facts.mjs --skipped        (every slug in scripts/.work/c600/skipped-*.txt)
//        add --dry to print what would be added without writing.
import fs from "node:fs";
import path from "node:path";

const CLIENT_ID = process.env.AMAZON_PAAPI_ACCESS_KEY;
const CLIENT_SECRET = process.env.AMAZON_PAAPI_SECRET_KEY;
const TOKEN_URL = process.env.AMZ_TOKEN_URL || "https://api.amazon.com/auth/o2/token";
const API_BASE = process.env.AMZ_API_BASE || "https://creatorsapi.amazon";
const SEARCH_PATH = process.env.AMZ_SEARCH_PATH || "/catalog/v1/searchItems";
const CRED_VERSION = process.env.AMZ_CRED_VERSION || "3.1";
const MARKETPLACE = process.env.AMZ_MARKETPLACE || "www.amazon.com";
const PARTNER_TAG = "primeareviews-amz-20";
const FACTS = path.join(process.cwd(), "scripts", ".work", "facts");

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Missing AMAZON_PAAPI_ACCESS_KEY / AMAZON_PAAPI_SECRET_KEY in the environment.");
  process.exit(1);
}

const args = process.argv.slice(2);
const dry = args.includes("--dry");
let slugs = args.filter((a) => !a.startsWith("--"));
if (args.includes("--skipped")) {
  const dir = path.join(process.cwd(), "scripts", ".work", "c600");
  for (const f of fs.readdirSync(dir).filter((f) => f.startsWith("skipped-"))) {
    for (const line of fs.readFileSync(path.join(dir, f), "utf8").split("\n")) {
      const s = line.split("\t")[0].trim();
      if (s) slugs.push(s);
    }
  }
}
slugs = [...new Set(slugs)];

async function getToken() {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ grant_type: "client_credentials", client_id: CLIENT_ID, client_secret: CLIENT_SECRET, scope: "creatorsapi::default" }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`token ${res.status}: ${body.slice(0, 300)}`);
  return JSON.parse(body).access_token;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function search(token, keywords) {
  const res = await fetch(API_BASE + SEARCH_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}, Version ${CRED_VERSION}`,
      "x-marketplace": MARKETPLACE,
    },
    body: JSON.stringify({
      keywords,
      searchIndex: "All",
      itemCount: 10,
      partnerTag: PARTNER_TAG,
      resources: ["images.primary.large", "itemInfo.title", "itemInfo.features", "itemInfo.byLineInfo", "offersV2.listings.price"],
    }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`search ${res.status}: ${body.slice(0, 300)}`);
  return JSON.parse(body);
}

// Tolerant accessors: the response may use camelCase or PascalCase keys.
const pick = (o, ...keys) => { for (const k of keys) if (o && o[k] != null) return o[k]; return undefined; };
const val = (x) => (x && typeof x === "object" ? pick(x, "displayValue", "DisplayValue", "displayValues", "DisplayValues") : x);

function bucket(amount) {
  if (amount == null || isNaN(amount)) return undefined;
  if (amount < 25) return "under $25";
  if (amount < 50) return "$25-50";
  if (amount < 100) return "$50-100";
  if (amount < 200) return "$100-200";
  if (amount < 500) return "$200-500";
  return "$500+";
}

function toProduct(item) {
  const asin = pick(item, "asin", "ASIN");
  const info = pick(item, "itemInfo", "ItemInfo") || {};
  const name = val(pick(info, "title", "Title"));
  const features = val(pick(info, "features", "Features")) || [];
  const brand = val(pick(pick(info, "byLineInfo", "ByLineInfo") || {}, "brand", "Brand"));
  const img = pick(pick(pick(pick(item, "images", "Images") || {}, "primary", "Primary") || {}, "large", "Large") || {}, "url", "URL");
  const listing = (pick(pick(item, "offersV2", "OffersV2") || {}, "listings", "Listings") || [])[0];
  const money = pick(pick(listing || {}, "price", "Price") || {}, "money", "Money") || pick(listing || {}, "price", "Price") || {};
  const amount = Number(pick(money, "amount", "Amount"));
  if (!asin || !name || !img || !/^https:\/\/m\.media-amazon\.com\//.test(img)) return null;
  return {
    name: String(name).slice(0, 200),
    asin,
    imageUrl: img,
    brand: brand || undefined,
    specs: (Array.isArray(features) ? features : [features]).slice(0, 6).map((f) => String(f).replace(/\s+/g, " ").slice(0, 220)),
    priceBucket: bucket(amount),
    origin: "amazon-api",
  };
}

const token = await getToken();
let added = 0;
for (const slug of slugs) {
  const file = path.join(FACTS, `${slug}.json`);
  if (!fs.existsSync(file)) { console.log(`- ${slug}: no facts file`); continue; }
  const facts = JSON.parse(fs.readFileSync(file, "utf8"));
  const keywords = slug.replace(/^best-/, "").replace(/-/g, " ");
  try {
    const data = await search(token, keywords);
    const result = pick(data, "searchResult", "SearchResult") || {};
    const items = pick(result, "items", "Items") || [];
    const have = new Set((facts.products || []).map((p) => p.asin));
    const fresh = items.map(toProduct).filter((p) => p && !have.has(p.asin));
    if (!dry && fresh.length) {
      facts.products = [...(facts.products || []), ...fresh];
      fs.writeFileSync(file, JSON.stringify(facts, null, 1));
    }
    added += fresh.length;
    console.log(`+ ${slug}: "${keywords}" -> ${items.length} results, ${fresh.length} new`);
  } catch (e) {
    console.log(`! ${slug}: ${e.message}`);
    if (/token|401|403/.test(e.message)) break;
  }
  await sleep(1100); // stay under 1 request/second
}
console.log(`done: ${added} products added across ${slugs.length} slugs${dry ? " (dry run)" : ""}`);
