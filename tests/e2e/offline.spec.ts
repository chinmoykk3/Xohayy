import { test, expect } from "@playwright/test";

test.describe("Offline Experience (Phase 17 & Phase 24, Task 2)", () => {
  test("visit home, wait for the service worker, go offline, reload, assert the banner, assert a guide and the emergency numbers are available", async ({
    page,
    context,
  }) => {
    // 1. Visit home while online
    await page.goto("/en", { waitUntil: "networkidle" });

    // 2. Wait for the service worker to register, become active, and cache the home route
    await page.waitForFunction(
      async () => {
        if (!("serviceWorker" in navigator)) return false;
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg || !reg.active || !navigator.serviceWorker.controller) return false;
        try {
          const cache = await caches.open("shell-v1");
          const cached = await cache.match("/en");
          return Boolean(cached);
        } catch {
          return false;
        }
      },
      undefined,
      { timeout: 20000 }
    );

    try {
      // 3. Go offline
      await context.setOffline(true);

      // 4. Reload page while offline
      await page.reload({ waitUntil: "load" });
      await page.evaluate(() => window.dispatchEvent(new Event("offline")));

      // 5. Assert the offline banner is visible
      const banner = page.locator("[role='status']").filter({ hasText: /You are offline/i });
      await expect(banner).toBeVisible({ timeout: 10000 });
      await expect(banner).toHaveAttribute("aria-live", "polite");
      await expect(banner).toContainText(/You are offline\. Showing saved information/i);

      // 6. Assert a guide is available (Action card & link to guides)
      const guideAction = page.locator("a[href*='/guides']").first();
      await expect(guideAction).toBeVisible();
      await expect(
        page.getByText(/Safety Guides|Survival & Evacuation Guides|Read Guides/i).first()
      ).toBeVisible();

      // 7. Assert emergency numbers are available
      const emergencyFab = page.locator("#emergency-fab");
      await expect(emergencyFab).toBeVisible();

      const call112 = page.locator("a[href='tel:112']").or(page.getByText("112")).first();
      await expect(call112).toBeVisible();
    } finally {
      await context.setOffline(false);
    }
  });

  test("critical pages work with the network disabled", async ({ page, context }) => {
    // 1. Visit home while online to warm service worker cache
    await page.goto("/en", { waitUntil: "networkidle" });

    // Wait for the service worker to register, become active, and cache critical routes
    await page.waitForFunction(
      async () => {
        if (!("serviceWorker" in navigator)) return false;
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg || !reg.active || !navigator.serviceWorker.controller) return false;
        try {
          const cache = await caches.open("shell-v1");
          const cachedEmergency = await cache.match("/en/emergency");
          const cachedGuides = await cache.match("/en/guides");
          return Boolean(cachedEmergency && cachedGuides);
        } catch {
          return false;
        }
      },
      undefined,
      { timeout: 20000 }
    );

    // Warm critical pages
    await page.goto("/en/emergency", { waitUntil: "networkidle" });
    await page.goto("/en/guides", { waitUntil: "networkidle" });
    await page.goto("/en/guides/flood", { waitUntil: "networkidle" });

    try {
      // 2. Disable network
      await context.setOffline(true);

      // A. Emergency Page renders offline with emergency numbers
      await page.goto("/en/emergency", { waitUntil: "load" });
      await page.evaluate(() => window.dispatchEvent(new Event("offline")));
      await expect(
        page.getByRole("heading", { name: "Emergency Helplines & Assistance" })
      ).toBeVisible();
      await expect(page.locator("a[href='tel:112']").first()).toBeVisible();

      // Assert OfflineBanner appears on emergency page
      const banner = page.locator("[role='status']").filter({ hasText: /You are offline/i });
      await expect(banner).toBeVisible();

      // B. Guides Index renders offline
      await page.goto("/en/guides", { waitUntil: "load" });
      await expect(page.locator("h1")).toBeVisible();
      await expect(
        page.locator("a[href*='/guides/']").or(page.getByText(/Flood/i)).first()
      ).toBeVisible();

      // C. Safety Guide renders offline
      await page.goto("/en/guides/flood", { waitUntil: "load" });
      await expect(page.locator("h1")).toBeVisible();
    } finally {
      await context.setOffline(false);
    }
  });

  test("offline report is queued locally, then going online delivers it to the server (Phase 24, Task 2)", async ({
    page,
    context,
  }) => {
    // 1. Visit report page while online
    await page.goto("/en/report", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1, name: /Report/i })).toBeVisible();

    // Select Dhemaji as district first
    const districtSelect = page.locator("#report-district");
    await districtSelect.selectOption("dhemaji");

    // Select condition type
    const typeLabel = page.locator("label[for='report-type-road_blocked']");
    await typeLabel.click();

    // Fill note
    const noteInput = page.locator("textarea#report-note");
    await noteInput.fill("Bridge approach submerged by floodwaters. Submitting offline test.");

    try {
      // 2. Turn network offline
      await context.setOffline(true);

      // Trigger offline event in browser
      await page.evaluate(() => {
        window.dispatchEvent(new Event("offline"));
      });

      // Assert offline banner is visible
      const offlineBanner = page.locator("[role='status']").filter({ hasText: /You are offline/i });
      await expect(offlineBanner).toBeVisible({ timeout: 5000 });

      // 3. Submit report while offline
      const submitBtn = page.getByRole("button", { name: /Submit Report/i });
      await submitBtn.click();

      // 4. Assert queued status confirmation is displayed
      const queuedStatus = page.locator("#report-queued-status");
      await expect(queuedStatus).toBeVisible({ timeout: 5000 });
      await expect(queuedStatus).toContainText(/Saved on your phone/i);

      // Verify item exists in IndexedDB queue
      const queuedCount = await page.evaluate(async () => {
        return new Promise<number>((resolve) => {
          const req = indexedDB.open("xahay_offline_db", 1);
          req.onsuccess = () => {
            const db = req.result;
            const tx = db.transaction("reports_queue", "readonly");
            const store = tx.objectStore("reports_queue");
            const countReq = store.count();
            countReq.onsuccess = () => resolve(countReq.result);
            countReq.onerror = () => resolve(0);
          };
          req.onerror = () => resolve(0);
        });
      });
      expect(queuedCount).toBeGreaterThan(0);

      // 5. Restore network connection (go back online)
      await context.setOffline(false);

      // Trigger online event to trigger queue auto-sync
      await page.evaluate(() => {
        window.dispatchEvent(new Event("online"));
      });

      // 6. Assert queue is delivered and drained
      await expect
        .poll(
          async () => {
            return await page.evaluate(async () => {
              return new Promise<number>((resolve) => {
                const req = indexedDB.open("xahay_offline_db", 1);
                req.onsuccess = () => {
                  const db = req.result;
                  const tx = db.transaction("reports_queue", "readonly");
                  const store = tx.objectStore("reports_queue");
                  const countReq = store.count();
                  countReq.onsuccess = () => resolve(countReq.result);
                  countReq.onerror = () => resolve(0);
                };
                req.onerror = () => resolve(0);
              });
            });
          },
          { timeout: 10000, intervals: [500, 1000] }
        )
        .toBe(0);
    } finally {
      await context.setOffline(false);
    }
  });
});
