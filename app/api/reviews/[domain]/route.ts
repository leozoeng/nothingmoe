import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { isModerator, isUserBanned } from "@/lib/moderation";
import { assertNotBanned } from "@/lib/moderation-server";
import {
  deleteReviewAsModerator,
  fetchReviews,
  ReviewConflictError,
  submitReview,
} from "@/lib/reviews-server";
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

  if (isUserBanned(session)) {
    return NextResponse.json(
      {
        error:
          session.profile?.banned_reason?.trim() ||
          "Your account is banned from posting reviews.",
      },
      { status: 403 },
    );
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

  try {
    await assertNotBanned(session.id);
    const result = await submitReview(site.domain, session.id, parsed);
    const data = await fetchReviews(site.domain, session.id);
    return NextResponse.json(data, { status: result.created ? 201 : 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit review";
    const lower = message.toLowerCase();
    const status =
      error instanceof ReviewConflictError ? 409 : lower.includes("banned") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { domain } = await params;
  const site = siteByDomain(decodeURIComponent(domain));

  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  if (!isModerator(session)) {
    return NextResponse.json({ error: "Not allowed to delete reviews" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const reviewId =
    body && typeof body === "object" && typeof (body as { reviewId?: unknown }).reviewId === "string"
      ? (body as { reviewId: string }).reviewId.trim()
      : "";

  if (!reviewId) {
    return NextResponse.json({ error: "reviewId is required" }, { status: 400 });
  }

  try {
    await deleteReviewAsModerator(reviewId, site.domain);
    const data = await fetchReviews(site.domain, session.id);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete review";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
