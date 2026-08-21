"use client";

export function SiteHeader() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center px-6 py-5 sm:px-10">
      <a href="/" className="pointer-events-auto flex items-center gap-2.5">
        <img
          src="/mark.png"
          alt=""
          width={28}
          height={28}
          className="h-7 w-7 rounded-[9px]"
        />
        <span className="font-display text-[15px] font-bold tracking-[-0.04em] text-chrome">
          NothingMoe.com
        </span>
      </a>
    </header>
  );
}
