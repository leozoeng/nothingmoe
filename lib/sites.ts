export type CategoryId = "japanese";

export type Vibe = {
  ui: number;
  speed: number;
  catalog: number;
  social: number;
};

export type Site = {
  name: string;
  domain: string;
  href: string;
  discord?: string;
  icon: string;
  category: CategoryId;
  reason: string;
  line: string;
  pros: string[];
  cons: string[];
  vibe: Vibe;
};

export const categoryMeta: { id: CategoryId; label: string; empty: string }[] = [
  { id: "japanese", label: "World Ranking", empty: "nothing yet." },
];

export const sites: Site[] = [
  {
    name: "AniLight",
    domain: "anilight.live",
    href: "https://anilight.live",
    discord: "https://discord.gg/RFN93sMwdW",
    icon: "/sites/anilight.png",
    category: "japanese",
    reason: "cinematic discovery",
    line: "Premium anime discovery — trending, seasonal, and top rated with cinematic visuals.",
    pros: [
      "Premium discovery platform",
      "Trending & seasonal picks",
      "Top rated catalogs",
      "Cinematic visuals",
    ],
    cons: ["Depends on scraped sources"],
    vibe: { ui: 96, speed: 94, catalog: 82, social: 68 },
  },
  {
    name: "Luna",
    domain: "luna-stream.me",
    href: "https://luna-stream.me",
    icon: "/sites/lunastream.png",
    category: "japanese",
    reason: "sync and stream",
    line: "Watch anime in HD — subs, dubs, new episodes as they air, with AniList sync so the watchlist follows you.",
    pros: [
      "HD sub & dub",
      "New episodes as they air",
      "AniList watchlist sync",
      "Movies, OVAs, full seasons",
    ],
    cons: ["No community hub yet"],
    vibe: { ui: 89, speed: 87, catalog: 93, social: 66 },
  },
  {
    name: "Anikura",
    domain: "anikura.club",
    href: "https://anikura.club",
    discord: "https://discord.gg/cm72gXTASn",
    icon: "/sites/anikura.png",
    category: "japanese",
    reason: "shelves + social",
    line: "Watch and discover anime — seasonal picks, curated catalogs, genres, and watch together.",
    pros: [
      "Large catalog",
      "Curated catalogs",
      "YouTube-style UI",
      "Complex social system",
    ],
    cons: ["Heavier first load"],
    vibe: { ui: 93, speed: 78, catalog: 90, social: 95 },
  },
  {
    name: "NekoWatch",
    domain: "nekowatch.xyz",
    href: "https://nekowatch.xyz",
    discord: "https://discord.com/invite/6yeG3G654x",
    icon: "/sites/nekowatch.png",
    category: "japanese",
    reason: "tracks your addiction",
    line: "Track and discover anime on NekoWatch.",
    pros: [
      "Track what you watch",
      "Discover new shows",
      "Soft glass UI",
      "Watchlist that sticks",
    ],
    cons: ["Still growing the catalog"],
    vibe: { ui: 91, speed: 86, catalog: 74, social: 80 },
  },
];

export function sitesByCategory() {
  return categoryMeta.map((category) => ({
    ...category,
    items: sites.filter((site) => site.category === category.id),
  }));
}

export function siteByDomain(domain: string) {
  return sites.find((site) => site.domain === domain);
}
