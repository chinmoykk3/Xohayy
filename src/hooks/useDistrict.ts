"use client";

import { useMemo, useCallback } from "react";
import { usePreferences } from "@/hooks/usePreferences";
import { getDistricts, getSampleAlerts } from "@/lib/data";
import type { District, RiskLevel, Locale } from "@/types";

export interface DistrictRiskSummary {
  level: RiskLevel;
  title: Record<Locale, string>;
  message: Record<Locale, string>;
  lastUpdated: string;
  source: string;
  isDemo: boolean;
  activeAlertCount: number;
}

export function useDistrict() {
  const { preferences, setDistrict: setPrefDistrict } = usePreferences();
  const districts = useMemo(() => getDistricts(), []);
  const sampleAlerts = useMemo(() => getSampleAlerts(), []);

  const selectedDistrict = useMemo<District | null>(() => {
    if (!preferences.districtId) return null;
    return districts.find((d) => d.id === preferences.districtId) || null;
  }, [districts, preferences.districtId]);

  const setDistrict = useCallback(
    (id: string | null) => {
      setPrefDistrict(id ?? undefined);
    },
    [setPrefDistrict]
  );

  const clearDistrict = useCallback(() => {
    setPrefDistrict(undefined);
  }, [setPrefDistrict]);

  // Compute highest risk and summary for selected district
  const riskSummary = useMemo<DistrictRiskSummary | null>(() => {
    if (!selectedDistrict) return null;

    const districtAlerts = sampleAlerts.filter((a) => a.districtId === selectedDistrict.id);

    const riskRank: Record<RiskLevel, number> = {
      severe: 4,
      high: 3,
      moderate: 2,
      low: 1,
    };

    if (districtAlerts.length > 0) {
      const sorted = [...districtAlerts].sort(
        (a, b) => (riskRank[b.risk] ?? 0) - (riskRank[a.risk] ?? 0)
      );
      const top = sorted[0]!;

      return {
        level: top.risk,
        title: top.title,
        message: top.message,
        lastUpdated: top.issuedAt,
        source: top.source,
        isDemo: top.isDemo,
        activeAlertCount: districtAlerts.length,
      };
    }

    // Default safe / normal conditions
    return {
      level: "low",
      title: {
        en: "Normal River & Weather Conditions",
        as: "স্বাভাৱিক নদী আৰু বতৰৰ অৱস্থা",
        hi: "सामान्य नदी और मौसम की स्थिति",
      },
      message: {
        en: "No active flood or landslide warnings in effect for this district.",
        as: "এই জিলাত কোনো সক্ৰিয় বান বা ভূমিস্খলনৰ সতৰ্কতা নাই।",
        hi: "इस जिले के लिए कोई सक्रिय बाढ़ या भूस्खलन की चेतावनी नहीं है।",
      },
      lastUpdated: new Date().toISOString(),
      source: "Central Water Commission / ASDMA",
      isDemo: true,
      activeAlertCount: 0,
    };
  }, [selectedDistrict, sampleAlerts]);

  return {
    district: selectedDistrict,
    districtId: preferences.districtId ?? null,
    setDistrict,
    clearDistrict,
    districts,
    riskSummary,
  };
}
