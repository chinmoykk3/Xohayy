export type Locale = "en" | "as" | "hi";

export type Hazard = "flood" | "landslide" | "storm" | "earthquake" | "general";

export type RiskLevel = "low" | "moderate" | "high" | "severe";

export type NorthEastState =
  | "Assam"
  | "Arunachal Pradesh"
  | "Meghalaya"
  | "Manipur"
  | "Mizoram"
  | "Nagaland"
  | "Tripura"
  | "Sikkim";

export interface District {
  id: string; // slug, for example 'dhemaji'
  name: Record<Locale, string>;
  state: NorthEastState;
  controlRoom: string; // district emergency operations centre number
  lat?: number;
  lng?: number;
}

export interface Alert {
  id: string;
  districtId: string;
  hazard: Hazard;
  risk: RiskLevel;
  title: Record<Locale, string>;
  message: Record<Locale, string>;
  source: string; // for example 'ASDMA advisory' or 'Demo data'
  isDemo: boolean;
  issuedAt: string; // ISO 8601
  validUntil: string; // ISO 8601
}

export interface Helpline {
  id: string;
  label: Record<Locale, string>;
  number: string; // digits only, used in tel: links
  scope: "national" | "state" | "district";
  districtId?: string;
  available: string; // for example '24x7'
  source: string;
  verifiedOn: string;
}

export type FacilityType = "shelter" | "hospital" | "police" | "fire";

export interface Facility {
  id: string;
  districtId: string;
  type: FacilityType;
  name: Record<Locale, string>;
  landmark: Record<Locale, string>;
  phone?: string;
  capacity?: number;
  lat?: number;
  lng?: number;
  lastVerified: string; // ISO date
  isDemo: boolean;
}

export interface GuideStep {
  id: string;
  phase: "before" | "during" | "after";
  icon: string; // name of an inline SVG icon
  text: Record<Locale, string>;
}

export interface Guide {
  hazard: Hazard;
  title: Record<Locale, string>;
  steps: GuideStep[];
}

export type ReportType =
  "road_blocked" | "area_flooded" | "landslide" | "bridge_damaged" | "need_help" | "safe_shelter";

export type ReportStatus = "pending" | "approved" | "rejected";

export interface Report {
  id: string;
  districtId: string;
  type: ReportType;
  note: string; // sanitised, max 200 characters
  place?: string; // optional road or village name, max 80 characters
  status: ReportStatus;
  createdAt: string;
  clientHash: string; // salted hash used only for rate limiting, never stored raw
}

export interface Preferences {
  locale: Locale;
  districtId?: string;
  textScale: 1 | 1.25 | 1.5;
  highContrast: boolean;
  reducedMotion: boolean;
  readGuides: string[]; // ids of guide steps marked as read
  kitChecked: string[]; // ids of checklist items ticked
}

export type ApiErrorCode =
  "VALIDATION_ERROR" | "RATE_LIMITED" | "NOT_FOUND" | "SERVER_ERROR" | "UNAUTHORIZED";

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}
