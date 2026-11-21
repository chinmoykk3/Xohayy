import { test, expect } from "@playwright/test";

test.describe("Layout & Accessibility Smoke Suite", () => {
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

  test("allows switching language to Assamese", async ({ page }) => {
    await page.goto("/en");
    const select = page.locator("select#language-select");
    await expect(select).toBeVisible();

    await select.selectOption("as");
    await expect(page).toHaveURL(/\/as/);
    await expect(page.locator("html")).toHaveAttribute("lang", "as-IN");
  });

  test("allows switching language to Hindi", async ({ page }) => {
    await page.goto("/en");
    const select = page.locator("select#language-select");
    await expect(select).toBeVisible();

    await select.selectOption("hi");
    await expect(page).toHaveURL(/\/hi/);
    await expect(page.locator("html")).toHaveAttribute("lang", "hi-IN");
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
});
