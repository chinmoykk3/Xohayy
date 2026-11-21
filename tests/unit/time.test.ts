import { describe, it, expect } from "vitest";
import { formatRelativeTime, isExpired, parseIsoSafe } from "@/lib/time";

describe("Time & Expiry Helpers (src/lib/time.ts)", () => {
  const baseDate = new Date("2026-07-15T12:00:00.000Z");

  describe("parseIsoSafe", () => {
    it("parses valid date strings and instances", () => {
      const parsed = parseIsoSafe("2026-07-15T12:00:00.000Z");
      expect(parsed).toBeInstanceOf(Date);
      expect(parsed?.toISOString()).toBe("2026-07-15T12:00:00.000Z");

      const fromInstance = parseIsoSafe(baseDate);
      expect(fromInstance?.getTime()).toBe(baseDate.getTime());

      const fromNumber = parseIsoSafe(baseDate.getTime());
      expect(fromNumber?.getTime()).toBe(baseDate.getTime());
    });

    it("returns null on invalid dates", () => {
      expect(parseIsoSafe("not-a-date")).toBeNull();
      expect(parseIsoSafe(new Date("invalid"))).toBeNull();
      // @ts-expect-error Invalid runtime input
      expect(parseIsoSafe(undefined)).toBeNull();
    });
  });

  describe("isExpired", () => {
    it("identifies expired vs active timestamps", () => {
      const past = "2026-07-15T11:00:00.000Z";
      const future = "2026-07-15T13:00:00.000Z";

      expect(isExpired(past, baseDate)).toBe(true);
      expect(isExpired(future, baseDate)).toBe(false);
    });

    it("treats invalid timestamps as expired for safety", () => {
      expect(isExpired("invalid-date", baseDate)).toBe(true);
    });
  });

  describe("formatRelativeTime", () => {
    it("formats relative seconds, minutes, and hours", () => {
      const thirtySecondsAgo = new Date(baseDate.getTime() - 30 * 1000);
      expect(formatRelativeTime(thirtySecondsAgo, "en", baseDate)).toBeDefined();

      const fiveMinutesAgo = new Date(baseDate.getTime() - 5 * 60 * 1000);
      expect(formatRelativeTime(fiveMinutesAgo, "en", baseDate)).toContain("5 minutes ago");

      const twoHoursAgo = new Date(baseDate.getTime() - 2 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoHoursAgo, "en", baseDate)).toContain("2 hours ago");
    });

    it("formats relative days, months, and years", () => {
      const threeDaysAgo = new Date(baseDate.getTime() - 3 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(threeDaysAgo, "en", baseDate)).toContain("3 days ago");

      const twoMonthsAgo = new Date(baseDate.getTime() - 60 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoMonthsAgo, "en", baseDate)).toContain("2 months ago");

      const twoYearsAgo = new Date(baseDate.getTime() - 750 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoYearsAgo, "en", baseDate)).toContain("2 years ago");
    });

    it("formats relative future times in English", () => {
      const inThreeHours = new Date(baseDate.getTime() + 3 * 60 * 60 * 1000);
      expect(formatRelativeTime(inThreeHours, "en", baseDate)).toContain("in 3 hours");
    });

    it("formats relative time in Assamese and Hindi", () => {
      const twoHoursAgo = new Date(baseDate.getTime() - 2 * 60 * 60 * 1000);
      const asRes = formatRelativeTime(twoHoursAgo, "as", baseDate);
      expect(asRes.length).toBeGreaterThan(0);

      const hiRes = formatRelativeTime(twoHoursAgo, "hi", baseDate);
      expect(hiRes.length).toBeGreaterThan(0);
    });

    it("handles invalid inputs without throwing", () => {
      expect(formatRelativeTime("bad-date", "en", baseDate)).toBe("");
      expect(formatRelativeTime(new Date("invalid"), "as", baseDate)).toBe("");
      // @ts-expect-error Testing runtime invalid input
      expect(formatRelativeTime(null, "hi", baseDate)).toBe("");
    });
  });
});
