import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LOCALES, DEFAULT_LOCALE } from "@/i18n/config";
import type { Locale } from "@/types";

const PUBLIC_FILE = /\.(.*)$/;

/**
 * Generates Content-Security-Policy header with per-request nonce (Plan Section 24.4, ADR-003).
 * Ensures Next.js scripts execute without requiring 'unsafe-inline' for script tags.
 */
export function generateCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";

  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' ${isDev ? "'unsafe-eval'" : ""}`.trim(),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://tile.openstreetmap.org https://*.tile.openstreetmap.org https://unpkg.com",
    "font-src 'self' data:",
    "connect-src 'self' https://tile.openstreetmap.org https://*.tile.openstreetmap.org",
    "worker-src 'self' blob:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ];

  return directives.join("; ");
}

/**
 * Applies strict security headers to response headers (Plan Section 24.4).
 */
export function applySecurityHeaders(headers: Headers, csp: string) {
  headers.set("Content-Security-Policy", csp);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "geolocation=(self), camera=(), microphone=(), payment=()");
  headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
}

/**
 * Determines target locale from Accept-Language header.
 */
function getLocaleFromAcceptLanguage(acceptLanguageHeader: string | null): Locale {
  if (!acceptLanguageHeader) return DEFAULT_LOCALE;

  const header = acceptLanguageHeader.toLowerCase();

  const preferences = header
    .split(",")
    .map((item) => {
      const [lang, qPart] = item.trim().split(";");
      const q = qPart && qPart.startsWith("q=") ? parseFloat(qPart.slice(2)) : 1.0;
      return { lang: lang?.trim() || "", q: isNaN(q) ? 0 : q };
    })
    .sort((a, b) => b.q - a.q);

  for (const pref of preferences) {
    if (pref.lang.startsWith("as")) return "as";
    if (pref.lang.startsWith("hi")) return "hi";
    if (pref.lang.startsWith("en")) return "en";
  }

  return DEFAULT_LOCALE;
}

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = generateCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);

  const { pathname } = request.nextUrl;

  // Handle API routes and public static files with security headers
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/icons") ||
    pathname === "/favicon.ico" ||
    PUBLIC_FILE.test(pathname)
  ) {
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    applySecurityHeaders(response.headers, csp);
    return response;
  }

  // Check if pathname already begins with a supported locale
  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (pathnameHasLocale) {
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    applySecurityHeaders(response.headers, csp);
    return response;
  }

  // 1. Check stored preference in cookie
  const cookieLocale = request.cookies.get("xahay_locale")?.value;
  let targetLocale: Locale = DEFAULT_LOCALE;

  if (cookieLocale && (LOCALES as readonly string[]).includes(cookieLocale)) {
    targetLocale = cookieLocale as Locale;
  } else {
    // 2. Parse Accept-Language header
    targetLocale = getLocaleFromAcceptLanguage(request.headers.get("accept-language"));
  }

  // Redirect to localized URL, preserving search parameters
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = `/${targetLocale}${pathname === "/" ? "" : pathname}`;
  const redirectResponse = NextResponse.redirect(redirectUrl);
  applySecurityHeaders(redirectResponse.headers, csp);
  return redirectResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static chunks)
     * - _next/image (image optimization files)
     */
    "/((?!_next/static|_next/image).*)",
  ],
};
