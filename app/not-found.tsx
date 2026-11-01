import Link from "next/link";
import { Container } from "@/components/Container";

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-2 text-4xl font-semibold text-ink">We couldn&apos;t find that page</h1>
      <Link href="/guides" prefetch={false} className="mt-6 inline-block rounded-full bg-pine px-6 py-3 font-semibold text-white">
        Browse all guides
      </Link>
    </Container>
  );
}
