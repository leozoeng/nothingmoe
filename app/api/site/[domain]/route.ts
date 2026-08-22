import { NextResponse } from "next/server";
import { getSessionUser, isSiteOwner } from "@/lib/auth-server";
import { fetchSitePage, upsertSitePage, type SitePagePayload } from "@/lib/site-pages-server";
import { siteByDomain } from "@/lib/sites";

type Params = { params: Promise<{ domain: string }> };

function parsePayload(body: unknown): SitePagePayload | null {
  if (!body || typeof body !== "object") return null;
  const data = body as Record<string, unknown>;

  const line = typeof data.line === "string" ? data.line.trim() : undefined;
  const started = typeof data.started === "string" ? data.started.trim() : undefined;
  const pros = Array.isArray(data.pros)
    ? data.pros.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : undefined;
  const cons = Array.isArray(data.cons)
    ? data.cons.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : undefined;
  const banner_url =
    data.banner_url === null
      ? null
      : typeof data.banner_url === "string"
        ? data.banner_url.trim()
        : undefined;
  const description = typeof data.description === "string" ? data.description.trim() : undefined;

  if (line !== undefined && (line.length < 10 || line.length > 500)) return null;
  if (started !== undefined && (started.length < 2 || started.length > 32)) return null;
  if (pros !== undefined && (pros.length < 1 || pros.length > 12)) return null;
  if (cons !== undefined && (cons.length < 1 || cons.length > 12)) return null;
  if (banner_url !== undefined && banner_url !== null && !/^https?:\/\/.+/i.test(banner_url)) {
    return null;
  }
  if (description !== undefined && description.length > 3000) return null;

  return { line, started, pros, cons, banner_url, description };
}

export async function GET(_request: Request, { params }: Params) {
  const { domain: rawDomain } = await params;
  const domain = decodeURIComponent(rawDomain);
  const site = siteByDomain(domain);

  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  const page = await fetchSitePage(site.domain);
  return NextResponse.json({ page });
}

export async function PATCH(request: Request, { params }: Params) {
  const { domain: rawDomain } = await params;
  const domain = decodeURIComponent(rawDomain);
  const site = siteByDomain(domain);

  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const owner = await isSiteOwner(session.id, site.domain);
  if (!owner) {
    return NextResponse.json({ error: "Not a site owner" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = parsePayload(body);
  if (!payload) {
    return NextResponse.json({ error: "Invalid page payload" }, { status: 400 });
  }

  try {
    const page = await upsertSitePage(site.domain, session.id, payload);
    return NextResponse.json({ page });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update page";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
