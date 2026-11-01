import { Container } from "@/components/Container";
import { GuideCard } from "@/components/GuideCard";
import { getAllListings } from "@/lib/guides";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: "All Ranked & Reviewed Buying Guides",
  description: "Browse every Primea Reviews buying guide. Each one ranks the top products in its category with a transparent 100-point Primea Score.",
  path: "/guides",
});

export default function GuidesIndex() {
  const all = [...getAllListings()].sort((a, b) => a.h1.localeCompare(b.h1));
  return (
    <Container className="py-12">
      <p className="eyebrow">Library</p>
      <h1 className="mt-1 text-4xl font-semibold text-ink">All Buying Guides</h1>
      <p className="mt-2 text-ink-soft">{all.length} guides, each ranked and reviewed by the Primea editorial team.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {all.map((g) => <GuideCard key={g.slug} g={g} />)}
      </div>
    </Container>
  );
}
