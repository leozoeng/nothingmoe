"use client";

import { useRef, useState } from "react";

const LINES = ["still nothing.", "you held it. nothing changed.", "ok that was something.", "n."];

export function Hero() {
  const hold = useRef<number | null>(null);
  const [holding, setHolding] = useState(false);
  const [egg, setEgg] = useState(false);
  const [line, setLine] = useState(LINES[0]);

  const triggerEgg = () => {
    setLine(LINES[Math.floor(Math.random() * LINES.length)]);
    setEgg(true);
    setHolding(false);
    window.setTimeout(() => setEgg(false), 2600);
  };

  const startHold = () => {
    if (egg) return;
    if (hold.current) window.clearTimeout(hold.current);
    setHolding(true);
    hold.current = window.setTimeout(() => {
      hold.current = null;
      triggerEgg();
    }, 520);
  };

  const endHold = () => {
    setHolding(false);
    if (hold.current) {
      window.clearTimeout(hold.current);
      hold.current = null;
    }
  };

  return (
    <section className="relative z-10 px-6 pb-12 pt-28 text-center sm:px-10 sm:pb-14 sm:pt-32">
      <button
        type="button"
        aria-label="NothingMoe mark"
        onPointerDown={startHold}
        onPointerUp={endHold}
        onPointerLeave={endHold}
        onPointerCancel={endHold}
        className={`rise relative mx-auto inline-flex border-0 bg-transparent p-0 ${
          holding ? "mark-holding" : ""
        } ${egg ? "mark-egg" : ""}`}
      >
        <span className="pointer-events-none absolute inset-0 -z-10 rounded-[1.4rem] bg-[radial-gradient(circle,rgba(255,183,197,0.28),transparent_68%)] blur-xl" />
        <img
          src="/mark.png"
          alt=""
          width={72}
          height={72}
          draggable={false}
          className="h-[4.5rem] w-[4.5rem] rounded-[1.35rem] shadow-[0_12px_40px_rgba(0,0,0,0.45)] select-none"
        />
        {egg ? (
          <span className="egg-sparkle pointer-events-none absolute -right-1 -top-1 text-[10px] text-[#ffb7c5]">
            ✦
          </span>
        ) : null}
      </button>
      {egg ? (
        <p className="egg-line mt-3 font-sans text-[11px] tracking-[0.2em] text-muted uppercase">
          {line}
        </p>
      ) : null}
      <h1
        className="rise mt-7 px-1 font-display text-[clamp(2.7rem,10vw,5.6rem)] font-bold leading-[1.12] tracking-[-0.045em] text-[#f2f2f2]"
        style={{
          animationDelay: "0.12s",
          textShadow: "0 1px 0 rgba(255,255,255,0.35), 0 12px 40px rgba(0,0,0,0.35)",
          backgroundImage: "linear-gradient(180deg, #ffffff 0%, #e8e8e8 55%, #bdbdbd 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          paddingBottom: "0.12em",
        }}
      >
        NothingMoe
      </h1>
      <p
        className="rise mt-5 font-sans text-[11px] tracking-[0.32em] text-muted uppercase sm:text-xs"
        style={{ animationDelay: "0.28s" }}
      >
        nothing here is dog shit
      </p>
      <p
        className="rise mx-auto mt-4 max-w-md font-sans text-[13px] leading-relaxed text-muted/85"
        style={{ animationDelay: "0.42s" }}
      >
        That shady corner of the internet where the UI actually feels good.
      </p>
    </section>
  );
}
