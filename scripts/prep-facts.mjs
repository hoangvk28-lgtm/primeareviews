// Turns each candidate's source guide (DeskFinds / WorthRated .ts) into a compact facts file so
// writer agents read ~1-2k tokens instead of a 10-30k token source file.
// Output: scripts/.work/facts/<slug>.json  ({ skip: "reason" } when unusable)
// Usage: node scripts/prep-facts.mjs [start] [end]   (candidate indexes, inclusive; default all)
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const WORK = path.join(process.cwd(), "scripts", ".work");
const OUT = path.join(WORK, "facts");
fs.mkdirSync(OUT, { recursive: true });
const candidates = JSON.parse(fs.readFileSync(path.join(WORK, "candidates.json"), "utf8"));
const start = Number(process.argv[2] ?? 0);
const end = Number(process.argv[3] ?? candidates.length - 1);

async function load(file) {
  const js = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
  return import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));
}

const clip = (s, n) => (s && s.length > n ? s.slice(0, n).replace(/\s+\S*$/, "") + "..." : s);

let ok = 0, skipped = 0;
for (let i = start; i <= end && i < candidates.length; i++) {
  const c = candidates[i];
  const out = path.join(OUT, `${c.slug}.json`);
  let facts;
  try {
    const m = await load(c.file);
    const products = (m.products ?? [])
      .map((p) => ({
        name: p.name,
        asin: p.amazonUrl?.match(/dp\/([A-Z0-9]{10})/)?.[1],
        imageUrl: p.imageUrl,
        specs: [...(p.specs ?? []), ...(p.specList ?? []).map((s) => `${s.label}: ${s.value}`)],
        bestFor: p.bestFor,
        priceBucket: (() => {
          const v = parseFloat(String(p.price ?? "").replace(/[^0-9.]/g, ""));
          if (!v) return undefined;
          return v < 25 ? "under $25" : v < 50 ? "$25-50" : v < 100 ? "$50-100" : v < 200 ? "$100-200" : v < 500 ? "$200-500" : "$500+";
        })(),
      }))
      .filter((p) => p.asin && /^https:\/\/m\.media-amazon\.com\//.test(p.imageUrl ?? ""));
    const seen = new Set();
    const unique = products.filter((p) => !seen.has(p.asin) && seen.add(p.asin));
    facts =
      unique.length < 5
        ? { skip: `only ${unique.length} products with Amazon images` }
        : { index: i, slug: c.slug, title: m.guideTitle, mainKeyword: m.mainKeyword ?? c.mainKeyword, categoryHint: c.category, heroImage: unique[0].imageUrl, products: unique.slice(0, 8) };
  } catch (e) {
    facts = { skip: `parse error: ${e.message.slice(0, 80)}` };
  }
  fs.writeFileSync(out, JSON.stringify(facts));
  facts.skip ? skipped++ : ok++;
}
console.log(`facts written: ${ok} usable, ${skipped} skipped`);
