import { test, expect } from "@playwright/test";

test.describe("Layout & Accessibility Smoke Suite", () => {
  test("smoke test loads root page successfully with landmarks and skip link", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("nav[aria-label='Main Navigation']")).toBeVisible();
    await expect(page.locator("main#main-content")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
    await expect(page.locator("a[href='#main-content']")).toHaveCount(1);
  });

  test("layout reflows at 320px width without horizontal scroll", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto("/");

    // Verify main content and header fit cleanly inside viewport
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalOverflow).toBe(false);
  });
});
