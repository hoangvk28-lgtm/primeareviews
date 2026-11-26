// Applies reworded sentences to data/guides/<slug>.json.
// Input: a JSON array of { slug, old, new } (from scripts/.work/copied-sentences.json plus the rewrite).
// Exact text replacement inside the file, so the surrounding JSON formatting is untouched.
// Usage: node scripts/apply-rewrites.mjs <rewrites.json> [--dry]
import fs from "node:fs";

const file = process.argv[2];
const dry = process.argv.includes("--dry");
if (!file) { console.error("usage: apply-rewrites.mjs <rewrites.json> [--dry]"); process.exit(1); }
const items = JSON.parse(fs.readFileSync(file, "utf8"));

// A sentence lives inside a JSON string, so quotes and newlines arrive escaped.
const enc = (s) => JSON.stringify(s).slice(1, -1);
const bySlug = new Map();
for (const it of items) {
  if (!bySlug.has(it.slug)) bySlug.set(it.slug, []);
  bySlug.get(it.slug).push(it);
}

let ok = 0, failed = 0;
for (const [slug, list] of bySlug) {
  const path = `data/guides/${slug}.json`;
  if (!fs.existsSync(path)) { console.log(`✗ ${slug}: no such guide`); failed += list.length; continue; }
  let text = fs.readFileSync(path, "utf8");
  const problems = [];
  for (const it of list) {
    if (!it.new || !it.new.trim()) { problems.push(`empty rewrite for "${it.old.slice(0, 40)}..."`); continue; }
    if (/[–—]/.test(it.new)) { problems.push(`rewrite has an en/em dash: "${it.new.slice(0, 50)}..."`); continue; }
    const from = enc(it.old), to = enc(it.new);
    const hits = text.split(from).length - 1;
    if (hits !== 1) { problems.push(`${hits} match(es) for "${it.old.slice(0, 50)}..."`); continue; }
    text = text.replace(from, to);
  }
  if (problems.length) { problems.forEach((p) => console.log(`✗ ${slug}: ${p}`)); failed += problems.length; }
  const applied = list.length - problems.length;
  if (applied && !dry) fs.writeFileSync(path, text);
  ok += applied;
}
console.log(`${dry ? "[dry] " : ""}${ok} sentence(s) applied, ${failed} failed`);
process.exit(failed ? 1 : 0);
