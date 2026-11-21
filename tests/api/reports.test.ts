import { describe, it, expect, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/reports/route";
import { getReportsRepository } from "@/lib/db";

describe("Reports API Routes (GET & POST /api/reports - Section 26.3)", () => {
  beforeEach(async () => {
    const repo = getReportsRepository();
    if (repo.clear) {
      await repo.clear();
    }
  });

  const validPayload = {
    districtId: "dhemaji",
    type: "road_blocked",
    note: "NH-15 submerged under 1 foot of rushing water near Gogamukh bypass.",
    place: "Gogamukh Bypass",
    honeypot: "",
  };

  const createRequest = (method: string, body?: unknown, headers: Record<string, string> = {}) => {
    const url = "http://localhost:3000/api/reports";
    return new Request(url, {
      method,
      headers: {
        "content-type": "application/json",
        "user-agent": "Vitest-Test-Agent",
        "x-forwarded-for": "203.0.113.195",
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  it("POST /api/reports returns 201 with only id and status: pending for a valid report", async () => {
    const req = createRequest("POST", validPayload);
    const res = await POST(req);

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.id).toBeDefined();
    expect(data.status).toBe("pending");
    // Only id and status should be returned in public response
    expect(data.clientHash).toBeUndefined();
    expect(data.note).toBeUndefined();
  });

  it("POST /api/reports stores report as pending with sanitised text", async () => {
    const dirtyPayload = {
      ...validPayload,
      note: "<b>River breach</b> <script>alert(1)</script> at embankment",
      place: "<i>Ward 4</i>",
    };

    const req = createRequest("POST", dirtyPayload);
    const res = await POST(req);
    expect(res.status).toBe(201);
    const { id } = await res.json();

    const repo = getReportsRepository();
    const stored = await repo.findById(id);
    expect(stored).not.toBeNull();
    expect(stored?.status).toBe("pending");
    expect(stored?.note).toBe("River breach at embankment");
    expect(stored?.place).toBe("Ward 4");
    expect(stored?.clientHash).toBeDefined();
  });

  it("POST /api/reports returns 400 with details for an invalid payload", async () => {
    const invalidPayload = {
      districtId: "invalid-district",
      type: "alien_invasion",
      note: "   ",
    };

    const req = createRequest("POST", invalidPayload);
    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error.code).toBe("VALIDATION_ERROR");
    expect(data.error.details).toBeDefined();
  });

  it("POST /api/reports rejects notes containing phone numbers with 400", async () => {
    const req = createRequest("POST", {
      ...validPayload,
      note: "Contact me urgently at 9876543210 for pickup",
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });

  it("POST /api/reports returns 413 for an oversized payload (> 2048 bytes)", async () => {
    const hugeNote = "x".repeat(2500);
    const req = createRequest("POST", {
      ...validPayload,
      note: hugeNote,
    });
    const res = await POST(req);

    expect(res.status).toBe(413);
    const data = await res.json();
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });

  it("POST /api/reports with honeypot filled returns 200/201 success but stores nothing", async () => {
    const botPayload = {
      ...validPayload,
      honeypot: "http://spam-promoter.com",
    };

    const req = createRequest("POST", botPayload);
    const res = await POST(req);

    expect(res.status).toBe(200);
    const repo = getReportsRepository();
    const all = await repo.find();
    expect(all.length).toBe(0);
  });

  it("POST /api/reports returns 429 after client rate limit is exceeded", async () => {
    const clientIp = "198.51.100.42";

    // 5 allowed requests
    for (let i = 0; i < 5; i++) {
      const req = createRequest("POST", validPayload, { "x-forwarded-for": clientIp });
      const res = await POST(req);
      expect(res.status).toBe(201);
    }

    // 6th request is blocked
    const blockedReq = createRequest("POST", validPayload, { "x-forwarded-for": clientIp });
    const blockedRes = await POST(blockedReq);

    expect(blockedRes.status).toBe(429);
    expect(blockedRes.headers.get("retry-after")).toBeDefined();
    const data = await blockedRes.json();
    expect(data.error.code).toBe("RATE_LIMITED");
  });

  it("GET /api/reports returns only approved items for a district, newest first, max 20", async () => {
    const repo = getReportsRepository();

    // Insert 1 pending, 2 approved for dhemaji, and 1 approved for lakhimpur
    await repo.create({
      districtId: "dhemaji",
      type: "road_blocked",
      note: "Old approved report",
      status: "approved",
      createdAt: "2026-11-20T10:00:00.000Z",
      clientHash: "hash-1",
    });

    await repo.create({
      districtId: "dhemaji",
      type: "area_flooded",
      note: "Newer approved report",
      status: "approved",
      createdAt: "2026-11-21T08:00:00.000Z",
      clientHash: "hash-2",
    });

    await repo.create({
      districtId: "dhemaji",
      type: "need_help",
      note: "Pending report (should NOT appear)",
      status: "pending",
      createdAt: "2026-11-21T09:00:00.000Z",
      clientHash: "hash-3",
    });

    await repo.create({
      districtId: "lakhimpur",
      type: "safe_shelter",
      note: "Lakhimpur approved report (should NOT appear)",
      status: "approved",
      createdAt: "2026-11-21T08:30:00.000Z",
      clientHash: "hash-4",
    });

    const getReq = new Request("http://localhost:3000/api/reports?districtId=dhemaji");
    const getRes = await GET(getReq);

    expect(getRes.status).toBe(200);
    const reports = await getRes.json();
    expect(reports.length).toBe(2);

    // Verify all returned reports are approved
    expect(reports.every((r: { status: string }) => r.status === "approved")).toBe(true);

    // Verify sorted newest first
    expect(reports[0].note).toBe("Newer approved report");
    expect(reports[1].note).toBe("Old approved report");
  });

  it("Error responses never expose stack traces", async () => {
    const badReq = createRequest("POST", { districtId: 12345 });
    const res = await POST(badReq);
    const data = await res.json();

    expect(data.stack).toBeUndefined();
    expect(data.error.stack).toBeUndefined();
    expect(JSON.stringify(data)).not.toContain("at Object.");
    expect(JSON.stringify(data)).not.toContain("node_modules");
  });
});
