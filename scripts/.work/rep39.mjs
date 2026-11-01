import fs from "fs";
const [,, slug, ...pairs] = process.argv;
const f = `data/guides/${slug}.json`; let t = fs.readFileSync(f, "utf8");
for (let i = 0; i < pairs.length; i += 2) { if (!t.includes(pairs[i])) console.log("MISS", pairs[i].slice(0, 50)); t = t.split(pairs[i]).join(pairs[i + 1]); }
fs.writeFileSync(f, t);
