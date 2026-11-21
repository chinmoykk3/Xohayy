"use client";

import React from "react";
import Link from "next/link";
import { DEFAULT_LOCALE, t } from "@/i18n/config";
import type { Locale } from "@/types";

interface FooterProps {
  locale?: Locale;
}

export function Footer({ locale = DEFAULT_LOCALE }: FooterProps) {
  return (
    <footer className="w-full bg-slate-50 border-t border-slate-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs text-slate-500">
        {/* Left Column: Organization & Legal Context */}
        <div className="space-y-1.5 max-w-xl">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Xohayy Emergency Grid</h2>
          <p className="leading-relaxed">
            Public hazard coordination framework for Assam, Meghalaya, Arunachal Pradesh, Manipur,
            Mizoram, Nagaland, and Tripura. Compliant with NDMA field protocols.
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            Authorized Aggregator &bull; Strict Zero-Tracking &amp; Offline Mesh Data Cache Protocol
          </p>
        </div>

        {/* Right Column: Source Feeds & Navigation Links */}
        <div className="flex flex-col items-start md:items-end gap-2 text-left md:text-right">
          <div>
            <span className="font-semibold text-slate-700 block mb-1">
              Official Data Source Feeds
            </span>
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-slate-600">
              <span className="hover:text-slate-900 cursor-pointer">ASDMA</span>
              <span>&bull;</span>
              <span className="hover:text-slate-900 cursor-pointer">CWC</span>
              <span>&bull;</span>
              <span className="hover:text-slate-900 cursor-pointer">IMD</span>
              <span>&bull;</span>
              <span className="hover:text-slate-900 cursor-pointer">NDRF 1st Bn</span>
              <span>&bull;</span>
              <span className="hover:text-slate-900 cursor-pointer">SDRF</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-200 md:border-0">
            <Link href={`/${locale}/about`} className="hover:text-slate-900 underline">
              {t(locale, "about.title")}
            </Link>
            <span>&bull;</span>
            <Link href={`/${locale}/about#privacy`} className="hover:text-slate-900 underline">
              {t(locale, "about.privacy")}
            </Link>
            <span>&bull;</span>
            <Link href={`/${locale}/about#sources`} className="hover:text-slate-900 underline">
              {t(locale, "about.sources")}
            </Link>
            <span>&bull;</span>
            <Link href={`/${locale}/kit`} className="hover:text-slate-900 underline">
              {t(locale, "kit.title")}
            </Link>
          </div>

          <p className="text-[11px] text-slate-400">
            &copy; 2025 Disaster Management Authority Network. Emergency Use Only.
          </p>
        </div>
      </div>
    </footer>
  );
}
