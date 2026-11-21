"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Icon } from "@/components/ui/Icon";
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
      <div
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center rounded-full overflow-hidden shadow-2xl border border-slate-700 bg-slate-900 text-white transition-all transform hover:scale-[1.02] ${className}`}
      >
        {/* Status Pill on Left */}
        <div className="hidden sm:flex items-center gap-2 pl-4 pr-3 py-2.5 text-xs font-semibold text-slate-200 select-none">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>Brahmaputra Basin Alert Active</span>
        </div>

        {/* Action Button on Right */}
        <button
          id="emergency-fab"
          type="button"
          onClick={() => setIsOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-label="Broadcast SOS Emergency 112"
          className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 flex items-center gap-2 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          <Icon name="phone" size={16} />
          <span>Broadcast SOS</span>
        </button>
      </div>

      {/* Emergency Overlay Dialog */}
      {isOpen && (
        <EmergencyPanel isOpen={isOpen} onClose={() => setIsOpen(false)} locale={locale} />
      )}
    </>
  );
}
