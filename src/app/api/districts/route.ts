import { NextRequest } from "next/server";
import { getDistricts } from "@/lib/data";
import { conditionalOkResponse, errorResponse } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const districts = getDistricts();

    return conditionalOkResponse(
      request,
      {
        districts,
        fetchedAt: new Date().toISOString(),
      },
      districts,
      {
        cacheControl: "public, max-age=86400, stale-while-revalidate=604800",
      }
    );
  } catch {
    return errorResponse(
      "SERVER_ERROR",
      "An unexpected error occurred while fetching district directory",
      500
    );
  }
}
