"use client";

export function SiteFeatureList({ features }: { features: string[] }) {
  if (!features.length) return null;

  return (
    <div className="site-overview-col site-overview-features">
      <p className="site-overview-label">features</p>
      <ul className="site-feature-list">
        {features.map((feature) => (
          <li key={feature} className="site-feature-item">
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
