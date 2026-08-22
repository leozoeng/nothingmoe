import { NextResponse } from "next/server";
import { getSessionUser, isSiteOwner } from "@/lib/auth-server";
import { adminConfigured, createAdminClient } from "@/lib/supabase/admin";
import {
  BANNER_MIME_TYPES,
  MAX_BANNER_BYTES,
  bannerExtForType,
} from "@/lib/site-page-limits";
import { siteByDomain } from "@/lib/sites";

type Params = { params: Promise<{ domain: string }> };

export async function POST(request: Request, { params }: Params) {
  const { domain: rawDomain } = await params;
  const domain = decodeURIComponent(rawDomain);
  const site = siteByDomain(domain);

  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  if (!adminConfigured()) {
    return NextResponse.json({ error: "Uploads are not configured" }, { status: 503 });
  }

  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const owner = await isSiteOwner(session.id, site.domain);
  if (!owner) {
    return NextResponse.json({ error: "Not a site owner" }, { status: 403 });
  }

  let body: { contentType?: string; size?: number };
  try {
    body = (await request.json()) as { contentType?: string; size?: number };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const contentType = body.contentType ?? "";
  const size = typeof body.size === "number" ? body.size : 0;
  const ext = bannerExtForType(contentType);

  if (!BANNER_MIME_TYPES.includes(contentType as (typeof BANNER_MIME_TYPES)[number]) || !ext) {
    return NextResponse.json({ error: "Use a jpg, png, webp, gif, or avif" }, { status: 400 });
  }

  if (size <= 0 || size > MAX_BANNER_BYTES) {
    return NextResponse.json({ error: "Banner must be 50 MB or smaller" }, { status: 400 });
  }

  const admin = createAdminClient();
  const path = `${site.domain}/banner-${Date.now()}.${ext}`;
  const { data, error } = await admin.storage.from("site-banners").createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Could not start upload" }, { status: 500 });
  }

  const { data: publicData } = admin.storage.from("site-banners").getPublicUrl(path);

  return NextResponse.json({
    path: data.path,
    token: data.token,
    publicUrl: publicData.publicUrl,
  });
}
