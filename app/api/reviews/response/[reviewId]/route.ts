import { NextResponse } from "next/server";
import { getSessionUser, isSiteOwner } from "@/lib/auth-server";
import { fetchReviews, submitReviewResponse } from "@/lib/reviews-server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ reviewId: string }> };

export async function POST(request: Request, { params }: Params) {
  const { reviewId } = await params;
  const session = await getSessionUser();

  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text = typeof (body as { body?: unknown })?.body === "string" ? (body as { body: string }).body.trim() : "";
  if (text.length < 1 || text.length > 2000) {
    return NextResponse.json({ error: "Invalid response" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: review, error } = await supabase
    .from("nothingmoe_reviews")
    .select("id, site_domain")
    .eq("id", reviewId)
    .maybeSingle();

  if (error || !review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  const owner = await isSiteOwner(session.id, review.site_domain);
  if (!owner) {
    return NextResponse.json({ error: "Not a site owner" }, { status: 403 });
  }

  try {
    await submitReviewResponse(reviewId, session.id, text);
    const data = await fetchReviews(review.site_domain, session.id);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to post response";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
