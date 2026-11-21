import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getCurrentLocation,
  buildMapLink,
  buildEmergencyLocationMessage,
  buildWhatsAppLink,
  buildSmsLink,
} from "@/lib/geo";

describe("Geolocation & Emergency Dispatch Helpers (src/lib/geo.ts)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("builds map coordinate URL", () => {
    const link = buildMapLink(26.1445, 91.7362);
    expect(link).toBe("https://www.google.com/maps?q=26.1445,91.7362");
  });

  it("builds emergency message with coordinates and map URL", () => {
    const messageEn = buildEmergencyLocationMessage({ lat: 27.48, lng: 94.9 }, "en");
    expect(messageEn).toContain("EMERGENCY:");
    expect(messageEn).toContain("27.48000");
    expect(messageEn).toContain("94.90000");
    expect(messageEn).toContain("https://www.google.com/maps?q=27.48,94.9");

    const messageAs = buildEmergencyLocationMessage({ lat: 27.48, lng: 94.9 }, "as");
    expect(messageAs).toContain("জৰুৰীকালীন:");
    expect(messageAs).toContain("https://www.google.com/maps?q=27.48,94.9");
  });

  it("falls back gracefully when coordinates are missing or denied", () => {
    const messageDefault = buildEmergencyLocationMessage(null, "en");
    expect(messageDefault).toContain("EMERGENCY:");
    expect(messageDefault).toContain("Location unavailable");

    const customDesc = "Near Silapathar bridge, water knee-deep";
    const messageCustom = buildEmergencyLocationMessage(null, "en", customDesc);
    expect(messageCustom).toContain(customDesc);
  });

  it("encodes WhatsApp dispatch URL correctly", () => {
    const text = "Help! Lat: 26.14 & Lng: 91.73";
    const waUrl = buildWhatsAppLink(text);
    expect(waUrl).toBe("https://wa.me/?text=Help!%20Lat%3A%2026.14%20%26%20Lng%3A%2091.73");
  });

  it("encodes SMS dispatch URL correctly", () => {
    const text = "Emergency assistance needed";
    const smsUrl = buildSmsLink(text, "112");
    expect(smsUrl).toBe("sms:112?body=Emergency%20assistance%20needed");
  });

  it("resolves device geolocation when available", async () => {
    const mockPosition = {
      coords: {
        latitude: 26.18,
        longitude: 91.75,
        accuracy: 15,
      },
    };

    const mockGeolocation = {
      getCurrentPosition: vi.fn((success) => success(mockPosition)),
    };

    Object.defineProperty(globalThis.navigator, "geolocation", {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    });

    const location = await getCurrentLocation();
    expect(location).toEqual({
      lat: 26.18,
      lng: 91.75,
      accuracy: 15,
    });
  });

  it("returns null when geolocation is denied or throws", async () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn((_success, error) => error(new Error("User denied Geolocation"))),
    };

    Object.defineProperty(globalThis.navigator, "geolocation", {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    });

    const location = await getCurrentLocation();
    expect(location).toBeNull();
  });
});
