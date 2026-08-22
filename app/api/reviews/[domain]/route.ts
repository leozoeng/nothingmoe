import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { fetchReviews, submitReview } from "@/lib/reviews-server";
import { parseReviewPayload } from "@/lib/scores";
import { siteByDomain } from "@/lib/sites";

type Params = { params: Promise<{ domain: string }> };

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

  const parsed = parseReviewPayload(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const payload = parsed;

  try {
    await submitReview(site.domain, session.id, payload);
    const data = await fetchReviews(site.domain, session.id);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit review";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
