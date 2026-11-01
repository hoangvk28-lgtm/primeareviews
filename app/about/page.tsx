import Link from "next/link";
import { ProsePage } from "@/components/Prose";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "About Primea Reviews",
  description: "Primea Reviews is an independent editorial team that ranks and reviews home, office, kitchen and outdoor products with a transparent 100-point score.",
  path: "/about",
});

export default function About() {
  return (
    <ProsePage eyebrow="About" title="About Primea Reviews">
      <p>
        Primea Reviews exists for one reason: to help you buy the right product the first time. Our editorial team
        has spent years reviewing home, office, kitchen and outdoor products, and we built Primea around a single,
        consistent scoring framework so every recommendation is comparable.
      </p>
      <p>
        Each guide is ranked and reviewed by the Primea Editorial Team. We publish our{" "}
        <Link href="/how-we-rank" prefetch={false}>full ranking methodology</Link> and update guides when the market
        changes.
      </p>
      <h2>Independent by design</h2>
      <p>
        We are reader-supported. When you buy through links on our site we may earn an affiliate commission, but no
        brand can pay for placement or influence a score. See our{" "}
        <Link href="/affiliate-disclosure" prefetch={false}>affiliate disclosure</Link>.
      </p>
    </ProsePage>
  );
}
