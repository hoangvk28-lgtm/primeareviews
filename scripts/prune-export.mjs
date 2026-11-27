/**
 * Prunes the per-route client segment-cache payloads from out/ after the export.
 *
 * Next 16 writes one `__next.*.txt` directory per route (8 files each) holding
 * the partial RSC payloads its segment cache prefetches. With 5,600+ routes that
 * is ~45,000 extra files, and Cloudflare caps a deployment at 20,000 assets, so
 * an unpruned export cannot be deployed at all.
 *
 * The site never uses them anyway: every <Link> sets prefetch={false} (a
 * standing rule in CLAUDE.md), so nothing is prefetched ahead of a click. When a
 * segment payload is missing, Next's router reverts to a full-page navigation
 * (see "Could not perform a SPA navigation" in
 * next/dist/client/components/segment-cache/navigation.js), which is exactly how
 * a plain static site behaves. The per-route `<slug>.txt` payload and the
 * root-level `__next.*` files are kept.
 */
import { readdirSync, rmSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "out");

let dirs = 0;
let files = 0;
let bytes = 0;

function walk(dir, depth) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (!statSync(full).isDirectory()) continue;
    // A segment-payload directory holds only __next.* entries (txt files and nested __next.!<segment> dirs).
    const entries = readdirSync(full);
    const isSegmentDir =
      entries.length > 0 && entries.every((e) => e.startsWith("__next."));
    if (isSegmentDir && depth > 0) {
      files += entries.length;
      rmSync(full, { recursive: true, force: true });
      dirs++;
    } else {
      walk(full, depth + 1);
    }
  }
}

walk(out, 0);
console.log(
  `Pruned ${dirs} segment-payload directories (${files} files, ${(bytes / 1048576).toFixed(0)} MB) from out/.`
);
