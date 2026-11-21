import { type NextRequest } from "next/server";
import { sheltersQuerySchema } from "@/lib/validators";
import { getFacilitiesRepository } from "@/lib/shelters";
import { okResponse, errorResponse } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const queryParams = {
      districtId: searchParams.get("districtId") ?? undefined,
      type: searchParams.get("type") ?? undefined,
    };

    const parsed = sheltersQuerySchema.safeParse(queryParams);
    if (!parsed.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid query parameters provided for shelters and facilities",
        400,
        { issues: parsed.error.issues }
      );
    }

    const { districtId, type } = parsed.data;
    const repository = getFacilitiesRepository();

    const facilities = await repository.find({
      districtId,
      type,
    });

    return okResponse(
      {
        facilities,
        fetchedAt: new Date().toISOString(),
      },
      {
        cacheControl: "public, max-age=3600, stale-while-revalidate=86400",
      }
    );
  } catch {
    return errorResponse(
      "SERVER_ERROR",
      "An unexpected server error occurred while retrieving facilities",
      500
    );
  }
}
