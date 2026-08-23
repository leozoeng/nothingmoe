import type { SessionUser } from "./auth-server";

/** Usernames allowed to moderate (delete) any review. */
const MODERATOR_USERNAMES = new Set(["zlzh", "zlzhdev"]);

export function isModerator(user: SessionUser | null | undefined): boolean {
  const username = user?.profile?.username?.trim().toLowerCase();
  if (!username) return false;
  return MODERATOR_USERNAMES.has(username);
}
