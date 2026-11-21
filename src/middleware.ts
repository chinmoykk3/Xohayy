import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LOCALES, DEFAULT_LOCALE } from "@/i18n/config";
import type { Locale } from "@/types";

const PUBLIC_FILE = /\.(.*)$/;

/**
 * Determines target locale from Accept-Language header.
 */
function getLocaleFromAcceptLanguage(acceptLanguageHeader: string | null): Locale {
  if (!acceptLanguageHeader) return DEFAULT_LOCALE;

  const header = acceptLanguageHeader.toLowerCase();

  // Parse header items with quality factors: e.g. "as-IN,as;q=0.9,hi;q=0.8,en;q=0.7"
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
  const { pathname } = request.nextUrl;

  // Skip Next.js system routes, API routes, favicon and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/icons") ||
    pathname === "/favicon.ico" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Check if pathname already begins with a supported locale
  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
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
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons).*)"],
};
