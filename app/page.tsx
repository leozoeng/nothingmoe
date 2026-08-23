import { Experience } from "@/components/experience";
import { Hero } from "@/components/hero";
import { MusicToggle } from "@/components/music-toggle";
import { SiteFooter } from "@/components/site-footer";
import { SiteIndex } from "@/components/site-index";
import { fetchAllSiteReviewStats } from "@/lib/review-stats-server";
import { fetchAllSites } from "@/lib/sites-server";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "NothingMoe",
  url: "https://nothingmoe.com",
  description: "nothing here is dog shit — that shady corner of the internet where the UI actually feels good.",
};

export default async function Home() {
  const [sites, reviewStats] = await Promise.all([fetchAllSites(), fetchAllSiteReviewStats()]);

  return (
    <Experience>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex-1">
        <Hero />
        <SiteIndex initialSites={sites} initialReviewStats={reviewStats} />
      </main>
      <SiteFooter />
      <MusicToggle />
    </Experience>
  );
}
