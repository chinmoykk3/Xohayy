import React from "react";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ShelterMap } from "@/components/shelters/ShelterMap";
import type { Facility } from "@/types";

const mockFacilities: Facility[] = [
  {
    id: "fac-1",
    districtId: "dhemaji",
    type: "shelter",
    name: { en: "Dhemaji Relief Camp A", as: "ধেমাজি শিবিৰ ১", hi: "धेमाजी शिविर १" },
    landmark: { en: "Near College Gate", as: "কলেজ গেটৰ কাষত", hi: "कॉलेज गेट के पास" },
    lat: 27.485,
    lng: 94.582,
    capacity: 250,
    phone: "0361211111",
    lastVerified: "2026-11-20",
    isDemo: true,
  },
  {
    id: "fac-2",
    districtId: "dhemaji",
    type: "hospital",
    name: { en: "Civil Hospital Dhemaji", as: "অসামৰিক চিকিৎসালয়", hi: "नागरिक अस्पताल" },
    landmark: { en: "Main Road", as: "মুখ্য পথ", hi: "मुख्य मार्ग" },
    lat: 27.492,
    lng: 94.575,
    lastVerified: "2026-11-20",
    isDemo: false,
  },
  {
    id: "fac-no-coords",
    districtId: "dhemaji",
    type: "shelter",
    name: { en: "Unmapped Community Shelter", as: "নথিবিহীন শিবিৰ", hi: "गैर-मानचित्रित शिविर" },
    landmark: { en: "Remote Village", as: "দূৰৈৰ গাঁও", hi: "दूरस्थ गाँव" },
    // No lat/lng
    lastVerified: "2026-11-20",
    isDemo: true,
  },
];

describe("ShelterMap Component (Phase 15)", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders container with accessible region role and localized aria-label", () => {
    render(<ShelterMap facilities={mockFacilities} locale="en" />);
    const mapRegion = screen.getByRole("region", { name: /Shelter and emergency facility map/i });
    expect(mapRegion).toBeInTheDocument();
    expect(mapRegion).toHaveAttribute("id", "shelter-map");
  });

  it("renders OpenStreetMap attribution visibly in the DOM per spec", () => {
    render(<ShelterMap facilities={mockFacilities} locale="en" />);
    const osmAttribution = screen.getByText(/OpenStreetMap/i);
    expect(osmAttribution).toBeInTheDocument();
  });

  it("adds markers only for facilities with coordinates and renders accessible titles", () => {
    render(<ShelterMap facilities={mockFacilities} locale="en" />);

    // Facilities with coordinates should have marker elements with titles
    expect(screen.getByTitle("Dhemaji Relief Camp A")).toBeInTheDocument();
    expect(screen.getByTitle("Civil Hospital Dhemaji")).toBeInTheDocument();

    // Facility without coordinates must NOT have a marker title
    expect(screen.queryByTitle("Unmapped Community Shelter")).not.toBeInTheDocument();
  });

  it("supports Assamese and Hindi localization for accessible region label", () => {
    const { unmount } = render(<ShelterMap facilities={mockFacilities} locale="as" />);
    expect(
      screen.getByRole("region", { name: /আশ্ৰয় শিবিৰ আৰু জৰুৰীকালীন কেন্দ্ৰৰ মেপ/i })
    ).toBeInTheDocument();
    unmount();

    render(<ShelterMap facilities={mockFacilities} locale="hi" />);
    expect(
      screen.getByRole("region", { name: /राहत शिविर और आपातकालीन सुविधा मैप/i })
    ).toBeInTheDocument();
  });
});
