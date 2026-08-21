"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect, useRef, useState, type ReactNode } from "react";

type Ripple = { id: number; x: number; y: number };

export function Experience({ children }: { children: ReactNode }) {
  const ambient = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let lenis: Lenis | undefined;
    if (!reduce) {
      lenis = new Lenis({
        duration: 1.1,
        smoothWheel: true,
        wheelMultiplier: 0.86,
      });
    }

    let mx = window.innerWidth / 2;
    let my = window.innerHeight * 0.38;
    let ax = mx;
    let ay = my;
    let id = 0;

    const onMove = (event: PointerEvent) => {
      mx = event.clientX;
      my = event.clientY;
    };

    const onClick = (event: PointerEvent) => {
      if (reduce) return;
      const next = { id: Date.now() + Math.random(), x: event.clientX, y: event.clientY };
      setRipples((current) => [...current.slice(-5), next]);
      window.setTimeout(() => {
        setRipples((current) => current.filter((item) => item.id !== next.id));
      }, 1300);
    };

    const tick = (time: number) => {
      lenis?.raf(time);
      ax += (mx - ax) * 0.055;
      ay += (my - ay) * 0.055;

      if (ambient.current) {
        ambient.current.style.setProperty("--ax", `${ax}px`);
        ambient.current.style.setProperty("--ay", `${ay}px`);
      }

      id = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onClick);
    id = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onClick);
      lenis?.destroy();
    };
  }, []);

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden">
      <div ref={ambient} className="ambient" />
      <div className="grain" />
      {ripples.map((ripple) => (
        <span key={ripple.id} className="ripple" style={{ left: ripple.x, top: ripple.y }} />
      ))}
      <div className="relative z-10 flex min-h-dvh flex-col">{children}</div>
    </div>
  );
}
