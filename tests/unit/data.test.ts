import { describe, expect, it } from "vitest";
import { getDistricts, getHelplines, getFacilities, getSampleAlerts, getGuide } from "@/lib/data";

describe("Seed Data Integrity & Validation (Phase 5)", () => {
  it("parses every district against districtSchema with required multilingual fields", () => {
    const districts = getDistricts();
    expect(districts).toHaveLength(10);

    const expectedSlugs = [
      "dhemaji",
      "lakhimpur",
      "majuli",
      "dibrugarh",
      "barpeta",
      "morigaon",
      "kamrup-metropolitan",
      "cachar",
      "jorhat",
      "golaghat",
    ];

    for (const slug of expectedSlugs) {
      const match = districts.find((d) => d.id === slug);
      expect(match).toBeDefined();
      expect(match?.state).toBe("Assam");
      expect(match?.name.en).toBeTruthy();
      expect(match?.name.as).toBeTruthy();
      expect(match?.name.hi).toBeTruthy();
      expect(match?.controlRoom).toBeTruthy();
    }
  });

  it("parses every helpline and verifies source and human verification attribution", () => {
    const helplines = getHelplines();
    expect(helplines.length).toBeGreaterThanOrEqual(6);

    const nationalNumbers = ["112", "100", "101", "108"];
    for (const num of nationalNumbers) {
      const match = helplines.find((h) => h.number === num);
      expect(match).toBeDefined();
      expect(match?.source).toBeTruthy();
      expect(match?.verifiedOn).toBeTruthy();
    }

    // State & district helplines
    expect(helplines.find((h) => h.number === "1070")).toBeDefined();
    expect(helplines.find((h) => h.number === "1077")).toBeDefined();
  });

  it("parses all shelters and confirms every facility has an isDemo flag", () => {
    const facilities = getFacilities();
    expect(facilities.length).toBe(50); // 10 districts * 5 facilities

    for (const fac of facilities) {
      expect(fac.isDemo).toBe(true);
      expect(fac.name.en).toContain("Sample");
      expect(fac.landmark.en).toBeTruthy();
      expect(fac.lastVerified).toBeTruthy();
    }
  });

  it("parses sample alerts, confirms demo labeling and exactly one expired alert", () => {
    const alerts = getSampleAlerts();
    expect(alerts).toHaveLength(8);

    // Every alert must have isDemo: true and explicit source
    for (const alert of alerts) {
      expect(alert.isDemo).toBe(true);
      expect(alert.source).toBe("Demo data");
    }

    // Reference timestamp based on build plan baseline
    const referenceNow = new Date("2026-11-21T10:00:00Z").getTime();
    const expiredAlerts = alerts.filter(
      (alert) => new Date(alert.validUntil).getTime() < referenceNow
    );

    expect(expiredAlerts).toHaveLength(1);
    expect(expiredAlerts[0]?.id).toBe("alert-008-expired");

    const activeAlerts = alerts.filter(
      (alert) => new Date(alert.validUntil).getTime() >= referenceNow
    );
    expect(activeAlerts).toHaveLength(7);
  });

  it("confirms guide steps have icons and NO step exceeds 14 words", () => {
    const floodGuide = getGuide("flood");
    expect(floodGuide).not.toBeNull();
    expect(floodGuide?.steps.length).toBe(24);

    const landslideGuide = getGuide("landslide");
    expect(landslideGuide).not.toBeNull();
    expect(landslideGuide?.steps.length).toBe(24);

    const allGuides = [floodGuide!, landslideGuide!];

    for (const guide of allGuides) {
      for (const step of guide.steps) {
        expect(["before", "during", "after"]).toContain(step.phase);
        expect(step.icon).toBeTruthy();

        // Count words strictly
        const words = step.text.trim().split(/\s+/);
        expect(words.length).toBeGreaterThan(0);
        expect(words.length).toBeLessThanOrEqual(14);
      }
    }
  });
});
