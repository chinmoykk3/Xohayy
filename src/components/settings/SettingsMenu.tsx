"use client";

import React, { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { t } from "@/i18n/config";
import type { Locale } from "@/types";
import { SettingsDialog } from "./SettingsDialog";

interface SettingsMenuProps {
  locale: Locale;
  className?: string;
}

export function SettingsMenu({ locale, className = "" }: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

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

      {/* Accessible Settings Dialog loaded on demand */}
      {isOpen && (
        <SettingsDialog isOpen={isOpen} onClose={() => setIsOpen(false)} locale={locale} />
      )}
    </div>
  );
}
