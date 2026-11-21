import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { MemoryRateLimiter, RATE_LIMITS } from "@/lib/rateLimit";

describe("Rate Limiter (src/lib/rateLimit.ts)", () => {
  let limiter: MemoryRateLimiter;

  beforeEach(() => {
    vi.useFakeTimers();
    limiter = new MemoryRateLimiter();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests up to the client limit (5 requests per hour)", async () => {
    const key = "client:test-hash-1";
    const limit = RATE_LIMITS.REPORTS_PER_CLIENT_PER_HOUR;
    const windowMs = RATE_LIMITS.WINDOW_ONE_HOUR_MS;

    for (let i = 0; i < limit; i++) {
      const result = await limiter.check(key, limit, windowMs);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(limit - 1 - i);
    }
  });

  it("blocks the next request once the limit is exceeded and provides retryAfter", async () => {
    const key = "client:test-hash-2";
    const limit = 5;
    const windowMs = 3600 * 1000;

    for (let i = 0; i < limit; i++) {
      await limiter.check(key, limit, windowMs);
    }

    const blocked = await limiter.check(key, limit, windowMs);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfter).toBeGreaterThan(0);
    expect(blocked.retryAfter).toBeLessThanOrEqual(3600);
  });

  it("enforces district limit (20 reports per hour)", async () => {
    const districtKey = "district:dhemaji";
    const limit = RATE_LIMITS.REPORTS_PER_DISTRICT_PER_HOUR;
    const windowMs = RATE_LIMITS.WINDOW_ONE_HOUR_MS;

    for (let i = 0; i < limit; i++) {
      const res = await limiter.check(districtKey, limit, windowMs);
      expect(res.allowed).toBe(true);
    }

    const blocked = await limiter.check(districtKey, limit, windowMs);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("resets allowances after the time window elapses (using fake timers)", async () => {
    const key = "client:test-hash-3";
    const limit = 3;
    const windowMs = 60 * 1000; // 1 minute

    for (let i = 0; i < limit; i++) {
      await limiter.check(key, limit, windowMs);
    }

    const blockedImmediately = await limiter.check(key, limit, windowMs);
    expect(blockedImmediately.allowed).toBe(false);

    // Advance timers past the window
    vi.advanceTimersByTime(windowMs + 100);

    const allowedAfterWindow = await limiter.check(key, limit, windowMs);
    expect(allowedAfterWindow.allowed).toBe(true);
    expect(allowedAfterWindow.remaining).toBe(limit - 1);
  });

  it("tracks counters independently for different keys", async () => {
    const keyA = "client:user-A";
    const keyB = "client:user-B";
    const limit = 2;
    const windowMs = 60 * 1000;

    await limiter.check(keyA, limit, windowMs);
    await limiter.check(keyA, limit, windowMs);
    expect((await limiter.check(keyA, limit, windowMs)).allowed).toBe(false);

    // User B should still be allowed
    const resB1 = await limiter.check(keyB, limit, windowMs);
    expect(resB1.allowed).toBe(true);
    const resB2 = await limiter.check(keyB, limit, windowMs);
    expect(resB2.allowed).toBe(true);
  });
});
