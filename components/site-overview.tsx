"use client";

import { SiteScorePanel } from "./site-score-panel";
import { SiteFeatureList } from "./site-feature-list";
import type { ReviewStats } from "@/lib/scores";
import type { Scores } from "@/lib/sites";

export function SiteOverview({
  scores,
  stats,
  displayStars,
  featureList,
}: {
  scores: Scores;
  stats: ReviewStats;
  displayStars: number | null;
  featureList: string[];
}) {
  return (
    <section className="site-overview" aria-label="Community census and features">
      <SiteScorePanel compact scores={scores} stats={stats} displayStars={displayStars} />
      <div className="site-overview-features-wrap">
        <SiteFeatureList features={featureList} />
      </div>
    </section>
  );
}
