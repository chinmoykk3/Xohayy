import React from "react";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ShelterList } from "@/components/shelters/ShelterList";
import { PreferencesProvider } from "@/context/PreferencesContext";
import type { Facility } from "@/types";

// Mock ShelterMap to avoid Leaflet DOM complexity when testing ShelterList integration
vi.mock("@/components/shelters/ShelterMap", () => ({
  default: ({ facilities }: { facilities: Facility[] }) => (
    <div data-testid="mock-shelter-map">
      <span>Mocked Map with {facilities.length} facilities</span>
    </div>
  ),
  ShelterMap: ({ facilities }: { facilities: Facility[] }) => (
    <div data-testid="mock-shelter-map">
      <span>Mocked Map with {facilities.length} facilities</span>
    </div>
  ),
}));

const mockFacilities: Facility[] = [
  {
    id: "fac-1",
    districtId: "dhemaji",
    type: "shelter",
    name: { en: "Relief Camp Central", as: "কেন্দ্ৰীয় সাহায্য শিবিৰ", hi: "केंद्रीय राहत शिविर" },
    landmark: { en: "Near Stadium", as: "ষ্টেডিয়ামৰ কাষত", hi: "स्टेडियम के पास" },
    lat: 27.48,
    lng: 94.58,
    capacity: 300,
    phone: "0361222222",
    lastVerified: "2026-11-20",
    isDemo: true,
  },
  {
    id: "fac-2",
    districtId: "dhemaji",
    type: "hospital",
    name: { en: "Dhemaji District Hospital", as: "ধেমাজি জিলা চিকিৎসালয়", hi: "धेमाजी जिला अस्पताल" },
    landmark: { en: "Hospital Road", as: "চিকিৎসালয় পথ", hi: "अस्पताल मार्ग" },
    lat: 27.49,
    lng: 94.59,
    lastVerified: "2026-11-20",
    isDemo: true,
  },
];

function renderWithPreferences(ui: React.ReactElement) {
  return render(<PreferencesProvider initialLocale="en">{ui}</PreferencesProvider>);
}

describe("ShelterList & Lazy Map Integration (Phase 15)", () => {
  beforeEach(() => {
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: true,
    });
    // Mock fetch for /api/shelters
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ facilities: mockFacilities }),
      })
    ) as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders facilities list with accessible list role by default", () => {
    renderWithPreferences(<ShelterList initialFacilities={mockFacilities} locale="en" />);

    // The list is always available as the accessible alternative
    expect(
      screen.getByRole("list", { name: /Shelters & Emergency Facilities/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Relief Camp Central")).toBeInTheDocument();
    expect(screen.getByText("Dhemaji District Hospital")).toBeInTheDocument();
  });

  it("renders map toggle button with initial closed state and accessible attributes", () => {
    renderWithPreferences(<ShelterList initialFacilities={mockFacilities} locale="en" />);

    const toggleBtn = screen.getByRole("button", { name: /Show map/i });
    expect(toggleBtn).toBeInTheDocument();
    expect(toggleBtn).not.toBeDisabled();
    expect(toggleBtn).toHaveAttribute("aria-pressed", "false");
    expect(toggleBtn).toHaveAttribute("aria-expanded", "false");

    // Map should not be visible initially
    expect(screen.queryByTestId("mock-shelter-map")).not.toBeInTheDocument();
  });

  it("toggles map view when user taps Show map button and keeps list accessible", async () => {
    renderWithPreferences(<ShelterList initialFacilities={mockFacilities} locale="en" />);

    const toggleBtn = screen.getByRole("button", { name: /Show map/i });
    fireEvent.click(toggleBtn);

    // Button label changes to Hide map with aria-pressed="true"
    expect(screen.getByRole("button", { name: /Hide map/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Hide map/i })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: /Hide map/i })).toHaveAttribute(
      "aria-expanded",
      "true"
    );

    // Map container appears
    await waitFor(() => {
      expect(screen.getByTestId("mock-shelter-map")).toBeInTheDocument();
    });

    // CRITICAL: The list MUST remain available as the accessible alternative
    expect(
      screen.getByRole("list", { name: /Shelters & Emergency Facilities/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Relief Camp Central")).toBeInTheDocument();

    // Tap again to hide
    fireEvent.click(screen.getByRole("button", { name: /Hide map/i }));
    expect(screen.getByRole("button", { name: /Show map/i })).toBeInTheDocument();
    expect(screen.queryByTestId("mock-shelter-map")).not.toBeInTheDocument();
  });

  it("disables map toggle with explanation when offline", () => {
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: false,
    });

    renderWithPreferences(<ShelterList initialFacilities={mockFacilities} locale="en" />);

    const toggleBtn = screen.getByRole("button", { name: /Show map/i });
    expect(toggleBtn).toBeDisabled();
    expect(toggleBtn).toHaveAttribute("aria-disabled", "true");

    // Offline explanation message visible with role="status"
    const offlineNotice = screen.getByRole("status", {
      name: /Map is unavailable while offline/i,
    });
    expect(offlineNotice).toBeInTheDocument();

    // List continues to work seamlessly from cache
    expect(screen.getByText("Relief Camp Central")).toBeInTheDocument();
  });
});
