import { test, expect } from "@playwright/test";

test("smoke test loads root page successfully", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
});
