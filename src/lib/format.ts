import type { Locale } from "@/types";
import { INTL_LOCALE_MAP } from "@/i18n/config";

/**
 * Safely parses input into a valid Date instance or returns null.
 */
function parseDateSafe(input: string | number | Date): Date | null {
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
 * Formats a number according to the specified locale.
 * Never throws on NaN or infinite numbers.
 */
export function formatNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions
): string {
  if (typeof value !== "number" || !isFinite(value)) {
    return "-";
  }

  try {
    const intlLocale = INTL_LOCALE_MAP[locale] || "en-IN";
    return new Intl.NumberFormat(intlLocale, options).format(value);
  } catch {
    return String(value);
  }
}

/**
 * Formats a calendar date according to the specified locale.
 * Never throws on invalid dates.
 */
export function formatDate(
  date: string | number | Date,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = parseDateSafe(date);
  if (!d) return "";

  try {
    const intlLocale = INTL_LOCALE_MAP[locale] || "en-IN";
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Intl.DateTimeFormat(intlLocale, options ?? defaultOptions).format(d);
  } catch {
    return "";
  }
}

/**
 * Formats a clock time according to the specified locale.
 * Never throws on invalid dates.
 */
export function formatTime(
  date: string | number | Date,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = parseDateSafe(date);
  if (!d) return "";

  try {
    const intlLocale = INTL_LOCALE_MAP[locale] || "en-IN";
    const defaultOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return new Intl.DateTimeFormat(intlLocale, options ?? defaultOptions).format(d);
  } catch {
    return "";
  }
}

/**
 * Formats both date and time according to the specified locale.
 * Never throws on invalid dates.
 */
export function formatDateTime(
  date: string | number | Date,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = parseDateSafe(date);
  if (!d) return "";

  try {
    const intlLocale = INTL_LOCALE_MAP[locale] || "en-IN";
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return new Intl.DateTimeFormat(intlLocale, options ?? defaultOptions).format(d);
  } catch {
    return "";
  }
}
