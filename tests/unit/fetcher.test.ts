import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetcher, FetcherError, getLastFetchedAt, setLastFetchedAt } from "@/lib/fetcher";

describe("fetcher utility (src/lib/fetcher.ts - Phase 17)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches JSON successfully and stores fetchedAt timestamp", async () => {
    const mockData = {
      alerts: [{ id: "alert-1", title: "Flood Watch" }],
      fetchedAt: "2026-11-21T10:00:00.000Z",
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockData), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const result = await fetcher<typeof mockData>("/api/alerts");
    expect(result.alerts).toHaveLength(1);
    expect(result.fetchedAt).toBe("2026-11-21T10:00:00.000Z");
    expect(getLastFetchedAt("/api/alerts")).toBe("2026-11-21T10:00:00.000Z");
  });

  it("falls back to cached data when network fails", async () => {
    const mockData = {
      facilities: [{ id: "shelter-1", name: { en: "Relief Camp A" } }],
      fetchedAt: "2026-11-21T09:30:00.000Z",
    };

    // First successful fetch to populate cache
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockData), { status: 200 })
    );
    await fetcher<typeof mockData>("/api/shelters");

    // Second fetch fails with network drop
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new TypeError("Failed to fetch"));

    const result = await fetcher<typeof mockData>("/api/shelters");
    expect(result.facilities).toHaveLength(1);
    expect(result.fetchedAt).toBe("2026-11-21T09:30:00.000Z");
    expect((result as { _isCached?: boolean })._isCached).toBe(true);
  });

  it("throws friendly translated error when network fails and no cache exists", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(fetcher("/api/never-cached")).rejects.toThrow(FetcherError);
    await expect(fetcher("/api/never-cached")).rejects.toThrow(
      /Network connection error\. Showing cached emergency data\./
    );
  });

  it("throws friendly error on 404 response when no cache exists", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("Not Found", { status: 404 }));

    await expect(fetcher("/api/unknown")).rejects.toThrow(
      /The requested emergency resource could not be found\./
    );
  });

  it("stores and retrieves lastFetchedAt timestamp correctly", () => {
    setLastFetchedAt("2026-11-21T11:15:00.000Z");
    expect(getLastFetchedAt()).toBe("2026-11-21T11:15:00.000Z");
  });
});
