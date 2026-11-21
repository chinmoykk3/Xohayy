import React from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { DEFAULT_LOCALE, t } from "@/i18n/config";
import type { RiskLevel, Locale } from "@/types";

export interface RiskBadgeProps {
  level: RiskLevel;
  locale?: Locale;
  size?: "sm" | "md" | "lg";
  className?: string;
  showIcon?: boolean;
}

interface RiskConfig {
  icon: IconName;
  i18nKey: string;
  defaultLabel: string;
  containerClass: string;
}

const RISK_CONFIG: Record<RiskLevel, RiskConfig> = {
  low: {
    icon: "check",
    i18nKey: "alerts.risk.low",
    defaultLabel: "Low",
    containerClass:
      "bg-[var(--color-risk-low-bg)] text-[var(--color-risk-low-text)] border-[var(--color-risk-low-border)]",
  },
  moderate: {
    icon: "info",
    i18nKey: "alerts.risk.moderate",
    defaultLabel: "Moderate",
    containerClass:
      "bg-[var(--color-risk-watch-bg)] text-[var(--color-risk-watch-text)] border-[var(--color-risk-watch-border)]",
  },
  high: {
    icon: "alert-triangle",
    i18nKey: "alerts.risk.high",
    defaultLabel: "High",
    containerClass:
      "bg-[var(--color-risk-warning-bg)] text-[var(--color-risk-warning-text)] border-[var(--color-risk-warning-border)]",
  },
  severe: {
    icon: "warning",
    i18nKey: "alerts.risk.severe",
    defaultLabel: "Severe",
    containerClass:
      "bg-[var(--color-risk-danger-bg)] text-[var(--color-risk-danger-text)] border-[var(--color-risk-danger-border)]",
  },
};

export function RiskBadge({
  level,
  locale = DEFAULT_LOCALE,
  size = "md",
  className = "",
  showIcon = true,
}: RiskBadgeProps) {
  const config = RISK_CONFIG[level] ?? RISK_CONFIG.low;
  const label = t(locale, config.i18nKey) || config.defaultLabel;

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-sm gap-1.5",
    lg: "px-4 py-1.5 text-base gap-2 font-semibold",
  }[size];

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  }[size];

  return (
    <span
      role="status"
      aria-label={label}
      data-risk-level={level}
      className={`inline-flex items-center rounded-[var(--radius-pill)] border font-medium tracking-wide ${config.containerClass} ${sizeClasses} ${className}`}
    >
      {showIcon && (
        <span className="shrink-0 flex items-center justify-center" aria-hidden="true">
          <Icon name={config.icon} size={iconSizes} />
        </span>
      )}
      <span>{label}</span>
    </span>
  );
}
