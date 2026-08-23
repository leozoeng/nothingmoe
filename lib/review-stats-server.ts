import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseConfigured } from "./supabase/client";
import { computeStats, type ReviewStats } from "./scores";

type ReviewRow = {
  site_domain: string;
  stars: number;
  score_ui: number;
  score_ux: number;
  score_catalog: number;
  score_features: number;
};

function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export async function fetchAllSiteReviewStats(): Promise<Record<string, ReviewStats>> {
  if (!supabaseConfigured()) return {};

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("nothingmoe_reviews")
    .select("site_domain, stars, score_ui, score_ux, score_catalog, score_features");

  if (error) throw new Error(error.message);

  const grouped = new Map<string, ReviewRow[]>();
  for (const row of (data ?? []) as ReviewRow[]) {
    const list = grouped.get(row.site_domain) ?? [];
    list.push(row);
    grouped.set(row.site_domain, list);
  }

  const stats: Record<string, ReviewStats> = {};
  for (const [domain, rows] of grouped) {
    stats[domain] = computeStats(
      rows.map((row) => ({
        id: "",
        site_domain: domain,
        user_id: null,
        author: "",
        authorUsername: null,
        authorAvatarUrl: null,
        stars: row.stars,
        score_ui: row.score_ui,
        score_ux: row.score_ux,
        score_catalog: row.score_catalog,
        score_features: row.score_features,
        body: "",
        created_at: "",
        response: null,
      })),
    );
  }

  return stats;
}
