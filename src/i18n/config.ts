import type { Locale } from "@/types";
import en from "./en.json";
import as from "./as.json";
import hi from "./hi.json";

export const LOCALES: readonly Locale[] = ["en", "as", "hi"] as const;
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_NAMES: Record<Locale, { name: string; nativeName: string }> = {
  en: { name: "English", nativeName: "English" },
  as: { name: "Assamese", nativeName: "অসমীয়া" },
  hi: { name: "Hindi", nativeName: "हिन्दी" },
};

export const HTML_LANG_MAP: Record<Locale, string> = {
  en: "en",
  as: "as-IN",
  hi: "hi-IN",
};

export const INTL_LOCALE_MAP: Record<Locale, string> = {
  en: "en-IN",
  as: "as-IN",
  hi: "hi-IN",
};

export const DICTIONARIES: Record<Locale, Record<string, string>> = {
  en: en as Record<string, string>,
  as: as as Record<string, string>,
  hi: hi as Record<string, string>,
};

/**
 * Returns true if the provided value is a supported Locale.
 */
export function isValidLocale(val: unknown): val is Locale {
  return typeof val === "string" && (LOCALES as readonly string[]).includes(val);
}

/**
 * Returns dictionary for the given locale with fallback to default locale.
 */
export function getDictionary(locale: Locale): Record<string, string> {
  return DICTIONARIES[locale] || DICTIONARIES[DEFAULT_LOCALE];
}

/**
 * Type-safe translation helper supporting named parameters without string concatenation.
 * Safely falls back to default locale and then key if translation is missing.
 *
 * Example: t('en', 'common.lastUpdated', { time: '10:00' })
 */
export function t(locale: Locale, key: string, params?: Record<string, string | number>): string {
  const dict = DICTIONARIES[locale] || DICTIONARIES[DEFAULT_LOCALE];
  let translation = dict[key] ?? DICTIONARIES[DEFAULT_LOCALE]?.[key] ?? key;

  if (params) {
    for (const [paramKey, value] of Object.entries(params)) {
      translation = translation.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(value));
    }
  }

  return translation;
}
