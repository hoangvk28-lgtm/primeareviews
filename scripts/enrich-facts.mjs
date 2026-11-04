// Refills facts for slugs that were skipped for too few matching products, using the Amazon
// Creators/PA API. Searches by the guide's keyword, merges results with any existing facts and
// writes up to 12 candidate products to scripts/.work/facts/<slug>.json. The writer still decides
// which products genuinely match the title.
//
// Usage: node scripts/enrich-facts.mjs <slug-list.txt>
// Credentials: AMAZON_PAAPI_ACCESS_KEY / AMAZON_PAAPI_SECRET_KEY / AMAZON_PAAPI_PARTNER_TAG from the
// environment, or from the .env file named by ENV_FILE (default .env.local). Never commit keys.
import fs from "node:fs";

const envFile = process.env.ENV_FILE ?? ".env.local";
if (fs.existsSync(envFile)) {
  for (const l of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const i = l.indexOf("=");
    if (i > 0 && !process.env[l.slice(0, i)]) process.env[l.slice(0, i)] = l.slice(i + 1).trim();
  }
}
const { AMAZON_PAAPI_ACCESS_KEY: id, AMAZON_PAAPI_SECRET_KEY: secret, AMAZON_PAAPI_PARTNER_TAG: tag } = process.env;
if (!id || !secret || !tag) throw new Error("Amazon API credentials missing");

const M = "www.amazon.com";
const W = "scripts/.work/";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const candidates = new Map(JSON.parse(fs.readFileSync(W + "candidates.json", "utf8")).map((c) => [c.slug, c]));
const slugs = fs.readFileSync(process.argv[2], "utf8").split(/\r?\n/).filter(Boolean);

const token = (
  await (
    await fetch("https://api.amazon.com/auth/o2/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grant_type: "client_credentials", client_id: id, client_secret: secret, scope: "creatorsapi::default" }),
    })
  ).json()
).access_token;
if (!token) throw new Error("token request failed");

async function search(keywords) {
  for (let t = 0; t < 3; t++) {
    const r = await fetch("https://creatorsapi.amazon/catalog/v1/searchItems", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "x-marketplace": M },
      body: JSON.stringify({
        keywords,
        marketplace: M,
        partnerTag: tag,
        itemCount: 10,
        resources: ["images.primary.large", "itemInfo.title", "itemInfo.features", "offersV2.listings.price"],
      }),
    });
    const d = await r.json();
    if (r.ok) return d.searchResult?.items ?? d.itemsResult?.items ?? [];
    await sleep(1500);
  }
  return [];
}

const bucket = (v) =>
  !v ? undefined : v < 25 ? "under $25" : v < 50 ? "$25-50" : v < 100 ? "$50-100" : v < 200 ? "$100-200" : v < 500 ? "$200-500" : "$500+";

let done = 0;
for (const slug of slugs) {
  const c = candidates.get(slug);
  const path = `${W}facts/${slug}.json`;
  const old = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, "utf8")) : {};
  const keyword = c?.mainKeyword || slug.replace(/^best-/, "").replace(/-/g, " ");
  const products = old.products ?? [];
  const seen = new Set(products.map((p) => p.asin));
  for (const item of await search(keyword)) {
    const asin = item.asin || item.itemId;
    const img = item.images?.primary?.large?.url;
    if (!asin || seen.has(asin) || !img?.startsWith("https://m.media-amazon.com/")) continue;
    seen.add(asin);
    products.push({
      name: item.itemInfo?.title?.displayValue,
      asin,
      imageUrl: img,
      // Listing bullets are a fact source only; writers must not copy them.
      specs: (item.itemInfo?.features?.displayValues ?? []).map((f) => f.slice(0, 220)),
      priceBucket: bucket(item.offersV2?.listings?.[0]?.price?.money?.amount),
    });
  }
  const facts =
    products.length < 5
      ? { skip: `only ${products.length} products after API search` }
      : { slug, title: c?.title, mainKeyword: keyword, categoryHint: c?.category, heroImage: products[0].imageUrl, products: products.slice(0, 12), enriched: true };
  fs.writeFileSync(path, JSON.stringify(facts));
  console.log(`${slug}: ${facts.skip ?? facts.products.length + " products"}`);
  done++;
  await sleep(1100);
}
console.log(`enriched ${done} slugs`);
