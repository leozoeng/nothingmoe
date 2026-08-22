import { NextResponse } from "next/server";
import { adminConfigured, createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  if (!adminConfigured()) {
    return NextResponse.json({ error: "Auth is not configured" }, { status: 503 });
  }

  let body: {
    email?: string;
    password?: string;
    username?: string;
    displayName?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const username = body.username?.trim().toLowerCase() ?? "";
  const displayName = body.displayName?.trim() || username;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  if (!/^[a-z0-9_]{3,24}$/.test(username)) {
    return NextResponse.json(
      { error: "Username must be 3–24 chars: letters, numbers, underscore" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      username,
      display_name: displayName,
    },
  });

  if (error) {
    const message = error.message.toLowerCase();

    if (message.includes("already") || message.includes("registered")) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    if (message.includes("rate limit") || message.includes("too many")) {
      return NextResponse.json(
        { error: "Too many attempts — wait a minute and try again" },
        { status: 429 },
      );
    }

    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
