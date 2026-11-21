import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useOnlineStatus,
  verifyOnlineStatus,
  __resetOnlineStatusForTesting,
} from "@/hooks/useOnlineStatus";

describe("useOnlineStatus Hook (Phase 17)", () => {
  beforeEach(() => {
    __resetOnlineStatusForTesting();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns true when navigator is online and health check succeeds", async () => {
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: true,
    });

    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 200 }));

    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);

    await act(async () => {
      await verifyOnlineStatus();
    });

    expect(result.current).toBe(true);
  });

  it("updates to false when window offline event is dispatched", () => {
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: true,
    });

    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);

    act(() => {
      Object.defineProperty(window.navigator, "onLine", {
        configurable: true,
        value: false,
      });
      window.dispatchEvent(new Event("offline"));
    });

    expect(result.current).toBe(false);
  });

  it("recovers to true when window online event is dispatched", () => {
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: false,
    });

    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);

    act(() => {
      Object.defineProperty(window.navigator, "onLine", {
        configurable: true,
        value: true,
      });
      window.dispatchEvent(new Event("online"));
    });

    expect(result.current).toBe(true);
  });

  it("verifies with /api/health and turns false if browser flag is online but ping fails", async () => {
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: true,
    });

    // Mock fetch to simulate network drop / dead gateway even though navigator.onLine is true
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network connection dropped"));

    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);

    await act(async () => {
      const verified = await verifyOnlineStatus();
      expect(verified).toBe(false);
    });

    expect(result.current).toBe(false);
  });

  it("turns false if /api/health returns non-ok status code", async () => {
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: true,
    });

    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 503 }));

    const { result } = renderHook(() => useOnlineStatus());

    await act(async () => {
      const verified = await verifyOnlineStatus();
      expect(verified).toBe(false);
    });

    expect(result.current).toBe(false);
  });
});
