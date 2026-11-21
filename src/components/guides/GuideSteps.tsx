"use client";

import React, { useState, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/Card";
import { Icon, type IconName } from "@/components/ui/Icon";
import { usePreferences } from "@/hooks/usePreferences";
import { t } from "@/i18n/config";
import type { LocaleGuide } from "@/lib/data";
import type { Locale } from "@/types";

const ReadAloud = dynamic(() => import("@/components/speech/ReadAloud"), {
  ssr: false,
});

export type GuidePhase = "before" | "during" | "after";

export interface GuideStepsProps {
  guide: LocaleGuide;
  locale: Locale;
  className?: string;
}

export function GuideSteps({ guide, locale, className = "" }: GuideStepsProps) {
  const [activePhase, setActivePhase] = useState<GuidePhase>("before");
  const { preferences, toggleGuideRead } = usePreferences();
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const phases: { id: GuidePhase; label: string }[] = useMemo(
    () => [
      { id: "before", label: t(locale, "guides.phase.before") },
      { id: "during", label: t(locale, "guides.phase.during") },
      { id: "after", label: t(locale, "guides.phase.after") },
    ],
    [locale]
  );

  // Steps filtered by active phase
  const phaseSteps = useMemo(() => {
    return guide.steps.filter((s) => s.phase === activePhase);
  }, [guide.steps, activePhase]);

  // Overall and phase-level progress
  const phaseCompletedCount = useMemo(() => {
    return phaseSteps.filter((s) => preferences.readGuides.includes(s.id)).length;
  }, [phaseSteps, preferences.readGuides]);

  const phaseTotal = phaseSteps.length;
  const phasePercent = phaseTotal > 0 ? Math.round((phaseCompletedCount / phaseTotal) * 100) : 0;

  // Build full text for reading active phase steps aloud
  const phaseTextToRead = useMemo(() => {
    const phaseLabel = phases.find((p) => p.id === activePhase)?.label || activePhase;
    const stepsText = phaseSteps.map((s, idx) => `${idx + 1}. ${s.text}`).join(". ");
    return `${guide.title}. ${phaseLabel}. ${stepsText}`;
  }, [guide.title, activePhase, phaseSteps, phases]);

  // Keyboard navigation for tab list
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

  const getSafeIconName = (name: string): IconName => {
    const validIcons: Record<string, IconName> = {
      phone: "phone",
      warning: "warning",
      info: "info",
      check: "check",
      "alert-triangle": "alert-triangle",
      shield: "shield",
      "map-pin": "map-pin",
      "first-aid": "first-aid",
      droplets: "droplets",
      radio: "radio",
      "file-text": "file-text",
    };
    return validIcons[name] || "check";
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Accessible Tab List for Phases */}
      <div
        role="tablist"
        aria-label="Safety Guide Phases"
        className="flex border-b border-[var(--color-border-card)] gap-2 overflow-x-auto"
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
              className={`min-h-[48px] px-4 py-2.5 font-semibold text-sm sm:text-base border-b-2 transition-all cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] rounded-t-[var(--radius-card)] ${
                isSelected
                  ? "border-[var(--color-primary-bg)] text-[var(--color-text-main)] font-bold bg-[var(--color-bg-page)]"
                  : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              }`}
            >
              {phase.label}
            </button>
          );
        })}
      </div>

      {/* 2. Progress Indicator Card */}
      <Card className="bg-[var(--color-bg-card)] border border-[var(--color-border-card)] p-4 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="font-semibold text-[var(--color-text-main)]">
            {t(locale, "guides.progress", {
              completed: String(phaseCompletedCount),
              total: String(phaseTotal),
            })}
          </span>
          <span className="text-xs text-[var(--color-text-muted)] font-medium">
            {phasePercent}% {t(locale, "guides.stepCompleted")}
          </span>
        </div>

        {/* Visual progress bar */}
        <div
          role="progressbar"
          aria-valuenow={phasePercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t(locale, "guides.progress", {
            completed: String(phaseCompletedCount),
            total: String(phaseTotal),
          })}
          className="w-full bg-[var(--color-bg-page)] h-2.5 rounded-[var(--radius-pill)] overflow-hidden border border-[var(--color-border-card)]"
        >
          <div
            className="bg-[var(--color-risk-watch-text)] h-full transition-all duration-300 rounded-[var(--radius-pill)]"
            style={{ width: `${phasePercent}%` }}
          />
        </div>
      </Card>

      {/* 3. Read Aloud Control Bar for Active Phase */}
      <div className="pt-1">
        <ReadAloud text={phaseTextToRead} locale={locale} />
      </div>

      {/* 4. Active Tab Panel */}
      <div
        role="tabpanel"
        id={`panel-${activePhase}`}
        aria-labelledby={`tab-${activePhase}`}
        tabIndex={0}
        className="focus:outline-none focus:ring-1 focus:ring-[var(--color-focus-ring)] space-y-3"
      >
        <div className="grid grid-cols-1 gap-3">
          {phaseSteps.map((step, index) => {
            const isRead = preferences.readGuides.includes(step.id);
            return (
              <Card
                key={step.id}
                className={`p-4 transition-all border ${
                  isRead
                    ? "bg-[var(--color-bg-page)] border-[var(--color-border-card)] opacity-90"
                    : "bg-[var(--color-bg-card)] border-[var(--color-border-card)] hover:border-[var(--color-primary-bg)] shadow-xs"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Step Index & Icon */}
                  <div
                    className={`shrink-0 p-2.5 rounded-[var(--radius-card)] flex items-center justify-center ${
                      isRead
                        ? "bg-[var(--color-risk-low-bg)] text-[var(--color-risk-low-text)]"
                        : "bg-[var(--color-bg-page)] text-[var(--color-text-main)] border border-[var(--color-border-card)]"
                    }`}
                    aria-hidden="true"
                  >
                    <Icon name={getSafeIconName(step.icon)} size={22} />
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">
                      {t(locale, "guides.phase." + activePhase)} &bull; #{index + 1}
                    </div>
                    <p
                      className={`text-base leading-relaxed ${
                        isRead
                          ? "line-through text-[var(--color-text-muted)]"
                          : "text-[var(--color-text-main)] font-medium"
                      }`}
                    >
                      {step.text}
                    </p>
                  </div>

                  {/* Accessible Checkbox */}
                  <div className="shrink-0 flex items-center pt-1">
                    <label
                      htmlFor={`step-check-${step.id}`}
                      className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-[var(--color-text-muted)] min-h-[44px] min-w-[44px] justify-center"
                    >
                      <input
                        type="checkbox"
                        id={`step-check-${step.id}`}
                        checked={isRead}
                        onChange={() => toggleGuideRead(step.id)}
                        className="w-5 h-5 rounded border-[var(--color-border-card)] text-[var(--color-primary-bg)] focus:ring-[var(--color-focus-ring)] cursor-pointer"
                        aria-label={`${t(locale, "guides.markRead")}: ${step.text}`}
                      />
                    </label>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default GuideSteps;
