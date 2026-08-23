import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { isModerator } from "@/lib/moderation";
import { searchProfilesAsModerator } from "@/lib/moderation-server";

export async function GET(request: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  if (!isModerator(session)) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  try {
    const profiles = await searchProfilesAsModerator(session, query);
    return NextResponse.json({ profiles });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
