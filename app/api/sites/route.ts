import { NextResponse } from "next/server";
import { fetchAllSites } from "@/lib/sites-server";

export async function GET() {
  try {
    const sites = await fetchAllSites();
    return NextResponse.json({ sites });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load sites";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
