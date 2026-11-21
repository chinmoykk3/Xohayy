import React from "react";
import { Card } from "@/components/ui/Card";
import { RiskBadge } from "./RiskBadge";
import { Icon } from "@/components/ui/Icon";
import { isAlertExpired } from "@/lib/alerts";
import { formatDateTime } from "@/lib/format";
import { DEFAULT_LOCALE, t } from "@/i18n/config";
import type { Alert, Locale } from "@/types";

export interface AlertCardProps {
  alert: Alert;
  locale?: Locale;
  className?: string;
}

export function AlertCard({ alert, locale = DEFAULT_LOCALE, className = "" }: AlertCardProps) {
  const isExpired = isAlertExpired(alert);
  const title = alert.title[locale] || alert.title.en;
  const message = alert.message[locale] || alert.message.en;

  const hazardIcon =
    alert.hazard === "flood"
      ? "droplets"
      : alert.hazard === "landslide"
        ? "warning"
        : alert.hazard === "storm"
          ? "alert-triangle"
          : "info";

  return (
    <Card
      as="article"
      className={`relative bg-[var(--color-bg-card)] border transition-all ${
        isExpired
          ? "border-[var(--color-border-card)] opacity-80"
          : alert.risk === "severe"
            ? "border-[var(--color-risk-danger-border)] shadow-xs"
            : "border-[var(--color-border-card)] hover:border-[var(--color-primary-bg)]"
      } ${className}`}
    >
      <div className="space-y-3">
        {/* Top Header Row: Risk Badge, Hazard type, Expiry/Demo Tags */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <RiskBadge level={alert.risk} locale={locale} size="sm" />
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] bg-[var(--color-bg-page)] px-2 py-0.5 rounded-[var(--radius-pill)] border border-[var(--color-border-card)]">
              <Icon name={hazardIcon} size={14} />
              <span>{alert.hazard}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isExpired && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-[var(--radius-pill)] text-xs font-bold bg-gray-100 text-gray-700 border border-gray-300">
                {t(locale, "common.expired")}
              </span>
            )}
            {alert.isDemo && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-[var(--radius-pill)] text-xs font-semibold bg-[var(--color-bg-page)] text-[var(--color-text-muted)] border border-[var(--color-border-card)]">
                {t(locale, "common.demoTag")}
              </span>
            )}
          </div>
        </div>

        {/* Advisory Title and Message */}
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-[var(--color-text-main)] leading-snug">
            {title}
          </h3>
          <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed">
            {message}
          </p>
        </div>

        {/* Timestamps & Source attribution */}
        <div className="pt-2.5 border-t border-[var(--color-border-card)] flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--color-text-muted)]">
          <div className="flex flex-wrap items-center gap-2.5">
            <span>
              {t(locale, "alerts.issuedAt", { time: formatDateTime(alert.issuedAt, locale) })}
            </span>
            <span>•</span>
            <span
              className={isExpired ? "text-gray-500 font-medium" : "text-amber-800 font-medium"}
            >
              {t(locale, "alerts.validUntil", { time: formatDateTime(alert.validUntil, locale) })}
            </span>
          </div>

          <div className="font-medium text-[var(--color-text-muted)]">
            {t(locale, "alerts.source", { source: alert.source })}
          </div>
        </div>
      </div>
    </Card>
  );
}
