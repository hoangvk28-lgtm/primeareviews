import { ProsePage } from "@/components/Prose";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: "The Primea Reviews privacy policy: what limited data we collect through analytics and affiliate links, how it is used, and the choices you have about it.",
  path: "/privacy-policy",
});

export default function Privacy() {
  return (
    <ProsePage eyebrow="Legal" title="Privacy Policy">
      <p>Last updated November 1, 2026.</p>
      <p>
        Primea Reviews collects only the data needed to run the site: anonymous analytics (pages viewed, device type,
        approximate region) and standard server logs. We do not sell personal information.
      </p>
      <h2>Cookies and affiliate links</h2>
      <p>
        Analytics tools and affiliate partners such as Amazon may set cookies when you visit our pages or click our
        links, so a purchase can be attributed correctly. You can block or delete cookies in your browser settings.
      </p>
      <h2>Contact</h2>
      <p>Questions about this policy can be sent to privacy@primeareviews.com.</p>
    </ProsePage>
  );
}
