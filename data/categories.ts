export interface Category { slug: string; name: string; blurb: string }

export const categories: Category[] = [
  { slug: "home-office", name: "Home Office", blurb: "Desks, chairs, stands and the gear that makes long work days easier." },
  { slug: "tech-accessories", name: "Tech & Accessories", blurb: "Docks, chargers, keyboards, and the small upgrades that fix daily friction." },
  { slug: "home-living", name: "Home & Living", blurb: "Furniture, storage and comfort picks for real homes, small or large." },
  { slug: "kitchen", name: "Kitchen", blurb: "Appliances and tools ranked on how they cook, clean up and fit your counter." },
  { slug: "outdoor-garden", name: "Outdoor & Garden", blurb: "Yard, patio and garden equipment scored for power, durability and storage." },
  { slug: "health-mobility", name: "Health & Mobility", blurb: "Mobility aids, comfort and daily-living products, ranked on safety and fit." },
  { slug: "seasonal", name: "Seasonal", blurb: "Holiday, heating, cooling and seasonal gear, ranked before you need it." },
];

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
