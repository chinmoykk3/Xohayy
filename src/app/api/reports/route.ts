import { safeJson, okResponse, errorResponse } from "@/lib/api";
import { createReportSchema, reportsQuerySchema } from "@/lib/validators";
import { getReportsRepository } from "@/lib/db";
import { getRateLimiter, hashClient, RATE_LIMITS } from "@/lib/rateLimit";
import { sanitizeReport } from "@/lib/sanitize";

// Phone number pattern detector to protect privacy per Section 25 & 26.2
const PHONE_PATTERN = /(?:\+?91[-.\s]?)?[6-9]\d{9}|\b\d{5}[-.\s]?\d{5}\b|\b\d{10,11}\b/;

/**
 * GET /api/reports?districtId=
 * Returns approved reports for the district (or all districts), newest first, limited to 20.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const districtIdParam = url.searchParams.get("districtId") || undefined;

    const queryResult = reportsQuerySchema.safeParse({ districtId: districtIdParam });
    if (!queryResult.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid query parameters", 400);
    }

    const repo = getReportsRepository();
    const approved = await repo.find({
      districtId: queryResult.data.districtId,
      status: "approved",
      limit: 20,
    });

    return okResponse(approved, {
      cacheControl: "public, max-age=30, stale-while-revalidate=60",
    });
  } catch {
    return errorResponse("SERVER_ERROR", "Failed to retrieve community reports", 500);
  }
}

/**
 * POST /api/reports
 * Validates, checks honeypot, sanitizes, enforces rate limiting, and stores as pending.
 */
export async function POST(request: Request) {
  // 1. Safe JSON parsing with strict 2048 bytes limit per Section 19 & tests
  const jsonResult = await safeJson<Record<string, unknown>>(request, { maxBytes: 2048 });
  if (!jsonResult.success) {
    return jsonResult.response;
  }

  // 2. Validate payload with Zod
  const parsed = createReportSchema.safeParse(jsonResult.data);
  if (!parsed.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "Report validation failed. Please check required fields.",
      400,
      parsed.error.flatten().fieldErrors as Record<string, unknown>
    );
  }

  // 3. Reject notes containing phone numbers for privacy protection
  if (PHONE_PATTERN.test(parsed.data.note)) {
    return errorResponse(
      "VALIDATION_ERROR",
      "Notes must not contain phone numbers. Please keep personal contact details private.",
      400
    );
  }

  // 4. Honeypot check: silently drop bots with 200 without storing per Section 19
  if (parsed.data.honeypot && parsed.data.honeypot.trim().length > 0) {
    return okResponse({ ok: true, status: "pending" }, { status: 200 });
  }

  // 5. Rate limiting per client (5 per hour)
  const clientHash = hashClient(request);
  const limiter = getRateLimiter();
  const rateLimitResult = await limiter.check(
    `reports:client:${clientHash}`,
    RATE_LIMITS.REPORTS_PER_CLIENT_PER_HOUR,
    RATE_LIMITS.WINDOW_ONE_HOUR_MS
  );

  if (!rateLimitResult.allowed) {
    return errorResponse(
      "RATE_LIMITED",
      "Too many reports submitted recently. Please wait before submitting again.",
      429,
      undefined,
      {
        "Retry-After": String(rateLimitResult.retryAfter),
      }
    );
  }

  // 6. Sanitise free text
  const clean = sanitizeReport({
    districtId: parsed.data.districtId,
    type: parsed.data.type,
    note: parsed.data.note,
    place: parsed.data.place,
  });

  // 7. Store as pending in repository
  const repo = getReportsRepository();
  const created = await repo.create({
    districtId: clean.districtId,
    type: clean.type,
    note: clean.note,
    place: clean.place,
    status: "pending",
    createdAt: new Date().toISOString(),
    clientHash,
  });

  // 8. Return 201 with only id and status
  return okResponse(
    {
      id: created.id,
      status: created.status,
    },
    { status: 201 }
  );
}
