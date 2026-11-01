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
  telegram?: string;
  icon: string;
  category: CategoryId;
  reason: string;
  line: string;
  started: string;
  /** Domain registration date (ISO string YYYY-MM-DD) */
  registeredDate?: string;
  /** Whether the site hosts its own streams or scrapes / embeds external hosts */
  hostingType?: "self-hosted" | "scraper";
  /** Approximate catalog size / titles available */
  catalogSize?: {
    value: string;
    sub: string;
  };
  /** Ad Experience: Zero Ads, Banners Only, Popups / Redirects */
  adExperience?: {
    value: string;
    sub: string;
    level: "zero-ads" | "banners-only" | "popups";
  };
  /** Subtitle playback specs (Softsubs vs Hardsubs) */
  subtitles?: {
    value: string;
    sub: string;
  };
  /** Audio specs (Sub & Dub dual-audio vs Sub-only) */
  audio?: {
    value: string;
    sub: string;
  };
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
  { id: "japanese", label: "Anime Streaming", empty: "nothing yet." },
];

/** Fallback seed list when Supabase is unavailable. */
export const SEED_SITES: Site[] = [
  {
    slug: "anipm",
    name: "ani.pm",
    domain: "ani.pm",
    href: "https://ani.pm",
    discord: "https://discord.gg/anipm",
    icon: "/sites/anipm.png",
    category: "japanese",
    reason: "stream + tracking",
    line: "Stream thousands of anime series and movies in HD — subbed & dubbed, resume anywhere, and sync with AniList & MAL.",
    started: "2026",
    registeredDate: "2026-05-16",
    hostingType: "self-hosted",
    catalogSize: {
      value: "~9,500 titles",
      sub: "Subbed & dubbed streaming catalog",
    },
    adExperience: {
      value: "Popunders",
      sub: "Adcash popunder on interaction (zone 12291522)",
      level: "popups",
    },
    subtitles: {
      value: "Softsubs",
      sub: "Styled ASS / multi-language",
    },
    audio: {
      value: "Sub & Dub",
      sub: "Dual-audio (Japanese & English dubs)",
    },
    featureList: [
      "HD sub & dub",
      "Fast streaming",
      "AniList & MAL sync",
      "Large catalog",
    ],
    seed: { ui: 97, ux: 95, catalog: 97, features: 94 },
  },
  {
    slug: "animex",
    name: "AnimeX",
    domain: "animex.one",
    href: "https://animex.one",
    discord: "https://discord.gg/animex",
    icon: "/sites/animex.png",
    category: "japanese",
    reason: "stream + discover",
    line: "Are you tired from 9anime, hianime, gogoanime, animepahe, animixplay, miruro, animekai and aniwave? Discover the best anime streaming experience on AnimeX. Watch free anime online in HD with English subtitles and dubs.",
    started: "2025",
    registeredDate: "2025-08-29",
    hostingType: "self-hosted",
    catalogSize: {
      value: "~8,800 titles",
      sub: "Streamable series & movies",
    },
    adExperience: {
      value: "Popunders",
      sub: "Adcash popunder on first click (zone 11269774)",
      level: "popups",
    },
    subtitles: {
      value: "Softsubs",
      sub: "Styled ASS / multi-language",
    },
    audio: {
      value: "Sub & Dub",
      sub: "Dual-audio (Japanese & English dubs)",
    },
    featureList: [
      "HD sub & dub",
      "Watch together",
      "AniList sync",
      "Softsubs",
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
    line: "A premium anime discovery platform. Browse trending, seasonal, and top-rated anime with cinematic visuals.",
    started: "2024",
    registeredDate: "2026-05-29",
    hostingType: "self-hosted",
    catalogSize: {
      value: "~4,500 titles",
      sub: "Curated trending & seasonal titles",
    },
    adExperience: {
      value: "Zero Ads",
      sub: "Direct stream, no popups",
      level: "zero-ads",
    },
    subtitles: {
      value: "Softsubs",
      sub: "Multiple subtitle styles",
    },
    audio: {
      value: "Sub & Dub",
      sub: "Subbed & dubbed options",
    },
    featureList: [
      "Premium discovery",
      "Trending & seasonal",
      "Top rated catalogs",
      "Cinematic visuals",
    ],
    seed: { ui: 96, ux: 94, catalog: 82, features: 68 },
  },
  {
    slug: "anikura",
    name: "Anikura",
    domain: "anikura.club",
    href: "https://anikura.club",
    discord: "https://discord.gg/cm72gXTASn",
    telegram: "https://t.me/anikuraclub",
    icon: "/sites/anikura.png",
    category: "japanese",
    reason: "shelves + social",
    line: "Every anime in one place, free. Search thousands of shows, catch this season's simulcasts as they air, and keep your lists, schedule and history in My Anikura.",
    started: "2026",
    registeredDate: "2026-07-21",
    hostingType: "self-hosted",
    catalogSize: {
      value: "9,100+ titles",
      sub: "Series & films library",
    },
    adExperience: {
      value: "Popunders & Vignettes",
      sub: "Monetag popunder (al5sm) & vignette on watch routes",
      level: "popups",
    },
    subtitles: {
      value: "Softsubs",
      sub: "Styled ASS / selectable tracks",
    },
    audio: {
      value: "Sub & Dub",
      sub: "Dual-audio (Japanese & English dubs)",
    },
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
    discord: "https://discord.gg/VPNSMcG6jM",
    icon: "/sites/yumezone.png",
    category: "japanese",
    reason: "anime + manga",
    line: "Watch anime online for free on YumeZone. Stream thousands of series in HD with sub & dub. Sync and track your watchlist with AniList & MAL.",
    started: "2025",
    registeredDate: "2026-06-01",
    hostingType: "scraper",
    catalogSize: {
      value: "~6,800 titles",
      sub: "Anime titles + manga library",
    },
    adExperience: {
      value: "Player Embed Ads",
      sub: "3rd-party scraper player popups & redirects",
      level: "popups",
    },
    subtitles: {
      value: "Softsubs",
      sub: "Styled multi-language subs",
    },
    audio: {
      value: "Sub & Dub",
      sub: "Dual-audio streams",
    },
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
    discord: "https://discord.gg/6yeG3G654x",
    icon: "/sites/nekowatch.png",
    category: "japanese",
    reason: "tracks your addiction",
    line: "Track and discover anime on NekoWatch.",
    started: "2024",
    registeredDate: "2026-06-19",
    hostingType: "scraper",
    catalogSize: {
      value: "~5,200 titles",
      sub: "Indexed & tracked anime titles",
    },
    adExperience: {
      value: "Periodic Ad Injections",
      sub: "Cloudfront ad script re-injected every 2–5 min",
      level: "popups",
    },
    subtitles: {
      value: "Hardsubs",
      sub: "Burned-in subtitle stream",
    },
    audio: {
      value: "Sub-only",
      sub: "Japanese audio with English subs",
    },
    featureList: [
      "Track what you watch",
      "Discover new shows",
      "Soft glass UI",
      "Sticky watchlist",
    ],
    seed: { ui: 91, ux: 86, catalog: 74, features: 80 },
  },
];

export function getDomainAge(registeredDate?: string): { age: string; date: string } | null {
  if (!registeredDate) return null;
  const reg = new Date(registeredDate);
  const now = new Date();

  const diffMs = Math.max(0, now.getTime() - reg.getTime());
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30.4375);
  const diffYears = Math.floor(diffDays / 365.25);

  let age = "";
  if (diffYears >= 1) {
    const remMonths = diffMonths % 12;
    age = remMonths > 0 ? `${diffYears}y ${remMonths}m ago` : `${diffYears} yr${diffYears > 1 ? "s" : ""} ago`;
  } else if (diffMonths >= 1) {
    age = `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
  } else if (diffDays >= 1) {
    age = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  } else {
    age = "recently";
  }

  const dateFormatted = reg.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return { age, date: dateFormatted };
}

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
