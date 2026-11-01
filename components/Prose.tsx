import { Container } from "./Container";

export function ProsePage({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <Container className="max-w-3xl py-14">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-1 text-4xl font-semibold text-ink">{title}</h1>
      <div className="rule-gold mt-4 w-24" />
      <div className="mt-8 space-y-5 text-[16px] leading-relaxed text-ink-soft [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-ink [&_a]:font-semibold [&_a]:text-pine [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
        {children}
      </div>
    </Container>
  );
}
