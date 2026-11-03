"use client";

import { useState } from "react";
import Link from "next/link";
import type { Site } from "@/lib/sites";
import type { SiteHealth } from "@/lib/site-health";
import { Reveal } from "./reveal";

function Trophy({ hot = false }: { hot?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`trophy h-4 w-4 shrink-0 ${hot ? "trophy-hot" : ""}`}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M7 3h10v2h2.2A1.8 1.8 0 0 1 21 6.8V8a4 4 0 0 1-3.2 3.9A5.01 5.01 0 0 1 13 15.9V17h2.5a.5.5 0 0 1 .5.5V19H8v-1.5a.5.5 0 0 1 .5-.5H11v-1.1A5.01 5.01 0 0 1 6.2 11.9 4 4 0 0 1 3 8V6.8A1.8 1.8 0 0 1 4.8 5H7V3Zm0 4H5v1a2 2 0 0 0 1.5 1.9A5.05 5.05 0 0 1 7 7Zm12 0h-2a5.05 5.05 0 0 1 .5 2.9A2 2 0 0 0 19 8V7Z"
      />
    </svg>
  );
}

function SiteRow({
  site,
  index,
  open,
  onToggle,
  health,
}: {
  site: Site;
  index: number;
  open: boolean;
  onToggle: () => void;
  health?: SiteHealth;
}) {
  const first = index === 0;

  return (
    <div className={`rank-row border-t border-[var(--line)] first:border-t-0 ${open ? "is-open" : ""}`}>
      <div
        onClick={onToggle}
        className="relative flex w-full cursor-pointer items-center gap-2.5 px-2.5 py-2.5 text-left select-none sm:gap-3 sm:px-3"
      >
        <span className="pointer-events-none absolute inset-0 rank-spotlight" aria-hidden="true" />
        <span
          className={`rank-num w-5 shrink-0 font-sans text-[9px] tracking-[0.16em] ${
            first ? "rank-num-gold" : "text-muted"
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <Link
          href={`/site/${site.slug}`}
          onClick={(event) => event.stopPropagation()}
          className="group/site flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-[#0a0a0a] ring-1 ring-white/10 transition-transform group-hover/site:scale-105">
            <img src={site.icon} alt="" width={28} height={28} className="h-full w-full object-cover" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="truncate font-sans text-[13px] font-medium tracking-[-0.01em] text-chrome transition-colors group-hover/site:underline underline-offset-2">
                {site.name}
              </span>
              {first ? <Trophy hot /> : null}
              {health ? (
                <span
                  className={`site-row-health-badge site-row-health-${health.status}`}
                  title={health.message || (health.latencyMs ? `${health.latencyMs}ms latency` : "")}
                >
                  <span className="site-row-health-dot" aria-hidden="true" />
                  <span className="site-row-health-label">
                    {health.status === "operational"
                      ? health.latencyMs ? `${health.latencyMs}ms` : "online"
                      : "degraded"}
                  </span>
                </span>
              ) : null}
            </span>
            <span className="mt-0.5 block truncate font-sans text-[10px] tracking-[0.04em] text-muted">
              {site.domain}
            </span>
          </span>
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? `Collapse ${site.name} description` : `Expand ${site.name} description`}
          onClick={(event) => {
            event.stopPropagation();
            onToggle();
          }}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:text-chrome"
        >
          <svg
            viewBox="0 0 12 12"
            className={`chevron h-2.5 w-2.5 shrink-0 text-muted ${open ? "open" : ""}`}
            aria-hidden="true"
          >
            <path fill="currentColor" d="M2.2 4.1 6 7.9l3.8-3.8.9.9L6 9.6 1.3 5z" />
          </svg>
        </button>
      </div>

      <div className={`fold ${open ? "open" : ""}`}>
        <div className="fold-inner" inert={open ? undefined : true}>
          <div className="mx-2.5 mb-2.5 space-y-3.5 border-t border-[var(--line)] px-1 pb-1 pt-2.5 sm:mx-3">
            <p className="font-sans text-[11px] leading-relaxed text-muted">{site.line}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SiteIndex({
  initialSites,
  healthMap = {},
}: {
  initialSites: Site[];
  healthMap?: Record<string, SiteHealth>;
}) {
  const items = initialSites;
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleOpen = (domain: string) => {
    setOpenId((current) => (current === domain ? null : domain));
  };

  return (
    <section id="sites" className="relative z-10 px-6 pb-8 sm:px-10">
      <div className="mx-auto max-w-xl">
        <Reveal>
          <div className="glass overflow-hidden rounded-xl">
            <div className="flex items-center gap-2 px-2.5 py-2.5 sm:px-3">
              <Trophy />
              <h2 className="font-sans text-[11px] tracking-[0.28em] text-chrome uppercase">
                Anime Streaming
              </h2>
            </div>

            {items.map((site, index) => (
              <SiteRow
                key={site.domain}
                site={site}
                index={index}
                open={openId === site.domain}
                onToggle={() => toggleOpen(site.domain)}
                health={healthMap[site.slug]}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
