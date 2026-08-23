import {
  computeStats,
  type Review,
  type ReviewPayload,
  type ReviewStats,
} from "./scores";
import { createClient } from "./supabase/server";
import { supabaseConfigured } from "./supabase/client";
import { adminConfigured, createAdminClient } from "./supabase/admin";
import { VALID_DOMAINS } from "./sites";

type RawReview = {
  id: string;
  site_domain: string;
  user_id: string | null;
  stars: number;
  score_ui: number;
  score_ux: number;
  score_catalog: number;
  score_features: number;
  body: string;
  created_at: string;
  nothingmoe_profiles:
    | { display_name: string; username: string }
    | { display_name: string; username: string }[]
    | null;
  nothingmoe_review_responses:
    | { id: string; body: string; created_at: string; updated_at: string }
    | { id: string; body: string; created_at: string; updated_at: string }[]
    | null;
};

function firstOrSelf<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapReview(row: RawReview, currentUserId?: string | null): Review {
  const profile = firstOrSelf(row.nothingmoe_profiles);
  const response = firstOrSelf(row.nothingmoe_review_responses);

  return {
    id: row.id,
    site_domain: row.site_domain,
    user_id: row.user_id,
    author: profile?.display_name ?? "anonymous",
    stars: row.stars,
    score_ui: row.score_ui,
    score_ux: row.score_ux,
    score_catalog: row.score_catalog,
    score_features: row.score_features,
    body: row.body,
    created_at: row.created_at,
    response: response
      ? {
          id: response.id,
          body: response.body,
          created_at: response.created_at,
          updated_at: response.updated_at,
        }
      : null,
    isOwn: currentUserId ? row.user_id === currentUserId : false,
  };
}

export async function fetchReviews(
  domain: string,
  currentUserId?: string | null,
): Promise<{
  reviews: Review[];
  stats: ReviewStats;
  userReview: Review | null;
}> {
  if (!VALID_DOMAINS.includes(domain) || !supabaseConfigured()) {
    return { reviews: [], stats: computeStats([]), userReview: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("nothingmoe_reviews")
    .select(
      "id, site_domain, user_id, stars, score_ui, score_ux, score_catalog, score_features, body, created_at, nothingmoe_profiles(display_name, username), nothingmoe_review_responses(id, body, created_at, updated_at)",
    )
    .eq("site_domain", domain)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);

  const reviews = ((data ?? []) as RawReview[]).map((row) => mapReview(row, currentUserId));
  let userReview = reviews.find((review) => review.isOwn) ?? null;

  if (currentUserId && !userReview) {
    const { data: ownRow, error: ownError } = await supabase
      .from("nothingmoe_reviews")
      .select(
        "id, site_domain, user_id, stars, score_ui, score_ux, score_catalog, score_features, body, created_at, nothingmoe_profiles(display_name, username), nothingmoe_review_responses(id, body, created_at, updated_at)",
      )
      .eq("site_domain", domain)
      .eq("user_id", currentUserId)
      .maybeSingle();

    if (ownError) throw new Error(ownError.message);
    if (ownRow) {
      userReview = mapReview(ownRow as RawReview, currentUserId);
    }
  }

  return {
    reviews,
    stats: computeStats(reviews),
    userReview,
  };
}

export class ReviewConflictError extends Error {
  constructor(message = "You already have a review for this site. Refresh and update it instead.") {
    super(message);
    this.name = "ReviewConflictError";
  }
}

export async function submitReview(
  domain: string,
  userId: string,
  payload: ReviewPayload,
): Promise<{ created: boolean }> {
  if (!VALID_DOMAINS.includes(domain)) {
    throw new Error("Invalid site");
  }

  if (!supabaseConfigured()) {
    throw new Error("Reviews are not configured yet");
  }

  const supabase = await createClient();
  const row = {
    stars: payload.stars,
    score_ui: payload.score_ui,
    score_ux: payload.score_ux,
    score_catalog: payload.score_catalog,
    score_features: payload.score_features,
    body: payload.body.trim(),
  };

  const { data: existing, error: lookupError } = await supabase
    .from("nothingmoe_reviews")
    .select("id")
    .eq("site_domain", domain)
    .eq("user_id", userId)
    .maybeSingle();

  if (lookupError) throw new Error(lookupError.message);

  if (existing?.id) {
    const { error } = await supabase
      .from("nothingmoe_reviews")
      .update(row)
      .eq("id", existing.id)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
    return { created: false };
  }

  const { error } = await supabase.from("nothingmoe_reviews").insert({
    site_domain: domain,
    user_id: userId,
    ...row,
  });

  if (error) {
    if (error.code === "23505") {
      throw new ReviewConflictError();
    }
    throw new Error(error.message);
  }

  return { created: true };
}

export async function submitReviewResponse(reviewId: string, userId: string, body: string) {
  const supabase = await createClient();
  const text = body.trim();

  if (text.length < 1 || text.length > 2000) {
    throw new Error("Invalid response length");
  }

  const { error } = await supabase.from("nothingmoe_review_responses").upsert(
    {
      review_id: reviewId,
      user_id: userId,
      body: text,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "review_id" },
  );

  if (error) throw new Error(error.message);
}

/** Moderator delete — uses service role so it can remove any review. */
export async function deleteReviewAsModerator(reviewId: string, domain: string) {
  if (!VALID_DOMAINS.includes(domain)) {
    throw new Error("Invalid site");
  }

  if (!adminConfigured()) {
    throw new Error("Admin client is not configured");
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("nothingmoe_reviews")
    .delete()
    .eq("id", reviewId)
    .eq("site_domain", domain)
    .select("id")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Review not found");
}
