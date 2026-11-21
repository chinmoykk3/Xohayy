import { test, expect } from "@playwright/test";

test.describe("Offline Experience (Phase 17, Section 21.5, 21.7, 21.8)", () => {
  test("visit home, wait for the service worker, go offline, reload, assert the banner, assert a guide and the emergency numbers are available", async ({
    page,
    context,
  }) => {
    // 1. Visit home while online
    await page.goto("/en", { waitUntil: "networkidle" });

    // 2. Wait for the service worker to register and become active
    await page.waitForFunction(
      async () => {
        if (!("serviceWorker" in navigator)) return false;
        const reg = await navigator.serviceWorker.getRegistration();
        return Boolean(reg && reg.active);
      },
      undefined,
      { timeout: 15000 }
    );

    // Allow precache requests to settle
    await page.waitForTimeout(1000);

    try {
      // 3. Go offline
      await context.setOffline(true);

      // 4. Reload page while offline
      await page.reload({ waitUntil: "load" });

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

    // Wait for the service worker to be active
    await page.waitForFunction(
      async () => {
        if (!("serviceWorker" in navigator)) return false;
        const reg = await navigator.serviceWorker.getRegistration();
        return Boolean(reg && reg.active);
      },
      undefined,
      { timeout: 15000 }
    );

    await page.waitForTimeout(1000);

    try {
      // 2. Disable network
      await context.setOffline(true);

      // A. Emergency Page renders offline with emergency numbers
      await page.goto("/en/emergency", { waitUntil: "load" });
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
});
