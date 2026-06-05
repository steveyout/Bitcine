import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    tmdbConfigured: !!process.env.TMDB_ACCESS_TOKEN,
    timestamp: new Date().toISOString()
  });
}
