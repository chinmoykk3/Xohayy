import { describe, it, expect } from "vitest";
import en from "@/i18n/en.json";
import as from "@/i18n/as.json";
import hi from "@/i18n/hi.json";
import { t, LOCALES, isValidLocale, getDictionary } from "@/i18n/config";
import { getGuide } from "@/lib/data";
import type { Locale } from "@/types";

describe("i18n Dictionary Parity & Quality", () => {
  const enKeys = Object.keys(en);
  const asKeys = Object.keys(as);
  const hiKeys = Object.keys(hi);

  it("contains all English keys in Assamese dictionary", () => {
    const missingInAs = enKeys.filter((k) => !(k in as));
    expect(missingInAs).toEqual([]);
    const extraInAs = asKeys.filter((k) => !(k in en));
    expect(extraInAs).toEqual([]);
  });

  it("contains all English keys in Hindi dictionary", () => {
    const missingInHi = enKeys.filter((k) => !(k in hi));
    expect(missingInHi).toEqual([]);
    const extraInHi = hiKeys.filter((k) => !(k in en));
    expect(extraInHi).toEqual([]);
  });

  it("has zero empty strings in all dictionaries", () => {
    for (const [key, val] of Object.entries(en)) {
      expect(val.trim().length, `en key "${key}" is empty`).toBeGreaterThan(0);
    }
    for (const [key, val] of Object.entries(as)) {
      expect(val.trim().length, `as key "${key}" is empty`).toBeGreaterThan(0);
    }
    for (const [key, val] of Object.entries(hi)) {
      expect(val.trim().length, `hi key "${key}" is empty`).toBeGreaterThan(0);
    }
  });

  it("has identical placeholders in all translations", () => {
    const extractPlaceholders = (text: string) => {
      const matches = text.match(/\{([a-zA-Z0-9_]+)\}/g) || [];
      return matches.sort();
    };

    for (const key of enKeys) {
      const enPlaceholders = extractPlaceholders(en[key as keyof typeof en]);
      const asPlaceholders = extractPlaceholders(as[key as keyof typeof as] || "");
      const hiPlaceholders = extractPlaceholders(hi[key as keyof typeof hi] || "");

      expect(asPlaceholders, `Placeholder mismatch in as for key "${key}"`).toEqual(enPlaceholders);
      expect(hiPlaceholders, `Placeholder mismatch in hi for key "${key}"`).toEqual(enPlaceholders);
    }
  });

  it("translates strings and replaces named placeholders via t()", () => {
    const formatted = t("en", "common.lastUpdated", { time: "14:30" });
    expect(formatted).toBe("Last updated: 14:30");

    const asFormatted = t("as", "common.lastUpdated", { time: "14:30" });
    expect(asFormatted).toBe("সর্বশেষ আপডেট: 14:30");

    const hiFormatted = t("hi", "common.lastUpdated", { time: "14:30" });
    expect(hiFormatted).toBe("अंतिम अपडेट: 14:30");
  });

  it("falls back to English and then key if translation missing", () => {
    // Non-existent key
    expect(t("en", "non.existent.key")).toBe("non.existent.key");
    expect(t("as", "non.existent.key")).toBe("non.existent.key");
  });

  it("validates locale codes", () => {
    expect(isValidLocale("en")).toBe(true);
    expect(isValidLocale("as")).toBe(true);
    expect(isValidLocale("hi")).toBe(true);
    expect(isValidLocale("fr")).toBe(false);
    expect(isValidLocale(null)).toBe(false);
  });

  it("retrieves full dictionary with fallback", () => {
    expect(getDictionary("en")).toBeDefined();
    expect(getDictionary("as")["common.emergency"]).toBe("জৰুৰীকালীন");
    expect(getDictionary("hi")["common.emergency"]).toBe("आपातकालीन");
  });
});

describe("Localized Evacuation Guides Parity & Constraints", () => {
  const hazards: ("flood" | "landslide")[] = ["flood", "landslide"];

  it("verifies all guides load cleanly across en, as, hi", () => {
    for (const hazard of hazards) {
      for (const locale of LOCALES) {
        const guide = getGuide(hazard, locale as Locale);
        expect(guide, `Guide missing for ${hazard} in ${locale}`).not.toBeNull();
        expect(guide!.steps.length).toBe(24);
      }
    }
  });

  it("enforces <= 14 words per step for all languages and guides", () => {
    for (const hazard of hazards) {
      for (const locale of LOCALES) {
        const guide = getGuide(hazard, locale as Locale)!;
        for (const step of guide.steps) {
          const wordCount = step.text.trim().split(/\s+/).length;
          expect(
            wordCount,
            `${hazard} (${locale}) step ${step.id} has ${wordCount} words (exceeds 14): "${step.text}"`
          ).toBeLessThanOrEqual(14);
        }
      }
    }
  });

  it("enforces identical step IDs and phases across all languages", () => {
    for (const hazard of hazards) {
      const enGuide = getGuide(hazard, "en")!;
      const asGuide = getGuide(hazard, "as")!;
      const hiGuide = getGuide(hazard, "hi")!;

      const enIds = enGuide.steps.map((s) => s.id);
      const asIds = asGuide.steps.map((s) => s.id);
      const hiIds = hiGuide.steps.map((s) => s.id);

      expect(asIds).toEqual(enIds);
      expect(hiIds).toEqual(enIds);

      const enPhases = enGuide.steps.map((s) => s.phase);
      const asPhases = asGuide.steps.map((s) => s.phase);
      const hiPhases = hiGuide.steps.map((s) => s.phase);

      expect(asPhases).toEqual(enPhases);
      expect(hiPhases).toEqual(enPhases);
    }
  });
});
