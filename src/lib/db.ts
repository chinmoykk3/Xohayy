import { MongoClient, type Db } from "mongodb";
import type {
  Report,
  ReportStatus,
  ReportType,
  Alert,
  Facility,
  Locale,
  Hazard,
  RiskLevel,
  FacilityType,
} from "@/types";
import { getSampleAlerts, getFacilities } from "@/lib/data";
import {
  filterAlerts,
  sortAlerts,
  type AlertsFilterOptions,
  type AlertsRepository,
} from "@/lib/alerts";
import { filterFacilities, type FacilitiesFilter, type FacilitiesRepository } from "@/lib/shelters";

/**
 * Data contracts and MongoDB / In-memory repository implementations.
 * Conforms to Sections 19, 24.1, and 24.3 of BUILD_PLAN.md:
 * - Lazy connection to MongoDB when MONGODB_URI is provided
 * - Zero-external dependency In-memory repository fallback for tests & local dev
 * - Compound indexes (status, districtId, createdAt) and TTL on pending reports
 */

export interface CreateReportInput {
  districtId: string;
  type: ReportType;
  note: string;
  place?: string;
  status: ReportStatus;
  createdAt: string;
  clientHash: string;
}

export interface ReportsFilter {
  districtId?: string;
  status?: ReportStatus;
  limit?: number;
}

export interface ReportsRepository {
  create(input: CreateReportInput): Promise<Report>;
  find(filter?: ReportsFilter): Promise<Report[]>;
  findById(id: string): Promise<Report | null>;
  updateStatus(id: string, status: ReportStatus): Promise<Report | null>;
  clear?(): Promise<void>;
}

interface MongoReportDoc {
  id: string;
  districtId: string;
  type: ReportType;
  note: string;
  place?: string;
  status: ReportStatus;
  createdAt: string;
  createdAtDate?: Date;
  clientHash: string;
}

interface MongoAlertDoc {
  id: string;
  districtId: string;
  hazard: Hazard;
  risk: RiskLevel;
  title: Record<Locale, string>;
  message: Record<Locale, string>;
  source: string;
  isDemo: boolean;
  issuedAt: string;
  validUntil: string;
}

interface MongoFacilityDoc {
  id: string;
  districtId: string;
  type: FacilityType;
  name: Record<Locale, string>;
  landmark: Record<Locale, string>;
  phone?: string;
  capacity?: number;
  lat?: number;
  lng?: number;
  lastVerified: string;
  isDemo: boolean;
}

/**
 * In-memory Reports Repository for local dev and unit/API tests.
 */
export class MemoryReportsRepository implements ReportsRepository {
  private reports: Report[] = [];
  private counter = 0;

  async create(input: CreateReportInput): Promise<Report> {
    this.counter += 1;
    const report: Report = {
      id: `rep_${Date.now()}_${this.counter}`,
      districtId: input.districtId,
      type: input.type,
      note: input.note,
      place: input.place,
      status: input.status,
      createdAt: input.createdAt,
      clientHash: input.clientHash,
    };
    this.reports.push(report);
    return report;
  }

  async find(filter?: ReportsFilter): Promise<Report[]> {
    let result = [...this.reports];

    if (filter?.status) {
      result = result.filter((r) => r.status === filter.status);
    }
    if (filter?.districtId) {
      result = result.filter((r) => r.districtId === filter.districtId);
    }

    // Sort newest first
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (filter?.limit) {
      result = result.slice(0, filter.limit);
    }

    return result;
  }

  async findById(id: string): Promise<Report | null> {
    const found = this.reports.find((r) => r.id === id);
    return found ? { ...found } : null;
  }

  async updateStatus(id: string, status: ReportStatus): Promise<Report | null> {
    const report = this.reports.find((r) => r.id === id);
    if (!report) return null;
    report.status = status;
    return { ...report };
  }

  async clear(): Promise<void> {
    this.reports = [];
    this.counter = 0;
  }
}

/**
 * MongoDB Reports Repository with compound indexes and pending TTL.
 */
export class MongoReportsRepository implements ReportsRepository {
  private dbPromise: Promise<Db>;
  private indexesEnsured = false;

  constructor(dbPromise: Promise<Db>) {
    this.dbPromise = dbPromise;
  }

  private async ensureIndexes(): Promise<void> {
    if (this.indexesEnsured) return;
    try {
      const db = await this.dbPromise;
      const coll = db.collection<MongoReportDoc>("reports");

      // 1. Compound index for public and moderation lookups
      await coll.createIndex({ status: 1, districtId: 1, createdAt: -1 }, { background: true });

      // 2. TTL index for expiring abandoned pending reports (e.g. 7 days = 604800 seconds)
      await coll.createIndex(
        { createdAtDate: 1 },
        {
          expireAfterSeconds: 7 * 24 * 3600,
          partialFilterExpression: { status: "pending" },
          background: true,
        }
      );

      this.indexesEnsured = true;
    } catch {
      // Ignore index conflict errors in serverless environments
    }
  }

  async create(input: CreateReportInput): Promise<Report> {
    await this.ensureIndexes();
    const db = await this.dbPromise;
    const coll = db.collection<MongoReportDoc>("reports");
    const id = `rep_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const doc: MongoReportDoc = {
      id,
      districtId: input.districtId,
      type: input.type,
      note: input.note,
      place: input.place,
      status: input.status,
      createdAt: input.createdAt,
      createdAtDate: new Date(input.createdAt),
      clientHash: input.clientHash,
    };

    await coll.insertOne(doc);

    return {
      id,
      districtId: input.districtId,
      type: input.type,
      note: input.note,
      place: input.place,
      status: input.status,
      createdAt: input.createdAt,
      clientHash: input.clientHash,
    };
  }

  async find(filter?: ReportsFilter): Promise<Report[]> {
    await this.ensureIndexes();
    const db = await this.dbPromise;
    const coll = db.collection<MongoReportDoc>("reports");

    const query: Record<string, unknown> = {};
    if (filter?.status) query.status = filter.status;
    if (filter?.districtId) query.districtId = filter.districtId;

    let cursor = coll.find(query).sort({ createdAt: -1 });
    if (filter?.limit) {
      cursor = cursor.limit(filter.limit);
    }

    const docs = await cursor.toArray();
    return docs.map((doc) => ({
      id: doc.id,
      districtId: doc.districtId,
      type: doc.type,
      note: doc.note,
      place: doc.place,
      status: doc.status,
      createdAt: doc.createdAt,
      clientHash: doc.clientHash,
    }));
  }

  async findById(id: string): Promise<Report | null> {
    const db = await this.dbPromise;
    const coll = db.collection<MongoReportDoc>("reports");
    const doc = await coll.findOne({ id });
    if (!doc) return null;

    return {
      id: doc.id,
      districtId: doc.districtId,
      type: doc.type,
      note: doc.note,
      place: doc.place,
      status: doc.status,
      createdAt: doc.createdAt,
      clientHash: doc.clientHash,
    };
  }

  async updateStatus(id: string, status: ReportStatus): Promise<Report | null> {
    const db = await this.dbPromise;
    const coll = db.collection<MongoReportDoc>("reports");
    const res = await coll.findOneAndUpdate(
      { id },
      { $set: { status } },
      { returnDocument: "after" }
    );
    if (!res) return null;

    return {
      id: res.id,
      districtId: res.districtId,
      type: res.type,
      note: res.note,
      place: res.place,
      status: res.status,
      createdAt: res.createdAt,
      clientHash: res.clientHash,
    };
  }

  async clear(): Promise<void> {
    const db = await this.dbPromise;
    await db.collection("reports").deleteMany({});
  }
}

/**
 * MongoDB implementation of AlertsRepository.
 */
export class MongoAlertsRepository implements AlertsRepository {
  private dbPromise: Promise<Db>;

  constructor(dbPromise: Promise<Db>) {
    this.dbPromise = dbPromise;
  }

  async getAlerts(options?: AlertsFilterOptions): Promise<Alert[]> {
    const db = await this.dbPromise;
    const docs = await db.collection<MongoAlertDoc>("alerts").find({}).toArray();
    const rawAlerts = docs.map((d) => ({
      id: d.id,
      districtId: d.districtId,
      hazard: d.hazard,
      risk: d.risk,
      title: d.title,
      message: d.message,
      source: d.source,
      isDemo: d.isDemo,
      issuedAt: d.issuedAt,
      validUntil: d.validUntil,
    })) as Alert[];

    const filtered = filterAlerts(rawAlerts.length ? rawAlerts : getSampleAlerts(), options);
    return sortAlerts(filtered);
  }

  async getAlertById(id: string): Promise<Alert | null> {
    const db = await this.dbPromise;
    const doc = await db.collection<MongoAlertDoc>("alerts").findOne({ id });
    if (!doc) {
      const sample = getSampleAlerts();
      return sample.find((a) => a.id === id) || null;
    }
    return {
      id: doc.id,
      districtId: doc.districtId,
      hazard: doc.hazard,
      risk: doc.risk,
      title: doc.title,
      message: doc.message,
      source: doc.source,
      isDemo: doc.isDemo,
      issuedAt: doc.issuedAt,
      validUntil: doc.validUntil,
    };
  }
}

/**
 * MongoDB implementation of FacilitiesRepository.
 */
export class MongoFacilitiesRepository implements FacilitiesRepository {
  private dbPromise: Promise<Db>;

  constructor(dbPromise: Promise<Db>) {
    this.dbPromise = dbPromise;
  }

  async find(filter?: FacilitiesFilter, locale: Locale = "en"): Promise<Facility[]> {
    const db = await this.dbPromise;
    const docs = await db.collection<MongoFacilityDoc>("facilities").find({}).toArray();
    const rawFacilities = docs.map((d) => ({
      id: d.id,
      districtId: d.districtId,
      type: d.type,
      name: d.name,
      landmark: d.landmark,
      phone: d.phone,
      capacity: d.capacity,
      lat: d.lat,
      lng: d.lng,
      lastVerified: d.lastVerified,
      isDemo: d.isDemo,
    })) as Facility[];

    return filterFacilities(rawFacilities.length ? rawFacilities : getFacilities(), filter, locale);
  }

  async findById(id: string): Promise<Facility | null> {
    const db = await this.dbPromise;
    const doc = await db.collection<MongoFacilityDoc>("facilities").findOne({ id });
    if (!doc) {
      return getFacilities().find((f) => f.id === id) || null;
    }
    return {
      id: doc.id,
      districtId: doc.districtId,
      type: doc.type,
      name: doc.name,
      landmark: doc.landmark,
      phone: doc.phone,
      capacity: doc.capacity,
      lat: doc.lat,
      lng: doc.lng,
      lastVerified: doc.lastVerified,
      isDemo: doc.isDemo,
    };
  }
}

// Global connection state
let client: MongoClient | null = null;
let dbPromise: Promise<Db> | null = null;
let reportsRepoInstance: ReportsRepository | null = null;

export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (!dbPromise) {
    client = new MongoClient(uri);
    dbPromise = client.connect().then((c) => c.db("xahay"));
  }

  return dbPromise;
}

export function getReportsRepository(): ReportsRepository {
  if (!reportsRepoInstance) {
    if (process.env.MONGODB_URI) {
      reportsRepoInstance = new MongoReportsRepository(getDb());
    } else {
      reportsRepoInstance = new MemoryReportsRepository();
    }
  }
  return reportsRepoInstance;
}

export async function closeDb(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    dbPromise = null;
    reportsRepoInstance = null;
  }
}
