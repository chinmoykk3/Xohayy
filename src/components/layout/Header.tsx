"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { LanguageSwitcher } from "@/components/settings/LanguageSwitcher";
import { SettingsMenu } from "@/components/settings/SettingsMenu";
import { DEFAULT_LOCALE, t } from "@/i18n/config";
import type { Locale } from "@/types";

interface HeaderProps {
  locale?: Locale;
}

export function Header({ locale = DEFAULT_LOCALE }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: `/${locale}`, label: t(locale, "home.title") },
    { href: `/${locale}/alerts`, label: t(locale, "alerts.title") },
    { href: `/${locale}/guides`, label: t(locale, "guides.title") },
    { href: `/${locale}/shelters`, label: t(locale, "shelters.title") },
    { href: `/${locale}/report`, label: t(locale, "report.title") },
    { href: `/${locale}/emergency`, label: t(locale, "common.emergency") },
  ];

  return (
    <header className="w-full bg-[var(--color-bg-card)] border-b border-[var(--color-border-card)] sticky top-0 z-40">
      <div className="max-w-[960px] mx-auto px-2 sm:px-6 h-16 flex items-center justify-between gap-1 sm:gap-2">
        {/* Brand */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-1.5 text-xl font-bold text-[var(--color-text-main)] min-h-[44px] min-w-[44px] sm:min-h-[48px] sm:min-w-[48px] py-2 shrink-0"
        >
          <span className="w-8 h-8 rounded-[var(--radius-card)] bg-[var(--color-primary-bg)] text-[var(--color-primary-text)] flex items-center justify-center text-sm font-bold">
            X
          </span>
          <span className="tracking-tight hidden xs:inline">Xahay</span>
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center min-h-[48px] px-2.5 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] rounded-md hover:bg-[var(--color-bg-page)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Header Right Actions: Emergency 112, Language Switcher, Settings & Mobile Toggle */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Header Quick Emergency 112 Link */}
          <Link
            href={`/${locale}/emergency`}
            aria-label={`${t(locale, "emergency.callAction")} 112`}
            className="inline-flex items-center justify-center min-h-[40px] px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-[var(--radius-card)] bg-[var(--color-emergency-bg)] text-[var(--color-emergency-text)] hover:bg-[var(--color-emergency-hover)] font-bold text-xs sm:text-sm tracking-wide transition-colors"
          >
            <Icon name="phone" size={14} className="mr-1 sm:mr-1.5" />
            <span>112</span>
          </Link>

          <LanguageSwitcher currentLocale={locale} />
          <SettingsMenu locale={locale} />

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={isMenuOpen ? t(locale, "common.close") : t(locale, "common.menu")}
              className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] sm:min-h-[48px] sm:min-w-[48px] p-1.5 text-[var(--color-text-main)] rounded-md hover:bg-[var(--color-bg-page)]"
            >
              <Icon name={isMenuOpen ? "close" : "menu"} size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu */}
      {isMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile Navigation"
          className="md:hidden border-t border-[var(--color-border-card)] bg-[var(--color-bg-card)] px-4 py-3 flex flex-col gap-1"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center min-h-[48px] px-3 py-2 text-base font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] rounded-md hover:bg-[var(--color-bg-page)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
