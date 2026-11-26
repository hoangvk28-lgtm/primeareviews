import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  turbopack: { root: path.join(__dirname) },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "m.media-amazon.com" }],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "primeareviews.com" }],
        destination: "https://www.primeareviews.com/:path*",
        permanent: true,
      },
      // Legacy pre-relaunch URLs that still hold backlinks.
      { source: "/best-cyclone-dust-collector", destination: "/guide/best-cyclone-dust-collectors", permanent: true },
      { source: "/fatboy-holsters", destination: "/guide/best-fatboy-holsters", permanent: true },
      { source: "/best-hose-clamp-pliers", destination: "/guide/best-hose-clamp-pliers", permanent: true },
      { source: "/10-best-kids-tv-stand", destination: "/guide/best-kids-tv-stands", permanent: true },
      { source: "/clix-keyboard", destination: "/guide/best-clix-keyboards", permanent: true },
      { source: "/grapefruit-knife", destination: "/guide/best-grapefruit-knives", permanent: true },
      { source: "/ps5-wall-mount", destination: "/guide/best-ps5-wall-mounts", permanent: true },
      { source: "/10-best-sock-puns", destination: "/guide/best-pun-socks", permanent: true },
      { source: "/best-thermal-scope", destination: "/guide/best-thermal-scopes", permanent: true },
      { source: "/best-fit-posing-trunks", destination: "/guide/best-posing-trunks", permanent: true },
      { source: "/type-s-lithium-jump-starter", destination: "/guide/best-lithium-jump-starters", permanent: true },
      { source: "/balcony-chair-set", destination: "/guide/best-balcony-chair-sets", permanent: true },
      { source: "/extra-large-french-press", destination: "/guide/best-extra-large-french-presses", permanent: true },
      { source: "/best-sulbutiamine", destination: "/guide/best-fat-soluble-b1-supplements", permanent: true },
      { source: "/titanium-pencil", destination: "/guide/best-titanium-pencils", permanent: true },
      { source: "/stainless-steel-baby-cup", destination: "/guide/best-stainless-steel-baby-cups", permanent: true },
      { source: "/place-to-buy-climbing-stand-seat", destination: "/guide/best-climbing-stand-seats", permanent: true },
      { source: "/best-bee-venom-serum", destination: "/guide/best-bee-venom-serums", permanent: true },
      { source: "/best-airsoft-pistol", destination: "/guide/best-airsoft-pistols", permanent: true },
      { source: "/best-paint-sprayer-for-cabinets", destination: "/guide/best-paint-sprayers-for-cabinets", permanent: true },
      { source: "/high-leg-recliner", destination: "/guide/best-high-leg-recliners", permanent: true },
      { source: "/10-best-gucci-rimless-sunglasses", destination: "/guide/best-gucci-rimless-sunglasses", permanent: true },
      { source: "/10-best-gucci-gg0208s", destination: "/guide/best-gucci-rimless-sunglasses", permanent: true },
      { source: "/10-best-gucci-90s", destination: "/guide/best-gucci-rimless-sunglasses", permanent: true },
      { source: "/10-best-bluegill-crankbait", destination: "/guide/best-bluegill-crankbaits", permanent: true },
      { source: "/10-best-round-wooden-stool", destination: "/guide/best-round-wooden-stools", permanent: true },
      { source: "/:slug(best-air-mattress.*)", destination: "/guide/best-air-mattresses", permanent: true },
      { source: "/10-best-300-ultra-mag-for-sale", destination: "/guides/outdoor-garden", permanent: true },
      { source: "/above-the-best-book", destination: "/guides", permanent: true },
      { source: "/role-management-best-practices", destination: "/guides", permanent: true },
    ];
  },
};

export default nextConfig;
