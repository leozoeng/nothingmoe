import { createClient } from "./supabase/server";

export type UserProfile = {
  id: string;
  username: string;
  display_name: string;
  banned_at: string | null;
  banned_reason: string | null;
};

export type SessionUser = {
  id: string;
  email: string;
  profile: UserProfile | null;
  ownedSites: string[];
};

export function isUserBanned(user: SessionUser | null | undefined): boolean {
  return Boolean(user?.profile?.banned_at);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: owners }] = await Promise.all([
    supabase
      .from("nothingmoe_profiles")
      .select("id, username, display_name, banned_at, banned_reason")
      .eq("id", user.id)
      .maybeSingle(),
    supabase.from("nothingmoe_site_owners").select("site_domain").eq("user_id", user.id),
  ]);

  return {
    id: user.id,
    email: user.email ?? "",
    profile: profile
      ? {
          id: profile.id,
          username: profile.username,
          display_name: profile.display_name,
          banned_at: profile.banned_at ?? null,
          banned_reason: profile.banned_reason ?? null,
        }
      : null,
    ownedSites: (owners ?? []).map((row) => row.site_domain),
  };
}

export async function isSiteOwner(userId: string, domain: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("nothingmoe_site_owners")
    .select("site_domain")
    .eq("user_id", userId)
    .eq("site_domain", domain)
    .maybeSingle();

  return Boolean(data);
}
