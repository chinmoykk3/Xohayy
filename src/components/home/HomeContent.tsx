"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { DistrictSelect } from "@/components/alerts/DistrictSelect";
import { RiskBadge } from "@/components/alerts/RiskBadge";
import { ReportList } from "@/components/report/ReportList";
import { useDistrict } from "@/hooks/useDistrict";
import { getSampleReports, filterApprovedReports } from "@/lib/reports";
import { t } from "@/i18n/config";
import type { Locale } from "@/types";

interface HomeContentProps {
  locale: Locale;
}

export function HomeContent({ locale }: HomeContentProps) {
  const { district, setDistrict, riskSummary } = useDistrict();

  const approvedReports = useMemo(
    () => filterApprovedReports(getSampleReports(), { districtId: district?.id }),
    [district?.id]
  );

  return (
    <div className="space-y-6">
      {/* 1. District Selector Card */}
      <Card className="bg-[var(--color-bg-card)] border border-[var(--color-border-card)]">
        <label
          htmlFor="district-combobox"
          className="block text-sm font-semibold text-[var(--color-text-main)] mb-2"
        >
          {t(locale, "home.selectDistrict")}
        </label>
        <DistrictSelect locale={locale} onSelect={(d) => setDistrict(d?.id ?? null)} />
      </Card>

      {/* 2. Risk Summary Card */}
      <Card className="bg-[var(--color-bg-card)] border border-[var(--color-border-card)]">
        {district && riskSummary ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium text-[var(--color-text-muted)]">
                {district.name[locale] || district.name.en} &bull; {district.state}
              </span>
              <RiskBadge level={riskSummary.level} locale={locale} />
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-main)] leading-snug">
                {riskSummary.title[locale] || riskSummary.title.en}
              </h2>
              <p className="text-sm sm:text-base text-[var(--color-text-muted)] mt-1 leading-relaxed">
                {riskSummary.message[locale] || riskSummary.message.en}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border-card)]">
              <span>
                {t(locale, "alerts.lastUpdated")}: {riskSummary.lastUpdated}
              </span>
              <span>
                {riskSummary.isDemo
                  ? "Demo Data"
                  : t(locale, "alerts.source", { source: riskSummary.source })}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              {t(locale, "home.noDistrictSelected")}
            </p>
          </div>
        )}
      </Card>

      {/* 3. Primary Actions (4 Cards) */}
      <section aria-labelledby="primary-actions-heading">
        <h2 id="primary-actions-heading" className="sr-only">
          {t(locale, "home.actionsHeading")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Action 1: Emergency Numbers */}
          <Card className="flex flex-col justify-between hover:border-[var(--color-border-card-hover)] transition-colors">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-[var(--radius-card)] bg-[var(--color-risk-danger-bg)] text-[var(--color-risk-danger-text)]">
                  <Icon name="phone" size={20} />
                </span>
                <h3 className="font-semibold text-base text-[var(--color-text-main)]">
                  {t(locale, "home.cta.emergency")}
                </h3>
              </div>
              <p className="text-sm text-[var(--color-text-muted)]">
                {t(locale, "home.cta.emergencyDesc")}
              </p>
            </div>
            <div className="pt-4">
              <Link href={`/${locale}/emergency`} className="block w-full">
                <Button variant="emergency" className="w-full">
                  {t(locale, "home.cta.callEmergency")}
                </Button>
              </Link>
            </div>
          </Card>

          {/* Action 2: Safety Guides */}
          <Card className="flex flex-col justify-between hover:border-[var(--color-border-card-hover)] transition-colors">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-[var(--radius-card)] bg-[var(--color-risk-watch-bg)] text-[var(--color-risk-watch-text)]">
                  <Icon name="file-text" size={20} />
                </span>
                <h3 className="font-semibold text-base text-[var(--color-text-main)]">
                  {t(locale, "home.cta.guides")}
                </h3>
              </div>
              <p className="text-sm text-[var(--color-text-muted)]">
                {t(locale, "home.cta.guidesDesc")}
              </p>
            </div>
            <div className="pt-4">
              <Link href={`/${locale}/guides`} className="block w-full">
                <Button variant="primary" className="w-full">
                  {t(locale, "home.cta.viewGuides")}
                </Button>
              </Link>
            </div>
          </Card>

          {/* Action 3: Shelters Nearby */}
          <Card className="flex flex-col justify-between hover:border-[var(--color-border-card-hover)] transition-colors">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-[var(--radius-card)] bg-[var(--color-risk-low-bg)] text-[var(--color-risk-low-text)]">
                  <Icon name="map-pin" size={20} />
                </span>
                <h3 className="font-semibold text-base text-[var(--color-text-main)]">
                  {t(locale, "home.cta.shelters")}
                </h3>
              </div>
              <p className="text-sm text-[var(--color-text-muted)]">
                {t(locale, "home.cta.sheltersDesc")}
              </p>
            </div>
            <div className="pt-4">
              <Link href={`/${locale}/shelters`} className="block w-full">
                <Button variant="secondary" className="w-full">
                  {t(locale, "home.cta.findShelters")}
                </Button>
              </Link>
            </div>
          </Card>

          {/* Action 4: Report a Problem */}
          <Card className="flex flex-col justify-between hover:border-[var(--color-border-card-hover)] transition-colors">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-[var(--radius-card)] bg-[var(--color-risk-warning-bg)] text-[var(--color-risk-warning-text)]">
                  <Icon name="alert-triangle" size={20} />
                </span>
                <h3 className="font-semibold text-base text-[var(--color-text-main)]">
                  {t(locale, "home.cta.reports")}
                </h3>
              </div>
              <p className="text-sm text-[var(--color-text-muted)]">
                {t(locale, "home.cta.reportsDesc")}
              </p>
            </div>
            <div className="pt-4">
              <Link href={`/${locale}/report`} className="block w-full">
                <Button variant="secondary" className="w-full">
                  {t(locale, "home.cta.submitReport")}
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* 4. Latest Approved Reports (Phase 19 integration) */}
      <section aria-labelledby="community-reports-heading" className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2
              id="community-reports-heading"
              className="text-lg font-bold text-[var(--color-text-main)]"
            >
              {t(locale, "home.recentReports")}
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--color-bg-page)] text-[var(--color-text-muted)] border border-[var(--color-border-card)]">
              Verified
            </span>
          </div>
          <Link
            href={`/${locale}/report`}
            className="text-xs font-semibold text-[var(--color-primary-bg)] hover:underline inline-flex items-center gap-1"
          >
            <span>{t(locale, "home.cta.report")}</span>
            <Icon name="arrow-right" size={12} />
          </Link>
        </div>

        <ReportList reports={approvedReports} locale={locale} limit={3} />
      </section>
    </div>
  );
}
