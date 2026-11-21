import type { Locale, Preferences } from "@/types";
import { DEFAULT_LOCALE, LOCALES, isValidLocale } from "@/i18n/config";

export const STORAGE_KEY = "xahay_preferences";
export const STORAGE_VERSION = 1;

export interface StoredPayload {
  version: number;
  data: Preferences;
}

/**
 * Validates a preferences object safely without heavy runtime validation dependencies.
 */
function isValidPreferences(data: unknown): data is Preferences {
  if (typeof data !== "object" || data === null) return false;
  const p = data as Record<string, unknown>;
  if (typeof p.locale !== "string" || !LOCALES.includes(p.locale as Locale)) return false;
  if (p.textScale !== 1 && p.textScale !== 1.25 && p.textScale !== 1.5) return false;
  if (typeof p.highContrast !== "boolean") return false;
  if (typeof p.reducedMotion !== "boolean") return false;
  if (
    p.districtId !== undefined &&
    (typeof p.districtId !== "string" || p.districtId.length < 1 || p.districtId.length > 64)
  ) {
    return false;
  }
  if (!Array.isArray(p.readGuides) || !p.readGuides.every((x) => typeof x === "string"))
    return false;
  if (!Array.isArray(p.kitChecked) || !p.kitChecked.every((x) => typeof x === "string"))
    return false;
  return true;
}

/**
 * Detects browser preferred locale from navigator.languages.
 */
function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined" || !navigator.languages) {
    return DEFAULT_LOCALE;
  }

  for (const lang of navigator.languages) {
    const code = lang.toLowerCase();
    if (code.startsWith("as")) return "as";
    if (code.startsWith("hi")) return "hi";
    if (code.startsWith("en")) return "en";
  }

  return DEFAULT_LOCALE;
}

/**
 * Returns default preferences respecting OS accessibility media queries and language precedence.
 * Precedence: URL -> stored preference -> browser language -> English.
 */
export function getDefaultPreferences(urlLocale?: Locale): Preferences {
  let locale: Locale = DEFAULT_LOCALE;

  if (urlLocale && isValidLocale(urlLocale)) {
    locale = urlLocale;
  } else {
    locale = detectBrowserLocale();
  }

  const highContrast =
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-contrast: more)").matches
      : false;

  const reducedMotion =
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  return {
    locale,
    textScale: 1,
    highContrast,
    reducedMotion,
    readGuides: [],
    kitChecked: [],
  };
}

/**
 * Safely reads preferences from localStorage without throwing.
 * Recovers seamlessly if storage is corrupt, outdated, blocked, or unavailable.
 */
export function readPreferences(urlLocale?: Locale): Preferences {
  const defaults = getDefaultPreferences(urlLocale);

  if (typeof window === "undefined") {
    return defaults;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaults;
    }

    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null) {
      return defaults;
    }

    const payload = parsed as Partial<StoredPayload>;
    if (payload.version !== STORAGE_VERSION || !payload.data) {
      return defaults;
    }

    if (!isValidPreferences(payload.data)) {
      return defaults;
    }

    const stored = payload.data;

    // URL locale takes precedence if explicitly provided on active route
    return {
      ...stored,
      locale: urlLocale && isValidLocale(urlLocale) ? urlLocale : stored.locale,
    };
  } catch {
    // Storage blocked (e.g. security sandbox, private browsing) or corrupted
    return defaults;
  }
}

/**
 * Safely writes preferences to localStorage without throwing.
 * Also synchronizes the xahay_locale cookie for Next.js middleware.
 */
export function writePreferences(prefs: Preferences): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  if (!isValidPreferences(prefs)) {
    return false;
  }

  try {
    const payload: StoredPayload = {
      version: STORAGE_VERSION,
      data: prefs,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

    // Keep cookie in sync for server-side redirects in middleware
    if (prefs.locale && LOCALES.includes(prefs.locale)) {
      document.cookie = `xahay_locale=${prefs.locale}; path=/; max-age=31536000; SameSite=Lax`;
    }

    return true;
  } catch {
    // Storage full (QuotaExceededError) or blocked
    return false;
  }
}
