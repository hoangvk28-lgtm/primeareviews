import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getAllListings } from "@/lib/guides";
import { categories } from "@/data/categories";

export const revalidate = 86400;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/guides", "/how-we-rank", "/about", "/affiliate-disclosure", "/privacy-policy", "/contact"];
  return [
    ...staticPages.map((p) => ({ url: `${SITE_URL}${p}`, priority: p === "" ? 1 : 0.5 })),
    ...categories.map((c) => ({ url: `${SITE_URL}/guides/${c.slug}`, priority: 0.7 })),
    ...getAllListings().map((g) => ({ url: `${SITE_URL}/guide/${g.slug}`, lastModified: g.updatedAt, priority: 0.8 })),
  ];
}
