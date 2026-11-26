import { Container } from "@/components/Container";
import { GuideGrid, PER_PAGE, pageCount, pageSlice } from "@/components/GuideGrid";
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
  const pages = pageCount(all.length);
  return (
    <Container className="py-12">
      <p className="eyebrow">Library</p>
      <h1 className="mt-1 text-4xl font-semibold text-ink">All Buying Guides</h1>
      <p className="mt-2 text-ink-soft">
        {all.length} guides, each ranked and reviewed by the Primea editorial team. Showing 1 to{" "}
        {Math.min(PER_PAGE, all.length)}.
      </p>
      <GuideGrid items={pageSlice(all, 1)} base="/guides" page={1} pages={pages} />
    </Container>
  );
}
