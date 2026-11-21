import type { Locale } from "@/types";
import { t } from "@/i18n/config";

export interface Coordinates {
  lat: number;
  lng: number;
  accuracy?: number;
}

/**
 * Prompts user and requests current device geolocation.
 * Safely resolves to null if denied, timed out, or unavailable.
 */
export async function getCurrentLocation(): Promise<Coordinates | null> {
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
    return null;
  }

  return new Promise<Coordinates | null>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      () => {
        // Permission denied, position unavailable, or timeout
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

/**
 * Builds standard Google Maps / Web coordinate location link.
 */
export function buildMapLink(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

/**
 * Builds localized emergency broadcast text with coordinates or fallback description.
 */
export function buildEmergencyLocationMessage(
  coords: Coordinates | null,
  locale: Locale,
  customDescription?: string
): string {
  if (coords && typeof coords.lat === "number" && typeof coords.lng === "number") {
    const mapUrl = buildMapLink(coords.lat, coords.lng);
    return t(locale, "emergency.locationMessageWithCoords", {
      mapUrl,
      lat: coords.lat.toFixed(5),
      lng: coords.lng.toFixed(5),
    });
  }

  const desc = customDescription?.trim() || t(locale, "emergency.locationUnavailable");
  return t(locale, "emergency.locationMessageWithoutCoords", {
    description: desc,
  });
}

/**
 * Builds encoded WhatsApp sharing URL.
 */
export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/**
 * Builds encoded SMS dispatch URL.
 */
export function buildSmsLink(message: string, recipient = ""): string {
  return `sms:${recipient}?body=${encodeURIComponent(message)}`;
}
