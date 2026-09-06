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
  /** Short owner-defined trait chips (max 8) */
  featureList: string[];
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

/** Fallback seed list when Supabase is unavailable. */
export const SEED_SITES: Site[] = [
  {
    slug: "animex",
    name: "AnimeX",
    domain: "animex.one",
    href: "https://animex.one",
    icon: "/sites/animex.png",
    category: "japanese",
    reason: "stream + discover",
    line: "HD anime with subs & dubs — watch together, AniList sync, and a huge catalog.",
    started: "2025",
    featureList: [
      "HD sub & dub",
      "Watch together",
      "AniList sync",
      "No ads",
    ],
    seed: { ui: 95, ux: 93, catalog: 96, features: 92 },
  },
  {
    slug: "anilight",
    name: "AniLight",
    domain: "anilight.live",
    href: "https://anilight.live",
    discord: "https://discord.gg/RFN93sMwdW",
    icon: "/sites/anilight.png",
    category: "japanese",
    reason: "cinematic discovery",
    line: "Premium anime discovery — trending, seasonal, and top rated.",
    started: "2024",
    featureList: [
      "Premium discovery",
      "Trending & seasonal",
      "Top rated catalogs",
      "Cinematic visuals",
    ],
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
    line: "HD anime with subs, dubs, and AniList sync that follows you.",
    started: "2025",
    featureList: [
      "HD sub & dub",
      "New episodes as they air",
      "AniList watchlist sync",
      "Movies, OVAs, seasons",
    ],
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
    line: "Watch and discover anime — seasonal picks, catalogs, watch together.",
    started: "2026",
    featureList: [
      "Large catalog",
      "Curated catalogs",
      "YouTube-style UI",
      "Social watch rooms",
    ],
    seed: { ui: 93, ux: 78, catalog: 90, features: 95 },
    banner: "/sites/anikura-banner.png",
  },
  {
    slug: "yumezone",
    name: "YumeZone",
    domain: "yumezone.live",
    href: "https://yumezone.live/home",
    icon: "/sites/yumezone.png",
    category: "japanese",
    reason: "anime + manga",
    line: "Stream anime and read manga in one place — HD watches, seasonal picks, and ongoing series.",
    started: "2025",
    featureList: [
      "Anime streaming",
      "Manga library",
      "Seasonal spotlight",
      "HD playback",
    ],
    seed: { ui: 88, ux: 84, catalog: 91, features: 79 },
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
    featureList: [
      "Track what you watch",
      "Discover new shows",
      "Soft glass UI",
      "Sticky watchlist",
    ],
    seed: { ui: 91, ux: 86, catalog: 74, features: 80 },
  },
];

/** @deprecated Prefer fetchAllSites() from lib/sites-server. */
export const sites = SEED_SITES;

/** @deprecated Prefer fetchValidDomains() from lib/sites-server. */
export const VALID_DOMAINS = SEED_SITES.map((site) => site.domain);

export function sitesByCategory() {
  return categoryMeta.map((category) => ({
    ...category,
    items: SEED_SITES.filter((site) => site.category === category.id),
  }));
}

export function siteByDomain(domain: string) {
  return SEED_SITES.find((site) => site.domain === domain);
}

export function siteBySlug(slug: string) {
  return SEED_SITES.find((site) => site.slug === slug);
}
