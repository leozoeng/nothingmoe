import { isModerator } from "./moderation";
import type { SessionUser } from "./auth-server";
import { adminConfigured, createAdminClient } from "./supabase/admin";

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
