"use client";

import { useEffect, useState } from "react";
import { applyBoost, canBoost, readBoosts, writeBoosts } from "@/lib/boosts";
import { sitesByCategory, type Site, type Vibe } from "@/lib/sites";
import { Reveal } from "./reveal";

const VIBE_LABELS: { key: keyof Vibe; label: string }[] = [
  { key: "ui", label: "ui" },
  { key: "speed", label: "speed" },
  { key: "catalog", label: "catalog" },
  { key: "social", label: "social" },
];

function DiscordMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"
      />
    </svg>
  );
}

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

function ActionChip({
  href,
  label,
  variant = "open",
}: {
  href: string;
  label: string;
  variant?: "open" | "discord";
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      onClick={(event) => event.stopPropagation()}
      className={`action-chip ${variant === "discord" ? "action-chip-discord" : "action-chip-open"}`}
    >
      <span className="action-chip-shine" aria-hidden="true" />
      {variant === "discord" ? <DiscordMark /> : <OpenMark />}
      <span>{label}</span>
    </a>
  );
}

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

function ProsCons({ site }: { site: Site }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <ul className="space-y-1.5">
        {site.pros.map((pro) => (
          <li
            key={pro}
            className="flex items-start gap-2 font-sans text-[11px] leading-snug text-chrome/70"
          >
            <span className="mt-[1px] select-none text-[10px] text-chrome/30">+</span>
            <span>{pro}</span>
          </li>
        ))}
      </ul>
      <ul className="space-y-1.5">
        {site.cons.map((con) => (
          <li
            key={con}
            className="flex items-start gap-2 font-sans text-[11px] leading-snug text-muted"
          >
            <span className="mt-[1px] select-none text-[10px] text-chrome/20">−</span>
            <span>{con}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function VibeMeters({ vibe, active }: { vibe: Vibe; active: boolean }) {
  return (
    <div className="space-y-2">
      <p className="font-sans text-[9px] tracking-[0.24em] text-faint uppercase">vibe</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {VIBE_LABELS.map(({ key, label }) => (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-sans text-[10px] tracking-[0.12em] text-muted uppercase">
                {label}
              </span>
              <span className="font-sans text-[10px] tabular-nums text-chrome/55">
                {vibe[key]}
              </span>
            </div>
            <div className="h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="vibe-fill h-full rounded-full bg-gradient-to-r from-white/25 to-white/70"
                style={{ width: active ? `${vibe[key]}%` : "0%" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
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
      aria-label={locked ? "Already boosted today" : "Boost this site"}
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
            first ? "text-[#c9a227]" : "text-muted"
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
              <VibeMeters vibe={site.vibe} active={open} />
              <ProsCons site={site} />
              <div className="flex flex-wrap gap-2 pt-0.5">
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
            <VibeMeters vibe={site.vibe} active />
            <ProsCons site={site} />
            <ActionChip href={site.href} label="open" variant="open" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SiteIndex() {
  const groups = sitesByCategory();
  const items = groups[0]?.items ?? [];
  const [openId, setOpenId] = useState<string | null>(null);
  const [compare, setCompare] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [boosts, setBoosts] = useState(() => ({
    day: "",
    voted: [] as string[],
    counts: {} as Record<string, number>,
  }));

  useEffect(() => {
    setBoosts(readBoosts());
  }, []);

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
      const base = current.day ? current : readBoosts();
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
