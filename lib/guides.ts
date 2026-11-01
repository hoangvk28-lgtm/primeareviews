import type { PrimeaGuide } from "./types";
import { guideRegistry, guideLoaders, type GuideListing } from "@/data/guides-index.generated";

export type { GuideListing };

export function getAllListings(): GuideListing[] {
  return guideRegistry;
}

export function getListing(slug: string) {
  return guideRegistry.find((g) => g.slug === slug);
}

export async function getGuide(slug: string): Promise<PrimeaGuide | null> {
  const load = guideLoaders[slug];
  if (!load) return null;
  const mod = await load();
  return (mod as { default: PrimeaGuide }).default ?? (mod as PrimeaGuide);
}

export function getByCategory(category: string) {
  return guideRegistry.filter((g) => g.category === category);
}
