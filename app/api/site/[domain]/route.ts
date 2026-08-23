import { NextResponse } from "next/server";
import { getSessionUser, isSiteOwner } from "@/lib/auth-server";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_FEATURE_LENGTH,
  MAX_FEATURES,
  MAX_TAGLINE_LENGTH,
  MIN_TAGLINE_LENGTH,
  isValidBannerUrl,
  normalizeFeatureList,
} from "@/lib/site-page-limits";
import { fetchSitePage, upsertSitePage, type SitePagePayload } from "@/lib/site-pages-server";
import { fetchSiteByDomain } from "@/lib/sites-server";

type Params = { params: Promise<{ domain: string }> };

function parsePayload(body: unknown): SitePagePayload | null {
  if (!body || typeof body !== "object") return null;
  const data = body as Record<string, unknown>;

  const line = typeof data.line === "string" ? data.line.trim() : undefined;
  const started = typeof data.started === "string" ? data.started.trim() : undefined;
  const rawFeatures = Array.isArray(data.feature_list)
    ? data.feature_list
    : Array.isArray(data.features)
      ? data.features
      : undefined;
  const feature_list =
    rawFeatures !== undefined
      ? normalizeFeatureList(
          rawFeatures.filter((item): item is string => typeof item === "string"),
        )
      : undefined;
  const banner_url =
    data.banner_url === null
      ? null
      : typeof data.banner_url === "string"
        ? data.banner_url.trim()
        : undefined;
  const description = typeof data.description === "string" ? data.description.trim() : undefined;

  if (
    line !== undefined &&
    (line.length < MIN_TAGLINE_LENGTH || line.length > MAX_TAGLINE_LENGTH)
  ) {
    return null;
  }
  if (started !== undefined && (started.length < 2 || started.length > 32)) return null;
  if (
    feature_list !== undefined &&
    (feature_list.length < 1 ||
      feature_list.length > MAX_FEATURES ||
      feature_list.some((item) => item.length > MAX_FEATURE_LENGTH))
  ) {
    return null;
  }
  if (banner_url !== undefined && banner_url !== null && !isValidBannerUrl(banner_url)) {
    return null;
  }
  if (description !== undefined && description.length > MAX_DESCRIPTION_LENGTH) return null;

  return { line, started, feature_list, banner_url, description };
}

export async function GET(_request: Request, { params }: Params) {
  const { domain: rawDomain } = await params;
  const domain = decodeURIComponent(rawDomain);
  const site = await fetchSiteByDomain(domain);

  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  const page = await fetchSitePage(site.domain);
  return NextResponse.json({ page });
}

export async function PATCH(request: Request, { params }: Params) {
  const { domain: rawDomain } = await params;
  const domain = decodeURIComponent(rawDomain);
  const site = await fetchSiteByDomain(domain);

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
    return NextResponse.json({
      page: {
        ...page,
        feature_list: page.pros,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update page";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
