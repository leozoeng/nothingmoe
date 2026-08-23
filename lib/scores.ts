import type { Scores } from "./sites";

export type { Scores };

export const SCORE_LABELS: { key: keyof Scores; label: string }[] = [
  { key: "ui", label: "ui" },
  { key: "ux", label: "ux" },
  { key: "catalog", label: "catalog" },
  { key: "features", label: "features" },
];

export type ReviewStats = {
  count: number;
  avgStars: number | null;
  avgScores: Scores | null;
};

export type ReviewResponse = {
  id: string;
  body: string;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: string;
  site_domain: string;
  user_id: string | null;
  author: string;
  authorUsername: string | null;
  stars: number;
  score_ui: number;
  score_ux: number;
  score_catalog: number;
  score_features: number;
  body: string;
  created_at: string;
  response: ReviewResponse | null;
  isOwn?: boolean;
};

export const REVIEW_BODY_MIN = 3;
export const REVIEW_BODY_MAX = 2000;

export type ReviewPayload = {
  stars: number;
  score_ui: number;
  score_ux: number;
  score_catalog: number;
  score_features: number;
  body: string;
};

export function parseReviewPayload(body: unknown): ReviewPayload | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Invalid review data" };
  }

  const data = body as Record<string, unknown>;
  const stars = Number(data.stars);
  const score_ui = Math.round(Number(data.score_ui));
  const score_ux = Math.round(Number(data.score_ux));
  const score_catalog = Math.round(Number(data.score_catalog));
  const score_features = Math.round(Number(data.score_features));
  const text = typeof data.body === "string" ? data.body.trim() : "";

  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return { error: "Pick a star rating from 1 to 5" };
  }

  const scores = [score_ui, score_ux, score_catalog, score_features];
  if (!scores.every((n) => Number.isFinite(n) && n >= 1 && n <= 100)) {
    return { error: "Scores must be between 1 and 100" };
  }

  if (text.length < REVIEW_BODY_MIN) {
    return { error: `Review needs at least ${REVIEW_BODY_MIN} characters` };
  }

  if (text.length > REVIEW_BODY_MAX) {
    return { error: `Review must be under ${REVIEW_BODY_MAX} characters` };
  }

  return {
    stars,
    score_ui,
    score_ux,
    score_catalog,
    score_features,
    body: text,
  };
}

export function reviewToScores(review: Review): Scores {
  return {
    ui: review.score_ui,
    ux: review.score_ux,
    catalog: review.score_catalog,
    features: review.score_features,
  };
}

export function computeStats(reviews: Review[]): ReviewStats {
  if (reviews.length === 0) {
    return { count: 0, avgStars: null, avgScores: null };
  }

  const sum = reviews.reduce(
    (acc, review) => ({
      stars: acc.stars + review.stars,
      ui: acc.ui + review.score_ui,
      ux: acc.ux + review.score_ux,
      catalog: acc.catalog + review.score_catalog,
      features: acc.features + review.score_features,
    }),
    { stars: 0, ui: 0, ux: 0, catalog: 0, features: 0 },
  );

  const count = reviews.length;
  const round = (n: number) => Math.round(n * 10) / 10;

  return {
    count,
    avgStars: round(sum.stars / count),
    avgScores: {
      ui: Math.round(sum.ui / count),
      ux: Math.round(sum.ux / count),
      catalog: Math.round(sum.catalog / count),
      features: Math.round(sum.features / count),
    },
  };
}

export const EMPTY_SCORES: Scores = {
  ui: 0,
  ux: 0,
  catalog: 0,
  features: 0,
};

export function mergeScores(_seed: Scores, stats: ReviewStats): Scores {
  return stats.avgScores ?? EMPTY_SCORES;
}

export function formatStars(value: number | null) {
  if (value === null) return "—";
  return value.toFixed(1);
}

export type ScoreTier = "high" | "mid" | "low";

export function scoreTier(value: number): ScoreTier {
  if (value > 78) return "high";
  if (value >= 50) return "mid";
  return "low";
}

export function scoreColors(value: number) {
  if (value <= 0) {
    return {
      fill: "linear-gradient(90deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.28))",
      glow: "rgba(255, 255, 255, 0.08)",
      ring: "rgba(255, 255, 255, 0.22)",
      text: "rgba(244, 244, 244, 0.38)",
    };
  }

  switch (scoreTier(value)) {
    case "high":
      return {
        fill: "linear-gradient(90deg, #2fbf78 0%, #7dffb3 100%)",
        glow: "rgba(72, 220, 140, 0.5)",
        ring: "#4ade80",
        text: "#86efac",
      };
    case "mid":
      return {
        fill: "linear-gradient(90deg, #d4920a 0%, #fde047 100%)",
        glow: "rgba(251, 191, 36, 0.45)",
        ring: "#fbbf24",
        text: "#fcd34d",
      };
    case "low":
      return {
        fill: "linear-gradient(90deg, #ea580c 0%, #fb7185 100%)",
        glow: "rgba(251, 113, 133, 0.45)",
        ring: "#fb923c",
        text: "#fda4af",
      };
  }
}
