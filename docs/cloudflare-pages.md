# Hosting on Cloudflare Pages

The site is a **static export** (`output: "export"` in `next.config.ts`). `npm run build` prerenders
every page to `out/`, then `scripts/prune-export.mjs` drops Next 16 `__next.*` segment payloads (safe
because every Link has `prefetch={false}`) and `scripts/cf-routing.mjs` writes `out/_headers`.

| Vercel feature | Cloudflare replacement |
|---|---|
| ISR (`revalidate`) | None. Every guide is built at deploy time; a content change needs a push. |
| `next.config.ts` headers | `cloudflare/headers.txt` -> `out/_headers` |
| non-www -> www 301 | Cloudflare **Redirect Rule** (below) |
| `next/image` optimiser | `images.unoptimized: true` |
| Unknown slug | Static `404.html` (`dynamicParams = false`) |

## One-time setup

1. Workers & Pages -> Create -> **Pages** -> Connect to Git -> `hoangvk28-lgtm/primeareviews`.
2. Build command `npm run build`, output directory `out` (not the Next.js preset).
   Env vars: `NODE_VERSION=22`, `NEXT_PUBLIC_SITE_URL=https://www.primeareviews.com`, plus any
   `NEXT_PUBLIC_*` vars set on Vercel (baked in at build time).
3. Custom domains: add `www.primeareviews.com` and `primeareviews.com`.
4. Rules -> Redirect Rules: hostname equals `primeareviews.com` -> dynamic
   `concat("https://www.primeareviews.com", http.request.uri.path)`, 301, preserve query string.
5. Once DNS is switched and the site checks out, remove the project from Vercel.
