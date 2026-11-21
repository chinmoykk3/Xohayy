import type { Locale } from "@/types";
import { DEFAULT_LOCALE, t } from "@/i18n/config";

export interface FetcherOptions extends RequestInit {
  timeout?: number;
  cacheFallback?: boolean;
  locale?: Locale;
}

export class FetcherError extends Error {
  status?: number;
  code: string;

  constructor(message: string, code: string, status?: number) {
    super(message);
    this.name = "FetcherError";
    this.code = code;
    this.status = status;
  }
}

export interface CachedItem<T> {
  data: T;
  fetchedAt: string;
}

const CACHE_PREFIX = "xahay:cache:";
const LAST_FETCHED_AT_KEY = "xahay:last_fetched_at";

// In-memory cache fallback for SSR and non-localStorage environments
const memoryCache = new Map<string, CachedItem<unknown>>();
let memoryLastFetchedAt: string | null = null;

/**
 * Returns the most recent fetchedAt timestamp, globally or for a specific url.
 */
export function getLastFetchedAt(key?: string): string | null {
  if (key) {
    const cached = getCachedData(key);
    if (cached) return cached.fetchedAt;
  }

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(LAST_FETCHED_AT_KEY);
      if (stored) return stored;
    } catch {
      // Ignore storage errors
    }
  }
  return memoryLastFetchedAt;
}

/**
 * Stores the most recent fetchedAt timestamp.
 */
export function setLastFetchedAt(timestamp: string, key?: string): void {
  memoryLastFetchedAt = timestamp;
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(LAST_FETCHED_AT_KEY, timestamp);
    } catch {
      // Ignore quota/access errors
    }
  }
  if (key) {
    const existing = getCachedData(key);
    if (existing) {
      setCachedData(key, { ...existing, fetchedAt: timestamp });
    }
  }
}

/**
 * Retrieves cached response data for a url.
 */
export function getCachedData<T>(url: string): CachedItem<T> | null {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(`${CACHE_PREFIX}${url}`);
      if (raw) {
        return JSON.parse(raw) as CachedItem<T>;
      }
    } catch {
      // Fall through to memory
    }
  }
  return (memoryCache.get(url) as CachedItem<T>) ?? null;
}

/**
 * Saves response data to cache.
 */
export function setCachedData<T>(url: string, item: CachedItem<T>): void {
  memoryCache.set(url, item as CachedItem<unknown>);
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(`${CACHE_PREFIX}${url}`, JSON.stringify(item));
    } catch {
      // Ignore storage errors
    }
  }
}

/**
 * Maps error types to friendly, localized messages.
 */
export function getFriendlyErrorMessage(
  errorType: "network" | "timeout" | "404" | "429" | "500" | "generic",
  locale: Locale = DEFAULT_LOCALE
): string {
  switch (errorType) {
    case "network":
    case "timeout":
      return (
        t(locale, "errors.network") || "Network connection error. Showing cached emergency data."
      );
    case "404":
      return t(locale, "errors.notFound") || "The requested emergency resource could not be found.";
    case "429":
      return (
        t(locale, "errors.rateLimit") ||
        "Too many requests. Please wait a moment before trying again."
      );
    case "500":
      return (
        t(locale, "errors.serverError") ||
        "Server error. Cached emergency data remains available offline."
      );
    default:
      return t(locale, "errors.generic") || "An unexpected error occurred. Please try again.";
  }
}

/**
 * Fetch wrapper with timeout, friendly translated errors, and cache fallback.
 * Automatically stores the fetchedAt timestamp for freshness tracking.
 */
export async function fetcher<T>(url: string, options: FetcherOptions = {}): Promise<T> {
  const { timeout = 8000, cacheFallback = true, locale = DEFAULT_LOCALE, ...fetchInit } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      ...fetchInit,
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      const status = res.status;
      const errorType =
        status === 404 ? "404" : status === 429 ? "429" : status >= 500 ? "500" : "generic";
      throw new FetcherError(getFriendlyErrorMessage(errorType, locale), `HTTP_${status}`, status);
    }

    const data = (await res.json()) as T;
    const fetchedAt =
      typeof data === "object" &&
      data !== null &&
      "fetchedAt" in data &&
      typeof (data as { fetchedAt: unknown }).fetchedAt === "string"
        ? (data as { fetchedAt: string }).fetchedAt
        : new Date().toISOString();

    // Cache the response
    setCachedData(url, { data, fetchedAt });
    setLastFetchedAt(fetchedAt, url);

    return data;
  } catch (error: unknown) {
    clearTimeout(timer);

    // If cacheFallback is enabled, try returning cached data
    if (cacheFallback) {
      const cached = getCachedData<T>(url);
      if (cached) {
        setLastFetchedAt(cached.fetchedAt, url);
        return {
          ...cached.data,
          fetchedAt: cached.fetchedAt,
          _isCached: true,
        };
      }
    }

    if (error instanceof FetcherError) {
      throw error;
    }

    const isAbort = error instanceof DOMException && error.name === "AbortError";
    const errorType = isAbort ? "timeout" : "network";
    const errorCode = isAbort ? "TIMEOUT" : "NETWORK_ERROR";

    throw new FetcherError(getFriendlyErrorMessage(errorType, locale), errorCode);
  }
}
