import { fetchSitePage, mergeSiteWithPage } from "./site-pages-server";
import { SEED_SITES, categoryMeta, type CategoryId, type Site } from "./sites";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseConfigured } from "./supabase/client";

type SiteRow = {
  domain: string;
  slug: string;
  name: string;
  href: string;
  discord: string | null;
  icon: string;
  category: CategoryId;
  reason: string;
  line: string;
  started: string;
  seed_ui: number;
  seed_ux: number;
  seed_catalog: number;
  seed_features: number;
  sort_order: number;
};

function mapSiteRow(row: SiteRow): Site {
  return {
    slug: row.slug,
    name: row.name,
    domain: row.domain,
    href: row.href,
    discord: row.discord ?? undefined,
    icon: row.icon,
    category: row.category,
    reason: row.reason,
    line: row.line,
    started: row.started,
    featureList: [],
    seed: {
      ui: row.seed_ui,
      ux: row.seed_ux,
      catalog: row.seed_catalog,
      features: row.seed_features,
    },
  };
}

function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

async function fetchSiteRows(): Promise<SiteRow[]> {
  if (!supabaseConfigured()) return [];

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("nothingmoe_sites")
    .select(
      "domain, slug, name, href, discord, icon, category, reason, line, started, seed_ui, seed_ux, seed_catalog, seed_features, sort_order",
    )
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as SiteRow[];
}

export async function fetchAllSites(): Promise<Site[]> {
  const rows = await fetchSiteRows();
  if (!rows.length) return SEED_SITES;

  const sites = rows.map(mapSiteRow);
  const pages = await Promise.all(sites.map((site) => fetchSitePage(site.domain)));

  return sites.map((site, index) => mergeSiteWithPage(site, pages[index] ?? null));
}

export async function fetchSiteByDomain(domain: string): Promise<Site | null> {
  const sites = await fetchAllSites();
  return sites.find((site) => site.domain === domain) ?? null;
}

export async function fetchSiteBySlug(slug: string): Promise<Site | null> {
  const sites = await fetchAllSites();
  return sites.find((site) => site.slug === slug) ?? null;
}

export async function siteExists(domain: string): Promise<boolean> {
  if (!supabaseConfigured()) {
    return SEED_SITES.some((site) => site.domain === domain);
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("nothingmoe_sites")
    .select("domain")
    .eq("domain", domain)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return Boolean(data);
}

export async function fetchValidDomains(): Promise<string[]> {
  const rows = await fetchSiteRows();
  if (!rows.length) return SEED_SITES.map((site) => site.domain);
  return rows.map((row) => row.domain);
}

export function sitesByCategoryFromList(items: Site[]) {
  return categoryMeta.map((category) => ({
    ...category,
    items: items.filter((site) => site.category === category.id),
  }));
}
