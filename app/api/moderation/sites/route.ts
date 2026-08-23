import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { isModerator } from "@/lib/moderation";
import {
  addSiteAsModerator,
  reorderSiteAsModerator,
  type AddSitePayload,
} from "@/lib/moderation-server";

function parseAddPayload(body: unknown): AddSitePayload | null {
  if (!body || typeof body !== "object") return null;
  const data = body as Record<string, unknown>;

  const slug = typeof data.slug === "string" ? data.slug.trim() : "";
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const domain = typeof data.domain === "string" ? data.domain.trim() : "";
  const href = typeof data.href === "string" ? data.href.trim() : "";
  const icon = typeof data.icon === "string" ? data.icon.trim() : "";
  const reason = typeof data.reason === "string" ? data.reason.trim() : "";
  const line = typeof data.line === "string" ? data.line.trim() : "";
  const started = typeof data.started === "string" ? data.started.trim() : "";
  const discord = typeof data.discord === "string" ? data.discord.trim() : undefined;
  const ownerUserId =
    typeof data.ownerUserId === "string" ? data.ownerUserId.trim() : undefined;

  const seed =
    data.seed && typeof data.seed === "object"
      ? (data.seed as Record<string, unknown>)
      : undefined;

  if (!slug || !name || !domain || !href || !icon || !reason || !line || !started) {
    return null;
  }

  return {
    slug,
    name,
    domain,
    href,
    icon,
    reason,
    line,
    started,
    discord,
    ownerUserId: ownerUserId || undefined,
    seed: seed
      ? {
          ui: typeof seed.ui === "number" ? seed.ui : undefined,
          ux: typeof seed.ux === "number" ? seed.ux : undefined,
          catalog: typeof seed.catalog === "number" ? seed.catalog : undefined,
          features: typeof seed.features === "number" ? seed.features : undefined,
        }
      : undefined,
  };
}

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

  const payload = parseAddPayload(body);
  if (!payload) {
    return NextResponse.json({ error: "Invalid site payload" }, { status: 400 });
  }

  try {
    const site = await addSiteAsModerator(session, payload);
    return NextResponse.json({ ok: true, site });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add site";
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

  const data = body as { domain?: unknown; direction?: unknown };
  const domain = typeof data.domain === "string" ? data.domain.trim() : "";
  const direction = data.direction === "down" ? "down" : "up";

  if (!domain) {
    return NextResponse.json({ error: "domain is required" }, { status: 400 });
  }

  try {
    const result = await reorderSiteAsModerator(session, domain, direction);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reorder site";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
