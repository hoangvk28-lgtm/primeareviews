// Flags thin guides: compares per-section word counts to the approved sample's depth.
// Output: scripts/.work/thin.json sorted thinnest first. Usage: node scripts/audit-depth.mjs
import fs from "node:fs";
const dir = "data/guides/";
const wc = (s) => (s || "").split(/\s+/).filter(Boolean).length;
const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const rows = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => {
  const g = JSON.parse(fs.readFileSync(dir + f, "utf8"));
  const m = {
    slug: g.slug,
    mtime: fs.statSync(dir + f).mtime.toISOString().slice(0, 16),
    desc: Math.round(avg(g.products.map((p) => wc(p.description)))),
    paras: Math.round(avg(g.products.map((p) => p.description.split("\n\n").length)) * 10) / 10,
    matters: Math.round(avg(g.whatMatters.map((w) => wc(w.detail)))),
    faq: Math.round(avg(g.faq.map((x) => wc(x.a)))),
    intro: wc(g.intro.join(" ")),
    total: wc(JSON.stringify(g)),
  };
  // thin if product descriptions or whatMatters are well under the sample (~120 / ~65 words)
  m.thin = m.desc < 85 || m.matters < 45 || m.faq < 30 || m.intro < 80;
  return m;
});
const thin = rows.filter((r) => r.thin).sort((a, b) => a.desc - b.desc);
fs.writeFileSync("scripts/.work/thin.json", JSON.stringify(thin, null, 1));
const med = (k) => rows.map((r) => r[k]).sort((a, b) => a - b)[rows.length >> 1];
console.log(`${rows.length} guides; thin: ${thin.length}; median desc ${med("desc")} matters ${med("matters")} faq ${med("faq")} intro ${med("intro")}`);
const s = rows.find((r) => r.slug === "best-dual-monitor-arms");
console.log("sample", s);
console.log("thinnest", thin.slice(0, 5));
