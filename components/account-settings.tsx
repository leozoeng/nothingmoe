"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { UserAvatar } from "@/components/user-avatar";

async function uploadAvatar(file: File) {
  const start = await fetch("/api/me/avatar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: file.type, size: file.size }),
  });

  const startData = (await start.json()) as {
    error?: string;
    path?: string;
    token?: string;
    publicUrl?: string;
  };

  if (!start.ok || !startData.path || !startData.token || !startData.publicUrl) {
    throw new Error(startData.error ?? "Could not start upload");
  }

  const supabase = createClient();
  const { error: uploadError } = await supabase.storage
    .from("profile-avatars")
    .uploadToSignedUrl(startData.path, startData.token, file, { contentType: file.type });

  if (uploadError) throw new Error(uploadError.message);

  const save = await fetch("/api/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ avatar_url: startData.publicUrl }),
  });

  const saveData = (await save.json()) as { error?: string };
  if (!save.ok) throw new Error(saveData.error ?? "Could not save avatar");
  return startData.publicUrl;
}

export function AccountSettings() {
  const { user, refreshUser } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    setDisplayName(user?.profile?.display_name ?? "");
  }, [user?.profile?.display_name]);

  if (!user) return null;

  const saveName = async () => {
    setSaving(true);
    setError(null);
    setSaved(null);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: displayName }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      await refreshUser();
      setSaved("Saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const onAvatarPick = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setSaved(null);
    try {
      await uploadAvatar(file);
      await refreshUser();
      setSaved("Profile picture updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="account-shell px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-sans text-[10px] tracking-[0.28em] text-muted uppercase">account</p>
            <h1 className="mt-2 font-sans text-2xl font-medium tracking-[-0.03em] text-chrome">
              your profile
            </h1>
            <p className="mt-2 font-sans text-[12px] leading-relaxed text-muted">
              update how you appear on reviews.
            </p>
          </div>
          <Link href="/" className="action-chip action-chip-view !px-3.5 !py-2">
            <span className="action-chip-shine" aria-hidden="true" />
            <span>back</span>
          </Link>
        </div>

        <section className="glass rounded-xl px-4 py-5">
          <div className="flex items-center gap-4">
            <UserAvatar
              name={user.profile?.display_name ?? user.email}
              src={user.profile?.avatar_url}
              size="lg"
            />
            <div>
              <p className="font-sans text-[13px] font-medium text-chrome">
                {user.profile?.display_name ?? user.email}
              </p>
              <p className="font-sans text-[11px] text-muted">@{user.profile?.username}</p>
              <label className="mt-2 inline-block cursor-pointer font-sans text-[10px] tracking-[0.12em] text-chrome uppercase">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  className="hidden"
                  disabled={uploading}
                  onChange={(event) => void onAvatarPick(event.target.files?.[0] ?? null)}
                />
                {uploading ? "uploading..." : "change photo"}
              </label>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <label className="moderator-field">
              <span>display name</span>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={32}
              />
            </label>
            <label className="moderator-field">
              <span>username</span>
              <input value={user.profile?.username ?? ""} disabled />
            </label>
          </div>

          {error ? <p className="moderator-error mt-4">{error}</p> : null}
          {saved ? <p className="mt-4 font-sans text-[11px] text-[#86efac]">{saved}</p> : null}

          <div className="mt-5">
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveName()}
              className="action-chip action-chip-open !px-3.5 !py-2"
            >
              <span className="action-chip-shine" aria-hidden="true" />
              <span>{saving ? "saving..." : "save name"}</span>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
