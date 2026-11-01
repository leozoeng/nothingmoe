"use client";

import { useEffect, useState, useCallback } from "react";

type GalleryItem = {
  src: string;
  title: string;
};

const SITE_GALLERY: Record<string, GalleryItem[]> = {
  anipm: [
    { src: "/screenshots/anipm/01-home.jpg", title: "Home & Spotlight" },
    { src: "/screenshots/anipm/02-anime.jpg", title: "Anime Catalog" },
    { src: "/screenshots/anipm/03-watch.jpg", title: "Watch Together & Player" },
  ],
  animex: [
    { src: "/screenshots/animex/01-home.jpg", title: "Home & Trending" },
    { src: "/screenshots/animex/02-anime.jpg", title: "Series Detail" },
    { src: "/screenshots/animex/03-watch.jpg", title: "Episode Player" },
  ],
  anilight: [
    { src: "/screenshots/anilight/01-home.jpg", title: "Home Page" },
    { src: "/screenshots/anilight/02-anime.jpg", title: "Catalog View" },
    { src: "/screenshots/anilight/03-watch.jpg", title: "Streaming View" },
  ],
  anikura: [
    { src: "/screenshots/anikura/01-home.jpg", title: "Home & Feed" },
    { src: "/screenshots/anikura/02-anime.jpg", title: "Episode Stream" },
    { src: "/screenshots/anikura/03-watch.jpg", title: "User Portal" },
  ],
  yumezone: [
    { src: "/screenshots/yumezone/01-home.jpg", title: "Home & Showcase" },
    { src: "/screenshots/yumezone/02-anime.jpg", title: "Watchlist & Browse" },
    { src: "/screenshots/yumezone/03-watch.jpg", title: "Library" },
  ],
  nekowatch: [
    { src: "/screenshots/nekowatch/01-home.jpg", title: "Home & Catalog" },
    { src: "/screenshots/nekowatch/02-anime.jpg", title: "Player & Seasons" },
    { src: "/screenshots/nekowatch/03-watch.jpg", title: "Trending Shows" },
  ],
};

export function SiteGallery({ slug, name }: { slug: string; name: string }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const items = SITE_GALLERY[slug] || [];

  const handleClose = useCallback(() => setActiveIdx(null), []);

  const handlePrev = useCallback(() => {
    setActiveIdx((prev) => (prev !== null ? (prev > 0 ? prev - 1 : items.length - 1) : null));
  }, [items.length]);

  const handleNext = useCallback(() => {
    setActiveIdx((prev) => (prev !== null ? (prev < items.length - 1 ? prev + 1 : 0) : null));
  }, [items.length]);

  useEffect(() => {
    if (activeIdx === null) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIdx, handleClose, handlePrev, handleNext]);

  if (!items.length) return null;

  return (
    <section className="site-gallery-section" aria-label={`${name} screenshots gallery`}>
      <div className="site-gallery-header">
        <p className="site-overview-label">gallery</p>
        <span className="site-gallery-count">{items.length} screenshots</span>
      </div>

      <div className="site-gallery-grid">
        {items.map((item, idx) => (
          <button
            key={item.src}
            type="button"
            className="site-gallery-card group"
            onClick={() => setActiveIdx(idx)}
          >
            <div className="site-gallery-card-thumb">
              <img
                src={item.src}
                alt={`${name} - ${item.title}`}
                loading="lazy"
                className="site-gallery-img"
              />
              <div className="site-gallery-card-hover-scrim" />
              <div className="site-gallery-card-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                </svg>
              </div>
            </div>
            <div className="site-gallery-card-caption">
              <span className="site-gallery-card-title">{item.title}</span>
              <span className="site-gallery-card-action">preview</span>
            </div>
          </button>
        ))}
      </div>

      {activeIdx !== null && items[activeIdx] ? (
        <div
          className="site-gallery-modal"
          role="dialog"
          aria-modal="true"
          aria-label={items[activeIdx].title}
          onClick={handleClose}
        >
          <div className="site-gallery-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="site-gallery-modal-bar">
              <div className="flex items-center gap-2">
                <span className="site-gallery-modal-title">{items[activeIdx].title}</span>
                <span className="site-gallery-modal-site">· {name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="site-gallery-modal-counter">
                  {activeIdx + 1} / {items.length}
                </span>
                <button
                  type="button"
                  onClick={handleClose}
                  className="site-gallery-modal-close"
                  aria-label="Close preview"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="site-gallery-modal-viewport">
              <img
                src={items[activeIdx].src}
                alt={`${name} - ${items[activeIdx].title}`}
                className="site-gallery-modal-img"
              />

              {items.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    className="site-gallery-modal-arrow site-gallery-modal-arrow-left"
                    aria-label="Previous screenshot"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="site-gallery-modal-arrow site-gallery-modal-arrow-right"
                    aria-label="Next screenshot"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
