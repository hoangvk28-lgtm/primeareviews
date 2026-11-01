import fs from "node:fs";
for (const s of process.argv.slice(2)) {
  const f = JSON.parse(fs.readFileSync(`scripts/.work/facts/${s}.json`, "utf8"));
  const p = `data/guides/${s}.json`; const g = JSON.parse(fs.readFileSync(p, "utf8"));
  g.heroImage = f.heroImage;
  for (const pr of g.products) { const a = pr.amazonUrl.match(/dp\/(\w+)/)[1]; const m = f.products.find(x => x.asin === a); if (!m) console.log("no asin", a); else pr.imageUrl = m.imageUrl; }
  fs.writeFileSync(p, JSON.stringify(g, null, 1));
}
