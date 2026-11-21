"use client";

import React from "react";
import { usePreferences } from "@/hooks/usePreferences";
import { t } from "@/i18n/config";
import type { Locale } from "@/types";

interface TextSizeToggleProps {
  locale: Locale;
  className?: string;
}

export function TextSizeToggle({ locale, className = "" }: TextSizeToggleProps) {
  const { preferences, setTextScale } = usePreferences();

  const options: Array<{ scale: 1 | 1.25 | 1.5; labelKey: string }> = [
    { scale: 1, labelKey: "settings.textSize.normal" },
    { scale: 1.25, labelKey: "settings.textSize.large" },
    { scale: 1.5, labelKey: "settings.textSize.largest" },
  ];

  return (
    <div className={`space-y-2 ${className}`}>
      <label
        id="text-size-label"
        className="block text-sm font-semibold text-[var(--color-text-main)]"
      >
        {t(locale, "settings.textSize")}
      </label>

      <div role="radiogroup" aria-labelledby="text-size-label" className="grid grid-cols-3 gap-2">
        {options.map((opt) => {
          const isSelected = preferences.textScale === opt.scale;
          return (
            <button
              key={opt.scale}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setTextScale(opt.scale)}
              className={`min-h-[48px] px-3 py-2 rounded-[var(--radius-card)] border text-sm font-medium transition-colors flex flex-col items-center justify-center gap-0.5 ${
                isSelected
                  ? "bg-[var(--color-primary-bg)] text-[var(--color-primary-text)] border-[var(--color-primary-bg)] font-bold shadow-sm"
                  : "bg-[var(--color-bg-card)] text-[var(--color-text-main)] border-[var(--color-border-card)] hover:bg-[var(--color-bg-page)]"
              }`}
            >
              <span className="text-base" style={{ fontSize: `${opt.scale}rem` }}>
                A
              </span>
              <span className="text-xs">{t(locale, opt.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
