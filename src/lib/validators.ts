import { z } from "zod";

/**
 * Sanitizes input text by:
 * 1. Stripping non-printable control characters
 * 2. Trimming leading and trailing whitespace
 * 3. Collapsing repeated internal whitespace to a single space
 */
export function cleanText(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

export const cleanTextSchema = (min = 1, max = 500) =>
  z.string().transform(cleanText).pipe(z.string().min(min).max(max));

// Locales & Hazards
export const localeSchema = z.enum(["en", "as", "hi"]);

export const hazardSchema = z.enum(["flood", "landslide", "storm", "earthquake", "general"]);

export const riskLevelSchema = z.enum(["low", "moderate", "high", "severe"]);

export const northEastStateSchema = z.enum([
  "Assam",
  "Arunachal Pradesh",
  "Meghalaya",
  "Manipur",
  "Mizoram",
  "Nagaland",
  "Tripura",
  "Sikkim",
]);

export const localizedStringSchema = z.object({
  en: cleanTextSchema(1, 1000),
  as: cleanTextSchema(1, 1000),
  hi: cleanTextSchema(1, 1000),
});

// District
export const districtSchema = z.object({
  id: cleanTextSchema(1, 64),
  name: localizedStringSchema,
  state: northEastStateSchema,
  controlRoom: cleanTextSchema(3, 30),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

// Alert
export const alertSchema = z.object({
  id: cleanTextSchema(1, 64),
  districtId: cleanTextSchema(1, 64),
  hazard: hazardSchema,
  risk: riskLevelSchema,
  title: localizedStringSchema,
  message: localizedStringSchema,
  source: cleanTextSchema(1, 120),
  isDemo: z.boolean(),
  issuedAt: z.string().datetime(),
  validUntil: z.string().datetime(),
});

// Helpline
export const helplineSchema = z.object({
  id: cleanTextSchema(1, 64),
  label: localizedStringSchema,
  number: z
    .string()
    .transform(cleanText)
    .pipe(z.string().regex(/^\+?[0-9\s-]{3,20}$/, "Invalid phone number format")),
  scope: z.enum(["national", "state", "district"]),
  districtId: cleanTextSchema(1, 64).optional(),
  available: cleanTextSchema(1, 50),
  source: cleanTextSchema(1, 120),
  verifiedOn: cleanTextSchema(1, 30),
});

// Facility
export const facilityTypeSchema = z.enum(["shelter", "hospital", "police", "fire"]);

export const facilitySchema = z.object({
  id: cleanTextSchema(1, 64),
  districtId: cleanTextSchema(1, 64),
  type: facilityTypeSchema,
  name: localizedStringSchema,
  landmark: localizedStringSchema,
  phone: cleanTextSchema(3, 30).optional(),
  capacity: z.number().int().nonnegative().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  lastVerified: cleanTextSchema(1, 30),
  isDemo: z.boolean(),
});

// Guide Step
export const guideStepSchema = z.object({
  id: cleanTextSchema(1, 64),
  phase: z.enum(["before", "during", "after"]),
  icon: cleanTextSchema(1, 50),
  text: localizedStringSchema,
});

export const guideSchema = z.object({
  hazard: hazardSchema,
  title: localizedStringSchema,
  steps: z.array(guideStepSchema),
});

export const localeGuideStepSchema = z.object({
  id: cleanTextSchema(1, 64),
  phase: z.enum(["before", "during", "after"]),
  icon: cleanTextSchema(1, 50),
  text: cleanTextSchema(1, 200),
});

export const localeGuideSchema = z.object({
  hazard: hazardSchema,
  title: cleanTextSchema(1, 200),
  steps: z.array(localeGuideStepSchema),
});

// Kit Item
export const kitItemSchema = z.object({
  id: cleanTextSchema(1, 64),
  name: localizedStringSchema,
  description: localizedStringSchema.optional(),
  category: cleanTextSchema(1, 64).optional(),
  icon: cleanTextSchema(1, 64).optional(),
});

// Report
export const reportTypeSchema = z.enum([
  "road_blocked",
  "area_flooded",
  "landslide",
  "bridge_damaged",
  "need_help",
  "safe_shelter",
]);

export const reportStatusSchema = z.enum(["pending", "approved", "rejected"]);

export const reportSchema = z.object({
  id: cleanTextSchema(1, 64),
  districtId: cleanTextSchema(1, 64),
  type: reportTypeSchema,
  note: cleanTextSchema(1, 200),
  place: cleanTextSchema(1, 80).optional(),
  status: reportStatusSchema,
  createdAt: z.string().datetime(),
  clientHash: cleanTextSchema(8, 128),
});

// User Preferences
export const preferencesSchema = z.object({
  locale: localeSchema,
  districtId: cleanTextSchema(1, 64).optional(),
  textScale: z.union([z.literal(1), z.literal(1.25), z.literal(1.5)]),
  highContrast: z.boolean(),
  reducedMotion: z.boolean(),
  readGuides: z.array(z.string()),
  kitChecked: z.array(z.string()),
});

// Query Parameters Schemas
export const alertsQuerySchema = z.object({
  districtId: z.string().transform(cleanText).optional(),
  hazard: hazardSchema.optional(),
  includeExpired: z
    .enum(["true", "false", "1", "0"])
    .optional()
    .transform((val) => val === "true" || val === "1"),
});

export const sheltersQuerySchema = z.object({
  districtId: z.string().transform(cleanText).optional(),
  type: facilityTypeSchema.optional(),
});

export const reportsQuerySchema = z.object({
  districtId: z.string().transform(cleanText).optional(),
});

// District allow-list for Assam basins
export const SEEDED_DISTRICT_IDS = [
  "dhemaji",
  "lakhimpur",
  "majuli",
  "dibrugarh",
  "barpeta",
  "morigaon",
  "kamrup-metropolitan",
  "cachar",
  "jorhat",
  "golaghat",
] as const;

export type SeededDistrictId = (typeof SEEDED_DISTRICT_IDS)[number];

/**
 * Checks for Indian phone number patterns (10-digit mobile, STD landlines, +91 prefixes)
 * to reject personal numbers from public crowd reports.
 */
export function hasPhoneNumber(text: string): boolean {
  if (!text || typeof text !== "string") return false;
  // Matches 10-digit mobile numbers with/without +91, with spaces or hyphens, or landline formats
  const phonePattern =
    /(?:(?:\+|0{0,2})91[\s-]*)?(?:[6-9]\d{9}\b|[6-9]\d{4}[\s-]\d{5}\b|\b\d{3,5}[-\s]\d{5,8}\b|\b\d{10,12}\b)/;
  return phonePattern.test(text);
}

/**
 * Checks for email address patterns to protect reporter privacy.
 */
export function hasEmailAddress(text: string): boolean {
  if (!text || typeof text !== "string") return false;
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
  return emailPattern.test(text);
}

export const createReportSchema = z.object({
  districtId: z.enum(SEEDED_DISTRICT_IDS, {
    error: "Unknown or invalid district ID",
  }),
  type: reportTypeSchema,
  note: z
    .string({ error: "Note must be a string" })
    .transform(cleanText)
    .pipe(
      z
        .string()
        .min(1, "Note is required and cannot be empty")
        .max(200, "Note must be at most 200 characters")
        .refine(
          (val) => !hasPhoneNumber(val),
          "For privacy reasons, please do not include phone numbers in reports."
        )
        .refine(
          (val) => !hasEmailAddress(val),
          "For privacy reasons, please do not include email addresses in reports."
        )
    ),
  place: z
    .string({ error: "Place must be a string" })
    .transform(cleanText)
    .pipe(z.string().max(80, "Place must be at most 80 characters"))
    .optional(),
  honeypot: z.string().optional(),
});
