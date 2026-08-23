import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { saveAvatarUrl, updateProfileDisplayName } from "@/lib/profile-server";

export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as { display_name?: unknown; avatar_url?: unknown };

  try {
    if (typeof data.display_name === "string") {
      const profile = await updateProfileDisplayName(session.id, data.display_name);
      return NextResponse.json({
        user: {
          ...session,
          profile: profile
            ? {
                id: profile.id,
                username: profile.username,
                display_name: profile.display_name,
                avatar_url: profile.avatar_url ?? null,
                banned_at: profile.banned_at ?? null,
                banned_reason: profile.banned_reason ?? null,
              }
            : session.profile,
        },
      });
    }

    if (typeof data.avatar_url === "string") {
      const profile = await saveAvatarUrl(session.id, data.avatar_url);
      return NextResponse.json({
        user: {
          ...session,
          profile: profile
            ? {
                id: profile.id,
                username: profile.username,
                display_name: profile.display_name,
                avatar_url: profile.avatar_url ?? null,
                banned_at: profile.banned_at ?? null,
                banned_reason: profile.banned_reason ?? null,
              }
            : session.profile,
        },
      });
    }

    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update profile";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
