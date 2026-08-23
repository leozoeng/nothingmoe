import type { SessionUser } from "./auth-server";

/** Usernames allowed to moderate reviews and accounts. */
const MODERATOR_USERNAMES = new Set(["zlzh", "zlzhdev"]);

export function isModerator(user: SessionUser | null | undefined): boolean {
  const username = user?.profile?.username?.trim().toLowerCase();
  if (!username) return false;
  return MODERATOR_USERNAMES.has(username);
}

export const REVIEW_HONESTY_NOTICE =
  "Your scores shape this site's community census — rate from real use, and be honest. Fake reviews, review bombing, or deliberately inflating (or tanking) a site's standing will get your account permanently banned.";
