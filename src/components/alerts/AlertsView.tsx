"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { DistrictSelect } from "@/components/alerts/DistrictSelect";
import { AlertCard } from "@/components/alerts/AlertCard";
import { useDistrict } from "@/hooks/useDistrict";
import { getSampleAlerts } from "@/lib/data";
import { filterAlerts, sortAlerts } from "@/lib/alerts";
import { fetcher } from "@/lib/fetcher";
import { DEFAULT_LOCALE, t } from "@/i18n/config";
import type { Alert, Hazard, Locale } from "@/types";

interface AlertsViewProps {
  locale?: Locale;
}

const HAZARD_OPTIONS: { value: Hazard | "all"; labelKey?: string; defaultLabel: string }[] = [
  { value: "all", defaultLabel: "All Hazards" },
  { value: "flood", defaultLabel: "Flood" },
  { value: "landslide", defaultLabel: "Landslide" },
  { value: "storm", defaultLabel: "Storm" },
  { value: "earthquake", defaultLabel: "Earthquake" },
  { value: "general", defaultLabel: "General" },
];

export function AlertsView({ locale = DEFAULT_LOCALE }: AlertsViewProps) {
  const searchParams = useSearchParams();
  const queryDistrict = searchParams.get("districtId");

  const { district, setDistrict } = useDistrict();

  const [selectedHazard, setSelectedHazard] = useState<Hazard | "all">("all");
  const [includeExpired, setIncludeExpired] = useState(false);

  // Sync with URL query parameter if present
  useEffect(() => {
    if (queryDistrict && queryDistrict !== district?.id) {
      setDistrict(queryDistrict);
    }
  }, [queryDistrict, district?.id, setDistrict]);

  const [rawAlerts, setRawAlerts] = useState<Alert[]>(() => getSampleAlerts());

  const loadAlerts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (district?.id) params.set("districtId", district.id);
      if (selectedHazard !== "all") params.set("hazard", selectedHazard);
      if (includeExpired) params.set("includeExpired", "true");

      const queryStr = params.toString();
      const url = queryStr ? `/api/alerts?${queryStr}` : "/api/alerts";

      const data = await fetcher<{ alerts: Alert[]; fetchedAt: string }>(url, {
        timeout: 6000,
        locale,
      });

      if (data?.alerts) {
        setRawAlerts(data.alerts);
      }
    } catch {
      // Fetcher already falls back to cache; on total cold start without network, sample alerts remain
    }
  }, [district?.id, selectedHazard, includeExpired, locale]);

  // Fetch when filters change
  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  // Task 5: Avoid aggressive polling: refresh alerts on page focus and on a long interval only (5 minutes = 300,000ms)
  useEffect(() => {
    const handleFocus = () => {
      loadAlerts();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadAlerts();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Refresh only on a long interval (5 mins), not short polling
    const LONG_INTERVAL_MS = 5 * 60 * 1000;
    const intervalId = setInterval(() => {
      loadAlerts();
    }, LONG_INTERVAL_MS);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [loadAlerts]);

  // Filter and sort alerts
  const visibleAlerts = useMemo(() => {
    const filtered = filterAlerts(rawAlerts, {
      districtId: district?.id,
      hazard: selectedHazard === "all" ? undefined : selectedHazard,
      includeExpired,
    });
    return sortAlerts(filtered);
  }, [rawAlerts, district?.id, selectedHazard, includeExpired]);

  // Determine if any visible alert is demo data
  const hasDemoAlerts = useMemo(() => visibleAlerts.some((a) => a.isDemo), [visibleAlerts]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="space-y-1 pb-2">
        <h1
          tabIndex={-1}
          className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-main)] tracking-tight outline-none"
        >
          {t(locale, "alerts.title")}
        </h1>
        <p className="text-base text-[var(--color-text-muted)] leading-relaxed max-w-2xl">
          {t(locale, "alerts.subtitle")}
        </p>
      </header>

      {/* Filter Controls Card */}
      <Card className="bg-[var(--color-bg-card)] border border-[var(--color-border-card)] space-y-4">
        {/* District Select */}
        <DistrictSelect locale={locale} />

        {/* Hazard filter and Expired toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-[var(--color-border-card)]">
          {/* Hazard Filter Buttons */}
          <div className="w-full sm:w-auto">
            <label
              htmlFor="hazard-filter"
              className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5"
            >
              {t(locale, "alerts.filter.hazard")}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {HAZARD_OPTIONS.map((opt) => {
                const isActive = selectedHazard === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedHazard(opt.value)}
                    aria-pressed={isActive}
                    className={`min-h-[40px] px-3 py-1.5 rounded-[var(--radius-pill)] text-xs font-semibold border transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] ${
                      isActive
                        ? "bg-[var(--color-primary-bg)] text-[var(--color-primary-text)] border-[var(--color-primary-bg)] shadow-2xs"
                        : "bg-[var(--color-bg-card)] text-[var(--color-text-main)] border-[var(--color-border-card)] hover:bg-[var(--color-bg-page)]"
                    }`}
                  >
                    {opt.value === "all" ? t(locale, "common.all") : opt.defaultLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Show Expired Alerts Toggle */}
          <div className="flex items-center gap-2 self-start sm:self-end pt-1">
            <input
              id="show-expired-toggle"
              type="checkbox"
              checked={includeExpired}
              onChange={(e) => setIncludeExpired(e.target.checked)}
              className="w-4 h-4 rounded text-[var(--color-primary-bg)] border-[var(--color-border-card)] focus:ring-[var(--color-focus-ring)] cursor-pointer"
            />
            <label
              htmlFor="show-expired-toggle"
              className="text-xs font-semibold text-[var(--color-text-main)] cursor-pointer select-none"
            >
              {t(locale, "alerts.filter.showExpired")}
            </label>
          </div>
        </div>
      </Card>

      {/* Demo Notice Banner whenever any visible alert is demo data */}
      {hasDemoAlerts && (
        <div
          role="note"
          aria-label="Demo data advisory notice"
          className="p-3.5 rounded-[var(--radius-card)] bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-2.5 leading-relaxed"
        >
          <span className="shrink-0 mt-0.5 text-amber-700" aria-hidden="true">
            <Icon name="info" size={18} />
          </span>
          <div>
            <span className="font-bold mr-1">[{t(locale, "common.demoTag")}]</span>
            <span>{t(locale, "alerts.demoNotice")}</span>
          </div>
        </div>
      )}

      {/* Alerts Feed List or Calm Empty State */}
      <section aria-labelledby="alerts-feed-heading" className="space-y-4">
        <h2 id="alerts-feed-heading" className="sr-only">
          {t(locale, "alerts.title")}
        </h2>

        {visibleAlerts.length > 0 ? (
          visibleAlerts.map((alert) => <AlertCard key={alert.id} alert={alert} locale={locale} />)
        ) : (
          /* Calm Empty State Linking to Safety Guides */
          <Card
            as="article"
            className="bg-[var(--color-bg-card)] border border-[var(--color-border-card)] p-8 text-center space-y-4"
          >
            <div className="flex flex-col items-center max-w-md mx-auto space-y-2">
              <span
                className="p-3 rounded-full bg-[var(--color-risk-low-bg)] text-[var(--color-risk-low-text)] border border-[var(--color-risk-low-border)]"
                aria-hidden="true"
              >
                <Icon name="check" size={28} />
              </span>
              <h3 className="text-lg font-bold text-[var(--color-text-main)]">
                {t(locale, "alerts.noAlerts")}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                {district
                  ? `River gauges and weather stations in ${district.name[locale] || district.name.en} report normal conditions.`
                  : "No severe weather advisories or river inundation warnings matching your selected criteria."}
              </p>
            </div>

            <div className="pt-2">
              <Link href={`/${locale}/guides`}>
                <Button variant="secondary" className="gap-2">
                  <Icon name="shield" size={18} />
                  <span>{t(locale, "alerts.viewGuides")}</span>
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}
