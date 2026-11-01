"use client";

import { SiteFeatureList } from "./site-feature-list";

export function SiteOverview({
  featureList,
}: {
  featureList: string[];
}) {
  if (!featureList || featureList.length === 0) return null;

  return (
    <section className="site-overview" aria-label="Features">
      <div className="site-overview-features-wrap">
        <SiteFeatureList features={featureList} />
      </div>
    </section>
  );
}
