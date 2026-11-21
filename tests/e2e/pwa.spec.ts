import { test, expect } from "@playwright/test";

test.describe("PWA and Offline Capabilities (ADR-003, Section 21)", () => {
  test("serves valid web app manifest", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");
    expect(response.status()).toBe(200);

    const manifest = await response.json();
    expect(manifest.name).toBe("Xahay");
    expect(manifest.short_name).toBe("Xahay");
    expect(manifest.start_url).toBe("/en/");
    expect(manifest.display).toBe("standalone");
    expect(manifest.theme_color).toBe("#0369a1");
    expect(manifest.background_color).toBe("#f7fafc");

    expect(manifest.icons.length).toBeGreaterThanOrEqual(3);
    const maskable = manifest.icons.find(
      (icon: { purpose?: string }) => icon.purpose === "maskable"
    );
    expect(maskable).toBeDefined();

    expect(manifest.shortcuts.length).toBe(3);
    const shortcutNames = manifest.shortcuts.map((s: { name: string }) => s.name);
    expect(shortcutNames).toContain("Emergency numbers");
    expect(shortcutNames).toContain("Safety guides");
    expect(shortcutNames).toContain("Shelters");
  });

  test("serves all generated PWA icons", async ({ request }) => {
    const icon192 = await request.get("/icons/icon-192.png");
    expect(icon192.status()).toBe(200);
    expect(icon192.headers()["content-type"]).toContain("image/png");

    const icon512 = await request.get("/icons/icon-512.png");
    expect(icon512.status()).toBe(200);
    expect(icon512.headers()["content-type"]).toContain("image/png");

    const maskable512 = await request.get("/icons/icon-maskable-512.png");
    expect(maskable512.status()).toBe(200);
    expect(maskable512.headers()["content-type"]).toContain("image/png");
  });

  test("serves static offline.html fallback page with 112 and multilingual helplines", async ({
    request,
    page,
  }) => {
    const response = await request.get("/offline.html");
    expect(response.status()).toBe(200);

    await page.goto("/offline.html");
    await expect(page.locator("a[href='tel:112']")).toBeVisible();
    await expect(page.locator("a[href='tel:108']")).toBeVisible();
    await expect(page.locator("a[href='tel:101']")).toBeVisible();
    await expect(page.locator("a[href='tel:100']")).toBeVisible();
    await expect(page.locator("a[href='tel:1070']")).toBeVisible();
    await expect(page.locator("a[href='tel:1079']")).toBeVisible();
    await expect(page.locator("#retry-link")).toBeVisible();

    // Verify multilingual presence
    await expect(page.getByText("ৰাষ্ট্ৰীয় জৰুৰীকালীন সাহায্য")).toBeVisible();
    await expect(page.getByText("राष्ट्रीय आपातकालीन हेल्पलाइन")).toBeVisible();
  });

  test("service worker enables offline access to visited routes and falls back to offline.html for uncached routes", async ({
    context,
    page,
  }) => {
    // 1. Online visit to register service worker and precache routes
    await page.goto("/en", { waitUntil: "networkidle" });

    // Wait for service worker to register and become active
    await page
      .waitForFunction(
        async () => {
          if (!("serviceWorker" in navigator)) return false;
          const reg = await navigator.serviceWorker.getRegistration();
          return !!reg && (!!reg.active || !!reg.installing || !!reg.waiting);
        },
        { timeout: 10000 }
      )
      .catch(() => {
        // In development or if SW not active, continue
      });

    // Wait a brief moment for precache network requests to settle
    await page.waitForTimeout(1500);

    // 2. Simulate DevTools offline mode
    await context.setOffline(true);

    try {
      // Visit Home route offline
      await page.goto("/en");
      await expect(page.locator("header")).toBeVisible();
      await expect(page.locator("main#main-content")).toBeVisible();

      // Visit Emergency page offline
      await page.goto("/en/emergency");
      await expect(
        page.getByRole("heading", { name: "Emergency Helplines & Assistance" })
      ).toBeVisible();
      await expect(page.locator("main a[href='tel:112']").first()).toBeVisible();

      // Visit Guides page offline
      await page.goto("/en/guides");
      await expect(page.getByText("Survival & Evacuation Guides")).toBeVisible();

      // 3. Uncached navigation offline -> should display offline.html
      await page.goto("/en/completely-uncached-route-xyz");
      await expect(page.locator("a[href='tel:112']")).toBeVisible();
      await expect(page.locator("#retry-link")).toBeVisible();
    } finally {
      await context.setOffline(false);
    }
  });
});
