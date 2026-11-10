#!/usr/bin/env node
/**
 * Submit URLs to IndexNow (Bing, Yandex, Naver, Seznam. Google does NOT use it).
 *
 * The key file must already be live at https://www.primeareviews.com/<key>.txt
 * and contain exactly the key, or every submission is rejected with 403.
 *
 *   node scripts/ping-indexnow.mjs all                 every guide + category + static page
 *   node scripts/ping-indexnow.mjs since <git-ref>     guides whose JSON changed since that ref
 *   node scripts/ping-indexnow.mjs slugs <a> <b> ...   specific guide slugs
 *   node scripts/ping-indexnow.mjs ... --dry           print the URL list, submit nothing
 */

import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOST = "www.primeareviews.com";
const SITE = `https://${HOST}`;
const KEY = process.env.INDEXNOW_KEY || "fe1730eab9294fdea8c2b7d0ec2de3f0";
const ENDPOINT = "https://api.indexnow.org/indexnow";
const BATCH = 10000; // IndexNow hard limit per request

const STATIC_PAGES = ["", "/guides", "/how-we-rank", "/about", "/affiliate-disclosure", "/privacy-policy", "/contact"];

function allSlugs() {
  return readdirSync(path.join(ROOT, "data/guides"))
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));
}

function slugsChangedSince(ref) {
  const out = execFileSync("git", ["diff", "--name-only", `${ref}..HEAD`, "--", "data/guides"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  return out
    .split("\n")
    .filter((l) => l.endsWith(".json"))
    .map((l) => path.basename(l, ".json"));
}

// data/categories.ts is TypeScript, so node cannot import it. Scrape the slugs.
function categorySlugs() {
  const src = readFileSync(path.join(ROOT, "data/categories.ts"), "utf8");
  return [...src.matchAll(/slug:\s*"([a-z0-9-]+)"/g)].map((m) => m[1]);
}

async function main() {
  const [mode, ...rest] = process.argv.slice(2);
  const dry = rest.includes("--dry");
  const args = rest.filter((a) => a !== "--dry");

  let urls = [];
  if (mode === "all") {
    urls = [
      ...STATIC_PAGES.map((p) => `${SITE}${p}`),
      ...categorySlugs().map((s) => `${SITE}/guides/${s}`),
      ...allSlugs().map((s) => `${SITE}/guide/${s}`),
    ];
  } else if (mode === "since") {
    if (!args[0]) throw new Error("since needs a git ref");
    urls = slugsChangedSince(args[0]).map((s) => `${SITE}/guide/${s}`);
  } else if (mode === "slugs") {
    if (!args.length) throw new Error("slugs needs at least one slug");
    urls = args.map((s) => `${SITE}/guide/${s}`);
  } else {
    throw new Error("usage: ping-indexnow.mjs all | since <ref> | slugs <a> <b> ... [--dry]");
  }

  urls = [...new Set(urls)];
  console.log(`${urls.length} URL(s) to submit`);
  if (dry) {
    urls.slice(0, 20).forEach((u) => console.log("  " + u));
    if (urls.length > 20) console.log(`  ... and ${urls.length - 20} more`);
    return;
  }

  // Verify the key file is actually reachable before submitting anything.
  const keyUrl = `${SITE}/${KEY}.txt`;
  const probe = await fetch(keyUrl);
  const body = (await probe.text()).trim();
  if (!probe.ok || body !== KEY) {
    throw new Error(`key file not live or wrong contents at ${keyUrl} (status ${probe.status}, body "${body.slice(0, 60)}")`);
  }
  console.log(`key file verified at ${keyUrl}`);

  for (let i = 0; i < urls.length; i += BATCH) {
    const chunk = urls.slice(i, i + BATCH);
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: keyUrl, urlList: chunk }),
    });
    const text = await res.text();
    console.log(`batch ${i / BATCH + 1}: ${chunk.length} URLs -> HTTP ${res.status} ${res.statusText} ${text.slice(0, 200)}`);
    if (res.status !== 200 && res.status !== 202) process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
