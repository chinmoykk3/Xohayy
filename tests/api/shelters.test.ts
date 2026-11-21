import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/shelters/route";

describe("GET /api/shelters", () => {
  it("returns 200 with facilities list and cache headers", async () => {
    const request = new NextRequest("http://localhost:3000/api/shelters");
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toContain("max-age=3600");
    expect(response.headers.get("Cache-Control")).toContain("stale-while-revalidate");

    const body = await response.json();
    expect(body).toHaveProperty("facilities");
    expect(body).toHaveProperty("fetchedAt");
    expect(Array.isArray(body.facilities)).toBe(true);
    expect(body.facilities.length).toBeGreaterThan(0);
  });

  it("filters facilities by districtId and type", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/shelters?districtId=dhemaji&type=hospital"
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.facilities)).toBe(true);
    for (const f of body.facilities) {
      expect(f.districtId).toBe("dhemaji");
      expect(f.type).toBe("hospital");
    }
  });

  it("returns 400 VALIDATION_ERROR on invalid type query param", async () => {
    const request = new NextRequest("http://localhost:3000/api/shelters?type=invalid_type");
    const response = await GET(request);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });
});
