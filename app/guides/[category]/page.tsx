import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { GuideCard } from "@/components/GuideCard";
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
  return (
    <Container className="py-12">
      <p className="eyebrow">Category</p>
      <h1 className="mt-1 text-4xl font-semibold text-ink">{c.name}</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">{c.blurb}</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((g) => <GuideCard key={g.slug} g={g} />)}
      </div>
    </Container>
  );
}
