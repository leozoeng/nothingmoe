export type CategoryId = "japanese";

export type Scores = {
  ui: number;
  ux: number;
  catalog: number;
  features: number;
};

export type Site = {
  slug: string;
  name: string;
  domain: string;
  href: string;
  discord?: string;
  icon: string;
  category: CategoryId;
  reason: string;
  line: string;
  started: string;
  pros: string[];
  cons: string[];
  /** Seed scores shown until community reviews exist */
  seed: Scores;
  /** Owner-customized banner image URL */
  banner?: string | null;
  /** Owner-written long description */
  description?: string | null;
};

export const categoryMeta: { id: CategoryId; label: string; empty: string }[] = [
  { id: "japanese", label: "World Ranking", empty: "nothing yet." },
];

export const sites: Site[] = [
  {
    slug: "anilight",
    name: "AniLight",
    domain: "anilight.live",
    href: "https://anilight.live",
    discord: "https://discord.gg/RFN93sMwdW",
    icon: "/sites/anilight.png",
    category: "japanese",
    reason: "cinematic discovery",
    line: "Premium anime discovery — trending, seasonal, and top rated with cinematic visuals.",
    started: "2024",
    pros: [
      "Premium discovery platform",
      "Trending & seasonal picks",
      "Top rated catalogs",
      "Cinematic visuals",
    ],
    cons: ["Depends on scraped sources"],
    seed: { ui: 96, ux: 94, catalog: 82, features: 68 },
  },
  {
    slug: "luna",
    name: "Luna",
    domain: "luna-stream.me",
    href: "https://luna-stream.me",
    icon: "/sites/lunastream.png",
    category: "japanese",
    reason: "sync and stream",
    line: "Watch anime in HD — subs, dubs, new episodes as they air, with AniList sync so the watchlist follows you.",
    started: "2025",
    pros: [
      "HD sub & dub",
      "New episodes as they air",
      "AniList watchlist sync",
      "Movies, OVAs, full seasons",
    ],
    cons: ["No community hub yet"],
    seed: { ui: 89, ux: 87, catalog: 93, features: 66 },
  },
  {
    slug: "anikura",
    name: "Anikura",
    domain: "anikura.club",
    href: "https://anikura.club",
    discord: "https://discord.gg/cm72gXTASn",
    icon: "/sites/anikura.png",
    category: "japanese",
    reason: "shelves + social",
    line: "Watch and discover anime — seasonal picks, curated catalogs, genres, and watch together.",
    started: "2026",
    pros: [
      "Large catalog",
      "Curated catalogs",
      "YouTube-style UI",
      "Complex social system",
    ],
    cons: ["Heavier first load"],
    seed: { ui: 93, ux: 78, catalog: 90, features: 95 },
    banner: "/sites/anikura-banner.png",
  },
  {
    slug: "nekowatch",
    name: "NekoWatch",
    domain: "nekowatch.xyz",
    href: "https://nekowatch.xyz",
    discord: "https://discord.com/invite/6yeG3G654x",
    icon: "/sites/nekowatch.png",
    category: "japanese",
    reason: "tracks your addiction",
    line: "Track and discover anime on NekoWatch.",
    started: "2024",
    pros: [
      "Track what you watch",
      "Discover new shows",
      "Soft glass UI",
      "Watchlist that sticks",
    ],
    cons: ["Still growing the catalog"],
    seed: { ui: 91, ux: 86, catalog: 74, features: 80 },
  },
];

export const VALID_DOMAINS = sites.map((site) => site.domain);

export function sitesByCategory() {
  return categoryMeta.map((category) => ({
    ...category,
    items: sites.filter((site) => site.category === category.id),
  }));
}

export function siteByDomain(domain: string) {
  return sites.find((site) => site.domain === domain);
}

export function siteBySlug(slug: string) {
  return sites.find((site) => site.slug === slug);
}
