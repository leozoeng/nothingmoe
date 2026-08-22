import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { fetchReviews, submitReview } from "@/lib/reviews-server";
import type { ReviewPayload } from "@/lib/scores";
import { siteByDomain } from "@/lib/sites";

type Params = { params: Promise<{ domain: string }> };

function parsePayload(body: unknown): ReviewPayload | null {
  if (!body || typeof body !== "object") return null;
  const data = body as Record<string, unknown>;
  const stars = Number(data.stars);
  const score_ui = Number(data.score_ui);
  const score_ux = Number(data.score_ux);
  const score_catalog = Number(data.score_catalog);
  const score_features = Number(data.score_features);
  const text = typeof data.body === "string" ? data.body.trim() : "";

  if (
    !Number.isInteger(stars) ||
    stars < 1 ||
    stars > 5 ||
    ![score_ui, score_ux, score_catalog, score_features].every(
      (n) => Number.isInteger(n) && n >= 1 && n <= 100,
    ) ||
    text.length < 10 ||
    text.length > 2000
  ) {
    return null;
  }

  return {
    stars,
    score_ui,
    score_ux,
    score_catalog,
    score_features,
    body: text,
  };
}

export async function GET(_request: Request, { params }: Params) {
  const { domain } = await params;
  const site = siteByDomain(decodeURIComponent(domain));

  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  const session = await getSessionUser();
  const data = await fetchReviews(site.domain, session?.id);
  return NextResponse.json(data);
}

export async function POST(request: Request, { params }: Params) {
  const { domain } = await params;
  const site = siteByDomain(decodeURIComponent(domain));

  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Sign in to post a review" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = parsePayload(body);
  if (!payload) {
    return NextResponse.json({ error: "Invalid review payload" }, { status: 400 });
  }

  try {
    await submitReview(site.domain, session.id, payload);
    const data = await fetchReviews(site.domain, session.id);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit review";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
