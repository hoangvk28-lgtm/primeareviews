import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";
import { AUTHOR } from "@/lib/author";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { SCORE_WEIGHTS } from "@/lib/score";
import { getAllListings } from "@/lib/guides";
import { categories } from "@/data/categories";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: `${AUTHOR.name}, ${AUTHOR.role}`,
  description:
    "Joshua Parkes is the editor in chief of Primea Reviews. He owns the Primea Score framework, sets what counts as evidence in a guide, and signs off on every ranking.",
  path: `/author/${AUTHOR.slug}`,
  image: AUTHOR.image,
});

export default function AuthorPage() {
  const all = getAllListings();
  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: AUTHOR.name,
      jobTitle: AUTHOR.role,
      url: AUTHOR.url,
      image: `${SITE_URL}${AUTHOR.image}`,
      description: AUTHOR.short,
      knowsAbout: categories.map((c) => c.name),
      worksFor: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="bg-pine text-white">
        <Container className="grid gap-10 py-14 sm:grid-cols-[180px_1fr] sm:items-center">
          <div className="relative h-[180px] w-[180px] overflow-hidden rounded-2xl border-4 border-gold">
            <Image src={AUTHOR.image} alt={`${AUTHOR.name}, ${AUTHOR.role} at ${SITE_NAME}`} fill sizes="180px" className="object-cover" priority unoptimized />
          </div>
          <div>
            <p className="eyebrow !text-gold">{AUTHOR.role}</p>
            <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">{AUTHOR.name}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/85">
              Joshua runs the editorial side of Primea Reviews. He owns the scoring framework, decides what counts as
              evidence in a guide, and signs off on every ranking before it goes live.
            </p>
          </div>
        </Container>
      </div>

      <Container className="grid gap-12 py-12 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-5 text-[16px] leading-relaxed text-ink-soft">
          <h2 className="font-display text-2xl font-semibold text-ink">How he works</h2>
          <div className="rule-gold w-24" />
          <p>
            Joshua has spent his career around the products Primea covers: home office furniture and ergonomics, the
            small tech that sits on a desk, cleaning and floor care, kitchen appliances, outdoor power equipment and
            mobility aids. The pattern he kept running into is the one this site was built to fix. Most buying guides
            list ten products, hedge on all of them, and leave the reader to guess which compromise they are making.
          </p>
          <p>
            His answer is a fixed framework. Every product on Primea is scored out of 100 on the same five criteria,
            weighted the same way in every category, so a score means the same thing on a monitor arm as it does on a
            dehumidifier. The weights are published rather than implied, which means a reader can disagree with a
            ranking on the merits instead of guessing how it was reached.
          </p>
          <p>
            Research comes before ranking. Joshua and the editors work from spec sheets, manuals, warranty terms,
            safety and efficiency certifications, and what owners report after months of living with a product. Where
            a listing contradicts itself or leaves out the number that actually decides the purchase, the guide says
            so rather than repeating the claim. Primea does not say it physically tested a product unless it did, and
            no brand can pay for placement or influence a score.
          </p>
          <p>
            Every guide ends where a real decision starts: who should buy a pick, who should skip it, what to spend,
            and what you give up either way. If a ranking here is wrong, Joshua wants to hear it. Corrections go to
            the <Link href="/contact" prefetch={false} className="font-semibold text-pine hover:underline">contact page</Link> and
            get read.
          </p>

          <h2 className="pt-4 font-display text-2xl font-semibold text-ink">What he covers</h2>
          <div className="rule-gold w-24" />
          <ul className="grid gap-2 sm:grid-cols-2">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/guides/${c.slug}`} prefetch={false} className="font-semibold text-pine hover:underline">
                  {c.name}
                </Link>
                <span className="text-ink-mute"> ({getAllListings().filter((g) => g.category === c.slug).length} guides)</span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-line bg-card p-6">
            <p className="eyebrow">At a glance</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-mute">Role</dt>
                <dd className="font-semibold text-ink">{AUTHOR.role}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-mute">Guides published</dt>
                <dd className="font-semibold text-ink">{all.length}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-mute">Categories</dt>
                <dd className="font-semibold text-ink">{categories.length}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-2xl border border-line bg-card p-6">
            <p className="eyebrow">The Primea Score</p>
            <ul className="mt-4 space-y-2 text-sm">
              {SCORE_WEIGHTS.map((w) => (
                <li key={w.key} className="flex justify-between gap-4">
                  <span className="text-ink-soft">{w.label}</span>
                  <span className="font-semibold text-gold-dark">{w.weight}%</span>
                </li>
              ))}
            </ul>
            <Link href="/how-we-rank" prefetch={false} className="mt-4 inline-block text-sm font-semibold text-pine hover:underline">
              Full scoring rules
            </Link>
          </div>
        </aside>
      </Container>
    </>
  );
}
