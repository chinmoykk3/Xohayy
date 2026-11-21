import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ShelterCard } from "@/components/shelters/ShelterCard";
import type { Facility } from "@/types";

const mockFacility: Facility = {
  id: "shelter-dhemaji-1",
  districtId: "dhemaji",
  type: "shelter",
  name: { en: "Sample Relief Camp A", as: "নমুনা সাহায্য শিবিৰ ক", hi: "नमूना राहत शिविर क" },
  landmark: { en: "Near Town Hall, Silapathar", as: "টাউন হলৰ ওচৰত", hi: "टाउन हॉल के पास" },
  phone: "1077",
  capacity: 450,
  lat: 27.48,
  lng: 94.55,
  lastVerified: "2026-11-20T00:00:00Z",
  isDemo: true,
};

describe("ShelterCard Component", () => {
  it("renders facility name, landmark, capacity and demo tag", () => {
    render(<ShelterCard facility={mockFacility} locale="en" />);

    expect(screen.getByText("Sample Relief Camp A")).toBeInTheDocument();
    expect(screen.getByText("Near Town Hall, Silapathar")).toBeInTheDocument();
    expect(screen.getByText(/450 people/i)).toBeInTheDocument();
    expect(screen.getByText(/Demo Data/i)).toBeInTheDocument();
  });

  it("renders a working call button with tel: link", () => {
    render(<ShelterCard facility={mockFacility} locale="en" />);

    const callLink = screen.getByRole("link", { name: /Call/i });
    expect(callLink).toHaveAttribute("href", "tel:1077");
  });

  it("copies address to clipboard and announces status to screen readers", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<ShelterCard facility={mockFacility} locale="en" />);

    const copyBtn = screen.getByRole("button", { name: /Copy Address/i });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith("Sample Relief Camp A, Near Town Hall, Silapathar");

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Address copied to clipboard");
    });
  });

  it("renders maps external link with lat and lng coordinates", () => {
    render(<ShelterCard facility={mockFacility} locale="en" />);

    const mapsLink = screen.getByRole("link", { name: /Open in Maps/i });
    expect(mapsLink).toHaveAttribute(
      "href",
      "https://www.google.com/maps/search/?api=1&query=27.48,94.55"
    );
    expect(mapsLink).toHaveAttribute("target", "_blank");
  });
});
