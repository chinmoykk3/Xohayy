"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { usePreferences } from "@/hooks/usePreferences";
import { useOnlineStatus, toggleSimulateOffline } from "@/hooks/useOnlineStatus";
import { LOCALES, DEFAULT_LOCALE } from "@/i18n/config";
import type { Locale } from "@/types";

interface HeaderProps {
  locale?: Locale;
}

export function Header({ locale = DEFAULT_LOCALE }: HeaderProps) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { preferences, setTextScale, setHighContrast, setLocale } = usePreferences();
  const isOnline = useOnlineStatus();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const changeLocale = (targetLocale: Locale) => {
    if (targetLocale === locale) return;
    setLocale(targetLocale);
    document.cookie = `xahay_locale=${targetLocale}; path=/; max-age=31536000; SameSite=Lax`;

    let newPath = pathname;
    for (const loc of LOCALES) {
      if (pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)) {
        newPath = pathname.replace(`/${loc}`, `/${targetLocale}`);
        break;
      }
    }
    if (newPath === pathname) {
      newPath = `/${targetLocale}${pathname === "/" ? "" : pathname}`;
    }
    router.push(newPath);
  };

  const navTabs = [
    {
      href: `/${locale}`,
      label: "Dashboard & Alerts",
      isActive: pathname === `/${locale}` || pathname === `/${locale}/` || pathname === "/",
    },
    {
      href: `/${locale}/emergency`,
      label: "Contacts & SOS",
      isActive: pathname.includes("/emergency"),
    },
    {
      href: `/${locale}/guides`,
      label: "Safety Guides",
      isActive: pathname.includes("/guides"),
    },
    {
      href: `/${locale}/shelters`,
      label: "Shelters & Hospitals",
      isActive: pathname.includes("/shelters"),
    },
    {
      href: `/${locale}/report`,
      label: "Ground Report",
      isActive: pathname.includes("/report"),
    },
    {
      href: `/${locale}/kit`,
      label: "Kit & Checklist",
      isActive: pathname.includes("/kit"),
    },
  ];

  return (
    <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-xs">
      {/* 1. Top Utility Header Bar */}
      <div className="max-w-[1280px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo & Bilingual Title */}
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-md"
            aria-label="Xohayy Disaster Response Home"
          >
            <div className="w-9 h-9 rounded-lg bg-sky-700 text-white flex items-center justify-center shadow-xs">
              <Icon name="shield" size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-none">
                Xohayy
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                উত্তৰ-পূব সাহায্য &bull; Disaster Response PS85
              </span>
            </div>
          </Link>
        </div>

        {/* Right Utility Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Direct Language Switcher Pills */}
          <div className="hidden sm:flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => changeLocale("en")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                locale === "en"
                  ? "bg-sky-600 text-white font-bold shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => changeLocale("as")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                locale === "as"
                  ? "bg-sky-600 text-white font-bold shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              অসমীয়া
            </button>
            <button
              type="button"
              onClick={() => changeLocale("hi")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                locale === "hi"
                  ? "bg-sky-600 text-white font-bold shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              हिन्दी
            </button>
          </div>

          {/* Text Size Stepper */}
          <div className="hidden md:flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
            <button
              type="button"
              onClick={() => setTextScale(1)}
              title="Normal Text Size"
              className={`px-2 py-1 rounded-md transition-colors ${
                preferences.textScale === 1
                  ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white"
                  : "hover:bg-slate-100 dark:hover:bg-slate-700/50"
              }`}
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => setTextScale(1.25)}
              title="Large Text Size"
              className={`px-2 py-1 rounded-md transition-colors ${
                preferences.textScale === 1.25
                  ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white"
                  : "hover:bg-slate-100 dark:hover:bg-slate-700/50"
              }`}
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setTextScale(1.5)}
              title="Largest Text Size"
              className={`px-2 py-1 rounded-md transition-colors ${
                preferences.textScale === 1.5
                  ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white"
                  : "hover:bg-slate-100 dark:hover:bg-slate-700/50"
              }`}
            >
              A+
            </button>
          </div>

          {/* Contrast Mode Toggle */}
          <button
            type="button"
            onClick={() => setHighContrast(!preferences.highContrast)}
            aria-label="Toggle High Contrast Mode"
            title="Toggle High Contrast"
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              preferences.highContrast
                ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900"
                : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <span>◐</span>
            <span>Contrast</span>
          </button>

          {/* 112 Emergency Action Button with Status Updated Badge */}
          <div className="relative flex flex-col items-end">
            <a
              href="tel:112"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-sm transition-colors focus:ring-2 focus:ring-red-400"
              aria-label="Call 112 Emergency"
            >
              <Icon name="phone" size={15} />
              <span>112 EMERGENCY</span>
            </a>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Status Updated</span>
            </span>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle Navigation Menu"
              className="p-2 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Icon name={isMobileMenuOpen ? "close" : "menu"} size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Secondary Navigation Sub-bar (Dark Slate/Navy) */}
      <div className="w-full bg-slate-900 dark:bg-slate-950 text-white border-t border-slate-800">
        <div className="max-w-[1280px] mx-auto px-3 sm:px-6 flex items-center justify-between overflow-x-auto scrollbar-none py-1 sm:py-0">
          {/* Main Navigation Tabs */}
          <nav aria-label="Sections" className="flex items-center space-x-1 shrink-0">
            {navTabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`inline-flex items-center px-3.5 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors rounded-md my-1 ${
                  tab.isActive
                    ? "bg-teal-700 text-white shadow-xs"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>

          {/* Sync / Connectivity Status & Simulation Tool */}
          <div className="hidden lg:flex items-center gap-3 shrink-0 pl-4 py-2 border-l border-slate-800">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                }`}
              />
              <span>{isOnline ? "Online • Synced ASDMA / CWC" : "Offline • Mesh Cache"}</span>
            </div>

            <button
              type="button"
              onClick={toggleSimulateOffline}
              className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              {isOnline ? "Simulate Offline" : "Restore Online"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 text-white px-4 py-4 space-y-3 border-t border-slate-800">
          <div className="flex flex-col space-y-1">
            {navTabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  tab.isActive ? "bg-teal-700 text-white" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span
                className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-400" : "bg-red-400"}`}
              />
              <span>{isOnline ? "Synced ASDMA/CWC" : "Offline Cache"}</span>
            </span>
            <button
              type="button"
              onClick={toggleSimulateOffline}
              className="px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700"
            >
              {isOnline ? "Simulate Offline" : "Go Online"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
