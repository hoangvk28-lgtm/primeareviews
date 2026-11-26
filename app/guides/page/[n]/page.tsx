import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { GuideGrid, PER_PAGE, pageCount, pageSlice } from "@/components/GuideGrid";
import { getAllListings } from "@/lib/guides";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 86400;

type Props = { params: Promise<{ n: string }> };

const sorted = () => [...getAllListings()].sort((a, b) => a.h1.localeCompare(b.h1));

// Page 1 lives at /guides, so only 2..N are built here.
export function generateStaticParams() {
  const pages = pageCount(getAllListings().length);
  return Array.from({ length: Math.max(0, pages - 1) }, (_, i) => ({ n: String(i + 2) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { n } = await params;
  const page = Number(n);
  if (!Number.isInteger(page) || page < 2 || page > pageCount(getAllListings().length)) return {};
  return buildMetadata({
    title: `All Buying Guides, Page ${page}`,
    description: `Page ${page} of every Primea Reviews buying guide, each ranked and reviewed with a transparent 100-point Primea Score.`,
    path: `/guides/page/${page}`,
  });
}

export default async function GuidesIndexPage({ params }: Props) {
  const { n } = await params;
  const page = Number(n);
  const all = sorted();
  const pages = pageCount(all.length);
  if (!Number.isInteger(page) || page < 2 || page > pages) notFound();
  const items = pageSlice(all, page);
  return (
    <Container className="py-12">
      <p className="eyebrow">Library</p>
      <h1 className="mt-1 text-4xl font-semibold text-ink">All Buying Guides</h1>
      <p className="mt-2 text-ink-soft">
        Page {page} of {pages}. Showing {(page - 1) * PER_PAGE + 1} to {Math.min(page * PER_PAGE, all.length)} of{" "}
        {all.length} guides.
      </p>
      <GuideGrid items={items} base="/guides" page={page} pages={pages} />
    </Container>
  );
}
