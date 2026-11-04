import fs from "node:fs";
process.chdir("/home/user/primeareviews");
const lists = ["cloud-600.txt", "cloud-backup.txt"].flatMap((f) => fs.readFileSync("scripts/.work/" + f, "utf8").split("\n").filter(Boolean));
let bad = 0, n = 0;
for (const s of lists) {
  if (!fs.existsSync(`data/guides/${s}.json`)) continue; n++;
  const g = JSON.parse(fs.readFileSync(`data/guides/${s}.json`)), f = JSON.parse(fs.readFileSync(`scripts/.work/facts/${s}.json`));
  const img = Object.fromEntries(f.products.map((p) => [p.asin, p.imageUrl]));
  const errs = [];
  const asins = g.products.map((p) => (p.amazonUrl.match(/dp\/(\w+)\?tag=primeareviews-amz-20$/) || [])[1]);
  g.products.forEach((p, i) => { const a = asins[i]; if (!a) errs.push(`bad url ${p.amazonUrl}`); else if (!(a in img)) errs.push(`asin ${a} not in facts`); else if (img[a] !== p.imageUrl) errs.push(`image mismatch ${a}`); });
  if (new Set(asins).size !== asins.length) errs.push("duplicate asin");
  if (errs.length) { bad++; console.log(s, errs.join("; ")); }
}
console.log(`${n} guides, ${bad} with problems`);
