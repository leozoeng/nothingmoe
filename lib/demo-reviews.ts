import type { SessionUser } from "./auth-server";
import { computeStats, type Review } from "./scores";

export const DEMO_USER: SessionUser = {
  id: "demo-user-nightowl",
  email: "nightowl@nothingmoe.demo",
  profile: {
    id: "demo-user-nightowl",
    username: "nightowl",
    display_name: "nightowl",
    banned_at: null,
    banned_reason: null,
  },
  ownedSites: [],
};

const ANIKURA_DEMO_REVIEWS: Review[] = [
  {
    id: "demo-r1",
    site_domain: "anikura.club",
    user_id: "demo-u1",
    author: "sakura_flow",
    authorUsername: "sakura_flow",
    stars: 5,
    score_ui: 96,
    score_ux: 82,
    score_catalog: 94,
    score_features: 97,
    body: "The seasonal page alone is worth it. Curated shelves feel like someone actually watches anime instead of dumping metadata. UI is insanely clean for how much is going on.",
    created_at: "2026-02-14T18:20:00.000Z",
    response: {
      id: "demo-resp1",
      body: "Appreciate this — seasonal curation is something we tweak every quarter. First-load weight is on the roadmap too.",
      created_at: "2026-02-15T09:10:00.000Z",
      updated_at: "2026-02-15T09:10:00.000Z",
    },
  },
  {
    id: "demo-r2",
    site_domain: "anikura.club",
    user_id: "demo-u2",
    author: "bingeLord",
    authorUsername: "bingeLord",
    stars: 4,
    score_ui: 91,
    score_ux: 71,
    score_catalog: 88,
    score_features: 90,
    body: "Catalog depth is real and the player gets out of the way. Took a beat to warm up on first visit though — after that it flies.",
    created_at: "2026-01-28T14:05:00.000Z",
    response: null,
  },
  {
    id: "demo-r3",
    site_domain: "anikura.club",
    user_id: "demo-u3",
    author: "catalog_queen",
    authorUsername: "catalog_queen",
    stars: 5,
    score_ui: 94,
    score_ux: 80,
    score_catalog: 96,
    score_features: 93,
    body: "Genre hubs + curated lists make discovery feel intentional. Hard to go back to flat grids after this.",
    created_at: "2026-01-09T21:40:00.000Z",
    response: null,
  },
  {
    id: "demo-r5",
    site_domain: "anikura.club",
    user_id: "demo-u4",
    author: "neonweeb",
    authorUsername: "neonweeb",
    stars: 3,
    score_ui: 88,
    score_ux: 68,
    score_catalog: 85,
    score_features: 88,
    body: "Feature-rich to a fault early on. Once you learn where lists, rooms, and profiles live it's great — just not instant.",
    created_at: "2025-12-02T11:30:00.000Z",
    response: {
      id: "demo-resp2",
      body: "Fair take. We're shipping a tighter onboarding path for watch-together and profile stuff next.",
      created_at: "2025-12-03T08:00:00.000Z",
      updated_at: "2025-12-03T08:00:00.000Z",
    },
  },
  {
    id: "demo-r6",
    site_domain: "anikura.club",
    user_id: "demo-u5",
    author: "streamer_x",
    authorUsername: "streamer_x",
    stars: 4,
    score_ui: 90,
    score_ux: 79,
    score_catalog: 87,
    score_features: 98,
    body: "Watch together is the killer feature. Sync is solid, chat is unobtrusive, and the catalog holds up for group nights.",
    created_at: "2025-11-18T19:55:00.000Z",
    response: null,
  },
];

export function isDemoModeActive(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("demo") === "1";
}

export function getAnikuraDemoReviews() {
  const reviews = ANIKURA_DEMO_REVIEWS;
  const stats = computeStats(reviews);

  return { reviews, userReview: null, stats };
}
