"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { usePreferences } from "@/hooks/usePreferences";
import { useSpeech } from "@/hooks/useSpeech";
import { t } from "@/i18n/config";
import type { LocaleGuide } from "@/lib/data";
import type { Locale } from "@/types";

export type GuidePhase = "before" | "during" | "after";

export interface GuideStepsProps {
  guide: LocaleGuide;
  locale: Locale;
  className?: string;
  onHazardChange?: (hazard: "flood" | "landslide") => void;
}

interface EnrichedStepMeta {
  code: string;
  category: string;
  title: string;
  localizedNote: string;
  actionLink?: {
    label: string;
    href: string;
  };
}

const DURING_FLOOD_STEPS_META: Record<string, EnrichedStepMeta> = {
  "0": {
    code: "STEP 01",
    category: "CRITICAL MOVE",
    title:
      "Move immediately to identified higher ground or nearest shelter camp. Do not wait for water to enter your home.",
    localizedNote:
      "উচ্চ স্থান বা নিকটৱৰ্তী আশ্ৰয় শিবিৰলৈ পলম নকৰি যাওক। Flood surges in Majuli and Kaziranga plains can rise up to 1 meter in under 20 minutes once peripheral embankments suffer breach. Carry your lightweight watertight emergency packet.",
    actionLink: {
      label: "Locate Nearest High Haven (1.4 km)",
      href: "/shelters",
    },
  },
  "1": {
    code: "STEP 02",
    category: "UTILITY LOCKOUT",
    title: "Turn off the main electrical breaker and gas cylinders before evacuating.",
    localizedNote:
      "বিজুলীৰ মূল ছুইচ আৰু গেছ চিলিণ্ডাৰ বন্ধ কৰক। Prevents widespread electrocution and post-submersion gas fires. If standing in pooled water, use a dry wooden stick to flip the main distribution board switch.",
  },
  "2": {
    code: "STEP 03",
    category: "CURRENT DANGER",
    title: "Never walk or drive through moving water. 6 inches of rapid water can knock you down.",
    localizedNote:
      "গতিশীল পানীৰ মাজেৰে কেতিয়াও খোজ নাকাঢ়িব। 12 inches of fast water will float light vehicles and two-wheelers. Hidden culvert cave-ins and sinkholes under murky runoff cannot be seen. Test footing with a strong bamboo pole (baah-lathi) before every step.",
  },
  "3": {
    code: "STEP 04",
    category: "ANIMAL SAFEGUARD",
    title: "Keep livestock untied so they can swim to safety on raised platforms (Chapori).",
    localizedNote:
      "পশুধন মুক্ত কৰি দিয়ক যাতে তেওঁলোকে ওখ চাপৰিলৈ সাঁতুৰি যাব পাৰে। Tethered cows and goats face 90% mortality in sudden flash crests. Move herds toward designated village community highlands or raised earthen mounds built by district authorities.",
  },
  "4": {
    code: "STEP 05",
    category: "WATER SANITATION",
    title:
      "Drink only boiled or halogen/chlorine tablet purified water to prevent cholera/diarrhea.",
    localizedNote:
      "বিশুদ্ধ বা উতলোৱা পানী খাওক। Submerged tube-wells are contaminated by animal carcasses and latrine pits. Dissolve 1 halogen tablet per 20 liters of clear filtered water; wait at least 30 minutes before oral ingestion.",
  },
  "5": {
    code: "STEP 06",
    category: "HYDRO BROADCAST WATCH",
    title: "Listen to battery radio or check Xohayy cached alerts for dam water releases.",
    localizedNote:
      "ৰেডিঅ' বা ক্লাউড বাৰ্তাৰ জৰিয়তে বান্ধৰ পানী এৰি দিয়াৰ তথ্য লওক। Monitor Kurichhu (Bhutan) and Ranganadi dam outflow warnings. The local DD Assam & AIR Guwahati broadcast on 729 kHz.",
  },
};

export function GuideSteps({ guide, locale, className = "", onHazardChange }: GuideStepsProps) {
  const router = useRouter();
  const [activePhase, setActivePhase] = useState<GuidePhase>("during");
  const [activeAudioLang, setActiveAudioLang] = useState<Locale>(locale);
  const { preferences, toggleGuideRead } = usePreferences();
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const { status, isSupported, rate, setRate, speak, pause, resume, stop } = useSpeech({
    locale: activeAudioLang,
  });

  const isPlaying = status === "playing";
  const isPaused = status === "paused";

  const phases: { id: GuidePhase; label: string; stage: string; desc: string }[] = useMemo(
    () => [
      {
        id: "before",
        label: t(locale, "guides.phase.before") || "Before Disaster",
        stage: "STAGE 01 \u2022 PREP",
        desc: "Sandbags, rations & elevated shelf rigging",
      },
      {
        id: "during",
        label: t(locale, "guides.phase.during") || "During Disaster",
        stage: "STAGE 02 \u2022 CRITICAL",
        desc: "Immediate evacuation & survival protocols",
      },
      {
        id: "after",
        label: t(locale, "guides.phase.after") || "After Disaster",
        stage: "STAGE 03 \u2022 RECOVERY",
        desc: "Water disinfection, snake safety & returns",
      },
    ],
    [locale]
  );

  // Steps filtered by active phase
  const phaseSteps = useMemo(() => {
    return guide.steps.filter((s) => s.phase === activePhase);
  }, [guide.steps, activePhase]);

  // Seed default 3 checked items for During phase if preference list is empty
  useEffect(() => {
    if (preferences.readGuides.length === 0 && guide.hazard === "flood") {
      const defaultIds = phaseSteps.slice(0, 3).map((s) => s.id);
      defaultIds.forEach((id) => toggleGuideRead(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completedCount = useMemo(() => {
    return phaseSteps.filter((s) => preferences.readGuides.includes(s.id)).length;
  }, [phaseSteps, preferences.readGuides]);

  const totalCount = phaseSteps.length || 6;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 50;

  // Build full text for reading active phase steps aloud
  const phaseTextToRead = useMemo(() => {
    const phaseLabel = phases.find((p) => p.id === activePhase)?.label || activePhase;
    const stepsText = phaseSteps.map((s, idx) => `${idx + 1}. ${s.text}`).join(". ");
    return `${guide.title}. ${phaseLabel}. ${stepsText}`;
  }, [guide.title, activePhase, phaseSteps, phases]);

  const handleAudioPlayToggle = () => {
    if (isPlaying) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      speak(phaseTextToRead);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    if (e.key === "ArrowRight") {
      nextIndex = (index + 1) % phases.length;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (index - 1 + phases.length) % phases.length;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = phases.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    const nextPhase = phases[nextIndex];
    if (nextPhase) {
      setActivePhase(nextPhase.id);
    }
    tabsRef.current[nextIndex]?.focus();
  };

  const handleHazardSwitch = (hz: "flood" | "landslide") => {
    if (onHazardChange) {
      onHazardChange(hz);
    } else {
      router.push(`/${locale}/guides/${hz}`);
    }
  };

  const isFlood = guide.hazard === "flood";

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 1. Sub-Header Status Ribbon */}
      <div className="w-full bg-[#f0fdfa] border border-[#99f6e4] rounded-lg px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 shadow-xs">
        <div className="flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-teal-800">
            ASDMA SATELLITE PACKET V4.2 &bull; CACHED FOR OFFLINE EMERGENCIES
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
          <span>REF: NE-SOP-FL24</span>
          <span className="hidden sm:inline">&bull;</span>
          <span className="hidden sm:inline">NO INTERNET REQUIRED FOR READ-ALOUD</span>
        </div>
      </div>

      {/* 2. Hazard Protocol Switcher Bar & Print Action */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Flood Safety Protocol Tab Button */}
          <button
            type="button"
            onClick={() => handleHazardSwitch("flood")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md font-bold text-xs sm:text-sm transition-colors cursor-pointer ${
              isFlood
                ? "bg-[#b91c1c] text-white shadow-xs"
                : "bg-sky-50 text-slate-700 border border-sky-200 hover:bg-sky-100"
            }`}
          >
            <Icon name="droplets" size={16} />
            <span>Flood Safety Protocol</span>
            {isFlood && (
              <span className="bg-red-950/80 text-white text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                LIVE ACTIVE
              </span>
            )}
          </button>

          {/* Landslide & Mudflow Tab Button */}
          <button
            type="button"
            onClick={() => handleHazardSwitch("landslide")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md font-bold text-xs sm:text-sm transition-colors cursor-pointer ${
              !isFlood
                ? "bg-[#b91c1c] text-white shadow-xs"
                : "bg-sky-50 text-slate-700 border border-sky-200 hover:bg-sky-100"
            }`}
          >
            <Icon name="warning" size={16} />
            <span>Landslide &amp; Mudflow</span>
            {!isFlood && (
              <span className="bg-red-950/80 text-white text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                LIVE ACTIVE
              </span>
            )}
          </button>
        </div>

        {/* Print Quick Card Button */}
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Icon name="file-text" size={14} className="text-slate-500" />
          <span>Print 1-Page Emergency Quick Card</span>
        </button>
      </div>

      {/* 3. Assistive Audio Voice System Toolbar (Navy Slate Bar) */}
      <div className="bg-slate-900 text-white rounded-lg p-3 sm:p-4 shadow-sm space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Audio Title & Voice Status */}
          <div className="space-y-0.5 max-w-xl">
            <span className="text-[10px] font-mono tracking-wider text-cyan-400 font-bold uppercase block">
              ASSISTIVE AUDIO VOICE SYSTEM
            </span>
            <div className="flex items-center gap-2">
              <Icon name="volume-2" size={17} className="text-cyan-400 shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                Reading: {phases.find((p) => p.id === activePhase)?.label} - Immediate Action Steps
              </span>
            </div>
            <p className="text-[11px] text-slate-400 italic truncate max-w-md">
              &ldquo;পদক্ষেপ ১: চিহ্নিত ওখ ঠাই বা নিকটতম আশ্ৰয় শিবিৰলৈ তৎকালিনভাৱে যাওক...&rdquo; (Step
              1: Move immediately to identified higher ground...)
            </p>
          </div>

          {/* Audio Controls: Lang, Speed, Play/Pause/Stop */}
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            {/* Audio Script / Language Switcher */}
            <div className="flex items-center rounded-md border border-slate-700 bg-slate-800 p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveAudioLang("as")}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  activeAudioLang === "as"
                    ? "bg-[#0d766e] text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                অসমীয়া
              </button>
              <button
                type="button"
                onClick={() => setActiveAudioLang("hi")}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  activeAudioLang === "hi"
                    ? "bg-[#0d766e] text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => setActiveAudioLang("en")}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  activeAudioLang === "en"
                    ? "bg-[#0d766e] text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                EN (IN)
              </button>
            </div>

            {/* Playback Rate / Speed */}
            <div className="flex items-center rounded-md border border-slate-700 bg-slate-800 p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setRate(0.8)}
                className={`px-2 py-1 rounded text-xs ${
                  rate === 0.8
                    ? "bg-slate-700 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                0.8x Slow
              </button>
              <button
                type="button"
                onClick={() => setRate(1.0)}
                className={`px-2 py-1 rounded text-xs ${
                  rate === 1.0
                    ? "bg-slate-700 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                1.0x
              </button>
            </div>

            {/* Play / Pause Button (Solid Crimson Red) */}
            <button
              type="button"
              onClick={handleAudioPlayToggle}
              disabled={!isSupported}
              aria-label={isPlaying ? "Pause audio reading" : "Play audio reading"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Icon name={isPlaying ? "pause" : "play"} size={15} />
              <span>{isPlaying ? "Pause" : "Play"}</span>
            </button>

            {/* Stop Button */}
            <button
              type="button"
              onClick={stop}
              disabled={!isSupported || status === "idle"}
              aria-label="Stop audio reading"
              className="px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer disabled:opacity-40"
            >
              <Icon name="square" size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. 3 Stage Tabs (Timeline Phase Selector) */}
      <div
        role="tablist"
        aria-label="Safety Guide Phases"
        className="grid grid-cols-1 md:grid-cols-3 gap-2.5"
      >
        {phases.map((phase, idx) => {
          const isSelected = activePhase === phase.id;
          return (
            <button
              key={phase.id}
              ref={(el) => {
                tabsRef.current[idx] = el;
              }}
              role="tab"
              id={`tab-${phase.id}`}
              aria-selected={isSelected}
              aria-controls={`panel-${phase.id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setActivePhase(phase.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 ${
                isSelected
                  ? "bg-[#b91c1c] text-white border-red-700 shadow-sm"
                  : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-mono font-bold tracking-wider uppercase ${
                    isSelected ? "text-red-100" : "text-slate-500"
                  }`}
                >
                  {phase.stage}
                </span>
                {phase.id === "during" && isSelected && (
                  <span className="text-white text-xs font-bold">&#9888;</span>
                )}
              </div>
              <h3
                className={`text-base font-bold mt-0.5 tracking-tight ${
                  isSelected ? "text-white" : "text-slate-900"
                }`}
              >
                {phase.label}
              </h3>
              <p
                className={`text-xs mt-0.5 line-clamp-1 ${
                  isSelected ? "text-red-100 font-medium" : "text-slate-500"
                }`}
              >
                {phase.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* 5. Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ================= LEFT COLUMN (~68% / 8 of 12 cols) ================= */}
        <div className="lg:col-span-8 space-y-4">
          {/* Header & Compliance Progress Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-xs">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded border border-red-300 bg-red-50 text-red-700 text-[10px] font-mono font-bold tracking-wider uppercase">
                    RED PROTOCOL PRIORITY
                  </span>
                  <span className="px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-600 text-[10px] font-mono font-bold tracking-wider uppercase">
                    RIVERINE SPATE &amp; BREACH
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                  {isFlood
                    ? "Assam Valley Flash & Basin Flood Steps"
                    : "Hilly Slopes & Landslide Immediate Actions"}
                </h2>
              </div>

              {/* Progress Count & Compliance Status */}
              <div className="text-right">
                <span className="text-lg sm:text-xl font-black text-red-600 font-mono block">
                  {completedCount} of {totalCount} steps completed
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Mandatory Protocol Compliance
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${completedCount} of ${totalCount} steps completed`}
              className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200"
            >
              <div
                className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Blue Guidance Note */}
            <div className="flex items-start gap-2 p-2.5 rounded-md bg-blue-50/70 border border-blue-200 text-xs text-blue-900">
              <Icon name="info" size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Follow these sequential survival actions strictly. Check off each action as you or
                your family unit secures completion. Items remain stored in your browser even
                without network connectivity.
              </p>
            </div>
          </div>

          {/* Active Tab Panel with Step Cards */}
          <div
            role="tabpanel"
            id={`panel-${activePhase}`}
            aria-labelledby={`tab-${activePhase}`}
            tabIndex={0}
            className="space-y-3 focus:outline-none"
          >
            {phaseSteps.map((step, idx) => {
              const isChecked = preferences.readGuides.includes(step.id);
              const meta =
                isFlood && activePhase === "during" ? DURING_FLOOD_STEPS_META[String(idx)] : null;
              const stepCode = meta?.code || `STEP 0${idx + 1}`;
              const category =
                meta?.category || (activePhase === "during" ? "CRITICAL MOVE" : "PREP ACTION");
              const stepTitle = meta?.title || step.text;
              const localizedNote = meta?.localizedNote || (locale === "as" ? step.text : null);

              return (
                <div
                  key={step.id}
                  className={`bg-white border rounded-lg p-4 transition-all space-y-2 shadow-xs ${
                    isChecked
                      ? "border-slate-200 bg-slate-50/50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {/* Step Top Bar: Checkbox, Step Label, Status Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Checkbox */}
                      <label
                        htmlFor={`step-check-${step.id}`}
                        className="flex items-center gap-2 cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          id={`step-check-${step.id}`}
                          checked={isChecked}
                          onChange={() => toggleGuideRead(step.id)}
                          className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                          aria-label={`Mark completed: ${stepTitle}`}
                        />
                        <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {stepCode} &bull; {category}
                        </span>
                      </label>
                    </div>

                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${
                        isChecked
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isChecked ? "Done" : "Pending"}
                    </span>
                  </div>

                  {/* Primary English Action */}
                  <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {stepTitle}
                  </p>

                  {/* Localized Explanation & Field Note */}
                  {localizedNote && (
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {localizedNote}
                    </p>
                  )}

                  {/* Action Link if provided */}
                  {meta?.actionLink && (
                    <div className="pt-1">
                      <Link
                        href={`/${locale}${meta.actionLink.href}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline"
                      >
                        <Icon name="navigation" size={13} />
                        <span>{meta.actionLink.label}</span>
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Community Highland Protocol Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-col sm:flex-row items-center gap-3.5 shadow-xs">
            {/* Visual Thumbnail Graphic for Chapori */}
            <div className="w-full sm:w-28 h-20 bg-emerald-100 border border-emerald-200 rounded-md overflow-hidden shrink-0 relative flex items-center justify-center">
              <svg viewBox="0 0 100 70" className="w-full h-full object-cover">
                <rect width="100" height="70" fill="#a7f3d0" />
                <path d="M0 45 Q30 35 60 48 T100 42 L100 70 L0 70 Z" fill="#93c5fd" />
                <path d="M15 40 Q40 20 75 35 Q90 40 100 45 L0 45 Z" fill="#6ee7b7" />
                <circle cx="45" cy="30" r="4" fill="#047857" />
                <circle cx="65" cy="32" r="3.5" fill="#047857" />
                <rect x="30" y="24" width="8" height="6" fill="#78350f" />
                <polygon points="28,24 34,18 40,24" fill="#b45309" />
              </svg>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                COMMUNITY HIGHLAND PROTOCOL (CHAPORI / চাপৰি)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Villages along Dhemaji, Barpeta, and Morigaon maintain community-identified dry
                platforms. Secure your family in the designated cluster before nightfall. Flash
                boats cannot navigate flood currents after 18:00 hrs.
              </p>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN (~32% / 4 of 12 cols) ================= */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: Water Safety Ratios */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Icon name="droplets" size={17} className="text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Water Safety Ratios</h3>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="flex items-center justify-between py-2">
                <span className="font-semibold text-slate-700">Boiling Protocol</span>
                <span className="font-mono text-slate-900 font-bold bg-slate-50 px-2 py-0.5 rounded">
                  Rolling boil &gt; 3 mins
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="font-semibold text-slate-700">Halogen Tablet</span>
                <span className="font-mono text-slate-900 font-bold bg-slate-50 px-2 py-0.5 rounded">
                  1 tablet / 20 Liters
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="font-semibold text-slate-700">Liquid Bleach (4%)</span>
                <span className="font-mono text-slate-900 font-bold bg-slate-50 px-2 py-0.5 rounded">
                  2 drops / 1 Liter
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic pt-1 leading-snug">
              *Never consume water that has contact with petroleum slicks or decaying organic
              sludge.
            </p>
          </div>

          {/* Card 2: Snake Encounter Hazard (Solid Crimson Red) */}
          <div className="bg-[#dc2626] text-white rounded-lg p-4 space-y-2.5 shadow-sm">
            <div className="flex items-center gap-2">
              <Icon name="warning" size={18} className="text-white" />
              <h3 className="text-xs sm:text-sm font-black tracking-wide uppercase">
                Snake Encounter Hazard
              </h3>
            </div>

            <p className="text-xs text-red-100 leading-relaxed font-medium">
              Snakes seek refuge on the same high spots, trees, and thatched roofs as humans. Always
              carry a stick and inspect rafters and dry bundles with a flashlight before touching.
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-red-500/60 text-xs">
              <span className="font-semibold text-red-100">Anti-Venom Hotlines:</span>
              <span className="font-mono font-bold text-white bg-red-900/60 px-2 py-0.5 rounded">
                108 / 104 Health
              </span>
            </div>
          </div>

          {/* Card 3: Hilly Terrains Warning */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="warning" size={16} className="text-amber-600" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Hilly Terrains Warning
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-mono font-bold">
                NH-27 / NH-6
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              For Dima Hasao, Karbi Anglong, and Meghalaya escarpment roads, waterlogging triggers
              slope liquefaction within 48 hours of uninterrupted rain.
            </p>

            <div className="space-y-1 text-xs text-slate-700">
              <div className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">&#9888;</span>
                <span>Watch for sudden muddy discharge in hill creeks.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">&#9888;</span>
                <span>Trees tilting or telephone posts pulling taut.</span>
              </div>
            </div>

            <div className="pt-1.5">
              <button
                type="button"
                onClick={() => handleHazardSwitch("landslide")}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline block"
              >
                View Complete Landslide Guide &rarr;
              </button>
            </div>
          </div>

          {/* Card 4: Offline Preparedness */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2 shadow-xs">
            <div className="flex items-center gap-2">
              <Icon name="wifi-off" size={16} className="text-teal-600" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">Offline Preparedness</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              All safety guidelines on this screen are cached locally into your device browser
              storage. They will open automatically when mobile tower networks fail.
            </p>

            <div className="pt-1">
              <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded block text-center">
                Status: ALL 7 GUIDES STORED LOCALLY
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuideSteps;
