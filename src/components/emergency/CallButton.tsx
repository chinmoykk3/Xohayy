"use client";

import React, { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { t } from "@/i18n/config";
import type { Locale } from "@/types";

export interface CallButtonProps {
  label: string;
  number: string;
  subtext?: string;
  size?: "md" | "lg";
  variant?: "emergency" | "primary" | "secondary";
  locale?: Locale;
  className?: string;
}

export function CallButton({
  label,
  number,
  subtext,
  size = "md",
  variant = "secondary",
  locale = "en",
  className = "",
}: CallButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(number);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback if clipboard API is blocked
    }
  };

  const isLg = size === "lg";
  const isEmergency = variant === "emergency";

  const containerStyles = isEmergency
    ? "bg-[var(--color-emergency-bg)] text-[var(--color-emergency-text)] border-[var(--color-emergency-bg)] hover:bg-[var(--color-emergency-hover)]"
    : variant === "primary"
      ? "bg-[var(--color-primary-bg)] text-[var(--color-primary-text)] border-[var(--color-primary-bg)] hover:bg-[var(--color-primary-hover)]"
      : "bg-[var(--color-bg-card)] text-[var(--color-text-main)] border-[var(--color-border-card)] hover:bg-[var(--color-bg-page)]";

  return (
    <div
      className={`relative rounded-[var(--radius-card)] border transition-colors ${containerStyles} ${className}`}
    >
      <div className="flex items-center justify-between">
        {/* Primary Tel Link Anchor */}
        <a
          href={`tel:${number}`}
          aria-label={`${t(locale, "emergency.callAction")} ${label} ${number}`}
          className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-l-[var(--radius-card)] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] ${
            isLg ? "min-h-[64px]" : "min-h-[48px]"
          }`}
        >
          <span
            aria-hidden="true"
            className={`p-2 rounded-full flex items-center justify-center shrink-0 ${
              isEmergency
                ? "bg-white/20 text-white"
                : variant === "primary"
                  ? "bg-white/20 text-white"
                  : "bg-[var(--color-bg-page)] text-[var(--color-text-main)]"
            }`}
          >
            <Icon name="phone" size={isLg ? 26 : 20} />
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <span className={`font-bold truncate ${isLg ? "text-xl sm:text-2xl" : "text-base"}`}>
                {label}
              </span>{" "}
              <span
                className={`font-mono font-bold tracking-wider shrink-0 ${
                  isLg ? "text-2xl sm:text-3xl" : "text-lg"
                }`}
              >
                {number}
              </span>
            </div>
          </div>
        </a>

        {/* Copy Number Fallback Button */}
        <div className="shrink-0 pr-2 pl-1 flex items-center">
          <button
            type="button"
            onClick={handleCopy}
            aria-label={
              copied
                ? t(locale, "emergency.numberCopied", { number })
                : `${t(locale, "emergency.copyNumber")} ${number}`
            }
            title={t(locale, "emergency.copyNumber")}
            className={`min-h-[48px] min-w-[48px] p-2.5 rounded-[var(--radius-card)] flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] cursor-pointer ${
              isEmergency || variant === "primary"
                ? "hover:bg-white/20 text-white"
                : "hover:bg-[var(--color-bg-page)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
            }`}
          >
            {copied ? (
              <span className="flex items-center gap-1 text-xs font-bold" aria-live="polite">
                <Icon name="check" size={18} />
              </span>
            ) : (
              <span className="text-xs uppercase font-semibold tracking-wider">
                {t(locale, "common.share") === "Share"
                  ? "Copy"
                  : t(locale, "emergency.copyNumber").split(" ")[0]}
              </span>
            )}
          </button>
        </div>
      </div>

      {subtext && (
        <div className="px-4 pb-2.5 -mt-1">
          <p
            className={`text-xs truncate ${
              isEmergency || variant === "primary" ? "text-white" : "text-[var(--color-text-muted)]"
            }`}
          >
            {subtext}
          </p>
        </div>
      )}
    </div>
  );
}
