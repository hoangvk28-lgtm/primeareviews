import Image from "next/image";
import Link from "next/link";
import { AUTHOR } from "@/lib/author";
import { Container } from "./Container";
import { ScoreRing } from "./ScoreRing";
import type { PrimeaGuide, PrimeaProduct } from "@/lib/types";
import { SITE_URL, SITE_NAME, SERP_LABEL } from "@/lib/site";
import { SCORE_WEIGHTS } from "@/lib/score";
import { getCategory } from "@/data/categories";

const AMAZON_BTN =
  "inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-pine-dark hover:bg-gold-dark hover:text-white transition-colors";

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function Scoreboard({ products }: { products: PrimeaProduct[] }) {
  return (
    <section id="scoreboard" className="my-10 overflow-hidden rounded-2xl border border-line bg-card shadow-card">
      <div className="flex items-center justify-between bg-pine px-5 py-3">
        <p className="font-display text-lg font-semibold text-white">The Primea Scoreboard</p>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">{SERP_LABEL}</p>
      </div>
      <ol className="divide-y divide-line">
        {products.map((p) => (
          <li key={p.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4 sm:w-[46%]">
              <span className="font-display text-2xl font-bold text-gold">{String(p.rank).padStart(2, "0")}</span>
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-line bg-white">
                <Image src={p.imageUrl} alt={p.name} fill sizes="64px" className="object-contain p-1" unoptimized />
              </div>
              <div className="min-w-0">
                <p className="eyebrow">{p.award}</p>
                <a href={`#${p.id}`} className="line-clamp-2 text-sm font-semibold text-ink hover:text-pine">{p.name}</a>
              </div>
            </div>
            <p className="flex-1 text-sm text-ink-soft">{p.verdict}</p>
            <div className="flex items-center gap-4">
              <ScoreRing score={p.score} size={54} />
              <a href={p.amazonUrl} target="_blank" rel="noopener noreferrer sponsored" className={AMAZON_BTN}>
                Check price
              </a>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ProductReview({ p }: { p: PrimeaProduct }) {
  return (
    <article id={p.id} className="mb-16">
      <div className="mb-4 flex items-start gap-4">
        <span className="font-display text-5xl font-bold leading-none text-gold/70">{p.rank}</span>
        <div className="min-w-0">
          <p className="eyebrow">{p.award}</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink sm:text-3xl">{p.name}</h2>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-card">
        <div className="grid gap-6 p-5 sm:grid-cols-[240px_1fr] sm:p-6">
          <div className="flex flex-col items-center gap-4">
            <a href={p.amazonUrl} target="_blank" rel="noopener noreferrer sponsored" className="relative block h-56 w-full overflow-hidden rounded-xl border border-line bg-white">
              <Image src={p.imageUrl} alt={p.name} fill sizes="240px" className="object-contain p-3" unoptimized />
            </a>
            <ScoreRing score={p.score} />
            <a href={p.amazonUrl} target="_blank" rel="noopener noreferrer sponsored" className={AMAZON_BTN + " w-full"}>
              Check price on Amazon
            </a>
          </div>
          <div className="min-w-0">
            <p className="mb-3 rounded-lg bg-gold-soft px-4 py-3 text-sm text-ink">
              <span className="font-semibold text-pine">Our verdict: </span>
              {p.verdict}
            </p>
            {p.description.split("\n\n").map((para, i) => (
              <p key={i} className="mt-3 text-[15px] leading-relaxed text-ink-soft">{para}</p>
            ))}
            <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line text-sm">
              {p.keySpecs.map((s) => (
                <div key={s.label} className="bg-paper px-3 py-2">
                  <dt className="text-[11px] uppercase tracking-wider text-ink-mute">{s.label}</dt>
                  <dd className="font-medium text-ink">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="grid border-t border-line sm:grid-cols-2">
          <div className="p-5 sm:border-r sm:border-line">
            <p className="text-xs font-bold uppercase tracking-widest text-plus">What we like</p>
            <ul className="mt-3 space-y-2 text-sm text-ink">
              {p.pros.map((x) => (
                <li key={x} className="flex gap-2"><span className="font-bold text-plus">+</span>{x}</li>
              ))}
            </ul>
          </div>
          <div className="border-t border-line p-5 sm:border-t-0">
            <p className="text-xs font-bold uppercase tracking-widest text-minus">Watch out for</p>
            <ul className="mt-3 space-y-2 text-sm text-ink">
              {p.cons.map((x) => (
                <li key={x} className="flex gap-2"><span className="font-bold text-minus">−</span>{x}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="grid border-t border-line bg-paper text-sm sm:grid-cols-2">
          <p className="p-4 sm:border-r sm:border-line"><span className="font-semibold text-pine">Buy it if: </span>{p.idealFor}</p>
          <p className="border-t border-line p-4 sm:border-t-0"><span className="font-semibold text-minus">Skip it if: </span>{p.skipIf}</p>
        </div>
      </div>
    </article>
  );
}

// A long guide with no anchors is hard to scan and gives search engines nothing to
// deep link to. Section ids above feed this list.
function Contents({ picks }: { picks: { id: string; name: string }[] }) {
  const sections = [
    { href: "#scoreboard", label: "The ranking at a glance" },
    { href: "#what-matters", label: "What actually matters" },
    { href: "#reviews", label: "Our ranked picks, reviewed" },
    { href: "#methodology", label: "How we ranked these" },
    { href: "#how-to-choose", label: "How to pick the right one" },
    { href: "#faq", label: "Frequently asked questions" },
    { href: "#verdict", label: "Final take" },
  ];
  return (
    <nav aria-label="On this page" className="mt-8 rounded-2xl border border-line bg-card p-6">
      <p className="eyebrow">On this page</p>
      <ol className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        {sections.map((x) => (
          <li key={x.href}>
            <a href={x.href} className="text-pine hover:underline">{x.label}</a>
          </li>
        ))}
      </ol>
      <p className="mt-5 eyebrow">Jump to a pick</p>
      <ol className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        {picks.map((p, i) => (
          <li key={p.id}>
            <a href={`#${p.id}`} className="text-ink-soft hover:text-pine hover:underline">
              {i + 1}. {p.name}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Who stands behind the ranking, stated at the point the reader finishes it.
function AuthorBox() {
  return (
    <section className="my-12 rounded-2xl border border-line bg-card p-6 sm:p-7">
      <p className="eyebrow">About the author</p>
      <div className="mt-4 flex flex-col gap-5 sm:flex-row">
        <Link
          href={`/author/${AUTHOR.slug}`}
          prefetch={false}
          className="relative block h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-4 border-gold"
        >
          <Image src={AUTHOR.avatar} alt={`${AUTHOR.name}, ${AUTHOR.role} at ${SITE_NAME}`} fill sizes="96px" className="object-cover" unoptimized />
        </Link>
        <div className="min-w-0">
          <h2 className="font-display text-xl font-semibold text-ink">
            <Link href={`/author/${AUTHOR.slug}`} prefetch={false} className="hover:text-pine hover:underline">
              {AUTHOR.name}
            </Link>
          </h2>
          <p className="text-sm font-semibold text-gold-dark">{AUTHOR.role}, {SITE_NAME}</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Joshua owns the Primea Score framework and signs off on every ranking this site publishes. He and the
            editors work from spec sheets, manuals, warranty terms, certifications and long-term owner feedback, and
            a guide says so plainly when a listing leaves out the number that decides the purchase. Primea never
            claims to have physically tested a product it has not, and no brand can pay for placement.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
            <Link href={`/author/${AUTHOR.slug}`} prefetch={false} className="text-pine hover:underline">
              More about {AUTHOR.name.split(" ")[0]}
            </Link>
            <Link href="/how-we-rank" prefetch={false} className="text-pine hover:underline">
              How we rank
            </Link>
            <Link href="/contact" prefetch={false} className="text-pine hover:underline">
              Report a correction
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// The buyer's guide tables name a product in every "Our pick" cell, but they were plain
// text: the reader had to scroll back up to the review to reach the buy link. Match each
// cell against this guide's own lineup and make it an affiliate link.
const normName = (t: string) => t.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
const NAME_STOP = new Set(["and", "for", "with", "the", "ios", "android", "pack", "set", "inch", "best", "our", "pick"]);

function findProduct(cell: string, products: PrimeaProduct[]): PrimeaProduct | null {
  const c = normName(cell);
  if (c.length < 3) return null;
  let best: { p: PrimeaProduct; score: number } | null = null;
  for (const p of products) {
    const n = normName(p.name);
    if (!n) continue;
    if (c === n) return p;
    if (c.includes(n) || n.includes(c)) {
      const score = Math.min(c.length, n.length) / Math.max(c.length, n.length);
      if (score > 0.45 && (!best || score > best.score)) best = { p, score };
    }
  }
  if (best) return best.p;
  // Fall back to distinctive word overlap, so "Apple AirTag (2nd Gen)" still finds
  // "Apple AirTag (2nd Generation)". Common qualifiers are excluded or every cell
  // mentioning "iOS and Android" would match the same product.
  const words = (t: string) => new Set(normName(t).split(" ").filter((w) => w.length > 2 && !NAME_STOP.has(w)));
  const cw = words(cell);
  if (cw.size < 2) return null;
  for (const p of products) {
    const pw = words(p.name);
    if (pw.size < 2) continue;
    const shared = [...cw].filter((w) => pw.has(w)).length;
    const ratio = shared / Math.min(cw.size, pw.size);
    if (shared >= 2 && ratio >= 0.6 && (!best || ratio > best.score)) best = { p, score: ratio };
  }
  return best?.p ?? null;
}

function PickCell({ text, products, pickColumn }: { text: string; products: PrimeaProduct[]; pickColumn: boolean }) {
  const p = pickColumn ? findProduct(text, products) : null;
  if (!p) return <>{text}</>;
  return (
    <a
      href={p.amazonUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="font-semibold text-pine underline decoration-gold decoration-2 underline-offset-2 hover:text-gold-dark"
    >
      {text}
    </a>
  );
}

export function GuidePage({ guide, related }: { guide: PrimeaGuide; related: { slug: string; h1: string }[] }) {
  const cat = getCategory(guide.category);
  const url = `${SITE_URL}/guide/${guide.slug}`;
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: guide.h1,
      description: guide.metaDescription,
      datePublished: guide.publishedAt,
      dateModified: guide.updatedAt,
      author: {
        "@type": "Person",
        name: AUTHOR.name,
        jobTitle: AUTHOR.role,
        url: AUTHOR.url,
        image: `${SITE_URL}${AUTHOR.image}`,
      },
      publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png` } },
      mainEntityOfPage: url,
      image: guide.heroImage,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Reviews", item: `${SITE_URL}/guides` },
        { "@type": "ListItem", position: 3, name: guide.h1, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: guide.products.map((p) => ({ "@type": "ListItem", position: p.rank, name: p.name, url: `${url}#${p.id}` })),
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="border-b border-gold/30 bg-gold-soft">
        <Container className="flex items-start gap-2 py-2.5 text-xs text-ink-soft">
          <svg className="mt-px h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#9c7a2c" strokeWidth="2.2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v5M12 16.5v.5" strokeLinecap="round" />
          </svg>
          <p>
            Primea Reviews is reader-supported. When you buy through our Amazon links we may earn a commission, at no
            extra cost to you. Rankings are set by our editors and never sold.{" "}
            <Link href="/affiliate-disclosure" prefetch={false} className="font-semibold text-pine hover:underline">Learn more</Link>
          </p>
        </Container>
      </div>
      <div className="border-b border-line bg-gradient-to-b from-pine-soft to-paper">
        <Container className="py-10 sm:py-14">
          <nav className="text-xs text-ink-mute" aria-label="Breadcrumb">
            <Link href="/" prefetch={false} className="hover:text-pine">Home</Link> /{" "}
            <Link href="/guides" prefetch={false} className="hover:text-pine">Reviews</Link>
            {cat && (
              <> / <Link href={`/guides/${cat.slug}`} prefetch={false} className="hover:text-pine">{cat.name}</Link></>
            )}
          </nav>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white px-3 py-1 text-xs font-semibold text-pine">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#c9a24b" aria-hidden="true"><path d="M12 2l2.9 6.9L22 9.6l-5.5 4.8L18.2 22 12 18.3 5.8 22l1.7-7.6L2 9.6l7.1-.7z" /></svg>
            {SERP_LABEL} by {SITE_NAME}
          </div>
          <h1 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight text-ink sm:text-5xl">{guide.h1}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-soft">
            <span className="flex items-center gap-2.5">
              <Link href={`/author/${AUTHOR.slug}`} prefetch={false} className="relative block h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-gold">
                <Image src={AUTHOR.avatar} alt={AUTHOR.name} fill sizes="36px" className="object-cover" unoptimized />
              </Link>
              <span>
                By{" "}
                <Link href={`/author/${AUTHOR.slug}`} prefetch={false} className="font-semibold text-pine underline-offset-2 hover:underline">
                  {AUTHOR.name}
                </Link>
                , {AUTHOR.role}
              </span>
            </span>
            <span>Updated {fmtDate(guide.updatedAt)}</span>
            <span>{guide.readTime} read</span>
            <span>{guide.products.length} products ranked</span>
          </div>
        </Container>
      </div>

      <Container className="grid gap-12 py-10 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-line bg-white">
            <Image src={guide.heroImage} alt={guide.h1} fill priority sizes="(max-width: 1024px) 100vw, 760px" className="object-contain p-6" unoptimized />
          </div>

          <section className="mt-8 rounded-2xl bg-pine p-6 text-white">
            <p className="eyebrow !text-gold">The short answer</p>
            <p className="mt-2 text-[15px] leading-relaxed text-white/90">{guide.summary}</p>
          </section>

          <Contents picks={guide.products.map((p) => ({ id: p.id, name: p.name }))} />

          <Scoreboard products={guide.products} />

          <section className="space-y-4 text-[16px] leading-relaxed text-ink-soft">
            {guide.intro.map((p, i) => <p key={i}>{p}</p>)}
          </section>

          <section id="what-matters" className="my-12">
            <p className="eyebrow">Before you buy</p>
            <h2 className="mt-1 text-2xl font-semibold text-ink sm:text-3xl">What Actually Matters</h2>
            <div className="rule-gold mt-3 w-24" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {guide.whatMatters.map((w, i) => (
                <div key={w.factor} className="rounded-xl border border-line bg-card p-5">
                  <p className="font-display text-sm font-bold text-gold">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-1 text-lg font-semibold text-ink">{w.factor}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{w.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <div id="reviews" className="mb-6">
            <p className="eyebrow">In-depth reviews</p>
            <h2 className="mt-1 text-2xl font-semibold text-ink sm:text-3xl">Our Ranked Picks, Reviewed</h2>
            <div className="rule-gold mt-3 w-24" />
          </div>
          {guide.products.map((p) => <ProductReview key={p.id} p={p} />)}

          <section id="methodology" className="my-12 rounded-2xl border border-line bg-card p-6">
            <p className="eyebrow">Methodology</p>
            <h2 className="mt-1 text-2xl font-semibold text-ink">How We Ranked These</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {guide.methodology.map((m) => (
                <div key={m.title} className="rounded-xl bg-paper p-4">
                  <h3 className="font-semibold text-pine">{m.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{m.description}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs text-ink-mute">
              Every Primea Score uses the same weights:{" "}
              {SCORE_WEIGHTS.map((w) => `${w.label} ${w.weight}%`).join(" · ")}.{" "}
              <Link href="/how-we-rank" prefetch={false} className="font-semibold text-pine hover:underline">Full scoring rules</Link>
            </p>
          </section>

          <section id="how-to-choose" className="my-12">
            <p className="eyebrow">Buyer&apos;s guide</p>
            <h2 className="mt-1 text-2xl font-semibold text-ink sm:text-3xl">How to Pick the Right One for You</h2>
            <div className="rule-gold mt-3 w-24" />
            <div className="mt-6 space-y-8">
              {guide.howToChoose.map((s) => (
                <div key={s.subheading}>
                  <h3 className="text-xl font-semibold text-ink">{s.subheading}</h3>
                  {s.intro && <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.intro}</p>}
                  {s.table && (
                    <div className="mt-3 overflow-x-auto rounded-xl border border-line">
                      <table className="w-full min-w-[480px] text-left text-sm">
                        <thead className="bg-pine text-white">
                          <tr>{s.table.headers.map((h) => <th key={h} className="px-4 py-2.5 font-semibold">{h}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-line bg-card">
                          {s.table.rows.map((r, i) => (
                            <tr key={i}>
                              {r.map((c, j) => (
                                <td key={j} className={"px-4 py-2.5 " + (j === 0 ? "font-medium text-ink" : "text-ink-soft")}>
                                  <PickCell
                                    text={c}
                                    products={guide.products}
                                    pickColumn={j > 0 && /pick|recommend|choice|buy|get/i.test(s.table!.headers[j] ?? "")}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {s.cards && (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {s.cards.map((c) => (
                        <div key={c.label} className="rounded-xl border border-line bg-card p-4">
                          <p className="font-semibold text-pine">{c.label}</p>
                          <p className="mt-1 text-sm leading-relaxed text-ink-soft">{c.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {s.note && <p className="mt-3 rounded-lg bg-gold-soft px-4 py-2.5 text-sm text-ink">{s.note}</p>}
                </div>
              ))}
            </div>
          </section>

          <section id="faq" className="my-12">
            <p className="eyebrow">Questions</p>
            <h2 className="mt-1 text-2xl font-semibold text-ink sm:text-3xl">Frequently Asked Questions</h2>
            <div className="mt-5 divide-y divide-line rounded-2xl border border-line bg-card">
              {guide.faq.map((f) => (
                <details key={f.q} className="group p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink">
                    {f.q}
                    <span className="text-gold transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section id="verdict" className="my-12 rounded-2xl border-2 border-gold bg-card p-6">
            <p className="eyebrow">Final take</p>
            <p className="mt-2 text-[15px] leading-relaxed text-ink">{guide.finalTake}</p>
          </section>

          <AuthorBox />

          {related.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-ink">More Ranked & Reviewed Guides</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => (
                  <Link key={r.slug} href={`/guide/${r.slug}`} prefetch={false} className="rounded-xl border border-line bg-card p-4 text-sm font-semibold text-ink hover:border-gold hover:text-pine">
                    {r.h1}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-line bg-card p-5">
            <p className="eyebrow">Top picks</p>
            <ol className="mt-3 space-y-3">
              {guide.products.slice(0, 5).map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  <span className="font-display text-lg font-bold text-gold">{p.rank}</span>
                  <a href={`#${p.id}`} className="line-clamp-2 flex-1 text-sm text-ink hover:text-pine">{p.name}</a>
                  <span className="rounded-md bg-pine px-1.5 py-0.5 text-xs font-bold text-white">{p.score}</span>
                </li>
              ))}
            </ol>
            <div className="mt-5 border-t border-line pt-4 text-xs text-ink-mute">
              <a href="#methodology" className="font-semibold text-pine hover:underline">How we rank →</a>
            </div>
          </div>
        </aside>
      </Container>
    </>
  );
}
