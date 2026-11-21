"use client";

import React, { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LOCALES, LOCALE_NAMES } from "@/i18n/config";
import type { Locale } from "@/types";
import { Icon } from "@/components/ui/Icon";
import { usePreferences } from "@/hooks/usePreferences";

interface LanguageSwitcherProps {
  currentLocale: Locale;
  className?: string;
  id?: string;
}

export function LanguageSwitcher({
  currentLocale,
  className = "",
  id = "language-select",
}: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Try reading preferences context if available
  let setPreferencesLocale: ((loc: Locale) => void) | null = null;
  try {
    const prefsContext = usePreferences();
    setPreferencesLocale = prefsContext.setLocale;
  } catch {
    // Outside provider in isolated unit tests
  }

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;

    // Update preferences state if inside provider
    if (setPreferencesLocale) {
      setPreferencesLocale(newLocale);
    }

    // Set cookie for 1 year
    document.cookie = `xahay_locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

    // Construct new pathname
    let newPathname = pathname || "/";
    for (const loc of LOCALES) {
      if (pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)) {
        newPathname = pathname.replace(`/${loc}`, `/${newLocale}`);
        break;
      }
    }

    if (newPathname === pathname) {
      newPathname = `/${newLocale}${pathname === "/" ? "" : pathname}`;
    }

    if (typeof window !== "undefined") {
      try {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full reload is required to re-render root html lang and font tokens across locale segments
        window.location.assign(newPathname);
      } catch {
        startTransition(() => {
          router.push(newPathname);
        });
      }
    }
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <label htmlFor={id} className="sr-only">
        Select Language
      </label>
      <div className="relative flex items-center">
        <span
          className="absolute left-2.5 text-[var(--color-text-muted)] pointer-events-none"
          aria-hidden="true"
        >
          <Icon name="globe" size={16} />
        </span>
        <select
          id={id}
          value={currentLocale}
          disabled={isPending}
          onChange={(e) => handleLocaleChange(e.target.value as Locale)}
          aria-label="Language"
          className="appearance-none bg-[var(--color-bg-card)] text-[var(--color-text-main)] border border-[var(--color-border-card)] rounded-[var(--radius-card)] pl-8 pr-7 py-1.5 text-sm font-medium min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] cursor-pointer disabled:opacity-50"
        >
          {LOCALES.map((locale) => (
            <option key={locale} value={locale}>
              {LOCALE_NAMES[locale].nativeName}
            </option>
          ))}
        </select>
        <span
          className="absolute right-2 text-[var(--color-text-muted)] pointer-events-none text-xs"
          aria-hidden="true"
        >
          &#9662;
        </span>
      </div>
    </div>
  );
}
