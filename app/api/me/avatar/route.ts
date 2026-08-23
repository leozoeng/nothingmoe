import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";
import { createAvatarUpload } from "@/lib/profile-server";

export async function POST(request: Request) {
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

  const data = body as { contentType?: string; size?: number };
  const contentType = data.contentType ?? "";
  const size = typeof data.size === "number" ? data.size : 0;

  try {
    const upload = await createAvatarUpload(session.id, contentType, size);
    return NextResponse.json(upload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to start upload";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
