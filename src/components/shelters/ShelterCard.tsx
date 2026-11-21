"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { formatDate } from "@/lib/format";
import { DEFAULT_LOCALE, t } from "@/i18n/config";
import type { Facility, Locale } from "@/types";

export interface ShelterCardProps {
  facility: Facility;
  locale?: Locale;
  className?: string;
}

export function ShelterCard({
  facility,
  locale = DEFAULT_LOCALE,
  className = "",
}: ShelterCardProps) {
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const name = facility.name[locale] || facility.name.en;
  const landmark = facility.landmark[locale] || facility.landmark.en;
  const isHospital = facility.type === "hospital";

  // Google Maps external link (link only, no embedded map tiles per spec)
  const mapsUrl =
    facility.lat && facility.lng
      ? `https://www.google.com/maps/search/?api=1&query=${facility.lat},${facility.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${landmark}`)}`;

  const handleCopyAddress = async () => {
    const fullAddress = `${name}, ${landmark}`;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(fullAddress);
      }
      setCopyStatus(t(locale, "shelters.addressCopied"));
      setTimeout(() => setCopyStatus(null), 3000);
    } catch {
      setCopyStatus(t(locale, "shelters.addressCopied"));
      setTimeout(() => setCopyStatus(null), 3000);
    }
  };

  return (
    <Card
      as="article"
      className={`bg-[var(--color-bg-card)] border border-[var(--color-border-card)] hover:border-[var(--color-primary-bg)] transition-all p-4 sm:p-5 flex flex-col justify-between ${className}`}
    >
      <div className="space-y-3">
        {/* Header: Type Badge, Demo Tag */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-pill)] text-xs font-semibold ${
              isHospital
                ? "bg-[var(--color-risk-danger-bg)] text-[var(--color-risk-danger-text)] border border-[var(--color-risk-danger-border)]"
                : "bg-[var(--color-risk-low-bg)] text-[var(--color-risk-low-text)] border border-[var(--color-risk-low-border)]"
            }`}
          >
            <Icon name={isHospital ? "first-aid" : "tent"} size={14} />
            <span>
              {isHospital
                ? t(locale, "shelters.filter.hospital")
                : t(locale, "shelters.filter.shelter")}
            </span>
          </span>

          {facility.isDemo && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-[var(--radius-pill)] text-xs font-semibold bg-[var(--color-bg-page)] text-[var(--color-text-muted)] border border-[var(--color-border-card)]">
              {t(locale, "common.demoTag")}
            </span>
          )}
        </div>

        {/* Facility Name & Landmark */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[var(--color-text-main)] leading-snug">
            {name}
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] mt-1 flex items-start gap-1.5 leading-relaxed">
            <Icon
              name="map-pin"
              size={16}
              className="shrink-0 mt-0.5 text-[var(--color-text-muted)]"
            />
            <span>{landmark}</span>
          </p>
        </div>

        {/* Metadata: Capacity & Verified Date */}
        <div className="pt-2 border-t border-[var(--color-border-card)] flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--color-text-muted)]">
          {facility.capacity ? (
            <span className="font-medium">
              {t(locale, "shelters.capacity", { count: String(facility.capacity) })}
            </span>
          ) : (
            <span />
          )}
          <span>
            {t(locale, "shelters.lastVerified", {
              date: formatDate(facility.lastVerified, locale),
            })}
          </span>
        </div>
      </div>

      {/* Action Buttons: Call, Copy Address, Open Maps */}
      <div className="pt-4 mt-3 border-t border-[var(--color-border-card)] flex flex-wrap items-center gap-2">
        {/* 1. Phone Call Action */}
        {facility.phone && (
          <a
            href={`tel:${facility.phone.replace(/\s+/g, "")}`}
            aria-label={`${t(locale, "shelters.call")} ${name} ${facility.phone}`}
            className="inline-flex items-center justify-center min-h-[44px] px-3.5 py-2 rounded-[var(--radius-card)] bg-[var(--color-primary-bg)] text-[var(--color-primary-text)] hover:opacity-90 font-medium text-xs sm:text-sm transition-opacity gap-1.5 shadow-xs"
          >
            <Icon name="phone" size={16} />
            <span>{t(locale, "shelters.call")}</span>
          </a>
        )}

        {/* 2. Copy Address Action */}
        <button
          type="button"
          onClick={handleCopyAddress}
          aria-label={`${t(locale, "shelters.copyAddress")} ${name}`}
          className="inline-flex items-center justify-center min-h-[44px] px-3 py-2 rounded-[var(--radius-card)] bg-[var(--color-bg-card)] text-[var(--color-text-main)] border border-[var(--color-border-card)] hover:bg-[var(--color-bg-page)] font-medium text-xs sm:text-sm transition-colors cursor-pointer gap-1.5"
        >
          <Icon name="copy" size={15} />
          <span>{t(locale, "shelters.copyAddress")}</span>
        </button>

        {/* 3. Open in Maps (link only, no embedded tiles) */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${t(locale, "shelters.openMaps")} - ${name}`}
          className="inline-flex items-center justify-center min-h-[44px] px-3 py-2 rounded-[var(--radius-card)] bg-[var(--color-bg-card)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] border border-[var(--color-border-card)] hover:bg-[var(--color-bg-page)] font-medium text-xs sm:text-sm transition-colors gap-1.5 ml-auto"
        >
          <Icon name="external-link" size={14} />
          <span>{t(locale, "shelters.openMaps")}</span>
        </a>
      </div>

      {/* Status Announcement for Address Copy */}
      <div role="status" aria-live="polite" className="sr-only">
        {copyStatus}
      </div>
    </Card>
  );
}

export default ShelterCard;
