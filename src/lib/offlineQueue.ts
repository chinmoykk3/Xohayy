import type { ReportType } from "@/types";

export interface QueuedReportInput {
  districtId: string;
  type: ReportType;
  note: string;
  place?: string;
  honeypot?: string;
}

export interface QueuedReport extends QueuedReportInput {
  id?: number;
  createdAt: string;
}

export const MAX_QUEUE_ITEMS = 10;
const DB_NAME = "xahay_offline_db";
const STORE_NAME = "reports_queue";
const DB_VERSION = 1;

/**
 * Opens or initializes the IndexedDB database.
 */
export function openQueueDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB is not available in this environment"));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Stores a report payload in IndexedDB.
 * Caps at MAX_QUEUE_ITEMS (10 items), dropping the oldest item if exceeded.
 */
export async function enqueueReport(
  payload: QueuedReportInput
): Promise<{ success: boolean; droppedOldest: boolean }> {
  const db = await openQueueDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const getAllReq = store.getAll();

    getAllReq.onsuccess = () => {
      const items: QueuedReport[] = getAllReq.result || [];
      let droppedOldest = false;

      // Cap at MAX_QUEUE_ITEMS (10 items): if count >= 10, drop the oldest items
      if (items.length >= MAX_QUEUE_ITEMS) {
        // Sort items by id or createdAt to identify oldest
        items.sort((a, b) => {
          const aTime = new Date(a.createdAt).getTime();
          const bTime = new Date(b.createdAt).getTime();
          return aTime - bTime;
        });

        const numToDrop = items.length - MAX_QUEUE_ITEMS + 1;
        for (let i = 0; i < numToDrop; i++) {
          const itemToDrop = items[i];
          if (itemToDrop && typeof itemToDrop.id === "number") {
            store.delete(itemToDrop.id);
            droppedOldest = true;
          }
        }
      }

      const newItem: QueuedReport = {
        ...payload,
        createdAt: new Date().toISOString(),
      };

      const addReq = store.add(newItem);
      addReq.onsuccess = () => resolve({ success: true, droppedOldest });
      addReq.onerror = () => reject(addReq.error);
    };

    getAllReq.onerror = () => reject(getAllReq.error);
  });
}

/**
 * Retrieves all currently queued reports.
 */
export async function getQueuedReports(): Promise<QueuedReport[]> {
  const db = await openQueueDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const results: QueuedReport[] = request.result || [];
      results.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Removes a specific report from the queue by ID.
 */
export async function removeQueuedReport(id: number): Promise<void> {
  const db = await openQueueDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clears all reports in the queue.
 */
export async function clearQueue(): Promise<void> {
  const db = await openQueueDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Default network dispatcher for sending a queued report to /api/reports.
 */
export async function defaultSendReport(report: QueuedReport): Promise<boolean> {
  try {
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        districtId: report.districtId,
        type: report.type,
        note: report.note,
        place: report.place,
        honeypot: report.honeypot || "",
      }),
    });
    return res.ok || res.status === 201;
  } catch {
    return false;
  }
}

/**
 * On network recovery, sends queued reports ONE AT A TIME.
 * Deletes each on success, keeps on failure.
 */
export async function flushReportQueue(
  sendFn: (report: QueuedReport) => Promise<boolean> = defaultSendReport
): Promise<{ sent: number; failed: number }> {
  try {
    const reports = await getQueuedReports();
    let sent = 0;
    let failed = 0;

    for (const report of reports) {
      const ok = await sendFn(report);
      if (ok) {
        if (typeof report.id === "number") {
          await removeQueuedReport(report.id);
        }
        sent++;
      } else {
        // Keep on failure and halt subsequent attempts to preserve ordering
        failed++;
        break;
      }
    }

    return { sent, failed };
  } catch {
    return { sent: 0, failed: 0 };
  }
}

/**
 * Initializes automatic online event listener to flush queue when network returns.
 */
export function setupQueueAutoSync(
  sendFn?: (report: QueuedReport) => Promise<boolean>
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleOnline = () => {
    flushReportQueue(sendFn).catch(() => {});
  };

  window.addEventListener("online", handleOnline);

  return () => {
    window.removeEventListener("online", handleOnline);
  };
}
