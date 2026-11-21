"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { DistrictSelect } from "@/components/alerts/DistrictSelect";
import { useDistrict } from "@/hooks/useDistrict";
import { useOnlineStatus, toggleSimulateOffline } from "@/hooks/useOnlineStatus";
import type { Locale } from "@/types";

interface HomeContentProps {
  locale: Locale;
}

interface FrequentDistrict {
  id: string;
  nameEn: string;
  nameLocal?: string;
}

const FREQUENT_DISTRICTS: FrequentDistrict[] = [
  { id: "dhemaji", nameEn: "Dhemaji", nameLocal: "ধেমাজি" },
  { id: "lakhimpur", nameEn: "Lakhimpur", nameLocal: "লখিমপুৰ" },
  { id: "majuli", nameEn: "Majuli", nameLocal: "মাজুলী" },
  { id: "dibrugarh", nameEn: "Dibrugarh", nameLocal: "ডিব্ৰুগড়" },
  { id: "barpeta", nameEn: "Barpeta", nameLocal: "বৰপেটা" },
  { id: "morigaon", nameEn: "Morigaon", nameLocal: "মৰিগাঁও" },
  { id: "kamrup-metro", nameEn: "Kamrup Metro" },
  { id: "cachar", nameEn: "Cachar" },
];

export function HomeContent({ locale }: HomeContentProps) {
  const { district, setDistrict } = useDistrict();
  const isOnline = useOnlineStatus();
  const [activeScript, setActiveScript] = useState<"en" | "as" | "hi">(
    locale === "as" ? "as" : locale === "hi" ? "hi" : "en"
  );

  // Set default to Dhemaji if not already set, to match the design screenshot
  useEffect(() => {
    if (!district) {
      setDistrict("dhemaji");
    }
  }, [district, setDistrict]);

  const activeDistrictId = district?.id || "dhemaji";
  const activeDistrictName = district?.name[locale] || district?.name.en || "Dhemaji";

  return (
    <div className="space-y-4">
      {/* 1. Sync & Offline Status Ribbon */}
      <div className="w-full bg-[#f0fdfa] border border-[#99f6e4] rounded-lg px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 font-medium">
          <span className="text-teal-600 font-bold flex items-center gap-1">
            <Icon name="wifi" size={16} />
            <span className="font-semibold tracking-wide">
              {isOnline
                ? "CONNECTED \u2022 Local Cache Synchronized"
                : "OFFLINE \u2022 Operating from Local Cache"}
            </span>
          </span>
          <span className="text-slate-500 hidden md:inline">&bull;</span>
          <span className="text-slate-600 hidden md:inline">
            Last Synced: Today 08:30 IST (ASDMA &amp; CWC Data Feed)
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px] tracking-wide">
            OFFLINE READY / অফলাইন সক্ৰিয়
          </span>
        </div>

        <button
          type="button"
          onClick={toggleSimulateOffline}
          className="text-xs px-3 py-1.5 rounded-md border border-teal-300 bg-white hover:bg-teal-50 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ml-auto"
        >
          <Icon name="radio" size={14} className="text-teal-600" />
          <span>{isOnline ? "Simulate Field Offline" : "Restore Online Network"}</span>
        </button>
      </div>

      {/* 2. Active Monitoring Basin & District Selection Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-xs">
        {/* Top Row: Basin Label & Script Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            ACTIVE MONITORING BASIN / জিলা নিৰ্বাচন
          </span>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="text-[11px] text-slate-400">SCRIPT:</span>
            <div className="flex items-center rounded-md border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={() => setActiveScript("en")}
                className={`px-2 py-0.5 rounded text-xs ${
                  activeScript === "en"
                    ? "bg-white shadow-xs text-slate-900 font-bold"
                    : "text-slate-500"
                }`}
              >
                EN (English)
              </button>
              <button
                type="button"
                onClick={() => setActiveScript("as")}
                className={`px-2 py-0.5 rounded text-xs ${
                  activeScript === "as"
                    ? "bg-white shadow-xs text-slate-900 font-bold"
                    : "text-slate-500"
                }`}
              >
                অসমীয়া (AS)
              </button>
              <button
                type="button"
                onClick={() => setActiveScript("hi")}
                className={`px-2 py-0.5 rounded text-xs ${
                  activeScript === "hi"
                    ? "bg-white shadow-xs text-slate-900 font-bold"
                    : "text-slate-500"
                }`}
              >
                हिन्दी (HI)
              </button>
            </div>
          </div>
        </div>

        {/* Middle Row: Accessible District Search Combobox */}
        <div>
          <DistrictSelect locale={locale} onSelect={(d) => setDistrict(d?.id ?? null)} />
        </div>

        {/* Bottom Row: Frequent Districts Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-semibold text-slate-500 mr-1">Frequent:</span>
          {FREQUENT_DISTRICTS.map((item) => {
            const isSelected = activeDistrictId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setDistrict(item.id)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-red-600 text-white shadow-xs font-bold"
                    : "bg-sky-50 text-slate-700 border border-sky-200 hover:bg-sky-100"
                }`}
              >
                {item.nameEn}
                {item.nameLocal ? ` \u2022 ${item.nameLocal}` : ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Top 4 Quick Action / SOS Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: CALL 112 (Solid Crimson Red) */}
        <a
          href="tel:112"
          className="bg-red-600 hover:bg-red-700 text-white rounded-lg p-3.5 flex items-center justify-between shadow-sm transition-transform active:scale-[0.99] cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-full bg-white/20 text-white shrink-0">
              <Icon name="phone" size={22} />
            </span>
            <div>
              <h2 className="text-base font-black tracking-tight leading-none text-white">
                CALL 112
              </h2>
              <p className="text-[11px] text-red-100 font-medium mt-1 leading-tight">
                জৰুৰীকালীন সাহায্য &bull; All India SOS
              </p>
            </div>
          </div>
          <span className="text-white text-lg font-bold group-hover:translate-x-0.5 transition-transform">
            &rarr;
          </span>
        </a>

        {/* Card 2: DISASTER HELPLINE (Soft Slate Gray) */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>DISASTER HELPLINE</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">
              24x7 DEOC
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 pt-2">
            <a
              href="tel:1070"
              className="flex items-center gap-1.5 hover:text-red-600 transition-colors py-1"
            >
              <Icon name="phone" size={14} className="text-slate-500" />
              <span>1070 State</span>
            </a>
            <span className="text-slate-300">|</span>
            <a
              href="tel:1077"
              className="flex items-center gap-1.5 hover:text-red-600 transition-colors py-1"
            >
              <Icon name="phone" size={14} className="text-slate-500" />
              <span>1077 Dist</span>
            </a>
          </div>
        </div>

        {/* Card 3: 3 Relief Camps (Soft Mint Green) */}
        <Link
          href={`/${locale}/shelters`}
          className="bg-[#ecfdf5] border border-[#a7f3d0] hover:bg-[#d1fae5] rounded-lg p-3.5 flex items-center justify-between shadow-xs transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
              <Icon name="tent" size={22} />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-none">
                3 Relief Camps
              </h2>
              <p className="text-[11px] text-emerald-800 font-medium mt-1 leading-tight">
                Active &amp; Stocked Nearby
              </p>
            </div>
          </div>
          <span className="text-emerald-700 text-base font-bold group-hover:translate-x-0.5 transition-transform">
            &gt;
          </span>
        </Link>

        {/* Card 4: Share GPS SOS (Solid Cyan/Teal) */}
        <Link
          href={`/${locale}/emergency`}
          className="bg-[#0e7490] hover:bg-[#0891b2] text-white rounded-lg p-3.5 flex items-center justify-between shadow-sm transition-transform active:scale-[0.99] cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-full bg-white/20 text-white shrink-0">
              <Icon name="navigation" size={20} />
            </span>
            <div>
              <h2 className="text-base font-black tracking-tight leading-none text-white">
                Share GPS SOS
              </h2>
              <p className="text-[11px] text-cyan-100 font-medium mt-1 leading-tight">
                WhatsApp &amp; SMS Payload
              </p>
            </div>
          </div>
          <span className="text-white text-base font-bold group-hover:translate-x-0.5 transition-transform">
            <Icon name="send" size={16} />
          </span>
        </Link>
      </div>

      {/* 4. Main 2-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ================= LEFT COLUMN (~65% / 7.5 of 12 cols) ================= */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Card A: Severe Hazard Warning Banner & Gauges */}
          <section
            aria-labelledby="hazard-warning-heading"
            className="border border-red-200 rounded-lg overflow-hidden bg-white shadow-xs"
          >
            {/* Top Red Alert Header */}
            <div className="bg-[#b91c1c] text-white px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="warning" size={18} className="text-white" />
                <h2
                  id="hazard-warning-heading"
                  className="text-xs sm:text-sm font-black tracking-wide uppercase"
                >
                  SEVERE HAZARD WARNING - উচ্চ বিপদসংকেত
                </h2>
              </div>
              <span className="bg-red-950/80 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded tracking-wider">
                ASDMA LEVEL-3
              </span>
            </div>

            {/* Warning Body */}
            <div className="p-4 sm:p-5 space-y-4">
              {/* Target Jurisdiction & Risk Badges */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    TARGET JURISDICTION
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                    {activeDistrictName} District
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                    Northern Bank Brahmaputra Basin &amp; Subansiri Drainage
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-red-300 bg-red-50 text-red-700 text-xs font-bold">
                    <span className="text-red-600">&#9888;</span>
                    Severe Flood Warning
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-rose-300 bg-rose-50 text-rose-800 text-xs font-bold">
                    <span className="text-rose-600">&#9888;</span>
                    Moderate Slide Risk
                  </span>
                </div>
              </div>

              {/* Inset Gauges & Weather Card */}
              <div className="bg-slate-50/90 border border-slate-200 rounded-lg p-3.5 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Column 1: Brahmaputra River Gauge */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Icon name="droplets" size={16} className="text-blue-600" />
                      Brahmaputra Gauge
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-black text-[10px] tracking-wider uppercase">
                      RISING &and;
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                      104.80
                    </span>
                    <span className="text-xs font-bold text-red-600 font-mono">
                      +0.95m above Danger Level
                    </span>
                  </div>

                  {/* Meter Track Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden relative">
                      {/* Danger indicator bar */}
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 via-amber-500 to-red-600 rounded-full"
                        style={{ width: "88%" }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>Warning: 102.5m</span>
                      <span className="text-amber-700 font-semibold">Danger: 103.85m</span>
                      <span className="text-red-700 font-bold">Peak: 106.0m</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500">
                    Station: Nematighat / Dhemaji CWC Station #04
                  </p>
                </div>

                {/* Column 2: Precipitation Alert */}
                <div className="space-y-2 md:border-l md:border-slate-200 md:pl-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Icon name="activity" size={16} className="text-cyan-600" />
                      Precipitation Alert
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">IMD Automated</span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                      84.0
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      mm Recorded last 24 hrs
                    </span>
                  </div>

                  {/* Sparkline Curve SVG */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 font-medium">
                        Forecast (Next 12h): Heavy (75-115mm)
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px]">
                        Red Watch
                      </span>
                    </div>
                    <svg className="w-full h-7 text-cyan-600" viewBox="0 0 200 30" fill="none">
                      <path
                        d="M0 25 C40 22, 80 18, 120 12 C150 8, 180 5, 200 2"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <circle cx="200" cy="2" r="3" fill="#dc2626" />
                    </svg>
                  </div>

                  <p className="text-[10px] text-slate-500">
                    Heavy downpour concentrated over upper catchment.
                  </p>
                </div>
              </div>

              {/* Immediate Public Directive Alert Box */}
              <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 text-red-800">
                  <Icon name="bell" size={18} className="text-red-700 shrink-0" />
                  <h4 className="text-xs sm:text-sm font-black tracking-wide uppercase">
                    IMMEDIATE PUBLIC DIRECTIVE / বাধ্যতামূলক নিৰ্দেশনা
                  </h4>
                </div>

                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                  Low-lying wards 4 to 9 evacuation initiated by SDRF &amp; District Administration.
                  Move immediately to designated high embankments. Keep domestic livestock secured
                  at Gogamukh High School Relief Compound.
                </p>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <Link
                    href={`/${locale}/shelters`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#b91c1c] hover:bg-red-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
                  >
                    <Icon name="navigation" size={15} />
                    <span>Navigate to Safe Embankment</span>
                  </Link>

                  <a
                    href="tel:1077"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
                  >
                    <Icon name="phone" size={15} className="text-slate-600" />
                    <span>District EOC Dispatch</span>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Card B: Verified Ground Reports */}
          <section
            aria-labelledby="ground-reports-heading"
            className="border border-slate-200 rounded-lg bg-white p-4 sm:p-5 space-y-3.5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="shield" size={18} className="text-teal-600" />
                <h3 id="ground-reports-heading" className="text-base font-bold text-slate-900">
                  Verified Ground Reports
                </h3>
              </div>
              <Link
                href={`/${locale}/report`}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline flex items-center gap-1"
              >
                <span>Submit Field Report</span>
                <span className="text-sm font-bold">&oplus;</span>
              </Link>
            </div>

            {/* Report 1 */}
            <div className="border border-slate-200 rounded-lg p-3.5 space-y-2 hover:bg-slate-50/70 transition-colors">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs">
                    &bull;
                  </span>
                  <span>NH-15 Submerged near Gogamukh Bypass</span>
                </div>
                <span className="text-slate-400 font-mono text-[11px] font-semibold">
                  35 MINS AGO
                </span>
              </div>

              <blockquote className="text-xs sm:text-sm text-slate-700 italic leading-relaxed pl-3 border-l-2 border-red-300">
                &ldquo;NH-15 submerged under 1.5 ft rushing water near Gogamukh bypass. Small
                vehicles &amp; auto-rickshaws completely stranded. Heavy trucks crawling. Local
                volunteers assisting pedestrians across railway culvert.&rdquo;
              </blockquote>

              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                <span className="text-emerald-700 font-medium">
                  &check; Approved Volunteer Report &bull; Dhemaji Quick Reaction Unit
                </span>
                <span className="font-mono text-slate-400">
                  GPS: 27.4811&deg; N, 94.5422&deg; E
                </span>
              </div>
            </div>

            {/* Report 2 */}
            <div className="border border-slate-200 rounded-lg p-3.5 space-y-2 hover:bg-slate-50/70 transition-colors">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                    &bull;
                  </span>
                  <span>Relief Camp Operational at Dhemaji Higher Secondary</span>
                </div>
                <span className="text-slate-400 font-mono text-[11px] font-semibold">1 HR AGO</span>
              </div>

              <blockquote className="text-xs sm:text-sm text-slate-700 italic leading-relaxed pl-3 border-l-2 border-blue-300">
                &ldquo;Relief Camp formally activated at Dhemaji Higher Secondary School campus. 2x
                2,000L clean drinking water tanks delivered. Medical officer on site with ORS
                packets and antivenom supplies. Capacity for ~450 individuals.&rdquo;
              </blockquote>

              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                <span className="text-slate-700 font-medium">SDRF Ground Team Station Alpha</span>
                <span className="font-semibold text-slate-700">Capacity: 142/450 Occupied</span>
              </div>
            </div>
          </section>
        </div>

        {/* ================= RIGHT COLUMN (~35% / 4.5 of 12 cols) ================= */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          {/* Card C: Official Advisories */}
          <section
            aria-labelledby="official-advisories-heading"
            className="border border-slate-200 rounded-lg bg-white p-4 space-y-3.5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="bell" size={17} className="text-red-600" />
                <h3 id="official-advisories-heading" className="text-sm font-bold text-slate-900">
                  Official Advisories
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] tracking-wider uppercase">
                ASDMA VERIFIED
              </span>
            </div>

            {/* Advisory 1 */}
            <div className="border border-slate-100 rounded-md p-3 space-y-1.5 bg-slate-50/50">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono font-bold text-red-600">
                  #FL-2025-09 &bull; CRITICAL
                </span>
                <span className="text-slate-400">Issued 2 hrs ago</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                Subansiri River Tributary Spate in Dhemaji &amp; Lakhimpur
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Continuous torrential rainfall in foothill ranges of Arunachal Pradesh has triggered
                sudden flash surges in Jiadhal and Gainadi rivulets. Breaches reported near
                Sisiborgaon embankment ring.
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span>Valid Until: Today, 20:00 IST</span>
                <span className="font-medium text-slate-600">Source: ASDMA &amp; CWC</span>
              </div>
            </div>

            {/* Advisory 2 */}
            <div className="border border-slate-100 rounded-md p-3 space-y-1.5 bg-slate-50/50">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono font-bold text-amber-700">
                  #LS-2025-03 &bull; TRANSIT ALERT
                </span>
                <span className="text-slate-400">Updated 45 mins ago</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                NH-15 Landslide Clearance near Sonapur / Dima Hasao
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Geological Survey of India (GSI) has flagged slope instability along hill corridors.
                Heavy mudslip clearance actively underway by Border Roads Organisation (BRO).
                Civilian traffic diverted through alternate bypass.
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span>Route Status: Partial Blockade</span>
                <span className="font-medium text-slate-600">Source: GSI &amp; BRO</span>
              </div>
            </div>
          </section>

          {/* Card D: Inundation Extent Map */}
          <section
            aria-labelledby="inundation-map-heading"
            className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs"
          >
            <div className="p-3 border-b border-slate-100 flex items-center gap-2">
              <Icon name="map" size={16} className="text-cyan-700" />
              <h3
                id="inundation-map-heading"
                className="text-xs sm:text-sm font-bold text-slate-900"
              >
                {activeDistrictName} Inundation Extent Map
              </h3>
            </div>

            {/* Graphical Map Representation (SVG with river and flood layers) */}
            <div className="relative bg-[#e6f4ea] h-48 w-full overflow-hidden border-b border-slate-200 flex items-center justify-center">
              <svg
                viewBox="0 0 400 200"
                className="w-full h-full object-cover"
                preserveAspectRatio="xMidYMid slice"
                aria-label={`Inundation map for ${activeDistrictName}`}
              >
                {/* River Channels */}
                <path
                  d="M0,70 Q120,60 200,90 T400,80"
                  fill="none"
                  stroke="#93c5fd"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                <path
                  d="M180,90 Q220,130 310,180"
                  fill="none"
                  stroke="#bfdbfe"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  d="M50,0 Q90,50 140,65"
                  fill="none"
                  stroke="#bfdbfe"
                  strokeWidth="6"
                  strokeLinecap="round"
                />

                {/* Inundation Zones (Translucent Cyan/Aqua) */}
                <path
                  d="M70,50 Q130,40 180,75 Q210,110 150,110 Q90,100 70,50 Z"
                  fill="#38bdf8"
                  fillOpacity="0.45"
                />
                <path
                  d="M210,85 Q280,70 340,95 Q320,130 250,115 Z"
                  fill="#38bdf8"
                  fillOpacity="0.5"
                />

                {/* Major Roads */}
                <path
                  d="M10,160 L120,120 L250,70 L390,40"
                  fill="none"
                  stroke="#fde047"
                  strokeWidth="3.5"
                  strokeDasharray="4 2"
                />

                {/* Settlement Markers */}
                <g transform="translate(110, 115)">
                  <circle r="4" fill="#0f172a" />
                  <text x="7" y="3" fontSize="9" fontWeight="bold" fill="#0f172a">
                    Gogamukh
                  </text>
                </g>
                <g transform="translate(230, 65)">
                  <circle r="4" fill="#0f172a" />
                  <text x="7" y="3" fontSize="9" fontWeight="bold" fill="#0f172a">
                    Sisiborgaon
                  </text>
                </g>
                <g transform="translate(280, 140)">
                  <circle r="4" fill="#dc2626" />
                  <text x="7" y="3" fontSize="9" fontWeight="bold" fill="#dc2626">
                    Dhemaji HQ
                  </text>
                </g>
              </svg>
            </div>

            {/* Map Legend & Link */}
            <div className="p-2.5 bg-slate-50 flex items-center justify-between text-[11px] font-medium text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
                <span>Active Flood Layer &bull; CWC Satellite Mesh</span>
              </span>
              <Link
                href={`/${locale}/shelters`}
                className="text-teal-700 font-bold hover:underline"
              >
                Full Map &rarr;
              </Link>
            </div>
          </section>

          {/* Card E: Emergency Kit Ready? */}
          <div className="border border-slate-200 rounded-lg p-3.5 bg-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-sky-50 text-sky-700 shrink-0">
                <Icon name="first-aid" size={22} />
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                  Emergency Kit Ready?
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Check essential ORS, dry rations &amp; torch checklist.
                </p>
              </div>
            </div>

            <Link
              href={`/${locale}/kit`}
              className="text-xs px-3 py-1.5 rounded-md border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold transition-colors cursor-pointer shrink-0"
            >
              Open Checklist
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
