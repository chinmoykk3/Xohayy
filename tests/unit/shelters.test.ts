import { describe, it, expect } from "vitest";
import {
  filterFacilities,
  SeedFacilitiesRepository,
  getFacilitiesRepository,
} from "@/lib/shelters";
import type { Facility } from "@/types";

describe("shelters library", () => {
  const sampleFacilities: Facility[] = [
    {
      id: "f1",
      districtId: "dhemaji",
      type: "shelter",
      name: { en: "Sample Relief Camp A", as: "নমুনা সাহায্য শিবিৰ ক", hi: "नमूना राहत शिविर क" },
      landmark: { en: "Near Town Hall", as: "টাউন হলৰ ওচৰত", hi: "टाउन हॉल के पास" },
      phone: "1077",
      capacity: 350,
      lastVerified: "2026-11-20T00:00:00Z",
      isDemo: true,
    },
    {
      id: "f2",
      districtId: "dhemaji",
      type: "hospital",
      name: {
        en: "Community Health Facility 1",
        as: "সামূহিক স্বাস্থ্য কেন্দ্ৰ ১",
        hi: "सामुदायिक स्वास्थ्य केंद्र १",
      },
      landmark: { en: "Station Road", as: "ষ্টেচন ৰোড", hi: "स्टेशन रोड" },
      phone: "108",
      capacity: 100,
      lastVerified: "2026-11-20T00:00:00Z",
      isDemo: true,
    },
    {
      id: "f3",
      districtId: "majuli",
      type: "shelter",
      name: { en: "Sample Relief Camp B", as: "নমুনা সাহায্য শিবিৰ খ", hi: "नमूना राहत शिविर ख" },
      landmark: { en: "High School Field", as: "হাইস্কুল ফিল্ড", hi: "हाई स्कूल मैदान" },
      phone: "1077",
      capacity: 200,
      lastVerified: "2026-11-20T00:00:00Z",
      isDemo: true,
    },
  ];

  it("filters facilities by district", () => {
    const dhemajiFacilities = filterFacilities(sampleFacilities, { districtId: "dhemaji" });
    expect(dhemajiFacilities.length).toBe(2);
    expect(dhemajiFacilities.every((f) => f.districtId === "dhemaji")).toBe(true);
  });

  it("filters facilities by type", () => {
    const hospitals = filterFacilities(sampleFacilities, { type: "hospital" });
    expect(hospitals.length).toBe(1);
    expect(hospitals[0]!.id).toBe("f2");
  });

  it("filters facilities by search query matching name or landmark", () => {
    const matched = filterFacilities(sampleFacilities, { search: "Station" });
    expect(matched.length).toBe(1);
    expect(matched[0]!.id).toBe("f2");

    const matchedLandmark = filterFacilities(sampleFacilities, { search: "Town Hall" });
    expect(matchedLandmark.length).toBe(1);
    expect(matchedLandmark[0]!.id).toBe("f1");
  });

  it("filters facilities by search query in Assamese and Hindi", () => {
    const matchedAs = filterFacilities(sampleFacilities, { search: "সামূহিক" }, "as");
    expect(matchedAs.length).toBe(1);
    expect(matchedAs[0]!.id).toBe("f2");

    const matchedHi = filterFacilities(sampleFacilities, { search: "मैदान" }, "hi");
    expect(matchedHi.length).toBe(1);
    expect(matchedHi[0]!.id).toBe("f3");
  });

  it("SeedFacilitiesRepository implements find and findById", async () => {
    const repo = new SeedFacilitiesRepository(sampleFacilities);
    const results = await repo.find({ districtId: "majuli" });
    expect(results.length).toBe(1);
    expect(results[0]!.id).toBe("f3");

    const found = await repo.findById("f2");
    expect(found).not.toBeNull();
    expect(found?.name.en).toBe("Community Health Facility 1");

    const notFound = await repo.findById("non-existent");
    expect(notFound).toBeNull();
  });

  it("getFacilitiesRepository returns a singleton repository instance with loaded data", async () => {
    const repo = getFacilitiesRepository();
    const facilities = await repo.find();
    expect(facilities.length).toBeGreaterThan(0);
  });
});
