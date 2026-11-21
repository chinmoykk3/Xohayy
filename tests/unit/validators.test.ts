import { describe, expect, it } from "vitest";
import {
  cleanText,
  cleanTextSchema,
  districtSchema,
  alertSchema,
  helplineSchema,
  facilitySchema,
  guideSchema,
  reportSchema,
  preferencesSchema,
  alertsQuerySchema,
  sheltersQuerySchema,
  createReportSchema,
} from "@/lib/validators";

describe("Input Sanitization & Validation Schemas", () => {
  it("cleanText trims, collapses repeated whitespace, and strips control characters", () => {
    const dirty = "\u0000\u0007  Heavy   rainfall   in   Majuli  \r\n\u001F  ";
    expect(cleanText(dirty)).toBe("Heavy rainfall in Majuli");
  });

  it("cleanTextSchema applies sanitization before enforcing length bounds", () => {
    const schema = cleanTextSchema(3, 20);
    const result = schema.parse("   Valid text   ");
    expect(result).toBe("Valid text");

    expect(() => schema.parse("  a  ")).toThrow();
  });

  it("validates District schema correctly", () => {
    const validDistrict = {
      id: "dhemaji",
      name: {
        en: "Dhemaji",
        as: "ধেমা Sanctuary",
        hi: "धेमाजी",
      },
      state: "Assam",
      controlRoom: "03753-224488",
      lat: 27.48,
      lng: 94.58,
    };

    expect(districtSchema.parse(validDistrict).id).toBe("dhemaji");
  });

  it("validates Alert schema correctly", () => {
    const validAlert = {
      id: "alert-001",
      districtId: "dhemaji",
      hazard: "flood",
      risk: "high",
      title: {
        en: "Brahmaputra Rising",
        as: "ব্ৰহ্মপুত্ৰৰ জলপৃষ্ঠ বৃদ্ধি",
        hi: "ब्रह्मपुत्र जलस्तर वृद्धि",
      },
      message: {
        en: "Water level crossed danger mark.",
        as: "পানী বিপদসীমা পাৰ হৈছে।",
        hi: "पानी खतरे के निशान से ऊपर।",
      },
      source: "ASDMA advisory",
      isDemo: true,
      issuedAt: "2026-11-21T06:00:00Z",
      validUntil: "2026-11-22T06:00:00Z",
    };

    expect(alertSchema.parse(validAlert).risk).toBe("high");
  });

  it("validates Helpline schema correctly", () => {
    const validHelpline = {
      id: "hl-112",
      label: {
        en: "National Emergency",
        as: "ৰাষ্ট্ৰীয় জৰুৰীকালীন সেৱা",
        hi: "राष्ट्रीय आपातकालीन सेवा",
      },
      number: "112",
      scope: "national",
      available: "24x7",
    };

    expect(helplineSchema.parse(validHelpline).number).toBe("112");
  });

  it("validates Facility schema correctly", () => {
    const validFacility = {
      id: "fac-1",
      districtId: "dhemaji",
      type: "shelter",
      name: {
        en: "Dhemaji Higher Secondary School",
        as: "ধেমা বিদ্যালয়",
        hi: "धेमाजी विद्यालय",
      },
      landmark: {
        en: "Near DC Office",
        as: "ডি চি কাৰ্যালয়ৰ ওচৰত",
        hi: "डीसी कार्यालय के पास",
      },
      capacity: 250,
      lastVerified: "2026-11-20",
      isDemo: true,
    };

    expect(facilitySchema.parse(validFacility).type).toBe("shelter");
  });

  it("validates Guide schema correctly", () => {
    const validGuide = {
      hazard: "flood",
      title: { en: "Flood Evacuation", as: "বানপানী সুৰক্ষা", hi: "बाढ़ सुरक्षा" },
      steps: [
        {
          id: "step-1",
          phase: "before",
          icon: "shield",
          text: {
            en: "Pack an emergency kit",
            as: "জৰুৰীকালীন বেগ সাজু ৰাখক",
            hi: "आपातकालीन किट तैयार रखें",
          },
        },
      ],
    };

    expect(guideSchema.parse(validGuide).steps).toHaveLength(1);
  });

  it("validates Report schema correctly", () => {
    const validReport = {
      id: "rep-001",
      districtId: "barpeta",
      type: "road_blocked",
      note: "NH 31 submerged under 2 feet water.",
      place: "Howly bypass",
      status: "pending",
      createdAt: "2026-11-21T07:30:00Z",
      clientHash: "a1b2c3d4e5f6g7h8",
    };

    expect(reportSchema.parse(validReport).type).toBe("road_blocked");
  });

  it("validates Preferences schema correctly", () => {
    const validPref = {
      locale: "as",
      districtId: "majuli",
      textScale: 1.25,
      highContrast: true,
      reducedMotion: false,
      readGuides: ["guide-1"],
      kitChecked: ["item-water"],
    };

    expect(preferencesSchema.parse(validPref).locale).toBe("as");
  });

  it("validates query schemas", () => {
    expect(
      alertsQuerySchema.parse({ districtId: "majuli", hazard: "flood", includeExpired: "true" })
    ).toEqual({
      districtId: "majuli",
      hazard: "flood",
      includeExpired: true,
    });

    expect(sheltersQuerySchema.parse({ districtId: "cachar", type: "hospital" })).toEqual({
      districtId: "cachar",
      type: "hospital",
    });
  });

  it("rejects createReportSchema when honeypot is filled by bot", () => {
    const botPayload = {
      districtId: "kamrup",
      type: "area_flooded",
      note: "Flooding reported",
      honeypot: "spam_content_bot",
    };

    expect(() => createReportSchema.parse(botPayload)).toThrow();
  });
});
