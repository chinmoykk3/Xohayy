"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ShelterCard } from "./ShelterCard";
import { DistrictSelect } from "@/components/alerts/DistrictSelect";
import { Icon } from "@/components/ui/Icon";
import { Card } from "@/components/ui/Card";
import { useDistrict } from "@/hooks/useDistrict";
import { filterFacilities } from "@/lib/shelters";
import { getFacilities } from "@/lib/data";
import { t } from "@/i18n/config";
import type { Facility, FacilityType, Locale } from "@/types";

export interface ShelterListProps {
  initialFacilities?: Facility[];
  locale: Locale;
  className?: string;
}

export function ShelterList({ initialFacilities, locale, className = "" }: ShelterListProps) {
  const { district, districtId, setDistrict } = useDistrict();
  const [facilities, setFacilities] = useState<Facility[]>(
    () => initialFacilities ?? getFacilities()
  );
  const [selectedType, setSelectedType] = useState<FacilityType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // If initialFacilities was not passed or client navigates, fetch from API or fallback
  useEffect(() => {
    let cancelled = false;

    async function loadFacilities() {
      try {
        const params = new URLSearchParams();
        if (districtId) params.set("districtId", districtId);
        if (selectedType !== "all") params.set("type", selectedType);

        const res = await fetch(`/api/shelters?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to load facilities");
        const data = await res.json();
        if (!cancelled && data.facilities) {
          setFacilities(data.facilities);
        }
      } catch {
        // Fallback to local bundled facilities on network failure
        if (!cancelled) {
          setFacilities(getFacilities());
        }
      }
    }

    loadFacilities();

    return () => {
      cancelled = true;
    };
  }, [districtId, selectedType]);

  // Filter facilities locally
  const filteredFacilities = useMemo(() => {
    return filterFacilities(
      facilities,
      {
        districtId: districtId || undefined,
        type: selectedType === "all" ? undefined : selectedType,
        search: debouncedSearch,
      },
      locale
    );
  }, [facilities, districtId, selectedType, debouncedSearch, locale]);

  const hasDemoData = useMemo(() => {
    return filteredFacilities.some((f) => f.isDemo);
  }, [filteredFacilities]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Demo Notice Banner */}
      {hasDemoData && (
        <div
          role="status"
          className="flex items-start gap-2.5 p-3 rounded-[var(--radius-card)] bg-[var(--color-bg-page)] text-[var(--color-text-main)] border border-[var(--color-border-card)] text-sm font-medium"
        >
          <Icon name="info" size={18} className="shrink-0 mt-0.5 text-[var(--color-text-muted)]" />
          <span>{t(locale, "shelters.demoNotice")}</span>
        </div>
      )}

      {/* 2. Controls Row: District Select, Type Filter, Search */}
      <Card className="bg-[var(--color-bg-card)] border border-[var(--color-border-card)] p-4 sm:p-5 space-y-4">
        {/* District Selector */}
        <div>
          <label
            htmlFor="district-combobox"
            className="block text-sm font-semibold text-[var(--color-text-main)] mb-1.5"
          >
            {t(locale, "alerts.filter.district")}
          </label>
          <DistrictSelect locale={locale} onSelect={(d) => setDistrict(d?.id ?? null)} />
        </div>

        {/* Type Filter Buttons and Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-2 border-t border-[var(--color-border-card)]">
          {/* Type Filter Buttons */}
          <div
            className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0"
            role="group"
            aria-label={t(locale, "shelters.filter.type")}
          >
            <button
              type="button"
              onClick={() => setSelectedType("all")}
              aria-pressed={selectedType === "all"}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-[var(--radius-pill)] text-xs sm:text-sm font-semibold transition-colors cursor-pointer border ${
                selectedType === "all"
                  ? "bg-[var(--color-primary-bg)] text-[var(--color-primary-text)] border-[var(--color-primary-bg)] shadow-xs"
                  : "bg-[var(--color-bg-page)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] border-[var(--color-border-card)]"
              }`}
            >
              {t(locale, "shelters.filter.all")}
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("shelter")}
              aria-pressed={selectedType === "shelter"}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-[var(--radius-pill)] text-xs sm:text-sm font-semibold transition-colors cursor-pointer border ${
                selectedType === "shelter"
                  ? "bg-[var(--color-primary-bg)] text-[var(--color-primary-text)] border-[var(--color-primary-bg)] shadow-xs"
                  : "bg-[var(--color-bg-page)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] border-[var(--color-border-card)]"
              }`}
            >
              {t(locale, "shelters.filter.shelter")}
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("hospital")}
              aria-pressed={selectedType === "hospital"}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-[var(--radius-pill)] text-xs sm:text-sm font-semibold transition-colors cursor-pointer border ${
                selectedType === "hospital"
                  ? "bg-[var(--color-primary-bg)] text-[var(--color-primary-text)] border-[var(--color-primary-bg)] shadow-xs"
                  : "bg-[var(--color-bg-page)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] border-[var(--color-border-card)]"
              }`}
            >
              {t(locale, "shelters.filter.hospital")}
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-text-muted)]">
              <Icon name="search" size={16} />
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(locale, "shelters.search.placeholder")}
              aria-label={t(locale, "shelters.search.placeholder")}
              className="w-full min-h-[40px] pl-9 pr-3 py-1.5 rounded-[var(--radius-card)] bg-[var(--color-bg-page)] text-[var(--color-text-main)] border border-[var(--color-border-card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
            />
          </div>
        </div>
      </Card>

      {/* 3. Facility Count Summary */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-[var(--color-text-muted)] px-1">
        <span>
          {filteredFacilities.length}{" "}
          {district ? `${district.name[locale] || district.name.en}` : ""} facilities available
        </span>
      </div>

      {/* 4. Facilities List or Calm Empty State */}
      {filteredFacilities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFacilities.map((facility) => (
            <ShelterCard key={facility.id} facility={facility} locale={locale} />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12 px-4 bg-[var(--color-bg-card)] border border-[var(--color-border-card)] space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-[var(--color-bg-page)] flex items-center justify-center text-[var(--color-text-muted)] border border-[var(--color-border-card)]">
            <Icon name="info" size={24} />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-main)]">
            {t(locale, "shelters.noResults")}
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto leading-relaxed">
            {t(locale, "home.selectDistrictPrompt")}
          </p>
        </Card>
      )}
    </div>
  );
}

export default ShelterList;
