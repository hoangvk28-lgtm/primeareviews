import Link from "next/link";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { categories } from "@/data/categories";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link href="/" prefetch={false} aria-label="Primea Reviews home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-ink-soft md:flex">
          {categories.slice(0, 4).map((c) => (
            <Link key={c.slug} href={`/guides/${c.slug}`} prefetch={false} className="hover:text-pine">
              {c.name}
            </Link>
          ))}
          <Link href="/how-we-rank" prefetch={false} className="hover:text-pine">
            How We Rank
          </Link>
        </nav>
        <Link
          href="/guides"
          prefetch={false}
          className="rounded-full bg-pine px-4 py-2 text-sm font-semibold text-white hover:bg-pine-dark"
        >
          All Reviews
        </Link>
      </Container>
    </header>
  );
}
