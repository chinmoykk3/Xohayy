import type { Locale } from "@/types";
import { INTL_LOCALE_MAP } from "@/i18n/config";

/**
 * Safely parses input into a valid Date instance or returns null.
 */
export function parseIsoSafe(input: string | number | Date): Date | null {
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }
  if (typeof input === "string" || typeof input === "number") {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/**
 * Checks whether an expiry timestamp has already passed.
 * Returns true if expired or invalid.
 */
export function isExpired(validUntil: string | number | Date, now: Date = new Date()): boolean {
  const d = parseIsoSafe(validUntil);
  if (!d) return true;
  return d.getTime() <= now.getTime();
}

/**
 * Formats relative time (e.g. "5 minutes ago", "in 2 hours") per locale.
 * Never throws on invalid dates.
 */
export function formatRelativeTime(
  date: string | number | Date,
  locale: Locale,
  baseDate: Date = new Date()
): string {
  const d = parseIsoSafe(date);
  if (!d) return "";

  try {
    const intlLocale = INTL_LOCALE_MAP[locale] || "en-IN";
    const rtf = new Intl.RelativeTimeFormat(intlLocale, { numeric: "auto" });

    const diffSeconds = Math.round((d.getTime() - baseDate.getTime()) / 1000);
    const absSeconds = Math.abs(diffSeconds);

    if (absSeconds < 60) {
      return rtf.format(diffSeconds, "second");
    }

    const diffMinutes = Math.round(diffSeconds / 60);
    const absMinutes = Math.abs(diffMinutes);
    if (absMinutes < 60) {
      return rtf.format(diffMinutes, "minute");
    }

    const diffHours = Math.round(diffMinutes / 60);
    const absHours = Math.abs(diffHours);
    if (absHours < 24) {
      return rtf.format(diffHours, "hour");
    }

    const diffDays = Math.round(diffHours / 24);
    const absDays = Math.abs(diffDays);
    if (absDays < 30) {
      return rtf.format(diffDays, "day");
    }

    const diffMonths = Math.round(diffDays / 30);
    const absMonths = Math.abs(diffMonths);
    if (absMonths < 12) {
      return rtf.format(diffMonths, "month");
    }

    const diffYears = Math.round(diffDays / 365);
    return rtf.format(diffYears, "year");
  } catch {
    return "";
  }
}
