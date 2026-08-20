"use client";

import { useCallback, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { kinds, sites, type Site } from "@/lib/sites";
import { Reveal } from "./reveal";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function SiteRow({ site, index }: { site: Site; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });

  const onMove = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    setPos({
      x: (event.clientX - box.left) / box.width,
      y: (event.clientY - box.top) / box.height,
    });
  }, []);

  const kind = kinds[site.kind];

  return (
    <a
      ref={ref}
      href={site.href}
      target="_blank"
      rel="noreferrer noopener"
      data-cursor="hover"
      onMouseMove={onMove}
      className="row group grid-cols-[auto_1fr_auto] items-baseline gap-x-6 gap-y-3 border-t border-line px-1 py-8 sm:grid-cols-[3.5rem_1fr_auto_auto] sm:px-2 sm:py-10"
      style={{ "--mx": pos.x, "--my": pos.y } as CSSProperties}
    >
      <span className="wash" />
      <span className="font-sans text-[11px] tracking-[0.28em] text-muted">{pad(index + 1)}</span>
      <div className="min-w-0">
        <div className="flex items-baseline gap-3">
          <h3 className="font-display text-[clamp(1.8rem,4.4vw,3.15rem)] font-normal leading-none tracking-[0.04em] transition-colors duration-700 group-hover:text-gold">
            {site.name}
          </h3>
          <span className="font-jp text-lg text-muted/80">{site.jp}</span>
        </div>
        <p className="mt-3 font-sans text-[12px] tracking-[0.18em] text-muted sm:text-[13px]">
          {site.line}
        </p>
      </div>
      <p className="hidden font-sans text-[11px] tracking-[0.22em] text-muted sm:block">
        {kind.jp} · {kind.label}
      </p>
      <p className="flex items-center gap-3 justify-self-end font-sans text-[11px] tracking-[0.16em] text-paper/70">
        <span className="hidden sm:inline">{site.domain}</span>
        <span className="arrow text-gold">→</span>
      </p>
    </a>
  );
}

export function Garden() {
  return (
    <section id="garden" className="relative z-10 px-6 pb-8 pt-4 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="mb-16 flex items-end justify-between gap-6">
            <div>
              <p className="font-jp text-sm tracking-[0.45em] text-muted">庭</p>
              <h2 className="mt-3 font-display text-4xl tracking-[0.12em] sm:text-5xl">founders</h2>
            </div>
            <p className="max-w-[16rem] text-right font-sans text-[11px] leading-relaxed tracking-[0.14em] text-muted">
              Three rooms to begin. More will be placed, slowly.
            </p>
          </div>
        </Reveal>

        <div className="border-b border-line">
          {sites.map((site, index) => (
            <Reveal key={site.domain} delay={index * 90}>
              <SiteRow site={site} index={index} />
            </Reveal>
          ))}
          <Reveal delay={280}>
            <div className="grid grid-cols-[auto_1fr_auto] items-baseline gap-x-6 px-1 py-8 text-muted sm:grid-cols-[3.5rem_1fr_auto] sm:px-2 sm:py-10">
              <span className="font-sans text-[11px] tracking-[0.28em]">{pad(sites.length + 1)}</span>
              <div>
                <p className="font-display text-[clamp(1.5rem,3.6vw,2.4rem)] leading-none tracking-[0.06em] text-paper/35">
                  cinema
                </p>
                <p className="mt-3 font-sans text-[12px] tracking-[0.18em]">A quieter room, in time.</p>
              </div>
              <span className="font-sans text-[11px] tracking-[0.22em]">soon</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
