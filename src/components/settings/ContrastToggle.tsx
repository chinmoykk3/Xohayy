"use client";

import React from "react";
import { usePreferences } from "@/hooks/usePreferences";
import { t } from "@/i18n/config";
import type { Locale } from "@/types";
import { Icon } from "@/components/ui/Icon";

interface ContrastToggleProps {
  locale: Locale;
  className?: string;
}

export function ContrastToggle({ locale, className = "" }: ContrastToggleProps) {
  const { preferences, setHighContrast } = usePreferences();

  return (
    <div className={`space-y-2 ${className}`}>
      <span
        id="contrast-label"
        className="block text-sm font-semibold text-[var(--color-text-main)]"
      >
        {t(locale, "settings.contrast")}
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={preferences.highContrast}
        aria-labelledby="contrast-label"
        onClick={() => setHighContrast(!preferences.highContrast)}
        className={`w-full min-h-[48px] px-4 py-2.5 rounded-[var(--radius-card)] border flex items-center justify-between transition-colors ${
          preferences.highContrast
            ? "bg-[var(--color-text-main)] text-[var(--color-bg-card)] border-[var(--color-text-main)] font-bold"
            : "bg-[var(--color-bg-card)] text-[var(--color-text-main)] border-[var(--color-border-card)] hover:bg-[var(--color-bg-page)]"
        }`}
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <Icon name="shield" size={18} />
          <span>
            {preferences.highContrast
              ? t(locale, "settings.contrast.high")
              : t(locale, "settings.contrast.normal")}
          </span>
        </span>

        <span
          className={`inline-block w-4 h-4 rounded-full border border-current transition-colors ${
            preferences.highContrast ? "bg-current" : "bg-transparent"
          }`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
