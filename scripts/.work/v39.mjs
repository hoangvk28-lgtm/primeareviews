import fs from "fs";
for (const s of process.argv.slice(2)) {
  const f = JSON.parse(fs.readFileSync(`scripts/.work/facts/${s}.json`));
  const g = JSON.parse(fs.readFileSync(`data/guides/${s}.json`));
  let fix = 0; const by = Object.fromEntries(f.products.map(p => [p.asin, p]));
  for (const p of g.products) {
    const a = p.amazonUrl.match(/dp\/(\w+)/)[1];
    const fp = by[a];
    if (!fp) { console.log(s, "BAD ASIN", p.name, a); continue; }
    if (fp.imageUrl !== p.imageUrl) { p.imageUrl = fp.imageUrl; fix = 1; } if (0) console.log(s, "BAD IMG", p.name, "\n ", p.imageUrl, "\n ", fp.imageUrl);
    if (fp.name !== p.name) console.log(s, "NAME DIFF", p.name, "|", fp.name);
  }
  if (fix) { fs.writeFileSync(`data/guides/${s}.json`, JSON.stringify(g, null, 1)); console.log(s, "fixed images"); }
  if (g.heroImage !== f.heroImage) console.log(s, "BAD HERO");
}
