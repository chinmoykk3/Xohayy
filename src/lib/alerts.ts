import type { Alert, Hazard, RiskLevel } from "@/types";
import { getSampleAlerts } from "@/lib/data";

const RISK_RANK: Record<RiskLevel, number> = {
  severe: 4,
  high: 3,
  moderate: 2,
  low: 1,
};

/**
 * Checks whether an alert has expired relative to a reference timestamp (defaults to Date.now()).
 */
export function isAlertExpired(alert: Alert, now: Date | string = new Date()): boolean {
  const referenceTime = typeof now === "string" ? new Date(now).getTime() : now.getTime();
  const validUntilTime = new Date(alert.validUntil).getTime();
  return isNaN(validUntilTime) ? false : validUntilTime <= referenceTime;
}

export interface AlertsFilterOptions {
  districtId?: string;
  hazard?: Hazard;
  includeExpired?: boolean;
  now?: Date | string;
}

/**
 * Pure function to filter an alerts array by district, hazard, and expiry status.
 */
export function filterAlerts(alerts: Alert[], options?: AlertsFilterOptions): Alert[] {
  if (!alerts || alerts.length === 0) return [];

  const district = options?.districtId?.trim().toLowerCase();
  const hazard = options?.hazard;
  const includeExpired = Boolean(options?.includeExpired);
  const now = options?.now ?? new Date();

  return alerts.filter((alert) => {
    // District filter
    if (district && district !== "all") {
      if (alert.districtId.toLowerCase() !== district) {
        return false;
      }
    }

    // Hazard filter
    if (hazard && alert.hazard !== hazard) {
      return false;
    }

    // Expiry filter: hide expired by default
    if (!includeExpired && isAlertExpired(alert, now)) {
      return false;
    }

    return true;
  });
}

/**
 * Pure function to sort alerts by risk level descending (severe > high > moderate > low),
 * then by issuedAt descending (newest first).
 */
export function sortAlerts(alerts: Alert[]): Alert[] {
  if (!alerts || alerts.length === 0) return [];

  return [...alerts].sort((a, b) => {
    const rankA = RISK_RANK[a.risk] ?? 0;
    const rankB = RISK_RANK[b.risk] ?? 0;

    if (rankB !== rankA) {
      return rankB - rankA;
    }

    const timeA = new Date(a.issuedAt).getTime();
    const timeB = new Date(b.issuedAt).getTime();

    return timeB - timeA;
  });
}

/**
 * Contract for alerts data persistence.
 * Seed-JSON implementation active in Phase 10; MongoDB implementation will follow in Phase 18.
 */
export interface AlertsRepository {
  getAlerts(options?: AlertsFilterOptions): Promise<Alert[]>;
  getAlertById(id: string): Promise<Alert | null>;
}

export class SeedAlertsRepository implements AlertsRepository {
  async getAlerts(options?: AlertsFilterOptions): Promise<Alert[]> {
    const rawAlerts = getSampleAlerts();
    const filtered = filterAlerts(rawAlerts, options);
    return sortAlerts(filtered);
  }

  async getAlertById(id: string): Promise<Alert | null> {
    const rawAlerts = getSampleAlerts();
    return rawAlerts.find((a) => a.id === id) || null;
  }
}

let repositoryInstance: AlertsRepository | null = null;

export function getAlertsRepository(): AlertsRepository {
  if (!repositoryInstance) {
    repositoryInstance = new SeedAlertsRepository();
  }
  return repositoryInstance!;
}
