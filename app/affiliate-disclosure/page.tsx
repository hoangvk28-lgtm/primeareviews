import { ProsePage } from "@/components/Prose";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Affiliate Disclosure",
  description: "How Primea Reviews earns money: we participate in the Amazon Associates program and may earn a commission on qualifying purchases at no cost to you.",
  path: "/affiliate-disclosure",
});

export default function Disclosure() {
  return (
    <ProsePage eyebrow="Transparency" title="Affiliate Disclosure">
      <p>
        Primea Reviews is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program
        designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.
      </p>
      <p>
        When you click a link on our site and make a purchase, we may earn a commission. This never changes the price
        you pay, and it never changes our rankings: the Primea Score is set by our editors using a fixed methodology,
        and commission rates are not part of it.
      </p>
      <p>
        Prices and availability shown on Amazon change frequently. Always confirm the current price on the retailer&apos;s
        page before you buy.
      </p>
    </ProsePage>
  );
}
