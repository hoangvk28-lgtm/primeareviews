// Builds scripts/.work/queue-<n>.txt with the next 15 usable, unwritten candidates,
// excluding slugs already assigned to the busy queues passed after <n>.
// Usage: node scripts/next-queue.mjs <n> [busyQueue ...]
import fs from "node:fs";

const [n, ...busyQ] = process.argv.slice(2);
const W = "scripts/.work/";
const candidates = JSON.parse(fs.readFileSync(W + "candidates.json", "utf8"));
const busy = new Set(busyQ.flatMap((k) => fs.readFileSync(`${W}queue-${k}.txt`, "utf8").split("\n")));
const out = [];
for (const c of candidates) {
  if (out.length >= 15) break;
  if (busy.has(c.slug) || fs.existsSync(`data/guides/${c.slug}.json`)) continue;
  if (!JSON.parse(fs.readFileSync(`${W}facts/${c.slug}.json`, "utf8")).skip) out.push(c.slug);
}
fs.writeFileSync(`${W}queue-${n}.txt`, out.join("\n"));
console.log(`queue-${n}: ${out.length} slugs; ${fs.readdirSync("data/guides").length} guides written`);
