export function Hero() {
  return (
    <section className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="relative flex h-[min(58vw,20rem)] w-[min(58vw,20rem)] items-center justify-center">
        <svg
          className="enso pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <circle cx="50" cy="50" r="36" pathLength="100" transform="rotate(-24 50 50)" />
        </svg>
        <p className="mu font-jp text-4xl text-paper/80 sm:text-5xl" aria-hidden="true">
          無
        </p>
      </div>

      <h1
        className="rise font-display text-[clamp(2.6rem,8vw,6.4rem)] font-normal leading-none tracking-[0.08em] text-paper"
        style={{ animationDelay: "0.7s" }}
      >
        nothingmoe
      </h1>
      <p
        className="rise mt-6 font-sans text-[11px] tracking-[0.42em] text-muted uppercase sm:text-xs"
        style={{ animationDelay: "1.05s" }}
      >
        nothinghereisdarkshit
      </p>

      <a
        href="#garden"
        data-cursor="hover"
        className="rise group mt-14 flex flex-col items-center gap-3 text-muted"
        style={{ animationDelay: "1.5s" }}
      >
        <span className="font-sans text-[10px] tracking-[0.38em] uppercase">enter</span>
        <span className="h-10 w-px origin-top bg-faint transition-transform duration-700 group-hover:scale-y-125" />
      </a>
    </section>
  );
}
