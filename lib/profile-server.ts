import { createClient } from "./supabase/server";
import { adminConfigured, createAdminClient } from "./supabase/admin";
import {
  BANNER_MIME_TYPES,
  MAX_BANNER_BYTES,
  bannerExtForType,
} from "./site-page-limits";

const MAX_DISPLAY_NAME = 32;
const MIN_DISPLAY_NAME = 2;

export async function updateProfileDisplayName(userId: string, displayName: string) {
  const trimmed = displayName.trim();
  if (trimmed.length < MIN_DISPLAY_NAME || trimmed.length > MAX_DISPLAY_NAME) {
    throw new Error(`Display name must be ${MIN_DISPLAY_NAME}-${MAX_DISPLAY_NAME} characters`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("nothingmoe_profiles")
    .update({ display_name: trimmed })
    .eq("id", userId)
    .select("id, username, display_name, avatar_url, banned_at, banned_reason")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createAvatarUpload(userId: string, contentType: string, size: number) {
  if (!adminConfigured()) {
    throw new Error("Uploads are not configured");
  }

  const ext = bannerExtForType(contentType);
  if (!BANNER_MIME_TYPES.includes(contentType as (typeof BANNER_MIME_TYPES)[number]) || !ext) {
    throw new Error("Use a jpg, png, webp, gif, or avif");
  }

  if (size <= 0 || size > MAX_BANNER_BYTES) {
    throw new Error("Image must be 50 MB or smaller");
  }

  const admin = createAdminClient();
  const path = `${userId}/avatar-${Date.now()}.${ext}`;
  const { data, error } = await admin.storage.from("profile-avatars").createSignedUploadUrl(path);

  if (error || !data) {
    throw new Error(error?.message ?? "Could not start upload");
  }

  const { data: publicData } = admin.storage.from("profile-avatars").getPublicUrl(path);
  return { path: data.path, token: data.token, publicUrl: publicData.publicUrl };
}

export async function saveAvatarUrl(userId: string, avatarUrl: string) {
  const trimmed = avatarUrl.trim();
  if (!trimmed.startsWith("https://") || trimmed.length > 512) {
    throw new Error("Invalid avatar URL");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("nothingmoe_profiles")
    .update({ avatar_url: trimmed })
    .eq("id", userId)
    .select("id, username, display_name, avatar_url, banned_at, banned_reason")
    .single();

  if (error) throw new Error(error.message);
  return data;
}
