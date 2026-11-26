import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";
import { GuideCard } from "@/components/GuideCard";
import { getAllListings, getByCategory } from "@/lib/guides";
import { categories } from "@/data/categories";
import { SCORE_WEIGHTS } from "@/lib/score";

export const revalidate = 86400;

export default function Home() {
  const all = getAllListings();
  const latest = [...all].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 9);
  const featured = [...all].sort((a, b) => b.topScore - a.topScore)[0];
  // One deep link per category: the homepage should pass authority to real guides,
  // not only to the hubs and the nine newest cards.
  const topByCategory = categories
    .map((c) => ({ category: c, guide: [...getByCategory(c.slug)].sort((x, y) => y.topScore - x.topScore)[0] }))
    .filter((x) => x.guide);

  return (
    <>
      <section className="relative overflow-hidden bg-pine text-white">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gold/20 blur-3xl" aria-hidden="true" />
        <Container className="relative grid gap-10 py-16 sm:py-24 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <p className="eyebrow !text-gold">Ranked &amp; Reviewed by Primea</p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.1] sm:text-6xl">
              Buy once.<br />Buy the <em className="text-gold not-italic">right</em> one.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/80">
              Primea Reviews ranks the products worth your money across home, office, kitchen and outdoor categories,
              with a transparent 100-point score behind every pick.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/guides" prefetch={false} className="rounded-full bg-gold px-6 py-3 font-semibold text-pine-dark hover:bg-white">
                Browse all {all.length} {all.length === 1 ? "guide" : "guides"}
              </Link>
              <Link href="/how-we-rank" prefetch={false} className="rounded-full border border-white/30 px-6 py-3 font-semibold hover:bg-white/10">
                How the Primea Score works
              </Link>
            </div>
          </div>
          {featured && (
            <Link href={`/guide/${featured.slug}`} prefetch={false} className="group relative mx-auto block w-full max-w-md lg:max-w-none">
              <div className="absolute -inset-3 rotate-3 rounded-[2rem] border border-gold/40" aria-hidden="true" />
              <div className="relative aspect-[5/4] overflow-hidden rounded-[1.75rem] bg-paper shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#fff_0%,#fbf8f2_45%,#f1e7cf_100%)]" />
                <Image
                  src={featured.heroImage}
                  alt={featured.h1}
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 480px"
                  className="object-contain p-10 transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-pine-dark/90 to-transparent p-5 pt-16">
                  <p className="eyebrow !text-gold">Featured ranking</p>
                  <p className="mt-1 font-display text-lg font-semibold leading-snug text-white">{featured.h1}</p>
                </div>
              </div>
              <div className="absolute -left-4 top-6 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-ink shadow-xl sm:-left-8">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border-4 border-pine font-display text-base font-bold">
                  {featured.topScore}
                </span>
                <span className="text-xs leading-tight">
                  <span className="block font-semibold text-pine">Primea Score</span>
                  <span className="text-ink-mute">Top pick, out of 100</span>
                </span>
              </div>
              <div className="absolute -right-3 bottom-24 rounded-full bg-gold px-3 py-1.5 text-xs font-bold text-pine-dark shadow-lg sm:-right-6">
                ★ Ranked &amp; Reviewed
              </div>
            </Link>
          )}
        </Container>
      </section>

      <section className="border-b border-line bg-card">
        <Container className="grid gap-6 py-8 sm:grid-cols-[200px_1fr] sm:items-center">
          <div>
            <p className="eyebrow">The Primea Score</p>
            <p className="mt-1 text-sm text-ink-soft">Five fixed criteria behind every pick.</p>
          </div>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {SCORE_WEIGHTS.map((w) => (
              <li key={w.key}>
                <div className="flex justify-between text-sm font-medium text-ink"><span>{w.label}</span><span className="text-gold-dark">{w.weight}%</span></div>
                <div className="mt-1.5 h-1.5 rounded-full bg-line"><div className="h-1.5 rounded-full bg-pine" style={{ width: `${w.weight * 3.33}%` }} /></div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <Container className="py-14">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">Fresh rankings</p>
            <h2 className="mt-1 text-3xl font-semibold text-ink">Latest Ranked &amp; Reviewed</h2>
          </div>
          <Link href="/guides" prefetch={false} className="hidden text-sm font-semibold text-pine hover:underline sm:block">View all →</Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((g) => <GuideCard key={g.slug} g={g} />)}
        </div>
      </Container>

      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="eyebrow">Why Primea</p>
            <h2 className="mt-1 text-3xl font-semibold text-ink">A ranking you can argue with</h2>
            <div className="rule-gold mt-3 w-24" />
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-ink-soft">
              <p>
                Most buying guides hand you ten products and no opinion. Ours do the opposite. Every pick carries a
                Primea Score out of 100, built from five fixed criteria that never move between categories: performance,
                build and materials, everyday usability, value, and owner satisfaction. The weights are published, so
                you can disagree with a ranking on the merits instead of guessing how it was made.
              </p>
              <p>
                Our editors research each product the way a careful buyer would, through spec sheets, manuals,
                warranties, certifications and what owners report after months of use. Where a listing contradicts
                itself or leaves out a number that matters, we say so in the review rather than repeat it. We do not
                claim to have physically tested a product unless we have, and no brand pays for placement.
              </p>
              <p>
                Each guide ends where a real decision starts: who should buy a pick, who should skip it, what to spend,
                and which compromise you are actually making. Start with the{" "}
                <Link href="/how-we-rank" prefetch={false} className="font-semibold text-pine hover:underline">
                  scoring rules
                </Link>{" "}
                if you want to know how the numbers are built, or go straight to a category below.
              </p>
            </div>
          </div>
          <div>
            <p className="eyebrow">Start here</p>
            <h2 className="mt-1 text-3xl font-semibold text-ink">The highest-scoring guide in each category</h2>
            <div className="rule-gold mt-3 w-24" />
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {topByCategory.map(({ category, guide }) => (
                <li key={category.slug} className="py-4">
                  <p className="eyebrow">{category.name}</p>
                  <Link
                    href={`/guide/${guide.slug}`}
                    prefetch={false}
                    className="mt-1 block font-display text-lg font-semibold leading-snug text-pine hover:underline"
                  >
                    {guide.h1}
                  </Link>
                  <p className="mt-1 text-sm text-ink-mute">Top pick scores {guide.topScore} out of 100</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      <section className="border-y border-line bg-card">
        <Container className="py-14">
          <p className="eyebrow">Explore</p>
          <h2 className="mt-1 text-3xl font-semibold text-ink">Shop by Category</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <Link key={c.slug} href={`/guides/${c.slug}`} prefetch={false} className="rounded-2xl border border-line bg-paper p-5 hover:border-gold">
                <p className="font-display text-lg font-semibold text-pine">{c.name}</p>
                <p className="mt-1 text-sm text-ink-soft">{c.blurb}</p>
                <p className="mt-3 text-xs font-semibold text-gold-dark">{getByCategory(c.slug).length} guides</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
