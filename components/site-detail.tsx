"use client";

import { type Site, getDomainAge } from "@/lib/sites";
import type { SiteHealth } from "@/lib/site-health";
import { SiteGallery } from "./site-gallery";

function OpenMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14 3h7v7h-2V6.4l-9.3 9.3-1.4-1.4L17.6 5H14V3zM5 5h6v2H7v10h10v-4h2v6H5V5z"
      />
    </svg>
  );
}

function DiscordMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.32.61.68 1.19 1.07 1.74.03.01.06.02.09.02 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12z"
      />
    </svg>
  );
}

function TelegramMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z"
      />
    </svg>
  );
}

function ActionChip({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer noopener" className="action-chip action-chip-open">
      <span className="action-chip-shine" aria-hidden="true" />
      <OpenMark />
      <span>{label}</span>
    </a>
  );
}

export function SiteDetail({
  site,
  health,
}: {
  site: Site;
  health?: SiteHealth;
}) {
  const domainAge = getDomainAge(site.registeredDate);

  return (
    <div className="site-page">
      <div className="site-page-hero-panel">
        <div className="site-page-hero-row">
          <img src={site.icon} alt="" width={100} height={100} className="site-page-icon" />
          <div className="min-w-0">
            <h1 className="site-page-title">{site.name}</h1>
            <div className="site-page-meta-row">
              <span className="site-page-domain">{site.domain}</span>
              <span className="site-page-meta-dot" aria-hidden="true" />
              <span className="site-page-meta">est. {site.started}</span>
              {site.hostingType ? (
                <>
                  <span className="site-page-meta-dot" aria-hidden="true" />
                  <span
                    className={`site-type-badge ${
                      site.hostingType === "self-hosted"
                        ? "site-type-badge-self"
                        : "site-type-badge-scraper"
                    }`}
                  >
                    {site.hostingType === "self-hosted" ? "self-hosted" : "scraper"}
                  </span>
                </>
              ) : null}
              {health ? (
                <>
                  <span className="site-page-meta-dot" aria-hidden="true" />
                  <span
                    className={`site-status-badge site-status-${health.status}`}
                    title={health.message || `${health.status} (${health.latencyMs}ms)`}
                  >
                    <span className="site-status-icon" aria-hidden="true">
                      {health.status === "operational" ? "●" : "▲"}
                    </span>
                    <span>{health.status === "operational" ? "Operational" : "Degraded"}</span>
                    {health.status === "operational" && health.latencyMs ? (
                      <span className="site-status-latency">{health.latencyMs}ms</span>
                    ) : null}
                    {health.status === "degraded" && health.code ? (
                      <span className="site-status-latency">{health.code}</span>
                    ) : null}
                  </span>
                </>
              ) : null}
            </div>
          </div>
          <div className="site-page-actions">
            {site.discord ? (
              <a
                href={site.discord}
                target="_blank"
                rel="noreferrer noopener"
                className="action-chip action-chip-discord"
                title={`Join ${site.name} Discord`}
              >
                <span className="action-chip-shine" aria-hidden="true" />
                <DiscordMark />
                <span>discord</span>
              </a>
            ) : null}
            {site.telegram ? (
              <a
                href={site.telegram}
                target="_blank"
                rel="noreferrer noopener"
                className="action-chip action-chip-telegram"
                title={`Join ${site.name} Telegram`}
              >
                <span className="action-chip-shine" aria-hidden="true" />
                <TelegramMark />
                <span>telegram</span>
              </a>
            ) : null}
            <ActionChip href={site.href} label="open" />
          </div>
        </div>
      </div>

      <div className="site-page-body">
        <p className="site-page-tagline">{site.line}</p>

        {site.description ? (
          <section className="site-page-about">
            <p className="site-page-about-text">{site.description}</p>
          </section>
        ) : null}

        <section className="site-specs-section" aria-label="Site specifications">
          <div className="site-specs-row">
            {domainAge ? (
              <div className="site-spec-item">
                <span className="site-spec-label">Domain Registered</span>
                <p className="site-spec-value">{domainAge.age}</p>
                <p className="site-spec-sub">{domainAge.date}</p>
              </div>
            ) : null}

            {site.hostingType ? (
              <div className="site-spec-item">
                <span className="site-spec-label">Hosting & Streams</span>
                <p className="site-spec-value">
                  {site.hostingType === "self-hosted" ? "Self-Hosted" : "Scraper / Embeds"}
                </p>
                <p className="site-spec-sub">
                  {site.hostingType === "self-hosted"
                    ? "Direct video storage & CDN servers"
                    : "Aggregates 3rd-party video embeds"}
                </p>
              </div>
            ) : null}

            {site.catalogSize ? (
              <div className="site-spec-item">
                <span className="site-spec-label">Catalog Size</span>
                <p className="site-spec-value">{site.catalogSize.value}</p>
                <p className="site-spec-sub">{site.catalogSize.sub}</p>
              </div>
            ) : null}

            {site.adExperience ? (
              <div className="site-spec-item">
                <span className="site-spec-label">Ad Experience</span>
                <p className="site-spec-value">{site.adExperience.value}</p>
                <p className="site-spec-sub">{site.adExperience.sub}</p>
              </div>
            ) : null}

            {site.subtitles ? (
              <div className="site-spec-item">
                <span className="site-spec-label">Subtitles</span>
                <p className="site-spec-value">{site.subtitles.value}</p>
                <p className="site-spec-sub">{site.subtitles.sub}</p>
              </div>
            ) : null}

            {site.audio ? (
              <div className="site-spec-item">
                <span className="site-spec-label">Audio</span>
                <p className="site-spec-value">{site.audio.value}</p>
                <p className="site-spec-sub">{site.audio.sub}</p>
              </div>
            ) : null}

            {health ? (
              <div className="site-spec-item">
                <span className="site-spec-label">Live Status</span>
                <p className={`site-spec-value site-spec-health-${health.status}`}>
                  <span className="site-spec-status-symbol" aria-hidden="true">
                    {health.status === "operational" ? "●" : "▲"}
                  </span>{" "}
                  {health.status === "operational" ? "Operational" : "Degraded"}
                </p>
                <p className="site-spec-sub">
                  {health.status === "operational"
                    ? `${health.latencyMs ?? 0}ms response time`
                    : health.message || "Origin unreachable"}
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <SiteGallery slug={site.slug} name={site.name} />
      </div>
    </div>
  );
}

export { ActionChip };
