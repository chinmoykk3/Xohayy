"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { TextSizeToggle } from "./TextSizeToggle";
import { ContrastToggle } from "./ContrastToggle";
import { usePreferences } from "@/hooks/usePreferences";
import { t } from "@/i18n/config";
import type { Locale } from "@/types";

interface SettingsMenuProps {
  locale: Locale;
  className?: string;
}

export function SettingsMenu({ locale, className = "" }: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { preferences, setReducedMotion, resetPreferences } = usePreferences();

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={t(locale, "settings.open")}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="inline-flex items-center justify-center min-h-[48px] min-w-[48px] p-2 text-[var(--color-text-main)] rounded-[var(--radius-card)] border border-[var(--color-border-card)] bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-page)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] cursor-pointer"
      >
        <Icon name="settings" size={20} />
      </button>

      {/* Accessible Settings Dialog */}
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={t(locale, "settings.title")}
        description={t(locale, "settings.description")}
      >
        <div className="space-y-6 py-2">
          {/* Language Selection */}
          <div className="space-y-2">
            <span className="block text-sm font-semibold text-[var(--color-text-main)]">
              {t(locale, "settings.language")}
            </span>
            <div className="w-full">
              <LanguageSwitcher
                currentLocale={locale}
                id="settings-language-select"
                className="w-full"
              />
            </div>
          </div>

          <hr className="border-[var(--color-border-card)]" />

          {/* Text Size Scale */}
          <TextSizeToggle locale={locale} />

          <hr className="border-[var(--color-border-card)]" />

          {/* Contrast Mode */}
          <ContrastToggle locale={locale} />

          <hr className="border-[var(--color-border-card)]" />

          {/* Reduced Motion Toggle */}
          <div className="space-y-2">
            <span
              id="motion-label"
              className="block text-sm font-semibold text-[var(--color-text-main)]"
            >
              {t(locale, "settings.motion")}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={preferences.reducedMotion}
              aria-labelledby="motion-label"
              onClick={() => setReducedMotion(!preferences.reducedMotion)}
              className={`w-full min-h-[48px] px-4 py-2.5 rounded-[var(--radius-card)] border flex items-center justify-between transition-colors ${
                preferences.reducedMotion
                  ? "bg-[var(--color-primary-bg)] text-[var(--color-primary-text)] border-[var(--color-primary-bg)] font-bold"
                  : "bg-[var(--color-bg-card)] text-[var(--color-text-main)] border-[var(--color-border-card)] hover:bg-[var(--color-bg-page)]"
              }`}
            >
              <span className="text-sm font-medium">{t(locale, "settings.motion")}</span>
              <span
                className={`inline-block w-4 h-4 rounded-full border border-current ${
                  preferences.reducedMotion ? "bg-current" : "bg-transparent"
                }`}
                aria-hidden="true"
              />
            </button>
          </div>

          <hr className="border-[var(--color-border-card)]" />

          {/* Reset Preferences */}
          <div className="pt-2">
            <Button type="button" variant="secondary" onClick={resetPreferences} className="w-full">
              {t(locale, "settings.reset")}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
