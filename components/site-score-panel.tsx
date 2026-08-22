"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatStars,
  scoreColors,
  SCORE_LABELS,
  type ReviewStats,
  type Scores,
} from "@/lib/scores";
import { StarDisplay } from "./star-rating";

function ScoreRing({
  value,
  active,
  color,
  size = "md",
}: {
  value: number;
  active: boolean;
  color: string;
  size?: "md" | "sm";
}) {
  const radius = size === "sm" ? 36 : 54;
  const stroke = size === "sm" ? 3 : 4;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference - (active ? (value / 100) * circumference : 0);

  return (
    <div
      className={`score-panel-ring ${size === "sm" ? "score-panel-ring-sm" : ""}`}
      aria-hidden="true"
    >
      <svg width={radius * 2} height={radius * 2} viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
        <circle
          className="score-panel-ring-track"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          className="score-panel-ring-fill"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <span
        className={`score-panel-ring-value ${size === "sm" ? "score-panel-ring-value-sm" : ""}`}
        style={{ color }}
      >
        {value}
      </span>
    </div>
  );
}

function ScoreMetersBlock({
  scores,
  mounted,
  hovered,
  setHovered,
  compact,
}: {
  scores: Scores;
  mounted: boolean;
  hovered: keyof Scores | null;
  setHovered: (key: keyof Scores | null) => void;
  compact?: boolean;
}) {
  return (
    <div className={`score-panel-meters ${compact ? "score-panel-meters-compact" : ""}`}>
      {SCORE_LABELS.map(({ key, label: itemLabel }, index) => {
        const value = scores[key];
        const isHovered = hovered === key;

        return (
          <button
            key={key}
            type="button"
            className={`score-row ${compact ? "score-row-compact" : ""} ${isHovered ? "is-hovered" : ""}`}
            style={{ transitionDelay: `${index * 70}ms` }}
            onMouseEnter={() => setHovered(key)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(key)}
            onBlur={() => setHovered(null)}
            onClick={() => setHovered(key)}
          >
            <span className="score-row-label">{itemLabel}</span>
            <div className="score-row-track">
              <div
                className="score-row-fill"
                style={{
                  width: mounted ? `${value}%` : "0%",
                  transitionDelay: `${100 + index * 70}ms`,
                }}
              />
            </div>
            <span className="score-row-value">{value}</span>
          </button>
        );
      })}
    </div>
  );
}

export function SiteScorePanel({
  scores,
  stats,
  displayStars,
  compact = false,
}: {
  scores: Scores;
  stats: ReviewStats;
  displayStars: number | null;
  compact?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState<keyof Scores | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 80);
    return () => window.clearTimeout(timer);
  }, []);

  const avgScore = useMemo(() => {
    const sum = scores.ui + scores.ux + scores.catalog + scores.features;
    return Math.round(sum / 4);
  }, [scores]);

  const activeValue = hovered ? scores[hovered] : avgScore;
  const activeColors = scoreColors(activeValue);
  const activeLabel = hovered
    ? SCORE_LABELS.find((item) => item.key === hovered)?.label
    : "overall";
  const label = "community census";

  if (compact) {
    return (
      <div className="site-overview-col site-overview-scores">
        <p className="site-overview-label">{label}</p>
        <div
          className={`score-block ${mounted ? "score-block-ready" : ""}`}
          aria-label="Community census"
        >
          <div className="score-block-ring">
            <ScoreRing value={activeValue} active={mounted} color={activeColors.ring} size="sm" />
            <p className="score-block-ring-label">{activeLabel}</p>
          </div>
          <ScoreMetersBlock
            scores={scores}
            mounted={mounted}
            hovered={hovered}
            setHovered={setHovered}
            compact
          />
        </div>
      </div>
    );
  }

  return (
    <section
      className={`score-panel ${mounted ? "score-panel-ready" : ""}`}
      aria-label="Community census"
    >
      <div className="score-panel-summary">
        <p className="score-panel-kicker">{label}</p>
        <div className="score-panel-rating-block">
          {displayStars !== null ? (
            <>
              <span className="score-panel-stars-value">{formatStars(displayStars)}</span>
              <StarDisplay value={displayStars} />
              <p className="score-panel-meta">
                {stats.count} review{stats.count === 1 ? "" : "s"}
              </p>
            </>
          ) : (
            <>
              <span className="score-panel-stars-value score-panel-stars-empty">—</span>
              <p className="score-panel-meta">no star reviews yet</p>
            </>
          )}
        </div>
        <div className="score-panel-overall">
          <ScoreRing value={activeValue} active={mounted} color={activeColors.ring} />
          <p className="score-panel-overall-label">{activeLabel}</p>
        </div>
      </div>
      <ScoreMetersBlock
        scores={scores}
        mounted={mounted}
        hovered={hovered}
        setHovered={setHovered}
      />
    </section>
  );
}
