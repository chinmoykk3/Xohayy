import { z } from "zod";
import type { District, Helpline, Facility, Alert, Hazard, Locale } from "@/types";
import {
  districtSchema,
  helplineSchema,
  facilitySchema,
  alertSchema,
  localeGuideSchema,
} from "./validators";

import districtsJson from "@/data/districts.json";
import helplinesJson from "@/data/helplines.json";
import sheltersJson from "@/data/shelters.json";
import alertsSampleJson from "@/data/alerts.sample.json";

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
 * Loads and validates seeded districts data.
 */
export function getDistricts(): District[] {
  return z.array(districtSchema).parse(districtsJson) as District[];
}

/**
 * Loads and validates emergency helpline directory.
 */
export function getHelplines(): Helpline[] {
  return z.array(helplineSchema).parse(helplinesJson) as Helpline[];
}

/**
 * Loads and validates shelters and healthcare facilities.
 */
export function getFacilities(): Facility[] {
  return z.array(facilitySchema).parse(sheltersJson) as Facility[];
}

/**
 * Loads and validates sample disaster alerts.
 */
export function getSampleAlerts(): Alert[] {
  return z.array(alertSchema).parse(alertsSampleJson) as Alert[];
}

/**
 * Loads and validates localized guide by hazard and locale.
 */
export function getGuide(hazard: "flood" | "landslide", locale: Locale = "en"): LocaleGuide | null {
  const hazardGuides = guidesMap[hazard];
  if (!hazardGuides) return null;

  const raw = hazardGuides[locale] ?? hazardGuides.en;
  if (!raw) return null;

  return localeGuideSchema.parse(raw) as LocaleGuide;
}
