import { describe, it, expect } from "vitest";
import { isAlertExpired, filterAlerts, sortAlerts } from "@/lib/alerts";
import type { Alert } from "@/types";

const mockAlerts: Alert[] = [
  {
    id: "alert-low-old",
    districtId: "dhemaji",
    hazard: "flood",
    risk: "low",
    title: { en: "Low Flood", as: "নিম্ন বান", hi: "कम बाढ़" },
    message: { en: "Minor water rise", as: "সামান্য পানী বৃদ্ধি", hi: "मामूली जल वृद्धि" },
    source: "Demo data",
    isDemo: true,
    issuedAt: "2026-11-20T08:00:00Z",
    validUntil: "2026-11-25T18:00:00Z",
  },
  {
    id: "alert-severe-new",
    districtId: "dhemaji",
    hazard: "flood",
    risk: "severe",
    title: { en: "Severe Inundation", as: "ভয়ংকৰ বান", hi: "भीषण जलभराव" },
    message: { en: "Critical level breached", as: "বিপদসীমা পাৰ", hi: "खतरे का निशान पार" },
    source: "ASDMA",
    isDemo: false,
    issuedAt: "2026-11-21T06:00:00Z",
    validUntil: "2026-11-24T18:00:00Z",
  },
  {
    id: "alert-high-landslide",
    districtId: "kamrup_metro",
    hazard: "landslide",
    risk: "high",
    title: { en: "Hills Landslide", as: "পাহাৰীয়া ভূমিস্খলন", hi: "पहाड़ी भूस्खलन" },
    message: { en: "Soil instability", as: "মাটি খহনীয়া", hi: "मिट्टी का कटाव" },
    source: "Demo data",
    isDemo: true,
    issuedAt: "2026-11-21T04:00:00Z",
    validUntil: "2026-11-23T18:00:00Z",
  },
  {
    id: "alert-expired",
    districtId: "dhemaji",
    hazard: "storm",
    risk: "moderate",
    title: { en: "Thunderstorm Warning", as: "ধুমুহাৰ সতৰ্কতা", hi: "तूफान चेतावनी" },
    message: { en: "High wind gusts", as: "প্ৰবল বতাহ", hi: "तेज हवाएं" },
    source: "Demo data",
    isDemo: true,
    issuedAt: "2026-11-18T10:00:00Z",
    validUntil: "2026-11-19T10:00:00Z", // In the past relative to ref date
  },
];

const referenceDate = new Date("2026-11-21T12:00:00Z");

describe("Alerts Logic (Section 26.2)", () => {
  it("filters alerts by district", () => {
    const results = filterAlerts(mockAlerts, {
      districtId: "kamrup_metro",
      includeExpired: true,
      now: referenceDate,
    });

    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe("alert-high-landslide");
  });

  it("filters alerts by hazard", () => {
    const results = filterAlerts(mockAlerts, {
      hazard: "flood",
      includeExpired: true,
      now: referenceDate,
    });

    expect(results).toHaveLength(2);
    expect(results.every((a) => a.hazard === "flood")).toBe(true);
  });

  it("hides expired alerts by default", () => {
    const results = filterAlerts(mockAlerts, {
      now: referenceDate,
    });

    expect(results).toHaveLength(3);
    expect(results.some((a) => a.id === "alert-expired")).toBe(false);
  });

  it("includes expired alerts when requested", () => {
    const results = filterAlerts(mockAlerts, {
      includeExpired: true,
      now: referenceDate,
    });

    expect(results).toHaveLength(4);
    expect(results.some((a) => a.id === "alert-expired")).toBe(true);
  });

  it("sorts by risk level then by issue time", () => {
    // Expected risk order: severe > high > moderate > low
    const sorted = sortAlerts(mockAlerts);

    expect(sorted[0]?.risk).toBe("severe");
    expect(sorted[1]?.risk).toBe("high");
    expect(sorted[2]?.risk).toBe("moderate");
    expect(sorted[3]?.risk).toBe("low");
  });

  it("sorts alerts of identical risk level by issue time descending", () => {
    const sameRiskAlerts: Alert[] = [
      {
        ...mockAlerts[0]!,
        id: "alert-1",
        risk: "high",
        issuedAt: "2026-11-21T01:00:00Z",
      },
      {
        ...mockAlerts[0]!,
        id: "alert-2",
        risk: "high",
        issuedAt: "2026-11-21T09:00:00Z", // newer
      },
    ];

    const sorted = sortAlerts(sameRiskAlerts);
    expect(sorted[0]?.id).toBe("alert-2");
    expect(sorted[1]?.id).toBe("alert-1");
  });

  it("handles an empty list gracefully", () => {
    expect(filterAlerts([])).toEqual([]);
    expect(sortAlerts([])).toEqual([]);
  });

  it("correctly evaluates isAlertExpired", () => {
    expect(isAlertExpired(mockAlerts[3]!, referenceDate)).toBe(true);
    expect(isAlertExpired(mockAlerts[1]!, referenceDate)).toBe(false);
  });
});
