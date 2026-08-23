import { isModerator } from "./moderation";
import type { SessionUser } from "./auth-server";
import type { Scores } from "./sites";
import { adminConfigured, createAdminClient } from "./supabase/admin";

const DOMAIN_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type AddSitePayload = {
  slug: string;
  name: string;
  domain: string;
  href: string;
  icon: string;
  reason: string;
  line: string;
  started: string;
  discord?: string;
  seed?: Partial<Scores>;
  ownerUserId?: string;
};

function normalizeDomain(value: string) {
  return value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
}

function clampSeed(value: number | undefined, fallback: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.min(100, Math.max(1, Math.round(value)));
}

export async function assertNotBanned(userId: string) {
  if (!adminConfigured()) return;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("nothingmoe_profiles")
    .select("banned_at, banned_reason")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (data?.banned_at) {
    throw new Error(
      data.banned_reason?.trim() || "Your account is banned from posting reviews.",
    );
  }
}

export async function banUserAsModerator(
  moderator: SessionUser,
  targetUserId: string,
  reason?: string,
) {
  if (!isModerator(moderator)) {
    throw new Error("Not allowed");
  }
  if (targetUserId === moderator.id) {
    throw new Error("You cannot ban yourself");
  }
  if (!adminConfigured()) {
    throw new Error("Admin client is not configured");
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("nothingmoe_profiles")
    .update({
      banned_at: new Date().toISOString(),
      banned_reason:
        reason?.trim() ||
        "Banned for review abuse (fake scores / reputation manipulation).",
    })
    .eq("id", targetUserId)
    .select("id")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("User not found");
}

export async function deleteUserAsModerator(moderator: SessionUser, targetUserId: string) {
  if (!isModerator(moderator)) {
    throw new Error("Not allowed");
  }
  if (targetUserId === moderator.id) {
    throw new Error("You cannot delete your own account this way");
  }
  if (!adminConfigured()) {
    throw new Error("Admin client is not configured");
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(targetUserId);
  if (error) throw new Error(error.message);
}

export async function searchProfilesAsModerator(
  moderator: SessionUser,
  query: string,
  limit = 8,
) {
  if (!isModerator(moderator)) {
    throw new Error("Not allowed");
  }
  if (!adminConfigured()) {
    throw new Error("Admin client is not configured");
  }

  const safe = query.replace(/[^a-zA-Z0-9_ ]/g, "").trim();
  if (safe.length < 2) return [];

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("nothingmoe_profiles")
    .select("id, username, display_name")
    .ilike("username", `${safe}%`)
    .order("username", { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function addSiteAsModerator(moderator: SessionUser, payload: AddSitePayload) {
  if (!isModerator(moderator)) {
    throw new Error("Not allowed");
  }
  if (!adminConfigured()) {
    throw new Error("Admin client is not configured");
  }

  const slug = payload.slug.trim().toLowerCase();
  const name = payload.name.trim();
  const domain = normalizeDomain(payload.domain);
  const href = payload.href.trim();
  const icon = payload.icon.trim();
  const reason = payload.reason.trim();
  const line = payload.line.trim();
  const started = payload.started.trim();
  const discord = payload.discord?.trim() || null;

  if (!SLUG_RE.test(slug) || slug.length > 48) {
    throw new Error("Invalid slug");
  }
  if (!name || name.length > 64) {
    throw new Error("Invalid site name");
  }
  if (!DOMAIN_RE.test(domain) || domain.length > 253) {
    throw new Error("Invalid domain");
  }
  if (!href.startsWith("https://") || href.length > 512) {
    throw new Error("Site URL must start with https://");
  }
  if (!icon || icon.length > 512) {
    throw new Error("Icon URL is required");
  }
  if (!reason || reason.length > 80) {
    throw new Error("Invalid reason");
  }
  if (!line || line.length > 180) {
    throw new Error("Invalid tagline");
  }
  if (!started || started.length > 32) {
    throw new Error("Invalid started year");
  }
  if (discord && (!discord.startsWith("https://") || discord.length > 512)) {
    throw new Error("Discord URL must start with https://");
  }

  const admin = createAdminClient();
  const { data: lastSite } = await admin
    .from("nothingmoe_sites")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sortOrder = (lastSite?.sort_order ?? 0) + 1;
  const seed = payload.seed ?? {};

  const { error: insertError } = await admin.from("nothingmoe_sites").insert({
    domain,
    slug,
    name,
    href,
    discord,
    icon,
    category: "japanese",
    reason,
    line,
    started,
    seed_ui: clampSeed(seed.ui, 80),
    seed_ux: clampSeed(seed.ux, 80),
    seed_catalog: clampSeed(seed.catalog, 80),
    seed_features: clampSeed(seed.features, 80),
    sort_order: sortOrder,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      throw new Error("A site with that domain or slug already exists");
    }
    throw new Error(insertError.message);
  }

  if (payload.ownerUserId) {
    const { data: ownerProfile } = await admin
      .from("nothingmoe_profiles")
      .select("id")
      .eq("id", payload.ownerUserId)
      .maybeSingle();

    if (!ownerProfile) {
      throw new Error("Owner account not found");
    }

    const { error: ownerError } = await admin.from("nothingmoe_site_owners").insert({
      user_id: payload.ownerUserId,
      site_domain: domain,
    });

    if (ownerError) throw new Error(ownerError.message);
  }

  return { domain, slug, sortOrder };
}

export async function reorderSiteAsModerator(
  moderator: SessionUser,
  domain: string,
  direction: "up" | "down",
) {
  if (!isModerator(moderator)) {
    throw new Error("Not allowed");
  }
  if (!adminConfigured()) {
    throw new Error("Admin client is not configured");
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("nothingmoe_sites")
    .select("domain, sort_order")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const index = rows.findIndex((row) => row.domain === domain);
  if (index === -1) {
    throw new Error("Site not found");
  }

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= rows.length) {
    throw new Error(direction === "up" ? "Already at the top" : "Already at the bottom");
  }

  const next = [...rows];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];

  const updates = next
    .map((row, i) => ({ domain: row.domain, sort_order: i + 1 }))
    .filter((row, i) => next[i].sort_order !== row.sort_order);

  // Unique sort_order requires a temp pass so swaps don't collide mid-update.
  for (let i = 0; i < updates.length; i += 1) {
    const { error: tempError } = await admin
      .from("nothingmoe_sites")
      .update({ sort_order: -(1000 + i) })
      .eq("domain", updates[i].domain);

    if (tempError) throw new Error(tempError.message);
  }

  for (const update of updates) {
    const { error: updateError } = await admin
      .from("nothingmoe_sites")
      .update({ sort_order: update.sort_order })
      .eq("domain", update.domain);

    if (updateError) throw new Error(updateError.message);
  }

  return { domain, sortOrder: targetIndex + 1 };
}

export type SiteOwnerRow = {
  domain: string;
  name: string;
  slug: string;
  owner: {
    userId: string;
    username: string;
    displayName: string;
  } | null;
};

export async function listSiteOwnersAsModerator(moderator: SessionUser): Promise<SiteOwnerRow[]> {
  if (!isModerator(moderator)) {
    throw new Error("Not allowed");
  }
  if (!adminConfigured()) {
    throw new Error("Admin client is not configured");
  }

  const admin = createAdminClient();
  const [{ data: sites, error: sitesError }, { data: owners, error: ownersError }] =
    await Promise.all([
      admin.from("nothingmoe_sites").select("domain, name, slug").order("sort_order", { ascending: true }),
      admin
        .from("nothingmoe_site_owners")
        .select("site_domain, user_id, nothingmoe_profiles(username, display_name)"),
    ]);

  if (sitesError) throw new Error(sitesError.message);
  if (ownersError) throw new Error(ownersError.message);

  const ownerByDomain = new Map<string, SiteOwnerRow["owner"]>();
  for (const row of owners ?? []) {
    const profile = Array.isArray(row.nothingmoe_profiles)
      ? row.nothingmoe_profiles[0]
      : row.nothingmoe_profiles;

    if (!profile || ownerByDomain.has(row.site_domain)) continue;

    ownerByDomain.set(row.site_domain, {
      userId: row.user_id,
      username: profile.username,
      displayName: profile.display_name,
    });
  }

  return (sites ?? []).map((site) => ({
    domain: site.domain,
    name: site.name,
    slug: site.slug,
    owner: ownerByDomain.get(site.domain) ?? null,
  }));
}

export async function assignSiteOwnerAsModerator(
  moderator: SessionUser,
  domain: string,
  ownerUserId: string,
) {
  if (!isModerator(moderator)) {
    throw new Error("Not allowed");
  }
  if (!adminConfigured()) {
    throw new Error("Admin client is not configured");
  }

  const siteDomain = domain.trim().toLowerCase();
  const userId = ownerUserId.trim();
  if (!siteDomain || !userId) {
    throw new Error("Site and owner are required");
  }

  const admin = createAdminClient();
  const [{ data: site }, { data: profile }] = await Promise.all([
    admin.from("nothingmoe_sites").select("domain").eq("domain", siteDomain).maybeSingle(),
    admin.from("nothingmoe_profiles").select("id, username, display_name").eq("id", userId).maybeSingle(),
  ]);

  if (!site) throw new Error("Site not found");
  if (!profile) throw new Error("Owner account not found");

  const { error: clearError } = await admin
    .from("nothingmoe_site_owners")
    .delete()
    .eq("site_domain", siteDomain);

  if (clearError) throw new Error(clearError.message);

  const { error: insertError } = await admin.from("nothingmoe_site_owners").insert({
    user_id: userId,
    site_domain: siteDomain,
  });

  if (insertError) throw new Error(insertError.message);

  return {
    domain: siteDomain,
    owner: {
      userId: profile.id,
      username: profile.username,
      displayName: profile.display_name,
    },
  };
}
