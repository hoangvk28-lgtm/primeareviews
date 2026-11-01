import { ProsePage } from "@/components/Prose";
import { buildMetadata } from "@/lib/seo";
import { SCORE_WEIGHTS } from "@/lib/score";

export const metadata = buildMetadata({
  title: "How We Rank: The Primea Score Explained",
  description: "How Primea Reviews ranks and reviews products: the five weighted criteria behind every 100-point Primea Score, and what we never let influence a ranking.",
  path: "/how-we-rank",
});

export default function HowWeRank() {
  return (
    <ProsePage eyebrow="Methodology" title="How We Rank and Review">
      <p>
        Every Primea guide starts with a shortlist of the products buyers actually consider in that category. Our
        editors then review each one against the same five criteria and turn the result into a single Primea Score
        out of 100.
      </p>
      <h2>The five criteria</h2>
      <ul>
        {SCORE_WEIGHTS.map((w) => (
          <li key={w.key}><strong>{w.label} ({w.weight}%)</strong></li>
        ))}
      </ul>
      <p>
        <strong>Performance</strong> covers whether the product does its core job well, judged from manufacturer
        specifications, independent measurements where they exist, and patterns in long-term owner reports.{" "}
        <strong>Build &amp; Materials</strong> looks at construction, materials, warranty terms and recurring failure
        reports. <strong>Everyday Usability</strong> weighs setup, controls, footprint and maintenance.{" "}
        <strong>Value</strong> compares what you get against the alternatives in the same guide.{" "}
        <strong>Owner Satisfaction</strong> reflects the overall picture from verified buyer feedback.
      </p>
      <h2>Where our information comes from</h2>
      <p>
        Our reviews are built from detailed product research: manufacturer spec sheets and manuals, published
        certifications, warranty documents, independent data where available, and large volumes of verified owner
        feedback. When a product has been physically tested by our team, the review says so explicitly.
      </p>
      <h2>What never affects a ranking</h2>
      <ul>
        <li>Brands cannot pay for a spot or a higher score.</li>
        <li>Commission rates are not part of the Primea Score.</li>
        <li>We re-review guides regularly and re-rank when better products appear or old ones decline.</li>
      </ul>
      <h2>Score bands</h2>
      <ul>
        <li><strong>92-100 Outstanding</strong>: the best available in its class.</li>
        <li><strong>85-91 Excellent</strong>: a strong buy with minor tradeoffs.</li>
        <li><strong>78-84 Very Good</strong>: right for specific needs or budgets.</li>
      </ul>
    </ProsePage>
  );
}
