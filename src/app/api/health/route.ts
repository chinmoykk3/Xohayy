import { NextResponse } from "next/server";

/**
 * Lightweight health check endpoint.
 * Used by useOnlineStatus to verify real internet connectivity
 * beyond browser navigator.onLine flags.
 */
export async function GET() {
  return new NextResponse(JSON.stringify({ status: "ok" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
