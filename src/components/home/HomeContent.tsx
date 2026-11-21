"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { DistrictSelect } from "@/components/alerts/DistrictSelect";
import { Dialog } from "@/components/ui/Dialog";
import { ShareLocation } from "@/components/emergency/ShareLocation";
import { useDistrict } from "@/hooks/useDistrict";
import { useOnlineStatus, toggleSimulateOffline } from "@/hooks/useOnlineStatus";
import { DEFAULT_LOCALE } from "@/i18n/config";
import type { Locale } from "@/types";

interface HomeContentProps {
  locale: Locale;
}

const FREQUENT_DISTRICTS = [
  { id: "dhemaji", en: "Dhemaji", as: "ধেমাজি" },
  { id: "lakhimpur", en: "Lakhimpur", as: "লখিমপুৰ" },
  { id: "majuli", en: "Majuli", as: "মাজুলী" },
  { id: "dibrugarh", en: "Dibrugarh", as: "ডিব্ৰুগড়" },
  { id: "barpeta", en: "Barpeta", as: "বৰপেটা" },
  { id: "morigaon", en: "Morigaon", as: "মৰিগাঁও" },
  { id: "kamrup-metro", en: "Kamrup Metro", as: "কামৰূপ মহানগৰ" },
  { id: "cachar", en: "Cachar", as: "কাছাৰ" },
];

export function HomeContent({ locale = DEFAULT_LOCALE }: HomeContentProps) {
  const { district, setDistrict } = useDistrict();
  const isOnline = useOnlineStatus();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);

  // Active district fallback to Dhemaji for demonstration of live telemetry
  const activeDistrictId = district?.id || "dhemaji";
  const activeDistrictName = district?.name[locale] || district?.name.en || "Dhemaji";

  return (
    <div className="space-y-5 pb-12">
      {/* 1. Connection & Local Cache Status Banner */}
      <div className="w-full bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="flex items-center gap-1.5 font-bold text-sky-900 dark:text-sky-200">
            <Icon
              name={isOnline ? "wifi" : "wifi-off"}
              size={16}
              className="text-sky-600 dark:text-sky-400"
            />
            <span>
              {isOnline
                ? "CONNECTED • Local Cache Synchronized"
                : "DISCONNECTED • Operating on Local Mesh Cache"}
            </span>
          </span>
          <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
            Last Synced: Today 08:30 IST (ASDMA &amp; CWC Data Feed)
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
            OFFLINE READY / অফলাইন সক্ৰিয়
          </span>
        </div>

        <button
          type="button"
          onClick={toggleSimulateOffline}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <span>⚡</span>
          <span>{isOnline ? "Simulate Field Offline" : "Restore Online"}</span>
        </button>
      </div>

      {/* 2. Active Monitoring Basin & District Switcher */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-extrabold text-xs sm:text-sm tracking-wide uppercase">
            <Icon name="map-pin" size={17} className="text-red-600" />
            <span>ACTIVE MONITORING BASIN / জিলা নিৰ্বাচন</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="hidden sm:inline">SCRIPT:</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              EN (English)
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              অসমীয়া (AS)
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              हिन्दी (HI)
            </span>
          </div>
        </div>

        {/* District Combobox and Quick Chips */}
        <div className="space-y-3">
          <div className="max-w-md">
            <DistrictSelect locale={locale} onSelect={(d) => setDistrict(d?.id ?? null)} />
          </div>

          {/* Frequent District Chips */}
          <div className="flex items-center flex-wrap gap-1.5 pt-1 text-xs">
            <span className="font-bold text-slate-600 dark:text-slate-400 mr-1">Frequent:</span>
            {FREQUENT_DISTRICTS.map((chip) => {
              const isSelected = activeDistrictId === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setDistrict(chip.id)}
                  className={`px-3 py-1.5 rounded-full font-semibold transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-red-700 text-white shadow-xs font-bold ring-2 ring-red-400/50"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {chip.en} &bull; {chip.as}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Emergency Quick Action Cards Grid (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: CALL 112 (Red) */}
        <a
          href="tel:112"
          className="bg-red-600 hover:bg-red-700 text-white rounded-xl p-4 flex items-center justify-between shadow-xs transition-transform transform active:scale-[0.99] group"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Icon name="phone" size={22} className="text-white" />
            </div>
            <div>
              <div className="text-xl font-black tracking-tight leading-none">CALL 112</div>
              <div className="text-xs text-red-100 font-medium mt-1">
                জৰুৰীকালীন সাহায্য &bull; ALL India SOS
              </div>
            </div>
          </div>
          <Icon
            name="arrow-right"
            size={20}
            className="text-white/80 group-hover:translate-x-1 transition-transform"
          />
        </a>

        {/* Card 2: DISASTER HELPLINE (White) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">
            <span>DISASTER HELPLINE</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">
              24x7 DEOC
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <a
              href="tel:1070"
              className="flex items-center justify-center gap-1.5 py-2 px-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Icon name="phone" size={13} className="text-sky-600 dark:text-sky-400" />
              <span>1070 State</span>
            </a>
            <a
              href="tel:1077"
              className="flex items-center justify-center gap-1.5 py-2 px-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Icon name="phone" size={13} className="text-sky-600 dark:text-sky-400" />
              <span>1077 Dist</span>
            </a>
          </div>
        </div>

        {/* Card 3: Relief Camps (Mint/Teal) */}
        <Link
          href={`/${locale}/shelters`}
          className="bg-teal-50/80 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/50 hover:border-teal-300 dark:hover:border-teal-700 rounded-xl p-4 flex items-center justify-between shadow-xs transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Icon name="tent" size={22} />
            </div>
            <div>
              <div className="text-base font-black text-slate-900 dark:text-slate-100 leading-tight">
                3 Relief Camps
              </div>
              <div className="text-xs text-teal-800 dark:text-teal-300 font-medium mt-0.5">
                Active &amp; Stocked Nearby
              </div>
            </div>
          </div>
          <Icon
            name="arrow-right"
            size={18}
            className="text-teal-600 dark:text-teal-400 group-hover:translate-x-1 transition-transform"
          />
        </Link>

        {/* Card 4: Share GPS SOS (Vibrant Sky Blue) */}
        <button
          type="button"
          onClick={() => setIsShareModalOpen(true)}
          className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl p-4 flex items-center justify-between shadow-xs transition-transform transform active:scale-[0.99] group text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Icon name="navigation" size={22} className="text-white" />
            </div>
            <div>
              <div className="text-base font-black tracking-tight leading-tight">Share GPS SOS</div>
              <div className="text-xs text-sky-100 font-medium mt-0.5">
                WhatsApp &amp; SMS Payload
              </div>
            </div>
          </div>
          <Icon
            name="arrow-right"
            size={18}
            className="text-white/80 group-hover:translate-x-1 transition-transform"
          />
        </button>
      </div>

      {/* 4. Main Two-Column Section (60% Left / 40% Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Severe Hazard Warning & Verified Ground Reports */}
        <div className="lg:col-span-7 space-y-5">
          {/* A. Severe Hazard Warning Card */}
          <div className="bg-white dark:bg-slate-900 border-2 border-red-500 rounded-xl overflow-hidden shadow-sm">
            {/* Red Card Header Bar */}
            <div className="bg-red-600 px-4 py-2.5 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 font-black text-sm tracking-wide">
                <span>⚠️</span>
                <span>SEVERE HAZARD WARNING &bull; উচ্চ বিপদশংকা</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-red-800 text-[11px] font-extrabold uppercase tracking-wider text-red-100 border border-red-700">
                ASDMA LEVEL-3
              </span>
            </div>

            {/* Jurisdiction & Tags */}
            <div className="p-4 sm:p-5 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    TARGET JURISDICTION
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                    {activeDistrictName} District
                  </h1>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Northern Bank Brahmaputra Basin &amp; Subansiri Drainage
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-end gap-1.5 pt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/70 text-red-800 dark:text-red-300 font-bold text-xs border border-red-200 dark:border-red-900">
                    <span>⚠️</span> Severe Flood Warning
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 font-bold text-xs border border-purple-200 dark:border-purple-900">
                    <span>⚠️</span> Moderate Slide Risk
                  </span>
                </div>
              </div>

              {/* Live Telemetry Gauges (2 Sub-Cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Sub-Card 1: Brahmaputra River Gauge */}
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Icon name="droplets" size={15} className="text-blue-600" />
                      <span>Brahmaputra Gauge</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-black uppercase">
                      RISING ▲
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                      104.80 <span className="text-sm font-semibold text-slate-500">m</span>
                    </span>
                    <span className="text-xs font-extrabold text-red-600 dark:text-red-400">
                      +0.95m above Danger Level
                    </span>
                  </div>

                  {/* Level Marks */}
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span>Warning: 102.5m</span>
                    <span className="text-red-600 dark:text-red-400 font-semibold">
                      Danger: 103.85m
                    </span>
                    <span>Peak: 106.0m</span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden flex">
                    <div className="bg-blue-500 h-full w-[65%]" />
                    <div className="bg-amber-500 h-full w-[15%]" />
                    <div className="bg-red-600 h-full w-[12%]" />
                  </div>

                  <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                    Station: Nematighat / Dhemaji CWC Station #04
                  </div>
                </div>

                {/* Sub-Card 2: Precipitation Alert */}
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span>🌧️</span>
                      <span>Precipitation Alert</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-bold">
                      IMD Automated
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                      84.0 <span className="text-sm font-semibold text-slate-500">mm</span>
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      Recorded last 24 hrs
                    </span>
                  </div>

                  {/* Forecast */}
                  <div className="text-[11px] text-slate-700 dark:text-slate-300 flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span>Forecast (Next 12h): Heavy (75-110mm)</span>
                    <span className="px-1.5 py-0.2 rounded bg-red-600 text-white font-bold text-[10px]">
                      Red Watch
                    </span>
                  </div>

                  {/* Visual Rainfall Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-sky-600 h-full w-[82%]" />
                  </div>

                  <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                    Heavy downpour concentrated over upper catchment.
                  </div>
                </div>
              </div>

              {/* Immediate Public Directive */}
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-extrabold text-xs sm:text-sm">
                  <span>🚨</span>
                  <span>IMMEDIATE PUBLIC DIRECTIVE / বাধ্যতামূলক নিৰ্দেশনা</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  Low-lying wards 4 to 9 evacuation initiated by SDRF &amp; District Administration.
                  Move immediately to designated high embankments. Keep domestic livestock secured
                  at Gogamukh High School Relief Compound.
                </p>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <Link
                    href={`/${locale}/shelters`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <Icon name="navigation" size={14} />
                    <span>Navigate to Safe Embankment</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsDispatchModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <Icon name="file-text" size={14} />
                    <span>District EOC Dispatch</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* B. Verified Ground Reports Feed */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-sm">
                <Icon name="check" size={17} className="text-emerald-600" />
                <span>Verified Ground Reports</span>
              </div>
              <Link
                href={`/${locale}/report`}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 flex items-center gap-1"
              >
                <span>Submit Field Report</span>
                <span>⊕</span>
              </Link>
            </div>

            {/* Report 1: Road Inundation */}
            <div className="space-y-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <span>⚠️</span>
                  <span>NH-15 Submerged near Gogamukh Bypass</span>
                </span>
                <span className="text-[11px] text-slate-500 uppercase tracking-wide">
                  35 MINS AGO
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                &ldquo;NH-15 submerged under 1.5 ft rushing water near Gogamukh bypass. Small
                vehicles &amp; auto-rickshaws completely stranded. Heavy trucks crawling. Local
                volunteers assisting pedestrians across railway culvert.&rdquo;
              </p>
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span>✓</span> Approved Volunteer Report &bull; Dhemaji Quick Reaction Unit
                </span>
                <span>GPS: 27.4811° N, 94.5422° E</span>
              </div>
            </div>

            {/* Report 2: Relief Camp Active */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
                <span className="flex items-center gap-1.5 text-sky-700 dark:text-sky-400">
                  <span>⛺</span>
                  <span>Relief Camp Operational at Dhemaji Higher Secondary</span>
                </span>
                <span className="text-[11px] text-slate-500 uppercase tracking-wide">1 HR AGO</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                &ldquo;Relief Camp formally activated at Dhemaji Higher Secondary School campus. 2x
                2,000L clean drinking water tanks delivered. Medical officer on site with ORS
                packets and antivenom supplies. Capacity for ~450 individuals.&rdquo;
              </p>
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  SDRF Ground Team Station Alpha
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Capacity: 142/450 Occupied
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Official Advisories, Inundation Map, Kit Card */}
        <div className="lg:col-span-5 space-y-5">
          {/* A. Official Advisories */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-sm">
                <span>📢</span>
                <span>Official Advisories</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 text-[10px] font-extrabold uppercase tracking-wide border border-teal-200 dark:border-teal-800">
                ASDMA VERIFIED
              </span>
            </div>

            {/* Advisory 1: Flash Flood / Spate */}
            <div className="space-y-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-red-600 dark:text-red-400">
                  #FL-2025-09 &bull; CRITICAL
                </span>
                <span className="text-[11px] text-slate-500">Issued 2 hrs ago</span>
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                Subansiri River Tributary Spate in Dhemaji &amp; Lakhimpur
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Continuous torrential rainfall in foothill ranges of Arunachal Pradesh has triggered
                sudden flash surges in Jiadhal and Gainadi rivulets. Breaches reported near
                Sisiborgaon embankment ring.
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <span>Valid Until: Today, 20:00 IST</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Source: ASDMA &amp; CWC
                </span>
              </div>
            </div>

            {/* Advisory 2: Landslide Warning */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-amber-600 dark:text-amber-400">
                  #LS-2025-03 &bull; TRANSIT ALERT
                </span>
                <span className="text-[11px] text-slate-500">Updated 45 mins ago</span>
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                NH-15 Landslide Clearance near Sonapur / Dima Hasao
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Geological Survey of India (GSI) has flagged slope instability along hill corridors.
                Heavy mudslip clearance actively underway by Border Roads Organisation (BRO).
                Civilian traffic diverted through alternate bypass.
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <span>Route Status: Partial Blockade</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Source: GSI &amp; BRO
                </span>
              </div>
            </div>
          </div>

          {/* B. Dhemaji Inundation Extent Map Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-sm">
                <span>🗺️</span>
                <span>{activeDistrictName} Inundation Extent Map</span>
              </div>
            </div>

            {/* Map Visual Container */}
            <div className="relative w-full h-44 rounded-lg bg-emerald-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col justify-between p-3 select-none">
              {/* Graphic representation of river corridor & flood area */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 400 180"
                preserveAspectRatio="none"
              >
                {/* River Basin Flood Poly */}
                <path
                  d="M0,110 Q100,80 200,120 T400,90 L400,180 L0,180 Z"
                  fill="rgba(56, 189, 248, 0.25)"
                />
                <path
                  d="M0,120 Q120,95 240,135 T400,105 L400,180 L0,180 Z"
                  fill="rgba(2, 132, 199, 0.45)"
                />
                <path
                  d="M120,0 Q130,60 170,100 T190,180"
                  stroke="rgba(3, 105, 161, 0.7)"
                  strokeWidth="6"
                  fill="none"
                />
                {/* Breached embankment zones */}
                <circle cx="170" cy="95" r="7" fill="#ef4444" opacity="0.85" />
                <circle cx="280" cy="115" r="7" fill="#ef4444" opacity="0.85" />
              </svg>

              {/* Map Checkpoint Labels */}
              <div className="relative z-10 flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                <span className="bg-white/85 dark:bg-slate-900/85 px-1.5 py-0.5 rounded shadow-xs">
                  Jiadhal Rivulet
                </span>
                <span className="bg-white/85 dark:bg-slate-900/85 px-1.5 py-0.5 rounded shadow-xs text-red-600">
                  ● Breach Ring #2
                </span>
              </div>

              <div className="relative z-10 flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                <span className="bg-white/85 dark:bg-slate-900/85 px-1.5 py-0.5 rounded shadow-xs">
                  Gogamukh Bypass
                </span>
                <span className="bg-white/85 dark:bg-slate-900/85 px-1.5 py-0.5 rounded shadow-xs">
                  Brahmaputra Nematighat
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>Active Flood Layer &bull; CWC Satellite Mesh</span>
              </span>
              <Link
                href={`/${locale}/shelters`}
                className="font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 flex items-center gap-1"
              >
                <span>Full Map</span>
                <span>↗</span>
              </Link>
            </div>
          </div>

          {/* C. Emergency Kit Ready? Promo Card */}
          <div className="bg-sky-50 dark:bg-slate-800/80 border border-sky-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0">
                <Icon name="first-aid" size={20} />
              </div>
              <div>
                <div className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                  Emergency Kit Ready?
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Check essential ORS, dry rations &amp; torch checklist.
                </div>
              </div>
            </div>

            <Link
              href={`/${locale}/kit`}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-600/80 whitespace-nowrap shadow-xs transition-colors shrink-0"
            >
              Open Checklist
            </Link>
          </div>
        </div>
      </div>

      {/* Share Location Modal */}
      {isShareModalOpen && (
        <Dialog
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title="Share GPS SOS Coordinates"
          description="Transmits your live coordinates via encrypted WhatsApp or SMS payload without requiring mobile web access."
        >
          <div className="py-2">
            <ShareLocation locale={locale} />
          </div>
        </Dialog>
      )}

      {/* District EOC Dispatch Modal */}
      {isDispatchModalOpen && (
        <Dialog
          isOpen={isDispatchModalOpen}
          onClose={() => setIsDispatchModalOpen(false)}
          title="District EOC Field Dispatch #DHM-2025-08"
          description="Issued by District Disaster Management Authority (DDMA), Dhemaji, Assam."
        >
          <div className="space-y-4 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg font-semibold text-red-800 dark:text-red-300">
              MANDATORY EVACUATION PROTOCOL: Low-lying Wards 4, 5, 6, 7, 8 and 9.
            </div>
            <p>
              Due to continuous precipitation in Arunachal foothills, Jiadhal river discharge has
              exceeded peak capacity. SDRF boats are positioned along Gogamukh and Sisiborgaon
              crossing points.
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>Primary designated relief camp: Dhemaji Higher Secondary School</li>
              <li>Medical emergency helpline: 108 / 112</li>
              <li>District Emergency Operations Centre (DEOC): 1077 / 03753-224222</li>
            </ul>
            <div className="pt-2 flex justify-end">
              <a
                href="tel:1077"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs"
              >
                Call District DEOC (1077)
              </a>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
