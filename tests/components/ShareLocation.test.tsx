import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ShareLocation } from "@/components/emergency/ShareLocation";
import * as geoLib from "@/lib/geo";

describe("ShareLocation Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders trigger button initially and requests geolocation on click", async () => {
    const getCurrentLocationSpy = vi
      .spyOn(geoLib, "getCurrentLocation")
      .mockResolvedValue({ lat: 26.14, lng: 91.73 });

    render(<ShareLocation locale="en" />);

    const button = screen.getByRole("button", { name: /Share My Location/i });
    expect(button).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(button);
    });

    expect(getCurrentLocationSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/GPS location acquired/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /WhatsApp/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /SMS/i })).toBeInTheDocument();
  });

  it("handles denied/unavailable geolocation with fallback prompt and input", async () => {
    vi.spyOn(geoLib, "getCurrentLocation").mockResolvedValue(null);

    render(<ShareLocation locale="en" />);

    const button = screen.getByRole("button", { name: /Share My Location/i });
    await act(async () => {
      fireEvent.click(button);
    });

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Enter village, road, or nearby landmark/i)
    ).toBeInTheDocument();

    // Custom input updates message
    const input = screen.getByPlaceholderText(/Enter village, road, or nearby landmark/i);
    fireEvent.change(input, { target: { value: "Majuli flood shelter camp 2" } });
    expect(screen.getByText(/Majuli flood shelter camp 2/i)).toBeInTheDocument();
  });
});
