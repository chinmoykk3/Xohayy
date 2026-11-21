import type { District, Helpline, Facility, Alert, Hazard, Locale, KitItem } from "@/types";

import districtsJson from "@/data/districts.json";
import helplinesJson from "@/data/helplines.json";
import sheltersJson from "@/data/shelters.json";
import alertsSampleJson from "@/data/alerts.sample.json";
import kitJson from "@/data/kit.json";

import floodGuideEn from "@/data/guides/flood.en.json";
import floodGuideAs from "@/data/guides/flood.as.json";
import floodGuideHi from "@/data/guides/flood.hi.json";

import landslideGuideEn from "@/data/guides/landslide.en.json";
import landslideGuideAs from "@/data/guides/landslide.as.json";
import landslideGuideHi from "@/data/guides/landslide.hi.json";

export interface LocaleGuide {
  hazard: Hazard;
  title: string;
  steps: {
    id: string;
    phase: "before" | "during" | "after";
    icon: string;
    text: string;
  }[];
}

const guidesMap: Record<"flood" | "landslide", Record<Locale, unknown>> = {
  flood: {
    en: floodGuideEn,
    as: floodGuideAs,
    hi: floodGuideHi,
  },
  landslide: {
    en: landslideGuideEn,
    as: landslideGuideAs,
    hi: landslideGuideHi,
  },
};

/**
 * Loads seeded districts data.
 */
export function getDistricts(): District[] {
  return districtsJson as District[];
}

/**
 * Loads emergency helpline directory.
 */
export function getHelplines(): Helpline[] {
  return helplinesJson as Helpline[];
}

/**
 * Loads shelters and healthcare facilities.
 */
export function getFacilities(): Facility[] {
  return sheltersJson as Facility[];
}

/**
 * Loads sample disaster alerts.
 */
export function getSampleAlerts(): Alert[] {
  return alertsSampleJson as Alert[];
}

/**
 * Loads localized guide by hazard and locale.
 */
export function getGuide(hazard: "flood" | "landslide", locale: Locale = "en"): LocaleGuide | null {
  const hazardGuides = guidesMap[hazard];
  if (!hazardGuides) return null;

  const raw = hazardGuides[locale] ?? hazardGuides.en;
  if (!raw) return null;

  return raw as LocaleGuide;
}

/**
 * Loads emergency kit checklist items.
 */
export function getKitItems(): KitItem[] {
  return kitJson as KitItem[];
}
