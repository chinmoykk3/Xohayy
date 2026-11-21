import { type NextRequest } from "next/server";
import { alertsQuerySchema } from "@/lib/validators";
import { getAlertsRepository } from "@/lib/alerts";
import { okResponse, errorResponse } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const queryParams = {
      districtId: searchParams.get("districtId") ?? undefined,
      hazard: searchParams.get("hazard") ?? undefined,
      includeExpired: searchParams.get("includeExpired") ?? undefined,
    };

    const parsed = alertsQuerySchema.safeParse(queryParams);
    if (!parsed.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Invalid query parameters provided for alerts",
        400,
        { issues: parsed.error.issues }
      );
    }

    const { districtId, hazard, includeExpired } = parsed.data;
    const repository = getAlertsRepository();

    const alerts = await repository.getAlerts({
      districtId,
      hazard,
      includeExpired,
    });

    return okResponse(
      {
        alerts,
        fetchedAt: new Date().toISOString(),
      },
      {
        cacheControl: "public, max-age=60, stale-while-revalidate=600",
      }
    );
  } catch {
    return errorResponse(
      "SERVER_ERROR",
      "An unexpected server error occurred while retrieving alerts",
      500
    );
  }
}
