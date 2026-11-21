"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Icon } from "@/components/ui/Icon";
import { t } from "@/i18n/config";
import type { Locale } from "@/types";

const EmergencyPanel = dynamic(
  () => import("@/components/emergency/EmergencyPanel").then((mod) => mod.EmergencyPanel),
  { ssr: false }
);

interface EmergencyFabProps {
  locale: Locale;
  className?: string;
}

export function EmergencyFab({ locale, className = "" }: EmergencyFabProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        id="emergency-fab"
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`fixed bottom-5 right-5 z-40 min-h-[56px] min-w-[56px] px-5 py-3 rounded-[var(--radius-pill)] bg-[var(--color-emergency-bg)] text-[var(--color-emergency-text)] hover:bg-[var(--color-emergency-hover)] font-bold text-base shadow-lg flex items-center justify-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-400/50 cursor-pointer ${className}`}
      >
        <span
          className="p-1 rounded-full bg-white/20 flex items-center justify-center"
          aria-hidden="true"
        >
          <Icon name="phone" size={22} />
        </span>
        <span className="tracking-wide">{t(locale, "common.emergency")} 112</span>
      </button>

      {/* Emergency Overlay Dialog */}
      {isOpen && (
        <EmergencyPanel isOpen={isOpen} onClose={() => setIsOpen(false)} locale={locale} />
      )}
    </>
  );
}
