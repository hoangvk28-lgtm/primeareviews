import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION, TITLE_SUFFIX } from "./site";

export function buildMetadata({
  title,
  description,
  path = "/",
  image,
  noIndex = false,
  type = "website",
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  type?: "website" | "article";
}): Metadata {
  // Appends " | Primea" once; { absolute } stops the layout template from wrapping it again.
  const fullTitle = title.includes(TITLE_SUFFIX) ? title : `${title} | ${TITLE_SUFFIX}`;
  const canonical = `${SITE_URL}${path === "/" ? "" : path}`;
  // Only the house OG card is really 1200x630. A guide's hero is an Amazon product
  // shot of unknown, usually square, dimensions, so claiming 1200x630 for it makes
  // every social preview crop wrong. Declare the size only when we know it.
  const ogImage = image ? (image.startsWith("http") ? image : `${SITE_URL}${image}`) : `${SITE_URL}/og-default.png`;
  const ogImageEntry = image ? { url: ogImage, alt: fullTitle } : { url: ogImage, width: 1200, height: 630, alt: fullTitle };
  return {
    title: { absolute: fullTitle },
    description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: canonical || SITE_URL },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical || SITE_URL,
      siteName: SITE_NAME,
      images: [ogImageEntry],
      type,
      locale: "en_US",
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [ogImage] },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  };
}

export { SITE_NAME, SITE_URL, SITE_DESCRIPTION };
