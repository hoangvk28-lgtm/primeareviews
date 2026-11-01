import Image from "next/image";
import Link from "next/link";
import type { GuideListing } from "@/lib/guides";
import { getCategory } from "@/data/categories";

export function GuideCard({ g }: { g: GuideListing }) {
  return (
    <Link
      href={`/guide/${g.slug}`}
      prefetch={false}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-card transition hover:-translate-y-0.5 hover:border-gold"
    >
      <div className="relative aspect-[4/3] bg-white">
        <Image src={g.heroImage} alt={g.h1} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-contain p-5" unoptimized />
        <span className="absolute right-3 top-3 rounded-full bg-pine px-2.5 py-1 text-xs font-bold text-white">
          Top score {g.topScore}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="eyebrow">{getCategory(g.category)?.name ?? "Reviews"}</p>
        <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-ink group-hover:text-pine">{g.h1}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{g.metaDescription}</p>
        <span className="mt-auto pt-4 text-sm font-semibold text-gold-dark">Read the rankings →</span>
      </div>
    </Link>
  );
}
