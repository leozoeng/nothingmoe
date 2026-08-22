"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  BANNER_MIME_TYPES,
  MAX_BANNER_BYTES,
  MAX_DESCRIPTION_LENGTH,
  MAX_FEATURE_LENGTH,
  MAX_FEATURES,
  MAX_TAGLINE_LENGTH,
  MIN_TAGLINE_LENGTH,
  normalizeFeatureList,
} from "@/lib/site-page-limits";
import type { Site } from "@/lib/sites";

type SiteOwnerPanelProps = {
  site: Site;
  onSaved: (site: Site) => void;
  onClose?: () => void;
};

export function SiteOwnerPanel({ site, onSaved, onClose }: SiteOwnerPanelProps) {
  const [line, setLine] = useState(site.line);
  const [description, setDescription] = useState(site.description ?? "");
  const [bannerUrl, setBannerUrl] = useState(site.banner ?? "");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [started, setStarted] = useState(site.started);
  const [features, setFeatures] = useState(site.featureList.join("\n"));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    return () => {
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    };
  }, [bannerPreview]);

  const pickBanner = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!BANNER_MIME_TYPES.includes(file.type as (typeof BANNER_MIME_TYPES)[number])) {
      setError("Use a jpg, png, webp, gif, or avif");
      return;
    }
    if (file.size > MAX_BANNER_BYTES) {
      setError("Banner must be 50 MB or smaller");
      return;
    }

    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
    setError(null);
    setSaved(false);
  };

  const uploadBanner = async (file: File) => {
    const signRes = await fetch(`/api/site/${encodeURIComponent(site.domain)}/banner`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType: file.type, size: file.size }),
    });
    const signData = (await signRes.json()) as {
      error?: string;
      path?: string;
      token?: string;
      publicUrl?: string;
    };
    if (!signRes.ok || !signData.path || !signData.token || !signData.publicUrl) {
      throw new Error(signData.error ?? "Could not start upload");
    }

    const supabase = createClient();
    const { error: uploadError } = await supabase.storage
      .from("site-banners")
      .uploadToSignedUrl(signData.path, signData.token, file, { contentType: file.type });

    if (uploadError) throw new Error(uploadError.message);
    return signData.publicUrl;
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const trimmedLine = line.trim();
    if (trimmedLine.length < MIN_TAGLINE_LENGTH || trimmedLine.length > MAX_TAGLINE_LENGTH) {
      setError(`Tagline must be ${MIN_TAGLINE_LENGTH}–${MAX_TAGLINE_LENGTH} characters`);
      setSaving(false);
      return;
    }

    const nextFeatures = normalizeFeatureList(features.split("\n"));
    if (nextFeatures.length < 1 || nextFeatures.length > MAX_FEATURES) {
      setError(`Add 1–${MAX_FEATURES} features (one per line)`);
      setSaving(false);
      return;
    }
    if (nextFeatures.some((item) => item.length > MAX_FEATURE_LENGTH)) {
      setError(`Each feature max ${MAX_FEATURE_LENGTH} characters`);
      setSaving(false);
      return;
    }

    try {
      const nextBanner = bannerFile ? await uploadBanner(bannerFile) : bannerUrl.trim() || null;

      const res = await fetch(`/api/site/${encodeURIComponent(site.domain)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          line: trimmedLine,
          description: description.trim(),
          banner_url: nextBanner,
          started: started.trim(),
          feature_list: nextFeatures,
        }),
      });

      const data = (await res.json()) as {
        error?: string;
        page?: {
          line: string | null;
          started: string | null;
          feature_list?: string[] | null;
          pros?: string[] | null;
          banner_url: string | null;
          description: string | null;
        };
      };
      if (!res.ok) throw new Error(data.error ?? "Failed to save");

      const savedFeatures = normalizeFeatureList(
        data.page?.feature_list ?? data.page?.pros ?? nextFeatures,
      );

      const updated: Site = {
        ...site,
        line: data.page?.line?.trim() || site.line,
        started: data.page?.started?.trim() || site.started,
        featureList: savedFeatures.length ? savedFeatures : site.featureList,
        banner: data.page?.banner_url?.trim() || null,
        description: data.page?.description?.trim() || null,
      };

      onSaved(updated);
      setBannerUrl(updated.banner ?? "");
      setBannerFile(null);
      if (bannerPreview) {
        URL.revokeObjectURL(bannerPreview);
        setBannerPreview(null);
      }
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const previewSrc = bannerPreview || bannerUrl || null;

  return (
    <section className="site-page-owner">
      <div className="site-page-owner-head">
        <div>
          <p className="site-page-kicker">owner</p>
          <h2 className="site-page-owner-title">customize your page</h2>
        </div>
        {onClose ? (
          <button type="button" onClick={onClose} className="action-chip action-chip-view">
            <span className="action-chip-shine" aria-hidden="true" />
            <span>close</span>
          </button>
        ) : null}
      </div>

      <form onSubmit={save} className="site-page-owner-form">
        <label className="site-page-field">
          <span>banner</span>
          <input
            type="file"
            accept={BANNER_MIME_TYPES.join(",")}
            onChange={pickBanner}
            className="site-page-file"
          />
          <span className="site-page-file-hint">jpg, png, webp, gif, avif — up to 50 MB</span>
          {previewSrc ? (
            <img src={previewSrc} alt="" className="site-page-file-preview" />
          ) : null}
        </label>

        <label className="site-page-field">
          <span>
            tagline{" "}
            <span className="site-page-field-count">
              {line.length}/{MAX_TAGLINE_LENGTH}
            </span>
          </span>
          <textarea
            value={line}
            onChange={(event) => setLine(event.target.value.slice(0, MAX_TAGLINE_LENGTH))}
            rows={2}
            maxLength={MAX_TAGLINE_LENGTH}
            className="auth-input min-h-[64px] resize-y"
          />
        </label>

        <label className="site-page-field">
          <span>
            description{" "}
            <span className="site-page-field-count">
              {description.length}/{MAX_DESCRIPTION_LENGTH}
            </span>
          </span>
          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value.slice(0, MAX_DESCRIPTION_LENGTH))
            }
            rows={6}
            maxLength={MAX_DESCRIPTION_LENGTH}
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

        <label className="site-page-field">
          <span>
            features (one per line, max {MAX_FEATURES}, {MAX_FEATURE_LENGTH} chars each)
          </span>
          <textarea
            value={features}
            onChange={(event) => setFeatures(event.target.value)}
            rows={6}
            placeholder={"HD streaming\nAniList sync\nSeasonal charts"}
            className="auth-input min-h-[140px] resize-y"
          />
        </label>

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
