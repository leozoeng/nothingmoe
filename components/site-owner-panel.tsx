"use client";

import { useState } from "react";
import type { Site } from "@/lib/sites";

type SiteOwnerPanelProps = {
  site: Site;
  onSaved: (site: Site) => void;
};

export function SiteOwnerPanel({ site, onSaved }: SiteOwnerPanelProps) {
  const [open, setOpen] = useState(false);
  const [line, setLine] = useState(site.line);
  const [description, setDescription] = useState(site.description ?? "");
  const [bannerUrl, setBannerUrl] = useState(site.banner ?? "");
  const [started, setStarted] = useState(site.started);
  const [pros, setPros] = useState(site.pros.join("\n"));
  const [cons, setCons] = useState(site.cons.join("\n"));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch(`/api/site/${encodeURIComponent(site.domain)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          line: line.trim(),
          description: description.trim(),
          banner_url: bannerUrl.trim() || null,
          started: started.trim(),
          pros: pros.split("\n").map((item) => item.trim()).filter(Boolean),
          cons: cons.split("\n").map((item) => item.trim()).filter(Boolean),
        }),
      });

      const data = (await res.json()) as {
        error?: string;
        page?: {
          line: string | null;
          started: string | null;
          pros: string[] | null;
          cons: string[] | null;
          banner_url: string | null;
          description: string | null;
        };
      };
      if (!res.ok) throw new Error(data.error ?? "Failed to save");

      const updated: Site = {
        ...site,
        line: data.page?.line?.trim() || site.line,
        started: data.page?.started?.trim() || site.started,
        pros: data.page?.pros?.length ? data.page.pros : site.pros,
        cons: data.page?.cons?.length ? data.page.cons : site.cons,
        banner: data.page?.banner_url?.trim() || null,
        description: data.page?.description?.trim() || null,
      };

      onSaved(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <div className="site-page-owner-trigger">
        <button type="button" onClick={() => setOpen(true)} className="action-chip action-chip-view">
          <span className="action-chip-shine" aria-hidden="true" />
          <span>customize page</span>
        </button>
      </div>
    );
  }

  return (
    <section className="site-page-owner">
      <div className="site-page-owner-head">
        <div>
          <p className="site-page-kicker">owner</p>
          <h2 className="site-page-owner-title">customize your page</h2>
        </div>
        <button type="button" onClick={() => setOpen(false)} className="action-chip action-chip-view">
          <span className="action-chip-shine" aria-hidden="true" />
          <span>close</span>
        </button>
      </div>

      <form onSubmit={save} className="site-page-owner-form">
        <label className="site-page-field">
          <span>banner image url</span>
          <input
            value={bannerUrl}
            onChange={(event) => setBannerUrl(event.target.value)}
            placeholder="https://..."
            className="auth-input"
          />
        </label>

        <label className="site-page-field">
          <span>tagline</span>
          <textarea
            value={line}
            onChange={(event) => setLine(event.target.value)}
            rows={2}
            className="auth-input min-h-[64px] resize-y"
          />
        </label>

        <label className="site-page-field">
          <span>description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={6}
            placeholder="tell people what makes your site different..."
            className="auth-input min-h-[140px] resize-y"
          />
        </label>

        <label className="site-page-field">
          <span>started</span>
          <input
            value={started}
            onChange={(event) => setStarted(event.target.value)}
            className="auth-input"
          />
        </label>

        <div className="site-page-owner-grid">
          <label className="site-page-field">
            <span>pros (one per line)</span>
            <textarea
              value={pros}
              onChange={(event) => setPros(event.target.value)}
              rows={5}
              className="auth-input min-h-[120px] resize-y"
            />
          </label>
          <label className="site-page-field">
            <span>cons (one per line)</span>
            <textarea
              value={cons}
              onChange={(event) => setCons(event.target.value)}
              rows={5}
              className="auth-input min-h-[120px] resize-y"
            />
          </label>
        </div>

        {error ? <p className="site-page-error">{error}</p> : null}
        {saved ? <p className="site-page-saved">saved.</p> : null}

        <button type="submit" disabled={saving} className="action-chip action-chip-open">
          <span className="action-chip-shine" aria-hidden="true" />
          <span>{saving ? "saving..." : "save changes"}</span>
        </button>
      </form>
    </section>
  );
}
