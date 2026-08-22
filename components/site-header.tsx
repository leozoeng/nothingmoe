"use client";

import { UserMenu } from "./user-menu";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a href="/" className="site-header-brand">
          <img src="/mark.png" alt="" width={28} height={28} className="h-7 w-7 rounded-[9px]" />
          <span className="font-display text-[15px] font-bold tracking-[-0.04em] text-chrome">
            NothingMoe.com
          </span>
        </a>
        <UserMenu />
      </div>
    </header>
  );
}
