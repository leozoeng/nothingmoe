"use client";

import { useAuth } from "./auth-provider";

export function UserMenu() {
  const { user, loading, configured, openAuth, signOut } = useAuth();

  if (!configured) return null;

  return (
    <div className="site-header-actions flex items-center gap-2">
      {loading ? (
        <span className="font-sans text-[10px] tracking-[0.14em] text-faint">...</span>
      ) : user ? (
        <>
          <span className="hidden font-sans text-[10px] tracking-[0.08em] text-muted sm:inline">
            {user.profile?.display_name ?? user.email}
          </span>
          {user.ownedSites.length > 0 ? (
            <span className="rounded-full border border-white/12 bg-white/[0.04] px-2 py-1 font-sans text-[8px] tracking-[0.16em] text-chrome/70 uppercase">
              owner
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => void signOut()}
            className="action-chip action-chip-view !px-3 !py-2"
          >
            <span className="action-chip-shine" aria-hidden="true" />
            <span>sign out</span>
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => openAuth("sign-in")}
          className="action-chip action-chip-open !px-3.5 !py-2"
        >
          <span className="action-chip-shine" aria-hidden="true" />
          <span>account</span>
        </button>
      )}
    </div>
  );
}
