import type { Report, ReportType, Locale } from "@/types";
import sampleReportsJson from "@/data/reports.sample.json";
import { t } from "@/i18n/config";

/**
 * Loads sample community reports.
 */
export function getSampleReports(): Report[] {
  return sampleReportsJson as Report[];
}

export interface ReportsFilter {
  districtId?: string;
  type?: ReportType;
  limit?: number;
}

/**
 * Filters approved reports by district, type, and limits count.
 * Sorts newest reports first.
 */
export function filterApprovedReports(reports: Report[], filter?: ReportsFilter): Report[] {
  let result = reports.filter((r) => r.status === "approved");

  if (filter?.districtId) {
    result = result.filter((r) => r.districtId === filter.districtId);
  }

  if (filter?.type) {
    result = result.filter((r) => r.type === filter.type);
  }

  // Sort newest first
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (filter?.limit && filter.limit > 0) {
    result = result.slice(0, filter.limit);
  }

  return result;
}

/**
 * Maps report type to corresponding IconName.
 */
export function getReportTypeIcon(
  type: ReportType
): "alert-triangle" | "droplets" | "warning" | "shield" | "first-aid" {
  switch (type) {
    case "road_blocked":
      return "warning";
    case "area_flooded":
      return "droplets";
    case "landslide":
      return "alert-triangle";
    case "bridge_damaged":
      return "warning";
    case "need_help":
      return "first-aid";
    case "safe_shelter":
      return "shield";
    default:
      return "alert-triangle";
  }
}

/**
 * Returns localized label for report type.
 */
export function getReportTypeLabel(type: ReportType, locale: Locale): string {
  const key = `report.type.${type}`;
  return t(locale, key);
}
