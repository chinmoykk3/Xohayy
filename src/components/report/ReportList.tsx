"use client";

import React, { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { getDistricts } from "@/lib/data";
import { formatRelativeTime } from "@/lib/time";
import { getReportTypeIcon, getReportTypeLabel } from "@/lib/reports";
import { t } from "@/i18n/config";
import type { Report, Locale } from "@/types";

export interface ReportListProps {
  reports: Report[];
  locale: Locale;
  limit?: number;
  className?: string;
}

export function ReportList({ reports, locale, limit, className = "" }: ReportListProps) {
  const districts = useMemo(() => getDistricts(), []);
  const districtMap = useMemo(() => {
    const map = new Map<string, string>();
    districts.forEach((d) => {
      map.set(d.id, d.name[locale] || d.name.en);
    });
    return map;
  }, [districts, locale]);

  const displayedReports = useMemo(() => {
    let list = reports.filter((r) => r.status === "approved");
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (limit && limit > 0) {
      list = list.slice(0, limit);
    }
    return list;
  }, [reports, limit]);

  if (displayedReports.length === 0) {
    return (
      <Card
        className={`p-6 text-center bg-[var(--color-bg-card)] border border-[var(--color-border-card)] ${className}`}
      >
        <p className="text-sm text-[var(--color-text-muted)]">
          {t(locale, "home.noReports") || "No approved community reports yet for this area."}
        </p>
      </Card>
    );
  }

  return (
    <div
      role="list"
      aria-label={t(locale, "home.recentReports") || "Recent community reports"}
      className={`space-y-3 ${className}`}
    >
      {displayedReports.map((report) => {
        const districtName = districtMap.get(report.districtId) || report.districtId;
        const iconName = getReportTypeIcon(report.type);
        const typeLabel = getReportTypeLabel(report.type, locale);
        const timeAgo = formatRelativeTime(report.createdAt, locale);

        return (
          <Card
            as="article"
            key={report.id}
            role="listitem"
            className="p-4 bg-[var(--color-bg-card)] border border-[var(--color-border-card)] hover:border-[var(--color-primary-bg)] transition-colors space-y-2.5"
          >
            {/* Header: Type Badge, District & Time */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-pill)] text-xs font-semibold bg-[var(--color-bg-page)] text-[var(--color-text-main)] border border-[var(--color-border-card)]">
                <Icon name={iconName} size={14} className="text-[var(--color-primary-bg)]" />
                <span>{typeLabel}</span>
              </span>

              <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] font-medium">
                <span>{districtName}</span>
                {timeAgo && (
                  <>
                    <span>&bull;</span>
                    <time dateTime={report.createdAt}>{timeAgo}</time>
                  </>
                )}
              </div>
            </div>

            {/* Note text */}
            <p className="text-sm text-[var(--color-text-main)] leading-relaxed font-normal">
              {report.note}
            </p>

            {/* Optional Place/Landmark */}
            {report.place && (
              <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                <Icon name="map-pin" size={13} className="shrink-0" />
                <span>{report.place}</span>
              </p>
            )}
          </Card>
        );
      })}
    </div>
  );
}

export default ReportList;
