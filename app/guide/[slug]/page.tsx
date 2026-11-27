import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuidePage } from "@/components/GuidePage";
import { getAllListings, getGuide, getListing } from "@/lib/guides";
import { buildMetadata } from "@/lib/seo";

// Cloudflare Pages static export: every guide is prerendered at build time; unknown slugs get 404.html.
export const dynamicParams = false;
export function generateStaticParams() {
  return getAllListings().map((g) => ({ slug: g.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const g = await getGuide(slug);
  if (!g) return {};
  return buildMetadata({
    title: g.metaTitle,
    description: g.metaDescription,
    path: `/guide/${slug}`,
    image: g.heroImage,
    type: "article",
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const g = await getGuide(slug);
  if (!g) notFound();
  const related = g.related
    .map((s) => getListing(s))
    .filter((x): x is NonNullable<typeof x> => Boolean(x))
    .map(({ slug, h1 }) => ({ slug, h1 }));
  return <GuidePage guide={g} related={related} />;
}
