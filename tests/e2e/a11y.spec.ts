import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const LOCALES = ["en", "as", "hi"] as const;

const ROUTES = [
  "",
  "/alerts",
  "/guides",
  "/guides/flood",
  "/guides/landslide",
  "/shelters",
  "/report",
  "/kit",
  "/about",
  "/emergency",
];

test.describe("WCAG 2.2 AA Accessibility Audit (Phase 21)", () => {
  for (const locale of LOCALES) {
    for (const route of ROUTES) {
      const fullPath = `/${locale}${route}`;

      test(`Axe scan on ${fullPath} has zero serious or critical violations`, async ({ page }) => {
        await page.goto(fullPath, { waitUntil: "domcontentloaded" });

        // Wait for main content to be visible
        await page.waitForSelector("#main-content", { state: "attached" });

        // Run axe accessibility scan
        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();

        // Filter for serious and critical violations
        const criticalOrSerious = accessibilityScanResults.violations.filter(
          (v) => v.impact === "serious" || v.impact === "critical"
        );

        if (criticalOrSerious.length > 0) {
          console.error(
            `Axe violations on ${fullPath}:`,
            JSON.stringify(criticalOrSerious, null, 2)
          );
        }

        expect(criticalOrSerious).toEqual([]);
      });
    }
  }

  test("Emergency button is reachable within 2-3 Tab presses from page load", async ({ page }) => {
    await page.goto("/en", { waitUntil: "domcontentloaded" });

    // Focus starts at document body, Tab through initial interactive elements
    await page.keyboard.press("Tab"); // Tab 1: Skip link
    await page.keyboard.press("Tab"); // Tab 2: Emergency FAB or first interactive

    // Evaluate currently focused element
    const focusedInfo = await page.evaluate(() => {
      const el = document.activeElement;
      return {
        id: el?.id || "",
        tagName: el?.tagName || "",
        text: el?.textContent || "",
        ariaLabel: el?.getAttribute("aria-label") || "",
      };
    });

    const isEmergency =
      focusedInfo.id === "emergency-fab" ||
      focusedInfo.text.toLowerCase().includes("emergency") ||
      focusedInfo.text.includes("112") ||
      focusedInfo.ariaLabel.toLowerCase().includes("emergency");

    expect(isEmergency).toBe(true);
  });
});
