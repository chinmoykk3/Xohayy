import { z } from "zod";
import type { District, Helpline, Facility, Alert, Hazard } from "@/types";
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
import landslideGuideEn from "@/data/guides/landslide.en.json";

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
 * Loads and validates localized guide by hazard.
 */
export function getGuide(hazard: "flood" | "landslide", locale: "en" = "en"): LocaleGuide | null {
  if (locale !== "en") return null;

  const raw = hazard === "flood" ? floodGuideEn : hazard === "landslide" ? landslideGuideEn : null;
  if (!raw) return null;

  return localeGuideSchema.parse(raw) as LocaleGuide;
}
