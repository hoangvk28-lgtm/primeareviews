export interface PrimeaProduct {
  id: string;
  rank: number;
  award: string; // e.g. "Best Overall", "Best Value"
  name: string;
  score: number; // Primea Score, 0-100
  imageUrl: string;
  amazonUrl: string;
  verdict: string; // one-line verdict shown in the scoreboard
  description: string; // 2-3 paragraphs split by \n\n
  keySpecs: { label: string; value: string }[];
  pros: string[];
  cons: string[];
  idealFor: string;
  skipIf: string;
  // Internal only. Never rendered (stale prices / Amazon terms).
  price?: string;
}

export interface ChooseSection {
  subheading: string;
  intro?: string;
  table?: { headers: string[]; rows: string[][] };
  cards?: { label: string; text: string }[];
  note?: string;
}

export interface PrimeaGuide {
  slug: string;
  category: string; // category slug from data/categories.ts
  h1: string;
  metaTitle: string; // <= 51 chars; " | Primea" is appended
  metaDescription: string; // 120-160 chars
  mainKeyword: string;
  publishedAt: string;
  updatedAt: string;
  readTime: string;
  heroImage: string;
  summary: string; // "The short answer" box
  intro: string[];
  products: PrimeaProduct[];
  methodology: { title: string; description: string }[];
  whatMatters: { factor: string; detail: string }[];
  howToChoose: ChooseSection[];
  faq: { q: string; a: string }[];
  finalTake: string;
  related: string[]; // slugs
}
