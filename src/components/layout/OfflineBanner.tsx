"use client";

import React from "react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { getLastFetchedAt } from "@/lib/fetcher";
import { formatDateTime } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { DEFAULT_LOCALE, t } from "@/i18n/config";
import type { Locale } from "@/types";

export interface OfflineBannerProps {
  lastUpdated?: string | Date | null;
  locale?: Locale;
  className?: string;
}

export function OfflineBanner({
  lastUpdated,
  locale = DEFAULT_LOCALE,
  className = "",
}: OfflineBannerProps) {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  const rawTimestamp = lastUpdated
    ? lastUpdated instanceof Date
      ? lastUpdated.toISOString()
      : String(lastUpdated)
    : typeof window !== "undefined"
      ? getLastFetchedAt()
      : null;

  const formattedDateTime = rawTimestamp ? formatDateTime(rawTimestamp, locale) : "";

  const bannerText = formattedDateTime
    ? t(locale, "offline.banner", { dateTime: formattedDateTime })
    : t(locale, "offline.bannerNoDate");

  return (
    <div
      role="status"
      aria-live="polite"
      className={`w-full bg-[var(--color-risk-warning-bg)] border-b border-[var(--color-risk-warning-border)] text-[var(--color-risk-warning-text)] px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 ${className}`}
    >
      <Icon name="warning" className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>{bannerText}</span>
    </div>
  );
}
