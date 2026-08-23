"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  computeStats,
  mergeScores,
  SCORE_LABELS,
  type Review,
  type ReviewStats,
} from "@/lib/scores";
import type { Site } from "@/lib/sites";
import { getAnikuraDemoReviews } from "@/lib/demo-reviews";
import { useDemoMode, useOwnerPreview } from "@/lib/demo-mode";
import { isModerator } from "@/lib/moderation";
import { useAuth } from "./auth-provider";
import { SiteOverview } from "./site-overview";
import { SiteOwnerPanel } from "./site-owner-panel";
import { StarDisplay, StarPicker } from "./star-rating";

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
  external = true,
}: {
  href: string;
  label: string;
  variant?: "open" | "discord" | "view";
  external?: boolean;
}) {
  const className = `action-chip ${
    variant === "discord"
      ? "action-chip-discord"
      : variant === "view"
        ? "action-chip-view"
        : "action-chip-open"
  }`;

  const inner = (
    <>
      <span className="action-chip-shine" aria-hidden="true" />
      {variant === "discord" ? <DiscordMark /> : variant === "open" ? <OpenMark /> : null}
      <span>{label}</span>
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={className}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}

function ScoreSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-sans text-[10px] tracking-[0.12em] text-muted uppercase">
          {label}
        </span>
        <span className="font-sans text-[10px] tabular-nums text-chrome/55">{value}</span>
      </div>
      <input
        type="range"
        min={1}
        max={100}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="score-slider w-full"
      />
    </label>
  );
}

function ReviewCard({
  review,
  isOwner,
  canModerate,
  domain,
  onResponded,
}: {
  review: Review;
  isOwner: boolean;
  canModerate: boolean;
  domain: string;
  onResponded: () => void;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyBody, setReplyBody] = useState(review.response?.body ?? "");
  const [replySaving, setReplySaving] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const date = new Date(review.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const submitReply = async (event: React.FormEvent) => {
    event.preventDefault();
    setReplySaving(true);
    setReplyError(null);

    try {
      const res = await fetch(`/api/reviews/response/${review.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyBody }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to post response");
      setReplyOpen(false);
      onResponded();
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : "Failed to post response");
    } finally {
      setReplySaving(false);
    }
  };

  const deleteReview = async () => {
    if (!canModerate || deleting) return;
    const ok = window.confirm("Delete this review? Scores will recalculate.");
    if (!ok) return;

    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/reviews/${encodeURIComponent(domain)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: review.id }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to delete review");
      onResponded();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete review");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <article className="site-review">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="site-review-stars">
            <StarDisplay value={review.stars} size="sm" />
          </span>
          <p className="site-review-author">{review.author}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <time className="font-sans text-[10px] text-faint">{date}</time>
          {canModerate ? (
            <button
              type="button"
              onClick={() => void deleteReview()}
              disabled={deleting}
              className="action-chip action-chip-view !px-2.5 !py-1.5"
            >
              <span className="action-chip-shine" aria-hidden="true" />
              <span>{deleting ? "deleting..." : "delete"}</span>
            </button>
          ) : null}
        </div>
      </div>
      <p className="site-review-body">{review.body}</p>
      {deleteError ? (
        <p className="mt-2 font-sans text-[11px] text-[#ffb7c5]">{deleteError}</p>
      ) : null}
      <div className="site-review-scores">
        {SCORE_LABELS.map(({ key, label }) => (
          <span key={key} className="site-review-score">
            {label} <strong>{review[`score_${key}` as keyof Review] as number}</strong>
          </span>
        ))}
      </div>

      {review.response ? (
        <div className="review-response">
          <p className="review-response-label">owner reply</p>
          <p className="review-response-body">{review.response.body}</p>
        </div>
      ) : null}

      {isOwner ? (
        <div className="mt-4">
          {!replyOpen ? (
            <button
              type="button"
              onClick={() => setReplyOpen(true)}
              className="action-chip action-chip-view"
            >
              <span className="action-chip-shine" aria-hidden="true" />
              <span>{review.response ? "edit reply" : "respond"}</span>
            </button>
          ) : (
            <form onSubmit={submitReply} className="space-y-3">
              <textarea
                value={replyBody}
                onChange={(event) => setReplyBody(event.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="your response..."
                className="auth-input min-h-[80px] resize-y"
              />
              {replyError ? (
                <p className="font-sans text-[11px] text-[#ffb7c5]">{replyError}</p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <button type="submit" disabled={replySaving} className="action-chip action-chip-open">
                  <span className="action-chip-shine" aria-hidden="true" />
                  <span>{replySaving ? "posting..." : "post reply"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReplyOpen(false)}
                  className="action-chip action-chip-view"
                >
                  <span className="action-chip-shine" aria-hidden="true" />
                  <span>cancel</span>
                </button>
              </div>
            </form>
          )}
        </div>
      ) : null}
    </article>
  );
}

export function SiteDetail({ site: initialSite, isOwner }: { site: Site; isOwner: boolean }) {
  const { user, openAuth } = useAuth();
  const demoMode = useDemoMode();
  const ownerPreview = useOwnerPreview();
  const [site, setSite] = useState(initialSite);
  const canEdit = isOwner || ownerPreview;
  const canModerate = isModerator(user);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const isAnikuraDemo = demoMode && site.domain === "anikura.club";
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>(() => computeStats([]));
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stars, setStars] = useState(0);
  const [scoreUi, setScoreUi] = useState(50);
  const [scoreUx, setScoreUx] = useState(50);
  const [scoreCatalog, setScoreCatalog] = useState(50);
  const [scoreFeatures, setScoreFeatures] = useState(50);
  const [body, setBody] = useState("");

  const displayScores = mergeScores(site.seed, stats);
  const displayStars = stats.avgStars ?? null;
  const visibleReviews =
    canModerate || !userReview
      ? reviews
      : reviews.filter((review) => review.id !== userReview.id);

  const loadReviews = useCallback(async () => {
    if (isAnikuraDemo) {
      const data = getAnikuraDemoReviews();
      setReviews(data.reviews);
      setStats(data.stats);
      setUserReview(data.userReview);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/${encodeURIComponent(site.domain)}`);
      if (!res.ok) throw new Error("Failed to load reviews");
      const data = (await res.json()) as {
        reviews: Review[];
        stats: ReviewStats;
        userReview: Review | null;
      };
      setReviews(data.reviews);
      setStats(data.stats);
      setUserReview(data.userReview);
      setError(null);
    } catch {
      setError("Could not load reviews.");
    } finally {
      setLoading(false);
    }
  }, [site.domain, isAnikuraDemo]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    if (ownerPreview) setCustomizeOpen(true);
  }, [ownerPreview]);

  useEffect(() => {
    if (!userReview) return;
    setStars(userReview.stars);
    setScoreUi(userReview.score_ui);
    setScoreUx(userReview.score_ux);
    setScoreCatalog(userReview.score_catalog);
    setScoreFeatures(userReview.score_features);
    setBody(userReview.body);
  }, [userReview]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      openAuth("sign-in");
      return;
    }

    if (isAnikuraDemo) {
      setError("preview mode — reviews aren't saved. sign up for real to post.");
      return;
    }

    if (stars < 1 || stars > 5) {
      setError("Pick a star rating from 1 to 5");
      return;
    }

    const trimmedBody = body.trim();
    if (trimmedBody.length < 3) {
      setError("Review needs at least 3 characters");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/reviews/${encodeURIComponent(site.domain)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stars,
          score_ui: scoreUi,
          score_ux: scoreUx,
          score_catalog: scoreCatalog,
          score_features: scoreFeatures,
          body: trimmedBody,
        }),
      });

      const data = (await res.json()) as {
        reviews?: Review[];
        stats?: ReviewStats;
        userReview?: Review | null;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to save review");
      }

      setReviews(data.reviews ?? []);
      setStats(data.stats ?? computeStats([]));
      setUserReview(data.userReview ?? null);
      setBody(trimmedBody);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="site-page">
      <header className="site-page-hero">
        <div className="site-page-banner" aria-hidden="true">
          {site.banner ? (
            <img src={site.banner} alt="" className="site-page-banner-img" />
          ) : (
            <div
              className="site-page-banner-fallback"
              style={{ backgroundImage: `url(${site.icon})` }}
            />
          )}
          <div className="site-page-banner-scrim" />
        </div>

        <div className="site-page-hero-bar">
          <Link href="/#sites" className="site-page-back">
            ← index
          </Link>
        </div>
      </header>

      <div className="site-page-hero-panel">
        <div className="site-page-hero-row">
          <img src={site.icon} alt="" width={100} height={100} className="site-page-icon" />
          <div className="min-w-0">
            <h1 className="site-page-title">{site.name}</h1>
            <div className="site-page-meta-row">
              <span className="site-page-domain">{site.domain}</span>
              <span className="site-page-meta-dot" aria-hidden="true" />
              <span className="site-page-meta">est. {site.started}</span>
            </div>
          </div>
          <div className="site-page-actions">
            {canEdit ? (
              <button
                type="button"
                onClick={() => setCustomizeOpen((value) => !value)}
                className="action-chip action-chip-view"
              >
                <span className="action-chip-shine" aria-hidden="true" />
                <span>{customizeOpen ? "close" : "customize page"}</span>
              </button>
            ) : null}
            <ActionChip href={site.href} label="open" variant="open" />
            {site.discord ? (
              <ActionChip href={site.discord} label="discord" variant="discord" />
            ) : null}
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

        <SiteOverview
          scores={displayScores}
          stats={stats}
          displayStars={displayStars}
          featureList={site.featureList}
        />

        {canEdit && customizeOpen ? (
          <div className="site-page-main">
            <div className="site-page-content">
              <SiteOwnerPanel
                site={site}
                onSaved={setSite}
                onClose={() => setCustomizeOpen(false)}
              />
            </div>
          </div>
        ) : null}

        <section className="site-page-reviews">
          {isAnikuraDemo ? (
            <p className="site-page-demo-note">
              preview mode — signed in as {user?.profile?.display_name ?? "you"} · try the review
              form below
            </p>
          ) : null}

          <div className="site-page-reviews-head">
            <div>
              <h2 className="site-page-section-title">reviews</h2>
              <p className="site-page-section-sub">
                {stats.count > 0
                  ? `${stats.count} from the community`
                  : "be the first to weigh in"}
              </p>
            </div>
          </div>

          <div className="site-page-review-compose">
            <p className="site-page-kicker">
              {user && userReview ? "edit your review" : "write a review"}
            </p>

            {!user ? (
              <div className="site-page-review-form">
                <p className="site-page-empty">sign in to rate {site.name}.</p>
                <button
                  type="button"
                  onClick={() => openAuth("sign-in")}
                  className="action-chip action-chip-open"
                >
                  <span className="action-chip-shine" aria-hidden="true" />
                  <span>sign in to review</span>
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="site-page-review-form">
                <StarPicker value={stars} onChange={setStars} />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <ScoreSlider label="ui" value={scoreUi} onChange={setScoreUi} />
                  <ScoreSlider label="ux" value={scoreUx} onChange={setScoreUx} />
                  <ScoreSlider label="catalog" value={scoreCatalog} onChange={setScoreCatalog} />
                  <ScoreSlider label="features" value={scoreFeatures} onChange={setScoreFeatures} />
                </div>

                <label className="site-page-field">
                  <span>review</span>
                  <textarea
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    rows={4}
                    maxLength={2000}
                    placeholder="what hits, what misses..."
                    className="auth-input min-h-[100px] resize-y"
                  />
                </label>

                {error ? <p className="site-page-error">{error}</p> : null}

                <div className="flex flex-wrap gap-2">
                  <button type="submit" disabled={submitting} className="action-chip action-chip-open">
                    <span className="action-chip-shine" aria-hidden="true" />
                    <span>
                      {submitting
                        ? userReview
                          ? "updating..."
                          : "posting..."
                        : userReview
                          ? "update review"
                          : "post review"}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {loading ? (
            <p className="site-page-empty mt-2">loading...</p>
          ) : visibleReviews.length > 0 ? (
            <div className="site-page-review-list">
              {visibleReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  isOwner={canEdit}
                  canModerate={canModerate}
                  domain={site.domain}
                  onResponded={() => void loadReviews()}
                />
              ))}
            </div>
          ) : (
            <p className="site-page-empty mt-2">nothing yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}

export { ActionChip };
