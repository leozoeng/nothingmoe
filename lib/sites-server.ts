import { fetchSitePage, mergeSiteWithPage } from "./site-pages-server";
import { SEED_SITES, categoryMeta, type Site } from "./sites";

export async function fetchAllSites(): Promise<Site[]> {
  const pages = await Promise.all(SEED_SITES.map((site) => fetchSitePage(site.domain)));
  return SEED_SITES.map((site, index) => mergeSiteWithPage(site, pages[index] ?? null));
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
  return SEED_SITES.some((site) => site.domain === domain);
}

export async function fetchValidDomains(): Promise<string[]> {
  return SEED_SITES.map((site) => site.domain);
}

export function sitesByCategoryFromList(items: Site[]) {
  return categoryMeta.map((category) => ({
    ...category,
    items: items.filter((site) => site.category === category.id),
  }));
}
