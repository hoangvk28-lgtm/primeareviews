import { SITE_URL } from "./site";

// One source of truth for the byline, the author page and the Person schema on every
// guide. Changing a field here changes all three.
export const AUTHOR = {
  name: "Joshua Parkes",
  slug: "joshua-parkes",
  role: "Editor in Chief",
  image: "/images/joshua-parkes.jpg",
  avatar: "/images/joshua-parkes-192.jpg",
  url: `${SITE_URL}/author/joshua-parkes`,
  short:
    "Joshua Parkes is the editor in chief of Primea Reviews. He owns the Primea Score framework and signs off on every ranking the site publishes.",
} as const;
