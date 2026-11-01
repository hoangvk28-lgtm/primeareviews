import Link from "next/link";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { categories } from "@/data/categories";

const company = [
  { href: "/about", label: "About" },
  { href: "/how-we-rank", label: "How We Rank" },
  { href: "/affiliate-disclosure", label: "Affiliate Disclosure" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-pine-dark text-white/80">
      <Container className="grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo inverse />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            Every guide on Primea Reviews is ranked and reviewed by our editors with the Primea Score, a fixed
            five-part framework. No brand pays for placement.
          </p>
        </div>
        <div>
          <p className="eyebrow !text-gold">Categories</p>
          <ul className="mt-4 space-y-2 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/guides/${c.slug}`} prefetch={false} className="hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow !text-gold">Primea</p>
          <ul className="mt-4 space-y-2 text-sm">
            {company.map((l) => (
              <li key={l.href}>
                <Link href={l.href} prefetch={false} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">
        © 2026 Primea Reviews. As an Amazon Associate we earn from qualifying purchases.
      </div>
    </footer>
  );
}
