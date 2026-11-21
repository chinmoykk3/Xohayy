import { describe, expect, it } from "vitest";
import { okResponse, errorResponse, safeJson } from "@/lib/api";

describe("API Response & SafeJson Utilities", () => {
  it("creates standard okResponse with body, status and cacheControl", async () => {
    const res = okResponse(
      { success: true, count: 5 },
      { status: 200, cacheControl: "public, max-age=60" }
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("public, max-age=60");

    const json = await res.json();
    expect(json).toEqual({ success: true, count: 5 });
  });

  it("creates standard errorResponse conforming to section 19 without stack traces", async () => {
    const res = errorResponse("VALIDATION_ERROR", "Invalid district specified", 400, {
      field: "districtId",
    });
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid district specified",
        details: { field: "districtId" },
      },
    });

    // Verify stack traces are never exposed
    expect(json.error.stack).toBeUndefined();
  });

  it("safeJson parses valid JSON successfully", async () => {
    const req = new Request("http://localhost:3000/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ district: "dhemaji", count: 1 }),
    });

    const result = await safeJson<{ district: string; count: number }>(req);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.district).toBe("dhemaji");
    }
  });

  it("safeJson rejects request with missing or incorrect content-type", async () => {
    const req = new Request("http://localhost:3000/api/reports", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ district: "dhemaji" }),
    });

    const result = await safeJson(req);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.response.status).toBe(400);
      const body = await result.response.json();
      expect(body.error.code).toBe("VALIDATION_ERROR");
      expect(body.error.message).toContain("Content-Type must be application/json");
    }
  });

  it("safeJson rejects payload exceeding maxBytes", async () => {
    const oversizedBody = JSON.stringify({ data: "x".repeat(200) });
    const req = new Request("http://localhost:3000/api/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": oversizedBody.length.toString(),
      },
      body: oversizedBody,
    });

    const result = await safeJson(req, { maxBytes: 100 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.response.status).toBe(413);
      const body = await result.response.json();
      expect(body.error.message).toContain("Payload exceeds maximum allowed size");
    }
  });

  it("safeJson rejects malformed JSON cleanly without stack traces", async () => {
    const req = new Request("http://localhost:3000/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"invalidJson": ...}',
    });

    const result = await safeJson(req);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.response.status).toBe(400);
      const body = await result.response.json();
      expect(body.error.code).toBe("VALIDATION_ERROR");
      expect(body.error.message).toBe("Malformed JSON payload");
      expect(body.error.stack).toBeUndefined();
    }
  });
});
