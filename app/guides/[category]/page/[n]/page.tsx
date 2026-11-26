import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { GuideGrid, PER_PAGE, pageCount, pageSlice } from "@/components/GuideGrid";
import { getByCategory } from "@/lib/guides";
import { categories, getCategory } from "@/data/categories";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 86400;

type Props = { params: Promise<{ category: string; n: string }> };

// Page 1 lives at /guides/<category>, so only 2..N are built here.
export function generateStaticParams() {
  return categories.flatMap((c) => {
    const pages = pageCount(getByCategory(c.slug).length);
    return Array.from({ length: Math.max(0, pages - 1) }, (_, i) => ({ category: c.slug, n: String(i + 2) }));
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, n } = await params;
  const c = getCategory(category);
  const page = Number(n);
  if (!c || !Number.isInteger(page) || page < 2 || page > pageCount(getByCategory(c.slug).length)) return {};
  return buildMetadata({
    title: `Best ${c.name} Products, Page ${page}`,
    description: `Page ${page} of the Primea Reviews ${c.name.toLowerCase()} guides, each ranked and reviewed with a 100-point Primea Score.`.slice(0, 160),
    path: `/guides/${c.slug}/page/${page}`,
  });
}

export default async function CategoryPageN({ params }: Props) {
  const { category, n } = await params;
  const c = getCategory(category);
  if (!c) notFound();
  const page = Number(n);
  const list = getByCategory(c.slug);
  const pages = pageCount(list.length);
  if (!Number.isInteger(page) || page < 2 || page > pages) notFound();
  return (
    <Container className="py-12">
      <p className="eyebrow">Category</p>
      <h1 className="mt-1 text-4xl font-semibold text-ink">{c.name}</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">{c.blurb}</p>
      <p className="mt-2 text-sm text-ink-mute">
        Page {page} of {pages}. Showing {(page - 1) * PER_PAGE + 1} to {Math.min(page * PER_PAGE, list.length)} of{" "}
        {list.length} guides.
      </p>
      <GuideGrid items={pageSlice(list, page)} base={`/guides/${c.slug}`} page={page} pages={pages} />
    </Container>
  );
}
