import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET as getAlerts } from "@/app/api/alerts/route";
import { GET as getDistricts } from "@/app/api/districts/route";
import type { Alert, District } from "@/types";

describe("GET /api/alerts (Section 19)", () => {
  it("returns 200 OK with sorted alerts, fetchedAt timestamp, and cache headers", async () => {
    const req = new NextRequest("http://localhost:3000/api/alerts");
    const res = await getAlerts(req);

    expect(res.status).toBe(200);

    const cacheHeader = res.headers.get("Cache-Control");
    expect(cacheHeader).toContain("public");
    expect(cacheHeader).toContain("max-age=60");
    expect(cacheHeader).toContain("stale-while-revalidate=600");

    const json = (await res.json()) as { alerts: Alert[]; fetchedAt: string };
    expect(Array.isArray(json.alerts)).toBe(true);
    expect(json.alerts.length).toBeGreaterThan(0);
    expect(typeof json.fetchedAt).toBe("string");
    expect(new Date(json.fetchedAt).getTime()).not.toBeNaN();
  });

  it("filters alerts by districtId", async () => {
    const req = new NextRequest("http://localhost:3000/api/alerts?districtId=majuli");
    const res = await getAlerts(req);

    expect(res.status).toBe(200);
    const json = (await res.json()) as { alerts: Alert[] };
    expect(json.alerts.length).toBeGreaterThan(0);
    expect(json.alerts.every((a) => a.districtId === "majuli")).toBe(true);
  });

  it("filters alerts by hazard", async () => {
    const req = new NextRequest("http://localhost:3000/api/alerts?hazard=flood");
    const res = await getAlerts(req);

    expect(res.status).toBe(200);
    const json = (await res.json()) as { alerts: Alert[] };
    expect(json.alerts.every((a) => a.hazard === "flood")).toBe(true);
  });

  it("hides expired alerts by default and returns them when includeExpired=true", async () => {
    // Default: expired hidden
    const reqDefault = new NextRequest("http://localhost:3000/api/alerts");
    const resDefault = await getAlerts(reqDefault);
    const jsonDefault = (await resDefault.json()) as { alerts: Alert[] };

    // With includeExpired=true
    const reqExpired = new NextRequest("http://localhost:3000/api/alerts?includeExpired=true");
    const resExpired = await getAlerts(reqExpired);
    const jsonExpired = (await resExpired.json()) as { alerts: Alert[] };

    expect(jsonExpired.alerts.length).toBeGreaterThanOrEqual(jsonDefault.alerts.length);
  });

  it("returns 400 Bad Request with VALIDATION_ERROR for invalid hazard", async () => {
    const req = new NextRequest("http://localhost:3000/api/alerts?hazard=invalid_hazard_type");
    const res = await getAlerts(req);

    expect(res.status).toBe(400);
    const json = (await res.json()) as { error: { code: string; message: string } };
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("GET /api/districts (Section 19)", () => {
  it("returns 200 OK with district directory and long cache headers", async () => {
    const req = new NextRequest("http://localhost:3000/api/districts");
    const res = await getDistricts(req);

    expect(res.status).toBe(200);

    const cacheHeader = res.headers.get("Cache-Control");
    expect(cacheHeader).toContain("public");
    expect(cacheHeader).toContain("max-age=86400");

    const json = (await res.json()) as { districts: District[]; fetchedAt: string };
    expect(Array.isArray(json.districts)).toBe(true);
    expect(json.districts.length).toBeGreaterThan(0);
    expect(json.districts.some((d) => d.id === "dhemaji")).toBe(true);
  });
});
