import { test, expect } from "@playwright/test";

test.describe("Security Hardening & Headers Suite (Plan Section 24.4, 24.8)", () => {
  test("asserts strict security headers on navigation responses", async ({ request }) => {
    const response = await request.get("/en");
    expect(response.status()).toBe(200);

    const headers = response.headers();

    // 1. Content-Security-Policy
    const csp = headers["content-security-policy"];
    expect(csp).toBeDefined();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self' 'nonce-");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("object-src 'none'");

    // 2. Strict-Transport-Security
    expect(headers["strict-transport-security"]).toContain("max-age=63072000");
    expect(headers["strict-transport-security"]).toContain("includeSubDomains");

    // 3. X-Content-Type-Options
    expect(headers["x-content-type-options"]).toBe("nosniff");

    // 4. Referrer-Policy
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");

    // 5. Permissions-Policy
    const permissions = headers["permissions-policy"];
    expect(permissions).toBeDefined();
    expect(permissions).toContain("geolocation=(self)");
    expect(permissions).toContain("camera=()");
    expect(permissions).toContain("microphone=()");
    expect(permissions).toContain("payment=()");

    // 6. Cross-Origin-Opener-Policy
    expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
  });

  test("asserts strict security headers on API routes", async ({ request }) => {
    const response = await request.get("/api/alerts");
    expect(response.status()).toBe(200);

    const headers = response.headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");
    expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
  });

  test("app loads and executes client scripts with CSP enabled without console security violations", async ({
    page,
  }) => {
    const cspViolations: string[] = [];

    page.on("console", (msg) => {
      const text = msg.text();
      if (
        msg.type() === "error" &&
        (text.toLowerCase().includes("content security policy") ||
          text.toLowerCase().includes("csp") ||
          text.toLowerCase().includes("violation"))
      ) {
        cspViolations.push(text);
      }
    });

    await page.goto("/en", { waitUntil: "networkidle" });
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("main#main-content")).toBeVisible();

    expect(cspViolations).toEqual([]);
  });
});
