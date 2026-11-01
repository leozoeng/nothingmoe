import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchSitePage, mergeSiteWithPage } from "@/lib/site-pages-server";
import { fetchAllSites, fetchSiteBySlug } from "@/lib/sites-server";
import { checkSiteHealth } from "@/lib/site-health";
import { SiteDetail } from "@/components/site-detail";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = true;

export async function generateStaticParams() {
  const sites = await fetchAllSites();
  return sites.map((site) => ({ slug: site.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const site = await fetchSiteBySlug(slug);
  if (!site) return { title: "Not found" };

  const page = await fetchSitePage(site.domain);
  const merged = mergeSiteWithPage(site, page);

  return {
    title: merged.name,
    description: merged.description || merged.line,
    openGraph: {
      title: `${merged.name} · NothingMoe`,
      description: merged.description || merged.line,
      ...(merged.banner ? { images: [{ url: merged.banner }] } : {}),
    },
  };
}

export default async function SitePage({ params }: Params) {
  const { slug } = await params;
  const site = await fetchSiteBySlug(slug);
  if (!site) notFound();

  const [page, health] = await Promise.all([
    fetchSitePage(site.domain),
    checkSiteHealth(site.href),
  ]);
  const merged = mergeSiteWithPage(site, page);

  return <SiteDetail site={merged} health={health} />;
}
