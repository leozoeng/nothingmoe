"use client";

import { useEffect, useMemo, useState } from "react";
import type { Site } from "@/lib/sites";

type ProfileHit = {
  id: string;
  username: string;
  display_name: string;
};

type AddSiteForm = {
  name: string;
  domain: string;
  slug: string;
  href: string;
  icon: string;
  reason: string;
  line: string;
  started: string;
  discord: string;
  ownerQuery: string;
  ownerUserId: string;
  ownerLabel: string;
};

const emptyForm = (): AddSiteForm => ({
  name: "",
  domain: "",
  slug: "",
  href: "",
  icon: "/sites/",
  reason: "",
  line: "",
  started: new Date().getFullYear().toString(),
  discord: "",
  ownerQuery: "",
  ownerUserId: "",
  ownerLabel: "",
});

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ModeratorRankControls({
  domain,
  index,
  total,
  busy,
  onMove,
}: {
  domain: string;
  index: number;
  total: number;
  busy: boolean;
  onMove: (domain: string, direction: "up" | "down") => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        disabled={busy || index === 0}
        onClick={(event) => {
          event.stopPropagation();
          onMove(domain, "up");
        }}
        className="mod-rank-btn"
        aria-label="Move site up"
        title="Move up"
      >
        ↑
      </button>
      <button
        type="button"
        disabled={busy || index >= total - 1}
        onClick={(event) => {
          event.stopPropagation();
          onMove(domain, "down");
        }}
        className="mod-rank-btn"
        aria-label="Move site down"
        title="Move down"
      >
        ↓
      </button>
    </div>
  );
}

export function ModeratorAddSitePanel({
  open,
  busy,
  onClose,
  onCreated,
}: {
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onCreated: (site: Site) => void;
}) {
  const [form, setForm] = useState<AddSiteForm>(() => emptyForm());
  const [slugTouched, setSlugTouched] = useState(false);
  const [ownerHits, setOwnerHits] = useState<ProfileHit[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setForm(emptyForm());
      setSlugTouched(false);
      setOwnerHits([]);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const query = form.ownerQuery.trim();
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
  }, [form.ownerQuery, open]);

  const hrefPreview = useMemo(() => {
    const domain = form.domain.trim().toLowerCase();
    return domain ? `https://${domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "")}` : "";
  }, [form.domain]);

  if (!open) return null;

  const update = (patch: Partial<AddSiteForm>) => {
    setForm((current) => {
      const next = { ...current, ...patch };
      if (!slugTouched && patch.name !== undefined) {
        next.slug = slugify(patch.name);
      }
      if (patch.domain !== undefined && !current.href.trim()) {
        const domain = patch.domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
        next.href = domain ? `https://${domain}` : "";
      }
      return next;
    });
  };

  const submit = async () => {
    setError(null);
    const payload = {
      name: form.name.trim(),
      domain: form.domain.trim(),
      slug: form.slug.trim(),
      href: form.href.trim() || hrefPreview,
      icon: form.icon.trim(),
      reason: form.reason.trim(),
      line: form.line.trim(),
      started: form.started.trim(),
      discord: form.discord.trim() || undefined,
      ownerUserId: form.ownerUserId || undefined,
    };

    const res = await fetch("/api/moderation/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await res.json()) as { error?: string; site?: { domain: string; slug: string } };
    if (!res.ok) {
      setError(data.error ?? "Failed to add site");
      return;
    }

    const created: Site = {
      slug: payload.slug,
      name: payload.name,
      domain: payload.domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase(),
      href: payload.href,
      discord: payload.discord || undefined,
      icon: payload.icon,
      category: "japanese",
      reason: payload.reason,
      line: payload.line,
      started: payload.started,
      featureList: [],
      seed: { ui: 80, ux: 80, catalog: 80, features: 80 },
    };

    onCreated(created);
    onClose();
  };

  return (
    <div className="moderator-panel border-t border-white/10 px-3 py-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-sans text-[10px] tracking-[0.24em] text-chrome uppercase">add site</p>
        <button
          type="button"
          onClick={onClose}
          className="font-sans text-[10px] tracking-[0.18em] text-faint uppercase transition-colors hover:text-muted"
        >
          close
        </button>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className="moderator-field">
          <span>name</span>
          <input value={form.name} onChange={(event) => update({ name: event.target.value })} />
        </label>
        <label className="moderator-field">
          <span>domain</span>
          <input
            value={form.domain}
            onChange={(event) => update({ domain: event.target.value })}
            placeholder="example.com"
          />
        </label>
        <label className="moderator-field">
          <span>slug</span>
          <input
            value={form.slug}
            onChange={(event) => {
              setSlugTouched(true);
              update({ slug: event.target.value });
            }}
            placeholder="example"
          />
        </label>
        <label className="moderator-field">
          <span>site url</span>
          <input value={form.href} onChange={(event) => update({ href: event.target.value })} />
        </label>
        <label className="moderator-field sm:col-span-2">
          <span>icon path</span>
          <input value={form.icon} onChange={(event) => update({ icon: event.target.value })} />
        </label>
        <label className="moderator-field">
          <span>reason</span>
          <input value={form.reason} onChange={(event) => update({ reason: event.target.value })} />
        </label>
        <label className="moderator-field">
          <span>started</span>
          <input value={form.started} onChange={(event) => update({ started: event.target.value })} />
        </label>
        <label className="moderator-field sm:col-span-2">
          <span>tagline</span>
          <input value={form.line} onChange={(event) => update({ line: event.target.value })} />
        </label>
        <label className="moderator-field sm:col-span-2">
          <span>discord (optional)</span>
          <input value={form.discord} onChange={(event) => update({ discord: event.target.value })} />
        </label>
        <label className="moderator-field sm:col-span-2">
          <span>owner account</span>
          <input
            value={form.ownerQuery}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                ownerQuery: event.target.value,
                ownerUserId: "",
                ownerLabel: "",
              }))
            }
            placeholder="search username"
          />
        </label>
      </div>

      {form.ownerUserId ? (
        <p className="mt-2 font-sans text-[10px] text-muted">
          owner: <span className="text-chrome">{form.ownerLabel}</span>
          <button
            type="button"
            className="ml-2 text-faint underline-offset-2 hover:text-muted hover:underline"
            onClick={() =>
              setForm((current) => ({
                ...current,
                ownerUserId: "",
                ownerLabel: "",
                ownerQuery: "",
              }))
            }
          >
            clear
          </button>
        </p>
      ) : null}

      {ownerHits.length > 0 && !form.ownerUserId ? (
        <div className="moderator-owner-hits mt-2">
          {ownerHits.map((profile) => (
            <button
              key={profile.id}
              type="button"
              className="moderator-owner-hit"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  ownerUserId: profile.id,
                  ownerLabel: `${profile.display_name} (@${profile.username})`,
                  ownerQuery: profile.username,
                }))
              }
            >
              <span className="text-chrome">{profile.display_name}</span>
              <span className="text-muted">@{profile.username}</span>
            </button>
          ))}
        </div>
      ) : null}

      {error ? <p className="moderator-error mt-2">{error}</p> : null}

      <div className="mt-3 flex justify-end">
        <button type="button" disabled={busy} onClick={() => void submit()} className="action-chip action-chip-open !px-3.5 !py-2">
          <span className="action-chip-shine" aria-hidden="true" />
          <span>{busy ? "adding..." : "add site"}</span>
        </button>
      </div>
    </div>
  );
}
