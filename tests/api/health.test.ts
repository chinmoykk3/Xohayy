import { describe, it, expect } from "vitest";
import { GET, HEAD } from "@/app/api/health/route";

describe("Health API Route (/api/health - Phase 17)", () => {
  it("GET returns status 200 with JSON { status: 'ok' } and no-store headers", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ status: "ok" });
    expect(res.headers.get("Cache-Control")).toContain("no-store");
  });

  it("HEAD returns status 200 with no-store headers", async () => {
    const res = await HEAD();
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toContain("no-store");
  });
});
