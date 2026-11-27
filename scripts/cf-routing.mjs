#!/usr/bin/env node
// Post-build step for Cloudflare Pages (runs after `next build` with output: "export").
// Writes out/_headers from cloudflare/headers.txt. The non-www -> www 301 is a Cloudflare
// Redirect Rule in the dashboard (_redirects cannot match on host); see docs/cloudflare-pages.md.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "out");
if (!existsSync(OUT)) {
  console.error("out/ not found. Run `next build` first.");
  process.exit(1);
}
writeFileSync(path.join(OUT, "_headers"), readFileSync(path.join(ROOT, "cloudflare", "headers.txt"), "utf8"));
console.log("_headers written.");
