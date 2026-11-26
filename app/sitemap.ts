import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getAllListings, getByCategory } from "@/lib/guides";
import { pageCount } from "@/components/GuideGrid";
import { categories } from "@/data/categories";

export const revalidate = 86400;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/guides", "/how-we-rank", "/about", "/affiliate-disclosure", "/privacy-policy", "/contact"];
  return [
    ...staticPages.map((p) => ({ url: `${SITE_URL}${p}`, priority: p === "" ? 1 : 0.5 })),
    ...categories.map((c) => ({ url: `${SITE_URL}/guides/${c.slug}`, priority: 0.7 })),
    // Paginated listings: the only crawl path to guides past the first page of a hub.
    ...Array.from({ length: pageCount(getAllListings().length) - 1 }, (_, i) => ({
      url: `${SITE_URL}/guides/page/${i + 2}`,
      priority: 0.3,
    })),
    ...categories.flatMap((c) =>
      Array.from({ length: pageCount(getByCategory(c.slug).length) - 1 }, (_, i) => ({
        url: `${SITE_URL}/guides/${c.slug}/page/${i + 2}`,
        priority: 0.3,
      })),
    ),
    ...getAllListings().map((g) => ({ url: `${SITE_URL}/guide/${g.slug}`, lastModified: g.updatedAt, priority: 0.8 })),
  ];
}
