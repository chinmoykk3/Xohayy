import { test, expect } from "@playwright/test";

test.describe("Main User Journey End-to-End (Phase 24, Task 1 & Plan Section 26.5)", () => {
  test.beforeEach(({ page }) => {
    // Fail immediately on browser console errors or unhandled exceptions (Task 5)
    page.on("console", (msg) => {
      const text = msg.text();
      const loc = msg.location();
      // eslint-disable-next-line no-console
      console.log(`[DEBUG CONSOLE ${msg.type()}]:`, text, loc);
      if (msg.type() === "error") {
        if (text.includes("_next/hmr") || text.includes("ERR_CONNECTION_REFUSED")) {
          return;
        }
        throw new Error(`Browser console error during E2E run: ${text} at ${JSON.stringify(loc)}`);
      }
    });
    page.on("pageerror", (err) => {
      throw new Error(`Unhandled page error during E2E run: ${err.message}`);
    });
  });

  test("completes the complete core lifecycle: district prompt -> select district -> alerts -> emergency 112 -> safety guide progress -> shelters -> ground report submission", async ({
    page,
  }) => {
    // 1. Home shows the district prompt & monitoring basin
    await page.goto("/en", { waitUntil: "networkidle" });
    const combobox = page.locator("#district-combobox-input");
    await expect(combobox).toBeVisible();
    await expect(page.getByText(/ACTIVE MONITORING BASIN/i)).toBeVisible();

    // 2. Select a district and see the risk card
    await combobox.click();
    const dhemajiOption = page.getByRole("option", { name: /Dhemaji/i }).first();
    await expect(dhemajiOption).toBeVisible();
    await dhemajiOption.click();

    // Verify Risk Summary card appeared with Dhemaji risk details
    await expect(page.getByText(/Dhemaji District/i).first()).toBeVisible();
    await expect(page.getByText(/River Overflow|Critical Evacuation|Watch/i).first()).toBeVisible();

    // 3. Open Alerts and see at least one alert
    const alertsNav = page.locator("nav a[href*='/alerts']").first();
    await alertsNav.click();
    await expect(page).toHaveURL(/\/en\/alerts/);
    await expect(page.getByRole("heading", { level: 1, name: "District Alerts" })).toBeVisible();
    const alertCard = page.locator("article").first();
    await expect(alertCard).toBeVisible();

    // 4. Open the emergency panel and see 112
    const emergencyFab = page.locator("#emergency-fab");
    await expect(emergencyFab).toBeVisible();
    await emergencyFab.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Emergency Helplines & Assistance")).toBeVisible();
    const call112 = dialog.locator("a[href='tel:112']");
    await expect(call112).toBeVisible();

    // Close emergency panel with Escape
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();

    // 5. Open a guide and mark a step as read
    const guidesNav = page.locator("nav a[href*='/guides']").first();
    await guidesNav.click();
    await expect(page).toHaveURL(/\/en\/guides/);

    const floodGuideLink = page.locator("a[href*='/guides/flood']").first();
    await floodGuideLink.click();
    await expect(page).toHaveURL(/\/en\/guides\/flood/);

    // Mark step 1 read
    const stepCheckbox = page.locator("input[type='checkbox']").first();
    await expect(stepCheckbox).toBeVisible();
    await stepCheckbox.check();
    await expect(stepCheckbox).toBeChecked();
    // Progress counter reflects completed step
    await expect(page.getByText(/1 of \d+ steps completed/i).first()).toBeVisible();

    // 6. Open Shelters and see a list for the district
    const sheltersNav = page.locator("nav a[href*='/shelters']").first();
    await sheltersNav.click();
    await expect(page).toHaveURL(/\/en\/shelters/);
    await expect(page.getByRole("heading", { level: 1, name: /Shelters/i })).toBeVisible();
    // Verify facility cards are listed
    const facilityCard = page.locator("article").first();
    await expect(facilityCard).toBeVisible();
    await expect(facilityCard.getByText(/Sample Relief Camp|Hospital/i)).toBeVisible();

    // 7. Submit a valid report and see the review confirmation
    const reportNav = page.locator("nav a[href*='/report']").first();
    await reportNav.click();
    await expect(page).toHaveURL(/\/en\/report/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Report Hazard Condition" })
    ).toBeVisible();

    // Select condition type
    const roadBlockedLabel = page.locator("label[for='report-type-road_blocked']");
    await roadBlockedLabel.click();

    // Fill note
    const noteInput = page.locator("textarea#report-note");
    await noteInput.fill("Severe road waterlogging near bridge. Vehicles unable to cross safely.");

    // Submit report
    const submitBtn = page.getByRole("button", { name: /Submit Report/i });
    await submitBtn.click();

    // Verify confirmation explaining review
    const confirmation = page
      .locator("[role='status']")
      .filter({ hasText: /Report received|moderated/i });
    await expect(confirmation).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByText(/reviewed by officials|moderated by authorized staff/i)
    ).toBeVisible();
  });
});
