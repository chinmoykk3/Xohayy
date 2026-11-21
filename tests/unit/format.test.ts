import { describe, it, expect } from "vitest";
import { formatNumber, formatDate, formatTime, formatDateTime } from "@/lib/format";

describe("Format Helpers (src/lib/format.ts)", () => {
  describe("formatNumber", () => {
    it("formats standard numbers across locales", () => {
      expect(formatNumber(1250, "en")).toContain("1,250");
      expect(formatNumber(0, "en")).toBe("0");
      expect(formatNumber(100, "as")).toBeDefined();
      expect(formatNumber(100, "hi")).toBeDefined();
    });

    it("handles invalid or non-finite numbers without throwing", () => {
      expect(formatNumber(NaN, "en")).toBe("-");
      expect(formatNumber(Infinity, "as")).toBe("-");
      expect(formatNumber(-Infinity, "hi")).toBe("-");
      // @ts-expect-error Testing runtime invalid input
      expect(formatNumber(undefined, "en")).toBe("-");
    });
  });

  describe("formatDate", () => {
    it("formats valid dates across locales", () => {
      const date = "2026-07-15T10:00:00.000Z";
      const enDate = formatDate(date, "en");
      expect(enDate).toContain("2026");

      const asDate = formatDate(date, "as");
      expect(asDate.length).toBeGreaterThan(0);

      const hiDate = formatDate(date, "hi");
      expect(hiDate.length).toBeGreaterThan(0);
    });

    it("handles invalid dates without throwing", () => {
      expect(formatDate("invalid-date-string", "en")).toBe("");
      expect(formatDate("", "as")).toBe("");
      expect(formatDate(new Date("invalid"), "hi")).toBe("");
      // @ts-expect-error Testing runtime invalid input
      expect(formatDate(null, "en")).toBe("");
    });
  });

  describe("formatTime", () => {
    it("formats valid times across locales", () => {
      const date = "2026-07-15T14:30:00.000Z";
      const enTime = formatTime(date, "en");
      expect(enTime.length).toBeGreaterThan(0);

      const asTime = formatTime(date, "as");
      expect(asTime.length).toBeGreaterThan(0);

      const hiTime = formatTime(date, "hi");
      expect(hiTime.length).toBeGreaterThan(0);
    });

    it("handles invalid inputs without throwing", () => {
      expect(formatTime("bad-time", "en")).toBe("");
      expect(formatTime(NaN, "as")).toBe("");
    });
  });

  describe("formatDateTime", () => {
    it("formats combined date and time across locales", () => {
      const date = "2026-07-15T14:30:00.000Z";
      const enDateTime = formatDateTime(date, "en");
      expect(enDateTime).toContain("2026");

      const asDateTime = formatDateTime(date, "as");
      expect(asDateTime.length).toBeGreaterThan(0);
    });

    it("handles invalid inputs without throwing", () => {
      expect(formatDateTime("bad-date-time", "en")).toBe("");
      expect(formatDateTime(new Date("invalid"), "hi")).toBe("");
    });
  });
});
