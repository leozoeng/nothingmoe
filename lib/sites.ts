export type Kind = "anime" | "movie" | "other";

export type Site = {
  name: string;
  domain: string;
  href: string;
  kind: Kind;
  jp: string;
  line: string;
};

export const kinds: Record<Kind, { label: string; jp: string }> = {
  anime: { label: "anime", jp: "アニメ" },
  movie: { label: "cinema", jp: "映画" },
  other: { label: "other", jp: "他" },
};

export const sites: Site[] = [
  {
    name: "Anikura",
    domain: "anikura.club",
    href: "https://anikura.club",
    kind: "anime",
    jp: "蔵",
    line: "Watch and discover anime.",
  },
  {
    name: "AniLight",
    domain: "anilight.live",
    href: "https://anilight.live",
    kind: "anime",
    jp: "光",
    line: "Discover anime, faster.",
  },
  {
    name: "NekoWatch",
    domain: "nekowatch.xyz",
    href: "https://nekowatch.xyz",
    kind: "anime",
    jp: "猫",
    line: "Watch, continue, keep a list.",
  },
];
