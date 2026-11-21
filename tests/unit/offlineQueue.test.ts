import { describe, expect, it, beforeEach, vi } from "vitest";
import "fake-indexeddb/auto";
import {
  enqueueReport,
  getQueuedReports,
  flushReportQueue,
  clearQueue,
  setupQueueAutoSync,
  MAX_QUEUE_ITEMS,
  type QueuedReport,
} from "@/lib/offlineQueue";

describe("Offline Report Queue using IndexedDB (Phase 19)", () => {
  beforeEach(async () => {
    await clearQueue();
  });

  it("enqueues a validated report and persists it with a timestamp", async () => {
    const res = await enqueueReport({
      districtId: "dhemaji",
      type: "road_blocked",
      note: "Tree fallen across NH-15 near petrol pump.",
      place: "NH-15 KM 14",
    });

    expect(res.success).toBe(true);
    expect(res.droppedOldest).toBe(false);

    const queued = await getQueuedReports();
    expect(queued).toHaveLength(1);
    expect(queued[0]?.districtId).toBe("dhemaji");
    expect(queued[0]?.type).toBe("road_blocked");
    expect(queued[0]?.note).toBe("Tree fallen across NH-15 near petrol pump.");
    expect(queued[0]?.createdAt).toBeTruthy();
  });

  it("caps the queue at 10 items and drops the oldest with a droppedOldest flag", async () => {
    // Add 10 items sequentially
    for (let i = 1; i <= MAX_QUEUE_ITEMS; i++) {
      const res = await enqueueReport({
        districtId: "dhemaji",
        type: "area_flooded",
        note: `Report number ${i}`,
      });
      expect(res.droppedOldest).toBe(false);
    }

    let queued = await getQueuedReports();
    expect(queued).toHaveLength(10);
    expect(queued[0]?.note).toBe("Report number 1");

    // Add 11th item
    const overflowRes = await enqueueReport({
      districtId: "lakhimpur",
      type: "landslide",
      note: "Report number 11 (Overflow)",
    });

    expect(overflowRes.droppedOldest).toBe(true);

    queued = await getQueuedReports();
    expect(queued).toHaveLength(10);
    // Oldest ("Report number 1") was dropped
    expect(queued.find((r) => r.note === "Report number 1")).toBeUndefined();
    // Newest is present
    expect(queued.find((r) => r.note === "Report number 11 (Overflow)")).toBeDefined();
  });

  it("flushes queued reports one at a time, deletes on success, and keeps on failure", async () => {
    await enqueueReport({ districtId: "dhemaji", type: "road_blocked", note: "Report A" });
    await enqueueReport({ districtId: "majuli", type: "need_help", note: "Report B" });
    await enqueueReport({ districtId: "cachar", type: "bridge_damaged", note: "Report C" });

    const sentItems: string[] = [];
    // Mock sender: succeeds for Report A, fails for Report B
    const mockSend = vi.fn().mockImplementation(async (report: QueuedReport) => {
      if (report.note === "Report A") {
        sentItems.push(report.note);
        return true;
      }
      return false; // Failure on Report B
    });

    const result = await flushReportQueue(mockSend);

    expect(result.sent).toBe(1);
    expect(result.failed).toBe(1);
    expect(sentItems).toEqual(["Report A"]);

    // Report A should be deleted, Report B and C kept
    const remaining = await getQueuedReports();
    expect(remaining).toHaveLength(2);
    expect(remaining[0]?.note).toBe("Report B");
    expect(remaining[1]?.note).toBe("Report C");
  });

  it("automatically triggers queue flush when the online event fires", async () => {
    await enqueueReport({ districtId: "dhemaji", type: "safe_shelter", note: "Auto-sync report" });

    const mockSend = vi.fn().mockResolvedValue(true);
    const cleanup = setupQueueAutoSync(mockSend);

    // Dispatch online event
    window.dispatchEvent(new Event("online"));

    // Allow promise tick
    await new Promise((r) => setTimeout(r, 20));

    expect(mockSend).toHaveBeenCalled();
    const remaining = await getQueuedReports();
    expect(remaining).toHaveLength(0);

    cleanup();
  });
});
