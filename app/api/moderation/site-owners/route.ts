import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { isModerator } from "@/lib/moderation";
import {
  assignSiteOwnerAsModerator,
  listSiteOwnersAsModerator,
} from "@/lib/moderation-server";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  if (!isModerator(session)) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  try {
    const sites = await listSiteOwnersAsModerator(session);
    return NextResponse.json({ sites });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load owners";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
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

  const data = body as { domain?: unknown; ownerUserId?: unknown };
  const domain = typeof data.domain === "string" ? data.domain.trim() : "";
  const ownerUserId = typeof data.ownerUserId === "string" ? data.ownerUserId.trim() : "";

  if (!domain || !ownerUserId) {
    return NextResponse.json({ error: "domain and ownerUserId are required" }, { status: 400 });
  }

  try {
    const result = await assignSiteOwnerAsModerator(session, domain, ownerUserId);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to assign owner";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
