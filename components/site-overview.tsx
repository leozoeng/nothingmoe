"use client";

import { SiteScorePanel } from "./site-score-panel";
import { SiteVerdict } from "./site-verdict";
import type { ReviewStats } from "@/lib/scores";
import type { Scores } from "@/lib/sites";

export function SiteOverview({
  scores,
  stats,
  displayStars,
  pros,
  cons,
}: {
  scores: Scores;
  stats: ReviewStats;
  displayStars: number | null;
  pros: string[];
  cons: string[];
}) {
  return (
    <section className="site-overview" aria-label="Scores and verdict">
      <SiteScorePanel compact scores={scores} stats={stats} displayStars={displayStars} />
      <div className="site-overview-verdicts">
        <SiteVerdict pros={pros} cons={cons} />
      </div>
    </section>
  );
}
