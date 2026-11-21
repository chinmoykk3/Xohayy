import { getFacilities } from "@/lib/data";
import type { Facility, FacilityType, Locale } from "@/types";

export interface FacilitiesFilter {
  districtId?: string;
  type?: FacilityType;
  search?: string;
}

export interface FacilitiesRepository {
  find(filter?: FacilitiesFilter, locale?: Locale): Promise<Facility[]>;
  findById(id: string): Promise<Facility | null>;
}

/**
 * Pure function to filter facilities by district, type, and search query.
 */
export function filterFacilities(
  facilities: Facility[],
  filter?: FacilitiesFilter,
  locale: Locale = "en"
): Facility[] {
  if (!filter) return facilities;

  return facilities.filter((facility) => {
    // 1. District filter
    if (filter.districtId && facility.districtId !== filter.districtId) {
      return false;
    }

    // 2. Type filter
    if (filter.type && facility.type !== filter.type) {
      return false;
    }

    // 3. Search query filter (matches name or landmark across locale or english)
    if (filter.search && filter.search.trim()) {
      const q = filter.search.toLowerCase().trim();
      const localizedName = (facility.name[locale] || facility.name.en || "").toLowerCase();
      const englishName = (facility.name.en || "").toLowerCase();
      const localizedLandmark = (
        facility.landmark[locale] ||
        facility.landmark.en ||
        ""
      ).toLowerCase();
      const englishLandmark = (facility.landmark.en || "").toLowerCase();

      const matches =
        localizedName.includes(q) ||
        englishName.includes(q) ||
        localizedLandmark.includes(q) ||
        englishLandmark.includes(q);

      if (!matches) return false;
    }

    return true;
  });
}

/**
 * Seed JSON-based implementation of FacilitiesRepository.
 */
export class SeedFacilitiesRepository implements FacilitiesRepository {
  private facilities: Facility[];

  constructor(facilities?: Facility[]) {
    this.facilities = facilities ?? getFacilities();
  }

  async find(filter?: FacilitiesFilter, locale: Locale = "en"): Promise<Facility[]> {
    return filterFacilities(this.facilities, filter, locale);
  }

  async findById(id: string): Promise<Facility | null> {
    const found = this.facilities.find((f) => f.id === id);
    return found ?? null;
  }
}

let repositoryInstance: FacilitiesRepository | null = null;

export function getFacilitiesRepository(): FacilitiesRepository {
  if (!repositoryInstance) {
    repositoryInstance = new SeedFacilitiesRepository();
  }
  return repositoryInstance!;
}
