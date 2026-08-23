"use client";

import { useEffect, useState } from "react";
import { applyBoost, canBoost, readBoosts, writeBoosts } from "@/lib/boosts";
import {
  computeStats,
  mergeScores,
  type ReviewStats,
} from "@/lib/scores";
import type { Site } from "@/lib/sites";
import { ScoreMeters } from "./score-meters";
import { ActionChip } from "./site-detail";
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

function VibeMeters({
  site,
  stats,
  active,
}: {
  site: Site;
  stats?: ReviewStats;
  active: boolean;
}) {
  const merged = mergeScores(site.seed, stats ?? computeStats([]));

  return <ScoreMeters scores={merged} active={active} label="community census" />;
}

function BoostButton({
  domain,
  count,
  locked,
  onBoost,
}: {
  domain: string;
  count: number;
  locked: boolean;
  onBoost: (domain: string) => void;
}) {
  return (
    <button
      type="button"
      disabled={locked}
      onClick={(event) => {
        event.stopPropagation();
        onBoost(domain);
      }}
      className={`boost-chip ${locked ? "is-locked" : ""}`}
      aria-label={locked ? "Boost available again in 12 hours" : "Boost this site"}
    >
      <span className="boost-chip-shine" aria-hidden="true" />
      <svg viewBox="0 0 24 24" className="h-3 w-3" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 3.2 13.7 9H20l-5.1 3.7L16.6 19 12 15.5 7.4 19l1.7-6.3L4 9h6.3L12 3.2z"
        />
      </svg>
      <span>{locked ? "boosted" : "boost"}</span>
      <span className="tabular-nums text-chrome/45">{count}</span>
    </button>
  );
}

function SiteRow({
  site,
  index,
  open,
  compare,
  selected,
  boostCount,
  boostLocked,
  reviewStats,
  onToggle,
  onPick,
  onBoost,
}: {
  site: Site;
  index: number;
  open: boolean;
  compare: boolean;
  selected: boolean;
  boostCount: number;
  boostLocked: boolean;
  reviewStats?: ReviewStats;
  onToggle: () => void;
  onPick: () => void;
  onBoost: (domain: string) => void;
}) {
  const first = index === 0;

  return (
    <div className={`rank-row border-t border-white/10 first:border-t-0 ${open ? "is-open" : ""}`}>
      <button
        type="button"
        aria-expanded={compare ? selected : open}
        onClick={compare ? onPick : onToggle}
        className={`relative flex w-full items-center gap-2.5 px-2.5 py-2.5 text-left sm:gap-3 sm:px-3 ${
          selected ? "bg-white/[0.04]" : ""
        }`}
      >
        <span className="pointer-events-none absolute inset-0 rank-spotlight" aria-hidden="true" />
        <span
          className={`rank-num w-5 shrink-0 font-sans text-[9px] tracking-[0.16em] ${
            first ? "rank-num-gold" : "text-muted"
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        {compare ? (
          <span
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
              selected ? "border-[#c9a227] bg-[#c9a227]/text-[#050505]" : "border-white/20 text-transparent"
            }`}
            aria-hidden="true"
          >
            <span className="text-[9px] leading-none">✓</span>
          </span>
        ) : null}
        <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-[#0a0a0a] ring-1 ring-white/10">
          <img src={site.icon} alt="" width={28} height={28} className="h-full w-full object-cover" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate font-sans text-[13px] font-medium tracking-[-0.01em] text-chrome">
              {site.name}
            </span>
            {first && !compare ? <Trophy hot /> : null}
          </span>
          <span className="mt-0.5 block truncate font-sans text-[10px] tracking-[0.04em] text-muted">
            {site.domain}
          </span>
        </span>
        {!compare && boostCount > 0 ? (
          <span className="mr-1 font-sans text-[9px] tabular-nums tracking-[0.08em] text-muted">
            ↑{boostCount}
          </span>
        ) : null}
        {!compare ? (
          <svg
            viewBox="0 0 12 12"
            className={`chevron h-2.5 w-2.5 shrink-0 text-muted ${open ? "open" : ""}`}
            aria-hidden="true"
          >
            <path fill="currentColor" d="M2.2 4.1 6 7.9l3.8-3.8.9.9L6 9.6 1.3 5z" />
          </svg>
        ) : null}
      </button>

      {!compare ? (
        <div className={`fold ${open ? "open" : ""}`}>
          <div className="fold-inner" inert={open ? undefined : true}>
            <div className="mx-2.5 mb-2.5 space-y-3.5 border-t border-white/[0.06] px-1 pb-1 pt-2.5 sm:mx-3">
              <p className="font-sans text-[11px] leading-relaxed text-muted">{site.line}</p>
              <VibeMeters site={site} stats={reviewStats} active={open} />
              <div className="flex flex-wrap gap-2 pt-0.5">
                <ActionChip href={`/site/${site.slug}`} label="view page" variant="view" external={false} />
                <ActionChip href={site.href} label="open" variant="open" />
                {site.discord ? (
                  <ActionChip href={site.discord} label="discord" variant="discord" />
                ) : null}
                <BoostButton
                  domain={site.domain}
                  count={boostCount}
                  locked={boostLocked}
                  onBoost={onBoost}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ComparePanel({ a, b, onClear }: { a: Site; b: Site; onClear: () => void }) {
  return (
    <div className="compare-panel mt-3 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
      <div className="flex items-center justify-between px-3 py-2.5">
        <p className="font-sans text-[10px] tracking-[0.24em] text-muted uppercase">compare</p>
        <button
          type="button"
          onClick={onClear}
          className="font-sans text-[10px] tracking-[0.18em] text-faint uppercase transition-colors hover:text-muted"
        >
          clear
        </button>
      </div>
      <div className="grid gap-0 border-t border-white/10 sm:grid-cols-2">
        {[a, b].map((site) => (
          <div key={site.domain} className="space-y-3 border-white/10 p-3 sm:border-r sm:last:border-r-0">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 overflow-hidden rounded-[8px] ring-1 ring-white/10">
                <img src={site.icon} alt="" width={28} height={28} className="h-full w-full object-cover" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-sans text-[13px] font-medium text-chrome">{site.name}</p>
                <p className="truncate font-sans text-[10px] text-muted">{site.reason}</p>
              </div>
            </div>
            <VibeMeters site={site} active />
            <div className="flex flex-wrap gap-2">
              <ActionChip href={`/site/${site.slug}`} label="view page" variant="view" external={false} />
              <ActionChip href={site.href} label="open" variant="open" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SiteIndex({ initialSites }: { initialSites: Site[] }) {
  const items = initialSites;
  const [openId, setOpenId] = useState<string | null>(null);
  const [compare, setCompare] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [boosts, setBoosts] = useState(() => ({
    lastBoostAt: {} as Record<string, number>,
    counts: {} as Record<string, number>,
  }));
  const [reviewStats, setReviewStats] = useState<Record<string, ReviewStats>>({});

  useEffect(() => {
    setBoosts(readBoosts());
  }, []);

  useEffect(() => {
    if (!openId) return;

    let cancelled = false;
    void fetch(`/api/reviews/${encodeURIComponent(openId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { stats: ReviewStats } | null) => {
        if (!cancelled && data?.stats) {
          setReviewStats((current) =>
            current[openId] ? current : { ...current, [openId]: data.stats },
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [openId]);

  const toggleOpen = (domain: string) => {
    setOpenId((current) => (current === domain ? null : domain));
  };

  const pick = (domain: string) => {
    setPicked((current) => {
      if (current.includes(domain)) return current.filter((id) => id !== domain);
      if (current.length >= 2) return [current[1], domain];
      return [...current, domain];
    });
  };

  const onBoost = (domain: string) => {
    setBoosts((current) => {
      const base = current.lastBoostAt ? current : readBoosts();
      if (!canBoost(domain, base)) return base;
      const next = applyBoost(domain, base);
      writeBoosts(next);
      return next;
    });
  };

  const pair = picked
    .map((domain) => items.find((site) => site.domain === domain))
    .filter(Boolean) as Site[];

  return (
    <section id="sites" className="relative z-10 px-6 pb-8 sm:px-10">
      <div className="mx-auto max-w-xl">
        <Reveal>
          <div className="glass overflow-hidden rounded-xl">
            <div className="flex items-center justify-between gap-3 px-2.5 py-2.5 sm:px-3">
              <div className="flex items-center gap-2">
                <Trophy />
                <h2 className="font-sans text-[11px] tracking-[0.28em] text-chrome uppercase">
                  World Ranking
                </h2>
              </div>
              <button
                type="button"
                aria-pressed={compare}
                onClick={() => {
                  setCompare((value) => !value);
                  setOpenId(null);
                  setPicked([]);
                }}
                className={`rounded-full px-2.5 py-1 font-sans text-[9px] tracking-[0.2em] uppercase transition-colors ${
                  compare ? "bg-white/10 text-chrome" : "text-muted hover:text-chrome/80"
                }`}
              >
                compare
              </button>
            </div>

            {compare ? (
              <p className="border-t border-white/10 px-3 py-2 font-sans text-[10px] tracking-[0.04em] text-faint">
                pick two dens
              </p>
            ) : null}

            {items.map((site, index) => (
              <SiteRow
                key={site.domain}
                site={site}
                index={index}
                open={openId === site.domain}
                compare={compare}
                selected={picked.includes(site.domain)}
                boostCount={boosts.counts[site.domain] ?? 0}
                boostLocked={!canBoost(site.domain, boosts)}
                reviewStats={reviewStats[site.domain]}
                onToggle={() => toggleOpen(site.domain)}
                onPick={() => pick(site.domain)}
                onBoost={onBoost}
              />
            ))}
          </div>
        </Reveal>

        {compare && pair.length === 2 ? (
          <ComparePanel a={pair[0]} b={pair[1]} onClear={() => setPicked([])} />
        ) : null}
      </div>
    </section>
  );
}
