"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Site } from "@/lib/sites";
import {
  ModeratorAddSitePanel,
  ModeratorRankControls,
} from "./moderator-ranking-controls";

type ProfileHit = {
  id: string;
  username: string;
  display_name: string;
};

type SiteOwnerRow = {
  domain: string;
  name: string;
  slug: string;
  owner: {
    userId: string;
    username: string;
    displayName: string;
  } | null;
};

async function loadSites(): Promise<Site[]> {
  const res = await fetch("/api/sites", { cache: "no-store" });
  if (!res.ok) return [];
  const data = (await res.json()) as { sites?: Site[] };
  return data.sites ?? [];
}

export function AdminDashboard({ initialSites }: { initialSites: Site[] }) {
  const [sites, setSites] = useState(initialSites);
  const [owners, setOwners] = useState<SiteOwnerRow[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ownerDomain, setOwnerDomain] = useState<string | null>(null);
  const [ownerQuery, setOwnerQuery] = useState("");
  const [ownerHits, setOwnerHits] = useState<ProfileHit[]>([]);
  const [ownerSaving, setOwnerSaving] = useState(false);

  const refreshSites = useCallback(async () => {
    setSites(await loadSites());
  }, []);

  const refreshOwners = useCallback(async () => {
    const res = await fetch("/api/moderation/site-owners", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as { sites?: SiteOwnerRow[] };
    setOwners(data.sites ?? []);
  }, []);

  useEffect(() => {
    void refreshOwners();
  }, [refreshOwners, sites.length]);

  useEffect(() => {
    if (!ownerDomain) {
      setOwnerHits([]);
      return;
    }

    const query = ownerQuery.trim();
    if (query.length < 2) {
      setOwnerHits([]);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void fetch(`/api/moderation/profiles?q=${encodeURIComponent(query)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { profiles?: ProfileHit[] } | null) => {
          if (!cancelled) setOwnerHits(data?.profiles ?? []);
        });
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [ownerDomain, ownerQuery]);

  const onMove = async (domain: string, direction: "up" | "down") => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/moderation/sites", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, direction }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed to reorder");
        return;
      }
      await refreshSites();
    } finally {
      setBusy(false);
    }
  };

  const assignOwner = async (ownerUserId: string) => {
    if (!ownerDomain) return;
    setOwnerSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/moderation/site-owners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: ownerDomain, ownerUserId }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed to assign owner");
        return;
      }
      setOwnerDomain(null);
      setOwnerQuery("");
      setOwnerHits([]);
      await refreshOwners();
    } finally {
      setOwnerSaving(false);
    }
  };

  return (
    <main className="admin-shell px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-sans text-[10px] tracking-[0.28em] text-muted uppercase">zlzh admin</p>
            <h1 className="mt-2 font-sans text-2xl font-medium tracking-[-0.03em] text-chrome">
              site control
            </h1>
            <p className="mt-2 max-w-xl font-sans text-[12px] leading-relaxed text-muted">
              reorder rankings, add sites, and assign owners. the homepage stays public — this panel is
              just for you.
            </p>
          </div>
          <Link href="/" className="action-chip action-chip-view !px-3.5 !py-2">
            <span className="action-chip-shine" aria-hidden="true" />
            <span>back to site</span>
          </Link>
        </div>

        {error ? <p className="moderator-error mb-4">{error}</p> : null}

        <section className="admin-section glass rounded-xl">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div>
              <h2 className="font-sans text-[11px] tracking-[0.24em] text-chrome uppercase">
                world ranking
              </h2>
              <p className="mt-1 font-sans text-[10px] text-muted">move sites up or down</p>
            </div>
            <button
              type="button"
              onClick={() => setAddOpen((value) => !value)}
              className={`rounded-full px-2.5 py-1 font-sans text-[9px] tracking-[0.2em] uppercase transition-colors ${
                addOpen ? "bg-white/10 text-chrome" : "text-muted hover:text-chrome/80"
              }`}
            >
              add site
            </button>
          </div>

          <ModeratorAddSitePanel
            open={addOpen}
            busy={busy}
            onClose={() => setAddOpen(false)}
            onCreated={() => void refreshSites()}
          />

          <div>
            {sites.map((site, index) => (
              <div
                key={site.domain}
                className="flex items-center gap-3 border-t border-white/10 px-4 py-3 first:border-t-0"
              >
                <ModeratorRankControls
                  domain={site.domain}
                  index={index}
                  total={sites.length}
                  busy={busy}
                  onMove={(domain, direction) => void onMove(domain, direction)}
                />
                <span className="w-6 shrink-0 font-sans text-[10px] tabular-nums tracking-[0.16em] text-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex h-8 w-8 shrink-0 overflow-hidden rounded-[8px] ring-1 ring-white/10">
                  <img src={site.icon} alt="" width={32} height={32} className="h-full w-full object-cover" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-sans text-[13px] font-medium text-chrome">{site.name}</p>
                  <p className="truncate font-sans text-[10px] text-muted">{site.domain}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-section glass mt-6 rounded-xl">
          <div className="border-b border-white/10 px-4 py-3">
            <h2 className="font-sans text-[11px] tracking-[0.24em] text-chrome uppercase">site owners</h2>
            <p className="mt-1 font-sans text-[10px] text-muted">assign which account owns each site</p>
          </div>

          <div className="divide-y divide-white/10">
            {owners.map((row) => (
              <div key={row.domain} className="px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-sans text-[13px] font-medium text-chrome">{row.name}</p>
                    <p className="font-sans text-[10px] text-muted">{row.domain}</p>
                  </div>
                  <div className="text-right">
                    {row.owner ? (
                      <p className="font-sans text-[11px] text-chrome">
                        {row.owner.displayName}{" "}
                        <span className="text-muted">@{row.owner.username}</span>
                      </p>
                    ) : (
                      <p className="font-sans text-[11px] text-faint">no owner</p>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setOwnerDomain(row.domain);
                        setOwnerQuery("");
                        setOwnerHits([]);
                        setError(null);
                      }}
                      className="mt-1 font-sans text-[10px] tracking-[0.12em] text-muted uppercase transition-colors hover:text-chrome"
                    >
                      {ownerDomain === row.domain ? "assigning..." : "change owner"}
                    </button>
                  </div>
                </div>

                {ownerDomain === row.domain ? (
                  <div className="moderator-panel mt-3 rounded-xl border border-white/10 px-3 py-3">
                    <label className="moderator-field">
                      <span>search account</span>
                      <input
                        value={ownerQuery}
                        onChange={(event) => setOwnerQuery(event.target.value)}
                        placeholder="username"
                      />
                    </label>
                    {ownerHits.length > 0 ? (
                      <div className="moderator-owner-hits mt-2">
                        {ownerHits.map((profile) => (
                          <button
                            key={profile.id}
                            type="button"
                            disabled={ownerSaving}
                            className="moderator-owner-hit"
                            onClick={() => void assignOwner(profile.id)}
                          >
                            <span className="text-chrome">{profile.display_name}</span>
                            <span className="text-muted">@{profile.username}</span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setOwnerDomain(null)}
                      className="mt-3 font-sans text-[10px] tracking-[0.12em] text-faint uppercase transition-colors hover:text-muted"
                    >
                      cancel
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
