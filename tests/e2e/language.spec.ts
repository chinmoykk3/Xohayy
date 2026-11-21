import { test, expect } from "@playwright/test";

test.describe("Language Switching & Persistence End-to-End (Phase 24, Task 3 & Plan Section 26.5)", () => {
  test.beforeEach(({ page }) => {
    // Fail immediately on browser console errors or unhandled exceptions (Task 5)
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        throw new Error(`Browser console error during E2E language test: ${msg.text()}`);
      }
    });
    page.on("pageerror", (err) => {
      throw new Error(`Unhandled page error during E2E language test: ${err.message}`);
    });
  });

  test("switches between English, Assamese, and Hindi; updates headings and html lang; persists across reload", async ({
    page,
  }) => {
    // 1. Start in English
    await page.goto("/en", { waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    const langSelect = page.locator("select#language-select");
    await expect(langSelect).toBeVisible();
    await expect(langSelect).toHaveValue("en");

    // English headings and text
    await expect(page.getByText(/Choose your district/i)).toBeVisible();

    // 2. Switch to Assamese (as)
    await langSelect.selectOption("as");
    await expect(page).toHaveURL(/\/as/);
    await expect(page.locator("html")).toHaveAttribute("lang", "as-IN");

    // Assamese headings check
    await expect(page.getByText(/আপোনাৰ জিলা বাছক/i)).toBeVisible();

    // Reload and confirm Assamese language persists
    await page.reload({ waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/as/);
    await expect(page.locator("html")).toHaveAttribute("lang", "as-IN");
    await expect(page.getByText(/আপোনাৰ জিলা বাছক/i)).toBeVisible();
    await expect(page.locator("select#language-select")).toHaveValue("as");

    // 3. Switch to Hindi (hi)
    const asLangSelect = page.locator("select#language-select");
    await asLangSelect.selectOption("hi");
    await expect(page).toHaveURL(/\/hi/);
    await expect(page.locator("html")).toHaveAttribute("lang", "hi-IN");

    // Hindi headings check
    await expect(page.getByText(/अपना जिला चुनें/i)).toBeVisible();

    // Reload and confirm Hindi language persists
    await page.reload({ waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/hi/);
    await expect(page.locator("html")).toHaveAttribute("lang", "hi-IN");
    await expect(page.getByText(/अपना जिला चुनें/i)).toBeVisible();
    await expect(page.locator("select#language-select")).toHaveValue("hi");
  });

  test("navigating across routes preserves current language selection", async ({ page }) => {
    // Start on Assamese home
    await page.goto("/as", { waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveAttribute("lang", "as-IN");

    // Navigate to Alerts
    const alertsLink = page.locator("nav a[href*='/alerts']").first();
    await alertsLink.click();
    await expect(page).toHaveURL(/\/as\/alerts/);
    await expect(page.locator("html")).toHaveAttribute("lang", "as-IN");
    await expect(page.getByRole("heading", { level: 1, name: "জিলা সতৰ্কবাৰ্তা" })).toBeVisible();

    // Navigate to Guides
    const guidesLink = page.locator("nav a[href*='/guides']").first();
    await guidesLink.click();
    await expect(page).toHaveURL(/\/as\/guides/);
    await expect(page.locator("html")).toHaveAttribute("lang", "as-IN");
  });
});
