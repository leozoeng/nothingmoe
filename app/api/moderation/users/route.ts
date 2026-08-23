import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { isModerator } from "@/lib/moderation";
import { banUserAsModerator, deleteUserAsModerator } from "@/lib/moderation-server";

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  if (!isModerator(session)) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as { userId?: unknown; reason?: unknown; action?: unknown };
  const userId = typeof data.userId === "string" ? data.userId.trim() : "";
  const reason = typeof data.reason === "string" ? data.reason.trim() : undefined;
  const action = data.action === "delete" ? "delete" : "ban";

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    if (action === "delete") {
      await deleteUserAsModerator(session, userId);
      return NextResponse.json({ ok: true, action: "delete" });
    }

    await banUserAsModerator(session, userId, reason);
    return NextResponse.json({ ok: true, action: "ban" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Moderation action failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
