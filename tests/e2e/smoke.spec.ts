import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Layout & Emergency Smoke Suite", () => {
  test("smoke test loads root page and redirects to default locale with landmarks", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/en/);
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("nav[aria-label='Main Navigation']")).toBeVisible();
    await expect(page.locator("main#main-content")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
    await expect(page.locator("a[href='#main-content']")).toHaveCount(1);
  });

  test("emergency FAB is visible and opens emergency panel dialog in one tap", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });

    const fab = page.locator("#emergency-fab");
    await expect(fab).toBeVisible();

    // Click FAB to open dialog
    await fab.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Emergency Helplines & Assistance")).toBeVisible();

    // Verify 112 is present as prominent tel link
    const call112 = dialog.locator("a[href='tel:112']");
    await expect(call112).toBeVisible();

    // Run automated Axe accessibility scan on the open dialog
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include("div[role='dialog']")
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);

    // Escape closes dialog
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });

  test("header 112 button navigates to standalone emergency page", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });

    const header112 = page.locator("header a[aria-label*='112']");
    await expect(header112).toBeVisible();
    await header112.click();

    await expect(page).toHaveURL(/\/en\/emergency/);
    await expect(
      page.getByRole("heading", { name: "Emergency Helplines & Assistance" })
    ).toBeVisible();
    await expect(page.locator("main a[href='tel:112']").first()).toBeVisible();
  });

  test("allows switching language to Assamese", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });
    const select = page.locator("select#language-select");
    await expect(select).toBeVisible();

    await select.selectOption("as");
    await expect(page).toHaveURL(/\/as/);
    await expect(page.locator("html")).toHaveAttribute("lang", "as-IN");
  });

  test("allows switching language to Hindi", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });
    const select = page.locator("select#language-select");
    await expect(select).toBeVisible();

    await select.selectOption("hi");
    await expect(page).toHaveURL(/\/hi/);
    await expect(page.locator("html")).toHaveAttribute("lang", "hi-IN");
  });

  test("settings menu opens from header and adjusts text scale and contrast surviving reload", async ({
    page,
  }) => {
    await page.goto("/en", { waitUntil: "networkidle" });

    // Click settings trigger button in header
    const settingsBtn = page.getByRole("button", { name: "Settings" });
    await expect(settingsBtn).toBeVisible();
    await settingsBtn.click();

    // Verify dialog opened
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Preferences & Accessibility")).toBeVisible();

    // Toggle High Contrast
    const contrastSwitch = dialog.getByRole("switch", { name: /High Contrast/i });
    await contrastSwitch.click();
    await expect(page.locator("html")).toHaveAttribute("data-contrast", "high");

    // Select 125% Text Scale
    const scaleRadio = dialog.getByRole("radio", { name: /Large \(125%\)/i });
    await scaleRadio.click();
    await expect(page.locator("html")).toHaveAttribute("data-text-scale", "1.25");

    // Close Dialog with Escape
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();

    // Reload page to verify persistence in localStorage
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveAttribute("data-contrast", "high");
    await expect(page.locator("html")).toHaveAttribute("data-text-scale", "1.25");
  });

  test("layout reflows at 320px width without horizontal scroll across languages", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 });

    for (const locale of ["en", "as", "hi"]) {
      await page.goto(`/${locale}`);

      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalOverflow).toBe(false);
    }
  });

  test("choosing a district on the home page displays its risk summary, persists after reload, and works in all three languages", async ({
    page,
  }) => {
    await page.goto("/en", { waitUntil: "networkidle" });

    // Initial state: no district chosen prompt
    await expect(page.getByText("No district selected")).toBeVisible();

    // Select Dhemaji via combobox
    const combobox = page.getByRole("combobox");
    await expect(combobox).toBeVisible();
    await combobox.click();

    const dhemajiOption = page.getByRole("option", { name: /Dhemaji/i });
    await expect(dhemajiOption).toBeVisible();
    await dhemajiOption.click();

    // Verify Risk Summary card appeared with Dhemaji
    const riskBadge = page.locator("[data-risk-level]");
    await expect(riskBadge).toBeVisible();
    await expect(page.getByText(/Jiadhal River Overflow/i)).toBeVisible();
    await expect(page.getByText("Demo Data")).toBeVisible();

    // Reload page to verify persistence in localStorage
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.getByRole("combobox")).toHaveValue(/Dhemaji/i);
    await expect(page.getByText(/Jiadhal River Overflow/i)).toBeVisible();

    // Switch to Assamese
    await page.goto("/as", { waitUntil: "networkidle" });
    await expect(page.locator("[data-risk-level]")).toBeVisible();
    await expect(page.getByText(/জিয়াঢল নদীৰ বান সতৰ্কতা/i)).toBeVisible();

    // Switch to Hindi
    await page.goto("/hi", { waitUntil: "networkidle" });
    await expect(page.locator("[data-risk-level]")).toBeVisible();
    await expect(page.getByText(/जियाधल नदी में भीषण बाढ़ की चेतावनी/i)).toBeVisible();
  });

  test("alerts page filters by hazard and district, toggles expired alerts, and renders localized in all languages", async ({
    page,
  }) => {
    await page.goto("/en/alerts", { waitUntil: "networkidle" });

    // Verify page heading and demo notice banner
    await expect(page.getByRole("heading", { level: 1, name: "District Alerts" })).toBeVisible();
    await expect(page.getByText(/Demonstration data active/i)).toBeVisible();

    // Verify alert cards present
    const cards = page.locator("article");
    await expect(cards.first()).toBeVisible();

    // Filter by Hazard "Flood"
    const floodBtn = page.getByRole("button", { name: /^Flood$/i });
    await floodBtn.click();
    await expect(page.getByText(/Jiadhal River Overflow/i)).toBeVisible();

    // Toggle "Show Expired"
    const expiredCheckbox = page.getByLabel(/Show Expired Alerts/i);
    await expiredCheckbox.check();
    await expect(expiredCheckbox).toBeChecked();

    // Switch language to Assamese
    await page.goto("/as/alerts", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1, name: "জিলা সতৰ্কবাৰ্তা" })).toBeVisible();

    // Switch language to Hindi
    await page.goto("/hi/alerts", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1, name: "जिला आपदा अलर्ट" })).toBeVisible();
  });
});
