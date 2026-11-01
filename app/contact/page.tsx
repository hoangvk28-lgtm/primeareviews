import { ProsePage } from "@/components/Prose";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contact Primea Reviews",
  description: "Get in touch with the Primea Reviews editorial team about a guide, a correction, a product suggestion, or a partnership question. We read every message.",
  path: "/contact",
});

export default function Contact() {
  return (
    <ProsePage eyebrow="Contact" title="Contact Us">
      <p>Spotted an error, want a product reviewed, or have a question about a guide? Email the editorial team:</p>
      <p><a href="mailto:editors@primeareviews.com">editors@primeareviews.com</a></p>
      <p>Brands: we do not accept payment for reviews or rankings.</p>
    </ProsePage>
  );
}
