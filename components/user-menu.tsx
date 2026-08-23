"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Site } from "@/lib/sites";
import { isModerator } from "@/lib/moderation";
import { useAuth } from "./auth-provider";

async function loadSites(): Promise<Site[]> {
  const res = await fetch("/api/sites", { cache: "no-store" });
  if (!res.ok) return [];
  const data = (await res.json()) as { sites?: Site[] };
  return data.sites ?? [];
}

export function UserMenu() {
  const { user, loading, configured, openAuth, signOut } = useAuth();
  const canModerate = isModerator(user);
  const [sites, setSites] = useState<Site[]>([]);

  useEffect(() => {
    void loadSites().then(setSites);
  }, []);

  const ownedSite =
    user?.ownedSites
      .map((domain) => sites.find((site) => site.domain === domain))
      .find((site): site is Site => site != null) ?? null;

  if (!configured) return null;

  return (
    <>
      {loading ? (
        <span className="font-sans text-[10px] tracking-[0.14em] text-faint">...</span>
      ) : user ? (
        <>
          <span className="hidden font-sans text-[10px] tracking-[0.08em] text-muted sm:inline">
            {user.profile?.display_name ?? user.email}
          </span>
          {ownedSite ? (
            <span
              className="inline-flex max-w-[11rem] items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] py-1 pr-2.5 pl-1 font-sans text-[9px] tracking-[0.04em] text-chrome/80"
              title={`${ownedSite.name} owner`}
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-[5px] bg-[#0a0a0a] ring-1 ring-white/10">
                <img
                  src={ownedSite.icon}
                  alt=""
                  width={16}
                  height={16}
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="min-w-0 truncate">
                <span className="font-medium text-chrome">{ownedSite.name}</span>
                <span className="text-muted"> owner</span>
              </span>
            </span>
          ) : null}
          {canModerate ? (
            <Link href="/admin" className="action-chip action-chip-view !px-3 !py-2">
              <span className="action-chip-shine" aria-hidden="true" />
              <span>admin</span>
            </Link>
          ) : null}
          <Link href="/account" className="action-chip action-chip-view !px-3 !py-2">
            <span className="action-chip-shine" aria-hidden="true" />
            <span>account</span>
          </Link>
          <button
            type="button"
            onClick={() => void signOut()}
            className="action-chip action-chip-view !px-3 !py-2"
          >
            <span className="action-chip-shine" aria-hidden="true" />
            <span>sign out</span>
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => openAuth("sign-in")}
          className="action-chip action-chip-open !px-3.5 !py-2"
        >
          <span className="action-chip-shine" aria-hidden="true" />
          <span>account</span>
        </button>
      )}
    </>
  );
}
