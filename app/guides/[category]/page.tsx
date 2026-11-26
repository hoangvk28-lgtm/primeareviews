import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { GuideGrid, PER_PAGE, pageCount, pageSlice } from "@/components/GuideGrid";
import { getByCategory } from "@/lib/guides";
import { categories, getCategory } from "@/data/categories";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 86400;

type Props = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const c = getCategory(category);
  if (!c) return {};
  return buildMetadata({
    title: `Best ${c.name} Products, Ranked & Reviewed`,
    description: `${c.blurb} Every ${c.name.toLowerCase()} guide on Primea Reviews ranks its picks with a 100-point Primea Score.`.slice(0, 160),
    path: `/guides/${c.slug}`,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const c = getCategory(category);
  if (!c) notFound();
  const list = getByCategory(c.slug);
  const pages = pageCount(list.length);
  return (
    <Container className="py-12">
      <p className="eyebrow">Category</p>
      <h1 className="mt-1 text-4xl font-semibold text-ink">{c.name}</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">{c.blurb}</p>
      <p className="mt-2 text-sm text-ink-mute">
        {list.length} guides. Showing 1 to {Math.min(PER_PAGE, list.length)}.
      </p>
      <GuideGrid items={pageSlice(list, 1)} base={`/guides/${c.slug}`} page={1} pages={pages} />
    </Container>
  );
}
