import { getDistricts } from "@/lib/data";
import { okResponse, errorResponse } from "@/lib/api";

export async function GET() {
  try {
    const districts = getDistricts();

    return okResponse(
      {
        districts,
        fetchedAt: new Date().toISOString(),
      },
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
