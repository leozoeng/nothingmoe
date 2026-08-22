import type { Site } from "./sites";
import { createClient } from "./supabase/server";
import { supabaseConfigured } from "./supabase/client";

export type SitePageOverride = {
  site_domain: string;
  line: string | null;
  started: string | null;
  pros: string[] | null;
  cons: string[] | null;
  banner_url: string | null;
  description: string | null;
  updated_at: string;
};

export function mergeSiteWithPage(site: Site, page: SitePageOverride | null): Site {
  if (!page) return site;

  return {
    ...site,
    line: page.line?.trim() || site.line,
    started: page.started?.trim() || site.started,
    pros: page.pros?.length ? page.pros : site.pros,
    cons: page.cons?.length ? page.cons : site.cons,
    banner: page.banner_url?.trim() || site.banner || null,
    description: page.description?.trim() || site.description || null,
  };
}

export async function fetchSitePage(domain: string): Promise<SitePageOverride | null> {
  if (!supabaseConfigured()) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("nothingmoe_site_pages")
    .select("site_domain, line, started, pros, cons, banner_url, description, updated_at")
    .eq("site_domain", domain)
    .maybeSingle();

  return data;
}

export type SitePagePayload = {
  line?: string;
  started?: string;
  pros?: string[];
  cons?: string[];
  banner_url?: string | null;
  description?: string;
};

export async function upsertSitePage(
  domain: string,
  userId: string,
  payload: SitePagePayload,
): Promise<SitePageOverride> {
  const supabase = await createClient();
  const row = {
    site_domain: domain,
    line: payload.line?.trim() || null,
    started: payload.started?.trim() || null,
    pros: payload.pros?.filter(Boolean) ?? null,
    cons: payload.cons?.filter(Boolean) ?? null,
    banner_url: payload.banner_url?.trim() || null,
    description: payload.description?.trim() || null,
    updated_at: new Date().toISOString(),
    updated_by: userId,
  };

  const { data, error } = await supabase
    .from("nothingmoe_site_pages")
    .upsert(row, { onConflict: "site_domain" })
    .select("site_domain, line, started, pros, cons, banner_url, description, updated_at")
    .single();

  if (error) throw new Error(error.message);
  return data;
}
