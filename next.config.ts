import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Cloudflare Pages: the whole site is prerendered to static HTML in out/. No ISR, route
  // handlers, next.config headers/redirects or image optimisation; see docs/cloudflare-pages.md.
  output: "export",
  outputFileTracingRoot: path.join(__dirname),
  turbopack: { root: path.join(__dirname) },
  experimental: { cpus: 2, staticGenerationMaxConcurrency: 2 },
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "m.media-amazon.com" }],
  },
};

export default nextConfig;
