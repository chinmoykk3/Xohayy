import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  readPreferences,
  writePreferences,
  getDefaultPreferences,
  STORAGE_KEY,
  STORAGE_VERSION,
} from "@/lib/storage";
import type { Preferences } from "@/types";

describe("Preferences Storage Engine (src/lib/storage.ts)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.cookie = "";
    vi.restoreAllMocks();
  });

  it("returns defaults when localStorage is empty", () => {
    const prefs = readPreferences("en");
    expect(prefs.locale).toBe("en");
    expect(prefs.textScale).toBe(1);
    expect(prefs.highContrast).toBe(false);
    expect(prefs.reducedMotion).toBe(false);
    expect(prefs.readGuides).toEqual([]);
    expect(prefs.kitChecked).toEqual([]);
  });

  it("respects OS accessibility media queries in defaults", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches:
          query.includes("prefers-contrast: more") ||
          query.includes("prefers-reduced-motion: reduce"),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const defaults = getDefaultPreferences("as");
    expect(defaults.locale).toBe("as");
    expect(defaults.highContrast).toBe(true);
    expect(defaults.reducedMotion).toBe(true);
  });

  it("saves and reads valid preferences payload", () => {
    const sample: Preferences = {
      locale: "hi",
      districtId: "majuli",
      textScale: 1.25,
      highContrast: true,
      reducedMotion: true,
      readGuides: ["step-1"],
      kitChecked: ["torch"],
    };

    const success = writePreferences(sample);
    expect(success).toBe(true);
    expect(document.cookie).toContain("xahay_locale=hi");

    const read = readPreferences();
    expect(read).toEqual(sample);
  });

  it("prioritizes URL locale over stored locale for active route viewing", () => {
    const sample: Preferences = {
      locale: "hi",
      textScale: 1.5,
      highContrast: false,
      reducedMotion: false,
      readGuides: [],
      kitChecked: [],
    };
    writePreferences(sample);

    const readOnAsPage = readPreferences("as");
    expect(readOnAsPage.locale).toBe("as");
    expect(readOnAsPage.textScale).toBe(1.5);
  });

  it("recovers gracefully from corrupt JSON in storage without throwing", () => {
    window.localStorage.setItem(STORAGE_KEY, "{corrupt-non-json-string");
    const prefs = readPreferences("en");
    expect(prefs.locale).toBe("en");
    expect(prefs.textScale).toBe(1);
  });

  it("recovers gracefully from schema violation or wrong types without throwing", () => {
    const badPayload = {
      version: STORAGE_VERSION,
      data: {
        locale: "invalid-locale",
        textScale: 999,
        highContrast: "not-a-bool",
      },
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(badPayload));

    const prefs = readPreferences("en");
    expect(prefs.locale).toBe("en");
    expect(prefs.textScale).toBe(1);
  });

  it("recovers gracefully from outdated payload version", () => {
    const oldVersionPayload = {
      version: 999,
      data: {
        locale: "en",
        textScale: 1,
        highContrast: false,
        reducedMotion: false,
        readGuides: [],
        kitChecked: [],
      },
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(oldVersionPayload));

    const prefs = readPreferences("en");
    expect(prefs).toEqual(getDefaultPreferences("en"));
  });

  it("handles blocked localStorage reads without throwing (SecurityError)", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError: Access to storage is denied.");
    });

    const prefs = readPreferences("as");
    expect(prefs.locale).toBe("as");
    expect(prefs.textScale).toBe(1);
  });

  it("handles blocked localStorage writes without throwing (QuotaExceededError)", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError: Storage quota exceeded.");
    });

    const sample = getDefaultPreferences("en");
    const result = writePreferences(sample);
    expect(result).toBe(false);
  });
});
