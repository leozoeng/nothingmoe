import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth-server";
import { fetchSitePage, mergeSiteWithPage } from "@/lib/site-pages-server";
import { SiteDetail } from "@/components/site-detail";
import { siteBySlug, sites } from "@/lib/sites";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return sites.map((site) => ({ slug: site.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const site = siteBySlug(slug);
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
  const site = siteBySlug(slug);
  if (!site) notFound();

  const [page, session] = await Promise.all([fetchSitePage(site.domain), getSessionUser()]);
  const merged = mergeSiteWithPage(site, page);
  const isOwner = session ? session.ownedSites.includes(site.domain) : false;

  return (
    <SiteDetail site={merged} isOwner={isOwner} />
  );
}
